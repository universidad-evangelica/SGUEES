using System.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    public partial class ACA_PROSPECTO_BECARepository
    {
        public Task<CResult> GetOpcionesAsync(List<CParameter> parameters)
            => LeerAsync<ACA_PROSPECTO_BECA_OPCIONView>("V_ACA_PROSPECTO_BECA_OPCION_EDICION", parameters, "ORDEN,CORR_OPCION_BECA");

        public async Task<CResult> GuardarRespuestaAsync(List<CParameter> parameters)
        {
            try
            {
                using var reader = await objData.GetDataReader(CommandType.StoredProcedure, "PRAL_MTTO_ACA_PROSPECTO_BECA_RESPUESTA", parameters);
                var result = new List<ACA_PROSPECTO_BECA_TOTALESView>().FromDataReader(reader).SingleOrDefault();
                return new CResult { Result = result != null, Data = result, RowsAffected = result == null ? 0 : 1, ErrorMessage = result == null ? "No se obtuvo el resultado de la edición." : "Respuesta actualizada" };
            }
            catch (Exception ex) { return new CResult { ErrorCode = -1, ErrorMessage = ex.Message }; }
            finally { objData.objConnection.Close(); }
        }

    }
}
