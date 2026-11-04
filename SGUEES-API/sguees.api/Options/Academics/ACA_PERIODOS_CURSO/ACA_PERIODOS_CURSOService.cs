using System.Text.RegularExpressions;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PERIODOS_CURSOService : IACA_PERIODOS_CURSOService
    {
        private readonly IACA_PERIODOS_CURSORepository repository;
        public ACA_PERIODOS_CURSOService(IACA_PERIODOS_CURSORepository repository) { this.repository = repository; }
        private static CResult Error(string message) => new() { Result = false, ErrorCode = 51000, ErrorMessage = message };

        public Task<CResult> GetAllAsync(ACA_PERIODOS_CURSOParam data) => data.CORR_EMPRESA > 0 && data.CORR_PERIODO_CURSO >= 0
            ? repository.GetAllAsync(data) : Task.FromResult(Error("Empresa o identificador inválido."));

        public Task<CResult> GuardarAsync(ACA_PERIODOS_CURSOTable data, bool update, string user, string station)
        {
            if (data == null || data.CORR_EMPRESA <= 0 || string.IsNullOrWhiteSpace(user) || (update ? data.CORR_PERIODO_CURSO <= 0 : data.CORR_PERIODO_CURSO != 0))
                return Task.FromResult(Error("Empresa, usuario o identificador inválido."));
            if (update && (data.VERSION == null || data.VERSION.Length != 8)) return Task.FromResult(Error("Actualice la lista para obtener la versión del registro."));

            data.CODIGO_PERIODO = data.CODIGO_PERIODO?.Trim().ToUpperInvariant();
            data.NOMBRE_PERIODO = data.NOMBRE_PERIODO?.Trim();
            if (!Regex.IsMatch(data.CODIGO_PERIODO ?? "", @"^[A-Z0-9_-]{1,20}$") || string.IsNullOrWhiteSpace(data.NOMBRE_PERIODO) || data.NOMBRE_PERIODO.Length > 80)
                return Task.FromResult(Error("Código obligatorio hasta 20 caracteres, sin espacios; nombre obligatorio hasta 80."));
            if (data.DURACION_MESES < 1 || data.DURACION_MESES > 120) return Task.FromResult(Error("La duración debe ser de 1 a 120 meses enteros."));

            return repository.GuardarAsync(data, user, station);
        }

    }
}
