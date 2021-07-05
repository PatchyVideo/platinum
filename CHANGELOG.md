# [0.7.0-alpha.5](https://github.com/PatchyVideo/platinum/compare/v0.7.0-alpha.4...v0.7.0-alpha.5) (2021-07-05)

### Bug Fixes

- defineEmit -> defineEmits ([7f6f3c2](https://github.com/PatchyVideo/platinum/commit/7f6f3c2f84072aaef82e477bbe076ff98ff2d8d6))
- **locales:** fix bug of default "undefined" String type value of key:lang in local storage ([8e228b2](https://github.com/PatchyVideo/platinum/commit/8e228b249af78bd269a239271fc77f57d70750b5))
- **locales:** use undefined value for default locale, add 'undefined' and 'null' String check and catch RangeError when getBrowserLang() ([40dea48](https://github.com/PatchyVideo/platinum/commit/40dea48ae1976d406f22d2c6c7a9a70933f8de2b))
- move to `as` since `<type>` is a jsx syntax ([5da19b1](https://github.com/PatchyVideo/platinum/commit/5da19b16a79efdf430aab628e431805889257cf7))
- **nav:** fix hidePage ([73926de](https://github.com/PatchyVideo/platinum/commit/73926de52f7e1c56112e1811fbd7e768bd3c7eb1))
- only apply polyfill during build ([5c7e8f0](https://github.com/PatchyVideo/platinum/commit/5c7e8f0471a8a8b6854b83ff2ed0452dd753bbe7))
- **playlist:** fix self update during collapse ([72053a6](https://github.com/PatchyVideo/platinum/commit/72053a6c07e41a887b0ab9288af683f5f2e8710f))
- **search:** :bug: fix image url ([d2f11c8](https://github.com/PatchyVideo/platinum/commit/d2f11c8e4163e1aa046ba612c7ad9fdcfdaf32ec))
- **video:** `video` is possibly null ([d5b9382](https://github.com/PatchyVideo/platinum/commit/d5b9382cc1e92a70c44f78e1c35b1b1e45feeca3))
- **video:** fix counter in VideoList ([cc83275](https://github.com/PatchyVideo/platinum/commit/cc83275894500e876d91830a98c3079421cbbd35))
- **video:** fix currentTime applies when video playing ([ce7a63e](https://github.com/PatchyVideo/platinum/commit/ce7a63e20a71bdb1db095f4f97285ae233369f4d))
- **video:** replace `templateRef` to `ref` ([55b83f8](https://github.com/PatchyVideo/platinum/commit/55b83f858b87d6a4cc9e205b01116f28dc97614d))

### Features

- comment face loader ([ae21417](https://github.com/PatchyVideo/platinum/commit/ae214176fc560d4d8b65a0ff57c1dc1db1df9b03))
- **playlist:** show loading state ([f18f954](https://github.com/PatchyVideo/platinum/commit/f18f954c0f2c7dd824566d1d30bc768f0073e6a7))
- **search:** placeholder in search page ([6848fa0](https://github.com/PatchyVideo/platinum/commit/6848fa027731797a86906b2e812fd381c4ab62e3))
- use backend service to serve polyfill ([c445cb4](https://github.com/PatchyVideo/platinum/commit/c445cb402f94da5617d187594b8431c52e4b509b))
- use fetchMore ([687ffa4](https://github.com/PatchyVideo/platinum/commit/687ffa4d98713d8d8d0e03a41dc18724f92a9e76))
- **user,locales:** add pure UI and chinese scales for user page ([ae5df13](https://github.com/PatchyVideo/platinum/commit/ae5df1313dda9ca13c2126422244fd87304bf771))
- **user:** :sparkles: add uid in local storage ([3451c7a](https://github.com/PatchyVideo/platinum/commit/3451c7a107238c1b361734c72501f778a8001850))
- **video:** canvas view (wip) ([e1e1033](https://github.com/PatchyVideo/platinum/commit/e1e10330dbbae61b69ce85d30ff61cc980ae5d32))
- **video:** playlist mobile view ([5523bd5](https://github.com/PatchyVideo/platinum/commit/5523bd5c6054ab650f378a7818702bc514f1e81e))
- **video:** repost type i18n ([8f8a4cb](https://github.com/PatchyVideo/platinum/commit/8f8a4cb70c3c16bc5eb5e671da8470b41e4363f1))
- **video:** support playlist in video ([#5](https://github.com/PatchyVideo/platinum/issues/5)) ([b2f6f88](https://github.com/PatchyVideo/platinum/commit/b2f6f88d0048ab97caf8d4697fc4104fd42bf810))
- **video:** teleport mobile author ([fa2fb99](https://github.com/PatchyVideo/platinum/commit/fa2fb99d54ac26a946ce02eae8c17f046f67d06e))

# [0.7.0-alpha.4](https://github.com/PatchyVideo/platinum/compare/v0.7.0-alpha.3...v0.7.0-alpha.4) (2021-05-29)

### Bug Fixes

- **playlist:** fix video image ([4aaa04b](https://github.com/PatchyVideo/platinum/commit/4aaa04bef8203b0eb581ae4c4ecb8375cb377f20))
- :bug: fix overflow ([9b2328b](https://github.com/PatchyVideo/platinum/commit/9b2328ba28ebe35b5ac79fcff687ea951146d5a3))
- :bug: fix pagination page number ([efbbb96](https://github.com/PatchyVideo/platinum/commit/efbbb9609ce3362e618bc087efa78a44162e7fff))
- fix setHeader returns undefined on vercel ([c6703bf](https://github.com/PatchyVideo/platinum/commit/c6703bf7c39ad7d111ff360b026f660a0bbc1bbc))

### Features

- a link to twitter ([b0fe89d](https://github.com/PatchyVideo/platinum/commit/b0fe89df199f78ac598020c3b624d8a433406e5c))
- **video:** fullscreen support ([e7f579e](https://github.com/PatchyVideo/platinum/commit/e7f579eb0dfe8adc550fa1a636289672369e313a))
- host polyfill with serverless function ([290de19](https://github.com/PatchyVideo/platinum/commit/290de193ceb46c99b382acdd27fe2fae7ae669b3))
- mobile support for playlist ([364d4b2](https://github.com/PatchyVideo/platinum/commit/364d4b258db61105342978476df4842ff12130d8))
- support html in markdown ([a00988e](https://github.com/PatchyVideo/platinum/commit/a00988e0ba42c9443b864c8719c27c8d6b6db92a))
- **playlist:** :sparkles: new page: playlist list ([c9825b4](https://github.com/PatchyVideo/platinum/commit/c9825b4ac32cb377f23bfd7949866635278be00e))
- **video:** :sparkles: new page: video list ([f4eda75](https://github.com/PatchyVideo/platinum/commit/f4eda75f70b15ab4c8f264d23c0113551f2b33b1))

# [0.7.0-alpha.3](https://github.com/PatchyVideo/platinum/compare/v0.7.0-alpha.2...v0.7.0-alpha.3) (2021-05-23)

### Bug Fixes

- fix sometime `overflow: hidden` still applies ([b262b50](https://github.com/PatchyVideo/platinum/commit/b262b50b8461ca218643b4d32a883ccfca7117ac))

### Features

- commit link in footer ([6a5b058](https://github.com/PatchyVideo/platinum/commit/6a5b0586d0a86a20d0729c197ba312d48d631969))
- display a disabled botton ([406aad6](https://github.com/PatchyVideo/platinum/commit/406aad68bec0c990f3ed1eb4a79213a8e9533f59))
- link twitter card to official account ([030259c](https://github.com/PatchyVideo/platinum/commit/030259c059242a13641af84706f6977318e3df9a))
- show a error page when backend down ([2a3f186](https://github.com/PatchyVideo/platinum/commit/2a3f186fe3324fed506526a026161adbe66504ca))

# [0.7.0-alpha.2](https://github.com/PatchyVideo/platinum/compare/v0.7.0-alpha.1...v0.7.0-alpha.2) (2021-05-22)

Hello World!
