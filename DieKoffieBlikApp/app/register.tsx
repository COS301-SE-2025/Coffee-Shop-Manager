import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CoffeeLoading from "../assets/loading";

const API_BASE_URL = "http://192.168.101.124:5000";

// Web-compatible DateTimePicker component
const WebDatePicker = ({ value, onChange, style, textStyle }: {
  value: Date;
  onChange: (date: Date) => void;
  style?: any;
  textStyle?: any;
}) => {
  if (Platform.OS === 'web') {
    return (
      <input
        type="date"
        value={value.toISOString().split('T')[0]}
        onChange={(e) => {
          const newDate = new Date(e.target.value);
          onChange(newDate);
        }}
        style={{
          width: '100%',
          padding: 12,
          border: '1px solid #fed7aa',
          borderRadius: 8,
          backgroundColor: '#fffbeb',
          color: '#451a03',
          fontSize: 16,
          fontFamily: 'inherit',
          ...style,
        }}
      />
    );
  }
  
  // For native platforms, you would import and use the actual DateTimePicker
  // import DateTimePicker from '@react-native-community/datetimepicker';
  return null; // Placeholder for native implementation
};

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
};

const validatePassword = (password: string) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password must contain at least one special character";
  }
  return null;
};

export default function RegisterScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Form validation states
  const [email, setEmail] = useState("");
  const [email2, setEmail2] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailError2, setEmailError2] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordError2, setPasswordError2] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Step 2 - Details form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [dobError, setDobError] = useState('');

  // Step 3 - Confirmation states
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToMarketing, setAgreedToMarketing] = useState(false);

  const router = useRouter();

  const isStep1Valid = () => {
    return (
      email !== "" &&
      email2 !== "" &&
      password !== "" &&
      password2 !== "" &&
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
      dateOfBirth !== null &&
      !firstNameError &&
      !lastNameError &&
      !phoneError &&
      !dobError
    );
  };

  const isStep3Valid = () => {
    return agreedToTerms;
  };

  // Validation functions for step 2
  const validateName = (name: string, field: string) => {
    if (name.trim().length < 2) {
      return `${field} must be at least 2 characters long`;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return `${field} can only contain letters, spaces, hyphens, and apostrophes`;
    }
    return "";
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/[\s()-]/g, ""))) {
      return "Please enter a valid phone number";
    }
    return "";
  };

  const validateDateOfBirth = (dob: Date) => {
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();
    
    // Calculate exact age
    let exactAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      exactAge--;
    }
    
    if (exactAge < 13) {
      return 'You must be at least 13 years old to register';
    }
    if (exactAge > 120) {
      return 'Please enter a valid date of birth';
    }
    return "";
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

  const handleDateChange = (selectedDate: Date) => {
    setDateOfBirth(selectedDate);
    const error = validateDateOfBirth(selectedDate);
    setDobError(error);
    
    // Hide date picker for native platforms
    if (Platform.OS !== 'web') {
      setShowDatePicker(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmit = async () => {
    if (currentStep === 1) {
      // Validate step 1
      setFormSubmitted(true);

      const emailValidationResult = validateEmail(email);
      setEmailError(emailValidationResult ?? "");
      const isEmailValid = !emailValidationResult;

      if (email !== email2) {
        setEmailError2("Emails do not match");
        return;
      } else {
        setEmailError2('');
      }

      const passwordValidationResult = validatePassword(password);
      setPasswordError(passwordValidationResult ?? "");
      const isPasswordValid = !passwordValidationResult;

      if (password !== password2) {
        setPasswordError2("Passwords do not match");
        return;
      } else {
        setPasswordError2('');
      }      
      if (isEmailValid && isPasswordValid && email === email2 && password === password2) {

        handleNextStep();
      }
    } else if (currentStep === 2) {
      // Validate step 2
      const firstNameValidation = validateName(firstName, "First name");
      const lastNameValidation = validateName(lastName, "Last name");
      const phoneValidation = validatePhone(phoneNumber);
      const dobValidation = validateDateOfBirth(dateOfBirth);

      setFirstNameError(firstNameValidation);
      setLastNameError(lastNameValidation);
      setPhoneError(phoneValidation);
      setDobError(dobValidation);

      if (
        !firstNameValidation &&
        !lastNameValidation &&
        !phoneValidation &&
        !dobValidation
      ) {
        handleNextStep();
      }
    } else if (currentStep === 3) {
      if (!agreedToTerms) {
        Alert.alert('Error', 'Please agree to the terms and conditions');
        return;
      }

      setIsLoading(true);

      try {

        const response = await fetch(`${API_BASE_URL}/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
            username: firstName, // Your backend expects 'username', so sending firstName
          }),
          credentials: "include",
        });

        const result = await response.json();

        if (result.success) {
          Alert.alert(
            "Success",
            result.message || "User registered successfully!"
          );
          router.replace("/login");
        } else {
          Alert.alert("Error", result.message || "Registration failed");
        }
      } catch (error: any) {
        console.error("Registration failed", error);
        Alert.alert("Error", "Could not connect to the server.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Create your account";
      case 2:
        return "Tell us about yourself";
      case 3:
        return "Almost done!";
      default:
        return "Create your account";
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      {/* Email section */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, emailError ? styles.inputError : null]}
          placeholder="you@example.com"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            if (formSubmitted) {
              const error = validateEmail(value);
              setEmailError(error ?? "");
            }
          }}
          onBlur={() => {
            const error = validateEmail(email);
            setEmailError(error ?? "");
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Text style={styles.helperText}>
          We'll send a verification link to this address
        </Text>
        {emailError && <Text style={styles.errorText}>{emailError}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Email</Text>
        <TextInput
          style={[styles.input, emailError2 ? styles.inputError : null]}
          placeholder="you@example.com"
          value={email2}
          onChangeText={(value) => {
            setEmail2(value);
            if (formSubmitted) {
              setEmailError2(email !== value ? "Emails do not match" : "");
            }
          }}
          onBlur={() => {
            setEmailError2(email !== email2 ? "Emails do not match" : "");
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {emailError2 && <Text style={styles.errorText}>{emailError2}</Text>}
      </View>

      {/* Password section */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.passwordInput,
              passwordError ? styles.inputError : null,
            ]}
            placeholder="••••••••"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (formSubmitted) {
                const error = validatePassword(value);
                setPasswordError(error ?? "");
              }
            }}
            onBlur={() => {
              const error = validatePassword(password);
              setPasswordError(error ?? "");
            }}
            secureTextEntry={!passwordVisible}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Ionicons
              name={passwordVisible ? "eye" : "eye-off"}
              size={20}
              color="#b45309"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.helperText}>
          Must be at least 8 characters, contain an uppercase and a special
          character
        </Text>
        {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.passwordInput,
              passwordError2 ? styles.inputError : null,
            ]}
            placeholder="••••••••"
            value={password2}
            onChangeText={(value) => {
              setPassword2(value);
              if (formSubmitted) {
                setPasswordError2(
                  password !== value ? "Passwords do not match" : ""
                );
              }
            }}
            onBlur={() => {
              setPasswordError2(
                password !== password2 ? "Passwords do not match" : ""
              );
            }}
            secureTextEntry={!confirmPasswordVisible}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          >
            <Ionicons
              name={confirmPasswordVisible ? "eye" : "eye-off"}
              size={20}
              color="#b45309"
            />
          </TouchableOpacity>
        </View>
        {passwordError2 && (
          <Text style={styles.errorText}>{passwordError2}</Text>
        )}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.nameRow}>
        <View style={[styles.inputContainer, styles.nameInput]}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={[styles.input, firstNameError ? styles.inputError : null]}
            placeholder="John"
            value={firstName}
            onChangeText={(value) => {
              setFirstName(value);
              const error = validateName(value, "First name");
              setFirstNameError(error);
            }}
            autoCapitalize="words"
          />
          {firstNameError && (
            <Text style={styles.errorText}>{firstNameError}</Text>
          )}
        </View>

        <View style={[styles.inputContainer, styles.nameInput]}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={[styles.input, lastNameError ? styles.inputError : null]}
            placeholder="Doe"
            value={lastName}
            onChangeText={(value) => {
              setLastName(value);
              const error = validateName(value, "Last name");
              setLastNameError(error);
            }}
            autoCapitalize="words"
          />
          {lastNameError && (
            <Text style={styles.errorText}>{lastNameError}</Text>
          )}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={[styles.input, phoneError ? styles.inputError : null]}
          placeholder="012 345 6789"
          value={phoneNumber}
          onChangeText={(value) => {
            setPhoneNumber(value);
            const error = validatePhone(value);
            setPhoneError(error);
          }}
          keyboardType="phone-pad"
        />
        {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date of Birth</Text>
        {Platform.OS === 'web' ? (
          <WebDatePicker
            value={dateOfBirth}
            onChange={handleDateChange}
            style={dobError ? { borderColor: '#f87171' } : {}}
          />
        ) : (
          <TouchableOpacity
            style={[styles.datePickerButton, dobError ? styles.inputError : null]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerText}>
              {formatDate(dateOfBirth)}
            </Text>
            <Ionicons name="calendar" size={20} color="#b45309" />
          </TouchableOpacity>
        )}
        <Text style={styles.helperText}>You must be at least 13 years old to register</Text>
        {dobError && <Text style={styles.errorText}>{dobError}</Text>}

        {/* For native platforms, you would uncomment and use the actual DateTimePicker */}
        {/* {showDatePicker && Platform.OS !== 'web' && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              if (Platform.OS === 'android') {
                setShowDatePicker(false);
              }
              if (selectedDate) {
                handleDateChange(selectedDate);
              }
            }}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          />
        )} */}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.reviewContainer}>
        <Text style={styles.reviewTitle}>Review Your Information</Text>
        <View style={styles.reviewContent}>
          <Text style={styles.reviewItem}><Text style={styles.reviewLabel}>Email:</Text> {email}</Text>
          <Text style={styles.reviewItem}><Text style={styles.reviewLabel}>Name:</Text> {firstName} {lastName}</Text>
          <Text style={styles.reviewItem}><Text style={styles.reviewLabel}>Phone:</Text> {phoneNumber}</Text>
          <Text style={styles.reviewItem}><Text style={styles.reviewLabel}>Date of Birth:</Text> {formatDate(dateOfBirth)}</Text>
        </View>
      </View>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        >
          <View
            style={[
              styles.checkboxBox,
              agreedToTerms && styles.checkboxChecked,
            ]}
          >
            {agreedToTerms && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
          <Text style={styles.checkboxText}>
            I agree to the Terms and Conditions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAgreedToMarketing(!agreedToMarketing)}
        >
          <View
            style={[
              styles.checkboxBox,
              agreedToMarketing && styles.checkboxChecked,
            ]}
          >
            {agreedToMarketing && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
          <Text style={styles.checkboxText}>
            I agree to receive marketing communications
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            {/* Logo & Header */}
            <View style={styles.header}>
              <View style={styles.logo}>
                <Ionicons name="cafe" size={40} color="white" />
              </View>
              <Text style={styles.title}>DieKoffieBlik</Text>
              <Text style={styles.subtitle}>{getStepTitle()}</Text>
            </View>

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(currentStep / 3) * 100}%` },
                  ]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text
                  style={[
                    styles.progressLabel,
                    currentStep >= 1 && styles.progressLabelActive,
                  ]}
                >
                  Account
                </Text>
                <Text
                  style={[
                    styles.progressLabel,
                    currentStep >= 2 && styles.progressLabelActive,
                  ]}
                >
                  Details
                </Text>
                <Text
                  style={[
                    styles.progressLabel,
                    currentStep >= 3 && styles.progressLabelActive,
                  ]}
                >
                  Confirm
                </Text>
              </View>
            </View>

            {/* Render current step */}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation buttons */}
            <View style={styles.buttonContainer}>
              {currentStep > 1 && (
                <TouchableOpacity
                  style={[styles.button, styles.backButton]}
                  onPress={handlePrevStep}
                >
                  <Ionicons name="arrow-back" size={20} color="#b45309" />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.nextButton,
                  currentStep > 1 && styles.nextButtonFlex,
                  ((currentStep === 1 && !isStep1Valid()) ||
                    (currentStep === 2 && !isStep2Valid()) ||
                    (currentStep === 3 && (!isStep3Valid() || isLoading))) &&
                    styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={
                  (currentStep === 1 && !isStep1Valid()) ||
                  (currentStep === 2 && !isStep2Valid()) ||
                  (currentStep === 3 && (!isStep3Valid() || isLoading))
                }
              >
                {isLoading ? (
                  <CoffeeLoading visible={isLoading} />
                ) : (
                  <>
                    <Text style={styles.nextButtonText}>
                      {currentStep === 3 ? "Create Account" : "Next"}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.loginLink}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkBold}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fef3c7",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#b45309",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#451a03",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#b45309",
    fontWeight: "500",
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#fef3c7",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#d97706",
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: "#b45309",
    opacity: 0.5,
  },
  progressLabelActive: {
    opacity: 1,
    fontWeight: "500",
  },
  stepContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fffbeb",
    color: "#451a03",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#f87171",
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 8,
    padding: 12,
    paddingRight: 50,
    backgroundColor: "#fffbeb",
    color: "#451a03",
    fontSize: 16,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#b45309",
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 4,
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fffbeb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    color: '#451a03',
    fontSize: 16,
  },
  reviewContainer: {
    backgroundColor: "#fffbeb",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#b45309",
    marginBottom: 12,
  },
  reviewContent: {
    gap: 4,
  },
  reviewItem: {
    fontSize: 14,
    color: "#b45309",
  },
  reviewLabel: {
    fontWeight: "500",
  },
  checkboxContainer: {
    gap: 16,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#d97706",
    borderRadius: 4,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#d97706",
  },
  checkboxText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  backButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#fed7aa",
    backgroundColor: "transparent",
  },
  backButtonText: {
    color: "#b45309",
    fontWeight: "500",
  },
  nextButton: {
    backgroundColor: "#b45309",
  },
  nextButtonFlex: {
    flex: 1,
  },
  nextButtonText: {
    color: "white",
    fontWeight: "500",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loginLink: {
    alignItems: "center",
  },
  loginLinkText: {
    fontSize: 14,
    color: "#6b7280",
  },
  loginLinkBold: {
    fontWeight: "500",
    color: "#b45309",
  },
});
