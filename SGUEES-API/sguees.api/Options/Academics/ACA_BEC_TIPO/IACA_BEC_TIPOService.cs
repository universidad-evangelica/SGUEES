using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface IACA_BEC_TIPOService
    {
        Task<CResult> GetAllAsync(ACA_BEC_TIPOParam xWhere);
        Task<CResult> GetAsync(ACA_BEC_TIPOParam xWhere);
        Task<CResult> CreateAsync(ACA_BEC_TIPOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(ACA_BEC_TIPOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(ACA_BEC_TIPOTable Data, string vLOGIN_SISTEMA, string vESTACION);
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
    }
}
