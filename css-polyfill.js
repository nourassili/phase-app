// CSS Style polyfill for React Native Web
if (typeof window !== 'undefined' && window.CSSStyleDeclaration) {
  const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
  
  // Patch the CSSStyleDeclaration to handle indexed property setting
  const style = CSSStyleDeclaration.prototype;
  
  // Override all numeric property setters
  for (let i = 0; i < 1000; i++) {
    if (!(i in style)) {
      Object.defineProperty(style, i, {
        set: function() {
          // Silently ignore indexed property assignments
          return;
        },
        get: function() {
          return undefined;
        },
        configurable: true,
        enumerable: false
      });
    }
  }
  
  console.log('CSS Style polyfill applied for React Native Web');
}