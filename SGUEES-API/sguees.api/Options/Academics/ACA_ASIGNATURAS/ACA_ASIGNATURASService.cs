using System.Text.RegularExpressions;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_ASIGNATURASService : IACA_ASIGNATURASService
    {
        private readonly IACA_ASIGNATURASRepository repository;
        public ACA_ASIGNATURASService(IACA_ASIGNATURASRepository repository) { this.repository = repository; }
        private static CResult Error(string message) => new() { Result = false, ErrorCode = 51000, ErrorMessage = message };

        public Task<CResult> GetAllAsync(ACA_ASIGNATURASParam data) => data.CORR_EMPRESA > 0 && data.CORR_ASIGNATURA >= 0
            ? repository.GetAllAsync(data) : Task.FromResult(Error("Empresa o identificador inválido."));

        public Task<CResult> GuardarAsync(ACA_ASIGNATURASTable data, bool update, string user, string station)
        {
            if (data == null || data.CORR_EMPRESA <= 0 || string.IsNullOrWhiteSpace(user) || (update ? data.CORR_ASIGNATURA <= 0 : data.CORR_ASIGNATURA != 0))
                return Task.FromResult(Error("Empresa, usuario o identificador inválido."));
            if (update && (data.VERSION == null || data.VERSION.Length != 8)) return Task.FromResult(Error("Actualice la lista para obtener la versión del registro."));

            data.CODIGO_ASIGNATURA = data.CODIGO_ASIGNATURA?.Trim().ToUpperInvariant();
            data.NOMBRE_ASIGNATURA = data.NOMBRE_ASIGNATURA?.Trim();
            data.ALIAS = string.IsNullOrWhiteSpace(data.ALIAS) ? null : data.ALIAS.Trim();
            if (!Regex.IsMatch(data.CODIGO_ASIGNATURA ?? "", @"^[A-Z0-9_-]{1,30}$")) return Task.FromResult(Error("Código obligatorio: máximo 30 caracteres, letras, números, guion o guion bajo; sin espacios."));
            if (string.IsNullOrWhiteSpace(data.NOMBRE_ASIGNATURA) || data.NOMBRE_ASIGNATURA.Length > 250 || data.ALIAS?.Length > 60)
                return Task.FromResult(Error("Nombre obligatorio hasta 250 caracteres y alias hasta 60."));
            if (data.CORR_CARRERA <= 0 || data.CORR_PERIODO_CURSO <= 0 || data.FECHA_APERTURA == null || data.FECHA_APERTURA.Value == DateTime.MinValue
                || !data.UNIDADES_VALORATIVAS.HasValue || data.UNIDADES_VALORATIVAS < 0 || data.UNIDADES_VALORATIVAS > 9999.99m
                || decimal.Round(data.UNIDADES_VALORATIVAS.Value, 2) != data.UNIDADES_VALORATIVAS.Value)
                return Task.FromResult(Error("Seleccione carrera, período y fecha; ingrese UV entre 0 y 9999.99 con máximo dos decimales."));

            if (data.CORR_TIPO_PRACTICA.HasValue && data.CORR_TIPO_PRACTICA <= 0) return Task.FromResult(Error("Seleccione un tipo de práctica válido o deje No aplica."));
            return repository.GuardarAsync(data, user, station);
        }

        public Task<CResult> Carreras(int empresa) => empresa > 0 ? repository.Carreras(empresa) : Task.FromResult(Error("Empresa de sesión requerida."));
        public Task<CResult> MateriasPractica(int empresa, int facultad, int carrera) => empresa > 0 && facultad > 0 && carrera > 0
            ? repository.MateriasPractica(empresa, facultad, carrera) : Task.FromResult(Error("Seleccione facultad y carrera."));
        public Task<CResult> AsignarPractica(int empresa, ACA_ASIGNATURAS_PRACTICAInput data, string user, string station)
        {
            if (empresa <= 0 || string.IsNullOrWhiteSpace(user) || data == null || data.CORR_FACULTAD <= 0 || data.CORR_CARRERA <= 0 || data.CORR_TIPO_PRACTICA <= 0
                || data.VERSION_TIPO?.Length != 8 || data.ASIGNATURAS == null || data.ASIGNATURAS.Count is < 1 or > 500
                || data.ASIGNATURAS.Any(a => a == null || a.CORR_ASIGNATURA <= 0 || a.VERSION?.Length != 8)
                || data.ASIGNATURAS.Select(a => a.CORR_ASIGNATURA).Distinct().Count() != data.ASIGNATURAS.Count)
                return Task.FromResult(Error("Seleccione facultad, carrera, tipo y entre 1 y 500 materias diferentes; actualice sus versiones antes de guardar."));
            return repository.AsignarPractica(empresa, data, user, station);
        }
        public Task<CResult> Planes(int empresa, int asignatura) => empresa > 0 && asignatura > 0 ? repository.Planes(empresa, asignatura) : Task.FromResult(Error("Empresa y asignatura requeridas."));
        public Task<CResult> GuardarPlan(int empresa, ACA_ASIGNATURAS_PLANInput data, string user, string station)
        {
            if (empresa <= 0 || string.IsNullOrWhiteSpace(user) || data == null || data.CORR_ASIGNATURA <= 0 || data.CORR_PLAN_ACADEMICO <= 0
                || (data.VERSION != null && data.VERSION.Length != 8))
                return Task.FromResult(Error("Revise la asignatura, el plan y la versión de la asociación."));
            return repository.GuardarPlan(empresa, data, user, station);
        }

    }
}
