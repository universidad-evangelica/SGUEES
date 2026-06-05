import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';

import { SegOpcionSistemaComponent } from './seg-opcion-sistema/seg-opcion-sistema.component';
import { ProfileComponent } from './profile/profile.component';
import { SegConfigOpcionComponent } from './seg-config-opcion/seg-config-opcion.component';
import { SegUsuarioComponent } from './seg-usuario/seg-usuario.component';
import { SegTipoUsuarioComponent } from './seg-tipo-usuario/seg-tipo-usuario.component';

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
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./seg-config-opcion/seg-config-opcion.module').then(m => m.SegConfigOpcionModule)
  },
  {
    path: 'seg-opcion-sistema',
    component: SegOpcionSistemaComponent,
    data: { titulo: 'Opciones del Sistema' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./seg-opcion-sistema/seg-opcion-sistema.module').then(m => m.SegOpcionSistemaModule)
  },
  {
    path: 'profile',
    component: ProfileComponent,
    data: { titulo: 'Perfil' },
    canActivate: [ AuthGuardService ],
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule)
  },
  {
    path: 'seg-usuario',
    component: SegUsuarioComponent,
    data: { titulo: 'Usuarios' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./seg-usuario/seg-usuario.module').then(m => m.SegUsuarioModule)
  },
  {
    path: 'seg-tipo-usuario',
    component: SegTipoUsuarioComponent,
    data: { titulo: 'Tipo Usuario' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./seg-tipo-usuario/seg-tipo-usuario.module').then(m => m.SegTipoUsuarioModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule { }
