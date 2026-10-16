// Qué hace: servicio de lógica de negocio para configuración de parámetros SMTP.
// Cómo lo hace: construye los parámetros de filtro y delega las operaciones al repositorio IGEN_PARAMETRO_SMTPRepository.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_PARAMETRO_SMTPService : IGEN_PARAMETRO_SMTPService
	{
		private readonly IGEN_PARAMETRO_SMTPRepository _repo;

		public GEN_PARAMETRO_SMTPService(IGEN_PARAMETRO_SMTPRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_PARAMETRO_SMTPParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 }
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(GEN_PARAMETRO_SMTPParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PARAMETRO_SMTP", Value = xWhere.CORR_PARAMETRO_SMTP, DbType = System.Data.DbType.Int32 }
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(GEN_PARAMETRO_SMTPTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(GEN_PARAMETRO_SMTPTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(GEN_PARAMETRO_SMTPTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
