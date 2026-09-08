using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class ACA_BEC_FINANCIADORService : IACA_BEC_FINANCIADORService
    {
        private readonly IACA_BEC_FINANCIADORRepository _repo;

        public ACA_BEC_FINANCIADORService(IACA_BEC_FINANCIADORRepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(ACA_BEC_FINANCIADORParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetAsync(ACA_BEC_FINANCIADORParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_BECA_FINANCIADOR", Value = xWhere.CORR_BECA_FINANCIADOR, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(ACA_BEC_FINANCIADORTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

        public async Task<CResult> UpdateAsync(ACA_BEC_FINANCIADORTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            if (Data.CORR_BECA_FINANCIADOR <= 0)
            {
                return ValidationError("No se pudo identificar el financiador a actualizar.");
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_BEC_FINANCIADORTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_BECA_FINANCIADOR <= 0)
            {
                return ValidationError("No se pudo identificar el financiador a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> ActivarInactivarAsync(ACA_BEC_FINANCIADORTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_BECA_FINANCIADOR <= 0)
            {
                return ValidationError("No se pudo identificar el financiador a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> GetTiposBecaAsync(int corrEmpresa)
        {
            var empresaError = ValidateEmpresaSesion(corrEmpresa);
            return empresaError ?? await _repo.GetTiposBecaAsync(corrEmpresa);
        }

        public async Task<CResult> GetEntidadesFinanciadorasAsync(int corrEmpresa)
        {
            var empresaError = ValidateEmpresaSesion(corrEmpresa);
            return empresaError ?? await _repo.GetEntidadesFinanciadorasAsync(corrEmpresa);
        }

        private static List<CParameter> BuildParameters(ACA_BEC_FINANCIADORParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.CORR_BECA_FINANCIADOR > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_BECA_FINANCIADOR", Value = xWhere.CORR_BECA_FINANCIADOR, DbType = System.Data.DbType.Int32 });
            }

            if (xWhere.CORR_BECA > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_BECA", Value = xWhere.CORR_BECA, DbType = System.Data.DbType.Int32 });
            }

            if (xWhere.CORR_ENTIDAD_FINANCIADORA > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_ENTIDAD_FINANCIADORA", Value = xWhere.CORR_ENTIDAD_FINANCIADORA, DbType = System.Data.DbType.Int32 });
            }

            if (!string.IsNullOrWhiteSpace(xWhere.CONCEPTO_COBERTURA))
            {
                p.Add(new CParameter() { ParameterName = "CONCEPTO_COBERTURA", Value = xWhere.CONCEPTO_COBERTURA, DbType = System.Data.DbType.String });
            }

            if (xWhere.ACTIVO.HasValue)
            {
                p.Add(new CParameter() { ParameterName = "ACTIVO", Value = xWhere.ACTIVO, DbType = System.Data.DbType.Boolean });
            }

            return p;
        }

        private static void NormalizeData(ACA_BEC_FINANCIADORTable Data)
        {
            Data.CONCEPTO_COBERTURA = Data.CONCEPTO_COBERTURA?.Trim().ToUpperInvariant();
        }

        private static CResult Validate(ACA_BEC_FINANCIADORTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos del financiador.");
            }

            if (Data.CORR_BECA <= 0)
            {
                return ValidationError("Debe seleccionar el tipo de beca.");
            }

            if (Data.CORR_ENTIDAD_FINANCIADORA <= 0)
            {
                return ValidationError("Debe seleccionar la entidad financiadora.");
            }

            if (string.IsNullOrWhiteSpace(Data.CONCEPTO_COBERTURA))
            {
                return ValidationError("Debe ingresar el concepto de cobertura.");
            }

            if (Data.CONCEPTO_COBERTURA.Trim().Length > 50)
            {
                return ValidationError("El concepto de cobertura no puede superar 50 caracteres.");
            }

            if (Data.PORCENTAJE_COBERTURA < 0 || Data.PORCENTAJE_COBERTURA > 100)
            {
                return ValidationError("El porcentaje de cobertura debe estar entre 0 y 100.");
            }

            if (Data.MONTO_MAXIMO.HasValue && Data.MONTO_MAXIMO.Value < 0)
            {
                return ValidationError("El monto maximo no puede ser negativo.");
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
                ErrorSource = "[ACA_BEC_FINANCIADORService]",
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
                ErrorMessage = "No se pudo guardar el financiador porque su usuario no tiene una empresa asignada.",
                ErrorSource = "[ACA_BEC_FINANCIADORService]",
                RowsAffected = 0
            };
        }
    }
}
