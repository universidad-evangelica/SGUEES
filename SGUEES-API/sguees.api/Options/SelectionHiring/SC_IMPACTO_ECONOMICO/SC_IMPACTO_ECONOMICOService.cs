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

        // Devuelve los impactos activos disponibles para el descriptor.
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

        // Valida y normaliza la descripción antes de crear.
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

        // Valida la llave y descripción antes de actualizar.
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

        public async Task<CResult> DeleteAsync(SC_IMPACTO_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

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

        private static List<CParameter> BuildParameters(SC_IMPACTO_ECONOMICOParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        // Comprueba la descripción obligatoria y su longitud máxima.
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
