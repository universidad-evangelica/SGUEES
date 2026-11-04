// Qué hace: servicio del catálogo tipos de institución.
// Cómo lo hace: arma CParameter y delega al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_TIPO_INSTITUCIONService : IGEN_TIPO_INSTITUCIONService
	{
		private readonly IGEN_TIPO_INSTITUCIONRepository _repo;

		public GEN_TIPO_INSTITUCIONService(IGEN_TIPO_INSTITUCIONRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_TIPO_INSTITUCIONParam xWhere)
		{
			return await _repo.GetAllAsync(new List<CParameter>());
		}

		public async Task<CResult> GetAsync(GEN_TIPO_INSTITUCIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_TIPO_INSTITUCION", Value = xWhere.CORR_TIPO_INSTITUCION, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public Task<CResult> CreateAsync(GEN_TIPO_INSTITUCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdateAsync(GEN_TIPO_INSTITUCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(GEN_TIPO_INSTITUCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> ActivarInactivarAsync(GEN_TIPO_INSTITUCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
