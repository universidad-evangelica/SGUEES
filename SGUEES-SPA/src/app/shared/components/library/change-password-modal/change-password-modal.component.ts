import { Component, EventEmitter, Input, Output, NgModule, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, lastValueFrom, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import notify from 'devextreme/ui/notify';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';

interface PasswordStrength {
  score: number;
  message: string;
  color: string;
}

@Component({
  standalone: false,
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss'],
})
export class ChangePasswordModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() loginSistema = '';
  @Input() currentPassword = '';
  @Input() changeReason: 'first-login' | 'password-expired' = 'first-login';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onPasswordChanged = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  loading = false;
  formData = {
    claveActual: '',
    nuevaClave: '',
    confirmarClave: '',
  };

  currentPasswordMode = 'password';
  passwordMode = 'password';
  confirmPasswordMode = 'password';
  passwordStrength: PasswordStrength = { score: 0, message: '', color: '' };
  private suppressCancelOnHide = false;

  get modalTitle(): string {
    return this.changeReason === 'password-expired'
      ? 'Actualización de contraseña'
      : 'Cambio de contraseña obligatorio';
  }

  get headerMessage(): string {
    return this.changeReason === 'password-expired' ? 'Contraseña expirada' : 'Bienvenido por primera vez';
  }

  get descriptionMessage(): string {
    return this.changeReason === 'password-expired'
      ? 'Su contraseña venció por política de seguridad. Actualícela para continuar.'
      : 'Por seguridad debe definir una contraseña personal antes de usar el sistema.';
  }

  get currentPasswordLabel(): string {
    return this.changeReason === 'password-expired' ? 'Contraseña actual' : 'Contraseña temporal (actual)';
  }

  get currentPasswordPlaceholder(): string {
    return this.changeReason === 'password-expired' ? 'Escriba su contraseña actual' : 'Contraseña que usó para ingresar';
  }

  constructor(private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.resetForm();
    }
    if (changes['currentPassword'] && this.visible) {
      this.formData.claveActual = this.currentPassword || '';
    }
  }

  private resetForm(): void {
    this.formData = {
      claveActual: this.currentPassword || '',
      nuevaClave: '',
      confirmarClave: '',
    };
    this.currentPasswordMode = 'password';
    this.passwordMode = 'password';
    this.confirmPasswordMode = 'password';
    this.passwordStrength = { score: 0, message: '', color: '' };
    this.loading = false;
  }

  validatePasswordStrength(password: string): PasswordStrength {
    const hasNumbers = /\d/.test(password);
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!isLongEnough) {
      return { score: 0, message: 'Mínimo 8 caracteres', color: '#e57373' };
    }
    if (!hasNumbers) {
      return { score: 1, message: 'Agregue al menos un número', color: '#e57373' };
    }
    if (!hasLetters) {
      return { score: 1, message: 'Agregue al menos una letra', color: '#e57373' };
    }
    if (hasSpecial) {
      return { score: 3, message: 'Contraseña fuerte', color: '#4caf50' };
    }
    return { score: 2, message: 'Contraseña válida', color: '#ffb74d' };
  }

  onPasswordChange(): void {
    this.passwordStrength = this.validatePasswordStrength(this.formData.nuevaClave);
  }

  togglePasswordVisibility(field: 'current' | 'password' | 'confirm'): void {
    if (field === 'current') {
      this.currentPasswordMode = this.currentPasswordMode === 'password' ? 'text' : 'password';
    } else if (field === 'password') {
      this.passwordMode = this.passwordMode === 'password' ? 'text' : 'password';
    } else {
      this.confirmPasswordMode = this.confirmPasswordMode === 'password' ? 'text' : 'password';
    }
  }

  isPasswordValid(): boolean {
    const { claveActual, nuevaClave, confirmarClave } = this.formData;
    if (!claveActual?.trim() || !nuevaClave || !confirmarClave) {
      return false;
    }
    if (nuevaClave !== confirmarClave || nuevaClave === claveActual) {
      return false;
    }
    if (nuevaClave.length < 8) {
      return false;
    }
    return /\d/.test(nuevaClave) && /[a-zA-Z]/.test(nuevaClave);
  }

  hasMinLength(): boolean {
    return this.formData.nuevaClave.length >= 8;
  }

  hasNumbers(): boolean {
    return /\d/.test(this.formData.nuevaClave);
  }

  hasLetters(): boolean {
    return /[a-zA-Z]/.test(this.formData.nuevaClave);
  }

  requestClose(): void {
    if (this.loading) {
      return;
    }
    this.closeModal(true);
  }

  onHiding(e: { cancel?: boolean }): void {
    if (this.loading) {
      e.cancel = true;
      return;
    }
    if (this.suppressCancelOnHide) {
      this.suppressCancelOnHide = false;
      return;
    }
    if (this.visible) {
      e.cancel = true;
      this.closeModal(true);
    }
  }

  private closeModal(cancelled: boolean): void {
    this.visibleChange.emit(false);
    if (cancelled) {
      this.cancelled.emit();
    }
    this.resetForm();
  }

  async onSubmit(e: Event): Promise<void> {
    e.preventDefault();

    if (!this.formData.claveActual?.trim()) {
      notify({ message: 'Ingrese su contraseña actual', type: 'error', displayTime: 3000 });
      return;
    }

    if (this.formData.nuevaClave === this.formData.claveActual) {
      notify({ message: 'La nueva contraseña debe ser diferente a la actual', type: 'error', displayTime: 3500 });
      return;
    }

    if (!this.isPasswordValid()) {
      notify({ message: 'Revise los requisitos y que ambas contraseñas coincidan', type: 'error', displayTime: 3500 });
      return;
    }

    this.loading = true;

    try {
      const url = environment.UrlSEGURIDADAPI + 'SEG_USUARIO/cambio-clave';
      const response: any = await lastValueFrom(
        this.http
          .post(url, {
            LOGIN_SISTEMA: this.loginSistema,
            CLAVE_USUARIO: this.formData.claveActual,
            CLAVE_USUARIO_NUEVA: this.formData.nuevaClave,
            CODIGO_SUITE: 'SGUEES',
          })
          .pipe(
            catchError((error: any) =>
              of({
                Result: false,
                ErrorMessage: this.extractApiError(error),
              })
            )
          )
      );

      this.loading = false;

      if (response?.Result) {
        notify({
          message: 'Contraseña actualizada. Iniciando sesión…',
          type: 'success',
          displayTime: 2000,
        });
        const nuevaClave = this.formData.nuevaClave;
        this.suppressCancelOnHide = true;
        this.visibleChange.emit(false);
        this.resetForm();
        setTimeout(() => this.onPasswordChanged.emit(nuevaClave), 400);
      } else {
        notify({
          message: response?.ErrorMessage || 'No se pudo cambiar la contraseña',
          type: 'error',
          displayTime: 5000,
        });
      }
    } catch (error: any) {
      this.loading = false;
      notify({ message: this.extractApiError(error), type: 'error', displayTime: 5000 });
    }
  }

  private extractApiError(error: any): string {
    const payload = error?.error ?? error;
    if (typeof error === 'string') {
      return error.replace(/^Error:\s*/i, '').trim() || 'No se pudo cambiar la contraseña';
    }
    if (typeof payload === 'string') {
      if (payload.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(payload);
          if (parsed?.ErrorMessage) {
            return String(parsed.ErrorMessage);
          }
        } catch {
          // ignore
        }
      }
      return payload.replace(/^Error:\s*/i, '').trim() || 'No se pudo cambiar la contraseña';
    }
    if (payload?.ErrorMessage) {
      return String(payload.ErrorMessage);
    }
    return 'No se pudo cambiar la contraseña';
  }
}

@NgModule({
  imports: [CommonModule, FormsModule, DxPopupModule, DxFormModule, DxButtonModule, DxLoadIndicatorModule],
  declarations: [ChangePasswordModalComponent],
  exports: [ChangePasswordModalComponent],
})
export class ChangePasswordModalModule {}
