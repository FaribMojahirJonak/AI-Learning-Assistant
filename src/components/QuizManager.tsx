import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createQuiz, getQuizzes } from '../api/db';

interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  questions: any;
  created_at: string;
}

interface QuizManagerProps {
  lessonId: string;
}

export default function QuizManager({ lessonId }: QuizManagerProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchQuizzes = async () => {
    const { data, error } = await getQuizzes(lessonId);
    if (error) setError(error.message);
    else setQuizzes(data || []);
  };

  useEffect(() => {
    if (lessonId) fetchQuizzes();
    // eslint-disable-next-line
  }, [lessonId]);

  const handleAddQuiz = async (e: React.FormEvent) => {
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
    } catch {
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

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Quizzes for Lesson</h2>
      <form onSubmit={handleAddQuiz} className="space-y-4 mb-6">
        <input className="input input-bordered w-full" value={title} onChange={e => setTitle(e.target.value)} placeholder="Quiz Title" />
        <textarea className="textarea textarea-bordered w-full" value={questions} onChange={e => setQuestions(e.target.value)} placeholder="Questions (JSON format)" />
        <button className="btn btn-primary w-full" type="submit">Add Quiz</button>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
      </form>
      <ul className="divide-y divide-gray-200">
        {quizzes.map(quiz => (
          <li key={quiz.id} className="py-3">
            <div className="font-semibold">{quiz.title}</div>
            <div className="text-xs text-gray-400">Created: {new Date(quiz.created_at).toLocaleString()}</div>
            <pre className="bg-gray-100 rounded p-2 text-xs mt-1 overflow-x-auto">{JSON.stringify(quiz.questions, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
} 