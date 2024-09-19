document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = Array.from(new FormData(form).entries());
    const amount = formData[0][1];
    const currency = formData[1][1];
    const isValid = checkValidate(amount);

    if (isValid) {
      showLoader(true);
      getCurrency(amount, currency);
      form.reset();
    }
  });

  function getCurrency(amount, currency) {
    const apiUrl = "https://api.nbp.pl/api/exchangerates/rates/A/";

    axios
      .get(`${apiUrl}${currency}/last/?format=json`)
      .then((response) => {
        const data = response.data;

        if (typeof data !== "object" || !data.code || !data.rates || data.rates === 0 || !Array.isArray(data.rates) || !data.rates[0].mid) {
          modifyAndDisplayError("Nieodpowiednia struktura API. Proszę spróbować ponownie później!");
          showLoader(false);
          throw new Error("Nieodpowiednia struktura API.");
        }

        const mid = data.rates[0].mid;
        calculateAndDisplayResult(amount, mid, currency);
        showLoader(false);
      })
      .catch((err) => {
        modifyAndDisplayError("Problem z połączeniem z API. Spróbuj ponownie!");
        showLoader(false);
        console.error("Problem z połączeniem z API.", err);
      });
  }

  function checkValidate(amount) {
    const regex = /^\s*\d+(\s*\d+)*(\s*[.,]\s*\d+(\s*\d+)*)?$/;

    if (amount.trim() === "") {
      modifyAndDisplayError("Nie wypełniono pola z kwotą!");
      return false;
    }

    if (!regex.test(amount)) {
      modifyAndDisplayError("W kwocie pojawiły się niedozwolone znaki!");
      return false;
    }

    if (amount.length > 15) {
      modifyAndDisplayError("Użyto zbyt dużo znaków! (max 15 znaków)");
      return false;
    }

    if (convertToFloat(amount) < 0.01) {
      modifyAndDisplayError("Kwota jest zbyt mała!");
      return false;
    }

    modifyAndDisplayError("");
    return true;
  }

  function modifyAndDisplayError(errorText) {
    const helpBlock = document.querySelector("#help-block");
    helpBlock.textContent = errorText;
  }

  function convertToFloat(value) {
    value = value.replace(/\s+/g, "").replace(/,/g, ".");
    value = parseFloat(parseFloat(value).toFixed(2));
    return value;
  }

  function showLoader(showed) {
    const loader = document.querySelector("#loader");

    if (showed) {
      loader.style.display = "block";
    } else {
      loader.style.display = "none";
    }
  }

  function calculateAndDisplayResult(amount, mid, currency) {
    const result = document.querySelector("#result");
    amount = convertToFloat(amount);
    amount = Math.ceil(amount * 100) / 100;
    mid = Math.ceil(mid * 100) / 100;

    const value = amount * mid;
    const resultContent = `${amount} ${currency} to <span class="highlighted">${Math.round(value * 100) / 100} PLN</span>`;
    result.innerHTML = resultContent;
  }
});
