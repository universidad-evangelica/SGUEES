import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import {
	ScBandejaActoresHistorialItem,
	ScBandejaActoresItem,
} from './models/sc-bandeja-actores-item';
import { ScBandejaActoresRepository } from './sc-bandeja-actores.repository';

/** Estados de requisición relevantes para actores (flujo 1–5). */
export const BANDEJA_ACTORES_ESTADOS_REQUISICION: {
	CORR_ESTADO_REQUISICION: number;
	ESTADO_REQUISICION: string;
}[] = [
	{ CORR_ESTADO_REQUISICION: 2, ESTADO_REQUISICION: 'En Aprobación' },
	{ CORR_ESTADO_REQUISICION: 3, ESTADO_REQUISICION: 'Devuelta' },
	{ CORR_ESTADO_REQUISICION: 4, ESTADO_REQUISICION: 'Rechazada' },
	{ CORR_ESTADO_REQUISICION: 5, ESTADO_REQUISICION: 'Aprobada' },
];

export const OPERACION_BANDEJA_ACTORES = {
	APROBAR: 3,
	DEVOLVER: 4,
	RECHAZAR: 5,
} as const;

@Injectable({
	providedIn: 'root',
})
export class ScBandejaActoresService {
	constructor(private repo: ScBandejaActoresRepository) {}

	getEstadoRequisicionLabel(corrEstado: number | null | undefined): string {
		const corr = Number(corrEstado) > 0 ? Number(corrEstado) : 1;
		const item = BANDEJA_ACTORES_ESTADOS_REQUISICION.find(
			(x) => x.CORR_ESTADO_REQUISICION === corr
		);
		if (item) {
			return item.ESTADO_REQUISICION;
		}
		switch (corr) {
			case 1:
				return 'Borrador';
			default:
				return '—';
		}
	}

	getEstadoTone(corrEstado: number | null | undefined): string {
		const corr = Number(corrEstado) > 0 ? Number(corrEstado) : 1;
		switch (corr) {
			case 2:
				return 'aprobacion';
			case 3:
				return 'devuelta';
			case 4:
				return 'rechazada';
			case 5:
				return 'aprobada';
			default:
				return 'borrador';
		}
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
			{ Parameter: 'SORT_FIELD', Value: param.SORT_FIELD ?? 'FECHA_NOTIFICACION' },
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
		return this.repo.getBitacoraRequisicion([
			{ Parameter: 'CORR_REQUISICION_PERSONAL', Value: corrRequisicion },
		]);
	}

	getCandidatos(param: {
		PAGE?: number;
		PAGE_SIZE?: number;
		SORT_FIELD?: string;
		SORT_DESC?: boolean;
		CORR_UNIDAD?: number;
		FECHA_DESDE?: string | Date | null;
		FECHA_HASTA?: string | Date | null;
		BUSQUEDA?: string;
	}): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'PAGE', Value: param.PAGE ?? 1 },
			{ Parameter: 'PAGE_SIZE', Value: param.PAGE_SIZE ?? 50 },
			{ Parameter: 'SORT_FIELD', Value: param.SORT_FIELD ?? 'FECHA_GENERACION' },
			{ Parameter: 'SORT_DESC', Value: param.SORT_DESC ?? true },
		];

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

		return this.repo.getCandidatos(xWhere);
	}

	getUnidades(): Observable<IResult> {
		return this.repo.getUnidades();
	}

	getKpis(): Observable<IResult> {
		return this.repo.getKpis();
	}

	autorizaRequisicion(payload: {
		CORR_REQUISICION_PERSONAL: number;
		OPERACION: number;
		OBSERVACION?: string;
		CORR_UNIDAD_DOCUMENTO?: number | null;
	}): Observable<IResult> {
		return this.repo.autorizaRequisicion({
			CORR_REQUISICION_PERSONAL: payload.CORR_REQUISICION_PERSONAL,
			OPERACION: payload.OPERACION,
			OBSERVACION: payload.OBSERVACION ?? null,
			CORR_UNIDAD_DOCUMENTO: payload.CORR_UNIDAD_DOCUMENTO ?? null,
		});
	}

	decideCandidato(payload: {
		CORR_REQUISICION_PERSONAL: number;
		CORR_SOLICITUD_EMPLEO: number;
		CORR_EXPEDIENTE_CANDIDATO: number;
		ESTADO_DECISION: string;
		OBSERVACION_DECISION?: string;
	}): Observable<IResult> {
		return this.repo.decideCandidato(payload);
	}

	mapRequisicionToBandejaItem(row: any): ScBandejaActoresItem {
		const corr = Number(row?.CORR_REQUISICION_PERSONAL) || 0;
		const corrEstado = Number(row?.CORR_ESTADO_REQUISICION) || 1;

		return {
			ID: `REQ-${corr}`,
			TIPO: 'REQUISICION',
			CODIGO: `REQ-${corr}`,
			DESCRIPCION: row?.NOMBRE_PUESTO || '—',
			SUBTITULO: row?.NOMBRE_UNIDAD || '',
			SOLICITANTE: row?.NOMBRE_SOLICITANTE || row?.USUARIO_CREA || '—',
			CARGO_SOLICITANTE: row?.USUARIO_CREA || undefined,
			FECHA: row?.FECHA_NOTIFICACION || row?.FECHA_REQUISICION,
			ESTADO: this.getEstadoRequisicionLabel(corrEstado),
			ESTADO_TONE: this.getEstadoTone(corrEstado),
			CORR_REQUISICION_PERSONAL: corr,
			CORR_ESTADO_REQUISICION: corrEstado,
			CORR_UNIDAD: Number(row?.CORR_UNIDAD) || undefined,
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
			MENSAJE_NOTIFICACION: row?.MENSAJE_NOTIFICACION || undefined,
			REQUIERE_ATENCION: true,
			HISTORIAL: [],
		};
	}

	mapCandidatoToBandejaItem(row: any): ScBandejaActoresItem {
		const corrSol = Number(row?.CORR_SOLICITUD_EMPLEO) || 0;
		const corrReq = Number(row?.CORR_REQUISICION_PERSONAL) || 0;
		const corrExp = Number(row?.CORR_EXPEDIENTE_CANDIDATO) || 0;
		const nombre = row?.NOMBRE_PERSONA || '—';
		const codigo = corrExp > 0 ? `CAN-${corrExp}` : `SOL-${corrSol}`;

		return {
			ID: `${codigo}-REQ-${corrReq}`,
			TIPO: 'CANDIDATO',
			CODIGO: codigo,
			DESCRIPCION: nombre,
			SUBTITULO: [row?.NOMBRE_PUESTO, row?.NOMBRE_UNIDAD].filter(Boolean).join(' · '),
			SOLICITANTE: row?.NOMBRE_SOLICITANTE || row?.USUARIO_SOLICITANTE_REQ || '—',
			CARGO_SOLICITANTE: row?.USUARIO_SOLICITANTE_REQ || undefined,
			FECHA: row?.FECHA_GENERACION,
			ESTADO: 'En proceso de selección',
			ESTADO_TONE: 'proceso',
			CORR_REQUISICION_PERSONAL: corrReq,
			CORR_ESTADO_REQUISICION: Number(row?.CORR_ESTADO_REQUISICION) || undefined,
			CORR_UNIDAD: Number(row?.CORR_UNIDAD) || undefined,
			CORR_EXPEDIENTE_CANDIDATO: corrExp > 0 ? corrExp : undefined,
			CORR_SOLICITUD_EMPLEO: corrSol,
			CORR_PERSONA_DATOS: Number(row?.CORR_PERSONA_DATOS) || null,
			NOMBRE_UNIDAD: row?.NOMBRE_UNIDAD,
			NOMBRE_PUESTO: row?.NOMBRE_PUESTO,
			NOMBRE_CANDIDATO: nombre,
			DUI_CANDIDATO: row?.DUI_PERSONA,
			NOMBRE_TIPO_MODALIDAD: row?.MODALIDAD_NOMBRE,
			NOMBRE_TIPO_CONTRATACION: row?.NOMBRE_TIPO_CONTRATACION,
			SALARIO: row?.SALARIO,
			HORARIO: row?.HORARIO,
			TIEMPO_CONTRATO: row?.TIEMPO_CONTRATO,
			ESTADO_CICLO_CANDIDATO: 'EN_SELECCION',
			ESTADO_DECISION: 'PENDIENTE',
			CANTIDAD_ENTREVISTAS: Number(row?.CANTIDAD_ENTREVISTAS) || 0,
			ULTIMA_ENTREVISTA: row?.ULTIMA_ENTREVISTA || undefined,
			REQUIERE_ATENCION: true,
			HISTORIAL: [],
		};
	}

	mapBitacoraToHistorial(rows: any[]): ScBandejaActoresHistorialItem[] {
		if (!Array.isArray(rows)) {
			return [];
		}

		return rows.map((h) => ({
			FECHA: h?.FECHA_ACCION,
			USUARIO: h?.LOGIN_SISTEMA || '—',
			ACCION: h?.ESTADO_DESTINO || h?.NOMBRE_PASO || 'Movimiento',
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
