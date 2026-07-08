import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { SC_OrganigramaEstructuralUnidadesRepository } from './sc-organigrama-estructural-unidades.repository';
import { SC_OrganigramaEstructuralUnidad } from './models/sc-organigrama-estructural-unidad';

@Injectable({
    providedIn: 'root',
})
export class SC_OrganigramaEstructuralUnidadesService {
    constructor(private repo: SC_OrganigramaEstructuralUnidadesRepository) { }

    //#region <Métodos de Unidades>
    getAll(param: any): Observable<IResult> {
        let xWhere: IParam[] = [];

        if (param.CORR_UNIDAD && param.CORR_UNIDAD > 0) {
            xWhere.push({ Parameter: 'CORR_UNIDAD', Value: param.CORR_UNIDAD });
        }

        if (param.CODIGO_UNIDAD) {
            xWhere.push({ Parameter: 'CODIGO_UNIDAD', Value: param.CODIGO_UNIDAD });
        }

        if (param.NOMBRE_UNIDAD) {
            xWhere.push({ Parameter: 'NOMBRE_UNIDAD', Value: param.NOMBRE_UNIDAD });
        }

        if (param.CORR_NIVEL && param.CORR_NIVEL > 0) {
            xWhere.push({ Parameter: 'CORR_NIVEL', Value: param.CORR_NIVEL });
        }

        if (param.OPCION_CONSULTA && param.OPCION_CONSULTA > 0) {
            xWhere.push({ Parameter: 'OPCION_CONSULTA', Value: param.OPCION_CONSULTA });
        }

        return this.repo.get(xWhere);
    }

    get(param: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_UNIDAD', Value: param.CORR_UNIDAD }];
        return this.repo.get(xWhere);
    }

    insert(model: any): Observable<IResult> {
        return this.repo.create(model);
    }

    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_UNIDAD', Value: model.CORR_UNIDAD }];
        return this.repo.update(model, xWhere);
    }

    delete(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_UNIDAD', Value: model.CORR_UNIDAD }];
        return this.repo.delete(xWhere);
    }
    //#endregion

    //#region <Columnas y Items>
    getColumns(): any {
        return [
            { dataField: 'CORR_UNIDAD', caption: 'Corr.', width: 80 },
            { dataField: 'CODIGO_UNIDAD', caption: 'Código', width: 120 },
            { dataField: 'NOMBRE_UNIDAD', caption: 'Nombre', width: 250 },
            { dataField: 'NOMBRE_NIVEL', caption: 'Nivel', width: 120 },
            { dataField: 'NOMBRE_UNIDAD_PADRE', caption: 'Unidad Padre', width: 200 },
            {
                dataField: 'ACTIVO',
                caption: 'Activo',
                width: 80,
                dataType: 'boolean',
                customizeText: (e: any) => e.value ? 'Sí' : 'No',
            },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_UNIDAD',
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
                dataField: 'CORR_UNIDAD',
                label: { text: 'Corr.' },
                colSpan: 1,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'NOMBRE_UNIDAD',
                label: { text: 'Unidad' },
                colSpan: 2,
                editorOptions: {
                    placeholder: 'Nombre de la unidad...',
                    showClearButton: true,
                    maxLength: 100,
                },
            },
            {
                dataField: 'CORR_NIVEL',
                label: { text: 'Nivel' },
                colSpan: 2,
                template: 'CORR_NIVELESLookup',
                editorOptions: {
                    placeholder: 'Seleccione un nivel...',
                    showClearButton: true,
                },
            },
            {
                dataField: 'CORR_UNIDAD_PADRE',
                label: { text: 'Unidad Padre' },
                colSpan: 2,
                template: 'CORR_UNIDADESLookup',
                editorOptions: {
                    placeholder: 'Seleccione unidad padre...',
                    showClearButton: true,
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

    //#endregion
}