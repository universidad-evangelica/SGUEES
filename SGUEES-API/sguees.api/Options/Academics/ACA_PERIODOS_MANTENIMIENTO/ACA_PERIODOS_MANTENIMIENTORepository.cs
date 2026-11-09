using System.Data;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
    public class ACA_PERIODOS_MANTENIMIENTORepository : BaseRepository<ACA_PERIODOInput>, IACA_PERIODOS_MANTENIMIENTORepository
    {
        public ACA_PERIODOS_MANTENIMIENTORepository(IConfiguration config) : base(config.GetConnectionString("defaultConnection"), config["DbProvider:defaultProvider"]) { }
        private static CResult Error(string message) => new() { ErrorCode = 51000, ErrorMessage = message };
        private static CParameter P(string name, DbType type, object value) => new() { ParameterName = name, DbType = type, Value = value ?? DBNull.Value };
        private async Task<List<T>> Rows<T>(string procedure, params CParameter[] parameters) where T : new()
        {
            try
            {
                using var reader = await objData.GetDataReader(CommandType.StoredProcedure, procedure, parameters.ToList());
                return new List<T>().FromDataReader(reader).ToList();
            }
            finally { objData.objConnection.Close(); }
        }
        private async Task<CResult> Read<T>(string procedure, params CParameter[] parameters) where T : new()
        {
            try { var rows = await Rows<T>(procedure, parameters); return new CResult { Result = true, Data = rows, RowsAffected = rows.Count }; }
            catch (Exception ex) { return Error(ex.Message); }
        }
        public Task<CResult> GetAllAsync(ACA_PERIODOConsulta data)
            => data.CORR_EMPRESA <= 0 ? Task.FromResult(Error("No se encontró la empresa de la sesión.")) :
            Read<ACA_PERIODOView>("PRAL_DATA_ACA_PERIODOS_LISTAR",
                P("@empresa", DbType.Int32, data.CORR_EMPRESA), P("@id", DbType.Int32, data.CORR_PERIODO_ACADEMICO));
        public Task<CResult> GetCatalogosAsync(int empresa)
            => empresa <= 0 ? Task.FromResult(Error("No se encontró la empresa de la sesión.")) :
            Read<ACA_PERIODOCatalogo>("PRAL_DATA_ACA_PERIODOS_CATALOGOS", P("@empresa", DbType.Int32, empresa));
        public Task<CResult> GetHistorialAsync(ACA_PERIODOConsulta data)
            => data.CORR_EMPRESA <= 0 || data.CORR_PERIODO_ACADEMICO <= 0 ? Task.FromResult(Error("Seleccione un período guardado.")) :
            Read<ACA_PERIODOHistorial>("PRAL_DATA_ACA_PERIODOS_HISTORIAL",
                P("@empresa", DbType.Int32, data.CORR_EMPRESA), P("@id", DbType.Int32, data.CORR_PERIODO_ACADEMICO));
        public Task<CResult> GetOfertaAsync(ACA_PERIODOConsulta data)
        {
            if (data.CORR_EMPRESA <= 0 || data.CORR_SEDE <= 0 || data.CORR_AREA_ACADEMICA <= 0 || data.ANIO < 1 || data.ANIO > 9999 || data.NUMERO_PERIODO < 1 || data.NUMERO_PERIODO > 255 || !data.FECHA_REFERENCIA.HasValue)
                return Task.FromResult(Error("Seleccione sede, área, año, número y fecha de referencia para consultar V2."));
            // Empresa y padres se verifican también dentro de V2. Solo consulta: no migra consumidores.
            return Read<ACA_PERIODOOferta>("PRAL_DATA_ACA_PERIODOS_OFERTA",
                P("@empresa", DbType.Int32, data.CORR_EMPRESA), P("@sede", DbType.Int32, data.CORR_SEDE), P("@area", DbType.Int32, data.CORR_AREA_ACADEMICA),
                P("@anio", DbType.Int16, data.ANIO), P("@numero", DbType.Byte, data.NUMERO_PERIODO), P("@fecha", DbType.Date, data.FECHA_REFERENCIA.Value.Date));
        }
        public async Task<CResult> WriteAsync(int operation, ACA_PERIODOInput data, string user, string station)
        {
            try
            {
                int id;
                var p = new List<CParameter> {P("@TIPO_ACTUALIZA",DbType.Int32,operation),P("@CORR_EMPRESA",DbType.Int32,data.CORR_EMPRESA),
                        P("@CORR_PERIODO_ACADEMICO",DbType.Int32,operation==1?0:data.CORR_PERIODO_ACADEMICO),
                        P("@CORR_SEDE",DbType.Int32,data.CORR_SEDE),P("@CORR_AREA_ACADEMICA",DbType.Int32,data.CORR_AREA_ACADEMICA),
                        P("@CORR_FACULTAD",DbType.Int32,data.CORR_FACULTAD),P("@CORR_CARRERA",DbType.Int32,data.CORR_CARRERA),
                        P("@ANIO",DbType.Int32,data.ANIO),P("@NUMERO_PERIODO",DbType.Int32,data.NUMERO_PERIODO),
                        P("@FECHA_INICIO",DbType.Date,data.FECHA_INICIO?.Date),P("@FECHA_FIN",DbType.Date,data.FECHA_FIN?.Date),
                        P("@FECHA_INICIO_INSCRIPCION",DbType.Date,data.FECHA_INICIO_INSCRIPCION?.Date),P("@FECHA_FIN_INSCRIPCION",DbType.Date,data.FECHA_FIN_INSCRIPCION?.Date),
                        P("@SYS_LOGIN_USUARIO",DbType.AnsiString,user),P("@SYS_ESTACION",DbType.AnsiString,station??""),
                        P("@SYS_NUMERO_ERROR",DbType.Int32,0),P("@SYS_MENSAJE_ERROR",DbType.String,""),P("@SYS_FILAS_AFECTADAS",DbType.Int32,0)};
                foreach (var parameter in p.Where(x => new[] { "@CORR_PERIODO_ACADEMICO", "@SYS_NUMERO_ERROR", "@SYS_MENSAJE_ERROR", "@SYS_FILAS_AFECTADAS" }.Contains(x.ParameterName))) parameter.Direction = ParameterDirection.InputOutput;
                p.First(x => x.ParameterName == "@SYS_MENSAJE_ERROR").Size = 4000;
                await objData.ExecCmd(CommandType.StoredProcedure, "dbo.PRAL_MTTO_ACA_PERIODOS", true, p);
                var code = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
                if (code != 0) return new CResult { ErrorCode = code, ErrorMessage = Convert.ToString(objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value) };
                id = Convert.ToInt32(objData.objCommand.Parameters["@CORR_PERIODO_ACADEMICO"].Value);
                objData.objConnection.Close();
                var read = await GetAllAsync(new() { CORR_EMPRESA = data.CORR_EMPRESA, CORR_PERIODO_ACADEMICO = id });
                if (!read.Result) return read;
                var row = ((IEnumerable<ACA_PERIODOView>)read.Data).SingleOrDefault();
                return new CResult { Result = row != null, Data = row, CodeHelper = id, RowsAffected = row == null ? 0 : 1, ErrorMessage = row == null ? "No se encontró el período guardado." : "" };
            }
            catch (Exception ex) { return Error(ex.Message); }
            finally { objData.objConnection.Close(); }
        }
    }
}
