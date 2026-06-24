using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ISC_TIPO_VACANTERepository: IRepository<SC_TIPO_VACANTETable>
	{
        Task<CResult> DesactivateAsync(SC_TIPO_VACANTETable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> ReactivateAsync(SC_TIPO_VACANTETable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
