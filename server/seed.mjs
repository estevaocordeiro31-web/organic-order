import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.execute(sql`DELETE FROM order_items`);
  await db.execute(sql`DELETE FROM orders`);
  await db.execute(sql`DELETE FROM menu_items`);
  await db.execute(sql`DELETE FROM menu_categories`);
  await db.execute(sql`DELETE FROM \`tables\``);

  // Seed categories
  const categories = [
    { nameEn: "Coffees", namePt: "Cafés", slug: "coffees", icon: "Coffee", sortOrder: 1 },
    { nameEn: "Lattes & Hot Drinks", namePt: "Lattes e Bebidas Quentes", slug: "lattes", icon: "CupSoda", sortOrder: 2 },
    { nameEn: "Teas", namePt: "Chás", slug: "teas", icon: "Leaf", sortOrder: 3 },
    { nameEn: "Fresh Juices", namePt: "Sucos", slug: "juices", icon: "Citrus", sortOrder: 4 },
    { nameEn: "Toasts", namePt: "Toasts", slug: "toasts", icon: "Sandwich", sortOrder: 5 },
    { nameEn: "Savory Bites", namePt: "Salgados", slug: "savory", icon: "Croissant", sortOrder: 6 },
    { nameEn: "Burgers & Sandwiches", namePt: "Hambúrgueres e Sanduíches", slug: "burgers", icon: "Beef", sortOrder: 7 },
    { nameEn: "Salads & Bowls", namePt: "Saladas e Bowls", slug: "salads", icon: "Salad", sortOrder: 8 },
    { nameEn: "Main Courses", namePt: "Refeições", slug: "mains", icon: "UtensilsCrossed", sortOrder: 9 },
    { nameEn: "Desserts", namePt: "Sobremesas", slug: "desserts", icon: "IceCreamCone", sortOrder: 10 },
    { nameEn: "Soft Drinks", namePt: "Bebidas Não Alcoólicas", slug: "softdrinks", icon: "GlassWater", sortOrder: 11 },
  ];

  for (const cat of categories) {
    await db.execute(sql`INSERT INTO menu_categories (nameEn, namePt, slug, icon, sortOrder, active) VALUES (${cat.nameEn}, ${cat.namePt}, ${cat.slug}, ${cat.icon}, ${cat.sortOrder}, true)`);
  }

  // Get category IDs
  const catRows = await db.execute(sql`SELECT id, slug FROM menu_categories`);
  const catMap = {};
  for (const row of catRows[0]) {
    catMap[row.slug] = row.id;
  }

  // Seed menu items
  const items = [
    // === COFFEES ===
    { cat: "coffees", nameEn: "Espresso", namePt: "Café Espresso", descEn: "A rich, bold single shot of our specialty espresso. Smooth and intense.", descPt: "Dose única de espresso especial", price: "8.00", tags: "hot,classic" },
    { cat: "coffees", nameEn: "Double Espresso", namePt: "Café Espresso Duplo", descEn: "Two shots of our signature espresso for an extra kick of energy.", descPt: "Dose dupla de espresso", price: "13.90", tags: "hot,classic" },
    { cat: "coffees", nameEn: "Carioca Espresso", namePt: "Espresso Carioca", descEn: "A lighter espresso with extra water, Brazilian-style. Smooth and mellow.", descPt: "Espresso mais suave com água extra", price: "12.90", tags: "hot,classic" },
    { cat: "coffees", nameEn: "Macchiato", namePt: "Macchiatto", descEn: "Espresso marked with a dollop of steamed milk foam. Classic Italian style.", descPt: "Espresso com espuma de leite", price: "13.90", tags: "hot,classic" },
    { cat: "coffees", nameEn: "Pour Over V60", namePt: "Café Método V60", descEn: "Hand-poured specialty coffee using the V60 method. Clean and aromatic.", descPt: "Café coado no método V60", price: "18.90", tags: "hot,specialty" },
    { cat: "coffees", nameEn: "Chemex Brew", namePt: "Chemex", descEn: "Specialty coffee brewed in a Chemex. Crystal clear with complex flavors.", descPt: "Café coado na Chemex", price: "23.90", tags: "hot,specialty" },
    { cat: "coffees", nameEn: "French Press Coffee", namePt: "Café Prensado", descEn: "Full-bodied coffee prepared in a French press. Rich and textured.", descPt: "Café na prensa francesa", price: "23.90", tags: "hot,specialty" },
    { cat: "coffees", nameEn: "Orange Coffee (Iced)", namePt: "Orange Coffee Gelado", descEn: "A refreshing blend of espresso and fresh orange juice over ice. Surprisingly delicious!", descPt: "Espresso com suco de laranja gelado", price: "19.90", tags: "cold,specialty" },

    // === LATTES & HOT DRINKS ===
    { cat: "lattes", nameEn: "Cappuccino", namePt: "Capuccino", descEn: "Classic cappuccino with equal parts espresso, steamed milk and foam.", descPt: "Cappuccino clássico", price: "14.90", tags: "hot,classic" },
    { cat: "lattes", nameEn: "Organic Cappuccino", namePt: "Capuccino Organic", descEn: "Our signature cappuccino made with organic milk and specialty beans.", descPt: "Cappuccino com leite orgânico", price: "15.90", tags: "hot,signature" },
    { cat: "lattes", nameEn: "Cappuccino (Plant-Based Milk)", namePt: "Capuccino Leite Vegetal", descEn: "Creamy cappuccino made with your choice of plant-based milk. Dairy-free delight.", descPt: "Cappuccino com leite vegetal", price: "18.90", tags: "hot,vegan" },
    { cat: "lattes", nameEn: "Mocha Organic", namePt: "Mocha Organic", descEn: "Espresso blended with rich chocolate and steamed milk. A cozy treat.", descPt: "Espresso com chocolate e leite", price: "18.90", tags: "hot,signature" },
    { cat: "lattes", nameEn: "Iced Coffee Organic", namePt: "Iced Coffee Organic", descEn: "Our signature cold coffee blend over ice. Smooth, sweet, and refreshing.", descPt: "Café gelado orgânico", price: "20.90", tags: "cold,signature" },
    { cat: "lattes", nameEn: "Iced Coffee Caramel", namePt: "Iced Coffee Caramel", descEn: "Chilled espresso with caramel syrup and milk over ice. Sweet perfection.", descPt: "Café gelado com caramelo", price: "20.90", tags: "cold,sweet" },
    { cat: "lattes", nameEn: "Pistachino", namePt: "Pistachino", descEn: "A creamy pistachio-flavored latte. Nutty, smooth, and irresistible.", descPt: "Latte de pistache", price: "17.90", tags: "hot,specialty" },
    { cat: "lattes", nameEn: "Nuttelino", namePt: "Nuttelino", descEn: "Espresso with hazelnut chocolate cream. A Nutella lover's dream.", descPt: "Espresso com creme de avelã", price: "16.90", tags: "hot,sweet" },
    { cat: "lattes", nameEn: "Affogato", namePt: "Afogatto", descEn: "A scoop of dairy-free ice cream drowned in hot espresso. Simple bliss.", descPt: "Sorvete com espresso quente", price: "19.90", tags: "hot,dessert" },
    { cat: "lattes", nameEn: "Hot Chocolate", namePt: "Chocolate Quente", descEn: "Rich and creamy hot chocolate made with real cocoa. Comfort in a cup.", descPt: "Chocolate quente cremoso", price: "15.90", tags: "hot,sweet" },
    { cat: "lattes", nameEn: "Matcha Latte (Hot)", namePt: "Matcha Quente", descEn: "Premium Japanese matcha whisked with steamed milk. Earthy and energizing.", descPt: "Matcha quente com leite", price: "15.90", tags: "hot,healthy" },
    { cat: "lattes", nameEn: "Iced Matcha Latte", namePt: "Matchá Gelado", descEn: "Chilled matcha with milk over ice. A refreshing green tea experience.", descPt: "Matcha gelado com leite", price: "16.90", tags: "cold,healthy" },
    { cat: "lattes", nameEn: "Golden Coffee (Iced)", namePt: "Golden Coffee Gelado", descEn: "Iced coffee infused with turmeric and spices. Anti-inflammatory and delicious.", descPt: "Café gelado com cúrcuma", price: "20.90", tags: "cold,healthy" },

    // === TEAS ===
    { cat: "teas", nameEn: "American Tea", namePt: "American Tea", descEn: "Classic brewed tea served hot. Simple and comforting.", descPt: "Chá americano clássico", price: "12.90", tags: "hot,classic" },
    { cat: "teas", nameEn: "Chamomile & Orange Infusion", namePt: "Infusão Camomila com Laranja", descEn: "Soothing chamomile blended with fresh orange peel. Calming and aromatic.", descPt: "Infusão de camomila com laranja", price: "14.90", tags: "hot,herbal" },
    { cat: "teas", nameEn: "Apple Infusion", namePt: "Infusão Maçã", descEn: "Sweet apple-infused herbal tea. Naturally fruity and caffeine-free.", descPt: "Infusão de maçã", price: "14.90", tags: "hot,herbal" },
    { cat: "teas", nameEn: "Hibiscus & Cocoa Infusion", namePt: "Infusão Hibisco com Cacau", descEn: "A unique blend of hibiscus flowers and cocoa nibs. Tart and chocolatey.", descPt: "Infusão de hibisco com cacau", price: "14.90", tags: "hot,herbal" },
    { cat: "teas", nameEn: "Mint & Lemongrass Infusion", namePt: "Infusão Hortelã, Capim Limão", descEn: "Fresh mint and lemongrass steeped together. Refreshing and digestive.", descPt: "Infusão de hortelã com capim limão", price: "14.90", tags: "hot,herbal" },
    { cat: "teas", nameEn: "Iced Strawberry & Apple Tea", namePt: "Chá Gelado de Morango, Maçã", descEn: "Chilled fruit tea with strawberry and apple. Sweet and refreshing.", descPt: "Chá gelado de morango e maçã", price: "15.90", tags: "cold,fruity" },
    { cat: "teas", nameEn: "Iced Hibiscus Tea", namePt: "Chá Gelado de Hibisco", descEn: "Refreshing cold hibiscus tea. Tart, vibrant, and full of antioxidants.", descPt: "Chá gelado de hibisco", price: "13.90", tags: "cold,healthy" },
    { cat: "teas", nameEn: "Iced Lemon & Ginger Tea", namePt: "Chá Gelado Limão com Gengibre", descEn: "Zesty lemon and spicy ginger served cold. A natural immunity booster.", descPt: "Chá gelado de limão com gengibre", price: "15.90", tags: "cold,healthy" },
    { cat: "teas", nameEn: "Pineapple Cranberry Infusion", namePt: "Pineapple Infusão", descEn: "Tropical pineapple with cranberry and mint, pressed fresh. Exotic and tangy.", descPt: "Infusão de abacaxi com cranberry e hortelã", price: "15.90", tags: "cold,fruity" },

    // === JUICES ===
    { cat: "juices", nameEn: "Fresh Orange Juice", namePt: "Suco de Laranja", descEn: "Freshly squeezed orange juice. Pure sunshine in a glass.", descPt: "Suco de laranja natural", price: "16.90", tags: "fresh,classic" },
    { cat: "juices", nameEn: "Strawberry Juice", namePt: "Suco de Morango", descEn: "Sweet and refreshing strawberry juice made with fresh berries.", descPt: "Suco de morango natural", price: "14.00", tags: "fresh,fruity" },
    { cat: "juices", nameEn: "Pineapple Juice", namePt: "Suco de Abacaxi", descEn: "Tropical pineapple juice, freshly pressed. Sweet and tangy.", descPt: "Suco de abacaxi natural", price: "14.00", tags: "fresh,tropical" },
    { cat: "juices", nameEn: "Pineapple & Orange Blend", namePt: "Suco Abacaxi com Laranja", descEn: "A tropical mix of pineapple and orange. Vitamin C powerhouse.", descPt: "Suco de abacaxi com laranja", price: "16.90", tags: "fresh,tropical" },
    { cat: "juices", nameEn: "Strawberry & Orange Blend", namePt: "Suco Morango com Laranja", descEn: "Fresh strawberries blended with orange juice. Fruity and vibrant.", descPt: "Suco de morango com laranja", price: "16.90", tags: "fresh,fruity" },
    { cat: "juices", nameEn: "Detox Green Juice", namePt: "Suco Detox", descEn: "A cleansing green juice with leafy greens, apple, and ginger. Feel renewed.", descPt: "Suco verde detox", price: "16.90", tags: "fresh,healthy" },
    { cat: "juices", nameEn: "Thermogenic Juice", namePt: "Suco Termogênico", descEn: "A metabolism-boosting blend with ginger, lemon, and natural thermogenics.", descPt: "Suco termogênico", price: "16.00", tags: "fresh,healthy" },
    { cat: "juices", nameEn: "Anti-Inflammatory Juice", namePt: "Suco Anti-Inflamatório", descEn: "A healing blend with turmeric, pineapple, and anti-inflammatory ingredients.", descPt: "Suco anti-inflamatório", price: "16.90", tags: "fresh,healthy" },
    { cat: "juices", nameEn: "Power Juice", namePt: "Suco Turbinado", descEn: "Passion fruit, mango, and superfoods blended for maximum energy.", descPt: "Suco turbinado de maracujá e manga", price: "16.90", tags: "fresh,energy" },
    { cat: "juices", nameEn: "Revitalizing Juice", namePt: "Revitalizante", descEn: "A revitalizing fruit blend to recharge your body and mind.", descPt: "Suco revitalizante", price: "16.90", tags: "fresh,healthy" },

    // === TOASTS ===
    { cat: "toasts", nameEn: "Butter Toast", namePt: "Toast com Manteiga", descEn: "Crispy artisan toast with creamy butter. Simple and satisfying.", descPt: "Toast com manteiga", price: "14.90", tags: "classic" },
    { cat: "toasts", nameEn: "Ghee Butter Toast", namePt: "Toast com Manteiga Ghee", descEn: "Toast with clarified ghee butter. Lactose-free and richly flavored.", descPt: "Toast com manteiga ghee", price: "17.90", tags: "healthy,lactose-free" },
    { cat: "toasts", nameEn: "Vegan Butter Toast", namePt: "Toast com Manteiga Vegana", descEn: "Toast with plant-based butter. Crispy, golden, and 100% vegan.", descPt: "Toast com manteiga vegana", price: "17.90", tags: "vegan" },
    { cat: "toasts", nameEn: "Cream Cheese Toast", namePt: "Toast com Requeijão", descEn: "Warm toast topped with creamy Brazilian-style cream cheese.", descPt: "Toast com requeijão", price: "20.90", tags: "classic" },
    { cat: "toasts", nameEn: "Avocado & Egg Toast", namePt: "Toast de Avocado com Ovos", descEn: "Smashed avocado on toast topped with perfectly cooked eggs. A brunch favorite.", descPt: "Toast de abacate com ovos", price: "34.90", tags: "healthy,brunch" },
    { cat: "toasts", nameEn: "Mushroom & Egg Toast", namePt: "Toast com Cogumelos e Ovos", descEn: "Sautéed mushrooms and eggs on crispy toast. Earthy and delicious.", descPt: "Toast com cogumelos e ovos", price: "35.90", tags: "vegetarian" },
    { cat: "toasts", nameEn: "Chicken & Cream Cheese Toast", namePt: "Toast de Frango com Requeijão", descEn: "Shredded chicken with melted cream cheese on toast. Hearty and comforting.", descPt: "Toast de frango com requeijão", price: "34.90", tags: "protein" },
    { cat: "toasts", nameEn: "Grilled Cheese Toast", namePt: "Toast de Queijo Quente", descEn: "Classic grilled cheese on artisan bread. Melty, golden perfection.", descPt: "Toast de queijo quente", price: "34.90", tags: "classic,vegetarian" },
    { cat: "toasts", nameEn: "Egg & Cheese Toast", namePt: "Toast Ovos com Queijo", descEn: "Scrambled eggs with melted cheese on toast. A breakfast classic.", descPt: "Toast de ovos com queijo", price: "34.90", tags: "classic,brunch" },

    // === SAVORY BITES ===
    { cat: "savory", nameEn: "Cheese Bread (Pão de Queijo)", namePt: "Pão de Queijo", descEn: "Traditional Brazilian cheese bread. Warm, chewy, and gluten-free.", descPt: "Pão de queijo tradicional", price: "10.00", tags: "gluten-free,classic" },
    { cat: "savory", nameEn: "Stuffed Cheese Bread", namePt: "Pão de Queijo Recheado", descEn: "Our cheese bread stuffed with a savory filling. Extra indulgent.", descPt: "Pão de queijo recheado", price: "18.90", tags: "gluten-free" },
    { cat: "savory", nameEn: "Chicken Croquette", namePt: "Coxinha de Frango", descEn: "Classic Brazilian chicken croquette. Crispy outside, creamy inside.", descPt: "Coxinha de frango", price: "16.90", tags: "classic" },
    { cat: "savory", nameEn: "Sweet Potato & Chicken Croquette", namePt: "Coxinha de Batata Doce", descEn: "A healthier twist on the classic croquette, made with sweet potato dough.", descPt: "Coxinha de batata doce com frango", price: "16.90", tags: "healthy" },
    { cat: "savory", nameEn: "Butter Croissant", namePt: "Croissant com Manteiga", descEn: "Flaky, golden croissant with butter. Freshly baked perfection.", descPt: "Croissant com manteiga", price: "17.90", tags: "classic" },
    { cat: "savory", nameEn: "Cream Cheese Croissant", namePt: "Croissant de Requeijão", descEn: "Warm croissant filled with creamy cheese. Buttery and irresistible.", descPt: "Croissant de requeijão", price: "25.90", tags: "classic" },
    { cat: "savory", nameEn: "Chicken Crepioca", namePt: "Crepioca Frango Cremoso", descEn: "Tapioca crepe filled with creamy chicken. Gluten-free Brazilian specialty.", descPt: "Crepioca de frango cremoso", price: "33.90", tags: "gluten-free" },
    { cat: "savory", nameEn: "Vegan Pumpkin Kibe", namePt: "Kibe de Abóbora Vegano", descEn: "A vegan kibe made with pumpkin and stuffed with savory filling. Creative and delicious.", descPt: "Kibe de abóbora vegano recheado", price: "23.90", tags: "vegan" },

    // === BURGERS & SANDWICHES ===
    { cat: "burgers", nameEn: "Burger New York", namePt: "Burguer New York", descEn: "Our classic burger inspired by NYC delis. Juicy patty with all the fixings.", descPt: "Hambúrguer clássico estilo NY", price: "46.90", tags: "classic" },
    { cat: "burgers", nameEn: "Burger Los Angeles", namePt: "Burguer Los Angeles", descEn: "West coast style burger with avocado and special sauce. Fresh and bold.", descPt: "Hambúrguer estilo LA com abacate", price: "55.90", tags: "signature" },
    { cat: "burgers", nameEn: "Burger Texas", namePt: "Burguer Texas", descEn: "A big, bold Texas-style burger with BBQ sauce and crispy onions.", descPt: "Hambúrguer estilo Texas com BBQ", price: "56.90", tags: "signature" },
    { cat: "burgers", nameEn: "Organic Prime Burger", namePt: "Organic Prime", descEn: "Premium organic beef burger with house-made toppings. Our signature creation.", descPt: "Hambúrguer premium orgânico", price: "55.90", tags: "signature,organic" },
    { cat: "burgers", nameEn: "Organic Supreme Burger", namePt: "Organic Supreme", descEn: "The ultimate organic burger with premium cheese and special sauce.", descPt: "Hambúrguer supremo orgânico", price: "56.90", tags: "signature,organic" },
    { cat: "burgers", nameEn: "Organic Vegan Burger", namePt: "Organic Blend Vegan", descEn: "A 100% plant-based burger that tastes incredible. No compromise on flavor.", descPt: "Hambúrguer vegano orgânico", price: "56.90", tags: "vegan,organic" },
    { cat: "burgers", nameEn: "Organic Sandwich", namePt: "Sanduba Organic", descEn: "Artisan gluten-free baguette with organic fillings. Light and flavorful.", descPt: "Sanduíche na baguete sem glúten", price: "43.90", tags: "gluten-free" },
    { cat: "burgers", nameEn: "Organic Meat Sandwich", namePt: "Sanduba Organic Meat", descEn: "Gluten-free baguette with pulled beef, cream cheese, and caramelized onions.", descPt: "Sanduíche com carne desfiada", price: "48.90", tags: "gluten-free,signature" },

    // === SALADS & BOWLS ===
    { cat: "salads", nameEn: "Green Field Salad", namePt: "Green Field", descEn: "A vibrant mix of fresh greens, cherry tomatoes, and house dressing.", descPt: "Salada de folhas verdes frescas", price: "37.90", tags: "healthy,vegetarian" },
    { cat: "salads", nameEn: "Forest Bowl", namePt: "Bowl Forest", descEn: "A hearty bowl with grains, roasted vegetables, and forest mushrooms.", descPt: "Bowl com grãos e cogumelos", price: "39.90", tags: "healthy,vegetarian" },
    { cat: "salads", nameEn: "Woods Salad", namePt: "Woods", descEn: "Mixed greens with nuts, dried fruits, and balsamic vinaigrette.", descPt: "Salada com nozes e frutas secas", price: "39.90", tags: "healthy" },
    { cat: "salads", nameEn: "Organic Chicken Bowl", namePt: "Bowl Organic Chicken", descEn: "Grilled organic chicken over a bed of greens with superfoods.", descPt: "Bowl de frango orgânico", price: "38.90", tags: "healthy,protein" },
    { cat: "salads", nameEn: "Açaí Bowl", namePt: "Açaí", descEn: "Thick açaí blend topped with granola, banana, and fresh fruits. A Brazilian superfood.", descPt: "Bowl de açaí com granola e frutas", price: "38.90", tags: "healthy,superfood" },
    { cat: "salads", nameEn: "Tropical Organic Bowl", namePt: "Tropical Organic", descEn: "A tropical fruit bowl with organic toppings. Fresh, colorful, and energizing.", descPt: "Bowl tropical orgânico", price: "38.90", tags: "healthy,tropical" },
    { cat: "salads", nameEn: "Organic World Bowl", namePt: "Organic World", descEn: "Our signature bowl with a global mix of superfoods and organic ingredients.", descPt: "Bowl mundial orgânico", price: "38.90", tags: "healthy,signature" },

    // === MAIN COURSES ===
    { cat: "mains", nameEn: "Fit Chicken Parmesan", namePt: "Parmegiana de Frango Fit", descEn: "A lighter version of chicken parmesan with gluten-free breading.", descPt: "Parmegiana de frango fit", price: "29.90", tags: "healthy,gluten-free" },
    { cat: "mains", nameEn: "Chicken Stroganoff", namePt: "Strogonoff de Frango", descEn: "Creamy chicken stroganoff served with rice. Comfort food at its best.", descPt: "Strogonoff de frango com arroz", price: "39.90", tags: "classic" },
    { cat: "mains", nameEn: "Beef Ragù", namePt: "Ragu de Carne", descEn: "Slow-cooked beef ragù with rich tomato sauce. Tender and flavorful.", descPt: "Ragu de carne cozido lentamente", price: "45.90", tags: "signature" },
    { cat: "mains", nameEn: "Leek & Gorgonzola Risotto", namePt: "Risoto de Alho Poró com Radicchio", descEn: "Creamy risotto with leeks and radicchio. Italian-inspired elegance.", descPt: "Risoto de alho poró com radicchio", price: "45.90", tags: "vegetarian" },
    { cat: "mains", nameEn: "Gluten-Free Bolognese Lasagna", namePt: "Lasanha à Bolonhesa sem Glúten", descEn: "Classic bolognese lasagna made entirely gluten-free. All the flavor, none of the gluten.", descPt: "Lasanha à bolonhesa sem glúten", price: "45.90", tags: "gluten-free" },
    { cat: "mains", nameEn: "Mini Margherita Pizza", namePt: "Mini Pizza Marguerita", descEn: "Personal-sized margherita pizza with fresh basil and mozzarella.", descPt: "Mini pizza marguerita", price: "29.90", tags: "vegetarian" },

    // === DESSERTS ===
    { cat: "desserts", nameEn: "Brownie", namePt: "Brownie", descEn: "Rich, fudgy chocolate brownie. Dense, decadent, and sugar-free.", descPt: "Brownie de chocolate sem açúcar", price: "23.90", tags: "sugar-free" },
    { cat: "desserts", nameEn: "Brownie with Ice Cream", namePt: "Brownie com Sorvete", descEn: "Warm brownie topped with a scoop of dairy-free ice cream. Pure indulgence.", descPt: "Brownie com sorvete sem lactose", price: "40.90", tags: "sugar-free,lactose-free" },
    { cat: "desserts", nameEn: "Cookie", namePt: "Cookie", descEn: "Freshly baked cookie with chocolate chips. Crispy edges, chewy center.", descPt: "Cookie com gotas de chocolate", price: "15.90", tags: "classic" },
    { cat: "desserts", nameEn: "Apple Pie", namePt: "Torta Apple Pie", descEn: "Warm apple pie with cinnamon. A classic American dessert.", descPt: "Torta de maçã com canela", price: "28.90", tags: "classic" },
    { cat: "desserts", nameEn: "Lemon Tart", namePt: "Torta Limão", descEn: "Tangy lemon tart with a buttery crust. Refreshing and zesty.", descPt: "Torta de limão", price: "29.90", tags: "classic" },
    { cat: "desserts", nameEn: "Chocolate Mousse Cake", namePt: "Torta Mousse de Chocolate", descEn: "Airy chocolate mousse on a crunchy base. Light yet intensely chocolatey.", descPt: "Torta mousse de chocolate", price: "29.90", tags: "classic" },
    { cat: "desserts", nameEn: "Petit Gateau with Ice Cream", namePt: "Petit Gateau Organic", descEn: "Warm chocolate lava cake with sugar-free ice cream. The ultimate dessert.", descPt: "Petit gateau de chocolate sem açúcar", price: "36.90", tags: "sugar-free,signature" },
    { cat: "desserts", nameEn: "American Waffle", namePt: "Waffle Americano", descEn: "Fluffy American-style waffle with your choice of toppings.", descPt: "Waffle americano", price: "39.90", tags: "classic" },
    { cat: "desserts", nameEn: "Cheesecake (Red Berries)", namePt: "Cheesecake de Frutas Vermelhas", descEn: "Creamy cheesecake topped with a red berry compote. Smooth and fruity.", descPt: "Cheesecake de frutas vermelhas", price: "28.90", tags: "classic" },
    { cat: "desserts", nameEn: "Tiramisu Verrine", namePt: "Verrine de Tiramissu", descEn: "Layers of mascarpone, espresso-soaked ladyfingers, and cocoa in a glass.", descPt: "Tiramissu em verrine", price: "31.90", tags: "signature" },
    { cat: "desserts", nameEn: "Banoffee Verrine", namePt: "Verrine de Banoffee", descEn: "Banana, toffee, and cream layered in a glass. Sweet British classic.", descPt: "Banoffee em verrine", price: "31.90", tags: "classic" },
    { cat: "desserts", nameEn: "Pistachio Strati", namePt: "Strati de Pistache", descEn: "Layered pistachio dessert with crunchy phyllo. Elegant and nutty.", descPt: "Strati de pistache", price: "24.90", tags: "signature" },
    { cat: "desserts", nameEn: "Cake of the Day", namePt: "Bolo do Dia", descEn: "Today's freshly baked cake. Ask your server for today's flavor!", descPt: "Bolo do dia", price: "14.90", tags: "daily" },

    // === SOFT DRINKS ===
    { cat: "softdrinks", nameEn: "Still Water", namePt: "Água sem Gás", descEn: "Pure still mineral water.", descPt: "Água mineral sem gás", price: "5.50", tags: "basic" },
    { cat: "softdrinks", nameEn: "Sparkling Water", namePt: "Água com Gás", descEn: "Refreshing sparkling mineral water.", descPt: "Água mineral com gás", price: "7.00", tags: "basic" },
    { cat: "softdrinks", nameEn: "Coconut Water", namePt: "Água de Coco", descEn: "Natural coconut water. Hydrating and refreshing.", descPt: "Água de coco natural", price: "14.00", tags: "natural" },
    { cat: "softdrinks", nameEn: "Coca-Cola", namePt: "Coca-Cola", descEn: "Classic Coca-Cola. The original refreshment.", descPt: "Coca-Cola clássica", price: "7.00", tags: "classic" },
    { cat: "softdrinks", nameEn: "Coca-Cola Zero", namePt: "Coca-Zero", descEn: "Zero sugar Coca-Cola. Same great taste, no sugar.", descPt: "Coca-Cola zero açúcar", price: "7.00", tags: "sugar-free" },
    { cat: "softdrinks", nameEn: "Sprite Lemon Fresh", namePt: "Sprite Lemon Fresh", descEn: "Crisp and refreshing lemon-lime soda.", descPt: "Sprite limão", price: "7.00", tags: "classic" },
    { cat: "softdrinks", nameEn: "Kombucha (Assorted Flavors)", namePt: "Kombucha Quântica", descEn: "Probiotic fermented tea in assorted flavors. Gut-friendly and fizzy.", descPt: "Kombucha em sabores variados", price: "19.90", tags: "healthy,probiotic" },
    { cat: "softdrinks", nameEn: "Red Bull Energy Drink", namePt: "Red Bull Lata", descEn: "Red Bull energy drink. Gives you wings!", descPt: "Red Bull energético", price: "12.90", tags: "energy" },
    { cat: "softdrinks", nameEn: "Whey Protein Shake (Vegan)", namePt: "Shake de Whey Vegano", descEn: "Plant-based protein shake. Perfect post-workout fuel.", descPt: "Shake de whey vegano", price: "38.90", tags: "vegan,protein" },
  ];

  let sortOrder = 0;
  for (const item of items) {
    sortOrder++;
    await db.execute(sql`INSERT INTO menu_items (categoryId, nameEn, namePt, descriptionEn, descriptionPt, price, available, tags, sortOrder) 
          VALUES (${catMap[item.cat]}, ${item.nameEn}, ${item.namePt}, ${item.descEn}, ${item.descPt}, ${item.price}, true, ${item.tags}, ${sortOrder})`);
  }

  // Seed tables (10 garden tables)
  for (let i = 1; i <= 10; i++) {
    await db.execute(sql`INSERT INTO \`tables\` (number, label, active) VALUES (${i}, ${`Garden Table ${i}`}, true)`);
  }

  console.log("✅ Seeded categories:", categories.length);
  console.log("✅ Seeded menu items:", items.length);
  console.log("✅ Seeded tables: 10");
  console.log("🎉 Database seeding complete!");
}

seed().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
