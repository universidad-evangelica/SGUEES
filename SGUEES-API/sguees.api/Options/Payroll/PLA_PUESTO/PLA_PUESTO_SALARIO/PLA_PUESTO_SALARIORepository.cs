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
				var rows = new List<PLA_PUESTO_SALARIOView>().FromDataReader(reader)
					.OrderBy(x => x.NOMBRE_UNIDAD)
					.ThenBy(x => x.CORR_PUESTO_SALARIO)
					.ToList();
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

				if (await UnidadYaTieneSalarioAsync(Data.CORR_EMPRESA, Data.CORR_PUESTO.Value, Data.CORR_UNIDAD.Value, 0))
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 4000;
					objResultado.ErrorMessage = "Esa unidad ya tiene un salario para este puesto.";
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

				if (await UnidadYaTieneSalarioAsync(Data.CORR_EMPRESA, Data.CORR_PUESTO.Value, Data.CORR_UNIDAD.Value, Data.CORR_PUESTO_SALARIO))
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 4000;
					objResultado.ErrorMessage = "Esa unidad ya tiene un salario para este puesto.";
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

			if (Data.SALARIO_INICIAL.HasValue && Data.SALARIO_INICIAL.Value < 0)
			{
				return Error("El salario inicial no puede ser negativo.");
			}

			if (Data.SALARIO_ACTUAL.HasValue && Data.SALARIO_ACTUAL.Value < 0)
			{
				return Error("El salario actual no puede ser negativo.");
			}

			if (Data.SALARIO_FINAL.HasValue && Data.SALARIO_FINAL.Value < 0)
			{
				return Error("El salario final no puede ser negativo.");
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

		private async Task<bool> UnidadYaTieneSalarioAsync(int corrEmpresa, int corrPuesto, int corrUnidad, int excluir)
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
			return rows.Any(x => x.CORR_PUESTO_SALARIO != excluir);
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
			object salarioActual = item.SALARIO_ACTUAL.HasValue ? item.SALARIO_ACTUAL.Value : DBNull.Value;
			object salarioFinal = item.SALARIO_FINAL.HasValue ? item.SALARIO_FINAL.Value : DBNull.Value;
			object fechaIngreso = item.FECHA_INGRESO.HasValue ? item.FECHA_INGRESO.Value.Date : DBNull.Value;

			var parametros = new List<CParameter>
			{
				new CParameter() { ParameterName = "SALARIO_INICIAL", Value = salarioInicial, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "SALARIO_ACTUAL", Value = salarioActual, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "SALARIO_FINAL", Value = salarioFinal, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "CORR_UNIDAD", Value = item.CORR_UNIDAD.Value, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PUESTO", Value = item.CORR_PUESTO.Value, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "ACTIVO_PUESTO_SALARIO", Value = item.ACTIVO_PUESTO_SALARIO ?? true, DbType = System.Data.DbType.Boolean },
				new CParameter() { ParameterName = "FECHA_INGRESO", Value = fechaIngreso, DbType = System.Data.DbType.Date },
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
