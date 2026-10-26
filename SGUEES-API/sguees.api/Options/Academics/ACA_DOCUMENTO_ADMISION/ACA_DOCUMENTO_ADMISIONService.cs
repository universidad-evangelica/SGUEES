// Qué hace: capa de servicio del catálogo de documentos de admisión.
// Cómo lo hace: arma parámetros CParameter y delega al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class ACA_DOCUMENTO_ADMISIONService : IACA_DOCUMENTO_ADMISIONService
	{
		private readonly IACA_DOCUMENTO_ADMISIONRepository _repo;

		public ACA_DOCUMENTO_ADMISIONService(IACA_DOCUMENTO_ADMISIONRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(ACA_DOCUMENTO_ADMISIONParam xWhere)
		{
			var p = new List<CParameter>();
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(ACA_DOCUMENTO_ADMISIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = xWhere.CORR_DOCUMENTO_ADMISION, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(ACA_DOCUMENTO_ADMISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(ACA_DOCUMENTO_ADMISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(ACA_DOCUMENTO_ADMISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> ActivarInactivarAsync(ACA_DOCUMENTO_ADMISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
