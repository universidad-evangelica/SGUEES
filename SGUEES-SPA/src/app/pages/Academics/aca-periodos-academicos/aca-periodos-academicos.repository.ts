import type { AcaPeriodoInput } from './aca-periodo-input';
import { Injectable } from '@angular/core';
import { CData } from 'src/app/FxAPI/CData';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AcaPeriodosAcademicosRepository {
    private readonly controller = 'ACA_PERIODOS_MANTENIMIENTO';
    constructor(private data: CData) {}
    getAll() { return this.data.Get(this.controller, 'GetAll', [], environment.UrlGENERALAPI); }
    getCatalogos() { return this.data.Get(this.controller, 'GetCatalogos', [], environment.UrlGENERALAPI); }
    insert(model: AcaPeriodoInput) { return this.data.Post(model, this.controller, '', environment.UrlGENERALAPI); }
    update(model: AcaPeriodoInput) { return this.data.Put(model, this.controller, '', [], environment.UrlGENERALAPI); }
    estado(model: AcaPeriodoInput) {
        return this.data.Put({ CORR_PERIODO_ACADEMICO: model.CORR_PERIODO_ACADEMICO }, this.controller, 'ActivarInactivar', [], environment.UrlGENERALAPI);
    }
    historial(id: number) {
        return this.data.Get(this.controller, 'GetHistorial', [{ Parameter: 'CORR_PERIODO_ACADEMICO', Value: id }], environment.UrlGENERALAPI);
    }
    oferta(filtro: any) {
        return this.data.Get(this.controller, 'GetOferta', Object.keys(filtro).map(key => ({ Parameter: key, Value: filtro[key] })), environment.UrlGENERALAPI);
    }
}
