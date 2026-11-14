
const API_URL = process.env.NEXT_PUBLIC_API_URL;


export async function registerUser(userData) {

    const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(userData)
        }
    );


    const result = await response.json();


    if (!response.ok) {

        throw new Error(
            result.message ||
            "Failed to create account."
        );

    }


    return result;

}


export async function loginUser(loginData) {

    const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(loginData)
        }
    );


    const result = await response.json();


    if (!response.ok) {
        console.error("LOGIN ERROR RESPONSE:", result);
        console.error("LOGIN HTTP STATUS:", response.status);

        throw new Error(
            result.message ||
            result.error ||
            `Login failed with status ${response.status}`
        );

    }


    return result;

}


/*
    Get the saved JWT token.
*/
export function getAuthToken() {

    return localStorage.getItem(
        "buildAndBloomToken"
    );

}


/*
    Create Authorization headers
    for protected API requests.
*/
export function getAuthHeaders() {

    const token =
        getAuthToken();


    return {

        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${token}`

    };

}