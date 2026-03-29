import { supabase } from './supabaseClient';

export const getDatasets = async (institutionId) => {
  let query = supabase.from('datasets').select('*').order('created_at', { ascending: false });
  if (institutionId) query = query.eq('institution_id', institutionId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const checkDuplicate = async (hashValue, institutionId) => {
  let query = supabase.from('datasets').select('*').eq('hash_value', hashValue);
  if (institutionId) query = query.eq('institution_id', institutionId);
  const { data, error } = await query.single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "Rows not found" which is fine
    throw error;
  }
  
  return data; 
};

export const insertDatasetMetadata = async (datasetData) => {
  const { data, error } = await supabase
    .from('datasets')
    .insert([datasetData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const logDownload = async (logData) => {
  const { data, error } = await supabase
    .from('downloads')
    .insert([logData]);
  if (error) throw error;
  return data;
};

export const hasDownloadedBefore = async (datasetId, userId) => {
  const { data, error } = await supabase
    .from('downloads')
    .select('id')
    .eq('dataset_id', datasetId)
    .eq('user_id', userId)
    .limit(1);

  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  
  // Return true if any records are found, data is an array
  return data && data.length > 0;
};

export const getDownloads = async (institutionId) => {
  const { data: downloads, error } = await supabase.from('downloads').select('*').order('requested_at', { ascending: false });
  if (error) throw error;
  if (!downloads || downloads.length === 0) return [];

  const datasetIds = [...new Set(downloads.map(d => d.dataset_id))];
  
  let datasetQuery = supabase.from('datasets').select('id, file_name, institution_id').in('id', datasetIds);
  if (institutionId) {
    datasetQuery = datasetQuery.eq('institution_id', institutionId);
  }
  
  const { data: datasets, error: dsError } = await datasetQuery;
  if (dsError) throw dsError;
  
  const validDatasetIds = new Set(datasets.map(ds => ds.id));
  const datasetsMap = datasets.reduce((acc, ds) => { acc[ds.id] = ds; return acc; }, {});
  
  return downloads
    .filter(d => validDatasetIds.has(d.dataset_id))
    .map(d => ({ ...d, datasets: datasetsMap[d.dataset_id] }));
};

export const getEnergyLogs = async (institutionId) => {
  const { data: logs, error } = await supabase.from('energy_logs').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  if (!logs || logs.length === 0) return [];
  
  const datasetIds = [...new Set(logs.map(log => log.dataset_id))];
  
  let datasetQuery = supabase.from('datasets').select('id, file_name, institution_id').in('id', datasetIds);
  if (institutionId) {
    datasetQuery = datasetQuery.eq('institution_id', institutionId);
  }
  
  const { data: datasets, error: dsError } = await datasetQuery;
  if (dsError) throw dsError;
  
  const validDatasetIds = new Set(datasets.map(ds => ds.id));
  const datasetsMap = datasets.reduce((acc, ds) => { acc[ds.id] = ds; return acc; }, {});
  
  return logs
    .filter(log => validDatasetIds.has(log.dataset_id))
    .map(log => ({ ...log, datasets: datasetsMap[log.dataset_id] }));
};

export const logEnergySavings = async (energyData) => {
  const { data, error } = await supabase
    .from('energy_logs')
    .insert([energyData]);
  if (error) throw error;
  return data;
};

export const getDashboardStats = async (institutionId) => {
  if (!institutionId) {
    return {
      totalDatasets: 0, totalDownloads: 0, duplicatePrevented: 0,
      totalEnergySaved: 0, totalCo2Reduced: 0, totalBandwidthSaved: 0
    };
  }

  // 1. Get Datasets for this institution
  const { data: datasets, error: dsError } = await supabase.from('datasets')
    .select('id')
    .eq('institution_id', institutionId);
    
  if (dsError || !datasets || datasets.length === 0) {
    return {
      totalDatasets: 0, totalDownloads: 0, duplicatePrevented: 0,
      totalEnergySaved: 0, totalCo2Reduced: 0, totalBandwidthSaved: 0
    };
  }
  
  const datasetIds = datasets.map(ds => ds.id);
  const totalDatasets = datasets.length;

  // 2. Get Downloads linked to these datasets
  const { data: downloads } = await supabase.from('downloads')
    .select('id, duplicate_detected')
    .in('dataset_id', datasetIds);
    
  const totalDownloads = downloads ? downloads.length : 0;
  const duplicatePrevented = downloads ? downloads.filter(d => d.duplicate_detected).length : 0;
  
  // 3. Get Energy Logs linked to these datasets
  const { data: energyLogs } = await supabase.from('energy_logs')
    .select('energy_saved_kwh, co2_reduction, bandwidth_saved_mb')
    .in('dataset_id', datasetIds);

  let totalEnergySaved = 0;
  let totalCo2Reduced = 0;
  let totalBandwidthSaved = 0;
  
  if (energyLogs) {
    energyLogs.forEach(log => {
      totalEnergySaved += log.energy_saved_kwh || 0;
      totalCo2Reduced += log.co2_reduction || 0;
      totalBandwidthSaved += log.bandwidth_saved_mb || 0;
    });
  }

  return {
    totalDatasets,
    totalDownloads,
    duplicatePrevented,
    totalEnergySaved: parseFloat(totalEnergySaved.toFixed(4)),
    totalCo2Reduced: parseFloat(totalCo2Reduced.toFixed(4)),
    totalBandwidthSaved: parseFloat(totalBandwidthSaved.toFixed(2))
  };
};

export const fetchInstitutionUsers = async (institutionId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('institution_id', institutionId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const deleteUserRecord = async (userId, institutionId) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)
    .eq('institution_id', institutionId); // extra safety check
    
  if (error) throw error;
  return true;
};
