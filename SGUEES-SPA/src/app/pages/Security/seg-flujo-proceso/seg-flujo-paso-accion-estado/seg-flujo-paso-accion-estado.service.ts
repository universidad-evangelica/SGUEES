import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { SegFlujoPasoAccionEstadoRepository } from './seg-flujo-paso-accion-estado.repository';
import { SegFlujoPasoAccionEstado } from './models/seg-flujo-paso-accion-estado';

@Injectable({
    providedIn: 'root',
})
export class SegFlujoPasoAccionEstadoService {
    constructor(private repo: SegFlujoPasoAccionEstadoRepository) {}

    getByPaso(corrFlujoProceso: number, corrPaso: number): Observable<IResult> {
        const xWhere: IParam[] = [
            { Parameter: 'CORR_FLUJO_PROCESO', Value: corrFlujoProceso },
            { Parameter: 'CORR_PASO', Value: corrPaso },
        ];
        return this.repo.get(xWhere);
    }

    create(model: SegFlujoPasoAccionEstado): Observable<IResult> {
        return this.repo.create(model);
    }

    update(model: SegFlujoPasoAccionEstado): Observable<IResult> {
        const xWhere: IParam[] = [
            { Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA },
            { Parameter: 'CORR_FLUJO_PROCESO', Value: model.CORR_FLUJO_PROCESO },
            { Parameter: 'CORR_PASO', Value: model.CORR_PASO },
            { Parameter: 'CORR_ACCION', Value: model.CORR_ACCION },
        ];
        return this.repo.update(model, xWhere);
    }

    delete(model: SegFlujoPasoAccionEstado): Observable<IResult> {
        const xWhere: IParam[] = [
            { Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA },
            { Parameter: 'CORR_FLUJO_PROCESO', Value: model.CORR_FLUJO_PROCESO },
            { Parameter: 'CORR_PASO', Value: model.CORR_PASO },
            { Parameter: 'CORR_ACCION', Value: model.CORR_ACCION },
        ];
        return this.repo.delete(xWhere);
    }

    esValido(model: SegFlujoPasoAccionEstado, msg: Function): boolean {
        if (!model.CORR_ESTADO_DESTINO || model.CORR_ESTADO_DESTINO <= 0) {
            msg('Debe seleccionar un estado destino', NotifyType.Error);
            return false;
        }

        if (!model.CORR_TIPO_MOVIMIENTO || model.CORR_TIPO_MOVIMIENTO <= 0) {
            msg('Debe seleccionar un tipo de movimiento', NotifyType.Error);
            return false;
        }

        if (!model.CORR_TIPO_NOTIFICACION || model.CORR_TIPO_NOTIFICACION <= 0) {
            msg('Debe seleccionar un tipo de notificación', NotifyType.Error);
            return false;
        }

        return true;
    }

    getColumns(): any {
        return [
            { dataField: 'CORR_ACCION', caption: 'Accion', width: 100 },
            { dataField: 'NOMBRE_ESTADO', caption: 'Estado Destino', width: 200 },
            { dataField: 'TIPO_MOVIMIENTO', caption: 'Tipo Movimiento', width: 250 },
            { dataField: 'TIPO_NOTIFICACION', caption: 'Tipo Notificación', width: 250 },
            { dataField: 'CORR_PASO_DESTINO', caption: 'Paso Destino', width: 200 },
            {
                dataField: 'PERMITIDO',
                caption: 'Permitido',
                width: 200,
                dataType: 'boolean',
                customizeText: (e: any) => (e.value ? 'Sí' : 'No'),
            },
            {
                dataField: 'ACTIVO',
                caption: 'Activo',
                width: 200,
                dataType: 'boolean',
                customizeText: (e: any) => (e.value ? 'Sí' : 'No'),
            },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_ACCION',
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
                dataField: 'CORR_ACCION',
                label: { text: 'Corr.' },
                colSpan: 1,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'CORR_ESTADO_DESTINO',
                label: { text: 'Estado Destino' },
                colSpan: 3,
                template: 'CORR_ESTADO_DESTINOLookup',
            },
            {
                dataField: 'CORR_TIPO_MOVIMIENTO',
                label: { text: 'Tipo Movimiento' },
                colSpan: 2,
                template: 'CORR_TIPO_MOVIMIENTOLookup',
            },
            {
                dataField: 'CORR_TIPO_NOTIFICACION',
                label: { text: 'Tipo Notificación' },
                colSpan: 2,
                template: 'CORR_TIPO_NOTIFICACIONLookup',
            },
            {
                dataField: 'CORR_PASO_DESTINO',
                label: { text: 'Paso Destino' },
                colSpan: 2,
                template: 'CORR_PASO_DESTINOLookup',
            },
            {
                dataField: 'PERMITIDO',
                label: { text: 'Permitido' },
                colSpan: 1,
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
