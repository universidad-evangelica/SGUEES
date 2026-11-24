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
        public Task<CResult> Candidatas(int empresa, int area, DateTime fecha) => empresa > 0 && area > 0 && fecha != default
            ? repo.Candidatas(empresa, area, fecha)
            : Task.FromResult(new CResult { ErrorCode = 51000, ErrorMessage = "Seleccione el área y la fecha de inicio académico." });
        public Task<CResult> Oferta(int empresa, int id, int sede, DateTime fecha) => repo.Oferta(empresa, id, sede, fecha);
        public Task<CResult> Faltantes(int empresa, int id, byte[] version) => empresa > 0 && id > 0 && version?.Length == 8
            ? repo.Faltantes(empresa, id, version)
            : Task.FromResult(new CResult { ErrorCode = 51000, ErrorMessage = "Seleccione un ciclo actualizado." });
        public Task<CResult> Write(string operation, int empresa, ACA_CICLOInput input, string user, string station)
        {
            if (input == null || empresa <= 0 || string.IsNullOrWhiteSpace(user))
                return Task.FromResult(new CResult { ErrorCode = 51000, ErrorMessage = "No se recibió un ciclo o sesión válidos." });
            if (operation != "CREAR" && (input.CORR_CICLO_ACADEMICO <= 0 || input.VERSION_REGISTRO?.Length != 8))
                return Task.FromResult(new CResult { ErrorCode = 51009, ErrorMessage = "Actualice el ciclo antes de guardar. Falta su versión vigente." });
            if (operation == "FALTANTES" && input.HUELLA_FALTANTES?.Length != 32)
                return Task.FromResult(new CResult { ErrorCode = 51009, ErrorMessage = "Revise nuevamente la vista previa de carreras faltantes." });
            return repo.Write(operation, empresa, input, user, station);
        }
    }
}
