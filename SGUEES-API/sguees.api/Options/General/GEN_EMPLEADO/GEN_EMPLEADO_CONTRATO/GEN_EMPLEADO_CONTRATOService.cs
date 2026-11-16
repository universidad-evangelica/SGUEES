// Qué hace: implementa la lógica de negocio para generar, editar, emitir, finalizar, anular y adjuntar documentos de contratos por empleado.
// Cómo lo hace: interpola plantillas activas con datos reales del empleado/puesto/empresa/rector y guarda copias HTML fijas en GEN_EMPLEADO_CONTRATO.
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Http;
using sguees.api.Options.General.GEN_EMPLEADO.GEN_EMPLEADO_CONTRATO;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_EMPLEADO_CONTRATOService : IGEN_EMPLEADO_CONTRATOService
	{
		private static readonly CultureInfo EsSvCulture = new("es-SV");
		private static readonly Regex PlaceholderRegex = new(@"\{\{\s*([A-Z0-9_]+)\s*\}\}", RegexOptions.IgnoreCase | RegexOptions.Compiled);

		private readonly IGEN_EMPLEADO_CONTRATORepository _repo;

		public GEN_EMPLEADO_CONTRATOService(IGEN_EMPLEADO_CONTRATORepository repo)
		{
			_repo = repo;
		}

		// Qué hace: lista los contratos del empleado seleccionado.
		// Cómo lo hace: delega a GetAllAsync validando CORR_EMPLEADO > 0.
		public Task<CResult> GetAllAsync(GEN_EMPLEADO_CONTRATOParam xWhere)
		{
			if (xWhere == null || xWhere.CORR_EMPLEADO <= 0)
			{
				return Task.FromResult(BuildError(-1, "Debe seleccionar un empleado válido."));
			}

			return _repo.GetAllAsync(xWhere.CORR_EMPRESA, xWhere.CORR_EMPLEADO);
		}

		// Qué hace: obtiene el detalle completo de un contrato incluyendo su HTML congelado.
		// Cómo lo hace: valida parámetros y delega en el repositorio.
		public Task<CResult> GetAsync(GEN_EMPLEADO_CONTRATOParam xWhere)
		{
			if (xWhere == null || xWhere.CORR_EMPLEADO_CONTRATO <= 0)
			{
				return Task.FromResult(BuildError(-1, "Debe seleccionar un contrato válido."));
			}

			return _repo.GetAsync(xWhere.CORR_EMPRESA, xWhere.CORR_EMPLEADO_CONTRATO);
		}

		// Qué hace: lista plantillas de contrato que poseen versión activa disponible.
		// Cómo lo hace: delega a GetPlantillasActivasAsync con CORR_EMPRESA del token.
		public Task<CResult> GetPlantillasActivasAsync(int corrEmpresa)
		{
			return _repo.GetPlantillasActivasAsync(corrEmpresa);
		}

		// Qué hace: genera la vista previa HTML del contrato sin persistirlo en la base de datos.
		// Cómo lo hace: consulta el contexto actual del empleado/puesto e interpola la plantilla seleccionada.
		public async Task<CResult> PreviewAsync(GEN_EMPLEADO_CONTRATOAccionParam Data)
		{
			if (Data == null || Data.CORR_EMPLEADO <= 0 || Data.CORR_PLANTILLA_CONTRATO_VERSION <= 0)
			{
				return BuildError(-1, "Debe seleccionar empleado y plantilla con versión activa.");
			}

			var ctx = await _repo.GetContextoGeneracionAsync(
				Data.CORR_EMPRESA,
				Data.CORR_EMPLEADO,
				Data.CORR_PLANTILLA_CONTRATO_VERSION,
				Data.CORR_UNIDAD,
				Data.CORR_PUESTO,
				corrMovimiento: null);

			var errorCtx = ValidarContextoGeneracion(ctx);
			if (errorCtx != null)
			{
				return errorCtx;
			}

			var cuerpo = InterpolarContrato(ctx, Data, resaltarParametros: true);
			var faltantes = ObtenerParametrosFaltantes(ctx, Data);
			return new CResult
			{
				Result = true,
				Data = new { CUERPO_CONTRATO = cuerpo, PARAMETROS_FALTANTES = faltantes },
				RowsAffected = 1,
			};
		}

		// Qué hace: crea un contrato en estado BORRADOR interpolando los datos actuales del empleado y puesto.
		// Cómo lo hace: valida fechas/plantilla, obtiene ContratoContextoData, reemplaza {{PARAMETROS}} y persiste copia fija inicial.
		public async Task<CResult> AsignarBorradorAsync(GEN_EMPLEADO_CONTRATOAccionParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var validacion = ValidarDatosContrato(Data);
			if (validacion != null)
			{
				return validacion;
			}

			var ctx = await _repo.GetContextoGeneracionAsync(
				Data.CORR_EMPRESA,
				Data.CORR_EMPLEADO,
				Data.CORR_PLANTILLA_CONTRATO_VERSION,
				Data.CORR_UNIDAD,
				Data.CORR_PUESTO,
				corrMovimiento: null);

			var errorCtx = ValidarContextoGeneracion(ctx);
			if (errorCtx != null)
			{
				return errorCtx;
			}

			// Qué hace: impide crear un segundo contrato activo para el mismo puesto.
			// Cómo lo hace: si CORR_PUESTO tiene valor, consulta al repo si ya hay un BORRADOR o VIGENTE y retorna error.
			if (Data.CORR_PUESTO.HasValue && Data.CORR_PUESTO.Value > 0)
			{
				var existe = await _repo.ExisteContratoActivoParaPuestoAsync(
					Data.CORR_EMPRESA, Data.CORR_EMPLEADO, Data.CORR_PUESTO.Value);
				if (existe)
				{
					return BuildError(-4, "Ya existe un contrato BORRADOR o VIGENTE para este empleado en el puesto seleccionado. Finalice o anule el contrato existente antes de crear uno nuevo.");
				}
			}

			var usarManual = !Data.REGENERAR_CONTENIDO && !string.IsNullOrWhiteSpace(Data.CUERPO_CONTRATO);
			var faltantes = usarManual
				? ObtenerMarcadoresSinReemplazar(Data.CUERPO_CONTRATO)
				: ObtenerParametrosFaltantes(ctx, Data);
			if (faltantes.Count > 0)
			{
				return BuildError(-3, "No todos los parámetros del contrato tienen datos. Complete la información faltante antes de guardar.");
			}

			var cuerpoFinal = usarManual
				? Data.CUERPO_CONTRATO
				: InterpolarContrato(ctx, Data);

			var now = DateTime.Now;
			var table = new GEN_EMPLEADO_CONTRATOTable
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_EMPLEADO = Data.CORR_EMPLEADO,
				CORR_UNIDAD = Data.CORR_UNIDAD.HasValue && Data.CORR_UNIDAD > 0 ? Data.CORR_UNIDAD : null,
				CORR_PUESTO = Data.CORR_PUESTO.HasValue && Data.CORR_PUESTO > 0 ? Data.CORR_PUESTO : null,
				CORR_PLANTILLA_CONTRATO_VERSION = Data.CORR_PLANTILLA_CONTRATO_VERSION,
				CUERPO_CONTRATO = cuerpoFinal,
				FECHA_INICIO = Data.FECHA_INICIO.Date,
				FECHA_FIN = Data.FECHA_FIN?.Date,
				FECHA_FIRMA = Data.FECHA_FIRMA?.Date,
				ESTADO_CONTRATO = 1,
				USUARIO_CREA = vLOGIN_SISTEMA,
				ESTACION_CREA = vESTACION,
				FECHA_CREA = now,
				USUARIO_ACTU = vLOGIN_SISTEMA,
				ESTACION_ACTU = vESTACION,
				FECHA_ACTU = now,
			};

			return await _repo.CreateBorradorAsync(table);
		}

		// Qué hace: actualiza un contrato BORRADOR, permitiendo regenerar su HTML o conservar el texto editado.
		// Cómo lo hace: verifica estado BORRADOR en BD, re-interpola si REGENERAR_CONTENIDO=true y persiste cambios.
		public async Task<CResult> ActualizarBorradorAsync(GEN_EMPLEADO_CONTRATOAccionParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_EMPLEADO_CONTRATO <= 0)
			{
				return BuildError(-1, "Debe seleccionar el contrato a actualizar.");
			}

			var validacion = ValidarDatosContrato(Data);
			if (validacion != null)
			{
				return validacion;
			}

			var actualRes = await _repo.GetAsync(Data.CORR_EMPRESA, Data.CORR_EMPLEADO_CONTRATO);
			if (!actualRes.Result || actualRes.Data is not GEN_EMPLEADO_CONTRATOView actual)
			{
				return actualRes;
			}

			if (actual.ESTADO_CONTRATO != 1)
			{
				return BuildError(-2, "Solo los contratos en estado BORRADOR pueden modificarse.");
			}

			string cuerpoFinal;
			if (Data.REGENERAR_CONTENIDO || string.IsNullOrWhiteSpace(Data.CUERPO_CONTRATO))
			{
				var ctx = await _repo.GetContextoGeneracionAsync(
					Data.CORR_EMPRESA,
					actual.CORR_EMPLEADO,
					Data.CORR_PLANTILLA_CONTRATO_VERSION,
					Data.CORR_UNIDAD,
					Data.CORR_PUESTO,
					corrMovimiento: null);

				var errorCtx = ValidarContextoGeneracion(ctx);
				if (errorCtx != null)
				{
					return errorCtx;
				}

				var faltantes = ObtenerParametrosFaltantes(ctx, Data);
				if (faltantes.Count > 0)
				{
					return BuildError(-3, "No todos los parámetros del contrato tienen datos. Complete la información faltante antes de guardar.");
				}

				cuerpoFinal = InterpolarContrato(ctx, Data);
			}
			else
			{
				var faltantesManual = ObtenerMarcadoresSinReemplazar(Data.CUERPO_CONTRATO);
				if (faltantesManual.Count > 0)
				{
					return BuildError(-3, "El borrador aún contiene parámetros sin datos. Complete la información faltante antes de guardar.");
				}

				cuerpoFinal = Data.CUERPO_CONTRATO;
			}

			var table = new GEN_EMPLEADO_CONTRATOTable
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_EMPLEADO_CONTRATO = Data.CORR_EMPLEADO_CONTRATO,
				CORR_EMPLEADO = actual.CORR_EMPLEADO,
				CORR_UNIDAD = Data.CORR_UNIDAD.HasValue && Data.CORR_UNIDAD > 0 ? Data.CORR_UNIDAD : null,
				CORR_PUESTO = Data.CORR_PUESTO.HasValue && Data.CORR_PUESTO > 0 ? Data.CORR_PUESTO : null,
				CORR_PLANTILLA_CONTRATO_VERSION = Data.CORR_PLANTILLA_CONTRATO_VERSION,
				CUERPO_CONTRATO = cuerpoFinal,
				FECHA_INICIO = Data.FECHA_INICIO.Date,
				FECHA_FIN = Data.FECHA_FIN?.Date,
				FECHA_FIRMA = Data.FECHA_FIRMA?.Date,
				USUARIO_ACTU = vLOGIN_SISTEMA,
				ESTACION_ACTU = vESTACION,
				FECHA_ACTU = DateTime.Now,
			};

			return await _repo.UpdateBorradorAsync(table);
		}

		// Qué hace: emite un contrato en estado BORRADOR pasando a VIGENTE (inmutable).
		// Cómo lo hace: valida documento firmado obligatorio y delega transición BORRADOR -> VIGENTE al repositorio transaccional.
		public async Task<CResult> EmitirAsync(GEN_EMPLEADO_CONTRATOAccionParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_EMPLEADO_CONTRATO <= 0)
			{
				return BuildError(-1, "Debe seleccionar el contrato a emitir.");
			}

			var actualRes = await _repo.GetAsync(Data.CORR_EMPRESA, Data.CORR_EMPLEADO_CONTRATO);
			if (!actualRes.Result || actualRes.Data is not GEN_EMPLEADO_CONTRATOView actual)
			{
				return actualRes;
			}

			if (!actual.TIENE_ARCHIVO_FIRMADO || string.IsNullOrWhiteSpace(actual.RUTA_ARCHIVO))
			{
				return BuildError(-2, "Debe adjuntar el documento firmado antes de emitir el contrato.");
			}

			return await _repo.CambiarEstadoAsync(
				Data.CORR_EMPRESA,
				Data.CORR_EMPLEADO_CONTRATO,
				estadoDestino: 2,
				estadoRequerido: 1,
				motivoAnulacion: null,
				login: vLOGIN_SISTEMA,
				estacion: vESTACION);
		}

		// Qué hace: marca un contrato VIGENTE como FINALIZADO al concluir su período.
		// Cómo lo hace: delega transición VIGENTE -> FINALIZADO al repositorio transaccional.
		public Task<CResult> FinalizarAsync(GEN_EMPLEADO_CONTRATOAccionParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_EMPLEADO_CONTRATO <= 0)
			{
				return Task.FromResult(BuildError(-1, "Debe seleccionar el contrato a finalizar."));
			}

			return _repo.CambiarEstadoAsync(
				Data.CORR_EMPRESA,
				Data.CORR_EMPLEADO_CONTRATO,
				estadoDestino: 3,
				estadoRequerido: 2,
				motivoAnulacion: null,
				login: vLOGIN_SISTEMA,
				estacion: vESTACION);
		}

		// Qué hace: anula un contrato BORRADOR o VIGENTE exigiendo motivo de anulación.
		// Cómo lo hace: valida MOTIVO_ANULACION obligatorio y delega al repositorio con bloqueo en BD.
		public Task<CResult> AnularAsync(GEN_EMPLEADO_CONTRATOAccionParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_EMPLEADO_CONTRATO <= 0)
			{
				return Task.FromResult(BuildError(-1, "Debe seleccionar el contrato a anular."));
			}

			var motivo = Data.MOTIVO_ANULACION?.Trim();
			if (string.IsNullOrWhiteSpace(motivo))
			{
				return Task.FromResult(BuildError(-2, "Debe ingresar el motivo de anulación del contrato."));
			}

			if (motivo.Length > 500)
			{
				return Task.FromResult(BuildError(-3, "El motivo de anulación no puede exceder 500 caracteres."));
			}

			return _repo.CambiarEstadoAsync(
				Data.CORR_EMPRESA,
				Data.CORR_EMPLEADO_CONTRATO,
				estadoDestino: 4,
				estadoRequerido: null,
				motivoAnulacion: motivo,
				login: vLOGIN_SISTEMA,
				estacion: vESTACION);
		}

		// Qué hace: sube o reemplaza el archivo PDF/imagen firmado vinculado al contrato.
		// Cómo lo hace: valida que el contrato exista y se encuentre en estado BORRADOR (no VIGENTE, FINALIZADO ni ANULADO), guarda archivo en storage y actualiza metadata en BD.
		public async Task<CResult> SubirDocumentoFirmadoAsync(
			int corrEmpresa,
			int corrEmpleadoContrato,
			IFormFile archivo,
			EmpleadoContratoStorage storage,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			if (corrEmpleadoContrato <= 0)
			{
				return BuildError(-1, "Debe seleccionar el contrato al que adjuntará el documento firmado.");
			}

			var actualRes = await _repo.GetAsync(corrEmpresa, corrEmpleadoContrato);
			if (!actualRes.Result || actualRes.Data is not GEN_EMPLEADO_CONTRATOView actual)
			{
				return actualRes;
			}

			if (actual.ESTADO_CONTRATO != 1)
			{
				return BuildError(-2, $"No se puede adjuntar un documento firmado a un contrato en estado {actual.NOMBRE_ESTADO_CONTRATO}. Solo se permite en estado BORRADOR.");
			}

			var saved = await storage.SaveAsync(corrEmpresa, actual.CORR_EMPLEADO, corrEmpleadoContrato, archivo);
			if (!saved.Ok)
			{
				return BuildError(-3, saved.Error);
			}

			var rutaAnterior = actual.RUTA_ARCHIVO;
			var dbRes = await _repo.ActualizarArchivoFirmadoAsync(
				corrEmpresa,
				corrEmpleadoContrato,
				saved.FileName,
				saved.RelativePath,
				vLOGIN_SISTEMA,
				vESTACION);

			if (!dbRes.Result)
			{
				storage.DeleteByRelativePath(saved.RelativePath);
				return dbRes;
			}

			if (!string.IsNullOrWhiteSpace(rutaAnterior)
				&& !string.Equals(rutaAnterior, saved.RelativePath, StringComparison.OrdinalIgnoreCase))
			{
				storage.DeleteByRelativePath(rutaAnterior);
			}

			return dbRes;
		}

		// Qué hace: abre un FileStream de solo lectura para visualizar/descargar el documento firmado del contrato.
		// Cómo lo hace: consulta el registro por llave, resuelve la ruta segura en disco y retorna Stream + nombre original.
		public async Task<(Stream Stream, string FileName)> GetDocumentoFirmadoAsync(
			GEN_EMPLEADO_CONTRATOParam xWhere,
			EmpleadoContratoStorage storage)
		{
			if (xWhere == null || xWhere.CORR_EMPLEADO_CONTRATO <= 0)
			{
				return (null, null);
			}

			var res = await _repo.GetAsync(xWhere.CORR_EMPRESA, xWhere.CORR_EMPLEADO_CONTRATO);
			if (!res.Result || res.Data is not GEN_EMPLEADO_CONTRATOView contrato)
			{
				return (null, null);
			}

			if (string.IsNullOrWhiteSpace(contrato.RUTA_ARCHIVO)
				|| !storage.TryResolvePhysicalPath(contrato.RUTA_ARCHIVO, out var physicalPath))
			{
				return (null, null);
			}

			var stream = new FileStream(physicalPath, FileMode.Open, FileAccess.Read, FileShare.Read);
			var fileName = string.IsNullOrWhiteSpace(contrato.NOMBRE_ARCHIVO)
				? Path.GetFileName(physicalPath)
				: contrato.NOMBRE_ARCHIVO;
			return (stream, fileName);
		}

		// Qué hace: elimina un contrato BORRADOR y limpia cualquier archivo previo asociado en disco.
		// Cómo lo hace: consulta ruta actual, borra en BD validando estado BORRADOR y elimina archivo físico si aplica.
		public async Task<CResult> DeleteBorradorAsync(GEN_EMPLEADO_CONTRATOParam Data, EmpleadoContratoStorage storage)
		{
			if (Data == null || Data.CORR_EMPLEADO_CONTRATO <= 0)
			{
				return BuildError(-1, "Debe seleccionar el contrato a eliminar.");
			}

			var actualRes = await _repo.GetAsync(Data.CORR_EMPRESA, Data.CORR_EMPLEADO_CONTRATO);
			string rutaAnterior = null;
			if (actualRes.Result && actualRes.Data is GEN_EMPLEADO_CONTRATOView actual)
			{
				rutaAnterior = actual.RUTA_ARCHIVO;
			}

			var delRes = await _repo.DeleteBorradorAsync(Data.CORR_EMPRESA, Data.CORR_EMPLEADO_CONTRATO);
			if (delRes.Result && !string.IsNullOrWhiteSpace(rutaAnterior))
			{
				storage?.DeleteByRelativePath(rutaAnterior);
			}

			return delRes;
		}

		private static CResult ValidarDatosContrato(GEN_EMPLEADO_CONTRATOAccionParam data)
		{
			if (data == null)
			{
				return BuildError(-1, "Debe enviar los datos del contrato.");
			}

			if (data.CORR_EMPLEADO <= 0)
			{
				return BuildError(-1, "Debe seleccionar un empleado válido.");
			}

			if (data.CORR_PLANTILLA_CONTRATO_VERSION <= 0)
			{
				return BuildError(-1, "Debe seleccionar una plantilla de contrato con versión activa.");
			}

			if (data.FECHA_INICIO == default)
			{
				return BuildError(-1, "Debe indicar la fecha de inicio del contrato.");
			}

			if (data.FECHA_FIN.HasValue && data.FECHA_FIN.Value.Date < data.FECHA_INICIO.Date)
			{
				return BuildError(-1, "La fecha de finalización no puede ser menor que la fecha de inicio.");
			}

			return null;
		}

		private static CResult ValidarContextoGeneracion(ContratoContextoData ctx)
		{
			if (ctx == null || !ctx.PlantillaEncontrada)
			{
				return BuildError(-2, "La versión de plantilla seleccionada no existe o no pertenece a la empresa actual.");
			}

			if (!ctx.EmpleadoEncontrado)
			{
				return BuildError(-2, "No se encontró el empleado seleccionado en la empresa actual.");
			}

			if (string.IsNullOrWhiteSpace(ctx.CuerpoPlantilla))
			{
				return BuildError(-2, "La plantilla seleccionada no tiene contenido HTML configurado.");
			}

			return null;
		}

		// Qué hace: reemplaza todos los marcadores {{PARAMETRO}} de la plantilla con los valores reales formateados.
		// Cómo lo hace: construye un diccionario insensible a mayúsculas, codifica HTML y opcionalmente envuelve los valores para resaltarlos en vista previa.
		private static string InterpolarContrato(
			ContratoContextoData ctx,
			GEN_EMPLEADO_CONTRATOAccionParam form,
			bool resaltarParametros = false)
		{
			var valores = ConstruirMapaParametros(ctx, form);
			return PlaceholderRegex.Replace(ctx.CuerpoPlantilla, match =>
			{
				var key = match.Groups[1].Value;
				var keySafe = WebUtility.HtmlEncode(key.ToUpperInvariant());
				if (!valores.TryGetValue(key, out var rawValue))
				{
					if (!resaltarParametros)
					{
						return match.Value;
					}

					return $"<span class=\"contrato-param-missing\" data-param=\"{keySafe}\" title=\"Parámetro sin fuente configurada: {keySafe}\">{{{{{keySafe}}}}}</span>";
				}

				if (string.IsNullOrWhiteSpace(rawValue))
				{
					if (!resaltarParametros)
					{
						return string.Empty;
					}

					return $"<span class=\"contrato-param-missing\" data-param=\"{keySafe}\" title=\"Dato vacío o nulo en BD para {keySafe}\">{{{{{keySafe}}}}}</span>";
				}

				var encoded = WebUtility.HtmlEncode(rawValue.Trim());
				if (!resaltarParametros)
				{
					return encoded;
				}

				return $"<span class=\"contrato-param-highlight\" data-param=\"{keySafe}\" title=\"{keySafe}\">{encoded}</span>";
			});
		}

		// Qué hace: identifica qué parámetros {{...}} de la plantilla no tienen valor en BD o no están configurados.
		// Cómo lo hace: recorre las coincidencias de PlaceholderRegex y verifica contra ConstruirMapaParametros sin duplicados.
		private static List<string> ObtenerParametrosFaltantes(ContratoContextoData ctx, GEN_EMPLEADO_CONTRATOAccionParam form)
		{
			var valores = ConstruirMapaParametros(ctx, form);
			var faltantes = new List<string>();
			var vistos = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

			foreach (Match match in PlaceholderRegex.Matches(ctx.CuerpoPlantilla ?? string.Empty))
			{
				var key = match.Groups[1].Value.ToUpperInvariant();
				if (!vistos.Add(key))
				{
					continue;
				}

				if (!valores.TryGetValue(key, out var rawValue) || string.IsNullOrWhiteSpace(rawValue))
				{
					faltantes.Add(key);
				}
			}

			return faltantes;
		}

		// Qué hace: detecta marcadores {{...}} sin reemplazar dentro de un borrador editado manualmente.
		// Cómo lo hace: extrae nombres únicos que coinciden con PlaceholderRegex en el HTML recibido.
		private static List<string> ObtenerMarcadoresSinReemplazar(string html)
		{
			var faltantes = new List<string>();
			var vistos = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

			foreach (Match match in PlaceholderRegex.Matches(html ?? string.Empty))
			{
				var key = match.Groups[1].Value.ToUpperInvariant();
				if (vistos.Add(key))
				{
					faltantes.Add(key);
				}
			}

			return faltantes;
		}

		private static Dictionary<string, string> ConstruirMapaParametros(ContratoContextoData ctx, GEN_EMPLEADO_CONTRATOAccionParam form)
		{
			var hoy = DateTime.Now.Date;
			var fechaInicio = form.FECHA_INICIO != default
				? form.FECHA_INICIO.Date
				: (ctx.PuestoFechaIngreso ?? ctx.EmpleadoFechaIngreso ?? hoy);
			var fechaFin = form.FECHA_FIN?.Date ?? ctx.PuestoFechaFin ?? ctx.MovimientoFechaFinalizacion;
			var fechaFirma = form.FECHA_FIRMA?.Date ?? hoy;

			var salario = ctx.SalarioMensual;
			var salarioFormateado = salario.HasValue
				? string.Format(CultureInfo.InvariantCulture, "$ {0:N2}", salario.Value)
				: string.Empty;
			var salarioLetras = salario.HasValue ? ConvertirMontoALetras(salario.Value) : string.Empty;

			var tipoContratacion = FirstNonEmpty(ctx.TipoContratacionPuesto, ctx.NombreTipoContratacionPlantilla);
			var ciudadFirma = FirstNonEmpty(ctx.EmpresaMunicipio, "San Salvador");

			return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
			{
				["EMPRESA_NOMBRE_LARGO"] = FirstNonEmpty(ctx.EmpresaNombreLargo, ctx.EmpresaNombre),
				["EMPRESA_NIT"] = ctx.EmpresaNit ?? string.Empty,
				["EMPRESA_DIRECCION"] = FirstNonEmpty(ctx.EmpresaDireccionLargo, ctx.EmpresaDireccion),
				["SUCURSAL_NOMBRE"] = ctx.SucursalNombre ?? string.Empty,

				["RECTOR_NOMBRE"] = FirstNonEmpty(ctx.RectorNombre, ctx.EmpresaRepresentante),
				["RECTOR_PUESTO"] = ctx.RectorPuesto ?? string.Empty,
				["RECTOR_DUI"] = ctx.RectorDui ?? string.Empty,
				["RECTOR_EDAD"] = ctx.RectorEdad.HasValue ? ctx.RectorEdad.Value.ToString(CultureInfo.InvariantCulture) : string.Empty,
				["RECTOR_PROFESION"] = ctx.RectorProfesion ?? string.Empty,
				["RECTOR_ESTADO_CIVIL"] = ctx.RectorEstadoCivil ?? string.Empty,
				["RECTOR_DOMICILIO"] = ctx.RectorDomicilio ?? string.Empty,

				["CODIGO_EMPLEADO"] = ctx.CodigoEmpleado ?? string.Empty,
				["EMPLEADO_NOMBRE_COMPLETO"] = ctx.EmpleadoNombreCompleto ?? string.Empty,
				["EMPLEADO_DUI"] = ctx.EmpleadoDui ?? string.Empty,
				["EMPLEADO_NIT"] = ctx.EmpleadoNit ?? string.Empty,
				["EMPLEADO_EDAD"] = ctx.EmpleadoEdad.HasValue ? ctx.EmpleadoEdad.Value.ToString(CultureInfo.InvariantCulture) : string.Empty,
				["EMPLEADO_ESTADO_CIVIL"] = ctx.EmpleadoEstadoCivil ?? string.Empty,
				["EMPLEADO_NACIONALIDAD"] = ctx.EmpleadoNacionalidad ?? string.Empty,
				["EMPLEADO_PROFESION"] = ctx.EmpleadoProfesion ?? string.Empty,
				["EMPLEADO_DIRECCION"] = ctx.EmpleadoDireccion ?? string.Empty,
				["EMPLEADO_MUNICIPIO"] = ctx.EmpleadoMunicipio ?? string.Empty,
				["EMPLEADO_DEPTO"] = ctx.EmpleadoDepto ?? string.Empty,
				["EMPLEADO_DISTRITO"] = ctx.EmpleadoDistrito ?? string.Empty,
				["EMPLEADO_CORREO"] = ctx.EmpleadoCorreo ?? string.Empty,
				["EMPLEADO_TELEFONO"] = ctx.EmpleadoTelefono ?? string.Empty,

				["NOMBRE_PUESTO"] = ctx.NombrePuesto ?? string.Empty,
				["MISION_PUESTO"] = ctx.MisionPuesto ?? string.Empty,
				["NOMBRE_UNIDAD"] = ctx.NombreUnidad ?? string.Empty,
				["NOMBRE_UNIDAD_PADRE"] = ctx.NombreUnidadPadre ?? string.Empty,
				["TIPO_CONTRATACION"] = tipoContratacion,
				["MODALIDAD_TRABAJO"] = ctx.ModalidadTrabajo ?? string.Empty,
				["SALARIO_MENSUAL"] = salarioFormateado,
				["SALARIO_EN_LETRAS"] = salarioLetras,
				["HORARIO_LABORAL"] = ctx.HorarioLaboral ?? string.Empty,
				["FECHA_INGRESO"] = FormatearFechaEnLetras(fechaInicio),
				["FECHA_FINALIZACION"] = fechaFin.HasValue ? FormatearFechaEnLetras(fechaFin.Value) : string.Empty,

				["CIUDAD_FIRMA"] = ciudadFirma,
				["FECHA_FIRMA"] = FormatearFechaEnLetras(fechaFirma),
				["FECHA_ACTUAL_LETRAS"] = FormatearFechaEnLetras(hoy),
				["ANIO_ACTUAL"] = hoy.Year.ToString(CultureInfo.InvariantCulture),
			};
		}

		private static string FirstNonEmpty(params string[] values)
		{
			if (values == null)
			{
				return string.Empty;
			}

			foreach (var item in values)
			{
				if (!string.IsNullOrWhiteSpace(item))
				{
					return item.Trim();
				}
			}

			return string.Empty;
		}

		private static string FormatearFechaEnLetras(DateTime fecha)
		{
			var mes = fecha.ToString("MMMM", EsSvCulture);
			return $"{fecha.Day} de {mes} de {fecha.Year}";
		}

		private static string ConvertirMontoALetras(decimal monto)
		{
			var redondeado = Math.Round(monto, 2, MidpointRounding.AwayFromZero);
			var entero = (long)Math.Floor(redondeado);
			var centavos = (int)Math.Round((redondeado - entero) * 100m, 0, MidpointRounding.AwayFromZero);
			if (centavos == 100)
			{
				entero += 1;
				centavos = 0;
			}

			var textoEntero = NumeroEnteroALetras(entero);
			var moneda = entero == 1 ? "DÓLAR" : "DÓLARES";
			return $"{textoEntero} {moneda} CON {centavos:00}/100 DE LOS ESTADOS UNIDOS DE AMÉRICA";
		}

		private static string NumeroEnteroALetras(long numero)
		{
			if (numero == 0)
			{
				return "CERO";
			}

			if (numero < 0)
			{
				return "MENOS " + NumeroEnteroALetras(Math.Abs(numero));
			}

			var sb = new StringBuilder();

			if (numero >= 1_000_000)
			{
				var millones = numero / 1_000_000;
				sb.Append(millones == 1 ? "UN MILLÓN" : $"{NumeroEnteroALetras(millones)} MILLONES");
				numero %= 1_000_000;
				if (numero > 0) sb.Append(' ');
			}

			if (numero >= 1_000)
			{
				var miles = numero / 1_000;
				sb.Append(miles == 1 ? "MIL" : $"{CentenasALetras((int)miles, masculinoApocopado: true)} MIL");
				numero %= 1_000;
				if (numero > 0) sb.Append(' ');
			}

			if (numero > 0)
			{
				sb.Append(CentenasALetras((int)numero, masculinoApocopado: false));
			}

			return sb.ToString().Trim();
		}

		private static string CentenasALetras(int numero, bool masculinoApocopado)
		{
			if (numero == 100)
			{
				return "CIEN";
			}

			string[] centenas = { "", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS" };
			string[] especiales = { "", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE" };
			string[] veintenas = { "VEINTE", "VEINTIUNO", "VEINTIDÓS", "VEINTITRÉS", "VEINTICUATRO", "VEINTICINCO", "VEINTISÉIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE" };
			string[] decenas = { "", "", "", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA" };

			var partes = new List<string>();
			var c = numero / 100;
			var resto = numero % 100;

			if (c > 0)
			{
				partes.Add(centenas[c]);
			}

			if (resto > 0)
			{
				if (resto < 20)
				{
					partes.Add(resto == 1 && masculinoApocopado ? "UN" : especiales[resto]);
				}
				else if (resto < 30)
				{
					partes.Add(resto == 21 && masculinoApocopado ? "VEINTIÚN" : veintenas[resto - 20]);
				}
				else
				{
					var d = resto / 10;
					var u = resto % 10;
					if (u == 0)
					{
						partes.Add(decenas[d]);
					}
					else
					{
						var unidadTxt = (u == 1 && masculinoApocopado) ? "UN" : especiales[u];
						partes.Add($"{decenas[d]} Y {unidadTxt}");
					}
				}
			}

			return string.Join(" ", partes);
		}

		private static CResult BuildError(int errorCode, string message)
		{
			return new CResult
			{
				Result = false,
				ErrorCode = errorCode,
				ErrorMessage = message,
			};
		}
	}
}

