using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_COTIZACION_DETA_DOCService
	{
		Task<CResult> GetAllAsync(COM_COTIZACION_DETA_DOCParam xWhere);
		Task<CResult> GetAsync(COM_COTIZACION_DETA_DOCParam xWhere);
		Task<CResult> CreateAsync(COM_COTIZACION_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_COTIZACION_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_COTIZACION_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CreateDocAsync(COM_COTIZACION_DETA_DOC_PDFTable Data, string pathRoot, string vLOGIN_SISTEMA, string vESTACION);
		Task<Stream> GetDocAsync(COM_COTIZACION_DETA_DOCParam xWhere);
	}
}
