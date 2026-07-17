using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_DESCRIPTOR_FUNCIONService : ISC_DESCRIPTOR_FUNCIONService
    {
        private readonly ISC_DESCRIPTOR_FUNCIONRepository _repo;
        private readonly ISC_DESCRIPTOR_FUNCION_ACTIVIDADRepository _actividadRepo;

        public SC_DESCRIPTOR_FUNCIONService(
            ISC_DESCRIPTOR_FUNCIONRepository repo,
            ISC_DESCRIPTOR_FUNCION_ACTIVIDADRepository actividadRepo)
        {
            _repo = repo;
            _actividadRepo = actividadRepo;
        }

        // Obtiene el listado de función del descriptor aplicando los filtros recibidos.
        public async Task<CResult> GetAllAsync(SC_DESCRIPTOR_FUNCIONParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Obtiene un registro de función del descriptor con los identificadores recibidos.
        public async Task<CResult> GetAsync(SC_DESCRIPTOR_FUNCIONParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeFuncion: true));
        }

        // Valida y crea el registro de función del descriptor con sus datos de auditoría.
        public async Task<CResult> CreateAsync(SC_DESCRIPTOR_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            NormalizeTipoFuncion(Data);
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida y actualiza el registro existente de función del descriptor.
        public async Task<CResult> UpdateAsync(SC_DESCRIPTOR_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            NormalizeTipoFuncion(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida las claves y elimina el registro de función del descriptor.
        public async Task<CResult> DeleteAsync(SC_DESCRIPTOR_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data.CORR_EMPRESA <= 0 || Data.CORR_DESCRIPTOR_PUESTO <= 0 || Data.CORR_FUNCION <= 0)
            {
                return ValidationError("Debe indicar la funcion a eliminar.");
            }

            await _actividadRepo.DeleteByFuncionAsync(Data, vLOGIN_SISTEMA, vESTACION);
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Construye los parámetros de filtrado para consultar función del descriptor.
        private static List<CParameter> BuildParameters(SC_DESCRIPTOR_FUNCIONParam xWhere, bool includeFuncion = false)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.CORR_DESCRIPTOR_PUESTO > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = xWhere.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 });
            }

            if (includeFuncion && xWhere.CORR_FUNCION > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_FUNCION", Value = xWhere.CORR_FUNCION, DbType = System.Data.DbType.Int32 });
            }

            if (!string.IsNullOrWhiteSpace(xWhere.TIPO_FUNCION))
            {
                p.Add(new CParameter() { ParameterName = "TIPO_FUNCION", Value = xWhere.TIPO_FUNCION.Trim(), DbType = System.Data.DbType.String });
            }

            return p;
        }

        // Valida las claves y reglas de negocio requeridas para función del descriptor.
        private static CResult Validate(SC_DESCRIPTOR_FUNCIONTable Data)
        {
            if (Data.CORR_EMPRESA <= 0)
            {
                return ValidationError("La empresa de sesion no es valida.");
            }

            if (Data.CORR_DESCRIPTOR_PUESTO <= 0)
            {
                return ValidationError("Debe guardar el descriptor antes de registrar funciones.");
            }

            if (!string.IsNullOrEmpty(Data.NOMBRE_FUNCION) && Data.NOMBRE_FUNCION.Trim().Length > 255)
            {
                return ValidationError("El nombre de la funcion no puede superar 255 caracteres.");
            }

            return null;
        }

        // Normaliza el tipo de función para mantener un valor consistente.
        private static void NormalizeTipoFuncion(SC_DESCRIPTOR_FUNCIONTable Data)
        {
            Data.TIPO_FUNCION = string.IsNullOrWhiteSpace(Data.TIPO_FUNCION)
                ? "CLAVE"
                : Data.TIPO_FUNCION.Trim().ToUpperInvariant();
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
