using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_RESPONSABILIDAD_CARGOService : ISC_RESPONSABILIDAD_CARGOService
    {
        private readonly ISC_RESPONSABILIDAD_CARGORepository _repo;

        public SC_RESPONSABILIDAD_CARGOService(ISC_RESPONSABILIDAD_CARGORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SC_RESPONSABILIDAD_CARGOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetAsync(SC_RESPONSABILIDAD_CARGOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_RESPONSABILIDAD", Value = xWhere.CORR_RESPONSABILIDAD, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

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

        public async Task<CResult> DeleteAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

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

        private static List<CParameter> BuildParameters(SC_RESPONSABILIDAD_CARGOParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        private static void NormalizeData(SC_RESPONSABILIDAD_CARGOTable Data)
        {
            Data.NOMBRE_RESPONSABILIDAD = Data.NOMBRE_RESPONSABILIDAD?.Trim();
            Data.ESTADO_RESPONSABILIDAD ??= true;
        }

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

            return null;
        }

        private async Task<CResult> ValidateUniqueNombreAsync(SC_RESPONSABILIDAD_CARGOTable Data, int? excludeCorr)
        {
            var exists = await _repo.ExistsNombreAsync(
                Data.CORR_EMPRESA,
                Data.NOMBRE_RESPONSABILIDAD,
                excludeCorr ?? 0);

            return exists
                ? ValidationError($"Ya existe una responsabilidad de cargo con el nombre {Data.NOMBRE_RESPONSABILIDAD}.")
                : null;
        }

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
