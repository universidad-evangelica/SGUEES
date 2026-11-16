import { CommonModule } from '@angular/common';
import { Component, NgModule, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ValidationCallbackData } from 'devextreme-angular/common';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from 'src/app/shared/services';

const notificationText = 'Si el usuario existe, enviamos un correo con el enlace para restablecer la contraseña.';

@Component({
  standalone: false,
  selector: 'reset-password-form',
  templateUrl: './reset-password-form.component.html',
  styleUrls: ['./reset-password-form.component.scss'],
})
export class ResetPasswordFormComponent implements OnInit {
  @Input() signInLink = '/login-form';

  @Input() buttonLink = '/login-form';

  isTokenFlow = false;
  recoveryToken = '';
  loginFromQuery = '';
  tokenLinkInvalid = false;

  loading = false;
  emailRequestSent = false;

  formData: any = {};

  tokenForm = {
    nuevaClave: '',
    confirmarClave: '',
  };

  passwordMode = 'password';
  confirmPasswordMode = 'password';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  async onSubmit(e: Event) {
    e.preventDefault();

    if (this.isTokenFlow) {
      await this.submitTokenFlow();
      return;
    }

    this.loading = true;
    const result = await this.authService.resetPassword(this.formData.user);
    this.loading = false;

    if (result.isOk) {
      this.emailRequestSent = true;
      this.showToast('success', 'Éxito', notificationText, 3000);
    } else {
      this.showToast('error', 'Error', result.message, 6000);
    }
  }

  private async submitTokenFlow(): Promise<void> {
    if (this.tokenLinkInvalid) {
      this.showToast(
        'error',
        'Enlace no válido',
        'Solicite un nuevo correo de recuperación e use el último enlace recibido.',
        6000
      );
      return;
    }

    if (!this.formData.user?.trim()) {
      this.showToast('error', 'Error', 'Debe indicar el usuario.', 4000);
      return;
    }

    if (!this.isPasswordValid()) {
      this.showToast(
        'error',
        'Contraseña',
        'La nueva contraseña debe tener al menos 8 caracteres, letras y números, y coincidir en ambos campos.',
        5000
      );
      return;
    }

    this.loading = true;
    const result = await this.authService.changePassword(
      this.tokenForm.nuevaClave,
      this.recoveryToken,
      this.formData.user.trim()
    );
    this.loading = false;

    if (result.isOk) {
      this.showToast(
        'success',
        'Éxito',
        'Contraseña restablecida correctamente. Inicia sesión con tu nueva clave.',
        3000
      );
      setTimeout(() => {
        this.router.navigate([this.buttonLink]);
      }, 2000);
    } else {
      this.showToast('error', 'Error', result.message, 8000);
    }
  }

  private showToast(
    severity: 'success' | 'error' | 'warn' | 'info',
    summary: string,
    detail: string,
    life: number
  ): void {
    this.messageService.clear();
    this.messageService.add({
      severity,
      summary,
      detail,
      life,
    });
  }

  confirmPassword = (e: ValidationCallbackData) => e.value === this.formData.password;

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.passwordMode = this.passwordMode === 'password' ? 'text' : 'password';
    } else {
      this.confirmPasswordMode = this.confirmPasswordMode === 'password' ? 'text' : 'password';
    }
  }

  isPasswordValid(): boolean {
    const { nuevaClave, confirmarClave } = this.tokenForm;
    if (!nuevaClave || !confirmarClave || nuevaClave !== confirmarClave) {
      return false;
    }
    if (nuevaClave.length < 8) {
      return false;
    }
    return /\d/.test(nuevaClave) && /[a-zA-Z]/.test(nuevaClave);
  }

  hasMinLength(): boolean {
    return this.tokenForm.nuevaClave.length >= 8;
  }

  hasNumbers(): boolean {
    return /\d/.test(this.tokenForm.nuevaClave);
  }

  hasLetters(): boolean {
    return /[a-zA-Z]/.test(this.tokenForm.nuevaClave);
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.recoveryToken = this.normalizeTokenFromUrl(params.get('token'));
      this.loginFromQuery = (params.get('login') || '').trim();
      this.isTokenFlow = !!this.recoveryToken;
      this.tokenLinkInvalid = this.isTokenFlow && !this.recoveryToken;
      this.formData = {
        user: this.loginFromQuery,
      };
      this.tokenForm = { nuevaClave: '', confirmarClave: '' };
    });
  }

  /** En query string los '+' del JWT suelen convertirse en espacios; restaurar formato. */
  private normalizeTokenFromUrl(raw: string | null): string {
    if (!raw) {
      return '';
    }

    let token = raw.trim();
    try {
      token = decodeURIComponent(token);
    } catch {
      // ya venía decodificado
    }

    if (token.includes(' ') && token.includes('.')) {
      token = token.replace(/ /g, '+');
    }

    return token;
  }
}

@NgModule({
  imports: [CommonModule, RouterModule, FormsModule, DxFormModule, DxLoadIndicatorModule, ToastModule],
  declarations: [ResetPasswordFormComponent],
  exports: [ResetPasswordFormComponent],
})
export class ResetPasswordFormModule {}
