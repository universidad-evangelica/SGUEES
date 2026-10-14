// Qué hace: acceso HTTP al API anidado de domicilios de persona.
// Cómo: controller GEN_PERSONA_DOMICILIO (GetAll + SaveAll).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GenPersonaDomicilioRepository {
	readonly xController = 'GEN_PERSONA_DOMICILIO';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	saveAll(corrPersona: number, rows: any[]): Observable<IResult> {
		const body = (rows ?? []).map((r) => ({
			CORR_PERSONA: corrPersona,
			CORR_DOMICILIO: Number(r.CORR_DOMICILIO) > 0 ? Number(r.CORR_DOMICILIO) : 0,
			DIRECCION: r.DIRECCION ?? '',
			CORR_PAIS: r.CORR_PAIS ?? null,
			CORR_DEPTO: r.CORR_DEPTO ?? null,
			CORR_MUNICIPIO: r.CORR_MUNICIPIO ?? null,
			CORR_DISTRITO: r.CORR_DISTRITO ?? null,
			ACTIVO_DOMICILIO: r.ACTIVO_DOMICILIO !== false && r.ACTIVO_DOMICILIO !== 0,
		}));
		return this.objData.Put(
			body,
			this.xController,
			'SaveAll',
			[{ Parameter: 'CORR_PERSONA', Value: corrPersona ?? 0 }],
			environment.UrlGENERALAPI
		);
	}
}
