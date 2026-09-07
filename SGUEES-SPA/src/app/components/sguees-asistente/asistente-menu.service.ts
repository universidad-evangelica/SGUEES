import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AsistenteOpcion } from './models/asistente-opcion.model';

/** Misma convención que side-navigation-menu (code → text). */
function menuNodeCode(item: { code?: string; text?: string } | null | undefined, fallback = 'node'): string {
	return String(item?.code || item?.text || fallback);
}

function buildMenuKey(prefix: string, code: string): string {
	return prefix ? `${prefix}/${code}` : code;
}

@Injectable({ providedIn: 'root' })
export class AsistenteMenuService {
	constructor(private authService: AuthService) {}

	loadOpciones(): Observable<AsistenteOpcion[]> {
		return this.authService.getMainMenu().pipe(map((menu) => this.flattenMenu(menu)));
	}

	private flattenMenu(menu: any[]): AsistenteOpcion[] {
		const opciones: AsistenteOpcion[] = [];

		for (const sistema of menu || []) {
			const modulo = (sistema?.text || sistema?.code || 'Módulo').toString();
			const moduloCode = menuNodeCode(sistema, 'modulo');
			for (const menuTab of sistema?.items || []) {
				const menuNombre = (menuTab?.text || menuTab?.codeMenu || 'Menú').toString();
				const menuCode = menuNodeCode(menuTab, 'menu');
				const menuKey = buildMenuKey(moduloCode, menuCode);
				for (const opt of menuTab?.items || []) {
					const ruta = this.normalizePath(opt?.path);
					if (!ruta || ruta === '/home') {
						continue;
					}
					if (!this.authService.hasReadPermission(ruta)) {
						continue;
					}
					opciones.push({
						modulo,
						menu: menuNombre,
						titulo: (opt?.text || opt?.code || ruta).toString(),
						ruta,
						menuKey,
					});
				}
			}
		}

		return opciones.sort((a, b) =>
			`${a.modulo}|${a.menu}|${a.titulo}`.localeCompare(`${b.modulo}|${b.menu}|${b.titulo}`, 'es')
		);
	}

	private normalizePath(path?: string): string {
		const value = (path || '').trim();
		if (!value) {
			return '';
		}
		return value.startsWith('/') ? value : `/${value}`;
	}
}
