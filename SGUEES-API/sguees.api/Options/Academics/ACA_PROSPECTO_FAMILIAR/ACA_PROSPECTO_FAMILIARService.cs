using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PROSPECTO_FAMILIARService : IACA_PROSPECTO_FAMILIARService
    {
        private readonly IACA_PROSPECTO_FAMILIARRepository _repo;

        public ACA_PROSPECTO_FAMILIARService(IACA_PROSPECTO_FAMILIARRepository repo)
        {
            _repo = repo;
        }

        // Qué hace: familiares y contacto de emergencia del prospecto (pestaña Información personal).
        // Cómo lo hace: exige CORR_PROSPECTO porque eFramework omite del WHERE los enteros en 0
        //               y, sin él, devolvería los datos de todos los prospectos.
        public async Task<CResult> GetAllAsync(ACA_PROSPECTO_FAMILIARParam xWhere)
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

        // Qué hace: un registro por su llave (CORR_PROSPECTO_FAMILIAR); sin llave, el primero del prospecto.
        // Cómo lo hace: exige CORR_PROSPECTO por la misma razón que GetAllAsync;
        //               la llave es opcional porque eFramework omite los enteros en 0.
        public async Task<CResult> GetAsync(ACA_PROSPECTO_FAMILIARParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe indicar el prospecto" };

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO_FAMILIAR",Value=xWhere.CORR_PROSPECTO_FAMILIAR,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: valida y agrega un familiar del prospecto.
        public async Task<CResult> CreateAsync(ACA_PROSPECTO_FAMILIARTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_PERSONA <= 0)
                return ErrorValidacion("Debe indicar la persona del prospecto.");

            var validacion = Validar(Data);
            if (validacion != null) return validacion;

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(ACA_PROSPECTO_FAMILIARTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_FAMILIAR <= 0)
                return ErrorValidacion("Debe indicar el familiar a modificar.");

            var validacion = Validar(Data);
            if (validacion != null) return validacion;

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_PROSPECTO_FAMILIARTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_FAMILIAR <= 0)
                return ErrorValidacion("Debe indicar el familiar a eliminar.");

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: reglas comunes de alta y modificación del familiar.
        // Cómo lo hace: parentesco y nombre obligatorios, largos según la tabla y, si no es el contacto
        //               de emergencia, se descartan el teléfono y la dirección de emergencia (esos datos
        //               solo tienen sentido en la fila marcada). El familiar siempre queda activo: el
        //               portal solo lee los activos.
        private static CResult Validar(ACA_PROSPECTO_FAMILIARTable Data)
        {
            Data.NOMBRES = Limpiar(Data.NOMBRES);
            Data.APELLIDO1 = Limpiar(Data.APELLIDO1);
            Data.APELLIDO2 = Limpiar(Data.APELLIDO2);
            Data.PROFESION = Limpiar(Data.PROFESION);
            Data.OCUPACION = Limpiar(Data.OCUPACION);
            Data.NOMBRE_EMPRESA = Limpiar(Data.NOMBRE_EMPRESA);
            Data.TELEFONO = Limpiar(Data.TELEFONO);
            Data.TELEFONO2 = Limpiar(Data.TELEFONO2);
            Data.TELEFONO_TRABAJO = Limpiar(Data.TELEFONO_TRABAJO);
            Data.DIRECCION_CASA = Limpiar(Data.DIRECCION_CASA);
            Data.DIRECCION_TRABAJO = Limpiar(Data.DIRECCION_TRABAJO);
            Data.TELEFONO_EMERGENCIA = Limpiar(Data.TELEFONO_EMERGENCIA);
            Data.DIRECCION_EMERGENCIA = Limpiar(Data.DIRECCION_EMERGENCIA);
            Data.ACTIVO = true;

            if (!(Data.CORR_PARENTESCO > 0))
                return ErrorValidacion("Seleccione el parentesco del familiar.");
            if (Data.NOMBRES == null)
                return ErrorValidacion("Ingrese el nombre del familiar.");

            if (Data.ES_EMERGENCIA != true)
            {
                Data.ES_EMERGENCIA = false;
                Data.TELEFONO_EMERGENCIA = null;
                Data.DIRECCION_EMERGENCIA = null;
            }

            var largo = ExcedeLargo(Data.NOMBRES, 200, "El nombre")
                ?? ExcedeLargo(Data.APELLIDO1, 200, "El primer apellido")
                ?? ExcedeLargo(Data.APELLIDO2, 200, "El segundo apellido")
                ?? ExcedeLargo(Data.PROFESION, 100, "La profesión")
                ?? ExcedeLargo(Data.OCUPACION, 100, "La ocupación")
                ?? ExcedeLargo(Data.NOMBRE_EMPRESA, 100, "El lugar de trabajo")
                ?? ExcedeLargo(Data.TELEFONO, 20, "El teléfono")
                ?? ExcedeLargo(Data.TELEFONO2, 20, "El segundo teléfono")
                ?? ExcedeLargo(Data.TELEFONO_TRABAJO, 20, "El teléfono del trabajo")
                ?? ExcedeLargo(Data.TELEFONO_EMERGENCIA, 20, "El teléfono de emergencia")
                ?? ExcedeLargo(Data.DIRECCION_CASA, 300, "La dirección de casa")
                ?? ExcedeLargo(Data.DIRECCION_TRABAJO, 300, "La dirección del trabajo")
                ?? ExcedeLargo(Data.DIRECCION_EMERGENCIA, 300, "La dirección de emergencia");
            if (largo != null) return largo;

            return null;
        }

        private static string Limpiar(string valor) => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();

        private static CResult ExcedeLargo(string valor, int maximo, string campo)
        {
            return valor != null && valor.Length > maximo ? ErrorValidacion($"{campo} no puede superar {maximo} caracteres.") : null;
        }

        private static CResult ErrorValidacion(string mensaje)
        {
            return new CResult() { Data = null, Result = false, CodeHelper = 0, ErrorCode = -1, ErrorMessage = mensaje, ErrorSource = "[ACA_PROSPECTO_FAMILIARService]", RowsAffected = 0 };
        }
    }
}
