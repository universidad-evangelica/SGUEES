using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PROSPECTO_MEDIO_ORIGENService : IACA_PROSPECTO_MEDIO_ORIGENService
    {
        private readonly IACA_PROSPECTO_MEDIO_ORIGENRepository _repo;

        public ACA_PROSPECTO_MEDIO_ORIGENService(IACA_PROSPECTO_MEDIO_ORIGENRepository repo)
        {
            _repo = repo;
        }

        // Qué hace: medios por los que el prospecto conoció la universidad (pestaña Información personal).
        // Cómo lo hace: exige CORR_PROSPECTO porque eFramework omite del WHERE los enteros en 0
        //               y, sin él, devolvería los datos de todos los prospectos.
        public async Task<CResult> GetAllAsync(ACA_PROSPECTO_MEDIO_ORIGENParam xWhere)
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

        // Qué hace: un registro por su llave (CORR_PROSPECTO_MEDIO); sin llave, el primero del prospecto.
        // Cómo lo hace: exige CORR_PROSPECTO por la misma razón que GetAllAsync;
        //               la llave es opcional porque eFramework omite los enteros en 0.
        public async Task<CResult> GetAsync(ACA_PROSPECTO_MEDIO_ORIGENParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe indicar el prospecto" };

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO_MEDIO",Value=xWhere.CORR_PROSPECTO_MEDIO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: valida y agrega un medio de origen del prospecto.
        public async Task<CResult> CreateAsync(ACA_PROSPECTO_MEDIO_ORIGENTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_PERSONA <= 0)
                return ErrorValidacion("Debe indicar la persona del prospecto.");

            var validacion = Validar(Data);
            if (validacion != null) return validacion;

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(ACA_PROSPECTO_MEDIO_ORIGENTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_MEDIO <= 0)
                return ErrorValidacion("Debe indicar el medio a modificar.");

            var validacion = Validar(Data);
            if (validacion != null) return validacion;

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_PROSPECTO_MEDIO_ORIGENTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_MEDIO <= 0)
                return ErrorValidacion("Debe indicar el medio a eliminar.");

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: reglas del medio de origen, las mismas del portal.
        // Cómo lo hace: el medio del catálogo es obligatorio; "Otro" exige la descripción y "Referido
        //               amigo/familiar" el nombre y la carrera de quien refiere. Los campos que no
        //               corresponden al medio se descartan, para que no queden datos cruzados. Qué medio
        //               es cada uno lo decide el repositorio por CODIGO ('OTRO' y 'REF'), no por nombre.
        //               Que no se repita el medio lo revisa el repositorio (la tabla tiene índice único).
        private static CResult Validar(ACA_PROSPECTO_MEDIO_ORIGENTable Data)
        {
            Data.DESCRIPCION = Limpiar(Data.DESCRIPCION);
            Data.ESTUDIANTE_REFIERE = Limpiar(Data.ESTUDIANTE_REFIERE);

            if (!(Data.CORR_MEDIO_ORIGEN > 0))
                return ErrorValidacion("Seleccione el medio por el que conoció la universidad.");
            if (Data.DESCRIPCION != null && Data.DESCRIPCION.Length > 1000)
                return ErrorValidacion("La descripción no puede superar 1000 caracteres.");
            if (Data.ESTUDIANTE_REFIERE != null && Data.ESTUDIANTE_REFIERE.Length > 200)
                return ErrorValidacion("El nombre de quien refiere no puede superar 200 caracteres.");

            return null;
        }

        private static string Limpiar(string valor) => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();

        private static CResult ErrorValidacion(string mensaje)
        {
            return new CResult() { Data = null, Result = false, CodeHelper = 0, ErrorCode = -1, ErrorMessage = mensaje, ErrorSource = "[ACA_PROSPECTO_MEDIO_ORIGENService]", RowsAffected = 0 };
        }
    }
}
