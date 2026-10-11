/// <reference types="@jsquash/jxl/emscripten-types" />
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import jxlEncoderFactory from '@jsquash/jxl/codec/enc/jxl_enc.js';
import { defaultOptions as jxlDefaultOptions } from '@jsquash/jxl/meta.js';
import { initEmscriptenModule } from '@jsquash/jxl/utils.js';
import sharp, { type Metadata } from 'sharp';
import { normalizePath, type Plugin } from 'vite';

export interface MultiviewImageOptions {
  /**
   * The import query (without the leading `?`) that triggers the loader, e.g.
   * `import MultiviewImage from './photo.png?multiview'`.
   *
   * @default 'multiview'
   */
  query?: string;
  /**
   * The encoding quality (0-100) used for the generated lossy formats. Can be
   * overridden per import with a `quality` query param.
   *
   * @default 80
   */
  quality?: number;
  /**
   * The encoding effort (1-9) of the generated JXL variant. Lower values are
   * faster and produce slightly larger files.
   *
   * @default 4
   */
  effort?: number;
  /**
   * Where the generated images are cached. Relative paths are resolved from
   * the Vite root. Files are keyed by the SHA-256 of the source image's
   * content, so the cache survives restarts and stale entries are
   * garbage-collected on use.
   *
   * @default 'node_modules/.image-opt-cache'
   */
  cacheDir?: string;
}

export interface MultiviewFormat {
  /** The output file extension, without the leading dot. */
  ext: string;
  /** The `type` attribute of the generated `<source>` element. */
  mime: string;
}

/**
 * The formats generated for every matched import, in the order they appear in
 * the emitted `<picture>`. The last format is used as the `<img>` fallback.
 */
export const MULTIVIEW_FORMATS: readonly MultiviewFormat[] = [
  { ext: 'jxl', mime: 'image/jxl' },
  { ext: 'avif', mime: 'image/avif' },
  { ext: 'webp', mime: 'image/webp' },
  { ext: 'jpg', mime: 'image/jpeg' },
];

const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'webp',
  'avif',
  'gif',
  'bmp',
  'tif',
  'tiff',
  'jxl',
  'heic',
  'heif',
  'ico',
  'svg',
]);

const VIRTUAL_PREFIX = '\0@furtherland/vite-plugins:multiview:';

const isJpeg = (ext: string): boolean => ext === 'jpg' || ext === 'jpeg';

type SharpInstance = ReturnType<typeof sharp>;

/**
 * The sharp output writers for the non-JXL formats. JXL is handled
 * separately because sharp's prebuilt binaries do not ship a JXL encoder.
 */
const SHARP_WRITERS: Record<string, (image: SharpInstance, quality: number) => SharpInstance> = {
  avif: (image, quality) => image.avif({ quality }),
  webp: (image, quality) => image.webp({ quality }),
  jpg: (image, quality) => image.jpeg({ quality }),
};

const hash = (input: string): string => createHash('sha1').update(input).digest('hex').slice(0, 10);

const clampQuality = (value: number): number => Math.min(100, Math.max(0, Math.round(value)));

type JxlModule = Awaited<ReturnType<typeof jxlEncoderFactory>>;

let jxlModulePromise: Promise<JxlModule> | null = null;

/**
 * Initializes the WASM JXL encoder. The encoder's Emscripten glue only loads
 * its `.wasm` binary through the web fetch path, so the binary is compiled
 * ahead of time and handed to the module factory instead.
 */
const getJxlModule = (): Promise<JxlModule> => {
  jxlModulePromise ??= (async () => {
    const require = createRequire(import.meta.url);
    const encoderPath = require.resolve('@jsquash/jxl/codec/enc/jxl_enc.js');
    const wasmBytes = await readFile(path.join(path.dirname(encoderPath), 'jxl_enc.wasm'));
    return initEmscriptenModule(jxlEncoderFactory, await WebAssembly.compile(wasmBytes));
  })();
  return jxlModulePromise;
};

const encodeJxl = async (
  sourceBuffer: Buffer,
  quality: number,
  effort: number,
): Promise<Buffer> => {
  const { data, info } = await sharp(sourceBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const module = await getJxlModule();
  const encoded = module.encode(data, info.width, info.height, {
    ...jxlDefaultOptions,
    quality,
    effort,
  });
  if (!encoded) {
    throw new Error('[@furtherland/vite-plugins] the JXL encoder failed to produce an output');
  }
  return Buffer.from(encoded);
};

interface GeneratedSource {
  ext: string;
  mime: string;
  url: string;
}

const generateModule = (
  sources: readonly GeneratedSource[],
  info: { name: string; width?: number; height?: number },
): string => {
  const fallbackIndex = sources.length - 1;
  const sourceElements = sources
    .slice(0, fallbackIndex)
    .map(
      (source, index) =>
        `      _jsx('source', { srcSet: __multiview${index}, type: '${source.mime}' }),`,
    );
  const imgAttributes = [
    info.width != null ? `width: rest.width ?? ${info.width}` : null,
    info.height != null ? `height: rest.height ?? ${info.height}` : null,
    `src: __multiview${fallbackIndex}`,
  ]
    .filter((attribute): attribute is string => attribute != null)
    .join(', ');

  return [
    "import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';",
    '',
    ...sources.map((source, index) => `import __multiview${index} from '${source.url}';`),
    '',
    ...sources.map((source, index) => `export const ${source.ext} = __multiview${index};`),
    '',
    'const MultiviewImage = (props) => {',
    "  const { ImgComponent: MultiviewImg = 'img', ...rest } = props ?? {};",
    "  return _jsxs('picture', {",
    '    children: [',
    ...sourceElements,
    `      _jsx(MultiviewImg, { ...rest, ${imgAttributes} }),`,
    '    ],',
    '  });',
    '};',
    '',
    `MultiviewImage.displayName = 'MultiviewImage(${info.name})';`,
    '',
    'export default MultiviewImage;',
    '',
  ].join('\n');
};

/**
 * A Vite plugin that turns `import X from './image.png?multiview'` into a
 * React component that renders a `<picture>` element with a `<source>` for
 * every generated format and a fallback `<img>`.
 *
 * Regardless of the source format, the loader generates JXL, AVIF and WebP
 * variants plus a JPEG fallback (reused as-is when the source is already
 * JPEG). The generated files are written to a cache directory (by default
 * `<root>/node_modules/.image-opt-cache`), keyed by the SHA-256 of the
 * source image's content, and served by Vite's regular asset pipeline in
 * both dev and build.
 *
 * The module's default export is the component. The URL of each format is
 * also available as a named export (`jxl`, `avif`, `webp`, `jpg`). The
 * component accepts an `ImgComponent` prop to replace the fallback `<img>`
 * element (e.g. with a styled component).
 */
export const MultiviewImagePlugin = (userOptions: MultiviewImageOptions = {}): Plugin => {
  const {
    query = 'multiview',
    quality: defaultQuality = 80,
    effort = 4,
    cacheDir: userCacheDir = 'node_modules/.image-opt-cache',
  } = userOptions;

  let cacheDir = '';
  const cache = new Map<string, { statKey: string; code: string }>();

  return {
    name: '@furtherland/vite-plugins:multiview',
    enforce: 'pre',

    configResolved(config) {
      cacheDir = path.resolve(config.root, userCacheDir);
    },

    async resolveId(source, importer) {
      const queryIndex = source.indexOf('?');
      if (queryIndex === -1) return null;

      const search = source.slice(queryIndex);
      if (!new URLSearchParams(search.slice(1)).has(query)) return null;

      const resolved = await this.resolve(source.slice(0, queryIndex), importer);
      if (!resolved) return null;

      const resolvedPath = resolved.id.split('?')[0];
      const extension = path.extname(resolvedPath).slice(1).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(extension)) return null;

      const info = await stat(resolvedPath).catch(() => null);
      if (!info?.isFile()) return null;

      return VIRTUAL_PREFIX + resolvedPath + search;
    },

    async load(id) {
      if (!id.startsWith(VIRTUAL_PREFIX)) return null;
      if (this.environment.mode === 'scan') return null;

      const searchIndex = id.indexOf('?');
      const sourcePath = id.slice(
        VIRTUAL_PREFIX.length,
        searchIndex === -1 ? undefined : searchIndex,
      );
      const qualityParam =
        searchIndex !== -1 ? new URLSearchParams(id.slice(searchIndex + 1)).get('quality') : null;
      const parsedQuality = qualityParam == null ? null : Number(qualityParam);
      const quality = clampQuality(
        parsedQuality == null || Number.isNaN(parsedQuality) ? defaultQuality : parsedQuality,
      );

      const info = await stat(sourcePath);
      const statKey = `${info.mtimeMs}:${info.size}`;

      // Fast path: the source file is unchanged since the last load in this
      // process, so its SHA-256 (and the generated code) cannot have changed.
      const cached = cache.get(id);
      if (cached?.statKey === statKey) return cached.code;

      this.addWatchFile(sourcePath);

      let sourceBuffer: Buffer;
      let metadata: Metadata;
      try {
        sourceBuffer = await readFile(sourcePath);
        metadata = await sharp(sourceBuffer).metadata();
      } catch (cause) {
        throw new Error(
          `[@furtherland/vite-plugins] failed to read '${sourcePath}' as an image: ${cause instanceof Error ? cause.message : String(cause)}`,
        );
      }

      // Cache identity is the SHA-256 of the source image's content, so it
      // is stable across machines and independent of the file's location,
      // timestamp or name.
      const contentSha256 = createHash('sha256').update(sourceBuffer).digest('hex');
      const key = hash(`${contentSha256}:${quality}:${effort}`);

      const sourceExtension = path.extname(sourcePath).slice(1).toLowerCase();
      const baseName = path.basename(sourcePath, path.extname(sourcePath));

      const cachePaths = MULTIVIEW_FORMATS.map((format) =>
        path.join(cacheDir, `${baseName}-${key}.${format.ext}`),
      );
      const currentFiles = cachePaths.map((cachePath) => path.basename(cachePath));
      const missing = (
        await Promise.all(
          cachePaths.map(async (cachePath) => (await stat(cachePath).catch(() => null)) == null),
        )
      ).some((isMissing) => isMissing);

      if (missing) {
        await mkdir(cacheDir, { recursive: true });

        for (const [index, format] of MULTIVIEW_FORMATS.entries()) {
          if ((await stat(cachePaths[index]).catch(() => null)) != null) continue;

          const sameFormat =
            sourceExtension === format.ext || (isJpeg(sourceExtension) && isJpeg(format.ext));
          let buffer: Buffer;
          if (sameFormat) {
            buffer = sourceBuffer;
          } else if (format.ext === 'jxl') {
            buffer = await encodeJxl(sourceBuffer, quality, effort);
          } else {
            buffer = await SHARP_WRITERS[format.ext](sharp(sourceBuffer), quality).toBuffer();
          }
          await writeFile(cachePaths[index], buffer);
        }

        // Remove cache files left over from earlier versions of this source.
        const stale = await readdir(cacheDir).catch(() => []);
        for (const name of stale) {
          if (name.startsWith(`${baseName}-`) && !currentFiles.includes(name)) {
            await unlink(path.join(cacheDir, name)).catch(() => null);
          }
        }
      }

      const sources: GeneratedSource[] = MULTIVIEW_FORMATS.map((format, index) => ({
        ext: format.ext,
        mime: format.mime,
        url: normalizePath(cachePaths[index]),
      }));

      const code = generateModule(sources, {
        name: path.basename(sourcePath),
        width: metadata.width,
        height: metadata.height,
      });
      cache.set(id, { statKey, code });
      return code;
    },
  };
};
