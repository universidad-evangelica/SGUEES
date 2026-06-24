using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface ISC_TIPO_CONTRATACIONRepository: IRepository<SC_TIPO_CONTRATACIONTable>
	{
        Task<CResult> DesactivateAsync(SC_TIPO_CONTRATACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> ReactivateAsync(SC_TIPO_CONTRATACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
