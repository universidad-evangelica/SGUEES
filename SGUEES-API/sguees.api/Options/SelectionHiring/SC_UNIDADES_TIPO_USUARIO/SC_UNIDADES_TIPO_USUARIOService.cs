// Qué hace: valida y coordina la asignación de unidades por tipo de usuario (rol).
// Cómo: arma filtros, valida empresa/unidad/rol, detecta duplicados y delega en ISC_UNIDADES_TIPO_USUARIORepository.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    // Qué hace: servicio de unidades por tipo de usuario.
    // Cómo: valida negocio y llama al repositorio para consultar, crear, eliminar y activar/inactivar.
    public class SC_UNIDADES_TIPO_USUARIOService : ISC_UNIDADES_TIPO_USUARIOService
    {
        private readonly ISC_UNIDADES_TIPO_USUARIORepository _repo;
        private readonly ISC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESRepository _unidadesRepo;

        public SC_UNIDADES_TIPO_USUARIOService(
            ISC_UNIDADES_TIPO_USUARIORepository repo,
            ISC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESRepository unidadesRepo)
        {
            _repo = repo;
            _unidadesRepo = unidadesRepo;
        }

        // Qué hace: lista las asignaciones unidad-rol de la empresa.
        // Cómo: construye parámetros con BuildParameters y llama a GetAllAsync del repositorio.
        public async Task<CResult> GetAllAsync(SC_UNIDADES_TIPO_USUARIOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Qué hace: obtiene una asignación unidad-rol concreta.
        // Cómo: construye parámetros incluyendo llaves y llama a GetAsync del repositorio.
        public async Task<CResult> GetAsync(SC_UNIDADES_TIPO_USUARIOParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeKeys: true));
        }

        // Qué hace: crea una asignación de unidad a un tipo de usuario.
        // Cómo: valida empresa, existencia/actividad de la unidad en organigrama, datos y duplicados; luego Insert.
        public async Task<CResult> CreateAsync(SC_UNIDADES_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            var prepare = await PrepareFromUnidadAsync(Data);
            if (prepare != null)
            {
                return prepare;
            }

            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            if (await _repo.ExistsAsync(Data.CORR_EMPRESA, Data.CORR_UNIDAD, Data.TIPO_USUARIO))
            {
                return DuplicateWarning("Esa unidad ya esta asignada al rol. Escriba otra unidad para continuar.");
            }

            Data.ACTIVO ??= true;
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: elimina una asignación unidad-rol.
        // Cómo: valida las tres llaves de la PK y llama a DeleteAsync del repositorio.
        public async Task<CResult> DeleteAsync(SC_UNIDADES_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data.CORR_EMPRESA <= 0 || Data.CORR_UNIDAD <= 0 || Data.TIPO_USUARIO <= 0)
            {
                return ValidationError("Debe indicar la unidad del rol a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: activa o inactiva la asignación de unidad al rol en la tabla intermedia.
        // Cómo: valida empresa y llaves; llama a ActivarInactivarAsync del repositorio.
        public async Task<CResult> ActivarInactivarAsync(SC_UNIDADES_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_UNIDAD <= 0 || Data.TIPO_USUARIO <= 0)
            {
                return ValidationError("Debe indicar la unidad del rol a activar o inactivar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: asigna al rol todas las unidades activas que aún no tenga.
        // Cómo: valida empresa y TIPO_USUARIO; delega el INSERT...SELECT en el repositorio.
        public async Task<CResult> AsignarTodasUnidadesAsync(SC_UNIDADES_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.TIPO_USUARIO <= 0)
            {
                return ValidationError("Debe indicar el rol (tipo de usuario).");
            }

            return await _repo.AsignarTodasUnidadesAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: comprueba que la unidad exista en organigrama y esté activa.
        // Cómo: consulta SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES por empresa y CORR_UNIDAD.
        private async Task<CResult> PrepareFromUnidadAsync(SC_UNIDADES_TIPO_USUARIOTable Data)
        {
            if (Data == null || Data.CORR_UNIDAD <= 0)
            {
                return ValidationError("Debe seleccionar una unidad.");
            }

            var catalogResult = await _unidadesRepo.GetAsync(new List<eFramework.Core.CParameter>
            {
                new eFramework.Core.CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new eFramework.Core.CParameter() { ParameterName = "CORR_UNIDAD", Value = Data.CORR_UNIDAD, DbType = System.Data.DbType.Int32 },
            });

            if (!catalogResult.Result || catalogResult.Data is not SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESView catalog)
            {
                return ValidationError("No se encontro la unidad en el organigrama.");
            }

            if (!catalog.ACTIVO)
            {
                return ValidationError("La unidad seleccionada esta inactiva.");
            }

            return null;
        }

        // Qué hace: arma los parámetros de filtro para el repositorio.
        // Cómo: siempre incluye CORR_EMPRESA; agrega TIPO_USUARIO y CORR_UNIDAD cuando aplican.
        private static List<eFramework.Core.CParameter> BuildParameters(SC_UNIDADES_TIPO_USUARIOParam xWhere, bool includeKeys = false)
        {
            var p = new List<eFramework.Core.CParameter>
            {
                new eFramework.Core.CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.TIPO_USUARIO > 0)
            {
                p.Add(new eFramework.Core.CParameter() { ParameterName = "TIPO_USUARIO", Value = xWhere.TIPO_USUARIO, DbType = System.Data.DbType.Int32 });
            }

            if (includeKeys || xWhere.CORR_UNIDAD > 0)
            {
                p.Add(new eFramework.Core.CParameter() { ParameterName = "CORR_UNIDAD", Value = xWhere.CORR_UNIDAD, DbType = System.Data.DbType.Int32 });
            }

            return p;
        }

        // Qué hace: valida datos mínimos de la asignación.
        // Cómo: exige TIPO_USUARIO y CORR_UNIDAD mayores a cero.
        private static CResult Validate(SC_UNIDADES_TIPO_USUARIOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de la asignacion.");
            }

            if (Data.TIPO_USUARIO <= 0)
            {
                return ValidationError("Debe indicar el rol (tipo de usuario).");
            }

            if (Data.CORR_UNIDAD <= 0)
            {
                return ValidationError("Debe seleccionar una unidad.");
            }

            return null;
        }

        // Qué hace: valida que la sesión tenga empresa.
        // Cómo: si CORR_EMPRESA es inválido, devuelve error 4100.
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
                ErrorMessage = "No se pudo guardar la asignacion porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[SC_UNIDADES_TIPO_USUARIOService]",
                RowsAffected = 0
            };
        }

        // Qué hace: arma un resultado de advertencia por llave duplicada.
        // Cómo: fija ErrorCode 2627 y el mensaje de negocio recibido.
        private static CResult DuplicateWarning(string message)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = 2627,
                ErrorMessage = message,
                ErrorSource = "[SC_UNIDADES_TIPO_USUARIOService]",
                RowsAffected = 0
            };
        }

        // Qué hace: arma un resultado de validación fallida.
        // Cómo: fija ErrorCode -1 y el mensaje recibido.
        private static CResult ValidationError(string message)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = -1,
                ErrorMessage = message,
                ErrorSource = "[SC_UNIDADES_TIPO_USUARIOService]",
                RowsAffected = 0
            };
        }
    }
}
