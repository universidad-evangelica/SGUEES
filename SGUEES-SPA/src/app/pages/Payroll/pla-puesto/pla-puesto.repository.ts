// Qué hace: acceso HTTP al API de puestos.
// Cómo: llama al controller PLA_PUESTO vía CData hacia UrlTALENTOHUMANONAPI.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class PlaPuestoRepository {
	readonly xController = 'PLA_PUESTO';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlTALENTOHUMANONAPI);
	}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlTALENTOHUMANONAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlTALENTOHUMANONAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlTALENTOHUMANONAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlTALENTOHUMANONAPI);
	}

	activarInactivar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ActivarInactivar', xWhere, environment.UrlTALENTOHUMANONAPI);
	}

	// Qué hace: asocia una unidad al puesto.
	// Cómo: Post Post_PLA_PUESTO de GEN_UNIDADES_PUESTO.
	asignarUnidad(model: { CORR_UNIDAD: number; CORR_PUESTO: number }): Observable<IResult> {
		return this.objData.Post(model, 'GEN_UNIDADES_PUESTO', 'Post_PLA_PUESTO', environment.UrlGENERALAPI);
	}

	// Qué hace: quita la unidad asociada al puesto.
	// Cómo: Delete Delete_PLA_PUESTO con la unidad y el puesto.
	quitarUnidad(corrUnidad: number, corrPuesto: number): Observable<IResult> {
		return this.objData.Delete(
			'GEN_UNIDADES_PUESTO',
			'Delete_PLA_PUESTO',
			[
				{ Parameter: 'CORR_UNIDAD', Value: corrUnidad },
				{ Parameter: 'CORR_PUESTO', Value: corrPuesto },
			],
			environment.UrlGENERALAPI
		);
	}
}
