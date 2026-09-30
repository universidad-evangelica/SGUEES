// Qué hace: acceso HTTP al API anidado de hijos de persona.
// Cómo: controller GEN_PERSONA_HIJOS (GetAll + SaveAll con List Table).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GenPersonaHijosRepository {
	readonly xController = 'GEN_PERSONA_HIJOS';

	constructor(private objData: CData) {}

	// Qué hace: lista hijos de la persona.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: guarda hijos (body = lista Table; CORR<=0 = alta).
	// Cómo: CORR_PERSONA en query (también con lista vacía) + en cada fila.
	saveAll(corrPersona: number, hijos: any[]): Observable<IResult> {
		const rows = (hijos ?? []).map((h) => ({
			CORR_PERSONA: corrPersona,
			CORR_HIJO: Number(h.CORR_HIJO) > 0 ? Number(h.CORR_HIJO) : 0,
			NOMBRE_COMPLETO: h.NOMBRE_COMPLETO ?? '',
			EDAD: h.EDAD ?? null,
			// CHECK BD: MASCULINO|FEMENINO; vacío → null.
			SEXO: (h.SEXO ?? '').toString().trim() || null,
			FECHA_NACIMIENTO: h.FECHA_NACIMIENTO ?? null,
		}));
		return this.objData.Put(
			rows,
			this.xController,
			'SaveAll',
			[{ Parameter: 'CORR_PERSONA', Value: corrPersona ?? 0 }],
			environment.UrlGENERALAPI
		);
	}
}
