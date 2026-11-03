// Qué hace: vista de mantenimiento de puntajes socioeconómico.
// Cómo lo hace: CRUD de ACA_SE_PUNTAJE; pregunta/opción vía getLookUp; filtra opciones por pregunta.
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { AcaSeOpcionLookup, AcaSePreguntaLookup, AcaSePuntaje } from './models/aca-se-puntaje';
import { AcaSePuntajeService } from './aca-se-puntaje.service';

const ESTADO_FIELD = 'ACTIVO';

@Component({
  standalone: false,
	selector: 'app-aca-se-puntaje',
	templateUrl: './aca-se-puntaje.component.html',
	styleUrls: ['./aca-se-puntaje.component.scss'],
})
export class AcaSePuntajeComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el puntaje';
	protected override requiereEmpresaSesion = false;
	protected override mttoPageSize = 10;
	protected override mttoPageSizes = [10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_PUNTAJE';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'ENUNCIADO_PREGUNTA';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de puntajes socioeconómico';
	mCORR_PREGUNTA: AcaSePreguntaLookup[] = [];
	mCORR_OPCION: AcaSeOpcionLookup[] = [];

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: AcaSePuntajeService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.cargarLookUps();
		this.consultar();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	fillParam(xCORR_PUNTAJE?: number): any {
		return { CORR_PUNTAJE: xCORR_PUNTAJE ?? 0 };
	}

	override fillData(xModel?: AcaSePuntaje): AcaSePuntaje {
		if (xModel !== undefined) {
			return {
				CORR_PUNTAJE: xModel.CORR_PUNTAJE,
				CORR_PREGUNTA: xModel.CORR_PREGUNTA,
				CODIGO_PREGUNTA: xModel.CODIGO_PREGUNTA,
				ENUNCIADO_PREGUNTA: xModel.ENUNCIADO_PREGUNTA,
				CORR_OPCION: xModel.CORR_OPCION ?? null,
				CODIGO_OPCION: xModel.CODIGO_OPCION,
				TEXTO_OPCION: xModel.TEXTO_OPCION,
				PUNTAJE: Number(xModel.PUNTAJE ?? 0),
				PORCENTAJE: Number(xModel.PORCENTAJE ?? 0),
				FECHA_INICIO: xModel.FECHA_INICIO,
				FECHA_FIN: xModel.FECHA_FIN ?? null,
				ACTIVO: xModel.ACTIVO,
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
			};
		}

		return {
			CORR_PUNTAJE: 0,
			CORR_PREGUNTA: 0,
			CORR_OPCION: null,
			PUNTAJE: 0,
			PORCENTAJE: 0,
			FECHA_INICIO: new Date(),
			FECHA_FIN: null,
			ACTIVO: true,
			CORR_EMPRESA: 1,
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
				this.ordenarModels();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	// Qué hace: carga lookups de pregunta y opción.
	// Cómo lo hace: forkJoin de GetCORR_PREGUNTA y GetCORR_OPCION.
	private cargarLookUps(): void {
		forkJoin({
			preguntas: this.service.getCORR_PREGUNTA().pipe(catchError(() => of({ Result: false, Data: [] } as any))),
			opciones: this.service.getCORR_OPCION().pipe(catchError(() => of({ Result: false, Data: [] } as any))),
		})
			.pipe(take(1))
			.subscribe({
				next: (result: any) => {
					this.mCORR_PREGUNTA = Array.isArray(result?.preguntas?.Data)
						? result.preguntas.Data.map((item: AcaSePreguntaLookup) => ({
								CORR_PREGUNTA: Number(item.CORR_PREGUNTA),
								CODIGO: (item.CODIGO ?? '').trim(),
								ENUNCIADO: (item.ENUNCIADO ?? '').trim(),
								ACTIVO: item.ACTIVO,
						  }))
						: [];
					this.mCORR_OPCION = Array.isArray(result?.opciones?.Data)
						? result.opciones.Data.map((item: AcaSeOpcionLookup) => ({
								CORR_OPCION: Number(item.CORR_OPCION),
								CORR_PREGUNTA: Number(item.CORR_PREGUNTA),
								CODIGO: (item.CODIGO ?? '').trim(),
								TEXTO: (item.TEXTO ?? '').trim(),
								ACTIVO: item.ACTIVO,
						  }))
						: [];
					this.refrescarItemsForm();
				},
			});
	}

	// Qué hace: reconstruye el formulario filtrando opciones por la pregunta elegida.
	private refrescarItemsForm(): void {
		this.items = this.service.getItems({
			preguntas: this.mCORR_PREGUNTA,
			opciones: this.mCORR_OPCION,
			corrPregunta: Number(this.model?.CORR_PREGUNTA ?? 0),
		});
	}

	// Qué hace: al cambiar pregunta, limpia opción si no pertenece y refresca el combo.
	onFieldDataChanged(e: any): void {
		if (e?.dataField !== 'CORR_PREGUNTA') {
			return;
		}
		const corrPregunta = Number(e.value ?? 0);
		const opcionActual = Number(this.model?.CORR_OPCION ?? 0);
		const pertenece = this.mCORR_OPCION.some(
			(o) => Number(o.CORR_OPCION) === opcionActual && Number(o.CORR_PREGUNTA) === corrPregunta
		);
		if (!pertenece && this.model) {
			this.model.CORR_OPCION = null;
			this.dataForm?.instance?.updateData('CORR_OPCION', null);
		}
		this.refrescarItemsForm();
	}

	private ordenarModels(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => {
			const p = Number(a.CORR_PREGUNTA) - Number(b.CORR_PREGUNTA);
			if (p !== 0) {
				return p;
			}
			const o = Number(a.CORR_OPCION ?? 0) - Number(b.CORR_OPCION ?? 0);
			return o !== 0 ? o : Number(a.CORR_PUNTAJE) - Number(b.CORR_PUNTAJE);
		});
	}

	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as AcaSePuntaje);
		const key = this.mttoGridKeyExpr as keyof AcaSePuntaje;

		if (isAdd) {
			this.models = [...this.models, record];
		} else {
			const index = this.models.findIndex((item) => item?.[key] === record[key]);
			if (index >= 0) {
				this.models = this.models.map((item, i) => (i === index ? this.fillData({ ...item, ...record }) : item));
			}
		}

		this.ordenarModels();
		this.refrescarGridTrasCarga(isAdd);
	}

	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof AcaSePuntaje;
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
		this.refrescarItemsForm();
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
		this.refrescarItemsForm();
		this.editarClick(e);
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.habilitar();
		});
	}

	override nuevo(): void {
		super.nuevo();
		this.refrescarItemsForm();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
		});
	}

	guardar(): void {
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
		super.cancelar((item: any) => item.CORR_PUNTAJE === this.modelUpdate.CORR_PUNTAJE);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_PUNTAJE))),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_PUNTAJE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_PREGUNTA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_OPCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('PUNTAJE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('PORCENTAJE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_INICIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_FIN')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', true);
	}

	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_PUNTAJE')?.option('readOnly', true);
			this.dataForm.instance.getEditor('CORR_PREGUNTA')?.option('readOnly', false);
			this.dataForm.instance.getEditor('CORR_OPCION')?.option('readOnly', false);
			this.dataForm.instance.getEditor('PUNTAJE')?.option('readOnly', false);
			this.dataForm.instance.getEditor('PORCENTAJE')?.option('readOnly', false);
			this.dataForm.instance.getEditor('FECHA_INICIO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('FECHA_FIN')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', estadoSoloLectura);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_PREGUNTA')?.focus();
		});
	}
}
