var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../../AppData/Roaming/npm/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now4 = Date.now();
  const seconds = Math.trunc(now4 / 1e3);
  const nanos = now4 % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir4, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env3) {
    return 1;
  }
  hasColors(count4, env3) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process2 extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process2.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd3) {
    this.#cwd = cwd3;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick
});
var {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../../AppData/Roaming/npm/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// .wrangler/tmp/pages-vJEVmL/functionsWorker-0.10583065515608558.mjs
import { Writable as Writable2 } from "node:stream";
import { EventEmitter as EventEmitter2 } from "node:events";
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
// @__NO_SIDE_EFFECTS__
function createNotImplementedError2(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError2, "createNotImplementedError");
__name2(createNotImplementedError2, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented2(name) {
  const fn = /* @__PURE__ */ __name2(() => {
    throw /* @__PURE__ */ createNotImplementedError2(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented2, "notImplemented");
__name2(notImplemented2, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass2(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass2, "notImplementedClass");
__name2(notImplementedClass2, "notImplementedClass");
var _timeOrigin2 = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow2 = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin2;
var nodeTiming2 = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry2 = class {
  static {
    __name(this, "PerformanceEntry");
  }
  static {
    __name2(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow2();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow2() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark3 = class PerformanceMark22 extends PerformanceEntry2 {
  static {
    __name(this, "PerformanceMark2");
  }
  static {
    __name2(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure2 = class extends PerformanceEntry2 {
  static {
    __name(this, "PerformanceMeasure");
  }
  static {
    __name2(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming2 = class extends PerformanceEntry2 {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  static {
    __name2(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList2 = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  static {
    __name2(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance2 = class {
  static {
    __name(this, "Performance");
  }
  static {
    __name2(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin2;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw /* @__PURE__ */ createNotImplementedError2("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming2;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming2("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin2) {
      return _performanceNow2();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark3(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure2(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError2("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError2("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw /* @__PURE__ */ createNotImplementedError2("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver2 = class {
  static {
    __name(this, "PerformanceObserver");
  }
  static {
    __name2(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError2("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw /* @__PURE__ */ createNotImplementedError2("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance2 = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance2();
globalThis.performance = performance2;
globalThis.Performance = Performance2;
globalThis.PerformanceEntry = PerformanceEntry2;
globalThis.PerformanceMark = PerformanceMark3;
globalThis.PerformanceMeasure = PerformanceMeasure2;
globalThis.PerformanceObserver = PerformanceObserver2;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList2;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming2;
var noop_default2 = Object.assign(() => {
}, { __unenv__: true });
var _console2 = globalThis.console;
var _ignoreErrors2 = true;
var _stderr2 = new Writable2();
var _stdout2 = new Writable2();
var log3 = _console2?.log ?? noop_default2;
var info3 = _console2?.info ?? log3;
var trace3 = _console2?.trace ?? info3;
var debug3 = _console2?.debug ?? log3;
var table3 = _console2?.table ?? log3;
var error3 = _console2?.error ?? log3;
var warn3 = _console2?.warn ?? error3;
var createTask3 = _console2?.createTask ?? /* @__PURE__ */ notImplemented2("console.createTask");
var clear3 = _console2?.clear ?? noop_default2;
var count3 = _console2?.count ?? noop_default2;
var countReset3 = _console2?.countReset ?? noop_default2;
var dir3 = _console2?.dir ?? noop_default2;
var dirxml3 = _console2?.dirxml ?? noop_default2;
var group3 = _console2?.group ?? noop_default2;
var groupEnd3 = _console2?.groupEnd ?? noop_default2;
var groupCollapsed3 = _console2?.groupCollapsed ?? noop_default2;
var profile3 = _console2?.profile ?? noop_default2;
var profileEnd3 = _console2?.profileEnd ?? noop_default2;
var time3 = _console2?.time ?? noop_default2;
var timeEnd3 = _console2?.timeEnd ?? noop_default2;
var timeLog3 = _console2?.timeLog ?? noop_default2;
var timeStamp3 = _console2?.timeStamp ?? noop_default2;
var Console2 = _console2?.Console ?? /* @__PURE__ */ notImplementedClass2("console.Console");
var _times2 = /* @__PURE__ */ new Map();
var _stdoutErrorHandler2 = noop_default2;
var _stderrErrorHandler2 = noop_default2;
var workerdConsole2 = globalThis["console"];
var {
  assert: assert3,
  clear: clear22,
  // @ts-expect-error undocumented public API
  context: context2,
  count: count22,
  countReset: countReset22,
  // @ts-expect-error undocumented public API
  createTask: createTask22,
  debug: debug22,
  dir: dir22,
  dirxml: dirxml22,
  error: error22,
  group: group22,
  groupCollapsed: groupCollapsed22,
  groupEnd: groupEnd22,
  info: info22,
  log: log22,
  profile: profile22,
  profileEnd: profileEnd22,
  table: table22,
  time: time22,
  timeEnd: timeEnd22,
  timeLog: timeLog22,
  timeStamp: timeStamp22,
  trace: trace22,
  warn: warn22
} = workerdConsole2;
Object.assign(workerdConsole2, {
  Console: Console2,
  _ignoreErrors: _ignoreErrors2,
  _stderr: _stderr2,
  _stderrErrorHandler: _stderrErrorHandler2,
  _stdout: _stdout2,
  _stdoutErrorHandler: _stdoutErrorHandler2,
  _times: _times2
});
var console_default2 = workerdConsole2;
globalThis.console = console_default2;
var hrtime4 = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name2(/* @__PURE__ */ __name(function hrtime22(startTime) {
  const now4 = Date.now();
  const seconds = Math.trunc(now4 / 1e3);
  const nanos = now4 % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime2"), "hrtime"), { bigint: /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function bigint2() {
  return BigInt(Date.now() * 1e6);
}, "bigint"), "bigint") });
var WriteStream2 = class {
  static {
    __name(this, "WriteStream");
  }
  static {
    __name2(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir32, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env22) {
    return 1;
  }
  hasColors(count32, env22) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};
var ReadStream2 = class {
  static {
    __name(this, "ReadStream");
  }
  static {
    __name2(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};
var NODE_VERSION2 = "22.14.0";
var Process2 = class _Process extends EventEmitter2 {
  static {
    __name(this, "_Process");
  }
  static {
    __name2(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter2.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream2(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream2(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream2(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd22) {
    this.#cwd = cwd22;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION2}`;
  }
  get versions() {
    return { node: NODE_VERSION2 };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw /* @__PURE__ */ createNotImplementedError2("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw /* @__PURE__ */ createNotImplementedError2("process.getActiveResourcesInfo");
  }
  exit() {
    throw /* @__PURE__ */ createNotImplementedError2("process.exit");
  }
  reallyExit() {
    throw /* @__PURE__ */ createNotImplementedError2("process.reallyExit");
  }
  kill() {
    throw /* @__PURE__ */ createNotImplementedError2("process.kill");
  }
  abort() {
    throw /* @__PURE__ */ createNotImplementedError2("process.abort");
  }
  dlopen() {
    throw /* @__PURE__ */ createNotImplementedError2("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw /* @__PURE__ */ createNotImplementedError2("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw /* @__PURE__ */ createNotImplementedError2("process.loadEnvFile");
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError2("process.disconnect");
  }
  cpuUsage() {
    throw /* @__PURE__ */ createNotImplementedError2("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError2("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError2("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw /* @__PURE__ */ createNotImplementedError2("process.initgroups");
  }
  openStdin() {
    throw /* @__PURE__ */ createNotImplementedError2("process.openStdin");
  }
  assert() {
    throw /* @__PURE__ */ createNotImplementedError2("process.assert");
  }
  binding() {
    throw /* @__PURE__ */ createNotImplementedError2("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented2("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented2("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented2("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented2("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented2("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented2("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name2(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};
var globalProcess2 = globalThis["process"];
var getBuiltinModule2 = globalProcess2.getBuiltinModule;
var { exit: exit2, platform: platform2, nextTick: nextTick2 } = getBuiltinModule2(
  "node:process"
);
var unenvProcess2 = new Process2({
  env: globalProcess2.env,
  hrtime: hrtime4,
  nextTick: nextTick2
});
var {
  abort: abort2,
  addListener: addListener2,
  allowedNodeEnvironmentFlags: allowedNodeEnvironmentFlags2,
  hasUncaughtExceptionCaptureCallback: hasUncaughtExceptionCaptureCallback2,
  setUncaughtExceptionCaptureCallback: setUncaughtExceptionCaptureCallback2,
  loadEnvFile: loadEnvFile2,
  sourceMapsEnabled: sourceMapsEnabled2,
  arch: arch2,
  argv: argv2,
  argv0: argv02,
  chdir: chdir2,
  config: config2,
  connected: connected2,
  constrainedMemory: constrainedMemory2,
  availableMemory: availableMemory2,
  cpuUsage: cpuUsage2,
  cwd: cwd2,
  debugPort: debugPort2,
  dlopen: dlopen2,
  disconnect: disconnect2,
  emit: emit2,
  emitWarning: emitWarning2,
  env: env2,
  eventNames: eventNames2,
  execArgv: execArgv2,
  execPath: execPath2,
  finalization: finalization2,
  features: features2,
  getActiveResourcesInfo: getActiveResourcesInfo2,
  getMaxListeners: getMaxListeners2,
  hrtime: hrtime32,
  kill: kill2,
  listeners: listeners2,
  listenerCount: listenerCount2,
  memoryUsage: memoryUsage2,
  on: on2,
  off: off2,
  once: once2,
  pid: pid2,
  ppid: ppid2,
  prependListener: prependListener2,
  prependOnceListener: prependOnceListener2,
  rawListeners: rawListeners2,
  release: release2,
  removeAllListeners: removeAllListeners2,
  removeListener: removeListener2,
  report: report2,
  resourceUsage: resourceUsage2,
  setMaxListeners: setMaxListeners2,
  setSourceMapsEnabled: setSourceMapsEnabled2,
  stderr: stderr2,
  stdin: stdin2,
  stdout: stdout2,
  title: title2,
  throwDeprecation: throwDeprecation2,
  traceDeprecation: traceDeprecation2,
  umask: umask2,
  uptime: uptime2,
  version: version2,
  versions: versions2,
  domain: domain2,
  initgroups: initgroups2,
  moduleLoadList: moduleLoadList2,
  reallyExit: reallyExit2,
  openStdin: openStdin2,
  assert: assert22,
  binding: binding2,
  send: send2,
  exitCode: exitCode2,
  channel: channel2,
  getegid: getegid2,
  geteuid: geteuid2,
  getgid: getgid2,
  getgroups: getgroups2,
  getuid: getuid2,
  setegid: setegid2,
  seteuid: seteuid2,
  setgid: setgid2,
  setgroups: setgroups2,
  setuid: setuid2,
  permission: permission2,
  mainModule: mainModule2,
  _events: _events2,
  _eventsCount: _eventsCount2,
  _exiting: _exiting2,
  _maxListeners: _maxListeners2,
  _debugEnd: _debugEnd2,
  _debugProcess: _debugProcess2,
  _fatalException: _fatalException2,
  _getActiveHandles: _getActiveHandles2,
  _getActiveRequests: _getActiveRequests2,
  _kill: _kill2,
  _preload_modules: _preload_modules2,
  _rawDebug: _rawDebug2,
  _startProfilerIdleNotifier: _startProfilerIdleNotifier2,
  _stopProfilerIdleNotifier: _stopProfilerIdleNotifier2,
  _tickCallback: _tickCallback2,
  _disconnect: _disconnect2,
  _handleQueue: _handleQueue2,
  _pendingMessage: _pendingMessage2,
  _channel: _channel2,
  _send: _send2,
  _linkedBinding: _linkedBinding2
} = unenvProcess2;
var _process2 = {
  abort: abort2,
  addListener: addListener2,
  allowedNodeEnvironmentFlags: allowedNodeEnvironmentFlags2,
  hasUncaughtExceptionCaptureCallback: hasUncaughtExceptionCaptureCallback2,
  setUncaughtExceptionCaptureCallback: setUncaughtExceptionCaptureCallback2,
  loadEnvFile: loadEnvFile2,
  sourceMapsEnabled: sourceMapsEnabled2,
  arch: arch2,
  argv: argv2,
  argv0: argv02,
  chdir: chdir2,
  config: config2,
  connected: connected2,
  constrainedMemory: constrainedMemory2,
  availableMemory: availableMemory2,
  cpuUsage: cpuUsage2,
  cwd: cwd2,
  debugPort: debugPort2,
  dlopen: dlopen2,
  disconnect: disconnect2,
  emit: emit2,
  emitWarning: emitWarning2,
  env: env2,
  eventNames: eventNames2,
  execArgv: execArgv2,
  execPath: execPath2,
  exit: exit2,
  finalization: finalization2,
  features: features2,
  getBuiltinModule: getBuiltinModule2,
  getActiveResourcesInfo: getActiveResourcesInfo2,
  getMaxListeners: getMaxListeners2,
  hrtime: hrtime32,
  kill: kill2,
  listeners: listeners2,
  listenerCount: listenerCount2,
  memoryUsage: memoryUsage2,
  nextTick: nextTick2,
  on: on2,
  off: off2,
  once: once2,
  pid: pid2,
  platform: platform2,
  ppid: ppid2,
  prependListener: prependListener2,
  prependOnceListener: prependOnceListener2,
  rawListeners: rawListeners2,
  release: release2,
  removeAllListeners: removeAllListeners2,
  removeListener: removeListener2,
  report: report2,
  resourceUsage: resourceUsage2,
  setMaxListeners: setMaxListeners2,
  setSourceMapsEnabled: setSourceMapsEnabled2,
  stderr: stderr2,
  stdin: stdin2,
  stdout: stdout2,
  title: title2,
  throwDeprecation: throwDeprecation2,
  traceDeprecation: traceDeprecation2,
  umask: umask2,
  uptime: uptime2,
  version: version2,
  versions: versions2,
  // @ts-expect-error old API
  domain: domain2,
  initgroups: initgroups2,
  moduleLoadList: moduleLoadList2,
  reallyExit: reallyExit2,
  openStdin: openStdin2,
  assert: assert22,
  binding: binding2,
  send: send2,
  exitCode: exitCode2,
  channel: channel2,
  getegid: getegid2,
  geteuid: geteuid2,
  getgid: getgid2,
  getgroups: getgroups2,
  getuid: getuid2,
  setegid: setegid2,
  seteuid: seteuid2,
  setgid: setgid2,
  setgroups: setgroups2,
  setuid: setuid2,
  permission: permission2,
  mainModule: mainModule2,
  _events: _events2,
  _eventsCount: _eventsCount2,
  _exiting: _exiting2,
  _maxListeners: _maxListeners2,
  _debugEnd: _debugEnd2,
  _debugProcess: _debugProcess2,
  _fatalException: _fatalException2,
  _getActiveHandles: _getActiveHandles2,
  _getActiveRequests: _getActiveRequests2,
  _kill: _kill2,
  _preload_modules: _preload_modules2,
  _rawDebug: _rawDebug2,
  _startProfilerIdleNotifier: _startProfilerIdleNotifier2,
  _stopProfilerIdleNotifier: _stopProfilerIdleNotifier2,
  _tickCallback: _tickCallback2,
  _disconnect: _disconnect2,
  _handleQueue: _handleQueue2,
  _pendingMessage: _pendingMessage2,
  _channel: _channel2,
  _send: _send2,
  _linkedBinding: _linkedBinding2
};
var process_default2 = _process2;
globalThis.process = process_default2;
function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}
__name(json, "json");
__name2(json, "json");
function bad(status, error32, extra) {
  return json({ ok: false, error: error32, ...extra || {} }, { status });
}
__name(bad, "bad");
__name2(bad, "bad");
function now() {
  return Date.now();
}
__name(now, "now");
__name2(now, "now");
function uuid() {
  return crypto.randomUUID();
}
__name(uuid, "uuid");
__name2(uuid, "uuid");
function ok(data = {}, init = {}) {
  const payload = data && typeof data === "object" ? data : { value: data };
  return json({ ok: true, ...payload }, init);
}
__name(ok, "ok");
__name2(ok, "ok");
function err(status, message, extra) {
  return bad(status, message, extra);
}
__name(err, "err");
__name2(err, "err");
function readJSON(req) {
  return req.json().catch(() => ({}));
}
__name(readJSON, "readJSON");
__name2(readJSON, "readJSON");
function requireMethod(req, method) {
  const want = String(method || "").toUpperCase();
  const got = String(req.method || "").toUpperCase();
  if (want && got !== want) {
    return err(405, `METHOD_NOT_ALLOWED`, { want, got });
  }
  return null;
}
__name(requireMethod, "requireMethod");
__name2(requireMethod, "requireMethod");
function parseCookies(request) {
  const h = request?.headers?.get("cookie") || "";
  const out = {};
  if (!h) return out;
  const parts = h.split(";");
  for (const p of parts) {
    const idx = p.indexOf("=");
    if (idx < 0) continue;
    const k = p.slice(0, idx).trim();
    const v = p.slice(idx + 1).trim();
    if (!k) continue;
    try {
      out[k] = decodeURIComponent(v);
    } catch {
      out[k] = v;
    }
  }
  return out;
}
__name(parseCookies, "parseCookies");
__name2(parseCookies, "parseCookies");
function getCookie(request, name) {
  const c = parseCookies(request);
  return c[name] || "";
}
__name(getCookie, "getCookie");
__name2(getCookie, "getCookie");
function cookieString(name, value, opts = {}) {
  const enc = encodeURIComponent(String(value ?? ""));
  let s = `${name}=${enc}`;
  if (opts.maxAge != null) s += `; Max-Age=${Math.floor(opts.maxAge)}`;
  if (opts.expires) s += `; Expires=${opts.expires.toUTCString()}`;
  s += `; Path=${opts.path || "/"}`;
  if (opts.httpOnly) s += "; HttpOnly";
  if (opts.secure) s += "; Secure";
  if (opts.sameSite) s += `; SameSite=${opts.sameSite}`;
  return s;
}
__name(cookieString, "cookieString");
__name2(cookieString, "cookieString");
function b64url(bytes) {
  let s = btoa(String.fromCharCode(...bytes));
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
__name(b64url, "b64url");
__name2(b64url, "b64url");
function ub64url(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
__name(ub64url, "ub64url");
__name2(ub64url, "ub64url");
async function hmacSign(secret, data) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}
__name(hmacSign, "hmacSign");
__name2(hmacSign, "hmacSign");
async function signJwt(secret, payload, ttlSeconds) {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1e3) + (ttlSeconds || 3600);
  const body = { ...payload, exp };
  const enc = /* @__PURE__ */ __name2((obj) => b64url(new TextEncoder().encode(JSON.stringify(obj))), "enc");
  const h = enc(header);
  const p = enc(body);
  const data = `${h}.${p}`;
  const sig = await hmacSign(secret, data);
  return `${data}.${b64url(sig)}`;
}
__name(signJwt, "signJwt");
__name2(signJwt, "signJwt");
async function verifyJwt(secret, token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const data = `${h}.${p}`;
  const sig = ub64url(s);
  const expected = await hmacSign(secret, data);
  if (sig.length !== expected.length) return null;
  for (let i = 0; i < sig.length; i++) if (sig[i] !== expected[i]) return null;
  const payload = JSON.parse(new TextDecoder().decode(ub64url(p)));
  if (payload.exp && Math.floor(Date.now() / 1e3) > payload.exp) return null;
  return payload;
}
__name(verifyJwt, "verifyJwt");
__name2(verifyJwt, "verifyJwt");
function getDb(env22) {
  return env22?.BF_DB || env22?.DB || env22?.db || null;
}
__name(getDb, "getDb");
__name2(getDb, "getDb");
async function requireUser({ env: env22, request }) {
  const h = request.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/);
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = {};
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (!k) continue;
    cookies[k] = decodeURIComponent(rest.join("=") || "");
  }
  const url = new URL(request.url);
  const queryToken = url.searchParams.get("bf_token") || "";
  const token = m && m[1] || cookies.bf_at || cookies.bf_auth_token || cookies.bf_token || queryToken || "";
  if (!token) return { ok: false, resp: bad(401, "UNAUTHORIZED") };
  const payload = await verifyJwt(env22.JWT_SECRET, token);
  if (!payload) return { ok: false, resp: bad(401, "UNAUTHORIZED") };
  return { ok: true, user: payload };
}
__name(requireUser, "requireUser");
__name2(requireUser, "requireUser");
async function requireOrgRole({ env: env22, request, orgId, minRole }) {
  const u = await requireUser({ env: env22, request });
  if (!u.ok) return u;
  const roleRank = { viewer: 1, member: 2, admin: 3, owner: 4 };
  const need = roleRank[minRole || "member"] || 2;
  const db = getDb(env22);
  if (!db) return { ok: false, resp: bad(500, "NO_DB_BINDING") };
  const row = await db.prepare(
    "SELECT role FROM org_memberships WHERE org_id = ? AND user_id = ?"
  ).bind(orgId, u.user.sub).first();
  if (!row) return { ok: false, resp: bad(403, "NOT_A_MEMBER") };
  if ((roleRank[row.role] || 0) < need) return { ok: false, resp: bad(403, "INSUFFICIENT_ROLE") };
  return { ok: true, user: u.user, role: row.role };
}
__name(requireOrgRole, "requireOrgRole");
__name2(requireOrgRole, "requireOrgRole");
async function getUserIdFromRequest(request, env22) {
  const u = await requireUser({ env: env22, request });
  if (!u.ok) return null;
  const id = u.user?.sub || u.user?.userId || u.user?.uid || null;
  return id ? String(id) : null;
}
__name(getUserIdFromRequest, "getUserIdFromRequest");
__name2(getUserIdFromRequest, "getUserIdFromRequest");
function getDb2(env22) {
  return env22?.BF_DB || env22?.DB || env22?.db || null;
}
__name(getDb2, "getDb2");
__name2(getDb2, "getDb");
function getDriveBucket(env22) {
  return env22?.BF_DRIVE_BUCKET || env22?.DRIVE_BUCKET || env22?.BOND_FIRE_DRIVE_BUCKET || null;
}
__name(getDriveBucket, "getDriveBucket");
__name2(getDriveBucket, "getDriveBucket");
async function ensureDriveSchema(env22) {
  const db = getDb2(env22);
  if (!db) throw new Error("NO_DB_BINDING");
  if (env22.__bfDriveSchemaReady) return;
  const statements = [
    "CREATE TABLE IF NOT EXISTS drive_folders (id TEXT PRIMARY KEY, org_id TEXT NOT NULL, parent_id TEXT, name TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_drive_folders_org_parent ON drive_folders(org_id, parent_id, updated_at)",
    "CREATE TABLE IF NOT EXISTS drive_notes (id TEXT PRIMARY KEY, org_id TEXT NOT NULL, parent_id TEXT, title TEXT, content TEXT, tags TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_drive_notes_org_parent ON drive_notes(org_id, parent_id, updated_at)",
    "CREATE TABLE IF NOT EXISTS drive_files (id TEXT PRIMARY KEY, org_id TEXT NOT NULL, parent_id TEXT, name TEXT, mime TEXT, size INTEGER, storage_key TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_drive_files_org_parent ON drive_files(org_id, parent_id, updated_at)",
    "CREATE TABLE IF NOT EXISTS drive_templates (id TEXT PRIMARY KEY, org_id TEXT NOT NULL, name TEXT, title TEXT, content TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_drive_templates_org ON drive_templates(org_id, updated_at)",
    "CREATE TABLE IF NOT EXISTS drive_file_blobs (file_id TEXT PRIMARY KEY, org_id TEXT NOT NULL, mime TEXT, data_url TEXT, text_content TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_drive_file_blobs_org ON drive_file_blobs(org_id, updated_at)"
  ];
  for (const sql of statements) {
    await db.prepare(sql).run();
  }
  env22.__bfDriveSchemaReady = true;
}
__name(ensureDriveSchema, "ensureDriveSchema");
__name2(ensureDriveSchema, "ensureDriveSchema");
function encrypt(data) {
  return data;
}
__name(encrypt, "encrypt");
__name2(encrypt, "encrypt");
function decrypt(data) {
  return data;
}
__name(decrypt, "decrypt");
__name2(decrypt, "decrypt");
function normalizeNullableId(value) {
  if (value === void 0 || value === null || value === "") return null;
  return String(value);
}
__name(normalizeNullableId, "normalizeNullableId");
__name2(normalizeNullableId, "normalizeNullableId");
function parseTags(value) {
  if (Array.isArray(value)) return value.map((x) => String(x || "").trim()).filter(Boolean);
  return String(value || "").split(",").map((x) => x.trim()).filter(Boolean);
}
__name(parseTags, "parseTags");
__name2(parseTags, "parseTags");
function splitDataUrl(dataUrl) {
  const raw = String(dataUrl || "");
  const match2 = raw.match(/^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.*)$/i);
  if (!match2) return null;
  return {
    mime: match2[1] || "application/octet-stream",
    base64: match2[2] || ""
  };
}
__name(splitDataUrl, "splitDataUrl");
__name2(splitDataUrl, "splitDataUrl");
function bytesFromDataUrl(dataUrl) {
  const parts = splitDataUrl(dataUrl);
  if (!parts) return null;
  const bin = atob(parts.base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return { mime: parts.mime, bytes };
}
__name(bytesFromDataUrl, "bytesFromDataUrl");
__name2(bytesFromDataUrl, "bytesFromDataUrl");
function dataUrlFromBytes(bytes, mime) {
  let bin = "";
  const chunk = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  for (let i = 0; i < chunk.length; i += 1) bin += String.fromCharCode(chunk[i]);
  return `data:${String(mime || "application/octet-stream")};base64,${btoa(bin)}`;
}
__name(dataUrlFromBytes, "dataUrlFromBytes");
__name2(dataUrlFromBytes, "dataUrlFromBytes");
function textFromBytes(bytes) {
  try {
    return new TextDecoder().decode(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []));
  } catch {
    return "";
  }
}
__name(textFromBytes, "textFromBytes");
__name2(textFromBytes, "textFromBytes");
function isEditableTextMime(mime, name = "") {
  const safeMime = String(mime || "").toLowerCase();
  const safeName = String(name || "").toLowerCase();
  if (safeMime.startsWith("text/")) return true;
  return [".md", ".markdown", ".txt", ".json", ".js", ".jsx", ".ts", ".tsx", ".css", ".html", ".xml", ".yaml", ".yml", ".csv", ".bfsheet", ".bfform"].some((ext) => safeName.endsWith(ext)) || safeMime === "application/vnd.bondfire.sheet+json" || safeMime === "application/vnd.bondfire.form+json" || safeMime === "application/vnd.bondfire.zk-file";
}
__name(isEditableTextMime, "isEditableTextMime");
__name2(isEditableTextMime, "isEditableTextMime");
function buildDriveFileUrls(orgId, fileId) {
  const encodedOrgId = encodeURIComponent(String(orgId || ""));
  const encodedFileId = encodeURIComponent(String(fileId || ""));
  const base = `/api/orgs/${encodedOrgId}/drive/files/${encodedFileId}/download`;
  return {
    previewUrl: base,
    downloadUrl: `${base}?download=1`,
    url: base
  };
}
__name(buildDriveFileUrls, "buildDriveFileUrls");
__name2(buildDriveFileUrls, "buildDriveFileUrls");
async function listDriveTree(env22, orgId) {
  await ensureDriveSchema(env22);
  const db = getDb2(env22);
  const [foldersRes, notesRes, filesRes, templatesRes] = await Promise.all([
    db.prepare(`SELECT id, parent_id, name, created_at, updated_at FROM drive_folders WHERE org_id = ? ORDER BY LOWER(name) ASC, created_at ASC`).bind(orgId).all(),
    db.prepare(`SELECT id, parent_id, title, content, tags, created_at, updated_at FROM drive_notes WHERE org_id = ? ORDER BY updated_at DESC, created_at DESC`).bind(orgId).all(),
    db.prepare(`SELECT id, parent_id, name, mime, size, storage_key, created_at, updated_at FROM drive_files WHERE org_id = ? ORDER BY LOWER(name) ASC, created_at ASC`).bind(orgId).all(),
    db.prepare(`SELECT id, name, title, content, created_at, updated_at FROM drive_templates WHERE org_id = ? ORDER BY updated_at DESC, created_at DESC`).bind(orgId).all()
  ]);
  return {
    folders: (foldersRes.results || []).map((row) => ({
      id: row.id,
      parentId: row.parent_id || null,
      name: row.name || "untitled folder",
      createdAt: Number(row.created_at || 0),
      updatedAt: Number(row.updated_at || 0)
    })),
    notes: (notesRes.results || []).map((row) => ({
      id: row.id,
      parentId: row.parent_id || null,
      title: row.title || "untitled",
      body: decrypt(row.content || ""),
      tags: parseTags(row.tags),
      createdAt: Number(row.created_at || 0),
      updatedAt: Number(row.updated_at || 0)
    })),
    files: (filesRes.results || []).map((row) => ({
      id: row.id,
      parentId: row.parent_id || null,
      name: row.name || "file",
      mime: row.mime || "application/octet-stream",
      size: Number(row.size || 0),
      storageKey: row.storage_key || null,
      createdAt: Number(row.created_at || 0),
      updatedAt: Number(row.updated_at || 0),
      ...buildDriveFileUrls(orgId, row.id)
    })),
    templates: (templatesRes.results || []).map((row) => ({
      id: row.id,
      name: row.name || "template",
      title: row.title || "untitled",
      body: decrypt(row.content || ""),
      createdAt: Number(row.created_at || 0),
      updatedAt: Number(row.updated_at || 0)
    }))
  };
}
__name(listDriveTree, "listDriveTree");
__name2(listDriveTree, "listDriveTree");
async function getFileRecord(env22, orgId, fileId, { includeData = false } = {}) {
  await ensureDriveSchema(env22);
  const db = getDb2(env22);
  const row = await db.prepare(
    `SELECT id, parent_id, name, mime, size, storage_key, created_at, updated_at
     FROM drive_files
     WHERE org_id = ? AND id = ?`
  ).bind(orgId, fileId).first();
  if (!row) return null;
  const file = {
    id: row.id,
    parentId: row.parent_id || null,
    name: row.name || "file",
    mime: row.mime || "application/octet-stream",
    size: Number(row.size || 0),
    storageKey: row.storage_key || null,
    createdAt: Number(row.created_at || 0),
    updatedAt: Number(row.updated_at || 0),
    ...buildDriveFileUrls(orgId, row.id)
  };
  if (!includeData) return file;
  const blob = await loadFileBlob(env22, orgId, row.id, row.storage_key, file.mime, file.name);
  return {
    ...file,
    dataUrl: blob?.dataUrl || "",
    textContent: blob?.textContent || ""
  };
}
__name(getFileRecord, "getFileRecord");
__name2(getFileRecord, "getFileRecord");
async function loadFileBlob(env22, orgId, fileId, storageKey, mime, name = "") {
  await ensureDriveSchema(env22);
  const bucket = getDriveBucket(env22);
  if (bucket && storageKey) {
    const obj = await bucket.get(storageKey);
    if (obj) {
      const arr = new Uint8Array(await obj.arrayBuffer());
      const effectiveMime = mime || obj.httpMetadata?.contentType || "application/octet-stream";
      return {
        dataUrl: dataUrlFromBytes(arr, effectiveMime),
        textContent: isEditableTextMime(effectiveMime, name) || effectiveMime === "application/vnd.bondfire.zk-file" ? textFromBytes(arr) : ""
      };
    }
  }
  const db = getDb2(env22);
  const row = await db.prepare(
    `SELECT data_url, text_content, mime
     FROM drive_file_blobs
     WHERE org_id = ? AND file_id = ?`
  ).bind(orgId, fileId).first();
  if (!row) return null;
  return {
    dataUrl: row.data_url || "",
    textContent: decrypt(row.text_content || ""),
    mime: row.mime || mime || "application/octet-stream"
  };
}
__name(loadFileBlob, "loadFileBlob");
__name2(loadFileBlob, "loadFileBlob");
async function saveFileBlob(env22, { orgId, fileId, storageKey, mime, dataUrl, textContent }) {
  await ensureDriveSchema(env22);
  const bucket = getDriveBucket(env22);
  const t = now();
  if (bucket && storageKey) {
    const payload = bytesFromDataUrl(dataUrl || "");
    if (!payload) throw new Error("INVALID_DATA_URL");
    await bucket.put(storageKey, payload.bytes, {
      httpMetadata: { contentType: mime || payload.mime || "application/octet-stream" }
    });
    const db2 = getDb2(env22);
    await db2.prepare(`DELETE FROM drive_file_blobs WHERE org_id = ? AND file_id = ?`).bind(orgId, fileId).run();
    return;
  }
  const db = getDb2(env22);
  await db.prepare(
    `INSERT INTO drive_file_blobs (file_id, org_id, mime, data_url, text_content, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(file_id)
     DO UPDATE SET mime = excluded.mime,
                   data_url = excluded.data_url,
                   text_content = excluded.text_content,
                   updated_at = excluded.updated_at`
  ).bind(fileId, orgId, mime || "application/octet-stream", dataUrl || "", encrypt(textContent || ""), t, t).run();
}
__name(saveFileBlob, "saveFileBlob");
__name2(saveFileBlob, "saveFileBlob");
async function deleteFileBlob(env22, { orgId, fileId, storageKey }) {
  await ensureDriveSchema(env22);
  const bucket = getDriveBucket(env22);
  if (bucket && storageKey) {
    try {
      await bucket.delete(storageKey);
    } catch {
    }
  }
  const db = getDb2(env22);
  await db.prepare(`DELETE FROM drive_file_blobs WHERE org_id = ? AND file_id = ?`).bind(orgId, fileId).run();
}
__name(deleteFileBlob, "deleteFileBlob");
__name2(deleteFileBlob, "deleteFileBlob");
function created(name, entity) {
  return json({ ok: true, id: entity?.id || null, [name]: entity || null });
}
__name(created, "created");
__name2(created, "created");
function buildHeaders({ file, size, asDownload }) {
  const headers = new Headers({
    "content-type": file.encrypted ? "application/octet-stream" : file.mime || "application/octet-stream",
    "cache-control": "private, max-age=60",
    "accept-ranges": "bytes",
    "content-disposition": `${asDownload ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(file.encrypted ? "encrypted.bin" : file.name || "download")}`
  });
  if (Number.isFinite(size) && size >= 0) headers.set("content-length", String(size));
  return headers;
}
__name(buildHeaders, "buildHeaders");
__name2(buildHeaders, "buildHeaders");
async function onRequestGet({ env: env22, request, params }) {
  const orgId = params.orgId;
  const fileId = params.id;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;
  const file = await getFileRecord(env22, orgId, fileId, { includeData: false });
  if (!file) return bad(404, "NOT_FOUND");
  const url = new URL(request.url);
  const asDownload = url.searchParams.get("download") === "1";
  const bucket = getDriveBucket(env22);
  if (bucket && file.storageKey) {
    try {
      const obj = await bucket.get(file.storageKey);
      if (obj) return new Response(obj.body, { status: 200, headers: buildHeaders({ file, size: Number(obj.size || file.size || 0), asDownload }) });
    } catch {
    }
  }
  const blob = await loadFileBlob(env22, orgId, fileId, file.storageKey, file.mime, file.name, file.encrypted);
  if (file.encrypted) {
    const bytes = new TextEncoder().encode(String(blob?.encryptedPayload || ""));
    return new Response(bytes, { status: 200, headers: buildHeaders({ file, size: bytes.byteLength || 0, asDownload }) });
  }
  if (!blob?.dataUrl) return bad(404, "FILE_BLOB_MISSING");
  const payload = bytesFromDataUrl(blob.dataUrl);
  if (!payload) return bad(500, "INVALID_FILE_DATA");
  return new Response(payload.bytes, { status: 200, headers: buildHeaders({ file, size: payload.bytes.byteLength || 0, asDownload }) });
}
__name(onRequestGet, "onRequestGet");
__name2(onRequestGet, "onRequestGet");
async function onRequestGet2({ env: env22, request, params }) {
  const orgId = params.orgId;
  const fileId = params.id;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;
  const existingMeta = await getFileRecord(env22, orgId, fileId, { includeData: false });
  const shouldIncludeData = !!(existingMeta && (String(existingMeta.mime || "").startsWith("text/") || String(existingMeta.mime || "") === "application/vnd.bondfire.sheet+json" || String(existingMeta.mime || "") === "application/vnd.bondfire.form+json" || String(existingMeta.mime || "") === "application/vnd.bondfire.zk-file" || /\.(md|markdown|txt|json|js|jsx|ts|tsx|css|html|xml|yaml|yml|csv|bfsheet|bfform)$/i.test(String(existingMeta.name || ""))));
  const file = existingMeta ? await getFileRecord(env22, orgId, fileId, { includeData: shouldIncludeData }) : null;
  if (!file) return bad(404, "NOT_FOUND");
  return json({ ok: true, file });
}
__name(onRequestGet2, "onRequestGet2");
__name2(onRequestGet2, "onRequestGet");
async function onRequestPatch({ env: env22, request, params }) {
  const orgId = params.orgId;
  const fileId = params.id;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  const db = getDb2(env22);
  const existing = await db.prepare(`SELECT id, parent_id, name, mime, size, storage_key, created_at, updated_at FROM drive_files WHERE org_id = ? AND id = ?`).bind(orgId, fileId).first();
  if (!existing) return bad(404, "NOT_FOUND");
  const body = await request.json().catch(() => ({}));
  const nextName = body.name === void 0 ? existing.name : String(body.name || "file").trim() || "file";
  const nextMime = body.mime === void 0 ? existing.mime : String(body.mime || "application/octet-stream");
  const nextSize = body.size === void 0 ? Number(existing.size || 0) : Number(body.size || 0);
  const nextParentId = Object.prototype.hasOwnProperty.call(body, "parentId") ? normalizeNullableId(body.parentId) : existing.parent_id || null;
  await db.prepare(
    `UPDATE drive_files
     SET parent_id = ?,
         name = ?,
         mime = ?,
         size = ?,
         updated_at = ?
     WHERE org_id = ? AND id = ?`
  ).bind(nextParentId, nextName, nextMime, nextSize, now(), orgId, fileId).run();
  if (body.dataUrl !== void 0 || body.textContent !== void 0 || body.mime !== void 0) {
    await saveFileBlob(env22, {
      orgId,
      fileId,
      storageKey: existing.storage_key,
      mime: nextMime,
      dataUrl: body.dataUrl === void 0 ? (await getFileRecord(env22, orgId, fileId, { includeData: true }))?.dataUrl || "" : String(body.dataUrl || ""),
      textContent: body.textContent === void 0 ? (await getFileRecord(env22, orgId, fileId, { includeData: true }))?.textContent || "" : String(body.textContent || "")
    });
  }
  const shouldIncludeData = !!(String(nextMime || "").startsWith("text/") || String(nextMime || "") === "application/vnd.bondfire.sheet+json" || String(nextMime || "") === "application/vnd.bondfire.form+json" || String(nextMime || "") === "application/vnd.bondfire.zk-file" || /\.(md|markdown|txt|json|js|jsx|ts|tsx|css|html|xml|yaml|yml|csv|bfsheet|bfform)$/i.test(String(nextName || "")));
  const file = await getFileRecord(env22, orgId, fileId, { includeData: shouldIncludeData });
  return json({ ok: true, file });
}
__name(onRequestPatch, "onRequestPatch");
__name2(onRequestPatch, "onRequestPatch");
async function onRequestDelete({ env: env22, request, params }) {
  const orgId = params.orgId;
  const fileId = params.id;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  const db = getDb2(env22);
  const existing = await db.prepare(`SELECT storage_key FROM drive_files WHERE org_id = ? AND id = ?`).bind(orgId, fileId).first();
  if (!existing) return bad(404, "NOT_FOUND");
  await deleteFileBlob(env22, { orgId, fileId, storageKey: existing.storage_key || null });
  await db.prepare(`DELETE FROM drive_files WHERE org_id = ? AND id = ?`).bind(orgId, fileId).run();
  return json({ ok: true, deleted: true, id: fileId });
}
__name(onRequestDelete, "onRequestDelete");
__name2(onRequestDelete, "onRequestDelete");
async function onRequestPatch2({ env: env22, request, params }) {
  const orgId = params.orgId;
  const folderId = params.id;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  const body = await request.json().catch(() => ({}));
  const db = getDb2(env22);
  const existing = await db.prepare(`SELECT * FROM drive_folders WHERE org_id = ? AND id = ?`).bind(orgId, folderId).first();
  await db.prepare(`UPDATE drive_folders SET parent_id = ?, name = ?, encrypted_blob = ?, updated_at = ? WHERE org_id = ? AND id = ?`).bind(Object.prototype.hasOwnProperty.call(body, "parentId") ? normalizeNullableId(body.parentId) : existing.parent_id || null, body.encryptedBlob !== void 0 ? "encrypted folder" : body.name === void 0 ? existing.name : String(body.name || "").trim() || "untitled folder", body.encryptedBlob === void 0 ? existing.encrypted_blob || null : String(body.encryptedBlob || "") || null, now(), orgId, folderId).run();
  const folder = await db.prepare(`SELECT id, parent_id, name, encrypted_blob, created_at, updated_at FROM drive_folders WHERE org_id = ? AND id = ?`).bind(orgId, folderId).first();
  if (!folder) return bad(404, "NOT_FOUND");
  return json({ ok: true, folder: { id: folder.id, parentId: folder.parent_id || null, name: folder.encrypted_blob ? "encrypted folder" : folder.name, encryptedBlob: folder.encrypted_blob || "", createdAt: Number(folder.created_at || 0), updatedAt: Number(folder.updated_at || 0) } });
}
__name(onRequestPatch2, "onRequestPatch2");
__name2(onRequestPatch2, "onRequestPatch");
async function onRequestDelete2({ env: env22, request, params }) {
  const orgId = params.orgId;
  const folderId = params.id;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  const db = getDb2(env22);
  const folder = await db.prepare(`SELECT id FROM drive_folders WHERE org_id = ? AND id = ?`).bind(orgId, folderId).first();
  if (!folder) return bad(404, "NOT_FOUND");
  const descendantsRes = await db.prepare(`WITH RECURSIVE subtree(id) AS (SELECT id FROM drive_folders WHERE org_id = ? AND id = ? UNION ALL SELECT f.id FROM drive_folders f JOIN subtree s ON f.parent_id = s.id WHERE f.org_id = ?) SELECT id FROM subtree`).bind(orgId, folderId, orgId).all();
  const folderIds = (descendantsRes.results || []).map((row) => String(row.id || "")).filter(Boolean);
  if (!folderIds.length) return json({ ok: true, deleted: true, id: folderId });
  const placeholders = folderIds.map(() => "?").join(", ");
  const fileRows = await db.prepare(`SELECT id, storage_key FROM drive_files WHERE org_id = ? AND parent_id IN (${placeholders})`).bind(orgId, ...folderIds).all();
  for (const row of fileRows.results || []) await deleteFileBlob(env22, { orgId, fileId: row.id, storageKey: row.storage_key || null });
  await db.prepare(`DELETE FROM drive_notes WHERE org_id = ? AND parent_id IN (${placeholders})`).bind(orgId, ...folderIds).run();
  await db.prepare(`DELETE FROM drive_files WHERE org_id = ? AND parent_id IN (${placeholders})`).bind(orgId, ...folderIds).run();
  await db.prepare(`DELETE FROM drive_folders WHERE org_id = ? AND id IN (${placeholders})`).bind(orgId, ...folderIds).run();
  return json({ ok: true, deleted: true, id: folderId, deletedFolderIds: folderIds });
}
__name(onRequestDelete2, "onRequestDelete2");
__name2(onRequestDelete2, "onRequestDelete");
async function onRequestGet3({ env: env22, request, params }) {
  const orgId = params.orgId;
  const noteId = params.id;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  const row = await getDb2(env22).prepare(`SELECT id, parent_id, title, content, tags, encrypted_blob, created_at, updated_at FROM drive_notes WHERE org_id = ? AND id = ?`).bind(orgId, noteId).first();
  if (!row) return bad(404, "NOT_FOUND");
  return json({ ok: true, note: { id: row.id, parentId: row.parent_id || null, title: row.encrypted_blob ? "encrypted note" : row.title || "untitled", body: row.encrypted_blob ? "" : row.content || "", tags: row.encrypted_blob ? [] : parseTags(row.tags), encryptedBlob: row.encrypted_blob || "", createdAt: Number(row.created_at || 0), updatedAt: Number(row.updated_at || 0) } });
}
__name(onRequestGet3, "onRequestGet3");
__name2(onRequestGet3, "onRequestGet");
async function onRequestPatch3({ env: env22, request, params }) {
  const orgId = params.orgId;
  const noteId = params.id;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  const body = await request.json().catch(() => ({}));
  const db = getDb2(env22);
  const existing = await db.prepare(`SELECT * FROM drive_notes WHERE org_id = ? AND id = ?`).bind(orgId, noteId).first();
  if (!existing) return bad(404, "NOT_FOUND");
  const tags = Object.prototype.hasOwnProperty.call(body, "tags") ? parseTags(body.tags).join(",") : existing.tags;
  const encryptedBlob = body.encryptedBlob === void 0 ? existing.encrypted_blob || null : String(body.encryptedBlob || "") || null;
  await db.prepare(`UPDATE drive_notes SET parent_id = ?, title = ?, content = ?, tags = ?, encrypted_blob = ?, updated_at = ? WHERE org_id = ? AND id = ?`).bind(Object.prototype.hasOwnProperty.call(body, "parentId") ? normalizeNullableId(body.parentId) : existing.parent_id || null, encryptedBlob ? "encrypted note" : body.title === void 0 ? existing.title : String(body.title || "untitled").trim() || "untitled", encryptedBlob ? "" : body.body === void 0 && body.content === void 0 ? existing.content : String(body.body ?? body.content ?? ""), encryptedBlob ? "" : tags, encryptedBlob, now(), orgId, noteId).run();
  const row = await db.prepare(`SELECT id, parent_id, title, content, tags, encrypted_blob, created_at, updated_at FROM drive_notes WHERE org_id = ? AND id = ?`).bind(orgId, noteId).first();
  return json({ ok: true, note: { id: row.id, parentId: row.parent_id || null, title: row.encrypted_blob ? "encrypted note" : row.title || "untitled", body: row.encrypted_blob ? "" : row.content || "", tags: row.encrypted_blob ? [] : parseTags(row.tags), encryptedBlob: row.encrypted_blob || "", createdAt: Number(row.created_at || 0), updatedAt: Number(row.updated_at || 0) } });
}
__name(onRequestPatch3, "onRequestPatch3");
__name2(onRequestPatch3, "onRequestPatch");
async function onRequestDelete3({ env: env22, request, params }) {
  const orgId = params.orgId;
  const noteId = params.id;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  await getDb2(env22).prepare(`DELETE FROM drive_notes WHERE org_id = ? AND id = ?`).bind(orgId, noteId).run();
  return json({ ok: true, deleted: true, id: noteId });
}
__name(onRequestDelete3, "onRequestDelete3");
__name2(onRequestDelete3, "onRequestDelete");
async function onRequestPatch4({ env: env22, request, params }) {
  const orgId = params.orgId;
  const templateId = params.id;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  const body = await request.json().catch(() => ({}));
  const db = getDb2(env22);
  const existing = await db.prepare(`SELECT * FROM drive_templates WHERE org_id = ? AND id = ?`).bind(orgId, templateId).first();
  if (!existing) return bad(404, "NOT_FOUND");
  const encryptedBlob = body.encryptedBlob === void 0 ? existing.encrypted_blob || null : String(body.encryptedBlob || "") || null;
  await db.prepare(`UPDATE drive_templates SET name = ?, title = ?, content = ?, encrypted_blob = ?, updated_at = ? WHERE org_id = ? AND id = ?`).bind(encryptedBlob ? "encrypted template" : body.name === void 0 ? existing.name : String(body.name || "template").trim() || "template", encryptedBlob ? "encrypted template" : body.title === void 0 ? existing.title : String(body.title || "untitled"), encryptedBlob ? "" : body.body === void 0 && body.content === void 0 ? existing.content : String(body.body ?? body.content ?? ""), encryptedBlob, now(), orgId, templateId).run();
  const row = await db.prepare(`SELECT id, name, title, content, encrypted_blob, created_at, updated_at FROM drive_templates WHERE org_id = ? AND id = ?`).bind(orgId, templateId).first();
  return json({ ok: true, template: { id: row.id, name: row.encrypted_blob ? "encrypted template" : row.name || "template", title: row.encrypted_blob ? "encrypted template" : row.title || "untitled", body: row.encrypted_blob ? "" : row.content || "", encryptedBlob: row.encrypted_blob || "", createdAt: Number(row.created_at || 0), updatedAt: Number(row.updated_at || 0) } });
}
__name(onRequestPatch4, "onRequestPatch4");
__name2(onRequestPatch4, "onRequestPatch");
async function onRequestDelete4({ env: env22, request, params }) {
  const orgId = params.orgId;
  const templateId = params.id;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  await getDb2(env22).prepare(`DELETE FROM drive_templates WHERE org_id = ? AND id = ?`).bind(orgId, templateId).run();
  return json({ ok: true, deleted: true, id: templateId });
}
__name(onRequestDelete4, "onRequestDelete4");
__name2(onRequestDelete4, "onRequestDelete");
function slugify(input) {
  return String(input || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
}
__name(slugify, "slugify");
__name2(slugify, "slugify");
async function uniqueSlug(env22, base, orgId) {
  const cleanBase = slugify(base || "org") || "org";
  let trySlug = cleanBase;
  let n = 0;
  while (true) {
    const existingOrgId = await env22.BF_PUBLIC.get(`slug:${trySlug}`);
    if (!existingOrgId || existingOrgId === orgId) return trySlug;
    n += 1;
    trySlug = `${cleanBase}-${n}`;
  }
}
__name(uniqueSlug, "uniqueSlug");
__name2(uniqueSlug, "uniqueSlug");
async function getPublicCfg(env22, orgId) {
  const raw = await env22.BF_PUBLIC.get(`org:${orgId}`);
  return raw ? JSON.parse(raw) : {};
}
__name(getPublicCfg, "getPublicCfg");
__name2(getPublicCfg, "getPublicCfg");
async function setPublicCfg(env22, orgId, cfg) {
  await env22.BF_PUBLIC.put(`org:${orgId}`, JSON.stringify(cfg));
}
__name(setPublicCfg, "setPublicCfg");
__name2(setPublicCfg, "setPublicCfg");
async function setSlugMapping(env22, slug, orgId) {
  const s = String(slug || "").trim().toLowerCase();
  await env22.BF_PUBLIC.put(`slug:${s}`, orgId);
}
__name(setSlugMapping, "setSlugMapping");
__name2(setSlugMapping, "setSlugMapping");
async function removeSlugMapping(env22, slug) {
  const s = String(slug || "").trim().toLowerCase();
  await env22.BF_PUBLIC.delete(`slug:${s}`);
}
__name(removeSlugMapping, "removeSlugMapping");
__name2(removeSlugMapping, "removeSlugMapping");
async function getOrgIdBySlug(env22, slug) {
  const s = String(slug || "").trim().toLowerCase();
  if (!s) return null;
  const orgId = await env22.BF_PUBLIC.get(`slug:${s}`);
  return orgId || null;
}
__name(getOrgIdBySlug, "getOrgIdBySlug");
__name2(getOrgIdBySlug, "getOrgIdBySlug");
function getDB(env22) {
  return env22.DB || env22.BF_DB || null;
}
__name(getDB, "getDB");
__name2(getDB, "getDB");
function json2(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders
    }
  });
}
__name(json2, "json2");
__name2(json2, "json");
function bad2(msg, code = 400) {
  return json2({ ok: false, error: msg }, code);
}
__name(bad2, "bad2");
__name2(bad2, "bad");
async function readJson(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
__name(readJson, "readJson");
__name2(readJson, "readJson");
function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}
__name(normalizeEmail, "normalizeEmail");
__name2(normalizeEmail, "normalizeEmail");
function clean(v, max = 2e3) {
  return String(v || "").trim().slice(0, max);
}
__name(clean, "clean");
__name2(clean, "clean");
function normStatus(v) {
  const s = String(v || "").trim().toLowerCase();
  if (s === "no") return "no";
  if (s === "maybe") return "maybe";
  return "yes";
}
__name(normStatus, "normStatus");
__name2(normStatus, "normStatus");
async function ensureTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS public_meeting_rsvps (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    meeting_id TEXT NOT NULL,
    name TEXT,
    contact TEXT,
    status TEXT NOT NULL,
    note TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_public_meeting_rsvps_lookup ON public_meeting_rsvps(org_id, meeting_id, created_at DESC)`).run();
}
__name(ensureTable, "ensureTable");
__name2(ensureTable, "ensureTable");
async function onRequestPost({ env: env22, params, request }) {
  const slug = String(params?.slug || "").trim();
  const meetingId = String(params?.meetingId || "").trim();
  if (!slug || !meetingId) return bad(400, "MISSING_PARAMS");
  const orgId = await getOrgIdBySlug(env22, slug);
  if (!orgId) return bad(404, "NOT_FOUND");
  const db = getDB(env22);
  if (!db) return bad(500, "DB_NOT_CONFIGURED");
  await ensureTable(db);
  const meeting = await db.prepare(`SELECT id FROM meetings WHERE org_id=? AND id=? AND is_public=1 LIMIT 1`).bind(orgId, meetingId).first();
  if (!meeting?.id) return bad(404, "MEETING_NOT_FOUND");
  const body = await readJSON(request);
  const id = crypto.randomUUID();
  const created2 = now();
  await db.prepare(`INSERT INTO public_meeting_rsvps (
    id, org_id, meeting_id, name, contact, status, note, created_at, updated_at
  ) VALUES (?,?,?,?,?,?,?,?,?)`).bind(
    id,
    orgId,
    meetingId,
    clean(body?.name, 160),
    clean(body?.contact, 220),
    normStatus(body?.status),
    clean(body?.note, 4e3),
    created2,
    created2
  ).run();
  return ok({ id, meeting_id: meetingId, saved: true });
}
__name(onRequestPost, "onRequestPost");
__name2(onRequestPost, "onRequestPost");
function normStatus2(s) {
  const v = String(s || "").trim().toLowerCase();
  if (v === "yes" || v === "going" || v === "y") return "yes";
  if (v === "no" || v === "not going" || v === "n") return "no";
  if (v === "maybe" || v === "m") return "maybe";
  return "yes";
}
__name(normStatus2, "normStatus2");
__name2(normStatus2, "normStatus");
async function ensureRsvpTable(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS meeting_rsvps (
        org_id TEXT NOT NULL,
        meeting_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        status TEXT NOT NULL,
        note TEXT,
        created_at INTEGER,
        updated_at INTEGER
      )`
  ).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_meeting_rsvps_lookup ON meeting_rsvps(org_id, meeting_id, user_id)"
  ).run();
}
__name(ensureRsvpTable, "ensureRsvpTable");
__name2(ensureRsvpTable, "ensureRsvpTable");
async function getColumns(db) {
  const info32 = await db.prepare("PRAGMA table_info(meeting_rsvps)").all();
  const cols = /* @__PURE__ */ new Set();
  for (const r of info32?.results || []) cols.add(String(r?.name || ""));
  return cols;
}
__name(getColumns, "getColumns");
__name2(getColumns, "getColumns");
function has(cols, name) {
  return cols.has(name);
}
__name(has, "has");
__name2(has, "has");
async function onRequest(ctx) {
  const { request, env: env22, params } = ctx || {};
  const orgId = String(params?.orgId || "");
  const meetingId = String(params?.meetingId || "");
  if (!orgId || !meetingId) return bad(400, "MISSING_PARAMS");
  const db = getDb(env22);
  if (!db) return bad(500, "NO_DB_BINDING");
  await ensureRsvpTable(db);
  const cols = await getColumns(db);
  const gate = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!gate.ok) return gate.resp;
  const role = String(gate.role || "");
  const isAdmin = role === "admin" || role === "owner";
  const userId = String(gate.user?.sub || gate.user?.id || "");
  if (!userId) return bad(401, "UNAUTHORIZED");
  if (request.method === "GET") {
    const my = await db.prepare(
      "SELECT status, note, created_at, updated_at FROM meeting_rsvps WHERE org_id=? AND meeting_id=? AND user_id=? LIMIT 1"
    ).bind(orgId, meetingId, userId).first();
    if (!isAdmin) return ok({ my_rsvp: my || null });
    const rows = await db.prepare(
      "SELECT user_id, status, note, created_at, updated_at FROM meeting_rsvps WHERE org_id=? AND meeting_id=? ORDER BY (CASE WHEN updated_at IS NULL THEN created_at ELSE updated_at END) DESC"
    ).bind(orgId, meetingId).all();
    return ok({ my_rsvp: my || null, rsvps: rows?.results || [] });
  }
  if (request.method !== "POST") return bad(405, "METHOD_NOT_ALLOWED");
  const body = await readJSON(request);
  const status = normStatus2(body?.status);
  const note = String(body?.note || "").slice(0, 2e3);
  const ts = now();
  const setParts = [];
  const setVals = [];
  if (has(cols, "status")) {
    setParts.push("status=?");
    setVals.push(status);
  }
  if (has(cols, "note")) {
    setParts.push("note=?");
    setVals.push(note);
  }
  if (has(cols, "updated_at")) {
    setParts.push("updated_at=?");
    setVals.push(ts);
  }
  if (setParts.length === 0) {
    return bad(500, "RSVP_SCHEMA_INVALID");
  }
  const updateRes = await db.prepare(
    `UPDATE meeting_rsvps SET ${setParts.join(", ")} WHERE org_id=? AND meeting_id=? AND user_id=?`
  ).bind(...setVals, orgId, meetingId, userId).run();
  const updated = Number(updateRes?.meta?.changes || 0);
  if (updated === 0) {
    const insertCols = [];
    const insertQs = [];
    const insertVals = [];
    if (has(cols, "org_id")) {
      insertCols.push("org_id");
      insertQs.push("?");
      insertVals.push(orgId);
    }
    if (has(cols, "meeting_id")) {
      insertCols.push("meeting_id");
      insertQs.push("?");
      insertVals.push(meetingId);
    }
    if (has(cols, "user_id")) {
      insertCols.push("user_id");
      insertQs.push("?");
      insertVals.push(userId);
    }
    if (has(cols, "status")) {
      insertCols.push("status");
      insertQs.push("?");
      insertVals.push(status);
    }
    if (has(cols, "note")) {
      insertCols.push("note");
      insertQs.push("?");
      insertVals.push(note);
    }
    if (has(cols, "created_at")) {
      insertCols.push("created_at");
      insertQs.push("?");
      insertVals.push(ts);
    }
    if (has(cols, "updated_at")) {
      insertCols.push("updated_at");
      insertQs.push("?");
      insertVals.push(ts);
    }
    if (has(cols, "id")) {
      const id = (globalThis.crypto?.randomUUID?.() || `${ts}-${Math.random()}`).toString();
      insertCols.push("id");
      insertQs.push("?");
      insertVals.push(id);
    }
    await db.prepare(
      `INSERT INTO meeting_rsvps (${insertCols.join(", ")}) VALUES (${insertQs.join(", ")})`
    ).bind(...insertVals).run();
  }
  return ok({ meeting_id: meetingId, status });
}
__name(onRequest, "onRequest");
__name2(onRequest, "onRequest");
async function onRequestGet4({ env: env22, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  const res = await getDb2(env22).prepare(`SELECT id, parent_id, name, mime, size, storage_key, encrypted, encrypted_blob, created_at, updated_at FROM drive_files WHERE org_id = ? ORDER BY LOWER(name) ASC`).bind(orgId).all();
  return json({ ok: true, files: (res.results || []).map((row) => ({ id: row.id, parentId: row.parent_id || null, name: row.encrypted_blob ? "encrypted file" : row.name || "file", mime: row.encrypted_blob ? "application/octet-stream" : row.mime || "application/octet-stream", size: Number(row.size || 0), encrypted: Number(row.encrypted || 0) === 1, encryptedBlob: row.encrypted_blob || "", storageKey: row.storage_key || null, createdAt: Number(row.created_at || 0), updatedAt: Number(row.updated_at || 0) })) });
}
__name(onRequestGet4, "onRequestGet4");
__name2(onRequestGet4, "onRequestGet");
async function onRequestPost2({ env: env22, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  const contentType = String(request.headers.get("content-type") || "").toLowerCase();
  const db = getDb2(env22);
  const id = uuid();
  const t = now();
  const bucket = getDriveBucket(env22);
  const persistBinaryUpload = /* @__PURE__ */ __name2(async ({ name, mime, parentId, bytes, encrypted: encrypted2 = false, encryptedBlob = "" }) => {
    const storageKey2 = `${orgId}/drive/files/${id}`;
    const size = Number(bytes?.byteLength || 0);
    if (bucket && storageKey2) {
      try {
        await bucket.put(storageKey2, bytes, { httpMetadata: { contentType: encrypted2 ? "application/octet-stream" : mime || "application/octet-stream" } });
      } catch (error32) {
        return bad(500, "FILE_STORAGE_FAILED", { detail: String(error32?.message || error32 || "Bucket write failed") });
      }
    } else if (encrypted2) {
      await saveFileBlob(env22, { orgId, fileId: id, storageKey: storageKey2, mime: mime || "application/octet-stream", encryptedPayload: new TextDecoder().decode(bytes), encrypted: true });
    } else {
      const tooLargeForInline = size > 4 * 1024 * 1024 && !isEditableTextMime(mime, name);
      if (tooLargeForInline) return bad(500, "FILE_STORAGE_FAILED", { detail: "Drive bucket unavailable for large binary upload" });
      const dataUrl = dataUrlFromBytes(bytes, mime || "application/octet-stream");
      const textContent = isEditableTextMime(mime, name) ? textFromBytes(bytes) : "";
      await saveFileBlob(env22, { orgId, fileId: id, storageKey: storageKey2, mime, dataUrl, textContent, encrypted: false });
    }
    await db.prepare(`INSERT INTO drive_files (id, org_id, parent_id, name, mime, size, storage_key, encrypted, encrypted_blob, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, orgId, parentId, encrypted2 ? "encrypted file" : name, encrypted2 ? "application/octet-stream" : mime, size, storageKey2, encrypted2 ? 1 : 0, encryptedBlob || null, t, t).run();
    const createdFile2 = await getFileRecord(env22, orgId, id, { includeData: false });
    return created("file", createdFile2 || { id, parentId, name, mime, size, storageKey: storageKey2, encrypted: encrypted2, encryptedBlob, createdAt: t, updatedAt: t });
  }, "persistBinaryUpload");
  const headerName = String(request.headers.get("x-drive-name") || "").trim();
  if (headerName) {
    const encrypted2 = String(request.headers.get("x-drive-encrypted") || "") === "1";
    const encryptedBlob = String(request.headers.get("x-drive-encrypted-blob") || "");
    const name = encrypted2 ? "encrypted file" : headerName || "file";
    const mime = encrypted2 ? "application/octet-stream" : String(request.headers.get("x-drive-mime") || contentType || "application/octet-stream");
    const parentId = normalizeNullableId(request.headers.get("x-drive-parent-id"));
    const bytes = new Uint8Array(await request.arrayBuffer());
    return persistBinaryUpload({ name, mime, parentId, bytes, encrypted: encrypted2, encryptedBlob });
  }
  const body = await request.json().catch(() => ({}));
  const encrypted = Number(body.encrypted || 0) === 1 || !!body.encryptedPayload;
  const storageKey = `${orgId}/drive/files/${id}`;
  const file = { id, parentId: normalizeNullableId(body.parentId), name: encrypted ? "encrypted file" : String(body.name || "file").trim() || "file", mime: encrypted ? "application/octet-stream" : String(body.mime || "application/octet-stream"), size: Number(body.size || 0), storageKey, encrypted, encryptedBlob: String(body.encryptedBlob || ""), createdAt: t, updatedAt: t };
  await db.prepare(`INSERT INTO drive_files (id, org_id, parent_id, name, mime, size, storage_key, encrypted, encrypted_blob, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, orgId, file.parentId, file.name, file.mime, file.size, storageKey, encrypted ? 1 : 0, file.encryptedBlob || null, t, t).run();
  if (encrypted) {
    await saveFileBlob(env22, { orgId, fileId: id, storageKey, mime: "application/octet-stream", encryptedPayload: String(body.encryptedPayload || ""), encrypted: true });
  } else {
    await saveFileBlob(env22, { orgId, fileId: id, storageKey, mime: file.mime, dataUrl: String(body.dataUrl || ""), textContent: String(body.textContent || ""), encrypted: false });
  }
  const createdFile = await getFileRecord(env22, orgId, id, { includeData: false });
  return created("file", createdFile || file);
}
__name(onRequestPost2, "onRequestPost2");
__name2(onRequestPost2, "onRequestPost");
async function onRequestGet5({ env: env22, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  const res = await getDb2(env22).prepare(`SELECT id, parent_id, name, encrypted_blob, created_at, updated_at FROM drive_folders WHERE org_id = ? ORDER BY LOWER(name) ASC`).bind(orgId).all();
  return json({ ok: true, folders: (res.results || []).map((row) => ({ id: row.id, parentId: row.parent_id || null, name: row.encrypted_blob ? "encrypted folder" : row.name, encryptedBlob: row.encrypted_blob || "", createdAt: Number(row.created_at || 0), updatedAt: Number(row.updated_at || 0) })) });
}
__name(onRequestGet5, "onRequestGet5");
__name2(onRequestGet5, "onRequestGet");
async function onRequestPost3({ env: env22, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  const body = await request.json().catch(() => ({}));
  const id = uuid();
  const t = now();
  const folder = { id, parentId: normalizeNullableId(body.parentId), name: String(body.name || "untitled folder").trim() || "untitled folder", encryptedBlob: String(body.encryptedBlob || ""), createdAt: t, updatedAt: t };
  await getDb2(env22).prepare(`INSERT INTO drive_folders (id, org_id, parent_id, name, encrypted_blob, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(id, orgId, folder.parentId, folder.encryptedBlob ? "encrypted folder" : folder.name, folder.encryptedBlob || null, t, t).run();
  return created("folder", folder);
}
__name(onRequestPost3, "onRequestPost3");
__name2(onRequestPost3, "onRequestPost");
async function onRequestPost4({ env: env22, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  const db = getDb2(env22);
  const body = await request.json().catch(() => ({}));
  const t = now();
  const folders = Array.isArray(body.folders) ? body.folders : [];
  const notes = Array.isArray(body.notes) ? body.notes : [];
  const files = Array.isArray(body.files) ? body.files : [];
  const templates = Array.isArray(body.templates) ? body.templates : [];
  for (const folder of folders) {
    const id = String(folder?.id || uuid());
    await db.prepare(
      `INSERT INTO drive_folders (id, org_id, parent_id, name, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id)
       DO UPDATE SET parent_id = excluded.parent_id, name = excluded.name, updated_at = excluded.updated_at`
    ).bind(id, orgId, normalizeNullableId(folder?.parentId), String(folder?.name || "untitled folder"), Number(folder?.createdAt || t), Number(folder?.updatedAt || t)).run();
  }
  for (const note of notes) {
    const id = String(note?.id || uuid());
    await db.prepare(
      `INSERT INTO drive_notes (id, org_id, parent_id, title, content, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id)
       DO UPDATE SET parent_id = excluded.parent_id, title = excluded.title, content = excluded.content, tags = excluded.tags, updated_at = excluded.updated_at`
    ).bind(id, orgId, normalizeNullableId(note?.parentId), String(note?.title || "untitled"), String(note?.body || note?.content || ""), parseTags(note?.tags).join(","), Number(note?.createdAt || t), Number(note?.updatedAt || t)).run();
  }
  for (const template of templates) {
    const id = String(template?.id || uuid());
    await db.prepare(
      `INSERT INTO drive_templates (id, org_id, name, title, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id)
       DO UPDATE SET name = excluded.name, title = excluded.title, content = excluded.content, updated_at = excluded.updated_at`
    ).bind(id, orgId, String(template?.name || "template"), String(template?.title || "untitled"), String(template?.body || template?.content || ""), Number(template?.createdAt || t), Number(template?.updatedAt || t)).run();
  }
  for (const file of files) {
    const id = String(file?.id || uuid());
    const storageKey = `${orgId}/drive/files/${id}/${encodeURIComponent(String(file?.name || "file"))}`;
    await db.prepare(
      `INSERT INTO drive_files (id, org_id, parent_id, name, mime, size, storage_key, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id)
       DO UPDATE SET parent_id = excluded.parent_id, name = excluded.name, mime = excluded.mime, size = excluded.size, storage_key = excluded.storage_key, updated_at = excluded.updated_at`
    ).bind(id, orgId, normalizeNullableId(file?.parentId), String(file?.name || "file"), String(file?.mime || "application/octet-stream"), Number(file?.size || 0), storageKey, Number(file?.createdAt || t), Number(file?.updatedAt || t)).run();
    if (file?.dataUrl) {
      await saveFileBlob(env22, {
        orgId,
        fileId: id,
        storageKey,
        mime: String(file?.mime || "application/octet-stream"),
        dataUrl: String(file.dataUrl),
        textContent: String(file?.textContent || "")
      });
    }
  }
  return json({ ok: true, imported: { folders: folders.length, notes: notes.length, files: files.length, templates: templates.length } });
}
__name(onRequestPost4, "onRequestPost4");
__name2(onRequestPost4, "onRequestPost");
async function onRequestGet6({ env: env22, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  const res = await getDb2(env22).prepare(`SELECT id, parent_id, title, content, tags, encrypted_blob, created_at, updated_at FROM drive_notes WHERE org_id = ? ORDER BY updated_at DESC`).bind(orgId).all();
  return json({ ok: true, notes: (res.results || []).map((row) => ({ id: row.id, parentId: row.parent_id || null, title: row.encrypted_blob ? "encrypted note" : row.title || "untitled", body: row.encrypted_blob ? "" : row.content || "", tags: row.encrypted_blob ? [] : parseTags(row.tags), encryptedBlob: row.encrypted_blob || "", createdAt: Number(row.created_at || 0), updatedAt: Number(row.updated_at || 0) })) });
}
__name(onRequestGet6, "onRequestGet6");
__name2(onRequestGet6, "onRequestGet");
async function onRequestPost5({ env: env22, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  const body = await request.json().catch(() => ({}));
  const id = uuid();
  const t = now();
  const note = { id, parentId: normalizeNullableId(body.parentId), title: String(body.title || "untitled").trim() || "untitled", body: String(body.body || body.content || ""), tags: parseTags(body.tags), encryptedBlob: String(body.encryptedBlob || ""), createdAt: t, updatedAt: t };
  await getDb2(env22).prepare(`INSERT INTO drive_notes (id, org_id, parent_id, title, content, tags, encrypted_blob, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, orgId, note.parentId, note.encryptedBlob ? "encrypted note" : note.title, note.encryptedBlob ? "" : note.body, note.encryptedBlob ? "" : note.tags.join(","), note.encryptedBlob || null, t, t).run();
  return created("note", note);
}
__name(onRequestPost5, "onRequestPost5");
__name2(onRequestPost5, "onRequestPost");
async function onRequestGet7({ env: env22, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  const res = await getDb2(env22).prepare(`SELECT id, name, title, content, encrypted_blob, created_at, updated_at FROM drive_templates WHERE org_id = ? ORDER BY updated_at DESC`).bind(orgId).all();
  return json({ ok: true, templates: (res.results || []).map((row) => ({ id: row.id, name: row.encrypted_blob ? "encrypted template" : row.name || "template", title: row.encrypted_blob ? "encrypted template" : row.title || "untitled", body: row.encrypted_blob ? "" : row.content || "", encryptedBlob: row.encrypted_blob || "", createdAt: Number(row.created_at || 0), updatedAt: Number(row.updated_at || 0) })) });
}
__name(onRequestGet7, "onRequestGet7");
__name2(onRequestGet7, "onRequestGet");
async function onRequestPost6({ env: env22, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env22);
  const body = await request.json().catch(() => ({}));
  const id = uuid();
  const t = now();
  const template = { id, name: String(body.name || "template").trim() || "template", title: String(body.title || "untitled"), body: String(body.body || body.content || ""), encryptedBlob: String(body.encryptedBlob || ""), createdAt: t, updatedAt: t };
  await getDb2(env22).prepare(`INSERT INTO drive_templates (id, org_id, name, title, content, encrypted_blob, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, orgId, template.encryptedBlob ? "encrypted template" : template.name, template.encryptedBlob ? "encrypted template" : template.title, template.encryptedBlob ? "" : template.body, template.encryptedBlob || null, t, t).run();
  return created("template", template);
}
__name(onRequestPost6, "onRequestPost6");
__name2(onRequestPost6, "onRequestPost");
async function tryRun(db, sql) {
  try {
    await db.prepare(sql).run();
  } catch (e) {
    const msg = String(e?.message || "");
    if (msg.includes("duplicate") || msg.includes("already exists")) return;
    if (msg.includes("SQLITE_ERROR")) return;
    throw e;
  }
}
__name(tryRun, "tryRun");
__name2(tryRun, "tryRun");
async function tableHasColumn(db, table32, col) {
  const info32 = await db.prepare(`PRAGMA table_info(${table32})`).all();
  const cols = (info32?.results || []).map((r) => r.name);
  return cols.includes(col);
}
__name(tableHasColumn, "tableHasColumn");
__name2(tableHasColumn, "tableHasColumn");
async function ensureZkSchema(db) {
  await tryRun(
    db,
    "CREATE TABLE IF NOT EXISTS org_key_wrapped (\norg_id TEXT NOT NULL,\nuser_id TEXT NOT NULL,\nwrapped_key TEXT NOT NULL,\nkid TEXT,\ncreated_at INTEGER,\nkey_version INTEGER DEFAULT 1,\nwrapped_at INTEGER,\nPRIMARY KEY (org_id, user_id)\n)"
  );
  await tryRun(db, "CREATE INDEX IF NOT EXISTS idx_org_key_wrapped_org ON org_key_wrapped(org_id)");
  await tryRun(
    db,
    "CREATE TABLE IF NOT EXISTS org_key_recovery (\norg_id TEXT NOT NULL,\nuser_id TEXT NOT NULL,\nwrapped_key TEXT NOT NULL,\nsalt TEXT NOT NULL,\nkdf TEXT NOT NULL,\nupdated_at INTEGER NOT NULL,\nPRIMARY KEY (org_id, user_id)\n)"
  );
  await tryRun(db, "CREATE INDEX IF NOT EXISTS idx_org_key_recovery_org ON org_key_recovery(org_id)");
  await tryRun(
    db,
    "CREATE TABLE IF NOT EXISTS org_crypto (\norg_id TEXT PRIMARY KEY,\nkey_version INTEGER NOT NULL DEFAULT 1,\nupdated_at INTEGER NOT NULL\n)"
  );
  await tryRun(db, "ALTER TABLE org_key_wrapped ADD COLUMN kid TEXT");
  await tryRun(db, "ALTER TABLE org_key_wrapped ADD COLUMN created_at INTEGER");
  await tryRun(db, "ALTER TABLE org_key_wrapped ADD COLUMN key_version INTEGER DEFAULT 1");
  await tryRun(db, "ALTER TABLE org_key_wrapped ADD COLUMN wrapped_at INTEGER");
  const hasVersion = await tableHasColumn(db, "org_crypto", "version");
  const hasKeyVersion = await tableHasColumn(db, "org_crypto", "key_version");
  if (hasVersion && !hasKeyVersion) {
    await tryRun(db, "ALTER TABLE org_crypto ADD COLUMN key_version INTEGER DEFAULT 1");
    await tryRun(db, "UPDATE org_crypto SET key_version = COALESCE(key_version, version)");
  }
  const hasUpdatedAt = await tableHasColumn(db, "org_crypto", "updated_at");
  if (!hasUpdatedAt) {
    await tryRun(db, "ALTER TABLE org_crypto ADD COLUMN updated_at INTEGER");
    await tryRun(db, "UPDATE org_crypto SET updated_at = COALESCE(updated_at, (strftime('%s','now')*1000))");
  }
  await tryRun(db, "ALTER TABLE org_memberships ADD COLUMN encrypted_blob TEXT");
  await tryRun(db, "ALTER TABLE org_memberships ADD COLUMN key_version INTEGER DEFAULT 1");
  await tryRun(db, "ALTER TABLE newsletter_subscribers ADD COLUMN encrypted_blob TEXT");
  await tryRun(db, "ALTER TABLE newsletter_subscribers ADD COLUMN key_version INTEGER DEFAULT 1");
}
__name(ensureZkSchema, "ensureZkSchema");
__name2(ensureZkSchema, "ensureZkSchema");
async function getOrgKeyVersion(db, orgId) {
  await ensureZkSchema(db);
  try {
    const row = await db.prepare("SELECT key_version FROM org_crypto WHERE org_id = ?").bind(orgId).first();
    return Number.isFinite(Number(row?.key_version)) ? Number(row.key_version) : 1;
  } catch (e) {
    const msg = String(e?.message || "");
    if (!msg.includes("no such column: key_version")) throw e;
    const row = await db.prepare("SELECT version AS key_version FROM org_crypto WHERE org_id = ?").bind(orgId).first();
    return Number.isFinite(Number(row?.key_version)) ? Number(row.key_version) : 1;
  }
}
__name(getOrgKeyVersion, "getOrgKeyVersion");
__name2(getOrgKeyVersion, "getOrgKeyVersion");
function csvEscape(v) {
  const s = String(v ?? "");
  if (s.includes("\n") || s.includes("\r") || s.includes(",") || s.includes('"')) {
    return '"' + s.replaceAll('"', '""') + '"';
  }
  return s;
}
__name(csvEscape, "csvEscape");
__name2(csvEscape, "csvEscape");
async function onRequestGet8(ctx) {
  const { params, env: env22, request } = ctx;
  const orgId = String(params.orgId || "");
  if (!orgId) return err(400, "BAD_ORG_ID");
  const db = getDB(env22);
  if (!db) return err(500, "DB_NOT_CONFIGURED");
  await ensureZkSchema(db);
  await db.prepare(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      email TEXT NOT NULL,
      name TEXT NULL,
      source TEXT NULL,
      created_at INTEGER NOT NULL
    )`).run();
  await db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_subscribers_org_email
      ON newsletter_subscribers(org_id, email)`).run();
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "admin" });
  if (!auth.ok) return auth.resp;
  const url = new URL(request.url);
  const wantCsv = (url.searchParams.get("format") || "").toLowerCase() === "csv";
  const allowPlaintext = true;
  const r = await db.prepare(
    `SELECT id, email, name, created_at, encrypted_blob, key_version
       FROM newsletter_subscribers
      WHERE org_id = ?
      ORDER BY created_at DESC
      LIMIT 5000`
  ).bind(orgId).all();
  const rows = Array.isArray(r?.results) ? r.results : [];
  if (!wantCsv) {
    const safe = rows.map((s) => {
      const hasEnc = !!s.encrypted_blob;
      return {
        id: s.id,
        // If plaintext columns are blank but encrypted data exists, return a
        // placeholder so the client can decrypt and display.
        email: allowPlaintext ? s.email || (hasEnc ? "__encrypted__" : "") : hasEnc ? "__encrypted__" : "",
        name: allowPlaintext ? s.name || (hasEnc ? "__encrypted__" : "") : hasEnc ? "__encrypted__" : "",
        created_at: s.created_at ?? null,
        encrypted_blob: s.encrypted_blob || null,
        key_version: s.key_version ?? null,
        needs_encryption: !hasEnc
      };
    });
    return ok({ subscribers: safe });
  }
  const header = ["email", "name", "joined"].join(",");
  const lines = rows.map((s) => {
    const joined = s.created_at ? new Date(Number(s.created_at)).toISOString() : "";
    return [csvEscape(s.email), csvEscape(s.name), csvEscape(joined)].join(",");
  });
  const csv = [header, ...lines].join("\n");
  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="subscribers-${orgId}.csv"`
    }
  });
}
__name(onRequestGet8, "onRequestGet8");
__name2(onRequestGet8, "onRequestGet");
async function readJson2(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
__name(readJson2, "readJson2");
__name2(readJson2, "readJson");
async function onRequestPost7(ctx) {
  const { params, env: env22, request } = ctx;
  const orgId = String(params.orgId || "");
  if (!orgId) return err(400, "BAD_ORG_ID");
  const db = getDB(env22);
  if (!db) return err(500, "DB_NOT_CONFIGURED");
  await ensureZkSchema(db);
  await db.prepare(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      email TEXT NOT NULL,
      name TEXT NULL,
      source TEXT NULL,
      created_at INTEGER NOT NULL
    )`).run();
  await db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_subscribers_org_email
      ON newsletter_subscribers(org_id, email)`).run();
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "admin" });
  if (!auth.ok) return auth.resp;
  const body = await readJson2(request);
  const updates = Array.isArray(body.updates) ? body.updates : body.id ? [body] : [];
  if (updates.length === 0) return err(400, "MISSING_UPDATES");
  let changed = 0;
  for (const u of updates) {
    const id = String(u?.id || "").trim();
    const enc = u?.encrypted_blob ? String(u.encrypted_blob) : "";
    const kv = u?.key_version != null ? Number(u.key_version) : null;
    if (!id || !enc) continue;
    await db.prepare(
      "UPDATE newsletter_subscribers SET encrypted_blob = ?, key_version = COALESCE(?, key_version) WHERE org_id = ? AND id = ?"
    ).bind(enc, kv, orgId, id).run();
    changed++;
  }
  return ok({ updated: true, changed });
}
__name(onRequestPost7, "onRequestPost7");
__name2(onRequestPost7, "onRequestPost");
async function onRequestDelete5(ctx) {
  const { params, env: env22, request } = ctx;
  const orgId = String(params.orgId || "");
  if (!orgId) return err(400, "BAD_ORG_ID");
  const db = getDB(env22);
  if (!db) return err(500, "DB_NOT_CONFIGURED");
  await ensureZkSchema(db);
  await db.prepare(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      email TEXT NOT NULL,
      name TEXT NULL,
      source TEXT NULL,
      created_at INTEGER NOT NULL
    )`).run();
  await db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_subscribers_org_email
      ON newsletter_subscribers(org_id, email)`).run();
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "admin" });
  if (!auth.ok) return auth.resp;
  const body = await readJson2(request);
  const id = String(body?.id || "").trim();
  if (!id) return err(400, "MISSING_ID");
  await db.prepare("DELETE FROM newsletter_subscribers WHERE org_id = ? AND id = ?").bind(orgId, id).run();
  return ok({ deleted: true });
}
__name(onRequestDelete5, "onRequestDelete5");
__name2(onRequestDelete5, "onRequestDelete");
function authOk(env22, request) {
  if (env22.BF_WRITE_LOCKED === "true") {
    const auth = request.headers.get("authorization") || "";
    return auth.startsWith("Bearer ");
  }
  return true;
}
__name(authOk, "authOk");
__name2(authOk, "authOk");
async function onRequestPost8({ env: env22, request, params }) {
  if (!authOk(env22, request)) {
    return Response.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
  const orgId = params.orgId;
  const prev = await getPublicCfg(env22, orgId);
  const base = slugify(prev.title) || slugify(orgId) || "org";
  const final = await uniqueSlug(env22, base, orgId);
  if (prev.slug) {
    const mapped = await env22.BF_PUBLIC.get(`slug:${prev.slug}`);
    if (mapped === orgId) await removeSlugMapping(env22, prev.slug);
  }
  await setSlugMapping(env22, final, orgId);
  const saved = { ...prev, slug: final };
  await setPublicCfg(env22, orgId, saved);
  return Response.json({ ok: true, public: saved });
}
__name(onRequestPost8, "onRequestPost8");
__name2(onRequestPost8, "onRequestPost");
function authOk2(env22, request) {
  if (env22.BF_WRITE_LOCKED === "true") {
    const auth = request.headers.get("authorization") || "";
    return auth.startsWith("Bearer ");
  }
  return true;
}
__name(authOk2, "authOk2");
__name2(authOk2, "authOk");
async function onRequestGet9({ env: env22, request, params }) {
  if (!authOk2(env22, request)) {
    return Response.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
  const orgId = params.orgId;
  const cfg = await getPublicCfg(env22, orgId);
  const cleaned = {
    enabled: !!cfg?.enabled,
    newsletter_enabled: !!cfg?.newsletter_enabled,
    pledges_enabled: cfg?.pledges_enabled !== false,
    show_action_strip: cfg?.show_action_strip !== false,
    show_needs: cfg?.show_needs !== false,
    show_meetings: cfg?.show_meetings !== false,
    show_what_we_do: cfg?.show_what_we_do !== false,
    show_get_involved: !!cfg?.show_get_involved,
    show_newsletter_card: !!cfg?.show_newsletter_card,
    show_website_button: !!cfg?.show_website_button,
    slug: String(cfg?.slug || ""),
    title: String(cfg?.title || ""),
    location: String(cfg?.location || ""),
    about: String(cfg?.about || ""),
    accent_color: String(cfg?.accent_color || "#6d5efc"),
    theme_mode: String(cfg?.theme_mode || "light"),
    website_link: cfg?.website_link || null,
    meeting_rsvp_url: String(cfg?.meeting_rsvp_url || ""),
    what_we_do: Array.isArray(cfg?.what_we_do) ? cfg.what_we_do : [],
    primary_actions: Array.isArray(cfg?.primary_actions) ? cfg.primary_actions : [],
    get_involved_links: Array.isArray(cfg?.get_involved_links) ? cfg.get_involved_links : []
  };
  return Response.json({ ok: true, public: cleaned });
}
__name(onRequestGet9, "onRequestGet9");
__name2(onRequestGet9, "onRequestGet");
function json3(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
__name(json3, "json3");
__name2(json3, "json");
async function ensureTable2(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS public_inbox (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'intake',
      source_kind TEXT,
      name TEXT,
      contact TEXT,
      details TEXT,
      extra TEXT,
      review_status TEXT NOT NULL DEFAULT 'new',
      admin_note TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_public_inbox_org_created
    ON public_inbox(org_id, created_at DESC)
  `).run();
  const info32 = await db.prepare(`PRAGMA table_info(public_inbox)`).all();
  const cols = new Set((info32?.results || []).map((r) => String(r.name || "").toLowerCase()));
  const addCol = /* @__PURE__ */ __name2(async (sql) => {
    try {
      await db.prepare(sql).run();
    } catch {
    }
  }, "addCol");
  if (!cols.has("type")) {
    await addCol(`ALTER TABLE public_inbox ADD COLUMN type TEXT NOT NULL DEFAULT 'intake'`);
  }
  if (!cols.has("source_kind")) {
    await addCol(`ALTER TABLE public_inbox ADD COLUMN source_kind TEXT`);
  }
  if (!cols.has("review_status")) {
    await addCol(`ALTER TABLE public_inbox ADD COLUMN review_status TEXT NOT NULL DEFAULT 'new'`);
  }
  if (!cols.has("admin_note")) {
    await addCol(`ALTER TABLE public_inbox ADD COLUMN admin_note TEXT`);
  }
  if (!cols.has("updated_at")) {
    await addCol(`ALTER TABLE public_inbox ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0`);
  }
}
__name(ensureTable2, "ensureTable2");
__name2(ensureTable2, "ensureTable");
function mapInboxItem(row) {
  const sourceKind = String(row?.source_kind || "").trim().toLowerCase();
  const type = String(row?.type || "intake").trim().toLowerCase();
  let title22 = "Public intake";
  if (sourceKind === "get_help") title22 = "Get Help";
  else if (sourceKind === "volunteer") title22 = "Volunteer";
  else if (sourceKind === "offer_resources") title22 = "Offer Resources";
  else if (sourceKind === "inventory_request") title22 = "Inventory Request";
  else if (type === "rsvp") title22 = "Meeting RSVP";
  let details = String(row?.details || "").trim();
  let extra = String(row?.extra || "").trim();
  if (sourceKind === "inventory_request" && extra) {
    try {
      const parsed = JSON.parse(extra);
      if (parsed?.note) extra = String(parsed.note || "").trim();
      if (Array.isArray(parsed?.items) && parsed.items.length) {
        details = parsed.items.map(
          (item) => `${String(item?.name || "item").trim()} x ${Math.max(
            1,
            Math.floor(Number(item?.qty_requested || 1) || 1)
          )}${item?.unit ? ` ${String(item.unit).trim()}` : ""}`
        ).join("\n");
      }
    } catch {
    }
  }
  return { ...row, title: title22, details, extra };
}
__name(mapInboxItem, "mapInboxItem");
__name2(mapInboxItem, "mapInboxItem");
async function onRequestGet10(context22) {
  const { env: env22, params } = context22;
  try {
    const orgId = String(params?.orgId || "").trim();
    if (!orgId) return json3({ ok: false, error: "BAD_ORG" }, 400);
    const db = getDB(env22);
    if (!db) return json3({ ok: false, error: "DB_NOT_CONFIGURED" }, 500);
    await ensureTable2(db);
    const rows = await db.prepare(`
        SELECT id, org_id, type, source_kind, name, contact, details, extra, review_status, admin_note, created_at, updated_at
        FROM public_inbox
        WHERE org_id = ?
        ORDER BY COALESCE(updated_at, created_at) DESC, created_at DESC
      `).bind(orgId).all();
    return json3({
      ok: true,
      items: (Array.isArray(rows?.results) ? rows.results : []).map(mapInboxItem)
    });
  } catch (err2) {
    return json3(
      { ok: false, error: "INTERNAL", detail: String(err2?.message || err2 || "") },
      500
    );
  }
}
__name(onRequestGet10, "onRequestGet10");
__name2(onRequestGet10, "onRequestGet");
async function onRequestPut(context22) {
  const { env: env22, params, request } = context22;
  try {
    const orgId = String(params?.orgId || "").trim();
    if (!orgId) return json3({ ok: false, error: "BAD_ORG" }, 400);
    const body = await request.json().catch(() => ({}));
    const id = body?.id != null ? String(body.id) : "";
    if (!id) return json3({ ok: false, error: "BAD_ID" }, 400);
    const status = String(body?.review_status || "new").trim().toLowerCase();
    const adminNote = String(body?.admin_note || "");
    const db = getDB(env22);
    if (!db) return json3({ ok: false, error: "DB_NOT_CONFIGURED" }, 500);
    await ensureTable2(db);
    await db.prepare(`
        UPDATE public_inbox
        SET review_status = ?, admin_note = ?, updated_at = unixepoch('now') * 1000
        WHERE org_id = ? AND id = ?
      `).bind(status, adminNote, orgId, id).run();
    const rows = await db.prepare(`
        SELECT id, org_id, type, source_kind, name, contact, details, extra, review_status, admin_note, created_at, updated_at
        FROM public_inbox
        WHERE org_id = ?
        ORDER BY COALESCE(updated_at, created_at) DESC, created_at DESC
      `).bind(orgId).all();
    return json3({
      ok: true,
      items: (Array.isArray(rows?.results) ? rows.results : []).map(mapInboxItem)
    });
  } catch (err2) {
    return json3(
      { ok: false, error: "INTERNAL", detail: String(err2?.message || err2 || "") },
      500
    );
  }
}
__name(onRequestPut, "onRequestPut");
__name2(onRequestPut, "onRequestPut");
function authOk3(env22, request) {
  if (env22.BF_WRITE_LOCKED === "true") {
    const auth = request.headers.get("authorization") || "";
    return auth.startsWith("Bearer ");
  }
  return true;
}
__name(authOk3, "authOk3");
__name2(authOk3, "authOk");
function cleanLink(value) {
  if (!value || typeof value !== "object") return null;
  const label = String(value.label || value.text || "").trim();
  const url = String(value.url || "").trim();
  if (!label || !url) return null;
  return { label, url };
}
__name(cleanLink, "cleanLink");
__name2(cleanLink, "cleanLink");
function cleanLinks(arr, limit) {
  return Array.isArray(arr) ? arr.map(cleanLink).filter(Boolean).slice(0, limit) : [];
}
__name(cleanLinks, "cleanLinks");
__name2(cleanLinks, "cleanLinks");
function cleanStrings(arr, limit) {
  return Array.isArray(arr) ? arr.map((s) => String(s || "").trim()).filter(Boolean).slice(0, limit) : [];
}
__name(cleanStrings, "cleanStrings");
__name2(cleanStrings, "cleanStrings");
async function onRequestPost9({ env: env22, request, params }) {
  if (!authOk3(env22, request)) {
    return Response.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
  const orgId = params.orgId;
  const body = await request.json().catch(() => ({}));
  const {
    enabled,
    newsletter_enabled,
    pledges_enabled,
    show_action_strip,
    show_needs,
    show_meetings,
    show_what_we_do,
    show_get_involved,
    show_newsletter_card,
    show_website_button,
    title: title22,
    location,
    about,
    accent_color,
    theme_mode,
    website_link,
    meeting_rsvp_url,
    what_we_do,
    primary_actions,
    get_involved_links,
    slug
  } = body || {};
  const prev = await getPublicCfg(env22, orgId);
  let newSlug = prev.slug;
  if (typeof slug === "string" && slug.trim()) {
    const base = slugify(slug);
    if (!base) return Response.json({ ok: false, error: "BAD_SLUG" }, { status: 400 });
    if (prev.slug) {
      const mapped = await env22.BF_PUBLIC.get(`slug:${prev.slug}`);
      if (mapped === orgId) await removeSlugMapping(env22, prev.slug);
    }
    const final = await uniqueSlug(env22, base, orgId);
    await setSlugMapping(env22, final, orgId);
    newSlug = final;
  } else if (!prev.slug) {
    const base = slugify(title22) || slugify(orgId) || "org";
    const final = await uniqueSlug(env22, base, orgId);
    await setSlugMapping(env22, final, orgId);
    newSlug = final;
  }
  const cleaned = {
    enabled: !!enabled,
    newsletter_enabled: !!newsletter_enabled,
    pledges_enabled: pledges_enabled !== false,
    show_action_strip: show_action_strip !== false,
    show_needs: show_needs !== false,
    show_meetings: show_meetings !== false,
    show_what_we_do: show_what_we_do !== false,
    show_get_involved: !!show_get_involved,
    show_newsletter_card: !!show_newsletter_card,
    show_website_button: !!show_website_button,
    slug: newSlug,
    title: String(title22 || "").trim(),
    location: String(location || "").trim(),
    about: String(about || "").trim(),
    accent_color: String(accent_color || "#6d5efc").trim(),
    theme_mode: String(theme_mode || "light").trim() === "dark" ? "dark" : "light",
    website_link: cleanLink(website_link),
    meeting_rsvp_url: String(meeting_rsvp_url || "").trim(),
    what_we_do: cleanStrings(what_we_do, 12),
    primary_actions: cleanLinks(primary_actions, 3),
    get_involved_links: cleanLinks(get_involved_links, 4)
  };
  await setPublicCfg(env22, orgId, cleaned);
  return Response.json({ ok: true, public: cleaned });
}
__name(onRequestPost9, "onRequestPost9");
__name2(onRequestPost9, "onRequestPost");
async function ensureStudioTables(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS studio_docs (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      encrypted_blob TEXT,
      key_version INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`
  ).run();
  await db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_studio_docs_org_updated
     ON studio_docs(org_id, updated_at DESC)`
  ).run();
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS studio_blocks (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      encrypted_blob TEXT,
      key_version INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`
  ).run();
  await db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_studio_blocks_org_updated
     ON studio_blocks(org_id, updated_at DESC)`
  ).run();
}
__name(ensureStudioTables, "ensureStudioTables");
__name2(ensureStudioTables, "ensureStudioTables");
async function getOrgCryptoKeyVersion(db, orgId) {
  try {
    const row = await db.prepare("SELECT key_version FROM org_crypto WHERE org_id = ?").bind(orgId).first();
    return Number(row?.key_version) || 1;
  } catch (e) {
    const msg = String(e?.message || "");
    if (!msg.includes("no such column: key_version")) throw e;
    const row = await db.prepare("SELECT version AS key_version FROM org_crypto WHERE org_id = ?").bind(orgId).first();
    return Number(row?.key_version) || 1;
  }
}
__name(getOrgCryptoKeyVersion, "getOrgCryptoKeyVersion");
__name2(getOrgCryptoKeyVersion, "getOrgCryptoKeyVersion");
async function onRequestGet11({ env: env22, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;
  await ensureStudioTables(env22.BF_DB);
  const docsRes = await env22.BF_DB.prepare(
    `SELECT id, name, encrypted_blob, key_version, created_at, updated_at
     FROM studio_docs
     WHERE org_id = ?
     ORDER BY updated_at DESC`
  ).bind(orgId).all();
  const blocksRes = await env22.BF_DB.prepare(
    `SELECT id, name, encrypted_blob, key_version, created_at, updated_at
     FROM studio_blocks
     WHERE org_id = ?
     ORDER BY updated_at DESC`
  ).bind(orgId).all();
  return json({ ok: true, docs: docsRes.results || [], blocks: blocksRes.results || [] });
}
__name(onRequestGet11, "onRequestGet11");
__name2(onRequestGet11, "onRequestGet");
async function onRequestPost10({ env: env22, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureStudioTables(env22.BF_DB);
  const body = await request.json().catch(() => ({}));
  const docs = Array.isArray(body?.docs) ? body.docs : [];
  const blocks = Array.isArray(body?.blocks) ? body.blocks : [];
  const t = now();
  const keyVersion = await getOrgCryptoKeyVersion(env22.BF_DB, orgId);
  const keepDocIds = docs.map((item) => String(item?.id || "")).filter(Boolean);
  const keepBlockIds = blocks.map((item) => String(item?.id || "")).filter(Boolean);
  for (const item of docs) {
    const id = String(item?.id || "");
    if (!id) continue;
    const exists = await env22.BF_DB.prepare(
      "SELECT id FROM studio_docs WHERE id = ? AND org_id = ?"
    ).bind(id, orgId).first();
    if (exists?.id) {
      await env22.BF_DB.prepare(
        `UPDATE studio_docs
         SET name = ?, encrypted_blob = ?, key_version = ?, updated_at = ?
         WHERE id = ? AND org_id = ?`
      ).bind(
        String(item?.name || "__encrypted__"),
        item?.encrypted_blob ?? null,
        keyVersion,
        t,
        id,
        orgId
      ).run();
    } else {
      await env22.BF_DB.prepare(
        `INSERT INTO studio_docs (id, org_id, name, encrypted_blob, key_version, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?)`
      ).bind(
        id,
        orgId,
        String(item?.name || "__encrypted__"),
        item?.encrypted_blob ?? null,
        keyVersion,
        t,
        t
      ).run();
    }
  }
  for (const item of blocks) {
    const id = String(item?.id || "");
    if (!id) continue;
    const exists = await env22.BF_DB.prepare(
      "SELECT id FROM studio_blocks WHERE id = ? AND org_id = ?"
    ).bind(id, orgId).first();
    if (exists?.id) {
      await env22.BF_DB.prepare(
        `UPDATE studio_blocks
         SET name = ?, encrypted_blob = ?, key_version = ?, updated_at = ?
         WHERE id = ? AND org_id = ?`
      ).bind(
        String(item?.name || "__encrypted__"),
        item?.encrypted_blob ?? null,
        keyVersion,
        t,
        id,
        orgId
      ).run();
    } else {
      await env22.BF_DB.prepare(
        `INSERT INTO studio_blocks (id, org_id, name, encrypted_blob, key_version, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?)`
      ).bind(
        id,
        orgId,
        String(item?.name || "__encrypted__"),
        item?.encrypted_blob ?? null,
        keyVersion,
        t,
        t
      ).run();
    }
  }
  if (keepDocIds.length) {
    const placeholders = keepDocIds.map(() => "?").join(",");
    await env22.BF_DB.prepare(
      `DELETE FROM studio_docs WHERE org_id = ? AND id NOT IN (${placeholders})`
    ).bind(orgId, ...keepDocIds).run();
  } else {
    await env22.BF_DB.prepare("DELETE FROM studio_docs WHERE org_id = ?").bind(orgId).run();
  }
  if (keepBlockIds.length) {
    const placeholders = keepBlockIds.map(() => "?").join(",");
    await env22.BF_DB.prepare(
      `DELETE FROM studio_blocks WHERE org_id = ? AND id NOT IN (${placeholders})`
    ).bind(orgId, ...keepBlockIds).run();
  } else {
    await env22.BF_DB.prepare("DELETE FROM studio_blocks WHERE org_id = ?").bind(orgId).run();
  }
  return json({ ok: true, docs_saved: keepDocIds.length, blocks_saved: keepBlockIds.length });
}
__name(onRequestPost10, "onRequestPost10");
__name2(onRequestPost10, "onRequestPost");
async function latestStudioSig(db, orgId) {
  const docs = await db.prepare(
    `SELECT id, updated_at FROM studio_docs WHERE org_id = ? ORDER BY updated_at DESC, id ASC`
  ).bind(orgId).all();
  const blocks = await db.prepare(
    `SELECT id, updated_at FROM studio_blocks WHERE org_id = ? ORDER BY updated_at DESC, id ASC`
  ).bind(orgId).all();
  const docsSig = (docs.results || []).map((row) => `${row?.id || ""}:${row?.updated_at || 0}`).join("|");
  const blocksSig = (blocks.results || []).map((row) => `${row?.id || ""}:${row?.updated_at || 0}`).join("|");
  return `${docsSig}__${blocksSig}`;
}
__name(latestStudioSig, "latestStudioSig");
__name2(latestStudioSig, "latestStudioSig");
function sse(data, event) {
  const lines = [];
  if (event) lines.push(`event: ${event}`);
  lines.push(`data: ${JSON.stringify(data)}`);
  return `${lines.join("\n")}

`;
}
__name(sse, "sse");
__name2(sse, "sse");
async function onRequestGet12({ env: env22, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const close = /* @__PURE__ */ __name2(() => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
        }
      }, "close");
      let lastSig = "";
      try {
        lastSig = await latestStudioSig(env22.BF_DB, orgId);
        controller.enqueue(encoder.encode(sse({ sig: lastSig }, "ready")));
      } catch {
        controller.enqueue(encoder.encode(sse({ sig: "" }, "ready")));
      }
      const heartbeat = setInterval(async () => {
        if (closed) return;
        try {
          const sig = await latestStudioSig(env22.BF_DB, orgId);
          if (sig !== lastSig) {
            lastSig = sig;
            controller.enqueue(encoder.encode(sse({ sig }, "studio-updated")));
          } else {
            controller.enqueue(encoder.encode(": keepalive\n\n"));
          }
        } catch {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        }
      }, 2e3);
      const abort22 = /* @__PURE__ */ __name2(() => {
        clearInterval(heartbeat);
        close();
      }, "abort");
      request.signal?.addEventListener("abort", abort22, { once: true });
    },
    cancel() {
    }
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive"
    }
  });
}
__name(onRequestGet12, "onRequestGet12");
__name2(onRequestGet12, "onRequestGet");
async function tableInfo(db, table32) {
  const rows = await db.prepare(`PRAGMA table_info(${table32})`).all();
  return rows?.results || [];
}
__name(tableInfo, "tableInfo");
__name2(tableInfo, "tableInfo");
async function ensureZkSchema2(env22) {
  const db = getDb(env22);
  if (!db) throw new Error("NO_DB_BINDING");
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS org_crypto (
      org_id TEXT PRIMARY KEY,
      version INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    )`
  ).run();
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS org_key_wrapped (
      org_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      wrapped_key TEXT NOT NULL,
      PRIMARY KEY (org_id, user_id)
    )`
  ).run();
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS org_key_recovery (
      org_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      recovery_payload TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (org_id, user_id)
    )`
  ).run();
  const cols = await tableInfo(db, "org_key_wrapped");
  const colNames = new Set(cols.map((c) => c.name));
  if (!colNames.has("key_version")) {
    try {
      await db.prepare("ALTER TABLE org_key_wrapped ADD COLUMN key_version INTEGER").run();
    } catch (_) {
    }
  }
  if (!colNames.has("wrapped_at")) {
    try {
      await db.prepare("ALTER TABLE org_key_wrapped ADD COLUMN wrapped_at INTEGER").run();
    } catch (_) {
    }
  }
  try {
    const mCols = await tableInfo(db, "org_memberships");
    const mNames = new Set(mCols.map((c) => c.name));
    if (!mNames.has("encrypted_blob")) {
      try {
        await db.prepare("ALTER TABLE org_memberships ADD COLUMN encrypted_blob TEXT").run();
      } catch (_) {
      }
    }
    if (!mNames.has("key_version")) {
      try {
        await db.prepare("ALTER TABLE org_memberships ADD COLUMN key_version INTEGER").run();
      } catch (_) {
      }
    }
  } catch (_) {
  }
  try {
    const nCols = await tableInfo(db, "newsletter_subscribers");
    const nNames = new Set(nCols.map((c) => c.name));
    if (!nNames.has("encrypted_blob")) {
      try {
        await db.prepare("ALTER TABLE newsletter_subscribers ADD COLUMN encrypted_blob TEXT").run();
      } catch (_) {
      }
    }
    if (!nNames.has("key_version")) {
      try {
        await db.prepare("ALTER TABLE newsletter_subscribers ADD COLUMN key_version INTEGER").run();
      } catch (_) {
      }
    }
  } catch (_) {
  }
  return { db };
}
__name(ensureZkSchema2, "ensureZkSchema2");
__name2(ensureZkSchema2, "ensureZkSchema");
async function getOrgKeyVersion2(db, orgId) {
  const row = await db.prepare("SELECT version FROM org_crypto WHERE org_id = ?").bind(orgId).first();
  return row?.version ? Number(row.version) : null;
}
__name(getOrgKeyVersion2, "getOrgKeyVersion2");
__name2(getOrgKeyVersion2, "getOrgKeyVersion");
async function ensureOrgCryptoRow(db, orgId) {
  const now4 = Date.now();
  await db.prepare(
    "INSERT OR IGNORE INTO org_crypto (org_id, version, created_at) VALUES (?, 1, ?)"
  ).bind(orgId, now4).run();
  const v = await getOrgKeyVersion2(db, orgId);
  return v ?? 1;
}
__name(ensureOrgCryptoRow, "ensureOrgCryptoRow");
__name2(ensureOrgCryptoRow, "ensureOrgCryptoRow");
async function bumpOrgKeyVersion(db, orgId) {
  const now4 = Date.now();
  await db.prepare(
    "INSERT OR IGNORE INTO org_crypto (org_id, version, created_at) VALUES (?, 1, ?)"
  ).bind(orgId, now4).run();
  await db.prepare("UPDATE org_crypto SET version = version + 1 WHERE org_id = ?").bind(orgId).run();
  const v = await getOrgKeyVersion2(db, orgId);
  return v ?? 1;
}
__name(bumpOrgKeyVersion, "bumpOrgKeyVersion");
__name2(bumpOrgKeyVersion, "bumpOrgKeyVersion");
async function orgKeyWrappedCapabilities(db) {
  const cols = await db.prepare("PRAGMA table_info(org_key_wrapped)").all();
  const names = new Set((cols?.results || []).map((c) => c.name));
  return {
    hasKeyVersion: names.has("key_version"),
    hasWrappedAt: names.has("wrapped_at")
  };
}
__name(orgKeyWrappedCapabilities, "orgKeyWrappedCapabilities");
__name2(orgKeyWrappedCapabilities, "orgKeyWrappedCapabilities");
async function getRecoveryTableCaps(db) {
  const info32 = await db.prepare("PRAGMA table_info(org_key_recovery)").all();
  const names = new Set((info32?.results || []).map((c) => c.name));
  return {
    hasRecoveryPayload: names.has("recovery_payload"),
    hasWrappedKey: names.has("wrapped_key"),
    hasSalt: names.has("salt"),
    hasKdf: names.has("kdf"),
    hasUpdatedAt: names.has("updated_at")
  };
}
__name(getRecoveryTableCaps, "getRecoveryTableCaps");
__name2(getRecoveryTableCaps, "getRecoveryTableCaps");
function parseMaybeJSON(v) {
  if (!v) return null;
  if (typeof v !== "string") return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}
__name(parseMaybeJSON, "parseMaybeJSON");
__name2(parseMaybeJSON, "parseMaybeJSON");
function normalizePayload(raw) {
  if (!raw) return null;
  const obj = typeof raw === "string" ? parseMaybeJSON(raw) : raw;
  if (!obj || typeof obj !== "object") return null;
  const p = obj.payload ?? obj;
  if (typeof p.salt === "string" && typeof p.iv === "string" && typeof p.ct === "string") {
    return {
      salt: p.salt,
      iv: p.iv,
      ct: p.ct
    };
  }
  return null;
}
__name(normalizePayload, "normalizePayload");
__name2(normalizePayload, "normalizePayload");
async function onRequestGet13(ctx) {
  try {
    const { env: env22, request, params } = ctx;
    const orgId = String(params.orgId);
    const gate = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
    if (!gate.ok) return gate.resp;
    const userId = String(gate.user.sub);
    const { db } = await ensureZkSchema2(env22);
    const caps = await getRecoveryTableCaps(db);
    let row;
    if (caps.hasRecoveryPayload) {
      row = await db.prepare(
        `SELECT recovery_payload, updated_at
           FROM org_key_recovery
           WHERE org_id = ? AND user_id = ?`
      ).bind(orgId, userId).first();
    } else {
      row = await db.prepare(
        `SELECT wrapped_key, updated_at
           FROM org_key_recovery
           WHERE org_id = ? AND user_id = ?`
      ).bind(orgId, userId).first();
    }
    if (!row) {
      return ok({ has_recovery: false, updated_at: null, payload: null });
    }
    const raw = row.recovery_payload ?? row.wrapped_key ?? null;
    const payload = normalizePayload(raw);
    if (!payload) {
      return ok({ has_recovery: false, updated_at: null, payload: null });
    }
    return ok({
      has_recovery: true,
      updated_at: row.updated_at ?? null,
      payload
    });
  } catch (e) {
    return bad(500, e?.message || String(e));
  }
}
__name(onRequestGet13, "onRequestGet13");
__name2(onRequestGet13, "onRequestGet");
async function onRequestPost11(ctx) {
  try {
    const { env: env22, request, params } = ctx;
    const orgId = String(params.orgId);
    const gate = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
    if (!gate.ok) return gate.resp;
    const userId = String(gate.user.sub);
    const { db } = await ensureZkSchema2(env22);
    const caps = await getRecoveryTableCaps(db);
    const body = await readJSON(request);
    const payload = normalizePayload(body?.payload ?? body);
    if (!payload) {
      return bad(400, "INVALID_RECOVERY_PAYLOAD");
    }
    const payloadText = JSON.stringify(payload);
    const now4 = Date.now();
    if (caps.hasRecoveryPayload) {
      await db.prepare(
        `INSERT INTO org_key_recovery (org_id, user_id, recovery_payload, updated_at)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(org_id, user_id) DO UPDATE SET
             recovery_payload = excluded.recovery_payload,
             updated_at = excluded.updated_at`
      ).bind(orgId, userId, payloadText, now4).run();
    } else {
      await db.prepare(
        `INSERT INTO org_key_recovery (org_id, user_id, wrapped_key, salt, kdf, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(org_id, user_id) DO UPDATE SET
              wrapped_key = excluded.wrapped_key,
              salt = excluded.salt,
              kdf = excluded.kdf,
              updated_at = excluded.updated_at`
      ).bind(
        orgId,
        userId,
        payloadText,
        "",
        // satisfy NOT NULL salt
        "",
        // satisfy NOT NULL kdf
        now4
      ).run();
    }
    return ok({ has_recovery: true, updated_at: now4, payload });
  } catch (e) {
    return bad(500, e?.message || String(e));
  }
}
__name(onRequestPost11, "onRequestPost11");
__name2(onRequestPost11, "onRequestPost");
async function onRequestDelete6(ctx) {
  try {
    const { env: env22, request, params } = ctx;
    const orgId = String(params.orgId);
    const gate = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
    if (!gate.ok) return gate.resp;
    const userId = String(gate.user.sub);
    const { db } = await ensureZkSchema2(env22);
    await db.prepare(
      `DELETE FROM org_key_recovery WHERE org_id = ? AND user_id = ?`
    ).bind(orgId, userId).run();
    return ok({ has_recovery: false, updated_at: null, payload: null });
  } catch (e) {
    return bad(500, e?.message || String(e));
  }
}
__name(onRequestDelete6, "onRequestDelete6");
__name2(onRequestDelete6, "onRequestDelete");
async function onRequestPost12({ env: env22, request, params }) {
  try {
    const orgId = String(params.orgId);
    const gate = await requireOrgRole({ env: env22, request, orgId, minRole: "owner" });
    if (!gate.ok) return gate.resp;
    const { db } = await ensureZkSchema2(env22);
    const caps = await orgKeyWrappedCapabilities(db);
    const newVersion = await bumpOrgKeyVersion(db, orgId);
    const body = await readJSON(request);
    const wraps = Array.isArray(body?.wraps) ? body.wraps : null;
    const now4 = Date.now();
    if (wraps?.length) {
      for (const w of wraps) {
        const userId = String(w?.user_id || "");
        const wrappedKey = w?.wrapped_key;
        if (!userId || !wrappedKey) continue;
        if (caps.hasKeyVersion && caps.hasWrappedAt) {
          await db.prepare(
            "INSERT OR REPLACE INTO org_key_wrapped (org_id, user_id, key_version, wrapped_key, wrapped_at) VALUES (?, ?, ?, ?, ?)"
          ).bind(orgId, userId, newVersion, String(wrappedKey), now4).run();
        } else if (caps.hasKeyVersion) {
          await db.prepare(
            "INSERT OR REPLACE INTO org_key_wrapped (org_id, user_id, key_version, wrapped_key) VALUES (?, ?, ?, ?)"
          ).bind(orgId, userId, newVersion, String(wrappedKey)).run();
        } else {
          await db.prepare(
            "INSERT OR REPLACE INTO org_key_wrapped (org_id, user_id, wrapped_key) VALUES (?, ?, ?)"
          ).bind(orgId, userId, String(wrappedKey)).run();
        }
      }
    }
    return ok({
      org_id: orgId,
      key_version: caps.hasKeyVersion ? newVersion : 1,
      compat: { no_key_version_column: !caps.hasKeyVersion }
    });
  } catch (e) {
    return bad(500, "INTERNAL", { detail: e?.message || String(e) });
  }
}
__name(onRequestPost12, "onRequestPost12");
__name2(onRequestPost12, "onRequestPost");
async function onRequestGet14({ env: env22, request, params }) {
  try {
    const orgId = String(params.orgId);
    const gate = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
    if (!gate.ok) return gate.resp;
    const { db } = await ensureZkSchema2(env22);
    const version22 = await ensureOrgCryptoRow(db, orgId);
    const caps = await orgKeyWrappedCapabilities(db);
    const anyWrap = await db.prepare(
      "SELECT 1 as ok FROM org_key_wrapped WHERE org_id = ? LIMIT 1"
    ).bind(orgId).first();
    return ok({
      org_id: orgId,
      enabled: !!anyWrap,
      key_version: version22,
      compat: { no_key_version_column: !caps.hasKeyVersion }
    });
  } catch (e) {
    return bad(500, "INTERNAL", { detail: e?.message || String(e) });
  }
}
__name(onRequestGet14, "onRequestGet14");
__name2(onRequestGet14, "onRequestGet");
function extractKidFromWrappedKey(wrappedKeyStr) {
  try {
    const w = JSON.parse(String(wrappedKeyStr || ""));
    return String(w?.recipient_kid || w?.kid || "");
  } catch {
    return "";
  }
}
__name(extractKidFromWrappedKey, "extractKidFromWrappedKey");
__name2(extractKidFromWrappedKey, "extractKidFromWrappedKey");
function normalizeWraps(body, fallbackUserId) {
  if (Array.isArray(body?.wraps)) {
    return body.wraps.map((w) => ({ user_id: String(w?.user_id || ""), wrapped_key: w?.wrapped_key })).filter((w) => w.user_id && w.wrapped_key);
  }
  const uid = String(body?.user_id || fallbackUserId || "");
  const wk = body?.wrapped_key;
  if (!uid || !wk) return [];
  return [{ user_id: uid, wrapped_key: wk }];
}
__name(normalizeWraps, "normalizeWraps");
__name2(normalizeWraps, "normalizeWraps");
async function onRequestPost13({ env: env22, request, params }) {
  try {
    const orgId = String(params.orgId);
    const gate = await requireOrgRole({ env: env22, request, orgId, minRole: "admin" });
    if (!gate.ok) return gate.resp;
    const body = await readJSON(request);
    const { db } = await ensureZkSchema2(env22);
    const caps = await orgKeyWrappedCapabilities(db);
    const version22 = await ensureOrgCryptoRow(db, orgId);
    const keyVersion = Number(body?.key_version || version22 || 1);
    const wraps = normalizeWraps(body, gate.user.sub);
    if (!wraps.length) return bad(400, "MISSING_WRAPS");
    const now4 = Date.now();
    let stored = 0;
    for (const w of wraps) {
      const kid = caps.hasKid ? extractKidFromWrappedKey(w.wrapped_key) || null : null;
      if (caps.hasKeyVersion && caps.hasWrappedAt && caps.hasKid) {
        await db.prepare(
          "INSERT OR REPLACE INTO org_key_wrapped (org_id, user_id, key_version, wrapped_key, wrapped_at, kid) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(orgId, w.user_id, keyVersion, String(w.wrapped_key), now4, kid).run();
      } else if (caps.hasKeyVersion && caps.hasWrappedAt) {
        await db.prepare(
          "INSERT OR REPLACE INTO org_key_wrapped (org_id, user_id, key_version, wrapped_key, wrapped_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(orgId, w.user_id, keyVersion, String(w.wrapped_key), now4).run();
      } else if (caps.hasKeyVersion && caps.hasKid) {
        await db.prepare(
          "INSERT OR REPLACE INTO org_key_wrapped (org_id, user_id, key_version, wrapped_key, kid) VALUES (?, ?, ?, ?, ?)"
        ).bind(orgId, w.user_id, keyVersion, String(w.wrapped_key), kid).run();
      } else if (caps.hasKeyVersion) {
        await db.prepare(
          "INSERT OR REPLACE INTO org_key_wrapped (org_id, user_id, key_version, wrapped_key) VALUES (?, ?, ?, ?)"
        ).bind(orgId, w.user_id, keyVersion, String(w.wrapped_key)).run();
      } else if (caps.hasKid) {
        await db.prepare(
          "INSERT OR REPLACE INTO org_key_wrapped (org_id, user_id, wrapped_key, kid) VALUES (?, ?, ?, ?)"
        ).bind(orgId, w.user_id, String(w.wrapped_key), kid).run();
      } else {
        await db.prepare(
          "INSERT OR REPLACE INTO org_key_wrapped (org_id, user_id, wrapped_key) VALUES (?, ?, ?)"
        ).bind(orgId, w.user_id, String(w.wrapped_key)).run();
      }
      stored++;
    }
    return ok({
      org_id: orgId,
      stored,
      key_version: caps.hasKeyVersion ? keyVersion : 1,
      compat: { no_key_version_column: !caps.hasKeyVersion }
    });
  } catch (e) {
    return bad(500, "INTERNAL", { detail: e?.message || String(e) });
  }
}
__name(onRequestPost13, "onRequestPost13");
__name2(onRequestPost13, "onRequestPost");
async function onRequestGet15({ env: env22, request, params }) {
  try {
    const orgId = String(params.orgId);
    const gate = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
    if (!gate.ok) return gate.resp;
    const { db } = await ensureZkSchema2(env22);
    const version22 = await ensureOrgCryptoRow(db, orgId);
    const caps = await orgKeyWrappedCapabilities(db);
    let row;
    if (caps.hasKeyVersion) {
      row = await db.prepare(
        "SELECT wrapped_key, key_version FROM org_key_wrapped WHERE org_id = ? AND user_id = ? ORDER BY key_version DESC LIMIT 1"
      ).bind(orgId, String(gate.user.sub)).first();
    } else {
      row = await db.prepare(
        "SELECT wrapped_key FROM org_key_wrapped WHERE org_id = ? AND user_id = ?"
      ).bind(orgId, String(gate.user.sub)).first();
    }
    return ok({
      org_id: orgId,
      key_version: row?.key_version ? Number(row.key_version) : version22,
      wrapped_key: row?.wrapped_key || null,
      compat: { no_key_version_column: !caps.hasKeyVersion }
    });
  } catch (e) {
    return bad(500, "INTERNAL", { detail: e?.message || String(e) });
  }
}
__name(onRequestGet15, "onRequestGet15");
__name2(onRequestGet15, "onRequestGet");
async function onRequest2(context22) {
  const { request, env: env22, params } = context22;
  const db = getDB(env22);
  if (!db) return bad2("DB_NOT_CONFIGURED", 500);
  const orgId = String(params.orgId || "");
  if (request.method !== "POST") return bad2("METHOD_NOT_ALLOWED", 405);
  const body = await readJson(request);
  if (!body) return bad2("BAD_JSON", 400);
  const email = normalizeEmail(body.email);
  const name = String(body.name || "").trim();
  if (!email || !email.includes("@")) return bad2("INVALID_EMAIL", 400);
  const now4 = Date.now();
  const id = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO newsletter_subscribers (id, org_id, email, name, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(org_id, email) DO UPDATE SET
         name = CASE
           WHEN excluded.name IS NOT NULL AND excluded.name != ''
           THEN excluded.name
           ELSE newsletter_subscribers.name
         END`
  ).bind(id, orgId, email, name, now4).run();
  return json2({ ok: true });
}
__name(onRequest2, "onRequest2");
__name2(onRequest2, "onRequest");
async function onRequestPost14(context22) {
  const slug = context22?.params?.slug ? String(context22.params.slug) : "";
  if (!slug) return bad(400, "Missing slug");
  const orgId = await getOrgIdBySlug(context22.env, slug);
  if (!orgId) return bad(404, "Not found");
  const ctx2 = { ...context22, params: { ...context22.params || {}, orgId } };
  return onRequest2(ctx2);
}
__name(onRequestPost14, "onRequestPost14");
__name2(onRequestPost14, "onRequestPost");
async function ensureMeetingsPublicColumn(db) {
  try {
    await db.prepare("ALTER TABLE meetings ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0").run();
  } catch {
  }
}
__name(ensureMeetingsPublicColumn, "ensureMeetingsPublicColumn");
__name2(ensureMeetingsPublicColumn, "ensureMeetingsPublicColumn");
async function ensurePublicMeetingRsvpsTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS public_meeting_rsvps (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    meeting_id TEXT NOT NULL,
    name TEXT,
    contact TEXT,
    status TEXT NOT NULL,
    note TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_public_meeting_rsvps_lookup ON public_meeting_rsvps(org_id, meeting_id, created_at DESC)`).run();
}
__name(ensurePublicMeetingRsvpsTable, "ensurePublicMeetingRsvpsTable");
__name2(ensurePublicMeetingRsvpsTable, "ensurePublicMeetingRsvpsTable");
async function getRsvpCounts(db, orgId, meetingId) {
  const [memberRows, publicRows] = await Promise.all([
    db.prepare(`SELECT status, COUNT(*) AS c
      FROM meeting_rsvps
      WHERE org_id = ? AND meeting_id = ?
      GROUP BY status`).bind(orgId, meetingId).all().catch(() => ({ results: [] })),
    db.prepare(`SELECT status, COUNT(*) AS c
      FROM public_meeting_rsvps
      WHERE org_id = ? AND meeting_id = ?
      GROUP BY status`).bind(orgId, meetingId).all().catch(() => ({ results: [] }))
  ]);
  const blank = { yes: 0, maybe: 0, no: 0, total: 0 };
  const member = { ...blank };
  const pub = { ...blank };
  for (const row of memberRows?.results || []) {
    const status = String(row?.status || "").toLowerCase();
    const count32 = Number(row?.c || 0);
    if (status === "yes" || status === "maybe" || status === "no") member[status] += count32;
  }
  for (const row of publicRows?.results || []) {
    const status = String(row?.status || "").toLowerCase();
    const count32 = Number(row?.c || 0);
    if (status === "yes" || status === "maybe" || status === "no") pub[status] += count32;
  }
  member.total = member.yes + member.maybe + member.no;
  pub.total = pub.yes + pub.maybe + pub.no;
  return {
    member,
    public: pub,
    combined: {
      yes: member.yes + pub.yes,
      maybe: member.maybe + pub.maybe,
      no: member.no + pub.no,
      total: member.total + pub.total
    }
  };
}
__name(getRsvpCounts, "getRsvpCounts");
__name2(getRsvpCounts, "getRsvpCounts");
async function onRequestGet16({ env: env22, request, params }) {
  const orgId = params.orgId;
  const meetingId = params.meetingId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "viewer" });
  if (!a.ok) return a.resp;
  await ensureMeetingsPublicColumn(env22.BF_DB);
  await ensurePublicMeetingRsvpsTable(env22.BF_DB);
  const row = await env22.BF_DB.prepare(
    `SELECT id, title, starts_at, ends_at, location, agenda, notes, is_public, created_at, updated_at
     FROM meetings
     WHERE id = ? AND org_id = ?`
  ).bind(meetingId, orgId).first();
  if (!row) return bad(404, "NOT_FOUND");
  const rsvp_counts = await getRsvpCounts(env22.BF_DB, orgId, meetingId);
  return json({ ok: true, meeting: { ...row, rsvp_counts } });
}
__name(onRequestGet16, "onRequestGet16");
__name2(onRequestGet16, "onRequestGet");
async function onRequestPut2({ env: env22, request, params }) {
  const orgId = params.orgId;
  const meetingId = params.meetingId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  await ensureMeetingsPublicColumn(env22.BF_DB);
  const body = await request.json().catch(() => ({}));
  await env22.BF_DB.prepare(
    `UPDATE meetings
     SET title = COALESCE(?, title),
         starts_at = COALESCE(?, starts_at),
         ends_at = COALESCE(?, ends_at),
         location = COALESCE(?, location),
         agenda = COALESCE(?, agenda),
         notes = COALESCE(?, notes),
         is_public = COALESCE(?, is_public),
         updated_at = ?
     WHERE id = ? AND org_id = ?`
  ).bind(
    body.title ?? null,
    body.starts_at ?? null,
    body.ends_at ?? null,
    body.location ?? null,
    body.agenda ?? null,
    body.notes ?? null,
    body.is_public === void 0 ? null : body.is_public ? 1 : 0,
    now(),
    meetingId,
    orgId
  ).run();
  return json({ ok: true });
}
__name(onRequestPut2, "onRequestPut2");
__name2(onRequestPut2, "onRequestPut");
async function onRequestDelete7({ env: env22, request, params }) {
  const orgId = params.orgId;
  const meetingId = params.meetingId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "admin" });
  if (!a.ok) return a.resp;
  await env22.BF_DB.prepare("DELETE FROM meetings WHERE id = ? AND org_id = ?").bind(meetingId, orgId).run();
  return json({ ok: true });
}
__name(onRequestDelete7, "onRequestDelete7");
__name2(onRequestDelete7, "onRequestDelete");
var te = new TextEncoder();
var td = new TextDecoder();
var B32_ALPH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function randomBase32(byteLen = 20) {
  const bytes = new Uint8Array(byteLen);
  crypto.getRandomValues(bytes);
  return bytesToBase32(bytes);
}
__name(randomBase32, "randomBase32");
__name2(randomBase32, "randomBase32");
function bytesToBase32(bytes) {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const b of bytes) {
    value = value << 8 | b;
    bits += 8;
    while (bits >= 5) {
      out += B32_ALPH[value >>> bits - 5 & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32_ALPH[value << 5 - bits & 31];
  return out;
}
__name(bytesToBase32, "bytesToBase32");
__name2(bytesToBase32, "bytesToBase32");
function base32ToBytes(b32) {
  const clean3 = String(b32 || "").toUpperCase().replace(/=+$/g, "").replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const out = [];
  for (const ch of clean3) {
    const idx = B32_ALPH.indexOf(ch);
    if (idx < 0) continue;
    value = value << 5 | idx;
    bits += 5;
    if (bits >= 8) {
      out.push(value >>> bits - 8 & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}
__name(base32ToBytes, "base32ToBytes");
__name2(base32ToBytes, "base32ToBytes");
async function sha256Hex(input) {
  const buf = await crypto.subtle.digest("SHA-256", te.encode(String(input)));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex, "sha256Hex");
__name2(sha256Hex, "sha256Hex");
async function importAesKeyFromString(secret) {
  const digest = await crypto.subtle.digest("SHA-256", te.encode(String(secret || "")));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}
__name(importAesKeyFromString, "importAesKeyFromString");
__name2(importAesKeyFromString, "importAesKeyFromString");
async function aesGcmEncrypt(plaintext, secretString) {
  const key = await importAesKeyFromString(secretString);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, te.encode(String(plaintext)));
  const b64 = /* @__PURE__ */ __name2((u8) => btoa(String.fromCharCode(...u8)), "b64");
  return {
    v: 1,
    iv: b64(iv),
    ct: b64(new Uint8Array(ct))
  };
}
__name(aesGcmEncrypt, "aesGcmEncrypt");
__name2(aesGcmEncrypt, "aesGcmEncrypt");
async function aesGcmDecrypt(encObj, secretString) {
  const key = await importAesKeyFromString(secretString);
  const fromB642 = /* @__PURE__ */ __name2((s) => new Uint8Array(atob(String(s)).split("").map((c) => c.charCodeAt(0))), "fromB64");
  const iv = fromB642(encObj?.iv);
  const ct = fromB642(encObj?.ct);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return td.decode(pt);
}
__name(aesGcmDecrypt, "aesGcmDecrypt");
__name2(aesGcmDecrypt, "aesGcmDecrypt");
async function hmacSha1(keyBytes, msgBytes) {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, msgBytes);
  return new Uint8Array(sig);
}
__name(hmacSha1, "hmacSha1");
__name2(hmacSha1, "hmacSha1");
function counterBytes(counter) {
  const buf = new Uint8Array(8);
  let x = BigInt(counter);
  for (let i = 7; i >= 0; i--) {
    buf[i] = Number(x & 0xffn);
    x >>= 8n;
  }
  return buf;
}
__name(counterBytes, "counterBytes");
__name2(counterBytes, "counterBytes");
async function totpAt(secretB32, counter, digits = 6) {
  const keyBytes = base32ToBytes(secretB32);
  const msg = counterBytes(counter);
  const h = await hmacSha1(keyBytes, msg);
  const offset = h[h.length - 1] & 15;
  const bin = (h[offset] & 127) << 24 | h[offset + 1] << 16 | h[offset + 2] << 8 | h[offset + 3];
  const mod = 10 ** digits;
  const code = (bin % mod).toString().padStart(digits, "0");
  return code;
}
__name(totpAt, "totpAt");
__name2(totpAt, "totpAt");
async function totpVerify(secretB32, code, opts = {}) {
  const digits = opts.digits ?? 6;
  const step = opts.step ?? 30;
  const window = opts.window ?? 1;
  const cleanCode = String(code || "").replace(/\s+/g, "");
  if (!/^[0-9]{6,8}$/.test(cleanCode)) return false;
  const now4 = Math.floor(Date.now() / 1e3);
  const counter = Math.floor(now4 / step);
  for (let w = -window; w <= window; w++) {
    const expected = await totpAt(secretB32, counter + w, digits);
    if (timingSafeEqual(expected, cleanCode)) return true;
  }
  return false;
}
__name(totpVerify, "totpVerify");
__name2(totpVerify, "totpVerify");
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
__name(timingSafeEqual, "timingSafeEqual");
__name2(timingSafeEqual, "timingSafeEqual");
async function rateLimit({ env: env22, key, limit = 10, windowSec = 600 } = {}) {
  const now4 = Date.now();
  const resetAt = now4 + windowSec * 1e3;
  if (!env22?.BF_DB || !key) {
    return { ok: true, remaining: limit, reset_at: resetAt, noop: true };
  }
  try {
    const row = await env22.BF_DB.prepare(
      "SELECT count, reset_at FROM rate_limits WHERE key = ?"
    ).bind(key).first();
    if (!row) {
      await env22.BF_DB.prepare(
        "INSERT INTO rate_limits (key, count, reset_at) VALUES (?, ?, ?)"
      ).bind(key, 1, resetAt).run();
      return { ok: true, remaining: Math.max(0, limit - 1), reset_at: resetAt };
    }
    const rowReset = Number(row.reset_at) || 0;
    const rowCount = Number(row.count) || 0;
    if (rowReset <= now4) {
      await env22.BF_DB.prepare(
        "UPDATE rate_limits SET count = ?, reset_at = ? WHERE key = ?"
      ).bind(1, resetAt, key).run();
      return { ok: true, remaining: Math.max(0, limit - 1), reset_at: resetAt };
    }
    const nextCount = rowCount + 1;
    if (nextCount > limit) {
      const retryAfter = Math.max(1, Math.ceil((rowReset - now4) / 1e3));
      return { ok: false, remaining: 0, reset_at: rowReset, retry_after: retryAfter };
    }
    await env22.BF_DB.prepare(
      "UPDATE rate_limits SET count = ? WHERE key = ?"
    ).bind(nextCount, key).run();
    return {
      ok: true,
      remaining: Math.max(0, limit - nextCount),
      reset_at: rowReset
    };
  } catch (e) {
    return { ok: true, remaining: limit, reset_at: resetAt, noop: true };
  }
}
__name(rateLimit, "rateLimit");
__name2(rateLimit, "rateLimit");
async function sha256Hex2(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(str)));
  const b = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < b.length; i++) out += b[i].toString(16).padStart(2, "0");
  return out;
}
__name(sha256Hex2, "sha256Hex2");
__name2(sha256Hex2, "sha256Hex");
function randomToken(bytes = 32) {
  const b = new Uint8Array(bytes);
  crypto.getRandomValues(b);
  let s = "";
  for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, "0");
  return s;
}
__name(randomToken, "randomToken");
__name2(randomToken, "randomToken");
function cookieHeadersForAuth({ accessToken, refreshToken, isProd }) {
  const secure = !!isProd;
  const sameSite = "Lax";
  const headers = [];
  headers.push(cookieString("bf_at", accessToken, {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: 60 * 15
    // 15 min
  }));
  headers.push(cookieString("bf_rt", refreshToken, {
    httpOnly: true,
    secure,
    sameSite,
    path: "/api/auth",
    maxAge: 60 * 60 * 24 * 30
    // 30 days
  }));
  const csrf = randomToken(16);
  headers.push(cookieString("bf_csrf", csrf, {
    httpOnly: false,
    secure,
    sameSite,
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  }));
  return headers;
}
__name(cookieHeadersForAuth, "cookieHeadersForAuth");
__name2(cookieHeadersForAuth, "cookieHeadersForAuth");
function clearAuthCookieHeaders({ isProd }) {
  const secure = !!isProd;
  const sameSite = "Lax";
  const headers = [];
  headers.push(cookieString("bf_at", "", {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: 0
  }));
  headers.push(cookieString("bf_rt", "", {
    httpOnly: true,
    secure,
    sameSite,
    path: "/api/auth",
    maxAge: 0
  }));
  headers.push(cookieString("bf_csrf", "", {
    httpOnly: false,
    secure,
    sameSite,
    path: "/",
    maxAge: 0
  }));
  return headers;
}
__name(clearAuthCookieHeaders, "clearAuthCookieHeaders");
__name2(clearAuthCookieHeaders, "clearAuthCookieHeaders");
async function issueAccessToken(env22, user, ttlSec = 60 * 15) {
  return signJwt(env22.JWT_SECRET, { sub: user.id, email: user.email, name: user.name }, ttlSec);
}
__name(issueAccessToken, "issueAccessToken");
__name2(issueAccessToken, "issueAccessToken");
function normalizeRecovery(code) {
  return String(code || "").trim().toUpperCase();
}
__name(normalizeRecovery, "normalizeRecovery");
__name2(normalizeRecovery, "normalizeRecovery");
async function hashRecovery(code, pepper) {
  return sha256Hex(`${code}|${pepper}`);
}
__name(hashRecovery, "hashRecovery");
__name2(hashRecovery, "hashRecovery");
async function onRequestPost15({ env: env22, request }) {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "";
  const body = await request.json().catch(() => ({}));
  const challengeId = String(body.challenge_id || "").trim();
  const code = String(body.code || body.totp || "").trim();
  const recoveryCode = normalizeRecovery(body.recovery_code || body.recovery || "");
  if (!challengeId) return bad(400, "MISSING_CHALLENGE");
  const rl = await rateLimit({ env: env22, key: `mfa:${ip}:${challengeId}`, limit: 12, windowSec: 600 });
  if (!rl.ok) return bad(429, "RATE_LIMIT", { retry_after: rl.retry_after });
  const ch = await env22.BF_DB.prepare("SELECT id, user_id, expires_at, verified FROM login_mfa_challenges WHERE id = ?").bind(challengeId).first();
  if (!ch) return bad(401, "INVALID_CHALLENGE");
  if (Number(ch.verified) === 1) return bad(401, "CHALLENGE_USED");
  if (Number(ch.expires_at) < Date.now()) return bad(401, "CHALLENGE_EXPIRED");
  const mfa = await env22.BF_DB.prepare("SELECT totp_secret_encrypted, mfa_enabled FROM user_mfa WHERE user_id = ?").bind(ch.user_id).first();
  if (!mfa || Number(mfa.mfa_enabled) !== 1) return bad(401, "MFA_NOT_ENABLED");
  let ok2 = false;
  if (recoveryCode) {
    const pepper = env22.RECOVERY_PEPPER || env22.JWT_SECRET || "pepper";
    const h = await hashRecovery(recoveryCode, pepper);
    const row = await env22.BF_DB.prepare("SELECT id, used FROM user_mfa_recovery_codes WHERE user_id = ? AND code_hash = ?").bind(ch.user_id, h).first();
    if (row && Number(row.used) === 0) {
      await env22.BF_DB.prepare("UPDATE user_mfa_recovery_codes SET used = 1 WHERE id = ?").bind(row.id).run();
      ok2 = true;
    }
  }
  if (!ok2) {
    if (!code) return bad(400, "MISSING_CODE");
    const encKey = env22.MFA_ENC_KEY || env22.JWT_SECRET;
    if (!encKey) return bad(500, "MFA_KEY_MISSING");
    let encObj = null;
    try {
      encObj = typeof mfa.totp_secret_encrypted === "string" ? JSON.parse(mfa.totp_secret_encrypted) : mfa.totp_secret_encrypted;
    } catch {
      return bad(400, "MFA_SECRET_CORRUPT");
    }
    let secret;
    try {
      secret = await aesGcmDecrypt(encObj, encKey);
    } catch (e) {
      console.error("auth/login/mfa decrypt failed", e);
      return bad(400, "MFA_SECRET_DECRYPT_FAILED");
    }
    ok2 = await totpVerify(secret, code, { window: 1, step: 30, digits: 6 });
  }
  if (!ok2) return bad(401, "INVALID_MFA");
  await env22.BF_DB.prepare("UPDATE login_mfa_challenges SET verified = 1 WHERE id = ?").bind(challengeId).run();
  const user = await env22.BF_DB.prepare("SELECT id, email, name FROM users WHERE id = ?").bind(ch.user_id).first();
  if (!user) return bad(401, "INVALID_LOGIN");
  const accessToken = await issueAccessToken(env22, user, 60 * 15);
  const refreshToken = randomToken(32);
  const refreshHash = await sha256Hex(refreshToken);
  const expiresAt = Date.now() + 1e3 * 60 * 60 * 24 * 30;
  await env22.BF_DB.prepare(
    "INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)"
  ).bind(crypto.randomUUID(), user.id, refreshHash, expiresAt).run();
  const isProd = (env22?.ENV || env22?.NODE_ENV || "").toLowerCase() === "production";
  const setCookies = cookieHeadersForAuth({ accessToken, refreshToken, isProd });
  const resp = json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  for (const c of setCookies) resp.headers.append("set-cookie", c);
  return resp;
}
__name(onRequestPost15, "onRequestPost15");
__name2(onRequestPost15, "onRequestPost");
async function onRequestPost16({ request, env: env22 }) {
  try {
    const u = await requireUser({ env: env22, request });
    if (!u.ok) return u.resp;
    const db = getDb(env22);
    if (!db) return bad(500, "DB_NOT_CONFIGURED");
    const body = await readJSON(request);
    const codeRaw = (body?.code ?? "").toString();
    const code = codeRaw.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(code)) return bad(400, "INVALID_MFA_CODE");
    const userId = u.user?.sub || u.user?.id;
    if (!userId) return bad(500, "USER_ID_MISSING");
    const row = await db.prepare("SELECT totp_secret_encrypted, mfa_enabled FROM user_mfa WHERE user_id = ?").bind(userId).first();
    if (!row || !row.mfa_enabled) return bad(400, "MFA_NOT_ENABLED");
    let enc = row.totp_secret_encrypted;
    if (!enc) return bad(400, "MFA_SECRET_MISSING");
    if (typeof enc === "string") {
      try {
        enc = JSON.parse(enc);
      } catch {
        return bad(400, "MFA_SECRET_CORRUPT");
      }
    }
    const encKey = env22.MFA_ENC_KEY || env22.JWT_SECRET;
    if (!encKey) return bad(500, "MFA_KEY_MISSING");
    let secretB32;
    try {
      secretB32 = await aesGcmDecrypt(enc, encKey);
    } catch (e) {
      return bad(400, "MFA_SECRET_DECRYPT_FAILED");
    }
    const valid = await totpVerify(secretB32, code, { window: 1 });
    if (!valid) return bad(400, "INVALID_MFA_CODE");
    await db.prepare("UPDATE user_mfa SET mfa_enabled = 0, totp_secret_encrypted = NULL WHERE user_id = ?").bind(userId).run();
    await db.prepare("DELETE FROM user_mfa_recovery_codes WHERE user_id = ?").bind(userId).run();
    await db.prepare("DELETE FROM login_mfa_challenges WHERE user_id = ?").bind(userId).run();
    return ok({ mfa_enabled: false });
  } catch (e) {
    return bad(500, "MFA_DISABLE_FAILED", { message: e?.message || String(e) });
  }
}
__name(onRequestPost16, "onRequestPost16");
__name2(onRequestPost16, "onRequestPost");
async function onRequestGet17({ env: env22, request }) {
  const u = await requireUser({ env: env22, request });
  if (!u.ok) return u.resp;
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!key) return bad(400, "MISSING_KEY");
  const v = await env22.BF_E2EE.get(`u:${u.user.sub}:${key}`);
  return json({ ok: true, value: v ? JSON.parse(v) : null });
}
__name(onRequestGet17, "onRequestGet17");
__name2(onRequestGet17, "onRequestGet");
async function onRequestPost17({ env: env22, request }) {
  const u = await requireUser({ env: env22, request });
  if (!u.ok) return u.resp;
  const body = await request.json().catch(() => ({}));
  const key = String(body.key || "");
  if (!key) return bad(400, "MISSING_KEY");
  await env22.BF_E2EE.put(`u:${u.user.sub}:${key}`, JSON.stringify(body.value ?? null));
  return json({ ok: true });
}
__name(onRequestPost17, "onRequestPost17");
__name2(onRequestPost17, "onRequestPost");
function makeRecoveryCode() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`.toUpperCase();
}
__name(makeRecoveryCode, "makeRecoveryCode");
__name2(makeRecoveryCode, "makeRecoveryCode");
async function hashRecovery2(code, pepper) {
  return sha256Hex(`${code}|${pepper}`);
}
__name(hashRecovery2, "hashRecovery2");
__name2(hashRecovery2, "hashRecovery");
async function onRequest3(context22) {
  const { request, env: env22 } = context22;
  const m = requireMethod(request, "POST");
  if (m) return m;
  try {
    const u = await requireUser({ env: env22, request });
    if (!u.ok) return u.resp;
    const db = getDb(env22);
    if (!db) return err(500, "NO_DB_BINDING");
    const body = await readJSON(request);
    const code = String(body.code || body.totp || "").trim();
    if (!code) return err(400, "MFA_CODE_REQUIRED");
    const row = await db.prepare("SELECT totp_secret_encrypted, mfa_enabled FROM user_mfa WHERE user_id = ?").bind(u.user.sub).first();
    if (!row?.totp_secret_encrypted) return err(400, "MFA_NOT_SETUP");
    const encKey = env22.MFA_ENC_KEY || env22.JWT_SECRET;
    if (!encKey) return err(500, "MFA_KEY_MISSING");
    let encObj = null;
    try {
      encObj = typeof row.totp_secret_encrypted === "string" ? JSON.parse(row.totp_secret_encrypted) : row.totp_secret_encrypted;
    } catch {
      return err(400, "MFA_SECRET_CORRUPT");
    }
    let secret;
    try {
      secret = await aesGcmDecrypt(encObj, encKey);
    } catch (e) {
      console.error("mfa/confirm decrypt failed", e);
      return err(400, "MFA_SECRET_DECRYPT_FAILED");
    }
    const okTotp = await totpVerify(secret, code, { window: 1 });
    if (!okTotp) return err(400, "INVALID_MFA_CODE");
    const ts = now();
    const pepper = env22.RECOVERY_PEPPER || env22.JWT_SECRET || "pepper";
    await db.prepare("DELETE FROM user_mfa_recovery_codes WHERE user_id = ?").bind(u.user.sub).run();
    const recovery = [];
    for (let i = 0; i < 10; i++) {
      const rc = makeRecoveryCode();
      recovery.push(rc);
      const code_hash = await hashRecovery2(rc, pepper);
      await db.prepare(
        "INSERT INTO user_mfa_recovery_codes (id, user_id, code_hash, used, created_at) VALUES (?, ?, ?, 0, ?)"
      ).bind(uuid(), u.user.sub, code_hash, ts).run();
    }
    await db.prepare(
      "UPDATE user_mfa SET mfa_enabled = 1 WHERE user_id = ?"
    ).bind(u.user.sub).run();
    return ok({ enabled: true, recovery_codes: recovery });
  } catch (e) {
    console.error("mfa/confirm error", e);
    return err(500, "MFA_CONFIRM_FAILED", { detail: String(e?.message || e) });
  }
}
__name(onRequest3, "onRequest3");
__name2(onRequest3, "onRequest");
async function onRequest4(context22) {
  const { request, env: env22 } = context22;
  const m = requireMethod(request, "POST");
  if (m) return m;
  try {
    const u = await requireUser({ env: env22, request });
    if (!u.ok) return u.resp;
    const db = getDb(env22);
    if (!db) return err(500, "NO_DB_BINDING");
    const encKey = env22.MFA_ENC_KEY || env22.JWT_SECRET;
    if (!encKey) return err(500, "MFA_KEY_MISSING");
    const secret = randomBase32(20);
    const encObj = await aesGcmEncrypt(secret, encKey);
    const encStr = JSON.stringify(encObj);
    const ts = now();
    await db.prepare(
      `INSERT INTO user_mfa (user_id, totp_secret_encrypted, mfa_enabled, created_at)
         VALUES (?, ?, 0, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           totp_secret_encrypted = excluded.totp_secret_encrypted,
           mfa_enabled = 0`
    ).bind(u.user.sub, encStr, ts).run();
    const issuer = env22.TOTP_ISSUER || "Bondfire";
    const label = u.user.email || u.user.sub;
    const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(
      label
    )}?secret=${encodeURIComponent(secret)}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
    return ok({ secret, otpauth });
  } catch (e) {
    console.error("mfa/setup error", e);
    return err(500, "MFA_SETUP_FAILED", { detail: String(e?.message || e) });
  }
}
__name(onRequest4, "onRequest4");
__name2(onRequest4, "onRequest");
function htmlEscape(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}
__name(htmlEscape, "htmlEscape");
__name2(htmlEscape, "htmlEscape");
function normalizeField(field, idx) {
  const type = ["text", "paragraph", "choice", "checkbox", "date"].includes(String(field?.type || "")) ? field.type : "text";
  return {
    id: String(field?.id || `field_${idx + 1}`),
    type,
    label: String(field?.label || `Question ${idx + 1}`),
    required: !!field?.required,
    options: Array.isArray(field?.options) ? field.options.map((x) => String(x || "")).filter(Boolean) : []
  };
}
__name(normalizeField, "normalizeField");
__name2(normalizeField, "normalizeField");
function normalizeForm(input) {
  return {
    type: "bondfire-form",
    title: String(input?.title || "Untitled form"),
    description: String(input?.description || ""),
    fields: Array.isArray(input?.fields) ? input.fields.map(normalizeField) : [],
    responses: Array.isArray(input?.responses) ? input.responses : [],
    publicShare: {
      enabled: !!input?.publicShare?.enabled,
      token: String(input?.publicShare?.token || "")
    }
  };
}
__name(normalizeForm, "normalizeForm");
__name2(normalizeForm, "normalizeForm");
async function getPublicForm(env22, fileId) {
  await ensureDriveSchema(env22);
  const db = getDb2(env22);
  const row = await db.prepare(`SELECT id, org_id, name, mime, storage_key FROM drive_files WHERE id = ?`).bind(fileId).first();
  if (!row) return null;
  const blob = await loadFileBlob(env22, row.org_id, row.id, row.storage_key || null, row.mime || "application/octet-stream", row.name || "");
  const parsed = normalizeForm(JSON.parse(String(blob?.textContent || "{}")));
  return {
    file: row,
    form: parsed,
    orgId: row.org_id,
    storageKey: row.storage_key || null,
    mime: row.mime || "application/octet-stream"
  };
}
__name(getPublicForm, "getPublicForm");
__name2(getPublicForm, "getPublicForm");
function verifyToken(record, token) {
  return !!record?.form?.publicShare?.enabled && !!record?.form?.publicShare?.token && String(token || "") === String(record.form.publicShare.token || "");
}
__name(verifyToken, "verifyToken");
__name2(verifyToken, "verifyToken");
function renderField(field) {
  const req = field.required ? "required" : "";
  if (field.type === "paragraph") {
    return `<textarea name="${htmlEscape(field.id)}" ${req} style="width:100%;min-height:110px;padding:12px;border-radius:10px;border:1px solid #2a2a2a;background:#101012;color:#fff;"></textarea>`;
  }
  if (field.type === "choice") {
    return `<div style="display:grid;gap:8px;">${field.options.map((option) => `<label style="display:flex;gap:8px;align-items:center;"><input type="radio" name="${htmlEscape(field.id)}" value="${htmlEscape(option)}" ${req} /><span>${htmlEscape(option)}</span></label>`).join("")}</div>`;
  }
  if (field.type === "checkbox") {
    return `<div style="display:grid;gap:8px;">${field.options.map((option) => `<label style="display:flex;gap:8px;align-items:center;"><input type="checkbox" name="${htmlEscape(field.id)}" value="${htmlEscape(option)}" /><span>${htmlEscape(option)}</span></label>`).join("")}</div>`;
  }
  if (field.type === "date") {
    return `<input type="date" name="${htmlEscape(field.id)}" ${req} style="width:100%;padding:12px;border-radius:10px;border:1px solid #2a2a2a;background:#101012;color:#fff;" />`;
  }
  return `<input type="text" name="${htmlEscape(field.id)}" ${req} style="width:100%;padding:12px;border-radius:10px;border:1px solid #2a2a2a;background:#101012;color:#fff;" />`;
}
__name(renderField, "renderField");
__name2(renderField, "renderField");
function renderPage(fileId, form, token) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${htmlEscape(form.title)}</title>
<style>
body{margin:0;font-family:Inter,system-ui,sans-serif;background:#090909;color:#fff;padding:24px}
.shell{max-width:760px;margin:0 auto;background:#0f0f10;border:1px solid #222;border-radius:18px;padding:24px;box-shadow:0 18px 50px rgba(0,0,0,.38)}
.card{display:grid;gap:10px;padding:18px;border:1px solid #242424;border-radius:14px;background:#131315;margin-top:14px}
button{padding:12px 18px;border-radius:12px;border:1px solid #333;background:#17181c;color:#fff;font-weight:700;cursor:pointer}
.small{font-size:13px;color:#a8a8ad}
.success{color:#9be7ac}.error{color:#ff9a9a}
</style>
</head>
<body>
  <div class="shell">
    <h1 style="margin:0 0 8px 0;">${htmlEscape(form.title)}</h1>
    ${form.description ? `<div class="small" style="white-space:pre-wrap;margin-bottom:8px;">${htmlEscape(form.description)}</div>` : ""}
    <form id="bf-public-form" style="display:grid;gap:14px;">
      ${form.fields.map((field, idx) => `<div class="card"><div style="font-weight:800;">${idx + 1}. ${htmlEscape(field.label)} ${field.required ? '<span style="color:#ff9a9a">*</span>' : ""}</div>${renderField(field)}</div>`).join("")}
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
        <button type="submit">Submit response</button>
        <div id="status" class="small"></div>
      </div>
    </form>
  </div>
<script>
const formEl = document.getElementById('bf-public-form');
const statusEl = document.getElementById('status');
formEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusEl.textContent = 'Submitting\u2026';
  statusEl.className = 'small';
  const fd = new FormData(formEl);
  const answers = {};
  ${JSON.stringify(form.fields)}.forEach((field) => {
    if (field.type === 'checkbox') answers[field.id] = fd.getAll(field.id);
    else answers[field.id] = fd.get(field.id) || '';
  });
  try {
    const res = await fetch(window.location.pathname + window.location.search, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: ${JSON.stringify(token)}, answers }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || 'SUBMIT_FAILED');
    formEl.reset();
    statusEl.textContent = 'Response submitted.';
    statusEl.className = 'small success';
  } catch (err) {
    statusEl.textContent = err.message || 'Submit failed';
    statusEl.className = 'small error';
  }
});
<\/script>
</body>
</html>`;
}
__name(renderPage, "renderPage");
__name2(renderPage, "renderPage");
async function onRequestGet18({ env: env22, request, params }) {
  const fileId = params.id;
  const token = new URL(request.url).searchParams.get("token") || "";
  const record = await getPublicForm(env22, fileId);
  if (!record) return bad(404, "NOT_FOUND");
  if (!verifyToken(record, token)) return bad(403, "FORBIDDEN");
  const wantsJson = new URL(request.url).searchParams.get("format") === "json" || String(request.headers.get("accept") || "").includes("application/json");
  if (wantsJson) {
    return json({ ok: true, form: { title: record.form.title, description: record.form.description, fields: record.form.fields } });
  }
  return new Response(renderPage(fileId, record.form, token), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "private, max-age=0, no-store" } });
}
__name(onRequestGet18, "onRequestGet18");
__name2(onRequestGet18, "onRequestGet");
async function onRequestPost18({ env: env22, request, params }) {
  const fileId = params.id;
  const record = await getPublicForm(env22, fileId);
  if (!record) return bad(404, "NOT_FOUND");
  const body = await request.json().catch(() => ({}));
  if (!verifyToken(record, body?.token || "")) return bad(403, "FORBIDDEN");
  const answers = body && typeof body.answers === "object" && !Array.isArray(body.answers) ? body.answers : {};
  const missing = record.form.fields.find((field) => {
    if (!field.required) return false;
    const value = answers[field.id];
    if (field.type === "checkbox") return !Array.isArray(value) || !value.length;
    return !String(value || "").trim();
  });
  if (missing) return bad(400, "REQUIRED_FIELD_MISSING", { fieldId: missing.id, label: missing.label });
  const response = {
    id: uuid(),
    submittedAt: now(),
    source: "public",
    answers: record.form.fields.reduce((acc, field) => {
      const value = answers[field.id];
      acc[field.id] = field.type === "checkbox" ? Array.isArray(value) ? value.map((x) => String(x || "")) : [] : String(value || "");
      return acc;
    }, {})
  };
  const nextForm = { ...record.form, responses: [...record.form.responses, response] };
  const textContent = JSON.stringify(nextForm, null, 2);
  await saveFileBlob(env22, {
    orgId: record.orgId,
    fileId,
    storageKey: record.storageKey,
    mime: record.mime,
    textContent,
    dataUrl: `data:${record.mime || "application/json"};base64,${btoa(unescape(encodeURIComponent(textContent)))}`
  });
  await getDb2(env22).prepare(`UPDATE drive_files SET updated_at = ? WHERE id = ?`).bind(now(), fileId).run();
  return json({ ok: true, submitted: true, responseId: response.id });
}
__name(onRequestPost18, "onRequestPost18");
__name2(onRequestPost18, "onRequestPost");
async function onRequestGet19({ env: env22, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "viewer" });
  if (!a.ok) return a.resp;
  const url = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 20)));
  const res = await env22.BF_DB.prepare(
    "SELECT id, kind, message, actor_user_id, created_at, meta_json FROM activity WHERE org_id = ? ORDER BY created_at DESC LIMIT ?"
  ).bind(orgId, limit).all();
  return json({ ok: true, activity: res.results || [] });
}
__name(onRequestGet19, "onRequestGet19");
__name2(onRequestGet19, "onRequestGet");
async function onRequestPost19({ env: env22, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  const body = await request.json().catch(() => ({}));
  const kind = String(body.kind || "note").trim() || "note";
  const message = String(body.message || "").trim();
  if (!message) return bad(400, "MISSING_MESSAGE");
  const id = uuid();
  const t = now();
  const actorUserId = a.user?.id || null;
  const metaJson = body.meta ? JSON.stringify(body.meta) : null;
  await env22.BF_DB.prepare(
    "INSERT INTO activity (id, org_id, kind, message, actor_user_id, created_at, meta_json) VALUES (?,?,?,?,?,?,?)"
  ).bind(id, orgId, kind, message, actorUserId, t, metaJson).run();
  return json({ ok: true, id });
}
__name(onRequestPost19, "onRequestPost19");
__name2(onRequestPost19, "onRequestPost");
async function tryRun2(db, sql) {
  try {
    await db.prepare(sql).run();
  } catch (e) {
    const msg = String(e?.message || "");
    if (msg.includes("duplicate") || msg.includes("already exists") || msg.includes("SQLITE_ERROR")) return;
    throw e;
  }
}
__name(tryRun2, "tryRun2");
__name2(tryRun2, "tryRun");
async function ensureZkColumns(db) {
  await tryRun2(db, "CREATE TABLE IF NOT EXISTS org_keys (org_id TEXT PRIMARY KEY, encrypted_org_metadata TEXT)");
  await ensureZkSchema(db);
}
__name(ensureZkColumns, "ensureZkColumns");
__name2(ensureZkColumns, "ensureZkColumns");
async function onRequestGet20({ env: env22, request, params }) {
  const u = await requireUser({ env: env22, request });
  if (!u.ok) return u.resp;
  const orgId = String(params?.orgId || "");
  if (!orgId) return bad(400, "MISSING_ORG_ID");
  const db = getDb(env22);
  if (!db) return bad(500, "NO_DB_BINDING");
  await ensureZkColumns(db);
  const role = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!role.ok) return role.resp;
  const org = await db.prepare("SELECT encrypted_org_metadata FROM org_keys WHERE org_id = ?").bind(orgId).first();
  const keyVersion = await getOrgKeyVersion(db, orgId);
  const userId = String(u.user?.sub || "");
  const wk = await db.prepare("SELECT wrapped_key, key_version, kid FROM org_key_wrapped WHERE org_id = ? AND user_id = ?").bind(orgId, userId).first();
  return json({
    ok: true,
    has_org_key: !!org,
    key_version: keyVersion,
    encrypted_org_metadata: org?.encrypted_org_metadata || null,
    wrapped_key: wk?.wrapped_key || null,
    wrapped_key_version: wk?.key_version ?? null,
    wrapped_kid: wk?.kid ?? null
  });
}
__name(onRequestGet20, "onRequestGet20");
__name2(onRequestGet20, "onRequestGet");
async function onRequestPost20({ env: env22, request, params }) {
  const m = requireMethod(request, "POST");
  if (m) return m;
  const u = await requireUser({ env: env22, request });
  if (!u.ok) return u.resp;
  const orgId = String(params?.orgId || "");
  if (!orgId) return bad(400, "MISSING_ORG_ID");
  const db = getDb(env22);
  if (!db) return bad(500, "NO_DB_BINDING");
  await ensureZkColumns(db);
  const role = await requireOrgRole({ env: env22, request, orgId, minRole: "admin" });
  if (!role.ok) return role.resp;
  const body = await readJSON(request);
  const wrappedKeys = Array.isArray(body?.wrapped_keys) ? body.wrapped_keys : null;
  const encryptedOrgMetadata = body?.encrypted_org_metadata ?? null;
  const keyVersion = Number.isFinite(Number(body?.key_version)) ? Number(body.key_version) : null;
  if (!wrappedKeys || wrappedKeys.length === 0) return bad(400, "MISSING_WRAPPED_KEYS");
  await db.prepare("INSERT OR REPLACE INTO org_keys (org_id, encrypted_org_metadata) VALUES (?, ?)").bind(orgId, encryptedOrgMetadata).run();
  const fallbackStmt = db.prepare(
    "INSERT OR REPLACE INTO org_key_wrapped (org_id, user_id, wrapped_key) VALUES (?, ?, ?)"
  );
  for (const wk of wrappedKeys) {
    if (!wk?.user_id || !wk?.wrapped_key) continue;
    const userId = String(wk.user_id);
    const wrappedKey = String(wk.wrapped_key);
    const kid = wk.kid ? String(wk.kid) : null;
    const kv = Number.isFinite(Number(wk.key_version)) ? Number(wk.key_version) : keyVersion;
    try {
      await db.prepare(
        "INSERT INTO org_key_wrapped (org_id, user_id, wrapped_key, key_version, kid) VALUES (?, ?, ?, ?, ?) ON CONFLICT(org_id, user_id) DO UPDATE SET wrapped_key = excluded.wrapped_key, key_version = excluded.key_version, kid = excluded.kid"
      ).bind(orgId, userId, wrappedKey, kv, kid).run();
    } catch {
      await fallbackStmt.bind(orgId, userId, wrappedKey).run();
    }
  }
  if (keyVersion != null) {
    const info32 = await db.prepare("PRAGMA table_info(org_crypto)").all();
    const cols = new Set((info32?.results || []).map((r) => r.name));
    const hasCreatedAt = cols.has("created_at");
    const now4 = Date.now();
    if (hasCreatedAt) {
      await db.prepare(
        "INSERT INTO org_crypto (org_id, key_version, updated_at, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(org_id) DO UPDATE SET key_version = excluded.key_version, updated_at = excluded.updated_at, created_at = COALESCE(org_crypto.created_at, excluded.created_at)"
      ).bind(orgId, keyVersion, now4, now4).run();
    } else {
      await db.prepare(
        "INSERT INTO org_crypto (org_id, key_version, updated_at) VALUES (?, ?, ?) ON CONFLICT(org_id) DO UPDATE SET key_version = excluded.key_version, updated_at = excluded.updated_at"
      ).bind(orgId, keyVersion, now4).run();
    }
  }
  return json({ ok: true });
}
__name(onRequestPost20, "onRequestPost20");
__name2(onRequestPost20, "onRequestPost");
async function safeFirst(env22, sql, binds = [], fallback = null) {
  try {
    const stmt = env22.BF_DB.prepare(sql);
    const res = Array.isArray(binds) ? await stmt.bind(...binds).first() : await stmt.first();
    return res ?? fallback;
  } catch (e) {
    console.warn("dashboard safeFirst failed", e);
    return fallback;
  }
}
__name(safeFirst, "safeFirst");
__name2(safeFirst, "safeFirst");
async function safeAll(env22, sql, binds = [], fallback = []) {
  try {
    const stmt = env22.BF_DB.prepare(sql);
    const res = Array.isArray(binds) ? await stmt.bind(...binds).all() : await stmt.all();
    return Array.isArray(res?.results) ? res.results : fallback;
  } catch (e) {
    console.warn("dashboard safeAll failed", e);
    return fallback;
  }
}
__name(safeAll, "safeAll");
__name2(safeAll, "safeAll");
async function onRequestGet21({ env: env22, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "viewer" });
  if (!a.ok) return a.resp;
  const peopleCount = await safeFirst(
    env22,
    "SELECT COUNT(*) as c FROM people WHERE org_id = ?",
    [orgId],
    { c: 0 }
  );
  const needsOpenCount = await safeFirst(
    env22,
    "SELECT COUNT(*) as c FROM needs WHERE org_id = ? AND status = 'open'",
    [orgId],
    { c: 0 }
  );
  const needsAllCount = await safeFirst(
    env22,
    "SELECT COUNT(*) as c FROM needs WHERE org_id = ?",
    [orgId],
    { c: 0 }
  );
  const inventoryCount = await safeFirst(
    env22,
    "SELECT COUNT(*) as c FROM inventory WHERE org_id = ?",
    [orgId],
    { c: 0 }
  );
  const nowMs = Date.now();
  const meetingsUpcomingCount = await safeFirst(
    env22,
    "SELECT COUNT(*) as c FROM meetings WHERE org_id = ? AND starts_at IS NOT NULL AND starts_at >= ?",
    [orgId, nowMs],
    { c: 0 }
  );
  const nextMeeting = await safeFirst(
    env22,
    "SELECT id, title, starts_at, encrypted_blob, key_version FROM meetings WHERE org_id = ? AND starts_at IS NOT NULL AND starts_at >= ? ORDER BY starts_at ASC LIMIT 1",
    [orgId, nowMs],
    null
  );
  const people = await safeAll(
    env22,
    "SELECT id, name, encrypted_blob, key_version FROM people WHERE org_id = ? ORDER BY COALESCE(updated_at, created_at) DESC LIMIT 5",
    [orgId],
    []
  );
  const needs = await safeAll(
    env22,
    "SELECT id, title, status, encrypted_blob, key_version FROM needs WHERE org_id = ? ORDER BY COALESCE(updated_at, created_at) DESC LIMIT 5",
    [orgId],
    []
  );
  await safeFirst(
    env22,
    `CREATE TABLE IF NOT EXISTS inventory_pars (
      org_id TEXT NOT NULL,
      inventory_id TEXT NOT NULL,
      par REAL,
      updated_at INTEGER,
      PRIMARY KEY (org_id, inventory_id)
    )`,
    [],
    null
  );
  const inventory = await safeAll(
    env22,
    `SELECT i.id, i.name, i.qty, i.unit, i.category, i.encrypted_blob, i.key_version, ip.par
     FROM inventory i
     LEFT JOIN inventory_pars ip
       ON ip.org_id = i.org_id AND ip.inventory_id = i.id
     WHERE i.org_id = ?
     ORDER BY COALESCE(i.updated_at, i.created_at) DESC LIMIT 5`,
    [orgId],
    []
  );
  const newsletterCount = await safeFirst(
    env22,
    "SELECT COUNT(*) as c FROM newsletter_subscribers WHERE org_id = ?",
    [orgId],
    { c: 0 }
  );
  const pledgesCount = await safeFirst(
    env22,
    "SELECT COUNT(*) as c FROM pledges WHERE org_id = ?",
    [orgId],
    { c: 0 }
  );
  const newsletter = await safeAll(
    env22,
    "SELECT id, name, email, created_at, encrypted_blob, key_version FROM newsletter_subscribers WHERE org_id = ? ORDER BY created_at DESC LIMIT 5",
    [orgId],
    []
  );
  const pledges = await safeAll(
    env22,
    "SELECT id, title, qty, unit, created_at, encrypted_blob, key_version FROM pledges WHERE org_id = ? ORDER BY COALESCE(updated_at, created_at) DESC LIMIT 5",
    [orgId],
    []
  );
  const publicInboxCount = await safeFirst(
    env22,
    `SELECT COUNT(*) as c FROM public_intakes WHERE org_id = ? AND kind IN ('get_help', 'offer_resources', 'volunteer') AND COALESCE(status, 'new') != 'closed'`,
    [orgId],
    { c: 0 }
  );
  const publicInbox = await safeAll(
    env22,
    `SELECT id, kind, name, contact, details, extra, status, created_at, updated_at
     FROM public_intakes
     WHERE org_id = ? AND kind IN ('get_help', 'offer_resources', 'volunteer')
     ORDER BY created_at DESC LIMIT 5`,
    [orgId],
    []
  );
  const activity = await safeAll(
    env22,
    "SELECT id, kind, message, actor_user_id, created_at FROM activity WHERE org_id = ? ORDER BY created_at DESC LIMIT 25",
    [orgId],
    []
  );
  return json({
    ok: true,
    counts: {
      people: peopleCount?.c || 0,
      needsOpen: needsOpenCount?.c || 0,
      needsAll: needsAllCount?.c || 0,
      inventory: inventoryCount?.c || 0,
      meetingsUpcoming: meetingsUpcomingCount?.c || 0,
      newsletter: newsletterCount?.c || 0,
      pledges: pledgesCount?.c || 0,
      publicInbox: publicInboxCount?.c || 0
    },
    nextMeeting: nextMeeting || null,
    people,
    needs,
    inventory,
    newsletter,
    pledges,
    publicInbox,
    activity
  });
}
__name(onRequestGet21, "onRequestGet21");
__name2(onRequestGet21, "onRequestGet");
async function onRequestGet22({ env: env22, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;
  const tree = await listDriveTree(env22, orgId);
  return json({ ok: true, ...tree });
}
__name(onRequestGet22, "onRequestGet22");
__name2(onRequestGet22, "onRequestGet");
async function logActivity(env22, { orgId, kind, message, actorUserId = null }) {
  try {
    if (!env22?.BF_DB) return;
    if (!orgId || !kind || !message) return;
    await env22.BF_DB.prepare(
      "INSERT INTO activity (id, org_id, kind, message, actor_user_id, created_at) VALUES (?,?,?,?,?,?)"
    ).bind(uuid(), orgId, String(kind), String(message), actorUserId, now()).run();
  } catch (e) {
    console.warn("ACTIVITY_LOG_FAIL", e?.message || e);
  }
}
__name(logActivity, "logActivity");
__name2(logActivity, "logActivity");
async function getOrgCryptoKeyVersion2(db, orgId) {
  try {
    const r = await db.prepare("SELECT key_version FROM org_crypto WHERE org_id = ?").bind(orgId).first();
    return Number(r?.key_version) || 1;
  } catch (e) {
    const msg = String(e?.message || "");
    if (!msg.includes("no such column: key_version")) throw e;
    const r = await db.prepare("SELECT version AS key_version FROM org_crypto WHERE org_id = ?").bind(orgId).first();
    return Number(r?.key_version) || 1;
  }
}
__name(getOrgCryptoKeyVersion2, "getOrgCryptoKeyVersion2");
__name2(getOrgCryptoKeyVersion2, "getOrgCryptoKeyVersion");
async function ensureInventoryParsTable(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS inventory_pars (
      org_id TEXT NOT NULL,
      inventory_id TEXT NOT NULL,
      par REAL,
      updated_at INTEGER,
      PRIMARY KEY (org_id, inventory_id)
    )`
  ).run();
}
__name(ensureInventoryParsTable, "ensureInventoryParsTable");
__name2(ensureInventoryParsTable, "ensureInventoryParsTable");
async function onRequestGet23({ env: env22, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "viewer" });
  if (!a.ok) return a.resp;
  await ensureInventoryParsTable(env22.BF_DB);
  const res = await env22.BF_DB.prepare(
    `SELECT i.id, i.name, i.qty, i.unit, i.category, i.location, i.notes,
            i.encrypted_notes, i.encrypted_blob, i.key_version,
            i.is_public, i.created_at, i.updated_at,
            ip.par
     FROM inventory i
     LEFT JOIN inventory_pars ip
       ON ip.org_id = i.org_id AND ip.inventory_id = i.id
     WHERE i.org_id = ?
     ORDER BY i.created_at DESC`
  ).bind(orgId).all();
  return json({ ok: true, inventory: res.results || [] });
}
__name(onRequestGet23, "onRequestGet23");
__name2(onRequestGet23, "onRequestGet");
async function onRequestPost21({ env: env22, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  if (!name) return bad(400, "MISSING_NAME");
  await ensureInventoryParsTable(env22.BF_DB);
  const id = uuid();
  const t = now();
  const qty = Number.isFinite(Number(body.qty)) ? Number(body.qty) : 0;
  const keyVersion = body.encrypted_blob ? await getOrgCryptoKeyVersion2(env22.BF_DB, orgId) : null;
  await env22.BF_DB.prepare(
    `INSERT INTO inventory (
        id, org_id, name, qty, unit, category, location, notes,
        encrypted_notes, encrypted_blob, key_version,
        is_public, created_at, updated_at
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    id,
    orgId,
    name,
    qty,
    String(body.unit || ""),
    String(body.category || ""),
    String(body.location || ""),
    String(body.notes || ""),
    body.encrypted_notes ?? null,
    body.encrypted_blob ?? null,
    keyVersion,
    body.is_public ? 1 : 0,
    t,
    t
  ).run();
  const par = body.par === void 0 || body.par === null || body.par === "" ? null : Number(body.par);
  if (Number.isFinite(par) && par > 0) {
    await env22.BF_DB.prepare(
      `INSERT INTO inventory_pars (org_id, inventory_id, par, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(org_id, inventory_id)
       DO UPDATE SET par = excluded.par, updated_at = excluded.updated_at`
    ).bind(orgId, id, par, t).run();
  }
  try {
    await logActivity(env22, {
      orgId,
      kind: "inventory.created",
      message: `inventory added: ${name}`,
      actorUserId: a?.user?.sub || null
    });
  } catch (e) {
    console.error("ACTIVITY_FAIL", e);
  }
  const created2 = await env22.BF_DB.prepare(
    `SELECT i.id, i.org_id, i.name, i.qty, i.unit, i.category, i.location, i.notes,
            i.encrypted_notes, i.encrypted_blob, i.key_version,
            i.is_public, i.created_at, i.updated_at,
            ip.par
     FROM inventory i
     LEFT JOIN inventory_pars ip
       ON ip.org_id = i.org_id AND ip.inventory_id = i.id
     WHERE i.id = ? AND i.org_id = ?`
  ).bind(id, orgId).first();
  return json({ ok: true, id, item: created2 || null });
}
__name(onRequestPost21, "onRequestPost21");
__name2(onRequestPost21, "onRequestPost");
async function onRequestPut3({ env: env22, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return bad(400, "MISSING_ID");
  await ensureInventoryParsTable(env22.BF_DB);
  const isPublic = typeof body.is_public === "boolean" ? body.is_public ? 1 : 0 : null;
  const qty = body.qty === void 0 || body.qty === null ? null : Number.isFinite(Number(body.qty)) ? Number(body.qty) : 0;
  const keyVersion = body.encrypted_blob ? await getOrgCryptoKeyVersion2(env22.BF_DB, orgId) : null;
  await env22.BF_DB.prepare(
    `UPDATE inventory
     SET name = COALESCE(?, name),
         qty = COALESCE(?, qty),
         unit = COALESCE(?, unit),
         category = COALESCE(?, category),
         location = COALESCE(?, location),
         notes = COALESCE(?, notes),
         encrypted_notes = COALESCE(?, encrypted_notes),
         encrypted_blob = COALESCE(?, encrypted_blob),
         key_version = COALESCE(?, key_version),
         is_public = COALESCE(?, is_public),
         updated_at = ?
     WHERE id = ? AND org_id = ?`
  ).bind(
    body.name ?? null,
    qty,
    body.unit ?? null,
    body.category ?? null,
    body.location ?? null,
    body.notes ?? null,
    body.encrypted_notes ?? null,
    body.encrypted_blob ?? null,
    keyVersion,
    isPublic,
    now(),
    id,
    orgId
  ).run();
  if (Object.prototype.hasOwnProperty.call(body, "par")) {
    const parRaw = body.par;
    const par = parRaw === void 0 || parRaw === null || parRaw === "" ? null : Number(parRaw);
    if (Number.isFinite(par) && par > 0) {
      await env22.BF_DB.prepare(
        `INSERT INTO inventory_pars (org_id, inventory_id, par, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(org_id, inventory_id)
         DO UPDATE SET par = excluded.par, updated_at = excluded.updated_at`
      ).bind(orgId, id, par, now()).run();
    } else {
      await env22.BF_DB.prepare(`DELETE FROM inventory_pars WHERE org_id = ? AND inventory_id = ?`).bind(orgId, id).run();
    }
  }
  try {
    await logActivity(env22, {
      orgId,
      kind: "inventory.updated",
      message: `inventory updated: ${id}`,
      actorUserId: a?.user?.sub || null
    });
  } catch (e) {
    console.error("ACTIVITY_FAIL", e);
  }
  const item = await env22.BF_DB.prepare(
    `SELECT i.id, i.org_id, i.name, i.qty, i.unit, i.category, i.location, i.notes,
            i.encrypted_notes, i.encrypted_blob, i.key_version,
            i.is_public, i.created_at, i.updated_at,
            ip.par
     FROM inventory i
     LEFT JOIN inventory_pars ip
       ON ip.org_id = i.org_id AND ip.inventory_id = i.id
     WHERE i.id = ? AND i.org_id = ?`
  ).bind(id, orgId).first();
  return json({ ok: true, item: item || null });
}
__name(onRequestPut3, "onRequestPut3");
__name2(onRequestPut3, "onRequestPut");
async function onRequestDelete8({ env: env22, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "admin" });
  if (!a.ok) return a.resp;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return bad(400, "MISSING_ID");
  const prev = await env22.BF_DB.prepare(
    "SELECT name FROM inventory WHERE id = ? AND org_id = ?"
  ).bind(id, orgId).first();
  const shortId = /* @__PURE__ */ __name2((x) => typeof x === "string" && x.length > 12 ? `${x.slice(0, 8)}\u2026${x.slice(-4)}` : x || "", "shortId");
  const name = String(prev?.name || "").trim();
  const label = name || shortId(id);
  await ensureInventoryParsTable(env22.BF_DB);
  await env22.BF_DB.prepare("DELETE FROM inventory_pars WHERE org_id = ? AND inventory_id = ?").bind(orgId, id).run();
  await env22.BF_DB.prepare("DELETE FROM inventory WHERE id = ? AND org_id = ?").bind(id, orgId).run();
  logActivity(env22, {
    orgId,
    kind: "inventory.deleted",
    message: `Inventory removed: ${label} (${shortId(id)})`,
    actorUserId: a?.user?.sub || a?.user?.id || null
  }).catch(() => {
  });
  return json({ ok: true });
}
__name(onRequestDelete8, "onRequestDelete8");
__name2(onRequestDelete8, "onRequestDelete");
async function onRequestGet24(ctx) {
  return onRequest5(ctx);
}
__name(onRequestGet24, "onRequestGet24");
__name2(onRequestGet24, "onRequestGet");
async function onRequestPost22(ctx) {
  return onRequest5(ctx);
}
__name(onRequestPost22, "onRequestPost22");
__name2(onRequestPost22, "onRequestPost");
function randCode(len = 10) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}
__name(randCode, "randCode");
__name2(randCode, "randCode");
function toInt(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}
__name(toInt, "toInt");
__name2(toInt, "toInt");
async function ensureInvitesTable(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS invites (
        code TEXT PRIMARY KEY,
        org_id TEXT NOT NULL,
        role TEXT NOT NULL,
        uses INTEGER NOT NULL DEFAULT 0,
        max_uses INTEGER NOT NULL DEFAULT 1,
        expires_at INTEGER,
        created_at INTEGER NOT NULL,
        created_by TEXT NOT NULL
      )`
  ).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_invites_org ON invites (org_id)`).run();
}
__name(ensureInvitesTable, "ensureInvitesTable");
__name2(ensureInvitesTable, "ensureInvitesTable");
async function onRequest5(ctx) {
  if (!ctx.env?.JWT_SECRET) return bad(500, "JWT_SECRET_MISSING");
  const { request, env: env22, params } = ctx;
  const db = getDb(env22);
  if (!db) return bad(500, "NO_DB_BINDING");
  const orgId = params.orgId;
  const roleCheck = await requireOrgRole({ env: env22, request, orgId, minRole: "owner" });
  if (!roleCheck.ok) return roleCheck.resp;
  try {
    await ensureInvitesTable(db);
    if (request.method === "GET") {
      const rows = await db.prepare(
        `SELECT code, role, uses, max_uses, expires_at, created_at
           FROM invites
           WHERE org_id = ?
           ORDER BY created_at DESC
           LIMIT 50`
      ).bind(orgId).all();
      return ok({
        invites: (rows.results || []).map((r) => ({
          code: r.code,
          role: r.role || "member",
          uses: toInt(r.uses, 0),
          max_uses: toInt(r.max_uses, 1),
          expires_at: r.expires_at ? new Date(r.expires_at).getTime() : null,
          created_at: r.created_at ? new Date(r.created_at).getTime() : null
        }))
      });
    }
    if (request.method === "POST") {
      let body = {};
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const role = (body.role || "member").toString();
      const maxUses = toInt(body.maxUses ?? body.max_uses ?? body.maxUses, 1) || 1;
      const expiresInDays = toInt(body.expiresInDays, 14);
      const now4 = /* @__PURE__ */ new Date();
      const expiresAt = expiresInDays && expiresInDays > 0 ? new Date(now4.getTime() + expiresInDays * 24 * 60 * 60 * 1e3) : null;
      let code = null;
      for (let i = 0; i < 5; i++) {
        const candidate = randCode(10);
        const existing = await db.prepare("SELECT code FROM invites WHERE code = ? LIMIT 1").bind(candidate).first();
        if (!existing) {
          code = candidate;
          break;
        }
      }
      if (!code) return bad(500, "INVITE_CODE_COLLISION");
      await db.prepare(
        `INSERT INTO invites (org_id, code, role, uses, max_uses, expires_at, created_by, created_at)
           VALUES (?, ?, ?, 0, ?, ?, ?, ?)`
      ).bind(
        orgId,
        code,
        role,
        maxUses,
        // D1 wants primitives. Store timestamps as epoch ms.
        expiresAt ? expiresAt.getTime() : null,
        // our JWT payload should use `sub`, but fall back just in case
        roleCheck.user?.sub || roleCheck.user?.userId || roleCheck.user?.id || null,
        now4.getTime()
      ).run();
      return ok({
        invite: {
          code,
          role,
          uses: 0,
          max_uses: maxUses,
          expires_at: expiresAt ? expiresAt.getTime() : null,
          created_at: now4.getTime()
        }
      });
    }
    if (request.method === "DELETE") {
      let body = {};
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const code = String(body.code || "").trim().toUpperCase();
      if (!code) return bad(400, "MISSING_CODE");
      const res = await db.prepare("DELETE FROM invites WHERE org_id = ? AND code = ?").bind(orgId, code).run();
      const changed = Number(res?.meta?.changes || 0);
      if (!changed) return bad(404, "INVITE_NOT_FOUND");
      return ok({ deleted: true, code });
    }
    return bad(405, "METHOD_NOT_ALLOWED");
  } catch (e) {
    return bad(500, e?.message || "INVITES_ERROR");
  }
}
__name(onRequest5, "onRequest5");
__name2(onRequest5, "onRequest");
async function getOrgCryptoKeyVersion3(db, orgId) {
  try {
    const r = await db.prepare("SELECT key_version FROM org_crypto WHERE org_id = ?").bind(orgId).first();
    return Number(r?.key_version) || 1;
  } catch (e) {
    const msg = String(e?.message || "");
    if (!msg.includes("no such column: key_version")) throw e;
    const r = await db.prepare("SELECT version AS key_version FROM org_crypto WHERE org_id = ?").bind(orgId).first();
    return Number(r?.key_version) || 1;
  }
}
__name(getOrgCryptoKeyVersion3, "getOrgCryptoKeyVersion3");
__name2(getOrgCryptoKeyVersion3, "getOrgCryptoKeyVersion");
async function ensureMeetingsZkColumns(db) {
  try {
    await db.prepare("ALTER TABLE meetings ADD COLUMN encrypted_notes TEXT").run();
  } catch {
  }
  try {
    await db.prepare("ALTER TABLE meetings ADD COLUMN encrypted_blob TEXT").run();
  } catch {
  }
  try {
    await db.prepare("ALTER TABLE meetings ADD COLUMN key_version INTEGER").run();
  } catch {
  }
}
__name(ensureMeetingsZkColumns, "ensureMeetingsZkColumns");
__name2(ensureMeetingsZkColumns, "ensureMeetingsZkColumns");
async function ensureMeetingsPublicColumn2(db) {
  try {
    await db.prepare("ALTER TABLE meetings ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0").run();
  } catch {
  }
}
__name(ensureMeetingsPublicColumn2, "ensureMeetingsPublicColumn2");
__name2(ensureMeetingsPublicColumn2, "ensureMeetingsPublicColumn");
async function onRequestGet25({ env: env22, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "viewer" });
  if (!a.ok) return a.resp;
  await ensureMeetingsPublicColumn2(env22.BF_DB);
  await ensureMeetingsZkColumns(env22.BF_DB);
  const res = await env22.BF_DB.prepare(
    `SELECT id, title, starts_at, ends_at, location, agenda, notes, is_public, encrypted_notes, encrypted_blob, key_version, created_at, updated_at
     FROM meetings
     WHERE org_id = ?
     ORDER BY starts_at DESC, created_at DESC`
  ).bind(orgId).all();
  return json({ ok: true, meetings: res.results || [] });
}
__name(onRequestGet25, "onRequestGet25");
__name2(onRequestGet25, "onRequestGet");
async function onRequestPost23({ env: env22, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  const body = await request.json().catch(() => ({}));
  const title22 = String(body.title || "").trim();
  if (!title22) return bad(400, "MISSING_TITLE");
  const id = uuid();
  const t = now();
  const startsAt = Number.isFinite(Number(body.starts_at)) ? Number(body.starts_at) : t;
  const endsAt = Number.isFinite(Number(body.ends_at)) ? Number(body.ends_at) : startsAt;
  await ensureMeetingsPublicColumn2(env22.BF_DB);
  await ensureMeetingsZkColumns(env22.BF_DB);
  let keyVersion = null;
  if (body.encrypted_blob) {
    keyVersion = await getOrgCryptoKeyVersion3(env22.BF_DB, orgId);
  }
  await env22.BF_DB.prepare(
    `INSERT INTO meetings (
	      id, org_id, title, starts_at, ends_at, location, agenda, notes, is_public, encrypted_notes, encrypted_blob, key_version, created_at, updated_at
	   ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    id,
    orgId,
    title22,
    startsAt,
    endsAt,
    String(body.location || ""),
    String(body.agenda || ""),
    String(body.notes || ""),
    body.is_public ? 1 : 0,
    body.encrypted_notes ?? null,
    body.encrypted_blob ?? null,
    keyVersion,
    t,
    t
  ).run();
  try {
    await logActivity(env22, {
      orgId,
      kind: "meeting.created",
      message: `meeting created: ${title22}`,
      actorUserId: a?.user?.sub || null
    });
  } catch (e) {
    console.error("ACTIVITY_FAIL", e);
  }
  return json({ ok: true, id });
}
__name(onRequestPost23, "onRequestPost23");
__name2(onRequestPost23, "onRequestPost");
async function onRequestPut4({ env: env22, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return bad(400, "MISSING_ID");
  await ensureMeetingsPublicColumn2(env22.BF_DB);
  await ensureMeetingsZkColumns(env22.BF_DB);
  let keyVersion = null;
  if (body.encrypted_blob) {
    keyVersion = await getOrgCryptoKeyVersion3(env22.BF_DB, orgId);
  }
  const startsAt = body.starts_at === void 0 || body.starts_at === null ? null : Number.isFinite(Number(body.starts_at)) ? Number(body.starts_at) : 0;
  const endsAt = body.ends_at === void 0 || body.ends_at === null ? null : Number.isFinite(Number(body.ends_at)) ? Number(body.ends_at) : 0;
  await env22.BF_DB.prepare(
    `UPDATE meetings
     SET title = COALESCE(?, title),
         starts_at = COALESCE(?, starts_at),
         ends_at = COALESCE(?, ends_at),
         location = COALESCE(?, location),
         agenda = COALESCE(?, agenda),
         notes = COALESCE(?, notes),
         is_public = COALESCE(?, is_public),
	       encrypted_notes = COALESCE(?, encrypted_notes),
	       encrypted_blob = COALESCE(?, encrypted_blob),
	       key_version = COALESCE(?, key_version),
         updated_at = ?
     WHERE id = ? AND org_id = ?`
  ).bind(
    body.title ?? null,
    startsAt,
    endsAt,
    body.location ?? null,
    body.agenda ?? null,
    body.notes ?? null,
    body.is_public === void 0 ? null : body.is_public ? 1 : 0,
    body.encrypted_notes ?? null,
    body.encrypted_blob ?? null,
    keyVersion,
    now(),
    id,
    orgId
  ).run();
  try {
    await logActivity(env22, {
      orgId,
      kind: "meeting.updated",
      message: `meeting updated: ${id}`,
      actorUserId: a?.user?.sub || null
    });
  } catch (e) {
    console.error("ACTIVITY_FAIL", e);
  }
  return json({ ok: true });
}
__name(onRequestPut4, "onRequestPut4");
__name2(onRequestPut4, "onRequestPut");
async function onRequestDelete9({ env: env22, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "admin" });
  if (!a.ok) return a.resp;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return bad(400, "MISSING_ID");
  await env22.BF_DB.prepare("DELETE FROM meetings WHERE id = ? AND org_id = ?").bind(id, orgId).run();
  const prev = await env22.BF_DB.prepare(
    "SELECT title FROM meetings WHERE id = ? AND org_id = ?"
  ).bind(id, orgId).first();
  const shortId = /* @__PURE__ */ __name2((x) => typeof x === "string" && x.length > 12 ? `${x.slice(0, 8)}\u2026${x.slice(-4)}` : x || "", "shortId");
  const title22 = String(prev?.title || "").trim();
  const label = title22 || shortId(id);
  logActivity(env22, {
    orgId,
    kind: "meeting.deleted",
    message: `Meeting deleted: ${label} (${shortId(id)})`,
    actorUserId: a?.user?.sub || a?.user?.id || null
  }).catch(() => {
  });
  return json({ ok: true });
}
__name(onRequestDelete9, "onRequestDelete9");
__name2(onRequestDelete9, "onRequestDelete");
async function getOrgCryptoKeyVersion4(db, orgId) {
  try {
    const r = await db.prepare("SELECT key_version FROM org_crypto WHERE org_id = ?").bind(orgId).first();
    return Number(r?.key_version) || 1;
  } catch (e) {
    const msg = String(e?.message || "");
    if (!msg.includes("no such column: key_version")) throw e;
    const r = await db.prepare("SELECT version AS key_version FROM org_crypto WHERE org_id = ?").bind(orgId).first();
    return Number(r?.key_version) || 1;
  }
}
__name(getOrgCryptoKeyVersion4, "getOrgCryptoKeyVersion4");
__name2(getOrgCryptoKeyVersion4, "getOrgCryptoKeyVersion");
function asString(v) {
  if (v == null) return "";
  return typeof v === "string" ? v : String(v);
}
__name(asString, "asString");
__name2(asString, "asString");
function asBool(v, fallback = false) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  const s = asString(v).trim().toLowerCase();
  if (!s) return fallback;
  if (["1", "true", "yes", "y", "on"].includes(s)) return true;
  if (["0", "false", "no", "n", "off"].includes(s)) return false;
  return fallback;
}
__name(asBool, "asBool");
__name2(asBool, "asBool");
function parsePriority(v, fallback = 0) {
  if (v == null || v === "") return fallback;
  if (typeof v === "number") {
    return Number.isFinite(v) ? Math.max(0, Math.trunc(v)) : fallback;
  }
  const s = asString(v).trim().toLowerCase();
  if (!s) return fallback;
  const n = Number(s);
  if (Number.isFinite(n)) return Math.max(0, Math.trunc(n));
  if (["high", "urgent", "h"].includes(s)) return 3;
  if (["medium", "med", "m"].includes(s)) return 2;
  if (["low", "l"].includes(s)) return 1;
  return fallback;
}
__name(parsePriority, "parsePriority");
__name2(parsePriority, "parsePriority");
async function safeLog(env22, payload) {
  try {
    await logActivity(env22, payload);
  } catch (e) {
    console.warn("activity log failed", e);
  }
}
__name(safeLog, "safeLog");
__name2(safeLog, "safeLog");
async function ensureNeedsZkColumns(db) {
  try {
    await db.prepare("ALTER TABLE needs ADD COLUMN encrypted_description TEXT").run();
  } catch {
  }
  try {
    await db.prepare("ALTER TABLE needs ADD COLUMN encrypted_blob TEXT").run();
  } catch {
  }
  try {
    await db.prepare("ALTER TABLE needs ADD COLUMN key_version INTEGER").run();
  } catch {
  }
}
__name(ensureNeedsZkColumns, "ensureNeedsZkColumns");
__name2(ensureNeedsZkColumns, "ensureNeedsZkColumns");
async function onRequestGet26({ env: env22, request, params }) {
  await ensureNeedsZkColumns(env22.BF_DB);
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "viewer" });
  if (!a.ok) return a.resp;
  const r = await env22.BF_DB.prepare(
    `SELECT
       id,
       title,
       description,
       status,
       priority,
       CASE
         WHEN priority >= 3 THEN 'high'
         WHEN priority = 2 THEN 'medium'
         WHEN priority = 1 THEN 'low'
         ELSE ''
       END AS urgency,
	     is_public,
	     encrypted_description,
	     encrypted_blob,
	     key_version,
       created_at,
       updated_at
     FROM needs
     WHERE org_id = ?
     ORDER BY COALESCE(updated_at, created_at) DESC`
  ).bind(orgId).all();
  return json({ ok: true, needs: r?.results || [] });
}
__name(onRequestGet26, "onRequestGet26");
__name2(onRequestGet26, "onRequestGet");
async function onRequestPost24({ env: env22, request, params }) {
  await ensureNeedsZkColumns(env22.BF_DB);
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  const body = await request.json().catch(() => ({}));
  const title22 = asString(body.title).trim();
  if (!title22) return bad(400, "Title is required");
  const description = asString(body.description).trim();
  const status = asString(body.status).trim() || "open";
  const priority = parsePriority(body.priority ?? body.urgency, 0);
  const is_public = asBool(body.is_public, false) ? 1 : 0;
  const id = uuid();
  const t = now();
  let keyVersion = null;
  if (body.encrypted_blob) {
    keyVersion = await getOrgCryptoKeyVersion4(env22.BF_DB, orgId);
  }
  await env22.BF_DB.prepare(
    `INSERT INTO needs (id, org_id, title, description, status, priority, is_public, encrypted_description, encrypted_blob, key_version, created_at, updated_at)
	   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    orgId,
    title22,
    description,
    status,
    priority,
    is_public,
    body.encrypted_description ?? null,
    body.encrypted_blob ?? null,
    keyVersion,
    t,
    t
  ).run();
  await safeLog(env22, {
    orgId,
    kind: "need.created",
    message: title22,
    actorUserId: a?.user?.sub || null,
    entityType: "need",
    entityId: id,
    entityTitle: title22
  });
  return json({ ok: true, id });
}
__name(onRequestPost24, "onRequestPost24");
__name2(onRequestPost24, "onRequestPost");
async function onRequestPut5({ env: env22, request, params }) {
  await ensureNeedsZkColumns(env22.BF_DB);
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  const body = await request.json().catch(() => ({}));
  const id = asString(body.id).trim();
  if (!id) return bad(400, "id is required");
  const existing = await env22.BF_DB.prepare(
    `SELECT id, title, description, status, priority, is_public, encrypted_description, encrypted_blob, key_version
	   FROM needs
	   WHERE org_id = ? AND id = ?`
  ).bind(orgId, id).first();
  if (!existing) return bad(404, "Need not found");
  const nextTitle = body.title === void 0 ? existing.title : asString(body.title).trim();
  const nextDescription = body.description === void 0 ? existing.description : asString(body.description).trim();
  const nextStatus = body.status === void 0 ? existing.status : asString(body.status).trim();
  const basePriority = Number.isFinite(Number(existing.priority)) ? Math.max(0, Math.trunc(Number(existing.priority))) : 0;
  const nextPriority = body.priority === void 0 && body.urgency === void 0 ? basePriority : parsePriority(body.priority ?? body.urgency, basePriority);
  const nextPublic = body.is_public === void 0 ? existing.is_public : asBool(body.is_public, false) ? 1 : 0;
  const t = now();
  let keyVersion = null;
  if (body.encrypted_blob) {
    keyVersion = await getOrgCryptoKeyVersion4(env22.BF_DB, orgId);
  }
  await env22.BF_DB.prepare(
    `UPDATE needs
	   SET title = ?,
	       description = ?,
	       status = ?,
	       priority = ?,
	       is_public = ?,
	       encrypted_description = COALESCE(?, encrypted_description),
	       encrypted_blob = COALESCE(?, encrypted_blob),
	       key_version = COALESCE(?, key_version),
	       updated_at = ?
	   WHERE org_id = ? AND id = ?`
  ).bind(
    nextTitle,
    nextDescription,
    nextStatus,
    nextPriority,
    nextPublic,
    body.encrypted_description ?? null,
    body.encrypted_blob ?? null,
    keyVersion,
    t,
    orgId,
    id
  ).run();
  await safeLog(env22, {
    orgId,
    kind: "need.updated",
    message: nextTitle || id,
    actorUserId: a?.user?.sub || null,
    entityType: "need",
    entityId: id,
    entityTitle: nextTitle || ""
  });
  return json({ ok: true });
}
__name(onRequestPut5, "onRequestPut5");
__name2(onRequestPut5, "onRequestPut");
async function onRequestDelete10({ env: env22, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "admin" });
  if (!a.ok) return a.resp;
  const url = new URL(request.url);
  let id = url.searchParams.get("id");
  if (!id) {
    const body = await request.json().catch(() => ({}));
    id = asString(body.id).trim();
  }
  id = asString(id).trim();
  if (!id) return bad(400, "id is required");
  const before = await env22.BF_DB.prepare(
    `SELECT title FROM needs WHERE org_id = ? AND id = ?`
  ).bind(orgId, id).first();
  await env22.BF_DB.prepare(`DELETE FROM needs WHERE org_id = ? AND id = ?`).bind(orgId, id).run();
  await safeLog(env22, {
    orgId,
    kind: "need.deleted",
    message: before?.title || id,
    actorUserId: a?.user?.sub || null,
    entityType: "need",
    entityId: id,
    entityTitle: before?.title || ""
  });
  return json({ ok: true });
}
__name(onRequestDelete10, "onRequestDelete10");
__name2(onRequestDelete10, "onRequestDelete");
async function getOrgCryptoKeyVersion5(db, orgId) {
  try {
    const r = await db.prepare("SELECT key_version FROM org_crypto WHERE org_id = ?").bind(orgId).first();
    return Number(r?.key_version) || 1;
  } catch (e) {
    const msg = String(e?.message || "");
    if (!msg.includes("no such column: key_version")) throw e;
    const r = await db.prepare("SELECT version AS key_version FROM org_crypto WHERE org_id = ?").bind(orgId).first();
    return Number(r?.key_version) || 1;
  }
}
__name(getOrgCryptoKeyVersion5, "getOrgCryptoKeyVersion5");
__name2(getOrgCryptoKeyVersion5, "getOrgCryptoKeyVersion");
async function ensurePeopleZkColumns(db) {
  try {
    await db.prepare("ALTER TABLE people ADD COLUMN encrypted_notes TEXT").run();
  } catch {
  }
  try {
    await db.prepare("ALTER TABLE people ADD COLUMN encrypted_blob TEXT").run();
  } catch {
  }
  try {
    await db.prepare("ALTER TABLE people ADD COLUMN key_version INTEGER").run();
  } catch {
  }
}
__name(ensurePeopleZkColumns, "ensurePeopleZkColumns");
__name2(ensurePeopleZkColumns, "ensurePeopleZkColumns");
async function onRequestGet27({ env: env22, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "viewer" });
  if (!a.ok) return a.resp;
  await ensurePeopleZkColumns(env22.BF_DB);
  const res = await env22.BF_DB.prepare(
    "SELECT id, name, role, phone, skills, notes, encrypted_notes, encrypted_blob, key_version, created_at, updated_at FROM people WHERE org_id = ? ORDER BY created_at DESC"
  ).bind(orgId).all();
  return json({ ok: true, people: res.results || [] });
}
__name(onRequestGet27, "onRequestGet27");
__name2(onRequestGet27, "onRequestGet");
async function onRequestPost25({ env: env22, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  await ensurePeopleZkColumns(env22.BF_DB);
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  if (!name) return bad(400, "MISSING_NAME");
  const id = uuid();
  const t = now();
  let keyVersion = null;
  if (body.encrypted_blob) {
    keyVersion = await getOrgCryptoKeyVersion5(env22.BF_DB, orgId);
  }
  await env22.BF_DB.prepare(
    `INSERT INTO people (id, org_id, name, role, phone, skills, notes, encrypted_notes, encrypted_blob, key_version, created_at, updated_at)
	     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    id,
    orgId,
    name,
    String(body.role || ""),
    String(body.phone || ""),
    String(body.skills || ""),
    String(body.notes || ""),
    body.encrypted_notes ?? null,
    body.encrypted_blob ?? null,
    keyVersion,
    t,
    t
  ).run();
  try {
    await logActivity(env22, {
      orgId,
      kind: "person.created",
      message: `person added: ${name}`,
      actorUserId: a?.user?.sub || null
    });
  } catch (e) {
    console.error("ACTIVITY_FAIL", e);
  }
  return json({ ok: true, id });
}
__name(onRequestPost25, "onRequestPost25");
__name2(onRequestPost25, "onRequestPost");
async function onRequestPut6({ env: env22, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  await ensurePeopleZkColumns(env22.BF_DB);
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return bad(400, "MISSING_ID");
  let keyVersion = null;
  if (body.encrypted_blob) {
    keyVersion = await getOrgCryptoKeyVersion5(env22.BF_DB, orgId);
  }
  await env22.BF_DB.prepare(
    `UPDATE people
     SET name = COALESCE(?, name),
         role = COALESCE(?, role),
         phone = COALESCE(?, phone),
         skills = COALESCE(?, skills),
         notes = COALESCE(?, notes),
         encrypted_notes = COALESCE(?, encrypted_notes),
	         encrypted_blob = COALESCE(?, encrypted_blob),
	         key_version = COALESCE(?, key_version),
         updated_at = ?
     WHERE id = ? AND org_id = ?`
  ).bind(
    body.name ?? null,
    body.role ?? null,
    body.phone ?? null,
    body.skills ?? null,
    body.notes ?? null,
    body.encrypted_notes ?? null,
    body.encrypted_blob ?? null,
    keyVersion,
    now(),
    id,
    orgId
  ).run();
  try {
    await logActivity(env22, {
      orgId,
      kind: "person.updated",
      message: `person updated: ${id}`,
      actorUserId: a?.user?.sub || null
    });
  } catch (e) {
    console.error("ACTIVITY_FAIL", e);
  }
  return json({ ok: true });
}
__name(onRequestPut6, "onRequestPut6");
__name2(onRequestPut6, "onRequestPut");
async function onRequestDelete11({ env: env22, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env: env22, request, orgId, minRole: "admin" });
  if (!a.ok) return a.resp;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return bad(400, "MISSING_ID");
  const prev = await env22.BF_DB.prepare(
    "SELECT name FROM people WHERE id = ? AND org_id = ?"
  ).bind(id, orgId).first();
  const shortId = /* @__PURE__ */ __name2((x) => typeof x === "string" && x.length > 12 ? `${x.slice(0, 8)}\u2026${x.slice(-4)}` : x || "", "shortId");
  const name = String(prev?.name || "").trim();
  const label = name || shortId(id);
  await env22.BF_DB.prepare("DELETE FROM people WHERE id = ? AND org_id = ?").bind(id, orgId).run();
  logActivity(env22, {
    orgId,
    kind: "person.deleted",
    message: `Person removed: ${label} (${shortId(id)})`,
    actorUserId: a?.user?.sub || a?.user?.id || null
  }).catch(() => {
  });
  return json({ ok: true });
}
__name(onRequestDelete11, "onRequestDelete11");
__name2(onRequestDelete11, "onRequestDelete");
async function tryRun3(db, sql) {
  try {
    await db.prepare(sql).run();
  } catch (e) {
    const msg = String(e?.message || "");
    if (msg.includes("duplicate") || msg.includes("already exists") || msg.includes("SQLITE_ERROR")) return;
    throw e;
  }
}
__name(tryRun3, "tryRun3");
__name2(tryRun3, "tryRun");
async function ensureRecoverySchema(db) {
  await tryRun3(db, "CREATE TABLE IF NOT EXISTS org_keys (org_id TEXT PRIMARY KEY, encrypted_org_metadata TEXT)");
  await ensureZkSchema(db);
  await tryRun3(
    db,
    "CREATE TABLE IF NOT EXISTS org_key_recovery (org_id TEXT NOT NULL,user_id TEXT NOT NULL,wrapped_key TEXT NOT NULL,salt TEXT NOT NULL,kdf TEXT NOT NULL,updated_at INTEGER NOT NULL,PRIMARY KEY (org_id, user_id))"
  );
  await tryRun3(db, "CREATE INDEX IF NOT EXISTS idx_org_key_recovery_org ON org_key_recovery(org_id)");
}
__name(ensureRecoverySchema, "ensureRecoverySchema");
__name2(ensureRecoverySchema, "ensureRecoverySchema");
async function onRequestGet28({ env: env22, request, params }) {
  const u = await requireUser({ env: env22, request });
  if (!u.ok) return u.resp;
  const orgId = String(params?.orgId || "");
  if (!orgId) return bad(400, "MISSING_ORG_ID");
  const db = getDb(env22);
  if (!db) return bad(500, "NO_DB_BINDING");
  await ensureRecoverySchema(db);
  const role = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!role.ok) return role.resp;
  const userId = String(u.user?.sub || "");
  const row = await db.prepare("SELECT wrapped_key, salt, kdf, updated_at FROM org_key_recovery WHERE org_id = ? AND user_id = ?").bind(orgId, userId).first();
  return json({
    ok: true,
    has_recovery: !!row,
    wrapped_key: row?.wrapped_key || null,
    salt: row?.salt || null,
    kdf: row?.kdf || null,
    updated_at: row?.updated_at || null
  });
}
__name(onRequestGet28, "onRequestGet28");
__name2(onRequestGet28, "onRequestGet");
async function onRequestPost26({ env: env22, request, params }) {
  const m = requireMethod(request, "POST");
  if (m) return m;
  const u = await requireUser({ env: env22, request });
  if (!u.ok) return u.resp;
  const orgId = String(params?.orgId || "");
  if (!orgId) return bad(400, "MISSING_ORG_ID");
  const db = getDb(env22);
  if (!db) return bad(500, "NO_DB_BINDING");
  await ensureRecoverySchema(db);
  const role = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!role.ok) return role.resp;
  const body = await readJSON(request);
  const wrappedKey = body?.wrapped_key ? String(body.wrapped_key) : "";
  const salt = body?.salt ? String(body.salt) : "";
  const kdf = body?.kdf ? String(body.kdf) : "";
  if (!wrappedKey || !salt || !kdf) return bad(400, "MISSING_FIELDS");
  const userId = String(u.user?.sub || "");
  const now4 = Date.now();
  await db.prepare(
    "INSERT INTO org_key_recovery (org_id, user_id, wrapped_key, salt, kdf, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(org_id, user_id) DO UPDATE SET wrapped_key = excluded.wrapped_key, salt = excluded.salt, kdf = excluded.kdf, updated_at = excluded.updated_at"
  ).bind(orgId, userId, wrappedKey, salt, kdf, now4).run();
  return json({ ok: true, updated_at: now4 });
}
__name(onRequestPost26, "onRequestPost26");
__name2(onRequestPost26, "onRequestPost");
async function onRequestDelete12({ env: env22, request, params }) {
  const m = requireMethod(request, "DELETE");
  if (m) return m;
  const u = await requireUser({ env: env22, request });
  if (!u.ok) return u.resp;
  const orgId = String(params?.orgId || "");
  if (!orgId) return bad(400, "MISSING_ORG_ID");
  const db = getDb(env22);
  if (!db) return bad(500, "NO_DB_BINDING");
  await ensureRecoverySchema(db);
  const role = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!role.ok) return role.resp;
  const userId = String(u.user?.sub || "");
  await db.prepare("DELETE FROM org_key_recovery WHERE org_id = ? AND user_id = ?").bind(orgId, userId).run();
  return json({ ok: true });
}
__name(onRequestDelete12, "onRequestDelete12");
__name2(onRequestDelete12, "onRequestDelete");
async function getOrgIdBySlug2(env22, slug) {
  const s = String(slug || "").trim();
  if (!s) return null;
  const orgId = await env22.BF_PUBLIC.get(`slug:${s}`);
  return orgId || null;
}
__name(getOrgIdBySlug2, "getOrgIdBySlug2");
__name2(getOrgIdBySlug2, "getOrgIdBySlug");
function clean2(v, max = 2e3) {
  return String(v || "").trim().slice(0, max);
}
__name(clean2, "clean2");
__name2(clean2, "clean");
function normKind(v) {
  const s = String(v || "").trim().toLowerCase();
  if (["get_help", "volunteer", "offer_resources", "inventory_request"].includes(s)) return s;
  return "";
}
__name(normKind, "normKind");
__name2(normKind, "normKind");
async function ensureTable3(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS public_inbox (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'intake',
      source_kind TEXT,
      name TEXT,
      contact TEXT,
      details TEXT,
      extra TEXT,
      review_status TEXT NOT NULL DEFAULT 'new',
      admin_note TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_public_inbox_org_created
    ON public_inbox(org_id, created_at DESC)
  `).run();
  const info32 = await db.prepare(`PRAGMA table_info(public_inbox)`).all();
  const cols = new Set((info32?.results || []).map((r) => String(r.name || "").toLowerCase()));
  const addCol = /* @__PURE__ */ __name2(async (sql) => {
    try {
      await db.prepare(sql).run();
    } catch {
    }
  }, "addCol");
  if (!cols.has("type")) {
    await addCol(`ALTER TABLE public_inbox ADD COLUMN type TEXT NOT NULL DEFAULT 'intake'`);
  }
  if (!cols.has("source_kind")) {
    await addCol(`ALTER TABLE public_inbox ADD COLUMN source_kind TEXT`);
  }
  if (!cols.has("review_status")) {
    await addCol(`ALTER TABLE public_inbox ADD COLUMN review_status TEXT NOT NULL DEFAULT 'new'`);
  }
  if (!cols.has("admin_note")) {
    await addCol(`ALTER TABLE public_inbox ADD COLUMN admin_note TEXT`);
  }
  if (!cols.has("updated_at")) {
    await addCol(`ALTER TABLE public_inbox ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0`);
  }
}
__name(ensureTable3, "ensureTable3");
__name2(ensureTable3, "ensureTable");
async function onRequestPost27({ env: env22, params, request }) {
  const slug = String(params?.slug || "").trim();
  if (!slug) return bad(400, "MISSING_SLUG");
  const orgId = await getOrgIdBySlug2(env22, slug);
  if (!orgId) return bad(404, "NOT_FOUND");
  const db = getDB(env22);
  if (!db) return bad(500, "DB_NOT_CONFIGURED");
  await ensureTable3(db);
  const body = await readJSON(request);
  const kind = normKind(body?.kind);
  if (!kind) return bad(400, "BAD_KIND");
  const id = crypto.randomUUID();
  const created2 = now();
  await db.prepare(`
    INSERT INTO public_inbox (
      id, org_id, type, source_kind, name, contact, details, extra, review_status, admin_note, created_at, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    id,
    orgId,
    "intake",
    kind,
    clean2(body?.name, 160),
    clean2(body?.contact, 220),
    clean2(body?.details, 4e3),
    clean2(body?.extra, 4e3),
    "new",
    "",
    created2,
    created2
  ).run();
  return ok({ id, kind, saved: true });
}
__name(onRequestPost27, "onRequestPost27");
__name2(onRequestPost27, "onRequestPost");
async function getOrgIdBySlug3(env22, slug) {
  const s = String(slug || "").trim();
  if (!s) return null;
  const orgId = await env22.BF_PUBLIC.get(`slug:${s}`);
  return orgId || null;
}
__name(getOrgIdBySlug3, "getOrgIdBySlug3");
__name2(getOrgIdBySlug3, "getOrgIdBySlug");
function json4(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
__name(json4, "json4");
__name2(json4, "json");
async function ensureInventoryTable(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        org_id TEXT NOT NULL,
        name TEXT NOT NULL,
        qty REAL NOT NULL DEFAULT 0,
        unit TEXT,
        category TEXT,
        location TEXT,
        notes TEXT,
        is_public INTEGER NOT NULL DEFAULT 0,
        encrypted_blob TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`
  ).run();
  await db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_inventory_org_updated
       ON inventory(org_id, updated_at DESC)`
  ).run();
}
__name(ensureInventoryTable, "ensureInventoryTable");
__name2(ensureInventoryTable, "ensureInventoryTable");
async function onRequestGet29({ env: env22, params }) {
  try {
    const slug = String(params?.slug || "").trim();
    if (!slug) return json4({ ok: false, error: "MISSING_SLUG" }, 400);
    const db = getDB(env22);
    if (!db) return json4({ ok: false, error: "DB_NOT_CONFIGURED" }, 500);
    await ensureInventoryTable(db);
    const orgId = await getOrgIdBySlug3(env22, slug);
    if (!orgId) return json4({ ok: false, error: "NOT_FOUND" }, 404);
    const r = await db.prepare(
      `SELECT id, org_id, name, qty, unit, category, location, notes, is_public, created_at, updated_at
         FROM inventory
         WHERE org_id = ? AND is_public = 1 AND COALESCE(qty, 0) > 0
         ORDER BY LOWER(COALESCE(category, '')), LOWER(COALESCE(name, '')), updated_at DESC, created_at DESC`
    ).bind(orgId).all();
    return json4({
      ok: true,
      items: Array.isArray(r?.results) ? r.results : []
    });
  } catch (err2) {
    return json4(
      { ok: false, error: "INTERNAL", detail: String(err2?.message || err2 || "") },
      500
    );
  }
}
__name(onRequestGet29, "onRequestGet29");
__name2(onRequestGet29, "onRequestGet");
async function onRequestGet30({ env: env22, params }) {
  const slug = params.slug;
  const db = getDB(env22);
  if (!db) return Response.json({ ok: false, error: "DB_NOT_CONFIGURED" }, { status: 500 });
  const orgId = await getOrgIdBySlug(env22, slug);
  if (!orgId) return Response.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  const pub = await getPublicCfg(env22, orgId);
  if (!pub?.enabled) return Response.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  const r = await db.prepare(
    `SELECT id, org_id, title, starts_at, ends_at, location, agenda, is_public, created_at, updated_at
       FROM meetings
       WHERE org_id=? AND is_public=1
       ORDER BY COALESCE(starts_at, 0) DESC, updated_at DESC`
  ).bind(orgId).all();
  return Response.json({ ok: true, meetings: r.results || [] });
}
__name(onRequestGet30, "onRequestGet30");
__name2(onRequestGet30, "onRequestGet");
async function onRequestGet31({ env: env22, params }) {
  const slug = params.slug;
  const orgId = await env22.BF_PUBLIC.get(`slug:${slug}`);
  if (!orgId) return json({ ok: false, needs: [] }, { status: 404 });
  const cfgRaw = await env22.BF_PUBLIC.get(`org:${orgId}`);
  const cfg = cfgRaw ? JSON.parse(cfgRaw) : null;
  if (!cfg || !cfg.enabled) return json({ ok: false, needs: [] }, { status: 404 });
  const res = await env22.BF_DB.prepare(
    "SELECT id, title, description, status, priority, created_at FROM needs WHERE org_id = ? AND is_public = 1 ORDER BY created_at DESC"
  ).bind(orgId).all();
  return json({ ok: true, needs: res.results || [], orgId });
}
__name(onRequestGet31, "onRequestGet31");
__name2(onRequestGet31, "onRequestGet");
var ALLOWED_ROLES = /* @__PURE__ */ new Set(["viewer", "member", "admin", "owner"]);
async function ensureMembersSchema(db) {
  try {
    await db.prepare("ALTER TABLE org_memberships ADD COLUMN avatar_url TEXT").run();
  } catch (e) {
    const msg = String(e?.message || e).toLowerCase();
    if (!msg.includes("duplicate column")) throw e;
  }
}
__name(ensureMembersSchema, "ensureMembersSchema");
__name2(ensureMembersSchema, "ensureMembersSchema");
async function readJson3(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
__name(readJson3, "readJson3");
__name2(readJson3, "readJson");
async function countOwners(db, orgId) {
  const row = await db.prepare("SELECT COUNT(*) AS c FROM org_memberships WHERE org_id = ? AND role = 'owner'").bind(orgId).first();
  return Number(row?.c || 0);
}
__name(countOwners, "countOwners");
__name2(countOwners, "countOwners");
async function onRequest6(ctx) {
  const { request, env: env22, params } = ctx;
  const orgId = params.orgId;
  const db = getDb(env22);
  if (!db) return bad(500, "NO_DB_BINDING");
  await ensureZkSchema(db);
  await ensureMembersSchema(db);
  const gate = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!gate.ok) return gate.resp;
  try {
    if (request.method === "GET") {
      const url = new URL(request.url);
      const allowPlaintext = (url.searchParams.get("plaintext") || "") === "1";
      const rows = await db.prepare(
        `SELECT
             u.id AS user_id,
             u.email AS email,
             u.name AS name,
             u.public_key AS public_key,
             m.role AS role,
             m.created_at AS created_at,
             m.encrypted_blob AS encrypted_blob,
             m.key_version AS key_version,
             m.avatar_url AS avatar_url
           FROM org_memberships m
           JOIN users u ON u.id = m.user_id
           WHERE m.org_id = ?
           ORDER BY
             CASE m.role
               WHEN 'owner' THEN 0
               WHEN 'admin' THEN 1
               WHEN 'member' THEN 2
               ELSE 3
             END,
             lower(u.email) ASC
           LIMIT 200`
      ).bind(orgId).all();
      return ok({
        meUserId: gate.user.sub,
        members: (rows.results || []).map((r) => {
          const hasEnc = !!r.encrypted_blob;
          return {
            userId: r.user_id,
            user_id: r.user_id,
            // Default: do not ship plaintext PII.
            // For one-time backfill/encrypt-existing, caller can use ?plaintext=1.
            email: allowPlaintext ? r.email || "" : hasEnc ? "__encrypted__" : "",
            publicKey: r.public_key || null,
            public_key: r.public_key || null,
            name: allowPlaintext ? r.name || "" : hasEnc ? "__encrypted__" : "",
            role: r.role || "member",
            createdAt: r.created_at || null,
            encrypted_blob: r.encrypted_blob || null,
            key_version: r.key_version ?? null,
            needs_encryption: !hasEnc,
            avatar_url: r.avatar_url || null,
            is_self: String(r.user_id) === String(gate.user.sub)
          };
        })
      });
    }
    if (request.method === "PUT") {
      const body = await readJson3(request);
      const userId = String(body.userId || "").trim();
      const role = body.role !== void 0 ? String(body.role || "").trim() : "";
      const encryptedBlob = body.encrypted_blob ? String(body.encrypted_blob) : "";
      const keyVersion = body.key_version != null ? Number(body.key_version) : null;
      const avatarUrl = body.avatar_url !== void 0 ? String(body.avatar_url || "").trim() || null : void 0;
      if (!userId) return bad(400, "MISSING_USER_ID");
      const hasRoleUpdate = body.role !== void 0;
      const hasZkUpdate = !!encryptedBlob;
      const hasAvatarUpdate = body.avatar_url !== void 0;
      if (!hasRoleUpdate && !hasZkUpdate && !hasAvatarUpdate) return bad(400, "MISSING_UPDATE");
      if (hasRoleUpdate && !ALLOWED_ROLES.has(role)) return bad(400, "INVALID_ROLE");
      const isSelf = String(userId) === String(gate.user.sub);
      const isAdminish = gate.role === "admin" || gate.role === "owner";
      const target = await db.prepare("SELECT role FROM org_memberships WHERE org_id = ? AND user_id = ?").bind(orgId, userId).first();
      if (!target) return bad(404, "MEMBERSHIP_NOT_FOUND");
      const targetRole = String(target.role || "member");
      if (hasRoleUpdate) {
        if (!isAdminish) return bad(403, "ADMIN_REQUIRED");
        if (role === "owner" && gate.role !== "owner") return bad(403, "OWNER_REQUIRED");
        if (targetRole === "owner" && role !== "owner") {
          if (gate.role !== "owner") return bad(403, "OWNER_REQUIRED");
          const owners = await countOwners(db, orgId);
          if (owners <= 1) return bad(400, "CANNOT_DEMOTE_LAST_OWNER");
        }
        await db.prepare("UPDATE org_memberships SET role = ? WHERE org_id = ? AND user_id = ?").bind(role, orgId, userId).run();
      }
      if (hasAvatarUpdate) {
        if (!isSelf && !isAdminish) return bad(403, "ADMIN_REQUIRED");
        await db.prepare("UPDATE org_memberships SET avatar_url = ? WHERE org_id = ? AND user_id = ?").bind(avatarUrl, orgId, userId).run();
      }
      if (hasZkUpdate) {
        if (!isSelf && !isAdminish) return bad(403, "ADMIN_REQUIRED");
        await db.prepare(
          "UPDATE org_memberships SET encrypted_blob = ?, key_version = COALESCE(?, key_version) WHERE org_id = ? AND user_id = ?"
        ).bind(encryptedBlob, keyVersion, orgId, userId).run();
      }
      return ok({ updated: true, updated_role: hasRoleUpdate, updated_zk: hasZkUpdate });
    }
    if (request.method === "DELETE") {
      const body = await readJson3(request);
      const userId = String(body.userId || "").trim();
      if (!userId) return bad(400, "MISSING_USER_ID");
      if (gate.role !== "admin" && gate.role !== "owner") return bad(403, "ADMIN_REQUIRED");
      const target = await db.prepare("SELECT role FROM org_memberships WHERE org_id = ? AND user_id = ?").bind(orgId, userId).first();
      if (!target) return bad(404, "MEMBERSHIP_NOT_FOUND");
      const targetRole = String(target.role || "member");
      if (targetRole === "owner") {
        if (gate.role !== "owner") return bad(403, "OWNER_REQUIRED");
        const owners = await countOwners(db, orgId);
        if (owners <= 1) return bad(400, "CANNOT_REMOVE_LAST_OWNER");
      }
      await db.prepare("DELETE FROM org_memberships WHERE org_id = ? AND user_id = ?").bind(orgId, userId).run();
      return ok({ deleted: true });
    }
    return bad(405, "METHOD_NOT_ALLOWED");
  } catch (e) {
    return bad(500, e?.message || "MEMBERS_ERROR");
  }
}
__name(onRequest6, "onRequest6");
__name2(onRequest6, "onRequest");
async function onRequest7(ctx) {
  const { params, env: env22, request } = ctx;
  const db = getDB(env22);
  if (!db) return err(500, "DB_NOT_CONFIGURED");
  const orgId = String(params?.orgId || "").trim();
  if (!orgId) return err(400, "BAD_ORG_ID");
  const method = (request.method || "GET").toUpperCase();
  if (method === "GET") {
    const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
    if (!auth.ok) return auth.resp;
    const r = await db.prepare(
      "SELECT enabled, list_address, blurb FROM newsletter_settings WHERE org_id = ? LIMIT 1"
    ).bind(orgId).first();
    return ok({
      newsletter: {
        enabled: !!(r?.enabled ?? 0),
        list_address: r?.list_address || "",
        blurb: r?.blurb || ""
      }
    });
  }
  if (method === "PUT") {
    const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "admin" });
    if (!auth.ok) return auth.resp;
    const body = await request.json().catch(() => ({}));
    const enabled = !!body.enabled;
    const list_address = String(body.list_address || "").trim();
    const blurb = String(body.blurb || "").trim();
    const updated_at = Date.now();
    const updated_by = getUserIdFromRequest(request) || "";
    await db.prepare(
      "INSERT INTO newsletter_settings (org_id, enabled, list_address, blurb, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(org_id) DO UPDATE SET enabled = excluded.enabled, list_address = excluded.list_address, blurb = excluded.blurb, updated_at = excluded.updated_at"
    ).bind(orgId, enabled ? 1 : 0, list_address, blurb, updated_at).run();
    return ok({
      newsletter: { enabled, list_address, blurb },
      updated_by
    });
  }
  return err(405, "METHOD_NOT_ALLOWED");
}
__name(onRequest7, "onRequest7");
__name2(onRequest7, "onRequest");
async function ensurePledgesTable(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS pledges (
        id TEXT PRIMARY KEY,
        org_id TEXT NOT NULL,
        need_id TEXT NULL,
        title TEXT NOT NULL,
        description TEXT NULL,
        qty REAL NULL,
        unit TEXT NULL,
        contact TEXT NULL,
        is_public INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`
  ).run();
  await db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_pledges_org_created
       ON pledges(org_id, created_at DESC)`
  ).run();
  const adds = [
    "ALTER TABLE pledges ADD COLUMN pledger_name TEXT",
    "ALTER TABLE pledges ADD COLUMN pledger_email TEXT",
    "ALTER TABLE pledges ADD COLUMN type TEXT",
    "ALTER TABLE pledges ADD COLUMN amount REAL",
    "ALTER TABLE pledges ADD COLUMN note TEXT",
    "ALTER TABLE pledges ADD COLUMN status TEXT DEFAULT 'offered'"
  ];
  for (const sql of adds) {
    try {
      await db.prepare(sql).run();
    } catch (e) {
      const msg = String(e?.message || e);
      if (!msg.toLowerCase().includes("duplicate") && !msg.toLowerCase().includes("exists")) {
        throw e;
      }
    }
  }
}
__name(ensurePledgesTable, "ensurePledgesTable");
__name2(ensurePledgesTable, "ensurePledgesTable");
async function bumpNeedToInProgress(db, orgId, needId) {
  if (!needId) return;
  await db.prepare(
    `UPDATE needs
       SET status='in_progress', updated_at=?
       WHERE id=? AND org_id=? AND (status IS NULL OR status='open')`
  ).bind(Date.now(), needId, orgId).run();
}
__name(bumpNeedToInProgress, "bumpNeedToInProgress");
__name2(bumpNeedToInProgress, "bumpNeedToInProgress");
function now2() {
  return Date.now();
}
__name(now2, "now2");
__name2(now2, "now");
function uuid2() {
  return crypto.randomUUID();
}
__name(uuid2, "uuid2");
__name2(uuid2, "uuid");
function toStr(v, max) {
  const s = String(v ?? "").trim();
  return max ? s.slice(0, max) : s;
}
__name(toStr, "toStr");
__name2(toStr, "toStr");
function toNumOrNull(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
__name(toNumOrNull, "toNumOrNull");
__name2(toNumOrNull, "toNumOrNull");
function boolToInt(v) {
  return v ? 1 : 0;
}
__name(boolToInt, "boolToInt");
__name2(boolToInt, "boolToInt");
function normalizeLegacyContact(name, email) {
  const n = toStr(name, 120);
  const e = toStr(email, 160);
  if (n && e) return `${n} ${e}`;
  return n || e || null;
}
__name(normalizeLegacyContact, "normalizeLegacyContact");
__name2(normalizeLegacyContact, "normalizeLegacyContact");
async function listPledges(db, orgId) {
  const r = await db.prepare(
    `SELECT
         id, org_id, need_id,
         title, description, qty, unit, contact,
         is_public, created_at, updated_at,
         pledger_name, pledger_email, type, amount, note, status
       FROM pledges
       WHERE org_id=?
       ORDER BY created_at DESC`
  ).bind(orgId).all();
  const rows = r.results || [];
  return rows.map((p) => {
    const pledger_name = p.pledger_name ?? null;
    const pledger_email = p.pledger_email ?? null;
    return {
      id: p.id,
      org_id: p.org_id,
      need_id: p.need_id ?? null,
      pledger_name: pledger_name || "",
      pledger_email: pledger_email || "",
      type: (p.type ?? p.title ?? "") || "",
      amount: p.amount != null ? p.amount : p.qty != null ? p.qty : "",
      unit: p.unit ?? "",
      note: (p.note ?? p.description ?? "") || "",
      status: (p.status ?? "offered") || "offered",
      is_public: !!p.is_public,
      created_at: p.created_at,
      updated_at: p.updated_at
    };
  });
}
__name(listPledges, "listPledges");
__name2(listPledges, "listPledges");
async function onRequest8(ctx) {
  const { params, env: env22, request } = ctx;
  const orgId = params.orgId;
  const db = getDB(env22);
  if (!db) return err(500, "DB_NOT_CONFIGURED");
  await ensurePledgesTable(db);
  const gate = await requireOrgRole({ env: env22, request, orgId, minRole: "member" });
  if (!gate.ok) return gate.resp;
  try {
    if (request.method === "GET") {
      const pledges = await listPledges(db, orgId);
      return ok({ pledges });
    }
    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const id = uuid2();
      const t = now2();
      const pledger_name = toStr(body.pledger_name ?? body.name, 120) || null;
      const pledger_email = toStr(body.pledger_email ?? body.email, 160) || null;
      const type = toStr(body.type ?? body.title, 140);
      const amount = toNumOrNull(body.amount ?? body.qty);
      const unit = toStr(body.unit, 64) || null;
      const note = toStr(body.note ?? body.description, 4e3) || null;
      const status = toStr(body.status, 32) || "offered";
      const title22 = type || "";
      const description = note;
      const qty = amount;
      const contact = toStr(body.contact, 256) || normalizeLegacyContact(pledger_name, pledger_email);
      const need_id = body.need_id || null;
      const is_public = boolToInt(body.is_public);
      await db.prepare(
        `INSERT INTO pledges(
             id, org_id, need_id,
             title, description, qty, unit, contact,
             is_public, created_at, updated_at,
             pledger_name, pledger_email, type, amount, note, status
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      ).bind(
        id,
        orgId,
        need_id,
        title22,
        description,
        qty,
        unit,
        contact,
        is_public,
        t,
        t,
        pledger_name,
        pledger_email,
        type || null,
        amount,
        note,
        status
      ).run();
      const pledges = await listPledges(db, orgId);
      return ok({ pledge: { id }, pledges });
    }
    if (request.method === "PUT") {
      const body = await request.json().catch(() => ({}));
      const id = body.id;
      if (!id) return err(400, "MISSING_ID");
      const t = now2();
      const pledger_name = body.pledger_name !== void 0 ? toStr(body.pledger_name, 120) : void 0;
      const pledger_email = body.pledger_email !== void 0 ? toStr(body.pledger_email, 160) : void 0;
      const type = body.type !== void 0 ? toStr(body.type, 140) : void 0;
      const amount = body.amount !== void 0 ? toNumOrNull(body.amount) : void 0;
      const unit = body.unit !== void 0 ? toStr(body.unit, 64) || null : void 0;
      const note = body.note !== void 0 ? toStr(body.note, 4e3) || null : void 0;
      const status = body.status !== void 0 ? toStr(body.status, 32) || "offered" : void 0;
      const need_id = body.need_id !== void 0 || body.needId !== void 0 ? toStr(body.need_id ?? body.needId, 128) || null : void 0;
      const is_public = body.is_public !== void 0 ? boolToInt(body.is_public) : void 0;
      const title22 = type !== void 0 ? type : void 0;
      const description = note !== void 0 ? note : void 0;
      const qty = amount !== void 0 ? amount : void 0;
      const contact = body.contact !== void 0 ? toStr(body.contact, 256) || null : void 0;
      const sets = [];
      const vals = [];
      const add = /* @__PURE__ */ __name2((col, val) => {
        sets.push(`${col}=?`);
        vals.push(val);
      }, "add");
      if (need_id !== void 0) add("need_id", need_id);
      if (unit !== void 0) add("unit", unit);
      if (is_public !== void 0) add("is_public", is_public);
      if (pledger_name !== void 0) add("pledger_name", pledger_name || null);
      if (pledger_email !== void 0) add("pledger_email", pledger_email || null);
      if (type !== void 0) add("type", type || null);
      if (amount !== void 0) add("amount", amount);
      if (note !== void 0) add("note", note);
      if (status !== void 0) add("status", status);
      if (title22 !== void 0) add("title", title22 || "");
      if (description !== void 0) add("description", description);
      if (qty !== void 0) add("qty", qty);
      if (contact !== void 0) add("contact", contact);
      add("updated_at", t);
      if (sets.length === 0) return ok({ pledges: await listPledges(db, orgId) });
      await db.prepare(
        `UPDATE pledges SET ${sets.join(", ")} WHERE id=? AND org_id=?`
      ).bind(...vals, id, orgId).run();
      const nextStatus = status !== void 0 ? String(status || "") : String(body.status || "");
      const isAccepted = nextStatus.toLowerCase() === "accepted";
      if (isAccepted) {
        let resolvedNeedId = need_id !== void 0 ? need_id : body.need_id || null;
        if (!resolvedNeedId) {
          const r = await db.prepare("SELECT need_id FROM pledges WHERE id=? AND org_id=?").bind(id, orgId).first();
          resolvedNeedId = r?.need_id || null;
        }
        await bumpNeedToInProgress(db, orgId, resolvedNeedId);
      }
      const pledges = await listPledges(db, orgId);
      return ok({ pledges });
    }
    if (request.method === "DELETE") {
      let id = null;
      try {
        const body = await request.json();
        id = body?.id || null;
      } catch {
        id = null;
      }
      if (!id) {
        const url = new URL(request.url);
        id = url.searchParams.get("id");
      }
      if (!id) return err(400, "MISSING_ID");
      await db.prepare("DELETE FROM pledges WHERE id=? AND org_id=?").bind(id, orgId).run();
      const pledges = await listPledges(db, orgId);
      return ok({ pledges });
    }
    return err(405, "METHOD_NOT_ALLOWED");
  } catch (e) {
    return err(500, "SERVER_ERROR", { message: String(e?.message || e) });
  }
}
__name(onRequest8, "onRequest8");
__name2(onRequest8, "onRequest");
async function getOrgIdBySlug4(env22, slug) {
  const s = String(slug || "").trim();
  if (!s) return null;
  const orgId = await env22.BF_PUBLIC.get(`slug:${s}`);
  return orgId || null;
}
__name(getOrgIdBySlug4, "getOrgIdBySlug4");
__name2(getOrgIdBySlug4, "getOrgIdBySlug");
async function ensureMeetingsTable(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        org_id TEXT NOT NULL,
        title TEXT NOT NULL,
        starts_at INTEGER NOT NULL,
        ends_at INTEGER NOT NULL,
        location TEXT NULL,
        notes TEXT NULL,
        is_public INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`
  ).run();
  await db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_meetings_org_starts
       ON meetings(org_id, starts_at DESC)`
  ).run();
}
__name(ensureMeetingsTable, "ensureMeetingsTable");
__name2(ensureMeetingsTable, "ensureMeetingsTable");
async function onRequest9(ctx) {
  const { env: env22, request, params } = ctx;
  const slug = params.slug;
  if (request.method !== "GET") return err(405, "METHOD_NOT_ALLOWED");
  const db = getDB(env22);
  if (!db) return err(500, "DB_NOT_CONFIGURED");
  await ensureMeetingsTable(db);
  const orgId = await getOrgIdBySlug4(env22, slug);
  if (!orgId) return err(404, "NOT_FOUND");
  try {
    const r = await db.prepare(
      `SELECT id, org_id, title, starts_at, ends_at, location, notes, is_public, created_at, updated_at
         FROM meetings
         WHERE org_id=? AND is_public=1
         ORDER BY starts_at DESC`
    ).bind(orgId).all();
    return ok({ meetings: r.results || [] });
  } catch (e) {
    return err(500, "SERVER_ERROR", { message: String(e?.message || e) });
  }
}
__name(onRequest9, "onRequest9");
__name2(onRequest9, "onRequest");
async function ensurePledgesTable2(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS pledges (
        id TEXT PRIMARY KEY,
        org_id TEXT NOT NULL,
        need_id TEXT NULL,
        title TEXT NOT NULL,
        description TEXT NULL,
        qty REAL NULL,
        unit TEXT NULL,
        contact TEXT NULL,
        is_public INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`
  ).run();
  await db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_pledges_org_created
       ON pledges(org_id, created_at DESC)`
  ).run();
  const adds = [
    "ALTER TABLE pledges ADD COLUMN pledger_name TEXT",
    "ALTER TABLE pledges ADD COLUMN pledger_email TEXT",
    "ALTER TABLE pledges ADD COLUMN type TEXT",
    "ALTER TABLE pledges ADD COLUMN amount REAL",
    "ALTER TABLE pledges ADD COLUMN note TEXT",
    "ALTER TABLE pledges ADD COLUMN status TEXT DEFAULT 'offered'"
  ];
  for (const sql of adds) {
    try {
      await db.prepare(sql).run();
    } catch (e) {
      const msg = String(e?.message || e);
      if (!msg.toLowerCase().includes("duplicate") && !msg.toLowerCase().includes("exists")) {
        throw e;
      }
    }
  }
}
__name(ensurePledgesTable2, "ensurePledgesTable2");
__name2(ensurePledgesTable2, "ensurePledgesTable");
function now3() {
  return Date.now();
}
__name(now3, "now3");
__name2(now3, "now");
function uuid3() {
  return crypto.randomUUID();
}
__name(uuid3, "uuid3");
__name2(uuid3, "uuid");
function toStr2(v, max) {
  const s = String(v ?? "").trim();
  return max ? s.slice(0, max) : s;
}
__name(toStr2, "toStr2");
__name2(toStr2, "toStr");
function toNumOrNull2(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
__name(toNumOrNull2, "toNumOrNull2");
__name2(toNumOrNull2, "toNumOrNull");
function normalizeLegacyContact2(name, email) {
  const n = toStr2(name, 120);
  const e = toStr2(email, 160);
  if (n && e) return `${n} ${e}`;
  return n || e || null;
}
__name(normalizeLegacyContact2, "normalizeLegacyContact2");
__name2(normalizeLegacyContact2, "normalizeLegacyContact");
async function getOrgIdBySlug5(env22, slug) {
  const s = String(slug || "").trim();
  if (!s) return null;
  const orgId = await env22.BF_PUBLIC.get(`slug:${s}`);
  return orgId || null;
}
__name(getOrgIdBySlug5, "getOrgIdBySlug5");
__name2(getOrgIdBySlug5, "getOrgIdBySlug");
async function onRequest10(ctx) {
  const { env: env22, request, params } = ctx;
  const slug = params.slug;
  const db = getDB(env22);
  if (!db) return err(500, "DB_NOT_CONFIGURED");
  await ensurePledgesTable2(db);
  const orgId = await getOrgIdBySlug5(env22, slug);
  if (!orgId) return err(404, "NOT_FOUND");
  try {
    if (request.method !== "POST") return err(405, "METHOD_NOT_ALLOWED");
    const body = await request.json().catch(() => ({}));
    const pledger_name = toStr2(body.name ?? body.pledger_name, 120) || null;
    const pledger_email = toStr2(body.email ?? body.pledger_email, 160) || null;
    const type = toStr2(body.type ?? body.title, 140);
    const amount = toNumOrNull2(body.amount);
    const unit = toStr2(body.unit, 64) || null;
    const note = toStr2(body.note, 4e3) || null;
    if (!type) return err(400, "MISSING_TYPE");
    const t = now3();
    const id = uuid3();
    const title22 = type;
    const description = note;
    const qty = amount;
    const contact = normalizeLegacyContact2(pledger_name, pledger_email);
    const need_id = toStr2(body.needId ?? body.need_id, 128) || null;
    await db.prepare(
      `INSERT INTO pledges(
         id, org_id, need_id,
         title, description, qty, unit, contact,
         is_public, created_at, updated_at,
         pledger_name, pledger_email, type, amount, note, status
       ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      id,
      orgId,
      need_id,
      title22,
      description,
      qty,
      unit,
      contact,
      1,
      t,
      t,
      pledger_name,
      pledger_email,
      type || null,
      amount,
      note,
      "offered"
    ).run();
    return ok({ id });
  } catch (e) {
    return err(500, "SERVER_ERROR", { message: String(e?.message || e) });
  }
}
__name(onRequest10, "onRequest10");
__name2(onRequest10, "onRequest");
async function onRequestGet32({ env: env22, request }) {
  const auth = await requireUser({ env: env22, request });
  if (!auth.ok) return auth.resp;
  const userId = auth.user?.sub;
  if (!userId) return bad(401, "UNAUTHORIZED");
  const db = getDb(env22);
  const row = await db.prepare("SELECT public_key FROM users WHERE id = ?").bind(userId).first();
  return json({ ok: true, public_key: row?.public_key || null });
}
__name(onRequestGet32, "onRequestGet32");
__name2(onRequestGet32, "onRequestGet");
async function onRequestPost28({ env: env22, request }) {
  const auth = await requireUser({ env: env22, request });
  if (!auth.ok) return auth.resp;
  const userId = auth.user?.sub;
  if (!userId) return bad(401, "UNAUTHORIZED");
  requireMethod(request, "POST");
  const body = await readJSON(request);
  const publicKey = String(body?.public_key || "");
  if (!publicKey) return bad(400, "MISSING_PUBLIC_KEY");
  const db = getDb(env22);
  await db.prepare("UPDATE users SET public_key = ? WHERE id = ?").bind(publicKey, userId).run();
  return json({ ok: true });
}
__name(onRequestPost28, "onRequestPost28");
__name2(onRequestPost28, "onRequestPost");
function fromB64(s) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
__name(fromB64, "fromB64");
__name2(fromB64, "fromB64");
async function verifyPass(pass, stored) {
  const raw = fromB64(stored);
  const salt = raw.slice(0, 16);
  const expected = raw.slice(16);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pass),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" },
    key,
    256
  );
  const got = new Uint8Array(bits);
  if (got.length !== expected.length) return false;
  for (let i = 0; i < got.length; i++) if (got[i] !== expected[i]) return false;
  return true;
}
__name(verifyPass, "verifyPass");
__name2(verifyPass, "verifyPass");
async function onRequestPost29({ env: env22, request }) {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "";
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const rl = await rateLimit({ env: env22, key: `login:${ip}:${email}`, limit: 12, windowSec: 600 });
  if (!rl.ok) return bad(429, "RATE_LIMIT", { retry_after: rl.retry_after });
  const user = await env22.BF_DB.prepare(
    "SELECT id, email, name, password_hash FROM users WHERE email = ?"
  ).bind(email).first();
  if (!user) return bad(401, "INVALID_LOGIN");
  const ok2 = await verifyPass(password, user.password_hash);
  if (!ok2) return bad(401, "INVALID_LOGIN");
  const mfa = await env22.BF_DB.prepare(
    "SELECT mfa_enabled FROM user_mfa WHERE user_id = ?"
  ).bind(user.id).first();
  if (mfa && Number(mfa.mfa_enabled) === 1) {
    const challengeId = crypto.randomUUID();
    const expiresAt2 = Date.now() + 5 * 60 * 1e3;
    await env22.BF_DB.prepare(
      "INSERT INTO login_mfa_challenges (id, user_id, expires_at, verified) VALUES (?, ?, ?, 0)"
    ).bind(challengeId, user.id, expiresAt2).run();
    return json({
      ok: true,
      mfa_required: true,
      challenge_id: challengeId,
      user: { id: user.id, email: user.email, name: user.name }
    });
  }
  const accessToken = await issueAccessToken(env22, user, 60 * 15);
  const refreshToken = randomToken(32);
  const refreshHash = await sha256Hex2(refreshToken);
  const expiresAt = Date.now() + 1e3 * 60 * 60 * 24 * 30;
  await env22.BF_DB.prepare(
    "INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)"
  ).bind(crypto.randomUUID(), user.id, refreshHash, expiresAt).run();
  const isProd = (env22?.ENV || env22?.NODE_ENV || "").toLowerCase() === "production";
  const setCookies = cookieHeadersForAuth({ accessToken, refreshToken, isProd });
  const resp = json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  for (const c of setCookies) resp.headers.append("set-cookie", c);
  return resp;
}
__name(onRequestPost29, "onRequestPost29");
__name2(onRequestPost29, "onRequestPost");
async function onRequestPost30({ env: env22, request }) {
  const rt = getCookie(request, "bf_rt");
  if (rt && env22?.BF_DB) {
    const h = await sha256Hex2(rt);
    await env22.BF_DB.prepare("DELETE FROM refresh_tokens WHERE token_hash = ?").bind(h).run();
  }
  const isProd = (env22?.ENV || env22?.NODE_ENV || "").toLowerCase() === "production";
  const resp = ok({});
  for (const c of clearAuthCookieHeaders({ isProd })) resp.headers.append("set-cookie", c);
  return resp;
}
__name(onRequestPost30, "onRequestPost30");
__name2(onRequestPost30, "onRequestPost");
async function onRequestPost31({ env: env22, request }) {
  const auth = await requireUser({ env: env22, request });
  if (!auth.ok) return auth.resp;
  const userId = auth.user?.sub;
  if (!userId) return auth.resp;
  const db = getDb(env22);
  await db.prepare("DELETE FROM refresh_tokens WHERE user_id = ?").bind(userId).run();
  const headers = new Headers();
  headers.append("set-cookie", "bf_at=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax");
  headers.append("set-cookie", "bf_rt=; Max-Age=0; Path=/api/auth; Secure; HttpOnly; SameSite=Strict");
  return ok({}, { headers });
}
__name(onRequestPost31, "onRequestPost31");
__name2(onRequestPost31, "onRequestPost");
async function onRequestGet33({ env: env22, request }) {
  const u = await requireUser({ env: env22, request });
  if (!u.ok) return u.resp;
  const row = await env22.BF_DB.prepare(
    "SELECT public_key, zk_enabled FROM users WHERE id = ?"
  ).bind(String(u.user.sub)).first();
  const mfa = await env22.BF_DB.prepare(
    "SELECT mfa_enabled FROM user_mfa WHERE user_id = ?"
  ).bind(String(u.user.sub)).first();
  const { email, name, ...safeUser } = u.user || {};
  return json({
    ok: true,
    user: {
      ...safeUser,
      has_public_key: !!(row && row.public_key),
      zk_enabled: row ? Number(row.zk_enabled || 0) : 0,
      mfa_enabled: mfa ? Number(mfa.mfa_enabled || 0) : 0
    }
  });
}
__name(onRequestGet33, "onRequestGet33");
__name2(onRequestGet33, "onRequestGet");
async function onRequestPost32({ env: env22, request }) {
  const u = await requireUser({ env: env22, request });
  if (!u.ok) return u.resp;
  const body = await request.json().catch(() => ({}));
  const publicKey = body?.public_key;
  const kid = String(body?.kid || "").trim() || crypto.randomUUID();
  if (!publicKey) return bad(400, "MISSING_PUBLIC_KEY");
  let serialized = "";
  try {
    serialized = JSON.stringify(publicKey);
  } catch {
    return bad(400, "INVALID_PUBLIC_KEY");
  }
  await env22.BF_DB.prepare(
    "UPDATE users SET public_key = ? WHERE id = ?"
  ).bind(serialized, String(u.user.sub)).run();
  return ok({ saved: true, kid });
}
__name(onRequestPost32, "onRequestPost32");
__name2(onRequestPost32, "onRequestPost");
async function onRequestPost33({ env: env22, request }) {
  if (!env22?.BF_DB) return bad(500, "BF_DB_MISSING");
  const rt = getCookie(request, "bf_rt");
  if (!rt) return bad(401, "NO_REFRESH");
  const h = await sha256Hex2(rt);
  const row = await env22.BF_DB.prepare(
    "SELECT id, user_id, expires_at FROM refresh_tokens WHERE token_hash = ?"
  ).bind(h).first();
  if (!row) {
    const resp2 = bad(401, "INVALID_REFRESH");
    const isProd2 = (env22?.ENV || env22?.NODE_ENV || "").toLowerCase() === "production";
    for (const c of clearAuthCookieHeaders({ isProd: isProd2 })) resp2.headers.append("set-cookie", c);
    return resp2;
  }
  if (Number(row.expires_at) < Date.now()) {
    await env22.BF_DB.prepare("DELETE FROM refresh_tokens WHERE id = ?").bind(row.id).run();
    const resp2 = bad(401, "REFRESH_EXPIRED");
    const isProd2 = (env22?.ENV || env22?.NODE_ENV || "").toLowerCase() === "production";
    for (const c of clearAuthCookieHeaders({ isProd: isProd2 })) resp2.headers.append("set-cookie", c);
    return resp2;
  }
  const user = await env22.BF_DB.prepare("SELECT id, email, name FROM users WHERE id = ?").bind(row.user_id).first();
  if (!user) return bad(401, "INVALID_USER");
  await env22.BF_DB.prepare("DELETE FROM refresh_tokens WHERE id = ?").bind(row.id).run();
  const newRt = randomToken(32);
  const newHash = await sha256Hex2(newRt);
  const expiresAt = Date.now() + 1e3 * 60 * 60 * 24 * 30;
  await env22.BF_DB.prepare(
    "INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)"
  ).bind(crypto.randomUUID(), user.id, newHash, expiresAt).run();
  const accessToken = await issueAccessToken(env22, user, 60 * 15);
  const isProd = (env22?.ENV || env22?.NODE_ENV || "").toLowerCase() === "production";
  const setCookies = cookieHeadersForAuth({ accessToken, refreshToken: newRt, isProd });
  const resp = ok({ user: { id: user.id, email: user.email, name: user.name } });
  for (const c of setCookies) resp.headers.append("set-cookie", c);
  return resp;
}
__name(onRequestPost33, "onRequestPost33");
__name2(onRequestPost33, "onRequestPost");
var PBKDF2_ITERS = 1e5;
async function hashPass(pass) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pass),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERS, hash: "SHA-256" },
    key,
    256
  );
  const out = new Uint8Array(16 + 32);
  out.set(salt, 0);
  out.set(new Uint8Array(bits), 16);
  return btoa(String.fromCharCode(...out));
}
__name(hashPass, "hashPass");
__name2(hashPass, "hashPass");
async function onRequestPost34({ env: env22, request }) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim();
    const password = String(body.password || "");
    const orgName = String(body.orgName || "").trim() || "My Org";
    if (!email || !password) return bad(400, "MISSING_FIELDS");
    if (!env22.BF_DB) return bad(500, "BF_DB_MISSING");
    if (!env22.JWT_SECRET) return bad(500, "JWT_SECRET_MISSING");
    const exists = await env22.BF_DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (exists) return bad(409, "EMAIL_EXISTS");
    const userId = uuid();
    const orgId = uuid();
    const t = now();
    const passwordHash = await hashPass(password);
    try {
      await env22.BF_DB.batch([
        env22.BF_DB.prepare(
          "INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?,?,?,?,?)"
        ).bind(userId, email, name || "", passwordHash, t),
        env22.BF_DB.prepare(
          "INSERT INTO orgs (id, name, created_at) VALUES (?,?,?)"
        ).bind(orgId, orgName, t),
        env22.BF_DB.prepare(
          "INSERT INTO org_memberships (org_id, user_id, role, created_at) VALUES (?,?,?,?)"
        ).bind(orgId, userId, "owner", t)
      ]);
    } catch (e) {
      console.error("REGISTER_BATCH_FAILED", e);
      const msg = e?.message ? String(e.message) : "REGISTER_FAILED";
      return bad(500, msg);
    }
    const user = { id: userId, email, name: name || "" };
    const accessToken = await issueAccessToken(env22, user, 60 * 15);
    const refreshToken = randomToken(32);
    const refreshHash = await sha256Hex2(refreshToken);
    const expiresAt = Date.now() + 1e3 * 60 * 60 * 24 * 30;
    await env22.BF_DB.prepare(
      "INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)"
    ).bind(crypto.randomUUID(), userId, refreshHash, expiresAt).run();
    const isProd = (env22?.ENV || env22?.NODE_ENV || "").toLowerCase() === "production";
    const setCookies = cookieHeadersForAuth({ accessToken, refreshToken, isProd });
    const resp = json({
      ok: true,
      user,
      org: { id: orgId, name: orgName, role: "owner" }
    });
    for (const c of setCookies) resp.headers.append("set-cookie", c);
    return resp;
  } catch (e) {
    console.error("REGISTER_THROW", e);
    const msg = e?.message ? String(e.message) : "REGISTER_FAILED";
    return bad(500, msg);
  }
}
__name(onRequestPost34, "onRequestPost34");
__name2(onRequestPost34, "onRequestPost");
async function onRequestGet34({ env: env22, request }) {
  const auth = await requireUser({ env: env22, request });
  if (!auth.ok) return auth.resp;
  const userId = auth.user?.sub;
  if (!userId) return json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  const db = getDb(env22);
  const rows = await db.prepare(
    "SELECT id, expires_at FROM refresh_tokens WHERE user_id = ? ORDER BY expires_at DESC LIMIT 20"
  ).bind(userId).all();
  return json({ ok: true, sessions: rows?.results || [] });
}
__name(onRequestGet34, "onRequestGet34");
__name2(onRequestGet34, "onRequestGet");
async function onRequestPost35({ request, env: env22 }) {
  if (!env22.JWT_SECRET) return bad(500, "JWT_SECRET_MISSING");
  const u = await requireUser({ env: env22, request });
  if (!u.ok) return u.resp;
  const userId = u.user?.sub || u.user?.userId || u.user?.id;
  if (!userId) return bad(401, "UNAUTHORIZED");
  const db = getDb(env22);
  if (!db) return bad(500, "NO_DB_BINDING");
  const body = await request.json().catch(() => ({}));
  const cleanCode = String(body.code || "").trim().toUpperCase();
  if (!cleanCode) return json({ ok: false, error: "Missing invite code" }, 400);
  try {
    const invite = await db.prepare("SELECT * FROM invites WHERE code = ?").bind(cleanCode).first();
    if (!invite) {
      return json({ ok: false, error: "Invalid invite code" }, 400);
    }
    if (invite.expires_at && Date.now() > invite.expires_at) {
      return json({ ok: false, error: "Invite expired" }, 400);
    }
    if (invite.max_uses && invite.uses >= invite.max_uses) {
      return json({ ok: false, error: "Invite exhausted" }, 400);
    }
    const role = String(invite.role || "member");
    await db.prepare(
      `INSERT OR IGNORE INTO org_memberships
         (org_id, user_id, role, created_at)
         VALUES (?, ?, ?, ?)`
    ).bind(invite.org_id, userId, role, Date.now()).run();
    await db.prepare("UPDATE invites SET uses = uses + 1 WHERE code = ?").bind(cleanCode).run();
    const org = await db.prepare("SELECT id, name FROM orgs WHERE id = ?").bind(invite.org_id).first();
    return json({
      ok: true,
      org: org ? { id: org.id, name: org.name } : { id: invite.org_id },
      membership: { role }
    });
  } catch (e) {
    return bad(500, e?.message || "INVITE_REDEEM_ERROR");
  }
}
__name(onRequestPost35, "onRequestPost35");
__name2(onRequestPost35, "onRequestPost");
async function onRequestPost36({ request, env: env22 }) {
  if (!env22.JWT_SECRET) return bad(500, "JWT_SECRET_MISSING");
  const u = await requireUser({ env: env22, request });
  if (!u.ok) return u.resp;
  const meId = u.user?.sub || u.user?.id || u.user?.userId;
  if (!meId) return bad(401, "UNAUTHORIZED");
  const db = getDb(env22);
  if (!db) return bad(500, "NO_DB_BINDING");
  const body = await request.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  if (!name) return bad(400, "Missing org name");
  const orgId = uuid();
  const t = now();
  await db.prepare("INSERT INTO orgs (id, name, created_at) VALUES (?, ?, ?)").bind(orgId, name, t).run();
  await db.prepare(
    "INSERT INTO org_memberships (org_id, user_id, role, created_at) VALUES (?, ?, ?, ?)"
  ).bind(orgId, meId, "owner", t).run();
  return json({ ok: true, org: { id: orgId, name }, membership: { role: "owner" } });
}
__name(onRequestPost36, "onRequestPost36");
__name2(onRequestPost36, "onRequestPost");
async function onRequestGet35(context22) {
  const { request, env: env22 } = context22;
  const apiKey = env22.PIXABAY_API_KEY || env22.VITE_PIXABAY_API_KEY;
  if (!apiKey) {
    return json5({ error: "Missing PIXABAY_API_KEY on server" }, 500);
  }
  const incoming = new URL(request.url);
  const query = incoming.searchParams.get("q") || "community";
  const url = new URL("https://pixabay.com/api/");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("image_type", "photo");
  url.searchParams.set("safesearch", "true");
  url.searchParams.set("per_page", "24");
  const response = await fetch(url.toString(), {
    headers: { "Accept": "application/json" }
  });
  if (!response.ok) {
    return json5({ error: `Pixabay request failed (${response.status})` }, response.status);
  }
  const data = await response.json();
  const results = Array.isArray(data?.hits) ? data.hits.map((item) => ({
    id: String(item.id),
    name: item.tags || `Pixabay ${item.id}`,
    previewUrl: item.webformatURL || item.previewURL,
    fullUrl: item.largeImageURL || item.webformatURL || item.previewURL,
    width: item.imageWidth || 1600,
    height: item.imageHeight || 900,
    tags: item.tags || ""
  })) : [];
  return json5({ results });
}
__name(onRequestGet35, "onRequestGet35");
__name2(onRequestGet35, "onRequestGet");
function json5(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
__name(json5, "json5");
__name2(json5, "json");
async function onRequestDelete13({ env: env22, request, params }) {
  const orgId = params?.orgId;
  if (!orgId) return bad(400, "MISSING_ORG_ID");
  const auth = await requireOrgRole({ env: env22, request, orgId, minRole: "owner" });
  if (!auth.ok) return auth.resp;
  const db = getDb(env22);
  if (!db) return bad(500, "NO_DB_BINDING");
  await db.prepare("DELETE FROM org_memberships WHERE org_id = ?").bind(orgId).run();
  const delOrg = await db.prepare("DELETE FROM orgs WHERE id = ?").bind(orgId).run();
  return json({ ok: true, deleted: true, orgId });
}
__name(onRequestDelete13, "onRequestDelete13");
__name2(onRequestDelete13, "onRequestDelete");
async function onRequestGet36({ env: env22, params }) {
  const slug = params.slug;
  const orgId = await env22.BF_PUBLIC.get(`slug:${slug}`);
  if (!orgId) {
    return Response.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  }
  const cfgRaw = await env22.BF_PUBLIC.get(`org:${orgId}`);
  const cfg = cfgRaw ? JSON.parse(cfgRaw) : null;
  if (!cfg || !cfg.enabled) {
    return Response.json({ ok: false, error: "NOT_PUBLIC" }, { status: 404 });
  }
  return Response.json({ ok: true, public: cfg, orgId });
}
__name(onRequestGet36, "onRequestGet36");
__name2(onRequestGet36, "onRequestGet");
async function onRequestGet37() {
  return Response.json({
    ok: true,
    service: "bondfire-api",
    ts: Date.now()
  });
}
__name(onRequestGet37, "onRequestGet37");
__name2(onRequestGet37, "onRequestGet");
async function onRequestGet38({ env: env22, request }) {
  if (!env22.JWT_SECRET) return bad(500, "JWT_SECRET_MISSING");
  const u = await requireUser({ env: env22, request });
  if (!u.ok) return u.resp;
  const userId = u.user?.sub || u.user?.id || u.user?.userId;
  if (!userId) return bad(401, "UNAUTHORIZED");
  const db = getDb(env22);
  if (!db) return bad(500, "NO_DB_BINDING");
  const res = await db.prepare(
    `SELECT o.id as id, o.name as name, m.role as role
       FROM org_memberships m
       JOIN orgs o ON o.id = m.org_id
       WHERE m.user_id = ?
       ORDER BY o.created_at DESC`
  ).bind(String(userId)).all();
  return json({ ok: true, orgs: res.results || [] });
}
__name(onRequestGet38, "onRequestGet38");
__name2(onRequestGet38, "onRequestGet");
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS"
};
function withCors(resp) {
  const h = new Headers(resp.headers);
  for (const [k, v] of Object.entries(CORS_HEADERS)) h.set(k, v);
  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: h
  });
}
__name(withCors, "withCors");
__name2(withCors, "withCors");
function json6(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS
    }
  });
}
__name(json6, "json6");
__name2(json6, "json");
async function onRequest11(context22) {
  const { request, params } = context22;
  const segments = Array.isArray(params?.path) ? params.path : typeof params?.path === "string" ? params.path.split("/").filter(Boolean) : [];
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (segments.length === 3 && segments[0] === "orgs" && segments[2] === "invites") {
    const orgId = decodeURIComponent(segments[1] || "");
    const ctx2 = { ...context22, params: { ...context22.params || {}, orgId } };
    if (request.method === "GET") return withCors(await onRequestGet24(ctx2));
    if (request.method === "POST") return withCors(await onRequestPost22(ctx2));
    return json6({ ok: false, error: "Method not allowed" }, 405);
  }
  if (segments.length === 2 && segments[0] === "invites" && segments[1] === "redeem") {
    if (request.method === "POST") return withCors(await onRequestPost35(context22));
    return json6({ ok: false, error: "Method not allowed" }, 405);
  }
  return json6(
    { ok: false, error: "Not found", path: "/" + segments.join("/") },
    404
  );
}
__name(onRequest11, "onRequest11");
__name2(onRequest11, "onRequest");
function getOrigin(request) {
  const o = request.headers.get("origin");
  return o || "";
}
__name(getOrigin, "getOrigin");
__name2(getOrigin, "getOrigin");
function corsHeaders(request) {
  const origin = getOrigin(request);
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "authorization, content-type, x-csrf",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Vary": "Origin"
  };
}
__name(corsHeaders, "corsHeaders");
__name2(corsHeaders, "corsHeaders");
var SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  // CSP tuned for this app (React inline styles are used heavily).
  // If you later remove inline styles, drop 'unsafe-inline'.
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: wss:;",
  // Keep it boring.
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
};
async function onRequest12({ request, next }) {
  const CORS_HEADERS2 = corsHeaders(request);
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS2 });
  }
  try {
    const resp = await next();
    const headers = new Headers(resp.headers);
    for (const [k, v] of Object.entries(CORS_HEADERS2)) headers.set(k, v);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
      if (!headers.has(k)) headers.set(k, v);
    }
    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers
    });
  } catch (e) {
    const headers = new Headers({
      "content-type": "application/json; charset=utf-8",
      ...CORS_HEADERS2
    });
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
    const detail = e && (e.message || String(e)) || "Unknown error";
    return new Response(JSON.stringify({ ok: false, error: "INTERNAL", detail }), {
      status: 500,
      headers
    });
  }
}
__name(onRequest12, "onRequest12");
__name2(onRequest12, "onRequest");
var routes = [
  {
    routePath: "/api/orgs/:orgId/drive/files/:id/download",
    mountPath: "/api/orgs/:orgId/drive/files/:id",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/orgs/:orgId/drive/files/:id",
    mountPath: "/api/orgs/:orgId/drive/files",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/orgs/:orgId/drive/files/:id",
    mountPath: "/api/orgs/:orgId/drive/files",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/orgs/:orgId/drive/files/:id",
    mountPath: "/api/orgs/:orgId/drive/files",
    method: "PATCH",
    middlewares: [],
    modules: [onRequestPatch]
  },
  {
    routePath: "/api/orgs/:orgId/drive/folders/:id",
    mountPath: "/api/orgs/:orgId/drive/folders",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete2]
  },
  {
    routePath: "/api/orgs/:orgId/drive/folders/:id",
    mountPath: "/api/orgs/:orgId/drive/folders",
    method: "PATCH",
    middlewares: [],
    modules: [onRequestPatch2]
  },
  {
    routePath: "/api/orgs/:orgId/drive/notes/:id",
    mountPath: "/api/orgs/:orgId/drive/notes",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete3]
  },
  {
    routePath: "/api/orgs/:orgId/drive/notes/:id",
    mountPath: "/api/orgs/:orgId/drive/notes",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/orgs/:orgId/drive/notes/:id",
    mountPath: "/api/orgs/:orgId/drive/notes",
    method: "PATCH",
    middlewares: [],
    modules: [onRequestPatch3]
  },
  {
    routePath: "/api/orgs/:orgId/drive/templates/:id",
    mountPath: "/api/orgs/:orgId/drive/templates",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete4]
  },
  {
    routePath: "/api/orgs/:orgId/drive/templates/:id",
    mountPath: "/api/orgs/:orgId/drive/templates",
    method: "PATCH",
    middlewares: [],
    modules: [onRequestPatch4]
  },
  {
    routePath: "/api/p/:slug/meetings/:meetingId/rsvp",
    mountPath: "/api/p/:slug/meetings/:meetingId",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/orgs/:orgId/meetings/:meetingId/rsvp",
    mountPath: "/api/orgs/:orgId/meetings/:meetingId",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/orgs/:orgId/drive/files",
    mountPath: "/api/orgs/:orgId/drive",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/orgs/:orgId/drive/files",
    mountPath: "/api/orgs/:orgId/drive",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/orgs/:orgId/drive/folders",
    mountPath: "/api/orgs/:orgId/drive",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/orgs/:orgId/drive/folders",
    mountPath: "/api/orgs/:orgId/drive",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/orgs/:orgId/drive/import",
    mountPath: "/api/orgs/:orgId/drive",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/orgs/:orgId/drive/notes",
    mountPath: "/api/orgs/:orgId/drive",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/api/orgs/:orgId/drive/notes",
    mountPath: "/api/orgs/:orgId/drive",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/orgs/:orgId/drive/templates",
    mountPath: "/api/orgs/:orgId/drive",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet7]
  },
  {
    routePath: "/api/orgs/:orgId/drive/templates",
    mountPath: "/api/orgs/:orgId/drive",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  },
  {
    routePath: "/api/orgs/:orgId/newsletter/subscribers",
    mountPath: "/api/orgs/:orgId/newsletter",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete5]
  },
  {
    routePath: "/api/orgs/:orgId/newsletter/subscribers",
    mountPath: "/api/orgs/:orgId/newsletter",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet8]
  },
  {
    routePath: "/api/orgs/:orgId/newsletter/subscribers",
    mountPath: "/api/orgs/:orgId/newsletter",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost7]
  },
  {
    routePath: "/api/orgs/:orgId/public/generate",
    mountPath: "/api/orgs/:orgId/public",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost8]
  },
  {
    routePath: "/api/orgs/:orgId/public/get",
    mountPath: "/api/orgs/:orgId/public",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet9]
  },
  {
    routePath: "/api/orgs/:orgId/public/inbox",
    mountPath: "/api/orgs/:orgId/public",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet10]
  },
  {
    routePath: "/api/orgs/:orgId/public/inbox",
    mountPath: "/api/orgs/:orgId/public",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut]
  },
  {
    routePath: "/api/orgs/:orgId/public/save",
    mountPath: "/api/orgs/:orgId/public",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost9]
  },
  {
    routePath: "/api/orgs/:orgId/studio/state",
    mountPath: "/api/orgs/:orgId/studio",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet11]
  },
  {
    routePath: "/api/orgs/:orgId/studio/state",
    mountPath: "/api/orgs/:orgId/studio",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost10]
  },
  {
    routePath: "/api/orgs/:orgId/studio/updates",
    mountPath: "/api/orgs/:orgId/studio",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet12]
  },
  {
    routePath: "/api/orgs/:orgId/zk/recovery",
    mountPath: "/api/orgs/:orgId/zk",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete6]
  },
  {
    routePath: "/api/orgs/:orgId/zk/recovery",
    mountPath: "/api/orgs/:orgId/zk",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet13]
  },
  {
    routePath: "/api/orgs/:orgId/zk/recovery",
    mountPath: "/api/orgs/:orgId/zk",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost11]
  },
  {
    routePath: "/api/orgs/:orgId/zk/rotate",
    mountPath: "/api/orgs/:orgId/zk",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost12]
  },
  {
    routePath: "/api/orgs/:orgId/zk/status",
    mountPath: "/api/orgs/:orgId/zk",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet14]
  },
  {
    routePath: "/api/orgs/:orgId/zk/wrap",
    mountPath: "/api/orgs/:orgId/zk",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost13]
  },
  {
    routePath: "/api/orgs/:orgId/zk/wrapped",
    mountPath: "/api/orgs/:orgId/zk",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet15]
  },
  {
    routePath: "/api/p/:slug/newsletter/subscribe",
    mountPath: "/api/p/:slug/newsletter",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost14]
  },
  {
    routePath: "/api/orgs/:orgId/newsletter/subscribe",
    mountPath: "/api/orgs/:orgId/newsletter",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/orgs/:orgId/meetings/:meetingId",
    mountPath: "/api/orgs/:orgId/meetings",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete7]
  },
  {
    routePath: "/api/orgs/:orgId/meetings/:meetingId",
    mountPath: "/api/orgs/:orgId/meetings",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet16]
  },
  {
    routePath: "/api/orgs/:orgId/meetings/:meetingId",
    mountPath: "/api/orgs/:orgId/meetings",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut2]
  },
  {
    routePath: "/api/auth/login/mfa",
    mountPath: "/api/auth/login",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost15]
  },
  {
    routePath: "/api/auth/mfa/disable",
    mountPath: "/api/auth/mfa",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost16]
  },
  {
    routePath: "/api/matrix/e2ee/get",
    mountPath: "/api/matrix/e2ee",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet17]
  },
  {
    routePath: "/api/matrix/e2ee/put",
    mountPath: "/api/matrix/e2ee",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost17]
  },
  {
    routePath: "/api/auth/mfa/confirm",
    mountPath: "/api/auth/mfa",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  },
  {
    routePath: "/api/auth/mfa/setup",
    mountPath: "/api/auth/mfa",
    method: "",
    middlewares: [],
    modules: [onRequest4]
  },
  {
    routePath: "/api/public/forms/:id",
    mountPath: "/api/public/forms",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet18]
  },
  {
    routePath: "/api/public/forms/:id",
    mountPath: "/api/public/forms",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost18]
  },
  {
    routePath: "/api/orgs/:orgId/activity",
    mountPath: "/api/orgs/:orgId",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet19]
  },
  {
    routePath: "/api/orgs/:orgId/activity",
    mountPath: "/api/orgs/:orgId",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost19]
  },
  {
    routePath: "/api/orgs/:orgId/crypto",
    mountPath: "/api/orgs/:orgId",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet20]
  },
  {
    routePath: "/api/orgs/:orgId/crypto",
    mountPath: "/api/orgs/:orgId",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost20]
  },
  {
    routePath: "/api/orgs/:orgId/dashboard",
    mountPath: "/api/orgs/:orgId",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet21]
  },
  {
    routePath: "/api/orgs/:orgId/drive",
    mountPath: "/api/orgs/:orgId/drive",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet22]
  },
  {
    routePath: "/api/orgs/:orgId/inventory",
    mountPath: "/api/orgs/:orgId",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete8]
  },
  {
    routePath: "/api/orgs/:orgId/inventory",
    mountPath: "/api/orgs/:orgId",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet23]
  },
  {
    routePath: "/api/orgs/:orgId/inventory",
    mountPath: "/api/orgs/:orgId",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost21]
  },
  {
    routePath: "/api/orgs/:orgId/inventory",
    mountPath: "/api/orgs/:orgId",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut3]
  },
  {
    routePath: "/api/orgs/:orgId/invites",
    mountPath: "/api/orgs/:orgId",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet24]
  },
  {
    routePath: "/api/orgs/:orgId/invites",
    mountPath: "/api/orgs/:orgId",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost22]
  },
  {
    routePath: "/api/orgs/:orgId/meetings",
    mountPath: "/api/orgs/:orgId",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete9]
  },
  {
    routePath: "/api/orgs/:orgId/meetings",
    mountPath: "/api/orgs/:orgId",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet25]
  },
  {
    routePath: "/api/orgs/:orgId/meetings",
    mountPath: "/api/orgs/:orgId",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost23]
  },
  {
    routePath: "/api/orgs/:orgId/meetings",
    mountPath: "/api/orgs/:orgId",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut4]
  },
  {
    routePath: "/api/orgs/:orgId/needs",
    mountPath: "/api/orgs/:orgId",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete10]
  },
  {
    routePath: "/api/orgs/:orgId/needs",
    mountPath: "/api/orgs/:orgId",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet26]
  },
  {
    routePath: "/api/orgs/:orgId/needs",
    mountPath: "/api/orgs/:orgId",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost24]
  },
  {
    routePath: "/api/orgs/:orgId/needs",
    mountPath: "/api/orgs/:orgId",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut5]
  },
  {
    routePath: "/api/orgs/:orgId/people",
    mountPath: "/api/orgs/:orgId",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete11]
  },
  {
    routePath: "/api/orgs/:orgId/people",
    mountPath: "/api/orgs/:orgId",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet27]
  },
  {
    routePath: "/api/orgs/:orgId/people",
    mountPath: "/api/orgs/:orgId",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost25]
  },
  {
    routePath: "/api/orgs/:orgId/people",
    mountPath: "/api/orgs/:orgId",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut6]
  },
  {
    routePath: "/api/orgs/:orgId/recovery",
    mountPath: "/api/orgs/:orgId",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete12]
  },
  {
    routePath: "/api/orgs/:orgId/recovery",
    mountPath: "/api/orgs/:orgId",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet28]
  },
  {
    routePath: "/api/orgs/:orgId/recovery",
    mountPath: "/api/orgs/:orgId",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost26]
  },
  {
    routePath: "/api/p/:slug/intake",
    mountPath: "/api/p/:slug",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost27]
  },
  {
    routePath: "/api/public/:slug/inventory",
    mountPath: "/api/public/:slug",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet29]
  },
  {
    routePath: "/api/public/:slug/meetings",
    mountPath: "/api/public/:slug",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet30]
  },
  {
    routePath: "/api/public/:slug/needs",
    mountPath: "/api/public/:slug",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet31]
  },
  {
    routePath: "/api/orgs/:orgId/invites",
    mountPath: "/api/orgs/:orgId",
    method: "",
    middlewares: [],
    modules: [onRequest5]
  },
  {
    routePath: "/api/orgs/:orgId/members",
    mountPath: "/api/orgs/:orgId",
    method: "",
    middlewares: [],
    modules: [onRequest6]
  },
  {
    routePath: "/api/orgs/:orgId/newsletter",
    mountPath: "/api/orgs/:orgId",
    method: "",
    middlewares: [],
    modules: [onRequest7]
  },
  {
    routePath: "/api/orgs/:orgId/pledges",
    mountPath: "/api/orgs/:orgId",
    method: "",
    middlewares: [],
    modules: [onRequest8]
  },
  {
    routePath: "/api/p/:slug/meetings",
    mountPath: "/api/p/:slug",
    method: "",
    middlewares: [],
    modules: [onRequest9]
  },
  {
    routePath: "/api/p/:slug/pledges",
    mountPath: "/api/p/:slug",
    method: "",
    middlewares: [],
    modules: [onRequest10]
  },
  {
    routePath: "/api/auth/keys",
    mountPath: "/api/auth",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet32]
  },
  {
    routePath: "/api/auth/keys",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost28]
  },
  {
    routePath: "/api/auth/login",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost29]
  },
  {
    routePath: "/api/auth/logout",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost30]
  },
  {
    routePath: "/api/auth/logout_all",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost31]
  },
  {
    routePath: "/api/auth/me",
    mountPath: "/api/auth",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet33]
  },
  {
    routePath: "/api/auth/public-key",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost32]
  },
  {
    routePath: "/api/auth/refresh",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost33]
  },
  {
    routePath: "/api/auth/register",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost34]
  },
  {
    routePath: "/api/auth/sessions",
    mountPath: "/api/auth",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet34]
  },
  {
    routePath: "/api/invites/redeem",
    mountPath: "/api/invites",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost35]
  },
  {
    routePath: "/api/orgs/create",
    mountPath: "/api/orgs",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost36]
  },
  {
    routePath: "/api/pixabay/search",
    mountPath: "/api/pixabay",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet35]
  },
  {
    routePath: "/api/orgs/:orgId",
    mountPath: "/api/orgs",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete13]
  },
  {
    routePath: "/api/public/:slug",
    mountPath: "/api/public",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet36]
  },
  {
    routePath: "/api/health",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet37]
  },
  {
    routePath: "/api/orgs",
    mountPath: "/api/orgs",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet38]
  },
  {
    routePath: "/api/:path*",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest11]
  },
  {
    routePath: "/api",
    mountPath: "/api",
    method: "",
    middlewares: [onRequest12],
    modules: []
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count32 = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count32--;
          if (count32 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count32++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count32)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env22, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context22 = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env: env22,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context22);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env22["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error32) {
      if (isFailOpen) {
        const response = await env22["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error32;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env22, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env22);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env22, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env22);
  } catch (e) {
    const error32 = reduceError(e);
    return Response.json(error32, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env22, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env22, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env22, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env22, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env22, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env22, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env22, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env22, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env22, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env22, ctx) => {
      this.env = env22;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env3, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env3);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env3, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env3);
  } catch (e) {
    const error4 = reduceError2(e);
    return Response.json(error4, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-67IQKf/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env3, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env3, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env3, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env3, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-67IQKf/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env3, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env3, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env3, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env3, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env3, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env3, ctx) => {
      this.env = env3;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.10583065515608558.js.map
