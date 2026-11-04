using System.Collections.Generic;
using eFramework.Core;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
	// Qué hace: listas fijas de Académico alineadas a los valores que ya guarda el prospecto.
	// Cómo lo hace: Key = valor persistido; Value = texto del combo (patrón SC_LISTA).
	public class ACA_LISTARepository : IACA_LISTARepository
	{
		public ACA_LISTARepository(IConfiguration config)
		{
		}

		// Qué hace: formas de ingreso de ACA_PROSPECTO.FORMA_INGRESO.
		// Cómo lo hace: NI, EQ, CC, RI (las mismas que valida el API de prospecto).
		public CResult GetFORMA_INGRESO()
		{
			return Ok(new List<ACA_LISTAView>
			{
				new() { Key = "NI", Value = "Nuevo Ingreso" },
				new() { Key = "EQ", Value = "Ingreso por Equivalencia" },
				new() { Key = "CC", Value = "Cambio de Carrera" },
				new() { Key = "RI", Value = "Reingreso" },
			});
		}

		// Qué hace: tipo de educación media (ACA_PROSPECTO_ESTUDIO.TIPO_EDUCACION).
		// Cómo lo hace: mismos textos que usaba el portal y la pantalla.
		public CResult GetTIPO_EDUCACION()
		{
			return Ok(new List<ACA_LISTAView>
			{
				new() { Key = "Pública", Value = "Pública" },
				new() { Key = "Privada", Value = "Privada" },
			});
		}

		// Qué hace: tipo de contacto del formulario (Teléfono / Correo).
		// Cómo lo hace: Key = TELEFONO|CORREO; el SPA traduce a bits ES_TELEFONO / ES_CORREO.
		public CResult GetTIPO_CONTACTO()
		{
			return Ok(new List<ACA_LISTAView>
			{
				new() { Key = "TELEFONO", Value = "Teléfono" },
				new() { Key = "CORREO", Value = "Correo" },
			});
		}

		private static CResult Ok(List<ACA_LISTAView> data)
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
