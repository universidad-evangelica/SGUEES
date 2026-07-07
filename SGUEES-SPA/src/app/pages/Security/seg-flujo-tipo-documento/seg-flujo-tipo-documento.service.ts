import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { SegFlujoTipoDocumentoRepository } from './seg-flujo-tipo-documento.repository';
import { SegFlujoTipoDocumento } from './models/seg-flujo-tipo-documento';

@Injectable({
    providedIn: 'root',
})
export class SegFlujoTipoDocumentoService {
    constructor(private repo: SegFlujoTipoDocumentoRepository) { }

    //#region <Validadores>
    esValido(model: SegFlujoTipoDocumento, msg: Function): boolean {
        if (model.NOMBRE_TIPO == '' || model.NOMBRE_TIPO == null) {
            msg('Debe digitar el nombre del tipo de documento', NotifyType.Error);
            return false;
        }

        if (model.NOMBRE_TIPO.length > 100) {
            msg('El nombre del tipo de documento no puede exceder los 100 caracteres', NotifyType.Error);
            return false;
        }

        if (model.DESCRIPCION && model.DESCRIPCION.length > 500) {
            msg('La descripción no puede exceder los 500 caracteres', NotifyType.Error);
            return false;
        }

        if (model.TABLA_ORIGEN && model.TABLA_ORIGEN.length > 50) {
            msg('El nombre de la tabla origen no puede exceder los 50 caracteres', NotifyType.Error);
            return false;
        }

        return true;
    }
    // #endregion

    getAll(param: any): Observable<IResult> {
        let xWhere: IParam[] = [];

        if (param.CORR_TIPO_DOCUMENTO && param.CORR_TIPO_DOCUMENTO > 0) {
            xWhere.push({ Parameter: 'CORR_TIPO_DOCUMENTO', Value: param.CORR_TIPO_DOCUMENTO });
        }

        if (param.NOMBRE_TIPO) {
            xWhere.push({ Parameter: 'NOMBRE_TIPO', Value: param.NOMBRE_TIPO });
        }

        if (param.TABLA_ORIGEN) {
            xWhere.push({ Parameter: 'TABLA_ORIGEN', Value: param.TABLA_ORIGEN });
        }



        return this.repo.get(xWhere);
    }

    get(param: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_DOCUMENTO', Value: param.CORR_TIPO_DOCUMENTO }];

        return this.repo.get(xWhere);
    }

    insert(model: any): Observable<IResult> {
        return this.repo.create(model);
    }

    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_DOCUMENTO', Value: model.CORR_TIPO_DOCUMENTO }];

        return this.repo.update(model, xWhere);
    }

    delete(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_DOCUMENTO', Value: model.CORR_TIPO_DOCUMENTO }];

        return this.repo.delete(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'CORR_TIPO_DOCUMENTO', caption: 'Corr.', width: 100 },
            { dataField: 'NOMBRE_TIPO', caption: 'Nombre', width: 250 },
            { dataField: 'DESCRIPCION', caption: 'Descripción', width: 350 },
            { dataField: 'TABLA_ORIGEN', caption: 'Tabla Origen', width: 200 },
            {
                dataField: 'ACTIVO',
                caption: 'Activo',
                width: 120,
                dataType: 'boolean',

            },
            { dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 150 },
            { dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 150 },
            {
                dataField: 'FECHA_CREA',
                caption: 'Fecha Crea',
                width: 180,
                dataType: 'datetime',
                format: 'dd/MM/yyyy HH:mm',
            },
            { dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 150 },
            { dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 150 },
            {
                dataField: 'FECHA_ACTU',
                caption: 'Fecha Actu',
                width: 180,
                dataType: 'datetime',
                format: 'dd/MM/yyyy HH:mm',
            },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_TIPO_DOCUMENTO',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    getItems(): any {
        return [
            {
                dataField: 'CORR_TIPO_DOCUMENTO',
                label: { text: 'Corr.' },
                colSpan: 1,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'NOMBRE_TIPO',
                label: { text: 'Nombre' },
                colSpan: 3,
                editorOptions: {
                    placeholder: 'Nombre del tipo de documento...',
                    showClearButton: true,
                    maxLength: 100,
                },
            },
            {
                dataField: 'DESCRIPCION',
                label: { text: 'Descripción' },
                colSpan: 4,
                editorOptions: {
                    placeholder: 'Descripción del tipo de documento...',
                    showClearButton: true,
                    maxLength: 500,
                },
            },
            {
                dataField: 'TABLA_ORIGEN',
                label: { text: 'Tabla Origen' },
                colSpan: 2,
                editorOptions: {
                    placeholder: 'Tabla origen...',
                    showClearButton: true,
                    maxLength: 50,
                },
            },
            {
                dataField: 'ACTIVO',
                label: { text: 'Activo' },
                colSpan: 1,
                editorType: 'dxCheckBox',
                // ✅ Sin editorOptions, el valor viene del modelo
            },
        ];
    }

    //#region <Metodos para Estados>
    getEstadoColumns(): any {
        return [
            { dataField: 'CORR_ESTADO', caption: 'Corr.', width: 100 },
            { dataField: 'NOMBRE_ESTADO', caption: 'Nombre', width: 250 },
            { dataField: 'DESCRIPCION', caption: 'Descripción', width: 450 },
            {
                dataField: 'ES_INICIAL',
                caption: 'Inicial',
                width: 120,
                dataType: 'boolean',


            },
            {
                dataField: 'ES_FINAL',
                caption: 'Final',
                width: 120,
                dataType: 'boolean',


            },
            {
                dataField: 'ACTIVO',
                caption: 'Activo',
                width: 120,
                dataType: 'boolean',

            },
        ];
    }
    getEstadoItems(): any {
        return [
            {
                dataField: 'CORR_ESTADO',
                label: { text: 'Corr.' },
                colSpan: 1,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'NOMBRE_ESTADO',
                label: { text: 'Nombre Estado' },
                colSpan: 2,
                editorOptions: {
                    placeholder: 'Nombre del estado...',
                    showClearButton: true,
                    maxLength: 50,
                },
            },
            {
                dataField: 'DESCRIPCION',
                label: { text: 'Descripción' },
                colSpan: 2,
                editorOptions: {
                    placeholder: 'Descripción...',
                    showClearButton: true,
                    maxLength: 255,
                },
            },
            {
                dataField: 'ES_INICIAL',
                label: { text: 'Inicial' },
                colSpan: 1,
                editorType: 'dxCheckBox',
            },
            {
                dataField: 'ES_FINAL',
                label: { text: 'Final' },
                colSpan: 1,
                editorType: 'dxCheckBox',
            },
            {
                dataField: 'ACTIVO',
                label: { text: 'Activo' },
                colSpan: 1,
                editorType: 'dxCheckBox',
                editorOptions: {
                    value: true,
                },
            },
        ];
    }
    //#endregion
}