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

	// Qué hace: verifica si el cuerpo HTML de la plantilla posee texto visible o imágenes reales.
	// Cómo lo hace: detecta etiquetas img o remueve etiquetas HTML y espacios comprobando si queda texto.
	tieneContenidoHtml(html?: string | null): boolean {
		const contenido = `${html ?? ''}`;
		if (!contenido.trim()) {
			return false;
		}
		if (/<img\b/i.test(contenido)) {
			return true;
		}
		const textoPlano = contenido
			.replace(/<[^>]+>/g, ' ')
			.replace(/&nbsp;/gi, ' ')
			.trim();
		return textoPlano.length > 0;
	}

	// Qué hace: determina el estado visual de la plantilla combinando versiones consolidadas y vigencia.
	// Cómo lo hace: evalúa CANT_VERSIONES (0 implica Borrador) y ACTIVO_PLANTILLA para retornar Activa o Inactiva.
	resolverEstadoPlantilla(rowData: any): 'Borrador' | 'Activa' | 'Inactiva' {
		const cantVersiones = Number(rowData?.CANT_VERSIONES ?? 0);
		if (cantVersiones <= 0 || `${rowData?.ESTADO_PLANTILLA ?? ''}`.trim().toLowerCase() === 'borrador') {
			return 'Borrador';
		}
		return rowData?.ACTIVO_PLANTILLA ? 'Activa' : 'Inactiva';
	}

	// Qué hace: define las columnas del grid de plantillas con anchos fijos numéricos y badge de estado (Borrador/Activa/Inactiva).
	// Cómo lo hace: configura dataField, caption, width numérico, versión activa y estado derivado de versiones reales.
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
			{
				dataField: 'ESTADO_PLANTILLA',
				caption: 'Estado',
				width: 130,
				alignment: 'center',
				dataType: 'string',
				allowFiltering: true,
				allowHeaderFiltering: true,
				calculateCellValue: (rowData: any) => this.resolverEstadoPlantilla(rowData),
				cellTemplate: (cellElement: HTMLElement, cellInfo: { data?: any }) => {
					const estado = this.resolverEstadoPlantilla(cellInfo?.data);
					const clase =
						estado === 'Borrador'
							? 'estado-badge--borrador'
							: estado === 'Activa'
							? 'estado-badge--activo'
							: 'estado-badge--inactivo';
					const badge = document.createElement('span');
					badge.classList.add('estado-badge', clase);
					badge.textContent = estado;
					cellElement.innerHTML = '';
					cellElement.appendChild(badge);
				},
			},
			{
				dataField: 'NUMERO_VERSION_ACTIVA',
				caption: 'Versión',
				width: 150,
				minWidth: 135,
				alignment: 'center',
				calculateCellValue: (rowData: any) =>
					Number(rowData?.CANT_VERSIONES ?? 0) > 0 && rowData?.NUMERO_VERSION_ACTIVA
						? `Versión ${rowData.NUMERO_VERSION_ACTIVA}`
						: 'Sin versión',
			},
			...buildAuditGridColumns({ withDateTimeFilter: true, usuarioWidth: 150, fechaWidth: 170 }),
		];
	}

	// Qué hace: genera el formato institucional oficial de la UEES idéntico a CRoutines.
	// Cómo lo hace: delega la construcción a obtenerPlantillaUeesPredeterminada.
	obtenerFormatoBaseUEES(): string {
		return this.obtenerPlantillaUeesPredeterminada();
	}

	private readonly logoInstitucionalBase64 =
		'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';

	// Qué hace: obtiene el Data URI PNG del logo institucional oficial de la UEES.
	// Cómo lo hace: antepone el prefijo data URL al contenido base64 completo tomado de CRoutines.
	obtenerLogoInstitucionalDataUri(): string {
		return `data:image/png;base64,${this.logoInstitucionalBase64}`;
	}

	// Qué hace: genera la estructura HTML institucional predeterminada de la UEES.
	// Cómo lo hace: define bloques planos separados para encabezado, cuerpo editable y pie institucional compatibles con Quill y correos.
	obtenerPlantillaUeesPredeterminada(): string {
		const logoDataUri = this.obtenerLogoInstitucionalDataUri();

		return `<table class="plantilla-uees-table tabla-encabezado" data-tipo="encabezado" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#063b79" style="width:100%; max-width:680px; border-collapse:collapse; background-color:#063b79; margin:0;">
  <tbody>
    <tr>
      <td class="header" width="145" valign="middle" align="center" bgcolor="#063b79" style="width:145px; padding:24px 16px 20px 28px; vertical-align:middle; text-align:center; background-color:#063b79; border:none; border-bottom:6px solid #ffcc00;">
        <p style="margin:0; text-align:center;">
          <img src="${logoDataUri}" alt="Logo UEES" width="95" height="77" style="width:95px; height:auto; max-width:100%; display:block; margin:0 auto; border:none;">
        </p>
      </td>
      <td class="header" valign="middle" align="left" bgcolor="#063b79" style="padding:24px 28px 20px 22px; vertical-align:middle; text-align:left; background-color:#063b79; border:none; border-left:2px solid #ffffff; border-bottom:6px solid #ffcc00; font-family:Arial, Helvetica, sans-serif;">
        <p style="margin:0 0 3px 0; color:#ffffff; font-size:20px; line-height:26px; font-weight:bold; letter-spacing:0.5px; text-align:left; font-family:Arial, Helvetica, sans-serif;">
          UNIVERSIDAD EVANGÉLICA
        </p>
        <p style="margin:0; color:#ffffff; font-size:20px; line-height:26px; font-weight:bold; letter-spacing:0.5px; text-align:left; font-family:Arial, Helvetica, sans-serif;">
          DE EL SALVADOR
        </p>
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


