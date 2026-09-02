using System.IO;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface ISC_EXPEDIENTE_ENTREVISTA_DOCUMENTOService
	{
		Task<CResult> GetAllAsync(SC_EXPEDIENTE_ENTREVISTA_DOCUMENTOParam xWhere);
		Task<CResult> GetAsync(SC_EXPEDIENTE_ENTREVISTA_DOCUMENTOParam xWhere);
		Task<CResult> CreateAsync(SC_EXPEDIENTE_ENTREVISTA_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SC_EXPEDIENTE_ENTREVISTA_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SC_EXPEDIENTE_ENTREVISTA_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CreateDocAsync(SC_EXPEDIENTE_ENTREVISTA_DOCUMENTOUploadTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateDocAsync(SC_EXPEDIENTE_ENTREVISTA_DOCUMENTOUploadTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<Stream> GetDocAsync(SC_EXPEDIENTE_ENTREVISTA_DOCUMENTOParam xWhere);
	}
}
