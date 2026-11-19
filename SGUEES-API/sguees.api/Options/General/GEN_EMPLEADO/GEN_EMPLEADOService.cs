// Qué hace: servicio de empleados (browse + Iniciar + personales vía SP).
// Cómo lo hace: Iniciar/UpdatePersonales delegan a PRAL_MTTO_GEN_EMPLEADO (persona + natural + empleado).
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_EMPLEADOService : IGEN_EMPLEADOService
	{
		private readonly IGEN_EMPLEADORepository _repo;

		public GEN_EMPLEADOService(IGEN_EMPLEADORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_EMPLEADOParam xWhere, string login)
		{
			return await _repo.GetAllVisibleAsync(
				xWhere?.CORR_EMPRESA ?? 0,
				login,
				xWhere?.CORR_EMPLEADO > 0 ? xWhere.CORR_EMPLEADO : null);
		}

		public async Task<CResult> GetAsync(GEN_EMPLEADOParam xWhere, string login)
		{
			if (xWhere == null || xWhere.CORR_EMPLEADO <= 0)
			{
				return AccesoDenegado("Debe seleccionar un empleado válido.");
			}

			return await _repo.GetVisibleAsync(xWhere.CORR_EMPRESA, xWhere.CORR_EMPLEADO, login);
		}

		// Qué hace: inicia empleado nuevo (4 tablas en una transacción SP).
		// Cómo: PRAL_MTTO_GEN_EMPLEADO TIPO 1; Data = V_GEN_EMPLEADO.
		public async Task<CResult> IniciarAsync(GEN_EMPLEADO_MTTOTable data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (corrEmpresa <= 0)
			{
				return new CResult
				{
					Result = false,
					ErrorCode = 4000,
					ErrorMessage = "CORR_EMPRESA es requerido para iniciar empleado.",
					ErrorSource = "[GEN_EMPLEADOService]",
				};
			}

			data ??= new GEN_EMPLEADO_MTTOTable();
			data.CORR_PERSONA = 0;
			data.CORR_PERSONA_NATURAL = 0;
			data.CORR_EMPLEADO = 0;
			data.ES_JUBILADO ??= false;
			data.POSEE_DISCAPACIDAD ??= false;
			data.ES_EXTRANJERO ??= false;
			data.ACTIVO_EMPLEADO ??= true;

			var errorFormato = ValidarDatosInstitucionales(data);
			if (errorFormato != null)
			{
				return AvisoInstitucional(errorFormato);
			}

			return await _repo.MttoEmpleadoAsync(data, (int)UpdateType.Add, corrEmpresa, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> GetPersonaNaturalAsync(GEN_PERSONA_NATURALParam xWhere, int corrEmpresa, string login)
		{
			if (xWhere == null || (xWhere.CORR_PERSONA <= 0 && xWhere.CORR_PERSONA_NATURAL <= 0))
			{
				return AccesoDenegado("Debe especificar una persona válida.");
			}

			if (!await _repo.PuedeVerPersonaAsync(corrEmpresa, xWhere.CORR_PERSONA, xWhere.CORR_PERSONA_NATURAL, login))
			{
				return AccesoDenegado("No tiene acceso a los datos de esta persona.");
			}

			var p = new List<CParameter>();
			if (xWhere.CORR_PERSONA_NATURAL > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_PERSONA_NATURAL", Value = xWhere.CORR_PERSONA_NATURAL, DbType = System.Data.DbType.Int64 });
			}
			else if (xWhere.CORR_PERSONA > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_PERSONA", Value = xWhere.CORR_PERSONA, DbType = System.Data.DbType.Int64 });
			}

			return await _repo.GetPersonaNaturalAsync(p);
		}

		public Task<bool> PuedeVerPersonaAsync(int corrEmpresa, long? corrPersona, long? corrPersonaNatural, string login)
		{
			return _repo.PuedeVerPersonaAsync(corrEmpresa, corrPersona, corrPersonaNatural, login);
		}

		// Qué hace: actualiza personales + datos GEN_EMPLEADO del form.
		// Cómo: PRAL_MTTO_GEN_EMPLEADO TIPO 2; relee natural en Data (empleado ya en memoria SPA).
		public Task<CResult> UpdatePersonalesAsync(GEN_EMPLEADO_MTTOTable Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION)
		{
			return UpdatePersonalesConAccesoAsync(Data, corrEmpresa, vLOGIN_SISTEMA, vESTACION);
		}

		private async Task<CResult> UpdatePersonalesConAccesoAsync(
			GEN_EMPLEADO_MTTOTable Data,
			int corrEmpresa,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			if (Data == null || !await _repo.PuedeVerPersonaAsync(
				corrEmpresa,
				Data.CORR_PERSONA,
				Data.CORR_PERSONA_NATURAL,
				vLOGIN_SISTEMA))
			{
				return AccesoDenegado("No tiene acceso para modificar los datos de esta persona.");
			}

			var errorFormato = ValidarDatosInstitucionales(Data);
			if (errorFormato != null)
			{
				return AvisoInstitucional(errorFormato);
			}

			return await _repo.MttoEmpleadoAsync(Data, (int)UpdateType.Update, corrEmpresa, vLOGIN_SISTEMA, vESTACION);
		}

		public Task<CResult> CreateAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data != null)
			{
				Data.USUARIO_CREA = vLOGIN_SISTEMA;
			}

			var errorFormato = ValidarDatosInstitucionales(Data);
			if (errorFormato != null)
			{
				return Task.FromResult(AvisoInstitucional(errorFormato));
			}

			return _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public Task<CResult> UpdateAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return UpdateConAccesoAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		private async Task<CResult> UpdateConAccesoAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || !await _repo.PuedeVerEmpleadoAsync(Data.CORR_EMPRESA, Data.CORR_EMPLEADO, vLOGIN_SISTEMA))
			{
				return AccesoDenegado("No tiene acceso para modificar este empleado.");
			}

			var errorFormato = ValidarDatosInstitucionales(Data);
			if (errorFormato != null)
			{
				return AvisoInstitucional(errorFormato);
			}

			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || !await _repo.PuedeVerEmpleadoAsync(Data.CORR_EMPRESA, Data.CORR_EMPLEADO, vLOGIN_SISTEMA))
			{
				return AccesoDenegado("No tiene acceso para eliminar este empleado.");
			}

			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: valida correo y teléfono institucional de GEN_EMPLEADO.
		// Cómo: correo con formato de email; teléfono nacional +503 y 8 dígitos. Vacío se guarda null.
		private static string ValidarDatosInstitucionales(GEN_EMPLEADO_MTTOTable data)
		{
			if (data == null)
			{
				return null;
			}

			return NormalizarInstitucionales(data.CORREO_INSTITUCIONAL, data.TELEFONO_INSTITUCIONAL, out var correo, out var telefono)
				?? Asignar(data, correo, telefono);
		}

		private static string ValidarDatosInstitucionales(GEN_EMPLEADOTable data)
		{
			if (data == null)
			{
				return null;
			}

			return NormalizarInstitucionales(data.CORREO_INSTITUCIONAL, data.TELEFONO_INSTITUCIONAL, out var correo, out var telefono)
				?? Asignar(data, correo, telefono);
		}

		private static string Asignar(GEN_EMPLEADO_MTTOTable data, string correo, string telefono)
		{
			data.CORREO_INSTITUCIONAL = correo;
			data.TELEFONO_INSTITUCIONAL = telefono;
			return null;
		}

		private static string Asignar(GEN_EMPLEADOTable data, string correo, string telefono)
		{
			data.CORREO_INSTITUCIONAL = correo;
			data.TELEFONO_INSTITUCIONAL = telefono;
			return null;
		}

		private static string NormalizarInstitucionales(string correoRaw, string telefonoRaw, out string correo, out string telefono)
		{
			correo = string.IsNullOrWhiteSpace(correoRaw) ? null : correoRaw.Trim();
			telefono = null;

			if (correo != null)
			{
				if (correo.Length > 255)
				{
					return "El correo institucional no puede superar 255 caracteres.";
				}

				if (!EsEmailValido(correo))
				{
					return "El correo electrónico no tiene un formato válido.";
				}
			}

			var tel = (telefonoRaw ?? string.Empty).Trim();
			if (tel.Length == 0)
			{
				return null;
			}

			var errorTel = NormalizarTelefonoNacional(tel, out telefono);
			return errorTel;
		}

		// Qué hace: deja el teléfono institucional como +503 XXXX-XXXX.
		// Cómo: cuenta solo los 8 dígitos del número; el prefijo +503 no entra en esa cuenta.
		private static string NormalizarTelefonoNacional(string valor, out string normalizado)
		{
			normalizado = null;
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

			if (digits.Length != 8)
			{
				return "El teléfono institucional debe tener el formato +503 XXXX-XXXX (8 dígitos).";
			}

			normalizado = "+503 " + digits.Substring(0, 4) + "-" + digits.Substring(4);
			return null;
		}

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

		// Qué hace: cambia el estado activo/inactivo del empleado.
		// Cómo: valida empresa y correlativo, y delega en PRAL_MTTO_CATALOGO_ESTADO_BIT.
		public async Task<CResult> ActivarInactivarAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_EMPRESA <= 0)
			{
				return new CResult
				{
					Result = false,
					ErrorCode = 4000,
					ErrorMessage = "CORR_EMPRESA es requerido para cambiar el estado del empleado.",
					ErrorSource = "[GEN_EMPLEADOService]",
				};
			}

			if (Data.CORR_EMPLEADO <= 0)
			{
				return new CResult
				{
					Result = false,
					ErrorCode = 4000,
					ErrorMessage = "No se pudo identificar el empleado a actualizar.",
					ErrorSource = "[GEN_EMPLEADOService]",
				};
			}

			if (!await _repo.PuedeVerEmpleadoAsync(Data.CORR_EMPRESA, Data.CORR_EMPLEADO, vLOGIN_SISTEMA))
			{
				return AccesoDenegado("No tiene acceso para modificar este empleado.");
			}

			return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		private static CResult AccesoDenegado(string mensaje)
		{
			return new CResult
			{
				Result = false,
				RowsAffected = 0,
				ErrorCode = 403,
				ErrorMessage = mensaje,
				ErrorSource = "[GEN_EMPLEADOService]",
			};
		}

		private static CResult AvisoInstitucional(string message)
		{
			return new CResult
			{
				Data = null,
				Result = false,
				ErrorCode = 2627,
				ErrorMessage = message,
				ErrorSource = "[GEN_EMPLEADOService]",
				RowsAffected = 0
			};
		}
	}
}
