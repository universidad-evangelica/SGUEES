using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    public class SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESRepository : BaseRepository<SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESTable>, ISC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESRepository
    {
        private const string _TableName = "SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES";

        public SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESRepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader("V_SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES", xWhere);
                var response = new List<SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESView>().FromDataReader(reader).ToList();

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
                var reader = await objData.GetDataReader("V_SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES", xWhere);
                var response = new List<SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESView>().FromDataReader(reader).FirstOrDefault();

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

        public async Task<CResult> CreateAsync(SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_UNIDAD",Value=Data.CORR_UNIDAD,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
                    new CParameter() {ParameterName="CODIGO_UNIDAD",Value=Data.CODIGO_UNIDAD,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="NOMBRE_UNIDAD",Value=Data.NOMBRE_UNIDAD,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="CORR_NIVEL",Value=Data.CORR_NIVEL,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_UNIDAD_PADRE",Value=Data.CORR_UNIDAD_PADRE ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="ACTIVO",Value=Data.ACTIVO,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="USUARIO_CREA",Value=Data.USUARIO_CREA,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ESTACION_CREA",Value=Data.ESTACION_CREA,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FECHA_CREA",Value=Data.FECHA_CREA,DbType=System.Data.DbType.DateTime},
                    new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Insert(_TableName, p, "CORR_UNIDAD", pWhere);
                var response = new List<SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESView>().FromDataReader(reader).FirstOrDefault();

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_UNIDAD ?? Data.CORR_UNIDAD;
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

        public async Task<CResult> UpdateAsync(SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="CODIGO_UNIDAD",Value=Data.CODIGO_UNIDAD,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="NOMBRE_UNIDAD",Value=Data.NOMBRE_UNIDAD,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="CORR_NIVEL",Value=Data.CORR_NIVEL,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_UNIDAD_PADRE",Value=Data.CORR_UNIDAD_PADRE ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="ACTIVO",Value=Data.ACTIVO,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_UNIDAD",Value=Data.CORR_UNIDAD,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_UNIDAD ?? Data.CORR_UNIDAD;
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

        public async Task<CResult> DeleteAsync(SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                // Verificar si la unidad tiene hijas o jefes usando la vista
                var pCheck = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_UNIDAD",Value=Data.CORR_UNIDAD,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.GetDataReader("V_SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES", pCheck);
                int tieneHijas = 0;
                int tieneJefes = 0;
                if (reader.Read())
                {
                    tieneHijas = Convert.ToInt32(reader["TIENE_HIJAS"]);
                    tieneJefes = Convert.ToInt32(reader["TIENE_JEFES"]);
                }
                reader.Close();
                reader = null;

                if (tieneHijas > 0)
                {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.CodeHelper = 0;
                    objResultado.ErrorCode = -1;
                    objResultado.ErrorMessage = "No se puede eliminar la unidad porque tiene unidades hijas.";
                    objResultado.ErrorSource = "";
                    return objResultado;
                }

                if (tieneJefes > 0)
                {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.CodeHelper = 0;
                    objResultado.ErrorCode = -1;
                    objResultado.ErrorMessage = "No se puede eliminar la unidad porque tiene jefes asignados.";
                    objResultado.ErrorSource = "";
                    return objResultado;
                }

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_UNIDAD",Value=Data.CORR_UNIDAD,DbType=System.Data.DbType.Int32},
                };

                objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.CodeHelper = Data.CORR_UNIDAD;
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