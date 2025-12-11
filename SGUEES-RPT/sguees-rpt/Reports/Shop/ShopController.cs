using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.IO;
using System.Data;
using sgueesRpt.Models;
using QRCoder;
using System.Drawing;
using Newtonsoft.Json;
using sgueesRpt.Reports.Shop.COM_VL_FSEE;
using sgueesRpt.Reports.Shop.COM_SOLI_COTIZACION;
using sgueesRpt.Reports.Shop.COM_CUADRO_COMPARATIVO;
using sgueesRpt.Reports.Shop.COM_ORDEN_COMPRA;

namespace sgueesRpt.Controllers
{
    [Authorize]
    public class ShopController : ApiController
    {
        
        public IHttpActionResult PostVL_FSEE([FromBody] List<COM_VL_FSEEView> data)
        {
            try
            {
                using (COM_VL_FSEEReport xRpt = new COM_VL_FSEEReport())
                {
                    MemoryStream stream = new MemoryStream();

                    foreach (var item in data)
                    {
                        QRCodeGenerator qrGenerator = new QRCodeGenerator();
                        QRCodeData qrCodeData = qrGenerator.CreateQrCode(item.URL_CONSULTA, QRCodeGenerator.ECCLevel.Q);
                        QRCode qrCode = new QRCode(qrCodeData);
                        Bitmap qrCodeImage = qrCode.GetGraphic(20);
                        item.QR_CONSULTA = Utils.BitmapToBytes(qrCodeImage);
                    }

                    xRpt.SetDataSource(data);
                    xRpt.ExportToStream(CrystalDecisions.Shared.ExportFormatType.PortableDocFormat).CopyTo(stream);
                    stream.Seek(0, System.IO.SeekOrigin.Begin);

                    return new eDocResult(stream, Request, "VL_FSEE.pdf");
                }
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        public IHttpActionResult PostCuerpoCorreoPDFJSON([FromBody] COM_CORREO_PDFJSONView data)
        {
            string _MENSAJE = "";
            _MENSAJE += "<!DOCTYPE html>";
            _MENSAJE += "<html lang=\"es\">";
            _MENSAJE += "<head>";
            _MENSAJE += "<meta charset=\"UTF-8\">";
            _MENSAJE += " <meta name=\"viewport\" content =\"width=device-width, initial-scale = 1.0\"> ";
            _MENSAJE += "<title>Formato de Correo</title>";
            _MENSAJE += "<style>";
            _MENSAJE += "body {";
            _MENSAJE += "   font-family: Arial, sans-serif;";
            _MENSAJE += "   margin: 0; padding: 0; ";
            _MENSAJE += "} ";
            _MENSAJE += ".encabezado { text-align: center; padding: 20px; background-color: #034ea2; /* Fondo amarillo */ color: white; /* Letra blanca */} ";
            _MENSAJE += ".encabezado img { text-align: right; max-width: 150px; height: auto;} ";
            _MENSAJE += ".separador { border-top: 1px solid #ccc; margin: 20px 0; } ";
            _MENSAJE += ".mensaje { text-align: center; margin-top: 1px0px; padding: 20px; background-color: #ccc;} ";
            _MENSAJE += ".pie-de-pagina { margin-top: 20px; padding: 5px; background-color:#034ea2; /* Fondo gris */ color: white; /* Letra blanca */ text-align: center;}";
            _MENSAJE += "</style>";
            _MENSAJE += "</head>";
            _MENSAJE += "<body>";
            _MENSAJE += "<div class=\"encabezado\">";
            _MENSAJE += "<p><strong>Documento Tributario Electrónico</strong></p>";
            _MENSAJE += "</div>";
            _MENSAJE += "<div class=\"separador\"></div>";
            _MENSAJE += "<div class=\"mensaje\">";
            _MENSAJE += "<p><strong>Estimado (a) cliente:</strong></p>";
            _MENSAJE += "<p>" + data.NOMBRE_REC + "</p>";
            _MENSAJE += "<p>Por este medio compartimos su factura <strong>" + data.CODIGO_GENERACION + "</strong></p>";
            _MENSAJE += "<p>Emitida el <strong>" + data.FECHA_GENERACION.ToString("dd/MM/yyyy") + "</strong></p>";
            _MENSAJE += "</div>";
            _MENSAJE += "<div class=\"pie-de-pagina\">";
            _MENSAJE += "<p><strong>"+data.NOMBRE_EMPRESA+"</strong></p>";
            _MENSAJE += "<p>Copyright © Todos los derechos reservados. Dirección: "+data.DIRECCION_EMPRESA+"<p>";
            _MENSAJE += "<p>Conmutador: " + data.TELEFONO_EMPRESA +"<p>";
            _MENSAJE += "<p>Sitio web: <a href=\""+data.URL_WEB_EMPRESA+"\" class=\"sitio-web\">"+data.NOMBRE_EMPRESA+"</a></p>";
            _MENSAJE += "</div>";
            _MENSAJE += "</body>";
            _MENSAJE += "</html>";

            return Ok(_MENSAJE);
        }

        public IHttpActionResult PostComSoliCotizacionImpr([FromBody] List<COM_SOLI_COTIZACION_IMPRView> data)
        {
            try
            {
                using (COM_SOLI_COTIZACIONReport xRpt = new COM_SOLI_COTIZACIONReport())
                {
                    MemoryStream stream = new MemoryStream();

                    xRpt.SetDataSource(data);
                    xRpt.ExportToStream(CrystalDecisions.Shared.ExportFormatType.PortableDocFormat).CopyTo(stream);
                    stream.Seek(0, System.IO.SeekOrigin.Begin);

                    return new eDocResult(stream, Request, "COM_SOLI_COTIZACION.pdf");
                }
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
        public IHttpActionResult PostComCuadroComparativoImpr([FromBody] List<COM_CUADRO_COMPARATIVO_IMPRView> data)
        {
            try
            {
                using (COM_CUADRO_COMPARATIVOReport xRpt = new COM_CUADRO_COMPARATIVOReport())
                {
                    MemoryStream stream = new MemoryStream();

                    xRpt.SetDataSource(data);
                    xRpt.Subreports["COM_CUADRO_COMPARATIVO_TOTALReport.rpt"].SetDataSource(data[0].TOTAL_PROVEEDORES);
                    xRpt.ExportToStream(CrystalDecisions.Shared.ExportFormatType.PortableDocFormat).CopyTo(stream);
                    stream.Seek(0, System.IO.SeekOrigin.Begin);

                    return new eDocResult(stream, Request, "COM_CUADRO_COMPARATIVO.pdf");
                }
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
        public IHttpActionResult PostComCuadroComparativoOrdenCompraImpr([FromBody] List<COM_ORDEN_COMPRA_IMPRView> data)
        {
            try
            {
                using (COM_ORDEN_COMPRAReport xRpt = new COM_ORDEN_COMPRAReport())
                {
                    MemoryStream stream = new MemoryStream();

                    xRpt.SetDataSource(data);
                    xRpt.ExportToStream(CrystalDecisions.Shared.ExportFormatType.PortableDocFormat).CopyTo(stream);
                    stream.Seek(0, System.IO.SeekOrigin.Begin);

                    return new eDocResult(stream, Request, "COM_ORDEN_COMPRA.pdf");
                }
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}
