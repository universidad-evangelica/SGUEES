using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;
namespace sguees.Services
{
    public class ACA_CARRERAS_SEDESService : IACA_CARRERAS_SEDESService
    {
        private readonly IACA_CARRERAS_SEDESRepository _repo;
        public ACA_CARRERAS_SEDESService(IACA_CARRERAS_SEDESRepository repo) { _repo = repo; }
        public Task<CResult> GetAllAsync(ACA_CARRERAS_SEDESParam data) => _repo.GetAllAsync(data);
        public Task<CResult> GetSedesAsync(ACA_CARRERAS_SEDESParam data) => _repo.GetSedesAsync(data);
        public Task<CResult> CreateAsync(ACA_CARRERAS_SEDESTable data, string user, string station) => Write(1, data, user, station);
        public Task<CResult> ActivarInactivarAsync(ACA_CARRERAS_SEDESTable data, string user, string station) => Write(2, data, user, station);
        private Task<CResult> Write(int operation, ACA_CARRERAS_SEDESTable data, string user, string station)
            => data.CORR_EMPRESA <= 0 || data.CORR_CARRERA <= 0 || data.CORR_SEDE <= 0
                ? Task.FromResult(new CResult { ErrorCode = 51000, ErrorMessage = "Seleccione una carrera guardada y una sede válida." })
                : _repo.WriteAsync(operation, data, user, station);
    }
}
