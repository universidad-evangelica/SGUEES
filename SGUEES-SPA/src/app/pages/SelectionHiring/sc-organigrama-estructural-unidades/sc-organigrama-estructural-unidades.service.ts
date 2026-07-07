import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { SC_OrganigramaEstructuralUnidadesRepository } from './sc-organigrama-estructural-unidades.repository';
import { SC_OrganigramaEstructuralUnidad } from './models/sc-organigrama-estructural-unidad';
import { SC_OrganigramaEstructuralNivel } from './models/sc-organigrama-estructural-nivel';

@Injectable({
    providedIn: 'root',
})
export class SC_OrganigramaEstructuralUnidadesService {
    constructor(private repo: SC_OrganigramaEstructuralUnidadesRepository) { }



    //#region <Validadores Nivel>
    esValidoNivel(model: SC_OrganigramaEstructuralNivel, msg: Function): boolean {
        if (model.NOMBRE_NIVEL == '' || model.NOMBRE_NIVEL == null) {
            msg('Debe digitar el nombre del nivel', NotifyType.Error);
            return false;
        }

        if (model.NOMBRE_NIVEL.length > 50) {
            msg('El nombre del nivel no puede exceder los 50 caracteres', NotifyType.Error);
            return false;
        }

        if (!model.CANTIDAD_CARACTERES || model.CANTIDAD_CARACTERES <= 0) {
            msg('La cantidad de caracteres debe ser mayor a 0', NotifyType.Error);
            return false;
        }

        return true;
    }
    //#endregion

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

    //#region <Métodos de Niveles>
    getNiveles(param: any): Observable<IResult> {
        let xWhere: IParam[] = [];

        if (param.CORR_NIVEL && param.CORR_NIVEL > 0) {
            xWhere.push({ Parameter: 'CORR_NIVEL', Value: param.CORR_NIVEL });
        }

        if (param.NOMBRE_NIVEL) {
            xWhere.push({ Parameter: 'NOMBRE_NIVEL', Value: param.NOMBRE_NIVEL });
        }

        if (param.OPCION_CONSULTA && param.OPCION_CONSULTA > 0) {
            xWhere.push({ Parameter: 'OPCION_CONSULTA', Value: param.OPCION_CONSULTA });
        }

        return this.repo.getNiveles(xWhere);
    }

    getNivel(param: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_NIVEL', Value: param.CORR_NIVEL }];
        return this.repo.getNivel(xWhere);
    }

    insertNivel(model: any): Observable<IResult> {
        return this.repo.createNivel(model);
    }

    updateNivel(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_NIVEL', Value: model.CORR_NIVEL }];
        return this.repo.updateNivel(model, xWhere);
    }

    deleteNivel(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_NIVEL', Value: model.CORR_NIVEL }];
        return this.repo.deleteNivel(xWhere);
    }

    getNivelesActivos(param: any): Observable<IResult> {
        let xWhere: IParam[] = [];

        if (param.CORR_EMPRESA) {
            xWhere.push({ Parameter: 'CORR_EMPRESA', Value: param.CORR_EMPRESA });
        }
        xWhere.push({ Parameter: 'OPCION_CONSULTA', Value: 1 });

        return this.repo.getNivelesActivos(xWhere);
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
    getNivelColumns(): any {
        return [
            { dataField: 'CORR_NIVEL', caption: 'Corr.', width: 200 },
            { dataField: 'NOMBRE_NIVEL', caption: 'Nombre', width: 250 },
            { dataField: 'CANTIDAD_CARACTERES', caption: 'Caracteres', width: 200 },
            {
                dataField: 'ACTIVO',
                caption: 'Activo',
                width: 150,
                customizeText: (e: any) => e.value ? 'Sí' : 'No',
            },
        ];
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

    getNivelItems(): any {
        return [
            {
                dataField: 'CORR_NIVEL',
                label: { text: 'Corr.' },
                colSpan: 1,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'NOMBRE_NIVEL',
                label: { text: 'Nombre' },
                colSpan: 3,
                editorOptions: {
                    placeholder: 'Nombre del nivel...',
                    showClearButton: true,
                    maxLength: 50,
                },
            },
            {
                dataField: 'CANTIDAD_CARACTERES',
                label: { text: 'Caracteres' },
                colSpan: 2,
                editorType: 'dxNumberBox',
                editorOptions: {
                    placeholder: 'Cantidad de caracteres...',
                    min: 1,
                    max: 99,
                    showSpinButtons: true,
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