import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from './components/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import LanguageToggle from './components/ui/LanguageToggle';
import NotificationBell from './components/ui/NotificationBell';
import { Menu, X, Home, PlusCircle, ListOrdered, Shield, LogOut, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function NavContent({ children, currentPageName }) {
  const { t, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', label: t('home'), icon: Home },
    { name: 'NewRequest', path: '/new-request', label: t('newRequest'), icon: PlusCircle },
    { name: 'MyRequests', path: '/my-requests', label: t('myRequests'), icon: ListOrdered },
  ];

  if (user?.role === 'admin' || user?.role === 'employee') {
    navLinks.push({ name: 'AdminDashboard', path: '/admin', label: t('admin'), icon: Shield });
  }

  return (
    <div className={`min-h-screen bg-slate-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Arabic:wght@300;400;500;600;700;800&display=swap');
        body { font-family: ${isRTL ? "'Noto Sans Arabic', sans-serif" : "'Inter', sans-serif"}; }
      `}</style>

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-md' : 'bg-white/90 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9B1C1C] to-[#7F1D1D] flex items-center justify-center shadow-lg shadow-[#9B1C1C]/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-sm">★</span>
              </div>
              <div className="hidden sm:block leading-tight">
                <h1 className="text-sm font-bold text-[#9B1C1C]">
                  Wathiqati
                </h1>
                <p className="text-xs text-slate-400">
                  Services Admin
                </p>
              </div>
            </Link>

            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map(link => {
                  const isActive = currentPageName === link.name;
                  return (
                    <Link key={link.name} to={link.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                        ${isActive ? 'bg-[#9B1C1C] text-white shadow-md shadow-[#9B1C1C]/25' : 'text-slate-600 hover:text-[#9B1C1C] hover:bg-red-50'}`}>
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            <div className="flex items-center gap-3">
              <LanguageToggle />
              {user ? (
                <>
                  <NotificationBell />
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 text-xs bg-slate-100 rounded-lg">
                    <span className="text-slate-600">{user.name}</span>
                    {user.role === 'admin' && <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">Admin</span>}
                    {user.role === 'employee' && <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-bold">Employee</span>}
                  </div>
                  <button onClick={handleLogout}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all">
                    <LogOut className="w-4 h-4" />{t('logout')}
                  </button>
                </>
              ) : (
                <button onClick={() => navigate('/login')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#9B1C1C] text-white rounded-xl hover:bg-[#7F1D1D] transition-all shadow-md shadow-[#9B1C1C]/20">
                  <LogIn className="w-4 h-4" />{t('login')}
                </button>
              )}
              {user && (
                <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors">
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {user && mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-100 bg-white">
              <nav className="p-4 space-y-1">
                {navLinks.map(link => {
                  const isActive = currentPageName === link.name;
                  return (
                    <Link key={link.name} to={link.path} onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                        ${isActive ? 'bg-[#9B1C1C] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                      <link.icon className="w-5 h-5" />{link.label}
                    </Link>
                  );
                })}
                <button onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
                  <LogOut className="w-5 h-5" />{t('logout')}
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-16 sm:pt-20 min-h-screen">{children}</main>

      <footer className="bg-[#9B1C1C] text-white/70 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-[#C8A951] text-2xl">★</span>
            <div>
              <p className="font-bold text-white text-sm">Wathiqati</p>
              <p className="text-xs text-white/60">Services Administratifs Numériques</p>
            </div>
          </div>
          <div className="border-t border-white/10 mt-6 pt-6">
            <p className="text-xs">© 2026 All rights reserved — Wathiqati Digital Services</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <NavContent currentPageName={currentPageName}>{children}</NavContent>
  );
}