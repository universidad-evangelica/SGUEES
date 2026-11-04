using System.Text.RegularExpressions;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_TIPOS_PRACTICAService : IACA_TIPOS_PRACTICAService
    {
        private readonly IACA_TIPOS_PRACTICARepository repository;
        public ACA_TIPOS_PRACTICAService(IACA_TIPOS_PRACTICARepository repository) { this.repository = repository; }
        private static CResult Error(string message) => new() { Result = false, ErrorCode = 51000, ErrorMessage = message };

        public Task<CResult> GetAllAsync(ACA_TIPOS_PRACTICAParam data) => data.CORR_EMPRESA > 0 && data.CORR_TIPO_PRACTICA >= 0
            ? repository.GetAllAsync(data) : Task.FromResult(Error("Empresa o identificador inválido."));

        public Task<CResult> GuardarAsync(ACA_TIPOS_PRACTICATable data, bool update, string user, string station)
        {
            if (data == null || data.CORR_EMPRESA <= 0 || string.IsNullOrWhiteSpace(user) || (update ? data.CORR_TIPO_PRACTICA <= 0 : data.CORR_TIPO_PRACTICA != 0))
                return Task.FromResult(Error("Empresa, usuario o identificador inválido."));
            if (update && (data.VERSION == null || data.VERSION.Length != 8)) return Task.FromResult(Error("Actualice la lista para obtener la versión del registro."));

            data.CODIGO_TIPO = data.CODIGO_TIPO?.Trim().ToUpperInvariant();
            data.NOMBRE_TIPO = data.NOMBRE_TIPO?.Trim();
            if (!Regex.IsMatch(data.CODIGO_TIPO ?? "", @"^[A-Z0-9_-]{1,30}$") || string.IsNullOrWhiteSpace(data.NOMBRE_TIPO) || data.NOMBRE_TIPO.Length > 80)
                return Task.FromResult(Error("Código obligatorio hasta 30 caracteres, sin espacios; nombre obligatorio hasta 80."));

            return repository.GuardarAsync(data, user, station);
        }

    }
}
