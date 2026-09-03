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

        // Lista perfiles del puesto; convierte filtros a parámetros SQL y consulta el repositorio.
        public async Task<CResult> GetAllAsync(SC_PERFIL_PUESTOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Obtiene un perfil por empresa, descriptor y CORR_PERFIL_PUESTO.
        public async Task<CResult> GetAsync(SC_PERFIL_PUESTOParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeDescriptor: true, includePerfil: true));
        }

        // Normaliza catálogos, valida edades/sexo y crea el perfil en SC_PERFIL_PUESTO.
        public async Task<CResult> CreateAsync(SC_PERFIL_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            NormalizarCatalogos(Data);
            // Revisa campos obligatorios y rangos antes de guardar.
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Normaliza catálogos, valida y actualiza el perfil en SC_PERFIL_PUESTO.
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

        // Arma parámetros SQL: CORR_EMPRESA; opcionalmente descriptor y CORR_PERFIL_PUESTO.
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

        // Revisa empresa, descriptor guardado, edades, sexo y estado familiar permitidos.
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

            if (!string.IsNullOrWhiteSpace(Data.OTROS) && Data.OTROS.Trim().Length > 150)
            {
                return ValidationError("El campo Otros no puede exceder 150 caracteres.");
            }

            return null;
        }

        // Pone en mayúsculas sexo/estado familiar, recorta nombres de catálogo y limpia ids vacíos.
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

            Data.NOMBRE_DISPONIBILIDAD_HORARIO = string.IsNullOrWhiteSpace(Data.NOMBRE_DISPONIBILIDAD_HORARIO)
                ? null
                : Data.NOMBRE_DISPONIBILIDAD_HORARIO.Trim();
            if (Data.NOMBRE_DISPONIBILIDAD_HORARIO?.Length > 150)
            {
                Data.NOMBRE_DISPONIBILIDAD_HORARIO = Data.NOMBRE_DISPONIBILIDAD_HORARIO.Substring(0, 150);
            }

            Data.NOMBRE_MODALIDAD = string.IsNullOrWhiteSpace(Data.NOMBRE_MODALIDAD)
                ? null
                : Data.NOMBRE_MODALIDAD.Trim();
            if (Data.NOMBRE_MODALIDAD?.Length > 100)
            {
                Data.NOMBRE_MODALIDAD = Data.NOMBRE_MODALIDAD.Substring(0, 100);
            }

            if (!(Data.CORR_DISPONIBILIDAD_HORARIO > 0))
            {
                Data.CORR_DISPONIBILIDAD_HORARIO = null;
                Data.NOMBRE_DISPONIBILIDAD_HORARIO = null;
            }

            if (!(Data.CORR_TIPO_MODALIDAD > 0))
            {
                Data.CORR_TIPO_MODALIDAD = null;
                Data.NOMBRE_MODALIDAD = null;
            }

            Data.OTROS = string.IsNullOrWhiteSpace(Data.OTROS) ? null : Data.OTROS.Trim();
            if (Data.OTROS?.Length > 150)
            {
                Data.OTROS = Data.OTROS.Substring(0, 150);
            }
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
