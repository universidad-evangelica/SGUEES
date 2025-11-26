/* eslint-disable @typescript-eslint/naming-convention */
import { Component } from '@angular/core';
import { loadMessages } from 'devextreme/localization';
import esMessages from 'devextreme/localization/messages/es.json';
import notify from 'devextreme/ui/notify';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AuthService } from 'src/app/shared/services';
import { ActivatedRoute } from '@angular/router';

import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { SegUsuario } from 'src/app/pages/Security/seg-usuario/models/seg-usuario';
import { SegUsuarioService } from 'src/app/pages/Security/seg-usuario/seg-usuario.service';


@Component({
  templateUrl: 'profile.component.html',
  styleUrls: [ './profile.component.scss' ]
})

export class ProfileComponent {

  tituloVentana = 'Perfil Usuario';
  models: any;
  urlPhotoUser = 'assets/img/user.png'; //this.authService.decodedToken.URL_FOTO_PERFIL;

  model: SegUsuario = {
    LOGIN_SISTEMA: this.authService.decodedToken.nameid,
    NOMBRE_USUARIO: this.authService.decodedToken.unique_name,
    CORREO_ELECTRONICO: '',
    TIPO_USUARIO: 0,
    NOMBRE_TIPO_USUARIO: '',
    ESTADO_USUARIO: 0,
    NOMBRE_ESTADO_USUARIO: '',
    IDIOMA: '',
    USUARIO_CREA: '',
    FECHA_CREA: new Date(),
    ESTACION_CREA: '',
    USUARIO_ACTU: '',
    FECHA_ACTU: new Date(),
    ESTACION_ACTU: '',
    DETALLE: [
      {
        LOGIN_SISTEMA: '',
        CORR_SUSCRIPCION: 1,
        CORR_CONFI_PAIS: 1,
        CODIGO_SISTEMA: '',
        CODIGO_MENU: '',
        CODIGO_OPCION: '',
        NUEVO: false,
        MODIFICAR: false,
        ELIMINAR: false,
        IMPRIMIR: false,
        USUARIO_CREA: '',
        FECHA_CREA: new Date(),
        ESTACION_CREA: '',
        USUARIO_ACTU: '',
        FECHA_ACTU: new Date(),
        ESTACION_ACTU: '',
        SELECCION: false,
        MTTO: UpdateType.Add,
      },
    ],
  };

  cambiarClave: any = {
    LOGIN_SISTEMA: '',
    CLAVE_USUARIO: '',
    CLAVE_USUARIO_NUEVA: '',
    CLAVE_CONFIRMAR: ''
  };
  buttonClave: any;
  buttonClaveNueva: any;
  buttonConfirmClave: any;
  modeClave: string;
  modeClaveNueva: string;
  modeConfimClave: string;
  popupVisible = false;

  param: any = {
    TIPO_CONSULTA: 1,
    CORR_EMPRESA: 1,
    OPCION_CONSULTA: 0,
  };

  constructor(
    private appInfoService: AppInfoService,
    private service: SegUsuarioService,
    private router: ActivatedRoute,
    private authService: AuthService
  ) {
    loadMessages(esMessages);
    this.modeClave = 'password';
    this.buttonClave = {
      icon: 'mdi mdi-eye',
      type: 'default',
      onClick: () => {
        this.modeClave = this.modeClave === 'text' ? 'password' : 'text';
      }
    };
    this.modeClaveNueva = 'password';
    this.buttonClaveNueva = {
      icon: 'mdi mdi-eye',
      type: 'default',
      onClick: () => {
        this.modeClaveNueva = this.modeClaveNueva === 'text' ? 'password' : 'text';
      }
    };
    this.modeConfimClave = 'password';
    this.buttonConfirmClave = {
      icon: 'mdi mdi-eye',
      type: 'default',
      onClick: () => {
        this.modeConfimClave = this.modeConfimClave === 'text' ? 'password' : 'text';
      }
    };
    // locale(this.appInfoService.getLocale);
}

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnInit(): void {
    this.inicializaOpciones();
    this.consultar();
    //this.llenaComboBox();
  }

  inicializaOpciones() {
    this.getEMPRESA();
  }
  getEMPRESA() {
    // this.dSService.enviarCorrEmpresaObservable.subscribe(empresa => {
    // 	this.param.CORR_EMPRESA = empresa;
    // });
  }

  consultar() {
  //   this.param.TIPO_CONSULTA = 2;
  //   this.param.OPCION_CONSULTA = 0;
  //   this.service.get(this.param).pipe(take(1)).subscribe((model: any[]) => {
  //     this.models = model;
  //   });

  }

  mostrarPopup() {
    this.popupVisible = true;
  }

  hidePopup() {
    this.popupVisible = false;
    this.cambiarClave.LOGIN_SISTEMA = '';
    this.cambiarClave.CLAVE_USUARIO = '';
    this.cambiarClave.CLAVE_USUARIO_NUEVA = '';
    this.cambiarClave.CLAVE_CONFIRMAR = '';
  }

  cambioClave() {
    this.cambiarClave.LOGIN_SISTEMA = this.authService.decodedToken.nameid;
    if (this.cambiarClave.CLAVE_USUARIO === '') {
      return notify({ message: 'La clave anterior no coinciden', width: 'auto', shading: false }, 'warning', 2000);
    }
    if (this.cambiarClave.CLAVE_USUARIO_NUEVA !== this.cambiarClave.CLAVE_CONFIRMAR) {
      return notify({ message: 'Las claves no coinciden', width: 'auto', shading: false }, 'warning', 2000);
    }
    this.service.cambioClave(this.cambiarClave).subscribe(
      () => {
        notify({ message: 'Clave cambiada con exito!', width: 'auto', shading: false }, 'success', 1500);
        this.popupVisible = false;
        this.cambiarClave.LOGIN_SISTEMA = '';
        this.cambiarClave.CLAVE_USUARIO = '';
        this.cambiarClave.CLAVE_USUARIO_NUEVA = '';
        this.cambiarClave.CLAVE_CONFIRMAR = '';
      },
      error => {
        notify({ message: error, width: 'auto', shading: false, closeOnClick: true, closeOnOutsideClick: true}, 'error', 50000);
      }
    );
  }

  logout() {
    localStorage.removeItem('token');
    // this.router.navigate(['/login']);
    // this.dSService.getMenu(undefined, undefined);
  }

}
