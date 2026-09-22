// Qué hace: acceso HTTP al API anidado de formación académica.
// Cómo: controller GEN_PERSONA_FORMACION_ACADEMICA (GetAll + SaveAll).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GenPersonaFormacionAcademicaRepository {
	readonly xController = 'GEN_PERSONA_FORMACION_ACADEMICA';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	saveAll(corrPersona: number, rows: any[]): Observable<IResult> {
		const body = (rows ?? []).map((r) => ({
			CORR_PERSONA: corrPersona,
			CORR_FORMACION_ACADEMICA: Number(r.CORR_FORMACION_ACADEMICA) > 0 ? Number(r.CORR_FORMACION_ACADEMICA) : 0,
			TITULO: r.TITULO ?? '',
			CENTRO_EDUCATIVO: r.CENTRO_EDUCATIVO ?? '',
			NIVEL: r.NIVEL ?? '',
			DESDE: r.DESDE ?? null,
			HASTA: r.HASTA ?? null,
			PERIODO_INICIAL: r.PERIODO_INICIAL ?? null,
			PERIODO_FINAL: r.PERIODO_FINAL ?? null,
			PERIODO: r.PERIODO ?? '',
		}));
		return this.objData.Put(body, this.xController, 'SaveAll', [], environment.UrlGENERALAPI);
	}
}
