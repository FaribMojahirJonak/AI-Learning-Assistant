import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import './ReviewQuiz.css';

interface Lesson {
  id: string;
  title: string;
  description: string;
  topic: string;
}
interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  questions: any;
}
interface Result {
  id: string;
  quiz_id: string;
  score: number;
  answers: any;
}

const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const ReviewQuiz: React.FC = () => {
  const { topic } = useParams<{ topic: string }>();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (!topic || !user) return;
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
      const lessonData = lessons.find((l: any) => slugify(l.topic || l.title) === topic);
      if (!lessonData) {
        setError('Lesson not found.');
        setLoading(false);
        return;
      }
      setLesson(lessonData);
      // Fetch quiz
      const { data: quizData, error: quizErr } = await supabase.from('quizzes').select('*').eq('lesson_id', lessonData.id);
      if (quizErr || !quizData || quizData.length === 0) {
        setError('Quiz not found.');
        setLoading(false);
        return;
      }
      setQuiz(quizData[0]);
      // Fetch result for this user and quiz
      const { data: resultData, error: resultErr } = await supabase
        .from('results')
        .select('*')
        .eq('quiz_id', quizData[0].id)
        .eq('user_id', user.id);
      
      if (resultErr) {
        console.error('Error fetching result:', resultErr);
      }
      
      setResult(resultData && resultData.length > 0 ? resultData[0] : null);
      
      // Fetch PDF URL for this user and quiz
      const { data: pdfData, error: pdfErr } = await supabase
        .from('pdfs')
        .select('pdf_url')
        .eq('quiz_id', quizData[0].id)
        .eq('user_id', user.id);
      
      if (pdfErr) {
        console.error('Error fetching PDF:', pdfErr);
      }
      
      setPdfUrl(pdfData && pdfData.length > 0 ? pdfData[0].pdf_url : null);
      setLoading(false);
    };
    fetchData();
  }, [topic, user]);

  if (loading) return <div className="reviewquiz-root">Loading...</div>;
  if (error) return <div className="reviewquiz-root error">{error}</div>;
  if (!lesson || !quiz) return <div className="reviewquiz-root error">Not found.</div>;

  const questions = quiz.questions || [];
  const userAnswers = result?.answers || {};
  const score = result ? Math.round(result.score) : 0;

  return (
    <div className="reviewquiz-root">
      <div className="reviewquiz-card">
        {pdfUrl && lesson && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button
              className="userprofile-btn"
              onClick={async () => {
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
                } catch (error) {
                  console.error('Error downloading PDF:', error);
                  alert('Failed to download PDF. Please try again.');
                }
              }}
            >
              Download Assessment
            </button>
          </div>
        )}
        {!pdfUrl && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, color: '#bbb', fontSize: '0.98rem' }}>
            No PDF found
          </div>
        )}
        <div className="reviewquiz-header">
          <div className="reviewquiz-topic">{lesson.topic || lesson.title}</div>
          <div className="reviewquiz-score">Score: <span>{score}%</span></div>
        </div>
        <div className="reviewquiz-lesson-content">{lesson.description || 'No description available'}</div>
        
        <div className="reviewquiz-questions">
          {questions.map((q: any, idx: number) => {
            const userAnswer = userAnswers[q.id] ?? userAnswers[idx];
            const correctValue = q.correctAnswer || q.correct;
            const isCorrect = userAnswer === correctValue;
            const isUnanswered = userAnswer === undefined || userAnswer === null || userAnswer === '';
            const isWrong = !isCorrect;
            let questionClass = 'reviewquiz-question';
            if (isCorrect) questionClass += ' correct';
            else if (isUnanswered || isWrong) questionClass += ' wrong';
            return (
              <div className={questionClass} key={q.id || idx}>
                <div className="reviewquiz-qtext">{idx + 1}. {q.question}</div>
                <div className="reviewquiz-answers">
                  {q.options.map((opt: string, oidx: number) => {
                    // Support both string and index for userAnswer
                    const isSelected = String(userAnswer) === String(opt) || String(userAnswer) === String(oidx);
                    return (
                      <div
                        key={`${idx}-${oidx}-${opt}`}
                        className={`reviewquiz-answer${isSelected ? ' selected' : ''}`}
                      >
                        {opt}
                      </div>
                    );
                  })}
                </div>
                <div className="reviewquiz-correct-answer">
                  Correct answer: <span>{q.options.find((opt: string) => opt === (q.correctAnswer || q.correct)) || q.correctAnswer || q.correct}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewQuiz; 