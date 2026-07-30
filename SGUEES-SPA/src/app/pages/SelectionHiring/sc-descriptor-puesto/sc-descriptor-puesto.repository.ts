import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

// Llama a la API del encabezado del descriptor (SC_DESCRIPTOR_PUESTO) y del entrenamiento.
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

	// Qué hace: carga el catálogo de inducciones para el bloque Entrenamiento.
	// Cómo: GET al controlador SC_INDUCCION (acción de lookup del descriptor).
	getInducciones(): Observable<IResult> {
		return this.objData.Get(
			'SC_INDUCCION',
			'GetCORR_INDUCCION_SC_DESCRIPTOR_PUESTO',
			[],
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	// Qué hace: elimina un descriptor.
	// Cómo: DELETE con la llave en xWhere.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
