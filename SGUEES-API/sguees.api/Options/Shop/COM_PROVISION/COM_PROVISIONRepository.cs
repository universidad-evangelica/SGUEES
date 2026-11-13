using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using eFramework.Core;
using eFramework.Data;
using eadmindevprojectmanagement.Models;

namespace eadmindevprojectmanagement.Repositories
{
	public class COM_PROVISIONRepository : BaseRepository<COM_PROVISIONTable>, ICOM_PROVISIONRepository
	{
		private const string _TableName = "COM_PROVISION";

		public COM_PROVISIONRepository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();

			try
			{
				var vQry = @$"SELECT A.*
								FROM V_COM_PROVISION A
								WHERE A.CORR_EMPRESA=@CORR_EMPRESA
								AND A.FECHA_PROVISION>=@FECHA_INICIAL
								AND A.FECHA_PROVISION<=@FECHA_FINAL
								ORDER BY A.FECHA_PROVISION DESC, A.CORR_PROVISION DESC";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<COM_PROVISIONView>().FromDataReader(reader).ToList();

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
			CResult objResultado = new CResult();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<COM_PROVISIONView>().FromDataReader(reader).FirstOrDefault();

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

		public async Task<CResult> CreateAsync(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await Save(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Add);
		}

		public async Task<CResult> UpdateAsync(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await Save(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Update);
		}

		public async Task<CResult> DeleteAsync(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();

			try
			{
				var p = BuildMttoParameters(Data, UpdateType.Delete);

				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);

				var sysError = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
				var rowsAffected = (int)objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value;
				var codeHelper = objData.objCommand.Parameters["@CORR_PROVISION"].Value;
				var errorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;

				objResultado.Data = null;
				objResultado.Result = sysError == 0;
				objResultado.RowsAffected = rowsAffected;
				objResultado.CodeHelper = codeHelper;
				objResultado.ErrorCode = sysError;
				objResultado.ErrorMessage = errorMessage;
				objResultado.ErrorSource = "C" + _TableName + ".Delete(" + UpdateType.Delete + ")";
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

			return objResultado;
		}

		public async Task<CResult> Save(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION, UpdateType Tipo)
		{
			CResult objResultado = new CResult();

			try
			{
				var p = BuildMttoParameters(Data, Tipo);

				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);

				var sysError = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;

				if (sysError == 0)
				{
					Data.CORR_PROVISION = (int)objData.objCommand.Parameters["@CORR_PROVISION"].Value;

					var xWhere = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PROVISION", Value = Data.CORR_PROVISION, DbType = System.Data.DbType.Int32 },
					};

					var readerget = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_PROVISIONView>().FromDataReader(readerget).FirstOrDefault();

					readerget.Close();
					readerget = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_PROVISION;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (int)objData.objCommand.Parameters["@CORR_PROVISION"].Value;
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

		public async Task<CResult> AplicarAsync(COM_PROVISIONTable Data)
		{
			CResult objResultado = new();

			try
			{
				var p = BuildProcesoParameters(Data);

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName + "_APLICAR", true, p);

				var sysError = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
				Data.CORR_PROVISION = (int)objData.objCommand.Parameters["@CORR_PROVISION"].Value;

				if (sysError == 0)
				{
					var xWhere = BuildPkWhere(Data);
					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_PROVISIONView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response?.CORR_PROVISION ?? Data.CORR_PROVISION;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_PROVISION;
					objResultado.ErrorCode = sysError;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(Aplicar)";
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

		public async Task<CResult> AnularAsync(COM_PROVISIONTable Data)
		{
			CResult objResultado = new();

			try
			{
				var p = BuildProcesoParameters(Data);
				p.Add(new CParameter() { ParameterName = "@FECHA_ANULACION", Value = Data.FECHA_ANULACION ?? DateTime.Today, DbType = System.Data.DbType.Date });

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName + "_ANULAR", true, p);

				var sysError = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
				Data.CORR_PROVISION = (int)objData.objCommand.Parameters["@CORR_PROVISION"].Value;

				if (sysError == 0)
				{
					var xWhere = BuildPkWhere(Data);
					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_PROVISIONView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response?.CORR_PROVISION ?? Data.CORR_PROVISION;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_PROVISION;
					objResultado.ErrorCode = sysError;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(Anular)";
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

		public async Task<CResult> DesAplicarAsync(COM_PROVISIONTable Data)
		{
			CResult objResultado = new();

			try
			{
				var p = BuildProcesoParameters(Data);

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName + "_DESAPLICAR", true, p);

				var sysError = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
				Data.CORR_PROVISION = (int)objData.objCommand.Parameters["@CORR_PROVISION"].Value;

				if (sysError == 0)
				{
					var xWhere = BuildPkWhere(Data);
					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<COM_PROVISIONView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response?.CORR_PROVISION ?? Data.CORR_PROVISION;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_PROVISION;
					objResultado.ErrorCode = sysError;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(DesAplicar)";
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

		public async Task<CResult> BorrarDetalleAsync(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();

			try
			{
				var p = BuildMttoParameters(Data, (UpdateType)4);

				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);

				var sysError = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
				objResultado.Data = null;
				objResultado.Result = sysError == 0;
				objResultado.RowsAffected = (int)objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value;
				objResultado.CodeHelper = objData.objCommand.Parameters["@CORR_PROVISION"].Value;
				objResultado.ErrorCode = sysError;
				objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
				objResultado.ErrorSource = "C" + _TableName + ".BorrarDetalle";
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

			return objResultado;
		}

		public async Task<CResult> GenerarContaAsync(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@CORR_PROVISION", Value = Data.CORR_PROVISION, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_GENE_COM_PROVISION_CONTA", true, p);

				var sysError = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
				Data.CORR_PROVISION = (int)objData.objCommand.Parameters["@CORR_PROVISION"].Value;

				objResultado.Data = null;
				objResultado.Result = sysError == 0;
				objResultado.RowsAffected = (int)objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value;
				objResultado.CodeHelper = Data.CORR_PROVISION;
				objResultado.ErrorCode = sysError;
				objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
				objResultado.ErrorSource = "C" + _TableName + ".GenerarConta";
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

		public async Task<CResult> GetAllDesAplicarAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();

			try
			{
				var vQry = @$"SELECT A.*
								FROM V_COM_PROVISION_SELECCION A
								WHERE A.CORR_EMPRESA=@CORR_EMPRESA
								AND A.FECHA_PROVISION>=@FECHA_INICIAL
								AND A.FECHA_PROVISION<=@FECHA_FINAL
								AND A.ESTADO_PROVISION='AP'
								ORDER BY A.FECHA_PROVISION DESC, A.CORR_PROVISION DESC";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<COM_PROVISION_SELECCIONView>().FromDataReader(reader).ToList();

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

		private static List<CParameter> BuildPkWhere(COM_PROVISIONTable Data)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PROVISION", Value = Data.CORR_PROVISION, DbType = System.Data.DbType.Int32 },
			};
		}

		private static List<CParameter> BuildProcesoParameters(COM_PROVISIONTable Data)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_PROVISION", Value = Data.CORR_PROVISION, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = Data.USUARIO_ACTU ?? "", DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@SYS_ESTACION", Value = "", DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
			};
		}

		private static List<CParameter> BuildMttoParameters(COM_PROVISIONTable Data, UpdateType Tipo)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = Tipo, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_PROVISION", Value = Data.CORR_PROVISION, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@FECHA_PROVISION", Value = Data.FECHA_PROVISION, DbType = System.Data.DbType.Date },
				new CParameter() { ParameterName = "@CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@NOMBRE_PARTIDA", Value = Data.NOMBRE_PARTIDA ?? "", DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@MONTO_PAGO", Value = Data.MONTO_PAGO, DbType = System.Data.DbType.Decimal },
				new CParameter() { ParameterName = "@ANIO_PERIODO_PARTIDA", Value = Data.ANIO_PERIODO_PARTIDA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@MES_PERIODO_PARTIDA", Value = Data.MES_PERIODO_PARTIDA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@ESTADO_PROVISION", Value = Data.ESTADO_PROVISION ?? "", DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@NOMBRE_BENEFICIARIO", Value = Data.NOMBRE_BENEFICIARIO ?? "", DbType = System.Data.DbType.String },
			};
		}
	}
}
