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
	selector: 'app-ban-reporte-estado-cuenta-acumulado',
	templateUrl: '../../ban-reporte.component.html',
})
export class BanReporteEstadoCuentaAcumuladoComponent extends BanReporteComponent {
	protected readonly configUi: BanReporteUiConfig = {
		codigo: 'BAN_ESTADO_CUENTA_ACUMULADO',
		titulo: 'Disponibilidad Bancaria',
		columnas: [
			{ campo: 'NOMBRE_CUENTA_BANCO', titulo: 'Cuenta', ancho: 220 },
			{ campo: 'SALDO_INICIAL', titulo: 'Saldo inicial', ancho: 130, formato: 'moneda' },
			{ campo: 'MONTO_CARGO', titulo: 'Cargos', ancho: 120, formato: 'moneda' },
			{ campo: 'MONTO_ABONO', titulo: 'Abonos', ancho: 120, formato: 'moneda' },
			{ campo: 'SALDO_ACTUAL', titulo: 'Saldo final', ancho: 130, formato: 'moneda' },
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
