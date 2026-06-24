using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_COMPETENCIAS_TECNICASService : ISC_COMPETENCIAS_TECNICASService
    {
        private readonly ISC_COMPETENCIAS_TECNICASRepository _repo;

        public SC_COMPETENCIAS_TECNICASService(ISC_COMPETENCIAS_TECNICASRepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SC_COMPETENCIAS_TECNICASParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetAsync(SC_COMPETENCIAS_TECNICASParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS", Value = xWhere.CORR_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> GetPadresAsync(SC_COMPETENCIAS_TECNICASParam xWhere)
        {
            if (string.IsNullOrWhiteSpace(xWhere.NIVEL_PADRE))
            {
                return ValidationError("Debe indicar el nivel del padre.");
            }

            var param = new SC_COMPETENCIAS_TECNICASParam
            {
                CORR_EMPRESA = xWhere.CORR_EMPRESA,
                NIVEL = NormalizeNivel(xWhere.NIVEL_PADRE),
                ESTADO_COMPETENCIAS_TECNICAS = xWhere.OPCION_CONSULTA == 1 ? null : true,
                PAGE = 1,
                PAGE_SIZE = 10000,
            };

            var result = await _repo.GetAllAsync(BuildParameters(param));
            if (!result.Result)
            {
                return result;
            }

            var data = (result.Data as List<SC_COMPETENCIAS_TECNICASView>)?
                .Select(x => new
                {
                    x.CORR_COMPETENCIAS_TECNICAS,
                    x.CODIGO_COMPETENCIAS_TECNICAS,
                    x.NOMBRE_COMPETENCIAS_TECNICAS,
                    x.DESCRIPCION,
                    x.NIVEL,
                    x.ESTADO_COMPETENCIAS_TECNICAS,
                })
                .ToList();

            return new CResult
            {
                Data = data,
                Result = true,
                RowsAffected = data?.Count ?? 0,
                ErrorCode = 0,
            };
        }

        public async Task<CResult> GetNextCodigoAsync(SC_COMPETENCIAS_TECNICASParam xWhere)
        {
            if (xWhere.CORR_COMPETENCIAS_TECNICAS_PADRE is not > 0)
            {
                return ValidationError("Debe seleccionar el registro padre de nivel 2.");
            }

            var parentResult = await GetAsync(new SC_COMPETENCIAS_TECNICASParam
            {
                CORR_EMPRESA = xWhere.CORR_EMPRESA,
                CORR_COMPETENCIAS_TECNICAS = xWhere.CORR_COMPETENCIAS_TECNICAS_PADRE.Value,
            });

            if (!parentResult.Result || parentResult.Data is not SC_COMPETENCIAS_TECNICASView parent)
            {
                return ValidationError("No se encontro el registro padre.");
            }

            if (!string.Equals(parent.NIVEL, "NIV2", StringComparison.OrdinalIgnoreCase))
            {
                return ValidationError("El padre debe ser una competencia de nivel 2.");
            }

            var codigo = await BuildNextCodigoLevel3Async(xWhere.CORR_EMPRESA, parent);
            return new CResult
            {
                Data = new { CODIGO_COMPETENCIAS_TECNICAS = codigo },
                Result = true,
                RowsAffected = 1,
                ErrorCode = 0,
            };
        }

        public async Task<CResult> CreateAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var prepare = await PrepareForSaveAsync(Data, true);
            if (prepare != null)
            {
                return prepare;
            }

            var duplicate = await ValidateUniqueCodigoAsync(Data, null);
            if (duplicate != null)
            {
                return duplicate;
            }

            Data.ESTADO_COMPETENCIAS_TECNICAS ??= true;
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var current = await GetAsync(new SC_COMPETENCIAS_TECNICASParam
            {
                CORR_EMPRESA = Data.CORR_EMPRESA,
                CORR_COMPETENCIAS_TECNICAS = Data.CORR_COMPETENCIAS_TECNICAS,
            });

            if (!current.Result || current.Data is not SC_COMPETENCIAS_TECNICASView existing)
            {
                return ValidationError("No se encontro el registro a modificar.");
            }

            var hasChildren = await HasChildrenAsync(Data.CORR_EMPRESA, existing.CORR_COMPETENCIAS_TECNICAS);
            if (existing.NIVEL is "NIV1" or "NIV2" && hasChildren)
            {
                Data.NIVEL = existing.NIVEL;
                Data.CORR_COMPETENCIAS_TECNICAS_PADRE = existing.CORR_COMPETENCIAS_TECNICAS_PADRE;
                Data.CODIGO_COMPETENCIAS_TECNICAS = existing.CODIGO_COMPETENCIAS_TECNICAS;
            }

            var prepare = await PrepareForSaveAsync(Data, false, existing);
            if (prepare != null)
            {
                return prepare;
            }

            var duplicate = await ValidateUniqueCodigoAsync(Data, Data.CORR_COMPETENCIAS_TECNICAS);
            if (duplicate != null)
            {
                return duplicate;
            }

            Data.ESTADO_COMPETENCIAS_TECNICAS ??= true;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (await HasChildrenAsync(Data.CORR_EMPRESA, Data.CORR_COMPETENCIAS_TECNICAS))
            {
                return ValidationError("No se puede eliminar la competencia porque tiene registros hijos asociados.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DesactivarAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            Data.ESTADO_COMPETENCIAS_TECNICAS = false;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private async Task<CResult> PrepareForSaveAsync(
            SC_COMPETENCIAS_TECNICASTable Data,
            bool isCreate,
            SC_COMPETENCIAS_TECNICASView existing = null)
        {
            var validation = ValidateBase(Data);
            if (validation != null)
            {
                return validation;
            }

            Data.NIVEL = NormalizeNivel(Data.NIVEL);
            Data.DESCRIPCION = Data.DESCRIPCION?.Trim();
            Data.CODIGO_COMPETENCIAS_TECNICAS = Data.CODIGO_COMPETENCIAS_TECNICAS?.Trim().ToUpperInvariant();
            Data.NOMBRE_COMPETENCIAS_TECNICAS = string.IsNullOrWhiteSpace(Data.NOMBRE_COMPETENCIAS_TECNICAS)
                ? null
                : Data.NOMBRE_COMPETENCIAS_TECNICAS.Trim();

            if (!isCreate && existing != null && Data.CORR_COMPETENCIAS_TECNICAS_PADRE is not > 0)
            {
                Data.CORR_COMPETENCIAS_TECNICAS_PADRE = existing.CORR_COMPETENCIAS_TECNICAS_PADRE;
            }

            switch (Data.NIVEL)
            {
                case "NIV1":
                    Data.CORR_COMPETENCIAS_TECNICAS_PADRE = null;
                    Data.NOMBRE_COMPETENCIAS_TECNICAS = null;

                    if (string.IsNullOrWhiteSpace(Data.CODIGO_COMPETENCIAS_TECNICAS))
                    {
                        return ValidationError("Debe ingresar el codigo de la competencia de nivel 1.");
                    }

                    if (!Regex.IsMatch(Data.CODIGO_COMPETENCIAS_TECNICAS, "^[A-Z0-9]{2,10}$"))
                    {
                        return ValidationError("El codigo de nivel 1 solo puede contener letras y numeros (2 a 10 caracteres).");
                    }
                    break;

                case "NIV2":
                    Data.NOMBRE_COMPETENCIAS_TECNICAS = null;

                    if (Data.CORR_COMPETENCIAS_TECNICAS_PADRE is not > 0)
                    {
                        return ValidationError("Debe seleccionar el registro padre de nivel 1.");
                    }

                    var parentLevel1 = await GetAsync(new SC_COMPETENCIAS_TECNICASParam
                    {
                        CORR_EMPRESA = Data.CORR_EMPRESA,
                        CORR_COMPETENCIAS_TECNICAS = Data.CORR_COMPETENCIAS_TECNICAS_PADRE.Value,
                    });

                    if (!parentLevel1.Result || parentLevel1.Data is not SC_COMPETENCIAS_TECNICASView parent1)
                    {
                        return ValidationError("No se encontro el registro padre de nivel 1.");
                    }

                    if (!string.Equals(parent1.NIVEL, "NIV1", StringComparison.OrdinalIgnoreCase))
                    {
                        return ValidationError("El padre seleccionado debe ser de nivel 1.");
                    }

                    if (isCreate ||
                        (existing != null &&
                         !string.Equals(existing.CODIGO_COMPETENCIAS_TECNICAS, Data.CODIGO_COMPETENCIAS_TECNICAS, StringComparison.OrdinalIgnoreCase)))
                    {
                        if (string.IsNullOrWhiteSpace(Data.CODIGO_COMPETENCIAS_TECNICAS) ||
                            Data.CODIGO_COMPETENCIAS_TECNICAS.Length <= parent1.CODIGO_COMPETENCIAS_TECNICAS.Length)
                        {
                            return ValidationError("Debe ingresar el sufijo del codigo despues del codigo del padre.");
                        }

                        if (!Data.CODIGO_COMPETENCIAS_TECNICAS.StartsWith(parent1.CODIGO_COMPETENCIAS_TECNICAS, StringComparison.OrdinalIgnoreCase))
                        {
                            return ValidationError($"El codigo debe iniciar con el codigo del padre ({parent1.CODIGO_COMPETENCIAS_TECNICAS}).");
                        }

                        var suffix = Data.CODIGO_COMPETENCIAS_TECNICAS.Substring(parent1.CODIGO_COMPETENCIAS_TECNICAS.Length);
                        if (!Regex.IsMatch(suffix, "^[A-Z0-9]{1,10}$"))
                        {
                            return ValidationError("El sufijo del codigo de nivel 2 solo puede contener letras y numeros.");
                        }

                        Data.CODIGO_COMPETENCIAS_TECNICAS = parent1.CODIGO_COMPETENCIAS_TECNICAS + suffix.ToUpperInvariant();
                    }
                    break;

                case "NIV3":
                    if (Data.CORR_COMPETENCIAS_TECNICAS_PADRE is not > 0 && isCreate)
                    {
                        return ValidationError("Debe seleccionar el registro padre de nivel 2.");
                    }

                    if (Data.CORR_COMPETENCIAS_TECNICAS_PADRE is > 0)
                    {
                        var parentLevel2 = await GetAsync(new SC_COMPETENCIAS_TECNICASParam
                        {
                            CORR_EMPRESA = Data.CORR_EMPRESA,
                            CORR_COMPETENCIAS_TECNICAS = Data.CORR_COMPETENCIAS_TECNICAS_PADRE.Value,
                        });

                        if (!parentLevel2.Result || parentLevel2.Data is not SC_COMPETENCIAS_TECNICASView parent2)
                        {
                            return ValidationError("No se encontro el registro padre de nivel 2.");
                        }

                        if (!string.Equals(parent2.NIVEL, "NIV2", StringComparison.OrdinalIgnoreCase))
                        {
                            return ValidationError("El padre seleccionado debe ser de nivel 2.");
                        }

                        if (isCreate)
                        {
                            Data.CODIGO_COMPETENCIAS_TECNICAS = await BuildNextCodigoLevel3Async(Data.CORR_EMPRESA, parent2);
                        }
                    }

                    if (string.IsNullOrWhiteSpace(Data.NOMBRE_COMPETENCIAS_TECNICAS))
                    {
                        return ValidationError("Debe ingresar el nombre de la competencia de nivel 3.");
                    }

                    if (Data.NOMBRE_COMPETENCIAS_TECNICAS.Length > 150)
                    {
                        return ValidationError("El nombre no puede superar 150 caracteres.");
                    }

                    if (!isCreate && string.IsNullOrWhiteSpace(Data.CODIGO_COMPETENCIAS_TECNICAS))
                    {
                        return ValidationError("Debe ingresar el codigo de la competencia de nivel 3.");
                    }
                    break;

                default:
                    return ValidationError("El nivel de la competencia no es valido.");
            }

            if (string.IsNullOrWhiteSpace(Data.DESCRIPCION))
            {
                return ValidationError("Debe ingresar la descripcion de la competencia.");
            }

            if (Data.DESCRIPCION.Length > 500)
            {
                return ValidationError("La descripcion no puede superar 500 caracteres.");
            }

            if (Data.CODIGO_COMPETENCIAS_TECNICAS.Length > 30)
            {
                return ValidationError("El codigo no puede superar 30 caracteres.");
            }

            return null;
        }

        private async Task<string> BuildNextCodigoLevel3Async(int corrEmpresa, SC_COMPETENCIAS_TECNICASView parent)
        {
            var siblingsResult = await _repo.GetAllAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS_PADRE", Value = parent.CORR_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "NIVEL", Value = "NIV3", DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "PAGE", Value = 1, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "PAGE_SIZE", Value = 10000, DbType = System.Data.DbType.Int32 },
            });

            var siblings = siblingsResult.Result && siblingsResult.Data is List<SC_COMPETENCIAS_TECNICASView> list
                ? list
                : new List<SC_COMPETENCIAS_TECNICASView>();

            var max = 0;
            foreach (var item in siblings)
            {
                var codigo = item.CODIGO_COMPETENCIAS_TECNICAS ?? string.Empty;
                if (!codigo.StartsWith(parent.CODIGO_COMPETENCIAS_TECNICAS, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var suffix = codigo.Substring(parent.CODIGO_COMPETENCIAS_TECNICAS.Length);
                if (int.TryParse(suffix, out var number) && number > max)
                {
                    max = number;
                }
            }

            return parent.CODIGO_COMPETENCIAS_TECNICAS + (max + 1).ToString("D2");
        }

        private async Task<CResult> ValidateUniqueCodigoAsync(SC_COMPETENCIAS_TECNICASTable Data, int? excludeCorr)
        {
            var all = await _repo.GetAllAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "PAGE", Value = 1, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "PAGE_SIZE", Value = 10000, DbType = System.Data.DbType.Int32 },
            });

            if (!all.Result || all.Data is not List<SC_COMPETENCIAS_TECNICASView> rows)
            {
                return null;
            }

            var exists = rows.Any(x =>
                x.CORR_COMPETENCIAS_TECNICAS != excludeCorr &&
                string.Equals(x.CODIGO_COMPETENCIAS_TECNICAS, Data.CODIGO_COMPETENCIAS_TECNICAS, StringComparison.OrdinalIgnoreCase));

            return exists
                ? ValidationError($"Ya existe una competencia con el codigo {Data.CODIGO_COMPETENCIAS_TECNICAS}.")
                : null;
        }

        private async Task<bool> HasChildrenAsync(int corrEmpresa, int corrCompetencia)
        {
            var children = await _repo.GetAllAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS_PADRE", Value = corrCompetencia, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "PAGE", Value = 1, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "PAGE_SIZE", Value = 1, DbType = System.Data.DbType.Int32 },
            });

            return children.Result && children.RowsAffected > 0;
        }

        private static CResult ValidateBase(SC_COMPETENCIAS_TECNICASTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de la competencia tecnica.");
            }

            if (string.IsNullOrWhiteSpace(Data.NIVEL))
            {
                return ValidationError("Debe seleccionar el nivel de la competencia.");
            }

            return null;
        }

        private static string NormalizeNivel(string nivel)
        {
            var value = nivel?.Trim().ToUpperInvariant();
            if (value is "NIV1" or "NIV2" or "NIV3")
            {
                return value;
            }

            if (value is "1" or "2" or "3")
            {
                return $"NIV{value}";
            }

            if (value?.StartsWith("NIVEL", StringComparison.OrdinalIgnoreCase) == true)
            {
                var digit = value.Replace("NIVEL", string.Empty, StringComparison.OrdinalIgnoreCase).Trim();
                if (digit is "1" or "2" or "3")
                {
                    return $"NIV{digit}";
                }
            }

            return value;
        }

        private static List<CParameter> BuildParameters(SC_COMPETENCIAS_TECNICASParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "BUSQUEDA", Value = xWhere.BUSQUEDA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTADO_COMPETENCIAS_TECNICAS", Value = xWhere.ESTADO_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "NIVEL", Value = string.IsNullOrWhiteSpace(xWhere.NIVEL) ? null : NormalizeNivel(xWhere.NIVEL), DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "NIVEL_PADRE", Value = string.IsNullOrWhiteSpace(xWhere.NIVEL_PADRE) ? null : NormalizeNivel(xWhere.NIVEL_PADRE), DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS_PADRE", Value = xWhere.CORR_COMPETENCIAS_TECNICAS_PADRE, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "PAGE", Value = xWhere.PAGE, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "PAGE_SIZE", Value = xWhere.PAGE_SIZE, DbType = System.Data.DbType.Int32 },
            };

            AddColumnFilter(p, "CORR_COMPETENCIAS_TECNICAS", xWhere.CORR_COMPETENCIAS_TECNICAS, System.Data.DbType.Int32);
            AddColumnFilter(p, "CODIGO_COMPETENCIAS_TECNICAS", xWhere.CODIGO_COMPETENCIAS_TECNICAS, System.Data.DbType.String);
            AddColumnFilter(p, "NOMBRE_COMPETENCIAS_TECNICAS", xWhere.NOMBRE_COMPETENCIAS_TECNICAS, System.Data.DbType.String);
            AddColumnFilter(p, "DESCRIPCION", xWhere.DESCRIPCION, System.Data.DbType.String);
            AddColumnFilter(p, "USUARIO_CREA", xWhere.USUARIO_CREA, System.Data.DbType.String);
            AddColumnFilter(p, "ESTACION_CREA", xWhere.ESTACION_CREA, System.Data.DbType.String);
            AddColumnFilter(p, "FECHA_CREA", xWhere.FECHA_CREA, System.Data.DbType.String);
            AddColumnFilter(p, "USUARIO_ACTU", xWhere.USUARIO_ACTU, System.Data.DbType.String);
            AddColumnFilter(p, "ESTACION_ACTU", xWhere.ESTACION_ACTU, System.Data.DbType.String);
            AddColumnFilter(p, "FECHA_ACTU", xWhere.FECHA_ACTU, System.Data.DbType.String);

            return p;
        }

        private static void AddColumnFilter(List<CParameter> p, string parameterName, object value, System.Data.DbType dbType)
        {
            if (value == null ||
                value is string text && string.IsNullOrWhiteSpace(text) ||
                value is int number && number <= 0)
            {
                return;
            }

            p.Add(new CParameter() { ParameterName = parameterName, Value = value, DbType = dbType });
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
                ErrorSource = "[SC_COMPETENCIAS_TECNICASService]",
                RowsAffected = 0
            };
        }
    }
}
