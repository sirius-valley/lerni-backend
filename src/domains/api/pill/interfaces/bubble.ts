export type BubbleDto =
  | {
      id: string;
      type: 'text';
      content: string;
    }
  | {
      id: string;
      type: 'free-text';
      content?: string | undefined;
    }
  | {
      id: string;
      type: 'image';
      content: string;
    }
  | {
      id: string;
      type: 'single-choice';
      options: string[];
      value: string;
    }
  | {
      id: string;
      type: 'multiple-choice';
      options: string[];
      value: string[];
    }
  | {
      id: string;
      type: 'carousel';
      options: string[];
      value: string[];
      optionDescriptions: string[];
    };
