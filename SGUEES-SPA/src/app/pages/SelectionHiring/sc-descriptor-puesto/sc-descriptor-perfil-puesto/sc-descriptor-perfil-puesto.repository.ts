import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

// Qué hace: llama a la API del perfil de puesto (registro padre de educación, experiencia y competencias).
@Injectable({ providedIn: 'root' })
export class ScDescriptorPerfilPuestoRepository {
	readonly xController = 'SC_PERFIL_PUESTO';

	constructor(private objData: CData) {}

	// Qué hace: obtiene el perfil de un descriptor.
	// Cómo: GET GetAll con el descriptor en los filtros.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: crea el perfil de puesto del descriptor.
	// Cómo: POST con el modelo al controlador.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: actualiza los datos del perfil de puesto.
	// Cómo: PUT con el modelo y la llave compuesta (descriptor y perfil).
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
