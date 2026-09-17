import Box from '@@frontend-v5/components/Box';
import { styled } from '@@frontend-v5/utils';

// The v5 equivalent of v4's `404.astro` slot content: a centred "page not
// found" message, mirroring v4's `.not-found-layout` / `.not-found-message`
// styles. This is the bare content only — no site chrome. It is used in two
// places, both of which render inside the root `RootShell` (which supplies the
// `Root` Header + Footer chrome): the dedicated `/404` route, and the root
// `notFoundComponent` (rendered inside `RootShell`'s `<Outlet />`). Together
// they reproduce v4's full-page `404.astro` (chrome + centred message).
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
