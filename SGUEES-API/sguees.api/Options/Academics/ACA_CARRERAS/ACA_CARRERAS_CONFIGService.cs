using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_CARRERAS_CONFIGService : IACA_CARRERAS_CONFIGService
    {
        private readonly IACA_CARRERAS_CONFIGRepository repo;
        public ACA_CARRERAS_CONFIGService(IACA_CARRERAS_CONFIGRepository repo) { this.repo = repo; }
        private static CResult Error(string message) => new() { ErrorCode = 51000, ErrorMessage = message };
        public Task<CResult> Catalogos(int empresa) => repo.Catalogos(empresa);
        public Task<CResult> Facultad(int empresa, int facultad) => repo.Facultad(empresa, facultad);
        public Task<CResult> Costos(int empresa, int carrera) => repo.Costos(empresa, carrera);
        public async Task<CResult> GuardarCosto(int empresa, ACA_CostoInput d, string user, string station)
        {
            if (d == null || empresa <= 0 || string.IsNullOrWhiteSpace(user)) return Error("No se encontró la sesión o los datos del costo.");
            d.REFERENCIA_FINANCIAMIENTO = d.REFERENCIA_FINANCIAMIENTO?.Trim();
            var amounts = new[] { d.MATRICULA_NACIONAL, d.MATRICULA_EXTRANJERA, d.INSCRIPCION, d.INSCRIPCION_TUTORIA, d.COSTO_CARNE, d.MONTO_FINANCIAMIENTO, d.CARGO_CAMBIO_ASIGNATURA };
            if (d.CORR_CARRERA <= 0 || d.CORR_SEDE <= 0 || d.CORR_MONEDA <= 0 || d.FECHA_INICIO == null || d.FECHA_FIN < d.FECHA_INICIO) return Error("Seleccione carrera, sede, moneda y una vigencia válida.");
            if (amounts.Any(x => x < 0 || x > 9999999999.99m || decimal.Round(x, 2) != x) || d.PORCENTAJE_RECUPERACION < 0 || d.PORCENTAJE_RECUPERACION > 100 || decimal.Round(d.PORCENTAJE_RECUPERACION, 2) != d.PORCENTAJE_RECUPERACION) return Error("Los montos deben ser no negativos y usar hasta dos decimales; recuperación entre 0 y 100.");
            if (!new[] { "GRAVADO", "EXENTO", "NO_SUJETO" }.Contains(d.TIPO_IMPUESTO) || !new[] { "NUNCA", "SIEMPRE" }.Contains(d.POLITICA_CARGO) || !new[] { "EFECTIVO", "CREDITO" }.Contains(d.MODALIDAD_PAGO) || !new[] { "ASIGNATURA", "CREDITO" }.Contains(d.TIPO_COBRO_ASIGNATURA) || (d.REFERENCIA_FINANCIAMIENTO?.Trim().Length ?? 0) > 20) return Error("Revise las opciones de cobro y la referencia de financiamiento.");
            return await repo.GuardarCosto(empresa, d, user, station);
        }
    }
}
