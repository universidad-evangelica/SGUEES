using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ICOM_JSONService
	{
		Task<CResult> COM_JSON_GENERAR_CCFE(COM_JSON_DTE_CCFE Data, int CORR_EMPRESA);
		Task<CResult> COM_JSON_GENERAR_FE(COM_JSON_DTE_FE Data, int CORR_EMPRESA);
		Task<CResult> PostPDFAsync(COM_JSON_DOC_PDFTable Data, int CORR_EMPRESA);
		Task<Stream> GetDocAsync(COM_JSON_DOCParam xWhere);
		Task<CResult> COM_JSON_GENERAR_DCLE(COM_JSON_DTE_DCLE Data,int CORR_EMPRESA);
		Task<CResult> CreateDocAsync(COM_JSON_DOC_PDFTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
