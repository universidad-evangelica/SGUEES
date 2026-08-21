import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ScSolicitudEmpleoRepository {
	readonly xController = 'SC_SOLICITUD_EMPLEO';
	readonly xControllerToken = 'SC_SOLICITUD_EMPLEO_TOKEN';
	readonly xControllerPersonaDatos = 'SC_PERSONA_DATOS';
	readonly xControllerFamiliar = 'SC_PERSONA_FAMILIAR';
	readonly xControllerHijos = 'SC_PERSONA_HIJOS';
	readonly xControllerEstudio = 'SC_PERSONA_ESTUDIO';
	readonly xControllerIdiomas = 'SC_PERSONA_IDIOMAS';
	readonly xControllerCompetencias = 'SC_PERSONA_COMPETENCIAS_TECNICAS';
	readonly xControllerExperiencia = 'SC_PERSONA_EXPERIENCIA_LABORAL';
	readonly xControllerFamiliarUees = 'SC_PERSONA_FAMILIAR_UEES';
	readonly xControllerRequisicion = 'SC_SOLICITUD_REQUISICION';
	readonly xControllerRequisicionPersonal = 'SC_REQUISICION_PERSONAL';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	desactivate(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put({}, this.xController, 'Desactivate', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	reactivate(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put({}, this.xController, 'Reactivate', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	getAllToken(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xControllerToken, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	generarToken(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xControllerToken, 'GenerarToken', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	getPersonaDatos(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(
			this.xControllerPersonaDatos,
			'GetCORR_PERSONA_DATOS_SC_SOLICITUD_EMPLEO',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	getPersonaColeccion(controller: string, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(controller, 'GetAll_SC_SOLICITUD_EMPLEO', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	getPersonaFoto(xWhere: IParam[]): Observable<Blob> {
		return this.objData.GetBlob(
			this.xControllerPersonaDatos,
			'GetFoto_SC_SOLICITUD_EMPLEO',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	/** Vínculos solicitud ↔ requisición (V_SC_SOLICITUD_REQUISICION). */
	getAllRequisicionSolicitud(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xControllerRequisicion, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	insertRequisicionSolicitud(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xControllerRequisicion, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	deleteRequisicionSolicitud(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xControllerRequisicion, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	/** Catálogo para modal (permiso solicitud; filtros de estado en API comentados). */
	getRequisicionesParaModal(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(
			this.xControllerRequisicionPersonal,
			'GetAll_SC_SOLICITUD_EMPLEO',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	/** RRHH: actualiza persona + colecciones (sin Confirmación). */
	actualizarPersonaDatos(model: any): Observable<IResult> {
		return this.objData.Put(
			model,
			this.xController,
			'ActualizarPersonaDatos',
			[],
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	/** Sube/reemplaza fotografía del candidato (multipart). */
	subirFotoPersona(corrPersonaDatos: number, file: File): Observable<IResult> {
		const formData = new FormData();
		formData.append('CORR_PERSONA_DATOS', String(corrPersonaDatos));
		formData.append('file', file, file.name);
		return this.objData.Post(
			formData,
			this.xController,
			'SubirFotoPersona',
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	// /** Vínculos solicitud ↔ requisición (V_SC_SOLICITUD_REQUISICION). */
	// getAllRequisicionSolicitud(xWhere: IParam[]): Observable<IResult> {
	// 	return this.objData.Get(this.xControllerRequisicion, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	// }

	// insertRequisicionSolicitud(model: any): Observable<IResult> {
	// 	return this.objData.Post(model, this.xControllerRequisicion, '', environment.UrlSELECCIONCONTRATACIONAPI);
	// }

	// deleteRequisicionSolicitud(xWhere: IParam[]): Observable<IResult> {
	// 	return this.objData.Delete(this.xControllerRequisicion, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	// }

	// /** Catálogo para modal (permiso solicitud; filtros de estado en API comentados). */
	// getRequisicionesParaModal(xWhere: IParam[]): Observable<IResult> {
	// 	return this.objData.Get(
	// 		this.xControllerRequisicionPersonal,
	// 		'GetAll_SC_SOLICITUD_EMPLEO',
	// 		xWhere,
	// 		environment.UrlSELECCIONCONTRATACIONAPI
	// 	);
	// }
}
