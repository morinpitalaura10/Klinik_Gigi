const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://tgcwbaugbssieyjtqnxd.supabase.co';
const supabaseKey = 'sb_publishable_s4CcM3wp39v2UnmH8RypNA__uRUfmNH';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('tb_rekam_medis').select('layanan').limit(5);
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Layanan values:', data);
  }
}
check();
