using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_SE_OPCIONService : IACA_SE_OPCIONService
    {
        private readonly IACA_SE_OPCIONRepository _repo;

        public ACA_SE_OPCIONService(IACA_SE_OPCIONRepository repo)
        {
            _repo = repo;
        }

        // Qué hace: opciones de las preguntas del estudio socioeconómico para los combos de la edición de prospectos.
        // Cómo lo hace: solo registros activos; filtra por CORR_PREGUNTA si se envía.
        public async Task<CResult> GetCORR_OPCION_ACA_PROSPECTOAsync(ACA_SE_OPCIONParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="ACTIVO",Value=true,DbType=System.Data.DbType.Boolean},
            };

            if (xWhere.CORR_PREGUNTA > 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_PREGUNTA",Value=xWhere.CORR_PREGUNTA,DbType=System.Data.DbType.Int32});
            }

            return await _repo.GetCORR_OPCION_ACA_PROSPECTOAsync(p);
        }

        public async Task<CResult> GetAllAsync(ACA_SE_OPCIONParam xWhere)
        {
            var p = new List<CParameter>();
            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(ACA_SE_OPCIONParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_OPCION",Value=xWhere.CORR_OPCION,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(ACA_SE_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(ACA_SE_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_SE_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}
