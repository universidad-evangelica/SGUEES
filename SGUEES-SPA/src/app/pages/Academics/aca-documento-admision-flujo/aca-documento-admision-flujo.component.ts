// Qué hace: configura qué documentos de admisión se muestran en cada solicitud ACA_PROSPECTO.
// Cómo: el browse lista los tipos de flujo y el popup marca o quita documentos sin volver a consultar todo.
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { from, of } from 'rxjs';
import { catchError, concatMap, map, take, toArray } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { AcaDocumentoAdmisionFlujoService } from './aca-documento-admision-flujo.service';
import {
	AcaDocumentoAdmisionAsignacion,
	AcaDocumentoAdmisionItem,
	AcaDocumentoAdmisionSeleccion,
	AcaFlujoTipoProspecto,
} from './models/aca-documento-admision-flujo';

@Component({
	selector: 'app-aca-documento-admision-flujo',
	templateUrl: './aca-documento-admision-flujo.component.html',
	styleUrls: ['./aca-documento-admision-flujo.component.scss'],
})
export class AcaDocumentoAdmisionFlujoComponent extends CBaseComponent implements OnInit {
	@ViewChild('dataGrid', { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el documento de la solicitud';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 10;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_TIPO_DOCUMENTO';
	protected override mttoRemoteOperations = false;

	asignaciones: AcaDocumentoAdmisionAsignacion[] = [];
	documentos: AcaDocumentoAdmisionItem[] = [];
	documentosModal: AcaDocumentoAdmisionSeleccion[] = [];
	@ViewChild('popupDocumentos') popupDocumentos?: any;

	solicitudSeleccionada: AcaFlujoTipoProspecto | null = null;
	popupVisible = false;
	guardando = false;
	documentoModalPageSize = 10;

	private readonly maintenanceSubtitulo = 'Documentos por solicitud';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: AcaDocumentoAdmisionFlujoService,
		private cdr: ChangeDetectorRef
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
	}

	// Qué hace: arma el título del popup.
	// Cómo: agrega el nombre de la solicitud enfocada.
	get popupTitulo(): string {
		const nombre = (this.solicitudSeleccionada?.NOMBRE_TIPO ?? '').trim();
		return nombre ? `Mostrar documentos - ${nombre}` : 'Mostrar documentos';
	}

	// Qué hace: muestra el botón del ribbon en browse.
	// Cómo: el texto vacío oculta el botón fuera de la grilla.
	get textoBtnMostrarDocumentos(): string {
		return this.isBrowse() ? 'Mostrar documentos' : '';
	}

	// Qué hace: integra el grid con CBaseComponent.
	// Cómo: devuelve la referencia de DataGridMtto.
	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Qué hace: abre la vista en browse.
	// Cómo: carga solicitudes, asignaciones y el catálogo de documentos.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.AsignaStatus(UpdateType.Browse);
		this.consultar();
	}

	// Qué hace: conserva el subtítulo en browse.
	// Cómo: delega el estado base y repone el texto de mantenimiento.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	// Qué hace: normaliza una solicitud del browse.
	// Cómo: limpia el nombre y convierte el contador a número.
	override fillData(xModel?: AcaFlujoTipoProspecto): AcaFlujoTipoProspecto {
		if (xModel) {
			return {
				CORR_EMPRESA: Number(xModel.CORR_EMPRESA ?? 0),
				CORR_TIPO_DOCUMENTO: Number(xModel.CORR_TIPO_DOCUMENTO ?? 0),
				NOMBRE_TIPO: (xModel.NOMBRE_TIPO ?? '').trim(),
				DESCRIPCION: xModel.DESCRIPCION,
				CODIGO_OPCION: xModel.CODIGO_OPCION,
				ACTIVO: xModel.ACTIVO,
				CANT_DOCUMENTOS: Number(xModel.CANT_DOCUMENTOS ?? 0),
			};
		}
		return { CORR_EMPRESA: 0, CORR_TIPO_DOCUMENTO: 0, NOMBRE_TIPO: '', CANT_DOCUMENTOS: 0 };
	}

	// Qué hace: recarga la vista.
	// Cómo: vuelve a pedir solicitudes, marcas y documentos.
	consultar(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		this.cargarSolicitudes();
		this.cargarAsignaciones();
		this.cargarDocumentos();
	}

	// Qué hace: abre el popup de la solicitud enfocada.
	// Cómo: arma el catálogo con check en los documentos que ya tienen fila.
	onMostrarDocumentos(): void {
		const solicitud = this.obtenerSolicitudSeleccionada();
		if (!solicitud) {
			this.notifyFx('Debe seleccionar una solicitud.', NotifyType.Warning);
			return;
		}
		this.solicitudSeleccionada = this.fillData(solicitud);
		this.documentoModalPageSize = 10;
		this.documentosModal = this.armarDocumentosModal(solicitud.CORR_TIPO_DOCUMENTO);
		this.popupVisible = true;
		this.cdr.detectChanges();
	}

	// Qué hace: con 5 o 10 filas la tabla se encoge; con más, mantiene altura y scroll.
	// Cómo: deja espacio para el título, los botones y el paginador dentro de la pantalla.
	get alturaDocumentosModal(): string {
		return this.documentoModalPageSize <= 10 ? 'auto' : 'calc(100vh - 300px)';
	}

	// Qué hace: actualiza la altura cuando cambia el tamaño de página del popup.
	// Cómo: reaplica la altura en la grilla para que el paginador no quede fuera.
	onDocumentosModalOptionChanged(e: any): void {
		if (e?.fullName !== 'paging.pageSize' || !(Number(e.value) > 0)) {
			return;
		}
		this.documentoModalPageSize = Number(e.value);
		const altura = this.alturaDocumentosModal;
		setTimeout(() => {
			e.component?.option('height', altura);
			e.component?.updateDimensions?.();
			this.popupDocumentos?.instance?.repaint();
		});
	}

	// Qué hace: marca todos los documentos del popup.
	// Cómo: deja SELECCION en true sin guardar todavía.
	selectTodos(): void {
		this.documentosModal = this.documentosModal.map((item) => ({ ...item, SELECCION: true }));
		this.cdr.detectChanges();
	}

	// Qué hace: desmarca todos los documentos del popup.
	// Cómo: deja SELECCION en false; al guardar se eliminan las filas.
	selectNinguno(): void {
		this.documentosModal = this.documentosModal.map((item) => ({ ...item, SELECCION: false }));
		this.cdr.detectChanges();
	}

	// Qué hace: cierra el popup.
	// Cómo: lo mantiene abierto mientras se está guardando.
	cerrarPopup(): void {
		if (this.guardando) {
			this.popupVisible = true;
			return;
		}
		this.solicitudSeleccionada = null;
		this.documentosModal = [];
	}

	// Qué hace: guarda los checks de la solicitud.
	// Cómo: inserta los nuevos y elimina los que se quitaron, y parchea la grilla.
	guardarDocumentos(): void {
		if (!this.permiteEdit || this.guardando) {
			return;
		}
		const solicitud = this.solicitudSeleccionada;
		if (!solicitud?.CORR_TIPO_DOCUMENTO || !this.documentosModal.length) {
			this.notifyFx('No hay documentos para mostrar.', NotifyType.Warning);
			return;
		}
		const corrTipo = Number(solicitud.CORR_TIPO_DOCUMENTO);
		const actuales = new Set(
			this.asignaciones
				.filter((item) => Number(item.CORR_TIPO_DOCUMENTO) === corrTipo)
				.map((item) => Number(item.CORR_DOCUMENTO_ADMISION))
		);
		const aInsertar = this.documentosModal.filter(
			(item) => item.SELECCION && !actuales.has(Number(item.CORR_DOCUMENTO_ADMISION))
		);
		const aEliminar = this.documentosModal.filter(
			(item) => !item.SELECCION && actuales.has(Number(item.CORR_DOCUMENTO_ADMISION))
		);
		if (!aInsertar.length && !aEliminar.length) {
			this.notifyFx('Cambios guardados con éxito.', NotifyType.Success, { raw: true });
			this.popupVisible = false;
			this.cerrarPopup();
			return;
		}
		this.ejecutarCambios(corrTipo, aInsertar, aEliminar);
	}

	// Qué hace: carga las solicitudes del browse.
	// Cómo: lee GetAll y refresca la grilla.
	private cargarSolicitudes(): void {
		this.loadingVisible = true;
		this.service.getAll().pipe(take(1)).subscribe({
			next: (response: any) => {
				this.loadingVisible = false;
				this.models = response?.Result && Array.isArray(response.Data)
					? response.Data.map((item: AcaFlujoTipoProspecto) => this.fillData(item))
					: [];
				this.refrescarGridMtto(false);
			},
			error: (error) => {
				this.loadingVisible = false;
				this.models = [];
				this.notifyApiError(error);
			},
		});
	}

	// Qué hace: carga las marcas existentes.
	// Cómo: guarda la relación en memoria para pintar el check y el contador.
	private cargarAsignaciones(): void {
		this.service.getAsignaciones().pipe(take(1)).subscribe({
			next: (response: any) => {
				this.asignaciones = response?.Result && Array.isArray(response.Data)
					? response.Data.map((item: any) => this.mapAsignacion(item))
					: [];
				this.aplicarContadores();
			},
			error: (error) => {
				this.asignaciones = [];
				this.notifyApiError(error);
			},
		});
	}

	// Qué hace: carga el catálogo de documentos de admisión.
	// Cómo: lo deja en memoria para armar el popup.
	private cargarDocumentos(): void {
		this.service.getDocumentos().pipe(take(1)).subscribe({
			next: (response: any) => {
				this.documentos = response?.Result && Array.isArray(response.Data)
					? response.Data.map((item: any) => ({
							CORR_DOCUMENTO_ADMISION: Number(item.CORR_DOCUMENTO_ADMISION),
							CODIGO: (item.CODIGO ?? '').toString().trim(),
							NOMBRE_DOCUMENTO: (item.NOMBRE_DOCUMENTO ?? '').toString().trim(),
							ORDEN: Number(item.ORDEN ?? 0),
							OBLIGATORIO: item.OBLIGATORIO === true,
							ACTIVO: item.ACTIVO !== false,
					  }))
					: [];
			},
			error: (error) => {
				this.documentos = [];
				this.notifyApiError(error);
			},
		});
	}

	// Qué hace: toma la solicitud enfocada en la grilla.
	// Cómo: lee el modelo que deja focusedRowChanged.
	private obtenerSolicitudSeleccionada(): AcaFlujoTipoProspecto | null {
		const corr = Number(this.model?.CORR_TIPO_DOCUMENTO ?? 0);
		if (corr <= 0) {
			return null;
		}
		const encontrada = (this.models as AcaFlujoTipoProspecto[]).find(
			(item) => Number(item.CORR_TIPO_DOCUMENTO) === corr
		);
		return encontrada ?? this.fillData(this.model);
	}

	// Qué hace: arma las filas del popup.
	// Cómo: muestra los documentos activos y los ya marcados, con el check encendido.
	private armarDocumentosModal(corrTipo: number): AcaDocumentoAdmisionSeleccion[] {
		const marcados = new Set(
			this.asignaciones
				.filter((item) => Number(item.CORR_TIPO_DOCUMENTO) === Number(corrTipo))
				.map((item) => Number(item.CORR_DOCUMENTO_ADMISION))
		);
		return this.documentos
			.filter((item) => item.ACTIVO !== false || marcados.has(Number(item.CORR_DOCUMENTO_ADMISION)))
			.map((item) => ({
				...item,
				SELECCION: marcados.has(Number(item.CORR_DOCUMENTO_ADMISION)),
			}));
	}

	// Qué hace: persiste altas y bajas del popup.
	// Cómo: llama insert o delete uno a uno y parchea memoria con la respuesta.
	private ejecutarCambios(
		corrTipo: number,
		aInsertar: AcaDocumentoAdmisionSeleccion[],
		aEliminar: AcaDocumentoAdmisionSeleccion[]
	): void {
		const operaciones = [
			...aInsertar.map((documento) => ({ tipo: 'insert' as const, documento })),
			...aEliminar.map((documento) => ({ tipo: 'delete' as const, documento })),
		];
		this.guardando = true;
		this.loadingVisible = true;
		from(operaciones)
			.pipe(
				concatMap((op) => {
					const payload: AcaDocumentoAdmisionAsignacion = {
						CORR_EMPRESA: 0,
						CORR_TIPO_DOCUMENTO: corrTipo,
						CORR_DOCUMENTO_ADMISION: Number(op.documento.CORR_DOCUMENTO_ADMISION),
						CODIGO: op.documento.CODIGO,
						NOMBRE_DOCUMENTO: op.documento.NOMBRE_DOCUMENTO,
						ORDEN: op.documento.ORDEN,
					};
					const request$ = op.tipo === 'insert'
						? this.service.insert(payload)
						: this.service.delete(payload);
					return request$.pipe(
						take(1),
						catchError((error) => of({
							Result: false,
							ErrorMessage: error?.error?.ErrorMessage || error?.message || 'No se pudo actualizar el documento.',
							_tipo: op.tipo,
							_documento: op.documento,
						})),
						map((response: any) => ({
							...response,
							_tipo: op.tipo,
							_documento: op.documento,
						}))
					);
				}),
				toArray()
			)
			.subscribe({
				next: (responses: any[]) => {
					this.guardando = false;
					this.loadingVisible = false;
					const ok = responses.filter((item) => item?.Result);
					const fail = responses.filter((item) => !item?.Result);
					let insertOk = 0;
					let deleteOk = 0;
					for (const response of ok) {
						if (response._tipo === 'insert') {
							const mapped = this.mapAsignacion(response.Data ?? {
								CORR_TIPO_DOCUMENTO: corrTipo,
								CORR_DOCUMENTO_ADMISION: response._documento?.CORR_DOCUMENTO_ADMISION,
								CODIGO: response._documento?.CODIGO,
								NOMBRE_DOCUMENTO: response._documento?.NOMBRE_DOCUMENTO,
								ORDEN: response._documento?.ORDEN,
							});
							if (mapped.CORR_DOCUMENTO_ADMISION > 0) {
								this.aplicarInsertEnMemoria(mapped);
								insertOk += 1;
							}
						} else if (response._tipo === 'delete') {
							const corrDocumento = Number(response._documento?.CORR_DOCUMENTO_ADMISION ?? 0);
							if (corrDocumento > 0) {
								this.aplicarDeleteEnMemoria(corrTipo, corrDocumento);
								deleteOk += 1;
							}
						}
					}
					if (insertOk > 0 || deleteOk > 0) {
						const partes: string[] = [];
						if (insertOk > 0) {
							partes.push(insertOk === 1 ? '1 documento asignado' : `${insertOk} documentos asignados`);
						}
						if (deleteOk > 0) {
							partes.push(deleteOk === 1 ? '1 documento quitado' : `${deleteOk} documentos quitados`);
						}
						this.notifyFx(partes.join('. ') + '.', NotifyType.Success, { raw: true });
					}
					if (fail.length > 0) {
						this.notifyFx(
							fail[0]?.ErrorMessage || 'Algunos documentos no se pudieron actualizar.',
							NotifyType.Warning
						);
						this.documentosModal = this.armarDocumentosModal(corrTipo);
					} else {
						this.popupVisible = false;
						this.cerrarPopup();
					}
					this.cdr.detectChanges();
				},
				error: (error) => {
					this.guardando = false;
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: normaliza una fila de la relación.
	// Cómo: convierte correlativos y limpia los textos del documento.
	private mapAsignacion(item: any): AcaDocumentoAdmisionAsignacion {
		return {
			CORR_EMPRESA: Number(item?.CORR_EMPRESA ?? 0),
			CORR_TIPO_DOCUMENTO: Number(item?.CORR_TIPO_DOCUMENTO ?? 0),
			NOMBRE_TIPO: (item?.NOMBRE_TIPO ?? '').toString().trim(),
			CORR_DOCUMENTO_ADMISION: Number(item?.CORR_DOCUMENTO_ADMISION ?? 0),
			CODIGO: (item?.CODIGO ?? '').toString().trim(),
			NOMBRE_DOCUMENTO: (item?.NOMBRE_DOCUMENTO ?? '').toString().trim(),
			ORDEN: Number(item?.ORDEN ?? 0),
			OBLIGATORIO: item?.OBLIGATORIO === true,
			ACTIVO: item?.ACTIVO !== false,
		};
	}

	// Qué hace: agrega una asignación en memoria.
	// Cómo: reemplaza la fila de la misma llave y recalcula el contador.
	private aplicarInsertEnMemoria(item: AcaDocumentoAdmisionAsignacion): void {
		this.asignaciones = [
			...this.asignaciones.filter(
				(row) =>
					!(
						Number(row.CORR_TIPO_DOCUMENTO) === Number(item.CORR_TIPO_DOCUMENTO) &&
						Number(row.CORR_DOCUMENTO_ADMISION) === Number(item.CORR_DOCUMENTO_ADMISION)
					)
			),
			item,
		];
		this.aplicarContadores();
	}

	// Qué hace: quita una asignación en memoria.
	// Cómo: saca la fila por tipo y documento y recalcula el contador.
	private aplicarDeleteEnMemoria(corrTipo: number, corrDocumento: number): void {
		this.asignaciones = this.asignaciones.filter(
			(row) =>
				!(
					Number(row.CORR_TIPO_DOCUMENTO) === Number(corrTipo) &&
					Number(row.CORR_DOCUMENTO_ADMISION) === Number(corrDocumento)
				)
		);
		this.aplicarContadores();
	}

	// Qué hace: actualiza la cantidad de documentos de cada solicitud.
	// Cómo: cuenta las marcas en memoria y refresca la grilla.
	private aplicarContadores(): void {
		this.models = (this.models as AcaFlujoTipoProspecto[]).map((item) => ({
			...item,
			CANT_DOCUMENTOS: this.asignaciones.filter(
				(row) => Number(row.CORR_TIPO_DOCUMENTO) === Number(item.CORR_TIPO_DOCUMENTO)
			).length,
		}));
		const corr = Number(this.model?.CORR_TIPO_DOCUMENTO ?? 0);
		if (corr > 0) {
			const actual = (this.models as AcaFlujoTipoProspecto[]).find(
				(item) => Number(item.CORR_TIPO_DOCUMENTO) === corr
			);
			if (actual) {
				this.model = actual;
			}
		}
		this.refrescarGridMtto(false);
	}
}
