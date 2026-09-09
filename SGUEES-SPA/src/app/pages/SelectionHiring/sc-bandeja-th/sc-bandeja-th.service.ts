import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { ScBandejaHistorialItem, ScBandejaItem } from './models/sc-bandeja-th-item';
import { ScBandejaThRepository } from './sc-bandeja-th.repository';

/** Misma catálogo de estados que sc-requisicion-personal.service.ts */
export const BANDEJA_ESTADOS_REQUISICION: {
	CORR_ESTADO_REQUISICION: number;
	ESTADO_REQUISICION: string;
}[] = [
	{ CORR_ESTADO_REQUISICION: 1, ESTADO_REQUISICION: 'Borrador' },
	{ CORR_ESTADO_REQUISICION: 2, ESTADO_REQUISICION: 'En Aprobación' },
	{ CORR_ESTADO_REQUISICION: 3, ESTADO_REQUISICION: 'Devuelta' },
	{ CORR_ESTADO_REQUISICION: 4, ESTADO_REQUISICION: 'Rechazada' },
	{ CORR_ESTADO_REQUISICION: 5, ESTADO_REQUISICION: 'Aprobada' },
	{ CORR_ESTADO_REQUISICION: 6, ESTADO_REQUISICION: 'Publicada' },
	{ CORR_ESTADO_REQUISICION: 7, ESTADO_REQUISICION: 'En Reclutamiento' },
	{ CORR_ESTADO_REQUISICION: 8, ESTADO_REQUISICION: 'En Selección' },
	{ CORR_ESTADO_REQUISICION: 9, ESTADO_REQUISICION: 'En Contratación' },
	{ CORR_ESTADO_REQUISICION: 10, ESTADO_REQUISICION: 'Parcial Cubierta' },
	{ CORR_ESTADO_REQUISICION: 11, ESTADO_REQUISICION: 'Cerrada' },
	{ CORR_ESTADO_REQUISICION: 12, ESTADO_REQUISICION: 'Cancelada' },
];

@Injectable({
	providedIn: 'root',
})
export class ScBandejaThService {
	constructor(private repo: ScBandejaThRepository) {}

	getEstadoRequisicionLabel(corrEstado: number | null | undefined): string {
		const corr = Number(corrEstado) > 0 ? Number(corrEstado) : 1;
		const item = BANDEJA_ESTADOS_REQUISICION.find((x) => x.CORR_ESTADO_REQUISICION === corr);
		return item?.ESTADO_REQUISICION ?? 'Borrador';
	}

	/** Clases CSS alineadas a sc-requisicion-personal (estado-req--*). */
	getEstadoRequisicionBadgeClass(corrEstado: number | null | undefined): string {
		const corr = Number(corrEstado) > 0 ? Number(corrEstado) : 1;
		switch (corr) {
			case 1:
				return 'estado-req--borrador';
			case 2:
				return 'estado-req--aprobacion';
			case 3:
				return 'estado-req--devuelta';
			case 4:
				return 'estado-req--rechazada';
			case 5:
				return 'estado-req--aprobada';
			case 6:
				return 'estado-req--publicada';
			case 7:
			case 8:
			case 9:
				return 'estado-req--proceso';
			case 10:
				return 'estado-req--parcial';
			case 11:
				return 'estado-req--cerrada';
			case 12:
				return 'estado-req--cancelada';
			default:
				return 'estado-req--borrador';
		}
	}

	getEstadoTone(corrEstado: number | null | undefined): string {
		const cls = this.getEstadoRequisicionBadgeClass(corrEstado);
		return cls.replace('estado-req--', '');
	}

	getRequisiciones(param: {
		PAGE?: number;
		PAGE_SIZE?: number;
		SORT_FIELD?: string;
		SORT_DESC?: boolean;
		CORR_ESTADO_REQUISICION?: number;
		CORR_UNIDAD?: number;
		FECHA_DESDE?: string | Date | null;
		FECHA_HASTA?: string | Date | null;
		BUSQUEDA?: string;
	}): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'PAGE', Value: param.PAGE ?? 1 },
			{ Parameter: 'PAGE_SIZE', Value: param.PAGE_SIZE ?? 50 },
			{ Parameter: 'SORT_FIELD', Value: param.SORT_FIELD ?? 'FECHA_REQUISICION' },
			{ Parameter: 'SORT_DESC', Value: param.SORT_DESC ?? true },
		];

		if (param.CORR_ESTADO_REQUISICION != null && param.CORR_ESTADO_REQUISICION > 0) {
			xWhere.push({
				Parameter: 'CORR_ESTADO_REQUISICION',
				Value: param.CORR_ESTADO_REQUISICION,
			});
		}
		if (param.CORR_UNIDAD != null && param.CORR_UNIDAD > 0) {
			xWhere.push({ Parameter: 'CORR_UNIDAD', Value: param.CORR_UNIDAD });
		}
		if (param.FECHA_DESDE) {
			xWhere.push({ Parameter: 'FECHA_DESDE', Value: this.toIsoDate(param.FECHA_DESDE) });
		}
		if (param.FECHA_HASTA) {
			xWhere.push({ Parameter: 'FECHA_HASTA', Value: this.toIsoDate(param.FECHA_HASTA) });
		}
		if (param.BUSQUEDA?.trim()) {
			xWhere.push({ Parameter: 'BUSQUEDA', Value: param.BUSQUEDA.trim() });
		}

		return this.repo.getRequisiciones(xWhere);
	}

	getBitacoraRequisicion(corrRequisicion: number): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_REQUISICION_PERSONAL', Value: corrRequisicion },
		];
		return this.repo.getBitacoraRequisicion(xWhere);
	}

	mapRequisicionToBandejaItem(row: any): ScBandejaItem {
		const corr = Number(row?.CORR_REQUISICION_PERSONAL) || 0;
		const corrEstado = Number(row?.CORR_ESTADO_REQUISICION) || 1;
		const fecha = row?.FECHA_REQUISICION;

		return {
			ID: `REQ-${corr}`,
			TIPO: 'REQUISICION',
			CODIGO: `REQ-${corr}`,
			DESCRIPCION: row?.NOMBRE_PUESTO || '—',
			SUBTITULO: row?.NOMBRE_UNIDAD || '',
			SOLICITANTE: row?.NOMBRE_SOLICITANTE || row?.USUARIO_CREA || '—',
			CARGO_SOLICITANTE: row?.USUARIO_CREA || undefined,
			FECHA: fecha,
			ESTADO: this.getEstadoRequisicionLabel(corrEstado),
			ESTADO_TONE: this.getEstadoTone(corrEstado),
			CORR_REQUISICION_PERSONAL: corr,
			CORR_ESTADO_REQUISICION: corrEstado,
			NOMBRE_UNIDAD: row?.NOMBRE_UNIDAD,
			NOMBRE_PUESTO: row?.NOMBRE_PUESTO,
			NOMBRE_TIPO_VACANTE: row?.NOMBRE_TIPO_VACANTE,
			NOMBRE_TIPO_MODALIDAD: row?.MODALIDAD_NOMBRE,
			NOMBRE_TIPO_CONTRATACION: row?.NOMBRE_TIPO_CONTRATACION,
			CANTIDAD_PLAZAS: row?.CANTIDAD_PLAZAS,
			PLAZAS_CUBIERTAS: row?.PLAZAS_CUBIERTAS,
			SALARIO: row?.SALARIO,
			HORARIO: row?.HORARIO,
			TIEMPO_CONTRATO: row?.TIEMPO_CONTRATO,
			JUSTIFICACION: row?.JUSTIFICACION,
			REQUIERE_ATENCION: corrEstado === 2 || corrEstado === 3,
			HISTORIAL: [],
		};
	}

	mapBitacoraToHistorial(rows: any[]): ScBandejaHistorialItem[] {
		if (!Array.isArray(rows)) {
			return [];
		}

		return rows.map((h) => ({
			FECHA: h?.FECHA_ACCION,
			USUARIO: h?.LOGIN_SISTEMA || '—',
			ACCION: h?.NOMBRE_PASO || h?.ESTADO_DESTINO || 'Movimiento',
			COMENTARIO: h?.COMENTARIO || undefined,
		}));
	}

	private toIsoDate(value: string | Date): string {
		if (value instanceof Date) {
			const y = value.getFullYear();
			const m = String(value.getMonth() + 1).padStart(2, '0');
			const d = String(value.getDate()).padStart(2, '0');
			return `${y}-${m}-${d}`;
		}
		const raw = String(value);
		return raw.length >= 10 ? raw.substring(0, 10) : raw;
	}
}
