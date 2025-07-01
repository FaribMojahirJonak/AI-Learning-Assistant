import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, useNavigate, useNavigationType } from 'react-router-dom';
import LandingPage from './LandingPage';
import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
function LearnPage() {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [lesson, setLesson] = useState('');
    const [quiz, setQuiz] = useState([]);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const navType = useNavigationType();
    useEffect(() => {
        if (navType === 'POP') {
            navigate('/', { replace: true });
        }
    }, [navType, navigate]);
    const generateLesson = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic');
            return;
        }
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;
        if (!apiKey || apiKey === 'your_groq_api_key_here' || !apiKey.startsWith('gsk_')) {
            setError('API key not configured or invalid. Please add your Groq API key to the .env file.');
            return;
        }
        setLoading(true);
        setError('');
        setLesson('');
        setQuiz([]);
        setAnswers({});
        setShowResults(false);
        try {
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama3-70b-8192',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful tutor. Always respond with valid JSON format only.'
                    },
                    {
                        role: 'user',
                        content: `Create educational content about '${topic}'.\n\nCRITICAL: You must respond with ONLY valid JSON. No markdown, no explanations, no additional text.\n\nRequired JSON format:{\n  "lesson": "A comprehensive lesson about ${topic} (more than 1000 words)",\n  "quiz": [{"question": "Question text here?","options": ["Option A", "Option B", "Option C", "Option D"],"correctAnswer": "Option A"}]\n}\nRequirements: 1. Generate a lesson (more than 1000 words) explaining ${topic} 2. Create exactly 10 multiple choice questions with 4 options each 3. Mark the correct answer for each question 4. Ensure all quotes are properly escaped 5. No trailing commas 6. No markdown formatting 7. Pure JSON only\nExample of proper JSON structure:{\n  "lesson": "This is a lesson about the topic...",\n  "quiz": [{"question": "What is the main concept?","options": ["Option 1", "Option 2", "Option 3", "Option 4"],"correctAnswer": "Option 1"}]\n}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const content = response.data.choices[0].message.content.trim();
            // Try to parse as JSON, fallback to extracting JSON object
            let parsed = null;
            try {
                parsed = JSON.parse(content);
            }
            catch {
                const match = content.match(/\{[\s\S]*\}/);
                if (match) {
                    try {
                        parsed = JSON.parse(match[0]);
                    }
                    catch { }
                }
            }
            if (parsed && parsed.lesson && Array.isArray(parsed.quiz)) {
                setLesson(parsed.lesson);
                setQuiz(parsed.quiz);
            }
            else {
                setError('Failed to parse the API response. Please try again.');
            }
        }
        catch (error) {
            if (error.response?.status === 401) {
                setError('Invalid API key. Please check your Groq API key in the .env file.');
            }
            else if (error.response?.status === 429) {
                setError('Rate limit exceeded. Please wait a moment and try again.');
            }
            else if (error.response?.status === 400) {
                setError('Bad request. Please check your topic and try again.');
            }
            else if (error.code === 'NETWORK_ERROR') {
                setError('Network error. Please check your internet connection and try again.');
            }
            else {
                setError('Failed to generate lesson. Please try again.');
            }
        }
        finally {
            setLoading(false);
        }
    };
    const handleAnswerChange = (questionIndex, answer) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };
    const submitQuiz = () => {
        const correctCount = quiz.reduce((count, q, i) => count + (answers[i] === q.correctAnswer ? 1 : 0), 0);
        setScore(correctCount);
        setShowResults(true);
    };
    const resetQuiz = () => {
        setAnswers({});
        setShowResults(false);
        setScore(0);
        setError('');
    };
    const changeTopic = () => {
        setTopic('');
        setLesson('');
        setQuiz([]);
        setAnswers({});
        setShowResults(false);
        setScore(0);
        setError('');
        navigate('/learn');
    };
    return (_jsx("div", { className: "app-root", children: _jsxs("div", { className: "app", children: [_jsxs("header", { className: "app-header", children: [_jsx("h1", { children: "AI Learning Assistant" }), !lesson && _jsx("p", { children: "Enter a topic to generate a lesson and quiz" })] }), _jsxs("main", { className: "app-main", children: [!lesson && (_jsxs("div", { className: "card", children: [_jsx("div", { className: "card-illustration", children: _jsxs("svg", { width: "64", height: "64", viewBox: "0 0 64 64", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("rect", { x: "10", y: "14", width: "44", height: "36", rx: "8", fill: "#a1c4fd" }), _jsx("rect", { x: "16", y: "20", width: "32", height: "24", rx: "4", fill: "#fff" }), _jsx("rect", { x: "20", y: "24", width: "24", height: "4", rx: "2", fill: "#c2e9fb" }), _jsx("rect", { x: "20", y: "32", width: "16", height: "4", rx: "2", fill: "#c2e9fb" }), _jsx("rect", { x: "20", y: "40", width: "8", height: "4", rx: "2", fill: "#c2e9fb" }), _jsx("circle", { cx: "48", cy: "48", r: "6", fill: "#c2e9fb" }), _jsx("rect", { x: "44", y: "46", width: "8", height: "4", rx: "2", fill: "#a1c4fd" })] }) }), error && (_jsxs("div", { className: "error-message", children: [_jsx("strong", { children: "Error:" }), " ", error] })), _jsxs("div", { className: "input-group", children: [_jsx("input", { type: "text", value: topic, onChange: e => setTopic(e.target.value), placeholder: "Enter a topic (e.g., Python loops, React hooks, etc.)", className: "topic-input", disabled: loading, autoFocus: true }), _jsx("button", { onClick: generateLesson, disabled: loading || !topic.trim(), className: "generate-btn", children: loading ? 'Generating...' : 'Generate Lesson & Quiz' })] })] })), lesson && (_jsxs("div", { className: "lesson-card card", children: [_jsxs("h2", { children: ["Lesson: ", topic] }), _jsx("div", { className: "lesson-content", children: lesson.split('\n').map((paragraph, i) => (_jsx("p", { children: paragraph }, i))) })] })), lesson && quiz.length > 0 && (_jsxs("div", { className: "quiz-section card", children: [_jsx("h2", { children: "Quiz" }), _jsxs("form", { onSubmit: e => { e.preventDefault(); submitQuiz(); }, children: [quiz.map((question, questionIndex) => (_jsxs("div", { className: "question-card", children: [_jsxs("h3", { children: ["Question ", questionIndex + 1] }), _jsx("p", { className: "question-text", children: question.question }), _jsx("div", { className: "options", children: question.options.map((option, optionIndex) => (_jsxs("label", { className: `option${answers[questionIndex] === option ? ' selected' : ''}`, children: [_jsx("input", { type: "radio", name: `question-${questionIndex}`, value: option, checked: answers[questionIndex] === option, onChange: () => handleAnswerChange(questionIndex, option), disabled: showResults }), _jsx("span", { className: "custom-radio" }), _jsx("span", { className: "option-text", children: option })] }, optionIndex))) }), showResults && (_jsx("div", { className: `answer-feedback ${answers[questionIndex] === question.correctAnswer ? 'correct' : 'incorrect'}`, children: answers[questionIndex] === question.correctAnswer
                                                        ? '✓ Correct!'
                                                        : `✗ Incorrect. The correct answer is: ${question.correctAnswer}` }))] }, questionIndex))), !showResults && (_jsx("button", { type: "submit", className: "submit-btn", children: "Submit Quiz" }))] }), showResults && (_jsxs("div", { className: "results-section", children: [_jsx("h3", { children: "Quiz Results" }), _jsxs("p", { className: "score", children: ["You got ", score, " out of ", quiz.length, " questions correct!"] }), _jsxs("div", { className: "score-percentage", children: [Math.round((score / quiz.length) * 100), "%"] }), _jsx("button", { onClick: resetQuiz, className: "reset-btn", children: "Start Over" }), _jsx("button", { onClick: changeTopic, className: "change-topic-btn", children: "Change Topic" })] }))] }))] })] }) }));
}
export default function App() {
    return (_jsx(Router, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/learn", element: _jsx(LearnPage, {}) })] }) }));
}
