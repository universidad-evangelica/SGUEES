using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class GEN_TIPO_SANGREService : IGEN_TIPO_SANGREService
    {
        private readonly IGEN_TIPO_SANGRERepository _repo;

        public GEN_TIPO_SANGREService(IGEN_TIPO_SANGRERepository repo)
        {
            _repo = repo;
        }

        // Qué hace: tipos de sangre para los combos de la edición de prospectos.
        // Cómo lo hace: solo registros activos.
        public async Task<CResult> GetCORR_TIPO_SANGRE_ACA_PROSPECTOAsync(GEN_TIPO_SANGREParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="ACTIVO",Value=true,DbType=System.Data.DbType.Boolean},
            };

            return await _repo.GetCORR_TIPO_SANGRE_ACA_PROSPECTOAsync(p);
        }

        public async Task<CResult> GetAllAsync(GEN_TIPO_SANGREParam xWhere)
        {
            var p = new List<CParameter>();
            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(GEN_TIPO_SANGREParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_TIPO_SANGRE",Value=xWhere.CORR_TIPO_SANGRE,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(GEN_TIPO_SANGRETable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(GEN_TIPO_SANGRETable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(GEN_TIPO_SANGRETable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}
