// Qué hace: aplica las reglas de negocio del catálogo inducción antes de llamar al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    // Qué hace: valida los datos de inducción y coordina su persistencia con el repositorio.
    public class SC_INDUCCIONService : ISC_INDUCCIONService
    {
        private readonly ISC_INDUCCIONRepository _repo;

        public SC_INDUCCIONService(ISC_INDUCCIONRepository repo)
        {
            _repo = repo;
        }

        // Qué hace: entrega las inducciones activas disponibles para el descriptor.
        // Cómo: llama a GetCatalogoDescriptorAsync del repositorio y arma el CResult con el listado.
        public async Task<CResult> GetCatalogoDescriptorAsync(SC_INDUCCIONParam xWhere)
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

        // Qué hace: lista las inducciones según los filtros recibidos.
        // Cómo: llama a GetAllAsync del repositorio con los parámetros armados en BuildParameters.
        public async Task<CResult> GetAllAsync(SC_INDUCCIONParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Qué hace: obtiene una inducción por su correlativo.
        // Cómo: llama a GetAsync del repositorio con CORR_EMPRESA y CORR_INDUCCION.
        public async Task<CResult> GetAsync(SC_INDUCCIONParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_INDUCCION", Value = xWhere.CORR_INDUCCION, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: crea una inducción nueva.
        // Cómo: valida empresa de sesión y datos con Validate, normaliza el nombre y llama a CreateAsync del repositorio.
        public async Task<CResult> CreateAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

        // Qué hace: actualiza una inducción existente.
        // Cómo: valida empresa, datos y llave; normaliza el nombre y llama a UpdateAsync del repositorio.
        public async Task<CResult> UpdateAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            if (Data.CORR_INDUCCION <= 0)
            {
                return ValidationError("No se pudo identificar la induccion a actualizar.");
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: elimina una inducción.
        // Cómo: valida la empresa de sesión y llama a DeleteAsync del repositorio.
        public async Task<CResult> DeleteAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: cambia el estado activo/inactivo de una inducción.
        // Cómo: valida empresa y llave; llama a ActivarInactivarAsync del repositorio.
        public async Task<CResult> ActivarInactivarAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_INDUCCION <= 0)
            {
                return ValidationError("No se pudo identificar la induccion a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: arma el parámetro CORR_EMPRESA para filtrar en el repositorio.
        private static List<CParameter> BuildParameters(SC_INDUCCIONParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        // Qué hace: normaliza los datos antes de guardar.
        // Cómo: recorta espacios del nombre y fija ESTADO_INDUCCION en true si viene vacío.
        private static void NormalizeData(SC_INDUCCIONTable Data)
        {
            Data.NOMBRE_INDUCCION = Data.NOMBRE_INDUCCION?.Trim();
            Data.ESTADO_INDUCCION ??= true;
        }

        // Qué hace: valida los datos de la inducción.
        // Cómo: revisa que existan datos, que el nombre no esté vacío ni supere 200 caracteres, y que las semanas sean mayores a 0.
        private static CResult Validate(SC_INDUCCIONTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de induccion.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_INDUCCION))
            {
                return ValidationError("Debe ingresar el nombre de induccion.");
            }

            if (Data.NOMBRE_INDUCCION.Trim().Length > 200)
            {
                return ValidationError("El nombre de induccion no puede superar 200 caracteres.");
            }

            if (Data.SEMANAS_INDUCCION <= 0)
            {
                return ValidationError("Debe ingresar semanas de induccion mayores a 0.");
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
                ErrorMessage = "No se pudo guardar la inducción porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[SC_INDUCCIONService]",
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
                ErrorSource = "[SC_INDUCCIONService]",
                RowsAffected = 0
            };
        }
    }
}
