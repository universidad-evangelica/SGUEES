// Qué hace: servicio de lógica de negocio para la gestión de plantillas de correo.
// Cómo lo hace: valida campos obligatorios de plantilla, interactúa con el repositorio y define columnas con anchos fijos.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { GenParametroPlantilla } from './models/gen-parametro-plantilla';
import { GenParametroPlantillaRepository } from './gen-parametro-plantilla.repository';

@Injectable({ providedIn: 'root' })
export class GenParametroPlantillaService {
	constructor(private repo: GenParametroPlantillaRepository) {}

	// Qué hace: valida las reglas de negocio de la plantilla antes de persistir.
	// Cómo lo hace: comprueba código, nombre, asunto y cuerpo obligatorios.
	esValido(model: GenParametroPlantilla, msg: Function): boolean {
		if (!model.CODIGO_PLANTILLA || model.CODIGO_PLANTILLA.trim() === '') {
			msg('Debe ingresar el código de la plantilla.', NotifyType.Warning);
			return false;
		}
		if (model.CODIGO_PLANTILLA.trim().length > 50) {
			msg('El código de la plantilla no puede superar 50 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.NOMBRE_PLANTILLA || model.NOMBRE_PLANTILLA.trim() === '') {
			msg('Debe ingresar el nombre descriptivo de la plantilla.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE_PLANTILLA.trim().length > 150) {
			msg('El nombre de la plantilla no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.ASUNTO_PLANTILLA || model.ASUNTO_PLANTILLA.trim() === '') {
			msg('Debe ingresar el asunto de la plantilla.', NotifyType.Warning);
			return false;
		}
		if (model.ASUNTO_PLANTILLA.trim().length > 255) {
			msg('El asunto de la plantilla no puede superar 255 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.CUERPO_PLANTILLA || model.CUERPO_PLANTILLA.trim() === '') {
			msg('Debe ingresar el contenido HTML en el editor de la plantilla.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	// Qué hace: obtiene el listado de plantillas filtradas.
	// Cómo lo hace: construye parámetros de filtro hacia el repositorio.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Qué hace: obtiene una plantilla por su identificador.
	// Cómo lo hace: envía CORR_PARAMETRO_PLANTILLA al repositorio.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_PARAMETRO_PLANTILLA', Value: param.CORR_PARAMETRO_PLANTILLA }]);
	}

	// Qué hace: registra una nueva plantilla en la base de datos.
	// Cómo lo hace: delega la llamada de creación al repositorio.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: actualiza una plantilla existente.
	// Cómo lo hace: delega la actualización indicando la clave primaria.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_PARAMETRO_PLANTILLA', Value: model.CORR_PARAMETRO_PLANTILLA }]);
	}

	// Qué hace: elimina una plantilla de correo.
	// Cómo lo hace: delega la eliminación con la clave primaria de la plantilla.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_PARAMETRO_PLANTILLA', Value: model.CORR_PARAMETRO_PLANTILLA }]);
	}

	private buildWhere(param: any): IParam[] {
		const where: IParam[] = [];
		if (param && param.CORR_PARAMETRO_SMTP) {
			where.push({ Parameter: 'CORR_PARAMETRO_SMTP', Value: param.CORR_PARAMETRO_SMTP });
		}
		if (param && param.CORR_PARAMETRO_PLANTILLA) {
			where.push({ Parameter: 'CORR_PARAMETRO_PLANTILLA', Value: param.CORR_PARAMETRO_PLANTILLA });
		}
		return where;
	}

	// Qué hace: define las columnas del grid de plantillas con anchos fijos numéricos.
	// Cómo lo hace: configura dataField, caption, width y alineación para evitar columnas comprimidas.
	getColumns(): any[] {
		return [
			{
				dataField: 'CORR_PARAMETRO_PLANTILLA',
				caption: 'No.',
				width: 70,
				alignment: 'center',
				dataType: 'number',
				sortOrder: 'desc',
				sortIndex: 0,
			},
			{
				dataField: 'CODIGO_PLANTILLA',
				caption: 'Código',
				width: 140,
			},
			{
				dataField: 'NOMBRE_PLANTILLA',
				caption: 'Nombre de Plantilla',
				width: 220,
			},
			{
				dataField: 'ASUNTO_PLANTILLA',
				caption: 'Asunto de Correo',
				width: 260,
			},
			{
				dataField: 'CORREO_CC',
				caption: 'Copia (CC)',
				width: 180,
			},
			{
				dataField: 'ACTIVO_PLANTILLA',
				caption: 'Activo',
				width: 90,
				cellTemplate: 'activoPlantillaTemplate',
				alignment: 'center',
			},
			...buildAuditGridColumns(),
		];
	}

	// Qué hace: genera la estructura HTML base institucional oficial de la UEES para plantillas de correo en bloques separados compatibles con el editor.
	// Cómo lo hace: estructura cada sección (encabezado amarillo, tarjeta gris y pie de página azul) como bloques de tabla independientes con background-color en línea y separadores compactos para que DevExtreme Quill mantenga visibles los tres recuadros sólidos con espaciado equilibrado.
	obtenerFormatoBaseUEES(): string {
		return `<!-- Encabezado Institucional Amarillo -->
<table class="plantilla-uees-table" style="width: 100%; max-width: 650px; margin: 2px auto; border-collapse: collapse; border: none;">
	<tbody>
		<tr>
			<td style="background-color: #f7c600; text-align: center; padding: 24px 20px; border: none;">
				<img src="assets/img/logo-xx.png" alt="Universidad Evangélica de El Salvador" width="160" style="width: 160px; max-width: 160px; height: auto; display: block; margin: 0 auto;" />
			</td>
		</tr>
	</tbody>
</table>

<!-- Espacio separador ultra reducido -->
<p style="margin: 2px 0; line-height: 4px; font-size: 4px; text-align: center;">&nbsp;</p>

<!-- Tarjeta Central Gris -->
<table class="plantilla-uees-table" style="width: 100%; max-width: 650px; margin: 2px auto; border-collapse: collapse; border: none;">
	<tbody>
		<tr>
			<td style="background-color: #cccccc; text-align: center; padding: 32px 24px; border: none; color: #1e293b; font-size: 14px; line-height: 1.6;">
				<p style="text-align: center; margin: 0 0 12px 0; font-weight: bold; font-size: 16px; color: #0f172a;">Título</p>
				<p style="text-align: center; margin: 0 0 12px 0; color: #334155;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
				<p style="text-align: center; margin: 0; color: #334155;">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
			</td>
		</tr>
	</tbody>
</table>

<!-- Espacio separador ultra reducido -->
<p style="margin: 2px 0; line-height: 4px; font-size: 4px; text-align: center;">&nbsp;</p>

<!-- Pie de Página Institucional Azul -->
<table class="plantilla-uees-table" style="width: 100%; max-width: 650px; margin: 2px auto; border-collapse: collapse; border: none;">
	<tbody>
		<tr>
			<td style="background-color: #034ea2; text-align: center; padding: 22px 20px; border: none; color: #ffffff; font-size: 12px; line-height: 1.6;">
				<p style="text-align: center; margin: 0 0 10px 0; font-weight: bold; font-size: 13px; color: #ffffff;">Universidad Evangélica de El Salvador.</p>
				<p style="text-align: center; margin: 0 0 10px 0; color: #ffffff;">Copyright &copy; Todos los derechos reservados. Dirección: Prolongación Alameda Juan Pablo II, Calle el Carmen, San Antonio Abad, San Salvador, El Salvador.</p>
				<p style="text-align: center; margin: 0 0 10px 0; color: #ffffff;">Conmutador: +503 2275-4000</p>
				<p style="text-align: center; margin: 0; color: #ffffff;">Sitio web: <a href="https://www.uees.edu.sv" style="color: #60a5fa; text-decoration: underline;" target="_blank">www.uees.edu.sv</a></p>
			</td>
		</tr>
	</tbody>
</table>`;
	}
}
