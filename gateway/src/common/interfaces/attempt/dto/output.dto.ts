export class OutputDto {
  id: string;
  email: string;
  content: string;
  status: string;

  constructor(phishing: any) {
    this.id = phishing.id;
    this.email = phishing.email;
    this.content = phishing.content;
    this.status = phishing.status;
  }
}
