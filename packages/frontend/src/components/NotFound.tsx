import Box from '@@frontend/components/Box';
import { styled } from '@@frontend/utils';

const NotFoundLayout = styled(Box)({
  flexDirection: 'row',
  flexGrow: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

const NotFoundMessage = styled(Box)({
  fontSize: '2rem',
  fontWeight: 'bold',
});

const NotFound = () => (
  <NotFoundLayout>
    <NotFoundMessage>Oops! 404 - Page Not Found Error!</NotFoundMessage>
  </NotFoundLayout>
);

export default NotFound;
