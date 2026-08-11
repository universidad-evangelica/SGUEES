// Qué hace: vista de asignación de unidades del organigrama por tipo de usuario (rol).
// Cómo: grilla de roles + detalle con tab Unidades (sin modal); coordina lookups, CRUD de la intermedia y ScUnidadesTipoUsuarioService.
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';
import {
	ScUnidadLookupItem,
	ScUnidadesTipoUsuario,
	ScUnidadesTipoUsuarioRol,
} from './models/sc-unidades-tipo-usuario';
import { ScUnidadesTipoUsuarioService } from './sc-unidades-tipo-usuario.service';

@Component({
	selector: 'app-sc-unidades-tipo-usuario',
	templateUrl: './sc-unidades-tipo-usuario.component.html',
	styleUrls: ['./sc-unidades-tipo-usuario.component.scss'],
})
// Qué hace: componente de unidades por tipo de usuario.
// Cómo: extiende CBaseComponent; browse = roles; form = detalle del rol con grilla de unidades asignadas.
export class ScUnidadesTipoUsuarioComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;
	@ViewChild('gridUnidades', { static: false }) gridUnidades!: DxDataGridComponent;

	protected override etiquetaRegistro = 'la asignacion de unidades';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'TIPO_USUARIO';
	protected override mttoCampoEstado = 'ACTIVO';
	protected override mttoEstadoDescribeField = 'NOMBRE_UNIDAD';
	protected override mttoRemoteOperations = false;

	asignaciones: ScUnidadesTipoUsuario[] = [];
	unidadesDetalle: ScUnidadesTipoUsuario[] = [];
	unidadesEditando = false;
	unidadesInsertando = false;
	rolSeleccionado: ScUnidadesTipoUsuarioRol | null = null;
	unidadFocusedKey: number | null = null;
	unidadSeleccionada: ScUnidadesTipoUsuario | null = null;

	mCORR_UNIDAD: ScUnidadLookupItem[] = [];
	mCORR_UNIDAD_DISPONIBLES: ScUnidadLookupItem[] = [];
	asignandoTodasUnidades = false;

	readonly unidadesLookupColumns = [
		{ dataField: 'CORR_UNIDAD', caption: 'Corr.', width: 80 },
		{ dataField: 'CODIGO_UNIDAD', caption: 'Codigo', width: 100 },
		{ dataField: 'NOMBRE_UNIDAD', caption: 'Unidad', width: 260 },
	];

	private readonly maintenanceSubtitulo = 'Unidades por Tipo de Usuario';
	private clientKeySeq = 0;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScUnidadesTipoUsuarioService,
		private cdr: ChangeDetectorRef
	) {
		super(appInfoService, router);
		this.unidadDeleteButtonVisible = this.unidadDeleteButtonVisible.bind(this);
		this.selectedLookUpCORR_UNIDAD = this.selectedLookUpCORR_UNIDAD.bind(this);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
	}

	// Qué hace: texto del botón Asignar unidades en el ribbon (solo browse con permiso C).
	// Cómo: si no es browse o no hay permiso, devuelve vacío para ocultar btn1.
	get textoBtnAsignarUnidades(): string {
		return this.isBrowse() && this.permiteAdd ? 'Asignar unidades' : '';
	}

	// Qué hace: texto del botón Asignar todas en el ribbon (solo browse con permiso C).
	// Cómo: si no es browse o no hay permiso, devuelve vacío para ocultar btn2.
	get textoBtnAsignarTodas(): string {
		return this.isBrowse() && this.permiteAdd ? 'Asignar todas las unidades' : '';
	}

	// Qué hace: entrega el grid de roles al flujo base de CBaseComponent.
	// Cómo: devuelve la referencia dataGrid enlazada con @ViewChild, o null si aún no está disponible.
	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Qué hace: decide si mostrar el botón Activar en el toolbar del detalle.
	// Cómo: exige permisos, que no haya edición en curso y que la unidad seleccionada esté inactiva.
	get mostrarActivarUnidad(): boolean {
		const row = this.unidadSeleccionada;
		return (
			this.permiteEdit &&
			!this.unidadesEditando &&
			!!row?.CORR_UNIDAD &&
			row.ACTIVO === false
		);
	}

	// Qué hace: decide si mostrar el botón Desactivar en el toolbar del detalle.
	// Cómo: exige permisos, que no haya edición en curso y que la unidad seleccionada esté activa.
	get mostrarDesactivarUnidad(): boolean {
		const row = this.unidadSeleccionada;
		return (
			this.permiteEdit &&
			!this.unidadesEditando &&
			!!row?.CORR_UNIDAD &&
			row.ACTIVO !== false
		);
	}

	// Qué hace: indica a CBaseComponent qué fila usar para Activar/Desactivar.
	// Cómo: en detalle usa la unidad seleccionada; en browse delega al comportamiento base (rol).
	protected override obtenerFilaSeleccionada(): any | null {
		if (!this.isBrowse()) {
			const row = this.unidadSeleccionada;
			if (!row?.CORR_UNIDAD) {
				return null;
			}
			return row;
		}
		return super.obtenerFilaSeleccionada();
	}

	// Qué hace: tras Activar/Desactivar refresca la grilla de unidades del detalle.
	// Cómo: parchea unidadesDetalle por CORR_UNIDAD, reaplica selección y actualiza el badge del rol.
	protected override sincronizarSeleccionTrasCambioEstado(data: unknown): void {
		if (!this.isBrowse()) {
			if (!data || typeof data !== 'object') {
				return;
			}
			const record = data as ScUnidadesTipoUsuario;
			const corr = Number(record.CORR_UNIDAD);
			if (!corr) {
				return;
			}
			this.unidadesDetalle = (this.unidadesDetalle ?? []).map((item) =>
				Number(item.CORR_UNIDAD) === corr
					? {
							...item,
							...record,
							CORR_UNIDAD: corr,
							ACTIVO: record.ACTIVO !== false,
						}
					: item
			);
			this.aplicarSeleccionUnidad(corr);
			this.actualizarContadorUnidades(this.rolSeleccionado);
			this.cdr.detectChanges();
			return;
		}
		super.sincronizarSeleccionTrasCambioEstado(data);
	}

	// Qué hace: evita parchear la grilla de roles desde el flujo base cuando se está en detalle.
	// Cómo: si no es browse no hace nada; en browse delega a CBaseComponent.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.isBrowse()) {
			return;
		}
		super.aplicarRegistroEnGrid(data, isAdd);
	}

	// Qué hace: inicializa la vista al abrirla.
	// Cómo: fija subtítulo, modo Browse, carga lookup de unidades y consulta roles/asignaciones.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.AsignaStatus(UpdateType.Browse);
		this.getCORR_UNIDAD();
		this.consultar();
	}

	// Qué hace: reacciona a los cambios de estado del formulario (browse / detalle).
	// Cómo: llama a AsignaStatus del base y, al volver a Browse, restaura el subtítulo de mantenimiento.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	// Qué hace: construye el modelo de rol para la grilla/detalle.
	// Cómo: si recibe xModel copia TIPO_USUARIO, nombre y contador; si no, devuelve un rol vacío.
	override fillData(xModel?: ScUnidadesTipoUsuarioRol): ScUnidadesTipoUsuarioRol {
		if (xModel !== undefined) {
			return {
				TIPO_USUARIO: Number(xModel.TIPO_USUARIO),
				NOMBRE_TIPO_USUARIO: (xModel.NOMBRE_TIPO_USUARIO ?? '').trim(),
				CANT_UNIDADES: Number(xModel.CANT_UNIDADES ?? 0),
			};
		}
		return { TIPO_USUARIO: 0, NOMBRE_TIPO_USUARIO: '', CANT_UNIDADES: 0 };
	}

	// Qué hace: refresca datos según el modo actual.
	// Cómo: en detalle carga unidades del rol; en browse carga roles y asignaciones.
	consultar(): void {
		if (!this.isBrowse()) {
			this.cargarUnidadesDetalle();
			return;
		}
		this.getTIPO_USUARIO();
		this.consultarAsignaciones();
	}

	// Qué hace: carga los roles desde SEG_TIPO_USUARIO hacia models (grilla global mtto).
	// Cómo: lookup GetTIPO_USUARIO vía UrlSEGURIDADAPI y luego aplica contadores con las asignaciones.
	getTIPO_USUARIO(): void {
		this.appInfoService
			.getLookUp(
				'SC_UNIDADES_TIPO_USUARIO',
				'SEG_TIPO_USUARIO',
				'GetTIPO_USUARIO',
				undefined,
				environment.UrlSEGURIDADAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result || !Array.isArray(response.Data)) {
						this.models = [];
						return;
					}

					this.models = response.Data.map((item: any) => ({
						TIPO_USUARIO: Number(item.TIPO_USUARIO),
						NOMBRE_TIPO_USUARIO: (item.NOMBRE_TIPO_USUARIO ?? '').trim(),
						CANT_UNIDADES: 0,
					}));
					this.aplicarContadoresRoles();
					this.refrescarGridMtto(false);
				},
				error: (error) => {
					this.models = [];
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: carga el catálogo de unidades del organigrama para el lookup.
	// Cómo: lookup GetCORR_UNIDAD vía UrlGENERALAPI; filtra inactivas y actualiza las disponibles.
	getCORR_UNIDAD(): void {
		this.appInfoService
			.getLookUp(
				'SC_UNIDADES_TIPO_USUARIO',
				'SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES',
				'GetCORR_UNIDAD',
				undefined,
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result || !Array.isArray(response.Data)) {
						this.mCORR_UNIDAD = [];
						this.mCORR_UNIDAD_DISPONIBLES = [];
						return;
					}

					this.mCORR_UNIDAD = response.Data
						.filter((item: any) => item?.ACTIVO !== false)
						.map((item: any) => ({
							CORR_UNIDAD: Number(item.CORR_UNIDAD),
							CODIGO_UNIDAD: (item.CODIGO_UNIDAD ?? '').trim(),
							NOMBRE_UNIDAD: (item.NOMBRE_UNIDAD ?? '').trim(),
							ACTIVO: item.ACTIVO !== false,
						}));
					this.actualizarUnidadesLookupDisponibles();
				},
				error: (error) => {
					this.mCORR_UNIDAD = [];
					this.mCORR_UNIDAD_DISPONIBLES = [];
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: obtiene todas las asignaciones unidad-rol de la empresa.
	// Cómo: llama a getAll del servicio sin filtro de rol y recalcula CANT_UNIDADES en la grilla de roles.
	consultarAsignaciones(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}

		this.loadingVisible = true;
		this.service
			.getAll()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						this.asignaciones = [];
						this.aplicarContadoresRoles();
						return;
					}

					this.asignaciones = (response.Data ?? []).map((item: ScUnidadesTipoUsuario) => ({
						...item,
						CORR_UNIDAD: Number(item.CORR_UNIDAD),
						TIPO_USUARIO: Number(item.TIPO_USUARIO),
						ACTIVO: item.ACTIVO !== false,
					}));
					this.aplicarContadoresRoles();
					this.refrescarGridMtto(false);
				},
				error: (error) => {
					this.loadingVisible = false;
					this.asignaciones = [];
					this.aplicarContadoresRoles();
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: abre el detalle de unidades del rol seleccionado en la grilla.
	// Cómo: toma el rol del browse; si no hay fila, avisa y no abre.
	onAsignarUnidadesHeader(): void {
		const rol = this.obtenerRolSeleccionadoBrowse();
		if (!rol) {
			this.notifyFx('Debe seleccionar un rol.', NotifyType.Warning);
			return;
		}
		this.abrirAsignarUnidades(rol);
	}

	// Qué hace: asigna todas las unidades al rol seleccionado en la grilla.
	// Cómo: toma el rol del browse; si no hay fila, avisa; si hay, confirma y asigna.
	onAsignarTodasHeader(): void {
		const rol = this.obtenerRolSeleccionadoBrowse();
		if (!rol) {
			this.notifyFx('Debe seleccionar un rol.', NotifyType.Warning);
			return;
		}
		this.confirmarAsignarTodasUnidades(rol);
	}

	// Qué hace: abre el detalle del rol (modo form) con el tab Unidades.
	// Cómo: exige permiso de agregar (C); fija rolSeleccionado/model, limpia selección, pasa a Update y carga unidades.
	abrirAsignarUnidades(rol: ScUnidadesTipoUsuarioRol): void {
		if (!this.permiteAdd || !rol?.TIPO_USUARIO) {
			return;
		}
		this.rolSeleccionado = this.fillData(rol);
		this.model = this.fillData(rol);
		this.modelUpdate = this.fillData(rol);
		this.limpiarSeleccionUnidad();
		this.unidadesEditando = false;
		this.unidadesInsertando = false;
		this.AsignaStatus(UpdateType.Update);
		this.subTituloVentana = `Unidades - ${this.rolSeleccionado.NOMBRE_TIPO_USUARIO || 'Rol'}`;
		this.cargarUnidadesDetalle();
	}

	// Qué hace: pide confirmación para asignar todas las unidades del organigrama a un rol.
	// Cómo: exige permiso C y rol válido; si hay línea en edición avisa; confirmaAccion y ejecuta la carga masiva.
	confirmarAsignarTodasUnidades(rol?: ScUnidadesTipoUsuarioRol | null): void {
		if (!this.permiteAdd || this.asignandoTodasUnidades) {
			return;
		}
		const destino = rol ?? this.rolSeleccionado;
		if (!destino?.TIPO_USUARIO) {
			this.notifyFx('Debe indicar el rol.', NotifyType.Warning);
			return;
		}
		if (this.unidadesEditando) {
			this.notifyFx('Cancele o guarde la linea en edicion antes de asignar todas las unidades.', NotifyType.Warning);
			return;
		}

		const nombre = (destino.NOMBRE_TIPO_USUARIO ?? '').trim() || 'el rol seleccionado';
		this.confirmaAccion(
			'Asignar todas las unidades',
			`¿Desea asignar todas las unidades del organigrama a ${nombre}?`,
			() => this.ejecutarAsignarTodasUnidades(destino)
		);
	}

	// Qué hace: acción Guardar de la barra superior del detalle.
	// Cómo: si hay línea en edición la guarda; si no, vuelve a la grilla de roles.
	guardar(): void {
		if (this.unidadesEditando) {
			this.guardarUnidadEditada();
			return;
		}
		this.cerrarDetalleUnidades();
	}

	// Qué hace: acción Cancelar de la barra superior: vuelve al listado de roles.
	// Cómo: si hay línea en edición avisa; si no, confirma y cierra el detalle.
	override cancelar(): void {
		if (this.unidadesEditando) {
			this.notifyFx('Cancele o guarde la linea en edicion antes de salir.', NotifyType.Warning);
			return;
		}
		this.confirmaCancelar(() => this.cerrarDetalleUnidades());
	}

	// Qué hace: inicia una nueva fila de unidad en la grilla del detalle.
	// Cómo: exige permiso de agregar (C); actualiza lookup, marca insertando/editando y llama addRow.
	agregarUnidad(): void {
		if (!this.permiteAdd || this.unidadesEditando || !this.rolSeleccionado) {
			return;
		}
		this.actualizarUnidadesLookupDisponibles();
		this.unidadesInsertando = true;
		this.unidadesEditando = true;
		setTimeout(() => {
			this.gridUnidades?.instance?.addRow();
		});
	}

	// Qué hace: controla la visibilidad del botón Eliminar en Options.
	// Cómo: exige permiso de eliminar (D); oculta el delete de la fila en edición (editRowKey).
	unidadDeleteButtonVisible(e: any): boolean {
		if (!this.permiteDele) {
			return false;
		}
		const editKey = e?.component?.option?.('editing.editRowKey');
		if (editKey == null) {
			return !!e?.row?.data && !e?.row?.isNewRow;
		}
		return e?.row?.key !== editKey;
	}

	// Qué hace: sincroniza la unidad seleccionada al cambiar el foco de fila.
	// Cómo: pasa la fila o la key a aplicarSeleccionUnidad.
	onUnidadFocusedRowChanged(e: any): void {
		this.aplicarSeleccionUnidad(e?.row?.data ?? e?.rowKey);
	}

	// Qué hace: sincroniza la unidad seleccionada al hacer clic en una fila.
	// Cómo: ignora filas nuevas y pasa los datos a aplicarSeleccionUnidad.
	onUnidadRowClick(e: any): void {
		if (e?.row?.isNewRow) {
			return;
		}
		this.aplicarSeleccionUnidad(e?.data ?? e?.row?.data);
	}

	// Qué hace: cambia el estado activo/inactivo de la unidad seleccionada.
	// Cómo: reutiliza invocarActivarInactivar de CBaseComponent apuntando al servicio.
	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	// Qué hace: confirma la línea en edición de la grilla de unidades.
	// Cómo: llama saveEditData del dx-data-grid; el insert real ocurre en unidadRowInserting.
	guardarUnidadEditada(): void {
		const grid = this.gridUnidades?.instance;
		if (!grid || !this.unidadesEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Qué hace: descarta la línea en edición de unidades.
	// Cómo: cancelEditData del grid y limpia flags (sin recargar GetAll).
	cancelarUnidadEditada(): void {
		const grid = this.gridUnidades?.instance;
		if (grid) {
			grid.cancelEditData();
		}
		this.unidadesEditando = false;
		this.unidadesInsertando = false;
	}

	// Qué hace: inicializa los valores de una fila nueva de unidad.
	// Cómo: marca insertando/editando y rellena empresa/rol/unidad vacía con ACTIVO true.
	unidadInitNewRow(e: any): void {
		this.unidadesInsertando = true;
		this.unidadesEditando = true;
		e.data.CORR_EMPRESA = 0;
		e.data.TIPO_USUARIO = this.rolSeleccionado?.TIPO_USUARIO ?? 0;
		e.data.CORR_UNIDAD = null;
		e.data.CODIGO_UNIDAD = '';
		e.data.NOMBRE_UNIDAD = '';
		e.data.ACTIVO = true;
		e.data._clientKey = this.nextClientKey();
	}

	// Qué hace: marca que hay edición en curso al iniciar edición de fila.
	// Cómo: pone unidadesEditando = true.
	onUnidadEditingStart(_e: any): void {
		this.unidadesEditando = true;
	}

	// Qué hace: limpia flags al guardar edición del grid.
	// Cómo: pone unidadesEditando e unidadesInsertando en false.
	onUnidadSaved(_e: any): void {
		this.unidadesEditando = false;
		this.unidadesInsertando = false;
	}

	// Qué hace: limpia flags al cancelar edición del grid.
	// Cómo: pone unidadesEditando e unidadesInsertando en false.
	onUnidadEditCanceled(_e: any): void {
		this.unidadesEditando = false;
		this.unidadesInsertando = false;
	}

	// Qué hace: inserta la asignación unidad-rol vía API (cancela el insert local del grid).
	// Cómo: e.cancel = true, valida, llama insert y parchea la grilla con response.Data (sin GetAll).
	unidadRowInserting(e: any): void {
		e.cancel = true;
		const data = { ...(e.data as ScUnidadesTipoUsuario) };
		data.TIPO_USUARIO = this.rolSeleccionado?.TIPO_USUARIO ?? 0;

		if (!this.service.esValidoUnidad(data, this.notifyFx.bind(this))) {
			return;
		}

		this.loadingVisible = true;
		this.service
			.insert(data)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					this.notifyFx('Unidad asignada con exito!', NotifyType.Success, { raw: true });
					this.gridUnidades?.instance?.cancelEditData();
					this.unidadesEditando = false;
					this.unidadesInsertando = false;
					this.aplicarUnidadEnDetalle(this.mapUnidadAsignada(response.Data ?? data, data), true);
				},
				error: (error) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: elimina la asignación unidad-rol vía API (cancela el remove local del grid).
	// Cómo: e.cancel = true; exige permiso D; llama delete y quita la fila en memoria (sin GetAll).
	unidadRowRemoving(e: any): void {
		e.cancel = true;
		if (!this.permiteDele || this.unidadesEditando) {
			return;
		}
		const data = e.data as ScUnidadesTipoUsuario;
		this.loadingVisible = true;
		this.service
			.delete(data)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					this.notifyFx('Unidad removida con exito!', NotifyType.Success, { raw: true });
					if (Number(this.unidadFocusedKey) === Number(data.CORR_UNIDAD)) {
						this.limpiarSeleccionUnidad();
					}
					this.quitarUnidadDeDetalle(Number(data.CORR_UNIDAD));
				},
				error: (error) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: valida que la fila tenga unidad seleccionada antes de guardar.
	// Cómo: exige CORR_UNIDAD > 0; si falta marca isValid false con mensaje.
	unidadRowValidating(e: any): void {
		const corr = Number(e.newData?.CORR_UNIDAD ?? e.oldData?.CORR_UNIDAD ?? 0);
		if (!corr || corr <= 0) {
			e.isValid = false;
			e.errorText = 'Debe seleccionar una unidad.';
		}
	}

	// Qué hace: refleja el valor elegido en el lookup de unidad en la celda.
	// Cómo: setValue del cellInfo y detectChanges.
	onUnidadLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && value > 0 ? Number(value) : null;
		cellInfo.setValue(corr);
		this.cdr.detectChanges();
	}

	// Qué hace: extrae la key de la fila seleccionada en el lookup.
	// Cómo: toma CORR_UNIDAD de la primera fila del arreglo seleccionado.
	selectedLookUpCORR_UNIDAD(vRow: any): number {
		return vRow[0].CORR_UNIDAD;
	}

	// Qué hace: al elegir unidad en la celda, completa código y nombre desde el catálogo.
	// Cómo: setCellValue de DevExtreme: asigna CORR_UNIDAD y textos del item en mCORR_UNIDAD.
	setUnidadCellValue = (
		newData: ScUnidadesTipoUsuario,
		value: number | null,
		_currentRowData: ScUnidadesTipoUsuario
	): void => {
		const corr = value != null && Number(value) > 0 ? Number(value) : null;
		const catalog = this.mCORR_UNIDAD.find((item) => Number(item.CORR_UNIDAD) === Number(corr));
		newData.CORR_UNIDAD = corr;
		newData.CODIGO_UNIDAD = catalog?.CODIGO_UNIDAD ?? '';
		newData.NOMBRE_UNIDAD = catalog?.NOMBRE_UNIDAD ?? '';
	};

	// Qué hace: texto a mostrar en la columna Unidad del grid.
	// Cómo: usa NOMBRE_UNIDAD de la fila o, si falta, lo busca en mCORR_UNIDAD.
	unidadCatalogDisplay = (row: ScUnidadesTipoUsuario): string => {
		if (!row?.CORR_UNIDAD) {
			return '';
		}
		const nombre = (row.NOMBRE_UNIDAD ?? '').trim();
		if (nombre) {
			return nombre;
		}
		const catalog = this.mCORR_UNIDAD.find((item) => Number(item.CORR_UNIDAD) === Number(row.CORR_UNIDAD));
		return (catalog?.NOMBRE_UNIDAD ?? String(row.CORR_UNIDAD)).trim();
	};

	// Qué hace: cierra el detalle y vuelve a la grilla de roles.
	// Cómo: limpia estado local y AsignaStatus Browse; el contador ya quedó parcheado en memoria.
	private cerrarDetalleUnidades(): void {
		this.unidadesEditando = false;
		this.unidadesInsertando = false;
		this.limpiarSeleccionUnidad();
		this.unidadesDetalle = [];
		this.rolSeleccionado = null;
		this.AsignaStatus(UpdateType.Browse);
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
	}

	// Qué hace: fija unidadFocusedKey y unidadSeleccionada para Activar/Desactivar.
	// Cómo: acepta fila u correlativo; busca en unidadesDetalle y normaliza ACTIVO.
	private aplicarSeleccionUnidad(source: ScUnidadesTipoUsuario | number | null | undefined): void {
		if (source == null) {
			this.limpiarSeleccionUnidad();
			return;
		}

		let row: ScUnidadesTipoUsuario | null = null;
		if (typeof source === 'object') {
			const corr = Number(source.CORR_UNIDAD);
			if (!corr || corr <= 0) {
				this.limpiarSeleccionUnidad();
				return;
			}
			row =
				(this.unidadesDetalle ?? []).find((item) => Number(item.CORR_UNIDAD) === corr) ??
				({
					...source,
					CORR_UNIDAD: corr,
					ACTIVO: source.ACTIVO !== false,
				} as ScUnidadesTipoUsuario);
		} else {
			const corr = Number(source);
			if (!corr || corr <= 0) {
				this.limpiarSeleccionUnidad();
				return;
			}
			row = (this.unidadesDetalle ?? []).find((item) => Number(item.CORR_UNIDAD) === corr) ?? null;
		}

		if (!row?.CORR_UNIDAD) {
			this.limpiarSeleccionUnidad();
			return;
		}

		this.unidadFocusedKey = Number(row.CORR_UNIDAD);
		this.unidadSeleccionada = { ...row, ACTIVO: row.ACTIVO !== false };
		this.cdr.detectChanges();
	}

	// Qué hace: limpia la selección de unidad del detalle.
	// Cómo: null en focusedKey/seleccionada y detectChanges.
	private limpiarSeleccionUnidad(): void {
		this.unidadFocusedKey = null;
		this.unidadSeleccionada = null;
		this.cdr.detectChanges();
	}

	// Qué hace: actualiza el badge CANT_UNIDADES del rol abierto y de la grilla.
	// Cómo: cuenta activas en unidadesDetalle y refleja el valor en models.
	private actualizarContadorUnidades(rol: ScUnidadesTipoUsuarioRol | null): void {
		if (!rol) {
			return;
		}
		const cant = this.contarUnidadesActivas(this.unidadesDetalle);
		rol.CANT_UNIDADES = cant;
		const rolGrid = (this.models as ScUnidadesTipoUsuarioRol[]).find(
			(item) => Number(item.TIPO_USUARIO) === Number(rol.TIPO_USUARIO)
		);
		if (rolGrid) {
			rolGrid.CANT_UNIDADES = cant;
			this.models = [...this.models];
		}
	}

	// Qué hace: recalcula CANT_UNIDADES de todos los roles en browse.
	// Cómo: por cada rol cuenta asignaciones activas en this.asignaciones.
	private aplicarContadoresRoles(): void {
		this.models = ((this.models as ScUnidadesTipoUsuarioRol[]) ?? []).map((rol) => ({
			...rol,
			CANT_UNIDADES: this.asignaciones.filter(
				(item) =>
					Number(item.TIPO_USUARIO) === Number(rol.TIPO_USUARIO) && item.ACTIVO !== false
			).length,
		}));
	}

	// Qué hace: cuenta unidades activas de una lista.
	// Cómo: filtra ACTIVO !== false y retorna length.
	private contarUnidadesActivas(items: ScUnidadesTipoUsuario[]): number {
		return (items ?? []).filter((item) => item.ACTIVO !== false).length;
	}

	// Qué hace: carga las unidades asignadas al rol seleccionado.
	// Cómo: getAll(tipo), deduplica por CORR_UNIDAD, ordena, actualiza lookup/contador y selección.
	private cargarUnidadesDetalle(onLoaded?: () => void): void {
		const tipo = this.rolSeleccionado?.TIPO_USUARIO;
		if (!tipo) {
			this.unidadesDetalle = [];
			return;
		}

		this.loadingVisible = true;
		this.service
			.getAll(tipo)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						this.unidadesDetalle = [];
						this.limpiarSeleccionUnidad();
						this.actualizarContadorUnidades(this.rolSeleccionado);
						return;
					}

					const vistos = new Set<number>();
					this.unidadesDetalle = (response.Data ?? [])
						.map((item: ScUnidadesTipoUsuario) => ({
							...item,
							CORR_UNIDAD: Number(item.CORR_UNIDAD),
							TIPO_USUARIO: Number(item.TIPO_USUARIO),
							ACTIVO: item.ACTIVO !== false,
							_clientKey: `u-${item.CORR_UNIDAD}-${item.TIPO_USUARIO}`,
						}))
						.filter((item: ScUnidadesTipoUsuario) => {
							const corr = Number(item.CORR_UNIDAD);
							if (!corr || vistos.has(corr)) {
								return false;
							}
							vistos.add(corr);
							return true;
						})
						.sort(
							(a: ScUnidadesTipoUsuario, b: ScUnidadesTipoUsuario) =>
								Number(a.CORR_UNIDAD) - Number(b.CORR_UNIDAD)
						);

					if (
						this.unidadFocusedKey != null &&
						!this.unidadesDetalle.some(
							(item) => Number(item.CORR_UNIDAD) === Number(this.unidadFocusedKey)
						)
					) {
						this.limpiarSeleccionUnidad();
					} else if (this.unidadFocusedKey != null) {
						this.aplicarSeleccionUnidad(this.unidadFocusedKey);
					}

					this.actualizarUnidadesLookupDisponibles();
					this.actualizarContadorUnidades(this.rolSeleccionado);
					this.cdr.detectChanges();
					onLoaded?.();
				},
				error: (error) => {
					this.loadingVisible = false;
					this.unidadesDetalle = [];
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: deja en el lookup solo unidades aún no asignadas al rol.
	// Cómo: excluye CORR_UNIDAD ya presentes en unidadesDetalle (permite incluirCorr opcional).
	private actualizarUnidadesLookupDisponibles(incluirCorr: number | null = null): void {
		const asignadas = new Set(
			(this.unidadesDetalle ?? [])
				.map((item) => Number(item.CORR_UNIDAD))
				.filter((corr) => corr > 0)
		);

		this.mCORR_UNIDAD_DISPONIBLES = (this.mCORR_UNIDAD || []).filter((item) => {
			const corr = Number(item.CORR_UNIDAD);
			if (incluirCorr != null && corr === Number(incluirCorr)) {
				return true;
			}
			return !asignadas.has(corr);
		});
	}

	// Qué hace: obtiene el rol marcado en la grilla browse.
	// Cómo: usa model.TIPO_USUARIO cargado por focusedRowChanged; si falta, retorna null.
	private obtenerRolSeleccionadoBrowse(): ScUnidadesTipoUsuarioRol | null {
		const rol = this.model as ScUnidadesTipoUsuarioRol;
		if (!rol?.TIPO_USUARIO) {
			return null;
		}
		return rol;
	}

	// Qué hace: genera una key temporal para filas nuevas del grid.
	// Cómo: incrementa clientKeySeq y combina con timestamp.
	private nextClientKey(): string {
		this.clientKeySeq += 1;
		return `u-new-${Date.now()}-${this.clientKeySeq}`;
	}

	// Qué hace: asigna al rol todas las unidades activas que aún no tenga.
	// Cómo: una sola petición AsignarTodasUnidades (INSERT...SELECT); luego parchea memoria sin GetAll.
	private ejecutarAsignarTodasUnidades(rol: ScUnidadesTipoUsuarioRol): void {
		this.asignandoTodasUnidades = true;
		this.loadingVisible = true;
		this.service
			.asignarTodasUnidades({ TIPO_USUARIO: Number(rol.TIPO_USUARIO) })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.asignandoTodasUnidades = false;
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}

					const cant = Number(response.RowsAffected ?? 0);
					if (cant <= 0) {
						this.notifyFx('Todas las unidades ya estan asignadas a este rol.', NotifyType.Warning);
					} else {
						this.notifyFx(`Se asignaron ${cant} unidades al rol.`, NotifyType.Success, {
							raw: true,
						});
					}
					this.aplicarAsignacionMasivaEnMemoria(rol, cant);
				},
				error: (error) => {
					this.asignandoTodasUnidades = false;
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: arma la fila de unidad asignada para la grilla del detalle.
	// Cómo: usa response.Data, el fallback de la línea y el catálogo mCORR_UNIDAD para completar nombres.
	private mapUnidadAsignada(source: any, fallback?: ScUnidadesTipoUsuario): ScUnidadesTipoUsuario {
		const corrUnidad = Number(source?.CORR_UNIDAD ?? fallback?.CORR_UNIDAD ?? 0);
		const catalog = this.mCORR_UNIDAD.find((item) => Number(item.CORR_UNIDAD) === corrUnidad);
		const rol = this.rolSeleccionado;
		return {
			CORR_EMPRESA: Number(source?.CORR_EMPRESA ?? fallback?.CORR_EMPRESA ?? 0),
			CORR_UNIDAD: corrUnidad,
			CODIGO_UNIDAD: (source?.CODIGO_UNIDAD ?? fallback?.CODIGO_UNIDAD ?? catalog?.CODIGO_UNIDAD ?? '').toString().trim(),
			NOMBRE_UNIDAD: (source?.NOMBRE_UNIDAD ?? fallback?.NOMBRE_UNIDAD ?? catalog?.NOMBRE_UNIDAD ?? '').toString().trim(),
			TIPO_USUARIO: Number(source?.TIPO_USUARIO ?? fallback?.TIPO_USUARIO ?? rol?.TIPO_USUARIO ?? 0),
			NOMBRE_TIPO_USUARIO: (
				source?.NOMBRE_TIPO_USUARIO ??
				fallback?.NOMBRE_TIPO_USUARIO ??
				rol?.NOMBRE_TIPO_USUARIO ??
				''
			)
				.toString()
				.trim(),
			ACTIVO: source?.ACTIVO !== false && fallback?.ACTIVO !== false,
			_clientKey: `u-${source?.TIPO_USUARIO ?? rol?.TIPO_USUARIO}-${corrUnidad}`,
		};
	}

	// Qué hace: agrega o actualiza una unidad en el detalle y el contador, sin GetAll.
	// Cómo: si isAdd y no existe, la inserta; sincroniza asignaciones, lookup y CANT_UNIDADES.
	private aplicarUnidadEnDetalle(record: ScUnidadesTipoUsuario, isAdd: boolean): void {
		const corr = Number(record.CORR_UNIDAD);
		if (!corr) {
			return;
		}

		const existe = (this.unidadesDetalle ?? []).some((item) => Number(item.CORR_UNIDAD) === corr);
		if (isAdd && !existe) {
			this.unidadesDetalle = [...(this.unidadesDetalle ?? []), record].sort(
				(a, b) => Number(a.CORR_UNIDAD) - Number(b.CORR_UNIDAD)
			);
			this.asignaciones = [...(this.asignaciones ?? []), record];
		} else {
			this.unidadesDetalle = (this.unidadesDetalle ?? []).map((item) =>
				Number(item.CORR_UNIDAD) === corr ? { ...item, ...record } : item
			);
		}

		this.actualizarUnidadesLookupDisponibles();
		this.actualizarContadorUnidades(this.rolSeleccionado);
		this.cdr.detectChanges();
	}

	// Qué hace: quita una unidad del detalle en memoria.
	// Cómo: filtra unidadesDetalle y asignaciones por CORR_UNIDAD; actualiza lookup y contador.
	private quitarUnidadDeDetalle(corrUnidad: number): void {
		this.unidadesDetalle = (this.unidadesDetalle ?? []).filter(
			(item) => Number(item.CORR_UNIDAD) !== corrUnidad
		);
		this.asignaciones = (this.asignaciones ?? []).filter(
			(item) =>
				!(
					Number(item.TIPO_USUARIO) === Number(this.rolSeleccionado?.TIPO_USUARIO) &&
					Number(item.CORR_UNIDAD) === corrUnidad
				)
		);
		this.actualizarUnidadesLookupDisponibles();
		this.actualizarContadorUnidades(this.rolSeleccionado);
		this.cdr.detectChanges();
	}

	// Qué hace: refleja en memoria el resultado de asignar todas las unidades.
	// Cómo: en detalle agrega las del catálogo que falten; en browse suma RowsAffected al contador.
	private aplicarAsignacionMasivaEnMemoria(rol: ScUnidadesTipoUsuarioRol, asignadas: number): void {
		if (asignadas <= 0) {
			return;
		}

		if (
			!this.isBrowse() &&
			Number(this.rolSeleccionado?.TIPO_USUARIO) === Number(rol.TIPO_USUARIO)
		) {
			const ya = new Set(
				(this.unidadesDetalle ?? []).map((item) => Number(item.CORR_UNIDAD)).filter((corr) => corr > 0)
			);
			const nuevas = (this.mCORR_UNIDAD ?? [])
				.filter((item) => item.ACTIVO !== false && !ya.has(Number(item.CORR_UNIDAD)))
				.map((item) =>
					this.mapUnidadAsignada({
						TIPO_USUARIO: rol.TIPO_USUARIO,
						NOMBRE_TIPO_USUARIO: rol.NOMBRE_TIPO_USUARIO,
						CORR_UNIDAD: item.CORR_UNIDAD,
						CODIGO_UNIDAD: item.CODIGO_UNIDAD,
						NOMBRE_UNIDAD: item.NOMBRE_UNIDAD,
						ACTIVO: true,
					})
				);
			this.unidadesDetalle = [...(this.unidadesDetalle ?? []), ...nuevas].sort(
				(a, b) => Number(a.CORR_UNIDAD) - Number(b.CORR_UNIDAD)
			);
			this.asignaciones = [...(this.asignaciones ?? []), ...nuevas];
			this.actualizarUnidadesLookupDisponibles();
			this.actualizarContadorUnidades(this.rolSeleccionado);
			this.cdr.detectChanges();
			return;
		}

		this.models = ((this.models as ScUnidadesTipoUsuarioRol[]) ?? []).map((item) =>
			Number(item.TIPO_USUARIO) === Number(rol.TIPO_USUARIO)
				? { ...item, CANT_UNIDADES: Number(item.CANT_UNIDADES ?? 0) + asignadas }
				: item
		);
	}
}
