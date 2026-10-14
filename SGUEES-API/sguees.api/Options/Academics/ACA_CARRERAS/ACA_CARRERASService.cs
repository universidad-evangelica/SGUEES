using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_CARRERASService : IACA_CARRERASService
    {
        private readonly IACA_CARRERASRepository _repo;

        public ACA_CARRERASService(IACA_CARRERASRepository repo)
        {
            _repo = repo;
        }

        // Qué hace: carreras para los combos de la edición de prospectos.
        // Cómo lo hace: solo registros activos; filtra por CORR_EMPRESA si se envía.
        public async Task<CResult> GetCORR_CARRERA_ACA_PROSPECTOAsync(ACA_CARRERASParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="ACTIVO",Value=true,DbType=System.Data.DbType.Boolean},
            };

            if (xWhere.CORR_EMPRESA > 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
            }

            return await _repo.GetCORR_CARRERA_ACA_PROSPECTOAsync(p);
        }

        public async Task<CResult> GetAllAsync(ACA_CARRERASParam xWhere)
        {
            var p = new List<CParameter>();
            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(ACA_CARRERASParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_CARRERA",Value=xWhere.CORR_CARRERA,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(ACA_CARRERASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(ACA_CARRERASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_CARRERASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}
