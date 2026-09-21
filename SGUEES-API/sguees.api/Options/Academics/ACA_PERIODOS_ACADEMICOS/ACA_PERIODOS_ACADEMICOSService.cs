using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PERIODOS_ACADEMICOSService : IACA_PERIODOS_ACADEMICOSService
    {
        private readonly IACA_PERIODOS_ACADEMICOSRepository _repo;

        public ACA_PERIODOS_ACADEMICOSService(IACA_PERIODOS_ACADEMICOSRepository repo)
        {
            _repo = repo;
        }

        // Qué hace: ciclos de pregrado para el combo de la consulta de prospectos.
        // Cómo lo hace: filtra por la empresa de la sesión.
        public async Task<CResult> GetCICLO_ACA_PROSPECTOAsync(ACA_PERIODOS_ACADEMICOSParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetCICLO_ACA_PROSPECTOAsync(p);
        }

        public async Task<CResult> GetAllAsync(ACA_PERIODOS_ACADEMICOSParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(ACA_PERIODOS_ACADEMICOSParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(ACA_PERIODOS_ACADEMICOSTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(ACA_PERIODOS_ACADEMICOSTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_PERIODOS_ACADEMICOSTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}
