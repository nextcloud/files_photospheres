/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../node_modules/@nextcloud/auth/dist/index.mjs"
/*!******************************************************!*\
  !*** ../node_modules/@nextcloud/auth/dist/index.mjs ***!
  \******************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getCSPNonce: () => (/* binding */ getCSPNonce),
/* harmony export */   getCurrentUser: () => (/* binding */ getCurrentUser),
/* harmony export */   getGuestNickname: () => (/* binding */ getGuestNickname),
/* harmony export */   getGuestUser: () => (/* binding */ getGuestUser),
/* harmony export */   getRequestToken: () => (/* binding */ getRequestToken),
/* harmony export */   onRequestTokenUpdate: () => (/* binding */ onRequestTokenUpdate),
/* harmony export */   setGuestNickname: () => (/* binding */ setGuestNickname)
/* harmony export */ });
/* harmony import */ var _nextcloud_event_bus__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @nextcloud/event-bus */ "../node_modules/@nextcloud/event-bus/dist/index.mjs");
/* harmony import */ var _nextcloud_browser_storage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @nextcloud/browser-storage */ "../node_modules/@nextcloud/browser-storage/dist/index.js");


let token;
const observers = [];
function getRequestToken() {
  if (token === void 0) {
    token = document.head.dataset.requesttoken ?? null;
  }
  return token;
}
function onRequestTokenUpdate(observer) {
  observers.push(observer);
}
(0,_nextcloud_event_bus__WEBPACK_IMPORTED_MODULE_0__.subscribe)("csrf-token-update", (e) => {
  token = e.token;
  observers.forEach((observer) => {
    try {
      observer(token);
    } catch (error) {
      console.error("Error updating CSRF token observer", error);
    }
  });
});
function getCSPNonce() {
  const meta = document?.querySelector('meta[name="csp-nonce"]');
  if (!meta) {
    const token2 = getRequestToken();
    return token2 ? btoa(token2) : void 0;
  }
  return meta.nonce;
}
/*!
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
const browserStorage = (0,_nextcloud_browser_storage__WEBPACK_IMPORTED_MODULE_1__.getBuilder)("public").persist().build();
class GuestUser {
  _displayName;
  uid;
  isAdmin;
  constructor() {
    if (!browserStorage.getItem("guestUid")) {
      browserStorage.setItem("guestUid", randomUUID());
    }
    this._displayName = browserStorage.getItem("guestNickname") || "";
    this.uid = browserStorage.getItem("guestUid") || randomUUID();
    this.isAdmin = false;
    (0,_nextcloud_event_bus__WEBPACK_IMPORTED_MODULE_0__.subscribe)("user:info:changed", (guest) => {
      this._displayName = guest.displayName;
      browserStorage.setItem("guestNickname", guest.displayName || "");
    });
  }
  get displayName() {
    return this._displayName;
  }
  set displayName(displayName) {
    this._displayName = displayName;
    browserStorage.setItem("guestNickname", displayName);
    (0,_nextcloud_event_bus__WEBPACK_IMPORTED_MODULE_0__.emit)("user:info:changed", this);
  }
}
let currentUser$1;
function getGuestUser() {
  if (!currentUser$1) {
    currentUser$1 = new GuestUser();
  }
  return currentUser$1;
}
function getGuestNickname() {
  return getGuestUser()?.displayName || null;
}
function setGuestNickname(nickname) {
  if (!nickname || nickname.trim().length === 0) {
    throw new Error("Nickname cannot be empty");
  }
  getGuestUser().displayName = nickname;
}
function randomUUID() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
let currentUser;
function getAttribute(el, attribute) {
  if (el) {
    return el.getAttribute(attribute);
  }
  return null;
}
function getCurrentUser() {
  if (currentUser !== void 0) {
    return currentUser;
  }
  const head = document?.getElementsByTagName("head")[0];
  if (!head) {
    return null;
  }
  const uid = getAttribute(head, "data-user");
  if (uid === null) {
    currentUser = null;
    return currentUser;
  }
  currentUser = {
    uid,
    displayName: getAttribute(head, "data-user-displayname"),
    isAdmin: !!window._oc_isadmin
  };
  return currentUser;
}

//# sourceMappingURL=index.mjs.map


/***/ },

/***/ "../node_modules/@nextcloud/browser-storage/dist/ScopedStorage.js"
/*!************************************************************************!*\
  !*** ../node_modules/@nextcloud/browser-storage/dist/ScopedStorage.js ***!
  \************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ScopedStorage)
/* harmony export */ });
/*
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
class ScopedStorage {
    static GLOBAL_SCOPE_VOLATILE = 'nextcloud_vol';
    static GLOBAL_SCOPE_PERSISTENT = 'nextcloud_per';
    scope;
    wrapped;
    constructor(scope, wrapped, persistent) {
        this.scope = `${persistent ? ScopedStorage.GLOBAL_SCOPE_PERSISTENT : ScopedStorage.GLOBAL_SCOPE_VOLATILE}_${btoa(scope)}_`;
        this.wrapped = wrapped;
    }
    scopeKey(key) {
        return `${this.scope}${key}`;
    }
    setItem(key, value) {
        this.wrapped.setItem(this.scopeKey(key), value);
    }
    getItem(key) {
        return this.wrapped.getItem(this.scopeKey(key));
    }
    removeItem(key) {
        this.wrapped.removeItem(this.scopeKey(key));
    }
    clear() {
        Object.keys(this.wrapped)
            .filter((key) => key.startsWith(this.scope))
            .map(this.wrapped.removeItem.bind(this.wrapped));
    }
}


/***/ },

/***/ "../node_modules/@nextcloud/browser-storage/dist/StorageBuilder.js"
/*!*************************************************************************!*\
  !*** ../node_modules/@nextcloud/browser-storage/dist/StorageBuilder.js ***!
  \*************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ StorageBuilder)
/* harmony export */ });
/* harmony import */ var _ScopedStorage_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ScopedStorage.js */ "../node_modules/@nextcloud/browser-storage/dist/ScopedStorage.js");
/*
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

class StorageBuilder {
    appId;
    persisted = false;
    clearedOnLogout = false;
    constructor(appId) {
        this.appId = appId;
    }
    persist(persist = true) {
        this.persisted = persist;
        return this;
    }
    clearOnLogout(clear = true) {
        this.clearedOnLogout = clear;
        return this;
    }
    build() {
        return new _ScopedStorage_js__WEBPACK_IMPORTED_MODULE_0__["default"](this.appId, this.persisted ? window.localStorage : window.sessionStorage, !this.clearedOnLogout);
    }
}


/***/ },

/***/ "../node_modules/@nextcloud/browser-storage/dist/index.js"
/*!****************************************************************!*\
  !*** ../node_modules/@nextcloud/browser-storage/dist/index.js ***!
  \****************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearAll: () => (/* binding */ clearAll),
/* harmony export */   clearNonPersistent: () => (/* binding */ clearNonPersistent),
/* harmony export */   getBuilder: () => (/* binding */ getBuilder)
/* harmony export */ });
/* harmony import */ var _ScopedStorage_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ScopedStorage.js */ "../node_modules/@nextcloud/browser-storage/dist/ScopedStorage.js");
/* harmony import */ var _StorageBuilder_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./StorageBuilder.js */ "../node_modules/@nextcloud/browser-storage/dist/StorageBuilder.js");
/*
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */


/**
 * Get the storage builder for an app
 *
 * @param appId App ID to scope storage
 */
function getBuilder(appId) {
    return new _StorageBuilder_js__WEBPACK_IMPORTED_MODULE_1__["default"](appId);
}
/**
 * Clear values from storage
 *
 * @param storage The storage to clear
 * @param pred Callback to check if value should be cleared
 */
function clearStorage(storage, pred) {
    Object.keys(storage)
        .filter((k) => pred ? pred(k) : true)
        .map(storage.removeItem.bind(storage));
}
/**
 * Clear all values from all storages
 */
function clearAll() {
    const storages = [
        window.sessionStorage,
        window.localStorage,
    ];
    storages.map((s) => clearStorage(s));
}
/**
 * Clear ony non persistent values
 */
function clearNonPersistent() {
    const storages = [
        window.sessionStorage,
        window.localStorage,
    ];
    storages.map((s) => clearStorage(s, (k) => !k.startsWith(_ScopedStorage_js__WEBPACK_IMPORTED_MODULE_0__["default"].GLOBAL_SCOPE_PERSISTENT)));
}


/***/ },

/***/ "../node_modules/@nextcloud/event-bus/dist/index.mjs"
/*!***********************************************************!*\
  !*** ../node_modules/@nextcloud/event-bus/dist/index.mjs ***!
  \***********************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ProxyBus: () => (/* binding */ ProxyBus),
/* harmony export */   SimpleBus: () => (/* binding */ SimpleBus),
/* harmony export */   emit: () => (/* binding */ emit),
/* harmony export */   subscribe: () => (/* binding */ subscribe),
/* harmony export */   unsubscribe: () => (/* binding */ unsubscribe)
/* harmony export */ });
/* harmony import */ var semver_functions_major_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! semver/functions/major.js */ "../node_modules/semver/functions/major.js");
/* harmony import */ var semver_functions_valid_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! semver/functions/valid.js */ "../node_modules/semver/functions/valid.js");


/*!
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
class ProxyBus {
  bus;
  constructor(bus2) {
    if (typeof bus2.getVersion !== "function" || !semver_functions_valid_js__WEBPACK_IMPORTED_MODULE_1__(bus2.getVersion())) {
      console.warn("Proxying an event bus with an unknown or invalid version");
    } else if (semver_functions_major_js__WEBPACK_IMPORTED_MODULE_0__(bus2.getVersion()) !== semver_functions_major_js__WEBPACK_IMPORTED_MODULE_0__(this.getVersion())) {
      console.warn(
        "Proxying an event bus of version " + bus2.getVersion() + " with " + this.getVersion()
      );
    }
    this.bus = bus2;
  }
  getVersion() {
    return "3.3.3";
  }
  subscribe(name, handler) {
    this.bus.subscribe(name, handler);
  }
  unsubscribe(name, handler) {
    this.bus.unsubscribe(name, handler);
  }
  emit(name, ...event) {
    this.bus.emit(name, ...event);
  }
}
/*!
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
class SimpleBus {
  handlers = /* @__PURE__ */ new Map();
  getVersion() {
    return "3.3.3";
  }
  subscribe(name, handler) {
    this.handlers.set(
      name,
      (this.handlers.get(name) || []).concat(
        handler
      )
    );
  }
  unsubscribe(name, handler) {
    this.handlers.set(
      name,
      (this.handlers.get(name) || []).filter((h) => h !== handler)
    );
  }
  emit(name, ...event) {
    const handlers = this.handlers.get(name) || [];
    handlers.forEach((h) => {
      try {
        ;
        h(event[0]);
      } catch (e) {
        console.error("could not invoke event listener", e);
      }
    });
  }
}
/*!
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
let bus = null;
function getBus() {
  if (bus !== null) {
    return bus;
  }
  if (typeof window === "undefined") {
    return new Proxy({}, {
      get: () => {
        return () => console.error(
          "Window not available, EventBus can not be established!"
        );
      }
    });
  }
  if (window.OC?._eventBus && typeof window._nc_event_bus === "undefined") {
    console.warn(
      "found old event bus instance at OC._eventBus. Update your version!"
    );
    window._nc_event_bus = window.OC._eventBus;
  }
  if (typeof window?._nc_event_bus !== "undefined") {
    bus = new ProxyBus(window._nc_event_bus);
  } else {
    bus = window._nc_event_bus = new SimpleBus();
  }
  return bus;
}
function subscribe(name, handler) {
  getBus().subscribe(name, handler);
}
function unsubscribe(name, handler) {
  getBus().unsubscribe(name, handler);
}
function emit(name, ...event) {
  getBus().emit(name, ...event);
}

//# sourceMappingURL=index.mjs.map


/***/ },

/***/ "../node_modules/@nextcloud/files/dist/chunks/folder-CeyZUHai.mjs"
/*!************************************************************************!*\
  !*** ../node_modules/@nextcloud/files/dist/chunks/folder-CeyZUHai.mjs ***!
  \************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   F: () => (/* binding */ FileType),
/* harmony export */   N: () => (/* binding */ Node),
/* harmony export */   P: () => (/* binding */ Permission),
/* harmony export */   a: () => (/* binding */ File),
/* harmony export */   b: () => (/* binding */ Folder),
/* harmony export */   c: () => (/* binding */ NodeStatus),
/* harmony export */   l: () => (/* binding */ logger)
/* harmony export */ });
/* harmony import */ var _nextcloud_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @nextcloud/logger */ "../node_modules/@nextcloud/logger/dist/index.mjs");
/* harmony import */ var _nextcloud_paths__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @nextcloud/paths */ "../node_modules/@nextcloud/paths/dist/index.mjs");


const logger = (0,_nextcloud_logger__WEBPACK_IMPORTED_MODULE_0__.getLoggerBuilder)().setApp("@nextcloud/files").detectUser().build();
const FileType = Object.freeze({
  Folder: "folder",
  File: "file"
});
const Permission = Object.freeze({
  /**
   * No permissions granted
   */
  NONE: 0,
  /**
   * Can read the file content
   */
  READ: 1,
  /**
   * Can modify the file itself (move, rename, etc)
   */
  UPDATE: 2,
  /**
   * Can create new files/folders inside a folder
   */
  CREATE: 4,
  /**
   * Can change the file content
   */
  WRITE: 4,
  /**
   * Can delete the node
   */
  DELETE: 8,
  /**
   * Can share the node
   */
  SHARE: 16,
  /**
   * All permissions are granted
   */
  ALL: 31
});
function isDavResource(source, davService) {
  return source.match(davService) !== null;
}
function validateData(data, davService) {
  if (data.id && typeof data.id !== "number") {
    throw new Error("Invalid id type of value");
  }
  if (!data.source) {
    throw new Error("Missing mandatory source");
  }
  try {
    new URL(data.source);
  } catch {
    throw new Error("Invalid source format, source must be a valid URL");
  }
  if (!data.source.startsWith("http")) {
    throw new Error("Invalid source format, only http(s) is supported");
  }
  if (!data.root) {
    throw new Error("Missing mandatory root");
  }
  if (typeof data.root !== "string") {
    throw new Error("Invalid root type");
  }
  if (!data.root.startsWith("/")) {
    throw new Error("Root must start with a leading slash");
  }
  if (!data.source.includes(data.root)) {
    throw new Error("Root must be part of the source");
  }
  if (isDavResource(data.source, davService)) {
    const service = data.source.match(davService)[0];
    if (!data.source.includes((0,_nextcloud_paths__WEBPACK_IMPORTED_MODULE_1__.join)(service, data.root))) {
      throw new Error("The root must be relative to the service. e.g /files/emma");
    }
  }
  if (data.displayname && typeof data.displayname !== "string") {
    throw new Error("Invalid displayname type");
  }
  if (data.mtime && !(data.mtime instanceof Date)) {
    throw new Error("Invalid mtime type");
  }
  if (data.crtime && !(data.crtime instanceof Date)) {
    throw new Error("Invalid crtime type");
  }
  if (!data.mime || typeof data.mime !== "string" || !data.mime.match(/^[-\w.]+\/[-+\w.]+$/gi)) {
    throw new Error("Missing or invalid mandatory mime");
  }
  if ("size" in data && typeof data.size !== "number" && data.size !== void 0) {
    throw new Error("Invalid size type");
  }
  if ("permissions" in data && data.permissions !== void 0 && !(typeof data.permissions === "number" && data.permissions >= Permission.NONE && data.permissions <= Permission.ALL)) {
    throw new Error("Invalid permissions");
  }
  if (data.owner && data.owner !== null && typeof data.owner !== "string") {
    throw new Error("Invalid owner type");
  }
  if (data.attributes && typeof data.attributes !== "object") {
    throw new Error("Invalid attributes type");
  }
  if (data.status && !Object.values(NodeStatus).includes(data.status)) {
    throw new Error("Status must be a valid NodeStatus");
  }
}
function fixDates(data) {
  if (data.mtime && typeof data.mtime === "string") {
    if (!isNaN(Date.parse(data.mtime)) && JSON.stringify(new Date(data.mtime)) === JSON.stringify(data.mtime)) {
      data.mtime = new Date(data.mtime);
    }
  }
  if (data.crtime && typeof data.crtime === "string") {
    if (!isNaN(Date.parse(data.crtime)) && JSON.stringify(new Date(data.crtime)) === JSON.stringify(data.crtime)) {
      data.crtime = new Date(data.crtime);
    }
  }
}
function fixRegExp(pattern) {
  if (pattern instanceof RegExp) {
    return pattern;
  }
  const matches = pattern.match(/(\/?)(.+)\1([a-z]*)/i);
  if (!matches) {
    throw new Error("Invalid regular expression format.");
  }
  const validFlags = Array.from(new Set(matches[3])).filter((flag) => "gimsuy".includes(flag)).join("");
  return new RegExp(matches[2], validFlags);
}
const NodeStatus = Object.freeze({
  /** This is a new node and it doesn't exists on the filesystem yet */
  NEW: "new",
  /** This node has failed and is unavailable  */
  FAILED: "failed",
  /** This node is currently loading or have an operation in progress */
  LOADING: "loading",
  /** This node is locked and cannot be modified */
  LOCKED: "locked"
});
class Node {
  _attributes;
  _data;
  _knownDavService = /(remote|public)\.php\/(web)?dav/i;
  readonlyAttributes = Object.entries(Object.getOwnPropertyDescriptors(Node.prototype)).filter((e) => typeof e[1].get === "function" && e[0] !== "__proto__").map((e) => e[0]);
  handler = {
    set: (target, prop, value) => {
      if (this.readonlyAttributes.includes(prop)) {
        return false;
      }
      return Reflect.set(target, prop, value);
    },
    deleteProperty: (target, prop) => {
      if (this.readonlyAttributes.includes(prop)) {
        return false;
      }
      return Reflect.deleteProperty(target, prop);
    }
  };
  constructor(...[data, davService]) {
    if (!data.mime) {
      data.mime = "application/octet-stream";
    }
    fixDates(data);
    davService = fixRegExp(davService || this._knownDavService);
    validateData(data, davService);
    this._data = {
      ...data,
      attributes: {}
    };
    this._attributes = new Proxy(this._data.attributes, this.handler);
    this.update(data.attributes ?? {});
    if (davService) {
      this._knownDavService = davService;
    }
  }
  /**
   * Get the source url to this object
   * There is no setter as the source is not meant to be changed manually.
   * You can use the rename or move method to change the source.
   */
  get source() {
    return this._data.source.replace(/\/$/i, "");
  }
  /**
   * Get the encoded source url to this object for requests purposes
   */
  get encodedSource() {
    const { origin } = new URL(this.source);
    return origin + (0,_nextcloud_paths__WEBPACK_IMPORTED_MODULE_1__.encodePath)(this.source.slice(origin.length));
  }
  /**
   * Get this object name
   * There is no setter as the source is not meant to be changed manually.
   * You can use the rename or move method to change the source.
   */
  get basename() {
    return (0,_nextcloud_paths__WEBPACK_IMPORTED_MODULE_1__.basename)(this.source);
  }
  /**
   * The nodes displayname
   * By default the display name and the `basename` are identical,
   * but it is possible to have a different name. This happens
   * on the files app for example for shared folders.
   */
  get displayname() {
    return this._data.displayname || this.basename;
  }
  /**
   * Set the displayname
   */
  set displayname(displayname) {
    validateData({ ...this._data, displayname }, this._knownDavService);
    this._data.displayname = displayname;
  }
  /**
   * Get this object's extension
   * There is no setter as the source is not meant to be changed manually.
   * You can use the rename or move method to change the source.
   */
  get extension() {
    return (0,_nextcloud_paths__WEBPACK_IMPORTED_MODULE_1__.extname)(this.source);
  }
  /**
   * Get the directory path leading to this object
   * Will use the relative path to root if available
   *
   * There is no setter as the source is not meant to be changed manually.
   * You can use the rename or move method to change the source.
   */
  get dirname() {
    return (0,_nextcloud_paths__WEBPACK_IMPORTED_MODULE_1__.dirname)(this.path);
  }
  /**
   * Get the file mime
   */
  get mime() {
    return this._data.mime || "application/octet-stream";
  }
  /**
   * Set the file mime
   * Removing the mime type will set it to `application/octet-stream`
   */
  set mime(mime) {
    mime ??= "application/octet-stream";
    validateData({ ...this._data, mime }, this._knownDavService);
    this._data.mime = mime;
  }
  /**
   * Get the file modification time
   */
  get mtime() {
    return this._data.mtime;
  }
  /**
   * Set the file modification time
   */
  set mtime(mtime) {
    validateData({ ...this._data, mtime }, this._knownDavService);
    this._data.mtime = mtime;
  }
  /**
   * Get the file creation time
   * There is no setter as the creation time is not meant to be changed
   */
  get crtime() {
    return this._data.crtime;
  }
  /**
   * Get the file size
   */
  get size() {
    return this._data.size;
  }
  /**
   * Set the file size
   */
  set size(size) {
    validateData({ ...this._data, size }, this._knownDavService);
    this.updateMtime();
    this._data.size = size;
  }
  /**
   * Get the file attribute
   * This contains all additional attributes not provided by the Node class
   */
  get attributes() {
    return this._attributes;
  }
  /**
   * Get the file permissions
   */
  get permissions() {
    if (this.owner === null && !this.isDavResource) {
      return Permission.READ;
    }
    return this._data.permissions !== void 0 ? this._data.permissions : Permission.NONE;
  }
  /**
   * Set the file permissions
   */
  set permissions(permissions) {
    validateData({ ...this._data, permissions }, this._knownDavService);
    this.updateMtime();
    this._data.permissions = permissions;
  }
  /**
   * Get the file owner
   * There is no setter as the owner is not meant to be changed
   */
  get owner() {
    if (!this.isDavResource) {
      return null;
    }
    return this._data.owner;
  }
  /**
   * Is this a dav-related resource ?
   */
  get isDavResource() {
    return isDavResource(this.source, this._knownDavService);
  }
  /**
   * Get the dav root of this object
   * There is no setter as the root is not meant to be changed
   */
  get root() {
    return this._data.root.replace(/^(.+)\/$/, "$1");
  }
  /**
   * Get the absolute path of this object relative to the root
   */
  get path() {
    const idx = this.source.indexOf("://");
    const protocol = this.source.slice(0, idx);
    const remainder = this.source.slice(idx + 3);
    const slashIndex = remainder.indexOf("/");
    const host = remainder.slice(0, slashIndex);
    const rawPath = remainder.slice(slashIndex);
    const safeUrl = `${protocol}://${host}${(0,_nextcloud_paths__WEBPACK_IMPORTED_MODULE_1__.encodePath)(rawPath)}`;
    const url = new URL(safeUrl);
    let source = decodeURIComponent(url.pathname);
    if (this.isDavResource) {
      source = source.split(this._knownDavService).pop();
    }
    const firstMatch = source.indexOf(this.root);
    const root = this.root.replace(/\/$/, "");
    return source.slice(firstMatch + root.length) || "/";
  }
  /**
   * Get the node id if defined.
   * There is no setter as the fileid is not meant to be changed
   */
  get fileid() {
    return this._data?.id;
  }
  /**
   * Get the node status.
   */
  get status() {
    return this._data?.status;
  }
  /**
   * Set the node status.
   */
  set status(status) {
    validateData({ ...this._data, status }, this._knownDavService);
    this._data.status = status;
  }
  /**
   * Move the node to a new destination
   *
   * @param destination the new source.
   * e.g. https://cloud.domain.com/remote.php/dav/files/emma/Photos/picture.jpg
   */
  move(destination) {
    validateData({ ...this._data, source: destination }, this._knownDavService);
    const oldBasename = this.basename;
    this._data.source = destination;
    if (this.displayname === oldBasename && this.basename !== oldBasename) {
      this.displayname = this.basename;
    }
  }
  /**
   * Rename the node
   * This aliases the move method for easier usage
   *
   * @param basename The new name of the node
   */
  rename(basename2) {
    if (basename2.includes("/")) {
      throw new Error("Invalid basename");
    }
    this.move((0,_nextcloud_paths__WEBPACK_IMPORTED_MODULE_1__.dirname)(this.source) + "/" + basename2);
  }
  /**
   * Update the mtime if exists
   */
  updateMtime() {
    if (this._data.mtime) {
      this._data.mtime = /* @__PURE__ */ new Date();
    }
  }
  /**
   * Update the attributes of the node
   * Warning, updating attributes will NOT automatically update the mtime.
   *
   * @param attributes The new attributes to update on the Node attributes
   */
  update(attributes) {
    for (const [name, value] of Object.entries(attributes)) {
      try {
        if (value === void 0) {
          delete this.attributes[name];
        } else {
          this.attributes[name] = value;
        }
      } catch (e) {
        if (e instanceof TypeError) {
          continue;
        }
        throw e;
      }
    }
  }
  /**
   * Returns a clone of the node
   */
  clone() {
    return new this.constructor(structuredClone(this._data), this._knownDavService);
  }
  /**
   * JSON representation of the node
   */
  toJSON() {
    return JSON.stringify([structuredClone(this._data), this._knownDavService.toString()]);
  }
}
class File extends Node {
  constructor(...[data, davService]) {
    super(data, davService);
  }
  get type() {
    return FileType.File;
  }
}
class Folder extends Node {
  constructor(...[data, davService]) {
    super({
      ...data,
      mime: "httpd/unix-directory"
    }, davService);
  }
  get type() {
    return FileType.Folder;
  }
  get extension() {
    return null;
  }
  get mime() {
    return "httpd/unix-directory";
  }
}

//# sourceMappingURL=folder-CeyZUHai.mjs.map


/***/ },

/***/ "../node_modules/@nextcloud/files/dist/dav.mjs"
/*!*****************************************************!*\
  !*** ../node_modules/@nextcloud/files/dist/dav.mjs ***!
  \*****************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defaultDavNamespaces: () => (/* binding */ defaultDavNamespaces),
/* harmony export */   defaultDavProperties: () => (/* binding */ defaultDavProperties),
/* harmony export */   defaultRemoteURL: () => (/* binding */ defaultRemoteURL),
/* harmony export */   defaultRootPath: () => (/* binding */ defaultRootPath),
/* harmony export */   getClient: () => (/* binding */ getClient),
/* harmony export */   getDavNameSpaces: () => (/* binding */ getDavNameSpaces),
/* harmony export */   getDavProperties: () => (/* binding */ getDavProperties),
/* harmony export */   getDefaultPropfind: () => (/* binding */ getDefaultPropfind),
/* harmony export */   getFavoriteNodes: () => (/* binding */ getFavoriteNodes),
/* harmony export */   getFavoritesReport: () => (/* binding */ getFavoritesReport),
/* harmony export */   getRecentSearch: () => (/* binding */ getRecentSearch),
/* harmony export */   getRemoteURL: () => (/* binding */ getRemoteURL),
/* harmony export */   getRootPath: () => (/* binding */ getRootPath),
/* harmony export */   parsePermissions: () => (/* binding */ parsePermissions),
/* harmony export */   registerDavProperty: () => (/* binding */ registerDavProperty),
/* harmony export */   resultToNode: () => (/* binding */ resultToNode)
/* harmony export */ });
/* harmony import */ var _nextcloud_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @nextcloud/auth */ "../node_modules/@nextcloud/auth/dist/index.mjs");
/* harmony import */ var _nextcloud_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @nextcloud/router */ "../node_modules/@nextcloud/router/dist/index.mjs");
/* harmony import */ var _nextcloud_sharing_public__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @nextcloud/sharing/public */ "../node_modules/@nextcloud/sharing/dist/public.js");
/* harmony import */ var webdav__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! webdav */ "../node_modules/webdav/dist/web/index.js");
/* harmony import */ var _chunks_folder_CeyZUHai_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./chunks/folder-CeyZUHai.mjs */ "../node_modules/@nextcloud/files/dist/chunks/folder-CeyZUHai.mjs");





/*!
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
function parsePermissions(permString = "") {
  let permissions = _chunks_folder_CeyZUHai_mjs__WEBPACK_IMPORTED_MODULE_4__.P.NONE;
  if (!permString) {
    return permissions;
  }
  if (permString.includes("G")) {
    permissions |= _chunks_folder_CeyZUHai_mjs__WEBPACK_IMPORTED_MODULE_4__.P.READ;
  }
  if (permString.includes("W")) {
    permissions |= _chunks_folder_CeyZUHai_mjs__WEBPACK_IMPORTED_MODULE_4__.P.WRITE;
  }
  if (permString.includes("CK")) {
    permissions |= _chunks_folder_CeyZUHai_mjs__WEBPACK_IMPORTED_MODULE_4__.P.CREATE;
  }
  if (permString.includes("NV")) {
    permissions |= _chunks_folder_CeyZUHai_mjs__WEBPACK_IMPORTED_MODULE_4__.P.UPDATE;
  }
  if (permString.includes("D")) {
    permissions |= _chunks_folder_CeyZUHai_mjs__WEBPACK_IMPORTED_MODULE_4__.P.DELETE;
  }
  if (permString.includes("R")) {
    permissions |= _chunks_folder_CeyZUHai_mjs__WEBPACK_IMPORTED_MODULE_4__.P.SHARE;
  }
  return permissions;
}
const defaultDavProperties = [
  "d:getcontentlength",
  "d:getcontenttype",
  "d:getetag",
  "d:getlastmodified",
  "d:creationdate",
  "d:displayname",
  "d:quota-available-bytes",
  "d:resourcetype",
  "nc:has-preview",
  "nc:is-encrypted",
  "nc:mount-type",
  "oc:comments-unread",
  "oc:favorite",
  "oc:fileid",
  "oc:owner-display-name",
  "oc:owner-id",
  "oc:permissions",
  "oc:size"
];
const defaultDavNamespaces = {
  d: "DAV:",
  nc: "http://nextcloud.org/ns",
  oc: "http://owncloud.org/ns",
  ocs: "http://open-collaboration-services.org/ns"
};
function registerDavProperty(prop, namespace = { nc: "http://nextcloud.org/ns" }) {
  if (typeof window._nc_dav_properties === "undefined") {
    window._nc_dav_properties = [...defaultDavProperties];
    window._nc_dav_namespaces = { ...defaultDavNamespaces };
  }
  const namespaces = { ...window._nc_dav_namespaces, ...namespace };
  if (window._nc_dav_properties.find((search) => search === prop)) {
    _chunks_folder_CeyZUHai_mjs__WEBPACK_IMPORTED_MODULE_4__.l.warn(`${prop} already registered`, { prop });
    return false;
  }
  if (prop.startsWith("<") || prop.split(":").length !== 2) {
    _chunks_folder_CeyZUHai_mjs__WEBPACK_IMPORTED_MODULE_4__.l.error(`${prop} is not valid. See example: 'oc:fileid'`, { prop });
    return false;
  }
  const ns = prop.split(":")[0];
  if (!namespaces[ns]) {
    _chunks_folder_CeyZUHai_mjs__WEBPACK_IMPORTED_MODULE_4__.l.error(`${prop} namespace unknown`, { prop, namespaces });
    return false;
  }
  window._nc_dav_properties.push(prop);
  window._nc_dav_namespaces = namespaces;
  return true;
}
function getDavProperties() {
  if (typeof window._nc_dav_properties === "undefined") {
    window._nc_dav_properties = [...defaultDavProperties];
  }
  return window._nc_dav_properties.map((prop) => `<${prop} />`).join(" ");
}
function getDavNameSpaces() {
  if (typeof window._nc_dav_namespaces === "undefined") {
    window._nc_dav_namespaces = { ...defaultDavNamespaces };
  }
  return Object.keys(window._nc_dav_namespaces).map((ns) => `xmlns:${ns}="${window._nc_dav_namespaces?.[ns]}"`).join(" ");
}
function getDefaultPropfind() {
  return `<?xml version="1.0"?>
		<d:propfind ${getDavNameSpaces()}>
			<d:prop>
				${getDavProperties()}
			</d:prop>
		</d:propfind>`;
}
function getFavoritesReport() {
  return `<?xml version="1.0"?>
		<oc:filter-files ${getDavNameSpaces()}>
			<d:prop>
				${getDavProperties()}
			</d:prop>
			<oc:filter-rules>
				<oc:favorite>1</oc:favorite>
			</oc:filter-rules>
		</oc:filter-files>`;
}
function getRecentSearch(lastModified) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<d:searchrequest ${getDavNameSpaces()}
	xmlns:ns="https://github.com/icewind1991/SearchDAV/ns">
	<d:basicsearch>
		<d:select>
			<d:prop>
				${getDavProperties()}
			</d:prop>
		</d:select>
		<d:from>
			<d:scope>
				<d:href>/files/${(0,_nextcloud_auth__WEBPACK_IMPORTED_MODULE_0__.getCurrentUser)()?.uid}/</d:href>
				<d:depth>infinity</d:depth>
			</d:scope>
		</d:from>
		<d:where>
			<d:and>
				<d:or>
					<d:not>
						<d:eq>
							<d:prop>
								<d:getcontenttype/>
							</d:prop>
							<d:literal>httpd/unix-directory</d:literal>
						</d:eq>
					</d:not>
					<d:eq>
						<d:prop>
							<oc:size/>
						</d:prop>
						<d:literal>0</d:literal>
					</d:eq>
				</d:or>
				<d:gt>
					<d:prop>
						<d:getlastmodified/>
					</d:prop>
					<d:literal>${lastModified}</d:literal>
				</d:gt>
			</d:and>
		</d:where>
		<d:orderby>
			<d:order>
				<d:prop>
					<d:getlastmodified/>
				</d:prop>
				<d:descending/>
			</d:order>
		</d:orderby>
		<d:limit>
			<d:nresults>100</d:nresults>
			<ns:firstresult>0</ns:firstresult>
		</d:limit>
	</d:basicsearch>
</d:searchrequest>`;
}
function getRootPath() {
  if ((0,_nextcloud_sharing_public__WEBPACK_IMPORTED_MODULE_2__.isPublicShare)()) {
    return `/files/${(0,_nextcloud_sharing_public__WEBPACK_IMPORTED_MODULE_2__.getSharingToken)()}`;
  }
  return `/files/${(0,_nextcloud_auth__WEBPACK_IMPORTED_MODULE_0__.getCurrentUser)()?.uid}`;
}
const defaultRootPath = getRootPath();
function getRemoteURL() {
  const url = (0,_nextcloud_router__WEBPACK_IMPORTED_MODULE_1__.generateRemoteUrl)("dav");
  if ((0,_nextcloud_sharing_public__WEBPACK_IMPORTED_MODULE_2__.isPublicShare)()) {
    return url.replace("remote.php", "public.php");
  }
  return url;
}
const defaultRemoteURL = getRemoteURL();
function getClient(remoteURL = defaultRemoteURL, headers = {}) {
  const client = (0,webdav__WEBPACK_IMPORTED_MODULE_3__.createClient)(remoteURL, { headers });
  function setHeaders(token) {
    client.setHeaders({
      ...headers,
      // Add this so the server knows it is an request from the browser
      "X-Requested-With": "XMLHttpRequest",
      // Inject user auth
      requesttoken: token ?? ""
    });
  }
  (0,_nextcloud_auth__WEBPACK_IMPORTED_MODULE_0__.onRequestTokenUpdate)(setHeaders);
  setHeaders((0,_nextcloud_auth__WEBPACK_IMPORTED_MODULE_0__.getRequestToken)());
  const patcher = (0,webdav__WEBPACK_IMPORTED_MODULE_3__.getPatcher)();
  patcher.patch("fetch", (url, options) => {
    const headers2 = options.headers;
    if (headers2?.method) {
      options.method = headers2.method;
      delete headers2.method;
    }
    return fetch(url, options);
  });
  return client;
}
async function getFavoriteNodes(options = {}) {
  const client = options.client ?? getClient();
  const path = options.path ?? "/";
  const davRoot = options.davRoot ?? defaultRootPath;
  const contentsResponse = await client.getDirectoryContents(`${davRoot}${path}`, {
    signal: options.signal,
    details: true,
    data: getFavoritesReport(),
    headers: {
      // see getClient for patched webdav client
      method: "REPORT"
    },
    includeSelf: true
  });
  return contentsResponse.data.filter((node) => node.filename !== path).map((result) => resultToNode(result, davRoot));
}
function resultToNode(node, filesRoot = defaultRootPath, remoteURL = defaultRemoteURL) {
  let userId = (0,_nextcloud_auth__WEBPACK_IMPORTED_MODULE_0__.getCurrentUser)()?.uid;
  if ((0,_nextcloud_sharing_public__WEBPACK_IMPORTED_MODULE_2__.isPublicShare)()) {
    userId = userId ?? "anonymous";
  } else if (!userId) {
    throw new Error("No user id found");
  }
  const props = node.props;
  const permissions = parsePermissions(props?.permissions);
  const owner = String(props?.["owner-id"] || userId);
  const id = props.fileid || 0;
  const mtime = new Date(Date.parse(node.lastmod));
  const crtime = new Date(Date.parse(props.creationdate));
  const nodeData = {
    id,
    source: `${remoteURL}${node.filename}`,
    mtime: !isNaN(mtime.getTime()) && mtime.getTime() !== 0 ? mtime : void 0,
    crtime: !isNaN(crtime.getTime()) && crtime.getTime() !== 0 ? crtime : void 0,
    mime: node.mime || "application/octet-stream",
    // Manually cast to work around for https://github.com/perry-mitchell/webdav-client/pull/380
    displayname: props.displayname !== void 0 ? String(props.displayname) : void 0,
    size: props?.size || Number.parseInt(props.getcontentlength || "0"),
    // The fileid is set to -1 for failed requests
    status: id < 0 ? _chunks_folder_CeyZUHai_mjs__WEBPACK_IMPORTED_MODULE_4__.c.FAILED : void 0,
    permissions,
    owner,
    root: filesRoot,
    attributes: {
      ...node,
      ...props,
      hasPreview: props?.["has-preview"]
    }
  };
  delete nodeData.attributes?.props;
  return node.type === "file" ? new _chunks_folder_CeyZUHai_mjs__WEBPACK_IMPORTED_MODULE_4__.a(nodeData) : new _chunks_folder_CeyZUHai_mjs__WEBPACK_IMPORTED_MODULE_4__.b(nodeData);
}

//# sourceMappingURL=dav.mjs.map


/***/ },

/***/ "../node_modules/@nextcloud/initial-state/dist/index.js"
/*!**************************************************************!*\
  !*** ../node_modules/@nextcloud/initial-state/dist/index.js ***!
  \**************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadState: () => (/* binding */ loadState)
/* harmony export */ });
/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/**
 * @param app app ID, e.g. "mail"
 * @param key name of the property
 * @param fallback optional parameter to use as default value
 * @throws if the key can't be found
 */
function loadState(app, key, fallback) {
    const selector = `#initial-state-${app}-${key}`;
    if (window._nc_initial_state?.has(selector)) {
        return window._nc_initial_state.get(selector);
    }
    else if (!window._nc_initial_state) {
        window._nc_initial_state = new Map();
    }
    const elem = document.querySelector(selector);
    if (elem === null) {
        if (fallback !== undefined) {
            return fallback;
        }
        throw new Error(`Could not find initial state ${key} of ${app}`);
    }
    try {
        const parsedValue = JSON.parse(atob(elem.value));
        window._nc_initial_state.set(selector, parsedValue);
        return parsedValue;
    }
    catch (error) {
        console.error('[@nextcloud/initial-state] Could not parse initial state', { key, app, error });
        if (fallback !== undefined) {
            return fallback;
        }
        throw new Error(`Could not parse initial state ${key} of ${app}`, { cause: error });
    }
}


/***/ },

/***/ "../node_modules/@nextcloud/logger/dist/index.mjs"
/*!********************************************************!*\
  !*** ../node_modules/@nextcloud/logger/dist/index.mjs ***!
  \********************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LogLevel: () => (/* binding */ LogLevel),
/* harmony export */   getLogger: () => (/* binding */ getLogger),
/* harmony export */   getLoggerBuilder: () => (/* binding */ getLoggerBuilder)
/* harmony export */ });
/* harmony import */ var _nextcloud_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @nextcloud/auth */ "../node_modules/@nextcloud/auth/dist/index.mjs");

var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["Debug"] = 0] = "Debug";
  LogLevel2[LogLevel2["Info"] = 1] = "Info";
  LogLevel2[LogLevel2["Warn"] = 2] = "Warn";
  LogLevel2[LogLevel2["Error"] = 3] = "Error";
  LogLevel2[LogLevel2["Fatal"] = 4] = "Fatal";
  return LogLevel2;
})(LogLevel || {});
class ConsoleLogger {
  context;
  constructor(context) {
    this.context = context || {};
  }
  formatMessage(message, level, context) {
    let msg = "[" + LogLevel[level].toUpperCase() + "] ";
    if (context && context.app) {
      msg += context.app + ": ";
    }
    if (typeof message === "string") return msg + message;
    msg += `Unexpected ${message.name}`;
    if (message.message) msg += ` "${message.message}"`;
    if (level === LogLevel.Debug && message.stack) msg += `

Stack trace:
${message.stack}`;
    return msg;
  }
  log(level, message, context) {
    if (typeof this.context?.level === "number" && level < this.context?.level) {
      return;
    }
    if (typeof message === "object" && context?.error === void 0) {
      context.error = message;
    }
    switch (level) {
      case LogLevel.Debug:
        console.debug(this.formatMessage(message, LogLevel.Debug, context), context);
        break;
      case LogLevel.Info:
        console.info(this.formatMessage(message, LogLevel.Info, context), context);
        break;
      case LogLevel.Warn:
        console.warn(this.formatMessage(message, LogLevel.Warn, context), context);
        break;
      case LogLevel.Error:
        console.error(this.formatMessage(message, LogLevel.Error, context), context);
        break;
      case LogLevel.Fatal:
      default:
        console.error(this.formatMessage(message, LogLevel.Fatal, context), context);
        break;
    }
  }
  debug(message, context) {
    this.log(LogLevel.Debug, message, Object.assign({}, this.context, context));
  }
  info(message, context) {
    this.log(LogLevel.Info, message, Object.assign({}, this.context, context));
  }
  warn(message, context) {
    this.log(LogLevel.Warn, message, Object.assign({}, this.context, context));
  }
  error(message, context) {
    this.log(LogLevel.Error, message, Object.assign({}, this.context, context));
  }
  fatal(message, context) {
    this.log(LogLevel.Fatal, message, Object.assign({}, this.context, context));
  }
}
function buildConsoleLogger(context) {
  return new ConsoleLogger(context);
}
class LoggerBuilder {
  context;
  factory;
  constructor(factory) {
    this.context = {};
    this.factory = factory;
  }
  /**
   * Set the app name within the logging context
   *
   * @param appId App name
   */
  setApp(appId) {
    this.context.app = appId;
    return this;
  }
  /**
   * Set the logging level within the logging context
   *
   * @param level Logging level
   */
  setLogLevel(level) {
    this.context.level = level;
    return this;
  }
  /* eslint-disable jsdoc/no-undefined-types */
  /**
   * Set the user id within the logging context
   * @param uid User ID
   * @see {@link detectUser}
   */
  /* eslint-enable jsdoc/no-undefined-types */
  setUid(uid) {
    this.context.uid = uid;
    return this;
  }
  /**
   * Detect the currently logged in user and set the user id within the logging context
   */
  detectUser() {
    const user = (0,_nextcloud_auth__WEBPACK_IMPORTED_MODULE_0__.getCurrentUser)();
    if (user !== null) {
      this.context.uid = user.uid;
    }
    return this;
  }
  /**
   * Detect and use logging level configured in nextcloud config
   */
  detectLogLevel() {
    const self = this;
    const onLoaded = () => {
      if (document.readyState === "complete" || document.readyState === "interactive") {
        self.context.level = window._oc_config?.loglevel ?? LogLevel.Warn;
        if (window._oc_debug) {
          self.context.level = LogLevel.Debug;
        }
        document.removeEventListener("readystatechange", onLoaded);
      } else {
        document.addEventListener("readystatechange", onLoaded);
      }
    };
    onLoaded();
    return this;
  }
  /** Build a logger using the logging context and factory */
  build() {
    if (this.context.level === void 0) {
      this.detectLogLevel();
    }
    return this.factory(this.context);
  }
}
function getLoggerBuilder() {
  return new LoggerBuilder(buildConsoleLogger);
}
function getLogger() {
  return getLoggerBuilder().build();
}

//# sourceMappingURL=index.mjs.map


/***/ },

/***/ "../node_modules/@nextcloud/paths/dist/index.mjs"
/*!*******************************************************!*\
  !*** ../node_modules/@nextcloud/paths/dist/index.mjs ***!
  \*******************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   basename: () => (/* binding */ basename),
/* harmony export */   dirname: () => (/* binding */ dirname),
/* harmony export */   encodePath: () => (/* binding */ encodePath),
/* harmony export */   extname: () => (/* binding */ extname),
/* harmony export */   isSamePath: () => (/* binding */ isSamePath),
/* harmony export */   join: () => (/* binding */ join)
/* harmony export */ });
function encodePath(path) {
  if (!path) {
    return path;
  }
  return path.split("/").map(encodeURIComponent).join("/");
}
function basename(path, extname2) {
  path = path.replace(/\\/g, "/").replace(/\/+$/g, "").replace(/.*\//, "");
  if (extname2 && extname2 !== path && path.endsWith(extname2)) {
    return path.substring(0, path.length - extname2.length);
  }
  return path;
}
function dirname(path) {
  path = path.replaceAll(/\\/g, "/");
  const sections = path.split("/");
  if (sections.length <= 1) {
    return ".";
  }
  sections.pop();
  if (sections.length === 1 && sections[0] === "") {
    return "/";
  }
  return sections.join("/");
}
function extname(path) {
  const base = basename(path);
  const index = base.lastIndexOf(".");
  if (index > 0) {
    return base.substring(index);
  }
  return "";
}
function join(...args) {
  if (arguments.length < 1) {
    return "";
  }
  const nonEmptyArgs = args.filter((arg) => arg.length > 0);
  if (nonEmptyArgs.length < 1) {
    return "";
  }
  const lastArg = nonEmptyArgs[nonEmptyArgs.length - 1];
  const leadingSlash = nonEmptyArgs[0].charAt(0) === "/";
  const trailingSlash = lastArg.charAt(lastArg.length - 1) === "/";
  const sections = nonEmptyArgs.reduce((acc, section) => acc.concat(section.split("/")), []);
  let first = !leadingSlash;
  const path = sections.reduce((acc, section) => {
    if (section === "") {
      return acc;
    }
    if (first) {
      first = false;
      return acc + section;
    }
    return acc + "/" + section;
  }, "");
  if (trailingSlash) {
    return path + "/";
  }
  return path;
}
function isSamePath(path1, path2) {
  const pathSections1 = (path1 || "").split("/").filter((p) => p !== ".");
  const pathSections2 = (path2 || "").split("/").filter((p) => p !== ".");
  path1 = join(...pathSections1);
  path2 = join(...pathSections2);
  return path1 === path2;
}

//# sourceMappingURL=index.mjs.map


/***/ },

/***/ "../node_modules/@nextcloud/router/dist/index.mjs"
/*!********************************************************!*\
  !*** ../node_modules/@nextcloud/router/dist/index.mjs ***!
  \********************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generateAvatarUrl: () => (/* binding */ generateAvatarUrl),
/* harmony export */   generateFilePath: () => (/* binding */ generateFilePath),
/* harmony export */   generateOcsUrl: () => (/* binding */ generateOcsUrl),
/* harmony export */   generateRemoteUrl: () => (/* binding */ generateRemoteUrl),
/* harmony export */   generateUrl: () => (/* binding */ generateUrl),
/* harmony export */   getAppRootUrl: () => (/* binding */ getAppRootUrl),
/* harmony export */   getBaseUrl: () => (/* binding */ getBaseUrl),
/* harmony export */   getRootUrl: () => (/* binding */ getRootUrl),
/* harmony export */   imagePath: () => (/* binding */ imagePath),
/* harmony export */   linkTo: () => (/* binding */ linkTo)
/* harmony export */ });
function linkTo(app, file) {
  return generateFilePath(app, "", file);
}
const linkToRemoteBase = (service) => "/remote.php/" + service;
const generateRemoteUrl = (service, options) => {
  const baseURL = options?.baseURL ?? getBaseUrl();
  return baseURL + linkToRemoteBase(service);
};
const generateOcsUrl = (url, params, options) => {
  const allOptions = Object.assign({
    ocsVersion: 2
  }, options || {});
  const version = allOptions.ocsVersion === 1 ? 1 : 2;
  const baseURL = options?.baseURL ?? getBaseUrl();
  return baseURL + "/ocs/v" + version + ".php" + _generateUrlPath(url, params, options);
};
const _generateUrlPath = (url, params, options) => {
  const allOptions = Object.assign({
    escape: true
  }, options || {});
  const _build = function(text, vars) {
    vars = vars || {};
    return text.replace(
      /{([^{}]*)}/g,
      function(a, b) {
        const r = vars[b];
        if (allOptions.escape) {
          return typeof r === "string" || typeof r === "number" ? encodeURIComponent(r.toString()) : encodeURIComponent(a);
        } else {
          return typeof r === "string" || typeof r === "number" ? r.toString() : a;
        }
      }
    );
  };
  if (url.charAt(0) !== "/") {
    url = "/" + url;
  }
  return _build(url, params || {});
};
const generateUrl = (url, params, options) => {
  const allOptions = Object.assign({
    noRewrite: false
  }, options || {});
  const baseOrRootURL = options?.baseURL ?? getRootUrl();
  if (window?.OC?.config?.modRewriteWorking === true && !allOptions.noRewrite) {
    return baseOrRootURL + _generateUrlPath(url, params, options);
  }
  return baseOrRootURL + "/index.php" + _generateUrlPath(url, params, options);
};
const imagePath = (app, file) => {
  if (!file.includes(".")) {
    return generateFilePath(app, "img", `${file}.svg`);
  }
  return generateFilePath(app, "img", file);
};
const generateFilePath = (app, type, file) => {
  const isCore = window?.OC?.coreApps?.includes(app) ?? false;
  const isPHP = file.slice(-3) === "php";
  let link = getRootUrl();
  if (isPHP && !isCore) {
    link += `/index.php/apps/${app}`;
    if (type) {
      link += `/${encodeURI(type)}`;
    }
    if (file !== "index.php") {
      link += `/${file}`;
    }
  } else if (!isPHP && !isCore) {
    link = getAppRootUrl(app);
    if (type) {
      link += `/${type}/`;
    }
    if (link.at(-1) !== "/") {
      link += "/";
    }
    link += file;
  } else {
    if ((app === "settings" || app === "core" || app === "search") && type === "ajax") {
      link += "/index.php";
    }
    if (app) {
      link += `/${app}`;
    }
    if (type) {
      link += `/${type}`;
    }
    link += `/${file}`;
  }
  return link;
};
const getBaseUrl = () => window.location.protocol + "//" + window.location.host + getRootUrl();
function getRootUrl() {
  let webroot = window._oc_webroot;
  if (typeof webroot === "undefined") {
    webroot = location.pathname;
    const pos = webroot.indexOf("/index.php/");
    if (pos !== -1) {
      webroot = webroot.slice(0, pos);
    } else {
      const index = webroot.indexOf("/", 1);
      webroot = webroot.slice(0, index > 0 ? index : void 0);
    }
  }
  return webroot;
}
function getAppRootUrl(app) {
  const webroots = window._oc_appswebroots ?? {};
  return webroots[app] ?? "";
}
/*!
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
function generateAvatarUrl(user, options) {
  const size = (options?.size || 64) <= 64 ? 64 : 512;
  const guestUrl = options?.isGuestUser ? "/guest" : "";
  const themeUrl = options?.isDarkTheme ? "/dark" : "";
  return generateUrl(`/avatar${guestUrl}/{user}/{size}${themeUrl}`, {
    user,
    size
  });
}

//# sourceMappingURL=index.mjs.map


/***/ },

/***/ "../node_modules/@nextcloud/sharing/dist/public.js"
/*!*********************************************************!*\
  !*** ../node_modules/@nextcloud/sharing/dist/public.js ***!
  \*********************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getSharingToken: () => (/* binding */ getSharingToken),
/* harmony export */   isPublicShare: () => (/* binding */ isPublicShare)
/* harmony export */ });
/* harmony import */ var _nextcloud_initial_state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @nextcloud/initial-state */ "../node_modules/@nextcloud/initial-state/dist/index.js");
/*!
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/**
 * @module public
 */

/**
 * Check if the current page is on a public share
 */
function isPublicShare() {
    // check both the new initial state version and fallback to legacy input
    return ((0,_nextcloud_initial_state__WEBPACK_IMPORTED_MODULE_0__.loadState)('files_sharing', 'isPublic', null)
        ?? document.querySelector('input#isPublic[type="hidden"][name="isPublic"][value="1"]') !== null);
}
/**
 * Get the sharing token for the current public share
 */
function getSharingToken() {
    return ((0,_nextcloud_initial_state__WEBPACK_IMPORTED_MODULE_0__.loadState)('files_sharing', 'sharingToken', null)
        ?? document.querySelector('input#sharingToken[type="hidden"]')?.value
        ?? null);
}


/***/ },

/***/ "../node_modules/process/browser.js"
/*!******************************************!*\
  !*** ../node_modules/process/browser.js ***!
  \******************************************/
(module) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ },

/***/ "../node_modules/semver/classes/semver.js"
/*!************************************************!*\
  !*** ../node_modules/semver/classes/semver.js ***!
  \************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const debug = __webpack_require__(/*! ../internal/debug */ "../node_modules/semver/internal/debug.js")
const { MAX_LENGTH, MAX_SAFE_INTEGER } = __webpack_require__(/*! ../internal/constants */ "../node_modules/semver/internal/constants.js")
const { safeRe: re, t } = __webpack_require__(/*! ../internal/re */ "../node_modules/semver/internal/re.js")

const parseOptions = __webpack_require__(/*! ../internal/parse-options */ "../node_modules/semver/internal/parse-options.js")
const { compareIdentifiers } = __webpack_require__(/*! ../internal/identifiers */ "../node_modules/semver/internal/identifiers.js")
class SemVer {
  constructor (version, options) {
    options = parseOptions(options)

    if (version instanceof SemVer) {
      if (version.loose === !!options.loose &&
        version.includePrerelease === !!options.includePrerelease) {
        return version
      } else {
        version = version.version
      }
    } else if (typeof version !== 'string') {
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`)
    }

    if (version.length > MAX_LENGTH) {
      throw new TypeError(
        `version is longer than ${MAX_LENGTH} characters`
      )
    }

    debug('SemVer', version, options)
    this.options = options
    this.loose = !!options.loose
    // this isn't actually relevant for versions, but keep it so that we
    // don't run into trouble passing this.options around.
    this.includePrerelease = !!options.includePrerelease

    const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL])

    if (!m) {
      throw new TypeError(`Invalid Version: ${version}`)
    }

    this.raw = version

    // these are actually numbers
    this.major = +m[1]
    this.minor = +m[2]
    this.patch = +m[3]

    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
      throw new TypeError('Invalid major version')
    }

    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
      throw new TypeError('Invalid minor version')
    }

    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
      throw new TypeError('Invalid patch version')
    }

    // numberify any prerelease numeric ids
    if (!m[4]) {
      this.prerelease = []
    } else {
      this.prerelease = m[4].split('.').map((id) => {
        if (/^[0-9]+$/.test(id)) {
          const num = +id
          if (num >= 0 && num < MAX_SAFE_INTEGER) {
            return num
          }
        }
        return id
      })
    }

    this.build = m[5] ? m[5].split('.') : []
    this.format()
  }

  format () {
    this.version = `${this.major}.${this.minor}.${this.patch}`
    if (this.prerelease.length) {
      this.version += `-${this.prerelease.join('.')}`
    }
    return this.version
  }

  toString () {
    return this.version
  }

  compare (other) {
    debug('SemVer.compare', this.version, this.options, other)
    if (!(other instanceof SemVer)) {
      if (typeof other === 'string' && other === this.version) {
        return 0
      }
      other = new SemVer(other, this.options)
    }

    if (other.version === this.version) {
      return 0
    }

    return this.compareMain(other) || this.comparePre(other)
  }

  compareMain (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    if (this.major < other.major) {
      return -1
    }
    if (this.major > other.major) {
      return 1
    }
    if (this.minor < other.minor) {
      return -1
    }
    if (this.minor > other.minor) {
      return 1
    }
    if (this.patch < other.patch) {
      return -1
    }
    if (this.patch > other.patch) {
      return 1
    }
    return 0
  }

  comparePre (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    // NOT having a prerelease is > having one
    if (this.prerelease.length && !other.prerelease.length) {
      return -1
    } else if (!this.prerelease.length && other.prerelease.length) {
      return 1
    } else if (!this.prerelease.length && !other.prerelease.length) {
      return 0
    }

    let i = 0
    do {
      const a = this.prerelease[i]
      const b = other.prerelease[i]
      debug('prerelease compare', i, a, b)
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  compareBuild (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    let i = 0
    do {
      const a = this.build[i]
      const b = other.build[i]
      debug('build compare', i, a, b)
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc (release, identifier, identifierBase) {
    if (release.startsWith('pre')) {
      if (!identifier && identifierBase === false) {
        throw new Error('invalid increment argument: identifier is empty')
      }
      // Avoid an invalid semver results
      if (identifier) {
        const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE])
        if (!match || match[1] !== identifier) {
          throw new Error(`invalid identifier: ${identifier}`)
        }
      }
    }

    switch (release) {
      case 'premajor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor = 0
        this.major++
        this.inc('pre', identifier, identifierBase)
        break
      case 'preminor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor++
        this.inc('pre', identifier, identifierBase)
        break
      case 'prepatch':
        // If this is already a prerelease, it will bump to the next version
        // drop any prereleases that might already exist, since they are not
        // relevant at this point.
        this.prerelease.length = 0
        this.inc('patch', identifier, identifierBase)
        this.inc('pre', identifier, identifierBase)
        break
      // If the input is a non-prerelease version, this acts the same as
      // prepatch.
      case 'prerelease':
        if (this.prerelease.length === 0) {
          this.inc('patch', identifier, identifierBase)
        }
        this.inc('pre', identifier, identifierBase)
        break
      case 'release':
        if (this.prerelease.length === 0) {
          throw new Error(`version ${this.raw} is not a prerelease`)
        }
        this.prerelease.length = 0
        break

      case 'major':
        // If this is a pre-major version, bump up to the same major version.
        // Otherwise increment major.
        // 1.0.0-5 bumps to 1.0.0
        // 1.1.0 bumps to 2.0.0
        if (
          this.minor !== 0 ||
          this.patch !== 0 ||
          this.prerelease.length === 0
        ) {
          this.major++
        }
        this.minor = 0
        this.patch = 0
        this.prerelease = []
        break
      case 'minor':
        // If this is a pre-minor version, bump up to the same minor version.
        // Otherwise increment minor.
        // 1.2.0-5 bumps to 1.2.0
        // 1.2.1 bumps to 1.3.0
        if (this.patch !== 0 || this.prerelease.length === 0) {
          this.minor++
        }
        this.patch = 0
        this.prerelease = []
        break
      case 'patch':
        // If this is not a pre-release version, it will increment the patch.
        // If it is a pre-release it will bump up to the same patch version.
        // 1.2.0-5 patches to 1.2.0
        // 1.2.0 patches to 1.2.1
        if (this.prerelease.length === 0) {
          this.patch++
        }
        this.prerelease = []
        break
      // This probably shouldn't be used publicly.
      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
      case 'pre': {
        const base = Number(identifierBase) ? 1 : 0

        if (this.prerelease.length === 0) {
          this.prerelease = [base]
        } else {
          let i = this.prerelease.length
          while (--i >= 0) {
            if (typeof this.prerelease[i] === 'number') {
              this.prerelease[i]++
              i = -2
            }
          }
          if (i === -1) {
            // didn't increment anything
            if (identifier === this.prerelease.join('.') && identifierBase === false) {
              throw new Error('invalid increment argument: identifier already exists')
            }
            this.prerelease.push(base)
          }
        }
        if (identifier) {
          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
          let prerelease = [identifier, base]
          if (identifierBase === false) {
            prerelease = [identifier]
          }
          if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
            if (isNaN(this.prerelease[1])) {
              this.prerelease = prerelease
            }
          } else {
            this.prerelease = prerelease
          }
        }
        break
      }
      default:
        throw new Error(`invalid increment argument: ${release}`)
    }
    this.raw = this.format()
    if (this.build.length) {
      this.raw += `+${this.build.join('.')}`
    }
    return this
  }
}

module.exports = SemVer


/***/ },

/***/ "../node_modules/semver/functions/major.js"
/*!*************************************************!*\
  !*** ../node_modules/semver/functions/major.js ***!
  \*************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const SemVer = __webpack_require__(/*! ../classes/semver */ "../node_modules/semver/classes/semver.js")
const major = (a, loose) => new SemVer(a, loose).major
module.exports = major


/***/ },

/***/ "../node_modules/semver/functions/parse.js"
/*!*************************************************!*\
  !*** ../node_modules/semver/functions/parse.js ***!
  \*************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const SemVer = __webpack_require__(/*! ../classes/semver */ "../node_modules/semver/classes/semver.js")
const parse = (version, options, throwErrors = false) => {
  if (version instanceof SemVer) {
    return version
  }
  try {
    return new SemVer(version, options)
  } catch (er) {
    if (!throwErrors) {
      return null
    }
    throw er
  }
}

module.exports = parse


/***/ },

/***/ "../node_modules/semver/functions/valid.js"
/*!*************************************************!*\
  !*** ../node_modules/semver/functions/valid.js ***!
  \*************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const parse = __webpack_require__(/*! ./parse */ "../node_modules/semver/functions/parse.js")
const valid = (version, options) => {
  const v = parse(version, options)
  return v ? v.version : null
}
module.exports = valid


/***/ },

/***/ "../node_modules/semver/internal/constants.js"
/*!****************************************************!*\
  !*** ../node_modules/semver/internal/constants.js ***!
  \****************************************************/
(module) {

"use strict";


// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
const SEMVER_SPEC_VERSION = '2.0.0'

const MAX_LENGTH = 256
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
/* istanbul ignore next */ 9007199254740991

// Max safe segment length for coercion.
const MAX_SAFE_COMPONENT_LENGTH = 16

// Max safe length for a build identifier. The max length minus 6 characters for
// the shortest version with a build 0.0.0+BUILD.
const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6

const RELEASE_TYPES = [
  'major',
  'premajor',
  'minor',
  'preminor',
  'patch',
  'prepatch',
  'prerelease',
]

module.exports = {
  MAX_LENGTH,
  MAX_SAFE_COMPONENT_LENGTH,
  MAX_SAFE_BUILD_LENGTH,
  MAX_SAFE_INTEGER,
  RELEASE_TYPES,
  SEMVER_SPEC_VERSION,
  FLAG_INCLUDE_PRERELEASE: 0b001,
  FLAG_LOOSE: 0b010,
}


/***/ },

/***/ "../node_modules/semver/internal/debug.js"
/*!************************************************!*\
  !*** ../node_modules/semver/internal/debug.js ***!
  \************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
/* provided dependency */ var process = __webpack_require__(/*! process/browser.js */ "../node_modules/process/browser.js");


const debug = (
  typeof process === 'object' &&
  process.env &&
  process.env.NODE_DEBUG &&
  /\bsemver\b/i.test(process.env.NODE_DEBUG)
) ? (...args) => console.error('SEMVER', ...args)
  : () => {}

module.exports = debug


/***/ },

/***/ "../node_modules/semver/internal/identifiers.js"
/*!******************************************************!*\
  !*** ../node_modules/semver/internal/identifiers.js ***!
  \******************************************************/
(module) {

"use strict";


const numeric = /^[0-9]+$/
const compareIdentifiers = (a, b) => {
  if (typeof a === 'number' && typeof b === 'number') {
    return a === b ? 0 : a < b ? -1 : 1
  }

  const anum = numeric.test(a)
  const bnum = numeric.test(b)

  if (anum && bnum) {
    a = +a
    b = +b
  }

  return a === b ? 0
    : (anum && !bnum) ? -1
    : (bnum && !anum) ? 1
    : a < b ? -1
    : 1
}

const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a)

module.exports = {
  compareIdentifiers,
  rcompareIdentifiers,
}


/***/ },

/***/ "../node_modules/semver/internal/parse-options.js"
/*!********************************************************!*\
  !*** ../node_modules/semver/internal/parse-options.js ***!
  \********************************************************/
(module) {

"use strict";


// parse out just the options we care about
const looseOption = Object.freeze({ loose: true })
const emptyOpts = Object.freeze({ })
const parseOptions = options => {
  if (!options) {
    return emptyOpts
  }

  if (typeof options !== 'object') {
    return looseOption
  }

  return options
}
module.exports = parseOptions


/***/ },

/***/ "../node_modules/semver/internal/re.js"
/*!*********************************************!*\
  !*** ../node_modules/semver/internal/re.js ***!
  \*********************************************/
(module, exports, __webpack_require__) {

"use strict";


const {
  MAX_SAFE_COMPONENT_LENGTH,
  MAX_SAFE_BUILD_LENGTH,
  MAX_LENGTH,
} = __webpack_require__(/*! ./constants */ "../node_modules/semver/internal/constants.js")
const debug = __webpack_require__(/*! ./debug */ "../node_modules/semver/internal/debug.js")
exports = module.exports = {}

// The actual regexps go on exports.re
const re = exports.re = []
const safeRe = exports.safeRe = []
const src = exports.src = []
const safeSrc = exports.safeSrc = []
const t = exports.t = {}
let R = 0

const LETTERDASHNUMBER = '[a-zA-Z0-9-]'

// Replace some greedy regex tokens to prevent regex dos issues. These regex are
// used internally via the safeRe object since all inputs in this library get
// normalized first to trim and collapse all extra whitespace. The original
// regexes are exported for userland consumption and lower level usage. A
// future breaking change could export the safer regex only with a note that
// all input should have extra whitespace removed.
const safeRegexReplacements = [
  ['\\s', 1],
  ['\\d', MAX_LENGTH],
  [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH],
]

const makeSafeRegex = (value) => {
  for (const [token, max] of safeRegexReplacements) {
    value = value
      .split(`${token}*`).join(`${token}{0,${max}}`)
      .split(`${token}+`).join(`${token}{1,${max}}`)
  }
  return value
}

const createToken = (name, value, isGlobal) => {
  const safe = makeSafeRegex(value)
  const index = R++
  debug(name, index, value)
  t[name] = index
  src[index] = value
  safeSrc[index] = safe
  re[index] = new RegExp(value, isGlobal ? 'g' : undefined)
  safeRe[index] = new RegExp(safe, isGlobal ? 'g' : undefined)
}

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*')
createToken('NUMERICIDENTIFIERLOOSE', '\\d+')

// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

createToken('NONNUMERICIDENTIFIER', `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`)

// ## Main Version
// Three dot-separated numeric identifiers.

createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})`)

createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`)

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.
// Non-numberic identifiers include numberic identifiers but can be longer.
// Therefore non-numberic identifiers must go first.

createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NONNUMERICIDENTIFIER]
}|${src[t.NUMERICIDENTIFIER]})`)

createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NONNUMERICIDENTIFIER]
}|${src[t.NUMERICIDENTIFIERLOOSE]})`)

// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`)

createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`)

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

createToken('BUILDIDENTIFIER', `${LETTERDASHNUMBER}+`)

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
}(?:\\.${src[t.BUILDIDENTIFIER]})*))`)

// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
}${src[t.PRERELEASE]}?${
  src[t.BUILD]}?`)

createToken('FULL', `^${src[t.FULLPLAIN]}$`)

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
}${src[t.PRERELEASELOOSE]}?${
  src[t.BUILD]}?`)

createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`)

createToken('GTLT', '((?:<|>)?=?)')

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`)
createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`)

createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:${src[t.PRERELEASE]})?${
                     src[t.BUILD]}?` +
                   `)?)?`)

createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:${src[t.PRERELEASELOOSE]})?${
                          src[t.BUILD]}?` +
                        `)?)?`)

createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`)
createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`)

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
createToken('COERCEPLAIN', `${'(^|[^\\d])' +
              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`)
createToken('COERCE', `${src[t.COERCEPLAIN]}(?:$|[^\\d])`)
createToken('COERCEFULL', src[t.COERCEPLAIN] +
              `(?:${src[t.PRERELEASE]})?` +
              `(?:${src[t.BUILD]})?` +
              `(?:$|[^\\d])`)
createToken('COERCERTL', src[t.COERCE], true)
createToken('COERCERTLFULL', src[t.COERCEFULL], true)

// Tilde ranges.
// Meaning is "reasonably at or greater than"
createToken('LONETILDE', '(?:~>?)')

createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true)
exports.tildeTrimReplace = '$1~'

createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`)
createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`)

// Caret ranges.
// Meaning is "at least and backwards compatible with"
createToken('LONECARET', '(?:\\^)')

createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true)
exports.caretTrimReplace = '$1^'

createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`)
createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`)

// A simple gt/lt/eq thing, or just "" to indicate "any version"
createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`)
createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`)

// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true)
exports.comparatorTrimReplace = '$1$2$3'

// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
                   `\\s+-\\s+` +
                   `(${src[t.XRANGEPLAIN]})` +
                   `\\s*$`)

createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s+-\\s+` +
                        `(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s*$`)

// Star ranges basically just allow anything at all.
createToken('STAR', '(<|>)?=?\\s*\\*')
// >=0.0.0 is like a star
createToken('GTE0', '^\\s*>=\\s*0\\.0\\.0\\s*$')
createToken('GTE0PRE', '^\\s*>=\\s*0\\.0\\.0-0\\s*$')


/***/ },

/***/ "../node_modules/webdav/dist/web/index.js"
/*!************************************************!*\
  !*** ../node_modules/webdav/dist/web/index.js ***!
  \************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AuthType: () => (/* binding */ nn),
/* harmony export */   ErrorCode: () => (/* binding */ rn),
/* harmony export */   Request: () => (/* binding */ on),
/* harmony export */   Response: () => (/* binding */ sn),
/* harmony export */   createClient: () => (/* binding */ an),
/* harmony export */   getPatcher: () => (/* binding */ un),
/* harmony export */   parseStat: () => (/* binding */ cn),
/* harmony export */   parseXML: () => (/* binding */ ln),
/* harmony export */   prepareFileFromProps: () => (/* binding */ hn),
/* harmony export */   processResponsePayload: () => (/* binding */ pn),
/* harmony export */   translateDiskSpace: () => (/* binding */ fn)
/* harmony export */ });
/* provided dependency */ var process = __webpack_require__(/*! process/browser.js */ "../node_modules/process/browser.js");
/*! For license information please see index.js.LICENSE.txt */
var t={2:t=>{function e(t,e,o){t instanceof RegExp&&(t=n(t,o)),e instanceof RegExp&&(e=n(e,o));var i=r(t,e,o);return i&&{start:i[0],end:i[1],pre:o.slice(0,i[0]),body:o.slice(i[0]+t.length,i[1]),post:o.slice(i[1]+e.length)}}function n(t,e){var n=e.match(t);return n?n[0]:null}function r(t,e,n){var r,o,i,s,a,u=n.indexOf(t),c=n.indexOf(e,u+1),l=u;if(u>=0&&c>0){for(r=[],i=n.length;l>=0&&!a;)l==u?(r.push(l),u=n.indexOf(t,l+1)):1==r.length?a=[r.pop(),c]:((o=r.pop())<i&&(i=o,s=c),c=n.indexOf(e,l+1)),l=u<c&&u>=0?u:c;r.length&&(a=[i,s])}return a}t.exports=e,e.range=r},101:function(t,e,n){var r;t=n.nmd(t),function(o){var i=(t&&t.exports,"object"==typeof __webpack_require__.g&&__webpack_require__.g);i.global!==i&&i.window;var s=function(t){this.message=t};(s.prototype=new Error).name="InvalidCharacterError";var a=function(t){throw new s(t)},u="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",c=/[\t\n\f\r ]/g,l={encode:function(t){t=String(t),/[^\0-\xFF]/.test(t)&&a("The string to be encoded contains characters outside of the Latin1 range.");for(var e,n,r,o,i=t.length%3,s="",c=-1,l=t.length-i;++c<l;)e=t.charCodeAt(c)<<16,n=t.charCodeAt(++c)<<8,r=t.charCodeAt(++c),s+=u.charAt((o=e+n+r)>>18&63)+u.charAt(o>>12&63)+u.charAt(o>>6&63)+u.charAt(63&o);return 2==i?(e=t.charCodeAt(c)<<8,n=t.charCodeAt(++c),s+=u.charAt((o=e+n)>>10)+u.charAt(o>>4&63)+u.charAt(o<<2&63)+"="):1==i&&(o=t.charCodeAt(c),s+=u.charAt(o>>2)+u.charAt(o<<4&63)+"=="),s},decode:function(t){var e=(t=String(t).replace(c,"")).length;e%4==0&&(e=(t=t.replace(/==?$/,"")).length),(e%4==1||/[^+a-zA-Z0-9/]/.test(t))&&a("Invalid character: the string to be decoded is not correctly encoded.");for(var n,r,o=0,i="",s=-1;++s<e;)r=u.indexOf(t.charAt(s)),n=o%4?64*n+r:r,o++%4&&(i+=String.fromCharCode(255&n>>(-2*o&6)));return i},version:"1.0.0"};void 0===(r=function(){return l}.call(e,n,e,t))||(t.exports=r)}()},172:(t,e)=>{e.d=function(t){if(!t)return 0;for(var e=(t=t.toString()).length,n=t.length;n--;){var r=t.charCodeAt(n);56320<=r&&r<=57343&&n--,127<r&&r<=2047?e++:2047<r&&r<=65535&&(e+=2)}return e}},526:t=>{var e={utf8:{stringToBytes:function(t){return e.bin.stringToBytes(unescape(encodeURIComponent(t)))},bytesToString:function(t){return decodeURIComponent(escape(e.bin.bytesToString(t)))}},bin:{stringToBytes:function(t){for(var e=[],n=0;n<t.length;n++)e.push(255&t.charCodeAt(n));return e},bytesToString:function(t){for(var e=[],n=0;n<t.length;n++)e.push(String.fromCharCode(t[n]));return e.join("")}}};t.exports=e},298:t=>{var e,n;e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",n={rotl:function(t,e){return t<<e|t>>>32-e},rotr:function(t,e){return t<<32-e|t>>>e},endian:function(t){if(t.constructor==Number)return 16711935&n.rotl(t,8)|4278255360&n.rotl(t,24);for(var e=0;e<t.length;e++)t[e]=n.endian(t[e]);return t},randomBytes:function(t){for(var e=[];t>0;t--)e.push(Math.floor(256*Math.random()));return e},bytesToWords:function(t){for(var e=[],n=0,r=0;n<t.length;n++,r+=8)e[r>>>5]|=t[n]<<24-r%32;return e},wordsToBytes:function(t){for(var e=[],n=0;n<32*t.length;n+=8)e.push(t[n>>>5]>>>24-n%32&255);return e},bytesToHex:function(t){for(var e=[],n=0;n<t.length;n++)e.push((t[n]>>>4).toString(16)),e.push((15&t[n]).toString(16));return e.join("")},hexToBytes:function(t){for(var e=[],n=0;n<t.length;n+=2)e.push(parseInt(t.substr(n,2),16));return e},bytesToBase64:function(t){for(var n=[],r=0;r<t.length;r+=3)for(var o=t[r]<<16|t[r+1]<<8|t[r+2],i=0;i<4;i++)8*r+6*i<=8*t.length?n.push(e.charAt(o>>>6*(3-i)&63)):n.push("=");return n.join("")},base64ToBytes:function(t){t=t.replace(/[^A-Z0-9+\/]/gi,"");for(var n=[],r=0,o=0;r<t.length;o=++r%4)0!=o&&n.push((e.indexOf(t.charAt(r-1))&Math.pow(2,-2*o+8)-1)<<2*o|e.indexOf(t.charAt(r))>>>6-2*o);return n}},t.exports=n},635:(t,e,n)=>{const r=n(31),o=n(338),i=n(221);t.exports={XMLParser:o,XMLValidator:r,XMLBuilder:i}},118:t=>{t.exports=function(t){return"function"==typeof t?t:Array.isArray(t)?e=>{for(const n of t){if("string"==typeof n&&e===n)return!0;if(n instanceof RegExp&&n.test(e))return!0}}:()=>!1}},705:(t,e)=>{const n=":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD",r="["+n+"]["+n+"\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*",o=new RegExp("^"+r+"$");e.isExist=function(t){return void 0!==t},e.isEmptyObject=function(t){return 0===Object.keys(t).length},e.merge=function(t,e,n){if(e){const r=Object.keys(e),o=r.length;for(let i=0;i<o;i++)t[r[i]]="strict"===n?[e[r[i]]]:e[r[i]]}},e.getValue=function(t){return e.isExist(t)?t:""},e.isName=function(t){return!(null==o.exec(t))},e.getAllMatches=function(t,e){const n=[];let r=e.exec(t);for(;r;){const o=[];o.startIndex=e.lastIndex-r[0].length;const i=r.length;for(let t=0;t<i;t++)o.push(r[t]);n.push(o),r=e.exec(t)}return n},e.nameRegexp=r},31:(t,e,n)=>{const r=n(705),o={allowBooleanAttributes:!1,unpairedTags:[]};function i(t){return" "===t||"\t"===t||"\n"===t||"\r"===t}function s(t,e){const n=e;for(;e<t.length;e++)if("?"!=t[e]&&" "!=t[e]);else{const r=t.substr(n,e-n);if(e>5&&"xml"===r)return d("InvalidXml","XML declaration allowed only at the start of the document.",m(t,e));if("?"==t[e]&&">"==t[e+1]){e++;break}}return e}function a(t,e){if(t.length>e+5&&"-"===t[e+1]&&"-"===t[e+2]){for(e+=3;e<t.length;e++)if("-"===t[e]&&"-"===t[e+1]&&">"===t[e+2]){e+=2;break}}else if(t.length>e+8&&"D"===t[e+1]&&"O"===t[e+2]&&"C"===t[e+3]&&"T"===t[e+4]&&"Y"===t[e+5]&&"P"===t[e+6]&&"E"===t[e+7]){let n=1;for(e+=8;e<t.length;e++)if("<"===t[e])n++;else if(">"===t[e]&&(n--,0===n))break}else if(t.length>e+9&&"["===t[e+1]&&"C"===t[e+2]&&"D"===t[e+3]&&"A"===t[e+4]&&"T"===t[e+5]&&"A"===t[e+6]&&"["===t[e+7])for(e+=8;e<t.length;e++)if("]"===t[e]&&"]"===t[e+1]&&">"===t[e+2]){e+=2;break}return e}e.validate=function(t,e){e=Object.assign({},o,e);const n=[];let u=!1,c=!1;"\ufeff"===t[0]&&(t=t.substr(1));for(let o=0;o<t.length;o++)if("<"===t[o]&&"?"===t[o+1]){if(o+=2,o=s(t,o),o.err)return o}else{if("<"!==t[o]){if(i(t[o]))continue;return d("InvalidChar","char '"+t[o]+"' is not expected.",m(t,o))}{let g=o;if(o++,"!"===t[o]){o=a(t,o);continue}{let y=!1;"/"===t[o]&&(y=!0,o++);let v="";for(;o<t.length&&">"!==t[o]&&" "!==t[o]&&"\t"!==t[o]&&"\n"!==t[o]&&"\r"!==t[o];o++)v+=t[o];if(v=v.trim(),"/"===v[v.length-1]&&(v=v.substring(0,v.length-1),o--),h=v,!r.isName(h)){let e;return e=0===v.trim().length?"Invalid space after '<'.":"Tag '"+v+"' is an invalid name.",d("InvalidTag",e,m(t,o))}const b=l(t,o);if(!1===b)return d("InvalidAttr","Attributes for '"+v+"' have open quote.",m(t,o));let w=b.value;if(o=b.index,"/"===w[w.length-1]){const n=o-w.length;w=w.substring(0,w.length-1);const r=p(w,e);if(!0!==r)return d(r.err.code,r.err.msg,m(t,n+r.err.line));u=!0}else if(y){if(!b.tagClosed)return d("InvalidTag","Closing tag '"+v+"' doesn't have proper closing.",m(t,o));if(w.trim().length>0)return d("InvalidTag","Closing tag '"+v+"' can't have attributes or invalid starting.",m(t,g));if(0===n.length)return d("InvalidTag","Closing tag '"+v+"' has not been opened.",m(t,g));{const e=n.pop();if(v!==e.tagName){let n=m(t,e.tagStartPos);return d("InvalidTag","Expected closing tag '"+e.tagName+"' (opened in line "+n.line+", col "+n.col+") instead of closing tag '"+v+"'.",m(t,g))}0==n.length&&(c=!0)}}else{const r=p(w,e);if(!0!==r)return d(r.err.code,r.err.msg,m(t,o-w.length+r.err.line));if(!0===c)return d("InvalidXml","Multiple possible root nodes found.",m(t,o));-1!==e.unpairedTags.indexOf(v)||n.push({tagName:v,tagStartPos:g}),u=!0}for(o++;o<t.length;o++)if("<"===t[o]){if("!"===t[o+1]){o++,o=a(t,o);continue}if("?"!==t[o+1])break;if(o=s(t,++o),o.err)return o}else if("&"===t[o]){const e=f(t,o);if(-1==e)return d("InvalidChar","char '&' is not expected.",m(t,o));o=e}else if(!0===c&&!i(t[o]))return d("InvalidXml","Extra text at the end",m(t,o));"<"===t[o]&&o--}}}var h;return u?1==n.length?d("InvalidTag","Unclosed tag '"+n[0].tagName+"'.",m(t,n[0].tagStartPos)):!(n.length>0)||d("InvalidXml","Invalid '"+JSON.stringify(n.map((t=>t.tagName)),null,4).replace(/\r?\n/g,"")+"' found.",{line:1,col:1}):d("InvalidXml","Start tag expected.",1)};const u='"',c="'";function l(t,e){let n="",r="",o=!1;for(;e<t.length;e++){if(t[e]===u||t[e]===c)""===r?r=t[e]:r!==t[e]||(r="");else if(">"===t[e]&&""===r){o=!0;break}n+=t[e]}return""===r&&{value:n,index:e,tagClosed:o}}const h=new RegExp("(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['\"])(([\\s\\S])*?)\\5)?","g");function p(t,e){const n=r.getAllMatches(t,h),o={};for(let t=0;t<n.length;t++){if(0===n[t][1].length)return d("InvalidAttr","Attribute '"+n[t][2]+"' has no space in starting.",y(n[t]));if(void 0!==n[t][3]&&void 0===n[t][4])return d("InvalidAttr","Attribute '"+n[t][2]+"' is without value.",y(n[t]));if(void 0===n[t][3]&&!e.allowBooleanAttributes)return d("InvalidAttr","boolean attribute '"+n[t][2]+"' is not allowed.",y(n[t]));const r=n[t][2];if(!g(r))return d("InvalidAttr","Attribute '"+r+"' is an invalid name.",y(n[t]));if(o.hasOwnProperty(r))return d("InvalidAttr","Attribute '"+r+"' is repeated.",y(n[t]));o[r]=1}return!0}function f(t,e){if(";"===t[++e])return-1;if("#"===t[e])return function(t,e){let n=/\d/;for("x"===t[e]&&(e++,n=/[\da-fA-F]/);e<t.length;e++){if(";"===t[e])return e;if(!t[e].match(n))break}return-1}(t,++e);let n=0;for(;e<t.length;e++,n++)if(!(t[e].match(/\w/)&&n<20)){if(";"===t[e])break;return-1}return e}function d(t,e,n){return{err:{code:t,msg:e,line:n.line||n,col:n.col}}}function g(t){return r.isName(t)}function m(t,e){const n=t.substring(0,e).split(/\r?\n/);return{line:n.length,col:n[n.length-1].length+1}}function y(t){return t.startIndex+t[1].length}},221:(t,e,n)=>{const r=n(87),o=n(118),i={attributeNamePrefix:"@_",attributesGroupName:!1,textNodeName:"#text",ignoreAttributes:!0,cdataPropName:!1,format:!1,indentBy:"  ",suppressEmptyNode:!1,suppressUnpairedNode:!0,suppressBooleanAttributes:!0,tagValueProcessor:function(t,e){return e},attributeValueProcessor:function(t,e){return e},preserveOrder:!1,commentPropName:!1,unpairedTags:[],entities:[{regex:new RegExp("&","g"),val:"&amp;"},{regex:new RegExp(">","g"),val:"&gt;"},{regex:new RegExp("<","g"),val:"&lt;"},{regex:new RegExp("'","g"),val:"&apos;"},{regex:new RegExp('"',"g"),val:"&quot;"}],processEntities:!0,stopNodes:[],oneListGroup:!1};function s(t){this.options=Object.assign({},i,t),!0===this.options.ignoreAttributes||this.options.attributesGroupName?this.isAttribute=function(){return!1}:(this.ignoreAttributesFn=o(this.options.ignoreAttributes),this.attrPrefixLen=this.options.attributeNamePrefix.length,this.isAttribute=c),this.processTextOrObjNode=a,this.options.format?(this.indentate=u,this.tagEndChar=">\n",this.newLine="\n"):(this.indentate=function(){return""},this.tagEndChar=">",this.newLine="")}function a(t,e,n,r){const o=this.j2x(t,n+1,r.concat(e));return void 0!==t[this.options.textNodeName]&&1===Object.keys(t).length?this.buildTextValNode(t[this.options.textNodeName],e,o.attrStr,n):this.buildObjectNode(o.val,e,o.attrStr,n)}function u(t){return this.options.indentBy.repeat(t)}function c(t){return!(!t.startsWith(this.options.attributeNamePrefix)||t===this.options.textNodeName)&&t.substr(this.attrPrefixLen)}s.prototype.build=function(t){return this.options.preserveOrder?r(t,this.options):(Array.isArray(t)&&this.options.arrayNodeName&&this.options.arrayNodeName.length>1&&(t={[this.options.arrayNodeName]:t}),this.j2x(t,0,[]).val)},s.prototype.j2x=function(t,e,n){let r="",o="";const i=n.join(".");for(let s in t)if(Object.prototype.hasOwnProperty.call(t,s))if(void 0===t[s])this.isAttribute(s)&&(o+="");else if(null===t[s])this.isAttribute(s)?o+="":"?"===s[0]?o+=this.indentate(e)+"<"+s+"?"+this.tagEndChar:o+=this.indentate(e)+"<"+s+"/"+this.tagEndChar;else if(t[s]instanceof Date)o+=this.buildTextValNode(t[s],s,"",e);else if("object"!=typeof t[s]){const n=this.isAttribute(s);if(n&&!this.ignoreAttributesFn(n,i))r+=this.buildAttrPairStr(n,""+t[s]);else if(!n)if(s===this.options.textNodeName){let e=this.options.tagValueProcessor(s,""+t[s]);o+=this.replaceEntitiesValue(e)}else o+=this.buildTextValNode(t[s],s,"",e)}else if(Array.isArray(t[s])){const r=t[s].length;let i="",a="";for(let u=0;u<r;u++){const r=t[s][u];if(void 0===r);else if(null===r)"?"===s[0]?o+=this.indentate(e)+"<"+s+"?"+this.tagEndChar:o+=this.indentate(e)+"<"+s+"/"+this.tagEndChar;else if("object"==typeof r)if(this.options.oneListGroup){const t=this.j2x(r,e+1,n.concat(s));i+=t.val,this.options.attributesGroupName&&r.hasOwnProperty(this.options.attributesGroupName)&&(a+=t.attrStr)}else i+=this.processTextOrObjNode(r,s,e,n);else if(this.options.oneListGroup){let t=this.options.tagValueProcessor(s,r);t=this.replaceEntitiesValue(t),i+=t}else i+=this.buildTextValNode(r,s,"",e)}this.options.oneListGroup&&(i=this.buildObjectNode(i,s,a,e)),o+=i}else if(this.options.attributesGroupName&&s===this.options.attributesGroupName){const e=Object.keys(t[s]),n=e.length;for(let o=0;o<n;o++)r+=this.buildAttrPairStr(e[o],""+t[s][e[o]])}else o+=this.processTextOrObjNode(t[s],s,e,n);return{attrStr:r,val:o}},s.prototype.buildAttrPairStr=function(t,e){return e=this.options.attributeValueProcessor(t,""+e),e=this.replaceEntitiesValue(e),this.options.suppressBooleanAttributes&&"true"===e?" "+t:" "+t+'="'+e+'"'},s.prototype.buildObjectNode=function(t,e,n,r){if(""===t)return"?"===e[0]?this.indentate(r)+"<"+e+n+"?"+this.tagEndChar:this.indentate(r)+"<"+e+n+this.closeTag(e)+this.tagEndChar;{let o="</"+e+this.tagEndChar,i="";return"?"===e[0]&&(i="?",o=""),!n&&""!==n||-1!==t.indexOf("<")?!1!==this.options.commentPropName&&e===this.options.commentPropName&&0===i.length?this.indentate(r)+`\x3c!--${t}--\x3e`+this.newLine:this.indentate(r)+"<"+e+n+i+this.tagEndChar+t+this.indentate(r)+o:this.indentate(r)+"<"+e+n+i+">"+t+o}},s.prototype.closeTag=function(t){let e="";return-1!==this.options.unpairedTags.indexOf(t)?this.options.suppressUnpairedNode||(e="/"):e=this.options.suppressEmptyNode?"/":`></${t}`,e},s.prototype.buildTextValNode=function(t,e,n,r){if(!1!==this.options.cdataPropName&&e===this.options.cdataPropName)return this.indentate(r)+`<![CDATA[${t}]]>`+this.newLine;if(!1!==this.options.commentPropName&&e===this.options.commentPropName)return this.indentate(r)+`\x3c!--${t}--\x3e`+this.newLine;if("?"===e[0])return this.indentate(r)+"<"+e+n+"?"+this.tagEndChar;{let o=this.options.tagValueProcessor(e,t);return o=this.replaceEntitiesValue(o),""===o?this.indentate(r)+"<"+e+n+this.closeTag(e)+this.tagEndChar:this.indentate(r)+"<"+e+n+">"+o+"</"+e+this.tagEndChar}},s.prototype.replaceEntitiesValue=function(t){if(t&&t.length>0&&this.options.processEntities)for(let e=0;e<this.options.entities.length;e++){const n=this.options.entities[e];t=t.replace(n.regex,n.val)}return t},t.exports=s},87:t=>{function e(t,s,a,u){let c="",l=!1;for(let h=0;h<t.length;h++){const p=t[h],f=n(p);if(void 0===f)continue;let d="";if(d=0===a.length?f:`${a}.${f}`,f===s.textNodeName){let t=p[f];o(d,s)||(t=s.tagValueProcessor(f,t),t=i(t,s)),l&&(c+=u),c+=t,l=!1;continue}if(f===s.cdataPropName){l&&(c+=u),c+=`<![CDATA[${p[f][0][s.textNodeName]}]]>`,l=!1;continue}if(f===s.commentPropName){c+=u+`\x3c!--${p[f][0][s.textNodeName]}--\x3e`,l=!0;continue}if("?"===f[0]){const t=r(p[":@"],s),e="?xml"===f?"":u;let n=p[f][0][s.textNodeName];n=0!==n.length?" "+n:"",c+=e+`<${f}${n}${t}?>`,l=!0;continue}let g=u;""!==g&&(g+=s.indentBy);const m=u+`<${f}${r(p[":@"],s)}`,y=e(p[f],s,d,g);-1!==s.unpairedTags.indexOf(f)?s.suppressUnpairedNode?c+=m+">":c+=m+"/>":y&&0!==y.length||!s.suppressEmptyNode?y&&y.endsWith(">")?c+=m+`>${y}${u}</${f}>`:(c+=m+">",y&&""!==u&&(y.includes("/>")||y.includes("</"))?c+=u+s.indentBy+y+u:c+=y,c+=`</${f}>`):c+=m+"/>",l=!0}return c}function n(t){const e=Object.keys(t);for(let n=0;n<e.length;n++){const r=e[n];if(t.hasOwnProperty(r)&&":@"!==r)return r}}function r(t,e){let n="";if(t&&!e.ignoreAttributes)for(let r in t){if(!t.hasOwnProperty(r))continue;let o=e.attributeValueProcessor(r,t[r]);o=i(o,e),!0===o&&e.suppressBooleanAttributes?n+=` ${r.substr(e.attributeNamePrefix.length)}`:n+=` ${r.substr(e.attributeNamePrefix.length)}="${o}"`}return n}function o(t,e){let n=(t=t.substr(0,t.length-e.textNodeName.length-1)).substr(t.lastIndexOf(".")+1);for(let r in e.stopNodes)if(e.stopNodes[r]===t||e.stopNodes[r]==="*."+n)return!0;return!1}function i(t,e){if(t&&t.length>0&&e.processEntities)for(let n=0;n<e.entities.length;n++){const r=e.entities[n];t=t.replace(r.regex,r.val)}return t}t.exports=function(t,n){let r="";return n.format&&n.indentBy.length>0&&(r="\n"),e(t,n,"",r)}},193:(t,e,n)=>{const r=n(705);function o(t,e){let n="";for(;e<t.length&&"'"!==t[e]&&'"'!==t[e];e++)n+=t[e];if(n=n.trim(),-1!==n.indexOf(" "))throw new Error("External entites are not supported");const r=t[e++];let o="";for(;e<t.length&&t[e]!==r;e++)o+=t[e];return[n,o,e]}function i(t,e){return"!"===t[e+1]&&"-"===t[e+2]&&"-"===t[e+3]}function s(t,e){return"!"===t[e+1]&&"E"===t[e+2]&&"N"===t[e+3]&&"T"===t[e+4]&&"I"===t[e+5]&&"T"===t[e+6]&&"Y"===t[e+7]}function a(t,e){return"!"===t[e+1]&&"E"===t[e+2]&&"L"===t[e+3]&&"E"===t[e+4]&&"M"===t[e+5]&&"E"===t[e+6]&&"N"===t[e+7]&&"T"===t[e+8]}function u(t,e){return"!"===t[e+1]&&"A"===t[e+2]&&"T"===t[e+3]&&"T"===t[e+4]&&"L"===t[e+5]&&"I"===t[e+6]&&"S"===t[e+7]&&"T"===t[e+8]}function c(t,e){return"!"===t[e+1]&&"N"===t[e+2]&&"O"===t[e+3]&&"T"===t[e+4]&&"A"===t[e+5]&&"T"===t[e+6]&&"I"===t[e+7]&&"O"===t[e+8]&&"N"===t[e+9]}function l(t){if(r.isName(t))return t;throw new Error(`Invalid entity name ${t}`)}t.exports=function(t,e){const n={};if("O"!==t[e+3]||"C"!==t[e+4]||"T"!==t[e+5]||"Y"!==t[e+6]||"P"!==t[e+7]||"E"!==t[e+8])throw new Error("Invalid Tag instead of DOCTYPE");{e+=9;let r=1,h=!1,p=!1,f="";for(;e<t.length;e++)if("<"!==t[e]||p)if(">"===t[e]){if(p?"-"===t[e-1]&&"-"===t[e-2]&&(p=!1,r--):r--,0===r)break}else"["===t[e]?h=!0:f+=t[e];else{if(h&&s(t,e)){let r,i;e+=7,[r,i,e]=o(t,e+1),-1===i.indexOf("&")&&(n[l(r)]={regx:RegExp(`&${r};`,"g"),val:i})}else if(h&&a(t,e))e+=8;else if(h&&u(t,e))e+=8;else if(h&&c(t,e))e+=9;else{if(!i)throw new Error("Invalid DOCTYPE");p=!0}r++,f=""}if(0!==r)throw new Error("Unclosed DOCTYPE")}return{entities:n,i:e}}},63:(t,e)=>{const n={preserveOrder:!1,attributeNamePrefix:"@_",attributesGroupName:!1,textNodeName:"#text",ignoreAttributes:!0,removeNSPrefix:!1,allowBooleanAttributes:!1,parseTagValue:!0,parseAttributeValue:!1,trimValues:!0,cdataPropName:!1,numberParseOptions:{hex:!0,leadingZeros:!0,eNotation:!0},tagValueProcessor:function(t,e){return e},attributeValueProcessor:function(t,e){return e},stopNodes:[],alwaysCreateTextNode:!1,isArray:()=>!1,commentPropName:!1,unpairedTags:[],processEntities:!0,htmlEntities:!1,ignoreDeclaration:!1,ignorePiTags:!1,transformTagName:!1,transformAttributeName:!1,updateTag:function(t,e,n){return t}};e.buildOptions=function(t){return Object.assign({},n,t)},e.defaultOptions=n},299:(t,e,n)=>{const r=n(705),o=n(365),i=n(193),s=n(494),a=n(118);function u(t){const e=Object.keys(t);for(let n=0;n<e.length;n++){const r=e[n];this.lastEntities[r]={regex:new RegExp("&"+r+";","g"),val:t[r]}}}function c(t,e,n,r,o,i,s){if(void 0!==t&&(this.options.trimValues&&!r&&(t=t.trim()),t.length>0)){s||(t=this.replaceEntitiesValue(t));const r=this.options.tagValueProcessor(e,t,n,o,i);return null==r?t:typeof r!=typeof t||r!==t?r:this.options.trimValues||t.trim()===t?x(t,this.options.parseTagValue,this.options.numberParseOptions):t}}function l(t){if(this.options.removeNSPrefix){const e=t.split(":"),n="/"===t.charAt(0)?"/":"";if("xmlns"===e[0])return"";2===e.length&&(t=n+e[1])}return t}const h=new RegExp("([^\\s=]+)\\s*(=\\s*(['\"])([\\s\\S]*?)\\3)?","gm");function p(t,e,n){if(!0!==this.options.ignoreAttributes&&"string"==typeof t){const n=r.getAllMatches(t,h),o=n.length,i={};for(let t=0;t<o;t++){const r=this.resolveNameSpace(n[t][1]);if(this.ignoreAttributesFn(r,e))continue;let o=n[t][4],s=this.options.attributeNamePrefix+r;if(r.length)if(this.options.transformAttributeName&&(s=this.options.transformAttributeName(s)),"__proto__"===s&&(s="#__proto__"),void 0!==o){this.options.trimValues&&(o=o.trim()),o=this.replaceEntitiesValue(o);const t=this.options.attributeValueProcessor(r,o,e);i[s]=null==t?o:typeof t!=typeof o||t!==o?t:x(o,this.options.parseAttributeValue,this.options.numberParseOptions)}else this.options.allowBooleanAttributes&&(i[s]=!0)}if(!Object.keys(i).length)return;if(this.options.attributesGroupName){const t={};return t[this.options.attributesGroupName]=i,t}return i}}const f=function(t){t=t.replace(/\r\n?/g,"\n");const e=new o("!xml");let n=e,r="",s="";for(let a=0;a<t.length;a++)if("<"===t[a])if("/"===t[a+1]){const e=v(t,">",a,"Closing Tag is not closed.");let o=t.substring(a+2,e).trim();if(this.options.removeNSPrefix){const t=o.indexOf(":");-1!==t&&(o=o.substr(t+1))}this.options.transformTagName&&(o=this.options.transformTagName(o)),n&&(r=this.saveTextToParentTag(r,n,s));const i=s.substring(s.lastIndexOf(".")+1);if(o&&-1!==this.options.unpairedTags.indexOf(o))throw new Error(`Unpaired tag can not be used as closing tag: </${o}>`);let u=0;i&&-1!==this.options.unpairedTags.indexOf(i)?(u=s.lastIndexOf(".",s.lastIndexOf(".")-1),this.tagsNodeStack.pop()):u=s.lastIndexOf("."),s=s.substring(0,u),n=this.tagsNodeStack.pop(),r="",a=e}else if("?"===t[a+1]){let e=b(t,a,!1,"?>");if(!e)throw new Error("Pi Tag is not closed.");if(r=this.saveTextToParentTag(r,n,s),this.options.ignoreDeclaration&&"?xml"===e.tagName||this.options.ignorePiTags);else{const t=new o(e.tagName);t.add(this.options.textNodeName,""),e.tagName!==e.tagExp&&e.attrExpPresent&&(t[":@"]=this.buildAttributesMap(e.tagExp,s,e.tagName)),this.addChild(n,t,s)}a=e.closeIndex+1}else if("!--"===t.substr(a+1,3)){const e=v(t,"--\x3e",a+4,"Comment is not closed.");if(this.options.commentPropName){const o=t.substring(a+4,e-2);r=this.saveTextToParentTag(r,n,s),n.add(this.options.commentPropName,[{[this.options.textNodeName]:o}])}a=e}else if("!D"===t.substr(a+1,2)){const e=i(t,a);this.docTypeEntities=e.entities,a=e.i}else if("!["===t.substr(a+1,2)){const e=v(t,"]]>",a,"CDATA is not closed.")-2,o=t.substring(a+9,e);r=this.saveTextToParentTag(r,n,s);let i=this.parseTextData(o,n.tagname,s,!0,!1,!0,!0);null==i&&(i=""),this.options.cdataPropName?n.add(this.options.cdataPropName,[{[this.options.textNodeName]:o}]):n.add(this.options.textNodeName,i),a=e+2}else{let i=b(t,a,this.options.removeNSPrefix),u=i.tagName;const c=i.rawTagName;let l=i.tagExp,h=i.attrExpPresent,p=i.closeIndex;this.options.transformTagName&&(u=this.options.transformTagName(u)),n&&r&&"!xml"!==n.tagname&&(r=this.saveTextToParentTag(r,n,s,!1));const f=n;if(f&&-1!==this.options.unpairedTags.indexOf(f.tagname)&&(n=this.tagsNodeStack.pop(),s=s.substring(0,s.lastIndexOf("."))),u!==e.tagname&&(s+=s?"."+u:u),this.isItStopNode(this.options.stopNodes,s,u)){let e="";if(l.length>0&&l.lastIndexOf("/")===l.length-1)"/"===u[u.length-1]?(u=u.substr(0,u.length-1),s=s.substr(0,s.length-1),l=u):l=l.substr(0,l.length-1),a=i.closeIndex;else if(-1!==this.options.unpairedTags.indexOf(u))a=i.closeIndex;else{const n=this.readStopNodeData(t,c,p+1);if(!n)throw new Error(`Unexpected end of ${c}`);a=n.i,e=n.tagContent}const r=new o(u);u!==l&&h&&(r[":@"]=this.buildAttributesMap(l,s,u)),e&&(e=this.parseTextData(e,u,s,!0,h,!0,!0)),s=s.substr(0,s.lastIndexOf(".")),r.add(this.options.textNodeName,e),this.addChild(n,r,s)}else{if(l.length>0&&l.lastIndexOf("/")===l.length-1){"/"===u[u.length-1]?(u=u.substr(0,u.length-1),s=s.substr(0,s.length-1),l=u):l=l.substr(0,l.length-1),this.options.transformTagName&&(u=this.options.transformTagName(u));const t=new o(u);u!==l&&h&&(t[":@"]=this.buildAttributesMap(l,s,u)),this.addChild(n,t,s),s=s.substr(0,s.lastIndexOf("."))}else{const t=new o(u);this.tagsNodeStack.push(n),u!==l&&h&&(t[":@"]=this.buildAttributesMap(l,s,u)),this.addChild(n,t,s),n=t}r="",a=p}}else r+=t[a];return e.child};function d(t,e,n){const r=this.options.updateTag(e.tagname,n,e[":@"]);!1===r||("string"==typeof r?(e.tagname=r,t.addChild(e)):t.addChild(e))}const g=function(t){if(this.options.processEntities){for(let e in this.docTypeEntities){const n=this.docTypeEntities[e];t=t.replace(n.regx,n.val)}for(let e in this.lastEntities){const n=this.lastEntities[e];t=t.replace(n.regex,n.val)}if(this.options.htmlEntities)for(let e in this.htmlEntities){const n=this.htmlEntities[e];t=t.replace(n.regex,n.val)}t=t.replace(this.ampEntity.regex,this.ampEntity.val)}return t};function m(t,e,n,r){return t&&(void 0===r&&(r=0===Object.keys(e.child).length),void 0!==(t=this.parseTextData(t,e.tagname,n,!1,!!e[":@"]&&0!==Object.keys(e[":@"]).length,r))&&""!==t&&e.add(this.options.textNodeName,t),t=""),t}function y(t,e,n){const r="*."+n;for(const n in t){const o=t[n];if(r===o||e===o)return!0}return!1}function v(t,e,n,r){const o=t.indexOf(e,n);if(-1===o)throw new Error(r);return o+e.length-1}function b(t,e,n){const r=function(t,e){let n,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:">",o="";for(let i=e;i<t.length;i++){let e=t[i];if(n)e===n&&(n="");else if('"'===e||"'"===e)n=e;else if(e===r[0]){if(!r[1])return{data:o,index:i};if(t[i+1]===r[1])return{data:o,index:i}}else"\t"===e&&(e=" ");o+=e}}(t,e+1,arguments.length>3&&void 0!==arguments[3]?arguments[3]:">");if(!r)return;let o=r.data;const i=r.index,s=o.search(/\s/);let a=o,u=!0;-1!==s&&(a=o.substring(0,s),o=o.substring(s+1).trimStart());const c=a;if(n){const t=a.indexOf(":");-1!==t&&(a=a.substr(t+1),u=a!==r.data.substr(t+1))}return{tagName:a,tagExp:o,closeIndex:i,attrExpPresent:u,rawTagName:c}}function w(t,e,n){const r=n;let o=1;for(;n<t.length;n++)if("<"===t[n])if("/"===t[n+1]){const i=v(t,">",n,`${e} is not closed`);if(t.substring(n+2,i).trim()===e&&(o--,0===o))return{tagContent:t.substring(r,n),i};n=i}else if("?"===t[n+1])n=v(t,"?>",n+1,"StopNode is not closed.");else if("!--"===t.substr(n+1,3))n=v(t,"--\x3e",n+3,"StopNode is not closed.");else if("!["===t.substr(n+1,2))n=v(t,"]]>",n,"StopNode is not closed.")-2;else{const r=b(t,n,">");r&&((r&&r.tagName)===e&&"/"!==r.tagExp[r.tagExp.length-1]&&o++,n=r.closeIndex)}}function x(t,e,n){if(e&&"string"==typeof t){const e=t.trim();return"true"===e||"false"!==e&&s(t,n)}return r.isExist(t)?t:""}t.exports=class{constructor(t){this.options=t,this.currentNode=null,this.tagsNodeStack=[],this.docTypeEntities={},this.lastEntities={apos:{regex:/&(apos|#39|#x27);/g,val:"'"},gt:{regex:/&(gt|#62|#x3E);/g,val:">"},lt:{regex:/&(lt|#60|#x3C);/g,val:"<"},quot:{regex:/&(quot|#34|#x22);/g,val:'"'}},this.ampEntity={regex:/&(amp|#38|#x26);/g,val:"&"},this.htmlEntities={space:{regex:/&(nbsp|#160);/g,val:" "},cent:{regex:/&(cent|#162);/g,val:"¢"},pound:{regex:/&(pound|#163);/g,val:"£"},yen:{regex:/&(yen|#165);/g,val:"¥"},euro:{regex:/&(euro|#8364);/g,val:"€"},copyright:{regex:/&(copy|#169);/g,val:"©"},reg:{regex:/&(reg|#174);/g,val:"®"},inr:{regex:/&(inr|#8377);/g,val:"₹"},num_dec:{regex:/&#([0-9]{1,7});/g,val:(t,e)=>String.fromCharCode(Number.parseInt(e,10))},num_hex:{regex:/&#x([0-9a-fA-F]{1,6});/g,val:(t,e)=>String.fromCharCode(Number.parseInt(e,16))}},this.addExternalEntities=u,this.parseXml=f,this.parseTextData=c,this.resolveNameSpace=l,this.buildAttributesMap=p,this.isItStopNode=y,this.replaceEntitiesValue=g,this.readStopNodeData=w,this.saveTextToParentTag=m,this.addChild=d,this.ignoreAttributesFn=a(this.options.ignoreAttributes)}}},338:(t,e,n)=>{const{buildOptions:r}=n(63),o=n(299),{prettify:i}=n(728),s=n(31);t.exports=class{constructor(t){this.externalEntities={},this.options=r(t)}parse(t,e){if("string"==typeof t);else{if(!t.toString)throw new Error("XML data is accepted in String or Bytes[] form.");t=t.toString()}if(e){!0===e&&(e={});const n=s.validate(t,e);if(!0!==n)throw Error(`${n.err.msg}:${n.err.line}:${n.err.col}`)}const n=new o(this.options);n.addExternalEntities(this.externalEntities);const r=n.parseXml(t);return this.options.preserveOrder||void 0===r?r:i(r,this.options)}addEntity(t,e){if(-1!==e.indexOf("&"))throw new Error("Entity value can't have '&'");if(-1!==t.indexOf("&")||-1!==t.indexOf(";"))throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");if("&"===e)throw new Error("An entity with value '&' is not permitted");this.externalEntities[t]=e}}},728:(t,e)=>{function n(t,e,s){let a;const u={};for(let c=0;c<t.length;c++){const l=t[c],h=r(l);let p="";if(p=void 0===s?h:s+"."+h,h===e.textNodeName)void 0===a?a=l[h]:a+=""+l[h];else{if(void 0===h)continue;if(l[h]){let t=n(l[h],e,p);const r=i(t,e);l[":@"]?o(t,l[":@"],p,e):1!==Object.keys(t).length||void 0===t[e.textNodeName]||e.alwaysCreateTextNode?0===Object.keys(t).length&&(e.alwaysCreateTextNode?t[e.textNodeName]="":t=""):t=t[e.textNodeName],void 0!==u[h]&&u.hasOwnProperty(h)?(Array.isArray(u[h])||(u[h]=[u[h]]),u[h].push(t)):e.isArray(h,p,r)?u[h]=[t]:u[h]=t}}}return"string"==typeof a?a.length>0&&(u[e.textNodeName]=a):void 0!==a&&(u[e.textNodeName]=a),u}function r(t){const e=Object.keys(t);for(let t=0;t<e.length;t++){const n=e[t];if(":@"!==n)return n}}function o(t,e,n,r){if(e){const o=Object.keys(e),i=o.length;for(let s=0;s<i;s++){const i=o[s];r.isArray(i,n+"."+i,!0,!0)?t[i]=[e[i]]:t[i]=e[i]}}}function i(t,e){const{textNodeName:n}=e,r=Object.keys(t).length;return 0===r||!(1!==r||!t[n]&&"boolean"!=typeof t[n]&&0!==t[n])}e.prettify=function(t,e){return n(t,e)}},365:t=>{t.exports=class{constructor(t){this.tagname=t,this.child=[],this[":@"]={}}add(t,e){"__proto__"===t&&(t="#__proto__"),this.child.push({[t]:e})}addChild(t){"__proto__"===t.tagname&&(t.tagname="#__proto__"),t[":@"]&&Object.keys(t[":@"]).length>0?this.child.push({[t.tagname]:t.child,":@":t[":@"]}):this.child.push({[t.tagname]:t.child})}}},135:t=>{function e(t){return!!t.constructor&&"function"==typeof t.constructor.isBuffer&&t.constructor.isBuffer(t)}t.exports=function(t){return null!=t&&(e(t)||function(t){return"function"==typeof t.readFloatLE&&"function"==typeof t.slice&&e(t.slice(0,0))}(t)||!!t._isBuffer)}},542:(t,e,n)=>{!function(){var e=n(298),r=n(526).utf8,o=n(135),i=n(526).bin,s=function(t,n){t.constructor==String?t=n&&"binary"===n.encoding?i.stringToBytes(t):r.stringToBytes(t):o(t)?t=Array.prototype.slice.call(t,0):Array.isArray(t)||t.constructor===Uint8Array||(t=t.toString());for(var a=e.bytesToWords(t),u=8*t.length,c=1732584193,l=-271733879,h=-1732584194,p=271733878,f=0;f<a.length;f++)a[f]=16711935&(a[f]<<8|a[f]>>>24)|4278255360&(a[f]<<24|a[f]>>>8);a[u>>>5]|=128<<u%32,a[14+(u+64>>>9<<4)]=u;var d=s._ff,g=s._gg,m=s._hh,y=s._ii;for(f=0;f<a.length;f+=16){var v=c,b=l,w=h,x=p;c=d(c,l,h,p,a[f+0],7,-680876936),p=d(p,c,l,h,a[f+1],12,-389564586),h=d(h,p,c,l,a[f+2],17,606105819),l=d(l,h,p,c,a[f+3],22,-1044525330),c=d(c,l,h,p,a[f+4],7,-176418897),p=d(p,c,l,h,a[f+5],12,1200080426),h=d(h,p,c,l,a[f+6],17,-1473231341),l=d(l,h,p,c,a[f+7],22,-45705983),c=d(c,l,h,p,a[f+8],7,1770035416),p=d(p,c,l,h,a[f+9],12,-1958414417),h=d(h,p,c,l,a[f+10],17,-42063),l=d(l,h,p,c,a[f+11],22,-1990404162),c=d(c,l,h,p,a[f+12],7,1804603682),p=d(p,c,l,h,a[f+13],12,-40341101),h=d(h,p,c,l,a[f+14],17,-1502002290),c=g(c,l=d(l,h,p,c,a[f+15],22,1236535329),h,p,a[f+1],5,-165796510),p=g(p,c,l,h,a[f+6],9,-1069501632),h=g(h,p,c,l,a[f+11],14,643717713),l=g(l,h,p,c,a[f+0],20,-373897302),c=g(c,l,h,p,a[f+5],5,-701558691),p=g(p,c,l,h,a[f+10],9,38016083),h=g(h,p,c,l,a[f+15],14,-660478335),l=g(l,h,p,c,a[f+4],20,-405537848),c=g(c,l,h,p,a[f+9],5,568446438),p=g(p,c,l,h,a[f+14],9,-1019803690),h=g(h,p,c,l,a[f+3],14,-187363961),l=g(l,h,p,c,a[f+8],20,1163531501),c=g(c,l,h,p,a[f+13],5,-1444681467),p=g(p,c,l,h,a[f+2],9,-51403784),h=g(h,p,c,l,a[f+7],14,1735328473),c=m(c,l=g(l,h,p,c,a[f+12],20,-1926607734),h,p,a[f+5],4,-378558),p=m(p,c,l,h,a[f+8],11,-2022574463),h=m(h,p,c,l,a[f+11],16,1839030562),l=m(l,h,p,c,a[f+14],23,-35309556),c=m(c,l,h,p,a[f+1],4,-1530992060),p=m(p,c,l,h,a[f+4],11,1272893353),h=m(h,p,c,l,a[f+7],16,-155497632),l=m(l,h,p,c,a[f+10],23,-1094730640),c=m(c,l,h,p,a[f+13],4,681279174),p=m(p,c,l,h,a[f+0],11,-358537222),h=m(h,p,c,l,a[f+3],16,-722521979),l=m(l,h,p,c,a[f+6],23,76029189),c=m(c,l,h,p,a[f+9],4,-640364487),p=m(p,c,l,h,a[f+12],11,-421815835),h=m(h,p,c,l,a[f+15],16,530742520),c=y(c,l=m(l,h,p,c,a[f+2],23,-995338651),h,p,a[f+0],6,-198630844),p=y(p,c,l,h,a[f+7],10,1126891415),h=y(h,p,c,l,a[f+14],15,-1416354905),l=y(l,h,p,c,a[f+5],21,-57434055),c=y(c,l,h,p,a[f+12],6,1700485571),p=y(p,c,l,h,a[f+3],10,-1894986606),h=y(h,p,c,l,a[f+10],15,-1051523),l=y(l,h,p,c,a[f+1],21,-2054922799),c=y(c,l,h,p,a[f+8],6,1873313359),p=y(p,c,l,h,a[f+15],10,-30611744),h=y(h,p,c,l,a[f+6],15,-1560198380),l=y(l,h,p,c,a[f+13],21,1309151649),c=y(c,l,h,p,a[f+4],6,-145523070),p=y(p,c,l,h,a[f+11],10,-1120210379),h=y(h,p,c,l,a[f+2],15,718787259),l=y(l,h,p,c,a[f+9],21,-343485551),c=c+v>>>0,l=l+b>>>0,h=h+w>>>0,p=p+x>>>0}return e.endian([c,l,h,p])};s._ff=function(t,e,n,r,o,i,s){var a=t+(e&n|~e&r)+(o>>>0)+s;return(a<<i|a>>>32-i)+e},s._gg=function(t,e,n,r,o,i,s){var a=t+(e&r|n&~r)+(o>>>0)+s;return(a<<i|a>>>32-i)+e},s._hh=function(t,e,n,r,o,i,s){var a=t+(e^n^r)+(o>>>0)+s;return(a<<i|a>>>32-i)+e},s._ii=function(t,e,n,r,o,i,s){var a=t+(n^(e|~r))+(o>>>0)+s;return(a<<i|a>>>32-i)+e},s._blocksize=16,s._digestsize=16,t.exports=function(t,n){if(null==t)throw new Error("Illegal argument "+t);var r=e.wordsToBytes(s(t,n));return n&&n.asBytes?r:n&&n.asString?i.bytesToString(r):e.bytesToHex(r)}}()},285:(t,e,n)=>{var r=n(2);t.exports=function(t){return t?("{}"===t.substr(0,2)&&(t="\\{\\}"+t.substr(2)),m(function(t){return t.split("\\\\").join(o).split("\\{").join(i).split("\\}").join(s).split("\\,").join(a).split("\\.").join(u)}(t),!0).map(l)):[]};var o="\0SLASH"+Math.random()+"\0",i="\0OPEN"+Math.random()+"\0",s="\0CLOSE"+Math.random()+"\0",a="\0COMMA"+Math.random()+"\0",u="\0PERIOD"+Math.random()+"\0";function c(t){return parseInt(t,10)==t?parseInt(t,10):t.charCodeAt(0)}function l(t){return t.split(o).join("\\").split(i).join("{").split(s).join("}").split(a).join(",").split(u).join(".")}function h(t){if(!t)return[""];var e=[],n=r("{","}",t);if(!n)return t.split(",");var o=n.pre,i=n.body,s=n.post,a=o.split(",");a[a.length-1]+="{"+i+"}";var u=h(s);return s.length&&(a[a.length-1]+=u.shift(),a.push.apply(a,u)),e.push.apply(e,a),e}function p(t){return"{"+t+"}"}function f(t){return/^-?0\d/.test(t)}function d(t,e){return t<=e}function g(t,e){return t>=e}function m(t,e){var n=[],o=r("{","}",t);if(!o)return[t];var i=o.pre,a=o.post.length?m(o.post,!1):[""];if(/\$$/.test(o.pre))for(var u=0;u<a.length;u++){var l=i+"{"+o.body+"}"+a[u];n.push(l)}else{var y,v,b=/^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(o.body),w=/^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(o.body),x=b||w,N=o.body.indexOf(",")>=0;if(!x&&!N)return o.post.match(/,.*\}/)?m(t=o.pre+"{"+o.body+s+o.post):[t];if(x)y=o.body.split(/\.\./);else if(1===(y=h(o.body)).length&&1===(y=m(y[0],!1).map(p)).length)return a.map((function(t){return o.pre+y[0]+t}));if(x){var A=c(y[0]),P=c(y[1]),O=Math.max(y[0].length,y[1].length),E=3==y.length?Math.abs(c(y[2])):1,T=d;P<A&&(E*=-1,T=g);var j=y.some(f);v=[];for(var S=A;T(S,P);S+=E){var $;if(w)"\\"===($=String.fromCharCode(S))&&($="");else if($=String(S),j){var C=O-$.length;if(C>0){var I=new Array(C+1).join("0");$=S<0?"-"+I+$.slice(1):I+$}}v.push($)}}else{v=[];for(var k=0;k<y.length;k++)v.push.apply(v,m(y[k],!1))}for(k=0;k<v.length;k++)for(u=0;u<a.length;u++)l=i+v[k]+a[u],(!e||x||l)&&n.push(l)}return n}},829:t=>{function e(t){return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e(t)}function n(t){var e="function"==typeof Map?new Map:void 0;return n=function(t){if(null===t||(n=t,-1===Function.toString.call(n).indexOf("[native code]")))return t;var n;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==e){if(e.has(t))return e.get(t);e.set(t,s)}function s(){return r(t,arguments,i(this).constructor)}return s.prototype=Object.create(t.prototype,{constructor:{value:s,enumerable:!1,writable:!0,configurable:!0}}),o(s,t)},n(t)}function r(t,e,n){return r=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}()?Reflect.construct:function(t,e,n){var r=[null];r.push.apply(r,e);var i=new(Function.bind.apply(t,r));return n&&o(i,n.prototype),i},r.apply(null,arguments)}function o(t,e){return o=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},o(t,e)}function i(t){return i=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},i(t)}var s=function(t){function n(t){var r;return function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,n),(r=function(t,n){return!n||"object"!==e(n)&&"function"!=typeof n?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):n}(this,i(n).call(this,t))).name="ObjectPrototypeMutationError",r}return function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&o(t,e)}(n,t),n}(n(Error));function a(t,n){for(var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:function(){},o=n.split("."),i=o.length,s=function(e){var n=o[e];if(!t)return{v:void 0};if("+"===n){if(Array.isArray(t))return{v:t.map((function(n,i){var s=o.slice(e+1);return s.length>0?a(n,s.join("."),r):r(t,i,o,e)}))};var i=o.slice(0,e).join(".");throw new Error("Object at wildcard (".concat(i,") is not an array"))}t=r(t,n,o,e)},u=0;u<i;u++){var c=s(u);if("object"===e(c))return c.v}return t}function u(t,e){return t.length===e+1}t.exports={set:function(t,n,r){if("object"!=e(t)||null===t)return t;if(void 0===n)return t;if("number"==typeof n)return t[n]=r,t[n];try{return a(t,n,(function(t,e,n,o){if(t===Reflect.getPrototypeOf({}))throw new s("Attempting to mutate Object.prototype");if(!t[e]){var i=Number.isInteger(Number(n[o+1])),a="+"===n[o+1];t[e]=i||a?[]:{}}return u(n,o)&&(t[e]=r),t[e]}))}catch(e){if(e instanceof s)throw e;return t}},get:function(t,n){if("object"!=e(t)||null===t)return t;if(void 0===n)return t;if("number"==typeof n)return t[n];try{return a(t,n,(function(t,e){return t[e]}))}catch(e){return t}},has:function(t,n){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};if("object"!=e(t)||null===t)return!1;if(void 0===n)return!1;if("number"==typeof n)return n in t;try{var o=!1;return a(t,n,(function(t,e,n,i){if(!u(n,i))return t&&t[e];o=r.own?t.hasOwnProperty(e):e in t})),o}catch(t){return!1}},hasOwn:function(t,e,n){return this.has(t,e,n||{own:!0})},isIn:function(t,n,r){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};if("object"!=e(t)||null===t)return!1;if(void 0===n)return!1;try{var i=!1,s=!1;return a(t,n,(function(t,n,o,a){return i=i||t===r||!!t&&t[n]===r,s=u(o,a)&&"object"===e(t)&&n in t,t&&t[n]})),o.validPath?i&&s:i}catch(t){return!1}},ObjectPrototypeMutationError:s}},47:(t,e,n)=>{var r=n(410),o=function(t){return"string"==typeof t};function i(t,e){for(var n=[],r=0;r<t.length;r++){var o=t[r];o&&"."!==o&&(".."===o?n.length&&".."!==n[n.length-1]?n.pop():e&&n.push(".."):n.push(o))}return n}var s=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/,a={};function u(t){return s.exec(t).slice(1)}a.resolve=function(){for(var t="",e=!1,n=arguments.length-1;n>=-1&&!e;n--){var r=n>=0?arguments[n]:process.cwd();if(!o(r))throw new TypeError("Arguments to path.resolve must be strings");r&&(t=r+"/"+t,e="/"===r.charAt(0))}return(e?"/":"")+(t=i(t.split("/"),!e).join("/"))||"."},a.normalize=function(t){var e=a.isAbsolute(t),n="/"===t.substr(-1);return(t=i(t.split("/"),!e).join("/"))||e||(t="."),t&&n&&(t+="/"),(e?"/":"")+t},a.isAbsolute=function(t){return"/"===t.charAt(0)},a.join=function(){for(var t="",e=0;e<arguments.length;e++){var n=arguments[e];if(!o(n))throw new TypeError("Arguments to path.join must be strings");n&&(t+=t?"/"+n:n)}return a.normalize(t)},a.relative=function(t,e){function n(t){for(var e=0;e<t.length&&""===t[e];e++);for(var n=t.length-1;n>=0&&""===t[n];n--);return e>n?[]:t.slice(e,n+1)}t=a.resolve(t).substr(1),e=a.resolve(e).substr(1);for(var r=n(t.split("/")),o=n(e.split("/")),i=Math.min(r.length,o.length),s=i,u=0;u<i;u++)if(r[u]!==o[u]){s=u;break}var c=[];for(u=s;u<r.length;u++)c.push("..");return(c=c.concat(o.slice(s))).join("/")},a._makeLong=function(t){return t},a.dirname=function(t){var e=u(t),n=e[0],r=e[1];return n||r?(r&&(r=r.substr(0,r.length-1)),n+r):"."},a.basename=function(t,e){var n=u(t)[2];return e&&n.substr(-1*e.length)===e&&(n=n.substr(0,n.length-e.length)),n},a.extname=function(t){return u(t)[3]},a.format=function(t){if(!r.isObject(t))throw new TypeError("Parameter 'pathObject' must be an object, not "+typeof t);var e=t.root||"";if(!o(e))throw new TypeError("'pathObject.root' must be a string or undefined, not "+typeof t.root);return(t.dir?t.dir+a.sep:"")+(t.base||"")},a.parse=function(t){if(!o(t))throw new TypeError("Parameter 'pathString' must be a string, not "+typeof t);var e=u(t);if(!e||4!==e.length)throw new TypeError("Invalid path '"+t+"'");return e[1]=e[1]||"",e[2]=e[2]||"",e[3]=e[3]||"",{root:e[0],dir:e[0]+e[1].slice(0,e[1].length-1),base:e[2],ext:e[3],name:e[2].slice(0,e[2].length-e[3].length)}},a.sep="/",a.delimiter=":",t.exports=a},647:(t,e)=>{var n=Object.prototype.hasOwnProperty;function r(t){try{return decodeURIComponent(t.replace(/\+/g," "))}catch(t){return null}}function o(t){try{return encodeURIComponent(t)}catch(t){return null}}e.stringify=function(t,e){e=e||"";var r,i,s=[];for(i in"string"!=typeof e&&(e="?"),t)if(n.call(t,i)){if((r=t[i])||null!=r&&!isNaN(r)||(r=""),i=o(i),r=o(r),null===i||null===r)continue;s.push(i+"="+r)}return s.length?e+s.join("&"):""},e.parse=function(t){for(var e,n=/([^=?#&]+)=?([^&]*)/g,o={};e=n.exec(t);){var i=r(e[1]),s=r(e[2]);null===i||null===s||i in o||(o[i]=s)}return o}},670:t=>{t.exports=function(t,e){if(e=e.split(":")[0],!(t=+t))return!1;switch(e){case"http":case"ws":return 80!==t;case"https":case"wss":return 443!==t;case"ftp":return 21!==t;case"gopher":return 70!==t;case"file":return!1}return 0!==t}},494:t=>{const e=/^[-+]?0x[a-fA-F0-9]+$/,n=/^([\-\+])?(0*)(\.[0-9]+([eE]\-?[0-9]+)?|[0-9]+(\.[0-9]+([eE]\-?[0-9]+)?)?)$/;!Number.parseInt&&window.parseInt&&(Number.parseInt=window.parseInt),!Number.parseFloat&&window.parseFloat&&(Number.parseFloat=window.parseFloat);const r={hex:!0,leadingZeros:!0,decimalPoint:".",eNotation:!0};t.exports=function(t){let o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(o=Object.assign({},r,o),!t||"string"!=typeof t)return t;let i=t.trim();if(void 0!==o.skipLike&&o.skipLike.test(i))return t;if(o.hex&&e.test(i))return Number.parseInt(i,16);{const e=n.exec(i);if(e){const n=e[1],r=e[2];let a=(s=e[3])&&-1!==s.indexOf(".")?("."===(s=s.replace(/0+$/,""))?s="0":"."===s[0]?s="0"+s:"."===s[s.length-1]&&(s=s.substr(0,s.length-1)),s):s;const u=e[4]||e[6];if(!o.leadingZeros&&r.length>0&&n&&"."!==i[2])return t;if(!o.leadingZeros&&r.length>0&&!n&&"."!==i[1])return t;{const e=Number(i),s=""+e;return-1!==s.search(/[eE]/)||u?o.eNotation?e:t:-1!==i.indexOf(".")?"0"===s&&""===a||s===a||n&&s==="-"+a?e:t:r?a===s||n+a===s?e:t:i===s||i===n+s?e:t}}return t}// removed by dead control flow
 var s; }},737:(t,e,n)=>{var r=n(670),o=n(647),i=/^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/,s=/[\n\r\t]/g,a=/^[A-Za-z][A-Za-z0-9+-.]*:\/\//,u=/:\d+$/,c=/^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i,l=/^[a-zA-Z]:/;function h(t){return(t||"").toString().replace(i,"")}var p=[["#","hash"],["?","query"],function(t,e){return g(e.protocol)?t.replace(/\\/g,"/"):t},["/","pathname"],["@","auth",1],[NaN,"host",void 0,1,1],[/:(\d*)$/,"port",void 0,1],[NaN,"hostname",void 0,1,1]],f={hash:1,query:1};function d(t){var e,n=("undefined"!=typeof window?window:"undefined"!=typeof __webpack_require__.g?__webpack_require__.g:"undefined"!=typeof self?self:{}).location||{},r={},o=typeof(t=t||n);if("blob:"===t.protocol)r=new y(unescape(t.pathname),{});else if("string"===o)for(e in r=new y(t,{}),f)delete r[e];else if("object"===o){for(e in t)e in f||(r[e]=t[e]);void 0===r.slashes&&(r.slashes=a.test(t.href))}return r}function g(t){return"file:"===t||"ftp:"===t||"http:"===t||"https:"===t||"ws:"===t||"wss:"===t}function m(t,e){t=(t=h(t)).replace(s,""),e=e||{};var n,r=c.exec(t),o=r[1]?r[1].toLowerCase():"",i=!!r[2],a=!!r[3],u=0;return i?a?(n=r[2]+r[3]+r[4],u=r[2].length+r[3].length):(n=r[2]+r[4],u=r[2].length):a?(n=r[3]+r[4],u=r[3].length):n=r[4],"file:"===o?u>=2&&(n=n.slice(2)):g(o)?n=r[4]:o?i&&(n=n.slice(2)):u>=2&&g(e.protocol)&&(n=r[4]),{protocol:o,slashes:i||g(o),slashesCount:u,rest:n}}function y(t,e,n){if(t=(t=h(t)).replace(s,""),!(this instanceof y))return new y(t,e,n);var i,a,u,c,f,v,b=p.slice(),w=typeof e,x=this,N=0;for("object"!==w&&"string"!==w&&(n=e,e=null),n&&"function"!=typeof n&&(n=o.parse),i=!(a=m(t||"",e=d(e))).protocol&&!a.slashes,x.slashes=a.slashes||i&&e.slashes,x.protocol=a.protocol||e.protocol||"",t=a.rest,("file:"===a.protocol&&(2!==a.slashesCount||l.test(t))||!a.slashes&&(a.protocol||a.slashesCount<2||!g(x.protocol)))&&(b[3]=[/(.*)/,"pathname"]);N<b.length;N++)"function"!=typeof(c=b[N])?(u=c[0],v=c[1],u!=u?x[v]=t:"string"==typeof u?~(f="@"===u?t.lastIndexOf(u):t.indexOf(u))&&("number"==typeof c[2]?(x[v]=t.slice(0,f),t=t.slice(f+c[2])):(x[v]=t.slice(f),t=t.slice(0,f))):(f=u.exec(t))&&(x[v]=f[1],t=t.slice(0,f.index)),x[v]=x[v]||i&&c[3]&&e[v]||"",c[4]&&(x[v]=x[v].toLowerCase())):t=c(t,x);n&&(x.query=n(x.query)),i&&e.slashes&&"/"!==x.pathname.charAt(0)&&(""!==x.pathname||""!==e.pathname)&&(x.pathname=function(t,e){if(""===t)return e;for(var n=(e||"/").split("/").slice(0,-1).concat(t.split("/")),r=n.length,o=n[r-1],i=!1,s=0;r--;)"."===n[r]?n.splice(r,1):".."===n[r]?(n.splice(r,1),s++):s&&(0===r&&(i=!0),n.splice(r,1),s--);return i&&n.unshift(""),"."!==o&&".."!==o||n.push(""),n.join("/")}(x.pathname,e.pathname)),"/"!==x.pathname.charAt(0)&&g(x.protocol)&&(x.pathname="/"+x.pathname),r(x.port,x.protocol)||(x.host=x.hostname,x.port=""),x.username=x.password="",x.auth&&(~(f=x.auth.indexOf(":"))?(x.username=x.auth.slice(0,f),x.username=encodeURIComponent(decodeURIComponent(x.username)),x.password=x.auth.slice(f+1),x.password=encodeURIComponent(decodeURIComponent(x.password))):x.username=encodeURIComponent(decodeURIComponent(x.auth)),x.auth=x.password?x.username+":"+x.password:x.username),x.origin="file:"!==x.protocol&&g(x.protocol)&&x.host?x.protocol+"//"+x.host:"null",x.href=x.toString()}y.prototype={set:function(t,e,n){var i=this;switch(t){case"query":"string"==typeof e&&e.length&&(e=(n||o.parse)(e)),i[t]=e;break;case"port":i[t]=e,r(e,i.protocol)?e&&(i.host=i.hostname+":"+e):(i.host=i.hostname,i[t]="");break;case"hostname":i[t]=e,i.port&&(e+=":"+i.port),i.host=e;break;case"host":i[t]=e,u.test(e)?(e=e.split(":"),i.port=e.pop(),i.hostname=e.join(":")):(i.hostname=e,i.port="");break;case"protocol":i.protocol=e.toLowerCase(),i.slashes=!n;break;case"pathname":case"hash":if(e){var s="pathname"===t?"/":"#";i[t]=e.charAt(0)!==s?s+e:e}else i[t]=e;break;case"username":case"password":i[t]=encodeURIComponent(e);break;case"auth":var a=e.indexOf(":");~a?(i.username=e.slice(0,a),i.username=encodeURIComponent(decodeURIComponent(i.username)),i.password=e.slice(a+1),i.password=encodeURIComponent(decodeURIComponent(i.password))):i.username=encodeURIComponent(decodeURIComponent(e))}for(var c=0;c<p.length;c++){var l=p[c];l[4]&&(i[l[1]]=i[l[1]].toLowerCase())}return i.auth=i.password?i.username+":"+i.password:i.username,i.origin="file:"!==i.protocol&&g(i.protocol)&&i.host?i.protocol+"//"+i.host:"null",i.href=i.toString(),i},toString:function(t){t&&"function"==typeof t||(t=o.stringify);var e,n=this,r=n.host,i=n.protocol;i&&":"!==i.charAt(i.length-1)&&(i+=":");var s=i+(n.protocol&&n.slashes||g(n.protocol)?"//":"");return n.username?(s+=n.username,n.password&&(s+=":"+n.password),s+="@"):n.password?(s+=":"+n.password,s+="@"):"file:"!==n.protocol&&g(n.protocol)&&!r&&"/"!==n.pathname&&(s+="@"),(":"===r[r.length-1]||u.test(n.hostname)&&!n.port)&&(r+=":"),s+=r+n.pathname,(e="object"==typeof n.query?t(n.query):n.query)&&(s+="?"!==e.charAt(0)?"?"+e:e),n.hash&&(s+=n.hash),s}},y.extractProtocol=m,y.location=d,y.trimLeft=h,y.qs=o,t.exports=y},410:()=>{},388:()=>{},805:()=>{},345:()=>{},800:()=>{}},e={};function n(r){var o=e[r];if(void 0!==o)return o.exports;var i=e[r]={id:r,loaded:!1,exports:{}};return t[r].call(i.exports,i,i.exports,n),i.loaded=!0,i.exports}n.n=t=>{var e=t&&t.__esModule?()=>t.default:()=>t;return n.d(e,{a:e}),e},n.d=(t,e)=>{for(var r in e)n.o(e,r)&&!n.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},n.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),n.nmd=t=>(t.paths=[],t.children||(t.children=[]),t);var r={};n.d(r,{hT:()=>C,O4:()=>I,Kd:()=>S,YK:()=>$,UU:()=>en,Gu:()=>F,ky:()=>oe,h4:()=>ne,ch:()=>re,hq:()=>Xt,i5:()=>ie});var o=n(737),i=n.n(o);function s(t){if(!a(t))throw new Error("Parameter was not an error")}function a(t){return!!t&&"object"==typeof t&&"[object Error]"===(e=t,Object.prototype.toString.call(e))||t instanceof Error;// removed by dead control flow
 var e; }class u extends Error{constructor(t,e){const n=[...arguments],{options:r,shortMessage:o}=function(t){let e,n="";if(0===t.length)e={};else if(a(t[0]))e={cause:t[0]},n=t.slice(1).join(" ")||"";else if(t[0]&&"object"==typeof t[0])e=Object.assign({},t[0]),n=t.slice(1).join(" ")||"";else{if("string"!=typeof t[0])throw new Error("Invalid arguments passed to Layerr");e={},n=n=t.join(" ")||""}return{options:e,shortMessage:n}}(n);let i=o;if(r.cause&&(i=`${i}: ${r.cause.message}`),super(i),this.message=i,r.name&&"string"==typeof r.name?this.name=r.name:this.name="Layerr",r.cause&&Object.defineProperty(this,"_cause",{value:r.cause}),Object.defineProperty(this,"_info",{value:{}}),r.info&&"object"==typeof r.info&&Object.assign(this._info,r.info),Error.captureStackTrace){const t=r.constructorOpt||this.constructor;Error.captureStackTrace(this,t)}}static cause(t){return s(t),t._cause&&a(t._cause)?t._cause:null}static fullStack(t){s(t);const e=u.cause(t);return e?`${t.stack}\ncaused by: ${u.fullStack(e)}`:t.stack??""}static info(t){s(t);const e={},n=u.cause(t);return n&&Object.assign(e,u.info(n)),t._info&&Object.assign(e,t._info),e}toString(){let t=this.name||this.constructor.name||this.constructor.prototype.name;return this.message&&(t=`${t}: ${this.message}`),t}}var c=n(47),l=n.n(c);const h="__PATH_SEPARATOR_POSIX__",p="__PATH_SEPARATOR_WINDOWS__";function f(t){try{const e=t.replace(/\//g,h).replace(/\\\\/g,p);return encodeURIComponent(e).split(p).join("\\\\").split(h).join("/")}catch(t){throw new u(t,"Failed encoding path")}}function d(t){return t.startsWith("/")?t:"/"+t}function g(t){let e=t;return"/"!==e[0]&&(e="/"+e),/^.+\/$/.test(e)&&(e=e.substr(0,e.length-1)),e}function m(t){let e=new(i())(t).pathname;return e.length<=0&&(e="/"),g(e)}function y(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];return function(){return function(t){var e=[];if(0===t.length)return"";if("string"!=typeof t[0])throw new TypeError("Url must be a string. Received "+t[0]);if(t[0].match(/^[^/:]+:\/*$/)&&t.length>1){var n=t.shift();t[0]=n+t[0]}t[0].match(/^file:\/\/\//)?t[0]=t[0].replace(/^([^/:]+):\/*/,"$1:///"):t[0]=t[0].replace(/^([^/:]+):\/*/,"$1://");for(var r=0;r<t.length;r++){var o=t[r];if("string"!=typeof o)throw new TypeError("Url must be a string. Received "+o);""!==o&&(r>0&&(o=o.replace(/^[\/]+/,"")),o=r<t.length-1?o.replace(/[\/]+$/,""):o.replace(/[\/]+$/,"/"),e.push(o))}var i=e.join("/"),s=(i=i.replace(/\/(\?|&|#[^!])/g,"$1")).split("?");return s.shift()+(s.length>0?"?":"")+s.join("&")}("object"==typeof arguments[0]?arguments[0]:[].slice.call(arguments))}(e.reduce(((t,e,n)=>((0===n||"/"!==e||"/"===e&&"/"!==t[t.length-1])&&t.push(e),t)),[]))}var v=n(542),b=n.n(v);const w="abcdef0123456789";function x(t,e){const n=t.url.replace("//",""),r=-1==n.indexOf("/")?"/":n.slice(n.indexOf("/")),o=t.method?t.method.toUpperCase():"GET",i=!!/(^|,)\s*auth\s*($|,)/.test(e.qop)&&"auth",s=`00000000${e.nc}`.slice(-8),a=function(t,e,n,r,o,i,s){const a=s||b()(`${e}:${n}:${r}`);return t&&"md5-sess"===t.toLowerCase()?b()(`${a}:${o}:${i}`):a}(e.algorithm,e.username,e.realm,e.password,e.nonce,e.cnonce,e.ha1),u=b()(`${o}:${r}`),c=i?b()(`${a}:${e.nonce}:${s}:${e.cnonce}:${i}:${u}`):b()(`${a}:${e.nonce}:${u}`),l={username:e.username,realm:e.realm,nonce:e.nonce,uri:r,qop:i,response:c,nc:s,cnonce:e.cnonce,algorithm:e.algorithm,opaque:e.opaque},h=[];for(const t in l)l[t]&&("qop"===t||"nc"===t||"algorithm"===t?h.push(`${t}=${l[t]}`):h.push(`${t}="${l[t]}"`));return`Digest ${h.join(", ")}`}function N(t){return"digest"===(t.headers&&t.headers.get("www-authenticate")||"").split(/\s/)[0].toLowerCase()}var A=n(101),P=n.n(A);function O(t){return P().decode(t)}function E(t,e){var n;return`Basic ${n=`${t}:${e}`,P().encode(n)}`}const T="undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:"undefined"!=typeof window?window:globalThis,j=T.fetch.bind(T),S=(T.Headers,T.Request),$=T.Response;let C=function(t){return t.Auto="auto",t.Digest="digest",t.None="none",t.Password="password",t.Token="token",t}({}),I=function(t){return t.DataTypeNoLength="data-type-no-length",t.InvalidAuthType="invalid-auth-type",t.InvalidOutputFormat="invalid-output-format",t.LinkUnsupportedAuthType="link-unsupported-auth",t.InvalidUpdateRange="invalid-update-range",t.NotSupported="not-supported",t}({});function k(t,e,n,r,o){switch(t.authType){case C.Auto:e&&n&&(t.headers.Authorization=E(e,n));break;case C.Digest:t.digest=function(t,e,n){return{username:t,password:e,ha1:n,nc:0,algorithm:"md5",hasDigestAuth:!1}}(e,n,o);break;case C.None:break;case C.Password:t.headers.Authorization=E(e,n);break;case C.Token:t.headers.Authorization=`${(i=r).token_type} ${i.access_token}`;break;default:throw new u({info:{code:I.InvalidAuthType}},`Invalid auth type: ${t.authType}`)}var i}n(345),n(800);const R="@@HOTPATCHER",L=()=>{};function _(t){return{original:t,methods:[t],final:!1}}class M{constructor(){this._configuration={registry:{},getEmptyAction:"null"},this.__type__=R}get configuration(){return this._configuration}get getEmptyAction(){return this.configuration.getEmptyAction}set getEmptyAction(t){this.configuration.getEmptyAction=t}control(t){let e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(!t||t.__type__!==R)throw new Error("Failed taking control of target HotPatcher instance: Invalid type or object");return Object.keys(t.configuration.registry).forEach((n=>{this.configuration.registry.hasOwnProperty(n)?e&&(this.configuration.registry[n]=Object.assign({},t.configuration.registry[n])):this.configuration.registry[n]=Object.assign({},t.configuration.registry[n])})),t._configuration=this.configuration,this}execute(t){const e=this.get(t)||L;for(var n=arguments.length,r=new Array(n>1?n-1:0),o=1;o<n;o++)r[o-1]=arguments[o];return e(...r)}get(t){const e=this.configuration.registry[t];if(!e)switch(this.getEmptyAction){case"null":return null;case"throw":throw new Error(`Failed handling method request: No method provided for override: ${t}`);default:throw new Error(`Failed handling request which resulted in an empty method: Invalid empty-action specified: ${this.getEmptyAction}`)}return function(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];if(0===e.length)throw new Error("Failed creating sequence: No functions provided");return function(){for(var t=arguments.length,n=new Array(t),r=0;r<t;r++)n[r]=arguments[r];let o=n;const i=this;for(;e.length>0;)o=[e.shift().apply(i,o)];return o[0]}}(...e.methods)}isPatched(t){return!!this.configuration.registry[t]}patch(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const{chain:r=!1}=n;if(this.configuration.registry[t]&&this.configuration.registry[t].final)throw new Error(`Failed patching '${t}': Method marked as being final`);if("function"!=typeof e)throw new Error(`Failed patching '${t}': Provided method is not a function`);if(r)this.configuration.registry[t]?this.configuration.registry[t].methods.push(e):this.configuration.registry[t]=_(e);else if(this.isPatched(t)){const{original:n}=this.configuration.registry[t];this.configuration.registry[t]=Object.assign(_(e),{original:n})}else this.configuration.registry[t]=_(e);return this}patchInline(t,e){this.isPatched(t)||this.patch(t,e);for(var n=arguments.length,r=new Array(n>2?n-2:0),o=2;o<n;o++)r[o-2]=arguments[o];return this.execute(t,...r)}plugin(t){for(var e=arguments.length,n=new Array(e>1?e-1:0),r=1;r<e;r++)n[r-1]=arguments[r];return n.forEach((e=>{this.patch(t,e,{chain:!0})})),this}restore(t){if(!this.isPatched(t))throw new Error(`Failed restoring method: No method present for key: ${t}`);if("function"!=typeof this.configuration.registry[t].original)throw new Error(`Failed restoring method: Original method not found or of invalid type for key: ${t}`);return this.configuration.registry[t].methods=[this.configuration.registry[t].original],this}setFinal(t){if(!this.configuration.registry.hasOwnProperty(t))throw new Error(`Failed marking '${t}' as final: No method found for key`);return this.configuration.registry[t].final=!0,this}}let U=null;function F(){return U||(U=new M),U}function D(t){return function(t){if("object"!=typeof t||null===t||"[object Object]"!=Object.prototype.toString.call(t))return!1;if(null===Object.getPrototypeOf(t))return!0;let e=t;for(;null!==Object.getPrototypeOf(e);)e=Object.getPrototypeOf(e);return Object.getPrototypeOf(t)===e}(t)?Object.assign({},t):Object.setPrototypeOf(Object.assign({},t),Object.getPrototypeOf(t))}function B(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];let r=null,o=[...e];for(;o.length>0;){const t=o.shift();r=r?V(r,t):D(t)}return r}function V(t,e){const n=D(t);return Object.keys(e).forEach((t=>{n.hasOwnProperty(t)?Array.isArray(e[t])?n[t]=Array.isArray(n[t])?[...n[t],...e[t]]:[...e[t]]:"object"==typeof e[t]&&e[t]?n[t]="object"==typeof n[t]&&n[t]?V(n[t],e[t]):D(e[t]):n[t]=e[t]:n[t]=e[t]})),n}function W(t){const e={};for(const n of t.keys())e[n]=t.get(n);return e}function z(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];if(0===e.length)return{};const r={};return e.reduce(((t,e)=>(Object.keys(e).forEach((n=>{const o=n.toLowerCase();r.hasOwnProperty(o)?t[r[o]]=e[n]:(r[o]=n,t[n]=e[n])})),t)),{})}n(805);const G="function"==typeof ArrayBuffer,{toString:q}=Object.prototype;function H(t){return G&&(t instanceof ArrayBuffer||"[object ArrayBuffer]"===q.call(t))}function X(t){return null!=t&&null!=t.constructor&&"function"==typeof t.constructor.isBuffer&&t.constructor.isBuffer(t)}function Z(t){return function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}function Y(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}const K=Z((function(t){const e=t._digest;return delete t._digest,e.hasDigestAuth&&(t=B(t,{headers:{Authorization:x(t,e)}})),Y(et(t),(function(n){let r=!1;return o=function(t){return r?t:n},(i=function(){if(401==n.status)return e.hasDigestAuth=function(t,e){if(!N(t))return!1;const n=/([a-z0-9_-]+)=(?:"([^"]+)"|([a-z0-9_-]+))/gi;for(;;){const r=t.headers&&t.headers.get("www-authenticate")||"",o=n.exec(r);if(!o)break;e[o[1]]=o[2]||o[3]}return e.nc+=1,e.cnonce=function(){let t="";for(let e=0;e<32;++e)t=`${t}${w[Math.floor(16*Math.random())]}`;return t}(),!0}(n,e),function(){if(e.hasDigestAuth)return Y(et(t=B(t,{headers:{Authorization:x(t,e)}})),(function(t){return 401==t.status?e.hasDigestAuth=!1:e.nc++,r=!0,t}))}();e.nc++}())&&i.then?i.then(o):o(i);// removed by dead control flow
 var o, i; }))})),J=Z((function(t,e){return Y(et(t),(function(n){return n.ok?(e.authType=C.Password,n):401==n.status&&N(n)?(e.authType=C.Digest,k(e,e.username,e.password,void 0,void 0),t._digest=e.digest,K(t)):n}))})),Q=Z((function(t,e){return e.authType===C.Auto?J(t,e):t._digest?K(t):et(t)}));function tt(t,e,n){const r=D(t);return r.headers=z(e.headers,r.headers||{},n.headers||{}),void 0!==n.data&&(r.data=n.data),n.signal&&(r.signal=n.signal),e.httpAgent&&(r.httpAgent=e.httpAgent),e.httpsAgent&&(r.httpsAgent=e.httpsAgent),e.digest&&(r._digest=e.digest),"boolean"==typeof e.withCredentials&&(r.withCredentials=e.withCredentials),r}function et(t){const e=F();return e.patchInline("request",(t=>e.patchInline("fetch",j,t.url,function(t){let e={};const n={method:t.method};if(t.headers&&(e=z(e,t.headers)),void 0!==t.data){const[r,o]=function(t){if("string"==typeof t)return[t,{}];if(X(t))return[t,{}];if(H(t))return[t,{}];if(t&&"object"==typeof t)return[JSON.stringify(t),{"content-type":"application/json"}];throw new Error("Unable to convert request body: Unexpected body type: "+typeof t)}(t.data);n.body=r,e=z(e,o)}return t.signal&&(n.signal=t.signal),t.withCredentials&&(n.credentials="include"),n.headers=e,n}(t))),t)}var nt=n(285);const rt=t=>{if("string"!=typeof t)throw new TypeError("invalid pattern");if(t.length>65536)throw new TypeError("pattern is too long")},ot={"[:alnum:]":["\\p{L}\\p{Nl}\\p{Nd}",!0],"[:alpha:]":["\\p{L}\\p{Nl}",!0],"[:ascii:]":["\\x00-\\x7f",!1],"[:blank:]":["\\p{Zs}\\t",!0],"[:cntrl:]":["\\p{Cc}",!0],"[:digit:]":["\\p{Nd}",!0],"[:graph:]":["\\p{Z}\\p{C}",!0,!0],"[:lower:]":["\\p{Ll}",!0],"[:print:]":["\\p{C}",!0],"[:punct:]":["\\p{P}",!0],"[:space:]":["\\p{Z}\\t\\r\\n\\v\\f",!0],"[:upper:]":["\\p{Lu}",!0],"[:word:]":["\\p{L}\\p{Nl}\\p{Nd}\\p{Pc}",!0],"[:xdigit:]":["A-Fa-f0-9",!1]},it=t=>t.replace(/[[\]\\-]/g,"\\$&"),st=t=>t.join(""),at=(t,e)=>{const n=e;if("["!==t.charAt(n))throw new Error("not in a brace expression");const r=[],o=[];let i=n+1,s=!1,a=!1,u=!1,c=!1,l=n,h="";t:for(;i<t.length;){const e=t.charAt(i);if("!"!==e&&"^"!==e||i!==n+1){if("]"===e&&s&&!u){l=i+1;break}if(s=!0,"\\"!==e||u){if("["===e&&!u)for(const[e,[s,u,c]]of Object.entries(ot))if(t.startsWith(e,i)){if(h)return["$.",!1,t.length-n,!0];i+=e.length,c?o.push(s):r.push(s),a=a||u;continue t}u=!1,h?(e>h?r.push(it(h)+"-"+it(e)):e===h&&r.push(it(e)),h="",i++):t.startsWith("-]",i+1)?(r.push(it(e+"-")),i+=2):t.startsWith("-",i+1)?(h=e,i+=2):(r.push(it(e)),i++)}else u=!0,i++}else c=!0,i++}if(l<i)return["",!1,0,!1];if(!r.length&&!o.length)return["$.",!1,t.length-n,!0];if(0===o.length&&1===r.length&&/^\\?.$/.test(r[0])&&!c){return[(p=2===r[0].length?r[0].slice(-1):r[0],p.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),!1,l-n,!1]}var p;const f="["+(c?"^":"")+st(r)+"]",d="["+(c?"":"^")+st(o)+"]";return[r.length&&o.length?"("+f+"|"+d+")":r.length?f:d,a,l-n,!0]},ut=function(t){let{windowsPathsNoEscape:e=!1}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return e?t.replace(/\[([^\/\\])\]/g,"$1"):t.replace(/((?!\\).|^)\[([^\/\\])\]/g,"$1$2").replace(/\\([^\/])/g,"$1")},ct=new Set(["!","?","+","*","@"]),lt=t=>ct.has(t),ht="(?!\\.)",pt=new Set(["[","."]),ft=new Set(["..","."]),dt=new Set("().*{}+?[]^$\\!"),gt="[^/]",mt=gt+"*?",yt=gt+"+?";class vt{type;#t;#e;#n=!1;#r=[];#o;#i;#s;#a=!1;#u;#c;#l=!1;constructor(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};this.type=t,t&&(this.#e=!0),this.#o=e,this.#t=this.#o?this.#o.#t:this,this.#u=this.#t===this?n:this.#t.#u,this.#s=this.#t===this?[]:this.#t.#s,"!"!==t||this.#t.#a||this.#s.push(this),this.#i=this.#o?this.#o.#r.length:0}get hasMagic(){if(void 0!==this.#e)return this.#e;for(const t of this.#r)if("string"!=typeof t&&(t.type||t.hasMagic))return this.#e=!0;return this.#e}toString(){return void 0!==this.#c?this.#c:this.type?this.#c=this.type+"("+this.#r.map((t=>String(t))).join("|")+")":this.#c=this.#r.map((t=>String(t))).join("")}#h(){if(this!==this.#t)throw new Error("should only call on root");if(this.#a)return this;let t;for(this.toString(),this.#a=!0;t=this.#s.pop();){if("!"!==t.type)continue;let e=t,n=e.#o;for(;n;){for(let r=e.#i+1;!n.type&&r<n.#r.length;r++)for(const e of t.#r){if("string"==typeof e)throw new Error("string part in extglob AST??");e.copyIn(n.#r[r])}e=n,n=e.#o}}return this}push(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];for(const t of e)if(""!==t){if("string"!=typeof t&&!(t instanceof vt&&t.#o===this))throw new Error("invalid part: "+t);this.#r.push(t)}}toJSON(){const t=null===this.type?this.#r.slice().map((t=>"string"==typeof t?t:t.toJSON())):[this.type,...this.#r.map((t=>t.toJSON()))];return this.isStart()&&!this.type&&t.unshift([]),this.isEnd()&&(this===this.#t||this.#t.#a&&"!"===this.#o?.type)&&t.push({}),t}isStart(){if(this.#t===this)return!0;if(!this.#o?.isStart())return!1;if(0===this.#i)return!0;const t=this.#o;for(let e=0;e<this.#i;e++){const n=t.#r[e];if(!(n instanceof vt&&"!"===n.type))return!1}return!0}isEnd(){if(this.#t===this)return!0;if("!"===this.#o?.type)return!0;if(!this.#o?.isEnd())return!1;if(!this.type)return this.#o?.isEnd();const t=this.#o?this.#o.#r.length:0;return this.#i===t-1}copyIn(t){"string"==typeof t?this.push(t):this.push(t.clone(this))}clone(t){const e=new vt(this.type,t);for(const t of this.#r)e.copyIn(t);return e}static#p(t,e,n,r){let o=!1,i=!1,s=-1,a=!1;if(null===e.type){let u=n,c="";for(;u<t.length;){const n=t.charAt(u++);if(o||"\\"===n)o=!o,c+=n;else if(i)u===s+1?"^"!==n&&"!"!==n||(a=!0):"]"!==n||u===s+2&&a||(i=!1),c+=n;else if("["!==n)if(r.noext||!lt(n)||"("!==t.charAt(u))c+=n;else{e.push(c),c="";const o=new vt(n,e);u=vt.#p(t,o,u,r),e.push(o)}else i=!0,s=u,a=!1,c+=n}return e.push(c),u}let u=n+1,c=new vt(null,e);const l=[];let h="";for(;u<t.length;){const n=t.charAt(u++);if(o||"\\"===n)o=!o,h+=n;else if(i)u===s+1?"^"!==n&&"!"!==n||(a=!0):"]"!==n||u===s+2&&a||(i=!1),h+=n;else if("["!==n)if(lt(n)&&"("===t.charAt(u)){c.push(h),h="";const e=new vt(n,c);c.push(e),u=vt.#p(t,e,u,r)}else if("|"!==n){if(")"===n)return""===h&&0===e.#r.length&&(e.#l=!0),c.push(h),h="",e.push(...l,c),u;h+=n}else c.push(h),h="",l.push(c),c=new vt(null,e);else i=!0,s=u,a=!1,h+=n}return e.type=null,e.#e=void 0,e.#r=[t.substring(n-1)],u}static fromGlob(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const n=new vt(null,void 0,e);return vt.#p(t,n,0,e),n}toMMPattern(){if(this!==this.#t)return this.#t.toMMPattern();const t=this.toString(),[e,n,r,o]=this.toRegExpSource();if(!(r||this.#e||this.#u.nocase&&!this.#u.nocaseMagicOnly&&t.toUpperCase()!==t.toLowerCase()))return n;const i=(this.#u.nocase?"i":"")+(o?"u":"");return Object.assign(new RegExp(`^${e}$`,i),{_src:e,_glob:t})}get options(){return this.#u}toRegExpSource(t){const e=t??!!this.#u.dot;if(this.#t===this&&this.#h(),!this.type){const n=this.isStart()&&this.isEnd(),r=this.#r.map((e=>{const[r,o,i,s]="string"==typeof e?vt.#f(e,this.#e,n):e.toRegExpSource(t);return this.#e=this.#e||i,this.#n=this.#n||s,r})).join("");let o="";if(this.isStart()&&"string"==typeof this.#r[0]&&(1!==this.#r.length||!ft.has(this.#r[0]))){const n=pt,i=e&&n.has(r.charAt(0))||r.startsWith("\\.")&&n.has(r.charAt(2))||r.startsWith("\\.\\.")&&n.has(r.charAt(4)),s=!e&&!t&&n.has(r.charAt(0));o=i?"(?!(?:^|/)\\.\\.?(?:$|/))":s?ht:""}let i="";return this.isEnd()&&this.#t.#a&&"!"===this.#o?.type&&(i="(?:$|\\/)"),[o+r+i,ut(r),this.#e=!!this.#e,this.#n]}const n="*"===this.type||"+"===this.type,r="!"===this.type?"(?:(?!(?:":"(?:";let o=this.#d(e);if(this.isStart()&&this.isEnd()&&!o&&"!"!==this.type){const t=this.toString();return this.#r=[t],this.type=null,this.#e=void 0,[t,ut(this.toString()),!1,!1]}let i=!n||t||e?"":this.#d(!0);i===o&&(i=""),i&&(o=`(?:${o})(?:${i})*?`);let s="";return s="!"===this.type&&this.#l?(this.isStart()&&!e?ht:"")+yt:r+o+("!"===this.type?"))"+(!this.isStart()||e||t?"":ht)+mt+")":"@"===this.type?")":"?"===this.type?")?":"+"===this.type&&i?")":"*"===this.type&&i?")?":`)${this.type}`),[s,ut(o),this.#e=!!this.#e,this.#n]}#d(t){return this.#r.map((e=>{if("string"==typeof e)throw new Error("string type in extglob ast??");const[n,r,o,i]=e.toRegExpSource(t);return this.#n=this.#n||i,n})).filter((t=>!(this.isStart()&&this.isEnd()&&!t))).join("|")}static#f(t,e){let n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],r=!1,o="",i=!1;for(let s=0;s<t.length;s++){const a=t.charAt(s);if(r)r=!1,o+=(dt.has(a)?"\\":"")+a;else if("\\"!==a){if("["===a){const[n,r,a,u]=at(t,s);if(a){o+=n,i=i||r,s+=a-1,e=e||u;continue}}"*"!==a?"?"!==a?o+=a.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"):(o+=gt,e=!0):(o+=n&&"*"===t?yt:mt,e=!0)}else s===t.length-1?o+="\\\\":r=!0}return[o,ut(t),!!e,i]}}const bt=function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return rt(e),!(!n.nocomment&&"#"===e.charAt(0))&&new Gt(e,n).match(t)},wt=/^\*+([^+@!?\*\[\(]*)$/,xt=t=>e=>!e.startsWith(".")&&e.endsWith(t),Nt=t=>e=>e.endsWith(t),At=t=>(t=t.toLowerCase(),e=>!e.startsWith(".")&&e.toLowerCase().endsWith(t)),Pt=t=>(t=t.toLowerCase(),e=>e.toLowerCase().endsWith(t)),Ot=/^\*+\.\*+$/,Et=t=>!t.startsWith(".")&&t.includes("."),Tt=t=>"."!==t&&".."!==t&&t.includes("."),jt=/^\.\*+$/,St=t=>"."!==t&&".."!==t&&t.startsWith("."),$t=/^\*+$/,Ct=t=>0!==t.length&&!t.startsWith("."),It=t=>0!==t.length&&"."!==t&&".."!==t,kt=/^\?+([^+@!?\*\[\(]*)?$/,Rt=t=>{let[e,n=""]=t;const r=Ut([e]);return n?(n=n.toLowerCase(),t=>r(t)&&t.toLowerCase().endsWith(n)):r},Lt=t=>{let[e,n=""]=t;const r=Ft([e]);return n?(n=n.toLowerCase(),t=>r(t)&&t.toLowerCase().endsWith(n)):r},_t=t=>{let[e,n=""]=t;const r=Ft([e]);return n?t=>r(t)&&t.endsWith(n):r},Mt=t=>{let[e,n=""]=t;const r=Ut([e]);return n?t=>r(t)&&t.endsWith(n):r},Ut=t=>{let[e]=t;const n=e.length;return t=>t.length===n&&!t.startsWith(".")},Ft=t=>{let[e]=t;const n=e.length;return t=>t.length===n&&"."!==t&&".."!==t},Dt="object"==typeof process&&process?"object"==typeof process.env&&process.env&&process.env.__MINIMATCH_TESTING_PLATFORM__||process.platform:"posix";bt.sep="win32"===Dt?"\\":"/";const Bt=Symbol("globstar **");bt.GLOBSTAR=Bt,bt.filter=function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n=>bt(n,t,e)};const Vt=function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return Object.assign({},t,e)};bt.defaults=t=>{if(!t||"object"!=typeof t||!Object.keys(t).length)return bt;const e=bt;return Object.assign((function(n,r){return e(n,r,Vt(t,arguments.length>2&&void 0!==arguments[2]?arguments[2]:{}))}),{Minimatch:class extends e.Minimatch{constructor(e){super(e,Vt(t,arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}))}static defaults(n){return e.defaults(Vt(t,n)).Minimatch}},AST:class extends e.AST{constructor(e,n){super(e,n,Vt(t,arguments.length>2&&void 0!==arguments[2]?arguments[2]:{}))}static fromGlob(n){let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return e.AST.fromGlob(n,Vt(t,r))}},unescape:function(n){let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return e.unescape(n,Vt(t,r))},escape:function(n){let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return e.escape(n,Vt(t,r))},filter:function(n){let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return e.filter(n,Vt(t,r))},defaults:n=>e.defaults(Vt(t,n)),makeRe:function(n){let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return e.makeRe(n,Vt(t,r))},braceExpand:function(n){let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return e.braceExpand(n,Vt(t,r))},match:function(n,r){let o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return e.match(n,r,Vt(t,o))},sep:e.sep,GLOBSTAR:Bt})};const Wt=function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return rt(t),e.nobrace||!/\{(?:(?!\{).)*\}/.test(t)?[t]:nt(t)};bt.braceExpand=Wt,bt.makeRe=function(t){return new Gt(t,arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}).makeRe()},bt.match=function(t,e){const n=new Gt(e,arguments.length>2&&void 0!==arguments[2]?arguments[2]:{});return t=t.filter((t=>n.match(t))),n.options.nonull&&!t.length&&t.push(e),t};const zt=/[?*]|[+@!]\(.*?\)|\[|\]/;class Gt{options;set;pattern;windowsPathsNoEscape;nonegate;negate;comment;empty;preserveMultipleSlashes;partial;globSet;globParts;nocase;isWindows;platform;windowsNoMagicRoot;regexp;constructor(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};rt(t),e=e||{},this.options=e,this.pattern=t,this.platform=e.platform||Dt,this.isWindows="win32"===this.platform,this.windowsPathsNoEscape=!!e.windowsPathsNoEscape||!1===e.allowWindowsEscape,this.windowsPathsNoEscape&&(this.pattern=this.pattern.replace(/\\/g,"/")),this.preserveMultipleSlashes=!!e.preserveMultipleSlashes,this.regexp=null,this.negate=!1,this.nonegate=!!e.nonegate,this.comment=!1,this.empty=!1,this.partial=!!e.partial,this.nocase=!!this.options.nocase,this.windowsNoMagicRoot=void 0!==e.windowsNoMagicRoot?e.windowsNoMagicRoot:!(!this.isWindows||!this.nocase),this.globSet=[],this.globParts=[],this.set=[],this.make()}hasMagic(){if(this.options.magicalBraces&&this.set.length>1)return!0;for(const t of this.set)for(const e of t)if("string"!=typeof e)return!0;return!1}debug(){}make(){const t=this.pattern,e=this.options;if(!e.nocomment&&"#"===t.charAt(0))return void(this.comment=!0);if(!t)return void(this.empty=!0);this.parseNegate(),this.globSet=[...new Set(this.braceExpand())],e.debug&&(this.debug=function(){return console.error(...arguments)}),this.debug(this.pattern,this.globSet);const n=this.globSet.map((t=>this.slashSplit(t)));this.globParts=this.preprocess(n),this.debug(this.pattern,this.globParts);let r=this.globParts.map(((t,e,n)=>{if(this.isWindows&&this.windowsNoMagicRoot){const e=!(""!==t[0]||""!==t[1]||"?"!==t[2]&&zt.test(t[2])||zt.test(t[3])),n=/^[a-z]:/i.test(t[0]);if(e)return[...t.slice(0,4),...t.slice(4).map((t=>this.parse(t)))];if(n)return[t[0],...t.slice(1).map((t=>this.parse(t)))]}return t.map((t=>this.parse(t)))}));if(this.debug(this.pattern,r),this.set=r.filter((t=>-1===t.indexOf(!1))),this.isWindows)for(let t=0;t<this.set.length;t++){const e=this.set[t];""===e[0]&&""===e[1]&&"?"===this.globParts[t][2]&&"string"==typeof e[3]&&/^[a-z]:$/i.test(e[3])&&(e[2]="?")}this.debug(this.pattern,this.set)}preprocess(t){if(this.options.noglobstar)for(let e=0;e<t.length;e++)for(let n=0;n<t[e].length;n++)"**"===t[e][n]&&(t[e][n]="*");const{optimizationLevel:e=1}=this.options;return e>=2?(t=this.firstPhasePreProcess(t),t=this.secondPhasePreProcess(t)):t=e>=1?this.levelOneOptimize(t):this.adjascentGlobstarOptimize(t),t}adjascentGlobstarOptimize(t){return t.map((t=>{let e=-1;for(;-1!==(e=t.indexOf("**",e+1));){let n=e;for(;"**"===t[n+1];)n++;n!==e&&t.splice(e,n-e)}return t}))}levelOneOptimize(t){return t.map((t=>0===(t=t.reduce(((t,e)=>{const n=t[t.length-1];return"**"===e&&"**"===n?t:".."===e&&n&&".."!==n&&"."!==n&&"**"!==n?(t.pop(),t):(t.push(e),t)}),[])).length?[""]:t))}levelTwoFileOptimize(t){Array.isArray(t)||(t=this.slashSplit(t));let e=!1;do{if(e=!1,!this.preserveMultipleSlashes){for(let n=1;n<t.length-1;n++){const r=t[n];1===n&&""===r&&""===t[0]||"."!==r&&""!==r||(e=!0,t.splice(n,1),n--)}"."!==t[0]||2!==t.length||"."!==t[1]&&""!==t[1]||(e=!0,t.pop())}let n=0;for(;-1!==(n=t.indexOf("..",n+1));){const r=t[n-1];r&&"."!==r&&".."!==r&&"**"!==r&&(e=!0,t.splice(n-1,2),n-=2)}}while(e);return 0===t.length?[""]:t}firstPhasePreProcess(t){let e=!1;do{e=!1;for(let n of t){let r=-1;for(;-1!==(r=n.indexOf("**",r+1));){let o=r;for(;"**"===n[o+1];)o++;o>r&&n.splice(r+1,o-r);let i=n[r+1];const s=n[r+2],a=n[r+3];if(".."!==i)continue;if(!s||"."===s||".."===s||!a||"."===a||".."===a)continue;e=!0,n.splice(r,1);const u=n.slice(0);u[r]="**",t.push(u),r--}if(!this.preserveMultipleSlashes){for(let t=1;t<n.length-1;t++){const r=n[t];1===t&&""===r&&""===n[0]||"."!==r&&""!==r||(e=!0,n.splice(t,1),t--)}"."!==n[0]||2!==n.length||"."!==n[1]&&""!==n[1]||(e=!0,n.pop())}let o=0;for(;-1!==(o=n.indexOf("..",o+1));){const t=n[o-1];if(t&&"."!==t&&".."!==t&&"**"!==t){e=!0;const t=1===o&&"**"===n[o+1]?["."]:[];n.splice(o-1,2,...t),0===n.length&&n.push(""),o-=2}}}}while(e);return t}secondPhasePreProcess(t){for(let e=0;e<t.length-1;e++)for(let n=e+1;n<t.length;n++){const r=this.partsMatch(t[e],t[n],!this.preserveMultipleSlashes);if(r){t[e]=[],t[n]=r;break}}return t.filter((t=>t.length))}partsMatch(t,e){let n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],r=0,o=0,i=[],s="";for(;r<t.length&&o<e.length;)if(t[r]===e[o])i.push("b"===s?e[o]:t[r]),r++,o++;else if(n&&"**"===t[r]&&e[o]===t[r+1])i.push(t[r]),r++;else if(n&&"**"===e[o]&&t[r]===e[o+1])i.push(e[o]),o++;else if("*"!==t[r]||!e[o]||!this.options.dot&&e[o].startsWith(".")||"**"===e[o]){if("*"!==e[o]||!t[r]||!this.options.dot&&t[r].startsWith(".")||"**"===t[r])return!1;if("a"===s)return!1;s="b",i.push(e[o]),r++,o++}else{if("b"===s)return!1;s="a",i.push(t[r]),r++,o++}return t.length===e.length&&i}parseNegate(){if(this.nonegate)return;const t=this.pattern;let e=!1,n=0;for(let r=0;r<t.length&&"!"===t.charAt(r);r++)e=!e,n++;n&&(this.pattern=t.slice(n)),this.negate=e}matchOne(t,e){let n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];const r=this.options;if(this.isWindows){const n="string"==typeof t[0]&&/^[a-z]:$/i.test(t[0]),r=!n&&""===t[0]&&""===t[1]&&"?"===t[2]&&/^[a-z]:$/i.test(t[3]),o="string"==typeof e[0]&&/^[a-z]:$/i.test(e[0]),i=r?3:n?0:void 0,s=!o&&""===e[0]&&""===e[1]&&"?"===e[2]&&"string"==typeof e[3]&&/^[a-z]:$/i.test(e[3])?3:o?0:void 0;if("number"==typeof i&&"number"==typeof s){const[n,r]=[t[i],e[s]];n.toLowerCase()===r.toLowerCase()&&(e[s]=n,s>i?e=e.slice(s):i>s&&(t=t.slice(i)))}}const{optimizationLevel:o=1}=this.options;o>=2&&(t=this.levelTwoFileOptimize(t)),this.debug("matchOne",this,{file:t,pattern:e}),this.debug("matchOne",t.length,e.length);for(var i=0,s=0,a=t.length,u=e.length;i<a&&s<u;i++,s++){this.debug("matchOne loop");var c=e[s],l=t[i];if(this.debug(e,c,l),!1===c)return!1;if(c===Bt){this.debug("GLOBSTAR",[e,c,l]);var h=i,p=s+1;if(p===u){for(this.debug("** at the end");i<a;i++)if("."===t[i]||".."===t[i]||!r.dot&&"."===t[i].charAt(0))return!1;return!0}for(;h<a;){var f=t[h];if(this.debug("\nglobstar while",t,h,e,p,f),this.matchOne(t.slice(h),e.slice(p),n))return this.debug("globstar found match!",h,a,f),!0;if("."===f||".."===f||!r.dot&&"."===f.charAt(0)){this.debug("dot detected!",t,h,e,p);break}this.debug("globstar swallow a segment, and continue"),h++}return!(!n||(this.debug("\n>>> no match, partial?",t,h,e,p),h!==a))}let o;if("string"==typeof c?(o=l===c,this.debug("string match",c,l,o)):(o=c.test(l),this.debug("pattern match",c,l,o)),!o)return!1}if(i===a&&s===u)return!0;if(i===a)return n;if(s===u)return i===a-1&&""===t[i];throw new Error("wtf?")}braceExpand(){return Wt(this.pattern,this.options)}parse(t){rt(t);const e=this.options;if("**"===t)return Bt;if(""===t)return"";let n,r=null;(n=t.match($t))?r=e.dot?It:Ct:(n=t.match(wt))?r=(e.nocase?e.dot?Pt:At:e.dot?Nt:xt)(n[1]):(n=t.match(kt))?r=(e.nocase?e.dot?Lt:Rt:e.dot?_t:Mt)(n):(n=t.match(Ot))?r=e.dot?Tt:Et:(n=t.match(jt))&&(r=St);const o=vt.fromGlob(t,this.options).toMMPattern();return r&&"object"==typeof o&&Reflect.defineProperty(o,"test",{value:r}),o}makeRe(){if(this.regexp||!1===this.regexp)return this.regexp;const t=this.set;if(!t.length)return this.regexp=!1,this.regexp;const e=this.options,n=e.noglobstar?"[^/]*?":e.dot?"(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?":"(?:(?!(?:\\/|^)\\.).)*?",r=new Set(e.nocase?["i"]:[]);let o=t.map((t=>{const e=t.map((t=>{if(t instanceof RegExp)for(const e of t.flags.split(""))r.add(e);return"string"==typeof t?t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"):t===Bt?Bt:t._src}));return e.forEach(((t,r)=>{const o=e[r+1],i=e[r-1];t===Bt&&i!==Bt&&(void 0===i?void 0!==o&&o!==Bt?e[r+1]="(?:\\/|"+n+"\\/)?"+o:e[r]=n:void 0===o?e[r-1]=i+"(?:\\/|"+n+")?":o!==Bt&&(e[r-1]=i+"(?:\\/|\\/"+n+"\\/)"+o,e[r+1]=Bt))})),e.filter((t=>t!==Bt)).join("/")})).join("|");const[i,s]=t.length>1?["(?:",")"]:["",""];o="^"+i+o+s+"$",this.negate&&(o="^(?!"+o+").+$");try{this.regexp=new RegExp(o,[...r].join(""))}catch(t){this.regexp=!1}return this.regexp}slashSplit(t){return this.preserveMultipleSlashes?t.split("/"):this.isWindows&&/^\/\/[^\/]+/.test(t)?["",...t.split(/\/+/)]:t.split(/\/+/)}match(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.partial;if(this.debug("match",t,this.pattern),this.comment)return!1;if(this.empty)return""===t;if("/"===t&&e)return!0;const n=this.options;this.isWindows&&(t=t.split("\\").join("/"));const r=this.slashSplit(t);this.debug(this.pattern,"split",r);const o=this.set;this.debug(this.pattern,"set",o);let i=r[r.length-1];if(!i)for(let t=r.length-2;!i&&t>=0;t--)i=r[t];for(let t=0;t<o.length;t++){const s=o[t];let a=r;if(n.matchBase&&1===s.length&&(a=[i]),this.matchOne(a,s,e))return!!n.flipNegate||!this.negate}return!n.flipNegate&&this.negate}static defaults(t){return bt.defaults(t).Minimatch}}function qt(t){const e=new Error(`${arguments.length>1&&void 0!==arguments[1]?arguments[1]:""}Invalid response: ${t.status} ${t.statusText}`);return e.status=t.status,e.response=t,e}function Ht(t,e){const{status:n}=e;if(401===n&&t.digest)return e;if(n>=400)throw qt(e);return e}function Xt(t,e){return arguments.length>2&&void 0!==arguments[2]&&arguments[2]?{data:e,headers:t.headers?W(t.headers):{},status:t.status,statusText:t.statusText}:e}bt.AST=vt,bt.Minimatch=Gt,bt.escape=function(t){let{windowsPathsNoEscape:e=!1}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return e?t.replace(/[?*()[\]]/g,"[$&]"):t.replace(/[?*()[\]\\]/g,"\\$&")},bt.unescape=ut;const Zt=(Yt=function(t,e,n){let r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};const o=tt({url:y(t.remoteURL,f(e)),method:"COPY",headers:{Destination:y(t.remoteURL,f(n)),Overwrite:!1===r.overwrite?"F":"T",Depth:r.shallow?"0":"infinity"}},t,r);return s=function(e){Ht(t,e)},(i=Q(o,t))&&i.then||(i=Promise.resolve(i)),s?i.then(s):i;// removed by dead control flow
 var i, s; },function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];try{return Promise.resolve(Yt.apply(this,t))}catch(t){return Promise.reject(t)}});var Yt,Kt=n(635),Jt=n(829),Qt=n.n(Jt),te=function(t){return t.Array="array",t.Object="object",t.Original="original",t}(te||{});function ee(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:te.Original;const r=Qt().get(t,e);return"array"===n&&!1===Array.isArray(r)?[r]:"object"===n&&Array.isArray(r)?r[0]:r}function ne(t){return new Promise((e=>{e(function(t){const{multistatus:e}=t;if(""===e)return{multistatus:{response:[]}};if(!e)throw new Error("Invalid response: No root multistatus found");const n={multistatus:Array.isArray(e)?e[0]:e};return Qt().set(n,"multistatus.response",ee(n,"multistatus.response",te.Array)),Qt().set(n,"multistatus.response",Qt().get(n,"multistatus.response").map((t=>function(t){const e=Object.assign({},t);return e.status?Qt().set(e,"status",ee(e,"status",te.Object)):(Qt().set(e,"propstat",ee(e,"propstat",te.Object)),Qt().set(e,"propstat.prop",ee(e,"propstat.prop",te.Object))),e}(t)))),n}(new Kt.XMLParser({allowBooleanAttributes:!0,attributeNamePrefix:"",textNodeName:"text",ignoreAttributes:!1,removeNSPrefix:!0,numberParseOptions:{hex:!0,leadingZeros:!1},attributeValueProcessor:(t,e,n)=>"true"===e||"false"===e?"true"===e:e,tagValueProcessor(t,e,n){if(!n.endsWith("propstat.prop.displayname"))return e}}).parse(t)))}))}function re(t,e){let n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];const{getlastmodified:r=null,getcontentlength:o="0",resourcetype:i=null,getcontenttype:s=null,getetag:a=null}=t,u=i&&"object"==typeof i&&void 0!==i.collection?"directory":"file",c={filename:e,basename:l().basename(e),lastmod:r,size:parseInt(o,10),type:u,etag:"string"==typeof a?a.replace(/"/g,""):null};return"file"===u&&(c.mime=s&&"string"==typeof s?s.split(";")[0]:""),n&&(void 0!==t.displayname&&(t.displayname=String(t.displayname)),c.props=t),c}function oe(t,e){let n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],r=null;try{t.multistatus.response[0].propstat&&(r=t.multistatus.response[0])}catch(t){}if(!r)throw new Error("Failed getting item stat: bad response");const{propstat:{prop:o,status:i}}=r,[s,a,u]=i.split(" ",3),c=parseInt(a,10);if(c>=400){const t=new Error(`Invalid response: ${c} ${u}`);throw t.status=c,t}return re(o,g(e),n)}function ie(t){switch(String(t)){case"-3":return"unlimited";case"-2":case"-1":return"unknown";default:return parseInt(String(t),10)}}function se(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}const ae=function(t){return function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const{details:r=!1}=n,o=tt({url:y(t.remoteURL,f(e)),method:"PROPFIND",headers:{Accept:"text/plain,application/xml",Depth:"0"}},t,n);return se(Q(o,t),(function(n){return Ht(t,n),se(n.text(),(function(t){return se(ne(t),(function(t){const o=oe(t,e,r);return Xt(n,o,r)}))}))}))}));function ue(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}const ce=le((function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const r=function(t){if(!t||"/"===t)return[];let e=t;const n=[];do{n.push(e),e=l().dirname(e)}while(e&&"/"!==e);return n}(g(e));r.sort(((t,e)=>t.length>e.length?1:e.length>t.length?-1:0));let o=!1;return function(t,e,n){if("function"==typeof t[fe]){var r,o,i,s=t[fe]();function l(t){try{for(;!(r=s.next()).done;)if((t=e(r.value))&&t.then){if(!me(t))return void t.then(l,i||(i=de.bind(null,o=new ge,2)));t=t.v}o?de(o,1,t):o=t}catch(t){de(o||(o=new ge),2,t)}}if(l(),s.return){var a=function(t){try{r.done||s.return()}catch(t){}return t};if(o&&o.then)return o.then(a,(function(t){throw a(t)}));a()}return o}if(!("length"in t))throw new TypeError("Object is not iterable");for(var u=[],c=0;c<t.length;c++)u.push(t[c]);return function(t,e,n){var r,o,i=-1;return function s(a){try{for(;++i<t.length&&(!n||!n());)if((a=e(i))&&a.then){if(!me(a))return void a.then(s,o||(o=de.bind(null,r=new ge,2)));a=a.v}r?de(r,1,a):r=a}catch(t){de(r||(r=new ge),2,t)}}(),r}(u,(function(t){return e(u[t])}),n)}(r,(function(r){return i=function(){return function(n,o){try{var i=ue(ae(t,r),(function(t){if("directory"!==t.type)throw new Error(`Path includes a file: ${e}`)}))}catch(t){return o(t)}return i&&i.then?i.then(void 0,o):i}(0,(function(e){const i=e;return function(){if(404===i.status)return o=!0,pe(ye(t,r,{...n,recursive:!1}));throw e}()}))},(s=function(){if(o)return pe(ye(t,r,{...n,recursive:!1}))}())&&s.then?s.then(i):i();// removed by dead control flow
 var i, s; }),(function(){return!1}))}));function le(t){return function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}function he(){}function pe(t,e){if(!e)return t&&t.then?t.then(he):Promise.resolve()}const fe="undefined"!=typeof Symbol?Symbol.iterator||(Symbol.iterator=Symbol("Symbol.iterator")):"@@iterator";function de(t,e,n){if(!t.s){if(n instanceof ge){if(!n.s)return void(n.o=de.bind(null,t,e));1&e&&(e=n.s),n=n.v}if(n&&n.then)return void n.then(de.bind(null,t,e),de.bind(null,t,2));t.s=e,t.v=n;const r=t.o;r&&r(t)}}const ge=function(){function t(){}return t.prototype.then=function(e,n){const r=new t,o=this.s;if(o){const t=1&o?e:n;if(t){try{de(r,1,t(this.v))}catch(t){de(r,2,t)}return r}return this}return this.o=function(t){try{const o=t.v;1&t.s?de(r,1,e?e(o):o):n?de(r,1,n(o)):de(r,2,o)}catch(t){de(r,2,t)}},r},t}();function me(t){return t instanceof ge&&1&t.s}const ye=le((function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};if(!0===n.recursive)return ce(t,e,n);const r=tt({url:y(t.remoteURL,(o=f(e),o.endsWith("/")?o:o+"/")),method:"MKCOL"},t,n);var o;return ue(Q(r,t),(function(e){Ht(t,e)}))}));var ve=n(388),be=n.n(ve);const we=function(t){return function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const r={};if("object"==typeof n.range&&"number"==typeof n.range.start){let t=`bytes=${n.range.start}-`;"number"==typeof n.range.end&&(t=`${t}${n.range.end}`),r.Range=t}const o=tt({url:y(t.remoteURL,f(e)),method:"GET",headers:r},t,n);return s=function(e){if(Ht(t,e),r.Range&&206!==e.status){const t=new Error(`Invalid response code for partial request: ${e.status}`);throw t.status=e.status,t}return n.callback&&setTimeout((()=>{n.callback(e)}),0),e.body},(i=Q(o,t))&&i.then||(i=Promise.resolve(i)),s?i.then(s):i;// removed by dead control flow
 var i, s; })),xe=()=>{},Ne=function(t){return function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e,n){n.url||(n.url=y(t.remoteURL,f(e)));const r=tt(n,t,{});return i=function(e){return Ht(t,e),e},(o=Q(r,t))&&o.then||(o=Promise.resolve(o)),i?o.then(i):o;// removed by dead control flow
 var o, i; })),Ae=function(t){return function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const r=tt({url:y(t.remoteURL,f(e)),method:"DELETE"},t,n);return i=function(e){Ht(t,e)},(o=Q(r,t))&&o.then||(o=Promise.resolve(o)),i?o.then(i):o;// removed by dead control flow
 var o, i; })),Pe=function(t){return function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return function(r,o){try{var i=(s=ae(t,e,n),a=function(){return!0},u?a?a(s):s:(s&&s.then||(s=Promise.resolve(s)),a?s.then(a):s))}catch(t){return o(t)}var s,a,u;return i&&i.then?i.then(void 0,o):i}(0,(function(t){if(404===t.status)return!1;throw t}))}));function Oe(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}const Ee=function(t){return function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const r=tt({url:y(t.remoteURL,f(e),"/"),method:"PROPFIND",headers:{Accept:"text/plain,application/xml",Depth:n.deep?"infinity":"1"}},t,n);return Oe(Q(r,t),(function(r){return Ht(t,r),Oe(r.text(),(function(o){if(!o)throw new Error("Failed parsing directory contents: Empty response");return Oe(ne(o),(function(o){const i=d(e);let s=function(t,e,n){let r=arguments.length>3&&void 0!==arguments[3]&&arguments[3],o=arguments.length>4&&void 0!==arguments[4]&&arguments[4];const i=l().join(e,"/"),{multistatus:{response:s}}=t,a=s.map((t=>{const e=function(t){try{return t.replace(/^https?:\/\/[^\/]+/,"")}catch(t){throw new u(t,"Failed normalising HREF")}}(t.href),{propstat:{prop:n}}=t;return re(n,"/"===i?decodeURIComponent(g(e)):g(l().relative(decodeURIComponent(i),decodeURIComponent(e))),r)}));return o?a:a.filter((t=>t.basename&&("file"===t.type||t.filename!==n.replace(/\/$/,""))))}(o,d(t.remoteBasePath||t.remotePath),i,n.details,n.includeSelf);return n.glob&&(s=function(t,e){return t.filter((t=>bt(t.filename,e,{matchBase:!0})))}(s,n.glob)),Xt(r,s,n.details)}))}))}))}));function Te(t){return function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}const je=Te((function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const r=tt({url:y(t.remoteURL,f(e)),method:"GET",headers:{Accept:"text/plain"},transformResponse:[Ie]},t,n);return Se(Q(r,t),(function(e){return Ht(t,e),Se(e.text(),(function(t){return Xt(e,t,n.details)}))}))}));function Se(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}const $e=Te((function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const r=tt({url:y(t.remoteURL,f(e)),method:"GET"},t,n);return Se(Q(r,t),(function(e){let r;return Ht(t,e),function(t,e){var n=t();return n&&n.then?n.then(e):e()}((function(){return Se(e.arrayBuffer(),(function(t){r=t}))}),(function(){return Xt(e,r,n.details)}))}))})),Ce=Te((function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const{format:r="binary"}=n;if("binary"!==r&&"text"!==r)throw new u({info:{code:I.InvalidOutputFormat}},`Invalid output format: ${r}`);return"text"===r?je(t,e,n):$e(t,e,n)})),Ie=t=>t;function ke(t){return new Kt.XMLBuilder({attributeNamePrefix:"@_",format:!0,ignoreAttributes:!1,suppressEmptyNode:!0}).build(Re({lockinfo:{"@_xmlns:d":"DAV:",lockscope:{exclusive:{}},locktype:{write:{}},owner:{href:t}}},"d"))}function Re(t,e){const n={...t};for(const t in n)n.hasOwnProperty(t)&&(n[t]&&"object"==typeof n[t]&&-1===t.indexOf(":")?(n[`${e}:${t}`]=Re(n[t],e),delete n[t]):!1===/^@_/.test(t)&&(n[`${e}:${t}`]=n[t],delete n[t]));return n}function Le(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}function _e(t){return function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}const Me=_e((function(t,e,n){let r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};const o=tt({url:y(t.remoteURL,f(e)),method:"UNLOCK",headers:{"Lock-Token":n}},t,r);return Le(Q(o,t),(function(e){if(Ht(t,e),204!==e.status&&200!==e.status)throw qt(e)}))})),Ue=_e((function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const{refreshToken:r,timeout:o=Fe}=n,i={Accept:"text/plain,application/xml",Timeout:o};r&&(i.If=r);const s=tt({url:y(t.remoteURL,f(e)),method:"LOCK",headers:i,data:ke(t.contactHref)},t,n);return Le(Q(s,t),(function(e){return Ht(t,e),Le(e.text(),(function(t){const n=(i=t,new Kt.XMLParser({removeNSPrefix:!0,parseAttributeValue:!0,parseTagValue:!0}).parse(i)),r=Qt().get(n,"prop.lockdiscovery.activelock.locktoken.href"),o=Qt().get(n,"prop.lockdiscovery.activelock.timeout");var i;if(!r)throw qt(e,"No lock token received: ");return{token:r,serverTimeout:o}}))}))})),Fe="Infinite, Second-4100000000";function De(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}const Be=function(t){return function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const n=e.path||"/",r=tt({url:y(t.remoteURL,n),method:"PROPFIND",headers:{Accept:"text/plain,application/xml",Depth:"0"}},t,e);return De(Q(r,t),(function(n){return Ht(t,n),De(n.text(),(function(t){return De(ne(t),(function(t){const r=function(t){try{const[e]=t.multistatus.response,{propstat:{prop:{"quota-used-bytes":n,"quota-available-bytes":r}}}=e;return void 0!==n&&void 0!==r?{used:parseInt(String(n),10),available:ie(r)}:null}catch(t){}return null}(t);return Xt(n,r,e.details)}))}))}))}));function Ve(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}const We=function(t){return function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const{details:r=!1}=n,o=tt({url:y(t.remoteURL,f(e)),method:"SEARCH",headers:{Accept:"text/plain,application/xml","Content-Type":t.headers["Content-Type"]||"application/xml; charset=utf-8"}},t,n);return Ve(Q(o,t),(function(n){return Ht(t,n),Ve(n.text(),(function(t){return Ve(ne(t),(function(t){const o=function(t,e,n){const r={truncated:!1,results:[]};return r.truncated=t.multistatus.response.some((t=>"507"===(t.status||t.propstat?.status).split(" ",3)?.[1]&&t.href.replace(/\/$/,"").endsWith(f(e).replace(/\/$/,"")))),t.multistatus.response.forEach((t=>{if(void 0===t.propstat)return;const e=t.href.split("/").map(decodeURIComponent).join("/");r.results.push(re(t.propstat.prop,e,n))})),r}(t,e,r);return Xt(n,o,r)}))}))}))})),ze=function(t){return function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e,n){let r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};const o=tt({url:y(t.remoteURL,f(e)),method:"MOVE",headers:{Destination:y(t.remoteURL,f(n)),Overwrite:!1===r.overwrite?"F":"T"}},t,r);return s=function(e){Ht(t,e)},(i=Q(o,t))&&i.then||(i=Promise.resolve(i)),s?i.then(s):i;// removed by dead control flow
 var i, s; }));var Ge=n(172);const qe=function(t){return function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e,n){let r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};const{contentLength:o=!0,overwrite:i=!0}=r,s={"Content-Type":"application/octet-stream"};!1===o||(s["Content-Length"]="number"==typeof o?`${o}`:`${function(t){if(H(t))return t.byteLength;if(X(t))return t.length;if("string"==typeof t)return(0,Ge.d)(t);throw new u({info:{code:I.DataTypeNoLength}},"Cannot calculate data length: Invalid type")}(n)}`),i||(s["If-None-Match"]="*");const a=tt({url:y(t.remoteURL,f(e)),method:"PUT",headers:s,data:n},t,r);return l=function(e){try{Ht(t,e)}catch(t){const e=t;if(412!==e.status||i)throw e;return!1}return!0},(c=Q(a,t))&&c.then||(c=Promise.resolve(c)),l?c.then(l):c;// removed by dead control flow
 var c, l; })),He=function(t){return function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const r=tt({url:y(t.remoteURL,f(e)),method:"OPTIONS"},t,n);return i=function(e){try{Ht(t,e)}catch(t){throw t}return{compliance:(e.headers.get("DAV")??"").split(",").map((t=>t.trim())),server:e.headers.get("Server")??""}},(o=Q(r,t))&&o.then||(o=Promise.resolve(o)),i?o.then(i):o;// removed by dead control flow
 var o, i; }));function Xe(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}const Ze=Je((function(t,e,n,r,o){let i=arguments.length>5&&void 0!==arguments[5]?arguments[5]:{};if(n>r||n<0)throw new u({info:{code:I.InvalidUpdateRange}},`Invalid update range ${n} for partial update`);const s={"Content-Type":"application/octet-stream","Content-Length":""+(r-n+1),"Content-Range":`bytes ${n}-${r}/*`},a=tt({url:y(t.remoteURL,f(e)),method:"PUT",headers:s,data:o},t,i);return Xe(Q(a,t),(function(e){Ht(t,e)}))}));function Ye(t,e){var n=t();return n&&n.then?n.then(e):e(n)}const Ke=Je((function(t,e,n,r,o){let i=arguments.length>5&&void 0!==arguments[5]?arguments[5]:{};if(n>r||n<0)throw new u({info:{code:I.InvalidUpdateRange}},`Invalid update range ${n} for partial update`);const s={"Content-Type":"application/x-sabredav-partialupdate","Content-Length":""+(r-n+1),"X-Update-Range":`bytes=${n}-${r}`},a=tt({url:y(t.remoteURL,f(e)),method:"PATCH",headers:s,data:o},t,i);return Xe(Q(a,t),(function(e){Ht(t,e)}))}));function Je(t){return function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}const Qe=Je((function(t,e,n,r,o){let i=arguments.length>5&&void 0!==arguments[5]?arguments[5]:{};return Xe(He(t,e,i),(function(s){let a=!1;return Ye((function(){if(s.compliance.includes("sabredav-partialupdate"))return Xe(Ke(t,e,n,r,o,i),(function(t){return a=!0,t}))}),(function(c){let l=!1;return a?c:Ye((function(){if(s.server.includes("Apache")&&s.compliance.includes("<http://apache.org/dav/propset/fs/1>"))return Xe(Ze(t,e,n,r,o,i),(function(t){return l=!0,t}))}),(function(t){if(l)return t;throw new u({info:{code:I.NotSupported}},"Not supported")}))}))}))})),tn="https://github.com/perry-mitchell/webdav-client/blob/master/LOCK_CONTACT.md";function en(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const{authType:n=null,remoteBasePath:r,contactHref:o=tn,ha1:i,headers:s={},httpAgent:a,httpsAgent:c,password:l,token:h,username:p,withCredentials:d}=e;let g=n;g||(g=p||l?C.Password:C.None);const v={authType:g,remoteBasePath:r,contactHref:o,ha1:i,headers:Object.assign({},s),httpAgent:a,httpsAgent:c,password:l,remotePath:m(t),remoteURL:t,token:h,username:p,withCredentials:d};return k(v,p,l,h,i),{copyFile:(t,e,n)=>Zt(v,t,e,n),createDirectory:(t,e)=>ye(v,t,e),createReadStream:(t,e)=>function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const r=new(0,be().PassThrough);return we(t,e,n).then((t=>{t.pipe(r)})).catch((t=>{r.emit("error",t)})),r}(v,t,e),createWriteStream:(t,e,n)=>function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:xe;const o=new(0,be().PassThrough),i={};!1===n.overwrite&&(i["If-None-Match"]="*");const s=tt({url:y(t.remoteURL,f(e)),method:"PUT",headers:i,data:o,maxRedirects:0},t,n);return Q(s,t).then((e=>Ht(t,e))).then((t=>{setTimeout((()=>{r(t)}),0)})).catch((t=>{o.emit("error",t)})),o}(v,t,e,n),customRequest:(t,e)=>Ne(v,t,e),deleteFile:(t,e)=>Ae(v,t,e),exists:(t,e)=>Pe(v,t,e),getDirectoryContents:(t,e)=>Ee(v,t,e),getFileContents:(t,e)=>Ce(v,t,e),getFileDownloadLink:t=>function(t,e){let n=y(t.remoteURL,f(e));const r=/^https:/i.test(n)?"https":"http";switch(t.authType){case C.None:break;case C.Password:{const e=O(t.headers.Authorization.replace(/^Basic /i,"").trim());n=n.replace(/^https?:\/\//,`${r}://${e}@`);break}default:throw new u({info:{code:I.LinkUnsupportedAuthType}},`Unsupported auth type for file link: ${t.authType}`)}return n}(v,t),getFileUploadLink:t=>function(t,e){let n=`${y(t.remoteURL,f(e))}?Content-Type=application/octet-stream`;const r=/^https:/i.test(n)?"https":"http";switch(t.authType){case C.None:break;case C.Password:{const e=O(t.headers.Authorization.replace(/^Basic /i,"").trim());n=n.replace(/^https?:\/\//,`${r}://${e}@`);break}default:throw new u({info:{code:I.LinkUnsupportedAuthType}},`Unsupported auth type for file link: ${t.authType}`)}return n}(v,t),getHeaders:()=>Object.assign({},v.headers),getQuota:t=>Be(v,t),lock:(t,e)=>Ue(v,t,e),moveFile:(t,e,n)=>ze(v,t,e,n),putFileContents:(t,e,n)=>qe(v,t,e,n),partialUpdateFileContents:(t,e,n,r,o)=>Qe(v,t,e,n,r,o),getDAVCompliance:t=>He(v,t),search:(t,e)=>We(v,t,e),setHeaders:t=>{v.headers=Object.assign({},t)},stat:(t,e)=>ae(v,t,e),unlock:(t,e,n)=>Me(v,t,e,n)}}var nn=r.hT,rn=r.O4,on=r.Kd,sn=r.YK,an=r.UU,un=r.Gu,cn=r.ky,ln=r.h4,hn=r.ch,pn=r.hq,fn=r.i5;

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!*****************!*\
  !*** ./init.js ***!
  \*****************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _nextcloud_files_dav__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @nextcloud/files/dav */ "../node_modules/@nextcloud/files/dist/dav.mjs");
/**
 * Nextcloud - Files_PhotoSpheres
 *
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Robin Windey <ro.windey@gmail.com>
 *
 * @copyright Robin Windey 2023
 *
 * Init script for the app
 */


(0,_nextcloud_files_dav__WEBPACK_IMPORTED_MODULE_0__.registerDavProperty)('nc:files-photospheres-xmp-metadata');
})();

/******/ })()
;
//# sourceMappingURL=init.js.map?v=64e80254a12732e2ddb9