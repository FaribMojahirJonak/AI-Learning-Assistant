import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const EmailConfirmationModal = ({ isOpen, onClose, email }) => {
    if (!isOpen)
        return null;
    return (_jsx("div", { style: {
            position: 'fixed', inset: 0, background: 'rgba(161,196,253,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)'
        }, onClick: onClose, children: _jsxs("div", { style: {
                background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(232,240,255,0.85) 100%)',
                borderRadius: 24, padding: '2rem', maxWidth: 400, width: '90%', boxShadow: '0 20px 40px rgba(161,196,253,0.18), 0 2px 12px rgba(189,180,254,0.10)', border: '1.5px solid rgba(189,180,254,0.18)', position: 'relative', textAlign: 'center',
            }, onClick: e => e.stopPropagation(), children: [_jsx("h2", { style: { fontSize: '1.5rem', fontWeight: 700, color: '#22223b', marginBottom: 16 }, children: "Confirm your email" }), _jsxs("p", { style: { color: '#444', marginBottom: 16 }, children: ["A confirmation email has been sent to ", _jsx("b", { children: email }), ".", _jsx("br", {}), "Please check your inbox and follow the instructions to activate your account."] }), _jsx("button", { style: {
                        padding: '0.8rem 2rem',
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(232,240,255,0.25) 100%)',
                        color: '#22223b',
                        fontWeight: 400,
                        border: '1.5px solid rgba(189,180,254,0.18)',
                        boxShadow: '0 2px 8px rgba(161,196,253,0.10)',
                        backdropFilter: 'blur(8px)',
                        cursor: 'pointer',
                        transition: 'background 0.2s, box-shadow 0.2s',
                        outline: 'none',
                    }, onMouseOver: e => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(232,240,255,0.55) 0%, rgba(255,255,255,0.45) 100%)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(161,196,253,0.18)';
                    }, onMouseOut: e => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(232,240,255,0.25) 100%)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(161,196,253,0.10)';
                    }, onMouseDown: e => {
                        e.currentTarget.style.outline = 'none';
                    }, onClick: onClose, children: "Close" })] }) }));
};
