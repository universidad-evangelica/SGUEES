import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoRepository } from './aca-prospecto.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoService {
    constructor(private repo: AcaProspectoRepository) {}

    // Qué hace: prospectos del ciclo seleccionado en la barra.
    // Cómo lo hace: la API exige año y número de período; el componente no consulta sin ciclo.
    getAll(param: any): Observable<IResult> {
        let xWhere: IParam[] = [
            { Parameter: 'ANIO', Value: param.ANIO },
            { Parameter: 'NUMERO_PERIODO', Value: param.NUMERO_PERIODO },
        ];
        return this.repo.getAll(xWhere);
    }

    get(param: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: param.CORR_PROSPECTO }];
        return this.repo.get(xWhere);
    }

    // Qué hace: actualiza los campos editables del encabezado (forma de ingreso, financia estudios y
    //           la carrera con su modalidad).
    // Cómo lo hace: envía solo lo que el ERP edita; la PK va en el query. Carrera y modalidad no son
    //               columnas de ACA_PROSPECTO: con ellas el API resuelve el plan académico y el
    //               período, igual que el cambio de carrera del portal.
    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: model.CORR_PROSPECTO }];
        const payload = {
            CORR_PROSPECTO: model.CORR_PROSPECTO,
            FORMA_INGRESO: model.FORMA_INGRESO,
            FINANCIA_ESTUDIOS: model.FINANCIA_ESTUDIOS,
            CORR_CARRERA: model.CORR_CARRERA,
            CORR_MODALIDAD: model.CORR_MODALIDAD,
        };
        return this.repo.update(payload, xWhere);
    }

    // Qué hace: carreras que el prospecto puede elegir en su ciclo.
    getCarrerasDelCiclo(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getCarreras(xWhere);
    }

    // Qué hace: modalidades con plan vigente de la carrera elegida.
    getModalidadesDeCarrera(CORR_CARRERA: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_CARRERA', Value: CORR_CARRERA }];
        return this.repo.getModalidades(xWhere);
    }

    // Qué hace: catálogo fijo de formas de ingreso (mismos códigos que el portal de admisiones).
    getFormasIngreso(): any[] {
        return [
            { CODIGO: 'NI', TEXTO: 'Nuevo Ingreso' },
            { CODIGO: 'EQ', TEXTO: 'Ingreso por Equivalencia' },
            { CODIGO: 'CC', TEXTO: 'Cambio de Carrera' },
            { CODIGO: 'RI', TEXTO: 'Reingreso' },
        ];
    }

    getColumns(): any {
        return [
            { dataField: 'CODIGO_PROSPECTO', caption: 'CIF', width: 120 },
            { dataField: 'NOMBRE_COMPLETO', caption: 'Nombre completo', width: 280 },
            { dataField: 'DUI', caption: 'DUI', width: 120 },
            { dataField: 'NOMBRE_CARRERA', caption: 'Carrera', width: 280 },
            { dataField: 'NOMBRE_MODALIDAD', caption: 'Modalidad', width: 130 },
            { dataField: 'FORMA_INGRESO_TEXTO', caption: 'Forma de ingreso', width: 180 },
            { dataField: 'ESTADO_TEXTO', caption: 'Estado', width: 120 },
            {
                dataField: 'FECHA_REGISTRO',
                caption: 'Fecha de registro',
                width: 160,
                dataType: 'datetime',
                format: 'dd/MM/yyyy HH:mm',
            },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CODIGO_PROSPECTO',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    // Qué hace: encabezado de la consulta/edición del prospecto.
    // Cómo lo hace: son editables la forma de ingreso, quién financia y la carrera con su modalidad
    //               (el dx-form [readOnly] las bloquea en consulta); el resto lleva readOnly fijo.
    //               Facultad, ciclo y plan siguen siendo derivados: los recalcula el API al guardar.
    getItems(): any {
        return [
            {
                dataField: 'CODIGO_PROSPECTO',
                label: { text: 'CIF' },
                colSpan: 2,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'NOMBRE_COMPLETO',
                label: { text: 'Nombre completo' },
                colSpan: 4,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'DUI',
                label: { text: 'DUI' },
                colSpan: 2,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'CORR_CARRERA',
                label: { text: 'Carrera' },
                colSpan: 4,
                template: 'CORR_CARRERA_PROSPECTOLookup',
            },
            {
                dataField: 'CORR_MODALIDAD',
                label: { text: 'Modalidad' },
                colSpan: 2,
                template: 'CORR_MODALIDAD_PROSPECTOLookup',
            },
            {
                dataField: 'CICLO',
                label: { text: 'Ciclo' },
                colSpan: 2,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'NOMBRE_FACULTAD',
                label: { text: 'Facultad' },
                colSpan: 3,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'FORMA_INGRESO',
                label: { text: 'Forma de ingreso' },
                colSpan: 2,
                editorType: 'dxSelectBox',
                editorOptions: { items: this.getFormasIngreso(), valueExpr: 'CODIGO', displayExpr: 'TEXTO' },
                validationRules: [{ type: 'required', message: 'Seleccione la forma de ingreso' }],
            },
            {
                dataField: 'FINANCIA_ESTUDIOS',
                label: { text: 'Financia estudios' },
                colSpan: 2,
                editorOptions: { maxLength: 100 },
            },
            {
                dataField: 'ESTADO_TEXTO',
                label: { text: 'Estado' },
                colSpan: 1,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'FECHA_REGISTRO',
                label: { text: 'Fecha de registro' },
                colSpan: 2,
                editorType: 'dxDateBox',
                editorOptions: { readOnly: true, type: 'datetime', displayFormat: 'dd/MM/yyyy HH:mm' },
            },
        ];
    }

    // Qué hace: formulario "Carrera a la que aplica" (pestaña Información académica).
    // Cómo lo hace: mismos datos del encabezado más plan, código de carrera y quién financia.
    getItemsCarrera(): any {
        return [
            { dataField: 'CODIGO_CARRERA', label: { text: 'Código' }, colSpan: 1, editorOptions: { readOnly: true } },
            { dataField: 'NOMBRE_CARRERA', label: { text: 'Carrera' }, colSpan: 4, editorOptions: { readOnly: true } },
            { dataField: 'NOMBRE_MODALIDAD', label: { text: 'Modalidad' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'CICLO', label: { text: 'Ciclo' }, colSpan: 1, editorOptions: { readOnly: true } },
            { dataField: 'NOMBRE_FACULTAD', label: { text: 'Facultad' }, colSpan: 4, editorOptions: { readOnly: true } },
            { dataField: 'CODIGO_PLAN', label: { text: 'Plan académico' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'FORMA_INGRESO_TEXTO', label: { text: 'Forma de ingreso' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'FINANCIA_ESTUDIOS', label: { text: 'Financia estudios' }, colSpan: 2, editorOptions: { readOnly: true } },
        ];
    }
}
