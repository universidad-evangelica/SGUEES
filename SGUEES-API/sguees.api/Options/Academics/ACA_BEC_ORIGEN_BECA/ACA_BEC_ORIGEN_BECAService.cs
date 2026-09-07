using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class ACA_BEC_ORIGEN_BECAService : IACA_BEC_ORIGEN_BECAService
    {
        private static readonly Dictionary<string, string> NombresPorCodigo = new()
        {
            { "INTERNA", "Beca interna" },
            { "EXTERNA", "Beca externa" },
            { "MIXTA", "Beca mixta" },
        };

        private readonly IACA_BEC_ORIGEN_BECARepository _repo;

        public ACA_BEC_ORIGEN_BECAService(IACA_BEC_ORIGEN_BECARepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(ACA_BEC_ORIGEN_BECAParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetAsync(ACA_BEC_ORIGEN_BECAParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_ORIGEN_BECA", Value = xWhere.CORR_ORIGEN_BECA, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(ACA_BEC_ORIGEN_BECATable Data, string vLOGIN_SISTEMA, string vESTACION)
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

        public async Task<CResult> UpdateAsync(ACA_BEC_ORIGEN_BECATable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            if (Data.CORR_ORIGEN_BECA <= 0)
            {
                return ValidationError("No se pudo identificar el origen de beca a actualizar.");
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_BEC_ORIGEN_BECATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_ORIGEN_BECA <= 0)
            {
                return ValidationError("No se pudo identificar el origen de beca a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> ActivarInactivarAsync(ACA_BEC_ORIGEN_BECATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_ORIGEN_BECA <= 0)
            {
                return ValidationError("No se pudo identificar el origen de beca a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private static List<CParameter> BuildParameters(ACA_BEC_ORIGEN_BECAParam xWhere)
        {
            var p = new List<CParameter>();

            p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });

            if (xWhere.CORR_ORIGEN_BECA > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_ORIGEN_BECA", Value = xWhere.CORR_ORIGEN_BECA, DbType = System.Data.DbType.Int32 });
            }

            if (!string.IsNullOrWhiteSpace(xWhere.CODIGO_ORIGEN))
            {
                p.Add(new CParameter() { ParameterName = "CODIGO_ORIGEN", Value = xWhere.CODIGO_ORIGEN, DbType = System.Data.DbType.String });
            }

            if (!string.IsNullOrWhiteSpace(xWhere.NOMBRE_ORIGEN))
            {
                p.Add(new CParameter() { ParameterName = "NOMBRE_ORIGEN", Value = xWhere.NOMBRE_ORIGEN, DbType = System.Data.DbType.String });
            }

            if (xWhere.ACTIVO.HasValue)
            {
                p.Add(new CParameter() { ParameterName = "ACTIVO", Value = xWhere.ACTIVO, DbType = System.Data.DbType.Boolean });
            }

            return p;
        }

        private static void NormalizeData(ACA_BEC_ORIGEN_BECATable Data)
        {
            Data.CODIGO_ORIGEN = Data.CODIGO_ORIGEN?.Trim().ToUpperInvariant();
            Data.NOMBRE_ORIGEN = Data.NOMBRE_ORIGEN?.Trim();
            Data.DESCRIPCION = string.IsNullOrWhiteSpace(Data.DESCRIPCION) ? null : Data.DESCRIPCION.Trim();
            Data.ACTIVO ??= true;

            if (!string.IsNullOrWhiteSpace(Data.CODIGO_ORIGEN) &&
                NombresPorCodigo.TryGetValue(Data.CODIGO_ORIGEN, out var nombreOrigen))
            {
                Data.NOMBRE_ORIGEN = nombreOrigen;
            }
        }

        private static CResult Validate(ACA_BEC_ORIGEN_BECATable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos del origen de beca.");
            }

            if (string.IsNullOrWhiteSpace(Data.CODIGO_ORIGEN))
            {
                return ValidationError("Debe ingresar el codigo del origen de beca.");
            }

            if (Data.CODIGO_ORIGEN.Trim().Length > 20)
            {
                return ValidationError("El codigo del origen de beca no puede superar 20 caracteres.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_ORIGEN))
            {
                return ValidationError("Debe ingresar el nombre del origen de beca.");
            }

            if (Data.NOMBRE_ORIGEN.Trim().Length > 100)
            {
                return ValidationError("El nombre del origen de beca no puede superar 100 caracteres.");
            }

            if (!string.IsNullOrWhiteSpace(Data.DESCRIPCION) && Data.DESCRIPCION.Trim().Length > 300)
            {
                return ValidationError("La descripcion del origen de beca no puede superar 300 caracteres.");
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
                ErrorSource = "[ACA_BEC_ORIGEN_BECAService]",
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
                ErrorMessage = "No se pudo guardar el origen de beca porque su usuario no tiene una empresa asignada.",
                ErrorSource = "[ACA_BEC_ORIGEN_BECAService]",
                RowsAffected = 0
            };
        }
    }
}
