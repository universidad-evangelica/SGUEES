import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScCompetenciasConductuales } from './models/sc-competencias-conductuales';
import { ScCompetenciasConductualesService } from './sc-competencias-conductuales.service';

const ESTADO_FIELD = 'ESTADO_COMPETENCIAS_CONDUCTUALES';

@Component({
	selector: 'app-sc-competencias-conductuales',
	templateUrl: './sc-competencias-conductuales.component.html',
	styleUrls: ['./sc-competencias-conductuales.component.scss'],
})
export class ScCompetenciasConductualesComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la competencia conductual';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_COMPETENCIAS_CONDUCTUALES';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_COMPETENCIAS_CONDUCTUALES';

	protected override mttoParchearGridTrasGuardar = false;
	protected override mttoRemoteOperations = false;

	mCORR_TIPO_PUESTO: any;
	readOnly = false;
	tipoPuestoInvalido = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Competencias Conductuales';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScCompetenciasConductualesService
	) {
		super(appInfoService, router);
		this.selectedLookUpCORR_TIPO_PUESTO = this.selectedLookUpCORR_TIPO_PUESTO.bind(this);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.llenaComboBox();
		this.consultar();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	llenaComboBox(): void {
		this.getCORR_TIPO_PUESTO();
	}

	getCORR_TIPO_PUESTO(): void {
		this.appInfoService
			.getLookUp(
				'SC_COMPETENCIAS_CONDUCTUALES',
				'PLA_TIPO_PUESTO',
				'GetCORR_TIPO_PUESTO',
				undefined,
				environment.UrlTALENTOHUMANONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_TIPO_PUESTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	selectedLookUpCORR_TIPO_PUESTO(vRow: any): any {
		return vRow[0].CORR_TIPO_PUESTO;
	}

	fillParam(xCORR_COMPETENCIAS_CONDUCTUALES?: number): any {
		return {
			CORR_COMPETENCIAS_CONDUCTUALES: xCORR_COMPETENCIAS_CONDUCTUALES ?? 0,
		};
	}

	override fillData(xModel?: ScCompetenciasConductuales): ScCompetenciasConductuales {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_COMPETENCIAS_CONDUCTUALES: xModel.CORR_COMPETENCIAS_CONDUCTUALES,
				CORR_TIPO_PUESTO: xModel.CORR_TIPO_PUESTO,
				NOMBRE_COMPETENCIAS_CONDUCTUALES: xModel.NOMBRE_COMPETENCIAS_CONDUCTUALES,
				DESCRIPCION: xModel.DESCRIPCION,
				ESTADO_COMPETENCIAS_CONDUCTUALES: xModel.ESTADO_COMPETENCIAS_CONDUCTUALES,
				NOMBRE_TIPO_PUESTO: xModel.NOMBRE_TIPO_PUESTO,
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
			CORR_COMPETENCIAS_CONDUCTUALES: 0,
			CORR_TIPO_PUESTO: null,
			NOMBRE_COMPETENCIAS_CONDUCTUALES: '',
			DESCRIPCION: '',
			ESTADO_COMPETENCIAS_CONDUCTUALES: true,
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
			onData: () => this.refrescarGridTrasCarga(resetPage),
		});
	}

	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			const grid = this.dataGrid?.gData?.instance;
			if (!grid) {
				return;
			}
			if (resetPage) {
				grid.pageIndex(0);
			}
			grid.updateDimensions();
			grid.repaint();
		}, 0);
	}

	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		this.readOnly = false;
		this.tipoPuestoInvalido = false;
		super.nuevo();
	}

	onTipoPuestoChanged(value: number | null): void {
		this.model.CORR_TIPO_PUESTO = value;
		if (value != null && value > 0) {
			this.tipoPuestoInvalido = false;
		}
	}

	private actualizarEstadoValidacionLookup(): void {
		const value = Number(this.model?.CORR_TIPO_PUESTO);
		this.tipoPuestoInvalido = Number.isNaN(value) || value <= 0;
	}

	guardar(): void {
		const formData = this.dataForm?.instance?.option('formData');
		if (formData) {
			this.model = { ...this.model, ...formData };
		}

		this.actualizarEstadoValidacionLookup();
		const formValidation = this.dataForm?.instance?.validate();
		if (formValidation && !formValidation.isValid) {
			this.actualizarEstadoValidacionLookup();
			this.service.esValido(this.model, this.notifyFx.bind(this));
			return;
		}

		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
			parchearGrid: false,
			onSuccess: () => this.consultar(true),
		});
	}

	override cancelar(): void {
		this.tipoPuestoInvalido = false;
		super.cancelar((item: any) => item.CORR_COMPETENCIAS_CONDUCTUALES === this.modelUpdate.CORR_COMPETENCIAS_CONDUCTUALES);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_COMPETENCIAS_CONDUCTUALES)),
			parchearGrid: false,
			reload: () => this.consultar(true),
		});
	}

	activar_inactivar(): void {
		const row = this.obtenerFilaSeleccionada();
		if (!row) {
			this.notificarSeleccionRequerida();
			return;
		}

		const activo = !!row[this.mttoCampoEstado];
		const describe = `${row[this.mttoEstadoDescribeField] ?? ''}`.trim();
		const titulo = activo ? 'Desactivar registro' : 'Activar registro';
		const verbo = activo ? 'desactivar' : 'activar';
		const mensaje = describe
			? `¿Desea ${verbo} "${describe}"?`
			: `¿Desea ${verbo} el registro seleccionado?`;

		this.confirmaAccion(titulo, mensaje, () => {
			this.ejecutarActivarInactivar({
				ejecutar: () => this.service.activarInactivar(row),
				eraActivo: activo,
				parchearGrid: false,
				onSuccess: () => this.consultar(true),
			});
		});
	}

	override bloquear(): void {
		this.readOnly = true;
		this.dataForm.instance.getEditor('CORR_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', true);
	}

	override habilitar(): void {
		this.readOnly = false;
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', true);
			this.dataForm.instance.getEditor('NOMBRE_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', false);
			this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ESTADO_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', estadoSoloLectura);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_COMPETENCIAS_CONDUCTUALES')?.focus();
		});
	}
}
