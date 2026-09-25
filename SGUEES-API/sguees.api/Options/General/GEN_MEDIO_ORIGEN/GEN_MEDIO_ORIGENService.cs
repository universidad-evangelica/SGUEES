using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class GEN_MEDIO_ORIGENService : IGEN_MEDIO_ORIGENService
    {
        private readonly IGEN_MEDIO_ORIGENRepository _repo;

        public GEN_MEDIO_ORIGENService(IGEN_MEDIO_ORIGENRepository repo)
        {
            _repo = repo;
        }

        // Qué hace: medios de origen para los combos de la edición de prospectos.
        // Cómo lo hace: solo registros activos; filtra por CORR_EMPRESA si se envía.
        public async Task<CResult> GetCORR_MEDIO_ORIGEN_ACA_PROSPECTOAsync(GEN_MEDIO_ORIGENParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="ACTIVO",Value=true,DbType=System.Data.DbType.Boolean},
            };

            if (xWhere.CORR_EMPRESA > 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
            }

            return await _repo.GetCORR_MEDIO_ORIGEN_ACA_PROSPECTOAsync(p);
        }

        public async Task<CResult> GetAllAsync(GEN_MEDIO_ORIGENParam xWhere)
        {
            var p = new List<CParameter>();
            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(GEN_MEDIO_ORIGENParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_MEDIO_ORIGEN",Value=xWhere.CORR_MEDIO_ORIGEN,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(GEN_MEDIO_ORIGENTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(GEN_MEDIO_ORIGENTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(GEN_MEDIO_ORIGENTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}
