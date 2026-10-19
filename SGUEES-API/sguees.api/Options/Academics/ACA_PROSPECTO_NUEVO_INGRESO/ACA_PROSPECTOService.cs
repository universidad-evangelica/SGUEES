using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PROSPECTOService : IACA_PROSPECTOService
    {
        private readonly IACA_PROSPECTORepository _repo;

        public ACA_PROSPECTOService(IACA_PROSPECTORepository repo)
        {
            _repo = repo;
        }

        // Qué hace: listado de solicitudes de nuevo ingreso ya enviadas y todavía Ingresadas.
        // Cómo lo hace: filtra por empresa. El repositorio exige instancia activa del flujo 104 en estado 38.
        public async Task<CResult> GetAllAsync(ACA_PROSPECTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAllAsync(p);
        }

        // Qué hace: solicitudes registradas que todavía no entraron al flujo 104.
        public async Task<CResult> GetBorradoresAsync(ACA_PROSPECTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetBorradoresAsync(p);
        }

        // Qué hace: crea una solicitud de nuevo ingreso en borrador, sin mandarla al flujo.
        // Cómo lo hace: valida los datos del registro de admisión y deja ESTADO = 'P'. Enviar es otro botón.
        public async Task<CResult> RegistrarAsync(ACA_PROSPECTOParam data)
        {
            if (data == null)
                return ErrorValidacion("Debe indicar los datos de la solicitud.");

            data.NOMBRES = data.NOMBRES?.Trim();
            data.APELLIDO1 = data.APELLIDO1?.Trim();
            data.APELLIDO2 = data.APELLIDO2?.Trim() ?? string.Empty;
            data.CORREO = data.CORREO?.Trim();
            data.TELEFONO = data.TELEFONO?.Trim();
            data.FORMA_INGRESO = data.FORMA_INGRESO?.Trim().ToUpperInvariant();

            if (string.IsNullOrWhiteSpace(data.NOMBRES) || string.IsNullOrWhiteSpace(data.APELLIDO1))
                return ErrorValidacion("Ingrese los nombres y el primer apellido.");
            if (data.NOMBRES.Length > 150)
                return ErrorValidacion("Los nombres no pueden superar 150 caracteres.");
            if (data.APELLIDO1.Length > 50 || data.APELLIDO2.Length > 50)
                return ErrorValidacion("Cada apellido no puede superar 50 caracteres.");
            if (data.FECHA_NACIMIENTO == null || data.FECHA_NACIMIENTO.Value.Date > DateTime.Today)
                return ErrorValidacion("Ingrese una fecha de nacimiento válida.");
            if (data.ANIO <= 0 || data.NUMERO_PERIODO <= 0)
                return ErrorValidacion("Seleccione el ciclo.");
            if (data.CORR_CARRERA <= 0 || data.CORR_MODALIDAD <= 0)
                return ErrorValidacion("Seleccione la carrera y la modalidad.");
            if (string.IsNullOrWhiteSpace(data.FORMA_INGRESO) || Array.IndexOf(FormasIngreso, data.FORMA_INGRESO) < 0)
                return ErrorValidacion("La forma de ingreso debe ser NI, EQ, CC o RI.");
            if (string.IsNullOrWhiteSpace(data.CORREO) || data.CORREO.IndexOf('@') < 1 || data.CORREO.Length > 100)
                return ErrorValidacion("Ingrese un correo de hasta 100 caracteres.");
            if (string.IsNullOrWhiteSpace(data.TELEFONO) || data.TELEFONO.Length > 20)
                return ErrorValidacion("Ingrese un teléfono de hasta 20 caracteres.");

            return await _repo.RegistrarAsync(data);
        }

        // Qué hace: encabezado de un prospecto.
        // Cómo lo hace: exige CORR_PROSPECTO por la misma razón que GetAllAsync.
        public async Task<CResult> GetAsync(ACA_PROSPECTOParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe indicar el prospecto" };

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: carreras que se pueden elegir en el ciclo que el usuario tiene en pantalla.
        // Cómo lo hace: exige prospecto y ciclo (el ciclo puede no ser todavía el guardado).
        public async Task<CResult> GetCORR_CARRERA_ACA_PROSPECTOAsync(ACA_PROSPECTOParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO < 0)
                return ErrorValidacion("Debe indicar el prospecto");
            if (xWhere.ANIO <= 0 || xWhere.NUMERO_PERIODO <= 0)
                return ErrorValidacion("Debe indicar el ciclo");

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="ANIO",Value=xWhere.ANIO,DbType=System.Data.DbType.Int16},
                new CParameter() {ParameterName="NUMERO_PERIODO",Value=xWhere.NUMERO_PERIODO,DbType=System.Data.DbType.Byte},
            };

            return await _repo.GetCarrerasDelCicloAsync(p);
        }

        // Qué hace: ciclos a los que se puede mover el prospecto (más el suyo actual).
        public async Task<CResult> GetCICLO_ACA_PROSPECTOAsync(ACA_PROSPECTOParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO < 0)
                return ErrorValidacion("Debe indicar el prospecto");

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetCiclosAsync(p);
        }

        // Qué hace: consecuencias de cambiar ciclo/carrera, sin guardar (para el aviso previo).
        public async Task<CResult> GetVALIDAR_CAMBIO_ACA_PROSPECTOAsync(ACA_PROSPECTOParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0 || xWhere.ANIO <= 0 || xWhere.NUMERO_PERIODO <= 0
                || xWhere.CORR_CARRERA <= 0 || xWhere.CORR_MODALIDAD <= 0)
                return ErrorValidacion("Debe indicar prospecto, ciclo, carrera y modalidad");

            var p = Repositories.ACA_PROSPECTORepository.ParametrosCambio(xWhere.CORR_PROSPECTO, xWhere.ANIO,
                xWhere.NUMERO_PERIODO, xWhere.CORR_CARRERA, xWhere.CORR_MODALIDAD, "", "", true);

            return await _repo.ValidarCambioAsync(p);
        }

        // Qué hace: modalidades con plan vigente de la carrera elegida.
        public async Task<CResult> GetCORR_MODALIDAD_ACA_PROSPECTOAsync(ACA_PROSPECTOParam xWhere)
        {
            if (xWhere.CORR_CARRERA <= 0)
                return ErrorValidacion("Debe indicar la carrera");

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_CARRERA",Value=xWhere.CORR_CARRERA,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetModalidadesDeCarreraAsync(p);
        }

        // Qué hace: enciende Aprobar solo si este login ejecuta el paso actual y tiene permiso de modificar.
        // Cómo lo hace: la consulta cruza el actor del paso; sin U en el JWT el botón queda apagado.
        public async Task<CResult> GetPuedeAprobarAsync(ACA_PROSPECTOParam xWhere, string login, string permisoOpcion)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return ErrorValidacion("Debe indicar el prospecto");
            if (string.IsNullOrWhiteSpace(login))
                return ErrorValidacion("No se pudo identificar el usuario de sesion.");

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="LOGIN_SISTEMA",Value=login.Trim(),DbType=System.Data.DbType.String},
            };

            var result = await _repo.GetPuedeAprobarAsync(p);
            if (result.Result && result.Data is ACA_PROSPECTO_ACCION_FLUJOView accion
                && !(permisoOpcion ?? string.Empty).Contains('U'))
            {
                accion.PUEDE_APROBAR = false;
                accion.PUEDE_RECHAZAR = false;
                accion.PUEDE_REVERTIR = false;
            }

            return result;
        }

        // Qué hace: aprueba (3), rechaza (4) o revierte (5) con el usuario que está viendo la solicitud.
        public async Task<CResult> AccionFlujoAsync(ACA_PROSPECTOParam xWhere, string login, string observacion, string estacion, int operacion)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return ErrorValidacion("Debe indicar el prospecto");
            if (string.IsNullOrWhiteSpace(observacion))
                return ErrorValidacion("Debe ingresar un comentario.");

            return await _repo.AccionFlujoAsync(xWhere.CORR_EMPRESA, xWhere.CORR_PROSPECTO, login?.Trim(), observacion.Trim(), estacion, operacion);
        }

        public async Task<CResult> CreateAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: valida el encabezado antes de actualizar.
        // Cómo lo hace: se editan FORMA_INGRESO (NI, EQ, CC, RI), FINANCIA_ESTUDIOS y el ciclo con su
        //               carrera y modalidad; estos tres van juntos porque el procedimiento los resuelve juntos.
        public async Task<CResult> UpdateAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO <= 0)
                return ErrorValidacion("Debe indicar el prospecto a modificar.");

            bool traeCiclo = Data.ANIO > 0 || Data.NUMERO_PERIODO > 0;
            bool traeCarrera = Data.CORR_CARRERA > 0 || Data.CORR_MODALIDAD > 0;
            if ((traeCiclo || traeCarrera)
                && (Data.ANIO <= 0 || Data.NUMERO_PERIODO <= 0 || Data.CORR_CARRERA <= 0 || Data.CORR_MODALIDAD <= 0))
                return ErrorValidacion("Seleccione ciclo, carrera y modalidad.");

            Data.FORMA_INGRESO = Data.FORMA_INGRESO?.Trim().ToUpperInvariant();
            Data.FINANCIA_ESTUDIOS = string.IsNullOrWhiteSpace(Data.FINANCIA_ESTUDIOS) ? null : Data.FINANCIA_ESTUDIOS.Trim();

            if (string.IsNullOrWhiteSpace(Data.FORMA_INGRESO) || System.Array.IndexOf(FormasIngreso, Data.FORMA_INGRESO) < 0)
                return ErrorValidacion("La forma de ingreso debe ser NI, EQ, CC o RI.");

            if (Data.FINANCIA_ESTUDIOS != null && Data.FINANCIA_ESTUDIOS.Length > 100)
                return ErrorValidacion("Financia estudios no puede superar 100 caracteres.");

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private static readonly string[] FormasIngreso = { "NI", "EQ", "CC", "RI" };

        private static CResult ErrorValidacion(string mensaje)
        {
            return new CResult() { Data = null, Result = false, CodeHelper = 0, ErrorCode = -1, ErrorMessage = mensaje, ErrorSource = "[ACA_PROSPECTOService]", RowsAffected = 0 };
        }

        public async Task<CResult> DeleteAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}
