using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_CARRERASService : IACA_CARRERASService
    {
        private readonly IACA_CARRERASRepository _repo;
        public ACA_CARRERASService(IACA_CARRERASRepository repo) { _repo=repo; }

        private static List<CParameter> Where(ACA_CARRERASParam data)
        {
            var p = new List<CParameter> { new() { ParameterName="CORR_EMPRESA", Value=data.CORR_EMPRESA, DbType=DbType.Int32 } };
            if (data.CORR_CARRERA>0) p.Add(new() { ParameterName="CORR_CARRERA", Value=data.CORR_CARRERA, DbType=DbType.Int32 });
            return p;
        }
        public Task<CResult> GetAllAsync(ACA_CARRERASParam data) => _repo.GetAllAsync(Where(data));
        public Task<CResult> GetAsync(ACA_CARRERASParam data)
            => data.CORR_CARRERA>0 ? _repo.GetAsync(Where(data)) : Task.FromResult(Error("Seleccione una carrera."));
        public Task<CResult> GetCORR_CARRERA_ACA_PROSPECTOAsync(ACA_CARRERASParam data)
        {
            var p=Where(data);
            p.Add(new() { ParameterName="ACTIVO", Value=true, DbType=DbType.Boolean });
            return _repo.GetCORR_CARRERA_ACA_PROSPECTOAsync(p);
        }
        public Task<CResult> CreateAsync(ACA_CARRERASTable data, string user, string station)
            => Save(data,user,station,false);
        public Task<CResult> UpdateAsync(ACA_CARRERASTable data, string user, string station)
            => Save(data,user,station,true);
        private Task<CResult> Save(ACA_CARRERASTable data, string user, string station, bool update)
        {
            data.CODIGO_CARRERA=data.CODIGO_CARRERA?.Trim();
            data.NOMBRE_CARRERA=data.NOMBRE_CARRERA?.Trim();
            if (string.IsNullOrWhiteSpace(data.CODIGO_CARRERA) || data.CODIGO_CARRERA.Length>30)
                return Task.FromResult(Error("Ingrese el código de la carrera (máximo 30 caracteres)."));
            if (string.IsNullOrWhiteSpace(data.NOMBRE_CARRERA) || data.NOMBRE_CARRERA.Length>250)
                return Task.FromResult(Error("Ingrese el nombre de la carrera (máximo 250 caracteres)."));
            if (data.CORR_AREA_ACADEMICA<=0 || data.CORR_FACULTAD<=0)
                return Task.FromResult(Error("Seleccione el área académica y la facultad."));
            if (data.CORR_GRADO_ACADEMICO.HasValue && data.CORR_GRADO_ACADEMICO<=0)
                return Task.FromResult(Error("El grado académico debe ser válido o quedar vacío."));
            if (update && data.CORR_CARRERA<=0) return Task.FromResult(Error("Seleccione una carrera."));
            return update ? _repo.UpdateAsync(data,user,station) : _repo.CreateAsync(data,user,station);
        }
        public Task<CResult> DeleteAsync(ACA_CARRERASTable data, string user, string station)
            => _repo.DeleteAsync(data,user,station);
        public Task<CResult> ActivarInactivarAsync(ACA_CARRERASTable data, string user, string station)
            => _repo.ActivarInactivarAsync(data,user,station);
        private static CResult Error(string message) => new() { ErrorCode=51000, ErrorMessage=message };
    }
}
