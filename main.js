'use strict';

var g_jwk = undefined;

const main = () => {
  crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-521' }, false, ['deriveKey', 'deriveBits'])
    .then(keyPair => {   // 鍵ペアを生成
      return crypto.subtle.exportKey('jwk', keyPair.publicKey);
    }).then(jwk => { // 公開鍵をJWKとしてエクスポート
      let e = document.getElementById("jwk");
      e.value = JSON.stringify(jwk, null, "\t")
      g_jwk = jwk
    });
};
