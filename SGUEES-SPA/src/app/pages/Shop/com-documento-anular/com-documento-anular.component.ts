import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take, filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ComDocumentoAnularService } from './com-documento-anular.service';
import { exportDataGrid } from 'devextreme/excel_exporter';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver-es';
import { custom } from 'devextreme/ui/dialog';
import { ComDocumentoAnularCr } from './models/com-documento-anular-cr';

@Component({
  selector: 'app-com-documento-Anular',
  templateUrl: './com-documento-Anular.component.html',
  styleUrls: ['./com-documento-Anular.component.scss'],
})
export class ComDocumentoAnularComponent extends CBaseComponent implements OnInit {

  //#region <Declarando Variables>
  isDropDownBoxOpened = false;
  readOnly = false;
  vFECHA_INICIAL: any;
  vFECHA_FINAL: any;
  isDrawerOpen = true;
  popupVisibleAnularCR = false;
  mDocumentoAnularCR: ComDocumentoAnularCr = {
    CORR_EMPRESA: 0,
    ANIO_PERIODO: 0,
    MES_PERIODO: 0,
    CORR_DOCUMENTO: 0,
    MOTIVO_ANULACION: ''
  };
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

  allowEditing = false;
  // #endregion
  constructor(
    public override appInfoService: AppInfoService,
    public override router: ActivatedRoute,
    private service: ComDocumentoAnularService
  ) {
    super(appInfoService, router);
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
  }
  //#endregion

  //#region <Metodos Mtto>
  fillParam(): any {
    return {
      FECHA_INICIAL: this.vFECHA_INICIAL.toISOString(),
      FECHA_FINAL: this.vFECHA_FINAL.toISOString(),
    };
  }

  consultar() {
    this.loadingVisible = true;
    this.service
      .getAllAnular(this.fillParam())
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.models = response.Data;
            //console.log('Componente inicializado', this.model)
            this.loadingVisible = false;
          }
        },
        error: (error: any) => {
          this.loadingVisible = false;
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }
  //#endregion

  selectedLookUpLista(vRow: any): any {
    return vRow[0].Key;
  }

  onExporting(e: any) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('CotizacionConsulta');

    function setAlternatingRowsBackground(gridCell: any, excelCell: any): void {
      if (gridCell.rowType === 'header' || gridCell.rowType === 'data') {
        if (excelCell.fullAddress.row % 2 === 0) {
          excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D3D3D3' }, bgColor: { argb: 'D3D3D3' } };
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
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'DocumentosAnularxlsx');
      });
    });
  }
  selectTodos() {
    this.models.forEach((x: any) => {
      x.SELECCION = true;
    });
  }

  selectNinguno() {
    this.models.forEach((x: any) => {
      x.SELECCION = false;
    });
  }

  AnularCR() {
    this.popupVisibleAnularCR = true;
    this.mDocumentoAnularCR.CORR_EMPRESA = 0
    this.mDocumentoAnularCR.ANIO_PERIODO = 0
    this.mDocumentoAnularCR.MES_PERIODO = 0
    this.mDocumentoAnularCR.CORR_DOCUMENTO = 0
    this.mDocumentoAnularCR.MOTIVO_ANULACION = ""
  }

  guardarDocPopupAnularCR() {
    const selectedModels = this.models.filter((y: { SELECCION: boolean; }) => y.SELECCION === true);
    const MotivoAnulacion = (this.mDocumentoAnularCR.MOTIVO_ANULACION || '').trim();
    console.log('Componente inicializado', this.mDocumentoAnularCR.MOTIVO_ANULACION)
    if (!MotivoAnulacion || MotivoAnulacion.length < 3) {
      this.notifyFx('Debe ingresar un motivo de anulación válida (mínimo 3 caracteres)', NotifyType.Error);
      return;
    }
    if (selectedModels.length > 0) {
      selectedModels.forEach((x: any) => {
        this.mDocumentoAnularCR.CORR_EMPRESA = x.CORR_EMPRESA
        this.mDocumentoAnularCR.ANIO_PERIODO = x.ANIO_PERIODO
        this.mDocumentoAnularCR.MES_PERIODO = x.MES_PERIODO
        this.mDocumentoAnularCR.CORR_DOCUMENTO = x.CORR_DOCUMENTO
      });
    }
    else {
      this.notifyFx('Debe seleccionar al menos un documento para anular', NotifyType.Error);
      return;
    }

    const confirpreli = custom({
      title: 'Confirmación de Anulación',
      messageHtml: '¿Realmente Quiere Anular el Comprobante de Retención?',
      buttons: [
        {
          text: 'Si',
          onClick: (e: any) => {
            this.loadingVisible = true;
            this.service
              .AnularCR(this.mDocumentoAnularCR)
              .pipe(take(1))
              .subscribe({
                next: (response: any) => {
                  if (response.Result) {
                    this.notifyFx('Anulación con exito..!', NotifyType.Success);
                    this.model = response.Data;
                    const vIndex = this.models.findIndex((item: any) => item.ANIO_PERIODO === response.Data.ANIO_PERIODO &&
                      item.MES_PERIODO === response.Data.MES_PERIODO &&
                      item.CORR_DOCUMENTO === response.Data.CORR_DOCUMENTO);
                    this.models[vIndex] = response.Data;
                    //this.habilitar();
                    this.refrescarBotones();
                    this.banderaMtto = UpdateType.Not_Defined;
                    //if (this.model.ESTADO_DOCUMENTO != 'DI' && this.model.ESTADO_DOCUMENTO != 'SO') {
                    //setTimeout(() => {
                    //  this.bloquear();
                    // });
                    //}
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
          },
        },
        {
          text: 'No',
          onClick: (e: any) => false,
        },
      ],
    });
    confirpreli.show().then((dialogResult: any) => { });
    this.popupVisibleAnularCR = false;
  }

  hideDocPopupAnularCR() {
    this.popupVisibleAnularCR = false;
  }

  refrescarBotones() {
    if (this.banderaMtto !== UpdateType.Browse) {
      if (this.model.ESTADO_DOCUMENTO == 'DI') {
        //this.btnAplicar = 'Aplicar';
      } else {
        //this.btnAplicar = '';
      }
      if (this.model.ESTADO_DOCUMENTO == 'AP') {
        //this.btnGenerarCR = 'Generar CR';
        //this.btnAnularCR = 'Anular CR';
      } else {
        /// this.btnGenerarCR = '';
        //this.btnAnularCR = '';
      }
    } else {
      // this.btnAplicar = '';
      // this.btnDocumentosElectronicos = '';
      // this.btnVistaPrevia = '';
      // this.btnGenerarCR = '';
      //this.btnAnularCR = '';
    }

  }
}
