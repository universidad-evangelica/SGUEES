namespace eFramework.Core
{
    public class MailSetting
    {
        public string Host { get; set; } = "";
        public int Port { get; set; } = 465;
        public bool UseSSL { get; set; } = true;
        public string User { get; set; } = "";
        public string Password { get; set; } = "";
        public string FromName { get; set; } = "";
        public string FromAddress { get; set; } = "";
        public string BodyType { get; set; } = "html";
    }
}
