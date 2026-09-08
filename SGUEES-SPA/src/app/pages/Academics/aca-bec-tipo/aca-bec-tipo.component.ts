import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { AcaBecConvenioLookup, AcaBecOrigenBecaLookup, AcaBecTipo } from './models/aca-bec-tipo';
import { AcaBecTipoService } from './aca-bec-tipo.service';

const ESTADO_FIELD = 'ACTIVO';

@Component({
	selector: 'app-aca-bec-tipo',
	templateUrl: './aca-bec-tipo.component.html',
	styleUrls: ['./aca-bec-tipo.component.scss'],
})
export class AcaBecTipoComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el tipo de beca';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 10;
	protected override mttoPageSizes = [10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_BECA';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_BECA';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Tipos de Beca';
	private origenes: AcaBecOrigenBecaLookup[] = [];
	private convenios: AcaBecConvenioLookup[] = [];

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: AcaBecTipoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.items = this.service.getItems();
		this.summary = this.service.getSummary();
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.cargarCatalogos();
		this.consultar();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	fillParam(xCORR_BECA?: number): any {
		return { CORR_BECA: xCORR_BECA ?? 0 };
	}

	override fillData(xModel?: AcaBecTipo): AcaBecTipo {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_BECA: xModel.CORR_BECA,
				CODIGO_BECA: xModel.CODIGO_BECA,
				NOMBRE_BECA: xModel.NOMBRE_BECA,
				CORR_ORIGEN_BECA: xModel.CORR_ORIGEN_BECA,
				CODIGO_ORIGEN: xModel.CODIGO_ORIGEN,
				NOMBRE_ORIGEN: xModel.NOMBRE_ORIGEN,
				CORR_CONVENIO: xModel.CORR_CONVENIO ?? null,
				CODIGO_CONVENIO: xModel.CODIGO_CONVENIO,
				NOMBRE_CONVENIO: xModel.NOMBRE_CONVENIO,
				ARTICULO_REGLAMENTO: xModel.ARTICULO_REGLAMENTO ?? null,
				PORCENTAJE_COBERTURA_REFERENCIAL: xModel.PORCENTAJE_COBERTURA_REFERENCIAL ?? null,
				CUM_MINIMO_RENOVACION: xModel.CUM_MINIMO_RENOVACION ?? null,
				APLICA_NUEVO_INGRESO: !!xModel.APLICA_NUEVO_INGRESO,
				APLICA_ANTIGUO_INGRESO: !!xModel.APLICA_ANTIGUO_INGRESO,
				APLICA_EMPLEADO: !!xModel.APLICA_EMPLEADO,
				APLICA_HIJO_EMPLEADO: !!xModel.APLICA_HIJO_EMPLEADO,
				NIVEL_ACADEMICO_APLICA: xModel.NIVEL_ACADEMICO_APLICA ?? 'TODOS',
				REQUIERE_CONVENIO: !!xModel.REQUIERE_CONVENIO,
				REQUIERE_ESTUDIO_SOCIOECONOMICO: !!xModel.REQUIERE_ESTUDIO_SOCIOECONOMICO,
				REQUIERE_APROBACION_COMITE: !!xModel.REQUIERE_APROBACION_COMITE,
				REQUIERE_APROBACION_DIRECTORIO: !!xModel.REQUIERE_APROBACION_DIRECTORIO,
				UNIDAD_RESPONSABLE: xModel.UNIDAD_RESPONSABLE ?? null,
				DESCRIPCION: xModel.DESCRIPCION ?? null,
				ESTADO_BECA: xModel.ESTADO_BECA ?? 'ACTIVA',
				ACTIVO: xModel.ACTIVO ?? xModel.ESTADO_BECA === 'ACTIVA',
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
			CORR_BECA: 0,
			CODIGO_BECA: '',
			NOMBRE_BECA: '',
			CORR_ORIGEN_BECA: 0,
			CORR_CONVENIO: null,
			ARTICULO_REGLAMENTO: null,
			PORCENTAJE_COBERTURA_REFERENCIAL: null,
			CUM_MINIMO_RENOVACION: null,
			APLICA_NUEVO_INGRESO: true,
			APLICA_ANTIGUO_INGRESO: true,
			APLICA_EMPLEADO: false,
			APLICA_HIJO_EMPLEADO: false,
			NIVEL_ACADEMICO_APLICA: 'TODOS',
			REQUIERE_CONVENIO: false,
			REQUIERE_ESTUDIO_SOCIOECONOMICO: false,
			REQUIERE_APROBACION_COMITE: true,
			REQUIERE_APROBACION_DIRECTORIO: true,
			UNIDAD_RESPONSABLE: null,
			DESCRIPCION: null,
			ESTADO_BECA: 'ACTIVA',
			ACTIVO: true,
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

	private cargarCatalogos(): void {
		this.loadingVisible = true;
		forkJoin({
			origenes: this.service.getOrigenes().pipe(catchError(() => of({ Data: [] } as any))),
			convenios: this.service.getConvenios().pipe(catchError(() => of({ Data: [] } as any))),
		})
			.pipe(finalize(() => (this.loadingVisible = false)))
			.subscribe((result: any) => {
				this.origenes = result?.origenes?.Data ?? [];
				this.convenios = result?.convenios?.Data ?? [];
				this.items = this.service.getItems({
					origenes: this.origenes,
					convenios: this.convenios,
					onRequiereConvenioChanged: this.onRequiereConvenioChanged.bind(this),
				});
			});
	}

	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => Number(a.CORR_BECA) - Number(b.CORR_BECA));
	}

	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as AcaBecTipo);
		const key = this.mttoGridKeyExpr as keyof AcaBecTipo;

		if (isAdd) {
			this.models = [...this.models, record];
		} else {
			const index = this.models.findIndex((item) => item?.[key] === record[key]);
			if (index >= 0) {
				this.models = this.models.map((item, i) => (i === index ? this.fillData({ ...item, ...record }) : item));
			}
		}

		this.ordenarModelsPorCorr();
		this.refrescarGridTrasCarga(isAdd);
	}

	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof AcaBecTipo;
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
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.actualizarEstadoConvenio();
		});
	}

	guardar(): void {
		const formData = this.dataForm?.instance?.option('formData');
		if (formData) {
			this.model = { ...this.model, ...formData };
		}
		this.model = this.service.normalizar(this.model);
		this.dataForm?.instance?.option('formData', this.model);

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
					'clave foranea',
					'llave foranea',
					'hijos',
					'registros relacionados',
					'registros asociados',
					'asociados',
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

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_BECA === this.modelUpdate.CORR_BECA);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_BECA))),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		[
			'CORR_BECA',
			'CODIGO_BECA',
			'NOMBRE_BECA',
			'CORR_ORIGEN_BECA',
			'ESTADO_BECA',
			'PORCENTAJE_COBERTURA_REFERENCIAL',
			'CUM_MINIMO_RENOVACION',
			'APLICA_NUEVO_INGRESO',
			'APLICA_ANTIGUO_INGRESO',
			'APLICA_EMPLEADO',
			'APLICA_HIJO_EMPLEADO',
			'NIVEL_ACADEMICO_APLICA',
			'REQUIERE_CONVENIO',
			'CORR_CONVENIO',
			'REQUIERE_ESTUDIO_SOCIOECONOMICO',
			'REQUIERE_APROBACION_COMITE',
			'REQUIERE_APROBACION_DIRECTORIO',
			'ARTICULO_REGLAMENTO',
			'UNIDAD_RESPONSABLE',
			'DESCRIPCION',
		].forEach((field) => this.dataForm.instance.getEditor(field)?.option('readOnly', true));
	}

	override habilitar(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_BECA')?.option('readOnly', true);
			[
				'CODIGO_BECA',
				'NOMBRE_BECA',
				'CORR_ORIGEN_BECA',
				'ESTADO_BECA',
				'PORCENTAJE_COBERTURA_REFERENCIAL',
				'CUM_MINIMO_RENOVACION',
				'APLICA_NUEVO_INGRESO',
				'APLICA_ANTIGUO_INGRESO',
				'APLICA_EMPLEADO',
				'APLICA_HIJO_EMPLEADO',
				'NIVEL_ACADEMICO_APLICA',
				'REQUIERE_CONVENIO',
				'REQUIERE_ESTUDIO_SOCIOECONOMICO',
				'REQUIERE_APROBACION_COMITE',
				'REQUIERE_APROBACION_DIRECTORIO',
				'ARTICULO_REGLAMENTO',
				'UNIDAD_RESPONSABLE',
				'DESCRIPCION',
			].forEach((field) => this.dataForm.instance.getEditor(field)?.option('readOnly', false));
			this.actualizarEstadoConvenio();
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CODIGO_BECA')?.focus();
		});
	}

	private onRequiereConvenioChanged(requiereConvenio: boolean): void {
		const formData = {
			...(this.dataForm?.instance?.option('formData') ?? {}),
			REQUIERE_CONVENIO: requiereConvenio,
			CORR_CONVENIO: requiereConvenio ? this.dataForm?.instance?.option('formData')?.CORR_CONVENIO ?? null : null,
		};

		this.model = { ...this.model, ...formData };
		this.dataForm?.instance?.option('formData', formData);
		this.actualizarEstadoConvenio();
	}

	private actualizarEstadoConvenio(): void {
		const requiereConvenio = !!(this.dataForm?.instance?.option('formData')?.REQUIERE_CONVENIO ?? this.model?.REQUIERE_CONVENIO);
		const convenioEditor = this.dataForm?.instance?.getEditor('CORR_CONVENIO');
		convenioEditor?.option('readOnly', !requiereConvenio || this.banderaMtto === UpdateType.Browse);
		convenioEditor?.option('disabled', !requiereConvenio);
	}
}
