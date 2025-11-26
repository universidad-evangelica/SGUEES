using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ICOM_COTIZACION_DOCService
	{
		Task<CResult> GetAllAsync(COM_COTIZACION_DOCParam xWhere);
		Task<CResult> GetAsync(COM_COTIZACION_DOCParam xWhere);
		Task<CResult> CreateAsync(COM_COTIZACION_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_COTIZACION_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_COTIZACION_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CreateDocAsync(COM_COTIZACION_DOC_PDFTable Data, string pathRoot, string vLOGIN_SISTEMA, string vESTACION);
		Task<Stream> GetDocAsync(COM_COTIZACION_DOCParam xWhere);
		Task<CResult> GetAllCOM_CUADRO_COMPARATIVOAsync(COM_CUADRO_COMPARATIVOParam xWhere);
	}
}
