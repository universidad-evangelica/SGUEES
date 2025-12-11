using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class COM_CUADRO_COMPARATIVO_ORDEN_COMPRARepository: BaseRepository<COM_CUADRO_COMPARATIVO_ORDEN_COMPRATable>, ICOM_CUADRO_COMPARATIVO_ORDEN_COMPRARepository
	{
		private const string _TableName = "COM_CUADRO_COMPARATIVO_ORDEN_COMPRA";
		
		public COM_CUADRO_COMPARATIVO_ORDEN_COMPRARepository(IConfiguration config) : 
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}
		
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var reader = await objData.GetDataReader("V_"+_TableName, xWhere);
				var response = new List<COM_CUADRO_COMPARATIVO_ORDEN_COMPRAView>().FromDataReader(reader).ToList();
				
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
			CResult objResultado = new();
			
			try
			{
				var reader = await objData.GetDataReader("V_"+_TableName, xWhere);
				var response = new List<COM_CUADRO_COMPARATIVO_ORDEN_COMPRAView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(COM_CUADRO_COMPARATIVO_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="NUMERO_ORDEN",Value=Data.NUMERO_ORDEN,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PROVEEDOR",Value=Data.CORR_PROVEEDOR,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="MONTO_TOTAL_ORDEN",Value=Data.MONTO_TOTAL_ORDEN,DbType=System.Data.DbType.Decimal},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="NUMERO_ORDEN",Value=Data.NUMERO_ORDEN,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Insert(_TableName,p,"CORR_PROVEEDOR",pWhere);
				var response = new List<COM_CUADRO_COMPARATIVO_ORDEN_COMPRAView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_PROVEEDOR;
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
		
		public async Task<CResult> UpdateAsync(COM_CUADRO_COMPARATIVO_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="MONTO_TOTAL_ORDEN",Value=Data.MONTO_TOTAL_ORDEN,DbType=System.Data.DbType.Decimal},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="NUMERO_ORDEN",Value=Data.NUMERO_ORDEN,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PROVEEDOR",Value=Data.CORR_PROVEEDOR,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<COM_CUADRO_COMPARATIVO_ORDEN_COMPRAView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_PROVEEDOR;
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
		
		public async Task<CResult> DeleteAsync(COM_CUADRO_COMPARATIVO_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="NUMERO_ORDEN",Value=Data.NUMERO_ORDEN,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PROVEEDOR",Value=Data.CORR_PROVEEDOR,DbType=System.Data.DbType.Int32},
				};
				
				objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_PROVEEDOR;
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
		public async Task<CResult> GetComCuadroComparativoOrdenImpr(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, "PRAL_IMPR_COM_CUADRO_COMPARATIVO_ORDEN_COMPRA", xWhere);
				var response = new List<COM_ORDEN_COMPRA_IMPRView>().FromDataReader(reader).ToList();

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
	}
}
