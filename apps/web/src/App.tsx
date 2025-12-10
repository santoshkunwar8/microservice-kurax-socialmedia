import { useEffect, useState } from 'react';
import { useAuthStore } from './store';
import { useWebSocket } from './hooks/useWebSocket';
import { apiClient } from './services/api';
import LoginPage from './pages/Login';
import ChatPage from './pages/Chat';

function App() {
  const { isAuthenticated, accessToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useWebSocket(accessToken);

  useEffect(() => {
    const initAuth = async () => {
      const token = useAuthStore.getState().accessToken;
      if (token && !useAuthStore.getState().user) {
        try {
          const response = await apiClient.users.getProfile();
          if (response.status === 200) {
            // @ts-ignore
            const userData = response.data.data?.user || response.data;
            useAuthStore.getState().setUser(userData);
          }
        } catch (error) {
          console.error('Failed to fetch profile', error);
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

  return isAuthenticated && accessToken ? <ChatPage /> : <LoginPage />;
}

export default App;
