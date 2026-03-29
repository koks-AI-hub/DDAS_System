import { supabase } from './supabaseClient';

export const uploadFile = async (file, path) => {
  const { data, error } = await supabase.storage
    .from('datasets')
    .upload(path, file);
    
  if (error) throw error;
  return data;
};

export const downloadFileUrl = async (path, forceDownload = true) => {
  const options = forceDownload ? { download: true } : {};
  
  const { data, error } = await supabase.storage
    .from('datasets')
    .createSignedUrl(path, 60 * 60, options); // 1 hour expiry
    
  if (error) throw error;
  return data.signedUrl;
};

export const downloadFile = async (path) => {
  const { data, error } = await supabase.storage
    .from('datasets')
    .download(path);
    
  if (error) throw error;
  return data; // Returns a Blob
};
