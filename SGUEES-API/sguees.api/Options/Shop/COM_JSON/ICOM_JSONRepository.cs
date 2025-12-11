using System.Threading.Tasks;
using eFrameworkAPI.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICOM_JSONRepository
	{
		Task<CResult<int>> COM_JSON_GENERAR_CCFE(COM_JSON_DTE_CCFE Data, string Token);
		Task<CResult<int>> COM_JSON_GENERAR_FE(COM_JSON_DTE_FE Data, string Token);
		Task<CResult<COM_JSON_DOCTable>> PostPDFDesktop(COM_JSON_DOC_PDFTable Data, string Token);
		Task<CResult<SEG_USUARIO_LOGINView>> Login(SEG_USUARIO_LOGINParam Data);
		Task<Stream> GetDocAsync(COM_JSON_DOCParam Data, string Token);
		Task<CResult<int>> COM_JSON_GENERAR_DCLE(COM_JSON_DTE_DCLE Data, string Token);
	}
}
