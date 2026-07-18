import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { SegFlujoService } from './seg-flujo-paso.repository';
import { SegFlujoPaso } from './models/seg-flujo-paso';

@Injectable({
    providedIn: 'root',
})
export class SegFlujoPasoService {
    constructor(private repo: SegFlujoService) {}

    getPasosPorFlujo(CORR_FLUJO_PROCESO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_FLUJO_PROCESO', Value: CORR_FLUJO_PROCESO }];
        return this.repo.get(xWhere);
    }

    create(model: SegFlujoPaso): Observable<IResult> {
        return this.repo.create(model);
    }

    update(model: SegFlujoPaso): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_FLUJO_PASO', Value: model.CORR_FLUJO_PASO }];
        return this.repo.update(model, xWhere);
    }

    delete(CORR_FLUJO_PASO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_FLUJO_PASO', Value: CORR_FLUJO_PASO }];
        return this.repo.delete(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'CORR_FLUJO_PASO', caption: 'Corr.', width: 80 },
            { dataField: 'NUMERO_PASO', caption: 'Número', width: 100 },
            { dataField: 'NOMBRE_PASO', caption: 'Nombre', width: 200 },
            { dataField: 'DESCRIPCION_PASO', caption: 'Descripción', width: 300 },
            {
                dataField: 'ACTIVO',
                caption: 'Activo',
                width: 80,
                dataType: 'boolean',
                customizeText: (e: any) => e.value ? 'Sí' : 'No',
            },
            { dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 120 },
            { dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 150, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_FLUJO_PASO',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    getItems(): any {
        return [
            // Fila 1: total 8 cols
            {
                dataField: 'CORR_FLUJO_PASO',
                label: { text: 'Corr.' },
                colSpan: 1,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'NOMBRE_PASO',
                label: { text: 'Nombre' },
                colSpan: 3,
                editorOptions: {
                    placeholder: 'Nombre del paso...',
                    showClearButton: true,
                    maxLength: 100,
                },
            },
            {
                dataField: 'CORR_ACTOR_ORIGEN',
                label: { text: 'Actor Origen' },
                colSpan: 2,
                template: 'CORR_ACTOR_ORIGENLookup',
            },
            {
                dataField: 'CORR_ACTOR_DESTINO',
                label: { text: 'Actor Destino' },
                colSpan: 2,
                template: 'CORR_ACTOR_DESTINOLookup',
            },
            {
                dataField: 'CORR_UNIDAD_DESTINO',
                label: { text: 'Unidad destino (NULL->Inferirá unidad documento)', visible: false },
                colSpan: 2,
                template: 'CORR_UNIDAD_DESTINOTemplate',
            },
            // Fila 2: total 8 cols
            {
                dataField: 'DESCRIPCION_PASO',
                label: { text: 'Descripción' },
                colSpan: 7,
                editorType: 'dxTextArea',
                editorOptions: {
                    placeholder: 'Descripción del paso...',
                    showClearButton: true,
                    maxLength: 500,
                    minHeight: 100,
                },
            },
            {
                dataField: 'ACTIVO',
                label: { text: 'Activo' },
                colSpan: 1,
                editorType: 'dxCheckBox',
            },
        ];
    }

    //#region <Validadores>
    esValido(model: SegFlujoPaso, msg: Function): boolean {
        if (model.NOMBRE_PASO == '' || model.NOMBRE_PASO == null) {
            msg('Debe digitar el nombre del paso', NotifyType.Error);
            return false;
        }

        if (model.NOMBRE_PASO.length > 100) {
            msg('El nombre del paso no puede exceder los 100 caracteres', NotifyType.Error);
            return false;
        }

        if (model.DESCRIPCION_PASO && model.DESCRIPCION_PASO.length > 500) {
            msg('La descripción no puede exceder los 500 caracteres', NotifyType.Error);
            return false;
        }

        return true;
    }
    // #endregion
}
