namespace sguees.Models
{
    public class SC_PERSONA_DATOSView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PERSONA_DATOS { get; set; }
        public string NOMBRE1 { get; set; }
        public string NOMBRE2 { get; set; }
        public string APELLIDO1 { get; set; }
        public string APELLIDO2 { get; set; }
        public DateOnly FECHA_NACIMIENTO { get; set; }
        public int EDAD { get; set; }
        public string ESTADO_CIVIL { get; set; }
        public string NACIONALIDAD { get; set; }
        public string CORREO { get; set; }
        public string CELULAR { get; set; }
        public string TELEFONO { get; set; }
        public string DIRECCION { get; set; }
        public string DUI { get; set; }
        public string PASAPORTE { get; set; }
        public string ISSS { get; set; }
        public string AFP { get; set; }
        public string NOMBRE_AFP { get; set; }
        public string LICENCIA { get; set; }
        public string PLAZA_SOLICITADA { get; set; }
        public int PRETENSION_SALARIAL { get; set; }
        public string DISPONIBILIDAD { get; set; }
        public string RELIGION { get; set; }
        public string IGLESIA { get; set; }
        public string DIRECCION_IGLESIA { get; set; }
        public bool ES_CONTRIBUYENTE_CCF { get; set; }
        public bool ES_JUBILADO { get; set; }
        public bool POSEE_DISCAPACIDAD { get; set; }
        public string TIPO_DISCAPACIDAD { get; set; }
        public string EMERGENCIA_NOMBRE { get; set; }
        public string EMERGENCIA_PARENTESCO { get; set; }
        public string EMERGENCIA_TELEFONO { get; set; }
        public bool TIENE_FAMILIARES_UEES { get; set; }
        public bool DECLARA_VERDAD { get; set; }
        public bool AUTORIZA_VERIFICACION { get; set; }
        public DateTime FECHA_DECLARACION { get; set; }
        public string FIRMA_ELECTRONICA { get; set; }
    }
}
