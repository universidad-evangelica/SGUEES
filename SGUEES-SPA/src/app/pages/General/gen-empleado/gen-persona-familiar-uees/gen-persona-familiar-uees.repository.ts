// Qué hace: acceso HTTP al API anidado de familiares UEES de persona.
// Cómo: controller GEN_PERSONA_FAMILIAR_UEES (GetAll + SaveAll con List Table).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GenPersonaFamiliarUeesRepository {
	readonly xController = 'GEN_PERSONA_FAMILIAR_UEES';

	constructor(private objData: CData) {}

	// Qué hace: lista familiares UEES de la persona.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: guarda familiares UEES (body = lista Table; CORR<=0 = alta).
	// Cómo: CORR_PERSONA en query (también con lista vacía) + en cada fila.
	saveAll(corrPersona: number, rows: any[]): Observable<IResult> {
		const body = (rows ?? []).map((f) => ({
			CORR_PERSONA: corrPersona,
			CORR_FAMILIAR_UEES: Number(f.CORR_FAMILIAR_UEES) > 0 ? Number(f.CORR_FAMILIAR_UEES) : 0,
			NOMBRE_COMPLETO: f.NOMBRE_COMPLETO ?? '',
			CORR_PARENTESCO: f.CORR_PARENTESCO ?? null,
			TELEFONO: f.TELEFONO ?? '',
			CARGO: f.CARGO ?? '',
			LUGAR_TRABAJO: f.LUGAR_TRABAJO ?? '',
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
