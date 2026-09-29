// Qué hace: acceso a datos de puestos asignados al empleado.
// Cómo lo hace: activos en GEN_EMPLEADO_PUESTO; el último periodo cerrado sale del historial. HORARIO_LABORAL siempre NULL.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_EMPLEADO_PUESTORepository
		: BaseRepository<GEN_EMPLEADO_PUESTOTable>,
			IGEN_EMPLEADO_PUESTORepository
	{
		private const string _TableName = "GEN_EMPLEADO_PUESTO";
		private const string _ViewName = "V_GEN_EMPLEADO_PUESTO";
		private const string _TableHistorial = "GEN_EMPLEADO_PUESTO_HISTORIAL";
		private const string _ViewHistorial = "V_GEN_EMPLEADO_PUESTO_HISTORIAL";

		public GEN_EMPLEADO_PUESTORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(int corrEmpleado, int corrEmpresa)
		{
			CResult objResultado = new();

			try
			{
				if (corrEmpresa <= 0 || corrEmpleado <= 0)
				{
					objResultado.Data = new List<GEN_EMPLEADO_PUESTOView>();
					objResultado.Result = true;
					objResultado.ErrorCode = 0;
					return objResultado;
				}

				var activos = await LeerActivosAsync(corrEmpleado, corrEmpresa);
				foreach (var row in activos)
				{
					row.ACTIVO_PUESTO = true;
					row.FECHA_FIN = null;
					row.CORR_EMPLEADO_PUESTO_HISTORIAL = 0;
				}

				var historial = await LeerHistorialAsync(corrEmpleado, corrEmpresa);
				var clavesActivas = new HashSet<string>(activos.Select(x => Clave(x.CORR_UNIDAD, x.CORR_PUESTO)));
				var rows = new List<GEN_EMPLEADO_PUESTOView>(activos);
				rows.AddRange(UltimosInactivos(historial, clavesActivas));

				objResultado.Data = rows;
				objResultado.Result = true;
				objResultado.RowsAffected = rows.Count;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> SaveAllAsync(
			int corrEmpleado,
			List<GEN_EMPLEADO_PUESTOTable> Data,
			int corrEmpresa,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				if (corrEmpresa <= 0)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 4000;
					objResultado.ErrorMessage = "CORR_EMPRESA es requerido.";
					return objResultado;
				}

				if (corrEmpleado <= 0)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 4000;
					objResultado.ErrorMessage = "CORR_EMPLEADO es requerido.";
					return objResultado;
				}

				var fecha = DateTime.Now;
				var items = (Data ?? new List<GEN_EMPLEADO_PUESTOTable>())
					.Where(x => x != null && x.CORR_UNIDAD > 0 && x.CORR_PUESTO > 0)
					.ToList();

				var incompleto = items.Any(x =>
					x.CORR_UNIDAD <= 0 ||
					x.CORR_PUESTO <= 0 ||
					!x.FECHA_INGRESO.HasValue ||
					!x.SUELDO.HasValue ||
					!x.CORR_TIPO_CONTRATACION.HasValue ||
					x.CORR_TIPO_CONTRATACION.Value <= 0 ||
					!x.CORR_TIPO_MODALIDAD.HasValue ||
					x.CORR_TIPO_MODALIDAD.Value <= 0);
				if (incompleto)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 4000;
					objResultado.ErrorMessage = "Complete unidad, puesto, fecha de ingreso, sueldo, tipo de contratación y tipo de modalidad.";
					return objResultado;
				}

				var duplicado = items
					.GroupBy(x => $"{x.CORR_UNIDAD}|{x.CORR_PUESTO}")
					.Any(g => g.Count() > 1);
				if (duplicado)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 4000;
					objResultado.ErrorMessage = "No puede repetir la misma unidad y el mismo puesto.";
					return objResultado;
				}

				var tiposPermanentes = await LeerTiposPermanentesAsync(corrEmpresa);
				var cantidadPermanentes = items.Count(x =>
					x.ACTIVO_PUESTO != false &&
					x.CORR_TIPO_CONTRATACION.HasValue &&
					tiposPermanentes.Contains(x.CORR_TIPO_CONTRATACION.Value));
				if (cantidadPermanentes > 1)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 4000;
					objResultado.ErrorMessage = "El empleado solo puede tener un puesto de tipo permanente.";
					return objResultado;
				}

				var rowsAffected = 0;
				var activosDb = await LeerActivosAsync(corrEmpleado, corrEmpresa);
				var clavesActivasDb = new HashSet<string>(activosDb.Select(x => Clave(x.CORR_UNIDAD, x.CORR_PUESTO)));
				var clavesVisibles = new HashSet<string>(items.Select(x => Clave(x.CORR_UNIDAD, x.CORR_PUESTO)));
				var siguienteHistorial = await GetNextCorrHistorialAsync(corrEmpresa);

				foreach (var item in items)
				{
					var clave = Clave(item.CORR_UNIDAD, item.CORR_PUESTO);
					var quedaActivo = item.ACTIVO_PUESTO != false;
					if (quedaActivo)
					{
						if (clavesActivasDb.Contains(clave))
						{
							rowsAffected += await ActualizarActivoAsync(item, corrEmpleado, corrEmpresa, vLOGIN_SISTEMA, vESTACION, fecha);
						}
						else
						{
							rowsAffected += await InsertarActivoAsync(item, corrEmpleado, corrEmpresa, vLOGIN_SISTEMA, vESTACION, fecha);
						}
					}
					else if (clavesActivasDb.Contains(clave))
					{
						var fin = item.FECHA_FIN?.Date ?? FechaHoyElSalvador();
						rowsAffected += await InsertarHistorialAsync(
							item,
							corrEmpleado,
							corrEmpresa,
							item.FECHA_INGRESO.Value.Date,
							fin,
							siguienteHistorial,
							vLOGIN_SISTEMA,
							vESTACION,
							fecha);
						siguienteHistorial++;
						rowsAffected += await EliminarActivoAsync(corrEmpleado, corrEmpresa, item.CORR_UNIDAD, item.CORR_PUESTO);
					}
					else if (item.CORR_EMPLEADO_PUESTO_HISTORIAL > 0)
					{
						var fin = item.FECHA_FIN?.Date ?? FechaHoyElSalvador();
						rowsAffected += await ActualizarHistorialAsync(
							item,
							corrEmpresa,
							item.FECHA_INGRESO.Value.Date,
							fin,
							vLOGIN_SISTEMA,
							vESTACION,
							fecha);
					}
					else
					{
						var fin = item.FECHA_FIN?.Date ?? FechaHoyElSalvador();
						rowsAffected += await InsertarHistorialAsync(
							item,
							corrEmpleado,
							corrEmpresa,
							item.FECHA_INGRESO.Value.Date,
							fin,
							siguienteHistorial,
							vLOGIN_SISTEMA,
							vESTACION,
							fecha);
						siguienteHistorial++;
					}
				}

				foreach (var actual in activosDb)
				{
					if (clavesVisibles.Contains(Clave(actual.CORR_UNIDAD, actual.CORR_PUESTO)))
					{
						continue;
					}

					rowsAffected += await EliminarActivoAsync(corrEmpleado, corrEmpresa, actual.CORR_UNIDAD, actual.CORR_PUESTO);
				}

				var reload = await GetAllAsync(corrEmpleado, corrEmpresa);
				if (!reload.Result)
				{
					return reload;
				}

				objResultado.Data = reload.Data;
				objResultado.Result = true;
				objResultado.RowsAffected = rowsAffected;
				objResultado.CodeHelper = corrEmpleado;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: identifica los tipos de contratación marcados como permanentes.
		// Cómo: lee SC_TIPO_CONTRATACION.ES_PERMANENTE de la empresa, sin fijar el nombre.
		private async Task<HashSet<int>> LeerTiposPermanentesAsync(int corrEmpresa)
		{
			var where = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
			};
			var reader = await objData.GetDataReader("SC_TIPO_CONTRATACION", where);
			var rows = new List<TipoContratacionPermanente>().FromDataReader(reader).ToList();
			reader.Close();
			return new HashSet<int>(
				rows.Where(x => x.ES_PERMANENTE == true).Select(x => x.CORR_TIPO_CONTRATACION));
		}

		private class TipoContratacionPermanente
		{
			public int CORR_TIPO_CONTRATACION { get; set; }
			public bool? ES_PERMANENTE { get; set; }
		}

		private static string Clave(int corrUnidad, int corrPuesto) => $"{corrUnidad}|{corrPuesto}";

		// Qué hace: arma columnas de valor. HORARIO_LABORAL queda NULL.
		// Cómo lo hace: fecha, sueldo y correlativos opcionales; auditoría de alta o de actualización.
		private static List<CParameter> ParametrosValor(
			GEN_EMPLEADO_PUESTOTable item,
			string login,
			string estacion,
			DateTime fecha,
			bool esAlta)
		{
			object fechaIngreso = item.FECHA_INGRESO.HasValue
				? item.FECHA_INGRESO.Value.Date
				: DBNull.Value;
			object sueldo = item.SUELDO.HasValue ? item.SUELDO.Value : DBNull.Value;
			object tipoContratacion = item.CORR_TIPO_CONTRATACION.HasValue && item.CORR_TIPO_CONTRATACION.Value > 0
				? item.CORR_TIPO_CONTRATACION.Value
				: DBNull.Value;
			object tipoModalidad = item.CORR_TIPO_MODALIDAD.HasValue && item.CORR_TIPO_MODALIDAD.Value > 0
				? item.CORR_TIPO_MODALIDAD.Value
				: DBNull.Value;

			var parametros = new List<CParameter>
			{
				new CParameter() { ParameterName = "FECHA_INGRESO", Value = fechaIngreso, DbType = System.Data.DbType.Date },
				new CParameter() { ParameterName = "SUELDO", Value = sueldo, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "HORARIO_LABORAL", Value = DBNull.Value, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "CORR_TIPO_CONTRATACION", Value = tipoContratacion, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_TIPO_MODALIDAD", Value = tipoModalidad, DbType = System.Data.DbType.Int32 },
			};

			if (esAlta)
			{
				parametros.Add(new CParameter() { ParameterName = "USUARIO_CREA", Value = login ?? string.Empty, DbType = System.Data.DbType.String });
				parametros.Add(new CParameter() { ParameterName = "ESTACION_CREA", Value = estacion ?? string.Empty, DbType = System.Data.DbType.String });
				parametros.Add(new CParameter() { ParameterName = "FECHA_CREA", Value = fecha, DbType = System.Data.DbType.DateTime });
			}

			parametros.Add(new CParameter() { ParameterName = "USUARIO_ACTU", Value = login ?? string.Empty, DbType = System.Data.DbType.String });
			parametros.Add(new CParameter() { ParameterName = "ESTACION_ACTU", Value = estacion ?? string.Empty, DbType = System.Data.DbType.String });
			parametros.Add(new CParameter() { ParameterName = "FECHA_ACTU", Value = fecha, DbType = System.Data.DbType.DateTime });
			return parametros;
		}

		// Qué hace: lee los puestos activos del empleado.
		// Cómo: V_GEN_EMPLEADO_PUESTO, que sale solo de GEN_EMPLEADO_PUESTO.
		private async Task<List<GEN_EMPLEADO_PUESTOView>> LeerActivosAsync(int corrEmpleado, int corrEmpresa)
		{
			var where = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = System.Data.DbType.Int32 },
			};
			var reader = await objData.GetDataReader(_ViewName, where);
			var rows = new List<GEN_EMPLEADO_PUESTOView>().FromDataReader(reader).ToList();
			reader.Close();
			return rows;
		}

		// Qué hace: lee todos los periodos cerrados del empleado.
		// Cómo: V_GEN_EMPLEADO_PUESTO_HISTORIAL; el tab se queda solo con el último por unidad y puesto.
		private async Task<List<HistorialLectura>> LeerHistorialAsync(int corrEmpleado, int corrEmpresa)
		{
			var where = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = System.Data.DbType.Int32 },
			};
			var reader = await objData.GetDataReader(_ViewHistorial, where);
			var rows = new List<HistorialLectura>().FromDataReader(reader).ToList();
			reader.Close();
			return rows;
		}

		// Qué hace: arma el card inactivo que se puede volver a activar.
		// Cómo: por unidad y puesto toma el periodo con mayor fecha fin y omite los que ya están activos.
		private static List<GEN_EMPLEADO_PUESTOView> UltimosInactivos(
			List<HistorialLectura> historial,
			HashSet<string> clavesActivas)
		{
			return (historial ?? new List<HistorialLectura>())
				.Where(h => (h.CORR_UNIDAD ?? 0) > 0 && (h.CORR_PUESTO ?? 0) > 0)
				.GroupBy(h => $"{h.CORR_UNIDAD}|{h.CORR_PUESTO}")
				.Select(g => g
					.OrderByDescending(x => x.FECHA_FIN ?? DateTime.MinValue)
					.ThenByDescending(x => x.CORR_EMPLEADO_PUESTO_HISTORIAL)
					.First())
				.Where(h => !clavesActivas.Contains($"{h.CORR_UNIDAD}|{h.CORR_PUESTO}"))
				.Select(h => new GEN_EMPLEADO_PUESTOView
				{
					CORR_EMPRESA = h.CORR_EMPRESA,
					CORR_EMPLEADO = h.CORR_EMPLEADO ?? 0,
					CORR_UNIDAD = h.CORR_UNIDAD ?? 0,
					CODIGO_UNIDAD = h.CODIGO_UNIDAD,
					NOMBRE_UNIDAD = h.NOMBRE_UNIDAD,
					CORR_PUESTO = h.CORR_PUESTO ?? 0,
					CODIGO_PUESTO = h.CODIGO_PUESTO,
					NOMBRE_PUESTO = h.NOMBRE_PUESTO,
					FECHA_INGRESO = h.FECHA_INICIO,
					FECHA_FIN = h.FECHA_FIN,
					ACTIVO_PUESTO = false,
					CORR_EMPLEADO_PUESTO_HISTORIAL = h.CORR_EMPLEADO_PUESTO_HISTORIAL,
					SUELDO = h.SUELDO,
					CORR_TIPO_CONTRATACION = h.CORR_TIPO_CONTRATACION,
					NOMBRE_TIPO_CONTRATACION = h.NOMBRE_TIPO_CONTRATACION,
					CORR_TIPO_MODALIDAD = h.CORR_TIPO_MODALIDAD,
					MODALIDAD_NOMBRE = h.MODALIDAD_NOMBRE
				})
				.ToList();
		}

		private async Task<int> ActualizarActivoAsync(
			GEN_EMPLEADO_PUESTOTable item,
			int corrEmpleado,
			int corrEmpresa,
			string login,
			string estacion,
			DateTime fecha)
		{
			var pUpdate = ParametrosValor(item, login, estacion, fecha, false);
			var pWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_UNIDAD", Value = item.CORR_UNIDAD, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PUESTO", Value = item.CORR_PUESTO, DbType = System.Data.DbType.Int32 },
			};
			var reader = await objData.Update(_TableName, pUpdate, pWhere);
			reader?.Close();
			return 1;
		}

		private async Task<int> InsertarActivoAsync(
			GEN_EMPLEADO_PUESTOTable item,
			int corrEmpleado,
			int corrEmpresa,
			string login,
			string estacion,
			DateTime fecha)
		{
			var pInsert = ParametrosValor(item, login, estacion, fecha, true);
			pInsert.Insert(0, new CParameter() { ParameterName = "CORR_PUESTO", Value = item.CORR_PUESTO, DbType = System.Data.DbType.Int32 });
			pInsert.Insert(0, new CParameter() { ParameterName = "CORR_UNIDAD", Value = item.CORR_UNIDAD, DbType = System.Data.DbType.Int32 });
			pInsert.Insert(0, new CParameter() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = System.Data.DbType.Int32 });
			pInsert.Insert(0, new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 });
			var pWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = System.Data.DbType.Int32 },
			};
			var reader = await objData.Insert(_TableName, pInsert, string.Empty, pWhere);
			reader?.Close();
			return 1;
		}

		private async Task<int> EliminarActivoAsync(int corrEmpleado, int corrEmpresa, int corrUnidad, int corrPuesto)
		{
			var pDel = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_UNIDAD", Value = corrUnidad, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PUESTO", Value = corrPuesto, DbType = System.Data.DbType.Int32 },
			};
			return (int)await objData.Delete(_TableName, pDel);
		}

		// Qué hace: abre un periodo cerrado al desactivar el puesto.
		// Cómo: inserta en historial con inicio = fecha de ingreso y fin = el día del apagado. HORARIO queda NULL.
		private async Task<int> InsertarHistorialAsync(
			GEN_EMPLEADO_PUESTOTable item,
			int corrEmpleado,
			int corrEmpresa,
			DateTime fechaInicio,
			DateTime fechaFin,
			int corrHistorial,
			string login,
			string estacion,
			DateTime fecha)
		{
			var parametros = ParametrosHistorial(item, fechaInicio, fechaFin, login, estacion, fecha, true);
			parametros.Insert(0, new CParameter() { ParameterName = "CORR_PUESTO", Value = item.CORR_PUESTO, DbType = System.Data.DbType.Int32 });
			parametros.Insert(0, new CParameter() { ParameterName = "CORR_UNIDAD", Value = item.CORR_UNIDAD, DbType = System.Data.DbType.Int32 });
			parametros.Insert(0, new CParameter() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = System.Data.DbType.Int32 });
			parametros.Insert(0, new CParameter() { ParameterName = "CORR_EMPLEADO_PUESTO_HISTORIAL", Value = corrHistorial, DbType = System.Data.DbType.Int32 });
			parametros.Insert(0, new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 });
			var pWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = System.Data.DbType.Int32 },
			};
			var reader = await objData.Insert(_TableHistorial, parametros, string.Empty, pWhere);
			reader?.Close();
			return 1;
		}

		private async Task<int> ActualizarHistorialAsync(
			GEN_EMPLEADO_PUESTOTable item,
			int corrEmpresa,
			DateTime fechaInicio,
			DateTime fechaFin,
			string login,
			string estacion,
			DateTime fecha)
		{
			var parametros = ParametrosHistorial(item, fechaInicio, fechaFin, login, estacion, fecha, false);
			parametros.Add(new CParameter() { ParameterName = "CORR_PUESTO", Value = item.CORR_PUESTO, DbType = System.Data.DbType.Int32 });
			parametros.Add(new CParameter() { ParameterName = "CORR_UNIDAD", Value = item.CORR_UNIDAD, DbType = System.Data.DbType.Int32 });
			var pWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EMPLEADO_PUESTO_HISTORIAL", Value = item.CORR_EMPLEADO_PUESTO_HISTORIAL, DbType = System.Data.DbType.Int32 },
			};
			var reader = await objData.Update(_TableHistorial, parametros, pWhere);
			reader?.Close();
			return 1;
		}

		private static List<CParameter> ParametrosHistorial(
			GEN_EMPLEADO_PUESTOTable item,
			DateTime fechaInicio,
			DateTime fechaFin,
			string login,
			string estacion,
			DateTime fecha,
			bool esAlta)
		{
			object tipoContratacion = item.CORR_TIPO_CONTRATACION.HasValue && item.CORR_TIPO_CONTRATACION.Value > 0
				? item.CORR_TIPO_CONTRATACION.Value
				: DBNull.Value;
			object tipoModalidad = item.CORR_TIPO_MODALIDAD.HasValue && item.CORR_TIPO_MODALIDAD.Value > 0
				? item.CORR_TIPO_MODALIDAD.Value
				: DBNull.Value;
			object sueldo = item.SUELDO.HasValue ? item.SUELDO.Value : DBNull.Value;

			var parametros = new List<CParameter>
			{
				new CParameter() { ParameterName = "FECHA_INICIO", Value = fechaInicio.Date, DbType = System.Data.DbType.Date },
				new CParameter() { ParameterName = "FECHA_FIN", Value = fechaFin.Date, DbType = System.Data.DbType.Date },
				new CParameter() { ParameterName = "SUELDO", Value = sueldo, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "HORARIO_LABORAL", Value = DBNull.Value, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "CORR_TIPO_CONTRATACION", Value = tipoContratacion, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_TIPO_MODALIDAD", Value = tipoModalidad, DbType = System.Data.DbType.Int32 },
			};

			if (esAlta)
			{
				parametros.Add(new CParameter() { ParameterName = "USUARIO_CREA", Value = login ?? string.Empty, DbType = System.Data.DbType.String });
				parametros.Add(new CParameter() { ParameterName = "ESTACION_CREA", Value = estacion ?? string.Empty, DbType = System.Data.DbType.String });
				parametros.Add(new CParameter() { ParameterName = "FECHA_CREA", Value = fecha, DbType = System.Data.DbType.DateTime });
			}

			parametros.Add(new CParameter() { ParameterName = "USUARIO_ACTU", Value = login ?? string.Empty, DbType = System.Data.DbType.String });
			parametros.Add(new CParameter() { ParameterName = "ESTACION_ACTU", Value = estacion ?? string.Empty, DbType = System.Data.DbType.String });
			parametros.Add(new CParameter() { ParameterName = "FECHA_ACTU", Value = fecha, DbType = System.Data.DbType.DateTime });
			return parametros;
		}

		// Qué hace: siguiente correlativo del historial. La columna no es identity.
		// Cómo: MAX(CORR_EMPLEADO_PUESTO_HISTORIAL) de la empresa + 1.
		private async Task<int> GetNextCorrHistorialAsync(int corrEmpresa)
		{
			const string sql = @"SELECT ISNULL(MAX(CORR_EMPLEADO_PUESTO_HISTORIAL), 0) + 1 AS NEXT_CORR
				FROM GEN_EMPLEADO_PUESTO_HISTORIAL
				WHERE CORR_EMPRESA = @CORR_EMPRESA";
			var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
			});
			var next = 1;
			if (reader.Read() && !reader.IsDBNull(0))
			{
				next = Convert.ToInt32(reader.GetValue(0));
				if (next < 1)
				{
					next = 1;
				}
			}
			reader.Close();
			return next;
		}

		private static DateTime FechaHoyElSalvador()
		{
			TimeZoneInfo zona;
			try
			{
				zona = TimeZoneInfo.FindSystemTimeZoneById("Central America Standard Time");
			}
			catch (TimeZoneNotFoundException)
			{
				zona = TimeZoneInfo.FindSystemTimeZoneById("America/El_Salvador");
			}
			return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, zona).Date;
		}

		private class HistorialLectura
		{
			public int CORR_EMPRESA { get; set; }
			public int CORR_EMPLEADO_PUESTO_HISTORIAL { get; set; }
			public DateTime? FECHA_INICIO { get; set; }
			public DateTime? FECHA_FIN { get; set; }
			public int? CORR_EMPLEADO { get; set; }
			public int? CORR_UNIDAD { get; set; }
			public string CODIGO_UNIDAD { get; set; }
			public string NOMBRE_UNIDAD { get; set; }
			public int? CORR_PUESTO { get; set; }
			public string CODIGO_PUESTO { get; set; }
			public string NOMBRE_PUESTO { get; set; }
			public decimal? SUELDO { get; set; }
			public int? CORR_TIPO_CONTRATACION { get; set; }
			public string NOMBRE_TIPO_CONTRATACION { get; set; }
			public int? CORR_TIPO_MODALIDAD { get; set; }
			public string MODALIDAD_NOMBRE { get; set; }
		}
	}
}
