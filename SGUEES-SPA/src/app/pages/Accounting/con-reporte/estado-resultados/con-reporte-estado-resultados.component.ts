import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ConReporteComponent } from '../con-reporte.component';
import { ConReporteRepository } from '../con-reporte.repository';
import { ConReporteService } from '../con-reporte.service';
import { ConParametroService } from '../../con-parametro/con-parametro.service';
import { ConReporteUiConfig } from '../models/con-reporte-ui.config';
import { ConReporteColumnaService } from '../services/con-reporte-columna.service';
import { COL_CUENTA, COL_NOMBRE_CUENTA, COL_SALDO_FINAL, columna } from '../shared/columnas-comunes';

@Component({
	selector: 'app-con-reporte-estado-resultados',
	templateUrl: '../con-reporte.component.html',
})
export class ConReporteEstadoResultadosComponent extends ConReporteComponent {
	protected readonly configUi: ConReporteUiConfig = {
		codigo: 'ESTADO_RESULTADOS',
		titulo: 'Estado de Resultados',
		columnas: [
			columna('CUENTA_MAYOR_1', 'Cuenta mayor', 120),
			columna('NOMBRE_CUENTA_MAYOR_1', 'Descripción mayor', 180, { ajustarTexto: true }),
			COL_CUENTA,
			COL_NOMBRE_CUENTA,
			columna('SALDO_MES', 'Saldo mes', 110, { formato: 'moneda' }),
			COL_SALDO_FINAL,
		],
		filtroInicial: { fechaCorteMesAnterior: true },
	};

	constructor(
		appInfoService: AppInfoService,
		router: ActivatedRoute,
		repositorio: ConReporteRepository,
		servicio: ConReporteService,
		servicioParametro: ConParametroService,
		sanitizador: DomSanitizer,
		servicioColumna: ConReporteColumnaService,
	) {
		super(appInfoService, router, repositorio, servicio, servicioParametro, sanitizador, servicioColumna);
	}
}
