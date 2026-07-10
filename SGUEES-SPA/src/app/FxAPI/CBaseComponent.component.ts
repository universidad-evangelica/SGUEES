import { Component, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import esMessages from 'devextreme/localization/messages/es.json';
import { loadMessages, locale } from 'devextreme/localization';
import { custom } from 'devextreme/ui/dialog';
import { DxFormComponent } from 'devextreme-angular/ui/form';

import { UpdateType } from '../shared/models/UpdateType.enum';
import { RowStatus } from '../shared/models/RowStatus.enum';
import { NotifyType } from '../shared/models/NotifyType';

import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SgueesNotificationService } from 'src/app/shared/services/sguees-notification.service';
import {
	cleanApiMessage,
	getApiErrorMessage,
	getEmpresaWarningMessage,
	getNotifyTypeFromError,
	getNotifyTypeFromResponse,
	isEmpresaFkErrorMessage,
	mapApiErrorMessage,
} from 'src/app/shared/mtto/mtto-api-messages';

@Component({
	selector: 'app-base-component',
	template: '',
})
export class CBaseComponent {
	@ViewChild('fData', { static: false }) dataForm!: DxFormComponent;

	private readonly sgueesNotify = inject(SgueesNotificationService);
	private readonly sessionAuth = inject(AuthService, { optional: true });

	/** Etiqueta del registro para mensajes API (opt-in). */
	protected etiquetaRegistro = 'el registro';
	/** Valida CORR_EMPRESA en sesión antes de guardar (opt-in). */
	protected requiereEmpresaSesion = false;
	/** Normaliza duplicados, FK y empresa en notifyFx (opt-in, default true). */
	protected mapearMensajesApi = true;

  //#region <Declareando Variales>
	tituloVentana = '';
	subTituloVentana = '';
	urlOpcion = '';
	banderaMtto = UpdateType.Browse;
	loadingVisible = false;
	permiteSalir = true;
	permisos = 'ABC';
	permiteAdd = false;
	permiteEdit = false;
	permiteDele = false;
	permitePrint = false;
	model: any = this.fillData();
	models: any;
	modelUpdate: any;
	param: any;
	columns: any;
	summary: any;
	items: any;
	// #endregion

	constructor(public appInfoService: AppInfoService, public router: ActivatedRoute) {
		this.tituloVentana = router.snapshot.data['titulo'];
		this.urlOpcion = '/' + router.snapshot.routeConfig?.path;
		loadMessages(esMessages);
		locale(this.appInfoService.getLocale);
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));

		// Metodos como propiedades
		this.getPermiteEditar = this.getPermiteEditar.bind(this);
		this.getPermiteDele = this.getPermiteDele.bind(this);
		this.isBrowse = this.isBrowse.bind(this);
	}

	isBrowse(): boolean {
		if (this.banderaMtto === UpdateType.Browse) {
			return true;
		}
		return false;
	}

	isForm(): boolean {
		if (this.banderaMtto === UpdateType.Add || this.banderaMtto === UpdateType.Update) {
			return true;
		}
		return false;
	}

	getPermisos(permisos: string) {
		this.permiteAdd = false;
		this.permiteEdit = false;
		this.permiteDele = false;
		this.permitePrint = false;
		if (permisos.includes('C')) {
			this.permiteAdd = true;
		}
		if (permisos.includes('U')) {
			this.permiteEdit = true;
		}
		if (permisos.includes('D')) {
			this.permiteDele = true;
		}
		if (permisos.includes('P')) {
			this.permitePrint = true;
		}
	}

	//#region <Metodos Browse>
	focusedRowChanged(e: any) {
		this.model = e.row.data;
	}

	getPermiteEditar(e: any): boolean {
		if (this.permiteEdit) {
			return true;
		}
		return false;
	}

	getPermiteDele(e: any): boolean {
		if (this.permiteDele) {
			return true;
		}
		return false;
	}

	permitirSalir(): boolean | import('rxjs').Observable<boolean> | Promise<boolean> {
		if (this.permiteSalir) {
			return true;
		}
		const confirmacion = custom({
			title: 'Confirmación de Salida',
			messageHtml: '¿Quieres salir del formulario y perder los cambios realizados?',
			buttons: [
				{
					text: 'Si',
					onClick: (e: any) => true,
				},
				{
					text: 'No',
					onClick: (e: any) => false,
				},
			],
		});

		return confirmacion.show().then(() => {});
	}
	//#endregion

	//#region <Metodos Mtto>
	nuevo(): void {
		this.AsignaStatus(UpdateType.Add);
		this.modelUpdate = this.fillData(this.model);
		this.model = this.fillData();
		this.habilitar();
		this.setFocus();
	}

	editarClick(e: any) {
		e.event.preventDefault();
		this.AsignaStatus(UpdateType.Update);
		this.modelUpdate = this.fillData(this.model);
		this.habilitar();
		this.setFocus();
	}

	cancelar(findIndex: Function): void {
		const cancelRow = () => {
			this.AsignaStatus(UpdateType.Browse);
			this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
		};
		if (this.banderaMtto === UpdateType.Add || this.banderaMtto === UpdateType.Update) {
			this.confirmaCancelar(() => {
				this.model = this.modelUpdate;
				const vIndex = this.models.findIndex(findIndex);
				this.models[vIndex] = this.modelUpdate;
				cancelRow();
			});
		} else {
			cancelRow();
		}
	}
	//#endregion

	//#region <Metodos para sobrescribir en hijo>
	fillData(xModel?: any): any {}
	setFocus() {}
	bloquear(): void {}
	habilitar(): void {}
	//#endregion

	rowDblClick(e: any) {
		this.banderaMtto = UpdateType.Not_Defined;
		this.subTituloVentana = RowStatus.Browse.toString();
		setTimeout(() => {
			this.bloquear();
		});
	}

	AsignaStatus(xEstado: UpdateType): void {
		if (xEstado == UpdateType.Browse) {
			this.permiteSalir = true;
			this.subTituloVentana = RowStatus.Not_Defined.toString();
		} else if (xEstado == UpdateType.Add) {
			this.permiteSalir = false;
			this.subTituloVentana = RowStatus.Add.toString();
		} else if (xEstado == UpdateType.Update) {
			this.permiteSalir = false;
			this.subTituloVentana = RowStatus.Update.toString();
		} else if (xEstado == UpdateType.Delete) {
			this.permiteSalir = true;
			this.subTituloVentana = RowStatus.Delete.toString();
		} else if (xEstado == UpdateType.Not_Defined) {
			this.permiteSalir = true;
			this.subTituloVentana = RowStatus.Not_Defined.toString();
		}
		this.banderaMtto = xEstado;
	}

	notifyFx(xMessage: string, xType: NotifyType, options?: { raw?: boolean }): void {
		if (options?.raw || xType === NotifyType.Success) {
			this.sgueesNotify.show(cleanApiMessage(xMessage) || xMessage, xType);
			return;
		}

		const mapped = mapApiErrorMessage(xMessage, this.etiquetaRegistro);
		const type = this.resolveNotifyType(xMessage, xType);
		this.sgueesNotify.show(mapped, type);
	}

	notifyApiResponse(response: any): void {
		const type = getNotifyTypeFromResponse(response, this.etiquetaRegistro);
		const message = mapApiErrorMessage(
			response?.ErrorMessage || 'Ocurrió un error al procesar la solicitud.',
			this.etiquetaRegistro
		);
		this.sgueesNotify.show(message, type);
	}

	notifyApiError(error: any): void {
		const type = getNotifyTypeFromError(error, this.etiquetaRegistro);
		const message = mapApiErrorMessage(getApiErrorMessage(error), this.etiquetaRegistro);
		this.sgueesNotify.show(message, type);
	}

	asegurarEmpresaSesion(): boolean {
		if (!this.requiereEmpresaSesion) {
			return true;
		}

		const corrEmpresa = Number(this.sessionAuth?.decodedToken?.CORR_EMPRESA ?? 0);
		if (Number.isFinite(corrEmpresa) && corrEmpresa > 0) {
			return true;
		}

		this.notifyFx(getEmpresaWarningMessage(this.etiquetaRegistro), NotifyType.Warning, { raw: true });
		return false;
	}

	confirmaAccion(title: string, message: string, fn: () => void): void {
		const dialog = custom({
			title,
			messageHtml: '<div class="sguees-confirm-message">' + message + '</div>',
			buttons: [
				{ text: 'Si', type: 'default', onClick: () => true },
				{ text: 'No', onClick: () => false },
			],
		});

		dialog.show().then((accepted: boolean) => {
			if (accepted) {
				fn();
			}
		});
	}

	guardarMtto(options: {
		esValido?: () => boolean;
		insert: () => Observable<unknown>;
		update: () => Observable<unknown>;
		onSuccess?: (data: unknown, isAdd: boolean) => void;
		successAddMessage?: string;
		successUpdateMessage?: string;
	}): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}

		const formData = this.dataForm?.instance?.option('formData');
		if (formData) {
			this.model = { ...this.model, ...formData };
		}

		const formValidation = this.dataForm?.instance?.validate();
		if (formValidation && !formValidation.isValid) {
			options.esValido?.();
			return;
		}

		if (options.esValido && !options.esValido()) {
			return;
		}

		const isAdd = this.banderaMtto === UpdateType.Add;
		const action = isAdd ? options.insert() : options.update();

		this.loadingVisible = true;
		action.pipe(take(1)).subscribe({
			next: (response: any) => {
				if (response.Result) {
					this.model = response.Data;
					this.AsignaStatus(UpdateType.Browse);
					options.onSuccess?.(response.Data, isAdd);
					this.notifyFx(
						isAdd
							? options.successAddMessage ?? 'Registro creado con exito!'
							: options.successUpdateMessage ?? 'Registro modificado con exito!',
						NotifyType.Success,
						{ raw: true }
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

	consultarMtto(options: {
		load: () => Observable<unknown>;
		onData?: (data: unknown) => void;
	}): void {
		this.loadingVisible = true;
		options
			.load()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = response.Data;
						options.onData?.(response.Data);
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

	ejecutarDelete(options: {
		deleteFn: () => Observable<unknown>;
		onSuccess?: () => void;
		rowRemovingEvent?: any;
		successMessage?: string;
	}): void {
		this.loadingVisible = true;
		options
			.deleteFn()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						options.onSuccess?.();
						this.notifyFx(options.successMessage ?? 'Registro eliminado con exito!', NotifyType.Success, { raw: true });
					} else {
						if (options.rowRemovingEvent) {
							options.rowRemovingEvent.cancel = true;
						}
						this.notifyApiResponse(response);
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					if (options.rowRemovingEvent) {
						options.rowRemovingEvent.cancel = true;
					}
					this.notifyApiError(error);
					this.loadingVisible = false;
				},
			});
	}

	ejecutarCambioEstado(options: {
		activar: () => Observable<unknown>;
		desactivar: () => Observable<unknown>;
		activo: boolean;
		onSuccess?: () => void;
		successActivarMessage?: string;
		successDesactivarMessage?: string;
	}): void {
		const action = options.activo ? options.activar() : options.desactivar();

		this.loadingVisible = true;
		action.pipe(take(1)).subscribe({
			next: (response: any) => {
				if (response.Result) {
					options.onSuccess?.();
					this.notifyFx(
						options.activo
							? options.successActivarMessage ?? 'Registro activado con exito!'
							: options.successDesactivarMessage ?? 'Registro desactivado con exito!',
						NotifyType.Success,
						{ raw: true }
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

	private resolveNotifyType(message: string, requested: NotifyType): NotifyType {
		if (requested === NotifyType.Warning) {
			return NotifyType.Warning;
		}

		const value = cleanApiMessage(message).toLowerCase();
		if (
			isEmpresaFkErrorMessage(message) ||
			value.includes('ya existe') ||
			value.includes('duplicad') ||
			value.includes('ya ha sido ingresado') ||
			value.includes('asociados') ||
			value.includes('hijos asociados')
		) {
			return NotifyType.Warning;
		}

		return requested;
	}

	confirmaCancelar(fn: () => void) {
		const confirma = custom({
			title: 'Confirmación de Cancelar',
			messageHtml: '¿Quieres cancelar y perder los cambios realizados?',
			buttons: [
				{
					text: 'Si',
					onClick: (e: any) => true,
				},
				{
					text: 'No',
					onClick: (e: any) => false,
				},
			],
		});
		confirma.show().then((cancel: boolean) => {
			if (cancel) {
				fn();
			}
		});
	}

	screen(width: any): string {
		return width < 700 ? 'sm' : 'lg';
	}

	//Metodo para asignarlo a los campos que afectan a otros en un dx-form
	setCellValue(newData: any, value: any) {
		const column = this as any;
		column.defaultSetCellValue(newData, value);
	}
}
