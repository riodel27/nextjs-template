'use client';

import { useToast } from '@/components/ui/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function Notification() {
  const searchParams = useSearchParams() as any;
  const router = useRouter();

  const { toast } = useToast();

  const signUpParams = searchParams.get('signup');
  const signInParams = searchParams.get('signin');

  useEffect(() => {
    if (signUpParams === 'success') {
      toast({
        title: 'Success!',
        description: 'Signup Successful!',
        variant: 'success',
      });
      router.push('/');
    }

    if (signInParams === 'success') {
      toast({
        title: 'Success!',
        description: 'SignIn Successful!',
        variant: 'success',
      });
      router.push('/');
    }

    return () => {
      // Perform cleanup when component is unmounted or effect is re-run
    };
  }, [signUpParams, signInParams]);

  return <></>;
}
