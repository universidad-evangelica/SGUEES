namespace sguees.Models
{
    public class SEG_USUARIO_CLAVE_HISTORIALView
    {
        public string LOGIN_SISTEMA { get; set; }
        public byte[] CLAVE_USUARIO { get; set; }
        public byte[] CLAVE_USUARIO_SAL { get; set; }
        public DateTime FECHA_CAMBIO { get; set; }
    }
}
