import type { ComponentType } from 'react';

export type MdxComponent = ComponentType<{
  components?: Record<string, unknown>;
}>;

export type MdxModule = {
  default: MdxComponent;
  frontmatter?: Record<string, unknown>;
};
