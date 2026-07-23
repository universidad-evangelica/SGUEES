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
import { columna } from '../shared/columnas-comunes';

@Component({
	selector: 'app-con-reporte-balance-general',
	templateUrl: '../con-reporte.component.html',
})
export class ConReporteBalanceGeneralComponent extends ConReporteComponent {
	protected readonly configUi: ConReporteUiConfig = {
		codigo: 'BALANCE_GENERAL',
		titulo: 'Balance General',
		columnas: [
			columna('CUENTA_CONTABLE1', 'Cuenta', 200),
			columna('NOMBRE_CUENTA1', 'Descripción', 160, { ajustarTexto: true }),
			columna('SALDO_FINAL1', 'Saldo', 110, { formato: 'moneda' }),
			columna('CUENTA_CONTABLE2', 'Cuenta', 200),
			columna('NOMBRE_CUENTA2', 'Descripción', 160, { ajustarTexto: true }),
			columna('SALDO_FINAL2', 'Saldo', 110, { formato: 'moneda' }),
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
