import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  ClerkProvider,
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from '@clerk/clerk-react';
import Dashboard from './pages/Dashboard';
import Board from './pages/Board';
import ApiAuthSetup from './components/ApiAuthSetup';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_KEY}>
      <ApiAuthSetup>
        <BrowserRouter>
          <Routes>
            <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
            <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
            <Route
              path="/"
              element={
                <>
                  <SignedIn><Dashboard /></SignedIn>
                  <SignedOut><RedirectToSignIn /></SignedOut>
                </>
              }
            />
            <Route
              path="/board/:boardId"
              element={
                <>
                  <SignedIn><Board /></SignedIn>
                  <SignedOut><RedirectToSignIn /></SignedOut>
                </>
              }
            />
          </Routes>
        </BrowserRouter>
      </ApiAuthSetup>
    </ClerkProvider>
  );
}