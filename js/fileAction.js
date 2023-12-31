/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../node_modules/@nextcloud/auth/dist/index.js":
/*!*****************************************************!*\
  !*** ../node_modules/@nextcloud/auth/dist/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var eventBus = __webpack_require__(/*! @nextcloud/event-bus */ "../node_modules/@nextcloud/event-bus/dist/index.cjs");

var token = undefined;
var observers = [];
/**
 * Get current request token
 *
 * @return {string|null} Current request token or null if not set
 */
function getRequestToken() {
    if (token === undefined) {
        // Only on first load, try to get token from document
        var tokenElement = document === null || document === void 0 ? void 0 : document.getElementsByTagName('head')[0];
        token = tokenElement ? tokenElement.getAttribute('data-requesttoken') : null;
    }
    return token;
}
/**
 * Add an observer which is called when the CSRF token changes
 *
 * @param observer The observer
 */
function onRequestTokenUpdate(observer) {
    observers.push(observer);
}
// Listen to server event and keep token in sync
eventBus.subscribe('csrf-token-update', function (e) {
    token = e.token;
    observers.forEach(function (observer) {
        try {
            observer(e.token);
        }
        catch (e) {
            console.error('error updating CSRF token observer', e);
        }
    });
});

var getAttribute = function (el, attribute) {
    if (el) {
        return el.getAttribute(attribute);
    }
    return null;
};
var currentUser = undefined;
function getCurrentUser() {
    if (currentUser !== undefined) {
        return currentUser;
    }
    var head = document === null || document === void 0 ? void 0 : document.getElementsByTagName('head')[0];
    if (!head) {
        return null;
    }
    // No user logged in so cache and return null
    var uid = getAttribute(head, 'data-user');
    if (uid === null) {
        currentUser = null;
        return currentUser;
    }
    currentUser = {
        uid: uid,
        displayName: getAttribute(head, 'data-user-displayname'),
        isAdmin: !!window._oc_isadmin,
    };
    return currentUser;
}

exports.getCurrentUser = getCurrentUser;
exports.getRequestToken = getRequestToken;
exports.onRequestTokenUpdate = onRequestTokenUpdate;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ "../node_modules/@nextcloud/event-bus/node_modules/semver/classes/semver.js":
/*!**********************************************************************************!*\
  !*** ../node_modules/@nextcloud/event-bus/node_modules/semver/classes/semver.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const debug = __webpack_require__(/*! ../internal/debug */ "../node_modules/@nextcloud/event-bus/node_modules/semver/internal/debug.js")
const { MAX_LENGTH, MAX_SAFE_INTEGER } = __webpack_require__(/*! ../internal/constants */ "../node_modules/@nextcloud/event-bus/node_modules/semver/internal/constants.js")
const { safeRe: re, t } = __webpack_require__(/*! ../internal/re */ "../node_modules/@nextcloud/event-bus/node_modules/semver/internal/re.js")

const parseOptions = __webpack_require__(/*! ../internal/parse-options */ "../node_modules/@nextcloud/event-bus/node_modules/semver/internal/parse-options.js")
const { compareIdentifiers } = __webpack_require__(/*! ../internal/identifiers */ "../node_modules/@nextcloud/event-bus/node_modules/semver/internal/identifiers.js")
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

    return (
      compareIdentifiers(this.major, other.major) ||
      compareIdentifiers(this.minor, other.minor) ||
      compareIdentifiers(this.patch, other.patch)
    )
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

  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc (release, identifier, identifierBase) {
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

        if (!identifier && identifierBase === false) {
          throw new Error('invalid increment argument: identifier is empty')
        }

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


/***/ }),

/***/ "../node_modules/@nextcloud/event-bus/node_modules/semver/functions/major.js":
/*!***********************************************************************************!*\
  !*** ../node_modules/@nextcloud/event-bus/node_modules/semver/functions/major.js ***!
  \***********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const SemVer = __webpack_require__(/*! ../classes/semver */ "../node_modules/@nextcloud/event-bus/node_modules/semver/classes/semver.js")
const major = (a, loose) => new SemVer(a, loose).major
module.exports = major


/***/ }),

/***/ "../node_modules/@nextcloud/event-bus/node_modules/semver/functions/parse.js":
/*!***********************************************************************************!*\
  !*** ../node_modules/@nextcloud/event-bus/node_modules/semver/functions/parse.js ***!
  \***********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const SemVer = __webpack_require__(/*! ../classes/semver */ "../node_modules/@nextcloud/event-bus/node_modules/semver/classes/semver.js")
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


/***/ }),

/***/ "../node_modules/@nextcloud/event-bus/node_modules/semver/functions/valid.js":
/*!***********************************************************************************!*\
  !*** ../node_modules/@nextcloud/event-bus/node_modules/semver/functions/valid.js ***!
  \***********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const parse = __webpack_require__(/*! ./parse */ "../node_modules/@nextcloud/event-bus/node_modules/semver/functions/parse.js")
const valid = (version, options) => {
  const v = parse(version, options)
  return v ? v.version : null
}
module.exports = valid


/***/ }),

/***/ "../node_modules/@nextcloud/event-bus/node_modules/semver/internal/constants.js":
/*!**************************************************************************************!*\
  !*** ../node_modules/@nextcloud/event-bus/node_modules/semver/internal/constants.js ***!
  \**************************************************************************************/
/***/ ((module) => {

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


/***/ }),

/***/ "../node_modules/@nextcloud/event-bus/node_modules/semver/internal/debug.js":
/*!**********************************************************************************!*\
  !*** ../node_modules/@nextcloud/event-bus/node_modules/semver/internal/debug.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var process = __webpack_require__(/*! process/browser.js */ "../node_modules/process/browser.js");
const debug = (
  typeof process === 'object' &&
  process.env &&
  process.env.NODE_DEBUG &&
  /\bsemver\b/i.test(process.env.NODE_DEBUG)
) ? (...args) => console.error('SEMVER', ...args)
  : () => {}

module.exports = debug


/***/ }),

/***/ "../node_modules/@nextcloud/event-bus/node_modules/semver/internal/identifiers.js":
/*!****************************************************************************************!*\
  !*** ../node_modules/@nextcloud/event-bus/node_modules/semver/internal/identifiers.js ***!
  \****************************************************************************************/
/***/ ((module) => {

const numeric = /^[0-9]+$/
const compareIdentifiers = (a, b) => {
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


/***/ }),

/***/ "../node_modules/@nextcloud/event-bus/node_modules/semver/internal/parse-options.js":
/*!******************************************************************************************!*\
  !*** ../node_modules/@nextcloud/event-bus/node_modules/semver/internal/parse-options.js ***!
  \******************************************************************************************/
/***/ ((module) => {

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


/***/ }),

/***/ "../node_modules/@nextcloud/event-bus/node_modules/semver/internal/re.js":
/*!*******************************************************************************!*\
  !*** ../node_modules/@nextcloud/event-bus/node_modules/semver/internal/re.js ***!
  \*******************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

const {
  MAX_SAFE_COMPONENT_LENGTH,
  MAX_SAFE_BUILD_LENGTH,
  MAX_LENGTH,
} = __webpack_require__(/*! ./constants */ "../node_modules/@nextcloud/event-bus/node_modules/semver/internal/constants.js")
const debug = __webpack_require__(/*! ./debug */ "../node_modules/@nextcloud/event-bus/node_modules/semver/internal/debug.js")
exports = module.exports = {}

// The actual regexps go on exports.re
const re = exports.re = []
const safeRe = exports.safeRe = []
const src = exports.src = []
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

createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]
}|${src[t.NONNUMERICIDENTIFIER]})`)

createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]
}|${src[t.NONNUMERICIDENTIFIER]})`)

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
createToken('COERCE', `${'(^|[^\\d])' +
              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
              `(?:$|[^\\d])`)
createToken('COERCERTL', src[t.COERCE], true)

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


/***/ }),

/***/ "../node_modules/@nextcloud/logger/dist/ConsoleLogger.js":
/*!***************************************************************!*\
  !*** ../node_modules/@nextcloud/logger/dist/ConsoleLogger.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


__webpack_require__(/*! core-js/modules/es.object.define-property.js */ "../node_modules/core-js/modules/es.object.define-property.js");
__webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "../node_modules/core-js/modules/es.symbol.iterator.js");
__webpack_require__(/*! core-js/modules/es.array.iterator.js */ "../node_modules/core-js/modules/es.array.iterator.js");
__webpack_require__(/*! core-js/modules/es.string.iterator.js */ "../node_modules/core-js/modules/es.string.iterator.js");
__webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "../node_modules/core-js/modules/web.dom-collections.iterator.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ConsoleLogger = void 0;
exports.buildConsoleLogger = buildConsoleLogger;
__webpack_require__(/*! core-js/modules/es.object.assign.js */ "../node_modules/core-js/modules/es.object.assign.js");
__webpack_require__(/*! core-js/modules/es.symbol.to-primitive.js */ "../node_modules/core-js/modules/es.symbol.to-primitive.js");
__webpack_require__(/*! core-js/modules/es.date.to-primitive.js */ "../node_modules/core-js/modules/es.date.to-primitive.js");
__webpack_require__(/*! core-js/modules/es.symbol.js */ "../node_modules/core-js/modules/es.symbol.js");
__webpack_require__(/*! core-js/modules/es.symbol.description.js */ "../node_modules/core-js/modules/es.symbol.description.js");
__webpack_require__(/*! core-js/modules/es.object.to-string.js */ "../node_modules/core-js/modules/es.object.to-string.js");
__webpack_require__(/*! core-js/modules/es.number.constructor.js */ "../node_modules/core-js/modules/es.number.constructor.js");
var _contracts = __webpack_require__(/*! ./contracts */ "../node_modules/@nextcloud/logger/dist/contracts.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var ConsoleLogger = /*#__PURE__*/function () {
  function ConsoleLogger(context) {
    _classCallCheck(this, ConsoleLogger);
    _defineProperty(this, "context", void 0);
    this.context = context || {};
  }
  _createClass(ConsoleLogger, [{
    key: "formatMessage",
    value: function formatMessage(message, level, context) {
      var msg = '[' + _contracts.LogLevel[level].toUpperCase() + '] ';
      if (context && context.app) {
        msg += context.app + ': ';
      }
      if (typeof message === 'string') return msg + message;

      // basic error formatting
      msg += "Unexpected ".concat(message.name);
      if (message.message) msg += " \"".concat(message.message, "\"");
      // only add stack trace when debugging
      if (level === _contracts.LogLevel.Debug && message.stack) msg += "\n\nStack trace:\n".concat(message.stack);
      return msg;
    }
  }, {
    key: "log",
    value: function log(level, message, context) {
      var _this$context, _this$context2;
      // Skip if level is configured and this is below the level
      if (typeof ((_this$context = this.context) === null || _this$context === void 0 ? void 0 : _this$context.level) === 'number' && level < ((_this$context2 = this.context) === null || _this$context2 === void 0 ? void 0 : _this$context2.level)) {
        return;
      }

      // Add error object to context
      if (_typeof(message) === 'object' && (context === null || context === void 0 ? void 0 : context.error) === undefined) {
        context.error = message;
      }
      switch (level) {
        case _contracts.LogLevel.Debug:
          console.debug(this.formatMessage(message, _contracts.LogLevel.Debug, context), context);
          break;
        case _contracts.LogLevel.Info:
          console.info(this.formatMessage(message, _contracts.LogLevel.Info, context), context);
          break;
        case _contracts.LogLevel.Warn:
          console.warn(this.formatMessage(message, _contracts.LogLevel.Warn, context), context);
          break;
        case _contracts.LogLevel.Error:
          console.error(this.formatMessage(message, _contracts.LogLevel.Error, context), context);
          break;
        case _contracts.LogLevel.Fatal:
        default:
          console.error(this.formatMessage(message, _contracts.LogLevel.Fatal, context), context);
          break;
      }
    }
  }, {
    key: "debug",
    value: function debug(message, context) {
      this.log(_contracts.LogLevel.Debug, message, Object.assign({}, this.context, context));
    }
  }, {
    key: "info",
    value: function info(message, context) {
      this.log(_contracts.LogLevel.Info, message, Object.assign({}, this.context, context));
    }
  }, {
    key: "warn",
    value: function warn(message, context) {
      this.log(_contracts.LogLevel.Warn, message, Object.assign({}, this.context, context));
    }
  }, {
    key: "error",
    value: function error(message, context) {
      this.log(_contracts.LogLevel.Error, message, Object.assign({}, this.context, context));
    }
  }, {
    key: "fatal",
    value: function fatal(message, context) {
      this.log(_contracts.LogLevel.Fatal, message, Object.assign({}, this.context, context));
    }
  }]);
  return ConsoleLogger;
}();
/**
 * Create a new console logger
 *
 * @param context Optional global context which should be included for all logging messages
 */
exports.ConsoleLogger = ConsoleLogger;
function buildConsoleLogger(context) {
  return new ConsoleLogger(context);
}
//# sourceMappingURL=ConsoleLogger.js.map

/***/ }),

/***/ "../node_modules/@nextcloud/logger/dist/LoggerBuilder.js":
/*!***************************************************************!*\
  !*** ../node_modules/@nextcloud/logger/dist/LoggerBuilder.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


__webpack_require__(/*! core-js/modules/es.object.define-property.js */ "../node_modules/core-js/modules/es.object.define-property.js");
__webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "../node_modules/core-js/modules/es.symbol.iterator.js");
__webpack_require__(/*! core-js/modules/es.array.iterator.js */ "../node_modules/core-js/modules/es.array.iterator.js");
__webpack_require__(/*! core-js/modules/es.string.iterator.js */ "../node_modules/core-js/modules/es.string.iterator.js");
__webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "../node_modules/core-js/modules/web.dom-collections.iterator.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.LoggerBuilder = void 0;
__webpack_require__(/*! core-js/modules/es.symbol.to-primitive.js */ "../node_modules/core-js/modules/es.symbol.to-primitive.js");
__webpack_require__(/*! core-js/modules/es.date.to-primitive.js */ "../node_modules/core-js/modules/es.date.to-primitive.js");
__webpack_require__(/*! core-js/modules/es.symbol.js */ "../node_modules/core-js/modules/es.symbol.js");
__webpack_require__(/*! core-js/modules/es.symbol.description.js */ "../node_modules/core-js/modules/es.symbol.description.js");
__webpack_require__(/*! core-js/modules/es.object.to-string.js */ "../node_modules/core-js/modules/es.object.to-string.js");
__webpack_require__(/*! core-js/modules/es.number.constructor.js */ "../node_modules/core-js/modules/es.number.constructor.js");
var _auth = __webpack_require__(/*! @nextcloud/auth */ "../node_modules/@nextcloud/auth/dist/index.js");
var _contracts = __webpack_require__(/*! ./contracts */ "../node_modules/@nextcloud/logger/dist/contracts.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * @notExported
 */
var LoggerBuilder = /*#__PURE__*/function () {
  function LoggerBuilder(factory) {
    _classCallCheck(this, LoggerBuilder);
    _defineProperty(this, "context", void 0);
    _defineProperty(this, "factory", void 0);
    this.context = {};
    this.factory = factory;
  }

  /**
   * Set the app name within the logging context
   *
   * @param appId App name
   */
  _createClass(LoggerBuilder, [{
    key: "setApp",
    value: function setApp(appId) {
      this.context.app = appId;
      return this;
    }

    /**
     * Set the logging level within the logging context
     *
     * @param level Logging level
     */
  }, {
    key: "setLogLevel",
    value: function setLogLevel(level) {
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
  }, {
    key: "setUid",
    value: function setUid(uid) {
      this.context.uid = uid;
      return this;
    }

    /**
     * Detect the currently logged in user and set the user id within the logging context
     */
  }, {
    key: "detectUser",
    value: function detectUser() {
      var user = (0, _auth.getCurrentUser)();
      if (user !== null) {
        this.context.uid = user.uid;
      }
      return this;
    }

    /**
     * Detect and use logging level configured in nextcloud config
     */
  }, {
    key: "detectLogLevel",
    value: function detectLogLevel() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var self = this;

      // Use arrow function to prevent undefined `this` within event handler
      var onLoaded = function onLoaded() {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          var _window$_oc_config$lo, _window$_oc_config;
          // Up to, including, nextcloud 24 the loglevel was not exposed
          self.context.level = (_window$_oc_config$lo = (_window$_oc_config = window._oc_config) === null || _window$_oc_config === void 0 ? void 0 : _window$_oc_config.loglevel) !== null && _window$_oc_config$lo !== void 0 ? _window$_oc_config$lo : _contracts.LogLevel.Warn;
          // Override loglevel if we are in debug mode
          if (window._oc_debug) {
            self.context.level = _contracts.LogLevel.Debug;
          }
          document.removeEventListener('readystatechange', onLoaded);
        } else {
          document.addEventListener('readystatechange', onLoaded);
        }
      };
      onLoaded();
      return this;
    }

    /** Build a logger using the logging context and factory */
  }, {
    key: "build",
    value: function build() {
      if (this.context.level === undefined) {
        // No logging level set manually, use the configured one
        this.detectLogLevel();
      }
      return this.factory(this.context);
    }
  }]);
  return LoggerBuilder;
}();
exports.LoggerBuilder = LoggerBuilder;
//# sourceMappingURL=LoggerBuilder.js.map

/***/ }),

/***/ "../node_modules/@nextcloud/logger/dist/contracts.js":
/*!***********************************************************!*\
  !*** ../node_modules/@nextcloud/logger/dist/contracts.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


__webpack_require__(/*! core-js/modules/es.object.define-property.js */ "../node_modules/core-js/modules/es.object.define-property.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.LogLevel = void 0;
var LogLevel = /*#__PURE__*/function (LogLevel) {
  LogLevel[LogLevel["Debug"] = 0] = "Debug";
  LogLevel[LogLevel["Info"] = 1] = "Info";
  LogLevel[LogLevel["Warn"] = 2] = "Warn";
  LogLevel[LogLevel["Error"] = 3] = "Error";
  LogLevel[LogLevel["Fatal"] = 4] = "Fatal";
  return LogLevel;
}({});
exports.LogLevel = LogLevel;
//# sourceMappingURL=contracts.js.map

/***/ }),

/***/ "../node_modules/@nextcloud/logger/dist/index.js":
/*!*******************************************************!*\
  !*** ../node_modules/@nextcloud/logger/dist/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


__webpack_require__(/*! core-js/modules/es.object.define-property.js */ "../node_modules/core-js/modules/es.object.define-property.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "LogLevel", ({
  enumerable: true,
  get: function get() {
    return _contracts.LogLevel;
  }
}));
exports.getLogger = getLogger;
exports.getLoggerBuilder = getLoggerBuilder;
var _ConsoleLogger = __webpack_require__(/*! ./ConsoleLogger */ "../node_modules/@nextcloud/logger/dist/ConsoleLogger.js");
var _LoggerBuilder = __webpack_require__(/*! ./LoggerBuilder */ "../node_modules/@nextcloud/logger/dist/LoggerBuilder.js");
var _contracts = __webpack_require__(/*! ./contracts */ "../node_modules/@nextcloud/logger/dist/contracts.js");
/**
 * Build a customized logger instance
 */
function getLoggerBuilder() {
  return new _LoggerBuilder.LoggerBuilder(_ConsoleLogger.buildConsoleLogger);
}

/**
 * Get a default logger instance without any configuration
 */
function getLogger() {
  return getLoggerBuilder().build();
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../node_modules/@nextcloud/paths/dist/index.js":
/*!******************************************************!*\
  !*** ../node_modules/@nextcloud/paths/dist/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.encodePath = encodePath;
exports.basename = basename;
exports.dirname = dirname;
exports.joinPaths = joinPaths;
exports.isSamePath = isSamePath;

__webpack_require__(/*! core-js/modules/es.array.map.js */ "../node_modules/core-js/modules/es.array.map.js");

__webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "../node_modules/core-js/modules/es.regexp.exec.js");

__webpack_require__(/*! core-js/modules/es.string.split.js */ "../node_modules/core-js/modules/es.string.split.js");

__webpack_require__(/*! core-js/modules/es.string.replace.js */ "../node_modules/core-js/modules/es.string.replace.js");

__webpack_require__(/*! core-js/modules/es.array.filter.js */ "../node_modules/core-js/modules/es.array.filter.js");

__webpack_require__(/*! core-js/modules/es.array.reduce.js */ "../node_modules/core-js/modules/es.array.reduce.js");

__webpack_require__(/*! core-js/modules/es.array.concat.js */ "../node_modules/core-js/modules/es.array.concat.js");

/**
 * URI-Encodes a file path but keep the path slashes.
 */
function encodePath(path) {
  if (!path) {
    return path;
  }

  return path.split('/').map(encodeURIComponent).join('/');
}
/**
 * Returns the base name of the given path.
 * For example for "/abc/somefile.txt" it will return "somefile.txt"
 */


function basename(path) {
  return path.replace(/\\/g, '/').replace(/.*\//, '');
}
/**
 * Returns the dir name of the given path.
 * For example for "/abc/somefile.txt" it will return "/abc"
 */


function dirname(path) {
  return path.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
}
/**
 * Join path sections
 */


function joinPaths() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (arguments.length < 1) {
    return '';
  } // discard empty arguments


  var nonEmptyArgs = args.filter(function (arg) {
    return arg.length > 0;
  });

  if (nonEmptyArgs.length < 1) {
    return '';
  }

  var lastArg = nonEmptyArgs[nonEmptyArgs.length - 1];
  var leadingSlash = nonEmptyArgs[0].charAt(0) === '/';
  var trailingSlash = lastArg.charAt(lastArg.length - 1) === '/';
  var sections = nonEmptyArgs.reduce(function (acc, section) {
    return acc.concat(section.split('/'));
  }, []);
  var first = !leadingSlash;
  var path = sections.reduce(function (acc, section) {
    if (section === '') {
      return acc;
    }

    if (first) {
      first = false;
      return acc + section;
    }

    return acc + '/' + section;
  }, '');

  if (trailingSlash) {
    // add it back
    return path + '/';
  }

  return path;
}
/**
 * Returns whether the given paths are the same, without
 * leading, trailing or doubled slashes and also removing
 * the dot sections.
 */


function isSamePath(path1, path2) {
  var pathSections1 = (path1 || '').split('/').filter(function (p) {
    return p !== '.';
  });
  var pathSections2 = (path2 || '').split('/').filter(function (p) {
    return p !== '.';
  });
  path1 = joinPaths.apply(undefined, pathSections1);
  path2 = joinPaths.apply(undefined, pathSections2);
  return path1 === path2;
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../node_modules/@nextcloud/router/dist/index.js":
/*!*******************************************************!*\
  !*** ../node_modules/@nextcloud/router/dist/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.linkTo = exports.imagePath = exports.getRootUrl = exports.generateUrl = exports.generateRemoteUrl = exports.generateOcsUrl = exports.generateFilePath = void 0;
/**
 * Get an url with webroot to a file in an app
 *
 * @param {string} app the id of the app the file belongs to
 * @param {string} file the file path relative to the app folder
 * @return {string} URL with webroot to a file
 */
const linkTo = (app, file) => generateFilePath(app, '', file);

/**
 * Creates a relative url for remote use
 *
 * @param {string} service id
 * @return {string} the url
 */
exports.linkTo = linkTo;
const linkToRemoteBase = service => getRootUrl() + '/remote.php/' + service;

/**
 * @brief Creates an absolute url for remote use
 * @param {string} service id
 * @return {string} the url
 */
const generateRemoteUrl = service => window.location.protocol + '//' + window.location.host + linkToRemoteBase(service);

/**
 * Get the base path for the given OCS API service
 *
 * @param {string} url OCS API service url
 * @param {object} params parameters to be replaced into the service url
 * @param {UrlOptions} options options for the parameter replacement
 * @param {boolean} options.escape Set to false if parameters should not be URL encoded (default true)
 * @param {Number} options.ocsVersion OCS version to use (defaults to 2)
 * @return {string} Absolute path for the OCS URL
 */
exports.generateRemoteUrl = generateRemoteUrl;
const generateOcsUrl = (url, params, options) => {
  const allOptions = Object.assign({
    ocsVersion: 2
  }, options || {});
  const version = allOptions.ocsVersion === 1 ? 1 : 2;
  return window.location.protocol + '//' + window.location.host + getRootUrl() + '/ocs/v' + version + '.php' + _generateUrlPath(url, params, options);
};
exports.generateOcsUrl = generateOcsUrl;
/**
 * Generate a url path, which can contain parameters
 *
 * Parameters will be URL encoded automatically
 *
 * @param {string} url address (can contain placeholders e.g. /call/{token} would replace {token} with the value of params.token
 * @param {object} params parameters to be replaced into the address
 * @param {UrlOptions} options options for the parameter replacement
 * @return {string} Path part for the given URL
 */
const _generateUrlPath = (url, params, options) => {
  const allOptions = Object.assign({
    escape: true
  }, options || {});
  const _build = function (text, vars) {
    vars = vars || {};
    return text.replace(/{([^{}]*)}/g, function (a, b) {
      var r = vars[b];
      if (allOptions.escape) {
        return typeof r === 'string' || typeof r === 'number' ? encodeURIComponent(r.toString()) : encodeURIComponent(a);
      } else {
        return typeof r === 'string' || typeof r === 'number' ? r.toString() : a;
      }
    });
  };
  if (url.charAt(0) !== '/') {
    url = '/' + url;
  }
  return _build(url, params || {});
};

/**
 * Generate the url with webroot for the given relative url, which can contain parameters
 *
 * Parameters will be URL encoded automatically
 *
 * @param {string} url address (can contain placeholders e.g. /call/{token} would replace {token} with the value of params.token
 * @param {object} params parameters to be replaced into the url
 * @param {UrlOptions} options options for the parameter replacement
 * @param {boolean} options.noRewrite True if you want to force index.php being added
 * @param {boolean} options.escape Set to false if parameters should not be URL encoded (default true)
 * @return {string} URL with webroot for the given relative URL
 */
const generateUrl = (url, params, options) => {
  const allOptions = Object.assign({
    noRewrite: false
  }, options || {});
  if (window?.OC?.config?.modRewriteWorking === true && !allOptions.noRewrite) {
    return getRootUrl() + _generateUrlPath(url, params, options);
  }
  return getRootUrl() + '/index.php' + _generateUrlPath(url, params, options);
};

/**
 * Get the path with webroot to an image file
 * if no extension is given for the image, it will automatically decide
 * between .png and .svg based on what the browser supports
 *
 * @param {string} app the app id to which the image belongs
 * @param {string} file the name of the image file
 * @return {string}
 */
exports.generateUrl = generateUrl;
const imagePath = (app, file) => {
  if (file.indexOf('.') === -1) {
    //if no extension is given, use svg
    return generateFilePath(app, 'img', file + '.svg');
  }
  return generateFilePath(app, 'img', file);
};

/**
 * Get the url with webroot for a file in an app
 *
 * @param {string} app the id of the app
 * @param {string} type the type of the file to link to (e.g. css,img,ajax.template)
 * @param {string} file the filename
 * @return {string} URL with webroot for a file in an app
 */
exports.imagePath = imagePath;
const generateFilePath = (app, type, file) => {
  const isCore = window?.OC?.coreApps?.indexOf(app) !== -1;
  let link = getRootUrl();
  if (file.substring(file.length - 3) === 'php' && !isCore) {
    link += '/index.php/apps/' + app;
    if (file !== 'index.php') {
      link += '/';
      if (type) {
        link += encodeURI(type + '/');
      }
      link += file;
    }
  } else if (file.substring(file.length - 3) !== 'php' && !isCore) {
    link = window?.OC?.appswebroots?.[app];
    if (type) {
      link += '/' + type + '/';
    }
    if (link.substring(link.length - 1) !== '/') {
      link += '/';
    }
    link += file;
  } else {
    if ((app === 'settings' || app === 'core' || app === 'search') && type === 'ajax') {
      link += '/index.php/';
    } else {
      link += '/';
    }
    if (!isCore) {
      link += 'apps/';
    }
    if (app !== '') {
      app += '/';
      link += app;
    }
    if (type) {
      link += type + '/';
    }
    link += file;
  }
  return link;
};

/**
 * Return the web root path where this Nextcloud instance
 * is accessible, with a leading slash.
 * For example "/nextcloud".
 *
 * @return {string} web root path
 */
exports.generateFilePath = generateFilePath;
const getRootUrl = () => window?.OC?.webroot || '';
exports.getRootUrl = getRootUrl;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../node_modules/dompurify/dist/purify.js":
/*!************************************************!*\
  !*** ../node_modules/dompurify/dist/purify.js ***!
  \************************************************/
/***/ (function(module) {

/*! @license DOMPurify 3.0.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.0.6/LICENSE */

(function (global, factory) {
   true ? module.exports = factory() :
  0;
})(this, (function () { 'use strict';

  const {
    entries,
    setPrototypeOf,
    isFrozen,
    getPrototypeOf,
    getOwnPropertyDescriptor
  } = Object;
  let {
    freeze,
    seal,
    create
  } = Object; // eslint-disable-line import/no-mutable-exports

  let {
    apply,
    construct
  } = typeof Reflect !== 'undefined' && Reflect;

  if (!freeze) {
    freeze = function freeze(x) {
      return x;
    };
  }

  if (!seal) {
    seal = function seal(x) {
      return x;
    };
  }

  if (!apply) {
    apply = function apply(fun, thisValue, args) {
      return fun.apply(thisValue, args);
    };
  }

  if (!construct) {
    construct = function construct(Func, args) {
      return new Func(...args);
    };
  }

  const arrayForEach = unapply(Array.prototype.forEach);
  const arrayPop = unapply(Array.prototype.pop);
  const arrayPush = unapply(Array.prototype.push);
  const stringToLowerCase = unapply(String.prototype.toLowerCase);
  const stringToString = unapply(String.prototype.toString);
  const stringMatch = unapply(String.prototype.match);
  const stringReplace = unapply(String.prototype.replace);
  const stringIndexOf = unapply(String.prototype.indexOf);
  const stringTrim = unapply(String.prototype.trim);
  const regExpTest = unapply(RegExp.prototype.test);
  const typeErrorCreate = unconstruct(TypeError);
  /**
   * Creates a new function that calls the given function with a specified thisArg and arguments.
   *
   * @param {Function} func - The function to be wrapped and called.
   * @returns {Function} A new function that calls the given function with a specified thisArg and arguments.
   */

  function unapply(func) {
    return function (thisArg) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return apply(func, thisArg, args);
    };
  }
  /**
   * Creates a new function that constructs an instance of the given constructor function with the provided arguments.
   *
   * @param {Function} func - The constructor function to be wrapped and called.
   * @returns {Function} A new function that constructs an instance of the given constructor function with the provided arguments.
   */


  function unconstruct(func) {
    return function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return construct(func, args);
    };
  }
  /**
   * Add properties to a lookup table
   *
   * @param {Object} set - The set to which elements will be added.
   * @param {Array} array - The array containing elements to be added to the set.
   * @param {Function} transformCaseFunc - An optional function to transform the case of each element before adding to the set.
   * @returns {Object} The modified set with added elements.
   */


  function addToSet(set, array) {
    let transformCaseFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : stringToLowerCase;

    if (setPrototypeOf) {
      // Make 'in' and truthy checks like Boolean(set.constructor)
      // independent of any properties defined on Object.prototype.
      // Prevent prototype setters from intercepting set as a this value.
      setPrototypeOf(set, null);
    }

    let l = array.length;

    while (l--) {
      let element = array[l];

      if (typeof element === 'string') {
        const lcElement = transformCaseFunc(element);

        if (lcElement !== element) {
          // Config presets (e.g. tags.js, attrs.js) are immutable.
          if (!isFrozen(array)) {
            array[l] = lcElement;
          }

          element = lcElement;
        }
      }

      set[element] = true;
    }

    return set;
  }
  /**
   * Shallow clone an object
   *
   * @param {Object} object - The object to be cloned.
   * @returns {Object} A new object that copies the original.
   */


  function clone(object) {
    const newObject = create(null);

    for (const [property, value] of entries(object)) {
      if (getOwnPropertyDescriptor(object, property) !== undefined) {
        newObject[property] = value;
      }
    }

    return newObject;
  }
  /**
   * This method automatically checks if the prop is function or getter and behaves accordingly.
   *
   * @param {Object} object - The object to look up the getter function in its prototype chain.
   * @param {String} prop - The property name for which to find the getter function.
   * @returns {Function} The getter function found in the prototype chain or a fallback function.
   */

  function lookupGetter(object, prop) {
    while (object !== null) {
      const desc = getOwnPropertyDescriptor(object, prop);

      if (desc) {
        if (desc.get) {
          return unapply(desc.get);
        }

        if (typeof desc.value === 'function') {
          return unapply(desc.value);
        }
      }

      object = getPrototypeOf(object);
    }

    function fallbackValue(element) {
      console.warn('fallback value for', element);
      return null;
    }

    return fallbackValue;
  }

  const html$1 = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']); // SVG

  const svg$1 = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'view', 'vkern']);
  const svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']); // List of SVG elements that are disallowed by default.
  // We still need to know them so that we can do namespace
  // checks properly in case one wants to add them to
  // allow-list.

  const svgDisallowed = freeze(['animate', 'color-profile', 'cursor', 'discard', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignobject', 'hatch', 'hatchpath', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'missing-glyph', 'script', 'set', 'solidcolor', 'unknown', 'use']);
  const mathMl$1 = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover', 'mprescripts']); // Similarly to SVG, we want to know all MathML elements,
  // even those that we disallow by default.

  const mathMlDisallowed = freeze(['maction', 'maligngroup', 'malignmark', 'mlongdiv', 'mscarries', 'mscarry', 'msgroup', 'mstack', 'msline', 'msrow', 'semantics', 'annotation', 'annotation-xml', 'mprescripts', 'none']);
  const text = freeze(['#text']);

  const html = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'nonce', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'playsinline', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'xmlns', 'slot']);
  const svg = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'targetx', 'targety', 'transform', 'transform-origin', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);
  const mathMl = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);
  const xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

  const MUSTACHE_EXPR = seal(/\{\{[\w\W]*|[\w\W]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode

  const ERB_EXPR = seal(/<%[\w\W]*|[\w\W]*%>/gm);
  const TMPLIT_EXPR = seal(/\${[\w\W]*}/gm);
  const DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]/); // eslint-disable-line no-useless-escape

  const ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape

  const IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
  );
  const IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
  const ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
  );
  const DOCTYPE_NAME = seal(/^html$/i);

  var EXPRESSIONS = /*#__PURE__*/Object.freeze({
    __proto__: null,
    MUSTACHE_EXPR: MUSTACHE_EXPR,
    ERB_EXPR: ERB_EXPR,
    TMPLIT_EXPR: TMPLIT_EXPR,
    DATA_ATTR: DATA_ATTR,
    ARIA_ATTR: ARIA_ATTR,
    IS_ALLOWED_URI: IS_ALLOWED_URI,
    IS_SCRIPT_OR_DATA: IS_SCRIPT_OR_DATA,
    ATTR_WHITESPACE: ATTR_WHITESPACE,
    DOCTYPE_NAME: DOCTYPE_NAME
  });

  const getGlobal = function getGlobal() {
    return typeof window === 'undefined' ? null : window;
  };
  /**
   * Creates a no-op policy for internal use only.
   * Don't export this function outside this module!
   * @param {?TrustedTypePolicyFactory} trustedTypes The policy factory.
   * @param {HTMLScriptElement} purifyHostElement The Script element used to load DOMPurify (to determine policy name suffix).
   * @return {?TrustedTypePolicy} The policy created (or null, if Trusted Types
   * are not supported or creating the policy failed).
   */


  const _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, purifyHostElement) {
    if (typeof trustedTypes !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
      return null;
    } // Allow the callers to control the unique policy name
    // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
    // Policy creation with duplicate names throws in Trusted Types.


    let suffix = null;
    const ATTR_NAME = 'data-tt-policy-suffix';

    if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME)) {
      suffix = purifyHostElement.getAttribute(ATTR_NAME);
    }

    const policyName = 'dompurify' + (suffix ? '#' + suffix : '');

    try {
      return trustedTypes.createPolicy(policyName, {
        createHTML(html) {
          return html;
        },

        createScriptURL(scriptUrl) {
          return scriptUrl;
        }

      });
    } catch (_) {
      // Policy creation failed (most likely another DOMPurify script has
      // already run). Skip creating the policy, as this will only cause errors
      // if TT are enforced.
      console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
      return null;
    }
  };

  function createDOMPurify() {
    let window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();

    const DOMPurify = root => createDOMPurify(root);
    /**
     * Version label, exposed for easier checks
     * if DOMPurify is up to date or not
     */


    DOMPurify.version = '3.0.6';
    /**
     * Array of elements that DOMPurify removed during sanitation.
     * Empty if nothing was removed.
     */

    DOMPurify.removed = [];

    if (!window || !window.document || window.document.nodeType !== 9) {
      // Not running in a browser, provide a factory function
      // so that you can pass your own Window
      DOMPurify.isSupported = false;
      return DOMPurify;
    }

    let {
      document
    } = window;
    const originalDocument = document;
    const currentScript = originalDocument.currentScript;
    const {
      DocumentFragment,
      HTMLTemplateElement,
      Node,
      Element,
      NodeFilter,
      NamedNodeMap = window.NamedNodeMap || window.MozNamedAttrMap,
      HTMLFormElement,
      DOMParser,
      trustedTypes
    } = window;
    const ElementPrototype = Element.prototype;
    const cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
    const getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
    const getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
    const getParentNode = lookupGetter(ElementPrototype, 'parentNode'); // As per issue #47, the web-components registry is inherited by a
    // new document created via createHTMLDocument. As per the spec
    // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
    // a new empty registry is used when creating a template contents owner
    // document, so we use that as our parent document to ensure nothing
    // is inherited.

    if (typeof HTMLTemplateElement === 'function') {
      const template = document.createElement('template');

      if (template.content && template.content.ownerDocument) {
        document = template.content.ownerDocument;
      }
    }

    let trustedTypesPolicy;
    let emptyHTML = '';
    const {
      implementation,
      createNodeIterator,
      createDocumentFragment,
      getElementsByTagName
    } = document;
    const {
      importNode
    } = originalDocument;
    let hooks = {};
    /**
     * Expose whether this browser supports running the full DOMPurify.
     */

    DOMPurify.isSupported = typeof entries === 'function' && typeof getParentNode === 'function' && implementation && implementation.createHTMLDocument !== undefined;
    const {
      MUSTACHE_EXPR,
      ERB_EXPR,
      TMPLIT_EXPR,
      DATA_ATTR,
      ARIA_ATTR,
      IS_SCRIPT_OR_DATA,
      ATTR_WHITESPACE
    } = EXPRESSIONS;
    let {
      IS_ALLOWED_URI: IS_ALLOWED_URI$1
    } = EXPRESSIONS;
    /**
     * We consider the elements and attributes below to be safe. Ideally
     * don't add any new ones but feel free to remove unwanted ones.
     */

    /* allowed element names */

    let ALLOWED_TAGS = null;
    const DEFAULT_ALLOWED_TAGS = addToSet({}, [...html$1, ...svg$1, ...svgFilters, ...mathMl$1, ...text]);
    /* Allowed attribute names */

    let ALLOWED_ATTR = null;
    const DEFAULT_ALLOWED_ATTR = addToSet({}, [...html, ...svg, ...mathMl, ...xml]);
    /*
     * Configure how DOMPUrify should handle custom elements and their attributes as well as customized built-in elements.
     * @property {RegExp|Function|null} tagNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any custom elements)
     * @property {RegExp|Function|null} attributeNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any attributes not on the allow list)
     * @property {boolean} allowCustomizedBuiltInElements allow custom elements derived from built-ins if they pass CUSTOM_ELEMENT_HANDLING.tagNameCheck. Default: `false`.
     */

    let CUSTOM_ELEMENT_HANDLING = Object.seal(create(null, {
      tagNameCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      },
      attributeNameCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      },
      allowCustomizedBuiltInElements: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: false
      }
    }));
    /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */

    let FORBID_TAGS = null;
    /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */

    let FORBID_ATTR = null;
    /* Decide if ARIA attributes are okay */

    let ALLOW_ARIA_ATTR = true;
    /* Decide if custom data attributes are okay */

    let ALLOW_DATA_ATTR = true;
    /* Decide if unknown protocols are okay */

    let ALLOW_UNKNOWN_PROTOCOLS = false;
    /* Decide if self-closing tags in attributes are allowed.
     * Usually removed due to a mXSS issue in jQuery 3.0 */

    let ALLOW_SELF_CLOSE_IN_ATTR = true;
    /* Output should be safe for common template engines.
     * This means, DOMPurify removes data attributes, mustaches and ERB
     */

    let SAFE_FOR_TEMPLATES = false;
    /* Decide if document with <html>... should be returned */

    let WHOLE_DOCUMENT = false;
    /* Track whether config is already set on this instance of DOMPurify. */

    let SET_CONFIG = false;
    /* Decide if all elements (e.g. style, script) must be children of
     * document.body. By default, browsers might move them to document.head */

    let FORCE_BODY = false;
    /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
     * string (or a TrustedHTML object if Trusted Types are supported).
     * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
     */

    let RETURN_DOM = false;
    /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
     * string  (or a TrustedHTML object if Trusted Types are supported) */

    let RETURN_DOM_FRAGMENT = false;
    /* Try to return a Trusted Type object instead of a string, return a string in
     * case Trusted Types are not supported  */

    let RETURN_TRUSTED_TYPE = false;
    /* Output should be free from DOM clobbering attacks?
     * This sanitizes markups named with colliding, clobberable built-in DOM APIs.
     */

    let SANITIZE_DOM = true;
    /* Achieve full DOM Clobbering protection by isolating the namespace of named
     * properties and JS variables, mitigating attacks that abuse the HTML/DOM spec rules.
     *
     * HTML/DOM spec rules that enable DOM Clobbering:
     *   - Named Access on Window (§7.3.3)
     *   - DOM Tree Accessors (§3.1.5)
     *   - Form Element Parent-Child Relations (§4.10.3)
     *   - Iframe srcdoc / Nested WindowProxies (§4.8.5)
     *   - HTMLCollection (§4.2.10.2)
     *
     * Namespace isolation is implemented by prefixing `id` and `name` attributes
     * with a constant string, i.e., `user-content-`
     */

    let SANITIZE_NAMED_PROPS = false;
    const SANITIZE_NAMED_PROPS_PREFIX = 'user-content-';
    /* Keep element content when removing element? */

    let KEEP_CONTENT = true;
    /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
     * of importing it into a new Document and returning a sanitized copy */

    let IN_PLACE = false;
    /* Allow usage of profiles like html, svg and mathMl */

    let USE_PROFILES = {};
    /* Tags to ignore content of when KEEP_CONTENT is true */

    let FORBID_CONTENTS = null;
    const DEFAULT_FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);
    /* Tags that are safe for data: URIs */

    let DATA_URI_TAGS = null;
    const DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);
    /* Attributes safe for values like "javascript:" */

    let URI_SAFE_ATTRIBUTES = null;
    const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'role', 'summary', 'title', 'value', 'style', 'xmlns']);
    const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
    const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
    const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
    /* Document namespace */

    let NAMESPACE = HTML_NAMESPACE;
    let IS_EMPTY_INPUT = false;
    /* Allowed XHTML+XML namespaces */

    let ALLOWED_NAMESPACES = null;
    const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [MATHML_NAMESPACE, SVG_NAMESPACE, HTML_NAMESPACE], stringToString);
    /* Parsing of strict XHTML documents */

    let PARSER_MEDIA_TYPE = null;
    const SUPPORTED_PARSER_MEDIA_TYPES = ['application/xhtml+xml', 'text/html'];
    const DEFAULT_PARSER_MEDIA_TYPE = 'text/html';
    let transformCaseFunc = null;
    /* Keep a reference to config to pass to hooks */

    let CONFIG = null;
    /* Ideally, do not touch anything below this line */

    /* ______________________________________________ */

    const formElement = document.createElement('form');

    const isRegexOrFunction = function isRegexOrFunction(testValue) {
      return testValue instanceof RegExp || testValue instanceof Function;
    };
    /**
     * _parseConfig
     *
     * @param  {Object} cfg optional config literal
     */
    // eslint-disable-next-line complexity


    const _parseConfig = function _parseConfig() {
      let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (CONFIG && CONFIG === cfg) {
        return;
      }
      /* Shield configuration object from tampering */


      if (!cfg || typeof cfg !== 'object') {
        cfg = {};
      }
      /* Shield configuration object from prototype pollution */


      cfg = clone(cfg);
      PARSER_MEDIA_TYPE = // eslint-disable-next-line unicorn/prefer-includes
      SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? PARSER_MEDIA_TYPE = DEFAULT_PARSER_MEDIA_TYPE : PARSER_MEDIA_TYPE = cfg.PARSER_MEDIA_TYPE; // HTML tags and attributes are not case-sensitive, converting to lowercase. Keeping XHTML as is.

      transformCaseFunc = PARSER_MEDIA_TYPE === 'application/xhtml+xml' ? stringToString : stringToLowerCase;
      /* Set configuration parameters */

      ALLOWED_TAGS = 'ALLOWED_TAGS' in cfg ? addToSet({}, cfg.ALLOWED_TAGS, transformCaseFunc) : DEFAULT_ALLOWED_TAGS;
      ALLOWED_ATTR = 'ALLOWED_ATTR' in cfg ? addToSet({}, cfg.ALLOWED_ATTR, transformCaseFunc) : DEFAULT_ALLOWED_ATTR;
      ALLOWED_NAMESPACES = 'ALLOWED_NAMESPACES' in cfg ? addToSet({}, cfg.ALLOWED_NAMESPACES, stringToString) : DEFAULT_ALLOWED_NAMESPACES;
      URI_SAFE_ATTRIBUTES = 'ADD_URI_SAFE_ATTR' in cfg ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), // eslint-disable-line indent
      cfg.ADD_URI_SAFE_ATTR, // eslint-disable-line indent
      transformCaseFunc // eslint-disable-line indent
      ) // eslint-disable-line indent
      : DEFAULT_URI_SAFE_ATTRIBUTES;
      DATA_URI_TAGS = 'ADD_DATA_URI_TAGS' in cfg ? addToSet(clone(DEFAULT_DATA_URI_TAGS), // eslint-disable-line indent
      cfg.ADD_DATA_URI_TAGS, // eslint-disable-line indent
      transformCaseFunc // eslint-disable-line indent
      ) // eslint-disable-line indent
      : DEFAULT_DATA_URI_TAGS;
      FORBID_CONTENTS = 'FORBID_CONTENTS' in cfg ? addToSet({}, cfg.FORBID_CONTENTS, transformCaseFunc) : DEFAULT_FORBID_CONTENTS;
      FORBID_TAGS = 'FORBID_TAGS' in cfg ? addToSet({}, cfg.FORBID_TAGS, transformCaseFunc) : {};
      FORBID_ATTR = 'FORBID_ATTR' in cfg ? addToSet({}, cfg.FORBID_ATTR, transformCaseFunc) : {};
      USE_PROFILES = 'USE_PROFILES' in cfg ? cfg.USE_PROFILES : false;
      ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true

      ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true

      ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false

      ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false; // Default true

      SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false

      WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false

      RETURN_DOM = cfg.RETURN_DOM || false; // Default false

      RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false

      RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false

      FORCE_BODY = cfg.FORCE_BODY || false; // Default false

      SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true

      SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false; // Default false

      KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true

      IN_PLACE = cfg.IN_PLACE || false; // Default false

      IS_ALLOWED_URI$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI;
      NAMESPACE = cfg.NAMESPACE || HTML_NAMESPACE;
      CUSTOM_ELEMENT_HANDLING = cfg.CUSTOM_ELEMENT_HANDLING || {};

      if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck)) {
        CUSTOM_ELEMENT_HANDLING.tagNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck;
      }

      if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)) {
        CUSTOM_ELEMENT_HANDLING.attributeNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck;
      }

      if (cfg.CUSTOM_ELEMENT_HANDLING && typeof cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements === 'boolean') {
        CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements;
      }

      if (SAFE_FOR_TEMPLATES) {
        ALLOW_DATA_ATTR = false;
      }

      if (RETURN_DOM_FRAGMENT) {
        RETURN_DOM = true;
      }
      /* Parse profile info */


      if (USE_PROFILES) {
        ALLOWED_TAGS = addToSet({}, [...text]);
        ALLOWED_ATTR = [];

        if (USE_PROFILES.html === true) {
          addToSet(ALLOWED_TAGS, html$1);
          addToSet(ALLOWED_ATTR, html);
        }

        if (USE_PROFILES.svg === true) {
          addToSet(ALLOWED_TAGS, svg$1);
          addToSet(ALLOWED_ATTR, svg);
          addToSet(ALLOWED_ATTR, xml);
        }

        if (USE_PROFILES.svgFilters === true) {
          addToSet(ALLOWED_TAGS, svgFilters);
          addToSet(ALLOWED_ATTR, svg);
          addToSet(ALLOWED_ATTR, xml);
        }

        if (USE_PROFILES.mathMl === true) {
          addToSet(ALLOWED_TAGS, mathMl$1);
          addToSet(ALLOWED_ATTR, mathMl);
          addToSet(ALLOWED_ATTR, xml);
        }
      }
      /* Merge configuration parameters */


      if (cfg.ADD_TAGS) {
        if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
          ALLOWED_TAGS = clone(ALLOWED_TAGS);
        }

        addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
      }

      if (cfg.ADD_ATTR) {
        if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
          ALLOWED_ATTR = clone(ALLOWED_ATTR);
        }

        addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
      }

      if (cfg.ADD_URI_SAFE_ATTR) {
        addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR, transformCaseFunc);
      }

      if (cfg.FORBID_CONTENTS) {
        if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
          FORBID_CONTENTS = clone(FORBID_CONTENTS);
        }

        addToSet(FORBID_CONTENTS, cfg.FORBID_CONTENTS, transformCaseFunc);
      }
      /* Add #text in case KEEP_CONTENT is set to true */


      if (KEEP_CONTENT) {
        ALLOWED_TAGS['#text'] = true;
      }
      /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */


      if (WHOLE_DOCUMENT) {
        addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
      }
      /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */


      if (ALLOWED_TAGS.table) {
        addToSet(ALLOWED_TAGS, ['tbody']);
        delete FORBID_TAGS.tbody;
      }

      if (cfg.TRUSTED_TYPES_POLICY) {
        if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== 'function') {
          throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        }

        if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== 'function') {
          throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        } // Overwrite existing TrustedTypes policy.


        trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY; // Sign local variables required by `sanitize`.

        emptyHTML = trustedTypesPolicy.createHTML('');
      } else {
        // Uninitialized policy, attempt to initialize the internal dompurify policy.
        if (trustedTypesPolicy === undefined) {
          trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
        } // If creating the internal policy succeeded sign internal variables.


        if (trustedTypesPolicy !== null && typeof emptyHTML === 'string') {
          emptyHTML = trustedTypesPolicy.createHTML('');
        }
      } // Prevent further manipulation of configuration.
      // Not available in IE8, Safari 5, etc.


      if (freeze) {
        freeze(cfg);
      }

      CONFIG = cfg;
    };

    const MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ['mi', 'mo', 'mn', 'ms', 'mtext']);
    const HTML_INTEGRATION_POINTS = addToSet({}, ['foreignobject', 'desc', 'title', 'annotation-xml']); // Certain elements are allowed in both SVG and HTML
    // namespace. We need to specify them explicitly
    // so that they don't get erroneously deleted from
    // HTML namespace.

    const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, ['title', 'style', 'font', 'a', 'script']);
    /* Keep track of all possible SVG and MathML tags
     * so that we can perform the namespace checks
     * correctly. */

    const ALL_SVG_TAGS = addToSet({}, svg$1);
    addToSet(ALL_SVG_TAGS, svgFilters);
    addToSet(ALL_SVG_TAGS, svgDisallowed);
    const ALL_MATHML_TAGS = addToSet({}, mathMl$1);
    addToSet(ALL_MATHML_TAGS, mathMlDisallowed);
    /**
     * @param  {Element} element a DOM element whose namespace is being checked
     * @returns {boolean} Return false if the element has a
     *  namespace that a spec-compliant parser would never
     *  return. Return true otherwise.
     */

    const _checkValidNamespace = function _checkValidNamespace(element) {
      let parent = getParentNode(element); // In JSDOM, if we're inside shadow DOM, then parentNode
      // can be null. We just simulate parent in this case.

      if (!parent || !parent.tagName) {
        parent = {
          namespaceURI: NAMESPACE,
          tagName: 'template'
        };
      }

      const tagName = stringToLowerCase(element.tagName);
      const parentTagName = stringToLowerCase(parent.tagName);

      if (!ALLOWED_NAMESPACES[element.namespaceURI]) {
        return false;
      }

      if (element.namespaceURI === SVG_NAMESPACE) {
        // The only way to switch from HTML namespace to SVG
        // is via <svg>. If it happens via any other tag, then
        // it should be killed.
        if (parent.namespaceURI === HTML_NAMESPACE) {
          return tagName === 'svg';
        } // The only way to switch from MathML to SVG is via`
        // svg if parent is either <annotation-xml> or MathML
        // text integration points.


        if (parent.namespaceURI === MATHML_NAMESPACE) {
          return tagName === 'svg' && (parentTagName === 'annotation-xml' || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
        } // We only allow elements that are defined in SVG
        // spec. All others are disallowed in SVG namespace.


        return Boolean(ALL_SVG_TAGS[tagName]);
      }

      if (element.namespaceURI === MATHML_NAMESPACE) {
        // The only way to switch from HTML namespace to MathML
        // is via <math>. If it happens via any other tag, then
        // it should be killed.
        if (parent.namespaceURI === HTML_NAMESPACE) {
          return tagName === 'math';
        } // The only way to switch from SVG to MathML is via
        // <math> and HTML integration points


        if (parent.namespaceURI === SVG_NAMESPACE) {
          return tagName === 'math' && HTML_INTEGRATION_POINTS[parentTagName];
        } // We only allow elements that are defined in MathML
        // spec. All others are disallowed in MathML namespace.


        return Boolean(ALL_MATHML_TAGS[tagName]);
      }

      if (element.namespaceURI === HTML_NAMESPACE) {
        // The only way to switch from SVG to HTML is via
        // HTML integration points, and from MathML to HTML
        // is via MathML text integration points
        if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
          return false;
        }

        if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
          return false;
        } // We disallow tags that are specific for MathML
        // or SVG and should never appear in HTML namespace


        return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
      } // For XHTML and XML documents that support custom namespaces


      if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && ALLOWED_NAMESPACES[element.namespaceURI]) {
        return true;
      } // The code should never reach this place (this means
      // that the element somehow got namespace that is not
      // HTML, SVG, MathML or allowed via ALLOWED_NAMESPACES).
      // Return false just in case.


      return false;
    };
    /**
     * _forceRemove
     *
     * @param  {Node} node a DOM node
     */


    const _forceRemove = function _forceRemove(node) {
      arrayPush(DOMPurify.removed, {
        element: node
      });

      try {
        // eslint-disable-next-line unicorn/prefer-dom-node-remove
        node.parentNode.removeChild(node);
      } catch (_) {
        node.remove();
      }
    };
    /**
     * _removeAttribute
     *
     * @param  {String} name an Attribute name
     * @param  {Node} node a DOM node
     */


    const _removeAttribute = function _removeAttribute(name, node) {
      try {
        arrayPush(DOMPurify.removed, {
          attribute: node.getAttributeNode(name),
          from: node
        });
      } catch (_) {
        arrayPush(DOMPurify.removed, {
          attribute: null,
          from: node
        });
      }

      node.removeAttribute(name); // We void attribute values for unremovable "is"" attributes

      if (name === 'is' && !ALLOWED_ATTR[name]) {
        if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
          try {
            _forceRemove(node);
          } catch (_) {}
        } else {
          try {
            node.setAttribute(name, '');
          } catch (_) {}
        }
      }
    };
    /**
     * _initDocument
     *
     * @param  {String} dirty a string of dirty markup
     * @return {Document} a DOM, filled with the dirty markup
     */


    const _initDocument = function _initDocument(dirty) {
      /* Create a HTML document */
      let doc = null;
      let leadingWhitespace = null;

      if (FORCE_BODY) {
        dirty = '<remove></remove>' + dirty;
      } else {
        /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
        const matches = stringMatch(dirty, /^[\r\n\t ]+/);
        leadingWhitespace = matches && matches[0];
      }

      if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && NAMESPACE === HTML_NAMESPACE) {
        // Root of XHTML doc must contain xmlns declaration (see https://www.w3.org/TR/xhtml1/normative.html#strict)
        dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + '</body></html>';
      }

      const dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
      /*
       * Use the DOMParser API by default, fallback later if needs be
       * DOMParser not work for svg when has multiple root element.
       */

      if (NAMESPACE === HTML_NAMESPACE) {
        try {
          doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
        } catch (_) {}
      }
      /* Use createHTMLDocument in case DOMParser is not available */


      if (!doc || !doc.documentElement) {
        doc = implementation.createDocument(NAMESPACE, 'template', null);

        try {
          doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
        } catch (_) {// Syntax error if dirtyPayload is invalid xml
        }
      }

      const body = doc.body || doc.documentElement;

      if (dirty && leadingWhitespace) {
        body.insertBefore(document.createTextNode(leadingWhitespace), body.childNodes[0] || null);
      }
      /* Work on whole document or just its body */


      if (NAMESPACE === HTML_NAMESPACE) {
        return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
      }

      return WHOLE_DOCUMENT ? doc.documentElement : body;
    };
    /**
     * Creates a NodeIterator object that you can use to traverse filtered lists of nodes or elements in a document.
     *
     * @param  {Node} root The root element or node to start traversing on.
     * @return {NodeIterator} The created NodeIterator
     */


    const _createNodeIterator = function _createNodeIterator(root) {
      return createNodeIterator.call(root.ownerDocument || root, root, // eslint-disable-next-line no-bitwise
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT, null);
    };
    /**
     * _isClobbered
     *
     * @param  {Node} elm element to check for clobbering attacks
     * @return {Boolean} true if clobbered, false if safe
     */


    const _isClobbered = function _isClobbered(elm) {
      return elm instanceof HTMLFormElement && (typeof elm.nodeName !== 'string' || typeof elm.textContent !== 'string' || typeof elm.removeChild !== 'function' || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== 'function' || typeof elm.setAttribute !== 'function' || typeof elm.namespaceURI !== 'string' || typeof elm.insertBefore !== 'function' || typeof elm.hasChildNodes !== 'function');
    };
    /**
     * Checks whether the given object is a DOM node.
     *
     * @param  {Node} object object to check whether it's a DOM node
     * @return {Boolean} true is object is a DOM node
     */


    const _isNode = function _isNode(object) {
      return typeof Node === 'function' && object instanceof Node;
    };
    /**
     * _executeHook
     * Execute user configurable hooks
     *
     * @param  {String} entryPoint  Name of the hook's entry point
     * @param  {Node} currentNode node to work on with the hook
     * @param  {Object} data additional hook parameters
     */


    const _executeHook = function _executeHook(entryPoint, currentNode, data) {
      if (!hooks[entryPoint]) {
        return;
      }

      arrayForEach(hooks[entryPoint], hook => {
        hook.call(DOMPurify, currentNode, data, CONFIG);
      });
    };
    /**
     * _sanitizeElements
     *
     * @protect nodeName
     * @protect textContent
     * @protect removeChild
     *
     * @param   {Node} currentNode to check for permission to exist
     * @return  {Boolean} true if node was killed, false if left alive
     */


    const _sanitizeElements = function _sanitizeElements(currentNode) {
      let content = null;
      /* Execute a hook if present */

      _executeHook('beforeSanitizeElements', currentNode, null);
      /* Check if element is clobbered or can clobber */


      if (_isClobbered(currentNode)) {
        _forceRemove(currentNode);

        return true;
      }
      /* Now let's check the element's type and name */


      const tagName = transformCaseFunc(currentNode.nodeName);
      /* Execute a hook if present */

      _executeHook('uponSanitizeElement', currentNode, {
        tagName,
        allowedTags: ALLOWED_TAGS
      });
      /* Detect mXSS attempts abusing namespace confusion */


      if (currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && regExpTest(/<[/\w]/g, currentNode.innerHTML) && regExpTest(/<[/\w]/g, currentNode.textContent)) {
        _forceRemove(currentNode);

        return true;
      }
      /* Remove element if anything forbids its presence */


      if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
        /* Check if we have a custom element to handle */
        if (!FORBID_TAGS[tagName] && _isBasicCustomElement(tagName)) {
          if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) {
            return false;
          }

          if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(tagName)) {
            return false;
          }
        }
        /* Keep content except for bad-listed elements */


        if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
          const parentNode = getParentNode(currentNode) || currentNode.parentNode;
          const childNodes = getChildNodes(currentNode) || currentNode.childNodes;

          if (childNodes && parentNode) {
            const childCount = childNodes.length;

            for (let i = childCount - 1; i >= 0; --i) {
              parentNode.insertBefore(cloneNode(childNodes[i], true), getNextSibling(currentNode));
            }
          }
        }

        _forceRemove(currentNode);

        return true;
      }
      /* Check whether element has a valid namespace */


      if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
        _forceRemove(currentNode);

        return true;
      }
      /* Make sure that older browsers don't get fallback-tag mXSS */


      if ((tagName === 'noscript' || tagName === 'noembed' || tagName === 'noframes') && regExpTest(/<\/no(script|embed|frames)/i, currentNode.innerHTML)) {
        _forceRemove(currentNode);

        return true;
      }
      /* Sanitize element content to be template-safe */


      if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
        /* Get the element's text content */
        content = currentNode.textContent;
        arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
          content = stringReplace(content, expr, ' ');
        });

        if (currentNode.textContent !== content) {
          arrayPush(DOMPurify.removed, {
            element: currentNode.cloneNode()
          });
          currentNode.textContent = content;
        }
      }
      /* Execute a hook if present */


      _executeHook('afterSanitizeElements', currentNode, null);

      return false;
    };
    /**
     * _isValidAttribute
     *
     * @param  {string} lcTag Lowercase tag name of containing element.
     * @param  {string} lcName Lowercase attribute name.
     * @param  {string} value Attribute value.
     * @return {Boolean} Returns true if `value` is valid, otherwise false.
     */
    // eslint-disable-next-line complexity


    const _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
      /* Make sure attribute cannot clobber */
      if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
        return false;
      }
      /* Allow valid data-* attributes: At least one character after "-"
          (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
          XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
          We don't need to check the value; it's always URI safe. */


      if (ALLOW_DATA_ATTR && !FORBID_ATTR[lcName] && regExpTest(DATA_ATTR, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR, lcName)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
        if ( // First condition does a very basic check if a) it's basically a valid custom element tagname AND
        // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
        // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
        _isBasicCustomElement(lcTag) && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(lcTag)) && (CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName) || CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.attributeNameCheck(lcName)) || // Alternative, second condition checks if it's an `is`-attribute, AND
        // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
        lcName === 'is' && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(value))) ; else {
          return false;
        }
        /* Check value is safe. First, is attr inert? If so, is safe */

      } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA, stringReplace(value, ATTR_WHITESPACE, ''))) ; else if (value) {
        return false;
      } else ;

      return true;
    };
    /**
     * _isBasicCustomElement
     * checks if at least one dash is included in tagName, and it's not the first char
     * for more sophisticated checking see https://github.com/sindresorhus/validate-element-name
     *
     * @param {string} tagName name of the tag of the node to sanitize
     * @returns {boolean} Returns true if the tag name meets the basic criteria for a custom element, otherwise false.
     */


    const _isBasicCustomElement = function _isBasicCustomElement(tagName) {
      return tagName.indexOf('-') > 0;
    };
    /**
     * _sanitizeAttributes
     *
     * @protect attributes
     * @protect nodeName
     * @protect removeAttribute
     * @protect setAttribute
     *
     * @param  {Node} currentNode to sanitize
     */


    const _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
      /* Execute a hook if present */
      _executeHook('beforeSanitizeAttributes', currentNode, null);

      const {
        attributes
      } = currentNode;
      /* Check if we have attributes; if not we might have a text node */

      if (!attributes) {
        return;
      }

      const hookEvent = {
        attrName: '',
        attrValue: '',
        keepAttr: true,
        allowedAttributes: ALLOWED_ATTR
      };
      let l = attributes.length;
      /* Go backwards over all attributes; safely remove bad ones */

      while (l--) {
        const attr = attributes[l];
        const {
          name,
          namespaceURI,
          value: attrValue
        } = attr;
        const lcName = transformCaseFunc(name);
        let value = name === 'value' ? attrValue : stringTrim(attrValue);
        /* Execute a hook if present */

        hookEvent.attrName = lcName;
        hookEvent.attrValue = value;
        hookEvent.keepAttr = true;
        hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set

        _executeHook('uponSanitizeAttribute', currentNode, hookEvent);

        value = hookEvent.attrValue;
        /* Did the hooks approve of the attribute? */

        if (hookEvent.forceKeepAttr) {
          continue;
        }
        /* Remove attribute */


        _removeAttribute(name, currentNode);
        /* Did the hooks approve of the attribute? */


        if (!hookEvent.keepAttr) {
          continue;
        }
        /* Work around a security issue in jQuery 3.0 */


        if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(/\/>/i, value)) {
          _removeAttribute(name, currentNode);

          continue;
        }
        /* Sanitize attribute content to be template-safe */


        if (SAFE_FOR_TEMPLATES) {
          arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
            value = stringReplace(value, expr, ' ');
          });
        }
        /* Is `value` valid for this attribute? */


        const lcTag = transformCaseFunc(currentNode.nodeName);

        if (!_isValidAttribute(lcTag, lcName, value)) {
          continue;
        }
        /* Full DOM Clobbering protection via namespace isolation,
         * Prefix id and name attributes with `user-content-`
         */


        if (SANITIZE_NAMED_PROPS && (lcName === 'id' || lcName === 'name')) {
          // Remove the attribute with this value
          _removeAttribute(name, currentNode); // Prefix the value and later re-create the attribute with the sanitized value


          value = SANITIZE_NAMED_PROPS_PREFIX + value;
        }
        /* Handle attributes that require Trusted Types */


        if (trustedTypesPolicy && typeof trustedTypes === 'object' && typeof trustedTypes.getAttributeType === 'function') {
          if (namespaceURI) ; else {
            switch (trustedTypes.getAttributeType(lcTag, lcName)) {
              case 'TrustedHTML':
                {
                  value = trustedTypesPolicy.createHTML(value);
                  break;
                }

              case 'TrustedScriptURL':
                {
                  value = trustedTypesPolicy.createScriptURL(value);
                  break;
                }
            }
          }
        }
        /* Handle invalid data-* attribute set by try-catching it */


        try {
          if (namespaceURI) {
            currentNode.setAttributeNS(namespaceURI, name, value);
          } else {
            /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
            currentNode.setAttribute(name, value);
          }

          arrayPop(DOMPurify.removed);
        } catch (_) {}
      }
      /* Execute a hook if present */


      _executeHook('afterSanitizeAttributes', currentNode, null);
    };
    /**
     * _sanitizeShadowDOM
     *
     * @param  {DocumentFragment} fragment to iterate over recursively
     */


    const _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
      let shadowNode = null;

      const shadowIterator = _createNodeIterator(fragment);
      /* Execute a hook if present */


      _executeHook('beforeSanitizeShadowDOM', fragment, null);

      while (shadowNode = shadowIterator.nextNode()) {
        /* Execute a hook if present */
        _executeHook('uponSanitizeShadowNode', shadowNode, null);
        /* Sanitize tags and elements */


        if (_sanitizeElements(shadowNode)) {
          continue;
        }
        /* Deep shadow DOM detected */


        if (shadowNode.content instanceof DocumentFragment) {
          _sanitizeShadowDOM(shadowNode.content);
        }
        /* Check attributes, sanitize if necessary */


        _sanitizeAttributes(shadowNode);
      }
      /* Execute a hook if present */


      _executeHook('afterSanitizeShadowDOM', fragment, null);
    };
    /**
     * Sanitize
     * Public method providing core sanitation functionality
     *
     * @param {String|Node} dirty string or DOM node
     * @param {Object} cfg object
     */
    // eslint-disable-next-line complexity


    DOMPurify.sanitize = function (dirty) {
      let cfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      let body = null;
      let importedNode = null;
      let currentNode = null;
      let returnNode = null;
      /* Make sure we have a string to sanitize.
        DO NOT return early, as this will return the wrong type if
        the user has requested a DOM object rather than a string */

      IS_EMPTY_INPUT = !dirty;

      if (IS_EMPTY_INPUT) {
        dirty = '<!-->';
      }
      /* Stringify, in case dirty is an object */


      if (typeof dirty !== 'string' && !_isNode(dirty)) {
        if (typeof dirty.toString === 'function') {
          dirty = dirty.toString();

          if (typeof dirty !== 'string') {
            throw typeErrorCreate('dirty is not a string, aborting');
          }
        } else {
          throw typeErrorCreate('toString is not a function');
        }
      }
      /* Return dirty HTML if DOMPurify cannot run */


      if (!DOMPurify.isSupported) {
        return dirty;
      }
      /* Assign config vars */


      if (!SET_CONFIG) {
        _parseConfig(cfg);
      }
      /* Clean up removed elements */


      DOMPurify.removed = [];
      /* Check if dirty is correctly typed for IN_PLACE */

      if (typeof dirty === 'string') {
        IN_PLACE = false;
      }

      if (IN_PLACE) {
        /* Do some early pre-sanitization to avoid unsafe root nodes */
        if (dirty.nodeName) {
          const tagName = transformCaseFunc(dirty.nodeName);

          if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
            throw typeErrorCreate('root node is forbidden and cannot be sanitized in-place');
          }
        }
      } else if (dirty instanceof Node) {
        /* If dirty is a DOM element, append to an empty document to avoid
           elements being stripped by the parser */
        body = _initDocument('<!---->');
        importedNode = body.ownerDocument.importNode(dirty, true);

        if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
          /* Node is already a body, use as is */
          body = importedNode;
        } else if (importedNode.nodeName === 'HTML') {
          body = importedNode;
        } else {
          // eslint-disable-next-line unicorn/prefer-dom-node-append
          body.appendChild(importedNode);
        }
      } else {
        /* Exit directly if we have nothing to do */
        if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT && // eslint-disable-next-line unicorn/prefer-includes
        dirty.indexOf('<') === -1) {
          return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
        }
        /* Initialize the document to work on */


        body = _initDocument(dirty);
        /* Check we have a DOM node from the data */

        if (!body) {
          return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : '';
        }
      }
      /* Remove first element node (ours) if FORCE_BODY is set */


      if (body && FORCE_BODY) {
        _forceRemove(body.firstChild);
      }
      /* Get node iterator */


      const nodeIterator = _createNodeIterator(IN_PLACE ? dirty : body);
      /* Now start iterating over the created document */


      while (currentNode = nodeIterator.nextNode()) {
        /* Sanitize tags and elements */
        if (_sanitizeElements(currentNode)) {
          continue;
        }
        /* Shadow DOM detected, sanitize it */


        if (currentNode.content instanceof DocumentFragment) {
          _sanitizeShadowDOM(currentNode.content);
        }
        /* Check attributes, sanitize if necessary */


        _sanitizeAttributes(currentNode);
      }
      /* If we sanitized `dirty` in-place, return it. */


      if (IN_PLACE) {
        return dirty;
      }
      /* Return sanitized string or DOM */


      if (RETURN_DOM) {
        if (RETURN_DOM_FRAGMENT) {
          returnNode = createDocumentFragment.call(body.ownerDocument);

          while (body.firstChild) {
            // eslint-disable-next-line unicorn/prefer-dom-node-append
            returnNode.appendChild(body.firstChild);
          }
        } else {
          returnNode = body;
        }

        if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode) {
          /*
            AdoptNode() is not used because internal state is not reset
            (e.g. the past names map of a HTMLFormElement), this is safe
            in theory but we would rather not risk another attack vector.
            The state that is cloned by importNode() is explicitly defined
            by the specs.
          */
          returnNode = importNode.call(originalDocument, returnNode, true);
        }

        return returnNode;
      }

      let serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
      /* Serialize doctype if allowed */

      if (WHOLE_DOCUMENT && ALLOWED_TAGS['!doctype'] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) {
        serializedHTML = '<!DOCTYPE ' + body.ownerDocument.doctype.name + '>\n' + serializedHTML;
      }
      /* Sanitize final string template-safe */


      if (SAFE_FOR_TEMPLATES) {
        arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
          serializedHTML = stringReplace(serializedHTML, expr, ' ');
        });
      }

      return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
    };
    /**
     * Public method to set the configuration once
     * setConfig
     *
     * @param {Object} cfg configuration object
     */


    DOMPurify.setConfig = function () {
      let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _parseConfig(cfg);

      SET_CONFIG = true;
    };
    /**
     * Public method to remove the configuration
     * clearConfig
     *
     */


    DOMPurify.clearConfig = function () {
      CONFIG = null;
      SET_CONFIG = false;
    };
    /**
     * Public method to check if an attribute value is valid.
     * Uses last set config, if any. Otherwise, uses config defaults.
     * isValidAttribute
     *
     * @param  {String} tag Tag name of containing element.
     * @param  {String} attr Attribute name.
     * @param  {String} value Attribute value.
     * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
     */


    DOMPurify.isValidAttribute = function (tag, attr, value) {
      /* Initialize shared config vars if necessary. */
      if (!CONFIG) {
        _parseConfig({});
      }

      const lcTag = transformCaseFunc(tag);
      const lcName = transformCaseFunc(attr);
      return _isValidAttribute(lcTag, lcName, value);
    };
    /**
     * AddHook
     * Public method to add DOMPurify hooks
     *
     * @param {String} entryPoint entry point for the hook to add
     * @param {Function} hookFunction function to execute
     */


    DOMPurify.addHook = function (entryPoint, hookFunction) {
      if (typeof hookFunction !== 'function') {
        return;
      }

      hooks[entryPoint] = hooks[entryPoint] || [];
      arrayPush(hooks[entryPoint], hookFunction);
    };
    /**
     * RemoveHook
     * Public method to remove a DOMPurify hook at a given entryPoint
     * (pops it from the stack of hooks if more are present)
     *
     * @param {String} entryPoint entry point for the hook to remove
     * @return {Function} removed(popped) hook
     */


    DOMPurify.removeHook = function (entryPoint) {
      if (hooks[entryPoint]) {
        return arrayPop(hooks[entryPoint]);
      }
    };
    /**
     * RemoveHooks
     * Public method to remove all DOMPurify hooks at a given entryPoint
     *
     * @param  {String} entryPoint entry point for the hooks to remove
     */


    DOMPurify.removeHooks = function (entryPoint) {
      if (hooks[entryPoint]) {
        hooks[entryPoint] = [];
      }
    };
    /**
     * RemoveAllHooks
     * Public method to remove all DOMPurify hooks
     */


    DOMPurify.removeAllHooks = function () {
      hooks = {};
    };

    return DOMPurify;
  }

  var purify = createDOMPurify();

  return purify;

}));
//# sourceMappingURL=purify.js.map


/***/ }),

/***/ "../node_modules/escape-html/index.js":
/*!********************************************!*\
  !*** ../node_modules/escape-html/index.js ***!
  \********************************************/
/***/ ((module) => {

"use strict";
/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * Copyright(c) 2015 Andreas Lubbe
 * Copyright(c) 2015 Tiancheng "Timothy" Gu
 * MIT Licensed
 */



/**
 * Module variables.
 * @private
 */

var matchHtmlRegExp = /["'&<>]/;

/**
 * Module exports.
 * @public
 */

module.exports = escapeHtml;

/**
 * Escape special characters in the given string of html.
 *
 * @param  {string} string The string to escape for inserting into HTML
 * @return {string}
 * @public
 */

function escapeHtml(string) {
  var str = '' + string;
  var match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 39: // '
        escape = '&#39;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index
    ? html + str.substring(lastIndex, index)
    : html;
}


/***/ }),

/***/ "../node_modules/process/browser.js":
/*!******************************************!*\
  !*** ../node_modules/process/browser.js ***!
  \******************************************/
/***/ ((module) => {

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


/***/ }),

/***/ "../../../node_modules/path/node_modules/inherits/inherits_browser.js":
/*!****************************************************************************!*\
  !*** ../../../node_modules/path/node_modules/inherits/inherits_browser.js ***!
  \****************************************************************************/
/***/ ((module) => {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ }),

/***/ "../../../node_modules/path/node_modules/util/support/isBufferBrowser.js":
/*!*******************************************************************************!*\
  !*** ../../../node_modules/path/node_modules/util/support/isBufferBrowser.js ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}

/***/ }),

/***/ "../../../node_modules/path/node_modules/util/util.js":
/*!************************************************************!*\
  !*** ../../../node_modules/path/node_modules/util/util.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* provided dependency */ var process = __webpack_require__(/*! process/browser.js */ "../../../node_modules/process/browser.js");
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(__webpack_require__.g.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = __webpack_require__(/*! ./support/isBuffer */ "../../../node_modules/path/node_modules/util/support/isBufferBrowser.js");

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = __webpack_require__(/*! inherits */ "../../../node_modules/path/node_modules/inherits/inherits_browser.js");

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}


/***/ }),

/***/ "../../../node_modules/path/path.js":
/*!******************************************!*\
  !*** ../../../node_modules/path/path.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var process = __webpack_require__(/*! process/browser.js */ "../../../node_modules/process/browser.js");
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.




var isWindows = process.platform === 'win32';
var util = __webpack_require__(/*! util */ "../../../node_modules/path/node_modules/util/util.js");


// resolves . and .. elements in a path array with directory names there
// must be no slashes or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  var res = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];

    // ignore empty parts
    if (!p || p === '.')
      continue;

    if (p === '..') {
      if (res.length && res[res.length - 1] !== '..') {
        res.pop();
      } else if (allowAboveRoot) {
        res.push('..');
      }
    } else {
      res.push(p);
    }
  }

  return res;
}

// returns an array with empty elements removed from either end of the input
// array or the original array if no elements need to be removed
function trimArray(arr) {
  var lastIndex = arr.length - 1;
  var start = 0;
  for (; start <= lastIndex; start++) {
    if (arr[start])
      break;
  }

  var end = lastIndex;
  for (; end >= 0; end--) {
    if (arr[end])
      break;
  }

  if (start === 0 && end === lastIndex)
    return arr;
  if (start > end)
    return [];
  return arr.slice(start, end + 1);
}

// Regex to split a windows path into three parts: [*, device, slash,
// tail] windows-only
var splitDeviceRe =
    /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;

// Regex to split the tail part of the above into [*, dir, basename, ext]
var splitTailRe =
    /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/;

var win32 = {};

// Function to split a filename into [root, dir, basename, ext]
function win32SplitPath(filename) {
  // Separate device+slash from tail
  var result = splitDeviceRe.exec(filename),
      device = (result[1] || '') + (result[2] || ''),
      tail = result[3] || '';
  // Split the tail into dir, basename and extension
  var result2 = splitTailRe.exec(tail),
      dir = result2[1],
      basename = result2[2],
      ext = result2[3];
  return [device, dir, basename, ext];
}

function win32StatPath(path) {
  var result = splitDeviceRe.exec(path),
      device = result[1] || '',
      isUnc = !!device && device[1] !== ':';
  return {
    device: device,
    isUnc: isUnc,
    isAbsolute: isUnc || !!result[2], // UNC paths are always absolute
    tail: result[3]
  };
}

function normalizeUNCRoot(device) {
  return '\\\\' + device.replace(/^[\\\/]+/, '').replace(/[\\\/]+/g, '\\');
}

// path.resolve([from ...], to)
win32.resolve = function() {
  var resolvedDevice = '',
      resolvedTail = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1; i--) {
    var path;
    if (i >= 0) {
      path = arguments[i];
    } else if (!resolvedDevice) {
      path = process.cwd();
    } else {
      // Windows has the concept of drive-specific current working
      // directories. If we've resolved a drive letter but not yet an
      // absolute path, get cwd for that drive. We're sure the device is not
      // an unc path at this points, because unc paths are always absolute.
      path = process.env['=' + resolvedDevice];
      // Verify that a drive-local cwd was found and that it actually points
      // to our drive. If not, default to the drive's root.
      if (!path || path.substr(0, 3).toLowerCase() !==
          resolvedDevice.toLowerCase() + '\\') {
        path = resolvedDevice + '\\';
      }
    }

    // Skip empty and invalid entries
    if (!util.isString(path)) {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    var result = win32StatPath(path),
        device = result.device,
        isUnc = result.isUnc,
        isAbsolute = result.isAbsolute,
        tail = result.tail;

    if (device &&
        resolvedDevice &&
        device.toLowerCase() !== resolvedDevice.toLowerCase()) {
      // This path points to another device so it is not applicable
      continue;
    }

    if (!resolvedDevice) {
      resolvedDevice = device;
    }
    if (!resolvedAbsolute) {
      resolvedTail = tail + '\\' + resolvedTail;
      resolvedAbsolute = isAbsolute;
    }

    if (resolvedDevice && resolvedAbsolute) {
      break;
    }
  }

  // Convert slashes to backslashes when `resolvedDevice` points to an UNC
  // root. Also squash multiple slashes into a single one where appropriate.
  if (isUnc) {
    resolvedDevice = normalizeUNCRoot(resolvedDevice);
  }

  // At this point the path should be resolved to a full absolute path,
  // but handle relative paths to be safe (might happen when process.cwd()
  // fails)

  // Normalize the tail path
  resolvedTail = normalizeArray(resolvedTail.split(/[\\\/]+/),
                                !resolvedAbsolute).join('\\');

  return (resolvedDevice + (resolvedAbsolute ? '\\' : '') + resolvedTail) ||
         '.';
};


win32.normalize = function(path) {
  var result = win32StatPath(path),
      device = result.device,
      isUnc = result.isUnc,
      isAbsolute = result.isAbsolute,
      tail = result.tail,
      trailingSlash = /[\\\/]$/.test(tail);

  // Normalize the tail path
  tail = normalizeArray(tail.split(/[\\\/]+/), !isAbsolute).join('\\');

  if (!tail && !isAbsolute) {
    tail = '.';
  }
  if (tail && trailingSlash) {
    tail += '\\';
  }

  // Convert slashes to backslashes when `device` points to an UNC root.
  // Also squash multiple slashes into a single one where appropriate.
  if (isUnc) {
    device = normalizeUNCRoot(device);
  }

  return device + (isAbsolute ? '\\' : '') + tail;
};


win32.isAbsolute = function(path) {
  return win32StatPath(path).isAbsolute;
};

win32.join = function() {
  var paths = [];
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if (!util.isString(arg)) {
      throw new TypeError('Arguments to path.join must be strings');
    }
    if (arg) {
      paths.push(arg);
    }
  }

  var joined = paths.join('\\');

  // Make sure that the joined path doesn't start with two slashes, because
  // normalize() will mistake it for an UNC path then.
  //
  // This step is skipped when it is very clear that the user actually
  // intended to point at an UNC path. This is assumed when the first
  // non-empty string arguments starts with exactly two slashes followed by
  // at least one more non-slash character.
  //
  // Note that for normalize() to treat a path as an UNC path it needs to
  // have at least 2 components, so we don't filter for that here.
  // This means that the user can use join to construct UNC paths from
  // a server name and a share name; for example:
  //   path.join('//server', 'share') -> '\\\\server\\share\')
  if (!/^[\\\/]{2}[^\\\/]/.test(paths[0])) {
    joined = joined.replace(/^[\\\/]{2,}/, '\\');
  }

  return win32.normalize(joined);
};


// path.relative(from, to)
// it will solve the relative path from 'from' to 'to', for instance:
// from = 'C:\\orandea\\test\\aaa'
// to = 'C:\\orandea\\impl\\bbb'
// The output of the function should be: '..\\..\\impl\\bbb'
win32.relative = function(from, to) {
  from = win32.resolve(from);
  to = win32.resolve(to);

  // windows is not case sensitive
  var lowerFrom = from.toLowerCase();
  var lowerTo = to.toLowerCase();

  var toParts = trimArray(to.split('\\'));

  var lowerFromParts = trimArray(lowerFrom.split('\\'));
  var lowerToParts = trimArray(lowerTo.split('\\'));

  var length = Math.min(lowerFromParts.length, lowerToParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (lowerFromParts[i] !== lowerToParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  if (samePartsLength == 0) {
    return to;
  }

  var outputParts = [];
  for (var i = samePartsLength; i < lowerFromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('\\');
};


win32._makeLong = function(path) {
  // Note: this will *probably* throw somewhere.
  if (!util.isString(path))
    return path;

  if (!path) {
    return '';
  }

  var resolvedPath = win32.resolve(path);

  if (/^[a-zA-Z]\:\\/.test(resolvedPath)) {
    // path is local filesystem path, which needs to be converted
    // to long UNC path.
    return '\\\\?\\' + resolvedPath;
  } else if (/^\\\\[^?.]/.test(resolvedPath)) {
    // path is network UNC path, which needs to be converted
    // to long UNC path.
    return '\\\\?\\UNC\\' + resolvedPath.substring(2);
  }

  return path;
};


win32.dirname = function(path) {
  var result = win32SplitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


win32.basename = function(path, ext) {
  var f = win32SplitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


win32.extname = function(path) {
  return win32SplitPath(path)[3];
};


win32.format = function(pathObject) {
  if (!util.isObject(pathObject)) {
    throw new TypeError(
        "Parameter 'pathObject' must be an object, not " + typeof pathObject
    );
  }

  var root = pathObject.root || '';

  if (!util.isString(root)) {
    throw new TypeError(
        "'pathObject.root' must be a string or undefined, not " +
        typeof pathObject.root
    );
  }

  var dir = pathObject.dir;
  var base = pathObject.base || '';
  if (!dir) {
    return base;
  }
  if (dir[dir.length - 1] === win32.sep) {
    return dir + base;
  }
  return dir + win32.sep + base;
};


win32.parse = function(pathString) {
  if (!util.isString(pathString)) {
    throw new TypeError(
        "Parameter 'pathString' must be a string, not " + typeof pathString
    );
  }
  var allParts = win32SplitPath(pathString);
  if (!allParts || allParts.length !== 4) {
    throw new TypeError("Invalid path '" + pathString + "'");
  }
  return {
    root: allParts[0],
    dir: allParts[0] + allParts[1].slice(0, -1),
    base: allParts[2],
    ext: allParts[3],
    name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
  };
};


win32.sep = '\\';
win32.delimiter = ';';


// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var posix = {};


function posixSplitPath(filename) {
  return splitPathRe.exec(filename).slice(1);
}


// path.resolve([from ...], to)
// posix version
posix.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (!util.isString(path)) {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path[0] === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(resolvedPath.split('/'),
                                !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
posix.normalize = function(path) {
  var isAbsolute = posix.isAbsolute(path),
      trailingSlash = path && path[path.length - 1] === '/';

  // Normalize the path
  path = normalizeArray(path.split('/'), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
posix.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
posix.join = function() {
  var path = '';
  for (var i = 0; i < arguments.length; i++) {
    var segment = arguments[i];
    if (!util.isString(segment)) {
      throw new TypeError('Arguments to path.join must be strings');
    }
    if (segment) {
      if (!path) {
        path += segment;
      } else {
        path += '/' + segment;
      }
    }
  }
  return posix.normalize(path);
};


// path.relative(from, to)
// posix version
posix.relative = function(from, to) {
  from = posix.resolve(from).substr(1);
  to = posix.resolve(to).substr(1);

  var fromParts = trimArray(from.split('/'));
  var toParts = trimArray(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};


posix._makeLong = function(path) {
  return path;
};


posix.dirname = function(path) {
  var result = posixSplitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


posix.basename = function(path, ext) {
  var f = posixSplitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


posix.extname = function(path) {
  return posixSplitPath(path)[3];
};


posix.format = function(pathObject) {
  if (!util.isObject(pathObject)) {
    throw new TypeError(
        "Parameter 'pathObject' must be an object, not " + typeof pathObject
    );
  }

  var root = pathObject.root || '';

  if (!util.isString(root)) {
    throw new TypeError(
        "'pathObject.root' must be a string or undefined, not " +
        typeof pathObject.root
    );
  }

  var dir = pathObject.dir ? pathObject.dir + posix.sep : '';
  var base = pathObject.base || '';
  return dir + base;
};


posix.parse = function(pathString) {
  if (!util.isString(pathString)) {
    throw new TypeError(
        "Parameter 'pathString' must be a string, not " + typeof pathString
    );
  }
  var allParts = posixSplitPath(pathString);
  if (!allParts || allParts.length !== 4) {
    throw new TypeError("Invalid path '" + pathString + "'");
  }
  allParts[1] = allParts[1] || '';
  allParts[2] = allParts[2] || '';
  allParts[3] = allParts[3] || '';

  return {
    root: allParts[0],
    dir: allParts[0] + allParts[1].slice(0, -1),
    base: allParts[2],
    ext: allParts[3],
    name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
  };
};


posix.sep = '/';
posix.delimiter = ':';


if (isWindows)
  module.exports = win32;
else /* posix */
  module.exports = posix;

module.exports.posix = posix;
module.exports.win32 = win32;


/***/ }),

/***/ "../../../node_modules/process/browser.js":
/*!************************************************!*\
  !*** ../../../node_modules/process/browser.js ***!
  \************************************************/
/***/ ((module) => {

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


/***/ }),

/***/ "../node_modules/@nextcloud/event-bus/dist/index.cjs":
/*!***********************************************************!*\
  !*** ../node_modules/@nextcloud/event-bus/dist/index.cjs ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var valid = __webpack_require__(/*! semver/functions/valid.js */ "../node_modules/@nextcloud/event-bus/node_modules/semver/functions/valid.js");
var major = __webpack_require__(/*! semver/functions/major.js */ "../node_modules/@nextcloud/event-bus/node_modules/semver/functions/major.js");

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var valid__default = /*#__PURE__*/_interopDefaultLegacy(valid);
var major__default = /*#__PURE__*/_interopDefaultLegacy(major);

var ProxyBus = /** @class */ (function () {
    function ProxyBus(bus) {
        if (typeof bus.getVersion !== 'function' || !valid__default["default"](bus.getVersion())) {
            console.warn('Proxying an event bus with an unknown or invalid version');
        }
        else if (major__default["default"](bus.getVersion()) !== major__default["default"](this.getVersion())) {
            console.warn('Proxying an event bus of version ' + bus.getVersion() + ' with ' + this.getVersion());
        }
        this.bus = bus;
    }
    ProxyBus.prototype.getVersion = function () {
        return "3.1.0";
    };
    ProxyBus.prototype.subscribe = function (name, handler) {
        this.bus.subscribe(name, handler);
    };
    ProxyBus.prototype.unsubscribe = function (name, handler) {
        this.bus.unsubscribe(name, handler);
    };
    ProxyBus.prototype.emit = function (name, event) {
        this.bus.emit(name, event);
    };
    return ProxyBus;
}());

var SimpleBus = /** @class */ (function () {
    function SimpleBus() {
        this.handlers = new Map();
    }
    SimpleBus.prototype.getVersion = function () {
        return "3.1.0";
    };
    SimpleBus.prototype.subscribe = function (name, handler) {
        this.handlers.set(name, (this.handlers.get(name) || []).concat(handler));
    };
    SimpleBus.prototype.unsubscribe = function (name, handler) {
        this.handlers.set(name, (this.handlers.get(name) || []).filter(function (h) { return h != handler; }));
    };
    SimpleBus.prototype.emit = function (name, event) {
        (this.handlers.get(name) || []).forEach(function (h) {
            try {
                h(event);
            }
            catch (e) {
                console.error('could not invoke event listener', e);
            }
        });
    };
    return SimpleBus;
}());

var bus = null;
function getBus() {
    if (bus !== null) {
        return bus;
    }
    if (typeof window === 'undefined') {
        // testing or SSR
        return new Proxy({}, {
            get: function () {
                return function () { return console.error('Window not available, EventBus can not be established!'); };
            }
        });
    }
    if (typeof window.OC !== 'undefined' && window.OC._eventBus && typeof window._nc_event_bus === 'undefined') {
        console.warn('found old event bus instance at OC._eventBus. Update your version!');
        window._nc_event_bus = window.OC._eventBus;
    }
    // Either use an existing event bus instance or create one
    if (typeof (window === null || window === void 0 ? void 0 : window._nc_event_bus) !== 'undefined') {
        bus = new ProxyBus(window._nc_event_bus);
    }
    else {
        bus = window._nc_event_bus = new SimpleBus();
    }
    return bus;
}
/**
 * Register an event listener
 *
 * @param name name of the event
 * @param handler callback invoked for every matching event emitted on the bus
 */
function subscribe(name, handler) {
    getBus().subscribe(name, handler);
}
/**
 * Unregister a previously registered event listener
 *
 * Note: doesn't work with anonymous functions (closures). Use method of an object or store listener function in variable.
 *
 * @param name name of the event
 * @param handler callback passed to `subscribed`
 */
function unsubscribe(name, handler) {
    getBus().unsubscribe(name, handler);
}
/**
 * Emit an event
 *
 * @param name name of the event
 * @param event event payload
 */
function emit(name, event) {
    getBus().emit(name, event);
}

exports.ProxyBus = ProxyBus;
exports.SimpleBus = SimpleBus;
exports.emit = emit;
exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;
//# sourceMappingURL=index.cjs.map


/***/ }),

/***/ "../node_modules/core-js/internals/a-callable.js":
/*!*******************************************************!*\
  !*** ../node_modules/core-js/internals/a-callable.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var tryToString = __webpack_require__(/*! ../internals/try-to-string */ "../node_modules/core-js/internals/try-to-string.js");

var $TypeError = TypeError;

// `Assert: IsCallable(argument) is true`
module.exports = function (argument) {
  if (isCallable(argument)) return argument;
  throw new $TypeError(tryToString(argument) + ' is not a function');
};


/***/ }),

/***/ "../node_modules/core-js/internals/a-constructor.js":
/*!**********************************************************!*\
  !*** ../node_modules/core-js/internals/a-constructor.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var isConstructor = __webpack_require__(/*! ../internals/is-constructor */ "../node_modules/core-js/internals/is-constructor.js");
var tryToString = __webpack_require__(/*! ../internals/try-to-string */ "../node_modules/core-js/internals/try-to-string.js");

var $TypeError = TypeError;

// `Assert: IsConstructor(argument) is true`
module.exports = function (argument) {
  if (isConstructor(argument)) return argument;
  throw new $TypeError(tryToString(argument) + ' is not a constructor');
};


/***/ }),

/***/ "../node_modules/core-js/internals/a-possible-prototype.js":
/*!*****************************************************************!*\
  !*** ../node_modules/core-js/internals/a-possible-prototype.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");

var $String = String;
var $TypeError = TypeError;

module.exports = function (argument) {
  if (typeof argument == 'object' || isCallable(argument)) return argument;
  throw new $TypeError("Can't set " + $String(argument) + ' as a prototype');
};


/***/ }),

/***/ "../node_modules/core-js/internals/add-to-unscopables.js":
/*!***************************************************************!*\
  !*** ../node_modules/core-js/internals/add-to-unscopables.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");
var create = __webpack_require__(/*! ../internals/object-create */ "../node_modules/core-js/internals/object-create.js");
var defineProperty = (__webpack_require__(/*! ../internals/object-define-property */ "../node_modules/core-js/internals/object-define-property.js").f);

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] === undefined) {
  defineProperty(ArrayPrototype, UNSCOPABLES, {
    configurable: true,
    value: create(null)
  });
}

// add a key to Array.prototype[@@unscopables]
module.exports = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};


/***/ }),

/***/ "../node_modules/core-js/internals/advance-string-index.js":
/*!*****************************************************************!*\
  !*** ../node_modules/core-js/internals/advance-string-index.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var charAt = (__webpack_require__(/*! ../internals/string-multibyte */ "../node_modules/core-js/internals/string-multibyte.js").charAt);

// `AdvanceStringIndex` abstract operation
// https://tc39.es/ecma262/#sec-advancestringindex
module.exports = function (S, index, unicode) {
  return index + (unicode ? charAt(S, index).length : 1);
};


/***/ }),

/***/ "../node_modules/core-js/internals/an-object.js":
/*!******************************************************!*\
  !*** ../node_modules/core-js/internals/an-object.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var isObject = __webpack_require__(/*! ../internals/is-object */ "../node_modules/core-js/internals/is-object.js");

var $String = String;
var $TypeError = TypeError;

// `Assert: Type(argument) is Object`
module.exports = function (argument) {
  if (isObject(argument)) return argument;
  throw new $TypeError($String(argument) + ' is not an object');
};


/***/ }),

/***/ "../node_modules/core-js/internals/array-includes.js":
/*!***********************************************************!*\
  !*** ../node_modules/core-js/internals/array-includes.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "../node_modules/core-js/internals/to-indexed-object.js");
var toAbsoluteIndex = __webpack_require__(/*! ../internals/to-absolute-index */ "../node_modules/core-js/internals/to-absolute-index.js");
var lengthOfArrayLike = __webpack_require__(/*! ../internals/length-of-array-like */ "../node_modules/core-js/internals/length-of-array-like.js");

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = lengthOfArrayLike(O);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el !== el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value !== value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

module.exports = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};


/***/ }),

/***/ "../node_modules/core-js/internals/array-iteration.js":
/*!************************************************************!*\
  !*** ../node_modules/core-js/internals/array-iteration.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var bind = __webpack_require__(/*! ../internals/function-bind-context */ "../node_modules/core-js/internals/function-bind-context.js");
var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var IndexedObject = __webpack_require__(/*! ../internals/indexed-object */ "../node_modules/core-js/internals/indexed-object.js");
var toObject = __webpack_require__(/*! ../internals/to-object */ "../node_modules/core-js/internals/to-object.js");
var lengthOfArrayLike = __webpack_require__(/*! ../internals/length-of-array-like */ "../node_modules/core-js/internals/length-of-array-like.js");
var arraySpeciesCreate = __webpack_require__(/*! ../internals/array-species-create */ "../node_modules/core-js/internals/array-species-create.js");

var push = uncurryThis([].push);

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
var createMethod = function (TYPE) {
  var IS_MAP = TYPE === 1;
  var IS_FILTER = TYPE === 2;
  var IS_SOME = TYPE === 3;
  var IS_EVERY = TYPE === 4;
  var IS_FIND_INDEX = TYPE === 6;
  var IS_FILTER_REJECT = TYPE === 7;
  var NO_HOLES = TYPE === 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject($this);
    var self = IndexedObject(O);
    var length = lengthOfArrayLike(self);
    var boundFunction = bind(callbackfn, that);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate;
    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_REJECT ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: push(target, value);      // filter
        } else switch (TYPE) {
          case 4: return false;             // every
          case 7: push(target, value);      // filterReject
        }
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

module.exports = {
  // `Array.prototype.forEach` method
  // https://tc39.es/ecma262/#sec-array.prototype.foreach
  forEach: createMethod(0),
  // `Array.prototype.map` method
  // https://tc39.es/ecma262/#sec-array.prototype.map
  map: createMethod(1),
  // `Array.prototype.filter` method
  // https://tc39.es/ecma262/#sec-array.prototype.filter
  filter: createMethod(2),
  // `Array.prototype.some` method
  // https://tc39.es/ecma262/#sec-array.prototype.some
  some: createMethod(3),
  // `Array.prototype.every` method
  // https://tc39.es/ecma262/#sec-array.prototype.every
  every: createMethod(4),
  // `Array.prototype.find` method
  // https://tc39.es/ecma262/#sec-array.prototype.find
  find: createMethod(5),
  // `Array.prototype.findIndex` method
  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod(6),
  // `Array.prototype.filterReject` method
  // https://github.com/tc39/proposal-array-filtering
  filterReject: createMethod(7)
};


/***/ }),

/***/ "../node_modules/core-js/internals/array-method-has-species-support.js":
/*!*****************************************************************************!*\
  !*** ../node_modules/core-js/internals/array-method-has-species-support.js ***!
  \*****************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");
var V8_VERSION = __webpack_require__(/*! ../internals/engine-v8-version */ "../node_modules/core-js/internals/engine-v8-version.js");

var SPECIES = wellKnownSymbol('species');

module.exports = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return V8_VERSION >= 51 || !fails(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};


/***/ }),

/***/ "../node_modules/core-js/internals/array-method-is-strict.js":
/*!*******************************************************************!*\
  !*** ../node_modules/core-js/internals/array-method-is-strict.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");

module.exports = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call -- required for testing
    method.call(null, argument || function () { return 1; }, 1);
  });
};


/***/ }),

/***/ "../node_modules/core-js/internals/array-reduce.js":
/*!*********************************************************!*\
  !*** ../node_modules/core-js/internals/array-reduce.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var aCallable = __webpack_require__(/*! ../internals/a-callable */ "../node_modules/core-js/internals/a-callable.js");
var toObject = __webpack_require__(/*! ../internals/to-object */ "../node_modules/core-js/internals/to-object.js");
var IndexedObject = __webpack_require__(/*! ../internals/indexed-object */ "../node_modules/core-js/internals/indexed-object.js");
var lengthOfArrayLike = __webpack_require__(/*! ../internals/length-of-array-like */ "../node_modules/core-js/internals/length-of-array-like.js");

var $TypeError = TypeError;

// `Array.prototype.{ reduce, reduceRight }` methods implementation
var createMethod = function (IS_RIGHT) {
  return function (that, callbackfn, argumentsLength, memo) {
    var O = toObject(that);
    var self = IndexedObject(O);
    var length = lengthOfArrayLike(O);
    aCallable(callbackfn);
    var index = IS_RIGHT ? length - 1 : 0;
    var i = IS_RIGHT ? -1 : 1;
    if (argumentsLength < 2) while (true) {
      if (index in self) {
        memo = self[index];
        index += i;
        break;
      }
      index += i;
      if (IS_RIGHT ? index < 0 : length <= index) {
        throw new $TypeError('Reduce of empty array with no initial value');
      }
    }
    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
      memo = callbackfn(memo, self[index], index, O);
    }
    return memo;
  };
};

module.exports = {
  // `Array.prototype.reduce` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduce
  left: createMethod(false),
  // `Array.prototype.reduceRight` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduceright
  right: createMethod(true)
};


/***/ }),

/***/ "../node_modules/core-js/internals/array-slice-simple.js":
/*!***************************************************************!*\
  !*** ../node_modules/core-js/internals/array-slice-simple.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var toAbsoluteIndex = __webpack_require__(/*! ../internals/to-absolute-index */ "../node_modules/core-js/internals/to-absolute-index.js");
var lengthOfArrayLike = __webpack_require__(/*! ../internals/length-of-array-like */ "../node_modules/core-js/internals/length-of-array-like.js");
var createProperty = __webpack_require__(/*! ../internals/create-property */ "../node_modules/core-js/internals/create-property.js");

var $Array = Array;
var max = Math.max;

module.exports = function (O, start, end) {
  var length = lengthOfArrayLike(O);
  var k = toAbsoluteIndex(start, length);
  var fin = toAbsoluteIndex(end === undefined ? length : end, length);
  var result = $Array(max(fin - k, 0));
  var n = 0;
  for (; k < fin; k++, n++) createProperty(result, n, O[k]);
  result.length = n;
  return result;
};


/***/ }),

/***/ "../node_modules/core-js/internals/array-slice.js":
/*!********************************************************!*\
  !*** ../node_modules/core-js/internals/array-slice.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");

module.exports = uncurryThis([].slice);


/***/ }),

/***/ "../node_modules/core-js/internals/array-species-constructor.js":
/*!**********************************************************************!*\
  !*** ../node_modules/core-js/internals/array-species-constructor.js ***!
  \**********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var isArray = __webpack_require__(/*! ../internals/is-array */ "../node_modules/core-js/internals/is-array.js");
var isConstructor = __webpack_require__(/*! ../internals/is-constructor */ "../node_modules/core-js/internals/is-constructor.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "../node_modules/core-js/internals/is-object.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");

var SPECIES = wellKnownSymbol('species');
var $Array = Array;

// a part of `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
module.exports = function (originalArray) {
  var C;
  if (isArray(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (isConstructor(C) && (C === $Array || isArray(C.prototype))) C = undefined;
    else if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? $Array : C;
};


/***/ }),

/***/ "../node_modules/core-js/internals/array-species-create.js":
/*!*****************************************************************!*\
  !*** ../node_modules/core-js/internals/array-species-create.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var arraySpeciesConstructor = __webpack_require__(/*! ../internals/array-species-constructor */ "../node_modules/core-js/internals/array-species-constructor.js");

// `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
module.exports = function (originalArray, length) {
  return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
};


/***/ }),

/***/ "../node_modules/core-js/internals/classof-raw.js":
/*!********************************************************!*\
  !*** ../node_modules/core-js/internals/classof-raw.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");

var toString = uncurryThis({}.toString);
var stringSlice = uncurryThis(''.slice);

module.exports = function (it) {
  return stringSlice(toString(it), 8, -1);
};


/***/ }),

/***/ "../node_modules/core-js/internals/classof.js":
/*!****************************************************!*\
  !*** ../node_modules/core-js/internals/classof.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var TO_STRING_TAG_SUPPORT = __webpack_require__(/*! ../internals/to-string-tag-support */ "../node_modules/core-js/internals/to-string-tag-support.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var classofRaw = __webpack_require__(/*! ../internals/classof-raw */ "../node_modules/core-js/internals/classof-raw.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var $Object = Object;

// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) === 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
module.exports = TO_STRING_TAG_SUPPORT ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = $Object(it), TO_STRING_TAG)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) === 'Object' && isCallable(O.callee) ? 'Arguments' : result;
};


/***/ }),

/***/ "../node_modules/core-js/internals/copy-constructor-properties.js":
/*!************************************************************************!*\
  !*** ../node_modules/core-js/internals/copy-constructor-properties.js ***!
  \************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "../node_modules/core-js/internals/has-own-property.js");
var ownKeys = __webpack_require__(/*! ../internals/own-keys */ "../node_modules/core-js/internals/own-keys.js");
var getOwnPropertyDescriptorModule = __webpack_require__(/*! ../internals/object-get-own-property-descriptor */ "../node_modules/core-js/internals/object-get-own-property-descriptor.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "../node_modules/core-js/internals/object-define-property.js");

module.exports = function (target, source, exceptions) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!hasOwn(target, key) && !(exceptions && hasOwn(exceptions, key))) {
      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  }
};


/***/ }),

/***/ "../node_modules/core-js/internals/correct-prototype-getter.js":
/*!*********************************************************************!*\
  !*** ../node_modules/core-js/internals/correct-prototype-getter.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");

module.exports = !fails(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
  return Object.getPrototypeOf(new F()) !== F.prototype;
});


/***/ }),

/***/ "../node_modules/core-js/internals/create-iter-result-object.js":
/*!**********************************************************************!*\
  !*** ../node_modules/core-js/internals/create-iter-result-object.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";

// `CreateIterResultObject` abstract operation
// https://tc39.es/ecma262/#sec-createiterresultobject
module.exports = function (value, done) {
  return { value: value, done: done };
};


/***/ }),

/***/ "../node_modules/core-js/internals/create-non-enumerable-property.js":
/*!***************************************************************************!*\
  !*** ../node_modules/core-js/internals/create-non-enumerable-property.js ***!
  \***************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "../node_modules/core-js/internals/descriptors.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "../node_modules/core-js/internals/object-define-property.js");
var createPropertyDescriptor = __webpack_require__(/*! ../internals/create-property-descriptor */ "../node_modules/core-js/internals/create-property-descriptor.js");

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ "../node_modules/core-js/internals/create-property-descriptor.js":
/*!***********************************************************************!*\
  !*** ../node_modules/core-js/internals/create-property-descriptor.js ***!
  \***********************************************************************/
/***/ ((module) => {

"use strict";

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),

/***/ "../node_modules/core-js/internals/create-property.js":
/*!************************************************************!*\
  !*** ../node_modules/core-js/internals/create-property.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var toPropertyKey = __webpack_require__(/*! ../internals/to-property-key */ "../node_modules/core-js/internals/to-property-key.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "../node_modules/core-js/internals/object-define-property.js");
var createPropertyDescriptor = __webpack_require__(/*! ../internals/create-property-descriptor */ "../node_modules/core-js/internals/create-property-descriptor.js");

module.exports = function (object, key, value) {
  var propertyKey = toPropertyKey(key);
  if (propertyKey in object) definePropertyModule.f(object, propertyKey, createPropertyDescriptor(0, value));
  else object[propertyKey] = value;
};


/***/ }),

/***/ "../node_modules/core-js/internals/date-to-primitive.js":
/*!**************************************************************!*\
  !*** ../node_modules/core-js/internals/date-to-primitive.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var anObject = __webpack_require__(/*! ../internals/an-object */ "../node_modules/core-js/internals/an-object.js");
var ordinaryToPrimitive = __webpack_require__(/*! ../internals/ordinary-to-primitive */ "../node_modules/core-js/internals/ordinary-to-primitive.js");

var $TypeError = TypeError;

// `Date.prototype[@@toPrimitive](hint)` method implementation
// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
module.exports = function (hint) {
  anObject(this);
  if (hint === 'string' || hint === 'default') hint = 'string';
  else if (hint !== 'number') throw new $TypeError('Incorrect hint');
  return ordinaryToPrimitive(this, hint);
};


/***/ }),

/***/ "../node_modules/core-js/internals/define-built-in-accessor.js":
/*!*********************************************************************!*\
  !*** ../node_modules/core-js/internals/define-built-in-accessor.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var makeBuiltIn = __webpack_require__(/*! ../internals/make-built-in */ "../node_modules/core-js/internals/make-built-in.js");
var defineProperty = __webpack_require__(/*! ../internals/object-define-property */ "../node_modules/core-js/internals/object-define-property.js");

module.exports = function (target, name, descriptor) {
  if (descriptor.get) makeBuiltIn(descriptor.get, name, { getter: true });
  if (descriptor.set) makeBuiltIn(descriptor.set, name, { setter: true });
  return defineProperty.f(target, name, descriptor);
};


/***/ }),

/***/ "../node_modules/core-js/internals/define-built-in.js":
/*!************************************************************!*\
  !*** ../node_modules/core-js/internals/define-built-in.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "../node_modules/core-js/internals/object-define-property.js");
var makeBuiltIn = __webpack_require__(/*! ../internals/make-built-in */ "../node_modules/core-js/internals/make-built-in.js");
var defineGlobalProperty = __webpack_require__(/*! ../internals/define-global-property */ "../node_modules/core-js/internals/define-global-property.js");

module.exports = function (O, key, value, options) {
  if (!options) options = {};
  var simple = options.enumerable;
  var name = options.name !== undefined ? options.name : key;
  if (isCallable(value)) makeBuiltIn(value, name, options);
  if (options.global) {
    if (simple) O[key] = value;
    else defineGlobalProperty(key, value);
  } else {
    try {
      if (!options.unsafe) delete O[key];
      else if (O[key]) simple = true;
    } catch (error) { /* empty */ }
    if (simple) O[key] = value;
    else definePropertyModule.f(O, key, {
      value: value,
      enumerable: false,
      configurable: !options.nonConfigurable,
      writable: !options.nonWritable
    });
  } return O;
};


/***/ }),

/***/ "../node_modules/core-js/internals/define-global-property.js":
/*!*******************************************************************!*\
  !*** ../node_modules/core-js/internals/define-global-property.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");

// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;

module.exports = function (key, value) {
  try {
    defineProperty(global, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    global[key] = value;
  } return value;
};


/***/ }),

/***/ "../node_modules/core-js/internals/descriptors.js":
/*!********************************************************!*\
  !*** ../node_modules/core-js/internals/descriptors.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");

// Detect IE8's incomplete defineProperty implementation
module.exports = !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] !== 7;
});


/***/ }),

/***/ "../node_modules/core-js/internals/document-all.js":
/*!*********************************************************!*\
  !*** ../node_modules/core-js/internals/document-all.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";

var documentAll = typeof document == 'object' && document.all;

// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
// eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
var IS_HTMLDDA = typeof documentAll == 'undefined' && documentAll !== undefined;

module.exports = {
  all: documentAll,
  IS_HTMLDDA: IS_HTMLDDA
};


/***/ }),

/***/ "../node_modules/core-js/internals/document-create-element.js":
/*!********************************************************************!*\
  !*** ../node_modules/core-js/internals/document-create-element.js ***!
  \********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "../node_modules/core-js/internals/is-object.js");

var document = global.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};


/***/ }),

/***/ "../node_modules/core-js/internals/does-not-exceed-safe-integer.js":
/*!*************************************************************************!*\
  !*** ../node_modules/core-js/internals/does-not-exceed-safe-integer.js ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";

var $TypeError = TypeError;
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF; // 2 ** 53 - 1 == 9007199254740991

module.exports = function (it) {
  if (it > MAX_SAFE_INTEGER) throw $TypeError('Maximum allowed index exceeded');
  return it;
};


/***/ }),

/***/ "../node_modules/core-js/internals/dom-iterables.js":
/*!**********************************************************!*\
  !*** ../node_modules/core-js/internals/dom-iterables.js ***!
  \**********************************************************/
/***/ ((module) => {

"use strict";

// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
module.exports = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};


/***/ }),

/***/ "../node_modules/core-js/internals/dom-token-list-prototype.js":
/*!*********************************************************************!*\
  !*** ../node_modules/core-js/internals/dom-token-list-prototype.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

// in old WebKit versions, `element.classList` is not an instance of global `DOMTokenList`
var documentCreateElement = __webpack_require__(/*! ../internals/document-create-element */ "../node_modules/core-js/internals/document-create-element.js");

var classList = documentCreateElement('span').classList;
var DOMTokenListPrototype = classList && classList.constructor && classList.constructor.prototype;

module.exports = DOMTokenListPrototype === Object.prototype ? undefined : DOMTokenListPrototype;


/***/ }),

/***/ "../node_modules/core-js/internals/engine-is-node.js":
/*!***********************************************************!*\
  !*** ../node_modules/core-js/internals/engine-is-node.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");
var classof = __webpack_require__(/*! ../internals/classof-raw */ "../node_modules/core-js/internals/classof-raw.js");

module.exports = classof(global.process) === 'process';


/***/ }),

/***/ "../node_modules/core-js/internals/engine-user-agent.js":
/*!**************************************************************!*\
  !*** ../node_modules/core-js/internals/engine-user-agent.js ***!
  \**************************************************************/
/***/ ((module) => {

"use strict";

module.exports = typeof navigator != 'undefined' && String(navigator.userAgent) || '';


/***/ }),

/***/ "../node_modules/core-js/internals/engine-v8-version.js":
/*!**************************************************************!*\
  !*** ../node_modules/core-js/internals/engine-v8-version.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");
var userAgent = __webpack_require__(/*! ../internals/engine-user-agent */ "../node_modules/core-js/internals/engine-user-agent.js");

var process = global.process;
var Deno = global.Deno;
var versions = process && process.versions || Deno && Deno.version;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
  // but their correct versions are not interesting for us
  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
}

// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
// so check `userAgent` even if `.v8` exists, but 0
if (!version && userAgent) {
  match = userAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent.match(/Chrome\/(\d+)/);
    if (match) version = +match[1];
  }
}

module.exports = version;


/***/ }),

/***/ "../node_modules/core-js/internals/enum-bug-keys.js":
/*!**********************************************************!*\
  !*** ../node_modules/core-js/internals/enum-bug-keys.js ***!
  \**********************************************************/
/***/ ((module) => {

"use strict";

// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/***/ }),

/***/ "../node_modules/core-js/internals/export.js":
/*!***************************************************!*\
  !*** ../node_modules/core-js/internals/export.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");
var getOwnPropertyDescriptor = (__webpack_require__(/*! ../internals/object-get-own-property-descriptor */ "../node_modules/core-js/internals/object-get-own-property-descriptor.js").f);
var createNonEnumerableProperty = __webpack_require__(/*! ../internals/create-non-enumerable-property */ "../node_modules/core-js/internals/create-non-enumerable-property.js");
var defineBuiltIn = __webpack_require__(/*! ../internals/define-built-in */ "../node_modules/core-js/internals/define-built-in.js");
var defineGlobalProperty = __webpack_require__(/*! ../internals/define-global-property */ "../node_modules/core-js/internals/define-global-property.js");
var copyConstructorProperties = __webpack_require__(/*! ../internals/copy-constructor-properties */ "../node_modules/core-js/internals/copy-constructor-properties.js");
var isForced = __webpack_require__(/*! ../internals/is-forced */ "../node_modules/core-js/internals/is-forced.js");

/*
  options.target         - name of the target object
  options.global         - target is the global object
  options.stat           - export as static methods of target
  options.proto          - export as prototype methods of target
  options.real           - real prototype method for the `pure` version
  options.forced         - export even if the native feature is available
  options.bind           - bind methods to the target, required for the `pure` version
  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
  options.sham           - add a flag to not completely full polyfills
  options.enumerable     - export as enumerable property
  options.dontCallGetSet - prevent calling a getter on target
  options.name           - the .name of the function if it does not match the key
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global;
  } else if (STATIC) {
    target = global[TARGET] || defineGlobalProperty(TARGET, {});
  } else {
    target = (global[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.dontCallGetSet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty == typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    defineBuiltIn(target, key, sourceProperty, options);
  }
};


/***/ }),

/***/ "../node_modules/core-js/internals/fails.js":
/*!**************************************************!*\
  !*** ../node_modules/core-js/internals/fails.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};


/***/ }),

/***/ "../node_modules/core-js/internals/fix-regexp-well-known-symbol-logic.js":
/*!*******************************************************************************!*\
  !*** ../node_modules/core-js/internals/fix-regexp-well-known-symbol-logic.js ***!
  \*******************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

// TODO: Remove from `core-js@4` since it's moved to entry points
__webpack_require__(/*! ../modules/es.regexp.exec */ "../node_modules/core-js/modules/es.regexp.exec.js");
var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this-clause */ "../node_modules/core-js/internals/function-uncurry-this-clause.js");
var defineBuiltIn = __webpack_require__(/*! ../internals/define-built-in */ "../node_modules/core-js/internals/define-built-in.js");
var regexpExec = __webpack_require__(/*! ../internals/regexp-exec */ "../node_modules/core-js/internals/regexp-exec.js");
var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");
var createNonEnumerableProperty = __webpack_require__(/*! ../internals/create-non-enumerable-property */ "../node_modules/core-js/internals/create-non-enumerable-property.js");

var SPECIES = wellKnownSymbol('species');
var RegExpPrototype = RegExp.prototype;

module.exports = function (KEY, exec, FORCED, SHAM) {
  var SYMBOL = wellKnownSymbol(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) !== 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;

    if (KEY === 'split') {
      // We can't use real regex here since it causes deoptimization
      // and serious performance degradation in V8
      // https://github.com/zloirock/core-js/issues/306
      re = {};
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES] = function () { return re; };
      re.flags = '';
      re[SYMBOL] = /./[SYMBOL];
    }

    re.exec = function () {
      execCalled = true;
      return null;
    };

    re[SYMBOL]('');
    return !execCalled;
  });

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    FORCED
  ) {
    var uncurriedNativeRegExpMethod = uncurryThis(/./[SYMBOL]);
    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
      var uncurriedNativeMethod = uncurryThis(nativeMethod);
      var $exec = regexp.exec;
      if ($exec === regexpExec || $exec === RegExpPrototype.exec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: uncurriedNativeRegExpMethod(regexp, str, arg2) };
        }
        return { done: true, value: uncurriedNativeMethod(str, regexp, arg2) };
      }
      return { done: false };
    });

    defineBuiltIn(String.prototype, KEY, methods[0]);
    defineBuiltIn(RegExpPrototype, SYMBOL, methods[1]);
  }

  if (SHAM) createNonEnumerableProperty(RegExpPrototype[SYMBOL], 'sham', true);
};


/***/ }),

/***/ "../node_modules/core-js/internals/function-apply.js":
/*!***********************************************************!*\
  !*** ../node_modules/core-js/internals/function-apply.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var NATIVE_BIND = __webpack_require__(/*! ../internals/function-bind-native */ "../node_modules/core-js/internals/function-bind-native.js");

var FunctionPrototype = Function.prototype;
var apply = FunctionPrototype.apply;
var call = FunctionPrototype.call;

// eslint-disable-next-line es/no-reflect -- safe
module.exports = typeof Reflect == 'object' && Reflect.apply || (NATIVE_BIND ? call.bind(apply) : function () {
  return call.apply(apply, arguments);
});


/***/ }),

/***/ "../node_modules/core-js/internals/function-bind-context.js":
/*!******************************************************************!*\
  !*** ../node_modules/core-js/internals/function-bind-context.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this-clause */ "../node_modules/core-js/internals/function-uncurry-this-clause.js");
var aCallable = __webpack_require__(/*! ../internals/a-callable */ "../node_modules/core-js/internals/a-callable.js");
var NATIVE_BIND = __webpack_require__(/*! ../internals/function-bind-native */ "../node_modules/core-js/internals/function-bind-native.js");

var bind = uncurryThis(uncurryThis.bind);

// optional / simple context binding
module.exports = function (fn, that) {
  aCallable(fn);
  return that === undefined ? fn : NATIVE_BIND ? bind(fn, that) : function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),

/***/ "../node_modules/core-js/internals/function-bind-native.js":
/*!*****************************************************************!*\
  !*** ../node_modules/core-js/internals/function-bind-native.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");

module.exports = !fails(function () {
  // eslint-disable-next-line es/no-function-prototype-bind -- safe
  var test = (function () { /* empty */ }).bind();
  // eslint-disable-next-line no-prototype-builtins -- safe
  return typeof test != 'function' || test.hasOwnProperty('prototype');
});


/***/ }),

/***/ "../node_modules/core-js/internals/function-call.js":
/*!**********************************************************!*\
  !*** ../node_modules/core-js/internals/function-call.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var NATIVE_BIND = __webpack_require__(/*! ../internals/function-bind-native */ "../node_modules/core-js/internals/function-bind-native.js");

var call = Function.prototype.call;

module.exports = NATIVE_BIND ? call.bind(call) : function () {
  return call.apply(call, arguments);
};


/***/ }),

/***/ "../node_modules/core-js/internals/function-name.js":
/*!**********************************************************!*\
  !*** ../node_modules/core-js/internals/function-name.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "../node_modules/core-js/internals/descriptors.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "../node_modules/core-js/internals/has-own-property.js");

var FunctionPrototype = Function.prototype;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getDescriptor = DESCRIPTORS && Object.getOwnPropertyDescriptor;

var EXISTS = hasOwn(FunctionPrototype, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
var CONFIGURABLE = EXISTS && (!DESCRIPTORS || (DESCRIPTORS && getDescriptor(FunctionPrototype, 'name').configurable));

module.exports = {
  EXISTS: EXISTS,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE
};


/***/ }),

/***/ "../node_modules/core-js/internals/function-uncurry-this-accessor.js":
/*!***************************************************************************!*\
  !*** ../node_modules/core-js/internals/function-uncurry-this-accessor.js ***!
  \***************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var aCallable = __webpack_require__(/*! ../internals/a-callable */ "../node_modules/core-js/internals/a-callable.js");

module.exports = function (object, key, method) {
  try {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    return uncurryThis(aCallable(Object.getOwnPropertyDescriptor(object, key)[method]));
  } catch (error) { /* empty */ }
};


/***/ }),

/***/ "../node_modules/core-js/internals/function-uncurry-this-clause.js":
/*!*************************************************************************!*\
  !*** ../node_modules/core-js/internals/function-uncurry-this-clause.js ***!
  \*************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var classofRaw = __webpack_require__(/*! ../internals/classof-raw */ "../node_modules/core-js/internals/classof-raw.js");
var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");

module.exports = function (fn) {
  // Nashorn bug:
  //   https://github.com/zloirock/core-js/issues/1128
  //   https://github.com/zloirock/core-js/issues/1130
  if (classofRaw(fn) === 'Function') return uncurryThis(fn);
};


/***/ }),

/***/ "../node_modules/core-js/internals/function-uncurry-this.js":
/*!******************************************************************!*\
  !*** ../node_modules/core-js/internals/function-uncurry-this.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var NATIVE_BIND = __webpack_require__(/*! ../internals/function-bind-native */ "../node_modules/core-js/internals/function-bind-native.js");

var FunctionPrototype = Function.prototype;
var call = FunctionPrototype.call;
var uncurryThisWithBind = NATIVE_BIND && FunctionPrototype.bind.bind(call, call);

module.exports = NATIVE_BIND ? uncurryThisWithBind : function (fn) {
  return function () {
    return call.apply(fn, arguments);
  };
};


/***/ }),

/***/ "../node_modules/core-js/internals/get-built-in.js":
/*!*********************************************************!*\
  !*** ../node_modules/core-js/internals/get-built-in.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");

var aFunction = function (argument) {
  return isCallable(argument) ? argument : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(global[namespace]) : global[namespace] && global[namespace][method];
};


/***/ }),

/***/ "../node_modules/core-js/internals/get-json-replacer-function.js":
/*!***********************************************************************!*\
  !*** ../node_modules/core-js/internals/get-json-replacer-function.js ***!
  \***********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var isArray = __webpack_require__(/*! ../internals/is-array */ "../node_modules/core-js/internals/is-array.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var classof = __webpack_require__(/*! ../internals/classof-raw */ "../node_modules/core-js/internals/classof-raw.js");
var toString = __webpack_require__(/*! ../internals/to-string */ "../node_modules/core-js/internals/to-string.js");

var push = uncurryThis([].push);

module.exports = function (replacer) {
  if (isCallable(replacer)) return replacer;
  if (!isArray(replacer)) return;
  var rawLength = replacer.length;
  var keys = [];
  for (var i = 0; i < rawLength; i++) {
    var element = replacer[i];
    if (typeof element == 'string') push(keys, element);
    else if (typeof element == 'number' || classof(element) === 'Number' || classof(element) === 'String') push(keys, toString(element));
  }
  var keysLength = keys.length;
  var root = true;
  return function (key, value) {
    if (root) {
      root = false;
      return value;
    }
    if (isArray(this)) return value;
    for (var j = 0; j < keysLength; j++) if (keys[j] === key) return value;
  };
};


/***/ }),

/***/ "../node_modules/core-js/internals/get-method.js":
/*!*******************************************************!*\
  !*** ../node_modules/core-js/internals/get-method.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var aCallable = __webpack_require__(/*! ../internals/a-callable */ "../node_modules/core-js/internals/a-callable.js");
var isNullOrUndefined = __webpack_require__(/*! ../internals/is-null-or-undefined */ "../node_modules/core-js/internals/is-null-or-undefined.js");

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
module.exports = function (V, P) {
  var func = V[P];
  return isNullOrUndefined(func) ? undefined : aCallable(func);
};


/***/ }),

/***/ "../node_modules/core-js/internals/get-substitution.js":
/*!*************************************************************!*\
  !*** ../node_modules/core-js/internals/get-substitution.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var toObject = __webpack_require__(/*! ../internals/to-object */ "../node_modules/core-js/internals/to-object.js");

var floor = Math.floor;
var charAt = uncurryThis(''.charAt);
var replace = uncurryThis(''.replace);
var stringSlice = uncurryThis(''.slice);
// eslint-disable-next-line redos/no-vulnerable -- safe
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;

// `GetSubstitution` abstract operation
// https://tc39.es/ecma262/#sec-getsubstitution
module.exports = function (matched, str, position, captures, namedCaptures, replacement) {
  var tailPos = position + matched.length;
  var m = captures.length;
  var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
  if (namedCaptures !== undefined) {
    namedCaptures = toObject(namedCaptures);
    symbols = SUBSTITUTION_SYMBOLS;
  }
  return replace(replacement, symbols, function (match, ch) {
    var capture;
    switch (charAt(ch, 0)) {
      case '$': return '$';
      case '&': return matched;
      case '`': return stringSlice(str, 0, position);
      case "'": return stringSlice(str, tailPos);
      case '<':
        capture = namedCaptures[stringSlice(ch, 1, -1)];
        break;
      default: // \d\d?
        var n = +ch;
        if (n === 0) return match;
        if (n > m) {
          var f = floor(n / 10);
          if (f === 0) return match;
          if (f <= m) return captures[f - 1] === undefined ? charAt(ch, 1) : captures[f - 1] + charAt(ch, 1);
          return match;
        }
        capture = captures[n - 1];
    }
    return capture === undefined ? '' : capture;
  });
};


/***/ }),

/***/ "../node_modules/core-js/internals/global.js":
/*!***************************************************!*\
  !*** ../node_modules/core-js/internals/global.js ***!
  \***************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var check = function (it) {
  return it && it.Math === Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof __webpack_require__.g == 'object' && __webpack_require__.g) ||
  check(typeof this == 'object' && this) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || Function('return this')();


/***/ }),

/***/ "../node_modules/core-js/internals/has-own-property.js":
/*!*************************************************************!*\
  !*** ../node_modules/core-js/internals/has-own-property.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var toObject = __webpack_require__(/*! ../internals/to-object */ "../node_modules/core-js/internals/to-object.js");

var hasOwnProperty = uncurryThis({}.hasOwnProperty);

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
// eslint-disable-next-line es/no-object-hasown -- safe
module.exports = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty(toObject(it), key);
};


/***/ }),

/***/ "../node_modules/core-js/internals/hidden-keys.js":
/*!********************************************************!*\
  !*** ../node_modules/core-js/internals/hidden-keys.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";

module.exports = {};


/***/ }),

/***/ "../node_modules/core-js/internals/html.js":
/*!*************************************************!*\
  !*** ../node_modules/core-js/internals/html.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "../node_modules/core-js/internals/get-built-in.js");

module.exports = getBuiltIn('document', 'documentElement');


/***/ }),

/***/ "../node_modules/core-js/internals/ie8-dom-define.js":
/*!***********************************************************!*\
  !*** ../node_modules/core-js/internals/ie8-dom-define.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "../node_modules/core-js/internals/descriptors.js");
var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var createElement = __webpack_require__(/*! ../internals/document-create-element */ "../node_modules/core-js/internals/document-create-element.js");

// Thanks to IE8 for its funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a !== 7;
});


/***/ }),

/***/ "../node_modules/core-js/internals/indexed-object.js":
/*!***********************************************************!*\
  !*** ../node_modules/core-js/internals/indexed-object.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var classof = __webpack_require__(/*! ../internals/classof-raw */ "../node_modules/core-js/internals/classof-raw.js");

var $Object = Object;
var split = uncurryThis(''.split);

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !$Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) === 'String' ? split(it, '') : $Object(it);
} : $Object;


/***/ }),

/***/ "../node_modules/core-js/internals/inherit-if-required.js":
/*!****************************************************************!*\
  !*** ../node_modules/core-js/internals/inherit-if-required.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "../node_modules/core-js/internals/is-object.js");
var setPrototypeOf = __webpack_require__(/*! ../internals/object-set-prototype-of */ "../node_modules/core-js/internals/object-set-prototype-of.js");

// makes subclassing work correct for wrapped built-ins
module.exports = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    setPrototypeOf &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    isCallable(NewTarget = dummy.constructor) &&
    NewTarget !== Wrapper &&
    isObject(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) setPrototypeOf($this, NewTargetPrototype);
  return $this;
};


/***/ }),

/***/ "../node_modules/core-js/internals/inspect-source.js":
/*!***********************************************************!*\
  !*** ../node_modules/core-js/internals/inspect-source.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var store = __webpack_require__(/*! ../internals/shared-store */ "../node_modules/core-js/internals/shared-store.js");

var functionToString = uncurryThis(Function.toString);

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable(store.inspectSource)) {
  store.inspectSource = function (it) {
    return functionToString(it);
  };
}

module.exports = store.inspectSource;


/***/ }),

/***/ "../node_modules/core-js/internals/internal-state.js":
/*!***********************************************************!*\
  !*** ../node_modules/core-js/internals/internal-state.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var NATIVE_WEAK_MAP = __webpack_require__(/*! ../internals/weak-map-basic-detection */ "../node_modules/core-js/internals/weak-map-basic-detection.js");
var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "../node_modules/core-js/internals/is-object.js");
var createNonEnumerableProperty = __webpack_require__(/*! ../internals/create-non-enumerable-property */ "../node_modules/core-js/internals/create-non-enumerable-property.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "../node_modules/core-js/internals/has-own-property.js");
var shared = __webpack_require__(/*! ../internals/shared-store */ "../node_modules/core-js/internals/shared-store.js");
var sharedKey = __webpack_require__(/*! ../internals/shared-key */ "../node_modules/core-js/internals/shared-key.js");
var hiddenKeys = __webpack_require__(/*! ../internals/hidden-keys */ "../node_modules/core-js/internals/hidden-keys.js");

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var TypeError = global.TypeError;
var WeakMap = global.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw new TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP || shared.state) {
  var store = shared.state || (shared.state = new WeakMap());
  /* eslint-disable no-self-assign -- prototype methods protection */
  store.get = store.get;
  store.has = store.has;
  store.set = store.set;
  /* eslint-enable no-self-assign -- prototype methods protection */
  set = function (it, metadata) {
    if (store.has(it)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    store.set(it, metadata);
    return metadata;
  };
  get = function (it) {
    return store.get(it) || {};
  };
  has = function (it) {
    return store.has(it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    if (hasOwn(it, STATE)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return hasOwn(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return hasOwn(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};


/***/ }),

/***/ "../node_modules/core-js/internals/is-array.js":
/*!*****************************************************!*\
  !*** ../node_modules/core-js/internals/is-array.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var classof = __webpack_require__(/*! ../internals/classof-raw */ "../node_modules/core-js/internals/classof-raw.js");

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
// eslint-disable-next-line es/no-array-isarray -- safe
module.exports = Array.isArray || function isArray(argument) {
  return classof(argument) === 'Array';
};


/***/ }),

/***/ "../node_modules/core-js/internals/is-callable.js":
/*!********************************************************!*\
  !*** ../node_modules/core-js/internals/is-callable.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $documentAll = __webpack_require__(/*! ../internals/document-all */ "../node_modules/core-js/internals/document-all.js");

var documentAll = $documentAll.all;

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
module.exports = $documentAll.IS_HTMLDDA ? function (argument) {
  return typeof argument == 'function' || argument === documentAll;
} : function (argument) {
  return typeof argument == 'function';
};


/***/ }),

/***/ "../node_modules/core-js/internals/is-constructor.js":
/*!***********************************************************!*\
  !*** ../node_modules/core-js/internals/is-constructor.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var classof = __webpack_require__(/*! ../internals/classof */ "../node_modules/core-js/internals/classof.js");
var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "../node_modules/core-js/internals/get-built-in.js");
var inspectSource = __webpack_require__(/*! ../internals/inspect-source */ "../node_modules/core-js/internals/inspect-source.js");

var noop = function () { /* empty */ };
var empty = [];
var construct = getBuiltIn('Reflect', 'construct');
var constructorRegExp = /^\s*(?:class|function)\b/;
var exec = uncurryThis(constructorRegExp.exec);
var INCORRECT_TO_STRING = !constructorRegExp.test(noop);

var isConstructorModern = function isConstructor(argument) {
  if (!isCallable(argument)) return false;
  try {
    construct(noop, empty, argument);
    return true;
  } catch (error) {
    return false;
  }
};

var isConstructorLegacy = function isConstructor(argument) {
  if (!isCallable(argument)) return false;
  switch (classof(argument)) {
    case 'AsyncFunction':
    case 'GeneratorFunction':
    case 'AsyncGeneratorFunction': return false;
  }
  try {
    // we can't check .prototype since constructors produced by .bind haven't it
    // `Function#toString` throws on some built-it function in some legacy engines
    // (for example, `DOMQuad` and similar in FF41-)
    return INCORRECT_TO_STRING || !!exec(constructorRegExp, inspectSource(argument));
  } catch (error) {
    return true;
  }
};

isConstructorLegacy.sham = true;

// `IsConstructor` abstract operation
// https://tc39.es/ecma262/#sec-isconstructor
module.exports = !construct || fails(function () {
  var called;
  return isConstructorModern(isConstructorModern.call)
    || !isConstructorModern(Object)
    || !isConstructorModern(function () { called = true; })
    || called;
}) ? isConstructorLegacy : isConstructorModern;


/***/ }),

/***/ "../node_modules/core-js/internals/is-forced.js":
/*!******************************************************!*\
  !*** ../node_modules/core-js/internals/is-forced.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value === POLYFILL ? true
    : value === NATIVE ? false
    : isCallable(detection) ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;


/***/ }),

/***/ "../node_modules/core-js/internals/is-null-or-undefined.js":
/*!*****************************************************************!*\
  !*** ../node_modules/core-js/internals/is-null-or-undefined.js ***!
  \*****************************************************************/
/***/ ((module) => {

"use strict";

// we can't use just `it == null` since of `document.all` special case
// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
module.exports = function (it) {
  return it === null || it === undefined;
};


/***/ }),

/***/ "../node_modules/core-js/internals/is-object.js":
/*!******************************************************!*\
  !*** ../node_modules/core-js/internals/is-object.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var $documentAll = __webpack_require__(/*! ../internals/document-all */ "../node_modules/core-js/internals/document-all.js");

var documentAll = $documentAll.all;

module.exports = $documentAll.IS_HTMLDDA ? function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it) || it === documentAll;
} : function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it);
};


/***/ }),

/***/ "../node_modules/core-js/internals/is-pure.js":
/*!****************************************************!*\
  !*** ../node_modules/core-js/internals/is-pure.js ***!
  \****************************************************/
/***/ ((module) => {

"use strict";

module.exports = false;


/***/ }),

/***/ "../node_modules/core-js/internals/is-regexp.js":
/*!******************************************************!*\
  !*** ../node_modules/core-js/internals/is-regexp.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var isObject = __webpack_require__(/*! ../internals/is-object */ "../node_modules/core-js/internals/is-object.js");
var classof = __webpack_require__(/*! ../internals/classof-raw */ "../node_modules/core-js/internals/classof-raw.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");

var MATCH = wellKnownSymbol('match');

// `IsRegExp` abstract operation
// https://tc39.es/ecma262/#sec-isregexp
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classof(it) === 'RegExp');
};


/***/ }),

/***/ "../node_modules/core-js/internals/is-symbol.js":
/*!******************************************************!*\
  !*** ../node_modules/core-js/internals/is-symbol.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "../node_modules/core-js/internals/get-built-in.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var isPrototypeOf = __webpack_require__(/*! ../internals/object-is-prototype-of */ "../node_modules/core-js/internals/object-is-prototype-of.js");
var USE_SYMBOL_AS_UID = __webpack_require__(/*! ../internals/use-symbol-as-uid */ "../node_modules/core-js/internals/use-symbol-as-uid.js");

var $Object = Object;

module.exports = USE_SYMBOL_AS_UID ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn('Symbol');
  return isCallable($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it));
};


/***/ }),

/***/ "../node_modules/core-js/internals/iterator-create-constructor.js":
/*!************************************************************************!*\
  !*** ../node_modules/core-js/internals/iterator-create-constructor.js ***!
  \************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var IteratorPrototype = (__webpack_require__(/*! ../internals/iterators-core */ "../node_modules/core-js/internals/iterators-core.js").IteratorPrototype);
var create = __webpack_require__(/*! ../internals/object-create */ "../node_modules/core-js/internals/object-create.js");
var createPropertyDescriptor = __webpack_require__(/*! ../internals/create-property-descriptor */ "../node_modules/core-js/internals/create-property-descriptor.js");
var setToStringTag = __webpack_require__(/*! ../internals/set-to-string-tag */ "../node_modules/core-js/internals/set-to-string-tag.js");
var Iterators = __webpack_require__(/*! ../internals/iterators */ "../node_modules/core-js/internals/iterators.js");

var returnThis = function () { return this; };

module.exports = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(+!ENUMERABLE_NEXT, next) });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
  Iterators[TO_STRING_TAG] = returnThis;
  return IteratorConstructor;
};


/***/ }),

/***/ "../node_modules/core-js/internals/iterator-define.js":
/*!************************************************************!*\
  !*** ../node_modules/core-js/internals/iterator-define.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "../node_modules/core-js/internals/export.js");
var call = __webpack_require__(/*! ../internals/function-call */ "../node_modules/core-js/internals/function-call.js");
var IS_PURE = __webpack_require__(/*! ../internals/is-pure */ "../node_modules/core-js/internals/is-pure.js");
var FunctionName = __webpack_require__(/*! ../internals/function-name */ "../node_modules/core-js/internals/function-name.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var createIteratorConstructor = __webpack_require__(/*! ../internals/iterator-create-constructor */ "../node_modules/core-js/internals/iterator-create-constructor.js");
var getPrototypeOf = __webpack_require__(/*! ../internals/object-get-prototype-of */ "../node_modules/core-js/internals/object-get-prototype-of.js");
var setPrototypeOf = __webpack_require__(/*! ../internals/object-set-prototype-of */ "../node_modules/core-js/internals/object-set-prototype-of.js");
var setToStringTag = __webpack_require__(/*! ../internals/set-to-string-tag */ "../node_modules/core-js/internals/set-to-string-tag.js");
var createNonEnumerableProperty = __webpack_require__(/*! ../internals/create-non-enumerable-property */ "../node_modules/core-js/internals/create-non-enumerable-property.js");
var defineBuiltIn = __webpack_require__(/*! ../internals/define-built-in */ "../node_modules/core-js/internals/define-built-in.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");
var Iterators = __webpack_require__(/*! ../internals/iterators */ "../node_modules/core-js/internals/iterators.js");
var IteratorsCore = __webpack_require__(/*! ../internals/iterators-core */ "../node_modules/core-js/internals/iterators-core.js");

var PROPER_FUNCTION_NAME = FunctionName.PROPER;
var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
var IteratorPrototype = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR = wellKnownSymbol('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

module.exports = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND && KIND in IterablePrototype) return IterablePrototype[KIND];

    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    }

    return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME === 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
        if (setPrototypeOf) {
          setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
        } else if (!isCallable(CurrentIteratorPrototype[ITERATOR])) {
          defineBuiltIn(CurrentIteratorPrototype, ITERATOR, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
      if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
    }
  }

  // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
  if (PROPER_FUNCTION_NAME && DEFAULT === VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    if (!IS_PURE && CONFIGURABLE_FUNCTION_NAME) {
      createNonEnumerableProperty(IterablePrototype, 'name', VALUES);
    } else {
      INCORRECT_VALUES_NAME = true;
      defaultIterator = function values() { return call(nativeIterator, this); };
    }
  }

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        defineBuiltIn(IterablePrototype, KEY, methods[KEY]);
      }
    } else $({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  // define iterator
  if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
    defineBuiltIn(IterablePrototype, ITERATOR, defaultIterator, { name: DEFAULT });
  }
  Iterators[NAME] = defaultIterator;

  return methods;
};


/***/ }),

/***/ "../node_modules/core-js/internals/iterators-core.js":
/*!***********************************************************!*\
  !*** ../node_modules/core-js/internals/iterators-core.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "../node_modules/core-js/internals/is-object.js");
var create = __webpack_require__(/*! ../internals/object-create */ "../node_modules/core-js/internals/object-create.js");
var getPrototypeOf = __webpack_require__(/*! ../internals/object-get-prototype-of */ "../node_modules/core-js/internals/object-get-prototype-of.js");
var defineBuiltIn = __webpack_require__(/*! ../internals/define-built-in */ "../node_modules/core-js/internals/define-built-in.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");
var IS_PURE = __webpack_require__(/*! ../internals/is-pure */ "../node_modules/core-js/internals/is-pure.js");

var ITERATOR = wellKnownSymbol('iterator');
var BUGGY_SAFARI_ITERATORS = false;

// `%IteratorPrototype%` object
// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

/* eslint-disable es/no-array-prototype-keys -- safe */
if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

var NEW_ITERATOR_PROTOTYPE = !isObject(IteratorPrototype) || fails(function () {
  var test = {};
  // FF44- legacy iterators case
  return IteratorPrototype[ITERATOR].call(test) !== test;
});

if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype = {};
else if (IS_PURE) IteratorPrototype = create(IteratorPrototype);

// `%IteratorPrototype%[@@iterator]()` method
// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
if (!isCallable(IteratorPrototype[ITERATOR])) {
  defineBuiltIn(IteratorPrototype, ITERATOR, function () {
    return this;
  });
}

module.exports = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};


/***/ }),

/***/ "../node_modules/core-js/internals/iterators.js":
/*!******************************************************!*\
  !*** ../node_modules/core-js/internals/iterators.js ***!
  \******************************************************/
/***/ ((module) => {

"use strict";

module.exports = {};


/***/ }),

/***/ "../node_modules/core-js/internals/length-of-array-like.js":
/*!*****************************************************************!*\
  !*** ../node_modules/core-js/internals/length-of-array-like.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var toLength = __webpack_require__(/*! ../internals/to-length */ "../node_modules/core-js/internals/to-length.js");

// `LengthOfArrayLike` abstract operation
// https://tc39.es/ecma262/#sec-lengthofarraylike
module.exports = function (obj) {
  return toLength(obj.length);
};


/***/ }),

/***/ "../node_modules/core-js/internals/make-built-in.js":
/*!**********************************************************!*\
  !*** ../node_modules/core-js/internals/make-built-in.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "../node_modules/core-js/internals/has-own-property.js");
var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "../node_modules/core-js/internals/descriptors.js");
var CONFIGURABLE_FUNCTION_NAME = (__webpack_require__(/*! ../internals/function-name */ "../node_modules/core-js/internals/function-name.js").CONFIGURABLE);
var inspectSource = __webpack_require__(/*! ../internals/inspect-source */ "../node_modules/core-js/internals/inspect-source.js");
var InternalStateModule = __webpack_require__(/*! ../internals/internal-state */ "../node_modules/core-js/internals/internal-state.js");

var enforceInternalState = InternalStateModule.enforce;
var getInternalState = InternalStateModule.get;
var $String = String;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;
var stringSlice = uncurryThis(''.slice);
var replace = uncurryThis(''.replace);
var join = uncurryThis([].join);

var CONFIGURABLE_LENGTH = DESCRIPTORS && !fails(function () {
  return defineProperty(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
});

var TEMPLATE = String(String).split('String');

var makeBuiltIn = module.exports = function (value, name, options) {
  if (stringSlice($String(name), 0, 7) === 'Symbol(') {
    name = '[' + replace($String(name), /^Symbol\(([^)]*)\)/, '$1') + ']';
  }
  if (options && options.getter) name = 'get ' + name;
  if (options && options.setter) name = 'set ' + name;
  if (!hasOwn(value, 'name') || (CONFIGURABLE_FUNCTION_NAME && value.name !== name)) {
    if (DESCRIPTORS) defineProperty(value, 'name', { value: name, configurable: true });
    else value.name = name;
  }
  if (CONFIGURABLE_LENGTH && options && hasOwn(options, 'arity') && value.length !== options.arity) {
    defineProperty(value, 'length', { value: options.arity });
  }
  try {
    if (options && hasOwn(options, 'constructor') && options.constructor) {
      if (DESCRIPTORS) defineProperty(value, 'prototype', { writable: false });
    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
    } else if (value.prototype) value.prototype = undefined;
  } catch (error) { /* empty */ }
  var state = enforceInternalState(value);
  if (!hasOwn(state, 'source')) {
    state.source = join(TEMPLATE, typeof name == 'string' ? name : '');
  } return value;
};

// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
// eslint-disable-next-line no-extend-native -- required
Function.prototype.toString = makeBuiltIn(function toString() {
  return isCallable(this) && getInternalState(this).source || inspectSource(this);
}, 'toString');


/***/ }),

/***/ "../node_modules/core-js/internals/math-trunc.js":
/*!*******************************************************!*\
  !*** ../node_modules/core-js/internals/math-trunc.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";

var ceil = Math.ceil;
var floor = Math.floor;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
// eslint-disable-next-line es/no-math-trunc -- safe
module.exports = Math.trunc || function trunc(x) {
  var n = +x;
  return (n > 0 ? floor : ceil)(n);
};


/***/ }),

/***/ "../node_modules/core-js/internals/object-assign.js":
/*!**********************************************************!*\
  !*** ../node_modules/core-js/internals/object-assign.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "../node_modules/core-js/internals/descriptors.js");
var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var call = __webpack_require__(/*! ../internals/function-call */ "../node_modules/core-js/internals/function-call.js");
var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var objectKeys = __webpack_require__(/*! ../internals/object-keys */ "../node_modules/core-js/internals/object-keys.js");
var getOwnPropertySymbolsModule = __webpack_require__(/*! ../internals/object-get-own-property-symbols */ "../node_modules/core-js/internals/object-get-own-property-symbols.js");
var propertyIsEnumerableModule = __webpack_require__(/*! ../internals/object-property-is-enumerable */ "../node_modules/core-js/internals/object-property-is-enumerable.js");
var toObject = __webpack_require__(/*! ../internals/to-object */ "../node_modules/core-js/internals/to-object.js");
var IndexedObject = __webpack_require__(/*! ../internals/indexed-object */ "../node_modules/core-js/internals/indexed-object.js");

// eslint-disable-next-line es/no-object-assign -- safe
var $assign = Object.assign;
// eslint-disable-next-line es/no-object-defineproperty -- required for testing
var defineProperty = Object.defineProperty;
var concat = uncurryThis([].concat);

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
module.exports = !$assign || fails(function () {
  // should have correct order of operations (Edge bug)
  if (DESCRIPTORS && $assign({ b: 1 }, $assign(defineProperty({}, 'a', {
    enumerable: true,
    get: function () {
      defineProperty(this, 'b', {
        value: 3,
        enumerable: false
      });
    }
  }), { b: 2 })).b !== 1) return true;
  // should work with symbols and should have deterministic property order (V8 bug)
  var A = {};
  var B = {};
  // eslint-disable-next-line es/no-symbol -- safe
  var symbol = Symbol('assign detection');
  var alphabet = 'abcdefghijklmnopqrst';
  A[symbol] = 7;
  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
  return $assign({}, A)[symbol] !== 7 || objectKeys($assign({}, B)).join('') !== alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
  var T = toObject(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  var propertyIsEnumerable = propertyIsEnumerableModule.f;
  while (argumentsLength > index) {
    var S = IndexedObject(arguments[index++]);
    var keys = getOwnPropertySymbols ? concat(objectKeys(S), getOwnPropertySymbols(S)) : objectKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!DESCRIPTORS || call(propertyIsEnumerable, S, key)) T[key] = S[key];
    }
  } return T;
} : $assign;


/***/ }),

/***/ "../node_modules/core-js/internals/object-create.js":
/*!**********************************************************!*\
  !*** ../node_modules/core-js/internals/object-create.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/* global ActiveXObject -- old IE, WSH */
var anObject = __webpack_require__(/*! ../internals/an-object */ "../node_modules/core-js/internals/an-object.js");
var definePropertiesModule = __webpack_require__(/*! ../internals/object-define-properties */ "../node_modules/core-js/internals/object-define-properties.js");
var enumBugKeys = __webpack_require__(/*! ../internals/enum-bug-keys */ "../node_modules/core-js/internals/enum-bug-keys.js");
var hiddenKeys = __webpack_require__(/*! ../internals/hidden-keys */ "../node_modules/core-js/internals/hidden-keys.js");
var html = __webpack_require__(/*! ../internals/html */ "../node_modules/core-js/internals/html.js");
var documentCreateElement = __webpack_require__(/*! ../internals/document-create-element */ "../node_modules/core-js/internals/document-create-element.js");
var sharedKey = __webpack_require__(/*! ../internals/shared-key */ "../node_modules/core-js/internals/shared-key.js");

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO = sharedKey('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    activeXDocument = new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = typeof document != 'undefined'
    ? document.domain && activeXDocument
      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
      : NullProtoObjectViaIFrame()
    : NullProtoObjectViaActiveX(activeXDocument); // WSH
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys[IE_PROTO] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
// eslint-disable-next-line es/no-object-create -- safe
module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : definePropertiesModule.f(result, Properties);
};


/***/ }),

/***/ "../node_modules/core-js/internals/object-define-properties.js":
/*!*********************************************************************!*\
  !*** ../node_modules/core-js/internals/object-define-properties.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "../node_modules/core-js/internals/descriptors.js");
var V8_PROTOTYPE_DEFINE_BUG = __webpack_require__(/*! ../internals/v8-prototype-define-bug */ "../node_modules/core-js/internals/v8-prototype-define-bug.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "../node_modules/core-js/internals/object-define-property.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "../node_modules/core-js/internals/an-object.js");
var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "../node_modules/core-js/internals/to-indexed-object.js");
var objectKeys = __webpack_require__(/*! ../internals/object-keys */ "../node_modules/core-js/internals/object-keys.js");

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
exports.f = DESCRIPTORS && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var props = toIndexedObject(Properties);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule.f(O, key = keys[index++], props[key]);
  return O;
};


/***/ }),

/***/ "../node_modules/core-js/internals/object-define-property.js":
/*!*******************************************************************!*\
  !*** ../node_modules/core-js/internals/object-define-property.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "../node_modules/core-js/internals/descriptors.js");
var IE8_DOM_DEFINE = __webpack_require__(/*! ../internals/ie8-dom-define */ "../node_modules/core-js/internals/ie8-dom-define.js");
var V8_PROTOTYPE_DEFINE_BUG = __webpack_require__(/*! ../internals/v8-prototype-define-bug */ "../node_modules/core-js/internals/v8-prototype-define-bug.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "../node_modules/core-js/internals/an-object.js");
var toPropertyKey = __webpack_require__(/*! ../internals/to-property-key */ "../node_modules/core-js/internals/to-property-key.js");

var $TypeError = TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty = Object.defineProperty;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var ENUMERABLE = 'enumerable';
var CONFIGURABLE = 'configurable';
var WRITABLE = 'writable';

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
exports.f = DESCRIPTORS ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
    var current = $getOwnPropertyDescriptor(O, P);
    if (current && current[WRITABLE]) {
      O[P] = Attributes.value;
      Attributes = {
        configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
        writable: false
      };
    }
  } return $defineProperty(O, P, Attributes);
} : $defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return $defineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw new $TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ "../node_modules/core-js/internals/object-get-own-property-descriptor.js":
/*!*******************************************************************************!*\
  !*** ../node_modules/core-js/internals/object-get-own-property-descriptor.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "../node_modules/core-js/internals/descriptors.js");
var call = __webpack_require__(/*! ../internals/function-call */ "../node_modules/core-js/internals/function-call.js");
var propertyIsEnumerableModule = __webpack_require__(/*! ../internals/object-property-is-enumerable */ "../node_modules/core-js/internals/object-property-is-enumerable.js");
var createPropertyDescriptor = __webpack_require__(/*! ../internals/create-property-descriptor */ "../node_modules/core-js/internals/create-property-descriptor.js");
var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "../node_modules/core-js/internals/to-indexed-object.js");
var toPropertyKey = __webpack_require__(/*! ../internals/to-property-key */ "../node_modules/core-js/internals/to-property-key.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "../node_modules/core-js/internals/has-own-property.js");
var IE8_DOM_DEFINE = __webpack_require__(/*! ../internals/ie8-dom-define */ "../node_modules/core-js/internals/ie8-dom-define.js");

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
exports.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPropertyKey(P);
  if (IE8_DOM_DEFINE) try {
    return $getOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (hasOwn(O, P)) return createPropertyDescriptor(!call(propertyIsEnumerableModule.f, O, P), O[P]);
};


/***/ }),

/***/ "../node_modules/core-js/internals/object-get-own-property-names-external.js":
/*!***********************************************************************************!*\
  !*** ../node_modules/core-js/internals/object-get-own-property-names-external.js ***!
  \***********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/* eslint-disable es/no-object-getownpropertynames -- safe */
var classof = __webpack_require__(/*! ../internals/classof-raw */ "../node_modules/core-js/internals/classof-raw.js");
var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "../node_modules/core-js/internals/to-indexed-object.js");
var $getOwnPropertyNames = (__webpack_require__(/*! ../internals/object-get-own-property-names */ "../node_modules/core-js/internals/object-get-own-property-names.js").f);
var arraySlice = __webpack_require__(/*! ../internals/array-slice-simple */ "../node_modules/core-js/internals/array-slice-simple.js");

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return $getOwnPropertyNames(it);
  } catch (error) {
    return arraySlice(windowNames);
  }
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && classof(it) === 'Window'
    ? getWindowNames(it)
    : $getOwnPropertyNames(toIndexedObject(it));
};


/***/ }),

/***/ "../node_modules/core-js/internals/object-get-own-property-names.js":
/*!**************************************************************************!*\
  !*** ../node_modules/core-js/internals/object-get-own-property-names.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var internalObjectKeys = __webpack_require__(/*! ../internals/object-keys-internal */ "../node_modules/core-js/internals/object-keys-internal.js");
var enumBugKeys = __webpack_require__(/*! ../internals/enum-bug-keys */ "../node_modules/core-js/internals/enum-bug-keys.js");

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
// eslint-disable-next-line es/no-object-getownpropertynames -- safe
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};


/***/ }),

/***/ "../node_modules/core-js/internals/object-get-own-property-symbols.js":
/*!****************************************************************************!*\
  !*** ../node_modules/core-js/internals/object-get-own-property-symbols.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
exports.f = Object.getOwnPropertySymbols;


/***/ }),

/***/ "../node_modules/core-js/internals/object-get-prototype-of.js":
/*!********************************************************************!*\
  !*** ../node_modules/core-js/internals/object-get-prototype-of.js ***!
  \********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "../node_modules/core-js/internals/has-own-property.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var toObject = __webpack_require__(/*! ../internals/to-object */ "../node_modules/core-js/internals/to-object.js");
var sharedKey = __webpack_require__(/*! ../internals/shared-key */ "../node_modules/core-js/internals/shared-key.js");
var CORRECT_PROTOTYPE_GETTER = __webpack_require__(/*! ../internals/correct-prototype-getter */ "../node_modules/core-js/internals/correct-prototype-getter.js");

var IE_PROTO = sharedKey('IE_PROTO');
var $Object = Object;
var ObjectPrototype = $Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
// eslint-disable-next-line es/no-object-getprototypeof -- safe
module.exports = CORRECT_PROTOTYPE_GETTER ? $Object.getPrototypeOf : function (O) {
  var object = toObject(O);
  if (hasOwn(object, IE_PROTO)) return object[IE_PROTO];
  var constructor = object.constructor;
  if (isCallable(constructor) && object instanceof constructor) {
    return constructor.prototype;
  } return object instanceof $Object ? ObjectPrototype : null;
};


/***/ }),

/***/ "../node_modules/core-js/internals/object-is-prototype-of.js":
/*!*******************************************************************!*\
  !*** ../node_modules/core-js/internals/object-is-prototype-of.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");

module.exports = uncurryThis({}.isPrototypeOf);


/***/ }),

/***/ "../node_modules/core-js/internals/object-keys-internal.js":
/*!*****************************************************************!*\
  !*** ../node_modules/core-js/internals/object-keys-internal.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "../node_modules/core-js/internals/has-own-property.js");
var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "../node_modules/core-js/internals/to-indexed-object.js");
var indexOf = (__webpack_require__(/*! ../internals/array-includes */ "../node_modules/core-js/internals/array-includes.js").indexOf);
var hiddenKeys = __webpack_require__(/*! ../internals/hidden-keys */ "../node_modules/core-js/internals/hidden-keys.js");

var push = uncurryThis([].push);

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !hasOwn(hiddenKeys, key) && hasOwn(O, key) && push(result, key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (hasOwn(O, key = names[i++])) {
    ~indexOf(result, key) || push(result, key);
  }
  return result;
};


/***/ }),

/***/ "../node_modules/core-js/internals/object-keys.js":
/*!********************************************************!*\
  !*** ../node_modules/core-js/internals/object-keys.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var internalObjectKeys = __webpack_require__(/*! ../internals/object-keys-internal */ "../node_modules/core-js/internals/object-keys-internal.js");
var enumBugKeys = __webpack_require__(/*! ../internals/enum-bug-keys */ "../node_modules/core-js/internals/enum-bug-keys.js");

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
// eslint-disable-next-line es/no-object-keys -- safe
module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};


/***/ }),

/***/ "../node_modules/core-js/internals/object-property-is-enumerable.js":
/*!**************************************************************************!*\
  !*** ../node_modules/core-js/internals/object-property-is-enumerable.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

var $propertyIsEnumerable = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable;


/***/ }),

/***/ "../node_modules/core-js/internals/object-set-prototype-of.js":
/*!********************************************************************!*\
  !*** ../node_modules/core-js/internals/object-set-prototype-of.js ***!
  \********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/* eslint-disable no-proto -- safe */
var uncurryThisAccessor = __webpack_require__(/*! ../internals/function-uncurry-this-accessor */ "../node_modules/core-js/internals/function-uncurry-this-accessor.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "../node_modules/core-js/internals/an-object.js");
var aPossiblePrototype = __webpack_require__(/*! ../internals/a-possible-prototype */ "../node_modules/core-js/internals/a-possible-prototype.js");

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
// eslint-disable-next-line es/no-object-setprototypeof -- safe
module.exports = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = uncurryThisAccessor(Object.prototype, '__proto__', 'set');
    setter(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);


/***/ }),

/***/ "../node_modules/core-js/internals/object-to-string.js":
/*!*************************************************************!*\
  !*** ../node_modules/core-js/internals/object-to-string.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var TO_STRING_TAG_SUPPORT = __webpack_require__(/*! ../internals/to-string-tag-support */ "../node_modules/core-js/internals/to-string-tag-support.js");
var classof = __webpack_require__(/*! ../internals/classof */ "../node_modules/core-js/internals/classof.js");

// `Object.prototype.toString` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.tostring
module.exports = TO_STRING_TAG_SUPPORT ? {}.toString : function toString() {
  return '[object ' + classof(this) + ']';
};


/***/ }),

/***/ "../node_modules/core-js/internals/ordinary-to-primitive.js":
/*!******************************************************************!*\
  !*** ../node_modules/core-js/internals/ordinary-to-primitive.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var call = __webpack_require__(/*! ../internals/function-call */ "../node_modules/core-js/internals/function-call.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "../node_modules/core-js/internals/is-object.js");

var $TypeError = TypeError;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
module.exports = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
  if (isCallable(fn = input.valueOf) && !isObject(val = call(fn, input))) return val;
  if (pref !== 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
  throw new $TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ "../node_modules/core-js/internals/own-keys.js":
/*!*****************************************************!*\
  !*** ../node_modules/core-js/internals/own-keys.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "../node_modules/core-js/internals/get-built-in.js");
var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var getOwnPropertyNamesModule = __webpack_require__(/*! ../internals/object-get-own-property-names */ "../node_modules/core-js/internals/object-get-own-property-names.js");
var getOwnPropertySymbolsModule = __webpack_require__(/*! ../internals/object-get-own-property-symbols */ "../node_modules/core-js/internals/object-get-own-property-symbols.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "../node_modules/core-js/internals/an-object.js");

var concat = uncurryThis([].concat);

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
};


/***/ }),

/***/ "../node_modules/core-js/internals/path.js":
/*!*************************************************!*\
  !*** ../node_modules/core-js/internals/path.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");

module.exports = global;


/***/ }),

/***/ "../node_modules/core-js/internals/regexp-exec-abstract.js":
/*!*****************************************************************!*\
  !*** ../node_modules/core-js/internals/regexp-exec-abstract.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var call = __webpack_require__(/*! ../internals/function-call */ "../node_modules/core-js/internals/function-call.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "../node_modules/core-js/internals/an-object.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var classof = __webpack_require__(/*! ../internals/classof-raw */ "../node_modules/core-js/internals/classof-raw.js");
var regexpExec = __webpack_require__(/*! ../internals/regexp-exec */ "../node_modules/core-js/internals/regexp-exec.js");

var $TypeError = TypeError;

// `RegExpExec` abstract operation
// https://tc39.es/ecma262/#sec-regexpexec
module.exports = function (R, S) {
  var exec = R.exec;
  if (isCallable(exec)) {
    var result = call(exec, R, S);
    if (result !== null) anObject(result);
    return result;
  }
  if (classof(R) === 'RegExp') return call(regexpExec, R, S);
  throw new $TypeError('RegExp#exec called on incompatible receiver');
};


/***/ }),

/***/ "../node_modules/core-js/internals/regexp-exec.js":
/*!********************************************************!*\
  !*** ../node_modules/core-js/internals/regexp-exec.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
/* eslint-disable regexp/no-useless-quantifier -- testing */
var call = __webpack_require__(/*! ../internals/function-call */ "../node_modules/core-js/internals/function-call.js");
var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var toString = __webpack_require__(/*! ../internals/to-string */ "../node_modules/core-js/internals/to-string.js");
var regexpFlags = __webpack_require__(/*! ../internals/regexp-flags */ "../node_modules/core-js/internals/regexp-flags.js");
var stickyHelpers = __webpack_require__(/*! ../internals/regexp-sticky-helpers */ "../node_modules/core-js/internals/regexp-sticky-helpers.js");
var shared = __webpack_require__(/*! ../internals/shared */ "../node_modules/core-js/internals/shared.js");
var create = __webpack_require__(/*! ../internals/object-create */ "../node_modules/core-js/internals/object-create.js");
var getInternalState = (__webpack_require__(/*! ../internals/internal-state */ "../node_modules/core-js/internals/internal-state.js").get);
var UNSUPPORTED_DOT_ALL = __webpack_require__(/*! ../internals/regexp-unsupported-dot-all */ "../node_modules/core-js/internals/regexp-unsupported-dot-all.js");
var UNSUPPORTED_NCG = __webpack_require__(/*! ../internals/regexp-unsupported-ncg */ "../node_modules/core-js/internals/regexp-unsupported-ncg.js");

var nativeReplace = shared('native-string-replace', String.prototype.replace);
var nativeExec = RegExp.prototype.exec;
var patchedExec = nativeExec;
var charAt = uncurryThis(''.charAt);
var indexOf = uncurryThis(''.indexOf);
var replace = uncurryThis(''.replace);
var stringSlice = uncurryThis(''.slice);

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  call(nativeExec, re1, 'a');
  call(nativeExec, re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

var UNSUPPORTED_Y = stickyHelpers.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG;

if (PATCH) {
  patchedExec = function exec(string) {
    var re = this;
    var state = getInternalState(re);
    var str = toString(string);
    var raw = state.raw;
    var result, reCopy, lastIndex, match, i, object, group;

    if (raw) {
      raw.lastIndex = re.lastIndex;
      result = call(patchedExec, raw, str);
      re.lastIndex = raw.lastIndex;
      return result;
    }

    var groups = state.groups;
    var sticky = UNSUPPORTED_Y && re.sticky;
    var flags = call(regexpFlags, re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = replace(flags, 'y', '');
      if (indexOf(flags, 'g') === -1) {
        flags += 'g';
      }

      strCopy = stringSlice(str, re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt(str, re.lastIndex - 1) !== '\n')) {
        source = '(?: ' + source + ')';
        strCopy = ' ' + strCopy;
        charsAdded++;
      }
      // ^(? + rx + ) is needed, in combination with some str slicing, to
      // simulate the 'y' flag.
      reCopy = new RegExp('^(?:' + source + ')', flags);
    }

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

    match = call(nativeExec, sticky ? reCopy : re, strCopy);

    if (sticky) {
      if (match) {
        match.input = stringSlice(match.input, charsAdded);
        match[0] = stringSlice(match[0], charsAdded);
        match.index = re.lastIndex;
        re.lastIndex += match[0].length;
      } else re.lastIndex = 0;
    } else if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn't work for /(.?)?/
      call(nativeReplace, match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    if (match && groups) {
      match.groups = object = create(null);
      for (i = 0; i < groups.length; i++) {
        group = groups[i];
        object[group[0]] = match[group[1]];
      }
    }

    return match;
  };
}

module.exports = patchedExec;


/***/ }),

/***/ "../node_modules/core-js/internals/regexp-flags.js":
/*!*********************************************************!*\
  !*** ../node_modules/core-js/internals/regexp-flags.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var anObject = __webpack_require__(/*! ../internals/an-object */ "../node_modules/core-js/internals/an-object.js");

// `RegExp.prototype.flags` getter implementation
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.hasIndices) result += 'd';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.dotAll) result += 's';
  if (that.unicode) result += 'u';
  if (that.unicodeSets) result += 'v';
  if (that.sticky) result += 'y';
  return result;
};


/***/ }),

/***/ "../node_modules/core-js/internals/regexp-sticky-helpers.js":
/*!******************************************************************!*\
  !*** ../node_modules/core-js/internals/regexp-sticky-helpers.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");

// babel-minify and Closure Compiler transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
var $RegExp = global.RegExp;

var UNSUPPORTED_Y = fails(function () {
  var re = $RegExp('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') !== null;
});

// UC Browser bug
// https://github.com/zloirock/core-js/issues/1008
var MISSED_STICKY = UNSUPPORTED_Y || fails(function () {
  return !$RegExp('a', 'y').sticky;
});

var BROKEN_CARET = UNSUPPORTED_Y || fails(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = $RegExp('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') !== null;
});

module.exports = {
  BROKEN_CARET: BROKEN_CARET,
  MISSED_STICKY: MISSED_STICKY,
  UNSUPPORTED_Y: UNSUPPORTED_Y
};


/***/ }),

/***/ "../node_modules/core-js/internals/regexp-unsupported-dot-all.js":
/*!***********************************************************************!*\
  !*** ../node_modules/core-js/internals/regexp-unsupported-dot-all.js ***!
  \***********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");

// babel-minify and Closure Compiler transpiles RegExp('.', 's') -> /./s and it causes SyntaxError
var $RegExp = global.RegExp;

module.exports = fails(function () {
  var re = $RegExp('.', 's');
  return !(re.dotAll && re.test('\n') && re.flags === 's');
});


/***/ }),

/***/ "../node_modules/core-js/internals/regexp-unsupported-ncg.js":
/*!*******************************************************************!*\
  !*** ../node_modules/core-js/internals/regexp-unsupported-ncg.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");

// babel-minify and Closure Compiler transpiles RegExp('(?<a>b)', 'g') -> /(?<a>b)/g and it causes SyntaxError
var $RegExp = global.RegExp;

module.exports = fails(function () {
  var re = $RegExp('(?<a>b)', 'g');
  return re.exec('b').groups.a !== 'b' ||
    'b'.replace(re, '$<a>c') !== 'bc';
});


/***/ }),

/***/ "../node_modules/core-js/internals/require-object-coercible.js":
/*!*********************************************************************!*\
  !*** ../node_modules/core-js/internals/require-object-coercible.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var isNullOrUndefined = __webpack_require__(/*! ../internals/is-null-or-undefined */ "../node_modules/core-js/internals/is-null-or-undefined.js");

var $TypeError = TypeError;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (isNullOrUndefined(it)) throw new $TypeError("Can't call method on " + it);
  return it;
};


/***/ }),

/***/ "../node_modules/core-js/internals/set-to-string-tag.js":
/*!**************************************************************!*\
  !*** ../node_modules/core-js/internals/set-to-string-tag.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var defineProperty = (__webpack_require__(/*! ../internals/object-define-property */ "../node_modules/core-js/internals/object-define-property.js").f);
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "../node_modules/core-js/internals/has-own-property.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

module.exports = function (target, TAG, STATIC) {
  if (target && !STATIC) target = target.prototype;
  if (target && !hasOwn(target, TO_STRING_TAG)) {
    defineProperty(target, TO_STRING_TAG, { configurable: true, value: TAG });
  }
};


/***/ }),

/***/ "../node_modules/core-js/internals/shared-key.js":
/*!*******************************************************!*\
  !*** ../node_modules/core-js/internals/shared-key.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var shared = __webpack_require__(/*! ../internals/shared */ "../node_modules/core-js/internals/shared.js");
var uid = __webpack_require__(/*! ../internals/uid */ "../node_modules/core-js/internals/uid.js");

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};


/***/ }),

/***/ "../node_modules/core-js/internals/shared-store.js":
/*!*********************************************************!*\
  !*** ../node_modules/core-js/internals/shared-store.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");
var defineGlobalProperty = __webpack_require__(/*! ../internals/define-global-property */ "../node_modules/core-js/internals/define-global-property.js");

var SHARED = '__core-js_shared__';
var store = global[SHARED] || defineGlobalProperty(SHARED, {});

module.exports = store;


/***/ }),

/***/ "../node_modules/core-js/internals/shared.js":
/*!***************************************************!*\
  !*** ../node_modules/core-js/internals/shared.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var IS_PURE = __webpack_require__(/*! ../internals/is-pure */ "../node_modules/core-js/internals/is-pure.js");
var store = __webpack_require__(/*! ../internals/shared-store */ "../node_modules/core-js/internals/shared-store.js");

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.34.0',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2014-2023 Denis Pushkarev (zloirock.ru)',
  license: 'https://github.com/zloirock/core-js/blob/v3.34.0/LICENSE',
  source: 'https://github.com/zloirock/core-js'
});


/***/ }),

/***/ "../node_modules/core-js/internals/species-constructor.js":
/*!****************************************************************!*\
  !*** ../node_modules/core-js/internals/species-constructor.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var anObject = __webpack_require__(/*! ../internals/an-object */ "../node_modules/core-js/internals/an-object.js");
var aConstructor = __webpack_require__(/*! ../internals/a-constructor */ "../node_modules/core-js/internals/a-constructor.js");
var isNullOrUndefined = __webpack_require__(/*! ../internals/is-null-or-undefined */ "../node_modules/core-js/internals/is-null-or-undefined.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");

var SPECIES = wellKnownSymbol('species');

// `SpeciesConstructor` abstract operation
// https://tc39.es/ecma262/#sec-speciesconstructor
module.exports = function (O, defaultConstructor) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || isNullOrUndefined(S = anObject(C)[SPECIES]) ? defaultConstructor : aConstructor(S);
};


/***/ }),

/***/ "../node_modules/core-js/internals/string-multibyte.js":
/*!*************************************************************!*\
  !*** ../node_modules/core-js/internals/string-multibyte.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var toIntegerOrInfinity = __webpack_require__(/*! ../internals/to-integer-or-infinity */ "../node_modules/core-js/internals/to-integer-or-infinity.js");
var toString = __webpack_require__(/*! ../internals/to-string */ "../node_modules/core-js/internals/to-string.js");
var requireObjectCoercible = __webpack_require__(/*! ../internals/require-object-coercible */ "../node_modules/core-js/internals/require-object-coercible.js");

var charAt = uncurryThis(''.charAt);
var charCodeAt = uncurryThis(''.charCodeAt);
var stringSlice = uncurryThis(''.slice);

var createMethod = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = toString(requireObjectCoercible($this));
    var position = toIntegerOrInfinity(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = charCodeAt(S, position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = charCodeAt(S, position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING
          ? charAt(S, position)
          : first
        : CONVERT_TO_STRING
          ? stringSlice(S, position, position + 2)
          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

module.exports = {
  // `String.prototype.codePointAt` method
  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod(true)
};


/***/ }),

/***/ "../node_modules/core-js/internals/string-trim.js":
/*!********************************************************!*\
  !*** ../node_modules/core-js/internals/string-trim.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var requireObjectCoercible = __webpack_require__(/*! ../internals/require-object-coercible */ "../node_modules/core-js/internals/require-object-coercible.js");
var toString = __webpack_require__(/*! ../internals/to-string */ "../node_modules/core-js/internals/to-string.js");
var whitespaces = __webpack_require__(/*! ../internals/whitespaces */ "../node_modules/core-js/internals/whitespaces.js");

var replace = uncurryThis(''.replace);
var ltrim = RegExp('^[' + whitespaces + ']+');
var rtrim = RegExp('(^|[^' + whitespaces + '])[' + whitespaces + ']+$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod = function (TYPE) {
  return function ($this) {
    var string = toString(requireObjectCoercible($this));
    if (TYPE & 1) string = replace(string, ltrim, '');
    if (TYPE & 2) string = replace(string, rtrim, '$1');
    return string;
  };
};

module.exports = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimstart
  start: createMethod(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimend
  end: createMethod(2),
  // `String.prototype.trim` method
  // https://tc39.es/ecma262/#sec-string.prototype.trim
  trim: createMethod(3)
};


/***/ }),

/***/ "../node_modules/core-js/internals/symbol-constructor-detection.js":
/*!*************************************************************************!*\
  !*** ../node_modules/core-js/internals/symbol-constructor-detection.js ***!
  \*************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/* eslint-disable es/no-symbol -- required for testing */
var V8_VERSION = __webpack_require__(/*! ../internals/engine-v8-version */ "../node_modules/core-js/internals/engine-v8-version.js");
var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");

var $String = global.String;

// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
  var symbol = Symbol('symbol detection');
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
  // of course, fail.
  return !$String(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && V8_VERSION && V8_VERSION < 41;
});


/***/ }),

/***/ "../node_modules/core-js/internals/symbol-define-to-primitive.js":
/*!***********************************************************************!*\
  !*** ../node_modules/core-js/internals/symbol-define-to-primitive.js ***!
  \***********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var call = __webpack_require__(/*! ../internals/function-call */ "../node_modules/core-js/internals/function-call.js");
var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "../node_modules/core-js/internals/get-built-in.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");
var defineBuiltIn = __webpack_require__(/*! ../internals/define-built-in */ "../node_modules/core-js/internals/define-built-in.js");

module.exports = function () {
  var Symbol = getBuiltIn('Symbol');
  var SymbolPrototype = Symbol && Symbol.prototype;
  var valueOf = SymbolPrototype && SymbolPrototype.valueOf;
  var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

  if (SymbolPrototype && !SymbolPrototype[TO_PRIMITIVE]) {
    // `Symbol.prototype[@@toPrimitive]` method
    // https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
    // eslint-disable-next-line no-unused-vars -- required for .length
    defineBuiltIn(SymbolPrototype, TO_PRIMITIVE, function (hint) {
      return call(valueOf, this);
    }, { arity: 1 });
  }
};


/***/ }),

/***/ "../node_modules/core-js/internals/symbol-registry-detection.js":
/*!**********************************************************************!*\
  !*** ../node_modules/core-js/internals/symbol-registry-detection.js ***!
  \**********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var NATIVE_SYMBOL = __webpack_require__(/*! ../internals/symbol-constructor-detection */ "../node_modules/core-js/internals/symbol-constructor-detection.js");

/* eslint-disable es/no-symbol -- safe */
module.exports = NATIVE_SYMBOL && !!Symbol['for'] && !!Symbol.keyFor;


/***/ }),

/***/ "../node_modules/core-js/internals/this-number-value.js":
/*!**************************************************************!*\
  !*** ../node_modules/core-js/internals/this-number-value.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");

// `thisNumberValue` abstract operation
// https://tc39.es/ecma262/#sec-thisnumbervalue
module.exports = uncurryThis(1.0.valueOf);


/***/ }),

/***/ "../node_modules/core-js/internals/to-absolute-index.js":
/*!**************************************************************!*\
  !*** ../node_modules/core-js/internals/to-absolute-index.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var toIntegerOrInfinity = __webpack_require__(/*! ../internals/to-integer-or-infinity */ "../node_modules/core-js/internals/to-integer-or-infinity.js");

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
module.exports = function (index, length) {
  var integer = toIntegerOrInfinity(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};


/***/ }),

/***/ "../node_modules/core-js/internals/to-indexed-object.js":
/*!**************************************************************!*\
  !*** ../node_modules/core-js/internals/to-indexed-object.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

// toObject with fallback for non-array-like ES3 strings
var IndexedObject = __webpack_require__(/*! ../internals/indexed-object */ "../node_modules/core-js/internals/indexed-object.js");
var requireObjectCoercible = __webpack_require__(/*! ../internals/require-object-coercible */ "../node_modules/core-js/internals/require-object-coercible.js");

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};


/***/ }),

/***/ "../node_modules/core-js/internals/to-integer-or-infinity.js":
/*!*******************************************************************!*\
  !*** ../node_modules/core-js/internals/to-integer-or-infinity.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var trunc = __webpack_require__(/*! ../internals/math-trunc */ "../node_modules/core-js/internals/math-trunc.js");

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
module.exports = function (argument) {
  var number = +argument;
  // eslint-disable-next-line no-self-compare -- NaN check
  return number !== number || number === 0 ? 0 : trunc(number);
};


/***/ }),

/***/ "../node_modules/core-js/internals/to-length.js":
/*!******************************************************!*\
  !*** ../node_modules/core-js/internals/to-length.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var toIntegerOrInfinity = __webpack_require__(/*! ../internals/to-integer-or-infinity */ "../node_modules/core-js/internals/to-integer-or-infinity.js");

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
module.exports = function (argument) {
  return argument > 0 ? min(toIntegerOrInfinity(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};


/***/ }),

/***/ "../node_modules/core-js/internals/to-object.js":
/*!******************************************************!*\
  !*** ../node_modules/core-js/internals/to-object.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var requireObjectCoercible = __webpack_require__(/*! ../internals/require-object-coercible */ "../node_modules/core-js/internals/require-object-coercible.js");

var $Object = Object;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
module.exports = function (argument) {
  return $Object(requireObjectCoercible(argument));
};


/***/ }),

/***/ "../node_modules/core-js/internals/to-primitive.js":
/*!*********************************************************!*\
  !*** ../node_modules/core-js/internals/to-primitive.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var call = __webpack_require__(/*! ../internals/function-call */ "../node_modules/core-js/internals/function-call.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "../node_modules/core-js/internals/is-object.js");
var isSymbol = __webpack_require__(/*! ../internals/is-symbol */ "../node_modules/core-js/internals/is-symbol.js");
var getMethod = __webpack_require__(/*! ../internals/get-method */ "../node_modules/core-js/internals/get-method.js");
var ordinaryToPrimitive = __webpack_require__(/*! ../internals/ordinary-to-primitive */ "../node_modules/core-js/internals/ordinary-to-primitive.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");

var $TypeError = TypeError;
var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
module.exports = function (input, pref) {
  if (!isObject(input) || isSymbol(input)) return input;
  var exoticToPrim = getMethod(input, TO_PRIMITIVE);
  var result;
  if (exoticToPrim) {
    if (pref === undefined) pref = 'default';
    result = call(exoticToPrim, input, pref);
    if (!isObject(result) || isSymbol(result)) return result;
    throw new $TypeError("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive(input, pref);
};


/***/ }),

/***/ "../node_modules/core-js/internals/to-property-key.js":
/*!************************************************************!*\
  !*** ../node_modules/core-js/internals/to-property-key.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var toPrimitive = __webpack_require__(/*! ../internals/to-primitive */ "../node_modules/core-js/internals/to-primitive.js");
var isSymbol = __webpack_require__(/*! ../internals/is-symbol */ "../node_modules/core-js/internals/is-symbol.js");

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
module.exports = function (argument) {
  var key = toPrimitive(argument, 'string');
  return isSymbol(key) ? key : key + '';
};


/***/ }),

/***/ "../node_modules/core-js/internals/to-string-tag-support.js":
/*!******************************************************************!*\
  !*** ../node_modules/core-js/internals/to-string-tag-support.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

module.exports = String(test) === '[object z]';


/***/ }),

/***/ "../node_modules/core-js/internals/to-string.js":
/*!******************************************************!*\
  !*** ../node_modules/core-js/internals/to-string.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var classof = __webpack_require__(/*! ../internals/classof */ "../node_modules/core-js/internals/classof.js");

var $String = String;

module.exports = function (argument) {
  if (classof(argument) === 'Symbol') throw new TypeError('Cannot convert a Symbol value to a string');
  return $String(argument);
};


/***/ }),

/***/ "../node_modules/core-js/internals/try-to-string.js":
/*!**********************************************************!*\
  !*** ../node_modules/core-js/internals/try-to-string.js ***!
  \**********************************************************/
/***/ ((module) => {

"use strict";

var $String = String;

module.exports = function (argument) {
  try {
    return $String(argument);
  } catch (error) {
    return 'Object';
  }
};


/***/ }),

/***/ "../node_modules/core-js/internals/uid.js":
/*!************************************************!*\
  !*** ../node_modules/core-js/internals/uid.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");

var id = 0;
var postfix = Math.random();
var toString = uncurryThis(1.0.toString);

module.exports = function (key) {
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString(++id + postfix, 36);
};


/***/ }),

/***/ "../node_modules/core-js/internals/use-symbol-as-uid.js":
/*!**************************************************************!*\
  !*** ../node_modules/core-js/internals/use-symbol-as-uid.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/* eslint-disable es/no-symbol -- required for testing */
var NATIVE_SYMBOL = __webpack_require__(/*! ../internals/symbol-constructor-detection */ "../node_modules/core-js/internals/symbol-constructor-detection.js");

module.exports = NATIVE_SYMBOL
  && !Symbol.sham
  && typeof Symbol.iterator == 'symbol';


/***/ }),

/***/ "../node_modules/core-js/internals/v8-prototype-define-bug.js":
/*!********************************************************************!*\
  !*** ../node_modules/core-js/internals/v8-prototype-define-bug.js ***!
  \********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "../node_modules/core-js/internals/descriptors.js");
var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");

// V8 ~ Chrome 36-
// https://bugs.chromium.org/p/v8/issues/detail?id=3334
module.exports = DESCRIPTORS && fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype !== 42;
});


/***/ }),

/***/ "../node_modules/core-js/internals/weak-map-basic-detection.js":
/*!*********************************************************************!*\
  !*** ../node_modules/core-js/internals/weak-map-basic-detection.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");

var WeakMap = global.WeakMap;

module.exports = isCallable(WeakMap) && /native code/.test(String(WeakMap));


/***/ }),

/***/ "../node_modules/core-js/internals/well-known-symbol-define.js":
/*!*********************************************************************!*\
  !*** ../node_modules/core-js/internals/well-known-symbol-define.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var path = __webpack_require__(/*! ../internals/path */ "../node_modules/core-js/internals/path.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "../node_modules/core-js/internals/has-own-property.js");
var wrappedWellKnownSymbolModule = __webpack_require__(/*! ../internals/well-known-symbol-wrapped */ "../node_modules/core-js/internals/well-known-symbol-wrapped.js");
var defineProperty = (__webpack_require__(/*! ../internals/object-define-property */ "../node_modules/core-js/internals/object-define-property.js").f);

module.exports = function (NAME) {
  var Symbol = path.Symbol || (path.Symbol = {});
  if (!hasOwn(Symbol, NAME)) defineProperty(Symbol, NAME, {
    value: wrappedWellKnownSymbolModule.f(NAME)
  });
};


/***/ }),

/***/ "../node_modules/core-js/internals/well-known-symbol-wrapped.js":
/*!**********************************************************************!*\
  !*** ../node_modules/core-js/internals/well-known-symbol-wrapped.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");

exports.f = wellKnownSymbol;


/***/ }),

/***/ "../node_modules/core-js/internals/well-known-symbol.js":
/*!**************************************************************!*\
  !*** ../node_modules/core-js/internals/well-known-symbol.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");
var shared = __webpack_require__(/*! ../internals/shared */ "../node_modules/core-js/internals/shared.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "../node_modules/core-js/internals/has-own-property.js");
var uid = __webpack_require__(/*! ../internals/uid */ "../node_modules/core-js/internals/uid.js");
var NATIVE_SYMBOL = __webpack_require__(/*! ../internals/symbol-constructor-detection */ "../node_modules/core-js/internals/symbol-constructor-detection.js");
var USE_SYMBOL_AS_UID = __webpack_require__(/*! ../internals/use-symbol-as-uid */ "../node_modules/core-js/internals/use-symbol-as-uid.js");

var Symbol = global.Symbol;
var WellKnownSymbolsStore = shared('wks');
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol['for'] || Symbol : Symbol && Symbol.withoutSetter || uid;

module.exports = function (name) {
  if (!hasOwn(WellKnownSymbolsStore, name)) {
    WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn(Symbol, name)
      ? Symbol[name]
      : createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore[name];
};


/***/ }),

/***/ "../node_modules/core-js/internals/whitespaces.js":
/*!********************************************************!*\
  !*** ../node_modules/core-js/internals/whitespaces.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";

// a string of all valid unicode whitespaces
module.exports = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
  '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';


/***/ }),

/***/ "../node_modules/core-js/modules/es.array.concat.js":
/*!**********************************************************!*\
  !*** ../node_modules/core-js/modules/es.array.concat.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "../node_modules/core-js/internals/export.js");
var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var isArray = __webpack_require__(/*! ../internals/is-array */ "../node_modules/core-js/internals/is-array.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "../node_modules/core-js/internals/is-object.js");
var toObject = __webpack_require__(/*! ../internals/to-object */ "../node_modules/core-js/internals/to-object.js");
var lengthOfArrayLike = __webpack_require__(/*! ../internals/length-of-array-like */ "../node_modules/core-js/internals/length-of-array-like.js");
var doesNotExceedSafeInteger = __webpack_require__(/*! ../internals/does-not-exceed-safe-integer */ "../node_modules/core-js/internals/does-not-exceed-safe-integer.js");
var createProperty = __webpack_require__(/*! ../internals/create-property */ "../node_modules/core-js/internals/create-property.js");
var arraySpeciesCreate = __webpack_require__(/*! ../internals/array-species-create */ "../node_modules/core-js/internals/array-species-create.js");
var arrayMethodHasSpeciesSupport = __webpack_require__(/*! ../internals/array-method-has-species-support */ "../node_modules/core-js/internals/array-method-has-species-support.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");
var V8_VERSION = __webpack_require__(/*! ../internals/engine-v8-version */ "../node_modules/core-js/internals/engine-v8-version.js");

var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION >= 51 || !fails(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var isConcatSpreadable = function (O) {
  if (!isObject(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray(O);
};

var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !arrayMethodHasSpeciesSupport('concat');

// `Array.prototype.concat` method
// https://tc39.es/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
$({ target: 'Array', proto: true, arity: 1, forced: FORCED }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  concat: function concat(arg) {
    var O = toObject(this);
    var A = arraySpeciesCreate(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = lengthOfArrayLike(E);
        doesNotExceedSafeInteger(n + len);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
      } else {
        doesNotExceedSafeInteger(n + 1);
        createProperty(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});


/***/ }),

/***/ "../node_modules/core-js/modules/es.array.filter.js":
/*!**********************************************************!*\
  !*** ../node_modules/core-js/modules/es.array.filter.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "../node_modules/core-js/internals/export.js");
var $filter = (__webpack_require__(/*! ../internals/array-iteration */ "../node_modules/core-js/internals/array-iteration.js").filter);
var arrayMethodHasSpeciesSupport = __webpack_require__(/*! ../internals/array-method-has-species-support */ "../node_modules/core-js/internals/array-method-has-species-support.js");

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter');

// `Array.prototype.filter` method
// https://tc39.es/ecma262/#sec-array.prototype.filter
// with adding support of @@species
$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});


/***/ }),

/***/ "../node_modules/core-js/modules/es.array.iterator.js":
/*!************************************************************!*\
  !*** ../node_modules/core-js/modules/es.array.iterator.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "../node_modules/core-js/internals/to-indexed-object.js");
var addToUnscopables = __webpack_require__(/*! ../internals/add-to-unscopables */ "../node_modules/core-js/internals/add-to-unscopables.js");
var Iterators = __webpack_require__(/*! ../internals/iterators */ "../node_modules/core-js/internals/iterators.js");
var InternalStateModule = __webpack_require__(/*! ../internals/internal-state */ "../node_modules/core-js/internals/internal-state.js");
var defineProperty = (__webpack_require__(/*! ../internals/object-define-property */ "../node_modules/core-js/internals/object-define-property.js").f);
var defineIterator = __webpack_require__(/*! ../internals/iterator-define */ "../node_modules/core-js/internals/iterator-define.js");
var createIterResultObject = __webpack_require__(/*! ../internals/create-iter-result-object */ "../node_modules/core-js/internals/create-iter-result-object.js");
var IS_PURE = __webpack_require__(/*! ../internals/is-pure */ "../node_modules/core-js/internals/is-pure.js");
var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "../node_modules/core-js/internals/descriptors.js");

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);

// `Array.prototype.entries` method
// https://tc39.es/ecma262/#sec-array.prototype.entries
// `Array.prototype.keys` method
// https://tc39.es/ecma262/#sec-array.prototype.keys
// `Array.prototype.values` method
// https://tc39.es/ecma262/#sec-array.prototype.values
// `Array.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-array.prototype-@@iterator
// `CreateArrayIterator` internal method
// https://tc39.es/ecma262/#sec-createarrayiterator
module.exports = defineIterator(Array, 'Array', function (iterated, kind) {
  setInternalState(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState(this);
  var target = state.target;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return createIterResultObject(undefined, true);
  }
  switch (state.kind) {
    case 'keys': return createIterResultObject(index, false);
    case 'values': return createIterResultObject(target[index], false);
  } return createIterResultObject([index, target[index]], false);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
// https://tc39.es/ecma262/#sec-createmappedargumentsobject
var values = Iterators.Arguments = Iterators.Array;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

// V8 ~ Chrome 45- bug
if (!IS_PURE && DESCRIPTORS && values.name !== 'values') try {
  defineProperty(values, 'name', { value: 'values' });
} catch (error) { /* empty */ }


/***/ }),

/***/ "../node_modules/core-js/modules/es.array.map.js":
/*!*******************************************************!*\
  !*** ../node_modules/core-js/modules/es.array.map.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "../node_modules/core-js/internals/export.js");
var $map = (__webpack_require__(/*! ../internals/array-iteration */ "../node_modules/core-js/internals/array-iteration.js").map);
var arrayMethodHasSpeciesSupport = __webpack_require__(/*! ../internals/array-method-has-species-support */ "../node_modules/core-js/internals/array-method-has-species-support.js");

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('map');

// `Array.prototype.map` method
// https://tc39.es/ecma262/#sec-array.prototype.map
// with adding support of @@species
$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});


/***/ }),

/***/ "../node_modules/core-js/modules/es.array.reduce.js":
/*!**********************************************************!*\
  !*** ../node_modules/core-js/modules/es.array.reduce.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "../node_modules/core-js/internals/export.js");
var $reduce = (__webpack_require__(/*! ../internals/array-reduce */ "../node_modules/core-js/internals/array-reduce.js").left);
var arrayMethodIsStrict = __webpack_require__(/*! ../internals/array-method-is-strict */ "../node_modules/core-js/internals/array-method-is-strict.js");
var CHROME_VERSION = __webpack_require__(/*! ../internals/engine-v8-version */ "../node_modules/core-js/internals/engine-v8-version.js");
var IS_NODE = __webpack_require__(/*! ../internals/engine-is-node */ "../node_modules/core-js/internals/engine-is-node.js");

// Chrome 80-82 has a critical bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
var CHROME_BUG = !IS_NODE && CHROME_VERSION > 79 && CHROME_VERSION < 83;
var FORCED = CHROME_BUG || !arrayMethodIsStrict('reduce');

// `Array.prototype.reduce` method
// https://tc39.es/ecma262/#sec-array.prototype.reduce
$({ target: 'Array', proto: true, forced: FORCED }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var length = arguments.length;
    return $reduce(this, callbackfn, length, length > 1 ? arguments[1] : undefined);
  }
});


/***/ }),

/***/ "../node_modules/core-js/modules/es.date.to-primitive.js":
/*!***************************************************************!*\
  !*** ../node_modules/core-js/modules/es.date.to-primitive.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "../node_modules/core-js/internals/has-own-property.js");
var defineBuiltIn = __webpack_require__(/*! ../internals/define-built-in */ "../node_modules/core-js/internals/define-built-in.js");
var dateToPrimitive = __webpack_require__(/*! ../internals/date-to-primitive */ "../node_modules/core-js/internals/date-to-primitive.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");

var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
var DatePrototype = Date.prototype;

// `Date.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
if (!hasOwn(DatePrototype, TO_PRIMITIVE)) {
  defineBuiltIn(DatePrototype, TO_PRIMITIVE, dateToPrimitive);
}


/***/ }),

/***/ "../node_modules/core-js/modules/es.json.stringify.js":
/*!************************************************************!*\
  !*** ../node_modules/core-js/modules/es.json.stringify.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "../node_modules/core-js/internals/export.js");
var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "../node_modules/core-js/internals/get-built-in.js");
var apply = __webpack_require__(/*! ../internals/function-apply */ "../node_modules/core-js/internals/function-apply.js");
var call = __webpack_require__(/*! ../internals/function-call */ "../node_modules/core-js/internals/function-call.js");
var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var isSymbol = __webpack_require__(/*! ../internals/is-symbol */ "../node_modules/core-js/internals/is-symbol.js");
var arraySlice = __webpack_require__(/*! ../internals/array-slice */ "../node_modules/core-js/internals/array-slice.js");
var getReplacerFunction = __webpack_require__(/*! ../internals/get-json-replacer-function */ "../node_modules/core-js/internals/get-json-replacer-function.js");
var NATIVE_SYMBOL = __webpack_require__(/*! ../internals/symbol-constructor-detection */ "../node_modules/core-js/internals/symbol-constructor-detection.js");

var $String = String;
var $stringify = getBuiltIn('JSON', 'stringify');
var exec = uncurryThis(/./.exec);
var charAt = uncurryThis(''.charAt);
var charCodeAt = uncurryThis(''.charCodeAt);
var replace = uncurryThis(''.replace);
var numberToString = uncurryThis(1.0.toString);

var tester = /[\uD800-\uDFFF]/g;
var low = /^[\uD800-\uDBFF]$/;
var hi = /^[\uDC00-\uDFFF]$/;

var WRONG_SYMBOLS_CONVERSION = !NATIVE_SYMBOL || fails(function () {
  var symbol = getBuiltIn('Symbol')('stringify detection');
  // MS Edge converts symbol values to JSON as {}
  return $stringify([symbol]) !== '[null]'
    // WebKit converts symbol values to JSON as null
    || $stringify({ a: symbol }) !== '{}'
    // V8 throws on boxed symbols
    || $stringify(Object(symbol)) !== '{}';
});

// https://github.com/tc39/proposal-well-formed-stringify
var ILL_FORMED_UNICODE = fails(function () {
  return $stringify('\uDF06\uD834') !== '"\\udf06\\ud834"'
    || $stringify('\uDEAD') !== '"\\udead"';
});

var stringifyWithSymbolsFix = function (it, replacer) {
  var args = arraySlice(arguments);
  var $replacer = getReplacerFunction(replacer);
  if (!isCallable($replacer) && (it === undefined || isSymbol(it))) return; // IE8 returns string on undefined
  args[1] = function (key, value) {
    // some old implementations (like WebKit) could pass numbers as keys
    if (isCallable($replacer)) value = call($replacer, this, $String(key), value);
    if (!isSymbol(value)) return value;
  };
  return apply($stringify, null, args);
};

var fixIllFormed = function (match, offset, string) {
  var prev = charAt(string, offset - 1);
  var next = charAt(string, offset + 1);
  if ((exec(low, match) && !exec(hi, next)) || (exec(hi, match) && !exec(low, prev))) {
    return '\\u' + numberToString(charCodeAt(match, 0), 16);
  } return match;
};

if ($stringify) {
  // `JSON.stringify` method
  // https://tc39.es/ecma262/#sec-json.stringify
  $({ target: 'JSON', stat: true, arity: 3, forced: WRONG_SYMBOLS_CONVERSION || ILL_FORMED_UNICODE }, {
    // eslint-disable-next-line no-unused-vars -- required for `.length`
    stringify: function stringify(it, replacer, space) {
      var args = arraySlice(arguments);
      var result = apply(WRONG_SYMBOLS_CONVERSION ? stringifyWithSymbolsFix : $stringify, null, args);
      return ILL_FORMED_UNICODE && typeof result == 'string' ? replace(result, tester, fixIllFormed) : result;
    }
  });
}


/***/ }),

/***/ "../node_modules/core-js/modules/es.number.constructor.js":
/*!****************************************************************!*\
  !*** ../node_modules/core-js/modules/es.number.constructor.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "../node_modules/core-js/internals/export.js");
var IS_PURE = __webpack_require__(/*! ../internals/is-pure */ "../node_modules/core-js/internals/is-pure.js");
var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "../node_modules/core-js/internals/descriptors.js");
var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");
var path = __webpack_require__(/*! ../internals/path */ "../node_modules/core-js/internals/path.js");
var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var isForced = __webpack_require__(/*! ../internals/is-forced */ "../node_modules/core-js/internals/is-forced.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "../node_modules/core-js/internals/has-own-property.js");
var inheritIfRequired = __webpack_require__(/*! ../internals/inherit-if-required */ "../node_modules/core-js/internals/inherit-if-required.js");
var isPrototypeOf = __webpack_require__(/*! ../internals/object-is-prototype-of */ "../node_modules/core-js/internals/object-is-prototype-of.js");
var isSymbol = __webpack_require__(/*! ../internals/is-symbol */ "../node_modules/core-js/internals/is-symbol.js");
var toPrimitive = __webpack_require__(/*! ../internals/to-primitive */ "../node_modules/core-js/internals/to-primitive.js");
var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var getOwnPropertyNames = (__webpack_require__(/*! ../internals/object-get-own-property-names */ "../node_modules/core-js/internals/object-get-own-property-names.js").f);
var getOwnPropertyDescriptor = (__webpack_require__(/*! ../internals/object-get-own-property-descriptor */ "../node_modules/core-js/internals/object-get-own-property-descriptor.js").f);
var defineProperty = (__webpack_require__(/*! ../internals/object-define-property */ "../node_modules/core-js/internals/object-define-property.js").f);
var thisNumberValue = __webpack_require__(/*! ../internals/this-number-value */ "../node_modules/core-js/internals/this-number-value.js");
var trim = (__webpack_require__(/*! ../internals/string-trim */ "../node_modules/core-js/internals/string-trim.js").trim);

var NUMBER = 'Number';
var NativeNumber = global[NUMBER];
var PureNumberNamespace = path[NUMBER];
var NumberPrototype = NativeNumber.prototype;
var TypeError = global.TypeError;
var stringSlice = uncurryThis(''.slice);
var charCodeAt = uncurryThis(''.charCodeAt);

// `ToNumeric` abstract operation
// https://tc39.es/ecma262/#sec-tonumeric
var toNumeric = function (value) {
  var primValue = toPrimitive(value, 'number');
  return typeof primValue == 'bigint' ? primValue : toNumber(primValue);
};

// `ToNumber` abstract operation
// https://tc39.es/ecma262/#sec-tonumber
var toNumber = function (argument) {
  var it = toPrimitive(argument, 'number');
  var first, third, radix, maxCode, digits, length, index, code;
  if (isSymbol(it)) throw new TypeError('Cannot convert a Symbol value to a number');
  if (typeof it == 'string' && it.length > 2) {
    it = trim(it);
    first = charCodeAt(it, 0);
    if (first === 43 || first === 45) {
      third = charCodeAt(it, 2);
      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if (first === 48) {
      switch (charCodeAt(it, 1)) {
        // fast equal of /^0b[01]+$/i
        case 66:
        case 98:
          radix = 2;
          maxCode = 49;
          break;
        // fast equal of /^0o[0-7]+$/i
        case 79:
        case 111:
          radix = 8;
          maxCode = 55;
          break;
        default:
          return +it;
      }
      digits = stringSlice(it, 2);
      length = digits.length;
      for (index = 0; index < length; index++) {
        code = charCodeAt(digits, index);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if (code < 48 || code > maxCode) return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

var FORCED = isForced(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'));

var calledWithNew = function (dummy) {
  // includes check on 1..constructor(foo) case
  return isPrototypeOf(NumberPrototype, dummy) && fails(function () { thisNumberValue(dummy); });
};

// `Number` constructor
// https://tc39.es/ecma262/#sec-number-constructor
var NumberWrapper = function Number(value) {
  var n = arguments.length < 1 ? 0 : NativeNumber(toNumeric(value));
  return calledWithNew(this) ? inheritIfRequired(Object(n), this, NumberWrapper) : n;
};

NumberWrapper.prototype = NumberPrototype;
if (FORCED && !IS_PURE) NumberPrototype.constructor = NumberWrapper;

$({ global: true, constructor: true, wrap: true, forced: FORCED }, {
  Number: NumberWrapper
});

// Use `internal/copy-constructor-properties` helper in `core-js@4`
var copyConstructorProperties = function (target, source) {
  for (var keys = DESCRIPTORS ? getOwnPropertyNames(source) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES2015 (in case, if modules with ES2015 Number statics required before):
    'EPSILON,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,isFinite,isInteger,isNaN,isSafeInteger,parseFloat,parseInt,' +
    // ESNext
    'fromString,range'
  ).split(','), j = 0, key; keys.length > j; j++) {
    if (hasOwn(source, key = keys[j]) && !hasOwn(target, key)) {
      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  }
};

if (IS_PURE && PureNumberNamespace) copyConstructorProperties(path[NUMBER], PureNumberNamespace);
if (FORCED || IS_PURE) copyConstructorProperties(path[NUMBER], NativeNumber);


/***/ }),

/***/ "../node_modules/core-js/modules/es.object.assign.js":
/*!***********************************************************!*\
  !*** ../node_modules/core-js/modules/es.object.assign.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "../node_modules/core-js/internals/export.js");
var assign = __webpack_require__(/*! ../internals/object-assign */ "../node_modules/core-js/internals/object-assign.js");

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
// eslint-disable-next-line es/no-object-assign -- required for testing
$({ target: 'Object', stat: true, arity: 2, forced: Object.assign !== assign }, {
  assign: assign
});


/***/ }),

/***/ "../node_modules/core-js/modules/es.object.define-property.js":
/*!********************************************************************!*\
  !*** ../node_modules/core-js/modules/es.object.define-property.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "../node_modules/core-js/internals/export.js");
var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "../node_modules/core-js/internals/descriptors.js");
var defineProperty = (__webpack_require__(/*! ../internals/object-define-property */ "../node_modules/core-js/internals/object-define-property.js").f);

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
// eslint-disable-next-line es/no-object-defineproperty -- safe
$({ target: 'Object', stat: true, forced: Object.defineProperty !== defineProperty, sham: !DESCRIPTORS }, {
  defineProperty: defineProperty
});


/***/ }),

/***/ "../node_modules/core-js/modules/es.object.get-own-property-symbols.js":
/*!*****************************************************************************!*\
  !*** ../node_modules/core-js/modules/es.object.get-own-property-symbols.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "../node_modules/core-js/internals/export.js");
var NATIVE_SYMBOL = __webpack_require__(/*! ../internals/symbol-constructor-detection */ "../node_modules/core-js/internals/symbol-constructor-detection.js");
var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var getOwnPropertySymbolsModule = __webpack_require__(/*! ../internals/object-get-own-property-symbols */ "../node_modules/core-js/internals/object-get-own-property-symbols.js");
var toObject = __webpack_require__(/*! ../internals/to-object */ "../node_modules/core-js/internals/to-object.js");

// V8 ~ Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
var FORCED = !NATIVE_SYMBOL || fails(function () { getOwnPropertySymbolsModule.f(1); });

// `Object.getOwnPropertySymbols` method
// https://tc39.es/ecma262/#sec-object.getownpropertysymbols
$({ target: 'Object', stat: true, forced: FORCED }, {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    var $getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
    return $getOwnPropertySymbols ? $getOwnPropertySymbols(toObject(it)) : [];
  }
});


/***/ }),

/***/ "../node_modules/core-js/modules/es.object.to-string.js":
/*!**************************************************************!*\
  !*** ../node_modules/core-js/modules/es.object.to-string.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var TO_STRING_TAG_SUPPORT = __webpack_require__(/*! ../internals/to-string-tag-support */ "../node_modules/core-js/internals/to-string-tag-support.js");
var defineBuiltIn = __webpack_require__(/*! ../internals/define-built-in */ "../node_modules/core-js/internals/define-built-in.js");
var toString = __webpack_require__(/*! ../internals/object-to-string */ "../node_modules/core-js/internals/object-to-string.js");

// `Object.prototype.toString` method
// https://tc39.es/ecma262/#sec-object.prototype.tostring
if (!TO_STRING_TAG_SUPPORT) {
  defineBuiltIn(Object.prototype, 'toString', toString, { unsafe: true });
}


/***/ }),

/***/ "../node_modules/core-js/modules/es.regexp.exec.js":
/*!*********************************************************!*\
  !*** ../node_modules/core-js/modules/es.regexp.exec.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "../node_modules/core-js/internals/export.js");
var exec = __webpack_require__(/*! ../internals/regexp-exec */ "../node_modules/core-js/internals/regexp-exec.js");

// `RegExp.prototype.exec` method
// https://tc39.es/ecma262/#sec-regexp.prototype.exec
$({ target: 'RegExp', proto: true, forced: /./.exec !== exec }, {
  exec: exec
});


/***/ }),

/***/ "../node_modules/core-js/modules/es.string.iterator.js":
/*!*************************************************************!*\
  !*** ../node_modules/core-js/modules/es.string.iterator.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var charAt = (__webpack_require__(/*! ../internals/string-multibyte */ "../node_modules/core-js/internals/string-multibyte.js").charAt);
var toString = __webpack_require__(/*! ../internals/to-string */ "../node_modules/core-js/internals/to-string.js");
var InternalStateModule = __webpack_require__(/*! ../internals/internal-state */ "../node_modules/core-js/internals/internal-state.js");
var defineIterator = __webpack_require__(/*! ../internals/iterator-define */ "../node_modules/core-js/internals/iterator-define.js");
var createIterResultObject = __webpack_require__(/*! ../internals/create-iter-result-object */ "../node_modules/core-js/internals/create-iter-result-object.js");

var STRING_ITERATOR = 'String Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState(this, {
    type: STRING_ITERATOR,
    string: toString(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return createIterResultObject(undefined, true);
  point = charAt(string, index);
  state.index += point.length;
  return createIterResultObject(point, false);
});


/***/ }),

/***/ "../node_modules/core-js/modules/es.string.replace.js":
/*!************************************************************!*\
  !*** ../node_modules/core-js/modules/es.string.replace.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var apply = __webpack_require__(/*! ../internals/function-apply */ "../node_modules/core-js/internals/function-apply.js");
var call = __webpack_require__(/*! ../internals/function-call */ "../node_modules/core-js/internals/function-call.js");
var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var fixRegExpWellKnownSymbolLogic = __webpack_require__(/*! ../internals/fix-regexp-well-known-symbol-logic */ "../node_modules/core-js/internals/fix-regexp-well-known-symbol-logic.js");
var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "../node_modules/core-js/internals/an-object.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var isNullOrUndefined = __webpack_require__(/*! ../internals/is-null-or-undefined */ "../node_modules/core-js/internals/is-null-or-undefined.js");
var toIntegerOrInfinity = __webpack_require__(/*! ../internals/to-integer-or-infinity */ "../node_modules/core-js/internals/to-integer-or-infinity.js");
var toLength = __webpack_require__(/*! ../internals/to-length */ "../node_modules/core-js/internals/to-length.js");
var toString = __webpack_require__(/*! ../internals/to-string */ "../node_modules/core-js/internals/to-string.js");
var requireObjectCoercible = __webpack_require__(/*! ../internals/require-object-coercible */ "../node_modules/core-js/internals/require-object-coercible.js");
var advanceStringIndex = __webpack_require__(/*! ../internals/advance-string-index */ "../node_modules/core-js/internals/advance-string-index.js");
var getMethod = __webpack_require__(/*! ../internals/get-method */ "../node_modules/core-js/internals/get-method.js");
var getSubstitution = __webpack_require__(/*! ../internals/get-substitution */ "../node_modules/core-js/internals/get-substitution.js");
var regExpExec = __webpack_require__(/*! ../internals/regexp-exec-abstract */ "../node_modules/core-js/internals/regexp-exec-abstract.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");

var REPLACE = wellKnownSymbol('replace');
var max = Math.max;
var min = Math.min;
var concat = uncurryThis([].concat);
var push = uncurryThis([].push);
var stringIndexOf = uncurryThis(''.indexOf);
var stringSlice = uncurryThis(''.slice);

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// IE <= 11 replaces $0 with the whole match, as if it was $&
// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
var REPLACE_KEEPS_$0 = (function () {
  // eslint-disable-next-line regexp/prefer-escape-replacement-dollar-char -- required for testing
  return 'a'.replace(/./, '$0') === '$0';
})();

// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
  if (/./[REPLACE]) {
    return /./[REPLACE]('a', '$0') === '';
  }
  return false;
})();

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  // eslint-disable-next-line regexp/no-useless-dollar-replacements -- false positive
  return ''.replace(re, '$<a>') !== '7';
});

// @@replace logic
fixRegExpWellKnownSymbolLogic('replace', function (_, nativeReplace, maybeCallNative) {
  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

  return [
    // `String.prototype.replace` method
    // https://tc39.es/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible(this);
      var replacer = isNullOrUndefined(searchValue) ? undefined : getMethod(searchValue, REPLACE);
      return replacer
        ? call(replacer, searchValue, O, replaceValue)
        : call(nativeReplace, toString(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
    function (string, replaceValue) {
      var rx = anObject(this);
      var S = toString(string);

      if (
        typeof replaceValue == 'string' &&
        stringIndexOf(replaceValue, UNSAFE_SUBSTITUTE) === -1 &&
        stringIndexOf(replaceValue, '$<') === -1
      ) {
        var res = maybeCallNative(nativeReplace, rx, S, replaceValue);
        if (res.done) return res.value;
      }

      var functionalReplace = isCallable(replaceValue);
      if (!functionalReplace) replaceValue = toString(replaceValue);

      var global = rx.global;
      var fullUnicode;
      if (global) {
        fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }

      var results = [];
      var result;
      while (true) {
        result = regExpExec(rx, S);
        if (result === null) break;

        push(results, result);
        if (!global) break;

        var matchStr = toString(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];

        var matched = toString(result[0]);
        var position = max(min(toIntegerOrInfinity(result.index), S.length), 0);
        var captures = [];
        var replacement;
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) push(captures, maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = concat([matched], captures, position, S);
          if (namedCaptures !== undefined) push(replacerArgs, namedCaptures);
          replacement = toString(apply(replaceValue, undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += stringSlice(S, nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }

      return accumulatedResult + stringSlice(S, nextSourcePosition);
    }
  ];
}, !REPLACE_SUPPORTS_NAMED_GROUPS || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);


/***/ }),

/***/ "../node_modules/core-js/modules/es.string.split.js":
/*!**********************************************************!*\
  !*** ../node_modules/core-js/modules/es.string.split.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var apply = __webpack_require__(/*! ../internals/function-apply */ "../node_modules/core-js/internals/function-apply.js");
var call = __webpack_require__(/*! ../internals/function-call */ "../node_modules/core-js/internals/function-call.js");
var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var fixRegExpWellKnownSymbolLogic = __webpack_require__(/*! ../internals/fix-regexp-well-known-symbol-logic */ "../node_modules/core-js/internals/fix-regexp-well-known-symbol-logic.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "../node_modules/core-js/internals/an-object.js");
var isNullOrUndefined = __webpack_require__(/*! ../internals/is-null-or-undefined */ "../node_modules/core-js/internals/is-null-or-undefined.js");
var isRegExp = __webpack_require__(/*! ../internals/is-regexp */ "../node_modules/core-js/internals/is-regexp.js");
var requireObjectCoercible = __webpack_require__(/*! ../internals/require-object-coercible */ "../node_modules/core-js/internals/require-object-coercible.js");
var speciesConstructor = __webpack_require__(/*! ../internals/species-constructor */ "../node_modules/core-js/internals/species-constructor.js");
var advanceStringIndex = __webpack_require__(/*! ../internals/advance-string-index */ "../node_modules/core-js/internals/advance-string-index.js");
var toLength = __webpack_require__(/*! ../internals/to-length */ "../node_modules/core-js/internals/to-length.js");
var toString = __webpack_require__(/*! ../internals/to-string */ "../node_modules/core-js/internals/to-string.js");
var getMethod = __webpack_require__(/*! ../internals/get-method */ "../node_modules/core-js/internals/get-method.js");
var arraySlice = __webpack_require__(/*! ../internals/array-slice-simple */ "../node_modules/core-js/internals/array-slice-simple.js");
var callRegExpExec = __webpack_require__(/*! ../internals/regexp-exec-abstract */ "../node_modules/core-js/internals/regexp-exec-abstract.js");
var regexpExec = __webpack_require__(/*! ../internals/regexp-exec */ "../node_modules/core-js/internals/regexp-exec.js");
var stickyHelpers = __webpack_require__(/*! ../internals/regexp-sticky-helpers */ "../node_modules/core-js/internals/regexp-sticky-helpers.js");
var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");

var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y;
var MAX_UINT32 = 0xFFFFFFFF;
var min = Math.min;
var $push = [].push;
var exec = uncurryThis(/./.exec);
var push = uncurryThis($push);
var stringSlice = uncurryThis(''.slice);

// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
// Weex JS has frozen built-in prototypes, so use try / catch wrapper
var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
  // eslint-disable-next-line regexp/no-empty-group -- required for testing
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
});

// @@split logic
fixRegExpWellKnownSymbolLogic('split', function (SPLIT, nativeSplit, maybeCallNative) {
  var internalSplit;
  if (
    'abbc'.split(/(b)*/)[1] === 'c' ||
    // eslint-disable-next-line regexp/no-empty-group -- required for testing
    'test'.split(/(?:)/, -1).length !== 4 ||
    'ab'.split(/(?:ab)*/).length !== 2 ||
    '.'.split(/(.?)(.?)/).length !== 4 ||
    // eslint-disable-next-line regexp/no-empty-capturing-group, regexp/no-empty-group -- required for testing
    '.'.split(/()()/).length > 1 ||
    ''.split(/.?/).length
  ) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function (separator, limit) {
      var string = toString(requireObjectCoercible(this));
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (separator === undefined) return [string];
      // If `separator` is not a regex, use native split
      if (!isRegExp(separator)) {
        return call(nativeSplit, string, separator, lim);
      }
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var match, lastIndex, lastLength;
      while (match = call(regexpExec, separatorCopy, string)) {
        lastIndex = separatorCopy.lastIndex;
        if (lastIndex > lastLastIndex) {
          push(output, stringSlice(string, lastLastIndex, match.index));
          if (match.length > 1 && match.index < string.length) apply($push, output, arraySlice(match, 1));
          lastLength = match[0].length;
          lastLastIndex = lastIndex;
          if (output.length >= lim) break;
        }
        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
      }
      if (lastLastIndex === string.length) {
        if (lastLength || !exec(separatorCopy, '')) push(output, '');
      } else push(output, stringSlice(string, lastLastIndex));
      return output.length > lim ? arraySlice(output, 0, lim) : output;
    };
  // Chakra, V8
  } else if ('0'.split(undefined, 0).length) {
    internalSplit = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : call(nativeSplit, this, separator, limit);
    };
  } else internalSplit = nativeSplit;

  return [
    // `String.prototype.split` method
    // https://tc39.es/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = requireObjectCoercible(this);
      var splitter = isNullOrUndefined(separator) ? undefined : getMethod(separator, SPLIT);
      return splitter
        ? call(splitter, separator, O, limit)
        : call(internalSplit, toString(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (string, limit) {
      var rx = anObject(this);
      var S = toString(string);
      var res = maybeCallNative(internalSplit, rx, S, limit, internalSplit !== nativeSplit);

      if (res.done) return res.value;

      var C = speciesConstructor(rx, RegExp);

      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') +
                  (rx.multiline ? 'm' : '') +
                  (rx.unicode ? 'u' : '') +
                  (UNSUPPORTED_Y ? 'g' : 'y');

      // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.
      var splitter = new C(UNSUPPORTED_Y ? '^(?:' + rx.source + ')' : rx, flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];
      while (q < S.length) {
        splitter.lastIndex = UNSUPPORTED_Y ? 0 : q;
        var z = callRegExpExec(splitter, UNSUPPORTED_Y ? stringSlice(S, q) : S);
        var e;
        if (
          z === null ||
          (e = min(toLength(splitter.lastIndex + (UNSUPPORTED_Y ? q : 0)), S.length)) === p
        ) {
          q = advanceStringIndex(S, q, unicodeMatching);
        } else {
          push(A, stringSlice(S, p, q));
          if (A.length === lim) return A;
          for (var i = 1; i <= z.length - 1; i++) {
            push(A, z[i]);
            if (A.length === lim) return A;
          }
          q = p = e;
        }
      }
      push(A, stringSlice(S, p));
      return A;
    }
  ];
}, !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC, UNSUPPORTED_Y);


/***/ }),

/***/ "../node_modules/core-js/modules/es.symbol.constructor.js":
/*!****************************************************************!*\
  !*** ../node_modules/core-js/modules/es.symbol.constructor.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "../node_modules/core-js/internals/export.js");
var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");
var call = __webpack_require__(/*! ../internals/function-call */ "../node_modules/core-js/internals/function-call.js");
var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var IS_PURE = __webpack_require__(/*! ../internals/is-pure */ "../node_modules/core-js/internals/is-pure.js");
var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "../node_modules/core-js/internals/descriptors.js");
var NATIVE_SYMBOL = __webpack_require__(/*! ../internals/symbol-constructor-detection */ "../node_modules/core-js/internals/symbol-constructor-detection.js");
var fails = __webpack_require__(/*! ../internals/fails */ "../node_modules/core-js/internals/fails.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "../node_modules/core-js/internals/has-own-property.js");
var isPrototypeOf = __webpack_require__(/*! ../internals/object-is-prototype-of */ "../node_modules/core-js/internals/object-is-prototype-of.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "../node_modules/core-js/internals/an-object.js");
var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "../node_modules/core-js/internals/to-indexed-object.js");
var toPropertyKey = __webpack_require__(/*! ../internals/to-property-key */ "../node_modules/core-js/internals/to-property-key.js");
var $toString = __webpack_require__(/*! ../internals/to-string */ "../node_modules/core-js/internals/to-string.js");
var createPropertyDescriptor = __webpack_require__(/*! ../internals/create-property-descriptor */ "../node_modules/core-js/internals/create-property-descriptor.js");
var nativeObjectCreate = __webpack_require__(/*! ../internals/object-create */ "../node_modules/core-js/internals/object-create.js");
var objectKeys = __webpack_require__(/*! ../internals/object-keys */ "../node_modules/core-js/internals/object-keys.js");
var getOwnPropertyNamesModule = __webpack_require__(/*! ../internals/object-get-own-property-names */ "../node_modules/core-js/internals/object-get-own-property-names.js");
var getOwnPropertyNamesExternal = __webpack_require__(/*! ../internals/object-get-own-property-names-external */ "../node_modules/core-js/internals/object-get-own-property-names-external.js");
var getOwnPropertySymbolsModule = __webpack_require__(/*! ../internals/object-get-own-property-symbols */ "../node_modules/core-js/internals/object-get-own-property-symbols.js");
var getOwnPropertyDescriptorModule = __webpack_require__(/*! ../internals/object-get-own-property-descriptor */ "../node_modules/core-js/internals/object-get-own-property-descriptor.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "../node_modules/core-js/internals/object-define-property.js");
var definePropertiesModule = __webpack_require__(/*! ../internals/object-define-properties */ "../node_modules/core-js/internals/object-define-properties.js");
var propertyIsEnumerableModule = __webpack_require__(/*! ../internals/object-property-is-enumerable */ "../node_modules/core-js/internals/object-property-is-enumerable.js");
var defineBuiltIn = __webpack_require__(/*! ../internals/define-built-in */ "../node_modules/core-js/internals/define-built-in.js");
var defineBuiltInAccessor = __webpack_require__(/*! ../internals/define-built-in-accessor */ "../node_modules/core-js/internals/define-built-in-accessor.js");
var shared = __webpack_require__(/*! ../internals/shared */ "../node_modules/core-js/internals/shared.js");
var sharedKey = __webpack_require__(/*! ../internals/shared-key */ "../node_modules/core-js/internals/shared-key.js");
var hiddenKeys = __webpack_require__(/*! ../internals/hidden-keys */ "../node_modules/core-js/internals/hidden-keys.js");
var uid = __webpack_require__(/*! ../internals/uid */ "../node_modules/core-js/internals/uid.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");
var wrappedWellKnownSymbolModule = __webpack_require__(/*! ../internals/well-known-symbol-wrapped */ "../node_modules/core-js/internals/well-known-symbol-wrapped.js");
var defineWellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol-define */ "../node_modules/core-js/internals/well-known-symbol-define.js");
var defineSymbolToPrimitive = __webpack_require__(/*! ../internals/symbol-define-to-primitive */ "../node_modules/core-js/internals/symbol-define-to-primitive.js");
var setToStringTag = __webpack_require__(/*! ../internals/set-to-string-tag */ "../node_modules/core-js/internals/set-to-string-tag.js");
var InternalStateModule = __webpack_require__(/*! ../internals/internal-state */ "../node_modules/core-js/internals/internal-state.js");
var $forEach = (__webpack_require__(/*! ../internals/array-iteration */ "../node_modules/core-js/internals/array-iteration.js").forEach);

var HIDDEN = sharedKey('hidden');
var SYMBOL = 'Symbol';
var PROTOTYPE = 'prototype';

var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(SYMBOL);

var ObjectPrototype = Object[PROTOTYPE];
var $Symbol = global.Symbol;
var SymbolPrototype = $Symbol && $Symbol[PROTOTYPE];
var RangeError = global.RangeError;
var TypeError = global.TypeError;
var QObject = global.QObject;
var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
var nativeDefineProperty = definePropertyModule.f;
var nativeGetOwnPropertyNames = getOwnPropertyNamesExternal.f;
var nativePropertyIsEnumerable = propertyIsEnumerableModule.f;
var push = uncurryThis([].push);

var AllSymbols = shared('symbols');
var ObjectPrototypeSymbols = shared('op-symbols');
var WellKnownSymbolsStore = shared('wks');

// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var USE_SETTER = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var fallbackDefineProperty = function (O, P, Attributes) {
  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor(ObjectPrototype, P);
  if (ObjectPrototypeDescriptor) delete ObjectPrototype[P];
  nativeDefineProperty(O, P, Attributes);
  if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
    nativeDefineProperty(ObjectPrototype, P, ObjectPrototypeDescriptor);
  }
};

var setSymbolDescriptor = DESCRIPTORS && fails(function () {
  return nativeObjectCreate(nativeDefineProperty({}, 'a', {
    get: function () { return nativeDefineProperty(this, 'a', { value: 7 }).a; }
  })).a !== 7;
}) ? fallbackDefineProperty : nativeDefineProperty;

var wrap = function (tag, description) {
  var symbol = AllSymbols[tag] = nativeObjectCreate(SymbolPrototype);
  setInternalState(symbol, {
    type: SYMBOL,
    tag: tag,
    description: description
  });
  if (!DESCRIPTORS) symbol.description = description;
  return symbol;
};

var $defineProperty = function defineProperty(O, P, Attributes) {
  if (O === ObjectPrototype) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
  anObject(O);
  var key = toPropertyKey(P);
  anObject(Attributes);
  if (hasOwn(AllSymbols, key)) {
    if (!Attributes.enumerable) {
      if (!hasOwn(O, HIDDEN)) nativeDefineProperty(O, HIDDEN, createPropertyDescriptor(1, {}));
      O[HIDDEN][key] = true;
    } else {
      if (hasOwn(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
      Attributes = nativeObjectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
    } return setSymbolDescriptor(O, key, Attributes);
  } return nativeDefineProperty(O, key, Attributes);
};

var $defineProperties = function defineProperties(O, Properties) {
  anObject(O);
  var properties = toIndexedObject(Properties);
  var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
  $forEach(keys, function (key) {
    if (!DESCRIPTORS || call($propertyIsEnumerable, properties, key)) $defineProperty(O, key, properties[key]);
  });
  return O;
};

var $create = function create(O, Properties) {
  return Properties === undefined ? nativeObjectCreate(O) : $defineProperties(nativeObjectCreate(O), Properties);
};

var $propertyIsEnumerable = function propertyIsEnumerable(V) {
  var P = toPropertyKey(V);
  var enumerable = call(nativePropertyIsEnumerable, this, P);
  if (this === ObjectPrototype && hasOwn(AllSymbols, P) && !hasOwn(ObjectPrototypeSymbols, P)) return false;
  return enumerable || !hasOwn(this, P) || !hasOwn(AllSymbols, P) || hasOwn(this, HIDDEN) && this[HIDDEN][P]
    ? enumerable : true;
};

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
  var it = toIndexedObject(O);
  var key = toPropertyKey(P);
  if (it === ObjectPrototype && hasOwn(AllSymbols, key) && !hasOwn(ObjectPrototypeSymbols, key)) return;
  var descriptor = nativeGetOwnPropertyDescriptor(it, key);
  if (descriptor && hasOwn(AllSymbols, key) && !(hasOwn(it, HIDDEN) && it[HIDDEN][key])) {
    descriptor.enumerable = true;
  }
  return descriptor;
};

var $getOwnPropertyNames = function getOwnPropertyNames(O) {
  var names = nativeGetOwnPropertyNames(toIndexedObject(O));
  var result = [];
  $forEach(names, function (key) {
    if (!hasOwn(AllSymbols, key) && !hasOwn(hiddenKeys, key)) push(result, key);
  });
  return result;
};

var $getOwnPropertySymbols = function (O) {
  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
  var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
  var result = [];
  $forEach(names, function (key) {
    if (hasOwn(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || hasOwn(ObjectPrototype, key))) {
      push(result, AllSymbols[key]);
    }
  });
  return result;
};

// `Symbol` constructor
// https://tc39.es/ecma262/#sec-symbol-constructor
if (!NATIVE_SYMBOL) {
  $Symbol = function Symbol() {
    if (isPrototypeOf(SymbolPrototype, this)) throw new TypeError('Symbol is not a constructor');
    var description = !arguments.length || arguments[0] === undefined ? undefined : $toString(arguments[0]);
    var tag = uid(description);
    var setter = function (value) {
      var $this = this === undefined ? global : this;
      if ($this === ObjectPrototype) call(setter, ObjectPrototypeSymbols, value);
      if (hasOwn($this, HIDDEN) && hasOwn($this[HIDDEN], tag)) $this[HIDDEN][tag] = false;
      var descriptor = createPropertyDescriptor(1, value);
      try {
        setSymbolDescriptor($this, tag, descriptor);
      } catch (error) {
        if (!(error instanceof RangeError)) throw error;
        fallbackDefineProperty($this, tag, descriptor);
      }
    };
    if (DESCRIPTORS && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, { configurable: true, set: setter });
    return wrap(tag, description);
  };

  SymbolPrototype = $Symbol[PROTOTYPE];

  defineBuiltIn(SymbolPrototype, 'toString', function toString() {
    return getInternalState(this).tag;
  });

  defineBuiltIn($Symbol, 'withoutSetter', function (description) {
    return wrap(uid(description), description);
  });

  propertyIsEnumerableModule.f = $propertyIsEnumerable;
  definePropertyModule.f = $defineProperty;
  definePropertiesModule.f = $defineProperties;
  getOwnPropertyDescriptorModule.f = $getOwnPropertyDescriptor;
  getOwnPropertyNamesModule.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
  getOwnPropertySymbolsModule.f = $getOwnPropertySymbols;

  wrappedWellKnownSymbolModule.f = function (name) {
    return wrap(wellKnownSymbol(name), name);
  };

  if (DESCRIPTORS) {
    // https://github.com/tc39/proposal-Symbol-description
    defineBuiltInAccessor(SymbolPrototype, 'description', {
      configurable: true,
      get: function description() {
        return getInternalState(this).description;
      }
    });
    if (!IS_PURE) {
      defineBuiltIn(ObjectPrototype, 'propertyIsEnumerable', $propertyIsEnumerable, { unsafe: true });
    }
  }
}

$({ global: true, constructor: true, wrap: true, forced: !NATIVE_SYMBOL, sham: !NATIVE_SYMBOL }, {
  Symbol: $Symbol
});

$forEach(objectKeys(WellKnownSymbolsStore), function (name) {
  defineWellKnownSymbol(name);
});

$({ target: SYMBOL, stat: true, forced: !NATIVE_SYMBOL }, {
  useSetter: function () { USE_SETTER = true; },
  useSimple: function () { USE_SETTER = false; }
});

$({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL, sham: !DESCRIPTORS }, {
  // `Object.create` method
  // https://tc39.es/ecma262/#sec-object.create
  create: $create,
  // `Object.defineProperty` method
  // https://tc39.es/ecma262/#sec-object.defineproperty
  defineProperty: $defineProperty,
  // `Object.defineProperties` method
  // https://tc39.es/ecma262/#sec-object.defineproperties
  defineProperties: $defineProperties,
  // `Object.getOwnPropertyDescriptor` method
  // https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor
});

$({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL }, {
  // `Object.getOwnPropertyNames` method
  // https://tc39.es/ecma262/#sec-object.getownpropertynames
  getOwnPropertyNames: $getOwnPropertyNames
});

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
defineSymbolToPrimitive();

// `Symbol.prototype[@@toStringTag]` property
// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag($Symbol, SYMBOL);

hiddenKeys[HIDDEN] = true;


/***/ }),

/***/ "../node_modules/core-js/modules/es.symbol.description.js":
/*!****************************************************************!*\
  !*** ../node_modules/core-js/modules/es.symbol.description.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// `Symbol.prototype.description` getter
// https://tc39.es/ecma262/#sec-symbol.prototype.description

var $ = __webpack_require__(/*! ../internals/export */ "../node_modules/core-js/internals/export.js");
var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "../node_modules/core-js/internals/descriptors.js");
var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");
var uncurryThis = __webpack_require__(/*! ../internals/function-uncurry-this */ "../node_modules/core-js/internals/function-uncurry-this.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "../node_modules/core-js/internals/has-own-property.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "../node_modules/core-js/internals/is-callable.js");
var isPrototypeOf = __webpack_require__(/*! ../internals/object-is-prototype-of */ "../node_modules/core-js/internals/object-is-prototype-of.js");
var toString = __webpack_require__(/*! ../internals/to-string */ "../node_modules/core-js/internals/to-string.js");
var defineBuiltInAccessor = __webpack_require__(/*! ../internals/define-built-in-accessor */ "../node_modules/core-js/internals/define-built-in-accessor.js");
var copyConstructorProperties = __webpack_require__(/*! ../internals/copy-constructor-properties */ "../node_modules/core-js/internals/copy-constructor-properties.js");

var NativeSymbol = global.Symbol;
var SymbolPrototype = NativeSymbol && NativeSymbol.prototype;

if (DESCRIPTORS && isCallable(NativeSymbol) && (!('description' in SymbolPrototype) ||
  // Safari 12 bug
  NativeSymbol().description !== undefined
)) {
  var EmptyStringDescriptionStore = {};
  // wrap Symbol constructor for correct work with undefined description
  var SymbolWrapper = function Symbol() {
    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : toString(arguments[0]);
    var result = isPrototypeOf(SymbolPrototype, this)
      ? new NativeSymbol(description)
      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
      : description === undefined ? NativeSymbol() : NativeSymbol(description);
    if (description === '') EmptyStringDescriptionStore[result] = true;
    return result;
  };

  copyConstructorProperties(SymbolWrapper, NativeSymbol);
  SymbolWrapper.prototype = SymbolPrototype;
  SymbolPrototype.constructor = SymbolWrapper;

  var NATIVE_SYMBOL = String(NativeSymbol('description detection')) === 'Symbol(description detection)';
  var thisSymbolValue = uncurryThis(SymbolPrototype.valueOf);
  var symbolDescriptiveString = uncurryThis(SymbolPrototype.toString);
  var regexp = /^Symbol\((.*)\)[^)]+$/;
  var replace = uncurryThis(''.replace);
  var stringSlice = uncurryThis(''.slice);

  defineBuiltInAccessor(SymbolPrototype, 'description', {
    configurable: true,
    get: function description() {
      var symbol = thisSymbolValue(this);
      if (hasOwn(EmptyStringDescriptionStore, symbol)) return '';
      var string = symbolDescriptiveString(symbol);
      var desc = NATIVE_SYMBOL ? stringSlice(string, 7, -1) : replace(string, regexp, '$1');
      return desc === '' ? undefined : desc;
    }
  });

  $({ global: true, constructor: true, forced: true }, {
    Symbol: SymbolWrapper
  });
}


/***/ }),

/***/ "../node_modules/core-js/modules/es.symbol.for.js":
/*!********************************************************!*\
  !*** ../node_modules/core-js/modules/es.symbol.for.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "../node_modules/core-js/internals/export.js");
var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "../node_modules/core-js/internals/get-built-in.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "../node_modules/core-js/internals/has-own-property.js");
var toString = __webpack_require__(/*! ../internals/to-string */ "../node_modules/core-js/internals/to-string.js");
var shared = __webpack_require__(/*! ../internals/shared */ "../node_modules/core-js/internals/shared.js");
var NATIVE_SYMBOL_REGISTRY = __webpack_require__(/*! ../internals/symbol-registry-detection */ "../node_modules/core-js/internals/symbol-registry-detection.js");

var StringToSymbolRegistry = shared('string-to-symbol-registry');
var SymbolToStringRegistry = shared('symbol-to-string-registry');

// `Symbol.for` method
// https://tc39.es/ecma262/#sec-symbol.for
$({ target: 'Symbol', stat: true, forced: !NATIVE_SYMBOL_REGISTRY }, {
  'for': function (key) {
    var string = toString(key);
    if (hasOwn(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
    var symbol = getBuiltIn('Symbol')(string);
    StringToSymbolRegistry[string] = symbol;
    SymbolToStringRegistry[symbol] = string;
    return symbol;
  }
});


/***/ }),

/***/ "../node_modules/core-js/modules/es.symbol.iterator.js":
/*!*************************************************************!*\
  !*** ../node_modules/core-js/modules/es.symbol.iterator.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var defineWellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol-define */ "../node_modules/core-js/internals/well-known-symbol-define.js");

// `Symbol.iterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.iterator
defineWellKnownSymbol('iterator');


/***/ }),

/***/ "../node_modules/core-js/modules/es.symbol.js":
/*!****************************************************!*\
  !*** ../node_modules/core-js/modules/es.symbol.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

// TODO: Remove this module from `core-js@4` since it's split to modules listed below
__webpack_require__(/*! ../modules/es.symbol.constructor */ "../node_modules/core-js/modules/es.symbol.constructor.js");
__webpack_require__(/*! ../modules/es.symbol.for */ "../node_modules/core-js/modules/es.symbol.for.js");
__webpack_require__(/*! ../modules/es.symbol.key-for */ "../node_modules/core-js/modules/es.symbol.key-for.js");
__webpack_require__(/*! ../modules/es.json.stringify */ "../node_modules/core-js/modules/es.json.stringify.js");
__webpack_require__(/*! ../modules/es.object.get-own-property-symbols */ "../node_modules/core-js/modules/es.object.get-own-property-symbols.js");


/***/ }),

/***/ "../node_modules/core-js/modules/es.symbol.key-for.js":
/*!************************************************************!*\
  !*** ../node_modules/core-js/modules/es.symbol.key-for.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "../node_modules/core-js/internals/export.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "../node_modules/core-js/internals/has-own-property.js");
var isSymbol = __webpack_require__(/*! ../internals/is-symbol */ "../node_modules/core-js/internals/is-symbol.js");
var tryToString = __webpack_require__(/*! ../internals/try-to-string */ "../node_modules/core-js/internals/try-to-string.js");
var shared = __webpack_require__(/*! ../internals/shared */ "../node_modules/core-js/internals/shared.js");
var NATIVE_SYMBOL_REGISTRY = __webpack_require__(/*! ../internals/symbol-registry-detection */ "../node_modules/core-js/internals/symbol-registry-detection.js");

var SymbolToStringRegistry = shared('symbol-to-string-registry');

// `Symbol.keyFor` method
// https://tc39.es/ecma262/#sec-symbol.keyfor
$({ target: 'Symbol', stat: true, forced: !NATIVE_SYMBOL_REGISTRY }, {
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw new TypeError(tryToString(sym) + ' is not a symbol');
    if (hasOwn(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
  }
});


/***/ }),

/***/ "../node_modules/core-js/modules/es.symbol.to-primitive.js":
/*!*****************************************************************!*\
  !*** ../node_modules/core-js/modules/es.symbol.to-primitive.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var defineWellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol-define */ "../node_modules/core-js/internals/well-known-symbol-define.js");
var defineSymbolToPrimitive = __webpack_require__(/*! ../internals/symbol-define-to-primitive */ "../node_modules/core-js/internals/symbol-define-to-primitive.js");

// `Symbol.toPrimitive` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.toprimitive
defineWellKnownSymbol('toPrimitive');

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
defineSymbolToPrimitive();


/***/ }),

/***/ "../node_modules/core-js/modules/web.dom-collections.iterator.js":
/*!***********************************************************************!*\
  !*** ../node_modules/core-js/modules/web.dom-collections.iterator.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var global = __webpack_require__(/*! ../internals/global */ "../node_modules/core-js/internals/global.js");
var DOMIterables = __webpack_require__(/*! ../internals/dom-iterables */ "../node_modules/core-js/internals/dom-iterables.js");
var DOMTokenListPrototype = __webpack_require__(/*! ../internals/dom-token-list-prototype */ "../node_modules/core-js/internals/dom-token-list-prototype.js");
var ArrayIteratorMethods = __webpack_require__(/*! ../modules/es.array.iterator */ "../node_modules/core-js/modules/es.array.iterator.js");
var createNonEnumerableProperty = __webpack_require__(/*! ../internals/create-non-enumerable-property */ "../node_modules/core-js/internals/create-non-enumerable-property.js");
var setToStringTag = __webpack_require__(/*! ../internals/set-to-string-tag */ "../node_modules/core-js/internals/set-to-string-tag.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "../node_modules/core-js/internals/well-known-symbol.js");

var ITERATOR = wellKnownSymbol('iterator');
var ArrayValues = ArrayIteratorMethods.values;

var handlePrototype = function (CollectionPrototype, COLLECTION_NAME) {
  if (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype[ITERATOR] !== ArrayValues) try {
      createNonEnumerableProperty(CollectionPrototype, ITERATOR, ArrayValues);
    } catch (error) {
      CollectionPrototype[ITERATOR] = ArrayValues;
    }
    setToStringTag(CollectionPrototype, COLLECTION_NAME, true);
    if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
        createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
      } catch (error) {
        CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
      }
    }
  }
};

for (var COLLECTION_NAME in DOMIterables) {
  handlePrototype(global[COLLECTION_NAME] && global[COLLECTION_NAME].prototype, COLLECTION_NAME);
}

handlePrototype(DOMTokenListPrototype, 'DOMTokenList');


/***/ }),

/***/ "../node_modules/@nextcloud/auth/dist/index.es.mjs":
/*!*********************************************************!*\
  !*** ../node_modules/@nextcloud/auth/dist/index.es.mjs ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getCurrentUser: () => (/* binding */ getCurrentUser),
/* harmony export */   getRequestToken: () => (/* binding */ getRequestToken),
/* harmony export */   onRequestTokenUpdate: () => (/* binding */ onRequestTokenUpdate)
/* harmony export */ });
/* harmony import */ var _nextcloud_event_bus__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @nextcloud/event-bus */ "../node_modules/@nextcloud/event-bus/dist/index.mjs");


let token = undefined;
const observers = [];
/**
 * Get current request token
 *
 * @return {string|null} Current request token or null if not set
 */
function getRequestToken() {
    if (token === undefined) {
        // Only on first load, try to get token from document
        const tokenElement = document?.getElementsByTagName('head')[0];
        token = tokenElement ? tokenElement.getAttribute('data-requesttoken') : null;
    }
    return token;
}
/**
 * Add an observer which is called when the CSRF token changes
 *
 * @param observer The observer
 */
function onRequestTokenUpdate(observer) {
    observers.push(observer);
}
// Listen to server event and keep token in sync
(0,_nextcloud_event_bus__WEBPACK_IMPORTED_MODULE_0__.subscribe)('csrf-token-update', e => {
    token = e.token;
    observers.forEach(observer => {
        try {
            observer(e.token);
        }
        catch (e) {
            console.error('error updating CSRF token observer', e);
        }
    });
});

const getAttribute = (el, attribute) => {
    if (el) {
        return el.getAttribute(attribute);
    }
    return null;
};
let currentUser = undefined;
function getCurrentUser() {
    if (currentUser !== undefined) {
        return currentUser;
    }
    const head = document?.getElementsByTagName('head')[0];
    if (!head) {
        return null;
    }
    // No user logged in so cache and return null
    const uid = getAttribute(head, 'data-user');
    if (uid === null) {
        currentUser = null;
        return currentUser;
    }
    currentUser = {
        uid,
        displayName: getAttribute(head, 'data-user-displayname'),
        isAdmin: !!window._oc_isadmin,
    };
    return currentUser;
}


//# sourceMappingURL=index.es.mjs.map


/***/ }),

/***/ "../node_modules/@nextcloud/event-bus/dist/index.mjs":
/*!***********************************************************!*\
  !*** ../node_modules/@nextcloud/event-bus/dist/index.mjs ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ProxyBus: () => (/* binding */ ProxyBus),
/* harmony export */   SimpleBus: () => (/* binding */ SimpleBus),
/* harmony export */   emit: () => (/* binding */ emit),
/* harmony export */   subscribe: () => (/* binding */ subscribe),
/* harmony export */   unsubscribe: () => (/* binding */ unsubscribe)
/* harmony export */ });
/* harmony import */ var semver_functions_valid_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! semver/functions/valid.js */ "../node_modules/@nextcloud/event-bus/node_modules/semver/functions/valid.js");
/* harmony import */ var semver_functions_major_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! semver/functions/major.js */ "../node_modules/@nextcloud/event-bus/node_modules/semver/functions/major.js");



class ProxyBus {
    bus;
    constructor(bus) {
        if (typeof bus.getVersion !== 'function' || !semver_functions_valid_js__WEBPACK_IMPORTED_MODULE_0__(bus.getVersion())) {
            console.warn('Proxying an event bus with an unknown or invalid version');
        }
        else if (semver_functions_major_js__WEBPACK_IMPORTED_MODULE_1__(bus.getVersion()) !== semver_functions_major_js__WEBPACK_IMPORTED_MODULE_1__(this.getVersion())) {
            console.warn('Proxying an event bus of version ' + bus.getVersion() + ' with ' + this.getVersion());
        }
        this.bus = bus;
    }
    getVersion() {
        return "3.1.0";
    }
    subscribe(name, handler) {
        this.bus.subscribe(name, handler);
    }
    unsubscribe(name, handler) {
        this.bus.unsubscribe(name, handler);
    }
    emit(name, event) {
        this.bus.emit(name, event);
    }
}

class SimpleBus {
    handlers = new Map();
    getVersion() {
        return "3.1.0";
    }
    subscribe(name, handler) {
        this.handlers.set(name, (this.handlers.get(name) || []).concat(handler));
    }
    unsubscribe(name, handler) {
        this.handlers.set(name, (this.handlers.get(name) || []).filter(h => h != handler));
    }
    emit(name, event) {
        (this.handlers.get(name) || []).forEach(h => {
            try {
                h(event);
            }
            catch (e) {
                console.error('could not invoke event listener', e);
            }
        });
    }
}

let bus = null;
function getBus() {
    if (bus !== null) {
        return bus;
    }
    if (typeof window === 'undefined') {
        // testing or SSR
        return new Proxy({}, {
            get: () => {
                return () => console.error('Window not available, EventBus can not be established!');
            }
        });
    }
    if (typeof window.OC !== 'undefined' && window.OC._eventBus && typeof window._nc_event_bus === 'undefined') {
        console.warn('found old event bus instance at OC._eventBus. Update your version!');
        window._nc_event_bus = window.OC._eventBus;
    }
    // Either use an existing event bus instance or create one
    if (typeof window?._nc_event_bus !== 'undefined') {
        bus = new ProxyBus(window._nc_event_bus);
    }
    else {
        bus = window._nc_event_bus = new SimpleBus();
    }
    return bus;
}
/**
 * Register an event listener
 *
 * @param name name of the event
 * @param handler callback invoked for every matching event emitted on the bus
 */
function subscribe(name, handler) {
    getBus().subscribe(name, handler);
}
/**
 * Unregister a previously registered event listener
 *
 * Note: doesn't work with anonymous functions (closures). Use method of an object or store listener function in variable.
 *
 * @param name name of the event
 * @param handler callback passed to `subscribed`
 */
function unsubscribe(name, handler) {
    getBus().unsubscribe(name, handler);
}
/**
 * Emit an event
 *
 * @param name name of the event
 * @param event event payload
 */
function emit(name, event) {
    getBus().emit(name, event);
}


//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "../node_modules/@nextcloud/files/dist/index.mjs":
/*!*******************************************************!*\
  !*** ../node_modules/@nextcloud/files/dist/index.mjs ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Column: () => (/* binding */ Ie),
/* harmony export */   DefaultType: () => (/* binding */ Z),
/* harmony export */   File: () => (/* binding */ ye),
/* harmony export */   FileAction: () => (/* binding */ Qt),
/* harmony export */   FileType: () => (/* binding */ R),
/* harmony export */   Folder: () => (/* binding */ _e),
/* harmony export */   Header: () => (/* binding */ tr),
/* harmony export */   Navigation: () => (/* binding */ Te),
/* harmony export */   Node: () => (/* binding */ D),
/* harmony export */   NodeStatus: () => (/* binding */ Q),
/* harmony export */   Permission: () => (/* binding */ N),
/* harmony export */   View: () => (/* binding */ cr),
/* harmony export */   addNewFileMenuEntry: () => (/* binding */ hr),
/* harmony export */   davGetClient: () => (/* binding */ ur),
/* harmony export */   davGetDefaultPropfind: () => (/* binding */ sr),
/* harmony export */   davGetFavoritesReport: () => (/* binding */ Ee),
/* harmony export */   davGetRecentSearch: () => (/* binding */ or),
/* harmony export */   davParsePermissions: () => (/* binding */ be),
/* harmony export */   davRemoteURL: () => (/* binding */ te),
/* harmony export */   davResultToNode: () => (/* binding */ ve),
/* harmony export */   davRootPath: () => (/* binding */ ee),
/* harmony export */   defaultDavNamespaces: () => (/* binding */ Y),
/* harmony export */   defaultDavProperties: () => (/* binding */ j),
/* harmony export */   formatFileSize: () => (/* binding */ Yt),
/* harmony export */   getDavNameSpaces: () => (/* binding */ L),
/* harmony export */   getDavProperties: () => (/* binding */ V),
/* harmony export */   getFavoriteNodes: () => (/* binding */ dr),
/* harmony export */   getFileActions: () => (/* binding */ er),
/* harmony export */   getFileListHeaders: () => (/* binding */ nr),
/* harmony export */   getNavigation: () => (/* binding */ ar),
/* harmony export */   getNewFileMenuEntries: () => (/* binding */ gr),
/* harmony export */   parseFileSize: () => (/* binding */ Jt),
/* harmony export */   registerDavProperty: () => (/* binding */ ir),
/* harmony export */   registerFileAction: () => (/* binding */ Dt),
/* harmony export */   registerFileListHeaders: () => (/* binding */ rr),
/* harmony export */   removeNewFileMenuEntry: () => (/* binding */ pr)
/* harmony export */ });
/* harmony import */ var _nextcloud_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @nextcloud/auth */ "../node_modules/@nextcloud/auth/dist/index.es.mjs");
/* harmony import */ var _nextcloud_logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @nextcloud/logger */ "../node_modules/@nextcloud/logger/dist/index.js");
/* harmony import */ var _nextcloud_l10n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @nextcloud/l10n */ "../node_modules/@nextcloud/l10n/dist/index.mjs");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! path */ "../../../node_modules/path/path.js");
/* harmony import */ var _nextcloud_paths__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @nextcloud/paths */ "../node_modules/@nextcloud/paths/dist/index.js");
/* harmony import */ var _nextcloud_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @nextcloud/router */ "../node_modules/@nextcloud/router/dist/index.js");
/* harmony import */ var webdav__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! webdav */ "../node_modules/webdav/dist/web/index.js");







/**
 * @copyright 2019 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
const me = (e) => e === null ? (0,_nextcloud_logger__WEBPACK_IMPORTED_MODULE_1__.getLoggerBuilder)().setApp("files").build() : (0,_nextcloud_logger__WEBPACK_IMPORTED_MODULE_1__.getLoggerBuilder)().setApp("files").setUid(e.uid).build(), m = me((0,_nextcloud_auth__WEBPACK_IMPORTED_MODULE_0__.getCurrentUser)());
/**
 * @copyright Copyright (c) 2021 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
class Ne {
  _entries = [];
  registerEntry(t) {
    this.validateEntry(t), this._entries.push(t);
  }
  unregisterEntry(t) {
    const r = typeof t == "string" ? this.getEntryIndex(t) : this.getEntryIndex(t.id);
    if (r === -1) {
      m.warn("Entry not found, nothing removed", { entry: t, entries: this.getEntries() });
      return;
    }
    this._entries.splice(r, 1);
  }
  /**
   * Get the list of registered entries
   *
   * @param {Folder} context the creation context. Usually the current folder
   */
  getEntries(t) {
    return t ? this._entries.filter((r) => typeof r.enabled == "function" ? r.enabled(t) : !0) : this._entries;
  }
  getEntryIndex(t) {
    return this._entries.findIndex((r) => r.id === t);
  }
  validateEntry(t) {
    if (!t.id || !t.displayName || !(t.iconSvgInline || t.iconClass) || !t.handler)
      throw new Error("Invalid entry");
    if (typeof t.id != "string" || typeof t.displayName != "string")
      throw new Error("Invalid id or displayName property");
    if (t.iconClass && typeof t.iconClass != "string" || t.iconSvgInline && typeof t.iconSvgInline != "string")
      throw new Error("Invalid icon provided");
    if (t.enabled !== void 0 && typeof t.enabled != "function")
      throw new Error("Invalid enabled property");
    if (typeof t.handler != "function")
      throw new Error("Invalid handler property");
    if ("order" in t && typeof t.order != "number")
      throw new Error("Invalid order property");
    if (this.getEntryIndex(t.id) !== -1)
      throw new Error("Duplicate entry");
  }
}
const F = function() {
  return typeof window._nc_newfilemenu > "u" && (window._nc_newfilemenu = new Ne(), m.debug("NewFileMenu initialized")), window._nc_newfilemenu;
};
/**
 * @copyright 2019 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author Christoph Wurst <christoph@winzerhof-wurst.at>
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
const C = ["B", "KB", "MB", "GB", "TB", "PB"], P = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
function Yt(e, t = !1, r = !1, s = !1) {
  r = r && !s, typeof e == "string" && (e = Number(e));
  let n = e > 0 ? Math.floor(Math.log(e) / Math.log(s ? 1e3 : 1024)) : 0;
  n = Math.min((r ? P.length : C.length) - 1, n);
  const i = r ? P[n] : C[n];
  let d = (e / Math.pow(s ? 1e3 : 1024, n)).toFixed(1);
  return t === !0 && n === 0 ? (d !== "0.0" ? "< 1 " : "0 ") + (r ? P[1] : C[1]) : (n < 2 ? d = parseFloat(d).toFixed(0) : d = parseFloat(d).toLocaleString((0,_nextcloud_l10n__WEBPACK_IMPORTED_MODULE_2__.getCanonicalLocale)()), d + " " + i);
}
function Jt(e, t = !1) {
  try {
    e = `${e}`.toLocaleLowerCase().replaceAll(/\s+/g, "").replaceAll(",", ".");
  } catch {
    return null;
  }
  const r = e.match(/^([0-9]*(\.[0-9]*)?)([kmgtp]?)(i?)b?$/);
  if (r === null || r[1] === "." || r[1] === "")
    return null;
  const s = {
    "": 0,
    k: 1,
    m: 2,
    g: 3,
    t: 4,
    p: 5,
    e: 6
  }, n = `${r[1]}`, i = r[4] === "i" || t ? 1024 : 1e3;
  return Math.round(Number.parseFloat(n) * i ** s[r[3]]);
}
/**
 * @copyright Copyright (c) 2023 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
var Z = /* @__PURE__ */ ((e) => (e.DEFAULT = "default", e.HIDDEN = "hidden", e))(Z || {});
class Qt {
  _action;
  constructor(t) {
    this.validateAction(t), this._action = t;
  }
  get id() {
    return this._action.id;
  }
  get displayName() {
    return this._action.displayName;
  }
  get title() {
    return this._action.title;
  }
  get iconSvgInline() {
    return this._action.iconSvgInline;
  }
  get enabled() {
    return this._action.enabled;
  }
  get exec() {
    return this._action.exec;
  }
  get execBatch() {
    return this._action.execBatch;
  }
  get order() {
    return this._action.order;
  }
  get parent() {
    return this._action.parent;
  }
  get default() {
    return this._action.default;
  }
  get inline() {
    return this._action.inline;
  }
  get renderInline() {
    return this._action.renderInline;
  }
  validateAction(t) {
    if (!t.id || typeof t.id != "string")
      throw new Error("Invalid id");
    if (!t.displayName || typeof t.displayName != "function")
      throw new Error("Invalid displayName function");
    if ("title" in t && typeof t.title != "function")
      throw new Error("Invalid title function");
    if (!t.iconSvgInline || typeof t.iconSvgInline != "function")
      throw new Error("Invalid iconSvgInline function");
    if (!t.exec || typeof t.exec != "function")
      throw new Error("Invalid exec function");
    if ("enabled" in t && typeof t.enabled != "function")
      throw new Error("Invalid enabled function");
    if ("execBatch" in t && typeof t.execBatch != "function")
      throw new Error("Invalid execBatch function");
    if ("order" in t && typeof t.order != "number")
      throw new Error("Invalid order");
    if ("parent" in t && typeof t.parent != "string")
      throw new Error("Invalid parent");
    if (t.default && !Object.values(Z).includes(t.default))
      throw new Error("Invalid default");
    if ("inline" in t && typeof t.inline != "function")
      throw new Error("Invalid inline function");
    if ("renderInline" in t && typeof t.renderInline != "function")
      throw new Error("Invalid renderInline function");
  }
}
const Dt = function(e) {
  if (typeof window._nc_fileactions > "u" && (window._nc_fileactions = [], m.debug("FileActions initialized")), window._nc_fileactions.find((t) => t.id === e.id)) {
    m.error(`FileAction ${e.id} already registered`, { action: e });
    return;
  }
  window._nc_fileactions.push(e);
}, er = function() {
  return typeof window._nc_fileactions > "u" && (window._nc_fileactions = [], m.debug("FileActions initialized")), window._nc_fileactions;
};
/**
 * @copyright Copyright (c) 2023 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
class tr {
  _header;
  constructor(t) {
    this.validateHeader(t), this._header = t;
  }
  get id() {
    return this._header.id;
  }
  get order() {
    return this._header.order;
  }
  get enabled() {
    return this._header.enabled;
  }
  get render() {
    return this._header.render;
  }
  get updated() {
    return this._header.updated;
  }
  validateHeader(t) {
    if (!t.id || !t.render || !t.updated)
      throw new Error("Invalid header: id, render and updated are required");
    if (typeof t.id != "string")
      throw new Error("Invalid id property");
    if (t.enabled !== void 0 && typeof t.enabled != "function")
      throw new Error("Invalid enabled property");
    if (t.render && typeof t.render != "function")
      throw new Error("Invalid render property");
    if (t.updated && typeof t.updated != "function")
      throw new Error("Invalid updated property");
  }
}
const rr = function(e) {
  if (typeof window._nc_filelistheader > "u" && (window._nc_filelistheader = [], m.debug("FileListHeaders initialized")), window._nc_filelistheader.find((t) => t.id === e.id)) {
    m.error(`Header ${e.id} already registered`, { header: e });
    return;
  }
  window._nc_filelistheader.push(e);
}, nr = function() {
  return typeof window._nc_filelistheader > "u" && (window._nc_filelistheader = [], m.debug("FileListHeaders initialized")), window._nc_filelistheader;
};
/**
 * @copyright Copyright (c) 2022 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
var N = /* @__PURE__ */ ((e) => (e[e.NONE = 0] = "NONE", e[e.CREATE = 4] = "CREATE", e[e.READ = 1] = "READ", e[e.UPDATE = 2] = "UPDATE", e[e.DELETE = 8] = "DELETE", e[e.SHARE = 16] = "SHARE", e[e.ALL = 31] = "ALL", e))(N || {});
/**
 * @copyright Copyright (c) 2023 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 * @author Ferdinand Thiessen <opensource@fthiessen.de>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
const j = [
  "d:getcontentlength",
  "d:getcontenttype",
  "d:getetag",
  "d:getlastmodified",
  "d:quota-available-bytes",
  "d:resourcetype",
  "nc:has-preview",
  "nc:is-encrypted",
  "nc:mount-type",
  "nc:share-attributes",
  "oc:comments-unread",
  "oc:favorite",
  "oc:fileid",
  "oc:owner-display-name",
  "oc:owner-id",
  "oc:permissions",
  "oc:share-types",
  "oc:size",
  "ocs:share-permissions"
], Y = {
  d: "DAV:",
  nc: "http://nextcloud.org/ns",
  oc: "http://owncloud.org/ns",
  ocs: "http://open-collaboration-services.org/ns"
}, ir = function(e, t = { nc: "http://nextcloud.org/ns" }) {
  typeof window._nc_dav_properties > "u" && (window._nc_dav_properties = [...j], window._nc_dav_namespaces = { ...Y });
  const r = { ...window._nc_dav_namespaces, ...t };
  if (window._nc_dav_properties.find((n) => n === e))
    return m.error(`${e} already registered`, { prop: e }), !1;
  if (e.startsWith("<") || e.split(":").length !== 2)
    return m.error(`${e} is not valid. See example: 'oc:fileid'`, { prop: e }), !1;
  const s = e.split(":")[0];
  return r[s] ? (window._nc_dav_properties.push(e), window._nc_dav_namespaces = r, !0) : (m.error(`${e} namespace unknown`, { prop: e, namespaces: r }), !1);
}, V = function() {
  return typeof window._nc_dav_properties > "u" && (window._nc_dav_properties = [...j]), window._nc_dav_properties.map((e) => `<${e} />`).join(" ");
}, L = function() {
  return typeof window._nc_dav_namespaces > "u" && (window._nc_dav_namespaces = { ...Y }), Object.keys(window._nc_dav_namespaces).map((e) => `xmlns:${e}="${window._nc_dav_namespaces?.[e]}"`).join(" ");
}, sr = function() {
  return `<?xml version="1.0"?>
		<d:propfind ${L()}>
			<d:prop>
				${V()}
			</d:prop>
		</d:propfind>`;
}, Ee = function() {
  return `<?xml version="1.0"?>
		<oc:filter-files ${L()}>
			<d:prop>
				${V()}
			</d:prop>
			<oc:filter-rules>
				<oc:favorite>1</oc:favorite>
			</oc:filter-rules>
		</oc:filter-files>`;
}, or = function(e) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<d:searchrequest ${L()}
	xmlns:ns="https://github.com/icewind1991/SearchDAV/ns">
	<d:basicsearch>
		<d:select>
			<d:prop>
				${V()}
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
					<d:literal>${e}</d:literal>
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
};
/**
 * @copyright Copyright (c) 2023 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 * @author Ferdinand Thiessen <opensource@fthiessen.de>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
const be = function(e = "") {
  let t = N.NONE;
  return e && ((e.includes("C") || e.includes("K")) && (t |= N.CREATE), e.includes("G") && (t |= N.READ), (e.includes("W") || e.includes("N") || e.includes("V")) && (t |= N.UPDATE), e.includes("D") && (t |= N.DELETE), e.includes("R") && (t |= N.SHARE)), t;
};
/**
 * @copyright Copyright (c) 2022 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
var R = /* @__PURE__ */ ((e) => (e.Folder = "folder", e.File = "file", e))(R || {});
/**
 * @copyright Copyright (c) 2022 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
const J = function(e, t) {
  return e.match(t) !== null;
}, X = (e, t) => {
  if (e.id && typeof e.id != "number")
    throw new Error("Invalid id type of value");
  if (!e.source)
    throw new Error("Missing mandatory source");
  try {
    new URL(e.source);
  } catch {
    throw new Error("Invalid source format, source must be a valid URL");
  }
  if (!e.source.startsWith("http"))
    throw new Error("Invalid source format, only http(s) is supported");
  if (e.mtime && !(e.mtime instanceof Date))
    throw new Error("Invalid mtime type");
  if (e.crtime && !(e.crtime instanceof Date))
    throw new Error("Invalid crtime type");
  if (!e.mime || typeof e.mime != "string" || !e.mime.match(/^[-\w.]+\/[-+\w.]+$/gi))
    throw new Error("Missing or invalid mandatory mime");
  if ("size" in e && typeof e.size != "number" && e.size !== void 0)
    throw new Error("Invalid size type");
  if ("permissions" in e && e.permissions !== void 0 && !(typeof e.permissions == "number" && e.permissions >= N.NONE && e.permissions <= N.ALL))
    throw new Error("Invalid permissions");
  if (e.owner && e.owner !== null && typeof e.owner != "string")
    throw new Error("Invalid owner type");
  if (e.attributes && typeof e.attributes != "object")
    throw new Error("Invalid attributes type");
  if (e.root && typeof e.root != "string")
    throw new Error("Invalid root type");
  if (e.root && !e.root.startsWith("/"))
    throw new Error("Root must start with a leading slash");
  if (e.root && !e.source.includes(e.root))
    throw new Error("Root must be part of the source");
  if (e.root && J(e.source, t)) {
    const r = e.source.match(t)[0];
    if (!e.source.includes((0,path__WEBPACK_IMPORTED_MODULE_3__.join)(r, e.root)))
      throw new Error("The root must be relative to the service. e.g /files/emma");
  }
  if (e.status && !Object.values(Q).includes(e.status))
    throw new Error("Status must be a valid NodeStatus");
};
/**
 * @copyright Copyright (c) 2022 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
var Q = /* @__PURE__ */ ((e) => (e.NEW = "new", e.FAILED = "failed", e.LOADING = "loading", e.LOCKED = "locked", e))(Q || {});
class D {
  _data;
  _attributes;
  _knownDavService = /(remote|public)\.php\/(web)?dav/i;
  constructor(t, r) {
    X(t, r || this._knownDavService), this._data = t;
    const s = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set: (n, i, d) => (this.updateMtime(), Reflect.set(n, i, d)),
      deleteProperty: (n, i) => (this.updateMtime(), Reflect.deleteProperty(n, i))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    };
    this._attributes = new Proxy(t.attributes || {}, s), delete this._data.attributes, r && (this._knownDavService = r);
  }
  /**
   * Get the source url to this object
   */
  get source() {
    return this._data.source.replace(/\/$/i, "");
  }
  /**
   * Get the encoded source url to this object for requests purposes
   */
  get encodedSource() {
    const { origin: t } = new URL(this.source);
    return t + (0,_nextcloud_paths__WEBPACK_IMPORTED_MODULE_4__.encodePath)(this.source.slice(t.length));
  }
  /**
   * Get this object name
   */
  get basename() {
    return (0,path__WEBPACK_IMPORTED_MODULE_3__.basename)(this.source);
  }
  /**
   * Get this object's extension
   */
  get extension() {
    return (0,path__WEBPACK_IMPORTED_MODULE_3__.extname)(this.source);
  }
  /**
   * Get the directory path leading to this object
   * Will use the relative path to root if available
   */
  get dirname() {
    if (this.root) {
      const r = this.source.indexOf(this.root);
      return (0,path__WEBPACK_IMPORTED_MODULE_3__.dirname)(this.source.slice(r + this.root.length) || "/");
    }
    const t = new URL(this.source);
    return (0,path__WEBPACK_IMPORTED_MODULE_3__.dirname)(t.pathname);
  }
  /**
   * Get the file mime
   */
  get mime() {
    return this._data.mime;
  }
  /**
   * Get the file modification time
   */
  get mtime() {
    return this._data.mtime;
  }
  /**
   * Get the file creation time
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
   * Get the file attribute
   */
  get attributes() {
    return this._attributes;
  }
  /**
   * Get the file permissions
   */
  get permissions() {
    return this.owner === null && !this.isDavRessource ? N.READ : this._data.permissions !== void 0 ? this._data.permissions : N.NONE;
  }
  /**
   * Get the file owner
   */
  get owner() {
    return this.isDavRessource ? this._data.owner : null;
  }
  /**
   * Is this a dav-related ressource ?
   */
  get isDavRessource() {
    return J(this.source, this._knownDavService);
  }
  /**
   * Get the dav root of this object
   */
  get root() {
    return this._data.root ? this._data.root.replace(/^(.+)\/$/, "$1") : this.isDavRessource && (0,path__WEBPACK_IMPORTED_MODULE_3__.dirname)(this.source).split(this._knownDavService).pop() || null;
  }
  /**
   * Get the absolute path of this object relative to the root
   */
  get path() {
    if (this.root) {
      const t = this.source.indexOf(this.root);
      return this.source.slice(t + this.root.length) || "/";
    }
    return (this.dirname + "/" + this.basename).replace(/\/\//g, "/");
  }
  /**
   * Get the node id if defined.
   * Will look for the fileid in attributes if undefined.
   */
  get fileid() {
    return this._data?.id || this.attributes?.fileid;
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
  set status(t) {
    this._data.status = t;
  }
  /**
   * Move the node to a new destination
   *
   * @param {string} destination the new source.
   * e.g. https://cloud.domain.com/remote.php/dav/files/emma/Photos/picture.jpg
   */
  move(t) {
    X({ ...this._data, source: t }, this._knownDavService), this._data.source = t, this.updateMtime();
  }
  /**
   * Rename the node
   * This aliases the move method for easier usage
   *
   * @param basename The new name of the node
   */
  rename(t) {
    if (t.includes("/"))
      throw new Error("Invalid basename");
    this.move((0,path__WEBPACK_IMPORTED_MODULE_3__.dirname)(this.source) + "/" + t);
  }
  /**
   * Update the mtime if exists.
   */
  updateMtime() {
    this._data.mtime && (this._data.mtime = /* @__PURE__ */ new Date());
  }
}
/**
 * @copyright Copyright (c) 2022 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
class ye extends D {
  get type() {
    return R.File;
  }
}
/**
 * @copyright Copyright (c) 2022 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
class _e extends D {
  constructor(t) {
    super({
      ...t,
      mime: "httpd/unix-directory"
    });
  }
  get type() {
    return R.Folder;
  }
  get extension() {
    return null;
  }
  get mime() {
    return "httpd/unix-directory";
  }
}
/**
 * @copyright Copyright (c) 2023 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 * @author Ferdinand Thiessen <opensource@fthiessen.de>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
const ee = `/files/${(0,_nextcloud_auth__WEBPACK_IMPORTED_MODULE_0__.getCurrentUser)()?.uid}`, te = (0,_nextcloud_router__WEBPACK_IMPORTED_MODULE_5__.generateRemoteUrl)("dav"), ur = function(e = te) {
  const t = (0,webdav__WEBPACK_IMPORTED_MODULE_6__.createClient)(e);
  function r(n) {
    t.setHeaders({
      // Add this so the server knows it is an request from the browser
      "X-Requested-With": "XMLHttpRequest",
      // Inject user auth
      requesttoken: n ?? ""
    });
  }
  return (0,_nextcloud_auth__WEBPACK_IMPORTED_MODULE_0__.onRequestTokenUpdate)(r), r((0,_nextcloud_auth__WEBPACK_IMPORTED_MODULE_0__.getRequestToken)()), (0,webdav__WEBPACK_IMPORTED_MODULE_6__.getPatcher)().patch("fetch", (n, i) => {
    const d = i.headers;
    return d?.method && (i.method = d.method, delete d.method), fetch(n, i);
  }), t;
}, dr = async (e, t = "/", r = ee) => (await e.getDirectoryContents(`${r}${t}`, {
  details: !0,
  data: Ee(),
  headers: {
    // see davGetClient for patched webdav client
    method: "REPORT"
  },
  includeSelf: !0
})).data.filter((n) => n.filename !== t).map((n) => ve(n, r)), ve = function(e, t = ee, r = te) {
  const s = e.props, n = be(s?.permissions), i = (0,_nextcloud_auth__WEBPACK_IMPORTED_MODULE_0__.getCurrentUser)()?.uid, d = {
    id: s?.fileid || 0,
    source: `${r}${e.filename}`,
    mtime: new Date(Date.parse(e.lastmod)),
    mime: e.mime,
    size: s?.size || Number.parseInt(s.getcontentlength || "0"),
    permissions: n,
    owner: i,
    root: t,
    attributes: {
      ...e,
      ...s,
      hasPreview: s?.["has-preview"]
    }
  };
  return delete d.attributes?.props, e.type === "file" ? new ye(d) : new _e(d);
};
/**
 * @copyright Copyright (c) 2022 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
class Te {
  _views = [];
  _currentView = null;
  register(t) {
    if (this._views.find((r) => r.id === t.id))
      throw new Error(`View id ${t.id} is already registered`);
    this._views.push(t);
  }
  remove(t) {
    const r = this._views.findIndex((s) => s.id === t);
    r !== -1 && this._views.splice(r, 1);
  }
  get views() {
    return this._views;
  }
  setActive(t) {
    this._currentView = t;
  }
  get active() {
    return this._currentView;
  }
}
const ar = function() {
  return typeof window._nc_navigation > "u" && (window._nc_navigation = new Te(), m.debug("Navigation service initialized")), window._nc_navigation;
};
/**
 * @copyright Copyright (c) 2022 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
class Ie {
  _column;
  constructor(t) {
    Ae(t), this._column = t;
  }
  get id() {
    return this._column.id;
  }
  get title() {
    return this._column.title;
  }
  get render() {
    return this._column.render;
  }
  get sort() {
    return this._column.sort;
  }
  get summary() {
    return this._column.summary;
  }
}
const Ae = function(e) {
  if (!e.id || typeof e.id != "string")
    throw new Error("A column id is required");
  if (!e.title || typeof e.title != "string")
    throw new Error("A column title is required");
  if (!e.render || typeof e.render != "function")
    throw new Error("A render function is required");
  if (e.sort && typeof e.sort != "function")
    throw new Error("Column sortFunction must be a function");
  if (e.summary && typeof e.summary != "function")
    throw new Error("Column summary must be a function");
  return !0;
};
var S = {}, O = {};
(function(e) {
  const t = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD", r = t + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040", s = "[" + t + "][" + r + "]*", n = new RegExp("^" + s + "$"), i = function(u, o) {
    const a = [];
    let l = o.exec(u);
    for (; l; ) {
      const f = [];
      f.startIndex = o.lastIndex - l[0].length;
      const c = l.length;
      for (let g = 0; g < c; g++)
        f.push(l[g]);
      a.push(f), l = o.exec(u);
    }
    return a;
  }, d = function(u) {
    const o = n.exec(u);
    return !(o === null || typeof o > "u");
  };
  e.isExist = function(u) {
    return typeof u < "u";
  }, e.isEmptyObject = function(u) {
    return Object.keys(u).length === 0;
  }, e.merge = function(u, o, a) {
    if (o) {
      const l = Object.keys(o), f = l.length;
      for (let c = 0; c < f; c++)
        a === "strict" ? u[l[c]] = [o[l[c]]] : u[l[c]] = o[l[c]];
    }
  }, e.getValue = function(u) {
    return e.isExist(u) ? u : "";
  }, e.isName = d, e.getAllMatches = i, e.nameRegexp = s;
})(O);
const M = O, Oe = {
  allowBooleanAttributes: !1,
  //A tag can have attributes without any value
  unpairedTags: []
};
S.validate = function(e, t) {
  t = Object.assign({}, Oe, t);
  const r = [];
  let s = !1, n = !1;
  e[0] === "\uFEFF" && (e = e.substr(1));
  for (let i = 0; i < e.length; i++)
    if (e[i] === "<" && e[i + 1] === "?") {
      if (i += 2, i = G(e, i), i.err)
        return i;
    } else if (e[i] === "<") {
      let d = i;
      if (i++, e[i] === "!") {
        i = z(e, i);
        continue;
      } else {
        let u = !1;
        e[i] === "/" && (u = !0, i++);
        let o = "";
        for (; i < e.length && e[i] !== ">" && e[i] !== " " && e[i] !== "	" && e[i] !== `
` && e[i] !== "\r"; i++)
          o += e[i];
        if (o = o.trim(), o[o.length - 1] === "/" && (o = o.substring(0, o.length - 1), i--), !Re(o)) {
          let f;
          return o.trim().length === 0 ? f = "Invalid space after '<'." : f = "Tag '" + o + "' is an invalid name.", p("InvalidTag", f, w(e, i));
        }
        const a = xe(e, i);
        if (a === !1)
          return p("InvalidAttr", "Attributes for '" + o + "' have open quote.", w(e, i));
        let l = a.value;
        if (i = a.index, l[l.length - 1] === "/") {
          const f = i - l.length;
          l = l.substring(0, l.length - 1);
          const c = H(l, t);
          if (c === !0)
            s = !0;
          else
            return p(c.err.code, c.err.msg, w(e, f + c.err.line));
        } else if (u)
          if (a.tagClosed) {
            if (l.trim().length > 0)
              return p("InvalidTag", "Closing tag '" + o + "' can't have attributes or invalid starting.", w(e, d));
            {
              const f = r.pop();
              if (o !== f.tagName) {
                let c = w(e, f.tagStartPos);
                return p(
                  "InvalidTag",
                  "Expected closing tag '" + f.tagName + "' (opened in line " + c.line + ", col " + c.col + ") instead of closing tag '" + o + "'.",
                  w(e, d)
                );
              }
              r.length == 0 && (n = !0);
            }
          } else
            return p("InvalidTag", "Closing tag '" + o + "' doesn't have proper closing.", w(e, i));
        else {
          const f = H(l, t);
          if (f !== !0)
            return p(f.err.code, f.err.msg, w(e, i - l.length + f.err.line));
          if (n === !0)
            return p("InvalidXml", "Multiple possible root nodes found.", w(e, i));
          t.unpairedTags.indexOf(o) !== -1 || r.push({ tagName: o, tagStartPos: d }), s = !0;
        }
        for (i++; i < e.length; i++)
          if (e[i] === "<")
            if (e[i + 1] === "!") {
              i++, i = z(e, i);
              continue;
            } else if (e[i + 1] === "?") {
              if (i = G(e, ++i), i.err)
                return i;
            } else
              break;
          else if (e[i] === "&") {
            const f = Ve(e, i);
            if (f == -1)
              return p("InvalidChar", "char '&' is not expected.", w(e, i));
            i = f;
          } else if (n === !0 && !U(e[i]))
            return p("InvalidXml", "Extra text at the end", w(e, i));
        e[i] === "<" && i--;
      }
    } else {
      if (U(e[i]))
        continue;
      return p("InvalidChar", "char '" + e[i] + "' is not expected.", w(e, i));
    }
  if (s) {
    if (r.length == 1)
      return p("InvalidTag", "Unclosed tag '" + r[0].tagName + "'.", w(e, r[0].tagStartPos));
    if (r.length > 0)
      return p("InvalidXml", "Invalid '" + JSON.stringify(r.map((i) => i.tagName), null, 4).replace(/\r?\n/g, "") + "' found.", { line: 1, col: 1 });
  } else
    return p("InvalidXml", "Start tag expected.", 1);
  return !0;
};
function U(e) {
  return e === " " || e === "	" || e === `
` || e === "\r";
}
function G(e, t) {
  const r = t;
  for (; t < e.length; t++)
    if (e[t] == "?" || e[t] == " ") {
      const s = e.substr(r, t - r);
      if (t > 5 && s === "xml")
        return p("InvalidXml", "XML declaration allowed only at the start of the document.", w(e, t));
      if (e[t] == "?" && e[t + 1] == ">") {
        t++;
        break;
      } else
        continue;
    }
  return t;
}
function z(e, t) {
  if (e.length > t + 5 && e[t + 1] === "-" && e[t + 2] === "-") {
    for (t += 3; t < e.length; t++)
      if (e[t] === "-" && e[t + 1] === "-" && e[t + 2] === ">") {
        t += 2;
        break;
      }
  } else if (e.length > t + 8 && e[t + 1] === "D" && e[t + 2] === "O" && e[t + 3] === "C" && e[t + 4] === "T" && e[t + 5] === "Y" && e[t + 6] === "P" && e[t + 7] === "E") {
    let r = 1;
    for (t += 8; t < e.length; t++)
      if (e[t] === "<")
        r++;
      else if (e[t] === ">" && (r--, r === 0))
        break;
  } else if (e.length > t + 9 && e[t + 1] === "[" && e[t + 2] === "C" && e[t + 3] === "D" && e[t + 4] === "A" && e[t + 5] === "T" && e[t + 6] === "A" && e[t + 7] === "[") {
    for (t += 8; t < e.length; t++)
      if (e[t] === "]" && e[t + 1] === "]" && e[t + 2] === ">") {
        t += 2;
        break;
      }
  }
  return t;
}
const Ce = '"', Pe = "'";
function xe(e, t) {
  let r = "", s = "", n = !1;
  for (; t < e.length; t++) {
    if (e[t] === Ce || e[t] === Pe)
      s === "" ? s = e[t] : s !== e[t] || (s = "");
    else if (e[t] === ">" && s === "") {
      n = !0;
      break;
    }
    r += e[t];
  }
  return s !== "" ? !1 : {
    value: r,
    index: t,
    tagClosed: n
  };
}
const $e = new RegExp(`(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['"])(([\\s\\S])*?)\\5)?`, "g");
function H(e, t) {
  const r = M.getAllMatches(e, $e), s = {};
  for (let n = 0; n < r.length; n++) {
    if (r[n][1].length === 0)
      return p("InvalidAttr", "Attribute '" + r[n][2] + "' has no space in starting.", v(r[n]));
    if (r[n][3] !== void 0 && r[n][4] === void 0)
      return p("InvalidAttr", "Attribute '" + r[n][2] + "' is without value.", v(r[n]));
    if (r[n][3] === void 0 && !t.allowBooleanAttributes)
      return p("InvalidAttr", "boolean attribute '" + r[n][2] + "' is not allowed.", v(r[n]));
    const i = r[n][2];
    if (!Le(i))
      return p("InvalidAttr", "Attribute '" + i + "' is an invalid name.", v(r[n]));
    if (!s.hasOwnProperty(i))
      s[i] = 1;
    else
      return p("InvalidAttr", "Attribute '" + i + "' is repeated.", v(r[n]));
  }
  return !0;
}
function Fe(e, t) {
  let r = /\d/;
  for (e[t] === "x" && (t++, r = /[\da-fA-F]/); t < e.length; t++) {
    if (e[t] === ";")
      return t;
    if (!e[t].match(r))
      break;
  }
  return -1;
}
function Ve(e, t) {
  if (t++, e[t] === ";")
    return -1;
  if (e[t] === "#")
    return t++, Fe(e, t);
  let r = 0;
  for (; t < e.length; t++, r++)
    if (!(e[t].match(/\w/) && r < 20)) {
      if (e[t] === ";")
        break;
      return -1;
    }
  return t;
}
function p(e, t, r) {
  return {
    err: {
      code: e,
      msg: t,
      line: r.line || r,
      col: r.col
    }
  };
}
function Le(e) {
  return M.isName(e);
}
function Re(e) {
  return M.isName(e);
}
function w(e, t) {
  const r = e.substring(0, t).split(/\r?\n/);
  return {
    line: r.length,
    // column number is last line's length + 1, because column numbering starts at 1:
    col: r[r.length - 1].length + 1
  };
}
function v(e) {
  return e.startIndex + e[1].length;
}
var B = {};
const re = {
  preserveOrder: !1,
  attributeNamePrefix: "@_",
  attributesGroupName: !1,
  textNodeName: "#text",
  ignoreAttributes: !0,
  removeNSPrefix: !1,
  // remove NS from tag name or attribute name if true
  allowBooleanAttributes: !1,
  //a tag can have attributes without any value
  //ignoreRootElement : false,
  parseTagValue: !0,
  parseAttributeValue: !1,
  trimValues: !0,
  //Trim string values of tag and attributes
  cdataPropName: !1,
  numberParseOptions: {
    hex: !0,
    leadingZeros: !0,
    eNotation: !0
  },
  tagValueProcessor: function(e, t) {
    return t;
  },
  attributeValueProcessor: function(e, t) {
    return t;
  },
  stopNodes: [],
  //nested tags will not be parsed even for errors
  alwaysCreateTextNode: !1,
  isArray: () => !1,
  commentPropName: !1,
  unpairedTags: [],
  processEntities: !0,
  htmlEntities: !1,
  ignoreDeclaration: !1,
  ignorePiTags: !1,
  transformTagName: !1,
  transformAttributeName: !1,
  updateTag: function(e, t, r) {
    return e;
  }
  // skipEmptyListItem: false
}, Se = function(e) {
  return Object.assign({}, re, e);
};
B.buildOptions = Se;
B.defaultOptions = re;
class Me {
  constructor(t) {
    this.tagname = t, this.child = [], this[":@"] = {};
  }
  add(t, r) {
    t === "__proto__" && (t = "#__proto__"), this.child.push({ [t]: r });
  }
  addChild(t) {
    t.tagname === "__proto__" && (t.tagname = "#__proto__"), t[":@"] && Object.keys(t[":@"]).length > 0 ? this.child.push({ [t.tagname]: t.child, ":@": t[":@"] }) : this.child.push({ [t.tagname]: t.child });
  }
}
var Be = Me;
const ke = O;
function qe(e, t) {
  const r = {};
  if (e[t + 3] === "O" && e[t + 4] === "C" && e[t + 5] === "T" && e[t + 6] === "Y" && e[t + 7] === "P" && e[t + 8] === "E") {
    t = t + 9;
    let s = 1, n = !1, i = !1, d = "";
    for (; t < e.length; t++)
      if (e[t] === "<" && !i) {
        if (n && Ge(e, t))
          t += 7, [entityName, val, t] = Xe(e, t + 1), val.indexOf("&") === -1 && (r[We(entityName)] = {
            regx: RegExp(`&${entityName};`, "g"),
            val
          });
        else if (n && ze(e, t))
          t += 8;
        else if (n && He(e, t))
          t += 8;
        else if (n && Ke(e, t))
          t += 9;
        else if (Ue)
          i = !0;
        else
          throw new Error("Invalid DOCTYPE");
        s++, d = "";
      } else if (e[t] === ">") {
        if (i ? e[t - 1] === "-" && e[t - 2] === "-" && (i = !1, s--) : s--, s === 0)
          break;
      } else
        e[t] === "[" ? n = !0 : d += e[t];
    if (s !== 0)
      throw new Error("Unclosed DOCTYPE");
  } else
    throw new Error("Invalid Tag instead of DOCTYPE");
  return { entities: r, i: t };
}
function Xe(e, t) {
  let r = "";
  for (; t < e.length && e[t] !== "'" && e[t] !== '"'; t++)
    r += e[t];
  if (r = r.trim(), r.indexOf(" ") !== -1)
    throw new Error("External entites are not supported");
  const s = e[t++];
  let n = "";
  for (; t < e.length && e[t] !== s; t++)
    n += e[t];
  return [r, n, t];
}
function Ue(e, t) {
  return e[t + 1] === "!" && e[t + 2] === "-" && e[t + 3] === "-";
}
function Ge(e, t) {
  return e[t + 1] === "!" && e[t + 2] === "E" && e[t + 3] === "N" && e[t + 4] === "T" && e[t + 5] === "I" && e[t + 6] === "T" && e[t + 7] === "Y";
}
function ze(e, t) {
  return e[t + 1] === "!" && e[t + 2] === "E" && e[t + 3] === "L" && e[t + 4] === "E" && e[t + 5] === "M" && e[t + 6] === "E" && e[t + 7] === "N" && e[t + 8] === "T";
}
function He(e, t) {
  return e[t + 1] === "!" && e[t + 2] === "A" && e[t + 3] === "T" && e[t + 4] === "T" && e[t + 5] === "L" && e[t + 6] === "I" && e[t + 7] === "S" && e[t + 8] === "T";
}
function Ke(e, t) {
  return e[t + 1] === "!" && e[t + 2] === "N" && e[t + 3] === "O" && e[t + 4] === "T" && e[t + 5] === "A" && e[t + 6] === "T" && e[t + 7] === "I" && e[t + 8] === "O" && e[t + 9] === "N";
}
function We(e) {
  if (ke.isName(e))
    return e;
  throw new Error(`Invalid entity name ${e}`);
}
var Ze = qe;
const je = /^[-+]?0x[a-fA-F0-9]+$/, Ye = /^([\-\+])?(0*)(\.[0-9]+([eE]\-?[0-9]+)?|[0-9]+(\.[0-9]+([eE]\-?[0-9]+)?)?)$/;
!Number.parseInt && window.parseInt && (Number.parseInt = window.parseInt);
!Number.parseFloat && window.parseFloat && (Number.parseFloat = window.parseFloat);
const Je = {
  hex: !0,
  leadingZeros: !0,
  decimalPoint: ".",
  eNotation: !0
  //skipLike: /regex/
};
function Qe(e, t = {}) {
  if (t = Object.assign({}, Je, t), !e || typeof e != "string")
    return e;
  let r = e.trim();
  if (t.skipLike !== void 0 && t.skipLike.test(r))
    return e;
  if (t.hex && je.test(r))
    return Number.parseInt(r, 16);
  {
    const s = Ye.exec(r);
    if (s) {
      const n = s[1], i = s[2];
      let d = De(s[3]);
      const u = s[4] || s[6];
      if (!t.leadingZeros && i.length > 0 && n && r[2] !== ".")
        return e;
      if (!t.leadingZeros && i.length > 0 && !n && r[1] !== ".")
        return e;
      {
        const o = Number(r), a = "" + o;
        return a.search(/[eE]/) !== -1 || u ? t.eNotation ? o : e : r.indexOf(".") !== -1 ? a === "0" && d === "" || a === d || n && a === "-" + d ? o : e : i ? d === a || n + d === a ? o : e : r === a || r === n + a ? o : e;
      }
    } else
      return e;
  }
}
function De(e) {
  return e && e.indexOf(".") !== -1 && (e = e.replace(/0+$/, ""), e === "." ? e = "0" : e[0] === "." ? e = "0" + e : e[e.length - 1] === "." && (e = e.substr(0, e.length - 1))), e;
}
var et = Qe;
const k = O, T = Be, tt = Ze, rt = et;
"<((!\\[CDATA\\[([\\s\\S]*?)(]]>))|((NAME:)?(NAME))([^>]*)>|((\\/)(NAME)\\s*>))([^<]*)".replace(/NAME/g, k.nameRegexp);
let nt = class {
  constructor(t) {
    this.options = t, this.currentNode = null, this.tagsNodeStack = [], this.docTypeEntities = {}, this.lastEntities = {
      apos: { regex: /&(apos|#39|#x27);/g, val: "'" },
      gt: { regex: /&(gt|#62|#x3E);/g, val: ">" },
      lt: { regex: /&(lt|#60|#x3C);/g, val: "<" },
      quot: { regex: /&(quot|#34|#x22);/g, val: '"' }
    }, this.ampEntity = { regex: /&(amp|#38|#x26);/g, val: "&" }, this.htmlEntities = {
      space: { regex: /&(nbsp|#160);/g, val: " " },
      // "lt" : { regex: /&(lt|#60);/g, val: "<" },
      // "gt" : { regex: /&(gt|#62);/g, val: ">" },
      // "amp" : { regex: /&(amp|#38);/g, val: "&" },
      // "quot" : { regex: /&(quot|#34);/g, val: "\"" },
      // "apos" : { regex: /&(apos|#39);/g, val: "'" },
      cent: { regex: /&(cent|#162);/g, val: "¢" },
      pound: { regex: /&(pound|#163);/g, val: "£" },
      yen: { regex: /&(yen|#165);/g, val: "¥" },
      euro: { regex: /&(euro|#8364);/g, val: "€" },
      copyright: { regex: /&(copy|#169);/g, val: "©" },
      reg: { regex: /&(reg|#174);/g, val: "®" },
      inr: { regex: /&(inr|#8377);/g, val: "₹" }
    }, this.addExternalEntities = it, this.parseXml = at, this.parseTextData = st, this.resolveNameSpace = ot, this.buildAttributesMap = dt, this.isItStopNode = ht, this.replaceEntitiesValue = ft, this.readStopNodeData = gt, this.saveTextToParentTag = ct, this.addChild = lt;
  }
};
function it(e) {
  const t = Object.keys(e);
  for (let r = 0; r < t.length; r++) {
    const s = t[r];
    this.lastEntities[s] = {
      regex: new RegExp("&" + s + ";", "g"),
      val: e[s]
    };
  }
}
function st(e, t, r, s, n, i, d) {
  if (e !== void 0 && (this.options.trimValues && !s && (e = e.trim()), e.length > 0)) {
    d || (e = this.replaceEntitiesValue(e));
    const u = this.options.tagValueProcessor(t, e, r, n, i);
    return u == null ? e : typeof u != typeof e || u !== e ? u : this.options.trimValues ? $(e, this.options.parseTagValue, this.options.numberParseOptions) : e.trim() === e ? $(e, this.options.parseTagValue, this.options.numberParseOptions) : e;
  }
}
function ot(e) {
  if (this.options.removeNSPrefix) {
    const t = e.split(":"), r = e.charAt(0) === "/" ? "/" : "";
    if (t[0] === "xmlns")
      return "";
    t.length === 2 && (e = r + t[1]);
  }
  return e;
}
const ut = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])([\\s\\S]*?)\\3)?`, "gm");
function dt(e, t, r) {
  if (!this.options.ignoreAttributes && typeof e == "string") {
    const s = k.getAllMatches(e, ut), n = s.length, i = {};
    for (let d = 0; d < n; d++) {
      const u = this.resolveNameSpace(s[d][1]);
      let o = s[d][4], a = this.options.attributeNamePrefix + u;
      if (u.length)
        if (this.options.transformAttributeName && (a = this.options.transformAttributeName(a)), a === "__proto__" && (a = "#__proto__"), o !== void 0) {
          this.options.trimValues && (o = o.trim()), o = this.replaceEntitiesValue(o);
          const l = this.options.attributeValueProcessor(u, o, t);
          l == null ? i[a] = o : typeof l != typeof o || l !== o ? i[a] = l : i[a] = $(
            o,
            this.options.parseAttributeValue,
            this.options.numberParseOptions
          );
        } else
          this.options.allowBooleanAttributes && (i[a] = !0);
    }
    if (!Object.keys(i).length)
      return;
    if (this.options.attributesGroupName) {
      const d = {};
      return d[this.options.attributesGroupName] = i, d;
    }
    return i;
  }
}
const at = function(e) {
  e = e.replace(/\r\n?/g, `
`);
  const t = new T("!xml");
  let r = t, s = "", n = "";
  for (let i = 0; i < e.length; i++)
    if (e[i] === "<")
      if (e[i + 1] === "/") {
        const u = y(e, ">", i, "Closing Tag is not closed.");
        let o = e.substring(i + 2, u).trim();
        if (this.options.removeNSPrefix) {
          const f = o.indexOf(":");
          f !== -1 && (o = o.substr(f + 1));
        }
        this.options.transformTagName && (o = this.options.transformTagName(o)), r && (s = this.saveTextToParentTag(s, r, n));
        const a = n.substring(n.lastIndexOf(".") + 1);
        if (o && this.options.unpairedTags.indexOf(o) !== -1)
          throw new Error(`Unpaired tag can not be used as closing tag: </${o}>`);
        let l = 0;
        a && this.options.unpairedTags.indexOf(a) !== -1 ? (l = n.lastIndexOf(".", n.lastIndexOf(".") - 1), this.tagsNodeStack.pop()) : l = n.lastIndexOf("."), n = n.substring(0, l), r = this.tagsNodeStack.pop(), s = "", i = u;
      } else if (e[i + 1] === "?") {
        let u = x(e, i, !1, "?>");
        if (!u)
          throw new Error("Pi Tag is not closed.");
        if (s = this.saveTextToParentTag(s, r, n), !(this.options.ignoreDeclaration && u.tagName === "?xml" || this.options.ignorePiTags)) {
          const o = new T(u.tagName);
          o.add(this.options.textNodeName, ""), u.tagName !== u.tagExp && u.attrExpPresent && (o[":@"] = this.buildAttributesMap(u.tagExp, n, u.tagName)), this.addChild(r, o, n);
        }
        i = u.closeIndex + 1;
      } else if (e.substr(i + 1, 3) === "!--") {
        const u = y(e, "-->", i + 4, "Comment is not closed.");
        if (this.options.commentPropName) {
          const o = e.substring(i + 4, u - 2);
          s = this.saveTextToParentTag(s, r, n), r.add(this.options.commentPropName, [{ [this.options.textNodeName]: o }]);
        }
        i = u;
      } else if (e.substr(i + 1, 2) === "!D") {
        const u = tt(e, i);
        this.docTypeEntities = u.entities, i = u.i;
      } else if (e.substr(i + 1, 2) === "![") {
        const u = y(e, "]]>", i, "CDATA is not closed.") - 2, o = e.substring(i + 9, u);
        if (s = this.saveTextToParentTag(s, r, n), this.options.cdataPropName)
          r.add(this.options.cdataPropName, [{ [this.options.textNodeName]: o }]);
        else {
          let a = this.parseTextData(o, r.tagname, n, !0, !1, !0);
          a == null && (a = ""), r.add(this.options.textNodeName, a);
        }
        i = u + 2;
      } else {
        let u = x(e, i, this.options.removeNSPrefix), o = u.tagName;
        const a = u.rawTagName;
        let l = u.tagExp, f = u.attrExpPresent, c = u.closeIndex;
        this.options.transformTagName && (o = this.options.transformTagName(o)), r && s && r.tagname !== "!xml" && (s = this.saveTextToParentTag(s, r, n, !1));
        const g = r;
        if (g && this.options.unpairedTags.indexOf(g.tagname) !== -1 && (r = this.tagsNodeStack.pop(), n = n.substring(0, n.lastIndexOf("."))), o !== t.tagname && (n += n ? "." + o : o), this.isItStopNode(this.options.stopNodes, n, o)) {
          let h = "";
          if (l.length > 0 && l.lastIndexOf("/") === l.length - 1)
            i = u.closeIndex;
          else if (this.options.unpairedTags.indexOf(o) !== -1)
            i = u.closeIndex;
          else {
            const E = this.readStopNodeData(e, a, c + 1);
            if (!E)
              throw new Error(`Unexpected end of ${a}`);
            i = E.i, h = E.tagContent;
          }
          const _ = new T(o);
          o !== l && f && (_[":@"] = this.buildAttributesMap(l, n, o)), h && (h = this.parseTextData(h, o, n, !0, f, !0, !0)), n = n.substr(0, n.lastIndexOf(".")), _.add(this.options.textNodeName, h), this.addChild(r, _, n);
        } else {
          if (l.length > 0 && l.lastIndexOf("/") === l.length - 1) {
            o[o.length - 1] === "/" ? (o = o.substr(0, o.length - 1), n = n.substr(0, n.length - 1), l = o) : l = l.substr(0, l.length - 1), this.options.transformTagName && (o = this.options.transformTagName(o));
            const h = new T(o);
            o !== l && f && (h[":@"] = this.buildAttributesMap(l, n, o)), this.addChild(r, h, n), n = n.substr(0, n.lastIndexOf("."));
          } else {
            const h = new T(o);
            this.tagsNodeStack.push(r), o !== l && f && (h[":@"] = this.buildAttributesMap(l, n, o)), this.addChild(r, h, n), r = h;
          }
          s = "", i = c;
        }
      }
    else
      s += e[i];
  return t.child;
};
function lt(e, t, r) {
  const s = this.options.updateTag(t.tagname, r, t[":@"]);
  s === !1 || (typeof s == "string" && (t.tagname = s), e.addChild(t));
}
const ft = function(e) {
  if (this.options.processEntities) {
    for (let t in this.docTypeEntities) {
      const r = this.docTypeEntities[t];
      e = e.replace(r.regx, r.val);
    }
    for (let t in this.lastEntities) {
      const r = this.lastEntities[t];
      e = e.replace(r.regex, r.val);
    }
    if (this.options.htmlEntities)
      for (let t in this.htmlEntities) {
        const r = this.htmlEntities[t];
        e = e.replace(r.regex, r.val);
      }
    e = e.replace(this.ampEntity.regex, this.ampEntity.val);
  }
  return e;
};
function ct(e, t, r, s) {
  return e && (s === void 0 && (s = Object.keys(t.child).length === 0), e = this.parseTextData(
    e,
    t.tagname,
    r,
    !1,
    t[":@"] ? Object.keys(t[":@"]).length !== 0 : !1,
    s
  ), e !== void 0 && e !== "" && t.add(this.options.textNodeName, e), e = ""), e;
}
function ht(e, t, r) {
  const s = "*." + r;
  for (const n in e) {
    const i = e[n];
    if (s === i || t === i)
      return !0;
  }
  return !1;
}
function pt(e, t, r = ">") {
  let s, n = "";
  for (let i = t; i < e.length; i++) {
    let d = e[i];
    if (s)
      d === s && (s = "");
    else if (d === '"' || d === "'")
      s = d;
    else if (d === r[0])
      if (r[1]) {
        if (e[i + 1] === r[1])
          return {
            data: n,
            index: i
          };
      } else
        return {
          data: n,
          index: i
        };
    else
      d === "	" && (d = " ");
    n += d;
  }
}
function y(e, t, r, s) {
  const n = e.indexOf(t, r);
  if (n === -1)
    throw new Error(s);
  return n + t.length - 1;
}
function x(e, t, r, s = ">") {
  const n = pt(e, t + 1, s);
  if (!n)
    return;
  let i = n.data;
  const d = n.index, u = i.search(/\s/);
  let o = i, a = !0;
  u !== -1 && (o = i.substr(0, u).replace(/\s\s*$/, ""), i = i.substr(u + 1));
  const l = o;
  if (r) {
    const f = o.indexOf(":");
    f !== -1 && (o = o.substr(f + 1), a = o !== n.data.substr(f + 1));
  }
  return {
    tagName: o,
    tagExp: i,
    closeIndex: d,
    attrExpPresent: a,
    rawTagName: l
  };
}
function gt(e, t, r) {
  const s = r;
  let n = 1;
  for (; r < e.length; r++)
    if (e[r] === "<")
      if (e[r + 1] === "/") {
        const i = y(e, ">", r, `${t} is not closed`);
        if (e.substring(r + 2, i).trim() === t && (n--, n === 0))
          return {
            tagContent: e.substring(s, r),
            i
          };
        r = i;
      } else if (e[r + 1] === "?")
        r = y(e, "?>", r + 1, "StopNode is not closed.");
      else if (e.substr(r + 1, 3) === "!--")
        r = y(e, "-->", r + 3, "StopNode is not closed.");
      else if (e.substr(r + 1, 2) === "![")
        r = y(e, "]]>", r, "StopNode is not closed.") - 2;
      else {
        const i = x(e, r, ">");
        i && ((i && i.tagName) === t && i.tagExp[i.tagExp.length - 1] !== "/" && n++, r = i.closeIndex);
      }
}
function $(e, t, r) {
  if (t && typeof e == "string") {
    const s = e.trim();
    return s === "true" ? !0 : s === "false" ? !1 : rt(e, r);
  } else
    return k.isExist(e) ? e : "";
}
var wt = nt, ne = {};
function mt(e, t) {
  return ie(e, t);
}
function ie(e, t, r) {
  let s;
  const n = {};
  for (let i = 0; i < e.length; i++) {
    const d = e[i], u = Nt(d);
    let o = "";
    if (r === void 0 ? o = u : o = r + "." + u, u === t.textNodeName)
      s === void 0 ? s = d[u] : s += "" + d[u];
    else {
      if (u === void 0)
        continue;
      if (d[u]) {
        let a = ie(d[u], t, o);
        const l = bt(a, t);
        d[":@"] ? Et(a, d[":@"], o, t) : Object.keys(a).length === 1 && a[t.textNodeName] !== void 0 && !t.alwaysCreateTextNode ? a = a[t.textNodeName] : Object.keys(a).length === 0 && (t.alwaysCreateTextNode ? a[t.textNodeName] = "" : a = ""), n[u] !== void 0 && n.hasOwnProperty(u) ? (Array.isArray(n[u]) || (n[u] = [n[u]]), n[u].push(a)) : t.isArray(u, o, l) ? n[u] = [a] : n[u] = a;
      }
    }
  }
  return typeof s == "string" ? s.length > 0 && (n[t.textNodeName] = s) : s !== void 0 && (n[t.textNodeName] = s), n;
}
function Nt(e) {
  const t = Object.keys(e);
  for (let r = 0; r < t.length; r++) {
    const s = t[r];
    if (s !== ":@")
      return s;
  }
}
function Et(e, t, r, s) {
  if (t) {
    const n = Object.keys(t), i = n.length;
    for (let d = 0; d < i; d++) {
      const u = n[d];
      s.isArray(u, r + "." + u, !0, !0) ? e[u] = [t[u]] : e[u] = t[u];
    }
  }
}
function bt(e, t) {
  const { textNodeName: r } = t, s = Object.keys(e).length;
  return !!(s === 0 || s === 1 && (e[r] || typeof e[r] == "boolean" || e[r] === 0));
}
ne.prettify = mt;
const { buildOptions: yt } = B, _t = wt, { prettify: vt } = ne, Tt = S;
let It = class {
  constructor(t) {
    this.externalEntities = {}, this.options = yt(t);
  }
  /**
   * Parse XML dats to JS object 
   * @param {string|Buffer} xmlData 
   * @param {boolean|Object} validationOption 
   */
  parse(t, r) {
    if (typeof t != "string")
      if (t.toString)
        t = t.toString();
      else
        throw new Error("XML data is accepted in String or Bytes[] form.");
    if (r) {
      r === !0 && (r = {});
      const i = Tt.validate(t, r);
      if (i !== !0)
        throw Error(`${i.err.msg}:${i.err.line}:${i.err.col}`);
    }
    const s = new _t(this.options);
    s.addExternalEntities(this.externalEntities);
    const n = s.parseXml(t);
    return this.options.preserveOrder || n === void 0 ? n : vt(n, this.options);
  }
  /**
   * Add Entity which is not by default supported by this library
   * @param {string} key 
   * @param {string} value 
   */
  addEntity(t, r) {
    if (r.indexOf("&") !== -1)
      throw new Error("Entity value can't have '&'");
    if (t.indexOf("&") !== -1 || t.indexOf(";") !== -1)
      throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
    if (r === "&")
      throw new Error("An entity with value '&' is not permitted");
    this.externalEntities[t] = r;
  }
};
var At = It;
const Ot = `
`;
function Ct(e, t) {
  let r = "";
  return t.format && t.indentBy.length > 0 && (r = Ot), se(e, t, "", r);
}
function se(e, t, r, s) {
  let n = "", i = !1;
  for (let d = 0; d < e.length; d++) {
    const u = e[d], o = Pt(u);
    if (o === void 0)
      continue;
    let a = "";
    if (r.length === 0 ? a = o : a = `${r}.${o}`, o === t.textNodeName) {
      let h = u[o];
      xt(a, t) || (h = t.tagValueProcessor(o, h), h = oe(h, t)), i && (n += s), n += h, i = !1;
      continue;
    } else if (o === t.cdataPropName) {
      i && (n += s), n += `<![CDATA[${u[o][0][t.textNodeName]}]]>`, i = !1;
      continue;
    } else if (o === t.commentPropName) {
      n += s + `<!--${u[o][0][t.textNodeName]}-->`, i = !0;
      continue;
    } else if (o[0] === "?") {
      const h = K(u[":@"], t), _ = o === "?xml" ? "" : s;
      let E = u[o][0][t.textNodeName];
      E = E.length !== 0 ? " " + E : "", n += _ + `<${o}${E}${h}?>`, i = !0;
      continue;
    }
    let l = s;
    l !== "" && (l += t.indentBy);
    const f = K(u[":@"], t), c = s + `<${o}${f}`, g = se(u[o], t, a, l);
    t.unpairedTags.indexOf(o) !== -1 ? t.suppressUnpairedNode ? n += c + ">" : n += c + "/>" : (!g || g.length === 0) && t.suppressEmptyNode ? n += c + "/>" : g && g.endsWith(">") ? n += c + `>${g}${s}</${o}>` : (n += c + ">", g && s !== "" && (g.includes("/>") || g.includes("</")) ? n += s + t.indentBy + g + s : n += g, n += `</${o}>`), i = !0;
  }
  return n;
}
function Pt(e) {
  const t = Object.keys(e);
  for (let r = 0; r < t.length; r++) {
    const s = t[r];
    if (e.hasOwnProperty(s) && s !== ":@")
      return s;
  }
}
function K(e, t) {
  let r = "";
  if (e && !t.ignoreAttributes)
    for (let s in e) {
      if (!e.hasOwnProperty(s))
        continue;
      let n = t.attributeValueProcessor(s, e[s]);
      n = oe(n, t), n === !0 && t.suppressBooleanAttributes ? r += ` ${s.substr(t.attributeNamePrefix.length)}` : r += ` ${s.substr(t.attributeNamePrefix.length)}="${n}"`;
    }
  return r;
}
function xt(e, t) {
  e = e.substr(0, e.length - t.textNodeName.length - 1);
  let r = e.substr(e.lastIndexOf(".") + 1);
  for (let s in t.stopNodes)
    if (t.stopNodes[s] === e || t.stopNodes[s] === "*." + r)
      return !0;
  return !1;
}
function oe(e, t) {
  if (e && e.length > 0 && t.processEntities)
    for (let r = 0; r < t.entities.length; r++) {
      const s = t.entities[r];
      e = e.replace(s.regex, s.val);
    }
  return e;
}
var $t = Ct;
const Ft = $t, Vt = {
  attributeNamePrefix: "@_",
  attributesGroupName: !1,
  textNodeName: "#text",
  ignoreAttributes: !0,
  cdataPropName: !1,
  format: !1,
  indentBy: "  ",
  suppressEmptyNode: !1,
  suppressUnpairedNode: !0,
  suppressBooleanAttributes: !0,
  tagValueProcessor: function(e, t) {
    return t;
  },
  attributeValueProcessor: function(e, t) {
    return t;
  },
  preserveOrder: !1,
  commentPropName: !1,
  unpairedTags: [],
  entities: [
    { regex: new RegExp("&", "g"), val: "&amp;" },
    //it must be on top
    { regex: new RegExp(">", "g"), val: "&gt;" },
    { regex: new RegExp("<", "g"), val: "&lt;" },
    { regex: new RegExp("'", "g"), val: "&apos;" },
    { regex: new RegExp('"', "g"), val: "&quot;" }
  ],
  processEntities: !0,
  stopNodes: [],
  // transformTagName: false,
  // transformAttributeName: false,
  oneListGroup: !1
};
function b(e) {
  this.options = Object.assign({}, Vt, e), this.options.ignoreAttributes || this.options.attributesGroupName ? this.isAttribute = function() {
    return !1;
  } : (this.attrPrefixLen = this.options.attributeNamePrefix.length, this.isAttribute = St), this.processTextOrObjNode = Lt, this.options.format ? (this.indentate = Rt, this.tagEndChar = `>
`, this.newLine = `
`) : (this.indentate = function() {
    return "";
  }, this.tagEndChar = ">", this.newLine = "");
}
b.prototype.build = function(e) {
  return this.options.preserveOrder ? Ft(e, this.options) : (Array.isArray(e) && this.options.arrayNodeName && this.options.arrayNodeName.length > 1 && (e = {
    [this.options.arrayNodeName]: e
  }), this.j2x(e, 0).val);
};
b.prototype.j2x = function(e, t) {
  let r = "", s = "";
  for (let n in e)
    if (Object.prototype.hasOwnProperty.call(e, n))
      if (typeof e[n] > "u")
        this.isAttribute(n) && (s += "");
      else if (e[n] === null)
        this.isAttribute(n) ? s += "" : n[0] === "?" ? s += this.indentate(t) + "<" + n + "?" + this.tagEndChar : s += this.indentate(t) + "<" + n + "/" + this.tagEndChar;
      else if (e[n] instanceof Date)
        s += this.buildTextValNode(e[n], n, "", t);
      else if (typeof e[n] != "object") {
        const i = this.isAttribute(n);
        if (i)
          r += this.buildAttrPairStr(i, "" + e[n]);
        else if (n === this.options.textNodeName) {
          let d = this.options.tagValueProcessor(n, "" + e[n]);
          s += this.replaceEntitiesValue(d);
        } else
          s += this.buildTextValNode(e[n], n, "", t);
      } else if (Array.isArray(e[n])) {
        const i = e[n].length;
        let d = "";
        for (let u = 0; u < i; u++) {
          const o = e[n][u];
          typeof o > "u" || (o === null ? n[0] === "?" ? s += this.indentate(t) + "<" + n + "?" + this.tagEndChar : s += this.indentate(t) + "<" + n + "/" + this.tagEndChar : typeof o == "object" ? this.options.oneListGroup ? d += this.j2x(o, t + 1).val : d += this.processTextOrObjNode(o, n, t) : d += this.buildTextValNode(o, n, "", t));
        }
        this.options.oneListGroup && (d = this.buildObjectNode(d, n, "", t)), s += d;
      } else if (this.options.attributesGroupName && n === this.options.attributesGroupName) {
        const i = Object.keys(e[n]), d = i.length;
        for (let u = 0; u < d; u++)
          r += this.buildAttrPairStr(i[u], "" + e[n][i[u]]);
      } else
        s += this.processTextOrObjNode(e[n], n, t);
  return { attrStr: r, val: s };
};
b.prototype.buildAttrPairStr = function(e, t) {
  return t = this.options.attributeValueProcessor(e, "" + t), t = this.replaceEntitiesValue(t), this.options.suppressBooleanAttributes && t === "true" ? " " + e : " " + e + '="' + t + '"';
};
function Lt(e, t, r) {
  const s = this.j2x(e, r + 1);
  return e[this.options.textNodeName] !== void 0 && Object.keys(e).length === 1 ? this.buildTextValNode(e[this.options.textNodeName], t, s.attrStr, r) : this.buildObjectNode(s.val, t, s.attrStr, r);
}
b.prototype.buildObjectNode = function(e, t, r, s) {
  if (e === "")
    return t[0] === "?" ? this.indentate(s) + "<" + t + r + "?" + this.tagEndChar : this.indentate(s) + "<" + t + r + this.closeTag(t) + this.tagEndChar;
  {
    let n = "</" + t + this.tagEndChar, i = "";
    return t[0] === "?" && (i = "?", n = ""), (r || r === "") && e.indexOf("<") === -1 ? this.indentate(s) + "<" + t + r + i + ">" + e + n : this.options.commentPropName !== !1 && t === this.options.commentPropName && i.length === 0 ? this.indentate(s) + `<!--${e}-->` + this.newLine : this.indentate(s) + "<" + t + r + i + this.tagEndChar + e + this.indentate(s) + n;
  }
};
b.prototype.closeTag = function(e) {
  let t = "";
  return this.options.unpairedTags.indexOf(e) !== -1 ? this.options.suppressUnpairedNode || (t = "/") : this.options.suppressEmptyNode ? t = "/" : t = `></${e}`, t;
};
b.prototype.buildTextValNode = function(e, t, r, s) {
  if (this.options.cdataPropName !== !1 && t === this.options.cdataPropName)
    return this.indentate(s) + `<![CDATA[${e}]]>` + this.newLine;
  if (this.options.commentPropName !== !1 && t === this.options.commentPropName)
    return this.indentate(s) + `<!--${e}-->` + this.newLine;
  if (t[0] === "?")
    return this.indentate(s) + "<" + t + r + "?" + this.tagEndChar;
  {
    let n = this.options.tagValueProcessor(t, e);
    return n = this.replaceEntitiesValue(n), n === "" ? this.indentate(s) + "<" + t + r + this.closeTag(t) + this.tagEndChar : this.indentate(s) + "<" + t + r + ">" + n + "</" + t + this.tagEndChar;
  }
};
b.prototype.replaceEntitiesValue = function(e) {
  if (e && e.length > 0 && this.options.processEntities)
    for (let t = 0; t < this.options.entities.length; t++) {
      const r = this.options.entities[t];
      e = e.replace(r.regex, r.val);
    }
  return e;
};
function Rt(e) {
  return this.options.indentBy.repeat(e);
}
function St(e) {
  return e.startsWith(this.options.attributeNamePrefix) && e !== this.options.textNodeName ? e.substr(this.attrPrefixLen) : !1;
}
var Mt = b;
const Bt = S, kt = At, qt = Mt;
var W = {
  XMLParser: kt,
  XMLValidator: Bt,
  XMLBuilder: qt
};
function Xt(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected a \`string\`, got \`${typeof e}\``);
  if (e = e.trim(), e.length === 0 || W.XMLValidator.validate(e) !== !0)
    return !1;
  let t;
  const r = new W.XMLParser();
  try {
    t = r.parse(e);
  } catch {
    return !1;
  }
  return !(!t || !("svg" in t));
}
/**
 * @copyright Copyright (c) 2022 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
class cr {
  _view;
  constructor(t) {
    Ut(t), this._view = t;
  }
  get id() {
    return this._view.id;
  }
  get name() {
    return this._view.name;
  }
  get caption() {
    return this._view.caption;
  }
  get emptyTitle() {
    return this._view.emptyTitle;
  }
  get emptyCaption() {
    return this._view.emptyCaption;
  }
  get getContents() {
    return this._view.getContents;
  }
  get icon() {
    return this._view.icon;
  }
  set icon(t) {
    this._view.icon = t;
  }
  get order() {
    return this._view.order;
  }
  set order(t) {
    this._view.order = t;
  }
  get params() {
    return this._view.params;
  }
  set params(t) {
    this._view.params = t;
  }
  get columns() {
    return this._view.columns;
  }
  get emptyView() {
    return this._view.emptyView;
  }
  get parent() {
    return this._view.parent;
  }
  get sticky() {
    return this._view.sticky;
  }
  get expanded() {
    return this._view.expanded;
  }
  set expanded(t) {
    this._view.expanded = t;
  }
  get defaultSortKey() {
    return this._view.defaultSortKey;
  }
}
const Ut = function(e) {
  if (!e.id || typeof e.id != "string")
    throw new Error("View id is required and must be a string");
  if (!e.name || typeof e.name != "string")
    throw new Error("View name is required and must be a string");
  if (e.columns && e.columns.length > 0 && (!e.caption || typeof e.caption != "string"))
    throw new Error("View caption is required for top-level views and must be a string");
  if (!e.getContents || typeof e.getContents != "function")
    throw new Error("View getContents is required and must be a function");
  if (!e.icon || typeof e.icon != "string" || !Xt(e.icon))
    throw new Error("View icon is required and must be a valid svg string");
  if (!("order" in e) || typeof e.order != "number")
    throw new Error("View order is required and must be a number");
  if (e.columns && e.columns.forEach((t) => {
    if (!(t instanceof Ie))
      throw new Error("View columns must be an array of Column. Invalid column found");
  }), e.emptyView && typeof e.emptyView != "function")
    throw new Error("View emptyView must be a function");
  if (e.parent && typeof e.parent != "string")
    throw new Error("View parent must be a string");
  if ("sticky" in e && typeof e.sticky != "boolean")
    throw new Error("View sticky must be a boolean");
  if ("expanded" in e && typeof e.expanded != "boolean")
    throw new Error("View expanded must be a boolean");
  if (e.defaultSortKey && typeof e.defaultSortKey != "string")
    throw new Error("View defaultSortKey must be a string");
  return !0;
};
/**
 * @copyright 2019 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author Christoph Wurst <christoph@winzerhof-wurst.at>
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
const hr = function(e) {
  return F().registerEntry(e);
}, pr = function(e) {
  return F().unregisterEntry(e);
}, gr = function(e) {
  return F().getEntries(e).sort((r, s) => r.order !== void 0 && s.order !== void 0 && r.order !== s.order ? r.order - s.order : r.displayName.localeCompare(s.displayName, void 0, { numeric: !0, sensitivity: "base" }));
};



/***/ }),

/***/ "../node_modules/@nextcloud/l10n/dist/index.mjs":
/*!******************************************************!*\
  !*** ../node_modules/@nextcloud/l10n/dist/index.mjs ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getCanonicalLocale: () => (/* binding */ getCanonicalLocale),
/* harmony export */   getDayNames: () => (/* binding */ getDayNames),
/* harmony export */   getDayNamesMin: () => (/* binding */ getDayNamesMin),
/* harmony export */   getDayNamesShort: () => (/* binding */ getDayNamesShort),
/* harmony export */   getFirstDay: () => (/* binding */ getFirstDay),
/* harmony export */   getLanguage: () => (/* binding */ getLanguage),
/* harmony export */   getLocale: () => (/* binding */ getLocale),
/* harmony export */   getMonthNames: () => (/* binding */ getMonthNames),
/* harmony export */   getMonthNamesShort: () => (/* binding */ getMonthNamesShort),
/* harmony export */   getPlural: () => (/* binding */ getPlural),
/* harmony export */   isRTL: () => (/* binding */ isRTL),
/* harmony export */   loadTranslations: () => (/* binding */ loadTranslations),
/* harmony export */   register: () => (/* binding */ register),
/* harmony export */   translate: () => (/* binding */ translate),
/* harmony export */   translatePlural: () => (/* binding */ translatePlural),
/* harmony export */   unregister: () => (/* binding */ unregister)
/* harmony export */ });
/* harmony import */ var _nextcloud_router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @nextcloud/router */ "../node_modules/@nextcloud/router/dist/index.js");
/* harmony import */ var dompurify__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! dompurify */ "../node_modules/dompurify/dist/purify.js");
/* harmony import */ var escape_html__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! escape-html */ "../node_modules/escape-html/index.js");




/// <reference types="@nextcloud/typings" />
/**
 * Get the first day of the week
 *
 * @return {number}
 */
function getFirstDay() {
    if (typeof window.firstDay === 'undefined') {
        console.warn('No firstDay found');
        return 1;
    }
    return window.firstDay;
}
/**
 * Get a list of day names (full names)
 *
 * @return {string[]}
 */
function getDayNames() {
    if (typeof window.dayNames === 'undefined') {
        console.warn('No dayNames found');
        return [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ];
    }
    return window.dayNames;
}
/**
 * Get a list of day names (short names)
 *
 * @return {string[]}
 */
function getDayNamesShort() {
    if (typeof window.dayNamesShort === 'undefined') {
        console.warn('No dayNamesShort found');
        return ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];
    }
    return window.dayNamesShort;
}
/**
 * Get a list of day names (minified names)
 *
 * @return {string[]}
 */
function getDayNamesMin() {
    if (typeof window.dayNamesMin === 'undefined') {
        console.warn('No dayNamesMin found');
        return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    }
    return window.dayNamesMin;
}
/**
 * Get a list of month names (full names)
 *
 * @return {string[]}
 */
function getMonthNames() {
    if (typeof window.monthNames === 'undefined') {
        console.warn('No monthNames found');
        return [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
    }
    return window.monthNames;
}
/**
 * Get a list of month names (short names)
 *
 * @return {string[]}
 */
function getMonthNamesShort() {
    if (typeof window.monthNamesShort === 'undefined') {
        console.warn('No monthNamesShort found');
        return [
            'Jan.',
            'Feb.',
            'Mar.',
            'Apr.',
            'May.',
            'Jun.',
            'Jul.',
            'Aug.',
            'Sep.',
            'Oct.',
            'Nov.',
            'Dec.',
        ];
    }
    return window.monthNamesShort;
}

/**
 * Returns the user's locale
 */
function getLocale() {
    return document.documentElement.dataset.locale || 'en';
}
/**
 * Returns user's locale in canonical form
 * E.g. `en-US` instead of `en_US`
 */
function getCanonicalLocale() {
    return getLocale().replace(/_/g, '-');
}
/**
 * Returns the user's language
 */
function getLanguage() {
    return document.documentElement.lang || 'en';
}
/**
 * Check whether the current, or a given, language is read right-to-left
 *
 * @param language Language code to check, defaults to current language
 */
function isRTL(language) {
    const languageCode = language || getLanguage();
    // Source: https://meta.wikimedia.org/wiki/Template:List_of_language_names_ordered_by_code
    const rtlLanguages = [
        /* eslint-disable no-multi-spaces */
        'ae',
        'ar',
        'arc',
        'arz',
        'bcc',
        'bqi',
        'ckb',
        'dv',
        'fa',
        'glk',
        'ha',
        'he',
        'khw',
        'ks',
        'ku',
        'mzn',
        'nqo',
        'pnb',
        'ps',
        'sd',
        'ug',
        'ur',
        'uzs',
        'yi', // 'ייִדיש', Yiddish
        /* eslint-enable no-multi-spaces */
    ];
    // special case for Uzbek Afghan
    if ((language || getCanonicalLocale()).startsWith('uz-AF')) {
        return true;
    }
    return rtlLanguages.includes(languageCode);
}

/// <reference types="@nextcloud/typings" />
/**
 * Check if translations and plural function are set for given app
 *
 * @param {string} appId the app id
 * @return {boolean}
 */
function hasAppTranslations(appId) {
    var _a, _b;
    return (((_a = window._oc_l10n_registry_translations) === null || _a === void 0 ? void 0 : _a[appId]) !== undefined
        && ((_b = window._oc_l10n_registry_plural_functions) === null || _b === void 0 ? void 0 : _b[appId]) !== undefined);
}
/**
 * Register new, or extend available, translations for an app
 *
 * @param {string} appId the app id
 * @param {object} translations the translations list
 * @param {Function} pluralFunction the plural function
 */
function registerAppTranslations(appId, translations, pluralFunction) {
    var _a;
    window._oc_l10n_registry_translations = Object.assign(window._oc_l10n_registry_translations || {}, {
        [appId]: Object.assign(((_a = window._oc_l10n_registry_translations) === null || _a === void 0 ? void 0 : _a[appId]) || {}, translations),
    });
    window._oc_l10n_registry_plural_functions = Object.assign(window._oc_l10n_registry_plural_functions || {}, {
        [appId]: pluralFunction,
    });
}
/**
 * Unregister all translations and plural function for given app
 *
 * @param {string} appId the app id
 */
function unregisterAppTranslations(appId) {
    var _a, _b;
    (_a = window._oc_l10n_registry_translations) === null || _a === void 0 ? true : delete _a[appId];
    (_b = window._oc_l10n_registry_plural_functions) === null || _b === void 0 ? true : delete _b[appId];
}
/**
 * Get translations bundle for given app and current locale
 *
 * @param {string} appId the app id
 * @return {object}
 */
function getAppTranslations(appId) {
    var _a, _b, _c, _d;
    return {
        translations: (_b = (_a = window._oc_l10n_registry_translations) === null || _a === void 0 ? void 0 : _a[appId]) !== null && _b !== void 0 ? _b : {},
        pluralFunction: (_d = (_c = window._oc_l10n_registry_plural_functions) === null || _c === void 0 ? void 0 : _c[appId]) !== null && _d !== void 0 ? _d : ((number) => number),
    };
}

/**
 * Translate a string
 *
 * @param {string} app the id of the app for which to translate the string
 * @param {string} text the string to translate
 * @param {object} vars map of placeholder key to value
 * @param {number} number to replace %n with
 * @param {object} [options] options object
 * @return {string}
 */
function translate(app, text, vars, number, options) {
    const defaultOptions = {
        escape: true,
        sanitize: true,
    };
    const allOptions = Object.assign({}, defaultOptions, options || {});
    const identity = (value) => value;
    const optSanitize = allOptions.sanitize ? dompurify__WEBPACK_IMPORTED_MODULE_1__.sanitize : identity;
    const optEscape = allOptions.escape ? escape_html__WEBPACK_IMPORTED_MODULE_2__ : identity;
    // TODO: cache this function to avoid inline recreation
    // of the same function over and over again in case
    // translate() is used in a loop
    const _build = (text, vars, number) => {
        return text.replace(/%n/g, '' + number).replace(/{([^{}]*)}/g, (match, key) => {
            if (vars === undefined || !(key in vars)) {
                return optSanitize(match);
            }
            const r = vars[key];
            if (typeof r === 'string' || typeof r === 'number') {
                return optSanitize(optEscape(r));
            }
            else {
                return optSanitize(match);
            }
        });
    };
    const bundle = getAppTranslations(app);
    let translation = bundle.translations[text] || text;
    translation = Array.isArray(translation) ? translation[0] : translation;
    if (typeof vars === 'object' || number !== undefined) {
        return optSanitize(_build(translation, vars, number));
    }
    else {
        return optSanitize(translation);
    }
}
/**
 * Translate a string containing an object which possibly requires a plural form
 *
 * @param {string} app the id of the app for which to translate the string
 * @param {string} textSingular the string to translate for exactly one object
 * @param {string} textPlural the string to translate for n objects
 * @param {number} number number to determine whether to use singular or plural
 * @param {object} vars of placeholder key to value
 * @param {object} options options object
 */
function translatePlural(app, textSingular, textPlural, number, vars, options) {
    const identifier = '_' + textSingular + '_::_' + textPlural + '_';
    const bundle = getAppTranslations(app);
    const value = bundle.translations[identifier];
    if (typeof value !== 'undefined') {
        const translation = value;
        if (Array.isArray(translation)) {
            const plural = bundle.pluralFunction(number);
            return translate(app, translation[plural], vars, number, options);
        }
    }
    if (number === 1) {
        return translate(app, textSingular, vars, number, options);
    }
    else {
        return translate(app, textPlural, vars, number, options);
    }
}
/**
 * Load an app's translation bundle if not loaded already.
 *
 * @param {string} appName name of the app
 * @param {Function} callback callback to be called when
 * the translations are loaded
 * @return {Promise} promise
 */
function loadTranslations(appName, callback) {
    if (hasAppTranslations(appName) || getLocale() === 'en') {
        return Promise.resolve().then(callback);
    }
    const url = (0,_nextcloud_router__WEBPACK_IMPORTED_MODULE_0__.generateFilePath)(appName, 'l10n', getLocale() + '.json');
    const promise = new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onerror = () => {
            reject(new Error(request.statusText || 'Network error'));
        };
        request.onload = () => {
            if (request.status >= 200 && request.status < 300) {
                try {
                    const bundle = JSON.parse(request.responseText);
                    if (typeof bundle.translations === 'object')
                        resolve(bundle);
                }
                catch (error) {
                    // error is probably a SyntaxError due to invalid response text, this is handled by next line
                }
                reject(new Error('Invalid content of translation bundle'));
            }
            else {
                reject(new Error(request.statusText));
            }
        };
        request.send();
    });
    // load JSON translation bundle per AJAX
    return promise
        .then((result) => {
        register(appName, result.translations);
        return result;
    })
        .then(callback);
}
/**
 * Register an app's translation bundle.
 *
 * @param {string} appName name of the app
 * @param {Object<string, string>} bundle translation bundle
 */
function register(appName, bundle) {
    registerAppTranslations(appName, bundle, getPlural);
}
/**
 * Unregister all translations of an app
 *
 * @param appName name of the app
 * @since 2.1.0
 */
function unregister(appName) {
    return unregisterAppTranslations(appName);
}
/**
 * Get array index of translations for a plural form
 *
 *
 * @param {number} number the number of elements
 * @return {number} 0 for the singular form(, 1 for the first plural form, ...)
 */
function getPlural(number) {
    let language = getLanguage();
    if (language === 'pt-BR') {
        // temporary set a locale for brazilian
        language = 'xbr';
    }
    if (language.length > 3) {
        language = language.substring(0, language.lastIndexOf('-'));
    }
    /*
     * The plural rules are derived from code of the Zend Framework (2010-09-25),
     * which is subject to the new BSD license (http://framework.zend.com/license/new-bsd).
     * Copyright (c) 2005-2010 Zend Technologies USA Inc. (http://www.zend.com)
     */
    switch (language) {
        case 'az':
        case 'bo':
        case 'dz':
        case 'id':
        case 'ja':
        case 'jv':
        case 'ka':
        case 'km':
        case 'kn':
        case 'ko':
        case 'ms':
        case 'th':
        case 'tr':
        case 'vi':
        case 'zh':
            return 0;
        case 'af':
        case 'bn':
        case 'bg':
        case 'ca':
        case 'da':
        case 'de':
        case 'el':
        case 'en':
        case 'eo':
        case 'es':
        case 'et':
        case 'eu':
        case 'fa':
        case 'fi':
        case 'fo':
        case 'fur':
        case 'fy':
        case 'gl':
        case 'gu':
        case 'ha':
        case 'he':
        case 'hu':
        case 'is':
        case 'it':
        case 'ku':
        case 'lb':
        case 'ml':
        case 'mn':
        case 'mr':
        case 'nah':
        case 'nb':
        case 'ne':
        case 'nl':
        case 'nn':
        case 'no':
        case 'oc':
        case 'om':
        case 'or':
        case 'pa':
        case 'pap':
        case 'ps':
        case 'pt':
        case 'so':
        case 'sq':
        case 'sv':
        case 'sw':
        case 'ta':
        case 'te':
        case 'tk':
        case 'ur':
        case 'zu':
            return number === 1 ? 0 : 1;
        case 'am':
        case 'bh':
        case 'fil':
        case 'fr':
        case 'gun':
        case 'hi':
        case 'hy':
        case 'ln':
        case 'mg':
        case 'nso':
        case 'xbr':
        case 'ti':
        case 'wa':
            return number === 0 || number === 1 ? 0 : 1;
        case 'be':
        case 'bs':
        case 'hr':
        case 'ru':
        case 'sh':
        case 'sr':
        case 'uk':
            return number % 10 === 1 && number % 100 !== 11
                ? 0
                : number % 10 >= 2
                    && number % 10 <= 4
                    && (number % 100 < 10 || number % 100 >= 20)
                    ? 1
                    : 2;
        case 'cs':
        case 'sk':
            return number === 1 ? 0 : number >= 2 && number <= 4 ? 1 : 2;
        case 'ga':
            return number === 1 ? 0 : number === 2 ? 1 : 2;
        case 'lt':
            return number % 10 === 1 && number % 100 !== 11
                ? 0
                : number % 10 >= 2 && (number % 100 < 10 || number % 100 >= 20)
                    ? 1
                    : 2;
        case 'sl':
            return number % 100 === 1
                ? 0
                : number % 100 === 2
                    ? 1
                    : number % 100 === 3 || number % 100 === 4
                        ? 2
                        : 3;
        case 'mk':
            return number % 10 === 1 ? 0 : 1;
        case 'mt':
            return number === 1
                ? 0
                : number === 0 || (number % 100 > 1 && number % 100 < 11)
                    ? 1
                    : number % 100 > 10 && number % 100 < 20
                        ? 2
                        : 3;
        case 'lv':
            return number === 0
                ? 0
                : number % 10 === 1 && number % 100 !== 11
                    ? 1
                    : 2;
        case 'pl':
            return number === 1
                ? 0
                : number % 10 >= 2
                    && number % 10 <= 4
                    && (number % 100 < 12 || number % 100 > 14)
                    ? 1
                    : 2;
        case 'cy':
            return number === 1
                ? 0
                : number === 2
                    ? 1
                    : number === 8 || number === 11
                        ? 2
                        : 3;
        case 'ro':
            return number === 1
                ? 0
                : number === 0 || (number % 100 > 0 && number % 100 < 20)
                    ? 1
                    : 2;
        case 'ar':
            return number === 0
                ? 0
                : number === 1
                    ? 1
                    : number === 2
                        ? 2
                        : number % 100 >= 3 && number % 100 <= 10
                            ? 3
                            : number % 100 >= 11 && number % 100 <= 99
                                ? 4
                                : 5;
        default:
            return 0;
    }
}




/***/ }),

/***/ "../node_modules/webdav/dist/web/index.js":
/*!************************************************!*\
  !*** ../node_modules/webdav/dist/web/index.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AuthType: () => (/* binding */ o),
/* harmony export */   ErrorCode: () => (/* binding */ i),
/* harmony export */   Request: () => (/* binding */ a),
/* harmony export */   Response: () => (/* binding */ s),
/* harmony export */   createClient: () => (/* binding */ u),
/* harmony export */   getPatcher: () => (/* binding */ c),
/* harmony export */   parseStat: () => (/* binding */ l),
/* harmony export */   parseXML: () => (/* binding */ f),
/* harmony export */   processResponsePayload: () => (/* binding */ h),
/* harmony export */   translateDiskSpace: () => (/* binding */ p)
/* harmony export */ });
/* provided dependency */ var process = __webpack_require__(/*! process/browser.js */ "../node_modules/process/browser.js");
/*! For license information please see index.js.LICENSE.txt */
var t={584:t=>{function e(t,e,o){t instanceof RegExp&&(t=r(t,o)),e instanceof RegExp&&(e=r(e,o));var i=n(t,e,o);return i&&{start:i[0],end:i[1],pre:o.slice(0,i[0]),body:o.slice(i[0]+t.length,i[1]),post:o.slice(i[1]+e.length)}}function r(t,e){var r=e.match(t);return r?r[0]:null}function n(t,e,r){var n,o,i,a,s,u=r.indexOf(t),c=r.indexOf(e,u+1),l=u;if(u>=0&&c>0){for(n=[],i=r.length;l>=0&&!s;)l==u?(n.push(l),u=r.indexOf(t,l+1)):1==n.length?s=[n.pop(),c]:((o=n.pop())<i&&(i=o,a=c),c=r.indexOf(e,l+1)),l=u<c&&u>=0?u:c;n.length&&(s=[i,a])}return s}t.exports=e,e.range=n},146:function(t,e,r){var n;function o(t){return o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},o(t)}t=r.nmd(t),function(i){var a="object"==o(e)&&e,s="object"==o(t)&&t&&t.exports==a&&t,u="object"==("undefined"==typeof global?"undefined":o(global))&&global;u.global!==u&&u.window!==u||(i=u);var c=function(t){this.message=t};(c.prototype=new Error).name="InvalidCharacterError";var l=function(t){throw new c(t)},f="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",h=/[\t\n\f\r ]/g,p={encode:function(t){t=String(t),/[^\0-\xFF]/.test(t)&&l("The string to be encoded contains characters outside of the Latin1 range.");for(var e,r,n,o,i=t.length%3,a="",s=-1,u=t.length-i;++s<u;)e=t.charCodeAt(s)<<16,r=t.charCodeAt(++s)<<8,n=t.charCodeAt(++s),a+=f.charAt((o=e+r+n)>>18&63)+f.charAt(o>>12&63)+f.charAt(o>>6&63)+f.charAt(63&o);return 2==i?(e=t.charCodeAt(s)<<8,r=t.charCodeAt(++s),a+=f.charAt((o=e+r)>>10)+f.charAt(o>>4&63)+f.charAt(o<<2&63)+"="):1==i&&(o=t.charCodeAt(s),a+=f.charAt(o>>2)+f.charAt(o<<4&63)+"=="),a},decode:function(t){var e=(t=String(t).replace(h,"")).length;e%4==0&&(e=(t=t.replace(/==?$/,"")).length),(e%4==1||/[^+a-zA-Z0-9/]/.test(t))&&l("Invalid character: the string to be decoded is not correctly encoded.");for(var r,n,o=0,i="",a=-1;++a<e;)n=f.indexOf(t.charAt(a)),r=o%4?64*r+n:n,o++%4&&(i+=String.fromCharCode(255&r>>(-2*o&6)));return i},version:"1.0.0"};if("object"==o(r.amdO)&&r.amdO)void 0===(n=function(){return p}.call(e,r,e,t))||(t.exports=n);else if(a&&!a.nodeType)if(s)s.exports=p;else for(var d in p)p.hasOwnProperty(d)&&(a[d]=p[d]);else i.base64=p}(this)},918:(t,e)=>{e.k=function(t){if(!t)return 0;for(var e=(t=t.toString()).length,r=t.length;r--;){var n=t.charCodeAt(r);56320<=n&&n<=57343&&r--,127<n&&n<=2047?e++:2047<n&&n<=65535&&(e+=2)}return e}},106:t=>{var e={utf8:{stringToBytes:function(t){return e.bin.stringToBytes(unescape(encodeURIComponent(t)))},bytesToString:function(t){return decodeURIComponent(escape(e.bin.bytesToString(t)))}},bin:{stringToBytes:function(t){for(var e=[],r=0;r<t.length;r++)e.push(255&t.charCodeAt(r));return e},bytesToString:function(t){for(var e=[],r=0;r<t.length;r++)e.push(String.fromCharCode(t[r]));return e.join("")}}};t.exports=e},718:t=>{var e,r;e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",r={rotl:function(t,e){return t<<e|t>>>32-e},rotr:function(t,e){return t<<32-e|t>>>e},endian:function(t){if(t.constructor==Number)return 16711935&r.rotl(t,8)|4278255360&r.rotl(t,24);for(var e=0;e<t.length;e++)t[e]=r.endian(t[e]);return t},randomBytes:function(t){for(var e=[];t>0;t--)e.push(Math.floor(256*Math.random()));return e},bytesToWords:function(t){for(var e=[],r=0,n=0;r<t.length;r++,n+=8)e[n>>>5]|=t[r]<<24-n%32;return e},wordsToBytes:function(t){for(var e=[],r=0;r<32*t.length;r+=8)e.push(t[r>>>5]>>>24-r%32&255);return e},bytesToHex:function(t){for(var e=[],r=0;r<t.length;r++)e.push((t[r]>>>4).toString(16)),e.push((15&t[r]).toString(16));return e.join("")},hexToBytes:function(t){for(var e=[],r=0;r<t.length;r+=2)e.push(parseInt(t.substr(r,2),16));return e},bytesToBase64:function(t){for(var r=[],n=0;n<t.length;n+=3)for(var o=t[n]<<16|t[n+1]<<8|t[n+2],i=0;i<4;i++)8*n+6*i<=8*t.length?r.push(e.charAt(o>>>6*(3-i)&63)):r.push("=");return r.join("")},base64ToBytes:function(t){t=t.replace(/[^A-Z0-9+\/]/gi,"");for(var r=[],n=0,o=0;n<t.length;o=++n%4)0!=o&&r.push((e.indexOf(t.charAt(n-1))&Math.pow(2,-2*o+8)-1)<<2*o|e.indexOf(t.charAt(n))>>>6-2*o);return r}},t.exports=r},5:(t,e,r)=>{var n=r(135),o=r(586),i=r(39);t.exports={XMLParser:o,XMLValidator:n,XMLBuilder:i}},410:(t,e)=>{var r=":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD",n="["+r+"]["+r+"\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*",o=new RegExp("^"+n+"$");e.isExist=function(t){return void 0!==t},e.isEmptyObject=function(t){return 0===Object.keys(t).length},e.merge=function(t,e,r){if(e)for(var n=Object.keys(e),o=n.length,i=0;i<o;i++)t[n[i]]="strict"===r?[e[n[i]]]:e[n[i]]},e.getValue=function(t){return e.isExist(t)?t:""},e.isName=function(t){return!(null==o.exec(t))},e.getAllMatches=function(t,e){for(var r=[],n=e.exec(t);n;){var o=[];o.startIndex=e.lastIndex-n[0].length;for(var i=n.length,a=0;a<i;a++)o.push(n[a]);r.push(o),n=e.exec(t)}return r},e.nameRegexp=n},135:(t,e,r)=>{var n=r(410),o={allowBooleanAttributes:!1,unpairedTags:[]};function i(t){return" "===t||"\t"===t||"\n"===t||"\r"===t}function a(t,e){for(var r=e;e<t.length;e++)if("?"!=t[e]&&" "!=t[e]);else{var n=t.substr(r,e-r);if(e>5&&"xml"===n)return d("InvalidXml","XML declaration allowed only at the start of the document.",v(t,e));if("?"==t[e]&&">"==t[e+1]){e++;break}}return e}function s(t,e){if(t.length>e+5&&"-"===t[e+1]&&"-"===t[e+2]){for(e+=3;e<t.length;e++)if("-"===t[e]&&"-"===t[e+1]&&">"===t[e+2]){e+=2;break}}else if(t.length>e+8&&"D"===t[e+1]&&"O"===t[e+2]&&"C"===t[e+3]&&"T"===t[e+4]&&"Y"===t[e+5]&&"P"===t[e+6]&&"E"===t[e+7]){var r=1;for(e+=8;e<t.length;e++)if("<"===t[e])r++;else if(">"===t[e]&&0==--r)break}else if(t.length>e+9&&"["===t[e+1]&&"C"===t[e+2]&&"D"===t[e+3]&&"A"===t[e+4]&&"T"===t[e+5]&&"A"===t[e+6]&&"["===t[e+7])for(e+=8;e<t.length;e++)if("]"===t[e]&&"]"===t[e+1]&&">"===t[e+2]){e+=2;break}return e}e.validate=function(t,e){e=Object.assign({},o,e);var r,u=[],c=!1,f=!1;"\ufeff"===t[0]&&(t=t.substr(1));for(var g=0;g<t.length;g++)if("<"===t[g]&&"?"===t[g+1]){if((g=a(t,g+=2)).err)return g}else{if("<"!==t[g]){if(i(t[g]))continue;return d("InvalidChar","char '"+t[g]+"' is not expected.",v(t,g))}var y=g;if("!"===t[++g]){g=s(t,g);continue}var m=!1;"/"===t[g]&&(m=!0,g++);for(var b="";g<t.length&&">"!==t[g]&&" "!==t[g]&&"\t"!==t[g]&&"\n"!==t[g]&&"\r"!==t[g];g++)b+=t[g];if("/"===(b=b.trim())[b.length-1]&&(b=b.substring(0,b.length-1),g--),r=b,!n.isName(r))return d("InvalidTag",0===b.trim().length?"Invalid space after '<'.":"Tag '"+b+"' is an invalid name.",v(t,g));var w=l(t,g);if(!1===w)return d("InvalidAttr","Attributes for '"+b+"' have open quote.",v(t,g));var x=w.value;if(g=w.index,"/"===x[x.length-1]){var O=g-x.length,A=h(x=x.substring(0,x.length-1),e);if(!0!==A)return d(A.err.code,A.err.msg,v(t,O+A.err.line));c=!0}else if(m){if(!w.tagClosed)return d("InvalidTag","Closing tag '"+b+"' doesn't have proper closing.",v(t,g));if(x.trim().length>0)return d("InvalidTag","Closing tag '"+b+"' can't have attributes or invalid starting.",v(t,y));var j=u.pop();if(b!==j.tagName){var P=v(t,j.tagStartPos);return d("InvalidTag","Expected closing tag '"+j.tagName+"' (opened in line "+P.line+", col "+P.col+") instead of closing tag '"+b+"'.",v(t,y))}0==u.length&&(f=!0)}else{var S=h(x,e);if(!0!==S)return d(S.err.code,S.err.msg,v(t,g-x.length+S.err.line));if(!0===f)return d("InvalidXml","Multiple possible root nodes found.",v(t,g));-1!==e.unpairedTags.indexOf(b)||u.push({tagName:b,tagStartPos:y}),c=!0}for(g++;g<t.length;g++)if("<"===t[g]){if("!"===t[g+1]){g=s(t,++g);continue}if("?"!==t[g+1])break;if((g=a(t,++g)).err)return g}else if("&"===t[g]){var E=p(t,g);if(-1==E)return d("InvalidChar","char '&' is not expected.",v(t,g));g=E}else if(!0===f&&!i(t[g]))return d("InvalidXml","Extra text at the end",v(t,g));"<"===t[g]&&g--}return c?1==u.length?d("InvalidTag","Unclosed tag '"+u[0].tagName+"'.",v(t,u[0].tagStartPos)):!(u.length>0)||d("InvalidXml","Invalid '"+JSON.stringify(u.map((function(t){return t.tagName})),null,4).replace(/\r?\n/g,"")+"' found.",{line:1,col:1}):d("InvalidXml","Start tag expected.",1)};var u='"',c="'";function l(t,e){for(var r="",n="",o=!1;e<t.length;e++){if(t[e]===u||t[e]===c)""===n?n=t[e]:n!==t[e]||(n="");else if(">"===t[e]&&""===n){o=!0;break}r+=t[e]}return""===n&&{value:r,index:e,tagClosed:o}}var f=new RegExp("(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['\"])(([\\s\\S])*?)\\5)?","g");function h(t,e){for(var r=n.getAllMatches(t,f),o={},i=0;i<r.length;i++){if(0===r[i][1].length)return d("InvalidAttr","Attribute '"+r[i][2]+"' has no space in starting.",y(r[i]));if(void 0!==r[i][3]&&void 0===r[i][4])return d("InvalidAttr","Attribute '"+r[i][2]+"' is without value.",y(r[i]));if(void 0===r[i][3]&&!e.allowBooleanAttributes)return d("InvalidAttr","boolean attribute '"+r[i][2]+"' is not allowed.",y(r[i]));var a=r[i][2];if(!g(a))return d("InvalidAttr","Attribute '"+a+"' is an invalid name.",y(r[i]));if(o.hasOwnProperty(a))return d("InvalidAttr","Attribute '"+a+"' is repeated.",y(r[i]));o[a]=1}return!0}function p(t,e){if(";"===t[++e])return-1;if("#"===t[e])return function(t,e){var r=/\d/;for("x"===t[e]&&(e++,r=/[\da-fA-F]/);e<t.length;e++){if(";"===t[e])return e;if(!t[e].match(r))break}return-1}(t,++e);for(var r=0;e<t.length;e++,r++)if(!(t[e].match(/\w/)&&r<20)){if(";"===t[e])break;return-1}return e}function d(t,e,r){return{err:{code:t,msg:e,line:r.line||r,col:r.col}}}function g(t){return n.isName(t)}function v(t,e){var r=t.substring(0,e).split(/\r?\n/);return{line:r.length,col:r[r.length-1].length+1}}function y(t){return t.startIndex+t[1].length}},39:(t,e,r)=>{function n(t){return n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},n(t)}var o=r(354),i={attributeNamePrefix:"@_",attributesGroupName:!1,textNodeName:"#text",ignoreAttributes:!0,cdataPropName:!1,format:!1,indentBy:"  ",suppressEmptyNode:!1,suppressUnpairedNode:!0,suppressBooleanAttributes:!0,tagValueProcessor:function(t,e){return e},attributeValueProcessor:function(t,e){return e},preserveOrder:!1,commentPropName:!1,unpairedTags:[],entities:[{regex:new RegExp("&","g"),val:"&amp;"},{regex:new RegExp(">","g"),val:"&gt;"},{regex:new RegExp("<","g"),val:"&lt;"},{regex:new RegExp("'","g"),val:"&apos;"},{regex:new RegExp('"',"g"),val:"&quot;"}],processEntities:!0,stopNodes:[],oneListGroup:!1};function a(t){this.options=Object.assign({},i,t),this.options.ignoreAttributes||this.options.attributesGroupName?this.isAttribute=function(){return!1}:(this.attrPrefixLen=this.options.attributeNamePrefix.length,this.isAttribute=c),this.processTextOrObjNode=s,this.options.format?(this.indentate=u,this.tagEndChar=">\n",this.newLine="\n"):(this.indentate=function(){return""},this.tagEndChar=">",this.newLine="")}function s(t,e,r){var n=this.j2x(t,r+1);return void 0!==t[this.options.textNodeName]&&1===Object.keys(t).length?this.buildTextValNode(t[this.options.textNodeName],e,n.attrStr,r):this.buildObjectNode(n.val,e,n.attrStr,r)}function u(t){return this.options.indentBy.repeat(t)}function c(t){return!(!t.startsWith(this.options.attributeNamePrefix)||t===this.options.textNodeName)&&t.substr(this.attrPrefixLen)}a.prototype.build=function(t){return this.options.preserveOrder?o(t,this.options):(Array.isArray(t)&&this.options.arrayNodeName&&this.options.arrayNodeName.length>1&&(e={},n=t,(r=this.options.arrayNodeName)in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,t=e),this.j2x(t,0).val);var e,r,n},a.prototype.j2x=function(t,e){var r="",o="";for(var i in t)if(void 0===t[i])this.isAttribute(i)&&(o+="");else if(null===t[i])this.isAttribute(i)?o+="":"?"===i[0]?o+=this.indentate(e)+"<"+i+"?"+this.tagEndChar:o+=this.indentate(e)+"<"+i+"/"+this.tagEndChar;else if(t[i]instanceof Date)o+=this.buildTextValNode(t[i],i,"",e);else if("object"!==n(t[i])){var a=this.isAttribute(i);if(a)r+=this.buildAttrPairStr(a,""+t[i]);else if(i===this.options.textNodeName){var s=this.options.tagValueProcessor(i,""+t[i]);o+=this.replaceEntitiesValue(s)}else o+=this.buildTextValNode(t[i],i,"",e)}else if(Array.isArray(t[i])){for(var u=t[i].length,c="",l=0;l<u;l++){var f=t[i][l];void 0===f||(null===f?"?"===i[0]?o+=this.indentate(e)+"<"+i+"?"+this.tagEndChar:o+=this.indentate(e)+"<"+i+"/"+this.tagEndChar:"object"===n(f)?this.options.oneListGroup?c+=this.j2x(f,e+1).val:c+=this.processTextOrObjNode(f,i,e):c+=this.buildTextValNode(f,i,"",e))}this.options.oneListGroup&&(c=this.buildObjectNode(c,i,"",e)),o+=c}else if(this.options.attributesGroupName&&i===this.options.attributesGroupName)for(var h=Object.keys(t[i]),p=h.length,d=0;d<p;d++)r+=this.buildAttrPairStr(h[d],""+t[i][h[d]]);else o+=this.processTextOrObjNode(t[i],i,e);return{attrStr:r,val:o}},a.prototype.buildAttrPairStr=function(t,e){return e=this.options.attributeValueProcessor(t,""+e),e=this.replaceEntitiesValue(e),this.options.suppressBooleanAttributes&&"true"===e?" "+t:" "+t+'="'+e+'"'},a.prototype.buildObjectNode=function(t,e,r,n){if(""===t)return"?"===e[0]?this.indentate(n)+"<"+e+r+"?"+this.tagEndChar:this.indentate(n)+"<"+e+r+this.closeTag(e)+this.tagEndChar;var o="</"+e+this.tagEndChar,i="";return"?"===e[0]&&(i="?",o=""),!r&&""!==r||-1!==t.indexOf("<")?!1!==this.options.commentPropName&&e===this.options.commentPropName&&0===i.length?this.indentate(n)+"\x3c!--".concat(t,"--\x3e")+this.newLine:this.indentate(n)+"<"+e+r+i+this.tagEndChar+t+this.indentate(n)+o:this.indentate(n)+"<"+e+r+i+">"+t+o},a.prototype.closeTag=function(t){var e="";return-1!==this.options.unpairedTags.indexOf(t)?this.options.suppressUnpairedNode||(e="/"):e=this.options.suppressEmptyNode?"/":"></".concat(t),e},a.prototype.buildTextValNode=function(t,e,r,n){if(!1!==this.options.cdataPropName&&e===this.options.cdataPropName)return this.indentate(n)+"<![CDATA[".concat(t,"]]>")+this.newLine;if(!1!==this.options.commentPropName&&e===this.options.commentPropName)return this.indentate(n)+"\x3c!--".concat(t,"--\x3e")+this.newLine;if("?"===e[0])return this.indentate(n)+"<"+e+r+"?"+this.tagEndChar;var o=this.options.tagValueProcessor(e,t);return""===(o=this.replaceEntitiesValue(o))?this.indentate(n)+"<"+e+r+this.closeTag(e)+this.tagEndChar:this.indentate(n)+"<"+e+r+">"+o+"</"+e+this.tagEndChar},a.prototype.replaceEntitiesValue=function(t){if(t&&t.length>0&&this.options.processEntities)for(var e=0;e<this.options.entities.length;e++){var r=this.options.entities[e];t=t.replace(r.regex,r.val)}return t},t.exports=a},354:t=>{function e(t,a,s,u){for(var c="",l=!1,f=0;f<t.length;f++){var h,p=t[f],d=r(p);if(h=0===s.length?d:"".concat(s,".").concat(d),d!==a.textNodeName)if(d!==a.cdataPropName)if(d!==a.commentPropName)if("?"!==d[0]){var g=u;""!==g&&(g+=a.indentBy);var v=n(p[":@"],a),y=u+"<".concat(d).concat(v),m=e(p[d],a,h,g);-1!==a.unpairedTags.indexOf(d)?a.suppressUnpairedNode?c+=y+">":c+=y+"/>":m&&0!==m.length||!a.suppressEmptyNode?m&&m.endsWith(">")?c+=y+">".concat(m).concat(u,"</").concat(d,">"):(c+=y+">",m&&""!==u&&(m.includes("/>")||m.includes("</"))?c+=u+a.indentBy+m+u:c+=m,c+="</".concat(d,">")):c+=y+"/>",l=!0}else{var b=n(p[":@"],a),w="?xml"===d?"":u,x=p[d][0][a.textNodeName];x=0!==x.length?" "+x:"",c+=w+"<".concat(d).concat(x).concat(b,"?>"),l=!0}else c+=u+"\x3c!--".concat(p[d][0][a.textNodeName],"--\x3e"),l=!0;else l&&(c+=u),c+="<![CDATA[".concat(p[d][0][a.textNodeName],"]]>"),l=!1;else{var O=p[d];o(h,a)||(O=i(O=a.tagValueProcessor(d,O),a)),l&&(c+=u),c+=O,l=!1}}return c}function r(t){for(var e=Object.keys(t),r=0;r<e.length;r++){var n=e[r];if(":@"!==n)return n}}function n(t,e){var r="";if(t&&!e.ignoreAttributes)for(var n in t){var o=e.attributeValueProcessor(n,t[n]);!0===(o=i(o,e))&&e.suppressBooleanAttributes?r+=" ".concat(n.substr(e.attributeNamePrefix.length)):r+=" ".concat(n.substr(e.attributeNamePrefix.length),'="').concat(o,'"')}return r}function o(t,e){var r=(t=t.substr(0,t.length-e.textNodeName.length-1)).substr(t.lastIndexOf(".")+1);for(var n in e.stopNodes)if(e.stopNodes[n]===t||e.stopNodes[n]==="*."+r)return!0;return!1}function i(t,e){if(t&&t.length>0&&e.processEntities)for(var r=0;r<e.entities.length;r++){var n=e.entities[r];t=t.replace(n.regex,n.val)}return t}t.exports=function(t,r){var n="";return r.format&&r.indentBy.length>0&&(n="\n"),e(t,r,"",n)}},895:(t,e,r)=>{function n(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var r=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=r){var n,o,i=[],a=!0,s=!1;try{for(r=r.call(t);!(a=(n=r.next()).done)&&(i.push(n.value),!e||i.length!==e);a=!0);}catch(t){s=!0,o=t}finally{try{a||null==r.return||r.return()}finally{if(s)throw o}}return i}}(t,e)||function(t,e){if(t){if("string"==typeof t)return o(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?o(t,e):void 0}}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function o(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,n=new Array(e);r<e;r++)n[r]=t[r];return n}var i=r(410);function a(t,e){for(var r="";e<t.length&&"'"!==t[e]&&'"'!==t[e];e++)r+=t[e];if(-1!==(r=r.trim()).indexOf(" "))throw new Error("External entites are not supported");for(var n=t[e++],o="";e<t.length&&t[e]!==n;e++)o+=t[e];return[r,o,e]}function s(t,e){return"!"===t[e+1]&&"-"===t[e+2]&&"-"===t[e+3]}function u(t,e){return"!"===t[e+1]&&"E"===t[e+2]&&"N"===t[e+3]&&"T"===t[e+4]&&"I"===t[e+5]&&"T"===t[e+6]&&"Y"===t[e+7]}function c(t,e){return"!"===t[e+1]&&"E"===t[e+2]&&"L"===t[e+3]&&"E"===t[e+4]&&"M"===t[e+5]&&"E"===t[e+6]&&"N"===t[e+7]&&"T"===t[e+8]}function l(t,e){return"!"===t[e+1]&&"A"===t[e+2]&&"T"===t[e+3]&&"T"===t[e+4]&&"L"===t[e+5]&&"I"===t[e+6]&&"S"===t[e+7]&&"T"===t[e+8]}function f(t,e){return"!"===t[e+1]&&"N"===t[e+2]&&"O"===t[e+3]&&"T"===t[e+4]&&"A"===t[e+5]&&"T"===t[e+6]&&"I"===t[e+7]&&"O"===t[e+8]&&"N"===t[e+9]}function h(t){if(i.isName(t))return t;throw new Error("Invalid entity name ".concat(t))}t.exports=function(t,e){var r={};if("O"!==t[e+3]||"C"!==t[e+4]||"T"!==t[e+5]||"Y"!==t[e+6]||"P"!==t[e+7]||"E"!==t[e+8])throw new Error("Invalid Tag instead of DOCTYPE");e+=9;for(var o=1,i=!1,p=!1;e<t.length;e++)if("<"!==t[e]||p)if(">"===t[e]){if(p?"-"===t[e-1]&&"-"===t[e-2]&&(p=!1,o--):o--,0===o)break}else"["===t[e]?i=!0:t[e];else{if(i&&u(t,e)){var d=n(a(t,(e+=7)+1),3);entityName=d[0],val=d[1],e=d[2],-1===val.indexOf("&")&&(r[h(entityName)]={regx:RegExp("&".concat(entityName,";"),"g"),val})}else if(i&&c(t,e))e+=8;else if(i&&l(t,e))e+=8;else if(i&&f(t,e))e+=9;else{if(!s)throw new Error("Invalid DOCTYPE");p=!0}o++}if(0!==o)throw new Error("Unclosed DOCTYPE");return{entities:r,i:e}}},282:(t,e)=>{var r={preserveOrder:!1,attributeNamePrefix:"@_",attributesGroupName:!1,textNodeName:"#text",ignoreAttributes:!0,removeNSPrefix:!1,allowBooleanAttributes:!1,parseTagValue:!0,parseAttributeValue:!1,trimValues:!0,cdataPropName:!1,numberParseOptions:{hex:!0,leadingZeros:!0,eNotation:!0},tagValueProcessor:function(t,e){return e},attributeValueProcessor:function(t,e){return e},stopNodes:[],alwaysCreateTextNode:!1,isArray:function(){return!1},commentPropName:!1,unpairedTags:[],processEntities:!0,htmlEntities:!1,ignoreDeclaration:!1,ignorePiTags:!1,transformTagName:!1,transformAttributeName:!1,updateTag:function(t,e,r){return t}};e.buildOptions=function(t){return Object.assign({},r,t)},e.defaultOptions=r},502:(t,e,r)=>{function n(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function o(t){return o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},o(t)}function i(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function a(t,e,r){return e&&i(t.prototype,e),r&&i(t,r),Object.defineProperty(t,"prototype",{writable:!1}),t}var s=r(410),u=r(961),c=r(895),l=r(512),f=("<((!\\[CDATA\\[([\\s\\S]*?)(]]>))|((NAME:)?(NAME))([^>]*)>|((\\/)(NAME)\\s*>))([^<]*)".replace(/NAME/g,s.nameRegexp),a((function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.options=e,this.currentNode=null,this.tagsNodeStack=[],this.docTypeEntities={},this.lastEntities={apos:{regex:/&(apos|#39|#x27);/g,val:"'"},gt:{regex:/&(gt|#62|#x3E);/g,val:">"},lt:{regex:/&(lt|#60|#x3C);/g,val:"<"},quot:{regex:/&(quot|#34|#x22);/g,val:'"'}},this.ampEntity={regex:/&(amp|#38|#x26);/g,val:"&"},this.htmlEntities={space:{regex:/&(nbsp|#160);/g,val:" "},cent:{regex:/&(cent|#162);/g,val:"¢"},pound:{regex:/&(pound|#163);/g,val:"£"},yen:{regex:/&(yen|#165);/g,val:"¥"},euro:{regex:/&(euro|#8364);/g,val:"€"},copyright:{regex:/&(copy|#169);/g,val:"©"},reg:{regex:/&(reg|#174);/g,val:"®"},inr:{regex:/&(inr|#8377);/g,val:"₹"}},this.addExternalEntities=h,this.parseXml=y,this.parseTextData=p,this.resolveNameSpace=d,this.buildAttributesMap=v,this.isItStopNode=x,this.replaceEntitiesValue=b,this.readStopNodeData=j,this.saveTextToParentTag=w,this.addChild=m})));function h(t){for(var e=Object.keys(t),r=0;r<e.length;r++){var n=e[r];this.lastEntities[n]={regex:new RegExp("&"+n+";","g"),val:t[n]}}}function p(t,e,r,n,i,a,s){if(void 0!==t&&(this.options.trimValues&&!n&&(t=t.trim()),t.length>0)){s||(t=this.replaceEntitiesValue(t));var u=this.options.tagValueProcessor(e,t,r,i,a);return null==u?t:o(u)!==o(t)||u!==t?u:this.options.trimValues||t.trim()===t?P(t,this.options.parseTagValue,this.options.numberParseOptions):t}}function d(t){if(this.options.removeNSPrefix){var e=t.split(":"),r="/"===t.charAt(0)?"/":"";if("xmlns"===e[0])return"";2===e.length&&(t=r+e[1])}return t}var g=new RegExp("([^\\s=]+)\\s*(=\\s*(['\"])([\\s\\S]*?)\\3)?","gm");function v(t,e,r){if(!this.options.ignoreAttributes&&"string"==typeof t){for(var n=s.getAllMatches(t,g),i=n.length,a={},u=0;u<i;u++){var c=this.resolveNameSpace(n[u][1]),l=n[u][4],f=this.options.attributeNamePrefix+c;if(c.length)if(this.options.transformAttributeName&&(f=this.options.transformAttributeName(f)),"__proto__"===f&&(f="#__proto__"),void 0!==l){this.options.trimValues&&(l=l.trim()),l=this.replaceEntitiesValue(l);var h=this.options.attributeValueProcessor(c,l,e);null==h?a[f]=l:o(h)!==o(l)||h!==l?a[f]=h:a[f]=P(l,this.options.parseAttributeValue,this.options.numberParseOptions)}else this.options.allowBooleanAttributes&&(a[f]=!0)}if(!Object.keys(a).length)return;if(this.options.attributesGroupName){var p={};return p[this.options.attributesGroupName]=a,p}return a}}var y=function(t){t=t.replace(/\r\n?/g,"\n");for(var e=new u("!xml"),r=e,o="",i="",a=0;a<t.length;a++)if("<"===t[a])if("/"===t[a+1]){var s=O(t,">",a,"Closing Tag is not closed."),l=t.substring(a+2,s).trim();if(this.options.removeNSPrefix){var f=l.indexOf(":");-1!==f&&(l=l.substr(f+1))}this.options.transformTagName&&(l=this.options.transformTagName(l)),r&&(o=this.saveTextToParentTag(o,r,i));var h=i.substring(i.lastIndexOf(".")+1);if(l&&-1!==this.options.unpairedTags.indexOf(l))throw new Error("Unpaired tag can not be used as closing tag: </".concat(l,">"));var p=0;h&&-1!==this.options.unpairedTags.indexOf(h)?(p=i.lastIndexOf(".",i.lastIndexOf(".")-1),this.tagsNodeStack.pop()):p=i.lastIndexOf("."),i=i.substring(0,p),r=this.tagsNodeStack.pop(),o="",a=s}else if("?"===t[a+1]){var d=A(t,a,!1,"?>");if(!d)throw new Error("Pi Tag is not closed.");if(o=this.saveTextToParentTag(o,r,i),this.options.ignoreDeclaration&&"?xml"===d.tagName||this.options.ignorePiTags);else{var g=new u(d.tagName);g.add(this.options.textNodeName,""),d.tagName!==d.tagExp&&d.attrExpPresent&&(g[":@"]=this.buildAttributesMap(d.tagExp,i,d.tagName)),this.addChild(r,g,i)}a=d.closeIndex+1}else if("!--"===t.substr(a+1,3)){var v=O(t,"--\x3e",a+4,"Comment is not closed.");if(this.options.commentPropName){var y=t.substring(a+4,v-2);o=this.saveTextToParentTag(o,r,i),r.add(this.options.commentPropName,[n({},this.options.textNodeName,y)])}a=v}else if("!D"===t.substr(a+1,2)){var m=c(t,a);this.docTypeEntities=m.entities,a=m.i}else if("!["===t.substr(a+1,2)){var b=O(t,"]]>",a,"CDATA is not closed.")-2,w=t.substring(a+9,b);if(o=this.saveTextToParentTag(o,r,i),this.options.cdataPropName)r.add(this.options.cdataPropName,[n({},this.options.textNodeName,w)]);else{var x=this.parseTextData(w,r.tagname,i,!0,!1,!0);null==x&&(x=""),r.add(this.options.textNodeName,x)}a=b+2}else{var j=A(t,a,this.options.removeNSPrefix),P=j.tagName,S=j.tagExp,E=j.attrExpPresent,N=j.closeIndex;this.options.transformTagName&&(P=this.options.transformTagName(P)),r&&o&&"!xml"!==r.tagname&&(o=this.saveTextToParentTag(o,r,i,!1));var T=r;if(T&&-1!==this.options.unpairedTags.indexOf(T.tagname)&&(r=this.tagsNodeStack.pop(),i=i.substring(0,i.lastIndexOf("."))),P!==e.tagname&&(i+=i?"."+P:P),this.isItStopNode(this.options.stopNodes,i,P)){var k="";if(S.length>0&&S.lastIndexOf("/")===S.length-1)a=j.closeIndex;else if(-1!==this.options.unpairedTags.indexOf(P))a=j.closeIndex;else{var C=this.readStopNodeData(t,P,N+1);if(!C)throw new Error("Unexpected end of ".concat(P));a=C.i,k=C.tagContent}var I=new u(P);P!==S&&E&&(I[":@"]=this.buildAttributesMap(S,i,P)),k&&(k=this.parseTextData(k,P,i,!0,E,!0,!0)),i=i.substr(0,i.lastIndexOf(".")),I.add(this.options.textNodeName,k),this.addChild(r,I,i)}else{if(S.length>0&&S.lastIndexOf("/")===S.length-1){"/"===P[P.length-1]?(P=P.substr(0,P.length-1),i=i.substr(0,i.length-1),S=P):S=S.substr(0,S.length-1),this.options.transformTagName&&(P=this.options.transformTagName(P));var _=new u(P);P!==S&&E&&(_[":@"]=this.buildAttributesMap(S,i,P)),this.addChild(r,_,i),i=i.substr(0,i.lastIndexOf("."))}else{var R=new u(P);this.tagsNodeStack.push(r),P!==S&&E&&(R[":@"]=this.buildAttributesMap(S,i,P)),this.addChild(r,R,i),r=R}o="",a=N}}else o+=t[a];return e.child};function m(t,e,r){var n=this.options.updateTag(e.tagname,r,e[":@"]);!1===n||("string"==typeof n?(e.tagname=n,t.addChild(e)):t.addChild(e))}var b=function(t){if(this.options.processEntities){for(var e in this.docTypeEntities){var r=this.docTypeEntities[e];t=t.replace(r.regx,r.val)}for(var n in this.lastEntities){var o=this.lastEntities[n];t=t.replace(o.regex,o.val)}if(this.options.htmlEntities)for(var i in this.htmlEntities){var a=this.htmlEntities[i];t=t.replace(a.regex,a.val)}t=t.replace(this.ampEntity.regex,this.ampEntity.val)}return t};function w(t,e,r,n){return t&&(void 0===n&&(n=0===Object.keys(e.child).length),void 0!==(t=this.parseTextData(t,e.tagname,r,!1,!!e[":@"]&&0!==Object.keys(e[":@"]).length,n))&&""!==t&&e.add(this.options.textNodeName,t),t=""),t}function x(t,e,r){var n="*."+r;for(var o in t){var i=t[o];if(n===i||e===i)return!0}return!1}function O(t,e,r,n){var o=t.indexOf(e,r);if(-1===o)throw new Error(n);return o+e.length-1}function A(t,e,r){var n=function(t,e){for(var r,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:">",o="",i=e;i<t.length;i++){var a=t[i];if(r)a===r&&(r="");else if('"'===a||"'"===a)r=a;else if(a===n[0]){if(!n[1])return{data:o,index:i};if(t[i+1]===n[1])return{data:o,index:i}}else"\t"===a&&(a=" ");o+=a}}(t,e+1,arguments.length>3&&void 0!==arguments[3]?arguments[3]:">");if(n){var o=n.data,i=n.index,a=o.search(/\s/),s=o,u=!0;if(-1!==a&&(s=o.substr(0,a).replace(/\s\s*$/,""),o=o.substr(a+1)),r){var c=s.indexOf(":");-1!==c&&(u=(s=s.substr(c+1))!==n.data.substr(c+1))}return{tagName:s,tagExp:o,closeIndex:i,attrExpPresent:u}}}function j(t,e,r){for(var n=r,o=1;r<t.length;r++)if("<"===t[r])if("/"===t[r+1]){var i=O(t,">",r,"".concat(e," is not closed"));if(t.substring(r+2,i).trim()===e&&0==--o)return{tagContent:t.substring(n,r),i};r=i}else if("?"===t[r+1])r=O(t,"?>",r+1,"StopNode is not closed.");else if("!--"===t.substr(r+1,3))r=O(t,"--\x3e",r+3,"StopNode is not closed.");else if("!["===t.substr(r+1,2))r=O(t,"]]>",r,"StopNode is not closed.")-2;else{var a=A(t,r,">");a&&((a&&a.tagName)===e&&"/"!==a.tagExp[a.tagExp.length-1]&&o++,r=a.closeIndex)}}function P(t,e,r){if(e&&"string"==typeof t){var n=t.trim();return"true"===n||"false"!==n&&l(t,r)}return s.isExist(t)?t:""}t.exports=f},586:(t,e,r)=>{function n(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var o=r(282).buildOptions,i=r(502),a=r(869).prettify,s=r(135),u=function(){function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.externalEntities={},this.options=o(e)}var e,r;return e=t,(r=[{key:"parse",value:function(t,e){if("string"==typeof t);else{if(!t.toString)throw new Error("XML data is accepted in String or Bytes[] form.");t=t.toString()}if(e){!0===e&&(e={});var r=s.validate(t,e);if(!0!==r)throw Error("".concat(r.err.msg,":").concat(r.err.line,":").concat(r.err.col))}var n=new i(this.options);n.addExternalEntities(this.externalEntities);var o=n.parseXml(t);return this.options.preserveOrder||void 0===o?o:a(o,this.options)}},{key:"addEntity",value:function(t,e){if(-1!==e.indexOf("&"))throw new Error("Entity value can't have '&'");if(-1!==t.indexOf("&")||-1!==t.indexOf(";"))throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");if("&"===e)throw new Error("An entity with value '&' is not permitted");this.externalEntities[t]=e}}])&&n(e.prototype,r),Object.defineProperty(e,"prototype",{writable:!1}),t}();t.exports=u},869:(t,e)=>{function r(t,e,a){for(var s,u={},c=0;c<t.length;c++){var l,f=t[c],h=n(f);if(l=void 0===a?h:a+"."+h,h===e.textNodeName)void 0===s?s=f[h]:s+=""+f[h];else{if(void 0===h)continue;if(f[h]){var p=r(f[h],e,l),d=i(p,e);f[":@"]?o(p,f[":@"],l,e):1!==Object.keys(p).length||void 0===p[e.textNodeName]||e.alwaysCreateTextNode?0===Object.keys(p).length&&(e.alwaysCreateTextNode?p[e.textNodeName]="":p=""):p=p[e.textNodeName],void 0!==u[h]&&u.hasOwnProperty(h)?(Array.isArray(u[h])||(u[h]=[u[h]]),u[h].push(p)):e.isArray(h,l,d)?u[h]=[p]:u[h]=p}}}return"string"==typeof s?s.length>0&&(u[e.textNodeName]=s):void 0!==s&&(u[e.textNodeName]=s),u}function n(t){for(var e=Object.keys(t),r=0;r<e.length;r++){var n=e[r];if(":@"!==n)return n}}function o(t,e,r,n){if(e)for(var o=Object.keys(e),i=o.length,a=0;a<i;a++){var s=o[a];n.isArray(s,r+"."+s,!0,!0)?t[s]=[e[s]]:t[s]=e[s]}}function i(t,e){var r=e.textNodeName,n=Object.keys(t).length;return 0===n||!(1!==n||!t[r]&&"boolean"!=typeof t[r]&&0!==t[r])}e.prettify=function(t,e){return r(t,e)}},961:t=>{function e(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function r(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var n=function(){function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.tagname=e,this.child=[],this[":@"]={}}var n,o;return n=t,(o=[{key:"add",value:function(t,r){"__proto__"===t&&(t="#__proto__"),this.child.push(e({},t,r))}},{key:"addChild",value:function(t){var r;"__proto__"===t.tagname&&(t.tagname="#__proto__"),t[":@"]&&Object.keys(t[":@"]).length>0?this.child.push((e(r={},t.tagname,t.child),e(r,":@",t[":@"]),r)):this.child.push(e({},t.tagname,t.child))}}])&&r(n.prototype,o),Object.defineProperty(n,"prototype",{writable:!1}),t}();t.exports=n},163:t=>{function e(t){return!!t.constructor&&"function"==typeof t.constructor.isBuffer&&t.constructor.isBuffer(t)}t.exports=function(t){return null!=t&&(e(t)||function(t){return"function"==typeof t.readFloatLE&&"function"==typeof t.slice&&e(t.slice(0,0))}(t)||!!t._isBuffer)}},243:(t,e,r)=>{var n,o,i,a,s;n=r(718),o=r(106).utf8,i=r(163),a=r(106).bin,(s=function t(e,r){e.constructor==String?e=r&&"binary"===r.encoding?a.stringToBytes(e):o.stringToBytes(e):i(e)?e=Array.prototype.slice.call(e,0):Array.isArray(e)||e.constructor===Uint8Array||(e=e.toString());for(var s=n.bytesToWords(e),u=8*e.length,c=1732584193,l=-271733879,f=-1732584194,h=271733878,p=0;p<s.length;p++)s[p]=16711935&(s[p]<<8|s[p]>>>24)|4278255360&(s[p]<<24|s[p]>>>8);s[u>>>5]|=128<<u%32,s[14+(u+64>>>9<<4)]=u;var d=t._ff,g=t._gg,v=t._hh,y=t._ii;for(p=0;p<s.length;p+=16){var m=c,b=l,w=f,x=h;c=d(c,l,f,h,s[p+0],7,-680876936),h=d(h,c,l,f,s[p+1],12,-389564586),f=d(f,h,c,l,s[p+2],17,606105819),l=d(l,f,h,c,s[p+3],22,-1044525330),c=d(c,l,f,h,s[p+4],7,-176418897),h=d(h,c,l,f,s[p+5],12,1200080426),f=d(f,h,c,l,s[p+6],17,-1473231341),l=d(l,f,h,c,s[p+7],22,-45705983),c=d(c,l,f,h,s[p+8],7,1770035416),h=d(h,c,l,f,s[p+9],12,-1958414417),f=d(f,h,c,l,s[p+10],17,-42063),l=d(l,f,h,c,s[p+11],22,-1990404162),c=d(c,l,f,h,s[p+12],7,1804603682),h=d(h,c,l,f,s[p+13],12,-40341101),f=d(f,h,c,l,s[p+14],17,-1502002290),c=g(c,l=d(l,f,h,c,s[p+15],22,1236535329),f,h,s[p+1],5,-165796510),h=g(h,c,l,f,s[p+6],9,-1069501632),f=g(f,h,c,l,s[p+11],14,643717713),l=g(l,f,h,c,s[p+0],20,-373897302),c=g(c,l,f,h,s[p+5],5,-701558691),h=g(h,c,l,f,s[p+10],9,38016083),f=g(f,h,c,l,s[p+15],14,-660478335),l=g(l,f,h,c,s[p+4],20,-405537848),c=g(c,l,f,h,s[p+9],5,568446438),h=g(h,c,l,f,s[p+14],9,-1019803690),f=g(f,h,c,l,s[p+3],14,-187363961),l=g(l,f,h,c,s[p+8],20,1163531501),c=g(c,l,f,h,s[p+13],5,-1444681467),h=g(h,c,l,f,s[p+2],9,-51403784),f=g(f,h,c,l,s[p+7],14,1735328473),c=v(c,l=g(l,f,h,c,s[p+12],20,-1926607734),f,h,s[p+5],4,-378558),h=v(h,c,l,f,s[p+8],11,-2022574463),f=v(f,h,c,l,s[p+11],16,1839030562),l=v(l,f,h,c,s[p+14],23,-35309556),c=v(c,l,f,h,s[p+1],4,-1530992060),h=v(h,c,l,f,s[p+4],11,1272893353),f=v(f,h,c,l,s[p+7],16,-155497632),l=v(l,f,h,c,s[p+10],23,-1094730640),c=v(c,l,f,h,s[p+13],4,681279174),h=v(h,c,l,f,s[p+0],11,-358537222),f=v(f,h,c,l,s[p+3],16,-722521979),l=v(l,f,h,c,s[p+6],23,76029189),c=v(c,l,f,h,s[p+9],4,-640364487),h=v(h,c,l,f,s[p+12],11,-421815835),f=v(f,h,c,l,s[p+15],16,530742520),c=y(c,l=v(l,f,h,c,s[p+2],23,-995338651),f,h,s[p+0],6,-198630844),h=y(h,c,l,f,s[p+7],10,1126891415),f=y(f,h,c,l,s[p+14],15,-1416354905),l=y(l,f,h,c,s[p+5],21,-57434055),c=y(c,l,f,h,s[p+12],6,1700485571),h=y(h,c,l,f,s[p+3],10,-1894986606),f=y(f,h,c,l,s[p+10],15,-1051523),l=y(l,f,h,c,s[p+1],21,-2054922799),c=y(c,l,f,h,s[p+8],6,1873313359),h=y(h,c,l,f,s[p+15],10,-30611744),f=y(f,h,c,l,s[p+6],15,-1560198380),l=y(l,f,h,c,s[p+13],21,1309151649),c=y(c,l,f,h,s[p+4],6,-145523070),h=y(h,c,l,f,s[p+11],10,-1120210379),f=y(f,h,c,l,s[p+2],15,718787259),l=y(l,f,h,c,s[p+9],21,-343485551),c=c+m>>>0,l=l+b>>>0,f=f+w>>>0,h=h+x>>>0}return n.endian([c,l,f,h])})._ff=function(t,e,r,n,o,i,a){var s=t+(e&r|~e&n)+(o>>>0)+a;return(s<<i|s>>>32-i)+e},s._gg=function(t,e,r,n,o,i,a){var s=t+(e&n|r&~n)+(o>>>0)+a;return(s<<i|s>>>32-i)+e},s._hh=function(t,e,r,n,o,i,a){var s=t+(e^r^n)+(o>>>0)+a;return(s<<i|s>>>32-i)+e},s._ii=function(t,e,r,n,o,i,a){var s=t+(r^(e|~n))+(o>>>0)+a;return(s<<i|s>>>32-i)+e},s._blocksize=16,s._digestsize=16,t.exports=function(t,e){if(null==t)throw new Error("Illegal argument "+t);var r=n.wordsToBytes(s(t,e));return e&&e.asBytes?r:e&&e.asString?a.bytesToString(r):n.bytesToHex(r)}},637:(t,e,r)=>{var n=r(584);t.exports=function(t){return t?("{}"===t.substr(0,2)&&(t="\\{\\}"+t.substr(2)),v(function(t){return t.split("\\\\").join(o).split("\\{").join(i).split("\\}").join(a).split("\\,").join(s).split("\\.").join(u)}(t),!0).map(l)):[]};var o="\0SLASH"+Math.random()+"\0",i="\0OPEN"+Math.random()+"\0",a="\0CLOSE"+Math.random()+"\0",s="\0COMMA"+Math.random()+"\0",u="\0PERIOD"+Math.random()+"\0";function c(t){return parseInt(t,10)==t?parseInt(t,10):t.charCodeAt(0)}function l(t){return t.split(o).join("\\").split(i).join("{").split(a).join("}").split(s).join(",").split(u).join(".")}function f(t){if(!t)return[""];var e=[],r=n("{","}",t);if(!r)return t.split(",");var o=r.pre,i=r.body,a=r.post,s=o.split(",");s[s.length-1]+="{"+i+"}";var u=f(a);return a.length&&(s[s.length-1]+=u.shift(),s.push.apply(s,u)),e.push.apply(e,s),e}function h(t){return"{"+t+"}"}function p(t){return/^-?0\d/.test(t)}function d(t,e){return t<=e}function g(t,e){return t>=e}function v(t,e){var r=[],o=n("{","}",t);if(!o)return[t];var i=o.pre,s=o.post.length?v(o.post,!1):[""];if(/\$$/.test(o.pre))for(var u=0;u<s.length;u++){var l=i+"{"+o.body+"}"+s[u];r.push(l)}else{var y,m,b=/^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(o.body),w=/^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(o.body),x=b||w,O=o.body.indexOf(",")>=0;if(!x&&!O)return o.post.match(/,.*\}/)?v(t=o.pre+"{"+o.body+a+o.post):[t];if(x)y=o.body.split(/\.\./);else if(1===(y=f(o.body)).length&&1===(y=v(y[0],!1).map(h)).length)return s.map((function(t){return o.pre+y[0]+t}));if(x){var A=c(y[0]),j=c(y[1]),P=Math.max(y[0].length,y[1].length),S=3==y.length?Math.abs(c(y[2])):1,E=d;j<A&&(S*=-1,E=g);var N=y.some(p);m=[];for(var T=A;E(T,j);T+=S){var k;if(w)"\\"===(k=String.fromCharCode(T))&&(k="");else if(k=String(T),N){var C=P-k.length;if(C>0){var I=new Array(C+1).join("0");k=T<0?"-"+I+k.slice(1):I+k}}m.push(k)}}else{m=[];for(var _=0;_<y.length;_++)m.push.apply(m,v(y[_],!1))}for(_=0;_<m.length;_++)for(u=0;u<s.length;u++)l=i+m[_]+s[u],(!e||x||l)&&r.push(l)}return r}},421:t=>{function e(t){return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e(t)}function r(t){var e="function"==typeof Map?new Map:void 0;return r=function(t){if(null===t||(r=t,-1===Function.toString.call(r).indexOf("[native code]")))return t;var r;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==e){if(e.has(t))return e.get(t);e.set(t,a)}function a(){return n(t,arguments,i(this).constructor)}return a.prototype=Object.create(t.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),o(a,t)},r(t)}function n(t,e,r){return n=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}()?Reflect.construct:function(t,e,r){var n=[null];n.push.apply(n,e);var i=new(Function.bind.apply(t,n));return r&&o(i,r.prototype),i},n.apply(null,arguments)}function o(t,e){return o=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},o(t,e)}function i(t){return i=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},i(t)}var a="+",s=function(t){function r(t){var n;return function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,r),(n=function(t,r){return!r||"object"!==e(r)&&"function"!=typeof r?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):r}(this,i(r).call(this,t))).name="ObjectPrototypeMutationError",n}return function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&o(t,e)}(r,t),r}(r(Error));function u(t,r){for(var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:function(){},o=r.split("."),i=o.length,s=function(e){var r=o[e];if(!t)return{v:void 0};if(r===a){if(Array.isArray(t))return{v:t.map((function(r,i){var a=o.slice(e+1);return a.length>0?u(r,a.join("."),n):n(t,i,o,e)}))};var i=o.slice(0,e).join(".");throw new Error("Object at wildcard (".concat(i,") is not an array"))}t=n(t,r,o,e)},c=0;c<i;c++){var l=s(c);if("object"===e(l))return l.v}return t}function c(t,e){return t.length===e+1}t.exports={set:function(t,r,n){if("object"!=e(t)||null===t)return t;if(void 0===r)return t;if("number"==typeof r)return t[r]=n,t[r];try{return u(t,r,(function(t,e,r,o){if(t===Reflect.getPrototypeOf({}))throw new s("Attempting to mutate Object.prototype");if(!t[e]){var i=Number.isInteger(Number(r[o+1])),u=r[o+1]===a;t[e]=i||u?[]:{}}return c(r,o)&&(t[e]=n),t[e]}))}catch(e){if(e instanceof s)throw e;return t}},get:function(t,r){if("object"!=e(t)||null===t)return t;if(void 0===r)return t;if("number"==typeof r)return t[r];try{return u(t,r,(function(t,e){return t[e]}))}catch(e){return t}},has:function(t,r){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};if("object"!=e(t)||null===t)return!1;if(void 0===r)return!1;if("number"==typeof r)return r in t;try{var o=!1;return u(t,r,(function(t,e,r,i){if(!c(r,i))return t&&t[e];o=n.own?t.hasOwnProperty(e):e in t})),o}catch(t){return!1}},hasOwn:function(t,e,r){return this.has(t,e,r||{own:!0})},isIn:function(t,r,n){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};if("object"!=e(t)||null===t)return!1;if(void 0===r)return!1;try{var i=!1,a=!1;return u(t,r,(function(t,r,o,s){return i=i||t===n||!!t&&t[r]===n,a=c(o,s)&&"object"===e(t)&&r in t,t&&t[r]})),o.validPath?i&&a:i}catch(t){return!1}},ObjectPrototypeMutationError:s}},441:(t,e,r)=>{function n(t){return n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},n(t)}var o=r(930),i=function(t){return"string"==typeof t};function a(t,e){for(var r=[],n=0;n<t.length;n++){var o=t[n];o&&"."!==o&&(".."===o?r.length&&".."!==r[r.length-1]?r.pop():e&&r.push(".."):r.push(o))}return r}var s=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/,u={};function c(t){return s.exec(t).slice(1)}u.resolve=function(){for(var t="",e=!1,r=arguments.length-1;r>=-1&&!e;r--){var n=r>=0?arguments[r]:process.cwd();if(!i(n))throw new TypeError("Arguments to path.resolve must be strings");n&&(t=n+"/"+t,e="/"===n.charAt(0))}return(e?"/":"")+(t=a(t.split("/"),!e).join("/"))||"."},u.normalize=function(t){var e=u.isAbsolute(t),r="/"===t.substr(-1);return(t=a(t.split("/"),!e).join("/"))||e||(t="."),t&&r&&(t+="/"),(e?"/":"")+t},u.isAbsolute=function(t){return"/"===t.charAt(0)},u.join=function(){for(var t="",e=0;e<arguments.length;e++){var r=arguments[e];if(!i(r))throw new TypeError("Arguments to path.join must be strings");r&&(t+=t?"/"+r:r)}return u.normalize(t)},u.relative=function(t,e){function r(t){for(var e=0;e<t.length&&""===t[e];e++);for(var r=t.length-1;r>=0&&""===t[r];r--);return e>r?[]:t.slice(e,r+1)}t=u.resolve(t).substr(1),e=u.resolve(e).substr(1);for(var n=r(t.split("/")),o=r(e.split("/")),i=Math.min(n.length,o.length),a=i,s=0;s<i;s++)if(n[s]!==o[s]){a=s;break}var c=[];for(s=a;s<n.length;s++)c.push("..");return(c=c.concat(o.slice(a))).join("/")},u._makeLong=function(t){return t},u.dirname=function(t){var e=c(t),r=e[0],n=e[1];return r||n?(n&&(n=n.substr(0,n.length-1)),r+n):"."},u.basename=function(t,e){var r=c(t)[2];return e&&r.substr(-1*e.length)===e&&(r=r.substr(0,r.length-e.length)),r},u.extname=function(t){return c(t)[3]},u.format=function(t){if(!o.isObject(t))throw new TypeError("Parameter 'pathObject' must be an object, not "+n(t));var e=t.root||"";if(!i(e))throw new TypeError("'pathObject.root' must be a string or undefined, not "+n(t.root));return(t.dir?t.dir+u.sep:"")+(t.base||"")},u.parse=function(t){if(!i(t))throw new TypeError("Parameter 'pathString' must be a string, not "+n(t));var e=c(t);if(!e||4!==e.length)throw new TypeError("Invalid path '"+t+"'");return e[1]=e[1]||"",e[2]=e[2]||"",e[3]=e[3]||"",{root:e[0],dir:e[0]+e[1].slice(0,e[1].length-1),base:e[2],ext:e[3],name:e[2].slice(0,e[2].length-e[3].length)}},u.sep="/",u.delimiter=":",t.exports=u},361:(t,e)=>{var r=Object.prototype.hasOwnProperty;function n(t){try{return decodeURIComponent(t.replace(/\+/g," "))}catch(t){return null}}function o(t){try{return encodeURIComponent(t)}catch(t){return null}}e.stringify=function(t,e){e=e||"";var n,i,a=[];for(i in"string"!=typeof e&&(e="?"),t)if(r.call(t,i)){if((n=t[i])||null!=n&&!isNaN(n)||(n=""),i=o(i),n=o(n),null===i||null===n)continue;a.push(i+"="+n)}return a.length?e+a.join("&"):""},e.parse=function(t){for(var e,r=/([^=?#&]+)=?([^&]*)/g,o={};e=r.exec(t);){var i=n(e[1]),a=n(e[2]);null===i||null===a||i in o||(o[i]=a)}return o}},620:t=>{t.exports=function(t,e){if(e=e.split(":")[0],!(t=+t))return!1;switch(e){case"http":case"ws":return 80!==t;case"https":case"wss":return 443!==t;case"ftp":return 21!==t;case"gopher":return 70!==t;case"file":return!1}return 0!==t}},512:t=>{var e=/^[-+]?0x[a-fA-F0-9]+$/,r=/^([\-\+])?(0*)(\.[0-9]+([eE]\-?[0-9]+)?|[0-9]+(\.[0-9]+([eE]\-?[0-9]+)?)?)$/;!Number.parseInt&&window.parseInt&&(Number.parseInt=window.parseInt),!Number.parseFloat&&window.parseFloat&&(Number.parseFloat=window.parseFloat);var n={hex:!0,leadingZeros:!0,decimalPoint:".",eNotation:!0};t.exports=function(t){var o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(o=Object.assign({},n,o),!t||"string"!=typeof t)return t;var i=t.trim();if(void 0!==o.skipLike&&o.skipLike.test(i))return t;if(o.hex&&e.test(i))return Number.parseInt(i,16);var a=r.exec(i);if(a){var s=a[1],u=a[2],c=function(t){return t&&-1!==t.indexOf(".")?("."===(t=t.replace(/0+$/,""))?t="0":"."===t[0]?t="0"+t:"."===t[t.length-1]&&(t=t.substr(0,t.length-1)),t):t}(a[3]),l=a[4]||a[6];if(!o.leadingZeros&&u.length>0&&s&&"."!==i[2])return t;if(!o.leadingZeros&&u.length>0&&!s&&"."!==i[1])return t;var f=Number(i),h=""+f;return-1!==h.search(/[eE]/)||l?o.eNotation?f:t:-1!==i.indexOf(".")?"0"===h&&""===c||h===c||s&&h==="-"+c?f:t:u?c===h||s+c===h?f:t:i===h||i===s+h?f:t}return t}},95:(t,e,r)=>{function n(t){return n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},n(t)}var o=r(620),i=r(361),a=/^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/,s=/[\n\r\t]/g,u=/^[A-Za-z][A-Za-z0-9+-.]*:\/\//,c=/:\d+$/,l=/^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i,f=/^[a-zA-Z]:/;function h(t){return(t||"").toString().replace(a,"")}var p=[["#","hash"],["?","query"],function(t,e){return v(e.protocol)?t.replace(/\\/g,"/"):t},["/","pathname"],["@","auth",1],[NaN,"host",void 0,1,1],[/:(\d*)$/,"port",void 0,1],[NaN,"hostname",void 0,1,1]],d={hash:1,query:1};function g(t){var e,r=("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{}).location||{},o={},i=n(t=t||r);if("blob:"===t.protocol)o=new m(unescape(t.pathname),{});else if("string"===i)for(e in o=new m(t,{}),d)delete o[e];else if("object"===i){for(e in t)e in d||(o[e]=t[e]);void 0===o.slashes&&(o.slashes=u.test(t.href))}return o}function v(t){return"file:"===t||"ftp:"===t||"http:"===t||"https:"===t||"ws:"===t||"wss:"===t}function y(t,e){t=(t=h(t)).replace(s,""),e=e||{};var r,n=l.exec(t),o=n[1]?n[1].toLowerCase():"",i=!!n[2],a=!!n[3],u=0;return i?a?(r=n[2]+n[3]+n[4],u=n[2].length+n[3].length):(r=n[2]+n[4],u=n[2].length):a?(r=n[3]+n[4],u=n[3].length):r=n[4],"file:"===o?u>=2&&(r=r.slice(2)):v(o)?r=n[4]:o?i&&(r=r.slice(2)):u>=2&&v(e.protocol)&&(r=n[4]),{protocol:o,slashes:i||v(o),slashesCount:u,rest:r}}function m(t,e,r){if(t=(t=h(t)).replace(s,""),!(this instanceof m))return new m(t,e,r);var a,u,c,l,d,b,w=p.slice(),x=n(e),O=this,A=0;for("object"!==x&&"string"!==x&&(r=e,e=null),r&&"function"!=typeof r&&(r=i.parse),a=!(u=y(t||"",e=g(e))).protocol&&!u.slashes,O.slashes=u.slashes||a&&e.slashes,O.protocol=u.protocol||e.protocol||"",t=u.rest,("file:"===u.protocol&&(2!==u.slashesCount||f.test(t))||!u.slashes&&(u.protocol||u.slashesCount<2||!v(O.protocol)))&&(w[3]=[/(.*)/,"pathname"]);A<w.length;A++)"function"!=typeof(l=w[A])?(c=l[0],b=l[1],c!=c?O[b]=t:"string"==typeof c?~(d="@"===c?t.lastIndexOf(c):t.indexOf(c))&&("number"==typeof l[2]?(O[b]=t.slice(0,d),t=t.slice(d+l[2])):(O[b]=t.slice(d),t=t.slice(0,d))):(d=c.exec(t))&&(O[b]=d[1],t=t.slice(0,d.index)),O[b]=O[b]||a&&l[3]&&e[b]||"",l[4]&&(O[b]=O[b].toLowerCase())):t=l(t,O);r&&(O.query=r(O.query)),a&&e.slashes&&"/"!==O.pathname.charAt(0)&&(""!==O.pathname||""!==e.pathname)&&(O.pathname=function(t,e){if(""===t)return e;for(var r=(e||"/").split("/").slice(0,-1).concat(t.split("/")),n=r.length,o=r[n-1],i=!1,a=0;n--;)"."===r[n]?r.splice(n,1):".."===r[n]?(r.splice(n,1),a++):a&&(0===n&&(i=!0),r.splice(n,1),a--);return i&&r.unshift(""),"."!==o&&".."!==o||r.push(""),r.join("/")}(O.pathname,e.pathname)),"/"!==O.pathname.charAt(0)&&v(O.protocol)&&(O.pathname="/"+O.pathname),o(O.port,O.protocol)||(O.host=O.hostname,O.port=""),O.username=O.password="",O.auth&&(~(d=O.auth.indexOf(":"))?(O.username=O.auth.slice(0,d),O.username=encodeURIComponent(decodeURIComponent(O.username)),O.password=O.auth.slice(d+1),O.password=encodeURIComponent(decodeURIComponent(O.password))):O.username=encodeURIComponent(decodeURIComponent(O.auth)),O.auth=O.password?O.username+":"+O.password:O.username),O.origin="file:"!==O.protocol&&v(O.protocol)&&O.host?O.protocol+"//"+O.host:"null",O.href=O.toString()}m.prototype={set:function(t,e,r){var n=this;switch(t){case"query":"string"==typeof e&&e.length&&(e=(r||i.parse)(e)),n[t]=e;break;case"port":n[t]=e,o(e,n.protocol)?e&&(n.host=n.hostname+":"+e):(n.host=n.hostname,n[t]="");break;case"hostname":n[t]=e,n.port&&(e+=":"+n.port),n.host=e;break;case"host":n[t]=e,c.test(e)?(e=e.split(":"),n.port=e.pop(),n.hostname=e.join(":")):(n.hostname=e,n.port="");break;case"protocol":n.protocol=e.toLowerCase(),n.slashes=!r;break;case"pathname":case"hash":if(e){var a="pathname"===t?"/":"#";n[t]=e.charAt(0)!==a?a+e:e}else n[t]=e;break;case"username":case"password":n[t]=encodeURIComponent(e);break;case"auth":var s=e.indexOf(":");~s?(n.username=e.slice(0,s),n.username=encodeURIComponent(decodeURIComponent(n.username)),n.password=e.slice(s+1),n.password=encodeURIComponent(decodeURIComponent(n.password))):n.username=encodeURIComponent(decodeURIComponent(e))}for(var u=0;u<p.length;u++){var l=p[u];l[4]&&(n[l[1]]=n[l[1]].toLowerCase())}return n.auth=n.password?n.username+":"+n.password:n.username,n.origin="file:"!==n.protocol&&v(n.protocol)&&n.host?n.protocol+"//"+n.host:"null",n.href=n.toString(),n},toString:function(t){t&&"function"==typeof t||(t=i.stringify);var e,r=this,o=r.host,a=r.protocol;a&&":"!==a.charAt(a.length-1)&&(a+=":");var s=a+(r.protocol&&r.slashes||v(r.protocol)?"//":"");return r.username?(s+=r.username,r.password&&(s+=":"+r.password),s+="@"):r.password?(s+=":"+r.password,s+="@"):"file:"!==r.protocol&&v(r.protocol)&&!o&&"/"!==r.pathname&&(s+="@"),(":"===o[o.length-1]||c.test(r.hostname)&&!r.port)&&(o+=":"),s+=o+r.pathname,(e="object"===n(r.query)?t(r.query):r.query)&&(s+="?"!==e.charAt(0)?"?"+e:e),r.hash&&(s+=r.hash),s}},m.extractProtocol=y,m.location=g,m.trimLeft=h,m.qs=i,t.exports=m},930:()=>{},227:()=>{},347:()=>{},724:()=>{}},e={};function r(n){var o=e[n];if(void 0!==o)return o.exports;var i=e[n]={id:n,loaded:!1,exports:{}};return t[n].call(i.exports,i,i.exports,r),i.loaded=!0,i.exports}r.amdO={},r.n=t=>{var e=t&&t.__esModule?()=>t.default:()=>t;return r.d(e,{a:e}),e},r.d=(t,e)=>{for(var n in e)r.o(e,n)&&!r.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:e[n]})},r.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r.nmd=t=>(t.paths=[],t.children||(t.children=[]),t);var n={};(()=>{r.d(n,{Gr:()=>I,jK:()=>_,cf:()=>M,HM:()=>U,eI:()=>Pr,lD:()=>G,yY:()=>Ee,sw:()=>Pe,np:()=>ve,_M:()=>Ne});var t=r(95),e=r.n(t);function o(t){if(!i(t))throw new Error("Parameter was not an error")}function i(t){return"[object Error]"===(e=t,Object.prototype.toString.call(e))||t instanceof Error;var e}function a(t){return a="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},a(t)}function s(t){return s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},s(t)}function u(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function c(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function l(t){var e="function"==typeof Map?new Map:void 0;return l=function(t){if(null===t||(r=t,-1===Function.toString.call(r).indexOf("[native code]")))return t;var r;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==e){if(e.has(t))return e.get(t);e.set(t,n)}function n(){return f(t,arguments,d(this).constructor)}return n.prototype=Object.create(t.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),p(n,t)},l(t)}function f(t,e,r){return f=h()?Reflect.construct.bind():function(t,e,r){var n=[null];n.push.apply(n,e);var o=new(Function.bind.apply(t,n));return r&&p(o,r.prototype),o},f.apply(null,arguments)}function h(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}function p(t,e){return p=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t},p(t,e)}function d(t){return d=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},d(t)}var g=function(t){!function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&p(t,e)}(v,t);var e,r,n,l,f,g=(l=v,f=h(),function(){var t,e=d(l);if(f){var r=d(this).constructor;t=Reflect.construct(e,arguments,r)}else t=e.apply(this,arguments);return function(t,e){if(e&&("object"===s(e)||"function"==typeof e))return e;if(void 0!==e)throw new TypeError("Derived constructors may only return object or undefined");return c(t)}(this,t)});function v(t,e){var r;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,v);var n=function(t){var e,r="";if(0===t.length)e={};else if(i(t[0]))e={cause:t[0]},r=t.slice(1).join(" ")||"";else if(t[0]&&"object"===a(t[0]))e=Object.assign({},t[0]),r=t.slice(1).join(" ")||"";else{if("string"!=typeof t[0])throw new Error("Invalid arguments passed to Layerr");e={},r=r=t.join(" ")||""}return{options:e,shortMessage:r}}(Array.prototype.slice.call(arguments)),o=n.options,u=n.shortMessage;if(o.cause&&(u="".concat(u,": ").concat(o.cause.message)),(r=g.call(this,u)).message=u,o.name&&"string"==typeof o.name?r.name=o.name:r.name="Layerr",o.cause&&Object.defineProperty(c(r),"_cause",{value:o.cause}),Object.defineProperty(c(r),"_info",{value:{}}),o.info&&"object"===s(o.info)&&Object.assign(r._info,o.info),Error.captureStackTrace){var l=o.constructorOpt||r.constructor;Error.captureStackTrace(c(r),l)}return r}return e=v,n=[{key:"cause",value:function(t){return o(t),t._cause&&i(t._cause)?t._cause:null}},{key:"fullStack",value:function(t){o(t);var e=v.cause(t);return e?"".concat(t.stack,"\ncaused by: ").concat(v.fullStack(e)):t.stack}},{key:"info",value:function(t){o(t);var e={},r=v.cause(t);return r&&Object.assign(e,v.info(r)),t._info&&Object.assign(e,t._info),e}}],(r=[{key:"cause",value:function(){return v.cause(this)}},{key:"toString",value:function(){var t=this.name||this.constructor.name||this.constructor.prototype.name;return this.message&&(t="".concat(t,": ").concat(this.message)),t}}])&&u(e.prototype,r),n&&u(e,n),Object.defineProperty(e,"prototype",{writable:!1}),v}(l(Error));function v(t){return v="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},v(t)}var y=r(441),m=r.n(y),b="__PATH_SEPARATOR_POSIX__",w="__PATH_SEPARATOR_WINDOWS__";function x(t){try{var e=t.replace(/\//g,b).replace(/\\\\/g,w);return encodeURIComponent(e).split(w).join("\\\\").split(b).join("/")}catch(t){throw new g(t,"Failed encoding path")}}function O(t){return t.startsWith("/")?t:"/"+t}function A(t){var e=t;return"/"!==e[0]&&(e="/"+e),/^.+\/$/.test(e)&&(e=e.substr(0,e.length-1)),e}function j(){for(var t=arguments.length,e=new Array(t),r=0;r<t;r++)e[r]=arguments[r];return function(){return function(t){var e=[];if(0===t.length)return"";if("string"!=typeof t[0])throw new TypeError("Url must be a string. Received "+t[0]);if(t[0].match(/^[^/:]+:\/*$/)&&t.length>1){var r=t.shift();t[0]=r+t[0]}t[0].match(/^file:\/\/\//)?t[0]=t[0].replace(/^([^/:]+):\/*/,"$1:///"):t[0]=t[0].replace(/^([^/:]+):\/*/,"$1://");for(var n=0;n<t.length;n++){var o=t[n];if("string"!=typeof o)throw new TypeError("Url must be a string. Received "+o);""!==o&&(n>0&&(o=o.replace(/^[\/]+/,"")),o=n<t.length-1?o.replace(/[\/]+$/,""):o.replace(/[\/]+$/,"/"),e.push(o))}var i=e.join("/"),a=(i=i.replace(/\/(\?|&|#[^!])/g,"$1")).split("?");return a.shift()+(a.length>0?"?":"")+a.join("&")}("object"===v(arguments[0])?arguments[0]:[].slice.call(arguments))}(e.reduce((function(t,e,r){return(0===r||"/"!==e||"/"===e&&"/"!==t[t.length-1])&&t.push(e),t}),[]))}var P=r(243),S=r.n(P),E="abcdef0123456789";function N(t,e){var r=t.url.replace("//",""),n=-1==r.indexOf("/")?"/":r.slice(r.indexOf("/")),o=t.method?t.method.toUpperCase():"GET",i=!!/(^|,)\s*auth\s*($|,)/.test(e.qop)&&"auth",a="00000000".concat(e.nc).slice(-8),s=function(t,e,r,n,o,i,a){var s=a||S()("".concat(e,":").concat(r,":").concat(n));return t&&"md5-sess"===t.toLowerCase()?S()("".concat(s,":").concat(o,":").concat(i)):s}(e.algorithm,e.username,e.realm,e.password,e.nonce,e.cnonce,e.ha1),u=S()("".concat(o,":").concat(n)),c=i?S()("".concat(s,":").concat(e.nonce,":").concat(a,":").concat(e.cnonce,":").concat(i,":").concat(u)):S()("".concat(s,":").concat(e.nonce,":").concat(u)),l={username:e.username,realm:e.realm,nonce:e.nonce,uri:n,qop:i,response:c,nc:a,cnonce:e.cnonce,algorithm:e.algorithm,opaque:e.opaque},f=[];for(var h in l)l[h]&&("qop"===h||"nc"===h||"algorithm"===h?f.push("".concat(h,"=").concat(l[h])):f.push("".concat(h,'="').concat(l[h],'"')));return"Digest ".concat(f.join(", "))}var T=r(146),k=r.n(T);function C(t){return k().decode(t)}var I,_,R="undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:"undefined"!=typeof window?window:globalThis,L=R.fetch.bind(R),M=(R.Headers,R.Request),U=R.Response;function D(){for(var t=arguments.length,e=new Array(t),r=0;r<t;r++)e[r]=arguments[r];if(0===e.length)throw new Error("Failed creating sequence: No functions provided");return function(){for(var t=arguments.length,r=new Array(t),n=0;n<t;n++)r[n]=arguments[n];for(var o=r;e.length>0;)o=[e.shift().apply(this,o)];return o[0]}}function F(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,n=new Array(e);r<e;r++)n[r]=t[r];return n}function $(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}!function(t){t.Digest="digest",t.None="none",t.Password="password",t.Token="token"}(I||(I={})),function(t){t.DataTypeNoLength="data-type-no-length",t.InvalidAuthType="invalid-auth-type",t.InvalidOutputFormat="invalid-output-format",t.LinkUnsupportedAuthType="link-unsupported-auth"}(_||(_={})),r(724);var B="@@HOTPATCHER",W=function(){};function V(t){return{original:t,methods:[t],final:!1}}var z=function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._configuration={registry:{},getEmptyAction:"null"},this.__type__=B}var e,r;return e=t,r=[{key:"configuration",get:function(){return this._configuration}},{key:"getEmptyAction",get:function(){return this.configuration.getEmptyAction},set:function(t){this.configuration.getEmptyAction=t}},{key:"control",value:function(t){var e=this,r=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(!t||t.__type__!==B)throw new Error("Failed taking control of target HotPatcher instance: Invalid type or object");return Object.keys(t.configuration.registry).forEach((function(n){e.configuration.registry.hasOwnProperty(n)?r&&(e.configuration.registry[n]=Object.assign({},t.configuration.registry[n])):e.configuration.registry[n]=Object.assign({},t.configuration.registry[n])})),t._configuration=this.configuration,this}},{key:"execute",value:function(t){for(var e=this.get(t)||W,r=arguments.length,n=new Array(r>1?r-1:0),o=1;o<r;o++)n[o-1]=arguments[o];return e.apply(void 0,n)}},{key:"get",value:function(t){var e,r=this.configuration.registry[t];if(!r)switch(this.getEmptyAction){case"null":return null;case"throw":throw new Error("Failed handling method request: No method provided for override: ".concat(t));default:throw new Error("Failed handling request which resulted in an empty method: Invalid empty-action specified: ".concat(this.getEmptyAction))}return D.apply(void 0,function(t){if(Array.isArray(t))return F(t)}(e=r.methods)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(e)||function(t,e){if(t){if("string"==typeof t)return F(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?F(t,e):void 0}}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}())}},{key:"isPatched",value:function(t){return!!this.configuration.registry[t]}},{key:"patch",value:function(t,e){var r=(arguments.length>2&&void 0!==arguments[2]?arguments[2]:{}).chain,n=void 0!==r&&r;if(this.configuration.registry[t]&&this.configuration.registry[t].final)throw new Error("Failed patching '".concat(t,"': Method marked as being final"));if("function"!=typeof e)throw new Error("Failed patching '".concat(t,"': Provided method is not a function"));if(n)this.configuration.registry[t]?this.configuration.registry[t].methods.push(e):this.configuration.registry[t]=V(e);else if(this.isPatched(t)){var o=this.configuration.registry[t].original;this.configuration.registry[t]=Object.assign(V(e),{original:o})}else this.configuration.registry[t]=V(e);return this}},{key:"patchInline",value:function(t,e){this.isPatched(t)||this.patch(t,e);for(var r=arguments.length,n=new Array(r>2?r-2:0),o=2;o<r;o++)n[o-2]=arguments[o];return this.execute.apply(this,[t].concat(n))}},{key:"plugin",value:function(t){for(var e=this,r=arguments.length,n=new Array(r>1?r-1:0),o=1;o<r;o++)n[o-1]=arguments[o];return n.forEach((function(r){e.patch(t,r,{chain:!0})})),this}},{key:"restore",value:function(t){if(!this.isPatched(t))throw new Error("Failed restoring method: No method present for key: ".concat(t));if("function"!=typeof this.configuration.registry[t].original)throw new Error("Failed restoring method: Original method not found or of invalid type for key: ".concat(t));return this.configuration.registry[t].methods=[this.configuration.registry[t].original],this}},{key:"setFinal",value:function(t){if(!this.configuration.registry.hasOwnProperty(t))throw new Error("Failed marking '".concat(t,"' as final: No method found for key"));return this.configuration.registry[t].final=!0,this}}],r&&$(e.prototype,r),Object.defineProperty(e,"prototype",{writable:!1}),t}(),q=null;function G(){return q||(q=new z),q}function H(t){return function(t){if(Array.isArray(t))return X(t)}(t)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(t)||function(t,e){if(t){if("string"==typeof t)return X(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?X(t,e):void 0}}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function X(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,n=new Array(e);r<e;r++)n[r]=t[r];return n}function Z(t){return Z="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},Z(t)}function Y(t){return function(t){if("object"!==Z(t)||null===t||"[object Object]"!=Object.prototype.toString.call(t))return!1;if(null===Object.getPrototypeOf(t))return!0;for(var e=t;null!==Object.getPrototypeOf(e);)e=Object.getPrototypeOf(e);return Object.getPrototypeOf(t)===e}(t)?Object.assign({},t):Object.setPrototypeOf(Object.assign({},t),Object.getPrototypeOf(t))}function K(){for(var t=arguments.length,e=new Array(t),r=0;r<t;r++)e[r]=arguments[r];for(var n=null,o=[].concat(e);o.length>0;){var i=o.shift();n=n?J(n,i):Y(i)}return n}function J(t,e){var r=Y(t);return Object.keys(e).forEach((function(t){r.hasOwnProperty(t)?Array.isArray(e[t])?r[t]=Array.isArray(r[t])?[].concat(H(r[t]),H(e[t])):H(e[t]):"object"===Z(e[t])&&e[t]?r[t]="object"===Z(r[t])&&r[t]?J(r[t],e[t]):Y(e[t]):r[t]=e[t]:r[t]=e[t]})),r}function Q(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,n=new Array(e);r<e;r++)n[r]=t[r];return n}function tt(t){var e,r={},n=function(t,e){var r="undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!r){if(Array.isArray(t)||(r=function(t,e){if(t){if("string"==typeof t)return Q(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?Q(t,e):void 0}}(t))||e&&t&&"number"==typeof t.length){r&&(t=r);var n=0,o=function(){};return{s:o,n:function(){return n>=t.length?{done:!0}:{done:!1,value:t[n++]}},e:function(t){throw t},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,a=!0,s=!1;return{s:function(){r=r.call(t)},n:function(){var t=r.next();return a=t.done,t},e:function(t){s=!0,i=t},f:function(){try{a||null==r.return||r.return()}finally{if(s)throw i}}}}(t.keys());try{for(n.s();!(e=n.n()).done;){var o=e.value;r[o]=t.get(o)}}catch(t){n.e(t)}finally{n.f()}return r}function et(){for(var t=arguments.length,e=new Array(t),r=0;r<t;r++)e[r]=arguments[r];if(0===e.length)return{};var n={};return e.reduce((function(t,e){return Object.keys(e).forEach((function(r){var o=r.toLowerCase();n.hasOwnProperty(o)?t[n[o]]=e[r]:(n[o]=r,t[r]=e[r])})),t}),{})}r(347);var rt="function"==typeof ArrayBuffer,nt=Object.prototype.toString;function ot(t){return rt&&(t instanceof ArrayBuffer||"[object ArrayBuffer]"===nt.call(t))}function it(t){return null!=t&&null!=t.constructor&&"function"==typeof t.constructor.isBuffer&&t.constructor.isBuffer(t)}function at(t){return at="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},at(t)}function st(t,e,r){return r?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}function ut(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,n=new Array(e);r<e;r++)n[r]=t[r];return n}function ct(t){var e=G();return e.patchInline("request",(function(t){return e.patchInline("fetch",L,t.url,function(t){var e,r,n={},o={method:t.method};if(t.headers&&(n=et(n,t.headers)),void 0!==t.data){var i=(e=function(t){if("string"==typeof t)return[t,{}];if(it(t))return[t,{}];if(ot(t))return[t,{}];if(t&&"object"===at(t))return[JSON.stringify(t),{"content-type":"application/json"}];throw new Error("Unable to convert request body: Unexpected body type: ".concat(at(t)))}(t.data),r=2,function(t){if(Array.isArray(t))return t}(e)||function(t,e){var r=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=r){var n,o,i=[],a=!0,s=!1;try{for(r=r.call(t);!(a=(n=r.next()).done)&&(i.push(n.value),!e||i.length!==e);a=!0);}catch(t){s=!0,o=t}finally{try{a||null==r.return||r.return()}finally{if(s)throw o}}return i}}(e,r)||function(t,e){if(t){if("string"==typeof t)return ut(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?ut(t,e):void 0}}(e,r)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()),a=i[0],s=i[1];o.body=a,n=et(n,s)}return t.signal&&(o.signal=t.signal),t.withCredentials&&(o.credentials="include"),o.headers=n,o}(t))}),t)}var lt,ft=(lt=function(t){if(!t._digest)return ct(t);var e=t._digest;return delete t._digest,e.hasDigestAuth&&(t=K(t,{headers:{Authorization:N(t,e)}})),st(ct(t),(function(r){var n,o,i=!1;return n=function(t){return i?t:r},(o=function(){if(401==r.status)return e.hasDigestAuth=function(t,e){var r=t.headers&&t.headers.get("www-authenticate")||"";if("digest"!==r.split(/\s/)[0].toLowerCase())return!1;for(var n=/([a-z0-9_-]+)=(?:"([^"]+)"|([a-z0-9_-]+))/gi;;){var o=n.exec(r);if(!o)break;e[o[1]]=o[2]||o[3]}return e.nc+=1,e.cnonce=function(){for(var t="",e=0;e<32;++e)t="".concat(t).concat(E[Math.floor(16*Math.random())]);return t}(),!0}(r,e),function(){if(e.hasDigestAuth)return st(ct(t=K(t,{headers:{Authorization:N(t,e)}})),(function(t){return 401==t.status?e.hasDigestAuth=!1:e.nc++,i=!0,t}))}();e.nc++}())&&o.then?o.then(n):n(o)}))},function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];try{return Promise.resolve(lt.apply(this,t))}catch(t){return Promise.reject(t)}});function ht(t,e,r){var n=Y(t);return n.headers=et(e.headers,n.headers||{},r.headers||{}),void 0!==r.data&&(n.data=r.data),r.signal&&(n.signal=r.signal),e.httpAgent&&(n.httpAgent=e.httpAgent),e.httpsAgent&&(n.httpsAgent=e.httpsAgent),e.digest&&(n._digest=e.digest),"boolean"==typeof e.withCredentials&&(n.withCredentials=e.withCredentials),n}var pt=r(637);function dt(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var r=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=r){var n,o,i=[],a=!0,s=!1;try{for(r=r.call(t);!(a=(n=r.next()).done)&&(i.push(n.value),!e||i.length!==e);a=!0);}catch(t){s=!0,o=t}finally{try{a||null==r.return||r.return()}finally{if(s)throw o}}return i}}(t,e)||function(t,e){if(t){if("string"==typeof t)return gt(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?gt(t,e):void 0}}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function gt(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,n=new Array(e);r<e;r++)n[r]=t[r];return n}var vt={"[:alnum:]":["\\p{L}\\p{Nl}\\p{Nd}",!0],"[:alpha:]":["\\p{L}\\p{Nl}",!0],"[:ascii:]":["\\x00-\\x7f",!1],"[:blank:]":["\\p{Zs}\\t",!0],"[:cntrl:]":["\\p{Cc}",!0],"[:digit:]":["\\p{Nd}",!0],"[:graph:]":["\\p{Z}\\p{C}",!0,!0],"[:lower:]":["\\p{Ll}",!0],"[:print:]":["\\p{C}",!0],"[:punct:]":["\\p{P}",!0],"[:space:]":["\\p{Z}\\t\\r\\n\\v\\f",!0],"[:upper:]":["\\p{Lu}",!0],"[:word:]":["\\p{L}\\p{Nl}\\p{Nd}\\p{Pc}",!0],"[:xdigit:]":["A-Fa-f0-9",!1]},yt=function(t){return t.replace(/[[\]\\-]/g,"\\$&")},mt=function(t){return t.join("")},bt=function(t,e){var r=e;if("["!==t.charAt(r))throw new Error("not in a brace expression");var n,o=[],i=[],a=r+1,s=!1,u=!1,c=!1,l=!1,f=r,h="";t:for(;a<t.length;){var p=t.charAt(a);if("!"!==p&&"^"!==p||a!==r+1){if("]"===p&&s&&!c){f=a+1;break}if(s=!0,"\\"!==p||c){if("["===p&&!c)for(var d=0,g=Object.entries(vt);d<g.length;d++){var v=dt(g[d],2),y=v[0],m=dt(v[1],3),b=m[0],w=m[1],x=m[2];if(t.startsWith(y,a)){if(h)return["$.",!1,t.length-r,!0];a+=y.length,x?i.push(b):o.push(b),u=u||w;continue t}}c=!1,h?(p>h?o.push(yt(h)+"-"+yt(p)):p===h&&o.push(yt(p)),h="",a++):t.startsWith("-]",a+1)?(o.push(yt(p+"-")),a+=2):t.startsWith("-",a+1)?(h=p,a+=2):(o.push(yt(p)),a++)}else c=!0,a++}else l=!0,a++}if(f<a)return["",!1,0,!1];if(!o.length&&!i.length)return["$.",!1,t.length-r,!0];if(0===i.length&&1===o.length&&/^\\?.$/.test(o[0])&&!l)return[(n=2===o[0].length?o[0].slice(-1):o[0],n.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),!1,f-r,!1];var O="["+(l?"^":"")+mt(o)+"]",A="["+(l?"":"^")+mt(i)+"]";return[o.length&&i.length?"("+O+"|"+A+")":o.length?O:A,u,f-r,!0]};function wt(t){return function(t){if(Array.isArray(t))return Ct(t)}(t)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(t)||kt(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function xt(t,e){var r="undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!r){if(Array.isArray(t)||(r=kt(t))||e&&t&&"number"==typeof t.length){r&&(t=r);var n=0,o=function(){};return{s:o,n:function(){return n>=t.length?{done:!0}:{done:!1,value:t[n++]}},e:function(t){throw t},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,a=!0,s=!1;return{s:function(){r=r.call(t)},n:function(){var t=r.next();return a=t.done,t},e:function(t){s=!0,i=t},f:function(){try{a||null==r.return||r.return()}finally{if(s)throw i}}}}function Ot(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function At(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function jt(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function Pt(t,e,r){return e&&jt(t.prototype,e),r&&jt(t,r),Object.defineProperty(t,"prototype",{writable:!1}),t}function St(t,e){return St=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t},St(t,e)}function Et(t){return Et=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},Et(t)}function Nt(t){return Nt="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},Nt(t)}function Tt(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var r=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=r){var n,o,i=[],a=!0,s=!1;try{for(r=r.call(t);!(a=(n=r.next()).done)&&(i.push(n.value),!e||i.length!==e);a=!0);}catch(t){s=!0,o=t}finally{try{a||null==r.return||r.return()}finally{if(s)throw o}}return i}}(t,e)||kt(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function kt(t,e){if(t){if("string"==typeof t)return Ct(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?Ct(t,e):void 0}}function Ct(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,n=new Array(e);r<e;r++)n[r]=t[r];return n}var It=function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return le(e),!(!r.nocomment&&"#"===e.charAt(0))&&new pe(e,r).match(t)};const _t=It;var Rt=/^\*+([^+@!?\*\[\(]*)$/,Lt=function(t){return function(e){return!e.startsWith(".")&&e.endsWith(t)}},Mt=function(t){return function(e){return e.endsWith(t)}},Ut=function(t){return t=t.toLowerCase(),function(e){return!e.startsWith(".")&&e.toLowerCase().endsWith(t)}},Dt=function(t){return t=t.toLowerCase(),function(e){return e.toLowerCase().endsWith(t)}},Ft=/^\*+\.\*+$/,$t=function(t){return!t.startsWith(".")&&t.includes(".")},Bt=function(t){return"."!==t&&".."!==t&&t.includes(".")},Wt=/^\.\*+$/,Vt=function(t){return"."!==t&&".."!==t&&t.startsWith(".")},zt=/^\*+$/,qt=function(t){return 0!==t.length&&!t.startsWith(".")},Gt=function(t){return 0!==t.length&&"."!==t&&".."!==t},Ht=/^\?+([^+@!?\*\[\(]*)?$/,Xt=function(t){var e=Tt(t,2),r=e[0],n=e[1],o=void 0===n?"":n,i=Jt([r]);return o?(o=o.toLowerCase(),function(t){return i(t)&&t.toLowerCase().endsWith(o)}):i},Zt=function(t){var e=Tt(t,2),r=e[0],n=e[1],o=void 0===n?"":n,i=Qt([r]);return o?(o=o.toLowerCase(),function(t){return i(t)&&t.toLowerCase().endsWith(o)}):i},Yt=function(t){var e=Tt(t,2),r=e[0],n=e[1],o=void 0===n?"":n,i=Qt([r]);return o?function(t){return i(t)&&t.endsWith(o)}:i},Kt=function(t){var e=Tt(t,2),r=e[0],n=e[1],o=void 0===n?"":n,i=Jt([r]);return o?function(t){return i(t)&&t.endsWith(o)}:i},Jt=function(t){var e=Tt(t,1)[0].length;return function(t){return t.length===e&&!t.startsWith(".")}},Qt=function(t){var e=Tt(t,1)[0].length;return function(t){return t.length===e&&"."!==t&&".."!==t}},te="object"===("undefined"==typeof process?"undefined":Nt(process))&&process?"object"===Nt(process.env)&&process.env&&process.env.__MINIMATCH_TESTING_PLATFORM__||process.platform:"posix";It.sep="win32"===te?"\\":"/";var ee=Symbol("globstar **");It.GLOBSTAR=ee;var re={"!":{open:"(?:(?!(?:",close:"))[^/]*?)"},"?":{open:"(?:",close:")?"},"+":{open:"(?:",close:")+"},"*":{open:"(?:",close:")*"},"@":{open:"(?:",close:")"}},ne="[^/]",oe=ne+"*?",ie=function(t){return t.split("").reduce((function(t,e){return t[e]=!0,t}),{})},ae=ie("().*{}+?[]^$\\!"),se=ie("[.(");It.filter=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return function(r){return It(r,t,e)}};var ue=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return Object.assign({},t,e)};It.defaults=function(t){if(!t||"object"!==Nt(t)||!Object.keys(t).length)return It;var e=It;return Object.assign((function(r,n){return e(r,n,ue(t,arguments.length>2&&void 0!==arguments[2]?arguments[2]:{}))}),{Minimatch:function(r){!function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&St(t,e)}(a,r);var n,o,i=(n=a,o=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}(),function(){var t,e=Et(n);if(o){var r=Et(this).constructor;t=Reflect.construct(e,arguments,r)}else t=e.apply(this,arguments);return function(t,e){if(e&&("object"===Nt(e)||"function"==typeof e))return e;if(void 0!==e)throw new TypeError("Derived constructors may only return object or undefined");return function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t)}(this,t)});function a(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return At(this,a),i.call(this,e,ue(t,r))}return Pt(a,null,[{key:"defaults",value:function(r){return e.defaults(ue(t,r)).Minimatch}}]),a}(e.Minimatch),unescape:function(r){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return e.unescape(r,ue(t,n))},escape:function(r){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return e.escape(r,ue(t,n))},filter:function(r){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return e.filter(r,ue(t,n))},defaults:function(r){return e.defaults(ue(t,r))},makeRe:function(r){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return e.makeRe(r,ue(t,n))},braceExpand:function(r){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return e.braceExpand(r,ue(t,n))},match:function(r,n){var o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return e.match(r,n,ue(t,o))},sep:e.sep,GLOBSTAR:ee})};var ce=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return le(t),e.nobrace||!/\{(?:(?!\{).)*\}/.test(t)?[t]:pt(t)};It.braceExpand=ce;var le=function(t){if("string"!=typeof t)throw new TypeError("invalid pattern");if(t.length>65536)throw new TypeError("pattern is too long")};It.makeRe=function(t){return new pe(t,arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}).makeRe()},It.match=function(t,e){var r=new pe(e,arguments.length>2&&void 0!==arguments[2]?arguments[2]:{});return t=t.filter((function(t){return r.match(t)})),r.options.nonull&&!t.length&&t.push(e),t};var fe=/[?*]|[+@!]\(.*?\)|\[|\]/,he=function(t){return t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")},pe=function(){function t(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};At(this,t),Ot(this,"options",void 0),Ot(this,"set",void 0),Ot(this,"pattern",void 0),Ot(this,"windowsPathsNoEscape",void 0),Ot(this,"nonegate",void 0),Ot(this,"negate",void 0),Ot(this,"comment",void 0),Ot(this,"empty",void 0),Ot(this,"preserveMultipleSlashes",void 0),Ot(this,"partial",void 0),Ot(this,"globSet",void 0),Ot(this,"globParts",void 0),Ot(this,"nocase",void 0),Ot(this,"isWindows",void 0),Ot(this,"platform",void 0),Ot(this,"windowsNoMagicRoot",void 0),Ot(this,"regexp",void 0),le(e),r=r||{},this.options=r,this.pattern=e,this.platform=r.platform||te,this.isWindows="win32"===this.platform,this.windowsPathsNoEscape=!!r.windowsPathsNoEscape||!1===r.allowWindowsEscape,this.windowsPathsNoEscape&&(this.pattern=this.pattern.replace(/\\/g,"/")),this.preserveMultipleSlashes=!!r.preserveMultipleSlashes,this.regexp=null,this.negate=!1,this.nonegate=!!r.nonegate,this.comment=!1,this.empty=!1,this.partial=!!r.partial,this.nocase=!!this.options.nocase,this.windowsNoMagicRoot=void 0!==r.windowsNoMagicRoot?r.windowsNoMagicRoot:!(!this.isWindows||!this.nocase),this.globSet=[],this.globParts=[],this.set=[],this.make()}return Pt(t,[{key:"hasMagic",value:function(){if(this.options.magicalBraces&&this.set.length>1)return!0;var t,e=xt(this.set);try{for(e.s();!(t=e.n()).done;){var r,n=xt(t.value);try{for(n.s();!(r=n.n()).done;)if("string"!=typeof r.value)return!0}catch(t){n.e(t)}finally{n.f()}}}catch(t){e.e(t)}finally{e.f()}return!1}},{key:"debug",value:function(){}},{key:"make",value:function(){var t=this,e=this.pattern,r=this.options;if(r.nocomment||"#"!==e.charAt(0))if(e){this.parseNegate(),this.globSet=wt(new Set(this.braceExpand())),r.debug&&(this.debug=function(){var t;return(t=console).error.apply(t,arguments)}),this.debug(this.pattern,this.globSet);var n=this.globSet.map((function(e){return t.slashSplit(e)}));this.globParts=this.preprocess(n),this.debug(this.pattern,this.globParts);var o=this.globParts.map((function(e,r,n){if(t.isWindows&&t.windowsNoMagicRoot){var o=!(""!==e[0]||""!==e[1]||"?"!==e[2]&&fe.test(e[2])||fe.test(e[3])),i=/^[a-z]:/i.test(e[0]);if(o)return[].concat(wt(e.slice(0,4)),wt(e.slice(4).map((function(e){return t.parse(e)}))));if(i)return[e[0]].concat(wt(e.slice(1).map((function(e){return t.parse(e)}))))}return e.map((function(e){return t.parse(e)}))}));if(this.debug(this.pattern,o),this.set=o.filter((function(t){return-1===t.indexOf(!1)})),this.isWindows)for(var i=0;i<this.set.length;i++){var a=this.set[i];""===a[0]&&""===a[1]&&"?"===this.globParts[i][2]&&"string"==typeof a[3]&&/^[a-z]:$/i.test(a[3])&&(a[2]="?")}this.debug(this.pattern,this.set)}else this.empty=!0;else this.comment=!0}},{key:"preprocess",value:function(t){if(this.options.noglobstar)for(var e=0;e<t.length;e++)for(var r=0;r<t[e].length;r++)"**"===t[e][r]&&(t[e][r]="*");var n=this.options.optimizationLevel,o=void 0===n?1:n;return o>=2?(t=this.firstPhasePreProcess(t),t=this.secondPhasePreProcess(t)):t=o>=1?this.levelOneOptimize(t):this.adjascentGlobstarOptimize(t),t}},{key:"adjascentGlobstarOptimize",value:function(t){return t.map((function(t){for(var e=-1;-1!==(e=t.indexOf("**",e+1));){for(var r=e;"**"===t[r+1];)r++;r!==e&&t.splice(e,r-e)}return t}))}},{key:"levelOneOptimize",value:function(t){return t.map((function(t){return 0===(t=t.reduce((function(t,e){var r=t[t.length-1];return"**"===e&&"**"===r?t:".."===e&&r&&".."!==r&&"."!==r&&"**"!==r?(t.pop(),t):(t.push(e),t)}),[])).length?[""]:t}))}},{key:"levelTwoFileOptimize",value:function(t){Array.isArray(t)||(t=this.slashSplit(t));var e=!1;do{if(e=!1,!this.preserveMultipleSlashes){for(var r=1;r<t.length-1;r++){var n=t[r];1===r&&""===n&&""===t[0]||"."!==n&&""!==n||(e=!0,t.splice(r,1),r--)}"."!==t[0]||2!==t.length||"."!==t[1]&&""!==t[1]||(e=!0,t.pop())}for(var o=0;-1!==(o=t.indexOf("..",o+1));){var i=t[o-1];i&&"."!==i&&".."!==i&&"**"!==i&&(e=!0,t.splice(o-1,2),o-=2)}}while(e);return 0===t.length?[""]:t}},{key:"firstPhasePreProcess",value:function(t){var e=!1;do{e=!1;var r,n=xt(t);try{for(n.s();!(r=n.n()).done;){for(var o=r.value,i=-1;-1!==(i=o.indexOf("**",i+1));){for(var a=i;"**"===o[a+1];)a++;a>i&&o.splice(i+1,a-i);var s=o[i+1],u=o[i+2],c=o[i+3];if(".."===s&&u&&"."!==u&&".."!==u&&c&&"."!==c&&".."!==c){e=!0,o.splice(i,1);var l=o.slice(0);l[i]="**",t.push(l),i--}}if(!this.preserveMultipleSlashes){for(var f=1;f<o.length-1;f++){var h=o[f];1===f&&""===h&&""===o[0]||"."!==h&&""!==h||(e=!0,o.splice(f,1),f--)}"."!==o[0]||2!==o.length||"."!==o[1]&&""!==o[1]||(e=!0,o.pop())}for(var p=0;-1!==(p=o.indexOf("..",p+1));){var d=o[p-1];if(d&&"."!==d&&".."!==d&&"**"!==d){e=!0;var g=1===p&&"**"===o[p+1]?["."]:[];o.splice.apply(o,[p-1,2].concat(g)),0===o.length&&o.push(""),p-=2}}}}catch(t){n.e(t)}finally{n.f()}}while(e);return t}},{key:"secondPhasePreProcess",value:function(t){for(var e=0;e<t.length-1;e++)for(var r=e+1;r<t.length;r++){var n=this.partsMatch(t[e],t[r],!this.preserveMultipleSlashes);n&&(t[e]=n,t[r]=[])}return t.filter((function(t){return t.length}))}},{key:"partsMatch",value:function(t,e){for(var r=arguments.length>2&&void 0!==arguments[2]&&arguments[2],n=0,o=0,i=[],a="";n<t.length&&o<e.length;)if(t[n]===e[o])i.push("b"===a?e[o]:t[n]),n++,o++;else if(r&&"**"===t[n]&&e[o]===t[n+1])i.push(t[n]),n++;else if(r&&"**"===e[o]&&t[n]===e[o+1])i.push(e[o]),o++;else if("*"!==t[n]||!e[o]||!this.options.dot&&e[o].startsWith(".")||"**"===e[o]){if("*"!==e[o]||!t[n]||!this.options.dot&&t[n].startsWith(".")||"**"===t[n])return!1;if("a"===a)return!1;a="b",i.push(e[o]),n++,o++}else{if("b"===a)return!1;a="a",i.push(t[n]),n++,o++}return t.length===e.length&&i}},{key:"parseNegate",value:function(){if(!this.nonegate){for(var t=this.pattern,e=!1,r=0,n=0;n<t.length&&"!"===t.charAt(n);n++)e=!e,r++;r&&(this.pattern=t.slice(r)),this.negate=e}}},{key:"matchOne",value:function(t,e){var r=arguments.length>2&&void 0!==arguments[2]&&arguments[2],n=this.options;if(this.isWindows){var o=""===t[0]&&""===t[1]&&"?"===t[2]&&"string"==typeof t[3]&&/^[a-z]:$/i.test(t[3]),i=""===e[0]&&""===e[1]&&"?"===e[2]&&"string"==typeof e[3]&&/^[a-z]:$/i.test(e[3]);if(o&&i){var a=t[3],s=e[3];a.toLowerCase()===s.toLowerCase()&&(t[3]=s)}else if(i&&"string"==typeof t[0]){var u=e[3],c=t[0];u.toLowerCase()===c.toLowerCase()&&(e[3]=c,e=e.slice(3))}else if(o&&"string"==typeof e[0]){var l=t[3];l.toLowerCase()===e[0].toLowerCase()&&(e[0]=l,t=t.slice(3))}}var f=this.options.optimizationLevel;(void 0===f?1:f)>=2&&(t=this.levelTwoFileOptimize(t)),this.debug("matchOne",this,{file:t,pattern:e}),this.debug("matchOne",t.length,e.length);for(var h=0,p=0,d=t.length,g=e.length;h<d&&p<g;h++,p++){this.debug("matchOne loop");var v=e[p],y=t[h];if(this.debug(e,v,y),!1===v)return!1;if(v===ee){this.debug("GLOBSTAR",[e,v,y]);var m=h,b=p+1;if(b===g){for(this.debug("** at the end");h<d;h++)if("."===t[h]||".."===t[h]||!n.dot&&"."===t[h].charAt(0))return!1;return!0}for(;m<d;){var w=t[m];if(this.debug("\nglobstar while",t,m,e,b,w),this.matchOne(t.slice(m),e.slice(b),r))return this.debug("globstar found match!",m,d,w),!0;if("."===w||".."===w||!n.dot&&"."===w.charAt(0)){this.debug("dot detected!",t,m,e,b);break}this.debug("globstar swallow a segment, and continue"),m++}return!(!r||(this.debug("\n>>> no match, partial?",t,m,e,b),m!==d))}var x=void 0;if("string"==typeof v?(x=y===v,this.debug("string match",v,y,x)):(x=v.test(y),this.debug("pattern match",v,y,x)),!x)return!1}if(h===d&&p===g)return!0;if(h===d)return r;if(p===g)return h===d-1&&""===t[h];throw new Error("wtf?")}},{key:"braceExpand",value:function(){return ce(this.pattern,this.options)}},{key:"parse",value:function(t){var e=this;le(t);var r,n=this.options;if("**"===t)return ee;if(""===t)return"";var o=null;(r=t.match(zt))?o=n.dot?Gt:qt:(r=t.match(Rt))?o=(n.nocase?n.dot?Dt:Ut:n.dot?Mt:Lt)(r[1]):(r=t.match(Ht))?o=(n.nocase?n.dot?Zt:Xt:n.dot?Yt:Kt)(r):(r=t.match(Ft))?o=n.dot?Bt:$t:(r=t.match(Wt))&&(o=Vt);for(var i,a,s="",u=!1,c=!1,l=[],f=[],h=!1,p=!1,d="."===t.charAt(0),g=n.dot||d,v=function(t){return"."===t.charAt(0)?"":n.dot?"(?!(?:^|\\/)\\.{1,2}(?:$|\\/))":"(?!\\.)"},y=function(){if(h){switch(h){case"*":s+=oe,u=!0;break;case"?":s+=ne,u=!0;break;default:s+="\\"+h}e.debug("clearStateChar %j %j",h,s),h=!1}},m=0;m<t.length&&(a=t.charAt(m));m++)if(this.debug("%s\t%s %s %j",t,m,s,a),c){if("/"===a)return!1;ae[a]&&(s+="\\"),s+=a,c=!1}else switch(a){case"/":return!1;case"\\":y(),c=!0;continue;case"?":case"*":case"+":case"@":case"!":this.debug("%s\t%s %s %j <-- stateChar",t,m,s,a),this.debug("call clearStateChar %j",h),y(),h=a,n.noext&&y();continue;case"(":if(!h){s+="\\(";continue}var b={type:h,start:m-1,reStart:s.length,open:re[h].open,close:re[h].close};this.debug(this.pattern,"\t",b),l.push(b),s+=b.open,0===b.start&&"!"!==b.type&&(d=!0,s+=v(t.slice(m+1))),this.debug("plType %j %j",h,s),h=!1;continue;case")":var w=l[l.length-1];if(!w){s+="\\)";continue}l.pop(),y(),u=!0,s+=(i=w).close,"!"===i.type&&f.push(Object.assign(i,{reEnd:s.length}));continue;case"|":var x=l[l.length-1];if(!x){s+="\\|";continue}y(),s+="|",0===x.start&&"!"!==x.type&&(d=!0,s+=v(t.slice(m+1)));continue;case"[":y();var O=Tt(bt(t,m),4),A=O[0],j=O[1],P=O[2],S=O[3];P?(s+=A,p=p||j,m+=P-1,u=u||S):s+="\\[";continue;case"]":s+="\\"+a;continue;default:y(),s+=he(a)}for(i=l.pop();i;i=l.pop()){var E=void 0;E=s.slice(i.reStart+i.open.length),this.debug(this.pattern,"setting tail",s,i),E=E.replace(/((?:\\{2}){0,64})(\\?)\|/g,(function(t,e,r){return r||(r="\\"),e+e+r+"|"})),this.debug("tail=%j\n   %s",E,E,i,s);var N="*"===i.type?oe:"?"===i.type?ne:"\\"+i.type;u=!0,s=s.slice(0,i.reStart)+N+"\\("+E}y(),c&&(s+="\\\\");for(var T=se[s.charAt(0)],k=f.length-1;k>-1;k--){for(var C=f[k],I=s.slice(0,C.reStart),_=s.slice(C.reStart,C.reEnd-8),R=s.slice(C.reEnd),L=s.slice(C.reEnd-8,C.reEnd)+R,M=I.split(")").length,U=I.split("(").length-M,D=R,F=0;F<U;F++)D=D.replace(/\)[+*?]?/,"");s=I+_+(R=D)+(""===R?"(?:$|\\/)":"")+L}if(""!==s&&u&&(s="(?=.)"+s),T&&(s=(d?"":g?"(?!(?:^|\\/)\\.{1,2}(?:$|\\/))":"(?!\\.)")+s),!n.nocase||u||n.nocaseMagicOnly||(u=t.toUpperCase()!==t.toLowerCase()),!u)return s.replace(/\\(.)/g,"$1");var $=(n.nocase?"i":"")+(p?"u":"");try{var B=o?{_glob:t,_src:s,test:o}:{_glob:t,_src:s};return Object.assign(new RegExp("^"+s+"$",$),B)}catch(t){return this.debug("invalid regexp",t),new RegExp("$.")}}},{key:"makeRe",value:function(){if(this.regexp||!1===this.regexp)return this.regexp;var t=this.set;if(!t.length)return this.regexp=!1,this.regexp;var e=this.options,r=e.noglobstar?oe:e.dot?"(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?":"(?:(?!(?:\\/|^)\\.).)*?",n=e.nocase?"i":"",o=t.map((function(t){var e=t.map((function(t){return"string"==typeof t?he(t):t===ee?ee:t._src}));return e.forEach((function(t,n){var o=e[n+1],i=e[n-1];t===ee&&i!==ee&&(void 0===i?void 0!==o&&o!==ee?e[n+1]="(?:\\/|"+r+"\\/)?"+o:e[n]=r:void 0===o?e[n-1]=i+"(?:\\/|"+r+")?":o!==ee&&(e[n-1]=i+"(?:\\/|\\/"+r+"\\/)"+o,e[n+1]=ee))})),e.filter((function(t){return t!==ee})).join("/")})).join("|");o="^(?:"+o+")$",this.negate&&(o="^(?!"+o+").*$");try{this.regexp=new RegExp(o,n)}catch(t){this.regexp=!1}return this.regexp}},{key:"slashSplit",value:function(t){return this.preserveMultipleSlashes?t.split("/"):this.isWindows&&/^\/\/[^\/]+/.test(t)?[""].concat(wt(t.split(/\/+/))):t.split(/\/+/)}},{key:"match",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.partial;if(this.debug("match",t,this.pattern),this.comment)return!1;if(this.empty)return""===t;if("/"===t&&e)return!0;var r=this.options;this.isWindows&&(t=t.split("\\").join("/"));var n=this.slashSplit(t);this.debug(this.pattern,"split",n);var o=this.set;this.debug(this.pattern,"set",o);var i=n[n.length-1];if(!i)for(var a=n.length-2;!i&&a>=0;a--)i=n[a];for(var s=0;s<o.length;s++){var u=o[s],c=n;if(r.matchBase&&1===u.length&&(c=[i]),this.matchOne(c,u,e))return!!r.flipNegate||!this.negate}return!r.flipNegate&&this.negate}}],[{key:"defaults",value:function(t){return It.defaults(t).Minimatch}}]),t}();function de(t){var e=new Error("".concat(arguments.length>1&&void 0!==arguments[1]?arguments[1]:"","Invalid response: ").concat(t.status," ").concat(t.statusText));return e.status=t.status,e.response=t,e}function ge(t,e){var r=e.status;if(401===r&&t.digest)return e;if(r>=400)throw de(e);return e}function ve(t,e){return arguments.length>2&&void 0!==arguments[2]&&arguments[2]?{data:e,headers:t.headers?tt(t.headers):{},status:t.status,statusText:t.statusText}:e}It.Minimatch=pe,It.escape=function(t){var e=(arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}).windowsPathsNoEscape;return void 0!==e&&e?t.replace(/[?*()[\]]/g,"[$&]"):t.replace(/[?*()[\]\\]/g,"\\$&")},It.unescape=function(t){var e=(arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}).windowsPathsNoEscape;return void 0!==e&&e?t.replace(/\[([^\/\\])\]/g,"$1"):t.replace(/((?!\\).|^)\[([^\/\\])\]/g,"$1$2").replace(/\\([^\/])/g,"$1")};var ye,me=function(t){return function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e,r){var n,o,i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},a=ht({url:j(t.remoteURL,x(e)),method:"COPY",headers:{Destination:j(t.remoteURL,x(r))}},t,i);return o=function(e){ge(t,e)},(n=ft(a))&&n.then||(n=Promise.resolve(n)),o?n.then(o):n})),be=r(5),we=r(421),xe=r.n(we);function Oe(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,n=new Array(e);r<e;r++)n[r]=t[r];return n}function Ae(t){return Ae="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},Ae(t)}function je(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:ye.Original,n=xe().get(t,e);return"array"===r&&!1===Array.isArray(n)?[n]:"object"===r&&Array.isArray(n)?n[0]:n}function Pe(t){return new Promise((function(e){e(function(t){var e=t.multistatus;if(""===e)return{multistatus:{response:[]}};if(!e)throw new Error("Invalid response: No root multistatus found");var r={multistatus:Array.isArray(e)?e[0]:e};return xe().set(r,"multistatus.response",je(r,"multistatus.response",ye.Array)),xe().set(r,"multistatus.response",xe().get(r,"multistatus.response").map((function(t){return function(t){var e=Object.assign({},t);return e.status?xe().set(e,"status",je(e,"status",ye.Object)):(xe().set(e,"propstat",je(e,"propstat",ye.Object)),xe().set(e,"propstat.prop",je(e,"propstat.prop",ye.Object))),e}(t)}))),r}(new be.XMLParser({removeNSPrefix:!0,numberParseOptions:{hex:!0,leadingZeros:!1}}).parse(t)))}))}function Se(t,e){var r,n,o=arguments.length>2&&void 0!==arguments[2]&&arguments[2],i=t.getlastmodified,a=void 0===i?null:i,s=t.getcontentlength,u=void 0===s?"0":s,c=t.resourcetype,l=void 0===c?null:c,f=t.getcontenttype,h=void 0===f?null:f,p=t.getetag,d=void 0===p?null:p,g=l&&"object"===Ae(l)&&void 0!==l.collection?"directory":"file",v=(r=e,(n=document.createElement("textarea")).innerHTML=r,n.value),y={filename:v,basename:m().basename(v),lastmod:a,size:parseInt(u,10),type:g,etag:"string"==typeof d?d.replace(/"/g,""):null};return"file"===g&&(y.mime=h&&"string"==typeof h?h.split(";")[0]:""),o&&(y.props=t),y}function Ee(t,e){var r=arguments.length>2&&void 0!==arguments[2]&&arguments[2],n=null;try{t.multistatus.response[0].propstat&&(n=t.multistatus.response[0])}catch(t){}if(!n)throw new Error("Failed getting item stat: bad response");var o,i,a=n.propstat,s=a.prop,u=(o=a.status.split(" ",3),i=3,function(t){if(Array.isArray(t))return t}(o)||function(t,e){var r=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=r){var n,o,i=[],a=!0,s=!1;try{for(r=r.call(t);!(a=(n=r.next()).done)&&(i.push(n.value),!e||i.length!==e);a=!0);}catch(t){s=!0,o=t}finally{try{a||null==r.return||r.return()}finally{if(s)throw o}}return i}}(o,i)||function(t,e){if(t){if("string"==typeof t)return Oe(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?Oe(t,e):void 0}}(o,i)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()),c=(u[0],u[1]),l=u[2],f=parseInt(c,10);if(f>=400){var h=new Error("Invalid response: ".concat(f," ").concat(l));throw h.status=f,h}return Se(s,A(e),r)}function Ne(t){switch(t.toString()){case"-3":return"unlimited";case"-2":case"-1":return"unknown";default:return parseInt(t,10)}}function Te(t,e,r){return r?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}!function(t){t.Array="array",t.Object="object",t.Original="original"}(ye||(ye={}));var ke=function(t){return function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},n=r.details,o=void 0!==n&&n,i=ht({url:j(t.remoteURL,x(e)),method:"PROPFIND",headers:{Accept:"text/plain,application/xml",Depth:"0"}},t,r);return Te(ft(i),(function(r){return ge(t,r),Te(r.text(),(function(t){return Te(Pe(t),(function(t){var n=Ee(t,e,o);return ve(r,n,o)}))}))}))}));function Ce(t,e,r){return r?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}function Ie(t){return function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}function _e(){}function Re(t,e){if(!e)return t&&t.then?t.then(_e):Promise.resolve()}var Le="undefined"!=typeof Symbol?Symbol.iterator||(Symbol.iterator=Symbol("Symbol.iterator")):"@@iterator";function Me(t,e,r){if(!t.s){if(r instanceof Ue){if(!r.s)return void(r.o=Me.bind(null,t,e));1&e&&(e=r.s),r=r.v}if(r&&r.then)return void r.then(Me.bind(null,t,e),Me.bind(null,t,2));t.s=e,t.v=r;var n=t.o;n&&n(t)}}var Ue=function(){function t(){}return t.prototype.then=function(e,r){var n=new t,o=this.s;if(o){var i=1&o?e:r;if(i){try{Me(n,1,i(this.v))}catch(t){Me(n,2,t)}return n}return this}return this.o=function(t){try{var o=t.v;1&t.s?Me(n,1,e?e(o):o):r?Me(n,1,r(o)):Me(n,2,o)}catch(t){Me(n,2,t)}},n},t}();function De(t){return t instanceof Ue&&1&t.s}function Fe(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function $e(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?Fe(Object(r),!0).forEach((function(e){Be(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):Fe(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function Be(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}var We=Ie((function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},n=function(t){if(!t||"/"===t)return[];var e=t,r=[];do{r.push(e),e=m().dirname(e)}while(e&&"/"!==e);return r}(A(e));n.sort((function(t,e){return t.length>e.length?1:e.length>t.length?-1:0}));var o=!1;return function(t,e,r){if("function"==typeof t[Le]){var n,o,i,a=t[Le]();if(function t(s){try{for(;!((n=a.next()).done||r&&r());)if((s=e(n.value))&&s.then){if(!De(s))return void s.then(t,i||(i=Me.bind(null,o=new Ue,2)));s=s.v}o?Me(o,1,s):o=s}catch(t){Me(o||(o=new Ue),2,t)}}(),a.return){var s=function(t){try{n.done||a.return()}catch(t){}return t};if(o&&o.then)return o.then(s,(function(t){throw s(t)}));s()}return o}if(!("length"in t))throw new TypeError("Object is not iterable");for(var u=[],c=0;c<t.length;c++)u.push(t[c]);return function(t,e,r){var n,o,i=-1;return function a(s){try{for(;++i<t.length&&(!r||!r());)if((s=e(i))&&s.then){if(!De(s))return void s.then(a,o||(o=Me.bind(null,n=new Ue,2)));s=s.v}n?Me(n,1,s):n=s}catch(t){Me(n||(n=new Ue),2,t)}}(),n}(u,(function(t){return e(u[t])}),r)}(n,(function(n){return i=function(){return function(r,o){try{var i=Ce(ke(t,n),(function(t){if("directory"!==t.type)throw new Error("Path includes a file: ".concat(e))}))}catch(t){return o(t)}return i&&i.then?i.then(void 0,o):i}(0,(function(e){var i=e;return function(){if(404===i.status)return o=!0,Re(Ve(t,n,$e($e({},r),{},{recursive:!1})));throw e}()}))},(a=function(){if(o)return Re(Ve(t,n,$e($e({},r),{},{recursive:!1})))}())&&a.then?a.then(i):i();var i,a}),(function(){return!1}))})),Ve=Ie((function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};if(!0===r.recursive)return We(t,e,r);var n,o=ht({url:j(t.remoteURL,(n=x(e),n.endsWith("/")?n:n+"/")),method:"MKCOL"},t,r);return Ce(ft(o),(function(e){ge(t,e)}))}));var ze=r(227),qe=r.n(ze);function Ge(t){return Ge="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},Ge(t)}var He=function(t){return function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},n={};if("object"===Ge(r.range)&&"number"==typeof r.range.start){var o="bytes=".concat(r.range.start,"-");"number"==typeof r.range.end&&(o="".concat(o).concat(r.range.end)),n.Range=o}var i,a,s=ht({url:j(t.remoteURL,x(e)),method:"GET",headers:n},t,r);return a=function(e){if(ge(t,e),n.Range&&206!==e.status){var o=new Error("Invalid response code for partial request: ".concat(e.status));throw o.status=e.status,o}return r.callback&&setTimeout((function(){r.callback(e)}),0),e.body},(i=ft(s))&&i.then||(i=Promise.resolve(i)),a?i.then(a):i})),Xe=function(){},Ze=function(t){return function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e,r){r.url||(r.url=j(t.remoteURL,x(e)));var n,o,i=ht(r,t,{});return o=function(e){return ge(t,e),e},(n=ft(i))&&n.then||(n=Promise.resolve(n)),o?n.then(o):n})),Ye=function(t){return function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e){var r,n,o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},i=ht({url:j(t.remoteURL,x(e)),method:"DELETE"},t,o);return n=function(e){ge(t,e)},(r=ft(i))&&r.then||(r=Promise.resolve(r)),n?r.then(n):r})),Ke=function(t){return function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return function(n,o){try{var i=(a=ke(t,e,r),s=function(){return!0},u?s?s(a):a:(a&&a.then||(a=Promise.resolve(a)),s?a.then(s):a))}catch(t){return o(t)}var a,s,u;return i&&i.then?i.then(void 0,o):i}(0,(function(t){if(404===t.status)return!1;throw t}))}));function Je(t,e,r){return r?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}var Qe=function(t){return function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},n=ht({url:j(t.remoteURL,x(e),"/"),method:"PROPFIND",headers:{Accept:"text/plain,application/xml",Depth:r.deep?"infinity":"1"}},t,r);return Je(ft(n),(function(n){return ge(t,n),Je(n.text(),(function(o){if(!o)throw new Error("Failed parsing directory contents: Empty response");return Je(Pe(o),(function(o){var i=O(e),a=function(t,e,r){var n=arguments.length>3&&void 0!==arguments[3]&&arguments[3],o=arguments.length>4&&void 0!==arguments[4]&&arguments[4],i=m().join(e,"/"),a=t.multistatus.response.map((function(t){var e=function(t){try{return t.replace(/^https?:\/\/[^\/]+/,"")}catch(t){throw new g(t,"Failed normalising HREF")}}(t.href);return Se(t.propstat.prop,"/"===i?decodeURIComponent(A(e)):A(m().relative(decodeURIComponent(i),decodeURIComponent(e))),n)}));return o?a:a.filter((function(t){return t.basename&&("file"===t.type||t.filename!==r.replace(/\/$/,""))}))}(o,O(t.remoteBasePath||t.remotePath),i,r.details,r.includeSelf);return r.glob&&(a=function(t,e){return t.filter((function(t){return _t(t.filename,e,{matchBase:!0})}))}(a,r.glob)),ve(n,a,r.details)}))}))}))}));function tr(t){return function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}var er=tr((function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},n=ht({url:j(t.remoteURL,x(e)),method:"GET",headers:{Accept:"text/plain"},transformResponse:[ir]},t,r);return rr(ft(n),(function(e){return ge(t,e),rr(e.text(),(function(t){return ve(e,t,r.details)}))}))}));function rr(t,e,r){return r?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}var nr=tr((function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},n=ht({url:j(t.remoteURL,x(e)),method:"GET"},t,r);return rr(ft(n),(function(e){var n;return ge(t,e),function(t,e){var r=t();return r&&r.then?r.then(e):e()}((function(){return rr(e.arrayBuffer(),(function(t){n=t}))}),(function(){return ve(e,n,r.details)}))}))})),or=tr((function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},n=r.format,o=void 0===n?"binary":n;if("binary"!==o&&"text"!==o)throw new g({info:{code:_.InvalidOutputFormat}},"Invalid output format: ".concat(o));return"text"===o?er(t,e,r):nr(t,e,r)})),ir=function(t){return t};function ar(t){return ar="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},ar(t)}function sr(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function ur(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function cr(t){return new be.XMLBuilder({attributeNamePrefix:"@_",format:!0,ignoreAttributes:!1,suppressEmptyNode:!0}).build(lr({lockinfo:{"@_xmlns:d":"DAV:",lockscope:{exclusive:{}},locktype:{write:{}},owner:{href:t}}},"d"))}function lr(t,e){var r=function(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?sr(Object(r),!0).forEach((function(e){ur(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):sr(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}({},t);for(var n in r)r.hasOwnProperty(n)&&(r[n]&&"object"===ar(r[n])&&-1===n.indexOf(":")?(r["".concat(e,":").concat(n)]=lr(r[n],e),delete r[n]):!1===/^@_/.test(n)&&(r["".concat(e,":").concat(n)]=r[n],delete r[n]));return r}function fr(t,e,r){return r?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}function hr(t){return function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}var pr=hr((function(t,e,r){var n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},o=ht({url:j(t.remoteURL,x(e)),method:"UNLOCK",headers:{"Lock-Token":r}},t,n);return fr(ft(o),(function(e){if(ge(t,e),204!==e.status&&200!==e.status)throw de(e)}))})),dr=hr((function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},n=r.refreshToken,o=r.timeout,i={Accept:"text/plain,application/xml",Timeout:void 0===o?gr:o};n&&(i.If=n);var a=ht({url:j(t.remoteURL,x(e)),method:"LOCK",headers:i,data:cr(t.contactHref)},t,r);return fr(ft(a),(function(e){return ge(t,e),fr(e.text(),(function(t){var r,n=(r=t,new be.XMLParser({removeNSPrefix:!0,parseAttributeValue:!0,parseTagValue:!0}).parse(r)),o=xe().get(n,"prop.lockdiscovery.activelock.locktoken.href"),i=xe().get(n,"prop.lockdiscovery.activelock.timeout");if(!o)throw de(e,"No lock token received: ");return{token:o,serverTimeout:i}}))}))})),gr="Infinite, Second-4100000000";function vr(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,n=new Array(e);r<e;r++)n[r]=t[r];return n}function yr(t,e,r){return r?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}var mr=function(t){return function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=e.path||"/",n=ht({url:j(t.remoteURL,r),method:"PROPFIND",headers:{Accept:"text/plain,application/xml",Depth:"0"}},t,e);return yr(ft(n),(function(r){return ge(t,r),yr(r.text(),(function(t){return yr(Pe(t),(function(t){var n=function(t){try{var e=(o=t.multistatus.response,i=1,function(t){if(Array.isArray(t))return t}(o)||function(t,e){var r=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=r){var n,o,i=[],a=!0,s=!1;try{for(r=r.call(t);!(a=(n=r.next()).done)&&(i.push(n.value),!e||i.length!==e);a=!0);}catch(t){s=!0,o=t}finally{try{a||null==r.return||r.return()}finally{if(s)throw o}}return i}}(o,i)||function(t,e){if(t){if("string"==typeof t)return vr(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?vr(t,e):void 0}}(o,i)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}())[0].propstat.prop,r=e["quota-used-bytes"],n=e["quota-available-bytes"];return void 0!==r&&void 0!==n?{used:parseInt(r,10),available:Ne(n)}:null}catch(t){}var o,i;return null}(t);return ve(r,n,e.details)}))}))}))}));function br(t,e,r){return r?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}var wr=function(t){return function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},n=r.details,o=void 0!==n&&n,i=ht({url:j(t.remoteURL,x(e)),method:"SEARCH",headers:{Accept:"text/plain,application/xml","Content-Type":t.headers["Content-Type"]||"application/xml; charset=utf-8"}},t,r);return br(ft(i),(function(r){return ge(t,r),br(r.text(),(function(t){return br(Pe(t),(function(t){var n=function(t,e,r){var n={truncated:!1,results:[]};return n.truncated=t.multistatus.response.some((function(t){var r,n;return"507"===(null===(r=(t.status||(null===(n=t.propstat)||void 0===n?void 0:n.status)).split(" ",3))||void 0===r?void 0:r[1])&&t.href.replace(/\/$/,"").endsWith(x(e).replace(/\/$/,""))})),t.multistatus.response.forEach((function(t){if(void 0!==t.propstat){var e=t.href.split("/").map(decodeURIComponent).join("/");n.results.push(Se(t.propstat.prop,e,r))}})),n}(t,e,o);return ve(r,n,o)}))}))}))})),xr=function(t){return function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e,r){var n,o,i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},a=ht({url:j(t.remoteURL,x(e)),method:"MOVE",headers:{Destination:j(t.remoteURL,x(r))}},t,i);return o=function(e){ge(t,e)},(n=ft(a))&&n.then||(n=Promise.resolve(n)),o?n.then(o):n})),Or=r(918),Ar=function(t){return function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}((function(t,e,r){var n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},o=n.contentLength,i=void 0===o||o,a=n.overwrite,s=void 0===a||a,u={"Content-Type":"application/octet-stream"};!1===i||(u["Content-Length"]="".concat("number"==typeof i?i:function(t){if(ot(t))return t.byteLength;if(it(t))return t.length;if("string"==typeof t)return(0,Or.k)(t);throw new g({info:{code:_.DataTypeNoLength}},"Cannot calculate data length: Invalid type")}(r))),s||(u["If-None-Match"]="*");var c,l,f=ht({url:j(t.remoteURL,x(e)),method:"PUT",headers:u,data:r},t,n);return l=function(e){try{ge(t,e)}catch(t){var r=t;if(412!==r.status||s)throw r;return!1}return!0},(c=ft(f))&&c.then||(c=Promise.resolve(c)),l?c.then(l):c})),jr="https://github.com/perry-mitchell/webdav-client/blob/master/LOCK_CONTACT.md";function Pr(t){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=r.authType,o=void 0===n?null:n,i=r.remoteBasePath,a=r.contactHref,s=void 0===a?jr:a,u=r.ha1,c=r.headers,l=void 0===c?{}:c,f=r.httpAgent,h=r.httpsAgent,p=r.password,d=r.token,v=r.username,y=r.withCredentials,m=o;m||(m=v||p?I.Password:I.None);var b,w,O={authType:m,remoteBasePath:i,contactHref:s,ha1:u,headers:Object.assign({},l),httpAgent:f,httpsAgent:h,password:p,remotePath:(b=t,w=new(e())(b).pathname,w.length<=0&&(w="/"),A(w)),remoteURL:t,token:d,username:v,withCredentials:y};return function(t,e,r,n,o){switch(t.authType){case I.Digest:t.digest=function(t,e,r){return{username:t,password:e,ha1:r,nc:0,algorithm:"md5",hasDigestAuth:!1}}(e,r,o);break;case I.None:break;case I.Password:t.headers.Authorization=function(t,e){var r,n=(r="".concat(t,":").concat(e),k().encode(r));return"Basic ".concat(n)}(e,r);break;case I.Token:t.headers.Authorization="".concat((i=n).token_type," ").concat(i.access_token);break;default:throw new g({info:{code:_.InvalidAuthType}},"Invalid auth type: ".concat(t.authType))}var i}(O,v,p,d,u),{copyFile:function(t,e,r){return me(O,t,e,r)},createDirectory:function(t,e){return Ve(O,t,e)},createReadStream:function(t,e){return function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},n=new(0,qe().PassThrough);return He(t,e,r).then((function(t){t.pipe(n)})).catch((function(t){n.emit("error",t)})),n}(O,t,e)},createWriteStream:function(t,e,r){return function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:Xe,o=new(0,qe().PassThrough),i={};!1===r.overwrite&&(i["If-None-Match"]="*");var a=ht({url:j(t.remoteURL,x(e)),method:"PUT",headers:i,data:o,maxRedirects:0},t,r);return ft(a).then((function(e){return ge(t,e)})).then((function(t){setTimeout((function(){n(t)}),0)})).catch((function(t){o.emit("error",t)})),o}(O,t,e,r)},customRequest:function(t,e){return Ze(O,t,e)},deleteFile:function(t,e){return Ye(O,t,e)},exists:function(t,e){return Ke(O,t,e)},getDirectoryContents:function(t,e){return Qe(O,t,e)},getFileContents:function(t,e){return or(O,t,e)},getFileDownloadLink:function(t){return function(t,e){var r=j(t.remoteURL,x(e)),n=/^https:/i.test(r)?"https":"http";switch(t.authType){case I.None:break;case I.Password:var o=C(t.headers.Authorization.replace(/^Basic /i,"").trim());r=r.replace(/^https?:\/\//,"".concat(n,"://").concat(o,"@"));break;default:throw new g({info:{code:_.LinkUnsupportedAuthType}},"Unsupported auth type for file link: ".concat(t.authType))}return r}(O,t)},getFileUploadLink:function(t){return function(t,e){var r="".concat(j(t.remoteURL,x(e)),"?Content-Type=application/octet-stream"),n=/^https:/i.test(r)?"https":"http";switch(t.authType){case I.None:break;case I.Password:var o=C(t.headers.Authorization.replace(/^Basic /i,"").trim());r=r.replace(/^https?:\/\//,"".concat(n,"://").concat(o,"@"));break;default:throw new g({info:{code:_.LinkUnsupportedAuthType}},"Unsupported auth type for file link: ".concat(t.authType))}return r}(O,t)},getHeaders:function(){return Object.assign({},O.headers)},getQuota:function(t){return mr(O,t)},lock:function(t,e){return dr(O,t,e)},moveFile:function(t,e,r){return xr(O,t,e,r)},putFileContents:function(t,e,r){return Ar(O,t,e,r)},search:function(t,e){return wr(O,t,e)},setHeaders:function(t){O.headers=Object.assign({},t)},stat:function(t,e){return ke(O,t,e)},unlock:function(t,e,r){return pr(O,t,e,r)}}}})();var o=n.Gr,i=n.jK,a=n.cf,s=n.HM,u=n.eI,c=n.lD,l=n.yY,f=n.sw,h=n.np,p=n._M;

/***/ })

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
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!***********************!*\
  !*** ./fileAction.js ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _nextcloud_files__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @nextcloud/files */ "../node_modules/@nextcloud/files/dist/index.mjs");
/**
 * Nextcloud - Files_PhotoSpheres
 *
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Robin Windey <ro.windey@gmail.com>
 *
 * @copyright Robin Windey 2019
 *
 * Injected via the OCA\Files::loadAdditionalScripts-callback.
 * Used to hook into the actionhandler for images.
 */


(function ($, OC, OCA) {

    "use strict";
    var photoSphereViewerFileAction = {
        /*
         * Holds the "old" action for an
         * image-click (e.g. gallery)
         */
        _oldActionHandler: null,

        /*
         *  The iframe dom element that holds the viewer.
         */
        _frameId: 'photo-sphere-viewer-frame',
        _frameContainer: null,
        _frameShowing: false,

        /*
         *  Photosphere mime-type
         */
        _photoShpereMimeType: 'image/jpeg',

        _isDirectoryShare: false,
        _sharingToken: '',
        _isSharedSingleFileViewer: false,

        _onClose: null,

        /**
         * Actionhandler for image-click
         * @param {Node} node The file to open
         * @param {any} view any The files view
         * @param {string} dir the directory path
         */
        _actionHandler: function(node, view, dir) {
            const fileName = node.path.replace(/^.*[\\/]/, '');
            const xmpResultModel = this._getDavXmpMeta(node);

            this._showImage(node, view, dir, fileName, xmpResultModel);
        },

        _legacyActionHandlerImage: function (fileName, context) {
            PhotosphereViewerFunctions.showLoader(true);
            // TODO :: add xmp-data to server request at
            // OCA.Sharing.PublicApp.fileList.filesClient?
            // This would make the ad-hoc ajax backend-request obsolete
            this.canShow(fileName, context, function (canShowImage, xmpResultModel) {
                if (canShowImage) {
                    // It's a photosphere image, show it
                    this._showImageLegacy(fileName, context, xmpResultModel);
                } else if (typeof (this._oldActionHandler) === 'function') {
                    // It's a normal image, call the default handler
                    PhotosphereViewerFunctions.showLoader(false);
                    this._oldActionHandler(fileName, context);
                } else {
                    // If there is no default handler trigger download
                    PhotosphereViewerFunctions.showLoader(false);
                    const fileObject = this._getFileObject(fileName, context);
                    window.location = this._getFileUrl(fileObject);
                }
            }.bind(this));
        },

        /**
         * Actionhandler for image-click
         * @param {Node} node The file to open
         * @param {any} view any The files view
         * @param {string} dir the directory path
         */
        _actionHandlerVideo: function(node, view, dir){
            const fileName = node.path.replace(/^.*[\\/]/, '');
            const fileUrl = node.source;
            this.showFrame(fileUrl, fileName, null, 'video');
        },

        /*
         * Photosphere Viewer action for jpeg-images
         */
        _getAction: function () {
            return {
                id: "photosphereviewer-image",
                exec: this._actionHandler.bind(this),
                displayName: () => "View in PhotoSphereViewer",
                iconSvgInline: () => "",
                order: -1,  // Make sure we get a higher priority than the viewer app
                default: _nextcloud_files__WEBPACK_IMPORTED_MODULE_0__.DefaultType.DEFAULT,
                enabled: (nodes) => {
                    const enabled = nodes.every(node => {
                        const meta = this._getDavXmpMeta(node);
                        return (node.permissions & _nextcloud_files__WEBPACK_IMPORTED_MODULE_0__.Permission.READ) !== 0
                            && node.mime === this._photoShpereMimeType
                            && meta
                            && meta.usePanoramaViewer === 1;
                    });

                    // Notify user if we would show a Photosphere but WebGL/WebGL2 is not supported
                    if (enabled && !PhotosphereViewerFunctions.isWebGl2Supported()) {
                        PhotosphereViewerFunctions.notify("Your browser doesn't support WebGL/WebGL2. Please enable WebGL/WebGL2 support in the browser settings.", "error");
                        return false;
                    }

                    return enabled;
                },
            };
        },

        _getVideoAction: function() {
            return {
                id: "photosphereviewer-video",
                exec: this._actionHandlerVideo.bind(this),
                displayName: () => "View in 360° viewer",
                iconSvgInline: () => "",
                order: 1000,
                enabled: (nodes) => nodes.every(node => (
                    node.permissions & _nextcloud_files__WEBPACK_IMPORTED_MODULE_0__.Permission.READ) !== 0 && 
                    node.mime === 'video/mp4')
            };
        },

        _getDirectorySharePathFromCurrentLocation: function () {
            var searchParams = new URLSearchParams(document.location.search);
            var path = searchParams.get('path');
            if (!path) {
                path = '/';
            }
            return path;
        },

        _getFileUrl(fileObject){
            var file = encodeURIComponent(fileObject.name);
            if (!this._isDirectoryShare) {
                // "normal" user-view
                var path = fileObject.path;
                if (path == '/'){
                    path = '';
                }
                return `${OC.getRootPath()}/remote.php/webdav${path}/${file}`;
            } 
            // directory-share
            var path = encodeURIComponent(this._getDirectorySharePathFromCurrentLocation());
            return `${OC.getRootPath()}/index.php/s/${this._sharingToken}/download?path=${path}&files=${file}`;
        },

        /*
         * Returns the xmp-metadata from the node (delivered by backend)
         */
        _getDavXmpMeta: function (node) {
            return node.attributes['files-photospheres-xmp-metadata'];
        },

        /*
         * Generates the url and jumps
         * to the photosphere app
         */
        _showImage: function (node, view, dir, fileName, xmpResultModel) {
            var imageUrl = node.source;
            var urlParams = {
                url: imageUrl,
                filename: fileName
            };

            // Add xmpData to url-params, if we have some
            if (xmpResultModel) {
                urlParams = $.extend(urlParams, xmpResultModel);
            }

            this.showFrame(imageUrl, fileName, xmpResultModel, 'image');

            // Push to history (new API)
            const oldRoute = [
                window.OCP.Files.Router.name,
                window.OCP.Files.Router.params,
                window.OCP.Files.Router.query,
                true,
            ];
            this._onClose = () => window.OCP.Files.Router.goToRoute(...oldRoute);
            window.OCP.Files.Router.goToRoute(
                null,
                { view: view.id, fileid: node.fileid },
                { dir, openfile: true },
                true,
            );
        },

        _showImageLegacy: function (fileName, context, xmpResultModel) {
            const fileObject = this._getFileObject(fileName, context);
            var imageUrl = this._getFileUrl(fileObject);
            var urlParams = {
                url: imageUrl,
                filename: fileName
            };

            // Add xmpData to url-params, if we have some
            if (xmpResultModel) {
                urlParams = $.extend(urlParams, xmpResultModel);
            }

            this.showFrame(imageUrl, fileName, xmpResultModel, 'image');

            // Push to history legacy
            const oldQuery = location.search.replace(/^\?/, '');
	        this._onClose = () => OC.Util.History.pushState(oldQuery);
            const fileid = context.fileInfoModel.get('id');
            const params = OC.Util.History.parseUrlQuery();
            const dir = params.dir;
            delete params.dir;
            delete params.fileid;
            params.openfile = fileid;
            const query = 'dir=' + encodePath(dir) + '&' + OC.buildQueryString(params);
            OC.Util.History.pushState(query);
        },

        _listenForCloseMessage: function (msg) {
            if (msg.data === 'closePhotosphereViewer') {
                this._closeAndRemoveListener();
            }
        },

        _closeAndRemoveListener: function () {
            // History back will remove the custom url state
            // and trigger the hideFrame function
            //history.back();
            this.hideFrame();
            window.removeEventListener("message", this._listenForCloseMessage, false);
        },

        /**
         * Injects the iframe with the viewer into the current page.
         * Suiteable for both the sharing option (based on a token) and the authenticated explorer view (filename).
         * @param {string} imageUrl         - The url from which the panorama can be loaded
         * @param {string} fileName    - The name of the image. Used as caption in the viewer.
         * @param {object} xmpResultModel   - The xmp-information, read from the server.
         * @param {string} frameType        - image or video
         */
        showFrame: function (imageUrl, fileName, xmpResultModel, frameType) {
            var self = this;
            var appUrl = '';
            var configObject;

            switch(frameType){
                case 'image':
                    appUrl = OC.generateUrl('apps/files_photospheres');
                    configObject = {
                        panorama: imageUrl,
                        caption: fileName
                    };
                    break;
                case 'video':
                    appUrl = OC.generateUrl('apps/files_photospheres/video');
                    configObject = {
                        url: imageUrl,
                        caption: fileName
                    };
                    break;
            }

            // Add xmpData (cropping-info) to image-viewer-params, if we have some
            if (frameType == 'image' && xmpResultModel && xmpResultModel.containsCroppingConfig) {
                var extendObject = {
                    panoData: xmpResultModel.croppingConfig
                };
                configObject = $.extend(configObject, extendObject);
            }

            this._frameContainer = $(`<iframe id="${this._frameId}" src="${appUrl}" allowfullscreen="true"/>`);
            $('body').after(this._frameContainer);

            const hideDownload = $('#hideDownload').val() === 'true';
            const hideCloseButton = self._isSharedSingleFileViewer;

            this._frameContainer.on('load', function () {
                // Viewer is rendered via helper-class in the
                // iframe. After the frame has loaded, provide
                // appropriate config object for rendering the component.
                var frameWindow = this.contentWindow.window;

                switch(frameType){
                    case 'image':
                        frameWindow.photoSphereViewerRenderer.render(configObject, hideDownload, hideCloseButton);
                        break;
                    case 'video':
                        frameWindow.photoSphereVideoRenderer.render(configObject);
                        break;
                }

                // Register ESC listener on iframe
                frameWindow.addEventListener("keyup", self._onKeyUp.bind(self));

                $('body').addClass('showing-photo-sphere-viewer-frame');
                PhotosphereViewerFunctions.showLoader(false);

                self._frameShowing = true;
            });
        },

        /*
         *  Removes the injected iframe that contains the viewer.
         */
        hideFrame: function () {
            if (this._frameContainer != null && document.contains(this._frameContainer[0])) {
                this._frameContainer.detach();
                this._frameContainer = null;
                $('body').removeClass('showing-photo-sphere-viewer-frame');
                $("#close-photosphere-viewer").remove();
                if (typeof (this._onClose) === 'function') {
                    this._onClose();
                    this._onClose = null;
                }
            }
            this._frameShowing = false;
        },

        _getFileObject: function (filename, context) {
            var fileList = context.fileList;
            var files = fileList.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (file.name === filename) {
                    return file;
                }
            }
            return null;
        },

        _xmpDataBackendRequest: function (url, callback) {
            $.get(url, function (serverResponse) {
                if (!serverResponse.success) {
                    if (serverResponse.message) {
                        PhotosphereViewerFunctions.notify(['An error occured while trying to read xmp-data: ', serverResponse.message]);
                    }
                    else{
                        PhotosphereViewerFunctions.notify('An unknown error occured while trying to read xmp-data.');
                    }
                    PhotosphereViewerFunctions.showLoader(false);
                    callback(false, null);
                    return;
                }
                if (serverResponse.data &&
                    typeof (serverResponse.data) === 'object' &&
                    serverResponse.data.usePanoramaViewer) {
                    // Its a photosphere but now
                    // check WebGL2 support in browser, otherwise
                    // the viewer can't be rendered
                    if (!PhotosphereViewerFunctions.isWebGl2Supported()) {
                        PhotosphereViewerFunctions.notify("Your browser doesn't support WebGL/WebGL2. Please enable WebGL/WebGL2 support in the browser settings.", "error");
                        PhotosphereViewerFunctions.showLoader(false);
                        return;
                    }
                    callback(true, serverResponse.data);
                    return;
                }
                callback(false, null);
            })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    PhotosphereViewerFunctions.notify(['An error occured while trying to read xmp-data: ', errorThrown]);
                    PhotosphereViewerFunctions.showLoader(false);
                });
        },

        _registerLegacyActions: function () {
            if (!(OCA?.Files?.fileActions)) {
                return;
            }
            /*
             * Try to store the original actionhandler for the
             * image in case it isn't a photosphere. Depending on the
             * order in which the NC apps are loaded it could be that:
             *   1. the action is already registered before ours
             *   2. the action will be registered after ours
             */
            const currActions = OCA.Files.fileActions.getActions(this._photoShpereMimeType, 'file', OC.PERMISSION_READ);
            if (currActions && currActions.view) {
                // This is case (1)
                this._oldActionHandler = currActions.view.action;
            }

            // Legacy register action
            OCA.Files.fileActions.registerAction({
                name: 'view',
                displayName: "View in PhotoSphereViewer",
                mime: this._photoShpereMimeType,
                permissions: OC.PERMISSION_READ,
                actionHandler: this._legacyActionHandlerImage.bind(this),
            })

            OCA.Files.fileActions.setDefault(this._photoShpereMimeType, 'view');

            // Register listener after our registration
            OCA.Files.fileActions.on('registerAction', function (e) {
                if (e.action.mime === this._photoShpereMimeType &&
                    e.action.name &&
                    typeof (e.action.name) === "string" &&
                    e.action.name.toLowerCase() === 'view') {
                    // Override but store the registered action
                    // which was registered after ours. This is
                    // case (2)
                    this._oldActionHandler = e.action.actionHandler;
                    e.action.actionHandler = this._actionHandler.bind(this);
                }

            }.bind(this));
        },

        _onKeyUp: function (e) {
            if (e.keyCode == 27) {
                this.hideFrame();
            }
        },

        /*
         * Initialize action callbacks. "Override"
         * the action for image/jpeg
         */
        init: function (isDirectoryShare, sharingToken, isSharedSingleFileViewer) {
            this._isDirectoryShare = isDirectoryShare;
            this._sharingToken = sharingToken;
            this._isSharedSingleFileViewer = isSharedSingleFileViewer;

            (0,_nextcloud_files__WEBPACK_IMPORTED_MODULE_0__.registerFileAction)(new _nextcloud_files__WEBPACK_IMPORTED_MODULE_0__.FileAction(this._getAction()));      // PhotoSphere image click (default for image/jpeg with appropriate xmp-data)
            (0,_nextcloud_files__WEBPACK_IMPORTED_MODULE_0__.registerFileAction)(new _nextcloud_files__WEBPACK_IMPORTED_MODULE_0__.FileAction(this._getVideoAction())); // Open 360 video via contextmenu
            this._registerLegacyActions();                              // Register legacy actions (e.g. for directory share)

            // Register the "close" function for non-single-file shares only
            if (this._isSharedSingleFileViewer) {
                $('footer').addClass('hidden');
            } else {
                var self = this;

                // Listen for close-button click (button lives inside the iframe)
                window.addEventListener("message", self._listenForCloseMessage.bind(self), false);

                // Register ESC listener on original document
                window.addEventListener("keyup", self._onKeyUp.bind(self));

                // Register history back listener
                OC.Util.History.addOnPopStateHandler(function (e) {
                    if (self._frameShowing) {
                        self.hideFrame();
                    }
                });
            }
        },

        /**
         * Determines, if a file is a photosphere.
         * The file must be a normal user-file (normal login required).
         * @param {string} filename
         * @param {object} context
         * @param {function} callback
         */
        canShow: function (fileName, context, callback) {
            // Trigger serverside function to
            // try to read xmp-data of the file
            var file = this._getFileObject(fileName, context);
            if (!file) {
                callback(false, null);
                return;
            }

            if (!this._isDirectoryShare) {
                // For regular user login-view the backend
                // should deliver the xmp-data already. This
                // method should not be called anymore.
                console.error("canShow() should not be called for regular user login-view.");
                callback(false, null);
                return;
            }

            // shared directory view
            var xmpBackendUrl = OC.generateUrl('apps/files_photospheres') +
                "/sharefiles/xmpdata/" +
                this._sharingToken +
                "?filename=" +
                encodeURIComponent(fileName) +
                "&path=" +
                encodeURIComponent(this._getDirectorySharePathFromCurrentLocation());

            this._xmpDataBackendRequest(xmpBackendUrl, callback);
        },

        /*
         * Determines, if a file is a photosphere.
         * The file must single-shared file.
         * @param {string} shareToken
         * @param {function} callback
         */
        canShowSingleFileShare: function (shareToken, callback) {
            var xmpBackendUrl = OC.generateUrl('apps/files_photospheres') +
                "/sharefiles/xmpdata/" +
                shareToken;

            this._xmpDataBackendRequest(xmpBackendUrl, callback);
        }
    };

    window.photoSphereViewerFileAction = photoSphereViewerFileAction;

})(jQuery, OC, OCA);

// document ready
jQuery(function () {

    "use strict";
    
    // Regular user view or shared view?
    var sharingToken = $('#sharingToken').val();
    if (!sharingToken) {
        console.log("Init regular user view");
        window.photoSphereViewerFileAction.init(false, null, false);
        return;
    }

    // Are we dealing with a shared directory or a single file?
    var isDirectoryShare = $.find('.files-filestable').length > 0 ? true : false;;
    if (isDirectoryShare) {
         /*
             *  FIXME ::
             *  If we're dealing with a directory-share
             *  we have to defer the initialization, because
             *  the OCA.Files.fileActions object gets overwritten by the file-
             *  sharing app in a defered executed function
             *  (see file_sharing/js/public.js at Line 47).
             *  We need this object, especially the
             *  function "OCA.Files.fileActions.on('registerAction' ...".
             *  Unfortunately this events aren't merged into the new
             *  object.
             */
        console.log("Init directory share view");
        window.photoSphereViewerFileAction.init(isDirectoryShare, sharingToken, false);
    } else {
        // single file-share
        var mimeType = $('#mimetype').val();
        var fileName = $('#filename').val();

        if (mimeType === window.photoSphereViewerFileAction._photoShpereMimeType) {
            PhotosphereViewerFunctions.showLoader(true);
            console.log("Init single file share view");
            window.photoSphereViewerFileAction.init(false, null, true);
            $('#files-public-content').hide();
            window.photoSphereViewerFileAction.canShowSingleFileShare(sharingToken, function (canShowImage, xmpResultModel) {
                if (canShowImage) {
                    var imageUrl = OC.generateUrl('/s/{token}/download', { token: sharingToken });
                    window.photoSphereViewerFileAction.showFrame(imageUrl, fileName, xmpResultModel, 'image');
                }
                else {
                    $('#files-public-content').show();
                    PhotosphereViewerFunctions.showLoader(false);
                }
            });
        }
    }
});
})();

/******/ })()
;
//# sourceMappingURL=fileAction.js.map?v=61240cb39a6623ab76dc