using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;
namespace sguees.Services
{
    public class SC_PERSONA_COMPETENCIAS_TECNICASService : ISC_PERSONA_COMPETENCIAS_TECNICASService
    {
        private readonly ISC_PERSONA_COMPETENCIAS_TECNICASRepository _repo;
        public SC_PERSONA_COMPETENCIAS_TECNICASService(ISC_PERSONA_COMPETENCIAS_TECNICASRepository repo) { _repo = repo; }
        public async Task<CResult> GetAllAsync(SC_PERSONA_COMPETENCIAS_TECNICASParam xWhere) { var v = ValidatePersona(xWhere.CORR_PERSONA_DATOS); return v ?? await _repo.GetAllAsync(BuildWhere(xWhere)); }
        public async Task<CResult> GetAsync(SC_PERSONA_COMPETENCIAS_TECNICASParam xWhere) { var v = ValidatePersona(xWhere.CORR_PERSONA_DATOS); return v ?? await _repo.GetAsync(BuildWhere(xWhere)); }
        public async Task<CResult> CreateAsync(SC_PERSONA_COMPETENCIAS_TECNICASTable Data, string user, string station)
        {
            if (Data.CORR_PERSONA_DATOS <= 0) return new CResult { Result = false, ErrorCode = -1, ErrorMessage = "CORR_PERSONA_DATOS es obligatorio.", ErrorSource = "Service" };
            if (string.IsNullOrWhiteSpace(Data.HERRAMIENTA) || string.IsNullOrWhiteSpace(Data.NIVEL)) return new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Campos obligatorios: HERRAMIENTA, NIVEL.", ErrorSource = "Service" };
            return await _repo.CreateAsync(Data, user, station);
        }
        public async Task<CResult> UpdateAsync(SC_PERSONA_COMPETENCIAS_TECNICASTable Data, string user, string station)
        {
            if (Data.CORR_PERSONA_DATOS <= 0 || Data.CORR_COMPETENCIA_TECNICA <= 0) return new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Las llaves del registro son obligatorias.", ErrorSource = "Service" };
            if (string.IsNullOrWhiteSpace(Data.HERRAMIENTA) || string.IsNullOrWhiteSpace(Data.NIVEL)) return new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Campos obligatorios: HERRAMIENTA, NIVEL.", ErrorSource = "Service" };
            return await _repo.UpdateAsync(Data, user, station);
        }
        public async Task<CResult> DeleteAsync(SC_PERSONA_COMPETENCIAS_TECNICASTable Data, string user, string station)
        {
            if (Data.CORR_PERSONA_DATOS <= 0 || Data.CORR_COMPETENCIA_TECNICA <= 0) return new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Las llaves del registro son obligatorias.", ErrorSource = "Service" };
            return await _repo.DeleteAsync(Data, user, station);
        }
        private static List<CParameter> BuildWhere(SC_PERSONA_COMPETENCIAS_TECNICASParam x)
        {
            var p = new List<CParameter> { new CParameter { ParameterName = "CORR_EMPRESA", Value = x.CORR_EMPRESA, DbType = System.Data.DbType.Int32 }, new CParameter { ParameterName = "CORR_PERSONA_DATOS", Value = x.CORR_PERSONA_DATOS, DbType = System.Data.DbType.Int32 } };
            if (x.CORR_COMPETENCIA_TECNICA > 0) p.Add(new CParameter { ParameterName = "CORR_COMPETENCIA_TECNICA", Value = x.CORR_COMPETENCIA_TECNICA, DbType = System.Data.DbType.Int32 });
            return p;
        }
        private static CResult ValidatePersona(int id) => id > 0 ? null : new CResult { Result = false, ErrorCode = -1, ErrorMessage = "CORR_PERSONA_DATOS es obligatorio.", ErrorSource = "Service" };
    }
}
