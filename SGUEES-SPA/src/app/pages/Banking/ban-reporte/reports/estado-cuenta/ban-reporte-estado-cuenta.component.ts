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
	selector: 'app-ban-reporte-estado-cuenta',
	templateUrl: '../../ban-reporte.component.html',
})
export class BanReporteEstadoCuentaComponent extends BanReporteComponent {
	protected readonly configUi: BanReporteUiConfig = {
		codigo: 'BAN_ESTADO_CUENTA',
		titulo: 'Disponibilidad Bancaria Auxiliar',
		columnas: [
			{ campo: 'FECHA_MOVIMIENTO', titulo: 'Fecha', ancho: 120, formato: 'fecha' },
			{ campo: 'REFERENCIA', titulo: 'Referencia', ancho: 280 },
			{ campo: 'MONTO_CARGO', titulo: 'Cargo', ancho: 120, formato: 'moneda' },
			{ campo: 'MONTO_ABONO', titulo: 'Abono', ancho: 120, formato: 'moneda' },
			{ campo: 'SALDO_ACTUAL', titulo: 'Saldo', ancho: 120, formato: 'moneda' },
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
