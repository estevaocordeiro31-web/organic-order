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
