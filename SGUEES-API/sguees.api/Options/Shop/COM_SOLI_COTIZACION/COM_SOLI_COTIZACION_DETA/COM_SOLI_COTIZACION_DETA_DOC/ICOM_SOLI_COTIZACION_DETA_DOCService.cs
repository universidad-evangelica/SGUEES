using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_SOLI_COTIZACION_DETA_DOCService
	{
		Task<CResult> GetAllAsync(COM_SOLI_COTIZACION_DETA_DOCParam xWhere);
		Task<CResult> GetAsync(COM_SOLI_COTIZACION_DETA_DOCParam xWhere);
		Task<CResult> CreateAsync(COM_SOLI_COTIZACION_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_SOLI_COTIZACION_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_SOLI_COTIZACION_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CreateDocAsync(COM_SOLI_COTIZACION_DETA_DOC_PDFTable Data, string pathRoot, string vLOGIN_SISTEMA, string vESTACION);
		Task<Stream> GetDocAsync(COM_SOLI_COTIZACION_DETA_DOCParam xWhere);
	}
}
