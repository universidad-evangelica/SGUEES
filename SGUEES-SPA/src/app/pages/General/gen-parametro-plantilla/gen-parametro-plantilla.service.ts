// Qué hace: servicio de lógica de negocio para la gestión de plantillas de correo.
// Cómo lo hace: valida campos obligatorios de plantilla, interactúa con el repositorio y define columnas con anchos fijos.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns, buildEstadoColumn } from 'src/app/shared/mtto/mtto-grid.helpers';
import { GenParametroPlantilla } from './models/gen-parametro-plantilla';
import { GenParametroPlantillaRepository } from './gen-parametro-plantilla.repository';

// Qué hace: define el logotipo institucional de la UEES en formato Base64 para incrustación directa en plantillas y correos.
// Cómo lo hace: almacena la cadena data:image/png;base64 oficial idéntica a la utilizada en CRoutines.BodyEmailUEES.
const _Mensaje =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACACAYAAADpjpBkAAAACXBIWXMAAAsTAAALEwEAmpwYAAAMT2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4wLWMwMDEgNzkuMTRlY2I0MiwgMjAyMi8xMi8wMi0xOToxMjo0NCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI0LjIgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMy0wNC0xN1QwOTo0Mzo0Mi0wNjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0wNS0xNlQxMzoxMToxMS0wNjowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjMtMDUtMTZUMTM6MTE6MTEtMDY6MDAiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MmE0ZDc5YTEtNDRhOC04NTQzLWE4ZTgtYjc4ZmRjM2VjY2NiIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6MTY3MjRmYTctOTNmOS1mMTQ4LWJjOWMtYzQxZmZhOThiOTFlIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MjMzMjU1YTMtZDk0NC1kYTQ4LTk0MzctOGM5ZjRmZWEyZWU4IiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkxlZ2FjeUlQVENEaWdlc3Q9IkNEQ0ZGQTdEQThDN0JFMDkwNTcwNzZBRUFGMDVDMzRFIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB0aWZmOkltYWdlV2lkdGg9Ijc4MSIgdGlmZjpJbWFnZUxlbmd0aD0iNjY4IiB0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb249IjIiIHRpZmY6T3JpZW50YXRpb249IjEiIHRpZmY6U2FtcGxlc1BlclBpeGVsPSIzIiB0aWZmOlhSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpFeGlmVmVyc2lvbj0iMDIzMSIgZXhpZjpDb2xvclNwYWNlPSI2NTUzNSIgZXhpZjpQaXhlbFhEaW1lbnNpb249IjM1MCIgZXhpZjpQaXhlbFlEaW1lbnNpb249IjI5OSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MjMzMjU1YTMtZDk0NC1kYTQ4LTk0MzctOGM5ZjRmZWEyZWU4IiBzdEV2dDp3aGVuPSIyMDIzLTA0LTE3VDA5OjQzOjQyLTA2OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjQuMiAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjlhNjBjM2I2LTY4NTQtYTY0OC04NjcxLTVjZDE4Y2E5NTczZCIgc3RFdnQ6d2hlbj0iMjAyMy0wNC0xN1QwOTo0Mzo0Mi0wNjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjIgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiMWU0YWI0OS05YzU4LTE0NDgtYjkzZS1jOTQ4YzQ0N2QwYmUiIHN0RXZ0OndoZW49IjIwMjMtMDQtMjFUMTE6MDI6MDctMDY6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNC4yIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGltYWdlL2pwZWcgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBpbWFnZS9qcGVnIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MTYyYzRjZTEtN2NkMS0xYzQ0LTg4YTEtYmQ1NmNlODhmMzkwIiBzdEV2dDp3aGVuPSIyMDIzLTA0LTIxVDExOjAyOjA3LTA2OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjQuMiAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjJhNGQ3OWExLTQ0YTgtODU0My1hOGU4LWI3OGZkYzNlY2NjYiIgc3RFdnQ6d2hlbj0iMjAyMy0wNS0xNlQxMzoxMToxMS0wNjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjIgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpiMWU0YWI0OS05YzU4LTE0NDgtYjkzZS1jOTQ4YzQ0N2QwYmUiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDozMTU4Mjk1Mi04ZjdhLTVmNGUtYTQ0YS0yNDcyY2EzYWI0ODMiIHN0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoyMzMyNTVhMy1kOTQ0LWRhNDgtOTQzNy04YzlmNGZlYTJlZTgiLz4gPHRpZmY6Qml0c1BlclNhbXBsZT4gPHJkZjpTZXE+IDxyZGY6bGk+ODwvcmRmOmxpPiA8cmRmOmxpPjg8L3JkZjpsaT4gPHJkZjpsaT44PC9yZGY6bGk+IDwvcmRmOlNlcT4gPC90aWZmOkJpdHNQZXJTYW1wbGU+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+WDcBHQAAZ7hJREFUeJztfWd4XNW19rtPm97Ve7El994B27iA6b13SCCEloQQCCGUhEBIgNACIUACoXdTTLHBBfduy02S1btGmt5O39+PMyPJBhPyXYzJvaznkTQ6c9qc/c4q71p7bUIpxQ/yg3zbwhzpG/hB/nfKD8D6QQ6L/ACsH+SwyA/A+kEOi/wArB/ksMj/A8+FJ4MmRS06AAAAAElFTkSuQmCC';

@Injectable({ providedIn: 'root' })
export class GenParametroPlantillaService {
	constructor(private repo: GenParametroPlantillaRepository) {}

	// Qué hace: valida las reglas de negocio de la plantilla antes de persistir.
	// Cómo lo hace: comprueba código, nombre, asunto, cuenta SMTP, módulo, menú y cuerpo obligatorios.
	esValido(model: GenParametroPlantilla, msg: Function): boolean {
		if (!model.CORR_PARAMETRO_SMTP || Number(model.CORR_PARAMETRO_SMTP) <= 0) {
			msg('Debe seleccionar la cuenta de correo remitente (SMTP).', NotifyType.Warning);
			return false;
		}

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

		if (!model.CODIGO_SISTEMA || model.CODIGO_SISTEMA.trim() === '') {
			msg('Debe seleccionar el módulo de la plantilla.', NotifyType.Warning);
			return false;
		}

		if (!model.CODIGO_OPCION || model.CODIGO_OPCION.trim() === '') {
			msg('Debe seleccionar el menú o proceso de la plantilla.', NotifyType.Warning);
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

	// Qué hace: registra una nueva plantilla de correo.
	// Cómo lo hace: delega la inserción al repositorio.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: actualiza una plantilla existente.
	// Cómo lo hace: delega la modificación pasando la clave primaria al repositorio.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_PARAMETRO_PLANTILLA', Value: model.CORR_PARAMETRO_PLANTILLA }]);
	}

	// Qué hace: elimina una plantilla de correo.
	// Cómo lo hace: delega la eliminación con la clave primaria de la plantilla.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_PARAMETRO_PLANTILLA', Value: model.CORR_PARAMETRO_PLANTILLA }]);
	}

	// Qué hace: obtiene los parámetros dinámicos disponibles para un proceso u opción.
	// Cómo lo hace: consulta el endpoint GetParametrosDisponibles a través del repositorio.
	getParametrosDisponibles(codigoOpcion?: string, codigoSistema?: string): Observable<IResult> {
		const where: IParam[] = [];
		if (codigoOpcion) {
			where.push({ Parameter: 'codigoOpcion', Value: codigoOpcion });
		}
		if (codigoSistema) {
			where.push({ Parameter: 'codigoSistema', Value: codigoSistema });
		}
		return this.repo.getParametrosDisponibles(where);
	}

	// Qué hace: obtiene el catálogo de módulos / sistemas registrados.
	// Cómo lo hace: invoca getModulos del repositorio.
	getModulos(): Observable<IResult> {
		return this.repo.getModulos();
	}

	// Qué hace: obtiene el catálogo de menús u opciones asignadas a un módulo.
	// Cómo lo hace: invoca getOpcionesPorModulo del repositorio filtrado por codigoSistema.
	getOpcionesPorModulo(codigoSistema: string): Observable<IResult> {
		return this.repo.getOpcionesPorModulo(codigoSistema);
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

	// Qué hace: define las columnas del grid de plantillas con anchos fijos numéricos y configuración estándar de estado.
	// Cómo lo hace: configura dataField, caption, width generoso y helper buildEstadoColumn para evitar textos truncados y mostrar 'Activo' o 'Inactivo'.
	getColumns(): any[] {
		return [
			{
				dataField: 'CORR_PARAMETRO_PLANTILLA',
				caption: 'No.',
				width: 80,
				alignment: 'center',
				dataType: 'number',
				sortOrder: 'desc',
				sortIndex: 0,
			},
			{
				dataField: 'CODIGO_PLANTILLA',
				caption: 'Código',
				width: 230,
			},
			{
				dataField: 'NOMBRE_PLANTILLA',
				caption: 'Nombre de Plantilla',
				width: 280,
			},
			{
				dataField: 'ASUNTO_PLANTILLA',
				caption: 'Asunto de Correo',
				width: 280,
			},
			{
				dataField: 'CORREO_REMITENTE',
				caption: 'Remitente (SMTP)',
				width: 250,
			},
			{
				dataField: 'NOMBRE_SISTEMA',
				caption: 'Módulo',
				width: 220,
			},
			{
				dataField: 'NOMBRE_OPCION',
				caption: 'Menú / Proceso',
				width: 220,
			},
			{
				dataField: 'CORREO_CC',
				caption: 'Copia (CC)',
				width: 180,
			},
			buildEstadoColumn('ACTIVO_PLANTILLA', {
				caption: 'Estado',
				width: 130,
				activoLabel: 'Activo',
				inactivoLabel: 'Inactivo',
			}),
			...buildAuditGridColumns({ withDateTimeFilter: true, usuarioWidth: 150, fechaWidth: 170 }),
		];
	}

	// Qué hace: genera la estructura HTML base institucional oficial de la UEES para plantillas de correo en bloques separados compatibles con el editor.
	// Cómo lo hace: estructura cada sección como bloques de tabla independientes con logotipo oficial e identidad corporativa.
	obtenerFormatoBaseUEES(): string {
		const encabezadoHtml = `<table class="plantilla-uees-table plantilla-uees-cabecera" style="width: 100%; max-width: 650px; background-color: #ffdc00; border-collapse: collapse; margin: 0 auto; border: none;" data-tipo="cabecera">
  <tbody>
    <tr>
      <td style="padding: 18px 24px; text-align: left; vertical-align: middle; border: none;">
        <img src="${_Mensaje}" alt="Logotipo UEES" style="max-height: 52px; height: auto; width: auto; display: block; border: 0; outline: none; text-decoration: none;" />
      </td>
    </tr>
  </tbody>
</table>`;

		const cuerpoHtml = `<table class="plantilla-uees-table plantilla-uees-cuerpo" style="width: 100%; max-width: 650px; background-color: #f8fafc; border-collapse: collapse; margin: 0 auto; border: none;" data-tipo="cuerpo">
  <tbody>
    <tr>
      <td style="padding: 24px 28px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; border: none;">
        <p style="margin: 0 0 12px 0;">Estimado(a) <strong>&#64;NOMBRE_COMPLETO</strong>,</p>
        <p style="margin: 0 0 12px 0;">Le informamos que se ha procesado su gestión en la plataforma institucional SGUEES.</p>
        <p style="margin: 0 0 16px 0;">Por favor verifique la información ingresando a los portales oficiales de la universidad.</p>
        <p style="margin: 0 0 4px 0;">Atentamente,</p>
        <p style="margin: 0; font-weight: 600; color: #034ea2;">Dirección de Talento Humano / Gestión Institucional</p>
      </td>
    </tr>
  </tbody>
</table>`;

		const pieHtml = `<table class="plantilla-uees-table plantilla-uees-pie" style="width: 100%; max-width: 650px; background-color: #034ea2; color: #ffffff; border-collapse: collapse; margin: 0 auto; border: none;" data-tipo="pie">
  <tbody>
    <tr>
      <td style="padding: 16px 24px; text-align: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px; line-height: 1.5; color: #ffffff; border: none;">
        <p style="margin: 0 0 4px 0; font-weight: 600; color: #ffffff;">Universidad Evangélica de El Salvador - UEES</p>
        <p style="margin: 0 0 4px 0; color: #ffffff;">Prolongación Alameda Juan Pablo II, Calle El Carmen, San Salvador, El Salvador</p>
        <p style="margin: 0; color: #ffffff;">Tel: (503) 2275-4000 | Web: <a href="https://www.uees.edu.sv" target="_blank" style="color: #60a5fa; text-decoration: underline;">www.uees.edu.sv</a></p>
      </td>
    </tr>
  </tbody>
</table>`;

		return `${encabezadoHtml}<p><br></p>${cuerpoHtml}<p><br></p>${pieHtml}`;
	}
}
