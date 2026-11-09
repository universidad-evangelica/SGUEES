using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_PERSONA_BANCOService : IGEN_PERSONA_BANCOService
	{
		private readonly IGEN_PERSONA_BANCORepository _repo;

		public GEN_PERSONA_BANCOService(IGEN_PERSONA_BANCORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_PERSONA_BANCOParam xWhere)
		{
			if (xWhere.CORR_PERSONA <= 0)
			{
				return ValidationError("Debe indicar la persona.");
			}

			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PERSONA", Value = xWhere.CORR_PERSONA, DbType = System.Data.DbType.Int64 },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(GEN_PERSONA_BANCOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PERSONA", Value = xWhere.CORR_PERSONA, DbType = System.Data.DbType.Int64 },
				new() { ParameterName = "CORR_PERSONA_BANCO", Value = xWhere.CORR_PERSONA_BANCO, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(GEN_PERSONA_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var validacion = Validar(Data);
			if (validacion != null)
			{
				return validacion;
			}

			Data.CORR_PERSONA_BANCO = await _repo.NextCorrAsync(Data.CORR_EMPRESA, Data.CORR_PERSONA);
			Data.CUENTA_BANCARIA = (Data.CUENTA_BANCARIA ?? string.Empty).Trim();
			Data.USUARIO_CREA = vLOGIN_SISTEMA;
			Data.ESTACION_CREA = vESTACION;
			Data.USUARIO_ACTU = vLOGIN_SISTEMA;
			Data.ESTACION_ACTU = vESTACION;
			Data.FECHA_CREA = System.DateTime.Now;
			Data.FECHA_ACTU = Data.FECHA_CREA;

			return await _repo.CreateAsync(Data);
		}

		public async Task<CResult> UpdateAsync(GEN_PERSONA_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var validacion = Validar(Data);
			if (validacion != null)
			{
				return validacion;
			}

			if (Data.CORR_PERSONA_BANCO <= 0)
			{
				return ValidationError("No se pudo identificar la cuenta bancaria.");
			}

			Data.CUENTA_BANCARIA = (Data.CUENTA_BANCARIA ?? string.Empty).Trim();
			Data.USUARIO_ACTU = vLOGIN_SISTEMA;
			Data.ESTACION_ACTU = vESTACION;
			Data.FECHA_ACTU = System.DateTime.Now;

			return await _repo.UpdateAsync(Data);
		}

		public async Task<CResult> DeleteAsync(GEN_PERSONA_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_PERSONA <= 0 || Data.CORR_PERSONA_BANCO <= 0)
			{
				return ValidationError("No se pudo identificar la cuenta bancaria a eliminar.");
			}

			return await _repo.DeleteAsync(Data);
		}

		private static CResult Validar(GEN_PERSONA_BANCOTable Data)
		{
			if (Data == null || Data.CORR_PERSONA <= 0)
			{
				return ValidationError("Debe indicar la persona.");
			}

			if (Data.CORR_BANCO <= 0)
			{
				return ValidationError("Debe seleccionar el banco.");
			}

			if (string.IsNullOrWhiteSpace(Data.CUENTA_BANCARIA))
			{
				return ValidationError("Debe indicar el número de cuenta.");
			}

			return null;
		}

		private static CResult ValidationError(string message) => new()
		{
			Data = null,
			Result = false,
			ErrorCode = 30000,
			ErrorMessage = message,
			RowsAffected = 0,
		};
	}
}
