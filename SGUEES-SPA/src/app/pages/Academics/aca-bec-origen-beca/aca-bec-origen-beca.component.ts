import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { AcaBecOrigenBeca } from './models/aca-bec-origen-beca';
import { AcaBecOrigenBecaService } from './aca-bec-origen-beca.service';

const ESTADO_FIELD = 'ACTIVO';

@Component({
	selector: 'app-aca-bec-origen-beca',
	templateUrl: './aca-bec-origen-beca.component.html',
	styleUrls: ['./aca-bec-origen-beca.component.scss'],
})
export class AcaBecOrigenBecaComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el origen de beca';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_ORIGEN_BECA';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_ORIGEN';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Origen de Beca';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: AcaBecOrigenBecaService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems({
			onCodigoOrigenChanged: this.onCodigoOrigenChanged.bind(this),
		});
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

	fillParam(xCORR_ORIGEN_BECA?: number): any {
		return { CORR_ORIGEN_BECA: xCORR_ORIGEN_BECA ?? 0 };
	}

	override fillData(xModel?: AcaBecOrigenBeca): AcaBecOrigenBeca {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_ORIGEN_BECA: xModel.CORR_ORIGEN_BECA,
				CODIGO_ORIGEN: xModel.CODIGO_ORIGEN,
				NOMBRE_ORIGEN: xModel.NOMBRE_ORIGEN,
				DESCRIPCION: xModel.DESCRIPCION,
				ACTIVO: xModel.ACTIVO,
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
			CORR_ORIGEN_BECA: 0,
			CODIGO_ORIGEN: '',
			NOMBRE_ORIGEN: '',
			DESCRIPCION: '',
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

	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => Number(a.CORR_ORIGEN_BECA) - Number(b.CORR_ORIGEN_BECA));
	}

	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as AcaBecOrigenBeca);
		const key = this.mttoGridKeyExpr as keyof AcaBecOrigenBeca;

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

		const key = this.mttoGridKeyExpr as keyof AcaBecOrigenBeca;
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
		});
	}

	guardar(): void {
		const formData = this.dataForm?.instance?.option('formData');
		if (formData) {
			this.model = { ...this.model, ...formData };
		}
		this.model = this.service.normalizarCodigoNombre(this.model);
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
		super.cancelar((item: any) => item.CORR_ORIGEN_BECA === this.modelUpdate.CORR_ORIGEN_BECA);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_ORIGEN_BECA))),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_ORIGEN_BECA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_ORIGEN')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_ORIGEN')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', true);
	}

	override habilitar(): void {
		setTimeout(() => {
			const esNuevo = this.banderaMtto === UpdateType.Add;
			this.dataForm.instance.getEditor('CORR_ORIGEN_BECA')?.option('readOnly', true);
			this.dataForm.instance.getEditor('CODIGO_ORIGEN')?.option('readOnly', false);
			this.dataForm.instance.getEditor('NOMBRE_ORIGEN')?.option('readOnly', false);
			this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', false);
			this.actualizarBloqueoNombreOrigen();
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CODIGO_ORIGEN')?.focus();
		});
	}

	private onCodigoOrigenChanged(codigoOrigen: string): void {
		const codigo = `${codigoOrigen ?? ''}`.trim().toUpperCase();
		const nombreOrigen = this.service.getNombreOrigenPorCodigo(codigo);

		this.model = {
			...this.model,
			CODIGO_ORIGEN: codigo,
			NOMBRE_ORIGEN: nombreOrigen ?? this.model.NOMBRE_ORIGEN,
		};

		const formData = {
			...(this.dataForm?.instance?.option('formData') ?? {}),
			CODIGO_ORIGEN: codigo,
			NOMBRE_ORIGEN: nombreOrigen ?? this.model.NOMBRE_ORIGEN,
		};

		this.dataForm?.instance?.option('formData', formData);
		this.actualizarBloqueoNombreOrigen();
	}

	private actualizarBloqueoNombreOrigen(): void {
		const codigoOrigen = this.dataForm?.instance?.option('formData')?.CODIGO_ORIGEN ?? this.model?.CODIGO_ORIGEN;
		const nombreAmarrado = this.service.getNombreOrigenPorCodigo(codigoOrigen);
		this.dataForm?.instance?.getEditor('NOMBRE_ORIGEN')?.option('readOnly', !!nombreAmarrado);
	}
}
