import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

// Llama a la API del encabezado del descriptor (SC_DESCRIPTOR_PUESTO).
@Injectable({ providedIn: 'root' })
export class ScDescriptorPuestoRepository {
	readonly xController = 'SC_DESCRIPTOR_PUESTO';

	constructor(private objData: CData) {}

	// Qué hace: lista descriptores según filtros.
	// Cómo: GET GetAll a la API de Selección y Contratación.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: obtiene un descriptor por su correlativo.
	// Cómo: GET Get con la llave en xWhere.
	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: crea un descriptor nuevo.
	// Cómo: POST con el modelo al controlador del descriptor.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: actualiza los datos generales del descriptor.
	// Cómo: PUT con el modelo y la llave en xWhere.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: actualiza solo RESPONSABLE (Entrenamiento).
	updateResponsable(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(
			model,
			this.xController,
			'UpdateResponsable',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	// Qué hace: actualiza solo impacto económico.
	updateImpactoEconomico(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(
			model,
			this.xController,
			'UpdateImpactoEconomico',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	// Qué hace: elimina un descriptor.
	// Cómo: DELETE con la llave en xWhere.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: ejecuta una operación del flujo (Autoriza SP).
	// Cómo: PUT Autoriza con OPERACION + OBSERVACION (y unidad si aplica).
	autoriza(model: any): Observable<IResult> {
		return this.objData.Put(
			model,
			this.xController,
			'Autoriza',
			[{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: model.CORR_DESCRIPTOR_PUESTO }],
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	// Qué hace: consulta qué botones de flujo puede ver el usuario sobre el descriptor.
	// Cómo: GET GetAccionesFlujo; la API filtra destinatario (SP) + permiso U (token).
	getAccionesFlujo(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(
			this.xController,
			'GetAccionesFlujo',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	// Qué hace: solicita el PDF Formato corto del descriptor.
	// Cómo: POST getPDFFormatoCorto (blob) a SC_DESCRIPTOR_PUESTO (mismo patrón con-partida).
	getPDFFormatoCorto(model: any): Observable<Blob> {
		return this.objData.PostBlob(
			model,
			this.xController,
			'getPDFFormatoCorto',
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	// Qué hace: solicita el PDF Formato extenso del descriptor.
	// Cómo: POST getPDFFormatoExtenso (blob) a SC_DESCRIPTOR_PUESTO.
	getPDFFormatoExtenso(model: any): Observable<Blob> {
		return this.objData.PostBlob(
			model,
			this.xController,
			'getPDFFormatoExtenso',
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}
}
