/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ViewChild } from '@angular/core';
import { take } from 'rxjs/internal/operators/take';
import { custom } from 'devextreme/ui/dialog';
import { locale, loadMessages } from 'devextreme/localization';
import esMessages from 'devextreme/localization/messages/es.json';
import notify from 'devextreme/ui/notify';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { RowStatus } from 'src/app/shared/models/RowStatus.enum';
import { DxFormComponent } from 'devextreme-angular/ui/form';
import { ActivatedRoute } from '@angular/router';

import { DxDropDownBoxComponent } from 'devextreme-angular/ui/drop-down-box';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';

import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { SegConfigOpcion } from 'src/app/pages/Security/seg-config-opcion/seg-config-opcion';
import { SegConfigOpcionService } from './seg-config-opcion.service';

@Component({
  selector: 'app-seg-config-opcion',
  templateUrl: './seg-config-opcion.component.html',
  styleUrls: ['./seg-config-opcion.component.scss'],
})
export class SegConfigOpcionComponent implements OnInit {
  @ViewChild('fData', { static: false }) dataForm!: DxFormComponent;
  @ViewChild('corrCodigoSistema', { static: false }) corrCodigoSistema!: DxDropDownBoxComponent;
  @ViewChild('dataCodigoSistema', { static: false }) dataCodigoSistema!: DxDataGridComponent;
  @ViewChild('codigoMenu', { static: false }) codigoMenu!: DxDropDownBoxComponent;
  @ViewChild('dataCodigoMenu', { static: false }) dataCodigoMenu!: DxDataGridComponent;
  @ViewChild('codigoOpcion', { static: false }) codigoOpcion!: DxDropDownBoxComponent;
  @ViewChild('dataCodigoOpcion', { static: false }) dataCodigoOpcion!: DxDataGridComponent;

  //#region <Declaraciones>
  tituloVentana = 'Config Opcion';
  subTituloVentana = '';
  urlOpcion = '/seg-config-opcion';
  banderaMtto = UpdateType.Browse;
  loadingVisible = false;
  permiteSalir = true;
  permisos = 'ABC';
  permiteAdd = true;
  permiteEdit = true;
  permiteDele = true;
  permitePrint = true;
  models: any;
  modelUpdate: any;
  model: SegConfigOpcion = {
    CODIGO_SISTEMA: '',
    NOMBRE_SISTEMA: '',
    IMAGEN_SISTEMA: '',
    CODIGO_MENU: '',
    NOMBRE_MENU: '',
    IMAGEN_MENU: '',
    CODIGO_OPCION: '',
    NOMBRE_OPCION: '',
    IMAGEN_OPCION: '',
    URL_OPCION: '',
    ORDEN_SISTEMA: 0,
    ORDEN_MENU: 0,
    ORDEN_OPCION: 0,
    USUARIO_CREA: '',
    FECHA_CREA: new Date(),
    ESTACION_CREA: '',
    USUARIO_ACTU: '',
    FECHA_ACTU: new Date(),
    ESTACION_ACTU: ''
  };
  param: any = {
    CORR_EMPRESA: this.appInfoService.CORR_EMPRESA
  };
  mCodigoSistema: any;
  mCodigoMenu: any;
  mCodigoOpcion: any;
  bloqComponent = false;
  //#endregion

  constructor(
    private appInfoService: AppInfoService,
    private service: SegConfigOpcionService,
    private router: ActivatedRoute
  ) {
    this.tituloVentana = router.snapshot.data['titulo'];
    loadMessages(esMessages);
    locale(this.appInfoService.getLocale);
    this.getPermisos();

    // Metodos como propiedades
    this.getPermiteEditar = this.getPermiteEditar.bind(this);
    this.getPermiteDele = this.getPermiteDele.bind(this);
    this.isBrowse = this.isBrowse.bind(this);
    this.editarClick = this.editarClick.bind(this);
  }

  ngOnInit(): void {
    this.inicializaOpciones();
    this.consultar();
    this.llenaComboBox();
  }

  //#region <Validadores>
  esValido(): boolean {
    if  (this.model.CODIGO_SISTEMA === '') {
      notify(
        {
          message: 'Error, debe seleccionar un Código Sistema.',
          width: 'auto',
          shading: false,
          closeOnClick: true,
          closeOnOutsideClick: true,
        },
        'error',
        500000
      );
      return false;
    }

    if  (this.model.CODIGO_MENU === '') {
      notify(
        {
          message: 'Error, debe seleccionar un Código Menú.',
          width: 'auto',
          shading: false,
          closeOnClick: true,
          closeOnOutsideClick: true,
        },
        'error',
        500000
      );
      return false;
    }

    if  (this.model.CODIGO_OPCION === '') {
      notify(
        {
          message: 'Error, debe seleccionar un Código Opción.',
          width: 'auto',
          shading: false,
          closeOnClick: true,
          closeOnOutsideClick: true,
        },
        'error',
        500000
      );
      return false;
    }

    if  (this.model.ORDEN_SISTEMA === 0 || this.model.ORDEN_SISTEMA === null) {
      notify(
        {
          message: 'Error, debe ingresar un Órden Sistema.',
          width: 'auto',
          shading: false,
          closeOnClick: true,
          closeOnOutsideClick: true,
        },
        'error',
        500000
      );
      return false;
    }

    if  (this.model.ORDEN_MENU === 0 || this.model.ORDEN_MENU === null) {
      notify(
        {
          message: 'Error, debe ingresar un Órden Menú.',
          width: 'auto',
          shading: false,
          closeOnClick: true,
          closeOnOutsideClick: true,
        },
        'error',
        500000
      );
      return false;
    }

    if  (this.model.ORDEN_OPCION === null) {
      notify(
        {
          message: 'Error, debe ingresar un Órden Opción.',
          width: 'auto',
          shading: false,
          closeOnClick: true,
          closeOnOutsideClick: true,
        },
        'error',
        500000
      );
      return false;
    }
    return true;
  }
  // #endregion

  //#region <Inicializando Opciones>
  inicializaOpciones() {
    this.getEMPRESA();
  }
  getEMPRESA() {
    // this.dSService.enviarCorrEmpresaObservable.subscribe(empresa => {
    // 	this.param.CORR_EMPRESA = empresa;
    // });
  }
  // #endregion

  //#region <Manejo de Combos>
  llenaComboBox() {
    this.getSistema();
    this.getMenu();
    this.getOpcion();
  }

  getSistema(): void  {
    this.service.getSistema(this.param).pipe(take(1)).subscribe(
      (model: any[]) => {
        this.mCodigoSistema = model;
      },
      (error: any) => {
        notify({ message: error, width: 'auto', shading: false, closeOnClick: true, closeOnOutsideClick: true }, 'error', 500000);
      }
    );
  }

  getMenu(): void  {
    this.service.getMenus(this.param).pipe(take(1)).subscribe(
      (model: any[]) => {
        this.mCodigoMenu = model;
      },
      (error: any) => {
        notify({ message: error, width: 'auto', shading: false, closeOnClick: true, closeOnOutsideClick: true }, 'error', 500000);
      }
    );
  }

  getOpcion(): void  {
    this.service.getOpciones(this.param).pipe(take(1)).subscribe(
      (model: any[]) => {
        this.mCodigoOpcion = model;
      },
      (error: any) => {
        notify({ message: error, width: 'auto', shading: false, closeOnClick: true, closeOnOutsideClick: true }, 'error', 500000);
      }
    );
  }
  //#endregion

  //#region <Metodos Browse>
  isBrowse(): boolean {
    if (this.banderaMtto === UpdateType.Browse) {
      return true;
    }
    return false;
  }

  isForm(): boolean {
    if (
      this.banderaMtto === UpdateType.Add ||
      this.banderaMtto === UpdateType.Update
    ) {
      return true;
    }
    return false;
  }

  getPermisos() {
    this.permisos = this.appInfoService.getPermiso(this.urlOpcion);
    if (this.permisos.includes('C')) {
      this.permiteAdd = true;
    }
    if (this.permisos.includes('U')) {
      this.permiteEdit = true;
    }
    if (this.permisos.includes('D')) {
      this.permiteDele = true;
    }
  }

  getPermiteEditar(e: any) {
    if (this.permiteEdit) {
      return true;
    }
    return false;
  }

  getPermiteDele(e: any) {
    if (this.permiteDele) {
      return true;
    }
    return false;
  }

  focusedRowChanged(e: any) {
    this.model = e.row.data;
  }
  //#endregion

  //#region <Metodos Mtto>
  consultar() {
    this.service.getAll(this.param).pipe(take(1)).subscribe((model: any[]) => {
      this.models = model;
    });
  }

  nuevo(): void {
    this.permiteSalir = false;
    this.bloqComponent = false;
    this.model = {
      CODIGO_SISTEMA:  this.mCodigoSistema[0].CODIGO_SISTEMA,
      NOMBRE_SISTEMA: '',
      IMAGEN_SISTEMA: '',
      CODIGO_MENU: this.mCodigoMenu[0].CODIGO_MENU,
      NOMBRE_MENU: '',
      IMAGEN_MENU: '',
      CODIGO_OPCION: this.mCodigoOpcion[0].CODIGO_OPCION,
      NOMBRE_OPCION: '',
      IMAGEN_OPCION: '',
      URL_OPCION: '',
      ORDEN_SISTEMA: 0,
      ORDEN_MENU: 0,
      ORDEN_OPCION: 0,
      USUARIO_CREA: '',
      FECHA_CREA: new Date(),
      ESTACION_CREA: '',
      USUARIO_ACTU: '',
      FECHA_ACTU: new Date(),
      ESTACION_ACTU: ''
    };
    this.banderaMtto = UpdateType.Add;
    this.subTituloVentana = RowStatus.Add.toString();
    setTimeout(() => {
      this.dataForm.instance.getEditor('CODIGO_OPCION')?.focus();
    });
  }

  editarClick(e: any) {
    e.event.preventDefault();
    this.modelUpdate= {
      CODIGO_SISTEMA: this.model.CODIGO_SISTEMA,
      NOMBRE_SISTEMA: this.model.NOMBRE_SISTEMA,
      IMAGEN_SISTEMA: this.model.IMAGEN_SISTEMA,
      CODIGO_MENU: this.model.CODIGO_MENU,
      NOMBRE_MENU: this.model.NOMBRE_MENU,
      IMAGEN_MENU: this.model.IMAGEN_MENU,
      CODIGO_OPCION: this.model.CODIGO_OPCION,
      NOMBRE_OPCION: this.model.NOMBRE_OPCION,
      IMAGEN_OPCION: this.model.IMAGEN_OPCION,
      URL_OPCION: this.model.URL_OPCION,
      ORDEN_SISTEMA: this.model.ORDEN_SISTEMA,
      ORDEN_MENU: this.model.ORDEN_MENU,
      ORDEN_OPCION: this.model.ORDEN_OPCION,
      USUARIO_CREA: this.model.USUARIO_CREA,
      FECHA_CREA: this.model.FECHA_CREA,
      ESTACION_CREA: this.model.ESTACION_CREA,
      USUARIO_ACTU: this.model.USUARIO_ACTU,
      FECHA_ACTU: this.model.FECHA_ACTU,
      ESTACION_ACTU: this.model.ESTACION_ACTU
    };
    this.permiteSalir = false;
    this.bloqComponent = true;
    this.banderaMtto = UpdateType.Update;
    this.subTituloVentana = RowStatus.Update.toString();
    setTimeout(() => {
      this.dataForm.instance.getEditor('ORDEN_SISTEMA')?.focus();
    });
  }

  guardar(): void {
    if (!this.esValido()) {
      return;
    }

    this.loadingVisible = true;
    if (this.banderaMtto === UpdateType.Add) {
      this.service.insert(this.model).pipe(take(1)).subscribe(
        (newModel: any) => {
          this.models.push(newModel);
          this.model = newModel;
          this.banderaMtto = UpdateType.Browse;
          this.subTituloVentana = RowStatus.Not_Defined.toString();
          this.loadingVisible = false;
          this.permiteSalir = true;
          this.bloqComponent = false;
          notify(
            {
              message: '¡Registro creado con exito!',
              width: 'auto',
              shading: false,
            },
            'success',
            1500
          );
        },
        (error: any) => {
          notify(
            {
              message: error,
              width: 'auto',
              shading: false,
              closeOnClick: true,
              closeOnOutsideClick: true,
            },
            'error',
            500000
          );
          this.loadingVisible = false;
        }
      );
    } else if (this.banderaMtto === UpdateType.Update) {
      this.service.update(this.model).pipe(take(1)).subscribe(
        (newModel: any) => {
          this.model = newModel;
          const vIndex = this.models.findIndex(
            (item: any) => item.CODIGO_OPCION === newModel.CODIGO_OPCION
          );
          this.models[vIndex] = newModel;
          this.banderaMtto = UpdateType.Browse;
          this.subTituloVentana = RowStatus.Not_Defined.toString();
          this.loadingVisible = false;
          this.permiteSalir = true;
          this.bloqComponent = false;
          notify(
            {
              message: '¡Registro modificado con exito!',
              width: 'auto',
              shading: false,
            },
            'success',
            1500
          );
        },
        (error: any) => {
          notify(
            {
              message: error,
              width: 'auto',
              shading: false,
              closeOnClick: true,
              closeOnOutsideClick: true,
            },
            'error',
            500000
          );
          this.loadingVisible = false;
        }
      );
    }
  }

  cancelar(): void {
    const cancelRow = () => {
      this.permiteSalir = true;
      this.banderaMtto = UpdateType.Browse;
      this.subTituloVentana = RowStatus.Not_Defined.toString();
      this.getPermisos();
    };
    if (this.banderaMtto === UpdateType.Add || this.banderaMtto === UpdateType.Update) {
      const confirmacion = custom({
        title: 'Confirmación de Cancelar',
        messageHtml: '¿Quieres cancelar y perder los cambios realizados?',
        buttons: [{
          text: 'Si', onClick: (e: any) => true
        }, {
          text: 'No', onClick: (e: any) => false
        }]
      });

      confirmacion.show().then((cancel: boolean) => {
        if (cancel) {
          if(this.banderaMtto === UpdateType.Update){
            this.model = this.modelUpdate;
            const vIndex = this.models.findIndex((item: any) => item.CODIGO_SISTEMA === this.modelUpdate.CODIGO_SISTEMA &&
                                                                item.CODIGO_MENU === this.modelUpdate.CODIGO_MENU &&
                                                                item.CODIGO_OPCION === this.modelUpdate.CODIGO_OPCION);
            this.models[vIndex] = this.modelUpdate;
          }
          cancelRow();
        }
      });
    } else {
      cancelRow();
    }
  }

  rowRemoving(e: any) {
    this.param.CODIGO_SISTEMA = e.data.CODIGO_SISTEMA;
    this.param.CODIGO_MENU = e.data.CODIGO_MENU;
    this.service.delete(e.data.CODIGO_OPCION, this.param).pipe(take(1)).subscribe(
      () => {
        notify(
          {
            message: 'Registro eliminado con exito!',
            width: 'auto',
            shading: false,
          },
          'success',
          1500
        );
        e.component.refresh();
      },
      (error: any) => {
        e.cancel = true;
        notify(
          {
            message: error,
            width: 'auto',
            shading: false,
            closeOnClick: true,
            closeOnOutsideClick: true,
          },
          'error',
          500000
        );
      }
    );
  }

  rowDblClick(e: any) {
    this.banderaMtto = UpdateType.Not_Defined;
    this.subTituloVentana = RowStatus.Browse.toString();
    setTimeout(() => {
      this.bloquear();
    });
  }

  bloquear(): void {
    this.dataForm.instance
      .getEditor('CORR_SUSCRIPCION')
      ?.option('readOnly', true);
    this.dataForm.instance
      .getEditor('CORR_CONFI_PAIS')
      ?.option('readOnly', true);
    this.dataForm.instance.getEditor('ORDEN_SISTEMA')?.option('readOnly', true);
    this.dataForm.instance.getEditor('ORDEN_MENU')?.option('readOnly', true);
    this.dataForm.instance.getEditor('ORDEN_OPCION')?.option('readOnly', true);
    this.dataForm.instance.getEditor('USUARIO_CREA')?.option('readOnly', true);
    this.dataForm.instance.getEditor('USUARIO_CREA')?.option('readOnly', true);
    this.dataForm.instance.getEditor('USUARIO_CREA')?.option('readOnly', true);
    this.dataForm.instance.getEditor('FECHA_CREA')?.option('readOnly', true);
    this.dataForm.instance.getEditor('ESTACION_CREA')?.option('readOnly', true);
    this.dataForm.instance.getEditor('USUARIO_ACTU')?.option('readOnly', true);
    this.dataForm.instance.getEditor('FECHA_ACTU')?.option('readOnly', true);
    this.dataForm.instance.getEditor('ESTACION_ACTU')?.option('readOnly', true);
    this.bloqComponent = true;
  }

  permitirSalir():
    | boolean
    | import('rxjs').Observable<boolean>
    | Promise<boolean> {
    if (this.permiteSalir) {
      return true;
    }
    const confirmacion = custom({
      title: 'Confirmación de Salida',
      messageHtml:
        '¿Quieres salir del formulario y perder los cambios realizados?',
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

  //#region <Manejo de lookups>
  valueChangedCODIGO_SISTEMA(e: any): void  {
    if (this.model.CODIGO_SISTEMA === null || this.model.CODIGO_SISTEMA === '') {
      this.dataCodigoSistema.instance.clearSelection();
    }
  }

  selectionChangedCODIGO_SISTEMA(selectedRowKeys: any): void  {
    if (selectedRowKeys.length > 0) {
      this.model.CODIGO_SISTEMA = selectedRowKeys[0].CODIGO_SISTEMA;
    }
  }

  rowClickCODIGO_SISTEMA(e: any, data: any): void  {
    this.corrCodigoSistema.instance.close();
    this.corrCodigoSistema.instance.focus();
  }

  valueChangedCODIGO_MENU(e: any): void  {
    if (this.model.CODIGO_MENU === null ||  this.model.CODIGO_MENU === '') {
      this.dataCodigoMenu.instance.clearSelection();
    }
  }

  selectionChangedCODIGO_MENU(selectedRowKeys: any): void  {
    if (selectedRowKeys.length > 0) {
      this.model.CODIGO_MENU = selectedRowKeys[0].CODIGO_MENU;
    }
  }

  rowClickCODIGO_MENU(e: any, data: any): void  {
    this.codigoMenu.instance.close();
    this.codigoMenu.instance.focus();
  }

  valueChangedCODIGO_OPCION(e: any): void  {
    if (this.model.CODIGO_OPCION === '' ) {
      this.dataCodigoOpcion.instance.clearSelection();
    }
  }

  selectionChangedCODIGO_OPCION(selectedRowKeys: any): void  {
    if (selectedRowKeys.length > 0) {
      this.model.CODIGO_OPCION = selectedRowKeys[0].CODIGO_OPCION;
    }
  }

  rowClickCODIGO_OPCION(e: any, data: any): void  {
    this.codigoOpcion.instance.close();
    this.codigoOpcion.instance.focus();
  }
  //#endregion
}
