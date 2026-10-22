using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_CICLOSService : IACA_CICLOSService
    {
        private readonly IACA_CICLOSRepository repo;
        public ACA_CICLOSService(IACA_CICLOSRepository repo) { this.repo = repo; }
        public Task<CResult> Areas(int empresa) => repo.Areas(empresa);
        public Task<CResult> Listar(int empresa, int area) => repo.Listar(empresa, area);
        public Task<CResult> Detalle(int empresa, int id) => repo.Detalle(empresa, id);
        public Task<CResult> Catalogos(int empresa) => repo.Catalogos(empresa);
        public Task<CResult> Oferta(int empresa, int id, int sede, DateTime fecha) => repo.Oferta(empresa, id, sede, fecha);
        public Task<CResult> Write(string operation, int empresa, ACA_CICLOInput input, string user, string station) => repo.Write(operation, empresa, input, user, station);
    }
}
