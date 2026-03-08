export type WizardSelectOption<T = string> = {
  value: T;
  label: string;
  hint?: string;
};

export type WizardPrompter = {
  intro: (message: string) => Promise<void>;
  outro: (message: string) => Promise<void>;
  note: (message: string, title?: string) => Promise<void>;
  select: <T extends string>(params: {
    message: string;
    options: readonly WizardSelectOption<T>[];
    initialValue?: T;
  }) => Promise<T>;
  multiselect: <T extends string>(params: {
    message: string;
    options: readonly WizardSelectOption<T>[];
    initialValue?: readonly T[];
    required?: boolean;
  }) => Promise<readonly T[]>;
  text: (params: {
    message: string;
    placeholder?: string;
    initialValue?: string;
    validate?: (value: string) => string | void;
    defaultValue?: string;
  }) => Promise<string>;
  confirm: (params: { message: string; initialValue?: boolean }) => Promise<boolean>;
  progress: (message: string) => { update: (message: string) => void; stop: (message?: string) => void };
};

export class WizardCancelledError extends Error {
  constructor(message = "Wizard cancelled") {
    super(message);
    this.name = "WizardCancelledError";
  }
}
