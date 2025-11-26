using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ICOM_CUADRO_COMPARATIVO_DOCService
	{
		Task<CResult> GetAllAsync(COM_CUADRO_COMPARATIVO_DOCParam xWhere);
		Task<CResult> GetAsync(COM_CUADRO_COMPARATIVO_DOCParam xWhere);
		Task<CResult> CreateAsync(COM_CUADRO_COMPARATIVO_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_CUADRO_COMPARATIVO_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_CUADRO_COMPARATIVO_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CreateDocAsync(COM_CUADRO_COMPARATIVO_DOC_PDFTable Data, string pathRoot, string vLOGIN_SISTEMA, string vESTACION);
		Task<Stream> GetDocAsync(COM_CUADRO_COMPARATIVO_DOCParam xWhere);
	}
}
