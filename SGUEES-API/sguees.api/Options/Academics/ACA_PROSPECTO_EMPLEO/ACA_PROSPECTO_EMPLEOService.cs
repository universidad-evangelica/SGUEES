using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PROSPECTO_EMPLEOService : IACA_PROSPECTO_EMPLEOService
    {
        private readonly IACA_PROSPECTO_EMPLEORepository _repo;

        public ACA_PROSPECTO_EMPLEOService(IACA_PROSPECTO_EMPLEORepository repo)
        {
            _repo = repo;
        }

        // Qué hace: información laboral del prospecto (pestaña Información económica).
        // Cómo lo hace: exige CORR_PROSPECTO porque eFramework omite del WHERE los enteros en 0
        //               y, sin él, devolvería los datos de todos los prospectos.
        public async Task<CResult> GetAllAsync(ACA_PROSPECTO_EMPLEOParam xWhere)
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

        // Qué hace: un registro por su llave (CORR_PROSPECTO_EMPLEO); sin llave, el primero del prospecto.
        // Cómo lo hace: exige CORR_PROSPECTO por la misma razón que GetAllAsync;
        //               la llave es opcional porque eFramework omite los enteros en 0.
        public async Task<CResult> GetAsync(ACA_PROSPECTO_EMPLEOParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe indicar el prospecto" };

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO_EMPLEO",Value=xWhere.CORR_PROSPECTO_EMPLEO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: valida y crea la información laboral (una por prospecto).
        // Cómo lo hace: mismas reglas que la modificación más persona y empresa obligatorias;
        //               TRABAJA_AUN siempre en 1, como lo guarda el portal.
        public async Task<CResult> CreateAsync(ACA_PROSPECTO_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_PERSONA <= 0)
                return ErrorValidacion("Debe indicar la persona del prospecto.");

            var validacion = Validar(Data);
            if (validacion != null) return validacion;

            if (Data.EMPRESA == null)
                return ErrorValidacion("Debe ingresar la empresa donde trabaja.");

            Data.TRABAJA_AUN = true;
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: valida la información laboral antes de actualizar.
        // Cómo lo hace: reglas comunes de Validar; TRABAJA_AUN siempre en 1 (el interruptor real es
        //               PERSONA.TRABAJA: si es 0 el empleo se elimina, no se marca).
        public async Task<CResult> UpdateAsync(ACA_PROSPECTO_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_EMPLEO <= 0)
                return ErrorValidacion("Debe indicar el empleo del prospecto a modificar.");

            var validacion = Validar(Data);
            if (validacion != null) return validacion;

            Data.TRABAJA_AUN = true;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: reglas comunes de alta y modificación.
        // Cómo lo hace: largos según la tabla, montos no negativos y jerarquía país → departamento → municipio.
        //               Si el empleo es en el extranjero se descarta la ubicación completa (regla del
        //               portal: solo se guarda cuando el trabajo es en el país).
        private static CResult Validar(ACA_PROSPECTO_EMPLEOTable Data)
        {
            if (Data.TIENE_EMPLEO_FUERA == true)
            {
                Data.CORR_PAIS = null;
                Data.CORR_DEPTO = null;
                Data.CORR_MUNICIPIO = null;
            }

            Data.EMPRESA = Limpiar(Data.EMPRESA);
            Data.CARGO = Limpiar(Data.CARGO);
            Data.DIRECCION = Limpiar(Data.DIRECCION);
            Data.TELEFONO = Limpiar(Data.TELEFONO);
            Data.EMAIL = Limpiar(Data.EMAIL);

            var largo = ExcedeLargo(Data.EMPRESA, 1000, "Empresa")
                ?? ExcedeLargo(Data.CARGO, 1000, "Cargo")
                ?? ExcedeLargo(Data.DIRECCION, 1000, "Dirección")
                ?? ExcedeLargo(Data.TELEFONO, 100, "Teléfono")
                ?? ExcedeLargo(Data.EMAIL, 100, "Correo");
            if (largo != null) return largo;

            if (Data.SALARIO_MENSUAL < 0 || Data.APORTE_LIQUIDO < 0)
                return ErrorValidacion("El salario y el aporte líquido no pueden ser negativos.");

            if (Data.CORR_DEPTO > 0 && !(Data.CORR_PAIS > 0))
                return ErrorValidacion("Debe seleccionar el país del empleo antes del departamento.");
            if (Data.CORR_MUNICIPIO > 0 && !(Data.CORR_DEPTO > 0))
                return ErrorValidacion("Debe seleccionar el departamento del empleo antes del municipio.");

            return null;
        }

        private static string Limpiar(string valor) => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();

        private static CResult ExcedeLargo(string valor, int maximo, string campo)
        {
            return valor != null && valor.Length > maximo ? ErrorValidacion($"{campo} no puede superar {maximo} caracteres.") : null;
        }

        private static CResult ErrorValidacion(string mensaje)
        {
            return new CResult() { Data = null, Result = false, CodeHelper = 0, ErrorCode = -1, ErrorMessage = mensaje, ErrorSource = "[ACA_PROSPECTO_EMPLEOService]", RowsAffected = 0 };
        }

        // Qué hace: elimina la información laboral (al desmarcar "Trabaja" en el ERP).
        public async Task<CResult> DeleteAsync(ACA_PROSPECTO_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_EMPLEO <= 0)
                return ErrorValidacion("Debe indicar el empleo del prospecto a eliminar.");

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}
