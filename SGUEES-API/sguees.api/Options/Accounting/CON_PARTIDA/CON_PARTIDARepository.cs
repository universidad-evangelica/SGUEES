using System.Collections.Generic;
using System.Threading.Tasks;
using System.Data;
using System.Data.Common;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class CON_PARTIDARepository : BaseRepository<CON_PARTIDATable>, ICON_PARTIDARepository
	{
		private const string _TableName = "CON_PARTIDA";
		private const string _DetaTableName = "CON_PARTIDA_DETA";

		public CON_PARTIDARepository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var corrPartida = System.Convert.ToInt32(
					xWhere.FirstOrDefault(p => p.ParameterName == "CORR_PARTIDA")?.Value ?? 0);
				var fechaInicial = xWhere.FirstOrDefault(p => p.ParameterName == "FECHA_INICIAL")?.Value;
				var fechaFinal = xWhere.FirstOrDefault(p => p.ParameterName == "FECHA_FINAL")?.Value;

				var reader = corrPartida == 0 && fechaInicial != null && fechaFinal != null
					? await objData.GetDataReader(System.Data.CommandType.Text, @"
						SELECT A.*
						FROM V_CON_PARTIDA A
						WHERE A.CORR_EMPRESA=@CORR_EMPRESA
						AND A.FECHA_PARTIDA>=@FECHA_INICIAL
						AND A.FECHA_PARTIDA<=@FECHA_FINAL
						ORDER BY A.FECHA_PARTIDA DESC, A.CORR_PARTIDA DESC", xWhere)
					: await objData.GetDataReader("V_" + _TableName, xWhere);

				var response = new List<CON_PARTIDAView>().FromDataReader(reader).ToList();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true;
				objResultado.RowsAffected = response.Count; objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<CON_PARTIDAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> CreateAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="MES_PERIODO",Value=Data.MES_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=Data.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PARTIDA",Value=Data.CORR_PARTIDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="FECHA_PARTIDA",Value=Data.FECHA_PARTIDA,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="NUMERO_DOCUMENTO",Value=Data.NUMERO_DOCUMENTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_PARTIDA",Value=Data.NOMBRE_PARTIDA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_PARTIDA",Value=Data.ESTADO_PARTIDA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CLASE_PARTIDA",Value=Data.CLASE_PARTIDA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_MONEDA",Value=Data.CORR_MONEDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="FACTOR_CAMBIO",Value=Data.FACTOR_CAMBIO,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="OPERADOR",Value=Data.OPERADOR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_CREA",Value=vLOGIN_SISTEMA ?? "",DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_CREA",Value=System.DateTime.Now,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="ESTACION_CREA",Value=vESTACION ?? "",DbType=System.Data.DbType.String},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Insert(_TableName, p, "CORR_PARTIDA", pWhere);
				var response = new List<CON_PARTIDAView>().FromDataReader(reader).FirstOrDefault();
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> UpdateAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="FECHA_PARTIDA",Value=Data.FECHA_PARTIDA,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="NUMERO_DOCUMENTO",Value=Data.NUMERO_DOCUMENTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_PARTIDA",Value=Data.NOMBRE_PARTIDA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_PARTIDA",Value=Data.ESTADO_PARTIDA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CLASE_PARTIDA",Value=Data.CLASE_PARTIDA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_MONEDA",Value=Data.CORR_MONEDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="FACTOR_CAMBIO",Value=Data.FACTOR_CAMBIO,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="OPERADOR",Value=Data.OPERADOR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_ACTU",Value=vLOGIN_SISTEMA ?? "",DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_ACTU",Value=System.DateTime.Now,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="ESTACION_ACTU",Value=vESTACION ?? "",DbType=System.Data.DbType.String},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="MES_PERIODO",Value=Data.MES_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=Data.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PARTIDA",Value=Data.CORR_PARTIDA,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<CON_PARTIDAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> DeleteAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="MES_PERIODO",Value=Data.MES_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=Data.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PARTIDA",Value=Data.CORR_PARTIDA,DbType=System.Data.DbType.Int32},
				};
				await objData.Delete(_TableName, pWhere);
				objResultado.Data = null; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> GetAllAplicarAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var vQry = @"
					SELECT A.*, CONVERT(BIT,0) AS SELECCION
					FROM V_CON_PARTIDA_APLICAR A
					WHERE A.CORR_EMPRESA=@CORR_EMPRESA
					AND A.FECHA_PARTIDA>=@FECHA_INICIAL
					AND A.FECHA_PARTIDA<=@FECHA_FINAL
					AND A.ESTADO_PARTIDA = CASE WHEN @OPCION_CONSULTA=1 THEN 'DI' ELSE 'AP' END
					AND (@OPCION_CONSULTA<>1 OR (A.MONTO_CARGO=A.MONTO_ABONO AND A.MONTO_CARGO>0))
					ORDER BY A.FECHA_PARTIDA DESC, A.CORR_PARTIDA DESC";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, vQry, xWhere);
				var response = new List<CON_PARTIDA_APLICARView>().FromDataReader(reader).ToList();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true;
				objResultado.RowsAffected = response.Count; objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> AplicarAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await ExecPartidaOperacionAsync(Data, vLOGIN_SISTEMA, vESTACION, "PRAL_MTTO_CON_PARTIDA_APLICAR");
		}

		public async Task<CResult> DesAplicarAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await ExecPartidaOperacionAsync(Data, vLOGIN_SISTEMA, vESTACION, "PRAL_MTTO_CON_PARTIDA_DESAPLICAR");
		}

		public async Task<CResult> AnularAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await ExecPartidaOperacionAsync(Data, vLOGIN_SISTEMA, vESTACION, "PRAL_MTTO_CON_PARTIDA_ANULAR");
		}

		public async Task<CResult> CrearPartidaModeloAsync(CON_PARTIDAParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await ExecPartidaModeloGeneAsync(Data, vLOGIN_SISTEMA, vESTACION, "PRAL_GENE_CON_PARTIDA_MODELO");
		}

		public async Task<CResult> CrearModeloAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await ExecPartidaModeloCreaAsync(Data, vLOGIN_SISTEMA, vESTACION, "PRAL_GENE_CON_PARTIDA_MODELO_CREA");
		}

		public async Task<CResult> ImportarExcelAsync(CON_PARTIDA_IMPORTParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				if (Data.Rows == null || Data.Rows.Count == 0)
				{
					objResultado.Data = 0;
					objResultado.Result = true;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
					return objResultado;
				}

				var groups = Data.Rows
					.GroupBy(r => new { Fecha = r.FECHA_PARTIDA.Date, r.NUMERO_DOCUMENTO })
					.ToList();

				int partidasCreadas = 0;

				foreach (var group in groups)
				{
					var first = group.First();
					var anioPeriodo = first.FECHA_PARTIDA.Year;
					var mesPeriodo = first.FECHA_PARTIDA.Month;

					var pHeader = new List<CParameter>
					{
						new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
						new CParameter() {ParameterName="ANIO_PERIODO",Value=anioPeriodo,DbType=System.Data.DbType.Int32},
						new CParameter() {ParameterName="MES_PERIODO",Value=mesPeriodo,DbType=System.Data.DbType.Int32},
						new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=Data.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
						new CParameter() {ParameterName="CORR_PARTIDA",Value=0,DbType=System.Data.DbType.Int32},
						new CParameter() {ParameterName="FECHA_PARTIDA",Value=first.FECHA_PARTIDA,DbType=System.Data.DbType.DateTime},
						new CParameter() {ParameterName="NUMERO_DOCUMENTO",Value=first.NUMERO_DOCUMENTO,DbType=System.Data.DbType.String},
						new CParameter() {ParameterName="NOMBRE_PARTIDA",Value=first.NOMBRE_TRAN ?? "",DbType=System.Data.DbType.String},
						new CParameter() {ParameterName="ESTADO_PARTIDA",Value="DI",DbType=System.Data.DbType.String},
						new CParameter() {ParameterName="CLASE_PARTIDA",Value="NOR",DbType=System.Data.DbType.String},
						new CParameter() {ParameterName="USUARIO_CREA",Value=vLOGIN_SISTEMA ?? "",DbType=System.Data.DbType.String},
						new CParameter() {ParameterName="FECHA_CREA",Value=System.DateTime.Now,DbType=System.Data.DbType.DateTime},
						new CParameter() {ParameterName="ESTACION_CREA",Value=vESTACION ?? "",DbType=System.Data.DbType.String},
					};
					var pWhereHeader = new List<CParameter>
					{
						new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					};
					var readerHeader = await objData.Insert(_TableName, pHeader, "CORR_PARTIDA", pWhereHeader);
					var partida = new List<CON_PARTIDAView>().FromDataReader(readerHeader).FirstOrDefault();
					readerHeader.Close(); readerHeader = null;

					foreach (var row in group)
					{
						var pDeta = new List<CParameter>
						{
							new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
							new CParameter() {ParameterName="ANIO_PERIODO",Value=anioPeriodo,DbType=System.Data.DbType.Int32},
							new CParameter() {ParameterName="MES_PERIODO",Value=mesPeriodo,DbType=System.Data.DbType.Int32},
							new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=Data.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
							new CParameter() {ParameterName="CORR_PARTIDA",Value=partida.CORR_PARTIDA,DbType=System.Data.DbType.Int32},
							new CParameter() {ParameterName="CORR_PARTIDA_DETA",Value=0,DbType=System.Data.DbType.Int32},
							new CParameter() {ParameterName="CUENTA_CONTABLE",Value=row.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
							new CParameter() {ParameterName="CORR_CENTRO_COSTO",Value=row.CORR_CENTRO_COSTO,DbType=System.Data.DbType.Int32},
							new CParameter() {ParameterName="NOMBRE_TRAN",Value=row.NOMBRE_TRAN,DbType=System.Data.DbType.String},
							new CParameter() {ParameterName="MONTO_CARGO",Value=row.MONTO_CARGO,DbType=System.Data.DbType.Decimal},
							new CParameter() {ParameterName="MONTO_ABONO",Value=row.MONTO_ABONO,DbType=System.Data.DbType.Decimal},
							new CParameter() {ParameterName="ESTA_CONCILIA",Value=false,DbType=System.Data.DbType.Boolean},
						};
						var pWhereDeta = new List<CParameter>
						{
							new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
						};
						var readerDeta = await objData.Insert(_DetaTableName, pDeta, "CORR_PARTIDA_DETA", pWhereDeta);
						readerDeta.Close(); readerDeta = null;
					}

					partidasCreadas++;
				}

				objResultado.Data = partidasCreadas;
				objResultado.Result = true;
				objResultado.RowsAffected = partidasCreadas;
				objResultado.CodeHelper = partidasCreadas;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> GetAllDetaDocAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_CON_PARTIDA_DETA_DOC", xWhere);
				var response = new List<CON_PARTIDA_DETA_DOCView>().FromDataReader(reader).ToList();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true;
				objResultado.RowsAffected = response.Count; objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		private async Task<CResult> ExecPartidaOperacionAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION, string spName)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@USUARIO_ACTU", Value = Data.USUARIO_ACTU ?? vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@FECHA_ACTU", Value = Data.FECHA_ACTU ?? System.DateTime.Now, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "@ESTACION_ACTU", Value = vESTACION ?? "", DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Decimal, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, spName, true, p);

				if ((decimal)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32 },
					};
					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<CON_PARTIDAView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_PARTIDA;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_PARTIDA;
					objResultado.ErrorCode = (int)(decimal)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + spName + ")";
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
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		private async Task<CResult> ExecPartidaModeloGeneAsync(CON_PARTIDAParam Data, string vLOGIN_SISTEMA, string vESTACION, string spName)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@FECHA_PARTIDA", Value = Data.FECHA_PARTIDA, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "@USUARIO_CREA", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@FECHA_CREA", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "@ESTACION_CREA", Value = vESTACION ?? "", DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@USUARIO_ACTU", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@FECHA_ACTU", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "@ESTACION_ACTU", Value = vESTACION ?? "", DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Decimal, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, spName, true, p);

				if ((decimal)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var corrPartida = (int)objData.objCommand.Parameters["@CORR_PARTIDA"].Value;
					var xWhere = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PARTIDA", Value = corrPartida, DbType = System.Data.DbType.Int32 },
					};
					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<CON_PARTIDAView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = corrPartida;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_PARTIDA;
					objResultado.ErrorCode = (int)(decimal)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Gene(" + spName + ")";
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
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		private async Task<CResult> ExecPartidaModeloCreaAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION, string spName)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@USUARIO_CREA", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@FECHA_CREA", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "@ESTACION_CREA", Value = vESTACION ?? "", DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@USUARIO_ACTU", Value = Data.USUARIO_ACTU ?? vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@FECHA_ACTU", Value = Data.FECHA_ACTU ?? System.DateTime.Now, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "@ESTACION_ACTU", Value = vESTACION ?? "", DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Decimal, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, spName, true, p);

				if ((decimal)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var corrPartidaModelo = (int)objData.objCommand.Parameters["@CORR_PARTIDA"].Value;
					var xWhere = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PARTIDA", Value = corrPartidaModelo, DbType = System.Data.DbType.Int32 },
					};
					var readerGet = await objData.GetDataReader("V_CON_PARTIDA_MODELO", xWhere);
					var response = new List<CON_PARTIDA_MODELOView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = corrPartidaModelo;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_PARTIDA;
					objResultado.ErrorCode = (int)(decimal)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Gene(" + spName + ")";
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
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> GetConPartidaImpr(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(CommandType.StoredProcedure, "PRAL_IMPR_CON_PARTIDA_CONTABLE", xWhere);
				var response = new List<CON_PARTIDA_IMPRView>().FromDataReader(reader).ToList();
				if (reader.NextResult())
				{
					var header = new List<CON_PARTIDA_IMPRView>().FromDataReader(reader).FirstOrDefault();
					if (header != null)
					{
						foreach (var row in response)
						{
							row.NOMBRE_EMPRESA = header.NOMBRE_EMPRESA;
							row.PERIODO = header.PERIODO;
							row.LOGO1 = header.LOGO1;
							row.LOGO2 = header.LOGO2;
							row.TITULO_REPORTE = header.TITULO_REPORTE;
							row.NOMBRE_SISTEMA = header.NOMBRE_SISTEMA;
							row.FECHA_IMPRESION = header.FECHA_IMPRESION;
						}
					}
				}

				reader.Close();
				objResultado.Data = response;
				objResultado.Result = response.Count > 0;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = response.Count > 0 ? 0 : -1;
				objResultado.ErrorMessage = response.Count > 0 ? "" : "No hay datos para imprimir la partida.";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public Task<CResult> ConsultarParaImprAsync(CON_PARTIDAParam param)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "@CORR_EMPRESA", Value = param.CORR_EMPRESA, DbType = DbType.Int32 },
				new CParameter() { ParameterName = "@FECHA_INICIAL", Value = param.FECHA_INICIAL, DbType = DbType.Date },
				new CParameter() { ParameterName = "@FECHA_FINAL", Value = param.FECHA_FINAL, DbType = DbType.Date },
				new CParameter() { ParameterName = "@ANIO_PERIODO", Value = param.ANIO_PERIODO, DbType = DbType.Int32 },
				new CParameter() { ParameterName = "@MES_PERIODO", Value = param.MES_PERIODO, DbType = DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_CLASE_PARTIDA", Value = param.CORR_CLASE_PARTIDA, DbType = DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_PARTIDA", Value = param.CORR_PARTIDA, DbType = DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_PARTIDA_INICIAL", Value = 0, DbType = DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_PARTIDA_FINAL", Value = 0, DbType = DbType.Int32 },
				new CParameter() { ParameterName = "@FOLIADO", Value = false, DbType = DbType.Boolean },
				new CParameter() { ParameterName = "@NUMERO_FOLIO", Value = 0, DbType = DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_MONEDA", Value = 0, DbType = DbType.Int32 },
				new CParameter() { ParameterName = "@OPCION_CONSULTA", Value = 0, DbType = DbType.Int32 },
			};

			return GetConPartidaImpr(p);
		}

		public Task<CResult> GenerarPartidaLiquidacionAsync(CON_PARTIDAParam param, string vLOGIN_SISTEMA, string vESTACION)
			=> ExecPartidaGeneEspecialAsync(param, vLOGIN_SISTEMA, vESTACION, "PRAL_GENE_PARTIDA_LIQUIDACION");

		public Task<CResult> GenerarPartidaCierreAsync(CON_PARTIDAParam param, string vLOGIN_SISTEMA, string vESTACION)
			=> ExecPartidaGeneEspecialAsync(param, vLOGIN_SISTEMA, vESTACION, "PRAL_GENE_PARTIDA_CIERRE");

		public Task<CResult> GenerarPartidaAperturaAsync(CON_PARTIDAParam param, string vLOGIN_SISTEMA, string vESTACION)
			=> ExecPartidaGeneEspecialAsync(param, vLOGIN_SISTEMA, vESTACION, "PRAL_GENE_PARTIDA_APERTURA");

		private async Task<CResult> ExecPartidaGeneEspecialAsync(CON_PARTIDAParam Data, string vLOGIN_SISTEMA, string vESTACION, string spName)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
					new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = DbType.Int32 },
					new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = DbType.Int32 },
					new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? "", DbType = DbType.String },
					new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = DbType.String },
					new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = DbType.Int32, Direction = ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = DbType.Decimal, Direction = ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = DbType.String, Direction = ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(CommandType.StoredProcedure, spName, true, p);

				if ((decimal)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					objResultado.Data = null;
					objResultado.Result = true;
					objResultado.RowsAffected = (int)objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value;
					objResultado.CodeHelper = Data.MES_PERIODO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = (int)(decimal)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Gene(" + spName + ")";
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
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		private static List<Dictionary<string, object>> ReadRowsWithHeader(DbDataReader reader)
		{
			var detail = ReadRows(reader);
			if (!reader.NextResult())
			{
				return detail;
			}

			Dictionary<string, object> header = null;
			if (reader.Read())
			{
				header = new Dictionary<string, object>(System.StringComparer.OrdinalIgnoreCase);
				for (var i = 0; i < reader.FieldCount; i++)
				{
					header[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
				}
			}

			if (header == null || detail.Count == 0)
			{
				return detail;
			}

			foreach (var row in detail)
			{
				foreach (var item in header)
				{
					if (!row.ContainsKey(item.Key))
					{
						row[item.Key] = item.Value;
					}
				}
			}

			return detail;
		}

		private static List<Dictionary<string, object>> ReadRows(DbDataReader reader)
		{
			var rows = new List<Dictionary<string, object>>();
			while (reader.Read())
			{
				var row = new Dictionary<string, object>(System.StringComparer.OrdinalIgnoreCase);
				for (var i = 0; i < reader.FieldCount; i++)
				{
					row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
				}
				rows.Add(row);
			}
			return rows;
		}
	}
}
