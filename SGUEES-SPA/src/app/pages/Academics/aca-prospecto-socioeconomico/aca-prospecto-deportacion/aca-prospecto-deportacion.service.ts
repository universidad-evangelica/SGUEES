import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoDeportacionRepository } from './aca-prospecto-deportacion.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoDeportacionService {
    constructor(private repo: AcaProspectoDeportacionRepository) {}

    // Qué hace: deportaciones declaradas (sección "Migratorio"). Pueden ser varias; el portal muestra la vigente.
    getDeportacionesPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    getModeloNuevo(persona: any): any {
        return {
            CORR_PROSPECTO_DEPORTACION: 0,
            CORR_PROSPECTO_PERSONA: persona?.CORR_PROSPECTO_PERSONA ?? 0,
            CORR_PROSPECTO: persona?.CORR_PROSPECTO ?? 0,
            CORR_PAIS: null,
            NOMBRE_PAIS: '',
            ES_VIGENTE: true,
            OBSERVACION: '',
        };
    }

    insert(model: any): Observable<IResult> {
        return this.repo.create(this.getPayload(model));
    }

    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_DEPORTACION', Value: model.CORR_PROSPECTO_DEPORTACION }];
        return this.repo.update(this.getPayload(model), xWhere);
    }

    delete(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_DEPORTACION', Value: model.CORR_PROSPECTO_DEPORTACION }];
        return this.repo.delete(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'NOMBRE_PAIS', caption: 'País', width: 200 },
            {
                dataField: 'ES_VIGENTE',
                caption: 'Vigente',
                width: 100,
                dataType: 'boolean',
                customizeText: (e: any) => (e.value ? 'Sí' : 'No'),
            },
            { dataField: 'OBSERVACION', caption: 'Observación', width: 400 },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_PROSPECTO_DEPORTACION',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    // Qué hace: formulario de una deportación (reemplaza a la grilla mientras se edita).
    // Cómo lo hace: el país es lookup (template), así que su obligatoriedad se revisa en validar().
    getItems(): any {
        return [
            { dataField: 'CORR_PAIS', label: { text: 'País' }, colSpan: 3, template: 'CORR_PAIS_DEPORTACIONLookup' },
            { dataField: 'ES_VIGENTE', label: { text: 'Vigente' }, colSpan: 1, editorType: 'dxCheckBox' },
            { dataField: 'OBSERVACION', label: { text: 'Observación' }, colSpan: 4, editorOptions: { maxLength: 500 } },
        ];
    }

    // Qué hace: país obligatorio y una sola deportación por país.
    // Cómo lo hace: regla de negocio: si lo deportaron dos veces del mismo país, solo interesa la
    //               última, así que esa fila se edita en lugar de agregar otra (la tabla no tiene
    //               índice único por país; lo cuida el ERP en pantalla y en el API).
    validar(model: any, otras: any[]): string | null {
        if (!model?.CORR_PAIS) {
            return 'Seleccione el país de la deportación.';
        }
        if ((otras ?? []).some((d) => d.CORR_PAIS === model.CORR_PAIS)) {
            return 'El prospecto ya tiene registrada una deportación de ese país; edite esa fila.';
        }
        return null;
    }

    // Qué hace: columnas de ACA_PROSPECTO_DEPORTACION que viajan al API.
    getPayload(model: any): any {
        return {
            CORR_PROSPECTO_DEPORTACION: model.CORR_PROSPECTO_DEPORTACION ?? 0,
            CORR_PROSPECTO_PERSONA: model.CORR_PROSPECTO_PERSONA,
            CORR_PAIS: model.CORR_PAIS,
            ES_VIGENTE: model.ES_VIGENTE === true,
            OBSERVACION: model.OBSERVACION,
        };
    }
}
