import{o as e_,R as Fu}from"./vendor-core--uYB-6Uc.js";const t_=()=>{};var th={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wd=function(r){const e=[];let t=0;for(let n=0;n<r.length;n++){let s=r.charCodeAt(n);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&n+1<r.length&&(r.charCodeAt(n+1)&64512)===56320?(s=65536+((s&1023)<<10)+(r.charCodeAt(++n)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},n_=function(r){const e=[];let t=0,n=0;for(;t<r.length;){const s=r[t++];if(s<128)e[n++]=String.fromCharCode(s);else if(s>191&&s<224){const i=r[t++];e[n++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=r[t++],o=r[t++],u=r[t++],c=((s&7)<<18|(i&63)<<12|(o&63)<<6|u&63)-65536;e[n++]=String.fromCharCode(55296+(c>>10)),e[n++]=String.fromCharCode(56320+(c&1023))}else{const i=r[t++],o=r[t++];e[n++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},Qd={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(r,e){if(!Array.isArray(r))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let s=0;s<r.length;s+=3){const i=r[s],o=s+1<r.length,u=o?r[s+1]:0,c=s+2<r.length,h=c?r[s+2]:0,f=i>>2,p=(i&3)<<4|u>>4;let _=(u&15)<<2|h>>6,P=h&63;c||(P=64,o||(_=64)),n.push(t[f],t[p],t[_],t[P])}return n.join("")},encodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(r):this.encodeByteArray(Wd(r),e)},decodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(r):n_(this.decodeStringToByteArray(r,e))},decodeStringToByteArray(r,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let s=0;s<r.length;){const i=t[r.charAt(s++)],u=s<r.length?t[r.charAt(s)]:0;++s;const h=s<r.length?t[r.charAt(s)]:64;++s;const p=s<r.length?t[r.charAt(s)]:64;if(++s,i==null||u==null||h==null||p==null)throw new r_;const _=i<<2|u>>4;if(n.push(_),h!==64){const P=u<<4&240|h>>2;if(n.push(P),p!==64){const V=h<<6&192|p;n.push(V)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let r=0;r<this.ENCODED_VALS.length;r++)this.byteToCharMap_[r]=this.ENCODED_VALS.charAt(r),this.charToByteMap_[this.byteToCharMap_[r]]=r,this.byteToCharMapWebSafe_[r]=this.ENCODED_VALS_WEBSAFE.charAt(r),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]]=r,r>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)]=r,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)]=r)}}};class r_ extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const s_=function(r){const e=Wd(r);return Qd.encodeByteArray(e,!0)},yo=function(r){return s_(r).replace(/\./g,"")},Yd=function(r){try{return Qd.decodeString(r,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jd(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const i_=()=>Jd().__FIREBASE_DEFAULTS__,o_=()=>{if(typeof process>"u"||typeof th>"u")return;const r=th.__FIREBASE_DEFAULTS__;if(r)return JSON.parse(r)},a_=()=>{if(typeof document>"u")return;let r;try{r=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=r&&Yd(r[1]);return e&&JSON.parse(e)},Ko=()=>{try{return t_()||i_()||o_()||a_()}catch(r){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);return}},Xd=r=>{var e,t;return(t=(e=Ko())==null?void 0:e.emulatorHosts)==null?void 0:t[r]},Zd=r=>{const e=Xd(r);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const n=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),n]:[e.substring(0,t),n]},ef=()=>{var r;return(r=Ko())==null?void 0:r.config},tf=r=>{var e;return(e=Ko())==null?void 0:e[`_${r}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nf{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,n)=>{t?this.reject(t):this.resolve(n),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,n))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function u_(r,e){if(r.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},n=e||"demo-project",s=r.iat||0,i=r.sub||r.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${n}`,aud:n,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...r};return[yo(JSON.stringify(t)),yo(JSON.stringify(o)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function we(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function c_(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(we())}function rf(){var e;const r=(e=Ko())==null?void 0:e.forceEnvironment;if(r==="node")return!0;if(r==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function l_(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function h_(){const r=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof r=="object"&&r.id!==void 0}function d_(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function f_(){const r=we();return r.indexOf("MSIE ")>=0||r.indexOf("Trident/")>=0}function sf(){return!rf()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function of(){return!rf()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")}function af(){try{return typeof indexedDB=="object"}catch{return!1}}function p_(){return new Promise((r,e)=>{try{let t=!0;const n="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(n);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(n),r(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)==null?void 0:i.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const m_="FirebaseError";class Rt extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name=m_,Object.setPrototypeOf(this,Rt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ci.prototype.create)}}class ci{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?g_(i,n):"Error",u=`${this.serviceName}: ${o} (${s}).`;return new Rt(s,u,n)}}function g_(r,e){return r.replace(__,(t,n)=>{const s=e[n];return s!=null?String(s):`<${n}?>`})}const __=/\{\$([^}]+)}/g;function y_(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}function ln(r,e){if(r===e)return!0;const t=Object.keys(r),n=Object.keys(e);for(const s of t){if(!n.includes(s))return!1;const i=r[s],o=e[s];if(nh(i)&&nh(o)){if(!ln(i,o))return!1}else if(i!==o)return!1}for(const s of n)if(!t.includes(s))return!1;return!0}function nh(r){return r!==null&&typeof r=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function li(r){const e=[];for(const[t,n]of Object.entries(r))Array.isArray(n)?n.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(n));return e.length?"&"+e.join("&"):""}function Ts(r){const e={};return r.replace(/^\?/,"").split("&").forEach(n=>{if(n){const[s,i]=n.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function ws(r){const e=r.indexOf("?");if(!e)return"";const t=r.indexOf("#",e);return r.substring(e,t>0?t:void 0)}function I_(r,e){const t=new E_(r,e);return t.subscribe.bind(t)}class E_{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(n=>{this.error(n)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,n){let s;if(e===void 0&&t===void 0&&n===void 0)throw new Error("Missing Observer.");T_(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:n},s.next===void 0&&(s.next=Ka),s.error===void 0&&(s.error=Ka),s.complete===void 0&&(s.complete=Ka);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(n){typeof console<"u"&&console.error&&console.error(n)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function T_(r,e){if(typeof r!="object"||r===null)return!1;for(const t of e)if(t in r&&typeof r[t]=="function")return!0;return!1}function Ka(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ve(r){return r&&r._delegate?r._delegate:r}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yn(r){try{return(r.startsWith("http://")||r.startsWith("https://")?new URL(r).hostname:r).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Go(r){return(await fetch(r,{credentials:"include"})).ok}class hn{constructor(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vn="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class w_{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const n=new nf;if(this.instancesDeferred.set(t,n),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&n.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),n=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(n)return null;throw s}else{if(n)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(A_(e))try{this.getOrInitializeService({instanceIdentifier:Vn})}catch{}for(const[t,n]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});n.resolve(i)}catch{}}}}clearInstance(e=Vn){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Vn){return this.instances.has(e)}getOptions(e=Vn){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:n,options:t});for(const[i,o]of this.instancesDeferred.entries()){const u=this.normalizeInstanceIdentifier(i);n===u&&o.resolve(s)}return s}onInit(e,t){const n=this.normalizeInstanceIdentifier(t),s=this.onInitCallbacks.get(n)??new Set;s.add(e),this.onInitCallbacks.set(n,s);const i=this.instances.get(n);return i&&e(i,n),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const n=this.onInitCallbacks.get(t);if(n)for(const s of n)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:v_(e),options:t}),this.instances.set(e,n),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}return n||null}normalizeInstanceIdentifier(e=Vn){return this.component?this.component.multipleInstances?e:Vn:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function v_(r){return r===Vn?void 0:r}function A_(r){return r.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class R_{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new w_(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uf=[];var J;(function(r){r[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT"})(J||(J={}));const P_={debug:J.DEBUG,verbose:J.VERBOSE,info:J.INFO,warn:J.WARN,error:J.ERROR,silent:J.SILENT},b_=J.INFO,S_={[J.DEBUG]:"log",[J.VERBOSE]:"log",[J.INFO]:"info",[J.WARN]:"warn",[J.ERROR]:"error"},V_=(r,e,...t)=>{if(e<r.logLevel)return;const n=new Date().toISOString(),s=S_[e];if(s)console[s](`[${n}]  ${r.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Bu{constructor(e){this.name=e,this._logLevel=b_,this._logHandler=V_,this._userLogHandler=null,uf.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in J))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?P_[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,J.DEBUG,...e),this._logHandler(this,J.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,J.VERBOSE,...e),this._logHandler(this,J.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,J.INFO,...e),this._logHandler(this,J.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,J.WARN,...e),this._logHandler(this,J.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,J.ERROR,...e),this._logHandler(this,J.ERROR,...e)}}function C_(r){uf.forEach(e=>{e.setLogLevel(r)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class x_{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(D_(t)){const n=t.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(t=>t).join(" ")}}function D_(r){const e=r.getComponent();return(e==null?void 0:e.type)==="VERSION"}const ru="@firebase/app",rh="0.15.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dt=new Bu("@firebase/app"),N_="@firebase/app-compat",k_="@firebase/analytics-compat",O_="@firebase/analytics",L_="@firebase/app-check-compat",M_="@firebase/app-check",U_="@firebase/auth",F_="@firebase/auth-compat",B_="@firebase/database",q_="@firebase/data-connect",$_="@firebase/database-compat",j_="@firebase/functions",z_="@firebase/functions-compat",K_="@firebase/installations",G_="@firebase/installations-compat",H_="@firebase/messaging",W_="@firebase/messaging-compat",Q_="@firebase/performance",Y_="@firebase/performance-compat",J_="@firebase/remote-config",X_="@firebase/remote-config-compat",Z_="@firebase/storage",ey="@firebase/storage-compat",ty="@firebase/firestore",ny="@firebase/ai",ry="@firebase/firestore-compat",sy="firebase",iy="12.15.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const su="[DEFAULT]",oy={[ru]:"fire-core",[N_]:"fire-core-compat",[O_]:"fire-analytics",[k_]:"fire-analytics-compat",[M_]:"fire-app-check",[L_]:"fire-app-check-compat",[U_]:"fire-auth",[F_]:"fire-auth-compat",[B_]:"fire-rtdb",[q_]:"fire-data-connect",[$_]:"fire-rtdb-compat",[j_]:"fire-fn",[z_]:"fire-fn-compat",[K_]:"fire-iid",[G_]:"fire-iid-compat",[H_]:"fire-fcm",[W_]:"fire-fcm-compat",[Q_]:"fire-perf",[Y_]:"fire-perf-compat",[J_]:"fire-rc",[X_]:"fire-rc-compat",[Z_]:"fire-gcs",[ey]:"fire-gcs-compat",[ty]:"fire-fst",[ry]:"fire-fst-compat",[ny]:"fire-vertex","fire-js":"fire-js",[sy]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fs=new Map,ay=new Map,iu=new Map;function sh(r,e){try{r.container.addComponent(e)}catch(t){Dt.debug(`Component ${e.name} failed to register with FirebaseApp ${r.name}`,t)}}function zn(r){const e=r.name;if(iu.has(e))return Dt.debug(`There were multiple attempts to register component ${e}.`),!1;iu.set(e,r);for(const t of Fs.values())sh(t,r);for(const t of ay.values())sh(t,r);return!0}function hi(r,e){const t=r.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),r.container.getProvider(e)}function Je(r){return r==null?!1:r.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uy={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},sn=new ci("app","Firebase",uy);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cy{constructor(e,t,n){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new hn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw sn.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kr=iy;function ly(r,e={}){let t=r;typeof e!="object"&&(e={name:e});const n={name:su,automaticDataCollectionEnabled:!0,...e},s=n.name;if(typeof s!="string"||!s)throw sn.create("bad-app-name",{appName:String(s)});if(t||(t=ef()),!t)throw sn.create("no-options");const i=Fs.get(s);if(i){if(ln(t,i.options)&&ln(n,i.config))return i;throw sn.create("duplicate-app",{appName:s})}const o=new R_(s);for(const c of iu.values())o.addComponent(c);const u=new cy(t,n,o);return Fs.set(s,u),u}function qu(r=su){const e=Fs.get(r);if(!e&&r===su&&ef())return ly();if(!e)throw sn.create("no-app",{appName:r});return e}function _P(){return Array.from(Fs.values())}function yt(r,e,t){let n=oy[r]??r;t&&(n+=`-${t}`);const s=n.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const o=[`Unable to register library "${n}" with version "${e}":`];s&&o.push(`library name "${n}" contains illegal characters (whitespace or "/")`),s&&i&&o.push("and"),i&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Dt.warn(o.join(" "));return}zn(new hn(`${n}-version`,()=>({library:n,version:e}),"VERSION"))}function yP(r){C_(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hy="firebase-heartbeat-database",dy=1,Bs="firebase-heartbeat-store";let Ga=null;function cf(){return Ga||(Ga=e_(hy,dy,{upgrade:(r,e)=>{switch(e){case 0:try{r.createObjectStore(Bs)}catch(t){console.warn(t)}}}}).catch(r=>{throw sn.create("idb-open",{originalErrorMessage:r.message})})),Ga}async function fy(r){try{const t=(await cf()).transaction(Bs),n=await t.objectStore(Bs).get(lf(r));return await t.done,n}catch(e){if(e instanceof Rt)Dt.warn(e.message);else{const t=sn.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Dt.warn(t.message)}}}async function ih(r,e){try{const n=(await cf()).transaction(Bs,"readwrite");await n.objectStore(Bs).put(e,lf(r)),await n.done}catch(t){if(t instanceof Rt)Dt.warn(t.message);else{const n=sn.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Dt.warn(n.message)}}}function lf(r){return`${r.name}!${r.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const py=1024,my=30;class gy{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new yy(t),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=oh();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>my){const o=Iy(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(n){Dt.warn(n)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=oh(),{heartbeatsToSend:n,unsentEntries:s}=_y(this._heartbeatsCache.heartbeats),i=yo(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return Dt.warn(t),""}}}function oh(){return new Date().toISOString().substring(0,10)}function _y(r,e=py){const t=[];let n=r.slice();for(const s of r){const i=t.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),ah(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),ah(t)>e){t.pop();break}n=n.slice(1)}return{heartbeatsToSend:t,unsentEntries:n}}class yy{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return af()?p_().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await fy(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return ih(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return ih(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:[...n.heartbeats,...e.heartbeats]})}else return}}function ah(r){return yo(JSON.stringify({version:2,heartbeats:r})).length}function Iy(r){if(r.length===0)return-1;let e=0,t=r[0].date;for(let n=1;n<r.length;n++)r[n].date<t&&(t=r[n].date,e=n);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ey(r){zn(new hn("platform-logger",e=>new x_(e),"PRIVATE")),zn(new hn("heartbeat",e=>new gy(e),"PRIVATE")),yt(ru,rh,r),yt(ru,rh,"esm2020"),yt("fire-js","")}Ey("");var Ty="firebase",wy="12.15.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */yt(Ty,wy,"app");function hf(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const vy=hf,df=new ci("auth","Firebase",hf());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Io=new Bu("@firebase/auth");function Ay(r,...e){Io.logLevel<=J.WARN&&Io.warn(`Auth (${Kr}): ${r}`,...e)}function no(r,...e){Io.logLevel<=J.ERROR&&Io.error(`Auth (${Kr}): ${r}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ht(r,...e){throw $u(r,...e)}function It(r,...e){return $u(r,...e)}function ff(r,e,t){const n={...vy(),[e]:t};return new ci("auth","Firebase",n).create(e,{appName:r.name})}function St(r){return ff(r,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function $u(r,...e){if(typeof r!="string"){const t=e[0],n=[...e.slice(1)];return n[0]&&(n[0].appName=r.name),r._errorFactory.create(t,...n)}return df.create(r,...e)}function j(r,e,...t){if(!r)throw $u(e,...t)}function Pt(r){const e="INTERNAL ASSERTION FAILED: "+r;throw no(e),new Error(e)}function Nt(r,e){r||Pt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ou(){var r;return typeof self<"u"&&((r=self.location)==null?void 0:r.href)||""}function Ry(){return uh()==="http:"||uh()==="https:"}function uh(){var r;return typeof self<"u"&&((r=self.location)==null?void 0:r.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Py(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Ry()||h_()||"connection"in navigator)?navigator.onLine:!0}function by(){if(typeof navigator>"u")return null;const r=navigator;return r.languages&&r.languages[0]||r.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class di{constructor(e,t){this.shortDelay=e,this.longDelay=t,Nt(t>e,"Short delay should be less than long delay!"),this.isMobile=c_()||d_()}get(){return Py()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ju(r,e){Nt(r.emulator,"Emulator should always be set here");const{url:t}=r.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pf{static initialize(e,t,n){this.fetchImpl=e,t&&(this.headersImpl=t),n&&(this.responseImpl=n)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Pt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Pt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Pt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sy={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vy=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],Cy=new di(3e4,6e4);function In(r,e){return r.tenantId&&!e.tenantId?{...e,tenantId:r.tenantId}:e}async function En(r,e,t,n,s={}){return mf(r,s,async()=>{let i={},o={};n&&(e==="GET"?o=n:i={body:JSON.stringify(n)});const u=li({...o,key:r.config.apiKey}).slice(1),c=await r._getAdditionalHeaders();c["Content-Type"]="application/json",r.languageCode&&(c["X-Firebase-Locale"]=r.languageCode);const h={method:e,headers:c,...i};return l_()||(h.referrerPolicy="strict-origin-when-cross-origin"),r.emulatorConfig&&yn(r.emulatorConfig.host)&&(h.credentials="include"),pf.fetch()(await gf(r,r.config.apiHost,t,u),h)})}async function mf(r,e,t){r._canInitEmulator=!1;const n={...Sy,...e};try{const s=new Dy(r),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw Gi(r,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const u=i.ok?o.errorMessage:o.error.message,[c,h]=u.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Gi(r,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw Gi(r,"email-already-in-use",o);if(c==="USER_DISABLED")throw Gi(r,"user-disabled",o);const f=n[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw ff(r,f,h);ht(r,f)}}catch(s){if(s instanceof Rt)throw s;ht(r,"network-request-failed",{message:String(s)})}}async function fi(r,e,t,n,s={}){const i=await En(r,e,t,n,s);return"mfaPendingCredential"in i&&ht(r,"multi-factor-auth-required",{_serverResponse:i}),i}async function gf(r,e,t,n){const s=`${e}${t}?${n}`,i=r,o=i.config.emulator?ju(r.config,s):`${r.config.apiScheme}://${s}`;return Vy.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}function xy(r){switch(r){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class Dy{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,n)=>{this.timer=setTimeout(()=>n(It(this.auth,"network-request-failed")),Cy.get())})}}function Gi(r,e,t){const n={appName:r.name};t.email&&(n.email=t.email),t.phoneNumber&&(n.phoneNumber=t.phoneNumber);const s=It(r,e,n);return s.customData._tokenResponse=t,s}function ch(r){return r!==void 0&&r.enterprise!==void 0}class Ny{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return xy(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function ky(r,e){return En(r,"GET","/v2/recaptchaConfig",In(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Oy(r,e){return En(r,"POST","/v1/accounts:delete",e)}async function Eo(r,e){return En(r,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ss(r){if(r)try{const e=new Date(Number(r));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Ly(r,e=!1){const t=Ve(r),n=await t.getIdToken(e),s=zu(n);j(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:s,token:n,authTime:Ss(Ha(s.auth_time)),issuedAtTime:Ss(Ha(s.iat)),expirationTime:Ss(Ha(s.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function Ha(r){return Number(r)*1e3}function zu(r){const[e,t,n]=r.split(".");if(e===void 0||t===void 0||n===void 0)return no("JWT malformed, contained fewer than 3 sections"),null;try{const s=Yd(t);return s?JSON.parse(s):(no("Failed to decode base64 JWT payload"),null)}catch(s){return no("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function lh(r){const e=zu(r);return j(e,"internal-error"),j(typeof e.exp<"u","internal-error"),j(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function qs(r,e,t=!1){if(t)return e;try{return await e}catch(n){throw n instanceof Rt&&My(n)&&r.auth.currentUser===r&&await r.auth.signOut(),n}}function My({code:r}){return r==="auth/user-disabled"||r==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uy{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const n=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,n)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class au{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Ss(this.lastLoginAt),this.creationTime=Ss(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function To(r){var p;const e=r.auth,t=await r.getIdToken(),n=await qs(r,Eo(e,{idToken:t}));j(n==null?void 0:n.users.length,e,"internal-error");const s=n.users[0];r._notifyReloadListener(s);const i=(p=s.providerUserInfo)!=null&&p.length?_f(s.providerUserInfo):[],o=By(r.providerData,i),u=r.isAnonymous,c=!(r.email&&s.passwordHash)&&!(o!=null&&o.length),h=u?c:!1,f={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:o,metadata:new au(s.createdAt,s.lastLoginAt),isAnonymous:h};Object.assign(r,f)}async function Fy(r){const e=Ve(r);await To(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function By(r,e){return[...r.filter(n=>!e.some(s=>s.providerId===n.providerId)),...e]}function _f(r){return r.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function qy(r,e){const t=await mf(r,{},async()=>{const n=li({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=r.config,o=await gf(r,s,"/v1/token",`key=${i}`),u=await r._getAdditionalHeaders();u["Content-Type"]="application/x-www-form-urlencoded";const c={method:"POST",headers:u,body:n};return r.emulatorConfig&&yn(r.emulatorConfig.host)&&(c.credentials="include"),pf.fetch()(o,c)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function $y(r,e){return En(r,"POST","/v2/accounts:revokeToken",In(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tr{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){j(e.idToken,"internal-error"),j(typeof e.idToken<"u","internal-error"),j(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):lh(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){j(e.length!==0,"internal-error");const t=lh(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(j(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:n,refreshToken:s,expiresIn:i}=await qy(e,t);this.updateTokensAndExpiration(n,s,Number(i))}updateTokensAndExpiration(e,t,n){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+n*1e3}static fromJSON(e,t){const{refreshToken:n,accessToken:s,expirationTime:i}=t,o=new Tr;return n&&(j(typeof n=="string","internal-error",{appName:e}),o.refreshToken=n),s&&(j(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(j(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Tr,this.toJSON())}_performRefresh(){return Pt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kt(r,e){j(typeof r=="string"||typeof r>"u","internal-error",{appName:e})}class lt{constructor({uid:e,auth:t,stsTokenManager:n,...s}){this.providerId="firebase",this.proactiveRefresh=new Uy(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=n,this.accessToken=n.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new au(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await qs(this,this.stsTokenManager.getToken(this.auth,e));return j(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return Ly(this,e)}reload(){return Fy(this)}_assign(e){this!==e&&(j(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new lt({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){j(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let n=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),n=!0),t&&await To(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Je(this.auth.app))return Promise.reject(St(this.auth));const e=await this.getIdToken();return await qs(this,Oy(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const n=t.displayName??void 0,s=t.email??void 0,i=t.phoneNumber??void 0,o=t.photoURL??void 0,u=t.tenantId??void 0,c=t._redirectEventId??void 0,h=t.createdAt??void 0,f=t.lastLoginAt??void 0,{uid:p,emailVerified:_,isAnonymous:P,providerData:V,stsTokenManager:O}=t;j(p&&O,e,"internal-error");const M=Tr.fromJSON(this.name,O);j(typeof p=="string",e,"internal-error"),Kt(n,e.name),Kt(s,e.name),j(typeof _=="boolean",e,"internal-error"),j(typeof P=="boolean",e,"internal-error"),Kt(i,e.name),Kt(o,e.name),Kt(u,e.name),Kt(c,e.name),Kt(h,e.name),Kt(f,e.name);const z=new lt({uid:p,auth:e,email:s,emailVerified:_,displayName:n,isAnonymous:P,photoURL:o,phoneNumber:i,tenantId:u,stsTokenManager:M,createdAt:h,lastLoginAt:f});return V&&Array.isArray(V)&&(z.providerData=V.map(K=>({...K}))),c&&(z._redirectEventId=c),z}static async _fromIdTokenResponse(e,t,n=!1){const s=new Tr;s.updateFromServerResponse(t);const i=new lt({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:n});return await To(i),i}static async _fromGetAccountInfoResponse(e,t,n){const s=t.users[0];j(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?_f(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),u=new Tr;u.updateFromIdToken(n);const c=new lt({uid:s.localId,auth:e,stsTokenManager:u,isAnonymous:o}),h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new au(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(c,h),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hh=new Map;function bt(r){Nt(r instanceof Function,"Expected a class definition");let e=hh.get(r);return e?(Nt(e instanceof r,"Instance stored in cache mismatched with class"),e):(e=new r,hh.set(r,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yf{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}yf.type="NONE";const dh=yf;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ro(r,e,t){return`firebase:${r}:${e}:${t}`}class wr{constructor(e,t,n){this.persistence=e,this.auth=t,this.userKey=n;const{config:s,name:i}=this.auth;this.fullUserKey=ro(this.userKey,s.apiKey,i),this.fullPersistenceKey=ro("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Eo(this.auth,{idToken:e}).catch(()=>{});return t?lt._fromGetAccountInfoResponse(this.auth,t,e):null}return lt._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,n="authUser"){if(!t.length)return new wr(bt(dh),e,n);const s=(await Promise.all(t.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let i=s[0]||bt(dh);const o=ro(n,e.config.apiKey,e.name);let u=null;for(const h of t)try{const f=await h._get(o);if(f){let p;if(typeof f=="string"){const _=await Eo(e,{idToken:f}).catch(()=>{});if(!_)break;p=await lt._fromGetAccountInfoResponse(e,_,f)}else p=lt._fromJSON(e,f);h!==i&&(u=p),i=h;break}}catch{}const c=s.filter(h=>h._shouldAllowMigration);return!i._shouldAllowMigration||!c.length?new wr(i,e,n):(i=c[0],u&&await i._set(o,u.toJSON()),await Promise.all(t.map(async h=>{if(h!==i)try{await h._remove(o)}catch{}})),new wr(i,e,n))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fh(r){const e=r.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(wf(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(If(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Af(e))return"Blackberry";if(Rf(e))return"Webos";if(Ef(e))return"Safari";if((e.includes("chrome/")||Tf(e))&&!e.includes("edge/"))return"Chrome";if(vf(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,n=r.match(t);if((n==null?void 0:n.length)===2)return n[1]}return"Other"}function If(r=we()){return/firefox\//i.test(r)}function Ef(r=we()){const e=r.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Tf(r=we()){return/crios\//i.test(r)}function wf(r=we()){return/iemobile/i.test(r)}function vf(r=we()){return/android/i.test(r)}function Af(r=we()){return/blackberry/i.test(r)}function Rf(r=we()){return/webos/i.test(r)}function Ku(r=we()){return/iphone|ipad|ipod/i.test(r)||/macintosh/i.test(r)&&/mobile/i.test(r)}function jy(r=we()){var e;return Ku(r)&&!!((e=window.navigator)!=null&&e.standalone)}function zy(){return f_()&&document.documentMode===10}function Pf(r=we()){return Ku(r)||vf(r)||Rf(r)||Af(r)||/windows phone/i.test(r)||wf(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bf(r,e=[]){let t;switch(r){case"Browser":t=fh(we());break;case"Worker":t=`${fh(we())}-${r}`;break;default:t=r}const n=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Kr}/${n}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ky{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const n=i=>new Promise((o,u)=>{try{const c=e(i);o(c)}catch(c){u(c)}});n.onAbort=t,this.queue.push(n);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const n of this.queue)await n(e),n.onAbort&&t.push(n.onAbort)}catch(n){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:n==null?void 0:n.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Gy(r,e={}){return En(r,"GET","/v2/passwordPolicy",In(r,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hy=6;class Wy{constructor(e){var n;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??Hy,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((n=e.allowedNonAlphanumericCharacters)==null?void 0:n.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const n=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;n&&(t.meetsMinPasswordLength=e.length>=n),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let n;for(let s=0;s<e.length;s++)n=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,n>="a"&&n<="z",n>="A"&&n<="Z",n>="0"&&n<="9",this.allowedNonAlphanumericCharacters.includes(n))}updatePasswordCharacterOptionsStatuses(e,t,n,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=n)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qy{constructor(e,t,n,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=n,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new ph(this),this.idTokenSubscription=new ph(this),this.beforeStateQueue=new Ky(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=df,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=bt(t)),this._initializationPromise=this.queue(async()=>{var n,s,i;if(!this._deleted&&(this.persistenceManager=await wr.create(this,e),(n=this._resolvePersistenceManagerAvailable)==null||n.call(this),!this._deleted)){if((s=this._popupRedirectResolver)!=null&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Eo(this,{idToken:e}),n=await lt._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(n)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(Je(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(u=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(u,u))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let n=t,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(i=this.redirectUser)==null?void 0:i._redirectEventId,u=n==null?void 0:n._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===u)&&(c!=null&&c.user)&&(n=c.user,s=!0)}if(!n)return this.directlySetCurrentUser(null);if(!n._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(n)}catch(o){n=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return n?this.reloadAndSetCurrentUserOrClear(n):this.directlySetCurrentUser(null)}return j(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===n._redirectEventId?this.directlySetCurrentUser(n):this.reloadAndSetCurrentUserOrClear(n)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await To(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=by()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Je(this.app))return Promise.reject(St(this));const t=e?Ve(e):null;return t&&j(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&j(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Je(this.app)?Promise.reject(St(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Je(this.app)?Promise.reject(St(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(bt(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Gy(this),t=new Wy(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new ci("auth","Firebase",e())}onAuthStateChanged(e,t,n){return this.registerStateListener(this.authStateSubscription,e,t,n)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,n){return this.registerStateListener(this.idTokenSubscription,e,t,n)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const n=this.onAuthStateChanged(()=>{n(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),n={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(n.tenantId=this.tenantId),await $y(this,n)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const n=await this.getOrInitRedirectPersistenceManager(t);return e===null?n.removeCurrentUser():n.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&bt(e)||this._popupRedirectResolver;j(t,this,"argument-error"),this.redirectPersistenceManager=await wr.create(this,[bt(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,n;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((n=this.redirectUser)==null?void 0:n._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,n,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let o=!1;const u=this._isInitialized?Promise.resolve():this._initializationPromise;if(j(u,this,"internal-error"),u.then(()=>{o||i(this.currentUser)}),typeof t=="function"){const c=e.addObserver(t,n,s);return()=>{o=!0,c()}}else{const c=e.addObserver(t);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return j(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=bf(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var s;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((s=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:s.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const n=await this._getAppCheckToken();return n&&(e["X-Firebase-AppCheck"]=n),e}async _getAppCheckToken(){var t;if(Je(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&Ay(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function Zn(r){return Ve(r)}class ph{constructor(e){this.auth=e,this.observer=null,this.addObserver=I_(t=>this.observer=t)}get next(){return j(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ho={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Yy(r){Ho=r}function Sf(r){return Ho.loadJS(r)}function Jy(){return Ho.recaptchaEnterpriseScript}function Xy(){return Ho.gapiScript}function Zy(r){return`__${r}${Math.floor(Math.random()*1e6)}`}class eI{constructor(){this.enterprise=new tI}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class tI{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}const nI="recaptcha-enterprise",Vf="NO_RECAPTCHA",mh="onFirebaseAuthREInstanceReady";class Yt{constructor(e){this.type=nI,this.auth=Zn(e)}async verify(e="verify",t=!1){async function n(i){if(!t){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,u)=>{ky(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(c=>{if(c.recaptchaKey===void 0)u(new Error("recaptcha Enterprise site key undefined"));else{const h=new Ny(c);return i.tenantId==null?i._agentRecaptchaConfig=h:i._tenantRecaptchaConfigs[i.tenantId]=h,o(h.siteKey)}}).catch(c=>{u(c)})})}function s(i,o,u){const c=window.grecaptcha;ch(c)?c.enterprise.ready(()=>{c.enterprise.execute(i,{action:e}).then(h=>{o(h)}).catch(()=>{o(Vf)})}):u(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new eI().execute("siteKey",{action:"verify"}):new Promise((i,o)=>{n(this.auth).then(async u=>{if(!t&&ch(window.grecaptcha)&&Yt.scriptInjectionDeferred)await Yt.scriptInjectionDeferred.promise,s(u,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let c=Jy();c.length!==0&&(c+=u+`&onload=${mh}`),Yt.scriptInjectionDeferred=new nf,window[mh]=()=>{var h;(h=Yt.scriptInjectionDeferred)==null||h.resolve()},Sf(c).then(()=>{var h;return(h=Yt.scriptInjectionDeferred)==null?void 0:h.promise}).then(()=>{s(u,i,o)}).catch(h=>{o(h)})}}).catch(u=>{o(u)})})}}Yt.scriptInjectionDeferred=null;async function gh(r,e,t,n=!1,s=!1){const i=new Yt(r);let o;if(s)o=Vf;else try{o=await i.verify(t)}catch{o=await i.verify(t,!0)}const u={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in u){const c=u.phoneEnrollmentInfo.phoneNumber,h=u.phoneEnrollmentInfo.recaptchaToken;Object.assign(u,{phoneEnrollmentInfo:{phoneNumber:c,recaptchaToken:h,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in u){const c=u.phoneSignInInfo.recaptchaToken;Object.assign(u,{phoneSignInInfo:{recaptchaToken:c,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return u}return n?Object.assign(u,{captchaResp:o}):Object.assign(u,{captchaResponse:o}),Object.assign(u,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(u,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),u}async function uu(r,e,t,n,s){var i;if((i=r._getRecaptchaConfig())!=null&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const o=await gh(r,e,t,t==="getOobCode");return n(r,o)}else return n(r,e).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const u=await gh(r,e,t,t==="getOobCode");return n(r,u)}else return Promise.reject(o)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rI(r,e){const t=hi(r,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(ln(i,e??{}))return s;ht(s,"already-initialized")}return t.initialize({options:e})}function sI(r,e){const t=(e==null?void 0:e.persistence)||[],n=(Array.isArray(t)?t:[t]).map(bt);e!=null&&e.errorMap&&r._updateErrorMap(e.errorMap),r._initializeWithPersistence(n,e==null?void 0:e.popupRedirectResolver)}function iI(r,e,t){const n=Zn(r);j(/^https?:\/\//.test(e),n,"invalid-emulator-scheme");const s=!1,i=Cf(e),{host:o,port:u}=oI(e),c=u===null?"":`:${u}`,h={url:`${i}//${o}${c}/`},f=Object.freeze({host:o,port:u,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!n._canInitEmulator){j(n.config.emulator&&n.emulatorConfig,n,"emulator-config-failed"),j(ln(h,n.config.emulator)&&ln(f,n.emulatorConfig),n,"emulator-config-failed");return}n.config.emulator=h,n.emulatorConfig=f,n.settings.appVerificationDisabledForTesting=!0,yn(o)?Go(`${i}//${o}${c}`):aI()}function Cf(r){const e=r.indexOf(":");return e<0?"":r.substr(0,e+1)}function oI(r){const e=Cf(r),t=/(\/\/)?([^?#/]+)/.exec(r.substr(e.length));if(!t)return{host:"",port:null};const n=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(n);if(s){const i=s[1];return{host:i,port:_h(n.substr(i.length+1))}}else{const[i,o]=n.split(":");return{host:i,port:_h(o)}}}function _h(r){if(!r)return null;const e=Number(r);return isNaN(e)?null:e}function aI(){function r(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",r):r())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gu{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Pt("not implemented")}_getIdTokenResponse(e){return Pt("not implemented")}_linkToIdToken(e,t){return Pt("not implemented")}_getReauthenticationResolver(e){return Pt("not implemented")}}async function uI(r,e){return En(r,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function cI(r,e){return fi(r,"POST","/v1/accounts:signInWithPassword",In(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function lI(r,e){return fi(r,"POST","/v1/accounts:signInWithEmailLink",In(r,e))}async function hI(r,e){return fi(r,"POST","/v1/accounts:signInWithEmailLink",In(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $s extends Gu{constructor(e,t,n,s=null){super("password",n),this._email=e,this._password=t,this._tenantId=s}static _fromEmailAndPassword(e,t){return new $s(e,t,"password")}static _fromEmailAndCode(e,t,n=null){return new $s(e,t,"emailLink",n)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return uu(e,t,"signInWithPassword",cI);case"emailLink":return lI(e,{email:this._email,oobCode:this._password});default:ht(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const n={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return uu(e,n,"signUpPassword",uI);case"emailLink":return hI(e,{idToken:t,email:this._email,oobCode:this._password});default:ht(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function vr(r,e){return fi(r,"POST","/v1/accounts:signInWithIdp",In(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dI="http://localhost";class Kn extends Gu{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Kn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):ht("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:n,signInMethod:s,...i}=t;if(!n||!s)return null;const o=new Kn(n,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return vr(e,t)}_linkToIdToken(e,t){const n=this.buildRequest();return n.idToken=t,vr(e,n)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,vr(e,t)}buildRequest(){const e={requestUri:dI,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=li(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fI(r){switch(r){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function pI(r){const e=Ts(ws(r)).link,t=e?Ts(ws(e)).deep_link_id:null,n=Ts(ws(r)).deep_link_id;return(n?Ts(ws(n)).link:null)||n||t||e||r}class Hu{constructor(e){const t=Ts(ws(e)),n=t.apiKey??null,s=t.oobCode??null,i=fI(t.mode??null);j(n&&s&&i,"argument-error"),this.apiKey=n,this.operation=i,this.code=s,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=pI(e);try{return new Hu(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gr{constructor(){this.providerId=Gr.PROVIDER_ID}static credential(e,t){return $s._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const n=Hu.parseLink(t);return j(n,"argument-error"),$s._fromEmailAndCode(e,n.code,n.tenantId)}}Gr.PROVIDER_ID="password";Gr.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Gr.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xf{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pi extends xf{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jt extends pi{constructor(){super("facebook.com")}static credential(e){return Kn._fromParams({providerId:Jt.PROVIDER_ID,signInMethod:Jt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Jt.credentialFromTaggedObject(e)}static credentialFromError(e){return Jt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Jt.credential(e.oauthAccessToken)}catch{return null}}}Jt.FACEBOOK_SIGN_IN_METHOD="facebook.com";Jt.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xt extends pi{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Kn._fromParams({providerId:Xt.PROVIDER_ID,signInMethod:Xt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Xt.credentialFromTaggedObject(e)}static credentialFromError(e){return Xt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:n}=e;if(!t&&!n)return null;try{return Xt.credential(t,n)}catch{return null}}}Xt.GOOGLE_SIGN_IN_METHOD="google.com";Xt.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zt extends pi{constructor(){super("github.com")}static credential(e){return Kn._fromParams({providerId:Zt.PROVIDER_ID,signInMethod:Zt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Zt.credentialFromTaggedObject(e)}static credentialFromError(e){return Zt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Zt.credential(e.oauthAccessToken)}catch{return null}}}Zt.GITHUB_SIGN_IN_METHOD="github.com";Zt.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class en extends pi{constructor(){super("twitter.com")}static credential(e,t){return Kn._fromParams({providerId:en.PROVIDER_ID,signInMethod:en.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return en.credentialFromTaggedObject(e)}static credentialFromError(e){return en.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:n}=e;if(!t||!n)return null;try{return en.credential(t,n)}catch{return null}}}en.TWITTER_SIGN_IN_METHOD="twitter.com";en.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function mI(r,e){return fi(r,"POST","/v1/accounts:signUp",In(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,n,s=!1){const i=await lt._fromIdTokenResponse(e,n,s),o=yh(n);return new Gn({user:i,providerId:o,_tokenResponse:n,operationType:t})}static async _forOperation(e,t,n){await e._updateTokensIfNecessary(n,!0);const s=yh(n);return new Gn({user:e,providerId:s,_tokenResponse:n,operationType:t})}}function yh(r){return r.providerId?r.providerId:"phoneNumber"in r?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wo extends Rt{constructor(e,t,n,s){super(t.code,t.message),this.operationType=n,this.user=s,Object.setPrototypeOf(this,wo.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(e,t,n,s){return new wo(e,t,n,s)}}function Df(r,e,t,n){return(e==="reauthenticate"?t._getReauthenticationResolver(r):t._getIdTokenResponse(r)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?wo._fromErrorAndOperation(r,i,e,n):i})}async function gI(r,e,t=!1){const n=await qs(r,e._linkToIdToken(r.auth,await r.getIdToken()),t);return Gn._forOperation(r,"link",n)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _I(r,e,t=!1){const{auth:n}=r;if(Je(n.app))return Promise.reject(St(n));const s="reauthenticate";try{const i=await qs(r,Df(n,s,e,r),t);j(i.idToken,n,"internal-error");const o=zu(i.idToken);j(o,n,"internal-error");const{sub:u}=o;return j(r.uid===u,n,"user-mismatch"),Gn._forOperation(r,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&ht(n,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Nf(r,e,t=!1){if(Je(r.app))return Promise.reject(St(r));const n="signIn",s=await Df(r,n,e),i=await Gn._fromIdTokenResponse(r,n,s);return t||await r._updateCurrentUser(i.user),i}async function yI(r,e){return Nf(Zn(r),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function kf(r){const e=Zn(r);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function IP(r,e,t){if(Je(r.app))return Promise.reject(St(r));const n=Zn(r),o=await uu(n,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",mI).catch(c=>{throw c.code==="auth/password-does-not-meet-requirements"&&kf(r),c}),u=await Gn._fromIdTokenResponse(n,"signIn",o);return await n._updateCurrentUser(u.user),u}function EP(r,e,t){return Je(r.app)?Promise.reject(St(r)):yI(Ve(r),Gr.credential(e,t)).catch(async n=>{throw n.code==="auth/password-does-not-meet-requirements"&&kf(r),n})}function II(r,e,t,n){return Ve(r).onIdTokenChanged(e,t,n)}function EI(r,e,t){return Ve(r).beforeAuthStateChanged(e,t)}function TP(r,e,t,n){return Ve(r).onAuthStateChanged(e,t,n)}function wP(r){return Ve(r).signOut()}const vo="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Of{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(vo,"1"),this.storage.removeItem(vo),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const TI=1e3,wI=10;class Lf extends Of{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Pf(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const n=this.storage.getItem(t),s=this.localCache[t];n!==s&&e(t,s,n)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,u,c)=>{this.notifyListeners(o,c)});return}const n=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(n);!t&&this.localCache[n]===o||this.notifyListeners(n,o)},i=this.storage.getItem(n);zy()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,wI):s()}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const s of Array.from(n))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:n}),!0)})},TI)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Lf.type="LOCAL";const vI=Lf;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mf extends Of{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Mf.type="SESSION";const Uf=Mf;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function AI(r){return Promise.all(r.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wo{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const n=new Wo(e);return this.receivers.push(n),n}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:n,eventType:s,data:i}=t.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:n,eventType:s});const u=Array.from(o).map(async h=>h(t.origin,i)),c=await AI(u);t.ports[0].postMessage({status:"done",eventId:n,eventType:s,response:c})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Wo.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wu(r="",e=10){let t="";for(let n=0;n<e;n++)t+=Math.floor(Math.random()*10);return r+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RI{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,n=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((u,c)=>{const h=Wu("",20);s.port1.start();const f=setTimeout(()=>{c(new Error("unsupported_event"))},n);o={messageChannel:s,onMessage(p){const _=p;if(_.data.eventId===h)switch(_.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),u(_.data.response);break;default:clearTimeout(f),clearTimeout(i),c(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:h,data:t},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Et(){return window}function PI(r){Et().location.href=r}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ff(){return typeof Et().WorkerGlobalScope<"u"&&typeof Et().importScripts=="function"}async function bI(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function SI(){var r;return((r=navigator==null?void 0:navigator.serviceWorker)==null?void 0:r.controller)||null}function VI(){return Ff()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bf="firebaseLocalStorageDb",CI=1,Ao="firebaseLocalStorage",qf="fbase_key";class mi{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Qo(r,e){return r.transaction([Ao],e?"readwrite":"readonly").objectStore(Ao)}function xI(){const r=indexedDB.deleteDatabase(Bf);return new mi(r).toPromise()}function $f(){const r=indexedDB.open(Bf,CI);return new Promise((e,t)=>{r.addEventListener("error",()=>{t(r.error)}),r.addEventListener("upgradeneeded",()=>{const n=r.result;try{n.createObjectStore(Ao,{keyPath:qf})}catch(s){t(s)}}),r.addEventListener("success",async()=>{const n=r.result;n.objectStoreNames.contains(Ao)?e(n):(n.close(),await xI(),e(await $f()))})})}async function Ih(r,e,t){const n=Qo(r,!0).put({[qf]:e,value:t});return new mi(n).toPromise()}async function DI(r,e){const t=Qo(r,!1).get(e),n=await new mi(t).toPromise();return n===void 0?null:n.value}function Eh(r,e){const t=Qo(r,!0).delete(e);return new mi(t).toPromise()}const NI=800,kI=3;class jf{constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=$f(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let t=0;for(;;)try{const n=await this._openDb();return await e(n)}catch(n){if(t++>kI)throw n;this.dbPromise&&((await this.dbPromise).close(),this.dbPromise=null)}}async initializeServiceWorkerMessaging(){return Ff()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Wo._getInstance(VI()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,n;if(this.activeServiceWorker=await bI(),!this.activeServiceWorker)return;this.sender=new RI(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(n=e[0])!=null&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||SI()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await Ih(e,vo,"1"),await Eh(e,vo)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(n=>Ih(n,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(n=>DI(n,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Eh(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=Qo(s,!1).getAll();return new mi(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],n=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)n.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!n.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const s of Array.from(n))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),NI)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}jf.type="LOCAL";const OI=jf;new di(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function LI(r,e){return e?bt(e):(j(r._popupRedirectResolver,r,"argument-error"),r._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qu extends Gu{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return vr(e,this._buildIdpRequest())}_linkToIdToken(e,t){return vr(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return vr(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function MI(r){return Nf(r.auth,new Qu(r),r.bypassAuthState)}function UI(r){const{auth:e,user:t}=r;return j(t,e,"internal-error"),_I(t,new Qu(r),r.bypassAuthState)}async function FI(r){const{auth:e,user:t}=r;return j(t,e,"internal-error"),gI(t,new Qu(r),r.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zf{constructor(e,t,n,s,i=!1){this.auth=e,this.resolver=n,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(n){this.reject(n)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:n,postBody:s,tenantId:i,error:o,type:u}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:t,sessionId:n,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(u)(c))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return MI;case"linkViaPopup":case"linkViaRedirect":return FI;case"reauthViaPopup":case"reauthViaRedirect":return UI;default:ht(this.auth,"internal-error")}}resolve(e){Nt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Nt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const BI=new di(2e3,1e4);class Er extends zf{constructor(e,t,n,s,i){super(e,t,s,i),this.provider=n,this.authWindow=null,this.pollId=null,Er.currentPopupAction&&Er.currentPopupAction.cancel(),Er.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return j(e,this.auth,"internal-error"),e}async onExecution(){Nt(this.filter.length===1,"Popup operations only handle one event");const e=Wu();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(It(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(It(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Er.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,n;if((n=(t=this.authWindow)==null?void 0:t.window)!=null&&n.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(It(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,BI.get())};e()}}Er.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qI="pendingRedirect",so=new Map;class $I extends zf{constructor(e,t,n=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,n),this.eventId=null}async execute(){let e=so.get(this.auth._key());if(!e){try{const n=await jI(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(n)}catch(t){e=()=>Promise.reject(t)}so.set(this.auth._key(),e)}return this.bypassAuthState||so.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function jI(r,e){const t=GI(e),n=KI(r);if(!await n._isAvailable())return!1;const s=await n._get(t)==="true";return await n._remove(t),s}function zI(r,e){so.set(r._key(),e)}function KI(r){return bt(r._redirectPersistence)}function GI(r){return ro(qI,r.config.apiKey,r.name)}async function HI(r,e,t=!1){if(Je(r.app))return Promise.reject(St(r));const n=Zn(r),s=LI(n,e),o=await new $I(n,s,t).execute();return o&&!t&&(delete o.user._redirectEventId,await n._persistUserIfCurrent(o.user),await n._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WI=600*1e3;class QI{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(n=>{this.isEventForConsumer(e,n)&&(t=!0,this.sendToConsumer(e,n),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!YI(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var n;if(e.error&&!Kf(e)){const s=((n=e.error.code)==null?void 0:n.split("auth/")[1])||"internal-error";t.onError(It(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const n=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&n}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=WI&&this.cachedEventUids.clear(),this.cachedEventUids.has(Th(e))}saveEventToCache(e){this.cachedEventUids.add(Th(e)),this.lastProcessedEventTime=Date.now()}}function Th(r){return[r.type,r.eventId,r.sessionId,r.tenantId].filter(e=>e).join("-")}function Kf({type:r,error:e}){return r==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function YI(r){switch(r.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Kf(r);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function JI(r,e={}){return En(r,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const XI=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,ZI=/^https?/;async function eE(r){if(r.config.emulator)return;const{authorizedDomains:e}=await JI(r);for(const t of e)try{if(tE(t))return}catch{}ht(r,"unauthorized-domain")}function tE(r){const e=ou(),{protocol:t,hostname:n}=new URL(e);if(r.startsWith("chrome-extension://")){const o=new URL(r);return o.hostname===""&&n===""?t==="chrome-extension:"&&r.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===n}if(!ZI.test(t))return!1;if(XI.test(r))return n===r;const s=r.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(n)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nE=new di(3e4,6e4);function wh(){const r=Et().___jsl;if(r!=null&&r.H){for(const e of Object.keys(r.H))if(r.H[e].r=r.H[e].r||[],r.H[e].L=r.H[e].L||[],r.H[e].r=[...r.H[e].L],r.CP)for(let t=0;t<r.CP.length;t++)r.CP[t]=null}}function rE(r){return new Promise((e,t)=>{var s,i,o;function n(){wh(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{wh(),t(It(r,"network-request-failed"))},timeout:nE.get()})}if((i=(s=Et().gapi)==null?void 0:s.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((o=Et().gapi)!=null&&o.load)n();else{const u=Zy("iframefcb");return Et()[u]=()=>{gapi.load?n():t(It(r,"network-request-failed"))},Sf(`${Xy()}?onload=${u}`).catch(c=>t(c))}}).catch(e=>{throw io=null,e})}let io=null;function sE(r){return io=io||rE(r),io}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iE=new di(5e3,15e3),oE="__/auth/iframe",aE="emulator/auth/iframe",uE={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},cE=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function lE(r){const e=r.config;j(e.authDomain,r,"auth-domain-config-required");const t=e.emulator?ju(e,aE):`https://${r.config.authDomain}/${oE}`,n={apiKey:e.apiKey,appName:r.name,v:Kr},s=cE.get(r.config.apiHost);s&&(n.eid=s);const i=r._getFrameworks();return i.length&&(n.fw=i.join(",")),`${t}?${li(n).slice(1)}`}async function hE(r){const e=await sE(r),t=Et().gapi;return j(t,r,"internal-error"),e.open({where:document.body,url:lE(r),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:uE,dontclear:!0},n=>new Promise(async(s,i)=>{await n.restyle({setHideOnLeave:!1});const o=It(r,"network-request-failed"),u=Et().setTimeout(()=>{i(o)},iE.get());function c(){Et().clearTimeout(u),s(n)}n.ping(c).then(c,()=>{i(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dE={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},fE=500,pE=600,mE="_blank",gE="http://localhost";class vh{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function _E(r,e,t,n=fE,s=pE){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-n)/2,0).toString();let u="";const c={...dE,width:n.toString(),height:s.toString(),top:i,left:o},h=we().toLowerCase();t&&(u=Tf(h)?mE:t),If(h)&&(e=e||gE,c.scrollbars="yes");const f=Object.entries(c).reduce((_,[P,V])=>`${_}${P}=${V},`,"");if(jy(h)&&u!=="_self")return yE(e||"",u),new vh(null);const p=window.open(e||"",u,f);j(p,r,"popup-blocked");try{p.focus()}catch{}return new vh(p)}function yE(r,e){const t=document.createElement("a");t.href=r,t.target=e;const n=document.createEvent("MouseEvent");n.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(n)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const IE="__/auth/handler",EE="emulator/auth/handler",TE=encodeURIComponent("fac");async function Ah(r,e,t,n,s,i){j(r.config.authDomain,r,"auth-domain-config-required"),j(r.config.apiKey,r,"invalid-api-key");const o={apiKey:r.config.apiKey,appName:r.name,authType:t,redirectUrl:n,v:Kr,eventId:s};if(e instanceof xf){e.setDefaultLanguage(r.languageCode),o.providerId=e.providerId||"",y_(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,p]of Object.entries({}))o[f]=p}if(e instanceof pi){const f=e.getScopes().filter(p=>p!=="");f.length>0&&(o.scopes=f.join(","))}r.tenantId&&(o.tid=r.tenantId);const u=o;for(const f of Object.keys(u))u[f]===void 0&&delete u[f];const c=await r._getAppCheckToken(),h=c?`#${TE}=${encodeURIComponent(c)}`:"";return`${wE(r)}?${li(u).slice(1)}${h}`}function wE({config:r}){return r.emulator?ju(r,EE):`https://${r.authDomain}/${IE}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wa="webStorageSupport";class vE{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Uf,this._completeRedirectFn=HI,this._overrideRedirectResult=zI}async _openPopup(e,t,n,s){var o;Nt((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const i=await Ah(e,t,n,ou(),s);return _E(e,i,Wu())}async _openRedirect(e,t,n,s){await this._originValidation(e);const i=await Ah(e,t,n,ou(),s);return PI(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(Nt(i,"If manager is not set, promise should be"),i)}const n=this.initAndGetManager(e);return this.eventManagers[t]={promise:n},n.catch(()=>{delete this.eventManagers[t]}),n}async initAndGetManager(e){const t=await hE(e),n=new QI(e);return t.register("authEvent",s=>(j(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:n.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:n},this.iframes[e._key()]=t,n}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Wa,{type:Wa},s=>{var o;const i=(o=s==null?void 0:s[0])==null?void 0:o[Wa];i!==void 0&&t(!!i),ht(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=eE(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Pf()||Ef()||Ku()}}const AE=vE;var Rh="@firebase/auth",Ph="1.13.3";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RE{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(n=>{e((n==null?void 0:n.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){j(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function PE(r){switch(r){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function bE(r){zn(new hn("auth",(e,{options:t})=>{const n=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:u}=n.options;j(o&&!o.includes(":"),"invalid-api-key",{appName:n.name});const c={apiKey:o,authDomain:u,clientPlatform:r,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:bf(r)},h=new Qy(n,s,i,c);return sI(h,t),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,n)=>{e.getProvider("auth-internal").initialize()})),zn(new hn("auth-internal",e=>{const t=Zn(e.getProvider("auth").getImmediate());return(n=>new RE(n))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),yt(Rh,Ph,PE(r)),yt(Rh,Ph,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const SE=300,VE=tf("authIdTokenMaxAge")||SE;let bh=null;const CE=r=>async e=>{const t=e&&await e.getIdTokenResult(),n=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(n&&n>VE)return;const s=t==null?void 0:t.token;bh!==s&&(bh=s,await fetch(r,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function vP(r=qu()){const e=hi(r,"auth");if(e.isInitialized())return e.getImmediate();const t=rI(r,{popupRedirectResolver:AE,persistence:[OI,vI,Uf]}),n=tf("authTokenSyncURL");if(n&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(n,location.origin);if(location.origin===i.origin){const o=CE(i.toString());EI(t,o,()=>o(t.currentUser)),II(t,u=>o(u))}}const s=Xd("auth");return s&&iI(t,`http://${s}`),t}function xE(){var r;return((r=document.getElementsByTagName("head"))==null?void 0:r[0])??document}Yy({loadJS(r){return new Promise((e,t)=>{const n=document.createElement("script");n.setAttribute("src",r),n.onload=e,n.onerror=s=>{const i=It("internal-error");i.customData=s,t(i)},n.type="text/javascript",n.charset="UTF-8",xE().appendChild(n)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});bE("Browser");var Sh=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var on,Gf;(function(){var r;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(T,g){function I(){}I.prototype=g.prototype,T.F=g.prototype,T.prototype=new I,T.prototype.constructor=T,T.D=function(v,w,b){for(var y=Array(arguments.length-2),je=2;je<arguments.length;je++)y[je-2]=arguments[je];return g.prototype[w].apply(v,y)}}function t(){this.blockSize=-1}function n(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(n,t),n.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(T,g,I){I||(I=0);const v=Array(16);if(typeof g=="string")for(var w=0;w<16;++w)v[w]=g.charCodeAt(I++)|g.charCodeAt(I++)<<8|g.charCodeAt(I++)<<16|g.charCodeAt(I++)<<24;else for(w=0;w<16;++w)v[w]=g[I++]|g[I++]<<8|g[I++]<<16|g[I++]<<24;g=T.g[0],I=T.g[1],w=T.g[2];let b=T.g[3],y;y=g+(b^I&(w^b))+v[0]+3614090360&4294967295,g=I+(y<<7&4294967295|y>>>25),y=b+(w^g&(I^w))+v[1]+3905402710&4294967295,b=g+(y<<12&4294967295|y>>>20),y=w+(I^b&(g^I))+v[2]+606105819&4294967295,w=b+(y<<17&4294967295|y>>>15),y=I+(g^w&(b^g))+v[3]+3250441966&4294967295,I=w+(y<<22&4294967295|y>>>10),y=g+(b^I&(w^b))+v[4]+4118548399&4294967295,g=I+(y<<7&4294967295|y>>>25),y=b+(w^g&(I^w))+v[5]+1200080426&4294967295,b=g+(y<<12&4294967295|y>>>20),y=w+(I^b&(g^I))+v[6]+2821735955&4294967295,w=b+(y<<17&4294967295|y>>>15),y=I+(g^w&(b^g))+v[7]+4249261313&4294967295,I=w+(y<<22&4294967295|y>>>10),y=g+(b^I&(w^b))+v[8]+1770035416&4294967295,g=I+(y<<7&4294967295|y>>>25),y=b+(w^g&(I^w))+v[9]+2336552879&4294967295,b=g+(y<<12&4294967295|y>>>20),y=w+(I^b&(g^I))+v[10]+4294925233&4294967295,w=b+(y<<17&4294967295|y>>>15),y=I+(g^w&(b^g))+v[11]+2304563134&4294967295,I=w+(y<<22&4294967295|y>>>10),y=g+(b^I&(w^b))+v[12]+1804603682&4294967295,g=I+(y<<7&4294967295|y>>>25),y=b+(w^g&(I^w))+v[13]+4254626195&4294967295,b=g+(y<<12&4294967295|y>>>20),y=w+(I^b&(g^I))+v[14]+2792965006&4294967295,w=b+(y<<17&4294967295|y>>>15),y=I+(g^w&(b^g))+v[15]+1236535329&4294967295,I=w+(y<<22&4294967295|y>>>10),y=g+(w^b&(I^w))+v[1]+4129170786&4294967295,g=I+(y<<5&4294967295|y>>>27),y=b+(I^w&(g^I))+v[6]+3225465664&4294967295,b=g+(y<<9&4294967295|y>>>23),y=w+(g^I&(b^g))+v[11]+643717713&4294967295,w=b+(y<<14&4294967295|y>>>18),y=I+(b^g&(w^b))+v[0]+3921069994&4294967295,I=w+(y<<20&4294967295|y>>>12),y=g+(w^b&(I^w))+v[5]+3593408605&4294967295,g=I+(y<<5&4294967295|y>>>27),y=b+(I^w&(g^I))+v[10]+38016083&4294967295,b=g+(y<<9&4294967295|y>>>23),y=w+(g^I&(b^g))+v[15]+3634488961&4294967295,w=b+(y<<14&4294967295|y>>>18),y=I+(b^g&(w^b))+v[4]+3889429448&4294967295,I=w+(y<<20&4294967295|y>>>12),y=g+(w^b&(I^w))+v[9]+568446438&4294967295,g=I+(y<<5&4294967295|y>>>27),y=b+(I^w&(g^I))+v[14]+3275163606&4294967295,b=g+(y<<9&4294967295|y>>>23),y=w+(g^I&(b^g))+v[3]+4107603335&4294967295,w=b+(y<<14&4294967295|y>>>18),y=I+(b^g&(w^b))+v[8]+1163531501&4294967295,I=w+(y<<20&4294967295|y>>>12),y=g+(w^b&(I^w))+v[13]+2850285829&4294967295,g=I+(y<<5&4294967295|y>>>27),y=b+(I^w&(g^I))+v[2]+4243563512&4294967295,b=g+(y<<9&4294967295|y>>>23),y=w+(g^I&(b^g))+v[7]+1735328473&4294967295,w=b+(y<<14&4294967295|y>>>18),y=I+(b^g&(w^b))+v[12]+2368359562&4294967295,I=w+(y<<20&4294967295|y>>>12),y=g+(I^w^b)+v[5]+4294588738&4294967295,g=I+(y<<4&4294967295|y>>>28),y=b+(g^I^w)+v[8]+2272392833&4294967295,b=g+(y<<11&4294967295|y>>>21),y=w+(b^g^I)+v[11]+1839030562&4294967295,w=b+(y<<16&4294967295|y>>>16),y=I+(w^b^g)+v[14]+4259657740&4294967295,I=w+(y<<23&4294967295|y>>>9),y=g+(I^w^b)+v[1]+2763975236&4294967295,g=I+(y<<4&4294967295|y>>>28),y=b+(g^I^w)+v[4]+1272893353&4294967295,b=g+(y<<11&4294967295|y>>>21),y=w+(b^g^I)+v[7]+4139469664&4294967295,w=b+(y<<16&4294967295|y>>>16),y=I+(w^b^g)+v[10]+3200236656&4294967295,I=w+(y<<23&4294967295|y>>>9),y=g+(I^w^b)+v[13]+681279174&4294967295,g=I+(y<<4&4294967295|y>>>28),y=b+(g^I^w)+v[0]+3936430074&4294967295,b=g+(y<<11&4294967295|y>>>21),y=w+(b^g^I)+v[3]+3572445317&4294967295,w=b+(y<<16&4294967295|y>>>16),y=I+(w^b^g)+v[6]+76029189&4294967295,I=w+(y<<23&4294967295|y>>>9),y=g+(I^w^b)+v[9]+3654602809&4294967295,g=I+(y<<4&4294967295|y>>>28),y=b+(g^I^w)+v[12]+3873151461&4294967295,b=g+(y<<11&4294967295|y>>>21),y=w+(b^g^I)+v[15]+530742520&4294967295,w=b+(y<<16&4294967295|y>>>16),y=I+(w^b^g)+v[2]+3299628645&4294967295,I=w+(y<<23&4294967295|y>>>9),y=g+(w^(I|~b))+v[0]+4096336452&4294967295,g=I+(y<<6&4294967295|y>>>26),y=b+(I^(g|~w))+v[7]+1126891415&4294967295,b=g+(y<<10&4294967295|y>>>22),y=w+(g^(b|~I))+v[14]+2878612391&4294967295,w=b+(y<<15&4294967295|y>>>17),y=I+(b^(w|~g))+v[5]+4237533241&4294967295,I=w+(y<<21&4294967295|y>>>11),y=g+(w^(I|~b))+v[12]+1700485571&4294967295,g=I+(y<<6&4294967295|y>>>26),y=b+(I^(g|~w))+v[3]+2399980690&4294967295,b=g+(y<<10&4294967295|y>>>22),y=w+(g^(b|~I))+v[10]+4293915773&4294967295,w=b+(y<<15&4294967295|y>>>17),y=I+(b^(w|~g))+v[1]+2240044497&4294967295,I=w+(y<<21&4294967295|y>>>11),y=g+(w^(I|~b))+v[8]+1873313359&4294967295,g=I+(y<<6&4294967295|y>>>26),y=b+(I^(g|~w))+v[15]+4264355552&4294967295,b=g+(y<<10&4294967295|y>>>22),y=w+(g^(b|~I))+v[6]+2734768916&4294967295,w=b+(y<<15&4294967295|y>>>17),y=I+(b^(w|~g))+v[13]+1309151649&4294967295,I=w+(y<<21&4294967295|y>>>11),y=g+(w^(I|~b))+v[4]+4149444226&4294967295,g=I+(y<<6&4294967295|y>>>26),y=b+(I^(g|~w))+v[11]+3174756917&4294967295,b=g+(y<<10&4294967295|y>>>22),y=w+(g^(b|~I))+v[2]+718787259&4294967295,w=b+(y<<15&4294967295|y>>>17),y=I+(b^(w|~g))+v[9]+3951481745&4294967295,T.g[0]=T.g[0]+g&4294967295,T.g[1]=T.g[1]+(w+(y<<21&4294967295|y>>>11))&4294967295,T.g[2]=T.g[2]+w&4294967295,T.g[3]=T.g[3]+b&4294967295}n.prototype.v=function(T,g){g===void 0&&(g=T.length);const I=g-this.blockSize,v=this.C;let w=this.h,b=0;for(;b<g;){if(w==0)for(;b<=I;)s(this,T,b),b+=this.blockSize;if(typeof T=="string"){for(;b<g;)if(v[w++]=T.charCodeAt(b++),w==this.blockSize){s(this,v),w=0;break}}else for(;b<g;)if(v[w++]=T[b++],w==this.blockSize){s(this,v),w=0;break}}this.h=w,this.o+=g},n.prototype.A=function(){var T=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);T[0]=128;for(var g=1;g<T.length-8;++g)T[g]=0;g=this.o*8;for(var I=T.length-8;I<T.length;++I)T[I]=g&255,g/=256;for(this.v(T),T=Array(16),g=0,I=0;I<4;++I)for(let v=0;v<32;v+=8)T[g++]=this.g[I]>>>v&255;return T};function i(T,g){var I=u;return Object.prototype.hasOwnProperty.call(I,T)?I[T]:I[T]=g(T)}function o(T,g){this.h=g;const I=[];let v=!0;for(let w=T.length-1;w>=0;w--){const b=T[w]|0;v&&b==g||(I[w]=b,v=!1)}this.g=I}var u={};function c(T){return-128<=T&&T<128?i(T,function(g){return new o([g|0],g<0?-1:0)}):new o([T|0],T<0?-1:0)}function h(T){if(isNaN(T)||!isFinite(T))return p;if(T<0)return M(h(-T));const g=[];let I=1;for(let v=0;T>=I;v++)g[v]=T/I|0,I*=4294967296;return new o(g,0)}function f(T,g){if(T.length==0)throw Error("number format error: empty string");if(g=g||10,g<2||36<g)throw Error("radix out of range: "+g);if(T.charAt(0)=="-")return M(f(T.substring(1),g));if(T.indexOf("-")>=0)throw Error('number format error: interior "-" character');const I=h(Math.pow(g,8));let v=p;for(let b=0;b<T.length;b+=8){var w=Math.min(8,T.length-b);const y=parseInt(T.substring(b,b+w),g);w<8?(w=h(Math.pow(g,w)),v=v.j(w).add(h(y))):(v=v.j(I),v=v.add(h(y)))}return v}var p=c(0),_=c(1),P=c(16777216);r=o.prototype,r.m=function(){if(O(this))return-M(this).m();let T=0,g=1;for(let I=0;I<this.g.length;I++){const v=this.i(I);T+=(v>=0?v:4294967296+v)*g,g*=4294967296}return T},r.toString=function(T){if(T=T||10,T<2||36<T)throw Error("radix out of range: "+T);if(V(this))return"0";if(O(this))return"-"+M(this).toString(T);const g=h(Math.pow(T,6));var I=this;let v="";for(;;){const w=ue(I,g).g;I=z(I,w.j(g));let b=((I.g.length>0?I.g[0]:I.h)>>>0).toString(T);if(I=w,V(I))return b+v;for(;b.length<6;)b="0"+b;v=b+v}},r.i=function(T){return T<0?0:T<this.g.length?this.g[T]:this.h};function V(T){if(T.h!=0)return!1;for(let g=0;g<T.g.length;g++)if(T.g[g]!=0)return!1;return!0}function O(T){return T.h==-1}r.l=function(T){return T=z(this,T),O(T)?-1:V(T)?0:1};function M(T){const g=T.g.length,I=[];for(let v=0;v<g;v++)I[v]=~T.g[v];return new o(I,~T.h).add(_)}r.abs=function(){return O(this)?M(this):this},r.add=function(T){const g=Math.max(this.g.length,T.g.length),I=[];let v=0;for(let w=0;w<=g;w++){let b=v+(this.i(w)&65535)+(T.i(w)&65535),y=(b>>>16)+(this.i(w)>>>16)+(T.i(w)>>>16);v=y>>>16,b&=65535,y&=65535,I[w]=y<<16|b}return new o(I,I[I.length-1]&-2147483648?-1:0)};function z(T,g){return T.add(M(g))}r.j=function(T){if(V(this)||V(T))return p;if(O(this))return O(T)?M(this).j(M(T)):M(M(this).j(T));if(O(T))return M(this.j(M(T)));if(this.l(P)<0&&T.l(P)<0)return h(this.m()*T.m());const g=this.g.length+T.g.length,I=[];for(var v=0;v<2*g;v++)I[v]=0;for(v=0;v<this.g.length;v++)for(let w=0;w<T.g.length;w++){const b=this.i(v)>>>16,y=this.i(v)&65535,je=T.i(w)>>>16,vn=T.i(w)&65535;I[2*v+2*w]+=y*vn,K(I,2*v+2*w),I[2*v+2*w+1]+=b*vn,K(I,2*v+2*w+1),I[2*v+2*w+1]+=y*je,K(I,2*v+2*w+1),I[2*v+2*w+2]+=b*je,K(I,2*v+2*w+2)}for(T=0;T<g;T++)I[T]=I[2*T+1]<<16|I[2*T];for(T=g;T<2*g;T++)I[T]=0;return new o(I,0)};function K(T,g){for(;(T[g]&65535)!=T[g];)T[g+1]+=T[g]>>>16,T[g]&=65535,g++}function H(T,g){this.g=T,this.h=g}function ue(T,g){if(V(g))throw Error("division by zero");if(V(T))return new H(p,p);if(O(T))return g=ue(M(T),g),new H(M(g.g),M(g.h));if(O(g))return g=ue(T,M(g)),new H(M(g.g),g.h);if(T.g.length>30){if(O(T)||O(g))throw Error("slowDivide_ only works with positive integers.");for(var I=_,v=g;v.l(T)<=0;)I=te(I),v=te(v);var w=ne(I,1),b=ne(v,1);for(v=ne(v,2),I=ne(I,2);!V(v);){var y=b.add(v);y.l(T)<=0&&(w=w.add(I),b=y),v=ne(v,1),I=ne(I,1)}return g=z(T,w.j(g)),new H(w,g)}for(w=p;T.l(g)>=0;){for(I=Math.max(1,Math.floor(T.m()/g.m())),v=Math.ceil(Math.log(I)/Math.LN2),v=v<=48?1:Math.pow(2,v-48),b=h(I),y=b.j(g);O(y)||y.l(T)>0;)I-=v,b=h(I),y=b.j(g);V(b)&&(b=_),w=w.add(b),T=z(T,y)}return new H(w,T)}r.B=function(T){return ue(this,T).h},r.and=function(T){const g=Math.max(this.g.length,T.g.length),I=[];for(let v=0;v<g;v++)I[v]=this.i(v)&T.i(v);return new o(I,this.h&T.h)},r.or=function(T){const g=Math.max(this.g.length,T.g.length),I=[];for(let v=0;v<g;v++)I[v]=this.i(v)|T.i(v);return new o(I,this.h|T.h)},r.xor=function(T){const g=Math.max(this.g.length,T.g.length),I=[];for(let v=0;v<g;v++)I[v]=this.i(v)^T.i(v);return new o(I,this.h^T.h)};function te(T){const g=T.g.length+1,I=[];for(let v=0;v<g;v++)I[v]=T.i(v)<<1|T.i(v-1)>>>31;return new o(I,T.h)}function ne(T,g){const I=g>>5;g%=32;const v=T.g.length-I,w=[];for(let b=0;b<v;b++)w[b]=g>0?T.i(b+I)>>>g|T.i(b+I+1)<<32-g:T.i(b+I);return new o(w,T.h)}n.prototype.digest=n.prototype.A,n.prototype.reset=n.prototype.u,n.prototype.update=n.prototype.v,Gf=n,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=h,o.fromString=f,on=o}).apply(typeof Sh<"u"?Sh:typeof self<"u"?self:typeof window<"u"?window:{});var Hi=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Hf,vs,Wf,oo,cu,Qf,Yf,Jf;(function(){var r,e=Object.defineProperty;function t(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof Hi=="object"&&Hi];for(var l=0;l<a.length;++l){var d=a[l];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var n=t(this);function s(a,l){if(l)e:{var d=n;a=a.split(".");for(var m=0;m<a.length-1;m++){var R=a[m];if(!(R in d))break e;d=d[R]}a=a[a.length-1],m=d[a],l=l(m),l!=m&&l!=null&&e(d,a,{configurable:!0,writable:!0,value:l})}}s("Symbol.dispose",function(a){return a||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(a){return a||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(a){return a||function(l){var d=[],m;for(m in l)Object.prototype.hasOwnProperty.call(l,m)&&d.push([m,l[m]]);return d}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},o=this||self;function u(a){var l=typeof a;return l=="object"&&a!=null||l=="function"}function c(a,l,d){return a.call.apply(a.bind,arguments)}function h(a,l,d){return h=c,h.apply(null,arguments)}function f(a,l){var d=Array.prototype.slice.call(arguments,1);return function(){var m=d.slice();return m.push.apply(m,arguments),a.apply(this,m)}}function p(a,l){function d(){}d.prototype=l.prototype,a.Z=l.prototype,a.prototype=new d,a.prototype.constructor=a,a.Ob=function(m,R,S){for(var L=Array(arguments.length-2),Y=2;Y<arguments.length;Y++)L[Y-2]=arguments[Y];return l.prototype[R].apply(m,L)}}var _=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function P(a){const l=a.length;if(l>0){const d=Array(l);for(let m=0;m<l;m++)d[m]=a[m];return d}return[]}function V(a,l){for(let m=1;m<arguments.length;m++){const R=arguments[m];var d=typeof R;if(d=d!="object"?d:R?Array.isArray(R)?"array":d:"null",d=="array"||d=="object"&&typeof R.length=="number"){d=a.length||0;const S=R.length||0;a.length=d+S;for(let L=0;L<S;L++)a[d+L]=R[L]}else a.push(R)}}class O{constructor(l,d){this.i=l,this.j=d,this.h=0,this.g=null}get(){let l;return this.h>0?(this.h--,l=this.g,this.g=l.next,l.next=null):l=this.i(),l}}function M(a){o.setTimeout(()=>{throw a},0)}function z(){var a=T;let l=null;return a.g&&(l=a.g,a.g=a.g.next,a.g||(a.h=null),l.next=null),l}class K{constructor(){this.h=this.g=null}add(l,d){const m=H.get();m.set(l,d),this.h?this.h.next=m:this.g=m,this.h=m}}var H=new O(()=>new ue,a=>a.reset());class ue{constructor(){this.next=this.g=this.h=null}set(l,d){this.h=l,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let te,ne=!1,T=new K,g=()=>{const a=Promise.resolve(void 0);te=()=>{a.then(I)}};function I(){for(var a;a=z();){try{a.h.call(a.g)}catch(d){M(d)}var l=H;l.j(a),l.h<100&&(l.h++,a.next=l.g,l.g=a)}ne=!1}function v(){this.u=this.u,this.C=this.C}v.prototype.u=!1,v.prototype.dispose=function(){this.u||(this.u=!0,this.N())},v.prototype[Symbol.dispose]=function(){this.dispose()},v.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function w(a,l){this.type=a,this.g=this.target=l,this.defaultPrevented=!1}w.prototype.h=function(){this.defaultPrevented=!0};var b=(function(){if(!o.addEventListener||!Object.defineProperty)return!1;var a=!1,l=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const d=()=>{};o.addEventListener("test",d,l),o.removeEventListener("test",d,l)}catch{}return a})();function y(a){return/^[\s\xa0]*$/.test(a)}function je(a,l){w.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a&&this.init(a,l)}p(je,w),je.prototype.init=function(a,l){const d=this.type=a.type,m=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement,this.g=l,l=a.relatedTarget,l||(d=="mouseover"?l=a.fromElement:d=="mouseout"&&(l=a.toElement)),this.relatedTarget=l,m?(this.clientX=m.clientX!==void 0?m.clientX:m.pageX,this.clientY=m.clientY!==void 0?m.clientY:m.pageY,this.screenX=m.screenX||0,this.screenY=m.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=a.pointerType,this.state=a.state,this.i=a,a.defaultPrevented&&je.Z.h.call(this)},je.prototype.h=function(){je.Z.h.call(this);const a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var vn="closure_listenable_"+(Math.random()*1e6|0),wg=0;function vg(a,l,d,m,R){this.listener=a,this.proxy=null,this.src=l,this.type=d,this.capture=!!m,this.ha=R,this.key=++wg,this.da=this.fa=!1}function xi(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function Di(a,l,d){for(const m in a)l.call(d,a[m],m,a)}function Ag(a,l){for(const d in a)l.call(void 0,a[d],d,a)}function el(a){const l={};for(const d in a)l[d]=a[d];return l}const tl="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function nl(a,l){let d,m;for(let R=1;R<arguments.length;R++){m=arguments[R];for(d in m)a[d]=m[d];for(let S=0;S<tl.length;S++)d=tl[S],Object.prototype.hasOwnProperty.call(m,d)&&(a[d]=m[d])}}function Ni(a){this.src=a,this.g={},this.h=0}Ni.prototype.add=function(a,l,d,m,R){const S=a.toString();a=this.g[S],a||(a=this.g[S]=[],this.h++);const L=wa(a,l,m,R);return L>-1?(l=a[L],d||(l.fa=!1)):(l=new vg(l,this.src,S,!!m,R),l.fa=d,a.push(l)),l};function Ta(a,l){const d=l.type;if(d in a.g){var m=a.g[d],R=Array.prototype.indexOf.call(m,l,void 0),S;(S=R>=0)&&Array.prototype.splice.call(m,R,1),S&&(xi(l),a.g[d].length==0&&(delete a.g[d],a.h--))}}function wa(a,l,d,m){for(let R=0;R<a.length;++R){const S=a[R];if(!S.da&&S.listener==l&&S.capture==!!d&&S.ha==m)return R}return-1}var va="closure_lm_"+(Math.random()*1e6|0),Aa={};function rl(a,l,d,m,R){if(Array.isArray(l)){for(let S=0;S<l.length;S++)rl(a,l[S],d,m,R);return null}return d=ol(d),a&&a[vn]?a.J(l,d,u(m)?!!m.capture:!1,R):Rg(a,l,d,!1,m,R)}function Rg(a,l,d,m,R,S){if(!l)throw Error("Invalid event type");const L=u(R)?!!R.capture:!!R;let Y=Pa(a);if(Y||(a[va]=Y=new Ni(a)),d=Y.add(l,d,m,L,S),d.proxy)return d;if(m=Pg(),d.proxy=m,m.src=a,m.listener=d,a.addEventListener)b||(R=L),R===void 0&&(R=!1),a.addEventListener(l.toString(),m,R);else if(a.attachEvent)a.attachEvent(il(l.toString()),m);else if(a.addListener&&a.removeListener)a.addListener(m);else throw Error("addEventListener and attachEvent are unavailable.");return d}function Pg(){function a(d){return l.call(a.src,a.listener,d)}const l=bg;return a}function sl(a,l,d,m,R){if(Array.isArray(l))for(var S=0;S<l.length;S++)sl(a,l[S],d,m,R);else m=u(m)?!!m.capture:!!m,d=ol(d),a&&a[vn]?(a=a.i,S=String(l).toString(),S in a.g&&(l=a.g[S],d=wa(l,d,m,R),d>-1&&(xi(l[d]),Array.prototype.splice.call(l,d,1),l.length==0&&(delete a.g[S],a.h--)))):a&&(a=Pa(a))&&(l=a.g[l.toString()],a=-1,l&&(a=wa(l,d,m,R)),(d=a>-1?l[a]:null)&&Ra(d))}function Ra(a){if(typeof a!="number"&&a&&!a.da){var l=a.src;if(l&&l[vn])Ta(l.i,a);else{var d=a.type,m=a.proxy;l.removeEventListener?l.removeEventListener(d,m,a.capture):l.detachEvent?l.detachEvent(il(d),m):l.addListener&&l.removeListener&&l.removeListener(m),(d=Pa(l))?(Ta(d,a),d.h==0&&(d.src=null,l[va]=null)):xi(a)}}}function il(a){return a in Aa?Aa[a]:Aa[a]="on"+a}function bg(a,l){if(a.da)a=!0;else{l=new je(l,this);const d=a.listener,m=a.ha||a.src;a.fa&&Ra(a),a=d.call(m,l)}return a}function Pa(a){return a=a[va],a instanceof Ni?a:null}var ba="__closure_events_fn_"+(Math.random()*1e9>>>0);function ol(a){return typeof a=="function"?a:(a[ba]||(a[ba]=function(l){return a.handleEvent(l)}),a[ba])}function xe(){v.call(this),this.i=new Ni(this),this.M=this,this.G=null}p(xe,v),xe.prototype[vn]=!0,xe.prototype.removeEventListener=function(a,l,d,m){sl(this,a,l,d,m)};function Me(a,l){var d,m=a.G;if(m)for(d=[];m;m=m.G)d.push(m);if(a=a.M,m=l.type||l,typeof l=="string")l=new w(l,a);else if(l instanceof w)l.target=l.target||a;else{var R=l;l=new w(m,a),nl(l,R)}R=!0;let S,L;if(d)for(L=d.length-1;L>=0;L--)S=l.g=d[L],R=ki(S,m,!0,l)&&R;if(S=l.g=a,R=ki(S,m,!0,l)&&R,R=ki(S,m,!1,l)&&R,d)for(L=0;L<d.length;L++)S=l.g=d[L],R=ki(S,m,!1,l)&&R}xe.prototype.N=function(){if(xe.Z.N.call(this),this.i){var a=this.i;for(const l in a.g){const d=a.g[l];for(let m=0;m<d.length;m++)xi(d[m]);delete a.g[l],a.h--}}this.G=null},xe.prototype.J=function(a,l,d,m){return this.i.add(String(a),l,!1,d,m)},xe.prototype.K=function(a,l,d,m){return this.i.add(String(a),l,!0,d,m)};function ki(a,l,d,m){if(l=a.i.g[String(l)],!l)return!0;l=l.concat();let R=!0;for(let S=0;S<l.length;++S){const L=l[S];if(L&&!L.da&&L.capture==d){const Y=L.listener,Ee=L.ha||L.src;L.fa&&Ta(a.i,L),R=Y.call(Ee,m)!==!1&&R}}return R&&!m.defaultPrevented}function Sg(a,l){if(typeof a!="function")if(a&&typeof a.handleEvent=="function")a=h(a.handleEvent,a);else throw Error("Invalid listener argument");return Number(l)>2147483647?-1:o.setTimeout(a,l||0)}function al(a){a.g=Sg(()=>{a.g=null,a.i&&(a.i=!1,al(a))},a.l);const l=a.h;a.h=null,a.m.apply(null,l)}class Vg extends v{constructor(l,d){super(),this.m=l,this.l=d,this.h=null,this.i=!1,this.g=null}j(l){this.h=arguments,this.g?this.i=!0:al(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Zr(a){v.call(this),this.h=a,this.g={}}p(Zr,v);var ul=[];function cl(a){Di(a.g,function(l,d){this.g.hasOwnProperty(d)&&Ra(l)},a),a.g={}}Zr.prototype.N=function(){Zr.Z.N.call(this),cl(this)},Zr.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Sa=o.JSON.stringify,Cg=o.JSON.parse,xg=class{stringify(a){return o.JSON.stringify(a,void 0)}parse(a){return o.JSON.parse(a,void 0)}};function ll(){}function hl(){}var es={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function Va(){w.call(this,"d")}p(Va,w);function Ca(){w.call(this,"c")}p(Ca,w);var An={},dl=null;function Oi(){return dl=dl||new xe}An.Ia="serverreachability";function fl(a){w.call(this,An.Ia,a)}p(fl,w);function ts(a){const l=Oi();Me(l,new fl(l))}An.STAT_EVENT="statevent";function pl(a,l){w.call(this,An.STAT_EVENT,a),this.stat=l}p(pl,w);function Ue(a){const l=Oi();Me(l,new pl(l,a))}An.Ja="timingevent";function ml(a,l){w.call(this,An.Ja,a),this.size=l}p(ml,w);function ns(a,l){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){a()},l)}function rs(){this.g=!0}rs.prototype.ua=function(){this.g=!1};function Dg(a,l,d,m,R,S){a.info(function(){if(a.g)if(S){var L="",Y=S.split("&");for(let oe=0;oe<Y.length;oe++){var Ee=Y[oe].split("=");if(Ee.length>1){const Ae=Ee[0];Ee=Ee[1];const ft=Ae.split("_");L=ft.length>=2&&ft[1]=="type"?L+(Ae+"="+Ee+"&"):L+(Ae+"=redacted&")}}}else L=null;else L=S;return"XMLHTTP REQ ("+m+") [attempt "+R+"]: "+l+`
`+d+`
`+L})}function Ng(a,l,d,m,R,S,L){a.info(function(){return"XMLHTTP RESP ("+m+") [ attempt "+R+"]: "+l+`
`+d+`
`+S+" "+L})}function ir(a,l,d,m){a.info(function(){return"XMLHTTP TEXT ("+l+"): "+Og(a,d)+(m?" "+m:"")})}function kg(a,l){a.info(function(){return"TIMEOUT: "+l})}rs.prototype.info=function(){};function Og(a,l){if(!a.g)return l;if(!l)return null;try{const S=JSON.parse(l);if(S){for(a=0;a<S.length;a++)if(Array.isArray(S[a])){var d=S[a];if(!(d.length<2)){var m=d[1];if(Array.isArray(m)&&!(m.length<1)){var R=m[0];if(R!="noop"&&R!="stop"&&R!="close")for(let L=1;L<m.length;L++)m[L]=""}}}}return Sa(S)}catch{return l}}var Li={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},gl={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},_l;function xa(){}p(xa,ll),xa.prototype.g=function(){return new XMLHttpRequest},_l=new xa;function ss(a){return encodeURIComponent(String(a))}function Lg(a){var l=1;a=a.split(":");const d=[];for(;l>0&&a.length;)d.push(a.shift()),l--;return a.length&&d.push(a.join(":")),d}function Ft(a,l,d,m){this.j=a,this.i=l,this.l=d,this.S=m||1,this.V=new Zr(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new yl}function yl(){this.i=null,this.g="",this.h=!1}var Il={},Da={};function Na(a,l,d){a.M=1,a.A=Ui(dt(l)),a.u=d,a.R=!0,El(a,null)}function El(a,l){a.F=Date.now(),Mi(a),a.B=dt(a.A);var d=a.B,m=a.S;Array.isArray(m)||(m=[String(m)]),Nl(d.i,"t",m),a.C=0,d=a.j.L,a.h=new yl,a.g=Jl(a.j,d?l:null,!a.u),a.P>0&&(a.O=new Vg(h(a.Y,a,a.g),a.P)),l=a.V,d=a.g,m=a.ba;var R="readystatechange";Array.isArray(R)||(R&&(ul[0]=R.toString()),R=ul);for(let S=0;S<R.length;S++){const L=rl(d,R[S],m||l.handleEvent,!1,l.h||l);if(!L)break;l.g[L.key]=L}l=a.J?el(a.J):{},a.u?(a.v||(a.v="POST"),l["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.B,a.v,a.u,l)):(a.v="GET",a.g.ea(a.B,a.v,null,l)),ts(),Dg(a.i,a.v,a.B,a.l,a.S,a.u)}Ft.prototype.ba=function(a){a=a.target;const l=this.O;l&&$t(a)==3?l.j():this.Y(a)},Ft.prototype.Y=function(a){try{if(a==this.g)e:{const Y=$t(this.g),Ee=this.g.ya(),oe=this.g.ca();if(!(Y<3)&&(Y!=3||this.g&&(this.h.h||this.g.la()||Bl(this.g)))){this.K||Y!=4||Ee==7||(Ee==8||oe<=0?ts(3):ts(2)),ka(this);var l=this.g.ca();this.X=l;var d=Mg(this);if(this.o=l==200,Ng(this.i,this.v,this.B,this.l,this.S,Y,l),this.o){if(this.U&&!this.L){t:{if(this.g){var m,R=this.g;if((m=R.g?R.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!y(m)){var S=m;break t}}S=null}if(a=S)ir(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Oa(this,a);else{this.o=!1,this.m=3,Ue(12),Rn(this),is(this);break e}}if(this.R){a=!0;let Ae;for(;!this.K&&this.C<d.length;)if(Ae=Ug(this,d),Ae==Da){Y==4&&(this.m=4,Ue(14),a=!1),ir(this.i,this.l,null,"[Incomplete Response]");break}else if(Ae==Il){this.m=4,Ue(15),ir(this.i,this.l,d,"[Invalid Chunk]"),a=!1;break}else ir(this.i,this.l,Ae,null),Oa(this,Ae);if(Tl(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Y!=4||d.length!=0||this.h.h||(this.m=1,Ue(16),a=!1),this.o=this.o&&a,!a)ir(this.i,this.l,d,"[Invalid Chunked Response]"),Rn(this),is(this);else if(d.length>0&&!this.W){this.W=!0;var L=this.j;L.g==this&&L.aa&&!L.P&&(L.j.info("Great, no buffering proxy detected. Bytes received: "+d.length),ja(L),L.P=!0,Ue(11))}}else ir(this.i,this.l,d,null),Oa(this,d);Y==4&&Rn(this),this.o&&!this.K&&(Y==4?Hl(this.j,this):(this.o=!1,Mi(this)))}else Xg(this.g),l==400&&d.indexOf("Unknown SID")>0?(this.m=3,Ue(12)):(this.m=0,Ue(13)),Rn(this),is(this)}}}catch{}finally{}};function Mg(a){if(!Tl(a))return a.g.la();const l=Bl(a.g);if(l==="")return"";let d="";const m=l.length,R=$t(a.g)==4;if(!a.h.i){if(typeof TextDecoder>"u")return Rn(a),is(a),"";a.h.i=new o.TextDecoder}for(let S=0;S<m;S++)a.h.h=!0,d+=a.h.i.decode(l[S],{stream:!(R&&S==m-1)});return l.length=0,a.h.g+=d,a.C=0,a.h.g}function Tl(a){return a.g?a.v=="GET"&&a.M!=2&&a.j.Aa:!1}function Ug(a,l){var d=a.C,m=l.indexOf(`
`,d);return m==-1?Da:(d=Number(l.substring(d,m)),isNaN(d)?Il:(m+=1,m+d>l.length?Da:(l=l.slice(m,m+d),a.C=m+d,l)))}Ft.prototype.cancel=function(){this.K=!0,Rn(this)};function Mi(a){a.T=Date.now()+a.H,wl(a,a.H)}function wl(a,l){if(a.D!=null)throw Error("WatchDog timer not null");a.D=ns(h(a.aa,a),l)}function ka(a){a.D&&(o.clearTimeout(a.D),a.D=null)}Ft.prototype.aa=function(){this.D=null;const a=Date.now();a-this.T>=0?(kg(this.i,this.B),this.M!=2&&(ts(),Ue(17)),Rn(this),this.m=2,is(this)):wl(this,this.T-a)};function is(a){a.j.I==0||a.K||Hl(a.j,a)}function Rn(a){ka(a);var l=a.O;l&&typeof l.dispose=="function"&&l.dispose(),a.O=null,cl(a.V),a.g&&(l=a.g,a.g=null,l.abort(),l.dispose())}function Oa(a,l){try{var d=a.j;if(d.I!=0&&(d.g==a||La(d.h,a))){if(!a.L&&La(d.h,a)&&d.I==3){try{var m=d.Ba.g.parse(l)}catch{m=null}if(Array.isArray(m)&&m.length==3){var R=m;if(R[0]==0){e:if(!d.v){if(d.g)if(d.g.F+3e3<a.F)ji(d),qi(d);else break e;$a(d),Ue(18)}}else d.xa=R[1],0<d.xa-d.K&&R[2]<37500&&d.F&&d.A==0&&!d.C&&(d.C=ns(h(d.Va,d),6e3));Rl(d.h)<=1&&d.ta&&(d.ta=void 0)}else bn(d,11)}else if((a.L||d.g==a)&&ji(d),!y(l))for(R=d.Ba.g.parse(l),l=0;l<R.length;l++){let oe=R[l];const Ae=oe[0];if(!(Ae<=d.K))if(d.K=Ae,oe=oe[1],d.I==2)if(oe[0]=="c"){d.M=oe[1],d.ba=oe[2];const ft=oe[3];ft!=null&&(d.ka=ft,d.j.info("VER="+d.ka));const Sn=oe[4];Sn!=null&&(d.za=Sn,d.j.info("SVER="+d.za));const jt=oe[5];jt!=null&&typeof jt=="number"&&jt>0&&(m=1.5*jt,d.O=m,d.j.info("backChannelRequestTimeoutMs_="+m)),m=d;const zt=a.g;if(zt){const Ki=zt.g?zt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Ki){var S=m.h;S.g||Ki.indexOf("spdy")==-1&&Ki.indexOf("quic")==-1&&Ki.indexOf("h2")==-1||(S.j=S.l,S.g=new Set,S.h&&(Ma(S,S.h),S.h=null))}if(m.G){const za=zt.g?zt.g.getResponseHeader("X-HTTP-Session-Id"):null;za&&(m.wa=za,ce(m.J,m.G,za))}}d.I=3,d.l&&d.l.ra(),d.aa&&(d.T=Date.now()-a.F,d.j.info("Handshake RTT: "+d.T+"ms")),m=d;var L=a;if(m.na=Yl(m,m.L?m.ba:null,m.W),L.L){Pl(m.h,L);var Y=L,Ee=m.O;Ee&&(Y.H=Ee),Y.D&&(ka(Y),Mi(Y)),m.g=L}else Kl(m);d.i.length>0&&$i(d)}else oe[0]!="stop"&&oe[0]!="close"||bn(d,7);else d.I==3&&(oe[0]=="stop"||oe[0]=="close"?oe[0]=="stop"?bn(d,7):qa(d):oe[0]!="noop"&&d.l&&d.l.qa(oe),d.A=0)}}ts(4)}catch{}}var Fg=class{constructor(a,l){this.g=a,this.map=l}};function vl(a){this.l=a||10,o.PerformanceNavigationTiming?(a=o.performance.getEntriesByType("navigation"),a=a.length>0&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Al(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function Rl(a){return a.h?1:a.g?a.g.size:0}function La(a,l){return a.h?a.h==l:a.g?a.g.has(l):!1}function Ma(a,l){a.g?a.g.add(l):a.h=l}function Pl(a,l){a.h&&a.h==l?a.h=null:a.g&&a.g.has(l)&&a.g.delete(l)}vl.prototype.cancel=function(){if(this.i=bl(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function bl(a){if(a.h!=null)return a.i.concat(a.h.G);if(a.g!=null&&a.g.size!==0){let l=a.i;for(const d of a.g.values())l=l.concat(d.G);return l}return P(a.i)}var Sl=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Bg(a,l){if(a){a=a.split("&");for(let d=0;d<a.length;d++){const m=a[d].indexOf("=");let R,S=null;m>=0?(R=a[d].substring(0,m),S=a[d].substring(m+1)):R=a[d],l(R,S?decodeURIComponent(S.replace(/\+/g," ")):"")}}}function Bt(a){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let l;a instanceof Bt?(this.l=a.l,os(this,a.j),this.o=a.o,this.g=a.g,as(this,a.u),this.h=a.h,Ua(this,kl(a.i)),this.m=a.m):a&&(l=String(a).match(Sl))?(this.l=!1,os(this,l[1]||"",!0),this.o=us(l[2]||""),this.g=us(l[3]||"",!0),as(this,l[4]),this.h=us(l[5]||"",!0),Ua(this,l[6]||"",!0),this.m=us(l[7]||"")):(this.l=!1,this.i=new ls(null,this.l))}Bt.prototype.toString=function(){const a=[];var l=this.j;l&&a.push(cs(l,Vl,!0),":");var d=this.g;return(d||l=="file")&&(a.push("//"),(l=this.o)&&a.push(cs(l,Vl,!0),"@"),a.push(ss(d).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.u,d!=null&&a.push(":",String(d))),(d=this.h)&&(this.g&&d.charAt(0)!="/"&&a.push("/"),a.push(cs(d,d.charAt(0)=="/"?jg:$g,!0))),(d=this.i.toString())&&a.push("?",d),(d=this.m)&&a.push("#",cs(d,Kg)),a.join("")},Bt.prototype.resolve=function(a){const l=dt(this);let d=!!a.j;d?os(l,a.j):d=!!a.o,d?l.o=a.o:d=!!a.g,d?l.g=a.g:d=a.u!=null;var m=a.h;if(d)as(l,a.u);else if(d=!!a.h){if(m.charAt(0)!="/")if(this.g&&!this.h)m="/"+m;else{var R=l.h.lastIndexOf("/");R!=-1&&(m=l.h.slice(0,R+1)+m)}if(R=m,R==".."||R==".")m="";else if(R.indexOf("./")!=-1||R.indexOf("/.")!=-1){m=R.lastIndexOf("/",0)==0,R=R.split("/");const S=[];for(let L=0;L<R.length;){const Y=R[L++];Y=="."?m&&L==R.length&&S.push(""):Y==".."?((S.length>1||S.length==1&&S[0]!="")&&S.pop(),m&&L==R.length&&S.push("")):(S.push(Y),m=!0)}m=S.join("/")}else m=R}return d?l.h=m:d=a.i.toString()!=="",d?Ua(l,kl(a.i)):d=!!a.m,d&&(l.m=a.m),l};function dt(a){return new Bt(a)}function os(a,l,d){a.j=d?us(l,!0):l,a.j&&(a.j=a.j.replace(/:$/,""))}function as(a,l){if(l){if(l=Number(l),isNaN(l)||l<0)throw Error("Bad port number "+l);a.u=l}else a.u=null}function Ua(a,l,d){l instanceof ls?(a.i=l,Gg(a.i,a.l)):(d||(l=cs(l,zg)),a.i=new ls(l,a.l))}function ce(a,l,d){a.i.set(l,d)}function Ui(a){return ce(a,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),a}function us(a,l){return a?l?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function cs(a,l,d){return typeof a=="string"?(a=encodeURI(a).replace(l,qg),d&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function qg(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var Vl=/[#\/\?@]/g,$g=/[#\?:]/g,jg=/[#\?]/g,zg=/[#\?@]/g,Kg=/#/g;function ls(a,l){this.h=this.g=null,this.i=a||null,this.j=!!l}function Pn(a){a.g||(a.g=new Map,a.h=0,a.i&&Bg(a.i,function(l,d){a.add(decodeURIComponent(l.replace(/\+/g," ")),d)}))}r=ls.prototype,r.add=function(a,l){Pn(this),this.i=null,a=or(this,a);let d=this.g.get(a);return d||this.g.set(a,d=[]),d.push(l),this.h+=1,this};function Cl(a,l){Pn(a),l=or(a,l),a.g.has(l)&&(a.i=null,a.h-=a.g.get(l).length,a.g.delete(l))}function xl(a,l){return Pn(a),l=or(a,l),a.g.has(l)}r.forEach=function(a,l){Pn(this),this.g.forEach(function(d,m){d.forEach(function(R){a.call(l,R,m,this)},this)},this)};function Dl(a,l){Pn(a);let d=[];if(typeof l=="string")xl(a,l)&&(d=d.concat(a.g.get(or(a,l))));else for(a=Array.from(a.g.values()),l=0;l<a.length;l++)d=d.concat(a[l]);return d}r.set=function(a,l){return Pn(this),this.i=null,a=or(this,a),xl(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[l]),this.h+=1,this},r.get=function(a,l){return a?(a=Dl(this,a),a.length>0?String(a[0]):l):l};function Nl(a,l,d){Cl(a,l),d.length>0&&(a.i=null,a.g.set(or(a,l),P(d)),a.h+=d.length)}r.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],l=Array.from(this.g.keys());for(let m=0;m<l.length;m++){var d=l[m];const R=ss(d);d=Dl(this,d);for(let S=0;S<d.length;S++){let L=R;d[S]!==""&&(L+="="+ss(d[S])),a.push(L)}}return this.i=a.join("&")};function kl(a){const l=new ls;return l.i=a.i,a.g&&(l.g=new Map(a.g),l.h=a.h),l}function or(a,l){return l=String(l),a.j&&(l=l.toLowerCase()),l}function Gg(a,l){l&&!a.j&&(Pn(a),a.i=null,a.g.forEach(function(d,m){const R=m.toLowerCase();m!=R&&(Cl(this,m),Nl(this,R,d))},a)),a.j=l}function Hg(a,l){const d=new rs;if(o.Image){const m=new Image;m.onload=f(qt,d,"TestLoadImage: loaded",!0,l,m),m.onerror=f(qt,d,"TestLoadImage: error",!1,l,m),m.onabort=f(qt,d,"TestLoadImage: abort",!1,l,m),m.ontimeout=f(qt,d,"TestLoadImage: timeout",!1,l,m),o.setTimeout(function(){m.ontimeout&&m.ontimeout()},1e4),m.src=a}else l(!1)}function Wg(a,l){const d=new rs,m=new AbortController,R=setTimeout(()=>{m.abort(),qt(d,"TestPingServer: timeout",!1,l)},1e4);fetch(a,{signal:m.signal}).then(S=>{clearTimeout(R),S.ok?qt(d,"TestPingServer: ok",!0,l):qt(d,"TestPingServer: server error",!1,l)}).catch(()=>{clearTimeout(R),qt(d,"TestPingServer: error",!1,l)})}function qt(a,l,d,m,R){try{R&&(R.onload=null,R.onerror=null,R.onabort=null,R.ontimeout=null),m(d)}catch{}}function Qg(){this.g=new xg}function Fa(a){this.i=a.Sb||null,this.h=a.ab||!1}p(Fa,ll),Fa.prototype.g=function(){return new Fi(this.i,this.h)};function Fi(a,l){xe.call(this),this.H=a,this.o=l,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(Fi,xe),r=Fi.prototype,r.open=function(a,l){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=a,this.D=l,this.readyState=1,ds(this)},r.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const l={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};a&&(l.body=a),(this.H||o).fetch(new Request(this.D,l)).then(this.Pa.bind(this),this.ga.bind(this))},r.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,hs(this)),this.readyState=0},r.Pa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,ds(this)),this.g&&(this.readyState=3,ds(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Ol(this)}else a.text().then(this.Oa.bind(this),this.ga.bind(this))};function Ol(a){a.j.read().then(a.Ma.bind(a)).catch(a.ga.bind(a))}r.Ma=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var l=a.value?a.value:new Uint8Array(0);(l=this.B.decode(l,{stream:!a.done}))&&(this.response=this.responseText+=l)}a.done?hs(this):ds(this),this.readyState==3&&Ol(this)}},r.Oa=function(a){this.g&&(this.response=this.responseText=a,hs(this))},r.Na=function(a){this.g&&(this.response=a,hs(this))},r.ga=function(){this.g&&hs(this)};function hs(a){a.readyState=4,a.l=null,a.j=null,a.B=null,ds(a)}r.setRequestHeader=function(a,l){this.A.append(a,l)},r.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},r.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],l=this.h.entries();for(var d=l.next();!d.done;)d=d.value,a.push(d[0]+": "+d[1]),d=l.next();return a.join(`\r
`)};function ds(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(Fi.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function Ll(a){let l="";return Di(a,function(d,m){l+=m,l+=":",l+=d,l+=`\r
`}),l}function Ba(a,l,d){e:{for(m in d){var m=!1;break e}m=!0}m||(d=Ll(d),typeof a=="string"?d!=null&&ss(d):ce(a,l,d))}function fe(a){xe.call(this),this.headers=new Map,this.L=a||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(fe,xe);var Yg=/^https?$/i,Jg=["POST","PUT"];r=fe.prototype,r.Fa=function(a){this.H=a},r.ea=function(a,l,d,m){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);l=l?l.toUpperCase():"GET",this.D=a,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():_l.g(),this.g.onreadystatechange=_(h(this.Ca,this));try{this.B=!0,this.g.open(l,String(a),!0),this.B=!1}catch(S){Ml(this,S);return}if(a=d||"",d=new Map(this.headers),m)if(Object.getPrototypeOf(m)===Object.prototype)for(var R in m)d.set(R,m[R]);else if(typeof m.keys=="function"&&typeof m.get=="function")for(const S of m.keys())d.set(S,m.get(S));else throw Error("Unknown input type for opt_headers: "+String(m));m=Array.from(d.keys()).find(S=>S.toLowerCase()=="content-type"),R=o.FormData&&a instanceof o.FormData,!(Array.prototype.indexOf.call(Jg,l,void 0)>=0)||m||R||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[S,L]of d)this.g.setRequestHeader(S,L);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(a),this.v=!1}catch(S){Ml(this,S)}};function Ml(a,l){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=l,a.o=5,Ul(a),Bi(a)}function Ul(a){a.A||(a.A=!0,Me(a,"complete"),Me(a,"error"))}r.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=a||7,Me(this,"complete"),Me(this,"abort"),Bi(this))},r.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Bi(this,!0)),fe.Z.N.call(this)},r.Ca=function(){this.u||(this.B||this.v||this.j?Fl(this):this.Xa())},r.Xa=function(){Fl(this)};function Fl(a){if(a.h&&typeof i<"u"){if(a.v&&$t(a)==4)setTimeout(a.Ca.bind(a),0);else if(Me(a,"readystatechange"),$t(a)==4){a.h=!1;try{const S=a.ca();e:switch(S){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var l=!0;break e;default:l=!1}var d;if(!(d=l)){var m;if(m=S===0){let L=String(a.D).match(Sl)[1]||null;!L&&o.self&&o.self.location&&(L=o.self.location.protocol.slice(0,-1)),m=!Yg.test(L?L.toLowerCase():"")}d=m}if(d)Me(a,"complete"),Me(a,"success");else{a.o=6;try{var R=$t(a)>2?a.g.statusText:""}catch{R=""}a.l=R+" ["+a.ca()+"]",Ul(a)}}finally{Bi(a)}}}}function Bi(a,l){if(a.g){a.m&&(clearTimeout(a.m),a.m=null);const d=a.g;a.g=null,l||Me(a,"ready");try{d.onreadystatechange=null}catch{}}}r.isActive=function(){return!!this.g};function $t(a){return a.g?a.g.readyState:0}r.ca=function(){try{return $t(this)>2?this.g.status:-1}catch{return-1}},r.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},r.La=function(a){if(this.g){var l=this.g.responseText;return a&&l.indexOf(a)==0&&(l=l.substring(a.length)),Cg(l)}};function Bl(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.F){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function Xg(a){const l={};a=(a.g&&$t(a)>=2&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let m=0;m<a.length;m++){if(y(a[m]))continue;var d=Lg(a[m]);const R=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const S=l[R]||[];l[R]=S,S.push(d)}Ag(l,function(m){return m.join(", ")})}r.ya=function(){return this.o},r.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function fs(a,l,d){return d&&d.internalChannelParams&&d.internalChannelParams[a]||l}function ql(a){this.za=0,this.i=[],this.j=new rs,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=fs("failFast",!1,a),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=fs("baseRetryDelayMs",5e3,a),this.Za=fs("retryDelaySeedMs",1e4,a),this.Ta=fs("forwardChannelMaxRetries",2,a),this.va=fs("forwardChannelRequestTimeoutMs",2e4,a),this.ma=a&&a.xmlHttpFactory||void 0,this.Ua=a&&a.Rb||void 0,this.Aa=a&&a.useFetchStreams||!1,this.O=void 0,this.L=a&&a.supportsCrossDomainXhr||!1,this.M="",this.h=new vl(a&&a.concurrentRequestLimit),this.Ba=new Qg,this.S=a&&a.fastHandshake||!1,this.R=a&&a.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=a&&a.Pb||!1,a&&a.ua&&this.j.ua(),a&&a.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&a&&a.detectBufferingProxy||!1,this.ia=void 0,a&&a.longPollingTimeout&&a.longPollingTimeout>0&&(this.ia=a.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}r=ql.prototype,r.ka=8,r.I=1,r.connect=function(a,l,d,m){Ue(0),this.W=a,this.H=l||{},d&&m!==void 0&&(this.H.OSID=d,this.H.OAID=m),this.F=this.X,this.J=Yl(this,null,this.W),$i(this)};function qa(a){if($l(a),a.I==3){var l=a.V++,d=dt(a.J);if(ce(d,"SID",a.M),ce(d,"RID",l),ce(d,"TYPE","terminate"),ps(a,d),l=new Ft(a,a.j,l),l.M=2,l.A=Ui(dt(d)),d=!1,o.navigator&&o.navigator.sendBeacon)try{d=o.navigator.sendBeacon(l.A.toString(),"")}catch{}!d&&o.Image&&(new Image().src=l.A,d=!0),d||(l.g=Jl(l.j,null),l.g.ea(l.A)),l.F=Date.now(),Mi(l)}Ql(a)}function qi(a){a.g&&(ja(a),a.g.cancel(),a.g=null)}function $l(a){qi(a),a.v&&(o.clearTimeout(a.v),a.v=null),ji(a),a.h.cancel(),a.m&&(typeof a.m=="number"&&o.clearTimeout(a.m),a.m=null)}function $i(a){if(!Al(a.h)&&!a.m){a.m=!0;var l=a.Ea;te||g(),ne||(te(),ne=!0),T.add(l,a),a.D=0}}function Zg(a,l){return Rl(a.h)>=a.h.j-(a.m?1:0)?!1:a.m?(a.i=l.G.concat(a.i),!0):a.I==1||a.I==2||a.D>=(a.Sa?0:a.Ta)?!1:(a.m=ns(h(a.Ea,a,l),Wl(a,a.D)),a.D++,!0)}r.Ea=function(a){if(this.m)if(this.m=null,this.I==1){if(!a){this.V=Math.floor(Math.random()*1e5),a=this.V++;const R=new Ft(this,this.j,a);let S=this.o;if(this.U&&(S?(S=el(S),nl(S,this.U)):S=this.U),this.u!==null||this.R||(R.J=S,S=null),this.S)e:{for(var l=0,d=0;d<this.i.length;d++){t:{var m=this.i[d];if("__data__"in m.map&&(m=m.map.__data__,typeof m=="string")){m=m.length;break t}m=void 0}if(m===void 0)break;if(l+=m,l>4096){l=d;break e}if(l===4096||d===this.i.length-1){l=d+1;break e}}l=1e3}else l=1e3;l=zl(this,R,l),d=dt(this.J),ce(d,"RID",a),ce(d,"CVER",22),this.G&&ce(d,"X-HTTP-Session-Id",this.G),ps(this,d),S&&(this.R?l="headers="+ss(Ll(S))+"&"+l:this.u&&Ba(d,this.u,S)),Ma(this.h,R),this.Ra&&ce(d,"TYPE","init"),this.S?(ce(d,"$req",l),ce(d,"SID","null"),R.U=!0,Na(R,d,null)):Na(R,d,l),this.I=2}}else this.I==3&&(a?jl(this,a):this.i.length==0||Al(this.h)||jl(this))};function jl(a,l){var d;l?d=l.l:d=a.V++;const m=dt(a.J);ce(m,"SID",a.M),ce(m,"RID",d),ce(m,"AID",a.K),ps(a,m),a.u&&a.o&&Ba(m,a.u,a.o),d=new Ft(a,a.j,d,a.D+1),a.u===null&&(d.J=a.o),l&&(a.i=l.G.concat(a.i)),l=zl(a,d,1e3),d.H=Math.round(a.va*.5)+Math.round(a.va*.5*Math.random()),Ma(a.h,d),Na(d,m,l)}function ps(a,l){a.H&&Di(a.H,function(d,m){ce(l,m,d)}),a.l&&Di({},function(d,m){ce(l,m,d)})}function zl(a,l,d){d=Math.min(a.i.length,d);const m=a.l?h(a.l.Ka,a.l,a):null;e:{var R=a.i;let Y=-1;for(;;){const Ee=["count="+d];Y==-1?d>0?(Y=R[0].g,Ee.push("ofs="+Y)):Y=0:Ee.push("ofs="+Y);let oe=!0;for(let Ae=0;Ae<d;Ae++){var S=R[Ae].g;const ft=R[Ae].map;if(S-=Y,S<0)Y=Math.max(0,R[Ae].g-100),oe=!1;else try{S="req"+S+"_"||"";try{var L=ft instanceof Map?ft:Object.entries(ft);for(const[Sn,jt]of L){let zt=jt;u(jt)&&(zt=Sa(jt)),Ee.push(S+Sn+"="+encodeURIComponent(zt))}}catch(Sn){throw Ee.push(S+"type="+encodeURIComponent("_badmap")),Sn}}catch{m&&m(ft)}}if(oe){L=Ee.join("&");break e}}L=void 0}return a=a.i.splice(0,d),l.G=a,L}function Kl(a){if(!a.g&&!a.v){a.Y=1;var l=a.Da;te||g(),ne||(te(),ne=!0),T.add(l,a),a.A=0}}function $a(a){return a.g||a.v||a.A>=3?!1:(a.Y++,a.v=ns(h(a.Da,a),Wl(a,a.A)),a.A++,!0)}r.Da=function(){if(this.v=null,Gl(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var a=4*this.T;this.j.info("BP detection timer enabled: "+a),this.B=ns(h(this.Wa,this),a)}},r.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,Ue(10),qi(this),Gl(this))};function ja(a){a.B!=null&&(o.clearTimeout(a.B),a.B=null)}function Gl(a){a.g=new Ft(a,a.j,"rpc",a.Y),a.u===null&&(a.g.J=a.o),a.g.P=0;var l=dt(a.na);ce(l,"RID","rpc"),ce(l,"SID",a.M),ce(l,"AID",a.K),ce(l,"CI",a.F?"0":"1"),!a.F&&a.ia&&ce(l,"TO",a.ia),ce(l,"TYPE","xmlhttp"),ps(a,l),a.u&&a.o&&Ba(l,a.u,a.o),a.O&&(a.g.H=a.O);var d=a.g;a=a.ba,d.M=1,d.A=Ui(dt(l)),d.u=null,d.R=!0,El(d,a)}r.Va=function(){this.C!=null&&(this.C=null,qi(this),$a(this),Ue(19))};function ji(a){a.C!=null&&(o.clearTimeout(a.C),a.C=null)}function Hl(a,l){var d=null;if(a.g==l){ji(a),ja(a),a.g=null;var m=2}else if(La(a.h,l))d=l.G,Pl(a.h,l),m=1;else return;if(a.I!=0){if(l.o)if(m==1){d=l.u?l.u.length:0,l=Date.now()-l.F;var R=a.D;m=Oi(),Me(m,new ml(m,d)),$i(a)}else Kl(a);else if(R=l.m,R==3||R==0&&l.X>0||!(m==1&&Zg(a,l)||m==2&&$a(a)))switch(d&&d.length>0&&(l=a.h,l.i=l.i.concat(d)),R){case 1:bn(a,5);break;case 4:bn(a,10);break;case 3:bn(a,6);break;default:bn(a,2)}}}function Wl(a,l){let d=a.Qa+Math.floor(Math.random()*a.Za);return a.isActive()||(d*=2),d*l}function bn(a,l){if(a.j.info("Error code "+l),l==2){var d=h(a.bb,a),m=a.Ua;const R=!m;m=new Bt(m||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||os(m,"https"),Ui(m),R?Hg(m.toString(),d):Wg(m.toString(),d)}else Ue(2);a.I=0,a.l&&a.l.pa(l),Ql(a),$l(a)}r.bb=function(a){a?(this.j.info("Successfully pinged google.com"),Ue(2)):(this.j.info("Failed to ping google.com"),Ue(1))};function Ql(a){if(a.I=0,a.ja=[],a.l){const l=bl(a.h);(l.length!=0||a.i.length!=0)&&(V(a.ja,l),V(a.ja,a.i),a.h.i.length=0,P(a.i),a.i.length=0),a.l.oa()}}function Yl(a,l,d){var m=d instanceof Bt?dt(d):new Bt(d);if(m.g!="")l&&(m.g=l+"."+m.g),as(m,m.u);else{var R=o.location;m=R.protocol,l=l?l+"."+R.hostname:R.hostname,R=+R.port;const S=new Bt(null);m&&os(S,m),l&&(S.g=l),R&&as(S,R),d&&(S.h=d),m=S}return d=a.G,l=a.wa,d&&l&&ce(m,d,l),ce(m,"VER",a.ka),ps(a,m),m}function Jl(a,l,d){if(l&&!a.L)throw Error("Can't create secondary domain capable XhrIo object.");return l=a.Aa&&!a.ma?new fe(new Fa({ab:d})):new fe(a.ma),l.Fa(a.L),l}r.isActive=function(){return!!this.l&&this.l.isActive(this)};function Xl(){}r=Xl.prototype,r.ra=function(){},r.qa=function(){},r.pa=function(){},r.oa=function(){},r.isActive=function(){return!0},r.Ka=function(){};function zi(){}zi.prototype.g=function(a,l){return new We(a,l)};function We(a,l){xe.call(this),this.g=new ql(l),this.l=a,this.h=l&&l.messageUrlParams||null,a=l&&l.messageHeaders||null,l&&l.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=l&&l.initMessageHeaders||null,l&&l.messageContentType&&(a?a["X-WebChannel-Content-Type"]=l.messageContentType:a={"X-WebChannel-Content-Type":l.messageContentType}),l&&l.sa&&(a?a["X-WebChannel-Client-Profile"]=l.sa:a={"X-WebChannel-Client-Profile":l.sa}),this.g.U=a,(a=l&&l.Qb)&&!y(a)&&(this.g.u=a),this.A=l&&l.supportsCrossDomainXhr||!1,this.v=l&&l.sendRawJson||!1,(l=l&&l.httpSessionIdParam)&&!y(l)&&(this.g.G=l,a=this.h,a!==null&&l in a&&(a=this.h,l in a&&delete a[l])),this.j=new ar(this)}p(We,xe),We.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},We.prototype.close=function(){qa(this.g)},We.prototype.o=function(a){var l=this.g;if(typeof a=="string"){var d={};d.__data__=a,a=d}else this.v&&(d={},d.__data__=Sa(a),a=d);l.i.push(new Fg(l.Ya++,a)),l.I==3&&$i(l)},We.prototype.N=function(){this.g.l=null,delete this.j,qa(this.g),delete this.g,We.Z.N.call(this)};function Zl(a){Va.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var l=a.__sm__;if(l){e:{for(const d in l){a=d;break e}a=void 0}(this.i=a)&&(a=this.i,l=l!==null&&a in l?l[a]:void 0),this.data=l}else this.data=a}p(Zl,Va);function eh(){Ca.call(this),this.status=1}p(eh,Ca);function ar(a){this.g=a}p(ar,Xl),ar.prototype.ra=function(){Me(this.g,"a")},ar.prototype.qa=function(a){Me(this.g,new Zl(a))},ar.prototype.pa=function(a){Me(this.g,new eh)},ar.prototype.oa=function(){Me(this.g,"b")},zi.prototype.createWebChannel=zi.prototype.g,We.prototype.send=We.prototype.o,We.prototype.open=We.prototype.m,We.prototype.close=We.prototype.close,Jf=function(){return new zi},Yf=function(){return Oi()},Qf=An,cu={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Li.NO_ERROR=0,Li.TIMEOUT=8,Li.HTTP_ERROR=6,oo=Li,gl.COMPLETE="complete",Wf=gl,hl.EventType=es,es.OPEN="a",es.CLOSE="b",es.ERROR="c",es.MESSAGE="d",xe.prototype.listen=xe.prototype.J,vs=hl,fe.prototype.listenOnce=fe.prototype.K,fe.prototype.getLastError=fe.prototype.Ha,fe.prototype.getLastErrorCode=fe.prototype.ya,fe.prototype.getStatus=fe.prototype.ca,fe.prototype.getResponseJson=fe.prototype.La,fe.prototype.getResponseText=fe.prototype.la,fe.prototype.send=fe.prototype.ea,fe.prototype.setWithCredentials=fe.prototype.Fa,Hf=fe}).apply(typeof Hi<"u"?Hi:typeof self<"u"?self:typeof window<"u"?window:{});/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class be{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}be.UNAUTHENTICATED=new be(null),be.GOOGLE_CREDENTIALS=new be("google-credentials-uid"),be.FIRST_PARTY=new be("first-party-uid"),be.MOCK_USER=new be("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Hr="12.15.0";function DE(r){Hr=r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hn=new Bu("@firebase/firestore");function mr(){return Hn.logLevel}function D(r,...e){if(Hn.logLevel<=J.DEBUG){const t=e.map(Yu);Hn.debug(`Firestore (${Hr}): ${r}`,...t)}}function Be(r,...e){if(Hn.logLevel<=J.ERROR){const t=e.map(Yu);Hn.error(`Firestore (${Hr}): ${r}`,...t)}}function at(r,...e){if(Hn.logLevel<=J.WARN){const t=e.map(Yu);Hn.warn(`Firestore (${Hr}): ${r}`,...t)}}function Yu(r){if(typeof r=="string")return r;try{return(function(t){return JSON.stringify(t)})(r)}catch{return r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function B(r,e,t){let n="Unexpected state";typeof e=="string"?n=e:t=e,Xf(r,n,t)}function Xf(r,e,t){let n=`FIRESTORE (${Hr}) INTERNAL ASSERTION FAILED: ${e} (ID: ${r.toString(16)})`;if(t!==void 0)try{n+=" CONTEXT: "+JSON.stringify(t)}catch{n+=" CONTEXT: "+t}throw Be(n),new Error(n)}function N(r,e,t,n){let s="Unexpected state";typeof t=="string"?s=t:n=t,r||Xf(e,s,n)}function W(r,e){return r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const x={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class U extends Rt{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vt{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zf{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class NE{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(be.UNAUTHENTICATED)))}shutdown(){}}class kE{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class OE{constructor(e){this.t=e,this.currentUser=be.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){N(this.o===void 0,42304);let n=this.i;const s=c=>this.i!==n?(n=this.i,t(c)):Promise.resolve();let i=new Vt;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Vt,e.enqueueRetryable((()=>s(this.currentUser)))};const o=()=>{const c=i;e.enqueueRetryable((async()=>{await c.promise,await s(this.currentUser)}))},u=c=>{D("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit((c=>u(c))),setTimeout((()=>{if(!this.auth){const c=this.t.getImmediate({optional:!0});c?u(c):(D("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Vt)}}),0),o()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((n=>this.i!==e?(D("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(N(typeof n.accessToken=="string",31837,{l:n}),new Zf(n.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return N(e===null||typeof e=="string",2055,{h:e}),new be(e)}}class LE{constructor(e,t,n){this.T=e,this.P=t,this.R=n,this.type="FirstParty",this.user=be.FIRST_PARTY,this.I=new Map}A(){return this.R?this.R():null}get headers(){this.I.set("X-Goog-AuthUser",this.T);const e=this.A();return e&&this.I.set("Authorization",e),this.P&&this.I.set("X-Goog-Iam-Authorization-Token",this.P),this.I}}class ME{constructor(e,t,n){this.T=e,this.P=t,this.R=n}getToken(){return Promise.resolve(new LE(this.T,this.P,this.R))}start(e,t){e.enqueueRetryable((()=>t(be.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class Vh{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class UE{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Je(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){N(this.o===void 0,3512);const n=i=>{i.error!=null&&D("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.m;return this.m=i.token,D("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable((()=>n(i)))};const s=i=>{D("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit((i=>s(i))),setTimeout((()=>{if(!this.appCheck){const i=this.V.getImmediate({optional:!0});i?s(i):D("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.p)return Promise.resolve(new Vh(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(N(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new Vh(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function FE(r){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(r);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let n=0;n<r;n++)t[n]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ju{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let n="";for(;n.length<20;){const s=FE(40);for(let i=0;i<s.length;++i)n.length<20&&s[i]<t&&(n+=e.charAt(s[i]%62))}return n}}function G(r,e){return r<e?-1:r>e?1:0}function lu(r,e){const t=Math.min(r.length,e.length);for(let n=0;n<t;n++){const s=r.charAt(n),i=e.charAt(n);if(s!==i)return Qa(s)===Qa(i)?G(s,i):Qa(s)?1:-1}return G(r.length,e.length)}const BE=55296,qE=57343;function Qa(r){const e=r.charCodeAt(0);return e>=BE&&e<=qE}function Pr(r,e,t){return r.length===e.length&&r.every(((n,s)=>t(n,e[s])))}function ep(r){return r+"\0"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const br="__name__";class pt{constructor(e,t,n){t===void 0?t=0:t>e.length&&B(637,{offset:t,range:e.length}),n===void 0?n=e.length-t:n>e.length-t&&B(1746,{length:n,range:e.length-t}),this.segments=e,this.offset=t,this.len=n}get length(){return this.len}isEqual(e){return pt.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof pt?e.forEach((n=>{t.push(n)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,n=this.limit();t<n;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const n=Math.min(e.length,t.length);for(let s=0;s<n;s++){const i=pt.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return G(e.length,t.length)}static compareSegments(e,t){const n=pt.isNumericId(e),s=pt.isNumericId(t);return n&&!s?-1:!n&&s?1:n&&s?pt.extractNumericId(e).compare(pt.extractNumericId(t)):lu(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return on.fromString(e.substring(4,e.length-2))}}class ee extends pt{construct(e,t,n){return new ee(e,t,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const n of e){if(n.indexOf("//")>=0)throw new U(x.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);t.push(...n.split("/").filter((s=>s.length>0)))}return new ee(t)}static emptyPath(){return new ee([])}}const $E=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class le extends pt{construct(e,t,n){return new le(e,t,n)}static isValidIdentifier(e){return $E.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),le.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===br}static keyField(){return new le([br])}static fromServerFormat(e){const t=[];let n="",s=0;const i=()=>{if(n.length===0)throw new U(x.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(n),n=""};let o=!1;for(;s<e.length;){const u=e[s];if(u==="\\"){if(s+1===e.length)throw new U(x.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[s+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new U(x.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);n+=c,s+=2}else u==="`"?(o=!o,s++):u!=="."||o?(n+=u,s++):(i(),s++)}if(i(),o)throw new U(x.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new le(t)}static emptyPath(){return new le([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class F{constructor(e){this.path=e}static fromPath(e){return new F(ee.fromString(e))}static fromName(e){return new F(ee.fromString(e).popFirst(5))}static empty(){return new F(ee.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ee.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return ee.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new F(new ee(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jE(r,e,t){if(!t)throw new U(x.INVALID_ARGUMENT,`Function ${r}() cannot be called with an empty ${e}.`)}function zE(r,e,t,n){if(e===!0&&n===!0)throw new U(x.INVALID_ARGUMENT,`${r} and ${t} cannot be used together.`)}function Ch(r){if(!F.isDocumentKey(r))throw new U(x.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${r} has ${r.length}.`)}function gi(r){return typeof r=="object"&&r!==null&&(Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null)}function Xu(r){if(r===void 0)return"undefined";if(r===null)return"null";if(typeof r=="string")return r.length>20&&(r=`${r.substring(0,20)}...`),JSON.stringify(r);if(typeof r=="number"||typeof r=="boolean")return""+r;if(typeof r=="object"){if(r instanceof Array)return"an array";{const e=(function(n){return n.constructor?n.constructor.name:null})(r);return e?`a custom ${e} object`:"an object"}}return typeof r=="function"?"a function":B(12329,{type:typeof r})}function Ct(r,e){if("_delegate"in r&&(r=r._delegate),!(r instanceof e)){if(e.name===r.constructor.name)throw new U(x.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Xu(r);throw new U(x.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return r}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _e(r,e){const t={typeString:r};return e&&(t.value=e),t}function _i(r,e){if(!gi(r))throw new U(x.INVALID_ARGUMENT,"JSON must be an object");let t;for(const n in e)if(e[n]){const s=e[n].typeString,i="value"in e[n]?{value:e[n].value}:void 0;if(!(n in r)){t=`JSON missing required field: '${n}'`;break}const o=r[n];if(s&&typeof o!==s){t=`JSON field '${n}' must be a ${s}.`;break}if(i!==void 0&&o!==i.value){t=`Expected '${n}' field to equal '${i.value}'`;break}}if(t)throw new U(x.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xh=-62135596800,Dh=1e6;class se{static now(){return se.fromMillis(Date.now())}static fromDate(e){return se.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),n=Math.floor((e-1e3*t)*Dh);return new se(t,n)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new U(x.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new U(x.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<xh)throw new U(x.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new U(x.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Dh}_compareTo(e){return this.seconds===e.seconds?G(this.nanoseconds,e.nanoseconds):G(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:se._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(_i(e,se._jsonSchema))return new se(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-xh;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}se._jsonSchemaVersion="firestore/timestamp/1.0",se._jsonSchema={type:_e("string",se._jsonSchemaVersion),seconds:_e("number"),nanoseconds:_e("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class q{static fromTimestamp(e){return new q(e)}static min(){return new q(new se(0,0))}static max(){return new q(new se(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const js=-1;class Ro{constructor(e,t,n,s){this.indexId=e,this.collectionGroup=t,this.fields=n,this.indexState=s}}function hu(r){return r.fields.find((e=>e.kind===2))}function Cn(r){return r.fields.filter((e=>e.kind!==2))}Ro.UNKNOWN_ID=-1;class ao{constructor(e,t){this.fieldPath=e,this.kind=t}}class zs{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new zs(0,et.min())}}function KE(r,e){const t=r.toTimestamp().seconds,n=r.toTimestamp().nanoseconds+1,s=q.fromTimestamp(n===1e9?new se(t+1,0):new se(t,n));return new et(s,F.empty(),e)}function tp(r){return new et(r.readTime,r.key,js)}class et{constructor(e,t,n){this.readTime=e,this.documentKey=t,this.largestBatchId=n}static min(){return new et(q.min(),F.empty(),js)}static max(){return new et(q.max(),F.empty(),js)}}function Zu(r,e){let t=r.readTime.compareTo(e.readTime);return t!==0?t:(t=F.comparator(r.documentKey,e.documentKey),t!==0?t:G(r.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const np="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class rp{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function er(r){if(r.code!==x.FAILED_PRECONDITION||r.message!==np)throw r;D("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class A{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&B(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new A(((n,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(n,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(n,s)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof A?t:A.resolve(t)}catch(t){return A.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):A.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):A.reject(t)}static resolve(e){return new A(((t,n)=>{t(e)}))}static reject(e){return new A(((t,n)=>{n(e)}))}static waitFor(e){return new A(((t,n)=>{let s=0,i=0,o=!1;e.forEach((u=>{++s,u.next((()=>{++i,o&&i===s&&t()}),(c=>n(c)))})),o=!0,i===s&&t()}))}static or(e){let t=A.resolve(!1);for(const n of e)t=t.next((s=>s?A.resolve(s):n()));return t}static forEach(e,t){const n=[];return e.forEach(((s,i)=>{n.push(t.call(this,s,i))})),this.waitFor(n)}static mapArray(e,t){return new A(((n,s)=>{const i=e.length,o=new Array(i);let u=0;for(let c=0;c<i;c++){const h=c;t(e[h]).next((f=>{o[h]=f,++u,u===i&&n(o)}),(f=>s(f)))}}))}static doWhile(e,t){return new A(((n,s)=>{const i=()=>{e()===!0?t().next((()=>{i()}),s):n()};i()}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ye="SimpleDb";class Yo{static open(e,t,n,s){try{return new Yo(t,e.transaction(s,n))}catch(i){throw new Vs(t,i)}}constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.v=new Vt,this.transaction.oncomplete=()=>{this.v.resolve()},this.transaction.onabort=()=>{t.error?this.v.reject(new Vs(e,t.error)):this.v.resolve()},this.transaction.onerror=n=>{const s=ec(n.target.error);this.v.reject(new Vs(e,s))}}get S(){return this.v.promise}abort(e){e&&this.v.reject(e),this.aborted||(D(Ye,"Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}D(){const e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){const t=this.transaction.objectStore(e);return new HE(t)}}class an{static delete(e){return D(Ye,"Removing database:",e),Dn(Jd().indexedDB.deleteDatabase(e)).toPromise()}static C(){if(!af())return!1;if(an.F())return!0;const e=we(),t=an.O(e),n=0<t&&t<10,s=sp(e),i=0<s&&s<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||n||i)}static F(){var e;return typeof process<"u"&&((e=process.__PRIVATE_env)==null?void 0:e.__PRIVATE_USE_MOCK_PERSISTENCE)==="YES"}static M(e,t){return e.store(t)}static O(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),n=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(n)}constructor(e,t,n){this.name=e,this.version=t,this.N=n,this.L=null,an.O(we())===12.2&&Be("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}async B(e){return this.db||(D(Ye,"Opening database:",this.name),this.db=await new Promise(((t,n)=>{const s=indexedDB.open(this.name,this.version);s.onsuccess=i=>{const o=i.target.result;t(o)},s.onblocked=()=>{n(new Vs(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},s.onerror=i=>{const o=i.target.error;o.name==="VersionError"?n(new U(x.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):o.name==="InvalidStateError"?n(new U(x.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+o)):n(new Vs(e,o))},s.onupgradeneeded=i=>{D(Ye,'Database "'+this.name+'" requires upgrade from version:',i.oldVersion);const o=i.target.result;this.N.U(o,s.transaction,i.oldVersion,this.version).next((()=>{D(Ye,"Database upgrade to version "+this.version+" complete")}))}}))),this.k&&(this.db.onversionchange=t=>this.k(t)),this.db}q(e){this.k=e,this.db&&(this.db.onversionchange=t=>e(t))}async runTransaction(e,t,n,s){const i=t==="readonly";let o=0;for(;;){++o;try{this.db=await this.B(e);const u=Yo.open(this.db,e,i?"readonly":"readwrite",n),c=s(u).next((h=>(u.D(),h))).catch((h=>(u.abort(h),A.reject(h)))).toPromise();return c.catch((()=>{})),await u.S,c}catch(u){const c=u,h=c.name!=="FirebaseError"&&o<3;if(D(Ye,"Transaction failed with error:",c.message,"Retrying:",h),this.close(),!h)return Promise.reject(c)}}}close(){this.db&&this.db.close(),this.db=void 0}}function sp(r){const e=r.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}class GE{constructor(e){this.$=e,this.K=!1,this.W=null}get isDone(){return this.K}get G(){return this.W}set cursor(e){this.$=e}done(){this.K=!0}j(e){this.W=e}delete(){return Dn(this.$.delete())}}class Vs extends U{constructor(e,t){super(x.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function Tn(r){return r.name==="IndexedDbTransactionError"}class HE{constructor(e){this.store=e}put(e,t){let n;return t!==void 0?(D(Ye,"PUT",this.store.name,e,t),n=this.store.put(t,e)):(D(Ye,"PUT",this.store.name,"<auto-key>",e),n=this.store.put(e)),Dn(n)}add(e){return D(Ye,"ADD",this.store.name,e,e),Dn(this.store.add(e))}get(e){return Dn(this.store.get(e)).next((t=>(t===void 0&&(t=null),D(Ye,"GET",this.store.name,e,t),t)))}delete(e){return D(Ye,"DELETE",this.store.name,e),Dn(this.store.delete(e))}count(){return D(Ye,"COUNT",this.store.name),Dn(this.store.count())}H(e,t){const n=this.options(e,t),s=n.index?this.store.index(n.index):this.store;if(typeof s.getAll=="function"){const i=s.getAll(n.range);return new A(((o,u)=>{i.onerror=c=>{u(c.target.error)},i.onsuccess=c=>{o(c.target.result)}}))}{const i=this.cursor(n),o=[];return this.J(i,((u,c)=>{o.push(c)})).next((()=>o))}}Y(e,t){const n=this.store.getAll(e,t===null?void 0:t);return new A(((s,i)=>{n.onerror=o=>{i(o.target.error)},n.onsuccess=o=>{s(o.target.result)}}))}Z(e,t){D(Ye,"DELETE ALL",this.store.name);const n=this.options(e,t);n.X=!1;const s=this.cursor(n);return this.J(s,((i,o,u)=>u.delete()))}ee(e,t){let n;t?n=e:(n={},t=e);const s=this.cursor(n);return this.J(s,t)}te(e){const t=this.cursor({});return new A(((n,s)=>{t.onerror=i=>{const o=ec(i.target.error);s(o)},t.onsuccess=i=>{const o=i.target.result;o?e(o.primaryKey,o.value).next((u=>{u?o.continue():n()})):n()}}))}J(e,t){const n=[];return new A(((s,i)=>{e.onerror=o=>{i(o.target.error)},e.onsuccess=o=>{const u=o.target.result;if(!u)return void s();const c=new GE(u),h=t(u.primaryKey,u.value,c);if(h instanceof A){const f=h.catch((p=>(c.done(),A.reject(p))));n.push(f)}c.isDone?s():c.G===null?u.continue():u.continue(c.G)}})).next((()=>A.waitFor(n)))}options(e,t){let n;return e!==void 0&&(typeof e=="string"?n=e:t=e),{index:n,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const n=this.store.index(e.index);return e.X?n.openKeyCursor(e.range,t):n.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function Dn(r){return new A(((e,t)=>{r.onsuccess=n=>{const s=n.target.result;e(s)},r.onerror=n=>{const s=ec(n.target.error);t(s)}}))}let Nh=!1;function ec(r){const e=an.O(we());if(e>=12.2&&e<13){const t="An internal error was encountered in the Indexed Database server";if(r.message.indexOf(t)>=0){const n=new U("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return Nh||(Nh=!0,setTimeout((()=>{throw n}),0)),n}}return r}const Cs="IndexBackfiller";class WE{constructor(e,t){this.asyncQueue=e,this.ne=t,this.task=null}start(){this.re(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}re(e){D(Cs,`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,(async()=>{this.task=null;try{const t=await this.ne.ie();D(Cs,`Documents written: ${t}`)}catch(t){Tn(t)?D(Cs,"Ignoring IndexedDB error during index backfill: ",t):await er(t)}await this.re(6e4)}))}}class QE{constructor(e,t){this.localStore=e,this.persistence=t}async ie(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",(t=>this.se(t,e)))}se(e,t){const n=new Set;let s=t,i=!0;return A.doWhile((()=>i===!0&&s>0),(()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next((o=>{if(o!==null&&!n.has(o))return D(Cs,`Processing collection: ${o}`),this._e(e,o,s).next((u=>{s-=u,n.add(o)}));i=!1})))).next((()=>t-s))}_e(e,t,n){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next((s=>this.localStore.localDocuments.getNextDocuments(e,t,s,n).next((i=>{const o=i.changes;return this.localStore.indexManager.updateIndexEntries(e,o).next((()=>this.oe(s,i))).next((u=>(D(Cs,`Updating offset: ${u}`),this.localStore.indexManager.updateCollectionGroup(e,t,u)))).next((()=>o.size))}))))}oe(e,t){let n=e;return t.changes.forEach(((s,i)=>{const o=tp(i);Zu(o,n)>0&&(n=o)})),new et(n.readTime,n.documentKey,Math.max(t.batchId,e.largestBatchId))}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class st{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=n=>this.ae(n),this.ue=n=>t.writeSequenceNumber(n))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ue&&this.ue(e),e}}st.ce=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Un=-1;function Jo(r){return r==null}function Sr(r){return r===0&&1/r==-1/0}function YE(r){return typeof r=="number"&&Number.isInteger(r)&&!Sr(r)&&r<=Number.MAX_SAFE_INTEGER&&r>=Number.MIN_SAFE_INTEGER}function JE(r){return typeof r=="string"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Po="";function ke(r){let e="";for(let t=0;t<r.length;t++)e.length>0&&(e=kh(e)),e=XE(r.get(t),e);return kh(e)}function XE(r,e){let t=e;const n=r.length;for(let s=0;s<n;s++){const i=r.charAt(s);switch(i){case"\0":t+="";break;case Po:t+="";break;default:t+=i}}return t}function kh(r){return r+Po+""}function mt(r){const e=r.length;if(N(e>=2,64408,{path:r}),e===2)return N(r.charAt(0)===Po&&r.charAt(1)==="",56145,{path:r}),ee.emptyPath();const t=e-2,n=[];let s="";for(let i=0;i<e;){const o=r.indexOf(Po,i);switch((o<0||o>t)&&B(50515,{path:r}),r.charAt(o+1)){case"":const u=r.substring(i,o);let c;s.length===0?c=u:(s+=u,c=s,s=""),n.push(c);break;case"":s+=r.substring(i,o),s+="\0";break;case"":s+=r.substring(i,o+1);break;default:B(61167,{path:r})}i=o+2}return new ee(n)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xn="remoteDocuments",yi="owner",ur="owner",Ks="mutationQueues",ZE="userId",ct="mutations",Oh="batchId",Ln="userMutationsIndex",Lh=["userId","batchId"];/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uo(r,e){return[r,ke(e)]}function ip(r,e,t){return[r,ke(e),t]}const eT={},Vr="documentMutations",bo="remoteDocumentsV14",tT=["prefixPath","collectionGroup","readTime","documentId"],co="documentKeyIndex",nT=["prefixPath","collectionGroup","documentId"],op="collectionGroupIndex",rT=["collectionGroup","readTime","prefixPath","documentId"],Gs="remoteDocumentGlobal",du="remoteDocumentGlobalKey",Cr="targets",ap="queryTargetsIndex",sT=["canonicalId","targetId"],xr="targetDocuments",iT=["targetId","path"],tc="documentTargetsIndex",oT=["path","targetId"],So="targetGlobalKey",Fn="targetGlobal",Hs="collectionParents",aT=["collectionId","parent"],Dr="clientMetadata",uT="clientId",Xo="bundles",cT="bundleId",Zo="namedQueries",lT="name",nc="indexConfiguration",hT="indexId",fu="collectionGroupIndex",dT="collectionGroup",xs="indexState",fT=["indexId","uid"],up="sequenceNumberIndex",pT=["uid","sequenceNumber"],Ds="indexEntries",mT=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],cp="documentKeyIndex",gT=["indexId","uid","orderedDocumentKey"],ea="documentOverlays",_T=["userId","collectionPath","documentId"],pu="collectionPathOverlayIndex",yT=["userId","collectionPath","largestBatchId"],lp="collectionGroupOverlayIndex",IT=["userId","collectionGroup","largestBatchId"],rc="globals",ET="name",hp=[Ks,ct,Vr,xn,Cr,yi,Fn,xr,Dr,Gs,Hs,Xo,Zo],TT=[...hp,ea],dp=[Ks,ct,Vr,bo,Cr,yi,Fn,xr,Dr,Gs,Hs,Xo,Zo,ea],fp=dp,sc=[...fp,nc,xs,Ds],wT=sc,pp=[...sc,rc],vT=pp;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mu extends rp{constructor(e,t){super(),this.le=e,this.currentSequenceNumber=t}}function ve(r,e){const t=W(r);return an.M(t.le,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class he{constructor(e,t){this.comparator=e,this.root=t||Se.EMPTY}insert(e,t){return new he(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Se.BLACK,null,null))}remove(e){return new he(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Se.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const n=this.comparator(e,t.key);if(n===0)return t.value;n<0?t=t.left:n>0&&(t=t.right)}return null}indexOf(e){let t=0,n=this.root;for(;!n.isEmpty();){const s=this.comparator(e,n.key);if(s===0)return t+n.left.size;s<0?n=n.left:(t+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,n)=>(e(t,n),!1)))}toString(){const e=[];return this.inorderTraversal(((t,n)=>(e.push(`${t}:${n}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Wi(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Wi(this.root,e,this.comparator,!1)}getReverseIterator(){return new Wi(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Wi(this.root,e,this.comparator,!0)}}class Wi{constructor(e,t,n,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?n(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Se{constructor(e,t,n,s,i){this.key=e,this.value=t,this.color=n??Se.RED,this.left=s??Se.EMPTY,this.right=i??Se.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,n,s,i){return new Se(e??this.key,t??this.value,n??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let s=this;const i=n(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,n),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,n)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Se.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let n,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Se.EMPTY;n=s.right.min(),s=s.copy(n.key,n.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Se.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Se.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw B(43730,{key:this.key,value:this.value});if(this.right.isRed())throw B(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw B(27949);return e+(this.isRed()?0:1)}}Se.EMPTY=null,Se.RED=!0,Se.BLACK=!1;Se.EMPTY=new class{constructor(){this.size=0}get key(){throw B(57766)}get value(){throw B(16141)}get color(){throw B(16727)}get left(){throw B(29726)}get right(){throw B(36894)}copy(e,t,n,s,i){return this}insert(e,t,n){return new Se(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class re{constructor(e){this.comparator=e,this.data=new he(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,n)=>(e(t),!1)))}forEachInRange(e,t){const n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){const s=n.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let n;for(n=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Mh(this.data.getIterator())}getIteratorFrom(e){return new Mh(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((n=>{t=t.add(n)})),t}isEqual(e){if(!(e instanceof re)||this.size!==e.size)return!1;const t=this.data.getIterator(),n=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new re(this.comparator);return t.data=e,t}}class Mh{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function cr(r){return r.hasNext()?r.getNext():void 0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class it{constructor(e){this.fields=e,e.sort(le.comparator)}static empty(){return new it([])}unionWith(e){let t=new re(le.comparator);for(const n of this.fields)t=t.add(n);for(const n of e)t=t.add(n);return new it(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Pr(this.fields,e.fields,((t,n)=>t.isEqual(n)))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vo(r){let e=0;for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e++;return e}function tr(r,e){for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e(t,r[t])}function AT(r,e){const t=[];for(const n in r)Object.prototype.hasOwnProperty.call(r,n)&&t.push(e(r[n],n,r));return t}function mp(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gp extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class de{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new gp("Invalid base64 string: "+i):i}})(e);return new de(t)}static fromUint8Array(e){const t=(function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i})(e);return new de(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const n=new Uint8Array(t.length);for(let s=0;s<t.length;s++)n[s]=t.charCodeAt(s);return n})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return G(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}de.EMPTY_BYTE_STRING=new de("");const RT=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function kt(r){if(N(!!r,39018),typeof r=="string"){let e=0;const t=RT.exec(r);if(N(!!t,46558,{timestamp:r}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const n=new Date(r);return{seconds:Math.floor(n.getTime()/1e3),nanos:e}}return{seconds:ae(r.seconds),nanos:ae(r.nanos)}}function ae(r){return typeof r=="number"?r:typeof r=="string"?Number(r):0}function Ot(r){return typeof r=="string"?de.fromBase64String(r):de.fromUint8Array(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _p="server_timestamp",yp="__type__",Ip="__previous_value__",Ep="__local_write_time__";function ta(r){var t,n;return((n=(((t=r==null?void 0:r.mapValue)==null?void 0:t.fields)||{})[yp])==null?void 0:n.stringValue)===_p}function Ii(r){const e=r.mapValue.fields[Ip];return ta(e)?Ii(e):e}function Nr(r){const e=kt(r.mapValue.fields[Ep].timestampValue);return new se(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PT{constructor(e,t,n,s,i,o,u,c,h,f,p){this.databaseId=e,this.appId=t,this.persistenceKey=n,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=u,this.longPollingOptions=c,this.useFetchStreams=h,this.isUsingEmulator=f,this.apiKey=p}}const Ws="(default)";class Wn{constructor(e,t){this.projectId=e,this.database=t||Ws}static empty(){return new Wn("","")}get isDefaultDatabase(){return this.database===Ws}isEqual(e){return e instanceof Wn&&e.projectId===this.projectId&&e.database===this.database}}function bT(r,e){if(!Object.prototype.hasOwnProperty.apply(r.options,["projectId"]))throw new U(x.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Wn(r.options.projectId,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ic="__type__",Tp="__max__",rn={mapValue:{fields:{__type__:{stringValue:Tp}}}},oc="__vector__",Qn="value",Tt={nullValue:"NULL_VALUE"},Ge={booleanValue:!0},Pe={booleanValue:!1};function Ie(r){return"nullValue"in r?0:"booleanValue"in r?1:"integerValue"in r||"doubleValue"in r?2:"timestampValue"in r?3:"stringValue"in r?5:"bytesValue"in r?6:"referenceValue"in r?7:"geoPointValue"in r?8:"arrayValue"in r?9:"mapValue"in r?ta(r)?4:wp(r)?9007199254740991:Yn(r)?10:11:B(28295,{value:r})}function ut(r,e,t){if(r===e)return!0;const n=Ie(r);if(n!==Ie(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return r.booleanValue===e.booleanValue;case 4:return Nr(r).isEqual(Nr(e));case 3:return(function(i,o){if(typeof i.timestampValue=="string"&&typeof o.timestampValue=="string"&&i.timestampValue.length===o.timestampValue.length)return i.timestampValue===o.timestampValue;const u=kt(i.timestampValue),c=kt(o.timestampValue);return u.seconds===c.seconds&&u.nanos===c.nanos})(r,e);case 5:return r.stringValue===e.stringValue;case 6:return(function(i,o){return Ot(i.bytesValue).isEqual(Ot(o.bytesValue))})(r,e);case 7:return r.referenceValue===e.referenceValue;case 8:return(function(i,o){return ae(i.geoPointValue.latitude)===ae(o.geoPointValue.latitude)&&ae(i.geoPointValue.longitude)===ae(o.geoPointValue.longitude)})(r,e);case 2:return(function(i,o,u){if("integerValue"in i&&"integerValue"in o)return ae(i.integerValue)===ae(o.integerValue);let c,h;if("doubleValue"in i&&"doubleValue"in o)c=ae(i.doubleValue),h=ae(o.doubleValue);else{if(!(u!=null&&u.Ee))return!1;c=ae(i.integerValue??i.doubleValue),h=ae(o.integerValue??o.doubleValue)}return c===h?!!(u!=null&&u.he)||Sr(c)===Sr(h):!!(u===void 0||u.Te)&&isNaN(c)&&isNaN(h)})(r,e,t);case 9:return Pr(r.arrayValue.values||[],e.arrayValue.values||[],((s,i)=>ut(s,i,t)));case 10:case 11:return(function(i,o,u){const c=i.mapValue.fields||{},h=o.mapValue.fields||{};if(Vo(c)!==Vo(h))return!1;for(const f in c)if(c.hasOwnProperty(f)&&(h[f]===void 0||!ut(c[f],h[f],u)))return!1;return!0})(r,e,t);default:return B(52216,{left:r})}}function Qs(r,e){return(r.values||[]).find((t=>ut(t,e)))!==void 0}function Oe(r,e){if(r===e)return 0;const t=Ie(r),n=Ie(e);if(t!==n)return G(t,n);switch(t){case 0:case 9007199254740991:return 0;case 1:return G(r.booleanValue,e.booleanValue);case 2:return(function(i,o){const u=ae(i.integerValue||i.doubleValue),c=ae(o.integerValue||o.doubleValue);return u<c?-1:u>c?1:u===c?0:isNaN(u)?isNaN(c)?0:-1:1})(r,e);case 3:return Uh(r.timestampValue,e.timestampValue);case 4:return Uh(Nr(r),Nr(e));case 5:return lu(r.stringValue,e.stringValue);case 6:return(function(i,o){const u=Ot(i),c=Ot(o);return u.compareTo(c)})(r.bytesValue,e.bytesValue);case 7:return(function(i,o){const u=i.split("/"),c=o.split("/");for(let h=0;h<u.length&&h<c.length;h++){const f=G(u[h],c[h]);if(f!==0)return f}return G(u.length,c.length)})(r.referenceValue,e.referenceValue);case 8:return(function(i,o){const u=G(ae(i.latitude),ae(o.latitude));return u!==0?u:G(ae(i.longitude),ae(o.longitude))})(r.geoPointValue,e.geoPointValue);case 9:return Fh(r.arrayValue,e.arrayValue);case 10:return(function(i,o){var _,P,V,O;const u=i.fields||{},c=o.fields||{},h=(_=u[Qn])==null?void 0:_.arrayValue,f=(P=c[Qn])==null?void 0:P.arrayValue,p=G(((V=h==null?void 0:h.values)==null?void 0:V.length)||0,((O=f==null?void 0:f.values)==null?void 0:O.length)||0);return p!==0?p:Fh(h,f)})(r.mapValue,e.mapValue);case 11:return(function(i,o){if(i===rn.mapValue&&o===rn.mapValue)return 0;if(i===rn.mapValue)return 1;if(o===rn.mapValue)return-1;const u=i.fields||{},c=Object.keys(u),h=o.fields||{},f=Object.keys(h);c.sort(),f.sort();for(let p=0;p<c.length&&p<f.length;++p){const _=lu(c[p],f[p]);if(_!==0)return _;const P=Oe(u[c[p]],h[f[p]]);if(P!==0)return P}return G(c.length,f.length)})(r.mapValue,e.mapValue);default:throw B(23264,{Pe:t})}}function Uh(r,e){if(typeof r=="string"&&typeof e=="string"&&r.length===e.length)return G(r,e);const t=kt(r),n=kt(e),s=G(t.seconds,n.seconds);return s!==0?s:G(t.nanos,n.nanos)}function Fh(r,e){const t=r.values||[],n=e.values||[];for(let s=0;s<t.length&&s<n.length;++s){const i=Oe(t[s],n[s]);if(i!==void 0&&i!==0)return i}return G(t.length,n.length)}function kr(r){return gu(r)}function gu(r){return"nullValue"in r?"null":"booleanValue"in r?""+r.booleanValue:"integerValue"in r?""+r.integerValue:"doubleValue"in r?""+r.doubleValue:"timestampValue"in r?(function(t){const n=kt(t);return`time(${n.seconds},${n.nanos})`})(r.timestampValue):"stringValue"in r?r.stringValue:"bytesValue"in r?(function(t){return Ot(t).toBase64()})(r.bytesValue):"referenceValue"in r?(function(t){return F.fromName(t).toString()})(r.referenceValue):"geoPointValue"in r?(function(t){return`geo(${t.latitude},${t.longitude})`})(r.geoPointValue):"arrayValue"in r?(function(t){let n="[",s=!0;for(const i of t.values||[])s?s=!1:n+=",",n+=gu(i);return n+"]"})(r.arrayValue):"mapValue"in r?(function(t){const n=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const o of n)i?i=!1:s+=",",s+=`${o}:${gu(t.fields[o])}`;return s+"}"})(r.mapValue):B(61005,{value:r})}function lo(r){switch(Ie(r)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Ii(r);return e?16+lo(e):16;case 5:return 2*r.stringValue.length;case 6:return Ot(r.bytesValue).approximateByteSize();case 7:return r.referenceValue.length;case 9:return(function(n){return(n.values||[]).reduce(((s,i)=>s+lo(i)),0)})(r.arrayValue);case 10:case 11:return(function(n){let s=0;return tr(n.fields,((i,o)=>{s+=i.length+lo(o)})),s})(r.mapValue);default:throw B(13486,{value:r})}}function ac(r,e){return{referenceValue:`projects/${r.projectId}/databases/${r.database}/documents/${e.path.canonicalString()}`}}function gt(r){return!!r&&"integerValue"in r}function Mn(r){return!!r&&"doubleValue"in r}function dn(r){return gt(r)||Mn(r)}function fn(r){return!!r&&"arrayValue"in r}function Xe(r){return!!r&&"nullValue"in r}function He(r){return!!r&&"doubleValue"in r&&isNaN(Number(r.doubleValue))}function Bn(r){return!!r&&"mapValue"in r}function Yn(r){var t,n;return((n=(((t=r==null?void 0:r.mapValue)==null?void 0:t.fields)||{})[ic])==null?void 0:n.stringValue)===oc}function _u(r){var e,t;return(t=(((e=r==null?void 0:r.mapValue)==null?void 0:e.fields)||{})[Qn])==null?void 0:t.arrayValue}function Ns(r){if(r.geoPointValue)return{geoPointValue:{...r.geoPointValue}};if(r.timestampValue&&typeof r.timestampValue=="object")return{timestampValue:{...r.timestampValue}};if(r.mapValue){const e={mapValue:{fields:{}}};return tr(r.mapValue.fields,((t,n)=>e.mapValue.fields[t]=Ns(n))),e}if(r.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(r.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Ns(r.arrayValue.values[t]);return e}return{...r}}function wp(r){return(((r.mapValue||{}).fields||{}).__type__||{}).stringValue===Tp}const vp={mapValue:{fields:{[ic]:{stringValue:oc},[Qn]:{arrayValue:{}}}}};function ST(r){return"nullValue"in r?Tt:"booleanValue"in r?{booleanValue:!1}:"integerValue"in r||"doubleValue"in r?{doubleValue:NaN}:"timestampValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in r?{stringValue:""}:"bytesValue"in r?{bytesValue:""}:"referenceValue"in r?ac(Wn.empty(),F.empty()):"geoPointValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in r?{arrayValue:{}}:"mapValue"in r?Yn(r)?vp:{mapValue:{}}:B(35942,{value:r})}function VT(r){return"nullValue"in r?{booleanValue:!1}:"booleanValue"in r?{doubleValue:NaN}:"integerValue"in r||"doubleValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in r?{stringValue:""}:"stringValue"in r?{bytesValue:""}:"bytesValue"in r?ac(Wn.empty(),F.empty()):"referenceValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in r?{arrayValue:{}}:"arrayValue"in r?vp:"mapValue"in r?Yn(r)?{mapValue:{}}:rn:B(61959,{value:r})}function Bh(r,e){const t=Oe(r.value,e.value);return t!==0?t:r.inclusive&&!e.inclusive?-1:!r.inclusive&&e.inclusive?1:0}function qh(r,e){const t=Oe(r.value,e.value);return t!==0?t:r.inclusive&&!e.inclusive?1:!r.inclusive&&e.inclusive?-1:0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qe{constructor(e){this.value=e}static empty(){return new qe({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let n=0;n<e.length-1;++n)if(t=(t.mapValue.fields||{})[e.get(n)],!Bn(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Ns(t)}setAll(e){let t=le.emptyPath(),n={},s=[];e.forEach(((o,u)=>{if(!t.isImmediateParentOf(u)){const c=this.getFieldsMap(t);this.applyChanges(c,n,s),n={},s=[],t=u.popLast()}o?n[u.lastSegment()]=Ns(o):s.push(u.lastSegment())}));const i=this.getFieldsMap(t);this.applyChanges(i,n,s)}delete(e){const t=this.field(e.popLast());Bn(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return ut(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let n=0;n<e.length;++n){let s=t.mapValue.fields[e.get(n)];Bn(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(n)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,n){tr(t,((s,i)=>e[s]=i));for(const s of n)delete e[s]}clone(){return new qe(Ns(this.value))}}function Ap(r){const e=[];return tr(r.fields,((t,n)=>{const s=new le([t]);if(Bn(n)){const i=Ap(n.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)})),new it(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function na(r,e){if(r.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Sr(e)?"-0":e}}function uc(r){return{integerValue:""+r}}function cc(r,e,t){return Number.isInteger(e)&&(t!=null&&t.preferIntegers)||YE(e)?uc(e):na(r,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ra{constructor(){this._=void 0}}function CT(r,e,t){return r instanceof Ys?(function(s,i){const o={fields:{[yp]:{stringValue:_p},[Ep]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&ta(i)&&(i=Ii(i)),i&&(o.fields[Ip]=i),{mapValue:o}})(t,e):r instanceof Or?Pp(r,e):r instanceof Lr?bp(r,e):r instanceof Mr?(function(s,i){const o=Rp(s,i),u=Co(o)+Co(s.Re);return gt(o)&&gt(s.Re)?uc(u):na(s.serializer,u)})(r,e):r instanceof Js?(function(s,i){return $h(s,i,Math.min)})(r,e):r instanceof Xs?(function(s,i){return $h(s,i,Math.max)})(r,e):void 0}function xT(r,e,t){return r instanceof Or?Pp(r,e):r instanceof Lr?bp(r,e):t}function Rp(r,e){return r instanceof Mr?dn(e)?e:{integerValue:0}:null}class Ys extends ra{}class Or extends ra{constructor(e){super(),this.elements=e}}function Pp(r,e){const t=Sp(e);for(const n of r.elements)t.some((s=>ut(s,n)))||t.push(n);return{arrayValue:{values:t}}}class Lr extends ra{constructor(e){super(),this.elements=e}}function bp(r,e){let t=Sp(e);for(const n of r.elements)t=t.filter((s=>!ut(s,n)));return{arrayValue:{values:t}}}class lc extends ra{constructor(e,t){super(),this.serializer=e,this.Re=t}}class Mr extends lc{}class Js extends lc{}class Xs extends lc{}function $h(r,e,t){if(!dn(e))return r.Re;const n=t(Co(e),Co(r.Re));return gt(e)&&gt(r.Re)?uc(n):na(r.serializer,n)}function Co(r){return ae(r.integerValue||r.doubleValue)}function Sp(r){return fn(r)&&r.arrayValue.values?r.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DT{constructor(e,t){this.field=e,this.transform=t}}function NT(r,e){return r.field.isEqual(e.field)&&(function(n,s){return n instanceof Or&&s instanceof Or||n instanceof Lr&&s instanceof Lr?Pr(n.elements,s.elements,ut):n instanceof Mr&&s instanceof Mr||n instanceof Js&&s instanceof Js||n instanceof Xs&&s instanceof Xs?ut(n.Re,s.Re):n instanceof Ys&&s instanceof Ys})(r.transform,e.transform)}class kT{constructor(e,t){this.version=e,this.transformResults=t}}class Ze{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Ze}static exists(e){return new Ze(void 0,e)}static updateTime(e){return new Ze(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function ho(r,e){return r.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(r.updateTime):r.exists===void 0||r.exists===e.isFoundDocument()}class sa{}function Vp(r,e){if(!r.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return r.isNoDocument()?new hc(r.key,Ze.none()):new Wr(r.key,r.data,Ze.none());{const t=r.data,n=qe.empty();let s=new re(le.comparator);for(let i of e.fields)if(!s.has(i)){let o=t.field(i);o===null&&i.length>1&&(i=i.popLast(),o=t.field(i)),o===null?n.delete(i):n.set(i,o),s=s.add(i)}return new wn(r.key,n,new it(s.toArray()),Ze.none())}}function OT(r,e,t){r instanceof Wr?(function(s,i,o){const u=s.value.clone(),c=zh(s.fieldTransforms,i,o.transformResults);u.setAll(c),i.convertToFoundDocument(o.version,u).setHasCommittedMutations()})(r,e,t):r instanceof wn?(function(s,i,o){if(!ho(s.precondition,i))return void i.convertToUnknownDocument(o.version);const u=zh(s.fieldTransforms,i,o.transformResults),c=i.data;c.setAll(Cp(s)),c.setAll(u),i.convertToFoundDocument(o.version,c).setHasCommittedMutations()})(r,e,t):(function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()})(0,e,t)}function ks(r,e,t,n){return r instanceof Wr?(function(i,o,u,c){if(!ho(i.precondition,o))return u;const h=i.value.clone(),f=Kh(i.fieldTransforms,c,o);return h.setAll(f),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),null})(r,e,t,n):r instanceof wn?(function(i,o,u,c){if(!ho(i.precondition,o))return u;const h=Kh(i.fieldTransforms,c,o),f=o.data;return f.setAll(Cp(i)),f.setAll(h),o.convertToFoundDocument(o.version,f).setHasLocalMutations(),u===null?null:u.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map((p=>p.field)))})(r,e,t,n):(function(i,o,u){return ho(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):u})(r,e,t)}function LT(r,e){let t=null;for(const n of r.fieldTransforms){const s=e.data.field(n.field),i=Rp(n.transform,s||null);i!=null&&(t===null&&(t=qe.empty()),t.set(n.field,i))}return t||null}function jh(r,e){return r.type===e.type&&!!r.key.isEqual(e.key)&&!!r.precondition.isEqual(e.precondition)&&!!(function(n,s){return n===void 0&&s===void 0||!(!n||!s)&&Pr(n,s,((i,o)=>NT(i,o)))})(r.fieldTransforms,e.fieldTransforms)&&(r.type===0?r.value.isEqual(e.value):r.type!==1||r.data.isEqual(e.data)&&r.fieldMask.isEqual(e.fieldMask))}class Wr extends sa{constructor(e,t,n,s=[]){super(),this.key=e,this.value=t,this.precondition=n,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class wn extends sa{constructor(e,t,n,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=n,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Cp(r){const e=new Map;return r.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const n=r.data.field(t);e.set(t,n)}})),e}function zh(r,e,t){const n=new Map;N(r.length===t.length,32656,{Ie:t.length,Ae:r.length});for(let s=0;s<t.length;s++){const i=r[s],o=i.transform,u=e.data.field(i.field);n.set(i.field,xT(o,u,t[s]))}return n}function Kh(r,e,t){const n=new Map;for(const s of r){const i=s.transform,o=t.data.field(s.field);n.set(s.field,CT(i,o,e))}return n}class hc extends sa{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class xp extends sa{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ur{constructor(e,t){this.position=e,this.inclusive=t}}function Gh(r,e,t){let n=0;for(let s=0;s<r.position.length;s++){const i=e[s],o=r.position[s];if(i.field.isKeyField()?n=F.comparator(F.fromName(o.referenceValue),t.key):n=Oe(o,t.data.field(i.field)),i.dir==="desc"&&(n*=-1),n!==0)break}return n}function Hh(r,e){if(r===null)return e===null;if(e===null||r.inclusive!==e.inclusive||r.position.length!==e.position.length)return!1;for(let t=0;t<r.position.length;t++)if(!ut(r.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dp{}class X extends Dp{constructor(e,t,n){super(),this.field=e,this.op=t,this.value=n}static create(e,t,n){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,n):new MT(e,t,n):t==="array-contains"?new BT(e,n):t==="in"?new Up(e,n):t==="not-in"?new qT(e,n):t==="array-contains-any"?new $T(e,n):new X(e,t,n)}static createKeyFieldInFilter(e,t,n){return t==="in"?new UT(e,n):new FT(e,n)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(Oe(t,this.value)):t!==null&&Ie(this.value)===Ie(t)&&this.matchesComparison(Oe(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return B(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class ie extends Dp{constructor(e,t){super(),this.filters=e,this.op=t,this.Ve=null}static create(e,t){return new ie(e,t)}matches(e){return Fr(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.Ve!==null||(this.Ve=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.Ve}getFilters(){return Object.assign([],this.filters)}}function Fr(r){return r.op==="and"}function yu(r){return r.op==="or"}function dc(r){return Np(r)&&Fr(r)}function Np(r){for(const e of r.filters)if(e instanceof ie)return!1;return!0}function Iu(r){if(r instanceof X)return r.field.canonicalString()+r.op.toString()+kr(r.value);if(dc(r))return r.filters.map((e=>Iu(e))).join(",");{const e=r.filters.map((t=>Iu(t))).join(",");return`${r.op}(${e})`}}function kp(r,e){return r instanceof X?(function(n,s){return s instanceof X&&n.op===s.op&&n.field.isEqual(s.field)&&ut(n.value,s.value)})(r,e):r instanceof ie?(function(n,s){return s instanceof ie&&n.op===s.op&&n.filters.length===s.filters.length?n.filters.reduce(((i,o,u)=>i&&kp(o,s.filters[u])),!0):!1})(r,e):void B(19439)}function Op(r,e){const t=r.filters.concat(e);return ie.create(t,r.op)}function Lp(r){return r instanceof X?(function(t){return`${t.field.canonicalString()} ${t.op} ${kr(t.value)}`})(r):r instanceof ie?(function(t){return t.op.toString()+" {"+t.getFilters().map(Lp).join(" ,")+"}"})(r):"Filter"}class MT extends X{constructor(e,t,n){super(e,t,n),this.key=F.fromName(n.referenceValue)}matches(e){const t=F.comparator(e.key,this.key);return this.matchesComparison(t)}}class UT extends X{constructor(e,t){super(e,"in",t),this.keys=Mp("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class FT extends X{constructor(e,t){super(e,"not-in",t),this.keys=Mp("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function Mp(r,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map((n=>F.fromName(n.referenceValue)))}class BT extends X{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return fn(t)&&Qs(t.arrayValue,this.value)}}class Up extends X{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Qs(this.value.arrayValue,t)}}class qT extends X{constructor(e,t){super(e,"not-in",t)}matches(e){if(Qs(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!Qs(this.value.arrayValue,t)}}class $T extends X{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!fn(t)||!t.arrayValue.values)&&t.arrayValue.values.some((n=>Qs(this.value.arrayValue,n)))}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xo{constructor(e,t="asc"){this.field=e,this.dir=t}}function jT(r,e){return r.dir===e.dir&&r.field.isEqual(e.field)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pe{constructor(e,t,n,s,i,o,u){this.key=e,this.documentType=t,this.version=n,this.readTime=s,this.createTime=i,this.data=o,this.documentState=u}static newInvalidDocument(e){return new pe(e,0,q.min(),q.min(),q.min(),qe.empty(),0)}static newFoundDocument(e,t,n,s){return new pe(e,1,t,q.min(),n,s,0)}static newNoDocument(e,t){return new pe(e,2,t,q.min(),q.min(),qe.empty(),0)}static newUnknownDocument(e,t){return new pe(e,3,t,q.min(),q.min(),qe.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(q.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=qe.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=qe.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=q.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof pe&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new pe(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zT{constructor(e,t=null,n=[],s=[],i=null,o=null,u=null){this.path=e,this.collectionGroup=t,this.orderBy=n,this.filters=s,this.limit=i,this.startAt=o,this.endAt=u,this.de=null}}function Eu(r,e=null,t=[],n=[],s=null,i=null,o=null){return new zT(r,e,t,n,s,i,o)}function Do(r){const e=W(r);if(e.de===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((n=>Iu(n))).join(","),t+="|ob:",t+=e.orderBy.map((n=>(function(i){return i.field.canonicalString()+i.dir})(n))).join(","),Jo(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((n=>kr(n))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((n=>kr(n))).join(",")),e.de=t}return e.de}function fc(r,e){if(r.limit!==e.limit||r.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<r.orderBy.length;t++)if(!jT(r.orderBy[t],e.orderBy[t]))return!1;if(r.filters.length!==e.filters.length)return!1;for(let t=0;t<r.filters.length;t++)if(!kp(r.filters[t],e.filters[t]))return!1;return r.collectionGroup===e.collectionGroup&&!!r.path.isEqual(e.path)&&!!Hh(r.startAt,e.startAt)&&Hh(r.endAt,e.endAt)}function tn(r){return!!r.isCorePipeline}function pc(r){return!!r.path&&F.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function No(r,e){return r.filters.filter((t=>t instanceof X&&t.field.isEqual(e)))}function Wh(r,e,t){let n=Tt,s=!0;for(const i of No(r,e)){let o=Tt,u=!0;switch(i.op){case"<":case"<=":o=ST(i.value);break;case"==":case"in":case">=":o=i.value;break;case">":o=i.value,u=!1;break;case"!=":case"not-in":o=Tt}Bh({value:n,inclusive:s},{value:o,inclusive:u})<0&&(n=o,s=u)}if(t!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(e)){const o=t.position[i];Bh({value:n,inclusive:s},{value:o,inclusive:t.inclusive})<0&&(n=o,s=t.inclusive);break}}return{value:n,inclusive:s}}function Qh(r,e,t){let n=rn,s=!0;for(const i of No(r,e)){let o=rn,u=!0;switch(i.op){case">=":case">":o=VT(i.value),u=!1;break;case"==":case"in":case"<=":o=i.value;break;case"<":o=i.value,u=!1;break;case"!=":case"not-in":o=rn}qh({value:n,inclusive:s},{value:o,inclusive:u})>0&&(n=o,s=u)}if(t!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(e)){const o=t.position[i];qh({value:n,inclusive:s},{value:o,inclusive:t.inclusive})>0&&(n=o,s=t.inclusive);break}}return{value:n,inclusive:s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ia{constructor(e,t=null,n=[],s=[],i=null,o="F",u=null,c=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=n,this.filters=s,this.limit=i,this.limitType=o,this.startAt=u,this.endAt=c,this.fe=null,this.me=null,this.pe=null,this.startAt,this.endAt}}function KT(r,e,t,n,s,i,o,u){return new ia(r,e,t,n,s,i,o,u)}function Ei(r){return new ia(r)}function Yh(r){return r.filters.length===0&&r.limit===null&&r.startAt==null&&r.endAt==null&&(r.explicitOrderBy.length===0||r.explicitOrderBy.length===1&&r.explicitOrderBy[0].field.isKeyField())}function GT(r){return F.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function HT(r){return r.collectionGroup!==null}function Os(r){const e=W(r);if(e.fe===null){e.fe=[];const t=new Set;for(const i of e.explicitOrderBy)e.fe.push(i),t.add(i.field.canonicalString());const n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let u=new re(le.comparator);return o.filters.forEach((c=>{c.getFlattenedFilters().forEach((h=>{h.isInequality()&&(u=u.add(h.field))}))})),u})(e).forEach((i=>{t.has(i.canonicalString())||i.isKeyField()||e.fe.push(new xo(i,n))})),t.has(le.keyField().canonicalString())||e.fe.push(new xo(le.keyField(),n))}return e.fe}function ot(r){const e=W(r);return e.me||(e.me=WT(e,Os(r))),e.me}function WT(r,e){if(r.limitType==="F")return Eu(r.path,r.collectionGroup,e,r.filters,r.limit,r.startAt,r.endAt);{e=e.map((s=>{const i=s.dir==="desc"?"asc":"desc";return new xo(s.field,i)}));const t=r.endAt?new Ur(r.endAt.position,r.endAt.inclusive):null,n=r.startAt?new Ur(r.startAt.position,r.startAt.inclusive):null;return Eu(r.path,r.collectionGroup,e,r.filters,r.limit,t,n)}}function Tu(r,e,t){return new ia(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),e,t,r.startAt,r.endAt)}function QT(r,e){return fc(ot(r),ot(e))&&r.limitType===e.limitType}function Ls(r){return`Query(target=${(function(t){let n=t.path.canonicalString();return t.collectionGroup!==null&&(n+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(n+=`, filters: [${t.filters.map((s=>Lp(s))).join(", ")}]`),Jo(t.limit)||(n+=", limit: "+t.limit),t.orderBy.length>0&&(n+=`, orderBy: [${t.orderBy.map((s=>(function(o){return`${o.field.canonicalString()} (${o.dir})`})(s))).join(", ")}]`),t.startAt&&(n+=", startAt: ",n+=t.startAt.inclusive?"b:":"a:",n+=t.startAt.position.map((s=>kr(s))).join(",")),t.endAt&&(n+=", endAt: ",n+=t.endAt.inclusive?"a:":"b:",n+=t.endAt.position.map((s=>kr(s))).join(",")),`Target(${n})`})(ot(r))}; limitType=${r.limitType})`}function oa(r,e){return e.isFoundDocument()&&(function(n,s){const i=s.key.path;return n.collectionGroup!==null?s.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(i):F.isDocumentKey(n.path)?n.path.isEqual(i):n.path.isImmediateParentOf(i)})(r,e)&&(function(n,s){for(const i of Os(n))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0})(r,e)&&(function(n,s){for(const i of n.filters)if(!i.matches(s))return!1;return!0})(r,e)&&(function(n,s){return!(n.startAt&&!(function(o,u,c){const h=Gh(o,u,c);return o.inclusive?h<=0:h<0})(n.startAt,Os(n),s)||n.endAt&&!(function(o,u,c){const h=Gh(o,u,c);return o.inclusive?h>=0:h>0})(n.endAt,Os(n),s))})(r,e)}function mc(r){return(e,t)=>{let n=!1;for(const s of Os(r)){const i=YT(s,e,t);if(i!==0)return i;n=n||s.field.isKeyField()}return 0}}function YT(r,e,t){const n=r.field.isKeyField()?F.comparator(e.key,t.key):(function(i,o,u){const c=o.data.field(i),h=u.data.field(i);return c!==null&&h!==null?Oe(c,h):B(42886)})(r.field,e,t);switch(r.dir){case"asc":return n;case"desc":return-1*n;default:return B(19790,{direction:r.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class JT{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var me,Z;function XT(r){switch(r){case x.OK:return B(64938);case x.CANCELLED:case x.UNKNOWN:case x.DEADLINE_EXCEEDED:case x.RESOURCE_EXHAUSTED:case x.INTERNAL:case x.UNAVAILABLE:case x.UNAUTHENTICATED:return!1;case x.INVALID_ARGUMENT:case x.NOT_FOUND:case x.ALREADY_EXISTS:case x.PERMISSION_DENIED:case x.FAILED_PRECONDITION:case x.ABORTED:case x.OUT_OF_RANGE:case x.UNIMPLEMENTED:case x.DATA_LOSS:return!0;default:return B(15467,{code:r})}}function Fp(r){if(r===void 0)return Be("GRPC error has no .code"),x.UNKNOWN;switch(r){case me.OK:return x.OK;case me.CANCELLED:return x.CANCELLED;case me.UNKNOWN:return x.UNKNOWN;case me.DEADLINE_EXCEEDED:return x.DEADLINE_EXCEEDED;case me.RESOURCE_EXHAUSTED:return x.RESOURCE_EXHAUSTED;case me.INTERNAL:return x.INTERNAL;case me.UNAVAILABLE:return x.UNAVAILABLE;case me.UNAUTHENTICATED:return x.UNAUTHENTICATED;case me.INVALID_ARGUMENT:return x.INVALID_ARGUMENT;case me.NOT_FOUND:return x.NOT_FOUND;case me.ALREADY_EXISTS:return x.ALREADY_EXISTS;case me.PERMISSION_DENIED:return x.PERMISSION_DENIED;case me.FAILED_PRECONDITION:return x.FAILED_PRECONDITION;case me.ABORTED:return x.ABORTED;case me.OUT_OF_RANGE:return x.OUT_OF_RANGE;case me.UNIMPLEMENTED:return x.UNIMPLEMENTED;case me.DATA_LOSS:return x.DATA_LOSS;default:return B(39323,{code:r})}}(Z=me||(me={}))[Z.OK=0]="OK",Z[Z.CANCELLED=1]="CANCELLED",Z[Z.UNKNOWN=2]="UNKNOWN",Z[Z.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Z[Z.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Z[Z.NOT_FOUND=5]="NOT_FOUND",Z[Z.ALREADY_EXISTS=6]="ALREADY_EXISTS",Z[Z.PERMISSION_DENIED=7]="PERMISSION_DENIED",Z[Z.UNAUTHENTICATED=16]="UNAUTHENTICATED",Z[Z.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Z[Z.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Z[Z.ABORTED=10]="ABORTED",Z[Z.OUT_OF_RANGE=11]="OUT_OF_RANGE",Z[Z.UNIMPLEMENTED=12]="UNIMPLEMENTED",Z[Z.INTERNAL=13]="INTERNAL",Z[Z.UNAVAILABLE=14]="UNAVAILABLE",Z[Z.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ut{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n!==void 0){for(const[s,i]of n)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const n=this.mapKeyFn(e),s=this.inner[n];if(s===void 0)return this.inner[n]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n===void 0)return!1;for(let s=0;s<n.length;s++)if(this.equalsFn(n[s][0],e))return n.length===1?delete this.inner[t]:n.splice(s,1),this.innerSize--,!0;return!1}forEach(e){tr(this.inner,((t,n)=>{for(const[s,i]of n)e(s,i)}))}isEmpty(){return mp(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ZT=new he(F.comparator);function Te(){return ZT}const Bp=new he(F.comparator);function gr(...r){let e=Bp;for(const t of r)e=e.insert(t.key,t);return e}function qp(r){let e=Bp;return r.forEach(((t,n)=>e=e.insert(t,n.overlayedDocument))),e}function nt(){return Ms()}function $p(){return Ms()}function Ms(){return new Ut((r=>r.toString()),((r,e)=>r.isEqual(e)))}const ew=new he(F.comparator),tw=new re(F.comparator);function Q(...r){let e=tw;for(const t of r)e=e.add(t);return e}const nw=new re(G);function rw(){return nw}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sw(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iw=new on([4294967295,4294967295],0);function Jh(r){const e=sw().encode(r),t=new Gf;return t.update(e),new Uint8Array(t.digest())}function Xh(r){const e=new DataView(r.buffer),t=e.getUint32(0,!0),n=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new on([t,n],0),new on([s,i],0)]}class gc{constructor(e,t,n){if(this.bitmap=e,this.padding=t,this.hashCount=n,t<0||t>=8)throw new As(`Invalid padding: ${t}`);if(n<0)throw new As(`Invalid hash count: ${n}`);if(e.length>0&&this.hashCount===0)throw new As(`Invalid hash count: ${n}`);if(e.length===0&&t!==0)throw new As(`Invalid padding when bitmap length is 0: ${t}`);this.ge=8*e.length-t,this.ye=on.fromNumber(this.ge)}we(e,t,n){let s=e.add(t.multiply(on.fromNumber(n)));return s.compare(iw)===1&&(s=new on([s.getBits(0),s.getBits(1)],0)),s.modulo(this.ye).toNumber()}be(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;const t=Jh(e),[n,s]=Xh(t);for(let i=0;i<this.hashCount;i++){const o=this.we(n,s,i);if(!this.be(o))return!1}return!0}static create(e,t,n){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new gc(i,s,t);return n.forEach((u=>o.insert(u))),o}insert(e){if(this.ge===0)return;const t=Jh(e),[n,s]=Xh(t);for(let i=0;i<this.hashCount;i++){const o=this.we(n,s,i);this.ve(o)}}ve(e){const t=Math.floor(e/8),n=e%8;this.bitmap[t]|=1<<n}}class As extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ti{constructor(e,t,n,s,i,o){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=n,this.documentUpdates=s,this.augmentedDocumentUpdates=i,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(e,t,n){const s=new Map;return s.set(e,wi.createSynthesizedTargetChangeForCurrentChange(e,t,n)),new Ti(q.min(),s,new he(G),Te(),Te(),Q())}}class wi{constructor(e,t,n,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=n,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,n){return new wi(n,t,Q(),Q(),Q())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fo{constructor(e,t,n,s){this.Se=e,this.removedTargetIds=t,this.key=n,this.De=s}}class jp{constructor(e,t){this.targetId=e,this.xe=t}}class zp{constructor(e,t,n=de.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=n,this.cause=s}}class Zh{constructor(e){this.targetId=e,this.Ce=0,this.Fe=ed(),this.Oe=de.EMPTY_BYTE_STRING,this.Me=!1,this.Ne=!0}get current(){return this.Me}get resumeToken(){return this.Oe}get Le(){return this.Ce!==0}get Be(){return this.Ne}Ue(e){e.approximateByteSize()>0&&(this.Ne=!0,this.Oe=e)}ke(){let e=Q(),t=Q(),n=Q();return this.Fe.forEach(((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:n=n.add(s);break;default:B(38017,{changeType:i})}})),new wi(this.Oe,this.Me,e,t,n)}qe(){this.Ne=!1,this.Fe=ed()}$e(e,t){this.Ne=!0,this.Fe=this.Fe.insert(e,t)}Ke(e){this.Ne=!0,this.Fe=this.Fe.remove(e)}We(){this.Ce+=1}Qe(){this.Ce-=1,N(this.Ce>=0,3241,{Ce:this.Ce,targetId:this.targetId})}Ge(){this.Ne=!0,this.Me=!0}}const ms="WatchChangeAggregator";class ow{constructor(e){this.ze=e,this.je=new Map,this.He=Te(),this.Je=Qi(),this.Ye=Te(),this.Ze=Qi(),this.Xe=new he(G)}et(e){for(const t of e.Se)e.De&&e.De.isFoundDocument()?this.tt(t,e.De):this.nt(t,e.key,e.De);for(const t of e.removedTargetIds)this.nt(t,e.key,e.De)}rt(e){this.forEachTarget(e,(t=>{const n=this.je.get(t);if(n)switch(e.state){case 0:this.it(t)&&n.Ue(e.resumeToken);break;case 1:n.Qe(),n.Le||n.qe(),n.Ue(e.resumeToken);break;case 2:n.Qe(),n.Le||this.removeTarget(t);break;case 3:this.it(t)&&(n.Ge(),n.Ue(e.resumeToken));break;case 4:this.it(t)&&(this.st(t),n.Ue(e.resumeToken));break;default:B(56790,{state:e.state})}else D(ms,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.je.forEach(((n,s)=>{this.it(s)&&t(s)}))}_t(e){var t;return tn(e)?e.getPipelineSourceType()==="documents"&&((t=e.getPipelineDocuments())==null?void 0:t.length)===1:pc(e)}ot(e){const t=e.targetId,n=e.xe.count,s=this.ut(t);if(s){const i=s.target;if(this._t(i))if(n===0){const o=new F(tn(i)?ee.fromString(i.getPipelineDocuments()[0]):i.path);this.nt(t,o,pe.newNoDocument(o,q.min()))}else N(n===1,20013,"Single document existence filter with count: "+n);else{const o=this.ct(t);if(o!==n){const u=this.lt(e),c=u?this.Et(u,e,o):1;if(c!==0){this.st(t);const h=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Xe=this.Xe.insert(t,h)}}}}}lt(e){const t=e.xe.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:n="",padding:s=0},hashCount:i=0}=t;let o,u;try{o=Ot(n).toUint8Array()}catch(c){if(c instanceof gp)return at("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{u=new gc(o,s,i)}catch(c){return at(c instanceof As?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return u.ge===0?null:u}Et(e,t,n){return t.xe.count===n-this.Pt(e,t.targetId)?0:2}Pt(e,t){const n=this.ze.getRemoteKeysForTarget(t);let s=0;return n.forEach((i=>{const o=this.ze.Tt(),u=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(u)||(this.nt(t,i,null),s++)})),s}Rt(e){const t=new Map;this.je.forEach(((i,o)=>{const u=this.ut(o);if(u){if(i.current&&this._t(u.target)){const c=tn(u.target)?ee.fromString(u.target.getPipelineDocuments()[0]):u.target.path,h=new F(c);this.It(h).has(o)||this.At(o,h)||this.nt(o,h,pe.newNoDocument(h,e))}i.Be&&(t.set(o,i.ke()),i.qe())}}));let n=Q();this.Ze.forEach(((i,o)=>{let u=!0;o.forEachWhile((c=>{const h=this.ut(c);return!h||h.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)})),u&&(n=n.add(i))})),this.He.forEach(((i,o)=>o.setReadTime(e))),this.Ye.forEach(((i,o)=>o.setReadTime(e)));const s=new Ti(e,t,this.Xe,this.He,this.Ye,n);return this.He=Te(),this.Je=Qi(),this.Ye=Te(),this.Ze=Qi(),this.Xe=new he(G),s}tt(e,t){const n=this.je.get(e);if(!n||!this.it(e))return void D(ms,`addDocumentToTarget received document for unknown inactive target (${e})`);const s=this.At(e,t.key)?2:0;n.$e(t.key,s),tn(this.ut(e).target)&&this.ut(e).target.getPipelineFlavor()!=="exact"?this.Ye=this.Ye.insert(t.key,t):this.He=this.He.insert(t.key,t),this.Je=this.Je.insert(t.key,this.It(t.key).add(e)),this.Ze=this.Ze.insert(t.key,this.Vt(t.key).add(e))}nt(e,t,n){const s=this.je.get(e);s&&this.it(e)?(this.At(e,t)?s.$e(t,1):s.Ke(t),this.Ze=this.Ze.insert(t,this.Vt(t).delete(e)),this.Ze=this.Ze.insert(t,this.Vt(t).add(e)),n&&(tn(this.ut(e).target)&&this.ut(e).target.getPipelineFlavor()!=="exact"?this.Ye=this.Ye.insert(t,n):this.He=this.He.insert(t,n))):D(ms,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.je.delete(e)}ct(e){const t=this.je.get(e);if(!t)return 0;const n=t.ke();return this.ze.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}We(e){let t=this.je.get(e);t||(D(ms,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new Zh(e),this.je.set(e,t)),t.We()}Vt(e){let t=this.Ze.get(e);return t||(t=new re(G),this.Ze=this.Ze.insert(e,t)),t}It(e){let t=this.Je.get(e);return t||(t=new re(G),this.Je=this.Je.insert(e,t)),t}it(e){const t=this.ut(e)!==null;return t||D(ms,"Detected inactive target",e),t}ut(e){const t=this.je.get(e);return t===void 0||t.Le?null:this.ze.dt(e)}st(e){this.je.set(e,new Zh(e)),this.ze.getRemoteKeysForTarget(e).forEach((t=>{this.nt(e,t,null)}))}At(e,t){return this.ze.getRemoteKeysForTarget(e).has(t)}}function Qi(){return new he(F.comparator)}function ed(){return new he(F.comparator)}const aw={asc:"ASCENDING",desc:"DESCENDING"},uw={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},cw={and:"AND",or:"OR"};class lw{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function wu(r,e){return r.useProto3Json||Jo(e)?e:{value:e}}function Br(r,e){return r.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function _c(r){const e=kt(r);return new se(e.seconds,e.nanos)}function Kp(r,e){return r.useProto3Json?e.toBase64():e.toUint8Array()}function po(r,e){return Br(r,e.toTimestamp())}function $e(r){return N(!!r,49232),q.fromTimestamp(_c(r))}function yc(r,e){return vu(r,e).canonicalString()}function vu(r,e){const t=(function(s){return new ee(["projects",s.projectId,"databases",s.database])})(r).child("documents");return e===void 0?t:t.child(e)}function Gp(r){const e=ee.fromString(r);return N(nm(e),10190,{key:e.toString()}),e}function Zs(r,e){return yc(r.databaseId,e.path)}function qn(r,e){const t=Gp(e);if(t.get(1)!==r.databaseId.projectId)throw new U(x.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+r.databaseId.projectId);if(t.get(3)!==r.databaseId.database)throw new U(x.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+r.databaseId.database);return new F(Qp(t))}function Hp(r,e){return yc(r.databaseId,e)}function Wp(r){const e=Gp(r);return e.length===4?ee.emptyPath():Qp(e)}function Au(r){return new ee(["projects",r.databaseId.projectId,"databases",r.databaseId.database]).canonicalString()}function Qp(r){return N(r.length>4&&r.get(4)==="documents",29091,{key:r.toString()}),r.popFirst(5)}function td(r,e,t){return{name:Zs(r,e),fields:t.value.mapValue.fields}}function hw(r,e,t){const n=qn(r,e.name),s=$e(e.updateTime),i=e.createTime?$e(e.createTime):q.min(),o=new qe({mapValue:{fields:e.fields}}),u=pe.newFoundDocument(n,s,i,o);return t&&u.setHasCommittedMutations(),t?u.setHasCommittedMutations():u}function dw(r,e){let t;if("targetChange"in e){e.targetChange;const n=(function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:B(39313,{state:h})})(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=(function(h,f){return h.useProto3Json?(N(f===void 0||typeof f=="string",58123),de.fromBase64String(f||"")):(N(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),de.fromUint8Array(f||new Uint8Array))})(r,e.targetChange.resumeToken),o=e.targetChange.cause,u=o&&(function(h){const f=h.code===void 0?x.UNKNOWN:Fp(h.code);return new U(f,h.message||"")})(o);t=new zp(n,s,i,u||null)}else if("documentChange"in e){e.documentChange;const n=e.documentChange;n.document,n.document.name,n.document.updateTime;const s=qn(r,n.document.name),i=$e(n.document.updateTime),o=n.document.createTime?$e(n.document.createTime):q.min(),u=new qe({mapValue:{fields:n.document.fields}}),c=pe.newFoundDocument(s,i,o,u),h=n.targetIds||[],f=n.removedTargetIds||[];t=new fo(h,f,c.key,c)}else if("documentDelete"in e){e.documentDelete;const n=e.documentDelete;n.document;const s=qn(r,n.document),i=n.readTime?$e(n.readTime):q.min(),o=pe.newNoDocument(s,i),u=n.removedTargetIds||[];t=new fo([],u,o.key,o)}else if("documentRemove"in e){e.documentRemove;const n=e.documentRemove;n.document;const s=qn(r,n.document),i=n.removedTargetIds||[];t=new fo([],i,s,null)}else{if(!("filter"in e))return B(11601,{ft:e});{e.filter;const n=e.filter;n.targetId;const{count:s=0,unchangedNames:i}=n,o=new JT(s,i),u=n.targetId;t=new jp(u,o)}}return t}function ko(r,e){let t;if(e instanceof Wr)t={update:td(r,e.key,e.value)};else if(e instanceof hc)t={delete:Zs(r,e.key)};else if(e instanceof wn)t={update:td(r,e.key,e.data),updateMask:yw(e.fieldMask)};else{if(!(e instanceof xp))return B(16599,{gt:e.type});t={verify:Zs(r,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((n=>(function(i,o){const u=o.transform;if(u instanceof Ys)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(u instanceof Or)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:u.elements}};if(u instanceof Lr)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:u.elements}};if(u instanceof Mr)return{fieldPath:o.field.canonicalString(),increment:u.Re};if(u instanceof Js)return{fieldPath:o.field.canonicalString(),minimum:u.Re};if(u instanceof Xs)return{fieldPath:o.field.canonicalString(),maximum:u.Re};throw B(20930,{transform:o.transform})})(0,n)))),e.precondition.isNone||(t.currentDocument=(function(s,i){return i.updateTime!==void 0?{updateTime:po(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:B(27497)})(r,e.precondition)),t}function Ru(r,e){const t=e.currentDocument?(function(i){return i.updateTime!==void 0?Ze.updateTime($e(i.updateTime)):i.exists!==void 0?Ze.exists(i.exists):Ze.none()})(e.currentDocument):Ze.none(),n=e.updateTransforms?e.updateTransforms.map((s=>(function(o,u){let c=null;if("setToServerValue"in u)N(u.setToServerValue==="REQUEST_TIME",16630,{proto:u}),c=new Ys;else if("appendMissingElements"in u){const f=u.appendMissingElements.values||[];c=new Or(f)}else if("removeAllFromArray"in u){const f=u.removeAllFromArray.values||[];c=new Lr(f)}else"increment"in u?c=new Mr(o,u.increment):"minimum"in u?c=new Js(o,u.minimum):"maximum"in u?c=new Xs(o,u.maximum):B(16584,{proto:u});const h=le.fromServerFormat(u.fieldPath);return new DT(h,c)})(r,s))):[];if(e.update){e.update.name;const s=qn(r,e.update.name),i=new qe({mapValue:{fields:e.update.fields}});if(e.updateMask){const o=(function(c){const h=c.fieldPaths||[];return new it(h.map((f=>le.fromServerFormat(f))))})(e.updateMask);return new wn(s,i,o,t,n)}return new Wr(s,i,t,n)}if(e.delete){const s=qn(r,e.delete);return new hc(s,t)}if(e.verify){const s=qn(r,e.verify);return new xp(s,t)}return B(1463,{proto:e})}function fw(r,e){return r&&r.length>0?(N(e!==void 0,14353),r.map((t=>(function(s,i){let o=s.updateTime?$e(s.updateTime):$e(i);return o.isEqual(q.min())&&(o=$e(i)),new kT(o,s.transformResults||[])})(t,e)))):[]}function Yp(r,e){return{documents:[Hp(r,e.path)]}}function Jp(r,e){const t={structuredQuery:{}},n=e.path;let s;e.collectionGroup!==null?(s=n,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=n.popLast(),t.structuredQuery.from=[{collectionId:n.lastSegment()}]),t.parent=Hp(r,s);const i=(function(h){if(h.length!==0)return tm(ie.create(h,"and"))})(e.filters);i&&(t.structuredQuery.where=i);const o=(function(h){if(h.length!==0)return h.map((f=>(function(_){return{field:_r(_.field),direction:mw(_.dir)}})(f)))})(e.orderBy);o&&(t.structuredQuery.orderBy=o);const u=wu(r,e.limit);return u!==null&&(t.structuredQuery.limit=u),e.startAt&&(t.structuredQuery.startAt=(function(h){return{before:h.inclusive,values:h.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(h){return{before:!h.inclusive,values:h.position}})(e.endAt)),{yt:t,parent:s}}function Xp(r){let e=Wp(r.parent);const t=r.structuredQuery,n=t.from?t.from.length:0;let s=null;if(n>0){N(n===1,65062);const f=t.from[0];f.allDescendants?s=f.collectionId:e=e.child(f.collectionId)}let i=[];t.where&&(i=(function(p){const _=em(p);return _ instanceof ie&&dc(_)?_.getFilters():[_]})(t.where));let o=[];t.orderBy&&(o=(function(p){return p.map((_=>(function(V){return new xo(yr(V.field),(function(M){switch(M){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(V.direction))})(_)))})(t.orderBy));let u=null;t.limit&&(u=(function(p){let _;return _=typeof p=="object"?p.value:p,Jo(_)?null:_})(t.limit));let c=null;t.startAt&&(c=(function(p){const _=!!p.before,P=p.values||[];return new Ur(P,_)})(t.startAt));let h=null;return t.endAt&&(h=(function(p){const _=!p.before,P=p.values||[];return new Ur(P,_)})(t.endAt)),KT(e,s,o,i,u,"F",c,h)}function pw(r,e){const t=(function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return B(28987,{purpose:s})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Zp(r,e){return{structuredPipeline:{pipeline:{stages:e.stages.map((t=>t._toProto(r)))}}}}function em(r){return r.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const n=yr(t.unaryFilter.field);return X.create(n,"==",{doubleValue:NaN});case"IS_NULL":const s=yr(t.unaryFilter.field);return X.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=yr(t.unaryFilter.field);return X.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=yr(t.unaryFilter.field);return X.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return B(61313);default:return B(60726)}})(r):r.fieldFilter!==void 0?(function(t){return X.create(yr(t.fieldFilter.field),(function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return B(58110);default:return B(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(r):r.compositeFilter!==void 0?(function(t){return ie.create(t.compositeFilter.filters.map((n=>em(n))),(function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return B(1026)}})(t.compositeFilter.op))})(r):B(30097,{filter:r})}function mw(r){return aw[r]}function gw(r){return uw[r]}function _w(r){return cw[r]}function _r(r){return{fieldPath:r.canonicalString()}}function yr(r){return le.fromServerFormat(r.fieldPath)}function tm(r){return r instanceof X?(function(t){if(t.op==="=="){if(He(t.value))return{unaryFilter:{field:_r(t.field),op:"IS_NAN"}};if(Xe(t.value))return{unaryFilter:{field:_r(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(He(t.value))return{unaryFilter:{field:_r(t.field),op:"IS_NOT_NAN"}};if(Xe(t.value))return{unaryFilter:{field:_r(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:_r(t.field),op:gw(t.op),value:t.value}}})(r):r instanceof ie?(function(t){const n=t.getFilters().map((s=>tm(s)));return n.length===1?n[0]:{compositeFilter:{op:_w(t.op),filters:n}}})(r):B(54877,{filter:r})}function yw(r){const e=[];return r.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function nm(r){return r.length>=4&&r.get(0)==="projects"&&r.get(2)==="databases"}function rm(r){return!!r&&typeof r._toProto=="function"&&r._protoValueType==="ProtoValue"}function ei(r,e){const t={fields:{}};return e.forEach(((n,s)=>{if(typeof s!="string")throw new Error(`Cannot encode map with non-string key: ${s}`);t.fields[s]=n._toProto(r)})),{mapValue:t}}function sm(r){return{stringValue:r}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aa(r){return new lw(r,!0)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rt{constructor(e){this._byteString=e}static fromBase64String(e){try{return new rt(de.fromBase64String(e))}catch(t){throw new U(x.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new rt(de.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:rt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(_i(e,rt._jsonSchema))return rt.fromBase64String(e.bytes)}}rt._jsonSchemaVersion="firestore/bytes/1.0",rt._jsonSchema={type:_e("string",rt._jsonSchemaVersion),bytes:_e("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ic{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new U(x.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new le(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function Iw(){return new Ic(br)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class im{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new U(x.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new U(x.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return G(this._lat,e._lat)||G(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:wt._jsonSchemaVersion}}static fromJSON(e){if(_i(e,wt._jsonSchema))return new wt(e.latitude,e.longitude)}}function om(r){const e={};return r.timeoutSeconds!==void 0&&(e.timeoutSeconds=r.timeoutSeconds),e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */wt._jsonSchemaVersion="firestore/geoPoint/1.0",wt._jsonSchema={type:_e("string",wt._jsonSchemaVersion),latitude:_e("number"),longitude:_e("number")};class Ew{bt(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nd="ConnectivityMonitor";class rd{constructor(){this.vt=()=>this.St(),this.Dt=()=>this.xt(),this.Ct=[],this.Ft()}bt(e){this.Ct.push(e)}shutdown(){window.removeEventListener("online",this.vt),window.removeEventListener("offline",this.Dt)}Ft(){window.addEventListener("online",this.vt),window.addEventListener("offline",this.Dt)}St(){D(nd,"Network connectivity changed: AVAILABLE");for(const e of this.Ct)e(0)}xt(){D(nd,"Network connectivity changed: UNAVAILABLE");for(const e of this.Ct)e(1)}static C(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Yi=null;function Pu(){return Yi===null?Yi=(function(){return 268435456+Math.round(2147483648*Math.random())})():Yi++,"0x"+Yi.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ya="RestConnection",Tw={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class ww{get Ot(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Mt=t+"://"+e.host,this.Nt=`projects/${n}/databases/${s}`,this.Lt=this.databaseId.database===Ws?`project_id=${n}`:`project_id=${n}&database_id=${s}`}Bt(e,t,n,s,i){const o=Pu(),u=this.Ut(e,t.toUriEncodedString());D(Ya,`Sending RPC '${e}' ${o}:`,u,n);const c={"google-cloud-resource-prefix":this.Nt,"x-goog-request-params":this.Lt};this.kt(c,s,i);const{host:h}=new URL(u),f=yn(h);return this.qt(e,u,c,n,f).then((p=>(D(Ya,`Received RPC '${e}' ${o}: `,p),p)),(p=>{throw at(Ya,`RPC '${e}' ${o} failed with error: `,p,"url: ",u,"request:",n),p}))}$t(e,t,n,s,i,o){return this.Bt(e,t,n,s,i)}kt(e,t,n){e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+Hr})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((s,i)=>e[i]=s)),n&&n.headers.forEach(((s,i)=>e[i]=s))}Ut(e,t){const n=Tw[e];let s=`${this.Mt}/v1/${t}:${n}`;return this.databaseInfo.apiKey&&(s=`${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),s}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vw{constructor(e){this.Kt=e.Kt,this.Wt=e.Wt}Qt(e){this.Gt=e}zt(e){this.jt=e}Ht(e){this.Jt=e}onMessage(e){this.Yt=e}close(){this.Wt()}send(e){this.Kt(e)}Zt(){this.Gt()}Xt(){this.jt()}en(e){this.Jt(e)}tn(e){this.Yt(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const De="WebChannelConnection",gs=(r,e,t)=>{r.listen(e,(n=>{try{t(n)}catch(s){setTimeout((()=>{throw s}),0)}}))};class Ar extends ww{constructor(e){super(e),this.nn=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static rn(){if(!Ar.sn){const e=Yf();gs(e,Qf.STAT_EVENT,(t=>{t.stat===cu.PROXY?D(De,"STAT_EVENT: detected buffering proxy"):t.stat===cu.NOPROXY&&D(De,"STAT_EVENT: detected no buffering proxy")})),Ar.sn=!0}}qt(e,t,n,s,i){const o=Pu();return new Promise(((u,c)=>{const h=new Hf;h.setWithCredentials(!0),h.listenOnce(Wf.COMPLETE,(()=>{try{switch(h.getLastErrorCode()){case oo.NO_ERROR:const p=h.getResponseJson();D(De,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(p)),u(p);break;case oo.TIMEOUT:D(De,`RPC '${e}' ${o} timed out`),c(new U(x.DEADLINE_EXCEEDED,"Request time out"));break;case oo.HTTP_ERROR:const _=h.getStatus();if(D(De,`RPC '${e}' ${o} failed with status:`,_,"response text:",h.getResponseText()),_>0){let P=h.getResponseJson();Array.isArray(P)&&(P=P[0]);const V=P==null?void 0:P.error;if(V&&V.status&&V.message){const O=(function(z){const K=z.toLowerCase().replace(/_/g,"-");return Object.values(x).indexOf(K)>=0?K:x.UNKNOWN})(V.status);c(new U(O,V.message))}else c(new U(x.UNKNOWN,"Server responded with status "+h.getStatus()))}else c(new U(x.UNAVAILABLE,"Connection failed."));break;default:B(9055,{_n:e,streamId:o,an:h.getLastErrorCode(),un:h.getLastError()})}}finally{D(De,`RPC '${e}' ${o} completed.`)}}));const f=JSON.stringify(s);D(De,`RPC '${e}' ${o} sending request:`,s),h.send(t,"POST",f,n,15)}))}cn(e,t,n){const s=Pu(),i=[this.Mt,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=this.createWebChannelTransport(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},c=this.longPollingOptions.timeoutSeconds;c!==void 0&&(u.longPollingTimeout=Math.round(1e3*c)),this.useFetchStreams&&(u.useFetchStreams=!0),this.kt(u.initMessageHeaders,t,n),u.encodeInitMessageHeaders=!0;const h=i.join("");D(De,`Creating RPC '${e}' stream ${s}: ${h}`,u);const f=o.createWebChannel(h,u);this.En(f);let p=!1,_=!1;const P=new vw({Kt:V=>{_?D(De,`Not sending because RPC '${e}' stream ${s} is closed:`,V):(p||(D(De,`Opening RPC '${e}' stream ${s} transport.`),f.open(),p=!0),D(De,`RPC '${e}' stream ${s} sending:`,V),f.send(V))},Wt:()=>f.close()});return gs(f,vs.EventType.OPEN,(()=>{_||(D(De,`RPC '${e}' stream ${s} transport opened.`),P.Zt())})),gs(f,vs.EventType.CLOSE,(()=>{_||(_=!0,D(De,`RPC '${e}' stream ${s} transport closed`),P.en(),this.hn(f))})),gs(f,vs.EventType.ERROR,(V=>{_||(_=!0,at(De,`RPC '${e}' stream ${s} transport errored. Name:`,V.name,"Message:",V.message),P.en(new U(x.UNAVAILABLE,"The operation could not be completed")))})),gs(f,vs.EventType.MESSAGE,(V=>{var O;if(!_){const M=V.data[0];N(!!M,16349);const z=M,K=(z==null?void 0:z.error)||((O=z[0])==null?void 0:O.error);if(K){D(De,`RPC '${e}' stream ${s} received error:`,K);const H=K.status;let ue=(function(T){const g=me[T];if(g!==void 0)return Fp(g)})(H),te=K.message;H==="NOT_FOUND"&&te.includes("database")&&te.includes("does not exist")&&te.includes(this.databaseId.database)&&at(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),ue===void 0&&(ue=x.INTERNAL,te="Unknown error status: "+H+" with message "+K.message),_=!0,P.en(new U(ue,te)),f.close()}else D(De,`RPC '${e}' stream ${s} received:`,M),P.tn(M)}})),Ar.rn(),setTimeout((()=>{P.Xt()}),0),P}terminate(){this.nn.forEach((e=>e.close())),this.nn=[]}En(e){this.nn.push(e)}hn(e){this.nn=this.nn.filter((t=>t===e))}kt(e,t,n){super.kt(e,t,n),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return Jf()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Aw(r){return new Ar(r)}Ar.sn=!1;class am{constructor(e,t,n=1e3,s=1.5,i=6e4){this.Tn=e,this.timerId=t,this.Pn=n,this.Rn=s,this.In=i,this.An=0,this.Vn=null,this.dn=Date.now(),this.reset()}reset(){this.An=0}fn(){this.An=this.In}mn(e){this.cancel();const t=Math.floor(this.An+this.pn()),n=Math.max(0,Date.now()-this.dn),s=Math.max(0,t-n);s>0&&D("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.An} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`),this.Vn=this.Tn.enqueueAfterDelay(this.timerId,s,(()=>(this.dn=Date.now(),e()))),this.An*=this.Rn,this.An<this.Pn&&(this.An=this.Pn),this.An>this.In&&(this.An=this.In)}gn(){this.Vn!==null&&(this.Vn.skipDelay(),this.Vn=null)}cancel(){this.Vn!==null&&(this.Vn.cancel(),this.Vn=null)}pn(){return(Math.random()-.5)*this.An}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sd="PersistentStream";class um{constructor(e,t,n,s,i,o,u,c){this.Tn=e,this.yn=n,this.wn=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=u,this.listener=c,this.state=0,this.bn=0,this.vn=null,this.Sn=null,this.stream=null,this.Dn=0,this.xn=new am(e,t)}Cn(){return this.state===1||this.state===5||this.Fn()}Fn(){return this.state===2||this.state===3}start(){this.Dn=0,this.state!==4?this.auth():this.On()}async stop(){this.Cn()&&await this.close(0)}Mn(){this.state=0,this.xn.reset()}Nn(){this.Fn()&&this.vn===null&&(this.vn=this.Tn.enqueueAfterDelay(this.yn,6e4,(()=>this.Ln())))}Bn(e){this.Un(),this.stream.send(e)}async Ln(){if(this.Fn())return this.close(0)}Un(){this.vn&&(this.vn.cancel(),this.vn=null)}kn(){this.Sn&&(this.Sn.cancel(),this.Sn=null)}async close(e,t){this.Un(),this.kn(),this.xn.cancel(),this.bn++,e!==4?this.xn.reset():t&&t.code===x.RESOURCE_EXHAUSTED?(Be(t.toString()),Be("Using maximum backoff delay to prevent overloading the backend."),this.xn.fn()):t&&t.code===x.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.qn(),this.stream.close(),this.stream=null),this.state=e,await this.listener.Ht(t)}qn(){}auth(){this.state=1;const e=this.$n(this.bn),t=this.bn;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([n,s])=>{this.bn===t&&this.Kn(n,s)}),(n=>{e((()=>{const s=new U(x.UNKNOWN,"Fetching auth token failed: "+n.message);return this.Wn(s)}))}))}Kn(e,t){const n=this.$n(this.bn);this.stream=this.Qn(e,t),this.stream.Qt((()=>{n((()=>this.listener.Qt()))})),this.stream.zt((()=>{n((()=>(this.state=2,this.Sn=this.Tn.enqueueAfterDelay(this.wn,1e4,(()=>(this.Fn()&&(this.state=3),Promise.resolve()))),this.listener.zt())))})),this.stream.Ht((s=>{n((()=>this.Wn(s)))})),this.stream.onMessage((s=>{n((()=>++this.Dn==1?this.Gn(s):this.onNext(s)))}))}On(){this.state=5,this.xn.mn((async()=>{this.state=0,this.start()}))}Wn(e){return D(sd,`close with error: ${e}`),this.stream=null,this.close(4,e)}$n(e){return t=>{this.Tn.enqueueAndForget((()=>this.bn===e?t():(D(sd,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class Rw extends um{constructor(e,t,n,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,n,s,o),this.serializer=i}Qn(e,t){return this.connection.cn("Listen",e,t)}Gn(e){return this.onNext(e)}onNext(e){this.xn.reset();const t=dw(this.serializer,e),n=(function(i){if(!("targetChange"in i))return q.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?q.min():o.readTime?$e(o.readTime):q.min()})(e);return this.listener.zn(t,n)}jn(e){const t={};t.database=Au(this.serializer),t.addTarget=(function(i,o){let u;const c=o.target;if(u=tn(c)?{pipelineQuery:Zp(i,c)}:pc(c)?{documents:Yp(i,c)}:{query:Jp(i,c).yt},u.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){u.resumeToken=Kp(i,o.resumeToken);const h=wu(i,o.expectedCount);h!==null&&(u.expectedCount=h)}else if(o.snapshotVersion.compareTo(q.min())>0){u.readTime=Br(i,o.snapshotVersion.toTimestamp());const h=wu(i,o.expectedCount);h!==null&&(u.expectedCount=h)}return u})(this.serializer,e);const n=pw(this.serializer,e);n&&(t.labels=n),this.Bn(t)}Hn(e){const t={};t.database=Au(this.serializer),t.removeTarget=e,this.Bn(t)}}class Pw extends um{constructor(e,t,n,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,n,s,o),this.serializer=i}get Jn(){return this.Dn>0}start(){this.lastStreamToken=void 0,super.start()}qn(){this.Jn&&this.Yn([])}Qn(e,t){return this.connection.cn("Write",e,t)}Gn(e){return N(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,N(!e.writeResults||e.writeResults.length===0,55816),this.listener.Zn()}onNext(e){N(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.xn.reset();const t=fw(e.writeResults,e.commitTime),n=$e(e.commitTime);return this.listener.Xn(n,t)}er(){const e={};e.database=Au(this.serializer),this.Bn(e)}Yn(e){const t={streamToken:this.lastStreamToken,writes:e.map((n=>ko(this.serializer,n)))};this.Bn(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bw{}class Sw extends bw{constructor(e,t,n,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=n,this.serializer=s,this.tr=!1}nr(){if(this.tr)throw new U(x.FAILED_PRECONDITION,"The client has already been terminated.")}Bt(e,t,n,s){return this.nr(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([i,o])=>this.connection.Bt(e,vu(t,n),s,i,o))).catch((i=>{throw i.name==="FirebaseError"?(i.code===x.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new U(x.UNKNOWN,i.toString())}))}$t(e,t,n,s,i){return this.nr(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([o,u])=>this.connection.$t(e,vu(t,n),s,o,u,i))).catch((o=>{throw o.name==="FirebaseError"?(o.code===x.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new U(x.UNKNOWN,o.toString())}))}terminate(){this.tr=!0,this.connection.terminate()}}function Vw(r,e,t,n){return new Sw(r,e,t,n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cw="ComponentProvider",id=new Map;function xw(r,e,t,n,s){return new PT(r,e,t,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,om(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,n)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const od={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},cm=41943040;class Ne{static withCacheSize(e){return new Ne(e,Ne.DEFAULT_COLLECTION_PERCENTILE,Ne.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,n){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=n}}Ne.DEFAULT_COLLECTION_PERCENTILE=10,Ne.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Ne.DEFAULT=new Ne(cm,Ne.DEFAULT_COLLECTION_PERCENTILE,Ne.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Ne.DISABLED=new Ne(-1,0,0);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ad="LruGarbageCollector",lm=1048576;function ud([r,e],[t,n]){const s=G(r,t);return s===0?G(e,n):s}class Dw{constructor(e){this.rr=e,this.buffer=new re(ud),this.ir=0}sr(){return++this.ir}_r(e){const t=[e,this.sr()];if(this.buffer.size<this.rr)this.buffer=this.buffer.add(t);else{const n=this.buffer.last();ud(t,n)<0&&(this.buffer=this.buffer.delete(n).add(t))}}get maxValue(){return this.buffer.last()[0]}}class hm{constructor(e,t,n){this.garbageCollector=e,this.asyncQueue=t,this.localStore=n,this.ar=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.ur(6e4)}stop(){this.ar&&(this.ar.cancel(),this.ar=null)}get started(){return this.ar!==null}ur(e){D(ad,`Garbage collection scheduled in ${e}ms`),this.ar=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.ar=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){Tn(t)?D(ad,"Ignoring IndexedDB error during garbage collection: ",t):await er(t)}await this.ur(3e5)}))}}class Nw{constructor(e,t){this.cr=e,this.params=t}calculateTargetCount(e,t){return this.cr.lr(e).next((n=>Math.floor(t/100*n)))}nthSequenceNumber(e,t){if(t===0)return A.resolve(st.ce);const n=new Dw(t);return this.cr.forEachTarget(e,(s=>n._r(s.sequenceNumber))).next((()=>this.cr.Er(e,(s=>n._r(s))))).next((()=>n.maxValue))}removeTargets(e,t,n){return this.cr.removeTargets(e,t,n)}removeOrphanedDocuments(e,t){return this.cr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(D("LruGarbageCollector","Garbage collection skipped; disabled"),A.resolve(od)):this.getCacheSize(e).next((n=>n<this.params.cacheSizeCollectionThreshold?(D("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),od):this.hr(e,t)))}getCacheSize(e){return this.cr.getCacheSize(e)}hr(e,t){let n,s,i,o,u,c,h;const f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((p=>(p>this.params.maximumSequenceNumbersToCollect?(D("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),s=this.params.maximumSequenceNumbersToCollect):s=p,o=Date.now(),this.nthSequenceNumber(e,s)))).next((p=>(n=p,u=Date.now(),this.removeTargets(e,n,t)))).next((p=>(i=p,c=Date.now(),this.removeOrphanedDocuments(e,n)))).next((p=>(h=Date.now(),mr()<=J.DEBUG&&D("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-f}ms
	Determined least recently used ${s} in `+(u-o)+`ms
	Removed ${i} targets in `+(c-u)+`ms
	Removed ${p} documents in `+(h-c)+`ms
Total Duration: ${h-f}ms`),A.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:p}))))}}function dm(r,e){return new Nw(r,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fm="firestore.googleapis.com",cd=!0;class ld{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new U(x.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=fm,this.ssl=cd}else this.host=e.host,this.ssl=e.ssl??cd;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=cm;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<lm)throw new U(x.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}zE("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=om(e.experimentalLongPollingOptions??{}),(function(n){if(n.timeoutSeconds!==void 0){if(isNaN(n.timeoutSeconds))throw new U(x.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (must not be NaN)`);if(n.timeoutSeconds<5)throw new U(x.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (minimum allowed value is 5)`);if(n.timeoutSeconds>30)throw new U(x.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(n,s){return n.timeoutSeconds===s.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Ec{constructor(e,t,n,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=n,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new ld({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new U(x.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new U(x.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new ld(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(n){if(!n)return new NE;switch(n.type){case"firstParty":return new ME(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new U(x.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const n=id.get(t);n&&(D(Cw,"Removing Datastore"),id.delete(t),n.terminate())})(this),Promise.resolve()}}function kw(r,e,t,n={}){var h;r=Ct(r,Ec);const s=yn(e),i=r._getSettings(),o={...i,emulatorOptions:r._getEmulatorOptions()},u=`${e}:${t}`;s&&Go(`https://${u}`),i.host!==fm&&i.host!==u&&at("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const c={...i,host:u,ssl:s,emulatorOptions:n};if(!ln(c,o)&&(r._setSettings(c),n.mockUserToken)){let f,p;if(typeof n.mockUserToken=="string")f=n.mockUserToken,p=be.MOCK_USER;else{f=u_(n.mockUserToken,(h=r._app)==null?void 0:h.options.projectId);const _=n.mockUserToken.sub||n.mockUserToken.user_id;if(!_)throw new U(x.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new be(_)}r._authCredentials=new kE(new Zf(f,p))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ua{constructor(e,t,n){this.converter=t,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new ua(this.firestore,e,this._query)}}class ye{constructor(e,t,n){this.converter=t,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new ti(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new ye(this.firestore,e,this._key)}toJSON(){return{type:ye._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,n){if(_i(t,ye._jsonSchema))return new ye(e,n||null,new F(ee.fromString(t.referencePath)))}}ye._jsonSchemaVersion="firestore/documentReference/1.0",ye._jsonSchema={type:_e("string",ye._jsonSchemaVersion),referencePath:_e("string")};class ti extends ua{constructor(e,t,n){super(e,t,Ei(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new ye(this.firestore,null,new F(e))}withConverter(e){return new ti(this.firestore,e,this._path)}}function RP(r,e,...t){if(r=Ve(r),arguments.length===1&&(e=Ju.newId()),jE("doc","path",e),r instanceof Ec){const n=ee.fromString(e,...t);return Ch(n),new ye(r,null,new F(n))}{if(!(r instanceof ye||r instanceof ti))throw new U(x.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(ee.fromString(e,...t));return Ch(n),new ye(r.firestore,r instanceof ti?r.converter:null,new F(n))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ke{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(n,s){if(n.length!==s.length)return!1;for(let i=0;i<n.length;++i)if(n[i]!==s[i])return!1;return!0})(this._values,e._values)}toJSON(){return{type:Ke._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(_i(e,Ke._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new Ke(e.vectorValues);throw new U(x.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Ke._jsonSchemaVersion="firestore/vectorValue/1.0",Ke._jsonSchema={type:_e("string",Ke._jsonSchemaVersion),vectorValues:_e("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ow=/^__.*__$/;class Lw{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return this.fieldMask!==null?new wn(e,this.data,this.fieldMask,t,this.fieldTransforms):new Wr(e,this.data,t,this.fieldTransforms)}}function pm(r){switch(r){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw B(40011,{dataSource:r})}}class Tc{constructor(e,t,n,s,i,o){this.settings=e,this.databaseId=t,this.serializer=n,this.ignoreUndefinedProperties=s,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new Tc({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var s;const t=(s=this.path)==null?void 0:s.child(e),n=this.contextWith({path:t,arrayElement:!1});return n.validatePathSegment(e),n}childContextForFieldPath(e){var s;const t=(s=this.path)==null?void 0:s.child(e),n=this.contextWith({path:t,arrayElement:!1});return n.validatePath(),n}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Oo(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(pm(this.dataSource)&&Ow.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class Mw{constructor(e,t,n){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=n||aa(e)}createContext(e,t,n,s=!1){return new Tc({dataSource:e,methodName:t,targetDoc:n,path:le.emptyPath(),arrayElement:!1,hasConverter:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Uw(r){const e=r._freezeSettings(),t=aa(r._databaseId);return new Mw(r._databaseId,!!e.ignoreUndefinedProperties,t)}function Fw(r,e,t,n,s,i={}){const o=r.createContext(i.merge||i.mergeFields?2:0,e,t,s);_m("Data must be an object, but it was:",o,n);const u=mm(n,o);let c,h;if(i.merge)c=new it(o.fieldMask),h=o.fieldTransforms;else if(i.mergeFields){const f=[];for(const p of i.mergeFields){const _=vi(e,p,t);if(!o.contains(_))throw new U(x.INVALID_ARGUMENT,`Field '${_}' is specified in your field mask but missing from your input data.`);$w(f,_)||f.push(_)}c=new it(f),h=o.fieldTransforms.filter((p=>c.covers(p.field)))}else c=null,h=o.fieldTransforms;return new Lw(new qe(u),c,h)}function ni(r,e,t){if(gm(r=Ve(r)))return _m("Unsupported field value:",e,r),mm(r,e);if(r instanceof im)return(function(s,i){if(!pm(i.dataSource))throw i.createError(`${s._methodName}() can only be used with update() and set()`);if(!i.path)throw i.createError(`${s._methodName}() is not currently supported inside arrays`);const o=s._toFieldTransform(i);o&&i.fieldTransforms.push(o)})(r,e),null;if(r===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),r instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return(function(s,i){const o=[];let u=0;for(const c of s){let h=ni(c,i.childContextForArray(u));h==null&&(h={nullValue:"NULL_VALUE"}),o.push(h),u++}return{arrayValue:{values:o}}})(r,e)}return(function(s,i,o){if((s=Ve(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return cc(i.serializer,s,o);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const u=se.fromDate(s);return{timestampValue:Br(i.serializer,u)}}if(s instanceof se){const u=new se(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:Br(i.serializer,u)}}if(s instanceof wt)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof rt)return{bytesValue:Kp(i.serializer,s._byteString)};if(s instanceof ye){const u=i.databaseId,c=s.firestore._databaseId;if(!c.isEqual(u))throw i.createError(`Document reference is for database ${c.projectId}/${c.database} but should be for database ${u.projectId}/${u.database}`);return{referenceValue:yc(s.firestore._databaseId||i.databaseId,s._key.path)}}if(s instanceof Ke)return(function(c,h){const f=c instanceof Ke?c.toArray():c;return{mapValue:{fields:{[ic]:{stringValue:oc},[Qn]:{arrayValue:{values:f.map((_=>{if(typeof _!="number")throw h.createError("VectorValues must only contain numeric values.");return na(h.serializer,_)}))}}}}}})(s,i);if(rm(s))return s._toProto(i.serializer);throw i.createError(`Unsupported field value: ${Xu(s)}`)})(r,e,t)}function mm(r,e){const t={};return mp(r)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):tr(r,((n,s)=>{const i=ni(s,e.childContextForField(n));i!=null&&(t[n]=i)})),{mapValue:{fields:t}}}function gm(r){return!(typeof r!="object"||r===null||r instanceof Array||r instanceof Date||r instanceof se||r instanceof wt||r instanceof rt||r instanceof ye||r instanceof im||r instanceof Ke||rm(r))}function _m(r,e,t){if(!gm(t)||!gi(t)){const n=Xu(t);throw n==="an object"?e.createError(r+" a custom object"):e.createError(r+" "+n)}}function vi(r,e,t){if((e=Ve(e))instanceof Ic)return e._internalPath;if(typeof e=="string")return qw(r,e);throw Oo("Field path arguments must be of type string or ",r,!1,void 0,t)}const Bw=new RegExp("[~\\*/\\[\\]]");function qw(r,e,t){if(e.search(Bw)>=0)throw Oo(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,r,!1,void 0,t);try{return new Ic(...e.split("."))._internalPath}catch{throw Oo(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r,!1,void 0,t)}}function Oo(r,e,t,n,s){const i=n&&!n.isEmpty(),o=s!==void 0;let u=`Function ${e}() called with invalid data`;t&&(u+=" (via `toFirestore()`)"),u+=". ";let c="";return(i||o)&&(c+=" (found",i&&(c+=` in field ${n}`),o&&(c+=` in document ${s}`),c+=")"),new U(x.INVALID_ARGUMENT,u+r+c)}function $w(r,e){return r.some((t=>t.isEqual(e)))}function jw(r){return typeof r._readUserData=="function"}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Le{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){const n=qe.empty();for(const s in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(s)){const i=this.optionDefinitions[s];if(s in e){const o=e[s];let u;i.nestedOptions&&gi(o)?u={mapValue:{fields:new Le(i.nestedOptions).getOptionsProto(t,o)}}:o&&(u=ni(o,t)??void 0),u&&n.set(le.fromServerFormat(i.serverName),u)}}return n}getOptionsProto(e,t,n){const s=this._getKnownOptions(t,e);if(n){const i=new Map(AT(n,((o,u)=>[le.fromServerFormat(u),o!==void 0?ni(o,e):null])));s.setAll(i)}return s.value.mapValue.fields??{}}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zw(r){return typeof r=="object"&&r!==null&&!!("nullValue"in r&&(r.nullValue===null||r.nullValue==="NULL_VALUE")||"booleanValue"in r&&(r.booleanValue===null||typeof r.booleanValue=="boolean")||"integerValue"in r&&(r.integerValue===null||typeof r.integerValue=="number"||typeof r.integerValue=="string")||"doubleValue"in r&&(r.doubleValue===null||typeof r.doubleValue=="number")||"timestampValue"in r&&(r.timestampValue===null||(function(t){return typeof t=="object"&&t!==null&&"seconds"in t&&(t.seconds===null||typeof t.seconds=="number"||typeof t.seconds=="string")&&"nanos"in t&&(t.nanos===null||typeof t.nanos=="number")})(r.timestampValue))||"stringValue"in r&&(r.stringValue===null||typeof r.stringValue=="string")||"bytesValue"in r&&(r.bytesValue===null||r.bytesValue instanceof Uint8Array)||"referenceValue"in r&&(r.referenceValue===null||typeof r.referenceValue=="string")||"geoPointValue"in r&&(r.geoPointValue===null||(function(t){return typeof t=="object"&&t!==null&&"latitude"in t&&(t.latitude===null||typeof t.latitude=="number")&&"longitude"in t&&(t.longitude===null||typeof t.longitude=="number")})(r.geoPointValue))||"arrayValue"in r&&(r.arrayValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("values"in t)||t.values!==null&&!Array.isArray(t.values))})(r.arrayValue))||"mapValue"in r&&(r.mapValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("fields"in t)||t.fields!==null&&!gi(t.fields))})(r.mapValue))||"fieldReferenceValue"in r&&(r.fieldReferenceValue===null||typeof r.fieldReferenceValue=="string")||"functionValue"in r&&(r.functionValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("name"in t)||t.name!==null&&typeof t.name!="string"||!("args"in t)||t.args!==null&&!Array.isArray(t.args))})(r.functionValue))||"pipelineValue"in r&&(r.pipelineValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("stages"in t)||t.stages!==null&&!Array.isArray(t.stages))})(r.pipelineValue)))}function Kw(r){return new Ke(r)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function k(r){let e;return r instanceof nr?r:(e=gi(r)?Jw(r):r instanceof Array?Xw(r):ym(r,void 0),e)}function Ja(r){if(r instanceof nr)return r;if(r instanceof Ke)return ri(r);if(Array.isArray(r))return ri(Kw(r));throw new Error("Unsupported value: "+typeof r)}function wc(r){return JE(r)?Ww(r):k(r)}class nr{constructor(){this._protoValueType="ProtoValue"}add(e){return new C("add",[this,k(e)],"add")}asBoolean(){if(this instanceof pn)return this;if(this instanceof rr)return new Em(this);if(this instanceof Qr)return new Yw(this);if(this instanceof C)return new Im(this);throw new U("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new C("subtract",[this,k(e)],"subtract")}multiply(e){return new C("multiply",[this,k(e)],"multiply")}divide(e){return new C("divide",[this,k(e)],"divide")}mod(e){return new C("mod",[this,k(e)],"mod")}equal(e){return new C("equal",[this,k(e)],"equal").asBoolean()}notEqual(e){return new C("not_equal",[this,k(e)],"notEqual").asBoolean()}lessThan(e){return new C("less_than",[this,k(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new C("less_than_or_equal",[this,k(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new C("greater_than",[this,k(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new C("greater_than_or_equal",[this,k(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const n=[e,...t].map((s=>k(s)));return new C("array_concat",[this,...n],"arrayConcat")}arrayContains(e){return new C("array_contains",[this,k(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new Rs(e.map(k),"arrayContainsAll"):e;return new C("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new Rs(e.map(k),"arrayContainsAny"):e;return new C("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new C("array_reverse",[this])}arrayLength(){return new C("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new Rs(e.map(k),"equalAny"):e;return new C("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new Rs(e.map(k),"notEqualAny"):e;return new C("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new C("exists",[this],"exists").asBoolean()}charLength(){return new C("char_length",[this],"charLength")}like(e){return new C("like",[this,k(e)],"like").asBoolean()}regexContains(e){return new C("regex_contains",[this,k(e)],"regexContains").asBoolean()}regexFind(e){return new C("regex_find",[this,k(e)],"regexFind")}regexFindAll(e){return new C("regex_find_all",[this,k(e)],"regexFindAll")}regexMatch(e){return new C("regex_match",[this,k(e)],"regexMatch").asBoolean()}stringContains(e){return new C("string_contains",[this,k(e)],"stringContains").asBoolean()}startsWith(e){return new C("starts_with",[this,k(e)],"startsWith").asBoolean()}endsWith(e){return new C("ends_with",[this,k(e)],"endsWith").asBoolean()}toLower(){return new C("to_lower",[this],"toLower")}toUpper(){return new C("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(k(e)),new C("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(k(e)),new C("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(k(e)),new C("rtrim",t,"rtrim")}type(){return new C("type",[this])}isType(e){return new C("is_type",[this,ri(e)],"isType").asBoolean()}stringConcat(e,...t){const n=[e,...t].map(k);return new C("string_concat",[this,...n],"stringConcat")}stringIndexOf(e){return new C("string_index_of",[this,k(e)],"stringIndexOf")}stringRepeat(e){return new C("string_repeat",[this,k(e)],"stringRepeat")}stringReplaceAll(e,t){return new C("string_replace_all",[this,k(e),k(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new C("string_replace_one",[this,k(e),k(t)],"stringReplaceOne")}concat(e,...t){const n=[e,...t].map(k);return new C("concat",[this,...n],"concat")}reverse(){return new C("reverse",[this],"reverse")}arrayFilter(e,t){return new C("array_filter",[this,k(e),t],"arrayFilter")}arrayTransform(e,t){return new C("array_transform",[this,k(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,n){return new C("array_transform",[this,k(e),k(t),n],"arrayTransformWithIndex")}arraySlice(e,t){const n=[this,k(e)];return t!==void 0&&n.push(k(t)),new C("array_slice",n,"arraySlice")}arrayFirst(){return new C("array_first",[this],"arrayFirst")}arrayFirstN(e){return new C("array_first_n",[this,k(e)],"arrayFirstN")}arrayLast(){return new C("array_last",[this],"arrayLast")}arrayLastN(e){return new C("array_last_n",[this,k(e)],"arrayLastN")}arrayMaximum(){return new C("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new C("maximum_n",[this,k(e)],"arrayMaximumN")}arrayMinimum(){return new C("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new C("minimum_n",[this,k(e)],"arrayMinimumN")}arrayIndexOf(e){return new C("array_index_of",[this,k(e),k("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new C("array_index_of",[this,k(e),k("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new C("array_index_of_all",[this,k(e)],"arrayIndexOfAll")}byteLength(){return new C("byte_length",[this],"byteLength")}ceil(){return new C("ceil",[this])}floor(){return new C("floor",[this])}abs(){return new C("abs",[this])}exp(){return new C("exp",[this])}mapGet(e){return new C("map_get",[this,ri(e)],"mapGet")}mapSet(e,t,...n){const s=[this,k(e),k(t),...n.map(k)];return new C("map_set",s,"mapSet")}mapKeys(){return new C("map_keys",[this],"mapKeys")}mapValues(){return new C("map_values",[this],"mapValues")}mapEntries(){return new C("map_entries",[this],"mapEntries")}getField(e){return new C("get_field",[this,k(e)],"get_field")}count(){return Qe._create("count",[this],"count")}sum(){return Qe._create("sum",[this],"sum")}average(){return Qe._create("average",[this],"average")}minimum(){return Qe._create("minimum",[this],"minimum")}maximum(){return Qe._create("maximum",[this],"maximum")}first(){return Qe._create("first",[this],"first")}last(){return Qe._create("last",[this],"last")}arrayAgg(){return Qe._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return Qe._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return Qe._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const n=[e,...t];return new C("maximum",[this,...n.map(k)],"logicalMaximum")}logicalMinimum(e,...t){const n=[e,...t];return new C("minimum",[this,...n.map(k)],"minimum")}vectorLength(){return new C("vector_length",[this],"vectorLength")}cosineDistance(e){return new C("cosine_distance",[this,Ja(e)],"cosineDistance")}dotProduct(e){return new C("dot_product",[this,Ja(e)],"dotProduct")}euclideanDistance(e){return new C("euclidean_distance",[this,Ja(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new C("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new C("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new C("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new C("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new C("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new C("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new C("timestamp_add",[this,k(e),k(t)],"timestampAdd")}timestampSubtract(e,t){return new C("timestamp_subtract",[this,k(e),k(t)],"timestampSubtract")}timestampDiff(e,t){return new C("timestamp_diff",[this,wc(e),k(t)],"timestampDiff")}timestampExtract(e,t){const n=[this,k(e)];return t&&n.push(k(t)),new C("timestamp_extract",n,"timestampExtract")}documentId(){return new C("document_id",[this],"documentId")}parent(){return new C("parent",[this],"parent")}substring(e,t){const n=k(e);return new C("substring",t===void 0?[this,n]:[this,n,k(t)],"substring")}arrayGet(e){return new C("array_get",[this,k(e)],"arrayGet")}isError(){return new C("is_error",[this],"isError").asBoolean()}ifError(e){const t=new C("if_error",[this,k(e)],"ifError");return e instanceof pn?t.asBoolean():t}isAbsent(){return new C("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new C("map_remove",[this,k(e)],"mapRemove")}mapMerge(e,...t){const n=k(e),s=t.map(k);return new C("map_merge",[this,n,...s],"mapMerge")}pow(e){return new C("pow",[this,k(e)])}trunc(e){return e===void 0?new C("trunc",[this]):new C("trunc",[this,k(e)],"trunc")}round(e){return e===void 0?new C("round",[this]):new C("round",[this,k(e)],"round")}collectionId(){return new C("collection_id",[this])}length(){return new C("length",[this])}ln(){return new C("ln",[this])}sqrt(){return new C("sqrt",[this])}stringReverse(){return new C("string_reverse",[this])}ifAbsent(e){return new C("if_absent",[this,k(e)],"ifAbsent")}ifNull(e){return new C("if_null",[this,k(e)],"ifNull")}coalesce(e,...t){return new C("coalesce",[this,k(e),...t.map(k)],"coalesce")}join(e){return new C("join",[this,k(e)],"join")}log10(){return new C("log10",[this])}arraySum(){return new C("sum",[this])}split(e){return new C("split",[this,k(e)])}timestampTruncate(e,t){const n=[this,k(e)];return t&&n.push(k(t)),new C("timestamp_trunc",n)}ascending(){return Zw(this)}descending(){return ev(this)}as(e){return new Hw(this,e,"as")}}class Qe{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,n){const s=new Qe(e,t);return s._methodName=n,s}as(e){return new Gw(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map((t=>t._toProto(e)))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e)))}}class Gw{constructor(e,t,n){this.aggregate=e,this.alias=t,this._methodName=n}_readUserData(e){this.aggregate._readUserData(e)}}class Hw{constructor(e,t,n){this.expr=e,this.alias=t,this._methodName=n,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class Rs extends nr{constructor(e,t){super(),this.Rr=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.Rr.map((t=>t._toProto(e)))}}}_readUserData(e){this.Rr.forEach((t=>t._readUserData(e)))}}class Qr extends nr{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new C("geo_distance",[this,k(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function Ww(r){return Qw(r,"field")}function Qw(r,e){return new Qr(typeof r=="string"?br===r?Iw()._internalPath:vi("field",r):r._internalPath,e)}class rr extends nr{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new rr(e,void 0);return t._protoValue=e,t}_toProto(e){return N(this._protoValue!==void 0,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,zw(this._protoValue)||(this._protoValue=ni(this.value,e))}}function ri(r,e){return ym(r,"constant")}function ym(r,e){const t=new rr(r,e);return typeof r=="boolean"?new Em(t):t}class C extends nr{constructor(e,t,n,s){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,n!==void 0&&(this._methodName=n),s!==void 0&&(this._options=s)}get _optionsUtil(){return new Le({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map((n=>n._toProto(e)))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e))),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class pn extends nr{get _methodName(){return this._expr._methodName}countIf(){return Qe._create("count_if",[this],"countIf")}not(){return new C("not",[this],"not").asBoolean()}conditional(e,t){return new C("conditional",[this,e,t],"conditional")}ifError(e){const t=k(e),n=new C("if_error",[this,t],"ifError");return t instanceof pn?n.asBoolean():n}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class Im extends pn{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class Em extends pn{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class Yw extends pn{constructor(e){super(),this._expr=e,this.expressionType="Field"}}function Jw(r,e){const t=[];for(const n in r)if(Object.prototype.hasOwnProperty.call(r,n)){const s=r[n];t.push(ri(n)),t.push(k(s))}return new C("map",t,"map")}function Xw(r){return(function(t,n){return new C("array",t.map((s=>k(s))),n)})(r,"array")}function Zw(r){return new vc(wc(r),"ascending","ascending")}function ev(r){return new vc(wc(r),"descending","descending")}class vc{constructor(e,t,n){this.expr=e,this.direction=t,this._methodName=n,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:sm(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tt{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class Tm extends tt{get _name(){return"add_fields"}get _optionsUtil(){return new Le({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[ei(e,this.fields)]}}_readUserData(e){super._readUserData(e),mn(this.fields,e)}}class wm extends tt{get _name(){return"aggregate"}get _optionsUtil(){return new Le({})}constructor(e,t,n){super(n),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[ei(e,this.accumulators),ei(e,this.groups)]}}_readUserData(e){super._readUserData(e),mn(this.groups,e),mn(this.accumulators,e)}}class vm extends tt{get _name(){return"distinct"}get _optionsUtil(){return new Le({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[ei(e,this.groups)]}}_readUserData(e){super._readUserData(e),mn(this.groups,e)}}class Ai extends tt{get _name(){return"collection"}get _optionsUtil(){return new Le({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.Vr=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.Vr}]}}_readUserData(e){super._readUserData(e)}}class Ri extends tt{get _name(){return"collection_group"}get _optionsUtil(){return new Le({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class ca extends tt{get _name(){return"database"}get _optionsUtil(){return new Le({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class la extends tt{get _name(){return"documents"}get _optionsUtil(){return new Le({})}constructor(e,t){if(super(t),!e||e.length===0)throw new U(x.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const n=e.map((i=>i.startsWith("/")?i:"/"+i)),s=new Set(n);if(s.size!==n.length)throw new U(x.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.dr=n,this.mr=s}_toProto(e){return{...super._toProto(e),args:this.dr.map((t=>({referenceValue:t})))}}_readUserData(e){super._readUserData(e)}}class ha extends tt{get _name(){return"where"}get _optionsUtil(){return new Le({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),mn(this.condition,e)}}class qr extends tt{get _name(){return"limit"}get _optionsUtil(){return new Le({})}constructor(e,t){N(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[cc(e,this.limit)]}}}class hd extends tt{get _name(){return"offset"}get _optionsUtil(){return new Le({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[cc(e,this.offset)]}}}class tv extends tt{get _name(){return"select"}get _optionsUtil(){return new Le({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[ei(e,this.selections)]}}_readUserData(e){super._readUserData(e),mn(this.selections,e)}}class da extends tt{get _name(){return"sort"}get _optionsUtil(){return new Le({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map((t=>t._toProto(e)))}}_readUserData(e){super._readUserData(e),mn(this.orderings,e)}}class Ac extends tt{get _name(){return"replace_with"}get _optionsUtil(){return new Le({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),sm(Ac.pr)]}}_readUserData(e){super._readUserData(e),mn(this.map,e)}}Ac.pr="full_replace";function mn(r,e){return jw(r)?r._readUserData(e):Array.isArray(r)?r.forEach((t=>t._readUserData(e))):r instanceof Map?r.forEach((t=>t._readUserData(e))):Object.values(r).forEach((t=>t._readUserData(e))),r}// Copyright 2024 Google LLC* @license
class Fe{constructor(e,t,n){this.serializer=e,this.stages=t,this.listenOptions=n,this.isCorePipeline=!0}getPipelineCollection(){return Pi(this)}getPipelineCollectionGroup(){return Rc(this)}getPipelineCollectionId(){return nv(this)}getPipelineDocuments(){return bu(this)}getPipelineFlavor(){return(function(t){let n="exact";return t.stages.forEach(((s,i)=>{s._name!==vm.name&&s._name!==wm.name||(n="keyless"),s._name===tv.name&&n==="exact"&&(n="augmented"),s._name===Tm.name&&i<t.stages.length-1&&n==="exact"&&(n="augmented")})),n})(this)}getPipelineSourceType(){return un(this)}}function un(r){const e=r.stages[0];return e instanceof Ai||e instanceof Ri||e instanceof ca||e instanceof la?e._name:"unknown"}function Pi(r){if(un(r)==="collection")return r.stages[0].Vr}function Rc(r){if(un(r)==="collection_group")return r.stages[0].collectionId}function nv(r){switch(un(r)){case"collection":return ee.fromString(Pi(r)).lastSegment();case"collection_group":return Rc(r);default:return}}function bu(r){if(un(r)==="documents")return r.stages[0].dr}// Copyright 2024 Google LLC* @license
class E{constructor(e,t){this.type=e,this.value=t}static vr(){return new E("ERROR",void 0)}static Sr(){return new E("UNSET",void 0)}static Dr(){return new E("NULL",Tt)}static newValue(e){return Xe(e)?new E("NULL",Tt):(function(n){return!!n&&"booleanValue"in n})(e)?new E("BOOLEAN",e):gt(e)?new E("INT",e):Mn(e)?new E("DOUBLE",e):(function(n){return!!n&&"timestampValue"in n&&!!n.timestampValue})(e)?new E("TIMESTAMP",e):(function(n){return!!n&&"stringValue"in n})(e)?new E("STRING",e):(function(n){return!!n&&"bytesValue"in n})(e)?new E("BYTES",e):e.referenceValue?new E("REFERENCE",e):e.geoPointValue?new E("GEO_POINT",e):fn(e)?new E("ARRAY",e):Yn(e)?new E("VECTOR",e):Bn(e)?new E("MAP",e):new E("ERROR",void 0)}Cr(){return this.type==="ERROR"||this.type==="UNSET"}Fr(){return this.type==="NULL"}}function Us(r){if(!r.Cr())return r.value}function Am(r){return r instanceof pn?r._expr:r}function $(r){if((r=Am(r))instanceof Qr)return new rv(r);if(r instanceof rr)return new sv(r);if(r instanceof Rs)return new iv(r);if(r instanceof C){if(r.name==="add")return new uv(r);if(r.name==="subtract")return new cv(r);if(r.name==="multiply")return new lv(r);if(r.name==="divide")return new hv(r);if(r.name==="mod")return new dv(r);if(r.name==="and")return new fv(r);if(r.name==="equal")return new Rv(r);if(r.name==="not_equal")return new Pv(r);if(r.name==="less_than")return new bv(r);if(r.name==="less_than_or_equal")return new Sv(r);if(r.name==="greater_than")return new Vv(r);if(r.name==="greater_than_or_equal")return new Cv(r);if(r.name==="array_concat")return new xv(r);if(r.name==="array_reverse")return new Dv(r);if(r.name==="array_contains")return new Nv(r);if(r.name==="array_contains_all")return new kv(r);if(r.name==="array_contains_any")return new Ov(r);if(r.name==="array_length")return new Lv(r);if(r.name==="array_element")return new Mv(r);if(r.name==="equal_any")return new Rm(r);if(r.name==="not_equal_any")return new mv(r);if(r.name==="is_nan")return new gv(r);if(r.name==="is_not_nan")return new _v(r);if(r.name==="is_null")return new yv(r);if(r.name==="is_not_null")return new Iv(r);if(r.name==="is_error")return new Ev(r);if(r.name==="exists")return new Tv(r);if(r.name==="not")return new fa(r);if(r.name==="or")return new pv(r);if(r.name==="xor")return new Pc(r);if(r.name==="conditional")return new wv(r);if(r.name==="maximum")return new vv(r);if(r.name==="minimum")return new Av(r);if(r.name==="reverse")return new Uv(r);if(r.name==="replace_first")return new Fv(r);if(r.name==="replace_all")return new Bv(r);if(r.name==="char_length")return new qv(r);if(r.name==="byte_length")return new $v(r);if(r.name==="like")return new jv(r);if(r.name==="regex_contains")return new zv(r);if(r.name==="regex_match")return new Kv(r);if(r.name==="string_contains")return new Gv(r);if(r.name==="starts_with")return new Hv(r);if(r.name==="ends_with")return new Wv(r);if(r.name==="to_lower")return new Qv(r);if(r.name==="to_upper")return new Yv(r);if(r.name==="trim")return new Jv(r);if(r.name==="string_concat")return new Xv(r);if(r.name==="map_get")return new Zv(r);if(r.name==="cosine_distance")return new eA(r);if(r.name==="dot_product")return new tA(r);if(r.name==="euclidean_distance")return new nA(r);if(r.name==="vector_length")return new rA(r);if(r.name==="unix_micros_to_timestamp")return new uA(r);if(r.name==="timestamp_to_unix_micros")return new hA(r);if(r.name==="unix_millis_to_timestamp")return new cA(r);if(r.name==="timestamp_to_unix_millis")return new dA(r);if(r.name==="unix_seconds_to_timestamp")return new lA(r);if(r.name==="timestamp_to_unix_seconds")return new fA(r);if(r.name==="timestamp_add")return new pA(r);if(r.name==="timestamp_subtract")return new mA(r)}throw new Error(`Unknown Expr : ${r}`)}class rv{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===br)return E.newValue({referenceValue:Zs(e.serializer,t.key)});if(this.expr.fieldName==="__update_time__")return E.newValue({timestampValue:po(e.serializer,t.version)});if(this.expr.fieldName==="__create_time__")return E.newValue({timestampValue:po(e.serializer,t.createTime)});const n=t.data.field(this.expr._fieldPath);return n?ta(n)?E.newValue((function(i,o){if(i.serverTimestampBehavior==="estimate")return{timestampValue:po(i.serializer,q.fromTimestamp(Nr(o)))};if(i.serverTimestampBehavior==="previous"){const u=Ii(o);if(u)return u}return{nullValue:"NULL_VALUE"}})(e,n)):E.newValue(n):E.Sr()}}class sv{constructor(e){this.expr=e}evaluate(e,t){return E.newValue(this.expr._getValue())}}class iv{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.Rr.map((s=>$(s).evaluate(e,t)));return n.some((s=>s.Cr()))?E.vr():E.newValue({arrayValue:{values:n.map((s=>s.value))}})}}function Ce(r){return Mn(r)?Number(r.doubleValue):Number(r.integerValue)}function vt(r){return BigInt(r.integerValue)}const ov=BigInt("0x7fffffffffffffff"),av=-BigInt("0x8000000000000000");class bi{constructor(e){this.expr=e}evaluate(e,t){N(this.expr.params.length>=2,24778);const n=$(this.expr.params[0]).evaluate(e,t),s=$(this.expr.params[1]).evaluate(e,t);let i=this.Or(n,s);for(const o of this.expr.params.slice(2)){const u=$(o).evaluate(e,t);i=this.Or(i,u)}return i}Or(e,t){if(e.Cr()||t.Cr())return E.vr();if(e.Fr()||t.Fr())return E.Dr();const n=e.value,s=t.value;if(!Mn(n)&&!gt(n)||!Mn(s)&&!gt(s))return E.vr();if(Mn(n)||Mn(s)){const i=this.Mr(n,s);return i?E.newValue(i):E.vr()}if(gt(n)&&gt(s)){const i=this.Nr(n,s);return i===void 0?E.vr():typeof i=="number"?E.newValue({doubleValue:i}):i<av||i>ov?E.vr():E.newValue({integerValue:`${i}`})}return E.vr()}}function Lt(r,e){return Ie(r)!==Ie(e)?"TYPE_MISMATCH":He(r)||He(e)?"NOT_EQ":Xe(r)&&Xe(e)?"EQ":Xe(r)||Xe(e)?"NULL":fn(r)&&fn(e)?(function(n,s){var o,u,c;if(((o=n.values)==null?void 0:o.length)!==((u=s.values)==null?void 0:u.length))return"NOT_EQ";let i=!1;for(let h=0;h<(((c=n.values)==null?void 0:c.length)??0);h++){const f=n.values[h],p=s.values[h];switch(Lt(f,p)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":i=!0;break;default:B(44609,{Lr:f,Br:p})}}return i?"NULL":"EQ"})(r.arrayValue,e.arrayValue):Yn(r)&&Yn(e)||Bn(r)&&Bn(e)?(function(n,s){const i=n.fields||{},o=s.fields||{};if(Vo(i)!==Vo(o))return"NOT_EQ";let u=!1;for(const c in i)if(i.hasOwnProperty(c)){if(o[c]===void 0)return"NOT_EQ";switch(Lt(i[c],o[c])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":u=!0}}return u?"NULL":"EQ"})(r.mapValue,e.mapValue):(function(n,s){return ut(n,s,{Te:!1,Ee:!0,he:!0})})(r,e)?"EQ":"NOT_EQ"}class uv extends bi{Nr(e,t){return vt(e)+vt(t)}Mr(e,t){return{doubleValue:Ce(e)+Ce(t)}}}class cv extends bi{constructor(e){super(e),this.expr=e}Nr(e,t){return vt(e)-vt(t)}Mr(e,t){return{doubleValue:Ce(e)-Ce(t)}}}class lv extends bi{constructor(e){super(e),this.expr=e}Nr(e,t){return vt(e)*vt(t)}Mr(e,t){return{doubleValue:Ce(e)*Ce(t)}}}class hv extends bi{constructor(e){super(e),this.expr=e}Nr(e,t){const n=vt(t);if(n!==BigInt(0))return vt(e)/n}Mr(e,t){const n=Ce(t);return n===0?{doubleValue:Sr(n)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:Ce(e)/n}}}class dv extends bi{constructor(e){super(e),this.expr=e}Nr(e,t){const n=vt(t);if(n!==BigInt(0))return vt(e)%n}Mr(e,t){const n=Ce(t);if(n!==0)return{doubleValue:Ce(e)%n}}}class fv{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const o of this.expr.params){const u=$(o).evaluate(e,t);switch(u.type){case"BOOLEAN":if(!((i=u.value)!=null&&i.booleanValue))return E.newValue(Pe);break;case"NULL":s=!0;break;default:n=!0}}return n?E.vr():s?E.Dr():E.newValue(Ge)}}class fa{constructor(e){this.expr=e}evaluate(e,t){var s;N(this.expr.params.length===1,9634);const n=$(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BOOLEAN":return E.newValue({booleanValue:!((s=n.value)!=null&&s.booleanValue)});case"NULL":return E.Dr();default:return E.vr()}}}class pv{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const o of this.expr.params){const u=$(o).evaluate(e,t);switch(u.type){case"BOOLEAN":if((i=u.value)!=null&&i.booleanValue)return E.newValue(Ge);break;case"NULL":s=!0;break;default:n=!0}}return n?E.vr():s?E.Dr():E.newValue(Pe)}}class Pc{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const o of this.expr.params){const u=$(o).evaluate(e,t);switch(u.type){case"BOOLEAN":n=Pc.xor(n,!!((i=u.value)!=null&&i.booleanValue));break;case"NULL":s=!0;break;default:return E.vr()}}return s?E.Dr():E.newValue({booleanValue:n})}static xor(e,t){return(e||t)&&!(e&&t)}}class Rm{constructor(e){this.expr=e}evaluate(e,t){var o,u;N(this.expr.params.length===2,55094);let n=!1;const s=$(this.expr.params[0]).evaluate(e,t);switch(s.type){case"NULL":n=!0;break;case"ERROR":case"UNSET":return E.vr()}const i=$(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return E.vr()}if(n)return E.Dr();for(const c of((u=(o=i.value)==null?void 0:o.arrayValue)==null?void 0:u.values)??[])switch(Xe(s.value)&&Xe(c)?"EQ":Lt(s.value,c)){case"EQ":return E.newValue(Ge);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:B(44608,{value:s.value,candidate:c})}return n?E.Dr():E.newValue(Pe)}}class mv{constructor(e){this.expr=e}evaluate(e,t){return new fa(new C("not",[new C("equal_any",this.expr.params)])).evaluate(e,t)}}class gv{constructor(e){this.expr=e}evaluate(e,t){N(this.expr.params.length===1,23322);const n=$(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return E.newValue(Pe);case"DOUBLE":return E.newValue({booleanValue:isNaN(Ce(n.value))});case"NULL":return E.Dr();default:return E.vr()}}}class _v{constructor(e){this.expr=e}evaluate(e,t){return N(this.expr.params.length===1,50406),new fa(new C("not",[new C("is_nan",this.expr.params)])).evaluate(e,t)}}class yv{constructor(e){this.expr=e}evaluate(e,t){switch(N(this.expr.params.length===1,23123),$(this.expr.params[0]).evaluate(e,t).type){case"NULL":return E.newValue(Ge);case"UNSET":case"ERROR":return E.vr();default:return E.newValue(Pe)}}}class Iv{constructor(e){this.expr=e}evaluate(e,t){return N(this.expr.params.length===1,23167),new fa(new C("not",[new C("is_null",this.expr.params)])).evaluate(e,t)}}class Ev{constructor(e){this.expr=e}evaluate(e,t){return N(this.expr.params.length===1,5228),$(this.expr.params[0]).evaluate(e,t).type==="ERROR"?E.newValue(Ge):E.newValue(Pe)}}class Tv{constructor(e){this.expr=e}evaluate(e,t){switch(N(this.expr.params.length===1,6877),$(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return E.vr();case"UNSET":return E.newValue(Pe);default:return E.newValue(Ge)}}}class wv{constructor(e){this.expr=e}evaluate(e,t){var s;N(this.expr.params.length===3,11706);const n=$(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BOOLEAN":return(s=n.value)!=null&&s.booleanValue?$(this.expr.params[1]).evaluate(e,t):$(this.expr.params[2]).evaluate(e,t);case"NULL":return $(this.expr.params[2]).evaluate(e,t);default:return E.vr()}}}class vv{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((i=>$(i).evaluate(e,t)));let s;for(const i of n)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||Oe(i.value,s.value)>0?i:s}return s===void 0?E.Dr():s}}class Av{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((i=>$(i).evaluate(e,t)));let s;for(const i of n)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||Oe(i.value,s.value)<0?i:s}return s===void 0?E.Dr():s}}class Yr{constructor(e){this.expr=e}evaluate(e,t){N(this.expr.params.length===2,31033,`${this.expr.name}() function should have exactly 2 params`);const n=$(this.expr.params[0]).evaluate(e,t);switch(n.type){case"ERROR":case"UNSET":return E.vr()}const s=$(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ERROR":case"UNSET":return E.vr()}return this.Ur(n,s)}}class Rv extends Yr{constructor(e){super(e),this.expr=e}Ur(e,t){if(e.Fr()&&t.Fr())return E.newValue(Ge);if(e.Fr()||t.Fr()||He(e.value)||He(t.value)||Ie(e.value)!==Ie(t.value))return E.newValue(Pe);switch(Lt(e.value,t.value)){case"EQ":return E.newValue(Ge);case"NOT_EQ":return E.newValue(Pe);case"NULL":return E.Dr();default:B(44615,{left:e,right:t})}}}class Pv extends Yr{constructor(e){super(e),this.expr=e}Ur(e,t){switch(Lt(e.value,t.value)){case"EQ":return E.newValue(Pe);case"NOT_EQ":case"TYPE_MISMATCH":return E.newValue(Ge);case"NULL":return E.Dr();default:B(44614,{left:e,right:t})}}}class bv extends Yr{constructor(e){super(e),this.expr=e}Ur(e,t){return Ie(e.value)!==Ie(t.value)||He(e.value)||He(t.value)?E.newValue(Pe):E.newValue({booleanValue:Oe(e.value,t.value)<0})}}class Sv extends Yr{constructor(e){super(e),this.expr=e}Ur(e,t){return Ie(e.value)!==Ie(t.value)||He(e.value)||He(t.value)?E.newValue(Pe):Lt(e.value,t.value)==="EQ"?E.newValue(Ge):E.newValue({booleanValue:Oe(e.value,t.value)<0})}}class Vv extends Yr{constructor(e){super(e),this.expr=e}Ur(e,t){return Ie(e.value)!==Ie(t.value)||He(e.value)||He(t.value)?E.newValue(Pe):E.newValue({booleanValue:Oe(e.value,t.value)>0})}}class Cv extends Yr{constructor(e){super(e),this.expr=e}Ur(e,t){return Ie(e.value)!==Ie(t.value)||He(e.value)||He(t.value)?E.newValue(Pe):Lt(e.value,t.value)==="EQ"?E.newValue(Ge):E.newValue({booleanValue:Oe(e.value,t.value)>0})}}class xv{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Dv{constructor(e){this.expr=e}evaluate(e,t){var s;N(this.expr.params.length===1,216);const n=$(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return E.Dr();case"ARRAY":{const i=((s=n.value.arrayValue)==null?void 0:s.values)??[];return E.newValue({arrayValue:{values:[...i].reverse()}})}default:return E.vr()}}}class Nv{constructor(e){this.expr=e}evaluate(e,t){return N(this.expr.params.length===2,52884),new Rm(new C("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class kv{constructor(e){this.expr=e}evaluate(e,t){var c,h,f,p;N(this.expr.params.length===2,1392);let n=!1;const s=$(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":n=!0;break;default:return E.vr()}const i=$(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return E.vr()}if(n)return E.Dr();const o=((h=(c=i.value)==null?void 0:c.arrayValue)==null?void 0:h.values)??[],u=((p=(f=s.value)==null?void 0:f.arrayValue)==null?void 0:p.values)??[];for(const _ of o){let P=!1;n=!1;for(const V of u){switch(Xe(_)&&Xe(V)?"EQ":Lt(_,V)){case"EQ":P=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:B(44613,{value:V,search:_})}if(P)break}if(!P)return E.newValue(Pe)}return E.newValue(Ge)}}class Ov{constructor(e){this.expr=e}evaluate(e,t){var c,h,f,p;N(this.expr.params.length===2,2680);let n=!1;const s=$(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":n=!0;break;default:return E.vr()}const i=$(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return E.vr()}if(n)return E.Dr();const o=((h=(c=i.value)==null?void 0:c.arrayValue)==null?void 0:h.values)??[],u=((p=(f=s.value)==null?void 0:f.arrayValue)==null?void 0:p.values)??[];for(const _ of u)for(const P of o)switch(Xe(_)&&Xe(P)?"EQ":Lt(_,P)){case"EQ":return E.newValue(Ge);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:B(44608,{value:_,search:P})}return n?E.Dr():E.newValue(Pe)}}class Lv{constructor(e){this.expr=e}evaluate(e,t){var s,i,o;N(this.expr.params.length===1,38605);const n=$(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return E.Dr();case"ARRAY":return E.newValue({integerValue:`${((o=(i=(s=n.value)==null?void 0:s.arrayValue)==null?void 0:i.values)==null?void 0:o.length)??0}`});default:return E.vr()}}}class Mv{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Uv{constructor(e){this.expr=e}evaluate(e,t){var s,i;N(this.expr.params.length===1,1508);const n=$(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return E.Dr();case"BYTES":{const o=(s=n.value)==null?void 0:s.bytesValue;if(typeof o=="string"){const u=de.fromBase64String(o).toUint8Array();return u.reverse(),E.newValue({bytesValue:de.fromUint8Array(u).toBase64()})}return E.newValue({bytesValue:new Uint8Array(o).reverse()})}case"STRING":{const o=(i=n.value)==null?void 0:i.stringValue,u=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(o),c=Array.from(u,(h=>h.segment)).reverse();return E.newValue({stringValue:c.join("")})}default:return E.vr()}}}class Fv{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Bv{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class qv{constructor(e){this.expr=e}evaluate(e,t){N(this.expr.params.length===1,19400);const n=$(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return E.Dr();case"STRING":{const s=(function(o){let u=0;for(let c=0;c<o.length;c++){const h=o.codePointAt(c);if(h===void 0)return;if(h<=65535)if(h>=55296&&h<=57343)if(h<=56319){const f=o.codePointAt(c+1);f!==void 0&&f>=56320&&f<=57343?(u+=1,c++):u+=1}else u+=1;else u+=1;else{if(!(h<=1114111))return;u+=1,c++}}return u})(n.value.stringValue);return s===void 0?E.vr():E.newValue({integerValue:s})}default:return E.vr()}}}class $v{constructor(e){this.expr=e}evaluate(e,t){var s,i;N(this.expr.params.length===1,8486);const n=$(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BYTES":{const o=(s=n.value)==null?void 0:s.bytesValue;return typeof o=="string"?E.newValue({integerValue:de.fromBase64String(o).toUint8Array().length}):E.newValue({integerValue:new Uint8Array(o).length})}case"STRING":{const o=(function(c){let h=0;for(let f=0;f<c.length;f++){const p=c.codePointAt(f);if(p===void 0)return;if(p>=55296&&p<=57343){if(!(p<=56319))return;{const _=c.codePointAt(f+1);if(_===void 0||!(_>=56320&&_<=57343))return;h+=4,f++}}else if(p<=127)h+=1;else if(p<=2047)h+=2;else if(p<=65535)h+=3;else{if(!(p<=1114111))return;h+=4,f++}}return h})((i=n.value)==null?void 0:i.stringValue);return o===void 0?E.vr():E.newValue({integerValue:o})}case"NULL":return E.Dr();default:return E.vr()}}}class Jr{constructor(e){this.expr=e}evaluate(e,t){var o,u;N(this.expr.params.length===2,39773,`${this.expr.name}() function should have exactly two parameters`);let n=!1;const s=$(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":n=!0;break;default:return E.vr()}const i=$(this.expr.params[1]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":n=!0;break;default:return E.vr()}return n?E.Dr():this.kr((o=s.value)==null?void 0:o.stringValue,(u=i.value)==null?void 0:u.stringValue)}}class jv extends Jr{kr(e,t){try{const n=(function(o){let u="";for(let c=0;c<o.length;c++){const h=o.charAt(c);switch(h){case"_":u+=".";break;case"%":u+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":u+="\\"+h;break;default:u+=h}}return"^"+u+"$"})(t),s=Fu.compile(n);return E.newValue({booleanValue:s.matches(e)})}catch(n){return at(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${n}`),E.vr()}}}class zv extends Jr{kr(e,t){try{const n=Fu.compile(t);return E.newValue({booleanValue:n.matcher(e).find()})}catch{return at(`Invalid regex pattern found in regex_contains: ${t}, returning error`),E.vr()}}}class Kv extends Jr{kr(e,t){try{return E.newValue({booleanValue:Fu.compile(t).matches(e)})}catch{return at(`Invalid regex pattern found in regex_match: ${t}, returning error`),E.vr()}}}class Gv extends Jr{kr(e,t){return E.newValue({booleanValue:e.includes(t)})}}class Hv extends Jr{kr(e,t){return E.newValue({booleanValue:e.startsWith(t)})}}class Wv extends Jr{kr(e,t){return E.newValue({booleanValue:e.endsWith(t)})}}class Qv{constructor(e){this.expr=e}evaluate(e,t){var s,i;N(this.expr.params.length===1,29079);const n=$(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return E.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.toLowerCase()});case"NULL":return E.Dr();default:return E.vr()}}}class Yv{constructor(e){this.expr=e}evaluate(e,t){var s,i;N(this.expr.params.length===1,60487);const n=$(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return E.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.toUpperCase()});case"NULL":return E.Dr();default:return E.vr()}}}class Jv{constructor(e){this.expr=e}evaluate(e,t){var s,i;N(this.expr.params.length===1,28544);const n=$(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return E.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.trim()});case"NULL":return E.Dr();default:return E.vr()}}}class Xv{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((o=>$(o).evaluate(e,t)));let s="",i=!1;for(const o of n)switch(o.type){case"STRING":s+=o.value.stringValue;break;case"NULL":i=!0;break;default:return E.vr()}return i?E.Dr():E.newValue({stringValue:s})}}class Zv{constructor(e){this.expr=e}evaluate(e,t){var o,u,c,h;N(this.expr.params.length===2,4483);const n=$(this.expr.params[0]).evaluate(e,t);switch(n.type){case"UNSET":return E.Sr();case"MAP":break;default:return E.vr()}const s=$(this.expr.params[1]).evaluate(e,t);if(s.type!=="STRING")return E.vr();const i=(h=(u=(o=n.value)==null?void 0:o.mapValue)==null?void 0:u.fields)==null?void 0:h[(c=s.value)==null?void 0:c.stringValue];return i===void 0?E.Sr():E.newValue(i)}}class bc{constructor(e){this.expr=e}evaluate(e,t){var h,f;N(this.expr.params.length===2,25231,`${this.expr.name}() function should have exactly 2 params`);let n=!1;const s=$(this.expr.params[0]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":n=!0;break;default:return E.vr()}const i=$(this.expr.params[1]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":n=!0;break;default:return E.vr()}if(n)return E.Dr();const o=_u(s.value),u=_u(i.value);if(o===void 0||u===void 0||((h=o.values)==null?void 0:h.length)!==((f=u.values)==null?void 0:f.length))return E.vr();const c=this.qr(o,u);return c===void 0||isNaN(c)?E.vr():E.newValue({doubleValue:c})}}class eA extends bc{qr(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return;let i=0,o=0,u=0;for(let h=0;h<n.length;h++){if(!dn(n[h])||!dn(s[h]))return;const f=Ce(n[h]),p=Ce(s[h]);i+=f*p,o+=f*f,u+=p*p}const c=Math.sqrt(o)*Math.sqrt(u);if(c!==0)return 1-Math.max(-1,Math.min(1,i/c))}}class tA extends bc{qr(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return 0;let i=0;for(let o=0;o<n.length;o++){if(!dn(n[o])||!dn(s[o]))return;i+=Ce(n[o])*Ce(s[o])}return i}}class nA extends bc{qr(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return 0;let i=0;for(let o=0;o<n.length;o++){if(!dn(n[o])||!dn(s[o]))return;const u=Ce(n[o]),c=Ce(s[o]);i+=Math.pow(u-c,2)}return Math.sqrt(i)}}class rA{constructor(e){this.expr=e}evaluate(e,t){var s;N(this.expr.params.length===1,39044);const n=$(this.expr.params[0]).evaluate(e,t);switch(n.type){case"VECTOR":{const i=_u(n.value);return E.newValue({integerValue:((s=i==null?void 0:i.values)==null?void 0:s.length)??0})}case"NULL":return E.Dr();default:return E.vr()}}}const si=BigInt(-62135596800),ii=BigInt(253402300799),Lo=BigInt(1e3),cn=BigInt(1e6),sA=si*Lo,iA=ii*Lo+BigInt(999),oA=si*cn,aA=ii*cn+BigInt(999999);function Sc(r){return r>=oA&&r<=aA}function Pm(r){return r>=si&&r<=ii}function oi(r,e){const t=BigInt(r);return!(t<si||t>ii)&&!(e<0||e>=1e9)&&(t!==si||e===0)&&!(t===ii&&e>999999999)}function bm(r,e){return e<0?{seconds:r-1,nanos:e+1e9}:{seconds:r,nanos:e}}function Vc(r){return BigInt(r.seconds)*cn+BigInt(Math.trunc(r.nanoseconds/1e3))}class Cc{constructor(e){this.expr=e}evaluate(e,t){N(this.expr.params.length===1,49262,`${this.expr.name}() function should have exactly one parameter`);const n=$(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return this.toTimestamp(BigInt(n.value.integerValue));case"NULL":return E.Dr();default:return E.vr()}}}class uA extends Cc{toTimestamp(e){if(!Sc(e))return E.vr();let t=Number(e/cn),n=Number(e%cn*BigInt(1e3));const s=bm(t,n);return t=s.seconds,n=s.nanos,oi(t,n)?E.newValue({timestampValue:{seconds:t,nanos:n}}):E.vr()}}class cA extends Cc{toTimestamp(e){if(!(function(o){return o>=sA&&o<=iA})(e))return E.vr();let t=Number(e/Lo),n=Number(e%Lo*BigInt(1e6));const s=bm(t,n);return t=s.seconds,n=s.nanos,oi(t,n)?E.newValue({timestampValue:{seconds:t,nanos:n}}):E.vr()}}class lA extends Cc{toTimestamp(e){if(!Pm(e))return E.vr();const t=Number(e);return E.newValue({timestampValue:{seconds:t,nanos:0}})}}class xc{constructor(e){this.expr=e}evaluate(e,t){N(this.expr.params.length===1,1265,`${this.expr.name}() function should have exactly one parameter`);const n=$(this.expr.params[0]).evaluate(e,t);switch(n.type){case"TIMESTAMP":break;case"NULL":return E.Dr();default:return E.vr()}const s=_c(n.value.timestampValue);return oi(s.seconds,s.nanoseconds)?this.$r(s):E.vr()}}class hA extends xc{$r(e){const t=Vc(e);return Sc(t)?E.newValue({integerValue:`${t.toString()}`}):E.vr()}}class dA extends xc{$r(e){const t=Vc(e),n=t/BigInt(1e3),s=t%BigInt(1e3);return n>BigInt(0)||s===BigInt(0)?E.newValue({integerValue:n.toString()}):E.newValue({integerValue:(n-BigInt(1)).toString()})}}class fA extends xc{$r(e){const t=BigInt(e.seconds);return Pm(t)?E.newValue({integerValue:t.toString()}):E.vr()}}class Sm{constructor(e){this.expr=e}evaluate(e,t){N(this.expr.params.length===3,2775,`${this.expr.name}() function should have exactly 3 parameters`);let n=!1;const s=$(this.expr.params[0]).evaluate(e,t);switch(s.type){case"TIMESTAMP":break;case"NULL":n=!0;break;default:return E.vr()}const i=$(this.expr.params[1]).evaluate(e,t);let o;switch(i.type){case"STRING":if(o=(function(K){switch(K){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}})(i.value.stringValue),o===void 0)return E.vr();break;case"NULL":n=!0;break;default:return E.vr()}const u=$(this.expr.params[2]).evaluate(e,t);switch(u.type){case"INT":break;case"NULL":n=!0;break;default:return E.vr()}if(n)return E.Dr();const c=BigInt(u.value.integerValue);let h;try{switch(o){case"microsecond":h=c;break;case"millisecond":h=c*BigInt(1e3);break;case"second":h=c*BigInt(1e6);break;case"minute":h=c*BigInt(6e7);break;case"hour":h=c*BigInt(36e8);break;case"day":h=c*BigInt(864e8);break;default:return E.vr()}if(o!=="microsecond"&&c!==BigInt(0)&&h/c!==BigInt(this.Kr(o)))return E.vr()}catch(z){return at(`Error during timestamp arithmetic: ${z}`),E.vr()}const f=_c(s.value.timestampValue);if(!oi(f.seconds,f.nanoseconds))return E.vr();const p=Vc(f),_=this.Wr(p,h);if(!Sc(_))return E.vr();const P=Number(_/cn),V=_%cn,O=Number((V<0?V+cn:V)*BigInt(1e3)),M=V<0?P-1:P;return oi(M,O)?E.newValue({timestampValue:{seconds:M,nanos:O}}):E.vr()}Kr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class pA extends Sm{Wr(e,t){return e+t}}class mA extends Sm{Wr(e,t){return e-t}}function ai(r){if((r=Am(r))instanceof Qr)return`fld(${r.fieldName})`;if(r instanceof rr)return`cst(${(function(t){return t===null?"null":typeof t=="number"?t.toString():typeof t=="string"?`"${t}"`:t instanceof ye?`ref(${t.path})`:t instanceof Ke?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})(r.value)})`;if(r instanceof C)return`fn(${r.name},[${r.params.map(ai).join(",")}])`;if(r.expressionType==="ListOfExpressions")return`list([${r.Rr.map(ai).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(r,null,2)}`)}function gA(r){if(r instanceof Tm)return`${r._name}(${Ji(r.fields)})`;if(r instanceof wm){let e=`${r._name}(${Ji(r.accumulators)})`;return r.groups.size>0&&(e+=`grouping(${Ji(r.groups)})`),e}if(r instanceof vm)return`${r._name}(${Ji(r.groups)})`;if(r instanceof Ai)return`${r._name}(${r.Vr})`;if(r instanceof Ri)return`${r._name}(${r.collectionId})`;if(r instanceof ca)return`${r._name}()`;if(r instanceof la)return`${r._name}(${r.dr.sort()})`;if(r instanceof ha)return`${r._name}(${ai(r.condition)})`;if(r instanceof qr)return`${r._name}(${r.limit})`;if(r instanceof da)return`${r._name}(${(function(t){return t.map((n=>`${ai(n.expr)}${n.direction}`)).join(",")})(r.orderings)})`;throw new Error(`Unrecognized stage ${r._name}`)}function Ji(r){return`${Array.from(r.entries()).sort().map((([e,t])=>`${e}=${ai(t)}`)).join(",")}`}function xt(r){return r.stages.map((e=>gA(e))).join("|")}function Vm(r,e){return xt(r)===xt(e)}function ge(r){return r instanceof Fe}function dd(r){return ge(r)?xt(r):Ls(r)}function Cm(r){return ge(r)?xt(r):(function(t){return`${Do(ot(t))}|lt:${t.limitType}`})(r)}function pa(r,e){return r instanceof Fe&&e instanceof Fe?Vm(r,e):!(r instanceof Fe&&!(e instanceof Fe)||!(r instanceof Fe)&&e instanceof Fe)&&QT(r,e)}function ma(r){return tn(r)?xt(r):Do(r)}function Dc(r,e){return r instanceof Fe&&e instanceof Fe?Vm(r,e):!(r instanceof Fe&&!(e instanceof Fe)||!(r instanceof Fe)&&e instanceof Fe)&&fc(r,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nc{constructor(e,t,n,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=n,this.mutations=s}applyToRemoteDocument(e,t){const n=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&OT(i,e,n[s])}}applyToLocalView(e,t){for(const n of this.baseMutations)n.key.isEqual(e.key)&&(t=ks(n,e,t,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(e.key)&&(t=ks(n,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const n=$p();return this.mutations.forEach((s=>{const i=e.get(s.key),o=i.overlayedDocument;let u=this.applyToLocalView(o,i.mutatedFields);u=t.has(s.key)?null:u;const c=Vp(o,u);c!==null&&n.set(s.key,c),o.isValidDocument()||o.convertToNoDocument(q.min())})),n}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),Q())}isEqual(e){return this.batchId===e.batchId&&Pr(this.mutations,e.mutations,((t,n)=>jh(t,n)))&&Pr(this.baseMutations,e.baseMutations,((t,n)=>jh(t,n)))}}class kc{constructor(e,t,n,s){this.batch=e,this.commitVersion=t,this.mutationResults=n,this.docVersions=s}static from(e,t,n){N(e.mutations.length===n.length,58842,{Qr:e.mutations.length,Gr:n.length});let s=(function(){return ew})();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,n[o].version);return new kc(e,t,n,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oc{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _t{constructor(e,t,n,s,i=q.min(),o=q.min(),u=de.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=t,this.purpose=n,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=u,this.expectedCount=c}withSequenceNumber(e){return new _t(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new _t(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new _t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new _t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xm{constructor(e){this.zr=e}}function _A(r,e){let t;if(e.document)t=hw(r.zr,e.document,!!e.hasCommittedMutations);else if(e.noDocument){const n=F.fromSegments(e.noDocument.path),s=Xn(e.noDocument.readTime);t=pe.newNoDocument(n,s),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return B(56709);{const n=F.fromSegments(e.unknownDocument.path),s=Xn(e.unknownDocument.version);t=pe.newUnknownDocument(n,s)}}return e.readTime&&t.setReadTime((function(s){const i=new se(s[0],s[1]);return q.fromTimestamp(i)})(e.readTime)),t}function fd(r,e){const t=e.key,n={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:Mo(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())n.document=(function(i,o){return{name:Zs(i,o.key),fields:o.data.value.mapValue.fields,updateTime:Br(i,o.version.toTimestamp()),createTime:Br(i,o.createTime.toTimestamp())}})(r.zr,e);else if(e.isNoDocument())n.noDocument={path:t.path.toArray(),readTime:Jn(e.version)};else{if(!e.isUnknownDocument())return B(57904,{document:e});n.unknownDocument={path:t.path.toArray(),version:Jn(e.version)}}return n}function Mo(r){const e=r.toTimestamp();return[e.seconds,e.nanoseconds]}function Jn(r){const e=r.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function Xn(r){const e=new se(r.seconds,r.nanoseconds);return q.fromTimestamp(e)}function Nn(r,e){const t=(e.baseMutations||[]).map((i=>Ru(r.zr,i)));for(let i=0;i<e.mutations.length-1;++i){const o=e.mutations[i];if(i+1<e.mutations.length&&e.mutations[i+1].transform!==void 0){const u=e.mutations[i+1];o.updateTransforms=u.transform.fieldTransforms,e.mutations.splice(i+1,1),++i}}const n=e.mutations.map((i=>Ru(r.zr,i))),s=se.fromMillis(e.localWriteTimeMs);return new Nc(e.batchId,s,t,n)}function Ps(r,e){const t=Xn(e.readTime),n=e.lastLimboFreeSnapshotVersion!==void 0?Xn(e.lastLimboFreeSnapshotVersion):q.min();let s;return s=(function(o){return o.structuredPipeline!==void 0})(e.query)?(function(o,u){var f,p;const c=o.structuredPipeline;N((((f=c==null?void 0:c.pipeline)==null?void 0:f.stages)??[]).length>0,1845);const h=(p=c==null?void 0:c.pipeline)==null?void 0:p.stages.map(yA);return new Fe(u,h)})(e.query,r.zr):(function(o){return o.documents!==void 0})(e.query)?(function(o){const u=o.documents.length;return N(u===1,1966,{count:u}),ot(Ei(Wp(o.documents[0])))})(e.query):(function(o){return ot(Xp(o))})(e.query),new _t(s,e.targetId,"TargetPurposeListen",e.lastListenSequenceNumber,t,n,de.fromBase64String(e.resumeToken))}function Dm(r,e){const t=Jn(e.snapshotVersion),n=Jn(e.lastLimboFreeSnapshotVersion);let s;s=tn(e.target)?Zp(r.zr,e.target):pc(e.target)?Yp(r.zr,e.target):Jp(r.zr,e.target).yt;const i=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:ma(e.target),readTime:t,resumeToken:i,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:n,query:s}}function Nm(r){const e=Xp({parent:r.parent,structuredQuery:r.structuredQuery});return r.limitType==="LAST"?Tu(e,e.limit,"L"):e}function Xi(r,e){return new Oc(e.largestBatchId,Ru(r.zr,e.overlayMutation))}function pd(r,e){const t=e.path.lastSegment();return[r,ke(e.path.popLast()),t]}function md(r,e,t,n){return{indexId:r,uid:e,sequenceNumber:t,readTime:Jn(n.readTime),documentKey:ke(n.documentKey.path),largestBatchId:n.largestBatchId}}function yA(r){switch(r.name){case"collection":return new Ai(r.args[0].referenceValue,{});case"collection_group":return new Ri(r.args[1].stringValue,{});case"database":return new ca({});case"documents":return new la(r.args.map((e=>e.referenceValue)),{});case"where":return new ha(Su(r.args[0]),{});case"limit":{const e=r.args[0].integerValue??r.args[0].doubleValue;return new qr(typeof e=="number"?e:Number(e),{})}case"sort":return new da(r.args.map((e=>(function(n){var i,o;const s=(i=n.mapValue)==null?void 0:i.fields;return new vc(Su(s.expression),(o=s.direction)==null?void 0:o.stringValue,"orderingFromProto")})(e))),{});default:throw new Error(`Stage type: ${r.name} not supported.`)}}function Su(r){return r.fieldReferenceValue?new Qr(vi("_exprFromProto",r.fieldReferenceValue),"_exprFromProto"):r.functionValue?(function(t){var n;return new C(t.functionValue.name,((n=t.functionValue.args)==null?void 0:n.map(Su))||[])})(r):rr._fromProto(r)}class IA{getBundleMetadata(e,t){return gd(e).get(t).next((n=>{if(n)return(function(i){return{id:i.bundleId,createTime:Xn(i.createTime),version:i.version}})(n)}))}saveBundleMetadata(e,t){return gd(e).put((function(s){return{bundleId:s.id,createTime:Jn($e(s.createTime)),version:s.version}})(t))}getNamedQuery(e,t){return _d(e).get(t).next((n=>{if(n)return(function(i){return{name:i.name,query:Nm(i.bundledQuery),readTime:Xn(i.readTime)}})(n)}))}saveNamedQuery(e,t){return _d(e).put((function(s){return{name:s.name,readTime:Jn($e(s.readTime)),bundledQuery:s.bundledQuery}})(t))}}function gd(r){return ve(r,Xo)}function _d(r){return ve(r,Zo)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ga{constructor(e,t){this.serializer=e,this.userId=t}static jr(e,t){const n=t.uid||"";return new ga(e,n)}getOverlay(e,t){return lr(e).get(pd(this.userId,t)).next((n=>n?Xi(this.serializer,n):null))}getOverlays(e,t){const n=nt();return A.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&n.set(s,i)})))).next((()=>n))}getAllOverlays(e,t){const n=nt();return lr(e).ee(((s,i)=>{const o=Xi(this.serializer,i);o.largestBatchId>t&&n.set(o.getKey(),o)})).next((()=>n))}saveOverlays(e,t,n){const s=[];return n.forEach(((i,o)=>{const u=new Oc(t,o);s.push(this.Hr(e,u))})),A.waitFor(s)}removeOverlaysForBatchId(e,t,n){const s=new Set;t.forEach((o=>s.add(ke(o.getCollectionPath()))));const i=[];return s.forEach((o=>{const u=IDBKeyRange.bound([this.userId,o,n],[this.userId,o,n+1],!1,!0);i.push(lr(e).Z(pu,u))})),A.waitFor(i)}getOverlaysForCollection(e,t,n){const s=nt(),i=ke(t),o=IDBKeyRange.bound([this.userId,i,n],[this.userId,i,Number.POSITIVE_INFINITY],!0);return lr(e).H(pu,o).next((u=>{for(const c of u){const h=Xi(this.serializer,c);s.set(h.getKey(),h)}return s}))}getOverlaysForCollectionGroup(e,t,n,s){const i=nt();let o;const u=IDBKeyRange.bound([this.userId,t,n],[this.userId,t,Number.POSITIVE_INFINITY],!0);return lr(e).ee({index:lp,range:u},((c,h,f)=>{const p=Xi(this.serializer,h);i.size()<s||p.largestBatchId===o?(i.set(p.getKey(),p),o=p.largestBatchId):f.done()})).next((()=>i))}Hr(e,t){return lr(e).put((function(s,i,o){const[u,c,h]=pd(i,o.mutation.key);return{userId:i,collectionPath:c,documentId:h,collectionGroup:o.mutation.key.getCollectionGroup(),largestBatchId:o.largestBatchId,overlayMutation:ko(s.zr,o.mutation)}})(this.serializer,this.userId,t))}}function lr(r){return ve(r,ea)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class EA{Jr(e){return ve(e,rc)}getSessionToken(e){return this.Jr(e).get("sessionToken").next((t=>{const n=t==null?void 0:t.value;return n?de.fromUint8Array(n):de.EMPTY_BYTE_STRING}))}setSessionToken(e,t){return this.Jr(e).put({name:"sessionToken",value:t.toUint8Array()})}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kn{constructor(){}Yr(e,t){this.Zr(e,t),t.Xr()}Zr(e,t){if("nullValue"in e)this.ei(t,5);else if("booleanValue"in e)this.ei(t,10),t.ti(e.booleanValue?1:0);else if("integerValue"in e)this.ei(t,15),t.ti(ae(e.integerValue));else if("doubleValue"in e){const n=ae(e.doubleValue);isNaN(n)?this.ei(t,13):(this.ei(t,15),Sr(n)?t.ti(0):t.ti(n))}else if("timestampValue"in e){let n=e.timestampValue;this.ei(t,20),typeof n=="string"&&(n=kt(n)),t.ni(`${n.seconds||""}`),t.ti(n.nanos||0)}else if("stringValue"in e)this.ri(e.stringValue,t),this.ii(t);else if("bytesValue"in e)this.ei(t,30),t.si(Ot(e.bytesValue)),this.ii(t);else if("referenceValue"in e)this._i(e.referenceValue,t);else if("geoPointValue"in e){const n=e.geoPointValue;this.ei(t,45),t.ti(n.latitude||0),t.ti(n.longitude||0)}else"mapValue"in e?wp(e)?this.ei(t,Number.MAX_SAFE_INTEGER):Yn(e)?this.oi(e.mapValue,t):(this.ai(e.mapValue,t),this.ii(t)):"arrayValue"in e?(this.ui(e.arrayValue,t),this.ii(t)):B(19022,{ci:e})}ri(e,t){this.ei(t,25),this.li(e,t)}li(e,t){t.ni(e)}ai(e,t){const n=e.fields||{};this.ei(t,55);for(const s of Object.keys(n))this.ri(s,t),this.Zr(n[s],t)}oi(e,t){var o,u;const n=e.fields||{};this.ei(t,53);const s=Qn,i=((u=(o=n[s].arrayValue)==null?void 0:o.values)==null?void 0:u.length)||0;this.ei(t,15),t.ti(ae(i)),this.ri(s,t),this.Zr(n[s],t)}ui(e,t){const n=e.values||[];this.ei(t,50);for(const s of n)this.Zr(s,t)}_i(e,t){this.ei(t,37),F.fromName(e).path.forEach((n=>{this.ei(t,60),this.li(n,t)}))}ei(e,t){e.ti(t)}ii(e){e.ti(2)}}kn.Ei=new kn;/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law | agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES | CONDITIONS OF ANY KIND, either express | implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hr=255;function TA(r){if(r===0)return 8;let e=0;return r>>4||(e+=4,r<<=4),r>>6||(e+=2,r<<=2),r>>7||(e+=1),e}function yd(r){const e=64-(function(n){let s=0;for(let i=0;i<8;++i){const o=TA(255&n[i]);if(s+=o,o!==8)break}return s})(r);return Math.ceil(e/8)}class wA{constructor(){this.buffer=new Uint8Array(1024),this.position=0}hi(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.Ti(n.value),n=t.next();this.Pi()}Ri(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.Ii(n.value),n=t.next();this.Ai()}Vi(e){for(const t of e){const n=t.charCodeAt(0);if(n<128)this.Ti(n);else if(n<2048)this.Ti(960|n>>>6),this.Ti(128|63&n);else if(t<"\uD800"||"\uDBFF"<t)this.Ti(480|n>>>12),this.Ti(128|63&n>>>6),this.Ti(128|63&n);else{const s=t.codePointAt(0);this.Ti(240|s>>>18),this.Ti(128|63&s>>>12),this.Ti(128|63&s>>>6),this.Ti(128|63&s)}}this.Pi()}di(e){for(const t of e){const n=t.charCodeAt(0);if(n<128)this.Ii(n);else if(n<2048)this.Ii(960|n>>>6),this.Ii(128|63&n);else if(t<"\uD800"||"\uDBFF"<t)this.Ii(480|n>>>12),this.Ii(128|63&n>>>6),this.Ii(128|63&n);else{const s=t.codePointAt(0);this.Ii(240|s>>>18),this.Ii(128|63&s>>>12),this.Ii(128|63&s>>>6),this.Ii(128|63&s)}}this.Ai()}fi(e){const t=this.mi(e),n=yd(t);this.pi(1+n),this.buffer[this.position++]=255&n;for(let s=t.length-n;s<t.length;++s)this.buffer[this.position++]=255&t[s]}gi(e){const t=this.mi(e),n=yd(t);this.pi(1+n),this.buffer[this.position++]=~(255&n);for(let s=t.length-n;s<t.length;++s)this.buffer[this.position++]=~(255&t[s])}yi(){this.wi(hr),this.wi(255)}bi(){this.Si(hr),this.Si(255)}reset(){this.position=0}seed(e){this.pi(e.length),this.buffer.set(e,this.position),this.position+=e.length}Di(){return this.buffer.slice(0,this.position)}mi(e){const t=(function(i){const o=new DataView(new ArrayBuffer(8));return o.setFloat64(0,i,!1),new Uint8Array(o.buffer)})(e),n=!!(128&t[0]);t[0]^=n?255:128;for(let s=1;s<t.length;++s)t[s]^=n?255:0;return t}Ti(e){const t=255&e;t===0?(this.wi(0),this.wi(255)):t===hr?(this.wi(hr),this.wi(0)):this.wi(t)}Ii(e){const t=255&e;t===0?(this.Si(0),this.Si(255)):t===hr?(this.Si(hr),this.Si(0)):this.Si(e)}Pi(){this.wi(0),this.wi(1)}Ai(){this.Si(0),this.Si(1)}wi(e){this.pi(1),this.buffer[this.position++]=e}Si(e){this.pi(1),this.buffer[this.position++]=~e}pi(e){const t=e+this.position;if(t<=this.buffer.length)return;let n=2*this.buffer.length;n<t&&(n=t);const s=new Uint8Array(n);s.set(this.buffer),this.buffer=s}}class vA{constructor(e){this.xi=e}si(e){this.xi.hi(e)}ni(e){this.xi.Vi(e)}ti(e){this.xi.fi(e)}Xr(){this.xi.yi()}}class AA{constructor(e){this.xi=e}si(e){this.xi.Ri(e)}ni(e){this.xi.di(e)}ti(e){this.xi.gi(e)}Xr(){this.xi.bi()}}class _s{constructor(){this.xi=new wA,this.ascending=new vA(this.xi),this.descending=new AA(this.xi)}seed(e){this.xi.seed(e)}Ci(e){return e===0?this.ascending:this.descending}Di(){return this.xi.Di()}reset(){this.xi.reset()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class On{constructor(e,t,n,s){this.Fi=e,this.Oi=t,this.Mi=n,this.Ni=s}Li(){const e=this.Ni.length,t=e===0||this.Ni[e-1]===255?e+1:e,n=new Uint8Array(t);return n.set(this.Ni,0),t!==e?n.set([0],this.Ni.length):++n[n.length-1],new On(this.Fi,this.Oi,this.Mi,n)}Bi(e,t,n){return{indexId:this.Fi,uid:e,arrayValue:mo(this.Mi),directionalValue:mo(this.Ni),orderedDocumentKey:mo(t),documentKey:n.path.toArray()}}Ui(e,t,n){const s=this.Bi(e,t,n);return[s.indexId,s.uid,s.arrayValue,s.directionalValue,s.orderedDocumentKey,s.documentKey]}}function Gt(r,e){let t=r.Fi-e.Fi;return t!==0?t:(t=Id(r.Mi,e.Mi),t!==0?t:(t=Id(r.Ni,e.Ni),t!==0?t:F.comparator(r.Oi,e.Oi)))}function Id(r,e){for(let t=0;t<r.length&&t<e.length;++t){const n=r[t]-e[t];if(n!==0)return n}return r.length-e.length}function mo(r){return of()?(function(t){let n="";for(let s=0;s<t.length;s++)n+=String.fromCharCode(t[s]);return n})(r):r}function Ed(r){return typeof r!="string"?r:(function(t){const n=new Uint8Array(t.length);for(let s=0;s<t.length;s++)n[s]=t.charCodeAt(s);return n})(r)}class Td{constructor(e){this.ki=new re(((t,n)=>le.comparator(t.field,n.field))),this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.qi=e.orderBy,this.$i=[];for(const t of e.filters){const n=t;n.isInequality()?this.ki=this.ki.add(n):this.$i.push(n)}}get Ki(){return this.ki.size>1}Wi(e){if(N(e.collectionGroup===this.collectionId,49279),this.Ki)return!1;const t=hu(e);if(t!==void 0&&!this.Qi(t))return!1;const n=Cn(e);let s=new Set,i=0,o=0;for(;i<n.length&&this.Qi(n[i]);++i)s=s.add(n[i].fieldPath.canonicalString());if(i===n.length)return!0;if(this.ki.size>0){const u=this.ki.getIterator().getNext();if(!s.has(u.field.canonicalString())){const c=n[i];if(!this.Gi(u,c)||!this.zi(this.qi[o++],c))return!1}++i}for(;i<n.length;++i){const u=n[i];if(o>=this.qi.length||!this.zi(this.qi[o++],u))return!1}return!0}ji(){if(this.Ki)return null;let e=new re(le.comparator);const t=[];for(const n of this.$i)if(!n.field.isKeyField())if(n.op==="array-contains"||n.op==="array-contains-any")t.push(new ao(n.field,2));else{if(e.has(n.field))continue;e=e.add(n.field),t.push(new ao(n.field,0))}for(const n of this.qi)n.field.isKeyField()||e.has(n.field)||(e=e.add(n.field),t.push(new ao(n.field,n.dir==="asc"?0:1)));return new Ro(Ro.UNKNOWN_ID,this.collectionId,t,zs.empty())}Qi(e){for(const t of this.$i)if(this.Gi(t,e))return!0;return!1}Gi(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;const n=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===n}zi(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function km(r){var t,n;if(N(r instanceof X||r instanceof ie,20012),r instanceof X){if(r instanceof Up){const s=((n=(t=r.value.arrayValue)==null?void 0:t.values)==null?void 0:n.map((i=>X.create(r.field,"==",i))))||[];return ie.create(s,"or")}return r}const e=r.filters.map((s=>km(s)));return ie.create(e,r.op)}function RA(r){if(r.getFilters().length===0)return[];const e=xu(km(r));return N(Om(e),7391),Vu(e)||Cu(e)?[e]:e.getFilters()}function Vu(r){return r instanceof X}function Cu(r){return r instanceof ie&&dc(r)}function Om(r){return Vu(r)||Cu(r)||(function(t){if(t instanceof ie&&yu(t)){for(const n of t.getFilters())if(!Vu(n)&&!Cu(n))return!1;return!0}return!1})(r)}function xu(r){if(N(r instanceof X||r instanceof ie,34018),r instanceof X)return r;if(r.filters.length===1)return xu(r.filters[0]);const e=r.filters.map((n=>xu(n)));let t=ie.create(e,r.op);return t=Uo(t),Om(t)?t:(N(t instanceof ie,64498),N(Fr(t),40251),N(t.filters.length>1,57927),t.filters.reduce(((n,s)=>Lc(n,s))))}function Lc(r,e){let t;return N(r instanceof X||r instanceof ie,38388),N(e instanceof X||e instanceof ie,25473),t=r instanceof X?e instanceof X?(function(s,i){return ie.create([s,i],"and")})(r,e):wd(r,e):e instanceof X?wd(e,r):(function(s,i){if(N(s.filters.length>0&&i.filters.length>0,48005),Fr(s)&&Fr(i))return Op(s,i.getFilters());const o=yu(s)?s:i,u=yu(s)?i:s,c=o.filters.map((h=>Lc(h,u)));return ie.create(c,"or")})(r,e),Uo(t)}function wd(r,e){if(Fr(e))return Op(e,r.getFilters());{const t=e.filters.map((n=>Lc(r,n)));return ie.create(t,"or")}}function Uo(r){if(N(r instanceof X||r instanceof ie,11850),r instanceof X)return r;const e=r.getFilters();if(e.length===1)return Uo(e[0]);if(Np(r))return r;const t=e.map((s=>Uo(s))),n=[];return t.forEach((s=>{s instanceof X?n.push(s):s instanceof ie&&(s.op===r.op?n.push(...s.filters):n.push(s))})),n.length===1?n[0]:ie.create(n,r.op)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PA{constructor(){this.Hi=new Mc}addToCollectionParentIndex(e,t){return this.Hi.add(t),A.resolve()}getCollectionParents(e,t){return A.resolve(this.Hi.getEntries(t))}addFieldIndex(e,t){return A.resolve()}deleteFieldIndex(e,t){return A.resolve()}deleteAllFieldIndexes(e){return A.resolve()}createTargetIndexes(e,t){return A.resolve()}getDocumentsMatchingTarget(e,t){return A.resolve(null)}getIndexType(e,t){return A.resolve(0)}getFieldIndexes(e,t){return A.resolve([])}getNextCollectionGroupToUpdate(e){return A.resolve(null)}getMinOffset(e,t){return A.resolve(et.min())}getMinOffsetFromCollectionGroup(e,t){return A.resolve(et.min())}updateCollectionGroup(e,t,n){return A.resolve()}updateIndexEntries(e,t){return A.resolve()}}class Mc{constructor(){this.index={}}add(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t]||new re(ee.comparator),i=!s.has(n);return this.index[t]=s.add(n),i}has(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t];return s&&s.has(n)}getEntries(e){return(this.index[e]||new re(ee.comparator)).toArray()}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vd="IndexedDbIndexManager",Zi=new Uint8Array(0);class bA{constructor(e,t){this.databaseId=t,this.Ji=new Mc,this.Yi=new Ut((n=>Do(n)),((n,s)=>fc(n,s))),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.Ji.has(t)){const n=t.lastSegment(),s=t.popLast();e.addOnCommittedListener((()=>{this.Ji.add(t)}));const i={collectionId:n,parent:ke(s)};return Ad(e).put(i)}return A.resolve()}getCollectionParents(e,t){const n=[],s=IDBKeyRange.bound([t,""],[ep(t),""],!1,!0);return Ad(e).H(s).next((i=>{for(const o of i){if(o.collectionId!==t)break;n.push(mt(o.parent))}return n}))}addFieldIndex(e,t){const n=ys(e),s=(function(u){return{indexId:u.indexId,collectionGroup:u.collectionGroup,fields:u.fields.map((c=>[c.fieldPath.canonicalString(),c.kind]))}})(t);delete s.indexId;const i=n.add(s);if(t.indexState){const o=fr(e);return i.next((u=>{o.put(md(u,this.uid,t.indexState.sequenceNumber,t.indexState.offset))}))}return i.next()}deleteFieldIndex(e,t){const n=ys(e),s=fr(e),i=dr(e);return n.delete(t.indexId).next((()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))).next((()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))))}deleteAllFieldIndexes(e){const t=ys(e),n=dr(e),s=fr(e);return t.Z().next((()=>n.Z())).next((()=>s.Z()))}createTargetIndexes(e,t){return A.forEach(this.Zi(t),(n=>this.getIndexType(e,n).next((s=>{if(s===0||s===1){const i=new Td(n).ji();if(i!=null)return this.addFieldIndex(e,i)}}))))}getDocumentsMatchingTarget(e,t){const n=dr(e);let s=!0;const i=new Map;return A.forEach(this.Zi(t),(o=>this.Xi(e,o).next((u=>{s&&(s=!!u),i.set(o,u)})))).next((()=>{if(s){let o=Q();const u=[];return A.forEach(i,((c,h)=>{D(vd,`Using index ${(function(H){return`id=${H.indexId}|cg=${H.collectionGroup}|f=${H.fields.map((ue=>`${ue.fieldPath}:${ue.kind}`)).join(",")}`})(c)} to execute ${Do(t)}`);const f=(function(H,ue){const te=hu(ue);if(te===void 0)return null;for(const ne of No(H,te.fieldPath))switch(ne.op){case"array-contains-any":return ne.value.arrayValue.values||[];case"array-contains":return[ne.value]}return null})(h,c),p=(function(H,ue){const te=new Map;for(const ne of Cn(ue))for(const T of No(H,ne.fieldPath))switch(T.op){case"==":case"in":te.set(ne.fieldPath.canonicalString(),T.value);break;case"not-in":case"!=":return te.set(ne.fieldPath.canonicalString(),T.value),Array.from(te.values())}return null})(h,c),_=(function(H,ue){const te=[];let ne=!0;for(const T of Cn(ue)){const g=T.kind===0?Wh(H,T.fieldPath,H.startAt):Qh(H,T.fieldPath,H.startAt);te.push(g.value),ne&&(ne=g.inclusive)}return new Ur(te,ne)})(h,c),P=(function(H,ue){const te=[];let ne=!0;for(const T of Cn(ue)){const g=T.kind===0?Qh(H,T.fieldPath,H.endAt):Wh(H,T.fieldPath,H.endAt);te.push(g.value),ne&&(ne=g.inclusive)}return new Ur(te,ne)})(h,c),V=this.es(c,h,_),O=this.es(c,h,P),M=this.ts(c,h,p),z=this.ns(c.indexId,f,V,_.inclusive,O,P.inclusive,M);return A.forEach(z,(K=>n.Y(K,t.limit).next((H=>{H.forEach((ue=>{const te=F.fromSegments(ue.documentKey);o.has(te)||(o=o.add(te),u.push(te))}))}))))})).next((()=>u))}return A.resolve(null)}))}Zi(e){let t=this.Yi.get(e);return t||(e.filters.length===0?t=[e]:t=RA(ie.create(e.filters,"and")).map((n=>Eu(e.path,e.collectionGroup,e.orderBy,n.getFilters(),e.limit,e.startAt,e.endAt))),this.Yi.set(e,t),t)}ns(e,t,n,s,i,o,u){const c=(t!=null?t.length:1)*Math.max(n.length,i.length),h=c/(t!=null?t.length:1),f=[];for(let p=0;p<c;++p){const _=t?this.rs(t[p/h]):Zi,P=this.ss(e,_,n[p%h],s),V=this._s(e,_,i[p%h],o),O=u.map((M=>this.ss(e,_,M,!0)));f.push(...this.createRange(P,V,O))}return f}ss(e,t,n,s){const i=new On(e,F.empty(),t,n);return s?i:i.Li()}_s(e,t,n,s){const i=new On(e,F.empty(),t,n);return s?i.Li():i}Xi(e,t){const n=new Td(t),s=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,s).next((i=>{let o=null;for(const u of i)n.Wi(u)&&(!o||u.fields.length>o.fields.length)&&(o=u);return o}))}getIndexType(e,t){let n=2;const s=this.Zi(t);return A.forEach(s,(i=>this.Xi(e,i).next((o=>{o?n!==0&&o.fields.length<(function(c){let h=new re(le.comparator),f=!1;for(const p of c.filters)for(const _ of p.getFlattenedFilters())_.field.isKeyField()||(_.op==="array-contains"||_.op==="array-contains-any"?f=!0:h=h.add(_.field));for(const p of c.orderBy)p.field.isKeyField()||(h=h.add(p.field));return h.size+(f?1:0)})(i)&&(n=1):n=0})))).next((()=>(function(o){return o.limit!==null})(t)&&s.length>1&&n===2?1:n))}us(e,t){const n=new _s;for(const s of Cn(e)){const i=t.data.field(s.fieldPath);if(i==null)return null;const o=n.Ci(s.kind);kn.Ei.Yr(i,o)}return n.Di()}rs(e){const t=new _s;return kn.Ei.Yr(e,t.Ci(0)),t.Di()}cs(e,t){const n=new _s;return kn.Ei.Yr(ac(this.databaseId,t),n.Ci((function(i){const o=Cn(i);return o.length===0?0:o[o.length-1].kind})(e))),n.Di()}ts(e,t,n){if(n===null)return[];let s=[];s.push(new _s);let i=0;for(const o of Cn(e)){const u=n[i++];for(const c of s)if(this.ls(t,o.fieldPath)&&fn(u))s=this.Es(s,o,u);else{const h=c.Ci(o.kind);kn.Ei.Yr(u,h)}}return this.hs(s)}es(e,t,n){return this.ts(e,t,n.position)}hs(e){const t=[];for(let n=0;n<e.length;++n)t[n]=e[n].Di();return t}Es(e,t,n){const s=[...e],i=[];for(const o of n.arrayValue.values||[])for(const u of s){const c=new _s;c.seed(u.Di()),kn.Ei.Yr(o,c.Ci(t.kind)),i.push(c)}return i}ls(e,t){return!!e.filters.find((n=>n instanceof X&&n.field.isEqual(t)&&(n.op==="in"||n.op==="not-in")))}getFieldIndexes(e,t){const n=ys(e),s=fr(e);return(t?n.H(fu,IDBKeyRange.bound(t,t)):n.H()).next((i=>{const o=[];return A.forEach(i,(u=>s.get([u.indexId,this.uid]).next((c=>{o.push((function(f,p){const _=p?new zs(p.sequenceNumber,new et(Xn(p.readTime),new F(mt(p.documentKey)),p.largestBatchId)):zs.empty(),P=f.fields.map((([V,O])=>new ao(le.fromServerFormat(V),O)));return new Ro(f.indexId,f.collectionGroup,P,_)})(u,c))})))).next((()=>o))}))}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next((t=>t.length===0?null:(t.sort(((n,s)=>{const i=n.indexState.sequenceNumber-s.indexState.sequenceNumber;return i!==0?i:G(n.collectionGroup,s.collectionGroup)})),t[0].collectionGroup)))}updateCollectionGroup(e,t,n){const s=ys(e),i=fr(e);return this.Ts(e).next((o=>s.H(fu,IDBKeyRange.bound(t,t)).next((u=>A.forEach(u,(c=>i.put(md(c.indexId,this.uid,o,n))))))))}updateIndexEntries(e,t){const n=new Map;return A.forEach(t,((s,i)=>{const o=n.get(s.collectionGroup);return(o?A.resolve(o):this.getFieldIndexes(e,s.collectionGroup)).next((u=>(n.set(s.collectionGroup,u),A.forEach(u,(c=>this.Ps(e,s,c).next((h=>{const f=this.Rs(i,c);return h.isEqual(f)?A.resolve():this.Is(e,i,c,h,f)})))))))}))}As(e,t,n,s){return dr(e).put(s.Bi(this.uid,this.cs(n,t.key),t.key))}Vs(e,t,n,s){return dr(e).delete(s.Ui(this.uid,this.cs(n,t.key),t.key))}Ps(e,t,n){const s=dr(e);let i=new re(Gt);return s.ee({index:cp,range:IDBKeyRange.only([n.indexId,this.uid,mo(this.cs(n,t))])},((o,u)=>{i=i.add(new On(n.indexId,t,Ed(u.arrayValue),Ed(u.directionalValue)))})).next((()=>i))}Rs(e,t){let n=new re(Gt);const s=this.us(t,e);if(s==null)return n;const i=hu(t);if(i!=null){const o=e.data.field(i.fieldPath);if(fn(o))for(const u of o.arrayValue.values||[])n=n.add(new On(t.indexId,e.key,this.rs(u),s))}else n=n.add(new On(t.indexId,e.key,Zi,s));return n}Is(e,t,n,s,i){D(vd,"Updating index entries for document '%s'",t.key);const o=[];return(function(c,h,f,p,_){const P=c.getIterator(),V=h.getIterator();let O=cr(P),M=cr(V);for(;O||M;){let z=!1,K=!1;if(O&&M){const H=f(O,M);H<0?K=!0:H>0&&(z=!0)}else O!=null?K=!0:z=!0;z?(p(M),M=cr(V)):K?(_(O),O=cr(P)):(O=cr(P),M=cr(V))}})(s,i,Gt,(u=>{o.push(this.As(e,t,n,u))}),(u=>{o.push(this.Vs(e,t,n,u))})),A.waitFor(o)}Ts(e){let t=1;return fr(e).ee({index:up,reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},((n,s,i)=>{i.done(),t=s.sequenceNumber+1})).next((()=>t))}createRange(e,t,n){n=n.sort(((o,u)=>Gt(o,u))).filter(((o,u,c)=>!u||Gt(o,c[u-1])!==0));const s=[];s.push(e);for(const o of n){const u=Gt(o,e),c=Gt(o,t);if(u===0)s[0]=e.Li();else if(u>0&&c<0)s.push(o),s.push(o.Li());else if(c>0)break}s.push(t);const i=[];for(let o=0;o<s.length;o+=2){if(this.ds(s[o],s[o+1]))return[];const u=s[o].Ui(this.uid,Zi,F.empty()),c=s[o+1].Ui(this.uid,Zi,F.empty());i.push(IDBKeyRange.bound(u,c))}return i}ds(e,t){return Gt(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(Rd)}getMinOffset(e,t){return A.mapArray(this.Zi(t),(n=>this.Xi(e,n).next((s=>s||B(44426))))).next(Rd)}}function Ad(r){return ve(r,Hs)}function dr(r){return ve(r,Ds)}function ys(r){return ve(r,nc)}function fr(r){return ve(r,xs)}function Rd(r){N(r.length!==0,28825);let e=r[0].indexState.offset,t=e.largestBatchId;for(let n=1;n<r.length;n++){const s=r[n].indexState.offset;Zu(s,e)<0&&(e=s),t<s.largestBatchId&&(t=s.largestBatchId)}return new et(e.readTime,e.documentKey,t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lm(r,e,t){const n=r.store(ct),s=r.store(Vr),i=[],o=IDBKeyRange.only(t.batchId);let u=0;const c=n.ee({range:o},((f,p,_)=>(u++,_.delete())));i.push(c.next((()=>{N(u===1,47070,{batchId:t.batchId})})));const h=[];for(const f of t.mutations){const p=ip(e,f.key.path,t.batchId);i.push(s.delete(p)),h.push(f.key)}return A.waitFor(i).next((()=>h))}function Fo(r){if(!r)return 0;let e;if(r.document)e=r.document;else if(r.unknownDocument)e=r.unknownDocument;else{if(!r.noDocument)throw B(14731);e=r.noDocument}return JSON.stringify(e).length}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _a{constructor(e,t,n,s){this.userId=e,this.serializer=t,this.indexManager=n,this.referenceDelegate=s,this.fs={}}static jr(e,t,n,s){N(e.uid!=="",64387);const i=e.isAuthenticated()?e.uid:"";return new _a(i,t,n,s)}checkEmpty(e){let t=!0;const n=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return Ht(e).ee({index:Ln,range:n},((s,i,o)=>{t=!1,o.done()})).next((()=>t))}addMutationBatch(e,t,n,s){const i=Ir(e),o=Ht(e);return o.add({}).next((u=>{N(typeof u=="number",49019);const c=new Nc(u,t,n,s),h=(function(P,V,O){const M=O.baseMutations.map((K=>ko(P.zr,K))),z=O.mutations.map((K=>ko(P.zr,K)));return{userId:V,batchId:O.batchId,localWriteTimeMs:O.localWriteTime.toMillis(),baseMutations:M,mutations:z}})(this.serializer,this.userId,c),f=[];let p=new re(((_,P)=>G(_.canonicalString(),P.canonicalString())));for(const _ of s){const P=ip(this.userId,_.key.path,u);p=p.add(_.key.path.popLast()),f.push(o.put(h)),f.push(i.put(P,eT))}return p.forEach((_=>{f.push(this.indexManager.addToCollectionParentIndex(e,_))})),e.addOnCommittedListener((()=>{this.fs[u]=c.keys()})),A.waitFor(f).next((()=>c))}))}lookupMutationBatch(e,t){return Ht(e).get(t).next((n=>n?(N(n.userId===this.userId,48,"Unexpected user for mutation batch",{userId:n.userId,batchId:t}),Nn(this.serializer,n)):null))}ps(e,t){return this.fs[t]?A.resolve(this.fs[t]):this.lookupMutationBatch(e,t).next((n=>{if(n){const s=n.keys();return this.fs[t]=s,s}return null}))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,s=IDBKeyRange.lowerBound([this.userId,n]);let i=null;return Ht(e).ee({index:Ln,range:s},((o,u,c)=>{u.userId===this.userId&&(N(u.batchId>=n,47524,{gs:n}),i=Nn(this.serializer,u)),c.done()})).next((()=>i))}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let n=Un;return Ht(e).ee({index:Ln,range:t,reverse:!0},((s,i,o)=>{n=i.batchId,o.done()})).next((()=>n))}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,Un],[this.userId,Number.POSITIVE_INFINITY]);return Ht(e).H(Ln,t).next((n=>n.map((s=>Nn(this.serializer,s)))))}getAllMutationBatchesAffectingDocumentKey(e,t){const n=uo(this.userId,t.path),s=IDBKeyRange.lowerBound(n),i=[];return Ir(e).ee({range:s},((o,u,c)=>{const[h,f,p]=o,_=mt(f);if(h===this.userId&&t.path.isEqual(_))return Ht(e).get(p).next((P=>{if(!P)throw B(61480,{ys:o,batchId:p});N(P.userId===this.userId,10503,"Unexpected user for mutation batch",{userId:P.userId,batchId:p}),i.push(Nn(this.serializer,P))}));c.done()})).next((()=>i))}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new re(G);const s=[];return t.forEach((i=>{const o=uo(this.userId,i.path),u=IDBKeyRange.lowerBound(o),c=Ir(e).ee({range:u},((h,f,p)=>{const[_,P,V]=h,O=mt(P);_===this.userId&&i.path.isEqual(O)?n=n.add(V):p.done()}));s.push(c)})),A.waitFor(s).next((()=>this.ws(e,n)))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,s=n.length+1,i=uo(this.userId,n),o=IDBKeyRange.lowerBound(i);let u=new re(G);return Ir(e).ee({range:o},((c,h,f)=>{const[p,_,P]=c,V=mt(_);p===this.userId&&n.isPrefixOf(V)?V.length===s&&(u=u.add(P)):f.done()})).next((()=>this.ws(e,u)))}ws(e,t){const n=[],s=[];return t.forEach((i=>{s.push(Ht(e).get(i).next((o=>{if(o===null)throw B(35274,{batchId:i});N(o.userId===this.userId,9748,"Unexpected user for mutation batch",{userId:o.userId,batchId:i}),n.push(Nn(this.serializer,o))})))})),A.waitFor(s).next((()=>n))}removeMutationBatch(e,t){return Lm(e.le,this.userId,t).next((n=>(e.addOnCommittedListener((()=>{this.bs(t.batchId)})),A.forEach(n,(s=>this.referenceDelegate.markPotentiallyOrphaned(e,s))))))}bs(e){delete this.fs[e]}performConsistencyCheck(e){return this.checkEmpty(e).next((t=>{if(!t)return A.resolve();const n=IDBKeyRange.lowerBound((function(o){return[o]})(this.userId)),s=[];return Ir(e).ee({range:n},((i,o,u)=>{if(i[0]===this.userId){const c=mt(i[1]);s.push(c)}else u.done()})).next((()=>{N(s.length===0,56720,{vs:s.map((i=>i.canonicalString()))})}))}))}containsKey(e,t){return Mm(e,this.userId,t)}Ss(e){return Um(e).get(this.userId).next((t=>t||{userId:this.userId,lastAcknowledgedBatchId:Un,lastStreamToken:""}))}}function Mm(r,e,t){const n=uo(e,t.path),s=n[1],i=IDBKeyRange.lowerBound(n);let o=!1;return Ir(r).ee({range:i,X:!0},((u,c,h)=>{const[f,p,_]=u;f===e&&p===s&&(o=!0),h.done()})).next((()=>o))}function Ht(r){return ve(r,ct)}function Ir(r){return ve(r,Vr)}function Um(r){return ve(r,Ks)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mt{constructor(e){this.Ds=e}next(){return this.Ds+=2,this.Ds}static xs(){return new Mt(0)}static Cs(){return new Mt(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class SA{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.Fs(e).next((t=>{const n=new Mt(t.highestTargetId);return t.highestTargetId=n.next(),this.Os(e,t).next((()=>t.highestTargetId))}))}getLastRemoteSnapshotVersion(e){return this.Fs(e).next((t=>q.fromTimestamp(new se(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds))))}getHighestSequenceNumber(e){return this.Fs(e).next((t=>t.highestListenSequenceNumber))}setTargetsMetadata(e,t,n){return this.Fs(e).next((s=>(s.highestListenSequenceNumber=t,n&&(s.lastRemoteSnapshotVersion=n.toTimestamp()),t>s.highestListenSequenceNumber&&(s.highestListenSequenceNumber=t),this.Os(e,s))))}addTargetData(e,t){return this.Ms(e,t).next((()=>this.Fs(e).next((n=>(n.targetCount+=1,this.Ns(t,n),this.Os(e,n))))))}updateTargetData(e,t){return this.Ms(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next((()=>pr(e).delete(t.targetId))).next((()=>this.Fs(e))).next((n=>(N(n.targetCount>0,8065),n.targetCount-=1,this.Os(e,n))))}removeTargets(e,t,n){let s=0;const i=[];return pr(e).ee(((o,u)=>{const c=Ps(this.serializer,u);c.sequenceNumber<=t&&n.get(c.targetId)===null&&(s++,i.push(this.removeTargetData(e,c)))})).next((()=>A.waitFor(i))).next((()=>s))}forEachTarget(e,t){return pr(e).ee(((n,s)=>{const i=Ps(this.serializer,s);t(i)}))}Fs(e){return Pd(e).get(So).next((t=>(N(t!==null,2888),t)))}Os(e,t){return Pd(e).put(So,t)}Ms(e,t){return pr(e).put(Dm(this.serializer,t))}Ns(e,t){let n=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,n=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,n=!0),n}getTargetCount(e){return this.Fs(e).next((t=>t.targetCount))}getTargetData(e,t){const n=ma(t),s=IDBKeyRange.bound([n,Number.NEGATIVE_INFINITY],[n,Number.POSITIVE_INFINITY]);let i=null;return pr(e).ee({range:s,index:ap},((o,u,c)=>{const h=Ps(this.serializer,u);Dc(t,h.target)&&(i=h,c.done())})).next((()=>i))}addMatchingKeys(e,t,n){const s=[],i=nn(e);return t.forEach((o=>{const u=ke(o.path);s.push(i.put({targetId:n,path:u})),s.push(this.referenceDelegate.addReference(e,n,o))})),A.waitFor(s)}removeMatchingKeys(e,t,n){const s=nn(e);return A.forEach(t,(i=>{const o=ke(i.path);return A.waitFor([s.delete([n,o]),this.referenceDelegate.removeReference(e,n,i)])}))}removeMatchingKeysForTargetId(e,t){const n=nn(e),s=IDBKeyRange.bound([t],[t+1],!1,!0);return n.delete(s)}getMatchingKeysForTargetId(e,t){const n=IDBKeyRange.bound([t],[t+1],!1,!0),s=nn(e);let i=Q();return s.ee({range:n,X:!0},((o,u,c)=>{const h=mt(o[1]),f=new F(h);i=i.add(f)})).next((()=>i))}containsKey(e,t){const n=ke(t.path),s=IDBKeyRange.bound([n],[ep(n)],!1,!0);let i=0;return nn(e).ee({index:tc,X:!0,range:s},(([o,u],c,h)=>{o!==0&&(i++,h.done())})).next((()=>i>0))}dt(e,t){return pr(e).get(t).next((n=>n?Ps(this.serializer,n):null))}}function pr(r){return ve(r,Cr)}function Pd(r){return ve(r,Fn)}function nn(r){return ve(r,xr)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class VA{constructor(e,t){this.db=e,this.garbageCollector=dm(this,t)}lr(e){const t=this.Ls(e);return this.db.getTargetCache().getTargetCount(e).next((n=>t.next((s=>n+s))))}Ls(e){let t=0;return this.Er(e,(n=>{t++})).next((()=>t))}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}Er(e,t){return this.Bs(e,((n,s)=>t(s)))}addReference(e,t,n){return eo(e,n)}removeReference(e,t,n){return eo(e,n)}removeTargets(e,t,n){return this.db.getTargetCache().removeTargets(e,t,n)}markPotentiallyOrphaned(e,t){return eo(e,t)}Us(e,t){return(function(s,i){let o=!1;return Um(s).te((u=>Mm(s,u,i).next((c=>(c&&(o=!0),A.resolve(!c)))))).next((()=>o))})(e,t)}removeOrphanedDocuments(e,t){const n=this.db.getRemoteDocumentCache().newChangeBuffer(),s=[];let i=0;return this.Bs(e,((o,u)=>{if(u<=t){const c=this.Us(e,o).next((h=>{if(!h)return i++,n.getEntry(e,o).next((()=>(n.removeEntry(o,q.min()),nn(e).delete((function(p){return[0,ke(p.path)]})(o)))))}));s.push(c)}})).next((()=>A.waitFor(s))).next((()=>n.apply(e))).next((()=>i))}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,n)}updateLimboDocument(e,t){return eo(e,t)}Bs(e,t){const n=nn(e);let s,i=st.ce;return n.ee({index:tc},(([o,u],{path:c,sequenceNumber:h})=>{o===0?(i!==st.ce&&t(new F(mt(s)),i),i=h,s=c):i=st.ce})).next((()=>{i!==st.ce&&t(new F(mt(s)),i)}))}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function eo(r,e){return nn(r).put((function(n,s){return{targetId:0,path:ke(n.path),sequenceNumber:s}})(e,r.currentSequenceNumber))}// Copyright 2024 Google LLC* @license
function Fm(r,e){var n;let t=e;for(const s of r.stages)t=CA({serializer:r.serializer,serverTimestampBehavior:(n=r.listenOptions)==null?void 0:n.serverTimestampBehavior},s,t);return t}function ya(r,e){return Fm(r,[e]).length>0}function Bm(r,e){return ge(r)?ya(r,e):oa(r,e)}function CA(r,e,t){if(e instanceof Ai)return(function(s,i,o){return o.filter((u=>u.isFoundDocument()&&`/${u.key.getCollectionPath().canonicalString()}`===i.Vr))})(0,e,t);if(e instanceof ha)return(function(s,i,o){return o.filter((u=>{const c=Us($(i.condition).evaluate(s,u));return c!==void 0&&ut(c,Ge)}))})(r,e,t);if(e instanceof Ri)return(function(s,i,o){return o.filter((u=>u.isFoundDocument()&&u.key.getCollectionPath().lastSegment()===i.collectionId))})(0,e,t);if(e instanceof ca)return(function(s,i,o){return o.filter((u=>u.isFoundDocument()))})(0,0,t);if(e instanceof la)return(function(s,i,o){return o.filter((u=>u.isFoundDocument()&&i.mr.has(u.key.path.toStringWithLeadingSlash())))})(0,e,t);if(e instanceof qr)return(function(s,i,o){return o.slice(0,i.limit)})(0,e,t);if(e instanceof da)return(function(s,i,o){const u=i.orderings.map((c=>({ks:$(c.expr),direction:c.direction})));return[...o].sort(((c,h)=>{for(const{ks:f,direction:p}of u){const _=Us(f.evaluate(s,c)),P=Us(f.evaluate(s,h)),V=Oe(_??Tt,P??Tt);if(V!==0)return p==="ascending"?V:-V}return 0}))})(r,e,t);throw new Error(`Unknown stage: ${e._name}`)}function Du(r){const e=(function(n){for(let s=n.stages.length-1;s>=0;s--){const i=n.stages[s];if(i instanceof da)return i.orderings}throw new Error("Pipeline must contain at least one Sort stage")})(r);return(t,n)=>{for(const s of e){const i=Us($(s.expr).evaluate({serializer:r.serializer},t)),o=Us($(s.expr).evaluate({serializer:r.serializer},n)),u=Oe(i||Tt,o||Tt);if(u!==0)return s.direction==="ascending"?u:-u}return 0}}function Xa(r){for(let e=r.stages.length-1;e>=0;e--){const t=r.stages[e];if(t instanceof qr)return{limit:t.limit}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qm{constructor(){this.changes=new Ut((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,pe.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const n=this.changes.get(t);return n!==void 0?A.resolve(n):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xA{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,n){return Wt(e).put(n)}removeEntry(e,t,n){return Wt(e).delete((function(i,o){const u=i.path.toArray();return[u.slice(0,u.length-2),u[u.length-2],Mo(o),u[u.length-1]]})(t,n))}updateMetadata(e,t){return this.getMetadata(e).next((n=>(n.byteSize+=t,this.qs(e,n))))}getEntry(e,t){let n=pe.newInvalidDocument(t);return Wt(e).ee({index:co,range:IDBKeyRange.only(Is(t))},((s,i)=>{n=this.$s(t,i)})).next((()=>n))}Ks(e,t){let n={size:0,document:pe.newInvalidDocument(t)};return Wt(e).ee({index:co,range:IDBKeyRange.only(Is(t))},((s,i)=>{n={document:this.$s(t,i),size:Fo(i)}})).next((()=>n))}getEntries(e,t){let n=Te();return this.Ws(e,t,((s,i)=>{const o=this.$s(s,i);n=n.insert(s,o)})).next((()=>n))}getAllEntries(e){let t=Te();return Wt(e).ee(((n,s)=>{const i=this.$s(F.fromSegments(s.prefixPath.concat(s.collectionGroup,s.documentId)),s);t=t.insert(i.key,i)})).next((()=>t))}Qs(e,t){let n=Te(),s=new he(F.comparator);return this.Ws(e,t,((i,o)=>{const u=this.$s(i,o);n=n.insert(i,u),s=s.insert(i,Fo(o))})).next((()=>({documents:n,Gs:s})))}Ws(e,t,n){if(t.isEmpty())return A.resolve();let s=new re(Vd);t.forEach((c=>s=s.add(c)));const i=IDBKeyRange.bound(Is(s.first()),Is(s.last())),o=s.getIterator();let u=o.getNext();return Wt(e).ee({index:co,range:i},((c,h,f)=>{const p=F.fromSegments([...h.prefixPath,h.collectionGroup,h.documentId]);for(;u&&Vd(u,p)<0;)n(u,null),u=o.getNext();u&&u.isEqual(p)&&(n(u,h),u=o.hasNext()?o.getNext():null),u?f.j(Is(u)):f.done()})).next((()=>{for(;u;)n(u,null),u=o.hasNext()?o.getNext():null}))}getDocumentsMatchingQuery(e,t,n,s,i){const o=ge(t)?ee.fromString(Pi(t)):t.path,u=[o.popLast().toArray(),o.lastSegment(),Mo(n.readTime),n.documentKey.path.isEmpty()?"":n.documentKey.path.lastSegment()],c=[o.popLast().toArray(),o.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return Wt(e).H(IDBKeyRange.bound(u,c,!0)).next((h=>{i==null||i.incrementDocumentReadCount(h.length);let f=Te();for(const p of h){const _=this.$s(F.fromSegments(p.prefixPath.concat(p.collectionGroup,p.documentId)),p);_.isFoundDocument()&&(Bm(t,_)||s.has(_.key))&&(f=f.insert(_.key,_))}return f}))}getAllFromCollectionGroup(e,t,n,s){let i=Te();const o=Sd(t,n),u=Sd(t,et.max());return Wt(e).ee({index:op,range:IDBKeyRange.bound(o,u,!0)},((c,h,f)=>{const p=this.$s(F.fromSegments(h.prefixPath.concat(h.collectionGroup,h.documentId)),h);i=i.insert(p.key,p),i.size===s&&f.done()})).next((()=>i))}newChangeBuffer(e){return new DA(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next((t=>t.byteSize))}getMetadata(e){return bd(e).get(du).next((t=>(N(!!t,20021),t)))}qs(e,t){return bd(e).put(du,t)}$s(e,t){if(t){const n=_A(this.serializer,t);if(!(n.isNoDocument()&&n.version.isEqual(q.min())))return n}return pe.newInvalidDocument(e)}}function $m(r){return new xA(r)}class DA extends qm{constructor(e,t){super(),this.zs=e,this.trackRemovals=t,this.js=new Ut((n=>n.toString()),((n,s)=>n.isEqual(s)))}applyChanges(e){const t=[];let n=0,s=new re(((i,o)=>G(i.canonicalString(),o.canonicalString())));return this.changes.forEach(((i,o)=>{const u=this.js.get(i);if(t.push(this.zs.removeEntry(e,i,u.readTime)),o.isValidDocument()){const c=fd(this.zs.serializer,o);s=s.add(i.path.popLast());const h=Fo(c);n+=h-u.size,t.push(this.zs.addEntry(e,i,c))}else if(n-=u.size,this.trackRemovals){const c=fd(this.zs.serializer,o.convertToNoDocument(q.min()));t.push(this.zs.addEntry(e,i,c))}})),s.forEach((i=>{t.push(this.zs.indexManager.addToCollectionParentIndex(e,i))})),t.push(this.zs.updateMetadata(e,n)),A.waitFor(t)}getFromCache(e,t){return this.zs.Ks(e,t).next((n=>(this.js.set(t,{size:n.size,readTime:n.document.readTime}),n.document)))}getAllFromCache(e,t){return this.zs.Qs(e,t).next((({documents:n,Gs:s})=>(s.forEach(((i,o)=>{this.js.set(i,{size:o,readTime:n.get(i).readTime})})),n)))}}function bd(r){return ve(r,Gs)}function Wt(r){return ve(r,bo)}function Is(r){const e=r.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function Sd(r,e){const t=e.documentKey.path.toArray();return[r,Mo(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function Vd(r,e){const t=r.path.toArray(),n=e.path.toArray();let s=0;for(let i=0;i<t.length-2&&i<n.length-2;++i)if(s=G(t[i],n[i]),s)return s;return s=G(t.length,n.length),s||(s=G(t[t.length-2],n[n.length-2]),s||G(t[t.length-1],n[n.length-1]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class NA{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jm{constructor(e,t,n,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=n,this.indexManager=s}getDocument(e,t){let n=null;return this.documentOverlayCache.getOverlay(e,t).next((s=>(n=s,this.remoteDocumentCache.getEntry(e,t)))).next((s=>(n!==null&&ks(n.mutation,s,it.empty(),se.now()),s)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((n=>this.getLocalViewOfDocuments(e,n,Q()).next((()=>n))))}getLocalViewOfDocuments(e,t,n=Q()){const s=nt();return this.populateOverlays(e,s,t).next((()=>this.computeViews(e,t,s,n).next((i=>{let o=gr();return i.forEach(((u,c)=>{o=o.insert(u,c.overlayedDocument)})),o}))))}getOverlayedDocuments(e,t){const n=nt();return this.populateOverlays(e,n,t).next((()=>this.computeViews(e,t,n,Q())))}populateOverlays(e,t,n){const s=[];return n.forEach((i=>{t.has(i)||s.push(i)})),this.documentOverlayCache.getOverlays(e,s).next((i=>{i.forEach(((o,u)=>{t.set(o,u)}))}))}computeViews(e,t,n,s){let i=Te();const o=Ms(),u=(function(){return Ms()})();return t.forEach(((c,h)=>{const f=n.get(h.key);s.has(h.key)&&(f===void 0||f.mutation instanceof wn)?i=i.insert(h.key,h):f!==void 0?(o.set(h.key,f.mutation.getFieldMask()),ks(f.mutation,h,f.mutation.getFieldMask(),se.now())):o.set(h.key,it.empty())})),this.recalculateAndSaveOverlays(e,i).next((c=>(c.forEach(((h,f)=>o.set(h,f))),t.forEach(((h,f)=>u.set(h,new NA(f,o.get(h)??null)))),u)))}recalculateAndSaveOverlays(e,t){const n=Ms();let s=new he(((o,u)=>o-u)),i=Q();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((o=>{for(const u of o)u.keys().forEach((c=>{const h=t.get(c);if(h===null)return;let f=n.get(c)||it.empty();f=u.applyToLocalView(h,f),n.set(c,f);const p=(s.get(u.batchId)||Q()).add(c);s=s.insert(u.batchId,p)}))})).next((()=>{const o=[],u=s.getReverseIterator();for(;u.hasNext();){const c=u.getNext(),h=c.key,f=c.value,p=$p();f.forEach((_=>{if(!i.has(_)){const P=Vp(t.get(_),n.get(_));P!==null&&p.set(_,P),i=i.add(_)}})),o.push(this.documentOverlayCache.saveOverlays(e,h,p))}return A.waitFor(o)})).next((()=>n))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((n=>this.recalculateAndSaveOverlays(e,n)))}getDocumentsMatchingQuery(e,t,n,s){return ge(t)?this.getDocumentsMatchingPipeline(e,t,n,s):GT(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):HT(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,n,s):this.getDocumentsMatchingCollectionQuery(e,t,n,s)}getNextDocuments(e,t,n,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,n,s).next((i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,n.largestBatchId,s-i.size):A.resolve(nt());let u=js,c=i;return o.next((h=>A.forEach(h,((f,p)=>(u<p.largestBatchId&&(u=p.largestBatchId),i.get(f)?A.resolve():this.remoteDocumentCache.getEntry(e,f).next((_=>{c=c.insert(f,_)}))))).next((()=>this.populateOverlays(e,h,i))).next((()=>this.computeViews(e,c,h,Q()))).next((f=>({batchId:u,changes:qp(f)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new F(t)).next((n=>{let s=gr();return n.isFoundDocument()&&(s=s.insert(n.key,n)),s}))}getDocumentsMatchingCollectionGroupQuery(e,t,n,s){const i=t.collectionGroup;let o=gr();return this.indexManager.getCollectionParents(e,i).next((u=>A.forEach(u,(c=>{const h=(function(p,_){return new ia(_,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)})(t,c.child(i));return this.getDocumentsMatchingCollectionQuery(e,h,n,s).next((f=>{f.forEach(((p,_)=>{o=o.insert(p,_)}))}))})).next((()=>o))))}getDocumentsMatchingCollectionQuery(e,t,n,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,n.largestBatchId).next((o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,i,s)))).next((o=>this.retrieveMatchingLocalDocuments(i,o,(u=>oa(t,u)))))}getDocumentsMatchingPipeline(e,t,n,s){if(un(t)==="collection_group"){const i=Rc(t);let o=gr();return this.indexManager.getCollectionParents(e,i).next((u=>A.forEach(u,(c=>{const h=(function(p,_){const P=p.stages.map((V=>V instanceof Ri?new Ai(_.canonicalString(),{}):V));return new Fe(p.serializer,P)})(t,c.child(i));return this.getDocumentsMatchingPipeline(e,h,n,s).next((f=>{f.forEach(((p,_)=>{o=o.insert(p,_)}))}))})).next((()=>o))))}{let i;return this.getOverlaysForPipeline(e,t,n.largestBatchId).next((o=>{switch(i=o,un(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,i,s);case"documents":let u=Q();for(const c of bu(t))u=u.add(F.fromPath(c));return this.remoteDocumentCache.getEntries(e,u);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new U("invalid-argument",`Invalid pipeline source to execute offline: ${xt(t)}`)}})).next((o=>this.retrieveMatchingLocalDocuments(i,o,(u=>ya(t,u)))))}}retrieveMatchingLocalDocuments(e,t,n){e.forEach(((i,o)=>{const u=o.getKey();t.get(u)===null&&(t=t.insert(u,pe.newInvalidDocument(u)))}));let s=gr();return t.forEach(((i,o)=>{const u=e.get(i);u!==void 0&&ks(u.mutation,o,it.empty(),se.now()),n(o)&&(s=s.insert(i,o))})),s}getOverlaysForPipeline(e,t,n){switch(un(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,ee.fromString(Pi(t)),n);case"collection_group":throw new U("invalid-argument",`Unexpected collection group pipeline: ${xt(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,bu(t).map((s=>F.fromPath(s))));case"database":return this.documentOverlayCache.getAllOverlays(e,n);default:throw new U("invalid-argument",`Failed to get overlays for pipeline: ${xt(t)}`)}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kA{constructor(e){this.serializer=e,this.Hs=new Map,this.Js=new Map}getBundleMetadata(e,t){return A.resolve(this.Hs.get(t))}saveBundleMetadata(e,t){return this.Hs.set(t.id,(function(s){return{id:s.id,version:s.version,createTime:$e(s.createTime)}})(t)),A.resolve()}getNamedQuery(e,t){return A.resolve(this.Js.get(t))}saveNamedQuery(e,t){return this.Js.set(t.name,(function(s){return{name:s.name,query:Nm(s.bundledQuery),readTime:$e(s.readTime)}})(t)),A.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class OA{constructor(){this.overlays=new he(F.comparator),this.Ys=new Map}getOverlay(e,t){return A.resolve(this.overlays.get(t))}getOverlays(e,t){const n=nt();return A.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&n.set(s,i)})))).next((()=>n))}getAllOverlays(e,t){const n=nt();return this.overlays.forEach(((s,i)=>{i.largestBatchId>t&&n.set(s,i)})),A.resolve(n)}saveOverlays(e,t,n){return n.forEach(((s,i)=>{this.Hr(e,t,i)})),A.resolve()}removeOverlaysForBatchId(e,t,n){const s=this.Ys.get(n);return s!==void 0&&(s.forEach((i=>this.overlays=this.overlays.remove(i))),this.Ys.delete(n)),A.resolve()}getOverlaysForCollection(e,t,n){const s=nt(),i=t.length+1,o=new F(t.child("")),u=this.overlays.getIteratorFrom(o);for(;u.hasNext();){const c=u.getNext().value,h=c.getKey();if(!t.isPrefixOf(h.path))break;h.path.length===i&&c.largestBatchId>n&&s.set(c.getKey(),c)}return A.resolve(s)}getOverlaysForCollectionGroup(e,t,n,s){let i=new he(((h,f)=>h-f));const o=this.overlays.getIterator();for(;o.hasNext();){const h=o.getNext().value;if(h.getKey().getCollectionGroup()===t&&h.largestBatchId>n){let f=i.get(h.largestBatchId);f===null&&(f=nt(),i=i.insert(h.largestBatchId,f)),f.set(h.getKey(),h)}}const u=nt(),c=i.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach(((h,f)=>u.set(h,f))),!(u.size()>=s)););return A.resolve(u)}Hr(e,t,n){const s=this.overlays.get(n.key);if(s!==null){const o=this.Ys.get(s.largestBatchId).delete(n.key);this.Ys.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(n.key,new Oc(t,n));let i=this.Ys.get(t);i===void 0&&(i=Q(),this.Ys.set(t,i)),this.Ys.set(t,i.add(n.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class LA{constructor(){this.sessionToken=de.EMPTY_BYTE_STRING}getSessionToken(e){return A.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,A.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uc{constructor(){this.Zs=new re(Re.Xs),this.e_=new re(Re.t_)}isEmpty(){return this.Zs.isEmpty()}addReference(e,t){const n=new Re(e,t);this.Zs=this.Zs.add(n),this.e_=this.e_.add(n)}n_(e,t){e.forEach((n=>this.addReference(n,t)))}removeReference(e,t){this.r_(new Re(e,t))}i_(e,t){e.forEach((n=>this.removeReference(n,t)))}s_(e){const t=new F(new ee([])),n=new Re(t,e),s=new Re(t,e+1),i=[];return this.e_.forEachInRange([n,s],(o=>{this.r_(o),i.push(o.key)})),i}__(){this.Zs.forEach((e=>this.r_(e)))}r_(e){this.Zs=this.Zs.delete(e),this.e_=this.e_.delete(e)}o_(e){const t=new F(new ee([])),n=new Re(t,e),s=new Re(t,e+1);let i=Q();return this.e_.forEachInRange([n,s],(o=>{i=i.add(o.key)})),i}containsKey(e){const t=new Re(e,0),n=this.Zs.firstAfterOrEqual(t);return n!==null&&e.isEqual(n.key)}}class Re{constructor(e,t){this.key=e,this.a_=t}static Xs(e,t){return F.comparator(e.key,t.key)||G(e.a_,t.a_)}static t_(e,t){return G(e.a_,t.a_)||F.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class MA{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.gs=1,this.u_=new re(Re.Xs)}checkEmpty(e){return A.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,n,s){const i=this.gs;this.gs++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new Nc(i,t,n,s);this.mutationQueue.push(o);for(const u of s)this.u_=this.u_.add(new Re(u.key,i)),this.indexManager.addToCollectionParentIndex(e,u.key.path.popLast());return A.resolve(o)}lookupMutationBatch(e,t){return A.resolve(this.c_(t))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,s=this.l_(n),i=s<0?0:s;return A.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return A.resolve(this.mutationQueue.length===0?Un:this.gs-1)}getAllMutationBatches(e){return A.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const n=new Re(t,0),s=new Re(t,Number.POSITIVE_INFINITY),i=[];return this.u_.forEachInRange([n,s],(o=>{const u=this.c_(o.a_);i.push(u)})),A.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new re(G);return t.forEach((s=>{const i=new Re(s,0),o=new Re(s,Number.POSITIVE_INFINITY);this.u_.forEachInRange([i,o],(u=>{n=n.add(u.a_)}))})),A.resolve(this.E_(n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,s=n.length+1;let i=n;F.isDocumentKey(i)||(i=i.child(""));const o=new Re(new F(i),0);let u=new re(G);return this.u_.forEachWhile((c=>{const h=c.key.path;return!!n.isPrefixOf(h)&&(h.length===s&&(u=u.add(c.a_)),!0)}),o),A.resolve(this.E_(u))}E_(e){const t=[];return e.forEach((n=>{const s=this.c_(n);s!==null&&t.push(s)})),t}removeMutationBatch(e,t){N(this.h_(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let n=this.u_;return A.forEach(t.mutations,(s=>{const i=new Re(s.key,t.batchId);return n=n.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)})).next((()=>{this.u_=n}))}bs(e){}containsKey(e,t){const n=new Re(t,0),s=this.u_.firstAfterOrEqual(n);return A.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,A.resolve()}h_(e,t){return this.l_(e)}l_(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}c_(e){const t=this.l_(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class UA{constructor(e){this.T_=e,this.docs=(function(){return new he(F.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const n=t.key,s=this.docs.get(n),i=s?s.size:0,o=this.T_(t);return this.docs=this.docs.insert(n,{document:t.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const n=this.docs.get(t);return A.resolve(n?n.document.mutableCopy():pe.newInvalidDocument(t))}getEntries(e,t){let n=Te();return t.forEach((s=>{const i=this.docs.get(s);n=n.insert(s,i?i.document.mutableCopy():pe.newInvalidDocument(s))})),A.resolve(n)}getAllEntries(e){let t=Te();return this.docs.forEach(((n,s)=>{t=t.insert(n,s.document)})),A.resolve(t)}getDocumentsMatchingQuery(e,t,n,s){let i,o;ge(t)?(i=ee.fromString(Pi(t)),o=f=>ya(t,f)):(i=t.path,o=f=>oa(t,f));let u=Te();const c=new F(i.child("__id-9223372036854775808__")),h=this.docs.getIteratorFrom(c);for(;h.hasNext();){const{key:f,value:{document:p}}=h.getNext();if(!i.isPrefixOf(f.path))break;f.path.length>i.length+1||Zu(tp(p),n)<=0||(s.has(p.key)||o(p))&&(u=u.insert(p.key,p.mutableCopy()))}return A.resolve(u)}getAllFromCollectionGroup(e,t,n,s){B(9500)}P_(e,t){return A.forEach(this.docs,(n=>t(n)))}newChangeBuffer(e){return new FA(this)}getSize(e){return A.resolve(this.size)}}class FA extends qm{constructor(e){super(),this.zs=e}applyChanges(e){const t=[];return this.changes.forEach(((n,s)=>{s.isValidDocument()?t.push(this.zs.addEntry(e,s)):this.zs.removeEntry(n)})),A.waitFor(t)}getFromCache(e,t){return this.zs.getEntry(e,t)}getAllFromCache(e,t){return this.zs.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BA{constructor(e){this.persistence=e,this.R_=new Ut((t=>ma(t)),Dc),this.lastRemoteSnapshotVersion=q.min(),this.highestTargetId=0,this.I_=0,this.A_=new Uc,this.targetCount=0,this.V_=Mt.xs()}forEachTarget(e,t){return this.R_.forEach(((n,s)=>t(s))),A.resolve()}getLastRemoteSnapshotVersion(e){return A.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return A.resolve(this.I_)}allocateTargetId(e){return this.highestTargetId=this.V_.next(),A.resolve(this.highestTargetId)}setTargetsMetadata(e,t,n){return n&&(this.lastRemoteSnapshotVersion=n),t>this.I_&&(this.I_=t),A.resolve()}Ms(e){this.R_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.V_=new Mt(t),this.highestTargetId=t),e.sequenceNumber>this.I_&&(this.I_=e.sequenceNumber)}addTargetData(e,t){return this.Ms(t),this.targetCount+=1,A.resolve()}updateTargetData(e,t){return this.Ms(t),A.resolve()}removeTargetData(e,t){return this.R_.delete(t.target),this.A_.s_(t.targetId),this.targetCount-=1,A.resolve()}removeTargets(e,t,n){let s=0;const i=[];return this.R_.forEach(((o,u)=>{u.sequenceNumber<=t&&n.get(u.targetId)===null&&(this.R_.delete(o),i.push(this.removeMatchingKeysForTargetId(e,u.targetId)),s++)})),A.waitFor(i).next((()=>s))}getTargetCount(e){return A.resolve(this.targetCount)}getTargetData(e,t){const n=this.R_.get(t)||null;return A.resolve(n)}addMatchingKeys(e,t,n){return this.A_.n_(t,n),A.resolve()}removeMatchingKeys(e,t,n){this.A_.i_(t,n);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach((o=>{i.push(s.markPotentiallyOrphaned(e,o))})),A.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.A_.s_(t),A.resolve()}getMatchingKeysForTargetId(e,t){const n=this.A_.o_(t);return A.resolve(n)}containsKey(e,t){return A.resolve(this.A_.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fc{constructor(e,t){this.d_={},this.overlays={},this.f_=new st(0),this.m_=!1,this.m_=!0,this.p_=new LA,this.referenceDelegate=e(this),this.g_=new BA(this),this.indexManager=new PA,this.remoteDocumentCache=(function(s){return new UA(s)})((n=>this.referenceDelegate.y_(n))),this.serializer=new xm(t),this.w_=new kA(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.m_=!1,Promise.resolve()}get started(){return this.m_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new OA,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let n=this.d_[e.toKey()];return n||(n=new MA(t,this.referenceDelegate),this.d_[e.toKey()]=n),n}getGlobalsCache(){return this.p_}getTargetCache(){return this.g_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.w_}runTransaction(e,t,n){D("MemoryPersistence","Starting transaction:",e);const s=new qA(this.f_.next());return this.referenceDelegate.b_(),n(s).next((i=>this.referenceDelegate.v_(s).next((()=>i)))).toPromise().then((i=>(s.raiseOnCommittedEvent(),i)))}S_(e,t){return A.or(Object.values(this.d_).map((n=>()=>n.containsKey(e,t))))}}class qA extends rp{constructor(e){super(),this.currentSequenceNumber=e}}class Ia{constructor(e){this.persistence=e,this.D_=new Uc,this.x_=null}static C_(e){return new Ia(e)}get F_(){if(this.x_)return this.x_;throw B(60996)}addReference(e,t,n){return this.D_.addReference(n,t),this.F_.delete(n.toString()),A.resolve()}removeReference(e,t,n){return this.D_.removeReference(n,t),this.F_.add(n.toString()),A.resolve()}markPotentiallyOrphaned(e,t){return this.F_.add(t.toString()),A.resolve()}removeTarget(e,t){this.D_.s_(t.targetId).forEach((s=>this.F_.add(s.toString())));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,t.targetId).next((s=>{s.forEach((i=>this.F_.add(i.toString())))})).next((()=>n.removeTargetData(e,t)))}b_(){this.x_=new Set}v_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return A.forEach(this.F_,(n=>{const s=F.fromPath(n);return this.O_(e,s).next((i=>{i||t.removeEntry(s,q.min())}))})).next((()=>(this.x_=null,t.apply(e))))}updateLimboDocument(e,t){return this.O_(e,t).next((n=>{n?this.F_.delete(t.toString()):this.F_.add(t.toString())}))}y_(e){return 0}O_(e,t){return A.or([()=>A.resolve(this.D_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.S_(e,t)])}}class Bo{constructor(e,t){this.persistence=e,this.M_=new Ut((n=>ke(n.path)),((n,s)=>n.isEqual(s))),this.garbageCollector=dm(this,t)}static C_(e,t){return new Bo(e,t)}b_(){}v_(e){return A.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}lr(e){const t=this.Ls(e);return this.persistence.getTargetCache().getTargetCount(e).next((n=>t.next((s=>n+s))))}Ls(e){let t=0;return this.Er(e,(n=>{t++})).next((()=>t))}Er(e,t){return A.forEach(this.M_,((n,s)=>this.Us(e,n,s).next((i=>i?A.resolve():t(s)))))}removeTargets(e,t,n){return this.persistence.getTargetCache().removeTargets(e,t,n)}removeOrphanedDocuments(e,t){let n=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.P_(e,(o=>this.Us(e,o,t).next((u=>{u||(n++,i.removeEntry(o,q.min()))})))).next((()=>i.apply(e))).next((()=>n))}markPotentiallyOrphaned(e,t){return this.M_.set(t,e.currentSequenceNumber),A.resolve()}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,n)}addReference(e,t,n){return this.M_.set(n,e.currentSequenceNumber),A.resolve()}removeReference(e,t,n){return this.M_.set(n,e.currentSequenceNumber),A.resolve()}updateLimboDocument(e,t){return this.M_.set(t,e.currentSequenceNumber),A.resolve()}y_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=lo(e.data.value)),t}Us(e,t,n){return A.or([()=>this.persistence.S_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.M_.get(t);return A.resolve(s!==void 0&&s>n)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $A{constructor(e){this.serializer=e}U(e,t,n,s){const i=new Yo("createOrUpgrade",t);n<1&&s>=1&&((function(c){c.createObjectStore(yi)})(e),(function(c){c.createObjectStore(Ks,{keyPath:ZE}),c.createObjectStore(ct,{keyPath:Oh,autoIncrement:!0}).createIndex(Ln,Lh,{unique:!0}),c.createObjectStore(Vr)})(e),Cd(e),(function(c){c.createObjectStore(xn)})(e));let o=A.resolve();return n<3&&s>=3&&(n!==0&&((function(c){c.deleteObjectStore(xr),c.deleteObjectStore(Cr),c.deleteObjectStore(Fn)})(e),Cd(e)),o=o.next((()=>(function(c){const h=c.store(Fn),f={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:q.min().toTimestamp(),targetCount:0};return h.put(So,f)})(i)))),n<4&&s>=4&&(n!==0&&(o=o.next((()=>(function(c,h){return h.store(ct).H().next((p=>{c.deleteObjectStore(ct),c.createObjectStore(ct,{keyPath:Oh,autoIncrement:!0}).createIndex(Ln,Lh,{unique:!0});const _=h.store(ct),P=p.map((V=>_.put(V)));return A.waitFor(P)}))})(e,i)))),o=o.next((()=>{(function(c){c.createObjectStore(Dr,{keyPath:uT})})(e)}))),n<5&&s>=5&&(o=o.next((()=>this.N_(i)))),n<6&&s>=6&&(o=o.next((()=>((function(c){c.createObjectStore(Gs)})(e),this.L_(i))))),n<7&&s>=7&&(o=o.next((()=>this.B_(i)))),n<8&&s>=8&&(o=o.next((()=>this.U_(e,i)))),n<9&&s>=9&&(o=o.next((()=>{(function(c){c.objectStoreNames.contains("remoteDocumentChanges")&&c.deleteObjectStore("remoteDocumentChanges")})(e)}))),n<10&&s>=10&&(o=o.next((()=>this.k_(i)))),n<11&&s>=11&&(o=o.next((()=>{(function(c){c.createObjectStore(Xo,{keyPath:cT})})(e),(function(c){c.createObjectStore(Zo,{keyPath:lT})})(e)}))),n<12&&s>=12&&(o=o.next((()=>{(function(c){const h=c.createObjectStore(ea,{keyPath:_T});h.createIndex(pu,yT,{unique:!1}),h.createIndex(lp,IT,{unique:!1})})(e)}))),n<13&&s>=13&&(o=o.next((()=>(function(c){const h=c.createObjectStore(bo,{keyPath:tT});h.createIndex(co,nT),h.createIndex(op,rT)})(e))).next((()=>this.q_(e,i))).next((()=>e.deleteObjectStore(xn)))),n<14&&s>=14&&(o=o.next((()=>this.K_(e,i)))),n<15&&s>=15&&(o=o.next((()=>(function(c){c.createObjectStore(nc,{keyPath:hT,autoIncrement:!0}).createIndex(fu,dT,{unique:!1}),c.createObjectStore(xs,{keyPath:fT}).createIndex(up,pT,{unique:!1}),c.createObjectStore(Ds,{keyPath:mT}).createIndex(cp,gT,{unique:!1})})(e)))),n<16&&s>=16&&(o=o.next((()=>{t.objectStore(xs).clear()})).next((()=>{t.objectStore(Ds).clear()}))),n<17&&s>=17&&(o=o.next((()=>{(function(c){c.createObjectStore(rc,{keyPath:ET})})(e)}))),n<18&&s>=18&&of()&&(o=o.next((()=>{t.objectStore(xs).clear()})).next((()=>{t.objectStore(Ds).clear()}))),o}L_(e){let t=0;return e.store(xn).ee(((n,s)=>{t+=Fo(s)})).next((()=>{const n={byteSize:t};return e.store(Gs).put(du,n)}))}N_(e){const t=e.store(Ks),n=e.store(ct);return t.H().next((s=>A.forEach(s,(i=>{const o=IDBKeyRange.bound([i.userId,Un],[i.userId,i.lastAcknowledgedBatchId]);return n.H(Ln,o).next((u=>A.forEach(u,(c=>{N(c.userId===i.userId,18650,"Cannot process batch from unexpected user",{batchId:c.batchId});const h=Nn(this.serializer,c);return Lm(e,i.userId,h).next((()=>{}))}))))}))))}B_(e){const t=e.store(xr),n=e.store(xn);return e.store(Fn).get(So).next((s=>{const i=[];return n.ee(((o,u)=>{const c=new ee(o),h=(function(p){return[0,ke(p)]})(c);i.push(t.get(h).next((f=>f?A.resolve():(p=>t.put({targetId:0,path:ke(p),sequenceNumber:s.highestListenSequenceNumber}))(c))))})).next((()=>A.waitFor(i)))}))}U_(e,t){e.createObjectStore(Hs,{keyPath:aT});const n=t.store(Hs),s=new Mc,i=o=>{if(s.add(o)){const u=o.lastSegment(),c=o.popLast();return n.put({collectionId:u,parent:ke(c)})}};return t.store(xn).ee({X:!0},((o,u)=>{const c=new ee(o);return i(c.popLast())})).next((()=>t.store(Vr).ee({X:!0},(([o,u,c],h)=>{const f=mt(u);return i(f.popLast())}))))}k_(e){const t=e.store(Cr);return t.ee(((n,s)=>{const i=Ps(this.serializer,s),o=Dm(this.serializer,i);return t.put(o)}))}q_(e,t){const n=t.store(xn),s=[];return n.ee(((i,o)=>{const u=t.store(bo),c=(function(p){return p.document?new F(ee.fromString(p.document.name).popFirst(5)):p.noDocument?F.fromSegments(p.noDocument.path):p.unknownDocument?F.fromSegments(p.unknownDocument.path):B(36783)})(o).path.toArray(),h={prefixPath:c.slice(0,c.length-2),collectionGroup:c[c.length-2],documentId:c[c.length-1],readTime:o.readTime||[0,0],unknownDocument:o.unknownDocument,noDocument:o.noDocument,document:o.document,hasCommittedMutations:!!o.hasCommittedMutations};s.push(u.put(h))})).next((()=>A.waitFor(s)))}K_(e,t){const n=t.store(ct),s=$m(this.serializer),i=new Fc(Ia.C_,this.serializer.zr);return n.H().next((o=>{const u=new Map;return o.forEach((c=>{let h=u.get(c.userId)??Q();Nn(this.serializer,c).keys().forEach((f=>h=h.add(f))),u.set(c.userId,h)})),A.forEach(u,((c,h)=>{const f=new be(h),p=ga.jr(this.serializer,f),_=i.getIndexManager(f),P=_a.jr(f,this.serializer,_,i.referenceDelegate);return new jm(s,P,p,_).recalculateAndSaveOverlaysForDocumentKeys(new mu(t,st.ce),c).next()}))}))}}function Cd(r){r.createObjectStore(xr,{keyPath:iT}).createIndex(tc,oT,{unique:!0}),r.createObjectStore(Cr,{keyPath:"targetId"}).createIndex(ap,sT,{unique:!0}),r.createObjectStore(Fn)}const Qt="IndexedDbPersistence",Za=18e5,eu=5e3,tu="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.",jA="main";class Bc{constructor(e,t,n,s,i,o,u,c,h,f,p=18){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=n,this.Tn=i,this.window=o,this.document=u,this.W_=h,this.Q_=f,this.G_=p,this.f_=null,this.m_=!1,this.isPrimary=!1,this.networkEnabled=!0,this.z_=null,this.inForeground=!1,this.j_=null,this.H_=null,this.J_=Number.NEGATIVE_INFINITY,this.Y_=_=>Promise.resolve(),!Bc.C())throw new U(x.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new VA(this,s),this.Z_=t+jA,this.serializer=new xm(c),this.X_=new an(this.Z_,this.G_,new $A(this.serializer)),this.p_=new EA,this.g_=new SA(this.referenceDelegate,this.serializer),this.remoteDocumentCache=$m(this.serializer),this.w_=new IA,this.window&&this.window.localStorage?this.eo=this.window.localStorage:(this.eo=null,f===!1&&Be(Qt,"LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.no().then((()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new U(x.FAILED_PRECONDITION,tu);return this.ro(),this.io(),this.so(),this.runTransaction("getHighestListenSequenceNumber","readonly",(e=>this.g_.getHighestSequenceNumber(e)))})).then((e=>{this.f_=new st(e,this.W_)})).then((()=>{this.m_=!0})).catch((e=>(this.X_&&this.X_.close(),Promise.reject(e))))}_o(e){return this.Y_=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.X_.q((async t=>{t.newVersion===null&&await e()}))}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.Tn.enqueueAndForget((async()=>{this.started&&await this.no()})))}no(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",(e=>to(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next((()=>{if(this.isPrimary)return this.oo(e).next((t=>{t||(this.isPrimary=!1,this.Tn.enqueueRetryable((()=>this.Y_(!1))))}))})).next((()=>this.ao(e))).next((t=>this.isPrimary&&!t?this.uo(e).next((()=>!1)):!!t&&this.co(e).next((()=>!0)))))).catch((e=>{if(Tn(e))return D(Qt,"Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return D(Qt,"Releasing owner lease after error during lease refresh",e),!1})).then((e=>{this.isPrimary!==e&&this.Tn.enqueueRetryable((()=>this.Y_(e))),this.isPrimary=e}))}oo(e){return Es(e).get(ur).next((t=>A.resolve(this.lo(t))))}Eo(e){return to(e).delete(this.clientId)}async ho(){if(this.isPrimary&&!this.To(this.J_,Za)){this.J_=Date.now();const e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",(t=>{const n=ve(t,Dr);return n.H().next((s=>{const i=this.Po(s,Za),o=s.filter((u=>i.indexOf(u)===-1));return A.forEach(o,(u=>n.delete(u.clientId))).next((()=>o))}))})).catch((()=>[]));if(this.eo)for(const t of e)this.eo.removeItem(this.Ro(t.clientId))}}so(){this.H_=this.Tn.enqueueAfterDelay("client_metadata_refresh",4e3,(()=>this.no().then((()=>this.ho())).then((()=>this.so()))))}lo(e){return!!e&&e.ownerId===this.clientId}ao(e){return this.Q_?A.resolve(!0):Es(e).get(ur).next((t=>{if(t!==null&&this.To(t.leaseTimestampMs,eu)&&!this.Io(t.ownerId)){if(this.lo(t)&&this.networkEnabled)return!0;if(!this.lo(t)){if(!t.allowTabSynchronization)throw new U(x.FAILED_PRECONDITION,tu);return!1}}return!(!this.networkEnabled||!this.inForeground)||to(e).H().next((n=>this.Po(n,eu).find((s=>{if(this.clientId!==s.clientId){const i=!this.networkEnabled&&s.networkEnabled,o=!this.inForeground&&s.inForeground,u=this.networkEnabled===s.networkEnabled;if(i||o&&u)return!0}return!1}))===void 0))})).next((t=>(this.isPrimary!==t&&D(Qt,`Client ${t?"is":"is not"} eligible for a primary lease.`),t)))}async shutdown(){this.m_=!1,this.Ao(),this.H_&&(this.H_.cancel(),this.H_=null),this.Vo(),this.fo(),await this.X_.runTransaction("shutdown","readwrite",[yi,Dr],(e=>{const t=new mu(e,st.ce);return this.uo(t).next((()=>this.Eo(t)))})),this.X_.close(),this.mo()}Po(e,t){return e.filter((n=>this.To(n.updateTimeMs,t)&&!this.Io(n.clientId)))}po(){return this.runTransaction("getActiveClients","readonly",(e=>to(e).H().next((t=>this.Po(t,Za).map((n=>n.clientId))))))}get started(){return this.m_}getGlobalsCache(){return this.p_}getMutationQueue(e,t){return _a.jr(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.g_}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new bA(e,this.serializer.zr.databaseId)}getDocumentOverlayCache(e){return ga.jr(this.serializer,e)}getBundleCache(){return this.w_}runTransaction(e,t,n){D(Qt,"Starting transaction:",e);const s=t==="readonly"?"readonly":"readwrite",i=(function(c){return c===18?vT:c===17?pp:c===16?wT:c===15?sc:c===14?fp:c===13?dp:c===12?TT:c===11?hp:void B(60245)})(this.G_);let o;return this.X_.runTransaction(e,s,i,(u=>(o=new mu(u,this.f_?this.f_.next():st.ce),t==="readwrite-primary"?this.oo(o).next((c=>!!c||this.ao(o))).next((c=>{if(!c)throw Be(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.Tn.enqueueRetryable((()=>this.Y_(!1))),new U(x.FAILED_PRECONDITION,np);return n(o)})).next((c=>this.co(o).next((()=>c)))):this.yo(o).next((()=>n(o)))))).then((u=>(o.raiseOnCommittedEvent(),u)))}yo(e){return Es(e).get(ur).next((t=>{if(t!==null&&this.To(t.leaseTimestampMs,eu)&&!this.Io(t.ownerId)&&!this.lo(t)&&!(this.Q_||this.allowTabSynchronization&&t.allowTabSynchronization))throw new U(x.FAILED_PRECONDITION,tu)}))}co(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return Es(e).put(ur,t)}static C(){return an.C()}uo(e){const t=Es(e);return t.get(ur).next((n=>this.lo(n)?(D(Qt,"Releasing primary lease."),t.delete(ur)):A.resolve()))}To(e,t){const n=Date.now();return!(e<n-t)&&(!(e>n)||(Be(`Detected an update time that is in the future: ${e} > ${n}`),!1))}ro(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.j_=()=>{this.Tn.enqueueAndForget((()=>(this.inForeground=this.document.visibilityState==="visible",this.no())))},this.document.addEventListener("visibilitychange",this.j_),this.inForeground=this.document.visibilityState==="visible")}Vo(){this.j_&&(this.document.removeEventListener("visibilitychange",this.j_),this.j_=null)}io(){var e;typeof((e=this.window)==null?void 0:e.addEventListener)=="function"&&(this.z_=()=>{this.Ao();const t=/(?:Version|Mobile)\/1[456]/;sf()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.Tn.enterRestrictedMode(!0),this.Tn.enqueueAndForget((()=>this.shutdown()))},this.window.addEventListener("pagehide",this.z_))}fo(){this.z_&&(this.window.removeEventListener("pagehide",this.z_),this.z_=null)}Io(e){var t;try{const n=((t=this.eo)==null?void 0:t.getItem(this.Ro(e)))!==null;return D(Qt,`Client '${e}' ${n?"is":"is not"} zombied in LocalStorage`),n}catch(n){return Be(Qt,"Failed to get zombied client id.",n),!1}}Ao(){if(this.eo)try{this.eo.setItem(this.Ro(this.clientId),String(Date.now()))}catch(e){Be("Failed to set zombie client id.",e)}}mo(){if(this.eo)try{this.eo.removeItem(this.Ro(this.clientId))}catch{}}Ro(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function Es(r){return ve(r,yi)}function to(r){return ve(r,Dr)}function zA(r,e){let t=r.projectId;return r.isDefaultDatabase||(t+="."+r.database),"firestore/"+e+"/"+t+"/"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qc{constructor(e,t,n,s){this.targetId=e,this.fromCache=t,this.wo=n,this.bo=s}static vo(e,t){let n=Q(),s=Q();for(const i of t.docChanges)switch(i.type){case 0:n=n.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new qc(e,t.fromCache,n,s)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function KA(r,e){return F.comparator(r.key,e.key)}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class GA{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zm{constructor(){this.So=!1,this.Do=!1,this.xo=100,this.Co=(function(){return sf()?8:sp(we())>0?6:4})()}initialize(e,t){this.Fo=e,this.indexManager=t,this.So=!0}getDocumentsMatchingQuery(e,t,n,s){const i={result:null};return this.Oo(e,t).next((o=>{i.result=o})).next((()=>{if(!i.result)return this.Mo(e,t,s,n).next((o=>{i.result=o}))})).next((()=>{if(i.result)return;const o=new GA;return this.No(e,t,o).next((u=>{if(i.result=u,this.Do)return this.Lo(e,t,o,u.size)}))})).next((()=>i.result))}Lo(e,t,n,s){return ge(t)?A.resolve():n.documentReadCount<this.xo?(mr()<=J.DEBUG&&D("QueryEngine","SDK will not create cache indexes for query:",Ls(t),"since it only creates cache indexes for collection contains","more than or equal to",this.xo,"documents"),A.resolve()):(mr()<=J.DEBUG&&D("QueryEngine","Query:",Ls(t),"scans",n.documentReadCount,"local documents and returns",s,"documents as results."),n.documentReadCount>this.Co*s?(mr()<=J.DEBUG&&D("QueryEngine","The SDK decides to create cache indexes for query:",Ls(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,ot(t))):A.resolve())}Oo(e,t){if(ge(t))return A.resolve(null);let n=t;if(Yh(n))return A.resolve(null);let s=ot(n);return this.indexManager.getIndexType(e,s).next((i=>i===0?null:(n.limit!==null&&i===1&&(n=Tu(n,null,"F"),s=ot(n)),this.indexManager.getDocumentsMatchingTarget(e,s).next((o=>{const u=Q(...o);return this.Fo.getDocuments(e,u).next((c=>this.indexManager.getMinOffset(e,s).next((h=>{const f=this.Bo(n,c);return this.Uo(n,f,u,h.readTime)?this.Oo(e,Tu(n,null,"F")):this.ko(e,f,n,h)}))))})))))}Mo(e,t,n,s){return(ge(t)?(function(o){for(const u of o.stages){if(u instanceof qr||u instanceof hd)return!1;if(u instanceof ha){if(u.condition instanceof Im&&u.condition._expr.name==="exists"&&u.condition._expr.params[0]instanceof Qr&&u.condition._expr.params[0].fieldName===br)continue;return!1}}return!0})(t):Yh(t))||s.isEqual(q.min())?A.resolve(null):this.Fo.getDocuments(e,n).next((i=>{const o=this.Bo(t,i);return this.Uo(t,o,n,s)?A.resolve(null):(mr()<=J.DEBUG&&D("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),dd(t)),this.ko(e,o,t,KE(s,js)).next((u=>u)))}))}Bo(e,t){let n,s;return ge(e)?(n=new re(KA),s=i=>ya(e,i)):(n=new re(mc(e)),s=i=>oa(e,i)),t.forEach(((i,o)=>{s(o)&&(n=n.add(o))})),n}Uo(e,t,n,s){if(ge(e))return(function(u){return u.stages.some((c=>c instanceof qr||c instanceof hd))})(e);if(e.limit===null)return!1;if(n.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}No(e,t,n){return mr()<=J.DEBUG&&D("QueryEngine","Using full collection scan to execute query:",dd(t)),this.Fo.getDocumentsMatchingQuery(e,t,et.min(),n)}ko(e,t,n,s){return this.Fo.getDocumentsMatchingQuery(e,n,s).next((i=>(t.forEach((o=>{i=i.insert(o.key,o)})),i)))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $c="LocalStore",HA=3e8;class WA{constructor(e,t,n,s){this.persistence=e,this.qo=t,this.serializer=s,this.$o=new he(G),this.Ko=new Ut((i=>ma(i)),Dc),this.Wo=new Map,this.Qo=e.getRemoteDocumentCache(),this.g_=e.getTargetCache(),this.w_=e.getBundleCache(),this.Go(n)}Go(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new jm(this.Qo,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Qo.setIndexManager(this.indexManager),this.qo.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.$o)))}}function Km(r,e,t,n){return new WA(r,e,t,n)}async function Gm(r,e){const t=W(r);return await t.persistence.runTransaction("Handle user change","readonly",(n=>{let s;return t.mutationQueue.getAllMutationBatches(n).next((i=>(s=i,t.Go(e),t.mutationQueue.getAllMutationBatches(n)))).next((i=>{const o=[],u=[];let c=Q();for(const h of s){o.push(h.batchId);for(const f of h.mutations)c=c.add(f.key)}for(const h of i){u.push(h.batchId);for(const f of h.mutations)c=c.add(f.key)}return t.localDocuments.getDocuments(n,c).next((h=>({zo:h,removedBatchIds:o,addedBatchIds:u})))}))}))}function QA(r,e){const t=W(r);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(n=>{const s=e.batch.keys(),i=t.Qo.newChangeBuffer({trackRemovals:!0});return(function(u,c,h,f){const p=h.batch,_=p.keys();let P=A.resolve();return _.forEach((V=>{P=P.next((()=>f.getEntry(c,V))).next((O=>{const M=h.docVersions.get(V);N(M!==null,48541),O.version.compareTo(M)<0&&(p.applyToRemoteDocument(O,h),O.isValidDocument()&&(O.setReadTime(h.commitVersion),f.addEntry(O)))}))})),P.next((()=>u.mutationQueue.removeMutationBatch(c,p)))})(t,n,e,i).next((()=>i.apply(n))).next((()=>t.mutationQueue.performConsistencyCheck(n))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(n,s,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(n,(function(u){let c=Q();for(let h=0;h<u.mutationResults.length;++h)u.mutationResults[h].transformResults.length>0&&(c=c.add(u.batch.mutations[h].key));return c})(e)))).next((()=>t.localDocuments.getDocuments(n,s)))}))}function Hm(r){const e=W(r);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.g_.getLastRemoteSnapshotVersion(t)))}function YA(r,e){const t=W(r),n=e.snapshotVersion;let s=t.$o;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(i=>{const o=t.Qo.newChangeBuffer({trackRemovals:!0});s=t.$o;const u=[];e.targetChanges.forEach(((f,p)=>{const _=s.get(p);if(!_)return;u.push(t.g_.removeMatchingKeys(i,f.removedDocuments,p).next((()=>t.g_.addMatchingKeys(i,f.addedDocuments,p))));let P=_.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(p)!==null?P=P.withResumeToken(de.EMPTY_BYTE_STRING,q.min()).withLastLimboFreeSnapshotVersion(q.min()):f.resumeToken.approximateByteSize()>0&&(P=P.withResumeToken(f.resumeToken,n)),s=s.insert(p,P),(function(O,M,z){return O.resumeToken.approximateByteSize()===0||M.snapshotVersion.toMicroseconds()-O.snapshotVersion.toMicroseconds()>=HA?!0:z.addedDocuments.size+z.modifiedDocuments.size+z.removedDocuments.size>0})(_,P,f)&&u.push(t.g_.updateTargetData(i,P))}));let c=Te(),h=Q();if(e.documentUpdates.forEach((f=>{e.resolvedLimboDocuments.has(f)&&u.push(t.persistence.referenceDelegate.updateLimboDocument(i,f))})),u.push(JA(i,o,e.documentUpdates).next((f=>{c=f.jo,h=f.Ho}))),!n.isEqual(q.min())){const f=t.g_.getLastRemoteSnapshotVersion(i).next((p=>t.g_.setTargetsMetadata(i,i.currentSequenceNumber,n)));u.push(f)}return A.waitFor(u).next((()=>o.apply(i))).next((()=>t.localDocuments.getLocalViewOfDocuments(i,c,h))).next((()=>c))})).then((i=>(t.$o=s,i)))}function JA(r,e,t){let n=Q(),s=Q();return t.forEach((i=>n=n.add(i))),e.getEntries(r,n).next((i=>{let o=Te();return t.forEach(((u,c)=>{const h=i.get(u);c.isFoundDocument()!==h.isFoundDocument()&&(s=s.add(u)),c.isNoDocument()&&c.version.isEqual(q.min())?(e.removeEntry(u,c.readTime),o=o.insert(u,c)):!h.isValidDocument()||c.version.compareTo(h.version)>0||c.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(c),o=o.insert(u,c)):D($c,"Ignoring outdated watch update for ",u,". Current version:",h.version," Watch version:",c.version)})),{jo:o,Ho:s}}))}function XA(r,e){const t=W(r);return t.persistence.runTransaction("Get next mutation batch","readonly",(n=>(e===void 0&&(e=Un),t.mutationQueue.getNextMutationBatchAfterBatchId(n,e))))}function ZA(r,e){const t=W(r);return t.persistence.runTransaction("Allocate target","readwrite",(n=>{let s;return t.g_.getTargetData(n,e).next((i=>i?(s=i,A.resolve(s)):t.g_.allocateTargetId(n).next((o=>(s=new _t(e,o,"TargetPurposeListen",n.currentSequenceNumber),t.g_.addTargetData(n,s).next((()=>s)))))))})).then((n=>{const s=t.$o.get(n.targetId);return(s===null||n.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.$o=t.$o.insert(n.targetId,n),t.Ko.set(e,n.targetId)),n}))}async function Nu(r,e,t){const n=W(r),s=n.$o.get(e),i=t?"readwrite":"readwrite-primary";try{t||await n.persistence.runTransaction("Release target",i,(o=>n.persistence.referenceDelegate.removeTarget(o,s)))}catch(o){if(!Tn(o))throw o;D($c,`Failed to update sequence numbers for target ${e}: ${o}`)}n.$o=n.$o.remove(e),n.Ko.delete(s.target)}function xd(r,e,t){const n=W(r);let s=q.min(),i=Q();return n.persistence.runTransaction("Execute query","readwrite",(o=>(function(c,h,f){const p=W(c),_=p.Ko.get(f);return _!==void 0?A.resolve(p.$o.get(_)):p.g_.getTargetData(h,f)})(n,o,ge(e)?e:ot(e)).next((u=>{if(u)return s=u.lastLimboFreeSnapshotVersion,n.g_.getMatchingKeysForTargetId(o,u.targetId).next((c=>{i=c}))})).next((()=>n.qo.getDocumentsMatchingQuery(o,e,t?s:q.min(),t?i:Q()))).next((u=>(eR(n,u),{documents:u,Jo:i})))))}function eR(r,e){e.forEach(((t,n)=>{const s=n.key.getCollectionGroup(),i=r.Wo.get(s)||q.min();n.readTime.compareTo(i)>0&&r.Wo.set(s,n.readTime)}))}class Dd{constructor(){this.activeTargetIds=rw()}na(e){this.activeTargetIds=this.activeTargetIds.add(e)}ra(e){this.activeTargetIds=this.activeTargetIds.delete(e)}ta(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Wm{constructor(){this.Ua=new Dd,this.ka={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,n){}addLocalQueryTarget(e,t=!0){return t&&this.Ua.na(e),this.ka[e]||"not-current"}updateQueryState(e,t,n){this.ka[e]=t}removeLocalQueryTarget(e){this.Ua.ra(e)}isLocalQueryTarget(e){return this.Ua.activeTargetIds.has(e)}clearQueryState(e){delete this.ka[e]}getAllActiveQueryTargets(){return this.Ua.activeTargetIds}isActiveQueryTarget(e){return this.Ua.activeTargetIds.has(e)}start(){return this.Ua=new Dd,Promise.resolve()}handleUserChange(e,t,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tR(){return typeof window<"u"?window:null}function go(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nR{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.qa=0,this.$a=null,this.Ka=!0}Wa(){this.qa===0&&(this.Qa("Unknown"),this.$a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.$a=null,this.Ga("Backend didn't respond within 10 seconds."),this.Qa("Offline"),Promise.resolve()))))}za(e){this.state==="Online"?this.Qa("Unknown"):(this.qa++,this.qa>=1&&(this.ja(),this.Ga(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.Qa("Offline")))}set(e){this.ja(),this.qa=0,e==="Online"&&(this.Ka=!1),this.Qa(e)}Qa(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}Ga(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Ka?(Be(t),this.Ka=!1):D("OnlineStateTracker",t)}ja(){this.$a!==null&&(this.$a.cancel(),this.$a=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const At="RemoteStore";class rR{constructor(e,t,n,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=n,this.remoteSyncer={},this.Ha=[],this.Ja=new Map,this.Ya=new Map,this.Za=new Map,this.Xa=new Mt(1e3),this.eu=new Mt(1001),this.tu=new Set,this.nu=[],this.ru=i,this.ru.bt((o=>{n.enqueueAndForget((async()=>{sr(this)&&(D(At,"Restarting streams for network reachability change."),await(async function(c){const h=W(c);h.tu.add(4),await Si(h),h.iu.set("Unknown"),h.tu.delete(4),await Ea(h)})(this))}))})),this.iu=new nR(n,s)}}async function Ea(r){if(sr(r))for(const e of r.nu)await e(!0)}async function Si(r){for(const e of r.nu)await e(!1)}function ku(r,e){return r.Ya.get(e)||void 0}function Qm(r,e){const t=W(r),n=ku(t,e.targetId);if(n!==void 0&&t.Ja.has(n))return;const s=(function(u,c){const h=ku(u,c);h!==void 0&&u.Za.delete(h);const f=(function(_,P){return P%2!=0?_.eu.next():_.Xa.next()})(u,c);return u.Ya.set(c,f),u.Za.set(f,c),f})(t,e.targetId);D(At,"remoteStoreListen mapping SDK target ID to remote",e.targetId,s);const i=new _t(e.target,s,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t.Ja.set(s,i),Gc(t)?Kc(t):Xr(t).Fn()&&zc(t,i)}function jc(r,e){const t=W(r),n=Xr(t),s=ku(t,e);D(At,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,s),t.Ja.delete(s),t.Ya.delete(e),t.Za.delete(s),n.Fn()&&Ym(t,s),t.Ja.size===0&&(n.Fn()?n.Nn():sr(t)&&t.iu.set("Unknown"))}function zc(r,e){if(r.su.We(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(q.min())>0){const t=r.Za.get(e.targetId);if(t===void 0)return void D(At,"SDK target ID not found for remote ID: "+e.targetId);const n=r.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(n)}Xr(r).jn(e)}function Ym(r,e){r.su.We(e),Xr(r).Hn(e)}function Kc(r){r.su=new ow({getRemoteKeysForTarget:e=>{const t=r.Za.get(e);return t!==void 0?r.remoteSyncer.getRemoteKeysForTarget(t):Q()},dt:e=>r.Ja.get(e)||null,Tt:()=>r.datastore.serializer.databaseId}),Xr(r).start(),r.iu.Wa()}function Gc(r){return sr(r)&&!Xr(r).Cn()&&r.Ja.size>0}function sr(r){return W(r).tu.size===0}function Jm(r){r.su=void 0}async function sR(r){r.iu.set("Online")}async function iR(r){r.Ja.forEach(((e,t)=>{zc(r,e)}))}async function oR(r,e){Jm(r),Gc(r)?(r.iu.za(e),Kc(r)):r.iu.set("Unknown")}async function aR(r,e,t){if(r.iu.set("Online"),e instanceof zp&&e.state===2&&e.cause)try{await(async function(s,i){const o=i.cause;for(const u of i.targetIds){if(s.Ja.has(u)){const c=s.Za.get(u);c!==void 0&&(await s.remoteSyncer.rejectListen(c,o),s.Ya.delete(c),s.Za.delete(u)),s.Ja.delete(u)}s.su.removeTarget(u)}})(r,e)}catch(n){D(At,"Failed to remove targets %s: %s ",e.targetIds.join(","),n),await qo(r,n)}else if(e instanceof fo?r.su.et(e):e instanceof jp?r.su.ot(e):r.su.rt(e),!t.isEqual(q.min()))try{const n=await Hm(r.localStore);t.compareTo(n)>=0&&await(function(i,o){const u=i.su.Rt(o);u.targetChanges.forEach(((h,f)=>{if(h.resumeToken.approximateByteSize()>0){const p=i.Ja.get(f);p&&i.Ja.set(f,p.withResumeToken(h.resumeToken,o))}})),u.targetMismatches.forEach(((h,f)=>{const p=i.Ja.get(h);if(!p)return;i.Ja.set(h,p.withResumeToken(de.EMPTY_BYTE_STRING,p.snapshotVersion)),Ym(i,h);const _=new _t(p.target,h,f,p.sequenceNumber);zc(i,_)}));const c=(function(f,p){const _=new Map;p.targetChanges.forEach(((V,O)=>{const M=f.Za.get(O);M!==void 0&&_.set(M,V)}));let P=new he(G);return p.targetMismatches.forEach(((V,O)=>{const M=f.Za.get(V);M!==void 0&&(P=P.insert(M,O))})),new Ti(p.snapshotVersion,_,P,p.documentUpdates,p.augmentedDocumentUpdates,p.resolvedLimboDocuments)})(i,u);return i.remoteSyncer.applyRemoteEvent(c)})(r,t)}catch(n){D(At,"Failed to raise snapshot:",n),await qo(r,n)}}async function qo(r,e,t){if(!Tn(e))throw e;r.tu.add(1),await Si(r),r.iu.set("Offline"),t||(t=()=>Hm(r.localStore)),r.asyncQueue.enqueueRetryable((async()=>{D(At,"Retrying IndexedDB access"),await t(),r.tu.delete(1),await Ea(r)}))}function Xm(r,e){return e().catch((t=>qo(r,t,e)))}async function Vi(r){const e=W(r),t=gn(e);let n=e.Ha.length>0?e.Ha[e.Ha.length-1].batchId:Un;for(;uR(e);)try{const s=await XA(e.localStore,n);if(s===null){e.Ha.length===0&&t.Nn();break}n=s.batchId,cR(e,s)}catch(s){await qo(e,s)}Zm(e)&&eg(e)}function uR(r){return sr(r)&&r.Ha.length<10}function cR(r,e){r.Ha.push(e);const t=gn(r);t.Fn()&&t.Jn&&t.Yn(e.mutations)}function Zm(r){return sr(r)&&!gn(r).Cn()&&r.Ha.length>0}function eg(r){gn(r).start()}async function lR(r){gn(r).er()}async function hR(r){const e=gn(r);for(const t of r.Ha)e.Yn(t.mutations)}async function dR(r,e,t){const n=r.Ha.shift(),s=kc.from(n,e,t);await Xm(r,(()=>r.remoteSyncer.applySuccessfulWrite(s))),await Vi(r)}async function fR(r,e){e&&gn(r).Jn&&await(async function(n,s){if((function(o){return XT(o)&&o!==x.ABORTED})(s.code)){const i=n.Ha.shift();gn(n).Mn(),await Xm(n,(()=>n.remoteSyncer.rejectFailedWrite(i.batchId,s))),await Vi(n)}})(r,e),Zm(r)&&eg(r)}async function Nd(r,e){const t=W(r);t.asyncQueue.verifyOperationInProgress(),D(At,"RemoteStore received new credentials");const n=sr(t);t.tu.add(3),await Si(t),n&&t.iu.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.tu.delete(3),await Ea(t)}async function pR(r,e){const t=W(r);e?(t.tu.delete(2),await Ea(t)):e||(t.tu.add(2),await Si(t),t.iu.set("Unknown"))}function Xr(r){return r._u||(r._u=(function(t,n,s){const i=W(t);return i.nr(),new Rw(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(r.datastore,r.asyncQueue,{Qt:sR.bind(null,r),zt:iR.bind(null,r),Ht:oR.bind(null,r),zn:aR.bind(null,r)}),r.nu.push((async e=>{e?(r._u.Mn(),Gc(r)?Kc(r):r.iu.set("Unknown")):(await r._u.stop(),Jm(r))}))),r._u}function gn(r){return r.ou||(r.ou=(function(t,n,s){const i=W(t);return i.nr(),new Pw(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(r.datastore,r.asyncQueue,{Qt:()=>Promise.resolve(),zt:lR.bind(null,r),Ht:fR.bind(null,r),Zn:hR.bind(null,r),Xn:dR.bind(null,r)}),r.nu.push((async e=>{e?(r.ou.Mn(),await Vi(r)):(await r.ou.stop(),r.Ha.length>0&&(D(At,`Stopping write stream with ${r.Ha.length} pending writes`),r.Ha=[]))}))),r.ou}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hc{constructor(e,t,n,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=n,this.op=s,this.removalCallback=i,this.deferred=new Vt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((o=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,n,s,i){const o=Date.now()+n,u=new Hc(e,t,o,s,i);return u.start(n),u}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new U(x.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Wc(r,e){if(Be("AsyncQueue",`${e}: ${r}`),Tn(r))return new U(x.UNAVAILABLE,`${e}: ${r}`);throw r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $n{static emptySet(e){return new $n(e.comparator)}constructor(e){this.comparator=e?(t,n)=>e(t,n)||F.comparator(t.key,n.key):(t,n)=>F.comparator(t.key,n.key),this.keyedMap=gr(),this.sortedSet=new he(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,n)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof $n)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),n=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const n=new $n;return n.comparator=this.comparator,n.keyedMap=e,n.sortedSet=t,n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kd{constructor(){this.au=new he(F.comparator)}track(e){const t=e.doc.key,n=this.au.get(t);n?e.type!==0&&n.type===3?this.au=this.au.insert(t,e):e.type===3&&n.type!==1?this.au=this.au.insert(t,{type:n.type,doc:e.doc}):e.type===2&&n.type===2?this.au=this.au.insert(t,{type:2,doc:e.doc}):e.type===2&&n.type===0?this.au=this.au.insert(t,{type:0,doc:e.doc}):e.type===1&&n.type===0?this.au=this.au.remove(t):e.type===1&&n.type===2?this.au=this.au.insert(t,{type:1,doc:n.doc}):e.type===0&&n.type===1?this.au=this.au.insert(t,{type:2,doc:e.doc}):B(63341,{ft:e,uu:n}):this.au=this.au.insert(t,e)}cu(){const e=[];return this.au.inorderTraversal(((t,n)=>{e.push(n)})),e}}class $r{constructor(e,t,n,s,i,o,u,c,h){this.query=e,this.docs=t,this.oldDocs=n,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=u,this.excludesMetadataChanges=c,this.hasCachedResults=h}static fromInitialDocuments(e,t,n,s,i){const o=[];return t.forEach((u=>{o.push({type:0,doc:u})})),new $r(e,t,$n.emptySet(t),o,n,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&pa(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,n=e.docChanges;if(t.length!==n.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==n[s].type||!t[s].doc.isEqual(n[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mR{constructor(){this.lu=void 0,this.Eu=[]}hu(){return this.Eu.some((e=>e.Tu()))}}class gR{constructor(){this.queries=Od(),this.onlineState="Unknown",this.Pu=new Set}terminate(){(function(t,n){const s=W(t),i=s.queries;s.queries=Od(),i.forEach(((o,u)=>{for(const c of u.Eu)c.onError(n)}))})(this,new U(x.ABORTED,"Firestore shutting down"))}}function Od(){return new Ut((r=>Cm(r)),pa)}async function tg(r,e){const t=W(r);let n=3;const s=e.query;let i=t.queries.get(s);i?!i.hu()&&e.Tu()&&(n=2):(i=new mR,n=e.Tu()?0:1);try{switch(n){case 0:i.lu=await t.onListen(s,!0);break;case 1:i.lu=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(o){const u=Wc(o,`Initialization of query '${ge(e.query)?xt(e.query):Ls(e.query)}' failed`);return void e.onError(u)}t.queries.set(s,i),i.Eu.push(e),e.Ru(t.onlineState),i.lu&&e.Iu(i.lu)&&Qc(t)}async function ng(r,e){const t=W(r),n=e.query;let s=3;const i=t.queries.get(n);if(i){const o=i.Eu.indexOf(e);o>=0&&(i.Eu.splice(o,1),i.Eu.length===0?s=e.Tu()?0:1:!i.hu()&&e.Tu()&&(s=2))}switch(s){case 0:return t.queries.delete(n),t.onUnlisten(n,!0);case 1:return t.queries.delete(n),t.onUnlisten(n,!1);case 2:return t.onLastRemoteStoreUnlisten(n);default:return}}function _R(r,e){const t=W(r);let n=!1;for(const s of e){const i=s.query,o=t.queries.get(i);if(o){for(const u of o.Eu)u.Iu(s)&&(n=!0);o.lu=s}}n&&Qc(t)}function yR(r,e,t){const n=W(r),s=n.queries.get(e);if(s)for(const i of s.Eu)i.onError(t);n.queries.delete(e)}function Qc(r){r.Pu.forEach((e=>{e.next()}))}var Ou;(function(r){r.Default="default",r.Cache="cache"})(Ou||(Ou={}));class rg{constructor(e,t,n){this.query=e,this.Au=t,this.Vu=!1,this.du=null,this.onlineState="Unknown",this.options=n||{}}Iu(e){if(!this.options.includeMetadataChanges){const n=[];for(const s of e.docChanges)s.type!==3&&n.push(s);e=new $r(e.query,e.docs,e.oldDocs,n,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Vu?this.fu(e)&&(this.Au.next(e),t=!0):this.mu(e,this.onlineState)&&(this.pu(e),t=!0),this.du=e,t}onError(e){this.Au.error(e)}Ru(e){this.onlineState=e;let t=!1;return this.du&&!this.Vu&&this.mu(this.du,e)&&(this.pu(this.du),t=!0),t}mu(e,t){if(!e.fromCache||!this.Tu())return!0;const n=t!=="Offline";return(!this.options.waitForSyncWhenOnline||!n)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}fu(e){if(e.docChanges.length>0)return!0;const t=this.du&&this.du.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}pu(e){e=$r.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Vu=!0,this.Au.next(e)}Tu(){return this.options.source!==Ou.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sg{constructor(e){this.key=e}}class ig{constructor(e){this.key=e}}class IR{constructor(e,t){this.query=e,this.Ou=t,this.Mu=null,this.hasCachedResults=!1,this.current=!1,this.Nu=Q(),this.mutatedKeys=Q(),this.Lu=ge(e)?Du(e):mc(e),this.Bu=new $n(this.Lu)}get Uu(){return this.Ou}ku(e,t){const n=t?t.qu:new kd,s=t?t.Bu:this.Bu;let i=t?t.mutatedKeys:this.mutatedKeys,o=s,u=!1;const[c,h]=this.$u(this.query,s);e.inorderTraversal(((p,_)=>{const P=s.get(p),V=Bm(this.query,_)?_:null,O=!!P&&this.mutatedKeys.has(P.key),M=!!V&&(V.hasLocalMutations||this.mutatedKeys.has(V.key)&&V.hasCommittedMutations);let z=!1;P&&V?P.data.isEqual(V.data)?O!==M&&(n.track({type:3,doc:V}),z=!0):this.Ku(P,V)||(n.track({type:2,doc:V}),z=!0,(c&&this.Lu(V,c)>0||h&&this.Lu(V,h)<0)&&(u=!0)):!P&&V?(n.track({type:0,doc:V}),z=!0):P&&!V&&(n.track({type:1,doc:P}),z=!0,(c||h)&&(u=!0)),z&&(V?(o=o.add(V),i=M?i.add(p):i.delete(p)):(o=o.delete(p),i=i.delete(p)))}));const f=this.Wu(this.query);if(f)if(ge(this.query)){const p=[];o.forEach((V=>p.push(V)));const _=Fm(this.query,p);let P=new $n(Du(this.query));for(const V of _)P=P.add(V);o.forEach((V=>{P.has(V.key)||(i=i.delete(V.key),n.track({type:1,doc:V}))})),o=P}else{const p=this.Qu(this.query);for(;o.size>f;){const _=p==="F"?o.last():o.first();o=o.delete(_.key),i=i.delete(_.key),n.track({type:1,doc:_})}}return{Bu:o,qu:n,Uo:u,mutatedKeys:i}}Wu(e){var t;return ge(e)?(t=Xa(e))==null?void 0:t.limit:e.limit||void 0}Qu(e){if(ge(e)){const t=Xa(e);return t&&t.limit<0?"L":"F"}return e.limitType}$u(e,t){var n;if(ge(e)){const s=(n=Xa(e))==null?void 0:n.limit;return[t.size===s?t.last():null,null]}return[e.limitType==="F"&&t.size===this.Wu(this.query)?t.last():null,e.limitType==="L"&&t.size===this.Wu(this.query)?t.first():null]}Ku(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,n,s){const i=this.Bu;this.Bu=e.Bu,this.mutatedKeys=e.mutatedKeys;const o=e.qu.cu();o.sort(((f,p)=>(function(P,V){const O=M=>{switch(M){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return B(20277,{ft:M})}};return O(P)-O(V)})(f.type,p.type)||this.Lu(f.doc,p.doc))),this.Gu(n),s=s??!1;const u=t&&!s?this.zu():[],c=this.Nu.size===0&&this.current&&!s?1:0,h=c!==this.Mu;return this.Mu=c,o.length!==0||h?{snapshot:new $r(this.query,e.Bu,i,o,e.mutatedKeys,c===0,h,!1,!!n&&n.resumeToken.approximateByteSize()>0),ju:u}:{ju:u}}Ru(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Bu:this.Bu,qu:new kd,mutatedKeys:this.mutatedKeys,Uo:!1},!1)):{ju:[]}}Hu(e){return!this.Ou.has(e)&&!!this.Bu.has(e)&&!this.Bu.get(e).hasLocalMutations}Gu(e){e&&(e.addedDocuments.forEach((t=>this.Ou=this.Ou.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.Ou=this.Ou.delete(t))),this.current=e.current)}zu(){if(!this.current)return[];const e=this.Nu;this.Nu=Q(),this.Bu.forEach((n=>{this.Hu(n.key)&&(this.Nu=this.Nu.add(n.key))}));const t=[];return e.forEach((n=>{this.Nu.has(n)||t.push(new ig(n))})),this.Nu.forEach((n=>{e.has(n)||t.push(new sg(n))})),t}Ju(e){this.Ou=e.Jo,this.Nu=Q();const t=this.ku(e.documents);return this.applyChanges(t,!0)}Yu(){return $r.fromInitialDocuments(this.query,this.Bu,this.mutatedKeys,this.Mu===0,this.hasCachedResults)}}const Yc="SyncEngine";class ER{constructor(e,t,n){this.query=e,this.targetId=t,this.view=n}}class TR{constructor(e){this.key=e,this.Zu=!1}}class wR{constructor(e,t,n,s,i,o){this.localStore=e,this.remoteStore=t,this.eventManager=n,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.Xu={},this.ec=new Ut((u=>Cm(u)),pa),this.tc=new Map,this.nc=new Set,this.rc=new he(F.comparator),this.sc=new Map,this._c=new Uc,this.oc={},this.ac=new Map,this.uc=Mt.Cs(),this.onlineState="Unknown",this.cc=void 0}get isPrimaryClient(){return this.cc===!0}}async function vR(r,e,t=!0){const n=hg(r);let s;const i=n.ec.get(e);return i?(n.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Yu()):s=await og(n,e,t,!0),s}async function AR(r,e){const t=hg(r);await og(t,e,!0,!1)}async function og(r,e,t,n){const s=await ZA(r.localStore,ge(e)?e:ot(e)),i=s.targetId,o=r.sharedClientState.addLocalQueryTarget(i,t);let u;return n&&(u=await RR(r,e,i,o==="current",s.resumeToken)),r.isPrimaryClient&&t&&Qm(r.remoteStore,s),u}async function RR(r,e,t,n,s){r.lc=(p,_,P)=>(async function(O,M,z,K){let H=M.view.ku(z);H.Uo&&(H=await xd(O.localStore,M.query,!1).then((({documents:T})=>M.view.ku(T,H))));const ue=K&&K.targetChanges.get(M.targetId),te=K&&K.targetMismatches.get(M.targetId)!=null,ne=M.view.applyChanges(H,O.isPrimaryClient,ue,te);return Md(O,M.targetId,ne.ju),ne.snapshot})(r,p,_,P);const i=await xd(r.localStore,e,!0),o=new IR(e,i.Jo),u=o.ku(i.documents),c=wi.createSynthesizedTargetChangeForCurrentChange(t,n&&r.onlineState!=="Offline",s),h=o.applyChanges(u,r.isPrimaryClient,c);Md(r,t,h.ju);const f=new ER(e,t,o);return r.ec.set(e,f),r.tc.has(t)?r.tc.get(t).push(e):r.tc.set(t,[e]),h.snapshot}async function PR(r,e,t){const n=W(r),s=n.ec.get(e),i=n.tc.get(s.targetId);if(i.length>1)return n.tc.set(s.targetId,i.filter((o=>!pa(o,e)))),void n.ec.delete(e);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(s.targetId),n.sharedClientState.isActiveQueryTarget(s.targetId)||await Nu(n.localStore,s.targetId,!1).then((()=>{n.sharedClientState.clearQueryState(s.targetId),t&&jc(n.remoteStore,s.targetId),Lu(n,s.targetId)})).catch(er)):(Lu(n,s.targetId),await Nu(n.localStore,s.targetId,!0))}async function bR(r,e){const t=W(r),n=t.ec.get(e),s=t.tc.get(n.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(n.targetId),jc(t.remoteStore,n.targetId))}async function SR(r,e,t){const n=dg(r);try{const s=await(function(o,u){const c=W(o),h=se.now(),f=u.reduce(((P,V)=>P.add(V.key)),Q());let p,_;return c.persistence.runTransaction("Locally write mutations","readwrite",(P=>{let V=Te(),O=Q();return c.Qo.getEntries(P,f).next((M=>{V=M,V.forEach(((z,K)=>{K.isValidDocument()||(O=O.add(z))}))})).next((()=>c.localDocuments.getOverlayedDocuments(P,V))).next((M=>{p=M;const z=[];for(const K of u){const H=LT(K,p.get(K.key).overlayedDocument);H!=null&&z.push(new wn(K.key,H,Ap(H.value.mapValue),Ze.exists(!0)))}return c.mutationQueue.addMutationBatch(P,h,z,u)})).next((M=>{_=M;const z=M.applyToLocalDocumentSet(p,O);return c.documentOverlayCache.saveOverlays(P,M.batchId,z)}))})).then((()=>({batchId:_.batchId,changes:qp(p)})))})(n.localStore,e);n.sharedClientState.addPendingMutation(s.batchId),(function(o,u,c){let h=o.oc[o.currentUser.toKey()];h||(h=new he(G)),h=h.insert(u,c),o.oc[o.currentUser.toKey()]=h})(n,s.batchId,t),await Ci(n,s.changes),await Vi(n.remoteStore)}catch(s){const i=Wc(s,"Failed to persist write");t.reject(i)}}async function ag(r,e){const t=W(r);try{const n=await YA(t.localStore,e);e.targetChanges.forEach(((s,i)=>{const o=t.sc.get(i);o&&(N(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?o.Zu=!0:s.modifiedDocuments.size>0?N(o.Zu,14607):s.removedDocuments.size>0&&(N(o.Zu,42227),o.Zu=!1))})),await Ci(t,n,e)}catch(n){await er(n)}}function Ld(r,e,t){const n=W(r);if(n.isPrimaryClient&&t===0||!n.isPrimaryClient&&t===1){const s=[];n.ec.forEach(((i,o)=>{const u=o.view.Ru(e);u.snapshot&&s.push(u.snapshot)})),(function(o,u){const c=W(o);c.onlineState=u;let h=!1;c.queries.forEach(((f,p)=>{for(const _ of p.Eu)_.Ru(u)&&(h=!0)})),h&&Qc(c)})(n.eventManager,e),s.length&&n.Xu.zn(s),n.onlineState=e,n.isPrimaryClient&&n.sharedClientState.setOnlineState(e)}}async function VR(r,e,t){const n=W(r);n.sharedClientState.updateQueryState(e,"rejected",t);const s=n.sc.get(e),i=s&&s.key;if(i){let o=new he(F.comparator);o=o.insert(i,pe.newNoDocument(i,q.min()));const u=Q().add(i),c=new Ti(q.min(),new Map,new he(G),o,Te(),u);await ag(n,c),n.rc=n.rc.remove(i),n.sc.delete(e),Jc(n)}else await Nu(n.localStore,e,!1).then((()=>Lu(n,e,t))).catch(er)}async function CR(r,e){const t=W(r),n=e.batch.batchId;try{const s=await QA(t.localStore,e);cg(t,n,null),ug(t,n),t.sharedClientState.updateMutationState(n,"acknowledged"),await Ci(t,s)}catch(s){await er(s)}}async function xR(r,e,t){const n=W(r);try{const s=await(function(o,u){const c=W(o);return c.persistence.runTransaction("Reject batch","readwrite-primary",(h=>{let f;return c.mutationQueue.lookupMutationBatch(h,u).next((p=>(N(p!==null,37113),f=p.keys(),c.mutationQueue.removeMutationBatch(h,p)))).next((()=>c.mutationQueue.performConsistencyCheck(h))).next((()=>c.documentOverlayCache.removeOverlaysForBatchId(h,f,u))).next((()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,f))).next((()=>c.localDocuments.getDocuments(h,f)))}))})(n.localStore,e);cg(n,e,t),ug(n,e),n.sharedClientState.updateMutationState(e,"rejected",t),await Ci(n,s)}catch(s){await er(s)}}function ug(r,e){(r.ac.get(e)||[]).forEach((t=>{t.resolve()})),r.ac.delete(e)}function cg(r,e,t){const n=W(r);let s=n.oc[n.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),n.oc[n.currentUser.toKey()]=s}}function Lu(r,e,t=null){r.sharedClientState.removeLocalQueryTarget(e);for(const n of r.tc.get(e))r.ec.delete(n),t&&r.Xu.Ec(n,t);r.tc.delete(e),r.isPrimaryClient&&r._c.s_(e).forEach((n=>{r._c.containsKey(n)||lg(r,n)}))}function lg(r,e){r.nc.delete(e.path.canonicalString());const t=r.rc.get(e);t!==null&&(jc(r.remoteStore,t),r.rc=r.rc.remove(e),r.sc.delete(t),Jc(r))}function Md(r,e,t){for(const n of t)n instanceof sg?(r._c.addReference(n.key,e),DR(r,n)):n instanceof ig?(D(Yc,"Document no longer in limbo: "+n.key),r._c.removeReference(n.key,e),r._c.containsKey(n.key)||lg(r,n.key)):B(19791,{hc:n})}function DR(r,e){const t=e.key,n=t.path.canonicalString();r.rc.get(t)||r.nc.has(n)||(D(Yc,"New document in limbo: "+t),r.nc.add(n),Jc(r))}function Jc(r){for(;r.nc.size>0&&r.rc.size<r.maxConcurrentLimboResolutions;){const e=r.nc.values().next().value;r.nc.delete(e);const t=new F(ee.fromString(e)),n=r.uc.next();r.sc.set(n,new TR(t)),r.rc=r.rc.insert(t,n),Qm(r.remoteStore,new _t(ot(Ei(t.path)),n,"TargetPurposeLimboResolution",st.ce))}}async function Ci(r,e,t){const n=W(r),s=[],i=[],o=[];n.ec.isEmpty()||(n.ec.forEach(((u,c)=>{o.push(n.lc(c,e,t).then((h=>{var f;if((h||t)&&n.isPrimaryClient){const p=h?!h.fromCache:(f=t==null?void 0:t.targetChanges.get(c.targetId))==null?void 0:f.current;n.sharedClientState.updateQueryState(c.targetId,p?"current":"not-current")}if(h){s.push(h);const p=qc.vo(c.targetId,h);i.push(p)}})))})),await Promise.all(o),n.Xu.zn(s),await(async function(c,h){const f=W(c);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",(p=>A.forEach(h,(_=>A.forEach(_.wo,(P=>f.persistence.referenceDelegate.addReference(p,_.targetId,P))).next((()=>A.forEach(_.bo,(P=>f.persistence.referenceDelegate.removeReference(p,_.targetId,P)))))))))}catch(p){if(!Tn(p))throw p;D($c,"Failed to update sequence numbers: "+p)}for(const p of h){const _=p.targetId;if(!p.fromCache){const P=f.$o.get(_),V=P.snapshotVersion,O=P.withLastLimboFreeSnapshotVersion(V);f.$o=f.$o.insert(_,O)}}})(n.localStore,i))}async function NR(r,e){const t=W(r);if(!t.currentUser.isEqual(e)){D(Yc,"User change. New user:",e.toKey());const n=await Gm(t.localStore,e);t.currentUser=e,(function(i,o){i.ac.forEach((u=>{u.forEach((c=>{c.reject(new U(x.CANCELLED,o))}))})),i.ac.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,n.removedBatchIds,n.addedBatchIds),await Ci(t,n.zo)}}function kR(r,e){const t=W(r),n=t.sc.get(e);if(n&&n.Zu)return Q().add(n.key);{let s=Q();const i=t.tc.get(e);if(!i)return s;for(const o of i??[]){const u=t.ec.get(o);s=s.unionWith(u.view.Uu)}return s}}function hg(r){const e=W(r);return e.remoteStore.remoteSyncer.applyRemoteEvent=ag.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=kR.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=VR.bind(null,e),e.Xu.zn=_R.bind(null,e.eventManager),e.Xu.Ec=yR.bind(null,e.eventManager),e}function dg(r){const e=W(r);return e.remoteStore.remoteSyncer.applySuccessfulWrite=CR.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=xR.bind(null,e),e}class ui{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=aa(e.databaseInfo.databaseId),this.sharedClientState=this.Rc(e),this.persistence=this.Ic(e),await this.persistence.start(),this.localStore=this.Ac(e),this.gcScheduler=this.Vc(e,this.localStore),this.indexBackfillerScheduler=this.dc(e,this.localStore)}Vc(e,t){return null}dc(e,t){return null}Ac(e){return Km(this.persistence,new zm,e.initialUser,this.serializer)}Ic(e){return new Fc(Ia.C_,this.serializer)}Rc(e){return new Wm}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}ui.provider={build:()=>new ui};class OR extends ui{constructor(e){super(),this.cacheSizeBytes=e}Vc(e,t){N(this.persistence.referenceDelegate instanceof Bo,46915);const n=this.persistence.referenceDelegate.garbageCollector;return new hm(n,e.asyncQueue,t)}Ic(e){const t=this.cacheSizeBytes!==void 0?Ne.withCacheSize(this.cacheSizeBytes):Ne.DEFAULT;return new Fc((n=>Bo.C_(n,t)),this.serializer)}}class LR extends ui{constructor(e,t,n){super(),this.fc=e,this.cacheSizeBytes=t,this.forceOwnership=n,this.kind="persistent",this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.fc.initialize(this,e),await dg(this.fc.syncEngine),await Vi(this.fc.remoteStore),await this.persistence._o((()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve())))}Ac(e){return Km(this.persistence,new zm,e.initialUser,this.serializer)}Vc(e,t){const n=this.persistence.referenceDelegate.garbageCollector;return new hm(n,e.asyncQueue,t)}dc(e,t){const n=new QE(t,this.persistence);return new WE(e.asyncQueue,n)}Ic(e){const t=zA(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),n=this.cacheSizeBytes!==void 0?Ne.withCacheSize(this.cacheSizeBytes):Ne.DEFAULT;return new Bc(this.synchronizeTabs,t,e.clientId,n,e.asyncQueue,tR(),go(),this.serializer,this.sharedClientState,!!this.forceOwnership)}Rc(e){return new Wm}}class $o{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>Ld(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=NR.bind(null,this.syncEngine),await pR(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new gR})()}createDatastore(e){const t=aa(e.databaseInfo.databaseId),n=Aw(e.databaseInfo);return Vw(e.authCredentials,e.appCheckCredentials,n,t)}createRemoteStore(e){return(function(n,s,i,o,u){return new rR(n,s,i,o,u)})(this.localStore,this.datastore,e.asyncQueue,(t=>Ld(this.syncEngine,t,0)),(function(){return rd.C()?new rd:new Ew})())}createSyncEngine(e,t){return(function(s,i,o,u,c,h,f){const p=new wR(s,i,o,u,c,h);return f&&(p.cc=!0),p})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await(async function(s){const i=W(s);D(At,"RemoteStore shutting down."),i.tu.add(5),await Si(i),i.ru.shutdown(),i.iu.set("Unknown")})(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}$o.provider={build:()=>new $o};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fg{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.mc(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.mc(this.observer.error,e):Be("Uncaught Error in snapshot listener:",e.toString()))}gc(){this.muted=!0}mc(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _n="FirestoreClient";class MR{constructor(e,t,n,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=n,this._databaseInfo=s,this.user=be.UNAUTHENTICATED,this.clientId=Ju.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(n,(async o=>{D(_n,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o})),this.appCheckCredentials.start(n,(o=>(D(_n,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Vt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const n=Wc(t,"Failed to shutdown persistence");e.reject(n)}})),e.promise}}async function nu(r,e){r.asyncQueue.verifyOperationInProgress(),D(_n,"Initializing OfflineComponentProvider");const t=r.configuration;await e.initialize(t);let n=t.initialUser;r.setCredentialChangeListener((async s=>{n.isEqual(s)||(await Gm(e.localStore,s),n=s)})),e.persistence.setDatabaseDeletedListener((()=>r.terminate())),r._offlineComponents=e}async function Ud(r,e){r.asyncQueue.verifyOperationInProgress();const t=await UR(r);D(_n,"Initializing OnlineComponentProvider"),await e.initialize(t,r.configuration),r.setCredentialChangeListener((n=>Nd(e.remoteStore,n))),r.setAppCheckTokenChangeListener(((n,s)=>Nd(e.remoteStore,s))),r._onlineComponents=e}async function UR(r){if(!r._offlineComponents)if(r._uninitializedComponentsProvider){D(_n,"Using user provided OfflineComponentProvider");try{await nu(r,r._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(s){return s.name==="FirebaseError"?s.code===x.FAILED_PRECONDITION||s.code===x.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11})(t))throw t;at("Error using user provided cache. Falling back to memory cache: "+t),await nu(r,new ui)}}else D(_n,"Using default OfflineComponentProvider"),await nu(r,new OR(void 0));return r._offlineComponents}async function pg(r){return r._onlineComponents||(r._uninitializedComponentsProvider?(D(_n,"Using user provided OnlineComponentProvider"),await Ud(r,r._uninitializedComponentsProvider._online)):(D(_n,"Using default OnlineComponentProvider"),await Ud(r,new $o))),r._onlineComponents}function FR(r){return pg(r).then((e=>e.syncEngine))}async function Mu(r){const e=await pg(r),t=e.eventManager;return t.onListen=vR.bind(null,e.syncEngine),t.onUnlisten=PR.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=AR.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=bR.bind(null,e.syncEngine),t}function BR(r,e,t,n){const s=new fg(n),i=new rg(e,s,t);return r.asyncQueue.enqueueAndForget((async()=>tg(await Mu(r),i))),()=>{s.gc(),r.asyncQueue.enqueueAndForget((async()=>ng(await Mu(r),i)))}}function qR(r,e,t={}){const n=new Vt;return r.asyncQueue.enqueueAndForget((async()=>(function(i,o,u,c,h){const f=new fg({next:_=>{f.gc(),o.enqueueAndForget((()=>ng(i,p)));const P=_.docs.has(u);!P&&_.fromCache?h.reject(new U(x.UNAVAILABLE,"Failed to get document because the client is offline.")):P&&_.fromCache&&c&&c.source==="server"?h.reject(new U(x.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):h.resolve(_)},error:_=>h.reject(_)}),p=new rg(Ei(u.path),f,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return tg(i,p)})(await Mu(r),r.asyncQueue,e,t,n))),n.promise}function $R(r,e){const t=new Vt;return r.asyncQueue.enqueueAndForget((async()=>SR(await FR(r),e,t))),t.promise}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fd="AsyncQueue";class Bd{constructor(e=Promise.resolve()){this.qc=[],this.$c=!1,this.Kc=[],this.Wc=null,this.Qc=!1,this.Gc=!1,this.zc=[],this.xn=new am(this,"async_queue_retry"),this.jc=()=>{const n=go();n&&D(Fd,"Visibility state changed to "+n.visibilityState),this.xn.gn()},this.Hc=e;const t=go();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.jc)}get isShuttingDown(){return this.$c}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Jc(),this.Yc(e)}enterRestrictedMode(e){if(!this.$c){this.$c=!0,this.Gc=e||!1;const t=go();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.jc)}}enqueue(e){if(this.Jc(),this.$c)return new Promise((()=>{}));const t=new Vt;return this.Yc((()=>this.$c&&this.Gc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.qc.push(e),this.Zc())))}async Zc(){if(this.qc.length!==0){try{await this.qc[0](),this.qc.shift(),this.xn.reset()}catch(e){if(!Tn(e))throw e;D(Fd,"Operation failed with retryable error: "+e)}this.qc.length>0&&this.xn.mn((()=>this.Zc()))}}Yc(e){const t=this.Hc.then((()=>(this.Qc=!0,e().catch((n=>{throw this.Wc=n,this.Qc=!1,Be("INTERNAL UNHANDLED ERROR: ",qd(n)),n})).then((n=>(this.Qc=!1,n))))));return this.Hc=t,t}enqueueAfterDelay(e,t,n){this.Jc(),this.zc.indexOf(e)>-1&&(t=0);const s=Hc.createAndSchedule(this,e,t,n,(i=>this.Xc(i)));return this.Kc.push(s),s}Jc(){this.Wc&&B(47125,{el:qd(this.Wc)})}verifyOperationInProgress(){}async tl(){let e;do e=this.Hc,await e;while(e!==this.Hc)}nl(e){for(const t of this.Kc)if(t.timerId===e)return!0;return!1}rl(e){return this.tl().then((()=>{this.Kc.sort(((t,n)=>t.targetTimeMs-n.targetTimeMs));for(const t of this.Kc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.tl()}))}il(e){this.zc.push(e)}Xc(e){const t=this.Kc.indexOf(e);this.Kc.splice(t,1)}}function qd(r){let e=r.message||"";return r.stack&&(e=r.stack.includes(r.message)?r.stack:r.message+`
`+r.stack),e}class jr extends Ec{constructor(e,t,n,s){super(e,t,n,s),this.type="firestore",this._queue=new Bd,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Bd(e),this._firestoreClient=void 0,await e}}}function PP(r,e,t){t||(t=Ws);const n=hi(r,"firestore");if(n.isInitialized(t)){const s=n.getImmediate({identifier:t}),i=n.getOptions(t);if(ln(i,e))return s;throw new U(x.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new U(x.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<lm)throw new U(x.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return e.host&&yn(e.host)&&Go(e.host),n.initialize({options:e,instanceIdentifier:t})}function bP(r,e){const t=typeof r=="object"?r:qu(),n=typeof r=="string"?r:Ws,s=hi(t,"firestore").getImmediate({identifier:n});if(!s._initialized){const i=Zd("firestore");i&&kw(s,...i)}return s}function Xc(r){if(r._terminated)throw new U(x.FAILED_PRECONDITION,"The client has already been terminated.");return r._firestoreClient||mg(r),r._firestoreClient}function mg(r){var n,s,i,o;const e=r._freezeSettings(),t=xw(r._databaseId,((n=r._app)==null?void 0:n.options.appId)||"",r._persistenceKey,(s=r._app)==null?void 0:s.options.apiKey,e);r._componentsProvider||(i=e.localCache)!=null&&i._offlineComponentProvider&&((o=e.localCache)!=null&&o._onlineComponentProvider)&&(r._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),r._firestoreClient=new MR(r._authCredentials,r._appCheckCredentials,r._queue,t,r._componentsProvider&&(function(c){const h=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(h),_online:h}})(r._componentsProvider))}function SP(r,e){at("enableIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const t=r._freezeSettings();return jR(r,$o.provider,{build:n=>new LR(n,t.cacheSizeBytes,e==null?void 0:e.forceOwnership)}),Promise.resolve()}function jR(r,e,t){if((r=Ct(r,jr))._firestoreClient||r._terminated)throw new U(x.FAILED_PRECONDITION,"Firestore has already been started and persistence can no longer be enabled. You can only enable persistence before calling any other methods on a Firestore object.");if(r._componentsProvider||r._getSettings().localCache)throw new U(x.FAILED_PRECONDITION,"SDK cache is already specified.");r._componentsProvider={_online:e,_offline:t},mg(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zR{convertValue(e,t="none"){switch(Ie(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ae(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Ot(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw B(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const n={};return tr(e,((s,i)=>{n[s]=this.convertValue(i,t)})),n}convertVectorValue(e){var n,s,i;const t=(i=(s=(n=e.fields)==null?void 0:n[Qn].arrayValue)==null?void 0:s.values)==null?void 0:i.map((o=>ae(o.doubleValue)));return new Ke(t)}convertGeoPoint(e){return new wt(ae(e.latitude),ae(e.longitude))}convertArray(e,t){return(e.values||[]).map((n=>this.convertValue(n,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const n=Ii(e);return n==null?null:this.convertValue(n,t);case"estimate":return this.convertTimestamp(Nr(e));default:return null}}convertTimestamp(e){const t=kt(e);return new se(t.seconds,t.nanos)}convertDocumentKey(e,t){const n=ee.fromString(e);N(nm(n),9688,{name:e});const s=new Wn(n.get(1),n.get(3)),i=new F(n.popFirst(5));return s.isEqual(t)||Be(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gg extends zR{constructor(e){super(),this.firestore=e}convertBytes(e){return new rt(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new ye(this.firestore,null,t)}}const $d="@firebase/firestore",jd="4.16.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zd(r){return(function(t,n){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of n)if(i in s&&typeof s[i]=="function")return!0;return!1})(r,["next","error","complete"])}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _g{constructor(e,t,n,s,i){this._firestore=e,this._userDataWriter=t,this._key=n,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new ye(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new KR(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(vi("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class KR extends _g{data(){return super.data()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function GR(r){if(r.limitType==="L"&&r.explicitOrderBy.length===0)throw new U(x.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}function HR(r,e,t){let n;return n=r?t&&(t.merge||t.mergeFields)?r.toFirestore(e,t):r.toFirestore(e):e,n}class bs{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class jn extends _g{constructor(e,t,n,s,i,o){super(e,t,n,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new _o(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const n=this._document.data.field(vi("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new U(x.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=jn._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}jn._jsonSchemaVersion="firestore/documentSnapshot/1.0",jn._jsonSchema={type:_e("string",jn._jsonSchemaVersion),bundleSource:_e("string","DocumentSnapshot"),bundleName:_e("string"),bundle:_e("string")};class _o extends jn{data(e={}){return super.data(e)}}class Rr{constructor(e,t,n,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new bs(s.hasPendingWrites,s.fromCache),this.query=n}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((n=>{e.call(t,new _o(this._firestore,this._userDataWriter,n.key,n,new bs(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new U(x.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map((u=>{ge(s._snapshot.query)?Du(s._snapshot.query):mc(s.query._query);const c=new _o(s._firestore,s._userDataWriter,u.doc.key,u.doc,new bs(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);return u.doc,{type:"added",doc:c,oldIndex:-1,newIndex:o++}}))}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter((u=>i||u.type!==3)).map((u=>{const c=new _o(s._firestore,s._userDataWriter,u.doc.key,u.doc,new bs(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);let h=-1,f=-1;return u.type!==0&&(h=o.indexOf(u.doc.key),o=o.delete(u.doc.key)),u.type!==1&&(o=o.add(u.doc),f=o.indexOf(u.doc.key)),{type:WR(u.type),doc:c,oldIndex:h,newIndex:f}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new U(x.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Rr._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Ju.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],n=[],s=[];return this.docs.forEach((i=>{i._document!==null&&(t.push(i._document),n.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function WR(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return B(61501,{type:r})}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Rr._jsonSchemaVersion="firestore/querySnapshot/1.0",Rr._jsonSchema={type:_e("string",Rr._jsonSchemaVersion),bundleSource:_e("string","QuerySnapshot"),bundleName:_e("string"),bundle:_e("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function VP(r){r=Ct(r,ye);const e=Ct(r.firestore,jr),t=Xc(e);return qR(t,r._key).then((n=>yg(e,r,n)))}function CP(r,e,t){r=Ct(r,ye);const n=Ct(r.firestore,jr),s=HR(r.converter,e,t),i=Uw(n);return QR(n,[Fw(i,"setDoc",r._key,s,r.converter!==null,t).toMutation(r._key,Ze.none())])}function xP(r,...e){var h,f,p;r=Ve(r);let t={includeMetadataChanges:!1,source:"default"},n=0;typeof e[n]!="object"||zd(e[n])||(t=e[n++]);const s={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(zd(e[n])){const _=e[n];e[n]=(h=_.next)==null?void 0:h.bind(_),e[n+1]=(f=_.error)==null?void 0:f.bind(_),e[n+2]=(p=_.complete)==null?void 0:p.bind(_)}let i,o,u;if(r instanceof ye)o=Ct(r.firestore,jr),u=Ei(r._key.path),i={next:_=>{e[n]&&e[n](yg(o,r,_))},error:e[n+1],complete:e[n+2]};else{const _=Ct(r,ua);o=Ct(_.firestore,jr),u=_._query;const P=new gg(o);i={next:V=>{e[n]&&e[n](new Rr(o,P,_,V))},error:e[n+1],complete:e[n+2]},GR(r._query)}const c=Xc(o);return BR(c,u,s,i)}function QR(r,e){const t=Xc(r);return $R(t,e)}function yg(r,e,t){const n=t.docs.get(e._key),s=new gg(r);return new jn(r,s,e._key,n,new bs(t.hasPendingWrites,t.fromCache),e.converter)}(function(e,t=!0){DE(Kr),zn(new hn("firestore",((n,{instanceIdentifier:s,options:i})=>{const o=n.getProvider("app").getImmediate(),u=new jr(new OE(n.getProvider("auth-internal")),new UE(o,n.getProvider("app-check-internal")),bT(o,s),o);return i={useFetchStreams:t,...i},u._setSettings(i),u}),"PUBLIC").setMultipleInstances(!0)),yt($d,jd,e),yt($d,jd,"esm2020")})();/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const YR="type.googleapis.com/google.protobuf.Int64Value",JR="type.googleapis.com/google.protobuf.UInt64Value";function Ig(r,e){const t={};for(const n in r)r.hasOwnProperty(n)&&(t[n]=e(r[n]));return t}function jo(r){if(r==null)return null;if(r instanceof Number&&(r=r.valueOf()),typeof r=="number"&&isFinite(r)||r===!0||r===!1||Object.prototype.toString.call(r)==="[object String]")return r;if(r instanceof Date)return r.toISOString();if(Array.isArray(r))return r.map(e=>jo(e));if(typeof r=="function"||typeof r=="object")return Ig(r,e=>jo(e));throw new Error("Data cannot be encoded in JSON: "+r)}function zr(r){if(r==null)return r;if(r["@type"])switch(r["@type"]){case YR:case JR:{const e=Number(r.value);if(isNaN(e))throw new Error("Data cannot be decoded from JSON: "+r);return e}default:throw new Error("Data cannot be decoded from JSON: "+r)}return Array.isArray(r)?r.map(e=>zr(e)):typeof r=="function"||typeof r=="object"?Ig(r,e=>zr(e)):r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zc="functions";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kd={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class ze extends Rt{constructor(e,t,n){super(`${Zc}/${e}`,t||""),this.details=n,Object.setPrototypeOf(this,ze.prototype)}}function XR(r){if(r>=200&&r<300)return"ok";switch(r){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function zo(r,e){let t=XR(r),n=t,s;try{const i=e&&e.error;if(i){const o=i.status;if(typeof o=="string"){if(!Kd[o])return new ze("internal","internal");t=Kd[o],n=o}const u=i.message;typeof u=="string"&&(n=u),s=i.details,s!==void 0&&(s=zr(s))}}catch{}return t==="ok"?null:new ze(t,n,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ZR{constructor(e,t,n,s){this.app=e,this.auth=null,this.messaging=null,this.appCheck=null,this.serverAppAppCheckToken=null,Je(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.auth=t.getImmediate({optional:!0}),this.messaging=n.getImmediate({optional:!0}),this.auth||t.get().then(i=>this.auth=i,()=>{}),this.messaging||n.get().then(i=>this.messaging=i,()=>{}),this.appCheck||s==null||s.get().then(i=>this.appCheck=i,()=>{})}async getAuthToken(){if(this.auth)try{const e=await this.auth.getToken();return e==null?void 0:e.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(e){if(this.serverAppAppCheckToken)return this.serverAppAppCheckToken;if(this.appCheck){const t=e?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return t.error?null:t.token}return null}async getContext(e){const t=await this.getAuthToken(),n=await this.getMessagingToken(),s=await this.getAppCheckToken(e);return{authToken:t,messagingToken:n,appCheckToken:s}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uu="us-central1",eP=/^data: (.*?)(?:\n|$)/;function tP(r){let e=null;return{promise:new Promise((t,n)=>{e=setTimeout(()=>{n(new ze("deadline-exceeded","deadline-exceeded"))},r)}),cancel:()=>{e&&clearTimeout(e)}}}class nP{constructor(e,t,n,s,i=Uu,o=(...u)=>fetch(...u)){this.app=e,this.fetchImpl=o,this.emulatorOrigin=null,this.contextProvider=new ZR(e,t,n,s),this.cancelAllRequests=new Promise(u=>{this.deleteService=()=>Promise.resolve(u())});try{const u=new URL(i);this.customDomain=u.origin+(u.pathname==="/"?"":u.pathname),this.region=Uu}catch{this.customDomain=null,this.region=i}}_delete(){return this.deleteService()}_url(e){const t=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${t}/${this.region}/${e}`:this.customDomain!==null?`${this.customDomain}/${e}`:`https://${this.region}-${t}.cloudfunctions.net/${e}`}}function rP(r,e,t){const n=yn(e);r.emulatorOrigin=`http${n?"s":""}://${e}:${t}`,n&&Go(r.emulatorOrigin+"/backends")}function sP(r,e,t){const n=s=>oP(r,e,s,{});return n.stream=(s,i)=>uP(r,e,s,i),n}function Eg(r){return r.emulatorOrigin&&yn(r.emulatorOrigin)?"include":void 0}async function iP(r,e,t,n,s){t["Content-Type"]="application/json";let i;try{i=await n(r,{method:"POST",body:JSON.stringify(e),headers:t,credentials:Eg(s)})}catch{return{status:0,json:null}}let o=null;try{o=await i.json()}catch{}return{status:i.status,json:o}}async function Tg(r,e){const t={},n=await r.contextProvider.getContext(e.limitedUseAppCheckTokens);return n.authToken&&(t.Authorization="Bearer "+n.authToken),n.messagingToken&&(t["Firebase-Instance-ID-Token"]=n.messagingToken),n.appCheckToken!==null&&(t["X-Firebase-AppCheck"]=n.appCheckToken),t}function oP(r,e,t,n){const s=r._url(e);return aP(r,s,t,n)}async function aP(r,e,t,n){t=jo(t);const s={data:t},i=await Tg(r,n),o=n.timeout||7e4,u=tP(o),c=await Promise.race([iP(e,s,i,r.fetchImpl,r),u.promise,r.cancelAllRequests]);if(u.cancel(),!c)throw new ze("cancelled","Firebase Functions instance was deleted.");const h=zo(c.status,c.json);if(h)throw h;if(!c.json)throw new ze("internal","Response is not valid JSON object.");let f=c.json.data;if(typeof f>"u"&&(f=c.json.result),typeof f>"u")throw new ze("internal","Response is missing data field.");return{data:zr(f)}}function uP(r,e,t,n){const s=r._url(e);return cP(r,s,t,n||{})}async function cP(r,e,t,n){var _;t=jo(t);const s={data:t},i=await Tg(r,n);i["Content-Type"]="application/json",i.Accept="text/event-stream";let o;try{o=await r.fetchImpl(e,{method:"POST",body:JSON.stringify(s),headers:i,signal:n==null?void 0:n.signal,credentials:Eg(r)})}catch(P){if(P instanceof Error&&P.name==="AbortError"){const O=new ze("cancelled","Request was cancelled.");return{data:Promise.reject(O),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(O)}}}}}}const V=zo(0,null);return{data:Promise.reject(V),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(V)}}}}}}let u,c;const h=new Promise((P,V)=>{u=P,c=V});(_=n==null?void 0:n.signal)==null||_.addEventListener("abort",()=>{const P=new ze("cancelled","Request was cancelled.");c(P)});const f=o.body.getReader(),p=lP(f,u,c,n==null?void 0:n.signal);return{stream:{[Symbol.asyncIterator](){const P=p.getReader();return{async next(){const{value:V,done:O}=await P.read();return{value:V,done:O}},async return(){return await P.cancel(),{done:!0,value:void 0}}}}},data:h}}function lP(r,e,t,n){const s=(o,u)=>{const c=o.match(eP);if(!c)return;const h=c[1];try{const f=JSON.parse(h);if("result"in f){e(zr(f.result));return}if("message"in f){u.enqueue(zr(f.message));return}if("error"in f){const p=zo(0,f);u.error(p),t(p);return}}catch(f){if(f instanceof ze){u.error(f),t(f);return}}},i=new TextDecoder;return new ReadableStream({start(o){let u="";return c();async function c(){if(n!=null&&n.aborted){const h=new ze("cancelled","Request was cancelled");return o.error(h),t(h),Promise.resolve()}try{const{value:h,done:f}=await r.read();if(f){u.trim()&&s(u.trim(),o),o.close();return}if(n!=null&&n.aborted){const _=new ze("cancelled","Request was cancelled");o.error(_),t(_),await r.cancel();return}u+=i.decode(h,{stream:!0});const p=u.split(`
`);u=p.pop()||"";for(const _ of p)_.trim()&&s(_.trim(),o);return c()}catch(h){const f=h instanceof ze?h:zo(0,null);o.error(f),t(f)}}},cancel(){return r.cancel()}})}const Gd="@firebase/functions",Hd="0.13.5";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hP="auth-internal",dP="app-check-internal",fP="messaging-internal";function pP(r){const e=(t,{instanceIdentifier:n})=>{const s=t.getProvider("app").getImmediate(),i=t.getProvider(hP),o=t.getProvider(fP),u=t.getProvider(dP);return new nP(s,i,o,u,n)};zn(new hn(Zc,e,"PUBLIC").setMultipleInstances(!0)),yt(Gd,Hd,r),yt(Gd,Hd,"esm2020")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function DP(r=qu(),e=Uu){const n=hi(Ve(r),Zc).getImmediate({identifier:e}),s=Zd("functions");return s&&mP(n,...s),n}function mP(r,e,t){rP(Ve(r),e,t)}function NP(r,e,t){return sP(Ve(r),e)}pP();export{qu as a,vP as b,PP as c,bP as d,SP as e,RP as f,_P as g,CP as h,ly as i,xP as j,VP as k,EP as l,IP as m,wP as n,TP as o,DP as p,NP as q,yP as s};
