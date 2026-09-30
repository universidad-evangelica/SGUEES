// Qué hace: acceso HTTP al API anidado de competencias de persona.
// Cómo: controller GEN_PERSONA_COMPETENCIA (GetAll + SaveAll).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GenPersonaCompetenciaRepository {
	readonly xController = 'GEN_PERSONA_COMPETENCIA';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	saveAll(corrPersona: number, rows: any[]): Observable<IResult> {
		const body = (rows ?? []).map((r) => ({
			CORR_PERSONA: corrPersona,
			CORR_COMPETENCIA: Number(r.CORR_COMPETENCIA) > 0 ? Number(r.CORR_COMPETENCIA) : 0,
			NOMBRE_COMPETENCIA: r.NOMBRE_COMPETENCIA ?? '',
			// CHECK BD: BASICO|INTERMEDIO|AVANZADO; vacío → null.
			NIVEL_DOMINIO: (r.NIVEL_DOMINIO ?? '').toString().trim() || null,
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
