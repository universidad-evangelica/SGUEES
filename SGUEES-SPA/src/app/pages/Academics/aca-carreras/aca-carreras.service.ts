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
        if (!Number.isInteger(model.MAX_REPETICIONES) || model.MAX_REPETICIONES < 0 || model.MAX_REPETICIONES > 99) { msg('Indique entre 0 y 99 repeticiones adicionales.',NotifyType.Warning); return false; }
        if ((!model.CORR_CARRERA && model.CREDITOS_REQUERIDOS == null) || (model.CREDITOS_REQUERIDOS != null && model.CREDITOS_REQUERIDOS <= 0)) { msg('Indique los créditos requeridos para completar la carrera.',NotifyType.Warning); return false; }
        if ((!model.CORR_CARRERA && model.NOTA_MINIMA == null) || (model.NOTA_MINIMA != null && (model.NOTA_MINIMA < 0 || model.NOTA_MINIMA > 10))) { msg('La nota mínima de materia debe estar entre 0 y 10.',NotifyType.Warning); return false; }
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
            { itemType: 'group', caption: 'Identificación y clasificación', colCount: 6,
                colCountByScreen: { xs: 1, sm: 2, md: 6, lg: 6 }, items: [
                { dataField: 'CORR_CARRERA', label: { text: 'Corr.' }, editorOptions: { readOnly: true } },
                { dataField: 'CODIGO_CARRERA', label: { text: 'Código' },
                    editorOptions: { maxLength: 30, showClearButton: true },
                    validationRules: [{ type: 'required', message: 'El código es obligatorio.' }] },
                { dataField: 'NOMBRE_CARRERA', label: { text: 'Carrera' }, colSpan: 3,
                    editorOptions: { maxLength: 250, showClearButton: true },
                    validationRules: [{ type: 'required', message: 'El nombre es obligatorio.' }] },
                { dataField: 'ACTIVO', label: { text: 'Activo' }, editorType: 'dxCheckBox', editorOptions: { readOnly: true } },
                { dataField: 'CORR_AREA_ACADEMICA', label: { text: 'Área académica' }, colSpan: 2, template: 'areaLookup' },
                { dataField: 'CORR_FACULTAD', label: { text: 'Facultad' }, colSpan: 2, template: 'facultadLookup' },
                { dataField: 'CORR_GRADO_ACADEMICO', label: { text: 'Grado académico (opcional)' }, colSpan: 2, template: 'gradoLookup' }
            ] },
            { itemType: 'group', caption: 'Responsable de la carrera', colCount: 2,
                colCountByScreen: { xs: 1, sm: 2, md: 2, lg: 2 }, items: [
                { dataField: 'NOMBRE_DECANO', label: { text: 'Decano de la facultad' }, colSpan: 2, editorOptions: { readOnly: true }, helpText: 'El decano es responsable de las carreras de su facultad. Se asigna en Facultades.' }
            ] },
            { itemType: 'group', caption: 'Reglas académicas', colCount: 3,
                colCountByScreen: { xs: 1, sm: 2, md: 3, lg: 3 }, items: [
                { dataField: 'MAX_REPETICIONES', label: { text: 'Repeticiones adicionales por materia' }, editorType: 'dxNumberBox',
                    editorOptions: { width: 180, min: 0, max: 99, format: '#0', showSpinButtons: true },
                    validationRules: [{ type: 'required' }, { type: 'pattern', pattern: '^[0-9]+$', message: 'Ingrese un número entero.' }] },
                { dataField: 'CREDITOS_REQUERIDOS', label: { text: 'Créditos para completar la carrera' }, editorType: 'dxNumberBox',
                    editorOptions: { width: 180, min: 0.01, max: 99999.99, format: '#,##0.##', showClearButton: true } },
                { dataField: 'NOTA_MINIMA', label: { text: 'Nota mínima de materia (0–10)' }, editorType: 'dxNumberBox',
                    editorOptions: { width: 180, min: 0, max: 10, format: '#0.##', showClearButton: true } }
            ] }
        ];
    }
}

