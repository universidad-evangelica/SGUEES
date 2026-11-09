import { Injectable } from '@angular/core';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AcaCarrerasSedesRepository {
    private readonly controller = 'ACA_CARRERAS_SEDES';
    constructor(private data: CData) {}
    getAll(carrera: number) {
        return this.data.Get(this.controller, 'GetAll', [{ Parameter: 'CORR_CARRERA', Value: carrera }], environment.UrlGENERALAPI);
    }
    create(carrera: number, sede: number) {
        return this.data.Post({ CORR_CARRERA: carrera, CORR_SEDE: sede }, this.controller, '', environment.UrlGENERALAPI);
    }
    activarInactivar(carrera: number, sede: number) {
        const keys: IParam[] = [{ Parameter: 'CORR_CARRERA', Value: carrera }, { Parameter: 'CORR_SEDE', Value: sede }];
        return this.data.Put({ CORR_CARRERA: carrera, CORR_SEDE: sede }, this.controller, 'ActivarInactivar', keys, environment.UrlGENERALAPI);
    }
}
