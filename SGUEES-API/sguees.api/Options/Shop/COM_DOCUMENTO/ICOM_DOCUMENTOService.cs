using System.Threading.Tasks;
using eFramework.Core;
using eadmindevprojectmanagement.Models;

namespace eadmindevprojectmanagement.Services
{
	public interface ICOM_DOCUMENTOService
	{
		Task<CResult> GetAllAsync(COM_DOCUMENTOParam xWhere);
		Task<CResult> GetAsync(COM_DOCUMENTOParam xWhere);
		Task<CResult> CreateAsync(COM_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AplicarAsync(COM_DOCUMENTOTable Data);
		Task<CResult> GenerarCRAsync(COM_DOCUMENTO_CRTable Data);
		Task<CResult> GetAllDesAplicarAsync(COM_DOCUMENTOParam xWhere);
		Task<CResult> DesAplicarAsync(COM_DOCUMENTOTable Data);
		Task<CResult> GetAllJsonAsync(COM_DOCUMENTOParam xWhere);
		Task<CResult> GetAllDocumentosDisponiblesAsync(COM_DOCUMENTOParam xWhere);
		Task<CResult> AnularCRAsync(COM_DOCUMENTO_ANULAR_CRTable Data);
		Task<CResult> GetAllDocumentosCRAsync(COM_DOCUMENTOParam xWhere);
		Task<CResult> GetAllAnularAsync(COM_DOCUMENTOParam xWhere);
	

	}
}
