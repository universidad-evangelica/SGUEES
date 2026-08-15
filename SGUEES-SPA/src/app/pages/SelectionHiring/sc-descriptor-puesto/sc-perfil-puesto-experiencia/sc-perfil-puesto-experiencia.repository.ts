import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

// Qué hace: llama a la API de experiencia del perfil de puesto.
@Injectable({ providedIn: 'root' })
export class ScPerfilPuestoExperienciaRepository {
	readonly xController = 'SC_PERFIL_PUESTO_EXPERIENCIA';

	constructor(private objData: CData) {}

	// Qué hace: lista la experiencia de un perfil.
	// Cómo: GET GetAll con descriptor, perfil y filtros que arma el servicio.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: crea un registro de experiencia.
	// Cómo: POST con el modelo al controlador.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: actualiza una fila de experiencia.
	// Cómo: PUT con el modelo y la llave compuesta (descriptor, perfil y experiencia).
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: elimina una fila de experiencia.
	// Cómo: DELETE con la llave compuesta en los filtros.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
