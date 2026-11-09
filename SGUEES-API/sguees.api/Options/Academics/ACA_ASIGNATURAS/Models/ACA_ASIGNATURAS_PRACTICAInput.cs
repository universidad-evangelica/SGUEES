namespace sguees.Models
{
    public class ACA_ASIGNATURAS_PRACTICAInput
    {
        public int CORR_FACULTAD { get; set; }
        public int CORR_CARRERA { get; set; }
        public int CORR_TIPO_PRACTICA { get; set; }
        public byte[] VERSION_TIPO { get; set; }
        public bool CONFIRMAR_REEMPLAZOS { get; set; }
        public List<ACA_ASIGNATURAS_PRACTICAItem> ASIGNATURAS { get; set; }
    }
    public class ACA_ASIGNATURAS_PRACTICAItem
    {
        public int CORR_ASIGNATURA { get; set; }
        public byte[] VERSION { get; set; }
    }
    public class ACA_ASIGNATURAS_PRACTICAView
    {
        public int CORR_ASIGNATURA { get; set; }
        public int CORR_CARRERA { get; set; }
        public string CODIGO_ASIGNATURA { get; set; }
        public string NOMBRE_ASIGNATURA { get; set; }
        public int? CORR_TIPO_PRACTICA { get; set; }
        public string NOMBRE_TIPO_PRACTICA { get; set; }
        public bool ACTIVO { get; set; }
        public bool EN_USO { get; set; }
        public byte[] VERSION { get; set; }
    }
}
