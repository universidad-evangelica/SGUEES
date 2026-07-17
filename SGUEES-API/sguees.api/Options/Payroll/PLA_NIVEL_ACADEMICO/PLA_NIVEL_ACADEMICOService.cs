using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    // Valida y orquesta el mantenimiento de nivel académico vía repositorio.
    public class PLA_NIVEL_ACADEMICOService : IPLA_NIVEL_ACADEMICOService
    {
        private readonly IPLA_NIVEL_ACADEMICORepository _repo;

        public PLA_NIVEL_ACADEMICOService(IPLA_NIVEL_ACADEMICORepository repo)
        {
            _repo = repo;
        }

        // Consulta todos los niveles académicos de la empresa indicada.
        public async Task<CResult> GetAllAsync(PLA_NIVEL_ACADEMICOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Obtiene un nivel por empresa y correlativo.
        public async Task<CResult> GetAsync(PLA_NIVEL_ACADEMICOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_NIVEL_ACADEMICO", Value = xWhere.CORR_NIVEL_ACADEMICO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        // Valida y normaliza los datos antes de crear el nivel académico.
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

        // Valida la empresa, los datos y el identificador antes de actualizar.
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

        // Verifica la empresa de sesión antes de solicitar la eliminación.
        public async Task<CResult> DeleteAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida el registro antes de cambiar su estado activo o inactivo.
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

        // Construye los parámetros que limitan la consulta a la empresa actual.
        private static List<CParameter> BuildParameters(PLA_NIVEL_ACADEMICOParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        // Limpia el nombre y aplica el estado activo cuando no fue informado.
        private static void NormalizeData(PLA_NIVEL_ACADEMICOTable Data)
        {
            Data.NOMBRE_NIVEL_ACADEMICO = Data.NOMBRE_NIVEL_ACADEMICO?.Trim();
            Data.ESTADO_NIVEL_ACADEMICO ??= true;
        }

        // Comprueba los datos obligatorios y la longitud permitida del nombre.
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
                ErrorMessage = "No se pudo guardar el nivel academico porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[PLA_NIVEL_ACADEMICOService]",
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
                ErrorSource = "[PLA_NIVEL_ACADEMICOService]",
                RowsAffected = 0
            };
        }
    }
}
