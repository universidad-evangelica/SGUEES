import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ScDescriptorPuestoKpiFuncionRepository {
	readonly xController = 'SC_DESCRIPTOR_PUESTO_KPI_FUNCION';

	constructor(private objData: CData) {}

	// Qué hace: trae todos los KPI de un descriptor.
	// Cómo: llama al endpoint GetAll de la API de Selección y Contratación.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: crea un KPI nuevo.
	// Cómo: envía el modelo con POST al controlador de KPI.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: actualiza un KPI existente.
	// Cómo: envía el modelo con PUT y en xWhere va la llave (descriptor + correlativo del KPI).
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: elimina un KPI.
	// Cómo: llama DELETE con la llave del KPI en xWhere.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
