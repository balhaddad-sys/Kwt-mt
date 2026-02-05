import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { EditProvider } from './contexts/EditContext';
import Layout from './components/layout/Layout';
import AdminToolbar from './components/admin/AdminToolbar';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import EventsPage from './pages/EventsPage';
import TeamPage from './pages/TeamPage';
import CommunityPage from './pages/CommunityPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

// Advanced Features (MedWard Pro Addendum)
// @ts-expect-error - JS module without type declarations
import { Privacy } from './utils/privacy.js';
// @ts-expect-error - JS module without type declarations
import { Theme as ThemeManager } from './utils/theme.js';
// @ts-expect-error - JS module without type declarations
import { Audit } from './services/audit.service.js';
// @ts-expect-error - JS module without type declarations
import { initTaskTypeaheads } from './ui/components/task-typeahead.js';

function App() {
  // Initialize advanced features on mount
  useEffect(() => {
    // Initialize privacy protection (auto-blur after inactivity)
    Privacy.init();

    // Initialize enhanced theme manager (ambient light sensor, time-based)
    ThemeManager.init();

    // Log session start for audit trail
    Audit.log(Audit.actions.AUTH_LOGIN, 'session', null);

    // Initialize clinical task typeaheads on any matching inputs
    const timer = setTimeout(() => initTaskTypeaheads(), 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <EditProvider>
            <Router>
              <Routes>
                {/* Admin route - without main layout */}
                <Route path="/admin" element={<AdminPage />} />

                {/* Main routes with layout */}
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/team" element={<TeamPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>

              {/* Admin Toolbar - appears at bottom for admin users */}
              <AdminToolbar />
            </Router>
          </EditProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
