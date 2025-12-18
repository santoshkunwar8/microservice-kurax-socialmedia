import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { useWebSocket } from './hooks/useWebSocket';
import { apiClient } from './services/api';
import LoginPage from './pages/Login';
import ChatPage from './pages/Chat';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import RoomDetails from './pages/RoomDetails';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken } = useAuthStore();

  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { accessToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useWebSocket(accessToken);

  // Ensure presence is updated when user closes tab/browser
  useEffect(() => {
    const handleUnload = () => {
      try {
        // Optionally notify backend of offline presence
        if (window.wsManager && typeof window.wsManager.send === 'function') {
          // If wsManager is globally available, send presence:offline
          window.wsManager.send('presence:offline', {});
        }
      } catch (e) {}
      // Always disconnect WebSocket
      if (window.wsManager && typeof window.wsManager.disconnect === 'function') {
        window.wsManager.disconnect();
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('unload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = useAuthStore.getState().accessToken;
      if (token && !useAuthStore.getState().user) {
        try {
          // Add a timeout to prevent hanging forever
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await apiClient.users.getProfile();
          clearTimeout(timeoutId);

          if (response.status === 200) {
            // @ts-ignore
            const userData = response.data.data?.user || response.data;
            useAuthStore.getState().setUser(userData);
          }
        } catch (error) {
          console.error('Failed to fetch profile', error);
          // If profile fetch fails, clear invalid token and logout
          useAuthStore.getState().logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/room/:roomId"
        element={
          <ProtectedRoute>
            <RoomDetails />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
