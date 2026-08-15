using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    public interface ISC_SOLICITUD_EMPLEO_PUBLICORepository
    {
        Task<CResult> GetSolicitudAsync(List<CParameter> xWhere);
        Task<CResult> GetAllTokenAsync(List<CParameter> xWhere);
        Task<CResult> GenerarTokenAsync(SC_SOLICITUD_EMPLEO_TOKENTable data);
        Task<CResult> ActualizarEstadoTokenAsync(int corrEmpresa, int corrToken, string estadoToken);
        Task<CResult> ValidarTokenAsync(string tokenHash);
        Task<CResult> CompletarAsync(string tokenHash, SC_SOLICITUD_EMPLEO_COMPLETARParam data);
        Task<int> ObtenerCorrEmpresaPorTokenHashAsync(string tokenHash);
        Task<CResult> ActualizarFotoUrlAsync(int corrPersonaDatos, int corrEmpresa, string fotoUrl);
    }
}
