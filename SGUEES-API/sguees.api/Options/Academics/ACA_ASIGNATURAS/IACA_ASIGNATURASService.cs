using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_ASIGNATURASService
    {
        Task<CResult> GetAllAsync(ACA_ASIGNATURASParam data);
        Task<CResult> GuardarAsync(ACA_ASIGNATURASTable data, bool update, string user, string station);
        Task<CResult> Carreras(int empresa);
        Task<CResult> MateriasPractica(int empresa, int facultad, int carrera);
        Task<CResult> AsignarPractica(int empresa, ACA_ASIGNATURAS_PRACTICAInput data, string user, string station);
        Task<CResult> Planes(int empresa, int asignatura);
        Task<CResult> GuardarPlan(int empresa, ACA_ASIGNATURAS_PLANInput data, string user, string station);
    }
}
