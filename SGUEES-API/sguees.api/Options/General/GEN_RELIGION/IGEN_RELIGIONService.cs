// Qué hace: contrato del servicio GEN_RELIGION.
// Cómo lo hace: declara GetAll/Get/CRUD y ActivarInactivar del catálogo.
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_RELIGIONService
	{
		Task<CResult> GetAllAsync(GEN_RELIGIONParam xWhere);
		Task<CResult> GetAsync(GEN_RELIGIONParam xWhere);
		Task<CResult> CreateAsync(GEN_RELIGIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_RELIGIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_RELIGIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(GEN_RELIGIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
