// Qué hace: servicio de bandas socioeconómico (rangos → puntaje).
// Cómo lo hace: arma CParameter y delega al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class ACA_SE_BANDAService : IACA_SE_BANDAService
	{
		private readonly IACA_SE_BANDARepository _repo;

		public ACA_SE_BANDAService(IACA_SE_BANDARepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(ACA_SE_BANDAParam xWhere)
		{
			var p = new List<CParameter>();
			if (xWhere?.CORR_BANDA > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_BANDA", Value = xWhere.CORR_BANDA, DbType = System.Data.DbType.Int32 });
			}
			if (!string.IsNullOrWhiteSpace(xWhere?.CODIGO_REGLA))
			{
				p.Add(new CParameter() { ParameterName = "CODIGO_REGLA", Value = xWhere.CODIGO_REGLA, DbType = System.Data.DbType.String });
			}
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(ACA_SE_BANDAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_BANDA", Value = xWhere.CORR_BANDA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public Task<CResult> CreateAsync(ACA_SE_BANDATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdateAsync(ACA_SE_BANDATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(ACA_SE_BANDATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> ActivarInactivarAsync(ACA_SE_BANDATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
