import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ComPagoRepository {
	readonly xController = 'COM_PAGO';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlCOMPRASAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlCOMPRASAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlCOMPRASAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlCOMPRASAPI);
	}

	Aplicar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Aplicar', xWhere, environment.UrlCOMPRASAPI);
	}

	DesAplicar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'DesAplicar', xWhere, environment.UrlCOMPRASAPI);
	}

	Anular(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Anular', xWhere, environment.UrlCOMPRASAPI);
	}

	BorrarDetalle(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'BorrarDetalle', xWhere, environment.UrlCOMPRASAPI);
	}

	ActualizarCuenta(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ActualizarCuenta', xWhere, environment.UrlCOMPRASAPI);
	}

	AsignarArchivo(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'AsignarArchivo', xWhere, environment.UrlCOMPRASAPI);
	}

	GenerarConta(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'GenerarConta', xWhere, environment.UrlCOMPRASAPI);
	}

	getAllDesAplicar(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllDesAplicar', xWhere, environment.UrlCOMPRASAPI);
	}

	getAllDoc(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllDoc', xWhere, environment.UrlCOMPRASAPI);
	}

	getBeneficiario(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetBeneficiario', xWhere, environment.UrlCOMPRASAPI);
	}
}
