import { Injectable } from '@angular/core';
import { AcaPlanesAcademicosRepository } from './aca-planes-academicos.repository';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';

import type { PlanAcademico } from './plan-academico';
export type { PlanAcademico, ModalidadPlan } from './plan-academico';

@Injectable({ providedIn: 'root' })
export class AcaPlanesAcademicosService {
    constructor(private repo: AcaPlanesAcademicosRepository) {}
    getAll(carrera: number) { return this.repo.getAll(carrera); }
    getModalidades(carrera: number) { return this.repo.getModalidades(carrera); }
    save(plan: PlanAcademico) { return this.repo.save(plan); }
    cambiarVigencia(plan: PlanAcademico) { return this.repo.cambiarVigencia(plan); }
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
