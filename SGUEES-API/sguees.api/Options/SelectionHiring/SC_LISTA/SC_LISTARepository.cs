using System.Collections.Generic;
using eFramework.Core;
using Microsoft.Extensions.Configuration;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public class SC_LISTARepository : ISC_LISTARepository
    {
        public SC_LISTARepository(IConfiguration config)
        {
        }

        public CResult GetNIVEL_DOMINIO()
        {
            return Ok(new List<SC_LISTAView>
            {
                new() { Key = "BASICO", Value = "Basico" },
                new() { Key = "INTERMEDIO", Value = "Intermedio" },
                new() { Key = "AVANZADO", Value = "Avanzado" },
            });
        }

        public CResult GetSEXO()
        {
            return Ok(new List<SC_LISTAView>
            {
                new() { Key = "INDIFERENTE", Value = "Indiferente" },
                new() { Key = "MASCULINO", Value = "Masculino" },
                new() { Key = "FEMENINO", Value = "Femenino" },
            });
        }

        public CResult GetESTADO_FAMILIAR()
        {
            return Ok(new List<SC_LISTAView>
            {
                new() { Key = "INDIFERENTE", Value = "Indiferente" },
                new() { Key = "SOLTERO", Value = "Soltero(a)" },
                new() { Key = "CASADO", Value = "Casado(a)" },
                new() { Key = "OTRO", Value = "Otro" },
            });
        }

        public CResult GetLICENCIA()
        {
            return Ok(new List<SC_LISTAView>
            {
                new() { Key = false, Value = "No" },
                new() { Key = true, Value = "Si" },
            });
        }

        public CResult GetTIPO_REQUERIDO()
        {
            return Ok(new List<SC_LISTAView>
            {
                new() { Key = "SI", Value = "Si" },
                new() { Key = "NO", Value = "No" },
                new() { Key = "DESEABLE", Value = "Deseable" },
            });
        }

        public CResult GetFORMATO()
        {
            return Ok(new List<SC_LISTAView>
            {
                new() { Key = "CORTO", Value = "Version corta" },
                new() { Key = "EXTENSO", Value = "Version extensa" },
            });
        }

        public CResult GetNIVEL()
        {
            return Ok(new List<SC_LISTAView>
            {
                new() { Key = "NIV1", Value = "Nivel 1" },
                new() { Key = "NIV2", Value = "Nivel 2" },
                new() { Key = "NIV3", Value = "Nivel 3" },
            });
        }

        private static CResult Ok(List<SC_LISTAView> data)
        {
            return new CResult
            {
                Data = data,
                Result = true,
                RowsAffected = data.Count,
                CodeHelper = 0,
                ErrorCode = 0,
                ErrorMessage = "",
                ErrorSource = "",
            };
        }
    }
}
