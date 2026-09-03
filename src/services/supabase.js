import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://huipurlxufktnwbysgfr.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_AKGLxl2IfTT1t2MD73hkkA_Esl7NnVc';

export const supabase = createClient(supabaseUrl, supabaseKey);

const RECORD_ID = 'primary_user';

/**
 * Fetch student data from Supabase
 */
export async function fetchCloudData() {
  try {
    const { data, error } = await supabase
      .from('senior_os_data')
      .select('payload, updated_at')
      .eq('id', RECORD_ID)
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetch error:', error.message);
      return { success: false, error: error.message };
    }

    if (data && data.payload) {
      return { success: true, data: data.payload, updatedAt: data.updated_at };
    }

    return { success: true, data: null };
  } catch (err) {
    console.warn('Supabase fetch exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Save / Upsert student data into Supabase
 */
export async function saveCloudData(payload) {
  try {
    const { error } = await supabase
      .from('senior_os_data')
      .upsert(
        {
          id: RECORD_ID,
          payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('Supabase save error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.warn('Supabase save exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Test connectivity and whether the table exists
 */
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('senior_os_data')
      .select('id')
      .limit(1);

    if (error) {
      return { ok: false, msg: error.message };
    }
    return { ok: true, msg: 'Connected to Supabase successfully!' };
  } catch (err) {
    return { ok: false, msg: err.message };
  }
}
