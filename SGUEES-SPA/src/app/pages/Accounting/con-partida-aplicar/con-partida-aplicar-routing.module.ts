import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConPartidaOperacionComponent } from '../con-partida-operacion/con-partida-operacion.component';
import { ConPartidaOperacionModule } from '../con-partida-operacion/con-partida-operacion.module';

const routes: Routes = [
	{
		path: '',
		component: ConPartidaOperacionComponent,
		data: { titulo: 'Partidas a Aplicar', modo: 'aplicar' },
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes), ConPartidaOperacionModule],
	exports: [RouterModule],
})
export class ConPartidaAplicarRoutingModule {}
