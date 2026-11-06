using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
    public class ACA_CARRERAS_SEDESRepository : BaseRepository<ACA_CARRERAS_SEDESTable>, IACA_CARRERAS_SEDESRepository
    {
        public ACA_CARRERAS_SEDESRepository(IConfiguration config)
            : base(config.GetConnectionString("defaultConnection"), config["DbProvider:defaultProvider"]) { }
        private static List<CParameter> Where(ACA_CARRERAS_SEDESParam data)
        {
            var p = new List<CParameter> {
                new() { ParameterName="CORR_EMPRESA",Value=data.CORR_EMPRESA,DbType=DbType.Int32 },
                new() { ParameterName="CORR_CARRERA",Value=data.CORR_CARRERA,DbType=DbType.Int32 }
            };
            if (data.CORR_SEDE > 0) p.Add(new() { ParameterName = "CORR_SEDE", Value = data.CORR_SEDE, DbType = DbType.Int32 });
            return p;
        }
        public async Task<CResult> GetAllAsync(ACA_CARRERAS_SEDESParam data)
        {
            try
            {
                if (data.CORR_EMPRESA <= 0 || data.CORR_CARRERA <= 0) return Error("Seleccione una carrera guardada en la empresa de la sesión.");
                using var reader = await objData.GetDataReader("V_ACA_CARRERAS_SEDES", Where(data), "NOMBRE_SEDE");
                var rows = new List<ACA_CARRERAS_SEDESView>().FromDataReader(reader).ToList();
                return new CResult { Result = true, Data = rows, RowsAffected = rows.Count };
            }
            catch (Exception ex) { return Error(ex.Message); }
            finally { objData.objConnection.Close(); }
        }
        public async Task<CResult> GetSedesAsync(ACA_CARRERAS_SEDESParam data)
        {
            try
            {
                if (data.CORR_EMPRESA <= 0 || data.CORR_CARRERA <= 0) return Error("Guarde primero la carrera para consultar sus sedes.");
                var p = Where(new ACA_CARRERAS_SEDESParam { CORR_EMPRESA = data.CORR_EMPRESA, CORR_CARRERA = data.CORR_CARRERA });
                using var reader = await objData.GetDataReader("V_ACA_SEDES_CARRERA_LOOKUP", p, "Value");
                var rows = new List<ACA_SEDES_CARRERA_LOOKUPView>().FromDataReader(reader).ToList();
                return new CResult { Result = true, Data = rows, RowsAffected = rows.Count };
            }
            catch (Exception ex) { return Error(ex.Message); }
            finally { objData.objConnection.Close(); }
        }
        public async Task<CResult> WriteAsync(int operation, ACA_CARRERAS_SEDESTable data, string user, string station)
        {
            try
            {
                var p = new List<CParameter> {
                    new() { ParameterName="TIPO_ACTUALIZA",Value=operation,DbType=DbType.Int32 },
                    new() { ParameterName="CORR_EMPRESA",Value=data.CORR_EMPRESA,DbType=DbType.Int32 },
                    new() { ParameterName="CORR_CARRERA",Value=data.CORR_CARRERA,DbType=DbType.Int32 },
                    new() { ParameterName="CORR_SEDE",Value=data.CORR_SEDE,DbType=DbType.Int32 },
                    new() { ParameterName="@SYS_LOGIN_USUARIO",Value=user,DbType=DbType.String },
                    new() { ParameterName="@SYS_ESTACION",Value=station??"",DbType=DbType.String },
                    new() { ParameterName="@SYS_NUMERO_ERROR",Value=0,DbType=DbType.Int32,Direction=ParameterDirection.InputOutput },
                    new() { ParameterName="@SYS_MENSAJE_ERROR",Value="",Size=4000,DbType=DbType.String,Direction=ParameterDirection.InputOutput },
                    new() { ParameterName="@SYS_FILAS_AFECTADAS",Value=0,DbType=DbType.Int32,Direction=ParameterDirection.InputOutput }
                };
                await objData.ExecCmd(CommandType.StoredProcedure, "PRAL_MTTO_ACA_CARRERAS_SEDES", true, p);
                var code = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
                if (code != 0) return new CResult { ErrorCode = code, ErrorMessage = Convert.ToString(objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value) };
                var read = await GetAllAsync(new ACA_CARRERAS_SEDESParam
                {
                    CORR_EMPRESA = data.CORR_EMPRESA,
                    CORR_CARRERA = data.CORR_CARRERA,
                    CORR_SEDE = data.CORR_SEDE
                });
                if (!read.Result) return read;
                var row = ((IEnumerable<ACA_CARRERAS_SEDESView>)read.Data).SingleOrDefault();
                return new CResult
                {
                    Result = row != null,
                    Data = row,
                    RowsAffected = row == null ? 0 : 1,
                    ErrorMessage = row == null ? "No se encontró la asociación guardada." : ""
                };
            }
            catch (Exception ex) { return Error(ex.Message); }
            finally { objData.objConnection.Close(); }
        }
        private static CResult Error(string message) => new() { ErrorCode = 51000, ErrorMessage = message };
    }
}
