const PAYHERE_SDK_SRC = "https://www.payhere.lk/lib/payhere.js";
const PAYHERE_SDK_SELECTOR = 'script[data-payhere-sdk="true"]';

let payHereSdkPromise = null;

const normalizeCheckoutPayload = (checkout) => {
    const fields = checkout?.fields && typeof checkout.fields === "object" ? checkout.fields : null;
    if (!fields) {
        throw new Error("Checkout payload is missing required fields.");
    }

    const payload = Object.entries(fields).reduce((accumulator, [key, value]) => {
        accumulator[key] = value === null || value === undefined ? "" : String(value);
        return accumulator;
    }, {});

    const checkoutUrl = String(checkout?.checkoutUrl || "").toLowerCase();
    if (checkoutUrl.includes("sandbox.payhere.lk") && payload.sandbox === undefined) {
        payload.sandbox = true;
    }

    return payload;
};

export const launchPayHereRedirectCheckout = (checkout) => {
    if (!checkout?.checkoutUrl || !checkout?.fields) {
        throw new Error("Checkout session is unavailable.");
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = String(checkout.checkoutUrl);

    Object.entries(checkout.fields || {}).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value === null || value === undefined ? "" : String(value);
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
};

export const preloadPayHereOnsiteSdk = () => {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return Promise.reject(new Error("PayHere onsite checkout is only available in the browser."));
    }

    if (window.payhere && typeof window.payhere.startPayment === "function") {
        return Promise.resolve(window.payhere);
    }

    if (payHereSdkPromise) {
        return payHereSdkPromise;
    }

    payHereSdkPromise = new Promise((resolve, reject) => {
        const handleReady = () => {
            if (window.payhere && typeof window.payhere.startPayment === "function") {
                resolve(window.payhere);
                return;
            }

            reject(new Error("PayHere SDK loaded, but startPayment is unavailable."));
        };

        const existingScript = document.querySelector(PAYHERE_SDK_SELECTOR);
        if (existingScript) {
            if (window.payhere && typeof window.payhere.startPayment === "function") {
                resolve(window.payhere);
                return;
            }

            const loadedState = existingScript.dataset.loadedState;
            if (loadedState === "loaded" || loadedState === "error") {
                reject(new Error("PayHere SDK is not available on this page."));
                return;
            }

            existingScript.addEventListener("load", handleReady, { once: true });
            existingScript.addEventListener(
                "error",
                () => reject(new Error("Failed to load PayHere SDK.")),
                { once: true }
            );
            return;
        }

        const script = document.createElement("script");
        script.src = PAYHERE_SDK_SRC;
        script.async = true;
        script.dataset.payhereSdk = "true";
        script.addEventListener("load", () => {
            script.dataset.loadedState = "loaded";
            handleReady();
        }, { once: true });
        script.addEventListener(
            "error",
            () => {
                script.dataset.loadedState = "error";
                reject(new Error("Failed to load PayHere SDK."));
            },
            { once: true }
        );

        document.head.appendChild(script);
    }).catch((error) => {
        payHereSdkPromise = null;
        throw error;
    });

    return payHereSdkPromise;
};

export const launchPayHereOnsiteCheckout = async (checkout, callbacks = {}) => {
    const paymentPayload = normalizeCheckoutPayload(checkout);
    const payhere = await preloadPayHereOnsiteSdk();

    payhere.onCompleted = (orderId) => {
        if (typeof callbacks.onCompleted === "function") {
            callbacks.onCompleted(orderId);
        }
    };

    payhere.onDismissed = () => {
        if (typeof callbacks.onDismissed === "function") {
            callbacks.onDismissed();
        }
    };

    payhere.onError = (error) => {
        if (typeof callbacks.onError === "function") {
            callbacks.onError(error);
        }
    };

    payhere.startPayment(paymentPayload);
};
