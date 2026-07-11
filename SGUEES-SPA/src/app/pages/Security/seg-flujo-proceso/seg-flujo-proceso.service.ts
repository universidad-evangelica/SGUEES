import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { SegFlujoProcesoRepository } from './seg-flujo-proceso.repository';
import { SegFlujoProceso } from './models/seg-flujo-proceso';

@Injectable({
    providedIn: 'root',
})
export class SegFlujoProcesoService {
    constructor(private repo: SegFlujoProcesoRepository) {}

    //#region <Validadores>
    esValido(model: SegFlujoProceso, msg: Function): boolean {
        if (model.NOMBRE_FLUJO == '' || model.NOMBRE_FLUJO == null) {
            msg('Debe digitar el nombre del flujo', NotifyType.Error);
            return false;
        }

        if (model.NOMBRE_FLUJO.length > 100) {
            msg('El nombre del flujo no puede exceder los 100 caracteres', NotifyType.Error);
            return false;
        }

        if (model.DESCRIPCION && model.DESCRIPCION.length > 500) {
            msg('La descripción no puede exceder los 500 caracteres', NotifyType.Error);
            return false;
        }

        if (!model.CORR_TIPO_DOCUMENTO || model.CORR_TIPO_DOCUMENTO <= 0) {
            msg('Debe seleccionar un tipo de documento', NotifyType.Error);
            return false;
        }

        return true;
    }
    // #endregion

    getAll(param: any): Observable<IResult> {
        let xWhere: IParam[] = [];

        if (param.CORR_FLUJO_PROCESO && param.CORR_FLUJO_PROCESO > 0) {
            xWhere.push({ Parameter: 'CORR_FLUJO_PROCESO', Value: param.CORR_FLUJO_PROCESO });
        }

        if (param.CORR_TIPO_DOCUMENTO && param.CORR_TIPO_DOCUMENTO > 0) {
            xWhere.push({ Parameter: 'CORR_TIPO_DOCUMENTO', Value: param.CORR_TIPO_DOCUMENTO });
        }

        if (param.NOMBRE_FLUJO) {
            xWhere.push({ Parameter: 'NOMBRE_FLUJO', Value: param.NOMBRE_FLUJO });
        }

        if (param.OPCION_CONSULTA && param.OPCION_CONSULTA > 0) {
            xWhere.push({ Parameter: 'OPCION_CONSULTA', Value: param.OPCION_CONSULTA });
        }

        return this.repo.get(xWhere);
    }

    get(param: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_FLUJO_PROCESO', Value: param.CORR_FLUJO_PROCESO }];
        return this.repo.get(xWhere);
    }

    insert(model: any): Observable<IResult> {
        return this.repo.create(model);
    }

    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_FLUJO_PROCESO', Value: model.CORR_FLUJO_PROCESO }];
        return this.repo.update(model, xWhere);
    }

    delete(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_FLUJO_PROCESO', Value: model.CORR_FLUJO_PROCESO }];
        return this.repo.delete(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'CORR_FLUJO_PROCESO', caption: 'Corr.', width: 100 },
            { dataField: 'NOMBRE_FLUJO', caption: 'Nombre', width: 250 },
            { dataField: 'NOMBRE_TIPO_DOCUMENTO', caption: 'Tipo Documento', width: 200 },
            { dataField: 'DESCRIPCION', caption: 'Descripción', width: 300 },
            {
                dataField: 'ES_DEFECTO',
                caption: 'Defecto',
                width: 120,
                dataType: 'boolean',
                customizeText: (e: any) => e.value ? 'Sí' : 'No',
            },
            {
                dataField: 'ACTIVO',
                caption: 'Activo',
                width: 120,
                dataType: 'boolean',
                customizeText: (e: any) => e.value ? 'Sí' : 'No',
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
                    column: 'CORR_FLUJO_PROCESO',
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
                dataField: 'CORR_FLUJO_PROCESO',
                label: { text: 'Corr.' },
                colSpan: 1,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'CORR_TIPO_DOCUMENTO',
                label: { text: 'Documentos' },
                colSpan: 2,
                template: 'CORR_TIPO_DOCUMENTOLookup',
                editorOptions: {
                    placeholder: 'Seleccione un documento...',
                    showClearButton: true,
                },
            },
            {
                dataField: 'NOMBRE_FLUJO',
                label: { text: 'Nombre' },
                colSpan: 2,
                editorOptions: {
                    placeholder: 'Nombre del flujo...',
                    showClearButton: true,
                    maxLength: 100,
                },
            },
            {
                dataField: 'DESCRIPCION',
                label: { text: 'Descripción' },
                colSpan: 2,
                editorOptions: {
                    placeholder: 'Descripción del flujo...',
                    showClearButton: true,
                    maxLength: 100,
                },
            },
           
            {
                dataField: 'ES_DEFECTO',
                label: { text: 'Flujo por Defecto' },
                colSpan: 2,
                editorType: 'dxCheckBox',
            },
            {
                dataField: 'ACTIVO',
                label: { text: 'Activo' },
                colSpan: 1,
                editorType: 'dxCheckBox',
            },
        ];
    }
}