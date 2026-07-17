using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_DISPONIBILIDAD_HORARIOService : ISC_DISPONIBILIDAD_HORARIOService
    {
        private readonly ISC_DISPONIBILIDAD_HORARIORepository _repo;

        public SC_DISPONIBILIDAD_HORARIOService(ISC_DISPONIBILIDAD_HORARIORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SC_DISPONIBILIDAD_HORARIOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetDisponibilidadesActivasAsync(SC_DISPONIBILIDAD_HORARIOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetDisponibilidadesActivasAsync(p);
        }

        public async Task<CResult> GetAsync(SC_DISPONIBILIDAD_HORARIOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_DISPONIBILIDAD_HORARIO", Value = xWhere.CORR_DISPONIBILIDAD_HORARIO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

        public async Task<CResult> UpdateAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            if (Data.CORR_DISPONIBILIDAD_HORARIO <= 0)
            {
                return ValidationError("No se pudo identificar la disponibilidad de horario a actualizar.");
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> ActivarInactivarAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_DISPONIBILIDAD_HORARIO <= 0)
            {
                return ValidationError("No se pudo identificar la disponibilidad de horario a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private static List<CParameter> BuildParameters(SC_DISPONIBILIDAD_HORARIOParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        private static void NormalizeData(SC_DISPONIBILIDAD_HORARIOTable Data)
        {
            Data.NOMBRE_DISPONIBILIDAD_HORARIO = Data.NOMBRE_DISPONIBILIDAD_HORARIO?.Trim();
            Data.ESTADO_DISPONIBILIDAD_HORARIO ??= true;
        }

        private static CResult Validate(SC_DISPONIBILIDAD_HORARIOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de la disponibilidad de horario.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_DISPONIBILIDAD_HORARIO))
            {
                return ValidationError("Debe ingresar el nombre de la disponibilidad de horario.");
            }

            if (Data.NOMBRE_DISPONIBILIDAD_HORARIO.Trim().Length > 150)
            {
                return ValidationError("El nombre de la disponibilidad de horario no puede superar 150 caracteres.");
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
                ErrorMessage = "No se pudo guardar la disponibilidad de horario porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[SC_DISPONIBILIDAD_HORARIOService]",
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
                ErrorSource = "[SC_DISPONIBILIDAD_HORARIOService]",
                RowsAffected = 0
            };
        }
    }
}
