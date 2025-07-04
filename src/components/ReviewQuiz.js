import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './ReviewQuiz.css';
const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const ReviewQuiz = () => {
    const { topic } = useParams();
    const [lesson, setLesson] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
        if (!topic)
            return;
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            // Fetch lesson by topic (slug)
            const { data: lessons, error: lessonErr } = await supabase.from('lessons').select('*');
            if (lessonErr || !lessons) {
                setError('Lesson not found.');
                setLoading(false);
                return;
            }
            const lessonData = lessons.find((l) => slugify(l.topic || l.title) === topic);
            if (!lessonData) {
                setError('Lesson not found.');
                setLoading(false);
                return;
            }
            setLesson(lessonData);
            // Fetch quiz
            const { data: quizData, error: quizErr } = await supabase.from('quizzes').select('*').eq('lesson_id', lessonData.id).single();
            if (quizErr || !quizData) {
                setError('Quiz not found.');
                setLoading(false);
                return;
            }
            setQuiz(quizData);
            // Fetch result
            const { data: resultData } = await supabase.from('results').select('*').eq('quiz_id', quizData.id).single();
            setResult(resultData || null);
            // Fetch PDF URL
            const { data: pdfData } = await supabase.from('pdfs').select('pdf_url').eq('quiz_id', quizData.id).single();
            setPdfUrl(pdfData?.pdf_url || null);
            setLoading(false);
        };
        fetchData();
    }, [topic]);
    if (loading)
        return _jsx("div", { className: "reviewquiz-root", children: "Loading..." });
    if (error)
        return _jsx("div", { className: "reviewquiz-root error", children: error });
    if (!lesson || !quiz)
        return _jsx("div", { className: "reviewquiz-root error", children: "Not found." });
    const questions = quiz.questions || [];
    const userAnswers = result?.answers || {};
    const score = result ? Math.round(result.score) : 0;
    return (_jsx("div", { className: "reviewquiz-root", children: _jsxs("div", { className: "reviewquiz-card", children: [pdfUrl && lesson && (_jsx("div", { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }, children: _jsx("button", { className: "userprofile-btn", onClick: async () => {
                            try {
                                const response = await fetch(pdfUrl);
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `AI_Assessment_${lesson.topic?.replace(/[^a-zA-Z0-9]/g, '_') || lesson.title?.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                            }
                            catch (error) {
                                console.error('Error downloading PDF:', error);
                                alert('Failed to download PDF. Please try again.');
                            }
                        }, children: "Download Assessment" }) })), !pdfUrl && (_jsx("div", { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 12, color: '#bbb', fontSize: '0.98rem' }, children: "No PDF found" })), _jsxs("div", { className: "reviewquiz-header", children: [_jsx("div", { className: "reviewquiz-topic", children: lesson.topic || lesson.title }), _jsxs("div", { className: "reviewquiz-score", children: ["Score: ", _jsxs("span", { children: [score, "%"] })] })] }), _jsx("div", { className: "reviewquiz-lesson-content", children: lesson.description || 'No description available' }), _jsx("div", { className: "reviewquiz-questions", children: questions.map((q, idx) => {
                        const userAnswer = userAnswers[q.id] ?? userAnswers[idx];
                        const correctValue = q.correctAnswer || q.correct;
                        const isCorrect = userAnswer === correctValue;
                        const isUnanswered = userAnswer === undefined || userAnswer === null || userAnswer === '';
                        const isWrong = !isCorrect;
                        let questionClass = 'reviewquiz-question';
                        if (isCorrect)
                            questionClass += ' correct';
                        else if (isUnanswered || isWrong)
                            questionClass += ' wrong';
                        return (_jsxs("div", { className: questionClass, children: [_jsxs("div", { className: "reviewquiz-qtext", children: [idx + 1, ". ", q.question] }), _jsx("div", { className: "reviewquiz-answers", children: q.options.map((opt, oidx) => {
                                        // Support both string and index for userAnswer
                                        const isSelected = String(userAnswer) === String(opt) || String(userAnswer) === String(oidx);
                                        return (_jsx("div", { className: `reviewquiz-answer${isSelected ? ' selected' : ''}`, children: opt }, `${idx}-${oidx}-${opt}`));
                                    }) }), _jsxs("div", { className: "reviewquiz-correct-answer", children: ["Correct answer: ", _jsx("span", { children: q.options.find((opt) => opt === (q.correctAnswer || q.correct)) || q.correctAnswer || q.correct })] })] }, q.id || idx));
                    }) })] }) }));
};
export default ReviewQuiz;
