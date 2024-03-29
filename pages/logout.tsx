import cookie from 'cookie';
import { GetServerSidePropsContext } from 'next';
import { deleteSessionByToken } from '../util/database';

export default function About() {
  return null;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const token = context.req.cookies.sessionToken;

  // if there is a token, delete the session and set cookie for destruction
  if (token) {
    await deleteSessionByToken(token);

    context.res.setHeader('Set-Cookie', [
      cookie.serialize('sessionToken', '', {
        maxAge: -1,
        path: '/',
      }),
      cookie.serialize('next-auth.session-token', '', {
        maxAge: -1,
        path: '/',
      }),
      cookie.serialize('next-auth.callback-url', '', {
        maxAge: -1,
        path: '/',
      }),
      cookie.serialize('next-auth.csrf-token', '', {
        maxAge: -1,
        path: '/',
      }),
    ]);
  }

  return {
    redirect: {
      destination: `/`,
      permanent: false,
    },
  };
}
