import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { BanReporteComponent } from '../../ban-reporte.component';
import { BanReporteRepository } from '../../ban-reporte.repository';
import { BanReporteService } from '../../ban-reporte.service';
import { BanReporteUiConfig } from '../../models/ban-reporte-ui.config';
import { BanReporteColumnaService } from '../../services/ban-reporte-columna.service';

@Component({
	selector: 'app-ban-reporte-cheque-emitidos',
	templateUrl: '../../ban-reporte.component.html',
})
export class BanReporteChequeEmitidosComponent extends BanReporteComponent {
	protected readonly configUi: BanReporteUiConfig = {
		codigo: 'BAN_CHEQUE_EMITIDOS',
		titulo: 'Reporte de Cheques Emitidos',
		columnas: [
			{ campo: 'NUMERO_DOCUMENTO', titulo: 'No. cheque', ancho: 110, alineacion: 'center' },
			{ campo: 'FECHA_EMISION', titulo: 'Fecha', ancho: 120, formato: 'fecha' },
			{ campo: 'NOMBRE_CUENTA_BANCO', titulo: 'Cuenta', ancho: 220 },
			{ campo: 'NOMBRE_BENEFICIARIO', titulo: 'Beneficiario', ancho: 220 },
			{ campo: 'NOMBRE_PARTIDA', titulo: 'Concepto', ancho: 260 },
			{ campo: 'MONTO_DOCUMENTO', titulo: 'Monto', ancho: 120, formato: 'moneda' },
			{ campo: 'NOMBRE_ESTADO_DOCUMENTO', titulo: 'Estado', ancho: 120 },
		],
	};

	constructor(
		appInfoService: AppInfoService,
		router: ActivatedRoute,
		repositorio: BanReporteRepository,
		servicio: BanReporteService,
		sanitizador: DomSanitizer,
		servicioColumna: BanReporteColumnaService
	) {
		super(appInfoService, router, repositorio, servicio, sanitizador, servicioColumna);
	}
}
