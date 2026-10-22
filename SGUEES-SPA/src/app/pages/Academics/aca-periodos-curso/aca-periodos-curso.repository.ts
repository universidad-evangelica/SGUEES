import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';
import { PeriodoCurso } from './models/periodo-curso';
@Injectable({ providedIn: 'root' })
export class AcaPeriodosCursoRepository {
    private readonly controller = 'ACA_PERIODOS_CURSO';
    constructor(private data: CData) { }
    getAll(): Observable<IResult> { return this.data.Get(this.controller, 'GetAll', [], environment.UrlGENERALAPI); }
    guardar(model: PeriodoCurso): Observable<IResult> {
        return model.CORR_PERIODO_CURSO > 0
            ? this.data.Put(model, this.controller, '', [], environment.UrlGENERALAPI)
            : this.data.Post(model, this.controller, '', environment.UrlGENERALAPI);
    }
}
