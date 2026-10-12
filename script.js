const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzbG8Lpr3KFvcWUqPGmSUUzG9-kHQIgALG5PzwS29W14a35BjL9GU2LK0M-La4llaK4kw/exec';

// State Management
let cart = [];

// Mobile Navigation
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileMenu = document.getElementById('mobile-menu');

hamburgerBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

// Cart & Modal Elements
const cartIcon = document.querySelector('.cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

const DELIVERY_FEE = 2.00;

// Open/Close Cart Side Panel
cartIcon.addEventListener('click', (e) => {
    e.preventDefault();
    cartModal.classList.add('open');
});

closeCartBtn.addEventListener('click', () => {
    cartModal.classList.remove('open');
});

// Handle "Add to Cart" Buttons in Menu
const menuCards = document.querySelectorAll('.menu-card');

menuCards.forEach(card => {
    const addBtn = card.querySelector('.add-to-cart-btn');
    const title = card.querySelector('h3').innerText;
    const price = parseFloat(card.querySelector('.price').innerText.replace('$', ''));

    addBtn.addEventListener('click', () => {
        addToCart(title, price);
        
        addBtn.textContent = "Added!";
        addBtn.style.background = "#2ecc71";
        addBtn.style.color = "#fff";
        
        setTimeout(() => {
            addBtn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add';
            addBtn.style.background = "gold";
            addBtn.style.color = "#000";
        }, 800);
    });
});

function addToCart(title, price) {
    const existingIndex = cart.findIndex(item => item.title === title);
    
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({ title, price, qty: 1 });
    }
    
    updateCartUI();
}

function updateCartUI() {
    // Total count update
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalQty;

    // Render cart items
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
        cartSubtotal.textContent = '$0.00';
        cartTotal.textContent = '$0.00';
        return;
    }

    cartItemsContainer.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        subtotal += item.price * item.qty;

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item flex between';
        itemEl.innerHTML = `
            <div>
                <div class="cart-item-title">${item.title}</div>
                <div style="color: #666;">$${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-controls flex gap-2">
                <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
            </div>
        `;
        cartItemsContainer.appendChild(itemEl);
    });

    const total = subtotal + (cart.length > 0 ? DELIVERY_FEE : 0);

    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

window.changeQty = function(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
};

// Checkout Action
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    alert('Payment Successfully!!');
    // Integrate your payment gateway (e.g. Stripe, Razorpay) here
    cart = [];
    updateCartUI();
    cartModal.classList.remove('open');
});

// Contact Form Handler
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        const formStatus = document.getElementById('form-status');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        const payload = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value
        };

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.result === 'success') {
                formStatus.textContent = 'Thank you! Your message has been sent successfully.';
                formStatus.className = 'form-status success';
                contactForm.reset();
            } else {
                throw new Error('Script error');
            }
        })
        .catch(err => {
            formStatus.textContent = 'Something went wrong. Please try again.';
            formStatus.className = 'form-status error';
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        });
    });
}



// Auth Gate Logic (Requires Sign-In on Every Refresh)
const authGate = document.getElementById('auth-gate');
const authForm = document.getElementById('auth-form');
const signinBtns = document.querySelectorAll('.btn-signin');

// Handle login form submission
authForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('gate-email').value;

    // Unlock site interface for the current session only
    unlockWebsite(email);

    alert(`Successfully signed in as ${email}! Welcome to Foodie.`);
});

function unlockWebsite(email) {
    // Hide overlay & enable page scrolling
    if (authGate) {
        authGate.classList.add('unlocked');
    }
    document.body.classList.remove('site-locked');

    // Update Navbar buttons to show logged-in user name
    const userName = email ? email.split('@')[0] : 'Account';
    signinBtns.forEach(btn => {
        btn.innerHTML = `<i class="fa-solid fa-user"></i> &nbsp; ${userName}`;
        btn.style.background = "#2ecc71";
        btn.style.color = "#fff";
    });
}
