import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

// Qué hace: llama a la API de actividades de una función del descriptor.
@Injectable({ providedIn: 'root' })
export class ScDescriptorFuncionActividadRepository {
	readonly xController = 'SC_DESCRIPTOR_FUNCION_ACTIVIDAD';

	constructor(private objData: CData) {}

	// Qué hace: lista actividades de una función.
	// Cómo: GET GetAll con descriptor y función en los filtros.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: crea una actividad.
	// Cómo: POST con el modelo al controlador.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: actualiza una actividad.
	// Cómo: PUT con el modelo y la llave compuesta (descriptor, función y actividad).
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: elimina una actividad.
	// Cómo: DELETE con la llave compuesta en los filtros.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
