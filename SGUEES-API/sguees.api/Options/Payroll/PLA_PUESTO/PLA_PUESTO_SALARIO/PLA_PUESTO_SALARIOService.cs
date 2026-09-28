// Qué hace: servicio de salarios anidados en PLA_PUESTO.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class PLA_PUESTO_SALARIOService : IPLA_PUESTO_SALARIOService
	{
		private readonly IPLA_PUESTO_SALARIORepository _repo;

		public PLA_PUESTO_SALARIOService(IPLA_PUESTO_SALARIORepository repo)
		{
			_repo = repo;
		}

		public Task<CResult> GetAllAsync(PLA_PUESTO_SALARIOParam xWhere, int corrEmpresa)
			=> _repo.GetAllAsync(xWhere?.CORR_PUESTO ?? 0, corrEmpresa);

		public Task<CResult> CreateAsync(PLA_PUESTO_SALARIOTable Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION)
		{
			Data.CORR_EMPRESA = corrEmpresa;
			return _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public Task<CResult> UpdateAsync(PLA_PUESTO_SALARIOTable Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION)
		{
			Data.CORR_EMPRESA = corrEmpresa;
			return _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public Task<CResult> DeleteAsync(PLA_PUESTO_SALARIOTable Data, int corrEmpresa)
			=> _repo.DeleteAsync(Data, corrEmpresa);
	}
}
