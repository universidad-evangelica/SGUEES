using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    // Qué hace: reglas de negocio del mantenimiento de Facultades.
    // Cómo lo hace: antes de escribir lee la fila de V_ACA_FACULTADES y decide con sus conteos:
    //   - desactivar: se bloquea si tiene carreras activas (la oferta del portal exige facultad activa);
    //   - eliminar: se bloquea si tiene carreras o períodos (períodos no tiene FK);
    //   - editar: el código y el estado no cambian por PUT (código fijo; estado solo con ActivarInactivar).
    public class ACA_FACULTADESService : IACA_FACULTADESService
    {
        private const int MaxCodigo = 20;
        private const int MaxNombre = 200;

        private readonly IACA_FACULTADESRepository _repo;

        private readonly IACA_CARRERASLookupRepository _lookup;

        public Task<CResult> GetCatalogoCarrerasAsync(int empresa) => _lookup.GetAsync(CatalogoCarrera.Facultades, empresa);

        public ACA_FACULTADESService(IACA_FACULTADESRepository repo, IACA_CARRERASLookupRepository lookup)
        {
            _repo = repo;
            _lookup = lookup;
        }

        public async Task<CResult> GetAllAsync(ACA_FACULTADESParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetAsync(ACA_FACULTADESParam xWhere)
        {
            return await _repo.GetAsync(KeyParameters(xWhere.CORR_EMPRESA, xWhere.CORR_FACULTAD));
        }

        public async Task<CResult> CreateAsync(ACA_FACULTADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var error = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0) ?? Validate(Data);
            if (error != null)
            {
                return error;
            }

            NormalizeData(Data);

            var existente = await LeerPorCodigoAsync(Data.CORR_EMPRESA, Data.CODIGO_FACULTAD);
            if (existente != null)
            {
                return ValidationError("Ya existe una facultad con ese código. Ingrese otro código para continuar.", 2627);
            }

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(ACA_FACULTADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var error = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0) ?? Validate(Data);
            if (error != null)
            {
                return error;
            }

            if (Data.CORR_FACULTAD <= 0)
            {
                return ValidationError("No se pudo identificar la facultad a actualizar.");
            }

            var actual = await LeerAsync(Data.CORR_EMPRESA, Data.CORR_FACULTAD);
            if (actual == null)
            {
                return ValidationError("La facultad no existe en la empresa de la sesión.");
            }

            NormalizeData(Data);
            Data.CODIGO_FACULTAD = actual.CODIGO_FACULTAD;
            Data.ACTIVO = actual.ACTIVO;

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_FACULTADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var error = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
            if (error != null)
            {
                return error;
            }

            if (Data.CORR_FACULTAD <= 0)
            {
                return ValidationError("No se pudo identificar la facultad a eliminar.");
            }

            var actual = await LeerAsync(Data.CORR_EMPRESA, Data.CORR_FACULTAD);
            if (actual == null)
            {
                return ValidationError("La facultad no existe en la empresa de la sesión.");
            }

            var dependencias = new List<string>();
            if (actual.CARRERAS > 0)
            {
                dependencias.Add(Plural(actual.CARRERAS, "carrera", "carreras"));
            }
            if (actual.PERIODOS > 0)
            {
                dependencias.Add(Plural(actual.PERIODOS, "período académico", "períodos académicos"));
            }
            if (dependencias.Count > 0)
            {
                return ValidationError(
                    $"No se puede eliminar \"{actual.NOMBRE_FACULTAD?.Trim()}\": tiene {string.Join(" y ", dependencias)}. Utilice Desactivar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> ActivarInactivarAsync(ACA_FACULTADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var error = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
            if (error != null)
            {
                return error;
            }

            if (Data.CORR_FACULTAD <= 0)
            {
                return ValidationError("No se pudo identificar la facultad a actualizar.");
            }

            var actual = await LeerAsync(Data.CORR_EMPRESA, Data.CORR_FACULTAD);
            if (actual == null)
            {
                return ValidationError("La facultad no existe en la empresa de la sesión.");
            }

            // Solo se valida al desactivar: activar no afecta la oferta de otras carreras.
            if (actual.ACTIVO == true && actual.CARRERAS_ACTIVAS > 0)
            {
                return ValidationError(
                    $"No se puede desactivar \"{actual.NOMBRE_FACULTAD?.Trim()}\": tiene {Plural(actual.CARRERAS_ACTIVAS, "carrera activa", "carreras activas")}. Desactívelas primero en Carreras.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private async Task<ACA_FACULTADESView> LeerAsync(int corrEmpresa, int corrFacultad)
        {
            var resultado = await _repo.GetAsync(KeyParameters(corrEmpresa, corrFacultad));
            return resultado.Result ? resultado.Data as ACA_FACULTADESView : null;
        }

        private async Task<ACA_FACULTADESView> LeerPorCodigoAsync(int corrEmpresa, string codigo)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CODIGO_FACULTAD", Value = codigo, DbType = System.Data.DbType.String },
            };
            var resultado = await _repo.GetAsync(p);
            return resultado.Result ? resultado.Data as ACA_FACULTADESView : null;
        }

        private static List<CParameter> KeyParameters(int corrEmpresa, int corrFacultad)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_FACULTAD", Value = corrFacultad, DbType = System.Data.DbType.Int32 },
            };
        }

        private static List<CParameter> BuildParameters(ACA_FACULTADESParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
            if (xWhere.CORR_FACULTAD > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_FACULTAD", Value = xWhere.CORR_FACULTAD, DbType = System.Data.DbType.Int32 });
            }
            if (!string.IsNullOrWhiteSpace(xWhere.CODIGO_FACULTAD))
            {
                p.Add(new CParameter() { ParameterName = "CODIGO_FACULTAD", Value = xWhere.CODIGO_FACULTAD.Trim(), DbType = System.Data.DbType.String });
            }
            if (!string.IsNullOrWhiteSpace(xWhere.NOMBRE_FACULTAD))
            {
                p.Add(new CParameter() { ParameterName = "NOMBRE_FACULTAD", Value = xWhere.NOMBRE_FACULTAD.Trim(), DbType = System.Data.DbType.String });
            }
            if (xWhere.ACTIVO.HasValue)
            {
                p.Add(new CParameter() { ParameterName = "ACTIVO", Value = xWhere.ACTIVO, DbType = System.Data.DbType.Boolean });
            }
            return p;
        }

        // Qué hace: deja código y nombre sin espacios sobrantes (la carga inicial trajo nombres rellenos de espacios).
        private static void NormalizeData(ACA_FACULTADESTable Data)
        {
            Data.CODIGO_FACULTAD = Data.CODIGO_FACULTAD?.Trim().ToUpperInvariant();
            Data.NOMBRE_FACULTAD = Data.NOMBRE_FACULTAD?.Trim();
            Data.ACTIVO ??= true;
        }

        private static CResult Validate(ACA_FACULTADESTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de la facultad.");
            }
            if (string.IsNullOrWhiteSpace(Data.CODIGO_FACULTAD))
            {
                return ValidationError("Debe ingresar el código de la facultad.");
            }
            if (Data.CODIGO_FACULTAD.Trim().Length > MaxCodigo)
            {
                return ValidationError($"El código de la facultad no puede superar {MaxCodigo} caracteres.");
            }
            if (string.IsNullOrWhiteSpace(Data.NOMBRE_FACULTAD))
            {
                return ValidationError("Debe ingresar el nombre de la facultad.");
            }
            if (Data.NOMBRE_FACULTAD.Trim().Length > MaxNombre)
            {
                return ValidationError($"El nombre de la facultad no puede superar {MaxNombre} caracteres.");
            }
            return null;
        }

        private static string Plural(int n, string singular, string plural)
        {
            return $"{n} {(n == 1 ? singular : plural)}";
        }

        private static CResult ValidationError(string message, int code = -1)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = code,
                ErrorMessage = message,
                ErrorSource = "[ACA_FACULTADESService]",
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
                ErrorMessage = "No se pudo procesar la facultad porque su usuario no tiene una empresa asignada.",
                ErrorSource = "[ACA_FACULTADESService]",
                RowsAffected = 0
            };
        }
    }
}
