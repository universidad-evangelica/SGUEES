using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public partial class ACA_PROSPECTO_BECAService
    {
        private static List<CParameter> ParametrosFlujo(int empresa, int solicitud) => new()
        {
            new() { ParameterName="CORR_EMPRESA", Value=empresa, DbType=DbType.Int32 },
            new() { ParameterName="CORR_PROSPECTO_BECA", Value=solicitud, DbType=DbType.Int32 },
        };

        public Task<CResult> GetFlujoAsync(int empresa, int solicitud, string usuario)
        {
            if (empresa<=0 || solicitud<=0 || string.IsNullOrWhiteSpace(usuario))
                return Task.FromResult(Error("Seleccione una solicitud de su empresa e inicie sesión."));
            var p=ParametrosFlujo(empresa,solicitud);
            p.Add(new() { ParameterName="LOGIN_SISTEMA", Value=usuario, DbType=DbType.AnsiString, Size=30 });
            return _repo.GetFlujoAsync(p);
        }

        public Task<CResult> GetBitacoraFlujoAsync(int empresa, int solicitud) =>
            empresa>0 && solicitud>0 ? _repo.GetBitacoraFlujoAsync(ParametrosFlujo(empresa,solicitud)) : Task.FromResult(Error("Seleccione una solicitud de su empresa."));

        public Task<CResult> GetBitacoraEdicionAsync(int empresa, int solicitud) =>
            empresa>0 && solicitud>0 ? _repo.GetBitacoraEdicionAsync(ParametrosFlujo(empresa,solicitud)) : Task.FromResult(Error("Seleccione una solicitud de su empresa."));

        public Task<CResult> AccionFlujoAsync(int empresa, BecaSolicitudResolucion data, string operacion, string usuario, string estacion)
        {
            if (data==null || empresa<=0 || string.IsNullOrWhiteSpace(usuario) || data.CORR_PROSPECTO_BECA<=0 || data.VERSION_REGISTRO?.Length!=8)
                return Task.FromResult(Error("Actualice la solicitud antes de continuar."));
            if (operacion!="INICIAR" && operacion!="OTORGAR" && operacion!="NO_OTORGAR")
                return Task.FromResult(Error("La acción de beca no es válida."));
            data.OBSERVACION=data.OBSERVACION?.Trim();
            if (operacion=="INICIAR") data.OBSERVACION="Inicio de revisión de la solicitud por el Analista de Becas.";
            if (string.IsNullOrWhiteSpace(data.OBSERVACION) || data.OBSERVACION.Length>2000)
                return Task.FromResult(Error("Ingrese el motivo de la resolución, con un máximo de 2000 caracteres."));
            return _repo.AccionFlujoAsync(empresa,data,operacion,usuario,estacion);
        }
    }
}
