using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PROSPECTO_LIMITACION_FISICAService : IACA_PROSPECTO_LIMITACION_FISICAService
    {
        private readonly IACA_PROSPECTO_LIMITACION_FISICARepository _repo;

        public ACA_PROSPECTO_LIMITACION_FISICAService(IACA_PROSPECTO_LIMITACION_FISICARepository repo)
        {
            _repo = repo;
        }

        // Qué hace: limitaciones físicas declaradas por el prospecto (pestaña Información personal).
        // Cómo lo hace: exige CORR_PROSPECTO porque eFramework omite del WHERE los enteros en 0
        //               y, sin él, devolvería los datos de todos los prospectos.
        public async Task<CResult> GetAllAsync(ACA_PROSPECTO_LIMITACION_FISICAParam xWhere)
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

        // Qué hace: un registro por su llave (CORR_PROSPECTO_LIMITACION_FISICA); sin llave, el primero del prospecto.
        // Cómo lo hace: exige CORR_PROSPECTO por la misma razón que GetAllAsync;
        //               la llave es opcional porque eFramework omite los enteros en 0.
        public async Task<CResult> GetAsync(ACA_PROSPECTO_LIMITACION_FISICAParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe indicar el prospecto" };

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO_LIMITACION_FISICA",Value=xWhere.CORR_PROSPECTO_LIMITACION_FISICA,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: valida y agrega una limitación física del prospecto.
        public async Task<CResult> CreateAsync(ACA_PROSPECTO_LIMITACION_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_PERSONA <= 0)
                return ErrorValidacion("Debe indicar la persona del prospecto.");

            var validacion = Validar(Data);
            if (validacion != null) return validacion;

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(ACA_PROSPECTO_LIMITACION_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_LIMITACION_FISICA <= 0)
                return ErrorValidacion("Debe indicar la limitación a modificar.");

            var validacion = Validar(Data);
            if (validacion != null) return validacion;

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_PROSPECTO_LIMITACION_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_LIMITACION_FISICA <= 0)
                return ErrorValidacion("Debe indicar la limitación a eliminar.");

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: reglas comunes: limitación del catálogo obligatoria y "especifique" hasta 500.
        //           Que no se repita la limitación para la misma persona lo revisa el repositorio.
        private static CResult Validar(ACA_PROSPECTO_LIMITACION_FISICATable Data)
        {
            Data.ESPECIFIQUE = string.IsNullOrWhiteSpace(Data.ESPECIFIQUE) ? null : Data.ESPECIFIQUE.Trim();

            if (!(Data.CORR_LIMITACION_FISICA > 0))
                return ErrorValidacion("Seleccione la limitación física.");
            if (Data.ESPECIFIQUE != null && Data.ESPECIFIQUE.Length > 500)
                return ErrorValidacion("El detalle no puede superar 500 caracteres.");

            return null;
        }

        private static CResult ErrorValidacion(string mensaje)
        {
            return new CResult() { Data = null, Result = false, CodeHelper = 0, ErrorCode = -1, ErrorMessage = mensaje, ErrorSource = "[ACA_PROSPECTO_LIMITACION_FISICAService]", RowsAffected = 0 };
        }
    }
}
