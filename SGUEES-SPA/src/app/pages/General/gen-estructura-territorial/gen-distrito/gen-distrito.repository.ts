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
// Qué hace: agrupa las llamadas HTTP al controlador GEN_DISTRITO.
export class GenDistritoRepository {
	readonly xController = 'GEN_DISTRITO';

	constructor(private objData: CData) {}

	// Qué hace: crea un distrito nuevo.
	// Cómo: POST con el modelo al controlador GEN_DISTRITO.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
	}

	// Qué hace: actualiza un distrito existente.
	// Cómo: PUT con el modelo al controlador GEN_DISTRITO.
	update(model: any): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', [], environment.UrlGENERALAPI);
	}

	// Qué hace: elimina un distrito.
	// Cómo: DELETE con la llave en xWhere al controlador GEN_DISTRITO.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
	}
}
