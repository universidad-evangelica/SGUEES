import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';

import { SegOpcionSistemaComponent } from './seg-opcion-sistema/seg-opcion-sistema.component';
import { ProfileComponent } from './profile/profile.component';
import { SegConfigOpcionComponent } from './seg-config-opcion/seg-config-opcion.component';
import { SegUsuarioComponent } from './seg-usuario/seg-usuario.component';
import { SegTipoUsuarioComponent } from './seg-tipo-usuario/seg-tipo-usuario.component';
import { SegFlujoTipoDocumentoComponent } from './seg-flujo-tipo-documento/seg-flujo-tipo-documento.component';
import { SegFlujoActorComponent } from './seg-flujo-actor/seg-flujo-actor.component';
import { SegFlujoProcesoComponent } from './seg-flujo-proceso/seg-flujo-proceso.component';

const routes: Routes = [
  /*{
    path: 'seg-usuario',
    component: SegUsuarioComponent,
    data: { titulo: 'Usuarios' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./seg-usuario/seg-usuario.module').then(m => m.SegUsuarioModule)
  },*/
  {
    path: 'seg-config-opcion',
    component: SegConfigOpcionComponent,
    data: { titulo: 'Configuracion de Opciones' },
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    loadChildren: () => import('./seg-config-opcion/seg-config-opcion.module').then(m => m.SegConfigOpcionModule)
  },
  {
    path: 'seg-opcion-sistema',
    component: SegOpcionSistemaComponent,
    data: { titulo: 'Opciones del Sistema' },
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    loadChildren: () => import('./seg-opcion-sistema/seg-opcion-sistema.module').then(m => m.SegOpcionSistemaModule)
  },
  {
    path: 'profile',
    component: ProfileComponent,
    data: { titulo: 'Perfil' },
    canActivate: [AuthGuardService],
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule)
  },
  {
    path: 'seg-usuario',
    component: SegUsuarioComponent,
    data: { titulo: 'Usuarios' },
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    loadChildren: () => import('./seg-usuario/seg-usuario.module').then(m => m.SegUsuarioModule)
  },
  {
    path: 'seg-tipo-usuario',
    component: SegTipoUsuarioComponent,
    data: { titulo: 'Tipo Usuario' },
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    loadChildren: () => import('./seg-tipo-usuario/seg-tipo-usuario.module').then(m => m.SegTipoUsuarioModule)
  },
  {
    path: 'seg-flujo-tipo-documento',
    component: SegFlujoTipoDocumentoComponent,
    data: { titulo: 'Documentos' },
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    loadChildren: () => import('./seg-flujo-tipo-documento/seg-flujo-tipo-documento.module').then(m => m.SegFlujoTipoDocumentoModule)
  },
  {
    path: 'seg-flujo-actor',
    component: SegFlujoActorComponent,
    data: { titulo: 'Actores de flujos' },
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    loadChildren: () => import('./seg-flujo-actor/seg-flujo-actor.module').then(m => m.SegFlujoActorModule)
  },
  {
    path: 'seg-flujo-proceso',
    component: SegFlujoProcesoComponent,
    data: { titulo: 'Flujos del sistema' },
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    loadChildren: () => import('./seg-flujo-proceso/seg-flujo-proceso.module').then(m => m.SegFlujoProcesoModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule { }
