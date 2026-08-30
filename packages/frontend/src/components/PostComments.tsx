import Giscus from '@giscus/react';
import { useStore } from '@nanostores/react';

import themeAtom from '@@frontend/atoms/theme';
import ClientOnly from '@@frontend/components/ClientOnly';
import { styled } from '@@frontend/utils';

interface PostCommentsProps {
  slug: string;
}

const Comments = styled('section')({
  boxSizing: 'border-box',
  width: '100%',
  marginTop: '3rem',
});

const GiscusComments = ({ slug }: PostCommentsProps) => {
  const themeKind = useStore(themeAtom);

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

const PostComments = ({ slug }: PostCommentsProps) => {
  return (
    <Comments>
      <ClientOnly>
        <GiscusComments slug={slug} />
      </ClientOnly>
    </Comments>
  );
};

export default PostComments;
