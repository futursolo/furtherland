import type { Theme as ActualTheme } from '@@common/providers/theme';

declare module '@emotion/react' {
  export interface Theme extends ActualTheme {}
}
