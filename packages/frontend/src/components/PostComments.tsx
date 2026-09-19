import Giscus from '@giscus/react';
import { useAtomValue } from 'jotai';

import themeAtom from '@@frontend/atoms/theme';
import { styled } from '@@frontend/utils';

interface PostCommentsProps {
  slug: string;
}

const GiscusComments = ({ slug }: PostCommentsProps) => {
  const themeKind = useAtomValue(themeAtom);

  return (
    <Giscus
      repo="futursolo/furtherland"
      repoId="MDEwOlJlcG9zaXRvcnkzMzExMDIzOQ=="
      category="Post Comments"
      categoryId="DIC_kwDOAfk4384DEdL-"
      mapping="specific"
      term={`slug:${slug}`}
      strict="1"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={themeKind}
      lang="en"
    />
  );
};

const Layout = styled('section')({
  boxSizing: 'border-box',
  width: '100%',
  marginTop: '3rem',
});

const PostComments = ({ slug }: PostCommentsProps) => {
  return (
    <Layout>
      <GiscusComments slug={slug} />
    </Layout>
  );
};

export default PostComments;
