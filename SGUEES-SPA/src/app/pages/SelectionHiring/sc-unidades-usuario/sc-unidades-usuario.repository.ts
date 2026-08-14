// Qué hace: acceso HTTP al API de unidades por usuario.
// Cómo: llama SC_UNIDADES_USUARIO en UrlSELECCIONCONTRATACIONAPI mediante CData.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ScUnidadesUsuarioRepository {
	readonly xController = 'SC_UNIDADES_USUARIO';

	constructor(private objData: CData) {}

	// Qué hace: consulta las asignaciones.
	// Cómo: ejecuta GetAll con filtros opcionales.
	getAll(xWhere: IParam[] = []): Observable<IResult> {
		return this.objData.Get(
			this.xController,
			'GetAll',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	// Qué hace: crea una asignación individual.
	// Cómo: envía el modelo al POST base del controlador.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: asigna todas las unidades activas.
	// Cómo: llama al endpoint masivo AsignarTodasUnidades.
	asignarTodasUnidades(model: any): Observable<IResult> {
		return this.objData.Post(
			model,
			this.xController,
			'AsignarTodasUnidades',
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	// Qué hace: quita todas las unidades de un usuario.
	// Cómo: llama al endpoint masivo QuitarTodasUnidades.
	quitarTodasUnidades(model: any): Observable<IResult> {
		return this.objData.Post(
			model,
			this.xController,
			'QuitarTodasUnidades',
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	// Qué hace: elimina una asignación individual.
	// Cómo: envía LOGIN_SISTEMA y CORR_UNIDAD como query del DELETE.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(
			this.xController,
			'',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}
}
