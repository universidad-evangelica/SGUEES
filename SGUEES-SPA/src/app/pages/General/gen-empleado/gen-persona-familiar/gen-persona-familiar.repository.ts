// Qué hace: acceso HTTP al API anidado de familiares de persona.
// Cómo: controller GEN_PERSONA_FAMILIAR (GetAll + SaveAll con List Table).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GenPersonaFamiliarRepository {
	readonly xController = 'GEN_PERSONA_FAMILIAR';

	constructor(private objData: CData) {}

	// Qué hace: lista familiares de la persona.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: guarda familiares (body = lista Table; CORR<=0 = alta).
	saveAll(corrPersona: number, familiares: any[]): Observable<IResult> {
		const rows = (familiares ?? []).map((f) => ({
			CORR_PERSONA: corrPersona,
			CORR_FAMILIAR: Number(f.CORR_FAMILIAR) > 0 ? Number(f.CORR_FAMILIAR) : 0,
			NOMBRE_COMPLETO: f.NOMBRE_COMPLETO ?? '',
			CORR_PARENTESCO: f.CORR_PARENTESCO ?? null,
			TELEFONO: f.TELEFONO ?? '',
			DOMICILIO: f.DOMICILIO ?? '',
			OCUPACION: f.OCUPACION ?? '',
			FECHA_NACIMIENTO: f.FECHA_NACIMIENTO ?? null,
		}));
		return this.objData.Put(rows, this.xController, 'SaveAll', [], environment.UrlGENERALAPI);
	}
}
