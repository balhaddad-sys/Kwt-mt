import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, User, LogOut, Shield, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useEdit } from '../../contexts/EditContext';
import { navigationItems } from '../../data/mockData';
import LoginModal from '../auth/LoginModal';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { actualTheme, toggleTheme } = useTheme();
  const { currentUser, signOut, isAdmin } = useAuth();
  const { isEditMode } = useEdit();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleAdminClick = () => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-sm">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg md:text-xl">KSA</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-display font-bold text-primary-500 dark:text-white text-sm md:text-base">
                  Kuwaiti Student Association
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Malta</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary-500 text-white dark:bg-accent-500 dark:text-primary-900'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Edit Mode Indicator */}
              <AnimatePresence>
                {isEditMode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gold/20 text-gold rounded-full text-xs font-medium"
                  >
                    <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                    Edit Mode
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Toggle theme"
              >
                {actualTheme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Admin Icon - Always visible */}
              <button
                onClick={handleAdminClick}
                className={`relative p-2 rounded-lg transition-colors ${
                  isAdmin
                    ? 'text-gold bg-gold/10 hover:bg-gold/20'
                    : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                aria-label={isAdmin ? 'Admin logged in' : 'Admin login'}
                title={isAdmin ? 'Admin logged in' : 'Admin login'}
              >
                {isAdmin ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <Shield className="w-5 h-5" />
                )}
                {isAdmin && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900" />
                )}
              </button>

              {/* User Profile / Sign Out - Desktop */}
              <div className="hidden lg:flex items-center space-x-2">
                {currentUser ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt={currentUser.displayName || 'User'}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <User className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                      )}
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 max-w-[100px] truncate">
                        {currentUser.displayName || 'User'}
                      </span>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      aria-label="Sign out"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    Sign In
                  </button>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="py-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex flex-col space-y-1">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                          isActive(item.href)
                            ? 'bg-primary-500 text-white dark:bg-accent-500 dark:text-primary-900'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}

                    <div className="pt-4 px-4 border-t border-neutral-200 dark:border-neutral-700 mt-4">
                      {currentUser ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3 px-4 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                            {currentUser.photoURL ? (
                              <img
                                src={currentUser.photoURL}
                                alt={currentUser.displayName || 'User'}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <User className="w-6 h-6" />
                            )}
                            <div>
                              <span className="block font-medium">{currentUser.displayName || 'User'}</span>
                              {isAdmin && (
                                <span className="text-xs text-gold">Admin</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              signOut();
                              setIsOpen(false);
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-red-600 dark:text-red-400"
                          >
                            <LogOut className="w-5 h-5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setIsLoginModalOpen(true);
                            setIsOpen(false);
                          }}
                          className="btn-primary w-full text-center"
                        >
                          Sign In
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
