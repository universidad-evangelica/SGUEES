using System.Data;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
    public class ACA_ASIGNATURASRepository : BaseRepository<ACA_ASIGNATURASTable>, IACA_ASIGNATURASRepository
    {
        public ACA_ASIGNATURASRepository(IConfiguration config)
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

        public Task<CResult> GetAllAsync(ACA_ASIGNATURASParam data)
        {
            var parameters = new List<CParameter> { P("CORR_EMPRESA", DbType.Int32, data.CORR_EMPRESA) };
            if (data.CORR_ASIGNATURA > 0) parameters.Add(P("CORR_ASIGNATURA", DbType.Int32, data.CORR_ASIGNATURA));
            return Read<ACA_ASIGNATURASView>("V_ACA_ASIGNATURAS", parameters);
        }

        public async Task<CResult> GuardarAsync(ACA_ASIGNATURASTable data, string user, string station)
        {
            try
            {
                var id = P("@ID", DbType.Int32, data.CORR_ASIGNATURA);
                id.Direction = ParameterDirection.InputOutput;
                await objData.ExecCmd(CommandType.StoredProcedure, "PRAL_MTTO_ACA_ASIGNATURAS", true, new List<CParameter> {
                    P("@CORR_EMPRESA", DbType.Int32, data.CORR_EMPRESA),
                    id,
                    P("@CORR_CARRERA", DbType.Int32, data.CORR_CARRERA),
                    P("@CODIGO_ASIGNATURA", DbType.AnsiString, data.CODIGO_ASIGNATURA),
                    P("@ALIAS", DbType.String, data.ALIAS),
                    P("@NOMBRE_ASIGNATURA", DbType.String, data.NOMBRE_ASIGNATURA),
                    P("@UNIDADES_VALORATIVAS", DbType.Decimal, data.UNIDADES_VALORATIVAS),
                    P("@FECHA_APERTURA", DbType.Date, data.FECHA_APERTURA),
                    P("@CORR_PERIODO_CURSO", DbType.Int32, data.CORR_PERIODO_CURSO),
                    P("@CORR_TIPO_PRACTICA", DbType.Int32, data.CORR_TIPO_PRACTICA),
                    P("@ACTIVO", DbType.Boolean, data.ACTIVO),
                    P("@VERSION", DbType.Binary, data.VERSION),
                    P("@USUARIO", DbType.AnsiString, user),
                    P("@ESTACION", DbType.AnsiString, station) });
                data.CORR_ASIGNATURA = Convert.ToInt32(objData.objCommand.Parameters["@ID"].Value);
                return new() { Result = true, CodeHelper = data.CORR_ASIGNATURA, RowsAffected = 1 };
            }
            catch (Exception ex) { return Error(ex.Message); }
            finally { objData.objConnection.Close(); }
        }

        public Task<CResult> Carreras(int empresa) => Read<ACA_ASIGNATURAS_CARRERAView>("V_ACA_ASIGNATURAS_CARRERAS", new List<CParameter> { P("CORR_EMPRESA", DbType.Int32, empresa) });
        public Task<CResult> MateriasPractica(int empresa, int facultad, int carrera) => Read<ACA_ASIGNATURAS_PRACTICAView>("PRAL_DATA_ACA_ASIGNATURAS_PRACTICAS", new List<CParameter> {
            P("@CORR_EMPRESA", DbType.Int32, empresa), P("@CORR_FACULTAD", DbType.Int32, facultad), P("@CORR_CARRERA", DbType.Int32, carrera) }, true);

        public async Task<CResult> AsignarPractica(int empresa, ACA_ASIGNATURAS_PRACTICAInput data, string user, string station)
        {
            try
            {
                var materias = new System.Xml.Linq.XElement("asignaturas", data.ASIGNATURAS.Select(a => new System.Xml.Linq.XElement("a",
                    new System.Xml.Linq.XAttribute("id", a.CORR_ASIGNATURA), new System.Xml.Linq.XAttribute("version", Convert.ToHexString(a.VERSION)))));
                var filas = P("@FILAS", DbType.Int32, 0);
                filas.Direction = ParameterDirection.Output;
                await objData.ExecCmd(CommandType.StoredProcedure, "PRAL_MTTO_ACA_ASIGNATURAS_PRACTICAS", true, new List<CParameter> {
                    P("@CORR_EMPRESA", DbType.Int32, empresa), P("@CORR_FACULTAD", DbType.Int32, data.CORR_FACULTAD),
                    P("@CORR_CARRERA", DbType.Int32, data.CORR_CARRERA), P("@CORR_TIPO_PRACTICA", DbType.Int32, data.CORR_TIPO_PRACTICA),
                    P("@VERSION_TIPO", DbType.Binary, data.VERSION_TIPO), P("@ASIGNATURAS", DbType.Xml, materias.ToString()),
                    P("@CONFIRMAR_REEMPLAZOS", DbType.Boolean, data.CONFIRMAR_REEMPLAZOS), P("@USUARIO", DbType.AnsiString, user), P("@ESTACION", DbType.AnsiString, station), filas });
                return new() { Result = true, RowsAffected = Convert.ToInt32(objData.objCommand.Parameters["@FILAS"].Value) };
            }
            catch (Exception ex) { return Error(ex.Message); }
            finally { objData.objConnection.Close(); }
        }
        public Task<CResult> Planes(int empresa, int asignatura) => Read<ACA_ASIGNATURAS_PLANView>("PRAL_DATA_ACA_ASIGNATURAS_PLANES", new List<CParameter> {
            P("@CORR_EMPRESA", DbType.Int32, empresa), P("@CORR_ASIGNATURA", DbType.Int32, asignatura) }, true);

        public async Task<CResult> GuardarPlan(int empresa, ACA_ASIGNATURAS_PLANInput data, string user, string station)
        {
            try
            {
                await objData.ExecCmd(CommandType.StoredProcedure, "PRAL_MTTO_ACA_PLANES_ASIGNATURAS", true, new List<CParameter> {
                    P("@CORR_EMPRESA", DbType.Int32, empresa), P("@CORR_ASIGNATURA", DbType.Int32, data.CORR_ASIGNATURA),
                    P("@CORR_PLAN_ACADEMICO", DbType.Int32, data.CORR_PLAN_ACADEMICO), P("@ACTIVO", DbType.Boolean, data.ACTIVO),
                    P("@VERSION", DbType.Binary, data.VERSION), P("@USUARIO", DbType.AnsiString, user), P("@ESTACION", DbType.AnsiString, station) });
                return new CResult { Result = true, RowsAffected = 1 };
            }
            catch (Exception ex) { return Error(ex.Message); }
            finally { objData.objConnection.Close(); }
        }

    }
}
