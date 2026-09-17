// Qué hace: contrato del servicio GEN_TIPO_CONTACTO.
// Cómo lo hace: declara GetAll/Get/CRUD y ActivarInactivar del catálogo.
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_TIPO_CONTACTOService
	{
		Task<CResult> GetAllAsync(GEN_TIPO_CONTACTOParam xWhere);
		Task<CResult> GetAsync(GEN_TIPO_CONTACTOParam xWhere);
		Task<CResult> CreateAsync(GEN_TIPO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_TIPO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_TIPO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(GEN_TIPO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
