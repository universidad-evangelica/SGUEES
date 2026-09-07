import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ScSolicitudEmpleoRepository } from './sc-solicitud-empleo.repository';
import { ScSolicitudEmpleo } from './models/sc-solicitud-empleo';
import { ScRequisicionPersonalService } from '../sc-requisicion-personal/sc-requisicion-personal.service';

@Injectable({
	providedIn: 'root',
})
export class ScSolicitudEmpleoService {
	constructor(
		private repo: ScSolicitudEmpleoRepository,
		private requisicionPersonalService: ScRequisicionPersonalService
	) {}

	//#region <Validadores>
	esValido(model: ScSolicitudEmpleo, msg: Function): boolean {
		if (!`${model.CORREO_INVITACION ?? ''}`.trim()) {
			msg('Debe digitar el correo de invitación', NotifyType.Warning);
			return false;
		}

		// if (!`${model.DUI ?? ''}`.trim()) {
		// 	msg('Debe digitar el DUI', NotifyType.Warning);
		// 	return false;
		// }

		if (!`${model.NOMBRE ?? ''}`.trim()) {
			msg('Debe digitar el nombre', NotifyType.Warning);
			return false;
		}

		if (!model.CORR_TIPO_CONTRATACION || Number(model.CORR_TIPO_CONTRATACION) <= 0) {
			msg('Debe seleccionar el tipo de contratación', NotifyType.Warning);
			return false;
		}

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_SOLICITUD_EMPLEO', Value: param.CORR_SOLICITUD_EMPLEO }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_SOLICITUD_EMPLEO', Value: param.CORR_SOLICITUD_EMPLEO }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_SOLICITUD_EMPLEO', Value: model.CORR_SOLICITUD_EMPLEO }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_SOLICITUD_EMPLEO', Value: model.CORR_SOLICITUD_EMPLEO }];

		return this.repo.delete(xWhere);
	}

	reactivate(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_SOLICITUD_EMPLEO', Value: model.CORR_SOLICITUD_EMPLEO }];

		return this.repo.reactivate(xWhere);
	}

	desactivate(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_SOLICITUD_EMPLEO', Value: model.CORR_SOLICITUD_EMPLEO }];
		
		return this.repo.desactivate(xWhere);
	}

	getAllToken(corrSolicitudEmpleo: number): Observable<IResult> {
		return this.repo.getAllToken([
			{ Parameter: 'CORR_SOLICITUD_EMPLEO', Value: corrSolicitudEmpleo },
		]);
	}

	generarToken(corrSolicitudEmpleo: number): Observable<IResult> {
		return this.repo.generarToken({
			CORR_SOLICITUD_EMPLEO: corrSolicitudEmpleo,
		});
	}

	getPersonaDatos(corrPersonaDatos: number): Observable<IResult> {
		return this.repo.getPersonaDatos([
			{ Parameter: 'CORR_PERSONA_DATOS', Value: corrPersonaDatos },
		]);
	}

	getPersonaColeccion(controller: string, corrPersonaDatos: number): Observable<IResult> {
		return this.repo.getPersonaColeccion(controller, [
			{ Parameter: 'CORR_PERSONA_DATOS', Value: corrPersonaDatos },
		]);
	}

	getPersonaFoto(corrPersonaDatos: number): Observable<Blob> {
		return this.repo.getPersonaFoto([
			{ Parameter: 'CORR_PERSONA_DATOS', Value: corrPersonaDatos },
		]);
	}

	actualizarPersonaDatos(model: any): Observable<IResult> {
		return this.repo.actualizarPersonaDatos(model);
	}

	subirFotoPersona(corrPersonaDatos: number, file: File): Observable<IResult> {
		return this.repo.subirFotoPersona(corrPersonaDatos, file);
	}

	/** Requisiciones ya vinculadas a la solicitud (cards del tab). */
	getAllRequisicionSolicitud(corrSolicitudEmpleo: number): Observable<IResult> {
		return this.repo.getAllRequisicionSolicitud([
			{ Parameter: 'CORR_SOLICITUD_EMPLEO', Value: corrSolicitudEmpleo },
		]);
	}

	/** Listado del modal; filtros de estado quedan comentados en API. */
	getRequisicionesParaModal(): Observable<IResult> {
		return this.repo.getRequisicionesParaModal([
			{ Parameter: 'CORR_REQUISICION_PERSONAL', Value: 0 },
		]);
	}

	insertRequisicionSolicitud(corrSolicitudEmpleo: number, corrRequisicionPersonal: number): Observable<IResult> {
		return this.repo.insertRequisicionSolicitud({
			CORR_SOLICITUD_EMPLEO: corrSolicitudEmpleo,
			CORR_REQUISICION_PERSONAL: corrRequisicionPersonal,
		});
	}

	deleteRequisicionSolicitud(corrSolicitudRequisicion: number): Observable<IResult> {
		return this.repo.deleteRequisicionSolicitud([
			{ Parameter: 'CORR_SOLICITUD_REQUISICION', Value: corrSolicitudRequisicion },
		]);
	}

	getEstadoRequisicionLabel(corrEstado: number | null | undefined): string {
		return this.requisicionPersonalService.getEstadoRequisicionLabel(corrEstado);
	}

	/** Columnas del grid del modal (nombres, sin auditoría). */
	getRequisicionPickerColumns(): any[] {
		return [
			{ dataField: 'CORR_REQUISICION_PERSONAL', caption: 'No.', width: 70 },
			{ dataField: 'FECHA_REQUISICION', caption: 'Fecha', width: 110, dataType: 'date', format: 'dd/MM/yyyy' },
			{ dataField: 'NOMBRE_UNIDAD', caption: 'Unidad', width: 200 },
			{ dataField: 'NOMBRE_PUESTO', caption: 'Puesto', width: 200 },
			{ dataField: 'MODALIDAD_NOMBRE', caption: 'Modalidad', width: 120 },
			{ dataField: 'NOMBRE_TIPO_CONTRATACION', caption: 'Contrato', width: 130 },
			{ dataField: 'NOMBRE_TIPO_VACANTE', caption: 'Vacante', width: 150 },
			{ dataField: 'CANTIDAD_PLAZAS', caption: 'Plazas', width: 80 },
			{ dataField: 'SALARIO', caption: 'Salario', width: 100, format: '#,##0.00' },
		];
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_SOLICITUD_EMPLEO', caption: 'Corr.', width: 100 },
			{ dataField: 'FECHA_GENERACION', caption: 'Fecha Generación', width: 200, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'CORREO_INVITACION', caption: 'Correo Invitación', width: 250 },
			{ dataField: 'DUI', caption: 'Doc. Identidad', width: 150 },
			{ dataField: 'NOMBRE', caption: 'Participante', width: 250 },
			{ dataField: 'NOMBRE_TIPO_CONTRATACION', caption: 'Tipo Solicitud', width: 220 },
			{ dataField: 'ES_PERMANENTE', caption: 'Es permanente ?', width: 150, dataType: 'boolean', alignment: 'center' },
			{ dataField: 'ACTIVO', caption: 'Activo', width: 200, dataType: 'boolean', alignment: 'center' },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 250 },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 250 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 250, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 250 },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 250 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 250, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_SOLICITUD_EMPLEO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_SOLICITUD_EMPLEO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'FECHA_GENERACION',
				label: { text: 'Fecha Generación' },
				colSpan: 1,
				// DateBox con formato local; evita mostrar el ISO crudo de la API (…Z).
				editorType: 'dxDateBox',
				editorOptions: {
					type: 'datetime',
					displayFormat: 'dd/MM/yyyy HH:mm',
				},
			},
			{
				dataField: 'NOMBRE',
				label: { text: 'Participante' },
				colSpan: 2,
			},
			{
				dataField: 'CORREO_INVITACION',
				label: { text: 'Correo Invitación' },
				colSpan: 2,
			},
			{
				dataField: 'DUI',
				label: { text: 'Doc. Identidad' },
				colSpan: 1,
			},
			{
				dataField: 'CORR_TIPO_CONTRATACION',
				label: { text: 'Tipo de contratación' },
				colSpan: 2,
				template: 'CORR_TIPO_CONTRATACIONLookup',
			},
			// {
			// 	dataField: 'CORR_PERSONA_DATOS',
			// 	label: { text: 'Corr. Persona datos' },
			// 	colSpan: 2,
			// },
		];
	}

	getTokenColumns(): any {
		return [
			{ dataField: 'CORR_TOKEN', caption: 'Corr.', width: 80 },
			{ dataField: 'TOKEN_HASH', caption: 'Token', width: 170 },
			{ dataField: 'FECHA_GENERACION', caption: 'Fecha generación', width: 170, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'FECHA_EXPIRACION', caption: 'Fecha expiración', width: 170, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'FECHA_UTILIZACION', caption: 'Fecha utilización', width: 170, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTADO_TOKEN', caption: 'Estado Token', width: 140, cellTemplate: 'estadoTokenTemplate' },
			{ dataField: 'CORREO_DESTINO', caption: 'Correo destino', width: 260 },
		];
	}
}
