const parse = (response) => JSON.parse(response);

function requestData(method, URL) {
  const xml = new XMLHttpRequest();
  xml.open(method, URL);
  xml.send();

  return new Promise((resolve, reject) => {
    xml.addEventListener('readystatechange', () => {
      if (xml.readyState === 4) {
        xml.status < 400 ? resolve(parse(xml.response)) : reject(xml.status);
      }
    });
  });
}

requestData('GET', 'userData.json')
  .then((userData) => {
    console.log(userData);

    return requestData('GET', 'bankData.json')
      .then((bankData) => {
        console.log(bankData);
        return getMoney(userData, bankData);
      });
  })
  .finally(() => {
    console.log('Thank you, have a nice day 😊');
  })
  .catch((error) => {
    console.error(error);
  });

function getMoney(userData, bankData) {
  return new Promise((resolve, reject) => {
    const viewBalance = confirm('View account balance?');
    if (viewBalance) {
      resolve(getBalance(userData));
    } else {
      reject(getCash(userData, bankData));
    }
  });
}

function getBalance(userData) {
  return new Promise((resolve, reject) => {
    let currency;
    do {
      currency = prompt('Enter currency to check balance:');
    } while (!userData.hasOwnProperty(currency.toUpperCase()));

    const balance = userData[currency.toUpperCase()];
    console.log(`Balance: ${balance} ${currency.toUpperCase()}`);
    reject(userData);
  });
}

function getCash(userData, bankData) {
  return new Promise((resolve, reject) => {
    let currency, amount;

    do {
      currency = prompt('Enter currency to withdraw:');
    } while (!userData.hasOwnProperty(currency.toUpperCase()));

    const currencyInfo = bankData[currency.toUpperCase()];
    if (!currencyInfo || currencyInfo.max === 0) {
      console.log('The entered currency is not supported or unavailable for withdrawal.');
      reject({ userData, bankData });
    } else {
      amount = parseFloat(prompt(`Enter amount to withdraw (Min: ${currencyInfo.min}, Max: ${currencyInfo.max}):`));
      if (amount < currencyInfo.min) {
        console.log(`VALUE < ${currencyInfo.min}${currency}`);
        reject({ userData, bankData });
      } else if (amount > currencyInfo.max) {
        console.log(`VALUE > ${currencyInfo.max}${currency}`);
        reject({ userData, bankData });
      } else {
        const userBalance = userData[currency.toUpperCase()];
        if (amount > userBalance) {
          console.log(`Insufficient balance. Your balance: ${userBalance} ${currency}`);
          reject({ userData, bankData });
        } else {
          console.log(`Here are your cash: ${amount} ${currency.toUpperCase()} ${currencyInfo.img}`);
          resolve(userData);
        }
      }
    }
  });
}
