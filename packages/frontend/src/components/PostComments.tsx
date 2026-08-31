import { useState } from 'react';

import Giscus from '@giscus/react';
import { useStore } from '@nanostores/react';
import { useIntersectionObserver } from 'usehooks-ts';

import themeAtom from '@@frontend/atoms/theme';
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
  const [wasVisible, setWasVisible] = useState(false);

  const { ref } = useIntersectionObserver({
    onChange: (isIntersecting) => {
      if (isIntersecting) {
        setWasVisible(true);
      }
    },
  });

  return <Comments ref={ref}>{wasVisible ? <GiscusComments slug={slug} /> : null}</Comments>;
};

export default PostComments;
