// Qué hace: lógica de negocio del catálogo frecuencia.
// Cómo: valida los datos y llama a ISC_FRECUENCIARepository para ejecutar el CRUD.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    // Qué hace: servicio de frecuencia.
    // Cómo: valida los datos y llama al repositorio para persistir la información.
    public class SC_FRECUENCIAService : ISC_FRECUENCIAService
    {
        private readonly ISC_FRECUENCIARepository _repo;

        public SC_FRECUENCIAService(ISC_FRECUENCIARepository repo)
        {
            _repo = repo;
        }

        // Qué hace: obtiene el listado de frecuencias.
        // Cómo: llama a GetAllAsync del repositorio con los parámetros armados por BuildParameters.
        public async Task<CResult> GetAllAsync(SC_FRECUENCIAParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Qué hace: obtiene solo las frecuencias activas de la empresa.
        // Cómo: llama a GetFrecuenciasActivasAsync del repositorio filtrando por CORR_EMPRESA.
        public async Task<CResult> GetFrecuenciasActivasAsync(SC_FRECUENCIAParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetFrecuenciasActivasAsync(p);
        }

        // Qué hace: obtiene una frecuencia puntual.
        // Cómo: llama a GetAsync del repositorio filtrando por CORR_EMPRESA y CORR_FRECUENCIA.
        public async Task<CResult> GetAsync(SC_FRECUENCIAParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_FRECUENCIA", Value = xWhere.CORR_FRECUENCIA, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: crea una frecuencia.
        // Cómo: valida la empresa de sesión y los datos con ValidateEmpresaSesion y Validate, normaliza con NormalizeData y llama a CreateAsync del repositorio.
        public async Task<CResult> CreateAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
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
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: actualiza una frecuencia.
        // Cómo: valida la empresa de sesión, los datos y el CORR_FRECUENCIA a actualizar, normaliza con NormalizeData y llama a UpdateAsync del repositorio.
        public async Task<CResult> UpdateAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            if (Data.CORR_FRECUENCIA <= 0)
            {
                return ValidationError("No se pudo identificar la frecuencia a actualizar.");
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: elimina una frecuencia.
        // Cómo: valida la empresa de sesión con ValidateEmpresaSesion y llama a DeleteAsync del repositorio.
        public async Task<CResult> DeleteAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: cambia el estado activo/inactivo de una frecuencia.
        // Cómo: valida la empresa de sesión y el CORR_FRECUENCIA a actualizar, y llama a ActivarInactivarAsync del repositorio.
        public async Task<CResult> ActivarInactivarAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_FRECUENCIA <= 0)
            {
                return ValidationError("No se pudo identificar la frecuencia a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: arma los parámetros de filtro para el repositorio.
        // Cómo: construye la lista con CORR_EMPRESA a partir de xWhere.
        private static List<CParameter> BuildParameters(SC_FRECUENCIAParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        // Qué hace: normaliza los datos antes de guardar.
        // Cómo: recorta espacios de NOMBRE_FRECUENCIA y aplica ESTADO_FRECUENCIA activo cuando no viene informado.
        private static void NormalizeData(SC_FRECUENCIATable Data)
        {
            Data.NOMBRE_FRECUENCIA = Data.NOMBRE_FRECUENCIA?.Trim();
            Data.ESTADO_FRECUENCIA ??= true;
        }

        // Qué hace: valida los datos obligatorios de la frecuencia.
        // Cómo: comprueba que Data no sea nulo y que NOMBRE_FRECUENCIA no esté vacío ni supere 50 caracteres.
        private static CResult Validate(SC_FRECUENCIATable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de la frecuencia.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_FRECUENCIA))
            {
                return ValidationError("Debe ingresar el nombre de la frecuencia.");
            }

            if (Data.NOMBRE_FRECUENCIA.Trim().Length > 50)
            {
                return ValidationError("El nombre de la frecuencia no puede superar 50 caracteres.");
            }

            return null;
        }

        // Qué hace: verifica que exista empresa en la sesión.
        // Cómo: si corrEmpresa es mayor a cero devuelve null; de lo contrario devuelve un CResult con el error de empresa no asignada.
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
                ErrorMessage = "No se pudo guardar la frecuencia porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[SC_FRECUENCIAService]",
                RowsAffected = 0
            };
        }

        // Qué hace: construye un resultado de error de validación.
        // Cómo: arma un CResult con Result en false y el mensaje recibido.
        private static CResult ValidationError(string message)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = -1,
                ErrorMessage = message,
                ErrorSource = "[SC_FRECUENCIAService]",
                RowsAffected = 0
            };
        }
    }
}
