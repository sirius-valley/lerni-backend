import { ElementType, FormType, PillForm, PillNode, QuestionType } from '../interfaces/pill.interface';
import { UuidFactory } from '@nestjs/core/inspector/uuid-factory';
import { pipe } from 'rxjs';
// import { Injectable } from '@nestjs/common';
//
// @Injectable()
export class HeadlandsAdapter {
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public adaptThreadIntoPill(thread: any): PillForm {
    const pill: PillForm = {
      id: '',
      type: FormType.DYNAMIC,
      initial: '',
      elements: [],
      relations: [],
    };

    const variableToQuestionMap: any = {};
    let skip = false;
    thread.forEach((element: any, index: number, array: any[]) => {
      if (skip) {
        skip = false;
        return;
      }
      if (array.length === index) return;
      const processedElementResult = this.processElement(element, array[index + 1], pill, variableToQuestionMap);
      if (processedElementResult.pillNode.length !== 0 && pill.elements.length !== 0) {
        pill.relations.push({
          from: pill.elements[pill.elements.length - 1].id,
          to: processedElementResult.pillNode[0].id,
        });
      }
      pill.elements.push(...processedElementResult.pillNode);
    });

    if (pill.elements.length > 0) {
      pill.initial = pill.elements[0].id;
    }

    return pill;
  }

  public processElement(
    element: any,
    nextElement: any,
    pill: PillForm,
    variableToQuestionMap: any,
  ): { pillNode: PillNode[]; skip: boolean } {
    switch (element.type) {
      case 'appear_together':
        const pillNodes = this.processAppearTogether(element);
        this.addSequentialRelation(pillNodes, pill);
        return {
          pillNode: pillNodes,
          skip: false,
        };
      case 'free_text_question':
        const pillNodes2 = this.processFreeTextQuestion(element, pill);
        this.addSequentialRelation(pillNodes2, pill);
        return {
          pillNode: pillNodes2,
          skip: false,
        };
      case 'multiple_choice_question':
        const pillNodes3 = this.processMultipleChoiceQuestion(element, variableToQuestionMap);
        this.addSequentialRelation(pillNodes3, pill);
        return {
          pillNode: pillNodes3,
          skip: false,
        };
      case 'conditional':
        return {
          pillNode: this.processConditional(element, nextElement, pill, variableToQuestionMap),
          skip: true,
        };
      default:
        return {
          pillNode: [],
          skip: false,
        };
    }
  }

  private addSequentialRelation(elements: PillNode[], pill: PillForm): void {
    elements.forEach((element: PillNode, index: number, array: PillNode[]) => {
      if (array.length > index + 1) {
        pill.relations.push({
          from: element.id,
          to: array[index + 1].id,
        });
      }
    });
  }

  private processAppearTogether(element: any): PillNode[] {
    const elements: PillNode[] = [];
    element.branches.forEach((branch: any) => {
      branch.objects.forEach((object: { id: string; value: string }) => {
        if (object.value !== '') {
          elements.push({
            id: object.id,
            type: ElementType.ACTION,
            name: object.value,
          });
        }
      });
    });
    return elements;
  }

  private processFreeTextQuestion(element: any, pill: PillForm): PillNode[] {
    const elements: PillNode[] = [];
    const uuid = this.generateUUID();

    elements.push({
      id: uuid,
      type: ElementType.ACTION,
      name: element.question,
    });

    elements.push({
      id: element.id,
      type: ElementType.QUESTION,
      name: '',
      question_type: QuestionType.TEXTINPUT,
      metadata: {
        lerni_question_type: 'free-text',
        regex: '.*',
      },
    });

    // pill.relations.push({
    //   from: uuid,
    //   to: element.id,
    // })

    const appearTogetherElements = this.processAppearTogether(element.responses[0].objects[0]);
    elements.push(...appearTogetherElements);

    return elements;
  }

  private processMultipleChoiceQuestion(element: any, variableToQuestionMap: any): PillNode[] {
    const elements: PillNode[] = [];

    const options = element.options.map((response: any) => response.text);

    if (!variableToQuestionMap[element.save_to_variable]) variableToQuestionMap[element.save_to_variable] = element;

    const uuid = this.generateUUID();
    elements.push({
      id: uuid,
      type: ElementType.ACTION,
      name: element.question,
    });

    elements.push({
      id: element.id,
      type: ElementType.QUESTION,
      name: '',
      question_type: element.properties.may_select_multiple ? QuestionType.MULTIPLECHOICE : QuestionType.SINGLECHOICE,
      metadata: {
        lerni_question_type: element.properties.may_select_multiple ? 'multiple-choice' : 'single-choice',
        options,
      },
    });

    element.options.forEach((response: any) => {
      const elements = this.processAppearTogether(response.objects[0]);
      elements.push(...elements);
    });

    return elements;
  }

  private processConditional(element: any, nextElement: any, pill: PillForm, variableToQuestionMap: any): PillNode[] {
    const elements: PillNode[] = [];

    element.branches.forEach((element: any) => {
      let skip = false;

      element.objects.forEach((object: any, array: any[], index: number) => {
        if (skip) {
          skip = false;
          return;
        }
        if (array.length === index) return;
        elements.push(...this.processElement(object, array[index + 1], pill, variableToQuestionMap).pillNode);
      });

      element.objects.forEach((object: any, index: number, array: any[]) => {
        if (array.length > index + 1) {
          pill.relations.push({
            from: element.objects[index].id,
            to: element.objects[index + 1].id,
          });
        }
      });

      const branchId = element.test.val[0];
      const testVarName = element.test.var;

      if (variableToQuestionMap[testVarName]) {
        const parent = variableToQuestionMap[testVarName];
        const parentOption = parent.options.find((option: any) => option.id === branchId);
        pill.relations.push({
          from: parent.id,
          to: element.objects[0].id,
          condition: `ans = '${parentOption.text}'`,
        });
        const a = this.processElement(nextElement, null, pill, variableToQuestionMap).pillNode[0];
        console.log(a);
        pill.relations.push({
          from: element.objects[element.objects.length - 1].id,
          to: a.id,
        });
      }
    });

    return elements;
  }
}

const json = `[{"id":"3231c1f7-56f4-4c60-a474-9134970dc3bd","type":"appear_together","branches":[{"id":"03d97ddf-c5e3-4263-9ab7-a0db4de0d963","objects":[{"id":"796c43a6-5cf7-442b-9d78-249ffe087d9f","type":"text","value":"<p>Bienvenido</p>"},{"id":"4917003f-dad9-4fa1-839e-babdf94ea513","type":"text","value":"<p>Esta es una aplicacion que te va a ayudar a poder repasar, practicar y aprender de forma innovadora y adaptada a vos!</p>"},{"id":"cfe7696d-6b3e-44c2-ac4d-fcab99ead69e","type":"text","value":"<p>Para poder desbloquear los programas disponibles que tenemos para vos, necestamos conocerte</p>"}],"test":{"var":""}}]},{"id":"0e64b123-5fcb-46db-a2cf-5e39f0b90ed7","type":"free_text_question","properties":{"no_correct_answers":true,"hide_answer_correctness":false},"question":"<p><span style=\\"background-color: rgb(245, 245, 245); color: rgb(0, 0, 0);\\">Cual es tu nombre completo?</span></p>","responses":[{"id":"638772a3-d965-49ef-aa83-fdabd39bc9b5","input":"","objects":[{"id":"e24008a3-17e3-4323-a0c5-cb5dcd36d8a6","type":"appear_together","branches":[{"id":"5e5c9421-a9d3-47a5-9698-57f8105fd458","objects":[{"id":"90eb811a-8d19-4a9a-871f-b38b7f23be4b","type":"text","value":""}],"test":{"var":""}}]}]}],"save_to_variable":"fullname"},{"id":"e8a251f7-bf67-43a2-97d2-0479af6295ba","type":"appear_together","branches":[{"id":"8bca7dac-a0d7-44a3-b05b-ceed2a636c39","objects":[{"id":"3b1c350e-7412-4334-9fd9-87eb6f8e802c","type":"text","value":"<p>Genial! Hola @fullname</p>"}],"test":{"var":""}}]},{"id":"70b6b4a9-a50d-4f19-8833-08f1763b9409","type":"free_text_question","properties":{"no_correct_answers":true,"hide_answer_correctness":false},"question":"<p><span style=\\"background-color: rgb(245, 245, 245); color: rgb(0, 0, 0);\\">Contanos, de donde sos?</span></p>","responses":[{"id":"11d57e6c-2ea0-4a83-a168-fb060571e76d","input":"","objects":[{"id":"06fcd936-7c9d-435d-bc27-668e31fcd83e","type":"appear_together","branches":[{"id":"ef914b8a-595b-4879-b2c2-001b19834b75","objects":[{"id":"38bd0eb5-8803-4754-8cd2-c227a815f891","type":"text","value":""}],"test":{"var":""}}]}]}],"save_to_variable":"place"},{"id":"269c582d-8ce2-4afe-9c23-95f4d29b51e1","type":"appear_together","branches":[{"id":"8d9216ba-fff2-4694-98f1-2190319c6145","objects":[{"id":"03a39f0c-b740-4314-8eb6-61819fb973b2","type":"text","value":"<p>Que bueno!</p>"}],"test":{"var":""}}]},{"id":"a45869e8-bc3e-4c3e-b87a-65c6c743cac0","type":"multiple_choice_question","properties":{"display_poll":false,"no_correct_answers":false,"may_select_multiple":false,"hide_answer_correctness":false},"question":"<p><span style=\\"background-color: rgb(245, 245, 245); color: rgb(0, 0, 0);\\">Y trabajas o estudias?</span></p>","options":[{"id":"1ddc970c-8a18-45a0-af89-5fd67b85c3bc","text":"Estudio","objects":[{"id":"d568e674-ad3b-4496-a038-0040c9212d38","type":"appear_together","branches":[{"id":"7a2fe735-e4e8-4f39-a78a-e44b54256e40","objects":[{"id":"6d3e799a-0e28-4642-9be1-671e7f6b39c1","type":"text","value":""}],"test":{"var":""}}]}],"correct":false},{"id":"67a5e2c5-1554-446c-915d-e077be60ae29","text":"Trabajo","objects":[{"id":"cce38eac-90d0-4c87-96ca-2ed2549c1f2a","type":"appear_together","branches":[{"id":"181d80e8-30e3-40dd-8b93-c5abf7f9db2b","objects":[{"id":"4ac00b5c-7746-4b5e-a7c6-1ae54e5a8e01","type":"text","value":""}],"test":{"var":""}}]}],"correct":true},{"id":"ccf25707-a4c2-4933-a3b4-098d15e4a63d","text":"Estudio y Trabajo","objects":[{"id":"1e611faf-e26c-4ae7-ad75-746fed862148","type":"appear_together","branches":[{"id":"87225013-c83f-49f2-ae16-00f32e4e1dda","objects":[{"id":"64171a68-70ee-4347-8717-02fd820e9062","type":"text","value":""}],"test":{"var":""}}]}],"correct":false}],"save_to_variable":"work_or_study"},{"id":"f67a7fc3-9595-4c52-b111-67967f782206","type":"conditional","branches":[{"id":"45b4c9eb-f956-4e0a-adf1-3870d2b73ff5","objects":[{"id":"bd7b151f-a1f1-406d-898b-f8dfb2f89ec5","type":"free_text_question","properties":{"no_correct_answers":false,"hide_answer_correctness":false},"question":"<p><span style=\\"background-color: rgb(245, 245, 245);\\">Que estudias?</span></p>","responses":[{"id":"104b842c-701d-4412-abb9-27860ffb052b","input":"","objects":[{"id":"e331763f-a331-45b8-8cfc-8db6ea4f664c","type":"appear_together","branches":[{"id":"c9367dd0-6020-4f33-afba-a8e8a745f6b8","objects":[{"id":"58b90302-cba9-4f0f-ad10-cc871bb081da","type":"text","value":""}],"test":{"var":""}}]}]}],"save_to_variable":"study_answer"}],"test":{"var":"work_or_study","op":"in","val":["1ddc970c-8a18-45a0-af89-5fd67b85c3bc"]}},{"id":"c2e31dc5-e4cb-47a4-89fd-a6b7abc5d116","objects":[{"id":"3dc9d90b-5e24-4ccc-9ed8-a21509b50ba6","type":"free_text_question","properties":{"no_correct_answers":false,"hide_answer_correctness":false},"question":"<p><span style=\\"background-color: rgb(245, 245, 245);\\">De que trabajas?</span></p>","responses":[{"id":"5b5cb72e-fd2f-478b-b9cd-635c437f751e","input":"","objects":[{"id":"c3db88ed-7e3e-4604-9323-568c42d14316","type":"appear_together","branches":[{"id":"f8205c8c-c239-4694-a7b6-21cfc8efcade","objects":[{"id":"dc83d9ef-d0f3-4dba-af06-6df5306fb4bd","type":"text","value":""}],"test":{"var":""}}]}]}],"save_to_variable":"work_answer"}],"test":{"var":"work_or_study","op":"in","val":["67a5e2c5-1554-446c-915d-e077be60ae29"]}},{"id":"cda1ca8d-caec-4be7-a766-302f0f0c6ad3","objects":[{"id":"736b1f08-3532-4f27-aa9c-b48075a43b33","type":"free_text_question","properties":{"no_correct_answers":false,"hide_answer_correctness":false},"question":"<p>Que estudias?</p>","responses":[{"id":"03b0c9dd-ae90-4a8d-a043-138cb7d73ef7","input":"","objects":[{"id":"0632f112-fad4-4e6a-bba7-13a6a8eae198","type":"appear_together","branches":[{"id":"eaac0c20-62de-4bc8-a5f2-c0a9a8a4fca5","objects":[{"id":"9b864173-95cb-443f-8630-d117fa425458","type":"text","value":""}],"test":{"var":""}}]}]}],"save_to_variable":""},{"id":"74e1cbe3-7ff8-4b17-8302-fd60b1bbeb85","type":"free_text_question","properties":{"no_correct_answers":false,"hide_answer_correctness":false},"question":"<p>De que trabajas?</p>","responses":[{"id":"2da4f80e-546d-423f-b832-1ebbd9f4644e","input":"","objects":[{"id":"9baa6b42-1ebf-4c48-8d52-6211c20618a5","type":"appear_together","branches":[{"id":"79fcb7af-af40-4aa4-8e25-6d609ce0207c","objects":[{"id":"bc9813dd-4e50-4657-b4a8-8801f78d9403","type":"text","value":""}],"test":{"var":""}}]}]}],"save_to_variable":""}],"test":{"var":"work_or_study","op":"in","val":["ccf25707-a4c2-4933-a3b4-098d15e4a63d"]}}]},{"id":"dfbb821f-0724-44cf-8bd9-c11e8a0728e6","type":"appear_together","branches":[{"id":"3a202f90-b1dd-4a8e-83f5-aea96ba15e70","objects":[{"id":"17464d5a-68a5-4871-ab25-e45a8c5f08f0","type":"text","value":"<p>Buenisimo!</p>"}],"test":{"var":""}}],"pause_label":""},{"id":"699d0cb2-95ae-46b7-b7e7-a5da1b49a20d","type":"multiple_choice_question","properties":{"display_poll":false,"no_correct_answers":true,"may_select_multiple":false,"hide_answer_correctness":false},"question":"<p><span style=\\"background-color: rgb(245, 245, 245); color: rgb(0, 0, 0);\\">Ahora que nos conocemos, dejame comentarte como va a ser la metodologia!</span></p>","options":[{"id":"47cc3b64-aae0-4257-82cc-15cd3c65bbe4","text":"Dale!","objects":[{"id":"70baf246-49d6-421b-b19e-cb9db06c2049","type":"appear_together","branches":[{"id":"9efeb348-17df-4e82-9dbd-51858169ae5c","objects":[{"id":"339044e6-fac8-428a-b7d8-974c5b9919d1","type":"text","value":""}],"test":{"var":""}}]}],"correct":true}]},{"id":"fac75549-a815-4f16-8f7f-38692242bdc4","type":"appear_together","branches":[{"id":"39668088-16de-4a12-8b31-3ac648d14df6","objects":[{"id":"a108fd28-e17a-4e56-a67f-58093c5fc12f","type":"text","value":"<p>Como pudiste ver, la forma va a ser mediante una conversacion de no mas de 10 minutos con tu profesor, donde este te enseñara un tema en particular</p>"},{"id":"39a36669-7053-4eab-a5e5-ce38e033252b","type":"text","value":"<p>Para eso, nos proponemos hacerlo lo mas llevadero posible proponiendo una experiencia innovadora y hasta competitiva!</p>"},{"id":"7226020f-ef52-4ee2-894e-7677cffb3e49","type":"text","value":"<p>Al finalizar cada programa, vas a tener la oportunidad de desafiar a alguno de tus compañeros, con el fin de ganar puntos!</p>"}],"test":{"var":""}}],"pause_label":""},{"id":"b5f63627-598c-40a9-8556-046793b77cea","type":"multiple_choice_question","properties":{"display_poll":false,"no_correct_answers":true,"may_select_multiple":false,"hide_answer_correctness":false},"question":"<p><br></p>","options":[{"id":"34448ebd-1416-4df9-88cc-e21e5a44e0a9","text":"Que puedo hacer con los puntos?","objects":[{"id":"90a6804c-428a-45f9-9f1b-5a09202ed2b6","type":"appear_together","branches":[{"id":"82732a07-0aa8-403e-b199-d65060521d2d","objects":[{"id":"fe8314e5-1379-426b-bbbb-09be4f9b5395","type":"text","value":""}],"test":{"var":""}}]}]}],"save_to_variable":""},{"id":"e14c86fa-e569-4276-8aab-a195141091bb","type":"appear_together","branches":[{"id":"e1c4a711-2f51-405d-b225-8d21fde02ff0","objects":[{"id":"107458f3-ec6b-4035-ae28-7e6aa2e61c8d","type":"text","value":"<p>Buenisima pregunta!</p>"},{"id":"c0e604e5-1700-4678-adfe-450759cf2dd8","type":"text","value":"<p>Con los puntos que vayas ganando, vas a aparecer en el leaderboard del programa, canjear a futuro para customizar tu perfil y hasta poder subir algun punto en la nota de cursada!</p>"}],"test":{"var":""}}],"pause_label":""},{"id":"b4355579-f828-48b3-afa7-190d7ff3ab01","type":"multiple_choice_question","properties":{"display_poll":false,"no_correct_answers":true,"may_select_multiple":false,"hide_answer_correctness":false},"question":"<p><span style=\\"background-color: rgb(245, 245, 245); color: rgb(0, 0, 0);\\">Estas list@?</span></p>","options":[{"id":"d76c3202-eb6f-4f7f-bec8-2edee27eac08","text":"Siempre","objects":[{"id":"d4b8a2cf-76e6-4b61-ab99-cae259e9453d","type":"appear_together","branches":[{"id":"e50a6ba1-9176-4ab5-ba4e-54836ae437e9","objects":[{"id":"58fdc198-4507-4124-a9b0-df657af2af36","type":"text","value":""}],"test":{"var":""}}]}]}]}]`;

console.log(JSON.stringify(new HeadlandsAdapter().adaptThreadIntoPill(JSON.parse(json))));
