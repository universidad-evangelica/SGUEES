import { CommonModule } from '@angular/common';
import { Component, NgModule, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';

import { LoginOauthModule } from 'src/app/shared/components/library/login-oauth/login-oauth.component';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { DxButtonModule, DxButtonTypes } from 'devextreme-angular/ui/button';
import notify from 'devextreme/ui/notify';
import { AuthService/*, IResponse*/, ThemeService } from 'src/app/shared/services';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent /*implements OnInit*/ {
  @Input() resetLink = '/auth/reset-password';
  @Input() createAccountLink = '/auth/create-account';

  // defaultAuthData: IResponse;

  btnStylingMode: DxButtonTypes.ButtonStyle;

  passwordMode = 'password';
  showPassword = false;
  errorMessage = '';

  loading = false;

  formData: any = {};

  passwordEditorOptions = {
    placeholder: 'Password',
    stylingMode:'filled',
    mode: this.passwordMode,
    value: 'password',
    // buttons: [{
    //   name: 'password',
    //   location: 'after',
    //   options: {
    //     icon: 'info',
    //     stylingMode:'text',
    //     onClick: () => this.changePasswordMode(),
    //   }
    // }]
  }

  constructor(private authService: AuthService, private router: Router, private themeService: ThemeService) {
    this.themeService.isDark.subscribe((value: boolean) => {
      this.btnStylingMode = value ? 'outlined' : 'contained';
    });
  }

  changePasswordMode() {
    debugger;
    this.passwordMode = this.passwordMode === 'text' ? 'password' : 'text';
  };

  async onSubmit(e: Event) {
    e.preventDefault();
    const { usuario, password } = this.formData;
    this.loading = true;

    this.authService.logIn(usuario, password).pipe(take(1)).subscribe(
      (user: any) => {
        this.loading = false;
        this.router.navigate(['/home']);
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

  /*onCreateAccountClick = () => {
    this.router.navigate([this.createAccountLink]);
  };*/

  /*async ngOnInit(): Promise<void> {
    this.defaultAuthData = await this.authService.getUser();
  }*/
}
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoginOauthModule,
    DxFormModule,
    DxLoadIndicatorModule,
    DxButtonModule
  ],
  declarations: [LoginFormComponent],
  exports: [LoginFormComponent],
})
export class LoginFormModule { }

