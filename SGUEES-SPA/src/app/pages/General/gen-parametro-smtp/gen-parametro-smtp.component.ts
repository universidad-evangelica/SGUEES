// Qué hace: componente de mantenimiento (CRUD) para la configuración de Parámetros SMTP.
// Cómo lo hace: extiende de CBaseComponent, implementa parche en memoria tras guardar y gestiona el formulario y grilla DevExtreme.
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { confirm } from 'devextreme/ui/dialog';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenParametroSmtp } from './models/gen-parametro-smtp';
import { GenParametroSmtpService } from './gen-parametro-smtp.service';
import { GenParametroPlantilla } from './gen-parametro-plantilla/models/gen-parametro-plantilla';
import { GenParametroPlantillaService } from './gen-parametro-plantilla/gen-parametro-plantilla.service';
import { GenParametroPlantillaVersion } from './gen-parametro-plantilla-version/models/gen-parametro-plantilla-version';
import { GenParametroPlantillaVersionService } from './gen-parametro-plantilla-version/gen-parametro-plantilla-version.service';

@Component({
	selector: 'app-gen-parametro-smtp',
	templateUrl: './gen-parametro-smtp.component.html',
	styleUrls: ['./gen-parametro-smtp.component.scss'],
})
export class GenParametroSmtpComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	esVistaPlantillas = false;
	plantillas: GenParametroPlantilla[] = [];
	modoFormularioPlantilla = false;
	plantillaModel!: GenParametroPlantilla;
	columnasPlantilla: any[] = [];
	cargandoPlantillas = false;
	mSISTEMAS: Array<{ Key: string; Value: string }> = [];
	mOPCIONES: Array<{ Key: string; Value: string }> = [];
	cargandoOpciones = false;
	parametrosDisponibles: Array<{ key: string; label: string; descripcion?: string; tipo?: string }> = [];

	versiones: GenParametroPlantillaVersion[] = [];
	versionSeleccionada: GenParametroPlantillaVersion | null = null;
	cargandoVersiones = false;
	popupNuevaVersionVisible = false;
	motivoNuevaVersion = '';
	guardandoNuevaVersion = false;
	activandoVersion = false;

	protected override etiquetaRegistro = 'la configuración de correo';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_PARAMETRO_SMTP';
	protected override mttoCampoEstado = '';
	protected override mttoEstadoDescribeField = 'CORREO_REMITENTE';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Configuración de Correo';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenParametroSmtpService,
		private plantillaService: GenParametroPlantillaService,
		private plantillaVersionService: GenParametroPlantillaVersionService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.items = this.service.getItems();
		this.columnasPlantilla = this.plantillaService.getColumns();
		this.plantillaModel = this.initPlantillaModel();
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.consultar();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	fillParam(xCORR_PARAMETRO_SMTP?: number): any {
		return { CORR_PARAMETRO_SMTP: xCORR_PARAMETRO_SMTP ?? 0 };
	}

	// Qué hace: mapea el modelo de datos o inicializa uno vacío por defecto.
	// Cómo lo hace: copia propiedades de GenParametroSmtp asegurando valores por defecto no nulos.
	override fillData(xModel?: GenParametroSmtp): GenParametroSmtp {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_PARAMETRO_SMTP: xModel.CORR_PARAMETRO_SMTP,
				CORREO_REMITENTE: xModel.CORREO_REMITENTE ?? '',
				USUARIO_REMITENTE: xModel.USUARIO_REMITENTE ?? '',
				CONTRASENA_REMITENTE: xModel.CONTRASENA_REMITENTE ?? '',
				SERVIDOR_CORREO: xModel.SERVIDOR_CORREO ?? '',
				PUERTO_CORREO: xModel.PUERTO_CORREO ?? 587,
				USA_SSL_CORREO: !!xModel.USA_SSL_CORREO,
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
			};
		}

		return {
			CORR_EMPRESA: 0,
			CORR_PARAMETRO_SMTP: 0,
			CORREO_REMITENTE: '',
			USUARIO_REMITENTE: '',
			CONTRASENA_REMITENTE: '',
			SERVIDOR_CORREO: '',
			PUERTO_CORREO: 587,
			USA_SSL_CORREO: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	// Qué hace: consulta inicial de registros del catálogo.
	// Cómo lo hace: limpia la selección actual, invoca service.getAll y refresca el grid.
	consultar(resetPage = false): void {
		this.model = this.fillData();
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
			onData: () => {
				this.ordenarModelsPorCorr();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	// Qué hace: ordena la lista de registros en memoria del más reciente al más antiguo.
	// Cómo lo hace: aplica sort descendente por CORR_PARAMETRO_SMTP numérico.
	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort(
			(a, b) => Number(b.CORR_PARAMETRO_SMTP) - Number(a.CORR_PARAMETRO_SMTP)
		);
	}

	// Qué hace: actualiza en memoria el registro insertado o modificado sin recargar con GetAll.
	// Cómo lo hace: busca por clave primaria en this.models y actualiza el array directamente.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as GenParametroSmtp);
		const key = this.mttoGridKeyExpr as keyof GenParametroSmtp;

		if (isAdd) {
			this.models = [...this.models, record];
		} else {
			const index = this.models.findIndex((item) => item?.[key] === record[key]);
			if (index >= 0) {
				this.models = this.models.map((item, i) =>
					i === index ? this.fillData({ ...item, ...record }) : item
				);
			}
		}

		this.ordenarModelsPorCorr();
		this.refrescarGridTrasCarga(isAdd);
	}

	// Qué hace: remueve de memoria la fila eliminada sin realizar GetAll.
	// Cómo lo hace: filtra this.models excluyendo la llave eliminada.
	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof GenParametroSmtp;
		this.models = this.models.filter((item) => item?.[key] !== keyValue);
		this.refrescarGridTrasCarga(true);
	}

	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		if (rowData) {
			this.model = this.fillData(rowData);
			this.modelUpdate = this.fillData(rowData);
		}
		super.rowDblClick(e);
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.bloquear();
		});
	}

	onEditClick(e: any): void {
		if (!e?.row?.data) {
			return;
		}

		this.model = this.fillData(e.row.data);
		this.editarClick(e);
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.habilitar();
		});
	}

	override nuevo(): void {
		super.nuevo();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
		});
	}

	// Qué hace: guarda un nuevo registro SMTP o la plantilla si nos encontramos en la vista de plantillas.
	// Cómo lo hace: evalúa esVistaPlantillas para delegar a guardarPlantilla() o ejecutar la validación y guardado del formulario SMTP con parche en memoria.
	guardar(): void {
		if (this.esVistaPlantillas) {
			this.guardarPlantilla();
			return;
		}

		const formData = this.dataForm?.instance?.option('formData');
		if (formData) {
			this.model = { ...this.model, ...formData };
		}

		const formValidation = this.dataForm?.instance?.validate();
		if (formValidation && !formValidation.isValid) {
			this.service.esValido(this.model, this.notifyFx.bind(this));
			return;
		}

		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	private convertirErrorMttoEnWarning<T>(request: Observable<T>): Observable<T> {
		return request.pipe(
			catchError((error: any) => {
				const mensaje = `${
					error?.ErrorMessage ?? error?.error?.ErrorMessage ?? error?.error?.message ?? error?.error ?? error?.message ?? error ?? ''
				}`;
				const normalizado = mensaje.toLowerCase();
				const tieneRelacion = [
					'foreign key',
					'reference constraint',
					'clave externa',
					'clave foránea',
					'llave foránea',
					'hijos',
					'registros relacionados',
					'registros asociados',
				].some((texto) => normalizado.includes(texto));

				if (tieneRelacion) {
					return of({
						Result: false,
						ErrorCode: 2627,
						ErrorMessage: 'No se puede eliminar porque tiene registros relacionados.',
					} as T);
				}

				return throwError(() => error);
			})
		);
	}

	// Qué hace: cancela la edición actual o regresa al catálogo de correos si está en la vista de plantillas.
	// Cómo lo hace: evalúa esVistaPlantillas para llamar a volverACorreos() o invocar super.cancelar() para correos SMTP.
	override cancelar(): void {
		if (this.esVistaPlantillas) {
			this.volverACorreos();
			return;
		}

		super.cancelar((item: any) => item.CORR_PARAMETRO_SMTP === this.modelUpdate.CORR_PARAMETRO_SMTP);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(
					this.service.delete(this.fillParam(e.data.CORR_PARAMETRO_SMTP))
				),
		});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORREO_REMITENTE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('SERVIDOR_CORREO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('PUERTO_CORREO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('USA_SSL_CORREO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('USUARIO_REMITENTE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CONTRASENA_REMITENTE')?.option('readOnly', true);
	}

	override habilitar(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORREO_REMITENTE')?.option('readOnly', false);
			this.dataForm.instance.getEditor('SERVIDOR_CORREO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('PUERTO_CORREO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('USA_SSL_CORREO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('USUARIO_REMITENTE')?.option('readOnly', false);
			this.dataForm.instance.getEditor('CONTRASENA_REMITENTE')?.option('readOnly', false);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORREO_REMITENTE')?.focus();
		});
	}

	// Qué hace: inicializa o clona el modelo de datos de una plantilla.
	// Cómo lo hace: asegura valores predeterminados para formulario y editor de texto iniciando en limpio para que el usuario redacte o pulse el botón de formato institucional.
	initPlantillaModel(item?: GenParametroPlantilla): GenParametroPlantilla {
		if (item) {
			return {
				...item,
				CODIGO_SISTEMA: item.CODIGO_SISTEMA ?? null,
				CODIGO_OPCION: item.CODIGO_OPCION ?? null,
				CORREO_CC: item.CORREO_CC ?? '',
				CORREO_CCO: item.CORREO_CCO ?? '',
				CUERPO_PLANTILLA: item.CUERPO_PLANTILLA ?? '',
			};
		}
		return {
			CORR_EMPRESA: 0,
			CORR_PARAMETRO_PLANTILLA: 0,
			CODIGO_PLANTILLA: '',
			NOMBRE_PLANTILLA: '',
			ASUNTO_PLANTILLA: '',
			CUERPO_PLANTILLA: '',
			CORR_PARAMETRO_SMTP: this.model?.CORR_PARAMETRO_SMTP ?? 0,
			CODIGO_SISTEMA: null,
			CODIGO_OPCION: null,
			CORREO_CC: '',
			CORREO_CCO: '',
			ACTIVO_PLANTILLA: true,
		};
	}

	// Qué hace: restablece el editor con la plantilla institucional base de la UEES.
	// Cómo lo hace: asigna el formato HTML institucional a plantillaModel.CUERPO_PLANTILLA y notifica al usuario.
	cargarFormatoBaseUEES(): void {
		this.plantillaModel.CUERPO_PLANTILLA = this.plantillaService.obtenerFormatoBaseUEES();
		this.notifyFx('Formato institucional cargado en el editor.', NotifyType.Success);
	}

	// Qué hace: limpia exclusivamente el contenido HTML redactado en el editor de correo.
	// Cómo lo hace: asigna cadena vacía a plantillaModel.CUERPO_PLANTILLA preservando intactos el código, nombre, asunto y demás datos de la plantilla, y emite una notificación al usuario.
	limpiarEditorPlantilla(): void {
		this.plantillaModel.CUERPO_PLANTILLA = '';
		this.notifyFx('Contenido del editor limpiado.', NotifyType.Success);
	}

	// Qué hace: determina si hay una cuenta de correo seleccionada en la grilla para mostrar el botón de plantillas.
	// Cómo lo hace: valida que se encuentre en modo consulta (browse), no esté en la vista de plantillas y que model.CORR_PARAMETRO_SMTP sea válido y mayor a 0.
	tieneRegistroSeleccionado(): boolean {
		return this.isBrowse() && !this.esVistaPlantillas && !!this.model?.CORR_PARAMETRO_SMTP && Number(this.model.CORR_PARAMETRO_SMTP) > 0;
	}

	// Qué hace: determina si la plantilla ya cuenta con una primera versión guardada para permitir crear nuevas versiones.
	// Cómo lo hace: verifica que la plantilla tenga correlativo válido y que el arreglo de versiones tenga al menos un elemento.
	tienePrimeraVersionGuardada(): boolean {
		return !!this.plantillaModel?.CORR_PARAMETRO_PLANTILLA &&
			this.plantillaModel.CORR_PARAMETRO_PLANTILLA > 0 &&
			Array.isArray(this.versiones) &&
			this.versiones.length > 0;
	}

	// Qué hace: indica si la versión actualmente visualizada es la activa.
	// Cómo lo hace: evalúa ES_VERSION_ACTIVA en la versión seleccionada (o true si no hay versiones creadas aún).
	esVersionActivaSeleccionada(): boolean {
		if (!this.tienePrimeraVersionGuardada()) {
			return true;
		}
		return !!this.versionSeleccionada?.ES_VERSION_ACTIVA;
	}

	// Qué hace: determina si la plantilla ya cuenta con su módulo y proceso fijados y guardados en base de datos.
	// Cómo lo hace: verifica que exista identificador de plantilla válido y que CODIGO_OPCION esté definido y no vacío.
	tieneModuloYProcesoFijado(): boolean {
		return (
			!!this.plantillaModel?.CORR_PARAMETRO_PLANTILLA &&
			this.plantillaModel.CORR_PARAMETRO_PLANTILLA > 0 &&
			!!this.plantillaModel?.CODIGO_OPCION &&
			this.plantillaModel.CODIGO_OPCION.trim() !== ''
		);
	}

	// Qué hace: determina si el editor de texto enriquecido debe estar habilitado para la edición.
	// Cómo lo hace: valida que el módulo y proceso ya hayan sido fijados y guardados, y que la versión seleccionada sea la activa.
	esEditorHabilitado(): boolean {
		return this.tieneModuloYProcesoFijado() && this.esVersionActivaSeleccionada();
	}

	// Qué hace: formatea el texto a mostrar en el selector desplegable de versiones.
	// Cómo lo hace: concatena número de versión, estado activa/histórica y fecha de creación.
	formatVersionDisplay = (item: GenParametroPlantillaVersion): string => {
		if (!item) return '';
		const estado = item.ES_VERSION_ACTIVA ? ' (Activa)' : ' (Histórica)';
		const fecha = item.FECHA_CREA ? ` - ${new Date(item.FECHA_CREA).toLocaleDateString()}` : '';
		return `Versión ${item.NUMERO_VERSION}${estado}${fecha}`;
	};

	// Qué hace: consulta el historial de versiones de la plantilla.
	// Cómo lo hace: invoca plantillaVersionService.getAll y selecciona por defecto la versión activa en memoria.
	cargarVersionesPlantilla(corrPlantilla: number, callback?: () => void): void {
		this.cargandoVersiones = true;
		this.plantillaVersionService.getAll(corrPlantilla).subscribe({
			next: (res) => {
				this.cargandoVersiones = false;
				if (res?.Result && Array.isArray(res.Data) && res.Data.length > 0) {
					this.versiones = res.Data as GenParametroPlantillaVersion[];
					const activa = this.versiones.find((v) => v.ES_VERSION_ACTIVA) ?? this.versiones[0];
					// Qué hace: sincroniza la versión activa con el contenido de la cabecera si ya fue cargado.
					// Cómo lo hace: asegura que la versión activa en memoria refleje el CUERPO_PLANTILLA y ASUNTO_PLANTILLA recién consultados de la cabecera.
					if (activa && this.plantillaModel?.CUERPO_PLANTILLA && activa.ES_VERSION_ACTIVA) {
						activa.CUERPO_PLANTILLA = this.plantillaModel.CUERPO_PLANTILLA;
						activa.ASUNTO_PLANTILLA = this.plantillaModel.ASUNTO_PLANTILLA;
						activa.CORREO_CC = this.plantillaModel.CORREO_CC;
						activa.CORREO_CCO = this.plantillaModel.CORREO_CCO;
					}
					this.seleccionarVersion(activa, true);
				} else {
					this.versiones = [];
					this.versionSeleccionada = null;
				}
				if (callback) callback();
			},
			error: () => {
				this.cargandoVersiones = false;
				this.versiones = [];
				this.versionSeleccionada = null;
				if (callback) callback();
			},
		});
	}

	// Qué hace: asigna la versión seleccionada y sincroniza los campos del formulario.
	// Cómo lo hace: actualiza versionSeleccionada y copia su contenido a plantillaModel para edición o visualización.
	seleccionarVersion(version: GenParametroPlantillaVersion | null, sincronizarCampos = true): void {
		this.versionSeleccionada = version;
		if (version && sincronizarCampos) {
			this.plantillaModel.ASUNTO_PLANTILLA = version.ASUNTO_PLANTILLA ?? '';
			this.plantillaModel.CUERPO_PLANTILLA = version.CUERPO_PLANTILLA ?? '';
			this.plantillaModel.CORREO_CC = version.CORREO_CC ?? '';
			this.plantillaModel.CORREO_CCO = version.CORREO_CCO ?? '';
		}
	}

	// Qué hace: gestiona el cambio de versión en el combo selector.
	// Cómo lo hace: busca en this.versiones por NUMERO_VERSION y carga sus datos.
	onVersionSelectionChange(e: any): void {
		const num = e?.value;
		if (num !== undefined && num !== null) {
			const encontrada = this.versiones.find((v) => v.NUMERO_VERSION === num);
			if (encontrada && encontrada !== this.versionSeleccionada) {
				this.seleccionarVersion(encontrada, true);
			}
		}
	}

	// Qué hace: abre el modal para capturar el motivo de la nueva versión.
	// Cómo lo hace: valida que exista primera versión guardada y muestra el popup.
	abrirModalNuevaVersion(): void {
		if (!this.tienePrimeraVersionGuardada()) {
			this.notifyFx('Debe guardar primero la plantilla para poder generar versiones.', NotifyType.Warning);
			return;
		}
		this.motivoNuevaVersion = '';
		this.popupNuevaVersionVisible = true;
	}

	// Qué hace: cierra el popup modal de nueva versión.
	// Cómo lo hace: oculta el popup y restablece el campo del motivo.
	cerrarModalNuevaVersion(): void {
		this.popupNuevaVersionVisible = false;
		this.motivoNuevaVersion = '';
	}

	// Qué hace: confirma la creación de una nueva versión basada en el contenido actual.
	// Cómo lo hace: valida datos, envía petición al backend, actualiza arreglo en memoria sin GetAll y selecciona la nueva versión.
	confirmarNuevaVersion(): void {
		if (!this.plantillaVersionService.esValidaNuevaVersion(this.motivoNuevaVersion, this.notifyFx.bind(this))) {
			return;
		}
		if (!this.plantillaService.esValido(this.plantillaModel, this.notifyFx.bind(this))) {
			return;
		}

		const nuevaVersionPayload: GenParametroPlantillaVersion = {
			CORR_EMPRESA: this.plantillaModel.CORR_EMPRESA,
			CORR_PARAMETRO_PLANTILLA: this.plantillaModel.CORR_PARAMETRO_PLANTILLA,
			NUMERO_VERSION: 0,
			ASUNTO_PLANTILLA: this.plantillaModel.ASUNTO_PLANTILLA,
			CUERPO_PLANTILLA: this.plantillaModel.CUERPO_PLANTILLA,
			CORREO_CC: this.plantillaModel.CORREO_CC,
			CORREO_CCO: this.plantillaModel.CORREO_CCO,
			ES_VERSION_ACTIVA: true,
			MOTIVO_VERSION: this.motivoNuevaVersion.trim(),
		};

		this.guardandoNuevaVersion = true;
		this.plantillaVersionService.crearVersion(nuevaVersionPayload).subscribe({
			next: (res) => {
				this.guardandoNuevaVersion = false;
				if (res?.Result && res.Data) {
					this.notifyFx('Nueva versión creada y activada correctamente.', NotifyType.Success);
					this.cerrarModalNuevaVersion();
					const nueva = res.Data as GenParametroPlantillaVersion;
					this.versiones = [
						nueva,
						...this.versiones.map((v) => ({ ...v, ES_VERSION_ACTIVA: false })),
					];
					this.seleccionarVersion(nueva, true);
				} else {
					this.notifyFx(res?.ErrorMessage || 'Error al crear la versión.', NotifyType.Error);
				}
			},
			error: (err) => {
				this.guardandoNuevaVersion = false;
				this.notifyFx(err?.message || 'Error al procesar la solicitud.', NotifyType.Error);
			},
		});
	}

	// Qué hace: activa la versión histórica actualmente seleccionada en el combo.
	// Cómo lo hace: invoca activarVersion en el servicio y actualiza en memoria las banderas ES_VERSION_ACTIVA.
	activarVersionSeleccionada(): void {
		if (!this.versionSeleccionada) {
			return;
		}
		const num = this.versionSeleccionada.NUMERO_VERSION;
		this.activandoVersion = true;
		this.plantillaVersionService.activarVersion(this.plantillaModel.CORR_PARAMETRO_PLANTILLA, num).subscribe({
			next: (res) => {
				this.activandoVersion = false;
				if (res?.Result) {
					this.notifyFx(`Versión ${num} establecida como activa correctamente.`, NotifyType.Success);
					this.versiones = this.versiones.map((v) => ({
						...v,
						ES_VERSION_ACTIVA: v.NUMERO_VERSION === num,
					}));
					const activaActualizada = this.versiones.find((v) => v.NUMERO_VERSION === num) ?? null;
					this.seleccionarVersion(activaActualizada, true);
				} else {
					this.notifyFx(res?.ErrorMessage || 'Error al activar la versión.', NotifyType.Error);
				}
			},
			error: (err) => {
				this.activandoVersion = false;
				this.notifyFx(err?.message || 'Error al procesar la activación.', NotifyType.Error);
			},
		});
	}

	// Qué hace: cambia la pantalla a la vista de plantilla del correo seleccionado cargando sus datos y versiones.
	// Cómo lo hace: activa banderas de carga inicial, consulta plantilla asociada y si existe carga sus versiones.
	abrirVistaPlantillas(): void {
		if (!this.tieneRegistroSeleccionado()) {
			this.notifyFx('Seleccione un correo para gestionar sus plantillas.', NotifyType.Warning);
			return;
		}
		this.esVistaPlantillas = true;
		this.cargandoPlantillas = true;
		this.cargandoVersiones = true;
		this.versiones = [];
		this.versionSeleccionada = null;
		this.cargarModulos();

		this.plantillaService.getAll({ CORR_PARAMETRO_SMTP: this.model.CORR_PARAMETRO_SMTP }).subscribe({
			next: (res) => {
				this.cargandoPlantillas = false;
				if (res?.Result && Array.isArray(res.Data) && res.Data.length > 0) {
					this.plantillaModel = this.initPlantillaModel(res.Data[0]);
					if (this.plantillaModel.CODIGO_SISTEMA) {
						this.cargarOpcionesModulo(this.plantillaModel.CODIGO_SISTEMA, () => {
							this.cargarParametrosDisponibles();
						});
					} else {
						this.cargarParametrosDisponibles();
					}
					this.cargarVersionesPlantilla(this.plantillaModel.CORR_PARAMETRO_PLANTILLA);
				} else {
					this.cargandoVersiones = false;
					this.plantillaModel = this.initPlantillaModel();
					this.plantillaModel.CORR_PARAMETRO_SMTP = this.model.CORR_PARAMETRO_SMTP;
					this.versiones = [];
					this.versionSeleccionada = null;
					this.cargarParametrosDisponibles();
				}
			},
			error: (err) => {
				this.cargandoPlantillas = false;
				this.cargandoVersiones = false;
				this.notifyFx(err?.message || 'Error al consultar la plantilla.', NotifyType.Error);
				this.plantillaModel = this.initPlantillaModel();
				this.plantillaModel.CORR_PARAMETRO_SMTP = this.model.CORR_PARAMETRO_SMTP;
				this.versiones = [];
				this.versionSeleccionada = null;
				this.cargarParametrosDisponibles();
			},
		});
	}

	// Qué hace: carga el catálogo de módulos o sistemas registrados para el formulario de plantillas.
	// Cómo lo hace: invoca plantillaService.getModulos y almacena el resultado en mSISTEMAS.
	cargarModulos(): void {
		this.plantillaService.getModulos().subscribe({
			next: (res) => {
				if (res?.Result && Array.isArray(res.Data)) {
					this.mSISTEMAS = res.Data;
				} else {
					this.mSISTEMAS = [];
				}
			},
			error: () => {
				this.mSISTEMAS = [];
			},
		});
	}

	// Qué hace: carga las opciones o menús asociados al módulo seleccionado.
	// Cómo lo hace: invoca plantillaService.getOpcionesPorModulo filtrando por CODIGO_SISTEMA.
	cargarOpcionesModulo(codigoSistema?: string | null, callback?: () => void): void {
		if (!codigoSistema) {
			this.mOPCIONES = [];
			if (callback) callback();
			return;
		}
		this.cargandoOpciones = true;
		this.plantillaService.getOpcionesPorModulo(codigoSistema).subscribe({
			next: (res) => {
				this.cargandoOpciones = false;
				if (res?.Result && Array.isArray(res.Data)) {
					this.mOPCIONES = res.Data;
				} else {
					this.mOPCIONES = [];
				}
				if (callback) callback();
			},
			error: () => {
				this.cargandoOpciones = false;
				this.mOPCIONES = [];
				if (callback) callback();
			},
		});
	}

	// Qué hace: obtiene los parámetros dinámicos específicos para la opción y módulo actuales.
	// Cómo lo hace: consulta plantillaService.getParametrosDisponibles y actualiza parametrosDisponibles.
	cargarParametrosDisponibles(): void {
		const codigoOpcion = this.plantillaModel?.CODIGO_OPCION ?? '';
		const codigoSistema = this.plantillaModel?.CODIGO_SISTEMA ?? '';
		this.plantillaService.getParametrosDisponibles(codigoOpcion, codigoSistema).subscribe({
			next: (res) => {
				if (res?.Result && Array.isArray(res.Data)) {
					this.parametrosDisponibles = res.Data;
				} else {
					this.parametrosDisponibles = [];
				}
			},
			error: () => {
				this.parametrosDisponibles = [];
			},
		});
	}

	// Qué hace: reacciona al cambio manual de módulo en el selector de la plantilla.
	// Cómo lo hace: valida la existencia de e.event para ignorar inicializaciones programáticas y actualiza el módulo limpiando la opción solo si el usuario interactuó directamente.
	onModuloPlantillaChange(e: any): void {
		if (!e?.event) {
			return;
		}
		const nuevoModulo = e?.value;
		if (nuevoModulo === e?.previousValue) {
			return;
		}
		this.plantillaModel.CODIGO_SISTEMA = nuevoModulo;
		this.plantillaModel.CODIGO_OPCION = null;
		this.cargarOpcionesModulo(nuevoModulo, () => {
			this.cargarParametrosDisponibles();
		});
	}

	// Qué hace: reacciona al cambio manual de opción o menú en el selector de la plantilla.
	// Cómo lo hace: valida la existencia de e.event para ignorar eventos programáticos, actualizando CODIGO_OPCION y recargando parámetros solo ante interacción directa del usuario.
	onOpcionPlantillaChange(e: any): void {
		if (!e?.event) {
			return;
		}
		const nuevaOpcion = e?.value;
		if (nuevaOpcion === e?.previousValue) {
			return;
		}
		this.plantillaModel.CODIGO_OPCION = nuevaOpcion ?? null;
		this.cargarParametrosDisponibles();
	}

	// Qué hace: regresa desde la vista de plantilla hacia el catálogo de correos SMTP.
	// Cómo lo hace: desactiva la bandera esVistaPlantillas y restablece el subtítulo de la ventana.
	volverACorreos(): void {
		this.esVistaPlantillas = false;
		this.subTituloVentana = this.maintenanceSubtitulo;
	}

	// Qué hace: guarda la plantilla y crea su primera versión si es nuevo registro, o actualiza la activa existente.
	// Cómo lo hace: valida datos, solicita confirmación si es el primer guardado de módulo/proceso, ejecuta inserción o actualización y mantiene sincronizado el estado en memoria.
	async guardarPlantilla(): Promise<void> {
		if (this.tienePrimeraVersionGuardada() && !this.esVersionActivaSeleccionada()) {
			this.notifyFx('No se puede modificar una versión histórica. Establezca la versión como activa o cree una nueva versión.', NotifyType.Warning);
			return;
		}

		// Si aún no tiene cuerpo redactado y es el primer guardado, precargar el formato base institucional automáticamente
		if (!this.plantillaModel.CUERPO_PLANTILLA || this.plantillaModel.CUERPO_PLANTILLA.trim() === '') {
			this.plantillaModel.CUERPO_PLANTILLA = this.plantillaService.obtenerFormatoBaseUEES();
		}

		if (!this.plantillaService.esValido(this.plantillaModel, this.notifyFx.bind(this))) {
			return;
		}

		// Confirmación previa si es la primera vez que se fijará el módulo y menú de la plantilla
		if (!this.tieneModuloYProcesoFijado()) {
			const nombreModulo =
				this.mSISTEMAS.find((s) => s.Key === this.plantillaModel.CODIGO_SISTEMA)?.Value ??
				this.plantillaModel.CODIGO_SISTEMA;
			const nombreOpcion =
				this.mOPCIONES.find((o) => o.Key === this.plantillaModel.CODIGO_OPCION)?.Value ??
				this.plantillaModel.CODIGO_OPCION;

			const mensaje = `¿Está seguro de asociar esta plantilla a:\n\n• Módulo: ${nombreModulo}\n• Menú / Proceso: ${nombreOpcion}\n\nUna vez guardada la información principal, el módulo y proceso quedarán fijos y se habilitará el editor para redactar el correo.`;
			const confirmado = await confirm(mensaje, 'Confirmar Módulo y Proceso');
			if (!confirmado) {
				return;
			}
		}

		this.plantillaModel.CORR_PARAMETRO_SMTP = this.model?.CORR_PARAMETRO_SMTP ?? 0;
		const esNuevo = !this.plantillaModel.CORR_PARAMETRO_PLANTILLA || this.plantillaModel.CORR_PARAMETRO_PLANTILLA === 0;

		const peticion = esNuevo
			? this.plantillaService.insert(this.plantillaModel)
			: this.plantillaService.update(this.plantillaModel);

		peticion.subscribe({
			next: (res) => {
				if (res?.Result) {
					this.notifyFx(
						esNuevo
							? 'Información principal registrada. Ahora puede redactar el contenido en el editor.'
							: 'Plantilla actualizada correctamente.',
						NotifyType.Success
					);
					if (res.Data) {
						this.plantillaModel = res.Data as GenParametroPlantilla;

						// Qué hace: determina si se debe generar la primera versión (Versión 1).
						// Cómo lo hace: valida si es nuevo o si la plantilla existente carece de historial de versiones.
						const debeCrearPrimeraVersion = esNuevo || !Array.isArray(this.versiones) || this.versiones.length === 0;

						if (debeCrearPrimeraVersion) {
							// Crear automáticamente la primera versión (Versión 1)
							const primeraVersionPayload: GenParametroPlantillaVersion = {
								CORR_EMPRESA: this.plantillaModel.CORR_EMPRESA,
								CORR_PARAMETRO_PLANTILLA: this.plantillaModel.CORR_PARAMETRO_PLANTILLA,
								NUMERO_VERSION: 1,
								ASUNTO_PLANTILLA: this.plantillaModel.ASUNTO_PLANTILLA,
								CUERPO_PLANTILLA: this.plantillaModel.CUERPO_PLANTILLA,
								CORREO_CC: this.plantillaModel.CORREO_CC,
								CORREO_CCO: this.plantillaModel.CORREO_CCO,
								ES_VERSION_ACTIVA: true,
								MOTIVO_VERSION: 'Versión inicial',
							};

							this.plantillaVersionService.crearVersion(primeraVersionPayload).subscribe({
								next: (resVer) => {
									if (resVer?.Result && resVer.Data) {
										const verCreada = resVer.Data as GenParametroPlantillaVersion;
										this.versiones = [verCreada];
										this.seleccionarVersion(verCreada, false);
									}
								},
							});
						} else {
							// Parche en memoria de la versión activa si existía
							if (this.versionSeleccionada && this.versionSeleccionada.ES_VERSION_ACTIVA) {
								this.versionSeleccionada.ASUNTO_PLANTILLA = this.plantillaModel.ASUNTO_PLANTILLA;
								this.versionSeleccionada.CUERPO_PLANTILLA = this.plantillaModel.CUERPO_PLANTILLA;
								this.versionSeleccionada.CORREO_CC = this.plantillaModel.CORREO_CC;
								this.versionSeleccionada.CORREO_CCO = this.plantillaModel.CORREO_CCO;
							}
							this.versiones = this.versiones.map((v) =>
								v.ES_VERSION_ACTIVA
									? {
											...v,
											ASUNTO_PLANTILLA: this.plantillaModel.ASUNTO_PLANTILLA,
											CUERPO_PLANTILLA: this.plantillaModel.CUERPO_PLANTILLA,
											CORREO_CC: this.plantillaModel.CORREO_CC,
											CORREO_CCO: this.plantillaModel.CORREO_CCO,
									  }
									: v
							);
						}
					}
				} else {
					this.notifyFx(res?.ErrorMessage || 'Error al guardar la plantilla.', NotifyType.Error);
				}
			},
			error: (err) => {
				this.notifyFx(err?.message || 'Error al procesar la solicitud.', NotifyType.Error);
			},
		});
	}
}
