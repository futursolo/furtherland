/// <reference types="@jsquash/jxl/emscripten-types" />
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jxlEncode, { init as jxlInit } from '@jsquash/jxl/encode.js';
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
   * Source images smaller than this size (in bytes) are never degraded: the
   * generated variants are encoded losslessly (JXL in lossless mode) and the
   * fallback is the original file itself.
   *
   * @default 256 * 1024
   */
  losslessBelow?: number;
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

interface SharpWriteOptions {
  quality?: number;
  lossless?: boolean;
}

/**
 * The sharp output writers for the non-JXL formats. JXL is handled
 * separately because sharp's prebuilt binaries do not ship a JXL encoder.
 */
const SHARP_WRITERS: Record<
  string,
  (image: SharpInstance, options: SharpWriteOptions) => SharpInstance
> = {
  avif: (image, options) =>
    options.lossless ? image.avif({ lossless: true }) : image.avif({ quality: options.quality }),
  webp: (image, options) =>
    options.lossless ? image.webp({ lossless: true }) : image.webp({ quality: options.quality }),
  jpg: (image, options) => image.jpeg({ quality: options.quality }),
};

const hash = (input: string): string => createHash('sha1').update(input).digest('hex').slice(0, 10);

const clampQuality = (value: number): number => Math.min(100, Math.max(0, Math.round(value)));

let jxlModulePromise: Promise<void> | null = null;

/**
 * Initialises the WASM JXL encoder via the manual initialisation path
 * documented in the @jsquash/jxl README. The library's automatic
 * initialisation fetches its `.wasm` binary over the network, which does not
 * work in Node, so the binary is compiled ahead of time and handed to `init`.
 */
const getJxlModule = (): Promise<void> => {
  jxlModulePromise ??= (async () => {
    const wasmPath = fileURLToPath(
      new URL(import.meta.resolve('@jsquash/jxl/codec/enc/jxl_enc.wasm')),
    );
    const wasmBytes = await readFile(wasmPath);
    // `init` accepts a compiled WebAssembly.Module as its first argument (see
    // the README), although its type declaration only covers the
    // options-object overload.
    const wasmModule = await WebAssembly.compile(wasmBytes);
    await jxlInit(wasmModule as unknown as Parameters<typeof jxlInit>[0]);
  })();
  return jxlModulePromise;
};

const encodeJxl = async (
  sourceBuffer: Buffer,
  options: { quality: number; effort: number; lossless: boolean },
): Promise<Buffer> => {
  const { data, info } = await sharp(sourceBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  await getJxlModule();
  // The wrapper fills in the remaining encoder options from its own defaults
  // and requires quality 100 (and ignores it) in lossless mode.
  const encoded = await jxlEncode(
    {
      data: new Uint8ClampedArray(data),
      width: info.width,
      height: info.height,
      colorSpace: 'srgb',
    },
    {
      quality: options.lossless ? 100 : options.quality,
      effort: options.effort,
      lossless: options.lossless,
    },
  );
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
 *
 * Source images smaller than `losslessBelow` are never degraded: the
 * variants are encoded losslessly (JXL in lossless mode) and the fallback
 * is the original file itself.
 */
export const multiviewImagePlugin = (userOptions: MultiviewImageOptions = {}): Plugin => {
  const {
    query = 'multiview',
    quality: defaultQuality = 80,
    effort = 4,
    losslessBelow = 256 * 1024,
    cacheDir: userCacheDir = 'node_modules/.image-opt-cache',
  } = userOptions;

  let cacheDir = '';
  const cache = new Map<string, { statKey: string; code: string }>();
  const inflight = new Map<string, Promise<string>>();

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

      // Concurrent loads of the same module (e.g. Vite's pre-transform racing
      // a real request) share a single conversion.
      const pending = inflight.get(id);
      if (pending) return pending;

      const result = (async () => {
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

        // Small images are never degraded: the variants are encoded
        // losslessly and the fallback is the original file itself.
        const lossless = info.size < losslessBelow;

        // Cache identity is the SHA-256 of the source image's content, so it
        // is stable across machines and independent of the file's location,
        // timestamp or name.
        const contentSha256 = createHash('sha256').update(sourceBuffer).digest('hex');
        const key = hash(
          `${contentSha256}:${quality}:${effort}:${lossless ? 'lossless' : 'lossy'}`,
        );

        const sourceExtension = path.extname(sourcePath).slice(1).toLowerCase();
        const baseName = path.basename(sourcePath, path.extname(sourcePath));
        // Names cache files per source file so that same-named sources in
        // different directories never collide (or garbage-collect each other).
        const sourceHash = hash(sourcePath).slice(0, 8);

        const cachePaths = MULTIVIEW_FORMATS.map((format) =>
          path.join(cacheDir, `${baseName}-${sourceHash}-${key}.${format.ext}`),
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
            } else if (lossless) {
              // Never degrade a small image: encode losslessly, and keep the
              // original file as the fallback.
              buffer =
                format.ext === 'jxl'
                  ? await encodeJxl(sourceBuffer, { quality, effort, lossless: true })
                  : format.ext === 'jpg'
                    ? sourceBuffer
                    : await SHARP_WRITERS[format.ext](sharp(sourceBuffer), {
                        lossless: true,
                      }).toBuffer();
            } else if (format.ext === 'jxl') {
              buffer = await encodeJxl(sourceBuffer, { quality, effort, lossless: false });
            } else {
              buffer = await SHARP_WRITERS[format.ext](sharp(sourceBuffer), { quality }).toBuffer();
            }
            await writeFile(cachePaths[index], buffer);
          }

          // Remove cache files left over from earlier versions of this source.
          const stalePrefix = `${baseName}-${sourceHash}-`;
          const stale = await readdir(cacheDir).catch(() => []);
          for (const name of stale) {
            if (name.startsWith(stalePrefix) && !currentFiles.includes(name)) {
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
      })();
      inflight.set(id, result);
      try {
        return await result;
      } finally {
        inflight.delete(id);
      }
    },
  };
};
