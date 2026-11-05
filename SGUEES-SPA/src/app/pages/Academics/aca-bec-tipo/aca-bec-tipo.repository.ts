import { BecaCuestionarioCambio, BecaEditorAccion } from './models/beca-formulario';
import { BecaFormularioAccion, BecaFormularioCambio } from './models/beca-formulario';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AcaBecTipoRepository {
	readonly xController = 'ACA_BEC_TIPO';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlGENERALAPI);
	}

	getOrigenes(): Observable<IResult> {
		return this.objData.Get(this.xController, 'Origenes', [], environment.UrlGENERALAPI);
	}

	getConvenios(): Observable<IResult> {
		return this.objData.Get(this.xController, 'Convenios', [], environment.UrlGENERALAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlGENERALAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
	}

	activarInactivar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ActivarInactivar', xWhere, environment.UrlGENERALAPI);
	}
 cuestionarios():Observable<IResult> { return this.objData.Get(this.xController,'Cuestionarios',[],environment.UrlGENERALAPI); }
 formularios(): Observable<IResult> { return this.objData.Get(this.xController,'Formularios',[],environment.UrlGENERALAPI); }
 versiones(): Observable<IResult> { return this.objData.Get(this.xController,'Versiones',[],environment.UrlGENERALAPI); }
 asignaciones(beca: number): Observable<IResult> { return this.objData.Get(this.xController,'Asignaciones',[{Parameter:'CORR_BECA',Value:beca}],environment.UrlGENERALAPI); }
 ciclosFormulario(): Observable<IResult> { return this.objData.Get(this.xController,'CiclosFormulario',[],environment.UrlGENERALAPI); }
 plantillasFormulario(): Observable<IResult> { return this.objData.Get(this.xController,'PlantillasFormulario',[],environment.UrlGENERALAPI); }
 guardarFormulario(accion: BecaFormularioAccion,data: BecaFormularioCambio): Observable<IResult> { return this.objData.Post(data,this.xController,accion,environment.UrlGENERALAPI); }

 contenidoCuestionario(beca:number,version:number):Observable<IResult> { return this.objData.Get(this.xController,'ContenidoCuestionario',[{Parameter:'CORR_BECA',Value:beca},{Parameter:'CORR_FORMULARIO_VERSION',Value:version}],environment.UrlGENERALAPI); }
 guardarElemento(accion:BecaEditorAccion,data:BecaCuestionarioCambio):Observable<IResult> { return this.objData.Post(data,this.xController,accion,environment.UrlGENERALAPI); }

}
