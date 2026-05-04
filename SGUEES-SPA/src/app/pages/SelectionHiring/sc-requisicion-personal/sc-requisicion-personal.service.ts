import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ScRequisicionPersonalRepository } from './sc-requisicion-personal.repository';
import { ScRequisicionPersonal } from './models/sc-requisicion-personal';

@Injectable({
	providedIn: 'root',
})
export class ScRequisicionPersonalService {
    constructor(private repo: ScRequisicionPersonalRepository) {}

    //#region <Validadores>
    esValido(model: ScRequisicionPersonal, msg: Function): boolean {
        // if (model.NOMBRE_ROL == '') {
        // msg('Debe digitar el nombre del Rol', NotifyType.Error)
        // return false;
        // }

        return true;
    }
    // #endregion

    getAll(param: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_REQUISICION', Value: param.CORR_REQUISICION }];

        return this.repo.get(xWhere);
    }

    get(param: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_REQUISICION', Value: param.CORR_REQUISICION }];

        return this.repo.get(xWhere);
    }

    insert(model: any): Observable<IResult> {
        return this.repo.create(model);
    }

    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_REQUISICION', Value: model.CORR_REQUISICION }];

        return this.repo.update(model, xWhere);
    }

    delete(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_REQUISICION', Value: model.CORR_REQUISICION }];

        return this.repo.delete(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'CORR_REQUISICION', caption: 'Corr.', width: 85 },
            { dataField: 'FECHA_REQUISICION', caption: 'Fecha', width: 130, dataType: 'date', format: 'dd/MM/yyyy' },
            { dataField: 'USUARIO_SOLICITA', caption: 'Solicitante', width: 250 },
            { dataField: 'CANTIDAD_CONTRATACION', caption: 'Cant. Personal', width: 150 },
            { dataField: 'SUELDO_PLAZA', caption: 'Salario', width: 150 },
            { dataField: 'TIEMPO_CONTRATO', caption: 'Tiempo Contrato', width: 140 },
            { dataField: 'HORARIO', caption: 'Horario', width: 150 },
            { dataField: 'JUSTIFICACION', caption: 'Justificacion', width: 150 },
            { dataField: 'ESTADO_REQUISICION', caption: 'Estado', width: 115 },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [{ column: 'CORR_REQUISICION', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
        };
    }

    getItems(): any {
        return [
            { dataField: 'CORR_REQUISICION', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
            {
                dataField: 'FECHA_REQUISICION',
                label: { text: 'Fecha Requisicion' },
                colSpan: 2,
                editorType: 'dxDateBox',
                editorOptions: { displayFormat: 'dd/MM/yyyy', useMaskBehavior: true },
            },
            {
                dataField: 'USUARIO_SOLICITA',
                label: { text: 'Solicitante' },
                colSpan: 2,
                editorOptions: { placeholder: 'Usuario solicitante...', showClearButton: true, maxLength: 100 },
            },
            {
                dataField: 'CANTIDAD_CONTRATACION',
                label: { text: 'Cantidad a contratar' },
                colSpan: 1,
                editorType: 'dxNumberBox',
                editorOptions: { min: 0, showSpinButtons: true },
            },
            {
                dataField: 'SUELDO_PLAZA',
                label: { text: 'Sueldo plaza' },
                colSpan: 1,
                editorType: 'dxNumberBox',
                editorOptions: { min: 0, format: '#,##0.00' },
            },
            {
                dataField: 'TIEMPO_CONTRATO',
                label: { text: 'Tiempo contrato' },
                colSpan: 1,
                editorOptions: { placeholder: 'Ej. 6 meses', showClearButton: true, maxLength: 50 },
            },
            {
                dataField: 'HORARIO',
                label: { text: 'Horario' },
                colSpan: 1,
                editorOptions: { placeholder: 'Horario...', showClearButton: true, maxLength: 100 },
            },
            {
                dataField: 'JUSTIFICACION',
                label: { text: 'Justificacion' },
                colSpan: 4,
                editorType: 'dxTextArea',
                editorOptions: { minHeight: 90, maxLength: 500 },
            },
            {
                dataField: 'ESTADO_REQUISICION',
                label: { text: 'Estado' },
                colSpan: 1,
                editorOptions: { placeholder: 'Estado...', showClearButton: true, maxLength: 30 },
            },
        ];
    }
}
