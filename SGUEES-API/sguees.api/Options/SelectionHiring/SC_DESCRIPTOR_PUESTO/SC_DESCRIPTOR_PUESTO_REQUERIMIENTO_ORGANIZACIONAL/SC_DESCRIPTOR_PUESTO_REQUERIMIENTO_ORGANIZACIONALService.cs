using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALService : ISC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALService
    {
        private readonly ISC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALRepository _repo;
        private readonly ISC_REQUERIMIENTO_ORGANIZACIONALRepository _catalogoRepo;

        public SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALService(
            ISC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALRepository repo,
            ISC_REQUERIMIENTO_ORGANIZACIONALRepository catalogoRepo)
        {
            _repo = repo;
            _catalogoRepo = catalogoRepo;
        }

        // Obtiene el listado de requerimiento organizacional aplicando los filtros recibidos.
        public async Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Obtiene un registro de requerimiento organizacional con los identificadores recibidos.
        public async Task<CResult> GetAsync(SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeCorr: true));
        }

        // Valida y crea el registro de requerimiento organizacional con sus datos de auditoría.
        public async Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var prepare = await PrepareFromCatalogAsync(Data, esNuevo: true);
            if (prepare != null)
            {
                return prepare;
            }

            var validation = Validate(Data, esNuevo: true);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida y actualiza el registro existente de requerimiento organizacional.
        public async Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data, esNuevo: false);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida las claves y elimina el registro de requerimiento organizacional.
        public async Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data.CORR_EMPRESA <= 0 || Data.CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL <= 0)
            {
                return ValidationError("Debe indicar el requerimiento organizacional del descriptor a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Agrega al descriptor los registros activos de requerimiento organizacional que aún no existen.
        public async Task<CResult> SeedActivosDesdeCatalogoAsync(int corrEmpresa, int corrDescriptor, string usuario, string estacion)
        {
            if (corrEmpresa <= 0 || corrDescriptor <= 0)
            {
                return SeedSuccess(0);
            }

            try
            {
                var existentes = await GetAllAsync(new SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALParam
                {
                    CORR_EMPRESA = corrEmpresa,
                    CORR_DESCRIPTOR_PUESTO = corrDescriptor,
                });

                if (!existentes.Result)
                {
                    return SeedError("No se pudieron consultar los requerimientos organizacionales del descriptor.");
                }

                var catalogoUsados = new HashSet<int>();
                if (existentes.Data is List<SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALView> rows)
                {
                    foreach (var row in rows)
                    {
                        if (row.CORR_REQUERIMIENTO_ORGANIZACIONAL is > 0)
                        {
                            catalogoUsados.Add(row.CORR_REQUERIMIENTO_ORGANIZACIONAL.Value);
                        }
                    }
                }

                var catalogo = await _catalogoRepo.GetCatalogoDescriptorAsync(corrEmpresa);
                var ahora = DateTime.Now;
                var creados = 0;
                var pendientes = 0;
                var fallidos = 0;

                foreach (var item in catalogo)
                {
                    if (item.CORR_REQUERIMIENTO_ORGANIZACIONAL <= 0)
                    {
                        continue;
                    }

                    if (catalogoUsados.Contains(item.CORR_REQUERIMIENTO_ORGANIZACIONAL))
                    {
                        continue;
                    }

                    var descripcion = (item.DESCRIPCION ?? string.Empty).Trim();
                    if (string.IsNullOrWhiteSpace(descripcion))
                    {
                        continue;
                    }

                    if (descripcion.Length > 150)
                    {
                        descripcion = descripcion.Substring(0, 150);
                    }

                    pendientes++;
                    var createResult = await CreateAsync(new SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALTable
                    {
                        CORR_EMPRESA = corrEmpresa,
                        CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL = 0,
                        DESCRIPCION = descripcion,
                        CORR_DESCRIPTOR_PUESTO = corrDescriptor,
                        CORR_REQUERIMIENTO_ORGANIZACIONAL = item.CORR_REQUERIMIENTO_ORGANIZACIONAL,
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
                        catalogoUsados.Add(item.CORR_REQUERIMIENTO_ORGANIZACIONAL);
                    }
                    else
                    {
                        fallidos++;
                    }
                }

                if (pendientes == 0)
                {
                    return SeedSuccess(creados);
                }

                if (fallidos == 0)
                {
                    return SeedSuccess(creados);
                }

                if (creados > 0)
                {
                    return SeedWarning(
                        creados,
                        $"Se cargaron {creados} de {pendientes} requerimiento(s) organizacional(es) desde el catalogo.");
                }

                return SeedError("No se pudieron cargar los requerimientos organizacionales activos desde el catalogo.");
            }
            catch (Exception ex)
            {
                return SeedError($"No se pudieron cargar los requerimientos organizacionales desde el catalogo: {ex.Message}");
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
                ErrorSource = "[SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALService]",
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
                ErrorCode = 1,
                ErrorMessage = message,
                ErrorSource = "[SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALService]",
            };
        }

        // Completa y contrasta los datos de requerimiento organizacional con el catálogo activo.
        private async Task<CResult> PrepareFromCatalogAsync(SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALTable Data, bool esNuevo)
        {
            if (!esNuevo || Data.CORR_REQUERIMIENTO_ORGANIZACIONAL is not > 0)
            {
                return null;
            }

            var catalogResult = await _catalogoRepo.GetAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_REQUERIMIENTO_ORGANIZACIONAL", Value = Data.CORR_REQUERIMIENTO_ORGANIZACIONAL.Value, DbType = System.Data.DbType.Int32 },
            });

            if (!catalogResult.Result || catalogResult.Data is not SC_REQUERIMIENTO_ORGANIZACIONALView catalog)
            {
                return ValidationError("No se encontro el requerimiento organizacional en el catalogo.");
            }

            if (catalog.ESTADO_REQUERIMIENTO_ORGANIZACIONAL == false)
            {
                return ValidationError("El requerimiento organizacional seleccionado esta inactivo.");
            }

            if (string.IsNullOrWhiteSpace(Data.DESCRIPCION))
            {
                Data.DESCRIPCION = catalog.DESCRIPCION?.Trim();
            }

            return null;
        }

        // Construye los parámetros de filtrado para consultar requerimiento organizacional.
        private static List<CParameter> BuildParameters(SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALParam xWhere, bool includeCorr = false)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.CORR_DESCRIPTOR_PUESTO > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = xWhere.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 });
            }

            if (includeCorr && xWhere.CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL > 0)
            {
                p.Add(new CParameter()
                {
                    ParameterName = "CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL",
                    Value = xWhere.CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL,
                    DbType = System.Data.DbType.Int32,
                });
            }

            return p;
        }

        // Valida las claves y reglas de negocio requeridas para requerimiento organizacional.
        private static CResult Validate(SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALTable Data, bool esNuevo)
        {
            if (Data.CORR_EMPRESA <= 0)
            {
                return ValidationError("La empresa de sesion no es valida.");
            }

            if (Data.CORR_DESCRIPTOR_PUESTO is not > 0)
            {
                return ValidationError("Debe guardar el descriptor antes de registrar requerimientos organizacionales.");
            }

            if (esNuevo && Data.CORR_REQUERIMIENTO_ORGANIZACIONAL is not > 0)
            {
                return ValidationError("Debe seleccionar un requerimiento organizacional.");
            }

            if (!esNuevo && Data.CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL <= 0)
            {
                return ValidationError("Debe indicar el requerimiento organizacional del descriptor a actualizar.");
            }

            if (string.IsNullOrWhiteSpace(Data.DESCRIPCION))
            {
                return ValidationError("Debe indicar la descripcion del requerimiento organizacional.");
            }

            if (Data.DESCRIPCION.Trim().Length > 150)
            {
                return ValidationError("La descripcion no puede superar 150 caracteres.");
            }

            Data.DESCRIPCION = Data.DESCRIPCION.Trim();

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
