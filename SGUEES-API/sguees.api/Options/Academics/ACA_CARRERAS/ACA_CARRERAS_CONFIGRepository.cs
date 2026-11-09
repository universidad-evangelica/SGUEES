using System.Data;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;
using System.Text.Json;

namespace sguees.Repositories
{
    public class ACA_CARRERAS_CONFIGRepository : BaseRepository<ACA_CostoInput>, IACA_CARRERAS_CONFIGRepository
    {
        public ACA_CARRERAS_CONFIGRepository(Microsoft.Extensions.Configuration.IConfiguration cfg) : base(cfg.GetConnectionString("defaultConnection"), cfg["DbProvider:defaultProvider"]) { }
        private static CResult Error(string m) => new() { ErrorCode = 51000, ErrorMessage = m };
        private static CParameter P(string name, DbType type, object value) => new() { ParameterName = name, DbType = type, Value = value ?? DBNull.Value };
        private async Task<List<T>> Rows<T>(string procedure, int empresa, int id = 0) where T : new()
        {
            try
            {
                using var reader = await objData.GetDataReader(CommandType.StoredProcedure, procedure, new List<CParameter> { P("@empresa", DbType.Int32, empresa), P("@id", DbType.Int32, id) });
                return new List<T>().FromDataReader(reader).ToList();
            }
            finally { objData.objConnection.Close(); }
        }
        public async Task<CResult> Catalogos(int empresa)
        {
            try
            {
                var empleados = await Rows<ACA_CONFIG_EMPLEADOSView>("PRAL_DATA_ACA_CONFIG_EMPLEADOS", empresa);
                var monedas = await Rows<ACA_CONFIG_MONEDASView>("PRAL_DATA_ACA_CONFIG_MONEDAS", empresa);
                var facultades = await Rows<ACA_CONFIG_DECANOSView>("PRAL_DATA_ACA_CONFIG_DECANOS", empresa);
                return new() { Result = true, Data = new { Empleados = empleados, Monedas = monedas, Facultades = facultades } };
            }
            catch (Exception ex) { return Error(ex.Message); }
        }
        public async Task<CResult> Facultad(int empresa, int facultad)
        {
            try
            {
                var f = await Rows<ACA_CONFIG_FACULTADView>("PRAL_DATA_ACA_CONFIG_FACULTAD", empresa, facultad); if (f.Count != 1) return Error("La facultad no existe en la empresa de sesión.");
                var carreras = await Rows<ACA_CONFIG_CARRERASView>("PRAL_DATA_ACA_CONFIG_CARRERAS", empresa, facultad);
                var ciclos = await Rows<ACA_CONFIG_CICLOSView>("PRAL_DATA_ACA_CONFIG_CICLOS", empresa, facultad);
                return new() { Result = true, Data = new { Carreras = carreras, Ciclos = ciclos } };
            }
            catch (Exception ex) { return Error(ex.Message); }
        }
        public async Task<CResult> Costos(int empresa, int carrera)
        {
            try
            {
                if ((await Rows<ACA_CONFIG_CARRERAView>("PRAL_DATA_ACA_CONFIG_CARRERA", empresa, carrera)).Count != 1) return Error("La carrera no existe en su empresa.");
                var rows = await Rows<ACA_CONFIG_COSTOSView>("PRAL_DATA_ACA_CONFIG_COSTOS", empresa, carrera);
                return new() { Result = true, Data = rows };
            }
            catch (Exception ex) { return Error(ex.Message); }
        }
        public async Task<CResult> GuardarCosto(int empresa, sguees.Models.ACA_CostoInput d, string user, string station)
        {
            try
            {
                var p = new List<CParameter> {
                    P("@EMPRESA",DbType.Int32,empresa),P("@DATOS",DbType.String,JsonSerializer.Serialize(d)),
                    P("@USUARIO",DbType.AnsiString,user),P("@ESTACION",DbType.AnsiString,station??""),
                    P("@VERSION",DbType.Binary,string.IsNullOrEmpty(d.VERSION)?DBNull.Value:Convert.FromBase64String(d.VERSION)),
                    P("@ID",DbType.Int32,d.CORR_COSTO)
                };
                p.First(x => x.ParameterName == "@VERSION").Size = 8;
                p.First(x => x.ParameterName == "@ID").Direction = ParameterDirection.InputOutput;
                await objData.ExecCmd(CommandType.StoredProcedure, "PR_ACA_CARRERA_COSTO_GUARDAR", true, p);
                objData.objConnection.Close();
                return await Costos(empresa, d.CORR_CARRERA);
            }
            catch (Exception ex) { return Error(ex.Message); }
            finally { objData.objConnection.Close(); }
        }
    }
}
