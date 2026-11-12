using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Linq;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PROSPECTO_BECA_RESPUESTAService : IACA_PROSPECTO_BECA_RESPUESTAService
    {
        private readonly IACA_PROSPECTO_BECA_RESPUESTARepository _repo;
        public ACA_PROSPECTO_BECA_RESPUESTAService(IACA_PROSPECTO_BECA_RESPUESTARepository repo) { _repo = repo; }
        private static CResult Error(string message) => new() { ErrorCode = 51000, ErrorMessage = message };
        public Task<CResult> GetRespuestasAsync(ACA_PROSPECTO_BECAParam data)
        {
            if (data == null || data.CORR_EMPRESA <= 0 || data.CORR_PROSPECTO_BECA <= 0)
                return Task.FromResult(Error("Seleccione una solicitud de su empresa."));
            return _repo.GetRespuestasAsync(new List<CParameter> {
                new() { ParameterName="CORR_EMPRESA",DbType=DbType.Int32,Value=data.CORR_EMPRESA },
                new() { ParameterName="CORR_PROSPECTO_BECA",DbType=DbType.Int32,Value=data.CORR_PROSPECTO_BECA }
            });
        }
        public Task<CResult> GetOpcionesAsync(int empresa, int pregunta)
        {
            if (empresa <= 0 || pregunta <= 0) return Task.FromResult(Error("Seleccione una pregunta de su empresa."));
            return _repo.GetOpcionesAsync(new List<CParameter> {
                new() { ParameterName="CORR_EMPRESA",DbType=DbType.Int32,Value=empresa },
                new() { ParameterName="CORR_PREGUNTA_BECA",DbType=DbType.Int32,Value=pregunta }
            });
        }
        public Task<CResult> GuardarRespuestaAsync(int empresa, string usuario, AcaProspectoBecaRespuestaEdicion data, string estacion)
        {
            if (empresa <= 0 || string.IsNullOrWhiteSpace(usuario) || data == null || data.CORR_PROSPECTO_BECA <= 0 || data.CORR_PREGUNTA_BECA <= 0
                || data.Filas == null || data.Filas.Count == 0 || data.Filas.Count > 1000
                || data.Filas.Any(f => f == null || f.CORR_RESPUESTA_BECA <= 0 || f.RESPUESTA_TEXTO?.Length > 20000)
                || data.Filas.Select(f => f.CORR_RESPUESTA_BECA).Distinct().Count() != data.Filas.Count)
                return Task.FromResult(Error("La respuesta o la sesion no son validas. Actualice la solicitud."));
            var xml = new XElement("Filas", data.Filas.Select(f => new XElement("Fila",
                new XElement("CORR_RESPUESTA_BECA", f.CORR_RESPUESTA_BECA),
                new XElement("CORR_OPCION_BECA", f.CORR_OPCION_BECA),
                new XElement("RESPUESTA_TEXTO", f.RESPUESTA_TEXTO ?? ""),
                new XElement("RESPUESTA_NUMERO", f.RESPUESTA_NUMERO))));
            return _repo.GuardarRespuestaAsync(new List<CParameter> {
                new() { ParameterName="@CORR_EMPRESA",DbType=DbType.Int32,Value=empresa },
                new() { ParameterName="@SOLICITUD",DbType=DbType.Int32,Value=data.CORR_PROSPECTO_BECA },
                new() { ParameterName="@PREGUNTA",DbType=DbType.Int32,Value=data.CORR_PREGUNTA_BECA },
                new() { ParameterName="@FILAS",DbType=DbType.Xml,Value=xml.ToString(SaveOptions.DisableFormatting) },
                new() { ParameterName="@USUARIO",DbType=DbType.AnsiString,Size=30,Value=usuario },
                new() { ParameterName="@ESTACION",DbType=DbType.AnsiString,Size=30,Value=estacion ?? "" }
            });
        }
    }
}
