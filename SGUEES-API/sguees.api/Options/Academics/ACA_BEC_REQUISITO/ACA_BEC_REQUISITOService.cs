using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class ACA_BEC_REQUISITOService : IACA_BEC_REQUISITOService
    {
        private readonly IACA_BEC_REQUISITORepository _repo;

        public ACA_BEC_REQUISITOService(IACA_BEC_REQUISITORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(ACA_BEC_REQUISITOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetAsync(ACA_BEC_REQUISITOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_BECA_REQUISITO", Value = xWhere.CORR_BECA_REQUISITO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(ACA_BEC_REQUISITOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
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

        public async Task<CResult> UpdateAsync(ACA_BEC_REQUISITOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
            if (empresaError != null)
            {
                return empresaError;
            }

            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            if (Data.CORR_BECA_REQUISITO <= 0)
            {
                return ValidationError("No se pudo identificar el requisito a actualizar.");
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_BEC_REQUISITOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_BECA_REQUISITO <= 0)
            {
                return ValidationError("No se pudo identificar el requisito a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> ActivarInactivarAsync(ACA_BEC_REQUISITOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_BECA_REQUISITO <= 0)
            {
                return ValidationError("No se pudo identificar el requisito a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> GetTiposBecaAsync(int corrEmpresa)
        {
            var empresaError = ValidateEmpresaSesion(corrEmpresa);
            return empresaError ?? await _repo.GetTiposBecaAsync(corrEmpresa);
        }

        private static List<CParameter> BuildParameters(ACA_BEC_REQUISITOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.CORR_BECA_REQUISITO > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_BECA_REQUISITO", Value = xWhere.CORR_BECA_REQUISITO, DbType = System.Data.DbType.Int32 });
            }

            if (xWhere.CORR_BECA > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_BECA", Value = xWhere.CORR_BECA, DbType = System.Data.DbType.Int32 });
            }

            if (!string.IsNullOrWhiteSpace(xWhere.NOMBRE_REQUISITO))
            {
                p.Add(new CParameter() { ParameterName = "NOMBRE_REQUISITO", Value = xWhere.NOMBRE_REQUISITO, DbType = System.Data.DbType.String });
            }

            if (xWhere.OBLIGATORIO.HasValue)
            {
                p.Add(new CParameter() { ParameterName = "OBLIGATORIO", Value = xWhere.OBLIGATORIO, DbType = System.Data.DbType.Boolean });
            }

            if (xWhere.ACTIVO.HasValue)
            {
                p.Add(new CParameter() { ParameterName = "ACTIVO", Value = xWhere.ACTIVO, DbType = System.Data.DbType.Boolean });
            }

            return p;
        }

        private static void NormalizeData(ACA_BEC_REQUISITOTable Data)
        {
            Data.NOMBRE_REQUISITO = Data.NOMBRE_REQUISITO?.Trim();
            Data.DESCRIPCION = string.IsNullOrWhiteSpace(Data.DESCRIPCION) ? null : Data.DESCRIPCION.Trim();
        }

        private static CResult Validate(ACA_BEC_REQUISITOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos del requisito.");
            }

            if (Data.CORR_BECA <= 0)
            {
                return ValidationError("Debe seleccionar el tipo de beca.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_REQUISITO))
            {
                return ValidationError("Debe ingresar el nombre del requisito.");
            }

            if (Data.NOMBRE_REQUISITO.Trim().Length > 200)
            {
                return ValidationError("El nombre del requisito no puede superar 200 caracteres.");
            }

            if (!string.IsNullOrWhiteSpace(Data.DESCRIPCION) && Data.DESCRIPCION.Trim().Length > 1000)
            {
                return ValidationError("La descripcion del requisito no puede superar 1000 caracteres.");
            }

            return null;
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
                ErrorSource = "[ACA_BEC_REQUISITOService]",
                RowsAffected = 0
            };
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
                ErrorMessage = "No se pudo guardar el requisito porque su usuario no tiene una empresa asignada.",
                ErrorSource = "[ACA_BEC_REQUISITOService]",
                RowsAffected = 0
            };
        }
    }
}
