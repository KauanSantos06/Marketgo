import { supabase } from '@/lib/supabase';
import type { CreateOrderInput, Order } from '@/types';
export async function createOrder(input: CreateOrderInput): Promise<string> { const { data, error } = await supabase.rpc('create_order', { p_store_id: input.storeId, p_items: input.items, p_payment: input.payment, p_change_for: input.changeFor, p_street: input.street, p_number: input.number, p_neighborhood: input.neighborhood, p_complement: input.complement }); if (error) throw error; return data as string; }
export async function listOrders(): Promise<Order[]> { const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }); if (error) throw error; return (data ?? []) as Order[]; }
export async function getOrder(id: string): Promise<Order> { const { data, error } = await supabase.from('orders').select('*, items:order_items(*)').eq('id', id).single(); if (error) throw error; return data as Order; }
export async function advanceOrder(id: string): Promise<void> { const { error } = await supabase.rpc('advance_order', { p_order_id: id }); if (error) throw error; }
export async function cancelOrder(id: string): Promise<void> { const { error } = await supabase.rpc('cancel_order', { p_order_id: id }); if (error) throw error; }
export async function getLastAddress() { const { data, error } = await supabase.from('orders').select('address_street, address_number, address_neighborhood, address_complement').order('created_at', { ascending: false }).limit(1).maybeSingle(); if (error) throw error; return data; }
