using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class GEN_LIMITACIONES_FISICAService : IGEN_LIMITACIONES_FISICAService
    {
        private readonly IGEN_LIMITACIONES_FISICARepository _repo;

        public GEN_LIMITACIONES_FISICAService(IGEN_LIMITACIONES_FISICARepository repo)
        {
            _repo = repo;
        }

        // Qué hace: limitaciones físicas para los combos de la edición de prospectos.
        // Cómo lo hace: solo registros activos.
        public async Task<CResult> GetCORR_LIMITACION_FISICA_ACA_PROSPECTOAsync(GEN_LIMITACIONES_FISICAParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="ACTIVO",Value=true,DbType=System.Data.DbType.Boolean},
            };

            return await _repo.GetCORR_LIMITACION_FISICA_ACA_PROSPECTOAsync(p);
        }

        public async Task<CResult> GetAllAsync(GEN_LIMITACIONES_FISICAParam xWhere)
        {
            var p = new List<CParameter>();
            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(GEN_LIMITACIONES_FISICAParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_LIMITACION_FISICA",Value=xWhere.CORR_LIMITACION_FISICA,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(GEN_LIMITACIONES_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(GEN_LIMITACIONES_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(GEN_LIMITACIONES_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}
