using System.Data;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
    public class ACA_PERIODOS_CURSORepository : BaseRepository<ACA_PERIODOS_CURSOTable>, IACA_PERIODOS_CURSORepository
    {
        public ACA_PERIODOS_CURSORepository(IConfiguration config)
            : base(config.GetConnectionString("defaultConnection"), config["DbProvider:defaultProvider"]) { }

        private static CResult Error(string message) => new() { Result = false, ErrorCode = 51000, ErrorMessage = message };
        private static CParameter P(string name, DbType type, object value)
            => new() { ParameterName = name, DbType = type, Value = value ?? DBNull.Value, Size = type == DbType.Binary ? 8 : 0 };

        private async Task<CResult> Read<T>(string source, List<CParameter> parameters, bool procedure = false) where T : new()
        {
            try
            {
                using var reader = procedure
                    ? await objData.GetDataReader(CommandType.StoredProcedure, source, parameters)
                    : await objData.GetDataReader(source, parameters);
                var rows = new List<T>().FromDataReader(reader).ToList();
                return new() { Result = true, Data = rows, RowsAffected = rows.Count };
            }
            catch (Exception ex) { return Error(ex.Message); }
            finally { objData.objConnection.Close(); }
        }

        public Task<CResult> GetAllAsync(ACA_PERIODOS_CURSOParam data)
        {
            var parameters = new List<CParameter> { P("CORR_EMPRESA", DbType.Int32, data.CORR_EMPRESA) };
            if (data.CORR_PERIODO_CURSO > 0) parameters.Add(P("CORR_PERIODO_CURSO", DbType.Int32, data.CORR_PERIODO_CURSO));
            return Read<ACA_PERIODOS_CURSOView>("V_ACA_PERIODOS_CURSO", parameters);
        }

        public async Task<CResult> GuardarAsync(ACA_PERIODOS_CURSOTable data, string user, string station)
        {
            try
            {
                var id = P("@ID", DbType.Int32, data.CORR_PERIODO_CURSO);
                id.Direction = ParameterDirection.InputOutput;
                await objData.ExecCmd(CommandType.StoredProcedure, "PRAL_MTTO_ACA_PERIODOS_CURSO", true, new List<CParameter> {
                    P("@CORR_EMPRESA", DbType.Int32, data.CORR_EMPRESA),
                    id,
                    P("@CODIGO_PERIODO", DbType.AnsiString, data.CODIGO_PERIODO),
                    P("@NOMBRE_PERIODO", DbType.String, data.NOMBRE_PERIODO),
                    P("@DURACION_MESES", DbType.Int32, data.DURACION_MESES),
                    P("@ACTIVO", DbType.Boolean, data.ACTIVO),
                    P("@VERSION", DbType.Binary, data.VERSION),
                    P("@USUARIO", DbType.AnsiString, user),
                    P("@ESTACION", DbType.AnsiString, station) });
                data.CORR_PERIODO_CURSO = Convert.ToInt32(objData.objCommand.Parameters["@ID"].Value);
                return new() { Result = true, CodeHelper = data.CORR_PERIODO_CURSO, RowsAffected = 1 };
            }
            catch (Exception ex) { return Error(ex.Message); }
            finally { objData.objConnection.Close(); }
        }

    }
}
