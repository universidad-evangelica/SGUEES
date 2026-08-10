// Qué hace: acceso HTTP al API de unidades por tipo de usuario.
// Cómo: llama al controller SC_UNIDADES_TIPO_USUARIO a través de CData (Get, Post, Delete, ActivarInactivar).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
// Qué hace: repositorio de unidades por tipo de usuario.
// Cómo: llama al controller SC_UNIDADES_TIPO_USUARIO vía CData hacia UrlSELECCIONCONTRATACIONAPI.
export class ScUnidadesTipoUsuarioRepository {
	readonly xController = 'SC_UNIDADES_TIPO_USUARIO';

	constructor(private objData: CData) {}

	// Qué hace: consulta el listado de asignaciones unidad-rol.
	// Cómo: llama a Get sobre GetAll del controller con los filtros recibidos.
	getAll(xWhere: IParam[] = []): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: crea una asignación de unidad a un rol.
	// Cómo: llama a Post del controller SC_UNIDADES_TIPO_USUARIO con el modelo recibido.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: elimina una asignación unidad-rol.
	// Cómo: llama a Delete del controller con CORR_UNIDAD y TIPO_USUARIO en xWhere.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: cambia el estado activo/inactivo de una asignación.
	// Cómo: llama a Put sobre ActivarInactivar con el modelo y las llaves de xWhere.
	activarInactivar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ActivarInactivar', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
