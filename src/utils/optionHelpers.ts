
import { nanoid } from 'nanoid';

export interface OptionWithId {
  id: string;
  label: string;
}

export const createOptionWithId = (label: string = ''): OptionWithId => ({
  id: nanoid(),
  label
});

export const convertStringArrayToOptions = (options: string[]): OptionWithId[] => {
  return options.map(label => createOptionWithId(label));
};

export const convertOptionsToStringArray = (options: OptionWithId[]): string[] => {
  return options.map(option => option.label);
};
