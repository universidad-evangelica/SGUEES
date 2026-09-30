// Qué hace: llama a la API de firmas del descriptor.
// Cómo lo hace: GetAll sobre SC_DESCRIPTOR_PUESTO_FIRMAS.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ScDescriptorPuestoFirmasRepository {
	readonly xController = 'SC_DESCRIPTOR_PUESTO_FIRMAS';

	constructor(private objData: CData) {}

	// Qué hace: lista las firmas ya guardadas del descriptor.
	// Cómo lo hace: GET GetAll con el correlativo del descriptor.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
