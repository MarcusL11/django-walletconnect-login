if (typeof process === "undefined") {
  window.process = { env: { NODE_ENV: "development" } };
}

import { WalletConnectModalSign } from "https://unpkg.com/@walletconnect/modal-sign-html@2.6.1";

// 1. Define ui elements
const connectButton = document.getElementById("connect-button");
const signMessageButton = document.getElementById("sign-message-button");
const didInput = document.getElementById("did-input");

// 2. Create modal client, add your project id
const web3Modal = new WalletConnectModalSign({
  projectId: PROJECT_ID,  
  metadata: {
    name: "MarcusCodex",
    description: "AI & Django Wed Development ",
    url: "https://themarcuscodex.xyz",
    icons: ["https://themarcuscodex.xyz/logo.png"],
  },
});

let session = undefined;
web3Modal.getSessions().then((sessions) => {
  console.log({ sessions });
  if (sessions.length > 0) {
    session = sessions[0];
    connectButton.disabled = true;
    showConnectSuccessComponent("Successfully Connected to your wallet.");
    signMessageButton.disabled = false;
    didInput.disabled = false;
  } else {
    signMessageButton.disabled = true;
    didInput.disabled = true;
  }
});
// 3. Connect
async function onConnect() {
  try {
    connectButton.disabled = true;
    session = await web3Modal.connect({
      requiredNamespaces: {
        chia: {
          methods: ["chia_signMessageById"],
          chains: ["chia:mainnet"],
          events: [],
        },
      },
    });
    if (session) {
      signMessageButton.disabled = false;
      didInput.disabled = false;
      showConnectSuccessComponent("Successfully Connected to your wallet.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (!session) {
      connectButton.disabled = false;
    }
  }
}

async function signMessage() {
  try {
    signMessageButton.disabled = true; 
    signMessageButton.innerHTML = "Waiting for wallet confirmation...";
    const fingerprints = session.namespaces.chia.accounts.map((account) =>
      account.replace("chia:mainnet:", "")
    );

    const id = document.getElementById("did-input").value;

    const result = await web3Modal.request({
      topic: session.topic,
      chainId: "chia:mainnet",
      request: {
        method: "chia_signMessageById",
        params: {
          fingerprint: fingerprints[0],
          id: id,
          message: "Test message",
        },
      },
    });

    console.log({ result });

    if (result.data.success) {
      const csrftoken = getCookie('csrftoken');
      const response = await fetch('http://127.0.0.1:8000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({...result, id: id}),
      });

      if (response.redirected) {
        // Redirect the user to the specified URL
        window.location.href = response.url;
      } else if (response.ok) {
        console.log("Message signed successfully");
        // set disabled of button with id "btn-load" to false
        signMessageButton.disabled = true; 
      } else {
        console.log("An error occurred with your DID, make sure to include did:chia: or check that you are using the correct DID.");
        // Handle other types of responses
      }
    } else {
      // Handle unsuccessful response
      showErrorComponent("An error occurred with your DID, make sure to include did:chia: or check that you are using the correct DID.");
    }
  } catch (err) {
    console.error(err);
    showErrorComponent("An error occurred with your DID, make sure to include did:chia: or check that you are using the correct DID.");
  } finally {
    signMessageButton.disabled = false;
    didInput.disabled = false;
    signMessageButton.textContent = "Sign message by ID";
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function showErrorComponent(message) {
  const errorComponent = document.getElementById("error-component");
  errorComponent.querySelector("span").textContent = message;
  errorComponent.classList.remove("hidden");

  setTimeout(() => {
    errorComponent.classList.add("hidden");
  }, 10000); 
}

function showConnectSuccessComponent(message) {
  const successConnectComponent = document.getElementById("connect-success-component");
  successConnectComponent.querySelector("span").textContent = message;
  successConnectComponent.classList.remove("hidden");
}

// 4. Create connection handler
connectButton.addEventListener("click", onConnect);
signMessageButton.addEventListener("click", signMessage);
