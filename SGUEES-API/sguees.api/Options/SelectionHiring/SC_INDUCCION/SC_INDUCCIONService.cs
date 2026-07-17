using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_INDUCCIONService : ISC_INDUCCIONService
    {
        private readonly ISC_INDUCCIONRepository _repo;

        public SC_INDUCCIONService(ISC_INDUCCIONRepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetCatalogoDescriptorAsync(SC_INDUCCIONParam xWhere)
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

        public async Task<CResult> GetAllAsync(SC_INDUCCIONParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetAsync(SC_INDUCCIONParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_INDUCCION", Value = xWhere.CORR_INDUCCION, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

        public async Task<CResult> UpdateAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            if (Data.CORR_INDUCCION <= 0)
            {
                return ValidationError("No se pudo identificar la induccion a actualizar.");
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> ActivarInactivarAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_INDUCCION <= 0)
            {
                return ValidationError("No se pudo identificar la induccion a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private static List<CParameter> BuildParameters(SC_INDUCCIONParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        private static void NormalizeData(SC_INDUCCIONTable Data)
        {
            Data.NOMBRE_INDUCCION = Data.NOMBRE_INDUCCION?.Trim();
            Data.ESTADO_INDUCCION ??= true;
        }

        private static CResult Validate(SC_INDUCCIONTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de induccion.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_INDUCCION))
            {
                return ValidationError("Debe ingresar el nombre de induccion.");
            }

            if (Data.NOMBRE_INDUCCION.Trim().Length > 200)
            {
                return ValidationError("El nombre de induccion no puede superar 200 caracteres.");
            }

            if (Data.SEMANAS_INDUCCION <= 0)
            {
                return ValidationError("Debe ingresar semanas de induccion mayores a 0.");
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
                ErrorMessage = "No se pudo guardar la inducción porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[SC_INDUCCIONService]",
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
                ErrorSource = "[SC_INDUCCIONService]",
                RowsAffected = 0
            };
        }
    }
}
