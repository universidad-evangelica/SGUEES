// Acceso HTTP al API Inducción (controller SC correspondiente).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
// Qué hace: agrupa las llamadas HTTP al controlador SC_INDUCCION.
export class ScInduccionRepository {
	readonly xController = 'SC_INDUCCION';

	constructor(private objData: CData) {}

	// Qué hace: consulta el listado de inducciones.
	// Cómo: GET GetAll al controlador SC_INDUCCION con los filtros recibidos.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: consulta una inducción puntual.
	// Cómo: GET Get al controlador SC_INDUCCION con la llave en xWhere.
	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: crea una inducción nueva.
	// Cómo: POST con el modelo al controlador SC_INDUCCION.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: actualiza una inducción existente.
	// Cómo: PUT con el modelo y la llave en xWhere al controlador SC_INDUCCION.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: elimina una inducción.
	// Cómo: DELETE con la llave en xWhere al controlador SC_INDUCCION.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: cambia el estado activo/inactivo de una inducción.
	// Cómo: PUT a ActivarInactivar con el modelo y la llave en xWhere.
	activarInactivar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ActivarInactivar', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
