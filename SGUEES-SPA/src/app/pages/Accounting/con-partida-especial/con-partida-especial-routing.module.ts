import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { PageHeaderModule } from 'src/app/shared/components/library/page-header/page-header.component';
import { ConPartidaEspecialComponent } from './con-partida-especial.component';

const routes: Routes = [{ path: '', component: ConPartidaEspecialComponent, data: { titulo: 'Partidas de Cierre y Apertura' } }];

@NgModule({
	imports: [CommonModule, DxButtonModule, DxLoadPanelModule, DxNumberBoxModule, PageHeaderModule, RouterModule.forChild(routes)],
	declarations: [ConPartidaEspecialComponent],
	exports: [RouterModule],
})
export class ConPartidaEspecialRoutingModule {}
