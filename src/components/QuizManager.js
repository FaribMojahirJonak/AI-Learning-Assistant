import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createQuiz, getQuizzes } from '../api/db';
export default function QuizManager({ lessonId }) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState('');
    const [quizzes, setQuizzes] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fetchQuizzes = async () => {
        const { data, error } = await getQuizzes(lessonId);
        if (error)
            setError(error.message);
        else
            setQuizzes(data || []);
    };
    useEffect(() => {
        if (lessonId)
            fetchQuizzes();
        // eslint-disable-next-line
    }, [lessonId]);
    const handleAddQuiz = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!user) {
            setError('You must be logged in to add a quiz.');
            return;
        }
        let questionsJson;
        try {
            questionsJson = JSON.parse(questions);
        }
        catch {
            setError('Questions must be valid JSON.');
            return;
        }
        const { error } = await createQuiz(lessonId, title, questionsJson);
        if (error) {
            setError(error.message);
            return;
        }
        setSuccess('Quiz added!');
        setTitle('');
        setQuestions('');
        fetchQuizzes();
    };
    return (_jsxs("div", { className: "max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Quizzes for Lesson" }), _jsxs("form", { onSubmit: handleAddQuiz, className: "space-y-4 mb-6", children: [_jsx("input", { className: "input input-bordered w-full", value: title, onChange: e => setTitle(e.target.value), placeholder: "Quiz Title" }), _jsx("textarea", { className: "textarea textarea-bordered w-full", value: questions, onChange: e => setQuestions(e.target.value), placeholder: "Questions (JSON format)" }), _jsx("button", { className: "btn btn-primary w-full", type: "submit", children: "Add Quiz" }), error && _jsx("div", { className: "text-red-500", children: error }), success && _jsx("div", { className: "text-green-600", children: success })] }), _jsx("ul", { className: "divide-y divide-gray-200", children: quizzes.map(quiz => (_jsxs("li", { className: "py-3", children: [_jsx("div", { className: "font-semibold", children: quiz.title }), _jsxs("div", { className: "text-xs text-gray-400", children: ["Created: ", new Date(quiz.created_at).toLocaleString()] }), _jsx("pre", { className: "bg-gray-100 rounded p-2 text-xs mt-1 overflow-x-auto", children: JSON.stringify(quiz.questions, null, 2) })] }, quiz.id))) })] }));
}
