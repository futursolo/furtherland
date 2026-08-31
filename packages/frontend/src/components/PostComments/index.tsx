import Giscus from '@giscus/react';
import { useStore } from '@nanostores/react';
import { useIntersectionObserver } from 'usehooks-ts';

import themeAtom from '@@frontend/atoms/theme';

import Styles from './PostComments.module.scss';

interface PostCommentsProps {
  slug: string;
}

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

// Post comments wrapper. Styled with SCSS (`./PostComments.module.scss`) rather
// than Emotion. The `Giscus` iframe is deferred until the section is scrolled
// into view (via `useIntersectionObserver`).
const PostComments = ({ slug }: PostCommentsProps) => {
  const { ref, isIntersecting } = useIntersectionObserver({ freezeOnceVisible: true });

  return (
    <section ref={ref} className={Styles.comments}>
      {isIntersecting ? <GiscusComments slug={slug} /> : null}
    </section>
  );
};

export default PostComments;
