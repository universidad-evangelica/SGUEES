// Qué hace: acceso HTTP al API de Competencias Técnicas.
// Cómo: llama al controller SC_COMPETENCIAS_TECNICAS a través de CData para ejecutar getAll, get, getNextCodigo, create, update, delete y activarInactivar.
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
// Qué hace: repositorio de competencias técnicas.
// Cómo: llama al controller SC_COMPETENCIAS_TECNICAS a través de CData (Get, Post, Put, Delete).
export class ScCompetenciasTecnicasRepository {
	readonly xController = 'SC_COMPETENCIAS_TECNICAS';

	constructor(private objData: CData) {}

	// Qué hace: consulta el listado de competencias técnicas.
	// Cómo: llama a Get sobre GetAll del controller SC_COMPETENCIAS_TECNICAS con los filtros recibidos.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: consulta una competencia técnica específica.
	// Cómo: llama a Get sobre Get del controller SC_COMPETENCIAS_TECNICAS con los filtros recibidos.
	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: consulta el siguiente código disponible para un padre de nivel 2.
	// Cómo: llama a Get sobre GetNextCodigo del controller SC_COMPETENCIAS_TECNICAS con los filtros recibidos.
	getNextCodigo(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetNextCodigo', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: crea una competencia técnica.
	// Cómo: llama a Post del controller SC_COMPETENCIAS_TECNICAS con el modelo recibido.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: actualiza una competencia técnica.
	// Cómo: llama a Put del controller SC_COMPETENCIAS_TECNICAS con el modelo y las claves de xWhere.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: elimina una competencia técnica.
	// Cómo: llama a Delete del controller SC_COMPETENCIAS_TECNICAS con las claves de xWhere.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: cambia el estado activo/inactivo de una competencia técnica.
	// Cómo: llama a Put sobre ActivarInactivar del controller SC_COMPETENCIAS_TECNICAS con el modelo y las claves de xWhere.
	activarInactivar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ActivarInactivar', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
