import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { SC_OrganigramaEstructuralJefesRepository } from './sc-organigrama-estructural-jefes.repository';
import { SC_OrganigramaEstructuralJefe } from './models/sc-organigrama-estructural-jefe';

@Injectable({
    providedIn: 'root',
})
export class SC_OrganigramaEstructuralJefesService {
    constructor(private repo: SC_OrganigramaEstructuralJefesRepository) {}

    //#region <Validadores>
    esValido(model: SC_OrganigramaEstructuralJefe, msg: Function): boolean {
        if (!model.CORR_EMPLEADO || model.CORR_EMPLEADO <= 0) {
            msg('Debe seleccionar un empleado', NotifyType.Error);
            return false;
        }

        if (!model.FECHA_INICIO) {
            msg('La fecha de inicio es obligatoria', NotifyType.Error);
            return false;
        }

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaInicio = new Date(model.FECHA_INICIO);
        fechaInicio.setHours(0, 0, 0, 0);

        if (fechaInicio < hoy) {
            msg('La fecha de inicio no puede ser anterior a hoy', NotifyType.Error);
            return false;
        }

        if (model.FECHA_FIN) {
            const fechaFin = new Date(model.FECHA_FIN);
            fechaFin.setHours(0, 0, 0, 0);
            if (fechaFin <= fechaInicio) {
                msg('La fecha de fin debe ser mayor a la fecha de inicio', NotifyType.Error);
                return false;
            }
        }

        return true;
    }
    //#endregion

    //#region <Métodos CRUD>
    getByUnidad(corrUnidad: number): Observable<IResult> {
        let xWhere: IParam[] = [
            { Parameter: 'CORR_UNIDAD', Value: corrUnidad },
            { Parameter: 'ACTIVO', Value: 1 },
        ];
        return this.repo.get(xWhere);
    }

    getEmpleadosByUnidad(corrUnidadOrigen: number, corrUnidadDestino: number): Observable<IResult> {
        let xWhere: IParam[] = [
            { Parameter: 'CORR_UNIDAD_ORIGEN', Value: corrUnidadOrigen },
            { Parameter: 'CORR_UNIDAD_DESTINO', Value: corrUnidadDestino },
        ];
        return this.repo.getEmpleados(xWhere);
    }

    insert(model: any): Observable<IResult> {
        return this.repo.create(model);
    }

    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_JEFE', Value: model.CORR_JEFE }];
        return this.repo.update(model, xWhere);
    }

    delete(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_JEFE', Value: model.CORR_JEFE }];
        return this.repo.delete(xWhere);
    }
    //#endregion

    //#region <Columnas y Items>
    getColumns(): any[] {
        return [
            { dataField: 'CORR_JEFE', caption: 'Corr.', width: 80 },
            { dataField: 'NOMBRE_EMPLEADO', caption: 'Empleado', width: 200 },
            { dataField: 'NOMBRE_PUESTO', caption: 'Puesto', width: 200 },
            {
                dataField: 'FECHA_INICIO',
                caption: 'Fecha Inicio',
                width: 150,
                dataType: 'date',
                format: 'dd/MM/yyyy',
            },
            {
                dataField: 'FECHA_FIN',
                caption: 'Fecha Fin',
                width: 150,
                dataType: 'date',
                format: 'dd/MM/yyyy',
                customizeText: (e: any) => e.value ? e.value : 'Activo',
            },
            {
                dataField: 'ACTIVO',
                caption: 'Activo',
                width: 80,
                dataType: 'boolean',
                customizeText: (e: any) => e.value ? 'Sí' : 'No',
            },
        ];
    }

    getItems(): any[] {
        return [
            {
                dataField: 'CORR_JEFE',
                label: { text: 'Corr.' },
                colSpan: 1,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'CORR_EMPLEADO',
                label: { text: 'Empleado' },
                colSpan: 3,
                template: 'CORR_EMPLEADOLookup',
            },
            {
                dataField: 'FECHA_INICIO',
                label: { text: 'Fecha Inicio' },
                colSpan: 2,
                editorType: 'dxDateBox',
                editorOptions: {
                    type: 'date',
                    displayFormat: 'dd/MM/yyyy',
                    placeholder: 'Seleccione fecha inicio...',
                },
            },
            {
                dataField: 'FECHA_FIN',
                label: { text: 'Fecha Fin' },
                colSpan: 2,
                editorType: 'dxDateBox',
                editorOptions: {
                    type: 'date',
                    displayFormat: 'dd/MM/yyyy',
                    placeholder: 'Seleccione fecha fin (opcional)...',
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