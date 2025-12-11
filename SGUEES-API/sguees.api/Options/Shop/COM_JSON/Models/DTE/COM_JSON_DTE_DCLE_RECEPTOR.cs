namespace sguees.Models
{
    public class COM_JSON_DTE_DCLE_RECEPTOR
    {
       public string nit { get; set; }                          //NIT (Receptor)
        public string nrc { get; set; }                         //NRC (Receptor)
        public string nombre { get; set; }                      //Nombre, denominación o razón social del contribuyente (Receptor)
        public string codActividad { get; set; }                //Código de Actividad Económica (Receptor)
        public string descActividad { get; set; }               //Actividad Económica (Receptor)
        public string nombreComercial { get; set; }             //Nombre Comercial (Receptor)
        public string tipoEstablecimiento { get; set; }             //Tipo de Establecimiento (Receptor)
        public COM_JSON_DTE_DIRECCION direccion { get; set; }        //Dirección (Receptor)
        public string telefono { get; set; }                    //Teléfono (Receptor)
        public string correo { get; set; }                      //Correo electrónico (Receptor)
        public string codigoMH { get; set; }                //Código del establecimiento(Receptor) asignado por el MH
        public string puntoVentaMH { get; set; }             //Código del Punto de Venta (Receptor) Asignado por el MH
    }
}
