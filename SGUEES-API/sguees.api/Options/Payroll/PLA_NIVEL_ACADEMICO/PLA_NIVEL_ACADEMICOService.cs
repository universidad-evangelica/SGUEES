// Qué hace: aplica las reglas de negocio del catálogo nivel académico antes de llamar al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    // Qué hace: valida los datos de nivel académico y coordina su persistencia con el repositorio.
    public class PLA_NIVEL_ACADEMICOService : IPLA_NIVEL_ACADEMICOService
    {
        private readonly IPLA_NIVEL_ACADEMICORepository _repo;

        public PLA_NIVEL_ACADEMICOService(IPLA_NIVEL_ACADEMICORepository repo)
        {
            _repo = repo;
        }

        // Qué hace: lista los niveles académicos según los filtros recibidos.
        // Cómo: llama a GetAllAsync del repositorio con los parámetros armados en BuildParameters.
        public async Task<CResult> GetAllAsync(PLA_NIVEL_ACADEMICOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Qué hace: obtiene un nivel académico por su correlativo.
        // Cómo: llama a GetAsync del repositorio con CORR_EMPRESA y CORR_NIVEL_ACADEMICO.
        public async Task<CResult> GetAsync(PLA_NIVEL_ACADEMICOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_NIVEL_ACADEMICO", Value = xWhere.CORR_NIVEL_ACADEMICO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: crea un nivel académico nuevo.
        // Cómo: valida empresa de sesión y datos con Validate, normaliza el nombre y llama a CreateAsync del repositorio.
        public async Task<CResult> CreateAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

        // Qué hace: actualiza un nivel académico existente.
        // Cómo: valida empresa, datos y llave; normaliza el nombre y llama a UpdateAsync del repositorio.
        public async Task<CResult> UpdateAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            if (Data.CORR_NIVEL_ACADEMICO <= 0)
            {
                return ValidationError("No se pudo identificar el nivel academico a actualizar.");
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: elimina un nivel académico de la empresa en sesión.
        // Cómo: valida la empresa con ValidateEmpresaSesion y llama a DeleteAsync del repositorio.
        public async Task<CResult> DeleteAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: cambia el estado activo/inactivo de un nivel académico.
        // Cómo: valida empresa y llave, luego llama a ActivarInactivarAsync del repositorio.
        public async Task<CResult> ActivarInactivarAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_NIVEL_ACADEMICO <= 0)
            {
                return ValidationError("No se pudo identificar el nivel academico a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: arma los parámetros de consulta limitados a la empresa actual.
        private static List<CParameter> BuildParameters(PLA_NIVEL_ACADEMICOParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        // Qué hace: normaliza el nombre y el estado antes de persistir.
        // Cómo: recorta NOMBRE_NIVEL_ACADEMICO y deja ESTADO_NIVEL_ACADEMICO en true si no fue informado.
        private static void NormalizeData(PLA_NIVEL_ACADEMICOTable Data)
        {
            Data.NOMBRE_NIVEL_ACADEMICO = Data.NOMBRE_NIVEL_ACADEMICO?.Trim();
            Data.ESTADO_NIVEL_ACADEMICO ??= true;
        }

        // Qué hace: valida los datos obligatorios del nivel académico.
        // Cómo: revisa que el nombre no esté vacío y no supere 150 caracteres.
        private static CResult Validate(PLA_NIVEL_ACADEMICOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos del nivel academico.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_NIVEL_ACADEMICO))
            {
                return ValidationError("Debe ingresar el nombre del nivel academico.");
            }

            if (Data.NOMBRE_NIVEL_ACADEMICO.Trim().Length > 150)
            {
                return ValidationError("El nombre del nivel academico no puede superar 150 caracteres.");
            }

            return null;
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
                ErrorMessage = "No se pudo guardar el nivel academico porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[PLA_NIVEL_ACADEMICOService]",
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
                ErrorSource = "[PLA_NIVEL_ACADEMICOService]",
                RowsAffected = 0
            };
        }
    }
}
