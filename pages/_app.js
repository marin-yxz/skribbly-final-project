import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps, session }) {
  const [user, setUser] = useState();

  const refreshUserProfile = useCallback(async () => {
    const profileResponse = await fetch('/api/profile');

    const profileResponseBody = await profileResponse.json();

    if (!('errors' in profileResponseBody)) {
      setUser(profileResponseBody.user);
    } else {
      profileResponseBody.errors.forEach((error) => console.log(error.message));
      setUser(undefined);
    }
  }, []);
  console.log(session);
  // useEffect is only frontend
  useEffect(() => {
    refreshUserProfile().catch(() => console.log('fetch api failed'));
  }, [refreshUserProfile]);
  // console.log(user);
  return (
    <SessionProvider session={session}>
      <Layout user={user}>
        {/*
          The "Component" component refers to
          the current page that is being rendered
        */}
        <Component
          {...pageProps}
          // user={user}
          refreshUserProfile={refreshUserProfile}
        />
      </Layout>
    </SessionProvider>
  );
}

export default MyApp;
