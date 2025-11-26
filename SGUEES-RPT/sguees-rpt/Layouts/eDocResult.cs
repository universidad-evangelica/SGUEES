using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace scueesRpt.Controllers
{
    public class eDocResult : IHttpActionResult
    {
        Stream bookStuff;
        string PdfFileName;
        string PdfTipoDisposition;
        HttpRequestMessage httpRequestMessage;
        HttpResponseMessage httpResponseMessage;
        public eDocResult(Stream data, HttpRequestMessage request, string filename, string tipoDisposition = "inline")
        {
            bookStuff = data;
            httpRequestMessage = request;
            PdfFileName = filename;
            PdfTipoDisposition = tipoDisposition;

            request.RegisterForDispose(data);
        }

        public System.Threading.Tasks.Task<HttpResponseMessage> ExecuteAsync(System.Threading.CancellationToken cancellationToken)
        {
            httpResponseMessage = httpRequestMessage.CreateResponse(HttpStatusCode.OK);
            httpResponseMessage.Content = new StreamContent(bookStuff);
            httpResponseMessage.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue(PdfTipoDisposition);
            httpResponseMessage.Content.Headers.ContentDisposition.FileName = PdfFileName;
            httpResponseMessage.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");

            return System.Threading.Tasks.Task.FromResult(httpResponseMessage);
        }
    }
}
