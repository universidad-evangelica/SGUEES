using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ICOM_SOLI_COTIZACION_DOCService
	{
		Task<CResult> GetAllAsync(COM_SOLI_COTIZACION_DOCParam xWhere);
		Task<CResult> GetAsync(COM_SOLI_COTIZACION_DOCParam xWhere);
		Task<CResult> CreateAsync(COM_SOLI_COTIZACION_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_SOLI_COTIZACION_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_SOLI_COTIZACION_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CreateDocAsync(COM_SOLI_COTIZACION_DOC_PDF Data, string pathRoot, string vLOGIN_SISTEMA, string vESTACION);
		Task<Stream> GetDocAsync(COM_SOLI_COTIZACION_DOCParam xWhere);
	}
}
