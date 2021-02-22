export function isCopyToClipboardSupported() {
    let support = !!document.queryCommandSupported;

    ['copy', 'cut'].forEach((action) => {
        support = support && !!document.queryCommandSupported(action);
    });
    return support;
}

export function copyToClipboard(text) {
    if (isCopyToClipboardSupported()) {
        navigator.clipboard.writeText(text).catch((error) => {
            console.error('Cannot copy text', error);
        });
    }
}