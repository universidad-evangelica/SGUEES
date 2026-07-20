import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';



import { BanChequeImprimirComponent } from './ban-cheque-imprimir.component';

import { BanChequeImprimirScreenModule } from './ban-cheque-imprimir-screen.module';



const routes: Routes = [

	{

		path: '',

		component: BanChequeImprimirComponent,

		data: { titulo: 'Cheques a Imprimir' },

	},

];



@NgModule({

	imports: [RouterModule.forChild(routes), BanChequeImprimirScreenModule],

	exports: [RouterModule],

})

export class BanChequeImprimirRoutingModule {}


