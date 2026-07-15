using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOService : ISC_DESCRIPTOR_PUESTO_RIESGO_PUESTOService
    {
        private readonly ISC_DESCRIPTOR_PUESTO_RIESGO_PUESTORepository _repo;
        private readonly ISC_RIESGO_PUESTORepository _catalogoRepo;

        public SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOService(
            ISC_DESCRIPTOR_PUESTO_RIESGO_PUESTORepository repo,
            ISC_RIESGO_PUESTORepository catalogoRepo)
        {
            _repo = repo;
            _catalogoRepo = catalogoRepo;
        }

        public async Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetAsync(SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeCorr: true));
        }

        public async Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

        public async Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data, esNuevo: false);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data.CORR_EMPRESA <= 0 || Data.CORR_DESCRIPTOR_RIESGO <= 0)
            {
                return ValidationError("Debe indicar el riesgo del descriptor a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> SeedActivosDesdeCatalogoAsync(int corrEmpresa, int corrDescriptor, string usuario, string estacion)
        {
            if (corrEmpresa <= 0 || corrDescriptor <= 0)
            {
                return SeedSuccess(0);
            }

            try
            {
                var existentes = await GetAllAsync(new SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOParam
                {
                    CORR_EMPRESA = corrEmpresa,
                    CORR_DESCRIPTOR_PUESTO = corrDescriptor,
                });

                if (!existentes.Result)
                {
                    return SeedError("No se pudieron consultar los riesgos del descriptor.");
                }

                var catalogoUsados = new HashSet<int>();
                if (existentes.Data is List<SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOView> rows)
                {
                    foreach (var row in rows)
                    {
                        if (row.CORR_RIESGO_PUESTO is > 0)
                        {
                            catalogoUsados.Add(row.CORR_RIESGO_PUESTO.Value);
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
                    if (item.CORR_RIESGO_PUESTO <= 0)
                    {
                        continue;
                    }

                    if (catalogoUsados.Contains(item.CORR_RIESGO_PUESTO))
                    {
                        continue;
                    }

                    var nombre = (item.NOMBRE_RIESGO_PUESTO ?? string.Empty).Trim();
                    if (string.IsNullOrWhiteSpace(nombre))
                    {
                        continue;
                    }

                    if (nombre.Length > 150)
                    {
                        nombre = nombre.Substring(0, 150);
                    }

                    pendientes++;
                    var createResult = await CreateAsync(new SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOTable
                    {
                        CORR_EMPRESA = corrEmpresa,
                        CORR_DESCRIPTOR_RIESGO = 0,
                        NOMBRE_RIESGO_PUESTO = nombre,
                        INFORMACION = null,
                        CORR_DESCRIPTOR_PUESTO = corrDescriptor,
                        CORR_RIESGO_PUESTO = item.CORR_RIESGO_PUESTO,
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
                        catalogoUsados.Add(item.CORR_RIESGO_PUESTO);
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
                        $"Se cargaron {creados} de {pendientes} riesgo(s) del puesto desde el catalogo.");
                }

                return SeedError("No se pudieron cargar los riesgos activos del puesto desde el catalogo.");
            }
            catch (Exception ex)
            {
                return SeedError($"No se pudieron cargar los riesgos del puesto desde el catalogo: {ex.Message}");
            }
        }

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
                ErrorSource = "[SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOService]",
            };
        }

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
                ErrorSource = "[SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOService]",
            };
        }

        private async Task<CResult> PrepareFromCatalogAsync(SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOTable Data, bool esNuevo)
        {
            if (!esNuevo || Data.CORR_RIESGO_PUESTO is not > 0)
            {
                return null;
            }

            var catalogResult = await _catalogoRepo.GetAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_RIESGO_PUESTO", Value = Data.CORR_RIESGO_PUESTO.Value, DbType = System.Data.DbType.Int32 },
            });

            if (!catalogResult.Result || catalogResult.Data is not SC_RIESGO_PUESTOView catalog)
            {
                return ValidationError("No se encontro el riesgo de puesto en el catalogo.");
            }

            if (catalog.ESTADO_RIESGO_PUESTO == false)
            {
                return ValidationError("El riesgo de puesto seleccionado esta inactivo.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_RIESGO_PUESTO))
            {
                Data.NOMBRE_RIESGO_PUESTO = catalog.NOMBRE_RIESGO_PUESTO?.Trim();
            }

            return null;
        }

        private static List<CParameter> BuildParameters(SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOParam xWhere, bool includeCorr = false)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.CORR_DESCRIPTOR_PUESTO > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = xWhere.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 });
            }

            if (includeCorr && xWhere.CORR_DESCRIPTOR_RIESGO > 0)
            {
                p.Add(new CParameter()
                {
                    ParameterName = "CORR_DESCRIPTOR_RIESGO",
                    Value = xWhere.CORR_DESCRIPTOR_RIESGO,
                    DbType = System.Data.DbType.Int32,
                });
            }

            return p;
        }

        private static CResult Validate(SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOTable Data, bool esNuevo)
        {
            if (Data.CORR_EMPRESA <= 0)
            {
                return ValidationError("La empresa de sesion no es valida.");
            }

            if (Data.CORR_DESCRIPTOR_PUESTO is not > 0)
            {
                return ValidationError("Debe guardar el descriptor antes de registrar riesgos del puesto.");
            }

            if (esNuevo && Data.CORR_RIESGO_PUESTO is not > 0)
            {
                return ValidationError("Debe seleccionar un riesgo de puesto.");
            }

            if (!esNuevo && Data.CORR_DESCRIPTOR_RIESGO <= 0)
            {
                return ValidationError("Debe indicar el riesgo del descriptor a actualizar.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_RIESGO_PUESTO))
            {
                return ValidationError("Debe indicar el nombre del riesgo.");
            }

            if (Data.NOMBRE_RIESGO_PUESTO.Trim().Length > 150)
            {
                return ValidationError("El nombre del riesgo no puede superar 150 caracteres.");
            }

            Data.NOMBRE_RIESGO_PUESTO = Data.NOMBRE_RIESGO_PUESTO.Trim();

            if (!string.IsNullOrWhiteSpace(Data.INFORMACION) && Data.INFORMACION.Trim().Length > 255)
            {
                return ValidationError("La informacion no puede superar 255 caracteres.");
            }

            Data.INFORMACION = string.IsNullOrWhiteSpace(Data.INFORMACION) ? null : Data.INFORMACION.Trim();

            return null;
        }

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
