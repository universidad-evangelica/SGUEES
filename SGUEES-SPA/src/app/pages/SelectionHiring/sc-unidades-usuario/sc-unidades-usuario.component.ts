// Qué hace: vista para asignar unidades del organigrama directamente a usuarios.
// Cómo: browse de usuarios con contador y popup de unidades sincronizado por operaciones masivas o individuales.
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { from, of } from 'rxjs';
import { catchError, concatMap, map, take, toArray } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';
import {
	ScUnidadAsignarItem,
	ScUnidadLookupItem,
	ScUnidadesUsuario,
	ScUnidadesUsuarioBrowse,
} from './models/sc-unidades-usuario';
import { ScUnidadesUsuarioService } from './sc-unidades-usuario.service';

@Component({
	selector: 'app-sc-unidades-usuario',
	templateUrl: './sc-unidades-usuario.component.html',
	styleUrls: ['./sc-unidades-usuario.component.scss'],
})
export class ScUnidadesUsuarioComponent extends CBaseComponent implements OnInit {
	@ViewChild('dataGrid', { static: false }) dataGrid!: DataGridMttoComponent;
	@ViewChild('gridAsignarUnidades', { static: false }) gridAsignarUnidades?: DxDataGridComponent;

	protected override etiquetaRegistro = 'la asignacion de unidades';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'LOGIN_SISTEMA';
	protected override mttoRemoteOperations = false;

	asignaciones: ScUnidadesUsuario[] = [];
	usuarioSeleccionado: ScUnidadesUsuarioBrowse | null = null;
	mCORR_UNIDAD: ScUnidadLookupItem[] = [];
	unidadesModal: ScUnidadAsignarItem[] = [];
	popupAsignarVisible = false;
	asignandoUnidadesModal = false;
	asignandoTodasUnidades = false;

	private readonly maintenanceSubtitulo = 'Unidades por Usuario';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScUnidadesUsuarioService,
		private cdr: ChangeDetectorRef
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
	}

	// Qué hace: forma el título del popup.
	// Cómo: agrega el nombre del usuario seleccionado.
	get popupAsignarTitulo(): string {
		const nombre = (this.usuarioSeleccionado?.NOMBRE_USUARIO ?? '').trim();
		return nombre ? `Asignar unidades - ${nombre}` : 'Asignar unidades';
	}

	// Qué hace: muestra Asignar unidades (solo abre el modal; no exige U).
	get textoBtnAsignarUnidades(): string {
		return this.isBrowse() ? 'Asignar unidades' : '';
	}

	// Qué hace: muestra Asignar todas (escribe; exige U).
	get textoBtnAsignarTodas(): string {
		return this.isBrowse() && this.permiteEdit ? 'Asignar todas las unidades' : '';
	}

	// Qué hace: integra el grid con CBaseComponent.
	// Cómo: devuelve la referencia de DataGridMtto.
	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Qué hace: inicializa catálogos y asignaciones.
	// Cómo: fija browse y carga usuarios, unidades y relaciones existentes.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.AsignaStatus(UpdateType.Browse);
		this.getLOGIN_SISTEMA();
		this.getCORR_UNIDAD();
		this.consultarAsignaciones();
	}

	// Qué hace: conserva el subtítulo en browse.
	// Cómo: delega el estado base y repone el texto de mantenimiento.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	// Qué hace: normaliza una fila de usuario.
	// Cómo: limpia textos y convierte el contador a número.
	override fillData(xModel?: ScUnidadesUsuarioBrowse): ScUnidadesUsuarioBrowse {
		if (xModel) {
			return {
				LOGIN_SISTEMA: (xModel.LOGIN_SISTEMA ?? '').trim(),
				NOMBRE_USUARIO: (xModel.NOMBRE_USUARIO ?? '').trim(),
				CANT_UNIDADES: Number(xModel.CANT_UNIDADES ?? 0),
				ESTADO_USUARIO: xModel.ESTADO_USUARIO,
			};
		}
		return { LOGIN_SISTEMA: '', NOMBRE_USUARIO: '', CANT_UNIDADES: 0 };
	}

	// Qué hace: recarga la información de la vista.
	// Cómo: consulta los dos lookups y las asignaciones.
	consultar(): void {
		this.getLOGIN_SISTEMA();
		this.getCORR_UNIDAD();
		this.consultarAsignaciones();
	}

	// Qué hace: obtiene usuarios para el browse.
	// Cómo: llama SEG_USUARIO en UrlSEGURIDADAPI y agrega CANT_UNIDADES.
	getLOGIN_SISTEMA(): void {
		this.appInfoService
			.getLookUp(
				'SC_UNIDADES_USUARIO',
				'SEG_USUARIO',
				'GetLOGIN_SISTEMA',
				undefined,
				environment.UrlSEGURIDADAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.models = response?.Result && Array.isArray(response.Data)
						? response.Data.map((item: any) => ({
								LOGIN_SISTEMA: (item.LOGIN_SISTEMA ?? '').toString().trim(),
								NOMBRE_USUARIO: (item.NOMBRE_USUARIO ?? '').toString().trim(),
								ESTADO_USUARIO: item.ESTADO_USUARIO,
								CANT_UNIDADES: 0,
						  }))
						: [];
					this.aplicarContadoresUsuarios();
					this.refrescarGridMtto(false);
				},
				error: (error) => {
					this.models = [];
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: obtiene unidades activas para el popup.
	// Cómo: llama SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES en UrlGENERALAPI y filtra ACTIVO.
	getCORR_UNIDAD(): void {
		this.appInfoService
			.getLookUp(
				'SC_UNIDADES_USUARIO',
				'SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES',
				'GetCORR_UNIDAD',
				undefined,
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_UNIDAD = response?.Result && Array.isArray(response.Data)
						? response.Data
								.filter((item: any) => item?.ACTIVO !== false)
								.map((item: any) => ({
									CORR_UNIDAD: Number(item.CORR_UNIDAD),
									CODIGO_UNIDAD: (item.CODIGO_UNIDAD ?? '').toString().trim(),
									NOMBRE_UNIDAD: (item.NOMBRE_UNIDAD ?? '').toString().trim(),
									ACTIVO: item.ACTIVO !== false,
								}))
						: [];
				},
				error: (error) => {
					this.mCORR_UNIDAD = [];
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: consulta todas las asignaciones de la empresa.
	// Cómo: llama GetAll y recalcula el contador de cada usuario.
	consultarAsignaciones(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		this.loadingVisible = true;
		this.service.getAll().pipe(take(1)).subscribe({
			next: (response: any) => {
				this.loadingVisible = false;
				if (!response?.Result) {
					this.asignaciones = [];
					this.notifyApiResponse(response);
				} else {
					this.asignaciones = (response.Data ?? []).map((item: ScUnidadesUsuario) => ({
						...item,
						CORR_UNIDAD: Number(item.CORR_UNIDAD),
						LOGIN_SISTEMA: (item.LOGIN_SISTEMA ?? '').trim(),
					}));
				}
				this.aplicarContadoresUsuarios();
				this.refrescarGridMtto(false);
			},
			error: (error) => {
				this.loadingVisible = false;
				this.asignaciones = [];
				this.aplicarContadoresUsuarios();
				this.notifyApiError(error);
			},
		});
	}

	// Qué hace: abre el popup para el usuario enfocado.
	// Cómo: valida selección y arma checkboxes (lectura siempre; guardar exige U).
	onAsignarUnidadesHeader(): void {
		const usuario = this.obtenerUsuarioSeleccionadoBrowse();
		if (!usuario) {
			this.notifyFx('Debe seleccionar un usuario.', NotifyType.Warning);
			return;
		}
		this.usuarioSeleccionado = this.fillData(usuario);
		this.unidadesModal = this.armarUnidadesParaModal(usuario.LOGIN_SISTEMA);
		this.popupAsignarVisible = true;
		this.cdr.detectChanges();
	}

	// Qué hace: inicia la asignación masiva desde el ribbon.
	// Cómo: confirma la acción para el usuario enfocado.
	onAsignarTodasHeader(): void {
		const usuario = this.obtenerUsuarioSeleccionadoBrowse();
		if (!usuario) {
			this.notifyFx('Debe seleccionar un usuario.', NotifyType.Warning);
			return;
		}
		this.confirmarAsignarTodasUnidades(usuario);
	}

	// Qué hace: marca todas las unidades del popup.
	// Cómo: reemplaza la lista estableciendo SELECCION en true.
	selectTodos(): void {
		this.unidadesModal = this.unidadesModal.map((item) => ({ ...item, SELECCION: true }));
		this.cdr.detectChanges();
	}

	// Qué hace: desmarca todas las unidades del popup.
	// Cómo: reemplaza la lista estableciendo SELECCION en false.
	selectNinguno(): void {
		this.unidadesModal = this.unidadesModal.map((item) => ({ ...item, SELECCION: false }));
		this.cdr.detectChanges();
	}

	// Qué hace: cierra y limpia el popup.
	// Cómo: conserva el popup si todavía se está guardando.
	cerrarPopupAsignar(): void {
		if (this.asignandoUnidadesModal) {
			this.popupAsignarVisible = true;
			return;
		}
		this.limpiarPopup();
	}

	// Qué hace: guarda las diferencias de selección.
	// Cómo: todos usa asignación masiva, ninguno retiro masivo, parcial operaciones individuales.
	guardarAsignacionModal(): void {
		if (!this.permiteEdit || this.asignandoUnidadesModal) {
			return;
		}
		const usuario = this.usuarioSeleccionado;
		if (!usuario?.LOGIN_SISTEMA || !this.unidadesModal.length) {
			this.notifyFx('No hay unidades para asignar.', NotifyType.Warning);
			return;
		}
		const login = usuario.LOGIN_SISTEMA;
		const actuales = new Set(
			this.asignaciones
				.filter((item) => item.LOGIN_SISTEMA === login)
				.map((item) => Number(item.CORR_UNIDAD))
		);
		const aInsertar = this.unidadesModal.filter(
			(item) => item.SELECCION && !actuales.has(Number(item.CORR_UNIDAD))
		);
		const aEliminar = this.unidadesModal.filter(
			(item) => !item.SELECCION && actuales.has(Number(item.CORR_UNIDAD))
		);
		if (!aInsertar.length && !aEliminar.length) {
			this.notifyFx('Cambios guardados con exito!', NotifyType.Success, { raw: true });
			this.limpiarPopup();
			return;
		}
		if (this.unidadesModal.every((item) => item.SELECCION)) {
			this.ejecutarOperacionMasiva(login, true);
			return;
		}
		if (this.unidadesModal.every((item) => !item.SELECCION)) {
			this.ejecutarOperacionMasiva(login, false);
			return;
		}
		this.ejecutarOperacionesParciales(login, aInsertar, aEliminar);
	}

	// Qué hace: confirma asignar todas las unidades desde el ribbon.
	// Cómo: muestra diálogo y ejecuta el endpoint masivo si se acepta.
	private confirmarAsignarTodasUnidades(usuario: ScUnidadesUsuarioBrowse): void {
		if (!this.permiteEdit || this.asignandoTodasUnidades || this.asignandoUnidadesModal) {
			return;
		}
		const nombre = usuario.NOMBRE_USUARIO || usuario.LOGIN_SISTEMA;
		this.confirmaAccion(
			'Asignar todas las unidades',
			`¿Desea asignar todas las unidades del catalogo a ${nombre}?`,
			() => this.ejecutarOperacionMasiva(usuario.LOGIN_SISTEMA, true, true)
		);
	}

	// Qué hace: ejecuta asignación o retiro masivo.
	// Cómo: llama al endpoint, notifica y parchea memoria (sin GetAll).
	private ejecutarOperacionMasiva(login: string, asignar: boolean, desdeRibbon = false): void {
		this.asignandoUnidadesModal = !desdeRibbon;
		this.asignandoTodasUnidades = desdeRibbon;
		this.loadingVisible = true;
		const request$ = asignar
			? this.service.asignarTodasUnidades({ LOGIN_SISTEMA: login })
			: this.service.quitarTodasUnidades({ LOGIN_SISTEMA: login });
		request$.pipe(take(1)).subscribe({
			next: (response: any) => {
				this.finalizarCargaMasiva();
				if (!response?.Result) {
					this.notifyApiResponse(response);
					return;
				}
				const cantidad = Number(response.RowsAffected ?? 0);
				const mensaje = asignar
					? cantidad > 0
						? `Se asignaron ${cantidad} unidades al usuario.`
						: 'Todas las unidades ya estaban asignadas al usuario.'
					: cantidad > 0
						? `Se quitaron ${cantidad} unidades del usuario.`
						: 'El usuario no tenia unidades asignadas.';
				this.notifyFx(mensaje, cantidad > 0 ? NotifyType.Success : NotifyType.Warning, { raw: true });

				if (asignar) {
					this.aplicarAsignacionMasivaEnMemoria(login, cantidad);
				} else if (cantidad > 0) {
					this.aplicarQuitarTodosEnMemoria(login);
				}

				if (!desdeRibbon) {
					this.limpiarPopup();
				}
				this.cdr.detectChanges();
			},
			error: (error) => {
				this.finalizarCargaMasiva();
				this.notifyApiError(error);
			},
		});
	}

	// Qué hace: sincroniza una selección parcial.
	// Cómo: insert/delete uno a uno; parchea con response.Data (sin GetAll).
	private ejecutarOperacionesParciales(
		login: string,
		aInsertar: ScUnidadAsignarItem[],
		aEliminar: ScUnidadAsignarItem[]
	): void {
		const operaciones = [
			...aInsertar.map((unidad) => ({ tipo: 'insert' as const, unidad })),
			...aEliminar.map((unidad) => ({ tipo: 'delete' as const, unidad })),
		];
		this.asignandoUnidadesModal = true;
		this.loadingVisible = true;
		from(operaciones)
			.pipe(
				concatMap((op) => {
					const payload: ScUnidadesUsuario = {
						CORR_EMPRESA: 0,
						CORR_UNIDAD: Number(op.unidad.CORR_UNIDAD),
						CODIGO_UNIDAD: op.unidad.CODIGO_UNIDAD ?? '',
						NOMBRE_UNIDAD: op.unidad.NOMBRE_UNIDAD,
						LOGIN_SISTEMA: login,
						NOMBRE_USUARIO: this.usuarioSeleccionado?.NOMBRE_USUARIO ?? '',
					};
					const request$ = op.tipo === 'insert'
						? this.service.insert(payload)
						: this.service.delete(payload);
					return request$.pipe(
						take(1),
						catchError((error) => of({
							Result: false,
							ErrorMessage: error?.error?.ErrorMessage || error?.message || 'No se pudo actualizar la unidad.',
							_tipo: op.tipo,
							_unidad: op.unidad,
						})),
						map((response: any) => ({
							...response,
							_tipo: op.tipo,
							_unidad: op.unidad,
						}))
					);
				}),
				toArray()
			)
			.subscribe({
				next: (responses: any[]) => {
					this.asignandoUnidadesModal = false;
					this.loadingVisible = false;

					const ok = responses.filter((item) => item?.Result);
					const fail = responses.filter((item) => !item?.Result);
					let insertOk = 0;
					let deleteOk = 0;

					for (const response of ok) {
						if (response._tipo === 'insert') {
							const mapped = this.mapUnidadAsignada(
								response.Data ?? response._unidad ?? {},
								login
							);
							if (mapped.CORR_UNIDAD) {
								this.aplicarUnidadAsignadaEnMemoria(mapped);
								insertOk += 1;
							}
						} else if (response._tipo === 'delete') {
							const corrUnidad = Number(response._unidad?.CORR_UNIDAD ?? 0);
							if (corrUnidad > 0) {
								this.aplicarUnidadEliminadaEnMemoria(login, corrUnidad);
								deleteOk += 1;
							}
						}
					}

					if (insertOk > 0 || deleteOk > 0) {
						const partes: string[] = [];
						if (insertOk > 0) {
							partes.push(
								insertOk === 1
									? '1 unidad asignada'
									: `${insertOk} unidades asignadas`
							);
						}
						if (deleteOk > 0) {
							partes.push(
								deleteOk === 1
									? '1 unidad quitada'
									: `${deleteOk} unidades quitadas`
							);
						}
						this.notifyFx(partes.join('. ') + '.', NotifyType.Success, { raw: true });
					}

					if (fail.length > 0) {
						this.notifyFx(
							fail[0]?.ErrorMessage || 'Algunas unidades no se pudieron actualizar.',
							NotifyType.Warning
						);
					}

					if ((insertOk > 0 || deleteOk > 0) && fail.length === 0) {
						this.limpiarPopup();
					} else if (insertOk > 0 || deleteOk > 0) {
						this.unidadesModal = this.armarUnidadesParaModal(login);
					}

					this.cdr.detectChanges();
				},
				error: (error) => {
					this.asignandoUnidadesModal = false;
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: recalcula CANT_UNIDADES del browse.
	// Cómo: cuenta las relaciones cuyo LOGIN_SISTEMA coincide con cada usuario.
	private aplicarContadoresUsuarios(): void {
		this.models = ((this.models as ScUnidadesUsuarioBrowse[]) ?? []).map((usuario) => ({
			...usuario,
			CANT_UNIDADES: this.asignaciones.filter(
				(item) => item.LOGIN_SISTEMA === usuario.LOGIN_SISTEMA
			).length,
		}));
	}

	// Qué hace: arma la fila de unidad asignada para memoria local.
	// Cómo: usa Data del API (OUTPUT/vista) y completa con catálogo si hace falta.
	private mapUnidadAsignada(source: any, login: string): ScUnidadesUsuario {
		const corrUnidad = Number(source?.CORR_UNIDAD ?? 0);
		const catalog = this.mCORR_UNIDAD.find((item) => Number(item.CORR_UNIDAD) === corrUnidad);
		return {
			CORR_EMPRESA: Number(source?.CORR_EMPRESA ?? 0),
			CORR_UNIDAD: corrUnidad,
			CODIGO_UNIDAD: (source?.CODIGO_UNIDAD ?? catalog?.CODIGO_UNIDAD ?? '').toString().trim(),
			NOMBRE_UNIDAD: (source?.NOMBRE_UNIDAD ?? catalog?.NOMBRE_UNIDAD ?? '').toString().trim(),
			LOGIN_SISTEMA: (source?.LOGIN_SISTEMA ?? login ?? '').toString().trim(),
			NOMBRE_USUARIO: (
				source?.NOMBRE_USUARIO ??
				this.usuarioSeleccionado?.NOMBRE_USUARIO ??
				''
			)
				.toString()
				.trim(),
		};
	}

	// Qué hace: agrega la asignación en memoria y actualiza el contador (sin GetAll).
	private aplicarUnidadAsignadaEnMemoria(record: ScUnidadesUsuario): void {
		const login = (record.LOGIN_SISTEMA ?? '').trim();
		const corrUnidad = Number(record.CORR_UNIDAD);
		if (!login || !corrUnidad) {
			return;
		}

		const existe = (this.asignaciones ?? []).some(
			(item) =>
				item.LOGIN_SISTEMA === login && Number(item.CORR_UNIDAD) === corrUnidad
		);
		if (!existe) {
			this.asignaciones = [...(this.asignaciones ?? []), record];
		}

		this.models = ((this.models as ScUnidadesUsuarioBrowse[]) ?? []).map((item) =>
			item.LOGIN_SISTEMA === login
				? {
						...item,
						CANT_UNIDADES: (this.asignaciones ?? []).filter(
							(a) => a.LOGIN_SISTEMA === login
						).length,
				  }
				: item
		);
	}

	// Qué hace: quita la asignación en memoria y actualiza el contador (sin GetAll).
	private aplicarUnidadEliminadaEnMemoria(login: string, corrUnidad: number): void {
		const loginNorm = (login ?? '').trim();
		if (!loginNorm || !corrUnidad) {
			return;
		}

		this.asignaciones = (this.asignaciones ?? []).filter(
			(item) =>
				!(item.LOGIN_SISTEMA === loginNorm && Number(item.CORR_UNIDAD) === corrUnidad)
		);

		this.models = ((this.models as ScUnidadesUsuarioBrowse[]) ?? []).map((item) =>
			item.LOGIN_SISTEMA === loginNorm
				? {
						...item,
						CANT_UNIDADES: (this.asignaciones ?? []).filter(
							(a) => a.LOGIN_SISTEMA === loginNorm
						).length,
				  }
				: item
		);
	}

	// Qué hace: refleja en memoria el resultado de asignar todas las unidades.
	private aplicarAsignacionMasivaEnMemoria(login: string, asignadas: number): void {
		if (asignadas <= 0) {
			return;
		}

		const loginNorm = (login ?? '').trim();
		const ya = new Set(
			(this.asignaciones ?? [])
				.filter((item) => item.LOGIN_SISTEMA === loginNorm)
				.map((item) => Number(item.CORR_UNIDAD))
				.filter((corr) => corr > 0)
		);
		const nuevos = (this.mCORR_UNIDAD ?? [])
			.filter((item) => item.ACTIVO !== false && !ya.has(Number(item.CORR_UNIDAD)))
			.map((item) =>
				this.mapUnidadAsignada(
					{
						LOGIN_SISTEMA: loginNorm,
						CORR_UNIDAD: item.CORR_UNIDAD,
						CODIGO_UNIDAD: item.CODIGO_UNIDAD,
						NOMBRE_UNIDAD: item.NOMBRE_UNIDAD,
					},
					loginNorm
				)
			);

		this.asignaciones = [...(this.asignaciones ?? []), ...nuevos];
		this.models = ((this.models as ScUnidadesUsuarioBrowse[]) ?? []).map((item) =>
			item.LOGIN_SISTEMA === loginNorm
				? { ...item, CANT_UNIDADES: Number(item.CANT_UNIDADES ?? 0) + asignadas }
				: item
		);
	}

	// Qué hace: limpia en memoria todas las unidades del usuario tras quitar masivo.
	private aplicarQuitarTodosEnMemoria(login: string): void {
		const loginNorm = (login ?? '').trim();
		if (!loginNorm) {
			return;
		}

		this.asignaciones = (this.asignaciones ?? []).filter(
			(item) => item.LOGIN_SISTEMA !== loginNorm
		);
		this.models = ((this.models as ScUnidadesUsuarioBrowse[]) ?? []).map((item) =>
			item.LOGIN_SISTEMA === loginNorm ? { ...item, CANT_UNIDADES: 0 } : item
		);
	}

	// Qué hace: arma las filas del popup.
	// Cómo: marca las unidades existentes para el LOGIN_SISTEMA recibido.
	private armarUnidadesParaModal(login: string): ScUnidadAsignarItem[] {
		const asignadas = new Set(
			this.asignaciones
				.filter((item) => item.LOGIN_SISTEMA === login)
				.map((item) => Number(item.CORR_UNIDAD))
		);
		return this.mCORR_UNIDAD
			.map((item) => ({ ...item, SELECCION: asignadas.has(Number(item.CORR_UNIDAD)) }))
			.sort((a, b) => Number(a.CORR_UNIDAD) - Number(b.CORR_UNIDAD));
	}

	// Qué hace: obtiene el usuario enfocado del browse.
	// Cómo: valida que el modelo actual contenga LOGIN_SISTEMA.
	private obtenerUsuarioSeleccionadoBrowse(): ScUnidadesUsuarioBrowse | null {
		const usuario = this.model as ScUnidadesUsuarioBrowse;
		return usuario?.LOGIN_SISTEMA ? usuario : null;
	}

	// Qué hace: restablece indicadores de operación masiva.
	// Cómo: apaga carga y ambos bloqueos de interacción.
	private finalizarCargaMasiva(): void {
		this.asignandoUnidadesModal = false;
		this.asignandoTodasUnidades = false;
		this.loadingVisible = false;
	}

	// Qué hace: limpia el estado del popup.
	// Cómo: oculta, vacía unidades y elimina el usuario seleccionado.
	private limpiarPopup(): void {
		this.popupAsignarVisible = false;
		this.unidadesModal = [];
		this.usuarioSeleccionado = null;
		this.cdr.detectChanges();
	}
}
