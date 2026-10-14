using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class GEN_SEXOService : IGEN_SEXOService
    {
        private readonly IGEN_SEXORepository _repo;

        public GEN_SEXOService(IGEN_SEXORepository repo)
        {
            _repo = repo;
        }

        // Qué hace: sexos para los combos de la edición de prospectos.
        // Cómo lo hace: solo registros activos.
        public async Task<CResult> GetCORR_SEXO_ACA_PROSPECTOAsync(GEN_SEXOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="ACTIVO",Value=true,DbType=System.Data.DbType.Boolean},
            };

            return await _repo.GetCORR_SEXO_ACA_PROSPECTOAsync(p);
        }

        public async Task<CResult> GetAllAsync(GEN_SEXOParam xWhere)
        {
            var p = new List<CParameter>();
            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(GEN_SEXOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_SEXO",Value=xWhere.CORR_SEXO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(GEN_SEXOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(GEN_SEXOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(GEN_SEXOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}
