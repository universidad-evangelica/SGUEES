using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using eadmindevprojectmanagement.Models;
using scuees.Models;

namespace eadmindevprojectmanagement.Repositories
{
	public class COM_DOCUMENTORepository : BaseRepository<COM_DOCUMENTOTable>, ICOM_DOCUMENTORepository
	{
		private const string _TableName = "COM_DOCUMENTO";

		public COM_DOCUMENTORepository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();

			try
			{
				var vQry = @$"	SELECT A.*
								FROM V_COM_DOCUMENTO A
								WHERE A.CORR_EMPRESA=@CORR_EMPRESA
								AND A.FECHA_DOCUMENTO>=@FECHA_INICIAL
								AND A.FECHA_DOCUMENTO<=@FECHA_FINAL
								ORDER BY A.FECHA_DOCUMENTO DESC, A.CORR_DOCUMENTO DESC
							";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<COM_DOCUMENTOView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
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
			CResult objResultado = new CResult();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<COM_DOCUMENTOView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
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

		public async Task<CResult> CreateAsync(COM_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await Save(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Add);
		}

		public async Task<CResult> UpdateAsync(COM_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await Save(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Update);
		}

		public async Task<CResult> DeleteAsync(COM_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = UpdateType.Delete, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@CORR_TIPO_DOC", Value = 0, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@NUMERO_DOCUMENTO", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_DOCUMENTO", Value = DateTime.Today, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@FECHA_VENCIMIENTO", Value = DateTime.Today, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@CORR_TIENDA", Value = 1, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_PROVEEDOR", Value = 1, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@NOMBRE_PROVEEDOR", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@DESCRIPCION_PARTIDA", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@CORR_CONDICION_PAGO", Value = 0, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@DIAS_CREDITO", Value = 0, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ESTADO_DOCUMENTO", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@ESTA_CONTABILIZADO", Value = false, DbType = System.Data.DbType.Boolean });
				p.Add(new CParameter() { ParameterName = "@TOTAL_DOCUMENTO", Value = 0, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@TOTAL_NETO", Value = 0, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@SALDO_DOCUMENTO", Value = 0, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@USUARIO_CREA", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_CREA", Value = DateTime.Now, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_CREA", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@USUARIO_ACTU", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_ACTU", Value = DateTime.Now, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_ACTU", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@CORR_TIPO_GASTO", Value = 0, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CANTIDAD", Value = 0, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@CORR_MONEDA", Value = 0, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@FACTOR_CAMBIO", Value = 0, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@OPERADOR", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SERIE", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@NUMERO_UNICO", Value = 0, DbType = System.Data.DbType.Int64 });
				// p.Add(new CParameter() {ParameterName="@ESTADO_ADMINISTRATIVO",Value=Data.ESTADO_ADMINISTRATIVO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() { ParameterName = "@CODIGO_GENERACION", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@NUMERO_CONTROL", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SELLO_RECEPCION", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO_IVA", Value = 0, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO_IVA", Value = 0, DbType = System.Data.DbType.Int32 });

				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					objResultado.Data = null;
					objResultado.Result = true;
					objResultado.RowsAffected = (Int32)objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value;
					objResultado.CodeHelper = objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;
					objResultado.ErrorCode = (Int32)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (String)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Delete(" + UpdateType.Delete.ToString() + ")";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = (Int32)objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value;
					objResultado.CodeHelper = objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;
					objResultado.ErrorCode = (Int32)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (String)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Delete(" + UpdateType.Delete.ToString() + ")";
				}


			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}

			return objResultado;
		}

		public async Task<CResult> Save(COM_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION, UpdateType Tipo)
		{
			CResult objResultado = new CResult();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = Tipo, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@CORR_TIPO_DOC", Value = Data.CORR_TIPO_DOC, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@NUMERO_DOCUMENTO", Value = Data.NUMERO_DOCUMENTO, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_DOCUMENTO", Value = Data.FECHA_DOCUMENTO, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@FECHA_VENCIMIENTO", Value = Data.FECHA_VENCIMIENTO, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@CORR_TIENDA", Value = Data.CORR_TIENDA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@NOMBRE_PROVEEDOR", Value = Data.NOMBRE_PROVEEDOR, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@DESCRIPCION_PARTIDA", Value = Data.DESCRIPCION_PARTIDA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@CORR_CONDICION_PAGO", Value = Data.CORR_CONDICION_PAGO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@DIAS_CREDITO", Value = Data.DIAS_CREDITO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ESTADO_DOCUMENTO", Value = Data.ESTADO_DOCUMENTO, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@ESTA_CONTABILIZADO", Value = Data.ESTA_CONTABILIZADO, DbType = System.Data.DbType.Boolean });
				p.Add(new CParameter() { ParameterName = "@TOTAL_DOCUMENTO", Value = Data.TOTAL_DOCUMENTO, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@TOTAL_NETO", Value = Data.TOTAL_NETO, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@SALDO_DOCUMENTO", Value = Data.SALDO_DOCUMENTO, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime });
				p.Add(new CParameter() { ParameterName = "@ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@CORR_TIPO_GASTO", Value = Data.CORR_TIPO_GASTO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CANTIDAD", Value = Data.CANTIDAD, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@CORR_MONEDA", Value = Data.CORR_MONEDA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@FACTOR_CAMBIO", Value = Data.FACTOR_CAMBIO, DbType = System.Data.DbType.Decimal });
				p.Add(new CParameter() { ParameterName = "@OPERADOR", Value = Data.OPERADOR, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SERIE", Value = Data.SERIE, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@NUMERO_UNICO", Value = Data.NUMERO_UNICO, DbType = System.Data.DbType.Int64 });
				// p.Add(new CParameter() {ParameterName="@ESTADO_ADMINISTRATIVO",Value=Data.ESTADO_ADMINISTRATIVO,DbType=System.Data.DbType.String});
				p.Add(new CParameter() { ParameterName = "@CODIGO_GENERACION", Value = Data.CODIGO_GENERACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@NUMERO_CONTROL", Value = Data.NUMERO_CONTROL, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SELLO_RECEPCION", Value = Data.SELLO_RECEPCION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO_IVA", Value = Data.ANIO_PERIODO_IVA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO_IVA", Value = Data.MES_PERIODO_IVA, DbType = System.Data.DbType.Int32 });

				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var vResultado = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					Data.CORR_DOCUMENTO = (int)objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;

					p.Clear();

					p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 });

					var readerget = await objData.GetDataReader("V_" + _TableName, p);
					var response = new List<COM_DOCUMENTOView>().FromDataReader(readerget).FirstOrDefault();

					readerget.Close();
					readerget = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_DOCUMENTO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
				}

			}
			catch (System.Exception e)
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

		public async Task<CResult> AplicarAsync(COM_DOCUMENTOTable Data)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });

				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName + "_APLICAR", true, p);

				Data.CORR_DOCUMENTO = (int)objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_DOCUMENTOView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.CORR_DOCUMENTO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(Aplicar)";
				}
			}
			catch (System.Exception e)
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

		public async Task<CResult> GenerarCRAsync(COM_DOCUMENTO_CRTable Data)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@ES_NACIONAL", Value = Data.ES_NACIONAL, DbType = System.Data.DbType.Boolean });
				p.Add(new CParameter() { ParameterName = "@ES_EXTRANJERO", Value = Data.ES_EXTRANJERO, DbType = System.Data.DbType.Boolean });
				p.Add(new CParameter() { ParameterName = "@DESCRIPCION_DOCUMENTO", Value = Data.DESCRIPCION_DOCUMENTO, DbType = System.Data.DbType.String });
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_GENE_COM_DOCUMENTO_CR", true, p);

				Data.CORR_DOCUMENTO = (int)objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_DOCUMENTOView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.CORR_DOCUMENTO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(GenerarCR)";
				}
			}
			catch (System.Exception e)
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

		public async Task<CResult> DesAplicarAsync(COM_DOCUMENTOTable Data)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });

				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName + "_DESAPLICAR", true, p);

				Data.CORR_DOCUMENTO = (int)objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_DOCUMENTOView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.CORR_DOCUMENTO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(DesAplicar)";
				}
			}
			catch (System.Exception e)
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

		public async Task<CResult> GetAllAplicadosAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();

			try
			{
				var vQry = @$"
								SELECT A.*,CONVERT(BIT,0) AS SELECCION
								FROM V_COM_DOCUMENTO A
								WHERE A.CORR_EMPRESA=@CORR_EMPRESA
								AND A.FECHA_DOCUMENTO>=@FECHA_INICIAL
								AND A.FECHA_DOCUMENTO<=@FECHA_FINAL
								AND A.ESTADO_DOCUMENTO<>'DI'
								ORDER BY A.FECHA_DOCUMENTO DESC
							";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<COM_DOCUMENTOView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
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

		public async Task<CResult> GetAllJsonAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();
			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, "PRAL_DATA_" + _TableName + "_ELECTRONICO", xWhere);
				var response = new List<COM_DOCUMENTO_ELECTRONICOView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
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
		public async Task<CResult> RelacionarDocumentoElctronico(COM_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = UpdateType.Add, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_TIENDA", Value = Data.CORR_TIENDA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA_FE", Value = Data.CORR_EMPRESA_FE, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_DOCUMENTO_FE", Value = Data.CORR_DOCUMENTO_FE, DbType = System.Data.DbType.Int32 });

				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var vResultado = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_ADM_COM_JSON", true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					p.Clear();

					p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 });

					var readerget = await objData.GetDataReader("V_" + _TableName, p);
					var response = new List<COM_DOCUMENTOView>().FromDataReader(readerget).FirstOrDefault();

					readerget.Close();
					readerget = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_DOCUMENTO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = true;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
				}

			}
			catch (System.Exception e)
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
		public async Task<CResult> GetAllDocumentosDisponiblesAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();

			try
			{
				var xQry = $@"
							DECLARE @SUMA_RESTA INT

							SELECT @SUMA_RESTA=A.SUMA_RESTA
							FROM V_COM_DOCUMENTO A
							WHERE A.CORR_EMPRESA=@CORR_EMPRESA
							AND A.ANIO_PERIODO=@ANIO_PERIODO
							AND A.MES_PERIODO=@MES_PERIODO
							AND A.CORR_DOCUMENTO=@CORR_DOCUMENTO

							SELECT 
							@CORR_EMPRESA CORR_EMPRESA
							,@ANIO_PERIODO ANIO_PERIODO
							,@MES_PERIODO MES_PERIODO
							,@CORR_DOCUMENTO CORR_DOCUMENTO
							,A.ANIO_PERIODO ANIO_PERIODO_DOC
							,A.MES_PERIODO MES_PERIODO_DOC
							,A.CORR_DOCUMENTO CORR_DOCUMENTO_DOC
							,A.TOTAL_DOCUMENTO MONTO_DOCUMENTO
							,A.SALDO_DOCUMENTO MONTO_INICIAL
							,CONVERT(DECIMAL(18,2),0) MONTO_INGRESO
							,A.SALDO_DOCUMENTO MONTO_FINAL
							,CASE WHEN ISNULL(A.NUMERO_CONTROL,'')='' THEN A.NUMERO_DOCUMENTO ELSE SUBSTRING(ISNULL(A.NUMERO_CONTROL,''),17,LEN(ISNULL(A.NUMERO_CONTROL,''))-16) END NUMERO_DOCUMENTO				
							,A.FECHA_DOCUMENTO
							,B.NOMBRE_TIPO_DOC
							,CONVERT(BIT,0) SELECCION
							,@SUMA_RESTA SUMA_RESTA
							FROM COM_DOCUMENTO A
							INNER JOIN GEN_TIPO_DOCUMENTO B ON A.CORR_EMPRESA = B.CORR_EMPRESA AND A.CORR_TIPO_DOC = B.CORR_TIPO_DOC
							WHERE A.CORR_EMPRESA=@CORR_EMPRESA
							AND A.FECHA_DOCUMENTO>=@FECHA_INICIAL
							AND A.FECHA_DOCUMENTO<=@FECHA_FINAL
							AND A.CORR_PROVEEDOR=@CORR_PROVEEDOR
							AND NOT EXISTS
							(
								SELECT 1
								FROM COM_DOCUMENTO_DETA_DOC B
								WHERE B.CORR_EMPRESA=A.CORR_EMPRESA
								AND B.ANIO_PERIODO=@ANIO_PERIODO
								AND B.MES_PERIODO=@MES_PERIODO
								AND B.CORR_DOCUMENTO=@CORR_DOCUMENTO
								AND B.ANIO_PERIODO_DOC=A.ANIO_PERIODO
								AND B.MES_PERIODO_DOC=A.MES_PERIODO
								AND B.CORR_DOCUMENTO_DOC=A.CORR_DOCUMENTO
							)
							AND A.ESTADO_DOCUMENTO='AP'
							AND B.CLASE_DOCUMENTO='CCF'
							AND B.USAR_COMPRAS=1
							ORDER BY A.FECHA_DOCUMENTO ASC
							";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, xQry, xWhere);
				var response = new List<COM_DOCUMENTO_DETA_DOC_SELECCIONView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
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

		public async Task<CResult> AnularCRAsync(COM_DOCUMENTO_ANULAR_CRTable Data)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "@CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@MOTIVO_ANULACION", Value = Data.MOTIVO_ANULACION, DbType = System.Data.DbType.String });
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = "", DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_GENE_COM_DOCUMENTO_ANULAR_CR", true, p);

				Data.CORR_DOCUMENTO = (int)objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
					xWhere.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
					xWhere.Add(new CParameter() { ParameterName = "CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 });

					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_DOCUMENTOView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.CORR_DOCUMENTO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_DOCUMENTO"].Value;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(GenerarCR)";
				}
			}
			catch (System.Exception e)
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

		public async Task<CResult> GetAllDocumentosCRAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();

			try
			{
				var vQry = @$"	SELECT A.*
								FROM V_COM_DOCUMENTO_CR A
								WHERE A.CORR_EMPRESA=@CORR_EMPRESA
								AND A.ANIO_PERIODO=@ANIO_PERIODO
								AND A.MES_PERIODO=@MES_PERIODO
								AND A.CORR_DOCUMENTO=@CORR_DOCUMENTO
							";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<COM_DOCUMENTO_CRView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
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

		

		public async Task<CResult> GetAllAnularAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();

			try
			{
				var vQry = @$"	SELECT A.*
								FROM V_COM_DOCUMENTO_CR_ANULAR A
								WHERE A.FECHA_DOC>=@FECHA_INICIAL
								AND A.FECHA_DOC<=@FECHA_FINAL
								ORDER BY A.FECHA_CR DESC, A.CORR_DOCUMENTO DESC
							";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<COM_DOCUMENTO_CR_ANULARView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
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
	}
}
