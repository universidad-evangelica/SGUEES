using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class GEN_SEDESService : IGEN_SEDESService
    {
        private readonly IGEN_SEDESRepository _repo;

        public GEN_SEDESService(IGEN_SEDESRepository repo)
        {
            _repo = repo;
        }

        // Qué hace: sedes para el combo de la sección "Sedes de la Facultad".
        // Cómo lo hace: solo sedes activas (ESTADO_SEDE = 'A') de la empresa de la sesión.
        public async Task<CResult> GetCORR_SEDE_ACA_FACULTADES_SEDESAsync(GEN_SEDESParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "ESTADO_SEDE", Value = "A", DbType = System.Data.DbType.String },
            };
            return await _repo.GetCORR_SEDE_ACA_FACULTADES_SEDESAsync(p);
        }
    }
}
