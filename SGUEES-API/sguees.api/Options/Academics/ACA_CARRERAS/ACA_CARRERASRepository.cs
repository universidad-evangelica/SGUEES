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
    public class ACA_CARRERASRepository : BaseRepository<ACA_CARRERASTable>, IACA_CARRERASRepository
    {
        public ACA_CARRERASRepository(IConfiguration config)
            : base(config.GetConnectionString("defaultConnection"), config["DbProvider:defaultProvider"]) { }

        // El lookup existente conserva su contrato y sus consumidores.
        public Task<CResult> GetCORR_CARRERA_ACA_PROSPECTOAsync(List<CParameter> where)
            => ReadAsync("V_ACA_CARRERAS", where, false);
        public Task<CResult> GetAllAsync(List<CParameter> where) => ReadAsync("V_ACA_CARRERAS", where, false);
        public Task<CResult> GetAsync(List<CParameter> where) => ReadAsync("V_ACA_CARRERAS", where, true);

        private async Task<CResult> ReadAsync(string view, List<CParameter> where, bool single)
        {
            try
            {
                if (!where.Any(x => x.ParameterName == "CORR_EMPRESA" && Convert.ToInt32(x.Value) > 0))
                    return Error(4100, "No se encontró la empresa de la sesión.");
                using var reader = await objData.GetDataReader(view, where, "NOMBRE_CARRERA");
                var rows = new List<ACA_CARRERASView>().FromDataReader(reader).ToList();
                return new CResult
                {
                    Result = true,
                    Data = single ? rows.FirstOrDefault() : rows,
                    RowsAffected = single ? Math.Min(rows.Count, 1) : rows.Count
                };
            }
            catch (Exception ex) { return Error(-1, ex.Message); }
            finally { objData.objConnection.Close(); }
        }

        public Task<CResult> CreateAsync(ACA_CARRERASTable data, string user, string station)
            => WriteAsync(1, data, user, station);
        public Task<CResult> UpdateAsync(ACA_CARRERASTable data, string user, string station)
            => WriteAsync(2, data, user, station);
        public Task<CResult> DeleteAsync(ACA_CARRERASTable data, string user, string station)
            => WriteAsync(3, data, user, station);
        public Task<CResult> ActivarInactivarAsync(ACA_CARRERASTable data, string user, string station)
            => WriteAsync(4, data, user, station);

        private async Task<CResult> WriteAsync(int operation, ACA_CARRERASTable data, string user, string station)
        {
            try
            {
                var p = new List<CParameter>
                {
                    new() { ParameterName="TIPO_ACTUALIZA", Value=operation, DbType=DbType.Int32 },
                    new() { ParameterName="CORR_EMPRESA", Value=data.CORR_EMPRESA, DbType=DbType.Int32 },
                    new() { ParameterName="CORR_CARRERA", Value=operation==1 ? 0 : data.CORR_CARRERA, DbType=DbType.Int32, Direction=ParameterDirection.InputOutput },
                    new() { ParameterName="CORR_AREA_ACADEMICA", Value=data.CORR_AREA_ACADEMICA, DbType=DbType.Int32 },
                    new() { ParameterName="CORR_FACULTAD", Value=data.CORR_FACULTAD, DbType=DbType.Int32 },
                    new() { ParameterName="CORR_GRADO_ACADEMICO", Value=(object)data.CORR_GRADO_ACADEMICO ?? DBNull.Value, DbType=DbType.Int32 },
                    new() { ParameterName="CODIGO_CARRERA", Value=(object)data.CODIGO_CARRERA ?? DBNull.Value, DbType=DbType.String },
                    new() { ParameterName="NOMBRE_CARRERA", Value=(object)data.NOMBRE_CARRERA ?? DBNull.Value, DbType=DbType.String },
                    new() { ParameterName="MAX_REPETICIONES", Value=data.MAX_REPETICIONES, DbType=DbType.Int16 },
                    new() { ParameterName="CREDITOS_REQUERIDOS", Value=(object)data.CREDITOS_REQUERIDOS ?? DBNull.Value, DbType=DbType.Decimal },
                    new() { ParameterName="NOTA_MINIMA", Value=(object)data.NOTA_MINIMA ?? DBNull.Value, DbType=DbType.Decimal },
                    new() { ParameterName="@SYS_LOGIN_USUARIO", Value=user, DbType=DbType.String },
                    new() { ParameterName="@SYS_ESTACION", Value=station ?? "", DbType=DbType.String },
                    new() { ParameterName="@SYS_FILAS_AFECTADAS", Value=0, DbType=DbType.Int32, Direction=ParameterDirection.InputOutput },
                    new() { ParameterName="@SYS_NUMERO_ERROR", Value=0, DbType=DbType.Int32, Direction=ParameterDirection.InputOutput },
                    new() { ParameterName="@SYS_MENSAJE_ERROR", Value="", Size=4000, DbType=DbType.String, Direction=ParameterDirection.InputOutput },
                };
                await objData.ExecCmd(CommandType.StoredProcedure, "PRAL_MTTO_ACA_CARRERAS", true, p);
                var command = objData.objCommand;
                var code = Convert.ToInt32(command.Parameters["@SYS_NUMERO_ERROR"].Value);
                if (code != 0) return Error(code, Convert.ToString(command.Parameters["@SYS_MENSAJE_ERROR"].Value));
                var id = Convert.ToInt32(command.Parameters["CORR_CARRERA"].Value);
                var affected = Convert.ToInt32(command.Parameters["@SYS_FILAS_AFECTADAS"].Value);
                if (operation == 3) return new CResult { Result = true, CodeHelper = id, RowsAffected = affected };
                var result = await GetAsync(new List<CParameter>
                {
                    new() { ParameterName="CORR_EMPRESA", Value=data.CORR_EMPRESA, DbType=DbType.Int32 },
                    new() { ParameterName="CORR_CARRERA", Value=id, DbType=DbType.Int32 }
                });
                result.CodeHelper = id;
                result.RowsAffected = affected;
                return result;
            }
            catch (Exception ex) { return Error(-1, ex.Message); }
            finally { objData.objConnection.Close(); }
        }

        private static CResult Error(int code, string message)
            => new() { ErrorCode = code, ErrorMessage = message, Result = false };
    }
}
