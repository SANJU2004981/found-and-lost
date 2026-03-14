import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage    from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage     from '../pages/HomePage';
import LostItemPage  from '../pages/LostItemPage';
import FoundItemPage from '../pages/FoundItemPage';
import ItemsPage     from '../pages/ItemsPage';
import MapViewPage   from '../pages/MapViewPage';
import DashboardPage from '../pages/DashboardPage';
import ChatPage      from '../pages/ChatPage';
import AdminPage     from '../pages/AdminPage';
import EditItemPage  from '../pages/EditItemPage';
import Navbar        from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRouter = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                {/* Public Routes */}
                <Route path="/"             element={<HomePage />} />
                <Route path="/items"        element={<ItemsPage />} />
                <Route path="/map"          element={<MapViewPage />} />
                <Route path="/login"        element={<LoginPage />} />
                <Route path="/register"     element={<RegisterPage />} />

                {/* Authenticated Routes */}
                <Route path="/report-lost"  element={<ProtectedRoute><LostItemPage /></ProtectedRoute>} />
                <Route path="/report-found" element={<ProtectedRoute><FoundItemPage /></ProtectedRoute>} />
                <Route path="/dashboard"    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/chat/:itemId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/edit/:type/:id" element={<ProtectedRoute><EditItemPage /></ProtectedRoute>} />

                {/* Admin-only Routes */}
                <Route path="/admin"        element={<ProtectedRoute adminOnly={true}><AdminPage /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<HomePage />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
