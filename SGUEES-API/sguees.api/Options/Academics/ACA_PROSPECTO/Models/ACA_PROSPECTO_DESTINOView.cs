namespace sguees.Models
{
    // Qué hace: plan académico y período que le corresponden a una carrera y modalidad en el ciclo
    //           del prospecto, al cambiar de carrera.
    // Cómo lo hace: los dos vienen en 0 si no existen, para distinguir cuál de los dos falta.
    public class ACA_PROSPECTO_DESTINOView
    {
        public int CORR_PLAN_ACADEMICO { get; set; }
        public int CORR_PERIODO_ACADEMICO { get; set; }
    }
}
