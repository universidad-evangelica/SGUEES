import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';
import { TipoPractica } from './models/tipo-practica';
@Injectable({ providedIn: 'root' })
export class AcaTiposPracticaRepository {
    private readonly controller = 'ACA_TIPOS_PRACTICA';
    constructor(private data: CData) { }
    getAll(): Observable<IResult> { return this.data.Get(this.controller, 'GetAll', [], environment.UrlGENERALAPI); }
    guardar(model: TipoPractica): Observable<IResult> {
        return model.CORR_TIPO_PRACTICA > 0
            ? this.data.Put(model, this.controller, '', [], environment.UrlGENERALAPI)
            : this.data.Post(model, this.controller, '', environment.UrlGENERALAPI);
    }
}
