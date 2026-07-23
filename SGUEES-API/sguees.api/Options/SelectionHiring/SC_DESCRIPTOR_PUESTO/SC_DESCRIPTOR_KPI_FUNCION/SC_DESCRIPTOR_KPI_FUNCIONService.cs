using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_DESCRIPTOR_KPI_FUNCIONService : ISC_DESCRIPTOR_KPI_FUNCIONService
    {
        private readonly ISC_DESCRIPTOR_KPI_FUNCIONRepository _repo;

        public SC_DESCRIPTOR_KPI_FUNCIONService(ISC_DESCRIPTOR_KPI_FUNCIONRepository repo)
        {
            _repo = repo;
        }

        // Lista KPIs del descriptor; convierte filtros a parámetros SQL y consulta el repositorio.
        public async Task<CResult> GetAllAsync(SC_DESCRIPTOR_KPI_FUNCIONParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Obtiene un KPI por empresa, descriptor y CORR_KPI_FUNCION.
        public async Task<CResult> GetAsync(SC_DESCRIPTOR_KPI_FUNCIONParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeKpi: true));
        }

        // Valida indicador, frecuencia y meta; luego inserta en SC_DESCRIPTOR_KPI_FUNCION.
        public async Task<CResult> CreateAsync(SC_DESCRIPTOR_KPI_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Revisa campos obligatorios y rangos antes de guardar.
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida y actualiza un KPI existente en SC_DESCRIPTOR_KPI_FUNCION.
        public async Task<CResult> UpdateAsync(SC_DESCRIPTOR_KPI_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida claves y elimina el KPI de SC_DESCRIPTOR_KPI_FUNCION.
        public async Task<CResult> DeleteAsync(SC_DESCRIPTOR_KPI_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data.CORR_EMPRESA <= 0 || Data.CORR_DESCRIPTOR_PUESTO <= 0 || Data.CORR_KPI_FUNCION <= 0)
            {
                return ValidationError("Debe indicar el KPI a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Arma parámetros SQL: siempre CORR_EMPRESA; opcionalmente descriptor y CORR_KPI_FUNCION.
        private static List<CParameter> BuildParameters(SC_DESCRIPTOR_KPI_FUNCIONParam xWhere, bool includeKpi = false)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.CORR_DESCRIPTOR_PUESTO > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = xWhere.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 });
            }

            if (includeKpi && xWhere.CORR_KPI_FUNCION > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_KPI_FUNCION", Value = xWhere.CORR_KPI_FUNCION, DbType = System.Data.DbType.Int32 });
            }

            return p;
        }

        // Revisa empresa, descriptor guardado, longitudes y que la meta esté entre 0 y 100.
        private static CResult Validate(SC_DESCRIPTOR_KPI_FUNCIONTable Data)
        {
            if (Data.CORR_EMPRESA <= 0)
            {
                return ValidationError("La empresa de sesion no es valida.");
            }

            if (Data.CORR_DESCRIPTOR_PUESTO <= 0)
            {
                return ValidationError("Debe guardar el descriptor antes de registrar KPIs.");
            }

            if (!string.IsNullOrEmpty(Data.NOMBRE_INDICADOR) && Data.NOMBRE_INDICADOR.Trim().Length > 255)
            {
                return ValidationError("El indicador no puede superar 255 caracteres.");
            }

            if (!string.IsNullOrEmpty(Data.NOMBRE_FRECUENCIA) && Data.NOMBRE_FRECUENCIA.Trim().Length > 50)
            {
                return ValidationError("El nombre de la frecuencia no puede superar 50 caracteres.");
            }

            if (Data.META.HasValue && (Data.META < 0 || Data.META > 100))
            {
                return ValidationError("La meta debe estar entre 0 y 100.");
            }

            return null;
        }

        // Devuelve un CResult con ErrorCode 4101 y el mensaje de validación.
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
