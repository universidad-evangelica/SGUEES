using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class SC_REQUISICION_CANDIDATOService : ISC_REQUISICION_CANDIDATOService
	{
		private readonly ISC_REQUISICION_CANDIDATORepository _repo;

		public SC_REQUISICION_CANDIDATOService(ISC_REQUISICION_CANDIDATORepository repo)
		{
			_repo = repo;
		}

		public Task<CResult> DecideAsync(SC_REQUISICION_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return _repo.DecideAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public Task<CResult> GetPostulacionesExpedienteAsync(SC_REQUISICION_CANDIDATOParam xWhere)
		{
			return _repo.GetPostulacionesExpedienteAsync(xWhere);
		}
	}
}
