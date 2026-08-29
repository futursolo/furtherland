/* eslint-disable no-underscore-dangle */

import { type PropsWithChildren, useEffect } from 'react';

import { ThemeProvider as BaseProvider } from '@emotion/react';
import { useStore } from '@nanostores/react';
import { useMediaQuery } from 'usehooks-ts';

import themeAtom, { getThemeKind } from '@@frontend/atoms/theme';

const createColour = (name: string, lightValue: string, darkValue: string) => {
  return {
    _varName: `--fl-theme-${name}`,
    cssVar: `var(--fl-theme-${name})`,
    lightValue,
    darkValue,
  };
};

type Colour = ReturnType<typeof createColour>;

const createBreakpoint = (width: number) => {
  return {
    width,
    asPx: () => `${width}px`,
    down: () => `(max-width: ${width}px)`,
    mediaDown: () => `@media screen and (max-width: ${width}px)`,
    up: () => `(min-width: ${width}px)`,
    mediaUp: () => `@media screen and (min-width: ${width}px)`,
    // matchesDown: () => {} // TODO
  } as const;
};

const breakpoints = {
  lg: createBreakpoint(1280),
  md: createBreakpoint(960),
  sm: createBreakpoint(500),
} as const;

const fontSizes = {
  root: '15px',
  default: '1rem',
  secondary: '0.9rem',
  hint: '0.8rem',
} as const;

const fontColours = {
  primary: createColour('font-colour-primary', 'rgb(0, 0, 0)', 'rgb(225, 225, 225)'),
  secondary: createColour('font-colour-secondary', 'rgb(100, 100, 100)', 'rgb(150, 150, 150)'),
  hint: createColour('font-colour-hint', 'rgb(150, 150, 150)', 'rgb(100, 100, 100)'),
};

const mainColours = {
  primary: createColour('main-colour-primary', 'rgb(92, 184, 230)', 'rgb(92, 184, 230)'),
  primaryHover: createColour(
    'main-colour-primary-hover',
    'rgb(125, 198, 235)',
    'rgb(125, 198, 235)',
  ),
  secondary: createColour('main-colour-secondary', 'rgb(244, 245, 249)', 'rgb(50, 50, 50)'),
  secondaryHover: createColour(
    'main-colour-secondary-hover',
    'rgb(221, 224, 238)',
    'rgb(75, 75, 75)',
  ),
  invalid: createColour('main-colour-invalid', 'rgb(238, 82, 26)', 'rgb(238, 82, 26)'),
} as const;

const backgroundColours = {
  invalid: createColour('background-colour-invalid', 'rgb(254, 237, 234)', 'rgb(73, 38, 32)'),
  default: createColour('background-colour-default', 'rgb(255, 255, 255)', 'rgb(20, 20, 20)'),
  component: createColour('background-colour-component', 'rgb(244, 245, 249)', 'rgb(50, 50, 50)'),
  componentShadow: createColour(
    'background-colour-component-shadow',
    'rgb(150, 150, 150)',
    'rgb(35, 35, 35)',
  ),
  code: createColour('background-colour-code', 'rgb(246, 248, 255)', 'rgb(41, 48, 66)'),
  header: createColour('background-colour-header', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.5)'),
} as const;

const theme = {
  fontFamily: `system-ui, -apple-system, 'Segoe UI', Roboto, Noto Sans,
               sans-serif, BlinkMacSystemFont, sans-serif,
               "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
  breakpoint: breakpoints,
  fontSize: fontSizes,
  fontColour: fontColours,
  colour: { ...mainColours, background: backgroundColours },
} as const;

export type Theme = typeof theme;

const createCssVars = (colours: Colour[], f: (c: Colour) => string) => {
  const cssVars: Record<string, string> = {};

  for (const colour of colours) {
    cssVars[colour._varName] = f(colour);
  }

  return cssVars;
};

const coloursToVars = [
  ...Object.values(fontColours),
  ...Object.values(backgroundColours),
  ...Object.values(mainColours),
];
const lightThemeCssVars = createCssVars(coloursToVars, (m) => m.lightValue);
const darkThemeCssVars = createCssVars(coloursToVars, (m) => m.darkValue);

const globalCssVars = {
  html: lightThemeCssVars,
  "html[data-theme='light']": lightThemeCssVars,
  "html[data-theme='dark']": darkThemeCssVars,
} as const;

export const globalStyles = {
  ...globalCssVars,
  'html, body': {
    margin: '0',
    padding: '0',
    width: '100%',
    height: '100%',
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSize.root,

    minHeight: '100vh',
    backgroundColor: theme.colour.background.default.cssVar,
    color: theme.fontColour.primary.cssVar,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    transition: 'background-color 0.3s, color 0.3s',
  },
};

const ThemeProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const prefersDarkTheme = useMediaQuery('(prefers-color-scheme: dark)');
  const themeKind = useStore(themeAtom);

  // biome-ignore lint/correctness/useExhaustiveDependencies: getThemeKind is a stable function, no need to include it in deps
  useEffect(() => {
    themeAtom.set(getThemeKind());
  }, [prefersDarkTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeKind);
  }, [themeKind]);

  return (
    <BaseProvider theme={theme}>
      {/* <Global styles={globalStyles} /> */}
      {children}
    </BaseProvider>
  );
};

export default ThemeProvider;
