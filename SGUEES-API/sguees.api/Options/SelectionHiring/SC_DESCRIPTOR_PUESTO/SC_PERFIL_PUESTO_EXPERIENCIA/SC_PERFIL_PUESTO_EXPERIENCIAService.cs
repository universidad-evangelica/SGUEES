using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_PERFIL_PUESTO_EXPERIENCIAService : ISC_PERFIL_PUESTO_EXPERIENCIAService
    {
        private static readonly HashSet<string> TiposRequeridoValidos = new(StringComparer.OrdinalIgnoreCase)
        {
            "SI",
            "NO",
            "DESEABLE",
        };

        private readonly ISC_PERFIL_PUESTO_EXPERIENCIARepository _repo;

        public SC_PERFIL_PUESTO_EXPERIENCIAService(ISC_PERFIL_PUESTO_EXPERIENCIARepository repo)
        {
            _repo = repo;
        }

        // Obtiene el listado de experiencia del perfil aplicando los filtros recibidos.
        public async Task<CResult> GetAllAsync(SC_PERFIL_PUESTO_EXPERIENCIAParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Obtiene un registro de experiencia del perfil con los identificadores recibidos.
        public async Task<CResult> GetAsync(SC_PERFIL_PUESTO_EXPERIENCIAParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeExperiencia: true));
        }

        // Valida y crea el registro de experiencia del perfil con sus datos de auditoría.
        public async Task<CResult> CreateAsync(SC_PERFIL_PUESTO_EXPERIENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida y actualiza el registro existente de experiencia del perfil.
        public async Task<CResult> UpdateAsync(SC_PERFIL_PUESTO_EXPERIENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida las claves y elimina el registro de experiencia del perfil.
        public async Task<CResult> DeleteAsync(SC_PERFIL_PUESTO_EXPERIENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data.CORR_EMPRESA <= 0
                || Data.CORR_DESCRIPTOR_PUESTO <= 0
                || Data.CORR_PERFIL_PUESTO <= 0
                || Data.CORR_EXPERIENCIA <= 0)
            {
                return ValidationError("Debe indicar la experiencia a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Construye los parámetros de filtrado para consultar experiencia del perfil.
        private static List<CParameter> BuildParameters(SC_PERFIL_PUESTO_EXPERIENCIAParam xWhere, bool includeExperiencia = false)
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

            if (includeExperiencia && xWhere.CORR_EXPERIENCIA > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_EXPERIENCIA", Value = xWhere.CORR_EXPERIENCIA, DbType = System.Data.DbType.Int32 });
            }

            return p;
        }

        // Valida las claves y reglas de negocio requeridas para experiencia del perfil.
        private static CResult Validate(SC_PERFIL_PUESTO_EXPERIENCIATable Data)
        {
            if (Data.CORR_EMPRESA <= 0)
            {
                return ValidationError("La empresa de sesion no es valida.");
            }

            if (Data.CORR_DESCRIPTOR_PUESTO <= 0)
            {
                return ValidationError("Debe guardar el descriptor antes de registrar experiencia.");
            }

            if (Data.CORR_PERFIL_PUESTO <= 0)
            {
                return ValidationError("Debe guardar el perfil del puesto antes de registrar experiencia.");
            }

            if (!string.IsNullOrEmpty(Data.REQUISITO) && Data.REQUISITO.Trim().Length > 255)
            {
                return ValidationError("El requisito no puede superar 255 caracteres.");
            }

            if (!string.IsNullOrWhiteSpace(Data.TIPO_REQUERIDO)
                && !TiposRequeridoValidos.Contains(Data.TIPO_REQUERIDO.Trim()))
            {
                return ValidationError("El tipo requerido debe ser SI, NO o DESEABLE.");
            }

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
                ErrorCode = 1,
                ErrorMessage = message,
                ErrorSource = "",
            };
        }
    }
}
