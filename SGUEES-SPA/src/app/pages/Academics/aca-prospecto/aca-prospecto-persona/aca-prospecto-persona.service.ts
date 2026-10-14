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

    // Qué hace: actualiza los datos personales.
    // Cómo lo hace: traduce la fila de la vista a las columnas de ACA_PROSPECTO_PERSONA
    //               (la nacionalidad se llama GEN_PAIS_NACIONALIDAD en la tabla); la PK va en el query.
    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_PERSONA', Value: model.CORR_PROSPECTO_PERSONA }];
        const payload = {
            CORR_PROSPECTO_PERSONA: model.CORR_PROSPECTO_PERSONA,
            CORR_PROSPECTO: model.CORR_PROSPECTO,
            NOMBRES: model.NOMBRES,
            APELLIDO1: model.APELLIDO1,
            APELLIDO2: model.APELLIDO2,
            DUI: model.DUI,
            NIE: model.NIE,
            CARNET_RESIDENCIA: model.CARNET_RESIDENCIA,
            NIT: model.NIT,
            FECHA_NACIMIENTO: model.FECHA_NACIMIENTO,
            LUGAR_NACIMIENTO: model.LUGAR_NACIMIENTO,
            CORR_PAIS_PROCEDENCIA: model.CORR_PAIS_PROCEDENCIA,
            CORR_PAIS_RESIDENCIA: model.CORR_PAIS_RESIDENCIA,
            GEN_PAIS_NACIONALIDAD: model.CORR_PAIS_NACIONALIDAD,
            IGLESIA_ACTUAL: model.IGLESIA_ACTUAL,
            CORR_RELIGION: model.CORR_RELIGION,
            TRABAJA: model.TRABAJA ?? false,
            HA_SIDO_DEPORTADO: model.HA_SIDO_DEPORTADO ?? false,
            POSEE_DISCAPACIDAD: model.POSEE_DISCAPACIDAD ?? false,
            CORR_SEXO: model.CORR_SEXO,
            CORR_ESTADO_CIVIL: model.CORR_ESTADO_CIVIL,
            CORR_TIPO_SANGRE: model.CORR_TIPO_SANGRE,
            CORR_DEPTO_RESIDENCIA: model.CORR_DEPTO_RESIDENCIA,
            CORR_MUNICIPIO_RESIDENCIA: model.CORR_MUNICIPIO_RESIDENCIA,
            DIRECCION_ACTUAL: model.DIRECCION_ACTUAL,
        };
        return this.repo.update(payload, xWhere);
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
    // Cómo lo hace: los catálogos son lookups (template) sobre los CORR_*; el dx-form [readOnly] los
    //               bloquea en consulta. Edad, "Posee discapacidad" y "Ha sido deportado" quedan de
    //               solo lectura hasta la fase 2 (dependen de las grillas de salud y migratorio).
    getItems(): any {
        return [
            { itemType: 'group', caption: 'Identidad', colSpan: 8, colCount: 8, items: [
                {
                    dataField: 'NOMBRES',
                    label: { text: 'Nombres' },
                    colSpan: 3,
                    editorOptions: { maxLength: 200 },
                    validationRules: [{ type: 'required', message: 'Ingrese los nombres' }],
                },
                {
                    dataField: 'APELLIDO1',
                    label: { text: 'Primer apellido' },
                    colSpan: 2,
                    editorOptions: { maxLength: 200 },
                    validationRules: [{ type: 'required', message: 'Ingrese el primer apellido' }],
                },
                { dataField: 'APELLIDO2', label: { text: 'Segundo apellido' }, colSpan: 2, editorOptions: { maxLength: 200 } },
                { dataField: 'EDAD', label: { text: 'Edad' }, colSpan: 1, editorOptions: { readOnly: true } },
                { dataField: 'DUI', label: { text: 'DUI' }, colSpan: 2, editorOptions: { maxLength: 20 } },
                // El NIE se captura en Educación media (como en el portal), aunque la columna viva aquí.
                { dataField: 'CARNET_RESIDENCIA', label: { text: 'Carné de residencia' }, colSpan: 2, editorOptions: { maxLength: 50 } },
                { dataField: 'NIT', label: { text: 'NIT' }, colSpan: 2, editorOptions: { maxLength: 20 } },
                {
                    dataField: 'FECHA_NACIMIENTO',
                    label: { text: 'Fecha de nacimiento' },
                    colSpan: 2,
                    editorType: 'dxDateBox',
                    editorOptions: { type: 'date', displayFormat: 'dd/MM/yyyy', dateSerializationFormat: 'yyyy-MM-dd' },
                },
                { dataField: 'LUGAR_NACIMIENTO', label: { text: 'Lugar de nacimiento' }, colSpan: 2, editorOptions: { maxLength: 200 } },
                { dataField: 'CORR_SEXO', label: { text: 'Sexo' }, colSpan: 2, template: 'CORR_SEXOLookup' },
                { dataField: 'CORR_ESTADO_CIVIL', label: { text: 'Estado civil' }, colSpan: 2, template: 'CORR_ESTADO_CIVILLookup' },
                { dataField: 'CORR_TIPO_SANGRE', label: { text: 'Tipo de sangre' }, colSpan: 2, template: 'CORR_TIPO_SANGRELookup' },
                { dataField: 'CORR_PAIS_NACIONALIDAD', label: { text: 'Nacionalidad' }, colSpan: 2, template: 'CORR_PAIS_NACIONALIDADLookup' },
                { dataField: 'CORR_PAIS_PROCEDENCIA', label: { text: 'País de procedencia' }, colSpan: 2, template: 'CORR_PAIS_PROCEDENCIALookup' },
                { dataField: 'CORR_RELIGION', label: { text: 'Religión' }, colSpan: 2, template: 'CORR_RELIGIONLookup' },
                { dataField: 'IGLESIA_ACTUAL', label: { text: 'Iglesia actual' }, colSpan: 4, editorOptions: { maxLength: 100 } },
            ] },
            { itemType: 'group', caption: 'Residencia', colSpan: 8, colCount: 8, items: [
                { dataField: 'CORR_PAIS_RESIDENCIA', label: { text: 'País' }, colSpan: 2, template: 'CORR_PAIS_RESIDENCIALookup' },
                { dataField: 'CORR_DEPTO_RESIDENCIA', label: { text: 'Departamento' }, colSpan: 2, template: 'CORR_DEPTO_RESIDENCIALookup' },
                { dataField: 'CORR_MUNICIPIO_RESIDENCIA', label: { text: 'Municipio' }, colSpan: 2, template: 'CORR_MUNICIPIO_RESIDENCIALookup' },
                { dataField: 'DIRECCION_ACTUAL', label: { text: 'Dirección actual' }, colSpan: 8, editorOptions: { maxLength: 300 } },
            ] },
            { itemType: 'group', caption: 'Condiciones declaradas', colSpan: 8, colCount: 8, items: [
                // Las tres son espejo del detalle, no se editan aquí: "Trabaja" se controla en
                // Información económica → Información laboral (igual que el portal, donde el check
                // vive en la sección laboral); discapacidad y deportación saldrán de sus grillas.
                {
                    dataField: 'TRABAJA',
                    label: { text: 'Trabaja' },
                    colSpan: 2,
                    editorType: 'dxCheckBox',
                    editorOptions: { readOnly: true },
                },
                { dataField: 'POSEE_DISCAPACIDAD', label: { text: 'Posee discapacidad' }, colSpan: 2, editorType: 'dxCheckBox', editorOptions: { readOnly: true } },
                { dataField: 'HA_SIDO_DEPORTADO', label: { text: 'Ha sido deportado' }, colSpan: 2, editorType: 'dxCheckBox', editorOptions: { readOnly: true } },
            ] },
        ];
    }
}
