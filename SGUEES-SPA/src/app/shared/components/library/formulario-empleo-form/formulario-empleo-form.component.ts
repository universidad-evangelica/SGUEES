import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FormularioEmpleoFormService } from './formulario-empleo-form.service';

interface FormularioEmpleoData {
	NOMBRE1: string;
	NOMBRE2: string;
	APELLIDO1: string;
	APELLIDO2: string;
}

@Component({
	selector: 'formulario-empleo-form',
	templateUrl: './formulario-empleo-form.component.html',
	styleUrls: ['../reset-password-form/reset-password-form.component.scss'],
})
export class FormularioEmpleoFormComponent implements OnInit {
	token = '';
	validandoToken = true;
	tokenValido = false;
	enviando = false;
	completado = false;
	mensajeToken = '';

	formData: FormularioEmpleoData = {
		NOMBRE1: '',
		NOMBRE2: '',
		APELLIDO1: '',
		APELLIDO2: '',
	};

	constructor(
		private route: ActivatedRoute,
		private service: FormularioEmpleoFormService,
		private messageService: MessageService
	) {}

	ngOnInit(): void {
		this.token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
		void this.validarToken();
	}

	async validarToken(): Promise<void> {
		this.validandoToken = true;
		this.tokenValido = false;

		if (!this.token) {
			this.mensajeToken = 'El enlace es inválido, expiró o ya fue utilizado.';
			this.validandoToken = false;
			return;
		}

		try {
			const response: any = await firstValueFrom(this.service.validarToken(this.token));
			this.tokenValido = response.Result === true && response.Data?.VALIDO === true;
			this.mensajeToken = this.tokenValido
				? ''
				: 'El enlace es inválido, expiró o ya fue utilizado.';
		} catch {
			this.mensajeToken = 'No fue posible validar el enlace. Inténtalo nuevamente.';
		} finally {
			this.validandoToken = false;
		}
	}

	async onSubmit(e: Event): Promise<void> {
		e.preventDefault();
		if (!this.tokenValido || this.enviando) {
			return;
		}

		this.enviando = true;
		try {
			const response: any = await firstValueFrom(
				this.service.completar({
					TOKEN: this.token,
					...this.formData,
					// Agregar aquí los nuevos campos del formulario de solicitud de empleo.
				})
			);

			if (response.Result) {
				this.completado = true;
				this.tokenValido = false;
				this.messageService.add({
					severity: 'success',
					summary: 'Éxito',
					detail: 'La información fue enviada correctamente.',
					life: 4000,
				});
			} else {
				this.mostrarError(response.ErrorMessage);
			}
		} catch (error: any) {
			this.mostrarError(
				error?.error?.ErrorMessage ??
				error?.error?.errorMessage ??
				'No fue posible enviar la información. El enlace pudo expirar o ya fue utilizado.'
			);
			await this.validarToken();
		} finally {
			this.enviando = false;
		}
	}

	private mostrarError(mensaje: string): void {
		this.messageService.add({
			severity: 'error',
			summary: 'Error',
			detail: mensaje,
			life: 6000,
		});
	}
}

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		DxFormModule,
		DxLoadIndicatorModule,
		ToastModule,
	],
	declarations: [FormularioEmpleoFormComponent],
	exports: [FormularioEmpleoFormComponent],
})
export class FormularioEmpleoFormModule {}
