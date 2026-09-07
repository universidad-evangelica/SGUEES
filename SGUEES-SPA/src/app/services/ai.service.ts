import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AICompleteRequest {
  prompt: string;
  model?: string | null;
}

export interface AICompleteResponse {
  model: string;
  result: string;
}

@Injectable({ providedIn: 'root' })
export class AIService {
  private readonly baseUrl =
    environment.UrlSEGURIDADAPI.replace(/\/$/, '') + '/api/AI';

  constructor(private http: HttpClient) {}

  complete(req: AICompleteRequest, headerModel?: string): Observable<AICompleteResponse> {
    let headers = new HttpHeaders();
    if (headerModel && headerModel.trim().length > 0) {
      headers = headers.set('X-AI-Model', headerModel);
    }
    return this.http.post<AICompleteResponse>(`${this.baseUrl}/complete`, req, { headers });
  }
}
