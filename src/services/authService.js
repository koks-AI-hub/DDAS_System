import { supabase } from './supabaseClient';
import { createClient } from '@supabase/supabase-js';

export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Construct profile primarily from user_metadata to avoid relying heavily on public.users
    const profile = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || 'User',
      role: user.user_metadata?.role || 'user',
      institution_id: user.user_metadata?.institution_id
    };

    // Attach institution details if available
    if (profile.institution_id) {
      const { data: inst } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', profile.institution_id)
        .single();
      if (inst) {
        profile.institutions = inst;
      }
    }
    
    return { ...user, profile };
  }
  return null;
};

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};

export const getInstitutions = async () => {
  const { data, error } = await supabase
    .from('institutions')
    .select('*')
    .order('institution_name', { ascending: true });
    
  if (error) throw error;
  return data;
};

export const registerInstitution = async ({ institutionName, adminName, adminEmail, password }) => {
  // 1. Create the institution record
  const { data: institution, error: instError } = await supabase
    .from('institutions')
    .insert([{ institution_name: institutionName }])
    .select()
    .single();

  if (instError) throw instError;

  // 2. Register the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: adminEmail,
    password: password,
    options: {
      data: {
        name: adminName,
        role: 'admin',
        institution_id: institution.id
      }
    }
  });

  if (authError) {
    // Cleanup if auth fails
    await supabase.from('institutions').delete().eq('id', institution.id);
    throw authError;
  }

  // 3. Insert user profile into users table
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        { 
          id: authData.user.id, 
          email: adminEmail,
          name: adminName,
          institution_id: institution.id 
          // Omitted role intentionally because it may cause missing column errors
        }
      ]);

    if (profileError) {
       console.warn("Continuing via metadata despite public.users table error:", profileError.message);
    }
  }

  return { institution, user: authData.user };
};

// Create a new user as an admin without logging the admin out.
// Warning: If Supabase prevents signing up without auto-login, this workaround 
// instantiates a secondary client just for the sign-up request.
export const createInstitutionUser = async ({ name, email, password, role, institutionId }) => {
  // Try to use a secondary client to prevent overriding the current session
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  // We need to create a new client instance
  const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Don't persist this temporary session
      autoRefreshToken: false,
    }
  });

  // 1. Register the user in Supabase Auth using the temp client
  const { data: authData, error: authError } = await tempClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        role: role || 'user',
        institution_id: institutionId
      }
    }
  });

  if (authError) throw authError;

  // 2. Insert the user profile into the users table using the main authenticated client
  // (Assuming the main client (admin) has RLS permissions to insert into users table)
  let profileData = { id: authData.user?.id, email, name, role: role || 'user', institution_id: institutionId };
  
  if (authData.user) {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([
        { 
          id: authData.user.id, 
          email: email,
          name: name,
          institution_id: institutionId 
          // Omitted role intentionally
        }
      ])
      .select()
      .single();

    if (profileError) {
       console.warn("Continuing via metadata for new user despite public.users table error:", profileError.message);
    } else if (profile) {
       profileData = { ...profileData, ...profile };
    }
    
    return { user: authData.user, profile: profileData };
  }
  
  return null;
};
