import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
    providedIn: 'root',
})
export class FirmasDocumentoRepository {
    readonly xController = 'SEG_FLUJO_BITACORA_FIRMAS';

    constructor(private objData: CData) {}

    getFirmas(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetFirmas', xWhere, environment.UrlGENERALAPI);
    }
}