using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PROSPECTO_DOCUMENTOService : IACA_PROSPECTO_DOCUMENTOService
    {
        private readonly IACA_PROSPECTO_DOCUMENTORepository _repo;

        public ACA_PROSPECTO_DOCUMENTOService(IACA_PROSPECTO_DOCUMENTORepository repo)
        {
            _repo = repo;
        }

        // Qué hace: documentos que aplican a esta solicitud de nuevo ingreso.
        // Cómo lo hace: exige CORR_PROSPECTO porque eFramework omite del WHERE los enteros en 0.
        public async Task<CResult> GetAllAsync(ACA_PROSPECTO_DOCUMENTOParam xWhere)
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
