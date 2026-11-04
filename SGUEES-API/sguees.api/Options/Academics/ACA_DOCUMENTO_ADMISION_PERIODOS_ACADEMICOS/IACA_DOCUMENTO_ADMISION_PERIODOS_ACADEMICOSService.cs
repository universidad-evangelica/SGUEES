// Qué hace: contrato del servicio de documentos por período.
// Cómo: lista documentos y marcas, y permite insertar o eliminar la relación.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface IACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSService
	{
		Task<CResult> GetAllAsync(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSParam xWhere);
		Task<CResult> GetAsync(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSParam xWhere);
		Task<CResult> GetAsignacionesAsync(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSParam xWhere);
		Task<CResult> CreateAsync(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSTable Data, string vUSER_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSTable Data, string vUSER_SISTEMA, string vESTACION);
	}
}
