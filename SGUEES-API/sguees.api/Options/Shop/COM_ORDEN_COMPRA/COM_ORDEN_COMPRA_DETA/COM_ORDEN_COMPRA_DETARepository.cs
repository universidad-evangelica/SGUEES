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
	public class COM_ORDEN_COMPRA_DETARepository : BaseRepository<COM_ORDEN_COMPRA_DETATable>, ICOM_ORDEN_COMPRA_DETARepository
	{
		private const string _TableName = "COM_ORDEN_COMPRA_DETA";

		public COM_ORDEN_COMPRA_DETARepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<COM_ORDEN_COMPRA_DETAView>().FromDataReader(reader).ToList();
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
				var response = new List<COM_ORDEN_COMPRA_DETAView>().FromDataReader(reader).FirstOrDefault();
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

		public async Task<CResult> CreateAsync(COM_ORDEN_COMPRA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await SaveAsync(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Add);
		}

		public async Task<CResult> UpdateAsync(COM_ORDEN_COMPRA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await SaveAsync(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Update);
		}

		public async Task<CResult> DeleteAsync(COM_ORDEN_COMPRA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				if (Data.CORR_ORDEN_COMPRA <= 0 || Data.CORR_ORDEN_COMPRA_DETA <= 0)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = "PK de detalle inválida.";
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
				objResultado.CodeHelper = objData.objCommand.Parameters["@CORR_ORDEN_COMPRA_DETA"].Value;
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

		public async Task<CResult> SaveAsync(COM_ORDEN_COMPRA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION, UpdateType Tipo)
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

				if (Tipo == UpdateType.Update && Data.CORR_ORDEN_COMPRA_DETA <= 0)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = "CORR_ORDEN_COMPRA_DETA inválido.";
					return objResultado;
				}

				if (Data.MONTO_SUBTOTAL == 0 && Data.CANTIDAD_COMPRA != 0)
				{
					Data.MONTO_SUBTOTAL = Data.CANTIDAD_COMPRA * Data.PRECIO_UNITARIO;
				}

				var p = BuildMttoParameters(Data, Tipo);
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Decimal, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);

				var sysError = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);

				if (sysError == 0)
				{
					Data.CORR_ORDEN_COMPRA_DETA = Convert.ToInt32(objData.objCommand.Parameters["@CORR_ORDEN_COMPRA_DETA"].Value);

					var xWhere = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_ORDEN_COMPRA", Value = Data.CORR_ORDEN_COMPRA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_ORDEN_COMPRA_DETA", Value = Data.CORR_ORDEN_COMPRA_DETA, DbType = System.Data.DbType.Int32 },
					};

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_ORDEN_COMPRA_DETAView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_ORDEN_COMPRA_DETA;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Convert.ToInt32(objData.objCommand.Parameters["@CORR_ORDEN_COMPRA_DETA"].Value);
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

		private static List<CParameter> BuildMttoParameters(COM_ORDEN_COMPRA_DETATable Data, UpdateType Tipo)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = Tipo, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_ORDEN_COMPRA", Value = Data.CORR_ORDEN_COMPRA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_ORDEN_COMPRA_DETA", Value = Data.CORR_ORDEN_COMPRA_DETA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@CODIGO_ITEM", Value = Data.CODIGO_ITEM ?? "", DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@CORR_UNIDAD_MEDIDA", Value = Data.CORR_UNIDAD_MEDIDA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CANTIDAD_COMPRA", Value = Data.CANTIDAD_COMPRA, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "@PRECIO_UNITARIO", Value = Data.PRECIO_UNITARIO, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "@MONTO_SUBTOTAL", Value = Data.MONTO_SUBTOTAL, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "@ANIO_PERIODO_COTIZACION", Value = Data.ANIO_PERIODO_COTIZACION, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_COTIZACION", Value = Data.CORR_COTIZACION, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_COTIZACION_DETA", Value = Data.CORR_COTIZACION_DETA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_CENTRO_COSTO", Value = Data.CORR_CENTRO_COSTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CANTIDAD_RECIBIDA", Value = Data.CANTIDAD_RECIBIDA ?? 0, DbType = System.Data.DbType.Decimal },
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
