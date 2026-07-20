import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

// Qué hace: llama a la API de riesgos del puesto vinculados al descriptor.
@Injectable({ providedIn: 'root' })
export class ScDescriptorPuestoRiesgoPuestoRepository {
	readonly xController = 'SC_DESCRIPTOR_PUESTO_RIESGO_PUESTO';

	constructor(private objData: CData) {}

	// Qué hace: lista los riesgos asociados a un descriptor.
	// Cómo: GET GetAll con el descriptor en los filtros.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: crea un vínculo de riesgo al descriptor.
	// Cómo: POST con el modelo al controlador.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: actualiza un riesgo vinculado al descriptor.
	// Cómo: PUT con el modelo y el correlativo del vínculo descriptor-riesgo.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: elimina un riesgo vinculado al descriptor.
	// Cómo: DELETE con el correlativo del vínculo en los filtros.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
