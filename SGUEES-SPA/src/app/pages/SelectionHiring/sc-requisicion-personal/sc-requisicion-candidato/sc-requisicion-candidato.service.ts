import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { ScRequisicionCandidatoRepository } from './sc-requisicion-candidato.repository';

@Injectable({ providedIn: 'root' })
export class ScRequisicionCandidatoService {
	constructor(private repo: ScRequisicionCandidatoRepository) {}

	decide(model: {
		CORR_REQUISICION_PERSONAL: number;
		CORR_SOLICITUD_EMPLEO: number;
		CORR_EXPEDIENTE_CANDIDATO: number;
		ESTADO_DECISION: string;
		OBSERVACION_DECISION?: string;
	}): Observable<IResult> {
		return this.repo.decide(model);
	}

	getPostulacionesExpediente(param: {
		CORR_EXPEDIENTE_CANDIDATO: number;
		CORR_SOLICITUD_EMPLEO?: number;
	}): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: param.CORR_EXPEDIENTE_CANDIDATO },
		];
		if (param.CORR_SOLICITUD_EMPLEO && param.CORR_SOLICITUD_EMPLEO > 0) {
			xWhere.push({ Parameter: 'CORR_SOLICITUD_EMPLEO', Value: param.CORR_SOLICITUD_EMPLEO });
		}
		return this.repo.getPostulacionesExpediente(xWhere);
	}

	getEstadoDecisionLabel(estado: string | null | undefined): string {
		switch ((estado || 'PENDIENTE').trim().toUpperCase()) {
			case 'APLICA':
				return 'Aplica';
			case 'NO_APLICA':
				return 'No aplica';
			default:
				return 'Pendiente';
		}
	}

	getPostulacionColumns(): any[] {
		return [
			{ dataField: 'CORR_SOLICITUD_EMPLEO', caption: 'Solicitud', width: 110 },
			{ dataField: 'CORR_REQUISICION_PERSONAL', caption: 'Requisición', width: 120 },
			{ dataField: 'NOMBRE_PUESTO', caption: 'Puesto', minWidth: 180 },
			{ dataField: 'NOMBRE_UNIDAD', caption: 'Unidad', minWidth: 160 },
			{ dataField: 'MODALIDAD_NOMBRE', caption: 'Modalidad', width: 140 },
			{
				dataField: 'ESTADO_DECISION',
				caption: 'Decisión',
				width: 130,
				calculateCellValue: (row: any) => this.getEstadoDecisionLabel(row?.ESTADO_DECISION),
			},
			{ dataField: 'USUARIO_DECISION', caption: 'Decidió', width: 140 },
			{
				dataField: 'FECHA_DECISION',
				caption: 'Fecha decisión',
				width: 150,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
			},
			{ dataField: 'OBSERVACION_DECISION', caption: 'Observación', minWidth: 200 },
		];
	}
}
