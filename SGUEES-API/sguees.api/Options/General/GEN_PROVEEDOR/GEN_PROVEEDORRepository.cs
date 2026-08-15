using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_PROVEEDORRepository : BaseRepository<GEN_PROVEEDORTable>, IGEN_PROVEEDORRepository
	{
		private const string _TableName = "GEN_PROVEEDOR";
		private const string _ViewName = "V_GEN_PROVEEDOR";

		public GEN_PROVEEDORRepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<GEN_PROVEEDORView>().FromDataReader(reader).ToList();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = string.Empty;
				objResultado.ErrorSource = string.Empty;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
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
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<GEN_PROVEEDORView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = string.Empty;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> CreateAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = BuildInsertParameters(Data);
				var pWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				};
				var reader = await objData.Insert(_TableName, p, "CORR_PROVEEDOR", pWhere);
				var response = new List<GEN_PROVEEDORView>().FromDataReader(reader).FirstOrDefault();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_PROVEEDOR ?? 0;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> UpdateAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = BuildUpdateParameters(Data);
				var pWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<GEN_PROVEEDORView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> DeleteAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
				};
				await objData.Delete(_TableName, pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		private static List<CParameter> BuildInsertParameters(GEN_PROVEEDORTable Data)
		{
			return new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CODIGO_PROVEEDOR", Value = Data.CODIGO_PROVEEDOR ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "TIPO_PERSONERIA", Value = Data.TIPO_PERSONERIA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "NOMBRE_PROVEEDOR", Value = Data.NOMBRE_PROVEEDOR ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "PRIMER_NOMBRE", Value = Data.PRIMER_NOMBRE ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "SEGUNDO_NOMBRE", Value = Data.SEGUNDO_NOMBRE ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "PRIMER_APELLIDO", Value = Data.PRIMER_APELLIDO ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "SEGUNDO_APELLIDO", Value = Data.SEGUNDO_APELLIDO ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "NOMBRE_COMERCIAL", Value = Data.NOMBRE_COMERCIAL ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORR_TIPO_DIP", Value = Data.CORR_TIPO_DIP, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "NUMERO_DIP", Value = Data.NUMERO_DIP ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "NUMERO_NRC", Value = Data.NUMERO_NRC ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "NUMERO_NIT", Value = Data.NUMERO_NIT ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORR_ACTIVIDAD_ECONOMICA", Value = Data.CORR_ACTIVIDAD_ECONOMICA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "DIRECCION_PROVEEDOR", Value = Data.DIRECCION_PROVEEDOR ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORR_PAIS", Value = Data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DEPTO", Value = Data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_MUNICIPIO", Value = Data.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "NOMBRE_CONTACTO", Value = Data.NOMBRE_CONTACTO ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "TELEFONO_FIJO", Value = Data.TELEFONO_FIJO ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "TELEFONO_MOVIL", Value = Data.TELEFONO_MOVIL ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORREO_ELECTRONICO_1", Value = Data.CORREO_ELECTRONICO_1 ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORREO_ELECTRONICO_2", Value = Data.CORREO_ELECTRONICO_2 ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORR_FORMA_PAGO", Value = Data.CORR_FORMA_PAGO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CUENTA_BANCARIA", Value = Data.CUENTA_BANCARIA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORR_BANCO", Value = Data.CORR_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ESTADO_PROVEEDOR", Value = Data.ESTADO_PROVEEDOR ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "ESTADO_PROVEEDOR_WEB", Value = Data.ESTADO_PROVEEDOR_WEB ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORR_CONDICION_PAGO", Value = Data.CORR_CONDICION_PAGO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
				new() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
				new() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
				new() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
				new() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				new() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
			};
		}

		private static List<CParameter> BuildUpdateParameters(GEN_PROVEEDORTable Data)
		{
			return new List<CParameter>
			{
				new() { ParameterName = "CODIGO_PROVEEDOR", Value = Data.CODIGO_PROVEEDOR ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "TIPO_PERSONERIA", Value = Data.TIPO_PERSONERIA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "NOMBRE_PROVEEDOR", Value = Data.NOMBRE_PROVEEDOR ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "PRIMER_NOMBRE", Value = Data.PRIMER_NOMBRE ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "SEGUNDO_NOMBRE", Value = Data.SEGUNDO_NOMBRE ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "PRIMER_APELLIDO", Value = Data.PRIMER_APELLIDO ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "SEGUNDO_APELLIDO", Value = Data.SEGUNDO_APELLIDO ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "NOMBRE_COMERCIAL", Value = Data.NOMBRE_COMERCIAL ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORR_TIPO_DIP", Value = Data.CORR_TIPO_DIP, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "NUMERO_DIP", Value = Data.NUMERO_DIP ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "NUMERO_NRC", Value = Data.NUMERO_NRC ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "NUMERO_NIT", Value = Data.NUMERO_NIT ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORR_ACTIVIDAD_ECONOMICA", Value = Data.CORR_ACTIVIDAD_ECONOMICA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "DIRECCION_PROVEEDOR", Value = Data.DIRECCION_PROVEEDOR ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORR_PAIS", Value = Data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DEPTO", Value = Data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_MUNICIPIO", Value = Data.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "NOMBRE_CONTACTO", Value = Data.NOMBRE_CONTACTO ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "TELEFONO_FIJO", Value = Data.TELEFONO_FIJO ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "TELEFONO_MOVIL", Value = Data.TELEFONO_MOVIL ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORREO_ELECTRONICO_1", Value = Data.CORREO_ELECTRONICO_1 ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORREO_ELECTRONICO_2", Value = Data.CORREO_ELECTRONICO_2 ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORR_FORMA_PAGO", Value = Data.CORR_FORMA_PAGO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CUENTA_BANCARIA", Value = Data.CUENTA_BANCARIA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORR_BANCO", Value = Data.CORR_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ESTADO_PROVEEDOR", Value = Data.ESTADO_PROVEEDOR ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "ESTADO_PROVEEDOR_WEB", Value = Data.ESTADO_PROVEEDOR_WEB ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "CORR_CONDICION_PAGO", Value = Data.CORR_CONDICION_PAGO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
				new() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				new() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
			};
		}
	}
}
