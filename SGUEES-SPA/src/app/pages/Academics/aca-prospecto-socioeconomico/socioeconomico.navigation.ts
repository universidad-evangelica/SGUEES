import type { BecasMenuItem as MenuItem } from '../becas-convenios/becas-convenios.navigation';

// Agrupa las opciones que el servidor ya autorizó, conservando sus rutas y permisos.
export function agruparMenuSocioeconomico(items: readonly MenuItem[]): MenuItem[] {
    const codigos = ['ACA_SE_VERSION', 'ACA_SE_PREGUNTA', 'ACA_SE_VERSION_PREGUNTA', 'ACA_SE_OPCION', 'ACA_SE_RANGO_MONTO'];
    return items.map(sistema => {
        if (sistema['code'] !== 'ACADEMICS' || !sistema.items) return sistema;

        const opciones: MenuItem[] = [];
        const menus: (MenuItem & { items: MenuItem[] })[] = sistema.items.map(menu => ({
            ...menu,
            items: (menu.items ?? []).filter(opcion => {
                const pertenece = !opcion.items?.length && codigos.includes(String(opcion['code']));
                if (pertenece) opciones.push(opcion);
                return !pertenece;
            }),
        }));
        if (!opciones.length) return sistema;

        const grupo: MenuItem = {
            code: 'SOCIOECONOMICOS', codeSistema: 'ACADEMICS', codeMenu: 'GENERAL',
            text: 'Socioeconómicos', icon: 'group', path: '',
            order: Math.min(...opciones.map(opcion => Number(opcion['order']) || 0)),
            items: opciones.sort((a, b) => codigos.indexOf(String(a['code'])) - codigos.indexOf(String(b['code']))),
        };
        const general = menus.find(menu => menu['code'] === 'GENERAL');
        if (general) {
            const indiceBecas = general.items.findIndex(item => item['code'] === 'BECAS');
            if (indiceBecas >= 0) {
                grupo['order'] = general.items[indiceBecas]['order'] ?? 0;
                general.items.splice(indiceBecas + 1, 0, grupo);
            } else general.items.push(grupo);
        }
        else menus.push({
            code: 'GENERAL', codeSistema: 'ACADEMICS', codeMenu: 'GENERAL',
            text: 'Opciones Generales', icon: 'tableproperties', path: '', order: 1,
            items: [grupo],
        });
        return { ...sistema, items: menus.filter(menu => menu.items.length > 0) };
    });
}
