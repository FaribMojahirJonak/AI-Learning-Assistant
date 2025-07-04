import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createLesson, getLessons } from '../api/db';

interface Lesson {
  id: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
}

export default function LessonManager() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLessons = async () => {
    const { data, error } = await getLessons();
    if (error) setError(error.message);
    else setLessons(data || []);
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleAddLesson = async (e: React.FormEvent) => {
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

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Lessons</h2>
      <form onSubmit={handleAddLesson} className="space-y-4 mb-6">
        <input className="input input-bordered w-full" value={title} onChange={e => setTitle(e.target.value)} placeholder="Lesson Title" />
        <textarea className="textarea textarea-bordered w-full" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
        <button className="btn btn-primary w-full" type="submit">Add Lesson</button>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
      </form>
      <ul className="divide-y divide-gray-200">
        {lessons.map(lesson => (
          <li key={lesson.id} className="py-3">
            <div className="font-semibold">{lesson.title}</div>
            <div className="text-gray-600 text-sm">{lesson.description}</div>
            <div className="text-xs text-gray-400">Created: {new Date(lesson.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
} 