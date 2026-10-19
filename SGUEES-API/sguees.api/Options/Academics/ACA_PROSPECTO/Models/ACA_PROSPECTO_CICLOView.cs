namespace sguees.Models
{
    // Qué hace: ciclo al que se puede mover un prospecto (combo "Ciclo" del encabezado).
    // Cómo lo hace: CICLO es la llave que ve el usuario ("2027-01"); año y número viajan al guardar.
    public class ACA_PROSPECTO_CICLOView
    {
        public string CICLO { get; set; }
        public short ANIO { get; set; }
        public byte NUMERO_PERIODO { get; set; }
    }
}
