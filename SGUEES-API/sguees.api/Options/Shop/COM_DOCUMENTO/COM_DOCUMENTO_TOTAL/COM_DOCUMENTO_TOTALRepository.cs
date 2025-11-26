using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using eadmindevprojectmanagement.Models;

namespace eadmindevprojectmanagement.Repositories
{
	public class COM_DOCUMENTO_TOTALRepository: BaseRepository<COM_DOCUMENTO_TOTALTable>, ICOM_DOCUMENTO_TOTALRepository
	{
		private const string _TableName = "COM_DOCUMENTO_TOTAL";
		
		public COM_DOCUMENTO_TOTALRepository(IConfiguration config) : 
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}
		
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var xQry = $@"SELECT *
							FROM V_COM_DOCUMENTO_TOTAL A
							WHERE A.CORR_EMPRESA=@CORR_EMPRESA
							AND A.ANIO_PERIODO=@ANIO_PERIODO
							AND A.MES_PERIODO=@MES_PERIODO
							AND A.CORR_DOCUMENTO=@CORR_DOCUMENTO
							ORDER BY A.ORDEN_TOTAL ASC
							";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text,xQry,xWhere);
				var response = new List<COM_DOCUMENTO_TOTALView>().FromDataReader(reader).ToList();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper =  0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource ="";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
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
				var reader = await objData.GetDataReader("V_"+_TableName, xWhere);
				var response = new List<COM_DOCUMENTO_TOTALView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper =  0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource ="";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}
			
			return objResultado;
		}
		
		public async Task<CResult> CreateAsync(COM_DOCUMENTO_TOTALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="MES_PERIODO",Value=Data.MES_PERIODO,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CORR_DOCUMENTO",Value=Data.CORR_DOCUMENTO,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=Data.CORR_RUBRO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput});
				p.Add(new CParameter() {ParameterName="MONTO_RUBRO",Value=Data.MONTO_RUBRO,DbType=System.Data.DbType.Decimal});
				p.Add(new CParameter() {ParameterName="IMPUESTO_INCLUIDO",Value=Data.IMPUESTO_INCLUIDO,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="ORDEN_TOTAL",Value=Data.ORDEN_TOTAL,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="PERMITE_EDITAR",Value=Data.PERMITE_EDITAR,DbType=System.Data.DbType.Boolean});
				
				var pWhere = new List<CParameter>();
				pWhere.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="MES_PERIODO",Value=Data.MES_PERIODO,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="CORR_DOCUMENTO",Value=Data.CORR_DOCUMENTO,DbType=System.Data.DbType.Int32});
				
				var reader = await objData.Insert(_TableName,p,"CORR_RUBRO",pWhere);
				var response = new List<COM_DOCUMENTO_TOTALView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_RUBRO;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource ="";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}
			
			return objResultado;
		}
		
		public async Task<CResult> UpdateAsync(COM_DOCUMENTO_TOTALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await Save(Data, vLOGIN_SISTEMA, vESTACION, UpdateType.Update);
		}
		
		public async Task<CResult> DeleteAsync(COM_DOCUMENTO_TOTALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var pWhere = new List<CParameter>();
				pWhere.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="MES_PERIODO",Value=Data.MES_PERIODO,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="CORR_DOCUMENTO",Value=Data.CORR_DOCUMENTO,DbType=System.Data.DbType.Int32});
				pWhere.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=Data.CORR_RUBRO,DbType=System.Data.DbType.Int32});
				
				objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_RUBRO;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource ="";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			
			return objResultado;
		}

		public async Task<CResult> Save(COM_DOCUMENTO_TOTALTable Data, string vLOGIN_SISTEMA, string vESTACION, UpdateType Tipo)
		{
			CResult objResultado = new CResult();

			try
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() {ParameterName="@TIPO_ACTUALIZA", Value = Tipo, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() {ParameterName="@CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="@ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="@MES_PERIODO",Value=Data.MES_PERIODO,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="@CORR_DOCUMENTO",Value=Data.CORR_DOCUMENTO,DbType=System.Data.DbType.Int32});
				p.Add(new CParameter() {ParameterName="@CORR_RUBRO",Value=Data.CORR_RUBRO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput});
				p.Add(new CParameter() {ParameterName="@MONTO_RUBRO",Value=Data.MONTO_RUBRO,DbType=System.Data.DbType.Decimal});
				// p.Add(new CParameter() {ParameterName="@IMPUESTO_INCLUIDO",Value=Data.IMPUESTO_INCLUIDO,DbType=System.Data.DbType.Int32});
				// p.Add(new CParameter() {ParameterName="@ORDEN_TOTAL",Value=Data.ORDEN_TOTAL,DbType=System.Data.DbType.Int32});
				// p.Add(new CParameter() {ParameterName="@PERMITE_EDITAR",Value=Data.PERMITE_EDITAR,DbType=System.Data.DbType.Boolean});
				
				
				//Parametros para gestionar la operación
				p.Add(new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION, DbType = System.Data.DbType.String });
				p.Add(new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
				p.Add(new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 });

				var vResultado = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					Data.CORR_RUBRO = (int)objData.objCommand.Parameters["@CORR_RUBRO"].Value;

					p.Clear();

					p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "CORR_RUBRO", Value = Data.CORR_RUBRO, DbType = System.Data.DbType.Int32 });

					var readerget = await objData.GetDataReader("V_"+_TableName, p);
					var response = new List<COM_DOCUMENTOView>().FromDataReader(readerget).FirstOrDefault();

					readerget.Close();
					readerget = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = Data.CORR_RUBRO;
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

		public async Task<CResult> GetAllRubrosTemporalesAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new CResult();
			
			try
			{
				var xQry = $@"
							DECLARE @COM_DOCUMENTO_TOTAL AS TABLE
							( 
								CORR_EMPRESA INT,
								ANIO_PERIODO INT,
								MES_PERIODO INT,
								CORR_DOCUMENTO INT,
								CORR_RUBRO INT,
								NOMBRE_RUBRO VARCHAR(100),
								MONTO_RUBRO DECIMAL(18,6),
								IMPUESTO_INCLUIDO BIT,
								ORDEN_TOTAL INT,
								PERMITE_EDITAR BIT
							)

							INSERT INTO @COM_DOCUMENTO_TOTAL
							(
								CORR_EMPRESA
								,ANIO_PERIODO
								,MES_PERIODO
								,CORR_DOCUMENTO
								,CORR_RUBRO
								,NOMBRE_RUBRO
								,MONTO_RUBRO
								,IMPUESTO_INCLUIDO
								,ORDEN_TOTAL
								,PERMITE_EDITAR
							)
							SELECT
								@CORR_EMPRESA
								,@ANIO_PERIODO
								,@MES_PERIODO
								,@CORR_DOCUMENTO
								,B.CORR_RUBRO
								,C.NOMBRE_RUBRO
								,0 MONTO_RUBRO
								,0 IMPUESTO_INCLUIDO
								,B.ORDEN_TOTAL
								,B.PERMITE_EDITAR
								FROM GEN_TIPO_DOCUMENTO_RUBRO B 
								INNER JOIN GEN_RUBRO C ON B.CORR_EMPRESA=C.CORR_EMPRESA AND B.CORR_RUBRO=C.CORR_RUBRO 
								WHERE B.CORR_EMPRESA=@CORR_EMPRESA
								AND B.CORR_TIPO_DOC=@CORR_TIPO_DOC
								AND C.MUESTRA_TOTAL=1 
							

							INSERT INTO @COM_DOCUMENTO_TOTAL
							(
								CORR_EMPRESA
								,ANIO_PERIODO
								,MES_PERIODO
								,CORR_DOCUMENTO
								,CORR_RUBRO
								,NOMBRE_RUBRO
								,MONTO_RUBRO
								,IMPUESTO_INCLUIDO
								,ORDEN_TOTAL
								,PERMITE_EDITAR
							)
							SELECT 
							    @CORR_EMPRESA
								,@ANIO_PERIODO
								,@MES_PERIODO
								,@CORR_DOCUMENTO
								,B.CORR_RUBRO
								,C.NOMBRE_RUBRO
								,0 MONTO_RUBRO
								,0 IMPUESTO_INCLUIDO
								, B.ORDEN_TOTAL
								, ISNULL(B.PERMITE_EDITAR,1) PERMITE_EDITAR 
								FROM GEN_TIPO_GASTO_IMPUESTO B
								INNER JOIN GEN_RUBRO C ON B.CORR_EMPRESA=C.CORR_EMPRESA AND B.CORR_RUBRO=C.CORR_RUBRO 
								WHERE B.CORR_EMPRESA=@CORR_EMPRESA
								AND B.CORR_TIPO_GASTO=@CORR_TIPO_GASTO
								AND NOT EXISTS (SELECT 1 FROM @COM_DOCUMENTO_TOTAL D WHERE D.CORR_RUBRO=B.CORR_RUBRO)

							SELECT *
							FROM @COM_DOCUMENTO_TOTAL
							ORDER BY ORDEN_TOTAL ASC
							";

				var reader = await objData.GetDataReader(System.Data.CommandType.Text,xQry,xWhere);
				var response = new List<COM_DOCUMENTO_TOTALView>().FromDataReader(reader).ToList();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper =  0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource ="";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
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
