import { Type } from '@angular/core';
import { Routes } from '@angular/router';

import { ConReporteLibroDiarioAuxiliarComponent } from './libro-diario-auxiliar/con-reporte-libro-diario-auxiliar.component';
import { ConReporteLibroDiarioAuxiliarMesComponent } from './libro-diario-auxiliar-mes/con-reporte-libro-diario-auxiliar-mes.component';
import { ConReporteLibroDiarioMayorComponent } from './libro-diario-mayor/con-reporte-libro-diario-mayor.component';
import { ConReporteBalanceComprobacionComponent } from './balance-comprobacion/con-reporte-balance-comprobacion.component';
import { ConReporteBalanceComprobacionMesComponent } from './balance-comprobacion-mes/con-reporte-balance-comprobacion-mes.component';
import { ConReporteBalanceGeneralComponent } from './balance-general/con-reporte-balance-general.component';
import { ConReporteEstadoResultadosComponent } from './estado-resultados/con-reporte-estado-resultados.component';
import { ConReporteBalanceGeneralVerticalComponent } from './balance-general-vertical/con-reporte-balance-general-vertical.component';

/** Catálogo único de reportes contables (ruta SPA + componente + título). */
export interface ConReporteRouteDefinition {
	path: string;
	component: Type<unknown>;
	titulo: string;
	codigo: string;
}

export const CON_REPORTE_ROUTE_DEFINITIONS: ConReporteRouteDefinition[] = [
	{
		path: 'con-reporte-libro-diario-auxiliar',
		component: ConReporteLibroDiarioAuxiliarComponent,
		titulo: 'Libro Diario Auxiliar',
		codigo: 'LIBRO_DIARIO_AUXILIAR',
	},
	{
		path: 'con-reporte-libro-diario-auxiliar-mes',
		component: ConReporteLibroDiarioAuxiliarMesComponent,
		titulo: 'Libro Diario Auxiliar - Saldo Mes',
		codigo: 'LIBRO_DIARIO_AUXILIAR_MES',
	},
	{
		path: 'con-reporte-libro-diario-mayor',
		component: ConReporteLibroDiarioMayorComponent,
		titulo: 'Libro Diario Mayor',
		codigo: 'LIBRO_DIARIO_MAYOR',
	},
	{
		path: 'con-reporte-balance-comprobacion',
		component: ConReporteBalanceComprobacionComponent,
		titulo: 'Balance de Comprobación',
		codigo: 'BALANCE_COMPROBACION',
	},
	{
		path: 'con-reporte-balance-comprobacion-mes',
		component: ConReporteBalanceComprobacionMesComponent,
		titulo: 'Balance de Comprobación - Saldo Mes',
		codigo: 'BALANCE_COMPROBACION_MES',
	},
	{
		path: 'con-reporte-balance-general',
		component: ConReporteBalanceGeneralComponent,
		titulo: 'Balance General',
		codigo: 'BALANCE_GENERAL',
	},
	{
		path: 'con-reporte-estado-resultados',
		component: ConReporteEstadoResultadosComponent,
		titulo: 'Estado de Resultados',
		codigo: 'ESTADO_RESULTADOS',
	},
	{
		path: 'con-reporte-balance-general-vertical',
		component: ConReporteBalanceGeneralVerticalComponent,
		titulo: 'Balance General Vertical',
		codigo: 'BALANCE_GENERAL_VERTICAL',
	},
];

export function buildConReporteRoutes(
	canActivate: unknown[],
	canDeactivate?: unknown[]
): Routes {
	return CON_REPORTE_ROUTE_DEFINITIONS.map((def) => ({
		path: def.path,
		component: def.component,
		data: { titulo: def.titulo, codigoReporte: def.codigo },
		canActivate,
		...(canDeactivate ? { canDeactivate } : {}),
	}));
}
