// Qué hace: componente de mantenimiento (CRUD) para las Plantillas de Correo Electrónico.
// Cómo lo hace: extiende de CBaseComponent, gestiona grilla de plantillas, editor HTML institucional, catálogos dependientes y control de versiones con parche en memoria.
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { confirm, custom } from 'devextreme/ui/dialog';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';
import { GenParametroPlantilla } from './models/gen-parametro-plantilla';
import { GenParametroPlantillaService } from './gen-parametro-plantilla.service';
import { GenParametroPlantillaVersion } from './gen-parametro-plantilla-version/models/gen-parametro-plantilla-version';
import { GenParametroPlantillaVersionService } from './gen-parametro-plantilla-version/gen-parametro-plantilla-version.service';

@Component({
	selector: 'app-gen-parametro-plantilla',
	templateUrl: './gen-parametro-plantilla.component.html',
	styleUrls: ['./gen-parametro-plantilla.component.scss'],
})
export class GenParametroPlantillaComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	mSMTPS: Array<{ Key: number; Value: string }> = [];
	mSISTEMAS: Array<{ Key: string; Value: string }> = [];
	mOPCIONES: Array<{ Key: string; Value: string }> = [];
	parametrosDisponibles: Array<{ key: string; label: string; descripcion?: string; tipo?: string }> = [];

	// Qué hace: opciones de configuración para la ventana desplegable de cuentas SMTP.
	// Cómo lo hace: asigna clase smtp-select-popup-wrapper y fuerza el ancho del popup al tamaño del selector con prioridad important.
	smtpDropDownOptions = {
		wrapperAttr: { class: 'smtp-select-popup-wrapper' },
		onShowing: (e: any) => {
			const ofEl = e.component.option('position')?.of ?? e.component.option('position.of');
			const domEl = ofEl?.[0] ?? ofEl ?? document.querySelector('.form-col-medio dx-select-box');
			const width = domEl?.offsetWidth ?? domEl?.getBoundingClientRect?.()?.width;
			if (width) {
				const overlayContent =
					e.component?.$overlayContent?.()?.[0] ??
					(e.element as HTMLElement)?.querySelector?.('.dx-overlay-content');
				if (overlayContent?.style) {
					overlayContent.style.setProperty('width', `${width}px`, 'important');
					overlayContent.style.setProperty('min-width', `${width}px`, 'important');
				}
			}
		},
	};

	versiones: GenParametroPlantillaVersion[] = [];
	versionSeleccionada: GenParametroPlantillaVersion | null = null;
	cargandoVersiones = false;
	popupNuevaVersionVisible = false;
	motivoNuevaVersion = '';
	guardandoNuevaVersion = false;
	activandoVersion = false;
	readOnly = false;

	protected override etiquetaRegistro = 'la plantilla de correo';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 10;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_PARAMETRO_PLANTILLA';
	protected override mttoCampoEstado = 'ACTIVO_PLANTILLA';
	protected override mttoEstadoDescribeField = 'NOMBRE_PLANTILLA';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Plantillas de Correo';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenParametroPlantillaService,
		private versionService: GenParametroPlantillaVersionService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.model = this.fillData();
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.cargarCuentasSmtp();
		this.cargarModulos();
		this.cargarParametrosDisponibles();
		this.consultar();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		} else if (xEstado === UpdateType.Not_Defined) {
			this.subTituloVentana = 'Consulta de Plantilla';
		} else if (xEstado === UpdateType.Update) {
			this.subTituloVentana = 'Edición de Plantilla';
		} else if (xEstado === UpdateType.Add) {
			this.subTituloVentana = 'Nueva Plantilla';
		}
	}

	// Qué hace: inicializa o mapea el modelo de plantilla con valores por defecto no nulos.
	override fillData(xModel?: GenParametroPlantilla): GenParametroPlantilla {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_PARAMETRO_PLANTILLA: xModel.CORR_PARAMETRO_PLANTILLA,
				CODIGO_PLANTILLA: xModel.CODIGO_PLANTILLA ?? '',
				NOMBRE_PLANTILLA: xModel.NOMBRE_PLANTILLA ?? '',
				ASUNTO_PLANTILLA: xModel.ASUNTO_PLANTILLA ?? '',
				CUERPO_PLANTILLA: xModel.CUERPO_PLANTILLA ?? '',
				CORR_PARAMETRO_SMTP: xModel.CORR_PARAMETRO_SMTP ?? null,
				CORREO_CC: xModel.CORREO_CC ?? '',
				CORREO_CCO: xModel.CORREO_CCO ?? '',
				CODIGO_SISTEMA: xModel.CODIGO_SISTEMA ?? null,
				NOMBRE_SISTEMA: xModel.NOMBRE_SISTEMA ?? '',
				CODIGO_OPCION: xModel.CODIGO_OPCION ?? null,
				NOMBRE_OPCION: xModel.NOMBRE_OPCION ?? '',
				ACTIVO_PLANTILLA: xModel.ACTIVO_PLANTILLA !== undefined ? xModel.ACTIVO_PLANTILLA : true,
				CORREO_REMITENTE: xModel.CORREO_REMITENTE ?? '',
				USUARIO_REMITENTE: xModel.USUARIO_REMITENTE ?? '',
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
			CORR_PARAMETRO_PLANTILLA: 0,
			CODIGO_PLANTILLA: '',
			NOMBRE_PLANTILLA: '',
			ASUNTO_PLANTILLA: '',
			CUERPO_PLANTILLA: '',
			CORR_PARAMETRO_SMTP: null,
			CORREO_CC: '',
			CORREO_CCO: '',
			CODIGO_SISTEMA: null,
			NOMBRE_SISTEMA: '',
			CODIGO_OPCION: null,
			NOMBRE_OPCION: '',
			ACTIVO_PLANTILLA: true,
			CORREO_REMITENTE: '',
			USUARIO_REMITENTE: '',
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	// Qué hace: consulta el listado general de plantillas de correo registradas.
	consultar(): void {
		this.model = this.fillData();
		this.consultarMtto({
			load: () => this.service.getAll({}),
			onData: () => {
				this.ordenarModelsPorCorr();
			},
		});
	}

	private ordenarModelsPorCorr(): void {
		if (Array.isArray(this.models) && this.models.length > 0) {
			this.models.sort((a: GenParametroPlantilla, b: GenParametroPlantilla) =>
				Number(b.CORR_PARAMETRO_PLANTILLA) - Number(a.CORR_PARAMETRO_PLANTILLA)
			);
		}
	}

	// Qué hace: carga el catálogo de cuentas SMTP disponibles para asignación de remitente.
	// Cómo lo hace: consulta el LookUp GetCORR_PARAMETRO_SMTP_GEN_PARAMETRO_PLANTILLA a través de appInfoService bajo la política de plantillas.
	private cargarCuentasSmtp(): void {
		this.appInfoService
			.getLookUp(
				'GEN_PARAMETRO_PLANTILLA',
				'GEN_PARAMETRO_SMTP',
				'GetCORR_PARAMETRO_SMTP',
				undefined,
				environment.UrlGENERALAPI
			)
			.subscribe({
				next: (res: any) => {
					if (res?.Result && Array.isArray(res.Data)) {
						this.mSMTPS = res.Data.sort((a: any, b: any) => Number(b.Key) - Number(a.Key));
					} else {
						this.mSMTPS = [];
					}
				},
				error: () => {
					this.mSMTPS = [];
				},
			});
	}

	// Qué hace: ajusta dinámicamente el ancho del menú desplegable al abrirse.
	// Cómo lo hace: obtiene el offsetWidth del selector dx-select-box y sobreescribe con important el width: auto del editor de texto.
	onSmtpOpened(e: any): void {
		const width = e.element?.offsetWidth;
		if (width) {
			if (e.component?._popup) {
				e.component._popup.option('width', width);
			}
			const overlayContent =
				e.component?._popup?.$overlayContent?.()?.[0] ??
				(document.querySelector('.smtp-select-popup-wrapper .dx-overlay-content') as HTMLElement) ??
				(document.querySelector('.dx-selectbox-popup-wrapper .dx-overlay-content') as HTMLElement);
			if (overlayContent?.style) {
				overlayContent.style.setProperty('width', `${width}px`, 'important');
				overlayContent.style.setProperty('min-width', `${width}px`, 'important');
			}
		}
	}

	// Qué hace: carga la lista de módulos / sistemas registrados excluyendo las opciones de configuración de correo.
	// Cómo lo hace: consulta el servicio y mapea a Key/Value filtrando opciones de configuración de plantillas.
	private cargarModulos(): void {
		this.service.getModulos().subscribe({
			next: (res) => {
				if (res?.Result && Array.isArray(res.Data)) {
					this.mSISTEMAS = res.Data
						.filter((x: any) => (x.Key ?? x.CODIGO_SISTEMA) !== 'GEN_PARAMETRO_PLANTILLA')
						.map((x: any) => ({
							Key: x.Key ?? x.CODIGO_SISTEMA,
							Value: x.Value ?? x.NOMBRE_SISTEMA ?? x.CODIGO_SISTEMA,
						}));
				}
			},
			error: () => {
				this.mSISTEMAS = [];
			}
		});
	}

	// Qué hace: reacciona al cambio de módulo cargando sus opciones de menú permitidas.
	// Cómo lo hace: invoca getOpcionesPorModulo filtrando opciones de configuración de plantillas y mantiene actualizados los parámetros disponibles.
	onModuloChange(e: any): void {
		const codigoSistema = e?.value;
		this.mOPCIONES = [];
		if (!codigoSistema) {
			this.model.CODIGO_OPCION = null;
			this.cargarParametrosDisponibles();
			return;
		}

		this.cargarParametrosDisponibles('', codigoSistema);

		this.service.getOpcionesPorModulo(codigoSistema).subscribe({
			next: (res) => {
				if (res?.Result && Array.isArray(res.Data)) {
					this.mOPCIONES = res.Data
						.filter((x: any) => !['GEN_PARAMETRO_PLANTILLA', 'GEN_PARAMETRO_SMTP'].includes(x.Key ?? x.CODIGO_OPCION))
						.map((x: any) => ({
							Key: x.Key ?? x.CODIGO_OPCION,
							Value: x.Value ?? x.NOMBRE_OPCION ?? x.CODIGO_OPCION,
						}));
				}
			},
			error: () => {
				this.mOPCIONES = [];
			}
		});
	}

	// Qué hace: actualiza los parámetros disponibles del proceso cuando el usuario cambia la opción seleccionada.
	// Cómo lo hace: si se limpia la opción recarga los parámetros institucionales, y si se selecciona carga las columnas de BD de esa opción.
	onOpcionChange(e: any): void {
		const codigoOpcion = e?.value;
		if (!codigoOpcion) {
			this.cargarParametrosDisponibles('', this.model.CODIGO_SISTEMA ?? undefined);
			return;
		}
		this.cargarParametrosDisponibles(codigoOpcion, this.model.CODIGO_SISTEMA ?? undefined);
	}

	// Qué hace: consulta los parámetros disponibles (institucionales fijos y columnas de la opción seleccionada).
	// Cómo lo hace: invoca el endpoint GetParametrosDisponibles de la API enviando opción y módulo opcionales para recibir variables institucionales y de BD.
	private cargarParametrosDisponibles(codigoOpcion?: string, codigoSistema?: string): void {
		const opcion = codigoOpcion ?? this.model?.CODIGO_OPCION ?? '';
		const sistema = codigoSistema ?? this.model?.CODIGO_SISTEMA ?? '';

		this.service.getParametrosDisponibles(opcion || undefined, sistema || undefined).subscribe({
			next: (res) => {
				if (res?.Result && Array.isArray(res.Data)) {
					// Qué hace: normaliza los parámetros dinámicos admitiendo propiedades en minúsculas y mayúsculas.
					// Cómo lo hace: resuelve en cascada key, label, descripción y tipo para poblar las tarjetas del editor.
					this.parametrosDisponibles = res.Data.map((x: any) => ({
						key: x.key ?? x.Key ?? x.CODIGO_PARAMETRO ?? '',
						label: x.label ?? x.Label ?? x.Value ?? x.NOMBRE_PARAMETRO ?? x.key ?? x.Key ?? '',
						descripcion: x.descripcion ?? x.DESCRIPCION ?? '',
						tipo: x.tipo ?? x.TIPO ?? 'TEXTO',
					}));
				} else {
					this.parametrosDisponibles = [];
				}
			},
			error: () => {
				this.parametrosDisponibles = [];
			}
		});
	}

	override nuevo(): void {
		this.readOnly = false;
		this.model = this.fillData();
		this.versiones = [];
		this.versionSeleccionada = null;
		this.mOPCIONES = [];
		this.cargarParametrosDisponibles();
		this.AsignaStatus(UpdateType.Add);
	}

	editar(data: any): void {
		if (!data?.CORR_PARAMETRO_PLANTILLA) return;
		this.readOnly = false;
		this.model = this.fillData(data);
		this.AsignaStatus(UpdateType.Update);
		if (this.model.CODIGO_SISTEMA) {
			this.service.getOpcionesPorModulo(this.model.CODIGO_SISTEMA).subscribe({
				next: (res) => {
					if (res?.Result && Array.isArray(res.Data)) {
						this.mOPCIONES = res.Data.map((x: any) => ({
							Key: x.Key ?? x.CODIGO_OPCION,
							Value: x.Value ?? x.NOMBRE_OPCION ?? x.CODIGO_OPCION,
						}));
					}
				}
			});
		}
		this.cargarParametrosDisponibles();
		this.cargarVersiones(this.model.CORR_PARAMETRO_PLANTILLA);
	}

	onEditClick(e: any): void {
		const row = e?.row?.data ?? e?.data;
		this.readOnly = false;
		this.editar(row);
	}

	// Qué hace: abre la plantilla seleccionada en modo solo lectura al hacer doble clic en el grid.
	// Cómo lo hace: activa el estado de consulta (Not_Defined) mediante super.rowDblClick, marca readOnly en true, carga el modelo, sus catálogos dependientes y versiones bloqueando edición.
	override rowDblClick(e: any): void {
		const row = e?.row?.data ?? e?.data;
		if (!row?.CORR_PARAMETRO_PLANTILLA) return;
		this.readOnly = true;
		this.model = this.fillData(row);
		this.modelUpdate = this.fillData(row);
		super.rowDblClick(e);
		if (this.model.CODIGO_SISTEMA) {
			this.service.getOpcionesPorModulo(this.model.CODIGO_SISTEMA).subscribe({
				next: (res) => {
					if (res?.Result && Array.isArray(res.Data)) {
						this.mOPCIONES = res.Data.map((x: any) => ({
							Key: x.Key ?? x.CODIGO_OPCION,
							Value: x.Value ?? x.NOMBRE_OPCION ?? x.CODIGO_OPCION,
						}));
					}
				}
			});
		}
		this.cargarParametrosDisponibles();
		this.cargarVersiones(this.model.CORR_PARAMETRO_PLANTILLA);
	}

	// Qué hace: valida las condiciones previas y confirma si se registrará como plantilla genérica.
	// Cómo lo hace: si no tiene módulo ni menú alerta al usuario mediante confirm modal antes de persistir, bloqueando modificaciones posteriores.
	guardar(): void {
		if (!this.service.esValido(this.model, this.notifyFx.bind(this))) return;

		const esNuevo = !this.model?.CORR_PARAMETRO_PLANTILLA || this.model.CORR_PARAMETRO_PLANTILLA === 0;
		const esGenerica = (!this.model?.CODIGO_SISTEMA || this.model.CODIGO_SISTEMA.trim() === '') &&
			(!this.model?.CODIGO_OPCION || this.model.CODIGO_OPCION.trim() === '');

		if (esNuevo && esGenerica) {
			const dialog = custom({
				showTitle: false,
				messageHtml: `
					<div class="confirm-generica-modal-content" style="font-family: inherit; color: inherit; padding: 4px 2px;">
						<!-- Cabecera con indicador dorado y título -->
						<div style="display: flex; align-items: center; margin-bottom: 14px;">
							<span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #f59e0b; margin-right: 10px; flex-shrink: 0; box-shadow: 0 0 8px rgba(245, 158, 11, 0.45);"></span>
							<h3 style="margin: 0; font-size: 17px; font-weight: 700; color: inherit; letter-spacing: -0.2px;">Confirmación de Guardado</h3>
						</div>

						<!-- Caja destacada en Modo Genérico -->
						<div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; font-size: 13.5px; line-height: 1.5;">
							<span style="font-weight: 700; color: #f59e0b;">Modo Genérico:</span>
							<span> Al no indicar módulo, el sistema registrará la plantilla con parámetros globales para uso general.</span>
						</div>

						<!-- Texto descriptivo intermedio -->
						<p style="margin: 0 0 14px 0; font-size: 13.5px; line-height: 1.5; opacity: 0.85;">
							Tenga en cuenta que esta configuración inicial no podrá asociarse a un módulo más adelante.
						</p>

						<!-- Pregunta final -->
						<p style="margin: 0; font-size: 14px; font-weight: 700; color: inherit;">
							¿Desea guardar la plantilla ahora?
						</p>
					</div>
				`,
				popupOptions: {
					width: 580,
					maxWidth: '92vw',
					position: { my: 'center', at: 'center' },
					wrapperAttr: { class: 'confirm-generica-dialog-wrapper' },
				},
				buttons: [
					{
						text: 'Cancelar',
						stylingMode: 'text',
						type: 'normal',
						onClick: () => false,
					},
					{
						text: 'Sí, Guardar',
						stylingMode: 'contained',
						type: 'default',
						onClick: () => true,
					},
				],
			} as any);

			dialog.show().then((aceptado: boolean) => {
				if (aceptado) {
					this.ejecutarGuardado(esNuevo);
				}
			});
			return;
		}

		this.ejecutarGuardado(esNuevo);
	}

	// Qué hace: ejecuta la persistencia de la plantilla (insert o update) y mantiene el parche en memoria.
	// Cómo lo hace: inserta o actualiza según esNuevo, crea automáticamente la versión 1 inicial y refresca la lista local sin GetAll.
	private ejecutarGuardado(esNuevo: boolean): void {
		if (esNuevo) {
			this.service.insert(this.model).subscribe({
				next: (response) => {
					if (!response?.Result) {
						this.notifyFx(response?.ErrorMessage || 'Error al guardar la plantilla.', NotifyType.Error);
						return;
					}
					const registroGuardado = response.Data ?? this.model;
					this.model = this.fillData(registroGuardado);

					// Crear automáticamente la Versión 1 inicial
					const versionInicial: GenParametroPlantillaVersion = {
						CORR_EMPRESA: this.model.CORR_EMPRESA,
						CORR_PARAMETRO_PLANTILLA: this.model.CORR_PARAMETRO_PLANTILLA,
						NUMERO_VERSION: 1,
						ASUNTO_PLANTILLA: this.model.ASUNTO_PLANTILLA,
						CUERPO_PLANTILLA: this.model.CUERPO_PLANTILLA,
						CORREO_CC: this.model.CORREO_CC,
						CORREO_CCO: this.model.CORREO_CCO,
						ES_VERSION_ACTIVA: true,
						MOTIVO_VERSION: 'Versión inicial de plantilla de correo.',
					};

					this.versionService.crearVersion(versionInicial).subscribe({
						next: () => {
							this.cargarVersiones(this.model.CORR_PARAMETRO_PLANTILLA);
						}
					});

					this.models = [this.model, ...(this.models || [])];
					this.ordenarModelsPorCorr();
					this.notifyFx('Plantilla de correo guardada con éxito.', NotifyType.Success);
					this.AsignaStatus(UpdateType.Browse);
				},
				error: (err) => {
					this.notifyFx(err?.message || 'Error al persistir la plantilla.', NotifyType.Error);
				}
			});
		} else {
			// En edición, actualizar plantilla y reflejar en memoria
			this.service.update(this.model).subscribe({
				next: (response) => {
					if (!response?.Result) {
						this.notifyFx(response?.ErrorMessage || 'Error al actualizar la plantilla.', NotifyType.Error);
						return;
					}
					const registroActualizado = response.Data ?? this.model;
					this.model = this.fillData(registroActualizado);

					const idx = this.models.findIndex(m => m.CORR_PARAMETRO_PLANTILLA === this.model.CORR_PARAMETRO_PLANTILLA);
					if (idx !== -1) {
						this.models[idx] = { ...this.model };
						this.models = [...this.models];
					}

					this.notifyFx('Plantilla de correo actualizada con éxito.', NotifyType.Success);
					this.AsignaStatus(UpdateType.Browse);
				},
				error: (err) => {
					this.notifyFx(err?.message || 'Error al persistir cambios en la plantilla.', NotifyType.Error);
				}
			});
		}
	}

	override cancelar(): void {
		this.readOnly = false;
		this.AsignaStatus(UpdateType.Browse);
	}

	rowRemoving(e: any): void {
		e.cancel = true;
		const row = e.data;
		confirm('¿Está seguro de eliminar esta plantilla de correo?', 'Confirmación').then((ok) => {
			if (!ok) return;
			this.service.delete(row).subscribe({
				next: (res) => {
					if (res?.Result) {
						this.models = this.models.filter(m => m.CORR_PARAMETRO_PLANTILLA !== row.CORR_PARAMETRO_PLANTILLA);
						this.notifyFx('Plantilla eliminada con éxito.', NotifyType.Success);
					} else {
						this.notifyFx(res?.ErrorMessage || 'No se pudo eliminar la plantilla.', NotifyType.Error);
					}
				},
				error: (err) => {
					this.notifyFx(err?.message || 'Error al eliminar la plantilla.', NotifyType.Error);
				}
			});
		});
	}

	// === CONTROL DE VERSIONES ===

	tienePrimeraVersionGuardada(): boolean {
		return !!this.model?.CORR_PARAMETRO_PLANTILLA &&
			this.model.CORR_PARAMETRO_PLANTILLA > 0 &&
			Array.isArray(this.versiones) &&
			this.versiones.length > 0;
	}

	esVersionActivaSeleccionada(): boolean {
		if (!this.tienePrimeraVersionGuardada()) return true;
		return !!this.versionSeleccionada?.ES_VERSION_ACTIVA;
	}

	// Qué hace: determina si los campos de cabecera (código, módulo, menú) deben quedar bloqueados.
	// Cómo lo hace: evalúa si el registro ya fue guardado en la base de datos (CORR_PARAMETRO_PLANTILLA > 0).
	esCabeceraBloqueada(): boolean {
		return !!this.model?.CORR_PARAMETRO_PLANTILLA && this.model.CORR_PARAMETRO_PLANTILLA > 0;
	}

	// Qué hace: determina si la cabecera ya se encuentra fijada en la base de datos.
	// Cómo lo hace: delega la verificación al método esCabeceraBloqueada para conservar retrocompatibilidad.
	tieneModuloYProcesoFijado(): boolean {
		return this.esCabeceraBloqueada();
	}

	// Qué hace: determina si la vista se encuentra en modo solo lectura.
	// Cómo lo hace: verifica si la bandera local readOnly está activa o si el mantenimiento está en modo consulta (isConsulta).
	esSoloLectura(): boolean {
		return this.readOnly || this.isConsulta();
	}

	// Qué hace: determina si el editor HTML está habilitado para edición.
	// Cómo lo hace: requiere que no esté en modo solo lectura, que la cabecera esté fijada y que la versión seleccionada sea la activa.
	esEditorHabilitado(): boolean {
		if (this.esSoloLectura()) return false;
		if (!this.esCabeceraBloqueada()) return false;
		if (this.tienePrimeraVersionGuardada() && !this.esVersionActivaSeleccionada()) return false;
		return true;
	}

	formatVersionDisplay = (item: GenParametroPlantillaVersion): string => {
		if (!item) return '';
		const estado = item.ES_VERSION_ACTIVA ? ' (Activa)' : ' (Histórica)';
		const fecha = item.FECHA_CREA ? ` - ${new Date(item.FECHA_CREA).toLocaleDateString()}` : '';
		return `Versión ${item.NUMERO_VERSION}${estado}${fecha}`;
	};

	cargarVersiones(corrParametroPlantilla: number): void {
		this.cargandoVersiones = true;
		this.versionService.getAll(corrParametroPlantilla).subscribe({
			next: (res) => {
				this.cargandoVersiones = false;
				if (res?.Result && Array.isArray(res.Data)) {
					this.versiones = res.Data;
					const activa = this.versiones.find(v => v.ES_VERSION_ACTIVA);
					this.versionSeleccionada = activa || this.versiones[0] || null;
				} else {
					this.versiones = [];
					this.versionSeleccionada = null;
				}
			},
			error: () => {
				this.cargandoVersiones = false;
				this.versiones = [];
				this.versionSeleccionada = null;
			}
		});
	}

	onVersionSelectionChange(e: any): void {
		const num = e?.value;
		if (!num || !this.versiones) return;
		const encontrada = this.versiones.find(v => v.NUMERO_VERSION === num);
		if (encontrada) {
			this.versionSeleccionada = encontrada;
			this.model.ASUNTO_PLANTILLA = encontrada.ASUNTO_PLANTILLA;
			this.model.CUERPO_PLANTILLA = encontrada.CUERPO_PLANTILLA;
			this.model.CORREO_CC = encontrada.CORREO_CC ?? '';
			this.model.CORREO_CCO = encontrada.CORREO_CCO ?? '';
		}
	}

	abrirModalNuevaVersion(): void {
		this.motivoNuevaVersion = '';
		this.popupNuevaVersionVisible = true;
	}

	cerrarModalNuevaVersion(): void {
		this.popupNuevaVersionVisible = false;
		this.motivoNuevaVersion = '';
	}

	confirmarNuevaVersion(): void {
		if (!this.versionService.esValidaNuevaVersion(this.motivoNuevaVersion, this.notifyFx.bind(this))) return;

		this.guardandoNuevaVersion = true;
		const nuevaVersionPayload: GenParametroPlantillaVersion = {
			CORR_EMPRESA: this.model.CORR_EMPRESA,
			CORR_PARAMETRO_PLANTILLA: this.model.CORR_PARAMETRO_PLANTILLA,
			NUMERO_VERSION: 0,
			ASUNTO_PLANTILLA: this.model.ASUNTO_PLANTILLA,
			CUERPO_PLANTILLA: this.model.CUERPO_PLANTILLA,
			CORREO_CC: this.model.CORREO_CC,
			CORREO_CCO: this.model.CORREO_CCO,
			ES_VERSION_ACTIVA: true,
			MOTIVO_VERSION: this.motivoNuevaVersion.trim(),
		};

		this.versionService.crearVersion(nuevaVersionPayload).subscribe({
			next: (res) => {
				this.guardandoNuevaVersion = false;
				if (res?.Result) {
					this.cerrarModalNuevaVersion();
					this.notifyFx('Nueva versión creada y establecida como activa.', NotifyType.Success);
					this.cargarVersiones(this.model.CORR_PARAMETRO_PLANTILLA);
				} else {
					this.notifyFx(res?.ErrorMessage || 'Error al crear la nueva versión.', NotifyType.Error);
				}
			},
			error: (err) => {
				this.guardandoNuevaVersion = false;
				this.notifyFx(err?.message || 'Error al procesar la nueva versión.', NotifyType.Error);
			}
		});
	}

	activarVersionSeleccionada(): void {
		if (!this.versionSeleccionada || this.versionSeleccionada.ES_VERSION_ACTIVA) return;

		confirm(`¿Desea activar la Versión ${this.versionSeleccionada.NUMERO_VERSION} como la versión vigente de envío?`, 'Activar Versión').then((ok) => {
			if (!ok) return;
			this.activandoVersion = true;
			this.versionService.activarVersion(this.model.CORR_PARAMETRO_PLANTILLA, this.versionSeleccionada!.NUMERO_VERSION).subscribe({
				next: (res) => {
					this.activandoVersion = false;
					if (res?.Result) {
						this.notifyFx(`Versión ${this.versionSeleccionada!.NUMERO_VERSION} activada con éxito.`, NotifyType.Success);
						this.cargarVersiones(this.model.CORR_PARAMETRO_PLANTILLA);
					} else {
						this.notifyFx(res?.ErrorMessage || 'Error al activar la versión.', NotifyType.Error);
					}
				},
				error: (err) => {
					this.activandoVersion = false;
					this.notifyFx(err?.message || 'Error al activar la versión.', NotifyType.Error);
				}
			});
		});

	}

	cargarFormatoBaseUEES(): void {
		if (!this.esEditorHabilitado()) return;
		this.model.CUERPO_PLANTILLA = this.service.obtenerFormatoBaseUEES();
		this.notifyFx('Formato institucional base de la UEES cargado en el editor.', NotifyType.Success);
	}

	limpiarEditor(): void {
		if (!this.esEditorHabilitado()) return;
		this.model.CUERPO_PLANTILLA = '';
	}
}
