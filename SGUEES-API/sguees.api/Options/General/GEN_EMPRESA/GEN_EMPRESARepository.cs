using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_EMPRESARepository: BaseRepository<GEN_EMPRESATable>, IGEN_EMPRESARepository
	{
		private const string _TableName = "GEN_EMPRESA";
		
		public GEN_EMPRESARepository(IConfiguration config) : 
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
				var response = new List<GEN_EMPRESAView>().FromDataReader(reader).ToList();
				
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
				var response = new List<GEN_EMPRESAView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(GEN_EMPRESATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="NOMBRE_EMPRESA",Value=Data.NOMBRE_EMPRESA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_COMERCIAL",Value=Data.NOMBRE_COMERCIAL,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_REPRESENTANTE_LEGAL",Value=Data.NOMBRE_REPRESENTANTE_LEGAL,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="GIRO_EMPRESA",Value=Data.GIRO_EMPRESA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="DIRECCION_EMPRESA",Value=Data.DIRECCION_EMPRESA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NUMERO_NIT",Value=Data.NUMERO_NIT,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NUMERO_NRC",Value=Data.NUMERO_NRC,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_CONTACTO",Value=Data.NOMBRE_CONTACTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="TELEFONO_1",Value=Data.TELEFONO_1,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="TELEFONO_2",Value=Data.TELEFONO_2,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FAX",Value=Data.FAX,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORREO_ELECTRONICO",Value=Data.CORREO_ELECTRONICO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="LOGO_1",Value=Data.LOGO_1,DbType=System.Data.DbType.Binary},
					new CParameter() {ParameterName="LOGO_2",Value=Data.LOGO_2,DbType=System.Data.DbType.Binary},
					new CParameter() {ParameterName="TAMANO_EMPRESA",Value=Data.TAMANO_EMPRESA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NATURAL_JURIDICO",Value=Data.NATURAL_JURIDICO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CODIGO_EMPRESA",Value=Data.CODIGO_EMPRESA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_PAIS",Value=Data.CORR_PAIS,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_DEPTO",Value=Data.CORR_DEPTO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_MUNICIPIO",Value=Data.CORR_MUNICIPIO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="NOMBRE_EMPRESA_LARGO",Value=Data.NOMBRE_EMPRESA_LARGO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="DIRECCION_EMPRESA_LARGO",Value=Data.DIRECCION_EMPRESA_LARGO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="SELLO",Value=Data.SELLO,DbType=System.Data.DbType.Binary},
					new CParameter() {ParameterName="CODIGO_POSTAL",Value=Data.CODIGO_POSTAL,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="TIPO_INGRESO_ISR",Value=Data.TIPO_INGRESO_ISR,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_SECTOR_ECONOMICO",Value=Data.CORR_SECTOR_ECONOMICO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="USA_CAMPOS_LIBRO_IVA",Value=Data.USA_CAMPOS_LIBRO_IVA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="PERMITE_EDITAR_CAMPOS_LIBRO_IVA",Value=Data.PERMITE_EDITAR_CAMPOS_LIBRO_IVA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="USUARIO_CREA",Value=Data.USUARIO_CREA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_CREA",Value=Data.FECHA_CREA,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="ESTACION_CREA",Value=Data.ESTACION_CREA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
				};
				
				var pWhere = new List<CParameter>
				{
					//new CParameter() {ParameterName="CORR_PAIS",Value=Data.CORR_PAIS,DbType=System.Data.DbType.Int32},
					//new CParameter() {ParameterName="CORR_DEPTO",Value=Data.CORR_DEPTO,DbType=System.Data.DbType.Int32},
					//new CParameter() {ParameterName="CORR_MUNICIPIO",Value=Data.CORR_MUNICIPIO,DbType=System.Data.DbType.Int32},
					//new CParameter() {ParameterName="CORR_SECTOR_ECONOMICO",Value=Data.CORR_SECTOR_ECONOMICO,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Insert(_TableName,p,"CORR_EMPRESA",pWhere);
				var response = new List<GEN_EMPRESAView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_EMPRESA;
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
		
		public async Task<CResult> UpdateAsync(GEN_EMPRESATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="NOMBRE_EMPRESA",Value=Data.NOMBRE_EMPRESA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_COMERCIAL",Value=Data.NOMBRE_COMERCIAL,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_REPRESENTANTE_LEGAL",Value=Data.NOMBRE_REPRESENTANTE_LEGAL,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="GIRO_EMPRESA",Value=Data.GIRO_EMPRESA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="DIRECCION_EMPRESA",Value=Data.DIRECCION_EMPRESA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NUMERO_NIT",Value=Data.NUMERO_NIT,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NUMERO_NRC",Value=Data.NUMERO_NRC,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_CONTACTO",Value=Data.NOMBRE_CONTACTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="TELEFONO_1",Value=Data.TELEFONO_1,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="TELEFONO_2",Value=Data.TELEFONO_2,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FAX",Value=Data.FAX,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORREO_ELECTRONICO",Value=Data.CORREO_ELECTRONICO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="TAMANO_EMPRESA",Value=Data.TAMANO_EMPRESA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NATURAL_JURIDICO",Value=Data.NATURAL_JURIDICO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CODIGO_EMPRESA",Value=Data.CODIGO_EMPRESA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_EMPRESA_LARGO",Value=Data.NOMBRE_EMPRESA_LARGO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="DIRECCION_EMPRESA_LARGO",Value=Data.DIRECCION_EMPRESA_LARGO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CODIGO_POSTAL",Value=Data.CODIGO_POSTAL,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="TIPO_INGRESO_ISR",Value=Data.TIPO_INGRESO_ISR,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="USA_CAMPOS_LIBRO_IVA",Value=Data.USA_CAMPOS_LIBRO_IVA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="PERMITE_EDITAR_CAMPOS_LIBRO_IVA",Value=Data.PERMITE_EDITAR_CAMPOS_LIBRO_IVA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
				};

				if (Data.LOGO_1 != null)
				{
					p.Add(new CParameter() {ParameterName="LOGO_1",Value=Data.LOGO_1,DbType=System.Data.DbType.Binary});
				}

				if (Data.LOGO_2 != null)
				{
					p.Add(new CParameter() {ParameterName="LOGO_2",Value=Data.LOGO_2,DbType=System.Data.DbType.Binary});
				}

				if (Data.SELLO != null)
				{
					p.Add(new CParameter() {ParameterName="SELLO",Value=Data.SELLO,DbType=System.Data.DbType.Binary});
				}
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					//new CParameter() {ParameterName="CORR_PAIS",Value=Data.CORR_PAIS,DbType=System.Data.DbType.Int32},
					//new CParameter() {ParameterName="CORR_DEPTO",Value=Data.CORR_DEPTO,DbType=System.Data.DbType.Int32},
					//new CParameter() {ParameterName="CORR_MUNICIPIO",Value=Data.CORR_MUNICIPIO,DbType=System.Data.DbType.Int32},
					//new CParameter() {ParameterName="CORR_SECTOR_ECONOMICO",Value=Data.CORR_SECTOR_ECONOMICO,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<GEN_EMPRESAView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;

				if (response == null)
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_EMPRESA;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = "No se encontro la empresa para actualizar con el CORR_EMPRESA enviado.";
					objResultado.ErrorSource = "GEN_EMPRESARepository.UpdateAsync";
					return objResultado;
				}
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_EMPRESA;
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
		
		public async Task<CResult> DeleteAsync(GEN_EMPRESATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					//new CParameter() {ParameterName="CORR_PAIS",Value=Data.CORR_PAIS,DbType=System.Data.DbType.Int32},
					//new CParameter() {ParameterName="CORR_DEPTO",Value=Data.CORR_DEPTO,DbType=System.Data.DbType.Int32},
					//new CParameter() {ParameterName="CORR_MUNICIPIO",Value=Data.CORR_MUNICIPIO,DbType=System.Data.DbType.Int32},
					//new CParameter() {ParameterName="CORR_SECTOR_ECONOMICO",Value=Data.CORR_SECTOR_ECONOMICO,DbType=System.Data.DbType.Int32},
				};
				
				objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_EMPRESA;
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
