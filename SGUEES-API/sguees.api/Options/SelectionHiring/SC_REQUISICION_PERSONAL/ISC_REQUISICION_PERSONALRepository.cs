using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;


namespace SGUEES.Repositories
{
    public interface ISC_REQUISICION_PERSONALRepository: IRepository<SC_REQUISICION_PERSONALTable>
    {
        Task<CResult> GetAllAsyncBitacoraByCORR_REQUISICION(List<CParameter> xWhere);
        Task<CResult> GetAllAsyncCandidatosByCORR_REQUISICION(List<CParameter> xWhere);
        Task<CResult> AutorizaAsync(SC_REQUISICION_PERSONAL_AUTORIZAParam Data, string vLOGIN_SISTEMA);
        /// <summary>Unidad del puesto del creador (o del login si aún no hay USUARIO_CREA).</summary>
        Task<int> ResolverUnidadCreadorAsync(int corrEmpresa, int corrRequisicion, string loginFallback);
    }
}
