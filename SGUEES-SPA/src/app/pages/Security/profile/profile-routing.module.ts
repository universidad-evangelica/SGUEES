import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { ProfileComponent } from './profile.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';

const routes: Routes = [{ path: '', component: ProfileComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes),
    CommonModule,
    DxFormModule,
    DxButtonModule,
    DxPopupModule,
    BarraDataMttoModule
  ],
  exports: [RouterModule],
  declarations: [
    ProfileComponent
  ]
})
export class ProfileRoutingModule { }
