import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoMedioOrigenRepository } from './aca-prospecto-medio-origen.repository';

// Qué hace: medios con captura propia, identificados por su CODIGO en GEN_MEDIO_ORIGEN.
// Cómo lo hace: el portal los busca por nombre; por CODIGO es estable aunque alguien edite el nombre.
export const MEDIO_OTRO = 'OTRO';
export const MEDIO_REFERIDO = 'REF';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoMedioOrigenService {
    constructor(private repo: AcaProspectoMedioOrigenRepository) {}

    // Qué hace: medios por los que el prospecto conoció la universidad (sección "Información adicional").
    getMediosPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    getModeloNuevo(persona: any): any {
        return {
            CORR_PROSPECTO_MEDIO: 0,
            CORR_PROSPECTO_PERSONA: persona?.CORR_PROSPECTO_PERSONA ?? 0,
            CORR_PROSPECTO: persona?.CORR_PROSPECTO ?? 0,
            CORR_MEDIO_ORIGEN: null,
            NOMBRE_MEDIO: '',
            DESCRIPCION: '',
            ESTUDIANTE_REFIERE: '',
            CORR_CARRERA_REFIERE: null,
            CARRERA_REFIERE: '',
        };
    }

    insert(model: any): Observable<IResult> {
        return this.repo.create(this.getPayload(model));
    }

    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_MEDIO', Value: model.CORR_PROSPECTO_MEDIO }];
        return this.repo.update(this.getPayload(model), xWhere);
    }

    delete(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_MEDIO', Value: model.CORR_PROSPECTO_MEDIO }];
        return this.repo.delete(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'NOMBRE_MEDIO', caption: 'Medio', width: 220 },
            { dataField: 'DESCRIPCION', caption: 'Detalle (otro)', width: 280 },
            { dataField: 'ESTUDIANTE_REFIERE', caption: 'Estudiante que refiere', width: 220 },
            { dataField: 'CARRERA_REFIERE', caption: 'Carrera del estudiante', width: 260 },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_PROSPECTO_MEDIO',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    // Qué hace: formulario de un medio (reemplaza a la grilla mientras se edita).
    // Cómo lo hace: el medio es lookup (template) y su obligatoriedad se revisa en validar(). Los campos
    //               propios aparecen según el medio: "Otro" pide el detalle y "Referido amigo/familiar"
    //               pide el nombre y la carrera de quien refiere, igual que el portal.
    getItems(codigoMedio = ''): any {
        const esOtro = codigoMedio === MEDIO_OTRO;
        const esReferido = codigoMedio === MEDIO_REFERIDO;
        return [
            // Los anchos de cada fila suman 8 columnas: con más, el dx-form parte la fila y los
            // controles quedan apretados (la carrera necesita espacio, los nombres son largos).
            { dataField: 'CORR_MEDIO_ORIGEN', label: { text: 'Medio' }, colSpan: 2, template: 'CORR_MEDIO_ORIGENLookup' },
            {
                dataField: 'DESCRIPCION',
                label: { text: 'Especifique el otro medio' },
                colSpan: 6,
                editorOptions: { maxLength: 1000 },
                visible: esOtro,
                validationRules: esOtro ? [{ type: 'required', message: 'Indique a qué otro medio se refiere' }] : undefined,
            },
            {
                dataField: 'ESTUDIANTE_REFIERE',
                label: { text: 'Estudiante que lo refiere' },
                colSpan: 3,
                editorOptions: { maxLength: 200 },
                visible: esReferido,
                validationRules: esReferido ? [{ type: 'required', message: 'Indique el nombre del estudiante que lo refiere' }] : undefined,
            },
            {
                dataField: 'CORR_CARRERA_REFIERE',
                label: { text: 'Carrera del estudiante' },
                colSpan: 3,
                template: 'CORR_CARRERA_REFIERELookup',
                visible: esReferido,
            },
        ];
    }

    // Qué hace: reglas que el dx-form no cubre (los catálogos se pintan con template).
    // Cómo lo hace: medio obligatorio, sin repetirlo (la tabla tiene índice único por persona y medio),
    //               y la carrera cuando el medio es "Referido amigo/familiar".
    validar(model: any, otros: any[], codigoMedio: string): string | null {
        if (!model?.CORR_MEDIO_ORIGEN) {
            return 'Seleccione el medio por el que conoció la universidad.';
        }
        if ((otros ?? []).some((m) => m.CORR_MEDIO_ORIGEN === model.CORR_MEDIO_ORIGEN)) {
            return 'El prospecto ya tiene registrado ese medio.';
        }
        if (codigoMedio === MEDIO_REFERIDO && !model?.CORR_CARRERA_REFIERE) {
            return 'Indique la carrera del estudiante que lo refiere.';
        }
        return null;
    }

    // Qué hace: columnas de ACA_PROSPECTO_MEDIO_ORIGEN que viajan al API.
    // Cómo lo hace: manda solo lo que ese medio usa; el API vuelve a limpiar el resto.
    getPayload(model: any): any {
        const esOtro = model.CODIGO_MEDIO === MEDIO_OTRO;
        const esReferido = model.CODIGO_MEDIO === MEDIO_REFERIDO;
        return {
            CORR_PROSPECTO_MEDIO: model.CORR_PROSPECTO_MEDIO ?? 0,
            CORR_PROSPECTO_PERSONA: model.CORR_PROSPECTO_PERSONA,
            CORR_MEDIO_ORIGEN: model.CORR_MEDIO_ORIGEN,
            DESCRIPCION: esOtro ? model.DESCRIPCION : null,
            ESTUDIANTE_REFIERE: esReferido ? model.ESTUDIANTE_REFIERE : null,
            CORR_CARRERA_REFIERE: esReferido ? model.CORR_CARRERA_REFIERE : null,
        };
    }
}
