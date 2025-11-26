import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ComBitacora } from './models/com-bitacora';
import { ComBitacoraService } from './com-bitacora.service';

import { exportDataGrid } from 'devextreme/excel_exporter';
import ExcelJS from 'exceljs';
import {saveAs} from 'file-saver-es';

import { ComBitacoraLookUp } from './models/com-bitacora-lookup';

@Component({
	selector: 'app-com-bitacora',
	templateUrl: './com-bitacora.component.html',
	styleUrls: ['./com-bitacora.component.scss'],
})
export class ComBitacoraComponent extends CBaseComponent implements OnInit {

  //#region <Declarando Variales>
	mCLASE_BITACORA: any;
	mCODIGO_OPCION: any;
  mLookUps:ComBitacoraLookUp={CLASE_BITACORA:'',CODIGO_OPCION:''};
  isDropDownBoxOpened = false;
	readOnly = false;
  vFECHA_INICIAL: any;
	vFECHA_FINAL: any;
  isDrawerOpen = true;

  toolbarContent = [
    {
      widget: 'dxButton',
      location: 'before',
      options: {
        icon: 'menu',
        onClick: () => (this.isDrawerOpen = !this.isDrawerOpen),
      },
    },
  ];
	// #endregion
  constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ComBitacoraService
	) {
		super(appInfoService, router);
		// this.columns = this.service.getColumns();
		// this.summary = this.service.getSummary();
		// this.items = this.service.getItems();
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {
    this.vFECHA_INICIAL = this.appInfoService.dateAdd(this.appInfoService.getDate(), 'day', -1);
		this.vFECHA_FINAL = this.appInfoService.getDate();
  }
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getCLASE_BITACORA();
    this.getCODIGO_OPCION();
	}

	getCLASE_BITACORA() {
		this.appInfoService
			.getLookUp('COM_BITACORA', 'GEN_LISTA', 'GetCLASE_BITACORA', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCLASE_BITACORA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
  getCODIGO_OPCION() {
		this.appInfoService
			.getLookUp('COM_BITACORA', 'GEN_LISTA', 'GetCODIGO_OPCION_COMPRAS', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCODIGO_OPCION = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_BITACORA?: number): any {
		if (xCORR_BITACORA == undefined) {
			xCORR_BITACORA = 0;
		}
		return {
			CORR_BITACORA: xCORR_BITACORA,
      FECHA_INICIAL: this.vFECHA_INICIAL.toISOString(),
			FECHA_FINAL: this.vFECHA_FINAL.toISOString(),
      CODIGO_OPCION: this.mLookUps.CODIGO_OPCION,
      CLASE_BITACORA: this.mLookUps.CLASE_BITACORA,
		};
	}

	override fillData(xModel?: ComBitacora): ComBitacora {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_BITACORA: xModel.CORR_BITACORA,
				FECHA_BITACORA: xModel.FECHA_BITACORA,
				CODIGO_OPCION: xModel.CODIGO_OPCION,
				NOMBRE_CODIGO_OPCION: xModel.NOMBRE_CODIGO_OPCION,
				CLASE_BITACORA: xModel.CLASE_BITACORA,
				NOMBRE_CLASE_BITACORA: xModel.NOMBRE_CLASE_BITACORA,
				LLAVE_TRANSACCION: xModel.LLAVE_TRANSACCION,
				REFERENCIA_TRANSACCION: xModel.REFERENCIA_TRANSACCION,
				USUARIO_CREA_TRANS: xModel.USUARIO_CREA_TRANS,
				ESTACION_CREA_TRANS: xModel.ESTACION_CREA_TRANS,
				FECHA_CREA_TRANS: xModel.FECHA_CREA_TRANS,
				USUARIO_ACTU_TRANS: xModel.USUARIO_ACTU_TRANS,
				ESTACION_ACTU_TRANS: xModel.ESTACION_ACTU_TRANS,
				FECHA_ACTU_TRANS: xModel.FECHA_ACTU_TRANS,
				USUARIO_CREA_BITACORA: xModel.USUARIO_CREA_BITACORA,
				ESTACION_CREA_BITACORA: xModel.ESTACION_CREA_BITACORA,
				FECHA_CREA_BITACORA: xModel.FECHA_CREA_BITACORA,
			};
		} else {
			return {
				CORR_EMPRESA: 1,
				CORR_BITACORA: 0,
				FECHA_BITACORA: new Date(),
				CODIGO_OPCION: '',
				NOMBRE_CODIGO_OPCION: '',
				CLASE_BITACORA: '',
				NOMBRE_CLASE_BITACORA: '',
				LLAVE_TRANSACCION: '',
				REFERENCIA_TRANSACCION: '',
				USUARIO_CREA_TRANS: '',
				ESTACION_CREA_TRANS: '',
				FECHA_CREA_TRANS: new Date(),
				USUARIO_ACTU_TRANS: '',
				ESTACION_ACTU_TRANS: '',
				FECHA_ACTU_TRANS: new Date(),
				USUARIO_CREA_BITACORA: '',
				ESTACION_CREA_BITACORA: '',
				FECHA_CREA_BITACORA: new Date(),
			};
		}
	}

	consultar() {
    this.loadingVisible = true;
		this.service
			.getAll(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
      });
    this.loadingVisible = false;
	}

	guardar(): void {
		if (!this.service.esValido(this.model, this.notifyFx)) {
			return;
		}

		this.loadingVisible = true;
		if (this.banderaMtto === UpdateType.Add) {
			this.service
				.insert(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.models.push(response.Data);
							this.model = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							this.notifyFx('Registro creado con exito!', NotifyType.Success);
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
						this.loadingVisible = false;
					},
				});
		} else if (this.banderaMtto === UpdateType.Update) {
			this.service
				.update(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.model = response.Data;
							const vIndex = this.models.findIndex((item: any) => item.CORR_BITACORA === response.Data.CORR_BITACORA);
							this.models[vIndex] = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							this.notifyFx('Registro modificado con exito!', NotifyType.Success);
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
						this.loadingVisible = false;
					},
				});
		}
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_BITACORA === this.modelUpdate.CORR_BITACORA);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_BITACORA))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
						e.component.refresh();
					} else {
						e.cancel = true;
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					e.cancel = true;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('ANIO_PERIODO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_BITACORA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_BITACORA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_OPCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CLASE_BITACORA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('LLAVE_TRANSACCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('REFERENCIA_TRANSACCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('USUARIO_CREA_TRANS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTACION_CREA_TRANS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_CREA_TRANS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('USUARIO_ACTU_TRANS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTACION_ACTU_TRANS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_ACTU_TRANS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('USUARIO_CREA_BITACORA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTACION_CREA_BITACORA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_CREA_BITACORA')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_BITACORA')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
  selectedCLASE_BITACORALookUp(vRow: any): any {
		return vRow[0].Key;
	}
  onExporting(e: any) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bitacora');

    function setAlternatingRowsBackground(gridCell: any, excelCell: any): void {
      if (gridCell.rowType === 'header' || gridCell.rowType === 'data') {
        if (excelCell.fullAddress.row % 2 === 0) {
          excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D3D3D3' }, bgColor: { argb: 'D3D3D3' }};
        }
      }
    }

    exportDataGrid({
      worksheet,
      component: e.component,
      keepColumnWidths: true,
      autoFilterEnabled: true,
      topLeftCell: { row: 1, column: 1 },
        customizeCell: ({ gridCell, excelCell }) => {
          setAlternatingRowsBackground(gridCell, excelCell);
        }
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer: BlobPart) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Bitacora.xlsx');
      });
    });
  }
}
