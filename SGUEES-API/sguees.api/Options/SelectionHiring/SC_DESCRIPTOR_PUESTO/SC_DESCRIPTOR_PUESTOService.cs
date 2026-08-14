using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_DESCRIPTOR_PUESTOService : ISC_DESCRIPTOR_PUESTOService
    {
        private readonly ISC_DESCRIPTOR_PUESTORepository _repo;
        private readonly ISC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALService _requerimientoOrganizacionalService;
        private readonly ISC_DESCRIPTOR_PUESTO_RIESGO_PUESTOService _riesgoPuestoService;
        private readonly ISC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOService _responsabilidadCargoService;

        public SC_DESCRIPTOR_PUESTOService(
            ISC_DESCRIPTOR_PUESTORepository repo,
            ISC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALService requerimientoOrganizacionalService,
            ISC_DESCRIPTOR_PUESTO_RIESGO_PUESTOService riesgoPuestoService,
            ISC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOService responsabilidadCargoService)
        {
            _repo = repo;
            _requerimientoOrganizacionalService = requerimientoOrganizacionalService;
            _riesgoPuestoService = riesgoPuestoService;
            _responsabilidadCargoService = responsabilidadCargoService;
        }

        // Lista todos los descriptores de la empresa; convierte filtros a parámetros SQL y consulta el repositorio.
        public async Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Obtiene un descriptor por empresa y CORR_DESCRIPTOR_PUESTO.
        public async Task<CResult> GetAsync(SC_DESCRIPTOR_PUESTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = xWhere.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        // Valida reglas de negocio, crea el descriptor y precarga catálogos (requerimientos, riesgos, responsabilidades).
        public async Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Rechaza si CORR_EMPRESA no viene en la sesión.
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            // Valida campos obligatorios (formato, unidad, puesto, fechas, etc.).
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            if (Data.CORR_PUESTO.HasValue)
            {
                // Impide crear si el puesto ya tiene un descriptor en BORRADOR, ENVIADO, REVISADO o ACTIVO.
                var exists = await _repo.ExistsDescriptorAbiertoPorPuestoAsync(
                    Data.CORR_EMPRESA,
                    Data.CORR_PUESTO.Value,
                    0);

                if (exists)
                {
                    return ValidationError(
                        "Ya existe un descriptor para este puesto que se encuentra en proceso de aprobacion o activo. Solo sera posible crear una nueva version cuando la version actual haya sido activada y posteriormente desactivada.");
                }
            }

            // Recorta textos, normaliza formato y estado antes de escribir en la tabla.
            NormalizeData(Data);
            var result = await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
            if (result.ErrorCode != 0)
            {
                return result;
            }

            var corrDescriptor = 0;
            if (result.Data is SC_DESCRIPTOR_PUESTOView created)
            {
                corrDescriptor = created.CORR_DESCRIPTOR_PUESTO;
            }
            else if (result.CodeHelper != null && int.TryParse(result.CodeHelper.ToString(), out var codeHelper))
            {
                corrDescriptor = codeHelper;
            }

            if (corrDescriptor > 0)
            {
                var seedMessages = new List<string>();

                // Copia requerimientos activos del catálogo al descriptor recién creado.
                var seedRequerimientos = await _requerimientoOrganizacionalService.SeedActivosDesdeCatalogoAsync(
                    Data.CORR_EMPRESA,
                    corrDescriptor,
                    vLOGIN_SISTEMA,
                    vESTACION);

                if (!string.IsNullOrWhiteSpace(seedRequerimientos?.ErrorMessage))
                {
                    seedMessages.Add(seedRequerimientos.ErrorMessage.Trim());
                }

                // Copia riesgos activos del catálogo al descriptor recién creado.
                var seedRiesgos = await _riesgoPuestoService.SeedActivosDesdeCatalogoAsync(
                    Data.CORR_EMPRESA,
                    corrDescriptor,
                    vLOGIN_SISTEMA,
                    vESTACION);

                if (!string.IsNullOrWhiteSpace(seedRiesgos?.ErrorMessage))
                {
                    seedMessages.Add(seedRiesgos.ErrorMessage.Trim());
                }

                // Copia responsabilidades activas del catálogo al descriptor recién creado.
                var seedResponsabilidades = await _responsabilidadCargoService.SeedActivosDesdeCatalogoAsync(
                    Data.CORR_EMPRESA,
                    corrDescriptor,
                    vLOGIN_SISTEMA,
                    vESTACION);

                if (!string.IsNullOrWhiteSpace(seedResponsabilidades?.ErrorMessage))
                {
                    seedMessages.Add(seedResponsabilidades.ErrorMessage.Trim());
                }

                if (seedMessages.Count > 0)
                {
                    result.ErrorMessage = string.Join(" ", seedMessages);
                }
            }

            return result;
        }

        // Valida y actualiza un descriptor existente en SC_DESCRIPTOR_PUESTO.
        public async Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Rechaza si CORR_EMPRESA no viene en la sesión.
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            // Valida campos obligatorios (formato, unidad, puesto, fechas, etc.).
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            if (Data.CORR_DESCRIPTOR_PUESTO <= 0)
            {
                return ValidationError("No se pudo identificar el descriptor de puesto a actualizar.");
            }

            // Recorta textos, normaliza formato y estado antes de escribir en la tabla.
            NormalizeData(Data);
            var result = await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
            if (result.ErrorCode != 0)
            {
                return result;
            }

            return result;
        }

        // Actualiza solo RESPONSABLE desde el editable de Entrenamiento.
        public async Task<CResult> UpdateResponsableAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_DESCRIPTOR_PUESTO <= 0)
            {
                return ValidationError("No se pudo identificar el descriptor de puesto a actualizar.");
            }

            Data.RESPONSABLE = string.IsNullOrWhiteSpace(Data.RESPONSABLE) ? null : Data.RESPONSABLE.Trim();
            if (!string.IsNullOrWhiteSpace(Data.RESPONSABLE) && Data.RESPONSABLE.Length > 100)
            {
                return ValidationError("El responsable no puede exceder 100 caracteres.");
            }

            return await _repo.UpdateResponsableAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Actualiza solo impacto económico desde la fila virtual de Responsabilidades.
        public async Task<CResult> UpdateImpactoEconomicoAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_DESCRIPTOR_PUESTO <= 0)
            {
                return ValidationError("No se pudo identificar el descriptor de puesto a actualizar.");
            }

            Data.DESCRIPCION_IMPACTO_ECONOMICO = string.IsNullOrWhiteSpace(Data.DESCRIPCION_IMPACTO_ECONOMICO)
                ? null
                : Data.DESCRIPCION_IMPACTO_ECONOMICO.Trim();

            if (!string.IsNullOrWhiteSpace(Data.DESCRIPCION_IMPACTO_ECONOMICO) && Data.DESCRIPCION_IMPACTO_ECONOMICO.Length > 255)
            {
                return ValidationError("La descripcion del impacto economico no puede exceder 255 caracteres.");
            }

            return await _repo.UpdateImpactoEconomicoAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

	// Valida empresa y elimina el descriptor con sus registros relacionados.
        public async Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Rechaza si CORR_EMPRESA no viene en la sesión.
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Arma la lista de parámetros SQL con CORR_EMPRESA para filtrar consultas.
        private static List<CParameter> BuildParameters(SC_DESCRIPTOR_PUESTOParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        // Recorta textos, unifica alias de formato (CORTA→CORTO, EXTENSA→EXTENSO) y fija estado BORRADOR por defecto.
        private static void NormalizeData(SC_DESCRIPTOR_PUESTOTable Data)
        {
            Data.OBJETIVO_PUESTO = string.IsNullOrWhiteSpace(Data.OBJETIVO_PUESTO)
                ? null
                : Data.OBJETIVO_PUESTO.Trim();
            Data.NOMBRE_PUESTO = string.IsNullOrWhiteSpace(Data.NOMBRE_PUESTO)
                ? null
                : Data.NOMBRE_PUESTO.Trim();
            Data.NOMBRE_UNIDAD = string.IsNullOrWhiteSpace(Data.NOMBRE_UNIDAD)
                ? null
                : Data.NOMBRE_UNIDAD.Trim();
            Data.DESCRIPCION_IMPACTO_ECONOMICO =
                string.IsNullOrWhiteSpace(Data.DESCRIPCION_IMPACTO_ECONOMICO)
                    ? null
                    : Data.DESCRIPCION_IMPACTO_ECONOMICO.Trim();
            Data.RESPONSABLE = string.IsNullOrWhiteSpace(Data.RESPONSABLE) ? null : Data.RESPONSABLE.Trim();
            // Convierte variantes antiguas del formato al valor canónico.
            Data.FORMATO = NormalizeFormato(Data.FORMATO);
            Data.ESTADO_DESCRIPTOR = string.IsNullOrWhiteSpace(Data.ESTADO_DESCRIPTOR)
                ? "BORRADOR"
                : Data.ESTADO_DESCRIPTOR.Trim().ToUpperInvariant();
            Data.VERSION ??= 1;
        }

        // Revisa campos obligatorios y longitudes antes de guardar el descriptor.
        private static CResult Validate(SC_DESCRIPTOR_PUESTOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos del descriptor de puesto.");
            }

            if (string.IsNullOrWhiteSpace(Data.FORMATO))
            {
                return ValidationError("Debe seleccionar el tipo de formato del descriptor.");
            }

            if (!Data.CORR_UNIDAD.HasValue || Data.CORR_UNIDAD <= 0)
            {
                return ValidationError("Debe seleccionar el area (unidad).");
            }

            if (!Data.CORR_PUESTO.HasValue || Data.CORR_PUESTO <= 0)
            {
                return ValidationError("Debe seleccionar el titulo del puesto.");
            }

            if (!Data.CORR_PUESTO_REPORTA.HasValue || Data.CORR_PUESTO_REPORTA <= 0)
            {
                return ValidationError("Debe seleccionar a quien reporta (jefe de la unidad).");
            }

            if (!Data.FECHA_EMISION.HasValue)
            {
                return ValidationError("Debe ingresar la fecha de emision.");
            }

            if (!string.IsNullOrWhiteSpace(Data.OBJETIVO_PUESTO) && Data.OBJETIVO_PUESTO.Trim().Length > 255)
            {
                return ValidationError("El objetivo del puesto no puede superar 255 caracteres.");
            }

            return null;
        }

        // Traduce alias de formato (CORTA/EXTENSA) al valor estándar (CORTO/EXTENSO).
        private static string NormalizeFormato(string formato)
        {
            if (string.IsNullOrWhiteSpace(formato))
            {
                return formato;
            }

            var value = formato.Trim().ToUpperInvariant();
            return value switch
            {
                "CORTA" => "CORTO",
                "EXTENSA" => "EXTENSO",
                _ => value,
            };
        }

        // Rechaza la operación si CORR_EMPRESA no es válida (sesión sin empresa).
        private static CResult ValidateEmpresaSesion(int corrEmpresa)
        {
            if (corrEmpresa <= 0)
            {
                return ValidationError("No se pudo identificar la empresa de la sesion.");
            }

            return null;
        }

        // Devuelve un CResult con ErrorCode 4101 y el mensaje de validación.
        private static CResult ValidationError(string message)
        {
            return new CResult
            {
                Result = false,
                ErrorCode = 4101,
                ErrorMessage = message,
                ErrorSource = "[SC_DESCRIPTOR_PUESTOService]",
            };
        }
    }
}
