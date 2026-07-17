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

        // Devuelve responsabilidades activas y aplicables al descriptor.
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

        // Valida nombre, aplicación y unicidad antes de crear.
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

        // Valida la llave y excluye el registro actual al comprobar duplicados.
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

        // Limpia el nombre y estandariza el tipo de descriptor.
        private static void NormalizeData(SC_RESPONSABILIDAD_CARGOTable Data)
        {
            Data.NOMBRE_RESPONSABILIDAD = Data.NOMBRE_RESPONSABILIDAD?.Trim();
            Data.APLICA_DESCRIPTOR = Data.APLICA_DESCRIPTOR?.Trim().ToUpperInvariant();
            Data.ESTADO_RESPONSABILIDAD ??= true;
        }

        // Comprueba nombre y valores permitidos de aplicación al descriptor.
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

        // Verifica que el nombre no pertenezca a otra responsabilidad de la empresa.
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

