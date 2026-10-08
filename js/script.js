/* =========================================================
   DFORDECOR - CUSTOMIZE / GIFT BUILDER SCRIPT
========================================================= */

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx7kD1pflT5SnGbQAfhc_g_TTl0CBWVcwpuTorEwRNOqL0TRyUJbwUWKlPck_ZSAuN1/exec";

const WA_NUMBER = "+91 7447771550";
const EMAIL_TO = "salesdfordecor@gmail.com";
const BUSINESS_NAME = "DforDecor";
const UPI_ID = "manishapharande1922-1@okaxis";

let selectedBudget = 0;
let cart = {};
let currentOrder = null;


/* =========================================================
   BASIC HELPERS
========================================================= */

function toggleMenu() {
  document.getElementById("navLinks")?.classList.toggle("active");
}


function setLanguage(lang) {

  document.documentElement.lang = lang;

  document
    .querySelectorAll("[data-en][data-mr]")
    .forEach((el) => {
      el.textContent =
        el.getAttribute("data-" + lang);
    });

  document
    .querySelectorAll(".lang-switch button")
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.lang === lang
      );
    });

  localStorage.setItem(
    "ddecor-language",
    lang
  );
}


function formatCurrency(value) {

  const amount =
    Number(value || 0);

  return (
    "₹" +
    amount.toLocaleString("en-IN")
  );
}


function isValidEmail(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email || "").trim()
  );
}


function escapeHtml(value) {

  return String(value ?? "").replace(
    /[&<>'"]/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[character])
  );
}


function escapeAttr(value) {

  return String(value ?? "")
    .replace(/'/g, "\\'");
}


/* =========================================================
   BUDGET
========================================================= */

function selectBudget(amount, el) {

  selectedBudget =
    Number(amount || 0);

  cart = {};

  document
    .querySelectorAll(".budget-card")
    .forEach((card) => {
      card.classList.remove("active");
    });

  el?.classList.add("active");

  const display =
    document.getElementById(
      "displayBudget"
    );

  if (display) {

    display.textContent =
      selectedBudget.toLocaleString(
        "en-IN"
      );
  }

  const section =
    document.getElementById(
      "productSection"
    );

  if (section) {

    section.style.display =
      "block";
  }

  document
    .querySelectorAll(".gift-product")
    .forEach((product) => {

      product.classList.remove(
        "selected"
      );

      const minimum =
        Number(
          product.dataset.min || 0
        );

      product.style.display =
        minimum <= selectedBudget
          ? "block"
          : "none";
    });

  renderCart();

  updateGiftSummary();

  setTimeout(() => {

    section?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }, 80);
}


/* =========================================================
   PRODUCTS
========================================================= */

function toggleProduct(el) {

  if (!selectedBudget) {

    alert(
      "Please select a budget first."
    );

    return;
  }

  const name =
    el.dataset.name;

  const price =
    Number(
      el.dataset.price || 0
    );

  if (cart[name]) {

    delete cart[name];

  } else {

    cart[name] = {
      name: name,
      price: price,
      qty: 1
    };
  }

  el.classList.toggle(
    "selected",
    !!cart[name]
  );

  renderCart();

  updateGiftSummary();
}


/* =========================================================
   QUANTITY
========================================================= */

function changeQty(name, delta) {

  if (!cart[name]) {
    return;
  }

  cart[name].qty =
    Math.max(
      1,
      Number(
        cart[name].qty || 1
      ) +
      Number(delta || 0)
    );

  renderCart();

  updateGiftSummary();
}


/* =========================================================
   REMOVE PRODUCT
========================================================= */

function removeProduct(name) {

  delete cart[name];

  document
    .querySelectorAll(".gift-product")
    .forEach((product) => {

      if (
        product.dataset.name === name
      ) {

        product.classList.remove(
          "selected"
        );
      }
    });

  renderCart();

  updateGiftSummary();
}


/* =========================================================
   SELECTED PRODUCTS
========================================================= */

function getSelectedProducts() {

  return Object.values(cart);
}


/* =========================================================
   TOTAL CALCULATION
========================================================= */

function getSelectedTotal() {

  return Object.values(cart).reduce(
    (total, product) => {

      const price =
        Number(
          product.price || 0
        );

      const qty =
        Number(
          product.qty || 1
        );

      return (
        total +
        price * qty
      );

    },
    0
  );
}


function getTotalQuantity() {

  return getSelectedProducts()
    .reduce(
      (total, product) =>
        total +
        Number(
          product.qty || 1
        ),
      0
    );
}


/* =========================================================
   CART DISPLAY
========================================================= */

function renderCart() {

  const box =
    document.getElementById(
      "selectedProductsList"
    );

  if (!box) {
    return;
  }

  const items =
    getSelectedProducts();

  const count =
    getTotalQuantity();

  const counter =
    document.getElementById(
      "cartCount"
    );

  if (counter) {

    counter.textContent =
      `${count} item${
        count === 1 ? "" : "s"
      }`;
  }

  if (!items.length) {

    box.innerHTML =
      "<p>No products selected yet.</p>";

    return;
  }

  box.innerHTML =
    items
      .map((product) => {

        const lineTotal =
          Number(
            product.price || 0
          ) *
          Number(
            product.qty || 1
          );

        return `
          <div class="cart-row">

            <div class="cart-name">

              <strong>
                ${escapeHtml(
                  product.name
                )}
              </strong>

              <small>
                ${formatCurrency(
                  product.price
                )} each
              </small>

            </div>


            <div class="qty-control">

              <button
                type="button"
                onclick="changeQty('${escapeAttr(
                  product.name
                )}', -1)"
              >
                −
              </button>

              <span>
                ${Number(
                  product.qty || 1
                )}
              </span>

              <button
                type="button"
                onclick="changeQty('${escapeAttr(
                  product.name
                )}', 1)"
              >
                +
              </button>

            </div>


            <div class="cart-price">
              ${formatCurrency(
                lineTotal
              )}
            </div>


            <button
              type="button"
              class="remove-btn"
              onclick="removeProduct('${escapeAttr(
                product.name
              )}')"
            >
              Remove
            </button>

          </div>
        `;
      })
      .join("");
}


/* =========================================================
   STEP 03 + STEP 04 SUMMARY
========================================================= */

function updateGiftSummary() {

  const items =
    getSelectedProducts();

  const total =
    getSelectedTotal();


  /* Budget */

  const budgetSummary =
    document.getElementById(
      "budgetSummary"
    );

  if (budgetSummary) {

    budgetSummary.textContent =
      `Budget per gift: ${formatCurrency(
        selectedBudget
      )}`;
  }


  /* Products */

  const productSummary =
    document.getElementById(
      "productSummary"
    );

  if (productSummary) {

    productSummary.innerHTML =
      items.length

        ? items
            .map((product) => {

              const qty =
                Number(
                  product.qty || 1
                );

              const price =
                Number(
                  product.price || 0
                );

              const lineTotal =
                price * qty;

              return `
                ${escapeHtml(
                  product.name
                )}
                × ${qty}
                = ${formatCurrency(
                  lineTotal
                )}
              `;
            })
            .join("<br>")

        : "No products selected";
  }


  /* Selected Total */

  const totalSummary =
    document.getElementById(
      "totalSummary"
    );

  if (totalSummary) {

    totalSummary.textContent =
      `Selected Total: ${formatCurrency(
        total
      )}`;
  }


  /* Estimated Order Value */

  const grandTotal =
    document.getElementById(
      "grandTotal"
    );

  if (grandTotal) {

    grandTotal.innerHTML =
      `<strong>
        Estimated Order Value:
        ${formatCurrency(total)}
      </strong>`;
  }


  /* STEP 04 ORDER TOTAL */

  const step4Total =
    document.getElementById(
      "step4Total"
    );

  if (step4Total) {

    step4Total.textContent =
      formatCurrency(total);
  }
}


/* =========================================================
   PRODUCTS FOR EMAIL
========================================================= */

function buildProductText() {

  return getSelectedProducts()
    .map((product) => {

      const qty =
        Number(
          product.qty || 1
        );

      const price =
        Number(
          product.price || 0
        );

      const total =
        price * qty;

      return (
        `${product.name} | ` +
        `${qty} | ` +
        `₹${price.toLocaleString(
          "en-IN"
        )} | ` +
        `₹${total.toLocaleString(
          "en-IN"
        )}`
      );

    })
    .join("\n");
}


/* =========================================================
   OLD ENQUIRY SUPPORT
========================================================= */

function enquiryText() {

  const items =
    getSelectedProducts();

  const name =
    document.getElementById(
      "customerName"
    )?.value.trim() ||
    "Not provided";

  const phone =
    document.getElementById(
      "customerPhone"
    )?.value.trim() ||
    "Not provided";

  const occasion =
    document.getElementById(
      "occasion"
    )?.value ||
    "Not selected";

  const date =
    document.getElementById(
      "deliveryDate"
    )?.value ||
    "Not decided";

  const note =
    document.getElementById(
      "specialMessage"
    )?.value.trim() ||
    "None";

  const total =
    getSelectedTotal();

  const products =
    items.length

      ? items
          .map((product) => {

            const lineTotal =
              Number(
                product.price || 0
              ) *
              Number(
                product.qty || 1
              );

            return (
              `- ${product.name} | ` +
              `Qty: ${product.qty} | ` +
              `${formatCurrency(
                product.price
              )} each | ` +
              `${formatCurrency(
                lineTotal
              )}`
            );

          })
          .join("\n")

      : "No products selected";

  return `
DDECOR - GIFT ENQUIRY

Name: ${name}
WhatsApp: ${phone}
Occasion: ${occasion}
Budget per Gift: ${formatCurrency(
    selectedBudget
  )}
Delivery Date: ${date}

Selected Products:
${products}

Estimated Order Value: ${formatCurrency(
    total
  )}

Special Requirement:
${note}

Please confirm availability, packaging and final pricing.
`.trim();
}


showOrderSuccessPopup(orderId);
function showOrderSuccessPopup(orderId) {
    let popup = document.getElementById("orderSuccessPopup");

    if (!popup) {
        popup = document.createElement("div");
        popup.id = "orderSuccessPopup";

        popup.innerHTML = `
            <div class="order-success-overlay">
                <div class="order-success-box">
                    <div class="success-icon">✓</div>

                    <h2>Order Confirmed!</h2>

                    <p class="success-main">
                        Your order has been confirmed successfully.
                    </p>

                    <p class="success-sub">
                        We have received your order and payment details.
                        <br>
                        We will get back to you soon.
                    </p>

                    <div class="success-order-id">
                        Order ID: <strong>${orderId}</strong>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(popup);
    }

    popup.style.display = "flex";

    setTimeout(() => {
        popup.style.display = "none";
    }, 3000);
}
function sendEmailEnquiry() {

  const subject =
    "Gift Enquiry - DDecor";

  const body =
    enquiryText();

  const status =
    document.getElementById(
      "emailStatus"
    );

  if (status) {

    status.textContent =
      "Opening your email app…";
  }

  window.location.href =
    `mailto:${EMAIL_TO}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(
      body
    )}`;
}


/* =========================================================
   PAYMENT POPUP
========================================================= */

function openPaymentPopup() {

  const customerName =
    document.getElementById(
      "orderCustomerName"
    )?.value.trim() || "";

  const customerPhone =
    document.getElementById(
      "orderCustomerPhone"
    )?.value.trim() || "";

  const customerEmail =
    document.getElementById(
      "orderCustomerEmail"
    )?.value.trim() || "";

  const address =
    document.getElementById(
      "shippingAddress"
    )?.value.trim() || "";

  const city =
    document.getElementById(
      "shippingCity"
    )?.value.trim() || "";

  const pincode =
    document.getElementById(
      "shippingPincode"
    )?.value.trim() || "";

  const deliveryDate =
    document.getElementById(
      "orderDeliveryDate"
    )?.value || "";

  const instructions =
    document.getElementById(
      "orderSpecialInstructions"
    )?.value.trim() || "";


  /* CUSTOMER VALIDATION */

  if (!customerName) {

    alert(
      "Please enter your full name."
    );

    return;
  }


  if (!customerPhone) {

    alert(
      "Please enter your WhatsApp / mobile number."
    );

    return;
  }


  const phoneDigits =
    customerPhone.replace(
      /\D/g,
      ""
    );

  if (phoneDigits.length < 10) {

    alert(
      "Please enter a valid mobile number."
    );

    return;
  }


  /* EMAIL IS OPTIONAL */

  if (
    customerEmail &&
    !isValidEmail(
      customerEmail
    )
  ) {

    alert(
      "Please enter a valid email address."
    );

    return;
  }


  if (!address) {

    alert(
      "Please enter your delivery address."
    );

    return;
  }


  if (!city) {

    alert(
      "Please enter your city."
    );

    return;
  }


  if (!/^\d{6}$/.test(
    pincode
  )) {

    alert(
      "Please enter a valid 6 digit pincode."
    );

    return;
  }


  if (!deliveryDate) {

    alert(
      "Please select your preferred delivery date."
    );

    return;
  }


  /* PRODUCTS */

  const products =
    getSelectedProducts();

  if (!products.length) {

    alert(
      "Please select at least one product."
    );

    return;
  }


  /* TOTAL */

  const total =
    getSelectedTotal();

  if (total <= 0) {

    alert(
      "Order total cannot be ₹0."
    );

    return;
  }


  /* ORDER ID */

  const orderId =
    "DFD-" +
    Date.now()
      .toString()
      .slice(-8);


  /* SAVE ORDER */

  currentOrder = {

    orderId,

    customer: {

      name:
        customerName,

      phone:
        customerPhone,

      email:
        customerEmail,

      address:
        address,

      city:
        city,

      pincode:
        pincode,

      deliveryDate:
        deliveryDate,

      instructions:
        instructions

    },

    products:
      products.map(
        (product) => ({

          name:
            product.name,

          price:
            Number(
              product.price || 0
            ),

          qty:
            Number(
              product.qty || 1
            )

        })
      ),

    total:
      total,

    budget:
      selectedBudget

  };


  /* FILL PAYMENT POPUP */

  const orderIdEl =
    document.getElementById(
      "paymentOrderId"
    );

  if (orderIdEl) {

    orderIdEl.textContent =
      currentOrder.orderId;
  }


  const nameEl =
    document.getElementById(
      "paymentCustomerName"
    );

  if (nameEl) {

    nameEl.textContent =
      customerName;
  }


  const phoneEl =
    document.getElementById(
      "paymentCustomerPhone"
    );

  if (phoneEl) {

    phoneEl.textContent =
      customerPhone;
  }


  const emailEl =
    document.getElementById(
      "paymentCustomerEmail"
    );

  if (emailEl) {

    emailEl.textContent =
      customerEmail ||
      "Not provided";
  }


  const addressEl =
    document.getElementById(
      "paymentDeliveryAddress"
    );

  if (addressEl) {

    addressEl.textContent =
      `${address}, ${city} - ${pincode}`;
  }


  const amountEl =
    document.getElementById(
      "paymentAmount"
    );

  if (amountEl) {

    amountEl.textContent =
      formatCurrency(total);
  }


  /* RESET SCREENSHOT */

  const screenshot =
    document.getElementById(
      "paymentScreenshot"
    );

  if (screenshot) {

    screenshot.value =
      "";
  }


  const preview =
    document.getElementById(
      "paymentScreenshotPreview"
    );

  if (preview) {

    preview.innerHTML =
      "";
  }


  const status =
    document.getElementById(
      "paymentStatus"
    );

  if (status) {

    status.textContent =
      "";
  }


  const button =
    document.getElementById(
      "confirmPaymentButton"
    );

  if (button) {

    button.disabled =
      false;

    button.textContent =
      "✓ Payment Done – Place Order";
  }


  /* OPEN PAYMENT MODAL */

  const modal =
    document.getElementById(
      "paymentModal"
    );

  if (!modal) {

    alert(
      "Payment popup was not found. Please check paymentModal in customize.html."
    );

    return;
  }


  modal.style.display =
    "block";

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow =
    "hidden";
}


/* =========================================================
   CLOSE PAYMENT POPUP
========================================================= */

function closePaymentPopup() {

  const modal =
    document.getElementById(
      "paymentModal"
    );

  if (modal) {

    modal.style.display =
      "none";

    modal.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  document.body.style.overflow =
    "";
}


/* =========================================================
   SCREENSHOT PREVIEW
========================================================= */

function setupScreenshotPreview() {

  const input =
    document.getElementById(
      "paymentScreenshot"
    );

  if (!input) {
    return;
  }


  input.addEventListener(
    "change",
    function () {

      const file =
        this.files?.[0];

      const preview =
        document.getElementById(
          "paymentScreenshotPreview"
        );

      if (!preview) {
        return;
      }


      preview.innerHTML =
        "";


      if (!file) {
        return;
      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        alert(
          "Please select a payment screenshot image."
        );

        this.value =
          "";

        return;
      }


      const reader =
        new FileReader();


      reader.onload =
        function (event) {

          preview.innerHTML = `
            <img
              src="${event.target.result}"
              alt="Payment Screenshot Preview"
            >
          `;
        };


      reader.readAsDataURL(
        file
      );
    }
  );
}


/* =========================================================
   FILE TO BASE64
========================================================= */

function fileToBase64(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();


      reader.onload =
        () => resolve(
          reader.result
        );


      reader.onerror =
        (error) =>
          reject(error);


      reader.readAsDataURL(
        file
      );
    }
  );
}


/* =========================================================
   SEND ORDER TO GOOGLE APPS SCRIPT
========================================================= */

async function sendOrderToAppsScript(orderData) {

  const body = new URLSearchParams();

  Object.entries(orderData).forEach(
    ([key, value]) => {

      body.append(
        key,
        value ?? ""
      );

    }
  );

  try {

    await fetch(
      GOOGLE_APPS_SCRIPT_URL,
      {
        method: "POST",

        mode: "no-cors",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded;charset=UTF-8"
        },

        body: body.toString()
      }
    );

    return true;

  } catch (error) {

    console.error(
      "Apps Script submission error:",
      error
    );

    throw error;
  }
}

/* =========================================================
   CONFIRM PAYMENT + PLACE ORDER
========================================================= */

async function confirmPaymentAndPlaceOrder() {

  if (!currentOrder) {

    alert(
      "Please click Proceed to Payment first."
    );

    return;
  }


  const screenshotInput =
    document.getElementById(
      "paymentScreenshot"
    );


  const screenshotFile =
    screenshotInput?.files?.[0];


  if (!screenshotFile) {

    alert(
      "Please upload your payment screenshot."
    );

    return;
  }


  const button =
    document.getElementById(
      "confirmPaymentButton"
    );


  const status =
    document.getElementById(
      "paymentStatus"
    );


  try {

    /* ================================
       DISABLE BUTTON
    ================================= */

    if (button) {

      button.disabled = true;

      button.textContent =
        "Submitting Order...";
    }


    if (status) {

      status.textContent =
        "Submitting your order. Please wait...";
    }


    /* ================================
       CONVERT SCREENSHOT TO BASE64
    ================================= */

    const screenshotData =
      await fileToBase64(
        screenshotFile
      );


    /* ================================
       GET FRESH ORDER TOTAL
    ================================= */

    const orderTotal =
      getSelectedTotal();


    if (orderTotal <= 0) {

      throw new Error(
        "Order total cannot be ₹0."
      );
    }


    /* ================================
       PRODUCT DATA
    ================================= */

    const productText =
      buildProductText();


    /* ================================
       ORDER DATA
    ================================= */

    const orderData = {

      order_id:
        currentOrder.orderId,

      order_type:
        "Gift Builder Order",

      payment_status:
        "Payment Screenshot Submitted",

      customer_name:
        currentOrder.customer.name,

      customer_phone:
        currentOrder.customer.phone,

      customer_email:
        currentOrder.customer.email,

      shipping_address:
        currentOrder.customer.address,

      shipping_city:
        currentOrder.customer.city,

      shipping_pincode:
        currentOrder.customer.pincode,

      delivery_date:
        currentOrder.customer.deliveryDate,

      special_instructions:
        currentOrder.customer.instructions ||
        "None",

      budget_per_gift:
        currentOrder.budget,

      products:
        productText,

      order_total:
        orderTotal,

      upi_id:
        UPI_ID,

      payment_screenshot_data:
        screenshotData

    };


    /* ================================
       SEND ORDER TO GOOGLE APPS SCRIPT
    ================================= */

    await sendOrderToAppsScript(
      orderData
    );


    /*
      IMPORTANT:
      Do NOT open WhatsApp.
      Do NOT redirect to another page.

      User remains on customize.html.
    */


    /* ================================
       CLOSE PAYMENT POPUP
    ================================= */

    closePaymentPopup();


    /* ================================
       SHOW SUCCESS MESSAGE
    ================================= */

    showOrderSuccessPopup(
      currentOrder.orderId
    );


    /* ================================
       CLEAR CART
    ================================= */

    cart = {};


    document
      .querySelectorAll(
        ".gift-product"
      )
      .forEach((product) => {

        product.classList.remove(
          "selected"
        );

      });


    renderCart();

    updateGiftSummary();


  } catch (error) {

    console.error(
      "Order submission failed:",
      error
    );


    /* ================================
       RESTORE BUTTON
    ================================= */

    if (button) {

      button.disabled =
        false;

      button.textContent =
        "✓ Payment Done – Place Order";
    }


    if (status) {

      status.textContent =
        "Unable to submit order.";
    }


    alert(
      "There was a problem submitting the order. Please try again."
    );

  }

}

/* =========================================================
   WHATSAPP ORDER MESSAGE
========================================================= */
function showOrderSuccessPopup(orderId) {

  // Remove existing popup if any
  const existing =
    document.getElementById("orderSuccessPopup");

  if (existing) {
    existing.remove();
  }

  const popup =
    document.createElement("div");

  popup.id = "orderSuccessPopup";

  popup.innerHTML = `
    <div class="order-success-overlay">

      <div class="order-success-box">

        <div class="success-icon">
          ✓
        </div>

        <h2>Order Confirmed!</h2>

        <p class="success-main">
          Your order has been confirmed successfully.
        </p>

        <p class="success-sub">
          We have received your order and payment details.
          <br>
          <strong>We will get back to you soon.</strong>
        </p>

        <div class="success-order-id">
          Order ID:
          <strong>${orderId}</strong>
        </div>

      </div>

    </div>
  `;

  document.body.appendChild(popup);

  // Force popup to be visible
  popup.style.display = "flex";

  // Remove after 3 seconds
  setTimeout(() => {

    popup.style.opacity = "0";
    popup.style.transition =
      "opacity 0.3s ease";

    setTimeout(() => {

      popup.remove();

    }, 300);

  }, 3000);
}
function buildOrderWhatsAppMessage(
  order
) {

  const products =
    order.products
      .map((product) => {

        const lineTotal =
          Number(
            product.price || 0
          ) *
          Number(
            product.qty || 1
          );

        return (
          `${product.name} - ` +
          `Qty: ${product.qty} - ` +
          `${formatCurrency(
            lineTotal
          )}`
        );

      })
      .join("\n");


  return `
DforDecor - Gift Order

Order ID:
${order.orderId}

Name:
${order.customer.name}

WhatsApp:
${order.customer.phone}

Email:
${order.customer.email || "Not provided"}

Products:
${products}

Order Total:
${formatCurrency(
    order.total
  )}

Delivery Date:
${order.customer.deliveryDate}

Shipping Address:
${order.customer.address},
${order.customer.city} -
${order.customer.pincode}

Thank you for choosing DforDecor.
`.trim();
}


/* =========================================================
   SUCCESS POPUP
========================================================= */

function showOrderSuccessPopup(orderId) {

  // Remove any old popup
  const oldPopup =
    document.getElementById("orderSuccessPopup");

  if (oldPopup) {
    oldPopup.remove();
  }


  // Create popup
  const popup =
    document.createElement("div");

  popup.id =
    "orderSuccessPopup";


  popup.innerHTML = `

    <div class="order-success-overlay">

      <div class="order-success-box">

        <div class="success-icon">
          ✓
        </div>

        <h2>
          Order Confirmed!
        </h2>

        <p class="success-main">
          Your order has been confirmed successfully.
        </p>

        <p class="success-sub">
          We have received your order and payment details.
          <br>
          <strong>We will get back to you soon.</strong>
        </p>

        <div class="success-order-id">
          Order ID:
          <strong>${orderId}</strong>
        </div>

      </div>

    </div>

  `;


  // Add popup to page
  document.body.appendChild(
    popup
  );


  // Make absolutely sure it is visible
  popup.style.display =
    "flex";


  // Automatically remove after 3 seconds
  setTimeout(() => {

    popup.style.opacity =
      "0";

    popup.style.transition =
      "opacity 0.3s ease";

    setTimeout(() => {

      popup.remove();

    }, 300);

  }, 3000);

}


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Escape"
    ) {

      const paymentModal =
        document.getElementById(
          "paymentModal"
        );

      if (
        paymentModal &&
        paymentModal.style.display ===
          "block"
      ) {

        closePaymentPopup();
      }
    }
  }
);


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setLanguage(
      localStorage.getItem(
        "ddecor-language"
      ) || "en"
    );


    renderCart();


    updateGiftSummary();


    setupScreenshotPreview();

  }
);