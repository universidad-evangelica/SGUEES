using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PROSPECTO_PERSONAService : IACA_PROSPECTO_PERSONAService
    {
        private readonly IACA_PROSPECTO_PERSONARepository _repo;

        public ACA_PROSPECTO_PERSONAService(IACA_PROSPECTO_PERSONARepository repo)
        {
            _repo = repo;
        }

        // Qué hace: datos personales del prospecto (pestaña Información personal).
        // Cómo lo hace: exige CORR_PROSPECTO porque eFramework omite del WHERE los enteros en 0
        //               y, sin él, devolvería los datos de todos los prospectos.
        public async Task<CResult> GetAllAsync(ACA_PROSPECTO_PERSONAParam xWhere)
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

        // Qué hace: el registro del prospecto (relación 1:1).
        // Cómo lo hace: exige CORR_PROSPECTO por la misma razón que GetAllAsync.
        public async Task<CResult> GetAsync(ACA_PROSPECTO_PERSONAParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe indicar el prospecto" };

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO_PERSONA",Value=xWhere.CORR_PROSPECTO_PERSONA,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(ACA_PROSPECTO_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: valida los datos personales antes de actualizar.
        // Cómo lo hace: obligatorios nombres y primer apellido; largos según la tabla; municipio exige
        //               departamento y departamento exige país (llaves compuestas de GEN_DEPTO/GEN_MUNICIPIO).
        public async Task<CResult> UpdateAsync(ACA_PROSPECTO_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_PERSONA <= 0)
                return ErrorValidacion("Debe indicar la persona del prospecto a modificar.");

            Data.NOMBRES = Limpiar(Data.NOMBRES);
            Data.APELLIDO1 = Limpiar(Data.APELLIDO1);
            Data.APELLIDO2 = Limpiar(Data.APELLIDO2);
            Data.DUI = Limpiar(Data.DUI);
            Data.NIE = Limpiar(Data.NIE);
            Data.CARNET_RESIDENCIA = Limpiar(Data.CARNET_RESIDENCIA);
            Data.NIT = Limpiar(Data.NIT);
            Data.LUGAR_NACIMIENTO = Limpiar(Data.LUGAR_NACIMIENTO);
            Data.IGLESIA_ACTUAL = Limpiar(Data.IGLESIA_ACTUAL);
            Data.DIRECCION_ACTUAL = Limpiar(Data.DIRECCION_ACTUAL);

            if (Data.NOMBRES == null) return ErrorValidacion("Debe ingresar los nombres.");
            if (Data.APELLIDO1 == null) return ErrorValidacion("Debe ingresar el primer apellido.");

            var largo = ExcedeLargo(Data.NOMBRES, 200, "Nombres")
                ?? ExcedeLargo(Data.APELLIDO1, 200, "Primer apellido")
                ?? ExcedeLargo(Data.APELLIDO2, 200, "Segundo apellido")
                ?? ExcedeLargo(Data.DUI, 20, "DUI")
                ?? ExcedeLargo(Data.NIE, 20, "NIE")
                ?? ExcedeLargo(Data.CARNET_RESIDENCIA, 50, "Carné de residencia")
                ?? ExcedeLargo(Data.NIT, 20, "NIT")
                ?? ExcedeLargo(Data.LUGAR_NACIMIENTO, 200, "Lugar de nacimiento")
                ?? ExcedeLargo(Data.IGLESIA_ACTUAL, 100, "Iglesia actual")
                ?? ExcedeLargo(Data.DIRECCION_ACTUAL, 300, "Dirección actual");
            if (largo != null) return largo;

            if (Data.CORR_DEPTO_RESIDENCIA > 0 && !(Data.CORR_PAIS_RESIDENCIA > 0))
                return ErrorValidacion("Debe seleccionar el país de residencia antes del departamento.");
            if (Data.CORR_MUNICIPIO_RESIDENCIA > 0 && !(Data.CORR_DEPTO_RESIDENCIA > 0))
                return ErrorValidacion("Debe seleccionar el departamento de residencia antes del municipio.");

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private static string Limpiar(string valor) => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();

        private static CResult ExcedeLargo(string valor, int maximo, string campo)
        {
            return valor != null && valor.Length > maximo ? ErrorValidacion($"{campo} no puede superar {maximo} caracteres.") : null;
        }

        private static CResult ErrorValidacion(string mensaje)
        {
            return new CResult() { Data = null, Result = false, CodeHelper = 0, ErrorCode = -1, ErrorMessage = mensaje, ErrorSource = "[ACA_PROSPECTO_PERSONAService]", RowsAffected = 0 };
        }

        public async Task<CResult> DeleteAsync(ACA_PROSPECTO_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}
