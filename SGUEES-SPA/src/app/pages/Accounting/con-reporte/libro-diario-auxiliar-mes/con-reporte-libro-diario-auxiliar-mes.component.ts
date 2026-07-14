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
	COL_CLASE,
	COL_CUENTA,
	COL_DOCUMENTO,
	COL_FECHA,
	COL_MONTO_ABONO,
	COL_MONTO_CARGO,
	COL_NOMBRE_CUENTA,
	COL_SALDO_MES,
} from '../shared/columnas-comunes';

@Component({
	selector: 'app-con-reporte-libro-diario-auxiliar-mes',
	templateUrl: '../con-reporte.component.html',
})
export class ConReporteLibroDiarioAuxiliarMesComponent extends ConReporteComponent {
	protected readonly configUi: ConReporteUiConfig = {
		codigo: 'LIBRO_DIARIO_AUXILIAR_MES',
		titulo: 'Libro Diario Auxiliar - Saldo Mes',
		columnas: [
			COL_CUENTA,
			COL_NOMBRE_CUENTA,
			COL_FECHA,
			COL_DOCUMENTO,
			COL_CLASE,
			COL_MONTO_CARGO,
			COL_MONTO_ABONO,
			COL_SALDO_MES,
		],
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
