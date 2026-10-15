using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;

namespace sguees.Repositories
{
    public enum CatalogoCarrera { Areas, Facultades, Grados }
    public class ACA_CARRERASLookupView
    {
        public int Key { get; set; }
        public string Value { get; set; }
        public bool ACTIVO { get; set; }
        public int CORR_EMPRESA { get; set; }
    }
    public interface IACA_CARRERASLookupRepository
    {
        Task<CResult> GetAsync(CatalogoCarrera catalogo, int empresa);
    }
    // Las fuentes son constantes del servidor; nunca se aceptan tablas desde HTTP.
    public class ACA_CARRERASLookupRepository : BaseRepository<sguees.Models.ACA_CARRERASTable>, IACA_CARRERASLookupRepository
    {
        public ACA_CARRERASLookupRepository(IConfiguration config)
            : base(config.GetConnectionString("defaultConnection"),config["DbProvider:defaultProvider"]) { }
        public async Task<CResult> GetAsync(CatalogoCarrera catalogo, int empresa)
        {
            if (empresa<=0) return new CResult { ErrorCode=4100, ErrorMessage="No se encontró la empresa de la sesión." };
            var view=catalogo switch {
                CatalogoCarrera.Areas => "V_ACA_AREAS_CARRERA_LOOKUP",
                CatalogoCarrera.Facultades => "V_ACA_FACULTADES_CARRERA_LOOKUP",
                CatalogoCarrera.Grados => "V_ACA_GRADOS_CARRERA_LOOKUP",
                _ => throw new ArgumentOutOfRangeException(nameof(catalogo))
            };
            try
            {
                using var reader=await objData.GetDataReader(view,new List<CParameter> {
                    new() { ParameterName="CORR_EMPRESA",Value=empresa,DbType=DbType.Int32 }
                });
                var rows=new List<ACA_CARRERASLookupView>().FromDataReader(reader).OrderBy(x=>x.Value).ToList();
                // Se incluyen inactivos para conservar referencias existentes al editar.
                foreach(var row in rows.Where(x=>!x.ACTIVO)) row.Value += " (Inactivo)";
                return new CResult { Result=true,Data=rows,RowsAffected=rows.Count };
            }
            catch(Exception ex) { return new CResult { ErrorCode=-1,ErrorMessage=ex.Message }; }
            finally { objData.objConnection.Close(); }
        }
    }
}

