namespace eFrameworkAPI.Core
{
    public enum UpdateType
    {
        /// <summary>
        /// Bandera que indica que se esta adicionando
        /// </summary>
        Add = 1,
        /// <summary>
        /// Bandera que indica que se esta actualizando
        /// </summary>
        Update = 2,
        /// <summary>
        /// Bandera que indica que se esta eliminando
        /// </summary>
        Delete = 3,
        /// <summary>
        /// Bandera que indica que se esta consultando los registros a la base de datos
        /// </summary>
        Browse = 4,
        /// <summary>
        /// Bandera que indica que no se a definido la acción
        /// </summary>
        Not_Defined
    };
}
