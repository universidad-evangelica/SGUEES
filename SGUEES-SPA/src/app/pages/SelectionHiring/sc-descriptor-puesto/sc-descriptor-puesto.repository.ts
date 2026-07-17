import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ScDescriptorPuestoRepository {
	readonly xController = 'SC_DESCRIPTOR_PUESTO';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	getInducciones(): Observable<IResult> {
		return this.objData.Get(
			'SC_INDUCCION',
			'GetCORR_INDUCCION_SC_DESCRIPTOR_PUESTO',
			[],
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	updateEntrenamiento(model: any, corrDescriptorPuesto: number): Observable<IResult> {
		return this.objData.Put(
			model,
			this.xController,
			'ActualizarEntrenamiento',
			[{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto }],
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
