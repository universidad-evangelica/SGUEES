import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ComProveedorActuDocRepository {
	readonly xController = 'COM_PROVEEDOR_DOC';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllCOM_PROVEEDOR_ACTU', xWhere, environment.UrlCOMPRASAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'PostCOM_PROVEEDOR_ACTU', environment.UrlCOMPRASAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'PutCOM_PROVEEDOR_ACTU', xWhere, environment.UrlCOMPRASAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'DeleteCOM_PROVEEDOR_ACTU', xWhere, environment.UrlCOMPRASAPI);
	}

  insertDoc(model: FormData): any {
    return this.objData.Post(model, this.xController, 'PostDocCOM_PROVEEDOR_ACTU', environment.UrlCOMPRASAPI);
  }

  getDoc(xWhere: IParam[]): Observable<Blob> {
		return this.objData.GetBlob(this.xController, 'getDocCOM_PROVEEDOR_ACTU', xWhere, environment.UrlCOMPRASAPI);
	}
}
