import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppDataProvider } from './context/AppDataContext.jsx';
import { useAppData } from './context/appDataContext';
import MainLayout from './components/layout/MainLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Listings from './pages/Listings';
import Map from './pages/Map';
import Community from './pages/CommunityLive';
import Settings from './pages/Settings';
import OverlayProvider from './components/ui/OverlayProvider';
import './App.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';


// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAppData();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppDataProvider>
        <OverlayProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes inside MainLayout */}
              <Route 
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/map" element={<Map />} />
                <Route path="/community" element={<Community />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </Router>
        </OverlayProvider>
      </AppDataProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
