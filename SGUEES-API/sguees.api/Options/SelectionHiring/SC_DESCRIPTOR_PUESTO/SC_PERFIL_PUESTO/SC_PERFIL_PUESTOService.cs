using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_PERFIL_PUESTOService : ISC_PERFIL_PUESTOService
    {
        private readonly ISC_PERFIL_PUESTORepository _repo;

        public SC_PERFIL_PUESTOService(ISC_PERFIL_PUESTORepository repo)
        {
            _repo = repo;
        }

        // Obtiene el listado de perfil del puesto aplicando los filtros recibidos.
        public async Task<CResult> GetAllAsync(SC_PERFIL_PUESTOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Obtiene un registro de perfil del puesto con los identificadores recibidos.
        public async Task<CResult> GetAsync(SC_PERFIL_PUESTOParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeDescriptor: true, includePerfil: true));
        }

        // Valida y crea el registro de perfil del puesto con sus datos de auditoría.
        public async Task<CResult> CreateAsync(SC_PERFIL_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            NormalizarCatalogos(Data);
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida y actualiza el registro existente de perfil del puesto.
        public async Task<CResult> UpdateAsync(SC_PERFIL_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data.CORR_PERFIL_PUESTO <= 0)
            {
                return ValidationError("Debe indicar el perfil a actualizar.");
            }

            NormalizarCatalogos(Data);
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Construye los parámetros de filtrado para consultar perfil del puesto.
        private static List<CParameter> BuildParameters(
            SC_PERFIL_PUESTOParam xWhere,
            bool includeDescriptor = false,
            bool includePerfil = false)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (includeDescriptor || xWhere.CORR_DESCRIPTOR_PUESTO > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = xWhere.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 });
            }

            if (includePerfil && xWhere.CORR_PERFIL_PUESTO > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_PERFIL_PUESTO", Value = xWhere.CORR_PERFIL_PUESTO, DbType = System.Data.DbType.Int32 });
            }

            return p;
        }

        private static readonly string[] SexosPermitidos = { "MASCULINO", "FEMENINO", "INDIFERENTE" };
        private static readonly string[] EstadosFamiliaresPermitidos = { "CASADO", "SOLTERO", "INDIFERENTE", "OTRO" };

        // Valida las claves y reglas de negocio requeridas para perfil del puesto.
        private static CResult Validate(SC_PERFIL_PUESTOTable Data)
        {
            if (Data.CORR_EMPRESA <= 0)
            {
                return ValidationError("La empresa de sesion no es valida.");
            }

            if (Data.CORR_DESCRIPTOR_PUESTO <= 0)
            {
                return ValidationError("Debe guardar el descriptor antes de registrar el perfil.");
            }

            if (Data.EDAD_MINIMA.HasValue && Data.EDAD_MAXIMA.HasValue && Data.EDAD_MINIMA > Data.EDAD_MAXIMA)
            {
                return ValidationError("La edad minima no puede ser mayor que la edad maxima.");
            }

            if (Data.EDAD_MINIMA.HasValue && Data.EDAD_MINIMA > 120)
            {
                return ValidationError("La edad minima debe estar entre 0 y 120.");
            }

            if (Data.EDAD_MAXIMA.HasValue && Data.EDAD_MAXIMA > 120)
            {
                return ValidationError("La edad maxima debe estar entre 0 y 120.");
            }

            if (!string.IsNullOrWhiteSpace(Data.SEXO) && !SexosPermitidos.Contains(Data.SEXO.Trim().ToUpperInvariant()))
            {
                return ValidationError("El sexo indicado no es valido.");
            }

            if (!string.IsNullOrWhiteSpace(Data.ESTADO_FAMILIAR) &&
                !EstadosFamiliaresPermitidos.Contains(Data.ESTADO_FAMILIAR.Trim().ToUpperInvariant()))
            {
                return ValidationError("El estado familiar indicado no es valido.");
            }

            return null;
        }

        // Normaliza los códigos de catálogo opcionales del perfil del puesto.
        private static void NormalizarCatalogos(SC_PERFIL_PUESTOTable Data)
        {
            if (!string.IsNullOrWhiteSpace(Data.SEXO))
            {
                Data.SEXO = Data.SEXO.Trim().ToUpperInvariant();
            }

            if (!string.IsNullOrWhiteSpace(Data.ESTADO_FAMILIAR))
            {
                Data.ESTADO_FAMILIAR = Data.ESTADO_FAMILIAR.Trim().ToUpperInvariant();
            }
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
