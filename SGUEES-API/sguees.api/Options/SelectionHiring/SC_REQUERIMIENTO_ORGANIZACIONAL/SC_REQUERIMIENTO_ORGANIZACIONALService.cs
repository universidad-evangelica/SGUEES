// Qué hace: aplica las reglas de negocio del catálogo requerimiento organizacional antes de llamar al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    // Qué hace: valida los datos de requerimiento organizacional y coordina su persistencia con el repositorio.
    public class SC_REQUERIMIENTO_ORGANIZACIONALService : ISC_REQUERIMIENTO_ORGANIZACIONALService
    {
        private readonly ISC_REQUERIMIENTO_ORGANIZACIONALRepository _repo;

        public SC_REQUERIMIENTO_ORGANIZACIONALService(ISC_REQUERIMIENTO_ORGANIZACIONALRepository repo)
        {
            _repo = repo;
        }

        // Qué hace: lista los requerimientos organizacionales según los filtros recibidos.
        // Cómo: llama a GetAllAsync del repositorio con los parámetros armados en BuildParameters.
        public async Task<CResult> GetAllAsync(SC_REQUERIMIENTO_ORGANIZACIONALParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Qué hace: obtiene un requerimiento organizacional por su correlativo.
        // Cómo: llama a GetAsync del repositorio con CORR_EMPRESA y CORR_REQUERIMIENTO_ORGANIZACIONAL.
        public async Task<CResult> GetAsync(SC_REQUERIMIENTO_ORGANIZACIONALParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_REQUERIMIENTO_ORGANIZACIONAL", Value = xWhere.CORR_REQUERIMIENTO_ORGANIZACIONAL, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: crea un requerimiento organizacional nuevo.
        // Cómo: valida empresa de sesión y datos con Validate, normaliza la descripción y llama a CreateAsync del repositorio.
        public async Task<CResult> CreateAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            var duplicate = await ValidateUniqueDescripcionAsync(Data, null);
            if (duplicate != null)
            {
                return duplicate;
            }

            NormalizeData(Data);
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: actualiza un requerimiento organizacional existente.
        // Cómo: valida empresa, datos y llave; normaliza la descripción y llama a UpdateAsync del repositorio.
        public async Task<CResult> UpdateAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            if (Data.CORR_REQUERIMIENTO_ORGANIZACIONAL <= 0)
            {
                return ValidationError("No se pudo identificar el requerimiento organizacional a actualizar.");
            }

            var duplicate = await ValidateUniqueDescripcionAsync(Data, Data.CORR_REQUERIMIENTO_ORGANIZACIONAL);
            if (duplicate != null)
            {
                return duplicate;
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: elimina un requerimiento organizacional.
        // Cómo: valida la empresa de sesión y llama a DeleteAsync del repositorio.
        public async Task<CResult> DeleteAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: cambia el estado activo/inactivo de un requerimiento organizacional.
        // Cómo: valida empresa y llave; llama a ActivarInactivarAsync del repositorio.
        public async Task<CResult> ActivarInactivarAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_REQUERIMIENTO_ORGANIZACIONAL <= 0)
            {
                return ValidationError("No se pudo identificar el requerimiento organizacional a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: entrega los requerimientos organizacionales activos disponibles para el descriptor.
        // Cómo: llama a GetCatalogoDescriptorAsync del repositorio y arma el CResult con el listado.
        public async Task<CResult> GetCatalogoDescriptorAsync(SC_REQUERIMIENTO_ORGANIZACIONALParam xWhere)
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

        // Qué hace: arma el parámetro CORR_EMPRESA para filtrar en el repositorio.
        private static List<CParameter> BuildParameters(SC_REQUERIMIENTO_ORGANIZACIONALParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        // Qué hace: normaliza los datos antes de guardar.
        // Cómo: recorta espacios de la descripción y fija ESTADO_REQUERIMIENTO_ORGANIZACIONAL en true si viene vacío.
        private static void NormalizeData(SC_REQUERIMIENTO_ORGANIZACIONALTable Data)
        {
            Data.DESCRIPCION = Data.DESCRIPCION?.Trim();
            Data.ESTADO_REQUERIMIENTO_ORGANIZACIONAL ??= true;
        }

        // Qué hace: valida los datos del requerimiento organizacional.
        // Cómo: revisa que existan datos, que la descripción no esté vacía ni supere 200 caracteres.
        private static CResult Validate(SC_REQUERIMIENTO_ORGANIZACIONALTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de requerimiento organizacional.");
            }

            if (string.IsNullOrWhiteSpace(Data.DESCRIPCION))
            {
                return ValidationError("Debe ingresar la descripcion de requerimiento organizacional.");
            }

            if (Data.DESCRIPCION.Trim().Length > 200)
            {
                return ValidationError("La descripcion de requerimiento organizacional no puede superar 200 caracteres.");
            }

            return null;
        }

        // Qué hace: verifica que la descripción no pertenezca a otro requerimiento de la empresa.
        // Cómo: llama a ExistsDescripcionAsync del repositorio excluyendo el correlativo indicado.
        private async Task<CResult> ValidateUniqueDescripcionAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, int? excludeCorr)
        {
            var exists = await _repo.ExistsDescripcionAsync(
                Data.CORR_EMPRESA,
                Data.DESCRIPCION,
                excludeCorr ?? 0);

            return exists
                ? ValidationError($"Ya existe un requerimiento organizacional con la descripcion {Data.DESCRIPCION}.")
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
                ErrorMessage = "No se pudo guardar el requerimiento organizacional porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[SC_REQUERIMIENTO_ORGANIZACIONALService]",
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
                ErrorSource = "[SC_REQUERIMIENTO_ORGANIZACIONALService]",
                RowsAffected = 0
            };
        }
    }
}
