namespace sguees.Models
{
    public class SEG_USUARIO_EXPIRACION_CLAVEView
    {
        public string LOGIN_SISTEMA { get; set; }
        public bool REQUIERE_CAMBIO_CLAVE { get; set; }
        public DateTime? FECHA_ULTIMO_CAMBIO { get; set; }
        public DateTime? FECHA_EXPIRACION { get; set; }
        public int? DIAS_PARA_EXPIRAR { get; set; }
        public int MESES_VIGENCIA { get; set; }
        public string MENSAJE { get; set; }
    }
}
