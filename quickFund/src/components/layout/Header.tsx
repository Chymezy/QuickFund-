"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { X, ChevronDownIcon, UserIcon, CogIcon, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/lib/stores/authStore';
import NotificationBell from '../ui/NotificationBell';

const CustomMenuIcon = () => (
  <div className="flex flex-col items-end space-y-1.5">
    <span className="block h-0.5 w-5 rounded-full bg-slate-900"></span>
    <span className="block h-0.5 w-8 rounded-full bg-slate-900"></span>
    <span className="block h-0.5 w-5 rounded-full bg-slate-900"></span>
  </div>
);

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, success, clearSuccess } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [clickedDropdown, setClickedDropdown] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Prevent body scroll when menu is open
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80; // Approximate header height
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
    setClickedDropdown(null);
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    
    if (href === '/') {
      // If we're already on homepage, scroll to top
      if (pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Navigate to homepage
        window.location.href = '/';
      }
    } else if (href.startsWith('#')) {
      // Scroll to section
      scrollToSection(href.substring(1));
    } else {
      // Navigate to different page
      window.location.href = href;
    }
  };

  const handleDropdownClick = (dropdownLabel: string) => {
    if (clickedDropdown === dropdownLabel) {
      setClickedDropdown(null);
    } else {
      setClickedDropdown(dropdownLabel);
    }
  };

  const handleDropdownItemClick = (href: string) => {
    if (href.startsWith('#')) {
      // If we're not on the homepage, navigate there first
      if (pathname !== '/') {
        window.location.href = `/${href}`;
      } else {
        // We're on homepage, scroll to section
        scrollToSection(href.substring(1));
      }
    } else {
      // Navigate to different page
      window.location.href = href;
    }
    setClickedDropdown(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const mainNavLinks = [
    { href: '/', label: 'Home' },
    { 
      href: '#', 
      label: 'Products', 
      dropdown: [
        { href: '#loan-types', label: 'Loan Types' },
        { href: '#features', label: 'Features' },
        { href: '#how-it-works', label: 'How It Works' },
      ]
    },
    { href: '/about', label: 'About' },
    { href: '/faqs', label: 'FAQ' },
  ];

  // Add user-specific navigation for authenticated users
  const userNavLinks = [
    { href: '/user', label: 'Dashboard' },
    { href: '/user/loans', label: 'My Loans' },
    { href: '/user/apply', label: 'Apply for Loan' },
  ];

  return (
    <>
      <header className="bg-white/70 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-slate-900 tracking-tight">
            QuickFund
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {mainNavLinks.map((link) => (
              <div key={link.href} className="relative">
                {link.dropdown ? (
                  <div
                    className="relative group"
                    onMouseEnter={() => setActiveDropdown(link.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button 
                      onClick={() => handleDropdownClick(link.label)}
                      className="flex items-center space-x-1 text-sm font-medium transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer text-slate-700 hover:text-cyan-600"
                    >
                      <span>{link.label}</span>
                      <ChevronDownIcon className={clsx(
                        "w-4 h-4 transition-transform duration-200",
                        (activeDropdown === link.label || clickedDropdown === link.label) ? "rotate-180" : ""
                      )} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {(activeDropdown === link.label || clickedDropdown === link.label) && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        {link.dropdown.map((dropdownItem) => (
                          <button
                            key={dropdownItem.href}
                            onClick={() => handleDropdownItemClick(dropdownItem.href)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-colors duration-200"
                          >
                            {dropdownItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={clsx(
                      "relative text-sm font-medium transition-all duration-300 ease-in-out hover:scale-105 group cursor-pointer",
                      pathname === link.href 
                        ? 'text-cyan-600 font-semibold' 
                        : 'text-slate-700 hover:text-cyan-600'
                    )}
                  >
                    {link.label}
                    <span className={clsx(
                      "absolute -bottom-1 left-0 h-0.5 bg-cyan-600 transition-all duration-300 ease-in-out",
                      pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                    )}></span>
                  </a>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Auth Links */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-sm font-medium text-slate-700 hover:text-cyan-600 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.firstName?.[0] || <UserIcon className="w-5 h-5" />}
                      </span>
                    </div>
                    <span>{user?.firstName}</span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      
                      <div className="py-1">
                        {userNavLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-colors duration-200"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                      
                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
            <Link
              href="/login"
                  className="px-4 py-2 text-sm font-medium text-cyan-600 hover:text-cyan-700 rounded-lg border border-cyan-100 hover:border-cyan-200 transition-colors"
            >
                  Sign In
            </Link>
            <Link
              href="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow transition-colors"
            >
              Get Started
            </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
              <CustomMenuIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-in-out lg:hidden',
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel */}
      <div
        className={clsx(
          'fixed top-4 right-4 z-50 w-full max-w-sm rounded-xl bg-white/80 backdrop-blur-md border border-white/20 p-6 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
          isMenuOpen ? 'translate-x-0' : 'translate-x-[110%]'
        )}
      >
        <div className="flex justify-between items-center mb-8">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">Menu</span>
          <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
            <X className="h-6 w-6 text-slate-700" />
          </button>
        </div>
        <nav className="flex flex-col space-y-4">
          {mainNavLinks.map((link) => (
            <div key={link.href}>
              {link.dropdown ? (
                <div>
                  <button
                    onClick={() => handleDropdownClick(link.label)}
                    className="flex items-center justify-between w-full text-base font-medium text-slate-700 mb-2 hover:text-cyan-600 transition-colors duration-200"
                  >
                    <span>{link.label}</span>
                    <ChevronDownIcon className={clsx(
                      "w-4 h-4 transition-transform duration-200",
                      clickedDropdown === link.label ? "rotate-180" : ""
                    )} />
                  </button>
                  {clickedDropdown === link.label && (
                    <div className="ml-4 space-y-2">
                      {link.dropdown.map((dropdownItem) => (
                        <button
                          key={dropdownItem.href}
                          onClick={() => handleDropdownItemClick(dropdownItem.href)}
                          className="block w-full text-left text-sm text-gray-600 hover:text-cyan-600 transition-colors duration-200"
                        >
                          {dropdownItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={clsx(
                    "relative text-base font-medium transition-all duration-300 ease-in-out hover:scale-105 hover:translate-x-2 group cursor-pointer",
                    pathname === link.href 
                      ? 'text-cyan-600 font-semibold' 
                      : 'text-slate-700 hover:text-cyan-600'
                  )}
                >
                  {link.label}
                  <span className={clsx(
                    "absolute -bottom-1 left-0 h-0.5 bg-cyan-600 transition-all duration-300 ease-in-out",
                    pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                  )}></span>
                </a>
              )}
            </div>
          ))}
          
          <hr className="my-4"/>
          
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              
              {userNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-base font-medium text-slate-700 hover:text-cyan-600 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
              
              <hr className="my-4"/>
              
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center w-full text-base font-medium text-red-600 hover:text-red-700 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          ) : (
          <div className="space-y-3">
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block text-base font-medium text-slate-700 hover:text-cyan-600 transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full px-4 py-3 bg-cyan-600 text-white text-base font-semibold rounded-lg hover:bg-cyan-700 transition-colors duration-200 text-center"
            >
              Get Started
            </Link>
          </div>
          )}
        </nav>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}
