using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
	public class COM_ORDEN_COMPRARepository : BaseRepository<COM_ORDEN_COMPRATable>, ICOM_ORDEN_COMPRARepository
	{
		private const string _TableName = "COM_ORDEN_COMPRA";

		public COM_ORDEN_COMPRARepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, "PRAL_DATA_COM_ORDEN_COMPRA", xWhere);
				var response = new List<COM_ORDEN_COMPRAView>().FromDataReader(reader).ToList();

				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
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

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<COM_ORDEN_COMPRAView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
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

		public async Task<CResult> CreateAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await SaveAsync(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Add);
		}

		public async Task<CResult> UpdateAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await SaveAsync(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Update);
		}

		public async Task<CResult> DeleteAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				if (Data.CORR_ORDEN_COMPRA <= 0)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = "CORR_ORDEN_COMPRA inválido.";
					return objResultado;
				}

				var p = BuildMttoParameters(Data, UpdateType.Delete);
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Decimal, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);

				var sysError = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);

				objResultado.Data = null;
				objResultado.Result = sysError == 0;
				objResultado.RowsAffected = Convert.ToInt32(objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value);
				objResultado.CodeHelper = objData.objCommand.Parameters["@CORR_ORDEN_COMPRA"].Value;
				objResultado.ErrorCode = sysError;
				objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
				objResultado.ErrorSource = "C" + _TableName + ".Delete";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
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

		public async Task<CResult> SaveAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION, UpdateType Tipo)
		{
			CResult objResultado = new();

			try
			{
				if (Tipo == UpdateType.Update && Data.CORR_ORDEN_COMPRA <= 0)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = "CORR_ORDEN_COMPRA inválido.";
					return objResultado;
				}

				var p = BuildMttoParameters(Data, Tipo);
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Decimal, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);

				var sysError = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);

				if (sysError == 0)
				{
					Data.CORR_ORDEN_COMPRA = Convert.ToInt32(objData.objCommand.Parameters["@CORR_ORDEN_COMPRA"].Value);
					if (objData.objCommand.Parameters["@NUMERO_ORDEN_COMPRA"].Value != DBNull.Value)
					{
						Data.NUMERO_ORDEN_COMPRA = Convert.ToInt32(objData.objCommand.Parameters["@NUMERO_ORDEN_COMPRA"].Value);
					}

					var xWhere = BuildPkWhere(Data);
					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_ORDEN_COMPRAView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_ORDEN_COMPRA;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Convert.ToInt32(objData.objCommand.Parameters["@CORR_ORDEN_COMPRA"].Value);
					objResultado.ErrorCode = sysError;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
				}
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
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

		public async Task<CResult> AplicarAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await EjecutarProcesoAsync(Data, vLOGIN_SISTEMA, vESTACION, "APLICAR");
		}

		public async Task<CResult> AnularAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await EjecutarProcesoAsync(Data, vLOGIN_SISTEMA, vESTACION, "ANULAR");
		}

		public async Task<CResult> DesAplicarAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await EjecutarProcesoAsync(Data, vLOGIN_SISTEMA, vESTACION, "DESAPLICAR");
		}

		private async Task<CResult> EjecutarProcesoAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION, string proceso)
		{
			CResult objResultado = new();

			try
			{
				if (Data.CORR_ORDEN_COMPRA <= 0)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = "CORR_ORDEN_COMPRA inválido.";
					return objResultado;
				}

				var p = BuildProcesoParameters(Data, vLOGIN_SISTEMA, vESTACION);
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName + "_" + proceso, true, p);

				var sysError = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);

				if (sysError == 0)
				{
					var xWhere = BuildPkWhere(Data);
					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_ORDEN_COMPRAView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response?.CORR_ORDEN_COMPRA ?? Data.CORR_ORDEN_COMPRA;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_ORDEN_COMPRA;
					objResultado.ErrorCode = sysError;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + proceso + ")";
				}
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
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

		public async Task<CResult> GetOrdenCompraImpr(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, "PRAL_IMPR_COM_CUADRO_COMPARATIVO_ORDEN_COMPRA", xWhere);
				var response = new List<COM_ORDEN_COMPRA_IMPRView>().FromDataReader(reader).ToList();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
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

		private static List<CParameter> BuildPkWhere(COM_ORDEN_COMPRATable Data)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_ORDEN_COMPRA", Value = Data.CORR_ORDEN_COMPRA, DbType = System.Data.DbType.Int32 },
			};
		}

		private static List<CParameter> BuildProcesoParameters(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_ORDEN_COMPRA", Value = Data.CORR_ORDEN_COMPRA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Decimal, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
			};
		}

		private static List<CParameter> BuildMttoParameters(COM_ORDEN_COMPRATable Data, UpdateType Tipo)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = Tipo, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_ORDEN_COMPRA", Value = Data.CORR_ORDEN_COMPRA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@CORR_TIPO_DOC", Value = Data.CORR_TIPO_DOC, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@ATENCION_A", Value = Data.ATENCION_A, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@FECHA_ORDEN", Value = Data.FECHA_ORDEN, DbType = System.Data.DbType.Date },
				new CParameter() { ParameterName = "@ESTADO_ORDEN", Value = Data.ESTADO_ORDEN ?? "DI", DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@OBSERVACIONES", Value = Data.OBSERVACIONES, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@COMPRA_TOTAL", Value = Data.COMPRA_TOTAL, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "@MONTO_EN_LETRAS", Value = Data.MONTO_EN_LETRAS, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@NUMERO_ORDEN_COMPRA", Value = Data.NUMERO_ORDEN_COMPRA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@CORR_CONDICION_PAGO", Value = Data.CORR_CONDICION_PAGO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_FORMA_PAGO", Value = Data.CORR_FORMA_PAGO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@DETALLE_FORMA_PAGO", Value = Data.DETALLE_FORMA_PAGO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@USUARIO_CREA", Value = Data.USUARIO_CREA ?? "", DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@FECHA_CREA", Value = Data.FECHA_CREA == default ? DateTime.Now : Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
				new CParameter() { ParameterName = "@ESTACION_CREA", Value = Data.ESTACION_CREA ?? "", DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				new CParameter() { ParameterName = "@ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
			};
		}
	}
}
