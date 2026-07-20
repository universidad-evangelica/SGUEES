import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

// Qué hace: llama a la API de responsabilidades del cargo vinculadas al descriptor.
@Injectable({ providedIn: 'root' })
export class ScDescriptorPuestoResponsabilidadCargoRepository {
	readonly xController = 'SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGO';

	constructor(private objData: CData) {}

	// Qué hace: lista responsabilidades aplicables al descriptor y formato indicados.
	// Cómo: GET GetAll; el servicio envía descriptor y FORMATO en los filtros.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: crea un vínculo de responsabilidad al descriptor.
	// Cómo: POST con el modelo al controlador.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: actualiza una responsabilidad vinculada al descriptor.
	// Cómo: PUT con el modelo y el correlativo del vínculo; la aplicabilidad por formato va en el modelo.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: elimina una responsabilidad vinculada al descriptor.
	// Cómo: DELETE con el correlativo del vínculo en los filtros.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
