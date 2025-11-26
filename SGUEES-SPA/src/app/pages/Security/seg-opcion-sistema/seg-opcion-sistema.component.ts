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

import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { SegOpcionSistema } from 'src/app/pages/Security/seg-opcion-sistema/seg-opcion-sistema';
import { SegOpcionSistemaService } from './seg-opcion-sistema.service';


@Component({
  selector: 'app-seg-opcion-sistema',
  templateUrl: './seg-opcion-sistema.component.html',
  styleUrls: ['./seg-opcion-sistema.component.scss'],
})
export class SegOpcionSistemaComponent implements OnInit {
  @ViewChild('fData', { static: false }) dataForm!: DxFormComponent;
  // @ViewChild('gData') dataGrid!: DxDataGridComponent;

  //#region <Declaraciones>
  tituloVentana = 'Opcion Sistema';
  subTituloVentana = '';
  urlOpcion = '/seg-opcion-sistema';
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
  model: SegOpcionSistema = {
    CODIGO_OPCION: '',
    NOMBRE_OPCION: '',
    URL_OPCION: '',
    IMAGEN_OPCION: '',
    USUARIO_CREA: '',
    FECHA_CREA: new Date(),
    ESTACION_CREA: '',
    USUARIO_ACTU: '',
    FECHA_ACTU: new Date(),
    ESTACION_ACTU: '',
  };
  param: any = {};
  //#endregion

  constructor(
    private appInfoService: AppInfoService,
    private service: SegOpcionSistemaService,
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
  }

  //#region <Validadores>
  esValido(): boolean {
    //Validando y devolviendo falso si no cumple una validacion
    if (this.model.CODIGO_OPCION === '') {
      notify(
        {
          message: 'Error, debe ingresar el Código Opción',
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
    if (this.model.NOMBRE_OPCION === '') {
      notify(
        {
          message: 'Error, debe ingresar el Nombre de la Opción',
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
    if (this.model.URL_OPCION === '') {
      notify(
        {
          message: 'Error, debe ingresar la Url de la Opción.',
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
    if (this.model.IMAGEN_OPCION === '') {
      notify(
        {
          message: 'Error, debe ingresar la imagen de la opción',
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
    // this.getEstadoPC();
  }

  // getEstadoPC() {
  // this.param.TIPO_CONSULTA = 1;
  // this.param.CORR_LISTA = 22;
  // this.param.OPCION_CONSULTA = 0;
  // this.genListaDetaService.getAll(this.param).subscribe(
  //   (model: any[]) => {
  //     this.mEstadoPC = model;
  //   },
  //   (error: any) => {
  //     notify({ message: error, width: 'auto', shading: false, closeOnClick: true, closeOnOutsideClick: true}, 'error', 500000);
  //   }
  // );
  // }
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
    this.model = {
      CODIGO_OPCION: '',
      NOMBRE_OPCION: '',
      URL_OPCION: '',
      IMAGEN_OPCION: '',
      USUARIO_CREA: '',
      FECHA_CREA: new Date(),
      ESTACION_CREA: '',
      USUARIO_ACTU: '',
      FECHA_ACTU: new Date(),
      ESTACION_ACTU: '',
    };
    this.banderaMtto = UpdateType.Add;
    this.subTituloVentana = RowStatus.Add.toString();
    setTimeout(() => {
      this.dataForm.instance.getEditor('CODIGO_OPCION')?.focus();
    });
  }

  editarClick(e: any) {
    e.event.preventDefault();
    this.modelUpdate = {
      CODIGO_OPCION: this.model.CODIGO_OPCION,
      NOMBRE_OPCION: this.model.NOMBRE_OPCION,
      URL_OPCION: this.model.URL_OPCION,
      IMAGEN_OPCION: this.model.IMAGEN_OPCION,
      USUARIO_CREA: this.model.USUARIO_CREA,
      FECHA_CREA: this.model.FECHA_CREA,
      ESTACION_CREA: this.model.ESTACION_CREA,
      USUARIO_ACTU: this.model.USUARIO_ACTU,
      FECHA_ACTU: this.model.FECHA_ACTU,
      ESTACION_ACTU: this.model.ESTACION_ACTU
    };
    this.permiteSalir = false;
    this.banderaMtto = UpdateType.Update;
    this.subTituloVentana = RowStatus.Update.toString();
    setTimeout(() => {
      this.dataForm.instance.getEditor('CODIGO_OPCION')?.option('readOnly', true);
      this.dataForm.instance.getEditor('NOMBRE_OPCION')?.focus();

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
          notify(
            {
              message: 'Registro creado con exito!',
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
          notify(
            {
              message: 'Registro modificado con exito!',
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
    if (this.banderaMtto === UpdateType.Update) {
      this.model = this.modelUpdate;
      const vIndex = this.models.findIndex((item: any) => item.CODIGO_OPCION === this.modelUpdate.CODIGO_OPCION);
      this.models[vIndex] = this.modelUpdate;
    }
    this.permiteSalir = true;
    this.banderaMtto = UpdateType.Browse;
    this.subTituloVentana = RowStatus.Not_Defined.toString();
  }

  rowRemoving(e: any) {
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
    this.dataForm.instance.getEditor('CODIGO_OPCION')?.option('readOnly', true);
    this.dataForm.instance.getEditor('NOMBRE_OPCION')?.option('readOnly', true);
    this.dataForm.instance.getEditor('URL_OPCION')?.option('readOnly', true);
    this.dataForm.instance.getEditor('IMAGEN_OPCION')?.option('readOnly', true);
    this.dataForm.instance.getEditor('USUARIO_CREA')?.option('readOnly', true);
    this.dataForm.instance.getEditor('FECHA_CREA')?.option('readOnly', true);
    this.dataForm.instance.getEditor('ESTACION_CREA')?.option('readOnly', true);
    this.dataForm.instance.getEditor('USUARIO_ACTU')?.option('readOnly', true);
    this.dataForm.instance.getEditor('FECHA_ACTU')?.option('readOnly', true);
    this.dataForm.instance.getEditor('ESTACION_ACTU')?.option('readOnly', true);
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
}
