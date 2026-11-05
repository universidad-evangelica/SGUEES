export type BecaConvenioTabId = 'entidades' | 'convenios' | 'financiadores';

export interface BecaConvenioTab {
  id: BecaConvenioTabId;
  text: string;
  path: string;
  icon: string;
}

export const BECAS_CONVENIOS_TABS: readonly BecaConvenioTab[] = [
  { id: 'entidades', text: 'Iglesias e instituciones', path: '/aca-bec-entidad-financiadora', icon: 'group' },
  { id: 'convenios', text: 'Convenios', path: '/aca-bec-convenio', icon: 'doc' },
  { id: 'financiadores', text: 'Financiadores', path: '/aca-bec-financiador', icon: 'money' },
];

export const BECAS_CONVENIOS_TITULO = 'Convenios y financiamiento';

export interface BecasMenuItem {
  path?: string;
  text?: string;
  items?: BecasMenuItem[];
  workspacePaths?: string[];
  [key: string]: unknown;
}

// Agrupa solo opciones que el servidor ya entrego al usuario, sin agregar permisos.
export function agruparMenuConvenios(items: readonly BecasMenuItem[], puedeLeer: (path: string) => boolean): BecasMenuItem[] {
  const hijos = items.map(item => ({ ...item, ...(item.items ? { items: agruparMenuConvenios(item.items, puedeLeer) } : {}) }));
  const path = (item: BecasMenuItem): string => item.path ? '/' + item.path.replace(/^\/+/, '').replace(/\/$/, '') : '';
  const rutas = BECAS_CONVENIOS_TABS.map(tab => tab.path);
  const candidatos = hijos.filter(item => !item.items?.length && rutas.includes(path(item)));
  if (!candidatos.length) return hijos;
  const relacionados = candidatos.filter(item => puedeLeer(path(item)));
  if (!relacionados.length) return hijos.filter(item => !candidatos.includes(item));

  const principal = relacionados.find(item => path(item) === '/aca-bec-convenio') ?? relacionados[0];
  const agrupado: BecasMenuItem = {
    ...principal,
    text: BECAS_CONVENIOS_TITULO,
    order: Math.min(...relacionados.map(item => typeof item['order'] === 'number' ? item['order'] as number : 0)),
    workspacePaths: Array.from(new Set(relacionados.flatMap(item =>
      item.workspacePaths?.length ? item.workspacePaths.filter(ruta => rutas.includes(ruta) && puedeLeer(ruta)) : [path(item)]))),
  };
  let agregado = false;
  return hijos.flatMap(item => {
    if (!candidatos.includes(item)) return [item];
    if (agregado) return [];
    agregado = true;
    return [agrupado];
  });
}
