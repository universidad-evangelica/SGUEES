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
        let xWhere: IParam[] = [{ Parameter: 'CORR_PASO', Value: model.CORR_PASO }];
        return this.repo.update(model, xWhere);
    }

    delete(CORR_PASO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PASO', Value: CORR_PASO }];
        return this.repo.delete(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'CORR_PASO', caption: 'Corr.', width: 100 },
            { dataField: 'ORDEN', caption: 'Paso', width: 100 },
            { dataField: 'NOMBRE_PASO', caption: 'Nombre del paso', width: 300 },
            { dataField: 'NOMBRE_ACTOR', caption: 'Actor origen', width: 200 },
            { dataField: 'NOMBRE_ACTOR_DESTINO', caption: 'Actor destino', width: 200 },
            { dataField: 'NOMBRE_ESTADO_ORIGEN', caption: 'Estado origen', width: 150 },
            { dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 150 },
            { dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 150, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_PASO',
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
                dataField: 'CORR_PASO',
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
                label: { text: 'Seleccione la unidad->Null resolvera a la instancia del documento', visible :false },
                colSpan: 4,
                template: 'CORR_UNIDAD_DESTINOTemplate',
            },
            {
                dataField: 'CORR_ESTADO_ORIGEN',
                label: { text: 'Selecciones el estado de origen' },
                colSpan: 4,
                template: 'CORR_ESTADO_ORIGENLookup',
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
