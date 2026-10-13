// Qué hace: acceso HTTP a los documentos por solicitud.
// Cómo: llama ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTO en UrlGENERALAPI.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AcaDocumentoAdmisionFlujoRepository {
	readonly xController = 'ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTO';

	constructor(private objData: CData) {}

	// Qué hace: consulta las solicitudes ACA_PROSPECTO.
	// Cómo: ejecuta GetAll con la empresa de sesión.
	getAll(xWhere: IParam[] = []): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: consulta los documentos ya marcados.
	// Cómo: ejecuta GetAsignaciones.
	getAsignaciones(xWhere: IParam[] = []): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAsignaciones', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: consulta el catálogo de documentos de admisión.
	// Cómo: ejecuta GetDocumentos.
	getDocumentos(): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetDocumentos', [], environment.UrlGENERALAPI);
	}

	// Qué hace: asocia un documento a la solicitud.
	// Cómo: envía el modelo al POST del controlador.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
	}

	// Qué hace: quita un documento de la solicitud.
	// Cómo: envía tipo y documento como query del DELETE.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
	}
}
