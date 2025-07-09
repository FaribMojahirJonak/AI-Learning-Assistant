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
export const createLesson = async (title: string, description: string, topic: string, userId: string) => {
  const { data, error } = await supabase
    .from('lessons')
    .insert([{ title, description, topic, created_by: userId }])
    .select()
    .single();

  if (error) {
    console.error('Error creating lesson:', error);
    return { data: null, error };
  }

  return { data, error: null };
};

export const getLessons = async () => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting lessons:', error);
    return { data: null, error };
  }

  return { data, error: null };
};

export const getLessonsByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting lessons by user:', error);
    return { data: null, error };
  }

  return { data, error: null };
};

// QUIZZES
export const createQuiz = async (lessonId: string, title: string, questions: any) => {
  const { data, error } = await supabase
    .from('quizzes')
    .insert([{ lesson_id: lessonId, title, questions }])
    .select()
    .single();

  if (error) {
    console.error('Error creating quiz:', error);
    return { data: null, error };
  }

  return { data, error: null };
};

export const getQuizzes = async () => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting quizzes:', error);
    return { data: null, error };
  }

  return { data, error: null };
};

export const getQuizById = async (quizId: string) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single();

  if (error) {
    console.error('Error getting quiz by ID:', error);
    return { data: null, error };
  }

  return { data, error: null };
};

// RESULTS
export const createResult = async (userId: string, quizId: string, answers: any, score: number) => {
  const { data, error } = await supabase
    .from('results')
    .insert([{ user_id: userId, quiz_id: quizId, answers, score }])
    .select()
    .single();

  if (error) {
    console.error('Error creating result:', error);
    return { data: null, error };
  }

  return { data, error: null };
};

export const getResults = async () => {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting results:', error);
    return { data: null, error };
  }

  return { data, error: null };
};

export const getResultByQuiz = async (quizId: string) => {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('quiz_id', quizId)
    .single();

  if (error) {
    console.error('Error getting result by quiz:', error);
    return { data: null, error };
  }

  return { data, error: null };
};

// PDFS
export const savePdfRecord = async (userId: string, quizId: string, pdfUrl: string, filename: string) => {
  const { data, error } = await supabase
    .from('pdfs')
    .insert([{ user_id: userId, quiz_id: quizId, pdf_url: pdfUrl, filename }])
    .select()
    .single();

  if (error) {
    console.error('Error saving PDF record:', error);
    return { data: null, error };
  }

  return { data, error: null };
};

export const getPdfs = async () => {
  const { data, error } = await supabase
    .from('pdfs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting PDFs:', error);
    return { data: null, error };
  }

  return { data, error: null };
};

export const getPdfByQuiz = async (quizId: string) => {
  const { data, error } = await supabase
    .from('pdfs')
    .select('*')
    .eq('quiz_id', quizId)
    .single();

  if (error) {
    console.error('Error getting PDF by quiz:', error);
    return { data: null, error };
  }

  return { data, error: null };
}; 