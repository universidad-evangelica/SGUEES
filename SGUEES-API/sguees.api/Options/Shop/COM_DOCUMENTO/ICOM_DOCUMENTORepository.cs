using eFramework.Data;
using eadmindevprojectmanagement.Models;
using eFramework.Core;

namespace eadmindevprojectmanagement.Repositories
{
	public interface ICOM_DOCUMENTORepository : IRepository<COM_DOCUMENTOTable>
	{
		Task<CResult> AplicarAsync(COM_DOCUMENTOTable Data);
		Task<CResult> DesAplicarAsync(COM_DOCUMENTOTable Data);
		Task<CResult> GetAllAplicadosAsync(List<CParameter> xWhere);
		Task<CResult> GetAllJsonAsync(List<CParameter> xWhere);
		Task<CResult> RelacionarDocumentoElctronico(COM_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetAllDocumentosDisponiblesAsync(List<CParameter> xWhere);
		Task<CResult> GenerarCRAsync(COM_DOCUMENTO_CRTable Data);
		Task<CResult> AnularCRAsync(COM_DOCUMENTO_ANULAR_CRTable Data);
		Task<CResult> GetAllDocumentosCRAsync(List<CParameter> xWhere);
		Task<CResult> GetAllAnularAsync(List<CParameter> xWhere);
	}
}
