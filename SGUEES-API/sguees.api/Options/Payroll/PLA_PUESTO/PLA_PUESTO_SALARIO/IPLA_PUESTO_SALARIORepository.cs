// Qué hace: contrato del repositorio de salarios del puesto.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface IPLA_PUESTO_SALARIORepository
	{
		Task<CResult> GetAllAsync(int corrPuesto, int corrEmpresa);
		Task<CResult> CreateAsync(PLA_PUESTO_SALARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(PLA_PUESTO_SALARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(PLA_PUESTO_SALARIOTable Data, int corrEmpresa);
	}
}
