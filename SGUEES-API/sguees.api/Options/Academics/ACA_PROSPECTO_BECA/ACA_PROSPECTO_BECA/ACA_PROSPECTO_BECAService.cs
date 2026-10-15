using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    // Qué hace: encabezado de la solicitud de beca.
    // Cómo lo hace: muestra ACA_PROSPECTO_BECA. Insert, update y delete siguen sin escritura
    //               hasta definir qué columnas del encabezado se pueden cambiar desde esta pantalla.
    public class ACA_PROSPECTO_BECAService : IACA_PROSPECTO_BECAService
    {
        private readonly IACA_PROSPECTO_BECARepository _repo;

        public ACA_PROSPECTO_BECAService(IACA_PROSPECTO_BECARepository repo)
        {
            _repo = repo;
        }

        // Qué hace: solicitudes de beca de un ciclo, en borrador o enviadas.
        // Cómo lo hace: exige el ciclo porque eFramework omite del WHERE los enteros en 0.
        public async Task<CResult> GetAllAsync(ACA_PROSPECTO_BECAParam xWhere)
        {
            if (xWhere.ANIO <= 0 || xWhere.NUMERO_PERIODO <= 0)
                return Error("Debe seleccionar un ciclo");

            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "ANIO", Value = xWhere.ANIO, DbType = System.Data.DbType.Int16 },
                new CParameter() { ParameterName = "NUMERO_PERIODO", Value = xWhere.NUMERO_PERIODO, DbType = System.Data.DbType.Byte },
            };

            return await _repo.GetAllAsync(p);
        }

        // Qué hace: una solicitud de beca.
        // Cómo lo hace: lee la misma vista del listado filtrada por la llave.
        public async Task<CResult> GetAsync(ACA_PROSPECTO_BECAParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO_BECA <= 0)
                return Error("Debe indicar la solicitud de beca");

            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_PROSPECTO_BECA", Value = xWhere.CORR_PROSPECTO_BECA, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public Task<CResult> CreateAsync(ACA_PROSPECTO_BECATable data, string login, string estacion)
        {
            return _repo.CreateAsync(data, login, estacion);
        }

        public Task<CResult> UpdateAsync(ACA_PROSPECTO_BECATable data, string login, string estacion)
        {
            return _repo.UpdateAsync(data, login, estacion);
        }

        public Task<CResult> DeleteAsync(ACA_PROSPECTO_BECATable data, string login, string estacion)
        {
            return _repo.DeleteAsync(data, login, estacion);
        }

        private static CResult Error(string mensaje)
        {
            return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = mensaje };
        }
    }
}
