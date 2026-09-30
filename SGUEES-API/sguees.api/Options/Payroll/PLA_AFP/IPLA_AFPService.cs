// Qué hace: contrato del servicio PLA_AFP.
// Cómo lo hace: declara GetAll/Get/CRUD y ActivarInactivar.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface IPLA_AFPService
	{
		Task<CResult> GetAllAsync(PLA_AFPParam xWhere);
		Task<CResult> GetAsync(PLA_AFPParam xWhere);
		Task<CResult> CreateAsync(PLA_AFPTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(PLA_AFPTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(PLA_AFPTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(PLA_AFPTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
