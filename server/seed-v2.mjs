import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("Seeding v2: Spanish data, images, and ordering expressions...");

  // 1. Update categories with Spanish names
  const categorySpanish = {
    coffees: "Cafés",
    "special-coffees": "Cafés Especiales",
    toasts: "Tostadas",
    salads: "Ensaladas",
    burgers: "Hamburguesas",
    bowls: "Bowls",
    desserts: "Postres",
    juices: "Jugos y Batidos",
    meals: "Comidas",
    wraps: "Wraps y Tapiocas",
    sides: "Acompañamientos"
  };

  for (const [slug, nameEs] of Object.entries(categorySpanish)) {
    await db.execute(sql`UPDATE menu_categories SET nameEs = ${nameEs} WHERE slug = ${slug}`);
  }
  console.log("  Categories updated with Spanish names");

  // 2. Update menu items with images (map by nameEn pattern)
  const imageMap = {
    "Espresso": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/lQapscVkfmwAtpNL.png",
    "Cappuccino": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/gyGFLLNfPFwnGoya.png",
    "Matcha Latte": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/WQYYtDoqvsbBezlp.png",
    "Iced Coffee": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/zBETpsAXYvGIUDLS.png",
    "Hot Chocolate": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/xAXlUGAPwKwsOwZn.png",
    "Avocado Toast": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/vUIHJLPcPisfPEWo.png",
    "Chicken Burger": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/lluJuMDgnyfYHIKT.png",
    "Açaí Bowl": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/YJuLaKbHSFgmeqHe.png",
    "Green Detox Juice": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/nsesZRuIOSVMcghj.png",
    "Garden Salad": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/ORorbruZqqxfJTdN.png",
    "Brownie": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/iycnyPsNOoYNZRUi.png",
    "Tropical Smoothie": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/PqKOvRltDemvBBKY.png",
    "Banana Pancakes": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/TKmxdMDSdsKRycDh.png",
    "Chicken Wrap": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/xVwQWEQYJjRpxSHh.png",
    "Tapioca": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/dCWMwExIAgJyfsZi.png",
  };

  for (const [name, url] of Object.entries(imageMap)) {
    await db.execute(sql`UPDATE menu_items SET imageUrl = ${url} WHERE nameEn LIKE ${`%${name}%`} LIMIT 1`);
  }
  console.log("  Menu items updated with images");

  // 3. Insert ordering expressions (English)
  const expressionsEn = [
    // Greetings
    { category: "greeting", expression: "Hi! Table for one, please.", translation: "Oi! Mesa para um, por favor.", chunks: '["Hi!", "Table for", "one", "please"]', difficulty: "easy", context: "Arriving at the restaurant" },
    { category: "greeting", expression: "Good afternoon! I have a reservation.", translation: "Boa tarde! Eu tenho uma reserva.", chunks: '["Good afternoon!", "I have", "a reservation"]', difficulty: "medium", context: "Arriving with reservation" },
    { category: "greeting", expression: "Hello! Could we get a table by the garden?", translation: "Olá! Podemos pegar uma mesa no jardim?", chunks: '["Hello!", "Could we get", "a table", "by the garden?"]', difficulty: "hard", context: "Requesting specific seating" },

    // Ordering
    { category: "ordering", expression: "I'd like a cappuccino, please.", translation: "Eu gostaria de um cappuccino, por favor.", chunks: `["I'd like", "a cappuccino", "please"]`, difficulty: "easy", context: "Ordering a drink" },
    { category: "ordering", expression: "Can I have the avocado toast?", translation: "Posso pedir a torrada de abacate?", chunks: '["Can I have", "the avocado toast?"]', difficulty: "easy", context: "Ordering food" },
    { category: "ordering", expression: "Could I get the chicken burger with a side salad?", translation: "Poderia me trazer o hambúrguer de frango com salada?", chunks: '["Could I get", "the chicken burger", "with", "a side salad?"]', difficulty: "medium", context: "Ordering with sides" },
    { category: "ordering", expression: "I'll have the garden salad and a green juice, please.", translation: "Vou querer a salada e um suco verde, por favor.", chunks: `["I'll have", "the garden salad", "and", "a green juice", "please"]`, difficulty: "medium", context: "Ordering multiple items" },
    { category: "ordering", expression: "For my main course, I'd like the grilled chicken, and could I also get a matcha latte?", translation: "Para o prato principal, eu gostaria do frango grelhado, e poderia trazer um matcha latte também?", chunks: `["For my main course", "I'd like", "the grilled chicken", "and could I also get", "a matcha latte?"]`, difficulty: "hard", context: "Complex order" },
    { category: "ordering", expression: "I'm going to go with the açaí bowl.", translation: "Vou escolher o açaí bowl.", chunks: `["I'm going to go with", "the açaí bowl"]`, difficulty: "medium", context: "Making a choice" },

    // Asking
    { category: "asking", expression: "What do you recommend?", translation: "O que você recomenda?", chunks: '["What", "do you recommend?"]', difficulty: "easy", context: "Asking for recommendation" },
    { category: "asking", expression: "Is this dish gluten-free?", translation: "Esse prato é sem glúten?", chunks: '["Is this dish", "gluten-free?"]', difficulty: "easy", context: "Dietary restriction" },
    { category: "asking", expression: "Does this come with any sides?", translation: "Isso vem com algum acompanhamento?", chunks: '["Does this", "come with", "any sides?"]', difficulty: "medium", context: "Asking about sides" },
    { category: "asking", expression: "Could you tell me what's in the tropical smoothie?", translation: "Você poderia me dizer o que tem no smoothie tropical?", chunks: `["Could you tell me", "what's in", "the tropical smoothie?"]`, difficulty: "hard", context: "Asking about ingredients" },
    { category: "asking", expression: "How long will it take?", translation: "Quanto tempo vai demorar?", chunks: '["How long", "will it take?"]', difficulty: "medium", context: "Asking about wait time" },

    // Special requests
    { category: "special_request", expression: "No sugar, please.", translation: "Sem açúcar, por favor.", chunks: '["No sugar", "please"]', difficulty: "easy", context: "Simple modification" },
    { category: "special_request", expression: "Could I have it without onions?", translation: "Poderia ser sem cebola?", chunks: '["Could I have it", "without onions?"]', difficulty: "medium", context: "Removing ingredient" },
    { category: "special_request", expression: "I'm allergic to dairy. Could you make it with oat milk instead?", translation: "Sou alérgico a laticínios. Poderia fazer com leite de aveia?", chunks: `["I'm allergic to", "dairy", "Could you make it", "with oat milk", "instead?"]`, difficulty: "hard", context: "Allergy and substitution" },
    { category: "special_request", expression: "Can I have extra avocado on that?", translation: "Posso colocar abacate extra nisso?", chunks: '["Can I have", "extra avocado", "on that?"]', difficulty: "medium", context: "Adding extra" },

    // Thanking
    { category: "thanking", expression: "Thank you!", translation: "Obrigado(a)!", chunks: '["Thank you!"]', difficulty: "easy", context: "Simple thanks" },
    { category: "thanking", expression: "That was delicious, thank you!", translation: "Estava delicioso, obrigado(a)!", chunks: '["That was", "delicious", "thank you!"]', difficulty: "easy", context: "Complimenting food" },
    { category: "thanking", expression: "Everything was wonderful. My compliments to the chef!", translation: "Tudo estava maravilhoso. Meus cumprimentos ao chef!", chunks: '["Everything was", "wonderful", "My compliments", "to the chef!"]', difficulty: "hard", context: "Formal compliment" },

    // Paying
    { category: "paying", expression: "Can I have the check, please?", translation: "Pode trazer a conta, por favor?", chunks: '["Can I have", "the check", "please?"]', difficulty: "easy", context: "Asking for bill" },
    { category: "paying", expression: "Do you accept credit cards?", translation: "Vocês aceitam cartão de crédito?", chunks: '["Do you accept", "credit cards?"]', difficulty: "easy", context: "Payment method" },
    { category: "paying", expression: "Could we split the bill, please?", translation: "Podemos dividir a conta, por favor?", chunks: '["Could we", "split the bill", "please?"]', difficulty: "medium", context: "Splitting bill" },
    { category: "paying", expression: "I'd like to pay for the whole table.", translation: "Gostaria de pagar a mesa toda.", chunks: `["I'd like to", "pay for", "the whole table"]`, difficulty: "hard", context: "Paying for everyone" },

    // Responses (waiter questions the student should answer)
    { category: "response", expression: "Yes, I'm ready to order.", translation: "Sim, estou pronto para pedir.", chunks: `["Yes", "I'm ready", "to order"]`, difficulty: "easy", context: "Response to: Are you ready to order?" },
    { category: "response", expression: "I'm still deciding. Could I have a few more minutes?", translation: "Ainda estou decidindo. Posso ter mais alguns minutos?", chunks: `["I'm still deciding", "Could I have", "a few more minutes?"]`, difficulty: "medium", context: "Response to: Are you ready to order?" },
    { category: "response", expression: "That sounds great, I'll go with that!", translation: "Parece ótimo, vou querer isso!", chunks: `["That sounds great", "I'll go with that!"]`, difficulty: "easy", context: "Response to recommendation" },
    { category: "response", expression: "Actually, could I change my order? I'd prefer the salad instead.", translation: "Na verdade, posso mudar meu pedido? Prefiro a salada.", chunks: `["Actually", "could I change", "my order?", "I'd prefer", "the salad", "instead"]`, difficulty: "hard", context: "Changing order" },
  ];

  // 4. Insert ordering expressions (Spanish)
  const expressionsEs = [
    { category: "greeting", expression: "¡Hola! Una mesa para uno, por favor.", translation: "Oi! Mesa para um, por favor.", chunks: '["¡Hola!", "Una mesa", "para uno", "por favor"]', difficulty: "easy", context: "Llegando al restaurante" },
    { category: "greeting", expression: "¡Buenas tardes! Tengo una reservación.", translation: "Boa tarde! Eu tenho uma reserva.", chunks: '["¡Buenas tardes!", "Tengo", "una reservación"]', difficulty: "medium", context: "Llegando con reservación" },
    { category: "ordering", expression: "Me gustaría un cappuccino, por favor.", translation: "Eu gostaria de um cappuccino, por favor.", chunks: '["Me gustaría", "un cappuccino", "por favor"]', difficulty: "easy", context: "Pidiendo una bebida" },
    { category: "ordering", expression: "¿Me puede traer la tostada de aguacate?", translation: "Pode me trazer a torrada de abacate?", chunks: '["¿Me puede traer", "la tostada", "de aguacate?"]', difficulty: "easy", context: "Pidiendo comida" },
    { category: "ordering", expression: "Quisiera la hamburguesa de pollo con ensalada.", translation: "Eu queria o hambúrguer de frango com salada.", chunks: '["Quisiera", "la hamburguesa de pollo", "con", "ensalada"]', difficulty: "medium", context: "Pidiendo con acompañamiento" },
    { category: "ordering", expression: "Voy a pedir la ensalada y un jugo verde, por favor.", translation: "Vou pedir a salada e um suco verde, por favor.", chunks: '["Voy a pedir", "la ensalada", "y", "un jugo verde", "por favor"]', difficulty: "medium", context: "Pidiendo varios items" },
    { category: "asking", expression: "¿Qué me recomienda?", translation: "O que você recomenda?", chunks: '["¿Qué", "me recomienda?"]', difficulty: "easy", context: "Pidiendo recomendación" },
    { category: "asking", expression: "¿Este plato es sin gluten?", translation: "Esse prato é sem glúten?", chunks: '["¿Este plato", "es sin gluten?"]', difficulty: "easy", context: "Restricción dietética" },
    { category: "asking", expression: "¿Cuánto tiempo va a tardar?", translation: "Quanto tempo vai demorar?", chunks: '["¿Cuánto tiempo", "va a tardar?"]', difficulty: "medium", context: "Preguntando tiempo de espera" },
    { category: "special_request", expression: "Sin azúcar, por favor.", translation: "Sem açúcar, por favor.", chunks: '["Sin azúcar", "por favor"]', difficulty: "easy", context: "Modificación simple" },
    { category: "special_request", expression: "¿Podría ser sin cebolla?", translation: "Poderia ser sem cebola?", chunks: '["¿Podría ser", "sin cebolla?"]', difficulty: "medium", context: "Quitando ingrediente" },
    { category: "thanking", expression: "¡Gracias!", translation: "Obrigado(a)!", chunks: '["¡Gracias!"]', difficulty: "easy", context: "Agradecimiento simple" },
    { category: "thanking", expression: "¡Estuvo delicioso, gracias!", translation: "Estava delicioso, obrigado(a)!", chunks: '["¡Estuvo", "delicioso", "gracias!"]', difficulty: "easy", context: "Elogiando la comida" },
    { category: "paying", expression: "¿Me trae la cuenta, por favor?", translation: "Pode trazer a conta, por favor?", chunks: '["¿Me trae", "la cuenta", "por favor?"]', difficulty: "easy", context: "Pidiendo la cuenta" },
    { category: "paying", expression: "¿Aceptan tarjeta de crédito?", translation: "Vocês aceitam cartão de crédito?", chunks: '["¿Aceptan", "tarjeta de crédito?"]', difficulty: "easy", context: "Método de pago" },
    { category: "response", expression: "Sí, estoy listo para pedir.", translation: "Sim, estou pronto para pedir.", chunks: '["Sí", "estoy listo", "para pedir"]', difficulty: "easy", context: "Respuesta a: ¿Está listo para pedir?" },
    { category: "response", expression: "Todavía estoy decidiendo. ¿Me da unos minutos más?", translation: "Ainda estou decidindo. Me dá mais uns minutos?", chunks: '["Todavía estoy decidiendo", "¿Me da", "unos minutos más?"]', difficulty: "medium", context: "Respuesta a: ¿Está listo para pedir?" },
  ];

  // Insert English expressions
  let sortOrder = 0;
  for (const expr of expressionsEn) {
    sortOrder++;
    await db.execute(sql`INSERT INTO ordering_expressions (language, category, expression, translation, chunks, difficulty, context, sortOrder) VALUES ('en', ${expr.category}, ${expr.expression}, ${expr.translation}, ${expr.chunks}, ${expr.difficulty}, ${expr.context}, ${sortOrder})`);
  }
  console.log(`  Inserted ${expressionsEn.length} English expressions`);

  // Insert Spanish expressions
  sortOrder = 0;
  for (const expr of expressionsEs) {
    sortOrder++;
    await db.execute(sql`INSERT INTO ordering_expressions (language, category, expression, translation, chunks, difficulty, context, sortOrder) VALUES ('es', ${expr.category}, ${expr.expression}, ${expr.translation}, ${expr.chunks}, ${expr.difficulty}, ${expr.context}, ${sortOrder})`);
  }
  console.log(`  Inserted ${expressionsEs.length} Spanish expressions`);

  console.log("\nSeed v2 complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
