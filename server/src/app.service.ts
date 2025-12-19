import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createWorker } from 'tesseract.js';

export interface Documento {
  id: string;
  filename: string;
  extractedText: string;
  createdAt: Date;
  userId: string;
}

@Injectable()
export class AppService {
  private documents: Documento[] = [];
  
  private genAI: GoogleGenerativeAI;

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBUiszi9keDlPuhzh_EhkZ8EjTxBGLsMjg';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async login(email: string) {
    return { id: 'user-123', email: email };
  }

  async uploadAndProcess(file: Express.Multer.File, userId: string) {
    if (!file) throw new Error('Arquivo não enviado');
    
    console.log('Iniciando OCR com Tesseract...');
    const worker = await createWorker('por');
    
    const source = file.path ? file.path : file.buffer;
    const { data: { text } } = await worker.recognize(source);
    
    await worker.terminate();
    console.log('OCR concluído.');

    const doc: Documento = {
      id: crypto.randomUUID(),
      filename: file.originalname,
      extractedText: text,
      createdAt: new Date(),
      userId: userId,
    };

    this.documents.push(doc);
    return doc;
  }

  async getDocuments(userId: string) {
    return this.documents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async askLLM(documentId: string, question: string) {
    try {
      const doc = this.documents.find((d) => d.id === documentId);
      
      if (!doc) {
        return { answer: 'Documento não encontrado. Faça o upload novamente.' };
      }

      const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const cleanText = doc.extractedText.replace(/\n\s*\n/g, '\n');

      const prompt = `
        Você é um assistente financeiro inteligente.
        Use o contexto abaixo (extraído de um documento) para responder à pergunta.
        
        CONTEXTO:
        ${cleanText}
        
        PERGUNTA DO USUÁRIO:
        ${question}
      `;

      console.log('Enviando pergunta para o Gemini 2.5 Flash...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return { answer: text };

    } catch (error: any) {
      console.error('ERRO NO GEMINI:', error);
      return { answer: `Não foi possível obter a resposta. Erro: ${error.message}` };
    }
  }
}