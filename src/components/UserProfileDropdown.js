import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const UserIcon = () => (_jsx("span", { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(161,196,253,0.10)' }, children: _jsxs("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("circle", { cx: "12", cy: "8", r: "4.5", fill: "#a1c4fd" }), _jsx("ellipse", { cx: "12", cy: "17", rx: "7", ry: "4", fill: "#bdb4fe" })] }) }));
export const UserProfileDropdown = ({ user, onSignOut }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    // Close menu on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        if (open)
            document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);
    return (_jsxs("div", { style: { position: 'relative', display: 'inline-block', marginLeft: 12 }, ref: menuRef, children: [user.photoURL ? (_jsx("img", { src: user.photoURL, alt: "User avatar", className: "navbar-user-avatar", style: { cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(161,196,253,0.10)' }, onClick: () => setOpen((v) => !v) })) : (_jsx("span", { style: { cursor: 'pointer' }, onClick: () => setOpen((v) => !v), children: _jsx(UserIcon, {}) })), _jsxs("div", { className: `navbar-user-dropdown${open ? ' open' : ''}`, style: { position: 'absolute', top: 56, right: 0 }, children: [_jsx("button", { className: "navbar-user-dropdown-btn", onClick: () => { setOpen(false); navigate('/profile'); }, children: "Profile" }), _jsx("button", { className: "navbar-user-dropdown-btn logout", onClick: () => { setOpen(false); onSignOut && onSignOut(); navigate('/'); }, children: "Logout" })] })] }));
};
