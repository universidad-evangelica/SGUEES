// Qué hace: acceso a datos de personas de contacto (tab Contactos de GEN_EMPLEADO).
// Cómo lo hace: GetAll desde la vista; SaveAll valida VALOR_CONTACTO con el catálogo y sincroniza la lista.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_PERSONA_PARENTESCO_CONTACTORepository
		: BaseRepository<GEN_PERSONA_PARENTESCO_CONTACTOTable>,
			IGEN_PERSONA_PARENTESCO_CONTACTORepository
	{
		private const string _TableName = "GEN_PERSONA_PARENTESCO_CONTACTO";
		private const string _ViewName = "V_GEN_PERSONA_PARENTESCO_CONTACTO";
		private const string _ViewTipoContacto = "V_GEN_TIPO_CONTACTO";

		public GEN_PERSONA_PARENTESCO_CONTACTORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		// Qué hace: lista las personas de contacto del empleado.
		// Cómo: lee V_GEN_PERSONA_PARENTESCO_CONTACTO filtrada por empresa y persona.
		public async Task<CResult> GetAllAsync(long corrPersona, int corrEmpresa)
		{
			CResult objResultado = new();

			try
			{
				var rows = new List<GEN_PERSONA_PARENTESCO_CONTACTOView>();
				if (corrPersona > 0 && corrEmpresa > 0)
				{
					var where = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
					};
					var reader = await objData.GetDataReader(_ViewName, where, "CORR_PARENTESCO_CONTACTO");
					rows = new List<GEN_PERSONA_PARENTESCO_CONTACTOView>().FromDataReader(reader).ToList();
					reader.Close();
				}

				objResultado.Data = rows;
				objResultado.Result = true;
				objResultado.RowsAffected = rows.Count;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
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

		// Qué hace: guarda la lista (alta, cambio y baja) y relee las filas en Data.
		// Cómo: valida cada valor contra GEN_TIPO_CONTACTO antes de escribir; CORR<=0 se inserta con MAX+1.
		public async Task<CResult> SaveAllAsync(
			long corrPersona,
			List<GEN_PERSONA_PARENTESCO_CONTACTOTable> Data,
			int corrEmpresa,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				if (corrEmpresa <= 0)
				{
					return Aviso("CORR_EMPRESA es requerido.", 4000);
				}

				if (corrPersona <= 0)
				{
					return Aviso("CORR_PERSONA es requerido.", 4000);
				}

				var readerTipos = await objData.GetDataReader(_ViewTipoContacto, null, "CORR_TIPO_CONTACTO");
				var tipos = new List<GEN_TIPO_CONTACTOView>().FromDataReader(readerTipos).ToList();
				readerTipos.Close();
				var tiposPorCorr = tipos.ToDictionary(t => t.CORR_TIPO_CONTACTO);

				var items = Data ?? new List<GEN_PERSONA_PARENTESCO_CONTACTOTable>();
				var preparados = new List<GEN_PERSONA_PARENTESCO_CONTACTOTable>();
				foreach (var item in items)
				{
					if (item == null)
					{
						continue;
					}

					var nombre = (item.NOMBRE_COMPLETO ?? string.Empty).Trim();
					if (string.IsNullOrWhiteSpace(nombre))
					{
						return Aviso("Indique el nombre de la persona de contacto.");
					}

					if (nombre.Length > 100)
					{
						return Aviso("El nombre no puede superar 100 caracteres.");
					}

					var corrParentesco = item.CORR_PARENTESCO ?? 0;
					if (corrParentesco <= 0)
					{
						return Aviso("Seleccione el parentesco.");
					}

					var corrTipo = item.CORR_TIPO_CONTACTO ?? 0;
					if (corrTipo <= 0 || !tiposPorCorr.TryGetValue(corrTipo, out var tipo))
					{
						return Aviso("El tipo de contacto no existe en el catálogo.");
					}

					if (tipo.ACTIVO_TIPO_CONTACTO == false)
					{
						return Aviso("El tipo de contacto seleccionado está inactivo.");
					}

					var esExtranjero = item.ES_EXTRANJERO == true;
					if (!AplicaTipoContacto(tipo.APLICA_PARA, esExtranjero))
					{
						return Aviso(esExtranjero
							? "El tipo de contacto no aplica para un contacto extranjero."
							: "El tipo de contacto no aplica para un contacto nacional.");
					}

					var valor = (item.VALOR_CONTACTO ?? string.Empty).Trim();
					if (string.IsNullOrWhiteSpace(valor))
					{
						return Aviso("Indique el valor de contacto.");
					}

					var error = ValidarValor(tipo, valor, out var normalizado);
					if (error != null)
					{
						return Aviso(error);
					}

					var direccion = (item.DIRECCION ?? string.Empty).Trim();
					if (direccion.Length > 255)
					{
						return Aviso("La dirección no puede superar 255 caracteres.");
					}

					preparados.Add(new GEN_PERSONA_PARENTESCO_CONTACTOTable
					{
						CORR_PARENTESCO_CONTACTO = item.CORR_PARENTESCO_CONTACTO,
						NOMBRE_COMPLETO = nombre,
						CORR_PARENTESCO = corrParentesco,
						CORR_TIPO_CONTACTO = corrTipo,
						VALOR_CONTACTO = normalizado,
						DIRECCION = direccion,
						ES_EXTRANJERO = item.ES_EXTRANJERO == true,
						PARENTESCO_CONTACTO_EMERGENCIA = item.PARENTESCO_CONTACTO_EMERGENCIA == true,
						ACTIVO_PARENTESCO_CONTACTO = true,
					});
				}

				var fecha = DateTime.Now;
				var rowsAffected = 0;

				var existentesWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
				};
				var readerExist = await objData.GetDataReader(_ViewName, existentesWhere);
				var existentes = new List<GEN_PERSONA_PARENTESCO_CONTACTOView>().FromDataReader(readerExist).ToList();
				readerExist.Close();

				var keepKeys = new HashSet<int>(
					preparados.Where(x => x.CORR_PARENTESCO_CONTACTO > 0).Select(x => x.CORR_PARENTESCO_CONTACTO));

				foreach (var actual in existentes)
				{
					if (keepKeys.Contains(actual.CORR_PARENTESCO_CONTACTO))
					{
						continue;
					}

					rowsAffected += (int)await objData.Delete(_TableName, WhereFila(corrEmpresa, corrPersona, actual.CORR_PARENTESCO_CONTACTO));
				}

				foreach (var item in preparados)
				{
					var pDatos = ParametrosDatos(item, vLOGIN_SISTEMA, vESTACION, fecha, item.CORR_PARENTESCO_CONTACTO > 0);
					if (item.CORR_PARENTESCO_CONTACTO > 0)
					{
						var readerUpd = await objData.Update(
							_TableName,
							pDatos,
							WhereFila(corrEmpresa, corrPersona, item.CORR_PARENTESCO_CONTACTO));
						readerUpd?.Close();
						rowsAffected++;
					}
					else
					{
						pDatos.Insert(0, new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 });
						pDatos.Insert(1, new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 });
						pDatos.Insert(2, new CParameter() { ParameterName = "CORR_PARENTESCO_CONTACTO", Value = 0, DbType = System.Data.DbType.Int32 });
						var pWhereIns = new List<CParameter>
						{
							new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
						};
						var readerIns = await objData.Insert(_TableName, pDatos, "CORR_PARENTESCO_CONTACTO", pWhereIns);
						readerIns?.Close();
						rowsAffected++;
					}
				}

				var reload = await GetAllAsync(corrPersona, corrEmpresa);
				if (!reload.Result)
				{
					return reload;
				}

				objResultado.Data = reload.Data;
				objResultado.Result = true;
				objResultado.RowsAffected = rowsAffected;
				objResultado.CodeHelper = (int)corrPersona;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
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

		private static List<CParameter> WhereFila(int corrEmpresa, long corrPersona, int corr)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
				new CParameter() { ParameterName = "CORR_PARENTESCO_CONTACTO", Value = corr, DbType = System.Data.DbType.Int32 },
			};
		}

		private static List<CParameter> ParametrosDatos(
			GEN_PERSONA_PARENTESCO_CONTACTOTable item,
			string login,
			string estacion,
			DateTime fecha,
			bool esUpdate)
		{
			var lista = new List<CParameter>
			{
				new CParameter() { ParameterName = "NOMBRE_COMPLETO", Value = item.NOMBRE_COMPLETO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "CORR_PARENTESCO", Value = item.CORR_PARENTESCO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_TIPO_CONTACTO", Value = item.CORR_TIPO_CONTACTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "VALOR_CONTACTO", Value = item.VALOR_CONTACTO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "DIRECCION", Value = item.DIRECCION ?? string.Empty, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ES_EXTRANJERO", Value = item.ES_EXTRANJERO == true, DbType = System.Data.DbType.Boolean },
				new CParameter() { ParameterName = "PARENTESCO_CONTACTO_EMERGENCIA", Value = item.PARENTESCO_CONTACTO_EMERGENCIA == true, DbType = System.Data.DbType.Boolean },
				new CParameter() { ParameterName = "ACTIVO_PARENTESCO_CONTACTO", Value = true, DbType = System.Data.DbType.Boolean },
			};

			if (esUpdate)
			{
				lista.Add(new CParameter() { ParameterName = "USUARIO_ACTU", Value = login ?? string.Empty, DbType = System.Data.DbType.String });
				lista.Add(new CParameter() { ParameterName = "ESTACION_ACTU", Value = estacion ?? string.Empty, DbType = System.Data.DbType.String });
				lista.Add(new CParameter() { ParameterName = "FECHA_ACTU", Value = fecha, DbType = System.Data.DbType.DateTime });
			}
			else
			{
				lista.Add(new CParameter() { ParameterName = "USUARIO_CREA", Value = login ?? string.Empty, DbType = System.Data.DbType.String });
				lista.Add(new CParameter() { ParameterName = "ESTACION_CREA", Value = estacion ?? string.Empty, DbType = System.Data.DbType.String });
				lista.Add(new CParameter() { ParameterName = "FECHA_CREA", Value = fecha, DbType = System.Data.DbType.DateTime });
				lista.Add(new CParameter() { ParameterName = "USUARIO_ACTU", Value = login ?? string.Empty, DbType = System.Data.DbType.String });
				lista.Add(new CParameter() { ParameterName = "ESTACION_ACTU", Value = estacion ?? string.Empty, DbType = System.Data.DbType.String });
				lista.Add(new CParameter() { ParameterName = "FECHA_ACTU", Value = fecha, DbType = System.Data.DbType.DateTime });
			}

			return lista;
		}

		// Qué hace: el tipo debe coincidir con ES_EXTRANJERO según APLICA_PARA del catálogo.
		// Cómo: extranjero → EXTRANJEROS|AMBOS; nacional → NACIONALES|AMBOS. Vacío se trata como ambos.
		private static bool AplicaTipoContacto(string aplicaPara, bool esExtranjero)
		{
			var aplica = (aplicaPara ?? string.Empty).Trim().ToUpperInvariant();
			if (string.IsNullOrEmpty(aplica) || aplica == "AMBOS")
			{
				return true;
			}

			return esExtranjero ? aplica == "EXTRANJEROS" : aplica == "NACIONALES";
		}

		// Qué hace: valida el valor según el tipo de contacto del catálogo.
		// Cómo: teléfono nacional +503; email con formato de correo; el resto por FORMATO_CARACTERES y tope.
		private static string ValidarValor(GEN_TIPO_CONTACTOView tipo, string valor, out string normalizado)
		{
			normalizado = valor.Trim();
			var corto = (tipo.NOMBRE_CORTO ?? string.Empty).Trim().ToUpperInvariant();
			var nombre = string.IsNullOrWhiteSpace(tipo.NOMBRE_TIPO_CONTACTO) ? corto : tipo.NOMBRE_TIPO_CONTACTO.Trim();

			if (corto == "TELEFONO_NACION")
			{
				return ValidarTelefonoNacional(normalizado, tipo, out normalizado);
			}

			if (corto == "EMAIL")
			{
				if (!EsEmailValido(normalizado))
				{
					return "El correo electrónico no tiene un formato válido.";
				}

				var topeEmail = Tope(tipo);
				if (topeEmail.HasValue && normalizado.Length > topeEmail.Value)
				{
					return $"El correo no puede superar {topeEmail.Value} caracteres.";
				}

				return null;
			}

			var formato = (tipo.FORMATO_CARACTERES ?? string.Empty).Trim().ToUpperInvariant();
			if (!CumpleFormato(normalizado, formato))
			{
				return MensajeFormato(nombre, formato);
			}

			var tope = Tope(tipo);
			if (tope.HasValue && normalizado.Length > tope.Value)
			{
				return $"{nombre} no puede superar {tope.Value} caracteres.";
			}

			return null;
		}

		// Qué hace: exige los dígitos del tope y los guarda como +503 XXXX-XXXX.
		// Cómo: si el texto trae +503, solo cuenta los dígitos que van después.
		private static string ValidarTelefonoNacional(string valor, GEN_TIPO_CONTACTOView tipo, out string normalizado)
		{
			normalizado = valor;
			var raw = valor.Trim();
			string digits;
			var marca = raw.IndexOf("+503", StringComparison.Ordinal);
			if (marca >= 0)
			{
				digits = new string(raw.Substring(marca + 4).Where(char.IsDigit).ToArray());
			}
			else
			{
				digits = new string(raw.Where(char.IsDigit).ToArray());
				if (digits.StartsWith("503") && digits.Length > 8)
				{
					digits = digits.Substring(3);
				}
			}

			var tope = Tope(tipo) ?? 8;
			if (digits.Length != tope)
			{
				normalizado = valor;
				return $"El teléfono nacional debe tener el formato +503 XXXX-XXXX ({tope} dígitos).";
			}

			if (digits.Length > 4)
			{
				normalizado = "+503 " + digits.Substring(0, 4) + "-" + digits.Substring(4);
			}
			else
			{
				normalizado = "+503 " + digits;
			}
			return null;
		}

		// Qué hace: comprueba un correo como filter_var(FILTER_VALIDATE_EMAIL).
		// Cómo: MailAddress más un dominio con punto; rechaza texto vacío o con espacios.
		private static bool EsEmailValido(string email)
		{
			if (string.IsNullOrWhiteSpace(email) || email.Any(char.IsWhiteSpace))
			{
				return false;
			}

			try
			{
				var addr = new MailAddress(email);
				if (!string.Equals(addr.Address, email, StringComparison.OrdinalIgnoreCase))
				{
					return false;
				}

				var host = addr.Host ?? string.Empty;
				var dot = host.LastIndexOf('.');
				return dot > 0 && dot < host.Length - 1;
			}
			catch (FormatException)
			{
				return false;
			}
		}

		private static int? Tope(GEN_TIPO_CONTACTOView tipo)
		{
			var activo = tipo.ACTIVO_CARACTERES == true;
			var n = tipo.NUMERO_CARACTERES ?? 0;
			if (!activo || n <= 0)
			{
				return null;
			}

			return n;
		}

		private static bool CumpleFormato(string valor, string formato)
		{
			if (string.IsNullOrEmpty(formato) || formato == "AMBOS")
			{
				return valor.All(char.IsLetterOrDigit);
			}

			if (formato == "NUMEROS")
			{
				return valor.All(char.IsDigit);
			}

			if (formato == "LETRAS")
			{
				return valor.All(char.IsLetter);
			}

			return true;
		}

		private static string MensajeFormato(string nombre, string formato)
		{
			if (formato == "NUMEROS")
			{
				return $"{nombre} solo admite números.";
			}

			if (formato == "LETRAS")
			{
				return $"{nombre} solo admite letras.";
			}

			return $"{nombre} solo admite letras y números.";
		}

		private static CResult Aviso(string message, int errorCode = 2627)
		{
			return new CResult
			{
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = errorCode,
				ErrorMessage = message,
				ErrorSource = "[GEN_PERSONA_PARENTESCO_CONTACTORepository]",
				RowsAffected = 0
			};
		}
	}
}
