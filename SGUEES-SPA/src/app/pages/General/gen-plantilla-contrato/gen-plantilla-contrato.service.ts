// Qué hace: lógica de negocio y configuración de grilla/formulario para plantillas de contrato.
// Cómo lo hace: valida datos obligatorios, coordina el CRUD con GenPlantillaContratoRepository y define columnas e items.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import {
	ActivarVersionPlantillaRequest,
	ActualizarVersionPlantillaRequest,
	CrearVersionPlantillaRequest,
	GenPlantillaContrato,
} from './models/gen-plantilla-contrato';
import { GenPlantillaContratoRepository } from './gen-plantilla-contrato.repository';

@Injectable({ providedIn: 'root' })
// Qué hace: servicio del módulo Plantillas de Contratos.
// Cómo lo hace: expone validación, operaciones CRUD y definición de columnas/formulario DevExtreme.
export class GenPlantillaContratoService {
	constructor(private repo: GenPlantillaContratoRepository) {}

	// Qué hace: valida los campos obligatorios antes de guardar la plantilla.
	// Cómo lo hace: verifica nombre no vacío (máximo 200 caracteres) y tipo de contrato válido mayor a cero.
	esValido(model: GenPlantillaContrato, msg: Function): boolean {
		const corrTipoContratacion = Number(model?.CORR_TIPO_CONTRATACION);
		if (Number.isNaN(corrTipoContratacion) || corrTipoContratacion <= 0) {
			msg('Debe seleccionar el tipo de contrato.', NotifyType.Warning);
			return false;
		}

		if (!model?.NOMBRE_PLANTILLA || model.NOMBRE_PLANTILLA.trim() === '') {
			msg('Debe ingresar el nombre de la plantilla.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_PLANTILLA.trim().length > 200) {
			msg('El nombre de la plantilla no puede superar 200 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	// Qué hace: consulta el listado completo de plantillas de contrato.
	// Cómo lo hace: transforma los filtros con buildWhere y llama a getAll del repositorio.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Qué hace: consulta una plantilla de contrato por su correlativo.
	// Cómo lo hace: llama a get del repositorio enviando CORR_PLANTILLA_CONTRATO.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_PLANTILLA_CONTRATO', Value: param.CORR_PLANTILLA_CONTRATO }]);
	}

	// Qué hace: inserta una nueva plantilla de contrato.
	// Cómo lo hace: delega el registro al método create del repositorio.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: actualiza una plantilla de contrato existente.
	// Cómo lo hace: llama a update del repositorio enviando modelo y llave CORR_PLANTILLA_CONTRATO.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [
			{ Parameter: 'CORR_PLANTILLA_CONTRATO', Value: model.CORR_PLANTILLA_CONTRATO },
		]);
	}

	// Qué hace: elimina una plantilla de contrato seleccionada.
	// Cómo lo hace: llama a delete del repositorio enviando CORR_PLANTILLA_CONTRATO.
	delete(param: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_PLANTILLA_CONTRATO', Value: param.CORR_PLANTILLA_CONTRATO }]);
	}

	// Qué hace: obtiene los parámetros disponibles agrupados para redactar el contrato.
	// Cómo lo hace: delega la consulta en getParametrosDisponibles del repositorio.
	getParametrosDisponibles(): Observable<IResult> {
		return this.repo.getParametrosDisponibles();
	}

	// Qué hace: obtiene el historial ordenado de versiones de una plantilla de contrato.
	// Cómo lo hace: envía CORR_PLANTILLA_CONTRATO a getVersiones del repositorio.
	getVersiones(corrPlantillaContrato: number): Observable<IResult> {
		return this.repo.getVersiones([{ Parameter: 'CORR_PLANTILLA_CONTRATO', Value: corrPlantillaContrato }]);
	}

	// Qué hace: registra una nueva versión v2+ basada en v1 y la establece como activa.
	// Cómo lo hace: envía el payload tipado a crearVersion del repositorio.
	crearVersion(model: CrearVersionPlantillaRequest): Observable<IResult> {
		return this.repo.crearVersion(model);
	}

	// Qué hace: actualiza el contenido HTML de la versión activa v2+.
	// Cómo lo hace: envía el payload tipado a actualizarVersion del repositorio.
	actualizarVersion(model: ActualizarVersionPlantillaRequest): Observable<IResult> {
		return this.repo.actualizarVersion(model);
	}

	// Qué hace: activa una versión histórica elegible (v2+) como vigente.
	// Cómo lo hace: envía plantilla y versión a activarVersion del repositorio.
	activarVersion(model: ActivarVersionPlantillaRequest): Observable<IResult> {
		return this.repo.activarVersion(model);
	}

	// Qué hace: obtiene los eventos registrados en la bitácora de la plantilla.
	// Cómo lo hace: envía CORR_PLANTILLA_CONTRATO a getBitacora del repositorio.
	getBitacora(corrPlantillaContrato: number): Observable<IResult> {
		return this.repo.getBitacora([{ Parameter: 'CORR_PLANTILLA_CONTRATO', Value: corrPlantillaContrato }]);
	}

	// Qué hace: normaliza nombres cortos legados ('v1') al formato completo ('Versión 1').
	// Cómo lo hace: reemplaza el prefijo corto vN por 'Versión N' o construye el texto a partir de NUMERO_VERSION.
	formatearNombreVersion(nombre?: string | null, numero?: number | null): string {
		const texto = `${nombre ?? ''}`.trim();
		if (texto) {
			return texto.replace(/^v\s*(\d+)$/i, 'Versión $1');
		}
		return Number(numero ?? 0) > 0 ? `Versión ${numero}` : '';
	}

	// Qué hace: define las columnas visibles en la grilla principal.
	// Cómo lo hace: incluye correlativo, nombre, tipo, estado calculado (Borrador/Activa), versión activa y auditoría con anchos fijos.
	getColumns(): any {
		return [
			{
				dataField: 'CORR_PLANTILLA_CONTRATO',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_PLANTILLA', caption: 'Nombre de Plantilla', width: 300, minWidth: 200 },
			{ dataField: 'NOMBRE_TIPO_CONTRATACION', caption: 'Tipo de Contrato', width: 240, minWidth: 180 },
			{
				dataField: 'CORR_VERSION_ACTIVA',
				caption: 'Estado',
				width: 130,
				alignment: 'center',
				dataType: 'string',
				allowFiltering: true,
				allowHeaderFiltering: true,
				calculateCellValue: (rowData: any) =>
					Number(rowData?.CORR_VERSION_ACTIVA ?? 0) > 0 ? 'Activa' : 'Borrador',
				cellTemplate: (cellElement: HTMLElement, cellInfo: { data?: any }) => {
					const esActiva = Number(cellInfo?.data?.CORR_VERSION_ACTIVA ?? 0) > 0;
					const badge = document.createElement('span');
					badge.classList.add('estado-badge', esActiva ? 'estado-badge--activo' : 'estado-badge--borrador');
					badge.textContent = esActiva ? 'Activa' : 'Borrador';
					cellElement.innerHTML = '';
					cellElement.appendChild(badge);
				},
			},
			{
				dataField: 'NOMBRE_VERSION_ACTIVA',
				caption: 'Versión Activa',
				width: 170,
				minWidth: 160,
				alignment: 'center',
				calculateCellValue: (rowData: any) =>
					rowData?.NOMBRE_VERSION_ACTIVA
						? this.formatearNombreVersion(rowData.NOMBRE_VERSION_ACTIVA, rowData.NUMERO_VERSION_ACTIVA)
						: 'Sin versión',
			},
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Qué hace: define las columnas de solo lectura de la tabla Bitácora.
	// Cómo lo hace: configura fecha, usuario, estación oculta, versión, acción y detalle con anchos fijos para scroll horizontal.
	getBitacoraColumns(): any[] {
		return [
			{ dataField: 'FECHA_ACCION', caption: 'Fecha', width: 165, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario', width: 140 },
			{ dataField: 'ESTACION_CREA', caption: 'Estación', width: 155, visible: false },
			{
				dataField: 'NOMBRE_VERSION',
				caption: 'Versión',
				width: 115,
				alignment: 'center',
				calculateCellValue: (rowData: any) =>
					rowData?.NOMBRE_VERSION ? this.formatearNombreVersion(rowData.NOMBRE_VERSION) : '',
			},
			{ dataField: 'TIPO_EVENTO', caption: 'Acción', width: 195 },
			{ dataField: 'DETALLE', caption: 'Detalle', width: 440, minWidth: 280 },
		];
	}

	// Qué hace: define el resumen de conteo total en el pie de la grilla.
	// Cómo lo hace: configura count sobre CORR_PLANTILLA_CONTRATO.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_PLANTILLA_CONTRATO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	// Qué hace: configura los campos del formulario de mantenimiento.
	// Cómo lo hace: arma correlativo solo lectura, lookup de tipo de contrato y caja de texto de nombre.
	getItems(): any {
		return [
			{
				dataField: 'CORR_PLANTILLA_CONTRATO',
				label: { text: 'Corr.' },
				colSpan: 1,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'CORR_TIPO_CONTRATACION',
				label: { text: 'Tipo de Contrato' },
				colSpan: 3,
				editorOptions: { placeholder: 'Seleccione tipo de contrato...', showClearButton: false },
				template: 'CORR_TIPO_CONTRATACIONLookup',
				validationRules: [
					{
						type: 'custom',
						message: 'Este campo es obligatorio',
						reevaluate: true,
						validationCallback: (e: { value: unknown }) => {
							const value = Number(e.value);
							return !Number.isNaN(value) && value > 0;
						},
					},
				],
			},
			{
				dataField: 'NOMBRE_PLANTILLA',
				label: { text: 'Nombre' },
				colSpan: 4,
				editorOptions: { placeholder: 'Nombre de plantilla de contrato...', showClearButton: true, maxLength: 200 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
		];
	}

	// Qué hace: arma el arreglo de parámetros para consultas al API.
	// Cómo lo hace: incluye CORR_PLANTILLA_CONTRATO cuando se recibe un valor definido.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param?.CORR_PLANTILLA_CONTRATO) {
			xWhere.push({ Parameter: 'CORR_PLANTILLA_CONTRATO', Value: param.CORR_PLANTILLA_CONTRATO });
		}

		return xWhere;
	}
}

