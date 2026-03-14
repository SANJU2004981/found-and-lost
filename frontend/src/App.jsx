import AppRouter from './router/AppRouter';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function App() {
  return (
    <ErrorBoundary fallbackMessage="The application encountered an error. Please refresh the page.">
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;
