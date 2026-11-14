const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getCrops() {
    const response = await fetch(`${API_URL}/api/crops`);

    if (!response.ok) {
        throw new Error("Failed to fetch crops.");
    }

    const result = await response.json();

    return result.data;
}

export async function getCropById(id) {
    const response = await fetch(`${API_URL}/api/crops/${id}`);

    if (!response.ok) {
        throw new Error("Failed to fetch crop.");
    }

    const result = await response.json();

    return result.data;
}