import { ElementType, FormType, PillForm, PillNode, QuestionType } from '../interfaces/pill.interface';
import { PillBlockDto } from '../dtos/pill-block.dto';
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

  public adaptThreadIntoPill(thread: any): PillBlockDto {
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

    return new PillBlockDto(pill);
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
        const pillNodes2 = this.processFreeTextQuestion(element);
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
      branch.objects.forEach((object: { id: string; value: string; type: string }) => {
        if (object.value !== '') {
          switch (object.type) {
            case 'text':
              elements.push(this.processText(object));
              break;
            case 'static_image':
              elements.push(this.processStaticImage(object));
              break;
          }
        }
      });
    });
    return elements;
  }

  private processText(object: any): PillNode {
    return {
      id: object.id,
      type: ElementType.ACTION,
      name: object.value,
    };
  }

  private processStaticImage(object: any): PillNode {
    return {
      id: object.id,
      type: ElementType.ACTION,
      name: object.value,
      metadata: {
        metadata: {
          lerni_question_type: 'image',
        },
      },
    };
  }

  private processFreeTextQuestion(element: any): PillNode[] {
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
        metadata: {
          lerni_question_type: 'free-text',
        },
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

    const options = this.getQuestionOptions(element);
    const optionDescriptions = this.getOptionDescriptions(element);
    const correctAnswer = this.getCorrectAnswer(element);

    if (!variableToQuestionMap[element.save_to_variable]) variableToQuestionMap[element.save_to_variable] = element;

    const uuid = this.generateUUID();
    elements.push({
      id: uuid,
      type: ElementType.ACTION,
      name: element.question,
    });

    const questionNode: PillNode = {
      id: element.id,
      type: ElementType.QUESTION,
      name: '',
      question_type: element.properties.may_select_multiple ? QuestionType.MULTIPLECHOICE : QuestionType.SINGLECHOICE,
      metadata: {
        metadata: {
          lerni_question_type: element.properties.may_select_multiple ? 'multiple-choice' : 'single-choice',
        },
        options,
      },
    };
    if (correctAnswer) {
      questionNode.metadata.metadata.correct_answer = correctAnswer;
    }
    if (optionDescriptions) {
      questionNode.metadata.metadata.lerni_question_type = 'carousel';
      questionNode.metadata.metadata.option_descriptions = optionDescriptions;
    }

    elements.push(questionNode);

    element.options.forEach((response: any) => {
      const elements = this.processAppearTogether(response.objects[0]);
      elements.push(...elements);
    });

    return elements;
  }

  private getQuestionOptions(element: any) {
    if (element.options[0].image_url) {
      return element.options.map((option: any) => option.image_url);
    } else {
      return element.options.map((option: any) => option.text);
    }
  }

  private getCorrectAnswer(element: any) {
    if (element.properties.no_correct_answers) {
      return null;
    }
    if (element.properties.may_select_multiple) {
      return element.options
        .filter((option: any) => option.correct)
        .map((option: any) => (option.image_url ? option.image_url : option.text));
    } else {
      const correctOption = element.options.find((option: any) => option.correct);
      return correctOption.image_url ? correctOption.image_url : correctOption.text;
    }
  }

  private getOptionDescriptions(element: any) {
    if (element.options[0].image_url) {
      return element.options.map((option: any) => option.text);
    } else {
      return null;
    }
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
        const processed = this.processElement(object, array[index + 1], pill, variableToQuestionMap).pillNode;
        if (elements.length > 0) {
          pill.relations.push({
            from: elements[elements.length - 1].id,
            to: processed[0].id,
          });
        }
        elements.push(...processed);
      });

      //adds sequential relation if there are more than 1 objects in the branch
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
        const previousIndex = elements.findIndex((node: PillNode) => node.id === element.objects[0].id) - 1;
        pill.relations.push({
          from: parent.id,
          to: elements[previousIndex].id,
          condition: `ans = '${parentOption.text}'`,
        });
        const a = this.processElement(nextElement, null, pill, variableToQuestionMap).pillNode;
        pill.relations.push({
          from: element.objects[element.objects.length - 1].id,
          to: a[0].id,
        });
      }
    });

    return elements;
  }
}
