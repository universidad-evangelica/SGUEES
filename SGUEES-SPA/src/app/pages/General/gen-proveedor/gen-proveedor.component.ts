import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataLookupComponent } from 'src/app/layouts/data-lookup/data-lookup.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenProveedor } from './models/gen-proveedor';
import { GenProveedorService } from './gen-proveedor.service';

@Component({
	selector: 'app-gen-proveedor',
	templateUrl: './gen-proveedor.component.html',
	styleUrls: ['./gen-proveedor.component.scss'],
})
export class GenProveedorComponent extends CBaseComponent implements OnInit, OnDestroy {
	@ViewChild('personaLookup') personaLookup?: DataLookupComponent;
	@ViewChild('previewPanel') previewPanelRef?: ElementRef<HTMLElement>;
	@ViewChild('previewBody') previewBodyRef?: ElementRef<HTMLDivElement>;

	protected override etiquetaRegistro = 'el proveedor';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_PROVEEDOR';
	protected override mttoCampoEstado = 'ACTIVO_PROVEEDOR';
	protected override mttoEstadoDescribeField = 'NOMBRE_COMERCIAL';

	//#region <Declarando Variables>
	mCORR_PERSONA: any;
	mCORR_BANCO: any;
	mCORR_FORMA_PAGO: any;
	mCORR_CONDICION_PAGO: any;
	readOnly = false;
	personaLookupColumns = [
		{ dataField: 'CODIGO_PERSONA', caption: 'Código', width: 120 },
		{ dataField: 'NOMBRE_PERSONA', caption: 'Nombre', width: 280 },
		{ dataField: 'NOMBRE_TIPO_PERSONERIA', caption: 'Personería', width: 110 },
	];

	/** Panel lateral: datos de persona (solo consulta desde el grid). */
	previewPanelVisible = false;
	previewPanelAbierto = false;
	previewProveedor: GenProveedor | null = null;
	private previewPanelCloseTimer: ReturnType<typeof setTimeout> | null = null;
	private previewWheelHandler: ((e: WheelEvent) => void) | null = null;
	// #endregion

	/** Activar/Desactivar solo si hay fila del grid con PK válida (no el model vacío del form). */
	get estadoToolbarFocusedRow(): Record<string, unknown> | null {
		if (!this.isBrowse()) {
			return null;
		}
		const row = this.obtenerFilaSeleccionada();
		return row ? (row as Record<string, unknown>) : null;
	}

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenProveedorService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
		this.selectedLookUpCORR_PERSONA = this.selectedLookUpCORR_PERSONA.bind(this);
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	ngOnDestroy(): void {
		this.clearPreviewPanelCloseTimer();
		this.unbindPreviewWheel();
	}

	inicializaOpciones() {}
	// #endregion

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado !== UpdateType.Browse) {
			this.cerrarPreviewPanel(false);
		}
	}

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getCORR_PERSONA();
		this.getCORR_BANCO();
		this.getCORR_FORMA_PAGO();
		this.getCORR_CONDICION_PAGO();
	}

	getCORR_PERSONA(corrPersonaIncluir?: number) {
		this.service
			.getPersonas({ CORR_PERSONA: corrPersonaIncluir ?? 0 })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_PERSONA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	getCORR_BANCO() {
		this.appInfoService
			.getLookUp('GEN_PROVEEDOR', 'GEN_BANCO', 'GetCORR_BANCO', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_BANCO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	getCORR_FORMA_PAGO() {
		this.appInfoService
			.getLookUp('GEN_PROVEEDOR', 'GEN_FORMA_PAGO', 'GetCORR_FORMA_PAGO', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_FORMA_PAGO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	getCORR_CONDICION_PAGO() {
		this.appInfoService
			.getLookUp('GEN_PROVEEDOR', 'COM_CONDICION_PAGO', 'GetCORR_CONDICION_PAGO', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_CONDICION_PAGO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_PROVEEDOR?: number): any {
		return {
			CORR_PROVEEDOR: xCORR_PROVEEDOR ?? 0,
		};
	}

	override fillData(xModel?: GenProveedor): GenProveedor {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_PROVEEDOR: xModel.CORR_PROVEEDOR,
				CORR_PERSONA: xModel.CORR_PERSONA ?? 0,
				CODIGO_PROVEEDOR: xModel.CODIGO_PROVEEDOR,
				TIPO_PERSONERIA: xModel.TIPO_PERSONERIA,
				NOMBRE_TIPO_PERSONERIA: xModel.NOMBRE_TIPO_PERSONERIA,
				NOMBRE_PROVEEDOR: xModel.NOMBRE_PROVEEDOR,
				NOMBRE_COMERCIAL: xModel.NOMBRE_COMERCIAL ?? '',
				CORR_FORMA_PAGO: xModel.CORR_FORMA_PAGO,
				CUENTA_BANCARIA: xModel.CUENTA_BANCARIA,
				CORR_BANCO: xModel.CORR_BANCO,
				ESTADO_PROVEEDOR: xModel.ESTADO_PROVEEDOR,
				ACTIVO_PROVEEDOR: !!xModel.ACTIVO_PROVEEDOR || xModel.ESTADO_PROVEEDOR === 'A',
				ESTADO_PROVEEDOR_WEB: xModel.ESTADO_PROVEEDOR_WEB || 'D',
				CORR_CONDICION_PAGO: xModel.CORR_CONDICION_PAGO,
			};
		}

		return {
			CORR_EMPRESA: this.appInfoService.CORR_EMPRESA,
			CORR_PROVEEDOR: 0,
			CORR_PERSONA: 0,
			CODIGO_PROVEEDOR: '',
			TIPO_PERSONERIA: '',
			NOMBRE_TIPO_PERSONERIA: '',
			NOMBRE_PROVEEDOR: '',
			NOMBRE_COMERCIAL: '',
			CORR_FORMA_PAGO: 0,
			CUENTA_BANCARIA: '',
			CORR_BANCO: 0,
			ESTADO_PROVEEDOR: 'A',
			ACTIVO_PROVEEDOR: true,
			ESTADO_PROVEEDOR_WEB: 'D',
			CORR_CONDICION_PAGO: 0,
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
		this.cerrarPreviewPanel(false);
		this.getCORR_PERSONA(0);
		super.nuevo();
	}

	override editarClick(e: any): void {
		const row = e?.row?.data ?? e?.data ?? this.model;
		this.cerrarPreviewPanel(false);
		this.getCORR_PERSONA(row?.CORR_PERSONA ?? 0);
		super.editarClick(e);
	}

	/** Clic en fila del browse → panel lateral con datos de persona (solo lectura). */
	onGridRowClick(e: any): void {
		if (!this.isBrowse() || e?.rowType !== 'data' || !e?.data) {
			return;
		}

		const target = e?.event?.target as HTMLElement | null;
		if (
			target?.closest(
				'.dx-command-edit, .dx-link, .dx-button, button, a, .dx-checkbox, .dx-dropdowneditor-button',
			)
		) {
			return;
		}

		this.abrirPreviewPanel(e.data as GenProveedor);
	}

	abrirPreviewPanel(row: GenProveedor): void {
		const corr = Number(row?.CORR_PROVEEDOR ?? 0);
		if (corr <= 0) {
			return;
		}

		this.clearPreviewPanelCloseTimer();
		this.previewProveedor = { ...row };
		this.previewPanelVisible = true;
		requestAnimationFrame(() => {
			this.previewPanelAbierto = true;
			// *ngIf ya pintó el aside; el listener debe ir después del render.
			setTimeout(() => this.bindPreviewWheel(), 0);
		});
	}

	cerrarPreviewPanel(animar = true): void {
		this.clearPreviewPanelCloseTimer();
		this.unbindPreviewWheel();

		if (!animar || !this.previewPanelVisible) {
			this.previewPanelAbierto = false;
			this.previewPanelVisible = false;
			this.previewProveedor = null;
			return;
		}

		this.previewPanelAbierto = false;
		this.previewPanelCloseTimer = setTimeout(() => {
			this.previewPanelVisible = false;
			this.previewProveedor = null;
			this.previewPanelCloseTimer = null;
		}, 280);
	}

	/**
	 * Contiene el scroll del mouse en el panel: evita que el wheel mueva el layout/grid.
	 * Requiere listener no-pasivo para poder preventDefault.
	 */
	private bindPreviewWheel(): void {
		this.unbindPreviewWheel();
		const panel = this.previewPanelRef?.nativeElement;
		if (!panel) {
			return;
		}

		this.previewWheelHandler = (e: WheelEvent) => {
			e.preventDefault();
			e.stopPropagation();
			const body = this.previewBodyRef?.nativeElement;
			if (body) {
				body.scrollTop += e.deltaY;
			}
		};
		panel.addEventListener('wheel', this.previewWheelHandler, { passive: false });
	}

	private unbindPreviewWheel(): void {
		const panel = this.previewPanelRef?.nativeElement;
		if (panel && this.previewWheelHandler) {
			panel.removeEventListener('wheel', this.previewWheelHandler);
		}
		this.previewWheelHandler = null;
	}

	abrirDetalleDesdePreview(): void {
		if (!this.previewProveedor) {
			return;
		}
		const data = this.previewProveedor;
		this.cerrarPreviewPanel(false);
		this.rowDblClick({ data, row: { data } });
	}

	textoLectura(valor: unknown): string {
		if (valor === null || valor === undefined) {
			return '—';
		}
		const text = String(valor).trim();
		return text || '—';
	}

	private clearPreviewPanelCloseTimer(): void {
		if (this.previewPanelCloseTimer) {
			clearTimeout(this.previewPanelCloseTimer);
			this.previewPanelCloseTimer = null;
		}
	}

	guardar(): void {
		this.model.ESTADO_PROVEEDOR = this.model.ACTIVO_PROVEEDOR ? 'A' : 'I';
		this.guardarMtto({
			esValido: () => this.validarYEnfocar(),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	/** Valida negocio y enfoca el primer campo faltante (Persona o Código). */
	private validarYEnfocar(): boolean {
		const ok = this.service.esValido(this.model, this.notifyFx.bind(this));
		if (!ok) {
			this.enfocarCampoRequerido();
		}
		return ok;
	}

	private enfocarCampoRequerido(): void {
		setTimeout(() => {
			if (!this.model?.CORR_PERSONA || this.model.CORR_PERSONA <= 0) {
				// Template lookup: el dx-form no pinta el "!"; lo marcamos en el drop-down.
				this.personaLookup?.markInvalid('La persona es obligatoria');
				this.personaLookup?.focus();
				return;
			}
			
			this.personaLookup?.markValid();
			if (!this.model?.CODIGO_PROVEEDOR?.trim()) {
				this.dataForm.instance.getEditor('CODIGO_PROVEEDOR')?.focus();
			}
		});
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_PROVEEDOR === this.modelUpdate.CORR_PROVEEDOR);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_PROVEEDOR)),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_PROVEEDOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_PROVEEDOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_COMERCIAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_TIPO_PERSONERIA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CUENTA_BANCARIA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVO_PROVEEDOR')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_PROVEEDOR')?.option('readOnly', true);
			this.dataForm.instance.getEditor('NOMBRE_TIPO_PERSONERIA')?.option('readOnly', true);
			this.dataForm.instance.getEditor('NOMBRE_COMERCIAL')?.option('readOnly', false);
			this.dataForm.instance.getEditor('CODIGO_PROVEEDOR')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ACTIVO_PROVEEDOR')?.option('readOnly', false);
		});
	}

	override setFocus() {
		setTimeout(() => {
			// Nuevo: Persona (lookup). Edición: Código (Persona queda readOnly).
			if (this.model?.CORR_PROVEEDOR > 0) {
				this.dataForm.instance.getEditor('CODIGO_PROVEEDOR')?.focus();
			} else {
				this.personaLookup?.focus();
			}
		});
	}
	//#endregion

	selectedLookUpCORR_PERSONA(vRow: any): any {
		const row = Array.isArray(vRow) ? vRow[0] : vRow;
		if (row) {
			const nombrePersona = row.NOMBRE_PERSONA ?? '';
			this.model.CORR_PERSONA = row.CORR_PERSONA;
			// NOMBRE_PROVEEDOR = nombre concatenado de la persona (solo lectura de negocio).
			this.model.NOMBRE_PROVEEDOR = nombrePersona;
			// NOMBRE_COMERCIAL = Nombre/Razón social (editable; se precarga desde persona).
			this.model.NOMBRE_COMERCIAL = nombrePersona;
			this.model.TIPO_PERSONERIA = row.TIPO_PERSONERIA ?? '';
			this.model.NOMBRE_TIPO_PERSONERIA = row.NOMBRE_TIPO_PERSONERIA ?? '';
			this.personaLookup?.markValid();
		}
		return row?.CORR_PERSONA;
	}

	selectedLookUpLista(vRow: any): any {
		return vRow[0]?.Key ?? vRow[0];
	}

	selectedLookUpCorr(vRow: any, field: string): any {
		const row = Array.isArray(vRow) ? vRow[0] : vRow;
		return row?.[field] ?? row;
	}
}
