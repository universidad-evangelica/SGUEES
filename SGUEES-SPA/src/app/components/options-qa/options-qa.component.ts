import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface OptionsQAFinding {
  severity: 'info' | 'warning' | 'error';
  key: string;
  message: string;
  suggestion?: string;
}

@Component({
  selector: 'app-options-qa',
  templateUrl: './options-qa.component.html',
  styleUrls: ['./options-qa.component.css']
})
export class OptionsQaComponent {
  findings: OptionsQAFinding[] = [];
  loading = false;
  error?: string;

  constructor(private http: HttpClient) {}

  runQA() {
    this.loading = true;
    this.error = undefined;
    this.http.post<OptionsQAFinding[]>('/api/qa/options', {})
      .subscribe({
        next: (res) => { this.findings = res; this.loading = false; },
        error: (err) => { this.error = err.message || 'Error desconocido'; this.loading = false; }
      });
  }
}
