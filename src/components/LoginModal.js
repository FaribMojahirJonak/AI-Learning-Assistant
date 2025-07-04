import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { EmailConfirmationModal } from './EmailConfirmationModal';
import './LoginModal.css';
export const LoginModal = ({ isOpen, onClose, onSuccess, isSignUp: initialIsSignUp = false, onToggleMode }) => {
    const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
    const { signIn, signUp } = useAuth();
    // Update internal state when prop changes
    useEffect(() => {
        setIsSignUp(initialIsSignUp);
    }, [initialIsSignUp]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { error } = isSignUp
                ? await signUp(email, password)
                : await signIn(email, password);
            if (error) {
                setError(error.message);
            }
            else {
                if (isSignUp) {
                    // Show email confirmation modal for signup
                    setShowEmailConfirmation(true);
                }
                else {
                    // For login, proceed normally
                    onSuccess?.();
                    onClose();
                }
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
        }
        finally {
            setLoading(false);
        }
    };
    const toggleMode = () => {
        if (onToggleMode) {
            onToggleMode();
        }
        else {
            setIsSignUp(!isSignUp);
        }
    };
    if (!isOpen)
        return null;
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "login-modal-overlay", onClick: onClose, children: _jsxs("div", { className: "login-modal", onClick: (e) => e.stopPropagation(), children: [_jsx("button", { className: "login-modal-close", onClick: onClose, children: "\u00D7" }), _jsx("div", { className: "login-modal-title", children: isSignUp ? 'Create Account' : 'Sign In' }), _jsxs("form", { onSubmit: handleSubmit, className: "login-modal-form", children: [_jsx("label", { htmlFor: "email", className: "login-modal-label", children: "Email" }), _jsx("input", { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "Enter your email", required: true, disabled: loading, className: "login-modal-input" }), _jsx("label", { htmlFor: "password", className: "login-modal-label", children: "Password" }), _jsx("input", { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Enter your password", required: true, disabled: loading, className: "login-modal-input" }), error && _jsx("div", { className: "login-modal-error", children: error }), _jsx("button", { type: "submit", className: "login-modal-btn", disabled: loading, children: loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In') })] }), _jsxs("div", { className: "login-modal-or", children: [_jsx("div", { className: "login-modal-or-line" }), _jsx("span", { className: "login-modal-or-text", children: "or" })] }), _jsxs("button", { className: "login-modal-btn-google", disabled: loading, children: [_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", children: [_jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), _jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), _jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), _jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })] }), "Continue with Google"] }), _jsx("div", { className: "text-center mt-4", children: _jsxs("p", { className: "text-gray-600 text-sm", children: [isSignUp ? 'Already have an account?' : "Don't have an account?", _jsx("button", { type: "button", onClick: toggleMode, className: "login-modal-toggle", children: isSignUp ? 'Sign In' : 'Sign Up' })] }) })] }) }), _jsx(EmailConfirmationModal, { isOpen: showEmailConfirmation, onClose: () => {
                    setShowEmailConfirmation(false);
                    onClose();
                }, email: email })] }));
};
