using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_IMPACTO_ECONOMICOService : ISC_IMPACTO_ECONOMICOService
    {
        private readonly ISC_IMPACTO_ECONOMICORepository _repo;

        public SC_IMPACTO_ECONOMICOService(ISC_IMPACTO_ECONOMICORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SC_IMPACTO_ECONOMICOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetAsync(SC_IMPACTO_ECONOMICOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_IMPACTO_ECONOMICO", Value = xWhere.CORR_IMPACTO_ECONOMICO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

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

            var duplicate = await ValidateUniqueDescripcionAsync(Data, null);
            if (duplicate != null)
            {
                return duplicate;
            }

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

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

            var duplicate = await ValidateUniqueDescripcionAsync(Data, Data.CORR_IMPACTO_ECONOMICO);
            if (duplicate != null)
            {
                return duplicate;
            }

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SC_IMPACTO_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DesactivarAsync(SC_IMPACTO_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            Data.ESTADO_IMPACTO_ECONOMICO = false;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private static List<CParameter> BuildParameters(SC_IMPACTO_ECONOMICOParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "PAGE", Value = xWhere.PAGE, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "PAGE_SIZE", Value = xWhere.PAGE_SIZE, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "SORT_FIELD", Value = xWhere.SORT_FIELD, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "SORT_DESC", Value = xWhere.SORT_DESC, DbType = System.Data.DbType.Boolean },
            };
        }

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

        private async Task<CResult> ValidateUniqueDescripcionAsync(SC_IMPACTO_ECONOMICOTable Data, int? excludeCorr)
        {
            var exists = await _repo.ExistsDescripcionAsync(
                Data.CORR_EMPRESA,
                Data.DESCRIPCION,
                excludeCorr ?? 0);

            return exists
                ? ValidationError($"Ya existe un impacto economico con la descripcion {Data.DESCRIPCION}.")
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
                ErrorMessage = "No se pudo guardar el impacto económico porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[SC_IMPACTO_ECONOMICOService]",
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
                ErrorSource = "[SC_IMPACTO_ECONOMICOService]",
                RowsAffected = 0
            };
        }
    }
}
