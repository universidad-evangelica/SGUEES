using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using sguees.api.Services.Hubs;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_NOTIFICACIONService : IGEN_NOTIFICACIONService
	{
		public const string CodigoOpcionBandejaTh = "SC_BANDEJA_TH";
		public const string CodigoOpcionBandejaActores = "SC_BANDEJA_ACTORES";
		public const string CodigoOpcionRequisicionPersonal = "SC_REQUISICION";
		public const string CodigoOpcionMovimientoPersonal = "SC_MOVIMIENTO_PERSONAL";

		/// <summary>
		/// Si SEG_OPCION_SISTEMA no trae URL_OPCION (o Get falla), se usa esta ruta de routing SPA.
		/// </summary>
		private static readonly Dictionary<string, string> UrlOpcionFallback =
			new(StringComparer.OrdinalIgnoreCase)
			{
				[CodigoOpcionBandejaTh] = "/sc-bandeja-th",
				[CodigoOpcionBandejaActores] = "/sc-bandeja-actores",
				[CodigoOpcionRequisicionPersonal] = "/sc-requisicion-personal",
				["SC_REQUISICION_PERSONAL"] = "/sc-requisicion-personal",
				[CodigoOpcionMovimientoPersonal] = "/sc-movimiento-personal",
				["SC_EXPEDIENTE_CANDIDATO"] = "/sc-expediente-candidato",
			};

		private readonly IGEN_NOTIFICACIONRepository _repo;
		private readonly INotificationSignalRService _signalR;
		private readonly ISEG_OPCION_SISTEMAService _opcionSistema;
		private readonly IGEN_PARAMETRO_SMTPRepository _repoParametroSmtp;
		private readonly IConfiguration _config;
		private readonly ILogger<GEN_NOTIFICACIONService> _logger;

		// Qué hace: Controla la concurrencia de conexiones SMTP hacia Microsoft 365.
		// Cómo lo hace: Limita a 1 el número de conexiones simultáneas abiertas compartidas por toda la API, evitando el error 4.3.2 de Office 365.
		private static readonly System.Threading.SemaphoreSlim _smtpThrottle = new(1, 1);

		public GEN_NOTIFICACIONService(
			IGEN_NOTIFICACIONRepository repo,
			INotificationSignalRService signalR,
			ISEG_OPCION_SISTEMAService opcionSistema,
			IGEN_PARAMETRO_SMTPRepository repoParametroSmtp,
			IConfiguration config,
			ILogger<GEN_NOTIFICACIONService> logger)
		{
			_repo = repo ?? throw new ArgumentNullException(nameof(repo));
			_signalR = signalR ?? throw new ArgumentNullException(nameof(signalR));
			_opcionSistema = opcionSistema ?? throw new ArgumentNullException(nameof(opcionSistema));
			_repoParametroSmtp = repoParametroSmtp ?? throw new ArgumentNullException(nameof(repoParametroSmtp));
			_config = config ?? throw new ArgumentNullException(nameof(config));
			_logger = logger ?? throw new ArgumentNullException(nameof(logger));
		}

		public async Task<CResult> GetAllAsync(GEN_NOTIFICACIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "LOGIN_SISTEMA", Value = xWhere.LOGIN_SISTEMA, DbType = System.Data.DbType.String },
				new() { ParameterName = "PAGE", Value = xWhere.PAGE < 1 ? 1 : xWhere.PAGE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "PAGE_SIZE", Value = xWhere.PAGE_SIZE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "SORT_FIELD", Value = "FECHA_CREA", DbType = System.Data.DbType.String },
				new() { ParameterName = "SORT_DESC", Value = true, DbType = System.Data.DbType.Boolean },
			};

			if (xWhere.SOLO_NO_LEIDAS)
			{
				p.Add(new CParameter { ParameterName = "LEIDA", Value = false, DbType = System.Data.DbType.Boolean });
			}

			return await _repo.GetAllAsync(p);
		}

		public Task<CResult> CountPendientesAsync(int corrEmpresa, string loginSistema)
		{
			return _repo.CountPendientesAsync(corrEmpresa, loginSistema);
		}

		public Task<CResult> MarcarLeidaAsync(
			int corrEmpresa,
			string loginSistema,
			int corrNotificacion,
			string usuarioActu,
			string estacionActu)
		{
			return _repo.MarcarLeidaAsync(corrEmpresa, loginSistema, corrNotificacion, usuarioActu, estacionActu);
		}

		public async Task<CResult> CrearYEnviarAsync(GEN_NOTIFICACIONCreateParam data)
		{
			var validacion = ValidarCreacion(data);
			if (validacion != null)
			{
				return validacion;
			}

			var persistido = await _repo.CrearAsync(data);
			if (!persistido.Result || persistido.Data is not GEN_NOTIFICACIONView view)
			{
				return persistido;
			}

			try
			{
				await _signalR.SendToUserAsync(view.LOGIN_SISTEMA, new NotificationMessage
				{
					CORR_EMPRESA = view.CORR_EMPRESA,
					CORR_NOTIFICACION = view.CORR_NOTIFICACION,
					TITULO = view.TITULO,
					MENSAJE = view.MENSAJE,
					URL_DESTINO = view.URL_DESTINO,
					FECHA_CREA = view.FECHA_CREA,
					LEIDA = view.LEIDA
				});
			}
			catch (Exception ex)
			{
				// Persistencia ya confirmada: no revertir. El cliente la verá al consultar la bandeja.
				_logger.LogWarning(ex, "[GEN_NOTIFICACION] SignalR falló tras persistir CORR_NOTIFICACION={Corr}", view.CORR_NOTIFICACION);
			}

			// Qué hace: Despacha el envío del correo electrónico institucional en segundo plano sin demorar la respuesta de la API.
			// Cómo lo hace: Dispara una tarea asíncrona desacoplada con Task.Run ejecutando DespacharCorreoNotificacionAsync.
			_ = Task.Run(async () =>
			{
				try
				{
					await DespacharCorreoNotificacionAsync(view);
				}
				catch (Exception ex)
				{
					_logger.LogError(ex, "[GEN_NOTIFICACION] Error no controlado al enviar correo para notificación {Corr} a {Login}",
						view.CORR_NOTIFICACION, view.LOGIN_SISTEMA);
				}
			});

			return persistido;
		}

		public Task<CResult> NotificarUsuarioAsync(
			int corrEmpresa,
			string loginDestino,
			string titulo,
			string mensaje,
			string urlDestino = null,
			string usuarioCrea = null,
			string estacionCrea = null)
		{
			var login = loginDestino?.Trim() ?? string.Empty;
			return CrearYEnviarAsync(new GEN_NOTIFICACIONCreateParam
			{
				CORR_EMPRESA = corrEmpresa,
				LOGIN_SISTEMA = login,
				TITULO = titulo,
				MENSAJE = mensaje,
				URL_DESTINO = urlDestino,
				USUARIO_CREA = string.IsNullOrWhiteSpace(usuarioCrea) ? login : usuarioCrea.Trim(),
				ESTACION_CREA = string.IsNullOrWhiteSpace(estacionCrea) ? "API" : estacionCrea.Trim()
			});
		}

		public async Task<string> ResolverUrlDestinoAsync(string codigoOpcion, int corr)
		{
			if (corr <= 0)
			{
				return null;
			}

			var path = await ResolverUrlOpcionAsync(codigoOpcion);
			return AppendCorrQuery(path, corr);
		}

		public async Task<string> ResolverUrlOpcionAsync(string codigoOpcion)
		{
			if (string.IsNullOrWhiteSpace(codigoOpcion))
			{
				return null;
			}

			var codigo = codigoOpcion.Trim();
			string path = null;

			try
			{
				var resultado = await _opcionSistema.GetAsync(new SEG_OPCION_SISTEMAParam
				{
					CODIGO_OPCION = codigo
				});

				if (resultado.Result && resultado.Data is SEG_OPCION_SISTEMAView opcion)
				{
					path = NormalizePath(opcion.URL_OPCION);
				}
				else if (resultado.Result && resultado.Data != null)
				{
					// GetAsync a veces no tipa Data como View; intenta URL_OPCION por reflexión/dynamic.
					path = NormalizePath(TryReadUrlOpcion(resultado.Data));
				}

				if (string.IsNullOrWhiteSpace(path))
				{
					_logger.LogWarning(
						"[GEN_NOTIFICACION] URL_OPCION vacía o sin fila para CODIGO_OPCION={Codigo}; se usa fallback.",
						codigo);
				}
			}
			catch (Exception ex)
			{
				_logger.LogWarning(ex,
					"[GEN_NOTIFICACION] Error resolviendo URL_OPCION para CODIGO_OPCION={Codigo}; se usa fallback.",
					codigo);
			}

			if (string.IsNullOrWhiteSpace(path)
				&& UrlOpcionFallback.TryGetValue(codigo, out var fallback))
			{
				path = fallback;
			}

			return path;
		}

		private static string TryReadUrlOpcion(object data)
		{
			if (data == null)
			{
				return null;
			}

			var prop = data.GetType().GetProperty("URL_OPCION");
			return prop?.GetValue(data)?.ToString();
		}

		public async Task<string> ResolverUrlBandejaTareaAsync(
			int corrEmpresa,
			string loginDestino,
			int? corrDocumento = null,
			string tipoDocumento = null)
		{
			var esTh = await EsUsuarioThAsync(corrEmpresa, loginDestino);
			var codigoOpcion = esTh ? CodigoOpcionBandejaTh : CodigoOpcionBandejaActores;

			var path = await ResolverUrlOpcionAsync(codigoOpcion);
			if (string.IsNullOrWhiteSpace(path))
			{
				path = esTh ? "/sc-bandeja-th" : "/sc-bandeja-actores";
			}

			return AppendBandejaQuery(path, corrDocumento, tipoDocumento);
		}

		public async Task<string> ResolverUrlBandejaThAsync(
			int? corrDocumento = null,
			string tipoDocumento = null)
		{
			var path = await ResolverUrlOpcionAsync(CodigoOpcionBandejaTh);
			if (string.IsNullOrWhiteSpace(path))
			{
				path = "/sc-bandeja-th";
			}

			return AppendBandejaQuery(path, corrDocumento, tipoDocumento);
		}

		public Task<bool> EsUsuarioThAsync(int corrEmpresa, string loginSistema)
		{
			return _repo.EsUsuarioThAsync(corrEmpresa, loginSistema);
		}

		/// <summary>Deep link documento: {URL_OPCION}?corr={corr}.</summary>
		private static string AppendCorrQuery(string urlOpcion, int corr)
		{
			var path = NormalizePath(urlOpcion);
			if (corr <= 0 || string.IsNullOrWhiteSpace(path))
			{
				return null;
			}

			return $"{path}?corr={corr}";
		}

		// Qué hace: Construye la URL amigable de la bandeja para notificaciones en formato REST (/sc-bandeja-actores/REQ-29).
		// Cómo lo hace: Evalúa el tipo de documento para determinar el prefijo (REQ, MOV, CAN) y lo anexa como segmento limpio de ruta.
		private static string AppendBandejaQuery(string urlOpcion, int? corrDocumento, string tipoDocumento)
		{
			var path = NormalizePath(urlOpcion);
			if (string.IsNullOrWhiteSpace(path))
			{
				return null;
			}

			if (corrDocumento.HasValue && corrDocumento.Value > 0)
			{
				var tipo = (tipoDocumento ?? string.Empty).Trim().ToUpperInvariant();
				var prefijo = tipo switch
				{
					"MOVIMIENTO" or "MOVIMIENTOS" => "MOV",
					"CANDIDATO" or "CANDIDATOS" => "CAN",
					_ => "REQ"
				};
				return $"{path.TrimEnd('/')}/{prefijo}-{corrDocumento.Value}";
			}

			return path;
		}

		private static string NormalizePath(string urlOpcion)
		{
			if (string.IsNullOrWhiteSpace(urlOpcion))
			{
				return null;
			}

			var path = urlOpcion.Trim();
			if (!path.StartsWith("/"))
			{
				path = "/" + path;
			}

			var queryAt = path.IndexOf('?');
			if (queryAt >= 0)
			{
				path = path.Substring(0, queryAt);
			}

			return path;
		}

		private static CResult ValidarCreacion(GEN_NOTIFICACIONCreateParam data)
		{
			if (data == null)
			{
				return Error("Los datos de la notificación son obligatorios.");
			}

			if (data.CORR_EMPRESA <= 0)
			{
				return Error("CORR_EMPRESA es obligatorio.");
			}

			if (string.IsNullOrWhiteSpace(data.LOGIN_SISTEMA))
			{
				return Error("LOGIN_SISTEMA destinatario es obligatorio.");
			}

			if (string.IsNullOrWhiteSpace(data.TITULO))
			{
				return Error("TITULO es obligatorio.");
			}

			if (string.IsNullOrWhiteSpace(data.MENSAJE))
			{
				return Error("MENSAJE es obligatorio.");
			}

			if (string.IsNullOrWhiteSpace(data.USUARIO_CREA))
			{
				return Error("USUARIO_CREA es obligatorio.");
			}

			if (!EsUrlDestinoValida(data.URL_DESTINO, out var errorUrl))
			{
				return Error(errorUrl);
			}

			data.LOGIN_SISTEMA = data.LOGIN_SISTEMA.Trim();
			data.TITULO = data.TITULO.Trim();
			data.MENSAJE = data.MENSAJE.Trim();
			data.USUARIO_CREA = data.USUARIO_CREA.Trim();
			data.ESTACION_CREA = string.IsNullOrWhiteSpace(data.ESTACION_CREA) ? "API" : data.ESTACION_CREA.Trim();
			data.URL_DESTINO = string.IsNullOrWhiteSpace(data.URL_DESTINO) ? null : data.URL_DESTINO.Trim();

			return null;
		}

		/// <summary>
		/// Solo rutas internas Angular que empiezan por '/'.
		/// Rechaza http:, https:, // y javascript:.
		/// </summary>
		internal static bool EsUrlDestinoValida(string urlDestino, out string error)
		{
			error = null;
			if (string.IsNullOrWhiteSpace(urlDestino))
			{
				return true;
			}

			var url = urlDestino.Trim();
			var lower = url.ToLowerInvariant();

			if (lower.StartsWith("http:") || lower.StartsWith("https:") || lower.StartsWith("javascript:") || lower.StartsWith("//"))
			{
				error = "URL_DESTINO no puede ser una URL externa ni un esquema no permitido.";
				return false;
			}

			if (!url.StartsWith("/"))
			{
				error = "URL_DESTINO debe ser una ruta interna que comience por '/'.";
				return false;
			}

			return true;
		}

		// Qué hace: Envía un correo institucional al usuario destinatario utilizando la plantilla oficial UEES y la configuración SMTP de BD.
		// Cómo lo hace: Consulta el correo en SEG_USUARIO, los parámetros SMTP en GEN_PARAMETRO_SMTP, arma el mensaje HTML con enlace directo y ejecuta CRoutines.SendEmail.
		private async Task DespacharCorreoNotificacionAsync(GEN_NOTIFICACIONView view)
		{
			if (view == null || string.IsNullOrWhiteSpace(view.LOGIN_SISTEMA))
			{
				return;
			}

			// 1. Obtener correo y nombre del destinatario desde SEG_USUARIO
			var (correoDestino, nombreDestino) = await _repo.ObtenerDatosCorreoUsuarioAsync(view.LOGIN_SISTEMA);
			if (string.IsNullOrWhiteSpace(correoDestino))
			{
				_logger.LogInformation("[GEN_NOTIFICACION] Usuario {Login} no tiene correo institucional configurado en SEG_USUARIO; se omite correo.", view.LOGIN_SISTEMA);
				return;
			}

			// 2. Obtener configuración SMTP de la empresa (o primera activa de respaldo)
			var pParametro = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = view.CORR_EMPRESA, DbType = System.Data.DbType.Int32 }
			};
			var objParametro = await _repoParametroSmtp.GetAsync(pParametro);
			GEN_PARAMETRO_SMTPView parametro = null;
			if (objParametro.Result && objParametro.Data != null)
			{
				parametro = (GEN_PARAMETRO_SMTPView)objParametro.Data;
			}

			if (parametro == null ||
				string.IsNullOrWhiteSpace(parametro.SERVIDOR_CORREO) ||
				string.IsNullOrWhiteSpace(parametro.USUARIO_REMITENTE) ||
				string.IsNullOrWhiteSpace(parametro.CONTRASENA_REMITENTE) ||
				string.IsNullOrWhiteSpace(parametro.CORREO_REMITENTE) ||
				parametro.PUERTO_CORREO <= 0)
			{
				var objParametros = await _repoParametroSmtp.GetAllAsync(new List<CParameter>());
				if (objParametros.Result && objParametros.Data is List<GEN_PARAMETRO_SMTPView> lista)
				{
					parametro = lista.FirstOrDefault(p =>
						!string.IsNullOrWhiteSpace(p.SERVIDOR_CORREO) &&
						!string.IsNullOrWhiteSpace(p.USUARIO_REMITENTE) &&
						!string.IsNullOrWhiteSpace(p.CONTRASENA_REMITENTE) &&
						!string.IsNullOrWhiteSpace(p.CORREO_REMITENTE) &&
					p.PUERTO_CORREO > 0);
				}
			}

			if (parametro == null ||
				string.IsNullOrWhiteSpace(parametro.SERVIDOR_CORREO) ||
				string.IsNullOrWhiteSpace(parametro.USUARIO_REMITENTE) ||
				string.IsNullOrWhiteSpace(parametro.CONTRASENA_REMITENTE) ||
				string.IsNullOrWhiteSpace(parametro.CORREO_REMITENTE) ||
				parametro.PUERTO_CORREO <= 0)
			{
				_logger.LogWarning("[GEN_NOTIFICACION] No hay configuración SMTP válida en GEN_PARAMETRO_SMTP para empresa {CorrEmpresa}.", view.CORR_EMPRESA);
				return;
			}

			// Qué hace: Configura las credenciales y el tipo de socket para el despacho del correo.
			// Cómo lo hace: Para puerto 587 (Office 365) se usa STARTTLS (UseSSL = false), y para puerto 465 se usa SSL directo.
			var configuracionCorreo = new MailSetting
			{
				Host = parametro.SERVIDOR_CORREO.Trim(),
				Port = parametro.PUERTO_CORREO,
				UseSSL = parametro.PUERTO_CORREO == 465,
				User = parametro.USUARIO_REMITENTE.Trim(),
				Password = parametro.CONTRASENA_REMITENTE,
				FromName = "SGUEES - Notificaciones",
				FromAddress = parametro.CORREO_REMITENTE.Trim(),
				BodyType = "html"
			};

			// 3. Construir URL de acceso directa al sistema
			var urlBase = _config.GetSection("AppSetting:clientURL").Value ?? "http://192.168.0.250/sguees/";
			var urlAcceso = string.IsNullOrWhiteSpace(view.URL_DESTINO)
				? urlBase
				: $"{urlBase.TrimEnd('/')}/{view.URL_DESTINO.TrimStart('/')}";

			// 4. Construir cuerpo HTML institucional con tarjeta moderna 2 columnas
			// Qué hace: Construye el cuerpo del correo en HTML institucional con tarjeta estilizada en 2 columnas, botón de acción y enlace seguro.
			// Cómo lo hace: Agrupa la categoría, el título y los datos estructurados en una tarjeta #f8fafc con bordes redondeados, coloca el botón Ingresar al Sistema SGUEES y añade el recuadro de enlace de respaldo.
			var nombreParaMostrar = string.IsNullOrWhiteSpace(nombreDestino) ? view.LOGIN_SISTEMA : nombreDestino;
			var sbMensaje = new System.Text.StringBuilder();

			sbMensaje.Append("<p style='margin: 0 0 8px; font-size: 22px; font-weight: bold; color: #063b79;'>")
					 .Append("Estimado(a) ").Append(System.Net.WebUtility.HtmlEncode(nombreParaMostrar)).Append(",</p>");
			sbMensaje.Append("<p style='margin: 0 0 20px; font-size: 15px; color: #334155; line-height: 24px;'>")
					 .Append("Se ha registrado una nueva actualización en el proceso de selección de personal:</p>");

			// Tarjeta principal (Card moderna con esquinas redondeadas)
			sbMensaje.Append("<div style='background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px 28px; margin: 20px 0;'>");

			// Etiqueta superior de categoría (Overline)
			var etiquetaCategoria = view.TITULO.Contains("Dictamen", StringComparison.OrdinalIgnoreCase)
				? "RESULTADO DE EVALUACIÓN"
				: (view.TITULO.Contains("Requisición", StringComparison.OrdinalIgnoreCase)
					? "DATOS DE LA REQUISICIÓN"
					: "DETALLE DE LA NOTIFICACIÓN");

			sbMensaje.Append("<p style='margin: 0 0 6px; font-size: 11px; font-weight: bold; color: #64748b; letter-spacing: 0.8px; text-transform: uppercase;'>")
					 .Append(etiquetaCategoria).Append("</p>");

			// Título principal (sin badge de estado según lo solicitado)
			sbMensaje.Append("<h3 style='margin: 0 0 16px; font-size: 20px; font-weight: bold; color: #092e61;'>")
					 .Append(System.Net.WebUtility.HtmlEncode(view.TITULO)).Append("</h3>");

			// Divisor horizontal
			sbMensaje.Append("<table width='100%' role='presentation'><tr><td height='1' bgcolor='#e2e8f0' style='font-size:0;'>&nbsp;</td></tr></table>");

			// Cuadrícula de datos en 2 columnas
			sbMensaje.Append("<div style='padding-top: 16px;'>");
			sbMensaje.Append(FormatearDetallesEnGrid(view.MENSAJE));
			sbMensaje.Append("</div>");

			sbMensaje.Append("</div>"); // Fin Tarjeta

			// Botón Principal
			if (!string.IsNullOrWhiteSpace(view.URL_DESTINO))
			{
				sbMensaje.Append("<table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation' style='margin: 28px 0 20px;'><tr><td align='center'>");
				sbMensaje.Append("<table cellpadding='0' cellspacing='0' border='0' role='presentation' bgcolor='#063b79' style='background-color: #063b79; border-radius: 8px;'><tr><td align='center' style='padding: 14px 32px; border-radius: 8px;'>");
				sbMensaje.Append("<a href='").Append(urlAcceso).Append("' title='Ingresar al Sistema SGUEES' target='_blank' style='color: #ffffff; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;'>")
						 .Append("Ingresar al Sistema SGUEES &rarr;</a>");
				sbMensaje.Append("</td></tr></table>");
				sbMensaje.Append("</td></tr></table>");
			}

			var cuerpoCompleto = CRoutines.BodyEmailUEES(sbMensaje.ToString());
			var destinatarios = new List<ToEMail>
			{
				new() { Name = nombreParaMostrar, Address = correoDestino.Trim() }
			};

			var asunto = $"[SGUEES] {view.TITULO}";

			// Qué hace: Envía el correo por SMTP controlando la concurrencia y reintentando ante bloqueos temporales de Microsoft 365.
			// Cómo lo hace: Adquiere el semáforo de 1 en 1 para no saturar Office 365; si recibe 4.3.2 espera 1.5 segundos y reintenta.
			await _smtpThrottle.WaitAsync();
			try
			{
				int intento = 0;
				CResult envio = null;

				while (intento < 2)
				{
					intento++;
					envio = CRoutines.SendEmail(asunto, cuerpoCompleto, destinatarios, configuracionCorreo);

					if (envio.Result)
					{
						break;
					}

					// Si Microsoft reporta límite de concurrencia temporal, esperar antes de reintentar
					if (intento < 2 && !string.IsNullOrWhiteSpace(envio.ErrorMessage) && envio.ErrorMessage.Contains("4.3.2"))
					{
						_logger.LogWarning("[GEN_NOTIFICACION] Microsoft 365 reportó 4.3.2 para {Login}; reintentando en 1.5 segundos (intento {Intento})...",
							view.LOGIN_SISTEMA, intento);
						await Task.Delay(1500);
					}
				}

				if (!envio.Result)
				{
					_logger.LogError("[GEN_NOTIFICACION] Falló envío de correo para {Login} ({Correo}). Error: {Error}",
						view.LOGIN_SISTEMA, correoDestino, envio.ErrorMessage);
				}
				else
				{
					_logger.LogInformation("[GEN_NOTIFICACION] Correo enviado exitosamente a {Correo} ({Login}) para notificación {Corr}",
						correoDestino, view.LOGIN_SISTEMA, view.CORR_NOTIFICACION);
				}
			}
			finally
			{
				_smtpThrottle.Release();
			}
		}

				// Qué hace: Formatea el contenido del mensaje de notificación en una cuadrícula responsiva HTML de dos columnas con pares Etiqueta/Valor.
		// Cómo lo hace: Analiza las líneas del mensaje; si contienen pares separados por dos puntos (Etiqueta: Valor), genera una tabla de 2 columnas con tipografía institucional, destacando identificadores en azul y desplegando observaciones en ancho completo.
		private static string FormatearDetallesEnGrid(string mensaje)
		{
			if (string.IsNullOrWhiteSpace(mensaje))
			{
				return string.Empty;
			}

			var lineas = mensaje.Replace("\r\n", "\n")
								.Split(new[] { '\n' }, StringSplitOptions.RemoveEmptyEntries)
								.Select(l => l.Trim())
								.Where(l => !string.IsNullOrWhiteSpace(l))
								.ToList();

			if (lineas.Count == 1 && (lineas[0].Contains('•') || lineas[0].Contains('|')))
			{
				lineas = lineas[0].Split(new[] { '•', '|' }, StringSplitOptions.RemoveEmptyEntries)
								  .Select(l => l.Trim())
								  .Where(l => !string.IsNullOrWhiteSpace(l))
								  .ToList();
			}

			var campos = new List<(string Etiqueta, string Valor)>();
			var textosLibres = new List<string>();

			foreach (var linea in lineas)
			{
				var posDosPuntos = linea.IndexOf(':');
				if (posDosPuntos > 0 && posDosPuntos < linea.Length - 1)
				{
					var etiqueta = linea.Substring(0, posDosPuntos).Trim().ToUpperInvariant();
					var valor = linea.Substring(posDosPuntos + 1).Trim();
					campos.Add((etiqueta, valor));
				}
				else
				{
					textosLibres.Add(linea);
				}
			}

			if (campos.Count == 0)
			{
				return $"<p style='margin: 0; font-size: 14px; color: #334155; line-height: 1.6;'>{System.Net.WebUtility.HtmlEncode(mensaje).Replace("\r\n", "<br/>").Replace("\n", "<br/>")}</p>";
			}

			var sb = new System.Text.StringBuilder();
			sb.Append("<table width='100%' cellpadding='0' cellspacing='0' border='0' role='presentation'>");

			for (int i = 0; i < campos.Count; i += 2)
			{
				sb.Append("<tr>");

				var c1 = campos[i];
				bool esUltimoSolo = (i + 1 >= campos.Count);
				string colspan1 = esUltimoSolo ? " colspan='2'" : " width='50%'";
				string padding1 = esUltimoSolo ? "padding: 6px 0 14px 0;" : "padding: 6px 12px 14px 0;";

				sb.Append($"<td{colspan1} valign='top' style='{padding1}'>");
				sb.Append($"<p style='margin: 0 0 4px; font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;'>{System.Net.WebUtility.HtmlEncode(c1.Etiqueta)}</p>");

				bool esAzul1 = c1.Etiqueta.Contains("REQUISICI\u00D3N") || c1.Etiqueta.Contains("EXPEDIENTE") || c1.Etiqueta.Contains("MOVIMIENTO");
				string colorValor1 = esAzul1 ? "#0754a5" : "#0f294a";
				sb.Append($"<p style='margin: 0; font-size: 15px; font-weight: bold; color: {colorValor1};'>{System.Net.WebUtility.HtmlEncode(c1.Valor)}</p>");
				sb.Append("</td>");

				if (!esUltimoSolo)
				{
					var c2 = campos[i + 1];
					sb.Append("<td width='50%' valign='top' style='padding: 6px 0 14px 12px;'>");
					sb.Append($"<p style='margin: 0 0 4px; font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;'>{System.Net.WebUtility.HtmlEncode(c2.Etiqueta)}</p>");

					bool esAzul2 = c2.Etiqueta.Contains("REQUISICI\u00D3N") || c2.Etiqueta.Contains("EXPEDIENTE") || c2.Etiqueta.Contains("MOVIMIENTO");
					string colorValor2 = esAzul2 ? "#0754a5" : "#0f294a";
					sb.Append($"<p style='margin: 0; font-size: 15px; font-weight: bold; color: {colorValor2};'>{System.Net.WebUtility.HtmlEncode(c2.Valor)}</p>");
					sb.Append("</td>");
				}

				sb.Append("</tr>");
			}

			foreach (var texto in textosLibres)
			{
				sb.Append("<tr><td colspan='2' style='padding: 10px 0 4px 0; border-top: 1px dashed #e2e8f0;'>");
				sb.Append($"<p style='margin: 0; font-size: 13px; color: #475569; line-height: 1.5;'>{System.Net.WebUtility.HtmlEncode(texto)}</p>");
				sb.Append("</td></tr>");
			}

			sb.Append("</table>");
			return sb.ToString();
		}

		private static CResult Error(string message)
		{
			return new CResult
			{
				Data = null,
				Result = false,
				ErrorCode = -1,
				ErrorMessage = message,
				ErrorSource = "[GEN_NOTIFICACIONService]",
				RowsAffected = 0
			};
		}
	}
}
