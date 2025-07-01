import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, useNavigate, useNavigationType } from 'react-router-dom';
import LandingPage from './LandingPage';
import './App.css';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
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
    const downloadRef = useRef(null);
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
    const downloadAssessment = async () => {
        if (!downloadRef.current) {
            console.error('Download ref is null');
            alert('Failed to generate PDF. Please try again.');
            return;
        }
        try {
            console.log('Starting PDF generation...');
            // Temporarily show the div for rendering
            downloadRef.current.style.display = 'block';
            downloadRef.current.style.position = 'absolute';
            downloadRef.current.style.left = '-9999px';
            downloadRef.current.style.top = '0';
            // Wait a bit for the content to render
            await new Promise(resolve => setTimeout(resolve, 100));
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 20;
            const contentWidth = pageWidth - (2 * margin);
            const contentHeight = pageHeight - (2 * margin);
            let currentY = margin;
            let currentPage = 1;
            // Add title
            pdf.setFontSize(20);
            pdf.setTextColor(79, 140, 255);
            pdf.text(`AI Learning Assessment: ${topic}`, pageWidth / 2, currentY, { align: 'center' });
            currentY += 15;
            // Add lesson content
            if (lesson) {
                pdf.setFontSize(16);
                pdf.setTextColor(34, 34, 59);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Lesson', margin, currentY);
                currentY += 10;
                pdf.setFontSize(12);
                pdf.setTextColor(68, 68, 68);
                pdf.setFont('helvetica', 'normal');
                const lessonParagraphs = lesson.split('\n');
                for (const paragraph of lessonParagraphs) {
                    if (paragraph.trim()) {
                        // Use proper padding for lesson text to prevent overflow
                        const lines = pdf.splitTextToSize(paragraph, contentWidth - 40);
                        // Check if we need a new page
                        if (currentY + (lines.length * 5) > pageHeight - margin) {
                            pdf.addPage();
                            currentPage++;
                            currentY = margin;
                        }
                        pdf.text(lines, margin + 20, currentY);
                        currentY += lines.length * 5 + 5;
                    }
                }
                currentY += 10;
            }
            // Add quiz questions
            if (quiz.length > 0) {
                pdf.setFontSize(16);
                pdf.setTextColor(34, 34, 59);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Quiz', margin, currentY);
                currentY += 10;
                for (let questionIndex = 0; questionIndex < quiz.length; questionIndex++) {
                    const question = quiz[questionIndex];
                    // Calculate actual question height based on content with proper padding
                    const questionTextLines = pdf.splitTextToSize(question.question, contentWidth - 40);
                    const questionTextHeight = questionTextLines.length * 5;
                    // Calculate total options height with proper padding
                    let totalOptionsHeight = 0;
                    question.options.forEach((option, optionIndex) => {
                        let optionText = `${String.fromCharCode(65 + optionIndex)}. ${option}`;
                        if (answers[questionIndex] === option)
                            optionText += ' (Selected)';
                        if (option === question.correctAnswer)
                            optionText += ' ✓';
                        const optionLines = pdf.splitTextToSize(optionText, contentWidth - 50);
                        totalOptionsHeight += optionLines.length * 5 + 5;
                    });
                    const feedbackHeight = showResults ? 20 : 0;
                    const questionHeight = 20 + questionTextHeight + totalOptionsHeight + feedbackHeight + 15;
                    // Check if we need a new page for this question
                    if (currentY + questionHeight > pageHeight - margin) {
                        pdf.addPage();
                        currentPage++;
                        currentY = margin;
                    }
                    // Question card background with better styling
                    pdf.setFillColor(248, 250, 252);
                    pdf.setDrawColor(224, 231, 255);
                    pdf.rect(margin, currentY - 8, contentWidth, questionHeight + 8);
                    pdf.setFillColor(248, 250, 252);
                    pdf.rect(margin, currentY - 8, contentWidth, questionHeight + 8, 'F');
                    pdf.setDrawColor(224, 231, 255);
                    pdf.rect(margin, currentY - 8, contentWidth, questionHeight + 8, 'S');
                    // Question number and text
                    pdf.setFontSize(14);
                    pdf.setTextColor(34, 34, 59);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(`Question ${questionIndex + 1}`, margin + 8, currentY);
                    currentY += 8;
                    pdf.setFontSize(12);
                    pdf.setTextColor(68, 68, 68);
                    pdf.setFont('helvetica', 'normal');
                    pdf.text(questionTextLines, margin + 20, currentY);
                    currentY += questionTextHeight + 8;
                    // Options with consistent font
                    question.options.forEach((option, optionIndex) => {
                        const isSelected = answers[questionIndex] === option;
                        const isCorrect = option === question.correctAnswer;
                        // Split option text to prevent overflow with proper padding
                        let optionText = `${String.fromCharCode(65 + optionIndex)}. ${option}`;
                        if (isSelected)
                            optionText += ' (Selected)';
                        if (isCorrect)
                            optionText += ' ✓';
                        const optionLines = pdf.splitTextToSize(optionText, contentWidth - 50);
                        const optionHeight = optionLines.length * 5 + 5;
                        pdf.setFontSize(11);
                        pdf.setFont('helvetica', 'normal');
                        if (isSelected) {
                            pdf.setTextColor(79, 140, 255);
                            pdf.setFont('helvetica', 'bold');
                        }
                        else {
                            pdf.setTextColor(68, 68, 68);
                            pdf.setFont('helvetica', 'normal');
                        }
                        // Draw option text with proper line breaks and padding
                        optionLines.forEach((line, lineIndex) => {
                            pdf.text(line, margin + 25, currentY + 2 + (lineIndex * 5));
                        });
                        currentY += optionHeight;
                    });
                    // Answer feedback
                    if (showResults) {
                        currentY += 5;
                        const isCorrect = answers[questionIndex] === question.correctAnswer;
                        // Create shorter feedback text to prevent overflow
                        let feedbackText = isCorrect
                            ? '✓ Correct!'
                            : `✗ Incorrect. Correct answer: ${question.correctAnswer}`;
                        // Use very small width for feedback to prevent overflow
                        const feedbackWidth = Math.min(contentWidth - 80, 80);
                        const feedbackLines = pdf.splitTextToSize(feedbackText, feedbackWidth);
                        const feedbackHeight = feedbackLines.length * 5 + 8;
                        pdf.setTextColor(isCorrect ? 21 : 153, isCorrect ? 128 : 27, isCorrect ? 61 : 27);
                        pdf.setFont('helvetica', 'bold');
                        pdf.setFontSize(9);
                        // Draw feedback text with maximum padding from edges
                        feedbackLines.forEach((line, lineIndex) => {
                            pdf.text(line, margin + 40, currentY + 3 + (lineIndex * 5));
                        });
                        currentY += feedbackHeight + 5;
                    }
                    currentY += 8;
                }
            }
            // Add results
            if (showResults) {
                // Check if we need a new page for results
                if (currentY + 40 > pageHeight - margin) {
                    pdf.addPage();
                    currentPage++;
                    currentY = margin;
                }
                // Results background
                pdf.setFillColor(243, 248, 255);
                pdf.setDrawColor(161, 196, 253);
                pdf.rect(margin, currentY, contentWidth, 35, 'F');
                pdf.rect(margin, currentY, contentWidth, 35, 'S');
                // Results text
                pdf.setFontSize(16);
                pdf.setTextColor(34, 34, 59);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Quiz Results', pageWidth / 2, currentY + 8, { align: 'center' });
                pdf.setFontSize(12);
                pdf.setTextColor(68, 68, 68);
                pdf.setFont('helvetica', 'normal');
                pdf.text(`You got ${score} out of ${quiz.length} questions correct!`, pageWidth / 2, currentY + 18, { align: 'center' });
                pdf.setFontSize(20);
                pdf.setTextColor(161, 196, 253);
                pdf.setFont('helvetica', 'bold');
                pdf.text(`${Math.round((score / quiz.length) * 100)}%`, pageWidth / 2, currentY + 28, { align: 'center' });
            }
            const filename = `AI_Assessment_${topic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            pdf.save(filename);
            console.log('PDF generated successfully');
            // Hide the div again
            downloadRef.current.style.display = 'none';
        }
        catch (error) {
            console.error('Error generating PDF:', error);
            // Hide the div in case of error
            if (downloadRef.current) {
                downloadRef.current.style.display = 'none';
            }
            alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
        }
    };
    return (_jsx("div", { className: "app-root", children: _jsxs("div", { className: "app", children: [_jsxs("header", { className: "app-header", children: [_jsx("h1", { children: "AI Learning Assistant" }), !lesson && _jsx("p", { children: "Enter a topic to generate a lesson and quiz" })] }), _jsxs("main", { className: "app-main", children: [!lesson && (_jsxs("div", { className: "card", children: [_jsx("div", { className: "card-illustration", children: _jsxs("svg", { width: "64", height: "64", viewBox: "0 0 64 64", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("rect", { x: "10", y: "14", width: "44", height: "36", rx: "8", fill: "#a1c4fd" }), _jsx("rect", { x: "16", y: "20", width: "32", height: "24", rx: "4", fill: "#fff" }), _jsx("rect", { x: "20", y: "24", width: "24", height: "4", rx: "2", fill: "#c2e9fb" }), _jsx("rect", { x: "20", y: "32", width: "16", height: "4", rx: "2", fill: "#c2e9fb" }), _jsx("rect", { x: "20", y: "40", width: "8", height: "4", rx: "2", fill: "#c2e9fb" }), _jsx("circle", { cx: "48", cy: "48", r: "6", fill: "#c2e9fb" }), _jsx("rect", { x: "44", y: "46", width: "8", height: "4", rx: "2", fill: "#a1c4fd" })] }) }), error && (_jsxs("div", { className: "error-message", children: [_jsx("strong", { children: "Error:" }), " ", error] })), _jsxs("div", { className: "input-group", children: [_jsx("input", { type: "text", value: topic, onChange: e => setTopic(e.target.value), placeholder: "Enter a topic (e.g., Python loops, React hooks, etc.)", className: "topic-input", disabled: loading, autoFocus: true }), _jsx("button", { onClick: generateLesson, disabled: loading || !topic.trim(), className: "generate-btn", children: loading ? 'Generating...' : 'Generate Lesson & Quiz' })] })] })), _jsxs("div", { ref: downloadRef, style: {
                                display: 'none',
                                backgroundColor: 'white',
                                padding: '20px',
                                width: '800px',
                                maxWidth: '800px',
                                boxSizing: 'border-box',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word'
                            }, children: [_jsxs("h1", { style: { color: '#4f8cff', textAlign: 'center', marginBottom: '20px', fontSize: '24px' }, children: ["AI Learning Assessment: ", topic] }), lesson && (_jsxs("div", { style: { marginBottom: '30px' }, children: [_jsx("h2", { style: { color: '#22223b', marginBottom: '15px', fontSize: '20px' }, children: "Lesson" }), _jsx("div", { style: { lineHeight: '1.6', color: '#444', fontSize: '14px' }, children: lesson.split('\n').map((paragraph, i) => (_jsx("p", { style: { marginBottom: '10px', wordWrap: 'break-word', overflowWrap: 'break-word' }, children: paragraph }, i))) })] })), quiz.length > 0 && (_jsxs("div", { style: { marginBottom: '30px' }, children: [_jsx("h2", { style: { color: '#22223b', marginBottom: '15px', fontSize: '20px' }, children: "Quiz" }), quiz.map((question, questionIndex) => (_jsxs("div", { style: {
                                                marginBottom: '20px',
                                                padding: '15px',
                                                border: '1px solid #e0e7ff',
                                                borderRadius: '8px',
                                                wordWrap: 'break-word',
                                                overflowWrap: 'break-word'
                                            }, children: [_jsxs("h3", { style: { color: '#22223b', marginBottom: '10px', fontSize: '16px' }, children: ["Question ", questionIndex + 1] }), _jsx("p", { style: { marginBottom: '10px', color: '#444', fontSize: '14px', wordWrap: 'break-word', overflowWrap: 'break-word' }, children: question.question }), _jsx("div", { style: { marginBottom: '10px' }, children: question.options.map((option, optionIndex) => (_jsx("div", { style: { marginBottom: '5px', padding: '5px' }, children: _jsxs("span", { style: {
                                                                fontWeight: answers[questionIndex] === option ? 'bold' : 'normal',
                                                                color: answers[questionIndex] === option ? '#4f8cff' : '#444',
                                                                fontSize: '14px',
                                                                wordWrap: 'break-word',
                                                                overflowWrap: 'break-word'
                                                            }, children: [String.fromCharCode(65 + optionIndex), ". ", option, answers[questionIndex] === option && ' (Selected)', option === question.correctAnswer && ' ✓'] }) }, optionIndex))) }), showResults && (_jsx("div", { style: {
                                                        padding: '8px',
                                                        borderRadius: '4px',
                                                        backgroundColor: answers[questionIndex] === question.correctAnswer ? '#d4f8e8' : '#ffe0e0',
                                                        color: answers[questionIndex] === question.correctAnswer ? '#2d6a4f' : '#b00020',
                                                        fontWeight: 'bold',
                                                        fontSize: '14px'
                                                    }, children: answers[questionIndex] === question.correctAnswer
                                                        ? '✓ Correct!'
                                                        : `✗ Incorrect. The correct answer is: ${question.correctAnswer}` }))] }, questionIndex)))] })), showResults && (_jsxs("div", { style: {
                                        textAlign: 'center',
                                        padding: '20px',
                                        border: '2px solid #a1c4fd',
                                        borderRadius: '8px',
                                        backgroundColor: '#f3f8ff'
                                    }, children: [_jsx("h3", { style: { color: '#22223b', marginBottom: '10px', fontSize: '18px' }, children: "Quiz Results" }), _jsxs("p", { style: { fontSize: '16px', marginBottom: '5px' }, children: ["You got ", score, " out of ", quiz.length, " questions correct!"] }), _jsxs("div", { style: { fontSize: '24px', fontWeight: 'bold', color: '#a1c4fd', marginBottom: '10px' }, children: [Math.round((score / quiz.length) * 100), "%"] })] }))] }), lesson && (_jsxs("div", { className: "lesson-card card", children: [_jsxs("h2", { children: ["Lesson: ", topic] }), _jsx("div", { className: "lesson-content", children: lesson.split('\n').map((paragraph, i) => (_jsx("p", { children: paragraph }, i))) })] })), lesson && quiz.length > 0 && (_jsxs("div", { className: "quiz-section card", children: [_jsx("h2", { children: "Quiz" }), _jsxs("form", { onSubmit: e => { e.preventDefault(); submitQuiz(); }, children: [quiz.map((question, questionIndex) => (_jsxs("div", { className: "question-card", children: [_jsxs("h3", { children: ["Question ", questionIndex + 1] }), _jsx("p", { className: "question-text", children: question.question }), _jsx("div", { className: "options", children: question.options.map((option, optionIndex) => (_jsxs("label", { className: `option${answers[questionIndex] === option ? ' selected' : ''}`, children: [_jsx("input", { type: "radio", name: `question-${questionIndex}`, value: option, checked: answers[questionIndex] === option, onChange: () => handleAnswerChange(questionIndex, option), disabled: showResults }), _jsx("span", { className: "custom-radio" }), _jsx("span", { className: "option-text", children: option })] }, optionIndex))) }), showResults && (_jsx("div", { className: `answer-feedback ${answers[questionIndex] === question.correctAnswer ? 'correct' : 'incorrect'}`, children: answers[questionIndex] === question.correctAnswer
                                                        ? '✓ Correct!'
                                                        : `✗ Incorrect. The correct answer is: ${question.correctAnswer}` }))] }, questionIndex))), !showResults && (_jsx("button", { type: "submit", className: "submit-btn", children: "Submit Quiz" }))] }), showResults && (_jsxs("div", { className: "results-section", children: [_jsx("h3", { children: "Quiz Results" }), _jsxs("p", { className: "score", children: ["You got ", score, " out of ", quiz.length, " questions correct!"] }), _jsxs("div", { className: "score-percentage", children: [Math.round((score / quiz.length) * 100), "%"] }), _jsxs("div", { style: {
                                                display: 'flex',
                                                gap: '10px',
                                                justifyContent: 'center',
                                                flexWrap: 'wrap',
                                                marginTop: '20px'
                                            }, children: [_jsx("button", { onClick: resetQuiz, className: "reset-btn", children: "Start Over" }), _jsx("button", { onClick: changeTopic, className: "change-topic-btn", children: "Change Topic" }), _jsx("button", { onClick: downloadAssessment, className: "reset-btn", style: {
                                                        backgroundColor: '#4f8cff',
                                                        color: 'white',
                                                        padding: '14px 32px',
                                                        border: 'none',
                                                        borderRadius: '18px',
                                                        fontSize: '1.1rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        boxShadow: '0 4px 12px rgba(79, 140, 255, 0.3)',
                                                        transition: 'all 0.3s ease',
                                                        marginTop: '18px',
                                                        marginLeft: '0'
                                                    }, onMouseOver: (e) => {
                                                        e.currentTarget.style.backgroundColor = '#7f53ac';
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 140, 255, 0.4)';
                                                    }, onMouseOut: (e) => {
                                                        e.currentTarget.style.backgroundColor = '#4f8cff';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 140, 255, 0.3)';
                                                    }, children: "\uD83D\uDCC4 Download Assessment PDF" })] })] }))] }))] })] }) }));
}
export default function App() {
    return (_jsx(Router, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/learn", element: _jsx(LearnPage, {}) })] }) }));
}
