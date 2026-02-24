// ================================
// Populate invoice form from URL parameters
// ================================
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const breed = urlParams.get('breed') || '';
    const price = urlParams.get('price') ? `$${urlParams.get('price')}` : '';
    
    const paymentSelect = document.getElementById("paymentMethod");
    const mpesaField = document.getElementById("mpesaField");
    const bankField = document.getElementById("bankField");
    const cryptoField = document.getElementById("cryptoField");

    const mpesaInput = document.getElementById("mpesa");
    const bankInput = document.getElementById("bankAccount");
    const cryptoInput = document.getElementById("crypto");
    console.log(mpesaInput, bankInput, cryptoInput);

    //Kenyan Mpesa format
mpesaInput.pattern = "^(07|01)\\d{8}$";

//Ethereum address format
cryptoInput.pattern = "^0x[a-fA-F0-9]{40}$";
cryptoInput.title = "Enter a valid Ethereum address";

    paymentSelect.addEventListener("change", function() {
        
        const selected = this.value.trim();
        console.log("Selected:", selected);
        //Hide all fields first
        mpesaField.style.display = "none";
        bankField.style.display = "none";
        cryptoField.style.display = "none";

        //Remove required from all
        mpesaInput.required = false;
        bankInput.required = false;
        cryptoInput.required = false;

        //Show selected one 
        if (this.value ==="M-Pesa"){
            mpesaField.style.display = "block";
            mpesaInput.required = true;
        }

        else if (this.value ==="Bank"){
            bankField.style.display = "block";
            bankInput.required = true;
        }

        else if (this.value ==="Crypto"){
            cryptoField.style.display = "block";
            cryptoInput.required = true;
        }
    });



    // Populate hidden fields
    document.getElementById('breed').value = breed;
    document.getElementById('price').value = price;

    // Optional: show selected cat info visually in the form
    if(breed && price) {
        const displayDiv = document.createElement('div');
        displayDiv.style.marginBottom = "15px";
        displayDiv.style.padding = "10px";
        displayDiv.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        displayDiv.style.borderRadius = "8px";
        displayDiv.innerHTML = `<strong>Selected Cat:</strong> ${breed} - <strong>Price:</strong> ${price}`;
        const form = document.getElementById('purchaseForm');
        form.insertBefore(displayDiv, form.firstChild);
    }
});

// ================================
// Handle form submission and generate PDF
// ================================
document.getElementById('purchaseForm').addEventListener('submit', function(e) {
    e.preventDefault(); // prevent page reload

    // Capture form values
    const firstName = document.getElementById('firstname').value;
    const lastName = document.getElementById('lastname').value;
    const email = document.getElementById('emailaddress').value;
    const location = document.getElementById('location').value;
    const gender = document.querySelector('input[name="gender"]:checked')?.value || '';
    const payment = document.querySelector('select[name="Payment"]').value;
    const mpesa = document.getElementById('mpesa').value;
    const bank = document.getElementById('bankAccount').value;
    const crypto = document.getElementById('crypto').value;
    const breed = document.getElementById('breed').value;
    const price = document.getElementById('price').value;

    // Create a new jsPDF instance
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Cat Site Invoice", 20, 20);

    // Customer Details
    doc.setFontSize(12);
    doc.text(`Name: ${firstName} ${lastName}`, 20, 40);
    doc.text(`Email: ${email}`, 20, 50);
    doc.text(`Location: ${location}`, 20, 60);
    doc.text(`Gender: ${gender}`, 20, 70);

    // Selected Cat Details
    doc.text(`Breed: ${breed}`, 20, 85);
    doc.text(`Price: ${price}`, 20, 95);

    // Payment Details
    doc.text(`Payment Method: ${payment}`, 20, 110);
    if(payment === "M-Pesa") doc.text(`M-Pesa Number: ${mpesa}`, 20, 120);
    if(payment === "Bank") doc.text(`Bank Account: ${bank}`, 20, 120);
    if(payment === "Crypto") doc.text(`Crypto Address: ${crypto}`, 20, 120);

    // Save the PDF
    doc.save(`Invoice_${firstName}_${lastName}.pdf`);
     // Close the page after a short delay to ensure the PDF save dialog appears
    setTimeout(() => {
        window.close();
    }, 1000); // 1 second delay
});
