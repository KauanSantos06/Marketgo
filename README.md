# MarketGo
Aplicativo mobile de compras com entrega: escolha uma loja, monte o carrinho, finalize o pedido e acompanhe cada etapa até a entrega. Os pagamentos são simulados.
## Como executar
1. `npm install`
2. Crie um projeto no Supabase e rode `supabase/schema.sql` e `supabase/seed.sql`.
3. Copie `.env.example` para `.env` e preencha com a URL e a chave pública.
4. `npx expo start -c`
## Segurança
O app não escreve em `orders` nem em `order_items`: não há política de insert, update ou delete. Toda escrita passa por funções que validam os dados.
