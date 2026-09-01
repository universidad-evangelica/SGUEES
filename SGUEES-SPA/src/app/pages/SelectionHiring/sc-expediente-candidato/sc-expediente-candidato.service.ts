import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { ScExpedienteCandidato } from './models/sc-expediente-candidato';
import { ScExpedienteCandidatoRepository } from './sc-expediente-candidato.repository';
import { ScExpedienteEntrevistaRepository } from './sc-expediente-entrevista/sc-expediente-entrevista.repository';
import { ScExpedienteDocumentoRepository } from './sc-expediente-documento/sc-expediente-documento.repository';
import { ScExpedienteSolicitudRepository } from './sc-expediente-solicitud/sc-expediente-solicitud.repository';

@Injectable({ providedIn: 'root' })
export class ScExpedienteCandidatoService {
	constructor(
		private repo: ScExpedienteCandidatoRepository,
		private detalleRepo: ScExpedienteSolicitudRepository,
		private entrevistaRepo: ScExpedienteEntrevistaRepository,
		private documentoRepo: ScExpedienteDocumentoRepository
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

	getAllEntrevista(corrExpediente: number, corrSolicitudEmpleo: number): Observable<IResult> {
		return this.entrevistaRepo.getAll([
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: corrExpediente },
			{ Parameter: 'CORR_SOLICITUD_EMPLEO', Value: corrSolicitudEmpleo },
		]);
	}

	insertEntrevista(model: any): Observable<IResult> {
		return this.entrevistaRepo.create(model);
	}

	updateEntrevista(model: any): Observable<IResult> {
		return this.entrevistaRepo.update(model, [
			{ Parameter: 'CORR_EXPEDIENTE_ENTREVISTA', Value: model.CORR_EXPEDIENTE_ENTREVISTA },
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: model.CORR_EXPEDIENTE_CANDIDATO },
		]);
	}

	deleteEntrevista(corrExpediente: number, corrEntrevista: number): Observable<IResult> {
		return this.entrevistaRepo.delete([
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: corrExpediente },
			{ Parameter: 'CORR_EXPEDIENTE_ENTREVISTA', Value: corrEntrevista },
		]);
	}

	/** Combos fijos del tab Entrevistas. */
	getTipoEntrevistaOptions(): Array<{ value: string; text: string }> {
		return [
			{ value: 'TALENTO HUMANO', text: 'Talento humano' },
			{ value: 'JEFATURA', text: 'Jefatura' },
			{ value: 'GERENCIA', text: 'Gerencia' },
			{ value: 'DOCENTE', text: 'Docente' },
			{ value: 'FINAL', text: 'Final' },
		];
	}

	getEstadoEntrevistaOptions(): Array<{ value: string; text: string }> {
		return [
			{ value: 'PROGRAMADA', text: 'Programada' },
			{ value: 'REALIZADA', text: 'Realizada' },
			{ value: 'CANCELADA', text: 'Cancelada' },
			{ value: 'NO SE PRESENTO', text: 'No se presentó' },
			{ value: 'REPROGRAMADA', text: 'Reprogramada' },
		];
	}

	getResultadoEntrevistaOptions(): Array<{ value: string; text: string }> {
		return [
			{ value: 'FAVORABLE', text: 'Favorable' },
			{ value: 'FAVORABLE CON OBSERVACION', text: 'Favorable con observación' },
			{ value: 'NO FAVORABLE', text: 'No favorable' },
		];
	}

	getEntrevistaColumns(): any[] {
		return [
			{ dataField: 'CORR_EXPEDIENTE_ENTREVISTA', caption: 'Corr.', width: 70 },
			{ dataField: 'TIPO_ENTREVISTA', caption: 'Tipo', width: 170 },
			{
				dataField: 'FECHA_ENTREVISTA',
				caption: 'Fecha',
				width: 160,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
			},
			{ dataField: 'ENTREVISTADOR', caption: 'Entrevistador', width: 180 },
			{ dataField: 'ESTADO_ENTREVISTA', caption: 'Estado', width: 140 },
			{ dataField: 'RESULTADO_ENTREVISTA', caption: 'Resultado', width: 180 },
			{ dataField: 'RESUMEN_ENTREVISTA', caption: 'Resumen', width: 500 },
			{
				caption: 'Options',
				width: 90,
				allowSorting: false,
				allowFiltering: false,
				cellTemplate: 'entrevistaActionsTemplate',
			},
		];
	}

	/** Ítems del dx-form del tab Entrevistas (mismo patrón que getItems del encabezado). */
	getEntrevistaItems(): any[] {
		return [
			{
				dataField: 'TIPO_ENTREVISTA',
				label: { text: 'Tipo de entrevista' },
				colSpan: 2,
				editorType: 'dxSelectBox',
				editorOptions: {
					items: this.getTipoEntrevistaOptions(),
					displayExpr: 'text',
					valueExpr: 'value',
					searchEnabled: false,
					showClearButton: true,
					placeholder: 'Seleccione tipo',
				},
			},
			{
				dataField: 'FECHA_ENTREVISTA',
				label: { text: 'Fecha entrevista' },
				colSpan: 1,
				editorType: 'dxDateBox',
				editorOptions: {
					type: 'datetime',
					displayFormat: 'dd/MM/yyyy HH:mm',
					showClearButton: false,
				},
			},
			{
				dataField: 'ENTREVISTADOR',
				label: { text: 'Entrevistador' },
				colSpan: 2,
				editorOptions: {
					placeholder: 'Nombre del entrevistador',
					maxLength: 150,
					showClearButton: true,
				},
			},
			{
				dataField: 'ESTADO_ENTREVISTA',
				label: { text: 'Estado' },
				colSpan: 1,
				editorType: 'dxSelectBox',
				editorOptions: {
					items: this.getEstadoEntrevistaOptions(),
					displayExpr: 'text',
					valueExpr: 'value',
					searchEnabled: false,
					placeholder: 'Seleccione estado',
				},
			},
			{
				dataField: 'RESULTADO_ENTREVISTA',
				label: { text: 'Resultado' },
				colSpan: 2,
				editorType: 'dxSelectBox',
				editorOptions: {
					items: this.getResultadoEntrevistaOptions(),
					displayExpr: 'text',
					valueExpr: 'value',
					searchEnabled: false,
					showClearButton: true,
					placeholder: 'Opcional',
				},
			},
			{
				dataField: 'RESUMEN_ENTREVISTA',
				label: { text: 'Resumen' },
				colSpan: 8,
				editorType: 'dxTextArea',
				editorOptions: {
					height: 84,
					maxLength: 2000,
					placeholder: 'Notas u observaciones de la entrevista',
				},
			},
		];
	}

	esValidoEntrevista(model: any, msg: Function): boolean {
		if (!model?.TIPO_ENTREVISTA) {
			msg('Debe indicar el tipo de entrevista.', NotifyType.Warning);
			return false;
		}
		if (!model?.FECHA_ENTREVISTA) {
			msg('Debe indicar la fecha de la entrevista.', NotifyType.Warning);
			return false;
		}
		if (!`${model?.ENTREVISTADOR ?? ''}`.trim()) {
			msg('Debe indicar el entrevistador.', NotifyType.Warning);
			return false;
		}
		if (!model?.ESTADO_ENTREVISTA) {
			msg('Debe indicar el estado de la entrevista.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAllDocumento(corrExpediente: number): Observable<IResult> {
		return this.documentoRepo.getAll([
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: corrExpediente },
		]);
	}

	updateDocumento(model: any): Observable<IResult> {
		return this.documentoRepo.update(model, [
			{ Parameter: 'CORR_EXPEDIENTE_DOCUMENTO', Value: model.CORR_EXPEDIENTE_DOCUMENTO },
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: model.CORR_EXPEDIENTE_CANDIDATO },
		]);
	}

	deleteDocumento(corrExpediente: number, corrDocumento: number): Observable<IResult> {
		return this.documentoRepo.delete([
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: corrExpediente },
			{ Parameter: 'CORR_EXPEDIENTE_DOCUMENTO', Value: corrDocumento },
		]);
	}

	postDocumento(formData: FormData): Observable<IResult> {
		return this.documentoRepo.postDoc(formData);
	}

	putDocumento(formData: FormData, corrExpediente: number, corrDocumento: number): Observable<IResult> {
		return this.documentoRepo.putDoc(formData, [
			{ Parameter: 'CORR_EXPEDIENTE_DOCUMENTO', Value: corrDocumento },
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: corrExpediente },
		]);
	}

	getDocumentoBlob(param: {
		CORR_EXPEDIENTE_CANDIDATO: number;
		CORR_EXPEDIENTE_DOCUMENTO: number;
		NOMBRE_ARCHIVO: string;
	}): Observable<Blob> {
		return this.documentoRepo.getDoc([
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: param.CORR_EXPEDIENTE_CANDIDATO },
			{ Parameter: 'CORR_EXPEDIENTE_DOCUMENTO', Value: param.CORR_EXPEDIENTE_DOCUMENTO },
			{ Parameter: 'NOMBRE_ARCHIVO', Value: param.NOMBRE_ARCHIVO },
		]);
	}

	getTipoDocumentoOptions(): Array<{ value: string; text: string }> {
		return [
			{ value: 'Documento Identidad', text: 'Documento Identidad' },
			{ value: 'Pasaporte', text: 'Pasaporte' },
			{ value: 'Curriculum', text: 'Curriculum' },
			{ value: 'Titulo Academico', text: 'Título Académico' },
			{ value: 'Diploma', text: 'Diploma' },
			{ value: 'Referencia laboral', text: 'Referencia laboral' },
			{ value: 'Constancia laboral', text: 'Constancia laboral' },
			{ value: 'Solvencia', text: 'Solvencia' },
			{ value: 'Antecedentes', text: 'Antecedentes' },
			{ value: 'Otro documento', text: 'Otro documento' },
		];
	}

	getDocumentoColumns(): any[] {
		return [
			{ dataField: 'CORR_EXPEDIENTE_DOCUMENTO', caption: 'Corr.', width: 70 },
			{
				dataField: 'FECHA_CARGA',
				caption: 'Fecha carga',
				width: 150,
				dataType: 'datetime',
				format: 'dd/MM/yyyy',
			},
			{ dataField: 'TIPO_DOCUMENTO', caption: 'Tipo', width: 180 },
			{ dataField: 'NOMBRE_ARCHIVO', caption: 'Archivo', width: 475 },
			{ dataField: 'NOTAS', caption: 'Notas', width: 500 },
			{
				caption: 'Options',
				width: 120,
				allowSorting: false,
				allowFiltering: false,
				cellTemplate: 'documentoActionsTemplate',
				fixed: true,
				fixedPosition: 'left',
				alignment: 'center',
			},
		];
	}

	/** Ítems del dx-form del tab Documentos (mismo patrón que getItems del encabezado). */
	getDocumentoItems(): any[] {
		return [
			{
				dataField: 'TIPO_DOCUMENTO',
				label: { text: 'Tipo de documento' },
				colSpan: 4,
				editorType: 'dxSelectBox',
				editorOptions: {
					items: this.getTipoDocumentoOptions(),
					displayExpr: 'text',
					valueExpr: 'value',
					searchEnabled: false,
					showClearButton: true,
					placeholder: 'Seleccione tipo',
				},
			},
			{
				dataField: 'FECHA_CARGA',
				label: { text: 'Fecha de carga' },
				colSpan: 4,
				editorType: 'dxDateBox',
				editorOptions: {
					type: 'date',
					displayFormat: 'dd/MM/yyyy',
				},
			},
			{
				dataField: 'NOMBRE_ARCHIVO',
				label: { visible: false },
				colSpan: 8,
				template: 'documentoArchivoUploader',
			},
			{
				dataField: 'NOTAS',
				label: { text: 'Notas' },
				colSpan: 8,
				editorType: 'dxTextArea',
				editorOptions: {
					height: 84,
					maxLength: 1000,
					placeholder: 'Observaciones del documento',
				},
			},
		];
	}

	esValidoDocumento(model: any, esNuevo: boolean, tieneArchivoNuevo: boolean, msg: Function): boolean {
		if (!model?.TIPO_DOCUMENTO) {
			msg('Debe indicar el tipo de documento.', NotifyType.Warning);
			return false;
		}
		if (!model?.FECHA_CARGA) {
			msg('Debe indicar la fecha de carga.', NotifyType.Warning);
			return false;
		}
		if (esNuevo && !tieneArchivoNuevo) {
			msg('Debe seleccionar un archivo.', NotifyType.Warning);
			return false;
		}
		return true;
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
			{
				caption: 'Options',
				width: 90,
				minWidth: 90,
				allowSorting: false,
				allowFiltering: false,
				allowResizing: false,
				fixed: true,
				fixedPosition: 'left',
				cellTemplate: 'solicitudActionsTemplate',
				alignment: 'center',
			},
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
