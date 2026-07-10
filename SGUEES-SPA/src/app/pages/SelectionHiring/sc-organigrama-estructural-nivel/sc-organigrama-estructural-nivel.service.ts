import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { SC_OrganigramaEstructuralUnidadesRepository } from '../sc-organigrama-estructural-unidades/sc-organigrama-estructural-unidades.repository';
import { SC_OrganigramaEstructuralNivel } from './models/sc-organigrama-estructural-nivel';

@Injectable({
    providedIn: 'root',
})
export class SC_OrganigramaEstructuralNivelService {
    constructor(private repo: SC_OrganigramaEstructuralUnidadesRepository) {}

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
        const xWhere: IParam[] = [{ Parameter: 'CORR_NIVEL', Value: param.CORR_NIVEL }];
        return this.repo.getNivel(xWhere);
    }

    insertNivel(model: any): Observable<IResult> {
        return this.repo.createNivel(model);
    }

    updateNivel(model: any): Observable<IResult> {
        const xWhere: IParam[] = [{ Parameter: 'CORR_NIVEL', Value: model.CORR_NIVEL }];
        return this.repo.updateNivel(model, xWhere);
    }

    deleteNivel(model: any): Observable<IResult> {
        const xWhere: IParam[] = [{ Parameter: 'CORR_NIVEL', Value: model.CORR_NIVEL }];
        return this.repo.deleteNivel(xWhere);
    }

    getNivelesActivos(param: any): Observable<IResult> {
        const xWhere: IParam[] = [];

        if (param.CORR_EMPRESA) {
            xWhere.push({ Parameter: 'CORR_EMPRESA', Value: param.CORR_EMPRESA });
        }
        xWhere.push({ Parameter: 'OPCION_CONSULTA', Value: 1 });

        return this.repo.getNivelesActivos(xWhere);
    }

    getNivelColumns(): any {
        return [
            { dataField: 'CORR_NIVEL', caption: 'Corr.', width: 250 },
            { dataField: 'NOMBRE_NIVEL', caption: 'Nombre', width: 400 },
           
            {
                dataField: 'ACTIVO',
                caption: 'Activo',
                width: 100,
                customizeText: (e: any) => (e.value ? 'Sí' : 'No'),
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
                dataField: 'ACTIVO',
                label: { text: 'Activo' },
                colSpan: 1,
                editorType: 'dxCheckBox',
            },
        ];
    }
}
