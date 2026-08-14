// Qué hace: valida y coordina la asignación de unidades a usuarios.
// Cómo: valida empresa, unidad activa, usuario y duplicados antes de delegar al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_UNIDADES_USUARIOService : ISC_UNIDADES_USUARIOService
    {
        private readonly ISC_UNIDADES_USUARIORepository _repo;
        private readonly ISC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESRepository _unidadesRepo;
        private readonly ISEG_USUARIORepository _usuariosRepo;

        public SC_UNIDADES_USUARIOService(
            ISC_UNIDADES_USUARIORepository repo,
            ISC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESRepository unidadesRepo,
            ISEG_USUARIORepository usuariosRepo)
        {
            _repo = repo;
            _unidadesRepo = unidadesRepo;
            _usuariosRepo = usuariosRepo;
        }

        // Qué hace: lista asignaciones, opcionalmente por unidad o usuario.
        // Cómo: construye parámetros y consulta el repositorio.
        public async Task<CResult> GetAllAsync(SC_UNIDADES_USUARIOParam xWhere) =>
            await _repo.GetAllAsync(BuildParameters(xWhere));

        // Qué hace: obtiene las unidades del usuario de sesión vía procedimiento.
        // Cómo: pasa CORR_EMPRESA y LOGIN_SISTEMA a PRAL_DATA_SC_UNIDADES_USUARIO.
        public async Task<CResult> GetUnidadesUsuarioAsync(SC_UNIDADES_USUARIOParam xWhere) =>
            await _repo.GetUnidadesUsuarioAsync(BuildParametersSpUnidades(xWhere));

        // Qué hace: obtiene una asignación concreta.
        // Cómo: incluye las llaves recibidas y consulta el repositorio.
        public async Task<CResult> GetAsync(SC_UNIDADES_USUARIOParam xWhere) =>
            await _repo.GetAsync(BuildParameters(xWhere, true));

        // Qué hace: crea una asignación de unidad a usuario.
        // Cómo: valida empresa, unidad activa, usuario existente y duplicado antes de insertar.
        public async Task<CResult> CreateAsync(SC_UNIDADES_USUARIOTable Data, string vUSER_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data, true);
            if (validation != null)
            {
                return validation;
            }
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }
            Data.LOGIN_SISTEMA = Data.LOGIN_SISTEMA.Trim();
            var unidadError = await PrepareFromUnidadAsync(Data);
            if (unidadError != null)
            {
                return unidadError;
            }
            var usuarioError = await PrepareFromUsuarioAsync(Data);
            if (usuarioError != null)
            {
                return usuarioError;
            }
            if (await _repo.ExistsAsync(Data.CORR_EMPRESA, Data.CORR_UNIDAD, Data.LOGIN_SISTEMA))
            {
                return DuplicateWarning("Esa unidad ya esta asignada al usuario.");
            }
            return await _repo.CreateAsync(Data, vUSER_SISTEMA, vESTACION);
        }

        // Qué hace: elimina una asignación unidad-usuario.
        // Cómo: valida la PK compuesta y llama al repositorio.
        public async Task<CResult> DeleteAsync(SC_UNIDADES_USUARIOTable Data, string vUSER_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data, true);
            if (validation != null)
            {
                return validation;
            }
            return await _repo.DeleteAsync(Data, vUSER_SISTEMA, vESTACION);
        }

        // Qué hace: asigna todas las unidades activas al usuario.
        // Cómo: valida empresa y usuario; el repositorio inserta únicamente las faltantes.
        public async Task<CResult> AsignarTodasUnidadesAsync(SC_UNIDADES_USUARIOTable Data, string vUSER_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data, false);
            if (validation != null)
            {
                return validation;
            }
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }
            Data.LOGIN_SISTEMA = Data.LOGIN_SISTEMA.Trim();
            var usuarioError = await PrepareFromUsuarioAsync(Data);
            if (usuarioError != null)
            {
                return usuarioError;
            }
            return await _repo.AsignarTodasUnidadesAsync(Data, vUSER_SISTEMA, vESTACION);
        }

        // Qué hace: quita todas las unidades asignadas al usuario.
        // Cómo: valida empresa y usuario antes de ejecutar el borrado masivo.
        public async Task<CResult> QuitarTodasUnidadesAsync(SC_UNIDADES_USUARIOTable Data, string vUSER_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data, false);
            if (validation != null)
            {
                return validation;
            }
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }
            Data.LOGIN_SISTEMA = Data.LOGIN_SISTEMA.Trim();
            var usuarioError = await PrepareFromUsuarioAsync(Data);
            if (usuarioError != null)
            {
                return usuarioError;
            }
            return await _repo.QuitarTodasUnidadesAsync(Data, vUSER_SISTEMA, vESTACION);
        }

        // Qué hace: comprueba que la unidad exista y esté activa.
        // Cómo: consulta el repositorio del organigrama por empresa y unidad.
        private async Task<CResult> PrepareFromUnidadAsync(SC_UNIDADES_USUARIOTable Data)
        {
            var result = await _unidadesRepo.GetAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_UNIDAD", Value = Data.CORR_UNIDAD, DbType = System.Data.DbType.Int32 },
            });
            if (!result.Result || result.Data is not SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESView unidad)
            {
                return ValidationError("No se encontro la unidad en el organigrama.");
            }
            return unidad.ACTIVO ? null : ValidationError("La unidad seleccionada esta inactiva.");
        }

        // Qué hace: comprueba que LOGIN_SISTEMA corresponda a un usuario.
        // Cómo: usa GetAsync de ISEG_USUARIORepository y valida que retorne SEG_USUARIOView.
        private async Task<CResult> PrepareFromUsuarioAsync(SC_UNIDADES_USUARIOTable Data)
        {
            var result = await _usuariosRepo.GetAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "LOGIN_SISTEMA", Value = Data.LOGIN_SISTEMA, DbType = System.Data.DbType.String },
            });
            return result.Result && result.Data is SEG_USUARIOView
                ? null
                : ValidationError("No se encontro el usuario.");
        }

        // Qué hace: arma los parámetros del procedimiento de unidades del usuario.
        // Cómo: envía solo CORR_EMPRESA y LOGIN_SISTEMA, que son los argumentos del SP.
        private static List<CParameter> BuildParametersSpUnidades(SC_UNIDADES_USUARIOParam xWhere) => new()
        {
            new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            new CParameter() { ParameterName = "LOGIN_SISTEMA", Value = xWhere.LOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
        };

        // Qué hace: arma filtros de consulta.
        // Cómo: siempre incluye empresa; agrega unidad y LOGIN_SISTEMA cuando corresponden.
        private static List<CParameter> BuildParameters(SC_UNIDADES_USUARIOParam xWhere, bool includeKeys = false)
        {
            var parameters = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
            if (xWhere.CORR_UNIDAD > 0)
            {
                parameters.Add(new CParameter() { ParameterName = "CORR_UNIDAD", Value = xWhere.CORR_UNIDAD, DbType = System.Data.DbType.Int32 });
            }
            if (includeKeys || !string.IsNullOrWhiteSpace(xWhere.LOGIN_SISTEMA))
            {
                parameters.Add(new CParameter() { ParameterName = "LOGIN_SISTEMA", Value = xWhere.LOGIN_SISTEMA, DbType = System.Data.DbType.String });
            }
            return parameters;
        }

        // Qué hace: valida los datos mínimos de una operación.
        // Cómo: exige usuario y, para operaciones individuales, una unidad válida.
        private static CResult Validate(SC_UNIDADES_USUARIOTable Data, bool includeUnidad)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de la asignacion.");
            }
            if (string.IsNullOrWhiteSpace(Data.LOGIN_SISTEMA))
            {
                return ValidationError("Debe indicar el usuario.");
            }
            if (includeUnidad && Data.CORR_UNIDAD <= 0)
            {
                return ValidationError("Debe seleccionar una unidad.");
            }
            return null;
        }

        // Qué hace: valida que exista empresa en la sesión.
        // Cómo: devuelve error 4100 cuando CORR_EMPRESA no es válido.
        private static CResult ValidateEmpresaSesion(int corrEmpresa) =>
            corrEmpresa > 0 ? null : Error(4100,
                "No se pudo guardar la asignacion porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.");

        // Qué hace: devuelve una advertencia por asignación duplicada.
        // Cómo: usa el código SQL Server 2627 con mensaje de negocio.
        private static CResult DuplicateWarning(string message) => Error(2627, message);

        // Qué hace: devuelve un error de validación.
        // Cómo: usa código -1 y el origen del servicio.
        private static CResult ValidationError(string message) => Error(-1, message);

        // Qué hace: construye resultados fallidos uniformes.
        // Cómo: asigna código, mensaje, origen y cero filas afectadas.
        private static CResult Error(int code, string message) => new()
        {
            Data = null,
            Result = false,
            CodeHelper = 0,
            ErrorCode = code,
            ErrorMessage = message,
            ErrorSource = "[SC_UNIDADES_USUARIOService]",
            RowsAffected = 0
        };
    }
}
