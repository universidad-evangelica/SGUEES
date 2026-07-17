using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASService : ISC_PERFIL_PUESTO_COMPETENCIAS_TECNICASService
    {
        private static readonly HashSet<string> NivelesDominioValidos = new(StringComparer.OrdinalIgnoreCase)
        {
            "BASICO",
            "INTERMEDIO",
            "AVANZADO",
        };

        private readonly ISC_PERFIL_PUESTO_COMPETENCIAS_TECNICASRepository _repo;
        private readonly ISC_COMPETENCIAS_TECNICASRepository _competenciasRepo;

        public SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASService(
            ISC_PERFIL_PUESTO_COMPETENCIAS_TECNICASRepository repo,
            ISC_COMPETENCIAS_TECNICASRepository competenciasRepo)
        {
            _repo = repo;
            _competenciasRepo = competenciasRepo;
        }

        // Obtiene el listado de competencia técnica del perfil aplicando los filtros recibidos.
        public async Task<CResult> GetAllAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Obtiene un registro de competencia técnica del perfil con los identificadores recibidos.
        public async Task<CResult> GetAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeCorr: true));
        }

        // Valida y crea el registro de competencia técnica del perfil con sus datos de auditoría.
        public async Task<CResult> CreateAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var prepare = await PrepareFromCatalogAsync(Data, esNuevo: true);
            if (prepare != null)
            {
                return prepare;
            }

            var validation = Validate(Data, esNuevo: true);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida y actualiza el registro existente de competencia técnica del perfil.
        public async Task<CResult> UpdateAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data, esNuevo: false);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida las claves y elimina el registro de competencia técnica del perfil.
        public async Task<CResult> DeleteAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data.CORR_EMPRESA <= 0 || Data.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS <= 0)
            {
                return ValidationError("Debe indicar la competencia tecnica del perfil a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Completa y contrasta los datos de competencia técnica del perfil con el catálogo activo.
        private async Task<CResult> PrepareFromCatalogAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASTable Data, bool esNuevo)
        {
            if (!esNuevo || Data.CORR_COMPETENCIAS_TECNICAS is not > 0)
            {
                return null;
            }

            var catalogResult = await _competenciasRepo.GetAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS", Value = Data.CORR_COMPETENCIAS_TECNICAS.Value, DbType = System.Data.DbType.Int32 },
            });

            if (!catalogResult.Result || catalogResult.Data is not SC_COMPETENCIAS_TECNICASView catalog)
            {
                return ValidationError("No se encontro la competencia tecnica en el catalogo.");
            }

            if (!string.Equals(catalog.NIVEL?.Trim(), "NIV3", StringComparison.OrdinalIgnoreCase))
            {
                return ValidationError("Solo se pueden asociar competencias tecnicas de nivel 3.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_COMPETENCIAS_TECNICAS))
            {
                Data.NOMBRE_COMPETENCIAS_TECNICAS = catalog.NOMBRE_COMPETENCIAS_TECNICAS?.Trim();
            }

            if (string.IsNullOrWhiteSpace(Data.DESCRIPCION))
            {
                Data.DESCRIPCION = catalog.DESCRIPCION?.Trim();
            }

            return null;
        }

        // Construye los parámetros de filtrado para consultar competencia técnica del perfil.
        private static List<CParameter> BuildParameters(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASParam xWhere, bool includeCorr = false)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.CORR_DESCRIPTOR_PUESTO > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = xWhere.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 });
            }

            if (xWhere.CORR_PERFIL_PUESTO > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_PERFIL_PUESTO", Value = xWhere.CORR_PERFIL_PUESTO, DbType = System.Data.DbType.Int32 });
            }

            if (includeCorr && xWhere.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS > 0)
            {
                p.Add(new CParameter()
                {
                    ParameterName = "CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS",
                    Value = xWhere.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS,
                    DbType = System.Data.DbType.Int32,
                });
            }

            return p;
        }

        // Valida las claves y reglas de negocio requeridas para competencia técnica del perfil.
        private static CResult Validate(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASTable Data, bool esNuevo)
        {
            if (Data.CORR_EMPRESA <= 0)
            {
                return ValidationError("La empresa de sesion no es valida.");
            }

            if (Data.CORR_DESCRIPTOR_PUESTO is not > 0)
            {
                return ValidationError("Debe guardar el descriptor antes de registrar competencias tecnicas.");
            }

            if (Data.CORR_PERFIL_PUESTO is not > 0)
            {
                return ValidationError("Debe guardar el perfil del puesto antes de registrar competencias tecnicas.");
            }

            if (esNuevo && Data.CORR_COMPETENCIAS_TECNICAS is not > 0)
            {
                return ValidationError("Debe seleccionar una competencia tecnica de nivel 3.");
            }

            if (!esNuevo && Data.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS <= 0)
            {
                return ValidationError("Debe indicar la competencia tecnica del perfil a actualizar.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_COMPETENCIAS_TECNICAS))
            {
                return ValidationError("Debe indicar el nombre de la competencia tecnica.");
            }

            if (Data.NOMBRE_COMPETENCIAS_TECNICAS.Trim().Length > 150)
            {
                return ValidationError("El nombre no puede superar 150 caracteres.");
            }

            if (!string.IsNullOrEmpty(Data.DESCRIPCION) && Data.DESCRIPCION.Trim().Length > 500)
            {
                return ValidationError("La descripcion no puede superar 500 caracteres.");
            }

            if (string.IsNullOrWhiteSpace(Data.NIVEL_DOMINIO)
                || !NivelesDominioValidos.Contains(Data.NIVEL_DOMINIO.Trim()))
            {
                return ValidationError("El nivel de dominio debe ser BASICO, INTERMEDIO o AVANZADO.");
            }

            Data.NOMBRE_COMPETENCIAS_TECNICAS = Data.NOMBRE_COMPETENCIAS_TECNICAS.Trim();
            Data.DESCRIPCION = string.IsNullOrWhiteSpace(Data.DESCRIPCION) ? null : Data.DESCRIPCION.Trim();
            Data.NIVEL_DOMINIO = Data.NIVEL_DOMINIO.Trim().ToUpperInvariant();

            return null;
        }

        // Construye un resultado uniforme para reportar errores de validación.
        private static CResult ValidationError(string message)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                RowsAffected = 0,
                CodeHelper = 0,
                ErrorCode = 4101,
                ErrorMessage = message,
                ErrorSource = "",
            };
        }
    }
}
