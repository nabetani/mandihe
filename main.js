'use strict';

const jwtStorePassword = () => {
  return null;
};

const storageKey = () => {
  return window.location.href + "nabetani-jwt-store.7ohn8p94ao9xd35ngq2afs5nk";
};

const aesCtrCounter = () => {
  return new Uint8Array([28, 218, 254, 122, 26, 138, 159, 102, 32, 253, 52, 126, 127, 200, 218, 90]);
};

const getKey = async () => {
  const salt = "salt[24aii8j6l2172ipu570jm510w]";
  let passwordUint8Array = (new TextEncoder()).encode(salt + jwtStorePassword());
  let digest = await crypto.subtle.digest(
    { name: 'SHA-256' },
    passwordUint8Array
  );
  let key = await crypto.subtle.importKey(
    "raw",
    digest,
    { name: "AES-CTR", },
    false,
    ["encrypt", "decrypt"]
  )
  return key;
};

const encryptA = async (msg) => {
  let te = new TextEncoder()
  let e = await crypto.subtle.encrypt(
    {
      name: "AES-CTR",
      counter: aesCtrCounter(),
      length: 64
    },
    await getKey(),
    te.encode(msg)
  );
  return JSON.stringify(Array.from(new Uint8Array(e)));
};

const decryptA = async (ciphertext) => {
  let key = await getKey();
  let data = (new Uint8Array(JSON.parse(ciphertext))).buffer;
  let bytes = await crypto.subtle.decrypt(
    {
      name: "AES-CTR",
      counter: aesCtrCounter(),
      length: 64
    },
    key,
    data
  );
  let r = (new TextDecoder()).decode(bytes);
  return r;
}
const getJwt = async () => {
  let e = localStorage.getItem(storageKey());
  if (e == null || e == undefined) {
    return null;
  }
  return await decryptA(e);
};

const setJwt = async (o) => {
  let p = JSON.stringify(o);
  let e = await encryptA(p);
  localStorage.setItem(storageKey(), e);
};

let global_keyPair = null;

const createMyKey = async (e) => {
  let jwkText = await getJwt();
  if (jwkText) {
    const jwks = JSON.parse(jwkText);
    let privateKey = await crypto.subtle.importKey(
      'jwk',
      jwks["private"],
      { name: 'ECDH', namedCurve: 'P-521' },
      true,
      ['deriveBits']
    );
    let publicKey = await crypto.subtle.importKey(
      'jwk',
      jwks["public"],
      { name: 'ECDH', namedCurve: 'P-521' },
      true,
      []
    );
    const keyPair = { privateKey: privateKey, publicKey: publicKey };
    global_keyPair = keyPair;
    let publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
    let text = JSON.stringify(publicJwk, null, "\t");
    e.value = text;
  } else {
    let keyPair = await crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-521' },
      true,
      ['deriveBits']
    );
    global_keyPair = keyPair;
    let privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
    let publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
    await setJwt({
      private: privateJwk,
      public: publicJwk
    });
    let text = JSON.stringify(publicJwk, null, "\t");
    e.value = text;
  }
};

const id = (str) => {
  return document.getElementById(str);
};

const makePassword = async (i, buffer0) => {
  let ary = [i].concat(Array.from(new Uint8Array(buffer0)));
  let buffer = (new Uint8Array(ary)).buffer;
  const raw = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint32Array(raw));
  const chars = "34679acdefghjkmnprstuvwxyzACDEFGHJKLMNPQRTUVWXY";
  const tostr = (b) => {
    let s = "";
    for (let i = 0; i < 5; i++) {
      s += chars[b % chars.length];
      b = (b / chars.length) | 0;
    };
    return s;
  };
  return hashArray.map(b => tostr(b)).join("").substr(0, 20);
};

const digest = async (buffer) => {
  const raw = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint16Array(raw));
  return hashArray.slice(0, 4).map(b => b.toString(16).padStart(4, '0')).join('-');
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
    528 //the number of bits you want to derive
  );
  for (let i of [0, 1, 2, 3, 4]) {
    id(`password${i}`).value = await makePassword(i, buffer);
  }
  id("digest").value = await digest(buffer);
}

const main = () => {
  if (!jwtStorePassword()) {
    alert('you must change function "jwtStorePassword()" to return your private password.');
    return;
  }
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
