import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import CustomCursor from './components/CustomCursor';
import SmoothScroll from './components/SmoothScroll';
import Preloader from './components/Preloader';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Explore from './pages/Explore';
import ExploreNav from './pages/ExploreNav';
import Creators from './pages/Creators';
import CreatorsNav from './pages/CreatorsNav';
import About from './pages/About';
import AboutNav from './pages/AboutNav';
import Profile from './pages/Profile';
import ProfileDemo from './pages/ProfileDemo';
import Collection from './pages/Collection';
import CollectionDetailPage from './pages/CollectionDetailPage';
import ProductDetailPage from './pages/ProductDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmailToken from './pages/VerifyEmailToken';
import Analytics from './pages/Analytics';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ScrollToTop from './components/ScrollToTop';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  return children;
};

// Public Route Component (redirects to home if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        {/* Public Routes */}
        <Route path="/landing" element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
        <Route path="/reset-passowrd" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmailToken />} />
        <Route path="/verify-email" element={<VerifyEmailToken />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/explore" element={isAuthenticated ? <Explore /> : <ExploreNav />} />

        <Route path="/creators" element={isAuthenticated ? <Creators /> : <CreatorsNav />} />
        <Route path="/about" element={isAuthenticated ? <About /> : <AboutNav />} />
        <Route path="/profile/:username" element={isAuthenticated ? <Profile /> : <ProfileDemo />} />
        <Route path="/c/:id" element={<CollectionDetailPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/user/:userId" element={<UserProfilePage />} />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />

        {/* Catch all - redirect to landing or home based on auth */}
        <Route path="*" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/landing" replace />
        } />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [showPreloader, setShowPreloader] = useState(!isAuthenticated);

  // Only show custom cursor on landing page, not on login/signup
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname)
    || location.pathname.startsWith('/reset-password')
    || location.pathname.startsWith('/reset-passowrd')
    || location.pathname.startsWith('/verify-email');
  const showCustomCursor = !isAuthenticated && !isAuthPage;
  const isLandingPage = location.pathname === '/landing';

  return (
    <SmoothScroll>
      <div className={`app${showCustomCursor ? ' landing-cursor-active' : ''}`}>
        {showPreloader && isLandingPage && (
          <Preloader onComplete={() => setShowPreloader(false)} />
        )}
        {showCustomCursor && <CustomCursor />}
        {isAuthenticated && <Sidebar />}
        <div className="app-content">
          {!isAuthenticated && <Header />}
          <main className="main-content">
            <AnimatedRoutes />
          </main>
          {!isAuthenticated && <Footer />}
        </div>
      </div>
    </SmoothScroll>
  );
};

function App() {
  return (
    <DataProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <NotificationProvider>
              <ScrollToTop />
              <AppContent />
            </NotificationProvider>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </DataProvider>
  );
}

export default App;
