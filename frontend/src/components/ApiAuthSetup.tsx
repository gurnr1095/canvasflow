import { useAuth } from '@clerk/clerk-react';
import { setClerkGetToken } from '../lib/api';

export default function ApiAuthSetup({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded } = useAuth();

  if (isLoaded) {
    // Set the token fetcher synchronously before children render
    setClerkGetToken(getToken);
  }

  // Only render the app once Clerk has loaded
  return isLoaded ? <>{children}</> : null;
}
