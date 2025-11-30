import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LibraryService } from '../../services/library.service';
import { Libro } from '../../models/libro.model';
import { Nl2brPipe } from '../../pipes/nl2br.pipe';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Nl2brPipe],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: Message[] = [
    {
      role: 'assistant',
      content: '¡Hola! 👋 Soy BiblioBot, tu asistente de SmartLibrary.\n\nPuedo ayudarte con:\n📚 Buscar libros por tema, autor o categoría\n⏰ Consultar horarios y políticas\n💡 Recomendaciones personalizadas\n\n¿En qué puedo ayudarte?',
      timestamp: new Date()
    }
  ];

  input: string = '';
  isLoading: boolean = false;
  libros: Libro[] = [];
  shouldScroll: boolean = false;

  sugerencias: string[] = [
    '¿Qué libros sobre bullying tienen?',
    '¿Cuál es el horario?',
    'Recomiéndame algo de ciencia ficción',
    '¿Cuántos libros puedo prestar?'
  ];

  constructor(private libraryService: LibraryService) {}

  ngOnInit(): void {
    this.libros = this.libraryService.getLibros();
    console.log('📚 Libros cargados:', this.libros.length);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainer?.nativeElement) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling:', err);
    }
  }

  async sendMessage(): Promise<void> {
    if (!this.input.trim() || this.isLoading) return;

    const userMessage = this.input.trim();
    this.input = '';

    this.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });
    this.shouldScroll = true;
    this.isLoading = true;

    // Simular delay de procesamiento
    setTimeout(() => {
      const response = this.generateResponse(userMessage);
      this.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });
      this.shouldScroll = true;
      this.isLoading = false;
    }, 800);
  }

  generateResponse(userMessage: string): string {
    const msg = userMessage.toLowerCase();

    // Horarios
    if (msg.includes('horario') || msg.includes('hora') || msg.includes('abierto')) {
      return '⏰ **Horarios de la Biblioteca:**\n\n📅 Lunes a Viernes: 8:00 AM - 8:00 PM\n📅 Sábados: 9:00 AM - 5:00 PM\n📅 Domingos y feriados: Cerrado\n\n¿Necesitas algo más?';
    }

    // Préstamos
    if (msg.includes('prestar') || msg.includes('préstamo') || msg.includes('cuantos libros')) {
      return '📖 **Información de Préstamos:**\n\n✅ Puedes prestar hasta 5 libros simultáneamente\n⏱️ Duración: 15 días\n🔄 Renovaciones: Hasta 2 veces (7 días cada una)\n💰 Multa por retraso: S/2.00 por día\n\n¿Te gustaría buscar algún libro?';
    }

    // Búsqueda de libros
    if (msg.includes('libro') || msg.includes('busco') || msg.includes('recomienda')) {
      // Bullying
      if (msg.includes('bullying') || msg.includes('acoso')) {
        const libros = this.libros.filter(l =>
          l.titulo.toLowerCase().includes('paco') ||
          l.titulo.toLowerCase().includes('august')
        );
        return this.formatLibroRecommendations('bullying o acoso escolar', libros);
      }

      // Ciencia ficción
      if (msg.includes('ciencia ficción') || msg.includes('sci-fi') || msg.includes('scifi')) {
        const libros = this.libros.filter(l => l.categoria === 'Sci-Fi');
        return this.formatLibroRecommendations('ciencia ficción', libros);
      }

      // Narrativa
      if (msg.includes('narrativa') || msg.includes('novela')) {
        const libros = this.libros.filter(l => l.categoria === 'Narrativa').slice(0, 3);
        return this.formatLibroRecommendations('narrativa', libros);
      }

      // Épico
      if (msg.includes('épico') || msg.includes('epico') || msg.includes('epopeya')) {
        const libros = this.libros.filter(l => l.categoria === 'Épico');
        return this.formatLibroRecommendations('épica', libros);
      }

      // Infantil
      if (msg.includes('niño') || msg.includes('infantil') || msg.includes('niños')) {
        const libros = this.libros.filter(l => l.categoria === 'Infantil');
        return this.formatLibroRecommendations('literatura infantil', libros);
      }

      // Búsqueda por autor
      if (msg.includes('garcía márquez') || msg.includes('marquez')) {
        const libros = this.libros.filter(l => l.autor.toLowerCase().includes('garcía'));
        return this.formatLibroRecommendations('Gabriel García Márquez', libros);
      }

      // Disponibles
      if (msg.includes('disponible')) {
        const libros = this.libros.filter(l => l.disponible).slice(0, 5);
        return `📚 **Libros Disponibles Ahora:**\n\nTenemos ${libros.length} libros disponibles. Aquí algunos:\n\n${libros.map(l => `• **${l.titulo}** - ${l.autor}`).join('\n')}\n\n¿Te interesa alguno en particular?`;
      }
    }

    // Servicios
    if (msg.includes('servicio')) {
      return '🏛️ **Nuestros Servicios:**\n\n📖 Préstamo de libros\n💻 Computadoras con internet\n📚 Salas de estudio\n🖨️ Impresión y escaneo\n👥 Asesoría bibliográfica\n📱 Préstamo con código QR\n\n¿Quieres más info sobre alguno?';
    }

    // Registro
    if (msg.includes('registro') || msg.includes('registrar') || msg.includes('inscrib')) {
      return '📝 **Registro de Usuarios:**\n\nPara registrarte necesitas:\n✅ DNI original\n✅ Foto tamaño carnet\n✅ Comprobante de domicilio\n\nPuedes hacerlo en el mostrador principal de Lunes a Viernes de 9 AM a 6 PM.\n\n¿Algo más?';
    }

    // Respuesta genérica inteligente
    return this.generateGenericResponse(msg);
  }

  formatLibroRecommendations(tema: string, libros: Libro[]): string {
    if (libros.length === 0) {
      return `😔 Lo siento, no encontré libros sobre ${tema} en este momento.\n\n¿Te gustaría que te recomiende algo de otra categoría?\n\nTenemos libros de: Narrativa, Sci-Fi, Épico, Infantil, Dramático.`;
    }

    let response = `📚 **Libros sobre ${tema}:**\n\nEncontré ${libros.length} libro(s) que te pueden interesar:\n\n`;

    libros.slice(0, 3).forEach((libro, index) => {
      const disponibilidad = libro.disponible ? '✅ Disponible' : '❌ Prestado';
      response += `${index + 1}. **${libro.titulo}**\n`;
      response += `   📖 ${libro.autor}\n`;
      response += `   ${disponibilidad}\n`;
      if (libro.descripcion || libro.sinopsis) {
        const desc = (libro.descripcion || libro.sinopsis || '').substring(0, 100);
        response += `   💭 ${desc}...\n`;
      }
      response += `\n`;
    });

    response += '¿Te gustaría más información sobre alguno? 📖';
    return response;
  }

  generateGenericResponse(msg: string): string {
    const responses = [
      '🤔 Interesante pregunta. Te puedo ayudar con:\n\n📚 Búsqueda de libros\n⏰ Horarios y políticas\n💡 Recomendaciones\n🏛️ Servicios de la biblioteca\n\n¿Qué te gustaría saber?',
      '👋 Estoy aquí para ayudarte con la biblioteca.\n\nPuedes preguntarme sobre:\n• Libros disponibles\n• Horarios de atención\n• Cómo prestar libros\n• Recomendaciones de lectura\n\n¿En qué te ayudo?',
      '📖 SmartLibrary tiene muchas opciones para ti.\n\nPrueba preguntando:\n• "¿Qué libros de ciencia ficción tienen?"\n• "¿Cuál es el horario?"\n• "Quiero libros de García Márquez"\n\n¿Qué buscas?'
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  useSugerencia(sugerencia: string): void {
    this.input = sugerencia;
    this.sendMessage();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    if (confirm('¿Estás seguro de que quieres limpiar el chat?')) {
      this.messages = [
        {
          role: 'assistant',
          content: '¡Hola de nuevo! 👋 ¿En qué puedo ayudarte?',
          timestamp: new Date()
        }
      ];
      this.shouldScroll = true;
    }
  }
}
