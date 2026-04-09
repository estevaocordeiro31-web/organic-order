# Organic Order - TODO

## Backend & Database
- [x] Schema: tabelas menuItems, menuCategories, orders, orderItems, tables
- [x] Seed do cardápio completo em inglês baseado no menu real do Organic
- [x] API tRPC: CRUD cardápio, criar pedidos, listar pedidos, atualizar status
- [x] Notificação ao café quando novo pedido chegar

## Interface do Aluno (Customer)
- [x] Tela inicial com boas-vindas em inglês e seleção de mesa
- [x] Cardápio organizado por categorias (Coffees, Toasts, Salads, Burgers, Desserts, Drinks)
- [x] Descrições dos produtos em inglês
- [x] Simulação de conversa com garçom (expressões autênticas em inglês)
- [x] Sistema de carrinho com revisão do pedido em inglês
- [x] Confirmação do pedido com feedback em inglês
- [x] Acesso via QR Code (rota /order?table=X)

## Painel de Gestão (Café Organic)
- [x] Dashboard de pedidos em tempo real
- [x] Gestão de status: novo → preparando → pronto → entregue
- [x] Identificação de mesa/aluno em cada pedido
- [x] Gestão do cardápio (ativar/desativar itens)

## Design & UX
- [x] Identidade visual inspirada no Organic (verde, orgânico, natural)
- [x] Design responsivo mobile-first (QR Code = celular)
- [x] Tema claro com tons verdes e terrosos

## Extras
- [x] Geração de QR Code para cada mesa
- [x] Testes vitest (16 testes passando)

## v2 - Avatares, Imagens e Espanhol
- [x] Avatar Disney-Pixar da Gabi com camiseta americana (inglês)
- [x] Avatar Disney-Pixar do Cris com camiseta da Espanha (espanhol)
- [x] Avatares com uniforme do Organic (welcome page)
- [x] Imagens dos itens do cardápio
- [x] Reestruturar página inicial: boas-vindas ao Organic + seleção de idioma
- [x] Botões de idioma: Gabi (inglês/EUA) e Cris (espanhol/Espanha)
- [x] Suporte a espanhol no cardápio (descriptionEs, nameEs)
- [x] Integrar avatares e imagens no app

## v3 - Gamificação e Experiência Educacional Completa
- [x] Gerar avatares Cris e Gabi com uniforme Organic In The Box
- [x] Criar vídeo de boas-vindas Ken Burns com narração e legendas duplas (EN/PT)
- [x] Botão de pular animação
- [x] Exercícios de chunks e vocabulário pós-animação (PhraseBuilder)
- [x] Seleção de idioma (Gabi=English, Cris=Español)
- [x] Sistema de pedidos por voz - nível fácil (vê a opção e lê gravando)
- [x] Sistema de pedidos por voz - nível médio (vê a opção, some na hora de gravar)
- [x] Sistema de pedidos por voz - nível avançado (sem referência, avatar faz pergunta)
- [x] Garçom aleatório (Gabi ou Cris) inicia atendimento
- [x] Jogo de perguntas e respostas por comando de voz (QASimulation)
- [x] Jogo de ordenar expressões (PhraseBuilder com chunks)
- [x] Seed de dados em espanhol para cardápio
- [x] Atualizar imagens dos itens do cardápio no banco
- [x] Gerar animações do Cris e Gabi atendendo no cenário real do Organic (vídeo Ken Burns 33s)
## v4 - Ajustes de UI da Página de Boas-Vindas
- [x] Logo Organic In The Box em destaque no topo
- [x] Imagens maiores do Cris e da Gabi na seleção de idioma
- [x] Frase-chave dos donos na página de boas-vindas

## v5 - Reconhecimento de Voz, Pontuação e Notificações
- [x] Integrar Web Speech API no Voice Order (gravação e transcrição real)
- [x] Integrar Web Speech API no Q&A Simulation (gravação e transcrição real)
- [x] Feedback de pronúncia/acerto com comparação de texto
- [x] Hook reutilizável useSpeechRecognition para todos os jogos
- [x] Sistema de pontuação por atividade (XP por acerto)
- [x] Tabela de scores no banco de dados
- [x] Leaderboard/ranking entre alunos da InFlux
- [x] Notificações sonoras no painel admin quando novo pedido chegar
- [x] Polling automático de pedidos no admin dashboard
- [x] Indicador visual de novos pedidos (badge/contador)

## v6 - Relatório de Progresso, Happy Hour e Pagamento Stripe
- [ ] Página de relatório de progresso por aluno (para professores)
- [ ] Filtros por aluno, período, tipo de jogo e idioma
- [ ] Gráficos de evolução (acertos ao longo do tempo)
- [ ] Detalhamento por atividade (expressões mais praticadas, dificuldades)
- [ ] Exportar relatório (visualização)
- [ ] Sistema de promoções Happy Hour no cardápio
- [ ] Tabela de promoções no banco de dados (horário início/fim, desconto, itens)
- [ ] Painel admin para criar/editar promoções
- [ ] Exibição de promoções ativas no cardápio do aluno
- [ ] Badge visual de promoção nos itens com desconto
- [ ] Integração Stripe para pagamento
- [ ] Setup Stripe (webdev_add_feature)
- [ ] Checkout após confirmação do pedido
- [ ] Webhook de confirmação de pagamento
- [ ] Status de pagamento no painel admin

## v6.1 - Melhorias no Vídeo de Boas-Vindas
- [x] Gerar novas imagens Disney-Pixar sem distorção para o vídeo (10 cenas)
- [x] Expandir roteiro: falar mais sobre o conceito do Organic (100% saudável)
- [x] Expandir roteiro: enfatizar que alunos praticam idioma enquanto pedem comida real
- [x] Mais cenas para transição Ken Burns mais suave (10 cenas vs 7 anterior)
- [x] Produzir novo vídeo com narração atualizada e legendas duplas (60s)
- [x] Integrar novo vídeo no app

## v6.2 - Pagamento Pix e Notificação WhatsApp
- [x] Sistema de pagamento via Pix (QR Code Pix)
- [x] Upload de comprovante de pagamento pelo aluno
- [x] Comprovante anexado ao pedido no painel admin
- [x] Notificação WhatsApp para 11947515284 com dados do pedido
- [x] Webhook genérico configurável no admin para integração com bot InFlux
- [x] Mensagem formatada: mesa, aluno, itens, valor, comprovante

## v6.3 - Correção de Proporção do Vídeo
- [x] Investigar problema de proporção/distorção nas imagens do vídeo
- [x] Corrigir script de geração para manter aspect ratio correto
- [x] Regenerar vídeo com proporções corretas
- [x] Integrar vídeo corrigido no app

## v7 - ImAInd Restaurant Experience (Transformação Multi-Tenant)

### Identidade Visual ImAInd
- [x] Criar logo ImAInd (futurista, cosmopolita, IA + gastronomia)
- [x] Definir paleta de cores e tipografia da marca ImAInd (azul marinho, elétrico, dourado)
- [x] Criar tela de splash com logo ImAInd animada

### Tela de Entrada Imersiva
- [x] Tela de boas-vindas: "Você está pronto para se divertir simulando estar em um restaurante em outra parte do mundo?"
- [x] Botão "Assumir controle de voz" → ativa modo voz
- [x] Botão "Continuar" → modo texto/clique
- [x] Seleção de idioma: Inglês 🇺🇸 ou Espanhol 🇪🇸

### Seleção de Parceiros
- [x] Tela de seleção com 4 cards visuais dos restaurantes
- [x] Card Organic In The Box (verde, saudável, Jundiaí)
- [x] Card Top Dog Brasil (preto/vermelho, hot dogs prensados, Rua do Retiro 1276)
- [x] Card La Guapa (bege/dourado, empanadas argentinas, Rua do Retiro 848)
- [x] Card El Patron (vermelho escuro/dourado, mexicano, Rua do Retiro 1222)

### Schema Multi-Tenant (Banco de Dados)
- [x] Tabela `restaurants` (id, slug, name, cuisine_type, theme_color, logo_url, address)
- [x] Tabela `restaurant_staff` (id, restaurant_id, name, role, avatar_url)
- [x] Migrar tabelas existentes para incluir restaurant_id
- [x] Seed: inserir os 4 restaurantes com dados reais
- [ ] Seed: cardápios em EN/ES para Top Dog, La Guapa e El Patron

### Dashboards Isolados por Parceiro
- [ ] Cada parceiro vê apenas seus pedidos (filtro por restaurant_id)
- [ ] QR Code por mesa por restaurante
- [ ] Painel admin master (Estevão) vê todos os restaurantes
- [ ] Login do parceiro associado ao restaurant_id

### Cardápios Traduzidos (EN/ES)
- [ ] Top Dog Brasil: traduzir cardápio completo para inglês e espanhol
- [ ] La Guapa: traduzir cardápio completo para inglês e espanhol
- [ ] El Patron: traduzir cardápio para inglês (já tem nomes em espanhol)

## v8 - Cardápios e Experiências dos Parceiros

### Pesquisa e Conteúdo
- [ ] Pesquisar cardápio real do Top Dog Brasil
- [ ] Pesquisar cardápio real da La Guapa
- [ ] Pesquisar cardápio real do El Patron
- [ ] Traduzir cardápios para EN e ES

### Assets Visuais
- [ ] Gerar imagens dos pratos do Top Dog (estilo urbano/neon)
- [ ] Gerar imagens dos pratos da La Guapa (estilo rústico/argentino)
- [ ] Gerar imagens dos pratos do El Patron (estilo mexicano/vibrante)

### Experiências Imersivas
- [ ] Interface Top Dog: visual urbano, neon, dark, street food
- [ ] Interface La Guapa: visual rústico, bege/dourado, argentino artesanal
- [ ] Interface El Patron: visual mexicano vibrante, cores quentes, festivo

### Banco de Dados
- [ ] Seed cardápio Top Dog em PT/EN/ES
- [ ] Seed cardápio La Guapa em PT/EN/ES
- [ ] Seed cardápio El Patron em PT/EN/ES

### Dashboard por Parceiro
- [ ] Filtro por restaurantId no painel admin
- [ ] Login do parceiro associado ao restaurant_id
- [ ] QR Codes exclusivos por mesa de cada parceiro
- [ ] Painel master para Estevão (todos os restaurantes)

## v8.1 - Status de Implementação (concluído)
- [x] Pesquisar cardápio real do Top Dog Brasil (site oficial)
- [x] Pesquisar cardápio real da La Guapa (iFood + site)
- [x] Pesquisar cardápio real do El Patron (Goomer)
- [x] Traduzir cardápios para EN e ES (62 itens totais)
- [x] Gerar imagens Disney-Pixar dos pratos do Top Dog
- [x] Gerar imagens Disney-Pixar dos pratos da La Guapa
- [x] Gerar imagens Disney-Pixar dos pratos do El Patron
- [x] Interface Top Dog: visual urbano neon preto/vermelho com grid lines
- [x] Interface La Guapa: visual rústico bege/dourado com textura de pontos
- [x] Interface El Patron: visual mexicano vibrante vermelho/laranja com diagonais
- [x] Seed cardápio Top Dog em PT/EN/ES (15 itens, 3 categorias, 8 mesas)
- [x] Seed cardápio La Guapa em PT/EN/ES (17 itens, 5 categorias, 6 mesas)
- [x] Seed cardápio El Patron em PT/EN/ES (30 itens, 9 categorias, 8 mesas)
- [x] Rotas /topdog, /laguapa, /elpatron ativas no app
- [x] Tela de seleção de parceiros com imagens reais dos pratos
- [x] 65 testes passando (18 novos testes de multi-tenant)

## v9 - Dashboards Isolados por Parceiro
- [x] Tabela `partner_users` no banco: login exclusivo por restaurante
- [x] Seed: criar usuários admin para cada parceiro (topdog, laguapa, elpatron, organic)
- [x] Procedure tRPC: login de parceiro com JWT isolado por restaurant_id
- [x] Procedure tRPC: listar pedidos filtrados por restaurant_id do usuário logado
- [x] Procedure tRPC: atualizar status de pedido (apenas do próprio restaurante)
- [x] Página /partner/login: tela de login para parceiros
- [x] Página /partner/dashboard: dashboard isolado com pedidos do próprio restaurante
- [x] Tema visual do dashboard por parceiro (cores do restaurante)
- [x] QR Codes exclusivos por mesa de cada restaurante (/topdog?table=1, etc.)
- [x] Página /master: painel master do Estevão com todos os restaurantes
- [x] Visão consolidada: pedidos de todos os restaurantes em tempo real
- [x] Filtro por restaurante no painel master
- [x] Métricas por restaurante: total de pedidos, faturamento, alunos ativos

## v10 - Cabana Burger (5º Parceiro)
- [x] Pesquisar Cabana Burger Jundiaí e @Rebeca_oscalis
- [x] Gerar imagens dos pratos do Cabana Burger estilo Disney-Pixar
- [x] Criar experiência visual imersiva do Cabana Burger (dark/neon amarelo)
- [x] Seed cardápio Cabana Burger em PT/EN/ES (10 categorias, 26 itens)
- [x] Adicionar card do Cabana Burger na tela de seleção de parceiros
- [x] Criar usuário parceiro: cabana / cabana2024 (Rebeca - Cabana Burger)
- [x] QR Codes por mesa do Cabana Burger (via /partner/qrcodes)

## v11 - Modo Voz nos Novos Parceiros

- [ ] Criar hook useRestaurantVoice com vocabulário específico por parceiro
- [ ] Top Dog: frases de pedido em EN/ES (hot dogs, smash burgers, fries)
- [ ] La Guapa: frases de pedido em EN/ES (empanadas, sabores, combos)
- [ ] El Patron: frases de pedido em EN/ES (tacos, burritos, nachos)
- [ ] Cabana Burger: frases de pedido em EN/ES (burgers, Wagyu, shakes)
- [x] Integrar VoiceOrder no TopDogExperience
- [x] Integrar VoiceOrder no LaGuapaExperience
- [x] Integrar VoiceOrder no ElPatronExperience
- [x] Integrar VoiceOrder no CabanaBurgerExperience
- [x] Integrar QASimulation nos 4 novos parceiros
- [ ] Garçons virtuais com voz EN/ES para cada parceiro

## v12 - Tela de Feedback + Captação de Leads inFlux

- [ ] Gerar avatar Disney-Pixar do Lucas (consultor inFlux, americano)
- [ ] Gerar avatar Disney-Pixar da Vicky (consultora inFlux, brasileira)
- [ ] Componente ExperienceFeedback: avaliação com estrelas (1-5)
- [ ] Pergunta: "Você achou legal aprender um segundo idioma assim?"
- [ ] Se sim: apresentar Lucas e Vicky com proposta da inFlux
- [ ] CTA WhatsApp: botão que abre conversa direta com Lucas ou Vicky
- [ ] Salvar lead no banco: nome, telefone, restaurante, idioma, nota, interesse
- [ ] Notificar Lucas e Vicky via WhatsApp quando lead demonstrar interesse
- [ ] Integrar tela de feedback no final do Organic, Top Dog, La Guapa, El Patron, Cabana
- [ ] Mensagem personalizada por idioma (EN/ES/PT)
- [ ] Backend: tabela leads com dados completos

## v13 - Renomear App para ImAInd

- [x] Atualizar VITE_APP_TITLE para "ImAInd Restaurant Experience"
- [x] Atualizar título na aba do browser (index.html)
- [x] Manter "Organic In The Box" apenas dentro da experiência do parceiro Organic
- [x] Verificar e remover referências ao nome antigo em meta tags e manifest

## v14 - Consultores Configuráveis por Parceiro

- [x] Adicionar tabela `partner_consultants` no schema (restaurantId, name, role, avatarUrl, whatsappNumber, active, sortOrder)
- [x] Migrar banco com pnpm db:push
- [x] Seed: inserir Lucas e Vicky como consultores padrão para todos os parceiros
- [x] Procedure tRPC: listar consultores por restaurante (público)
- [x] Procedure tRPC: CRUD de consultores (apenas parceiro autenticado do próprio restaurante)
- [x] Procedure tRPC: upload de foto do consultor via S3
- [x] UI: aba "Consultores" no PartnerDashboard com lista de consultores
- [x] UI: formulário para adicionar/editar consultor (nome, cargo, WhatsApp, foto)
- [x] UI: upload de foto com preview
- [x] UI: toggle ativar/desativar consultor
- [x] UI: reordenar consultores (drag or up/down arrows)
- [x] Integrar consultores do banco no ExperienceFeedback (substituir hardcoded Lucas/Vicky)
- [x] Fallback: se nenhum consultor configurado, usar Lucas e Vicky padrão
- [x] Testes vitest para as novas procedures

## v15 - Modo Voz nos 4 Novos Parceiros

- [x] Criar vocabulário EN/ES para Top Dog Brasil (hot dogs, smash burgers, fries, drinks)
- [x] Criar vocabulário EN/ES para La Guapa (empanadas, sabores, combos, drinks)
- [x] Criar vocabulário EN/ES para El Patron (tacos, burritos, nachos, quesadillas)
- [x] Criar vocabulário EN/ES para Cabana Burger (burgers, Wagyu, truffle, smash, shakes)
- [x] Criar hook useRestaurantVoice com vocabulário específico por restaurantSlug
- [x] Integrar VoiceOrder no TopDogExperience
- [x] Integrar VoiceOrder no LaGuapaExperience
- [x] Integrar VoiceOrder no ElPatronExperience
- [x] Integrar VoiceOrder no CabanaBurgerExperience
- [x] Integrar QASimulation nos 4 novos parceiros
- [x] Garçons virtuais com frases de boas-vindas específicas por parceiro (EN/ES)
- [x] Testes vitest para o vocabulário e hook de voz

## v16 - Painel de Leads no Master Dashboard

- [x] Procedure tRPC: listar leads com filtros (restaurante, período, interesse)
- [x] Procedure tRPC: exportar leads como CSV
- [x] UI: aba "Leads" no MasterDashboard com tabela paginada
- [x] Filtros: por restaurante, idioma, nota (1-5), período (hoje/semana/mês)
- [x] Colunas: nome, telefone, restaurante, idioma, nota, consultor, data, interesse
- [x] Botão exportar CSV (download direto no browser)
- [x] Badge com contagem de novos leads desde último acesso
- [x] Testes vitest para as procedures de leads

## v17 - Relatório de Progresso por Aluno

- [x] Procedure tRPC: listar scores agrupados por aluno (nome, total XP, atividades)
- [x] Procedure tRPC: detalhar progresso de um aluno (por atividade, por sessão)
- [x] Procedure tRPC: ranking geral com filtro por restaurante
- [x] UI: página /master/progress com lista de alunos e métricas
- [x] Gráfico de evolução de XP ao longo do tempo (recharts)
- [x] Detalhamento por tipo de atividade (Voice Order, Q&A, Phrase Builder)
- [x] Top 10 expressões mais praticadas por aluno
- [x] Filtros: por restaurante, idioma, período
- [x] Testes vitest para as procedures de progresso

## v18 - Text-to-Speech nos Garçons Virtuais

- [x] Hook useTTS: wrapper da Web Speech Synthesis API
- [x] Configurar voz EN (en-US) e ES (es-ES) por idioma
- [x] Integrar TTS no PartnerQASimulation: garçom lê a pergunta em voz alta
- [x] Integrar TTS no PartnerVoiceGame: garçom lê a frase de referência
- [x] Integrar TTS no QASimulation (Organic): garçom lê a pergunta
- [x] Integrar TTS no VoiceOrder (Organic): garçom lê a frase
- [x] Botão de toggle mute/unmute no canto da tela
- [x] Preferência de mute salva no localStorage
- [x] Testes vitest para o hook useTTS

## v19 - Feedback de IA em Tempo Real no Q&A Simulation

- [x] Procedure tRPC: `game.aiFeedback` — recebe transcript + pergunta + resposta esperada e retorna comentário personalizado via LLM
- [x] Prompt de sistema: professor de inglês/espanhol que dá feedback encorajador, aponta erros gramaticais e sugere alternativas mais naturais
- [x] Integrar no QASimulation (Organic): exibir comentário da IA após cada resposta
- [x] Integrar no PartnerQASimulation: exibir comentário da IA após cada resposta
- [x] Loading state enquanto IA processa (skeleton/spinner)
- [x] Feedback colapsável (expandir para ver detalhes)
- [x] Testes vitest para a procedure aiFeedback

## v20 - Notificação Automática WhatsApp para Consultores

- [x] Procedure tRPC: `leads.notifyConsultant` — dispara WhatsApp para o consultor quando lead tem nota >= 4
- [x] Mensagem formatada: nome do aluno, telefone, restaurante, idioma, nota, data
- [x] Trigger automático: ao salvar lead com interesse = true, notificar consultor escolhido
- [x] Fallback: se consultor não tem WhatsApp cadastrado, notificar número padrão (Lucas/Vicky)
- [x] Log de notificações enviadas no banco (evitar duplicatas)
- [x] Testes vitest para a procedure de notificação

## v21 - Página Pública de Resultados por Aluno

- [x] Rota pública `/aluno/:studentName` — sem autenticação
- [x] Buscar scores do aluno por nome (case-insensitive)
- [x] Exibir: total de XP, atividades realizadas, expressões praticadas, restaurantes visitados
- [x] Gráfico de evolução de XP ao longo do tempo
- [x] Top 5 expressões mais praticadas
- [x] Badge de conquistas (primeiro pedido, 10 expressões, 50 XP, etc.)
- [x] Botão "Compartilhar" que copia URL para clipboard
- [x] Design imersivo com tema ImAInd
- [x] Testes vitest para as procedures públicas de progresso


## v22 - Migração para VPS Própria (72.62.9.120)

- [ ] Criar repositório GitHub em github.com/estevaocordeiro31-web
- [ ] Exportar código completo do projeto para GitHub
- [ ] Remover vite-plugin-manus-runtime do package.json
- [ ] Remover Manus OAuth (substituir por JWT simples)
- [ ] Remover Forge API imports (invokeLLM, storagePut, notifyOwner)
- [ ] Substituir Forge Storage por filesystem local (/uploads)
- [ ] Substituir Forge LLM por Google Gemini API ou OpenAI
- [ ] Criar .env.example com todas as variáveis
- [ ] Criar script deploy/setup.sh para VPS
- [ ] Testar build e testes localmente
- [ ] Verificar compatibilidade com MySQL compartilhado
- [ ] Gerar documentação de deployment
