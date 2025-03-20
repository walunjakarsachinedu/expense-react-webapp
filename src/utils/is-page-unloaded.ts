let isUnloading = false;

// Detect page unload to prevent the job from executing later
window.addEventListener("beforeunload", () => {
  isUnloading = true;
});

export const isPageUnloaded = () => isUnloading;
