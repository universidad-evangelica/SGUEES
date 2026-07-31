using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;
namespace sguees.Services
{
    public class SC_PERSONA_EXPERIENCIA_LABORALService : ISC_PERSONA_EXPERIENCIA_LABORALService
    {
        private readonly ISC_PERSONA_EXPERIENCIA_LABORALRepository _repo;
        public SC_PERSONA_EXPERIENCIA_LABORALService(ISC_PERSONA_EXPERIENCIA_LABORALRepository repo) { _repo = repo; }
        public async Task<CResult> GetAllAsync(SC_PERSONA_EXPERIENCIA_LABORALParam xWhere) { var v = ValidatePersona(xWhere.CORR_PERSONA_DATOS); return v ?? await _repo.GetAllAsync(BuildWhere(xWhere)); }
        public async Task<CResult> GetAsync(SC_PERSONA_EXPERIENCIA_LABORALParam xWhere) { var v = ValidatePersona(xWhere.CORR_PERSONA_DATOS); return v ?? await _repo.GetAsync(BuildWhere(xWhere)); }
        public async Task<CResult> CreateAsync(SC_PERSONA_EXPERIENCIA_LABORALTable Data, string user, string station)
        {
            if (Data.CORR_PERSONA_DATOS <= 0) return new CResult { Result = false, ErrorCode = -1, ErrorMessage = "CORR_PERSONA_DATOS es obligatorio.", ErrorSource = "Service" };
            if (string.IsNullOrWhiteSpace(Data.EMPRESA) || string.IsNullOrWhiteSpace(Data.CARGO)) return new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Campos obligatorios: EMPRESA, CARGO.", ErrorSource = "Service" };
            return await _repo.CreateAsync(Data, user, station);
        }
        public async Task<CResult> UpdateAsync(SC_PERSONA_EXPERIENCIA_LABORALTable Data, string user, string station)
        {
            if (Data.CORR_PERSONA_DATOS <= 0 || Data.CORR_EXPERIENCIA_LABORAL <= 0) return new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Las llaves del registro son obligatorias.", ErrorSource = "Service" };
            if (string.IsNullOrWhiteSpace(Data.EMPRESA) || string.IsNullOrWhiteSpace(Data.CARGO)) return new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Campos obligatorios: EMPRESA, CARGO.", ErrorSource = "Service" };
            return await _repo.UpdateAsync(Data, user, station);
        }
        public async Task<CResult> DeleteAsync(SC_PERSONA_EXPERIENCIA_LABORALTable Data, string user, string station)
        {
            if (Data.CORR_PERSONA_DATOS <= 0 || Data.CORR_EXPERIENCIA_LABORAL <= 0) return new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Las llaves del registro son obligatorias.", ErrorSource = "Service" };
            return await _repo.DeleteAsync(Data, user, station);
        }
        private static List<CParameter> BuildWhere(SC_PERSONA_EXPERIENCIA_LABORALParam x)
        {
            var p = new List<CParameter> { new CParameter { ParameterName = "CORR_EMPRESA", Value = x.CORR_EMPRESA, DbType = System.Data.DbType.Int32 }, new CParameter { ParameterName = "CORR_PERSONA_DATOS", Value = x.CORR_PERSONA_DATOS, DbType = System.Data.DbType.Int32 } };
            if (x.CORR_EXPERIENCIA_LABORAL > 0) p.Add(new CParameter { ParameterName = "CORR_EXPERIENCIA_LABORAL", Value = x.CORR_EXPERIENCIA_LABORAL, DbType = System.Data.DbType.Int32 });
            return p;
        }
        private static CResult ValidatePersona(int id) => id > 0 ? null : new CResult { Result = false, ErrorCode = -1, ErrorMessage = "CORR_PERSONA_DATOS es obligatorio.", ErrorSource = "Service" };
    }
}
