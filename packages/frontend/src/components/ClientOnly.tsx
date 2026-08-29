import { type PropsWithChildren, useEffect, useState } from 'react';

const ClientOnly = (props: PropsWithChildren) => {
  const { children } = props;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  if (!isClient) {
    return null;
  }

  return children;
};

export default ClientOnly;
