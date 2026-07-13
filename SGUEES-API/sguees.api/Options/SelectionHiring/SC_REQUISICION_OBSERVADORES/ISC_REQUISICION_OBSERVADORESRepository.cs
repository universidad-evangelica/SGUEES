using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ISC_REQUISICION_OBSERVADORESRepository: IRepository<SC_REQUISICION_OBSERVADORESTable>
	{
		Task<CResult> GetAllBy_CORR_REQUISICION_PERSONAL(List<CParameter> xWhere);
		Task<CResult> CreateBy_CORR_REQUISICION_PERSONAL(SC_REQUISICION_OBSERVADORESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
