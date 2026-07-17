// Acceso HTTP al API Competencias Técnicas (controller SC correspondiente).
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
// Encapsula las llamadas HTTP al controlador del catálogo.
export class ScCompetenciasTecnicasRepository {
	readonly xController = 'SC_COMPETENCIAS_TECNICAS';

	constructor(private objData: CData) {}

	// Consulta el listado aplicando los filtros recibidos.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Consulta un registro específico por sus filtros.
	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	getNextCodigo(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetNextCodigo', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Envía al API la solicitud de creación.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Envía al API la solicitud de actualización con sus claves.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Envía al API la solicitud de eliminación.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Envía al API el cambio de estado activo/inactivo.
	activarInactivar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ActivarInactivar', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
