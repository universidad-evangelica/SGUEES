using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    // Qué hace: catálogo de limitaciones físicas que consumen otras pantallas.
    // Cómo lo hace: hoy solo expone el combo de la edición de prospectos (GetCORR_LIMITACION_FISICA_ACA_PROSPECTO);
    //               el resto del CRUD queda sin habilitar hasta que exista una pantalla propia.
    public class GEN_LIMITACIONES_FISICARepository : BaseRepository<GEN_LIMITACIONES_FISICATable>, IGEN_LIMITACIONES_FISICARepository
    {
        private const string _TableName = "GEN_LIMITACIONES_FISICA";

        public GEN_LIMITACIONES_FISICARepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: limitaciones físicas ordenados para el combo.
        // Cómo lo hace: lee la tabla directamente (no tiene vista V_) ordenada por NOMBRE.
        public async Task<CResult> GetCORR_LIMITACION_FISICA_ACA_PROSPECTOAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_TableName, xWhere, "NOMBRE");
                var response = new List<GEN_LIMITACIONES_FISICAView>().FromDataReader(reader).ToList();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response.Count;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (System.Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = -1;
                objResultado.ErrorMessage = e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        // Qué hace: consulta general y CRUD aún no habilitados.
        // Cómo lo hace: IRepository exige los métodos; responden un error claro hasta que
        //               exista una pantalla propia del catálogo.
        public Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> CreateAsync(GEN_LIMITACIONES_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> UpdateAsync(GEN_LIMITACIONES_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> DeleteAsync(GEN_LIMITACIONES_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        private static CResult OperacionNoHabilitada()
        {
            return new CResult()
            {
                Data = null,
                Result = false,
                RowsAffected = 0,
                CodeHelper = 0,
                ErrorCode = -1,
                ErrorMessage = $"Operación no habilitada: {_TableName} solo expone GetCORR_LIMITACION_FISICA_ACA_PROSPECTO.",
                ErrorSource = ""
            };
        }
    }
}
