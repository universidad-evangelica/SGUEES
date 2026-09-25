// Qué hace: capa de servicio del catálogo parentesco.
// Cómo lo hace: arma parámetros CParameter y delega al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_PARENTESCOService : IGEN_PARENTESCOService
	{
		private readonly IGEN_PARENTESCORepository _repo;

		public GEN_PARENTESCOService(IGEN_PARENTESCORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_PARENTESCOParam xWhere)
		{
			var p = new List<CParameter>();
			return await _repo.GetAllAsync(p);
		}

		// Qué hace: parentescos para los familiares del prospecto (/aca-prospecto).
		// Cómo lo hace: solo los activos, sin alterar la consulta del mantenimiento del catálogo.
		public async Task<CResult> GetCORR_PARENTESCO_ACA_PROSPECTOAsync(GEN_PARENTESCOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "ACTIVO_PARENTESCO", Value = true, DbType = System.Data.DbType.Boolean },
			};

			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(GEN_PARENTESCOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PARENTESCO", Value = xWhere.CORR_PARENTESCO, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(GEN_PARENTESCOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(GEN_PARENTESCOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(GEN_PARENTESCOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> ActivarInactivarAsync(GEN_PARENTESCOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
