// Acceso HTTP al API Tipo de Puesto (controller PLA_TIPO_PUESTO).
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
// Qué hace: agrupa las llamadas HTTP al controlador PLA_TIPO_PUESTO.
export class PlaTipoPuestoRepository {
	readonly xController = 'PLA_TIPO_PUESTO';

	constructor(private objData: CData) {}

	// Qué hace: consulta el listado de tipos de puesto.
	// Cómo: GET GetAll al controlador PLA_TIPO_PUESTO con los filtros recibidos.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlTALENTOHUMANONAPI);
	}

	// Qué hace: consulta un tipo de puesto puntual.
	// Cómo: GET Get al controlador PLA_TIPO_PUESTO con la llave en xWhere.
	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlTALENTOHUMANONAPI);
	}

	// Qué hace: crea un tipo de puesto nuevo.
	// Cómo: POST con el modelo al controlador PLA_TIPO_PUESTO.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlTALENTOHUMANONAPI);
	}

	// Qué hace: actualiza un tipo de puesto existente.
	// Cómo: PUT con el modelo y la llave en xWhere al controlador PLA_TIPO_PUESTO.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlTALENTOHUMANONAPI);
	}

	// Qué hace: elimina un tipo de puesto.
	// Cómo: DELETE con la llave en xWhere al controlador PLA_TIPO_PUESTO.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlTALENTOHUMANONAPI);
	}

	// Qué hace: cambia el estado activo/inactivo de un tipo de puesto.
	// Cómo: PUT a ActivarInactivar con el modelo y la llave en xWhere.
	activarInactivar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ActivarInactivar', xWhere, environment.UrlTALENTOHUMANONAPI);
	}
}
