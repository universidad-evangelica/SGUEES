import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SingleCardModule } from 'src/app/layouts';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthenticated-content',
  template: `
    <app-single-card [title]="title" [description]="description">
      <router-outlet></router-outlet>
    </app-single-card>
  `,
  styles: [`
    :host {
      width: 100%;
      height: 100%;
    }
  `],
})
export class UnauthenticatedContentComponent {
  constructor(private router: Router) { }

  get description() {
    const path = this.router.url.split('/').at(-1);
    switch (path) {
      case 'recuperar-contrasena':
      case 'reset-password': return 'Ingrese su usuario y le enviaremos un enlace al correo registrado para restablecer su contraseña.';
      default: return '';
    }
  }

  get title() {
    const path = this.router.url.split('/').at(-1);
    switch (path) {
      case 'login': return 'Iniciar sesión';
      case 'recuperar-contrasena':
      case 'reset-password': return 'Recuperar contraseña';
      case 'create-account': return 'Crear cuenta';
      case 'change-password': return 'Cambiar contraseña';
      default: return '';
    }
  }
}
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SingleCardModule,
  ],
  declarations: [UnauthenticatedContentComponent],
  exports: [UnauthenticatedContentComponent],
})
export class UnauthenticatedContentModule { }
