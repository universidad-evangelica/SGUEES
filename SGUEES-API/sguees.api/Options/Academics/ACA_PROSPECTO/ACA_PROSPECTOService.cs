using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PROSPECTOService : IACA_PROSPECTOService
    {
        private readonly IACA_PROSPECTORepository _repo;

        public ACA_PROSPECTOService(IACA_PROSPECTORepository repo)
        {
            _repo = repo;
        }

        // Qué hace: listado de prospectos de un ciclo (año + número de período).
        // Cómo lo hace: exige el ciclo porque eFramework omite del WHERE los enteros en 0
        //               y, sin él, devolvería los prospectos de todos los ciclos.
        public async Task<CResult> GetAllAsync(ACA_PROSPECTOParam xWhere)
        {
            if (xWhere.ANIO <= 0 || xWhere.NUMERO_PERIODO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe seleccionar un ciclo" };

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="ANIO",Value=xWhere.ANIO,DbType=System.Data.DbType.Int16},
                new CParameter() {ParameterName="NUMERO_PERIODO",Value=xWhere.NUMERO_PERIODO,DbType=System.Data.DbType.Byte},
            };

            return await _repo.GetAllAsync(p);
        }

        // Qué hace: encabezado de un prospecto.
        // Cómo lo hace: exige CORR_PROSPECTO por la misma razón que GetAllAsync.
        public async Task<CResult> GetAsync(ACA_PROSPECTOParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe indicar el prospecto" };

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}
