/* eslint-disable @typescript-eslint/naming-convention */
import { Component, ViewChild } from '@angular/core';
import { loadMessages } from 'devextreme/localization';
import esMessages from 'devextreme/localization/messages/es.json';
import notify from 'devextreme/ui/notify';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AuthService } from 'src/app/shared/services';
import { ActivatedRoute } from '@angular/router';

import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { SegUsuario } from 'src/app/pages/Security/seg-usuario/models/seg-usuario';
import { SegUsuarioService } from 'src/app/pages/Security/seg-usuario/seg-usuario.service';
import { SegUsuarioPerfil } from './models/seg-usuario-perfil';
import { take } from 'rxjs/operators';
import {
  ChangePasswordFormComponent,
  ChangePasswordFormValue,
} from 'src/app/shared/components/library/change-password-form/change-password-form.component';


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
    USUARIO_AD: '',
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

  popupVisible = false;
  loadingVisible = false;
  savingPassword = false;
  perfilData: SegUsuarioPerfil | null = null;

  @ViewChild(ChangePasswordFormComponent) changePasswordForm?: ChangePasswordFormComponent;

  get userInitials(): string {
    const name = `${this.model.NOMBRE_USUARIO ?? ''}`.trim();
    if (!name) {
      return `${this.model.LOGIN_SISTEMA ?? 'U'}`.slice(0, 2).toUpperCase();
    }

    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  readonly securityTips = [
    'Use letras, números y símbolos',
    'Evite datos personales obvios',
    'No reutilice claves de otros sistemas',
  ];

  get empresaLabel(): string {
    return this.perfilData?.NOMBRE_EMPRESA?.trim()
      || this.authService.getNombreEmpresaSesion();
  }

  get instanciaLabel(): string {
    return this.perfilData?.NOMBRE_INSTANCIA?.trim()
      || this.authService.getInstanciaSesion();
  }

  get estadoLabel(): string {
    return this.perfilData?.NOMBRE_ESTADO_USUARIO?.trim()
      || this.model.NOMBRE_ESTADO_USUARIO
      || '—';
  }

  get sesionLabel(): string {
    return this.perfilData?.SESION_DESCRIPCION?.trim() || 'En línea';
  }

  get profileStats(): Array<{ icon: string; label: string; value: string }> {
    return [
      { icon: 'globe', label: 'Instancia', value: this.instanciaLabel },
      { icon: 'check', label: 'Estado', value: this.estadoLabel },
      { icon: 'event', label: 'Último acceso', value: this.sesionLabel },
    ];
  }

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
    this.loadingVisible = true;
    this.service
      .getPerfil()
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response?.Result && response?.Data) {
            this.perfilData = response.Data as SegUsuarioPerfil;
            this.model.LOGIN_SISTEMA = this.perfilData.LOGIN_SISTEMA || this.model.LOGIN_SISTEMA;
            this.model.NOMBRE_USUARIO = this.perfilData.NOMBRE_USUARIO || this.model.NOMBRE_USUARIO;
            this.model.CORREO_ELECTRONICO = this.perfilData.CORREO_ELECTRONICO || '';
            this.model.NOMBRE_ESTADO_USUARIO = this.perfilData.NOMBRE_ESTADO_USUARIO || '';
            this.model.NOMBRE_TIPO_USUARIO = this.perfilData.NOMBRE_TIPO_USUARIO || '';

            this.authService.updateSessionContext({
              NOMBRE_EMPRESA: this.perfilData.NOMBRE_EMPRESA,
              CODIGO_SUITE: this.perfilData.CODIGO_SUITE,
              NOMBRE_INSTANCIA: this.perfilData.NOMBRE_INSTANCIA,
            });
          } else if (response?.ErrorMessage) {
            notify({ message: response.ErrorMessage, width: 'auto', shading: false }, 'warning', 4000);
          }
          this.loadingVisible = false;
        },
        error: (error: any) => {
          this.loadingVisible = false;
          notify({ message: error, width: 'auto', shading: false }, 'error', 5000);
        },
      });
  }

  mostrarPopup() {
    this.popupVisible = true;
  }

  hidePopup() {
    this.popupVisible = false;
    this.savingPassword = false;
    this.changePasswordForm?.resetForm();
  }

  onPasswordSubmit(formValue: ChangePasswordFormValue) {
    this.savingPassword = true;
    this.service
      .cambioClavePerfil(formValue)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          this.savingPassword = false;
          if (response?.Result) {
            notify({ message: 'Contraseña cambiada con éxito.', width: 'auto', shading: false }, 'success', 2500);
            this.hidePopup();
            return;
          }

          notify({
            message: response?.ErrorMessage || 'No se pudo cambiar la contraseña.',
            width: 'auto',
            shading: false,
          }, 'error', 5000);
        },
        error: (error: any) => {
          this.savingPassword = false;
          const message = error?.error?.ErrorMessage || error?.message || error || 'Error al cambiar la contraseña.';
          notify({ message, width: 'auto', shading: false, closeOnClick: true }, 'error', 6000);
        },
      });
  }

  logout() {
    localStorage.removeItem('token');
    // this.router.navigate(['/login']);
    // this.dSService.getMenu(undefined, undefined);
  }

}
