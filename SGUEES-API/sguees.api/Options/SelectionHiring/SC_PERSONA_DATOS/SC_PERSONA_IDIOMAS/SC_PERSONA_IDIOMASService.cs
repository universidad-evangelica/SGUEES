using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;
namespace sguees.Services
{
    public class SC_PERSONA_IDIOMASService : ISC_PERSONA_IDIOMASService
    {
        private readonly ISC_PERSONA_IDIOMASRepository _repo;
        public SC_PERSONA_IDIOMASService(ISC_PERSONA_IDIOMASRepository repo) { _repo = repo; }
        public async Task<CResult> GetAllAsync(SC_PERSONA_IDIOMASParam xWhere) { var v = ValidatePersona(xWhere.CORR_PERSONA_DATOS); return v ?? await _repo.GetAllAsync(BuildWhere(xWhere)); }
        public async Task<CResult> GetAsync(SC_PERSONA_IDIOMASParam xWhere) { var v = ValidatePersona(xWhere.CORR_PERSONA_DATOS); return v ?? await _repo.GetAsync(BuildWhere(xWhere)); }
        public async Task<CResult> CreateAsync(SC_PERSONA_IDIOMASTable Data, string user, string station)
        {
            if (Data.CORR_PERSONA_DATOS <= 0) return new CResult { Result = false, ErrorCode = -1, ErrorMessage = "CORR_PERSONA_DATOS es obligatorio.", ErrorSource = "Service" };
            if (string.IsNullOrWhiteSpace(Data.IDIOMA) || string.IsNullOrWhiteSpace(Data.NIVEL)) return new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Campos obligatorios: IDIOMA, NIVEL.", ErrorSource = "Service" };
            return await _repo.CreateAsync(Data, user, station);
        }
        public async Task<CResult> UpdateAsync(SC_PERSONA_IDIOMASTable Data, string user, string station)
        {
            if (Data.CORR_PERSONA_DATOS <= 0 || Data.CORR_IDIOMA <= 0) return new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Las llaves del registro son obligatorias.", ErrorSource = "Service" };
            if (string.IsNullOrWhiteSpace(Data.IDIOMA) || string.IsNullOrWhiteSpace(Data.NIVEL)) return new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Campos obligatorios: IDIOMA, NIVEL.", ErrorSource = "Service" };
            return await _repo.UpdateAsync(Data, user, station);
        }
        public async Task<CResult> DeleteAsync(SC_PERSONA_IDIOMASTable Data, string user, string station)
        {
            if (Data.CORR_PERSONA_DATOS <= 0 || Data.CORR_IDIOMA <= 0) return new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Las llaves del registro son obligatorias.", ErrorSource = "Service" };
            return await _repo.DeleteAsync(Data, user, station);
        }
        private static List<CParameter> BuildWhere(SC_PERSONA_IDIOMASParam x)
        {
            var p = new List<CParameter> { new CParameter { ParameterName = "CORR_EMPRESA", Value = x.CORR_EMPRESA, DbType = System.Data.DbType.Int32 }, new CParameter { ParameterName = "CORR_PERSONA_DATOS", Value = x.CORR_PERSONA_DATOS, DbType = System.Data.DbType.Int32 } };
            if (x.CORR_IDIOMA > 0) p.Add(new CParameter { ParameterName = "CORR_IDIOMA", Value = x.CORR_IDIOMA, DbType = System.Data.DbType.Int32 });
            return p;
        }
        private static CResult ValidatePersona(int id) => id > 0 ? null : new CResult { Result = false, ErrorCode = -1, ErrorMessage = "CORR_PERSONA_DATOS es obligatorio.", ErrorSource = "Service" };
    }
}
