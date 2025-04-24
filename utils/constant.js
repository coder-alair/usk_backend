export const NODE_ENVIRONMENT = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
}

export const NODE_ENV = process.env.NODE_ENV;

const ROLES = [
    { label: "Country admin", value: "country_admin" },
    { label: "State admin", value: "state_admin" },
    { label: "District admin", value: "district_admin" },
    { label: "District shop admin", value: "district_shop_admin" },
    { label: "Distributor admin", value: "distributor_admin" },
    { label: "Block admin", value: "block_admin" },
    { label: "GPN admin", value: "gpn_admin" },
    { label: "Vendor", value: "vendor" },
];

const CATEGORY = [
    {
        label: "Driver", value: "driver"
    },
    {
        label: "Electrician", value: "electrician"
    },
]

module.exports = {
    RESPONSE_CODE: {
        SUCCESS: 200,
        SUCCESS_NEW_RESOURCE: 201,
        SUCCESS_WITHOUT_RESPONSE: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        NOT_FOUND: 404,
        FORBIDDEN: 403,
        INTERNAL_SERVER: 500,
        MAINTENANCE: 503,
        TOKEN_INVALID: 498
    },
    SUCCESS: 1,
    FAIL: 0,
    EMAIL_VERIFICATION: 2,
    RESET_PASSWORD: 3,
    FORCE_UPDATE: 4,
    OPTIONAL_UPDATE: 5,
    USER_RESTRICTED: 9,
    OTP_LENGTH: 4,
    MAX_API_REQUEST_LIMIT: 500,
    WINDOW_MS: 5 * 1000 * 60,
}