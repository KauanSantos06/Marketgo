import { ORDER_FLOW } from '@/constants/catalog';
import type { OrderStatus } from '@/types';
export type StepState = 'done' | 'current' | 'pending';
export function timeline(status: OrderStatus): { status: OrderStatus; state: StepState }[] { const current = ORDER_FLOW.indexOf(status); return ORDER_FLOW.map((s, i) => ({ status: s, state: status === 'cancelled' ? 'pending' : i < current || status === 'delivered' ? 'done' : i === current ? 'current' : 'pending' })); }
export function nextStatus(status: OrderStatus): OrderStatus | null { const i = ORDER_FLOW.indexOf(status); return i >= 0 && i < ORDER_FLOW.length - 1 ? ORDER_FLOW[i + 1] : null; }
export const isActive = (status: OrderStatus) => status !== 'delivered' && status !== 'cancelled';
export const canCancel = (status: OrderStatus) => status === 'received';
