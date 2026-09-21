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
	btnEnviarMovimiento = '';

	/** Lookups compartidos (unidad / modalidad); puestos van por lado. */
	mCORR_UNIDAD: any[] = [];
	mCORR_TIPO_MODALIDAD: any[] = [];
	mCORR_PUESTO_ACTUAL: any[] = [];
	mCORR_PUESTO_PROPUESTO: any[] = [];

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
		this.items = this.service.getItems();
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
		}
	}
	//#endregion

	//#region Manejo de Combos
	llenaComboBox(): void {
		this.getCORR_UNIDAD();
		this.getCORR_TIPO_MODALIDAD();
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

	getCORR_PUESTO_ACTUAL(corrUnidad?: number): void {
		const unidad = corrUnidad ?? this.model?.CORR_UNIDAD_ACTUAL;
		if (!unidad || unidad <= 0) {
			this.mCORR_PUESTO_ACTUAL = [];
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
					this.mCORR_PUESTO_ACTUAL = response?.Result ? response.Data ?? [] : [];
				},
				error: (error: any) => {
					this.mCORR_PUESTO_ACTUAL = [];
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
				TIPO_MOVIMIENTO: xModel.TIPO_MOVIMIENTO,
				ESTADO_MOVIMIENTO: xModel.ESTADO_MOVIMIENTO,
				NOMBRE_ESTADO_MOVIMIENTO: xModel.NOMBRE_ESTADO_MOVIMIENTO,
				NOMBRE_TIPO_MOVIMIENTO: xModel.NOMBRE_TIPO_MOVIMIENTO,
				NOMBRE_ORIGEN_MOVIMIENTO: xModel.NOMBRE_ORIGEN_MOVIMIENTO,
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
			TIPO_MOVIMIENTO: 'PERMANENTE',
			ESTADO_MOVIMIENTO: 'DI',
			NOMBRE_COMPLETO: '',
			NUMERO_ID: '',
			FECHA_INGRESO_PROPUESTA: null,
			FECHA_FINALIZACION: null,
			GERENCIA_ACTUAL: '',
			CORR_UNIDAD_ACTUAL: 0,
			CORR_PUESTO_ACTUAL: 0,
			SALARIO_ACTUAL: 0,
			CORR_TIPO_MODALIDAD_ACTUAL: 0,
			HORARIO_ACTUAL: '',
			GERENCIA_PROPUESTA: '',
			CORR_UNIDAD_PROPUESTA: 0,
			CORR_PUESTO_PROPUESTO: 0,
			SALARIO_PROPUESTO: 0,
			CORR_TIPO_MODALIDAD_PROPUESTA: 0,
			HORARIO_PROPUESTO: '',
			JUSTIFICACION: '',
			FECHA_EFECTIVA: null,
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
		this.mCORR_PUESTO_ACTUAL = [];
		this.mCORR_PUESTO_PROPUESTO = [];
		this.modelsBitacora = [];
		this.refrescarBotones();
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
		if (this.model?.CORR_UNIDAD_ACTUAL > 0) {
			this.getCORR_PUESTO_ACTUAL(this.model.CORR_UNIDAD_ACTUAL);
		}
		if (this.model?.CORR_UNIDAD_PROPUESTA > 0) {
			this.getCORR_PUESTO_PROPUESTO(this.model.CORR_UNIDAD_PROPUESTA);
		}
		this.cargarBitacora();
		this.refrescarBotones();
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
			this.dataForm?.instance?.getEditor('NOMBRE_COMPLETO')?.focus();
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

	getEstadoLabel(estado?: string): string {
		return this.service.getEstadoLabel(estado ?? this.model?.ESTADO_MOVIMIENTO);
	}

	getEstadoBadgeClass(estado?: string): string {
		return this.service.getEstadoBadgeClass(estado ?? this.model?.ESTADO_MOVIMIENTO);
	}
	//#endregion

	//#region Lookups selected
	selectedLookUpCORR_UNIDAD_ACTUAL = (vRow: any): any => {
		const corr = vRow[0].CORR_UNIDAD;
		this.model.CORR_PUESTO_ACTUAL = 0;
		this.mCORR_PUESTO_ACTUAL = [];
		setTimeout(() => this.getCORR_PUESTO_ACTUAL(corr), 0);
		return corr;
	};

	selectedLookUpCORR_UNIDAD_PROPUESTA = (vRow: any): any => {
		const corr = vRow[0].CORR_UNIDAD;
		this.model.CORR_PUESTO_PROPUESTO = 0;
		this.mCORR_PUESTO_PROPUESTO = [];
		setTimeout(() => this.getCORR_PUESTO_PROPUESTO(corr), 0);
		return corr;
	};

	selectedLookUpCORR_PUESTO_ACTUAL = (vRow: any): any => vRow[0].CORR_PUESTO;
	selectedLookUpCORR_PUESTO_PROPUESTO = (vRow: any): any => vRow[0].CORR_PUESTO;
	selectedLookUpCORR_TIPO_MODALIDAD = (vRow: any): any => vRow[0].CORR_TIPO_MODALIDAD;
	//#endregion
}
