using System.Data;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
    public class ACA_TIPOS_PRACTICARepository : BaseRepository<ACA_TIPOS_PRACTICATable>, IACA_TIPOS_PRACTICARepository
    {
        public ACA_TIPOS_PRACTICARepository(IConfiguration config)
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

        public Task<CResult> GetAllAsync(ACA_TIPOS_PRACTICAParam data)
        {
            var parameters = new List<CParameter> { P("CORR_EMPRESA", DbType.Int32, data.CORR_EMPRESA) };
            if (data.CORR_TIPO_PRACTICA > 0) parameters.Add(P("CORR_TIPO_PRACTICA", DbType.Int32, data.CORR_TIPO_PRACTICA));
            return Read<ACA_TIPOS_PRACTICAView>("V_ACA_TIPOS_PRACTICA", parameters);
        }

        public async Task<CResult> GuardarAsync(ACA_TIPOS_PRACTICATable data, string user, string station)
        {
            try
            {
                var id = P("@ID", DbType.Int32, data.CORR_TIPO_PRACTICA);
                id.Direction = ParameterDirection.InputOutput;
                await objData.ExecCmd(CommandType.StoredProcedure, "PRAL_MTTO_ACA_TIPOS_PRACTICA", true, new List<CParameter> {
                    P("@CORR_EMPRESA", DbType.Int32, data.CORR_EMPRESA),
                    id,
                    P("@CODIGO_TIPO", DbType.AnsiString, data.CODIGO_TIPO),
                    P("@NOMBRE_TIPO", DbType.String, data.NOMBRE_TIPO),
                    P("@HABILITA_COBROS_ADICIONALES", DbType.Boolean, data.HABILITA_COBROS_ADICIONALES),
                    P("@ACTIVO", DbType.Boolean, data.ACTIVO),
                    P("@VERSION", DbType.Binary, data.VERSION),
                    P("@USUARIO", DbType.AnsiString, user),
                    P("@ESTACION", DbType.AnsiString, station) });
                data.CORR_TIPO_PRACTICA = Convert.ToInt32(objData.objCommand.Parameters["@ID"].Value);
                return new() { Result = true, CodeHelper = data.CORR_TIPO_PRACTICA, RowsAffected = 1 };
            }
            catch (Exception ex) { return Error(ex.Message); }
            finally { objData.objConnection.Close(); }
        }

    }
}
