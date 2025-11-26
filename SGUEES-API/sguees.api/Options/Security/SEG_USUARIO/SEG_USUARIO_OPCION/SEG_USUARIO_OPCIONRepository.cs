using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using scuees.Models;

namespace scuees.Repositories
{
    public class SEG_USUARIO_OPCIONRepository: BaseRepository<SEG_USUARIO_OPCIONTable>, ISEG_USUARIO_OPCIONRepository
    {
        private const string _TableName = "SEG_USUARIO_OPCION";

        public SEG_USUARIO_OPCIONRepository(IConfiguration config) : 
                base(config.GetConnectionString("defaultConnection"), 
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public Task<CResult> CreateAsync(SEG_USUARIO_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            throw new System.NotImplementedException();
        }

        public Task<CResult> DeleteAsync(SEG_USUARIO_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            throw new System.NotImplementedException();
        }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
            CResult objResultado = new CResult();
            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure,"PRAL_DATA_"+_TableName,xWhere);
                var response = new List<SEG_USUARIO_OPCIONView>().FromDataReader(reader).ToList();
                
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
			    var response = new List<SEG_USUARIO_OPCIONView>().FromDataReader(reader).FirstOrDefault();
			
			    reader.Close();
			    reader = null;
			
                objResultado.Data = response;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper =  0;
                objResultado.ErrorSource = $"{this.GetType().Name}.Get()";
            }
            catch (System.Exception e)
            {                
                objResultado.Data = "";
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

        public async Task<CResult> GetPermisosAsync(string LOGIN_SISTEMA,
                                                    string CODIGO_SUITE)
		{
            CResult objResultado = new();
            try
            {
                var sql = @$"
                IF EXISTS(SELECT 1 FROM SEG_USUARIO A WHERE LTRIM(RTRIM(A.LOGIN_SISTEMA))=LTRIM(RTRIM(@LOGIN_SISTEMA)))
                BEGIN
                    SELECT A.CODIGO_SISTEMA
                    ,A.NOMBRE_SISTEMA
                    ,A.IMAGEN_SISTEMA
                    ,A.CODIGO_MENU
                    ,A.NOMBRE_MENU
                    ,A.IMAGEN_MENU
                    ,A.CODIGO_OPCION
                    ,A.NOMBRE_OPCION
                    ,A.IMAGEN_OPCION
                    ,A.URL_OPCION
                    ,A.NUEVO
                    ,A.MODIFICAR
                    ,A.ELIMINAR
                    ,A.IMPRIMIR        
                    ,A.ORDEN_SISTEMA
                    ,A.ORDEN_MENU
                    ,A.ORDEN_OPCION
                    ,CASE WHEN A.NUEVO=1 THEN 'C' ELSE '' END +
                            'R'+
                    CASE WHEN A.MODIFICAR=1 THEN 'U' ELSE '' END +
                    CASE WHEN A.ELIMINAR=1 THEN 'D' ELSE '' END + 
                    CASE WHEN A.IMPRIMIR=1 THEN 'P' ELSE '' END PERMISO
                    FROM V_{_TableName} A
                    WHERE LTRIM(RTRIM(A.LOGIN_SISTEMA))=LTRIM(RTRIM(@LOGIN_SISTEMA))
                    AND EXISTS(SELECT 1 FROM SEG_OPCION_SISTEMA_SUITE B
                            WHERE A.CODIGO_OPCION=B.CODIGO_OPCION
                            AND LTRIM(RTRIM(UPPER(B.CODIGO_SUITE)))=LTRIM(RTRIM(UPPER(@CODIGO_SUITE))))
                    ORDER BY A.ORDEN_SISTEMA DESC,A.ORDEN_MENU,A.ORDEN_OPCION
                END 
                ";

                var pWhere = new List<CParameter>();
                pWhere.Add(new CParameter() {ParameterName="@LOGIN_SISTEMA",Value=LOGIN_SISTEMA,DbType=System.Data.DbType.String});
                pWhere.Add(new CParameter() {ParameterName="@CODIGO_SUITE",Value=CODIGO_SUITE,DbType=System.Data.DbType.String});

                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, pWhere);
                var response = new List<SEG_USUARIO_PERMISOView>().FromDataReader(reader).ToList();
                
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

        public async Task<CResult> UpdateAsync(SEG_USUARIO_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new CResult();
			
			try
			{
				var p = new List<CParameter>();
                if (Data.SELECCION) {                     
                    p.Add(new CParameter() {ParameterName="@TIPO_ACTUALIZA",Value=UpdateType.Update, DbType=System.Data.DbType.Int32});
                } else {
                    p.Add(new CParameter() {ParameterName="@TIPO_ACTUALIZA",Value=UpdateType.Delete, DbType=System.Data.DbType.Int32});
                } 
				p.Add(new CParameter() {ParameterName="@LOGIN_SISTEMA",Value=Data.LOGIN_SISTEMA,DbType=System.Data.DbType.String});
                // p.Add(new CParameter() {ParameterName="@CORR_SUSCRIPCION",Value=Data.CORR_SUSCRIPCION,DbType=System.Data.DbType.Int32});
                // p.Add(new CParameter() {ParameterName="@CORR_CONFI_PAIS",Value=Data.CORR_CONFI_PAIS,DbType=System.Data.DbType.Int32});
                p.Add(new CParameter() {ParameterName="@CODIGO_SISTEMA",Value=Data.CODIGO_SISTEMA,DbType=System.Data.DbType.String});
                p.Add(new CParameter() {ParameterName="@CODIGO_MENU",Value=Data.CODIGO_MENU,DbType=System.Data.DbType.String});
                p.Add(new CParameter() {ParameterName="@CODIGO_OPCION",Value=Data.CODIGO_OPCION,DbType=System.Data.DbType.String,Direction=System.Data.ParameterDirection.InputOutput});
                p.Add(new CParameter() {ParameterName="@NUEVO",Value=Data.NUEVO,DbType=System.Data.DbType.Boolean});
                p.Add(new CParameter() {ParameterName="@MODIFICAR",Value=Data.MODIFICAR,DbType=System.Data.DbType.Boolean});
                p.Add(new CParameter() {ParameterName="@ELIMINAR",Value=Data.ELIMINAR,DbType=System.Data.DbType.Boolean});
                p.Add(new CParameter() {ParameterName="@IMPRIMIR",Value=Data.IMPRIMIR,DbType=System.Data.DbType.Boolean});
                p.Add(new CParameter() {ParameterName="@USUARIO_CREA",Value=Data.USUARIO_CREA,DbType=System.Data.DbType.String});
                p.Add(new CParameter() {ParameterName="@FECHA_CREA",Value=Data.FECHA_CREA,DbType=System.Data.DbType.DateTime});
                p.Add(new CParameter() {ParameterName="@ESTACION_CREA",Value=Data.ESTACION_CREA,DbType=System.Data.DbType.String});
                p.Add(new CParameter() {ParameterName="@USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String});
                p.Add(new CParameter() {ParameterName="@FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime});
                p.Add(new CParameter() {ParameterName="@ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String});

                //Parametros para gestionar la operación
				p.Add(new CParameter() {ParameterName="@SYS_LOGIN_USUARIO",Value=vLOGIN_SISTEMA,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="@SYS_ESTACION",Value=vESTACION,DbType=System.Data.DbType.String});
				p.Add(new CParameter() {ParameterName="@SYS_FILAS_AFECTADAS",Value=0,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput});
				p.Add(new CParameter() {ParameterName="@SYS_NUMERO_ERROR",Value=0,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput});
				p.Add(new CParameter() {ParameterName="@SYS_MENSAJE_ERROR",Value="",DbType=System.Data.DbType.String,Direction=System.Data.ParameterDirection.InputOutput,Size=4000});
				
				var reader = await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_" + _TableName, true, p);
				
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>();
                    xWhere.Add(new CParameter() {ParameterName="@TIPO_CONSULTA",Value=3,DbType=System.Data.DbType.Int32});
                    xWhere.Add(new CParameter() {ParameterName="@LOGIN_SISTEMA",Value=Data.LOGIN_SISTEMA,DbType=System.Data.DbType.String});
                    // xWhere.Add(new CParameter() {ParameterName="@CORR_SUSCRIPCION",Value=Data.CORR_SUSCRIPCION,DbType=System.Data.DbType.Int32});
                    // xWhere.Add(new CParameter() {ParameterName="@CORR_CONFI_PAIS",Value=Data.CORR_CONFI_PAIS,DbType=System.Data.DbType.Int32});
                    xWhere.Add(new CParameter() {ParameterName="@CODIGO_SISTEMA",Value=Data.CODIGO_SISTEMA,DbType=System.Data.DbType.String});
                    xWhere.Add(new CParameter() {ParameterName="@CODIGO_MENU",Value=Data.CODIGO_MENU,DbType=System.Data.DbType.String});
                    xWhere.Add(new CParameter() {ParameterName="@CODIGO_OPCION",Value=Data.CODIGO_OPCION,DbType=System.Data.DbType.String});
                    xWhere.Add(new CParameter() {ParameterName="@OPCION_CONSULTA",Value=1,DbType=System.Data.DbType.Int32});
                
					var readerGet = await objData.GetDataReader(System.Data.CommandType.StoredProcedure,"PRAL_DATA_"+_TableName,xWhere);
                    var response = new List<SEG_USUARIO_OPCIONView>().FromDataReader(readerGet).ToList();

					readerGet.Close();
					reader = null;

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = (string)objData.objCommand.Parameters["@LOGIN_SISTEMA"].Value;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + UpdateType.Update.ToString() + ")";
				}
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
