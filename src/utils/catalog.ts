import type { Product, Store, StoreCategory } from '@/types';
const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
export function filterStores(stores: Store[], query: string, category: StoreCategory | null): Store[] { const q = normalize(query.trim()); return stores.filter((s) => { if (category && s.category !== category) return false; return !q || normalize(`${s.name} ${s.category} ${s.description}`).includes(q); }); }
export function sortStores(stores: Store[]): Store[] { return [...stores].sort((a, b) => Number(b.is_open) - Number(a.is_open) || b.rating - a.rating); }
export interface ProductSection { title: string; data: Product[]; }
export function groupProducts(products: Product[]): ProductSection[] { const sections = new Map<string, Product[]>(); for (const p of products) { const list = sections.get(p.section); if (list) list.push(p); else sections.set(p.section, [p]); } return Array.from(sections, ([title, data]) => ({ title, data })); }
export const formatEta = (min: number, max: number) => `${min}-${max} min`;
