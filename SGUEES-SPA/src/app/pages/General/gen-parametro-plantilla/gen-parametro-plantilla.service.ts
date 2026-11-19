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
		// Qué hace: almacena la cadena Base64 del logo institucional oficial de la UEES.
	// Cómo lo hace: constante privada con la imagen PNG oficial provista (437x356 px) para incrustar en formato Data URI sin dependencias de red.
	private readonly logoInstitucionalBase64 =
		'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';
	
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


