import { useGoogleOneTapLogin } from '@react-oauth/google';

useGoogleOneTapLogin({
  onSuccess: credentialResponse => {
    console.log('One-tap success:', credentialResponse);
    handleGoogleSuccess(credentialResponse);
  },
  onError: () => {
    console.log('One-Tap Login Failed');
  },
});