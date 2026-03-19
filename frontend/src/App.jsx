import { AuthProvider } from './context/AuthContext';
import AppRouter from './router/AppRouter';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function App() {
  return (
    <ErrorBoundary fallbackMessage="The application encountered an error. Please refresh the page.">
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
