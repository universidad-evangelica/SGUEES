import { Injectable } from '@angular/core';
import { CData } from 'src/app/FxAPI/CData';
import { environment } from 'src/environments/environment';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';

export interface PlanAcademico {
    CORR_PLAN_ACADEMICO: number;
    CORR_CARRERA: number;
    CODIGO_PLAN: string;
    CORR_MODALIDAD: number | null;
    ANIO_PLAN: number;
    FECHA_VIGENCIA_INICIO: string | null;
    FECHA_VIGENCIA_FIN: string | null;
    PLAN_VIGENTE: boolean;
    EN_USO: boolean;
    NOMBRE_MODALIDAD?: string;
}
export interface ModalidadPlan { Key: number; Value: string; ACTIVO: boolean; }

@Injectable({ providedIn: 'root' })
export class AcaPlanesAcademicosService {
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
    getColumns(): any[] {
        return [
            { dataField: 'CODIGO_PLAN', caption: 'Código del plan', width: 210 },
            { dataField: 'ANIO_PLAN', caption: 'Año', width: 90 },
            { dataField: 'NOMBRE_MODALIDAD', caption: 'Modalidad', width: 180 },
            { dataField: 'FECHA_VIGENCIA_INICIO', caption: 'Inicio de vigencia', dataType: 'date', format: 'dd/MM/yyyy', width: 170 },
            { dataField: 'FECHA_VIGENCIA_FIN', caption: 'Fin de vigencia', dataType: 'date', format: 'dd/MM/yyyy', width: 170 },
            { dataField: 'PLAN_VIGENTE', caption: 'Plan vigente', dataType: 'boolean', width: 130 },
            { dataField: 'EN_USO', caption: 'Con registros relacionados', dataType: 'boolean', width: 210 },
            ...buildAuditGridColumns(),
        ];
    }
}
