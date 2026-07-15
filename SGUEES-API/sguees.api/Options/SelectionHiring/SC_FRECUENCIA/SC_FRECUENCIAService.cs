using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_FRECUENCIAService : ISC_FRECUENCIAService
    {
        private readonly ISC_FRECUENCIARepository _repo;

        public SC_FRECUENCIAService(ISC_FRECUENCIARepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SC_FRECUENCIAParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetFrecuenciasActivasAsync(SC_FRECUENCIAParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetFrecuenciasActivasAsync(p);
        }

        public async Task<CResult> GetAsync(SC_FRECUENCIAParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_FRECUENCIA", Value = xWhere.CORR_FRECUENCIA, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
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

        public async Task<CResult> UpdateAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            if (Data.CORR_FRECUENCIA <= 0)
            {
                return ValidationError("No se pudo identificar la frecuencia a actualizar.");
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> ActivarInactivarAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_FRECUENCIA <= 0)
            {
                return ValidationError("No se pudo identificar la frecuencia a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private static List<CParameter> BuildParameters(SC_FRECUENCIAParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        private static void NormalizeData(SC_FRECUENCIATable Data)
        {
            Data.NOMBRE_FRECUENCIA = Data.NOMBRE_FRECUENCIA?.Trim();
            Data.ESTADO_FRECUENCIA ??= true;
        }

        private static CResult Validate(SC_FRECUENCIATable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de la frecuencia.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_FRECUENCIA))
            {
                return ValidationError("Debe ingresar el nombre de la frecuencia.");
            }

            if (Data.NOMBRE_FRECUENCIA.Trim().Length > 50)
            {
                return ValidationError("El nombre de la frecuencia no puede superar 50 caracteres.");
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
                ErrorMessage = "No se pudo guardar la frecuencia porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[SC_FRECUENCIAService]",
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
                ErrorSource = "[SC_FRECUENCIAService]",
                RowsAffected = 0
            };
        }
    }
}
