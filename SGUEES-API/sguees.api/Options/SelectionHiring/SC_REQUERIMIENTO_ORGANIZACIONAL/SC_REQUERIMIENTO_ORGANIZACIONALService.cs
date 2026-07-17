// Lógica de negocio del catálogo requerimiento organizacional (validación y delegación al repositorio).
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    // Valida datos y delega persistencia de requerimiento organizacional en el repositorio.
    public class SC_REQUERIMIENTO_ORGANIZACIONALService : ISC_REQUERIMIENTO_ORGANIZACIONALService
    {
        private readonly ISC_REQUERIMIENTO_ORGANIZACIONALRepository _repo;

        public SC_REQUERIMIENTO_ORGANIZACIONALService(ISC_REQUERIMIENTO_ORGANIZACIONALRepository repo)
        {
            _repo = repo;
        }

        // Delega en el repositorio la consulta del listado.
        public async Task<CResult> GetAllAsync(SC_REQUERIMIENTO_ORGANIZACIONALParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Delega en el repositorio la consulta por llave.
        public async Task<CResult> GetAsync(SC_REQUERIMIENTO_ORGANIZACIONALParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_REQUERIMIENTO_ORGANIZACIONAL", Value = xWhere.CORR_REQUERIMIENTO_ORGANIZACIONAL, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        // Valida empresa, descripción y unicidad antes de crear.
        public async Task<CResult> CreateAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            var duplicate = await ValidateUniqueDescripcionAsync(Data, null);
            if (duplicate != null)
            {
                return duplicate;
            }

            NormalizeData(Data);
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida la llave y excluye el registro actual al comprobar duplicados.
        public async Task<CResult> UpdateAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            if (Data.CORR_REQUERIMIENTO_ORGANIZACIONAL <= 0)
            {
                return ValidationError("No se pudo identificar el requerimiento organizacional a actualizar.");
            }

            var duplicate = await ValidateUniqueDescripcionAsync(Data, Data.CORR_REQUERIMIENTO_ORGANIZACIONAL);
            if (duplicate != null)
            {
                return duplicate;
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida empresa de sesión antes de eliminar.
        public async Task<CResult> DeleteAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida empresa y llave antes de cambiar el estado.
        public async Task<CResult> ActivarInactivarAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_REQUERIMIENTO_ORGANIZACIONAL <= 0)
            {
                return ValidationError("No se pudo identificar el requerimiento organizacional a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Devuelve los requerimientos activos disponibles para el descriptor.
        public async Task<CResult> GetCatalogoDescriptorAsync(SC_REQUERIMIENTO_ORGANIZACIONALParam xWhere)
        {
            var rows = await _repo.GetCatalogoDescriptorAsync(xWhere.CORR_EMPRESA);
            return new CResult
            {
                Data = rows,
                Result = true,
                CodeHelper = 0,
                ErrorCode = 0,
                ErrorMessage = "",
                ErrorSource = "",
                RowsAffected = rows.Count,
            };
        }

        // Arma los parámetros de filtro para el repositorio.
        private static List<CParameter> BuildParameters(SC_REQUERIMIENTO_ORGANIZACIONALParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        // Limpia la descripción y aplica el estado activo predeterminado.
        private static void NormalizeData(SC_REQUERIMIENTO_ORGANIZACIONALTable Data)
        {
            Data.DESCRIPCION = Data.DESCRIPCION?.Trim();
            Data.ESTADO_REQUERIMIENTO_ORGANIZACIONAL ??= true;
        }

        // Comprueba la descripción obligatoria y su longitud máxima.
        private static CResult Validate(SC_REQUERIMIENTO_ORGANIZACIONALTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de requerimiento organizacional.");
            }

            if (string.IsNullOrWhiteSpace(Data.DESCRIPCION))
            {
                return ValidationError("Debe ingresar la descripcion de requerimiento organizacional.");
            }

            if (Data.DESCRIPCION.Trim().Length > 200)
            {
                return ValidationError("La descripcion de requerimiento organizacional no puede superar 200 caracteres.");
            }

            return null;
        }

        // Verifica que la descripción no pertenezca a otro registro de la empresa.
        private async Task<CResult> ValidateUniqueDescripcionAsync(SC_REQUERIMIENTO_ORGANIZACIONALTable Data, int? excludeCorr)
        {
            var exists = await _repo.ExistsDescripcionAsync(
                Data.CORR_EMPRESA,
                Data.DESCRIPCION,
                excludeCorr ?? 0);

            return exists
                ? ValidationError($"Ya existe un requerimiento organizacional con la descripcion {Data.DESCRIPCION}.")
                : null;
        }

        // Rechaza operaciones cuando no hay empresa en sesión.
        private static CResult ValidateEmpresaSesion(int corrEmpresa)
        {
            if (corrEmpresa > 0)
            {
                return null;
            }

            return new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = 4100,
                ErrorMessage = "No se pudo guardar el requerimiento organizacional porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[SC_REQUERIMIENTO_ORGANIZACIONALService]",
                RowsAffected = 0
            };
        }

        // Construye un CResult de validación funcional.
        private static CResult ValidationError(string message)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = -1,
                ErrorMessage = message,
                ErrorSource = "[SC_REQUERIMIENTO_ORGANIZACIONALService]",
                RowsAffected = 0
            };
        }
    }
}
