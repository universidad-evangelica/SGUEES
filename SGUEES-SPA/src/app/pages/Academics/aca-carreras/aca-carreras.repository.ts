import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';
import { AcaCarrera } from './models/aca-carreras';

@Injectable({ providedIn: 'root' })
export class AcaCarrerasRepository {
    private readonly controller = 'ACA_CARRERAS';
    constructor(private data: CData) {}
    getAll(where: IParam[]): Observable<IResult> {
        return this.data.Get(this.controller, 'GetAll', where, environment.UrlGENERALAPI);
    }
    create(model: AcaCarrera): Observable<IResult> {
        return this.data.Post(model, this.controller, '', environment.UrlGENERALAPI);
    }
    update(model: AcaCarrera): Observable<IResult> {
        return this.data.Put(model, this.controller, '', this.key(model.CORR_CARRERA), environment.UrlGENERALAPI);
    }
    delete(id: number): Observable<IResult> {
        return this.data.Delete(this.controller, '', this.key(id), environment.UrlGENERALAPI);
    }
    activarInactivar(model: AcaCarrera): Observable<IResult> {
        return this.data.Put(model, this.controller, 'ActivarInactivar', this.key(model.CORR_CARRERA), environment.UrlGENERALAPI);
    }
    private key(id: number): IParam[] { return [{ Parameter: 'CORR_CARRERA', Value: id }]; }
}

