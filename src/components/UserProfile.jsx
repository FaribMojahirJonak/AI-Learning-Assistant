import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';
const UserIcon = () => (_jsx("span", { className: "userprofile-avatar", style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(161,196,253,0.10)' }, children: _jsxs("svg", { width: "48", height: "48", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("circle", { cx: "12", cy: "8", r: "6", fill: "#a1c4fd" }), _jsx("ellipse", { cx: "12", cy: "18", rx: "9", ry: "5", fill: "#bdb4fe" })] }) }));
export const UserProfile = () => {
    const { user } = useAuth();
    const [lessons, setLessons] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [pdfUrls, setPdfUrls] = useState({});
    const navigate = useNavigate();
    useEffect(() => {
        if (!user)
            return;
        const fetchData = async () => {
            setLoading(true);
            const { data: lessonsData } = await supabase
                .from('lessons')
                .select('*')
                .eq('created_by', user.id)
                .order('created_at', { ascending: false });
            setLessons(lessonsData || []);
            let quizzesData = [];
            if (lessonsData && lessonsData.length > 0) {
                const lessonIds = lessonsData.map((l) => l.id);
                const { data: quizzesFetched } = await supabase
                    .from('quizzes')
                    .select('*')
                    .in('lesson_id', lessonIds);
                quizzesData = quizzesFetched || [];
            }
            setQuizzes(quizzesData);
            const { data: resultsData } = await supabase
                .from('results')
                .select('*')
                .eq('user_id', user.id);
            setResults(resultsData || []);
            setLoading(false);
        };
        fetchData();
    }, [user]);
    // Fetch PDF URLs for all lessons/quizzes
    useEffect(() => {
        const fetchPdfs = async () => {
            if (!user)
                return;
            const { data, error } = await supabase.from('pdfs').select('quiz_id, pdf_url, filename').eq('user_id', user.id);
            if (data) {
                const map = {};
                data.forEach((row) => {
                    if (row.quiz_id && row.pdf_url)
                        map[row.quiz_id] = row.pdf_url;
                });
                setPdfUrls(map);
            }
            if (error) {
                console.error('PDF fetch error:', error);
            }
        };
        fetchPdfs();
    }, [user, lessons]);
    // Stats
    const totalLessons = lessons.length;
    const totalQuizzes = quizzes.length;
    const allScores = results.map(r => r.score);
    const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
    // Delete lesson (and related quizzes/results)
    const handleDelete = async (lessonId) => {
        setDeleting(lessonId);
        // Delete quizzes and results related to this lesson
        const lessonQuizzes = quizzes.filter(q => q.lesson_id === lessonId);
        for (const quiz of lessonQuizzes) {
            await supabase.from('results').delete().eq('quiz_id', quiz.id);
            await supabase.from('quizzes').delete().eq('id', quiz.id);
        }
        await supabase.from('lessons').delete().eq('id', lessonId);
        setLessons(lessons.filter(l => l.id !== lessonId));
        setDeleting(null);
        setConfirmDelete(null);
    };
    const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!user)
        return <div style={{ textAlign: 'center', marginTop: '40px' }}>Please sign in to view your profile.</div>;
    if (loading)
        return <div style={{ textAlign: 'center', marginTop: '40px' }}>Loading your learning history...</div>;
    return (
      <div className="userprofile-root">
        <div className="userprofile-container">
          <div className="userprofile-left">
            {user.avatar_url
              ? <img src={user.avatar_url} alt="User avatar" className="userprofile-avatar" />
              : <UserIcon />}
            <div className="userprofile-userinfo" style={{ textAlign: 'left' }}>
              <div className="userprofile-username">{user.full_name || user.email.split('@')[0]}</div>
              <div className="userprofile-email">{user.email}</div>
              <div className="userprofile-bio">{typeof user.bio === 'string' && user.bio.trim() !== '' ? user.bio : 'No bio provided yet.'}</div>
            </div>
            <div className="userprofile-stats">
              <div className="userprofile-stat-row">
                <span className="userprofile-stat-label">
                  <span className="userprofile-stat-icon">
                    <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                      <rect x="3" y="4" width="14" height="12" rx="3" fill="#2563eb" fillOpacity="0.18" />
                      <rect x="6" y="7" width="8" height="2" rx="1" fill="#2563eb" />
                      <rect x="6" y="11" width="5" height="2" rx="1" fill="#2563eb" />
                    </svg>
                  </span>
                  Total Lessons:
                </span>
                <span className="userprofile-stat-value">{lessons.length}</span>
              </div>
              <div className="userprofile-stat-row">
                <span className="userprofile-stat-label">
                  <span className="userprofile-stat-icon">
                    <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="8" fill="#2563eb" fillOpacity="0.18" />
                      <path d="M10 6v4l3 2" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  Total Quizzes:
                </span>
                <span className="userprofile-stat-value">{quizzes.length}</span>
              </div>
              <div className="userprofile-stat-row">
                <span className="userprofile-stat-label">
                  <span className="userprofile-stat-icon">
                    <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="8" fill="#2563eb" fillOpacity="0.18" />
                      <path d="M6 10l2.5 2.5L14 7" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  Average Score:
                </span>
                <span className="userprofile-stat-value">{allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0}%</span>
              </div>
            </div>
          </div>
          <div className={`userprofile-right${lessons.length === 0 ? ' empty' : ''}`}>
            {lessons.map(lesson => {
              const quiz = quizzes.find(q => q.lesson_id === lesson.id);
              const result = quiz ? results.find(r => r.quiz_id === quiz.id) : null;
              const score = result ? Math.round(result.score) : 0;
              const radius = 28;
              const circumference = 2 * Math.PI * radius;
              const progress = Math.max(0, Math.min(100, score));
              const dash = (progress / 100) * circumference;
              const getPerformanceLevel = (score) => {
                if (score >= 90) return { level: 'excellent', remark: 'Outstanding!' };
                if (score >= 80) return { level: 'good', remark: 'Great Job!' };
                if (score >= 70) return { level: 'average', remark: 'Good Work' };
                return { level: 'poor', remark: 'Keep Trying' };
              };
              const { level, remark } = getPerformanceLevel(score);
              return (
                <div className="userprofile-card" key={lesson.id}>
                  <div className="userprofile-progress">
                    <svg width="64" height="64" viewBox="0 0 64 64">
                      <circle className="userprofile-progress-bg" cx="32" cy="32" r="28" fill="none" />
                      <circle className={`userprofile-progress-fg ${level}`} cx="32" cy="32" r="28" fill="none" strokeDasharray={`${dash} ${circumference}`} strokeDashoffset="0" transform="rotate(-90 32 32)" />
                    </svg>
                    <div className={`userprofile-progress-label ${level}`}>{score}%</div>
                    <div className={`userprofile-progress-remark ${level}`}>{remark}</div>
                  </div>
                  <div className="userprofile-card-topic">{lesson.topic || lesson.title}</div>
                  <div className="userprofile-card-content">{lesson.description ? lesson.description.slice(0, 180) + (lesson.description.length > 180 ? '...' : '') : 'No description available'}</div>
                  <div className="userprofile-card-actions">
                    <button className="userprofile-btn" onClick={() => navigate(`/review/${slugify(lesson.topic || lesson.title)}`)}>Review Quiz</button>
                    {quiz && pdfUrls[quiz.id] && (
                      <button className="userprofile-btn" onClick={async () => {
                        try {
                          const response = await fetch(pdfUrls[quiz.id]);
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `AI_Assessment_${lesson.topic?.replace(/[^a-zA-Z0-9]/g, '_') || lesson.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'quiz'}.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error('Error downloading PDF:', error);
                          alert('Failed to download PDF. Please try again.');
                        }
                      }}>Download PDF</button>
                    )}
                    <button className="userprofile-btn delete" onClick={() => setConfirmDelete(lesson.id)} disabled={deleting === lesson.id}>{deleting === lesson.id ? 'Deleting...' : 'Delete'}</button>
                  </div>
                  {confirmDelete === lesson.id && (
                    <div className="userprofile-modal-bg">
                      <div className="userprofile-modal">
                        <div className="userprofile-modal-title">Delete Lesson?</div>
                        <div className="userprofile-modal-desc">Are you sure you want to delete this lesson and all related quizzes/results? This cannot be undone.</div>
                        <div className="userprofile-modal-actions">
                          <button className="userprofile-modal-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
                          <button className="userprofile-modal-btn delete" onClick={() => handleDelete(lesson.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="userprofile-card-date">{new Date(lesson.created_at).toLocaleString()}</div>
                </div>
              );
            })}
            {lessons.length === 0 && (
              <div className="userprofile-no-lessons">
                You haven't created any lessons yet.<br />
                Start learning a new topic to see your progress here!
              </div>
            )}
          </div>
        </div>
      </div>
    );
};
