import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';



import { BanDocumentoProcesoComponent } from '../ban-documento-proceso/ban-documento-proceso.component';

import { BanDocumentoProcesoModule } from '../ban-documento-proceso/ban-documento-proceso.module';



const routes: Routes = [

	{

		path: '',

		component: BanDocumentoProcesoComponent,

		data: { titulo: 'Contabilizar Documentos Bancarios', modo: 'documento-contabilizar' },

	},

];



@NgModule({

	imports: [RouterModule.forChild(routes), BanDocumentoProcesoModule],

	exports: [RouterModule],

})

export class BanDocumentoContabilizarRoutingModule {}


