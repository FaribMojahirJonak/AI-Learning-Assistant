import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
export default function LoginForm() {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const { data, error } = await signIn(email, password);
        if (error) {
            setError(error.message);
            return;
        }
        if (data.user) {
            setSuccess('Login successful!');
        }
    };
    return (_jsxs("form", { onSubmit: handleLogin, className: "space-y-4 max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg", children: [_jsx("input", { className: "input input-bordered w-full", value: email, onChange: e => setEmail(e.target.value), placeholder: "Email" }), _jsx("input", { className: "input input-bordered w-full", type: "password", value: password, onChange: e => setPassword(e.target.value), placeholder: "Password" }), _jsx("button", { className: "btn btn-primary w-full", type: "submit", children: "Login" }), error && _jsx("div", { className: "text-red-500", children: error }), success && _jsx("div", { className: "text-green-600", children: success })] }));
}
