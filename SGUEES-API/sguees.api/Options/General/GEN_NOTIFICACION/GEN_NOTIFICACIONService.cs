using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
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

		private readonly IGEN_NOTIFICACIONRepository _repo;
		private readonly INotificationSignalRService _signalR;
		private readonly ISEG_OPCION_SISTEMAService _opcionSistema;
		private readonly ILogger<GEN_NOTIFICACIONService> _logger;

		public GEN_NOTIFICACIONService(
			IGEN_NOTIFICACIONRepository repo,
			INotificationSignalRService signalR,
			ISEG_OPCION_SISTEMAService opcionSistema,
			ILogger<GEN_NOTIFICACIONService> logger)
		{
			_repo = repo ?? throw new ArgumentNullException(nameof(repo));
			_signalR = signalR ?? throw new ArgumentNullException(nameof(signalR));
			_opcionSistema = opcionSistema ?? throw new ArgumentNullException(nameof(opcionSistema));
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

			try
			{
				var resultado = await _opcionSistema.GetAsync(new SEG_OPCION_SISTEMAParam
				{
					CODIGO_OPCION = codigoOpcion.Trim()
				});

				if (!resultado.Result || resultado.Data is not SEG_OPCION_SISTEMAView opcion)
				{
					_logger.LogWarning(
						"[GEN_NOTIFICACION] No se encontró SEG_OPCION_SISTEMA.CODIGO_OPCION={Codigo}",
						codigoOpcion);
					return null;
				}

				return NormalizePath(opcion.URL_OPCION);
			}
			catch (Exception ex)
			{
				_logger.LogWarning(ex,
					"[GEN_NOTIFICACION] Error resolviendo URL_OPCION para CODIGO_OPCION={Codigo}",
					codigoOpcion);
				return null;
			}
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

		/// <summary>Deep link bandeja: {URL}?corr=&amp;tipo= (corr/tipo opcionales).</summary>
		private static string AppendBandejaQuery(string urlOpcion, int? corrDocumento, string tipoDocumento)
		{
			var path = NormalizePath(urlOpcion);
			if (string.IsNullOrWhiteSpace(path))
			{
				return null;
			}

			var parts = new List<string>();
			if (corrDocumento.HasValue && corrDocumento.Value > 0)
			{
				parts.Add($"corr={corrDocumento.Value}");
			}

			if (!string.IsNullOrWhiteSpace(tipoDocumento))
			{
				parts.Add($"tipo={Uri.EscapeDataString(tipoDocumento.Trim())}");
			}

			return parts.Count == 0 ? path : $"{path}?{string.Join("&", parts)}";
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
