System.register([], function (_export, _context) {
  "use strict";

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function createApplication(_ref) {
    var loadJsListFile = _ref.loadJsListFile,
        fetchWasm = _ref.fetchWasm;
    // NOTE: before here we shall not import any module!
    var promise = Promise.resolve();
    promise = promise.then(function () {
      return topLevelImport('wait-for-ammo-instantiation');
    }).then(function (_ref2) {
      var waitForAmmoInstantiation = _ref2["default"];
      var isWasm = waitForAmmoInstantiation.isWasm,
          wasmBinaryURL = waitForAmmoInstantiation.wasmBinaryURL;

      if (!isWasm) {
        return waitForAmmoInstantiation();
      } else {
        return Promise.resolve(fetchWasm(wasmBinaryURL)).then(function (wasmBinary) {
          return waitForAmmoInstantiation(wasmBinary);
        });
      }
    });
    return promise.then(function () {
      return _defineProperty({
        start: start
      }, 'import', topLevelImport);
    });

    function start(_ref4) {
      var findCanvas = _ref4.findCanvas;
      var settings;
      var cc;
      return Promise.resolve().then(function () {
        return topLevelImport('cc');
      }).then(function (engine) {
        cc = engine;
        return loadSettingsJson(cc);
      }).then(function () {
        settings = window._CCSettings;
        return initializeGame(cc, settings, findCanvas).then(function () {
          if (settings.scriptPackages) {
            return loadModulePacks(settings.scriptPackages);
          }
        }).then(function () {
          return loadJsList(settings.jsList);
        }).then(function () {
          return loadAssetBundle(settings.hasResourcesBundle, settings.hasStartSceneBundle);
        }).then(function () {
          return cc.game.run(function () {
            return onGameStarted(cc, settings);
          });
        });
      });
    }

    function topLevelImport(url) {
      return _context["import"]("".concat(url));
    }

    function loadAssetBundle(hasResourcesBundle, hasStartSceneBundle) {
      var promise = Promise.resolve();
      var _cc$AssetManager$Buil = cc.AssetManager.BuiltinBundleName,
          MAIN = _cc$AssetManager$Buil.MAIN,
          RESOURCES = _cc$AssetManager$Buil.RESOURCES,
          START_SCENE = _cc$AssetManager$Buil.START_SCENE;
      var bundleRoot = hasResourcesBundle ? [RESOURCES, MAIN] : [MAIN];

      if (hasStartSceneBundle) {
        bundleRoot.push(START_SCENE);
      }

      return bundleRoot.reduce(function (pre, name) {
        return pre.then(function () {
          return loadBundle(name);
        });
      }, Promise.resolve());
    }

    function loadBundle(name) {
      return new Promise(function (resolve, reject) {
        cc.assetManager.loadBundle(name, function (err, bundle) {
          if (err) {
            return reject(err);
          }

          resolve(bundle);
        });
      });
    }

    function loadModulePacks(packs) {
      return Promise.all(packs.map(function (pack) {
        return topLevelImport(pack);
      }));
    }

    function loadJsList(jsList) {
      var promise = Promise.resolve();
      jsList.forEach(function (jsListFile) {
        promise = promise.then(function () {
          return loadJsListFile("src/".concat(jsListFile));
        });
      });
      return promise;
    }

    function loadSettingsJson(cc) {
      var server = '';
      var settings = 'src/settings.json';
      return new Promise(function (resolve, reject) {
        if (typeof fsUtils !== 'undefined' && !settings.startsWith('http')) {
          var result = fsUtils.readJsonSync(settings);

          if (result instanceof Error) {
            reject(result);
          } else {
            window._CCSettings = result;
            window._CCSettings.server = server;
            resolve();
          }
        } else {
          var requestSettings = function requestSettings() {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', settings);
            xhr.responseType = 'text';

            xhr.onload = function () {
              window._CCSettings = JSON.parse(xhr.response);
              window._CCSettings.server = server;
              resolve();
            };

            xhr.onerror = function () {
              if (retryCount-- > 0) {
                setTimeout(requestSettings, retryInterval);
              } else {
                reject(new Error('request settings failed!'));
              }
            };

            xhr.send(null);
          };

          var retryCount = 3;
          var retryInterval = 2000;
          requestSettings();
        }
      });
    }
  }

  function initializeGame(cc, settings, findCanvas) {
    if (settings.macros) {
      for (var key in settings.macros) {
        cc.macro[key] = settings.macros[key];
      }
    }

    var gameOptions = getGameOptions(settings, findCanvas);
    return Promise.resolve(cc.game.init(gameOptions));
  }

  function onGameStarted(cc, settings) {
    window._CCSettings = undefined;
    cc.view.enableRetina(true);
    cc.view.resizeWithBrowserSize(true);

    if (cc.sys.isMobile) {
      if (settings.orientation === 'landscape') {
        cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
      } else if (settings.orientation === 'portrait') {
        cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
      }

      cc.view.enableAutoFullScreen(false);
    }

    var launchScene = settings.launchScene; // load scene

    cc.director.loadScene(launchScene, null, function () {
      cc.view.setDesignResolutionSize(1440, 3200, 3);
      console.log("Success to load scene: ".concat(launchScene));
    });
  }

  function getGameOptions(settings, findCanvas) {
    // asset library options
    var assetOptions = {
      bundleVers: settings.bundleVers,
      remoteBundles: settings.remoteBundles,
      server: settings.server,
      subpackages: settings.subpackages
    };
    var options = {
      debugMode: settings.debug ? 1 : 3,
      // cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
      showFPS: !false && settings.debug,
      frameRate: 60,
      groupList: settings.groupList,
      collisionMatrix: settings.collisionMatrix,
      renderPipeline: settings.renderPipeline,
      adapter: findCanvas('GameCanvas'),
      assetOptions: assetOptions,
      customJointTextureLayouts: settings.customJointTextureLayouts || [],
      physics: settings.physics
    };
    return options;
  }

  _export("createApplication", createApplication);

  return {
    setters: [],
    execute: function () {}
  };
});