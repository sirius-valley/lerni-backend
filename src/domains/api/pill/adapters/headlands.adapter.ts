import {
  ElementType,
  FormType,
  PillForm,
  PillNode,
  QuestionType,
} from '../interfaces/pill.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HeadlandsAdapter {
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
      const processedElementResult = this.processElement(
        element,
        array[index + 1],
        pill,
        variableToQuestionMap,
      );
      if (
        processedElementResult.pillNode.length !== 0 &&
        pill.elements.length !== 0
      ) {
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
        const pillNodes2 = this.processFreeTextQuestion(element);
        this.addSequentialRelation(pillNodes2, pill);
        return {
          pillNode: pillNodes2,
          skip: false,
        };
      case 'multiple_choice_question':
        const pillNodes3 = this.processMultipleChoiceQuestion(
          element,
          variableToQuestionMap,
        );
        this.addSequentialRelation(pillNodes3, pill);
        return {
          pillNode: pillNodes3,
          skip: false,
        };
      case 'conditional':
        return {
          pillNode: this.processConditional(
            element,
            nextElement,
            pill,
            variableToQuestionMap,
          ),
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

  private processFreeTextQuestion(element: any): PillNode[] {
    const elements: PillNode[] = [];

    elements.push({
      id: element.id,
      type: ElementType.QUESTION,
      name: element.question,
      question_type: QuestionType.TEXTINPUT,
    });

    const appearTogetherElements = this.processAppearTogether(
      element.responses[0].objects[0],
    );
    elements.push(...appearTogetherElements);

    return elements;
  }

  private processMultipleChoiceQuestion(
    element: any,
    variableToQuestionMap: any,
  ): PillNode[] {
    const elements: PillNode[] = [];

    const options = element.options.map((response: any) => response.text);

    if (!variableToQuestionMap[element.save_to_variable])
      variableToQuestionMap[element.save_to_variable] = element;

    elements.push({
      id: element.id,
      type: ElementType.QUESTION,
      name: element.question,
      question_type: element.properties.may_select_multiple
        ? QuestionType.MULTIPLECHOICE
        : QuestionType.SINGLECHOICE,
      metadata: {
        options,
      },
    });

    element.options.forEach((response: any) => {
      const elements = this.processAppearTogether(response.objects[0]);
      elements.push(...elements);
    });

    return elements;
  }

  private processConditional(
    element: any,
    nextElement: any,
    pill: PillForm,
    variableToQuestionMap: any,
  ): PillNode[] {
    const elements: PillNode[] = [];

    element.branches.forEach((element: any) => {
      let skip = false;

      element.objects.forEach((object: any, array: any[], index: number) => {
        if (skip) {
          skip = false;
          return;
        }
        if (array.length === index) return;
        elements.push(
          ...this.processElement(
            object,
            array[index + 1],
            pill,
            variableToQuestionMap,
          ).pillNode,
        );
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
        const parentOption = parent.options.find(
          (option: any) => option.id === branchId,
        );
        pill.relations.push({
          from: parent.id,
          to: element.objects[0].id,
          condition: `ans = '${parentOption.text}'`,
        });
        pill.relations.push({
          from: element.objects[element.objects.length - 1].id,
          to: this.processElement(
            nextElement,
            null,
            pill,
            variableToQuestionMap,
          ).pillNode[0].id,
        });
      }
    });

    return elements;
  }
}
