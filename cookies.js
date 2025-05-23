// cookies.js

/**
 * Sets a cookie with optional JSON support
 * @param {string} name - Cookie name
 * @param {any} value - Value to store (can be array, object, string, etc.)
 * @param {number} days - Days until the cookie expires
 */
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const stringValue = encodeURIComponent(JSON.stringify(value));
    document.cookie = `${encodeURIComponent(name)}=${stringValue}; expires=${expires}; path=/`;
}

/**
 * Gets and parses a cookie by name
 * @param {string} name - Cookie name
 * @returns {any|null} - Parsed value or null if not found
 */
function getCookie(name) {
    const value = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${encodeURIComponent(name)}=`))
        ?.split('=')[1];

    if (!value) return null;

    try {
        return JSON.parse(decodeURIComponent(value));
    } catch (e) {
        return null;
    }
}

