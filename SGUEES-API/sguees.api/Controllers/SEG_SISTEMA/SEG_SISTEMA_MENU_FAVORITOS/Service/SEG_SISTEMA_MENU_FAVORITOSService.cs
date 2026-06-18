using sguees.api.Controllers.SEG_SISTEMA.SEG_SISTEMA_MENU_FAVORITOS.DTOs;
using Microsoft.Data.SqlClient;

namespace sguees.api.Controllers.SEG_SISTEMA.SEG_SISTEMA_MENU_FAVORITOS.Service
{
    public class SEG_SISTEMA_MENU_FAVORITOSService
    {
        private readonly string _connectionString;

        public SEG_SISTEMA_MENU_FAVORITOSService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        //Endpoint Post para alternar el estado de favorito de un menú
        public async Task<ToggleFavoriteResponse> ToggleFavoriteAsync(
            ToggleFavoriteRequest request)
        {
            using var connection = new SqlConnection(_connectionString);

            using var command = new SqlCommand("PRAL_MTTO_SEG_MENU_FAVORITOS_TOGGLE", connection);
            command.CommandType = System.Data.CommandType.StoredProcedure;

            //Listado de parametros
            command.Parameters.AddWithValue("@CORR_EMPRESA", request.CORR_EMPRESA);
            command.Parameters.AddWithValue("@USUARIO", request.USUARIO);
            command.Parameters.AddWithValue("@PERMISSION_KEY", request.PERMISSION_KEY);
            command.Parameters.AddWithValue("@MODULE_NAME", request.MODULE_NAME);
            command.Parameters.AddWithValue("@ROUTE", request.ROUTE);

            await connection.OpenAsync();

            using var reader = await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
            {
                throw new Exception("No se pudo obtener la respuesta del procedimiento almacenado.");
            }

            return new ToggleFavoriteResponse
            {
                IS_FAVORITE = Convert.ToBoolean(reader["IS_FAVORITE"]),
                MESSAGE = reader["MESSAGE"].ToString()
            };
        }

        //Endpoint Get para obtener la lista de favoritos de un usuario
        public async Task<List<GetFavoriteResponse>> GetFavoritesAsync(GetFavoriteRequest request)
        {
            var favorites = new List<GetFavoriteResponse>();
            using var connection = new SqlConnection(_connectionString); //abrimos la conexion a la base de datos
            using var command = new SqlCommand("PRAL_DATA_SEG_MENU_FAVORITOS_GET", connection); //creamos el comando para ejecutar el procedimiento almacenado
            
            command.CommandType = System.Data.CommandType.StoredProcedure; //indicamos que el comando es un procedimiento almacenado

            //Listado de parametros
            command.Parameters.AddWithValue("@CORR_EMPRESA", request.CORR_EMPRESA);
            command.Parameters.AddWithValue("@USUARIO", request.USUARIO);

            await connection.OpenAsync(); //abrimos la conexion de manera asincrona

            using var reader = await command.ExecuteReaderAsync(); //ejecutamos el comando y obtenemos un reader para leer los resultados

            while (await reader.ReadAsync()) //leemos cada fila del resultado
            {
                favorites.Add(new GetFavoriteResponse
                {
                    CORR_FAVORITO_ID = Convert.ToInt64(reader["CORR_FAVORITO_ID"]),
                    PERMISSION_KEY = reader["PERMISSION_KEY"].ToString(),
                    MODULE_NAME = reader["MODULE_NAME"].ToString(),
                    ROUTE = reader["ROUTE"].ToString(),
                    DISPLAY_ORDER = Convert.ToInt32(reader["DISPLAY_ORDER"])
                });
            }

            return favorites; //devolvemos la lista de favoritos
        }

    }
}
