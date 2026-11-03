import type { AcaCicloInput, AcaCicloAsignacion } from './aca-ciclo-input';
import { Injectable } from '@angular/core';
import { CData } from 'src/app/FxAPI/CData';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AcaCiclosRepository {
    constructor(private data: CData) {}
    areas() { return this.data.Get('ACA_CICLOS', 'Areas', [], environment.UrlGENERALAPI); }
    ciclos(area: number) { return this.data.Get('ACA_CICLOS', 'GetAll', [{ Parameter: 'CORR_AREA_ACADEMICA', Value: area }], environment.UrlGENERALAPI); }
    detalle(id: number) { return this.data.Get('ACA_CICLOS', 'Detalle', [{ Parameter: 'CORR_CICLO_ACADEMICO', Value: id }], environment.UrlGENERALAPI); }
    catalogos() { return this.data.Get('ACA_CICLOS', 'Catalogos', [], environment.UrlGENERALAPI); }
    guardar(model: AcaCicloInput) {
        return model.CORR_CICLO_ACADEMICO ? this.data.Put(model, 'ACA_CICLOS', '', [], environment.UrlGENERALAPI)
            : this.data.Post(model, 'ACA_CICLOS', '', environment.UrlGENERALAPI);
    }
    asignar(accion: string, model: AcaCicloAsignacion) { return this.data.Put(model, 'ACA_CICLOS', accion, [], environment.UrlGENERALAPI); }
    oferta(id: number, sede: number, fecha: string) {
        return this.data.Get('ACA_CICLOS', 'Oferta', [{ Parameter: 'CORR_CICLO_ACADEMICO', Value: id },
            { Parameter: 'CORR_SEDE', Value: sede }, { Parameter: 'FECHA_REFERENCIA', Value: fecha }], environment.UrlGENERALAPI);
    }
}
