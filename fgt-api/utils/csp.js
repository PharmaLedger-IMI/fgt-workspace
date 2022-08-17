// #110
const CSP_HEADER = "Content-Security-Policy";
const CSP_DEFAULT_POLICY = "self";

// should be a function to set the header on a response, but, this is left as simple
// constants hoping that the security scan tool can read these, instead of duplicating the values.

module.exports = {
    CSP_HEADER,
    CSP_DEFAULT_POLICY
}