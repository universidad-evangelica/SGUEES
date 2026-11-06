import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

@Injectable({ providedIn: 'root' })
export class GenProveedorDocRepository {
	readonly xController = 'GEN_PROVEEDOR_DOC';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	postDoc(formData: FormData): Observable<IResult> {
		return this.objData.Post(formData, this.xController, 'PostDoc', environment.UrlGENERALAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
	}

	getDoc(xWhere: IParam[]): Observable<Blob> {
		return this.objData.GetBlob(this.xController, 'GetDoc', xWhere, environment.UrlGENERALAPI);
	}
}
