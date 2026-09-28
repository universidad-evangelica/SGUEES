// Qué hace: acceso a datos de puestos asignados al empleado.
// Cómo lo hace: GetAll desde la vista; SaveAll sincroniza la lista y relee Data. HORARIO_LABORAL siempre NULL.
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

				var where = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = System.Data.DbType.Int32 },
				};
				var reader = await objData.GetDataReader(_ViewName, where);
				var rows = new List<GEN_EMPLEADO_PUESTOView>().FromDataReader(reader).ToList();
				reader.Close();

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
				var existentesWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = System.Data.DbType.Int32 },
				};
				var readerExist = await objData.GetDataReader(_ViewName, existentesWhere);
				var existentes = new List<GEN_EMPLEADO_PUESTOView>().FromDataReader(readerExist).ToList();
				readerExist.Close();

				var keepKeys = new HashSet<string>(items.Select(x => Clave(x.CORR_UNIDAD, x.CORR_PUESTO)));

				foreach (var actual in existentes)
				{
					if (keepKeys.Contains(Clave(actual.CORR_UNIDAD, actual.CORR_PUESTO)))
					{
						continue;
					}

					var pDel = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_UNIDAD", Value = actual.CORR_UNIDAD, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PUESTO", Value = actual.CORR_PUESTO, DbType = System.Data.DbType.Int32 },
					};
					rowsAffected += (int)await objData.Delete(_TableName, pDel);
				}

				var clavesExistentes = new HashSet<string>(existentes.Select(x => Clave(x.CORR_UNIDAD, x.CORR_PUESTO)));

				foreach (var item in items)
				{
					var clave = Clave(item.CORR_UNIDAD, item.CORR_PUESTO);
					if (clavesExistentes.Contains(clave))
					{
						var pUpdate = ParametrosValor(item, vLOGIN_SISTEMA, vESTACION, fecha, false);
						var pWhere = new List<CParameter>
						{
							new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_UNIDAD", Value = item.CORR_UNIDAD, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_PUESTO", Value = item.CORR_PUESTO, DbType = System.Data.DbType.Int32 },
						};
						var readerUpd = await objData.Update(_TableName, pUpdate, pWhere);
						readerUpd?.Close();
						rowsAffected++;
					}
					else
					{
						var pInsert = ParametrosValor(item, vLOGIN_SISTEMA, vESTACION, fecha, true);
						pInsert.Insert(0, new CParameter() { ParameterName = "CORR_PUESTO", Value = item.CORR_PUESTO, DbType = System.Data.DbType.Int32 });
						pInsert.Insert(0, new CParameter() { ParameterName = "CORR_UNIDAD", Value = item.CORR_UNIDAD, DbType = System.Data.DbType.Int32 });
						pInsert.Insert(0, new CParameter() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = System.Data.DbType.Int32 });
						pInsert.Insert(0, new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 });
						var pWhereIns = new List<CParameter>
						{
							new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = System.Data.DbType.Int32 },
						};
						var readerIns = await objData.Insert(_TableName, pInsert, string.Empty, pWhereIns);
						readerIns?.Close();
						rowsAffected++;
					}
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
	}
}
