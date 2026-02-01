import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Globe, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

export default function WelcomePage() {
  const { currentUser, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        {/* User Info */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-primary-500" />
            )}
          </div>
          <h1 className="text-2xl font-display font-bold text-neutral-900 dark:text-white mb-1">
            Welcome, {currentUser.displayName || 'User'}!
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            {currentUser.email}
          </p>
          {isAdmin && (
            <span className="inline-block mt-2 px-3 py-1 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300 rounded-full text-xs font-medium">
              Administrator
            </span>
          )}
        </div>

        {/* Navigation Options */}
        <div className="space-y-4">
          {/* Admin Dashboard - Only shown to admins */}
          {isAdmin && (
            <Link to="/admin" className="block">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Admin Dashboard</h3>
                  <p className="text-white/80 text-sm">Manage content, events, and settings</p>
                </div>
              </motion.div>
            </Link>
          )}

          {/* Website - Shown to everyone */}
          <Link to="/" className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 p-4 bg-neutral-100 dark:bg-neutral-700 rounded-xl cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
            >
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-secondary-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">
                  Visit Website
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Browse the KWT-MT community site
                </p>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Sign Out */}
        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 text-neutral-600 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* KWT-MT Branding */}
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            KWT-MT • Kuwaiti Student Association in Malta
          </p>
        </div>
      </motion.div>
    </div>
  );
}
