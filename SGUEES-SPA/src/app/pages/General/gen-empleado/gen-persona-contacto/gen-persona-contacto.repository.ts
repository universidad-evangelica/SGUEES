// Qué hace: acceso HTTP al API anidado de contactos de persona.
// Cómo: controller GEN_PERSONA_CONTACTO (GetAll + SaveAll con List Table).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GenPersonaContactoRepository {
	readonly xController = 'GEN_PERSONA_CONTACTO';

	constructor(private objData: CData) {}

	// Qué hace: lista catálogo activo + valores de la persona.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: guarda contactos (body = lista Table; CORR_PERSONA en query).
	// Cómo: Put SaveAll; CData conserva el array body.
	saveAll(corrPersona: number, contactos: any[]): Observable<IResult> {
		const rows = (contactos ?? []).map((d) => ({
			CORR_PERSONA: corrPersona,
			CORR_TIPO_CONTACTO: d.CORR_TIPO_CONTACTO,
			CORR_CONTACTO: d.CORR_CONTACTO ?? 0,
			VALOR_CONTACTO: d.VALOR_CONTACTO ?? '',
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
