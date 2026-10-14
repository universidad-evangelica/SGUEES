using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class GEN_SECTOR_LABORALService : IGEN_SECTOR_LABORALService
    {
        private readonly IGEN_SECTOR_LABORALRepository _repo;

        public GEN_SECTOR_LABORALService(IGEN_SECTOR_LABORALRepository repo)
        {
            _repo = repo;
        }

        // Qué hace: sectores laborales para los combos de la edición de prospectos.
        // Cómo lo hace: catálogo completo (la tabla no tiene indicador de activo).
        public async Task<CResult> GetCORR_SECTOR_LABORAL_ACA_PROSPECTOAsync(GEN_SECTOR_LABORALParam xWhere)
        {
            var p = new List<CParameter>
            {

            };

            return await _repo.GetCORR_SECTOR_LABORAL_ACA_PROSPECTOAsync(p);
        }

        public async Task<CResult> GetAllAsync(GEN_SECTOR_LABORALParam xWhere)
        {
            var p = new List<CParameter>();
            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(GEN_SECTOR_LABORALParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_SECTOR_LABORAL",Value=xWhere.CORR_SECTOR_LABORAL,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(GEN_SECTOR_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(GEN_SECTOR_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(GEN_SECTOR_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}
