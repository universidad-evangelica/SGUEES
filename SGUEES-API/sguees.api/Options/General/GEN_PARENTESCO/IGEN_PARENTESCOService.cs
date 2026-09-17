// Qué hace: contrato del servicio GEN_PARENTESCO.
// Cómo lo hace: declara GetAll/Get/CRUD y ActivarInactivar del catálogo.
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PARENTESCOService
	{
		Task<CResult> GetAllAsync(GEN_PARENTESCOParam xWhere);
		Task<CResult> GetAsync(GEN_PARENTESCOParam xWhere);
		Task<CResult> CreateAsync(GEN_PARENTESCOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_PARENTESCOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_PARENTESCOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(GEN_PARENTESCOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
