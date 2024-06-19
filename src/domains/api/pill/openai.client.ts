import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatCompletionTool } from 'openai/resources';

export type Field = 'name' | 'profession' | 'image' | 'city';
@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({ apiKey: this.configService.get<string>('OPENAI_API_KEY') });
  }

  private readonly examples = {
    name: 'Me llamo carlos apellidez => Carlos, Apellidez | Me llamo carlos facundo apellidez => Carlos Facundo, Apellidez | Soy carlos facundo hernandez carrazco => Carlos Facundo, Hernandez Carrazco | Hola soy fernando rodriguez gonzalez => Fernando, Rodriguez Gonzalez | ajlfewjaio => Undetected | abc abc => Undetected',
    profession: 'Hola, soy un doctor => Doctor | Soy un doctor en medicina => Doctor en medicina | Soy estudiante => Estudiante',
    image: 'some url => some url | image => image',
    city: 'Soy de Buenos Aires => Buenos Aires | pilar => Pilar | soy de Buenos Aires Argentina => Buenos Aires, Argentina | campana => Campana',
  };

  private context(field: Field) {
    return `
      AI is a powerful and obedient assistant. The traits of AI include expert knowledge, cleverness, and preciseness in its assistance.
      The current field is ${field}.
      AI's main and only purpose is to read and extract the ${field} in the prompt.
      AI can only respond in only one format. AI has to answer with the tool call extract_field and it has to return the ${field} of the person found following the tool.
      It is mandatory that in case AI can't find a name when the field is name has to return a string with the text Undetected; for the rest of the fields if AI can't find a ${field} it must return an empty string.
      It is mandatory that AI use the tool called extract_field to make its answer and answer as a tool and not as a message content and it has to contain only the ${field}.
      Here is an example: ${this.examples[field]}             
    `;
  }

  public async retrieveData(prompt: string, field: Field) {
    const tools: ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'extract_field',
          description: `Extract ${field} of the prompt`,
          parameters: {
            type: 'object',
            properties: {
              field: {
                type: 'string',
                description: `The ${field} of the person in the prompt`,
              },
            },
            required: ['field'],
          },
        },
      },
    ];

    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: [
        { role: 'system', content: this.context(field) },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-4o',
      tools: tools,
      tool_choice: 'required',
    };
    const chatCompletion = await this.openai.chat.completions.create(params);
    const [tool] = chatCompletion.choices[0].message.tool_calls!;
    const responseField = JSON.parse(tool.function.arguments);
    const newField = this.capitalize(responseField.field);
    return newField;
  }

  private capitalize(name: string) {
    const names = name.split(' ');
    return names.map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
  }
}
