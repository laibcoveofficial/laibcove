
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Updating category images in DB...');
  
  // Update bags
  await supabase.from('categories').update({ image_url: '/bag.jpeg' }).eq('slug', 'bags');
  
  // Update baby
  await supabase.from('categories').update({ image_url: '/baby.jpeg' }).eq('slug', 'baby');
  
  // Ensure Gajray spelling is consistent in DB if not already
  await supabase.from('categories').update({ name: 'Gajray' }).eq('slug', 'gajre');

  console.log('Done.');
}

run();
