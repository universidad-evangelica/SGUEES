import { Component, EventEmitter, Input, Output, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/shared/services';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import notify from 'devextreme/ui/notify';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';

interface PasswordStrength {
  score: number; // 0-3
  message: string;
  color: string;
}

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss']
})
export class ChangePasswordModalComponent {
  @Input() visible = false;
  @Input() loginSistema = '';
  @Output() onPasswordChanged = new EventEmitter<void>();

  loading = false;
  formData = {
    claveActual: 'temporal123',
    nuevaClave: '',
    confirmarClave: ''
  };

  passwordMode = 'password';
  confirmPasswordMode = 'password';
  passwordStrength: PasswordStrength = { score: 0, message: '', color: '' };

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  // Validar fortaleza de contraseña
  validatePasswordStrength(password: string): PasswordStrength {
    let score = 0;
    const hasNumbers = /\d/.test(password);
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLongEnough = password.length >= 8;

    // Requiere: 8+ caracteres, números Y letras
    if (!isLongEnough) {
      return {
        score: 0,
        message: 'Mínimo 8 caracteres requerido',
        color: '#dc3545'
      };
    }

    if (!hasNumbers) {
      return {
        score: 1,
        message: 'Debe contener números (0-9)',
        color: '#dc3545'
      };
    }

    if (!hasLetters) {
      return {
        score: 1,
        message: 'Debe contener letras (A-Z)',
        color: '#dc3545'
      };
    }

    // Si tiene 8+, números y letras
    score = 2;

    // Bonus por tener caracteres especiales
    if (hasSpecial) {
      score = 3;
      return {
        score: 3,
        message: '✓ Contraseña fuerte',
        color: '#28a745'
      };
    }

    return {
      score: 2,
      message: '✓ Contraseña válida',
      color: '#ffc107'
    };
  }

  // Actualizar fortaleza mientras escribe
  onPasswordChange() {
    this.passwordStrength = this.validatePasswordStrength(this.formData.nuevaClave);
  }

  togglePasswordVisibility(field: 'password' | 'confirm') {
    if (field === 'password') {
      this.passwordMode = this.passwordMode === 'password' ? 'text' : 'password';
    } else {
      this.confirmPasswordMode = this.confirmPasswordMode === 'password' ? 'text' : 'password';
    }
  }

  isPasswordValid(): boolean {
    const { nuevaClave, confirmarClave } = this.formData;

    if (!nuevaClave || !confirmarClave) {
      return false;
    }

    if (nuevaClave !== confirmarClave) {
      return false;
    }

    if (nuevaClave.length < 8) {
      return false;
    }

    const hasNumbers = /\d/.test(nuevaClave);
    const hasLetters = /[a-zA-Z]/.test(nuevaClave);

    return hasNumbers && hasLetters;
  }

  // Helper methods para el template
  hasMinLength(): boolean {
    return this.formData.nuevaClave.length >= 8;
  }

  hasNumbers(): boolean {
    return /\d/.test(this.formData.nuevaClave);
  }

  hasLetters(): boolean {
    return /[a-zA-Z]/.test(this.formData.nuevaClave);
  }

  async onSubmit(e: Event) {
    e.preventDefault();

    if (!this.formData.nuevaClave || !this.formData.confirmarClave) {
      notify({
        message: 'Por favor complete todos los campos',
        type: 'error',
        displayTime: 3000
      });
      return;
    }

    if (this.formData.nuevaClave !== this.formData.confirmarClave) {
      notify({
        message: 'Las contraseñas no coinciden',
        type: 'error',
        displayTime: 3000
      });
      return;
    }

    if (!this.isPasswordValid()) {
      notify({
        message: 'La contraseña no cumple con los requisitos de seguridad',
        type: 'error',
        displayTime: 3000
      });
      return;
    }

    this.loading = true;

    try {
      const url = environment.UrlSEGURIDADAPI + 'SEG_USUARIO/cambio-clave';
      const response: any = await this.http.post(url, {
        LOGIN_SISTEMA: this.loginSistema,
        CLAVE_USUARIO: this.formData.claveActual,
        CLAVE_USUARIO_NUEVA: this.formData.nuevaClave,
        CODIGO_SUITE: 'SGUEES'
      }).toPromise();

      this.loading = false;

      if (response && response.Result) {
        notify({
          message: '✓ Contraseña cambiada exitosamente. Iniciando sesión...',
          width: 'auto',
          type: 'success',
          displayTime: 2000
        });

        // Esperar 2 segundos y emitir evento
        setTimeout(() => {
          this.onPasswordChanged.emit();
        }, 2000);
      } else {
        notify({
          message: response?.ErrorMessage || 'Error al cambiar la contraseña',
          width: 'auto',
          type: 'error',
          displayTime: 5000
        });
      }
    } catch (error: any) {
      this.loading = false;
      console.error('Error al cambiar contraseña:', error);

      let errorMessage = 'Error al cambiar la contraseña';

      if (error?.error?.ErrorMessage) {
        errorMessage = error.error.ErrorMessage;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      notify({
        message: errorMessage,
        width: 'auto',
        type: 'error',
        displayTime: 5000
      });
    }
  }

  onHiding() {
    // No permitir cerrar el modal, es obligatorio cambiar la contraseña
  }
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DxPopupModule,
    DxFormModule,
    DxButtonModule,
    DxLoadIndicatorModule
  ],
  declarations: [ChangePasswordModalComponent],
  exports: [ChangePasswordModalComponent]
})
export class ChangePasswordModalModule { }
