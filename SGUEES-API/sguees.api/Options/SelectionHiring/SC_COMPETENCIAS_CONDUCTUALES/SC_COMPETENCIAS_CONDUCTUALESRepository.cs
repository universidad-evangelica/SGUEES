using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using SGUEES.Models;

namespace SGUEES.Repositories
{
  public class SC_COMPETENCIAS_CONDUCTUALESRepository : BaseRepository<SC_COMPETENCIAS_CONDUCTUALESTable>, ISC_COMPETENCIAS_CONDUCTUALESRepository
  {
    private const string _TableName = "SC_COMPETENCIAS_CONDUCTUALES";
    private const string _ViewName = "V_SC_COMPETENCIAS_CONDUCTUALES";
    private const string _CampoPk = "CORR_COMPETENCIAS_CONDUCTUALES";
    private const string _CampoEstado = "ESTADO_COMPETENCIAS_CONDUCTUALES";
    private const bool _UsaEmpresa = true;
    private const string _DefaultSortField = "CORR_COMPETENCIAS_CONDUCTUALES";

    private static readonly string[] _AllowedSortFields =
    {
      "CORR_COMPETENCIAS_CONDUCTUALES",
      "CORR_TIPO_PUESTO",
      "NOMBRE_COMPETENCIAS_CONDUCTUALES",
      "DESCRIPCION",
      "NOMBRE_TIPO_PUESTO",
      "ESTADO_COMPETENCIAS_CONDUCTUALES",
      "USUARIO_CREA",
      "ESTACION_CREA",
      "FECHA_CREA",
      "USUARIO_ACTU",
      "ESTACION_ACTU",
      "FECHA_ACTU",
    };

    public SC_COMPETENCIAS_CONDUCTUALESRepository(IConfiguration config) :
      base(config.GetConnectionString("defaultConnection"),
        config.GetSection("DbProvider:defaultProvider").Value)
    {
    }

    public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
    {
      CResult objResultado = new();

      try
      {
        var dbWhere = xWhere
          .Where(x => x.ParameterName == "CORR_EMPRESA")
          .ToList();

        var reader = await objData.GetDataReader(_ViewName, dbWhere);
        var response = new List<SC_COMPETENCIAS_CONDUCTUALESView>().FromDataReader(reader)
          .OrderBy(x => x.NOMBRE_COMPETENCIAS_CONDUCTUALES)
          .ThenBy(x => x.CORR_COMPETENCIAS_CONDUCTUALES)
          .ToList();

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
      CResult objResultado = new();

      try
      {
        var reader = await objData.GetDataReader(_ViewName, xWhere);
        var response = new List<SC_COMPETENCIAS_CONDUCTUALESView>().FromDataReader(reader).FirstOrDefault();

        reader.Close();
        reader = null;

        objResultado.Data = response;
        objResultado.Result = true;
        objResultado.RowsAffected = response == null ? 0 : 1;
        objResultado.CodeHelper = response?.CORR_COMPETENCIAS_CONDUCTUALES ?? 0;
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

    public async Task<CResult> CreateAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION)
    {
      CResult objResultado = new();

      try
      {
        var p = new List<CParameter>
        {
          new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
          new CParameter() { ParameterName = "CORR_COMPETENCIAS_CONDUCTUALES", Value = Data.CORR_COMPETENCIAS_CONDUCTUALES, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
          new CParameter() { ParameterName = "CORR_TIPO_PUESTO", Value = Data.CORR_TIPO_PUESTO, DbType = System.Data.DbType.Int32 },
          new CParameter() { ParameterName = "NOMBRE_COMPETENCIAS_CONDUCTUALES", Value = Data.NOMBRE_COMPETENCIAS_CONDUCTUALES, DbType = System.Data.DbType.String },
          new CParameter() { ParameterName = "DESCRIPCION", Value = Data.DESCRIPCION, DbType = System.Data.DbType.String },
          new CParameter() { ParameterName = "ESTADO_COMPETENCIAS_CONDUCTUALES", Value = Data.ESTADO_COMPETENCIAS_CONDUCTUALES ?? true, DbType = System.Data.DbType.Boolean },
          new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
          new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
          new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
          new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
          new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
          new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
        };

        var pWhere = new List<CParameter>
        {
          new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
        };

        var reader = await objData.Insert(_TableName, p, _CampoPk, pWhere);
        var response = new List<SC_COMPETENCIAS_CONDUCTUALESView>().FromDataReader(reader).FirstOrDefault();

        reader.Close();
        reader = null;

        objResultado.Data = response;
        objResultado.Result = true;
        objResultado.RowsAffected = 1;
        objResultado.CodeHelper = response?.CORR_COMPETENCIAS_CONDUCTUALES ?? 0;
        objResultado.ErrorCode = 0;
        objResultado.ErrorMessage = "";
        objResultado.ErrorSource = "";
      }
      catch (Exception e)
      {
        var duplicateKey = IsDuplicateKeyError(e);
        objResultado.Data = null;
        objResultado.Result = false;
        objResultado.CodeHelper = 0;
        objResultado.ErrorCode = duplicateKey ? 2627 : -1;
        objResultado.ErrorMessage = duplicateKey
          ? "No se pudo guardar el registro porque otro usuario guardo un registro al mismo tiempo. Intente nuevamente."
          : e.Message;
        objResultado.ErrorSource += $"[{e.Source}]";
      }
      finally
      {
        objData.objConnection.Close();
      }

      return objResultado;
    }

    public async Task<CResult> UpdateAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION)
    {
      CResult objResultado = new();

      try
      {
        var p = new List<CParameter>
        {
          new CParameter() { ParameterName = "CORR_TIPO_PUESTO", Value = Data.CORR_TIPO_PUESTO, DbType = System.Data.DbType.Int32 },
          new CParameter() { ParameterName = "NOMBRE_COMPETENCIAS_CONDUCTUALES", Value = Data.NOMBRE_COMPETENCIAS_CONDUCTUALES, DbType = System.Data.DbType.String },
          new CParameter() { ParameterName = "DESCRIPCION", Value = Data.DESCRIPCION, DbType = System.Data.DbType.String },
          new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
          new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
          new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
        };

        var pWhere = new List<CParameter>
        {
          new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
          new CParameter() { ParameterName = "CORR_COMPETENCIAS_CONDUCTUALES", Value = Data.CORR_COMPETENCIAS_CONDUCTUALES, DbType = System.Data.DbType.Int32 },
        };

        var reader = await objData.Update(_TableName, p, pWhere);
        var response = new List<SC_COMPETENCIAS_CONDUCTUALESView>().FromDataReader(reader).FirstOrDefault();

        reader.Close();
        reader = null;

        objResultado.Data = response;
        objResultado.Result = true;
        objResultado.RowsAffected = response == null ? 0 : 1;
        objResultado.CodeHelper = response?.CORR_COMPETENCIAS_CONDUCTUALES ?? Data.CORR_COMPETENCIAS_CONDUCTUALES;
        objResultado.ErrorCode = 0;
        objResultado.ErrorMessage = "";
        objResultado.ErrorSource = "";
      }
      catch (Exception e)
      {
        var duplicateKey = IsDuplicateKeyError(e);
        objResultado.Data = null;
        objResultado.Result = false;
        objResultado.CodeHelper = 0;
        objResultado.ErrorCode = duplicateKey ? 2627 : -1;
        objResultado.ErrorMessage = duplicateKey
          ? "No se pudo guardar el registro porque otro usuario guardo un registro al mismo tiempo. Intente nuevamente."
          : e.Message;
        objResultado.ErrorSource += $"[{e.Source}]";
      }
      finally
      {
        objData.objConnection.Close();
      }

      return objResultado;
    }

    public async Task<CResult> DeleteAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION)
    {
      CResult objResultado = new();

      try
      {
        var pWhere = new List<CParameter>
        {
          new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
          new CParameter() { ParameterName = "CORR_COMPETENCIAS_CONDUCTUALES", Value = Data.CORR_COMPETENCIAS_CONDUCTUALES, DbType = System.Data.DbType.Int32 },
        };

        objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
        objResultado.Data = null;
        objResultado.Result = true;
        objResultado.CodeHelper = Data.CORR_COMPETENCIAS_CONDUCTUALES;
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
        objResultado.ErrorMessage = "No se puede eliminar la competencia conductual porque tiene registros asociados en otras tablas.";
        objResultado.ErrorSource += $"[{e.Source}]";
      }
      finally
      {
        objData.objConnection.Close();
      }

      return objResultado;
    }

    public async Task<CResult> ActivarInactivarAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION)
    {
      CResult objResultado = new();

      try
      {
        var p = new List<CParameter>
        {
          new CParameter() { ParameterName = "NOMBRE_TABLA", Value = _TableName, DbType = System.Data.DbType.String },
          new CParameter() { ParameterName = "CAMPO_PK", Value = _CampoPk, DbType = System.Data.DbType.String },
          new CParameter() { ParameterName = "CAMPO_ESTADO", Value = _CampoEstado, DbType = System.Data.DbType.String },
          new CParameter() { ParameterName = "USA_EMPRESA", Value = _UsaEmpresa, DbType = System.Data.DbType.Boolean },
          new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
          new CParameter() { ParameterName = "CORR_RELATIVO", Value = Data.CORR_COMPETENCIAS_CONDUCTUALES, DbType = System.Data.DbType.Int32 },
          new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
          new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
          new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
          new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
          new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
        };

        await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_CATALOGO_ESTADO_BIT", true, p);

        if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
        {
          var xWhere = new List<CParameter>
          {
            new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            new CParameter() { ParameterName = "CORR_COMPETENCIAS_CONDUCTUALES", Value = Data.CORR_COMPETENCIAS_CONDUCTUALES, DbType = System.Data.DbType.Int32 },
          };

          var readerGet = await objData.GetDataReader(_ViewName, xWhere);
          var response = new List<SC_COMPETENCIAS_CONDUCTUALESView>().FromDataReader(readerGet).FirstOrDefault();

          readerGet.Close();

          objResultado.Data = response;
          objResultado.Result = true;
          objResultado.RowsAffected = 1;
          objResultado.CodeHelper = response?.CORR_COMPETENCIAS_CONDUCTUALES ?? Data.CORR_COMPETENCIAS_CONDUCTUALES;
          objResultado.ErrorCode = 0;
          objResultado.ErrorMessage = string.Empty;
          objResultado.ErrorSource = string.Empty;
        }
        else
        {
          objResultado.Data = null;
          objResultado.Result = false;
          objResultado.RowsAffected = 0;
          objResultado.CodeHelper = Data.CORR_COMPETENCIAS_CONDUCTUALES;
          objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
          objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
          objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + UpdateType.Update.ToString() + ")";
        }
      }
      catch (Exception e)
      {
        objResultado.Data = null;
        objResultado.Result = false;
        objResultado.CodeHelper = Data.CORR_COMPETENCIAS_CONDUCTUALES;
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

    public async Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr)
    {
      if (corrEmpresa <= 0 || string.IsNullOrWhiteSpace(nombre))
      {
        return false;
      }

      const string sql = @"SELECT TOP 1 1 AS FOUND
        FROM V_SC_COMPETENCIAS_CONDUCTUALES
        WHERE CORR_EMPRESA = @CORR_EMPRESA
        AND UPPER(LTRIM(RTRIM(NOMBRE_COMPETENCIAS_CONDUCTUALES))) = UPPER(LTRIM(RTRIM(@NOMBRE)))
        AND (@EXCLUDE_CORR <= 0 OR CORR_COMPETENCIAS_CONDUCTUALES <> @EXCLUDE_CORR)";

      try
      {
        var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
        {
          new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
          new CParameter() { ParameterName = "NOMBRE", Value = nombre.Trim(), DbType = System.Data.DbType.String },
          new CParameter() { ParameterName = "EXCLUDE_CORR", Value = excludeCorr, DbType = System.Data.DbType.Int32 },
        });

        var exists = reader.Read();
        reader.Close();
        return exists;
      }
      finally
      {
        objData.objConnection.Close();
      }
    }

    private static bool IsDuplicateKeyError(Exception e)
    {
      return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
        e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
        e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
    }
  }
}
