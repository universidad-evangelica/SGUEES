using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    // Valida y orquesta el mantenimiento de tipo de puesto vía repositorio.
    public class PLA_TIPO_PUESTOService : IPLA_TIPO_PUESTOService
    {
        private readonly IPLA_TIPO_PUESTORepository _repo;

        public PLA_TIPO_PUESTOService(IPLA_TIPO_PUESTORepository repo)
        {
            _repo = repo;
        }

        // Consulta todos los tipos de puesto de la empresa indicada.
        public async Task<CResult> GetAllAsync(PLA_TIPO_PUESTOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Obtiene un tipo por empresa y correlativo.
        public async Task<CResult> GetAsync(PLA_TIPO_PUESTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_TIPO_PUESTO", Value = xWhere.CORR_TIPO_PUESTO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        // Valida datos y unicidad antes de crear el tipo de puesto.
        public async Task<CResult> CreateAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            NormalizeData(Data);

            var duplicateNombre = await ValidateUniqueNombreAsync(Data, null);
            if (duplicateNombre != null)
            {
                return duplicateNombre;
            }

            var duplicateCodigo = await ValidateUniqueCodigoAsync(Data, null);
            if (duplicateCodigo != null)
            {
                return duplicateCodigo;
            }

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida datos, identificador y unicidad antes de actualizar.
        public async Task<CResult> UpdateAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            if (Data.CORR_TIPO_PUESTO <= 0)
            {
                return ValidationError("No se pudo identificar el tipo de puesto a actualizar.");
            }

            NormalizeData(Data);

            var duplicateNombre = await ValidateUniqueNombreAsync(Data, Data.CORR_TIPO_PUESTO);
            if (duplicateNombre != null)
            {
                return duplicateNombre;
            }

            var duplicateCodigo = await ValidateUniqueCodigoAsync(Data, Data.CORR_TIPO_PUESTO);
            if (duplicateCodigo != null)
            {
                return duplicateCodigo;
            }

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Verifica la empresa de sesión antes de solicitar la eliminación.
        public async Task<CResult> DeleteAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida el registro antes de cambiar su estado activo o inactivo.
        public async Task<CResult> ActivarInactivarAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_TIPO_PUESTO <= 0)
            {
                return ValidationError("No se pudo identificar el tipo de puesto a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Construye los parámetros que limitan la consulta a la empresa actual.
        private static List<CParameter> BuildParameters(PLA_TIPO_PUESTOParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        // Limpia nombre y código, y aplica el estado activo por defecto.
        private static void NormalizeData(PLA_TIPO_PUESTOTable Data)
        {
            Data.NOMBRE_TIPO_PUESTO = Data.NOMBRE_TIPO_PUESTO?.Trim();
            Data.CODIGO_TIPO_PUESTO = Data.CODIGO_TIPO_PUESTO?.Trim();
            Data.ESTADO_TIPO_PUESTO ??= true;
        }

        // Comprueba campos obligatorios y longitudes antes de guardar.
        private static CResult Validate(PLA_TIPO_PUESTOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos del tipo de puesto.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_TIPO_PUESTO))
            {
                return ValidationError("Debe ingresar el nombre del tipo de puesto.");
            }

            if (Data.NOMBRE_TIPO_PUESTO.Trim().Length > 100)
            {
                return ValidationError("El nombre del tipo de puesto no puede superar 100 caracteres.");
            }

            if (string.IsNullOrWhiteSpace(Data.CODIGO_TIPO_PUESTO))
            {
                return ValidationError("Debe ingresar el codigo del tipo de puesto.");
            }

            if (Data.CODIGO_TIPO_PUESTO.Trim().Length > 30)
            {
                return ValidationError("El codigo del tipo de puesto no puede superar 30 caracteres.");
            }

            return null;
        }

        // Verifica que el código no pertenezca a otro registro de la empresa.
        private async Task<CResult> ValidateUniqueCodigoAsync(PLA_TIPO_PUESTOTable Data, int? excludeCorr)
        {
            var exists = await _repo.ExistsCodigoAsync(
                Data.CORR_EMPRESA,
                Data.CODIGO_TIPO_PUESTO,
                excludeCorr ?? 0);

            return exists
                ? ValidationError($"Ya existe un tipo de puesto con el codigo {Data.CODIGO_TIPO_PUESTO}.")
                : null;
        }

        // Verifica que el nombre no pertenezca a otro registro de la empresa.
        private async Task<CResult> ValidateUniqueNombreAsync(PLA_TIPO_PUESTOTable Data, int? excludeCorr)
        {
            var exists = await _repo.ExistsNombreAsync(
                Data.CORR_EMPRESA,
                Data.NOMBRE_TIPO_PUESTO,
                excludeCorr ?? 0);

            return exists
                ? ValidationError($"Ya existe un tipo de puesto con el nombre {Data.NOMBRE_TIPO_PUESTO}.")
                : null;
        }

        // Devuelve una respuesta controlada cuando la sesión no tiene empresa.
        private static CResult ValidateEmpresaSesion(int corrEmpresa)
        {
            if (corrEmpresa > 0)
            {
                return null;
            }

            return new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = 4100,
                ErrorMessage = "No se pudo guardar el tipo de puesto porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[PLA_TIPO_PUESTOService]",
                RowsAffected = 0
            };
        }

        // Crea una respuesta uniforme para los errores de validación.
        private static CResult ValidationError(string message)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = -1,
                ErrorMessage = message,
                ErrorSource = "[PLA_TIPO_PUESTOService]",
                RowsAffected = 0
            };
        }
    }
}
