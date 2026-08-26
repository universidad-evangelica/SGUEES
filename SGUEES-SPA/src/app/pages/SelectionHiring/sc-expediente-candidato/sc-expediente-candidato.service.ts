import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { ScExpedienteCandidato } from './models/sc-expediente-candidato';
import { ScExpedienteCandidatoRepository } from './sc-expediente-candidato.repository';
import { ScExpedienteSolicitudRepository } from './sc-expediente-solicitud/sc-expediente-solicitud.repository';

@Injectable({ providedIn: 'root' })
export class ScExpedienteCandidatoService {
	constructor(
		private repo: ScExpedienteCandidatoRepository,
		private detalleRepo: ScExpedienteSolicitudRepository
	) {}

	esValido(model: ScExpedienteCandidato, msg: Function): boolean {
		if (!model.CORR_PERSONA_DATOS || model.CORR_PERSONA_DATOS <= 0) {
			msg('Debe indicar la persona (CORR_PERSONA_DATOS).', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: param.CORR_EXPEDIENTE_CANDIDATO }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: model.CORR_EXPEDIENTE_CANDIDATO },
		]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: model.CORR_EXPEDIENTE_CANDIDATO }]);
	}

	getAllSolicitud(corrExpediente: number): Observable<IResult> {
		return this.detalleRepo.getAll([
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: corrExpediente },
		]);
	}

	getEstadoAsociacion(corrSolicitudEmpleo: number): Observable<IResult> {
		return this.repo.getEstadoAsociacion([
			{ Parameter: 'CORR_SOLICITUD_EMPLEO', Value: corrSolicitudEmpleo },
		]);
	}

	asociarSolicitud(corrSolicitudEmpleo: number, crearExpediente: boolean): Observable<IResult> {
		return this.repo.asociarSolicitud({
			CORR_SOLICITUD_EMPLEO: corrSolicitudEmpleo,
			CREAR_EXPEDIENTE: crearExpediente,
		});
	}

	/** Columnas del grid principal (browse) del expediente. */
	getColumns(): any {
		return [
			{
				dataField: 'CORR_EXPEDIENTE_CANDIDATO',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{
				dataField: 'CORR_PERSONA_DATOS',
				caption: 'Corr. Persona',
				width: 110,
				dataType: 'number',
			},
			{ dataField: 'NOMBRE_PERSONA', caption: 'Persona', width: 280 },
			{ dataField: 'DUI_PERSONA', caption: 'DUI', width: 120 },
			{
				dataField: 'FECHA_GENERACION',
				caption: 'Fecha generación',
				width: 140,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
			},
			{ dataField: 'ACTIVO', caption: 'Activo', width: 90, dataType: 'boolean' },
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_EXPEDIENTE_CANDIDATO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	/** Ítems del dx-form del encabezado. */
	getItems(): any {
		return [
			{
				dataField: 'CORR_EXPEDIENTE_CANDIDATO',
				label: { text: 'Corr.' },
				colSpan: 1,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'CORR_PERSONA_DATOS',
				label: { text: 'Corr. Persona' },
				colSpan: 1,
				editorType: 'dxNumberBox',
				editorOptions: { min: 0, showSpinButtons: false },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'NOMBRE_PERSONA',
				label: { text: 'Nombre persona' },
				colSpan: 2,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'DUI_PERSONA',
				label: { text: 'Doc. Identidad' },
				colSpan: 2,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'FECHA_GENERACION',
				label: { text: 'Fecha generación' },
				colSpan: 1,
				editorType: 'dxDateBox',
				editorOptions: { type: 'datetime', displayFormat: 'dd/MM/yyyy HH:mm', readOnly: true },
			},
			{
				dataField: 'ACTIVO',
				label: { text: 'Activo' },
				editorType: 'dxCheckBox',
				colSpan: 1,
				editorOptions: { readOnly: true },
			},
		];
	}

	/**
	 * Columnas del grid hijo Solicitudes Relacionadas.
	 * Mismo estilo que getTokenColumns() de sc-solicitud-empleo (Bitácora).
	 */
	getSolicitudColumns(): any {
		return [
			{ dataField: 'CORR_EXPEDIENTE_SOLICITUD', caption: 'Corr.', width: 80 },
			{ dataField: 'CORR_SOLICITUD_EMPLEO', caption: 'No. Solicitud Empleo', width: 180 },
			{
				dataField: 'FECHA_SOLICITUD',
				caption: 'Fecha solicitud',
				width: 170,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
			},
			// { dataField: 'DUI_SOLICITUD', caption: 'Doc. Identidad', width: 120 },
			// { dataField: 'NOMBRE_SOLICITUD', caption: 'Nombre', width: 220 },
			{ dataField: 'CORREO_INVITACION', caption: 'Correo Invitación', width: 300 },
			{ dataField: 'NOMBRE_TIPO_CONTRATACION', caption: 'Tipo Contratación', width: 170 },
			{ dataField: 'NOMBRE_UNIDAD', caption: 'Unidad', width: 170 },
			{ dataField: 'MODALIDAD_NOMBRE', caption: 'Modalidad', width: 170 },
			{ dataField: 'SALARIO', caption: 'Salario', dataType: 'number', format: 'currency', width: 120 },
			{ dataField: 'ACTIVO_SOLICITUD', caption: 'Activa', width: 90, dataType: 'boolean' },
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param?.CORR_EXPEDIENTE_CANDIDATO) {
			xWhere.push({ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: param.CORR_EXPEDIENTE_CANDIDATO });
		}
		return xWhere;
	}
}
