import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoFamiliarRepository } from './aca-prospecto-familiar.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoFamiliarService {
    constructor(private repo: AcaProspectoFamiliarRepository) {}

    // Qué hace: familiares del prospecto (uno de ellos puede ser el contacto de emergencia).
    // Cómo lo hace: una sola consulta; el contacto de emergencia es la fila con ES_EMERGENCIA.
    getFamiliaresPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    // Qué hace: modelo vacío para agregar un familiar.
    getModeloNuevo(persona: any): any {
        return {
            CORR_PROSPECTO_FAMILIAR: 0,
            CORR_PROSPECTO_PERSONA: persona?.CORR_PROSPECTO_PERSONA ?? 0,
            CORR_PROSPECTO: persona?.CORR_PROSPECTO ?? 0,
            CORR_PARENTESCO: null,
            NOMBRE_PARENTESCO: '',
            NOMBRES: '',
            APELLIDO1: '',
            APELLIDO2: '',
            NOMBRE_COMPLETO: '',
            TRABAJA: false,
            PROFESION: '',
            OCUPACION: '',
            NOMBRE_EMPRESA: '',
            TELEFONO_TRABAJO: '',
            DIRECCION_TRABAJO: '',
            DIRECCION_CASA: '',
            TELEFONO: '',
            TELEFONO2: '',
            VIVE_CON_EL: false,
            FINANCIA_ESTUDIOS: false,
            ACTIVO: true,
            ES_EMERGENCIA: false,
            TELEFONO_EMERGENCIA: '',
            DIRECCION_EMERGENCIA: '',
        };
    }

    insert(model: any): Observable<IResult> {
        return this.repo.create(this.getPayload(model));
    }

    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_FAMILIAR', Value: model.CORR_PROSPECTO_FAMILIAR }];
        return this.repo.update(this.getPayload(model), xWhere);
    }

    delete(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_FAMILIAR', Value: model.CORR_PROSPECTO_FAMILIAR }];
        return this.repo.delete(xWhere);
    }

    // Qué hace: columnas de la grilla "Familia".
    getColumns(): any {
        return [
            { dataField: 'NOMBRE_PARENTESCO', caption: 'Parentesco', width: 120 },
            { dataField: 'NOMBRE_COMPLETO', caption: 'Nombre', width: 240 },
            { dataField: 'PROFESION', caption: 'Profesión', width: 140 },
            { dataField: 'NOMBRE_EMPRESA', caption: 'Lugar de trabajo', width: 160 },
            { dataField: 'TELEFONO', caption: 'Teléfono', width: 110 },
            { dataField: 'DIRECCION_CASA', caption: 'Dirección', width: 220 },
            {
                dataField: 'ES_EMERGENCIA',
                caption: 'Emergencia',
                width: 110,
                dataType: 'boolean',
                customizeText: (e: any) => (e.value ? 'Sí' : 'No'),
            },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_PROSPECTO_FAMILIAR',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    // Qué hace: formulario de un familiar (reemplaza a la grilla mientras se edita).
    // Cómo lo hace: el parentesco es lookup (template) y por eso se valida en validar(). El teléfono y
    //               la dirección de emergencia no están aquí: se llenan en la sección "Contacto de
    //               emergencia", sobre el familiar que quede marcado.
    //               permiteEmergencia = false oculta la marca de emergencia: solo se admite un
    //               contacto de emergencia, así que mientras otro la tenga, aquí no se ofrece.
    //               trabaja = false esconde los datos laborales (no aplican si no trabaja).
    getItems(permiteEmergencia = true, trabaja = false): any {
        return [
            { itemType: 'group', caption: 'Identificación', colSpan: 8, colCount: 8, items: [
                { dataField: 'CORR_PARENTESCO', label: { text: 'Parentesco' }, colSpan: 2, template: 'CORR_PARENTESCOLookup' },
                {
                    dataField: 'NOMBRES',
                    label: { text: 'Nombres' },
                    colSpan: 3,
                    editorOptions: { maxLength: 200 },
                    validationRules: [{ type: 'required', message: 'Ingrese el nombre del familiar' }],
                },
                { dataField: 'APELLIDO1', label: { text: 'Primer apellido' }, colSpan: 3, editorOptions: { maxLength: 200 } },
                { dataField: 'APELLIDO2', label: { text: 'Segundo apellido' }, colSpan: 3, editorOptions: { maxLength: 200 } },
                { dataField: 'TELEFONO', label: { text: 'Teléfono' }, colSpan: 2, editorOptions: { maxLength: 20 } },
                { dataField: 'TELEFONO2', label: { text: 'Otro teléfono' }, colSpan: 2, editorOptions: { maxLength: 20 } },
                { dataField: 'DIRECCION_CASA', label: { text: 'Dirección de casa' }, colSpan: 8, editorOptions: { maxLength: 300 } },
            ] },
            { itemType: 'group', caption: 'Trabajo', colSpan: 8, colCount: 8, items: [
                { dataField: 'TRABAJA', label: { text: 'Trabaja' }, colSpan: 2, editorType: 'dxCheckBox' },
                { dataField: 'PROFESION', label: { text: 'Profesión' }, colSpan: 3, editorOptions: { maxLength: 100 }, visible: trabaja },
                { dataField: 'OCUPACION', label: { text: 'Ocupación' }, colSpan: 3, editorOptions: { maxLength: 100 }, visible: trabaja },
                { dataField: 'NOMBRE_EMPRESA', label: { text: 'Lugar de trabajo' }, colSpan: 3, editorOptions: { maxLength: 100 }, visible: trabaja },
                { dataField: 'TELEFONO_TRABAJO', label: { text: 'Teléfono del trabajo' }, colSpan: 2, editorOptions: { maxLength: 20 }, visible: trabaja },
                { dataField: 'DIRECCION_TRABAJO', label: { text: 'Dirección del trabajo' }, colSpan: 8, editorOptions: { maxLength: 300 }, visible: trabaja },
            ] },
            { itemType: 'group', caption: 'Relación con el prospecto', colSpan: 8, colCount: 8, items: [
                { dataField: 'VIVE_CON_EL', label: { text: 'Vive con el prospecto' }, colSpan: 2, editorType: 'dxCheckBox' },
                { dataField: 'FINANCIA_ESTUDIOS', label: { text: 'Financia sus estudios' }, colSpan: 2, editorType: 'dxCheckBox' },
                {
                    dataField: 'ES_EMERGENCIA',
                    label: { text: 'Es el contacto de emergencia' },
                    colSpan: 3,
                    editorType: 'dxCheckBox',
                    visible: permiteEmergencia,
                },
            ] },
        ];
    }

    // Qué hace: formulario de la sección "Contacto de emergencia".
    // Cómo lo hace: solo los dos datos propios de la emergencia; el nombre y el parentesco se muestran
    //               aparte porque salen del familiar marcado en la grilla.
    getItemsEmergencia(): any {
        return [
            { dataField: 'TELEFONO_EMERGENCIA', label: { text: 'Teléfono de emergencia' }, colSpan: 3, editorOptions: { maxLength: 20 } },
            { dataField: 'DIRECCION_EMERGENCIA', label: { text: 'Dirección de emergencia' }, colSpan: 5, editorOptions: { maxLength: 300 } },
        ];
    }

    // Qué hace: obligatoriedades que el dx-form no puede validar (el parentesco es lookup con template).
    validar(model: any): string | null {
        if (!model?.CORR_PARENTESCO) {
            return 'Seleccione el parentesco del familiar.';
        }
        return null;
    }

    // Qué hace: nombre completo para mostrarlo en la grilla sin esperar a que el API lo recalcule.
    getNombreCompleto(model: any): string {
        return [model?.NOMBRES, model?.APELLIDO1, model?.APELLIDO2]
            .map((parte) => (parte ?? '').trim())
            .filter((parte) => parte.length)
            .join(' ');
    }

    // Qué hace: columnas de ACA_PROSPECTO_FAMILIAR que viajan al API.
    // Cómo lo hace: es público porque el componente lo usa además para saber si el familiar cambió.
    getPayload(model: any): any {
        const esEmergencia = model.ES_EMERGENCIA === true;
        return {
            CORR_PROSPECTO_FAMILIAR: model.CORR_PROSPECTO_FAMILIAR ?? 0,
            CORR_PROSPECTO_PERSONA: model.CORR_PROSPECTO_PERSONA,
            CORR_PARENTESCO: model.CORR_PARENTESCO,
            NOMBRES: model.NOMBRES,
            APELLIDO1: model.APELLIDO1,
            APELLIDO2: model.APELLIDO2,
            TRABAJA: model.TRABAJA === true,
            PROFESION: model.PROFESION,
            OCUPACION: model.OCUPACION,
            NOMBRE_EMPRESA: model.NOMBRE_EMPRESA,
            TELEFONO_TRABAJO: model.TELEFONO_TRABAJO,
            DIRECCION_TRABAJO: model.DIRECCION_TRABAJO,
            DIRECCION_CASA: model.DIRECCION_CASA,
            TELEFONO: model.TELEFONO,
            TELEFONO2: model.TELEFONO2,
            VIVE_CON_EL: model.VIVE_CON_EL === true,
            FINANCIA_ESTUDIOS: model.FINANCIA_ESTUDIOS === true,
            ACTIVO: true,
            ES_EMERGENCIA: esEmergencia,
            TELEFONO_EMERGENCIA: esEmergencia ? model.TELEFONO_EMERGENCIA : null,
            DIRECCION_EMERGENCIA: esEmergencia ? model.DIRECCION_EMERGENCIA : null,
        };
    }
}
