// Qué hace: aplica las reglas de negocio del catálogo tipo de puesto antes de llamar al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    // Qué hace: valida los datos de tipo de puesto y coordina su persistencia con el repositorio.
    public class PLA_TIPO_PUESTOService : IPLA_TIPO_PUESTOService
    {
        private readonly IPLA_TIPO_PUESTORepository _repo;

        public PLA_TIPO_PUESTOService(IPLA_TIPO_PUESTORepository repo)
        {
            _repo = repo;
        }

        // Qué hace: lista los tipos de puesto según los filtros recibidos.
        // Cómo: llama a GetAllAsync del repositorio con los parámetros armados en BuildParameters.
        public async Task<CResult> GetAllAsync(PLA_TIPO_PUESTOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Qué hace: obtiene un tipo de puesto por su correlativo.
        // Cómo: llama a GetAsync del repositorio con CORR_EMPRESA y CORR_TIPO_PUESTO.
        public async Task<CResult> GetAsync(PLA_TIPO_PUESTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_TIPO_PUESTO", Value = xWhere.CORR_TIPO_PUESTO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: crea un tipo de puesto nuevo.
        // Cómo: valida empresa, datos y unicidad de nombre/código; normaliza los campos y llama a CreateAsync del repositorio.
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

        // Qué hace: actualiza un tipo de puesto existente.
        // Cómo: valida empresa, datos, llave y unicidad; normaliza los campos y llama a UpdateAsync del repositorio.
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

        // Qué hace: elimina un tipo de puesto de la empresa en sesión.
        // Cómo: valida la empresa con ValidateEmpresaSesion y llama a DeleteAsync del repositorio.
        public async Task<CResult> DeleteAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: cambia el estado activo/inactivo de un tipo de puesto.
        // Cómo: valida empresa y llave, luego llama a ActivarInactivarAsync del repositorio.
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

        // Qué hace: arma los parámetros de consulta limitados a la empresa actual.
        private static List<CParameter> BuildParameters(PLA_TIPO_PUESTOParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        // Qué hace: normaliza nombre, código y estado antes de persistir.
        // Cómo: recorta NOMBRE_TIPO_PUESTO y CODIGO_TIPO_PUESTO; deja ESTADO_TIPO_PUESTO en true si no fue informado.
        private static void NormalizeData(PLA_TIPO_PUESTOTable Data)
        {
            Data.NOMBRE_TIPO_PUESTO = Data.NOMBRE_TIPO_PUESTO?.Trim();
            Data.CODIGO_TIPO_PUESTO = Data.CODIGO_TIPO_PUESTO?.Trim();
            Data.ESTADO_TIPO_PUESTO ??= true;
        }

        // Qué hace: valida los datos obligatorios del tipo de puesto.
        // Cómo: revisa que nombre y código no estén vacíos y respeten sus longitudes máximas.
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

        // Qué hace: valida que el código no pertenezca a otro registro de la empresa.
        // Cómo: llama a ExistsCodigoAsync del repositorio y devuelve DuplicateWarning si ya existe.
        private async Task<CResult> ValidateUniqueCodigoAsync(PLA_TIPO_PUESTOTable Data, int? excludeCorr)
        {
            var exists = await _repo.ExistsCodigoAsync(
                Data.CORR_EMPRESA,
                Data.CODIGO_TIPO_PUESTO,
                excludeCorr ?? 0);

            if (!exists)
            {
                return null;
            }

            var codigo = (Data.CODIGO_TIPO_PUESTO ?? string.Empty).Trim();
            return DuplicateWarning(
                $"Ya existe un tipo de puesto con el codigo {codigo}. Escriba otro codigo para continuar.");
        }

        // Qué hace: valida que el nombre no pertenezca a otro registro de la empresa.
        // Cómo: llama a ExistsNombreAsync del repositorio y devuelve DuplicateWarning si ya existe.
        private async Task<CResult> ValidateUniqueNombreAsync(PLA_TIPO_PUESTOTable Data, int? excludeCorr)
        {
            var exists = await _repo.ExistsNombreAsync(
                Data.CORR_EMPRESA,
                Data.NOMBRE_TIPO_PUESTO,
                excludeCorr ?? 0);

            if (!exists)
            {
                return null;
            }

            var nombre = (Data.NOMBRE_TIPO_PUESTO ?? string.Empty).Trim();
            return DuplicateWarning(
                $"Ya existe un tipo de puesto con el nombre {nombre}. Escriba otro nombre para continuar.");
        }

        // Qué hace: devuelve error controlado cuando la sesión no tiene empresa asignada.
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

        // Qué hace: arma respuesta controlada de duplicado (ErrorCode 2627 → Warning en el front).
        private static CResult DuplicateWarning(string message)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = 2627,
                ErrorMessage = message,
                ErrorSource = "[PLA_TIPO_PUESTOService]",
                RowsAffected = 0
            };
        }

        // Qué hace: construye una respuesta uniforme para errores de validación.
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
