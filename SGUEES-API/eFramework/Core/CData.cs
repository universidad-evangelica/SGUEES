using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;

namespace eFramework.Core
{
    public class CData: IDisposable
    {
        private string _connectiongString;
        private DbProviderFactory dataFactory;
        public DbCommand objCommand { get; set; }
        private DbParameter objParameter;
        public DbConnection objConnection;
        private DbDataReader objReader;
        private CSQLBuilder objSQLBuilder;
        private bool disposedValue = false; // Para detectar las llamadas redundantes
        

        public CData(string connectionString, string providerName)    
        {            
            _connectiongString = connectionString;              
            DbProviderFactories.RegisterFactory(providerName, SqlClientFactory.Instance);
            dataFactory = DbProviderFactories.GetFactory(providerName);            
            
            objConnection = dataFactory.CreateConnection();
            objConnection.ConnectionString = _connectiongString;
            objSQLBuilder = new CSQLBuilder();
        }

        public async Task<DbDataReader> GetDataReader(string vViewName, List<CParameter> xParametros = null, string xSortingFields = "")
        {
            try
            {   
                string xQry = "";
                string vWhere = "";
                
                await OpenAsync();

                objCommand = dataFactory.CreateCommand();
                objCommand.Connection = objConnection;
                objCommand.CommandType = CommandType.Text;
                objCommand.CommandTimeout = 0;

                if (xParametros != null)
                {
                    foreach (CParameter p in xParametros)
                    {
                        if (!ShouldIncludeInWhere(p))
                            continue;

                        objParameter = dataFactory.CreateParameter();
                        objParameter.DbType = p.DbType;
                        objParameter.ParameterName = p.ParameterName;
                        objParameter.Value = p.Value;
                        objParameter.Direction = p.Direction;
                        objParameter.Size = p.Size;

                        objCommand.Parameters.Add(objParameter);

                        if (vWhere != "") { vWhere += " AND "; }
                        vWhere += $"{p.ParameterName}=@{p.ParameterName}";
                    }
                }
                
                xQry = objSQLBuilder.toSelect(vViewName, vWhere, xSortingFields);

                objCommand.CommandText = xQry;
                
                objReader  = await objCommand.ExecuteReaderAsync();

            }
            catch (System.Exception)
            {                
                throw;
            }
            
            return objReader;
        }

        public async Task<DbDataReader> GetDataReader(CommandType xCommandType, 
                                          string  xQry = "",
                                          List<CParameter> xParametros = null)
        {
            try
            {                
                await OpenAsync();

                objCommand = dataFactory.CreateCommand();
                objCommand.Connection = objConnection;
                objCommand.CommandType = xCommandType;
                objCommand.CommandTimeout = 0;
                
                foreach (CParameter p in xParametros)
                {
                    if (p.ParameterName != "")
                    {
                        objParameter = dataFactory.CreateParameter();
                        objParameter.DbType = p.DbType;  
                        objParameter.ParameterName = p.ParameterName;
                        objParameter.Value = p.Value;
                        objParameter.Direction = p.Direction;
                        objParameter.Size = p.Size;

                        objCommand.Parameters.Add(objParameter);
                    }
                }       

                objCommand.CommandText = xQry;         
                
                objReader  = await objCommand.ExecuteReaderAsync();

            }
            catch (System.Exception)
            {                
                throw;
            }
            
            return objReader;
        }

        public async Task<DbDataReader> Insert(string vTableName,
                                         List<CParameter> xFieldInsert,
                                         string vCorrName = "",
                                         List<CParameter> xWhereCorr = null)
        {   
           
            try
            {
                string xQry = "";
                string vFields = "";
                string vValues = "";
                string vWhereCorr = "";

                await OpenAsync();
                
                objCommand = dataFactory.CreateCommand();
                objCommand.Connection = objConnection;
                objCommand.CommandType = CommandType.Text;
                objCommand.CommandTimeout = 0;

                if (xWhereCorr != null) {
                    foreach (CParameter p in xWhereCorr)
                    {
                        if (p.ParameterName != "")
                        {
                            if (vWhereCorr != "") { vWhereCorr += " AND "; }
                            vWhereCorr += $"{p.ParameterName}=@{p.ParameterName}";
                        }
                    }
                }
                
                foreach (CParameter p in xFieldInsert)
                {   
                    if (p.ParameterName != "")
                    {
                        if (p.Value != null) {
                            objParameter = dataFactory.CreateParameter();
                            objParameter.DbType = p.DbType;  
                            objParameter.ParameterName = p.ParameterName;
                            objParameter.Value = p.Value;
                            objParameter.Direction = p.Direction;
                            objParameter.Size = p.Size;

                            objCommand.Parameters.Add(objParameter);

                            if (vFields != "") { vFields += ", "; }
                            vFields += $"{p.ParameterName}";

                            if (vValues != "") { vValues += ", "; }
                            vValues += $"@{p.ParameterName}";
                        } else {
                            if (vFields != "") { vFields += ", "; }
                            vFields += $"{p.ParameterName}";

                            if (vValues != "") { vValues += ", "; }
                            vValues += $"NULL";
                        }
                        
                    }                        
                }

                xQry = objSQLBuilder.toInsert(vTableName, vFields, vValues, vCorrName,  vWhereCorr);

                objCommand.CommandText = xQry;
                objReader = await objCommand.ExecuteReaderAsync();
            }
            catch (System.Exception)
            {                
                throw;
            }

            return objReader;
        }

        public async Task<DbDataReader> Update(string vTableName,
                                         List<CParameter> xFieldsUpdate,
                                         List<CParameter> xWhere)
        {   
            
            try
            {
                string xQry = "";
                string vFieldsUpdate = "";
                string vWhere = "";

                await OpenAsync();

                objCommand = dataFactory.CreateCommand();
                objCommand.Connection = objConnection;
                objCommand.CommandType = CommandType.Text;
                objCommand.CommandTimeout = 0;

                foreach (CParameter p in xFieldsUpdate)
                {   
                    if (p.ParameterName != "")
                    {
                        if (p.Value != null) {
                            objParameter = dataFactory.CreateParameter();
                            objParameter.DbType = p.DbType;  
                            objParameter.ParameterName = p.ParameterName;
                            objParameter.Value = p.Value;
                            objParameter.Direction = p.Direction;
                            objParameter.Size = p.Size;

                            objCommand.Parameters.Add(objParameter);

                            if (vFieldsUpdate != "") { vFieldsUpdate += ", "; }
                            vFieldsUpdate += $"{p.ParameterName}=@{p.ParameterName}";
                        } else {
                           if (vFieldsUpdate != "") { vFieldsUpdate += ", "; }
                            vFieldsUpdate += $"{p.ParameterName}=NULL"; 
                        }
                        
                    }                        
                }

                foreach (CParameter p in xWhere)
                {   
                    if (p.ParameterName != "")
                    {
                        objParameter = dataFactory.CreateParameter();
                        objParameter.DbType = p.DbType;  
                        objParameter.ParameterName = p.ParameterName;
                        objParameter.Value = p.Value;
                        objParameter.Direction = p.Direction;
                        objParameter.Size = p.Size;

                        objCommand.Parameters.Add(objParameter);
                        
                        if (vWhere != "") { vWhere += " AND "; }
                        vWhere += $"{p.ParameterName}=@{p.ParameterName}";
                    }                        
                }

                xQry = objSQLBuilder.toUpdate(vTableName, vFieldsUpdate, vWhere);

                objCommand.CommandText = xQry;

                objReader = await objCommand.ExecuteReaderAsync();                         
            }
            catch (System.Exception)
            {                
                throw;
            }    
            
            return objReader;
        }

        public async Task<object> Delete(string vTableName,
                                         List<CParameter> xWhere)
        {   
            object sqlrows = 0;

            try
            {
                string xQry = "";
                string vWhere = "";

                await OpenAsync();

                objCommand = dataFactory.CreateCommand();
                objCommand.Connection = objConnection;
                objCommand.CommandType = CommandType.Text;
                objCommand.CommandTimeout = 0;

                foreach (CParameter p in xWhere)
                {   
                    if (p.ParameterName != "")
                    {
                        objParameter = dataFactory.CreateParameter();
                        objParameter.DbType = p.DbType;  
                        objParameter.ParameterName = p.ParameterName;
                        objParameter.Value = p.Value;
                        objParameter.Direction = p.Direction;
                        objParameter.Size = p.Size;

                        objCommand.Parameters.Add(objParameter);

                        if (vWhere != "") { vWhere += " AND "; }
                        vWhere += $"{p.ParameterName}=@{p.ParameterName}";
                    }                        
                }

                xQry = objSQLBuilder.toDelete(vTableName, vWhere);

                objCommand.CommandText = xQry;

                sqlrows = await objCommand.ExecuteNonQueryAsync();                         
            }
            catch (System.Exception)
            {                
                throw;
            }    
            finally
            {
                objConnection.Close();
            }
            return sqlrows;
        }

        public async Task<object> ExecCmd(CommandType xCommandType, 
                                          string  xQry,
                                          bool xRowsAfected=true,
                                          List<CParameter> xParametros = null)
        {   
            object sqlrows = 0;

            try
            {
                await OpenAsync();
                    
                objCommand = dataFactory.CreateCommand();
                objCommand.Connection = objConnection;
                objCommand.CommandType = xCommandType;
                objCommand.CommandText = xQry;
                objCommand.CommandTimeout = 0;
                
                foreach (CParameter p in xParametros)
                {   
                    if (p.ParameterName != "")
                    {
                        objParameter = dataFactory.CreateParameter();
                        objParameter.DbType = p.DbType;  
                        objParameter.ParameterName = p.ParameterName;
                        objParameter.Value = p.Value;
                        objParameter.Direction = p.Direction;
                        objParameter.Size = p.Size;

                        objCommand.Parameters.Add(objParameter);
                    }                        
                }

                if(xRowsAfected)
                {
                    sqlrows = await objCommand.ExecuteNonQueryAsync();
                }
                else
                {
                    sqlrows = await objCommand.ExecuteScalarAsync();
                }                             
            }
            catch (System.Exception)
            {   
                throw;
            }    
            finally
            {
                await CloseAsync();
            }
            return sqlrows;
        }  

        private async Task OpenAsync()
        {
            try
            {
                if (objConnection != null) {
                    if (objConnection.State != ConnectionState.Open)
                    await objConnection.OpenAsync();
                }
            }
            catch (System.Exception)
            {   
                throw;
            }
        }

        public async Task CloseAsync()
        {
            try
            {
                if (objConnection != null) {
                    if (objConnection.State != ConnectionState.Closed)
                    await objConnection.CloseAsync();
                }
            }
            catch (System.Exception)
            {   
                throw;
            }
        }

        /// <summary>
        /// Omite filtros opcionales en GetAll: 0 numérico, cadena vacía o fecha default no restringen el WHERE.
        /// </summary>
        private static bool ShouldIncludeInWhere(CParameter p)
        {
            if (p == null || string.IsNullOrEmpty(p.ParameterName))
                return false;

            var value = p.Value;
            if (value == null || value == DBNull.Value)
                return false;

            switch (p.DbType)
            {
                case DbType.Int32:
                case DbType.Int16:
                case DbType.Int64:
                case DbType.Byte:
                    return Convert.ToInt64(value) != 0;
                case DbType.String:
                case DbType.AnsiString:
                case DbType.StringFixedLength:
                case DbType.AnsiStringFixedLength:
                    return !string.IsNullOrEmpty(Convert.ToString(value));
                case DbType.DateTime:
                case DbType.DateTime2:
                    return (DateTime)value != default;
                default:
                    return true;
            }
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!this.disposedValue)
            {
                if (disposing)
                {
                }
                // TODO: free your own state (unmanaged objects).
                // TODO: set large fields to null.
                try
                {
                    if (objConnection.State != ConnectionState.Closed)
                        objConnection.Close();
                }
                catch (Exception)
                {
                }

                objConnection = null;
                objParameter = null;
                objCommand = null;
                objReader = null;
                dataFactory = null;
                objSQLBuilder = null;
            }
            this.disposedValue = true;
        }
 

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
