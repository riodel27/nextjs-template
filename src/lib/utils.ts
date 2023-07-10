import { fireEvent, screen } from '@testing-library/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputField {
  role?: string;
  name?: RegExp;
  testId?: string;
  value: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidJSON(errorMessage: string) {
  try {
    return JSON.parse(errorMessage);
  } catch (_error) {
    return errorMessage;
  }
}

export function fillInputFields(fields: InputField[]) {
  fields.forEach((field) => {
    const { role, name, testId, value } = field;

    if (role) {
      fireEvent.input(screen.getByRole(role, { name }), {
        target: {
          value,
        },
      });
    } else if (testId) {
      fireEvent.input(screen.getByTestId(testId), {
        target: {
          value,
        },
      });
    }
  });
}
