"use client";
import { useRouter } from 'next/navigation';

import HydrationFix from '../hydrationFix';
import { Comfortaa } from 'next/font/google';
import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { validatePassword } from '@/lib/validators/passwordValidator';
import { validateEmail } from '@/lib/validators/emailValidator';

const comfortaa = Comfortaa({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const router = useRouter();


  // Form validation states
  const [email, setEmail] = useState('');
  const [email2, setEmail2] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailError2, setEmailError2] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordError2, setPasswordError2] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Step 2 - Details form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [dobError, setDobError] = useState('');

  // Step 3 - Confirmation states
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  // const [agreedToMarketing, setAgreedToMarketing] = useState(false);

  const isStep1Valid = () => {
    return (
      email !== '' &&
      email2 !== '' &&
      password !== '' &&
      password2 !== '' &&
      email === email2 &&
      password === password2 &&
      !emailError &&
      !emailError2 &&
      !passwordError &&
      !passwordError2
    );
  };

  const isStep2Valid = () => {
    return (
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      phoneNumber.trim() !== '' &&
      dateOfBirth !== '' &&
      !firstNameError &&
      !lastNameError &&
      !phoneError &&
      !dobError
    );
  };

  const isStep3Valid = () => {
    return true;
  };

  // Validation functions for step 2
  const validateName = (name: string, field: string) => {
    if (name.trim().length < 2) {
      return `${field} must be at least 2 characters long`;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return `${field} can only contain letters, spaces, hyphens, and apostrophes`;
    }
    return '';
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/[\s()-]/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return '';
  };

  const validateDateOfBirth = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 13) {
      return 'You must be at least 13 years old to register';
    }
    if (age > 120) {
      return 'Please enter a valid date of birth';
    }
    return '';
  };

  const handleNextStep = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && isStep2Valid()) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (currentStep === 1) {
      // Validate step 1
      setFormSubmitted(true);

      const emailValidationResult = validateEmail(email);
      setEmailError(emailValidationResult ?? '');
      const isEmailValid = !emailValidationResult;

      if (email !== email2) {
        setEmailError2("Emails do not match");
        return;
      }

      const passwordValidationResult = validatePassword(password);
      setPasswordError(passwordValidationResult ?? '');
      const isPasswordValid = !passwordValidationResult;

      if (password !== password2) {
        setPasswordError2("Passwords do not match");
        return;
      }

      if (isEmailValid && isPasswordValid) {
        handleNextStep();
      }
    } else if (currentStep === 2) {
      // Validate step 2
      const firstNameValidation = validateName(firstName, 'First name');
      const lastNameValidation = validateName(lastName, 'Last name');
      const phoneValidation = validatePhone(phoneNumber);
      const dobValidation = validateDateOfBirth(dateOfBirth);

      setFirstNameError(firstNameValidation);
      setLastNameError(lastNameValidation);
      setPhoneError(phoneValidation);
      setDobError(dobValidation);

      if (!firstNameValidation && !lastNameValidation && !phoneValidation && !dobValidation) {
        handleNextStep();
      }
    } else if (currentStep === 3) {
      // Final submission
      if (!agreedToTerms) {
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch('/api/API', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'register',
            username: firstName, // or combine firstName + lastName if desired
            email,
            password,
            lastName,
            phoneNo: phoneNumber,
            dateOfBirth,
          }),
        });

        try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Registration successful', {
          email,
          firstName,
          lastName,
          phoneNumber,
          dateOfBirth,
          // agreedToMarketing,
          password: password
        });

      } catch (error) {
        console.error('Registration failed', error);
      } finally {
        setIsLoading(false);
      }

        const result = await response.json();

        if (result.success) {
          console.log('[REGISTER SUCCESS]', result.user);
          router.push('/login');
        } else {
          console.warn('[REGISTER FAILED]', result.message);
        }
      } catch (error) {
        console.error('[REGISTER ERROR]', error);
      } finally {
        setIsLoading(false);
      }


      
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Create your account";
      case 2: return "Tell us about yourself";
      case 3: return "Almost done!";
      default: return "Create your account";
    }
  };

  const renderStep1 = () => (
    <>
      {/* Email section */}
      <div>
        <label htmlFor="email-primary" className="block text-sm font-medium text-gray-700 dark:text-amber-100 mb-1.5">
          Email
        </label>
        <input
          id="email-primary"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            const value = e.target.value;
            setEmail(value);
            if (formSubmitted) {
              const error = validateEmail(value);
              setEmailError(error ?? '');
            }
          }}
          onBlur={() => {
            const error = validateEmail(email);
            setEmailError(error ?? '');
          }}
          className={`w-full px-4 py-2.5 border ${emailError ? 'border-red-400 dark:border-red-600' : 'border-amber-200 dark:border-amber-900'} rounded-lg bg-amber-50 dark:bg-amber-900/30 text-brown-800 dark:text-amber-100 placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 ${emailError ? 'focus:ring-red-400' : 'focus:ring-amber-600'}`}
          aria-invalid={emailError ? "true" : "false"}
          aria-describedby={emailError ? "email-error" : undefined}
        />
        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">We&apos;ll send a verification link to this address</p>
        {emailError && (
          <p id="email-error" className="mt-1 text-sm text-red-500 dark:text-red-400">
            {emailError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email-confirm" className="block text-sm font-medium text-gray-700 dark:text-amber-100 mb-1.5">
          Confirm Email
        </label>
        <input
          id="email-confirm"
          type="email"
          placeholder="you@example.com"
          value={email2}
          onChange={(e) => {
            const value = e.target.value;
            setEmail2(value);
            if (formSubmitted) {
              setEmailError2(email !== value ? "Emails do not match" : "");
            }
          }}
          onBlur={() => {
            setEmailError2(email !== email2 ? "Emails do not match" : "");
          }}
          className={`w-full px-4 py-2.5 border ${emailError2 ? 'border-red-400 dark:border-red-600' : 'border-amber-200 dark:border-amber-900'} rounded-lg bg-amber-50 dark:bg-amber-900/30 text-brown-800 dark:text-amber-100 placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 ${emailError2 ? 'focus:ring-red-400' : 'focus:ring-amber-600'}`}
          aria-invalid={emailError2 ? "true" : "false"}
          aria-describedby={emailError2 ? "email-confirm-error" : undefined}
        />
        {emailError2 && (
          <p id="email-confirm-error" className="mt-1 text-sm text-red-500 dark:text-red-400">
            {emailError2}
          </p>
        )}
      </div>

      {/* Password section */}
      <div>
        <label htmlFor="password-primary" className="block text-sm font-medium text-gray-700 dark:text-amber-100 mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="password-primary"
            type={passwordVisible ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              const value = e.target.value;
              setPassword(value);
              if (formSubmitted) {
                const error = validatePassword(value);
                setPasswordError(error ?? '');
              }
            }}
            onBlur={() => {
              const error = validatePassword(password);
              setPasswordError(error ?? '');
            }}
            className={`w-full px-4 py-2.5 border ${passwordError ? 'border-red-400 dark:border-red-600' : 'border-amber-200 dark:border-amber-900'} rounded-lg bg-amber-50 dark:bg-amber-900/30 text-brown-800 dark:text-amber-100 placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 ${passwordError ? 'focus:ring-red-400' : 'focus:ring-amber-600'}`}
            aria-invalid={passwordError ? "true" : "false"}
            aria-describedby={passwordError ? "password-error" : undefined}
          />
          <button
            type="button"
            className="absolute right-3 top-2.5 text-amber-700 dark:text-amber-400"
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            {passwordVisible ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Must be at least 8 characters, contain an uppercase and a special character</p>
        {passwordError && (
          <p id="password-error" className="mt-1 text-sm text-red-500 dark:text-red-400">
            {passwordError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password-confirm" className="block text-sm font-medium text-gray-700 dark:text-amber-100 mb-1.5">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="password-confirm"
            type={confirmPasswordVisible ? "text" : "password"}
            placeholder="••••••••"
            value={password2}
            onChange={(e) => {
              const value = e.target.value;
              setPassword2(value);
              if (formSubmitted) {
                setPasswordError2(password !== value ? "Passwords do not match" : "");
              }
            }}
            onBlur={() => {
              setPasswordError2(password !== password2 ? "Passwords do not match" : "");
            }}
            className={`w-full px-4 py-2.5 border ${passwordError2 ? 'border-red-400 dark:border-red-600' : 'border-amber-200 dark:border-amber-900'} rounded-lg bg-amber-50 dark:bg-amber-900/30 text-brown-800 dark:text-amber-100 placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 ${passwordError2 ? 'focus:ring-red-400' : 'focus:ring-amber-600'}`}
            aria-invalid={passwordError2 ? "true" : "false"}
            aria-describedby={passwordError2 ? "password-confirm-error" : undefined}
          />
          <button
            type="button"
            className="absolute right-3 top-2.5 text-amber-700 dark:text-amber-400"
            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          >
            {confirmPasswordVisible ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
              </svg>
            )}
          </button>
        </div>
        {passwordError2 && (
          <p id="password-confirm-error" className="mt-1 text-sm text-red-500 dark:text-red-400">
            {passwordError2}
          </p>
        )}
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-amber-100 mb-1.5">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            placeholder="John"
            value={firstName}
            onChange={(e) => {
              const value = e.target.value;
              setFirstName(value);
              const error = validateName(value, 'First name');
              setFirstNameError(error);
            }}
            className={`w-full px-4 py-2.5 border ${firstNameError ? 'border-red-400 dark:border-red-600' : 'border-amber-200 dark:border-amber-900'} rounded-lg bg-amber-50 dark:bg-amber-900/30 text-brown-800 dark:text-amber-100 placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 ${firstNameError ? 'focus:ring-red-400' : 'focus:ring-amber-600'}`}
          />
          {firstNameError && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
              {firstNameError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-amber-100 mb-1.5">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => {
              const value = e.target.value;
              setLastName(value);
              const error = validateName(value, 'Last name');
              setLastNameError(error);
            }}
            className={`w-full px-4 py-2.5 border ${lastNameError ? 'border-red-400 dark:border-red-600' : 'border-amber-200 dark:border-amber-900'} rounded-lg bg-amber-50 dark:bg-amber-900/30 text-brown-800 dark:text-amber-100 placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 ${lastNameError ? 'focus:ring-red-400' : 'focus:ring-amber-600'}`}
          />
          {lastNameError && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
              {lastNameError}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-amber-100 mb-1.5">
          Phone Number
        </label>
        <input
          id="phoneNumber"
          type="tel"
          placeholder="012 345 6789"
          value={phoneNumber}
          onChange={(e) => {
            const value = e.target.value;
            setPhoneNumber(value);
            const error = validatePhone(value);
            setPhoneError(error);
          }}
          className={`w-full px-4 py-2.5 border ${phoneError ? 'border-red-400 dark:border-red-600' : 'border-amber-200 dark:border-amber-900'} rounded-lg bg-amber-50 dark:bg-amber-900/30 text-brown-800 dark:text-amber-100 placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 ${phoneError ? 'focus:ring-red-400' : 'focus:ring-amber-600'}`}
        />
        {phoneError && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">
            {phoneError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-amber-100 mb-1.5">
          Date of Birth
        </label>
        <input
          id="dateOfBirth"
          type="date"
          value={dateOfBirth}
          onChange={(e) => {
            const value = e.target.value;
            setDateOfBirth(value);
            const error = validateDateOfBirth(value);
            setDobError(error);
          }}
          className={`w-full px-4 py-2.5 border ${dobError ? 'border-red-400 dark:border-red-600' : 'border-amber-200 dark:border-amber-900'} rounded-lg bg-amber-50 dark:bg-amber-900/30 text-brown-800 dark:text-amber-100 focus:outline-none focus:ring-2 ${dobError ? 'focus:ring-red-400' : 'focus:ring-amber-600'}`}
        />
        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">You must be at least 13 years old to register</p>
        {dobError && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">
            {dobError}
          </p>
        )}
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div className="space-y-6">
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
          <h3 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Review Your Information</h3>
          <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
            <p><span className="font-medium">Email:</span> {email}</p>
            <p><span className="font-medium">Name:</span> {firstName} {lastName}</p>
            <p><span className="font-medium">Phone:</span> {phoneNumber}</p>
            <p><span className="font-medium">Date of Birth:</span> {dateOfBirth}</p>
          </div>
        </div>

        {/* ✅ Insert checkbox here */}
        <div className="mt-4">
          <label className="flex items-center space-x-2 text-sm text-amber-900 dark:text-amber-100">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="accent-amber-600"
            />
            <span>I agree to the terms and conditions</span>
          </label>
        </div>
      </div>
    </>
  );


  return (
    <HydrationFix>
      <main className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 py-8 px-4 ${comfortaa.className}`}>
        <div className="w-full max-w-md p-6 md:p-8 bg-white dark:bg-[#1a1310] rounded-xl shadow-lg border border-amber-200 dark:border-amber-900 relative">

          {/* Logo & Header section */}
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-700 flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
                  <path d="M2 21h18v-2H2v2zm6-4h10c2.21 0 4-1.79 4-4v-3c0-2.21-1.79-4-4-4H8v14h4v-3zm10-10c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2H10V7h8z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-1 text-brown-800 dark:text-amber-100">DieKoffieBlik</h2>
            <p className="text-center text-amber-800 dark:text-amber-300 font-medium text-sm mb-2">{getStepTitle()}</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="w-full bg-amber-100 dark:bg-amber-900/30 h-1 rounded-full">
                <div
                  className="bg-amber-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1 text-amber-700 dark:text-amber-400">
                <span className={currentStep >= 1 ? 'font-medium' : 'opacity-50'}>Account</span>
                <span className={currentStep >= 2 ? 'font-medium' : 'opacity-50'}>Details</span>
                <span className={currentStep >= 3 ? 'font-medium' : 'opacity-50'}>Confirm</span>
              </div>
            </div>

            {/* Render current step */}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex-1 py-3 px-4 rounded-lg border border-amber-300 dark:border-amber-700 bg-transparent text-amber-700 dark:text-amber-300 font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition duration-200 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                    <path d="M12 20l1.41-1.41L7.83 13H20v-2H7.83l5.58-5.59L12 4l-8 8z" />
                  </svg>
                  Back
                </button>
              )}

              <button
                type="submit"
                disabled={
                  (currentStep === 1 && !isStep1Valid()) ||
                  (currentStep === 2 && !isStep2Valid()) ||
                  (currentStep === 3 && (!isStep3Valid() || isLoading))
                }
                className={`${currentStep > 1 ? 'flex-1' : 'w-full'} py-3 px-4 rounded-lg transition duration-200 font-medium shadow-md flex items-center justify-center 
                  ${(currentStep === 1 && !isStep1Valid()) ||
                    (currentStep === 2 && !isStep2Valid()) ||
                    (currentStep === 3 && (!isStep3Valid() || isLoading))
                    ? 'bg-amber-400 cursor-not-allowed opacity-50'
                    : 'bg-amber-700 hover:bg-amber-800 hover:shadow-lg'
                  }
                  text-white`}
              >
                <span>
                  {currentStep === 3
                    ? (isLoading ? 'Creating Account...' : 'Create Account')
                    : 'Next'
                  }
                </span>
                {!isLoading && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-2">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="text-sm text-center text-gray-600 dark:text-amber-300/70 mt-6">
              <Link href="/login" className="hover:text-amber-800 dark:hover:text-amber-200 transition-colors">
                Already have an account? <span className="font-medium">Login</span>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </HydrationFix>
  );
}