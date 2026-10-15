import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoLimitacionFisicaRepository } from './aca-prospecto-limitacion-fisica.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoLimitacionFisicaService {
    constructor(private repo: AcaProspectoLimitacionFisicaRepository) {}

    // Qué hace: limitaciones físicas declaradas (sección "Salud"). Pueden ser varias, sin repetir.
    getLimitacionesPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    getModeloNuevo(persona: any): any {
        return {
            CORR_PROSPECTO_LIMITACION_FISICA: 0,
            CORR_PROSPECTO_PERSONA: persona?.CORR_PROSPECTO_PERSONA ?? 0,
            CORR_PROSPECTO: persona?.CORR_PROSPECTO ?? 0,
            CORR_LIMITACION_FISICA: null,
            NOMBRE_LIMITACION: '',
            ESPECIFIQUE: '',
        };
    }

    insert(model: any): Observable<IResult> {
        return this.repo.create(this.getPayload(model));
    }

    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_LIMITACION_FISICA', Value: model.CORR_PROSPECTO_LIMITACION_FISICA }];
        return this.repo.update(this.getPayload(model), xWhere);
    }

    delete(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_LIMITACION_FISICA', Value: model.CORR_PROSPECTO_LIMITACION_FISICA }];
        return this.repo.delete(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'NOMBRE_LIMITACION', caption: 'Limitación', width: 260 },
            { dataField: 'ESPECIFIQUE', caption: 'Especifique', width: 400 },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_PROSPECTO_LIMITACION_FISICA',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    // Qué hace: formulario de una limitación (reemplaza a la grilla mientras se edita).
    // Cómo lo hace: la limitación es lookup (template), así que su obligatoriedad se revisa en validar().
    getItems(): any {
        return [
            { dataField: 'CORR_LIMITACION_FISICA', label: { text: 'Limitación' }, colSpan: 3, template: 'CORR_LIMITACION_FISICALookup' },
            { dataField: 'ESPECIFIQUE', label: { text: 'Especifique' }, colSpan: 5, editorOptions: { maxLength: 500 } },
        ];
    }

    // Qué hace: obligatoriedad del lookup y no repetir la limitación (la tabla tiene índice único).
    validar(model: any, otras: any[]): string | null {
        if (!model?.CORR_LIMITACION_FISICA) {
            return 'Seleccione la limitación física.';
        }
        if ((otras ?? []).some((l) => l.CORR_LIMITACION_FISICA === model.CORR_LIMITACION_FISICA)) {
            return 'El prospecto ya tiene registrada esa limitación física.';
        }
        return null;
    }

    // Qué hace: columnas de ACA_PROSPECTO_LIMITACION_FISICA que viajan al API.
    getPayload(model: any): any {
        return {
            CORR_PROSPECTO_LIMITACION_FISICA: model.CORR_PROSPECTO_LIMITACION_FISICA ?? 0,
            CORR_PROSPECTO_PERSONA: model.CORR_PROSPECTO_PERSONA,
            CORR_LIMITACION_FISICA: model.CORR_LIMITACION_FISICA,
            ESPECIFIQUE: model.ESPECIFIQUE,
        };
    }
}
