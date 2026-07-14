import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { SegFlujoActorRepository } from './seg-flujo-actor.repository';
import { SegFlujoActor } from './models/seg-flujo-actor';

@Injectable({
    providedIn: 'root',
})
export class SegFlujoActorService {
    constructor(private repo: SegFlujoActorRepository) {}

    //#region <Validadores>
    esValido(model: SegFlujoActor, msg: Function): boolean {
        if (model.NOMBRE_ACTOR == '' || model.NOMBRE_ACTOR == null) {
            msg('Debe digitar el nombre del actor', NotifyType.Error);
            return false;
        }

        if (model.NOMBRE_ACTOR.length > 100) {
            msg('El nombre del actor no puede exceder los 100 caracteres', NotifyType.Error);
            return false;
        }

        if (model.DESCRIPCION && model.DESCRIPCION.length > 500) {
            msg('La descripción no puede exceder los 500 caracteres', NotifyType.Error);
            return false;
        }

        return true;
    }
    // #endregion

    getAll(param: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_ACTOR', Value: param.CORR_ACTOR }];

        return this.repo.get(xWhere);
    }

    get(param: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_ACTOR', Value: param.CORR_ACTOR }];

        return this.repo.get(xWhere);
    }

    insert(model: any): Observable<IResult> {
        return this.repo.create(model);
    }

    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_ACTOR', Value: model.CORR_ACTOR }];

        return this.repo.update(model, xWhere);
    }

    delete(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_ACTOR', Value: model.CORR_ACTOR }];

        return this.repo.delete(xWhere);
    }

    getColumns(): any {
        return [
            {
                type: 'buttons',
                name: 'btnAcciones',
                caption: 'Options',
                width: 125,
                minWidth: 125,
                allowResizing: false,
                fixed: true,
                fixedPosition: 'left',
                alignment: 'center',
                buttons: [
                    {
                        hint: 'Editar registro',
                        icon: 'edit',
                        stylingMode: 'text',
                        cssClass: 'sguees-grid-action-edit',
                        disabled: (e: any) => !!e.row.data.RESOLUCION_AUTOMATICA,
                    },
                    {
                        name: 'delete',
                        hint: 'Eliminar registro',
                        icon: 'trash',
                        stylingMode: 'text',
                        cssClass: 'sguees-grid-action-delete',
                        disabled: (e: any) => !!e.row.data.RESOLUCION_AUTOMATICA,
                    },
                ],
            },
            { dataField: 'CORR_ACTOR', caption: 'Corr.', width: 150 },
            { dataField: 'NOMBRE_ACTOR', caption: 'Nombre', width: 300 },
            { dataField: 'DESCRIPCION', caption: 'Descripción', width: 350 },
            {
                dataField: 'REQUIERE_UNIDAD',
                caption: 'Requiere Unidad',
                width: 200,
                dataType: 'boolean',
                customizeText: (e: any) => e.value ? 'Sí' : 'No',
            },
            {
                dataField: 'RESOLUCION_AUTOMATICA',
                caption: 'Resolución automatica',
                width: 250,
                dataType: 'boolean',
                customizeText: (e: any) => e.value ? 'Sí' : 'No',
            },
            {
                dataField: 'ACTIVO',
                caption: 'Activo',
                width: 150,
                dataType: 'boolean',
                customizeText: (e: any) => e.value ? 'Sí' : 'No',
            },
            { dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 200 },
            { dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 200 },
            {
                dataField: 'FECHA_CREA',
                caption: 'Fecha Crea',
                width: 200,
                dataType: 'datetime',
                format: 'dd/MM/yyyy HH:mm',
            },
            { dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 200 },
            { dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 200 },
            {
                dataField: 'FECHA_ACTU',
                caption: 'Fecha Actu',
                width: 200,
                dataType: 'datetime',
                format: 'dd/MM/yyyy HH:mm',
            },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_ACTOR',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    getItems(): any {
        return [
            { dataField: 'CORR_ACTOR', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
            {
                dataField: 'NOMBRE_ACTOR',
                label: { text: 'Nombre' },
                colSpan: 3,
                editorOptions: {
                    placeholder: 'Nombre del actor...',
                    showClearButton: true,
                    maxLength: 100,
                },
            },
            {
                dataField: 'DESCRIPCION',
                label: { text: 'Descripción' },
                colSpan: 4,
                editorOptions: {
                    placeholder: 'Descripción del actor...',
                    showClearButton: true,
                    maxLength: 500,
                },
            },
            {
                dataField: 'REQUIERE_UNIDAD',
                label: { text: 'Requiere Unidad' },
                colSpan: 2,
                editorType: 'dxCheckBox',
            },
            {
                dataField: 'RESOLUCION_AUTOMATICA',
                disabled:true,
                label: { text: 'Resolución automatica' },
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