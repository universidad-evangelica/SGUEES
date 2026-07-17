using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_PERFIL_PUESTO_EDUCACIONService : ISC_PERFIL_PUESTO_EDUCACIONService
    {
        // Valores permitidos de tipo requerido en educación.
        private static readonly HashSet<string> TiposRequeridoValidos = new(StringComparer.OrdinalIgnoreCase)
        {
            "SI",
            "NO",
            "DESEABLE",
        };

        private readonly ISC_PERFIL_PUESTO_EDUCACIONRepository _repo;

        public SC_PERFIL_PUESTO_EDUCACIONService(ISC_PERFIL_PUESTO_EDUCACIONRepository repo)
        {
            _repo = repo;
        }

        // Obtiene el listado de educación del perfil aplicando los filtros recibidos.
        public async Task<CResult> GetAllAsync(SC_PERFIL_PUESTO_EDUCACIONParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Obtiene un registro de educación del perfil con los identificadores recibidos.
        public async Task<CResult> GetAsync(SC_PERFIL_PUESTO_EDUCACIONParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeEducacion: true));
        }

        // Valida y crea el registro de educación del perfil con sus datos de auditoría.
        public async Task<CResult> CreateAsync(SC_PERFIL_PUESTO_EDUCACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Valida reglas de negocio del registro.
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida y actualiza el registro existente de educación del perfil.
        public async Task<CResult> UpdateAsync(SC_PERFIL_PUESTO_EDUCACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida las claves y elimina el registro de educación del perfil.
        public async Task<CResult> DeleteAsync(SC_PERFIL_PUESTO_EDUCACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data.CORR_EMPRESA <= 0
                || Data.CORR_DESCRIPTOR_PUESTO <= 0
                || Data.CORR_PERFIL_PUESTO <= 0
                || Data.CORR_EDUCACION <= 0)
            {
                return ValidationError("Debe indicar la educacion a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Construye los parámetros de filtrado para consultar educación del perfil.
        private static List<CParameter> BuildParameters(SC_PERFIL_PUESTO_EDUCACIONParam xWhere, bool includeEducacion = false)
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

            if (includeEducacion && xWhere.CORR_EDUCACION > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_EDUCACION", Value = xWhere.CORR_EDUCACION, DbType = System.Data.DbType.Int32 });
            }

            return p;
        }

        // Valida las claves y reglas de negocio requeridas para educación del perfil.
        private static CResult Validate(SC_PERFIL_PUESTO_EDUCACIONTable Data)
        {
            if (Data.CORR_EMPRESA <= 0)
            {
                return ValidationError("La empresa de sesion no es valida.");
            }

            if (Data.CORR_DESCRIPTOR_PUESTO <= 0)
            {
                return ValidationError("Debe guardar el descriptor antes de registrar educacion.");
            }

            if (Data.CORR_PERFIL_PUESTO <= 0)
            {
                return ValidationError("Debe guardar el perfil del puesto antes de registrar educacion.");
            }

            if (!string.IsNullOrEmpty(Data.REQUISITO) && Data.REQUISITO.Trim().Length > 255)
            {
                return ValidationError("El requisito no puede superar 255 caracteres.");
            }

            if (!string.IsNullOrEmpty(Data.ESPECIFICACIONES) && Data.ESPECIFICACIONES.Trim().Length > 255)
            {
                return ValidationError("Las especificaciones no pueden superar 255 caracteres.");
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
                ErrorCode = 4101,
                ErrorMessage = message,
                ErrorSource = "",
            };
        }
    }
}
