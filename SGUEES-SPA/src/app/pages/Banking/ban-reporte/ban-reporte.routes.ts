import { Type } from '@angular/core';
import { Routes } from '@angular/router';

import { BanReporteChequeEmitidosComponent } from './reports/cheque-emitidos/ban-reporte-cheque-emitidos.component';
import { BanReporteEstadoCuentaComponent } from './reports/estado-cuenta/ban-reporte-estado-cuenta.component';
import { BanReporteEstadoCuentaAcumuladoComponent } from './reports/estado-cuenta-acumulado/ban-reporte-estado-cuenta-acumulado.component';
import { BanReporteEntregaChequesComponent } from './reports/entrega-cheques/ban-reporte-entrega-cheques.component';

export interface BanReporteRouteDefinition {
	path: string;
	component: Type<unknown>;
	titulo: string;
	codigo: string;
	urlOpcion: string;
}

export const BAN_REPORTE_ROUTE_DEFINITIONS: BanReporteRouteDefinition[] = [
	{
		path: 'ban-reporte-cheque-emitidos',
		component: BanReporteChequeEmitidosComponent,
		titulo: 'Reporte de Cheques Emitidos',
		codigo: 'BAN_CHEQUE_EMITIDOS',
		urlOpcion: '/ban-reporte-cheque-emitidos',
	},
	{
		path: 'ban-reporte-estado-cuenta',
		component: BanReporteEstadoCuentaComponent,
		titulo: 'Disponibilidad Bancaria Auxiliar',
		codigo: 'BAN_ESTADO_CUENTA',
		urlOpcion: '/ban-reporte-estado-cuenta',
	},
	{
		path: 'ban-reporte-estado-cuenta-acumulado',
		component: BanReporteEstadoCuentaAcumuladoComponent,
		titulo: 'Disponibilidad Bancaria',
		codigo: 'BAN_ESTADO_CUENTA_ACUMULADO',
		urlOpcion: '/ban-reporte-estado-cuenta-acumulado',
	},
	{
		path: 'ban-reporte-entrega-cheques',
		component: BanReporteEntregaChequesComponent,
		titulo: 'Reporte de Cheques Entregados',
		codigo: 'BAN_ENTREGA_CHEQUES',
		urlOpcion: '/ban-reporte-entrega-cheques',
	},
];

export function buildBanReporteRoutes(canActivate: unknown[]): Routes {
	return BAN_REPORTE_ROUTE_DEFINITIONS.map((def) => ({
		path: def.path,
		component: def.component,
		data: { titulo: def.titulo, codigoReporte: def.codigo, urlOpcion: def.urlOpcion },
		canActivate,
	}));
}
