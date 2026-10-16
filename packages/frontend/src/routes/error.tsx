import { Helmet } from '@modern-js/runtime/head';
import { isRouteErrorResponse, useRouteError } from '@modern-js/runtime/router';

import NotFound from '@@frontend/components/NotFound';
import RootLayout from '@@frontend/components/RootLayout';
import metaToTags from '@@frontend/utils/helmet';
import { notFoundMeta } from '@@frontend/utils/meta';

const ErrorBoundary = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <>
        <Helmet>{metaToTags(notFoundMeta())}</Helmet>
        <RootLayout headerKind="default">
          <NotFound />
        </RootLayout>
      </>
    );
  }

  return (
    <main style={{ maxWidth: '60ch', margin: '0 auto', padding: '2rem' }}>
      <h1>Something went wrong</h1>
      {error instanceof Error && <pre style={{ whiteSpace: 'pre-wrap' }}>{error.message}</pre>}
    </main>
  );
};

export default ErrorBoundary;
