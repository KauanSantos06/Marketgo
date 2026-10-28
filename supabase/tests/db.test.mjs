import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
const SUPABASE = fileURLToPath(new URL('../', import.meta.url));
const ALICE = '11111111-1111-1111-1111-111111111111'; const BOB = '22222222-2222-2222-2222-222222222222'; const M = 'Mercado Bom Preço';
const SUPABASE_STUBS = `create schema auth; create table auth.users (id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$; create role anon nologin; create role authenticated nologin; grant usage on schema public, auth to anon, authenticated; insert into auth.users (id) values ('${ALICE}'), ('${BOB}');`;
let db;
before(async () => { db = new PGlite(); await db.exec(SUPABASE_STUBS); await db.exec(readFileSync(`${SUPABASE}/schema.sql`, 'utf8')); await db.exec(readFileSync(`${SUPABASE}/seed.sql`, 'utf8')); });
after(async () => { await db.close(); });
async function as(uid, fn) { await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false);`); try { return await fn(); } finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`); } }
async function rows(q, p) { return (await db.query(q, p)).rows; }
async function one(q, p) { return (await rows(q, p))[0]; }
async function productId(name, storeName) { return (await one(`select p.id from public.products p join public.stores s on s.id = p.store_id where p.name = $1 and s.name = $2`, [name, storeName])).id; }
async function createOrder(userId, storeName, items, opts = {}) { const store = await one('select id from public.stores where name = $1', [storeName]); return as(userId, async () => { const r = await db.query(`select public.create_order($1, $2::jsonb, $3, $4, $5, $6, $7, $8) as id`, [store.id, JSON.stringify(items), opts.payment ?? 'pix', opts.changeFor ?? null, opts.street ?? 'Rua Teste', opts.number ?? '123', opts.neighborhood ?? 'Centro', opts.complement ?? '']); return r.rows[0].id; }); }
async function advance(userId, id) { return as(userId, async () => (await db.query('select public.advance_order($1) as status', [id])).rows[0].status); }
async function cancel(userId, id) { return as(userId, () => db.query('select public.cancel_order($1)', [id])); }
describe('leitura e permissões', () => {
  it('usuário logado lê lojas e produtos ativos', async () => { assert.ok((await as(ALICE, () => rows('select id from public.stores'))).length >= 6); assert.ok((await as(ALICE, () => rows('select id from public.products'))).length >= 50); });
  it('ninguém escreve direto em orders ou order_items', async () => { await as(ALICE, async () => { await assert.rejects(db.query(`insert into public.orders (user_id, store_id, store_name, payment_method, address_street, address_number, address_neighborhood, subtotal, delivery_fee, total) values (auth.uid(), gen_random_uuid(), 'X', 'pix', 'a', '1', 'b', 1, 1, 2)`), /permission denied/i); }); });
  it('visitante não executa funções', async () => { try { await assert.rejects(db.query('select public.advance_order(gen_random_uuid())'), /permission denied/); } finally { await db.exec('reset role'); } });
});
describe('create order', () => {
  it('calcula total e guarda snapshot', async () => { const leite = await productId('Leite 1 L', M); const arroz = await productId('Arroz 5 kg', M); const id = await createOrder(ALICE, M, [{ product_id: leite, quantity: 2 }, { product_id: arroz, quantity: 1 }]); const o = await one('select * from orders where id = $1', [id]); assert.equal(o.status, 'received'); assert.equal(o.subtotal, '40.40'); assert.equal(o.delivery_fee, '5.90'); assert.equal(o.total, '46.30'); });
  it('respeita pedido mínimo', async () => { const pao = await productId('Pão francês (6 un)', 'Padaria Pão Quente'); await assert.rejects(createOrder(ALICE, 'Padaria Pão Quente', [{ product_id: pao, quantity: 1 }]), /O pedido mínimo desta loja é R\$ 10,00\./); });
  it('recusa loja fechada', async () => { const combo = await productId('Combo 20 peças', 'Sushi Sakura'); await assert.rejects(createOrder(ALICE, 'Sushi Sakura', [{ product_id: combo, quantity: 1 }]), /A loja está fechada no momento\./); });
  it('valida carrinho vazio, login, endereço e pagamento', async () => { const arroz = await productId('Arroz 5 kg', M); const item = [{ product_id: arroz, quantity: 1 }]; await assert.rejects(createOrder(ALICE, M, []), /O carrinho está vazio\./); await assert.rejects(createOrder(null, M, item), /Faça login para fazer um pedido\./); });
});
describe('privacidade', () => {
  it('cada usuário vê só seus pedidos', async () => { const arroz = await productId('Arroz 5 kg', M); const id = await createOrder(BOB, M, [{ product_id: arroz, quantity: 1 }]); assert.equal((await as(ALICE, () => rows('select id from orders where id = $1', [id]))).length, 0); assert.equal((await as(BOB, () => rows('select id from orders where id = $1', [id]))).length, 1); });
});
