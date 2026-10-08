/* =========================================================
   DFORDECOR - MAIN JAVASCRIPT

   Common Header + Footer
   Mobile Menu
   Language Switching
   Gift Builder
   Cart
   WhatsApp / Email Enquiry
   Google Apps Script Enquiry
   Hero Image Slideshow
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const GOOGLE_APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxRk0r7cpHa_MuHdlabwcw6IR9W89aMk_Ifx--wyXn8I-9WQcSHJQ1w5F1eBjIZA6sA/exec";

const WA_NUMBER = "919890021266";

const EMAIL_TO = "salesdfordecor@gmail.com";


let selectedBudget = 0;

let cart = {};


/* =========================================================
   COMMON COMPONENT LOADER
========================================================= */

async function loadComponent(elementId, filePath) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    try {

        const response =
            await fetch(filePath);

        if (!response.ok) {

            throw new Error(
                `Failed to load ${filePath}`
            );

        }

        element.innerHTML =
            await response.text();

    } catch (error) {

        console.error(
            `Component loading error: ${filePath}`,
            error
        );

    }
}


async function loadCommonComponents() {

    await Promise.all([

        loadComponent(
            "site-header",
            "components/header.html"
        ),

        loadComponent(
            "site-footer",
            "components/footer.html"
        )

    ]);

}


/* =========================================================
   MOBILE MENU
========================================================= */

function toggleMenu() {

    const nav =
        document.getElementById("navLinks");

    const button =
        document.querySelector(".menu-btn");

    if (!nav) {
        return;
    }

    nav.classList.toggle("active");

    if (button) {

        const isOpen =
            nav.classList.contains("active");

        button.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

        button.setAttribute(
            "aria-label",
            isOpen
                ? "Close menu"
                : "Open menu"
        );

        button.innerHTML =
            isOpen ? "✕" : "☰";
    }

}


function closeMenu() {

    const nav =
        document.getElementById("navLinks");

    const button =
        document.querySelector(".menu-btn");

    if (!nav) {
        return;
    }

    nav.classList.remove("active");

    if (button) {

        button.setAttribute(
            "aria-expanded",
            "false"
        );

        button.setAttribute(
            "aria-label",
            "Open menu"
        );

        button.innerHTML = "☰";
    }

}


/* =========================================================
   LANGUAGE SWITCHING
========================================================= */

function setLanguage(lang) {

    if (!lang) {
        lang = "en";
    }

    document.documentElement.lang =
        lang;

    document
        .querySelectorAll(
            "[data-en][data-mr]"
        )
        .forEach(element => {

            const text =
                element.getAttribute(
                    `data-${lang}`
                );

            if (text !== null) {

                element.textContent =
                    text;
            }

        });

    document
        .querySelectorAll(
            ".lang-switch button"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.lang === lang
            );

        });

    try {

        localStorage.setItem(
            "ddecor-language",
            lang
        );

    } catch (error) {

        console.warn(
            "Unable to save language preference.",
            error
        );

    }

}


function loadSavedLanguage() {

    let language = "en";

    try {

        language =
            localStorage.getItem(
                "ddecor-language"
            ) || "en";

    } catch (error) {

        language = "en";

    }

    setLanguage(language);

}


/* =========================================================
   BUDGET SELECTION
========================================================= */

function selectBudget(
    amount,
    element
) {

    selectedBudget =
        Number(amount) || 0;

    /*
     * Clear cart when budget changes.
     */

    cart = {};

    /*
     * Remove active state.
     */

    document
        .querySelectorAll(".budget-card")
        .forEach(card => {

            card.classList.remove(
                "active"
            );

        });

    /*
     * Activate selected budget.
     */

    if (element) {

        element.classList.add(
            "active"
        );

    }

    /*
     * Display budget.
     */

    const display =
        document.getElementById(
            "displayBudget"
        );

    if (display) {

        display.textContent =
            selectedBudget;

    }

    /*
     * Show product section.
     */

    const section =
        document.getElementById(
            "productSection"
        );

    if (section) {

        section.style.display =
            "block";

    }

    /*
     * Show products available
     * for selected budget.
     */

    document
        .querySelectorAll(".gift-product")
        .forEach(product => {

            product.classList.remove(
                "selected"
            );

            const minimum =
                Number(
                    product.dataset.min || 0
                );

            if (
                minimum <=
                selectedBudget
            ) {

                product.style.display =
                    "";

            } else {

                product.style.display =
                    "none";

            }

        });

    renderCart();

    updateGiftSummary();

    /*
     * Scroll to products.
     */

    setTimeout(() => {

        if (section) {

            section.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }, 100);

}


/* =========================================================
   PRODUCT SELECTION
========================================================= */

function toggleProduct(element) {

    if (!selectedBudget) {

        alert(
            "Please select a budget first."
        );

        return;
    }

    if (!element) {
        return;
    }

    const name =
        element.dataset.name || "";

    const price =
        Number(
            element.dataset.price || 0
        );

    if (!name) {
        return;
    }

    /*
     * Add / remove product.
     */

    if (cart[name]) {

        delete cart[name];

    } else {

        cart[name] = {

            name: name,

            price: price,

            qty: 1

        };

    }

    /*
     * Visual selected state.
     */

    element.classList.toggle(
        "selected",
        !!cart[name]
    );

    renderCart();

    updateGiftSummary();

}


/* =========================================================
   CHANGE PRODUCT QUANTITY
========================================================= */

function changeQty(
    name,
    delta
) {

    if (!cart[name]) {
        return;
    }

    const change =
        Number(delta) || 0;

    cart[name].qty =
        Math.max(
            1,
            cart[name].qty + change
        );

    renderCart();

    updateGiftSummary();

}


/* =========================================================
   REMOVE PRODUCT
========================================================= */

function removeProduct(name) {

    if (!name) {
        return;
    }

    delete cart[name];

    document
        .querySelectorAll(".gift-product")
        .forEach(product => {

            if (
                product.dataset.name ===
                name
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
   GET SELECTED PRODUCTS
========================================================= */

function getSelectedProducts() {

    return Object.values(cart);

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value).replace(
        /[&<>'"]/g,
        character => {

            const entities = {

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                "'": "&#39;",

                '"': "&quot;"

            };

            return entities[
                character
            ];

        }
    );

}


/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttr(value) {

    return String(value)

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        );

}


/* =========================================================
   RENDER CART
========================================================= */

function renderCart() {

    const box =
        document.getElementById(
            "selectedProductsList"
        );

    /*
     * Cart only exists on customize page.
     */

    if (!box) {
        return;
    }

    const items =
        getSelectedProducts();

    /*
     * Total item count.
     */

    const count =
        items.reduce(
            (sum, product) =>
                sum + product.qty,
            0
        );

    /*
     * Cart counter.
     */

    const counter =
        document.getElementById(
            "cartCount"
        );

    if (counter) {

        counter.textContent =
            `${count} item${
                count === 1
                    ? ""
                    : "s"
            }`;

    }

    /*
     * Empty cart.
     */

    if (!items.length) {

        box.innerHTML =
            "<p>No products selected yet.</p>";

        return;
    }

    /*
     * Render selected products.
     */

    box.innerHTML =
        items
            .map(product => {

                const safeName =
                    escapeHtml(
                        product.name
                    );

                const safeAttribute =
                    escapeAttr(
                        product.name
                    );

                const itemTotal =
                    Number(product.price) *
                    Number(product.qty);

                return `

                    <div class="cart-row">

                        <div class="cart-name">

                            <strong>
                                ${safeName}
                            </strong>

                            <small>
                                ₹${product.price} each
                            </small>

                        </div>

                        <div class="qty-control">

                            <button
                                type="button"
                                aria-label="Decrease quantity"
                                onclick="changeQty('${safeAttribute}', -1)"
                            >
                                −
                            </button>

                            <span>
                                ${product.qty}
                            </span>

                            <button
                                type="button"
                                aria-label="Increase quantity"
                                onclick="changeQty('${safeAttribute}', 1)"
                            >
                                +
                            </button>

                        </div>

                        <div class="cart-price">
                            ₹${itemTotal}
                        </div>

                        <button
                            type="button"
                            class="remove-btn"
                            onclick="removeProduct('${safeAttribute}')"
                        >
                            Remove
                        </button>

                    </div>

                `;

            })
            .join("");

}


/* =========================================================
   UPDATE GIFT SUMMARY
========================================================= */

function updateGiftSummary() {

    const items =
        getSelectedProducts();

    /*
     * Selected product total.
     */

    const total =
        items.reduce(
            (sum, product) =>
                sum +
                (
                    Number(product.price) *
                    Number(product.qty)
                ),
            0
        );

    /*
     * Quantity.
     */

    const quantityInput =
        document.getElementById(
            "quantity"
        );

    const budgetQuantity =
        Math.max(
            1,
            Number(
                quantityInput?.value ||
                1
            )
        );

    /*
     * Total available budget.
     */

    const budgetOrder =
        selectedBudget *
        budgetQuantity;

    /*
     * Remaining budget.
     */

    const remaining =
        budgetOrder -
        total;

    /*
     * Budget summary.
     */

    const budgetSummary =
        document.getElementById(
            "budgetSummary"
        );

    if (budgetSummary) {

        budgetSummary.textContent =
            `Budget per gift: ₹${
                selectedBudget || 0
            }`;

    }

    /*
     * Product summary.
     */

    const productSummary =
        document.getElementById(
            "productSummary"
        );

    if (productSummary) {

        if (items.length) {

            productSummary.innerHTML =
                items
                    .map(product => {

                        const productTotal =
                            Number(product.price) *
                            Number(product.qty);

                        return `
                            ${escapeHtml(
                                product.name
                            )}
                            × ${product.qty}
                            = ₹${productTotal}
                        `;

                    })
                    .join("<br>");

        } else {

            productSummary.textContent =
                "No products selected";

        }

    }

    /*
     * Total summary.
     */

    const totalSummary =
        document.getElementById(
            "totalSummary"
        );

    if (totalSummary) {

        totalSummary.textContent =
            `Selected Total: ₹${total}`;

    }

    /*
     * Remaining budget.
     */

    const remainingSummary =
        document.getElementById(
            "remainingSummary"
        );

    if (remainingSummary) {

        if (remaining >= 0) {

            remainingSummary.textContent =
                `Remaining Budget: ₹${remaining}`;

            remainingSummary.className =
                "remaining good";

        } else {

            remainingSummary.textContent =
                `Over Budget: ₹${Math.abs(
                    remaining
                )}`;

            remainingSummary.className =
                "remaining over";

        }

    }

    /*
     * Estimated order value.
     */

    const grandTotal =
        document.getElementById(
            "grandTotal"
        );

    if (grandTotal) {

        grandTotal.innerHTML =
            `<strong>
                Estimated Order Value: ₹${total}
            </strong>`;

    }

}


/* =========================================================
   ENQUIRY TEXT
========================================================= */

function enquiryText() {

    const items =
        getSelectedProducts();

    const name =
        document
            .getElementById(
                "customerName"
            )
            ?.value
            .trim() ||
        "Not provided";

    const phone =
        document
            .getElementById(
                "customerPhone"
            )
            ?.value
            .trim() ||
        "Not provided";

    const occasion =
        document
            .getElementById(
                "occasion"
            )
            ?.value ||
        "Not selected";

    const date =
        document
            .getElementById(
                "deliveryDate"
            )
            ?.value ||
        "Not decided";

    const quantity =
        Math.max(
            1,
            Number(
                document
                    .getElementById(
                        "quantity"
                    )
                    ?.value ||
                1
            )
        );

    const note =
        document
            .getElementById(
                "specialMessage"
            )
            ?.value
            .trim() ||
        "None";

    const total =
        items.reduce(
            (sum, product) =>
                sum +
                (
                    Number(product.price) *
                    Number(product.qty)
                ),
            0
        );

    const productList =
        items.length

            ? items
                .map(product => {

                    const productTotal =
                        Number(product.price) *
                        Number(product.qty);

                    return (
                        `- ${product.name} | ` +
                        `Qty: ${product.qty} | ` +
                        `₹${product.price} each | ` +
                        `₹${productTotal}`
                    );

                })
                .join("\n")

            : "No products selected";

    return `

DforDecor - GIFT ENQUIRY

Name: ${name}

WhatsApp: ${phone}

Occasion: ${occasion}

Budget per Gift: ₹${
        selectedBudget || 0
    }

Total Gift Quantity: ${quantity}

Delivery Date: ${date}


Selected Products:

${productList}


Estimated Order Value: ₹${total}


Special Requirement:

${note}


Please confirm availability,
packaging and final pricing.

`.trim();

}


/* =========================================================
   SEND WHATSAPP ENQUIRY
========================================================= */

function sendWhatsAppEnquiry() {

    const message =
        enquiryText();

    const url =
        `https://wa.me/${WA_NUMBER}` +
        `?text=${encodeURIComponent(
            message
        )}`;

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =========================================================
   EMAIL ENQUIRY VALIDATION
========================================================= */

function validateEmailAddress(email) {

    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(email);

}


/* =========================================================
   SEND EMAIL ENQUIRY
 *
 * IMPORTANT:
 *
 * We do NOT try to read Google's response.
 *
 * The browser sends normal form data using POST.
 * Google Apps Script reads it through e.parameter.
 *
 * This avoids the cross-origin JSON response issue.
========================================================= */

async function sendEmailEnquiry() {

    const status =
        document.getElementById(
            "emailStatus"
        );

    const button =
        document.getElementById(
            "emailEnquiryButton"
        );


    /* =====================================================
       GET CUSTOMER DETAILS
    ===================================================== */

    const customerName =
        document
            .getElementById(
                "customerName"
            )
            ?.value
            .trim() ||
        "";

    const customerPhone =
        document
            .getElementById(
                "customerPhone"
            )
            ?.value
            .trim() ||
        "";

    const customerEmail =
        document
            .getElementById(
                "customerEmail"
            )
            ?.value
            .trim() ||
        "";

    const occasion =
        document
            .getElementById(
                "occasion"
            )
            ?.value ||
        "";

    const deliveryDate =
        document
            .getElementById(
                "deliveryDate"
            )
            ?.value ||
        "";

    const specialMessage =
        document
            .getElementById(
                "specialMessage"
            )
            ?.value
            .trim() ||
        "";

    const quantity =
        Math.max(
            1,
            Number(
                document
                    .getElementById(
                        "quantity"
                    )
                    ?.value ||
                1
            )
        );


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!customerName) {

        alert(
            "Please enter your name."
        );

        document
            .getElementById(
                "customerName"
            )
            ?.focus();

        return;
    }


    if (!customerPhone) {

       alert(
        "Please enter your WhatsApp number with country code."
    );

    document
        .getElementById("customerPhone")
        ?.focus();

    return false;

}

// Remove spaces, hyphens and brackets
const cleanPhone =
    customerPhone.replace(/[\s\-()]/g, "");

// Indian WhatsApp number with mandatory +91
const phonePattern =
    /^\+91[6-9]\d{9}$/;

if (!phonePattern.test(cleanPhone)) {

    alert(
        "Please enter a valid WhatsApp number with country code.\n\n" +
        "Example: +91 9890021266"
    );

    document
        .getElementById("customerPhone")
        ?.focus();

    return false;
    }


    if (!occasion) {

        alert(
            "Please select an occasion."
        );

        document
            .getElementById(
                "occasion"
            )
            ?.focus();

        return;
    }


    /* =====================================================
       SELECTED PRODUCTS
    ===================================================== */

    const selected =
        getSelectedProducts();

    if (!selected.length) {

        alert(
            "Please select at least one product."
        );

        return;
    }


    /* =====================================================
       CALCULATE TOTAL
    ===================================================== */

    let selectedTotal = 0;

    let productText = "";


    selected.forEach(
        function(item) {

            const itemPrice =
                Number(
                    item.price || 0
                );

            const itemQty =
                Number(
                    item.qty || 1
                );

            const itemTotal =
                itemPrice *
                itemQty;


            selectedTotal +=
                itemTotal;


            productText +=
                "• " +
                item.name +
                " × " +
                itemQty +
                " @ ₹" +
                itemPrice.toLocaleString(
                    "en-IN"
                ) +
                " = ₹" +
                itemTotal.toLocaleString(
                    "en-IN"
                ) +
                "\n";

        }
    );


    /* =====================================================
       PREPARE DATA
    ===================================================== */

    const enquiryData = {

        customer_name:
            customerName,

        customer_phone:
            customerPhone,

        customer_email:
            customerEmail,

        occasion:
            occasion ||
            "Not specified",

        budget:
            selectedBudget || 0,

        quantity:
            quantity,

        delivery_date:
            deliveryDate ||
            "Not specified",

        products:
            productText ||
            "No products selected",

        selected_total:
            selectedTotal,

        estimated_order_value:
            selectedTotal,

        special_message:
            specialMessage ||
            "None"

    };


    /* =====================================================
       DISABLE BUTTON
    ===================================================== */

    if (button) {

        button.disabled = true;

        button.innerHTML =
            "📧 Sending Enquiry...";

    }


    if (status) {

        status.textContent =
            "Sending your enquiry...";

        status.style.color =
            "#6B3E2E";

    }


    /* =====================================================
       SEND TO GOOGLE APPS SCRIPT
    ===================================================== */

    try {

        /*
         * URLSearchParams creates a normal
         * application/x-www-form-urlencoded
         * POST request.
         *
         * Google Apps Script receives these
         * values through e.parameter.
         */

        const formData =
            new URLSearchParams();


        Object.keys(
            enquiryData
        ).forEach(
            function(key) {

                formData.append(
                    key,
                    enquiryData[key]
                );

            }
        );


        /*
         * IMPORTANT:
         *
         * no custom Content-Type header
         * is used.
         *
         * no response.json()
         * is used.
         *
         * no CORS response is read.
         */

        await fetch(
            GOOGLE_APPS_SCRIPT_URL,
            {
                method: "POST",

                mode: "no-cors",

                body: formData

            }
        );


        /*
         * With no-cors the browser cannot
         * read Google's response.
         *
         * But the POST has been submitted.
         */

        if (status) {

            status.textContent =
                "✓ Enquiry sent successfully! We will contact you shortly.";

            status.style.color =
                "#287A42";

        }


        if (button) {

            button.innerHTML =
                "✓ Enquiry Sent";

        }


        alert(
            "Your enquiry has been sent successfully. We will contact you shortly."
        );


        /*
         * Allow another enquiry after
         * successful submission.
         */

        setTimeout(
            function() {

                if (button) {

                    button.disabled =
                        false;

                    button.innerHTML =
                        "📧 Send Enquiry";

                }

            },
            3000
        );


    } catch (error) {

        console.error(
            "DforDecor enquiry error:",
            error
        );


        if (status) {

            status.textContent =
                "Unable to send enquiry. Please try WhatsApp.";

            status.style.color =
                "#B3261E";

        }


        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                "📧 Send Enquiry";

        }


        alert(
            "Unable to send the enquiry right now. Please try again or use WhatsApp."
        );

    }

}


/* =========================================================
   QUANTITY CHANGE LISTENER
========================================================= */

function setupQuantityListener() {

    const quantity =
        document.getElementById(
            "quantity"
        );

    if (!quantity) {
        return;
    }

    quantity.addEventListener(
        "input",
        updateGiftSummary
    );

    quantity.addEventListener(
        "change",
        updateGiftSummary
    );

}


/* =========================================================
   CLOSE MENU WHEN NAVIGATION LINK IS CLICKED
========================================================= */

function setupNavigationLinks() {

    document
        .querySelectorAll(
            "#navLinks a"
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                function() {

                    closeMenu();

                }
            );

        });

}


/* =========================================================
   CLOSE MENU WHEN CLICKING OUTSIDE
========================================================= */

function setupOutsideMenuClick() {

    document.addEventListener(
        "click",
        function(event) {

            const nav =
                document.getElementById(
                    "navLinks"
                );

            const menuButton =
                document.querySelector(
                    ".menu-btn"
                );

            if (
                !nav ||
                !menuButton
            ) {

                return;

            }

            if (

                nav.classList.contains(
                    "active"
                )

                &&

                !nav.contains(
                    event.target
                )

                &&

                !menuButton.contains(
                    event.target
                )

            ) {

                closeMenu();

            }

        }
    );

}


/* =========================================================
   CLOSE MENU WITH ESCAPE KEY
========================================================= */

function setupEscapeMenu() {

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Escape"
            ) {

                closeMenu();

            }

        }
    );

}


/* =========================================================
   HERO IMAGE SLIDESHOW
========================================================= */

function initHeroSlideshow() {

    const slides =
        document.querySelectorAll(
            ".hero-slideshow .slide"
        );

    const dots =
        document.querySelectorAll(
            ".slide-dots .dot"
        );

    if (!slides.length) {
        return;
    }

    let currentSlide = 0;

    let slideshowTimer = null;


    function showSlide(index) {

        if (
            index < 0 ||
            index >= slides.length
        ) {

            index = 0;

        }

        slides.forEach(
            (slide, i) => {

                slide.classList.toggle(
                    "active",
                    i === index
                );

            }
        );


        dots.forEach(
            (dot, i) => {

                dot.classList.toggle(
                    "active",
                    i === index
                );

            }
        );


        currentSlide = index;

    }


    function nextSlide() {

        const next =
            (
                currentSlide + 1
            ) %
            slides.length;

        showSlide(next);

    }


    function startSlideshow() {

        clearInterval(
            slideshowTimer
        );

        slideshowTimer =
            setInterval(
                nextSlide,
                3500
            );

    }


    function stopSlideshow() {

        clearInterval(
            slideshowTimer
        );

        slideshowTimer = null;

    }


    dots.forEach(
        (dot, index) => {

            if (
                index >=
                slides.length
            ) {

                return;

            }

            dot.addEventListener(
                "click",
                function() {

                    showSlide(index);

                    startSlideshow();

                }
            );

        }
    );


    document.addEventListener(
        "visibilitychange",
        function() {

            if (
                document.hidden
            ) {

                stopSlideshow();

            } else {

                startSlideshow();

            }

        }
    );


    showSlide(0);

    startSlideshow();

}


/* =========================================================
   INITIALIZE WEBSITE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        /*
         * 1. Header + footer
         */

        await loadCommonComponents();


        /*
         * 2. Language
         */

        loadSavedLanguage();


        /*
         * 3. Cart
         */

        renderCart();


        /*
         * 4. Summary
         */

        updateGiftSummary();


        /*
         * 5. Quantity
         */

        setupQuantityListener();


        /*
         * 6. Navigation
         */

        setupNavigationLinks();

        setupOutsideMenuClick();

        setupEscapeMenu();


        /*
         * 7. Slideshow
         */

        initHeroSlideshow();


        /*
         * 8. Menu accessibility
         */

        const menuButton =
            document.querySelector(
                ".menu-btn"
            );

        if (menuButton) {

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

            menuButton.setAttribute(
                "aria-label",
                "Open menu"
            );

        }

    }
);