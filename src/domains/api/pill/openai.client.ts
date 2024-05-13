import OpenAI from 'openai';
import { ChatCompletionTool } from 'openai/resources';

type Field = 'first name' | 'surname' | 'profession';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const exmaples = {
  'first name': 'Me llamo carlos => Carlos | Me llamo carlos facundo => Carlos Facundo',
  surname:
    'Mi apellido es Apellidez => Apellidez | Mi apellido es Apellidez Heredero => Apellidez Heredero | Mi apellido es Apellidez heredero de la fortuna de los Apellidez => Apellidez',
  profession: 'Hola, soy un doctor => Doctor | Soy un doctor en medicina => Doctor en medicina | Soy estudiante => Estudiante',
};

const context = (field: Field) => `
                AI is a powerful and obedient assistant. The traits of AI include expert knowledge, cleverness, and preciseness in its assistance.
                AI's main and only purpose is to read and extract the ${field} in the prompt.
                AI can only respond in only one format. AI has to answer with the tool call extract_field and it has to return the ${field} of the person found following the tool.
                It is mandatory that in case AI can't find a ${field} has to return an empty string.
                It is mandatory that AI use the tool called extract_field to make its answer and answer as a tool and not as a message content and it has to contain only the ${field}.
                Here is an example: ${exmaples[field]}             
`;

export const retrieveData = async (prompt: string, field: Field) => {
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
      { role: 'system', content: context(field) },
      { role: 'user', content: prompt },
    ],
    model: 'gpt-4o',
    tools: tools,
    tool_choice: 'required',
  };
  const chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params);
  const [tool] = chatCompletion.choices[0].message.tool_calls!;
  const { field: reponseField } = JSON.parse(tool.function.arguments);
  const newField = capitalize(reponseField);
  console.log(context(field));
  return newField;
};

const capitalize = (name: any) => {
  const names = name.split(' ');
  return names.map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
};
