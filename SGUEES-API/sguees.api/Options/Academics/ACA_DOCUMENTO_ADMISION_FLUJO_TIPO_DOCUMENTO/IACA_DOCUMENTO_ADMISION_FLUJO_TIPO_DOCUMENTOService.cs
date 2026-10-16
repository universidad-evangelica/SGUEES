// Qué hace: contrato del servicio de documentos por solicitud.
// Cómo: declara el browse de tipos ACA_PROSPECTO, el catálogo y el alta o baja de la asignación.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface IACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOService
	{
		Task<CResult> GetAllAsync(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOParam xWhere);
		Task<CResult> GetAsync(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOParam xWhere);
		Task<CResult> GetAsignacionesAsync(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOParam xWhere);
		Task<CResult> GetDocumentosAsync();
		Task<CResult> CreateAsync(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOTable Data, string vUSER_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOTable Data, string vUSER_SISTEMA, string vESTACION);
	}
}
