import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import esMessages from 'devextreme/localization/messages/es.json';
import { loadMessages, locale } from 'devextreme/localization';
import { custom } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { DxFormComponent } from 'devextreme-angular/ui/form';

import { UpdateType } from '../shared/models/UpdateType.enum';
import { RowStatus } from '../shared/models/RowStatus.enum';
import { NotifyType } from '../shared/models/NotifyType';

import { AppInfoService } from 'src/app/shared/services/app-info.service';

@Component({
	selector: 'app-base-component',
	template: '',
})
export class CBaseComponent {
	@ViewChild('fData', { static: false }) dataForm!: DxFormComponent;

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

	notifyFx(xMessage: string, xType: NotifyType) {
		if (xType == NotifyType.Success) {
			notify({ message: xMessage, width: 'auto', shading: false }, 'success', 1500);
		} else if (xType == NotifyType.Error) {
			notify(
				{ message: xMessage, width: 'auto', shading: false, closeOnClick: true, closeOnOutsideClick: true },
				'error',
				500000
			);
		} else if (xType === NotifyType.Warning) {
			notify({ message: xMessage, width: 'auto', shading: false }, 'warning', 1500);
		} else {
			notify({ message: xMessage, width: 'auto', shading: false }, 'success', 1500);
		}
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
