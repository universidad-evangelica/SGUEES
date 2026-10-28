// Qué hace: servicio del catálogo opciones socioeconómico.
// Cómo lo hace: arma CParameter y delega al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class ACA_SE_OPCIONService : IACA_SE_OPCIONService
	{
		private readonly IACA_SE_OPCIONRepository _repo;

		public ACA_SE_OPCIONService(IACA_SE_OPCIONRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(ACA_SE_OPCIONParam xWhere)
		{
			var p = new List<CParameter>();
			if (xWhere?.CORR_PREGUNTA > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_PREGUNTA", Value = xWhere.CORR_PREGUNTA, DbType = System.Data.DbType.Int32 });
			}
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(ACA_SE_OPCIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_OPCION", Value = xWhere.CORR_OPCION, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public Task<CResult> CreateAsync(ACA_SE_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdateAsync(ACA_SE_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(ACA_SE_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> ActivarInactivarAsync(ACA_SE_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
