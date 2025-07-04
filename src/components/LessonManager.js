import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createLesson, getLessons } from '../api/db';
export default function LessonManager() {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [lessons, setLessons] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fetchLessons = async () => {
        const { data, error } = await getLessons();
        if (error)
            setError(error.message);
        else
            setLessons(data || []);
    };
    useEffect(() => {
        fetchLessons();
    }, []);
    const handleAddLesson = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!user) {
            setError('You must be logged in to add a lesson.');
            return;
        }
        const { error } = await createLesson(title, description, title, user.id);
        if (error) {
            setError(error.message);
            return;
        }
        setSuccess('Lesson added!');
        setTitle('');
        setDescription('');
        fetchLessons();
    };
    return (_jsxs("div", { className: "max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Lessons" }), _jsxs("form", { onSubmit: handleAddLesson, className: "space-y-4 mb-6", children: [_jsx("input", { className: "input input-bordered w-full", value: title, onChange: e => setTitle(e.target.value), placeholder: "Lesson Title" }), _jsx("textarea", { className: "textarea textarea-bordered w-full", value: description, onChange: e => setDescription(e.target.value), placeholder: "Description" }), _jsx("button", { className: "btn btn-primary w-full", type: "submit", children: "Add Lesson" }), error && _jsx("div", { className: "text-red-500", children: error }), success && _jsx("div", { className: "text-green-600", children: success })] }), _jsx("ul", { className: "divide-y divide-gray-200", children: lessons.map(lesson => (_jsxs("li", { className: "py-3", children: [_jsx("div", { className: "font-semibold", children: lesson.title }), _jsx("div", { className: "text-gray-600 text-sm", children: lesson.description }), _jsxs("div", { className: "text-xs text-gray-400", children: ["Created: ", new Date(lesson.created_at).toLocaleString()] })] }, lesson.id))) })] }));
}
