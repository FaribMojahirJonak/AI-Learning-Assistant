import { supabase } from '../supabaseClient';

// Types
export interface Lesson {
  id: string;
  title: string;
  description: string;
  topic: string;
  created_by: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  questions: any; // JSONB array of questions
  created_at: string;
}

export interface Result {
  id: string;
  user_id: string;
  quiz_id: string;
  answers: any; // JSONB user answers
  score: number;
  created_at: string;
}

export interface Pdf {
  id: string;
  user_id: string;
  quiz_id: string;
  pdf_url: string;
  filename: string;
  created_at: string;
}

// LESSONS
export async function createLesson(title: string, description: string, topic: string, userId: string) {
  console.log('Creating lesson with data:', { title, description, topic, userId });
  const result = await supabase.from('lessons').insert([{ 
    title, 
    description, 
    topic, 
    created_by: userId 
  }]).select().single();
  console.log('Lesson creation result:', result);
  return result;
}

export async function getLessons() {
  const result = await supabase.from('lessons').select('*');
  console.log('Get lessons result:', result);
  return result;
}

export async function getLessonsByUser(userId: string) {
  const result = await supabase.from('lessons').select('*').eq('created_by', userId);
  console.log('Get lessons by user result:', result);
  return result;
}

// QUIZZES
export async function createQuiz(lessonId: string, title: string, questions: any) {
  console.log('Creating quiz with data:', { lessonId, title, questions });
  const result = await supabase.from('quizzes').insert([{ 
    lesson_id: lessonId, 
    title, 
    questions 
  }]).select().single();
  console.log('Quiz creation result:', result);
  return result;
}

export async function getQuizzes(lessonId: string) {
  const result = await supabase.from('quizzes').select('*').eq('lesson_id', lessonId);
  console.log('Get quizzes result:', result);
  return result;
}

export async function getQuizById(quizId: string) {
  const result = await supabase.from('quizzes').select('*').eq('id', quizId).single();
  console.log('Get quiz by ID result:', result);
  return result;
}

// RESULTS
export async function createResult(userId: string, quizId: string, answers: any, score: number) {
  console.log('Creating result with data:', { userId, quizId, answers, score });
  const result = await supabase.from('results').insert([{ 
    user_id: userId, 
    quiz_id: quizId, 
    answers, 
    score 
  }]).select().single();
  console.log('Result creation result:', result);
  return result;
}

export async function getResults(userId: string) {
  const result = await supabase.from('results').select('*').eq('user_id', userId);
  console.log('Get results result:', result);
  return result;
}

export async function getResultByQuiz(userId: string, quizId: string) {
  const result = await supabase.from('results').select('*').eq('user_id', userId).eq('quiz_id', quizId).single();
  console.log('Get result by quiz result:', result);
  return result;
}

// PDFS
export async function savePdfRecord(userId: string, quizId: string, pdfUrl: string, filename: string) {
  console.log('Saving PDF record with data:', { userId, quizId, pdfUrl, filename });
  const result = await supabase.from('pdfs').insert([{ 
    user_id: userId, 
    quiz_id: quizId, 
    pdf_url: pdfUrl,
    filename 
  }]).select().single();
  console.log('PDF record creation result:', result);
  return result;
}

export async function getPdfs(userId: string) {
  const result = await supabase.from('pdfs').select('*').eq('user_id', userId);
  console.log('Get PDFs result:', result);
  return result;
}

export async function getPdfByQuiz(userId: string, quizId: string) {
  const result = await supabase.from('pdfs').select('*').eq('user_id', userId).eq('quiz_id', quizId).single();
  console.log('Get PDF by quiz result:', result);
  return result;
} 