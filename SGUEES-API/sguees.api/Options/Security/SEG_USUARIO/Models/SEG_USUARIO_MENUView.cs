using System.Collections.Generic;

namespace scuees.Models
{
    public class SEG_USUARIO_MENUView
    {
        public string codeSistema { get; set; }
        public string codeMenu { get; set; }
        public string code { get; set; }
        public string text { get; set; }
        public string icon { get; set; }
        public string path { get; set; }
        public bool expanded { get; set; } = true;
        public int order { get; set; }
        public List<SEG_USUARIO_MENU_OPCIONView> items { get; set; }

    }
}
