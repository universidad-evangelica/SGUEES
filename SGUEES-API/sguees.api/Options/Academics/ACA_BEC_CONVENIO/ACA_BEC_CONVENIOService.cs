using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class ACA_BEC_CONVENIOService : IACA_BEC_CONVENIOService
    {
        private static readonly string[] EstadosValidos = { "VIGENTE", "VENCIDO", "SUSPENDIDO", "CERRADO" };
        private readonly IACA_BEC_CONVENIORepository _repo;

        public ACA_BEC_CONVENIOService(IACA_BEC_CONVENIORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(ACA_BEC_CONVENIOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetAsync(ACA_BEC_CONVENIOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_CONVENIO", Value = xWhere.CORR_CONVENIO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(ACA_BEC_CONVENIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

        public async Task<CResult> UpdateAsync(ACA_BEC_CONVENIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            if (Data.CORR_CONVENIO <= 0)
            {
                return ValidationError("No se pudo identificar el convenio a actualizar.");
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_BEC_CONVENIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_CONVENIO <= 0)
            {
                return ValidationError("No se pudo identificar el convenio a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> ActivarInactivarAsync(ACA_BEC_CONVENIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_CONVENIO <= 0)
            {
                return ValidationError("No se pudo identificar el convenio a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> GetEntidadesFinanciadorasAsync(int corrEmpresa)
        {
            var empresaError = ValidateEmpresaSesion(corrEmpresa);
            return empresaError ?? await _repo.GetEntidadesFinanciadorasAsync(corrEmpresa);
        }

        private static List<CParameter> BuildParameters(ACA_BEC_CONVENIOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.CORR_CONVENIO > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_CONVENIO", Value = xWhere.CORR_CONVENIO, DbType = System.Data.DbType.Int32 });
            }

            if (!string.IsNullOrWhiteSpace(xWhere.CODIGO_CONVENIO))
            {
                p.Add(new CParameter() { ParameterName = "CODIGO_CONVENIO", Value = xWhere.CODIGO_CONVENIO, DbType = System.Data.DbType.String });
            }

            if (!string.IsNullOrWhiteSpace(xWhere.NOMBRE_CONVENIO))
            {
                p.Add(new CParameter() { ParameterName = "NOMBRE_CONVENIO", Value = xWhere.NOMBRE_CONVENIO, DbType = System.Data.DbType.String });
            }

            if (xWhere.CORR_ENTIDAD_FINANCIADORA > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_ENTIDAD_FINANCIADORA", Value = xWhere.CORR_ENTIDAD_FINANCIADORA, DbType = System.Data.DbType.Int32 });
            }

            if (!string.IsNullOrWhiteSpace(xWhere.ESTADO_CONVENIO))
            {
                p.Add(new CParameter() { ParameterName = "ESTADO_CONVENIO", Value = xWhere.ESTADO_CONVENIO, DbType = System.Data.DbType.String });
            }

            return p;
        }

        private static void NormalizeData(ACA_BEC_CONVENIOTable Data)
        {
            Data.CODIGO_CONVENIO = Data.CODIGO_CONVENIO?.Trim().ToUpperInvariant();
            Data.NOMBRE_CONVENIO = Data.NOMBRE_CONVENIO?.Trim();
            Data.DESCRIPCION = NormalizeOptional(Data.DESCRIPCION);
            Data.ESTADO_CONVENIO = string.IsNullOrWhiteSpace(Data.ESTADO_CONVENIO)
                ? "VIGENTE"
                : Data.ESTADO_CONVENIO.Trim().ToUpperInvariant();
        }

        private static CResult Validate(ACA_BEC_CONVENIOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos del convenio.");
            }

            if (string.IsNullOrWhiteSpace(Data.CODIGO_CONVENIO))
            {
                return ValidationError("Debe ingresar el codigo del convenio.");
            }

            if (Data.CODIGO_CONVENIO.Trim().Length > 50)
            {
                return ValidationError("El codigo del convenio no puede superar 50 caracteres.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_CONVENIO))
            {
                return ValidationError("Debe ingresar el nombre del convenio.");
            }

            if (Data.NOMBRE_CONVENIO.Trim().Length > 200)
            {
                return ValidationError("El nombre del convenio no puede superar 200 caracteres.");
            }

            if (Data.CORR_ENTIDAD_FINANCIADORA <= 0)
            {
                return ValidationError("Debe seleccionar la entidad financiadora.");
            }

            if (Data.FECHA_INICIO == DateTime.MinValue)
            {
                return ValidationError("Debe ingresar la fecha de inicio del convenio.");
            }

            if (Data.FECHA_FIN.HasValue && Data.FECHA_FIN.Value.Date < Data.FECHA_INICIO.Date)
            {
                return ValidationError("La fecha fin no puede ser menor que la fecha de inicio.");
            }

            if (!string.IsNullOrWhiteSpace(Data.DESCRIPCION) && Data.DESCRIPCION.Trim().Length > 1000)
            {
                return ValidationError("La descripcion no puede superar 1000 caracteres.");
            }

            var estado = string.IsNullOrWhiteSpace(Data.ESTADO_CONVENIO)
                ? "VIGENTE"
                : Data.ESTADO_CONVENIO.Trim().ToUpperInvariant();

            if (!EstadosValidos.Contains(estado))
            {
                return ValidationError("El estado del convenio debe ser VIGENTE, VENCIDO, SUSPENDIDO o CERRADO.");
            }

            return null;
        }

        private static string NormalizeOptional(string value)
        {
            var normalized = value?.Trim();
            return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
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
                ErrorSource = "[ACA_BEC_CONVENIOService]",
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
                ErrorMessage = "No se pudo guardar el convenio porque su usuario no tiene una empresa asignada.",
                ErrorSource = "[ACA_BEC_CONVENIOService]",
                RowsAffected = 0
            };
        }
    }
}
