const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function assessCrops(assessmentData) {
    const response = await fetch(
        `${API_URL}/api/recommendations/assess`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(assessmentData)
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to process assessment."
        );
    }

    return result;
}