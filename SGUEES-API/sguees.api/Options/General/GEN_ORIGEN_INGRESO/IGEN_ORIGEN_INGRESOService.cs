// Qué hace: contrato del servicio GEN_ORIGEN_INGRESO.
// Cómo lo hace: declara GetAll/Get/CRUD y ActivarInactivar del catálogo.
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_ORIGEN_INGRESOService
	{
		Task<CResult> GetAllAsync(GEN_ORIGEN_INGRESOParam xWhere);
		Task<CResult> GetAsync(GEN_ORIGEN_INGRESOParam xWhere);
		Task<CResult> CreateAsync(GEN_ORIGEN_INGRESOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_ORIGEN_INGRESOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_ORIGEN_INGRESOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(GEN_ORIGEN_INGRESOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
