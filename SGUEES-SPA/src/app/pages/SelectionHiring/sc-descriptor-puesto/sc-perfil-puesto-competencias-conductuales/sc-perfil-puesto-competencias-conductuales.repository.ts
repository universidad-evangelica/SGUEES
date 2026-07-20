import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

// Qué hace: llama a la API de competencias conductuales del perfil de puesto.
@Injectable({ providedIn: 'root' })
export class ScPerfilPuestoCompetenciasConductualesRepository {
	readonly xController = 'SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES';

	constructor(private objData: CData) {}

	// Qué hace: lista las competencias conductuales asignadas a un perfil.
	// Cómo: GET GetAll con los filtros que arma el servicio.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: crea una asignación de competencia conductual.
	// Cómo: POST con el modelo al controlador.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: actualiza una asignación de competencia conductual.
	// Cómo: PUT con el modelo y el correlativo del vínculo perfil-competencia.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: elimina una asignación de competencia conductual.
	// Cómo: DELETE con el correlativo del vínculo en los filtros.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
