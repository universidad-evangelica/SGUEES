namespace sguees.Models
{
    public class SEG_TIPIO_USUARIO_PERMISOView
    {
        public string CODIGO_SISTEMA { get; set; }
        public string NOMBRE_SISTEMA { get; set; }
        public string IMAGEN_SISTEMA { get; set; }
        public string CODIGO_MENU { get; set; }
        public string NOMBRE_MENU { get; set; }
        public string IMAGEN_MENU { get; set; }
        public string CODIGO_OPCION { get; set; }
        public string NOMBRE_OPCION { get; set; }
        public string IMAGEN_OPCION { get; set; }
        public string URL_OPCION { get; set; }
        public bool NUEVO { get; set; }
        public bool MODIFICAR { get; set; }
        public bool ELIMINAR { get; set; }
        public bool IMPRIMIR { get; set; }
        public string PERMISO { get; set; }
        public int ORDEN_SISTEMA { get; set; }
        public int ORDEN_MENU { get; set; }
        public int ORDEN_OPCION { get; set; }
    }
}
