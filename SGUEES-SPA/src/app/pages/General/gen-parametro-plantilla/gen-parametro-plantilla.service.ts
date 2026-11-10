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

@Injectable({ providedIn: 'root' })
export class GenParametroPlantillaService {
	constructor(private repo: GenParametroPlantillaRepository) {}

	// Qué hace: valida las reglas de negocio de la plantilla antes de persistir.
	// Cómo lo hace: comprueba código, nombre, asunto y cuenta SMTP obligatorios, permitiendo módulo, menú y cuerpo opcionales.
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

		// Módulo y Menú/Proceso son opcionales para admitir plantillas genéricas transversales.
		// Si se seleccionó módulo pero no menú, o viceversa, se advierte consistencia opcionalmente.
		if (model.CODIGO_SISTEMA && (!model.CODIGO_OPCION || model.CODIGO_OPCION.trim() === '')) {
			msg('Si selecciona un módulo, debe seleccionar también el menú o proceso específico.', NotifyType.Warning);
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
				calculateCellValue: (rowData: any) => rowData.NOMBRE_SISTEMA || rowData.CODIGO_SISTEMA || '(Genérica / Global)',
			},
			{
				dataField: 'NOMBRE_OPCION',
				caption: 'Menú / Proceso',
				width: 220,
				calculateCellValue: (rowData: any) => rowData.NOMBRE_OPCION || rowData.CODIGO_OPCION || '(Todos los procesos)',
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

	// Qué hace: genera el formato institucional oficial de la UEES idéntico a CRoutines.
	// Cómo lo hace: delega la construcción a obtenerPlantillaUeesPredeterminada.
	obtenerFormatoBaseUEES(): string {
		return this.obtenerPlantillaUeesPredeterminada();
	}

	// Qué hace: genera la estructura HTML institucional predeterminada de la UEES.
	// Cómo lo hace: define bloques separados para encabezado, cuerpo editable y pie institucional para el editor.
	obtenerPlantillaUeesPredeterminada(): string {
		const logoBase64 = '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';

		return `<table class="plantilla-uees-table tabla-encabezado" data-tipo="encabezado" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#063b79" style="width:100%; max-width:680px; border-collapse:collapse; background-color:#063b79; margin:0;">
  <tbody>
    <tr>
      <td class="header" bgcolor="#063b79" style="padding:28px 35px 24px 35px; border-bottom:6px solid #ffcc00; background-color:#063b79;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
          <tr>
            <td width="115" valign="middle" align="center" style="width:115px; vertical-align:middle; text-align:center; padding:0; border:none;">
              <p style="margin:0; text-align:center;">
                <img src="data:image/png;base64,${logoBase64}" alt="Logo UEES" width="95" height="77" style="width:95px; height:auto; max-width:100%; display:block; margin:0 auto; border:none;">
              </p>
            </td>
            <td valign="middle" align="left" style="vertical-align:middle; text-align:left; border:none; border-left:2px solid #ffffff; padding:0 0 0 22px; font-family:Arial, Helvetica, sans-serif;">
              <p style="margin:0 0 3px 0; color:#ffffff; font-size:20px; line-height:26px; font-weight:bold; letter-spacing:0.5px; text-align:left; font-family:Arial, Helvetica, sans-serif;">
                UNIVERSIDAD EVANGÉLICA
              </p>
              <p style="margin:0; color:#ffffff; font-size:20px; line-height:26px; font-weight:bold; letter-spacing:0.5px; text-align:left; font-family:Arial, Helvetica, sans-serif;">
                DE EL SALVADOR
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </tbody>
</table>
<p class="plantilla-spacer"><br></p>
<table class="plantilla-uees-table tabla-cuerpo" data-tipo="cuerpo" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:680px; border-collapse:collapse; background-color:#ffffff; margin:0;">
  <tbody>
    <tr>
      <td class="celda-cuerpo" style="padding:36px 40px; background-color:#ffffff; border:none; color:#102d59; font-family:Arial, Helvetica, sans-serif;">
        <div style="border:1px dashed #cbd5e1; border-radius:8px; padding:20px; text-align:center; background-color:#fafbfc; margin-bottom:24px;">
          <p style="margin:0; font-size:16px; font-weight:bold; color:#063b79; text-align:center; font-family:Arial, Helvetica, sans-serif;">
            TITULO
          </p>
        </div>
        <p style="margin:0 0 14px 0; font-size:16px; font-weight:bold; color:#102d59; text-align:left; font-family:Arial, Helvetica, sans-serif;">Estimado(a),</p>
        <p style="margin:0 0 14px 0; font-size:15px; line-height:24px; color:#334155; text-align:left; font-family:Arial, Helvetica, sans-serif;">Redacte aquí el contenido del correo o inserte los parámetros requeridos.</p>
      </td>
    </tr>
  </tbody>
</table>
<p class="plantilla-spacer"><br></p>
<table class="plantilla-uees-table tabla-pie" data-tipo="pie" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#063b79" style="width:100%; max-width:680px; border-collapse:collapse; background-color:#063b79; margin:0;">
  <tbody>
    <tr>
      <td class="footer-content" bgcolor="#063b79" style="padding:28px 30px 20px; text-align:center; background-color:#063b79; border:none; border-top:5px solid #ffcc00; color:#ffffff; font-family:Arial, Helvetica, sans-serif;">
        <p style="margin:0 0 10px 0; color:#ffffff; font-size:17px; font-weight:bold; text-align:center; font-family:Arial, Helvetica, sans-serif;">
          Universidad Evangélica de El Salvador
        </p>
        <p style="margin:0 0 10px 0; color:#e5edf8; font-size:13px; line-height:19px; text-align:center; font-family:Arial, Helvetica, sans-serif;">
          Prolongación Alameda Juan Pablo II, Calle el Carmen, San Antonio Abad, San Salvador, El Salvador.
        </p>
        <p style="margin:0 0 12px 0; color:#ffffff; font-size:13px; text-align:center; font-family:Arial, Helvetica, sans-serif;">
          <strong>Teléfono:</strong> +503 2275-4000
        </p>
        <p style="margin:0 0 14px 0; font-size:14px; text-align:center; font-family:Arial, Helvetica, sans-serif;">
          <a href="https://www.uees.edu.sv/" target="_blank" style="color:#ffcc00; font-weight:bold; text-decoration:underline; font-family:Arial, Helvetica, sans-serif;">
            www.uees.edu.sv
          </a>
        </p>
        <div style="height:1px; background-color:#255998; margin:14px auto; width:100%;"></div>
        <p style="margin:12px 0 0 0; color:#d5e2f2; font-size:11px; line-height:16px; text-align:center; font-family:Arial, Helvetica, sans-serif;">
          Copyright &copy; Universidad Evangélica de El Salvador. Todos los derechos reservados.<br>
          Este es un mensaje automático. Por favor, no respondas a este correo.
        </p>
      </td>
    </tr>
  </tbody>
</table>`;
	}
}


