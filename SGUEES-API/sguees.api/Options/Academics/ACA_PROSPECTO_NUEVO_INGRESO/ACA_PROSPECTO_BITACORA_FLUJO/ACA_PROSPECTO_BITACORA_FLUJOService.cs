using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PROSPECTO_BITACORA_FLUJOService : IACA_PROSPECTO_BITACORA_FLUJOService
    {
        private readonly IACA_PROSPECTO_BITACORA_FLUJORepository _repo;

        public ACA_PROSPECTO_BITACORA_FLUJOService(IACA_PROSPECTO_BITACORA_FLUJORepository repo)
        {
            _repo = repo;
        }

        // Qué hace: historial del flujo 104 del prospecto abierto.
        // Cómo lo hace: exige CORR_PROSPECTO para no devolver la bitácora de otras solicitudes.
        public async Task<CResult> GetAllAsync(ACA_PROSPECTO_BITACORA_FLUJOParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe indicar el prospecto" };

            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_PROSPECTO", Value = xWhere.CORR_PROSPECTO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAllAsync(p);
        }
    }
}
