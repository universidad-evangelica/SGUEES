import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ScExpedienteDocumentoRepository {
	readonly xController = 'SC_EXPEDIENTE_DOCUMENTO';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	postDoc(formData: FormData): Observable<IResult> {
		return this.objData.Post(formData, this.xController, 'PostDoc', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	putDoc(formData: FormData, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(formData, this.xController, 'PutDoc', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	getDoc(xWhere: IParam[]): Observable<Blob> {
		return this.objData.GetBlob(this.xController, 'GetDoc', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
