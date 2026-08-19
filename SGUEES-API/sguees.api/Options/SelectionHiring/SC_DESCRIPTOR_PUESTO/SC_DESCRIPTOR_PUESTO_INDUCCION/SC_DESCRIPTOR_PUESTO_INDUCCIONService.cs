using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_DESCRIPTOR_PUESTO_INDUCCIONService : ISC_DESCRIPTOR_PUESTO_INDUCCIONService
    {
        private readonly ISC_DESCRIPTOR_PUESTO_INDUCCIONRepository _repo;
        private readonly ISC_INDUCCIONRepository _catalogoRepo;

        public SC_DESCRIPTOR_PUESTO_INDUCCIONService(
            ISC_DESCRIPTOR_PUESTO_INDUCCIONRepository repo,
            ISC_INDUCCIONRepository catalogoRepo)
        {
            _repo = repo;
            _catalogoRepo = catalogoRepo;
        }

        // Obtiene el listado de inducciones del descriptor aplicando los filtros recibidos.
        public async Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTO_INDUCCIONParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Obtiene un registro de inducción del descriptor con los identificadores recibidos.
        public async Task<CResult> GetAsync(SC_DESCRIPTOR_PUESTO_INDUCCIONParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeCorr: true));
        }

        // Valida y crea el registro de inducción del descriptor con sus datos de auditoría.
        public async Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTO_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Completa y valida el ítem contra el catálogo activo.
            var prepare = await PrepareFromCatalogAsync(Data);
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

        // Valida y actualiza el registro existente de inducción del descriptor.
        public async Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTO_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Valida reglas de negocio antes de actualizar.
            var validation = Validate(Data, esNuevo: false);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida las claves y elimina el registro de inducción del descriptor.
        public async Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTO_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data.CORR_EMPRESA <= 0 || Data.CORR_DESCRIPTOR_PUESTO <= 0 || Data.CORR_INDUCCION <= 0)
            {
                return ValidationError("Debe indicar la induccion del descriptor a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Completa y contrasta los datos de inducción del descriptor con el catálogo activo.
        private async Task<CResult> PrepareFromCatalogAsync(SC_DESCRIPTOR_PUESTO_INDUCCIONTable Data)
        {
            if (Data == null || Data.CORR_INDUCCION <= 0)
            {
                return ValidationError("Debe seleccionar una induccion.");
            }

            // Consulta la inducción en el catálogo maestro.
            var catalogResult = await _catalogoRepo.GetAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_INDUCCION", Value = Data.CORR_INDUCCION, DbType = System.Data.DbType.Int32 },
            });

            if (!catalogResult.Result || catalogResult.Data is not SC_INDUCCIONView catalog)
            {
                return ValidationError("No se encontro la induccion en el catalogo.");
            }

            if (catalog.ESTADO_INDUCCION == false)
            {
                return ValidationError("La induccion seleccionada esta inactiva.");
            }

            // Snapshot: nombre y duración unida (ej. "2 Semanas") vigentes del catálogo al agregar.
            Data.NOMBRE_INDUCCION = catalog.NOMBRE_INDUCCION?.Trim();
            Data.TIEMPO_INDUCCION = BuildDuracionSnapshot(catalog.TIEMPO_INDUCCION, catalog.UNIDAD_TIEMPO);

            return null;
        }

        // Une el valor entero y la unidad del catálogo en un solo texto (ej. "2 Semanas").
        private static string BuildDuracionSnapshot(int? tiempo, string unidad)
        {
            if (tiempo == null)
            {
                return null;
            }

            var unidadTexto = (unidad ?? string.Empty).Trim();
            return string.IsNullOrWhiteSpace(unidadTexto)
                ? tiempo.Value.ToString()
                : $"{tiempo.Value} {unidadTexto}";
        }

        // Construye los parámetros de filtrado para consultar inducciones del descriptor.
        private static List<CParameter> BuildParameters(SC_DESCRIPTOR_PUESTO_INDUCCIONParam xWhere, bool includeCorr = false)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.CORR_DESCRIPTOR_PUESTO > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = xWhere.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 });
            }

            if (includeCorr && xWhere.CORR_INDUCCION > 0)
            {
                p.Add(new CParameter()
                {
                    ParameterName = "CORR_INDUCCION",
                    Value = xWhere.CORR_INDUCCION,
                    DbType = System.Data.DbType.Int32,
                });
            }

            return p;
        }

        // Valida las claves y reglas de negocio requeridas para inducción del descriptor.
        private static CResult Validate(SC_DESCRIPTOR_PUESTO_INDUCCIONTable Data, bool esNuevo)
        {
            if (Data.CORR_EMPRESA <= 0)
            {
                return ValidationError("La empresa de sesion no es valida.");
            }

            if (Data.CORR_DESCRIPTOR_PUESTO <= 0)
            {
                return ValidationError("Debe guardar el descriptor antes de registrar inducciones.");
            }

            if (Data.CORR_INDUCCION <= 0)
            {
                return ValidationError(esNuevo
                    ? "Debe seleccionar una induccion."
                    : "Debe indicar la induccion del descriptor a actualizar.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_INDUCCION))
            {
                return ValidationError("Debe indicar el nombre de la induccion.");
            }

            if (Data.NOMBRE_INDUCCION.Trim().Length > 100)
            {
                return ValidationError("El nombre de la induccion no puede superar 100 caracteres.");
            }

            Data.NOMBRE_INDUCCION = Data.NOMBRE_INDUCCION.Trim();

            if (!string.IsNullOrWhiteSpace(Data.TIEMPO_INDUCCION))
            {
                Data.TIEMPO_INDUCCION = Data.TIEMPO_INDUCCION.Trim();
                if (Data.TIEMPO_INDUCCION.Length > 25)
                {
                    return ValidationError("La duracion de la induccion no puede superar 25 caracteres.");
                }
            }
            else
            {
                Data.TIEMPO_INDUCCION = null;
            }

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
                ErrorCode = 4101,
                ErrorMessage = message,
                ErrorSource = "",
            };
        }
    }
}
