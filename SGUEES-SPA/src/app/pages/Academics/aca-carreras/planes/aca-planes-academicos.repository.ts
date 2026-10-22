import { Injectable } from '@angular/core';
import { CData } from 'src/app/FxAPI/CData';
import { environment } from 'src/environments/environment';
import type { PlanAcademico } from './plan-academico';

@Injectable({ providedIn: 'root' })
export class AcaPlanesAcademicosRepository {
    private readonly controller = 'ACA_PLANES_ACADEMICOS';
    constructor(private data: CData) {}
    getAll(carrera: number) {
        return this.data.Get(this.controller, 'GetAll', [{ Parameter: 'CORR_CARRERA', Value: carrera }], environment.UrlGENERALAPI);
    }
    getModalidades(carrera: number) {
        return this.data.Get(this.controller, 'GetModalidades', [{ Parameter: 'CORR_CARRERA', Value: carrera }], environment.UrlGENERALAPI);
    }
    save(plan: PlanAcademico) {
        return plan.CORR_PLAN_ACADEMICO
            ? this.data.Put(plan, this.controller, '', [], environment.UrlGENERALAPI)
            : this.data.Post(plan, this.controller, '', environment.UrlGENERALAPI);
    }
    cambiarVigencia(plan: PlanAcademico) {
        return this.data.Put({ CORR_CARRERA: plan.CORR_CARRERA, CORR_PLAN_ACADEMICO: plan.CORR_PLAN_ACADEMICO },
            this.controller, 'CambiarVigencia', [], environment.UrlGENERALAPI);
    }
}
