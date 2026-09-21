import 'rehype-github-alerts/styling/css/index.css';
import type { PropsWithChildren } from 'react';

import { MDXProvider } from '@mdx-js/react';

import { mdxComponents } from '@@frontend/elements';

const Provider = (props: PropsWithChildren) => {
  const { children } = props;
  return <MDXProvider components={mdxComponents}>{children}</MDXProvider>;
};

export default Provider;
