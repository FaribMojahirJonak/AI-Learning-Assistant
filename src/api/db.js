import { supabase } from '../supabaseClient';
// LESSONS
export async function createLesson(title, description, topic, userId) {
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
export async function getLessonsByUser(userId) {
    const result = await supabase.from('lessons').select('*').eq('created_by', userId);
    console.log('Get lessons by user result:', result);
    return result;
}
// QUIZZES
export async function createQuiz(lessonId, title, questions) {
    console.log('Creating quiz with data:', { lessonId, title, questions });
    const result = await supabase.from('quizzes').insert([{
            lesson_id: lessonId,
            title,
            questions
        }]).select().single();
    console.log('Quiz creation result:', result);
    return result;
}
export async function getQuizzes(lessonId) {
    const result = await supabase.from('quizzes').select('*').eq('lesson_id', lessonId);
    console.log('Get quizzes result:', result);
    return result;
}
export async function getQuizById(quizId) {
    const result = await supabase.from('quizzes').select('*').eq('id', quizId).single();
    console.log('Get quiz by ID result:', result);
    return result;
}
// RESULTS
export async function createResult(userId, quizId, answers, score) {
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
export async function getResults(userId) {
    const result = await supabase.from('results').select('*').eq('user_id', userId);
    console.log('Get results result:', result);
    return result;
}
export async function getResultByQuiz(userId, quizId) {
    const result = await supabase.from('results').select('*').eq('user_id', userId).eq('quiz_id', quizId).single();
    console.log('Get result by quiz result:', result);
    return result;
}
// PDFS
export async function savePdfRecord(userId, quizId, pdfUrl, filename) {
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
export async function getPdfs(userId) {
    const result = await supabase.from('pdfs').select('*').eq('user_id', userId);
    console.log('Get PDFs result:', result);
    return result;
}
export async function getPdfByQuiz(userId, quizId) {
    const result = await supabase.from('pdfs').select('*').eq('user_id', userId).eq('quiz_id', quizId).single();
    console.log('Get PDF by quiz result:', result);
    return result;
}
