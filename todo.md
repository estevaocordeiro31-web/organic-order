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
