using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    // Qué hace: bitácora de cambios de una solicitud de nuevo ingreso.
    // Cómo lo hace: solo lee y guarda filas con TIPO_PROSPECTO = ACA_PROSPECTO.
    public class ACA_PROSPECTO_BITACORAService : IACA_PROSPECTO_BITACORAService
    {
        private readonly IACA_PROSPECTO_BITACORARepository _repo;

        public ACA_PROSPECTO_BITACORAService(IACA_PROSPECTO_BITACORARepository repo)
        {
            _repo = repo;
        }

        // Qué hace: historial de ediciones del prospecto abierto.
        // Cómo lo hace: exige el prospecto y deja fuera socioeconómico y beca.
        public async Task<CResult> GetAllAsync(ACA_PROSPECTO_BITACORAParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return Error("Debe indicar el prospecto");

            return await _repo.GetAllAsync(xWhere.CORR_PROSPECTO);
        }

        // Qué hace: deja constancia de los apartados que el usuario cambió al editar.
        // Cómo lo hace: el tipo lo fija el API en ACA_PROSPECTO; el login sale de la sesión.
        public async Task<CResult> InsertAsync(ACA_PROSPECTO_BITACORAParam xWhere, string login, string estacion)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return Error("Debe indicar el prospecto");
            if (string.IsNullOrWhiteSpace(xWhere.COMENTARIO))
                return Error("No hay cambios para registrar");
            if (string.IsNullOrWhiteSpace(login))
                return Error("No se identificó el usuario");

            return await _repo.InsertAsync(xWhere.CORR_PROSPECTO, xWhere.COMENTARIO.Trim(), login.Trim(), estacion);
        }

        private static CResult Error(string mensaje)
        {
            return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = mensaje };
        }
    }
}
