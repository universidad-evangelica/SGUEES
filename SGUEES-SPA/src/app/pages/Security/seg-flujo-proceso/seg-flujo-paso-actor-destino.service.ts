import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { SegFlujoPasoActorDestinoRepository } from './seg-flujo-paso-actor-destino.repository';
import { SegFlujoPasoActorDestino } from './models/seg-flujo-paso-actor-destino';

@Injectable({
    providedIn: 'root',
})
export class SegFlujoPasoActorDestinoService {
    constructor(private repo: SegFlujoPasoActorDestinoRepository) {}

    getByPaso(corrPaso: number): Observable<IResult> {
        const xWhere: IParam[] = [
            { Parameter: 'CORR_PASO', Value: corrPaso },
        ];
        return this.repo.get(xWhere);
    }

    create(model: SegFlujoPasoActorDestino): Observable<IResult> {
        return this.repo.create(model);
    }

    update(model: SegFlujoPasoActorDestino): Observable<IResult> {
        const xWhere: IParam[] = [
            { Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA },
            { Parameter: 'CORR_PASO_ACTOR_DESTINO', Value: model.CORR_PASO_ACTOR_DESTINO },
        ];
        return this.repo.update(model, xWhere);
    }

    delete(model: SegFlujoPasoActorDestino): Observable<IResult> {
        const xWhere: IParam[] = [
            { Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA },
            { Parameter: 'CORR_PASO_ACTOR_DESTINO', Value: model.CORR_PASO_ACTOR_DESTINO },
        ];
        return this.repo.delete(xWhere);
    }

    esValido(model: SegFlujoPasoActorDestino, msg: Function): boolean {
        if (!model.CORR_ACTOR || model.CORR_ACTOR <= 0) {
            msg('Debe seleccionar un actor destino', NotifyType.Error);
            return false;
        }

        return true;
    }

    requiereUnidad(corrActor: number): boolean {
        return corrActor <= 3 && corrActor !== 1;
    }

    getColumns(): any {
        return [
            { dataField: 'CORR_PASO_ACTOR_DESTINO', caption: 'Corr.', width: 80 },
            { dataField: 'NOMBRE_ACTOR', caption: 'Actor Destino', width: 200 },
            { dataField: 'NOMBRE_UNIDAD', caption: 'Unidad', minWidth: 200 },
            { dataField: 'ORDEN', caption: 'Orden', width: 100 },
            {
                dataField: 'ACTIVO',
                caption: 'Activo',
                width: 100,
                dataType: 'boolean',
                customizeText: (e: any) => (e.value ? 'Sí' : 'No'),
            },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_PASO_ACTOR_DESTINO',
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
                dataField: 'CORR_PASO_ACTOR_DESTINO',
                label: { text: 'Corr.' },
                colSpan: 1,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'CORR_ACTOR',
                label: { text: 'Actor Destino' },
                colSpan: 3,
                template: 'CORR_ACTOR_ACTOR_DESTINOLookup',
            },
            {
                dataField: 'CORR_UNIDAD',
                label: { text: 'Unidad' },
                colSpan: 4,
                template: 'CORR_UNIDAD_ACTOR_DESTINOTemplate',
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
