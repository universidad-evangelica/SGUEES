namespace sguees.Models
{
    public class COM_JSON_DTE_FE_RECEPTOR
    {
        public string tipoDocumento { get; set; }
        public string numDocumento { get; set; }
        public string nrc { get; set; }                         //NRC (Receptor)
        public string nombre { get; set; }                      //Nombre, denominación o razón social del contribuyente (Receptor)
        public string codActividad { get; set; }                //Código de Actividad Económica (Receptor)
        public string descActividad { get; set; }               //Actividad Económica (Receptor)
        public COM_JSON_DTE_DIRECCION direccion { get; set; }        //Dirección (Receptor)
        public string telefono { get; set; }                    //Teléfono (Receptor)
        public string correo { get; set; }                      //Correo electrónico (Receptor)
    }
}
