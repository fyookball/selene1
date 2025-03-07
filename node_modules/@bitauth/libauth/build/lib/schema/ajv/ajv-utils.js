import AuthenticationTemplateValidator from './validate-authentication-template.js';
const avjErrorsToDescription = (errors) => 
// TODO: translate instancePath
errors.map((error) => `${error.instancePath}: ${error.message}`).join(',');
export const ajvStandaloneJsonParse = (untrustedJsonOrObject, validator) => {
    // eslint-disable-next-line functional/no-try-statement
    try {
        const parsed = typeof untrustedJsonOrObject === 'string'
            ? JSON.parse(untrustedJsonOrObject)
            : untrustedJsonOrObject;
        if (validator(parsed)) {
            return parsed;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return avjErrorsToDescription(AuthenticationTemplateValidator.errors);
    }
    catch (e) {
        return `Invalid JSON. ${String(e)}`;
    }
};
//# sourceMappingURL=ajv-utils.js.map