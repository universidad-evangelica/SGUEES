// Qué hace: contrato del servicio de salarios del puesto.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface IPLA_PUESTO_SALARIOService
	{
		Task<CResult> GetAllAsync(PLA_PUESTO_SALARIOParam xWhere, int corrEmpresa);
		Task<CResult> CreateAsync(PLA_PUESTO_SALARIOTable Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(PLA_PUESTO_SALARIOTable Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(PLA_PUESTO_SALARIOTable Data, int corrEmpresa);
	}
}
