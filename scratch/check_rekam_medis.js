const { createClient } = require('@supabase/supabase-client');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'tb_rekam_medis' });
  if (error) {
    // Fallback simply try to fetch one row
    const { data: row } = await supabase.from('tb_rekam_medis').select('*').limit(1);
    console.log('Sample row from tb_rekam_medis:', row);
  } else {
    console.log('Columns for tb_rekam_medis:', data);
  }
}

checkSchema();
