import type { Theme as ActualTheme } from './providers/theme';

declare module '@emotion/react' {
  export interface Theme extends ActualTheme {}
}
