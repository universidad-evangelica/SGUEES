// Qué hace: acceso a datos de contactos anidados en GEN_EMPLEADO.
// Cómo lo hace: merge catálogo activo + valores; SaveAll valida formato y sincroniza la lista.
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
	public class GEN_PERSONA_CONTACTORepository
		: BaseRepository<GEN_PERSONA_CONTACTOTable>,
			IGEN_PERSONA_CONTACTORepository
	{
		private const string _TableName = "GEN_PERSONA_CONTACTO";
		private const string _ViewName = "V_GEN_PERSONA_CONTACTO";
		private const string _ViewTipoContacto = "V_GEN_TIPO_CONTACTO";

		public GEN_PERSONA_CONTACTORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		// Qué hace: arma la lista del tab Contactos (catálogo activo + valor de la persona).
		// Cómo: lee V_GEN_TIPO_CONTACTO y V_GEN_PERSONA_CONTACTO y hace merge por tipo.
		public async Task<CResult> GetAllAsync(long corrPersona, int corrEmpresa)
		{
			CResult objResultado = new();

			try
			{
				var catalogoWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "ACTIVO_TIPO_CONTACTO", Value = true, DbType = System.Data.DbType.Boolean },
				};
				var readerCat = await objData.GetDataReader(_ViewTipoContacto, catalogoWhere, "CORR_TIPO_CONTACTO");
				var catalogo = new List<GEN_PERSONA_CONTACTOView>().FromDataReader(readerCat).ToList();
				readerCat.Close();

				var valores = new List<GEN_PERSONA_CONTACTOView>();
				if (corrPersona > 0 && corrEmpresa > 0)
				{
					var valoresWhere = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
					};
					var readerVal = await objData.GetDataReader(_ViewName, valoresWhere, "CORR_TIPO_CONTACTO");
					valores = new List<GEN_PERSONA_CONTACTOView>().FromDataReader(readerVal).ToList();
					readerVal.Close();
				}

				var merged = catalogo.Select(t =>
				{
					var actual = valores.FirstOrDefault(v => v.CORR_TIPO_CONTACTO == t.CORR_TIPO_CONTACTO);
					return new GEN_PERSONA_CONTACTOView
					{
						CORR_EMPRESA = corrEmpresa,
						CORR_PERSONA = corrPersona,
						CORR_CONTACTO = actual?.CORR_CONTACTO ?? 0,
						CORR_TIPO_CONTACTO = t.CORR_TIPO_CONTACTO,
						NOMBRE_TIPO_CONTACTO = t.NOMBRE_TIPO_CONTACTO,
						NOMBRE_CORTO = t.NOMBRE_CORTO,
						NUMERO_CARACTERES = t.NUMERO_CARACTERES,
						ACTIVO_CARACTERES = t.ACTIVO_CARACTERES,
						FORMATO_CARACTERES = t.FORMATO_CARACTERES,
						APLICA_PARA = t.APLICA_PARA,
						ACTIVO_TIPO_CONTACTO = t.ACTIVO_TIPO_CONTACTO,
						ACTIVO_CONTACTO = actual?.ACTIVO_CONTACTO ?? true,
						VALOR_CONTACTO = actual?.VALOR_CONTACTO ?? string.Empty,
						EXISTE = actual != null,
						USUARIO_CREA = actual?.USUARIO_CREA,
						ESTACION_CREA = actual?.ESTACION_CREA,
						FECHA_CREA = actual?.FECHA_CREA,
						USUARIO_ACTU = actual?.USUARIO_ACTU,
						ESTACION_ACTU = actual?.ESTACION_ACTU,
						FECHA_ACTU = actual?.FECHA_ACTU,
					};
				}).ToList();

				objResultado.Data = merged;
				objResultado.Result = true;
				objResultado.RowsAffected = merged.Count;
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

		// Qué hace: guarda contactos (insert/update; borra si el valor queda vacío).
		// Cómo: valida formato según el catálogo; un registro por tipo; relee el merge en Data.
		public async Task<CResult> SaveAllAsync(
			long corrPersona,
			List<GEN_PERSONA_CONTACTOTable> Data,
			int corrEmpresa,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				if (corrEmpresa <= 0)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 4000;
					objResultado.ErrorMessage = "CORR_EMPRESA es requerido.";
					return objResultado;
				}

				if (corrPersona <= 0)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 4000;
					objResultado.ErrorMessage = "CORR_PERSONA es requerido.";
					return objResultado;
				}

				var readerTipos = await objData.GetDataReader(_ViewTipoContacto, new List<CParameter>(), "CORR_TIPO_CONTACTO");
				var tipos = new List<GEN_PERSONA_CONTACTOView>().FromDataReader(readerTipos).ToList();
				readerTipos.Close();
				var tipoPorCorr = tipos
					.GroupBy(t => t.CORR_TIPO_CONTACTO)
					.ToDictionary(g => g.Key, g => g.First());

				var docs = Data ?? new List<GEN_PERSONA_CONTACTOTable>();
				foreach (var item in docs)
				{
					if (item == null || item.CORR_TIPO_CONTACTO <= 0)
					{
						continue;
					}

					if (!tipoPorCorr.TryGetValue(item.CORR_TIPO_CONTACTO, out var tipo))
					{
						return Aviso("El tipo de contacto no existe en el catálogo.");
					}

					var valor = (item.VALOR_CONTACTO ?? string.Empty).Trim();
					if (string.IsNullOrWhiteSpace(valor))
					{
						item.VALOR_CONTACTO = string.Empty;
						continue;
					}

					var error = ValidarValor(tipo, valor, out var normalizado);
					if (error != null)
					{
						return Aviso(error);
					}

					item.VALOR_CONTACTO = normalizado;
				}

				var fecha = DateTime.Now;
				var rowsAffected = 0;
				var existentesWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
				};
				var readerExist = await objData.GetDataReader(_ViewName, existentesWhere);
				var existentes = new List<GEN_PERSONA_CONTACTOView>().FromDataReader(readerExist).ToList();
				readerExist.Close();

				var siguiente = existentes.Select(x => x.CORR_CONTACTO).DefaultIfEmpty(0).Max();

				foreach (var item in docs)
				{
					if (item == null || item.CORR_TIPO_CONTACTO <= 0)
					{
						continue;
					}

					var valor = (item.VALOR_CONTACTO ?? string.Empty).Trim();
					var delMismoTipo = existentes.Where(x => x.CORR_TIPO_CONTACTO == item.CORR_TIPO_CONTACTO).ToList();

					if (string.IsNullOrWhiteSpace(valor))
					{
						foreach (var viejo in delMismoTipo)
						{
							rowsAffected += (int)await objData.Delete(_TableName, WhereContacto(corrEmpresa, corrPersona, viejo.CORR_CONTACTO));
							existentes.Remove(viejo);
						}
						continue;
					}

					if (delMismoTipo.Count > 0)
					{
						var actual = delMismoTipo[0];
						var pUpdate = new List<CParameter>
						{
							new CParameter() { ParameterName = "VALOR_CONTACTO", Value = valor, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "CORR_TIPO_CONTACTO", Value = item.CORR_TIPO_CONTACTO, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "FECHA_ACTU", Value = fecha, DbType = System.Data.DbType.DateTime },
						};
						var readerUpd = await objData.Update(_TableName, pUpdate, WhereContacto(corrEmpresa, corrPersona, actual.CORR_CONTACTO));
						readerUpd?.Close();
						rowsAffected++;

						foreach (var extra in delMismoTipo.Skip(1))
						{
							rowsAffected += (int)await objData.Delete(_TableName, WhereContacto(corrEmpresa, corrPersona, extra.CORR_CONTACTO));
							existentes.Remove(extra);
						}
					}
					else
					{
						siguiente++;
						var pInsert = new List<CParameter>
						{
							new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
							new CParameter() { ParameterName = "CORR_CONTACTO", Value = siguiente, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_TIPO_CONTACTO", Value = item.CORR_TIPO_CONTACTO, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "VALOR_CONTACTO", Value = valor, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "ACTIVO_CONTACTO", Value = true, DbType = System.Data.DbType.Boolean },
							new CParameter() { ParameterName = "USUARIO_CREA", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "ESTACION_CREA", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "FECHA_CREA", Value = fecha, DbType = System.Data.DbType.DateTime },
							new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "FECHA_ACTU", Value = fecha, DbType = System.Data.DbType.DateTime },
						};
						var readerIns = await objData.Insert(_TableName, pInsert, string.Empty, WhereContacto(corrEmpresa, corrPersona, siguiente));
						readerIns?.Close();
						existentes.Add(new GEN_PERSONA_CONTACTOView
						{
							CORR_CONTACTO = siguiente,
							CORR_TIPO_CONTACTO = item.CORR_TIPO_CONTACTO,
						});
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

		private static List<CParameter> WhereContacto(int corrEmpresa, long corrPersona, int corrContacto)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
				new CParameter() { ParameterName = "CORR_CONTACTO", Value = corrContacto, DbType = System.Data.DbType.Int32 },
			};
		}

		// Qué hace: valida el valor según el tipo de contacto del catálogo.
		// Cómo: teléfono nacional +503; email con formato de correo; el resto por FORMATO_CARACTERES y tope.
		private static string ValidarValor(GEN_PERSONA_CONTACTOView tipo, string valor, out string normalizado)
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

		// Qué hace: exige 8 dígitos y los guarda como +503 XXXX-XXXX.
		// Cómo: ignora el prefijo 503 si ya viene en el texto; el tope del catálogo cuenta solo los dígitos.
		private static string ValidarTelefonoNacional(string valor, GEN_PERSONA_CONTACTOView tipo, out string normalizado)
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

		private static int? Tope(GEN_PERSONA_CONTACTOView tipo)
		{
			var activo = tipo.ACTIVO_CARACTERES == true;
			var n = tipo.NUMERO_CARACTERES ?? 0;
			if (!activo || n <= 0)
			{
				return null;
			}

			return n;
		}

		// Qué hace: aplica el CHECK FORMATO_CARACTERES (NUMEROS, LETRAS o AMBOS).
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

		private static CResult Aviso(string message)
		{
			return new CResult
			{
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = 2627,
				ErrorMessage = message,
				ErrorSource = "[GEN_PERSONA_CONTACTORepository]",
				RowsAffected = 0
			};
		}
	}
}
