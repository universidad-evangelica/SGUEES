using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class ACA_BEC_TIPOService : IACA_BEC_TIPOService
    {
        private static readonly HashSet<string> EstadosValidos = new()
        {
            "ACTIVA",
            "INACTIVA",
            "CERRADA",
            "CANCELADA",
        };

        private static readonly HashSet<string> NivelesAcademicosValidos = new()
        {
            "PREGRADO",
            "POSGRADO",
            "DOCTORADO",
            "TODOS",
        };

        private readonly IACA_BEC_TIPORepository _repo;

        public ACA_BEC_TIPOService(IACA_BEC_TIPORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(ACA_BEC_TIPOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetAsync(ACA_BEC_TIPOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_BECA", Value = xWhere.CORR_BECA, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(ACA_BEC_TIPOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

        public async Task<CResult> UpdateAsync(ACA_BEC_TIPOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            if (Data.CORR_BECA <= 0)
            {
                return ValidationError("No se pudo identificar el tipo de beca a actualizar.");
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_BEC_TIPOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_BECA <= 0)
            {
                return ValidationError("No se pudo identificar el tipo de beca a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> ActivarInactivarAsync(ACA_BEC_TIPOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_BECA <= 0)
            {
                return ValidationError("No se pudo identificar el tipo de beca a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> GetOrigenesAsync(int corrEmpresa)
        {
            var empresaError = ValidateEmpresaSesion(corrEmpresa);
            return empresaError ?? await _repo.GetOrigenesAsync(corrEmpresa);
        }

        public async Task<CResult> GetConveniosAsync(int corrEmpresa)
        {
            var empresaError = ValidateEmpresaSesion(corrEmpresa);
            return empresaError ?? await _repo.GetConveniosAsync(corrEmpresa);
        }

        private static List<CParameter> BuildParameters(ACA_BEC_TIPOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.CORR_BECA > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_BECA", Value = xWhere.CORR_BECA, DbType = System.Data.DbType.Int32 });
            }

            if (!string.IsNullOrWhiteSpace(xWhere.CODIGO_BECA))
            {
                p.Add(new CParameter() { ParameterName = "CODIGO_BECA", Value = xWhere.CODIGO_BECA, DbType = System.Data.DbType.String });
            }

            if (!string.IsNullOrWhiteSpace(xWhere.NOMBRE_BECA))
            {
                p.Add(new CParameter() { ParameterName = "NOMBRE_BECA", Value = xWhere.NOMBRE_BECA, DbType = System.Data.DbType.String });
            }

            if (xWhere.CORR_ORIGEN_BECA > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_ORIGEN_BECA", Value = xWhere.CORR_ORIGEN_BECA, DbType = System.Data.DbType.Int32 });
            }

            if (xWhere.CORR_CONVENIO.HasValue && xWhere.CORR_CONVENIO.Value > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_CONVENIO", Value = xWhere.CORR_CONVENIO, DbType = System.Data.DbType.Int32 });
            }

            if (!string.IsNullOrWhiteSpace(xWhere.ESTADO_BECA))
            {
                p.Add(new CParameter() { ParameterName = "ESTADO_BECA", Value = xWhere.ESTADO_BECA, DbType = System.Data.DbType.String });
            }

            if (xWhere.ACTIVO.HasValue)
            {
                p.Add(new CParameter() { ParameterName = "ACTIVO", Value = xWhere.ACTIVO, DbType = System.Data.DbType.Boolean });
            }

            return p;
        }

        private static void NormalizeData(ACA_BEC_TIPOTable Data)
        {
            Data.CODIGO_BECA = Data.CODIGO_BECA?.Trim().ToUpperInvariant();
            Data.NOMBRE_BECA = Data.NOMBRE_BECA?.Trim();
            Data.ARTICULO_REGLAMENTO = NormalizeOptional(Data.ARTICULO_REGLAMENTO);
            Data.UNIDAD_RESPONSABLE = NormalizeOptional(Data.UNIDAD_RESPONSABLE);
            Data.DESCRIPCION = NormalizeOptional(Data.DESCRIPCION);
            Data.ESTADO_BECA = string.IsNullOrWhiteSpace(Data.ESTADO_BECA) ? "ACTIVA" : Data.ESTADO_BECA.Trim().ToUpperInvariant();
            Data.NIVEL_ACADEMICO_APLICA = string.IsNullOrWhiteSpace(Data.NIVEL_ACADEMICO_APLICA)
                ? "TODOS"
                : Data.NIVEL_ACADEMICO_APLICA.Trim().ToUpperInvariant();

            if (!Data.REQUIERE_CONVENIO)
            {
                Data.CORR_CONVENIO = null;
            }
        }

        private static CResult Validate(ACA_BEC_TIPOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos del tipo de beca.");
            }

            if (string.IsNullOrWhiteSpace(Data.CODIGO_BECA))
            {
                return ValidationError("Debe ingresar el codigo del tipo de beca.");
            }

            if (Data.CODIGO_BECA.Trim().Length > 30)
            {
                return ValidationError("El codigo del tipo de beca no puede superar 30 caracteres.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_BECA))
            {
                return ValidationError("Debe ingresar el nombre del tipo de beca.");
            }

            if (Data.NOMBRE_BECA.Trim().Length > 200)
            {
                return ValidationError("El nombre del tipo de beca no puede superar 200 caracteres.");
            }

            if (Data.CORR_ORIGEN_BECA <= 0)
            {
                return ValidationError("Debe seleccionar el origen de beca.");
            }

            if (Data.REQUIERE_CONVENIO && (!Data.CORR_CONVENIO.HasValue || Data.CORR_CONVENIO.Value <= 0))
            {
                return ValidationError("Debe seleccionar el convenio cuando el tipo de beca requiere convenio.");
            }

            if (!string.IsNullOrWhiteSpace(Data.ARTICULO_REGLAMENTO) && Data.ARTICULO_REGLAMENTO.Trim().Length > 50)
            {
                return ValidationError("El articulo del reglamento no puede superar 50 caracteres.");
            }

            if (Data.PORCENTAJE_COBERTURA_REFERENCIAL.HasValue &&
                (Data.PORCENTAJE_COBERTURA_REFERENCIAL.Value < 0 || Data.PORCENTAJE_COBERTURA_REFERENCIAL.Value > 100))
            {
                return ValidationError("El porcentaje de cobertura debe estar entre 0 y 100.");
            }

            if (Data.CUM_MINIMO_RENOVACION.HasValue &&
                (Data.CUM_MINIMO_RENOVACION.Value < 0 || Data.CUM_MINIMO_RENOVACION.Value > 10))
            {
                return ValidationError("El CUM minimo de renovacion debe estar entre 0 y 10.");
            }

            var nivelAcademico = string.IsNullOrWhiteSpace(Data.NIVEL_ACADEMICO_APLICA)
                ? "TODOS"
                : Data.NIVEL_ACADEMICO_APLICA.Trim().ToUpperInvariant();
            if (!NivelesAcademicosValidos.Contains(nivelAcademico))
            {
                return ValidationError("El nivel academico aplicable no es valido.");
            }

            if (!string.IsNullOrWhiteSpace(Data.UNIDAD_RESPONSABLE) && Data.UNIDAD_RESPONSABLE.Trim().Length > 150)
            {
                return ValidationError("La unidad responsable no puede superar 150 caracteres.");
            }

            if (!string.IsNullOrWhiteSpace(Data.DESCRIPCION) && Data.DESCRIPCION.Trim().Length > 1000)
            {
                return ValidationError("La descripcion del tipo de beca no puede superar 1000 caracteres.");
            }

            var estado = string.IsNullOrWhiteSpace(Data.ESTADO_BECA) ? "ACTIVA" : Data.ESTADO_BECA.Trim().ToUpperInvariant();
            if (!EstadosValidos.Contains(estado))
            {
                return ValidationError("El estado de la beca no es valido.");
            }

            return null;
        }

        private static string NormalizeOptional(string value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
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
                ErrorSource = "[ACA_BEC_TIPOService]",
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
                ErrorMessage = "No se pudo guardar el tipo de beca porque su usuario no tiene una empresa asignada.",
                ErrorSource = "[ACA_BEC_TIPOService]",
                RowsAffected = 0
            };
        }
    }
}
