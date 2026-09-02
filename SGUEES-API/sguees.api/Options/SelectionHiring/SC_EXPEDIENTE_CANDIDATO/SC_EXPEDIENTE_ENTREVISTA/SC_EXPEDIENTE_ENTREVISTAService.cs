using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class SC_EXPEDIENTE_ENTREVISTAService : ISC_EXPEDIENTE_ENTREVISTAService
	{
		private const string EstadoProgramada = "PROGRAMADA";
		private readonly ISC_EXPEDIENTE_ENTREVISTARepository _repo;

		public SC_EXPEDIENTE_ENTREVISTAService(ISC_EXPEDIENTE_ENTREVISTARepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(SC_EXPEDIENTE_ENTREVISTAParam xWhere)
		{
			if (xWhere.CORR_EXPEDIENTE_CANDIDATO <= 0)
			{
				return ValidationError("Debe indicar el expediente.");
			}

			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = xWhere.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32 },
			};

			if (xWhere.CORR_SOLICITUD_EMPLEO > 0)
			{
				p.Add(new CParameter()
				{
					ParameterName = "CORR_SOLICITUD_EMPLEO",
					Value = xWhere.CORR_SOLICITUD_EMPLEO,
					DbType = System.Data.DbType.Int32,
				});
			}

			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(SC_EXPEDIENTE_ENTREVISTAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = xWhere.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EXPEDIENTE_ENTREVISTA", Value = xWhere.CORR_EXPEDIENTE_ENTREVISTA, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(SC_EXPEDIENTE_ENTREVISTATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var validacion = ValidarNegocio(Data, esUpdate: false);
			if (validacion != null)
			{
				return validacion;
			}

			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(SC_EXPEDIENTE_ENTREVISTATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_EXPEDIENTE_CANDIDATO <= 0 || Data.CORR_EXPEDIENTE_ENTREVISTA <= 0)
			{
				return ValidationError("No se pudo identificar la entrevista a actualizar.");
			}

			var validacion = ValidarNegocio(Data, esUpdate: true);
			if (validacion != null)
			{
				return validacion;
			}

			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(SC_EXPEDIENTE_ENTREVISTATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_EXPEDIENTE_CANDIDATO <= 0 || Data.CORR_EXPEDIENTE_ENTREVISTA <= 0)
			{
				return ValidationError("No se pudo identificar la entrevista a eliminar.");
			}

			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		/// <summary>
		/// Desde requisición: solo el usuario que creó la entrevista y solo en estado PROGRAMADA.
		/// </summary>
		public async Task<CResult> UpdateByRequisicionAsync(
			SC_EXPEDIENTE_ENTREVISTATable Data,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			var permiso = await ValidarPermisoRequisicionAsync(Data, vLOGIN_SISTEMA);
			if (permiso != null)
			{
				return permiso;
			}

			return await UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		/// <summary>
		/// Desde requisición: solo el usuario que creó la entrevista y solo en estado PROGRAMADA.
		/// </summary>
		public async Task<CResult> DeleteByRequisicionAsync(
			SC_EXPEDIENTE_ENTREVISTATable Data,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			var permiso = await ValidarPermisoRequisicionAsync(Data, vLOGIN_SISTEMA);
			if (permiso != null)
			{
				return permiso;
			}

			return await DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		private async Task<CResult> ValidarPermisoRequisicionAsync(
			SC_EXPEDIENTE_ENTREVISTATable Data,
			string vLOGIN_SISTEMA)
		{
			if (Data == null || Data.CORR_EXPEDIENTE_CANDIDATO <= 0 || Data.CORR_EXPEDIENTE_ENTREVISTA <= 0)
			{
				return ValidationError("No se pudo identificar la entrevista.");
			}

			var existenteResult = await GetAsync(new SC_EXPEDIENTE_ENTREVISTAParam
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_EXPEDIENTE_CANDIDATO = Data.CORR_EXPEDIENTE_CANDIDATO,
				CORR_EXPEDIENTE_ENTREVISTA = Data.CORR_EXPEDIENTE_ENTREVISTA,
			});

			if (!existenteResult.Result || existenteResult.Data == null)
			{
				return ValidationError("La entrevista no existe o no está disponible.");
			}

			var existente = existenteResult.Data as SC_EXPEDIENTE_ENTREVISTAView;
			if (existente == null)
			{
				return ValidationError("No se pudo leer la entrevista.");
			}

			var login = (vLOGIN_SISTEMA ?? string.Empty).Trim();
			var creador = (existente.USUARIO_CREA ?? string.Empty).Trim();
			if (!string.Equals(creador, login, StringComparison.OrdinalIgnoreCase))
			{
				return ValidationError("Solo puede modificar las entrevistas que usted registró.");
			}

			var estado = (existente.ESTADO_ENTREVISTA ?? string.Empty).Trim();
			if (!string.Equals(estado, EstadoProgramada, StringComparison.OrdinalIgnoreCase))
			{
				return ValidationError("Solo se pueden editar o eliminar entrevistas en estado Programada.");
			}

			return null;
		}

		private static CResult ValidarNegocio(SC_EXPEDIENTE_ENTREVISTATable Data, bool esUpdate)
		{
			if (Data == null || Data.CORR_EXPEDIENTE_CANDIDATO <= 0 || Data.CORR_SOLICITUD_EMPLEO <= 0)
			{
				return ValidationError("Debe indicar expediente y solicitud de empleo.");
			}

			if (string.IsNullOrWhiteSpace(Data.TIPO_ENTREVISTA))
			{
				return ValidationError("Debe indicar el tipo de entrevista.");
			}

			if (string.IsNullOrWhiteSpace(Data.ENTREVISTADOR))
			{
				return ValidationError("Debe indicar el entrevistador.");
			}

			if (string.IsNullOrWhiteSpace(Data.ESTADO_ENTREVISTA))
			{
				return ValidationError("Debe indicar el estado de la entrevista.");
			}

			if (Data.FECHA_ENTREVISTA == default)
			{
				return ValidationError("Debe indicar la fecha de la entrevista.");
			}

			return null;
		}

		private static CResult ValidationError(string message)
		{
			return new CResult
			{
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = -1,
				ErrorMessage = message,
				ErrorSource = "[SC_EXPEDIENTE_ENTREVISTAService]",
				RowsAffected = 0
			};
		}
	}
}
