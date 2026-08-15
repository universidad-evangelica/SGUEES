// Qué hace: acceso HTTP al API de Competencias Conductuales.
// Cómo: llama al controller SC_COMPETENCIAS_CONDUCTUALES a través de CData para ejecutar getAll, get, create, update, delete y activarInactivar.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
// Qué hace: repositorio de competencias conductuales.
// Cómo: llama al controller SC_COMPETENCIAS_CONDUCTUALES a través de CData (Get, Post, Put, Delete).
export class ScCompetenciasConductualesRepository {
	readonly xController = 'SC_COMPETENCIAS_CONDUCTUALES';

	constructor(private objData: CData) {}

	// Qué hace: consulta el listado de competencias conductuales.
	// Cómo: llama a Get sobre GetAll del controller SC_COMPETENCIAS_CONDUCTUALES con los filtros recibidos.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: consulta una competencia conductual específica.
	// Cómo: llama a Get sobre Get del controller SC_COMPETENCIAS_CONDUCTUALES con los filtros recibidos.
	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: crea una competencia conductual.
	// Cómo: llama a Post del controller SC_COMPETENCIAS_CONDUCTUALES con el modelo recibido.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: actualiza una competencia conductual.
	// Cómo: llama a Put del controller SC_COMPETENCIAS_CONDUCTUALES con el modelo y las claves de xWhere.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: elimina una competencia conductual.
	// Cómo: llama a Delete del controller SC_COMPETENCIAS_CONDUCTUALES con las claves de xWhere.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: cambia el estado activo/inactivo de una competencia conductual.
	// Cómo: llama a Put sobre ActivarInactivar del controller SC_COMPETENCIAS_CONDUCTUALES con el modelo y las claves de xWhere.
	activarInactivar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ActivarInactivar', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
