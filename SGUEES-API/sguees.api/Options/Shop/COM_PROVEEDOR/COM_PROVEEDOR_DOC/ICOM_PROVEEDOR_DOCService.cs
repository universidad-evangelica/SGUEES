using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ICOM_PROVEEDOR_DOCService
	{
		Task<CResult> GetAllAsync(COM_PROVEEDOR_DOCParam xWhere);
		Task<CResult> GetAsync(COM_PROVEEDOR_DOCParam xWhere);
		Task<CResult> CreateAsync(COM_PROVEEDOR_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_PROVEEDOR_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_PROVEEDOR_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CreateDocAsync(COM_PROVEEDOR_DOC_PDFTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<Stream> GetDocAsync(COM_PROVEEDOR_DOCParam xWhere);
	}
}
