import { Component } from '@angular/core';
import { AIService, AICompleteResponse } from '../../services/ai.service';

@Component({
  selector: 'app-ai-demo',
  templateUrl: './ai-demo.component.html',
  styleUrls: ['./ai-demo.component.css']
})
export class AiDemoComponent {
  prompt = '';
  modelHeader = ''; // opcional, se envía como X-AI-Model
  modelBody: string | null = null; // opcional, se envía en body
  loading = false;
  response: AICompleteResponse | null = null;
  error: string | null = null;

  constructor(private ai: AIService) {}

  send() {
    this.loading = true;
    this.error = null;
    this.response = null;
    this.ai.complete({ prompt: this.prompt, model: this.modelBody }, this.modelHeader)
      .subscribe({
        next: (res) => { this.response = res; this.loading = false; },
        error: (err) => { this.error = (err?.error?.message) || 'Error al llamar IA'; this.loading = false; }
      });
  }
}
