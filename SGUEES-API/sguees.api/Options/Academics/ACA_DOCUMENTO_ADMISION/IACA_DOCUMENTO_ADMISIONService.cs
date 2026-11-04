// Qué hace: contrato del servicio ACA_DOCUMENTO_ADMISION.
// Cómo lo hace: declara GetAll/Get/CRUD y ActivarInactivar del catálogo.
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IACA_DOCUMENTO_ADMISIONService
	{
		Task<CResult> GetAllAsync(ACA_DOCUMENTO_ADMISIONParam xWhere);
		Task<CResult> GetAsync(ACA_DOCUMENTO_ADMISIONParam xWhere);
		Task<CResult> CreateAsync(ACA_DOCUMENTO_ADMISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(ACA_DOCUMENTO_ADMISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(ACA_DOCUMENTO_ADMISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(ACA_DOCUMENTO_ADMISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
