// Qué hace: contrato del servicio PLA_SEGURO_SOCIAL.
// Cómo lo hace: declara GetAll/Get/CRUD y ActivarInactivar.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface IPLA_SEGURO_SOCIALService
	{
		Task<CResult> GetAllAsync(PLA_SEGURO_SOCIALParam xWhere);
		Task<CResult> GetAsync(PLA_SEGURO_SOCIALParam xWhere);
		Task<CResult> CreateAsync(PLA_SEGURO_SOCIALTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(PLA_SEGURO_SOCIALTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(PLA_SEGURO_SOCIALTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(PLA_SEGURO_SOCIALTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
