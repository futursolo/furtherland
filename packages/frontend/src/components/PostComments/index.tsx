import Giscus from '@giscus/react';
import { useStore } from '@nanostores/react';

import themeAtom from '@@frontend/atoms/theme';
import ClientOnly from '@@frontend/components/ClientOnly';

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
// than Emotion. The `Giscus` iframe is deferred behind `ClientOnly`.
const PostComments = ({ slug }: PostCommentsProps) => {
  return (
    <section className={Styles.comments}>
      <ClientOnly>
        <GiscusComments slug={slug} />
      </ClientOnly>
    </section>
  );
};

export default PostComments;
