import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginModal } from './LoginModal';
import { UserProfileDropdown } from './UserProfileDropdown';
import './Navbar.css';
import quizenceLogo from '../assets/quizence-logo.png';
export const Navbar = () => {
    const { user, signOut } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const openLoginModal = (signUp = false) => {
        setIsSignUp(signUp);
        setShowLoginModal(true);
        setIsMobileMenuOpen(false);
    };
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };
    return (_jsxs(_Fragment, { children: [_jsxs("nav", { className: "navbar-root", children: [_jsxs("div", { className: "navbar-container", children: [_jsxs(Link, { to: "/", className: "navbar-logo", onClick: closeMobileMenu, children: [_jsx("img", { src: quizenceLogo, alt: "Quizence Logo", className: "navbar-logo-img", width: 36, height: 36 }), _jsx("span", { className: "navbar-title", children: "Quizence" })] }), _jsxs("button", { className: `navbar-hamburger ${isMobileMenuOpen ? 'active' : ''}`, onClick: toggleMobileMenu, "aria-label": "Toggle mobile menu", children: [_jsx("span", {}), _jsx("span", {}), _jsx("span", {})] }), _jsxs("div", { className: "navbar-links desktop-only", children: [_jsx(Link, { to: "/", className: `navbar-link${location.pathname === '/' ? ' navbar-link-active' : ''}`, children: "Home" }), _jsx(Link, { to: "/learn", className: `navbar-link${location.pathname === '/learn' ? ' navbar-link-active' : ''}`, children: "Learn" })] }), _jsx("div", { className: "navbar-auth desktop-only", children: user ? (_jsx(UserProfileDropdown, { user: user, onSignOut: signOut })) : (_jsxs("div", { className: "navbar-auth-btns", children: [_jsx("button", { onClick: () => openLoginModal(false), className: "navbar-btn", children: "Sign In" }), _jsx("button", { onClick: () => openLoginModal(true), className: "navbar-btn navbar-btn-primary", children: "Sign Up" })] })) })] }), _jsx("div", { className: `navbar-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`, children: _jsxs("div", { className: "navbar-mobile-content", children: [_jsxs("div", { className: "navbar-mobile-links", children: [_jsx(Link, { to: "/", className: `navbar-mobile-link${location.pathname === '/' ? ' active' : ''}`, onClick: closeMobileMenu, children: "Home" }), _jsx(Link, { to: "/learn", className: `navbar-mobile-link${location.pathname === '/learn' ? ' active' : ''}`, onClick: closeMobileMenu, children: "Learn" })] }), _jsx("div", { className: "navbar-mobile-auth", children: user ? (_jsxs("div", { className: "navbar-mobile-user", children: [_jsx("div", { className: "navbar-mobile-user-info", children: _jsx("span", { className: "navbar-mobile-user-email", children: user.email }) }), _jsx("button", { onClick: () => {
                                                    signOut();
                                                    closeMobileMenu();
                                                }, className: "navbar-mobile-btn navbar-mobile-btn-logout", children: "Sign Out" })] })) : (_jsxs("div", { className: "navbar-mobile-auth-btns", children: [_jsx("button", { onClick: () => openLoginModal(false), className: "navbar-mobile-btn", children: "Sign In" }), _jsx("button", { onClick: () => openLoginModal(true), className: "navbar-mobile-btn navbar-mobile-btn-primary", children: "Sign Up" })] })) })] }) })] }), _jsx(LoginModal, { isOpen: showLoginModal, onClose: () => setShowLoginModal(false), isSignUp: isSignUp, onToggleMode: () => setIsSignUp(!isSignUp) })] }));
};
