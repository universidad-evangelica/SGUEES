using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class CON_PARAMETRORepository : BaseRepository<CON_PARAMETROTable>, ICON_PARAMETRORepository
	{
		private const string _TableName = "CON_PARAMETRO";

		public CON_PARAMETRORepository(IConfiguration config) :
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
				var response = new List<CON_PARAMETROView>().FromDataReader(reader).ToList();
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
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<CON_PARAMETROView>().FromDataReader(reader).FirstOrDefault();
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

		public async Task<CResult> CreateAsync(CON_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="NOMBRE_PUESTO1",Value=Data.NOMBRE_PUESTO1,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="DESCRIPCION_PUESTO1",Value=Data.DESCRIPCION_PUESTO1,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_PUESTO2",Value=Data.NOMBRE_PUESTO2,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="DESCRIPCION_PUESTO2",Value=Data.DESCRIPCION_PUESTO2,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_PUESTO3",Value=Data.NOMBRE_PUESTO3,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="DESCRIPCION_PUESTO3",Value=Data.DESCRIPCION_PUESTO3,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NIVEL_CUENTA_MAYOR",Value=Data.NIVEL_CUENTA_MAYOR,DbType=System.Data.DbType.Int16},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO_DEF",Value=Data.CORR_CENTRO_COSTO_DEF,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_MONEDA",Value=Data.CORR_MONEDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CUENTA_CONTABLE_PERDIDA",Value=Data.CUENTA_CONTABLE_PERDIDA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_GANANCIA",Value=Data.CUENTA_CONTABLE_GANANCIA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_IVA_DEBITO",Value=Data.CUENTA_CONTABLE_IVA_DEBITO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_IVA_CREDITO",Value=Data.CUENTA_CONTABLE_IVA_CREDITO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_IVA_RETENIDO",Value=Data.CUENTA_CONTABLE_IVA_RETENIDO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_IVA_PERCIBIDO",Value=Data.CUENTA_CONTABLE_IVA_PERCIBIDO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_RENTA",Value=Data.CUENTA_CONTABLE_RENTA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_CAJA",Value=Data.CUENTA_CONTABLE_CAJA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_CAJA_CHICA",Value=Data.CUENTA_CONTABLE_CAJA_CHICA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="APLICAR_DOC_CONTA",Value=Data.APLICAR_DOC_CONTA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="PERIODO_MOSTRAR",Value=Data.PERIODO_MOSTRAR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CARACTER_SEPARADOR",Value=Data.CARACTER_SEPARADOR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_CAMBIO_DIFERENCIAL",Value=Data.CUENTA_CONTABLE_CAMBIO_DIFERENCIAL,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_CLASE_PARTIDA_DEFAULT",Value=Data.CORR_CLASE_PARTIDA_DEFAULT,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="OCULTA_CLASE_PARTIDA_BANCOS",Value=Data.OCULTA_CLASE_PARTIDA_BANCOS,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="INCLUIR_PARTIDA_LIQUIDACION",Value=Data.INCLUIR_PARTIDA_LIQUIDACION,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="INCLUIR_PARTIDA_CIERRE",Value=Data.INCLUIR_PARTIDA_CIERRE,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="USA_AUXILIARES",Value=Data.USA_AUXILIARES,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="MOSTRAR_FECHA_IMPRESION",Value=Data.MOSTRAR_FECHA_IMPRESION,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="PREFIJO",Value=Data.PREFIJO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_CAMBIO_DIF_GASTO",Value=Data.CUENTA_CONTABLE_CAMBIO_DIF_GASTO,DbType=System.Data.DbType.String},
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};

				var reader = await objData.Insert(_TableName, p, "", pWhere);
				var response = new List<CON_PARAMETROView>().FromDataReader(reader).FirstOrDefault();

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

		public async Task<CResult> UpdateAsync(CON_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="NOMBRE_PUESTO1",Value=Data.NOMBRE_PUESTO1,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="DESCRIPCION_PUESTO1",Value=Data.DESCRIPCION_PUESTO1,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_PUESTO2",Value=Data.NOMBRE_PUESTO2,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="DESCRIPCION_PUESTO2",Value=Data.DESCRIPCION_PUESTO2,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_PUESTO3",Value=Data.NOMBRE_PUESTO3,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="DESCRIPCION_PUESTO3",Value=Data.DESCRIPCION_PUESTO3,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NIVEL_CUENTA_MAYOR",Value=Data.NIVEL_CUENTA_MAYOR,DbType=System.Data.DbType.Int16},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO_DEF",Value=Data.CORR_CENTRO_COSTO_DEF,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_MONEDA",Value=Data.CORR_MONEDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CUENTA_CONTABLE_PERDIDA",Value=Data.CUENTA_CONTABLE_PERDIDA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_GANANCIA",Value=Data.CUENTA_CONTABLE_GANANCIA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_IVA_DEBITO",Value=Data.CUENTA_CONTABLE_IVA_DEBITO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_IVA_CREDITO",Value=Data.CUENTA_CONTABLE_IVA_CREDITO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_IVA_RETENIDO",Value=Data.CUENTA_CONTABLE_IVA_RETENIDO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_IVA_PERCIBIDO",Value=Data.CUENTA_CONTABLE_IVA_PERCIBIDO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_RENTA",Value=Data.CUENTA_CONTABLE_RENTA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_CAJA",Value=Data.CUENTA_CONTABLE_CAJA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_CAJA_CHICA",Value=Data.CUENTA_CONTABLE_CAJA_CHICA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="APLICAR_DOC_CONTA",Value=Data.APLICAR_DOC_CONTA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="PERIODO_MOSTRAR",Value=Data.PERIODO_MOSTRAR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CARACTER_SEPARADOR",Value=Data.CARACTER_SEPARADOR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_CAMBIO_DIFERENCIAL",Value=Data.CUENTA_CONTABLE_CAMBIO_DIFERENCIAL,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_CLASE_PARTIDA_DEFAULT",Value=Data.CORR_CLASE_PARTIDA_DEFAULT,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="OCULTA_CLASE_PARTIDA_BANCOS",Value=Data.OCULTA_CLASE_PARTIDA_BANCOS,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="INCLUIR_PARTIDA_LIQUIDACION",Value=Data.INCLUIR_PARTIDA_LIQUIDACION,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="INCLUIR_PARTIDA_CIERRE",Value=Data.INCLUIR_PARTIDA_CIERRE,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="USA_AUXILIARES",Value=Data.USA_AUXILIARES,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="MOSTRAR_FECHA_IMPRESION",Value=Data.MOSTRAR_FECHA_IMPRESION,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="PREFIJO",Value=Data.PREFIJO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_CAMBIO_DIF_GASTO",Value=Data.CUENTA_CONTABLE_CAMBIO_DIF_GASTO,DbType=System.Data.DbType.String},
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<CON_PARAMETROView>().FromDataReader(reader).FirstOrDefault();
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

		public async Task<CResult> DeleteAsync(CON_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};

				await objData.Delete(_TableName, pWhere);

				objResultado.Data = null;
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
