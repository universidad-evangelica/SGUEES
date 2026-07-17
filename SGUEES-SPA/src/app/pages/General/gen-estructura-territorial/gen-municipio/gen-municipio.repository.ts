import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

/** Detalle cascada: municipio. */
@Injectable({
	providedIn: 'root',
})
export class GenMunicipioRepository {
	readonly xController = 'GEN_MUNICIPIO';

	constructor(private objData: CData) {}

	// Consulta el listado de municipios aplicando los filtros recibidos.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Envía al API la solicitud para crear el municipio.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
	}

	// Envía al API la solicitud para actualizar el municipio identificada por sus claves.
	update(model: any): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', [], environment.UrlGENERALAPI);
	}

	// Envía al API la solicitud para eliminar el municipio indicada por sus claves.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
	}
}
