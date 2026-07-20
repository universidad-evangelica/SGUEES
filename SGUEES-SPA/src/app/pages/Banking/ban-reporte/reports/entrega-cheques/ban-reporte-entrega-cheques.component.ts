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
	selector: 'app-ban-reporte-entrega-cheques',
	templateUrl: '../../ban-reporte.component.html',
})
export class BanReporteEntregaChequesComponent extends BanReporteComponent {
	protected readonly configUi: BanReporteUiConfig = {
		codigo: 'BAN_ENTREGA_CHEQUES',
		titulo: 'Reporte de Cheques Entregados',
		columnas: [
			{ campo: 'FECHA_ENTREGA', titulo: 'Fecha entrega', ancho: 130, formato: 'fecha' },
			{ campo: 'NUMERO_DOCUMENTO', titulo: 'No. cheque', ancho: 110, alineacion: 'center' },
			{ campo: 'NOMBRE_BENEFICIARIO', titulo: 'Beneficiario', ancho: 220 },
			{ campo: 'MONTO_DOCUMENTO', titulo: 'Monto', ancho: 120, formato: 'moneda' },
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
