import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { ConReporteDefinicion, ConReporteFiltro } from './models/con-reporte-filtro';
import { ConReporteRepository } from './con-reporte.repository';

@Injectable({
	providedIn: 'root',
})
export class ConReporteService {
	constructor(private repo: ConReporteRepository) {}

	esValido(
		codigo: string,
		filtro: ConReporteFiltro,
		definicion: ConReporteDefinicion | null,
		msg: Function
	): boolean {
		if (!codigo) {
			msg('Reporte no definido', NotifyType.Warning);
			return false;
		}
		if (!definicion?.SP_DISPONIBLE) {
			msg('Este reporte aun no esta disponible en SGUEES', NotifyType.Warning);
			return false;
		}
		if (this.usaFiltro(definicion, 'FECHA_INICIAL') && !filtro.FECHA_INICIAL) {
			msg('Indique la fecha inicial', NotifyType.Warning);
			return false;
		}
		if (this.usaFiltro(definicion, 'FECHA_FINAL') && !filtro.FECHA_FINAL) {
			msg('Indique la fecha final', NotifyType.Warning);
			return false;
		}
		if (this.usaFiltro(definicion, 'ANIO_PERIODO') && !filtro.ANIO_PERIODO) {
			msg('Indique el ano', NotifyType.Warning);
			return false;
		}
		if (this.usaFiltro(definicion, 'MES_PERIODO') && !filtro.MES_PERIODO) {
			msg('Indique el mes', NotifyType.Warning);
			return false;
		}
		if (this.usaFiltro(definicion, 'CORR_CONFI_REPORTE') && !filtro.CORR_CONFI_REPORTE) {
			msg('Seleccione la configuracion de reporte', NotifyType.Warning);
			return false;
		}
		return true;
	}

	usaFiltro(definicion: ConReporteDefinicion | null | undefined, filtro: string): boolean {
		return definicion?.FILTROS?.includes(filtro) ?? false;
	}

	buildPayload(codigo: string, filtro: ConReporteFiltro): ConReporteFiltro {
		return {
			...filtro,
			CODIGO_REPORTE: codigo,
			CUENTA_DEPARTAMENTO: filtro.CUENTA_DEPARTAMENTO || filtro.CUENTA_CONTABLE || null,
		};
	}

	esPdfDisponible(definicion: ConReporteDefinicion | null | undefined): boolean {
		return !!definicion?.RPT_DISPONIBLE;
	}

	esConsultaGrid(definicion: ConReporteDefinicion | null | undefined): boolean {
		return !!definicion?.CONSULTA_GRID;
	}

	getPDF(codigo: string, filtro: ConReporteFiltro): Observable<Blob> {
		return this.repo.getPDF(this.buildPayload(codigo, filtro));
	}
}
