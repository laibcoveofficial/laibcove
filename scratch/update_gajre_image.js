
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Updating Gajray image to gajry4.PNG...');
  const { error } = await supabase
    .from('categories')
    .update({ image_url: '/gajry4.PNG', name: 'Gajray' })
    .eq('slug', 'gajre');
  
  if (error) console.error(error);
  else console.log('Successfully updated Gajray image.');
}

run();
