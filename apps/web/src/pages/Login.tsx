import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { useAuthStore } from '../store';
import { AuthResponse } from '@kuraxx/types';
import { 
  MessageCircle, Eye, EyeOff, Mail, Lock, User, 
  ChevronRight, Sparkles, Shield, Zap, AlertCircle
} from 'lucide-react';

type Tab = 'login' | 'register';

export default function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setAuth } = useAuthStore();

  const isLogin = tab === 'login';

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.auth.login(email, password);

      if (response.status !== 200 || !response.data.success || !response.data.data) {
        throw new Error('Login failed');
      }

      const { user, accessToken, refreshToken, expiresIn } = response.data.data;
      setAuth(user, {
        accessToken,
        refreshToken,
        expiresIn,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('Calling register with:', { email, username, displayName });

    try {
      const response = await apiClient.auth.register(email, password, username, displayName);

      if (response.status !== 201) {
        throw new Error('Registration failed');
      }

      const data = response.data.data as AuthResponse;
      setAuth(data.user, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 animate-bounce" style={{ animationDuration: '3s' }}>
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 backdrop-blur-xl border border-white/10 rounded-2xl rotate-12"></div>
        </div>
        <div className="absolute top-40 right-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-3xl -rotate-12"></div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }}>
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-white/10 rounded-xl rotate-45"></div>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-5xl grid lg:grid-cols-[1.2fr,1fr] gap-12 items-center z-10">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-9 h-9" />
            </div>
            <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">kuraX</span>
          </div>

          <div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Connect with your
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                community
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of users building amazing communities and sharing moments in real-time.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Lightning Fast</h3>
                <p className="text-sm text-gray-400">Real-time messaging with zero lag</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
              <div className="p-3 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure & Private</h3>
                <p className="text-sm text-gray-400">End-to-end encryption for your safety</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
              <div className="p-3 bg-gradient-to-br from-orange-600 to-pink-600 rounded-xl group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Rich Features</h3>
                <p className="text-sm text-gray-400">Media sharing, reactions, and more</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="relative max-w-md mx-auto lg:mx-0 w-full">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
            {/* Logo for Mobile */}
            <div className="lg:hidden flex items-center justify-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">kuraX</span>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {isLogin ? 'Welcome back!' : 'Create your account'}
              </h2>
              <p className="text-gray-400 text-sm">
                {isLogin 
                  ? 'Enter your credentials to access your account' 
                  : 'Join kuraX and start connecting with communities'}
              </p>
              <button
                type="button"
                onClick={() => setTab(isLogin ? 'register' : 'login')}
                className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-3.5">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-gray-300">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-gray-300">Display Name</label>
                    <div className="relative">
                      <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
                        placeholder="How should we call you?"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-gray-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-gray-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-white/20 bg-white/5" />
                    <span className="text-gray-400">Remember me</span>
                  </label>
                  <a href="#" className="text-purple-400 hover:text-purple-300 transition">
                    Forgot password?
                  </a>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-5 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-purple-500/50 flex items-center justify-center space-x-2 mt-4 text-sm disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Terms */}
            {!isLogin && (
              <p className="text-xs text-gray-500 text-center mt-4">
                By signing up, you agree to our{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300 transition">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300 transition">Privacy Policy</a>
              </p>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full blur-2xl -z-10"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-2xl -z-10"></div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-sm text-gray-500 z-10">
        <div className="flex items-center space-x-6">
          <a href="#" className="hover:text-white transition">About</a>
          <span>•</span>
          <a href="#" className="hover:text-white transition">Help</a>
          <span>•</span>
          <a href="#" className="hover:text-white transition">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:text-white transition">Terms</a>
        </div>
      </div>
    </div>
  );
}
