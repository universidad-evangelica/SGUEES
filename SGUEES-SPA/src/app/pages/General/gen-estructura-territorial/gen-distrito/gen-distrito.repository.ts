// Acceso HTTP al detalle cascada distrito (GEN_DISTRITO).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root',
})
export class GenDistritoRepository {
	readonly xController = 'GEN_DISTRITO';

	constructor(private objData: CData) {}

	// Consulta el listado de distritos aplicando los filtros recibidos.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Envía al API la solicitud para crear el distrito.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
	}

	// Envía al API la solicitud para actualizar el distrito identificada por sus claves.
	update(model: any): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', [], environment.UrlGENERALAPI);
	}

	// Envía al API la solicitud para eliminar el distrito indicada por sus claves.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
	}
}
