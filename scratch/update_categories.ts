
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function updateCategories() {
  console.log('Updating categories...');
  
  // Update Clothing to Mobile Covers
  const { data: clothing, error: clothingError } = await supabase
    .from('categories')
    .update({ name: 'Mobile Covers', slug: 'mobile-covers' })
    .eq('slug', 'clothing')
    .select();

  if (clothingError) console.error('Error updating clothing:', clothingError);
  else console.log('Updated clothing to mobile-covers:', clothing);

  // Update Home Decor to Flowers Pot
  const { data: homeDecor, error: homeDecorError } = await supabase
    .from('categories')
    .update({ name: 'Flowers Pot', slug: 'flowers-pot' })
    .eq('slug', 'home-decor')
    .select();

  if (homeDecorError) console.error('Error updating home-decor:', homeDecorError);
  else console.log('Updated home-decor to flowers-pot:', homeDecor);
}

updateCategories();
