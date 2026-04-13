let selectedPlan = "";
let basePrice = 0;
let discount = 0;
let appliedCoupon = null;

/* ================= PLAN PRICES ================= */
const planPrices = {
    free: 0,
    vip: 14.99,
    premium: 39.99
};

/* ================= TOAST SYSTEM ================= */
function showToast(msg) {
    const t = document.createElement("div");

    t.innerText = msg;
    t.style.position = "fixed";
    t.style.bottom = "25px";
    t.style.left = "50%";
    t.style.transform = "translateX(-50%)";
    t.style.padding = "14px 18px";
    t.style.borderRadius = "14px";
    t.style.background = "rgba(20,20,30,0.95)";
    t.style.color = "#fff";
    t.style.zIndex = "999999";
    t.style.fontFamily = "Segoe UI";
    t.style.transition = "0.4s";

    document.body.appendChild(t);

    setTimeout(() => {
        t.style.opacity = "0";
    }, 1800);

    setTimeout(() => t.remove(), 2400);
}

/* ================= EMAIL PREMIUM FUNCTION ================= */
function sendPremiumEmail(user, plan, payment, expiry) {

    if (!window.emailjs) {
        console.warn("EmailJS not loaded");
        return;
    }

    emailjs.send("dcDWpZz9zgSbBPwBl", "template_m0g9en7", {
        name: user.email.split("@")[0],
        email: user.email,
        title: "Premium Purchase Successful 🎉",
        message: `
Plan: ${plan}

Payment ID: ${payment.paymentId}
Order ID: ${payment.orderId}
Amount: ${payment.amount}

Expiry Date: ${new Date(expiry).toDateString()}
        `
    })
    .then(() => {
        console.log("Premium email sent");
    })
    .catch(err => {
        console.error("Email failed", err);
    });
}

/* ================= OPEN CHECKOUT ================= */
async function openCheckout(plan) {

    const user = firebase.auth().currentUser;

    selectedPlan = plan;
    discount = 0;
    appliedCoupon = null;

    let currentPlan = "free";

    if (user) {
        const snap = await firebase.firestore()
            .collection("subscriptions")
            .doc(user.uid)
            .get();

        if (snap.exists) {
            currentPlan = snap.data().plan || "free";
        }
    }

    const newPlan = (plan || "").toLowerCase();

    const currentPrice = planPrices[currentPlan] || 0;
    const newPrice = planPrices[newPlan] || 0;

    basePrice = Math.max(newPrice - currentPrice, 0);

    document.getElementById("checkoutPopup").style.display = "flex";

    document.getElementById("planName").innerHTML =
        `${plan}
        <div style="font-size:12px;opacity:0.7">
        (${currentPlan.toUpperCase()} → ${plan.toUpperCase()})
        </div>`;

    document.getElementById("userEmail").innerText =
        user ? user.email : "Not logged in";

    updateUI();
}

/* ================= UPDATE UI ================= */
function updateUI() {
    let price = basePrice - discount;
    if (price < 0) price = 0;

    const total = price + price * 0.18;

    document.getElementById("planPrice").innerText =
        "$" + price.toFixed(2);

    document.getElementById("grandTotal").innerText =
        total.toFixed(2);
}

/* ================= COUPON SYSTEM ================= */
async function applyCoupon() {

    const input = document.getElementById("couponInput");
    const code = input.value.trim().toUpperCase();

    const user = firebase.auth().currentUser;
    if (!user) return showToast("Login required");

    const db = firebase.firestore();

    const snap = await db.collection("coupons").doc(code).get();

    if (!snap.exists) return showToast("Invalid coupon");

    const coupon = snap.data();

    if (!coupon.active) return showToast("Coupon expired");

    const usedRef = db.collection("userCoupons").doc(user.uid);
    const usedSnap = await usedRef.get();
    const used = usedSnap.exists && usedSnap.data() ? usedSnap.data() : {};

    if (used[code]) return showToast("Coupon already used");

    discount =
        coupon.type === "percent"
            ? (basePrice * coupon.value) / 100
            : coupon.value;

    appliedCoupon = code;

    updateUI();
    showToast("Coupon applied");
}

/* ================= PAYMENT ================= */
async function proceedPayment() {

    const user = firebase.auth().currentUser;
    if (!user) return showToast("Login required");

    const price = basePrice - discount;
    const finalAmount = Math.max(price + price * 0.18, 1);

    try {
        const res = await fetch("http://localhost:3000/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: finalAmount })
        });

        const order = await res.json();

        const options = {
            key: "rzp_test_Scf3CTCTfjDK8r",
            amount: order.amount,
            currency: "INR",
            name: "Furry Utility",
            description: selectedPlan + " Plan",
            order_id: order.id,

            handler: async function (response) {

                const db = firebase.firestore();
                const subRef = db.collection("subscriptions").doc(user.uid);

                const snap = await subRef.get();
                const currentPlan = snap.exists ? snap.data().plan : "free";

                const newPlan = (selectedPlan || "free").toLowerCase();

                const now = Date.now();
                const expiry = now + (6 * 30 * 24 * 60 * 60 * 1000);

                await subRef.set({
                    uid: user.uid,
                    email: user.email,
                    plan: newPlan,
                    status: "active",
                    subscribedAt: now,
                    expiryAt: expiry,
                    upgrade: `${currentPlan.toUpperCase()} → ${newPlan.toUpperCase()}`,
                    payment: {
                        paymentId: response.razorpay_payment_id,
                        orderId: response.razorpay_order_id,
                        amount: finalAmount
                    },
                    coupon: appliedCoupon || null,
                    updatedAt: now
                });

                // mark coupon used
                if (appliedCoupon) {
                    await db.collection("userCoupons")
                        .doc(user.uid)
                        .set({ [appliedCoupon]: true }, { merge: true });
                }

                /* ================= EMAIL FIX HERE ================= */
                sendPremiumEmail(
                    user,
                    newPlan,
                    {
                        paymentId: response.razorpay_payment_id,
                        orderId: response.razorpay_order_id,
                        amount: finalAmount
                    },
                    expiry
                );

                showToast("Payment Successful 🎉");
                closeCheckout();
            },

            theme: { color: "#6C5CE7" }
        };

        const rzp = new Razorpay(options);
        rzp.open();

    } catch (err) {
        console.error(err);
        showToast("Payment failed");
    }
}

/* ================= CLOSE ================= */
function closeCheckout() {
    document.getElementById("checkoutPopup").style.display = "none";
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

    document.querySelector(".diamond-btn")
        ?.addEventListener("click", () => openCheckout("VIP"));

    document.querySelector(".premium-btn")
        ?.addEventListener("click", () => openCheckout("Premium"));

    document.querySelector(".pay-btn")
        ?.addEventListener("click", proceedPayment);
});