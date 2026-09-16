import { SITE_NAME } from '@@frontend-v5/constants/site';

const formatTitle = (title: string) => {
  if (title) {
    return `${title} - ${SITE_NAME}`;
  }

  return title;
};

export default formatTitle;
