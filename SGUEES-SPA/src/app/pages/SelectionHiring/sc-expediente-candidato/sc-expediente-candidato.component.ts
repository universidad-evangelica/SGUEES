import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular';
import { take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScExpedienteCandidato } from './models/sc-expediente-candidato';
import { ScExpedienteSolicitud } from './sc-expediente-solicitud/models/sc-expediente-solicitud';
import { ScExpedienteCandidatoService } from './sc-expediente-candidato.service';

@Component({
	selector: 'app-sc-expediente-candidato',
	templateUrl: './sc-expediente-candidato.component.html',
	styleUrls: ['./sc-expediente-candidato.component.scss'],
})
export class ScExpedienteCandidatoComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;
	@ViewChild('gridSolicitudes', { static: false }) gridSolicitudes?: DxDataGridComponent;

	protected override etiquetaRegistro = 'el expediente de candidato';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 15;
	protected override mttoPageSizes = [15, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_EXPEDIENTE_CANDIDATO';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	/**
	 * Grid hijo Solicitudes Relacionadas (equivalente a tokens / tokenColumns de Bitácora).
	 * Data: V_SC_EXPEDIENTE_SOLICITUD vía getAllSolicitud().
	 */
	solicitudes: ScExpedienteSolicitud[] = [];
	solicitudColumns: any[] = [];
	solicitudSearchText = '';

	/** Avatar temporal; luego se enlazará por URL desde persona. */
	readonly avatarUrl =
		'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face';

	private readonly maintenanceSubtitulo = 'Mantenimiento de Expediente de Candidato';

	/** Muestra tarjeta resumen cuando el expediente ya tiene PK. */
	get mostrarResumenExpediente(): boolean {
		return (this.model?.CORR_EXPEDIENTE_CANDIDATO ?? 0) > 0;
	}

	/** FECHA_ACTU con respaldo en FECHA_CREA para el encabezado. */
	get ultimaActualizacion(): Date | string | null | undefined {
		return this.model?.FECHA_ACTU || this.model?.FECHA_CREA || null;
	}

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScExpedienteCandidatoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
		// Columnas del grid hijo (mismo patrón que getTokenColumns en sc-solicitud-empleo).
		this.solicitudColumns = this.service.getSolicitudColumns();
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
			// Al volver al browse se limpia el detalle (como tokens al salir del ítem).
			this.solicitudes = [];
			this.limpiarBusquedaSolicitudes();
		}
	}

	fillParam(xCORR_EXPEDIENTE_CANDIDATO?: number): any {
		return { CORR_EXPEDIENTE_CANDIDATO: xCORR_EXPEDIENTE_CANDIDATO ?? 0 };
	}

	override fillData(xModel?: ScExpedienteCandidato): ScExpedienteCandidato {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_EXPEDIENTE_CANDIDATO: xModel.CORR_EXPEDIENTE_CANDIDATO,
				CORR_PERSONA_DATOS: xModel.CORR_PERSONA_DATOS,
				FECHA_GENERACION: xModel.FECHA_GENERACION,
				ACTIVO: xModel.ACTIVO,
				DUI_PERSONA: xModel.DUI_PERSONA,
				NOMBRE_PERSONA: xModel.NOMBRE_PERSONA,
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
			CORR_EXPEDIENTE_CANDIDATO: 0,
			CORR_PERSONA_DATOS: 0,
			FECHA_GENERACION: new Date(),
			ACTIVO: true,
			DUI_PERSONA: '',
			NOMBRE_PERSONA: '',
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	consultar(resetPage = false): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
			onData: () => {
				this.ordenarModelsPorCorr();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}
		this.models = [...this.models].sort(
			(a, b) => Number(b.CORR_EXPEDIENTE_CANDIDATO) - Number(a.CORR_EXPEDIENTE_CANDIDATO)
		);
	}

	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	/**
	 * Carga solicitudes vinculadas al expediente abierto.
	 * Equivalente a consultarToken() en sc-solicitud-empleo (Bitácora).
	 */
	consultarSolicitudes(): void {
		const corrExpediente = this.model?.CORR_EXPEDIENTE_CANDIDATO ?? 0;
		if (corrExpediente <= 0) {
			this.solicitudes = [];
			return;
		}

		this.service
			.getAllSolicitud(corrExpediente)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.solicitudes = response.Data ?? [];
					} else {
						this.solicitudes = [];
					}
					if (this.solicitudSearchText) {
						setTimeout(() => this.onSolicitudSearchChanged({ value: this.solicitudSearchText }));
					}
				},
				error: () => {
					this.solicitudes = [];
				},
			});
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
			this.consultarSolicitudes();
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
			this.consultarSolicitudes();
		});
	}

	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		this.solicitudes = [];
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.habilitar();
		});
	}

	guardar(): void {
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
			onSuccess: () => this.consultarSolicitudes(),
		});
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_EXPEDIENTE_CANDIDATO === this.modelUpdate.CORR_EXPEDIENTE_CANDIDATO);
		this.solicitudes = [];
		this.limpiarBusquedaSolicitudes();
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_EXPEDIENTE_CANDIDATO)),
		});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_EXPEDIENTE_CANDIDATO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_PERSONA_DATOS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_PERSONA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DUI_PERSONA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_GENERACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', true);
	}

	override habilitar(): void {
		const esNuevo = this.banderaMtto === UpdateType.Add;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_EXPEDIENTE_CANDIDATO')?.option('readOnly', true);
			this.dataForm.instance.getEditor('CORR_PERSONA_DATOS')?.option('readOnly', !esNuevo);
			this.dataForm.instance.getEditor('NOMBRE_PERSONA')?.option('readOnly', true);
			this.dataForm.instance.getEditor('DUI_PERSONA')?.option('readOnly', true);
			this.dataForm.instance.getEditor('FECHA_GENERACION')?.option('readOnly', true);
			this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', true);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_PERSONA_DATOS')?.focus();
		});
	}

	/** Texto seguro para campos de solo lectura en el resumen. */
	textoLectura(valor: unknown): string {
		if (valor === null || valor === undefined) {
			return '—';
		}
		const texto = String(valor).trim();
		return texto.length > 0 ? texto : '—';
	}

	/** Fecha/hora para metadatos del encabezado (dd/MM/yyyy HH:mm). */
	fechaHoraLectura(valor: Date | string | null | undefined): string {
		if (!valor) {
			return '—';
		}
		const fecha = valor instanceof Date ? valor : new Date(valor);
		if (Number.isNaN(fecha.getTime())) {
			return '—';
		}
		const dd = String(fecha.getDate()).padStart(2, '0');
		const mm = String(fecha.getMonth() + 1).padStart(2, '0');
		const yyyy = fecha.getFullYear();
		const hh = String(fecha.getHours()).padStart(2, '0');
		const min = String(fecha.getMinutes()).padStart(2, '0');
		return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
	}

	/** En pausa: navegación al expediente completo pendiente de implementar. */
	verExpedienteCompleto(): void {
		// Sin acción por ahora.
	}

	/** Filtra el grid hijo desde la búsqueda del encabezado. */
	onSolicitudSearchChanged(e: { value?: string }): void {
		this.gridSolicitudes?.instance?.searchByText(e?.value ?? '');
	}

	private limpiarBusquedaSolicitudes(): void {
		this.solicitudSearchText = '';
		this.gridSolicitudes?.instance?.searchByText('');
	}

	/** En pausa: alta manual desde esta pantalla pendiente; hoy se usa Asociar Expediente. */
	nuevaSolicitudPausa(): void {
		// Sin acción por ahora.
	}
}
