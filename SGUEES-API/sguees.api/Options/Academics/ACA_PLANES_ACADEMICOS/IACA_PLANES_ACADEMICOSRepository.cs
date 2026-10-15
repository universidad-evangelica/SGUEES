using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
namespace sguees.Repositories
{
    public interface IACA_PLANES_ACADEMICOSRepository
    {
        Task<CResult> GetAllAsync(ACA_PLANES_ACADEMICOSParam data);
        Task<CResult> GetModalidadesAsync(ACA_PLANES_ACADEMICOSParam data);
        Task<CResult> WriteAsync(int operation,ACA_PLANES_ACADEMICOSTable data,string user,string station);
    }
}
