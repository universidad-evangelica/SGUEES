import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { BanReporteDefinicion, BanReporteFiltro } from './models/ban-reporte-filtro';
import { BanReporteRepository } from './ban-reporte.repository';

@Injectable({ providedIn: 'root' })
export class BanReporteService {
	constructor(private repo: BanReporteRepository) {}

	esValido(
		codigo: string,
		filtro: BanReporteFiltro,
		definicion: BanReporteDefinicion | null,
		msg: Function
	): boolean {
		if (!codigo) {
			msg('Reporte no definido', NotifyType.Warning);
			return false;
		}
		if (!definicion?.SP_DISPONIBLE) {
			msg('Este reporte aún no está disponible en SGUEES', NotifyType.Warning);
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
		return true;
	}

	usaFiltro(definicion: BanReporteDefinicion | null | undefined, filtro: string): boolean {
		return definicion?.FILTROS?.includes(filtro) ?? false;
	}

	armarFiltroEnvio(codigo: string, filtro: BanReporteFiltro): BanReporteFiltro {
		const hoy = new Date();
		return {
			...filtro,
			CODIGO_REPORTE: codigo,
			FECHA_INICIAL: this.convertirFechaIso(filtro.FECHA_INICIAL),
			FECHA_FINAL: this.convertirFechaIso(filtro.FECHA_FINAL),
			FECHA_IMPRESION: this.convertirFechaIso(filtro.FECHA_IMPRESION ?? hoy),
		};
	}

	esPdfDisponible(definicion: BanReporteDefinicion | null | undefined): boolean {
		return !!definicion?.RPT_DISPONIBLE;
	}

	esConsultaGrid(definicion: BanReporteDefinicion | null | undefined): boolean {
		return !!definicion?.CONSULTA_GRID;
	}

	obtenerPdf(codigo: string, filtro: BanReporteFiltro): Observable<Blob> {
		return this.repo.obtenerPdf(this.armarFiltroEnvio(codigo, filtro));
	}

	private convertirFechaIso(value: Date | string | null | undefined): string | null {
		if (!value) {
			return null;
		}
		const date = value instanceof Date ? value : new Date(value);
		if (Number.isNaN(date.getTime())) {
			return null;
		}
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
}
