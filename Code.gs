/\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*

 \* DforDecor - Gift Order / Enquiry Email Service

 \* Version: 2026-10 FINAL

 \*

 \* Business Email:

 \* salesdfordecor\@gmail.com

 \*

 \* Website:

 \* https\://dfordecor.netlify.app

 \*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*/





/\* ============================================================

   BUSINESS SETTINGS

   ============================================================ \*/



const BUSINESS_EMAIL = "salesdfordecor\@gmail.com";

const BUSINESS_NAME = "DforDecor";

const BUSINESS_PHONE = "9890021266";



const LOGO_URL =

  "https\://dfordecor.netlify.app/images/ddecor-logo.jpeg";





/\* ============================================================

   GET

   ============================================================ \*/



function doGet(e) {

  return createResponse({

    success: true,

    message: "DforDecor enquiry service is running.",

    business: BUSINESS_NAME

  });

}





/\* ============================================================

   POST

   ============================================================ \*/



function doPost(e) {



  try {



    const data = getRequestData(e);



    Logger.log("========== DforDecor ORDER ==========");

    Logger.log(JSON.stringify(data, null, 2));





    /\* ========================================================

       CUSTOMER DETAILS

       ======================================================== \*/



    const customerName =

      clean(data.customer_name || data.name);



    const customerPhone =

      clean(data.customer_phone || data.phone);



    const customerEmail =

      clean(data.customer_email || data.email);



    const occasion =

      clean(data.occasion);



    const budget =

      clean(

        data.budget_per_gift ||

        data.budget ||

        data.budgetPerGift

      );



    const deliveryDate =

      clean(data.delivery_date);





    /\* ========================================================

       PRODUCTS

       ======================================================== \*/



    const products =

      clean(

        data.products ||

        data.selected_products ||

        data.cart_items

      );





    /\* ========================================================

       TOTAL

       ======================================================== \*/



    const selectedTotal =

      clean(

        data.selected_total ||

        data.cart_total ||

        data.total

      );



    const orderTotal =

      clean(

        data.order_total ||

        data.estimated_order_value ||

        data.total_value ||

        selectedTotal

      );





    /\* ========================================================

       OTHER DETAILS

       ======================================================== \*/



    const specialMessage =

      clean(

        data.special_message ||

        data.special_instructions

      );



    const orderId =

      clean(data.order_id);



    const orderType =

      clean(data.order_type);



    const paymentStatus =

      clean(data.payment_status);



    const shippingAddress =

      clean(data.shipping_address);



    const shippingCity =

      clean(data.shipping_city);



    const shippingPincode =

      clean(data.shipping_pincode);



    const upiId =

      clean(data.upi_id);



    const paymentScreenshot =

      clean(data.payment_screenshot_data);





    /\* ========================================================

       DETERMINE ORDER

       ======================================================== \*/



    const isOrder =

    orderId !== "" ||

    paymentStatus !== "" ||

    orderTotal !== "" ||

    paymentScreenshot !== "";



    /\* ========================================================

       BUSINESS EMAIL

       ======================================================== \*/



    let businessSubject;



if (isOrder) {

    businessSubject =

        "🎁 New DforDecor Gift Order - " +

        (orderId || customerName || "New Order");

} else {

    businessSubject =

        "🎁 DforDecor – Bulk Quantity & Product Availability Enquiry";

}





    const businessHtml =

      createBusinessEmailHtml({



        customerName,

        customerPhone,

        customerEmail,

        occasion,



        budget,



        deliveryDate,



        products,



        selectedTotal,



        orderTotal,



        specialMessage,



        orderId,



        orderType,



        paymentStatus,



        shippingAddress,



        shippingCity,



        shippingPincode,



        upiId,



        isOrder



      });





    const businessPlainText =

      createBusinessPlainText({



        customerName,

        customerPhone,

        customerEmail,

        occasion,



        budget,



        deliveryDate,



        products,



        selectedTotal,



        orderTotal,



        specialMessage,



        orderId,



        orderType,



        paymentStatus,



        shippingAddress,



        shippingCity,



        shippingPincode,



        isOrder



      });





    /\* ========================================================

       ATTACHMENT

       ======================================================== \*/



    const businessAttachments =

      createScreenshotAttachment(

        paymentScreenshot

      );





    /\* ========================================================

       SEND BUSINESS EMAIL

       ======================================================== \*/



    MailApp.sendEmail({



      to: BUSINESS_EMAIL,



      subject: businessSubject,



      body: businessPlainText,



      htmlBody: businessHtml,



      name: BUSINESS_NAME,



      attachments: businessAttachments



    });





    Logger.log(

      "Business email sent to: " +

      BUSINESS_EMAIL

    );





    /\* ========================================================

       CUSTOMER EMAIL

       EMAIL IS OPTIONAL

       ======================================================== \*/



    let customerEmailSent = false;





    if (

      customerEmail &&

      isValidEmail(customerEmail)

    ) {



      const customerSubject = isOrder

        ? "🎁 Your DforDecor Gift Order Has Been Received"

        : "🎁 Thank You for Contacting DforDecor";





      const customerHtml =

        createCustomerEmailHtml({



          customerName,

          customerPhone,

          customerEmail,

          occasion,



          budget,



          deliveryDate,



          products,



          selectedTotal,



          orderTotal,



          specialMessage,



          orderId,



          paymentStatus,



          shippingAddress,



          shippingCity,



          shippingPincode,



          isOrder



        });





      const customerPlainText =

        createCustomerPlainText({



          customerName,

          customerPhone,

          customerEmail,

          occasion,



          budget,



          deliveryDate,



          products,



          selectedTotal,



          orderTotal,



          specialMessage,



          orderId,



          paymentStatus,



          shippingAddress,



          shippingCity,



          shippingPincode,



          isOrder



        });





      const customerAttachments =

        createScreenshotAttachment(

          paymentScreenshot

        );





      MailApp.sendEmail({



        to: customerEmail,



        subject: customerSubject,



        body: customerPlainText,



        htmlBody: customerHtml,



        name: BUSINESS_NAME,



        attachments: customerAttachments



      });





      customerEmailSent = true;





      Logger.log(

        "Customer email sent to: " +

        customerEmail

      );



    }





    /\* ========================================================

       RESPONSE

       ======================================================== \*/



    return createResponse({



      success: true,



      message:

        isOrder

          ? "Order received successfully."

          : "Enquiry received successfully.",



      order_id: orderId,



      customer_email_sent:

        customerEmailSent



    });





  } catch (error) {



    Logger.log(

      "DforDecor ERROR: " +

      error.stack

    );





    return createResponse({



      success: false,



      message: error.message



    });



  }



}





/\* ============================================================

   GET REQUEST DATA

   Supports:

   1. URLSearchParams / form data

   2. JSON

   ============================================================ \*/



function getRequestData(e) {



  let data = {};





  if (!e) {

    return data;

  }





  /\* ----------------------------------------------------------

     FORM / URL PARAMETERS

     ---------------------------------------------------------- \*/



  if (e.parameter) {



    Object.keys(e.parameter).forEach(function(key) {



      data[key] = e.parameter[key];



    });



  }





  /\* ----------------------------------------------------------

     JSON BODY

     ---------------------------------------------------------- \*/



  if (

    e.postData &&

    e.postData.contents

  ) {



    const content =

      e.postData.contents.trim();





    if (content) {



      try {



        const jsonData =

          JSON.parse(content);





        if (

          jsonData &&

          typeof jsonData === "object"

        ) {



          Object.keys(jsonData).forEach(function(key) {



            data[key] = jsonData[key];



          });



        }



      } catch (jsonError) {



        Logger.log(

          "POST body is not JSON. Using form parameters."

        );



      }



    }



  }





  return data;



}





/\* ============================================================

   BUSINESS HTML EMAIL

   ============================================================ \*/



function createBusinessEmailHtml(data) {



  const customerName =

    escapeHtml(

      data.customerName || "Customer"

    );



  const customerPhone =

    escapeHtml(

      data.customerPhone || "-"

    );



  const customerEmail =

    escapeHtml(

      data.customerEmail || "-"

    );



  const occasion =

    escapeHtml(

      data.occasion || "-"

    );



  const budget =

    escapeHtml(

      data.budget || "-"

    );



  const deliveryDate =

    escapeHtml(

      data.deliveryDate || "-"

    );



  const orderTotal =

    escapeHtml(

      data.orderTotal ||

      data.selectedTotal ||

      "-"

    );



  const orderId =

    escapeHtml(

      data.orderId || "-"

    );



  const paymentStatus =

    escapeHtml(

      data.paymentStatus || "-"

    );



  const productsHtml =

    formatProductsHtml(

      data.products

    );





  return \`



\<!DOCTYPE html>



\<html>



\<head>



\<meta charset="UTF-8">



\</head>





\<body style="

margin:0;

padding:0;

background:#f8f3eb;

font-family:Arial,Helvetica,sans-serif;

">





\<div style="

max-width:700px;

margin:25px auto;

background:#ffffff;

border-radius:16px;

overflow:hidden;

box-shadow:0 4px 18px rgba(80,50,20,0.12);

">





\<!-- HEADER -->



\<div style="

background:linear-gradient(135deg,#7b4936,#b9654b);

padding:25px;

text-align:center;

">



\<img

src="${LOGO_URL}"

alt="DforDecor"

style="

max-width:210px;

max-height:90px;

object-fit:contain;

background:#ffffff;

padding:8px;

border-radius:10px;

">



\<div style="

color:#ffffff;

font-size:14px;

margin-top:12px;

letter-spacing:1px;

">



Beautiful Gifts. Meaningful Moments.



\</div>



\</div>





\<!-- CONTENT -->



\<div style="padding:28px;">





\<h2 style="

margin-top:0;

color:#7b4936;

">



${data.isOrder

  ? "🎁 New Gift Order Received"

  : "📦 BULK QUANTITY & PRODUCT AVAILABILITY ENQUIRY"}



\</h2>





\<p>



A new ${data.isOrder ? "gift order" : "gift enquiry"}

has been received from



\<strong>${customerName}\</strong>.



\</p>





\<!-- CUSTOMER DETAILS -->



\<div style="

margin-top:20px;

padding:18px;

background:#fbf7ef;

border-left:5px solid #c99a4a;

border-radius:10px;

">



\<h3 style="

margin-top:0;

color:#7b4936;

">



Customer Details



\</h3>





\<p>

\<strong>Name:\</strong>

${customerName}

\</p>



\<p>

\<strong>Phone:\</strong>

${customerPhone}

\</p>



\<p>

\<strong>Email:\</strong>

${customerEmail}

\</p>



\<p>

\<strong>Occasion:\</strong>

${occasion}

\</p>



\</div>





\<!-- ORDER DETAILS -->



\<div style="

margin-top:22px;

">



\<h3 style="color:#7b4936;">



Order Details



\</h3>





\<table

width="100%"

cellpadding="0"

cellspacing="0"

style="

border-collapse:collapse;

font-size:14px;

border:1px solid #eadfce;

">





\<tr>



\<td style="

padding:12px;

font-weight:bold;

background:#fbf7ef;

width:40%;

">



Order ID



\</td>



\<td style="padding:12px;">



${orderId}



\</td>



\</tr>





\<tr>



\<td style="

padding:12px;

font-weight:bold;

background:#fbf7ef;

">



Budget Per Gift



\</td>



\<td style="padding:12px;">



${budget}



\</td>



\</tr>





\<tr>



\<td style="

padding:12px;

font-weight:bold;

background:#fbf7ef;

">



Delivery Date



\</td>



\<td style="padding:12px;">



${deliveryDate}



\</td>



\</tr>





\<tr>



\<td style="

padding:12px;

font-weight:bold;

background:#fbf7ef;

">



Payment Status



\</td>



\<td style="padding:12px;">



${paymentStatus}



\</td>



\</tr>





\</table>



\</div>





\<!-- PRODUCTS -->



\<div style="

margin-top:24px;

">



\<h3 style="color:#7b4936;">



🎁 Selected Gifts



\</h3>



${productsHtml}



\</div>





\<!-- TOTAL -->



\<div style="

margin-top:22px;

padding:20px;

background:#7b4936;

color:#ffffff;

border-radius:12px;

text-align:center;

">



\<div style="font-size:14px;">



Order Total



\</div>





\<div style="

font-size:28px;

font-weight:bold;

margin-top:7px;

">



${orderTotal}



\</div>



\</div>





\<!-- DELIVERY -->



\<div style="

margin-top:22px;

padding:18px;

background:#fbf7ef;

border:1px solid #eadfce;

border-radius:10px;

">



\<h3 style="color:#7b4936;">



📦 Delivery Details



\</h3>



${data.shippingAddress

  ? \`\<p>

\<strong>Address:\</strong>

${escapeHtml(data.shippingAddress)}

\</p>\`

  : ""}



${data.shippingCity

  ? \`\<p>

\<strong>City:\</strong>

${escapeHtml(data.shippingCity)}

\</p>\`

  : ""}



${data.shippingPincode

  ? \`\<p>

\<strong>Pincode:\</strong>

${escapeHtml(data.shippingPincode)}

\</p>\`

  : ""}



\</div>





${data.specialMessage

  ? \`



\<div style="

margin-top:20px;

padding:18px;

background:#fff8e8;

border:1px solid #e7c77a;

border-radius:10px;

">



\<strong>Special Message:\</strong>



\<p style="

white-space:pre-line;

">



${escapeHtml(data.specialMessage)}



\</p>



\</div>



\`

  : ""}





\<!-- FOOTER -->



\<div style="

margin-top:28px;

padding-top:20px;

border-top:1px solid #eadfce;

font-size:14px;

color:#555555;

line-height:1.7;

">



\<p>



Please contact the customer to confirm:



\</p>



\<ul>



\<li>Product availability\</li>

\<li>Final pricing\</li>

\<li>Packaging\</li>

\<li>Customization\</li>

\<li>Delivery\</li>

\<li>Payment\</li>



\</ul>





\<p>



\<strong>WhatsApp:\</strong>

+91 7447771550



\<br>



\<strong>Email:\</strong>

salesdfordecor\@gmail.com



\</p>



\</div>





\</div>





\<!-- BRAND FOOTER -->



\<div style="

background:#fbf7ef;

padding:20px;

text-align:center;

color:#7b4936;

">



\<strong>DforDecor\</strong>



\<div style="

font-size:13px;

margin-top:5px;

">



Beautiful Gifts. Meaningful Moments.



\</div>



\<div style="

font-size:12px;

margin-top:7px;

color:#777777;

">



Pune, Maharashtra



\</div>



\</div>





\</div>



\</body>



\</html>



\`;



}





/\* ============================================================

   CUSTOMER HTML EMAIL

   ============================================================ \*/



function createCustomerEmailHtml(data) {



  const customerName =

    escapeHtml(data.customerName || "Customer");



  const orderId =

    escapeHtml(data.orderId || "-");



  const budget =

    escapeHtml(data.budget || "-");



  const deliveryDate =

    escapeHtml(data.deliveryDate || "-");



  const paymentStatus =

    escapeHtml(

      data.paymentStatus ||

      "Payment Screenshot Submitted"

    );



  const orderTotal =

    escapeHtml(

      data.orderTotal ||

      data.selectedTotal ||

      "-"

    );



  const productsHtml =

    formatProductsHtml(data.products);



  const isOrder = data.isOrder === true;



  return \`



\<!DOCTYPE html>

\<html>



\<head>

\<meta charset="UTF-8">

\</head>



\<body style="

margin:0;

padding:0;

background:#f8f3eb;

font-family:Arial,Helvetica,sans-serif;

">



\<div style="

max-width:680px;

margin:25px auto;

background:#ffffff;

border-radius:16px;

overflow:hidden;

box-shadow:0 4px 18px rgba(80,50,20,0.12);

">



\<!-- HEADER -->



\<div style="

background:linear-gradient(135deg,#7b4936,#b9654b);

padding:25px;

text-align:center;

">



\<img

src="${LOGO_URL}"

alt="DforDecor"

style="

max-width:210px;

max-height:90px;

object-fit:contain;

background:#ffffff;

padding:8px;

border-radius:10px;

">



\<div style="

color:#ffffff;

font-size:14px;

margin-top:12px;

letter-spacing:1px;

">



Beautiful Gifts. Meaningful Moments.



\</div>



\</div>





\<!-- CONTENT -->



\<div style="padding:28px;">



\<h2 style="

margin-top:0;

color:#7b4936;

">



Hello ${customerName},



\</h2>





\<p style="

font-size:15px;

line-height:1.7;

">



${isOrder

  ? \`Thank you for choosing \<strong>DforDecor\</strong>.\`

  : \`Thank you for contacting \<strong>DforDecor\</strong>.\`

}



\</p>





\<div style="

margin-top:18px;

padding:18px;

background:#f7f0e4;

border-left:5px solid #c99a4a;

border-radius:10px;

">



\<strong>



${isOrder

  ? \`🎉 Your order has been received successfully!\`

  : \`📩 Your enquiry has been received successfully!\`

}



\</strong>



\<p style="margin-bottom:0;">



${isOrder

  ? \`

  We have received your order and payment details.

  \<strong>We will get back to you soon.\</strong>

  \`

  : \`

  We have received your enquiry regarding

  \<strong>bulk quantity and product availability.\</strong>

  \<br>\<br>

  \<strong>We will get back to you soon.\</strong>

  \`

}



\</p>



\</div>





\<!-- ORDER INFORMATION -->



\<h3 style="

color:#7b4936;

margin-top:28px;

">



${isOrder ? "Order Information" : "Enquiry Information"}



\</h3>





\<table

width="100%"

cellpadding="0"

cellspacing="0"

style="

border-collapse:collapse;

border:1px solid #eadfce;

font-size:14px;

">





\<tr>



\<td style="

padding:12px;

font-weight:bold;

background:#fbf7ef;

">



Order ID



\</td>



\<td style="padding:12px;">



${orderId}



\</td>



\</tr>





\<tr>



\<td style="

padding:12px;

font-weight:bold;

background:#fbf7ef;

">



Budget Per Gift



\</td>



\<td style="padding:12px;">



${budget}



\</td>



\</tr>





\<tr>



\<td style="

padding:12px;

font-weight:bold;

background:#fbf7ef;

">



Delivery Date



\</td>



\<td style="padding:12px;">



${deliveryDate}



\</td>



\</tr>





\<tr>



\<td style="

padding:12px;

font-weight:bold;

background:#fbf7ef;

">



Payment Status



\</td>



\<td style="padding:12px;">



${paymentStatus}



\</td>



\</tr>





\</table>





\<!-- SELECTED GIFTS -->



\<h3 style="

color:#7b4936;

margin-top:28px;

">



🎁 Your Selected Gifts



\</h3>





${productsHtml}





\<!-- TOTAL -->



\<div style="

margin-top:22px;

padding:20px;

background:#7b4936;

color:#ffffff;

text-align:center;

border-radius:12px;

">



\<div style="

font-size:14px;

">



${isOrder ? "Order Total" : "Estimated Total"}



\</div>





\<div style="

font-size:28px;

font-weight:bold;

margin-top:6px;

">



${orderTotal}



\</div>



\</div>





\<!-- DELIVERY -->



${

  (

    data.shippingAddress ||

    data.shippingCity ||

    data.shippingPincode

  )

  ? \`



\<div style="

margin-top:24px;

padding:18px;

background:#fbf7ef;

border:1px solid #eadfce;

border-radius:10px;

">



\<h3 style="color:#7b4936;">



📦 Delivery Details



\</h3>





${

  data.shippingAddress

  ? \`

  \<p>

  \<strong>Address:\</strong>

  ${escapeHtml(data.shippingAddress)}

  \</p>

  \`

  : ""

}





${

  data.shippingCity

  ? \`

  \<p>

  \<strong>City:\</strong>

  ${escapeHtml(data.shippingCity)}

  \</p>

  \`

  : ""

}





${

  data.shippingPincode

  ? \`

  \<p>

  \<strong>Pincode:\</strong>

  ${escapeHtml(data.shippingPincode)}

  \</p>

  \`

  : ""

}



\</div>



\`

  : ""

}





\<!-- MESSAGE -->



\<div style="

margin-top:25px;

font-size:14px;

line-height:1.8;

color:#555555;

">



\<p>



\<strong>We will get back to you soon.\</strong>



\</p>



\<p>



Our team will confirm:



\</p>



\<ul>



\<li>Product availability\</li>



\<li>Final pricing\</li>



\<li>Packaging\</li>



\<li>Customization\</li>



\<li>Delivery\</li>



\</ul>





\<p>



For assistance:



\<br>



\<strong>WhatsApp:\</strong>

+91 7447771550



\<br>



\<strong>Email:\</strong>

salesdfordecor\@gmail.com



\</p>



\</div>





\</div>





\<!-- FOOTER -->



\<div style="

background:#fbf7ef;

padding:20px;

text-align:center;

color:#7b4936;

">



\<strong>DforDecor\</strong>



\<div style="

font-size:13px;

margin-top:5px;

">



Beautiful Gifts. Meaningful Moments.



\</div>



\<div style="

font-size:12px;

margin-top:7px;

color:#777777;

">



Pune, Maharashtra



\</div>



\</div>





\</div>



\</body>



\</html>



\`;



}





/\* ============================================================

   BUSINESS PLAIN TEXT

   ============================================================ \*/



function createBusinessPlainText(data) {



  return (



    "DforDecor\n" +

    "Beautiful Gifts. Meaningful Moments.\n\n" +



    (

      data.isOrder

        ? "NEW GIFT ORDER\n\n"

        : "NEW GIFT ENQUIRY\n\n"

    ) +



    "Customer Name: " +

    (data.customerName || "-") +

    "\n" +



    "Phone: " +

    (data.customerPhone || "-") +

    "\n" +



    "Email: " +

    (data.customerEmail || "-") +

    "\n" +



    "Occasion: " +

    (data.occasion || "-") +

    "\n\n" +



    "Order ID: " +

    (data.orderId || "-") +

    "\n" +



    "Budget Per Gift: " +

    (data.budget || "-") +

    "\n" +



    "Delivery Date: " +

    (data.deliveryDate || "-") +

    "\n" +



    "Payment Status: " +

    (data.paymentStatus || "-") +

    "\n\n" +



    "SELECTED GIFTS\n\n" +



    (data.products || "No products selected.") +



    "\n\n" +



    "ORDER TOTAL: " +



    (

      data.orderTotal ||

      data.selectedTotal ||

      "-"

    ) +



    "\n\n" +



    (

      data.shippingAddress

        ? "Address: " +

          data.shippingAddress +

          "\n"

        : ""

    ) +



    (

      data.shippingCity

        ? "City: " +

          data.shippingCity +

          "\n"

        : ""

    ) +



    (

      data.shippingPincode

        ? "Pincode: " +

          data.shippingPincode +

          "\n"

        : ""

    ) +



    "\n" +



    "WhatsApp: +91 7447771550\n" +



    "Email: salesdfordecor\@gmail.com\n\n" +



    "DforDecor\n" +

    "Pune, Maharashtra"



  );



}





/\* ============================================================

   CUSTOMER PLAIN TEXT

   ============================================================ \*/



function createCustomerPlainText(data) {



  const isOrder = data.isOrder === true;



  return (



    "Hello " +

    (data.customerName || "Customer") +

    ",\n\n" +



    (

      isOrder

        ? "Thank you for choosing DforDecor.\n\n"

        : "Thank you for contacting DforDecor.\n\n"

    ) +



    (

      isOrder

        ? "YOUR ORDER HAS BEEN RECEIVED SUCCESSFULLY.\n\n"

        : "YOUR ENQUIRY HAS BEEN RECEIVED SUCCESSFULLY.\n\n"

    ) +



    (

      isOrder

        ? "We have received your order and payment details.\n"

        : "We have received your enquiry regarding bulk quantity and product availability.\n"

    ) +



    "We will get back to you soon.\n\n" +



    (

      isOrder

        ? "ORDER INFORMATION\n\n"

        : "ENQUIRY INFORMATION\n\n"

    ) +



    "Order ID: " +

    (data.orderId || "-") +

    "\n" +



    "Budget Per Gift: " +

    (data.budget || "-") +

    "\n" +



    "Delivery Date: " +

    (data.deliveryDate || "-") +

    "\n" +



    "Payment Status: " +

    (data.paymentStatus || "-") +

    "\n\n" +



    "SELECTED GIFTS\n\n" +



    (data.products || "No products selected.") +



    "\n\n" +



    (

      isOrder

        ? "ORDER TOTAL: "

        : "ESTIMATED TOTAL: "

    ) +



    (

      data.orderTotal ||

      data.selectedTotal ||

      "-"

    ) +



    "\n\n" +



    "We will get back to you soon.\n\n" +



    "WhatsApp: +91 7447771550\n" +

    "Email: salesdfordecor\@gmail.com\n\n" +



    "Thank you for contacting DforDecor.\n\n" +



    "Beautiful Gifts. Meaningful Moments.\n" +



    "DforDecor\n" +



    "Pune, Maharashtra"



  );



}





/\* ============================================================

   PRODUCTS TABLE

   ============================================================



   Expected input:



   Dry Fruit Pack | 4 | ₹199 | ₹796

   Cookie Box | 2 | ₹99 | ₹198



   Output:



   Item Name | Quantity | Cost / Item | Total Cost

   TOTAL     | 6        | -           | ₹994



   ============================================================ \*/



function formatProductsHtml(products) {



  if (!products) {



    return \`



\<div style="

padding:15px;

border:1px solid #eadfce;

border-radius:10px;

background:#ffffff;

color:#777777;

">



No products selected.



\</div>



\`;



  }





  const lines =

    String(products)

      .split(/\r?\n/)

      .filter(function(line) {



        return line.trim() !== "";



      });





  let rows = "";



  let grandQuantity = 0;



  let grandTotal = 0;





  lines.forEach(function(line) {



    const parts =

      line.split("|");





    if (parts.length >= 4) {



      const itemName =

        escapeHtml(

          parts[0].trim()

        );



      const quantityText =

        parts[1].trim();



      const itemCostText =

        parts[2].trim();



      const totalCostText =

        parts[3].trim();





      const quantityNumber =

        parseFloat(

          quantityText.replace(

            /[^0-9.-]/g,

            ""

          )

        ) || 0;





      const totalCostNumber =

        parseFloat(

          totalCostText.replace(

            /[^0-9.-]/g,

            ""

          )

        ) || 0;





      grandQuantity +=

        quantityNumber;



      grandTotal +=

        totalCostNumber;





      rows += \`



\<tr>



\<td style="

padding:12px 10px;

border-bottom:1px solid #eeeeee;

text-align:left;

">



${itemName}



\</td>





\<td style="

padding:12px 10px;

border-bottom:1px solid #eeeeee;

text-align:center;

">



${escapeHtml(quantityText)}



\</td>





\<td style="

padding:12px 10px;

border-bottom:1px solid #eeeeee;

text-align:right;

white-space:nowrap;

">



${escapeHtml(itemCostText)}



\</td>





\<td style="

padding:12px 10px;

border-bottom:1px solid #eeeeee;

text-align:right;

font-weight:bold;

white-space:nowrap;

">



${escapeHtml(totalCostText)}



\</td>



\</tr>



\`;



    }



  });





  const formattedQuantity =

    Number.isInteger(grandQuantity)

      ? String(grandQuantity)

      : String(grandQuantity);





  const formattedTotal =

    "₹" +

    grandTotal.toLocaleString(

      "en-IN"

    );





  return \`



\<div style="

border:1px solid #eadfce;

border-radius:12px;

overflow:hidden;

background:#ffffff;

">





\<table

width="100%"

cellpadding="0"

cellspacing="0"

style="

border-collapse:collapse;

font-family:Arial,Helvetica,sans-serif;

font-size:14px;

">





\<thead>



\<tr style="

background:#7b4936;

color:#ffffff;

">





\<th style="

padding:13px 10px;

text-align:left;

">



Item Name



\</th>





\<th style="

padding:13px 10px;

text-align:center;

white-space:nowrap;

">



Quantity



\</th>





\<th style="

padding:13px 10px;

text-align:right;

white-space:nowrap;

">



Cost / Item



\</th>





\<th style="

padding:13px 10px;

text-align:right;

white-space:nowrap;

">



Total Cost



\</th>





\</tr>



\</thead>





\<tbody>



${rows}





\<!-- TOTAL -->



\<tr style="

background:#fff8e8;

font-weight:bold;

">





\<td style="

padding:13px 10px;

color:#7b4936;

">



TOTAL



\</td>





\<td style="

padding:13px 10px;

text-align:center;

color:#7b4936;

">



${formattedQuantity}



\</td>





\<td style="

padding:13px 10px;

text-align:right;

">



\-



\</td>





\<td style="

padding:13px 10px;

text-align:right;

color:#7b4936;

white-space:nowrap;

">



${formattedTotal}



\</td>





\</tr>





\</tbody>



\</table>



\</div>



\`;



}





/\* ============================================================

   PAYMENT SCREENSHOT ATTACHMENT

   ============================================================



   The website sends:



   data:image/png;base64,...



   or



   data:image/jpeg;base64,...



   This converts it into an email attachment.

   ============================================================ \*/



function createScreenshotAttachment(

  screenshotData

) {



  if (!screenshotData) {

    return [];

  }





  try {



    let mimeType =

      "image/png";



    let extension =

      "png";



    let base64Data =

      screenshotData;





    /\* --------------------------------------------------------

       DATA URI

       -------------------------------------------------------- \*/



    if (

      screenshotData.indexOf(

        "data:"

      ) === 0

    ) {



      const commaIndex =

        screenshotData.indexOf(",");





      if (commaIndex > -1) {



        const header =

          screenshotData.substring(

            0,

            commaIndex

          );



        base64Data =

          screenshotData.substring(

            commaIndex + 1

          );





        const mimeMatch =

          header.match(

            /data:([^;]+);base64/

          );





        if (mimeMatch) {



          mimeType =

            mimeMatch[1];



        }





        if (

          mimeType ===

          "image/jpeg"

        ) {



          extension =

            "jpg";



        }



        else if (

          mimeType ===

          "image/webp"

        ) {



          extension =

            "webp";



        }



        else {



          extension =

            "png";



        }



      }



    }





    /\* --------------------------------------------------------

       REMOVE WHITESPACE

       -------------------------------------------------------- \*/



    base64Data =

      base64Data.replace(

        /\s/g,

        ""

      );





    /\* --------------------------------------------------------

       DECODE

       -------------------------------------------------------- \*/



    const bytes =

      Utilities.base64Decode(

        base64Data

      );





    const blob =

      Utilities.newBlob(

        bytes,

        mimeType,

        "DforDecor_Payment_Screenshot." +

        extension

      );





    return [blob];





  } catch (error) {



    Logger.log(

      "Screenshot attachment error: " +

      error.message

    );





    return [];



  }



}





/\* ============================================================

   ESCAPE HTML

   ============================================================ \*/



function escapeHtml(value) {



  if (

    value === null ||

    value === undefined

  ) {



    return "";



  }





  return String(value)



    .replace(

      /&/g,

      "&amp;"

    )



    .replace(

      /\</g,

      "&lt;"

    )



    .replace(

      />/g,

      "&gt;"

    )



    .replace(

      /"/g,

      "&quot;"

    )



    .replace(

      /'/g,

      "&#039;"

    );



}





/\* ============================================================

   CLEAN VALUE

   ============================================================ \*/



function clean(value) {



  if (

    value === null ||

    value === undefined

  ) {



    return "";



  }





  return String(value).trim();



}





/\* ============================================================

   EMAIL VALIDATION

   ============================================================ \*/



function isValidEmail(email) {



  return /^[^\s@]+@[^\s@]+\\.[^\s@]+$/.test(

    String(email).trim()

  );



}





/\* ============================================================

   JSON RESPONSE

   ============================================================ \*/



function createResponse(data) {



  return ContentService



    .createTextOutput(

      JSON.stringify(data)

    )



    .setMimeType(

      ContentService.MimeType.JSON

    );



}