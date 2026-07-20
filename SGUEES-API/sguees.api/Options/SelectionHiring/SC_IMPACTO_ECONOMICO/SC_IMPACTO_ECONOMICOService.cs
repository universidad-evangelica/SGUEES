// Qué hace: aplica las reglas de negocio del catálogo impacto económico antes de llamar al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    // Qué hace: valida los datos de impacto económico y coordina su persistencia con el repositorio.
    public class SC_IMPACTO_ECONOMICOService : ISC_IMPACTO_ECONOMICOService
    {
        private readonly ISC_IMPACTO_ECONOMICORepository _repo;

        public SC_IMPACTO_ECONOMICOService(ISC_IMPACTO_ECONOMICORepository repo)
        {
            _repo = repo;
        }

        // Qué hace: entrega los impactos económicos activos disponibles para el descriptor.
        // Cómo: llama a GetCatalogoDescriptorAsync del repositorio y arma el CResult con el listado.
        public async Task<CResult> GetCatalogoDescriptorAsync(SC_IMPACTO_ECONOMICOParam xWhere)
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

        // Qué hace: lista los impactos económicos según los filtros recibidos.
        // Cómo: llama a GetAllAsync del repositorio con los parámetros armados en BuildParameters.
        public async Task<CResult> GetAllAsync(SC_IMPACTO_ECONOMICOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Qué hace: obtiene un impacto económico por su correlativo.
        // Cómo: llama a GetAsync del repositorio con CORR_EMPRESA y CORR_IMPACTO_ECONOMICO.
        public async Task<CResult> GetAsync(SC_IMPACTO_ECONOMICOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_IMPACTO_ECONOMICO", Value = xWhere.CORR_IMPACTO_ECONOMICO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: crea un impacto económico nuevo.
        // Cómo: valida empresa de sesión y datos con Validate, normaliza DESCRIPCION y llama a CreateAsync del repositorio.
        public async Task<CResult> CreateAsync(SC_IMPACTO_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            Data.DESCRIPCION = Data.DESCRIPCION.Trim();
            Data.ESTADO_IMPACTO_ECONOMICO ??= true;

           
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: actualiza un impacto económico existente.
        // Cómo: valida empresa, datos y llave; normaliza DESCRIPCION y llama a UpdateAsync del repositorio.
        public async Task<CResult> UpdateAsync(SC_IMPACTO_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            if (Data.CORR_IMPACTO_ECONOMICO <= 0)
            {
                return ValidationError("No se pudo identificar el impacto economico a actualizar.");
            }

            Data.DESCRIPCION = Data.DESCRIPCION.Trim();
            Data.ESTADO_IMPACTO_ECONOMICO ??= true;

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: elimina un impacto económico.
        // Cómo: valida la empresa de sesión y llama a DeleteAsync del repositorio.
        public async Task<CResult> DeleteAsync(SC_IMPACTO_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: cambia el estado activo/inactivo de un impacto económico.
        // Cómo: valida empresa y llave; llama a ActivarInactivarAsync del repositorio.
        public async Task<CResult> ActivarInactivarAsync(SC_IMPACTO_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_IMPACTO_ECONOMICO <= 0)
            {
                return ValidationError("No se pudo identificar el impacto economico a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: arma el parámetro CORR_EMPRESA para filtrar en el repositorio.
        private static List<CParameter> BuildParameters(SC_IMPACTO_ECONOMICOParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        // Qué hace: valida los datos del impacto económico.
        // Cómo: revisa que existan datos, que DESCRIPCION no esté vacía ni supere 150 caracteres.
        private static CResult Validate(SC_IMPACTO_ECONOMICOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos del impacto economico.");
            }

            if (string.IsNullOrWhiteSpace(Data.DESCRIPCION))
            {
                return ValidationError("Debe ingresar la descripcion del impacto economico.");
            }

            if (Data.DESCRIPCION.Trim().Length > 150)
            {
                return ValidationError("La descripcion del impacto economico no puede superar 150 caracteres.");
            }

            return null;
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
                ErrorMessage = "No se pudo guardar el impacto económico porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[SC_IMPACTO_ECONOMICOService]",
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
                ErrorSource = "[SC_IMPACTO_ECONOMICOService]",
                RowsAffected = 0
            };
        }
    }
}
