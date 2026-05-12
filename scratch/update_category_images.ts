
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const MAPPINGS = [
  { slug: 'bags', image_url: '/bag.webp' },
  { slug: 'gajre', image_url: '/gajry1.PNG' },
  { slug: 'flowers', image_url: '/flowers.PNG' },
  { slug: 'bouquets', image_url: '/bouqeet1.jpeg' },
  { slug: 'mobile-covers', image_url: '/mobilecover.jfif' },
  { slug: 'flowers-pot', image_url: '/flowerpot.jpeg' },
  { slug: 'baby', image_url: '/babyitems.jpg' },
  { slug: 'keychains', image_url: '/flower-keychains.PNG' },
];

async function updateCategoryImageUrls() {
  console.log('Updating category image URLs in database...');
  
  for (const mapping of MAPPINGS) {
    const { data, error } = await supabase
      .from('categories')
      .update({ image_url: mapping.image_url })
      .eq('slug', mapping.slug)
      .select();

    if (error) {
      console.error(`Error updating ${mapping.slug}:`, error);
    } else {
      console.log(`Updated ${mapping.slug} to ${mapping.image_url}:`, data?.length ?? 0);
    }
  }
}

updateCategoryImageUrls();
