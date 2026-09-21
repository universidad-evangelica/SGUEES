// Qué hace: acceso HTTP al API de Empleado (browse + Iniciar + personales vía SP).
// Cómo lo hace: llama al controller GEN_EMPLEADO (GENERAL API); sin APIs anidadas.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GenEmpleadoRepository {
	readonly xController = 'GEN_EMPLEADO';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: crea persona + empresa_persona + persona_natural (SP) + empleado.
	iniciar(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'Iniciar', environment.UrlGENERALAPI);
	}

	getPersonaNatural(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetPersonaNatural', xWhere, environment.UrlGENERALAPI);
	}

	createPersonaNatural(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'PersonaNatural', environment.UrlGENERALAPI);
	}

	updatePersonaNatural(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'PersonaNatural', xWhere, environment.UrlGENERALAPI);
	}

	deletePersonaNatural(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'PersonaNatural', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: elimina empleado por correlativo.
	// Cómo: DELETE GEN_EMPLEADO/?CORR_EMPLEADO=...
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
	}
}
