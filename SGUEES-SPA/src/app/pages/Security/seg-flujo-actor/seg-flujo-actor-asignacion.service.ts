import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { SegFlujoActorAsignacionRepository } from './seg-flujo-actor-asignacion.repository';
import { SegFlujoActorAsignacion } from './models/seg-flujo-actor-asignacion';

@Injectable({
    providedIn: 'root',
})
export class SegFlujoActorAsignacionService {
    constructor(private repo: SegFlujoActorAsignacionRepository) { }

    //#region <Validadores>
    esValido(model: SegFlujoActorAsignacion, msg: Function): boolean {
        if (model.LOGIN_SISTEMA == '' || model.LOGIN_SISTEMA == null) {
            msg('Debe digitar el login del sistema', NotifyType.Error);
            return false;
        }

        if (model.LOGIN_SISTEMA.length > 100) {
            msg('El login del sistema no puede exceder los 100 caracteres', NotifyType.Error);
            return false;
        }

        if (model.CORR_UNIDAD == null || model.CORR_UNIDAD === 0) {
            msg('Debe seleccionar una unidad', NotifyType.Error);
            return false;
        }

        return true;
    }
    // #endregion

    getAll(param: any): Observable<IResult> {
        let xWhere: IParam[] = [];

        if (param.CORR_ASIGNACION && param.CORR_ASIGNACION > 0) {
            xWhere.push({ Parameter: 'CORR_ASIGNACION', Value: param.CORR_ASIGNACION });
        }

        if (param.CORR_ACTOR && param.CORR_ACTOR > 0) {
            xWhere.push({ Parameter: 'CORR_ACTOR', Value: param.CORR_ACTOR });
        }

        if (param.LOGIN_SISTEMA) {
            xWhere.push({ Parameter: 'LOGIN_SISTEMA', Value: param.LOGIN_SISTEMA });
        }

        return this.repo.get(xWhere);
    }

    get(param: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_ASIGNACION', Value: param.CORR_ASIGNACION }];
        return this.repo.getById(xWhere);
    }

    insert(model: any): Observable<IResult> {
        return this.repo.create(model);
    }

    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_ASIGNACION', Value: model.CORR_ASIGNACION }];
        return this.repo.update(model, xWhere);
    }

    delete(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_ASIGNACION', Value: model.CORR_ASIGNACION }];
        return this.repo.delete(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'CORR_ASIGNACION', caption: 'Corr.', width: 100 },
            { dataField: 'LOGIN_SISTEMA', caption: 'Login Sistema', width: 250 },
            { dataField: 'CORR_UNIDAD', caption: 'Unidad', width: 150 },
            {
                dataField: 'ACTIVO',
                caption: 'Activo',
                width: 120,
                dataType: 'boolean',
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
        ];
    }

    getItems(): any {
        return [
            {
                dataField: 'CORR_ASIGNACION',
                label: { text: 'Corr.' },
                colSpan: 1,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'CORR_ACTOR_ORIGEN',
                label: { text: 'Actor Origen' },
                colSpan: 3,
                template: 'CORR_ACTOR_ORIGENLookup',
            },
            {
                dataField: 'CORR_UNIDAD',
                label: { text: 'Unidad' },
                colSpan: 3,
                template: 'CORR_UNIDADTemplate',
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
