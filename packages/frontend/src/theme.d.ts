import type { Theme as ActualTheme } from '@@frontend/providers/theme';

declare module '@emotion/react' {
  export interface Theme extends ActualTheme {}
}
