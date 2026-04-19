import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppDataProvider } from './context/AppDataContext.jsx';
import { useAppData } from './context/appDataContext';
import MainLayout from './components/layout/MainLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Impact from './pages/ImpactLive';
import Map from './pages/Map';
import Community from './pages/CommunityLive';
import Settings from './pages/Settings';
import OverlayProvider from './components/ui/OverlayProvider';
import './App.css';

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
              <Route path="/impact" element={<Impact />} />
              <Route path="/map" element={<Map />} />
              <Route path="/community" element={<Community />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </OverlayProvider>
    </AppDataProvider>
  );
}

export default App;
