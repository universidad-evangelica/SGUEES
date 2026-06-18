import { CommonModule } from '@angular/common';
import { Component, NgModule, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ValidationCallbackData } from 'devextreme-angular/common';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from 'src/app/shared/services';

const notificationText = 'Si el usuario existe, enviamos un correo con el enlace para restablecer la contraseña.';

@Component({
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

  loading = false;

  /** Estado visual tras envío exitoso del correo de recuperación (solo flujo email). */
  emailRequestSent = false;

  formData: any = {};

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) { }

  async onSubmit(e: Event) {
    e.preventDefault();
    this.loading = true;

    const result = this.isTokenFlow
      ? await this.authService.changePassword(
        this.formData.password,
        this.recoveryToken,
        this.formData.user
      )
      : await this.authService.resetPassword(this.formData.user);

    this.loading = false;

    if (result.isOk) {
      if (this.isTokenFlow) {
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
        this.emailRequestSent = true;
        this.showToast('success', 'Éxito', notificationText, 3000);
      }
    } else {
      const genericResetError = 'No fue posible restablecer la contraseña';
      const message = this.isTokenFlow && (!result.message || result.message === genericResetError)
        ? 'No fue posible restablecer la contraseña. Solicita un nuevo enlace de recuperación e inténtalo nuevamente.'
        : result.message;

      this.showToast('error', 'Error', message, 6000);
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
      life
    });
  }

  confirmPassword = (e: ValidationCallbackData) => e.value === this.formData.password;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.recoveryToken = params.get('token') || '';
      this.loginFromQuery = params.get('login') || '';
      this.isTokenFlow = !!this.recoveryToken;
      this.formData = {
        user: this.loginFromQuery,
      };
    });
  }
}
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    DxFormModule,
    DxLoadIndicatorModule,
    ToastModule,
  ],
  declarations: [ResetPasswordFormComponent],
  exports: [ResetPasswordFormComponent],
})
export class ResetPasswordFormModule { }
