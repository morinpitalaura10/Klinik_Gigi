const { createClient } = require('@supabase/supabase-client');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.rpc('get_foreign_keys');
  if (error) {
    const { data: qData, error: qErr } = await supabase.from('tb_kwitansi').select('doctor_id').limit(1);
    console.log('Error fetching keys, trying a sample row:', qData, qErr);
  } else {
    console.log(data);
  }
}
check();
