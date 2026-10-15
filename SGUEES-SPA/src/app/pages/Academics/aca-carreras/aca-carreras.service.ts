import { Injectable } from '@angular/core';
import { AcaCarrerasRepository } from './aca-carreras.repository';
import { AcaCarrera } from './models/aca-carreras';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';

@Injectable({ providedIn: 'root' })
export class AcaCarrerasService {
    constructor(private repo: AcaCarrerasRepository) {}
    getAll() { return this.repo.getAll([]); }
    insert(model: AcaCarrera) { return this.repo.create(model); }
    update(model: AcaCarrera) { return this.repo.update(model); }
    delete(id: number) { return this.repo.delete(id); }
    activarInactivar(model: AcaCarrera) { return this.repo.activarInactivar(model); }

    esValido(model: AcaCarrera, msg: Function): boolean {
        const error = !model.CODIGO_CARRERA?.trim() || model.CODIGO_CARRERA.trim().length > 30
            ? 'Ingrese el código de la carrera (máximo 30 caracteres).'
            : !model.NOMBRE_CARRERA?.trim() || model.NOMBRE_CARRERA.trim().length > 250
                ? 'Ingrese el nombre de la carrera (máximo 250 caracteres).'
                : !model.CORR_AREA_ACADEMICA || !model.CORR_FACULTAD
                    ? 'Seleccione el área académica y la facultad.' : '';
        if (error) { msg(error, NotifyType.Warning); return false; }
        return true;
    }
    getColumns(): any[] {
        return [
            { dataField: 'CORR_CARRERA', caption: 'Corr.', width: 85 },
            { dataField: 'CODIGO_CARRERA', caption: 'Código', width: 130 },
            { dataField: 'NOMBRE_CARRERA', caption: 'Carrera', width: 360 },
            { dataField: 'SEDES_ACTIVAS', caption: 'Sedes activas', width: 260 },
            { dataField: 'NOMBRE_AREA', caption: 'Área académica', width: 180 },
            { dataField: 'NOMBRE_FACULTAD', caption: 'Facultad', width: 280 },
            { dataField: 'NOMBRE_GRADO', caption: 'Grado académico', width: 170 },
            createEstadoColumnConfig('ACTIVO', ESTADO_ACTIVO_INACTIVO_LABELS),
            ...buildAuditGridColumns(),
        ];
    }
    getSummary(): any {
        return { totalItems: [{ column: 'CORR_CARRERA', summaryType: 'count', displayFormat: 'Cant: {0}' }] };
    }
    getItems(): any[] {
        return [
            { dataField: 'CORR_CARRERA', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
            { dataField: 'CODIGO_CARRERA', label: { text: 'Código' }, colSpan: 2,
                editorOptions: { maxLength: 30, showClearButton: true },
                validationRules: [{ type: 'required', message: 'El código es obligatorio.' }] },
            { dataField: 'NOMBRE_CARRERA', label: { text: 'Carrera' }, colSpan: 5,
                editorOptions: { maxLength: 250, showClearButton: true },
                validationRules: [{ type: 'required', message: 'El nombre es obligatorio.' }] },
            { dataField: 'CORR_AREA_ACADEMICA', label: { text: 'Área académica' }, colSpan: 3, template: 'areaLookup' },
            { dataField: 'CORR_FACULTAD', label: { text: 'Facultad' }, colSpan: 5, template: 'facultadLookup' },
            { dataField: 'CORR_GRADO_ACADEMICO', label: { text: 'Grado académico (opcional)' }, colSpan: 6, template: 'gradoLookup' },
            { dataField: 'ACTIVO', label: { text: 'Activo' }, colSpan: 2,
                editorType: 'dxCheckBox', editorOptions: { readOnly: true } },
        ];
    }
}

