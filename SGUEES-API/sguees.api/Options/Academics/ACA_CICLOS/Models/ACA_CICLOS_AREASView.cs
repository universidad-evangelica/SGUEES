using System;

namespace sguees.Models
{
    public class ACA_CICLOS_AREASView
    {
        public int CORR_AREA_ACADEMICA { get; set; }
        public string NOMBRE_AREA { get; set; }
        public bool ACTIVO { get; set; }
        public int? CICLOS_DEFINIDOS { get; set; }
        public int? CICLOS_HABILITADOS { get; set; }
    }
}
