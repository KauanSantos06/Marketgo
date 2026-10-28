import type { Product, Store } from '@/types';
import { filterStores, formatEta, groupProducts, sortStores } from '@/utils/catalog';
const store = (partial: Partial<Store> & Pick<Store, 'id' | 'name'>): Store => ({ category: 'Mercado', emoji: '🛒', description: '', rating: 4.5, delivery_fee: 5, eta_min: 30, eta_max: 45, min_order: 0, is_open: true, ...partial });
const stores = [store({ id: '1', name: 'Mercado Bom Preço', rating: 4.7 }), store({ id: '2', name: 'Padaria Pão Quente', category: 'Padaria', rating: 4.8 }), store({ id: '3', name: 'Farmácia Vida', category: 'Farmácia', rating: 4.6, description: 'Medicamentos' }), store({ id: '4', name: 'Sushi Sakura', category: 'Restaurante', rating: 4.9, is_open: false })];
describe('filterStores', () => { it('busca sem acento e sem diferença de maiúsculas', () => { expect(filterStores(stores, 'FARMACIA', null).map((s) => s.id)).toEqual(['3']); expect(filterStores(stores, 'pao', null).map((s) => s.id)).toEqual(['2']); }); });
describe('sortStores', () => { it('coloca as abertas primeiro', () => { expect(sortStores(stores).map((s) => s.id)).toEqual(['2', '1', '3', '4']); }); });
it('formatEta usa travessão', () => { expect(formatEta(30, 45)).toBe('30-45 min'); });
