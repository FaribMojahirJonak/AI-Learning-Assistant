import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
export default function LogoutButton() {
    const { signOut } = useAuth();
    const [success, setSuccess] = useState('');
    const handleLogout = async () => {
        await signOut();
        setSuccess('Logged out successfully!');
    };
    return (_jsxs("div", { className: "my-4", children: [_jsx("button", { className: "btn btn-secondary", onClick: handleLogout, children: "Logout" }), success && _jsx("div", { className: "text-green-600 mt-2", children: success })] }));
}
