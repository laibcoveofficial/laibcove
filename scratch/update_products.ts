
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function updateProducts() {
  console.log('Checking for products with old category slugs...');
  
  // Update products referencing clothing
  const { data: clothingProducts, error: clothingError } = await supabase
    .from('products')
    .update({ category_slug: 'mobile-covers' })
    .eq('category_slug', 'clothing')
    .select();

  if (clothingError) console.error('Error updating clothing products:', clothingError);
  else console.log('Updated clothing products:', clothingProducts?.length ?? 0);

  // Update products referencing home-decor
  const { data: homeDecorProducts, error: homeDecorError } = await supabase
    .from('products')
    .update({ category_slug: 'flowers-pot' })
    .eq('category_slug', 'home-decor')
    .select();

  if (homeDecorError) console.error('Error updating home-decor products:', homeDecorError);
  else console.log('Updated home-decor products:', homeDecorProducts?.length ?? 0);
}

updateProducts();
