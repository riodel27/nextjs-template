import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as z from 'zod';

import { fillInputFields } from '@/lib/utils';
import { registerUser } from '@/services';
import { RegisterForm } from './form';

const INVALID_PASSWORD = 'password';
const INVALID_NAME = '';
const INVALID_PASSWORD_WITH_LESS_THAN_MIN_CHARACTER = '12345';
const INVALID_EMAIL = 'email';

const user = {
  name: 'randomuser',
  email: 'randomuser@gmail.com',
  password: 'P@ssword01',
};

const createButtonTestId = 'create-button';
const passwordInputTestId = 'password';
const confirmPasswordInputTestId = 'confirm-password';

/**
 * Replace the original function when it is called from the
 * component being tested. Jest's mocking capabilities work by intercepting
 * the calls to imported modules or functions, replacing them with the mock
 * implementation defined through jest.mock.
 */
jest.mock('../../../services', () => ({
  registerUser: jest.fn(),
}));

/**
 * This code fixes the error that commonly occurs when testing components using the useRouter hook from Next.js.
 *
 * By using jest.mock, we can mock the 'next/navigation' module and replace the useRouter function with a Jest mock function.
 */
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('RegisterForm', () => {
  it('should display required error when value is invalid', async () => {
    render(<RegisterForm />);
    fireEvent.submit(screen.getByTestId(createButtonTestId));

    const alerts = await screen.findAllByRole('alert');

    expect(alerts).toHaveLength(4);

    expect(registerUser).not.toBeCalled();
  });

  it('should display matching error when name is invalid', async () => {
    render(<RegisterForm />);
    const inputFields = [
      { role: 'textbox', name: /name/i, value: INVALID_NAME },
      { role: 'textbox', name: /email/i, value: user.email },
      { testId: passwordInputTestId, value: user.password },
      { testId: confirmPasswordInputTestId, value: user.password },
    ];

    fillInputFields(inputFields);

    fireEvent.submit(screen.getByTestId(createButtonTestId));

    const alerts = await screen.findByRole('alert');

    expect(alerts).toBeInTheDocument();

    expect(registerUser).not.toBeCalled();
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue(
      user.email
    );
    expect(screen.getByTestId(passwordInputTestId)).toHaveValue(user.password);
    expect(screen.getByTestId(confirmPasswordInputTestId)).toHaveValue(
      user.password
    );
  });

  it('should display matching error when email is invalid', async () => {
    render(<RegisterForm />);
    const inputFields = [
      { role: 'textbox', name: /name/i, value: user.name },
      { role: 'textbox', name: /email/i, value: INVALID_EMAIL },
      { testId: passwordInputTestId, value: user.password },
      { testId: confirmPasswordInputTestId, value: user.password },
    ];

    fillInputFields(inputFields);

    fireEvent.submit(screen.getByTestId(createButtonTestId));

    const alerts = await screen.findByRole('alert');

    expect(alerts).toBeInTheDocument();

    expect(registerUser).not.toBeCalled();
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue(
      user.name
    );
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue(
      INVALID_EMAIL
    );
    expect(screen.getByTestId(passwordInputTestId)).toHaveValue(user.password);
    expect(screen.getByTestId(confirmPasswordInputTestId)).toHaveValue(
      user.password
    );
  });

  it('should display matching error when password is invalid', async () => {
    render(<RegisterForm />);
    const inputFields = [
      { role: 'textbox', name: /name/i, value: user.name },
      { role: 'textbox', name: /email/i, value: user.email },
      { testId: passwordInputTestId, value: INVALID_PASSWORD },
      { testId: confirmPasswordInputTestId, value: INVALID_PASSWORD },
    ];

    fillInputFields(inputFields);

    fireEvent.submit(screen.getByTestId(createButtonTestId));

    const alerts = await screen.findByRole('alert');

    expect(alerts).toBeInTheDocument();

    expect(registerUser).not.toBeCalled();
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue(
      user.name
    );
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue(
      user.email
    );
    expect(screen.getByTestId(passwordInputTestId)).toHaveValue(
      INVALID_PASSWORD
    );
    expect(screen.getByTestId(confirmPasswordInputTestId)).toHaveValue(
      INVALID_PASSWORD
    );
  });

  it('should display matching error when confirm password is invalid', async () => {
    render(<RegisterForm />);
    const inputFields = [
      { role: 'textbox', name: /name/i, value: user.name },
      { role: 'textbox', name: /email/i, value: user.email },
      { testId: passwordInputTestId, value: user.password },
      { testId: confirmPasswordInputTestId, value: INVALID_PASSWORD },
    ];

    fillInputFields(inputFields);

    fireEvent.submit(screen.getByTestId(createButtonTestId));

    const alerts = await screen.findByRole('alert');

    expect(alerts).toBeInTheDocument();

    expect(registerUser).not.toBeCalled();

    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue(
      user.name
    );
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue(
      user.email
    );
    expect(screen.getByTestId(passwordInputTestId)).toHaveValue(user.password);
    expect(screen.getByTestId(confirmPasswordInputTestId)).toHaveValue(
      INVALID_PASSWORD
    );
  });

  it('should not display error when value is valid', async () => {
    render(<RegisterForm />);
    const inputFields = [
      { role: 'textbox', name: /name/i, value: user.name },
      { role: 'textbox', name: /email/i, value: user.email },
      { testId: passwordInputTestId, value: user.password },
      { testId: confirmPasswordInputTestId, value: user.password },
    ];

    fillInputFields(inputFields);

    fireEvent.submit(screen.getByTestId(createButtonTestId));

    const alerts = screen.queryByRole('alert');

    // no errors since all inputs are valid.
    expect(alerts).not.toBeInTheDocument();

    /**
     * The mock implementation is used to mock the registerUser function
     * and simulate its behavior without making a network request.
     * This allows checking if the registerUser function is called with arguments
     * while skipping the actual network communication.
     */
    (registerUser as jest.Mock).mockImplementation(() => {
      // Custom mock implementation logic
      return Promise.resolve(); // Return a resolved promise or desired value
    });

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        name: user.name,
        email: user.email,
        password: user.password,
      });
    });

    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue(
      user.name
    );
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue(
      user.email
    );
    expect(screen.getByTestId(passwordInputTestId)).toHaveValue(user.password);
    expect(screen.getByTestId(confirmPasswordInputTestId)).toHaveValue(
      user.password
    );
  });

  describe('Password strength validation', () => {
    it('should return false for a password with less than 6 characters', () => {
      render(<RegisterForm />);

      const inputFields = [
        {
          testId: passwordInputTestId,
          value: INVALID_PASSWORD_WITH_LESS_THAN_MIN_CHARACTER,
        },
      ];

      fillInputFields(inputFields);

      const passwordSchema = z
        .string()
        .min(6, 'Password must be at least 6 characters long');

      const isValidPassword = passwordSchema.safeParse(
        (screen.getByTestId(passwordInputTestId) as HTMLInputElement).value
      );

      expect(isValidPassword.success).toBe(false);
    });

    it('should return false for a password without number', () => {
      render(<RegisterForm />);

      const inputFields = [
        {
          testId: passwordInputTestId,
          value: INVALID_PASSWORD,
        },
      ];

      fillInputFields(inputFields);

      const passwordSchema = z
        .string()
        .regex(/[0-9]/, 'Password must contain at least one number');

      const isValidPassword = passwordSchema.safeParse(
        (screen.getByTestId(passwordInputTestId) as HTMLInputElement).value
      );

      expect(isValidPassword.success).toBe(false);
    });

    it('should return false for a password without special character', () => {
      render(<RegisterForm />);

      const inputFields = [
        {
          testId: passwordInputTestId,
          value: INVALID_PASSWORD,
        },
      ];

      fillInputFields(inputFields);

      const passwordSchema = z
        .string()
        .regex(
          /[!@#$%^&*(),.?":{}|<>]/,
          'Password must contain at least one special character'
        );

      const isValidPassword = passwordSchema.safeParse(
        (screen.getByTestId(passwordInputTestId) as HTMLInputElement).value
      );

      expect(isValidPassword.success).toBe(false);
    });

    it('should return false for a password without uppercase letters', () => {
      render(<RegisterForm />);

      const inputFields = [
        {
          testId: passwordInputTestId,
          value: INVALID_PASSWORD,
        },
      ];

      fillInputFields(inputFields);

      const passwordSchema = z
        .string()
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter');

      const isValidPassword = passwordSchema.safeParse(
        (screen.getByTestId(passwordInputTestId) as HTMLInputElement).value
      );

      expect(isValidPassword.success).toBe(false);
    });
  });
});
