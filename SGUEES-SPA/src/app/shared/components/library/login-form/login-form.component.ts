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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService, ThemeService } from 'src/app/shared/services';
import { ChangePasswordModalModule } from '../change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent {
  @Input() resetLink = '/recuperar-contrasena';
  @Input() createAccountLink = '/auth/create-account';

  btnStylingMode: DxButtonTypes.ButtonStyle;

  passwordMode = 'password';
  showPassword = false;

  loading = false;

  formData: any = {};

  // Variables para modal de cambio de contraseña
  showChangePasswordModal = false;
  loginSistemaForPasswordChange = '';
  passwordChangeReason: 'first-login' | 'password-expired' = 'first-login';

  passwordEditorOptions = {
    placeholder: 'Contraseña',
    stylingMode: 'filled',
    mode: this.passwordMode,
    value: 'password'
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private messageService: MessageService
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
    const usuario = (this.formData.usuario || '').trim();
    const password = (this.formData.password || '').trim();
    const validationMessage = this.getClientValidationMessage(usuario, password);

    if (validationMessage) {
      this.showLoginError(validationMessage);
      return;
    }

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
        } else if (response?.ErrorMessage) {
          this.showLoginError(response.ErrorMessage);
        } else if (response) {
          this.showLoginError('Usuario o contraseña incorrectos');
        }
      },
      (error: any) => {
        this.showLoginError(this.resolveLoginErrorMessage(error));
        this.loading = false;
      }
    );
  }

  private getClientValidationMessage(usuario: string, password: string): string | null {
    const messages: string[] = [];

    if (!usuario) {
      messages.push('Debe ingresar su usuario');
    }

    if (!password) {
      messages.push('Debe ingresar su contraseña.');
    }

    return messages.length > 0 ? messages.join(' y ') : null;
  }

  private showLoginError(message: string): void {
    this.messageService.clear();
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: message,
      life: 6000
    });
  }

  private resolveLoginErrorMessage(error: any): string {
    const fallback = 'Usuario o contraseña incorrectos';

    if (typeof error === 'string') {
      const parsedMessages = this.parseLoginValidationErrors(error);
      if (parsedMessages.length) {
        return parsedMessages.join(' ');
      }

      const cleaned = error
        .split('\n')
        .map(line => line.trim())
        .filter(line =>
          line &&
          !line.startsWith('Status:') &&
          !/validation errors occurred/i.test(line)
        )
        .join(' ')
        .trim();

      if (cleaned) {
        return cleaned;
      }

      if (/unauthorized/i.test(error)) {
        return fallback;
      }
    }

    const payload = error?.error;

    if (payload?.ErrorMessage && typeof payload.ErrorMessage === 'string') {
      return payload.ErrorMessage;
    }

    if (payload?.errors && typeof payload.errors === 'object') {
      const parsedMessages = Object.entries(payload.errors).flatMap(([field, value]) => {
        const messages = Array.isArray(value) ? value : [value];
        return messages
          .filter((message): message is string => typeof message === 'string' && message.trim().length > 0)
          .map(message => this.mapLoginFieldMessage(field, message.trim()));
      });

      if (parsedMessages.length) {
        return parsedMessages.join(' ');
      }
    }

    return fallback;
  }

  private parseLoginValidationErrors(raw: string): string[] {
    const messages: string[] = [];
    const fieldPattern = /([A-Z_]+):"([^"]+)"/g;
    let match: RegExpExecArray | null;

    while ((match = fieldPattern.exec(raw)) !== null) {
      const field = match[1];
      const fieldMessages = match[2]
        .split(',')
        .map(message => message.trim())
        .filter(Boolean);

      for (const message of fieldMessages) {
        messages.push(this.mapLoginFieldMessage(field, message));
      }
    }

    return messages;
  }

  private mapLoginFieldMessage(field: string, message: string): string {
    if (field === 'LOGIN_SISTEMA') {
      if (/debe especificar el login/i.test(message)) {
        return 'Debe ingresar su usuario.';
      }

      if (/entre 4 y 30/i.test(message)) {
        return 'El usuario debe tener entre 4 y 30 caracteres.';
      }
    }

    if (field === 'CLAVE_USUARIO' && /debe especificar una clave/i.test(message)) {
      return 'Debe ingresar su contraseña.';
    }

    const fieldLabels: Record<string, string> = {
      LOGIN_SISTEMA: 'Usuario',
      CLAVE_USUARIO: 'Contraseña',
    };

    const label = fieldLabels[field];
    return label ? `${label}: ${message}` : message;
  }

  onPasswordChanged() {
    // Después del cambio de contraseña exitoso
    this.showChangePasswordModal = false;

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Contraseña actualizada. Redirigiendo...',
      life: 2000
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
    ChangePasswordModalModule,
    ToastModule
  ],
  declarations: [LoginFormComponent],
  exports: [LoginFormComponent],
})
export class LoginFormModule { }
