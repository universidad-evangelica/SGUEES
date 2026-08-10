// Qué hace: acceso HTTP al API de puestos por unidad.
// Cómo: llama al controller GEN_UNIDADES_PUESTO a través de CData (Get, Post, Delete).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
// Qué hace: repositorio de puestos por unidad.
// Cómo: llama al controller GEN_UNIDADES_PUESTO vía CData hacia UrlGENERALAPI.
export class GenUnidadesPuestoRepository {
	readonly xController = 'GEN_UNIDADES_PUESTO';

	constructor(private objData: CData) {}

	// Qué hace: consulta el listado de asignaciones unidad-puesto.
	// Cómo: llama a Get sobre GetAll del controller con los filtros recibidos.
	getAll(xWhere: IParam[] = []): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: crea una asignación de puesto a una unidad.
	// Cómo: llama a Post del controller GEN_UNIDADES_PUESTO con el modelo recibido.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
	}

	// Qué hace: elimina una asignación unidad-puesto.
	// Cómo: llama a Delete del controller con CORR_UNIDAD y CORR_PUESTO en xWhere.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
	}
}
