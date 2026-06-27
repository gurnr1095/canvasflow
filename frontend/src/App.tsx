import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
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
      <Toaster theme="dark" position="bottom-right" richColors closeButton />
      <ApiAuthSetup>
        <BrowserRouter>
          <Routes>
            <Route
              path="/sign-in/*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
                  <SignIn routing="path" path="/sign-in" />
                </div>
              }
            />
            <Route
              path="/sign-up/*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
                  <SignUp routing="path" path="/sign-up" />
                </div>
              }
            />
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