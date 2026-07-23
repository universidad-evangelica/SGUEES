// Qué hace: aplica las reglas de negocio del catálogo riesgo del puesto antes de llamar al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    // Qué hace: valida los datos de riesgo del puesto y coordina su persistencia con el repositorio.
    public class SC_RIESGO_PUESTOService : ISC_RIESGO_PUESTOService
    {
        private readonly ISC_RIESGO_PUESTORepository _repo;

        public SC_RIESGO_PUESTOService(ISC_RIESGO_PUESTORepository repo)
        {
            _repo = repo;
        }

        // Qué hace: entrega los riesgos del puesto activos disponibles para el descriptor.
        // Cómo: llama a GetCatalogoDescriptorAsync del repositorio y arma el CResult con el listado.
        public async Task<CResult> GetCatalogoDescriptorAsync(SC_RIESGO_PUESTOParam xWhere)
        {
            var rows = await _repo.GetCatalogoDescriptorAsync(xWhere.CORR_EMPRESA);
            return new CResult
            {
                Data = rows,
                Result = true,
                RowsAffected = rows.Count,
                CodeHelper = 0,
                ErrorCode = 0,
                ErrorMessage = "",
                ErrorSource = "",
            };
        }

        // Qué hace: lista los riesgos del puesto según los filtros recibidos.
        // Cómo: llama a GetAllAsync del repositorio con los parámetros armados en BuildParameters.
        public async Task<CResult> GetAllAsync(SC_RIESGO_PUESTOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Qué hace: obtiene un riesgo del puesto por su correlativo.
        // Cómo: llama a GetAsync del repositorio con CORR_EMPRESA y CORR_RIESGO_PUESTO.
        public async Task<CResult> GetAsync(SC_RIESGO_PUESTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_RIESGO_PUESTO", Value = xWhere.CORR_RIESGO_PUESTO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: crea un riesgo del puesto nuevo.
        // Cómo: valida empresa de sesión y datos con Validate, normaliza el nombre y llama a CreateAsync del repositorio.
        public async Task<CResult> CreateAsync(SC_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            var duplicate = await ValidateUniqueNombreAsync(Data, null);
            if (duplicate != null)
            {
                return duplicate;
            }

            NormalizeData(Data);
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: actualiza un riesgo del puesto existente.
        // Cómo: valida empresa, datos y llave; normaliza el nombre y llama a UpdateAsync del repositorio.
        public async Task<CResult> UpdateAsync(SC_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            if (Data.CORR_RIESGO_PUESTO <= 0)
            {
                return ValidationError("No se pudo identificar el riesgo de puesto a actualizar.");
            }

            var duplicate = await ValidateUniqueNombreAsync(Data, Data.CORR_RIESGO_PUESTO);
            if (duplicate != null)
            {
                return duplicate;
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: elimina un riesgo del puesto.
        // Cómo: valida la empresa de sesión y llama a DeleteAsync del repositorio.
        public async Task<CResult> DeleteAsync(SC_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: cambia el estado activo/inactivo de un riesgo del puesto.
        // Cómo: valida empresa y llave; llama a ActivarInactivarAsync del repositorio.
        public async Task<CResult> ActivarInactivarAsync(SC_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_RIESGO_PUESTO <= 0)
            {
                return ValidationError("No se pudo identificar el riesgo de puesto a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: arma el parámetro CORR_EMPRESA para filtrar en el repositorio.
        private static List<CParameter> BuildParameters(SC_RIESGO_PUESTOParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        // Qué hace: normaliza los datos antes de guardar.
        // Cómo: recorta espacios del nombre y fija ESTADO_RIESGO_PUESTO en true si viene vacío.
        private static void NormalizeData(SC_RIESGO_PUESTOTable Data)
        {
            Data.NOMBRE_RIESGO_PUESTO = Data.NOMBRE_RIESGO_PUESTO?.Trim();
            Data.ESTADO_RIESGO_PUESTO ??= true;
        }

        // Qué hace: valida los datos del riesgo del puesto.
        // Cómo: revisa que existan datos, que el nombre no esté vacío ni supere 150 caracteres.
        private static CResult Validate(SC_RIESGO_PUESTOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos del riesgo de puesto.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_RIESGO_PUESTO))
            {
                return ValidationError("Debe ingresar el nombre de riesgo de puesto.");
            }

            if (Data.NOMBRE_RIESGO_PUESTO.Trim().Length > 150)
            {
                return ValidationError("El nombre de riesgo de puesto no puede superar 150 caracteres.");
            }

            return null;
        }

        // Qué hace: verifica que el nombre no pertenezca a otro riesgo de la empresa.
        // Cómo: llama a ExistsNombreAsync del repositorio excluyendo el correlativo indicado.
        private async Task<CResult> ValidateUniqueNombreAsync(SC_RIESGO_PUESTOTable Data, int? excludeCorr)
        {
            var exists = await _repo.ExistsNombreAsync(
                Data.CORR_EMPRESA,
                Data.NOMBRE_RIESGO_PUESTO,
                excludeCorr ?? 0);

            return exists
                ? ValidationError($"Ya existe un riesgo de puesto con el nombre {Data.NOMBRE_RIESGO_PUESTO}.")
                : null;
        }

        // Qué hace: valida que exista empresa en la sesión.
        // Cómo: si CORR_EMPRESA es mayor a 0 permite continuar; si no, devuelve un CResult de error.
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
                ErrorMessage = "No se pudo guardar el riesgo de puesto porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[SC_RIESGO_PUESTOService]",
                RowsAffected = 0
            };
        }

        // Qué hace: construye un CResult de error de validación con el mensaje recibido.
        private static CResult ValidationError(string message)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = -1,
                ErrorMessage = message,
                ErrorSource = "[SC_RIESGO_PUESTOService]",
                RowsAffected = 0
            };
        }
    }
}
