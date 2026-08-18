import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ScSolicitudEmpleoRepository } from './sc-solicitud-empleo.repository';
import { ScSolicitudEmpleo } from './models/sc-solicitud-empleo';

@Injectable({
	providedIn: 'root',
})
export class ScSolicitudEmpleoService {
	constructor(private repo: ScSolicitudEmpleoRepository) {}

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

	getColumns(): any {
		return [
			{ dataField: 'CORR_SOLICITUD_EMPLEO', caption: 'Corr.', width: 100 },
			{ dataField: 'FECHA_GENERACION', caption: 'Fecha Generación', width: 200, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'CORREO_INVITACION', caption: 'Correo Invitación', width: 250 },
			{ dataField: 'DUI', caption: 'Doc. Identidad', width: 150 },
			{ dataField: 'NOMBRE', caption: 'Participante', width: 250 },
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
				colSpan: 2,
				// DateBox con formato local; evita mostrar el ISO crudo de la API (…Z).
				editorType: 'dxDateBox',
				editorOptions: {
					type: 'datetime',
					displayFormat: 'dd/MM/yyyy HH:mm',
				},
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
				dataField: 'NOMBRE',
				label: { text: 'Participante' },
				colSpan: 2,
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
