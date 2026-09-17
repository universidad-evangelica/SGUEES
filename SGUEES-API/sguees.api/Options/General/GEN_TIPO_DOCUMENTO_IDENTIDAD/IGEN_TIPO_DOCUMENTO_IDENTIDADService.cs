// Qué hace: contrato del servicio GEN_TIPO_DOCUMENTO_IDENTIDAD.
// Cómo lo hace: declara GetAll/Get/CRUD y ActivarInactivar del catálogo.
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_TIPO_DOCUMENTO_IDENTIDADService
	{
		Task<CResult> GetAllAsync(GEN_TIPO_DOCUMENTO_IDENTIDADParam xWhere);
		Task<CResult> GetAsync(GEN_TIPO_DOCUMENTO_IDENTIDADParam xWhere);
		Task<CResult> CreateAsync(GEN_TIPO_DOCUMENTO_IDENTIDADTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_TIPO_DOCUMENTO_IDENTIDADTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_TIPO_DOCUMENTO_IDENTIDADTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(GEN_TIPO_DOCUMENTO_IDENTIDADTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
