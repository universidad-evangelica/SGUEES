using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_RIESGO_PUESTOService : ISC_RIESGO_PUESTOService
    {
        private readonly ISC_RIESGO_PUESTORepository _repo;

        public SC_RIESGO_PUESTOService(ISC_RIESGO_PUESTORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SC_RIESGO_PUESTOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetAsync(SC_RIESGO_PUESTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_RIESGO_PUESTO", Value = xWhere.CORR_RIESGO_PUESTO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        // Devuelve los riesgos activos disponibles para el descriptor.
        public async Task<CResult> GetCatalogoDescriptorAsync(SC_RIESGO_PUESTOParam xWhere)
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

        // Valida empresa, nombre y unicidad antes de crear.
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

        // Valida la llave y excluye el registro actual al comprobar duplicados.
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

        public async Task<CResult> DeleteAsync(SC_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

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

        private static List<CParameter> BuildParameters(SC_RIESGO_PUESTOParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        // Limpia el nombre y aplica el estado activo predeterminado.
        private static void NormalizeData(SC_RIESGO_PUESTOTable Data)
        {
            Data.NOMBRE_RIESGO_PUESTO = Data.NOMBRE_RIESGO_PUESTO?.Trim();
            Data.ESTADO_RIESGO_PUESTO ??= true;
        }

        // Comprueba el nombre obligatorio y su longitud máxima.
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

        // Verifica que el nombre no pertenezca a otro riesgo de la empresa.
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
