export const useNonce = (setIfNotPresent: boolean = false) => {
  const nonce = sessionStorage.getItem("nonce");
  if (setIfNotPresent) {
    if (!nonce) sessionStorage.setItem("nonce", generateNonce());
  }
  return sessionStorage.getItem("nonce")!;
};

function generateNonce(length: number = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}
