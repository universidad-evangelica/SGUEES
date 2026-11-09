// Qué hace: vista de mantenimiento de preguntas por versión socioeconómico.
// Cómo lo hace: CRUD de ACA_SE_VERSION_PREGUNTA; rol/asoc. líquido solo si MONTO + RANGO_MONTO.
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import {
	AcaSePreguntaLookup,
	AcaSeRolMontoLookup,
	AcaSeSeccionLookup,
	AcaSeVersionLookup,
	AcaSeVersionPregunta,
} from './models/aca-se-version-pregunta';
import { AcaSeVersionPreguntaService } from './aca-se-version-pregunta.service';

const ESTADO_FIELD = 'ACTIVO';

@Component({
  standalone: false,
	selector: 'app-aca-se-version-pregunta',
	templateUrl: './aca-se-version-pregunta.component.html',
	styleUrls: ['./aca-se-version-pregunta.component.scss'],
})
export class AcaSeVersionPreguntaComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la pregunta de la versión';
	protected override requiereEmpresaSesion = false;
	protected override mttoPageSize = 10;
	protected override mttoPageSizes = [10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_VERSION_PREGUNTA';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'ENUNCIADO_PREGUNTA';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de preguntas por versión SE';
	mCORR_VERSION: AcaSeVersionLookup[] = [];
	mCORR_SECCION_SE: AcaSeSeccionLookup[] = [];
	mCORR_PREGUNTA: AcaSePreguntaLookup[] = [];
	mROL_MONTO: AcaSeRolMontoLookup[] = [];
	mSeccionesFiltradas: AcaSeSeccionLookup[] = [];

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: AcaSeVersionPreguntaService
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

	fillParam(xCORR_VERSION_PREGUNTA?: number): any {
		return { CORR_VERSION_PREGUNTA: xCORR_VERSION_PREGUNTA ?? 0 };
	}

	override fillData(xModel?: AcaSeVersionPregunta): AcaSeVersionPregunta {
		if (xModel !== undefined) {
			return {
				CORR_VERSION_PREGUNTA: xModel.CORR_VERSION_PREGUNTA,
				CORR_VERSION: xModel.CORR_VERSION,
				CODIGO_VERSION: xModel.CODIGO_VERSION,
				NOMBRE_VERSION: xModel.NOMBRE_VERSION,
				CORR_SECCION_SE: Number(xModel.CORR_SECCION_SE ?? 0),
				CODIGO_SECCION: xModel.CODIGO_SECCION,
				NOMBRE_SECCION: xModel.NOMBRE_SECCION,
				TIPO_EVALUACION: xModel.TIPO_EVALUACION,
				CORR_PREGUNTA: xModel.CORR_PREGUNTA,
				CODIGO_PREGUNTA: xModel.CODIGO_PREGUNTA,
				ENUNCIADO_PREGUNTA: xModel.ENUNCIADO_PREGUNTA,
				CORR_TIPO_PREGUNTA: xModel.CORR_TIPO_PREGUNTA,
				CODIGO_TIPO_PREGUNTA: xModel.CODIGO_TIPO_PREGUNTA,
				NOMBRE_TIPO_PREGUNTA: xModel.NOMBRE_TIPO_PREGUNTA,
				ORDEN: xModel.ORDEN,
				PUNTAJE: Number(xModel.PUNTAJE ?? 0),
				ES_REQUERIDO: !!xModel.ES_REQUERIDO,
				ROL_MONTO: xModel.ROL_MONTO ?? null,
				NOMBRE_ROL_MONTO: xModel.NOMBRE_ROL_MONTO ?? null,
				CORR_PREGUNTA_BRUTO: xModel.CORR_PREGUNTA_BRUTO ?? null,
				CODIGO_PREGUNTA_BRUTO: xModel.CODIGO_PREGUNTA_BRUTO ?? null,
				ENUNCIADO_PREGUNTA_BRUTO: xModel.ENUNCIADO_PREGUNTA_BRUTO ?? null,
				CORR_PREGUNTA_DESCUENTO: xModel.CORR_PREGUNTA_DESCUENTO ?? null,
				CODIGO_PREGUNTA_DESCUENTO: xModel.CODIGO_PREGUNTA_DESCUENTO ?? null,
				ENUNCIADO_PREGUNTA_DESCUENTO: xModel.ENUNCIADO_PREGUNTA_DESCUENTO ?? null,
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
			CORR_VERSION_PREGUNTA: 0,
			CORR_VERSION: 0,
			CORR_SECCION_SE: 0,
			CORR_PREGUNTA: 0,
			ORDEN: 0,
			PUNTAJE: 0,
			ES_REQUERIDO: false,
			ROL_MONTO: null,
			CORR_PREGUNTA_BRUTO: null,
			CORR_PREGUNTA_DESCUENTO: null,
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
				this.ordenarModels();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	private cargarLookUps(): void {
		forkJoin({
			versiones: this.service.getCORR_VERSION().pipe(catchError(() => of({ Result: false, Data: [] } as any))),
			secciones: this.service.getCORR_SECCION_SE().pipe(catchError(() => of({ Result: false, Data: [] } as any))),
			preguntas: this.service.getCORR_PREGUNTA().pipe(catchError(() => of({ Result: false, Data: [] } as any))),
			rolesMonto: this.service.getROL_MONTO().pipe(catchError(() => of({ Result: false, Data: [] } as any))),
		})
			.pipe(take(1))
			.subscribe({
				next: (result: any) => {
					this.mCORR_VERSION = Array.isArray(result?.versiones?.Data)
						? result.versiones.Data.map((item: AcaSeVersionLookup) => {
								const CODIGO = (item.CODIGO ?? '').trim();
								const NOMBRE = (item.NOMBRE ?? '').trim();
								return {
									CORR_VERSION: Number(item.CORR_VERSION),
									CODIGO,
									NOMBRE,
									DISPLAY: `${CODIGO} - ${NOMBRE}`.trim(),
									ACTIVO: item.ACTIVO,
								};
						  })
						: [];
					this.mCORR_SECCION_SE = Array.isArray(result?.secciones?.Data)
						? result.secciones.Data.map((item: any) => {
								const CODIGO = (item.CODIGO ?? '').trim();
								const NOMBRE_SECCION = (item.NOMBRE_SECCION ?? '').trim();
								const TIPO_EVALUACION = (item.TIPO_EVALUACION ?? '').trim();
								return {
									CORR_SECCION_SE: Number(item.CORR_SECCION_SE),
									CORR_VERSION: Number(item.CORR_VERSION),
									CODIGO,
									NOMBRE_SECCION,
									TIPO_EVALUACION,
									PORCENTAJE_MAXIMO: Number(item.PORCENTAJE_MAXIMO ?? 0),
									DISPLAY: `${CODIGO} - ${NOMBRE_SECCION}`.trim(),
									ACTIVO: item.ACTIVO,
									ORDEN: Number(item.ORDEN ?? 0),
								};
						  })
						: [];
					this.mCORR_PREGUNTA = Array.isArray(result?.preguntas?.Data)
						? result.preguntas.Data.map((item: any) => {
								const CODIGO = (item.CODIGO ?? '').trim();
								const ENUNCIADO = (item.ENUNCIADO ?? '').trim();
								return {
									CORR_PREGUNTA: Number(item.CORR_PREGUNTA),
									CODIGO,
									ENUNCIADO,
									CORR_TIPO_PREGUNTA: Number(item.CORR_TIPO_PREGUNTA ?? 0),
									CODIGO_TIPO_PREGUNTA: (item.CODIGO_TIPO_PREGUNTA ?? '').trim(),
									NOMBRE_TIPO_PREGUNTA: (item.NOMBRE_TIPO_PREGUNTA ?? '').trim(),
									DISPLAY: `${CODIGO} - ${ENUNCIADO}`.trim(),
									ACTIVO: item.ACTIVO,
								};
						  })
						: [];
					this.mROL_MONTO = Array.isArray(result?.rolesMonto?.Data)
						? result.rolesMonto.Data.map((item: AcaSeRolMontoLookup) => ({
								Key: (item.Key ?? '').trim(),
								Value: (item.Value ?? '').trim(),
						  }))
						: [];
					this.aplicarFiltroSecciones(Number(this.model?.CORR_VERSION ?? 0), false);
					this.refrescarItemsForm();
				},
			});
	}

	private aplicarFiltroSecciones(corrVersion: number, limpiarSiNoPertenece: boolean): void {
		this.mSeccionesFiltradas = corrVersion > 0
			? this.mCORR_SECCION_SE
					.filter((s) => Number(s.CORR_VERSION) === corrVersion)
					.sort((a, b) => Number(a.ORDEN ?? 0) - Number(b.ORDEN ?? 0))
			: [];

		if (limpiarSiNoPertenece) {
			const actual = Number(this.model?.CORR_SECCION_SE ?? 0);
			const sigue = this.mSeccionesFiltradas.some((s) => s.CORR_SECCION_SE === actual);
			if (!sigue) {
				this.model.CORR_SECCION_SE = 0;
				this.model.TIPO_EVALUACION = undefined;
				this.limpiarRolYAsociaciones();
			}
		}
	}

	private codigoTipoPregunta(corrPregunta?: number): string {
		const corr = Number(corrPregunta ?? this.model?.CORR_PREGUNTA ?? 0);
		const pregunta = this.mCORR_PREGUNTA.find((p) => p.CORR_PREGUNTA === corr);
		return (pregunta?.CODIGO_TIPO_PREGUNTA ?? this.model?.CODIGO_TIPO_PREGUNTA ?? '').trim().toUpperCase();
	}

	private tipoEvaluacionSeccion(corrSeccion?: number): string {
		const corr = Number(corrSeccion ?? this.model?.CORR_SECCION_SE ?? 0);
		const seccion = this.mCORR_SECCION_SE.find((s) => s.CORR_SECCION_SE === corr);
		return (seccion?.TIPO_EVALUACION ?? this.model?.TIPO_EVALUACION ?? '').trim().toUpperCase();
	}

	private seccionEsTipoPregunta(corrSeccion?: number): boolean {
		return this.tipoEvaluacionSeccion(corrSeccion) === 'PREGUNTA';
	}

	// Qué hace: rol/asoc. solo si pregunta MONTO y sección RANGO_MONTO.
	private mostrarRolMonto(): boolean {
		return this.codigoTipoPregunta() === 'MONTO' && this.tipoEvaluacionSeccion() === 'RANGO_MONTO';
	}

	private permitePuntajePregunta(): boolean {
		if (!this.seccionEsTipoPregunta()) {
			return false;
		}
		return this.codigoTipoPregunta() !== 'OPCION_UNICA';
	}

	private textosAyudaPuntaje(): { helpText: string; hint: string } {
		const topeInfo = this.service.calcularTopePuntajeSeccion(
			this.model,
			this.models ?? [],
			this.mCORR_SECCION_SE ?? []
		);
		const restante =
			topeInfo != null
				? ` Tope sección: ${this.service.fmtPuntaje(topeInfo.tope)}. Disponible: ${this.service.fmtPuntaje(topeInfo.disponible)}.`
				: '';

		if (!this.seccionEsTipoPregunta()) {
			return {
				helpText: 'Solo aplica a secciones tipo PREGUNTA (no a rangos de monto).',
				hint: 'Solo aplica a secciones tipo PREGUNTA',
			};
		}
		if (this.codigoTipoPregunta() === 'OPCION_UNICA') {
			return {
				helpText: 'Opción única: el puntaje se define en cada opción (pantalla Opciones), no aquí.',
				hint: 'Opción única: configure el puntaje en Opciones socioeconómico.',
			};
		}
		if (this.codigoTipoPregunta() === 'OPCION_MULTIPLE') {
			return {
				helpText:
					'Opción múltiple: un solo puntaje por contestar la pregunta (no por ítem marcado). 0 = sin puntaje.' +
					restante,
				hint: 'Opción múltiple: puntaje fijo al responder (0 = sin puntaje).' + restante,
			};
		}
		return {
			helpText:
				'Puntaje de esta pregunta al responderla (texto, número, monto, sí/no, etc.). 0 = sin puntaje.' +
				restante,
			hint: 'Puntaje de la pregunta al responderla (0 = sin puntaje).' + restante,
		};
	}

	private refrescarItemsForm(): void {
		const ayuda = this.textosAyudaPuntaje();
		const mostrarRol = this.mostrarRolMonto();
		const mostrarAsoc = mostrarRol && this.service.esRolLiquido(this.model?.ROL_MONTO);
		const corrVersion = Number(this.model?.CORR_VERSION ?? 0);
		const corrSeccion = Number(this.model?.CORR_SECCION_SE ?? 0);
		const corrVp = Number(this.model?.CORR_VERSION_PREGUNTA ?? 0);
		const corrPreg = Number(this.model?.CORR_PREGUNTA ?? 0);
		const preguntasBruto = mostrarAsoc
			? this.service.armarCandidatosAsoc(
					this.models ?? [],
					corrVersion,
					corrSeccion,
					corrVp,
					corrPreg,
					'BRUTO',
					this.model?.CORR_PREGUNTA_BRUTO
			  )
			: [];
		const preguntasDescuento = mostrarAsoc
			? this.service.armarCandidatosAsoc(
					this.models ?? [],
					corrVersion,
					corrSeccion,
					corrVp,
					corrPreg,
					'DESCUENTO',
					this.model?.CORR_PREGUNTA_DESCUENTO
			  )
			: [];

		this.items = this.service.getItems({
			versiones: this.mCORR_VERSION,
			secciones: this.mSeccionesFiltradas,
			preguntas: this.mCORR_PREGUNTA,
			rolesMonto: this.mROL_MONTO,
			preguntasBruto,
			preguntasDescuento,
			permitePuntaje: this.permitePuntajePregunta(),
			mostrarRolMonto: mostrarRol,
			mostrarAsocLiquido: mostrarAsoc,
			helpTextPuntaje: ayuda.helpText,
			hintPuntaje: ayuda.hint,
		});

		// Qué hace: fuerza dataSource de bruto/descuento (dx-form a veces no refresca editorOptions).
		if (mostrarAsoc) {
			setTimeout(() => {
				this.dataForm?.instance?.getEditor('CORR_PREGUNTA_BRUTO')?.option('dataSource', preguntasBruto);
				this.dataForm?.instance?.getEditor('CORR_PREGUNTA_DESCUENTO')?.option('dataSource', preguntasDescuento);
			});
		}
	}

	private sincronizarEditorPuntaje(): void {
		const permite = this.permitePuntajePregunta();
		const ayuda = this.textosAyudaPuntaje();
		if (!permite) {
			this.model.PUNTAJE = 0;
			this.dataForm?.instance?.updateData('PUNTAJE', 0);
		}
		const editor = this.dataForm?.instance?.getEditor('PUNTAJE');
		editor?.option('readOnly', !permite);
		editor?.option('hint', ayuda.hint);
		this.dataForm?.instance?.itemOption('PUNTAJE', 'helpText', ayuda.helpText);
	}

	private limpiarRolYAsociaciones(): void {
		this.model.ROL_MONTO = null;
		this.model.NOMBRE_ROL_MONTO = null;
		this.limpiarAsociacionesLiquido();
		this.dataForm?.instance?.updateData('ROL_MONTO', null);
	}

	private limpiarAsociacionesLiquido(): void {
		this.model.CORR_PREGUNTA_BRUTO = null;
		this.model.CODIGO_PREGUNTA_BRUTO = null;
		this.model.ENUNCIADO_PREGUNTA_BRUTO = null;
		this.model.CORR_PREGUNTA_DESCUENTO = null;
		this.model.CODIGO_PREGUNTA_DESCUENTO = null;
		this.model.ENUNCIADO_PREGUNTA_DESCUENTO = null;
		this.dataForm?.instance?.updateData('CORR_PREGUNTA_BRUTO', null);
		this.dataForm?.instance?.updateData('CORR_PREGUNTA_DESCUENTO', null);
	}

	onFieldDataChanged(e: any): void {
		if (e?.dataField === 'CORR_VERSION') {
			const corrVersion = Number(e?.value ?? this.model?.CORR_VERSION ?? 0);
			this.model.CORR_VERSION = corrVersion;
			this.aplicarFiltroSecciones(corrVersion, true);
			this.refrescarItemsForm();
			setTimeout(() => {
				const editorSeccion = this.dataForm?.instance?.getEditor('CORR_SECCION_SE') as any;
				if (!editorSeccion) {
					return;
				}
				editorSeccion.option('dataSource', this.mSeccionesFiltradas);
				editorSeccion.option('value', this.model.CORR_SECCION_SE > 0 ? this.model.CORR_SECCION_SE : null);
				editorSeccion.option(
					'placeholder',
					this.mSeccionesFiltradas.length ? 'Sección...' : 'Seleccione primero la versión'
				);
				this.sincronizarEditorPuntaje();
			});
			return;
		}

		if (e?.dataField === 'CORR_SECCION_SE') {
			this.model.CORR_SECCION_SE = Number(e?.value ?? 0);
			const seccion = this.mCORR_SECCION_SE.find((s) => s.CORR_SECCION_SE === this.model.CORR_SECCION_SE);
			this.model.TIPO_EVALUACION = seccion?.TIPO_EVALUACION;
			if (!this.mostrarRolMonto()) {
				this.limpiarRolYAsociaciones();
			}
			this.refrescarItemsForm();
			setTimeout(() => this.sincronizarEditorPuntaje());
			return;
		}

		if (e?.dataField === 'CORR_PREGUNTA') {
			const corr = Number(e?.value ?? 0);
			this.model.CORR_PREGUNTA = corr;
			const pregunta = this.mCORR_PREGUNTA.find((p) => p.CORR_PREGUNTA === corr);
			this.model.CODIGO_TIPO_PREGUNTA = pregunta?.CODIGO_TIPO_PREGUNTA;
			this.model.NOMBRE_TIPO_PREGUNTA = pregunta?.NOMBRE_TIPO_PREGUNTA;
			this.model.CORR_TIPO_PREGUNTA = pregunta?.CORR_TIPO_PREGUNTA;
			if (!this.mostrarRolMonto()) {
				this.limpiarRolYAsociaciones();
			}
			this.refrescarItemsForm();
			setTimeout(() => this.sincronizarEditorPuntaje());
			return;
		}

		if (e?.dataField === 'ROL_MONTO') {
			this.model.ROL_MONTO = e.value ?? null;
			if (!this.service.esRolLiquido(e.value)) {
				this.limpiarAsociacionesLiquido();
			}
			this.refrescarItemsForm();
		}
	}

	private ordenarModels(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => {
			const v = Number(a.CORR_VERSION) - Number(b.CORR_VERSION);
			if (v !== 0) {
				return v;
			}
			const s = Number(a.CORR_SECCION_SE ?? 0) - Number(b.CORR_SECCION_SE ?? 0);
			if (s !== 0) {
				return s;
			}
			const o = Number(a.ORDEN) - Number(b.ORDEN);
			return o !== 0 ? o : Number(a.CORR_PREGUNTA) - Number(b.CORR_PREGUNTA);
		});
	}

	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as AcaSeVersionPregunta);
		const key = this.mttoGridKeyExpr as keyof AcaSeVersionPregunta;
		const index = this.models.findIndex((item) => item?.[key] === record[key]);

		// Qué hace: si ya está la PK en memoria (relectura vieja versión+pregunta), reemplaza; no duplica fila.
		if (index >= 0) {
			this.models = this.models.map((item, i) => (i === index ? this.fillData({ ...item, ...record }) : item));
		} else if (isAdd) {
			this.models = [...this.models, record];
		}

		this.ordenarModels();
		this.refrescarGridTrasCarga(isAdd);
	}

	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof AcaSeVersionPregunta;
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
		this.aplicarFiltroSecciones(Number(this.model.CORR_VERSION), false);
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
		this.aplicarFiltroSecciones(Number(this.model.CORR_VERSION), false);
		this.refrescarItemsForm();
		this.editarClick(e);
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.habilitar();
		});
	}

	override nuevo(): void {
		super.nuevo();
		this.aplicarFiltroSecciones(0, false);
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
		if (!this.permitePuntajePregunta()) {
			this.model.PUNTAJE = 0;
		}
		const mostrarRol = this.mostrarRolMonto();
		if (!mostrarRol) {
			this.model.ROL_MONTO = null;
			this.model.CORR_PREGUNTA_BRUTO = null;
			this.model.CORR_PREGUNTA_DESCUENTO = null;
		}

		const ctxValidacion = {
			mostrarRolMonto: mostrarRol,
			models: this.models ?? [],
			secciones: this.mCORR_SECCION_SE ?? [],
		};
		const formValidation = this.dataForm?.instance?.validate();
		if (formValidation && !formValidation.isValid) {
			this.service.esValido(this.model, this.notifyFx.bind(this), ctxValidacion);
			return;
		}

		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this), ctxValidacion),
			insert: () => this.service.insert(this.model, mostrarRol),
			update: () => this.service.update(this.model, mostrarRol),
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
		super.cancelar((item: any) => item.CORR_VERSION_PREGUNTA === this.modelUpdate.CORR_VERSION_PREGUNTA);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_VERSION_PREGUNTA))),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_VERSION_PREGUNTA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_VERSION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_SECCION_SE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_PREGUNTA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ROL_MONTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_PREGUNTA_BRUTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_PREGUNTA_DESCUENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ORDEN')?.option('readOnly', true);
		this.dataForm.instance.getEditor('PUNTAJE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ES_REQUERIDO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', true);
	}

	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_VERSION_PREGUNTA')?.option('readOnly', true);
			this.dataForm.instance.getEditor('CORR_VERSION')?.option('readOnly', false);
			this.dataForm.instance.getEditor('CORR_SECCION_SE')?.option('readOnly', false);
			this.dataForm.instance.getEditor('CORR_PREGUNTA')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ROL_MONTO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('CORR_PREGUNTA_BRUTO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('CORR_PREGUNTA_DESCUENTO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ORDEN')?.option('readOnly', false);
			this.sincronizarEditorPuntaje();
			this.dataForm.instance.getEditor('ES_REQUERIDO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', estadoSoloLectura);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_VERSION')?.focus();
		});
	}
}
