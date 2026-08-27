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
