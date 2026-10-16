// Qué hace: repositorio de acceso a datos para GEN_PARAMETRO_PLANTILLA y su vista V_GEN_PARAMETRO_PLANTILLA.
// Cómo lo hace: hereda de BaseRepository e implementa métodos asíncronos para CRUD con eFramework.
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_PARAMETRO_PLANTILLARepository : BaseRepository<GEN_PARAMETRO_PLANTILLATable>, IGEN_PARAMETRO_PLANTILLARepository
	{
		private const string _TableName = "GEN_PARAMETRO_PLANTILLA";

		public GEN_PARAMETRO_PLANTILLARepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		// Qué hace: obtiene la lista de plantillas de correo desde la vista.
		// Cómo lo hace: consulta V_GEN_PARAMETRO_PLANTILLA usando parámetros de filtro.
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<GEN_PARAMETRO_PLANTILLAView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: obtiene un registro específico de plantilla de correo.
		// Cómo lo hace: consulta V_GEN_PARAMETRO_PLANTILLA filtrado por clave primaria o código.
		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<GEN_PARAMETRO_PLANTILLAView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: inserta un nuevo registro de plantilla de correo con correlativo automático por empresa.
		// Cómo lo hace: ejecuta objData.Insert devolviendo el registro leíble desde la vista.
		public async Task<CResult> CreateAsync(GEN_PARAMETRO_PLANTILLATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PARAMETRO_PLANTILLA", Value = Data.CORR_PARAMETRO_PLANTILLA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CODIGO_PLANTILLA", Value = Data.CODIGO_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "NOMBRE_PLANTILLA", Value = Data.NOMBRE_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ASUNTO_PLANTILLA", Value = Data.ASUNTO_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CUERPO_PLANTILLA", Value = Data.CUERPO_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORR_PARAMETRO_SMTP", Value = Data.CORR_PARAMETRO_SMTP, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORREO_CC", Value = Data.CORREO_CC, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORREO_CCO", Value = Data.CORREO_CCO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO_SISTEMA", Value = Data.CODIGO_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO_OPCION", Value = Data.CODIGO_OPCION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ACTIVO_PLANTILLA", Value = Data.ACTIVO_PLANTILLA, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = vESTACION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 }
				};

				var reader = await objData.Insert(_TableName, p, "CORR_PARAMETRO_PLANTILLA", pWhere);
				var response = new List<GEN_PARAMETRO_PLANTILLAView>().FromDataReader(reader).FirstOrDefault();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: actualiza una plantilla de correo existente.
		// Cómo lo hace: ejecuta objData.Update filtrando por CORR_EMPRESA y CORR_PARAMETRO_PLANTILLA.
		public async Task<CResult> UpdateAsync(GEN_PARAMETRO_PLANTILLATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CODIGO_PLANTILLA", Value = Data.CODIGO_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "NOMBRE_PLANTILLA", Value = Data.NOMBRE_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ASUNTO_PLANTILLA", Value = Data.ASUNTO_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CUERPO_PLANTILLA", Value = Data.CUERPO_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORR_PARAMETRO_SMTP", Value = Data.CORR_PARAMETRO_SMTP, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORREO_CC", Value = Data.CORREO_CC, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORREO_CCO", Value = Data.CORREO_CCO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO_SISTEMA", Value = Data.CODIGO_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO_OPCION", Value = Data.CODIGO_OPCION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ACTIVO_PLANTILLA", Value = Data.ACTIVO_PLANTILLA, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PARAMETRO_PLANTILLA", Value = Data.CORR_PARAMETRO_PLANTILLA, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<GEN_PARAMETRO_PLANTILLAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				// Qué hace: sincroniza los cambios de la plantilla en su versión activa histórica.
				// Cómo lo hace: ejecuta un update en GEN_PARAMETRO_PLANTILLA_VERSION para la versión con ES_VERSION_ACTIVA = 1.
				var pWhereVersionActiva = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PARAMETRO_PLANTILLA", Value = Data.CORR_PARAMETRO_PLANTILLA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "ES_VERSION_ACTIVA", Value = true, DbType = System.Data.DbType.Boolean },
				};

				var pVersionActiva = new List<CParameter>
				{
					new CParameter() { ParameterName = "ASUNTO_PLANTILLA", Value = Data.ASUNTO_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CUERPO_PLANTILLA", Value = Data.CUERPO_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORREO_CC", Value = Data.CORREO_CC, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORREO_CCO", Value = Data.CORREO_CCO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime },
				};

				var readerVersion = await objData.Update("GEN_PARAMETRO_PLANTILLA_VERSION", pVersionActiva, pWhereVersionActiva);
				readerVersion.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: elimina una plantilla de correo por sus llaves.
		// Cómo lo hace: ejecuta objData.Delete en GEN_PARAMETRO_PLANTILLA.
		public async Task<CResult> DeleteAsync(GEN_PARAMETRO_PLANTILLATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PARAMETRO_PLANTILLA", Value = Data.CORR_PARAMETRO_PLANTILLA, DbType = System.Data.DbType.Int32 },
				};

				await objData.Delete(_TableName, pWhere);

				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: obtiene la lista de módulos / sistemas registrados a los que el usuario tiene acceso.
		// Cómo lo hace: consulta SEG_SISTEMA cruzando con SEG_USUARIO_OPCION filtrado por el LOGIN_SISTEMA en sesión.
		public async Task<CResult> GetModulosAsync(string loginSistema = "")
		{
			CResult objResultado = new();
			try
			{
				string sql;
				var p = new List<CParameter>();

				if (!string.IsNullOrWhiteSpace(loginSistema))
				{
					sql = @"SELECT DISTINCT s.CODIGO_SISTEMA AS [Key], s.NOMBRE_SISTEMA AS [Value] 
							FROM dbo.SEG_SISTEMA s
							JOIN dbo.SEG_USUARIO_OPCION uo ON uo.CODIGO_SISTEMA = s.CODIGO_SISTEMA
							WHERE LTRIM(RTRIM(uo.LOGIN_SISTEMA)) = LTRIM(RTRIM(@LOGIN_SISTEMA))
							ORDER BY s.NOMBRE_SISTEMA";
					p.Add(new CParameter { ParameterName = "LOGIN_SISTEMA", Value = loginSistema.Trim(), DbType = System.Data.DbType.String });
				}
				else
				{
					sql = "SELECT CODIGO_SISTEMA AS [Key], NOMBRE_SISTEMA AS [Value] FROM dbo.SEG_SISTEMA ORDER BY NOMBRE_SISTEMA";
				}

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, p);
				var list = new List<dynamic>();
				while (reader.Read())
				{
					list.Add(new
					{
						Key = reader["Key"].ToString(),
						Value = reader["Value"].ToString()
					});
				}
				reader.Close();
				objResultado.Data = list;
				objResultado.Result = true;
				objResultado.RowsAffected = list.Count;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}
			return objResultado;
		}

		// Qué hace: obtiene las opciones de menú de un módulo a las que el usuario tiene permiso asignado.
		// Cómo lo hace: consulta SEG_CONFIG_OPCION cruzando con SEG_USUARIO_OPCION filtrado por CODIGO_SISTEMA y LOGIN_SISTEMA.
		public async Task<CResult> GetOpcionesPorModuloAsync(string codigoSistema, string loginSistema = "")
		{
			CResult objResultado = new();
			try
			{
				string sql;
				var p = new List<CParameter>
				{
					new CParameter { ParameterName = "CODIGO_SISTEMA", Value = codigoSistema ?? string.Empty, DbType = System.Data.DbType.String }
				};

				if (!string.IsNullOrWhiteSpace(loginSistema))
				{
					sql = @"SELECT DISTINCT c.CODIGO_OPCION AS [Key], o.NOMBRE_OPCION AS [Value] 
							FROM dbo.SEG_CONFIG_OPCION c 
							JOIN dbo.SEG_OPCION_SISTEMA o ON o.CODIGO_OPCION = c.CODIGO_OPCION 
							JOIN dbo.SEG_USUARIO_OPCION uo ON uo.CODIGO_SISTEMA = c.CODIGO_SISTEMA 
														   AND uo.CODIGO_OPCION = c.CODIGO_OPCION
							WHERE c.CODIGO_SISTEMA = @CODIGO_SISTEMA 
							  AND LTRIM(RTRIM(uo.LOGIN_SISTEMA)) = LTRIM(RTRIM(@LOGIN_SISTEMA))
							ORDER BY o.NOMBRE_OPCION";
					p.Add(new CParameter { ParameterName = "LOGIN_SISTEMA", Value = loginSistema.Trim(), DbType = System.Data.DbType.String });
				}
				else
				{
					sql = @"SELECT DISTINCT c.CODIGO_OPCION AS [Key], o.NOMBRE_OPCION AS [Value] 
							FROM dbo.SEG_CONFIG_OPCION c 
							JOIN dbo.SEG_OPCION_SISTEMA o ON o.CODIGO_OPCION = c.CODIGO_OPCION 
							WHERE c.CODIGO_SISTEMA = @CODIGO_SISTEMA 
							ORDER BY o.NOMBRE_OPCION";
				}

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, p);
				var list = new List<dynamic>();
				while (reader.Read())
				{
					list.Add(new
					{
						Key = reader["Key"].ToString(),
						Value = reader["Value"].ToString()
					});
				}
				reader.Close();
				objResultado.Data = list;
				objResultado.Result = true;
				objResultado.RowsAffected = list.Count;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}
			return objResultado;
		}

		// Qué hace: obtiene la lista unificada de parámetros disponibles (institucionales fijos + columnas de BD del proceso + entidades relacionadas + virtuales).
		// Cómo lo hace: consulta las columnas reales de SQL Server para la vista principal y complementarias asociadas al CODIGO_OPCION, escapando comodines y añadiendo variables virtuales del flujo.
		public async Task<CResult> GetParametrosDisponiblesAsync(string codigoOpcion, string codigoSistema)
		{
			CResult objResultado = new();
			try
			{
				var lista = new List<dynamic>
				{
					new { key = "NOMBRE_INSTITUCION", label = "Nombre Institución", descripcion = "Universidad Evangélica de El Salvador", tipo = "TEXTO" },
					new { key = "FECHA_ACTUAL", label = "Fecha Actual", descripcion = "Fecha actual del sistema", tipo = "FECHA" },
					new { key = "ANIO_ACTUAL", label = "Año Actual", descripcion = "Año en curso", tipo = "TEXTO" },
					new { key = "CORREO_CONTACTO", label = "Correo Contacto", descripcion = "Correo general de contacto institucional", tipo = "EMAIL" }
				};

				var keysExistentes = new HashSet<string>(lista.Select(x => (string)x.key), System.StringComparer.OrdinalIgnoreCase);

				if (!string.IsNullOrWhiteSpace(codigoOpcion))
				{
					var candidatos = ObtenerTablasCandidatas(codigoOpcion.Trim());

					foreach (var cand in candidatos)
					{
						var p = new List<CParameter>
						{
							new CParameter { ParameterName = "TABLA", Value = cand, DbType = System.Data.DbType.String }
						};
						var readerTabla = await objData.GetDataReader(System.Data.CommandType.Text, "SELECT TOP 1 TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @TABLA", p);
						bool existe = readerTabla.Read();
						readerTabla.Close();

						if (existe)
						{
							await AgregarColumnasDeTablaAsync(cand, lista, keysExistentes);
						}
					}

					string opcionUpper = codigoOpcion.ToUpperInvariant();
					if (opcionUpper.Contains("EMPLEO") || opcionUpper.Contains("CANDIDATO") || opcionUpper.Contains("SELECCION") || opcionUpper.Contains("REQUISICION"))
					{
						AgregarParametroVirtual(lista, keysExistentes, "NOMBRE_CANDIDATO", "Nombre del Candidato", "Nombre completo del postulante", "TEXTO");
						AgregarParametroVirtual(lista, keysExistentes, "DUI_CANDIDATO", "DUI del Candidato", "Documento único de identidad del postulante", "TEXTO");
						AgregarParametroVirtual(lista, keysExistentes, "CORREO_DESTINO", "Correo del Candidato", "Correo electrónico de contacto del postulante", "EMAIL");
						AgregarParametroVirtual(lista, keysExistentes, "NUMERO_REQUISICION", "Número de Requisición", "Identificador o código de la requisición relacionada", "TEXTO");
						AgregarParametroVirtual(lista, keysExistentes, "NOMBRE_PUESTO", "Puesto de Requisición", "Cargo al que postula en la requisición", "TEXTO");
						AgregarParametroVirtual(lista, keysExistentes, "NOMBRE_UNIDAD", "Unidad / Departamento", "Área que solicita la plaza", "TEXTO");
						AgregarParametroVirtual(lista, keysExistentes, "MODALIDAD_NOMBRE", "Modalidad", "Modalidad laboral (Presencial, Remoto, Híbrido)", "TEXTO");
						AgregarParametroVirtual(lista, keysExistentes, "HORARIO", "Horario", "Horario laboral de la vacante", "TEXTO");
						AgregarParametroVirtual(lista, keysExistentes, "SALARIO", "Salario", "Rango o asignación salarial", "TEXTO");
						AgregarParametroVirtual(lista, keysExistentes, "ENLACE_FORMULARIO", "Enlace al Formulario", "Enlace web único para completar la solicitud en línea", "URL");
						AgregarParametroVirtual(lista, keysExistentes, "FECHA_EXPIRACION", "Fecha de Expiración", "Fecha y hora límite de validez del enlace", "FECHA");
						AgregarParametroVirtual(lista, keysExistentes, "HORAS_VIGENCIA", "Horas de Vigencia", "Horas habilitadas para completar el formulario", "NUMERO");
					}
					else if (opcionUpper.Contains("COTIZACION") || opcionUpper.Contains("COMPRA") || opcionUpper.Contains("PROVEEDOR"))
					{
						AgregarParametroVirtual(lista, keysExistentes, "ENLACE_PORTAL", "Enlace al Portal", "Enlace web para ingresar cotización", "URL");
					}
					else if (opcionUpper.Contains("USUARIO") || opcionUpper.Contains("CLAVE") || opcionUpper.Contains("SEG"))
					{
						AgregarParametroVirtual(lista, keysExistentes, "ENLACE_RESTABLECER", "Enlace Restablecer", "Enlace temporal para restablecer contraseña", "URL");
						AgregarParametroVirtual(lista, keysExistentes, "FECHA_EXPIRACION", "Fecha de Expiración", "Tiempo de validez del enlace", "FECHA");
					}
				}

				objResultado.Data = lista;
				objResultado.Result = true;
				objResultado.RowsAffected = lista.Count;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: determina las vistas principales y complementarias a inspeccionar según la opción del sistema.
		// Cómo lo hace: incluye la vista directa y añade vistas relacionadas del proceso (ej. requisición asociada a la solicitud).
		private static List<string> ObtenerTablasCandidatas(string codigoOpcion)
		{
			var candidatos = new List<string> { "V_" + codigoOpcion, codigoOpcion };

			if (codigoOpcion.Equals("SC_SOLICITUD_EMPLEO", System.StringComparison.OrdinalIgnoreCase))
			{
				candidatos.Add("V_SC_SOLICITUD_REQUISICION");
			}
			else if (codigoOpcion.Equals("SC_REQUISICION_PERSONAL", System.StringComparison.OrdinalIgnoreCase))
			{
				candidatos.Add("V_SC_REQUISICION_PERSONAL_CANDIDATO");
			}

			return candidatos;
		}

		// Qué hace: extrae las columnas de base de datos de una tabla o vista excluyendo correlativos crudos, campos de auditoría y credenciales.
		// Cómo lo hace: consulta INFORMATION_SCHEMA.COLUMNS escapando el comodín CORR[_]% para no descartar columnas como CORREO.
		private async Task AgregarColumnasDeTablaAsync(string nombreTabla, List<dynamic> lista, HashSet<string> keysExistentes)
		{
			string sqlColumnas = @"
				SELECT COLUMN_NAME 
				FROM INFORMATION_SCHEMA.COLUMNS 
				WHERE TABLE_NAME = @TABLA 
				  AND COLUMN_NAME NOT LIKE 'CORR[_]%'
				  AND COLUMN_NAME NOT LIKE '%ESTADO%'
				  AND COLUMN_NAME NOT IN (
					  'CORR', 'ESTADO', 'ACTIVO', 
					  'USUARIO_CREA', 'ESTACION_CREA', 'FECHA_CREA', 
					  'USUARIO_ACTU', 'ESTACION_ACTU', 'FECHA_ACTU', 
					  'FOTO', 'TOKEN_HASH', 'PASSWORD', 'CLAVE'
				  )
				ORDER BY ORDINAL_POSITION";

			var pCols = new List<CParameter>
			{
				new CParameter { ParameterName = "TABLA", Value = nombreTabla, DbType = System.Data.DbType.String }
			};

			var readerCols = await objData.GetDataReader(System.Data.CommandType.Text, sqlColumnas, pCols);
			while (readerCols.Read())
			{
				string col = readerCols["COLUMN_NAME"]?.ToString() ?? string.Empty;
				if (!string.IsNullOrWhiteSpace(col) && !keysExistentes.Contains(col))
				{
					keysExistentes.Add(col);
					string colUpper = col.ToUpperInvariant();
					string tipoCol = (colUpper.Contains("URL") || colUpper.Contains("ENLACE") || colUpper.Contains("LINK") || colUpper.Contains("SITIO") || colUpper.Contains("PORTAL")) ? "URL" : "TEXTO";
					lista.Add(new
					{
						key = col,
						label = FormatearLabelColumna(col),
						descripcion = $"Campo del proceso ({nombreTabla})",
						tipo = tipoCol
					});
				}
			}
			readerCols.Close();
		}

		private static void AgregarParametroVirtual(List<dynamic> lista, HashSet<string> keys, string key, string label, string descripcion, string tipo = "TEXTO")
		{
			if (!keys.Contains(key))
			{
				keys.Add(key);
				lista.Add(new { key, label, descripcion, tipo });
			}
		}

		private static string FormatearLabelColumna(string col)
		{
			var palabras = col.Split('_', System.StringSplitOptions.RemoveEmptyEntries);
			for (int i = 0; i < palabras.Length; i++)
			{
				if (palabras[i].Length > 0)
				{
					palabras[i] = char.ToUpperInvariant(palabras[i][0]) + palabras[i].Substring(1).ToLowerInvariant();
				}
			}
			return string.Join(" ", palabras);
		}
	}
}
