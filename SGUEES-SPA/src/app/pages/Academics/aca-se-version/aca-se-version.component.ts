// Qué hace: mantenimiento de versiones SE + tab de secciones por versión.
// Cómo lo hace: CRUD de ACA_SE_VERSION; con versión guardada carga/crea secciones (tope 100% activas).
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DxFormComponent } from 'devextreme-angular/ui/form';
import { Observable, of, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { AcaSeVersion } from './models/aca-se-version';
import { AcaSeVersionService } from './aca-se-version.service';
import { AcaSeSeccion, AcaSeTipoEvaluacionLookup } from './seccion/models/aca-se-seccion';
import { AcaSeSeccionService } from './seccion/aca-se-seccion.service';

const ESTADO_FIELD = 'ACTIVO';

@Component({
  standalone: false,
	selector: 'app-aca-se-version',
	templateUrl: './aca-se-version.component.html',
	styleUrls: ['./aca-se-version.component.scss'],
})
export class AcaSeVersionComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;
	@ViewChild('fSeccion', { static: false }) formSeccion?: DxFormComponent;

	protected override etiquetaRegistro = 'la versión';
	protected override requiereEmpresaSesion = false;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_VERSION';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de versiones socioeconómico';

	// Qué hace: tab Datos (0) / Secciones (1) al editar una versión.
	tabVersionIndex = 0;
	secciones: AcaSeSeccion[] = [];
	seccionModel: AcaSeSeccion = this.serviceSeccion.modeloNuevo(0);
	popupSeccionVisible = false;
	seccionEsNueva = false;
	seccionFocusedKey: number | null = null;
	seccionSeleccionada: AcaSeSeccion | null = null;
	columnsSeccion: any[] = [];
	itemsSeccion: any[] = [];
	mTIPO_EVALUACION: AcaSeTipoEvaluacionLookup[] = [];

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: AcaSeVersionService,
		private serviceSeccion: AcaSeSeccionService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
		this.columnsSeccion = this.serviceSeccion.getColumns();
		this.itemsSeccion = this.buildItemsSeccion();
	}

	get puedeGestionarSecciones(): boolean {
		return Number(this.model?.CORR_VERSION ?? 0) > 0;
	}

	get porcentajeUsado(): number {
		return this.serviceSeccion.porcentajeUsado(this.secciones);
	}

	get porcentajeDisponible(): number {
		return this.serviceSeccion.porcentajeDisponible(this.secciones);
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.cargarLookUpTipoEvaluacion();
		this.consultar();
	}

	// Qué hace: carga GEN_LISTA TIPO_EVALUACION para el form/grilla de secciones.
	private cargarLookUpTipoEvaluacion(): void {
		this.serviceSeccion
			.getTIPO_EVALUACION()
			.pipe(take(1), catchError(() => of({ Result: false, Data: [] } as any)))
			.subscribe({
				next: (response: any) => {
					this.mTIPO_EVALUACION = Array.isArray(response?.Data)
						? response.Data.map((x: any) => ({
								Key: `${x.Key ?? x.key ?? ''}`.trim(),
								Value: `${x.Value ?? x.value ?? ''}`.trim(),
						  }))
						: [];
					this.columnsSeccion = this.serviceSeccion.getColumns(this.mTIPO_EVALUACION);
					this.itemsSeccion = this.buildItemsSeccion();
				},
			});
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
			this.tabVersionIndex = 0;
			this.secciones = [];
			this.seccionFocusedKey = null;
			this.seccionSeleccionada = null;
			this.cancelarSeccion();
		}
	}

	fillParam(xCORR_VERSION?: number): any {
		return { CORR_VERSION: xCORR_VERSION ?? 0 };
	}

	override fillData(xModel?: AcaSeVersion): AcaSeVersion {
		if (xModel !== undefined) {
			return {
				CORR_VERSION: xModel.CORR_VERSION,
				CODIGO: xModel.CODIGO,
				NOMBRE: xModel.NOMBRE,
				DESCRIPCION: xModel.DESCRIPCION,
				ACTIVO: xModel.ACTIVO,
				FECHA_VIGENCIA_INI: xModel.FECHA_VIGENCIA_INI,
				FECHA_VIGENCIA_FIN: xModel.FECHA_VIGENCIA_FIN,
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
			};
		}

		return {
			CORR_VERSION: 0,
			CODIGO: '',
			NOMBRE: '',
			DESCRIPCION: '',
			ACTIVO: false,
			FECHA_VIGENCIA_INI: null,
			FECHA_VIGENCIA_FIN: null,
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
		this.models = [...this.models].sort((a, b) => Number(a.CORR_VERSION) - Number(b.CORR_VERSION));
	}

	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as AcaSeVersion);
		const key = this.mttoGridKeyExpr as keyof AcaSeVersion;

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

		const key = this.mttoGridKeyExpr as keyof AcaSeVersion;
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
		this.tabVersionIndex = 0;
		this.cargarSecciones();
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
		this.tabVersionIndex = 0;
		this.cargarSecciones();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.habilitar();
		});
	}

	override nuevo(): void {
		super.nuevo();
		this.tabVersionIndex = 0;
		this.secciones = [];
		this.cancelarSeccion();
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

		if (this.banderaMtto === UpdateType.Add && this.model.ACTIVO === true && this.existeOtraVersionActiva()) {
			this.notifyFx(this.mensajeUnaSolaVersionActiva(), NotifyType.Warning, { raw: true });
			return;
		}

		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
			onSuccess: (data: unknown, isAdd: boolean) => {
				// Qué hace: tras alta, reabre edición y pasa al tab Secciones.
				if (!isAdd || !data) return;
				this.model = this.fillData(data as AcaSeVersion);
				this.modelUpdate = this.fillData(data as AcaSeVersion);
				this.AsignaStatus(UpdateType.Update);
				this.tabVersionIndex = 1;
				this.cargarSecciones();
				setTimeout(() => {
					this.dataForm?.instance?.option('formData', this.model);
					this.habilitar();
				});
			},
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
		this.cancelarSeccion();
		super.cancelar((item: any) => item.CORR_VERSION === this.modelUpdate.CORR_VERSION);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_VERSION))),
		});
	}

	activar_inactivar(): void {
		if (this.model?.ACTIVO !== true && this.existeOtraVersionActiva()) {
			this.notifyFx(this.mensajeUnaSolaVersionActiva(), NotifyType.Warning, { raw: true });
			return;
		}

		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	private existeOtraVersionActiva(): boolean {
		const corr = this.model?.CORR_VERSION ?? 0;
		return (this.models ?? []).some((m: AcaSeVersion) => m.ACTIVO === true && m.CORR_VERSION !== corr);
	}

	private mensajeUnaSolaVersionActiva(): string {
		const otra = (this.models ?? []).find((m: AcaSeVersion) => m.ACTIVO === true && m.CORR_VERSION !== (this.model?.CORR_VERSION ?? 0));
		if (otra) {
			return `Solo puede haber una versión activa. Desactive primero la versión ${otra.CODIGO} (${otra.NOMBRE}).`;
		}
		return 'Solo puede haber una versión activa. Desactive primero la otra versión.';
	}

	override bloquear(): void {
		this.dataForm?.instance?.getEditor('CORR_VERSION')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('CODIGO')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('NOMBRE')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('DESCRIPCION')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('FECHA_VIGENCIA_INI')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('FECHA_VIGENCIA_FIN')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('ACTIVO')?.option('readOnly', true);
	}

	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm?.instance?.getEditor('CORR_VERSION')?.option('readOnly', true);
			this.dataForm?.instance?.getEditor('CODIGO')?.option('readOnly', false);
			this.dataForm?.instance?.getEditor('NOMBRE')?.option('readOnly', false);
			this.dataForm?.instance?.getEditor('DESCRIPCION')?.option('readOnly', false);
			this.dataForm?.instance?.getEditor('FECHA_VIGENCIA_INI')?.option('readOnly', false);
			this.dataForm?.instance?.getEditor('FECHA_VIGENCIA_FIN')?.option('readOnly', false);
			this.dataForm?.instance?.getEditor('ACTIVO')?.option('readOnly', estadoSoloLectura);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm?.instance?.getEditor('CODIGO')?.focus();
		});
	}

	// --- Secciones ---

	// Qué hace: carga secciones de la versión actual.
	cargarSecciones(): void {
		const corr = Number(this.model?.CORR_VERSION ?? 0);
		if (corr <= 0) {
			this.secciones = [];
			return;
		}
		this.loadingVisible = true;
		this.serviceSeccion
			.getAll(corr)
			.pipe(take(1))
			.subscribe({
				next: (response) => {
					this.loadingVisible = false;
					this.secciones = Array.isArray(response?.Data) ? response.Data : [];
					const key = this.seccionFocusedKey;
					this.seccionSeleccionada =
						key != null ? this.secciones.find((s) => s.CORR_SECCION_SE === key) ?? null : null;
					if (!this.seccionSeleccionada) {
						this.seccionFocusedKey = null;
					}
				},
				error: (err) => {
					this.loadingVisible = false;
					this.secciones = [];
					this.seccionFocusedKey = null;
					this.seccionSeleccionada = null;
					this.notifyFx(
						`${err?.ErrorMessage ?? err?.error?.ErrorMessage ?? err?.message ?? 'No se pudieron cargar las secciones.'}`,
						NotifyType.Error,
						{ raw: true }
					);
				},
			});
	}

	nuevaSeccion(): void {
		if (!this.puedeGestionarSecciones) return;
		if (this.porcentajeUsado >= 100) {
			this.notifyFx('Las secciones activas ya suman 100%. No puede crear otra hasta liberar porcentaje.', NotifyType.Warning, {
				raw: true,
			});
			return;
		}
		this.seccionEsNueva = true;
		this.seccionModel = this.serviceSeccion.modeloNuevo(Number(this.model.CORR_VERSION));
		this.seccionModel.PORCENTAJE_MAXIMO = this.porcentajeDisponible;
		this.seccionModel.ORDEN = (this.secciones?.length ?? 0) + 1;
		this.tabVersionIndex = 1;
		this.popupSeccionVisible = true;
	}

	editarSeccionSeleccionada(): void {
		if (!this.seccionSeleccionada) {
			this.notifyFx('Seleccione una sección en la grilla.', NotifyType.Warning, { raw: true });
			return;
		}
		this.abrirEditarSeccion(this.seccionSeleccionada);
	}

	onSeccionFocusedRowChanged(e: any): void {
		const data = e?.row?.data as AcaSeSeccion | undefined;
		this.seccionSeleccionada = data ?? null;
		this.seccionFocusedKey = data?.CORR_SECCION_SE ?? null;
	}

	private abrirEditarSeccion(data: AcaSeSeccion): void {
		this.seccionEsNueva = false;
		this.seccionModel = { ...data };
		this.tabVersionIndex = 1;
		this.popupSeccionVisible = true;
	}

	cancelarSeccion(): void {
		this.popupSeccionVisible = false;
		this.seccionEsNueva = false;
		this.seccionModel = this.serviceSeccion.modeloNuevo(Number(this.model?.CORR_VERSION ?? 0));
	}

	guardarSeccion(): void {
		// Qué hace: toma snapshot del form sin pisar valores con un formData vacío.
		// Cómo lo hace: valida el dx-form; usa el mismo objeto mutado por DevExtreme (no merge ciego).
		const form = this.formSeccion?.instance;
		if (form) {
			const validacion = form.validate?.();
			if (validacion && validacion.isValid === false) {
				return;
			}
		}

		const payload: AcaSeSeccion = {
			...this.seccionModel,
			CORR_VERSION: Number(this.model.CORR_VERSION),
			CODIGO: `${this.seccionModel?.CODIGO ?? ''}`.trim(),
			NOMBRE_SECCION: `${this.seccionModel?.NOMBRE_SECCION ?? ''}`.trim(),
			DESCRIPCION: this.seccionModel?.DESCRIPCION ? `${this.seccionModel.DESCRIPCION}`.trim() : '',
			ORDEN: Number(this.seccionModel?.ORDEN ?? 0),
			PORCENTAJE_MAXIMO: Number(this.seccionModel?.PORCENTAJE_MAXIMO ?? 0),
			ACTIVO: !!this.seccionModel?.ACTIVO,
		};

		if (!this.serviceSeccion.esValido(payload, this.notifyFx.bind(this))) {
			return;
		}

		const usadoSinEsta = this.serviceSeccion.porcentajeUsado(
			this.secciones,
			this.seccionEsNueva ? undefined : payload.CORR_SECCION_SE
		);
		if (payload.ACTIVO && usadoSinEsta + Number(payload.PORCENTAJE_MAXIMO) > 100) {
			this.notifyFx(
				`El porcentaje supera el 100%. Disponible: ${(100 - usadoSinEsta).toFixed(2)}%.`,
				NotifyType.Warning,
				{ raw: true }
			);
			return;
		}

		const esNueva = this.seccionEsNueva;
		this.loadingVisible = true;
		const req = esNueva ? this.serviceSeccion.insert(payload) : this.serviceSeccion.update(payload);

		req.pipe(take(1)).subscribe({
			next: (response) => {
				this.loadingVisible = false;
				if (!response?.Result) {
					this.notifyFx(`${response?.ErrorMessage ?? 'No se pudo guardar la sección.'}`, NotifyType.Warning, { raw: true });
					return;
				}
				const fila = this.normalizarFilaSeccion(response.Data);
				if (!fila?.CORR_SECCION_SE) {
					this.notifyFx('La sección se guardó pero no se recibió la fila. Refresque el tab.', NotifyType.Warning, {
						raw: true,
					});
					this.cargarSecciones();
					this.cancelarSeccion();
					return;
				}
				if (esNueva) {
					const yaEsta = this.secciones.some((s) => s.CORR_SECCION_SE === fila.CORR_SECCION_SE);
					this.secciones = yaEsta
						? this.secciones.map((s) => (s.CORR_SECCION_SE === fila.CORR_SECCION_SE ? fila : s))
						: [...this.secciones, fila];
				} else {
					this.secciones = this.secciones.map((s) =>
						s.CORR_SECCION_SE === fila.CORR_SECCION_SE ? fila : s
					);
				}
				this.seccionFocusedKey = fila.CORR_SECCION_SE;
				this.seccionSeleccionada = fila;
				this.notifyFx('Sección guardada.', NotifyType.Success, { raw: true });
				this.cancelarSeccion();
			},
			error: (err) => {
				this.loadingVisible = false;
				const msg = this.mensajeErrorHttp(err, 'Error al guardar la sección.');
				const code = err?.error?.ErrorCode ?? err?.error?.errorCode;
				// Qué hace: validaciones de %/puntajes van en warning (el interceptor lanza BadRequest).
				const esValidacion =
					code === 4001 ||
					code === 4002 ||
					code === 4003 ||
					code === 4018 ||
					/porcentaje|máximo|reservan|puntaje|opción|bajar|disponible|100%/i.test(msg);
				this.notifyFx(msg, esValidacion ? NotifyType.Warning : NotifyType.Error, { raw: true });
			},
		});
	}

	activarInactivarSeleccionada(): void {
		const data = this.seccionSeleccionada;
		if (!data) {
			this.notifyFx('Seleccione una sección en la grilla.', NotifyType.Warning, { raw: true });
			return;
		}

		// Qué hace: si va a activar y el 100% ya está ocupado, avisa con warning (sin llamar al API).
		if (!data.ACTIVO) {
			const usado = this.serviceSeccion.porcentajeUsado(this.secciones, data.CORR_SECCION_SE);
			const pct = Number(data.PORCENTAJE_MAXIMO) || 0;
			if (usado >= 100) {
				this.notifyFx(
					`No puede activar esta sección porque ya hay secciones activas que suman el 100% (${usado.toFixed(2)}%). Desactive alguna o reduzca su % máximo para liberar porcentaje.`,
					NotifyType.Warning,
					{ raw: true }
				);
				return;
			}
			if (usado + pct > 100) {
				this.notifyFx(
					`No puede activar «${data.NOMBRE_SECCION}» (${pct}%): solo hay ${(100 - usado).toFixed(2)}% disponible (ya usados ${usado.toFixed(2)}%).`,
					NotifyType.Warning,
					{ raw: true }
				);
				return;
			}
		}

		this.loadingVisible = true;
		this.serviceSeccion
			.activarInactivar(data)
			.pipe(take(1))
			.subscribe({
				next: (response) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyFx(`${response?.ErrorMessage ?? 'No se pudo cambiar el estado.'}`, NotifyType.Warning, {
							raw: true,
						});
						return;
					}
					const fila = this.normalizarFilaSeccion(response.Data);
					if (!fila?.CORR_SECCION_SE) {
						this.cargarSecciones();
						return;
					}
					this.secciones = this.secciones.map((s) =>
						s.CORR_SECCION_SE === fila.CORR_SECCION_SE ? fila : s
					);
					this.seccionSeleccionada = fila;
					this.notifyFx(
						fila.ACTIVO ? 'Sección activada.' : 'Sección desactivada.',
						NotifyType.Success,
						{ raw: true }
					);
				},
				error: (err) => {
					this.loadingVisible = false;
					const msg = this.mensajeErrorHttp(err, 'No se pudo cambiar el estado.');
					const code = err?.error?.ErrorCode ?? err?.error?.errorCode;
					const esTopePorcentaje = code === 4002 || code === 4003 || /100%|porcentaje|activar/i.test(msg);
					this.notifyFx(msg, esTopePorcentaje ? NotifyType.Warning : NotifyType.Error, { raw: true });
				},
			});
	}

	// Qué hace: unifica Data del API (objeto o array de una fila).
	private normalizarFilaSeccion(data: any): AcaSeSeccion | null {
		if (!data) return null;
		if (Array.isArray(data)) {
			return (data[0] as AcaSeSeccion) ?? null;
		}
		return data as AcaSeSeccion;
	}

	// Qué hace: saca el mensaje útil de un HttpErrorResponse o del string que arma el ErrorInterceptor.
	// Cómo lo hace: si el interceptor lanzó "Error: …", limpia el prefijo; si no, lee ErrorMessage del body.
	private mensajeErrorHttp(err: any, fallback: string): string {
		if (typeof err === 'string' && err.trim()) {
			return err.replace(/^Error:\s*/i, '').trim();
		}
		const body = err?.error;
		const msg =
			body?.ErrorMessage ||
			body?.errorMessage ||
			err?.ErrorMessage ||
			(typeof body === 'string' ? body : '') ||
			err?.message ||
			fallback;
		return String(msg || fallback).replace(/^Error:\s*/i, '').trim();
	}

	// Qué hace: formulario de la modal de sección (filas que suman colCount 8).
	// Cómo lo hace: fila1 código/nombre/tipo; fila2 orden/%/activo; fila3 descripción a lo ancho.
	private buildItemsSeccion(): any[] {
		return [
			{
				dataField: 'CODIGO',
				label: { text: 'Código' },
				colSpan: 2,
				editorOptions: { maxLength: 50, showClearButton: true },
				validationRules: [{ type: 'required', message: 'Obligatorio' }],
			},
			{
				dataField: 'NOMBRE_SECCION',
				label: { text: 'Nombre' },
				colSpan: 3,
				editorOptions: { maxLength: 200, showClearButton: true },
				validationRules: [{ type: 'required', message: 'Obligatorio' }],
			},
			{
				dataField: 'TIPO_EVALUACION',
				label: { text: 'Tipo evaluación' },
				editorType: 'dxSelectBox',
				colSpan: 3,
				editorOptions: {
					dataSource: this.mTIPO_EVALUACION,
					valueExpr: 'Key',
					displayExpr: 'Value',
					searchEnabled: false,
					showClearButton: false,
					placeholder: 'Tipo...',
				},
				validationRules: [{ type: 'required', message: 'Obligatorio' }],
			},
			{
				dataField: 'ORDEN',
				label: { text: 'Orden' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { min: 0, showSpinButtons: true },
			},
			{
				dataField: 'PORCENTAJE_MAXIMO',
				label: { text: '% máximo' },
				editorType: 'dxNumberBox',
				colSpan: 3,
				editorOptions: { min: 0, max: 100, showSpinButtons: true, format: '#0.##' },
				validationRules: [{ type: 'required', message: 'Obligatorio' }],
			},
			{ dataField: 'ACTIVO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 3 },
			{
				dataField: 'DESCRIPCION',
				label: { text: 'Descripción' },
				editorType: 'dxTextArea',
				colSpan: 8,
				editorOptions: {
					height: 90,
					maxLength: 1000,
					autoResizeEnabled: false,
					width: '100%',
				},
			},
		];
	}
}
