import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { DxDropDownBoxModule } from 'devextreme-angular/ui/drop-down-box';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';

import { SegConfigOpcionComponent } from './seg-config-opcion.component';

const routes: Routes = [{ path: '', component: SegConfigOpcionComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes),
    CommonModule,
    DxFormModule,
    DxDataGridModule,
    DxButtonModule,
    DxLoadPanelModule,
    DxDropDownBoxModule,
    DxCheckBoxModule,
    DxTabPanelModule
  ],
  exports: [RouterModule],
  declarations: [
    SegConfigOpcionComponent
  ]

})
export class SegConfigOpcionRoutingModule { }
