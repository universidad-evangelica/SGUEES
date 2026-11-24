using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Services;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	/// <summary>
	/// Reglas de negocio del movimiento de personal (CRUD + Autoriza + lookups).
	/// </summary>
	public class SC_MOVIMIENTO_PERSONALService : ISC_MOVIMIENTO_PERSONALService
	{
		private const string CodigoOpcionMenuMovimiento = "SC_MOVIMIENTO_PERSONAL";

		private readonly ISC_MOVIMIENTO_PERSONALRepository _repo;
		private readonly IGEN_NOTIFICACIONService _notificacion;

		public SC_MOVIMIENTO_PERSONALService(
			ISC_MOVIMIENTO_PERSONALRepository repo,
			IGEN_NOTIFICACIONService notificacion)
		{
			_repo = repo;
			_notificacion = notificacion ?? throw new ArgumentNullException(nameof(notificacion));
		}

		/// <summary>
		/// Listado filtrado: creador; jefe TH ve todos; jefe no-TH por unidad de requisición
		/// (origen REQUISICION) o CORR_UNIDAD_ACTUAL (origen DIRECTO). CRUD lo define SEG.
		/// </summary>
		public async Task<CResult> GetAllAsync(SC_MOVIMIENTO_PERSONALParam xWhere)
		{
			var login = (xWhere?.LOGIN_SISTEMA ?? string.Empty).Trim();
			if (string.IsNullOrEmpty(login))
			{
				return new CResult
				{
					Data = new List<SC_MOVIMIENTO_PERSONALView>(),
					Result = true,
					RowsAffected = 0,
					CodeHelper = 0,
					ErrorCode = 0,
					ErrorMessage = "",
					ErrorSource = "",
				};
			}

			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "LOGIN_SISTEMA", Value = login, DbType = System.Data.DbType.String },
			};

			return await _repo.GetAllVisibleAsync(p);
		}

		public async Task<CResult> GetAsync(SC_MOVIMIENTO_PERSONALParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_MOVIMIENTO_PERSONAL", Value = xWhere.CORR_MOVIMIENTO_PERSONAL, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(SC_MOVIMIENTO_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var validacion = ValidarNegocio(Data, esAlta: true);
			if (validacion != null)
			{
				return validacion;
			}

			NormalizarAlta(Data);
			var creado = await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
			if (creado.Result && EsBorrador(Data.ESTADO_MOVIMIENTO))
			{
				var corr = 0;
				if (creado.CodeHelper != null)
				{
					corr = Convert.ToInt32(creado.CodeHelper);
				}
				if (corr <= 0 && creado.Data is SC_MOVIMIENTO_PERSONALView alta)
				{
					corr = alta.CORR_MOVIMIENTO_PERSONAL;
				}

				if (corr > 0)
				{
					await _repo.RegistrarBitacoraDocumentoAsync(
						Data.CORR_EMPRESA,
						corr,
						vLOGIN_SISTEMA,
						vESTACION,
						"Borrador",
						"Se registró el movimiento de personal.");

					try
					{
						await NotificarCreacionMovimientoAsync(Data.CORR_EMPRESA, corr, vLOGIN_SISTEMA);
					}
					catch
					{
						// Creación persistida: la notificación no debe revertir ni bloquear el alta.
					}
				}
			}

			return creado;
		}

		public async Task<CResult> UpdateAsync(SC_MOVIMIENTO_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			/* Estado real desde BD (no confiar en el body del cliente). */
			var actual = await GetAsync(new SC_MOVIMIENTO_PERSONALParam
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_MOVIMIENTO_PERSONAL = Data.CORR_MOVIMIENTO_PERSONAL,
			});

			if (actual.Data is not SC_MOVIMIENTO_PERSONALView row)
			{
				return ValidationError("No se encontró el movimiento a modificar.");
			}

			Data.ESTADO_MOVIMIENTO = row.ESTADO_MOVIMIENTO;
			Data.ORIGEN_MOVIMIENTO = row.ORIGEN_MOVIMIENTO;

			var validacion = ValidarNegocio(Data, esAlta: false);
			if (validacion != null)
			{
				return validacion;
			}

			var actualizado = await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
			if (actualizado.Result && EsBorrador(row.ESTADO_MOVIMIENTO))
			{
				await _repo.RegistrarBitacoraDocumentoAsync(
					Data.CORR_EMPRESA,
					Data.CORR_MOVIMIENTO_PERSONAL,
					vLOGIN_SISTEMA,
					vESTACION,
					"Borrador",
					"Se actualizó el movimiento en Borrador.");
			}

			return actualizado;
		}

		public async Task<CResult> DeleteAsync(SC_MOVIMIENTO_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			/* Solo se elimina en Borrador. */
			var actual = await GetAsync(new SC_MOVIMIENTO_PERSONALParam
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_MOVIMIENTO_PERSONAL = Data.CORR_MOVIMIENTO_PERSONAL,
			});

			if (actual.Data is SC_MOVIMIENTO_PERSONALView row
				&& !string.Equals(row.ESTADO_MOVIMIENTO, "DI", System.StringComparison.OrdinalIgnoreCase))
			{
				return ValidationError("Solo se puede eliminar un movimiento en estado Borrador.");
			}

			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> AutorizaAsync(SC_MOVIMIENTO_PERSONAL_AUTORIZAParam Data, string vLOGIN_SISTEMA)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos para autorizar el movimiento.");
			}

			if (Data.CORR_EMPRESA <= 0)
			{
				return ValidationError("No se pudo identificar la empresa de la sesión.");
			}

			if (Data.CORR_MOVIMIENTO_PERSONAL <= 0)
			{
				return ValidationError("Debe indicar el movimiento de personal.");
			}

			if (Data.OPERACION < 1 || Data.OPERACION > 5)
			{
				return ValidationError("Operación inválida. Use 1=GUARDAR, 2=ENVIAR, 3=APROBAR, 4=DEVOLVER, 5=RECHAZAR.");
			}

			if (string.IsNullOrWhiteSpace(Data.OBSERVACION))
			{
				return ValidationError("El comentario / observación es obligatorio.");
			}

			if (string.IsNullOrWhiteSpace(vLOGIN_SISTEMA))
			{
				return ValidationError("No se pudo identificar el usuario de sesión.");
			}

			var actual = await GetAsync(new SC_MOVIMIENTO_PERSONALParam
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_MOVIMIENTO_PERSONAL = Data.CORR_MOVIMIENTO_PERSONAL,
			});
			if (!actual.Result || actual.Data is not SC_MOVIMIENTO_PERSONALView row)
			{
				return ValidationError("No se encontró el movimiento de personal.");
			}

			var origen = (row.ORIGEN_MOVIMIENTO ?? string.Empty).Trim().ToUpperInvariant();
			var tipo = (row.TIPO_MOVIMIENTO ?? string.Empty).Trim().ToUpperInvariant();
			if (origen != "DIRECTO" || (tipo != "ASCENSO" && tipo != "TRASLADO"))
			{
				return ValidationError("Solo ascenso y traslado creados desde cero entran al flujo de aprobación.");
			}

			Data.OBSERVACION = Data.OBSERVACION.Trim();
			if (Data.OPERACION == 1 || Data.OPERACION == 2)
			{
				var unidad = await _repo.ResolverUnidadDocumentoAsync(
					Data.CORR_EMPRESA,
					Data.CORR_MOVIMIENTO_PERSONAL,
					vLOGIN_SISTEMA.Trim());
				if (unidad <= 0)
				{
					return ValidationError("No se encontró la unidad del puesto del solicitante. El flujo la usa para ubicar los niveles de aprobación.");
				}

				Data.CORR_UNIDAD_DOCUMENTO = unidad;
			}
			else
			{
				/* Aprobar, devolver y rechazar usan el puesto del solicitante guardado en la instancia. */
				Data.CORR_UNIDAD_DOCUMENTO = null;
			}

			var login = vLOGIN_SISTEMA.Trim();
			var resultado = await _repo.AutorizaAsync(Data, login);
			if (!resultado.Result || Data.OPERACION < 2 || Data.OPERACION > 5)
			{
				return resultado;
			}

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
		/// Procesar requiere pertenecer a Talento Humano según el organigrama.
		/// Confirmar permite TH y actores autorizados de la requisición.
		/// DIRECTO: solo si ESTADO_MOVIMIENTO = AP.
		/// </summary>
		public async Task<CResult> ProcesarAsync(
			SC_MOVIMIENTO_PERSONAL_PROCESAParam Data,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			if (Data == null)
				return ValidationError("No se recibieron datos para procesar el movimiento.");
			if (Data.CORR_EMPRESA <= 0)
				return ValidationError("No se pudo identificar la empresa de la sesión.");
			if (Data.CORR_MOVIMIENTO_PERSONAL <= 0)
				return ValidationError("Debe indicar el movimiento de personal.");
			if (!Data.FECHA_EFECTIVA.HasValue || Data.FECHA_EFECTIVA.Value.Year < 1753)
				return ValidationError("Debe indicar la fecha efectiva antes de procesar.");

			var actual = await GetAsync(new SC_MOVIMIENTO_PERSONALParam
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_MOVIMIENTO_PERSONAL = Data.CORR_MOVIMIENTO_PERSONAL,
			});
			if (actual.Data is not SC_MOVIMIENTO_PERSONALView row)
				return ValidationError("No se encontró el movimiento a procesar.");
			if (!await PuedeProcesarAsync(Data.CORR_EMPRESA, Data.CORR_MOVIMIENTO_PERSONAL, vLOGIN_SISTEMA))
				return ValidationError("Solo Talento Humano puede procesar o confirmar movimientos de personal.");
			if (row.CONFIRMADO == 1)
				return ValidationError("El movimiento ya está procesado.");
			if (row.CONFIRMADO == 2)
				return ValidationError("El movimiento ya está confirmado.");

			var resultado = await _repo.ProcesarAsync(new SC_MOVIMIENTO_PERSONALTable
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_MOVIMIENTO_PERSONAL = Data.CORR_MOVIMIENTO_PERSONAL,
				FECHA_EFECTIVA = Data.FECHA_EFECTIVA.Value.Date,
				CONFIRMADO = 1,
				USUARIO_ACTU = vLOGIN_SISTEMA,
				ESTACION_ACTU = vESTACION,
				FECHA_ACTU = DateTime.Now,
			}, vLOGIN_SISTEMA, vESTACION);
			return resultado;
		}

		public Task<CResult> ConfirmarAsync(
			SC_MOVIMIENTO_PERSONAL_CONFIRMAParam Data,
			string vLOGIN_SISTEMA,
			string vESTACION) =>
			ConfirmarInternoAsync(Data, vLOGIN_SISTEMA, vESTACION, desdeBandejaTH: false);

		public Task<CResult> ConfirmarDesdeBandejaTHAsync(
			SC_MOVIMIENTO_PERSONAL_CONFIRMAParam Data,
			string vLOGIN_SISTEMA,
			string vESTACION) =>
			ConfirmarInternoAsync(Data, vLOGIN_SISTEMA, vESTACION, desdeBandejaTH: true);

		private async Task<CResult> ConfirmarInternoAsync(
			SC_MOVIMIENTO_PERSONAL_CONFIRMAParam Data,
			string vLOGIN_SISTEMA,
			string vESTACION,
			bool desdeBandejaTH)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos para confirmar el movimiento.");
			}

			if (Data.CORR_EMPRESA <= 0)
			{
				return ValidationError("No se pudo identificar la empresa de la sesión.");
			}

			if (Data.CORR_MOVIMIENTO_PERSONAL <= 0)
			{
				return ValidationError("Debe indicar el movimiento de personal.");
			}

			if (!Data.FECHA_EFECTIVA.HasValue || Data.FECHA_EFECTIVA.Value.Year < 1753)
			{
				return ValidationError("Debe indicar la fecha efectiva para confirmar el movimiento.");
			}
			if (!Data.FECHA_INGRESO_PROPUESTA.HasValue || Data.FECHA_INGRESO_PROPUESTA.Value.Year < 1753)
			{
				return ValidationError("Debe indicar la fecha de ingreso propuesta.");
			}

			if (string.IsNullOrWhiteSpace(vLOGIN_SISTEMA))
			{
				return ValidationError("No se pudo identificar el usuario de sesión.");
			}

			var actual = await GetAsync(new SC_MOVIMIENTO_PERSONALParam
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_MOVIMIENTO_PERSONAL = Data.CORR_MOVIMIENTO_PERSONAL,
			});

			if (actual.Data is not SC_MOVIMIENTO_PERSONALView row)
			{
				return ValidationError("No se encontró el movimiento a confirmar.");
			}
			var puedeConfirmar = desdeBandejaTH
				? await PuedeProcesarAsync(Data.CORR_EMPRESA, Data.CORR_MOVIMIENTO_PERSONAL, vLOGIN_SISTEMA)
				: await PuedeConfirmarAsync(
					Data.CORR_EMPRESA,
					Data.CORR_MOVIMIENTO_PERSONAL,
					vLOGIN_SISTEMA,
					row.ORIGEN_MOVIMIENTO);
			if (!puedeConfirmar)
				return ValidationError("No tiene permisos para confirmar este movimiento.");

			if (row.CONFIRMADO == 2)
			{
				return ValidationError("El movimiento ya está confirmado.");
			}
			if (row.CONFIRMADO != 1)
			{
				return ValidationError("Primero debe procesar el movimiento personal.");
			}

			var origen = (row.ORIGEN_MOVIMIENTO ?? string.Empty).Trim().ToUpperInvariant();
			var estado = (row.ESTADO_MOVIMIENTO ?? string.Empty).Trim().ToUpperInvariant();

			if (origen == "DIRECTO" && estado != "AP")
			{
				return ValidationError(
					"Los movimientos creados desde cero solo se pueden confirmar cuando están en estado Aprobado.");
			}
			if (desdeBandejaTH && estado != "AP")
			{
				return ValidationError("Solo se pueden confirmar movimientos de personal aprobados.");
			}

			if (origen != "DIRECTO" && origen != "REQUISICION")
			{
				return ValidationError("Origen de movimiento no válido para confirmar.");
			}

			if (origen == "REQUISICION")
			{
				if (!desdeBandejaTH)
				{
					var autorizado = await _repo.PuedeEjecutarConfirmacionRequisicionAsync(
						Data.CORR_EMPRESA,
						Data.CORR_MOVIMIENTO_PERSONAL,
						vLOGIN_SISTEMA);
					if (!autorizado)
					{
						return ValidationError(
							"Solo el creador de la requisición, su jefe inmediato o un usuario de Gerencia General puede ejecutar este movimiento.");
					}
				}

				var ligada = await GetRequisicionAsociadaAsync(new SC_MOVIMIENTO_PERSONALParam
				{
					CORR_EMPRESA = Data.CORR_EMPRESA,
					CORR_MOVIMIENTO_PERSONAL = Data.CORR_MOVIMIENTO_PERSONAL,
				});

				if (ligada.Data is SC_MOVIMIENTO_REQUISICION_CARDView card
					&& card.CORR_TIPO_CONTRATACION == 2)
				{
					// Qué hace: Si viene la fecha de ingreso propuesta desde el modal, se registra y calcula la finalización.
					// Cómo lo hace: Invoca RegistrarFechaIngresoAsync con la fecha enviada antes de proceder con la confirmación.
					if (Data.FECHA_INGRESO_PROPUESTA.HasValue && Data.FECHA_INGRESO_PROPUESTA.Value.Year >= 1753)
					{
						var regIngreso = await RegistrarFechaIngresoAsync(new SC_MOVIMIENTO_FECHA_INGRESOParam
						{
							CORR_EMPRESA = Data.CORR_EMPRESA,
							CORR_MOVIMIENTO_PERSONAL = Data.CORR_MOVIMIENTO_PERSONAL,
							FECHA_INGRESO_PROPUESTA = Data.FECHA_INGRESO_PROPUESTA.Value.Date,
						}, vLOGIN_SISTEMA, vESTACION);

						if (!regIngreso.Result)
						{
							return regIngreso;
						}
					}
					else if (!row.FECHA_INGRESO_PROPUESTA.HasValue)
					{
						return ValidationError(
							"Registre la fecha de ingreso propuesta para calcular la fecha de finalización antes de confirmar.");
					}
				}
			}

			var ahora = System.DateTime.Now;
			var data = new SC_MOVIMIENTO_PERSONALTable
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_MOVIMIENTO_PERSONAL = Data.CORR_MOVIMIENTO_PERSONAL,
				FECHA_EFECTIVA = Data.FECHA_EFECTIVA.Value.Date,
				FECHA_INGRESO_PROPUESTA = Data.FECHA_INGRESO_PROPUESTA.Value.Date,
				CONFIRMADO = 2,
				USUARIO_CONFIRMA = vLOGIN_SISTEMA.Trim(),
				FECHA_CONFIRMA = ahora,
				USUARIO_ACTU = vLOGIN_SISTEMA.Trim(),
				ESTACION_ACTU = vESTACION ?? string.Empty,
				FECHA_ACTU = ahora,
			};

			var login = vLOGIN_SISTEMA.Trim();
			var resultado = await _repo.ConfirmarAsync(data, login, vESTACION ?? string.Empty);
			if (!resultado.Result)
			{
				return resultado;
			}

			try
			{
				await NotificarDesdeConfirmarAsync(row, login, Data.FECHA_EFECTIVA.Value.Date);
			}
			catch
			{
				// Confirmación ya persistida.
			}

			return resultado;
		}

		public async Task<CResult> GetBitacoraAsync(SC_MOVIMIENTO_PERSONAL_BITACORAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_TIPO_DOCUMENTO", Value = xWhere.CORR_TIPO_DOCUMENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DOCUMENTO", Value = xWhere.CORR_MOVIMIENTO_PERSONAL, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAllAsyncBitacora(p);
		}

		public async Task<CResult> GetUnidadesUsuarioAsync(SC_MOVIMIENTO_PERSONALParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "LOGIN_SISTEMA", Value = xWhere.LOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
			};

			return await _repo.GetUnidadesUsuarioAsync(p);
		}

		public async Task<CResult> GetPuestosByUnidadAsync(SC_MOVIMIENTO_PERSONALParam xWhere)
		{
			if (xWhere.CORR_UNIDAD <= 0)
			{
				return new CResult
				{
					Data = new List<SC_MOVIMIENTO_LOOKUP_PUESTOView>(),
					Result = true,
					RowsAffected = 0,
					ErrorCode = 0,
				};
			}

			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_UNIDAD", Value = xWhere.CORR_UNIDAD, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetPuestosByUnidadAsync(p);
		}

		public async Task<CResult> GetModalidadesAsync(SC_MOVIMIENTO_PERSONALParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetModalidadesAsync(p);
		}

		public async Task<CResult> GetEmpleadosAsync(SC_MOVIMIENTO_PERSONALParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetEmpleadosAsync(p);
		}

		public async Task<CResult> GetRequisicionAsociadaAsync(SC_MOVIMIENTO_PERSONALParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_MOVIMIENTO_PERSONAL", Value = xWhere.CORR_MOVIMIENTO_PERSONAL, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetRequisicionAsociadaAsync(p);
		}

		public async Task<CResult> RegistrarFechaIngresoAsync(
			SC_MOVIMIENTO_FECHA_INGRESOParam Data,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			if (Data == null || Data.CORR_MOVIMIENTO_PERSONAL <= 0)
			{
				return ValidationError("Debe indicar el movimiento de personal.");
			}

			var actual = await GetAsync(new SC_MOVIMIENTO_PERSONALParam
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_MOVIMIENTO_PERSONAL = Data.CORR_MOVIMIENTO_PERSONAL,
			});

			if (actual.Data is not SC_MOVIMIENTO_PERSONALView row)
			{
				return ValidationError("No se encontró el movimiento.");
			}

			if (row.CONFIRMADO == 2)
			{
				return ValidationError("El movimiento ya está confirmado.");
			}

			if (!string.Equals(row.ORIGEN_MOVIMIENTO, "REQUISICION", StringComparison.OrdinalIgnoreCase))
			{
				return ValidationError("La fecha de ingreso propuesta solo se calcula en movimientos de requisición.");
			}

			var ligada = await GetRequisicionAsociadaAsync(new SC_MOVIMIENTO_PERSONALParam
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_MOVIMIENTO_PERSONAL = Data.CORR_MOVIMIENTO_PERSONAL,
			});

			if (ligada.Data is not SC_MOVIMIENTO_REQUISICION_CARDView card || card.CORR_TIPO_CONTRATACION != 2)
			{
				return ValidationError("La fecha de finalización solo aplica a contratación eventual.");
			}

			DateTime? ingreso = null;
			DateTime? fin = null;
			if (Data.FECHA_INGRESO_PROPUESTA.HasValue && Data.FECHA_INGRESO_PROPUESTA.Value.Year >= 1753)
			{
				if (card.TIEMPO_CONTRATO <= 0)
				{
					return ValidationError("La requisición eventual no tiene meses de contrato para calcular la fecha de finalización.");
				}

				ingreso = Data.FECHA_INGRESO_PROPUESTA.Value.Date;
				fin = ingreso.Value.AddMonths(card.TIEMPO_CONTRATO);
			}

			var ahora = DateTime.Now;
			return await _repo.RegistrarFechaIngresoAsync(new SC_MOVIMIENTO_PERSONALTable
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_MOVIMIENTO_PERSONAL = Data.CORR_MOVIMIENTO_PERSONAL,
				FECHA_INGRESO_PROPUESTA = ingreso,
				FECHA_FINALIZACION = fin,
				USUARIO_ACTU = vLOGIN_SISTEMA,
				ESTACION_ACTU = vESTACION,
				FECHA_ACTU = ahora,
			});
		}

		private static bool EsBorrador(string estado)
		{
			return string.Equals((estado ?? string.Empty).Trim(), "DI", System.StringComparison.OrdinalIgnoreCase);
		}

		/// <summary>Defaults al crear: origen DIRECTO, estado DI.</summary>
		private static void NormalizarAlta(SC_MOVIMIENTO_PERSONALTable Data)
		{
			if (string.IsNullOrWhiteSpace(Data.ORIGEN_MOVIMIENTO))
			{
				Data.ORIGEN_MOVIMIENTO = "DIRECTO";
			}

			Data.ORIGEN_MOVIMIENTO = Data.ORIGEN_MOVIMIENTO.Trim().ToUpperInvariant();
			Data.TIPO_MOVIMIENTO = (Data.TIPO_MOVIMIENTO ?? "PERMANENTE").Trim().ToUpperInvariant();

			/* Desde requisición nace aprobado; desde cero nace en borrador. */
			if (Data.ORIGEN_MOVIMIENTO == "REQUISICION")
			{
				Data.ESTADO_MOVIMIENTO = "AP";
			}
			else
			{
				Data.ESTADO_MOVIMIENTO = "DI";
			}

			Data.CONFIRMADO = 0;
			Data.USUARIO_CONFIRMA = null;
			Data.FECHA_CONFIRMA = null;
			/* FECHA_EFECTIVA se asigna al Confirmar (TH), no en el alta. */

			if (Data.FECHA_ELABORACION.Year < 1753)
			{
				Data.FECHA_ELABORACION = System.DateTime.Today;
			}
		}

		private static CResult ValidarNegocio(SC_MOVIMIENTO_PERSONALTable Data, bool esAlta)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos del movimiento.");
			}

			if (string.IsNullOrWhiteSpace(Data.NOMBRE_COMPLETO))
			{
				return ValidationError("Debe indicar el nombre completo.");
			}

			var origen = (Data.ORIGEN_MOVIMIENTO ?? "DIRECTO").Trim().ToUpperInvariant();
			if (origen == "DIRECTO" && (!Data.CORR_EMPLEADO.HasValue || Data.CORR_EMPLEADO.Value <= 0))
			{
				return ValidationError("Debe seleccionar el empleado del movimiento.");
			}

			var tipo = (Data.TIPO_MOVIMIENTO ?? string.Empty).Trim().ToUpperInvariant();
			if (tipo is not ("PERMANENTE" or "EVENTUAL" or "ASCENSO" or "TRASLADO"))
			{
				return ValidationError("Tipo de movimiento inválido. Use PERMANENTE, EVENTUAL, ASCENSO o TRASLADO.");
			}

			if (!Data.CORR_UNIDAD_PROPUESTA.HasValue || Data.CORR_UNIDAD_PROPUESTA.Value <= 0)
			{
				return ValidationError("Debe indicar la unidad / departamento propuesto.");
			}

			if (!Data.CORR_PUESTO_PROPUESTO.HasValue || Data.CORR_PUESTO_PROPUESTO.Value <= 0)
			{
				return ValidationError("Debe indicar el cargo / puesto propuesto.");
			}

			if (Data.SALARIO_PROPUESTO.HasValue && Data.SALARIO_PROPUESTO.Value < 0)
			{
				return ValidationError("El salario propuesto no puede ser negativo.");
			}

			/* Fecha de finalización solo en requisición con contratación eventual (tipo 2). */
			var muestraFechaFinalizacion = origen == "REQUISICION" && Data.CORR_TIPO_CONTRATACION == 2;
			if (muestraFechaFinalizacion)
			{
				if (!Data.FECHA_FINALIZACION.HasValue)
				{
					return ValidationError("En contratación eventual debe indicar la fecha de finalización.");
				}

				if (Data.FECHA_INGRESO_PROPUESTA.HasValue
					&& Data.FECHA_FINALIZACION.Value.Date < Data.FECHA_INGRESO_PROPUESTA.Value.Date)
				{
					return ValidationError("La fecha de finalización no puede ser anterior a la de ingreso propuesta.");
				}
			}
			else
			{
				Data.FECHA_FINALIZACION = null;
			}

			if (tipo is "ASCENSO" or "TRASLADO")
			{
				if (!Data.CORR_UNIDAD_ACTUAL.HasValue || Data.CORR_UNIDAD_ACTUAL.Value <= 0
					|| !Data.CORR_PUESTO_ACTUAL.HasValue || Data.CORR_PUESTO_ACTUAL.Value <= 0)
				{
					return ValidationError("En ascenso o traslado debe indicar la posición actual (unidad y puesto).");
				}
			}

			if (!esAlta)
			{
				var estado = (Data.ESTADO_MOVIMIENTO ?? "DI").Trim().ToUpperInvariant();
				if (estado is not ("DI" or "OB"))
				{
					return ValidationError("Solo se puede modificar un movimiento en Borrador o Devuelto.");
				}
			}

			return null;
		}

		public Task<CResult> GetAccionesFlujoAsync(int corrEmpresa, int corrMovimiento, string login)
		{
			return _repo.GetAccionesFlujoAsync(corrEmpresa, corrMovimiento, login);
		}

		public Task<CResult> GetAccionesBandejaTHAsync(int corrEmpresa, int corrMovimiento, string login)
		{
			return _repo.GetAccionesBandejaTHAsync(corrEmpresa, corrMovimiento, login);
		}

		private async Task<SC_MOVIMIENTO_PERSONAL_ACCIONESView> ObtenerPermisosMovimientoAsync(
			int corrEmpresa,
			int corrMovimiento,
			string login)
		{
			var acciones = await _repo.GetAccionesFlujoAsync(corrEmpresa, corrMovimiento, login);
			return acciones?.Data as SC_MOVIMIENTO_PERSONAL_ACCIONESView;
		}

		private async Task<bool> PuedeProcesarAsync(int corrEmpresa, int corrMovimiento, string login)
		{
			var acciones = await _repo.GetAccionesBandejaTHAsync(corrEmpresa, corrMovimiento, login);
			var permisos = acciones?.Data as SC_MOVIMIENTO_PERSONAL_ACCIONESView;
			return permisos?.PUEDE_PROCESAR == true;
		}

		private async Task<bool> PuedeConfirmarAsync(
			int corrEmpresa,
			int corrMovimiento,
			string login,
			string origenMovimiento)
		{
			var permisos = await ObtenerPermisosMovimientoAsync(corrEmpresa, corrMovimiento, login);
			if (permisos == null) return false;
			if (permisos.PUEDE_PROCESAR) return true;

			return string.Equals(
					origenMovimiento?.Trim(),
					"REQUISICION",
					System.StringComparison.OrdinalIgnoreCase)
				&& permisos.PUEDE_CONFIRMAR;
		}

		public Task<CResult> GetPendientesActorAsync(List<CParameter> xWhere)
		{
			return _repo.GetPendientesActorAsync(xWhere);
		}

		public Task<int> CountPendientesActorAsync(int corrEmpresa, string login)
		{
			return _repo.CountPendientesActorAsync(corrEmpresa, login);
		}

		// Qué hace: invoca la contratación del candidato a empleado.
		// Cómo lo hace: delega la ejecución del SP al repositorio; si OK, notifica al creador.
		public async Task<CResult> ContratarEmpleadoAsync(SC_MOVIMIENTO_PERSONALParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var login = (vLOGIN_SISTEMA ?? string.Empty).Trim();
			SC_MOVIMIENTO_PERSONALView previo = null;
			if (Data != null && Data.CORR_EMPRESA > 0 && Data.CORR_MOVIMIENTO_PERSONAL > 0)
			{
				var actual = await GetAsync(new SC_MOVIMIENTO_PERSONALParam
				{
					CORR_EMPRESA = Data.CORR_EMPRESA,
					CORR_MOVIMIENTO_PERSONAL = Data.CORR_MOVIMIENTO_PERSONAL,
				});
				previo = actual.Data as SC_MOVIMIENTO_PERSONALView;
			}

			if (previo != null
				&& string.Equals(previo.ORIGEN_MOVIMIENTO?.Trim(), "REQUISICION", StringComparison.OrdinalIgnoreCase))
			{
				var autorizado = await _repo.PuedeEjecutarConfirmacionRequisicionAsync(
					Data.CORR_EMPRESA,
					Data.CORR_MOVIMIENTO_PERSONAL,
					login);
				if (!autorizado)
				{
					return ValidationError(
						"Solo el creador de la requisición, su jefe inmediato o un usuario de Gerencia General puede ejecutar este movimiento.");
				}
			}

			var resultado = await _repo.ContratarEmpleadoAsync(Data, vLOGIN_SISTEMA, vESTACION);
			if (!resultado.Result || previo == null)
			{
				return resultado;
			}

			try
			{
				await NotificarDesdeContratarAsync(previo, login);
			}
			catch
			{
				// Contratación ya persistida.
			}
			return resultado;
		}

		private async Task NotificarCreacionMovimientoAsync(
			int corrEmpresa,
			int corrMovimiento,
			string loginActor)
		{
			var actual = await GetAsync(new SC_MOVIMIENTO_PERSONALParam
			{
				CORR_EMPRESA = corrEmpresa,
				CORR_MOVIMIENTO_PERSONAL = corrMovimiento,
			});
			if (actual.Data is not SC_MOVIMIENTO_PERSONALView row)
			{
				return;
			}

			var logins = await _repo.GetLoginsJefesUnidadMovimientoAsync(corrEmpresa, corrMovimiento);
			var destinatarios = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

			foreach (var login in logins ?? Enumerable.Empty<string>())
			{
				if (!string.IsNullOrWhiteSpace(login))
				{
					destinatarios.Add(login.Trim());
				}
			}

			if (!string.IsNullOrWhiteSpace(row.USUARIO_CREA))
			{
				destinatarios.Add(row.USUARIO_CREA.Trim());
			}

			if (destinatarios.Count == 0)
			{
				return;
			}

			var nombre = string.IsNullOrWhiteSpace(row.NOMBRE_COMPLETO) ? "la persona" : row.NOMBRE_COMPLETO.Trim();
			var unidad = string.IsNullOrWhiteSpace(row.NOMBRE_UNIDAD_ACTUAL)
				? (string.IsNullOrWhiteSpace(row.NOMBRE_UNIDAD_PROPUESTA) ? "la unidad" : row.NOMBRE_UNIDAD_PROPUESTA.Trim())
				: row.NOMBRE_UNIDAD_ACTUAL.Trim();
			var titulo = $"Movimiento de personal #{corrMovimiento} - Creado";
			var mensaje = $"Se creó el movimiento de personal para {nombre}. Unidad: {unidad}.";

			foreach (var loginDestino in destinatarios)
			{
				var urlDestino = await _notificacion.ResolverUrlBandejaTareaAsync(
					corrEmpresa,
					loginDestino,
					corrMovimiento,
					"MOVIMIENTO");

				await _notificacion.NotificarUsuarioAsync(
					corrEmpresa: corrEmpresa,
					loginDestino: loginDestino,
					titulo: titulo,
					mensaje: mensaje,
					urlDestino: urlDestino,
					usuarioCrea: loginActor,
					estacionCrea: "API");
			}
		}

		/// <summary>
		/// Riel flujo (DIRECTO): mismo patrón que requisición — pendientes / creador.
		/// </summary>
		private async Task NotificarDesdeFlujoAsync(SC_MOVIMIENTO_PERSONAL_AUTORIZAParam data, string loginActor)
		{
			var dto = await _repo.GetContextoNotificacionFlujoAsync(
				data.CORR_EMPRESA,
				data.CORR_MOVIMIENTO_PERSONAL);

			if (dto == null)
			{
				return;
			}

			var corrMov = dto.CORR_MOVIMIENTO_PERSONAL > 0
				? dto.CORR_MOVIMIENTO_PERSONAL
				: data.CORR_MOVIMIENTO_PERSONAL;

			var nombreTipo = string.IsNullOrWhiteSpace(dto.NOMBRE_TIPO)
				? "Movimiento de personal"
				: dto.NOMBRE_TIPO.Trim();
			var nombreEstado = string.IsNullOrWhiteSpace(dto.NOMBRE_ESTADO)
				? "Actualización de flujo"
				: dto.NOMBRE_ESTADO.Trim();
			var titulo = $"{nombreTipo} #{corrMov} - {nombreEstado}";
			var mensaje = string.IsNullOrWhiteSpace(dto.DESCRIPCION_ESTADO)
				? $"El movimiento No.{corrMov} cambió a estado {nombreEstado}."
				: dto.DESCRIPCION_ESTADO.Trim();

			var destinatarios = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
			var creador = dto.LOGIN_CREADOR?.Trim();

			if (data.OPERACION == 4 || data.OPERACION == 5)
			{
				if (!string.IsNullOrWhiteSpace(creador))
				{
					destinatarios.Add(creador);
				}
			}
			else
			{
				foreach (var loginPendiente in dto.LOGINS_PENDIENTES ?? Enumerable.Empty<string>())
				{
					if (!string.IsNullOrWhiteSpace(loginPendiente))
					{
						destinatarios.Add(loginPendiente.Trim());
					}
				}

				if (destinatarios.Count == 0 && !string.IsNullOrWhiteSpace(creador))
				{
					destinatarios.Add(creador);
				}
			}

			destinatarios.Remove(loginActor);
			if (destinatarios.Count == 0)
			{
				return;
			}

			// Acción de flujo → bandeja según unidad del receptor.
			foreach (var loginDestino in destinatarios)
			{
				var urlDestino = await _notificacion.ResolverUrlBandejaTareaAsync(
					data.CORR_EMPRESA,
					loginDestino,
					corrMov,
					"MOVIMIENTO");

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

		/// <summary>
		/// Acción: TH confirma → avisa al creador del movimiento (jefe que dictaminó APLICA o solicitante DIRECTO).
		/// </summary>
		private async Task NotificarDesdeConfirmarAsync(
			SC_MOVIMIENTO_PERSONALView row,
			string loginActor,
			DateTime fechaEfectiva)
		{
			var creador = row.USUARIO_CREA?.Trim();
			if (string.IsNullOrWhiteSpace(creador)
				|| string.Equals(creador, loginActor, StringComparison.OrdinalIgnoreCase))
			{
				return;
			}

			var corr = row.CORR_MOVIMIENTO_PERSONAL;
			var nombre = string.IsNullOrWhiteSpace(row.NOMBRE_COMPLETO) ? "persona" : row.NOMBRE_COMPLETO.Trim();
			var titulo = $"Movimiento personal #{corr} - Confirmado";
			var mensaje = $"TH confirmó el movimiento de {nombre} (fecha efectiva {fechaEfectiva:dd/MM/yyyy}).";

			var urlDestino = await ResolverUrlDestinoMovimientoAsync(row.CORR_EMPRESA, creador, corr);

			await _notificacion.NotificarUsuarioAsync(
				corrEmpresa: row.CORR_EMPRESA,
				loginDestino: creador,
				titulo: titulo,
				mensaje: mensaje,
				urlDestino: urlDestino,
				usuarioCrea: loginActor,
				estacionCrea: "API");
		}

		/// <summary>
		/// Acción: Crear Empleado → avisa al creador del movimiento.
		/// </summary>
		private async Task NotificarDesdeContratarAsync(SC_MOVIMIENTO_PERSONALView row, string loginActor)
		{
			var creador = row.USUARIO_CREA?.Trim();
			if (string.IsNullOrWhiteSpace(creador)
				|| string.Equals(creador, loginActor, StringComparison.OrdinalIgnoreCase))
			{
				return;
			}

			var corr = row.CORR_MOVIMIENTO_PERSONAL;
			var nombre = string.IsNullOrWhiteSpace(row.NOMBRE_COMPLETO) ? "persona" : row.NOMBRE_COMPLETO.Trim();
			var titulo = $"Movimiento personal #{corr} - Empleado creado";
			var mensaje = $"Se creó el empleado a partir del movimiento de {nombre}.";

			var urlDestino = await ResolverUrlDestinoMovimientoAsync(row.CORR_EMPRESA, creador, corr);

			await _notificacion.NotificarUsuarioAsync(
				corrEmpresa: row.CORR_EMPRESA,
				loginDestino: creador,
				titulo: titulo,
				mensaje: mensaje,
				urlDestino: urlDestino,
				usuarioCrea: loginActor,
				estacionCrea: "API");
		}

		// Qué hace: Resuelve la pantalla de destino para una notificación de movimiento personal.
		// Cómo lo hace: Si el destinatario pertenece a TH o a una unidad descendiente, usa la bandeja TH con el correlativo; para otros usuarios conserva el formulario del movimiento.
		private async Task<string> ResolverUrlDestinoMovimientoAsync(int corrEmpresa, string loginDestino, int corrMovimiento)
		{
			if (await _notificacion.EsUsuarioThAsync(corrEmpresa, loginDestino))
			{
				return await _notificacion.ResolverUrlBandejaThAsync(corrMovimiento, "MOVIMIENTO");
			}

			var urlDestino = await _notificacion.ResolverUrlDestinoAsync(CodigoOpcionMenuMovimiento, corrMovimiento);
			return string.IsNullOrWhiteSpace(urlDestino)
				? $"/sc-movimiento-personal?corr={corrMovimiento}"
				: urlDestino;
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
				ErrorSource = "SC_MOVIMIENTO_PERSONALService",
			};
		}
	}
}
