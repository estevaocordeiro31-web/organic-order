// ===== RESTAURANT VOICE DATA =====
// Vocabulary, phrases, and Q&A pairs specific to each restaurant
// Used by PartnerVoiceGame and QASimulation

import type { VoicePhrase } from "@/components/PartnerVoiceGame";

// ===== Q&A PAIR TYPE =====
export type QAPair = {
  question: string;
  expectedAnswer: string;
  translation: string;
  hint: string;
  keywords: string[];
};

// ===== RESTAURANT VOICE CONFIG =====
export type RestaurantVoiceConfig = {
  waiterEmoji: string;
  waiterNameEn: string;
  waiterNameEs: string;
  welcomeEn: string;
  welcomeEs: string;
  accentColor: string;
  bgColor: string;
  phrasesEn: VoicePhrase[];
  phrasesEs: VoicePhrase[];
  qaEn: QAPair[];
  qaEs: QAPair[];
};

// ===================================================================
// TOP DOG BRASIL — Hot Dogs, Smash Burgers, Loaded Fries
// ===================================================================
const topDogConfig: RestaurantVoiceConfig = {
  waiterEmoji: "🌭",
  waiterNameEn: "Max",
  waiterNameEs: "Max",
  welcomeEn: "Welcome to Top Dog Brasil! I'm Max, your server today. What can I get you?",
  welcomeEs: "¡Bienvenido a Top Dog Brasil! Soy Max, tu mesero hoy. ¿Qué te puedo servir?",
  accentColor: "#ef4444",
  bgColor: "#0d0505",

  phrasesEn: [
    // EASY
    { id: 1, expression: "I'd like a hot dog, please.", translation: "Eu gostaria de um cachorro-quente, por favor.", context: "Ordering your main", difficulty: "easy" },
    { id: 2, expression: "Can I get the loaded fries?", translation: "Posso pedir as batatas carregadas?", context: "Ordering a side", difficulty: "easy" },
    { id: 3, expression: "I'll have a smash burger.", translation: "Vou querer um smash burger.", context: "Choosing a burger", difficulty: "easy" },
    { id: 4, expression: "What's the special today?", translation: "Qual é o especial de hoje?", context: "Asking about the menu", difficulty: "easy" },
    { id: 5, expression: "Can I add extra cheese?", translation: "Posso adicionar queijo extra?", context: "Customizing your order", difficulty: "easy" },
    // MEDIUM
    { id: 6, expression: "I'd like mine with mustard and onions.", translation: "Quero o meu com mostarda e cebola.", context: "Customizing toppings", difficulty: "medium" },
    { id: 7, expression: "Can I swap the fries for a salad?", translation: "Posso trocar as batatas por uma salada?", context: "Substituting sides", difficulty: "medium" },
    { id: 8, expression: "I'm allergic to gluten. Do you have options?", translation: "Sou alérgico ao glúten. Vocês têm opções?", context: "Dietary restriction", difficulty: "medium" },
    { id: 9, expression: "Could you make it a combo with a drink?", translation: "Poderia fazer um combo com bebida?", context: "Upgrading your order", difficulty: "medium" },
    { id: 10, expression: "I'll take the chili dog and a lemonade.", translation: "Vou levar o chili dog e uma limonada.", context: "Full order", difficulty: "medium" },
    // HARD
    { id: 11, expression: "What do you recommend for someone who loves spicy food?", translation: "O que você recomenda para quem ama comida apimentada?", context: "Asking for a recommendation", difficulty: "hard" },
    { id: 12, expression: "Could I get the hot dog without the bun, please?", translation: "Posso pedir o cachorro-quente sem o pão, por favor?", context: "Special request", difficulty: "hard" },
    { id: 13, expression: "I'd like to try the double smash with bacon and cheddar.", translation: "Gostaria de experimentar o double smash com bacon e cheddar.", context: "Premium order", difficulty: "hard" },
    { id: 14, expression: "Is the chili sauce homemade or store-bought?", translation: "O molho chili é caseiro ou industrializado?", context: "Curious customer", difficulty: "hard" },
    { id: 15, expression: "Can I have the sauce on the side, please?", translation: "Posso ter o molho separado, por favor?", context: "Sauce preference", difficulty: "hard" },
  ],

  phrasesEs: [
    { id: 1, expression: "Me gustaría un hot dog, por favor.", translation: "Eu gostaria de um cachorro-quente, por favor.", context: "Ordenar el plato principal", difficulty: "easy" },
    { id: 2, expression: "¿Puedo pedir las papas cargadas?", translation: "Posso pedir as batatas carregadas?", context: "Ordenar un acompañamiento", difficulty: "easy" },
    { id: 3, expression: "Voy a pedir un smash burger.", translation: "Vou querer um smash burger.", context: "Elegir una hamburguesa", difficulty: "easy" },
    { id: 4, expression: "¿Cuál es el especial de hoy?", translation: "Qual é o especial de hoje?", context: "Preguntar sobre el menú", difficulty: "easy" },
    { id: 5, expression: "¿Puedo agregar queso extra?", translation: "Posso adicionar queijo extra?", context: "Personalizar el pedido", difficulty: "easy" },
    { id: 6, expression: "Lo quiero con mostaza y cebolla.", translation: "Quero com mostarda e cebola.", context: "Personalizar ingredientes", difficulty: "medium" },
    { id: 7, expression: "¿Puedo cambiar las papas por una ensalada?", translation: "Posso trocar as batatas por uma salada?", context: "Sustituir acompañamiento", difficulty: "medium" },
    { id: 8, expression: "Soy alérgico al gluten. ¿Tienen opciones?", translation: "Sou alérgico ao glúten. Têm opções?", context: "Restricción alimentaria", difficulty: "medium" },
    { id: 9, expression: "¿Podría hacer un combo con bebida?", translation: "Poderia fazer um combo com bebida?", context: "Mejorar el pedido", difficulty: "medium" },
    { id: 10, expression: "Voy a llevar el chili dog y una limonada.", translation: "Vou levar o chili dog e uma limonada.", context: "Pedido completo", difficulty: "medium" },
    { id: 11, expression: "¿Qué recomiendas para alguien que ama la comida picante?", translation: "O que você recomenda para quem ama comida apimentada?", context: "Pedir recomendación", difficulty: "hard" },
    { id: 12, expression: "¿Podría pedir el hot dog sin el pan, por favor?", translation: "Posso pedir o cachorro-quente sem o pão?", context: "Pedido especial", difficulty: "hard" },
    { id: 13, expression: "Me gustaría probar el double smash con tocino y cheddar.", translation: "Gostaria de experimentar o double smash com bacon e cheddar.", context: "Pedido premium", difficulty: "hard" },
    { id: 14, expression: "¿La salsa chili es casera o de fábrica?", translation: "O molho chili é caseiro ou industrializado?", context: "Cliente curioso", difficulty: "hard" },
    { id: 15, expression: "¿Puedo tener la salsa aparte, por favor?", translation: "Posso ter o molho separado?", context: "Preferencia de salsa", difficulty: "hard" },
  ],

  qaEn: [
    { question: "Hi! Welcome to Top Dog. What can I get you today?", expectedAnswer: "I'd like a hot dog, please.", translation: "Eu gostaria de um cachorro-quente, por favor.", hint: "I'd like a...", keywords: ["like", "hot", "dog", "please"] },
    { question: "Would you like to add any toppings?", expectedAnswer: "Yes, mustard and onions, please.", translation: "Sim, mostarda e cebola, por favor.", hint: "Yes, mustard...", keywords: ["mustard", "onions", "please"] },
    { question: "Would you like fries with that?", expectedAnswer: "Yes, I'll have the loaded fries.", translation: "Sim, vou querer as batatas carregadas.", hint: "I'll have the loaded...", keywords: ["loaded", "fries"] },
    { question: "What size drink would you like?", expectedAnswer: "A large one, please.", translation: "Um grande, por favor.", hint: "A large...", keywords: ["large", "please"] },
    { question: "Do you have any dietary restrictions?", expectedAnswer: "I'm looking for gluten-free options.", translation: "Estou procurando opções sem glúten.", hint: "I'm looking for...", keywords: ["looking", "gluten", "free"] },
    { question: "How would you like to pay?", expectedAnswer: "I'll pay by card, please.", translation: "Vou pagar no cartão, por favor.", hint: "I'll pay by...", keywords: ["pay", "card"] },
    { question: "Anything else for you today?", expectedAnswer: "No, that's all. Thank you!", translation: "Não, é só isso. Obrigado!", hint: "That's all...", keywords: ["that", "all", "thank"] },
    { question: "Your order is ready! Enjoy!", expectedAnswer: "Thank you so much! It looks amazing.", translation: "Muito obrigado! Parece incrível.", hint: "Thank you...", keywords: ["thank", "amazing", "looks"] },
  ],

  qaEs: [
    { question: "¡Hola! Bienvenido a Top Dog. ¿Qué te puedo servir hoy?", expectedAnswer: "Me gustaría un hot dog, por favor.", translation: "Eu gostaria de um cachorro-quente, por favor.", hint: "Me gustaría...", keywords: ["gustaría", "hot", "dog", "favor"] },
    { question: "¿Te gustaría agregar ingredientes?", expectedAnswer: "Sí, mostaza y cebolla, por favor.", translation: "Sim, mostarda e cebola, por favor.", hint: "Sí, mostaza...", keywords: ["mostaza", "cebolla", "favor"] },
    { question: "¿Quieres papas con eso?", expectedAnswer: "Sí, voy a pedir las papas cargadas.", translation: "Sim, vou pedir as batatas carregadas.", hint: "Voy a pedir...", keywords: ["papas", "cargadas"] },
    { question: "¿De qué tamaño quieres la bebida?", expectedAnswer: "Una grande, por favor.", translation: "Uma grande, por favor.", hint: "Una grande...", keywords: ["grande", "favor"] },
    { question: "¿Tienes alguna restricción alimentaria?", expectedAnswer: "Estoy buscando opciones sin gluten.", translation: "Estou procurando opções sem glúten.", hint: "Estoy buscando...", keywords: ["buscando", "gluten"] },
    { question: "¿Cómo vas a pagar?", expectedAnswer: "Voy a pagar con tarjeta, por favor.", translation: "Vou pagar no cartão, por favor.", hint: "Voy a pagar...", keywords: ["pagar", "tarjeta"] },
    { question: "¿Algo más para ti hoy?", expectedAnswer: "No, eso es todo. ¡Gracias!", translation: "Não, é só isso. Obrigado!", hint: "Eso es todo...", keywords: ["eso", "todo", "gracias"] },
  ],
};

// ===================================================================
// LA GUAPA — Empanadas Artesanais, Café, Argentina
// ===================================================================
const laGuapaConfig: RestaurantVoiceConfig = {
  waiterEmoji: "🥟",
  waiterNameEn: "Sofia",
  waiterNameEs: "Sofía",
  welcomeEn: "Welcome to La Guapa! I'm Sofia. Our empanadas are fresh out of the oven — what can I get you?",
  welcomeEs: "¡Bienvenido a La Guapa! Soy Sofía. Nuestras empanadas están recién salidas del horno — ¿qué te sirvo?",
  accentColor: "#f59e0b",
  bgColor: "#0d0a02",

  phrasesEn: [
    { id: 1, expression: "I'd like two empanadas, please.", translation: "Eu gostaria de duas empanadas, por favor.", context: "Ordering empanadas", difficulty: "easy" },
    { id: 2, expression: "What fillings do you have?", translation: "Quais recheios vocês têm?", context: "Asking about options", difficulty: "easy" },
    { id: 3, expression: "I'll have the chicken and cheese one.", translation: "Vou querer a de frango e queijo.", context: "Choosing a filling", difficulty: "easy" },
    { id: 4, expression: "Can I get a coffee with that?", translation: "Posso pedir um café com isso?", context: "Adding a drink", difficulty: "easy" },
    { id: 5, expression: "Are these baked or fried?", translation: "Essas são assadas ou fritas?", context: "Asking about preparation", difficulty: "easy" },
    { id: 6, expression: "I'd like the beef empanada with extra chimichurri.", translation: "Gostaria da empanada de carne com chimichurri extra.", context: "Customizing order", difficulty: "medium" },
    { id: 7, expression: "Do you have any vegetarian options?", translation: "Vocês têm opções vegetarianas?", context: "Dietary preference", difficulty: "medium" },
    { id: 8, expression: "Can I get a combo with a drink and a dessert?", translation: "Posso pedir um combo com bebida e sobremesa?", context: "Combo order", difficulty: "medium" },
    { id: 9, expression: "I'll take three of the spinach and cheese.", translation: "Vou levar três de espinafre e queijo.", context: "Multiple order", difficulty: "medium" },
    { id: 10, expression: "What's your most popular empanada?", translation: "Qual é a empanada mais popular de vocês?", context: "Recommendation", difficulty: "medium" },
    { id: 11, expression: "Could I get a mix of beef, chicken, and spinach?", translation: "Poderia pegar uma mistura de carne, frango e espinafre?", context: "Mixed order", difficulty: "hard" },
    { id: 12, expression: "Is the chimichurri sauce spicy or mild?", translation: "O molho chimichurri é apimentado ou suave?", context: "Sauce inquiry", difficulty: "hard" },
    { id: 13, expression: "I'd love to try the dulce de leche empanada for dessert.", translation: "Adoraria experimentar a empanada de doce de leite de sobremesa.", context: "Dessert order", difficulty: "hard" },
    { id: 14, expression: "Can you warm them up a little more, please?", translation: "Pode esquentar um pouco mais, por favor?", context: "Special request", difficulty: "hard" },
    { id: 15, expression: "What's the difference between the classic and the artisan version?", translation: "Qual é a diferença entre a versão clássica e a artesanal?", context: "Menu inquiry", difficulty: "hard" },
  ],

  phrasesEs: [
    { id: 1, expression: "Me gustaría dos empanadas, por favor.", translation: "Eu gostaria de duas empanadas, por favor.", context: "Pedir empanadas", difficulty: "easy" },
    { id: 2, expression: "¿Qué rellenos tienen?", translation: "Quais recheios vocês têm?", context: "Preguntar por opciones", difficulty: "easy" },
    { id: 3, expression: "Voy a pedir la de pollo y queso.", translation: "Vou querer a de frango e queijo.", context: "Elegir relleno", difficulty: "easy" },
    { id: 4, expression: "¿Puedo pedir un café con eso?", translation: "Posso pedir um café com isso?", context: "Agregar bebida", difficulty: "easy" },
    { id: 5, expression: "¿Estas son al horno o fritas?", translation: "Essas são assadas ou fritas?", context: "Preguntar sobre preparación", difficulty: "easy" },
    { id: 6, expression: "Me gustaría la empanada de carne con chimichurri extra.", translation: "Gostaria da empanada de carne com chimichurri extra.", context: "Personalizar pedido", difficulty: "medium" },
    { id: 7, expression: "¿Tienen opciones vegetarianas?", translation: "Vocês têm opções vegetarianas?", context: "Preferencia dietética", difficulty: "medium" },
    { id: 8, expression: "¿Puedo pedir un combo con bebida y postre?", translation: "Posso pedir um combo com bebida e sobremesa?", context: "Pedido combo", difficulty: "medium" },
    { id: 9, expression: "Voy a llevar tres de espinaca y queso.", translation: "Vou levar três de espinafre e queijo.", context: "Pedido múltiple", difficulty: "medium" },
    { id: 10, expression: "¿Cuál es la empanada más popular?", translation: "Qual é a empanada mais popular?", context: "Recomendación", difficulty: "medium" },
    { id: 11, expression: "¿Podría pedir una mezcla de carne, pollo y espinaca?", translation: "Poderia pegar uma mistura de carne, frango e espinafre?", context: "Pedido mixto", difficulty: "hard" },
    { id: 12, expression: "¿La salsa chimichurri es picante o suave?", translation: "O molho chimichurri é apimentado ou suave?", context: "Consulta de salsa", difficulty: "hard" },
    { id: 13, expression: "Me encantaría probar la empanada de dulce de leche de postre.", translation: "Adoraria experimentar a empanada de doce de leite.", context: "Pedido de postre", difficulty: "hard" },
    { id: 14, expression: "¿Puede calentarlas un poco más, por favor?", translation: "Pode esquentar um pouco mais?", context: "Pedido especial", difficulty: "hard" },
    { id: 15, expression: "¿Cuál es la diferencia entre la versión clásica y la artesanal?", translation: "Qual é a diferença entre a versão clássica e a artesanal?", context: "Consulta del menú", difficulty: "hard" },
  ],

  qaEn: [
    { question: "Welcome to La Guapa! What can I get you?", expectedAnswer: "I'd like two empanadas, please.", translation: "Eu gostaria de duas empanadas, por favor.", hint: "I'd like two...", keywords: ["like", "two", "empanadas", "please"] },
    { question: "What filling would you like?", expectedAnswer: "I'll have the beef and chimichurri.", translation: "Vou querer a de carne e chimichurri.", hint: "I'll have the...", keywords: ["beef", "chimichurri"] },
    { question: "Would you like anything to drink?", expectedAnswer: "Yes, a black coffee, please.", translation: "Sim, um café preto, por favor.", hint: "Yes, a black...", keywords: ["coffee", "black", "please"] },
    { question: "Do you have any dietary restrictions?", expectedAnswer: "I'm vegetarian. Do you have options?", translation: "Sou vegetariano. Têm opções?", hint: "I'm vegetarian...", keywords: ["vegetarian", "options"] },
    { question: "Would you like to try our dulce de leche empanada for dessert?", expectedAnswer: "Sure, that sounds delicious!", translation: "Claro, parece delicioso!", hint: "Sure, that sounds...", keywords: ["sure", "delicious", "sounds"] },
    { question: "How would you like to pay?", expectedAnswer: "I'll pay by card, please.", translation: "Vou pagar no cartão, por favor.", hint: "I'll pay by...", keywords: ["pay", "card"] },
    { question: "Anything else for you today?", expectedAnswer: "No, that's everything. Thank you!", translation: "Não, é tudo. Obrigado!", hint: "That's everything...", keywords: ["everything", "thank"] },
  ],

  qaEs: [
    { question: "¡Bienvenido a La Guapa! ¿Qué te sirvo?", expectedAnswer: "Me gustaría dos empanadas, por favor.", translation: "Eu gostaria de duas empanadas, por favor.", hint: "Me gustaría...", keywords: ["gustaría", "dos", "empanadas"] },
    { question: "¿Qué relleno quieres?", expectedAnswer: "Voy a pedir la de carne con chimichurri.", translation: "Vou querer a de carne com chimichurri.", hint: "Voy a pedir...", keywords: ["carne", "chimichurri"] },
    { question: "¿Te gustaría algo de tomar?", expectedAnswer: "Sí, un café negro, por favor.", translation: "Sim, um café preto, por favor.", hint: "Sí, un café...", keywords: ["café", "negro", "favor"] },
    { question: "¿Tienes alguna restricción alimentaria?", expectedAnswer: "Soy vegetariano. ¿Tienen opciones?", translation: "Sou vegetariano. Têm opções?", hint: "Soy vegetariano...", keywords: ["vegetariano", "opciones"] },
    { question: "¿Te gustaría probar nuestra empanada de dulce de leche de postre?", expectedAnswer: "¡Claro, suena delicioso!", translation: "Claro, parece delicioso!", hint: "¡Claro, suena...", keywords: ["claro", "delicioso"] },
    { question: "¿Cómo vas a pagar?", expectedAnswer: "Voy a pagar con tarjeta, por favor.", translation: "Vou pagar no cartão.", hint: "Voy a pagar...", keywords: ["pagar", "tarjeta"] },
    { question: "¿Algo más para ti?", expectedAnswer: "No, eso es todo. ¡Gracias!", translation: "Não, é tudo. Obrigado!", hint: "Eso es todo...", keywords: ["eso", "todo", "gracias"] },
  ],
};

// ===================================================================
// EL PATRON — Mexican Food, Tacos, Burritos, Nachos
// ===================================================================
const elPatronConfig: RestaurantVoiceConfig = {
  waiterEmoji: "🌮",
  waiterNameEn: "Diego",
  waiterNameEs: "Diego",
  welcomeEn: "Welcome to El Patron! I'm Diego. Ready to spice things up? What can I get you?",
  welcomeEs: "¡Bienvenido a El Patron! Soy Diego. ¿Listo para darle sabor? ¿Qué te sirvo?",
  accentColor: "#f97316",
  bgColor: "#0d0603",

  phrasesEn: [
    { id: 1, expression: "I'd like three tacos, please.", translation: "Eu gostaria de três tacos, por favor.", context: "Ordering tacos", difficulty: "easy" },
    { id: 2, expression: "Can I get a burrito with chicken?", translation: "Posso pedir um burrito com frango?", context: "Ordering a burrito", difficulty: "easy" },
    { id: 3, expression: "I'll have the nachos with guacamole.", translation: "Vou querer os nachos com guacamole.", context: "Ordering nachos", difficulty: "easy" },
    { id: 4, expression: "What's in the quesadilla?", translation: "O que tem na quesadilla?", context: "Asking about ingredients", difficulty: "easy" },
    { id: 5, expression: "Can I get extra salsa on the side?", translation: "Posso pegar salsa extra separada?", context: "Extra condiment", difficulty: "easy" },
    { id: 6, expression: "I'd like the beef taco with pico de gallo.", translation: "Gostaria do taco de carne com pico de gallo.", context: "Specific taco order", difficulty: "medium" },
    { id: 7, expression: "Can you make it less spicy for me?", translation: "Pode fazer menos apimentado para mim?", context: "Spice preference", difficulty: "medium" },
    { id: 8, expression: "I'll have the combo plate with rice and beans.", translation: "Vou querer o prato combo com arroz e feijão.", context: "Combo order", difficulty: "medium" },
    { id: 9, expression: "Do you have any vegan options?", translation: "Vocês têm opções veganas?", context: "Dietary preference", difficulty: "medium" },
    { id: 10, expression: "I'd like a margarita without alcohol, please.", translation: "Gostaria de uma margarita sem álcool, por favor.", context: "Mocktail order", difficulty: "medium" },
    { id: 11, expression: "What's the difference between the street taco and the classic taco?", translation: "Qual é a diferença entre o taco de rua e o taco clássico?", context: "Menu inquiry", difficulty: "hard" },
    { id: 12, expression: "Could I get the burrito bowl instead of the wrap?", translation: "Poderia pegar o burrito bowl em vez do wrap?", context: "Alternative request", difficulty: "hard" },
    { id: 13, expression: "I'd love to try the mole sauce. What does it taste like?", translation: "Adoraria experimentar o molho mole. Como é o sabor?", context: "Curious customer", difficulty: "hard" },
    { id: 14, expression: "Can I substitute the sour cream with extra guacamole?", translation: "Posso substituir o creme azedo por guacamole extra?", context: "Substitution", difficulty: "hard" },
    { id: 15, expression: "I'll take the fajita platter for two, please.", translation: "Vou levar a fajita para dois, por favor.", context: "Sharing platter", difficulty: "hard" },
  ],

  phrasesEs: [
    { id: 1, expression: "Me gustaría tres tacos, por favor.", translation: "Eu gostaria de três tacos, por favor.", context: "Pedir tacos", difficulty: "easy" },
    { id: 2, expression: "¿Puedo pedir un burrito con pollo?", translation: "Posso pedir um burrito com frango?", context: "Pedir un burrito", difficulty: "easy" },
    { id: 3, expression: "Voy a pedir los nachos con guacamole.", translation: "Vou querer os nachos com guacamole.", context: "Pedir nachos", difficulty: "easy" },
    { id: 4, expression: "¿Qué lleva la quesadilla?", translation: "O que tem na quesadilla?", context: "Preguntar ingredientes", difficulty: "easy" },
    { id: 5, expression: "¿Puedo pedir salsa extra aparte?", translation: "Posso pegar salsa extra separada?", context: "Condimento extra", difficulty: "easy" },
    { id: 6, expression: "Me gustaría el taco de carne con pico de gallo.", translation: "Gostaria do taco de carne com pico de gallo.", context: "Taco específico", difficulty: "medium" },
    { id: 7, expression: "¿Puede hacerlo menos picante para mí?", translation: "Pode fazer menos apimentado para mim?", context: "Preferencia de picante", difficulty: "medium" },
    { id: 8, expression: "Voy a pedir el plato combo con arroz y frijoles.", translation: "Vou querer o prato combo com arroz e feijão.", context: "Pedido combo", difficulty: "medium" },
    { id: 9, expression: "¿Tienen opciones veganas?", translation: "Vocês têm opções veganas?", context: "Preferencia dietética", difficulty: "medium" },
    { id: 10, expression: "Me gustaría una margarita sin alcohol, por favor.", translation: "Gostaria de uma margarita sem álcool.", context: "Bebida sin alcohol", difficulty: "medium" },
    { id: 11, expression: "¿Cuál es la diferencia entre el taco callejero y el taco clásico?", translation: "Qual é a diferença entre o taco de rua e o taco clássico?", context: "Consulta del menú", difficulty: "hard" },
    { id: 12, expression: "¿Podría pedir el burrito bowl en lugar del wrap?", translation: "Poderia pegar o burrito bowl em vez do wrap?", context: "Solicitud alternativa", difficulty: "hard" },
    { id: 13, expression: "Me encantaría probar la salsa mole. ¿A qué sabe?", translation: "Adoraria experimentar o molho mole. Como é o sabor?", context: "Cliente curioso", difficulty: "hard" },
    { id: 14, expression: "¿Puedo sustituir la crema agria por guacamole extra?", translation: "Posso substituir o creme azedo por guacamole extra?", context: "Sustitución", difficulty: "hard" },
    { id: 15, expression: "Voy a llevar la fajita para dos, por favor.", translation: "Vou levar a fajita para dois, por favor.", context: "Plato para compartir", difficulty: "hard" },
  ],

  qaEn: [
    { question: "Welcome to El Patron! What can I get you today?", expectedAnswer: "I'd like three tacos, please.", translation: "Eu gostaria de três tacos, por favor.", hint: "I'd like three...", keywords: ["like", "three", "tacos", "please"] },
    { question: "What protein would you like in your taco?", expectedAnswer: "I'll have the beef with pico de gallo.", translation: "Vou querer a carne com pico de gallo.", hint: "I'll have the beef...", keywords: ["beef", "pico", "gallo"] },
    { question: "How spicy would you like it?", expectedAnswer: "Medium spicy, please.", translation: "Médio apimentado, por favor.", hint: "Medium spicy...", keywords: ["medium", "spicy", "please"] },
    { question: "Would you like rice and beans on the side?", expectedAnswer: "Yes, please. I love Mexican rice.", translation: "Sim, por favor. Adoro arroz mexicano.", hint: "Yes, please...", keywords: ["yes", "please", "rice"] },
    { question: "Can I get you anything to drink?", expectedAnswer: "I'll have a horchata, please.", translation: "Vou querer uma horchata, por favor.", hint: "I'll have a...", keywords: ["have", "horchata", "please"] },
    { question: "How would you like to pay?", expectedAnswer: "I'll pay by card, please.", translation: "Vou pagar no cartão.", hint: "I'll pay by...", keywords: ["pay", "card"] },
    { question: "Anything else for you today?", expectedAnswer: "No, that's all. It was delicious!", translation: "Não, é tudo. Foi delicioso!", hint: "That's all...", keywords: ["all", "delicious"] },
  ],

  qaEs: [
    { question: "¡Bienvenido a El Patron! ¿Qué te puedo servir hoy?", expectedAnswer: "Me gustaría tres tacos, por favor.", translation: "Eu gostaria de três tacos, por favor.", hint: "Me gustaría...", keywords: ["gustaría", "tres", "tacos"] },
    { question: "¿Qué proteína quieres en tu taco?", expectedAnswer: "Voy a pedir la de carne con pico de gallo.", translation: "Vou querer a carne com pico de gallo.", hint: "Voy a pedir...", keywords: ["carne", "pico", "gallo"] },
    { question: "¿Qué tan picante lo quieres?", expectedAnswer: "Picante medio, por favor.", translation: "Médio apimentado, por favor.", hint: "Picante medio...", keywords: ["picante", "medio", "favor"] },
    { question: "¿Quieres arroz y frijoles de acompañamiento?", expectedAnswer: "Sí, por favor. Me encanta el arroz mexicano.", translation: "Sim, por favor. Adoro arroz mexicano.", hint: "Sí, por favor...", keywords: ["sí", "favor", "arroz"] },
    { question: "¿Te traigo algo de tomar?", expectedAnswer: "Voy a pedir una horchata, por favor.", translation: "Vou querer uma horchata, por favor.", hint: "Voy a pedir...", keywords: ["horchata", "favor"] },
    { question: "¿Cómo vas a pagar?", expectedAnswer: "Voy a pagar con tarjeta, por favor.", translation: "Vou pagar no cartão.", hint: "Voy a pagar...", keywords: ["pagar", "tarjeta"] },
    { question: "¿Algo más para ti hoy?", expectedAnswer: "No, eso es todo. ¡Estuvo delicioso!", translation: "Não, é tudo. Foi delicioso!", hint: "Eso es todo...", keywords: ["eso", "todo", "delicioso"] },
  ],
};

// ===================================================================
// CABANA BURGER — Wagyu, Truffle, Smash, Artisan Burgers
// ===================================================================
const cabanaBurgerConfig: RestaurantVoiceConfig = {
  waiterEmoji: "🍔",
  waiterNameEn: "Jake",
  waiterNameEs: "Jake",
  welcomeEn: "Welcome to Cabana Burger! I'm Jake. Are you ready for the best burger in town?",
  welcomeEs: "¡Bienvenido a Cabana Burger! Soy Jake. ¿Listo para la mejor hamburguesa de la ciudad?",
  accentColor: "#d97706",
  bgColor: "#0a0602",

  phrasesEn: [
    { id: 1, expression: "I'd like a smash burger, please.", translation: "Eu gostaria de um smash burger, por favor.", context: "Ordering a burger", difficulty: "easy" },
    { id: 2, expression: "Can I get the Wagyu burger?", translation: "Posso pedir o hambúrguer Wagyu?", context: "Premium burger order", difficulty: "easy" },
    { id: 3, expression: "I'll have the truffle fries.", translation: "Vou querer as batatas trufadas.", context: "Ordering sides", difficulty: "easy" },
    { id: 4, expression: "What's the difference between the smash and the classic?", translation: "Qual é a diferença entre o smash e o clássico?", context: "Menu inquiry", difficulty: "easy" },
    { id: 5, expression: "Can I add a fried egg on top?", translation: "Posso adicionar um ovo frito por cima?", context: "Customizing burger", difficulty: "easy" },
    { id: 6, expression: "I'd like the double smash with bacon and cheddar.", translation: "Gostaria do double smash com bacon e cheddar.", context: "Premium order", difficulty: "medium" },
    { id: 7, expression: "Can I get the burger medium-rare, please?", translation: "Posso pedir o hambúrguer ao ponto para mal passado?", context: "Doneness preference", difficulty: "medium" },
    { id: 8, expression: "I'll have the milkshake with the burger combo.", translation: "Vou querer o milkshake com o combo de hambúrguer.", context: "Combo order", difficulty: "medium" },
    { id: 9, expression: "Do you have any plant-based options?", translation: "Vocês têm opções à base de plantas?", context: "Dietary preference", difficulty: "medium" },
    { id: 10, expression: "What's your most popular burger?", translation: "Qual é o hambúrguer mais popular de vocês?", context: "Recommendation", difficulty: "medium" },
    { id: 11, expression: "I'd like to try the Wagyu with truffle mayo and caramelized onions.", translation: "Gostaria de experimentar o Wagyu com maionese trufada e cebola caramelizada.", context: "Gourmet order", difficulty: "hard" },
    { id: 12, expression: "Can I substitute the brioche bun for a lettuce wrap?", translation: "Posso substituir o pão brioche por um wrap de alface?", context: "Low-carb request", difficulty: "hard" },
    { id: 13, expression: "What's the sourcing of your Wagyu beef?", translation: "Qual é a origem da carne Wagyu de vocês?", context: "Quality inquiry", difficulty: "hard" },
    { id: 14, expression: "I'd love the smash burger with a side of onion rings and a chocolate shake.", translation: "Adoraria o smash burger com anéis de cebola e um shake de chocolate.", context: "Full meal order", difficulty: "hard" },
    { id: 15, expression: "Could I get the sauce on the side and extra pickles?", translation: "Poderia pegar o molho separado e picles extra?", context: "Detailed customization", difficulty: "hard" },
  ],

  phrasesEs: [
    { id: 1, expression: "Me gustaría una smash burger, por favor.", translation: "Eu gostaria de um smash burger, por favor.", context: "Pedir hamburguesa", difficulty: "easy" },
    { id: 2, expression: "¿Puedo pedir la hamburguesa Wagyu?", translation: "Posso pedir o hambúrguer Wagyu?", context: "Hamburguesa premium", difficulty: "easy" },
    { id: 3, expression: "Voy a pedir las papas trufadas.", translation: "Vou querer as batatas trufadas.", context: "Pedir acompañamiento", difficulty: "easy" },
    { id: 4, expression: "¿Cuál es la diferencia entre la smash y la clásica?", translation: "Qual é a diferença entre o smash e o clássico?", context: "Consulta del menú", difficulty: "easy" },
    { id: 5, expression: "¿Puedo agregar un huevo frito encima?", translation: "Posso adicionar um ovo frito por cima?", context: "Personalizar hamburguesa", difficulty: "easy" },
    { id: 6, expression: "Me gustaría la double smash con tocino y cheddar.", translation: "Gostaria do double smash com bacon e cheddar.", context: "Pedido premium", difficulty: "medium" },
    { id: 7, expression: "¿Puedo pedir la hamburguesa a punto, por favor?", translation: "Posso pedir o hambúrguer ao ponto?", context: "Preferencia de cocción", difficulty: "medium" },
    { id: 8, expression: "Voy a pedir el milkshake con el combo de hamburguesa.", translation: "Vou querer o milkshake com o combo de hambúrguer.", context: "Pedido combo", difficulty: "medium" },
    { id: 9, expression: "¿Tienen opciones a base de plantas?", translation: "Vocês têm opções à base de plantas?", context: "Preferencia dietética", difficulty: "medium" },
    { id: 10, expression: "¿Cuál es la hamburguesa más popular?", translation: "Qual é o hambúrguer mais popular?", context: "Recomendación", difficulty: "medium" },
    { id: 11, expression: "Me gustaría probar la Wagyu con mayonesa trufada y cebolla caramelizada.", translation: "Gostaria de experimentar o Wagyu com maionese trufada e cebola caramelizada.", context: "Pedido gourmet", difficulty: "hard" },
    { id: 12, expression: "¿Puedo sustituir el pan brioche por una envoltura de lechuga?", translation: "Posso substituir o pão brioche por um wrap de alface?", context: "Solicitud low-carb", difficulty: "hard" },
    { id: 13, expression: "¿De dónde proviene su carne Wagyu?", translation: "Qual é a origem da carne Wagyu de vocês?", context: "Consulta de calidad", difficulty: "hard" },
    { id: 14, expression: "Me encantaría la smash burger con aros de cebolla y un batido de chocolate.", translation: "Adoraria o smash burger com anéis de cebola e um shake de chocolate.", context: "Pedido completo", difficulty: "hard" },
    { id: 15, expression: "¿Podría pedir la salsa aparte y pepinillos extra?", translation: "Poderia pegar o molho separado e picles extra?", context: "Personalización detallada", difficulty: "hard" },
  ],

  qaEn: [
    { question: "Welcome to Cabana Burger! What can I get you?", expectedAnswer: "I'd like a smash burger, please.", translation: "Eu gostaria de um smash burger, por favor.", hint: "I'd like a smash...", keywords: ["like", "smash", "burger", "please"] },
    { question: "How would you like your patty cooked?", expectedAnswer: "Medium-rare, please.", translation: "Ao ponto para mal passado, por favor.", hint: "Medium-rare...", keywords: ["medium", "rare", "please"] },
    { question: "Would you like to add any toppings?", expectedAnswer: "Yes, bacon and cheddar, please.", translation: "Sim, bacon e cheddar, por favor.", hint: "Yes, bacon...", keywords: ["bacon", "cheddar", "please"] },
    { question: "Would you like fries or onion rings with that?", expectedAnswer: "I'll have the truffle fries.", translation: "Vou querer as batatas trufadas.", hint: "I'll have the truffle...", keywords: ["truffle", "fries"] },
    { question: "Can I get you a drink?", expectedAnswer: "I'll have a chocolate milkshake.", translation: "Vou querer um milkshake de chocolate.", hint: "I'll have a chocolate...", keywords: ["chocolate", "milkshake"] },
    { question: "How would you like to pay?", expectedAnswer: "I'll pay by card, please.", translation: "Vou pagar no cartão.", hint: "I'll pay by...", keywords: ["pay", "card"] },
    { question: "Anything else for you today?", expectedAnswer: "No, that's all. It smells amazing!", translation: "Não, é tudo. Cheira incrível!", hint: "That's all...", keywords: ["all", "amazing", "smells"] },
    { question: "Your order is ready! Enjoy your burger!", expectedAnswer: "Thank you! This looks absolutely incredible.", translation: "Obrigado! Isso parece absolutamente incrível.", hint: "Thank you! This looks...", keywords: ["thank", "looks", "incredible"] },
  ],

  qaEs: [
    { question: "¡Bienvenido a Cabana Burger! ¿Qué te sirvo?", expectedAnswer: "Me gustaría una smash burger, por favor.", translation: "Eu gostaria de um smash burger, por favor.", hint: "Me gustaría...", keywords: ["gustaría", "smash", "burger"] },
    { question: "¿Cómo quieres la carne?", expectedAnswer: "A punto, por favor.", translation: "Ao ponto, por favor.", hint: "A punto...", keywords: ["punto", "favor"] },
    { question: "¿Te gustaría agregar ingredientes?", expectedAnswer: "Sí, tocino y cheddar, por favor.", translation: "Sim, bacon e cheddar, por favor.", hint: "Sí, tocino...", keywords: ["tocino", "cheddar", "favor"] },
    { question: "¿Quieres papas o aros de cebolla?", expectedAnswer: "Voy a pedir las papas trufadas.", translation: "Vou querer as batatas trufadas.", hint: "Voy a pedir...", keywords: ["papas", "trufadas"] },
    { question: "¿Te traigo algo de tomar?", expectedAnswer: "Voy a pedir un batido de chocolate.", translation: "Vou querer um milkshake de chocolate.", hint: "Voy a pedir...", keywords: ["batido", "chocolate"] },
    { question: "¿Cómo vas a pagar?", expectedAnswer: "Voy a pagar con tarjeta, por favor.", translation: "Vou pagar no cartão.", hint: "Voy a pagar...", keywords: ["pagar", "tarjeta"] },
    { question: "¿Algo más para ti hoy?", expectedAnswer: "No, eso es todo. ¡Huele increíble!", translation: "Não, é tudo. Cheira incrível!", hint: "Eso es todo...", keywords: ["eso", "todo", "increíble"] },
  ],
};

// ===================================================================
// REGISTRY
// ===================================================================
export const RESTAURANT_VOICE_CONFIGS: Record<string, RestaurantVoiceConfig> = {
  topdog: topDogConfig,
  laguapa: laGuapaConfig,
  elpatron: elPatronConfig,
  cabana: cabanaBurgerConfig,
};

export function getRestaurantVoiceConfig(slug: string): RestaurantVoiceConfig | null {
  return RESTAURANT_VOICE_CONFIGS[slug] ?? null;
}
