'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { isValidJSON } from '@/lib/utils';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export function LoginForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError('');
    try {
      const user = await signIn('credentials', {
        email: values.email,
        password: values.password,
        /**
         *  I'm avoiding the use of 'redirect true' in this instance since it appears
         *  to interfere with the functionality of the notification toast component."
         */
        redirect: false,
      });

      if (user?.error) {
        const errorResponse = isValidJSON(user?.error);

        if (errorResponse) {
          if (errorResponse.status === 423) {
            setError(errorResponse.message);
            return;
          }
          setError('Invalid login credentials');
          return;
        }
      }

      router.push('/?signin=success');
    } catch (error) {
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
                    type={showPassword ? 'text' : 'password'}
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
                      onClick={handleTogglePassword}
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage showMultipleErrors />
            </FormItem>
          )}
        />

        <div className='grid place-items-center p-4'>
          <div className='flex justify-end gap-2'>
            {isLoading ? (
              <Button type='submit' disabled data-cy='sign-in-link'>
                <Loader2
                  className='mr-2 h-4 w-4 animate-spin'
                  data-cy='sign-in-loading'
                />
                Please wait
              </Button>
            ) : (
              <Button type='submit' data-cy='sign-in-link'>
                Submit
              </Button>
            )}
          </div>

          <Button variant='link'>
            <Link data-cy='sign-up-link' href='/register'>
              Sign Up
            </Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
