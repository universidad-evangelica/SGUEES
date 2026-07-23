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
import {
	COL_ABONOS,
	COL_CARGOS,
	COL_CUENTA,
	COL_NOMBRE_CUENTA,
	COL_SALDO_FINAL,
	COL_SALDO_INICIAL,
} from '../shared/columnas-comunes';

@Component({
	selector: 'app-con-reporte-balance-general-vertical',
	templateUrl: '../con-reporte.component.html',
})
export class ConReporteBalanceGeneralVerticalComponent extends ConReporteComponent {
	protected readonly configUi: ConReporteUiConfig = {
		codigo: 'BALANCE_GENERAL_VERTICAL',
		titulo: 'Balance General Vertical',
		columnas: [COL_CUENTA, COL_NOMBRE_CUENTA, COL_SALDO_INICIAL, COL_CARGOS, COL_ABONOS, COL_SALDO_FINAL],
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
