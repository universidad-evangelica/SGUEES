// Qué hace: acceso HTTP al API anidado de referencias laborales.
// Cómo: controller GEN_PERSONA_REFERENCIA_LABORAL (GetAll + SaveAll).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GenPersonaReferenciaLaboralRepository {
	readonly xController = 'GEN_PERSONA_REFERENCIA_LABORAL';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	saveAll(corrPersona: number, rows: any[]): Observable<IResult> {
		const body = (rows ?? []).map((r) => ({
			CORR_PERSONA: corrPersona,
			CORR_REFERENCIA_LABORAL:
				Number(r.CORR_REFERENCIA_LABORAL) > 0 ? Number(r.CORR_REFERENCIA_LABORAL) : 0,
			NOMBRE_COMPLETO: r.NOMBRE_COMPLETO ?? '',
			LUGAR_TRABAJO: r.LUGAR_TRABAJO ?? '',
			TELEFONO: r.TELEFONO ?? '',
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
