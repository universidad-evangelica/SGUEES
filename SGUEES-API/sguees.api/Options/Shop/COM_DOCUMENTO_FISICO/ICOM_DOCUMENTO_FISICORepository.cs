using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICOM_DOCUMENTO_FISICORepository: IRepository<COM_DOCUMENTO_FISICOTable>
	{
		Task<CResult> UpdateRutaAsync(COM_DOCUMENTO_FISICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
