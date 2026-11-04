using System.IO;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PROVEEDOR_DOCService
	{
		Task<CResult> GetAllAsync(GEN_PROVEEDOR_DOCParam xWhere);
		Task<CResult> GetAsync(GEN_PROVEEDOR_DOCParam xWhere);
		Task<CResult> UploadAsync(GEN_PROVEEDOR_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_PROVEEDOR_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<Stream> GetDocAsync(GEN_PROVEEDOR_DOCParam xWhere);
	}
}
