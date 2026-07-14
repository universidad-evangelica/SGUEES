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
	COL_SALDO_INICIAL,
	COL_SALDO_MES,
} from '../shared/columnas-comunes';

@Component({
	selector: 'app-con-reporte-balance-comprobacion-mes',
	templateUrl: '../con-reporte.component.html',
})
export class ConReporteBalanceComprobacionMesComponent extends ConReporteComponent {
	protected readonly configUi: ConReporteUiConfig = {
		codigo: 'BALANCE_COMPROBACION_MES',
		titulo: 'Balance de Comprobación - Saldo Mes',
		columnas: [COL_CUENTA, COL_NOMBRE_CUENTA, COL_SALDO_INICIAL, COL_CARGOS, COL_ABONOS, COL_SALDO_MES],
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
