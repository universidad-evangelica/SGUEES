using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PROSPECTO_ESTUDIOService : IACA_PROSPECTO_ESTUDIOService
    {
        private readonly IACA_PROSPECTO_ESTUDIORepository _repo;

        public ACA_PROSPECTO_ESTUDIOService(IACA_PROSPECTO_ESTUDIORepository repo)
        {
            _repo = repo;
        }

        // Qué hace: estudios previos del prospecto (pestaña Información académica).
        // Cómo lo hace: exige CORR_PROSPECTO porque eFramework omite del WHERE los enteros en 0
        //               y, sin él, devolvería los datos de todos los prospectos.
        public async Task<CResult> GetAllAsync(ACA_PROSPECTO_ESTUDIOParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe indicar el prospecto" };

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAllAsync(p);
        }

        // Qué hace: un registro por su llave (CORR_PROSPECTO_ESTUDIO); sin llave, el primero del prospecto.
        // Cómo lo hace: exige CORR_PROSPECTO por la misma razón que GetAllAsync;
        //               la llave es opcional porque eFramework omite los enteros en 0.
        public async Task<CResult> GetAsync(ACA_PROSPECTO_ESTUDIOParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe indicar el prospecto" };

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO_ESTUDIO",Value=xWhere.CORR_PROSPECTO_ESTUDIO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: valida y crea un estudio del prospecto.
        // Cómo lo hace: mismas reglas que la modificación más la persona obligatoria; el repositorio
        //               rechaza un segundo estudio de la misma sección (índice único de la tabla).
        public async Task<CResult> CreateAsync(ACA_PROSPECTO_ESTUDIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_PERSONA <= 0)
                return ErrorValidacion("Debe indicar la persona del prospecto.");

            var validacion = Validar(Data);
            if (validacion != null) return validacion;

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(ACA_PROSPECTO_ESTUDIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_ESTUDIO <= 0)
                return ErrorValidacion("Debe indicar el estudio a modificar.");

            var validacion = Validar(Data);
            if (validacion != null) return validacion;

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_PROSPECTO_ESTUDIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_ESTUDIO <= 0)
                return ErrorValidacion("Debe indicar el estudio a eliminar.");

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: reglas de alta y modificación, iguales a las que aplica el portal de admisiones.
        // Cómo lo hace: la sección se deduce de NIVEL_ESTUDIO + GRADUADO_UEES y de ahí salen los campos
        //               con sentido; los del resto de secciones se limpian para que no queden datos
        //               cruzados (el formulario de cada bloque tampoco los muestra).
        private static CResult Validar(ACA_PROSPECTO_ESTUDIOTable Data)
        {
            Data.NIVEL_ESTUDIO = (Limpiar(Data.NIVEL_ESTUDIO) ?? "").ToUpperInvariant();
            if (Data.NIVEL_ESTUDIO != NivelMedio && Data.NIVEL_ESTUDIO != NivelSuperior)
                return ErrorValidacion("El nivel de estudio debe ser MEDIO o SUPERIOR.");

            Data.NOMBRE_INSTITUCION = Limpiar(Data.NOMBRE_INSTITUCION);
            Data.TITULO_OBTENIDO = Limpiar(Data.TITULO_OBTENIDO);
            Data.CARRERA_TEXTO = Limpiar(Data.CARRERA_TEXTO);
            Data.NIVEL_CURSADO = Limpiar(Data.NIVEL_CURSADO);
            Data.TIPO_EDUCACION = Limpiar(Data.TIPO_EDUCACION);
            Data.QUIEN_PAGO_CUOTA = Limpiar(Data.QUIEN_PAGO_CUOTA);
            Data.BACHILLER_OPCION = Limpiar(Data.BACHILLER_OPCION);

            if (Data.NIVEL_ESTUDIO == NivelMedio)
            {
                Data.GRADUADO_UEES = false;
                Data.GRADUADO = true;
                Data.CORR_CARRERA = null;
                Data.CARRERA_TEXTO = null;
                Data.NIVEL_CURSADO = null;
                Data.FECHA_GRADUACION = null;
            }
            else if (Data.GRADUADO_UEES)
            {
                // Graduado UEES: la institución es fija y el grado lo deriva el repositorio de la carrera.
                Data.NOMBRE_INSTITUCION = "UEES";
                Data.GRADUADO = true;
                Data.TIPO_EDUCACION = null;
                Data.CARRERA_TEXTO = null;
                Data.NIVEL_CURSADO = null;
                Data.ANIO_TITULACION = null;
                Data.CORR_PAIS = null;
                Data.CORR_DEPTO = null;
                Data.CORR_MUNICIPIO = null;

                if (!(Data.CORR_CARRERA > 0))
                    return ErrorValidacion("Seleccione la carrera con la que se graduó en la UEES.");
                if (Data.FECHA_GRADUACION == null)
                    return ErrorValidacion("Indique la fecha de graduación.");
            }
            else
            {
                // Universidad de procedencia: el portal solo guarda texto libre, sin carrera del catálogo.
                // La institución puede ir vacía: con nuevo ingreso y sin ser graduado universitario, el
                // portal deshabilita esos campos y guarda la fila en blanco (la columna es NOT NULL).
                Data.NOMBRE_INSTITUCION ??= string.Empty;
                Data.CORR_CARRERA = null;
                Data.CORR_GRADO_ACADEMICO = null;
                Data.TIPO_EDUCACION = null;
                Data.ANIO_TITULACION = null;
                Data.FECHA_GRADUACION = null;
                Data.CORR_PAIS = null;
                Data.CORR_DEPTO = null;
                Data.CORR_MUNICIPIO = null;
            }

            if (Data.NOMBRE_INSTITUCION == null)
                return ErrorValidacion("Ingrese el nombre de la institución.");

            var largo = ExcedeLargo(Data.NOMBRE_INSTITUCION, 100, "El nombre de la institución")
                ?? ExcedeLargo(Data.TITULO_OBTENIDO, 200, "El título obtenido")
                ?? ExcedeLargo(Data.CARRERA_TEXTO, 100, "La carrera")
                ?? ExcedeLargo(Data.NIVEL_CURSADO, 10, "El nivel cursado")
                ?? ExcedeLargo(Data.TIPO_EDUCACION, 20, "El tipo de educación")
                ?? ExcedeLargo(Data.QUIEN_PAGO_CUOTA, 200, "Quién pagó la cuota")
                ?? ExcedeLargo(Data.BACHILLER_OPCION, 100, "La opción de bachillerato");
            if (largo != null) return largo;

            if (Data.CUOTA < 0)
                return ErrorValidacion("La cuota no puede ser negativa.");
            if (Data.ANIO_TITULACION != null && (Data.ANIO_TITULACION < 1900 || Data.ANIO_TITULACION > DateTime.Now.Year))
                return ErrorValidacion($"El año de titulación debe estar entre 1900 y {DateTime.Now.Year}.");
            if (Data.CORR_DEPTO > 0 && !(Data.CORR_PAIS > 0))
                return ErrorValidacion("Debe seleccionar el país antes del departamento.");
            if (Data.CORR_MUNICIPIO > 0 && !(Data.CORR_DEPTO > 0))
                return ErrorValidacion("Debe seleccionar el departamento antes del municipio.");

            return null;
        }

        private const string NivelMedio = "MEDIO";
        private const string NivelSuperior = "SUPERIOR";

        private static string Limpiar(string valor) => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();

        private static CResult ExcedeLargo(string valor, int maximo, string campo)
        {
            return valor != null && valor.Length > maximo ? ErrorValidacion($"{campo} no puede superar {maximo} caracteres.") : null;
        }

        private static CResult ErrorValidacion(string mensaje)
        {
            return new CResult() { Data = null, Result = false, CodeHelper = 0, ErrorCode = -1, ErrorMessage = mensaje, ErrorSource = "[ACA_PROSPECTO_ESTUDIOService]", RowsAffected = 0 };
        }
    }
}
