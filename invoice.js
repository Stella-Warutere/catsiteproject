function loadImageDataUrl(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);

            resolve(canvas.toDataURL('image/png'));
        };
        image.onerror = reject;
        image.src = src;
    });
}

function sanitizePrice(rawPrice) {
    return (rawPrice || '').replace(/^\$+/, '');
}

function formatCurrency(rawPrice) {
    const numericPrice = Number.parseFloat(String(rawPrice).replace(/[^0-9.]/g, ''));

    if (Number.isNaN(numericPrice)) {
        return '$0.00';
    }

    return `$${numericPrice.toFixed(2)}`;
}

function parseCurrency(rawPrice) {
    const numericPrice = Number.parseFloat(String(rawPrice).replace(/[^0-9.]/g, ''));
    return Number.isNaN(numericPrice) ? 0 : numericPrice;
}

function getSafeQuantity(value) {
    const quantity = Number.parseInt(value, 10);
    return Number.isNaN(quantity) || quantity < 1 ? 1 : quantity;
}

function drawSectionTitle(doc, title, x, y) {
    doc.setFontSize(12);
    doc.setTextColor(96, 11, 152);
    doc.setFont(undefined, 'bold');
    doc.text(title, x, y);
    doc.setDrawColor(214, 190, 233);
    doc.line(x, y + 2, 190, y + 2);
}

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const breed = urlParams.get('breed') || '';
    const rawPrice = sanitizePrice(urlParams.get('price') || '');
    const formattedPrice = rawPrice ? formatCurrency(rawPrice) : '';
    const numericUnitPrice = parseCurrency(rawPrice);

    const form = document.getElementById('purchaseForm');
    const paymentSelect = document.getElementById('paymentMethod');
    const mpesaField = document.getElementById('mpesaField');
    const bankField = document.getElementById('bankField');
    const cryptoField = document.getElementById('cryptoField');
    const quantityInput = document.getElementById('quantity');
    const selectedCatBanner = document.getElementById('selectedCatBanner');

    const mpesaInput = document.getElementById('mpesa');
    const bankInput = document.getElementById('bankAccount');
    const cryptoInput = document.getElementById('crypto');

    const previewCustomer = document.getElementById('previewCustomer');
    const previewLocation = document.getElementById('previewLocation');
    const previewEmail = document.getElementById('previewEmail');
    const previewPayment = document.getElementById('previewPayment');
    const previewQuantity = document.getElementById('previewQuantity');
    const previewBreed = document.getElementById('previewBreed');
    const previewLinePrice = document.getElementById('previewLinePrice');
    const previewTotal = document.getElementById('previewTotal');

    mpesaInput.pattern = '^(07|01)\\d{8}$';
    cryptoInput.pattern = '^0x[a-fA-F0-9]{40}$';
    cryptoInput.title = 'Enter a valid Ethereum address';

    paymentSelect.addEventListener('change', function () {
        mpesaField.style.display = 'none';
        bankField.style.display = 'none';
        cryptoField.style.display = 'none';

        mpesaInput.required = false;
        bankInput.required = false;
        cryptoInput.required = false;

        if (this.value === 'M-Pesa') {
            mpesaField.style.display = 'block';
            mpesaInput.required = true;
        } else if (this.value === 'Bank') {
            bankField.style.display = 'block';
            bankInput.required = true;
        } else if (this.value === 'Crypto') {
            cryptoField.style.display = 'block';
            cryptoInput.required = true;
        }
    });

    document.getElementById('breed').value = breed;
    document.getElementById('price').value = formattedPrice;

    if (breed && formattedPrice) {
        selectedCatBanner.innerHTML = `<strong>Selected Cat:</strong> ${breed} <span>Unit Price: ${formattedPrice}</span>`;
    } else {
        selectedCatBanner.innerHTML = '<strong>Selected Cat:</strong> Choose a breed from the landing page to load invoice details.';
    }

    function updatePreview() {
        const firstName = document.getElementById('firstname').value.trim();
        const lastName = document.getElementById('lastname').value.trim();
        const email = document.getElementById('emailaddress').value.trim();
        const location = document.getElementById('location').value.trim();
        const payment = paymentSelect.value;
        const quantity = getSafeQuantity(quantityInput.value);
        const total = numericUnitPrice * quantity;

        const fullName = `${firstName} ${lastName}`.trim();

        previewCustomer.textContent = fullName || 'Your name will appear here';
        previewLocation.textContent = location || 'Your location will appear here';
        previewEmail.textContent = email || 'Your email will appear here';
        previewPayment.textContent = payment || 'Select a payment method';
        previewQuantity.textContent = String(quantity);
        previewBreed.textContent = breed || 'Selected cat';
        previewLinePrice.textContent = formatCurrency(total);
        previewTotal.textContent = formatCurrency(total);
    }

    form.addEventListener('input', updatePreview);
    paymentSelect.addEventListener('change', updatePreview);
    quantityInput.addEventListener('change', function () {
        quantityInput.value = String(getSafeQuantity(quantityInput.value));
        updatePreview();
    });

    updatePreview();
});

document.getElementById('purchaseForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('The PDF generator is unavailable right now. Please reconnect to the internet and try again.');
        return;
    }

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
    const quantity = getSafeQuantity(document.getElementById('quantity').value);
    const unitPriceValue = parseCurrency(document.getElementById('price').value);
    const linePrice = formatCurrency(unitPriceValue * quantity);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFillColor(96, 11, 152);
    doc.rect(0, 0, 210, 32, 'F');
    doc.setFillColor(234, 220, 247);
    doc.rect(0, 32, 210, 8, 'F');

    let logoDataUrl = null;
    try {
        logoDataUrl = await loadImageDataUrl('/images/logo.png');
    } catch (error) {
        console.warn('Logo could not be loaded for invoice PDF.', error);
    }

    if (logoDataUrl) {
        try {
            if (typeof doc.GState === 'function' && typeof doc.setGState === 'function') {
                doc.setGState(new doc.GState({ opacity: 0.08 }));
                doc.addImage(logoDataUrl, 'PNG', 42, 72, 126, 126);
                doc.setGState(new doc.GState({ opacity: 1 }));
            }

            doc.addImage(logoDataUrl, 'PNG', 12, 8, 18, 18);
        } catch (error) {
            console.warn('Logo rendering failed in PDF.', error);
        }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(20);
    doc.text('The Furry Friends', 36, 16);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Cat Purchase Invoice', 36, 23);

    doc.setTextColor(61, 36, 80);
    drawSectionTitle(doc, 'Bill To', 14, 50);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.text(`Name: ${firstName} ${lastName}`, 14, 60);
    doc.text(`Email: ${email}`, 14, 67);
    doc.text(`Location: ${location}`, 14, 74);
    doc.text(`Gender: ${gender || 'Not specified'}`, 14, 81);

    drawSectionTitle(doc, 'Payment Details', 118, 50);
    doc.text(`Method: ${payment}`, 118, 60);
    if (payment === 'M-Pesa') doc.text(`M-Pesa: ${mpesa}`, 118, 67);
    if (payment === 'Bank') doc.text(`Bank: ${bank}`, 118, 67);
    if (payment === 'Crypto') doc.text(`Wallet: ${crypto}`, 118, 67);

    drawSectionTitle(doc, 'Invoice Items', 14, 98);

    const tableTop = 106;
    const quantityX = 18;
    const itemX = 52;
    const priceX = 150;

    doc.setFillColor(96, 11, 152);
    doc.roundedRect(14, tableTop, 182, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('Quantity', quantityX, tableTop + 8);
    doc.text('Item', itemX, tableTop + 8);
    doc.text('Price', priceX, tableTop + 8);

    doc.setFillColor(252, 248, 255);
    doc.setDrawColor(220, 202, 238);
    doc.roundedRect(14, tableTop + 12, 182, 18, 3, 3, 'FD');
    doc.setTextColor(61, 36, 80);
    doc.setFont(undefined, 'normal');
    doc.text(String(quantity), quantityX, tableTop + 24);
    doc.text(breed || 'Selected cat', itemX, tableTop + 24);
    doc.text(linePrice, priceX, tableTop + 24);

    doc.setFillColor(234, 220, 247);
    doc.roundedRect(110, tableTop + 38, 86, 16, 3, 3, 'F');
    doc.setFont(undefined, 'bold');
    doc.text('Total', 120, tableTop + 48);
    doc.text(linePrice, 170, tableTop + 48, { align: 'right' });

    drawSectionTitle(doc, 'Notes', 14, 176);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('Thank you for choosing The Furry Friends. Please retain this invoice for your records.', 14, 186, { maxWidth: 182 });

    doc.setDrawColor(214, 190, 233);
    doc.line(14, 270, 196, 270);
    doc.setFontSize(9);
    doc.setTextColor(96, 11, 152);
    doc.text('The Furry Friends | Adopt love, bring home a companion.', 105, 277, { align: 'center' });

    doc.save(`Invoice_${firstName}_${lastName}.pdf`);
    alert('Thank You for shopping with The Furry Friends!');

    setTimeout(() => {
        window.close();
    }, 1000);
});
