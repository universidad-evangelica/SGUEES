using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_DESCRIPTOR_RELACION_LABORALService : ISC_DESCRIPTOR_RELACION_LABORALService
    {
        private readonly ISC_DESCRIPTOR_RELACION_LABORALRepository _repo;

        public SC_DESCRIPTOR_RELACION_LABORALService(ISC_DESCRIPTOR_RELACION_LABORALRepository repo)
        {
            _repo = repo;
        }

        // Obtiene el listado de relación laboral aplicando los filtros recibidos.
        public async Task<CResult> GetAllAsync(SC_DESCRIPTOR_RELACION_LABORALParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Obtiene un registro de relación laboral con los identificadores recibidos.
        public async Task<CResult> GetAsync(SC_DESCRIPTOR_RELACION_LABORALParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeRelacion: true));
        }

        // Valida y crea el registro de relación laboral con sus datos de auditoría.
        public async Task<CResult> CreateAsync(SC_DESCRIPTOR_RELACION_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            NormalizeTipoRelacion(Data);
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida y actualiza el registro existente de relación laboral.
        public async Task<CResult> UpdateAsync(SC_DESCRIPTOR_RELACION_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            NormalizeTipoRelacion(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida las claves y elimina el registro de relación laboral.
        public async Task<CResult> DeleteAsync(SC_DESCRIPTOR_RELACION_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data.CORR_EMPRESA <= 0 || Data.CORR_DESCRIPTOR_PUESTO <= 0 || Data.CORR_RELACION_LABORAL <= 0)
            {
                return ValidationError("Debe indicar la relacion laboral a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Construye los parámetros de filtrado para consultar relación laboral.
        private static List<CParameter> BuildParameters(SC_DESCRIPTOR_RELACION_LABORALParam xWhere, bool includeRelacion = false)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.CORR_DESCRIPTOR_PUESTO > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = xWhere.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 });
            }

            if (includeRelacion && xWhere.CORR_RELACION_LABORAL > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_RELACION_LABORAL", Value = xWhere.CORR_RELACION_LABORAL, DbType = System.Data.DbType.Int32 });
            }

            if (!string.IsNullOrWhiteSpace(xWhere.TIPO_RELACION))
            {
                p.Add(new CParameter() { ParameterName = "TIPO_RELACION", Value = xWhere.TIPO_RELACION.Trim().ToUpperInvariant(), DbType = System.Data.DbType.String });
            }

            return p;
        }

        // Valida las claves y reglas de negocio requeridas para relación laboral.
        private static CResult Validate(SC_DESCRIPTOR_RELACION_LABORALTable Data)
        {
            if (Data.CORR_EMPRESA <= 0)
            {
                return ValidationError("La empresa de sesion no es valida.");
            }

            if (Data.CORR_DESCRIPTOR_PUESTO <= 0)
            {
                return ValidationError("Debe guardar el descriptor antes de registrar relaciones laborales.");
            }

            var tipo = (Data.TIPO_RELACION ?? string.Empty).Trim().ToUpperInvariant();
            if (tipo != "I" && tipo != "E")
            {
                return ValidationError("El tipo de relacion debe ser I (Interna) o E (Externa).");
            }

            if (string.IsNullOrWhiteSpace(Data.PUESTO_AREA))
            {
                return ValidationError("Debe indicar el puesto o area de la relacion.");
            }

            if (Data.PUESTO_AREA.Trim().Length > 255)
            {
                return ValidationError("El puesto o area no puede superar 255 caracteres.");
            }

            if (!string.IsNullOrEmpty(Data.MOTIVO_RELACION) && Data.MOTIVO_RELACION.Trim().Length > 500)
            {
                return ValidationError("El motivo de la relacion no puede superar 500 caracteres.");
            }

            return null;
        }

        // Normaliza el tipo de relación laboral antes de consultar o persistir.
        private static void NormalizeTipoRelacion(SC_DESCRIPTOR_RELACION_LABORALTable Data)
        {
            Data.TIPO_RELACION = string.IsNullOrWhiteSpace(Data.TIPO_RELACION)
                ? "I"
                : Data.TIPO_RELACION.Trim().ToUpperInvariant();
            Data.PUESTO_AREA = Data.PUESTO_AREA?.Trim();
            Data.MOTIVO_RELACION = string.IsNullOrWhiteSpace(Data.MOTIVO_RELACION)
                ? null
                : Data.MOTIVO_RELACION.Trim();
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
