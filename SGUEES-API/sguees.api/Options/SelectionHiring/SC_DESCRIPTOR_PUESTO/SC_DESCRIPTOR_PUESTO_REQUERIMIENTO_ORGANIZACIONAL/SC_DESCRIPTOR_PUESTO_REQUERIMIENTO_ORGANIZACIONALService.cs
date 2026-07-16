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

        public async Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        public async Task<CResult> GetAsync(SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeCorr: true));
        }

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

        public async Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data, esNuevo: false);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data.CORR_EMPRESA <= 0 || Data.CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL <= 0)
            {
                return ValidationError("Debe indicar el requerimiento organizacional del descriptor a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> SeedActivosDesdeCatalogoAsync(int corrEmpresa, int corrDescriptor, string usuario, string estacion)
        {
            if (corrEmpresa <= 0 || corrDescriptor <= 0)
            {
                return new CResult
                {
                    Data = null,
                    Result = true,
                    RowsAffected = 0,
                    CodeHelper = 0,
                    ErrorCode = 0,
                    ErrorMessage = "",
                    ErrorSource = "",
                };
            }

            var existentes = await GetAllAsync(new SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALParam
            {
                CORR_EMPRESA = corrEmpresa,
                CORR_DESCRIPTOR_PUESTO = corrDescriptor,
            });

            if (existentes.Result && existentes.Data is List<SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALView> rows && rows.Count > 0)
            {
                return new CResult
                {
                    Data = rows,
                    Result = true,
                    RowsAffected = 0,
                    CodeHelper = 0,
                    ErrorCode = 0,
                    ErrorMessage = "",
                    ErrorSource = "",
                };
            }

            var catalogo = await _catalogoRepo.GetCatalogoDescriptorAsync(corrEmpresa);
            var ahora = DateTime.Now;
            var creados = 0;

            foreach (var item in catalogo)
            {
                if (item.CORR_REQUERIMIENTO_ORGANIZACIONAL <= 0)
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
                }
            }

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
