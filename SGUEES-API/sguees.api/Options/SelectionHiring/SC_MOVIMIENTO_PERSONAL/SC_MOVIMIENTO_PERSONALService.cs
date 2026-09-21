using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	/// <summary>
	/// Reglas de negocio del movimiento de personal (CRUD + Autoriza + lookups).
	/// </summary>
	public class SC_MOVIMIENTO_PERSONALService : ISC_MOVIMIENTO_PERSONALService
	{
		private readonly ISC_MOVIMIENTO_PERSONALRepository _repo;

		public SC_MOVIMIENTO_PERSONALService(ISC_MOVIMIENTO_PERSONALRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(SC_MOVIMIENTO_PERSONALParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAllAsync(p);
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
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
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

			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
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

			Data.OBSERVACION = Data.OBSERVACION.Trim();
			return await _repo.AutorizaAsync(Data, vLOGIN_SISTEMA.Trim());
		}

		public async Task<CResult> GetBitacoraAsync(SC_MOVIMIENTO_PERSONAL_BITACORAParam xWhere)
		{
			var p = new List<CParameter>
			{
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
				if (!Data.FECHA_EFECTIVA.HasValue)
				{
					Data.FECHA_EFECTIVA = System.DateTime.Today;
				}
			}
			else
			{
				Data.ESTADO_MOVIMIENTO = "DI";
			}

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

			if (tipo == "EVENTUAL")
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
