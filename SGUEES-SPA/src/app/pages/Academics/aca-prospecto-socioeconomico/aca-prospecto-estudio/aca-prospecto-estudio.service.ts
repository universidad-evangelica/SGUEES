import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoEstudioRepository } from './aca-prospecto-estudio.repository';

// Qué hace: secciones de estudios que maneja el prospecto (las mismas que arma la vista).
// Cómo lo hace: el portal guarda como máximo una fila por sección (índice único por persona,
//               nivel y graduado UEES), así que cada sección es un formulario, no una grilla.
export const SECCION_MEDIA = 'MEDIA';
export const SECCION_UNIVERSIDAD = 'UNIVERSIDAD';
export const SECCION_GRADUADO_UEES = 'GRADUADO_UEES';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoEstudioService {
    constructor(private repo: AcaProspectoEstudioRepository) {}

    // Qué hace: estudios previos del prospecto (pestaña Información académica).
    // Cómo lo hace: la API los devuelve ordenados por sección (media, universidad, graduado UEES).
    getEstudiosPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    // Qué hace: modelo vacío de una sección, listo para crearse al guardar.
    // Cómo lo hace: fija el nivel y la bandera de graduado UEES, que son los que definen la sección;
    //               el graduado UEES siempre es de la institución UEES y cuenta como graduado.
    getModeloNuevo(seccion: string, persona: any): any {
        const esUees = seccion === SECCION_GRADUADO_UEES;
        return {
            CORR_PROSPECTO_ESTUDIO: 0,
            CORR_PROSPECTO_PERSONA: persona?.CORR_PROSPECTO_PERSONA ?? 0,
            CORR_PROSPECTO: persona?.CORR_PROSPECTO ?? 0,
            SECCION: seccion,
            NIVEL_ESTUDIO: seccion === SECCION_MEDIA ? 'MEDIO' : 'SUPERIOR',
            GRADUADO_UEES: esUees,
            GRADUADO: seccion !== SECCION_UNIVERSIDAD,
            NOMBRE_INSTITUCION: esUees ? 'UEES' : '',
            TIPO_EDUCACION: null,
            TITULO_OBTENIDO: '',
            CARRERA_TEXTO: '',
            NIVEL_CURSADO: '',
            CORR_CARRERA: null,
            ANIO_TITULACION: null,
            FECHA_GRADUACION: null,
            CUOTA: null,
            CORR_PAIS: null,
            CORR_DEPTO: null,
        };
    }

    insert(model: any): Observable<IResult> {
        return this.repo.create(this.getPayload(model));
    }

    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_ESTUDIO', Value: model.CORR_PROSPECTO_ESTUDIO }];
        return this.repo.update(this.getPayload(model), xWhere);
    }

    delete(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_ESTUDIO', Value: model.CORR_PROSPECTO_ESTUDIO }];
        return this.repo.delete(xWhere);
    }

    // Qué hace: formulario "Educación media (bachillerato)".
    // Cómo lo hace: mismos campos y obligatoriedades del portal; país y departamento son lookups
    //               (template), así que su obligatoriedad se revisa en validar().
    getItemsMedia(): any {
        return [
            {
                dataField: 'NOMBRE_INSTITUCION',
                label: { text: 'Nombre de la institución' },
                colSpan: 4,
                editorOptions: { maxLength: 100 },
                validationRules: [{ type: 'required', message: 'Ingrese la institución' }],
            },
            {
                dataField: 'TIPO_EDUCACION',
                label: { text: 'Tipo de educación' },
                colSpan: 2,
                editorType: 'dxSelectBox',
                editorOptions: { items: this.getTiposEducacion(), showClearButton: true },
                validationRules: [{ type: 'required', message: 'Seleccione el tipo de educación' }],
            },
            { dataField: 'CORR_PAIS', label: { text: 'País' }, colSpan: 2, template: 'CORR_PAIS_ESTUDIOLookup' },
            { dataField: 'CORR_DEPTO', label: { text: 'Departamento' }, colSpan: 2, template: 'CORR_DEPTO_ESTUDIOLookup' },
            {
                dataField: 'TITULO_OBTENIDO',
                label: { text: 'Título obtenido' },
                colSpan: 4,
                editorOptions: { maxLength: 200 },
                validationRules: [{ type: 'required', message: 'Ingrese el título obtenido' }],
            },
            {
                dataField: 'ANIO_TITULACION',
                label: { text: 'Año de titulación' },
                colSpan: 2,
                editorType: 'dxNumberBox',
                editorOptions: { format: '#', min: 1900, max: new Date().getFullYear(), showClearButton: true },
                validationRules: [{ type: 'required', message: 'Indique el año de titulación' }],
            },
            {
                dataField: 'CUOTA',
                label: { text: 'Cuota ($)' },
                colSpan: 2,
                editorType: 'dxNumberBox',
                editorOptions: { format: '#,##0.00', min: 0, showClearButton: true },
            },
            // El NIE se pregunta aquí, igual que en el portal, aunque la columna sea de la persona:
            // por eso va como template (lo edita el componente sobre personaModel), no como dataField.
            {
                name: 'NIE_PERSONA',
                label: { text: 'NIE' },
                colSpan: 2,
                template: 'NIE_PERSONATemplate',
                helpText: 'Número de identificación del estudiante',
            },
        ];
    }

    // Qué hace: formulario "Estudios universitarios" (universidad de procedencia, distinta de la UEES).
    // Cómo lo hace: replica la regla del portal: los datos solo se llenan si el ingreso no es nuevo
    //               ingreso o si el prospecto es graduado universitario; si no, quedan bloqueados y
    //               sin exigencias (el portal guarda la fila con la institución vacía). El título y la
    //               cuota se exigen cuando está graduado. "¿Se graduó?" siempre se puede cambiar:
    //               es parte de la condición que habilita el resto.
    getItemsUniversidad(graduado = false, habilitado = true): any {
        const requerido = (mensaje: string) => (habilitado ? [{ type: 'required', message: mensaje }] : undefined);
        return [
            {
                dataField: 'GRADUADO',
                label: { text: '¿Es graduado universitario?' },
                colSpan: 2,
                editorType: 'dxCheckBox',
            },
            {
                dataField: 'NOMBRE_INSTITUCION',
                label: { text: 'Universidad de procedencia' },
                colSpan: 4,
                editorOptions: { maxLength: 100, readOnly: !habilitado },
                validationRules: requerido('Ingrese la universidad de procedencia'),
            },
            {
                dataField: 'CARRERA_TEXTO',
                label: { text: 'Carrera' },
                colSpan: 2,
                editorOptions: { maxLength: 100, readOnly: !habilitado },
            },
            {
                dataField: 'NIVEL_CURSADO',
                label: { text: 'Nivel cursado' },
                colSpan: 2,
                editorOptions: { maxLength: 10, readOnly: !habilitado },
                validationRules: requerido('Indique el nivel cursado'),
            },
            {
                dataField: 'TITULO_OBTENIDO',
                label: { text: 'Título obtenido' },
                colSpan: 4,
                editorOptions: { maxLength: 200, readOnly: !habilitado },
                validationRules: habilitado && graduado ? [{ type: 'required', message: 'Ingrese el título obtenido' }] : undefined,
            },
            {
                dataField: 'CUOTA',
                label: { text: 'Cuota ($)' },
                colSpan: 2,
                editorType: 'dxNumberBox',
                editorOptions: { format: '#,##0.00', min: 0, showClearButton: true, readOnly: !habilitado },
                validationRules: habilitado && graduado ? [{ type: 'required', message: 'Indique la cuota' }] : undefined,
            },
        ];
    }

    // Qué hace: dice si se pueden llenar los datos de la universidad de procedencia.
    // Cómo lo hace: misma condición del portal (universityGraduated = 'N' y typeAdmission = 'NI' los
    //               deshabilita): se habilitan si el ingreso no es nuevo ingreso o si es graduado.
    universidadHabilitada(formaIngreso: string, graduado: boolean): boolean {
        return (formaIngreso ?? '') !== 'NI' || graduado === true;
    }

    // Qué hace: formulario "Graduado UEES" (lo mismo que pide el portal: carrera y fecha).
    // Cómo lo hace: el grado académico no se muestra ni se captura; el API lo deriva de la carrera.
    getItemsUees(): any {
        return [
            { dataField: 'CORR_CARRERA', label: { text: 'Carrera' }, colSpan: 4, template: 'CORR_CARRERA_ESTUDIOLookup' },
            {
                dataField: 'FECHA_GRADUACION',
                label: { text: 'Fecha de graduación' },
                colSpan: 2,
                editorType: 'dxDateBox',
                editorOptions: { type: 'date', displayFormat: 'dd/MM/yyyy', dateSerializationFormat: 'yyyy-MM-dd' },
                validationRules: [{ type: 'required', message: 'Indique la fecha de graduación' }],
            },
        ];
    }

    // Qué hace: valores de "Tipo de educación".
    // Cómo lo hace: no es catálogo de base de datos; el portal los tiene fijos en su procedimiento.
    getTiposEducacion(): string[] {
        return ['Pública', 'Privada'];
    }

    // Qué hace: obligatoriedades que el dx-form no puede validar (los catálogos se pintan con template).
    // Cómo lo hace: devuelve el mensaje a mostrar o null si la sección está completa.
    validar(model: any): string | null {
        if (model?.SECCION === SECCION_MEDIA) {
            if (!model?.CORR_PAIS) {
                return 'Seleccione el país de la institución de educación media.';
            }
            if (!model?.CORR_DEPTO) {
                return 'Seleccione el departamento de la institución de educación media.';
            }
            return null;
        }
        if (model?.SECCION === SECCION_GRADUADO_UEES && !model?.CORR_CARRERA) {
            return 'Seleccione la carrera con la que se graduó en la UEES.';
        }
        return null;
    }

    // Qué hace: columnas de ACA_PROSPECTO_ESTUDIO que viajan al API.
    // Cómo lo hace: manda solo lo que tiene sentido en cada sección; el API vuelve a limpiar el resto
    //               y deriva el grado académico cuando es graduado UEES. Es público porque el
    //               componente lo usa además para saber si la sección cambió.
    getPayload(model: any): any {
        const esMedia = model.SECCION === SECCION_MEDIA;
        const esUees = model.SECCION === SECCION_GRADUADO_UEES;
        return {
            CORR_PROSPECTO_ESTUDIO: model.CORR_PROSPECTO_ESTUDIO ?? 0,
            CORR_PROSPECTO_PERSONA: model.CORR_PROSPECTO_PERSONA,
            NIVEL_ESTUDIO: esMedia ? 'MEDIO' : 'SUPERIOR',
            GRADUADO_UEES: esUees,
            GRADUADO: esUees || esMedia ? true : model.GRADUADO === true,
            // La columna es NOT NULL: el portal guarda vacío cuando el bloque no aplica.
            NOMBRE_INSTITUCION: esUees ? 'UEES' : model.NOMBRE_INSTITUCION ?? '',
            TIPO_EDUCACION: esMedia ? model.TIPO_EDUCACION : null,
            TITULO_OBTENIDO: esUees ? null : model.TITULO_OBTENIDO,
            CARRERA_TEXTO: esMedia || esUees ? null : model.CARRERA_TEXTO,
            NIVEL_CURSADO: esMedia || esUees ? null : model.NIVEL_CURSADO,
            CORR_CARRERA: esUees ? model.CORR_CARRERA : null,
            ANIO_TITULACION: esMedia ? model.ANIO_TITULACION : null,
            FECHA_GRADUACION: esUees ? model.FECHA_GRADUACION : null,
            CUOTA: esUees ? null : model.CUOTA,
            QUIEN_PAGO_CUOTA: model.QUIEN_PAGO_CUOTA,
            CORR_PAIS: esMedia ? model.CORR_PAIS : null,
            CORR_DEPTO: esMedia ? model.CORR_DEPTO : null,
            CORR_MUNICIPIO: null,
        };
    }
}
