import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ScDescriptorPuestoRepository {
	readonly xController = 'SC_DESCRIPTOR_PUESTO';

	constructor(private objData: CData) {}

	// Centraliza el CRUD del descriptor sobre el controlador de Selección y Contratación;
	// los filtros se envían como IParam porque CData los serializa según el contrato común de la API.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Obtiene un registro por llave.
	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Alta del registro.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Consulta el catálogo de inducciones mediante la acción diseñada para el lookup del descriptor.
	getInducciones(): Observable<IResult> {
		return this.objData.Get(
			'SC_INDUCCION',
			'GetCORR_INDUCCION_SC_DESCRIPTOR_PUESTO',
			[],
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	// Actualiza solo el bloque de entrenamiento y envía el descriptor como condición de la operación.
	updateEntrenamiento(model: any, corrDescriptorPuesto: number): Observable<IResult> {
		return this.objData.Put(
			model,
			this.xController,
			'ActualizarEntrenamiento',
			[{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto }],
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	// Baja por llave (IParam).
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
