import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginModal } from './LoginModal';
import { UserProfileDropdown } from './UserProfileDropdown';
import './Navbar.css';
export const Navbar = () => {
    const { user, signOut } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const location = useLocation();
    const openLoginModal = (signUp = false) => {
        setIsSignUp(signUp);
        setShowLoginModal(true);
    };
    return (_jsxs(_Fragment, { children: [_jsx("nav", { className: "navbar-root", children: _jsxs("div", { className: "navbar-container", children: [_jsxs(Link, { to: "/", className: "navbar-logo", children: [_jsx("span", { className: "navbar-logo-icon", children: "\uD83C\uDF93" }), _jsx("span", { className: "navbar-title", children: "AI Learning Assistant" })] }), _jsxs("div", { className: "navbar-links", children: [_jsx(Link, { to: "/", className: `navbar-link${location.pathname === '/' ? ' navbar-link-active' : ''}`, children: "Home" }), _jsx(Link, { to: "/learn", className: `navbar-link${location.pathname === '/learn' ? ' navbar-link-active' : ''}`, children: "Learn" })] }), _jsx("div", { className: "navbar-auth", children: user ? (_jsx(UserProfileDropdown, { user: user, onSignOut: signOut })) : (_jsxs("div", { className: "navbar-auth-btns", children: [_jsx("button", { onClick: () => openLoginModal(false), className: "navbar-btn", children: "Sign In" }), _jsx("button", { onClick: () => openLoginModal(true), className: "navbar-btn navbar-btn-primary", children: "Sign Up" })] })) })] }) }), _jsx(LoginModal, { isOpen: showLoginModal, onClose: () => setShowLoginModal(false), isSignUp: isSignUp, onToggleMode: () => setIsSignUp(!isSignUp) })] }));
};
