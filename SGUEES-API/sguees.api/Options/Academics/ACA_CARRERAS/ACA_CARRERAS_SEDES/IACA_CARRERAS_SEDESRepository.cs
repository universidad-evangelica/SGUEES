using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
namespace sguees.Repositories
{
    public interface IACA_CARRERAS_SEDESRepository
    {
        Task<CResult> GetAllAsync(ACA_CARRERAS_SEDESParam data);
        Task<CResult> GetSedesAsync(ACA_CARRERAS_SEDESParam data);
        Task<CResult> WriteAsync(int operation, ACA_CARRERAS_SEDESTable data, string user, string station);
    }
}
