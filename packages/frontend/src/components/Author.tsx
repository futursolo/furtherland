import { styled } from '@@frontend/utils';

import Box from './Box';

const MY_AVATAR_URL = 'https://www.gravatar.com/avatar/0dd494a963ae648caebe34288b664ca6?s=200';

interface AuthorProps {
  date: string;
  isDraft: boolean;
}

const AuthorLayout = styled(Box)({
  display: 'flex',
  width: '100%',
  paddingBottom: 10,

  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
});
const AuthorImage = styled(Box)({
  backgroundImage: `url(${MY_AVATAR_URL})`,
  height: 50,
  width: 50,
  borderRadius: 50,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
});

const AuthorRightLayout = styled(Box)({
  display: 'flex',
  height: 50,
  paddingBottom: '10px',

  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'space-around',
  paddingLeft: 10,
  paddingRight: 10,
});
const AuthorName = styled(Box)(({ theme }) => ({
  fontSize: theme.fontSize.default,
  color: theme.fontColour.primary.cssVar,
}));
const AuthoredDate = styled(Box)(({ theme }) => ({
  fontSize: theme.fontSize.secondary,
  color: theme.fontColour.secondary.cssVar,
}));

const Author = (props: AuthorProps) => {
  const { date, isDraft } = props;

  return (
    <AuthorLayout>
      <AuthorImage />
      <AuthorRightLayout>
        <AuthorName>Kaede Hoshikawa</AuthorName>
        <AuthoredDate>
          {date}
          {isDraft ? ' (Draft)' : ''}
        </AuthoredDate>
      </AuthorRightLayout>
    </AuthorLayout>
  );
};

export default Author;
