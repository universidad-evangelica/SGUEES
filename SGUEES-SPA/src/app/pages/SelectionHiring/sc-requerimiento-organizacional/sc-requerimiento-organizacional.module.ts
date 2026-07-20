// Qué hace: módulo contenedor del mantenimiento de requerimiento organizacional.
// Cómo: importa ScRequerimientoOrganizacionalRoutingModule para registrar la ruta lazy del catálogo.
import { NgModule } from '@angular/core';
import { ScRequerimientoOrganizacionalRoutingModule } from './sc-requerimiento-organizacional-routing.module';

@NgModule({
	imports: [ScRequerimientoOrganizacionalRoutingModule],
})
export class ScRequerimientoOrganizacionalModule {}
