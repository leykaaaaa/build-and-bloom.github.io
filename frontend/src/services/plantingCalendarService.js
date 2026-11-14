const API_URL = process.env.NEXT_PUBLIC_API_URL;


// GET ALL PLANTING CALENDAR ENTRIES
export async function getPlantingCalendar() {
    const response = await fetch(
        `${API_URL}/api/planting-calendar`
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Failed to retrieve planting calendar."
        );
    }

    return result.data;
}


// GET PLANTING CALENDAR BY LOCATION ID
export async function getPlantingCalendarByLocationId(
    locationId
) {
    const response = await fetch(
        `${API_URL}/api/planting-calendar?location_id=${encodeURIComponent(locationId)}`
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Failed to retrieve planting calendar."
        );
    }

    return result.data;
}


// GET PLANTING CALENDAR BY LOCATION NAME
export async function getPlantingCalendarByLocation(
    location
) {
    const response = await fetch(
        `${API_URL}/api/planting-calendar/location/${encodeURIComponent(location)}`
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Failed to retrieve planting calendar."
        );
    }

    return result.data;
}