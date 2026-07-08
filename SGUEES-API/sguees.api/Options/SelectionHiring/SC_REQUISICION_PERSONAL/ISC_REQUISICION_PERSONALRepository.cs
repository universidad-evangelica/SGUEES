using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;


namespace SGUEES.Repositories
{
    public interface ISC_REQUISICION_PERSONALRepository: IRepository<SC_REQUISICION_PERSONALTable>
    {
        Task<CResult> GetAllAsyncBitacoraByCORR_REQUISICION(List<CParameter> xWhere);
    }
}
