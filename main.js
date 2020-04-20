'use strict';

const storageKey = () => {
  "hoge";
};

let global_keyPair = null;

const createMyKey = async (e) => {
  let jwkText = localStorage.getItem(storageKey());
  if (false && jwkText) {
    e.value = jwkText;
  } else {
    let keyPair = await crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-521' },
      true,
      ['deriveKey', 'deriveBits']
    );
    global_keyPair = keyPair;
    let jwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
    let text = JSON.stringify(jwk, null, "\t");
    e.value = text;
  }
};

const id = (str) => {
  return document.getElementById(str);
};

const craetePassword = (myKey, pKey) => {
  global_keyPair.deriveKey
};

const makePassword = async (buffer) => {
  const raw = await crypto.subtle.digest('SHA-512', buffer);
  const hashArray = Array.from(new Uint16Array(raw));                     // convert buffer to byte array
  const chars = "34679acdefghjkmnprstuvwxyzACDEFGHJKLMNPQRTUVWXY";
  const charlen = chars.length;
  return hashArray.slice(10).map(b => chars[b % charlen] + chars[(b / charlen | 0) % charlen]).join("");
};

const digest = async (buffer) => {
  const raw = await crypto.subtle.digest('SHA-256', buffer);
  // hash the message
  const hashArray = Array.from(new Uint16Array(raw));                     // convert buffer to byte array
  return hashArray.map(b => b.toString(16).padStart(4, '0')).join('-');
};

const importFromDom = async (o, domId) => {
  const jwk = JSON.parse(id(domId).value);
  let kp = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDH', namedCurve: 'P-521' },
    false,
    []
  );
  let buffer = await crypto.subtle.deriveBits(
    {
      name: "ECDH",
      namedCurve: "P-521", //can be "P-256", "P-384", or "P-521"
      public: kp
    },
    global_keyPair.privateKey, //your ECDH private key from generateKey or importKey
    128 //the number of bits you want to derive
  );
  id("password").value = await makePassword(buffer);
  id("digest").value = await digest(buffer);
}

const main = () => {
  let mykey = id("mykey");
  createMyKey(mykey);
  id("create").onclick = () => {
    localStorage.removeItem(storageKey())
    createMyKey(mykey);
  };
  id("import").onclick = () => {
    let o = {};
    importFromDom(o, "partnerskey");
  }
};
