import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output, ViewChild } from '@angular/core';
import { ValidationCallbackData } from 'devextreme-angular/common';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxFormComponent, DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import notify from 'devextreme/ui/notify';
import {
  evaluatePasswordPolicy,
  passwordsMatch,
  PasswordPolicyCheck,
} from 'src/app/shared/utils/password-policy';

export interface ChangePasswordFormValue {
  CLAVE_USUARIO: string;
  CLAVE_USUARIO_NUEVA: string;
  CLAVE_CONFIRMAR: string;
}

@Component({
  selector: 'change-password-form',
  templateUrl: './change-password-form.component.html',
  styleUrls: ['./change-password-form.component.scss'],
})
export class ChangePasswordFormComponent {
  @Input() loading = false;
  @Input() showCancel = true;

  @Output() submitted = new EventEmitter<ChangePasswordFormValue>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild(DxFormComponent) form!: DxFormComponent;

  formData: ChangePasswordFormValue = {
    CLAVE_USUARIO: '',
    CLAVE_USUARIO_NUEVA: '',
    CLAVE_CONFIRMAR: '',
  };

  passwordPolicy: PasswordPolicyCheck = evaluatePasswordPolicy('');

  readonly newPasswordEditorOptions = {
    stylingMode: 'filled',
    placeholder: 'Nueva contraseña',
    mode: 'password',
    inputAttr: { autocomplete: 'new-password' },
    onValueChanged: () => this.onNewPasswordChanged(),
  };

  readonly validateNewPasswordPolicy = (e: ValidationCallbackData) =>
    evaluatePasswordPolicy(`${e.value ?? ''}`).isValid;

  readonly validatePasswordConfirm = (e: ValidationCallbackData) =>
    passwordsMatch(this.formData.CLAVE_USUARIO_NUEVA, `${e.value ?? ''}`);

  readonly validateDifferentFromCurrent = (e: ValidationCallbackData) => {
    const nueva = `${e.value ?? ''}`;
    const actual = `${this.formData.CLAVE_USUARIO ?? ''}`;
    return !actual || !nueva || actual !== nueva;
  };

  onNewPasswordChanged(): void {
    this.passwordPolicy = evaluatePasswordPolicy(this.formData.CLAVE_USUARIO_NUEVA);
  }

  resetForm(): void {
    this.formData = {
      CLAVE_USUARIO: '',
      CLAVE_USUARIO_NUEVA: '',
      CLAVE_CONFIRMAR: '',
    };
    this.passwordPolicy = evaluatePasswordPolicy('');
    this.form?.instance?.resetValues();
  }

  submitForm(event: Event): void {
    event.preventDefault();

    const validation = this.form?.instance?.validate();
    if (validation && !validation.isValid) {
      notify({ message: 'Revise los campos marcados antes de continuar.', width: 'auto', shading: false }, 'warning', 3000);
      return;
    }

    if (!passwordsMatch(this.formData.CLAVE_USUARIO_NUEVA, this.formData.CLAVE_CONFIRMAR)) {
      notify({ message: 'Las contraseñas no coinciden.', width: 'auto', shading: false }, 'warning', 3000);
      return;
    }

    const policy = evaluatePasswordPolicy(this.formData.CLAVE_USUARIO_NUEVA);
    if (!policy.isValid) {
      notify({ message: policy.message, width: 'auto', shading: false }, 'warning', 3000);
      return;
    }

    if (this.formData.CLAVE_USUARIO === this.formData.CLAVE_USUARIO_NUEVA) {
      notify({ message: 'La nueva contraseña debe ser diferente a la actual.', width: 'auto', shading: false }, 'warning', 3000);
      return;
    }

    this.submitted.emit({ ...this.formData });
  }

  cancelForm(): void {
    this.resetForm();
    this.cancelled.emit();
  }
}

@NgModule({
  imports: [CommonModule, DxFormModule, DxButtonModule, DxLoadIndicatorModule],
  declarations: [ChangePasswordFormComponent],
  exports: [ChangePasswordFormComponent],
})
export class ChangePasswordFormModule {}
