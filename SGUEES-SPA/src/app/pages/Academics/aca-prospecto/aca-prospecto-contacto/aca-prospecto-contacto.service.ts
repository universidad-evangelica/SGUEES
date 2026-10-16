import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoContactoRepository } from './aca-prospecto-contacto.repository';

// Qué hace: tipos de contacto que maneja la pantalla.
// Cómo lo hace: la tabla no usa catálogo, expresa el tipo con los bits ES_TELEFONO / ES_CORREO;
//               el formulario los presenta como un solo campo TIPO y el payload los traduce.
export const TIPO_TELEFONO = 'TELEFONO';
export const TIPO_CORREO = 'CORREO';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoContactoService {
    constructor(private repo: AcaProspectoContactoRepository) {}

    // Qué hace: correos y teléfonos del prospecto (grilla "Contacto").
    getContactosPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    // Qué hace: modelo vacío para agregar un contacto.
    getModeloNuevo(persona: any): any {
        return this.normalizar({
            CORR_PROSPECTO_CONTACTO: 0,
            CORR_PROSPECTO_PERSONA: persona?.CORR_PROSPECTO_PERSONA ?? 0,
            CORR_PROSPECTO: persona?.CORR_PROSPECTO ?? 0,
            CONTACTO: '',
            ES_TELEFONO: true,
            ES_CORREO: false,
            ES_PRINCIPAL: false,
            ES_TRABAJO: false,
        });
    }

    // Qué hace: mantiene coherentes el campo TIPO (formulario), los bits (tabla) y el texto (grilla),
    //           y reparte un teléfono guardado en código de país + número.
    // Cómo lo hace: al cargar de la base TIPO no existe y se deduce de los bits; después manda TIPO,
    //               que es lo que el usuario elige, y los bits y el texto se derivan de él. El teléfono
    //               se guarda como en el registro ("+503 76150644"): si empieza con "+código " se
    //               separa; si es un teléfono viejo sin código, el código queda vacío y se pedirá.
    normalizar(model: any): any {
        if (model.TIPO !== TIPO_CORREO && model.TIPO !== TIPO_TELEFONO) {
            model.TIPO = model.ES_CORREO === true ? TIPO_CORREO : TIPO_TELEFONO;
        }
        model.ES_CORREO = model.TIPO === TIPO_CORREO;
        model.ES_TELEFONO = !model.ES_CORREO;
        model.TIPO_CONTACTO = model.ES_CORREO ? 'Correo' : 'Teléfono';

        if (model.ES_TELEFONO) {
            if (model.CODIGO_PAIS === undefined) {
                this.separarTelefono(model, model.CONTACTO);
            }
            // CONTACTO es lo que se guarda y lo que muestra la grilla: se rearma desde las dos partes.
            model.CONTACTO = this.getTelefonoCompleto(model);
        }
        return model;
    }

    // Qué hace: cambia el tipo del contacto sin perder lo escrito.
    // Cómo lo hace: al pasar a correo, el texto del número se ofrece como correo; al pasar a teléfono,
    //               el texto se separa en código y número (si no trae código, queda para elegirlo).
    cambiarTipo(model: any, tipo: string): any {
        if (tipo === TIPO_CORREO) {
            model.TIPO = TIPO_CORREO;
            model.CONTACTO = ((model.NUMERO ?? '').trim() || (model.CONTACTO ?? '').trim());
        } else {
            model.TIPO = TIPO_TELEFONO;
            this.separarTelefono(model, model.CONTACTO);
        }
        return this.normalizar(model);
    }

    // Qué hace: arma el teléfono completo con el formato del registro ("+503 76150644").
    getTelefonoCompleto(model: any): string {
        const numero = (model?.NUMERO ?? '').trim();
        const codigo = (model?.CODIGO_PAIS ?? '').trim();
        return codigo ? `${codigo} ${numero}`.trim() : numero;
    }

    // Qué hace: separa un teléfono guardado en código de país y número.
    private separarTelefono(model: any, valor: string): void {
        const texto = (valor ?? '').trim();
        const partes = /^(\+[\d+]+)\s+(.*)$/.exec(texto);
        model.CODIGO_PAIS = partes ? partes[1] : null;
        model.NUMERO = partes ? partes[2].trim() : texto;
    }

    // Qué hace: lista de códigos de país para el combo, a partir del SP del registro.
    // Cómo lo hace: el valor es el primer token del nombre ("+503"), que es lo que el registro guarda
    //               (no CatalogCode, que en ese catálogo no siempre coincide con la marcación). Dos
    //               países con el mismo código (+1 Canadá / Estados Unidos) se muestran juntos, porque
    //               un teléfono guardado no puede distinguirlos.
    getCodigosPais(catalogo: any[]): { CODIGO: string; NOMBRE: string }[] {
        const porCodigo = new Map<string, string[]>();
        for (const item of catalogo ?? []) {
            const nombre: string = (item.CatalogName ?? '').trim();
            const codigo = nombre.split(' ')[0];
            if (!codigo.startsWith('+')) {
                continue;
            }
            const pais = nombre.substring(codigo.length).trim();
            porCodigo.set(codigo, [...(porCodigo.get(codigo) ?? []), pais]);
        }
        return Array.from(porCodigo.entries())
            .map(([codigo, paises]) => ({ CODIGO: codigo, NOMBRE: `${codigo} ${paises.join(' / ')}` }))
            .sort((a, b) => a.NOMBRE.substring(a.CODIGO.length).localeCompare(b.NOMBRE.substring(b.CODIGO.length), 'es'));
    }

    insert(model: any): Observable<IResult> {
        return this.repo.create(this.getPayload(model));
    }

    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_CONTACTO', Value: model.CORR_PROSPECTO_CONTACTO }];
        return this.repo.update(this.getPayload(model), xWhere);
    }

    delete(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_CONTACTO', Value: model.CORR_PROSPECTO_CONTACTO }];
        return this.repo.delete(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'TIPO_CONTACTO', caption: 'Tipo', width: 120 },
            { dataField: 'CONTACTO', caption: 'Contacto', width: 300 },
            {
                dataField: 'ES_PRINCIPAL',
                caption: 'Principal',
                width: 110,
                dataType: 'boolean',
                customizeText: (e: any) => (e.value ? 'Sí' : 'No'),
            },
            {
                dataField: 'ES_TRABAJO',
                caption: 'Trabajo',
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
                    column: 'CORR_PROSPECTO_CONTACTO',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    // Qué hace: formulario de un contacto (reemplaza a la grilla mientras se edita).
    // Cómo lo hace: el tipo siempre se puede corregir (un error de captura no debe dejar atrapado al
    //               usuario); el componente reacomoda al principal de cada tipo al aceptar. Un teléfono
    //               se captura como en el registro: código de país + número; un correo, en un solo campo.
    getItems(esPrincipalActual = false, esTelefono = true, codigosPais: any[] = []): any {
        return [
            {
                dataField: 'TIPO',
                label: { text: 'Tipo' },
                colSpan: 2,
                editorType: 'dxSelectBox',
                editorOptions: {
                    items: [
                        { valor: TIPO_TELEFONO, texto: 'Teléfono' },
                        { valor: TIPO_CORREO, texto: 'Correo' },
                    ],
                    valueExpr: 'valor',
                    displayExpr: 'texto',
                },
            },
            {
                dataField: 'CODIGO_PAIS',
                label: { text: 'Código de país' },
                colSpan: 2,
                editorType: 'dxSelectBox',
                editorOptions: {
                    items: codigosPais,
                    valueExpr: 'CODIGO',
                    displayExpr: 'NOMBRE',
                    searchEnabled: true,
                    searchExpr: 'NOMBRE',
                    showClearButton: true,
                    placeholder: 'Seleccionar',
                },
                visible: esTelefono,
                validationRules: esTelefono ? [{ type: 'required', message: 'Seleccione el código de país' }] : undefined,
            },
            {
                dataField: 'NUMERO',
                label: { text: 'Número' },
                colSpan: 2,
                editorOptions: { maxLength: 30 },
                visible: esTelefono,
                validationRules: esTelefono ? [{ type: 'required', message: 'Ingrese el número' }] : undefined,
            },
            {
                dataField: 'CONTACTO',
                label: { text: 'Correo' },
                colSpan: 4,
                editorOptions: { maxLength: 200 },
                visible: !esTelefono,
                validationRules: !esTelefono ? [{ type: 'required', message: 'Ingrese el correo' }] : undefined,
            },
            {
                dataField: 'ES_PRINCIPAL',
                label: { text: 'Principal de su tipo' },
                colSpan: 1,
                editorType: 'dxCheckBox',
                helpText: esPrincipalActual ? 'Es el principal: para quitarle la marca, marque otro' : undefined,
            },
            { dataField: 'ES_TRABAJO', label: { text: 'Del trabajo' }, colSpan: 1, editorType: 'dxCheckBox' },
        ];
    }

    // Qué hace: forma del dato según el tipo (misma regla que el API).
    // Cómo lo hace: correo = algo@algo.algo sin espacios; teléfono = código de país elegido y número
    //               con 7 a 12 dígitos (admite espacios, guiones y paréntesis), como en el registro.
    validar(model: any): string | null {
        if (model?.TIPO === TIPO_CORREO) {
            const valor = (model.CONTACTO ?? '').trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
                return 'El correo no tiene un formato válido (ejemplo: nombre@dominio.com).';
            }
            return null;
        }

        if (!(model?.CODIGO_PAIS ?? '').trim()) {
            return 'Seleccione el código de país del teléfono.';
        }
        const numero = (model?.NUMERO ?? '').trim();
        const digitos = numero.replace(/[^0-9]/g, '').length;
        if (!/^[0-9\s()-]+$/.test(numero) || digitos < 7 || digitos > 12) {
            return 'El número solo admite dígitos, espacios, guiones y paréntesis, con 7 a 12 dígitos.';
        }
        return null;
    }

    // Qué hace: columnas de ACA_PROSPECTO_CONTACTO que viajan al API.
    // Cómo lo hace: TIPO se traduce a los bits; es público porque el componente lo usa además para
    //               saber si el contacto cambió.
    getPayload(model: any): any {
        const esCorreo = model.TIPO === TIPO_CORREO;
        return {
            CORR_PROSPECTO_CONTACTO: model.CORR_PROSPECTO_CONTACTO ?? 0,
            CORR_PROSPECTO_PERSONA: model.CORR_PROSPECTO_PERSONA,
            CONTACTO: esCorreo ? (model.CONTACTO ?? '').trim() : this.getTelefonoCompleto(model),
            ES_TELEFONO: !esCorreo,
            ES_CORREO: esCorreo,
            ES_PRINCIPAL: model.ES_PRINCIPAL === true,
            ES_TRABAJO: model.ES_TRABAJO === true,
        };
    }
}
