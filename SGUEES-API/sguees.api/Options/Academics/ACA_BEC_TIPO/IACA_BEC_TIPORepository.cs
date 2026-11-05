using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface IACA_BEC_TIPORepository : IRepository<ACA_BEC_TIPOTable>
    {
        Task<CResult> CuestionariosAsync(int empresa);
        Task<CResult> PlantillasFormularioAsync(int empresa);
        Task<CResult> ContenidoCuestionarioAsync(int empresa,int beca,int version);
        Task<CResult> GuardarCuestionarioAsync(string operacion,BecaCuestionarioCambio data,string usuario,string estacion);
        Task<CResult> FormulariosAsync(int empresa);
        Task<CResult> VersionesAsync(int empresa);
        Task<CResult> AsignacionesAsync(int empresa,int beca);
        Task<CResult> CiclosFormularioAsync(int empresa);
        Task<CResult> GuardarFormularioAsync(string operacion,BecaFormularioCambio data,string usuario,string estacion);
        Task<CResult> ActivarInactivarAsync(ACA_BEC_TIPOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> GetOrigenesAsync(int corrEmpresa);
        Task<CResult> GetConveniosAsync(int corrEmpresa);
        Task<bool> ConvenioEstaVigenteAsync(int corrEmpresa, int corrConvenio);
    }
}
