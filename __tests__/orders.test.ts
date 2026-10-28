import { canCancel, isActive, nextStatus, timeline } from '@/utils/orders';
describe('timeline', () => { it('marca concluídas, a atual e as pendentes', () => { expect(timeline('preparing').map((s) => s.state)).toEqual(['done', 'current', 'pending', 'pending']); }); });
describe('status', () => { it('nextStatus segue a ordem', () => { expect(nextStatus('received')).toBe('preparing'); expect(nextStatus('out_for_delivery')).toBe('delivered'); }); it('só cancela um pedido recém-recebido', () => { expect(canCancel('received')).toBe(true); expect(canCancel('preparing')).toBe(false); }); });
