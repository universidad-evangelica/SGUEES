namespace sguees.Models
{
    public class COM_JSON_DTE_EXTENSION
    {
        public string nombEntrega { get; set; }                 //Nombre del responsable que Genera el DTE
        public string docuEntrega { get; set; }                 //Documento de identificación de quien genera el DTE
        public string nombRecibe { get; set; }                  //Nombre del responsable de la operación por parte del receptor
        public string docuRecibe { get; set; }                  //Documento de identificación del responsable de la operación por parte del receptor
        public string observaciones { get; set; }               //Observaciones
        public string placaVehiculo { get; set; }               //Placa de vehículo
    }
}
