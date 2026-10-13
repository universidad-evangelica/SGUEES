// Qué hace: módulo Angular del catálogo de Parámetros SMTP.
// Cómo lo hace: importa GenParametroSmtpRoutingModule para empaquetar la vista de configuración SMTP.
import { NgModule } from '@angular/core';
import { GenParametroSmtpRoutingModule } from './gen-parametro-smtp-routing.module';

@NgModule({
	imports: [GenParametroSmtpRoutingModule],
})
export class GenParametroSmtpModule {}
