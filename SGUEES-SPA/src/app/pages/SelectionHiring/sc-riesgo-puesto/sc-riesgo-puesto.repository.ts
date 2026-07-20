// Acceso HTTP al API Riesgo del Puesto (controller SC correspondiente).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
// Qué hace: agrupa las llamadas HTTP al controlador SC_RIESGO_PUESTO.
export class ScRiesgoPuestoRepository {
	readonly xController = 'SC_RIESGO_PUESTO';

	constructor(private objData: CData) {}

	// Qué hace: consulta el listado de riesgos del puesto.
	// Cómo: GET GetAll al controlador SC_RIESGO_PUESTO con los filtros recibidos.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: consulta un riesgo del puesto puntual.
	// Cómo: GET Get al controlador SC_RIESGO_PUESTO con la llave en xWhere.
	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: crea un riesgo del puesto nuevo.
	// Cómo: POST con el modelo al controlador SC_RIESGO_PUESTO.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: actualiza un riesgo del puesto existente.
	// Cómo: PUT con el modelo y la llave en xWhere al controlador SC_RIESGO_PUESTO.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: elimina un riesgo del puesto.
	// Cómo: DELETE con la llave en xWhere al controlador SC_RIESGO_PUESTO.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: cambia el estado activo/inactivo de un riesgo del puesto.
	// Cómo: PUT a ActivarInactivar con el modelo y la llave en xWhere.
	activarInactivar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ActivarInactivar', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
