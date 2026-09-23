import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { confirm } from 'devextreme/ui/dialog';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

import {
	OPERACION_FLUJO_MOVIMIENTO,
	ScMovimientoPersonal,
} from './models/sc-movimiento-personal';
import { ScMovimientoPersonalService } from './sc-movimiento-personal.service';

@Component({
	selector: 'app-sc-movimiento-personal',
	templateUrl: './sc-movimiento-personal.component.html',
	styleUrls: ['./sc-movimiento-personal.component.scss'],
})
export class ScMovimientoPersonalComponent extends CBaseComponent implements OnInit {
	protected override etiquetaRegistro = 'el movimiento de personal';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_MOVIMIENTO_PERSONAL';
	protected override mttoPageSize = 15;
	protected override mttoPageSizes = [15, 25, 50, 100];

	//#region Declarando Variables
	readOnly = false;
	enviandoMovimiento = false;
	confirmandoMovimiento = false;
	btnEnviarMovimiento = '';
	btnConfirmarMovimiento = '';
	/** Fecha efectiva editable solo cuando Confirmar está habilitado. */
	puedeEditarFechaEfectiva = false;
	requisicionAsociada: any = null;
	avisoIngresoVisible = false;
	private avisoIngresoTimer: ReturnType<typeof setTimeout> | null = null;
	private ultimaFechaIngresoMs: number | null = null;

	/** Lookups compartidos (unidad / modalidad / empleado); puestos van por lado. */
	mCORR_UNIDAD: any[] = [];
	/** Padres distintos (gerencia) para la posición propuesta. */
	mGerenciaPropuesta: any[] = [];
	/** Departamentos hijos de la gerencia elegida. */
	mUnidadPropuesta: any[] = [];
	/** CORR del padre elegido; no se persiste (el texto queda en GERENCIA_PROPUESTA). */
	corrGerenciaPropuesta = 0;
	mCORR_TIPO_MODALIDAD: any[] = [];
	mCORR_PUESTO_ACTUAL: any[] = [];
	mCORR_PUESTO_PROPUESTO: any[] = [];
	mCORR_EMPLEADO: any[] = [];

	unidadLookupColumns = [
		{ dataField: 'CODIGO_UNIDAD', caption: 'Código', width: 100 },
		{ dataField: 'NOMBRE_UNIDAD', caption: 'Unidad', width: 280 },
	];
	puestoLookupColumns = [
		{ dataField: 'CORR_PUESTO', caption: 'Corr.', width: 80 },
		{ dataField: 'NOMBRE_PUESTO', caption: 'Puesto', width: 280 },
	];
	modalidadLookupColumns = [
		{ dataField: 'CORR_TIPO_MODALIDAD', caption: 'Corr.', width: 80 },
		{ dataField: 'MODALIDAD_NOMBRE', caption: 'Modalidad', width: 220 },
	];
	empleadoLookupColumns = [
		{ dataField: 'CODIGO_EMPLEADO', caption: 'Código', width: 90 },
		{ dataField: 'NOMBRE_COMPLETO', caption: 'Nombre', width: 280 },
		{ dataField: 'NUMERO_ID', caption: 'Documento', width: 120 },
		{ dataField: 'NOMBRE_UNIDAD_ACTUAL', caption: 'Unidad', width: 220 },
		{ dataField: 'NOMBRE_PUESTO_ACTUAL', caption: 'Puesto', width: 200 },
	];

	modelsBitacora: any[] = [];
	columnsBitacora: any[] = [];
	//#endregion

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScMovimientoPersonalService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems('DIRECTO');
		this.columnsBitacora = this.service.getBitacoraColumns();
	}

	//#region Inicializando Opciones
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones(): void {}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		this.refrescarBotones();
		if (xEstado === UpdateType.Browse) {
			this.modelsBitacora = [];
		} else {
			this.refrescarItemsFormulario();
		}
	}
	//#endregion

	//#region Manejo de Combos
	llenaComboBox(): void {
		this.getCORR_UNIDAD();
		this.getCORR_TIPO_MODALIDAD();
		this.getCORR_EMPLEADO();
	}

	/** Unidades efectivas del usuario (SP PRAL_DATA_SC_UNIDADES_USUARIO vía API propia). */
	getCORR_UNIDAD(): void {
		this.appInfoService
			.getLookUp(
				'SC_MOVIMIENTO_PERSONAL',
				'SC_MOVIMIENTO_PERSONAL',
				'GetCORR_UNIDAD',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_UNIDAD = response?.Result ? response.Data ?? [] : [];
					this.armarGerenciasPropuesta();
					if (!this.isBrowse()) {
						this.aplicarPadreDesdeUnidadPropuesta();
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getCORR_TIPO_MODALIDAD(): void {
		this.appInfoService
			.getLookUp(
				'SC_MOVIMIENTO_PERSONAL',
				'SC_MOVIMIENTO_PERSONAL',
				'GetCORR_TIPO_MODALIDAD',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_TIPO_MODALIDAD = response?.Result ? response.Data ?? [] : [];
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	/** Empleados activos + posición vigente (lookup nuevo de esta pantalla). */
	getCORR_EMPLEADO(): void {
		this.appInfoService
			.getLookUp(
				'SC_MOVIMIENTO_PERSONAL',
				'SC_MOVIMIENTO_PERSONAL',
				'GetCORR_EMPLEADO',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_EMPLEADO = response?.Result ? response.Data ?? [] : [];
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getCORR_PUESTO_ACTUAL(
		corrUnidad?: number,
		corrPuestoPreferido?: number,
		nombrePuestoPreferido?: string
	): void {
		const unidad = corrUnidad ?? this.model?.CORR_UNIDAD_ACTUAL;
		if (!unidad || unidad <= 0) {
			this.mCORR_PUESTO_ACTUAL = [];
			return;
		}

		const puestoKeep = Number(corrPuestoPreferido ?? this.model?.CORR_PUESTO_ACTUAL) || 0;
		const nombreKeep =
			nombrePuestoPreferido ?? this.model?.NOMBRE_PUESTO_ACTUAL ?? '';

		this.appInfoService
			.getLookUp(
				'SC_MOVIMIENTO_PERSONAL',
				'SC_MOVIMIENTO_PERSONAL',
				'GetCORR_PUESTO',
				[{ Parameter: 'CORR_UNIDAD', Value: unidad }],
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const data = response?.Result ? response.Data ?? [] : [];
					this.mCORR_PUESTO_ACTUAL = data;
					if (
						puestoKeep > 0
						&& !data.some((p: any) => Number(p.CORR_PUESTO) === puestoKeep)
					) {
						this.mCORR_PUESTO_ACTUAL = [
							...data,
							{
								CORR_UNIDAD: unidad,
								CORR_PUESTO: puestoKeep,
								NOMBRE_PUESTO: nombreKeep,
							},
						];
					}
					if (puestoKeep > 0) {
						this.model.CORR_PUESTO_ACTUAL = puestoKeep;
						if (nombreKeep) {
							this.model.NOMBRE_PUESTO_ACTUAL = nombreKeep;
						}
					}
				},
				error: (error: any) => {
					this.asegurarPuestoActualEnLookup(unidad, puestoKeep, nombreKeep);
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	getCORR_PUESTO_PROPUESTO(corrUnidad?: number): void {
		const unidad = corrUnidad ?? this.model?.CORR_UNIDAD_PROPUESTA;
		if (!unidad || unidad <= 0) {
			this.mCORR_PUESTO_PROPUESTO = [];
			return;
		}

		this.appInfoService
			.getLookUp(
				'SC_MOVIMIENTO_PERSONAL',
				'SC_MOVIMIENTO_PERSONAL',
				'GetCORR_PUESTO',
				[{ Parameter: 'CORR_UNIDAD', Value: unidad }],
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_PUESTO_PROPUESTO = response?.Result ? response.Data ?? [] : [];
				},
				error: (error: any) => {
					this.mCORR_PUESTO_PROPUESTO = [];
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	//#endregion

	//#region Metodos Mtto
	fillParam(xCORR_MOVIMIENTO_PERSONAL?: number): any {
		return { CORR_MOVIMIENTO_PERSONAL: xCORR_MOVIMIENTO_PERSONAL ?? 0 };
	}

	override fillData(xModel?: ScMovimientoPersonal): ScMovimientoPersonal {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_MOVIMIENTO_PERSONAL: xModel.CORR_MOVIMIENTO_PERSONAL,
				FECHA_ELABORACION: xModel.FECHA_ELABORACION,
				ORIGEN_MOVIMIENTO: xModel.ORIGEN_MOVIMIENTO,
				CORR_TIPO_CONTRATACION: xModel.CORR_TIPO_CONTRATACION ?? null,
				TIPO_MOVIMIENTO: xModel.TIPO_MOVIMIENTO,
				ESTADO_MOVIMIENTO: xModel.ESTADO_MOVIMIENTO,
				NOMBRE_ESTADO_MOVIMIENTO: xModel.NOMBRE_ESTADO_MOVIMIENTO,
				NOMBRE_TIPO_MOVIMIENTO: xModel.NOMBRE_TIPO_MOVIMIENTO,
				NOMBRE_ORIGEN_MOVIMIENTO: xModel.NOMBRE_ORIGEN_MOVIMIENTO,
				CORR_EMPLEADO: xModel.CORR_EMPLEADO ?? null,
				NOMBRE_COMPLETO: xModel.NOMBRE_COMPLETO,
				NUMERO_ID: xModel.NUMERO_ID,
				FECHA_INGRESO_PROPUESTA: xModel.FECHA_INGRESO_PROPUESTA,
				FECHA_FINALIZACION: xModel.FECHA_FINALIZACION,
				GERENCIA_ACTUAL: xModel.GERENCIA_ACTUAL,
				CORR_UNIDAD_ACTUAL: xModel.CORR_UNIDAD_ACTUAL,
				NOMBRE_UNIDAD_ACTUAL: xModel.NOMBRE_UNIDAD_ACTUAL,
				CORR_PUESTO_ACTUAL: xModel.CORR_PUESTO_ACTUAL,
				NOMBRE_PUESTO_ACTUAL: xModel.NOMBRE_PUESTO_ACTUAL,
				SALARIO_ACTUAL: xModel.SALARIO_ACTUAL,
				CORR_TIPO_MODALIDAD_ACTUAL: xModel.CORR_TIPO_MODALIDAD_ACTUAL,
				NOMBRE_MODALIDAD_ACTUAL: xModel.NOMBRE_MODALIDAD_ACTUAL,
				HORARIO_ACTUAL: xModel.HORARIO_ACTUAL,
				GERENCIA_PROPUESTA: xModel.GERENCIA_PROPUESTA,
				CORR_UNIDAD_PROPUESTA: xModel.CORR_UNIDAD_PROPUESTA,
				NOMBRE_UNIDAD_PROPUESTA: xModel.NOMBRE_UNIDAD_PROPUESTA,
				CORR_PUESTO_PROPUESTO: xModel.CORR_PUESTO_PROPUESTO,
				NOMBRE_PUESTO_PROPUESTO: xModel.NOMBRE_PUESTO_PROPUESTO,
				SALARIO_PROPUESTO: xModel.SALARIO_PROPUESTO,
				CORR_TIPO_MODALIDAD_PROPUESTA: xModel.CORR_TIPO_MODALIDAD_PROPUESTA,
				NOMBRE_MODALIDAD_PROPUESTA: xModel.NOMBRE_MODALIDAD_PROPUESTA,
				HORARIO_PROPUESTO: xModel.HORARIO_PROPUESTO,
				JUSTIFICACION: xModel.JUSTIFICACION,
				FECHA_EFECTIVA: xModel.FECHA_EFECTIVA,
				CONFIRMADO: xModel.CONFIRMADO ?? false,
				NOMBRE_CONFIRMACION: xModel.NOMBRE_CONFIRMACION,
				USUARIO_CONFIRMA: xModel.USUARIO_CONFIRMA ?? null,
				FECHA_CONFIRMA: xModel.FECHA_CONFIRMA ?? null,
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
			};
		}

		return {
			CORR_EMPRESA: 1,
			CORR_MOVIMIENTO_PERSONAL: 0,
			FECHA_ELABORACION: new Date(),
			ORIGEN_MOVIMIENTO: 'DIRECTO',
			CORR_TIPO_CONTRATACION: null,
			TIPO_MOVIMIENTO: 'ASCENSO',
			ESTADO_MOVIMIENTO: 'DI',
			CORR_EMPLEADO: null,
			NOMBRE_COMPLETO: '',
			NUMERO_ID: '',
			FECHA_INGRESO_PROPUESTA: null,
			FECHA_FINALIZACION: null,
			GERENCIA_ACTUAL: '',
			CORR_UNIDAD_ACTUAL: 0,
			NOMBRE_UNIDAD_ACTUAL: '',
			CORR_PUESTO_ACTUAL: 0,
			NOMBRE_PUESTO_ACTUAL: '',
			SALARIO_ACTUAL: 0,
			CORR_TIPO_MODALIDAD_ACTUAL: 0,
			NOMBRE_MODALIDAD_ACTUAL: '',
			HORARIO_ACTUAL: '',
			GERENCIA_PROPUESTA: '',
			CORR_UNIDAD_PROPUESTA: 0,
			NOMBRE_UNIDAD_PROPUESTA: '',
			CORR_PUESTO_PROPUESTO: 0,
			NOMBRE_PUESTO_PROPUESTO: '',
			SALARIO_PROPUESTO: 0,
			CORR_TIPO_MODALIDAD_PROPUESTA: 0,
			NOMBRE_MODALIDAD_PROPUESTA: '',
			HORARIO_PROPUESTO: '',
			JUSTIFICACION: '',
			FECHA_EFECTIVA: null,
			CONFIRMADO: false,
			NOMBRE_CONFIRMACION: 'En Evaluación',
			USUARIO_CONFIRMA: null,
			FECHA_CONFIRMA: null,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	consultar(): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
		});
	}

	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		this.corrGerenciaPropuesta = 0;
		this.mUnidadPropuesta = [];
		this.mCORR_PUESTO_ACTUAL = [];
		this.mCORR_PUESTO_PROPUESTO = [];
		this.requisicionAsociada = null;
		this.avisoIngresoVisible = false;
		this.modelsBitacora = [];
		this.refrescarBotones();
		this.refrescarItemsFormulario();
	}

	/**
	 * Editar solo Borrador/Devuelto; si no, abre en consulta.
	 */
	override editarClick(e: any): void {
		const rowData = e?.row?.data ?? e?.data;
		if (rowData && !this.service.esEstadoEditable(rowData.ESTADO_MOVIMIENTO)) {
			this.abrirEnConsulta(rowData);
			return;
		}
		super.editarClick(e);
		this.readOnly = false;
		this.despuesDeCargarFormulario();
	}

	/** Doble clic siempre abre en consulta (sin Guardar). */
	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		this.abrirEnConsulta(rowData);
	}

	/** Abre el registro en modo consulta (Not_Defined): sin Guardar, campos bloqueados. */
	private abrirEnConsulta(rowData?: any): void {
		if (rowData) {
			this.modelUpdate = { ...rowData };
			this.model = this.fillData(rowData);
		}
		this.AsignaStatus(UpdateType.Not_Defined);
		this.readOnly = true;
		this.despuesDeCargarFormulario();
		setTimeout(() => {
			if (this.dataForm?.instance) {
				this.dataForm.instance.option('formData', this.model);
			}
			this.bloquear();
		}, 0);
	}

	private despuesDeCargarFormulario(): void {
		this.aplicarPadreDesdeUnidadPropuesta();
		if (this.model?.CORR_UNIDAD_ACTUAL > 0) {
			this.getCORR_PUESTO_ACTUAL(this.model.CORR_UNIDAD_ACTUAL);
		}
		if (this.model?.CORR_UNIDAD_PROPUESTA > 0) {
			this.getCORR_PUESTO_PROPUESTO(this.model.CORR_UNIDAD_PROPUESTA);
		}
		this.cargarBitacora();
		this.cargarRequisicionAsociada();
		this.refrescarBotones();
		this.refrescarItemsFormulario();
	}

	/** DIRECTO → solo Empleado; REQUISICION → solo Nombre completo. */
	private refrescarItemsFormulario(): void {
		this.items = this.service.getItems(
			this.model?.ORIGEN_MOVIMIENTO || 'DIRECTO',
			this.model?.CORR_TIPO_CONTRATACION
		);
		setTimeout(() => {
			if (this.dataForm?.instance) {
				this.dataForm.instance.option('items', this.items);
				this.dataForm.instance.option('formData', this.model);
			}
			this.aplicarBloqueoFormulario();
			this.engancharFechaIngreso();
		}, 0);
	}

	override getPermiteEditar(e: any): boolean {
		const data = e?.row?.data ?? e?.data;
		return this.permiteEdit && this.service.esEstadoEditable(data?.ESTADO_MOVIMIENTO);
	}

	override getPermiteDele(e: any): boolean {
		const data = e?.row?.data ?? e?.data;
		return this.permiteDele && `${data?.ESTADO_MOVIMIENTO || ''}`.toUpperCase() === 'DI';
	}

	guardar(): void {
		if (
			this.banderaMtto !== UpdateType.Add
			&& !this.service.esEstadoEditable(this.model?.ESTADO_MOVIMIENTO)
		) {
			this.notifyFx('Solo se puede modificar un movimiento en Borrador o Devuelto.', NotifyType.Warning);
			return;
		}

		/* Los combos escriben en el modelo. El formulario, al guardar, vuelve a
		   poner sus valores encima. Hay que pasarle antes lo que eligieron. */
		this.volcarCombosAlFormulario();

		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	override cancelar(): void {
		super.cancelar(
			(item: any) => item.CORR_MOVIMIENTO_PERSONAL === this.modelUpdate.CORR_MOVIMIENTO_PERSONAL
		);
		this.refrescarBotones();
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_MOVIMIENTO_PERSONAL)),
		});
	}

	override bloquear(): void {
		this.readOnly = true;
		setTimeout(() => this.aplicarBloqueoFormulario(), 0);
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm?.instance?.getEditor('CORR_MOVIMIENTO_PERSONAL')?.option('readOnly', true);
			this.dataForm?.instance?.getEditor('ORIGEN_MOVIMIENTO')?.option('readOnly', true);
		}, 0);
	}

	override setFocus(): void {
		setTimeout(() => {
			if (`${this.model?.ORIGEN_MOVIMIENTO || ''}`.toUpperCase() === 'DIRECTO') {
				this.dataForm?.instance?.getEditor('CORR_EMPLEADO')?.focus();
			} else {
				this.dataForm?.instance?.getEditor('NOMBRE_COMPLETO')?.focus();
			}
		});
	}

	/** Textos de botones de proceso (barra). */
	refrescarBotones(): void {
		const puedeEnviar =
			!this.isBrowse()
			&& (this.model?.CORR_MOVIMIENTO_PERSONAL ?? 0) > 0
			&& this.service.esEstadoEnviable(this.model?.ESTADO_MOVIMIENTO)
			&& !this.readOnly;

		this.btnEnviarMovimiento = puedeEnviar ? 'Enviar a aprobación' : '';

		/* Confirmar: disponible en formulario o con fila enfocada en el grid. */
		const puedeConfirmar =
			(this.model?.CORR_MOVIMIENTO_PERSONAL ?? 0) > 0
			&& this.service.esConfirmable(this.model);

		this.btnConfirmarMovimiento = puedeConfirmar ? 'Confirmar' : '';
		this.puedeEditarFechaEfectiva = puedeConfirmar;
	}

	/** En browse, al seleccionar fila se habilita Confirmar en la barra. */
	override focusedRowChanged(e: any): void {
		super.focusedRowChanged(e);
		this.refrescarBotones();
	}

	cargarBitacora(): void {
		const corr = this.model?.CORR_MOVIMIENTO_PERSONAL ?? 0;
		if (corr <= 0) {
			this.modelsBitacora = [];
			return;
		}

		this.service
			.getBitacora(this.fillParam(corr))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.modelsBitacora = response?.Result ? response.Data ?? [] : [];
					if (!response?.Result && response?.ErrorMessage) {
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.modelsBitacora = [];
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	/** Envía el movimiento al flujo (DI/OB → SO). Requiere SEG_FLUJO configurado. */
	async enviarMovimiento(): Promise<void> {
		if (this.enviandoMovimiento) {
			return;
		}

		const motivo = this.motivoNoPuedeEnviar();
		if (motivo) {
			this.notifyFx(motivo, NotifyType.Warning);
			return;
		}

		const aceptar = await confirm(
			'¿Desea enviar este movimiento de personal a aprobación?',
			'Enviar movimiento'
		);
		if (!aceptar) {
			return;
		}

		const corr = Number(this.model?.CORR_MOVIMIENTO_PERSONAL) || 0;
		const unidad = Number(this.model?.CORR_UNIDAD_PROPUESTA) || null;

		this.enviandoMovimiento = true;
		this.loadingVisible = true;

		this.service
			.autoriza({
				CORR_MOVIMIENTO_PERSONAL: corr,
				OPERACION: OPERACION_FLUJO_MOVIMIENTO.ENVIAR,
				OBSERVACION: 'Se envió el movimiento de personal a aprobación.',
				CORR_UNIDAD_DOCUMENTO: unidad,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.enviandoMovimiento = false;
					this.loadingVisible = false;

					if (response?.Result && response.ErrorCode === 0) {
						const row = response.Data as ScMovimientoPersonal;
						if (row) {
							this.model = this.fillData(row);
							this.modelUpdate = this.fillData(row);
							const idx = this.models?.findIndex(
								(m: any) => m.CORR_MOVIMIENTO_PERSONAL === corr
							);
							if (idx >= 0) {
								this.models[idx] = { ...this.models[idx], ...row };
							}
						}
						this.cargarBitacora();
						this.notifyFx('El movimiento se envió a aprobación correctamente.', NotifyType.Success);
						this.AsignaStatus(UpdateType.Browse);
					} else {
						this.notifyFx(
							response?.ErrorMessage || 'No se pudo enviar el movimiento a aprobación.',
							NotifyType.Warning,
							{ raw: true }
						);
					}
				},
				error: (error: any) => {
					this.enviandoMovimiento = false;
					this.loadingVisible = false;
					this.notifyFx(this.extraerMensajeError(error), NotifyType.Warning, { raw: true });
				},
			});
	}

	private motivoNoPuedeEnviar(): string | null {
		if (this.isBrowse()) {
			return 'Abra un movimiento para enviarlo a aprobación.';
		}
		if ((this.model?.CORR_MOVIMIENTO_PERSONAL ?? 0) <= 0) {
			return 'Guarde el movimiento antes de enviarlo a aprobación.';
		}
		if (!this.service.esEstadoEnviable(this.model?.ESTADO_MOVIMIENTO)) {
			return 'Solo se puede enviar un movimiento en Borrador o Devuelto.';
		}
		return null;
	}

	/** Confirma el movimiento (CONFIRMADO=1 + FECHA_EFECTIVA + auditoría). */
	async confirmarMovimiento(): Promise<void> {
		if (this.confirmandoMovimiento) {
			return;
		}

		const motivo = this.motivoNoPuedeConfirmar();
		if (motivo) {
			this.notifyFx(motivo, NotifyType.Warning);
			return;
		}

		if (!this.model?.FECHA_EFECTIVA) {
			this.notifyFx(
				'Debe indicar la fecha efectiva antes de confirmar el movimiento.',
				NotifyType.Warning
			);
			return;
		}

		const aceptar = await confirm(
			'¿Desea confirmar este movimiento de personal?',
			'Confirmar movimiento'
		);
		if (!aceptar) {
			return;
		}

		const corr = Number(this.model?.CORR_MOVIMIENTO_PERSONAL) || 0;
		this.confirmandoMovimiento = true;
		this.loadingVisible = true;

		this.service
			.confirmar({
				CORR_MOVIMIENTO_PERSONAL: corr,
				FECHA_EFECTIVA: this.model.FECHA_EFECTIVA,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.confirmandoMovimiento = false;
					this.loadingVisible = false;

					if (response?.Result && response.ErrorCode === 0) {
						const row = response.Data as ScMovimientoPersonal;
						if (row) {
							this.model = this.fillData(row);
							this.modelUpdate = this.fillData(row);
							const idx = this.models?.findIndex(
								(m: any) => m.CORR_MOVIMIENTO_PERSONAL === corr
							);
							if (idx >= 0) {
								this.models[idx] = { ...this.models[idx], ...row };
							}
						}
						this.refrescarBotones();
						this.notifyFx('El movimiento se confirmó correctamente.', NotifyType.Success);
					} else {
						this.notifyFx(
							response?.ErrorMessage || 'No se pudo confirmar el movimiento.',
							NotifyType.Warning,
							{ raw: true }
						);
					}
				},
				error: (error: any) => {
					this.confirmandoMovimiento = false;
					this.loadingVisible = false;
					this.notifyFx(this.extraerMensajeErrorConfirmacion(error), NotifyType.Warning, {
						raw: true,
					});
				},
			});
	}

	private motivoNoPuedeConfirmar(): string | null {
		if ((this.model?.CORR_MOVIMIENTO_PERSONAL ?? 0) <= 0) {
			return 'Seleccione o abra un movimiento para confirmarlo.';
		}
		if (this.service.esConfirmado(this.model?.CONFIRMADO)) {
			return 'El movimiento ya está confirmado.';
		}

		const origen = `${this.model?.ORIGEN_MOVIMIENTO || ''}`.trim().toUpperCase();
		const estado = `${this.model?.ESTADO_MOVIMIENTO || ''}`.trim().toUpperCase();

		if (origen === 'DIRECTO' && estado !== 'AP') {
			return 'Los movimientos creados desde cero solo se pueden confirmar cuando están Aprobados.';
		}
		if (origen !== 'DIRECTO' && origen !== 'REQUISICION') {
			return 'Origen de movimiento no válido para confirmar.';
		}
		if (this.esEventualRequisicion() && !this.model?.FECHA_INGRESO_PROPUESTA) {
			return 'Indique la fecha de ingreso propuesta para calcular la fecha de finalización antes de confirmar.';
		}
		return null;
	}

	private extraerMensajeError(error: any): string {
		if (typeof error === 'string') {
			return error.replace(/^\s*Error:\s*/i, '').trim();
		}
		const msg = error?.error?.ErrorMessage || error?.ErrorMessage || error?.message || '';
		return (
			String(msg).replace(/^\s*Error:\s*/i, '').trim()
			|| 'No se pudo enviar el movimiento a aprobación.'
		);
	}

	private extraerMensajeErrorConfirmacion(error: any): string {
		if (typeof error === 'string') {
			return error.replace(/^\s*Error:\s*/i, '').trim();
		}
		const msg = error?.error?.ErrorMessage || error?.ErrorMessage || error?.message || '';
		return (
			String(msg).replace(/^\s*Error:\s*/i, '').trim()
			|| 'No se pudo confirmar el movimiento.'
		);
	}

	getEstadoLabel(estado?: string): string {
		return this.service.getEstadoLabel(estado ?? this.model?.ESTADO_MOVIMIENTO);
	}

	getEstadoBadgeClass(estado?: string): string {
		return this.service.getEstadoBadgeClass(estado ?? this.model?.ESTADO_MOVIMIENTO);
	}

	get esOrigenRequisicion(): boolean {
		return `${this.model?.ORIGEN_MOVIMIENTO || ''}`.trim().toUpperCase() === 'REQUISICION';
	}

	esEventualRequisicion(): boolean {
		return this.esOrigenRequisicion && Number(this.requisicionAsociada?.CORR_TIPO_CONTRATACION) === 2;
	}

	cerrarAvisoIngreso(): void {
		this.avisoIngresoVisible = false;
		if (this.avisoIngresoTimer) {
			clearTimeout(this.avisoIngresoTimer);
			this.avisoIngresoTimer = null;
		}
	}

	private cargarRequisicionAsociada(): void {
		this.requisicionAsociada = null;
		this.cerrarAvisoIngreso();
		const corr = Number(this.model?.CORR_MOVIMIENTO_PERSONAL) || 0;
		if (!this.esOrigenRequisicion || corr <= 0) {
			return;
		}

		this.service.getRequisicionAsociada(corr).pipe(take(1)).subscribe({
			next: (response: any) => {
				const data = response?.Result ? response.Data ?? null : null;
				this.requisicionAsociada = Array.isArray(data) ? data[0] ?? null : data;
				if (this.requisicionAsociada) {
					this.model.CORR_TIPO_CONTRATACION = this.requisicionAsociada.CORR_TIPO_CONTRATACION;
				}
				this.ultimaFechaIngresoMs = this.fechaAMs(this.model?.FECHA_INGRESO_PROPUESTA);
				this.refrescarItemsFormulario();
				this.mostrarAvisoIngresoSiFalta();
			},
			error: () => {
				this.requisicionAsociada = null;
			},
		});
	}

	private mostrarAvisoIngresoSiFalta(): void {
		if (!this.esEventualRequisicion() || this.model?.FECHA_INGRESO_PROPUESTA || this.service.esConfirmado(this.model?.CONFIRMADO)) {
			return;
		}
		this.avisoIngresoVisible = true;
		this.avisoIngresoTimer = setTimeout(() => this.cerrarAvisoIngreso(), 8000);
	}

	private aplicarBloqueoFormulario(): void {
		const form = this.dataForm?.instance;
		if (!form || !this.readOnly) {
			return;
		}
		form.option('readOnly', true);
		if (this.esEventualRequisicion() && !this.service.esConfirmado(this.model?.CONFIRMADO)) {
			form.getEditor('FECHA_INGRESO_PROPUESTA')?.option('readOnly', false);
		}
	}

	private engancharFechaIngreso(): void {
		const editor = this.dataForm?.instance?.getEditor('FECHA_INGRESO_PROPUESTA');
		if (!editor) {
			return;
		}
		editor.off('valueChanged', this.onFechaIngresoEditor);
		editor.on('valueChanged', this.onFechaIngresoEditor);
	}

	private readonly onFechaIngresoEditor = (e: any): void => {
		this.onFechaIngresoChanged(e?.value);
	};

	private onFechaIngresoChanged(value: Date | string | null): void {
		if (!this.esEventualRequisicion() || this.service.esConfirmado(this.model?.CONFIRMADO)) {
			return;
		}
		const ms = this.fechaAMs(value);
		if (ms === this.ultimaFechaIngresoMs) {
			return;
		}
		this.ultimaFechaIngresoMs = ms;
		this.model.FECHA_INGRESO_PROPUESTA = value ? new Date(value) : null;
		const meses = Number(this.requisicionAsociada?.TIEMPO_CONTRATO) || 0;
		this.model.FECHA_FINALIZACION = value && meses > 0 ? this.sumarMeses(new Date(value), meses) : null;
		this.dataForm?.instance?.updateData('FECHA_FINALIZACION', this.model.FECHA_FINALIZACION);

		const corr = Number(this.model?.CORR_MOVIMIENTO_PERSONAL) || 0;
		if (corr <= 0) {
			return;
		}
		this.service.registrarFechaIngreso({
			CORR_MOVIMIENTO_PERSONAL: corr,
			FECHA_INGRESO_PROPUESTA: this.model.FECHA_INGRESO_PROPUESTA,
		}).pipe(take(1)).subscribe({
			next: (response: any) => {
				if (!response?.Result) {
					this.notifyFx(response?.ErrorMessage || 'No se pudo calcular la fecha de finalización.', NotifyType.Warning);
					return;
				}
				const row = response.Data;
				if (row) {
					this.model.FECHA_INGRESO_PROPUESTA = row.FECHA_INGRESO_PROPUESTA;
					this.model.FECHA_FINALIZACION = row.FECHA_FINALIZACION;
					this.ultimaFechaIngresoMs = this.fechaAMs(row.FECHA_INGRESO_PROPUESTA);
					this.dataForm?.instance?.updateData('FECHA_FINALIZACION', this.model.FECHA_FINALIZACION);
				}
			},
			error: (error: any) => this.notifyFx(this.extraerMensajeError(error), NotifyType.Warning, { raw: true }),
		});
	}

	private fechaAMs(value: Date | string | null | undefined): number | null {
		if (!value) {
			return null;
		}
		const fecha = new Date(value);
		if (Number.isNaN(fecha.getTime())) {
			return null;
		}
		fecha.setHours(0, 0, 0, 0);
		return fecha.getTime();
	}

	private sumarMeses(fecha: Date, meses: number): Date {
		const dia = fecha.getDate();
		const resultado = new Date(fecha.getFullYear(), fecha.getMonth() + meses, 1);
		const ultimo = new Date(resultado.getFullYear(), resultado.getMonth() + 1, 0).getDate();
		resultado.setDate(Math.min(dia, ultimo));
		return resultado;
	}
	//#endregion

	//#region Lookups selected
	selectedLookUpCORR_EMPLEADO = (vRow: any): any => {
		const row = vRow?.[0];
		if (!row) {
			return 0;
		}

		const corrUnidad = Number(row.CORR_UNIDAD_ACTUAL) || 0;
		const corrPuesto = Number(row.CORR_PUESTO_ACTUAL) || 0;
		const corrModalidad = Number(row.CORR_TIPO_MODALIDAD_ACTUAL) || 0;

		this.model.CORR_EMPLEADO = Number(row.CORR_EMPLEADO) || 0;
		this.model.NOMBRE_COMPLETO = row.NOMBRE_COMPLETO ?? '';
		this.model.NUMERO_ID = row.NUMERO_ID ?? '';
		this.model.GERENCIA_ACTUAL = row.GERENCIA_ACTUAL ?? '';
		this.model.CORR_UNIDAD_ACTUAL = corrUnidad;
		this.model.NOMBRE_UNIDAD_ACTUAL = row.NOMBRE_UNIDAD_ACTUAL ?? '';
		this.model.CORR_PUESTO_ACTUAL = corrPuesto;
		this.model.NOMBRE_PUESTO_ACTUAL = row.NOMBRE_PUESTO_ACTUAL ?? '';
		this.model.SALARIO_ACTUAL = row.SALARIO_ACTUAL ?? 0;
		this.model.CORR_TIPO_MODALIDAD_ACTUAL = corrModalidad;
		this.model.NOMBRE_MODALIDAD_ACTUAL = row.NOMBRE_MODALIDAD_ACTUAL ?? '';
		this.model.HORARIO_ACTUAL = row.HORARIO_ACTUAL ?? '';

		/* Sembrar lookups para que el displayExpr pinte de inmediato (sin esperar el GET). */
		this.asegurarUnidadEnLookup(corrUnidad, row.NOMBRE_UNIDAD_ACTUAL);
		this.asegurarPuestoActualEnLookup(corrUnidad, corrPuesto, row.NOMBRE_PUESTO_ACTUAL);

		if (corrUnidad > 0) {
			this.getCORR_PUESTO_ACTUAL(corrUnidad, corrPuesto, row.NOMBRE_PUESTO_ACTUAL);
		} else {
			this.mCORR_PUESTO_ACTUAL = [];
		}

		setTimeout(() => this.refrescarFormularioEnSitio(), 0);

		return this.model.CORR_EMPLEADO;
	};

	selectedLookUpCORR_UNIDAD_ACTUAL = (vRow: any): any => {
		const row = vRow?.[0];
		const corr = Number(row?.CORR_UNIDAD) || 0;
		this.model.CORR_UNIDAD_ACTUAL = corr;
		this.model.NOMBRE_UNIDAD_ACTUAL = row?.DISPLAY_UNIDAD || this.formatUnidadDisplay(row);
		this.model.GERENCIA_ACTUAL = row?.GERENCIA_DISPLAY ?? '';
		this.model.CORR_PUESTO_ACTUAL = 0;
		this.model.NOMBRE_PUESTO_ACTUAL = '';
		this.mCORR_PUESTO_ACTUAL = [];
		setTimeout(() => this.getCORR_PUESTO_ACTUAL(corr), 0);
		return corr;
	};

	selectedLookUpCORR_GERENCIA_PROPUESTA = (vRow: any): any => {
		const row = vRow?.[0];
		const corr = Number(row?.CORR_UNIDAD) || 0;
		const cambio = corr !== this.corrGerenciaPropuesta;
		this.corrGerenciaPropuesta = corr;
		this.model.GERENCIA_PROPUESTA = row?.DISPLAY_UNIDAD || this.formatUnidadDisplay(row);
		this.dataForm?.instance?.updateData('GERENCIA_PROPUESTA', this.model.GERENCIA_PROPUESTA);
		this.filtrarUnidadesPropuesta(corr);
		if (cambio) {
			this.model.CORR_UNIDAD_PROPUESTA = 0;
			this.model.NOMBRE_UNIDAD_PROPUESTA = '';
			this.model.CORR_PUESTO_PROPUESTO = 0;
			this.model.NOMBRE_PUESTO_PROPUESTO = '';
			this.mCORR_PUESTO_PROPUESTO = [];
		}
		return corr;
	};

	selectedLookUpCORR_UNIDAD_PROPUESTA = (vRow: any): any => {
		const row = vRow?.[0];
		const corr = Number(row?.CORR_UNIDAD) || 0;
		this.model.CORR_UNIDAD_PROPUESTA = corr;
		this.model.NOMBRE_UNIDAD_PROPUESTA = row?.DISPLAY_UNIDAD || this.formatUnidadDisplay(row);
		if (row?.GERENCIA_DISPLAY) {
			this.model.GERENCIA_PROPUESTA = row.GERENCIA_DISPLAY;
		}
		this.model.CORR_PUESTO_PROPUESTO = 0;
		this.model.NOMBRE_PUESTO_PROPUESTO = '';
		this.mCORR_PUESTO_PROPUESTO = [];
		setTimeout(() => this.getCORR_PUESTO_PROPUESTO(corr), 0);
		return corr;
	};

	selectedLookUpCORR_PUESTO_ACTUAL = (vRow: any): any => {
		const row = vRow?.[0];
		this.model.NOMBRE_PUESTO_ACTUAL = row?.NOMBRE_PUESTO ?? '';
		return Number(row?.CORR_PUESTO) || 0;
	};

	selectedLookUpCORR_PUESTO_PROPUESTO = (vRow: any): any => {
		const row = vRow?.[0];
		this.model.NOMBRE_PUESTO_PROPUESTO = row?.NOMBRE_PUESTO ?? '';
		return Number(row?.CORR_PUESTO) || 0;
	};

	selectedLookUpCORR_TIPO_MODALIDAD_ACTUAL = (vRow: any): any => {
		const row = vRow?.[0];
		this.model.NOMBRE_MODALIDAD_ACTUAL = row?.MODALIDAD_NOMBRE ?? '';
		return Number(row?.CORR_TIPO_MODALIDAD) || 0;
	};

	selectedLookUpCORR_TIPO_MODALIDAD_PROPUESTA = (vRow: any): any => {
		const row = vRow?.[0];
		this.model.NOMBRE_MODALIDAD_PROPUESTA = row?.MODALIDAD_NOMBRE ?? '';
		return Number(row?.CORR_TIPO_MODALIDAD) || 0;
	};

	/**
	 * Pasa al formulario los valores que viven en los combos.
	 * Sin esto, Guardar conserva salario y horario, y borra gerencia, departamento y cargo.
	 */
	private volcarCombosAlFormulario(): void {
		if (this.corrGerenciaPropuesta > 0 && !`${this.model?.GERENCIA_PROPUESTA || ''}`.trim()) {
			const gerencia = (this.mGerenciaPropuesta || []).find(
				(g) => Number(g.CORR_UNIDAD) === Number(this.corrGerenciaPropuesta)
			);
			this.model.GERENCIA_PROPUESTA = gerencia?.DISPLAY_UNIDAD || this.formatUnidadDisplay(gerencia);
		}

		this.dataForm?.instance?.updateData({
			CORR_EMPLEADO: this.model.CORR_EMPLEADO,
			NOMBRE_COMPLETO: this.model.NOMBRE_COMPLETO,
			NUMERO_ID: this.model.NUMERO_ID,
			CORR_UNIDAD_ACTUAL: this.model.CORR_UNIDAD_ACTUAL,
			NOMBRE_UNIDAD_ACTUAL: this.model.NOMBRE_UNIDAD_ACTUAL,
			CORR_PUESTO_ACTUAL: this.model.CORR_PUESTO_ACTUAL,
			NOMBRE_PUESTO_ACTUAL: this.model.NOMBRE_PUESTO_ACTUAL,
			CORR_TIPO_MODALIDAD_ACTUAL: this.model.CORR_TIPO_MODALIDAD_ACTUAL,
			NOMBRE_MODALIDAD_ACTUAL: this.model.NOMBRE_MODALIDAD_ACTUAL,
			GERENCIA_PROPUESTA: this.model.GERENCIA_PROPUESTA,
			CORR_UNIDAD_PROPUESTA: this.model.CORR_UNIDAD_PROPUESTA,
			NOMBRE_UNIDAD_PROPUESTA: this.model.NOMBRE_UNIDAD_PROPUESTA,
			CORR_PUESTO_PROPUESTO: this.model.CORR_PUESTO_PROPUESTO,
			NOMBRE_PUESTO_PROPUESTO: this.model.NOMBRE_PUESTO_PROPUESTO,
			CORR_TIPO_MODALIDAD_PROPUESTA: this.model.CORR_TIPO_MODALIDAD_PROPUESTA,
			NOMBRE_MODALIDAD_PROPUESTA: this.model.NOMBRE_MODALIDAD_PROPUESTA,
		});
	}

	/** Actualiza las cajas del formulario sin reemplazar el objeto de datos. */
	private refrescarFormularioEnSitio(): void {
		this.dataForm?.instance?.updateData(this.model);
	}

	/** Padres distintos de las unidades del usuario (combo Gerencia propuesta). */
	private armarGerenciasPropuesta(): void {
		const porCorr = new Map<number, any>();
		for (const unidad of this.mCORR_UNIDAD || []) {
			const padre = Number(unidad?.CORR_UNIDAD_PADRE) || 0;
			if (padre <= 0 || porCorr.has(padre)) {
				continue;
			}
			const filaPadre = (this.mCORR_UNIDAD || []).find((u) => Number(u.CORR_UNIDAD) === padre);
			if (filaPadre) {
				porCorr.set(padre, {
					CORR_UNIDAD: padre,
					CODIGO_UNIDAD: filaPadre.CODIGO_UNIDAD,
					NOMBRE_UNIDAD: filaPadre.NOMBRE_UNIDAD,
					DISPLAY_UNIDAD: filaPadre.DISPLAY_UNIDAD || this.formatUnidadDisplay(filaPadre),
				});
				continue;
			}
			const display = `${unidad.GERENCIA_DISPLAY || ''}`.trim();
			const partes = display.includes(' - ') ? display.split(' - ') : [display];
			porCorr.set(padre, {
				CORR_UNIDAD: padre,
				CODIGO_UNIDAD: partes.length > 1 ? partes[0] : '',
				NOMBRE_UNIDAD: partes.length > 1 ? partes.slice(1).join(' - ') : display,
				DISPLAY_UNIDAD: display,
			});
		}
		this.mGerenciaPropuesta = [...porCorr.values()].sort((a, b) =>
			`${a.DISPLAY_UNIDAD}`.localeCompare(`${b.DISPLAY_UNIDAD}`)
		);
	}

	/** Departamentos cuyo padre es la gerencia elegida. */
	private filtrarUnidadesPropuesta(corrPadre: number, corrUnidadKeep?: number): void {
		const padre = Number(corrPadre) || 0;
		if (padre <= 0) {
			this.mUnidadPropuesta = [];
			return;
		}
		const hijos = (this.mCORR_UNIDAD || []).filter((u) => Number(u.CORR_UNIDAD_PADRE) === padre);
		const keep = Number(corrUnidadKeep) || 0;
		if (keep > 0 && !hijos.some((u) => Number(u.CORR_UNIDAD) === keep)) {
			const row = (this.mCORR_UNIDAD || []).find((u) => Number(u.CORR_UNIDAD) === keep);
			if (row) {
				hijos.push(row);
			}
		}
		this.mUnidadPropuesta = hijos;
	}

	/** Al abrir un movimiento, la gerencia sale del padre de la unidad guardada. */
	private aplicarPadreDesdeUnidadPropuesta(): void {
		this.armarGerenciasPropuesta();
		const unidad = Number(this.model?.CORR_UNIDAD_PROPUESTA) || 0;
		if (unidad <= 0) {
			this.corrGerenciaPropuesta = 0;
			this.mUnidadPropuesta = [];
			return;
		}
		const row = (this.mCORR_UNIDAD || []).find((u) => Number(u.CORR_UNIDAD) === unidad);
		const padre = Number(row?.CORR_UNIDAD_PADRE) || 0;
		this.corrGerenciaPropuesta = padre;
		if (row?.GERENCIA_DISPLAY) {
			this.model.GERENCIA_PROPUESTA = row.GERENCIA_DISPLAY;
		}
		this.filtrarUnidadesPropuesta(padre, unidad);
	}

	private formatUnidadDisplay(row: any): string {
		if (!row) {
			return '';
		}
		const codigo = `${row.CODIGO_UNIDAD || ''}`.trim();
		const nombre = `${row.NOMBRE_UNIDAD || ''}`.trim();
		if (codigo && nombre) {
			return `${codigo} - ${nombre}`;
		}
		return nombre || codigo;
	}

	/** Si la unidad del empleado no está en el combo del usuario, la inserta para poder mostrarla. */
	private asegurarUnidadEnLookup(corrUnidad: number, display?: string): void {
		if (corrUnidad <= 0) {
			return;
		}
		const exists = this.mCORR_UNIDAD?.some((u) => Number(u.CORR_UNIDAD) === corrUnidad);
		if (exists) {
			return;
		}
		const texto = `${display || ''}`.trim();
		const partes = texto.includes(' - ') ? texto.split(' - ') : [texto];
		this.mCORR_UNIDAD = [
			...(this.mCORR_UNIDAD || []),
			{
				CORR_UNIDAD: corrUnidad,
				CODIGO_UNIDAD: partes.length > 1 ? partes[0] : '',
				NOMBRE_UNIDAD: partes.length > 1 ? partes.slice(1).join(' - ') : texto,
				DISPLAY_UNIDAD: texto,
				GERENCIA_DISPLAY: this.model.GERENCIA_ACTUAL || '',
			},
		];
	}

	/** Siembra el cargo actual para que el lookup muestre el texto de inmediato. */
	private asegurarPuestoActualEnLookup(
		corrUnidad: number,
		corrPuesto: number,
		nombrePuesto?: string
	): void {
		if (corrPuesto <= 0) {
			this.mCORR_PUESTO_ACTUAL = [];
			return;
		}
		this.mCORR_PUESTO_ACTUAL = [
			{
				CORR_UNIDAD: corrUnidad,
				CORR_PUESTO: corrPuesto,
				NOMBRE_PUESTO: nombrePuesto || '',
			},
		];
	}
	//#endregion
}
