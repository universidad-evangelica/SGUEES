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

        // Carga padres del nivel solicitado y construye su texto de lookup.
        public async Task<CResult> GetPadresAsync(SC_COMPETENCIAS_TECNICASParam xWhere)
        {
            if (string.IsNullOrWhiteSpace(xWhere.NIVEL_PADRE))
            {
                return ValidationError("Debe indicar el nivel del padre.");
            }

            var nivel = NormalizeNivel(xWhere.NIVEL_PADRE);
            var soloActivos = xWhere.OPCION_CONSULTA == 1 ? (bool?)null : true;
            var rows = await _repo.GetPadresByNivelAsync(xWhere.CORR_EMPRESA, nivel, soloActivos);

            var data = rows
                .Select(x =>
                {
                    var codigo = x.CODIGO_COMPETENCIAS_TECNICAS?.Trim() ?? string.Empty;
                    var nombre = (x.DESCRIPCION ?? x.NOMBRE_COMPETENCIAS_TECNICAS)?.Trim() ?? string.Empty;
                    var display = !string.IsNullOrWhiteSpace(codigo) && !string.IsNullOrWhiteSpace(nombre)
                        ? $"{codigo} - {nombre}"
                        : (!string.IsNullOrWhiteSpace(nombre) ? nombre : codigo);

                    return new
                    {
                        x.CORR_COMPETENCIAS_TECNICAS,
                        x.CODIGO_COMPETENCIAS_TECNICAS,
                        x.NOMBRE_COMPETENCIAS_TECNICAS,
                        x.DESCRIPCION,
                        x.NIVEL,
                        x.ESTADO_COMPETENCIAS_TECNICAS,
                        NOMBRE_DISPLAY = string.IsNullOrWhiteSpace(display) ? "(Sin nombre)" : display,
                    };
                })
                .ToList();

            return new CResult
            {
                Data = data,
                Result = true,
                RowsAffected = data.Count,
                ErrorCode = 0,
            };
        }

        // Agrupa competencias de nivel tres por sus ancestros para el descriptor.
        public async Task<CResult> GetCatalogoNivel3DescriptorAsync(SC_COMPETENCIAS_TECNICASParam xWhere)
        {
            var rows = await _repo.GetCatalogoNivel3DescriptorAsync(xWhere.CORR_EMPRESA);

            var data = rows
                .Select(x =>
                {
                    var grupoNiv1 = BuildLookupDisplay(x.CODIGO_NIV1, x.NOMBRE_NIV1);
                    var grupoNiv2 = BuildLookupDisplay(x.CODIGO_PADRE, x.NOMBRE_PADRE);
                    var nombre = BuildLookupDisplay(x.CODIGO_COMPETENCIAS_TECNICAS, x.NOMBRE_COMPETENCIAS_TECNICAS);

                    return new
                    {
                        x.CORR_COMPETENCIAS_TECNICAS,
                        x.CORR_COMPETENCIAS_TECNICAS_PADRE,
                        x.CODIGO_COMPETENCIAS_TECNICAS,
                        x.NOMBRE_COMPETENCIAS_TECNICAS,
                        x.DESCRIPCION,
                        NIVEL = "NIV3",
                        x.CODIGO_PADRE,
                        x.NOMBRE_PADRE,
                        x.CODIGO_NIV1,
                        x.NOMBRE_NIV1,
                        GRUPO_NIV1 = grupoNiv1,
                        GRUPO_NIV2 = grupoNiv2,
                        GRUPO_PADRE = grupoNiv2,
                        NOMBRE_DISPLAY = $"{nombre} | NIV3 | Grupo NIV2: {grupoNiv2} | Grupo NIV1: {grupoNiv1}",
                        SELECCIONABLE = true,
                    };
                })
                .ToList();

            return new CResult
            {
                Data = data,
                Result = true,
                RowsAffected = data.Count,
                ErrorCode = 0,
            };
        }

        // Valida el padre de nivel dos y calcula el siguiente código de nivel tres.
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

        // Prepara la jerarquía y valida la unicidad antes de crear.
        public async Task<CResult> CreateAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

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

        // Conserva la estructura de nodos con hijos y valida antes de actualizar.
        public async Task<CResult> UpdateAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

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

        // Impide eliminar competencias que todavía poseen nodos hijos.
        public async Task<CResult> DeleteAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (await HasChildrenAsync(Data.CORR_EMPRESA, Data.CORR_COMPETENCIAS_TECNICAS))
            {
                return ValidationError("No se puede eliminar la competencia porque tiene registros hijos asociados.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> ActivarInactivarAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_COMPETENCIAS_TECNICAS <= 0)
            {
                return ValidationError("No se pudo identificar la competencia tecnica a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Normaliza y valida código, padre y nombre según el nivel jerárquico.
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

        // Incrementa el mayor sufijo numérico usado por los hermanos de nivel tres.
        private async Task<string> BuildNextCodigoLevel3Async(int corrEmpresa, SC_COMPETENCIAS_TECNICASView parent)
        {
            var parentCodigo = parent.CODIGO_COMPETENCIAS_TECNICAS ?? string.Empty;
            var siblings = await _repo.GetSiblingCodigosLevel3Async(
                corrEmpresa,
                parent.CORR_COMPETENCIAS_TECNICAS,
                parentCodigo);

            var max = 0;
            foreach (var codigo in siblings)
            {
                if (!codigo.StartsWith(parentCodigo, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var suffix = codigo.Substring(parentCodigo.Length);
                if (int.TryParse(suffix, out var number) && number > max)
                {
                    max = number;
                }
            }

            return parentCodigo + (max + 1).ToString("D2");
        }

        // Verifica que el código no pertenezca a otra competencia de la empresa.
        private async Task<CResult> ValidateUniqueCodigoAsync(SC_COMPETENCIAS_TECNICASTable Data, int? excludeCorr)
        {
            var exclude = excludeCorr ?? 0;
            var exists = await _repo.ExistsCodigoAsync(
                Data.CORR_EMPRESA,
                Data.CODIGO_COMPETENCIAS_TECNICAS,
                exclude);

            return exists
                ? ValidationError($"Ya existe una competencia con el codigo {Data.CODIGO_COMPETENCIAS_TECNICAS}.")
                : null;
        }

        private Task<bool> HasChildrenAsync(int corrEmpresa, int corrCompetencia)
        {
            return _repo.HasChildrenAsync(corrEmpresa, corrCompetencia);
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

        // Convierte las variantes aceptadas de nivel al formato NIV1, NIV2 o NIV3.
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

        // Combina código y nombre en una etiqueta legible para lookups.
        private static string BuildLookupDisplay(string codigo, string nombre)
        {
            var code = codigo?.Trim() ?? string.Empty;
            var name = nombre?.Trim() ?? string.Empty;

            if (!string.IsNullOrWhiteSpace(code) && !string.IsNullOrWhiteSpace(name))
            {
                return $"{code} - {name}";
            }

            if (!string.IsNullOrWhiteSpace(name))
            {
                return name;
            }

            if (!string.IsNullOrWhiteSpace(code))
            {
                return code;
            }

            return "(Sin nombre)";
        }

        private static List<CParameter> BuildParameters(SC_COMPETENCIAS_TECNICASParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
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
                ErrorMessage = "No se pudo guardar la competencia tecnica porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[SC_COMPETENCIAS_TECNICASService]",
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
                ErrorSource = "[SC_COMPETENCIAS_TECNICASService]",
                RowsAffected = 0
            };
        }
    }
}
