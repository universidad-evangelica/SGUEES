namespace sguees.Models
{
    public class SEG_USUARIOParam
    {
        public int TIPO_CONSULTA { get; set; }
        public int CORR_SUSCRIPCION { get; set; }
		public int CORR_CONFI_PAIS { get; set; }
	    public string LOGIN_SISTEMA { get; set; }
	    public int OPCION_CONSULTA { get; set; } = 0;
    }
}
