'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { registerUser } from '@/services';
import { Eye, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface PasswordVisibility {
  password: boolean;
  confirmPassword: boolean;
}

const formSchema = z
  .object({
    name: z.string().min(5, {
      message: 'Name must be a minimum of 5 characters.',
    }),
    email: z.string().email({
      message: 'Please enter a valid email address.',
    }),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Password must contain at least one special character'
      )
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm Password must be at least 6 characters long'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'The passwords do not match.',
    path: ['confirmPassword'],
  });

export function RegisterForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    criteriaMode: 'all',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] =
    useState<PasswordVisibility>({
      password: false,
      confirmPassword: false,
    });

  const handleEyeClick = (fieldName: keyof PasswordVisibility) => {
    setIsPasswordVisible((prevState) => ({
      ...prevState,
      [fieldName]: !prevState[fieldName],
    }));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const response = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (response.status === 409) {
        setError('The provided email address is already registered.');
        return;
      }

      if (response.status === 500) {
        setError('Oops! Something went wrong. Please try again later.');
        return;
      }

      const signInResponse = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (signInResponse?.status === 200) {
        router.push('/?signup=success');
      }
    } catch (error: any) {
      console.error(error);
      setError('Oops! Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      {error && (
        <p className='mb-6 rounded bg-red-300 py-4 text-center'>{error}</p>
      )}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='w-full'
        data-cy='form'
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem className='mb-3'>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input data-cy='name' placeholder='shadcn' {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem className='mb-3'>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  data-cy='email'
                  placeholder='example@gmail.com'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='mb-3'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    data-cy='password'
                    type={isPasswordVisible.password ? 'text' : 'password'}
                    placeholder='******'
                    {...field}
                  />
                  <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                    <Eye
                      data-cy='show-password-icon'
                      className={
                        form.formState.dirtyFields['password']
                          ? 'visible'
                          : 'hidden'
                      }
                      onClick={() => handleEyeClick('password')}
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage showMultipleErrors />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem className='mb-3'>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    data-cy='confirm-password'
                    placeholder='******'
                    type={
                      isPasswordVisible.confirmPassword ? 'text' : 'password'
                    }
                    {...field}
                  />

                  <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
                    <Eye
                      className={
                        form.formState.dirtyFields['confirmPassword']
                          ? 'visible'
                          : 'hidden'
                      }
                      onClick={() => handleEyeClick('confirmPassword')}
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='grid place-items-center p-4'>
          <div className='flex justify-end gap-2'>
            {isLoading ? (
              <Button type='submit' disabled data-cy='sign-up-link'>
                <Loader2
                  className='mr-2 h-4 w-4 animate-spin'
                  data-cy='sign-up-loading'
                />
                Please wait
              </Button>
            ) : (
              <Button
                data-testid='create-button'
                type='submit'
                data-cy='sign-up-link'
              >
                Submit
              </Button>
            )}
          </div>

          <Button variant='link'>
            <Link data-cy='sign-in-link' href='/login'>
              Login
            </Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
