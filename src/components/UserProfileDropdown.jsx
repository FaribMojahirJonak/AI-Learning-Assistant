import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
const UserIcon = () => (_jsx("span", { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(161,196,253,0.10)' }, children: _jsxs("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("circle", { cx: "12", cy: "8", r: "4.5", fill: "#a1c4fd" }), _jsx("ellipse", { cx: "12", cy: "17", rx: "7", ry: "4", fill: "#bdb4fe" })] }) }));
export const UserProfileDropdown = ({ onSignOut }) => {
    const { user } = useAuth();
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
    const avatar = user?.avatar_url
      ? <img src={user.avatar_url} alt="User avatar" className="navbar-user-avatar" style={{ cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(161,196,253,0.10)' }} onClick={() => setOpen((v) => !v)} />
      : <span style={{ cursor: 'pointer' }} onClick={() => setOpen((v) => !v)}><UserIcon /></span>;
    return _jsxs("div", { style: { position: 'relative', display: 'inline-block', marginLeft: 12 }, ref: menuRef, children: [
      avatar,
      _jsxs("div", { className: `navbar-user-dropdown${open ? ' open' : ''}`, style: { position: 'absolute', top: 56, right: 0 }, children: [_jsx("div", { className: "dropdown-header", children: _jsxs("div", { className: "user-info", children: [_jsx("span", { className: "user-email", children: user?.email }), _jsx("span", { className: "user-status", children: "Online" })] }) }), _jsxs("button", { className: "navbar-user-dropdown-btn", onClick: () => { setOpen(false); navigate('/profile'); }, children: [_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [_jsx("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }), _jsx("circle", { cx: "12", cy: "7", r: "4" })] }), "Profile"] }), _jsxs("button", { className: "navbar-user-dropdown-btn", onClick: () => { setOpen(false); navigate('/settings'); }, children: [_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [_jsx("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }), _jsx("circle", { cx: "12", cy: "12", r: "3" })] }), "Settings"] }), _jsx("div", { className: "dropdown-divider" }), _jsxs("button", { className: "navbar-user-dropdown-btn logout", onClick: () => { setOpen(false); onSignOut && onSignOut(); navigate('/'); }, children: [_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [_jsx("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }), _jsx("polyline", { points: "16,17 21,12 16,7" }), _jsx("line", { x1: "21", y1: "12", x2: "9", y2: "12" })] }), "Logout"] })] })] });
};
