import type { Theme as ActualTheme } from '@@frontend-v5/providers/theme';

declare module '@emotion/react' {
  export interface Theme extends ActualTheme {}
}
