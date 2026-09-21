import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoPersonaRepository } from './aca-prospecto-persona.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoPersonaService {
    constructor(private repo: AcaProspectoPersonaRepository) {}

    // Qué hace: datos personales del prospecto (relación 1:1).
    // Cómo lo hace: GetAll filtrado por prospecto; el componente toma la primera fila.
    getPersonaPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'NOMBRE_COMPLETO', caption: 'Nombre completo', width: 280 },
            { dataField: 'DUI', caption: 'DUI', width: 120 },
            { dataField: 'FECHA_NACIMIENTO', caption: 'Fecha de nacimiento', width: 150, dataType: 'date', format: 'dd/MM/yyyy' },
            { dataField: 'EDAD', caption: 'Edad', width: 80 },
            { dataField: 'SEXO', caption: 'Sexo', width: 110 },
            { dataField: 'ESTADO_CIVIL', caption: 'Estado civil', width: 120 },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_PROSPECTO_PERSONA',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    // Qué hace: formulario "Datos personales" (pestaña Información personal).
    // Cómo lo hace: solo lectura; los catálogos se muestran por su nombre resuelto en la vista.
    getItems(): any {
        return [
            { itemType: 'group', caption: 'Identidad', colSpan: 8, colCount: 8, items: [
                { dataField: 'NOMBRES', label: { text: 'Nombres' }, colSpan: 3, editorOptions: { readOnly: true } },
                { dataField: 'APELLIDO1', label: { text: 'Primer apellido' }, colSpan: 2, editorOptions: { readOnly: true } },
                { dataField: 'APELLIDO2', label: { text: 'Segundo apellido' }, colSpan: 2, editorOptions: { readOnly: true } },
                { dataField: 'EDAD', label: { text: 'Edad' }, colSpan: 1, editorOptions: { readOnly: true } },
                { dataField: 'DUI', label: { text: 'DUI' }, colSpan: 2, editorOptions: { readOnly: true } },
                { dataField: 'NIE', label: { text: 'NIE' }, colSpan: 2, editorOptions: { readOnly: true } },
                { dataField: 'CARNET_RESIDENCIA', label: { text: 'Carné de residencia' }, colSpan: 2, editorOptions: { readOnly: true } },
                { dataField: 'NIT', label: { text: 'NIT' }, colSpan: 2, editorOptions: { readOnly: true } },
                {
                    dataField: 'FECHA_NACIMIENTO',
                    label: { text: 'Fecha de nacimiento' },
                    colSpan: 2,
                    editorType: 'dxDateBox',
                    editorOptions: { readOnly: true, type: 'date', displayFormat: 'dd/MM/yyyy' },
                },
                { dataField: 'LUGAR_NACIMIENTO', label: { text: 'Lugar de nacimiento' }, colSpan: 2, editorOptions: { readOnly: true } },
                { dataField: 'SEXO', label: { text: 'Sexo' }, colSpan: 2, editorOptions: { readOnly: true } },
                { dataField: 'ESTADO_CIVIL', label: { text: 'Estado civil' }, colSpan: 2, editorOptions: { readOnly: true } },
                { dataField: 'TIPO_SANGRE', label: { text: 'Tipo de sangre' }, colSpan: 2, editorOptions: { readOnly: true } },
                { dataField: 'NACIONALIDAD', label: { text: 'Nacionalidad' }, colSpan: 2, editorOptions: { readOnly: true } },
                { dataField: 'PAIS_PROCEDENCIA', label: { text: 'País de procedencia' }, colSpan: 2, editorOptions: { readOnly: true } },
                { dataField: 'RELIGION', label: { text: 'Religión' }, colSpan: 2, editorOptions: { readOnly: true } },
                { dataField: 'IGLESIA_ACTUAL', label: { text: 'Iglesia actual' }, colSpan: 4, editorOptions: { readOnly: true } },
            ] },
            { itemType: 'group', caption: 'Residencia', colSpan: 8, colCount: 8, items: [
                { dataField: 'PAIS_RESIDENCIA', label: { text: 'País' }, colSpan: 2, editorOptions: { readOnly: true } },
                { dataField: 'DEPTO_RESIDENCIA', label: { text: 'Departamento' }, colSpan: 2, editorOptions: { readOnly: true } },
                { dataField: 'MUNICIPIO_RESIDENCIA', label: { text: 'Municipio' }, colSpan: 2, editorOptions: { readOnly: true } },
                { dataField: 'DIRECCION_ACTUAL', label: { text: 'Dirección actual' }, colSpan: 8, editorOptions: { readOnly: true } },
            ] },
            { itemType: 'group', caption: 'Condiciones declaradas', colSpan: 8, colCount: 8, items: [
                { dataField: 'TRABAJA', label: { text: 'Trabaja' }, colSpan: 2, editorType: 'dxCheckBox', editorOptions: { readOnly: true } },
                { dataField: 'POSEE_DISCAPACIDAD', label: { text: 'Posee discapacidad' }, colSpan: 2, editorType: 'dxCheckBox', editorOptions: { readOnly: true } },
                { dataField: 'HA_SIDO_DEPORTADO', label: { text: 'Ha sido deportado' }, colSpan: 2, editorType: 'dxCheckBox', editorOptions: { readOnly: true } },
            ] },
        ];
    }
}
