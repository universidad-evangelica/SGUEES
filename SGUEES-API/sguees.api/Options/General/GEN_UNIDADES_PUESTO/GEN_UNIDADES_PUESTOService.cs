// Qué hace: valida y coordina la asignación de puestos a unidades del organigrama.
// Cómo: arma filtros, valida empresa/unidad/puesto, detecta duplicados y delega en IGEN_UNIDADES_PUESTORepository.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    // Qué hace: servicio de puestos por unidad.
    // Cómo: valida negocio y llama al repositorio para consultar, crear y eliminar.
    public class GEN_UNIDADES_PUESTOService : IGEN_UNIDADES_PUESTOService
    {
        private readonly IGEN_UNIDADES_PUESTORepository _repo;
        private readonly ISC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESRepository _unidadesRepo;
        private readonly IPLA_PUESTORepository _puestosRepo;

        public GEN_UNIDADES_PUESTOService(
            IGEN_UNIDADES_PUESTORepository repo,
            ISC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESRepository unidadesRepo,
            IPLA_PUESTORepository puestosRepo)
        {
            _repo = repo;
            _unidadesRepo = unidadesRepo;
            _puestosRepo = puestosRepo;
        }

        // Qué hace: lista las asignaciones unidad-puesto de la empresa.
        // Cómo: construye parámetros con BuildParameters y llama a GetAllAsync del repositorio.
        public async Task<CResult> GetAllAsync(GEN_UNIDADES_PUESTOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Qué hace: obtiene una asignación unidad-puesto concreta.
        // Cómo: construye parámetros incluyendo llaves y llama a GetAsync del repositorio.
        public async Task<CResult> GetAsync(GEN_UNIDADES_PUESTOParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeKeys: true));
        }

        // Qué hace: crea una asignación de puesto a una unidad.
        // Cómo: valida empresa, unidad activa, puesto activo, datos y duplicados; luego Insert.
        public async Task<CResult> CreateAsync(GEN_UNIDADES_PUESTOTable Data, string vUSER_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            var prepareUnidad = await PrepareFromUnidadAsync(Data);
            if (prepareUnidad != null)
            {
                return prepareUnidad;
            }

            var preparePuesto = await PrepareFromPuestoAsync(Data);
            if (preparePuesto != null)
            {
                return preparePuesto;
            }

            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            if (await _repo.ExistsAsync(Data.CORR_EMPRESA, Data.CORR_UNIDAD, Data.CORR_PUESTO))
            {
                return DuplicateWarning("Ese puesto ya esta asignado a la unidad. Escriba otro puesto para continuar.");
            }

            return await _repo.CreateAsync(Data, vUSER_SISTEMA, vESTACION);
        }

        // Qué hace: elimina una asignación unidad-puesto.
        // Cómo: valida las tres llaves de la PK y llama a DeleteAsync del repositorio.
        public async Task<CResult> DeleteAsync(GEN_UNIDADES_PUESTOTable Data, string vUSER_SISTEMA, string vESTACION)
        {
            if (Data.CORR_EMPRESA <= 0 || Data.CORR_UNIDAD <= 0 || Data.CORR_PUESTO <= 0)
            {
                return ValidationError("Debe indicar el puesto de la unidad a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vUSER_SISTEMA, vESTACION);
        }

        // Qué hace: asigna a la unidad todos los puestos activos que aún no tenga.
        // Cómo: valida empresa y que la unidad exista/esté activa; delega el INSERT...SELECT en el repositorio.
        public async Task<CResult> AsignarTodosPuestosAsync(GEN_UNIDADES_PUESTOTable Data, string vUSER_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_UNIDAD <= 0)
            {
                return ValidationError("Debe indicar la unidad.");
            }

            var prepareUnidad = await PrepareFromUnidadAsync(Data);
            if (prepareUnidad != null)
            {
                return prepareUnidad;
            }

            return await _repo.AsignarTodosPuestosAsync(Data, vUSER_SISTEMA, vESTACION);
        }

        // Qué hace: quita de una vez todos los puestos asignados a la unidad.
        // Cómo: valida empresa y unidad; delega el DELETE masivo en el repositorio.
        public async Task<CResult> QuitarTodosPuestosAsync(GEN_UNIDADES_PUESTOTable Data, string vUSER_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_UNIDAD <= 0)
            {
                return ValidationError("Debe indicar la unidad.");
            }

            var prepareUnidad = await PrepareFromUnidadAsync(Data);
            if (prepareUnidad != null)
            {
                return prepareUnidad;
            }

            return await _repo.QuitarTodosPuestosAsync(Data, vUSER_SISTEMA, vESTACION);
        }

        // Qué hace: comprueba que la unidad exista en organigrama y esté activa.
        // Cómo: consulta SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES por empresa y CORR_UNIDAD.
        private async Task<CResult> PrepareFromUnidadAsync(GEN_UNIDADES_PUESTOTable Data)
        {
            if (Data == null || Data.CORR_UNIDAD <= 0)
            {
                return ValidationError("Debe indicar la unidad.");
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

        // Qué hace: comprueba que el puesto exista y esté activo.
        // Cómo: consulta PLA_PUESTO por empresa y CORR_PUESTO.
        private async Task<CResult> PrepareFromPuestoAsync(GEN_UNIDADES_PUESTOTable Data)
        {
            if (Data == null || Data.CORR_PUESTO <= 0)
            {
                return ValidationError("Debe seleccionar un puesto.");
            }

            var catalogResult = await _puestosRepo.GetAsync(new List<eFramework.Core.CParameter>
            {
                new eFramework.Core.CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new eFramework.Core.CParameter() { ParameterName = "CORR_PUESTO", Value = Data.CORR_PUESTO, DbType = System.Data.DbType.Int32 },
            });

            if (!catalogResult.Result || catalogResult.Data is not PLA_PUESTOView catalog)
            {
                return ValidationError("No se encontro el puesto.");
            }

            if (catalog.ESTADO_PUESTO == false)
            {
                return ValidationError("El puesto seleccionado esta inactivo.");
            }

            return null;
        }

        // Qué hace: arma los parámetros de filtro para el repositorio.
        // Cómo: siempre incluye CORR_EMPRESA; agrega CORR_UNIDAD y CORR_PUESTO cuando aplican.
        private static List<eFramework.Core.CParameter> BuildParameters(GEN_UNIDADES_PUESTOParam xWhere, bool includeKeys = false)
        {
            var p = new List<eFramework.Core.CParameter>
            {
                new eFramework.Core.CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.CORR_UNIDAD > 0)
            {
                p.Add(new eFramework.Core.CParameter() { ParameterName = "CORR_UNIDAD", Value = xWhere.CORR_UNIDAD, DbType = System.Data.DbType.Int32 });
            }

            if (includeKeys || xWhere.CORR_PUESTO > 0)
            {
                p.Add(new eFramework.Core.CParameter() { ParameterName = "CORR_PUESTO", Value = xWhere.CORR_PUESTO, DbType = System.Data.DbType.Int32 });
            }

            return p;
        }

        // Qué hace: valida datos mínimos de la asignación.
        // Cómo: exige CORR_UNIDAD y CORR_PUESTO mayores a cero.
        private static CResult Validate(GEN_UNIDADES_PUESTOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de la asignacion.");
            }

            if (Data.CORR_UNIDAD <= 0)
            {
                return ValidationError("Debe indicar la unidad.");
            }

            if (Data.CORR_PUESTO <= 0)
            {
                return ValidationError("Debe seleccionar un puesto.");
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
                ErrorSource = "[GEN_UNIDADES_PUESTOService]",
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
                ErrorSource = "[GEN_UNIDADES_PUESTOService]",
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
                ErrorSource = "[GEN_UNIDADES_PUESTOService]",
                RowsAffected = 0
            };
        }
    }
}
