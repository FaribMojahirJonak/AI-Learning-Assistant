import { supabase } from '../supabaseClient';
export async function uploadPdf(userId, quizId, file) {
    const filePath = `${userId}/${quizId}/${file.name}`;
    const { data, error } = await supabase.storage
        .from('assessment-pdfs')
        .upload(filePath, file, { upsert: true });
    if (error)
        return { error };
    // Get public URL
    const { data: publicUrlData } = supabase.storage
        .from('assessment-pdfs')
        .getPublicUrl(filePath);
    return { url: publicUrlData?.publicUrl, error: null };
}
export function getPdfPublicUrl(userId, quizId, fileName) {
    const filePath = `${userId}/${quizId}/${fileName}`;
    const { data } = supabase.storage
        .from('assessment-pdfs')
        .getPublicUrl(filePath);
    return data.publicUrl;
}
