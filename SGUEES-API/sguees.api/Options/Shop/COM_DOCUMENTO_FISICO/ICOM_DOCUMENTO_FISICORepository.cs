using eFramework.Core;
using eFramework.Data;
using scuees.Models;

namespace scuees.Repositories
{
	public interface ICOM_DOCUMENTO_FISICORepository: IRepository<COM_DOCUMENTO_FISICOTable>
	{
		Task<CResult> UpdateRutaAsync(COM_DOCUMENTO_FISICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
