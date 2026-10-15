using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
namespace sguees.Services
{
    public interface IACA_PLANES_ACADEMICOSService
    {
        Task<CResult> GetAllAsync(ACA_PLANES_ACADEMICOSParam data);
        Task<CResult> GetModalidadesAsync(ACA_PLANES_ACADEMICOSParam data);
        Task<CResult> CreateAsync(ACA_PLANES_ACADEMICOSTable data,string user,string station);
        Task<CResult> UpdateAsync(ACA_PLANES_ACADEMICOSTable data,string user,string station);
        Task<CResult> CambiarVigenciaAsync(ACA_PLANES_ACADEMICOSTable data,string user,string station);
    }
}
