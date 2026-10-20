using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class ACA_BEC_DOCUMENTO_REQUERIDOService : IACA_BEC_DOCUMENTO_REQUERIDOService
    {
        private readonly IACA_BEC_DOCUMENTO_REQUERIDORepository _repo;

        public ACA_BEC_DOCUMENTO_REQUERIDOService(IACA_BEC_DOCUMENTO_REQUERIDORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(ACA_BEC_DOCUMENTO_REQUERIDOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetAsync(ACA_BEC_DOCUMENTO_REQUERIDOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_BECA_DOCUMENTO_REQUERIDO", Value = xWhere.CORR_BECA_DOCUMENTO_REQUERIDO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(ACA_BEC_DOCUMENTO_REQUERIDOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

        public async Task<CResult> UpdateAsync(ACA_BEC_DOCUMENTO_REQUERIDOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            if (Data.CORR_BECA_DOCUMENTO_REQUERIDO <= 0)
            {
                return ValidationError("No se pudo identificar el documento requerido a actualizar.");
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_BEC_DOCUMENTO_REQUERIDOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_BECA_DOCUMENTO_REQUERIDO <= 0)
            {
                return ValidationError("No se pudo identificar el documento requerido a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> ActivarInactivarAsync(ACA_BEC_DOCUMENTO_REQUERIDOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_BECA_DOCUMENTO_REQUERIDO <= 0)
            {
                return ValidationError("No se pudo identificar el documento requerido a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> GetTiposBecaAsync(int corrEmpresa)
        {
            var empresaError = ValidateEmpresaSesion(corrEmpresa);
            return empresaError ?? await _repo.GetTiposBecaAsync(corrEmpresa);
        }

        private static List<CParameter> BuildParameters(ACA_BEC_DOCUMENTO_REQUERIDOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.CORR_BECA_DOCUMENTO_REQUERIDO > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_BECA_DOCUMENTO_REQUERIDO", Value = xWhere.CORR_BECA_DOCUMENTO_REQUERIDO, DbType = System.Data.DbType.Int32 });
            }

            if (xWhere.CORR_BECA > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_BECA", Value = xWhere.CORR_BECA, DbType = System.Data.DbType.Int32 });
            }

            if (!string.IsNullOrWhiteSpace(xWhere.NOMBRE_DOCUMENTO))
            {
                p.Add(new CParameter() { ParameterName = "NOMBRE_DOCUMENTO", Value = xWhere.NOMBRE_DOCUMENTO, DbType = System.Data.DbType.String });
            }

            if (!string.IsNullOrWhiteSpace(xWhere.AREA_RECEPTORA))
            {
                p.Add(new CParameter() { ParameterName = "AREA_RECEPTORA", Value = xWhere.AREA_RECEPTORA, DbType = System.Data.DbType.String });
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

        private static void NormalizeData(ACA_BEC_DOCUMENTO_REQUERIDOTable Data)
        {
            Data.NOMBRE_DOCUMENTO = Data.NOMBRE_DOCUMENTO?.Trim();
            Data.AREA_RECEPTORA = Data.AREA_RECEPTORA?.Trim().ToUpperInvariant();
        }

        private static CResult Validate(ACA_BEC_DOCUMENTO_REQUERIDOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos del documento requerido.");
            }

            if (Data.CORR_BECA <= 0)
            {
                return ValidationError("Debe seleccionar el tipo de beca.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_DOCUMENTO))
            {
                return ValidationError("Debe ingresar el nombre del documento requerido.");
            }

            if (Data.NOMBRE_DOCUMENTO.Trim().Length > 200)
            {
                return ValidationError("El nombre del documento requerido no puede superar 200 caracteres.");
            }

            if (string.IsNullOrWhiteSpace(Data.AREA_RECEPTORA))
            {
                return ValidationError("Debe seleccionar o ingresar el area receptora.");
            }

            if (Data.AREA_RECEPTORA.Trim().Length > 40)
            {
                return ValidationError("El area receptora no puede superar 40 caracteres.");
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
                ErrorSource = "[ACA_BEC_DOCUMENTO_REQUERIDOService]",
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
                ErrorMessage = "No se pudo guardar el documento requerido porque su usuario no tiene una empresa asignada.",
                ErrorSource = "[ACA_BEC_DOCUMENTO_REQUERIDOService]",
                RowsAffected = 0
            };
        }
    }
}

