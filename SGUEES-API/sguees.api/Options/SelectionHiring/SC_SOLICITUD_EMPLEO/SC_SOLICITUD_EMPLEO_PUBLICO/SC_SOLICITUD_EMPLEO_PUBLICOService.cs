using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using eFramework.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using sguees.api.Shared;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class SC_SOLICITUD_EMPLEO_PUBLICOService : ISC_SOLICITUD_EMPLEO_PUBLICOService
    {
        private readonly ISC_SOLICITUD_EMPLEO_PUBLICORepository _repo;
        private readonly ISC_SOLICITUD_REQUISICIONRepository _repoRequisicion;
        private readonly IGEN_PARAMETRO_SMTPRepository _repoParametroSmtp;
        private readonly IConfiguration _configuration;
        private readonly ILogger<SC_SOLICITUD_EMPLEO_PUBLICOService> _logger;
        private readonly PersonaFotoStorage _fotoStorage;

        public SC_SOLICITUD_EMPLEO_PUBLICOService(
            ISC_SOLICITUD_EMPLEO_PUBLICORepository repo,
            ISC_SOLICITUD_REQUISICIONRepository repoRequisicion,
            IGEN_PARAMETRO_SMTPRepository repoParametroSmtp,
            IConfiguration configuration,
            ILogger<SC_SOLICITUD_EMPLEO_PUBLICOService> logger,
            PersonaFotoStorage fotoStorage)
        {
            _repo = repo;
            _repoRequisicion = repoRequisicion;
            _repoParametroSmtp = repoParametroSmtp;
            _configuration = configuration;
            _logger = logger;
            _fotoStorage = fotoStorage;
        }

        public Task<CResult> GetAllTokenAsync(SC_SOLICITUD_EMPLEO_TOKENParam data)
        {
            if (data.CORR_SOLICITUD_EMPLEO <= 0)
            {
                return Task.FromResult(Error("La solicitud de empleo es requerida."));
            }

            var parametros = new List<CParameter>
            {
                new() { ParameterName = "@CORR_EMPRESA", Value = data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new() { ParameterName = "@CORR_SOLICITUD_EMPLEO", Value = data.CORR_SOLICITUD_EMPLEO, DbType = System.Data.DbType.Int32 },
            };

            return _repo.GetAllTokenAsync(parametros);
        }

        public async Task<CResult> GenerarTokenAsync(SC_SOLICITUD_EMPLEO_GENERAR_TOKENParam data)
        {
            if (data.CORR_SOLICITUD_EMPLEO <= 0)
            {
                return Error("La solicitud de empleo es requerida.");
            }

            var solicitudResultado = await _repo.GetSolicitudAsync(new List<CParameter>
            {
                new() { ParameterName = "CORR_EMPRESA", Value = data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new() { ParameterName = "CORR_SOLICITUD_EMPLEO", Value = data.CORR_SOLICITUD_EMPLEO, DbType = System.Data.DbType.Int32 },
            });

            if (!solicitudResultado.Result || solicitudResultado.Data == null)
            {
                return Error("La solicitud de empleo no existe.");
            }

            var solicitud = (SC_SOLICITUD_EMPLEOView)solicitudResultado.Data;
            if (!solicitud.ACTIVO)
            {
                return Error("La solicitud de empleo está inactiva.");
            }

            // Qué hace: valida que la solicitud no haya sido completada previamente antes de generar un nuevo token.
            // Cómo lo hace: si la solicitud ya tiene CORR_PERSONA_DATOS, consulta sus tokens; solo bloquea la generación si alguno de los tokens de esta solicitud ya está en estado COMPLETADO. Si no tiene tokens completados (candidato con DUI precargado que aún no finaliza la postulación), permite generar y enviar el nuevo token.
            if (solicitud.CORR_PERSONA_DATOS.HasValue && solicitud.CORR_PERSONA_DATOS.Value > 0)
            {
                var tokensResultado = await _repo.GetAllTokenAsync(new List<CParameter>
                {
                    new() { ParameterName = "@CORR_EMPRESA", Value = data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new() { ParameterName = "@CORR_SOLICITUD_EMPLEO", Value = data.CORR_SOLICITUD_EMPLEO, DbType = System.Data.DbType.Int32 },
                });

                if (tokensResultado.Result && tokensResultado.Data is IEnumerable<SC_SOLICITUD_EMPLEO_TOKENView> tokensList)
                {
                    if (tokensList.Any(t => string.Equals(t.ESTADO_TOKEN, "COMPLETADO", StringComparison.OrdinalIgnoreCase)))
                    {
                        return Error("La solicitud de empleo ya fue completada.");
                    }
                }
            }

            if (!CorreoValido(solicitud.CORREO_INVITACION))
            {
                return Error("El correo de invitación no es válido.");
            }

            if (solicitud.CORR_TIPO_CONTRATACION <= 0)
            {
                return Error("Debe indicar el tipo de contratación en la solicitud antes de generar el enlace del formulario.");
            }

            var requisicionesResultado = await _repoRequisicion.GetAllAsync(new List<CParameter>
            {
                new() { ParameterName = "CORR_EMPRESA", Value = data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new() { ParameterName = "CORR_SOLICITUD_EMPLEO", Value = data.CORR_SOLICITUD_EMPLEO, DbType = System.Data.DbType.Int32 },
            });

            if (!requisicionesResultado.Result)
            {
                return Error(requisicionesResultado.ErrorMessage ?? "No se pudo validar las requisiciones de la solicitud.");
            }

            var requisiciones = requisicionesResultado.Data as System.Collections.ICollection;
            if (requisiciones == null || requisiciones.Count <= 0)
            {
                return Error("Debe vincular al menos una requisición antes de generar el enlace del formulario.");
            }

            var horasVigencia = _configuration.GetValue<int?>("SolicitudEmpleo:HorasVigenciaToken") ?? 24;
            if (horasVigencia <= 0)
            {
                horasVigencia = 24;
            }

            var token = GenerarToken();
            var tokenHash = CalcularTokenHash(token);
            var fechaGeneracion = DateTime.Now;
            var fechaExpiracion = fechaGeneracion.AddHours(horasVigencia);

            var tokenResultado = await _repo.GenerarTokenAsync(new SC_SOLICITUD_EMPLEO_TOKENTable
            {
                CORR_EMPRESA = data.CORR_EMPRESA,
                CORR_SOLICITUD_EMPLEO = data.CORR_SOLICITUD_EMPLEO,
                TOKEN_HASH = tokenHash,
                FECHA_GENERACION = fechaGeneracion,
                FECHA_EXPIRACION = fechaExpiracion,
                ESTADO_TOKEN = "GENERADO",
                CORREO_DESTINO = solicitud.CORREO_INVITACION.Trim(),
            });

            if (!tokenResultado.Result || tokenResultado.Data == null)
            {
                return tokenResultado;
            }

            var tokenGenerado = (SC_SOLICITUD_EMPLEO_TOKENView)tokenResultado.Data;
            var urlFormulario = ConstruirUrlFormulario(token);

            int? corrPlantilla = data.CORR_PARAMETRO_PLANTILLA;
            if (!corrPlantilla.HasValue || corrPlantilla.Value <= 0)
            {
                corrPlantilla = await _repo.ObtenerPlantillaDefaultAsync(data.CORR_EMPRESA);
            }

            if (!corrPlantilla.HasValue || corrPlantilla.Value <= 0)
            {
                await _repo.ActualizarEstadoTokenAsync(data.CORR_EMPRESA, tokenGenerado.CORR_TOKEN, "ERROR_ENVIO");
                return Error("Debe seleccionar una plantilla de correo válida. No existe plantilla predeterminada activa en Parámetros SMTP.");
            }

            var cfg = await _repo.ObtenerConfiguracionEnvioAsync(data.CORR_EMPRESA, data.CORR_SOLICITUD_EMPLEO, corrPlantilla.Value);
            if (cfg == null || string.IsNullOrWhiteSpace((string)cfg.SERVIDOR_CORREO) || string.IsNullOrWhiteSpace((string)cfg.CORREO_REMITENTE))
            {
                await _repo.ActualizarEstadoTokenAsync(data.CORR_EMPRESA, tokenGenerado.CORR_TOKEN, "ERROR_ENVIO");
                return Error("No se encontró la configuración SMTP o plantilla requerida para el envío.");
            }

            var configuracionCorreo = new MailSetting
            {
                Host = ((string)cfg.SERVIDOR_CORREO).Trim(),
                Port = (int)cfg.PUERTO_CORREO,
                UseSSL = (bool)cfg.USA_SSL_CORREO,
                User = ((string)cfg.USUARIO_REMITENTE).Trim(),
                Password = (string)cfg.CONTRASENA_REMITENTE,
                FromName = "Universidad Evangélica de El Salvador",
                FromAddress = ((string)cfg.CORREO_REMITENTE).Trim(),
                BodyType = "html",
            };

            var contexto = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            if (cfg is IDictionary<string, object> dict)
            {
                foreach (var kvp in dict)
                {
                    contexto[kvp.Key] = kvp.Value?.ToString() ?? "";
                }
            }

            contexto["ENLACE_FORMULARIO"] = urlFormulario;
            contexto["URL_FORMULARIO_SOLICITUD"] = urlFormulario;
            contexto["URL_FORMULARIO"] = urlFormulario;
            contexto["HORAS_VIGENCIA"] = horasVigencia.ToString();
            contexto["CORREO_DESTINO"] = solicitud.CORREO_INVITACION.Trim();
            contexto["NOMBRE_INSTITUCION"] = "Universidad Evangélica de El Salvador";
            contexto["FECHA_ACTUAL"] = DateTime.Now.ToString("dd/MM/yyyy");
            contexto["ANIO_ACTUAL"] = DateTime.Now.Year.ToString();

            if (!contexto.ContainsKey("NOMBRE") && contexto.ContainsKey("NOMBRE_CANDIDATO"))
                contexto["NOMBRE"] = contexto["NOMBRE_CANDIDATO"];
            if (!contexto.ContainsKey("DUI") && contexto.ContainsKey("DUI_CANDIDATO"))
                contexto["DUI"] = contexto["DUI_CANDIDATO"];
            if (!contexto.ContainsKey("PUESTO") && contexto.ContainsKey("NOMBRE_PUESTO"))
                contexto["PUESTO"] = contexto["NOMBRE_PUESTO"];

            string asuntoOriginal = (string)cfg.ASUNTO_ORIGINAL ?? "Solicitud de empleo - SGUEES";
            string cuerpoOriginal = (string)cfg.CUERPO_ORIGINAL ?? "";

            string asuntoCorreo = Regex.Replace(asuntoOriginal, @"\{\{([A-Za-z0-9_]+)\}\}", m =>
                contexto.TryGetValue(m.Groups[1].Value, out var v) ? v : m.Value, RegexOptions.IgnoreCase);

            string cuerpoCorreo = Regex.Replace(cuerpoOriginal, @"\{\{([A-Za-z0-9_]+)\}\}", m =>
                contexto.TryGetValue(m.Groups[1].Value, out var v) ? v : m.Value, RegexOptions.IgnoreCase);

            cuerpoCorreo = SC_SOLICITUD_EMPLEOService.NormalizarEspaciadoHtml(cuerpoCorreo);

            var destinatarios = new List<ToEMail>
            {
                new() { Name = (string)cfg.NOMBRE_CANDIDATO ?? solicitud.CORREO_INVITACION.Trim(), Address = solicitud.CORREO_INVITACION.Trim() }
            };

            var envio = CRoutines.SendEmail(asuntoCorreo, cuerpoCorreo, destinatarios, configuracionCorreo);

            if (!envio.Result)
            {
                await _repo.ActualizarEstadoTokenAsync(data.CORR_EMPRESA, tokenGenerado.CORR_TOKEN, "ERROR_ENVIO");
                _logger.LogError(
                    "[SC_SOLICITUD_EMPLEO] Falló el envío del token {CorrToken}. Error: {Error}",
                    tokenGenerado.CORR_TOKEN,
                    envio.ErrorMessage);
                return Error("No fue posible enviar el correo de invitación.");
            }

            var resultado = await _repo.ActualizarEstadoTokenAsync(
                data.CORR_EMPRESA,
                tokenGenerado.CORR_TOKEN,
                "ENVIADO");
            OcultarTokenHash(resultado);
            return resultado;
        }

        public async Task<CResult> ValidarTokenAsync(SC_SOLICITUD_EMPLEO_PUBLICOParam data)
        {
            var token = data?.TOKEN?.Trim();
            if (string.IsNullOrWhiteSpace(token))
            {
                return TokenInvalido();
            }

            return await _repo.ValidarTokenAsync(CalcularTokenHash(token));
        }

        public async Task<CResult> GetDatosAsync(SC_SOLICITUD_EMPLEO_PUBLICOParam data)
        {
            var token = data?.TOKEN?.Trim();
            if (string.IsNullOrWhiteSpace(token))
            {
                return TokenInvalido();
            }

            return await _repo.GetDatosByTokenAsync(CalcularTokenHash(token));
        }

        public async Task<CResult> SubirFotoAsync(string token, IFormFile file)
        {
            var tokenLimpio = token?.Trim();
            if (string.IsNullOrWhiteSpace(tokenLimpio))
            {
                return Error("El enlace es inválido, expiró o ya fue utilizado.");
            }

            var tokenHash = CalcularTokenHash(tokenLimpio);
            var validacion = await _repo.ValidarTokenAsync(tokenHash);
            if (!validacion.Result || validacion.Data is not SC_SOLICITUD_EMPLEO_PUBLICOView vista || !vista.VALIDO)
            {
                return Error("El enlace es inválido, expiró o ya fue utilizado.");
            }

            var guardado = await _fotoStorage.SaveTempAsync(tokenHash, file);
            if (!guardado.Ok)
            {
                return Error(guardado.Error);
            }

            return new CResult
            {
                Result = true,
                Data = new SC_SOLICITUD_EMPLEO_FOTOView
                {
                    SUBIDO = true,
                    NOMBRE_ARCHIVO = guardado.FileName,
                },
                ErrorCode = 0,
                ErrorMessage = "",
                RowsAffected = 1,
            };
        }

        public async Task<CResult> CompletarAsync(SC_SOLICITUD_EMPLEO_COMPLETARParam data)
        {
            if (data == null)
            {
                return Error("Debe completar los campos requeridos.");
            }

            TrimStrings(data);
            var token = data.TOKEN;

            data.FAMILIARES_DIRECTOS ??= new();
            data.HIJOS ??= new();
            data.ESTUDIOS ??= new();
            data.IDIOMAS ??= new();
            data.COMPETENCIAS ??= new();
            data.EXPERIENCIAS ??= new();
            data.FAMILIARES_UEES ??= new();

            TrimStrings(data.FAMILIARES_DIRECTOS);
            TrimStrings(data.HIJOS);
            TrimStrings(data.ESTUDIOS);
            TrimStrings(data.IDIOMAS);
            TrimStrings(data.COMPETENCIAS);
            TrimStrings(data.EXPERIENCIAS);
            TrimStrings(data.FAMILIARES_UEES);

            data.FAMILIARES_DIRECTOS = data.FAMILIARES_DIRECTOS
                .Where(TieneDatosFamiliarDirecto)
                .ToList();

            if (!data.TIENE_FAMILIARES_UEES)
            {
                data.FAMILIARES_UEES.Clear();
            }

            // Qué hace: Garantiza valor para FECHA_DECLARACION en guardados parciales desde los primeros pasos
            // Cómo lo hace: Si la fecha es default se asigna la fecha y hora actual
            if (data.FECHA_DECLARACION == default)
            {
                data.FECHA_DECLARACION = DateTime.Now;
            }

            // Qué hace: Valida los campos obligatorios para guardar la solicitud
            // Cómo lo hace: Comprueba los campos NOT NULL de la pestaña personal/emergencia; las declaraciones aplican al completar en el paso 6
            if (string.IsNullOrWhiteSpace(token) ||
                string.IsNullOrWhiteSpace(data.NOMBRE1) ||
                string.IsNullOrWhiteSpace(data.APELLIDO1) ||
                data.FECHA_NACIMIENTO == default ||
                string.IsNullOrWhiteSpace(data.CORREO) ||
                string.IsNullOrWhiteSpace(data.CELULAR) ||
                string.IsNullOrWhiteSpace(data.DIRECCION) ||
                string.IsNullOrWhiteSpace(data.DUI) ||
                string.IsNullOrWhiteSpace(data.EMERGENCIA_NOMBRE) ||
                string.IsNullOrWhiteSpace(data.EMERGENCIA_TELEFONO))
            {
                return Error("Debe completar los campos requeridos.");
            }

            if (data.POSEE_DISCAPACIDAD && string.IsNullOrWhiteSpace(data.TIPO_DISCAPACIDAD))
            {
                return Error("Debe indicar el tipo de discapacidad.");
            }

            // Qué hace: Valida que el aspirante sea mayor de edad (mínimo 18 años).
            // Cómo lo hace: Compara DateOnly de nacimiento con DateOnly de hace 18 años.
            if (data.FECHA_NACIMIENTO > DateOnly.FromDateTime(DateTime.Today).AddYears(-18))
            {
                return Error("El aspirante debe ser mayor de edad (mínimo 18 años).");
            }

            var tokenHash = CalcularTokenHash(token);
            var resultado = await _repo.CompletarAsync(tokenHash, data);
            if (!resultado.Result || resultado.Data is not SC_SOLICITUD_EMPLEO_COMPLETARView completado || !completado.COMPLETADO)
            {
                return resultado;
            }

            try
            {
                var corrEmpresa = completado.CORR_EMPRESA > 0
                    ? completado.CORR_EMPRESA
                    : await _repo.ObtenerCorrEmpresaPorTokenHashAsync(tokenHash);
                if (corrEmpresa <= 0 || completado.CORR_PERSONA_DATOS <= 0)
                {
                    return resultado;
                }

                var fotoUrl = _fotoStorage.MoveTempToFinal(tokenHash, corrEmpresa, completado.CORR_PERSONA_DATOS);
                if (!string.IsNullOrWhiteSpace(fotoUrl))
                {
                    var actualizoFoto = await _repo.ActualizarFotoUrlAsync(completado.CORR_PERSONA_DATOS, corrEmpresa, fotoUrl);
                    if (!actualizoFoto.Result)
                    {
                        _logger.LogWarning(
                            "[SC_SOLICITUD_EMPLEO] Solicitud completada pero no se actualizó FOTO_URL de la persona {CorrPersona}. {Error}",
                            completado.CORR_PERSONA_DATOS,
                            actualizoFoto.ErrorMessage);
                    }
                }
            }
            catch (System.Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "[SC_SOLICITUD_EMPLEO] Solicitud completada pero falló el anclaje de la fotografía de la persona {CorrPersona}.",
                    completado.CORR_PERSONA_DATOS);
            }

            return resultado;
        }

        private static void TrimStrings<T>(IEnumerable<T> items)
        {
            foreach (var item in items)
            {
                TrimStrings(item);
            }
        }

        private static void TrimStrings(object data)
        {
            if (data == null)
            {
                return;
            }

            foreach (var property in data.GetType().GetProperties()
                         .Where(property => property.CanRead &&
                                            property.CanWrite &&
                                            property.PropertyType == typeof(string)))
            {
                if (property.GetValue(data) is string value)
                {
                    property.SetValue(data, value.Trim());
                }
            }
        }

        private static bool TieneDatosFamiliarDirecto(SC_PERSONA_FAMILIARTable familiar)
        {
            if (familiar == null)
            {
                return false;
            }

            var propiedadesDatos = new[] { "NOMBRE", "DOMICILIO", "FECHA_NACIMIENTO", "OCUPACION" };
            return propiedadesDatos.Any(nombre =>
            {
                var valor = familiar.GetType().GetProperty(nombre)?.GetValue(familiar);
                return valor switch
                {
                    null => false,
                    string texto => !string.IsNullOrWhiteSpace(texto),
                    DateOnly fecha => fecha != default,
                    DateTime fecha => fecha != default,
                    _ => true,
                };
            });
        }

        private async Task<GEN_PARAMETRO_SMTPView> ObtenerParametroCorreoAsync(int corrEmpresa)
        {
            var resultado = await _repoParametroSmtp.GetAsync(new List<CParameter>
            {
                new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
            });

            if (!resultado.Result || resultado.Data is not GEN_PARAMETRO_SMTPView parametro)
            {
                return null;
            }

            if (string.IsNullOrWhiteSpace(parametro.SERVIDOR_CORREO) ||
                string.IsNullOrWhiteSpace(parametro.USUARIO_REMITENTE) ||
                string.IsNullOrWhiteSpace(parametro.CONTRASENA_REMITENTE) ||
                string.IsNullOrWhiteSpace(parametro.CORREO_REMITENTE) ||
                parametro.PUERTO_CORREO <= 0)
            {
                return null;
            }

            return parametro;
        }

        private string ConstruirUrlFormulario(string token)
        {
            var urlBase = _configuration["SolicitudEmpleo:UrlFormulario"];
            if (string.IsNullOrWhiteSpace(urlBase))
            {
                urlBase = (_configuration["AppSetting:clientURL"] ?? "").TrimEnd('/') + "/formulario-empleo";
            }

            var separador = urlBase.Contains('?') ? "&" : "?";
            return urlBase + separador + "token=" + Uri.EscapeDataString(token);
        }

        private static string GenerarToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }

        private static string CalcularTokenHash(string token)
        {
            return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
        }

        private static bool CorreoValido(string correo)
        {
            if (string.IsNullOrWhiteSpace(correo))
            {
                return false;
            }

            try
            {
                return new MailAddress(correo.Trim()).Address == correo.Trim();
            }
            catch
            {
                return false;
            }
        }

        private static void OcultarTokenHash(CResult resultado)
        {
            if (resultado?.Data is not SC_SOLICITUD_EMPLEO_TOKENView token ||
                string.IsNullOrWhiteSpace(token.TOKEN_HASH) ||
                token.TOKEN_HASH.Length <= 12)
            {
                return;
            }

            token.TOKEN_HASH = token.TOKEN_HASH[..8] + "..." + token.TOKEN_HASH[^4..];
        }

        private static CResult TokenInvalido()
        {
            return new CResult
            {
                Result = true,
                Data = new SC_SOLICITUD_EMPLEO_PUBLICOView { VALIDO = false },
                ErrorCode = 0,
                ErrorMessage = "El enlace es inválido, expiró o ya fue utilizado.",
                RowsAffected = 0,
            };
        }

        private static CResult Error(string mensaje)
        {
            return new CResult
            {
                Result = false,
                Data = null,
                ErrorCode = -1,
                ErrorMessage = mensaje,
                RowsAffected = 0,
            };
        }
    }
}
