// Qué hace: acceso HTTP al API anidado de personas de contacto.
// Cómo: controller GEN_PERSONA_PARENTESCO_CONTACTO (GetAll + SaveAll).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GenPersonaParentescoContactoRepository {
	readonly xController = 'GEN_PERSONA_PARENTESCO_CONTACTO';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	saveAll(corrPersona: number, rows: any[]): Observable<IResult> {
		const body = (rows ?? []).map((r) => ({
			CORR_PERSONA: corrPersona,
			CORR_PARENTESCO_CONTACTO:
				Number(r.CORR_PARENTESCO_CONTACTO) > 0 ? Number(r.CORR_PARENTESCO_CONTACTO) : 0,
			NOMBRE_COMPLETO: r.NOMBRE_COMPLETO ?? '',
			CORR_PARENTESCO: Number(r.CORR_PARENTESCO) > 0 ? Number(r.CORR_PARENTESCO) : null,
			CORR_TIPO_CONTACTO: Number(r.CORR_TIPO_CONTACTO) > 0 ? Number(r.CORR_TIPO_CONTACTO) : null,
			VALOR_CONTACTO: r.VALOR_CONTACTO ?? '',
			DIRECCION: r.DIRECCION ?? '',
			ES_EXTRANJERO: !!r.ES_EXTRANJERO,
			PARENTESCO_CONTACTO_EMERGENCIA: !!r.PARENTESCO_CONTACTO_EMERGENCIA,
			ACTIVO_PARENTESCO_CONTACTO: true,
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
