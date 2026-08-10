// Qué hace: aplica las reglas de negocio del catálogo responsabilidad del cargo antes de llamar al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    // Qué hace: valida los datos de responsabilidad del cargo y coordina su persistencia con el repositorio.
    public class SC_RESPONSABILIDAD_CARGOService : ISC_RESPONSABILIDAD_CARGOService
    {
        private readonly ISC_RESPONSABILIDAD_CARGORepository _repo;

        public SC_RESPONSABILIDAD_CARGOService(ISC_RESPONSABILIDAD_CARGORepository repo)
        {
            _repo = repo;
        }

        // Qué hace: lista las responsabilidades del cargo según los filtros recibidos.
        // Cómo: llama a GetAllAsync del repositorio con los parámetros armados en BuildParameters.
        public async Task<CResult> GetAllAsync(SC_RESPONSABILIDAD_CARGOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Qué hace: obtiene una responsabilidad del cargo por su correlativo.
        // Cómo: llama a GetAsync del repositorio con CORR_EMPRESA y CORR_RESPONSABILIDAD.
        public async Task<CResult> GetAsync(SC_RESPONSABILIDAD_CARGOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_RESPONSABILIDAD", Value = xWhere.CORR_RESPONSABILIDAD, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: entrega las responsabilidades del cargo activas disponibles para el descriptor.
        // Cómo: llama a GetCatalogoDescriptorAsync del repositorio y arma el CResult con el listado.
        public async Task<CResult> GetCatalogoDescriptorAsync(SC_RESPONSABILIDAD_CARGOParam xWhere)
        {
            var rows = await _repo.GetCatalogoDescriptorAsync(xWhere.CORR_EMPRESA);
            return new CResult
            {
                Data = rows,
                Result = true,
                CodeHelper = 0,
                ErrorCode = 0,
                ErrorMessage = "",
                ErrorSource = "",
                RowsAffected = rows.Count,
            };
        }

        // Qué hace: crea una responsabilidad del cargo nueva.
        // Cómo: valida empresa de sesión y datos con Validate, normaliza los campos y llama a CreateAsync del repositorio.
        public async Task<CResult> CreateAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

        // Qué hace: actualiza una responsabilidad del cargo existente.
        // Cómo: valida empresa, datos y llave; normaliza los campos y llama a UpdateAsync del repositorio.
        public async Task<CResult> UpdateAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            if (Data.CORR_RESPONSABILIDAD <= 0)
            {
                return ValidationError("No se pudo identificar la responsabilidad de cargo a actualizar.");
            }

            var duplicate = await ValidateUniqueNombreAsync(Data, Data.CORR_RESPONSABILIDAD);
            if (duplicate != null)
            {
                return duplicate;
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: elimina una responsabilidad del cargo.
        // Cómo: valida la empresa de sesión y llama a DeleteAsync del repositorio.
        public async Task<CResult> DeleteAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: cambia el estado activo/inactivo de una responsabilidad del cargo.
        // Cómo: valida empresa y llave; llama a ActivarInactivarAsync del repositorio.
        public async Task<CResult> ActivarInactivarAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_RESPONSABILIDAD <= 0)
            {
                return ValidationError("No se pudo identificar la responsabilidad de cargo a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: arma el parámetro CORR_EMPRESA para filtrar en el repositorio.
        private static List<CParameter> BuildParameters(SC_RESPONSABILIDAD_CARGOParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        // Qué hace: normaliza los datos antes de guardar.
        // Cómo: recorta espacios del nombre, estandariza APLICA_DESCRIPTOR y fija ESTADO_RESPONSABILIDAD en true si viene vacío.
        private static void NormalizeData(SC_RESPONSABILIDAD_CARGOTable Data)
        {
            Data.NOMBRE_RESPONSABILIDAD = Data.NOMBRE_RESPONSABILIDAD?.Trim();
            Data.APLICA_DESCRIPTOR = Data.APLICA_DESCRIPTOR?.Trim().ToUpperInvariant();
            Data.ESTADO_RESPONSABILIDAD ??= true;
        }

        // Qué hace: valida los datos de la responsabilidad del cargo.
        // Cómo: revisa que existan datos, que el nombre no esté vacío ni supere 150 caracteres, y que APLICA_DESCRIPTOR sea CORTO, EXTENSO o AMBOS.
        private static CResult Validate(SC_RESPONSABILIDAD_CARGOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de la responsabilidad de cargo.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_RESPONSABILIDAD))
            {
                return ValidationError("Debe ingresar el nombre de la responsabilidad de cargo.");
            }

            if (Data.NOMBRE_RESPONSABILIDAD.Trim().Length > 150)
            {
                return ValidationError("El nombre de la responsabilidad de cargo no puede superar 150 caracteres.");
            }

            var aplicaDescriptor = Data.APLICA_DESCRIPTOR?.Trim().ToUpperInvariant();
            if (aplicaDescriptor != "CORTO" && aplicaDescriptor != "EXTENSO" && aplicaDescriptor != "AMBOS")
            {
                return ValidationError("Debe indicar si la responsabilidad aplica al descriptor CORTO, EXTENSO o AMBOS.");
            }

            return null;
        }

        // Qué hace: verifica que el nombre no pertenezca a otra responsabilidad de la empresa.
        // Cómo: llama a ExistsNombreAsync del repositorio excluyendo el correlativo indicado.
        private async Task<CResult> ValidateUniqueNombreAsync(SC_RESPONSABILIDAD_CARGOTable Data, int? excludeCorr)
        {
            var exists = await _repo.ExistsNombreAsync(
                Data.CORR_EMPRESA,
                Data.NOMBRE_RESPONSABILIDAD,
                excludeCorr ?? 0);

            if (!exists)
            {
                return null;
            }

            var nombre = (Data.NOMBRE_RESPONSABILIDAD ?? string.Empty).Trim();
            return DuplicateWarning(
                $"Ya existe una responsabilidad de cargo con el nombre {nombre}. Escriba otro nombre para continuar.");
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
                ErrorMessage = "No se pudo guardar la responsabilidad de cargo porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[SC_RESPONSABILIDAD_CARGOService]",
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
                ErrorSource = "[SC_RESPONSABILIDAD_CARGOService]",
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
                ErrorSource = "[SC_RESPONSABILIDAD_CARGOService]",
                RowsAffected = 0
            };
        }
    }
}

