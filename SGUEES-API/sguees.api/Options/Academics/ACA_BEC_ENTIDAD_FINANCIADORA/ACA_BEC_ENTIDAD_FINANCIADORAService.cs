using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class ACA_BEC_ENTIDAD_FINANCIADORAService : IACA_BEC_ENTIDAD_FINANCIADORAService
    {
        private static readonly HashSet<string> TiposEntidadValidos = new()
        {
            "UEES",
            "FUNDACION",
            "IGLESIA",
            "EMPRESA",
            "GOBIERNO",
            "PERSONA",
            "OTRO",
        };

        private readonly IACA_BEC_ENTIDAD_FINANCIADORARepository _repo;

        public ACA_BEC_ENTIDAD_FINANCIADORAService(IACA_BEC_ENTIDAD_FINANCIADORARepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(ACA_BEC_ENTIDAD_FINANCIADORAParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetAsync(ACA_BEC_ENTIDAD_FINANCIADORAParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_ENTIDAD_FINANCIADORA", Value = xWhere.CORR_ENTIDAD_FINANCIADORA, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(ACA_BEC_ENTIDAD_FINANCIADORATable Data, string vLOGIN_SISTEMA, string vESTACION)
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

        public async Task<CResult> UpdateAsync(ACA_BEC_ENTIDAD_FINANCIADORATable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            if (Data.CORR_ENTIDAD_FINANCIADORA <= 0)
            {
                return ValidationError("No se pudo identificar la entidad financiadora a actualizar.");
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_BEC_ENTIDAD_FINANCIADORATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_ENTIDAD_FINANCIADORA <= 0)
            {
                return ValidationError("No se pudo identificar la entidad financiadora a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> ActivarInactivarAsync(ACA_BEC_ENTIDAD_FINANCIADORATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_ENTIDAD_FINANCIADORA <= 0)
            {
                return ValidationError("No se pudo identificar la entidad financiadora a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private static List<CParameter> BuildParameters(ACA_BEC_ENTIDAD_FINANCIADORAParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.CORR_ENTIDAD_FINANCIADORA > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_ENTIDAD_FINANCIADORA", Value = xWhere.CORR_ENTIDAD_FINANCIADORA, DbType = System.Data.DbType.Int32 });
            }

            if (!string.IsNullOrWhiteSpace(xWhere.CODIGO_ENTIDAD))
            {
                p.Add(new CParameter() { ParameterName = "CODIGO_ENTIDAD", Value = xWhere.CODIGO_ENTIDAD, DbType = System.Data.DbType.String });
            }

            if (!string.IsNullOrWhiteSpace(xWhere.NOMBRE_ENTIDAD))
            {
                p.Add(new CParameter() { ParameterName = "NOMBRE_ENTIDAD", Value = xWhere.NOMBRE_ENTIDAD, DbType = System.Data.DbType.String });
            }

            if (!string.IsNullOrWhiteSpace(xWhere.TIPO_ENTIDAD))
            {
                p.Add(new CParameter() { ParameterName = "TIPO_ENTIDAD", Value = xWhere.TIPO_ENTIDAD, DbType = System.Data.DbType.String });
            }

            if (xWhere.ACTIVO.HasValue)
            {
                p.Add(new CParameter() { ParameterName = "ACTIVO", Value = xWhere.ACTIVO, DbType = System.Data.DbType.Boolean });
            }

            return p;
        }

        private static void NormalizeData(ACA_BEC_ENTIDAD_FINANCIADORATable Data)
        {
            Data.CODIGO_ENTIDAD = Data.CODIGO_ENTIDAD?.Trim().ToUpperInvariant();
            Data.NOMBRE_ENTIDAD = Data.NOMBRE_ENTIDAD?.Trim();
            Data.TIPO_ENTIDAD = Data.TIPO_ENTIDAD?.Trim().ToUpperInvariant();
            Data.CONTACTO = NormalizeOptional(Data.CONTACTO);
            Data.TELEFONO = NormalizeOptional(Data.TELEFONO);
            Data.CORREO = NormalizeOptional(Data.CORREO)?.ToLowerInvariant();
        }

        private static CResult Validate(ACA_BEC_ENTIDAD_FINANCIADORATable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de la entidad financiadora.");
            }

            if (string.IsNullOrWhiteSpace(Data.CODIGO_ENTIDAD))
            {
                return ValidationError("Debe ingresar el codigo de la entidad.");
            }

            if (Data.CODIGO_ENTIDAD.Trim().Length > 30)
            {
                return ValidationError("El codigo de la entidad no puede superar 30 caracteres.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_ENTIDAD))
            {
                return ValidationError("Debe ingresar el nombre de la entidad.");
            }

            if (Data.NOMBRE_ENTIDAD.Trim().Length > 200)
            {
                return ValidationError("El nombre de la entidad no puede superar 200 caracteres.");
            }

            if (string.IsNullOrWhiteSpace(Data.TIPO_ENTIDAD))
            {
                return ValidationError("Debe ingresar el tipo de entidad.");
            }

            if (Data.TIPO_ENTIDAD.Trim().Length > 30)
            {
                return ValidationError("El tipo de entidad no puede superar 30 caracteres.");
            }

            if (!TiposEntidadValidos.Contains(Data.TIPO_ENTIDAD.Trim().ToUpperInvariant()))
            {
                return ValidationError("El tipo de entidad no es valido.");
            }

            if (!string.IsNullOrWhiteSpace(Data.CONTACTO) && Data.CONTACTO.Trim().Length > 150)
            {
                return ValidationError("El contacto no puede superar 150 caracteres.");
            }

            if (!string.IsNullOrWhiteSpace(Data.TELEFONO) && Data.TELEFONO.Trim().Length > 30)
            {
                return ValidationError("El telefono no puede superar 30 caracteres.");
            }

            if (!string.IsNullOrWhiteSpace(Data.CORREO))
            {
                if (Data.CORREO.Trim().Length > 150)
                {
                    return ValidationError("El correo no puede superar 150 caracteres.");
                }

                if (!Regex.IsMatch(Data.CORREO.Trim(), @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                {
                    return ValidationError("Debe ingresar un correo valido.");
                }
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
                ErrorSource = "[ACA_BEC_ENTIDAD_FINANCIADORAService]",
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
                ErrorMessage = "No se pudo guardar la entidad financiadora porque su usuario no tiene una empresa asignada.",
                ErrorSource = "[ACA_BEC_ENTIDAD_FINANCIADORAService]",
                RowsAffected = 0
            };
        }
    }
}
