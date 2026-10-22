import type { AcaPeriodoInput } from './aca-periodo-input';
import { Injectable } from '@angular/core';
import { AcaPeriodosAcademicosRepository } from './aca-periodos-academicos.repository';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';

export interface PeriodoCatalogo {
    TIPO: string; Key: number; Value: string; ACTIVO: boolean;
    CORR_SEDE: number | null; CORR_AREA_ACADEMICA: number | null; CORR_FACULTAD: number | null;
}
@Injectable({ providedIn: 'root' })
export class AcaPeriodosAcademicosService {
    constructor(private repo: AcaPeriodosAcademicosRepository) {}
    getAll() { return this.repo.getAll(); }
    getCatalogos() { return this.repo.getCatalogos(); }
    insert(model: AcaPeriodoInput) { return this.repo.insert(model); }
    update(model: AcaPeriodoInput) { return this.repo.update(model); }
    estado(model: AcaPeriodoInput) { return this.repo.estado(model); }
    historial(id: number) { return this.repo.historial(id); }
    oferta(filtro: any) { return this.repo.oferta(filtro); }
    getColumns(): any[] {
        return [
            { dataField: 'CORR_PERIODO_ACADEMICO', caption: 'Corr.', width: 85 },
            { dataField: 'ANIO', caption: 'Año', width: 90 },
            { dataField: 'NUMERO_PERIODO', caption: 'Período', width: 95 },
            { dataField: 'NOMBRE_SEDE', caption: 'Sede', width: 180 },
            { dataField: 'NOMBRE_AREA', caption: 'Área académica', width: 170 },
            { dataField: 'ALCANCE', caption: 'Alcance', width: 110 },
            { dataField: 'NOMBRE_FACULTAD', caption: 'Facultad', width: 250 },
            { dataField: 'NOMBRE_CARRERA', caption: 'Carrera', width: 300 },
            ...['FECHA_INICIO', 'FECHA_FIN', 'FECHA_INICIO_INSCRIPCION', 'FECHA_FIN_INSCRIPCION'].map((field, index) => ({
                dataField: field, caption: ['Inicio académico', 'Fin académico', 'Apertura inscripción', 'Cierre inscripción'][index],
                dataType: 'date', format: 'dd/MM/yyyy', width: 165,
            })),
            createEstadoColumnConfig('ACTIVO', ESTADO_ACTIVO_INACTIVO_LABELS),
            { dataField: 'EN_USO', caption: 'Con registros relacionados', dataType: 'boolean', width: 210 },
            ...buildAuditGridColumns(),
        ];
    }
}
