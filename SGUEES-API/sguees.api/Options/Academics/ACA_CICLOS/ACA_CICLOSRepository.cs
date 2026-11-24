using System.Data;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;
using Microsoft.Data.SqlClient;

namespace sguees.Repositories
{
    public class ACA_CICLOSRepository : BaseRepository<ACA_CICLOInput>, IACA_CICLOSRepository
    {
        public ACA_CICLOSRepository(IConfiguration config) : base(config.GetConnectionString("defaultConnection"), config["DbProvider:defaultProvider"]) { }
        private static CResult Error(string message, int code = 51000) => new() { ErrorCode = code, ErrorMessage = message };
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
            try { var rows = await Rows<T>(procedure, parameters); return new() { Result = true, Data = rows, RowsAffected = rows.Count }; }
            catch (SqlException ex) when (ex.Number == 51009) { return Error(ex.Message, ex.Number); }
            catch (Exception ex) { return Error(ex.Message); }
        }
        public Task<CResult> Areas(int empresa) => Read<ACA_CICLOS_AREASView>("PRAL_DATA_ACA_CICLOS_AREAS", P("@empresa", DbType.Int32, empresa));
        public Task<CResult> Listar(int empresa, int area) => Read<ACA_CICLOS_LISTARView>("PRAL_DATA_ACA_CICLOS_LISTAR", P("@empresa", DbType.Int32, empresa), P("@area", DbType.Int32, area));
        public Task<CResult> Catalogos(int empresa) => Read<ACA_CICLOS_CATALOGOSView>("PRAL_DATA_ACA_CICLOS_CATALOGOS", P("@empresa", DbType.Int32, empresa));
        public Task<CResult> Candidatas(int empresa, int area, DateTime fecha) => Read<ACA_CICLOS_CANDIDATAView>("PRAL_DATA_ACA_CICLOS_CANDIDATAS",
            P("@empresa", DbType.Int32, empresa), P("@area", DbType.Int32, area), P("@inicio", DbType.Date, fecha.Date));
        public Task<CResult> Faltantes(int empresa, int id, byte[] version) => Read<ACA_CICLOS_FALTANTEView>("PRAL_DATA_ACA_CICLOS_FALTANTES",
            P("@empresa", DbType.Int32, empresa), P("@id", DbType.Int32, id), new CParameter { ParameterName = "@version", DbType = DbType.Binary, Size = 8, Value = version });
        public async Task<CResult> Detalle(int empresa, int id)
        {
            try
            {
                var header = await Rows<ACA_CICLOS_CABECERAView>("PRAL_DATA_ACA_CICLOS_CABECERA", P("@empresa", DbType.Int32, empresa), P("@id", DbType.Int32, id));
                if (header.Count != 1) return Error("El ciclo no existe en la empresa de la sesión.");
                var sedes = await Rows<ACA_CICLOS_SEDESView>("PRAL_DATA_ACA_CICLOS_SEDES", P("@id", DbType.Int32, id), P("@empresa", DbType.Int32, empresa));
                var facultades = await Rows<ACA_CICLOS_FACULTADESView>("PRAL_DATA_ACA_CICLOS_FACULTADES", P("@id", DbType.Int32, id), P("@empresa", DbType.Int32, empresa));
                var carreras = await Rows<ACA_CICLOS_CARRERASView>("PRAL_DATA_ACA_CICLOS_CARRERAS", P("@id", DbType.Int32, id), P("@empresa", DbType.Int32, empresa));
                var historial = await Rows<ACA_CICLOS_HISTORIALView>("PRAL_DATA_ACA_CICLOS_HISTORIAL", P("@id", DbType.Int32, id), P("@empresa", DbType.Int32, empresa));
                var origen = await Rows<ACA_CICLOS_ORIGENView>("PRAL_DATA_ACA_CICLOS_ORIGEN", P("@id", DbType.Int32, id), P("@empresa", DbType.Int32, empresa));
                var planes = await Rows<ACA_CICLOS_PLANESView>("PRAL_DATA_ACA_CICLOS_PLANES", P("@id", DbType.Int32, id), P("@empresa", DbType.Int32, empresa));
                var candidatas = await Rows<ACA_CICLOS_CANDIDATAView>("PRAL_DATA_ACA_CICLOS_CANDIDATAS", P("@empresa", DbType.Int32, empresa),
                    P("@area", DbType.Int32, header[0].CORR_AREA_ACADEMICA), P("@inicio", DbType.Date, header[0].FECHA_INICIO));
                var actual = await Rows<ACA_CICLOS_CABECERAView>("PRAL_DATA_ACA_CICLOS_CABECERA", P("@empresa", DbType.Int32, empresa), P("@id", DbType.Int32, id));
                if (actual.Count != 1 || !header[0].VERSION_REGISTRO.SequenceEqual(actual[0].VERSION_REGISTRO))
                    return Error("El ciclo cambió mientras se consultaba. Actualice la pantalla.", 51009);
                return new() { Result = true, Data = new { Cabecera = header[0], Sedes = sedes, Facultades = facultades, Carreras = carreras, Historial = historial, Periodos = origen, Planes = planes, Candidatas = candidatas } };
            }
            catch (Exception ex) { return Error(ex.Message); }
        }
        public Task<CResult> Oferta(int empresa, int id, int sede, DateTime fecha) => Read<ACA_CICLOS_OFERTAView>("PRAL_DATA_ACA_CICLOS_OFERTA",
          P("@empresa", DbType.Int32, empresa), P("@id", DbType.Int32, id), P("@sede", DbType.Int32, sede), P("@fecha", DbType.Date, fecha.Date));
        public async Task<CResult> Write(string operation, int empresa, ACA_CICLOInput input, string user, string station)
        {
            if (empresa <= 0 || string.IsNullOrWhiteSpace(user)) return Error("No se encontró empresa o usuario de la sesión.");
            try
            {
                int id;
                var p = new List<CParameter> {P("@OPERACION",DbType.AnsiString,operation),P("@CORR_EMPRESA",DbType.Int32,empresa),P("@CORR_CICLO_ACADEMICO",DbType.Int32,input.CORR_CICLO_ACADEMICO),
                     P("@CORR_AREA_ACADEMICA",DbType.Int32,input.CORR_AREA_ACADEMICA),P("@ANIO",DbType.Int32,input.ANIO),P("@NUMERO_PERIODO",DbType.Int32,input.NUMERO_PERIODO),
                     P("@FECHA_INICIO",DbType.Date,input.FECHA_INICIO?.Date),P("@FECHA_FIN",DbType.Date,input.FECHA_FIN?.Date),P("@FECHA_INICIO_INSCRIPCION",DbType.Date,input.FECHA_INICIO_INSCRIPCION?.Date),P("@FECHA_FIN_INSCRIPCION",DbType.Date,input.FECHA_FIN_INSCRIPCION?.Date),
                     P("@CORR_SEDE",DbType.Int32,input.CORR_SEDE),P("@CORR_FACULTAD",DbType.Int32,input.CORR_FACULTAD),P("@CORR_CARRERA",DbType.Int32,input.CORR_CARRERA),P("@ACTIVO",DbType.Boolean,input.ACTIVO),
                     P("@SYS_LOGIN_USUARIO",DbType.AnsiString,user),P("@SYS_ESTACION",DbType.AnsiString,station),P("@SYS_NUMERO_ERROR",DbType.Int32,0),P("@SYS_MENSAJE_ERROR",DbType.String,"")};
                p.Add(new CParameter { ParameterName = "@VERSION_REGISTRO", DbType = DbType.Binary, Size = 8, Value = (object)input.VERSION_REGISTRO ?? DBNull.Value });
                p.Add(new CParameter { ParameterName = "@HUELLA_FALTANTES", DbType = DbType.Binary, Size = 32, Value = (object)input.HUELLA_FALTANTES ?? DBNull.Value });
                foreach (var parameter in p.Where(x => new[] { "@CORR_CICLO_ACADEMICO", "@SYS_NUMERO_ERROR", "@SYS_MENSAJE_ERROR" }.Contains(x.ParameterName))) parameter.Direction = ParameterDirection.InputOutput;
                p.First(x => x.ParameterName == "@SYS_MENSAJE_ERROR").Size = 4000;
                await objData.ExecCmd(CommandType.StoredProcedure, "dbo.PRAL_MTTO_ACA_CICLOS", true, p);
                var code = Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
                if (code != 0) return new CResult { ErrorCode = code, ErrorMessage = Convert.ToString(objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value) };
                id = Convert.ToInt32(objData.objCommand.Parameters["@CORR_CICLO_ACADEMICO"].Value);
                objData.objConnection.Close();
                return await Detalle(empresa, id);
            }
            catch (Exception ex) { return Error(ex.Message); }
            finally { objData.objConnection.Close(); }
        }
    }
}
