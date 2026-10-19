using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class GEN_ESTADO_CIVILService : IGEN_ESTADO_CIVILService
    {
        private readonly IGEN_ESTADO_CIVILRepository _repo;

        public GEN_ESTADO_CIVILService(IGEN_ESTADO_CIVILRepository repo)
        {
            _repo = repo;
        }

        // Qué hace: estados civiles para los combos de la edición de prospectos.
        // Cómo lo hace: solo registros activos.
        public async Task<CResult> GetCORR_ESTADO_CIVIL_ACA_PROSPECTOAsync(GEN_ESTADO_CIVILParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="ACTIVO",Value=true,DbType=System.Data.DbType.Boolean},
            };

            return await _repo.GetCORR_ESTADO_CIVIL_ACA_PROSPECTOAsync(p);
        }

        public async Task<CResult> GetAllAsync(GEN_ESTADO_CIVILParam xWhere)
        {
            var p = new List<CParameter>();
            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(GEN_ESTADO_CIVILParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_ESTADO_CIVIL",Value=xWhere.CORR_ESTADO_CIVIL,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(GEN_ESTADO_CIVILTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(GEN_ESTADO_CIVILTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(GEN_ESTADO_CIVILTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}
