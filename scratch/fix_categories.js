
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const UPDATES = [
  { slug: 'gajre', name: 'Gajray', image_url: '/gajry1.PNG' },
  { slug: 'mobile-covers', image_url: '/mobilecover.jpg' },
  { slug: 'keychains', image_url: '/keychain.jpeg' },
];

async function updateCategories() {
  console.log('Updating categories in database...');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing environment variables!');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    return;
  }

  for (const up of UPDATES) {
    const { data, error } = await supabase
      .from('categories')
      .update({ 
        ...(up.name ? { name: up.name } : {}),
        image_url: up.image_url 
      })
      .eq('slug', up.slug)
      .select();

    if (error) {
      console.error(`Error updating ${up.slug}:`, error);
    } else {
      console.log(`Updated ${up.slug}:`, data?.length ?? 0);
    }
  }
}

updateCategories();
