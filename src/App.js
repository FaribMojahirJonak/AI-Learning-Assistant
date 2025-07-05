import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, useNavigate, useNavigationType } from 'react-router-dom';
import LandingPage from './LandingPage';
import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import { Navbar } from './components/Navbar';
import { supabase } from './supabaseClient';
import { useAuth } from './hooks/useAuth';
import { UserProfile } from './components/UserProfile';
import ReviewQuiz from './components/ReviewQuiz';
function LearnPage() {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [lesson, setLesson] = useState('');
    const [quiz, setQuiz] = useState([]);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [error, setError] = useState('');
    const [lessonId, setLessonId] = useState(null);
    const [quizId, setQuizId] = useState(null);
    const navigate = useNavigate();
    const navType = useNavigationType();
    const { user } = useAuth();
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;
    useEffect(() => {
        if (navType === 'POP') {
            navigate('/', { replace: true });
        }
    }, [navType, navigate]);
    const parseApiResponse = (content) => {
        // Try direct JSON parse
        try {
            return JSON.parse(content);
        }
        catch { }
        // Try to extract first JSON object
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            }
            catch { }
        }
        return null;
    };
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
        setLessonId(null);
        setQuizId(null);
        setRetryCount(0);
        let lastError = '';
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
                const parsed = parseApiResponse(content);
                if (parsed && parsed.lesson && Array.isArray(parsed.quiz)) {
                    setLesson(parsed.lesson);
                    setQuiz(parsed.quiz);
                    // Save to Supabase if user is logged in
                    if (user) {
                        // Insert lesson and get ID
                        const { data: lessonInsert, error: lessonInsertErr } = await supabase.from('lessons').insert([
                            {
                                created_by: user.id,
                                title: topic,
                                description: parsed.lesson,
                                topic: topic,
                            }
                        ]).select('id').single();
                        if (lessonInsertErr || !lessonInsert) {
                            setError('Failed to save lesson to database.');
                            setLoading(false);
                            return;
                        }
                        setLessonId(lessonInsert.id);
                        // Insert quiz and get ID
                        const { data: quizInsert, error: quizInsertErr } = await supabase.from('quizzes').insert([
                            {
                                lesson_id: lessonInsert.id,
                                title: `${topic} Quiz`,
                                questions: parsed.quiz,
                            }
                        ]).select('id').single();
                        if (quizInsertErr || !quizInsert) {
                            setError('Failed to save quiz to database.');
                            setLoading(false);
                            return;
                        }
                        setQuizId(quizInsert.id);
                    }
                    setLoading(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
                else {
                    lastError = 'Failed to parse the API response. Retrying...';
                    setRetryCount(attempt);
                }
            }
            catch (error) {
                lastError = error.message || 'Unknown error.';
                setRetryCount(attempt);
            }
        }
        setError('Failed to parse the API response after several attempts. Please try again.');
        setLoading(false);
    };
    const handleAnswerChange = (questionIndex, answer) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };
    // Helper function to calculate the height needed for a question
    const calculateQuestionHeight = (pdf, question, contentWidth) => {
        let height = 0;
        // Question text height
        const questionText = `1. ${question.question}`;
        const questionLines = pdf.splitTextToSize(questionText, contentWidth);
        height += (questionLines.length * 5) + 5;
        // Options height
        question.options.forEach((option) => {
            const optionText = `A. ${option}`;
            const optionLines = pdf.splitTextToSize(optionText, contentWidth - 10);
            height += (optionLines.length * 5) + 2;
        });
        // Spacing
        height += 8;
        return height;
    };
    const submitQuiz = async () => {
        const correctCount = quiz.reduce((count, q, i) => count + (answers[i] === q.correctAnswer ? 1 : 0), 0);
        setScore(correctCount);
        setShowResults(true);
        // Save result to Supabase
        if (user && quiz.length > 0 && lesson && quizId && lessonId) {
            try {
                // First ensure user profile exists
                const { data: profileData, error: profileErr } = await supabase
                    .from('user_profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single();
                if (profileErr && profileErr.code === 'PGRST116') {
                    // Profile doesn't exist, create it
                    console.log('Creating user profile for:', user.id);
                    const { error: createErr } = await supabase
                        .from('user_profiles')
                        .insert([{
                            id: user.id,
                            full_name: user.email.split('@')[0]
                        }]);
                    if (createErr) {
                        console.log('Profile creation error:', createErr);
                    }
                }
                else if (profileErr) {
                    console.log('Profile check error:', profileErr);
                }
                // Check if result already exists for this user/quiz
                const { data: existing, error: existErr } = await supabase
                    .from('results')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('quiz_id', quizId)
                    .single();
                if (!existing) {
                    const { error: insertErr } = await supabase.from('results').insert([
                        {
                            user_id: user.id,
                            quiz_id: quizId,
                            score: Math.round((correctCount / quiz.length) * 100),
                            answers: answers,
                        }
                    ]);
                    if (insertErr) {
                        console.log('Insert error:', insertErr);
                    }
                    else {
                        console.log('Result inserted successfully');
                    }
                }
                else {
                    console.log('Result already exists, not inserting');
                }
            }
            catch (error) {
                console.log('Error in result handling:', error);
            }
            // --- PDF GENERATION AND UPLOAD ---
            // 1. Generate PDF
            const pdf = new jsPDF();
            const pageHeight = 297; // A4 height in mm
            const margin = 20;
            const contentWidth = 170; // Available width for content
            let yPosition = margin;
            // Title
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`AI Assessment: ${topic}`, 105, yPosition, { align: 'center' });
            yPosition += 20;
            // Lesson section
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Lesson:', margin, yPosition);
            yPosition += 12;
            // Handle lesson content with page breaks
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            const lessonLines = pdf.splitTextToSize(lesson, contentWidth);
            // Process lesson lines with page break logic
            for (let i = 0; i < lessonLines.length; i++) {
                const lineHeight = 5;
                // Check if we need a new page
                if (yPosition + lineHeight > pageHeight - margin - 20) {
                    pdf.addPage();
                    yPosition = margin;
                }
                pdf.text(lessonLines[i], margin, yPosition);
                yPosition += lineHeight;
            }
            yPosition += 15; // Space after lesson
            // Quiz section
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Quiz:', margin, yPosition);
            yPosition += 12;
            // Process each question
            if (quiz && quiz.length > 0) {
                quiz.forEach((q, i) => {
                    // Check if we need a new page for this question
                    const questionHeight = calculateQuestionHeight(pdf, q, contentWidth);
                    if (yPosition + questionHeight > pageHeight - margin - 20) {
                        pdf.addPage();
                        yPosition = margin;
                    }
                    // Question text
                    pdf.setFontSize(12);
                    pdf.setFont('helvetica', 'bold');
                    const questionText = `${i + 1}. ${q.question}`;
                    const questionLines = pdf.splitTextToSize(questionText, contentWidth);
                    pdf.text(questionLines, margin, yPosition);
                    yPosition += (questionLines.length * 5) + 5;
                    // Options
                    pdf.setFont('helvetica', 'normal');
                    if (q.options && q.options.length > 0) {
                        q.options.forEach((opt, oidx) => {
                            let optText = `${String.fromCharCode(65 + oidx)}. ${opt}`;
                            let isSelected = answers[i] === opt;
                            let isCorrect = opt === q.correctAnswer;
                            // Add markers for selected and correct answers
                            if (isSelected && isCorrect) {
                                optText += ' ✓ (Your Answer - CORRECT)';
                            }
                            else if (isSelected && !isCorrect) {
                                optText += ' ✗ (Your Answer - INCORRECT)';
                            }
                            else if (!isSelected && isCorrect) {
                                optText += ' ✓ (Correct Answer)';
                            }
                            const optionLines = pdf.splitTextToSize(optText, contentWidth - 10);
                            pdf.text(optionLines, margin + 5, yPosition);
                            yPosition += (optionLines.length * 5) + 2;
                        });
                    }
                    yPosition += 8; // Space between questions
                });
            }
            else {
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'normal');
                pdf.text('No quiz questions available.', margin, yPosition);
                yPosition += 10;
            }
            // Score
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Score: ${Math.round((correctCount / quiz.length) * 100)}%`, margin, yPosition);
            // 2. Convert to Blob
            const pdfBlob = pdf.output('blob');
            // 3. Upload to Supabase Storage
            const filePath = `${user.id}/${lessonId}/AI_Assessment_${topic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            const { data: uploadData, error: uploadErr } = await supabase.storage.from('assessment-pdfs').upload(filePath, pdfBlob, { upsert: true });
            if (uploadErr) {
                return;
            }
            // 4. Get public URL
            const { data: urlData } = supabase.storage.from('assessment-pdfs').getPublicUrl(filePath);
            const pdfUrl = urlData?.publicUrl;
            // 5. Save PDF URL to pdfs table
            if (pdfUrl) {
                const { data: pdfInsert, error: pdfInsertErr } = await supabase.from('pdfs').upsert({
                    user_id: user.id,
                    quiz_id: quizId,
                    pdf_url: pdfUrl,
                    filename: `AI_Assessment_${topic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                });
            }
        }
    };
    const resetQuiz = () => {
        setAnswers({});
        setShowResults(false);
        setScore(0);
        setError('');
        setLesson('');
        setQuiz([]);
        setLessonId(null);
        setQuizId(null);
        // Always generate a new lesson/quiz on retake
        generateLesson();
    };
    const changeTopic = () => {
        setTopic('');
        setLesson('');
        setQuiz([]);
        setAnswers({});
        setShowResults(false);
        setScore(0);
        setError('');
        setLessonId(null);
        setQuizId(null);
        // Always generate a new lesson/quiz on new search
        // (user will enter a new topic and click generate)
        navigate('/learn');
    };
    const handleRetry = () => { generateLesson(); };
    return (_jsx("div", { className: "app-root", children: _jsxs("div", { className: "app", children: [_jsxs("header", { className: "app-header", children: [_jsx("h1", { children: "AI Learning Assistant" }), !lesson && _jsx("p", { children: "Enter a topic to generate a lesson and quiz" })] }), _jsxs("main", { className: "app-main", children: [!lesson && (_jsxs("div", { className: "card", children: [_jsx("div", { className: "card-illustration", children: _jsxs("svg", { width: "64", height: "64", viewBox: "0 0 64 64", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("rect", { x: "10", y: "14", width: "44", height: "36", rx: "8", fill: "#a1c4fd" }), _jsx("rect", { x: "16", y: "20", width: "32", height: "24", rx: "4", fill: "#fff" }), _jsx("rect", { x: "20", y: "24", width: "24", height: "4", rx: "2", fill: "#c2e9fb" }), _jsx("rect", { x: "20", y: "32", width: "16", height: "4", rx: "2", fill: "#c2e9fb" }), _jsx("rect", { x: "20", y: "40", width: "8", height: "4", rx: "2", fill: "#c2e9fb" }), _jsx("circle", { cx: "48", cy: "48", r: "6", fill: "#c2e9fb" }), _jsx("rect", { x: "44", y: "46", width: "8", height: "4", rx: "2", fill: "#a1c4fd" })] }) }), error && (_jsxs("div", { className: "error-message", children: [_jsx("strong", { children: "Error:" }), " ", error, _jsx("button", { onClick: handleRetry, style: { marginLeft: 12, padding: '6px 16px', borderRadius: 8, background: '#a1c4fd', color: '#fff', border: 'none', cursor: 'pointer' }, children: "Try Again" })] })), _jsxs("div", { className: "input-group", children: [_jsx("input", { type: "text", value: topic, onChange: e => setTopic(e.target.value), placeholder: "Enter a topic (e.g., Python loops, React hooks, etc.)", className: "topic-input", disabled: loading, autoFocus: true }), _jsx("button", { onClick: generateLesson, disabled: loading || !topic.trim(), className: "generate-btn", children: loading ? 'Generating...' : 'Generate Lesson & Quiz' })] })] })), lesson && (_jsxs("div", { className: "lesson-card card", children: [_jsxs("h2", { children: ["Lesson: ", topic] }), _jsx("div", { className: "lesson-content", children: lesson.split('\n').map((paragraph, i) => (_jsx("p", { children: paragraph }, i))) })] })), lesson && quiz.length > 0 && (_jsxs("div", { className: "quiz-section card", children: [_jsx("h2", { children: "Quiz" }), _jsxs("form", { onSubmit: e => { e.preventDefault(); submitQuiz(); }, children: [quiz.map((question, questionIndex) => (_jsxs("div", { className: "question-card", children: [_jsxs("h3", { children: ["Question ", questionIndex + 1] }), _jsx("p", { className: "question-text", children: question.question }), _jsx("div", { className: "options", children: question.options.map((option, optionIndex) => (_jsxs("label", { className: `option${answers[questionIndex] === option ? ' selected' : ''}`, children: [_jsx("input", { type: "radio", name: `question-${questionIndex}`, value: option, checked: answers[questionIndex] === option, onChange: () => handleAnswerChange(questionIndex, option), disabled: showResults }), _jsx("span", { className: "custom-radio" }), _jsx("span", { className: "option-text", children: option })] }, optionIndex))) }), showResults && (_jsx("div", { className: `answer-feedback ${answers[questionIndex] === question.correctAnswer ? 'correct' : 'incorrect'}`, children: answers[questionIndex] === question.correctAnswer
                                                        ? '✓ Correct!'
                                                        : `✗ Incorrect. The correct answer is: ${question.correctAnswer}` }))] }, questionIndex))), !showResults && (_jsx("button", { type: "submit", className: "submit-btn", children: "Submit Quiz" })), showResults && (_jsxs("div", { className: "results-section", children: [_jsx("h3", { children: "Quiz Results" }), _jsxs("p", { className: "score", children: ["You got ", score, " out of ", quiz.length, " questions correct!"] }), _jsxs("div", { className: "score-percentage", children: [Math.round((score / quiz.length) * 100), "%"] }), _jsxs("div", { style: {
                                                        display: 'flex',
                                                        gap: '10px',
                                                        justifyContent: 'center',
                                                        flexWrap: 'wrap',
                                                        marginTop: '20px'
                                                    }, children: [_jsx("button", { onClick: resetQuiz, className: "reset-btn", children: "Start Over" }), _jsx("button", { onClick: changeTopic, className: "change-topic-btn", children: "Change Topic" })] })] }))] })] }))] })] }) }));
}
export default function App() {
    useEffect(() => {
        // Clean up URL hash after authentication redirects
        const cleanUrlHash = () => {
            if (window.location.hash && window.location.hash.includes('access_token')) {
                // Remove the hash from URL after successful authentication
                window.history.replaceState(null, '', window.location.pathname);
            }
        };
        // Check for auth hash on mount
        cleanUrlHash();
        // Scroll to top on page reload
        const handleBeforeUnload = () => {
            window.scrollTo(0, 0);
        };
        // Listen for beforeunload event (page reload/refresh)
        window.addEventListener('beforeunload', handleBeforeUnload);
        // Also scroll to top when component mounts (for initial load)
        window.scrollTo(0, 0);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    return (_jsxs(Router, { children: [_jsx(Navbar, {}), _jsx("div", { className: "app-container", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/learn", element: _jsx(LearnPage, {}) }), _jsx(Route, { path: "/profile", element: _jsx(UserProfile, {}) }), _jsx(Route, { path: "/review/:topic", element: _jsx(ReviewQuiz, {}) })] }) })] }));
}
