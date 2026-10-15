import { Injectable } from '@angular/core';
import { AcaCarrerasSedesRepository } from './aca-carreras-sedes.repository';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';

@Injectable({ providedIn: 'root' })
export class AcaCarrerasSedesService {
    constructor(private repo: AcaCarrerasSedesRepository) {}
    getAll(carrera: number) { return this.repo.getAll(carrera); }
    create(carrera: number, sede: number) { return this.repo.create(carrera, sede); }
    activarInactivar(carrera: number, sede: number) { return this.repo.activarInactivar(carrera, sede); }
    getColumns(): any[] {
        return [
            { dataField: 'CODIGO_SEDE', caption: 'Código sede', width: 120 },
            { dataField: 'NOMBRE_SEDE', caption: 'Sede', width: 280 },
            createEstadoColumnConfig('ACTIVO', ESTADO_ACTIVO_INACTIVO_LABELS),
            ...buildAuditGridColumns(),
        ];
    }
}
