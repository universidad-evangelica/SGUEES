// Qué hace: acceso HTTP a los documentos por período.
// Cómo: llama ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOS en UrlGENERALAPI.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AcaDocumentoAdmisionPeriodosAcademicosRepository {
	readonly xController = 'ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOS';

	constructor(private objData: CData) {}

	// Qué hace: consulta el catálogo de documentos.
	// Cómo: ejecuta GetAll.
	getAll(xWhere: IParam[] = []): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: consulta los períodos ya marcados.
	// Cómo: ejecuta GetAsignaciones.
	getAsignaciones(xWhere: IParam[] = []): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAsignaciones', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: marca un documento en un período.
	// Cómo: envía el modelo al POST del controlador.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
	}

	// Qué hace: quita un período del documento.
	// Cómo: envía documento y período como query del DELETE.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
	}
}
