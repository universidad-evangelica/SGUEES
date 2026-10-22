import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class SegUsuarioRepository {
	readonly xController = 'SEG_USUARIO';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSEGURIDADAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSEGURIDADAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSEGURIDADAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSEGURIDADAPI);
	}

	// Qué hace: obtiene la persona natural asociada a un usuario del sistema (1 a 1).
	// Cómo lo hace: llama a GET SEG_USUARIO/GetPersonaAsignada.
	getPersonaAsignada(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetPersonaAsignada', xWhere, environment.UrlSEGURIDADAPI);
	}

	// Qué hace: obtiene el listado de personas naturales disponibles para asociar.
	// Cómo lo hace: llama a GET SEG_USUARIO/GetPersonasNaturalesDisponibles.
	getPersonasDisponibles(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetPersonasNaturalesDisponibles', xWhere, environment.UrlSEGURIDADAPI);
	}

	// Qué hace: asocia una persona natural a un usuario.
	// Cómo lo hace: llama a POST SEG_USUARIO/AsociarPersona.
	asociarPersona(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'AsociarPersona', environment.UrlSEGURIDADAPI);
	}

	// Qué hace: desasocia la persona natural del usuario.
	// Cómo lo hace: llama a DELETE SEG_USUARIO/DesasociarPersona.
	desasociarPersona(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'DesasociarPersona', xWhere, environment.UrlSEGURIDADAPI);
	}
}
