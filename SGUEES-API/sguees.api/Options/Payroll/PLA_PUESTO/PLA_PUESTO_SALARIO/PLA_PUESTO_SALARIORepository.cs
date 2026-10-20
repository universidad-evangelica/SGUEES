// Qué hace: acceso a datos de salarios del puesto por unidad.
// Cómo lo hace: GetAll desde la vista; Insert/Update relee la fila en Data.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public class PLA_PUESTO_SALARIORepository
		: BaseRepository<PLA_PUESTO_SALARIOTable>,
			IPLA_PUESTO_SALARIORepository
	{
		private const string _TableName = "PLA_PUESTO_SALARIO";
		private const string _ViewName = "V_PLA_PUESTO_SALARIO";
		private const string _CampoPk = "CORR_PUESTO_SALARIO";

		public PLA_PUESTO_SALARIORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(int corrPuesto, int corrEmpresa)
		{
			CResult objResultado = new();

			try
			{
				if (corrEmpresa <= 0 || corrPuesto <= 0)
				{
					objResultado.Data = new List<PLA_PUESTO_SALARIOView>();
					objResultado.Result = true;
					objResultado.ErrorCode = 0;
					return objResultado;
				}

				var where = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PUESTO", Value = corrPuesto, DbType = System.Data.DbType.Int32 },
				};
				var reader = await objData.GetDataReader(_ViewName, where);
				var rows = new List<PLA_PUESTO_SALARIOView>().FromDataReader(reader).ToList();
				reader.Close();

				// Qué hace: deja una fila por unidad del puesto, aunque no tenga salario.
				// Cómo: GEN_UNIDADES_PUESTO LEFT JOIN los salarios ya leídos de la vista.
				var whereUnidades = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PUESTO", Value = corrPuesto, DbType = System.Data.DbType.Int32 },
				};
				var readerUnidades = await objData.GetDataReader("V_GEN_UNIDADES_PUESTO", whereUnidades);
				var unidades = new List<GEN_UNIDADES_PUESTOView>().FromDataReader(readerUnidades)
					.OrderBy(x => x.CODIGO_UNIDAD)
					.ThenBy(x => x.NOMBRE_UNIDAD)
					.ToList();
				readerUnidades.Close();

				var salariosPorUnidad = rows
					.GroupBy(x => x.CORR_UNIDAD ?? 0)
					.ToDictionary(g => g.Key, g => g.OrderBy(s => s.CORR_PUESTO_SALARIO).ToList());
				var combinadas = new List<PLA_PUESTO_SALARIOView>();
				foreach (var unidad in unidades)
				{
					if (salariosPorUnidad.TryGetValue(unidad.CORR_UNIDAD, out var salarios) && salarios.Count > 0)
					{
						combinadas.AddRange(salarios);
					}
					else
					{
						combinadas.Add(new PLA_PUESTO_SALARIOView
						{
							CORR_EMPRESA = corrEmpresa,
							CORR_PUESTO = corrPuesto,
							CORR_UNIDAD = unidad.CORR_UNIDAD,
							CODIGO_UNIDAD = unidad.CODIGO_UNIDAD,
							NOMBRE_UNIDAD = unidad.NOMBRE_UNIDAD,
							CORR_PUESTO_SALARIO = 0,
							ACTIVO_PUESTO_SALARIO = null,
						});
					}
				}

				objResultado.Data = combinadas;
				objResultado.Result = true;
				objResultado.RowsAffected = combinadas.Count;
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

		public async Task<CResult> CreateAsync(PLA_PUESTO_SALARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var validacion = Validar(Data);
				if (validacion != null)
				{
					return validacion;
				}

				AplicarFechaFinalizacion(Data);

				if (EsActivo(Data.ACTIVO_PUESTO_SALARIO)
					&& await UnidadYaTieneSalarioActivoAsync(Data.CORR_EMPRESA, Data.CORR_PUESTO.Value, Data.CORR_UNIDAD.Value, 0))
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 4000;
					objResultado.ErrorMessage = "Esa unidad ya tiene un salario activo para este puesto.";
					return objResultado;
				}

				var fecha = DateTime.Now;
				var p = ParametrosValor(Data, vLOGIN_SISTEMA, vESTACION, fecha, true);
				p.Insert(0, new CParameter()
				{
					ParameterName = _CampoPk,
					Value = 0,
					DbType = System.Data.DbType.Int32,
					Direction = System.Data.ParameterDirection.InputOutput
				});
				p.Insert(0, new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				};
				var reader = await objData.Insert(_TableName, p, _CampoPk, pWhere);
				var inserted = new List<PLA_PUESTO_SALARIOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				var corr = inserted?.CORR_PUESTO_SALARIO ?? 0;
				var fila = corr > 0 ? await LeerFilaAsync(Data.CORR_EMPRESA, corr) : inserted;

				objResultado.Data = fila ?? inserted;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = corr;
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

		public async Task<CResult> UpdateAsync(PLA_PUESTO_SALARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var validacion = Validar(Data);
				if (validacion != null)
				{
					return validacion;
				}

				if (Data.CORR_PUESTO_SALARIO <= 0)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 4000;
					objResultado.ErrorMessage = "CORR_PUESTO_SALARIO es requerido.";
					return objResultado;
				}

				AplicarFechaFinalizacion(Data);

				if (EsActivo(Data.ACTIVO_PUESTO_SALARIO)
					&& await UnidadYaTieneSalarioActivoAsync(Data.CORR_EMPRESA, Data.CORR_PUESTO.Value, Data.CORR_UNIDAD.Value, Data.CORR_PUESTO_SALARIO))
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 4000;
					objResultado.ErrorMessage = "Esa unidad ya tiene un salario activo para este puesto.";
					return objResultado;
				}

				var fecha = DateTime.Now;
				var p = ParametrosValor(Data, vLOGIN_SISTEMA, vESTACION, fecha, false);
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = _CampoPk, Value = Data.CORR_PUESTO_SALARIO, DbType = System.Data.DbType.Int32 },
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				reader?.Close();

				objResultado.Data = await LeerFilaAsync(Data.CORR_EMPRESA, Data.CORR_PUESTO_SALARIO);
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = Data.CORR_PUESTO_SALARIO;
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

		public async Task<CResult> DeleteAsync(PLA_PUESTO_SALARIOTable Data, int corrEmpresa)
		{
			CResult objResultado = new();

			try
			{
				if (corrEmpresa <= 0 || Data == null || Data.CORR_PUESTO_SALARIO <= 0)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 4000;
					objResultado.ErrorMessage = "CORR_PUESTO_SALARIO es requerido.";
					return objResultado;
				}

				var pDel = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = _CampoPk, Value = Data.CORR_PUESTO_SALARIO, DbType = System.Data.DbType.Int32 },
				};
				var rows = (int)await objData.Delete(_TableName, pDel);
				objResultado.Data = Data.CORR_PUESTO_SALARIO;
				objResultado.Result = true;
				objResultado.RowsAffected = rows;
				objResultado.CodeHelper = Data.CORR_PUESTO_SALARIO;
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

		private static CResult Validar(PLA_PUESTO_SALARIOTable Data)
		{
			if (Data == null || Data.CORR_EMPRESA <= 0 || !Data.CORR_PUESTO.HasValue || Data.CORR_PUESTO.Value <= 0)
			{
				return Error("CORR_PUESTO es requerido.");
			}

			if (!Data.CORR_UNIDAD.HasValue || Data.CORR_UNIDAD.Value <= 0)
			{
				return Error("Seleccione la unidad.");
			}

			if (!Data.SALARIO_INICIAL.HasValue)
			{
				return Error("Ingrese el salario inicial.");
			}

			if (!Data.SALARIO_FINAL.HasValue)
			{
				return Error("Ingrese el salario final.");
			}

			if (!Data.FECHA_INGRESO.HasValue)
			{
				return Error("Seleccione la fecha de ingreso.");
			}

			if (Data.SALARIO_INICIAL.HasValue && Data.SALARIO_INICIAL.Value < 0)
			{
				return Error("El salario inicial no puede ser negativo.");
			}

			if (Data.SALARIO_FINAL.HasValue && Data.SALARIO_FINAL.Value < 0)
			{
				return Error("El salario final no puede ser negativo.");
			}

			if (Data.SALARIO_INICIAL.HasValue && Data.SALARIO_FINAL.HasValue && Data.SALARIO_INICIAL.Value > Data.SALARIO_FINAL.Value)
			{
				return Error("El salario inicial no puede ser mayor que el salario final.");
			}

			return null;
		}

		private static CResult Error(string mensaje)
		{
			return new CResult
			{
				Result = false,
				ErrorCode = 4000,
				ErrorMessage = mensaje
			};
		}

		// Qué hace: revisa si la unidad ya tiene otro salario activo para el puesto.
		// Cómo: lee la vista y cuenta solo ACTIVO_PUESTO_SALARIO distinto de la fila actual.
		private async Task<bool> UnidadYaTieneSalarioActivoAsync(int corrEmpresa, int corrPuesto, int corrUnidad, int excluir)
		{
			var where = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PUESTO", Value = corrPuesto, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_UNIDAD", Value = corrUnidad, DbType = System.Data.DbType.Int32 },
			};
			var reader = await objData.GetDataReader(_ViewName, where);
			var rows = new List<PLA_PUESTO_SALARIOView>().FromDataReader(reader).ToList();
			reader.Close();
			return rows.Any(x => x.CORR_PUESTO_SALARIO != excluir && EsActivo(x.ACTIVO_PUESTO_SALARIO));
		}

		private static bool EsActivo(bool? activo) => activo != false;

		// Qué hace: al desactivar guarda la fecha de finalización; al activar la limpia.
		// Cómo: si no viene fecha, usa el día de El Salvador.
		private static void AplicarFechaFinalizacion(PLA_PUESTO_SALARIOTable item)
		{
			if (EsActivo(item.ACTIVO_PUESTO_SALARIO))
			{
				item.FECHA_FINALIZACION = null;
				return;
			}

			if (!item.FECHA_FINALIZACION.HasValue)
			{
				item.FECHA_FINALIZACION = FechaHoyElSalvador();
			}
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

		private async Task<PLA_PUESTO_SALARIOView> LeerFilaAsync(int corrEmpresa, int corrPuestoSalario)
		{
			var where = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = _CampoPk, Value = corrPuestoSalario, DbType = System.Data.DbType.Int32 },
			};
			var reader = await objData.GetDataReader(_ViewName, where);
			var fila = new List<PLA_PUESTO_SALARIOView>().FromDataReader(reader).FirstOrDefault();
			reader.Close();
			return fila;
		}

		private static List<CParameter> ParametrosValor(
			PLA_PUESTO_SALARIOTable item,
			string login,
			string estacion,
			DateTime fecha,
			bool esAlta)
		{
			object salarioInicial = item.SALARIO_INICIAL.HasValue ? item.SALARIO_INICIAL.Value : DBNull.Value;
			object salarioFinal = item.SALARIO_FINAL.HasValue ? item.SALARIO_FINAL.Value : DBNull.Value;
			object fechaIngreso = item.FECHA_INGRESO.HasValue ? item.FECHA_INGRESO.Value.Date : DBNull.Value;
			object fechaFinalizacion = item.FECHA_FINALIZACION.HasValue ? item.FECHA_FINALIZACION.Value.Date : DBNull.Value;

			var parametros = new List<CParameter>
			{
				new CParameter() { ParameterName = "SALARIO_INICIAL", Value = salarioInicial, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "SALARIO_FINAL", Value = salarioFinal, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "CORR_UNIDAD", Value = item.CORR_UNIDAD.Value, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PUESTO", Value = item.CORR_PUESTO.Value, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "ACTIVO_PUESTO_SALARIO", Value = item.ACTIVO_PUESTO_SALARIO ?? true, DbType = System.Data.DbType.Boolean },
				new CParameter() { ParameterName = "FECHA_INGRESO", Value = fechaIngreso, DbType = System.Data.DbType.Date },
				new CParameter() { ParameterName = "FECHA_FINALIZACION", Value = fechaFinalizacion, DbType = System.Data.DbType.Date },
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
