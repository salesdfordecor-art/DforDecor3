/* =========================================================
   DFORDECOR - CUSTOMIZE / GIFT BUILDER SCRIPT
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const GOOGLE_APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbztAOSSsBwqJAu-lIkhfvggJxD-UQdG7IM5qd-Y8KZ15oAmHBN8meEl4jTrSrTjv5U/exec";

const WA_NUMBER = "+91 7447771550";

const EMAIL_TO = "salesdfordecor@gmail.com";

const BUSINESS_NAME = "DforDecor";

const UPI_ID = "manishapharande1922-1@okaxis";


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let selectedBudget = 0;

let cart = {};

let currentOrder = null;


/* =========================================================
   LOAD COMMON HEADER & FOOTER
   ========================================================= */

function loadCommonComponents() {

    const header = document.getElementById("site-header");
    const footer = document.getElementById("site-footer");


    /* -------------------------
       HEADER
       ------------------------- */

    if (header) {

        fetch("components/header.html")

            .then(response => {

                if (!response.ok) {
                    throw new Error("Header could not be loaded");
                }

                return response.text();

            })

            .then(html => {

                header.innerHTML = html;

                setLanguage(
                    localStorage.getItem("ddecor-language") || "en"
                );

            })

            .catch(error => {

                console.error(
                    "Header loading error:",
                    error
                );

            });

    }


    /* -------------------------
       FOOTER
       ------------------------- */

    if (footer) {

        fetch("components/footer.html")

            .then(response => {

                if (!response.ok) {
                    throw new Error("Footer could not be loaded");
                }

                return response.text();

            })

            .then(html => {

                footer.innerHTML = html;

                setLanguage(
                    localStorage.getItem("ddecor-language") || "en"
                );

            })

            .catch(error => {

                console.error(
                    "Footer loading error:",
                    error
                );

            });

    }

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function toggleMenu() {

    document
        .getElementById("navLinks")
        ?.classList.toggle("active");

}


/* =========================================================
   LANGUAGE
   ========================================================= */

function setLanguage(lang) {

    document.documentElement.lang = lang;


    document
        .querySelectorAll("[data-en][data-mr]")
        .forEach(el => {

            el.textContent =
                el.getAttribute("data-" + lang);

        });


    document
        .querySelectorAll(".lang-switch button")
        .forEach(button => {

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


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function formatCurrency(value) {

    const amount = Number(value || 0);

    return "₹" +
        amount.toLocaleString("en-IN");

}


function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        String(email || "").trim()
    );

}


function escapeHtml(value) {

    return String(value ?? "").replace(
        /[&<>'"]/g,
        character => ({
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

    selectedBudget = Number(amount || 0);

    /* Clear cart when budget changes */
    cart = {};


    document
        .querySelectorAll(".budget-card")
        .forEach(card => {

            card.classList.remove("active");

        });


    el?.classList.add("active");


    const display =
        document.getElementById("displayBudget");


    if (display) {

        display.textContent =
            selectedBudget.toLocaleString("en-IN");

    }


    const section =
        document.getElementById("productSection");


    if (section) {

        section.style.display = "block";

    }


    /* Show only products that fit selected budget */

    document
        .querySelectorAll(".gift-product")
        .forEach(product => {

            product.classList.remove("selected");

            const minimum =
                Number(product.dataset.min || 0);

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
        Number(el.dataset.price || 0);


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
            Number(cart[name].qty || 1) +
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
        .forEach(product => {

            if (product.dataset.name === name) {

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
                Number(product.price || 0);

            const qty =
                Number(product.qty || 1);

            return total + (price * qty);

        },
        0
    );

}


function getTotalQuantity() {

    return getSelectedProducts()
        .reduce(
            (total, product) =>
                total +
                Number(product.qty || 1),
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
            `${count} item${count === 1 ? "" : "s"}`;

    }


    if (!items.length) {

        box.innerHTML =
            "<p>No products selected yet.</p>";

        return;

    }


    box.innerHTML =
        items
            .map(product => {

                const lineTotal =
                    Number(product.price || 0) *
                    Number(product.qty || 1);


                return `
                    <div class="cart-row">

                        <div class="cart-name">

                            <strong>
                                ${escapeHtml(product.name)}
                            </strong>

                            <small>
                                ${formatCurrency(product.price)}
                                each
                            </small>

                        </div>


                        <div class="qty-control">

                            <button
                                type="button"
                                onclick="changeQty('${escapeAttr(product.name)}', -1)"
                            >
                                −
                            </button>

                            <span>
                                ${Number(product.qty || 1)}
                            </span>

                            <button
                                type="button"
                                onclick="changeQty('${escapeAttr(product.name)}', 1)"
                            >
                                +
                            </button>

                        </div>


                        <div class="cart-price">
                            ${formatCurrency(lineTotal)}
                        </div>


                        <button
                            type="button"
                            class="remove-btn"
                            onclick="removeProduct('${escapeAttr(product.name)}')"
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


    /* -------------------------
       Budget
       ------------------------- */

    const budgetSummary =
        document.getElementById(
            "budgetSummary"
        );


    if (budgetSummary) {

        budgetSummary.textContent =
            `Budget per gift: ${formatCurrency(selectedBudget)}`;

    }


    /* -------------------------
       Products
       ------------------------- */

    const productSummary =
        document.getElementById(
            "productSummary"
        );


    if (productSummary) {

        productSummary.innerHTML =
            items.length

                ? items
                    .map(product => {

                        const qty =
                            Number(product.qty || 1);

                        const price =
                            Number(product.price || 0);

                        const lineTotal =
                            price * qty;


                        return `
                            ${escapeHtml(product.name)}
                            × ${qty}
                            = ${formatCurrency(lineTotal)}
                        `;

                    })
                    .join("<br>")

                : "No products selected";

    }


    /* -------------------------
       Selected Total
       ------------------------- */

    const totalSummary =
        document.getElementById(
            "totalSummary"
        );


    if (totalSummary) {

        totalSummary.textContent =
            `Selected Total: ${formatCurrency(total)}`;

    }


    /* -------------------------
       Estimated Order Value
       ------------------------- */

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


    /* -------------------------
       STEP 04 TOTAL
       ------------------------- */

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
   PRODUCTS FOR EMAIL / APPS SCRIPT
   ========================================================= */

function buildProductText() {

    return getSelectedProducts()

        .map(product => {

            const qty =
                Number(product.qty || 1);

            const price =
                Number(product.price || 0);

            const total =
                price * qty;


            return (
                `${product.name} | ` +
                `${qty} | ` +
                `₹${price.toLocaleString("en-IN")} | ` +
                `₹${total.toLocaleString("en-IN")}`
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
                .map(product => {

                    const lineTotal =
                        Number(product.price || 0) *
                        Number(product.qty || 1);


                    return (
                        `- ${product.name} | ` +
                        `Qty: ${product.qty} | ` +
                        `${formatCurrency(product.price)} each | ` +
                        `${formatCurrency(lineTotal)}`
                    );

                })
                .join("\n")

            : "No products selected";


    return `
DDECOR - GIFT ENQUIRY

Name: ${name}

WhatsApp: ${phone}

Occasion: ${occasion}

Budget per Gift: ${formatCurrency(selectedBudget)}

Delivery Date: ${date}

Selected Products:

${products}

Estimated Order Value: ${formatCurrency(total)}

Special Requirement:

${note}

Please confirm availability, packaging and final pricing.
`.trim();

}


/* =========================================================
   EMAIL ENQUIRY
   ========================================================= */




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


    /* -------------------------
       CUSTOMER VALIDATION
       ------------------------- */

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
        !isValidEmail(customerEmail)
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


    if (!/^\d{6}$/.test(pincode)) {

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


    /* -------------------------
       PRODUCTS
       ------------------------- */

    const products =
        getSelectedProducts();


    if (!products.length) {

        alert(
            "Please select at least one product."
        );

        return;

    }


    /* -------------------------
       TOTAL
       ------------------------- */

    const total =
        getSelectedTotal();


    if (total <= 0) {

        alert(
            "Order total cannot be ₹0."
        );

        return;

    }


    /* -------------------------
       ORDER ID
       ------------------------- */

    const orderId =
        "DFD-" +
        Date.now()
            .toString()
            .slice(-8);


    /* -------------------------
       SAVE ORDER
       ------------------------- */

    currentOrder = {

        orderId: orderId,

        customer: {

            name: customerName,

            phone: customerPhone,

            email: customerEmail,

            address: address,

            city: city,

            pincode: pincode,

            deliveryDate: deliveryDate,

            instructions: instructions

        },

        products: products.map(
            product => ({

                name: product.name,

                price:
                    Number(product.price || 0),

                qty:
                    Number(product.qty || 1)

            })
        ),

        total: total,

        budget: selectedBudget

    };


    /* -------------------------
       FILL PAYMENT POPUP
       ------------------------- */

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


    /* -------------------------
       RESET SCREENSHOT
       ------------------------- */

    const screenshot =
        document.getElementById(
            "paymentScreenshot"
        );


    if (screenshot) {

        screenshot.value = "";

    }


    const preview =
        document.getElementById(
            "paymentScreenshotPreview"
        );


    if (preview) {

        preview.innerHTML = "";

    }


    const status =
        document.getElementById(
            "paymentStatus"
        );


    if (status) {

        status.textContent = "";

    }


    const button =
        document.getElementById(
            "confirmPaymentButton"
        );


    if (button) {

        button.disabled = false;

        button.textContent =
            "✓ Payment Done – Place Order";

    }


    /* -------------------------
       OPEN MODAL
       ------------------------- */

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


    modal.style.display = "block";

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

        modal.style.display = "none";

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    document.body.style.overflow = "";

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


            preview.innerHTML = "";


            if (!file) {
                return;
            }


            if (!file.type.startsWith("image/")) {

                alert(
                    "Please select a payment screenshot image."
                );

                this.value = "";

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


            reader.readAsDataURL(file);

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
                error =>
                    reject(error);


            reader.readAsDataURL(file);

        }
    );

}


/* =========================================================
   SEND ORDER TO GOOGLE APPS SCRIPT
   ========================================================= */

async function sendOrderToAppsScript(orderData) {

    const body =
        new URLSearchParams();


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

                body:
                    body.toString()

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

        /* -------------------------
           DISABLE BUTTON
           ------------------------- */

        if (button) {

            button.disabled = true;

            button.textContent =
                "Submitting Order...";

        }


        if (status) {

            status.textContent =
                "Submitting your order...";
        }


        /* -------------------------
           SCREENSHOT BASE64
           ------------------------- */

        const screenshotData =
            await fileToBase64(
                screenshotFile
            );


        /* -------------------------
           FRESH ORDER TOTAL
           ------------------------- */

        const orderTotal =
            getSelectedTotal();


        if (orderTotal <= 0) {

            throw new Error(
                "Order total cannot be ₹0."
            );

        }


        /* -------------------------
           PRODUCT DATA
           ------------------------- */

        const productText =
            buildProductText();


        /* -------------------------
           ORDER DATA
           ------------------------- */

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


        /* =================================================
           IMPORTANT:
           SHOW SUCCESS IMMEDIATELY

           DO NOT WAIT FOR GOOGLE APPS SCRIPT
           ================================================= */

        closePaymentPopup();


        showOrderSuccessPopup(
            currentOrder.orderId
        );


        /* -------------------------
           CLEAR CART
           ------------------------- */

        cart = {};


        document
            .querySelectorAll(".gift-product")
            .forEach(product => {

                product.classList.remove(
                    "selected"
                );

            });


        renderCart();

        updateGiftSummary();


        /* =================================================
           SEND ORDER IN BACKGROUND

           Customer does NOT wait for this.
           ================================================= */

        sendOrderToAppsScript(
            orderData
        )
        .then(() => {

            console.log(
                "DforDecor order submitted successfully in background."
            );

        })
        .catch(error => {

            console.error(
                "Background Apps Script submission failed:",
                error
            );

        });


    } catch (error) {

        console.error(
            "Order preparation failed:",
            error
        );


        /* -------------------------
           RESTORE BUTTON
           ------------------------- */

        if (button) {

            button.disabled = false;

            button.textContent =
                "✓ Payment Done – Place Order";

        }


        if (status) {

            status.textContent =
                "Unable to prepare order.";

        }


        alert(
            "There was a problem preparing the order. Please try again."
        );

    }

}


/* =========================================================
   WHATSAPP ORDER MESSAGE
   ========================================================= */

function buildOrderWhatsAppMessage(order) {

    const products =
        order.products

            .map(product => {

                const lineTotal =
                    Number(product.price || 0) *
                    Number(product.qty || 1);


                return (
                    `${product.name} - ` +
                    `Qty: ${product.qty} - ` +
                    `${formatCurrency(lineTotal)}`
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
${formatCurrency(order.total)}

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

    /* Remove existing popup */

    const oldPopup =
        document.getElementById(
            "orderSuccessPopup"
        );


    if (oldPopup) {
        oldPopup.remove();
    }


    /* Create popup */

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
                    <strong>
                        We will get back to you soon.
                    </strong>
                </p>

                <div class="success-order-id">

                    Order ID:

                    <strong>
                        ${escapeHtml(orderId)}
                    </strong>

                </div>

            </div>

        </div>

    `;




document.body.appendChild(popup);

const overlay =
    popup.querySelector(".order-success-overlay");

if (overlay) {

    overlay.style.display = "flex";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.zIndex = "999999";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
}


    /* Automatically remove */

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
   CLOSE POPUPS WITH ESCAPE
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            closePaymentPopup();

        }

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* Load common header/footer */

        loadCommonComponents();


        /* Language */

        setLanguage(
            localStorage.getItem(
                "ddecor-language"
            ) || "en"
        );


        /* Cart */

        renderCart();


        /* Summary */

        updateGiftSummary();


        /* Payment screenshot */

        setupScreenshotPreview();

    }
);
/* =========================================================
   CONTACT PAGE - GET ENQUIRY DATA
   ========================================================= */

function getContactEnquiryData() {

    const name =
        document.getElementById("customerName")
            ?.value.trim() || "";

    const email =
        document.getElementById("customerEmail")
            ?.value.trim() || "";

    const phone =
        document.getElementById("customerPhone")
            ?.value.trim() || "";

    const occasion =
        document.getElementById("occasion")
            ?.value || "";

    const budget =
        document.getElementById("budget")
            ?.value || "";

    const quantity =
        document.getElementById("quantity")
            ?.value || "1";

    const deliveryDate =
        document.getElementById("deliveryDate")
            ?.value || "";

    const specialMessage =
        document.getElementById("specialMessage")
            ?.value.trim() || "";

    return {
        name,
        email,
        phone,
        occasion,
        budget,
        quantity,
        deliveryDate,
        specialMessage
    };
}


/* =========================================================
   CONTACT PAGE - VALIDATION
   ========================================================= */

function validateContactEnquiry(data) {

    if (!data.name) {

        alert("Please enter your name.");

        document
            .getElementById("customerName")
            ?.focus();

        return false;
    }


    if (!data.phone) {

        alert("Please enter your WhatsApp number.");

        document
            .getElementById("customerPhone")
            ?.focus();

        return false;
    }


    const phoneDigits =
        data.phone.replace(/\D/g, "");


    if (phoneDigits.length < 10) {

        alert(
            "Please enter a valid WhatsApp number."
        );

        document
            .getElementById("customerPhone")
            ?.focus();

        return false;
    }


    if (
        data.email &&
        !isValidEmail(data.email)
    ) {

        alert(
            "Please enter a valid email address."
        );

        document
            .getElementById("customerEmail")
            ?.focus();

        return false;
    }


    if (
        !data.quantity ||
        Number(data.quantity) < 1
    ) {

        alert(
            "Please enter a valid quantity."
        );

        document
            .getElementById("quantity")
            ?.focus();

        return false;
    }


    if (!data.specialMessage) {

        alert(
            "Please enter your special requirement."
        );

        document
            .getElementById("specialMessage")
            ?.focus();

        return false;
    }


    return true;

}

/* =========================================================
   CONTACT PAGE - SEND TO GOOGLE APPS SCRIPT
   ========================================================= */

function sendContactEnquiryToServer(data) {

    const body = new URLSearchParams();

    body.append("customer_name", data.name);
    body.append("customer_email", data.email);
    body.append("customer_phone", data.phone);
    body.append("occasion", data.occasion);
    body.append("budget_per_gift", data.budget);
    body.append("quantity", data.quantity);
    body.append("delivery_date", data.deliveryDate);
    body.append("special_message", data.specialMessage);

    body.append(
        "order_type",
        "Bulk Quantity & Product Availability Enquiry"
    );

    body.append("is_order", "false");

    /*
     * IMPORTANT:
     * Return the fetch promise.
     * This allows sendContactEmailEnquiry()
     * to handle the request correctly.
     */

    return fetch(GOOGLE_APPS_SCRIPT_URL, {

        method: "POST",

        mode: "no-cors",

        headers: {
            "Content-Type":
                "application/x-www-form-urlencoded;charset=UTF-8"
        },

        body: body.toString()

    })

    .then(() => {

        console.log(
            "DforDecor enquiry sent to Google Apps Script."
        );

    })

    .catch(error => {

        console.error(
            "DforDecor enquiry submission failed:",
            error
        );

        throw error;

    });
}

/* =========================================================
   CONTACT PAGE - EMAIL ENQUIRY
   ========================================================= */

function sendContactEmailEnquiry() {
    const data = getContactEnquiryData();

    if (!validateContactEnquiry(data)) {
        return;
    }

    const button = document.getElementById("emailEnquiryButton");
    const status = document.getElementById("emailStatus");

    if (button) {
        button.disabled = true;
        button.innerText = "Sending...";
    }

    /*
     * Send to Apps Script in background.
     * DO NOT await this before showing the success popup.
     */
    sendContactEnquiryToServer(data)
        .then(() => {
            console.log("Enquiry sent to Apps Script");
        })
        .catch((error) => {
            console.error("Background enquiry error:", error);
        });

    /*
     * Show success immediately.
     */
    if (status) {
        status.innerText = "✓ Enquiry sent successfully.";
        status.style.color = "green";
    }

    showContactEnquirySuccess();

    /*
     * Clear form immediately.
     */
    const fieldsToClear = [
        "customerName",
        "customerEmail",
        "customerPhone",
        "occasion",
        "budget",
        "quantity",
        "deliveryDate",
        "specialMessage"
    ];

    fieldsToClear.forEach(id => {
        const field = document.getElementById(id);

        if (field) {
            field.value = "";
        }
    });

    /*
     * Restore button.
     */
    setTimeout(() => {
        if (button) {
            button.disabled = false;
            button.innerText = "Send Enquiry";
        }
    }, 1000);
}

/* =========================================================
   CONTACT PAGE - SUCCESS POPUP
   ========================================================= */

function showContactEnquirySuccess() {

    const oldPopup =
        document.getElementById(
            "contactEnquirySuccess"
        );

    if (oldPopup) {
        oldPopup.remove();
    }


    const popup =
        document.createElement("div");


    popup.id =
        "contactEnquirySuccess";


    popup.innerHTML = `

        <div class="contact-success-overlay">

            <div class="contact-success-box">

                <div class="contact-success-icon">
                    ✓
                </div>

                <h2>
                    Enquiry Sent Successfully!
                </h2>

                <p>
                    Thank you for contacting DforDecor.
                </p>

                <p>
                    We have received your enquiry
                    and will get back to you soon.
                </p>

                <button
                    type="button"
                    onclick="closeContactEnquirySuccess()"
                >
                    OK
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(popup);


    /*
     * FORCE MAIN POPUP VISIBLE
     */

    popup.style.setProperty(
        "display",
        "block",
        "important"
    );

    popup.style.setProperty(
        "visibility",
        "visible",
        "important"
    );

    popup.style.setProperty(
        "opacity",
        "1",
        "important"
    );

    popup.style.setProperty(
        "pointer-events",
        "auto",
        "important"
    );

    popup.style.setProperty(
        "position",
        "fixed",
        "important"
    );

    popup.style.setProperty(
        "top",
        "0",
        "important"
    );

    popup.style.setProperty(
        "left",
        "0",
        "important"
    );

    popup.style.setProperty(
        "width",
        "100%",
        "important"
    );

    popup.style.setProperty(
        "height",
        "100%",
        "important"
    );

    popup.style.setProperty(
        "z-index",
        "999999",
        "important"
    );


    /*
     * FORCE OVERLAY VISIBLE
     */

    const overlay =
        popup.querySelector(
            ".contact-success-overlay"
        );


    if (overlay) {

        overlay.style.setProperty(
            "display",
            "flex",
            "important"
        );

        overlay.style.setProperty(
            "visibility",
            "visible",
            "important"
        );

        overlay.style.setProperty(
            "opacity",
            "1",
            "important"
        );

        overlay.style.setProperty(
            "position",
            "fixed",
            "important"
        );

        overlay.style.setProperty(
            "top",
            "0",
            "important"
        );

        overlay.style.setProperty(
            "left",
            "0",
            "important"
        );

        overlay.style.setProperty(
            "width",
            "100%",
            "important"
        );

        overlay.style.setProperty(
            "height",
            "100%",
            "important"
        );

        overlay.style.setProperty(
            "z-index",
            "999999",
            "important"
        );

        overlay.style.setProperty(
            "align-items",
            "center",
            "important"
        );

        overlay.style.setProperty(
            "justify-content",
            "center",
            "important"
        );

    }


    console.log(
        "DforDecor enquiry success popup displayed."
    );

}

/* =========================================================
   CONTACT PAGE - CLOSE SUCCESS POPUP
   ========================================================= */

function closeContactEnquirySuccess() {

    const popup =
        document.getElementById(
            "contactEnquirySuccess"
        );


    if (popup) {

        popup.remove();

    }

}


/* =========================================================
   CONTACT PAGE - WHATSAPP
   ========================================================= */

function sendWhatsAppEnquiry() {

    const data =
        getContactEnquiryData();


    if (!validateContactEnquiry(data)) {
        return;
    }


    const message = `

Hello DforDecor,

I would like to enquire about your gifts.

Name: ${data.name}

WhatsApp Number: ${data.phone}

Email: ${data.email || "Not provided"}

Quantity: ${data.quantity}

Preferred Delivery Date:
${data.deliveryDate || "Not decided"}

Special Requirement:
${data.specialMessage}

Please share product availability, packaging options and final pricing.

Thank you.
`.trim();


    const whatsappURL =
        "https://wa.me/917447771550?text=" +
        encodeURIComponent(message);


    window.open(
        whatsappURL,
        "_blank",
        "noopener"
    );

}