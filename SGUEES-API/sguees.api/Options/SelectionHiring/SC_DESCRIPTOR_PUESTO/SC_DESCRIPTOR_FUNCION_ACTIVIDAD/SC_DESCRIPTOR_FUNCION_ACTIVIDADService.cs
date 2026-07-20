using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_DESCRIPTOR_FUNCION_ACTIVIDADService : ISC_DESCRIPTOR_FUNCION_ACTIVIDADService
    {
        private readonly ISC_DESCRIPTOR_FUNCION_ACTIVIDADRepository _repo;

        public SC_DESCRIPTOR_FUNCION_ACTIVIDADService(ISC_DESCRIPTOR_FUNCION_ACTIVIDADRepository repo)
        {
            _repo = repo;
        }

        // Obtiene el listado de actividad de la función aplicando los filtros recibidos.
        public async Task<CResult> GetAllAsync(SC_DESCRIPTOR_FUNCION_ACTIVIDADParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Obtiene un registro de actividad de la función con los identificadores recibidos.
        public async Task<CResult> GetAsync(SC_DESCRIPTOR_FUNCION_ACTIVIDADParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeActividad: true));
        }

        // Valida y crea el registro de actividad de la función con sus datos de auditoría.
        public async Task<CResult> CreateAsync(SC_DESCRIPTOR_FUNCION_ACTIVIDADTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Valida reglas de negocio del registro.
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida y actualiza el registro existente de actividad de la función.
        public async Task<CResult> UpdateAsync(SC_DESCRIPTOR_FUNCION_ACTIVIDADTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida las claves y elimina el registro de actividad de la función.
        public async Task<CResult> DeleteAsync(SC_DESCRIPTOR_FUNCION_ACTIVIDADTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data.CORR_EMPRESA <= 0 || Data.CORR_DESCRIPTOR_PUESTO <= 0 || Data.CORR_FUNCION <= 0 || Data.CORR_ACTIVIDAD <= 0)
            {
                return ValidationError("Debe indicar la actividad a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Construye los parámetros de filtrado para consultar actividad de la función.
        private static List<CParameter> BuildParameters(SC_DESCRIPTOR_FUNCION_ACTIVIDADParam xWhere, bool includeActividad = false)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.CORR_DESCRIPTOR_PUESTO > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = xWhere.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 });
            }

            if (xWhere.CORR_FUNCION > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_FUNCION", Value = xWhere.CORR_FUNCION, DbType = System.Data.DbType.Int32 });
            }

            if (includeActividad && xWhere.CORR_ACTIVIDAD > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_ACTIVIDAD", Value = xWhere.CORR_ACTIVIDAD, DbType = System.Data.DbType.Int32 });
            }

            return p;
        }

        // Valida las claves y reglas de negocio requeridas para actividad de la función.
        private static CResult Validate(SC_DESCRIPTOR_FUNCION_ACTIVIDADTable Data)
        {
            if (Data.CORR_EMPRESA <= 0)
            {
                return ValidationError("La empresa de sesion no es valida.");
            }

            if (Data.CORR_DESCRIPTOR_PUESTO <= 0 || Data.CORR_FUNCION <= 0)
            {
                return ValidationError("Debe indicar la funcion clave asociada.");
            }

            if (!string.IsNullOrEmpty(Data.NOMBRE_ACTIVIDAD) && Data.NOMBRE_ACTIVIDAD.Trim().Length > 255)
            {
                return ValidationError("El nombre de la actividad no puede superar 255 caracteres.");
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
