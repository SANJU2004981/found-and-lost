import { useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import AppRouter from './router/AppRouter';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function App() {
  useEffect(() => {
    // Listen for auth state changes to keep localStorage in sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[AUTH-EVENT] ${event}`);
      if (session) {
        localStorage.setItem('supabase_session', JSON.stringify(session));
      } else {
        localStorage.removeItem('supabase_session');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ErrorBoundary fallbackMessage="The application encountered an error. Please refresh the page.">
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;
