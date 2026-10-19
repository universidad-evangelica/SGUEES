using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Services;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_REQUISICION_PERSONALService : ISC_REQUISICION_PERSONALService
    {
        private const string CodigoOpcionMenuRequisicion = "SC_REQUISICION_PERSONAL";

        private readonly ISC_REQUISICION_PERSONALRepository _repo;
        private readonly IGEN_NOTIFICACIONService _notificacion;

        public SC_REQUISICION_PERSONALService(
            ISC_REQUISICION_PERSONALRepository repo,
            IGEN_NOTIFICACIONService notificacion)
        {
            _repo = repo;
            _notificacion = notificacion ?? throw new ArgumentNullException(nameof(notificacion));
        }

        public async Task<CResult> GetAllAsync(SC_REQUISICION_PERSONALParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				//Quiero filtrar por ACTIVOs nada mas
				//new CParameter() {ParameterName="ACTIVO",Value=true,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAllAsync(p);
        }

        // Qué hace: Retorna únicamente las requisiciones aprobadas (estado final / Aprobado GG = 5) para el selector de solicitud de empleo, ordenadas de la más reciente a la más antigua.
        // Cómo lo hace: Filtra por CORR_ESTADO_REQUISICION = 5 y ordena la lista resultante por FECHA_REQUISICION DESC y CORR_REQUISICION_PERSONAL DESC.
        public async Task<CResult> GetAllForSolicitudEmpleoAsync(SC_REQUISICION_PERSONALParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_ESTADO_REQUISICION", Value = 5, DbType = System.Data.DbType.Int32 },
            };

            var resultado = await _repo.GetAllAsync(p);
            if (resultado.Result && resultado.Data is IEnumerable<SC_REQUISICION_PERSONALView> lista)
            {
                resultado.Data = lista
                    .OrderByDescending(r => r.FECHA_REQUISICION)
                    .ThenByDescending(r => r.CORR_REQUISICION_PERSONAL)
                    .ToList();
            }

            return resultado;
        }

        public async Task<CResult> GetAsync(SC_REQUISICION_PERSONALParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_REQUISICION_PERSONAL",Value=xWhere.CORR_REQUISICION_PERSONAL,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SC_REQUISICION_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SC_REQUISICION_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SC_REQUISICION_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        //fUNCION PARA TRAER BITACORA DE SEG_FLUJO_BITACORA
        public async Task<CResult> GetAllAsyncBitacoraByCORR_REQUISICION(SC_REQUISICION_PERSONAL_BITACORAParam xWhere)
        {
            var p = new List<CParameter>
            {
                //new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_TIPO_DOCUMENTO",Value=xWhere.CORR_TIPO_DOCUMENTO,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_DOCUMENTO",Value=xWhere.CORR_REQUISICION_PERSONAL,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAllAsyncBitacoraByCORR_REQUISICION(p);
        }

        /// <summary>
        /// Consulta candidatos por empresa y requisición.
        /// Las reglas de estado y actividad se aplican en la vista SQL.
        /// </summary>
        public async Task<CResult> GetAllAsyncCandidatosByCORR_REQUISICION(
            SC_REQUISICION_PERSONAL_CANDIDATOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter()
                {
                    ParameterName = "CORR_EMPRESA",
                    Value = xWhere.CORR_EMPRESA,
                    DbType = System.Data.DbType.Int32
                },
                new CParameter()
                {
                    ParameterName = "CORR_REQUISICION_PERSONAL",
                    Value = xWhere.CORR_REQUISICION_PERSONAL,
                    DbType = System.Data.DbType.Int32
                },
            };

            return await _repo.GetAllAsyncCandidatosByCORR_REQUISICION(p);
        }

        /// <summary>
        /// Ejecuta operación de flujo de la requisición (Enviar/Aprobar/Devolver/Rechazar).
        /// La unidad del circuito es el puesto del creador, no CORR_UNIDAD del documento.
        /// </summary>
        public async Task<CResult> AutorizaAsync(SC_REQUISICION_PERSONAL_AUTORIZAParam Data, string vLOGIN_SISTEMA)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos para autorizar la requisicion.");
            }

            if (Data.CORR_EMPRESA <= 0)
            {
                return ValidationError("No se pudo identificar la empresa de la sesion.");
            }

            if (Data.CORR_REQUISICION_PERSONAL <= 0)
            {
                return ValidationError("Debe indicar la requisicion de personal.");
            }

            if (Data.OPERACION < 1 || Data.OPERACION > 5)
            {
                return ValidationError("Operacion invalida. Use 1=GUARDAR, 2=ENVIAR, 3=APROBAR, 4=DEVOLVER, 5=RECHAZAR.");
            }

            if (string.IsNullOrWhiteSpace(vLOGIN_SISTEMA))
            {
                return ValidationError("No se pudo identificar el usuario de sesion.");
            }

            if (string.IsNullOrWhiteSpace(Data.OBSERVACION))
            {
                Data.OBSERVACION = Data.OPERACION switch
                {
                    1 => "Se guardó la requisición en borrador.",
                    2 => "Se envió la requisición de personal a aprobación.",
                    3 => "Se aprobó la requisición.",
                    4 => "Se devolvió la requisición.",
                    5 => "Se rechazó la requisición.",
                    _ => "Se registró una acción en el flujo de la requisición.",
                };
            }
            else
            {
                Data.OBSERVACION = Data.OBSERVACION.Trim();
            }

            if (Data.OPERACION == 1 || Data.OPERACION == 2)
            {
                var unidad = await _repo.ResolverUnidadCreadorAsync(
                    Data.CORR_EMPRESA,
                    Data.CORR_REQUISICION_PERSONAL,
                    vLOGIN_SISTEMA.Trim());
                if (unidad <= 0)
                {
                    return ValidationError("No se encontró la unidad del puesto del creador. El flujo la usa para ubicar los niveles de aprobación.");
                }

                Data.CORR_UNIDAD_DOCUMENTO = unidad;
            }
            else
            {
                Data.CORR_UNIDAD_DOCUMENTO = null;
            }

            var login = vLOGIN_SISTEMA.Trim();
            var resultado = await _repo.AutorizaAsync(Data, login);
            if (!resultado.Result || Data.OPERACION < 2 || Data.OPERACION > 5)
            {
                return resultado;
            }

            // Best-effort: el flujo ya persistió; SignalR no debe tumbar Autoriza.
            try
            {
                await NotificarDesdeFlujoAsync(Data, login);
            }
            catch
            {
                // Persistencia de flujo ya confirmada.
            }

            return resultado;
        }

        /// <summary>
        /// Mapea SEG_FLUJO → GEN_NOTIFICACION:
        /// título = Nombre tipo + #corr + Estado; mensaje = Descripción del estado.
        /// Destinos: Enviar/Aprobar → pendientes del paso actual; Devolver/Rechazar → solo creador.
        /// </summary>
        private async Task NotificarDesdeFlujoAsync(SC_REQUISICION_PERSONAL_AUTORIZAParam data, string loginActor)
        {
            var dto = await _repo.GetContextoNotificacionFlujoAsync(
                data.CORR_EMPRESA,
                data.CORR_REQUISICION_PERSONAL);

            if (dto == null)
            {
                return;
            }

            var corrReq = dto.CORR_REQUISICION_PERSONAL > 0
                ? dto.CORR_REQUISICION_PERSONAL
                : data.CORR_REQUISICION_PERSONAL;

            var nombreTipo = string.IsNullOrWhiteSpace(dto.NOMBRE_TIPO)
                ? "Requisición de personal"
                : dto.NOMBRE_TIPO.Trim();
            var nombreEstado = string.IsNullOrWhiteSpace(dto.NOMBRE_ESTADO)
                ? "Actualización de flujo"
                : dto.NOMBRE_ESTADO.Trim();
            var titulo = $"{nombreTipo} #{corrReq} - {nombreEstado}";
            var mensaje = string.IsNullOrWhiteSpace(dto.DESCRIPCION_ESTADO)
                ? $"La requisición No.{corrReq} cambió a estado {nombreEstado}."
                : dto.DESCRIPCION_ESTADO.Trim();

            var urlDestino = await _notificacion.ResolverUrlDestinoAsync(
                CodigoOpcionMenuRequisicion,
                corrReq);
            if (string.IsNullOrWhiteSpace(urlDestino) && corrReq > 0)
            {
                // Fallback si SEG_OPCION_SISTEMA no tiene URL_OPCION / CODIGO_OPCION.
                urlDestino = $"/sc-requisicion-personal?corr={corrReq}";
            }

            var destinatarios = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var creador = dto.LOGIN_CREADOR?.Trim();

            if (data.OPERACION == 4 || data.OPERACION == 5)
            {
                // Devolver / Rechazar: una sola campana al dueño del documento.
                if (!string.IsNullOrWhiteSpace(creador))
                {
                    destinatarios.Add(creador);
                }
            }
            else
            {
                // Enviar / Aprobar: solo pendientes del paso actual.
                foreach (var loginPendiente in dto.LOGINS_PENDIENTES ?? Enumerable.Empty<string>())
                {
                    if (!string.IsNullOrWhiteSpace(loginPendiente))
                    {
                        destinatarios.Add(loginPendiente.Trim());
                    }
                }

                // Cierre de flujo (sin pendientes): avisar al creador.
                if (destinatarios.Count == 0 && !string.IsNullOrWhiteSpace(creador))
                {
                    destinatarios.Add(creador);
                }
            }

            // No notificar al mismo usuario que acaba de ejecutar la acción.
            destinatarios.Remove(loginActor);

            if (destinatarios.Count == 0)
            {
                return;
            }

            foreach (var loginDestino in destinatarios)
            {
                await _notificacion.NotificarUsuarioAsync(
                    corrEmpresa: data.CORR_EMPRESA,
                    loginDestino: loginDestino,
                    titulo: titulo,
                    mensaje: mensaje,
                    urlDestino: urlDestino,
                    usuarioCrea: loginActor,
                    estacionCrea: "API");
            }
        }

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
                ErrorSource = "SC_REQUISICION_PERSONALService",
            };
        }

    }
}
