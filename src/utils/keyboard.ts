const _keyCodeToName: {[key: string]: string} =  {
  "MetaLeft": "Meta",
  "MetaRight": "Meta",
  "AltLeft": "Alt",
  "AltRight": "Alt",
  "ShiftLeft": "Shift",
  "ShiftRight": "Shift",
  "CtrlLeft": "Ctrl",
  "CtrlRight": "Ctrl",
};

const _prefixesToRemove = ["Key", "Digit"];

export default function getKeyName(keyCode: string): string {
  _prefixesToRemove.forEach((prefix) => {
    if(keyCode.startsWith(prefix)) keyCode = keyCode.slice(prefix.length);
  })
  if(keyCode in _keyCodeToName) keyCode = _keyCodeToName[keyCode];
  return keyCode.toLowerCase();
}