const { autoUpdater } = require("electron-updater");
const { app, BrowserWindow, ipcMain, dialog, Menu, Tray } = require("electron");
const electron = require("electron");
const checkInternetConnected = require('check-internet-connected');
const Store = require("electron-store");
const store = new Store();
const fs = require('fs')
const path = require('path')
const { download } = require('electron-dl');
const { spawn } = require('child_process');
const os = require("os");
const sudo = require('sudo-prompt');
const axios = require('axios');
import isElevated from 'is-elevated';
var forge = require('node-forge');

// Notify
const { Notification } = require("electron");

store.set('app-ready', false);
store.set('backend-booted', false);
store.set('appver', app.getVersion());
store.set('progress', 'Loading app... (10%)')

var latestovpn = "2.6";

// log function
function log(message, alsoWiteToConsole = true) {
	if (alsoWiteToConsole) {
		console.log(message);
	}
	// fs.writeSync(logFile, message + "\n\r");
}

const setCookie = () => {
  const cookie = { url: 'https://api.surfskip.com', name: 'session', value: store.get("token", ""), httpOnly: true, sameSite: 'no_restriction' }
  electron.session.defaultSession.cookies.set(cookie)
    .then(() => {
    }, (error) => {
      console.error(error)
    })
}


// Start the libaries
// require("./lib/rpc.js");
// console.log("RPC lib init.");

let backgroundProcess;
const createBackgroundProcess = () => {
  backgroundProcess = new BrowserWindow(
    Object.assign({
      show: false, 
      focusable: true 
    })
  )
  console.log('VPN Background Process Started')
}

// Loading screen
/// create a global var, wich will keep a reference to out loadingScreen window
let loadingScreen;
const createLoadingScreen = () => {
  loadingScreen = new BrowserWindow(
    Object.assign({
      width: 700,
      height: 500,
      alwaysOnTop: true,
      frame: false,
      fullscreen: false,
      show: true,
      transparent: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
    })
  );
  loadingScreen.setResizable(false);
  loadingScreen.loadFile("./renderer/pages/splash.html");
  loadingScreen.on("closed", () => (loadingScreen = null));
  loadingScreen.webContents.on("did-finish-load", () => {
    loadingScreen.show();
  });
};
console.log("Loading screen ready");

// Start the main program
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    show: false,
    // frame: false,
    fullscreen: false,
    modal: true,
    icon: "./icons/icon.png",
    trafficLightPosition: { x: 24, y: 25 },
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: true,
      contextIsolation: false,
    },
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setResizable(true);

  // You can use `process.env.VITE_DEV_SERVER_URL` when the vite command is called `serve`
  if (process.env.VITE_DEV_SERVER_URL) {
    const url = new URL(process.env.VITE_DEV_SERVER_URL);
    url.hostname = "127.0.0.1";
    mainWindow.loadURL(url.href)
  } else {
    // Load your file
    mainWindow.loadFile('./out/index.html');
  }
  setCookie()

  ipcMain.on("token_set", () => {
    setCookie()
  });

  ipcMain.on("login_visible", () => {
    mainWindow.setSize(433, 800, false);
    mainWindow.center();
  });

  ipcMain.on("page_visible", () => {
    mainWindow.setSize(1400, 800, false);
    mainWindow.center();
  });

  ipcMain.on("logged_in", () => {
    // critical vpn functions, reverse order to ensure all functions are declared.
    var logged_in_task = setInterval(function() { 
      if ((store.get('backend-booted') == true)) {
        // vpn client configurator

        // step 8
        async function completeSetup() {
          mainWindow.webContents.send("initProgress", 90);
          var authPath = app.getPath('userData') + '/.data/keys';
          await log('Complete.')
          var token = await store.get('token');
          var deviceName = await store.get('client-name')
          await store.set('old-token', token)
          await log('Sucessfully set settings to stop rerun on next boot.')
          await fs.writeFileSync((path.resolve(authPath + '/credential')), token + '\n' + deviceName )
          mainWindow.webContents.send("initProgress", null);
          await store.set('client-configured', true)
        }


        // step 7
        async function signCertificate() {
          mainWindow.webContents.send("initProgress", 80);
          log('Step 5: Signing Certificate...')
          var certPath = app.getPath('userData') + '/.data/keys';
          if (await fs.existsSync(path.resolve(certPath + '/surfskip-client.crt'))) {
            log('Removing old certificate...');
            await fs.unlinkSync(path.resolve(certPath + '/surfskip-client.crt'));
          }

          log('Generating new certificate...');
          var request = await fs.readFileSync(path.resolve(certPath + '/req.csr')).toString()
          await axios('https://vpnapi.surfskip.com/vpn/sign/client', {
            method: 'POST',
            data: {
              request
            },
            headers: {
              Authorization: `Basic ${encodeURIComponent(store.get("token"))}`
            }
          }).then(function (res) {
            if (res.data != undefined) {
              log('CA data fetched, storing...')
              let cert = res.data.certificate 
              fs.writeFileSync(path.resolve(certPath + '/surfskip-client.crt'), (cert).toString())
              completeSetup();
            } else {
              log('Step 5: Error')
            }
          })
        }


        // step 6
        async function genCertificate() {
          mainWindow.webContents.send("initProgress", 50);
          log('Step 4: Generating certificate...')
          var certPath = app.getPath('userData') + '/.data/keys';
          if (await fs.existsSync(certPath + '/req.csr')) {
            await log('Old cert located, removing...')
            await fs.unlinkSync(certPath + '/req.csr')
          }
          await (async function () {
            // Define important directives 
            let rootDir = path.resolve(certPath);
            var cn = await store.get('client-name')
            // Prepare Private Keys
            const privateKeyLoc = await path.resolve(certPath + '/private.pem');
            const privateKeyPem = await fs.readFileSync(privateKeyLoc).toString()
            const privateKey = await forge.pki.privateKeyFromPem(privateKeyPem);
            // Prepare Public Keys
            const publicKeyLoc = await path.resolve(certPath + '/public.pem');
            const publicKeyPem = await fs.readFileSync(publicKeyLoc).toString()
            const publicKey = await forge.pki.publicKeyFromPem(publicKeyPem);
            // CSR Generation Logic
            var csr = forge.pki.createCertificationRequest();
              csr.publicKey = publicKey;
              csr.setSubject([{
                name: 'commonName',
                value: cn
              }, {
                name: 'countryName',
                value: 'US'
              }, {
                name: 'organizationName',
                value: 'PrivateVPN'
              }]);
              await csr.sign(privateKey);
              await csr.verify();
            var signedCsr = await forge.pki.certificationRequestToPem(csr);
            await fs.writeFileSync(path.resolve(rootDir + '/req.csr'), signedCsr)
            log('Checking if cert was sucessful');
            if (await fs.existsSync(path.resolve(certPath + '/req.csr'))) {
                await log('Generated cert completed successfully')
                // next step
                await signCertificate();
              } else {
                log('Generated cert failed.')
                log('Step 4 failed: Not going to next step.')
              }
            log('Cert generated...')
          })();
        }


        // step 5
        async function generatePrivateKey() {
          mainWindow.webContents.send("initProgress", 40);
          await log('Step 3: Generating private key...')
          var keyPath = app.getPath('userData') + '/.data/keys';
          await (async function () {
            var keypair = await forge.pki.rsa.generateKeyPair();
            let privatekey = await forge.pki.privateKeyToPem(keypair.privateKey);
            let publickey = await forge.pki.publicKeyToPem(keypair.publicKey);
            await fs.writeFileSync(path.resolve(keyPath + '/private.pem'), privatekey)
            await fs.writeFileSync(path.resolve(keyPath + '/public.pem'), publickey)
            if (await fs.existsSync(path.resolve(keyPath + '/private.pem')) && await fs.existsSync(path.resolve(keyPath + '/public.pem'))) {
              log('Public & Private key generation success')
              // next step
              await genCertificate();
            } else {
              log('Step 3 failed: Not going to next step.')
            }
          })();
        }


        // step 4
        async function fetchCA() {
          mainWindow.webContents.send("initProgress", 30);
          await log('Step 2: Fetching CA...')
          var caPath = app.getPath('userData') + '/.data/certificate.crt';
          // const res = await fetch("")
          // .then(res => res.text())
          // .catch(() => {})
          await axios.get('https://vpnapi.surfskip.com/vpn/cert').then(function (response) {
            fs.writeFileSync(path.resolve(caPath), (response.data).toString())
            // next step
            generatePrivateKey()
          })
        }


        // step 3
        async function getRequestName() {
          mainWindow.webContents.send("initProgress", 20);
          await log('Step 1: Getting request name...')

          const res = await fetch("https://api.surfskip.com/users/authenticate", {
            headers: {
              "Cookie": `session=${store.get("token")}`
            }
          })
          .then(res => res.json())
          .catch(() => {})

          if (!res.success) return;

          const requestName = await fetch("https://vpnapi.surfskip.com/vpn/sign/client/name", {
            method: "POST",
            headers: {
              "Authorization": `Basic ${encodeURIComponent(store.get("token"))}`
            }
          }).then(res => res.json())
          const name = requestName.name;
          await store.set("client-name", name);
          // next step 
          await fetchCA();
        }

        // step 2
        // session storage
        function sessionStorage() {
          mainWindow.webContents.send("initProgress", 10);
          var appd = app.getPath('userData');
          // session storage folder generation
          if (fs.existsSync(appd + '/.data/session')) {
            log("Session storage found")
            store.set('session-storage', appd + '/.data/session')
            getRequestName();
          } else {
            log("Creating session storage")
            fs.mkdirSync(appd + '/.data/session', { recursive: true });
            if (fs.existsSync(appd + '/.data/session')) {
              log('Session storage created successfully')
              store.set('session-storage', tmp + '/.data/session')
              getRequestName();
            } else {
              log('Critical error has occured. Session storage failed to be created')
            }
          }
        }

        // step 1
        // key storage folder generation
        function createKeyStorage() {
          var appd = app.getPath('userData');
          if (fs.existsSync(appd + '/.data/keys')) {
            log("Key storage found")
            store.set('key-storage', appd + '/.data/keys')
            sessionStorage();
          } else {
            log("Creating key storage")
            fs.mkdirSync(appd + '/.data/keys', { recursive: true });
            if (fs.existsSync(appd + '/.data/keys')) {
              log('Key storage created successfully')
              store.set('key-storage', appd + '/.data/keys')
              sessionStorage();
            } else {
              log('Critical error has occured. Key storage failed to be created')
            }
          }
        }

        // start hook to start the boot process
        async function start() {
          if (!store.get("token")) return;
          store.set('client-configured', false)
          var oldtoken = store.get("old-token");
          var token = store.get("token")
          var appd = app.getPath('userData') + '/.data/';
          var checks = true
          if (token == oldtoken) {
            log("Skipping Initial Install: Apparently Already completed. Validating now...")
            if ((fs.existsSync(path.resolve(appd + 'certificate.crt'))) != true) {
              var checks = false;
            }
            if ((fs.existsSync(path.resolve(appd + 'keys/surfskip-client.crt'))) != true) {
              var checks = false;
            }
            if ((fs.existsSync(path.resolve(appd + 'keys/private.pem'))) != true) {
              var checks = false;
            }
            if ((fs.existsSync(path.resolve(appd + 'keys/public.pem'))) != true) {
              var checks = false;
            }
            if ((fs.existsSync(path.resolve(appd + 'session/sessionkeys.sec'))) != true) {
              var checks = false;
            }
            if (checks == false) {
              log('Check failed, starting initial boot installer again.');
              mainWindow.webContents.send("initProgress", 1);
              createKeyStorage();
            } else {
              log('Install Validation Passed')
            }
          } else {
            await log('Starting login tasks...')
            mainWindow.webContents.send("initProgress", 1);
            await createKeyStorage();
          }
        }

        // start process
        start();
        clearInterval(logged_in_task);
      }
    }, 2000);
  });


  mainWindow.on("maximize", () => mainWindow.unmaximize());
  ipcMain.on("main_show", () => mainWindow.show());
  ipcMain.on('main_hide', () => {mainWindow.hide();})
  ipcMain.on("load_acc", () => mainWindow.loadFile('myaccount.html'))

  console.log("Welcome to PrivateVPN update service")
  // declare important variables
  var ovpntobeinstalled = false
  // check ovpn installation
  if (process.platform == "win32") {
    console.log('Windows detected')
    if (fs.existsSync("C:\\Program Files\\OpenVPN\\bin\\openvpn.exe")) {
      var openVPNExecCmd = "C:\\Program Files\\OpenVPN\\bin\\openvpn.exe";
      store.set('ovpn', true)
      store.set('ovpnver', latestovpn);
      store.set('ovpnloc',  openVPNExecCmd);
      log("OpenVPN found at \"" + openVPNExecCmd + "\"", true);
      // alert("OpenVPN found at \"" + openVPNExecCmd + "\"");
    } else {
      if (fs.existsSync("C:\\Program Files (x86)\\OpenVPN\\bin\\openvpn.exe")) {
        var openVPNExecCmd = "C:\\Program Files (x86)\\OpenVPN\\bin\\openvpn.exe";
        store.set('ovpn', true)
        store.set('ovpnver', latestovpn);
        store.set('ovpnloc',  openVPNExecCmd);
        log("OpenVPN found at \"" + openVPNExecCmd + "\"", true);
        //   alert("OpenVPN found at \"" + openVPNExecCmd + "\"");

      } else {
        log("OpenVPN not found")
        store.set('ovpn', false)
      }
    }
    store.set('progress', 'Checking requirements... (20%)')
  } else {
    log("win32 is the only supported platform");
  }


  // OpenVPN version management system
  if ((store.get('ovpn')) == false) {
    log("OpenVPN is not found, welcome to PrivateVPN OpenVPN version manager")
    store.set('progress', 'Checking install... (30%)')
    if (process.platform == "win32") {
      var ovpnver = store.get('ovpnver');
      if (ovpnver == latestovpn) {
        log("Tampered OpenVPN installation detected")
        var ovpntobeinstalled = true;
      } else {
        if (ovpnver != undefined) {
          log("Outdated and tampered OpenVPN installation detected")
          store.delete('ovpnver');
          var ovpntobeinstalled = true;
          // TODO
        } else {
          log("OpenVPN has never been installed by PrivateVPN")
          log("OpenVPN is ready for install")
          var ovpntobeinstalled = true;
        }
      }
    }
  } else {
    var ovpnver = store.get('ovpnver');
    log("Checking instance version...")
    store.set('progress', 'Checking install... (30%)')
    if (ovpnver != latestovpn) {
      log("Outdated installation detected")
      store.set('ovpn', false)
      var ovpntobeinstalled = true;
      store.set('progress', 'Preparing app update... (40%)')
    } else {
      log("Instant version is up to date");
      store.set('app-ready', true)
      store.set('progress', 'Install verified... (50%)')
    }
  }

  // OpenVPN installation system
  if ((store.get('ovpn')) == false) {
    createBackgroundProcess();
    log("Welcome to OpenVPN installer")
    if (ovpntobeinstalled == true) {
      if (process.platform == "win32") {
        log("Win32 detected")
        if (fs.existsSync(app.getPath("temp"))) {
          // tmp folder generation
          var tmp = app.getPath("temp");
          log("Temporary PATH found")
          log(tmp);
          if (fs.existsSync(tmp + '/.ovpn')) {
            log("Temporary cache found")
            var tmpcache = true;
            var installpath = tmp + '/.ovpn';
          } else {
            log("Creating temporary cache folder")
            fs.mkdirSync(tmp + '/.ovpn', { recursive: true });
            if (fs.existsSync(tmp + '/.ovpn')) {
              log('Cache created successfully')
              var installpath = tmp + '/.ovpn';
              var tmpcache = true;
            } else {
              log('Critical error has occured. Cache failed to be created')
              var tmpcache = false;
            }
          }
        } else {
          log("Critical error: No temporary PATH found.")
        }
        if (tmpcache == true) {
          log('Preparing for installation of OpenVPN binaries under ' + installpath)
          if (process.platform == "win32") {
            // once download is complete
            function completedownloadwin32() {
              log("OpenVPN installer has been downloaded successfully")
              log("Preparing installation...")
              store.set('progress', 'Installing VPN update... (70%)')
              if (fs.existsSync(installpath + '/openvpn-win64.msi')) {
                var openvpnwin32resource = installpath + '/openvpn-win64.msi'
                log('OpenVPN resource found and ready for installation')
                log(path.resolve(openvpnwin32resource));

                var execCMDArgs = `/i "${path.resolve(openvpnwin32resource)}" ADDLOCAL=OpenVPN,Drivers.TAPWindows6,Drivers /qn /quiet /norestart`;
                var installer = spawn('msiexec', [execCMDArgs], {
                  detached: true,
                  cwd: os.homedir(),
                  env: process.env,
                  shell: true
                });

                installer.on("error", (err) => {
                  log("installer:error: " + err, true);
                  // alert("installer:error: " + err.toString());
                  fs.unlinkSync(path.resolve(openvpnwin32resource));
                });
                installer.stdout.on('data', (data) => {
                  var msg = data.toString();
                  log("installer:stdout: " + msg, true);
                  // alert("installer:stdout: " + msg.toString());
                  fs.unlinkSync(path.resolve(openvpnwin32resource));
                });
                installer.stderr.on('data', (data) => {
                  var msg = data.toString();
                  log("installer:stderr: " + msg, true);
                  // alert("installer:stderr: " + msg.toString());
                  fs.unlinkSync(path.resolve(openvpnwin32resource));
                });
                installer.on('close', (code) => {
                  log(`installer: child process exited with code ${code}`, true);
                  fs.unlinkSync(path.resolve(openvpnwin32resource));
                  // alert(`installer: child process exited with code ${code} \n Path: "${msiInstallerPath}"`);

                  // log("> Restarting app", true);
                  // app.relaunch();
                  // app.quit();

                  if (fs.existsSync("C:\\Program Files\\OpenVPN\\bin\\openvpn.exe")) {
                    var openVPNExecCmd = "C:\\Program Files\\OpenVPN\\bin\\openvpn.exe";
                    store.set('ovpn', true)
                    store.set('app-ready', true)
                    store.set('ovpnver', latestovpn);
                    store.set('ovpnloc',  openVPNExecCmd);
                    log("OpenVPN installed at \"" + openVPNExecCmd + "\"", true);
                    store.set('progress', 'Completed VPN update... (80%)')
                  } else
                    if (fs.existsSync("C:\\Program Files (x86)\\OpenVPN\\bin\\openvpn.exe")) {
                      var openVPNExecCmd = "C:\\Program Files (x86)\\OpenVPN\\bin\\openvpn.exe";
                      store.set('ovpn', true)
                      store.set('app-ready', true)
                      store.set('ovpnver', latestovpn);
                      store.set('ovpnloc',  openVPNExecCmd);
                      log("OpenVPN installed at \"" + openVPNExecCmd + "\"", true);
                      store.set('progress', 'Completed VPN update... (80%)')
                    } else {
                      log("OpenVPN installation failed. Please install OpenVPN", true);
                      store.set('progress', 'Failed VPN update... Code: #3513')
                      store.set('ovpn', false)
                      // alert("OpenVPN installation failed. Please install OpenVPN");
                    }

                });

                installer.unref();

                log('Installation complete')


              } else {
                log('An error has occured, retrying download...')
                downloadWin32Binary();
              }
            }
            // download
            log("Downloading OpenVPN win32 binaries")
            store.set('progress', 'Download VPN update... (60%)')
            async function downloadWin32Binary() {
              console.log(await download(backgroundProcess, "https://github.com/ThePrivateCompany/binaries/releases/download/v1.0.0/openvpn-win64.msi", {"directory": installpath, "overwrite": true}));
              await log("Win32 binary download completed.")
              await completedownloadwin32();
            }
            downloadWin32Binary();
          }
        }
      }
    } else {
      log("Not proceeding with installation. An error has occured.")
    }
  }

  // // mainWindow.webContents.on("did-finish-load", () => {
  // //   if (loadingScreen) {
  // //     loadingScreen.close();
  // //     trackEvent("ok.started", "ok has just loaded up!");
  // //   }
  // //   var isDev = require("isdev");

  // //   if (isDev) {
  // //     console.log("In Development!");
  // //   } else {
  // //     console.log("Not in Development!");
  // //   }


  // //   (async () => {
  // //     if ((await isOnline() === false)) {
  // //       console.log("No internet");
  // //       const notification3 = {
  // //         title: "ok",
  // //         body: "No valid network connection! Please reconnect!",
  // //       };
  // //     mainWindow.loadFile("./src/pages/nonet.html");
  // //     new Notification(notification3).show();
  // //     }
  // //   })();

  // //   mainWindow.show();
  // //   console.log("Ok! Window init, let's check for updates...");
  // //   autoUpdater.checkForUpdatesAndNotify();
  // //   console.log("Update checked. Let's see what happens!");
  // // });
}

console.log("Main screen ready.");

app.whenReady().then(() => {
  createWindow()
})

var appready = setInterval(function() { 
  if ((store.get('app-ready') == true)) {

    // part 3
    // main app boot
    async function mainAppBoot() {
      // app ready
      if (await isElevated()) {
        if ((await checkInternetConnected() === false)) {
          store.set('progress', 'No Internet connection')
        } else {
          store.set('progress', 'App Ready... (99%)')
          store.set('progress', 'App Ready... (100%)')
          clearInterval(appready);
          autoUpdater.checkForUpdatesAndNotify();
          console.log('App ready')
          store.set('backend-booted', true);
          loadingScreen.close();
          mainWindow.show();
        }
      } else {
        store.set('progress', 'PrivateVPN needs elevated permissions')
      }
    }

    mainAppBoot();

  }
}, 2000);

// app.setAsDefaultProtocolClient("aa");
// protocol.registerHttpProtocol('aa', (req, cb) => {
//   const url = req.url.substr(22)
//     console.log("Logging in: "+url);
//     console.log("Token data: "+url)
//     store.set('token', url);
//     ipcMain.emit('load_acc');
//     ipcMain.emit('login_hide')
//     ipcMain.emit('main_show')
//     store.set('logged_in', true)
//     if ((store.get('createonlogin')) === true) {
//       createWindow()
//       store.set('createonlogin', false);
//     }
// })

let tray = null
app.whenReady().then(() => {
  createLoadingScreen();
  tray = new Tray('./icons/titl.ico')
  const contextMenu = Menu.buildFromTemplate([
    { role: 'PrivateVPN', label: 'PrivateVPN' },
    { type: 'separator' },
    { label: 'Connect to VPN', type: 'checkbox' },
  ])
  tray.setToolTip('PrivateVPN Desktop')
  tray.setContextMenu(contextMenu)
})

ipcMain.on("app_version", (event) => {
  event.sender.send("app_version", { version: app.getVersion() });
});

async function vpnDisconnect() {
  await spawn("taskkill.exe", ["/F /IM openvpn.exe"], {
    detached: false,
    cwd: os.homedir(),
    env: process.env,
    shell: true
  });
}

ipcMain.handle('onDisconnect', async () => {
  // disconnect logic here...
  // const result = await somePromise(...args)
  console.log("disconnect")
  vpnDisconnect();

  return true // return true to send success event to client.
})

ipcMain.on("onConnect", (event, ip, port, serverId) => {
  global.cancel = false;
  mainWindow.webContents.send("onProgress", 0);
    if (process.platform == "win32") {
      var sessionPath = app.getPath('userData') + '/.data/session';
      async function connectWin() {
        await('Preparing for connection...')
        var keyPath = app.getPath('userData') + '/.data/keys';
        var dataPath = app.getPath('userData') + '/.data';
        mainWindow.webContents.send("onProgress", 20);
        var config = `client
        proto udp
        remote {{ip}} {{port}}
        dev tun
        nobind
        block-outside-dns
        resolv-retry infinite
        auth SHA256
        auth-user-pass {{credentials}}

        ca {{ca}} # Replace "/path/to/ca.crt" with the actual path to the CA certificate on the client.
        cert {{cert}} # Replace "/path/to/client.crt" with the actual path to your client certificate.
        key {{key}} # Replace "/path/to/client.key" with the actual path to your client private key.

        cipher AES-128-GCM
        comp-lzo no
        ; cipher AES-256-GCM
        verb 3
        remote-cert-tls server

        ; Uncomment and modify the following lines if needed for your setup:
        ; tls-auth /path/to/ta.key 1 # Replace "/path/to/ta.key" with the actual path to the HMAC firewall key on the client.
        ; compress lz4-v2
        ; push "redirect-gateway def1"
        ; ns-cert-type server

        ; push "dhcp-option DNS 1.1.1.1"
        ; push "dhcp-option DNS 8.8.8.8"`
        mainWindow.webContents.send("onProgress", 30);
        var newconfig = config
          .replace('{{ip}}', ip)
          .replace('{{port}}', port)
          .replace('{{credentials}}', path.posix.normalize(path.resolve(sessionPath + '/sessionkeys.sec').replace(/\\/g, '/')))
          .replace('{{ca}}',  path.posix.normalize(path.resolve(dataPath + '/certificate.crt').replace(/\\/g, '/')))
          .replace('{{cert}}', path.posix.normalize(path.resolve(keyPath + '/surfskip-client.crt').replace(/\\/g, '/')))
          .replace('{{key}}', path.posix.normalize(path.resolve(keyPath + '/private.pem').replace(/\\/g, '/')))
        mainWindow.webContents.send("onProgress", 40);
        if (!global.cancel) {
          if (store.get("ovpn") == true) {
            await fs.writeFileSync((path.resolve(sessionPath + '/session.ovpn')), newconfig.toString())
            mainWindow.webContents.send("onProgress", 45);
            var runCommand = " --config " + (path.resolve(sessionPath + '/session.ovpn'))
            var vpnCommand = path.resolve(store.get("ovpnloc"))
            log(vpnCommand + runCommand)
            var vpnProc = spawn(`"${vpnCommand}"`, [runCommand], {
              detached: false,
              cwd: os.homedir(),
              env: process.env,
              shell: true
            });
            global.vpn = vpnProc;
            global.vpn.stdout.on('data', (data) => {
              var msg = data.toString();
              log("vpn:stdout: " + msg, true);
              if (msg.includes('Restart pause')) {
                new Notification({ title: "PrivateVPN", body: "VPN Connection failed. Attempting again." }).show()
                mainWindow.webContents.send("onDisconnected");
                vpnDisconnect();
              }
              if (msg.includes('Exiting due to fatal error')) {
                new Notification({ title: "PrivateVPN", body: "Exiting due to fatal error" }).show()
                mainWindow.webContents.send("onDisconnected");
                vpnDisconnect();
              }
              if (msg.includes('Access is denied')) {
                new Notification({ title: "PrivateVPN", body: "PrivateVPN does not have permission to configure networking" }).show()
                mainWindow.webContents.send("onDisconnected");
                vpnDisconnect();
              }
              if (msg.includes('VERIFY OK: depth=0, CN=Surfskip Server')) {
                mainWindow.webContents.send("onProgress", 65);
              }
              if (msg.includes('Initialization Sequence Completed')) {
                new Notification({ title: "PrivateVPN", body: "PrivateVPN connected" }).show()
                mainWindow.webContents.send("onProgress", 100);
                mainWindow.webContents.send("onConnected");
              }
            });
            global.vpn.stderr.on('data', (data) => {
              var msg = data.toString();
              log("vpn:stderr: " + msg, true);
            });
            global.vpn.on('close', (code) => {
              global.vpn.unref();
              store.set("constate", false)
              mainWindow.webContents.send("onDisconnected");
              log('VPN Subprocess exited')
              new Notification({ title: "PrivateVPN", body: "VPN Disconnected" }).show()
            })
          } else {
            log("OpenVPN has not been installed correctly.")
            mainWindow.webContents.send("onProgress", 45);
          }
        } else {
          mainWindow.webContents.send("onProgress", 0);
          mainWindow.webContents.send("onDisconnected");
          log("Connection Cancelled")
          vpnDisconnect();
        }
      }
      // create session
      (async function() {
        let data = JSON.stringify({
          "server": serverId
        });
        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://vpnapi.surfskip.com/vpn/session',
          headers: { 
            'Authorization': `Basic ${encodeURIComponent(store.get("token"))}`, 
            'Content-Type': 'application/json'
          },
          data : data
        };
        mainWindow.webContents.send("onProgress", 5);
        axios.request(config)
        .then((response) => {
          log('Preparing session keys...')
          fs.writeFileSync((path.resolve(sessionPath + '/sessionkeys.sec')), response.data.id + '\n' + response.data.token)
          log('Session keys saved successfully')
          mainWindow.webContents.send("onProgress", 10);
          connectWin();
        })
        .catch((error) => {
          console.log(error);
          console.log('Error')
          mainWindow.webContents.send("onProgress", 0);
        });
      })();
    }
});

ipcMain.on("onCancel", () => {
  global.cancel = true;
  vpnDisconnect();
  console.log("Cancel")
});

autoUpdater.on("update-downloaded", async () => {
  await dialog.showMessageBox('Update Available', 'Press OK to install update') 
  autoUpdater.quitAndInstall();
});

ipcMain.on("relaunch", () => {
  ipcMain.emit("close")
});

ipcMain.on("restart_app", () => {
  autoUpdater.quitAndInstall();
});

app.on("window-all-closed", async function () {
  if (process.platform !== "darwin") {
    await vpnDisconnect();
    await app.quit();
  }
});

ipcMain.on('minimize', () => {mainWindow.minimize()})
ipcMain.on('maximize', () => {mainWindow.maximize()})
ipcMain.on('restore', () => {mainWindow.restore()})
ipcMain.on('close', () => {mainWindow.close();})
