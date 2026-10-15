import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoRepository } from './aca-prospecto.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoService {
    constructor(private repo: AcaProspectoRepository) {}

    // Qué hace: lee el prospecto asociado a la solicitud de beca.
    // Cómo lo hace: solo consulta. El listado de la pantalla sale de ACA_PROSPECTO_BECA.
    getAll(param: any): Observable<IResult> {
        const xWhere: IParam[] = [
            { Parameter: 'ANIO', Value: param.ANIO },
            { Parameter: 'NUMERO_PERIODO', Value: param.NUMERO_PERIODO },
        ];
        return this.repo.getAll(xWhere);
    }

    get(param: any): Observable<IResult> {
        const xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: param.CORR_PROSPECTO }];
        return this.repo.get(xWhere);
    }
}
