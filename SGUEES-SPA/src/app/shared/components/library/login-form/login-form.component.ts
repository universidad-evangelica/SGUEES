import { CommonModule } from '@angular/common';
import { Component, NgModule, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';

import { LoginOauthModule } from 'src/app/shared/components/library/login-oauth/login-oauth.component';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { DxButtonModule, DxButtonTypes } from 'devextreme-angular/ui/button';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import notify from 'devextreme/ui/notify';
import { AuthService, ThemeService } from 'src/app/shared/services';
import { ChangePasswordModalModule } from '../change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent {
  @Input() resetLink = '/auth/reset-password';
  @Input() createAccountLink = '/auth/create-account';

  btnStylingMode: DxButtonTypes.ButtonStyle;

  passwordMode = 'password';
  showPassword = false;
  errorMessage = '';

  loading = false;

  formData: any = {};

  // Variables para modal de cambio de contraseña
  showChangePasswordModal = false;
  loginSistemaForPasswordChange = '';
  passwordChangeReason: 'first-login' | 'password-expired' = 'first-login';

  passwordEditorOptions = {
    placeholder: 'Password',
    stylingMode: 'filled',
    mode: this.passwordMode,
    value: 'password'
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {
    this.themeService.isDark.subscribe((value: boolean) => {
      this.btnStylingMode = value ? 'outlined' : 'contained';
    });
  }

  changePasswordMode() {
    this.passwordMode = this.passwordMode === 'text' ? 'password' : 'text';
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    const { usuario, password } = this.formData;
    this.loading = true;

    this.authService.logIn(usuario, password).pipe(take(1)).subscribe(
      (response: any) => {
        this.loading = false;

        if (response && response.Result) {
          // Verificar si requiere cambio de contraseña
          if (response.Data.REQUIERE_CAMBIO_CLAVE) {
            this.loginSistemaForPasswordChange = usuario;
            // Determinar razón del cambio de contraseña
            // Primer login si ES_PRIMER_LOGIN es true, sino expiración
            this.passwordChangeReason = response.Data.ES_PRIMER_LOGIN
              ? 'first-login'
              : 'password-expired';
            this.showChangePasswordModal = true;
          } else {
            // Login exitoso, redirigir al home
            this.router.navigate(['/home']);
          }
        }
      },
      (error: any) => {
        this.errorMessage = error || 'Usuario o contraseña incorrectos';
        notify(
          {
            message: error,
            width: 'auto',
            shading: false,
            closeOnClick: true,
            closeOnOutsideClick: true
          },
          'error',
          500000
        );
        this.loading = false;
      }
    );
  }

  onPasswordChanged() {
    // Después del cambio de contraseña exitoso
    this.showChangePasswordModal = false;

    notify({
      message: 'Contraseña actualizada. Redirigiendo...',
      type: 'success',
      displayTime: 2000
    });

    // Redirigir al home
    setTimeout(() => {
      this.formData = {};
      this.router.navigate(['/home']);
    }, 2000);
  }
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoginOauthModule,
    DxFormModule,
    DxLoadIndicatorModule,
    DxButtonModule,
    DxPopupModule,
    ChangePasswordModalModule
  ],
  declarations: [LoginFormComponent],
  exports: [LoginFormComponent],
})
export class LoginFormModule { }
