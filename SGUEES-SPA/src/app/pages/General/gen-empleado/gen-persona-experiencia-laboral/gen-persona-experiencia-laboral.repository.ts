// Qué hace: acceso HTTP al API anidado de experiencia laboral.
// Cómo: controller GEN_PERSONA_EXPERIENCIA_LABORAL (GetAll + SaveAll).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GenPersonaExperienciaLaboralRepository {
	readonly xController = 'GEN_PERSONA_EXPERIENCIA_LABORAL';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	saveAll(corrPersona: number, rows: any[]): Observable<IResult> {
		const body = (rows ?? []).map((r) => ({
			CORR_PERSONA: corrPersona,
			CORR_EXPERIENCIA_LABORAL:
				Number(r.CORR_EXPERIENCIA_LABORAL) > 0 ? Number(r.CORR_EXPERIENCIA_LABORAL) : 0,
			LUGAR_TRABAJO: r.LUGAR_TRABAJO ?? '',
			CARGO_DESEMPENADO: r.CARGO_DESEMPENADO ?? '',
			TELEFONO: r.TELEFONO ?? '',
			JEFE_INMEDIATO: r.JEFE_INMEDIATO ?? '',
			SALARIO_INICIAL: r.SALARIO_INICIAL ?? null,
			SALARIO_FINAL: r.SALARIO_FINAL ?? null,
			FECHA_INICIO: r.FECHA_INICIO ?? null,
			FECHA_FIN: r.FECHA_FIN ?? null,
			PERIODO_INICIAL: r.PERIODO_INICIAL ?? null,
			PERIODO_FINAL: r.PERIODO_FINAL ?? null,
			PERIODO: r.PERIODO ?? '',
			MOTIVO_SALIDA: r.MOTIVO_SALIDA ?? '',
		}));
		return this.objData.Put(body, this.xController, 'SaveAll', [], environment.UrlGENERALAPI);
	}
}
