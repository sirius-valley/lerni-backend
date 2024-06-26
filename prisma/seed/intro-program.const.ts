export const firstProgramId = 'firstProgramId';
export const firstProgramVersionId = 'firstProgramVersionId';
export const firstPillId = 'firstPillId';
export const firstPillVersionId = 'firstPillVersionId';
export const firstProgramVersionPillVersionId = 'firstProgramVersionPillVersionId';
export const firstQuestionnaireId = 'firstQuestionnaireId';
export const firstQuestionnaireVersionId = 'firstQuestionnaireVersionId';
export const firstProgramVersionQuestionnaireVersionId = 'firstProgramVersionQuestionnaireVersionId';
export const firstTriviaId = 'firstTriviaId';
export const firstProgramVersionTriviaId = 'firstProgramVersionTriviaIdaa';
export const firstStudentProgramId = 'firstStudentProgramId';
export const lernitoTeacherId = 'lernitoTeacherId';
export const firstPillBlock = `{
  "id": "",
  "type": "DYNAMIC",
  "initial": "0",
  "elements": [
    {
      "id": "0",
      "type": "ACTION",
      "name": "<p>¡Bienvenido a tu <strong>primer píldora</strong>!☀️</p>"
    },
    {
      "id": "1",
      "type": "ACTION",
      "name": "https://lerni-images-2024.s3.amazonaws.com/introduction/lernitofachero.png",
      "metadata": {
        "metadata": {
          "lerni_question_type": "image"
        }
      }
    },
    {
      "id": "2",
      "type": "ACTION",
      "name": "<p>Mi nombre es <strong>Lernito</strong> 👋🏻 y hoy vamos a ver que tipo de interacciones vas a encontrarte en Lerni!</p>"
    },
    {
      "id": "3",
      "type": "ACTION",
      "name": "<p>¿Estás listo? 🏁</p>"
    },
    {
      "id": "4",
      "type": "QUESTION",
      "name": "",
      "question_type": "SINGLECHOICE",
      "metadata": {
        "metadata": {
          "lerni_question_type": "single-choice"
        },
        "options": [
          "Vamos! 🙌🏻"
        ]
      }
    },
    {
      "id": "5",
      "type": "ACTION",
      "name": "<p>Primero, vamos a conocer la <strong>'Respuesta simple'</strong> 🔘</p>"
    },
    {
      "id": "6",
      "type": "ACTION",
      "name": "<p>Con este tipo de interacción, podrás elegir una única opción para responder a las preguntas del 👨🏻👩🏻 instructor.</p>"
    },
    {
      "id": "7",
      "type": "ACTION",
      "name": "<p>Vamos a probarlo con una pregunta!</p>"
    },
    {
      "id": "8",
      "type": "ACTION",
      "name": "<p>¿En que año se firmó la independencia de 🇦🇷 Argentina?</p>"
    },
    {
      "id": "9",
      "type": "QUESTION",
      "name": "",
      "question_type": "SINGLECHOICE",
      "metadata": {
        "metadata": {
          "lerni_question_type": "single-choice"
        },
        "options": [
          "1810",
          "1812",
          "1816",
          "1910"
        ]
      }
    },
    {
      "id": "10",
      "type": "ACTION",
      "name": "<p><strong>¡Excelente!</strong> 🙌🏻</p>"
    },
    {
      "id": "11",
      "type": "ACTION",
      "name": "<p><strong>¡Nooo! Se firmo en el año 1816</strong> 😢</p>"
    },
    {
      "id": "12",
      "type": "ACTION",
      "name": "<p>Igual ahora no estamos evaluando que lo sepas 😉</p>"
    },
    {
      "id": "13",
      "type": "ACTION",
      "name": "<p>¿Vamos con el siguiente?</p>"
    },
    {
      "id": "14",
      "type": "QUESTION",
      "name": "",
      "question_type": "SINGLECHOICE",
      "metadata": {
        "metadata": {
          "lerni_question_type": "single-choice"
        },
        "options": [
          "Dale! 🙌🏻"
        ]
      }
    },
    {
      "id": "15",
      "type": "ACTION",
      "name": "<p>Bueno, el siguiente que vamos a ver es <strong>'Respuesta multiple' ◻️</strong></p>"
    },
    {
      "id": "16",
      "type": "ACTION",
      "name": "<p>Mediante este tipo de interacción, vas a poder seleccionar multiples respuesta a la pregunta del instructor!</p>"
    },
    {
      "id": "17",
      "type": "ACTION",
      "name": "<p><strong>PRO-TIP:</strong> Cuando es multiple, te aparece una ➡️ flecha debajo de las respuestas!</p>"
    },
    {
      "id": "18",
      "type": "ACTION",
      "name": "<p>Vamos a probarlo con una pregunta!</p>"
    },
    {
      "id": "19",
      "type": "ACTION",
      "name": "<p>¿Qué elementos conforman el 💧 agua?</p>"
    },
    {
      "id": "20",
      "type": "QUESTION",
      "name": "",
      "question_type": "MULTIPLECHOICE",
      "metadata": {
        "metadata": {
          "lerni_question_type": "multiple-choice"
        },
        "options": [
          "Hidrógeno",
          "Oxígeno",
          "Carbono",
          "Helio"
        ]
      }
    },
    {
      "id": "21",
      "type": "ACTION",
      "name": "<p>Sigamos con el siguiente!</p>"
    },
    {
      "id": "22",
      "type": "ACTION",
      "name": "<p>El que vamos a ver ahora se llama <strong>Carrusel de imagenes</strong>! 🖼️</p>"
    },
    {
      "id": "23",
      "type": "ACTION",
      "name": "<p>Es parecido a <strong>'Respuesta simple'</strong> pero con imágenes!</p>"
    },
    {
      "id": "24",
      "type": "ACTION",
      "name": "<p>Vamos a verlo con una pregunta!</p>"
    },
    {
      "id": "25",
      "type": "ACTION",
      "name": "<p>¿Quién de estos personajes no es un 🌃 <strong>Skywalker</strong>?</p>"
    },
    {
      "id": "26",
      "type": "QUESTION",
      "name": "",
      "question_type": "SINGLECHOICE",
      "metadata": {
        "metadata": {
          "lerni_question_type": "carousel",
          "option_images": [
            "https://lerni-images-2024.s3.amazonaws.com/introduction/darth-vader-enfadado-star-wars.jpg",
            "https://lerni-images-2024.s3.amazonaws.com/introduction/download.jpeg",
            "https://lerni-images-2024.s3.amazonaws.com/introduction/fotonoticia_20240424115623_690.jpg",
            "https://lerni-images-2024.s3.amazonaws.com/introduction/luke-skywalker-boba-fett-1643971893.jpg"
          ]
        },
        "options": [
          "Darth Vader",
          "Leia",
          "Rey",
          "Luke"
        ]
      }
    },
    {
      "id": "27",
      "type": "ACTION",
      "name": "<p>Si! La respuesta es <strong>👑 Rey</strong>!</p>"
    },
    {
      "id": "28",
      "type": "ACTION",
    "name": "<p>¡La respuesta correcta es <strong>👑 Rey</strong>!</p>"
    },
    {
      "id": "29",
      "type": "ACTION",
      "name": "<p>Por último, vamos a ver <strong>&quot;deslizamiento para continuar&quot;</strong>! 🎚️</p>"
    },
    {
      "id": "30",
      "type": "ACTION",
      "name": "<p>¿Te parece si probamos viendo unas 📷 fotos?</p>"
    },
    {
      "id": "31",
      "type": "QUESTION",
      "name": "",
      "question_type": "SINGLECHOICE",
      "metadata": {
        "metadata": {
          "lerni_question_type": "single-choice"
        },
        "options": [
          "Veamos esas fotos! 👀"
        ]
      }
    },
    {
      "id": "32",
      "type": "ACTION",
      "name": "https://lerni-images-2024.s3.amazonaws.com/introduction/foto.jpg",
      "metadata": {
        "metadata": {
          "lerni_question_type": "image"
        }
      }
    },
    {
      "id": "33",
      "type": "QUESTION",
      "name": "",
      "question_type": "SINGLECHOICE",
      "metadata": {
        "metadata": {
          "lerni_question_type": "single-choice"
        },
        "options": [
          "."
        ]
      }
    },
    {
      "id": "34",
      "type": "ACTION",
      "name": "https://lerni-images-2024.s3.amazonaws.com/introduction/foto2.jpg",
      "metadata": {
        "metadata": {
          "lerni_question_type": "image"
        }
      }
    },
    {
      "id": "35",
      "type": "QUESTION",
      "name": "",
      "question_type": "SINGLECHOICE",
      "metadata": {
        "metadata": {
          "lerni_question_type": "single-choice"
        },
        "options": [
          "."
        ]
      }
    },
    {
      "id": "36",
      "type": "ACTION",
      "name": "https://lerni-images-2024.s3.amazonaws.com/introduction/foto3.jpg",
      "metadata": {
        "metadata": {
          "lerni_question_type": "image"
        }
      }
    },
    {
      "id": "37",
      "type": "ACTION",
      "name": "<p><strong>¡Increíble!</strong> ¡Llegamos al final de esta píldora! 🎉🎊</p>"
    },
    {
      "id": "38",
      "type": "ACTION",
      "name": "<p>Te espero en el cuestionario</p>"
    },
    {
      "id": "39",
      "type": "ACTION",
      "name": "<p>¡Nos vemos! 👋🏻</p>"
    },
    {
      "id": "40",
      "type": "QUESTION",
      "name": "",
      "question_type": "SINGLECHOICE",
      "metadata": {
        "metadata": {
          "lerni_question_type": "single-choice"
        },
        "options": [
          "👋🏻"
        ]
      }
    }
  ],
  "relations": [
    {
      "from": "0",
      "to": "1"
    },
    {
      "from": "1",
      "to": "2"
    },
    {
      "from": "2",
      "to": "3"
    },
    {
      "from": "3",
      "to": "4"
    },
    {
      "from": "4",
      "to": "5"
    },
    {
      "from": "5",
      "to": "6"
    },
    {
      "from": "6",
      "to": "7"
    },
    {
      "from": "7",
      "to": "8"
    },
    {
      "from": "8",
      "to": "9"
    },
    {
      "from": "9",
      "to": "10",
      "condition": "ans = '1816'"
    },
    {
      "from": "9",
      "to": "11"
    },
    {
      "from": "10",
      "to": "13"
    },
    {
      "from": "11",
      "to": "12"
    },
    {
      "from": "12",
      "to": "13"
    },
    {
      "from": "13",
      "to": "14"
    },
    {
      "from": "14",
      "to": "15"
    },
    {
      "from": "15",
      "to": "16"
    },
    {
      "from": "16",
      "to": "17"
    },
    {
      "from": "17",
      "to": "18"
    },
    {
      "from": "18",
      "to": "19"
    },
    {
      "from": "19",
      "to": "20"
    },
    {
      "from": "20",
      "to": "21"
    },
    {
      "from": "21",
      "to": "22"
    },
    {
      "from": "22",
      "to": "23"
    },
    {
      "from": "23",
      "to": "24"
    },
    {
      "from": "24",
      "to": "25"
    },
    {
      "from": "25",
      "to": "26"
    },
    {
      "from": "26",
      "to": "27",
      "condition": "ans = 'Rey'"
    },
    {
      "from": "26",
      "to": "28"
    },
    {
      "from": "27",
      "to": "29"
    },
    {
      "from": "28",
      "to": "29"
    },
    {
      "from": "29",
      "to": "30"
    },
    {
      "from": "30",
      "to": "31"
    },
    {
      "from": "31",
      "to": "32"
    },
    {
      "from": "32",
      "to": "33"
    },
    {
      "from": "33",
      "to": "34"
    },
    {
      "from": "34",
      "to": "35"
    },
    {
      "from": "35",
      "to": "36"
    },
    {
      "from": "36",
      "to": "37"
    },
    {
      "from": "37",
      "to": "38"
    },
    {
      "from": "38",
      "to": "39"
    },
    {
      "from": "39",
      "to": "40"
    }
  ]
}`;

export const firstQuestionnaireBlock = `{
  "id": "",
  "type": "DYNAMIC",
  "initial": "0",
  "elements": [
    {
      "id": "0",
      "type": "ACTION",
      "name": "<p>¿Cuál es el río mas <strong>largo</strong> del mundo?</p>"
    },
    {
      "id": "1",
      "type": "QUESTION",
      "name": "",
      "question_type": "SINGLECHOICE",
      "metadata": {
        "metadata": {
          "lerni_question_type": "single-choice",
          "correct_answer": "Nilo"
        },
        "options": [
          "Amazonas",
          "Nilo",
          "Yangsté",
          "Misisipi"
        ]
      }
    },
    {
      "id": "2",
      "type": "ACTION",
      "name": "¿Cuál es el país más grande del mundo en términos de superficie?"
    },
    {
      "id": "3",
      "type": "QUESTION",
      "name": "",
      "question_type": "SINGLECHOICE",
      "metadata": {
        "metadata": {
          "lerni_question_type": "single-choice",
          "correct_answer": "Rusia"
        },
        "options": [
          "Canadá",
          "Estados Unidos",
          "China",
          "Rusia"
        ]
      }
    },
    {
      "id": "4",
      "type": "ACTION",
      "name": "¿En qué año comenzó la Segunda Guerra Mundial?"
    },
    {
      "id": "5",
      "type": "QUESTION",
      "name": "",
      "question_type": "SINGLECHOICE",
      "metadata": {
        "metadata": {
          "lerni_question_type": "single-choice",
          "correct_answer": "1939"
        },
        "options": [
          "1914",
          "1939",
          "1941",
          "1945"
        ]
      }
    },
    {
      "id": "6",
      "type": "ACTION",
      "name": "¿Cuál es el idioma oficial de Brasil?"
    },
    {
      "id": "7",
      "type": "QUESTION",
      "name": "",
      "question_type": "SINGLECHOICE",
      "metadata": {
        "metadata": {
          "lerni_question_type": "single-choice",
          "correct_answer": "Portugués"
        },
        "options": [
          "Español",
          "Portugués",
          "Inglés",
          "Francés"
        ]
      }
    },
    {
      "id": "8",
      "type": "ACTION",
      "name": "¿Quién pintó “La Última Cena”?"
    },
    {
      "id": "9",
      "type": "QUESTION",
      "name": "",
      "question_type": "SINGLECHOICE",
      "metadata": {
        "metadata": {
          "lerni_question_type": "single-choice",
          "correct_answer": "Leonardo da Vinci"
        },
        "options": [
          "Miguel Ángel",
          "Rafael",
          "Leonardo da Vinci",
          "Donatello"
        ]
      }
    },
    {
      "id": "10",
      "type": "ACTION",
      "name": "¿Cuál es el planeta más grande del sistema solar?"
    },
    {
      "id": "11",
      "type": "QUESTION",
      "name": "",
      "question_type": "SINGLECHOICE",
      "metadata": {
        "metadata": {
          "lerni_question_type": "single-choice",
          "correct_answer": "Júpiter"
        },
        "options": [
          "Marte",
          "Júpiter",
          "Saturno",
          "Neptuno"
        ]
      }
    }
  ],
  "relations": [
    {
      "from": "0",
      "to": "1"
    },
    {
      "from": "1",
      "to": "2"
    },
    {
      "from": "2",
      "to": "3"
    },
    {
      "from": "3",
      "to": "4"
    },
    {
      "from": "4",
      "to": "5"
    },
    {
      "from": "5",
      "to": "6"
    },
    {
      "from": "6",
      "to": "7"
    },
    {
      "from": "7",
      "to": "8"
    },
    {
      "from": "8",
      "to": "9"
    },
    {
      "from": "9",
      "to": "10"
    },
    {
      "from": "10",
      "to": "11"
    }
  ]
}`;

export const firstTriviaBlock = `{
   "id":"",
   "type":"RANDOM",
   "seed":0,
   "elements":[
      {
         "id":"3fa64704-3377-4238-8b22-e64c06772e2900",
         "type":"QUESTION",
         "name":"¿Quién escribió “Cien años de soledad”?",
         "question_type":"SINGLECHOICE",
         "metadata":{
            "metadata":{
               "lerni_question_type":"single-choice",
               "seconds_to_answer":30,
               "correct_answer":"Gabriel García Márquez"
            },
            "options":[
               "Mario Vargas Llosa",
               "Pablo Neruda",
               "Julio Cortázar",
               "Gabriel García Márquez",
               "timeout",
               "left"
            ]
         }
      },
      {
         "id":"1",
         "type":"QUESTION",
         "name":"¿Cuál es la capital de Australia?",
         "question_type":"SINGLECHOICE",
         "metadata":{
            "metadata":{
               "lerni_question_type":"single-choice",
               "seconds_to_answer":30,
               "correct_answer":"Canberra"
            },
            "options":[
               "Sídney",
               "Melbourne",
               "Canberra",
               "Brisbane",
               "timeout",
               "left"
            ]
         }
      },
      {
         "id":"2",
         "type":"QUESTION",
         "name":"¿Cuál es el metal más abundante en la corteza terrestre?",
         "question_type":"SINGLECHOICE",
         "metadata":{
            "metadata":{
               "lerni_question_type":"single-choice",
               "seconds_to_answer":30,
               "correct_answer":"Aluminio"
            },
            "options":[
               "Hierro",
               "Oro",
               "Aluminio",
               "Cobre",
               "timeout",
               "left"
            ]
         }
      },
      {
         "id":"3",
         "type":"QUESTION",
         "name":"¿Qué científico formuló la teoría de la relatividad?",
         "question_type":"SINGLECHOICE",
         "metadata":{
            "metadata":{
               "lerni_question_type":"single-choice",
               "seconds_to_answer":30,
               "correct_answer":"Albert Einstein"
            },
            "options":[
               "Isaac Newton",
               "Galileo Galilei",
               "Nikola Tesla",
               "Albert Einstein",
               "timeout",
               "left"
            ]
         }
      },
      {
         "id":"4",
         "type":"QUESTION",
         "name":"¿Cuál es el océano más grande del mundo?",
         "question_type":"SINGLECHOICE",
         "metadata":{
            "metadata":{
               "lerni_question_type":"single-choice",
               "seconds_to_answer":30,
               "correct_answer":"Pacífico"
            },
            "options":[
               "Atlántico",
               "Índico",
               "Ártico",
               "Pacífico",
               "timeout",
               "left"
            ]
         }
      },
      {
         "id":"5",
         "type":"QUESTION",
         "name":"¿Cuál es el océano más grande del mundo?",
         "question_type":"SINGLECHOICE",
         "metadata":{
            "metadata":{
               "lerni_question_type":"single-choice",
               "seconds_to_answer":30,
               "correct_answer":"Pacífico"
            },
            "options":[
               "Atlántico",
               "Índico",
               "Ártico",
               "Pacífico",
               "timeout",
               "left"
            ]
         }
      },
      {
         "id":"6",
         "type":"QUESTION",
         "name":"¿Qué país es conocido como “La tierra del sol naciente”?",
         "question_type":"SINGLECHOICE",
         "metadata":{
            "metadata":{
               "lerni_question_type":"single-choice",
               "seconds_to_answer":30,
               "correct_answer":"Japón"
            },
            "options":[
               "China",
               "Japón",
               "Corea del Sur",
               "India",
               "timeout",
               "left"
            ]
         }
      },
      {
         "id":"7",
         "type":"QUESTION",
         "name":"¿En qué país se encuentra la Torre Eiffel?",
         "question_type":"SINGLECHOICE",
         "metadata":{
            "metadata":{
               "lerni_question_type":"single-choice",
               "seconds_to_answer":30,
               "correct_answer":"Francia"
            },
            "options":[
               "Italia",
               "Alemania",
               "Francia",
               "España",
               "timeout",
               "left"
            ]
         }
      },
      {
         "id":"8",
         "type":"QUESTION",
         "name":"¿Cuál es el órgano más grande del cuerpo humano?",
         "question_type":"SINGLECHOICE",
         "metadata":{
            "metadata":{
               "lerni_question_type":"single-choice",
               "seconds_to_answer":30,
               "correct_answer":"Piel"
            },
            "options":[
               "Hígado",
               "Cerebro",
               "Corazón",
               "Piel",
               "timeout",
               "left"
            ]
         }
      },
      {
         "id":"9",
         "type":"QUESTION",
         "name":"¿Quién escribió “Don Quijote de la Mancha”?",
         "question_type":"SINGLECHOICE",
         "metadata":{
            "metadata":{
               "lerni_question_type":"single-choice",
               "seconds_to_answer":30,
               "correct_answer":"Miguel de Cervantes"
            },
            "options":[
               "Miguel de Cervantes",
               "William Shakespeare",
               "Federico García Lorca",
               "Gabriel García Márquez",
               "timeout",
               "left"
            ]
         }
      },
      {
         "id":"10",
         "type":"QUESTION",
         "name":"¿Cuál es el animal terrestre más rápido del mundo?",
         "question_type":"SINGLECHOICE",
         "metadata":{
            "metadata":{
               "lerni_question_type":"single-choice",
               "seconds_to_answer":30,
               "correct_answer":"Guepardo"
            },
            "options":[
               "Tigre",
               "León",
               "Guepardo",
               "Caballo",
               "timeout",
               "left"
            ]
         }
      },
      {
         "id":"11",
         "type":"QUESTION",
         "name":"¿Cuál es el elemento químico con el símbolo “O”?",
         "question_type":"SINGLECHOICE",
         "metadata":{
            "metadata":{
               "lerni_question_type":"single-choice",
               "seconds_to_answer":30,
               "correct_answer":"Oxígeno"
            },
            "options":[
               "Oro",
               "Oxígeno",
               "Osmio",
               "Osmosis",
               "timeout",
               "left"
            ]
         }
      },
      {
         "id":"12",
         "type":"QUESTION",
         "name":"¿Cuál es la montaña más alta del mundo?",
         "question_type":"SINGLECHOICE",
         "metadata":{
            "metadata":{
               "lerni_question_type":"single-choice",
               "seconds_to_answer":30,
               "correct_answer":"Everest"
            },
            "options":[
               "K2",
               "Kilimanjaro",
               "Everest",
               "Aconcagua",
               "timeout",
               "left"
            ]
         }
      },
      {
         "id":"13",
         "type":"QUESTION",
         "name":"¿Quién es el autor de “La Odisea”?",
         "question_type":"SINGLECHOICE",
         "metadata":{
            "metadata":{
               "lerni_question_type":"single-choice",
               "seconds_to_answer":30,
               "correct_answer":"Homero"
            },
            "options":[
               "Sófocles",
               "Aristóteles",
               "Homero",
               "Virgilio",
               "timeout",
               "left"
            ]
         }
      }
   ]
}`;
