import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { SegFlujoEstadoMensajeRepository } from './seg-flujo-estado-mensaje.repository';
import { SegFlujoEstadoMensaje } from './models/seg-flujo-estado-mensaje';

@Injectable({
    providedIn: 'root',
})
export class SegFlujoEstadoMensajeService {
    constructor(private repo: SegFlujoEstadoMensajeRepository) {}

    getByPaso(corrFlujoProceso: number, corrPaso: number): Observable<IResult> {
        const xWhere: IParam[] = [
            { Parameter: 'CORR_FLUJO_PROCESO', Value: corrFlujoProceso },
            { Parameter: 'CORR_PASO', Value: corrPaso },
        ];
        return this.repo.get(xWhere);
    }

    create(model: SegFlujoEstadoMensaje): Observable<IResult> {
        return this.repo.create(model);
    }

    update(model: SegFlujoEstadoMensaje): Observable<IResult> {
        const xWhere: IParam[] = [
            { Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA },
            { Parameter: 'CORR_ESTADO_MENSAJE', Value: model.CORR_ESTADO_MENSAJE },
        ];
        return this.repo.update(model, xWhere);
    }

    delete(model: SegFlujoEstadoMensaje): Observable<IResult> {
        const xWhere: IParam[] = [
            { Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA },
            { Parameter: 'CORR_ESTADO_MENSAJE', Value: model.CORR_ESTADO_MENSAJE },
        ];
        return this.repo.delete(xWhere);
    }

    esValido(model: SegFlujoEstadoMensaje, msg: Function): boolean {
        if (!model.CORR_ESTADO || model.CORR_ESTADO <= 0) {
            msg('Debe seleccionar un estado', NotifyType.Error);
            return false;
        }

        if (!model.MENSAJE || model.MENSAJE.trim() === '') {
            msg('Debe ingresar el mensaje', NotifyType.Error);
            return false;
        }

        return true;
    }

    getColumns(): any {
        return [
            { dataField: 'CORR_ESTADO_MENSAJE', caption: 'Corr.', width: 100 },
            { dataField: 'NOMBRE_ESTADO', caption: 'Estado', width: 200 },
            { dataField: 'NOMBRE_ACTOR', caption: 'Actor Destino', width: 200 },
            { dataField: 'LOGIN_SISTEMA', caption: 'Login Sistema', width: 200 },
            { dataField: 'MENSAJE', caption: 'Mensaje', minWidth: 250 },
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
                    column: 'CORR_ESTADO_MENSAJE',
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
                dataField: 'CORR_ESTADO_MENSAJE',
                label: { text: 'Corr.' },
                colSpan: 1,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'CORR_ESTADO',
                label: { text: 'Estado' },
                colSpan: 3,
                template: 'CORR_ESTADO_MENSAJELookup',
            },
            {
                dataField: 'CORR_ACTOR',
                label: { text: 'Actor Destino (opcional)' },
                colSpan: 2,
                template: 'CORR_ACTOR_MENSAJELookup',
            },
            {
                dataField: 'LOGIN_SISTEMA',
                label: { text: 'Login Sistema (opcional)' },
                colSpan: 2,
                editorOptions: { placeholder: 'Login específico...' },
            },
            {
                dataField: 'MENSAJE',
                label: { text: 'Mensaje' },
                colSpan: 8,
                editorType: 'dxTextArea',
                editorOptions: { height: 80, placeholder: 'Ingrese el mensaje de notificación...' },
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
