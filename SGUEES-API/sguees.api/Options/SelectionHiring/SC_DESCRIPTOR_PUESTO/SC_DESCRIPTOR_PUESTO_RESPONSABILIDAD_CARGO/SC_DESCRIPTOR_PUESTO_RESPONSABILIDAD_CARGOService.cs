using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOService : ISC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOService
    {
        private readonly ISC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGORepository _repo;
        private readonly ISC_RESPONSABILIDAD_CARGORepository _catalogoRepo;

        public SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOService(
            ISC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGORepository repo,
            ISC_RESPONSABILIDAD_CARGORepository catalogoRepo)
        {
            _repo = repo;
            _catalogoRepo = catalogoRepo;
        }

        // Obtiene el listado de responsabilidad del cargo aplicando los filtros recibidos.
        public async Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Obtiene un registro de responsabilidad del cargo con los identificadores recibidos.
        public async Task<CResult> GetAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeCorr: true));
        }

        // Valida y crea el registro de responsabilidad del cargo con sus datos de auditoría.
        public async Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Completa y valida el ítem contra el catálogo activo.
            var prepare = await PrepareFromCatalogAsync(Data, esNuevo: true);
            if (prepare != null)
            {
                return prepare;
            }

            // Valida reglas de negocio antes de crear.
            var validation = Validate(Data, esNuevo: true);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida y actualiza el registro existente de responsabilidad del cargo.
        public async Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Valida reglas de negocio antes de actualizar.
            var validation = Validate(Data, esNuevo: false);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida las claves y elimina el registro de responsabilidad del cargo.
        public async Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data.CORR_EMPRESA <= 0 || Data.CORR_DESCRIPTOR_RESPONSABILIDAD <= 0)
            {
                return ValidationError("Debe indicar la responsabilidad del descriptor a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Agrega al descriptor los registros activos de responsabilidad del cargo que aún no existen.
        public async Task<CResult> SeedActivosDesdeCatalogoAsync(int corrEmpresa, int corrDescriptor, string usuario, string estacion)
        {
            if (corrEmpresa <= 0 || corrDescriptor <= 0)
            {
                return SeedSuccess(0);
            }

            try
            {
                // Lista existentes sin filtro de formato para detectar duplicados.
                var existentes = await _repo.GetAllSinFiltroFormatoAsync(corrEmpresa, corrDescriptor);
                // Obtiene catálogo activo a sembrar en el descriptor.
                var catalogo = await _catalogoRepo.GetCatalogoDescriptorAsync(corrEmpresa);
                var ahora = DateTime.Now;
                var creados = 0;
                var pendientes = 0;
                var fallidos = 0;

                foreach (var item in catalogo)
                {
                    if (item.CORR_RESPONSABILIDAD <= 0)
                    {
                        continue;
                    }

                    if (ExisteMismaAplicacion(
                        existentes,
                        item.CORR_RESPONSABILIDAD,
                        item.APLICA_DESCRIPTOR))
                    {
                        continue;
                    }

                    var nombre = (item.NOMBRE_RESPONSABILIDAD ?? string.Empty).Trim();
                    if (string.IsNullOrWhiteSpace(nombre))
                    {
                        continue;
                    }

                    if (nombre.Length > 150)
                    {
                        nombre = nombre.Substring(0, 150);
                    }

                    pendientes++;
                    var createResult = await CreateAsync(new SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable
                    {
                        CORR_EMPRESA = corrEmpresa,
                        CORR_DESCRIPTOR_RESPONSABILIDAD = 0,
                        NOMBRE_RESPONSABILIDAD = nombre,
                        INFORMACION = null,
                        APLICA_DESCRIPTOR = NormalizarAplicacion(item.APLICA_DESCRIPTOR),
                        CORR_DESCRIPTOR_PUESTO = corrDescriptor,
                        CORR_RESPONSABILIDAD = item.CORR_RESPONSABILIDAD,
                        USUARIO_CREA = usuario,
                        ESTACION_CREA = estacion,
                        FECHA_CREA = ahora,
                        USUARIO_ACTU = usuario,
                        ESTACION_ACTU = estacion,
                        FECHA_ACTU = ahora,
                    }, usuario, estacion);

                    if (createResult.ErrorCode == 0)
                    {
                        creados++;
                        existentes.Add(new SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOView
                        {
                            CORR_RESPONSABILIDAD = item.CORR_RESPONSABILIDAD,
                            APLICA_DESCRIPTOR = NormalizarAplicacion(item.APLICA_DESCRIPTOR),
                        });
                    }
                    else
                    {
                        fallidos++;
                    }
                }

                if (pendientes == 0 || fallidos == 0)
                {
                    return SeedSuccess(creados);
                }

                if (creados > 0)
                {
                    return SeedWarning(
                        creados,
                        $"Se cargaron {creados} de {pendientes} responsabilidad(es) del cargo desde el catalogo.");
                }

                return SeedError("No se pudieron cargar las responsabilidades activas del cargo desde el catalogo.");
            }
            catch (Exception ex)
            {
                return SeedError($"No se pudieron cargar las responsabilidades del cargo desde el catalogo: {ex.Message}");
            }
        }

        // Construye la respuesta exitosa del proceso de carga desde catálogo.
        private static CResult SeedSuccess(int creados)
        {
            return new CResult
            {
                Data = null,
                Result = true,
                RowsAffected = creados,
                CodeHelper = 0,
                ErrorCode = 0,
                ErrorMessage = "",
                ErrorSource = "",
            };
        }

        // Construye una advertencia cuando la carga desde catálogo queda parcial.
        private static CResult SeedWarning(int creados, string message)
        {
            return new CResult
            {
                Data = null,
                Result = true,
                RowsAffected = creados,
                CodeHelper = 0,
                ErrorCode = 0,
                ErrorMessage = message,
                ErrorSource = "[SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOService]",
            };
        }

        // Construye la respuesta de error del proceso de carga desde catálogo.
        private static CResult SeedError(string message)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                RowsAffected = 0,
                CodeHelper = 0,
                ErrorCode = 4101,
                ErrorMessage = message,
                ErrorSource = "[SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOService]",
            };
        }

        // Completa y contrasta los datos de responsabilidad del cargo con el catálogo activo.
        private async Task<CResult> PrepareFromCatalogAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable Data, bool esNuevo)
        {
            if (!esNuevo || Data.CORR_RESPONSABILIDAD is not > 0)
            {
                return null;
            }

            var existentes = await _repo.GetAllSinFiltroFormatoAsync(
                Data.CORR_EMPRESA,
                Data.CORR_DESCRIPTOR_PUESTO.GetValueOrDefault());

            // Consulta la responsabilidad en el catálogo maestro.
            var catalogResult = await _catalogoRepo.GetAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_RESPONSABILIDAD", Value = Data.CORR_RESPONSABILIDAD.Value, DbType = System.Data.DbType.Int32 },
            });

            if (!catalogResult.Result || catalogResult.Data is not SC_RESPONSABILIDAD_CARGOView catalog)
            {
                return ValidationError("No se encontro la responsabilidad de cargo en el catalogo.");
            }

            if (catalog.ESTADO_RESPONSABILIDAD == false)
            {
                return ValidationError("La responsabilidad de cargo seleccionada esta inactiva.");
            }

            var aplicaDescriptor = NormalizarAplicacion(catalog.APLICA_DESCRIPTOR);
            if (ExisteMismaAplicacion(
                existentes,
                Data.CORR_RESPONSABILIDAD.Value,
                aplicaDescriptor))
            {
                return ValidationError("La responsabilidad de cargo ya esta registrada en el descriptor para ese formato.");
            }

            Data.APLICA_DESCRIPTOR = aplicaDescriptor;
            if (string.IsNullOrWhiteSpace(Data.NOMBRE_RESPONSABILIDAD))
            {
                Data.NOMBRE_RESPONSABILIDAD = catalog.NOMBRE_RESPONSABILIDAD?.Trim();
            }

            return null;
        }

        // Construye los parámetros de filtrado para consultar responsabilidad del cargo.
        private static List<CParameter> BuildParameters(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOParam xWhere, bool includeCorr = false)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.CORR_DESCRIPTOR_PUESTO > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = xWhere.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 });
            }

            if (!includeCorr)
            {
                // Añade FORMATO para el filtrado de aplicabilidad en GetAll.
                var formato = string.IsNullOrWhiteSpace(xWhere.FORMATO)
                    ? "CORTO"
                    : xWhere.FORMATO.Trim().ToUpperInvariant();
                p.Add(new CParameter() { ParameterName = "FORMATO", Value = formato, DbType = System.Data.DbType.String });
            }

            if (includeCorr && xWhere.CORR_DESCRIPTOR_RESPONSABILIDAD > 0)
            {
                p.Add(new CParameter()
                {
                    ParameterName = "CORR_DESCRIPTOR_RESPONSABILIDAD",
                    Value = xWhere.CORR_DESCRIPTOR_RESPONSABILIDAD,
                    DbType = System.Data.DbType.Int32,
                });
            }

            return p;
        }

        // Valida las claves y reglas de negocio requeridas para responsabilidad del cargo.
        private static CResult Validate(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable Data, bool esNuevo)
        {
            if (Data.CORR_EMPRESA <= 0)
            {
                return ValidationError("La empresa de sesion no es valida.");
            }

            if (Data.CORR_DESCRIPTOR_PUESTO is not > 0)
            {
                return ValidationError("Debe guardar el descriptor antes de registrar responsabilidades del cargo.");
            }

            if (esNuevo && Data.CORR_RESPONSABILIDAD is not > 0)
            {
                return ValidationError("Debe seleccionar una responsabilidad de cargo.");
            }

            if (!esNuevo && Data.CORR_DESCRIPTOR_RESPONSABILIDAD <= 0)
            {
                return ValidationError("Debe indicar la responsabilidad del descriptor a actualizar.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_RESPONSABILIDAD))
            {
                return ValidationError("Debe indicar el nombre de la responsabilidad.");
            }

            if (Data.NOMBRE_RESPONSABILIDAD.Trim().Length > 150)
            {
                return ValidationError("El nombre de la responsabilidad no puede superar 150 caracteres.");
            }

            Data.NOMBRE_RESPONSABILIDAD = Data.NOMBRE_RESPONSABILIDAD.Trim();

            if (!string.IsNullOrWhiteSpace(Data.INFORMACION) && Data.INFORMACION.Trim().Length > 255)
            {
                return ValidationError("La informacion no puede superar 255 caracteres.");
            }

            Data.INFORMACION = string.IsNullOrWhiteSpace(Data.INFORMACION) ? null : Data.INFORMACION.Trim();
            Data.APLICA_DESCRIPTOR = NormalizarAplicacion(Data.APLICA_DESCRIPTOR);
            if (Data.APLICA_DESCRIPTOR != "CORTO" &&
                Data.APLICA_DESCRIPTOR != "EXTENSO" &&
                Data.APLICA_DESCRIPTOR != "AMBOS")
            {
                return ValidationError("La aplicabilidad de la responsabilidad no es valida.");
            }

            return null;
        }

        // Normaliza el indicador de aplicación usado para comparar responsabilidades.
        private static string NormalizarAplicacion(string aplicaDescriptor)
        {
            return string.IsNullOrWhiteSpace(aplicaDescriptor)
                ? "AMBOS"
                : aplicaDescriptor.Trim().ToUpperInvariant();
        }

        // Comprueba si ya existe la misma responsabilidad con igual aplicación.
        private static bool ExisteMismaAplicacion(
            List<SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOView> existentes,
            int corrResponsabilidad,
            string nuevaAplicacion)
        {
            var nueva = NormalizarAplicacion(nuevaAplicacion);
            return existentes.Exists(x =>
                x.CORR_RESPONSABILIDAD == corrResponsabilidad &&
                NormalizarAplicacion(x.APLICA_DESCRIPTOR) == nueva);
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
