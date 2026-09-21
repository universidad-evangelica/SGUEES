// Qué hace: servicio de negocio del tab Documentos (anidado en gen-empleado).
// Cómo: GetAll/SaveAll vía repositorio GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD (sin DTO Save).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResult } from 'src/app/FxAPI/IResult';
import { GenPersonaTipoDocumentoIdentidadRepository } from './gen-persona-tipo-documento-identidad.repository';

@Injectable({ providedIn: 'root' })
export class GenPersonaTipoDocumentoIdentidadService {
	constructor(private repo: GenPersonaTipoDocumentoIdentidadRepository) {}

	getAll(corrPersona: number): Observable<IResult> {
		return this.repo.getAll([{ Parameter: 'CORR_PERSONA', Value: corrPersona ?? 0 }]);
	}

	saveAll(corrPersona: number, documentos: any[]): Observable<IResult> {
		return this.repo.saveAll(corrPersona, documentos);
	}
}
