// Qué hace: acceso HTTP al API anidado de documentos de identidad.
// Cómo: controller GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD (GetAll + SaveAll con List Table).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GenPersonaTipoDocumentoIdentidadRepository {
	readonly xController = 'GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD';

	constructor(private objData: CData) {}

	// Qué hace: lista catálogo activo + valores de la persona.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: guarda documentos (body = lista Table; CORR_PERSONA va en cada fila).
	// Cómo: Put con xWhere vacío — CData.mergePutQueryIntoBody no debe convertir el array en objeto.
	saveAll(corrPersona: number, documentos: any[]): Observable<IResult> {
		const rows = (documentos ?? []).map((d) => ({
			CORR_PERSONA: corrPersona,
			CORR_TIPO_DOCUMENTO_IDENTIDAD: d.CORR_TIPO_DOCUMENTO_IDENTIDAD,
			VALOR_DOCUMENTO: d.VALOR_DOCUMENTO ?? '',
		}));
		return this.objData.Put(rows, this.xController, 'SaveAll', [], environment.UrlGENERALAPI);
	}
}
