async function checkCategories() {
  try {
    const apiBase = 'https://ayurveda-saranga-backend.vercel.app/api';
    const catRes = await fetch(`${apiBase}/categories`);
    const categories = await catRes.json();
    console.log(`Found ${categories.length} categories.`);
    
    for (const cat of categories) {
      const prodRes = await fetch(`${apiBase}/products?category=${encodeURIComponent(cat.name)}&limit=50`);
      const prodData = await prodRes.json();
      const products = Array.isArray(prodData) ? prodData : (prodData?.products || []);
      console.log(`Category: ${cat.name} (${cat.id}) has ${products.length} products`);
    }
  } catch (err) {
    console.error('Error fetching category/product data:', err);
  }
}
checkCategories();
