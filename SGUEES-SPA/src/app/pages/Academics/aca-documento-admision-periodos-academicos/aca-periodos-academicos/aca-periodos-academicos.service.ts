// Qué hace: catálogo de períodos académicos de Documentos por período.
// Cómo: lo pide con GetLookUp al controlador ACA_PERIODOS_ACADEMICOS.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

@Injectable({ providedIn: 'root' })
export class AcaPeriodosAcademicosService {
	constructor(private appInfoService: AppInfoService) {}

	// Qué hace: trae los períodos de la empresa de la sesión.
	// Cómo: GetLookUp(contexto, ACA_PERIODOS_ACADEMICOS, GetPERIODOS).
	getPeriodos(): Observable<IResult> {
		return this.appInfoService.getLookUp(
			'ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOS',
			'ACA_PERIODOS_ACADEMICOS',
			'GetPERIODOS',
			undefined,
			environment.UrlGENERALAPI
		);
	}
}
