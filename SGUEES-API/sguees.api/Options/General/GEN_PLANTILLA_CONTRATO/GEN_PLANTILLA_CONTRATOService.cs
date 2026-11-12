// Qué hace: lógica de negocio del catálogo plantillas de contrato.
// Cómo lo hace: valida empresa de sesión, campos obligatorios y unicidad de nombre antes de llamar al repositorio.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	// Qué hace: servicio de mantenimiento para GEN_PLANTILLA_CONTRATO.
	// Cómo lo hace: aplica validaciones y delega persistencia en IGEN_PLANTILLA_CONTRATORepository.
	public class GEN_PLANTILLA_CONTRATOService : IGEN_PLANTILLA_CONTRATOService
	{
		private readonly IGEN_PLANTILLA_CONTRATORepository _repo;

		public GEN_PLANTILLA_CONTRATOService(IGEN_PLANTILLA_CONTRATORepository repo)
		{
			_repo = repo;
		}

		// Qué hace: obtiene el listado de plantillas de contrato de la empresa.
		// Cómo lo hace: arma los parámetros con BuildParameters y llama a GetAllAsync del repositorio.
		public async Task<CResult> GetAllAsync(GEN_PLANTILLA_CONTRATOParam xWhere)
		{
			return await _repo.GetAllAsync(BuildParameters(xWhere));
		}

		// Qué hace: obtiene una plantilla de contrato puntual por su clave.
		// Cómo lo hace: arma parámetros de CORR_EMPRESA y CORR_PLANTILLA_CONTRATO y llama a GetAsync.
		public async Task<CResult> GetAsync(GEN_PLANTILLA_CONTRATOParam xWhere)
		{
			return await _repo.GetAsync(BuildPlantillaParameters(xWhere?.CORR_EMPRESA ?? 0, xWhere?.CORR_PLANTILLA_CONTRATO ?? 0));
		}

		// Qué hace: crea una nueva plantilla de contrato.
		// Cómo lo hace: valida empresa y campos, verifica unicidad de nombre, normaliza y llama a CreateAsync.
		public async Task<CResult> CreateAsync(GEN_PLANTILLA_CONTRATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
			if (empresaError != null)
			{
				return empresaError;
			}

			var validation = Validate(Data);
			if (validation != null)
			{
				return validation;
			}

			NormalizeData(Data);

			if (await _repo.ExistsNombreAsync(Data.CORR_EMPRESA, Data.NOMBRE_PLANTILLA, 0))
			{
				return ValidationError("Ya existe una plantilla de contrato con ese nombre.");
			}

			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: actualiza una plantilla de contrato existente.
		// Cómo lo hace: valida empresa, correlativo, campos requeridos y unicidad de nombre, normaliza y llama a UpdateAsync.
		public async Task<CResult> UpdateAsync(GEN_PLANTILLA_CONTRATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
			if (empresaError != null)
			{
				return empresaError;
			}

			var validation = Validate(Data);
			if (validation != null)
			{
				return validation;
			}

			if (Data.CORR_PLANTILLA_CONTRATO <= 0)
			{
				return ValidationError("No se pudo identificar la plantilla de contrato a actualizar.");
			}

			NormalizeData(Data);

			if (await _repo.ExistsNombreAsync(Data.CORR_EMPRESA, Data.NOMBRE_PLANTILLA, Data.CORR_PLANTILLA_CONTRATO))
			{
				return ValidationError("Ya existe otra plantilla de contrato con ese nombre.");
			}

			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: elimina una plantilla de contrato.
		// Cómo lo hace: valida empresa de sesión y correlativo, luego llama a DeleteAsync del repositorio.
		public async Task<CResult> DeleteAsync(GEN_PLANTILLA_CONTRATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
			if (empresaError != null)
			{
				return empresaError;
			}

			if (Data.CORR_PLANTILLA_CONTRATO <= 0)
			{
				return ValidationError("No se pudo identificar la plantilla de contrato a eliminar.");
			}

			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: construye la lista de parámetros de consulta.
		// Cómo lo hace: agrega CORR_EMPRESA desde xWhere.
		private static List<CParameter> BuildParameters(GEN_PLANTILLA_CONTRATOParam xWhere)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};
		}

		// Qué hace: limpia espacios extremos de NOMBRE_PLANTILLA y normaliza cuerpo vacío a null antes de persistir.
		// Cómo lo hace: aplica Trim en nombre y asigna null cuando CUERPO_PLANTILLA está en blanco.
		private static void NormalizeData(GEN_PLANTILLA_CONTRATOTable Data)
		{
			Data.NOMBRE_PLANTILLA = Data.NOMBRE_PLANTILLA?.Trim();
			Data.CUERPO_PLANTILLA = string.IsNullOrWhiteSpace(Data.CUERPO_PLANTILLA) ? null : Data.CUERPO_PLANTILLA;
		}

		// Qué hace: entrega la lista agrupada de parámetros disponibles para plantillas de contratos laborales.
		// Cómo lo hace: agrupa tokens reales basados en GEN_EMPRESA, Organigrama (Rectoría/Unidades), V_GEN_EMPLEADO, V_GEN_PERSONA_*, GEN_EMPLEADO_PUESTO y SC_MOVIMIENTO_PERSONAL.
		public CResult GetParametrosDisponibles()
		{
			var grupos = new List<object>
			{
				new
				{
					categoria = "1. PATRONO Y RECTORÍA",
					items = new[]
					{
						new { key = "EMPRESA_NOMBRE_LARGO", label = "Nombre Empresa", descripcion = "GEN_EMPRESA.NOMBRE_EMPRESA_LARGO" },
						new { key = "EMPRESA_NIT", label = "NIT Patrono", descripcion = "GEN_EMPRESA.NUMERO_NIT" },
						new { key = "EMPRESA_DIRECCION", label = "Dirección Patrono", descripcion = "GEN_EMPRESA.DIRECCION_EMPRESA_LARGO" },
						new { key = "SUCURSAL_NOMBRE", label = "Sede / Sucursal", descripcion = "V_GEN_SUCURSALES.NOMBRE_SUCURSAL" },
						new { key = "RECTOR_NOMBRE", label = "Nombre Rector(a)", descripcion = "Jefe activo unidad Rectoría (Organigrama)" },
						new { key = "RECTOR_PUESTO", label = "Cargo Rector(a)", descripcion = "V_SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES.NOMBRE_PUESTO" },
						new { key = "RECTOR_DUI", label = "DUI Rector(a)", descripcion = "Documento identidad del titular de Rectoría" },
						new { key = "RECTOR_EDAD", label = "Edad Rector(a)", descripcion = "V_GEN_PERSONA_NATURAL.EDAD" },
						new { key = "RECTOR_PROFESION", label = "Profesión Rector(a)", descripcion = "V_GEN_PERSONA_FORMACION_ACADEMICA.TITULO" },
						new { key = "RECTOR_ESTADO_CIVIL", label = "Estado Civil Rector(a)", descripcion = "V_GEN_PERSONA_NATURAL.ESTADO_CIVIL" },
						new { key = "RECTOR_DOMICILIO", label = "Domicilio Rector(a)", descripcion = "V_GEN_PERSONA_DOMICILIO" },
					},
				},
				new
				{
					categoria = "2. DATOS DEL EMPLEADO",
					items = new[]
					{
						new { key = "CODIGO_EMPLEADO", label = "Código Empleado", descripcion = "V_GEN_EMPLEADO.CODIGO_EMPLEADO" },
						new { key = "EMPLEADO_NOMBRE_COMPLETO", label = "Nombre Completo", descripcion = "V_GEN_EMPLEADO.NOMBRE_EMPLEADO" },
						new { key = "EMPLEADO_DUI", label = "DUI Empleado", descripcion = "V_GEN_EMPLEADO.DUI" },
						new { key = "EMPLEADO_NIT", label = "NIT Empleado", descripcion = "V_GEN_EMPLEADO.NIT" },
						new { key = "EMPLEADO_EDAD", label = "Edad", descripcion = "V_GEN_PERSONA_NATURAL.EDAD" },
						new { key = "EMPLEADO_ESTADO_CIVIL", label = "Estado Civil", descripcion = "V_GEN_PERSONA_NATURAL.ESTADO_CIVIL" },
						new { key = "EMPLEADO_NACIONALIDAD", label = "Nacionalidad", descripcion = "V_GEN_PERSONA_NATURAL.NACIONALIDAD" },
						new { key = "EMPLEADO_PROFESION", label = "Profesión / Título", descripcion = "V_GEN_PERSONA_FORMACION_ACADEMICA.TITULO" },
						new { key = "EMPLEADO_DIRECCION", label = "Dirección Residencia", descripcion = "V_GEN_PERSONA_DOMICILIO.DIRECCION" },
						new { key = "EMPLEADO_MUNICIPIO", label = "Municipio", descripcion = "V_GEN_PERSONA_DOMICILIO.NOMBRE_MUNICIPIO" },
						new { key = "EMPLEADO_DEPTO", label = "Departamento", descripcion = "V_GEN_PERSONA_DOMICILIO.NOMBRE_DEPTO" },
						new { key = "EMPLEADO_CORREO", label = "Correo Institucional", descripcion = "V_GEN_EMPLEADO.CORREO_INSTITUCIONAL" },
						new { key = "EMPLEADO_TELEFONO", label = "Teléfono", descripcion = "V_GEN_EMPLEADO.TELEFONO_1" },
					},
				},
				new
				{
					categoria = "3. CARGO, MOVIMIENTO Y SALARIO",
					items = new[]
					{
						new { key = "NOMBRE_PUESTO", label = "Puesto Laboral", descripcion = "PLA_PUESTO.NOMBRE_PUESTO" },
						new { key = "MISION_PUESTO", label = "Misión del Puesto", descripcion = "PLA_PUESTO.MISION_PUESTO" },
						new { key = "NOMBRE_UNIDAD", label = "Unidad / Área", descripcion = "V_SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES.NOMBRE_UNIDAD" },
						new { key = "NOMBRE_UNIDAD_PADRE", label = "Unidad Superior", descripcion = "V_SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES.NOMBRE_UNIDAD_PADRE" },
						new { key = "TIPO_CONTRATACION", label = "Tipo de Contratación", descripcion = "SC_TIPO_CONTRATACION.NOMBRE_TIPO_CONTRATACION" },
						new { key = "MODALIDAD_TRABAJO", label = "Modalidad", descripcion = "SC_TIPO_MODALIDAD.MODALIDAD_NOMBRE" },
						new { key = "SALARIO_MENSUAL", label = "Salario Mensual", descripcion = "GEN_EMPLEADO_PUESTO.SUELDO" },
						new { key = "SALARIO_EN_LETRAS", label = "Salario en Letras", descripcion = "Monto mensual expresado en texto" },
						new { key = "HORARIO_LABORAL", label = "Horario Laboral", descripcion = "GEN_EMPLEADO_PUESTO.HORARIO_LABORAL" },
						new { key = "FECHA_INGRESO", label = "Fecha de Ingreso", descripcion = "GEN_EMPLEADO_PUESTO.FECHA_INGRESO" },
						new { key = "FECHA_FINALIZACION", label = "Fecha Finalización", descripcion = "SC_MOVIMIENTO_PERSONAL.FECHA_FINALIZACION" },
					},
				},
				new
				{
					categoria = "4. DOCUMENTO Y FECHAS",
					items = new[]
					{
						new { key = "CIUDAD_FIRMA", label = "Ciudad de Firma", descripcion = "Municipio de sede o patrono" },
						new { key = "FECHA_FIRMA", label = "Fecha de Firma", descripcion = "Fecha de emisión del contrato" },
						new { key = "FECHA_ACTUAL_LETRAS", label = "Fecha Actual en Letras", descripcion = "Fecha redactada para comparecencia" },
						new { key = "ANIO_ACTUAL", label = "Año Actual", descripcion = "Año calendario vigente" },
					},
				},
			};

			return new CResult
			{
				Data = grupos,
				Result = true,
				CodeHelper = 0,
				ErrorCode = 0,
				ErrorMessage = "",
				ErrorSource = "",
				RowsAffected = grupos.Count,
			};
		}

		// Qué hace: lista todas las versiones registradas para una plantilla de contrato.
		// Cómo lo hace: valida empresa y correlativo de plantilla y consulta GetVersionesAsync del repositorio.
		public async Task<CResult> GetVersionesAsync(GEN_PLANTILLA_CONTRATOParam xWhere)
		{
			var empresaError = ValidateEmpresaSesion(xWhere?.CORR_EMPRESA ?? 0);
			if (empresaError != null)
			{
				return empresaError;
			}

			if ((xWhere?.CORR_PLANTILLA_CONTRATO ?? 0) <= 0)
			{
				return ValidationError("Debe especificar la plantilla de contrato.");
			}

			return await _repo.GetVersionesAsync(BuildPlantillaParameters(xWhere.CORR_EMPRESA, xWhere.CORR_PLANTILLA_CONTRATO));
		}

		// Qué hace: valida y crea una nueva versión v2+ siempre vinculada a v1 como versión padre.
		// Cómo lo hace: exige empresa, plantilla válida, contenido HTML real y observación de hasta 500 caracteres antes de delegar en CrearVersionAsync.
		public async Task<CResult> CrearVersionAsync(GEN_PLANTILLA_CONTRATO_VERSIONParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
			if (empresaError != null)
			{
				return empresaError;
			}

			if (Data == null || Data.CORR_PLANTILLA_CONTRATO <= 0)
			{
				return ValidationError("Debe especificar una plantilla de contrato válida.");
			}

			if (EsContenidoHtmlVacio(Data.CUERPO_PLANTILLA))
			{
				return ValidationError("El contenido de la nueva versión no puede estar vacío.");
			}

			Data.OBSERVACION = string.IsNullOrWhiteSpace(Data.OBSERVACION) ? null : Data.OBSERVACION.Trim();
			if (Data.OBSERVACION != null && Data.OBSERVACION.Length > 500)
			{
				return ValidationError("La observación no puede superar 500 caracteres.");
			}

			var cuerpoBaseV1 = await _repo.GetCuerpoVersionBaseAsync(Data.CORR_EMPRESA, Data.CORR_PLANTILLA_CONTRATO);
			if (cuerpoBaseV1 == null)
			{
				return ValidationError("Debe existir primero la Versión 1 antes de crear una nueva versión.");
			}

			var detalleBitacora = ConstruirDetalleCambioVersion(cuerpoBaseV1, Data.CUERPO_PLANTILLA, Data.OBSERVACION);
			return await _repo.CrearVersionAsync(Data, detalleBitacora, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: valida y actualiza el contenido HTML de una versión v2+ activa.
		// Cómo lo hace: verifica empresa, correlativos y HTML no vacío, compara contra el cuerpo previo para bitácora y delega en ActualizarVersionAsync.
		public async Task<CResult> ActualizarVersionAsync(GEN_PLANTILLA_CONTRATO_VERSIONParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
			if (empresaError != null)
			{
				return empresaError;
			}

			if (Data == null || Data.CORR_PLANTILLA_CONTRATO <= 0 || Data.CORR_PLANTILLA_CONTRATO_VERSION <= 0)
			{
				return ValidationError("Debe seleccionar la versión de contrato que desea actualizar.");
			}

			if (EsContenidoHtmlVacio(Data.CUERPO_PLANTILLA))
			{
				return ValidationError("El contenido de la versión activa no puede estar vacío.");
			}

			var cuerpoAnterior = await _repo.GetCuerpoVersionAsync(
				Data.CORR_EMPRESA,
				Data.CORR_PLANTILLA_CONTRATO,
				Data.CORR_PLANTILLA_CONTRATO_VERSION
			);
			var detalleBitacora = ConstruirDetalleCambioVersion(
				cuerpoAnterior ?? string.Empty,
				Data.CUERPO_PLANTILLA,
				null,
				"el contenido anterior"
			);
			return await _repo.ActualizarVersionAsync(Data, detalleBitacora, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: valida y activa una versión histórica elegible (v2+) como vigente.
		// Cómo lo hace: verifica empresa en sesión y correlativos positivos antes de llamar a ActivarVersionAsync.
		public async Task<CResult> ActivarVersionAsync(GEN_PLANTILLA_CONTRATO_VERSIONParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
			if (empresaError != null)
			{
				return empresaError;
			}

			if (Data == null || Data.CORR_PLANTILLA_CONTRATO <= 0 || Data.CORR_PLANTILLA_CONTRATO_VERSION <= 0)
			{
				return ValidationError("Debe seleccionar la versión de contrato que desea activar.");
			}

			return await _repo.ActivarVersionAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: lista la bitácora cronológica de eventos de una plantilla de contrato.
		// Cómo lo hace: valida empresa y correlativo y delega en GetBitacoraAsync del repositorio.
		public async Task<CResult> GetBitacoraAsync(GEN_PLANTILLA_CONTRATOParam xWhere)
		{
			var empresaError = ValidateEmpresaSesion(xWhere?.CORR_EMPRESA ?? 0);
			if (empresaError != null)
			{
				return empresaError;
			}

			if ((xWhere?.CORR_PLANTILLA_CONTRATO ?? 0) <= 0)
			{
				return ValidationError("Debe especificar la plantilla de contrato.");
			}

			return await _repo.GetBitacoraAsync(BuildPlantillaParameters(xWhere.CORR_EMPRESA, xWhere.CORR_PLANTILLA_CONTRATO));
		}

		// Qué hace: construye la lista estándar de parámetros CORR_EMPRESA y CORR_PLANTILLA_CONTRATO.
		// Cómo lo hace: retorna una lista CParameter tipada como Int32 para consultas por llave de plantilla.
		private static List<CParameter> BuildPlantillaParameters(int corrEmpresa, int corrPlantilla)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PLANTILLA_CONTRATO", Value = corrPlantilla, DbType = System.Data.DbType.Int32 },
			};
		}

		// Qué hace: determina si el HTML recibido carece de contenido útil.
		// Cómo lo hace: conserva contenido con tablas o imágenes y, en caso contrario, valida texto visible sin etiquetas ni &nbsp;.
		private static bool EsContenidoHtmlVacio(string html)
		{
			if (string.IsNullOrWhiteSpace(html))
			{
				return true;
			}

			if (Regex.IsMatch(html, @"<\s*(?:table|img)\b", RegexOptions.IgnoreCase))
			{
				return false;
			}

			var texto = Regex.Replace(html, @"<[^>]+>", " ");
			texto = texto.Replace("&nbsp;", " ", StringComparison.OrdinalIgnoreCase).Trim();
			return string.IsNullOrWhiteSpace(texto);
		}

		// Qué hace: genera un detalle conciso con los parámetros cambiados por cláusula o sección sin volcar párrafos completos.
		// Cómo lo hace: segmenta el texto del contrato por cláusulas, compara tokens {{...}} por sección e indica solo el nombre de sección si cambió texto sin parámetros.
		private static string ConstruirDetalleCambioVersion(string htmlBase, string htmlNuevo, string observacion, string etiquetaReferencia = "la Versión 1")
		{
			var seccionesBase = SegmentarPorSecciones(htmlBase);
			var seccionesNuevo = SegmentarPorSecciones(htmlNuevo);
			var ordenSecciones = ObtenerOrdenSecciones(seccionesBase, seccionesNuevo);
			var lineas = new List<string>();

			foreach (var seccion in ordenSecciones)
			{
				seccionesBase.TryGetValue(seccion, out var textoBase);
				seccionesNuevo.TryGetValue(seccion, out var textoNuevo);
				textoBase ??= string.Empty;
				textoNuevo ??= string.Empty;

				var (eliminados, agregados) = CompararParametros(textoBase, textoNuevo);
				if (eliminados.Count > 0)
				{
					lineas.Add($"• Parámetros eliminados: {string.Join(", ", eliminados)} en {seccion}.");
				}

				if (agregados.Count > 0)
				{
					lineas.Add($"• Parámetros agregados: {string.Join(", ", agregados)} en {seccion}.");
				}

				if (eliminados.Count == 0 && agregados.Count == 0 &&
				    !string.Equals(textoBase, textoNuevo, StringComparison.Ordinal))
				{
					if (!seccionesBase.ContainsKey(seccion))
					{
						lineas.Add($"• Sección agregada: {seccion}.");
					}
					else if (!seccionesNuevo.ContainsKey(seccion))
					{
						lineas.Add($"• Sección eliminada: {seccion}.");
					}
					else
					{
						lineas.Add($"• Texto modificado en {seccion}.");
					}
				}
			}

			if (lineas.Count == 0)
			{
				lineas.Add($"• Ajuste menor de formato o espacios respecto a {etiquetaReferencia}.");
			}

			if (!string.IsNullOrWhiteSpace(observacion))
			{
				lineas.Add($"• Observación: {observacion.Trim()}");
			}

			return string.Join(Environment.NewLine, lineas);
		}

		// Qué hace: identifica tokens de parámetros {{...}} agregados o eliminados entre dos bloques de texto o HTML.
		// Cómo lo hace: cuenta frecuencias de cada clave {{KEY}} en ambos bloques y calcula las diferencias por clave.
		private static (List<string> Eliminados, List<string> Agregados) CompararParametros(string textoBase, string textoNuevo)
		{
			var conteoBase = ContarParametros(textoBase);
			var conteoNuevo = ContarParametros(textoNuevo);
			var todasLasClaves = conteoBase.Keys
				.Union(conteoNuevo.Keys, StringComparer.OrdinalIgnoreCase)
				.OrderBy(k => k, StringComparer.OrdinalIgnoreCase);

			var eliminados = new List<string>();
			var agregados = new List<string>();

			foreach (var clave in todasLasClaves)
			{
				conteoBase.TryGetValue(clave, out var cantBase);
				conteoNuevo.TryGetValue(clave, out var cantNuevo);
				if (cantNuevo < cantBase)
				{
					var diff = cantBase - cantNuevo;
					eliminados.Add(diff > 1 ? $"{{{{{clave}}}}} (x{diff})" : $"{{{{{clave}}}}}");
				}
				else if (cantNuevo > cantBase)
				{
					var diff = cantNuevo - cantBase;
					agregados.Add(diff > 1 ? $"{{{{{clave}}}}} (x{diff})" : $"{{{{{clave}}}}}");
				}
			}

			return (eliminados, agregados);
		}

		// Qué hace: cuenta las apariciones de cada token {{PARAMETRO}} dentro de un bloque HTML o texto plano.
		// Cómo lo hace: decodifica HTML, remueve etiquetas y agrupa coincidencias de \{\{([A-Za-z0-9_]+)\}\} sin distinguir mayúsculas.
		private static Dictionary<string, int> ContarParametros(string contenido)
		{
			var conteo = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
			if (string.IsNullOrWhiteSpace(contenido))
			{
				return conteo;
			}

			var texto = WebUtility.HtmlDecode(Regex.Replace(contenido, @"<[^>]+>", " "));
			foreach (Match match in Regex.Matches(texto, @"\{\{\s*([A-Za-z0-9_]+)\s*\}\}"))
			{
				var key = match.Groups[1].Value;
				conteo[key] = conteo.TryGetValue(key, out var actual) ? actual + 1 : 1;
			}

			return conteo;
		}

		// Qué hace: segmenta el contenido del contrato en secciones lógicas (Encabezado, Comparecencia, Cláusulas y Firmas).
		// Cómo lo hace: convierte el HTML a texto continuo y corta en cada marcador de sección aunque compartan un mismo párrafo HTML.
		private static Dictionary<string, string> SegmentarPorSecciones(string html)
		{
			var secciones = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
			var texto = ExtraerTextoContinuoHtml(html);
			if (string.IsNullOrEmpty(texto))
			{
				return secciones;
			}

			var marcadores = DetectarMarcadoresSeccion(texto);
			if (marcadores.Count == 0)
			{
				secciones["el contenido de la plantilla"] = texto;
				return secciones;
			}

			if (marcadores[0].Index > 0)
			{
				var encabezado = texto.Substring(0, marcadores[0].Index).Trim();
				if (!string.IsNullOrEmpty(encabezado))
				{
					secciones["el Encabezado"] = encabezado;
				}
			}

			for (var i = 0; i < marcadores.Count; i++)
			{
				var inicio = marcadores[i].Index;
				var fin = i + 1 < marcadores.Count ? marcadores[i + 1].Index : texto.Length;
				var fragmento = texto.Substring(inicio, fin - inicio).Trim();
				if (string.IsNullOrEmpty(fragmento))
				{
					continue;
				}

				var nombre = marcadores[i].Nombre;
				secciones[nombre] = secciones.TryGetValue(nombre, out var previo)
					? $"{previo} {fragmento}"
					: fragmento;
			}

			return secciones;
		}

		// Qué hace: localiza ordenadamente los inicios de Comparecencia, cada Cláusula y el Bloque de Firmas en el texto plano.
		// Cómo lo hace: busca coincidencia única de NOSOTROS:, todas las cláusulas con ordinales o números y el cierre de firmas.
		private static List<(int Index, string Nombre)> DetectarMarcadoresSeccion(string texto)
		{
			var marcadores = new List<(int Index, string Nombre)>();

			var matchNosotros = Regex.Match(texto, @"\bNOSOTROS\s*:", RegexOptions.IgnoreCase);
			if (matchNosotros.Success)
			{
				marcadores.Add((matchNosotros.Index, "la Comparecencia (NOSOTROS)"));
			}

			const string patronClausula =
				@"\bCL[ÁA]USULA\s+(?:(?:D[ÉE]CIMA|VIG[ÉE]SIMA|TRIG[ÉE]SIMA)(?:\s+(?:PRIMERA|SEGUNDA|TERCERA|CUARTA|QUINTA|SEXTA|S[ÉE]PTIMA|OCTAVA|NOVENA))?|PRIMERA|SEGUNDA|TERCERA|CUARTA|QUINTA|SEXTA|S[ÉE]PTIMA|OCTAVA|NOVENA|DECIMOPRIMERA|DECIMOSEGUNDA|UND[ÉE]CIMA|DUOD[ÉE]CIMA|\d+(?:\s*(?:°|º|a|ª))?)\b";

			foreach (Match match in Regex.Matches(texto, patronClausula, RegexOptions.IgnoreCase))
			{
				marcadores.Add((match.Index, FormatearNombreClausula(match.Value)));
			}

			var matchFirmas = Regex.Match(texto, @"\bEn\s+fe\s+de\s+lo\s+cual\b|\bf\)\s*_{3,}", RegexOptions.IgnoreCase);
			if (matchFirmas.Success)
			{
				marcadores.Add((matchFirmas.Index, "el Bloque de Firmas"));
			}

			return marcadores.OrderBy(m => m.Index).ToList();
		}

		// Qué hace: normaliza el encabezado detectado de una cláusula a formato legible en bitácora.
		// Cómo lo hace: corrige acentos comunes y capitaliza cada término anteponiendo el artículo 'la'.
		private static string FormatearNombreClausula(string rawMatch)
		{
			var normalizaciones = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
			{
				["CLAUSULA"] = "Cláusula",
				["CLÁUSULA"] = "Cláusula",
				["DECIMA"] = "Décima",
				["DÉCIMA"] = "Décima",
				["VIGESIMA"] = "Vigésima",
				["VIGÉSIMA"] = "Vigésima",
				["TRIGESIMA"] = "Trigésima",
				["TRIGÉSIMA"] = "Trigésima",
				["SEPTIMA"] = "Séptima",
				["SÉPTIMA"] = "Séptima",
				["UNDECIMA"] = "Undécima",
				["UNDÉCIMA"] = "Undécima",
				["DUODECIMA"] = "Duodécima",
				["DUODÉCIMA"] = "Duodécima",
			};

			var palabras = Regex.Split(rawMatch.Trim(), @"\s+")
				.Where(p => !string.IsNullOrWhiteSpace(p))
				.Select(p =>
				{
					if (normalizaciones.TryGetValue(p, out var exacta))
					{
						return exacta;
					}
					return p.Length == 1
						? p.ToUpperInvariant()
						: char.ToUpperInvariant(p[0]) + p.Substring(1).ToLowerInvariant();
				});

			return $"la {string.Join(" ", palabras)}";
		}

		// Qué hace: combina en orden lógico las secciones presentes en la versión base y en la versión nueva.
		// Cómo lo hace: conserva primero la secuencia de la versión nueva y agrega cualquier sección eliminada desde la base.
		private static List<string> ObtenerOrdenSecciones(
			Dictionary<string, string> seccionesBase,
			Dictionary<string, string> seccionesNuevo)
		{
			var orden = new List<string>();
			var agregadas = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

			foreach (var key in seccionesNuevo.Keys)
			{
				if (agregadas.Add(key))
				{
					orden.Add(key);
				}
			}

			foreach (var key in seccionesBase.Keys)
			{
				if (agregadas.Add(key))
				{
					orden.Add(key);
				}
			}

			return orden;
		}

		// Qué hace: convierte el HTML de la plantilla en texto plano continuo conservando marcadores de imagen.
		// Cómo lo hace: elimina style/script, sustituye <img> por [Imagen] y etiquetas por espacio, decodifica entidades y colapsa espacios.
		private static string ExtraerTextoContinuoHtml(string html)
		{
			if (string.IsNullOrWhiteSpace(html))
			{
				return string.Empty;
			}

			var limpio = Regex.Replace(html, @"<\s*(style|script)[^>]*>[\s\S]*?<\s*/\s*\1\s*>", " ", RegexOptions.IgnoreCase);
			limpio = Regex.Replace(limpio, @"<\s*img\b[^>]*>", " [Imagen] ", RegexOptions.IgnoreCase);
			limpio = Regex.Replace(limpio, @"<[^>]+>", " ");
			limpio = WebUtility.HtmlDecode(limpio).Replace('\u00A0', ' ');
			return Regex.Replace(limpio, @"\s+", " ").Trim();
		}

		// Qué hace: valida los campos obligatorios del modelo antes de guardar.
		// Cómo lo hace: exige entidad no nula, nombre no vacío (máx 200 caracteres) y CORR_TIPO_CONTRATACION mayor a cero.
		private static CResult Validate(GEN_PLANTILLA_CONTRATOTable Data)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos de la plantilla de contrato.");
			}

			if (string.IsNullOrWhiteSpace(Data.NOMBRE_PLANTILLA))
			{
				return ValidationError("Debe ingresar el nombre de la plantilla.");
			}

			if (Data.NOMBRE_PLANTILLA.Trim().Length > 200)
			{
				return ValidationError("El nombre de la plantilla no puede superar 200 caracteres.");
			}

			if (Data.CORR_TIPO_CONTRATACION <= 0)
			{
				return ValidationError("Debe seleccionar el tipo de contrato.");
			}

			return null;
		}

		// Qué hace: verifica que exista una empresa válida en la sesión del usuario.
		// Cómo lo hace: retorna null si corrEmpresa > 0 o un CResult de error 4100 en caso contrario.
		private static CResult ValidateEmpresaSesion(int corrEmpresa)
		{
			if (corrEmpresa > 0)
			{
				return null;
			}

			return new CResult
			{
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = 4100,
				ErrorMessage = "No se pudo guardar la plantilla de contrato porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
				ErrorSource = "[GEN_PLANTILLA_CONTRATOService]",
				RowsAffected = 0,
			};
		}

		// Qué hace: genera una respuesta estándar de error de validación.
		// Cómo lo hace: devuelve un CResult con Result en false y el mensaje especificado.
		private static CResult ValidationError(string message)
		{
			return new CResult
			{
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = -1,
				ErrorMessage = message,
				ErrorSource = "[GEN_PLANTILLA_CONTRATOService]",
				RowsAffected = 0,
			};
		}
	}
}

