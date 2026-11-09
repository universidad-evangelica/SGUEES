using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PERIODOS_MANTENIMIENTOService : IACA_PERIODOS_MANTENIMIENTOService
    {
        private readonly IACA_PERIODOS_MANTENIMIENTORepository repo;
        public ACA_PERIODOS_MANTENIMIENTOService(IACA_PERIODOS_MANTENIMIENTORepository repo) { this.repo = repo; }
        public Task<CResult> GetAllAsync(ACA_PERIODOConsulta data) => repo.GetAllAsync(data);
        public Task<CResult> GetCatalogosAsync(int empresa) => repo.GetCatalogosAsync(empresa);
        public Task<CResult> GetHistorialAsync(ACA_PERIODOConsulta data) => repo.GetHistorialAsync(data);
        public Task<CResult> GetOfertaAsync(ACA_PERIODOConsulta data) => repo.GetOfertaAsync(data);
        public Task<CResult> WriteAsync(int operation, ACA_PERIODOInput data, string user, string station)
        {
            string error = null;
            if (data.CORR_EMPRESA <= 0 || (operation != 1 && data.CORR_PERIODO_ACADEMICO <= 0)) error = "Seleccione la empresa y un período válido.";
            else if (operation != 3)
            {
                if (data.CORR_SEDE <= 0 || data.CORR_AREA_ACADEMICA <= 0) error = "Seleccione sede y área académica.";
                else if (data.ANIO < 1 || data.ANIO > 9999 || !data.NUMERO_PERIODO.HasValue || data.NUMERO_PERIODO < 1 || data.NUMERO_PERIODO > 255) error = "Ingrese un año entre 1 y 9999 y un número de período entre 1 y 255.";
                else if (!data.FECHA_INICIO.HasValue || !data.FECHA_FIN.HasValue || !data.FECHA_INICIO_INSCRIPCION.HasValue || !data.FECHA_FIN_INSCRIPCION.HasValue) error = "Las cuatro fechas son obligatorias.";
                else if (data.FECHA_FIN.Value.Date < data.FECHA_INICIO.Value.Date) error = "El fin académico no puede ser anterior al inicio.";
                else if (data.FECHA_FIN_INSCRIPCION.Value.Date < data.FECHA_INICIO_INSCRIPCION.Value.Date) error = "El cierre de inscripción no puede ser anterior a su apertura.";
                else if (data.FECHA_FIN_INSCRIPCION.Value.Date > data.FECHA_FIN.Value.Date) error = "El cierre de inscripción no puede ser posterior al fin académico.";
            }
            return error != null ? Task.FromResult(new CResult { ErrorCode = 51000, ErrorMessage = error }) : repo.WriteAsync(operation, data, user, station);
        }
    }
}
