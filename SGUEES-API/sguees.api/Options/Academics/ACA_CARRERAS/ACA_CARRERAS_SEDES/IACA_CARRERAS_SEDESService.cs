using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
namespace sguees.Services
{
    public interface IACA_CARRERAS_SEDESService
    {
        Task<CResult> GetAllAsync(ACA_CARRERAS_SEDESParam data);
        Task<CResult> GetSedesAsync(ACA_CARRERAS_SEDESParam data);
        Task<CResult> CreateAsync(ACA_CARRERAS_SEDESTable data,string user,string station);
        Task<CResult> ActivarInactivarAsync(ACA_CARRERAS_SEDESTable data,string user,string station);
    }
}
