// Qué hace: servicio del catálogo de rangos de monto SE.
// Cómo lo hace: arma CParameter y delega al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class ACA_SE_RANGO_MONTOService : IACA_SE_RANGO_MONTOService
	{
		private readonly IACA_SE_RANGO_MONTORepository _repo;

		public ACA_SE_RANGO_MONTOService(IACA_SE_RANGO_MONTORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(ACA_SE_RANGO_MONTOParam xWhere)
		{
			var p = new List<CParameter>();
			if (xWhere?.CORR_VERSION > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_VERSION", Value = xWhere.CORR_VERSION, DbType = System.Data.DbType.Int32 });
			}
			if (xWhere?.CORR_SECCION_SE > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_SECCION_SE", Value = xWhere.CORR_SECCION_SE, DbType = System.Data.DbType.Int32 });
			}
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(ACA_SE_RANGO_MONTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_RANGO_MONTO", Value = xWhere.CORR_RANGO_MONTO, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public Task<CResult> CreateAsync(ACA_SE_RANGO_MONTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdateAsync(ACA_SE_RANGO_MONTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(ACA_SE_RANGO_MONTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> ActivarInactivarAsync(ACA_SE_RANGO_MONTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
