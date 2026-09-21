using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PROSPECTO_SE_RESPUESTAService : IACA_PROSPECTO_SE_RESPUESTAService
    {
        private readonly IACA_PROSPECTO_SE_RESPUESTARepository _repo;

        public ACA_PROSPECTO_SE_RESPUESTAService(IACA_PROSPECTO_SE_RESPUESTARepository repo)
        {
            _repo = repo;
        }

        // Qué hace: preguntas de la versión del estudio socioeconómico con su respuesta (pestaña Información económica).
        // Cómo lo hace: exige CORR_PROSPECTO porque eFramework omite del WHERE los enteros en 0
        //               y, sin él, devolvería los datos de todos los prospectos.
        public async Task<CResult> GetAllAsync(ACA_PROSPECTO_SE_RESPUESTAParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe indicar el prospecto" };

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAllAsync(p);
        }

        // Qué hace: un registro por su llave (CORR_PREGUNTA); sin llave, el primero del prospecto.
        // Cómo lo hace: exige CORR_PROSPECTO por la misma razón que GetAllAsync;
        //               la llave es opcional porque eFramework omite los enteros en 0.
        public async Task<CResult> GetAsync(ACA_PROSPECTO_SE_RESPUESTAParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe indicar el prospecto" };

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PREGUNTA",Value=xWhere.CORR_PREGUNTA,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(ACA_PROSPECTO_SE_RESPUESTATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(ACA_PROSPECTO_SE_RESPUESTATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_PROSPECTO_SE_RESPUESTATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}
