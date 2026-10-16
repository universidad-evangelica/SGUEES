// Qué hace: servicio de lógica de negocio para la configuración de Parámetros SMTP.
// Cómo lo hace: valida datos del formulario, gestiona llamadas al repositorio y define columnas y formulario para DevExtreme.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { GenParametroSmtp } from './models/gen-parametro-smtp';
import { GenParametroSmtpRepository } from './gen-parametro-smtp.repository';

@Injectable({ providedIn: 'root' })
export class GenParametroSmtpService {
	constructor(private repo: GenParametroSmtpRepository) {}

	// Qué hace: valida las reglas de negocio del formulario antes de guardar.
	// Cómo lo hace: verifica campos requeridos, longitud y formato básico de correo.
	esValido(model: GenParametroSmtp, msg: Function): boolean {
		if (!model.SERVIDOR_CORREO || model.SERVIDOR_CORREO.trim() === '') {
			msg('Debe ingresar el servidor de correo (Host SMTP).', NotifyType.Warning);
			return false;
		}
		if (model.SERVIDOR_CORREO.trim().length > 150) {
			msg('El servidor de correo no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.PUERTO_CORREO || model.PUERTO_CORREO <= 0 || model.PUERTO_CORREO > 65535) {
			msg('Debe ingresar un puerto SMTP válido (entre 1 y 65535).', NotifyType.Warning);
			return false;
		}

		if (!model.CORREO_REMITENTE || model.CORREO_REMITENTE.trim() === '') {
			msg('Debe ingresar el correo remitente.', NotifyType.Warning);
			return false;
		}
		if (model.CORREO_REMITENTE.trim().length > 255) {
			msg('El correo remitente no puede superar 255 caracteres.', NotifyType.Warning);
			return false;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(model.CORREO_REMITENTE.trim())) {
			msg('El correo remitente no tiene un formato válido.', NotifyType.Warning);
			return false;
		}

		if (!model.USUARIO_REMITENTE || model.USUARIO_REMITENTE.trim() === '') {
			msg('Debe ingresar el usuario remitente.', NotifyType.Warning);
			return false;
		}
		if (model.USUARIO_REMITENTE.trim().length > 150) {
			msg('El usuario remitente no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.CONTRASENA_REMITENTE || model.CONTRASENA_REMITENTE.trim() === '') {
			msg('Debe ingresar la contraseña del remitente.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_PARAMETRO_SMTP', Value: param.CORR_PARAMETRO_SMTP }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_PARAMETRO_SMTP', Value: model.CORR_PARAMETRO_SMTP }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_PARAMETRO_SMTP', Value: model.CORR_PARAMETRO_SMTP }]);
	}

	private buildWhere(param: any): IParam[] {
		const where: IParam[] = [];
		if (param && param.CORR_PARAMETRO_SMTP) {
			where.push({ Parameter: 'CORR_PARAMETRO_SMTP', Value: param.CORR_PARAMETRO_SMTP });
		}
		return where;
	}

	// Qué hace: define las columnas del grid browse con anchos fijos numéricos y orden descendente por defecto.
	// Cómo lo hace: configura dataField, caption, width, sortOrder: 'desc' y alineación para mostrar del más reciente al más antiguo.
	getColumns(): any[] {
		return [
			{
				dataField: 'CORR_PARAMETRO_SMTP',
				caption: 'No.',
				width: 80,
				alignment: 'center',
				dataType: 'number',
				sortOrder: 'desc',
				sortIndex: 0,
			},
			{
				dataField: 'CORREO_REMITENTE',
				caption: 'Correo Remitente',
				width: 250,
			},
			{
				dataField: 'USUARIO_REMITENTE',
				caption: 'Usuario Remitente',
				width: 220,
			},
			{
				dataField: 'SERVIDOR_CORREO',
				caption: 'Servidor SMTP',
				width: 220,
			},
			{
				dataField: 'PUERTO_CORREO',
				caption: 'Puerto',
				width: 100,
				alignment: 'center',
			},
			{
				dataField: 'USA_SSL_CORREO',
				caption: 'Usa SSL/TLS',
				width: 120,
				cellTemplate: 'sslTemplate',
				alignment: 'center',
			},
			...buildAuditGridColumns(),
		];
	}

	// Qué hace: define los elementos del formulario de edición y creación.
	// Cómo lo hace: distribuye los campos en el grid de 8 columnas de CBaseComponent con validadores y controles especializados.
	getItems(): any[] {
		return [
			{
				dataField: 'CORREO_REMITENTE',
				label: { text: 'Correo Remitente' },
				colSpan: 4,
				editorType: 'dxTextBox',
				editorOptions: {
					placeholder: 'ej. notificaciones@uees.edu.sv',
					maxLength: 255,
					showClearButton: true,
				},
				validationRules: [
					{ type: 'required', message: 'El correo remitente es obligatorio' },
					{ type: 'email', message: 'El correo remitente no tiene un formato válido' },
				],
			},
			{
				dataField: 'USUARIO_REMITENTE',
				label: { text: 'Usuario Remitente' },
				colSpan: 4,
				editorType: 'dxTextBox',
				editorOptions: {
					placeholder: 'ej. notificaciones@uees.edu.sv',
					maxLength: 150,
					showClearButton: true,
				},
				validationRules: [{ type: 'required', message: 'El usuario remitente es obligatorio' }],
			},
			{
				dataField: 'SERVIDOR_CORREO',
				label: { text: 'Servidor SMTP (Host)' },
				colSpan: 6,
				editorType: 'dxTextBox',
				editorOptions: {
					placeholder: 'ej. smtp.office365.com',
					maxLength: 150,
					showClearButton: true,
				},
				validationRules: [{ type: 'required', message: 'El servidor de correo es obligatorio' }],
			},
			{
				dataField: 'PUERTO_CORREO',
				label: { text: 'Puerto' },
				colSpan: 2,
				editorType: 'dxNumberBox',
				editorOptions: {
					placeholder: '587',
					min: 1,
					max: 65535,
					showSpinButtons: true,
				},
				validationRules: [{ type: 'required', message: 'El puerto es obligatorio' }],
			},
			{
				dataField: 'CONTRASENA_REMITENTE',
				label: { text: 'Contraseña' },
				colSpan: 4,
				editorType: 'dxTextBox',
				editorOptions: {
					mode: 'password',
					placeholder: 'Contraseña de la cuenta de correo',
					maxLength: 150,
					showClearButton: true,
				},
				validationRules: [{ type: 'required', message: 'La contraseña es obligatoria' }],
			},
			{
				dataField: 'USA_SSL_CORREO',
				label: { text: 'Seguridad' },
				colSpan: 4,
				editorType: 'dxCheckBox',
				editorOptions: {
					text: 'Habilitar conexión segura (SSL / TLS)',
				},
			},
		];
	}

	getItemsForm(): any[] {
		return this.getItems();
	}
}
