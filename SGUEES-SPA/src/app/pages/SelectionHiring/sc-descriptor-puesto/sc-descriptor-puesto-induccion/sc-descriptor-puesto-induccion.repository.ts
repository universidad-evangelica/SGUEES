import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

// Qué hace: llama a la API de inducciones del puesto vinculadas al descriptor.
@Injectable({ providedIn: 'root' })
export class ScDescriptorPuestoInduccionRepository {
	readonly xController = 'SC_DESCRIPTOR_PUESTO_INDUCCION';

	constructor(private objData: CData) {}

	// Qué hace: lista las inducciones asociadas a un descriptor.
	// Cómo: GET GetAll con el descriptor en los filtros.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: crea un vínculo de inducción al descriptor.
	// Cómo: POST con el modelo al controlador.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: actualiza una inducción vinculada al descriptor.
	// Cómo: PUT con el modelo y el correlativo del vínculo descriptor-inducción.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: elimina una inducción vinculada al descriptor.
	// Cómo: DELETE con el correlativo del vínculo en los filtros.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
