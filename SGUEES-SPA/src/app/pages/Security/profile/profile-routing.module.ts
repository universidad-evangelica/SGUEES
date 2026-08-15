import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { ChangePasswordFormModule } from 'src/app/shared/components/library/change-password-form/change-password-form.component';
import { ProfileComponent } from './profile.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';

const routes: Routes = [{ path: '', component: ProfileComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes),
    CommonModule,
    DxButtonModule,
    DxPopupModule,
    DxLoadPanelModule,
    ChangePasswordFormModule,
    BarraDataMttoModule
  ],
  exports: [RouterModule],
  declarations: [
    ProfileComponent
  ]
})
export class ProfileRoutingModule { }
