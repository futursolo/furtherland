import Box from '@@frontend/components/Box';
import { styled } from '@@frontend/utils';

// This is the bare content only — no site chrome. It is used in two
// places, both of which render inside the root `RootShell` (which supplies the
// `Root` Header + Footer chrome): the dedicated `/404` route, and the root
// `notFoundComponent` (rendered inside `RootShell`'s `<Outlet />`).
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
