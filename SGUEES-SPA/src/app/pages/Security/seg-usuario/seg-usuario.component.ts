import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { confirm } from 'devextreme/ui/dialog';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { SegUsuario } from './models/seg-usuario';
import { SegUsuarioService } from './seg-usuario.service';

@Component({
	selector: 'app-seg-usuario',
	templateUrl: './seg-usuario.component.html',
})
export class SegUsuarioComponent extends CBaseComponent implements OnInit {
	protected override etiquetaRegistro = 'el usuario';
	protected override requiereEmpresaSesion = false;
	protected override mttoGridKeyExpr = 'LOGIN_SISTEMA';

	mESTADO_USUARIO: any;
	mTIPO_USUARIO: any;
	mSEG_USUARIO_OPCION: any;
	opcionDetalleColumns: any[] = [];
	opcionDetallePageSize = 20;
	readOnly = false;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: SegUsuarioService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
		this.opcionDetalleColumns = this.service.getOpcionDetalleColumns();
	}

	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones(): void {}

	llenaComboBox(): void {
		this.getESTADO_USUARIO();
		this.getTIPO_USUARIO();
	}

	getESTADO_USUARIO(): void {
		this.appInfoService
			.getLookUp('SEG_USUARIO', 'GEN_LISTA', 'GetESTADO_USUARIO', undefined, environment.UrlSEGURIDADAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mESTADO_USUARIO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	getTIPO_USUARIO(): void {
		this.appInfoService
			.getLookUp('SEG_USUARIO', 'SEG_TIPO_USUARIO', 'GetTIPO_USUARIO', undefined, environment.UrlSEGURIDADAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mTIPO_USUARIO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	fillParam(xLOGIN_SISTEMA?: string): any {
		return { LOGIN_SISTEMA: xLOGIN_SISTEMA ?? '' };
	}

	override fillData(xModel?: SegUsuario): SegUsuario {
		if (xModel !== undefined) {
			return {
				LOGIN_SISTEMA: xModel.LOGIN_SISTEMA,
				NOMBRE_USUARIO: xModel.NOMBRE_USUARIO,
				CORREO_ELECTRONICO: xModel.CORREO_ELECTRONICO,
				TIPO_USUARIO: xModel.TIPO_USUARIO,
				NOMBRE_TIPO_USUARIO: xModel.NOMBRE_TIPO_USUARIO,
				ESTADO_USUARIO: xModel.ESTADO_USUARIO,
				NOMBRE_ESTADO_USUARIO: xModel.NOMBRE_ESTADO_USUARIO,
				IDIOMA: xModel.IDIOMA,
				USUARIO_CREA: xModel.USUARIO_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				USUARIO_AD: xModel.USUARIO_AD,
				DETALLE: xModel.DETALLE,
			};
		}

		return {
			LOGIN_SISTEMA: '',
			NOMBRE_USUARIO: '',
			CORREO_ELECTRONICO: '',
			TIPO_USUARIO: 0,
			NOMBRE_TIPO_USUARIO: '',
			ESTADO_USUARIO: 0,
			NOMBRE_ESTADO_USUARIO: '',
			IDIOMA: 'es-SV',
			USUARIO_CREA: '',
			FECHA_CREA: new Date(),
			ESTACION_CREA: '',
			USUARIO_ACTU: '',
			FECHA_ACTU: new Date(),
			ESTACION_ACTU: '',
			USUARIO_AD: '',
			DETALLE: [],
		};
	}

	consultar(): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
		});
	}

	override nuevo(): void {
		super.nuevo();
		this.consultarSEG_USUARIO_OPCION();
	}

	override editarClick(e: any): void {
		super.editarClick(e);
		this.consultarSEG_USUARIO_OPCION();
	}

	override rowDblClick(e: any): void {
		super.rowDblClick(e);
		this.consultarSEG_USUARIO_OPCION();
	}

	guardar(): void {
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.LOGIN_SISTEMA === this.modelUpdate.LOGIN_SISTEMA);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.LOGIN_SISTEMA)),
		});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('LOGIN_SISTEMA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_USUARIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORREO_ELECTRONICO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TIPO_USUARIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_USUARIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('USUARIO_AD')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			if (this.banderaMtto === UpdateType.Update) {
				this.dataForm.instance.getEditor('LOGIN_SISTEMA')?.option('readOnly', true);
			}
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			const field = this.banderaMtto === UpdateType.Add ? 'LOGIN_SISTEMA' : 'NOMBRE_USUARIO';
			this.dataForm.instance.getEditor(field)?.focus();
		});
	}

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

	selectedLookUpTIPO_USUARIO(vRow: any): any {
		return vRow[0].TIPO_USUARIO;
	}

	consultarSEG_USUARIO_OPCION(): void {
		this.service
			.getAllSEG_USUARIO_OPCION({ LOGIN_SISTEMA: this.model.LOGIN_SISTEMA })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mSEG_USUARIO_OPCION = response.Data;
					} else {
						this.notifyApiResponse(response);
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	private hasUsuarioKey(): boolean {
		return !!this.model?.LOGIN_SISTEMA?.trim();
	}

	private guardarEncabezadoParaDetalle(onSuccess: () => void, onCancel: () => void): void {
		if (this.hasUsuarioKey() && this.banderaMtto === UpdateType.Update) {
			onSuccess();
			return;
		}

		if (!this.service.esValido(this.model, this.notifyFx.bind(this))) {
			onCancel();
			return;
		}

		this.loadingVisible = true;
		this.service
			.insert(this.model)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response.Result) {
						this.models.push(response.Data);
						this.model = response.Data;
						this.modelUpdate = this.fillData(this.model);
						this.AsignaStatus(UpdateType.Update);
						this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
						onSuccess();
					} else {
						this.notifyApiResponse(response);
						onCancel();
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
					onCancel();
				},
			});
	}

	opcionDetalleCellValueChanged(e: any): void {
		if (e.dataField !== 'SELECCION') {
			return;
		}

		this.syncSeleccionOpcionFila(e.data, e.value);
		e.component.refresh(true);
	}

	opcionDetalleRowUpdated(e: any): void {
		if (!this.esOpcionDetalleValida(e.data)) {
			this.notifyFx('La opción no tiene códigos válidos para guardar.', NotifyType.Error);
			return;
		}

		e.cancel = new Promise((resolve, reject) => {
			const saveDetalle = (data: any) => {
				data.LOGIN_SISTEMA = this.model.LOGIN_SISTEMA;
				this.loadingVisible = true;
				this.service
					.insertUpdateSEG_USUARIO_OPCION(data)
					.pipe(take(1))
					.subscribe({
						next: (response: any) => {
							this.loadingVisible = false;
							if (response.Result) {
								this.mSEG_USUARIO_OPCION = response.Data;
								this.notifyFx('Registro guardado con exito!', NotifyType.Success, { raw: true });
								resolve(false);
							} else {
								this.notifyApiResponse(response);
								resolve(true);
							}
						},
						error: (error: any) => {
							this.loadingVisible = false;
							this.notifyApiError(error);
							reject(error);
						},
					});
			};

			this.guardarEncabezadoParaDetalle(
				() => saveDetalle(e.data),
				() => resolve(true)
			);
		});
	}

	seleccionarTodosOpciones(): void {
		if (this.readOnly) {
			return;
		}

		this.confirmaAccion(
			'Asignar todas las opciones',
			'¿Desea asignar todas las opciones del sistema a este usuario?',
			() => this.ejecutarSeleccionMasivaOpciones(true)
		);
	}

	seleccionarNingunoOpciones(): void {
		if (this.readOnly) {
			return;
		}

		this.confirmaAccion(
			'Quitar todas las opciones',
			'¿Desea quitar todas las opciones asignadas a este usuario?',
			() => this.ejecutarSeleccionMasivaOpciones(false)
		);
	}

	private syncSeleccionOpcionFila(data: any, seleccion: boolean): void {
		if (seleccion) {
			data.NUEVO = true;
			data.MODIFICAR = true;
			data.ELIMINAR = true;
			data.IMPRIMIR = true;
			return;
		}

		data.NUEVO = false;
		data.MODIFICAR = false;
		data.ELIMINAR = false;
		data.IMPRIMIR = false;
	}

	private ejecutarSeleccionMasivaOpciones(asignar: boolean): void {
		const filas = (this.mSEG_USUARIO_OPCION ?? []).filter((row: any) =>
			asignar ? !row.SELECCION : !!row.SELECCION
		);

		if (!filas.length) {
			this.notifyFx(
				asignar ? 'Todas las opciones ya están asignadas.' : 'No hay opciones asignadas.',
				NotifyType.Warning
			);
			return;
		}

		this.guardarEncabezadoParaDetalle(
			() => this.procesarSeleccionMasivaOpciones(filas, asignar, 0),
			() => {}
		);
	}

	private procesarSeleccionMasivaOpciones(
		filas: any[],
		asignar: boolean,
		index: number,
		omitidas = 0
	): void {
		if (index >= filas.length) {
			this.loadingVisible = false;
			this.consultarSEG_USUARIO_OPCION();
			if (omitidas > 0) {
				this.notifyFx(
					`Proceso completado con ${omitidas} opción(es) omitida(s) por datos incompletos.`,
					NotifyType.Warning
				);
			} else {
				this.notifyFx('Proceso completado con exito!', NotifyType.Success, { raw: true });
			}
			return;
		}

		const data = {
			...filas[index],
			LOGIN_SISTEMA: this.model.LOGIN_SISTEMA,
			SELECCION: asignar,
		};

		if (!this.esOpcionDetalleValida(data)) {
			this.procesarSeleccionMasivaOpciones(filas, asignar, index + 1, omitidas + 1);
			return;
		}

		this.syncSeleccionOpcionFila(data, asignar);

		this.loadingVisible = true;
		this.service
			.insertUpdateSEG_USUARIO_OPCION(data)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.procesarSeleccionMasivaOpciones(filas, asignar, index + 1, omitidas);
					} else {
						this.loadingVisible = false;
						this.notifyApiResponse(response);
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	private esOpcionDetalleValida(data: any): boolean {
		const codigoOpcion = `${data?.CODIGO_OPCION ?? ''}`.trim();
		const codigoSistema = `${data?.CODIGO_SISTEMA ?? ''}`.trim();
		const codigoMenu = `${data?.CODIGO_MENU ?? ''}`.trim();

		return codigoOpcion.length >= 4 && codigoSistema.length >= 4 && codigoMenu.length >= 4;
	}

	restablecerContrasena(e: any): void {
		const LOGIN_SISTEMA = e.row.data.LOGIN_SISTEMA;
		const NOMBRE_USUARIO = e.row.data.NOMBRE_USUARIO;

		const result = confirm(
			`¿Está seguro de restablecer la contraseña del usuario "${NOMBRE_USUARIO}" (${LOGIN_SISTEMA})?\n\nLa nueva contraseña será: ${LOGIN_SISTEMA}`,
			'Confirmar Restablecimiento'
		);

		result.then((dialogResult) => {
			if (dialogResult) {
				this.ejecutarRestablecerContrasena(LOGIN_SISTEMA);
			}
		});
	}

	restablecerContrasenaForm(): void {
		const LOGIN_SISTEMA = this.model.LOGIN_SISTEMA;
		const NOMBRE_USUARIO = this.model.NOMBRE_USUARIO;

		if (!LOGIN_SISTEMA) {
			this.notifyFx('Seleccione un usuario válido.', NotifyType.Warning);
			return;
		}

		const result = confirm(
			`¿Está seguro de restablecer la contraseña del usuario "${NOMBRE_USUARIO}" (${LOGIN_SISTEMA})?\n\nLa nueva contraseña será: ${LOGIN_SISTEMA}`,
			'Confirmar Restablecimiento'
		);

		result.then((dialogResult) => {
			if (dialogResult) {
				this.ejecutarRestablecerContrasena(LOGIN_SISTEMA);
			}
		});
	}

	private ejecutarRestablecerContrasena(LOGIN_SISTEMA: string): void {
		this.loadingVisible = true;
		this.service
			.restablecerContrasena(LOGIN_SISTEMA)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.notifyFx(
							`Contraseña restablecida exitosamente.\nNueva contraseña: ${LOGIN_SISTEMA}`,
							NotifyType.Success
						);
					} else {
						this.notifyApiResponse(response);
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.notifyApiError(error);
					this.loadingVisible = false;
				},
			});
	}
}
