"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.tsx
var src_exports = {};
__export(src_exports, {
  AddressDisplay: () => AddressDisplay_default,
  BalanceDisplay: () => BalanceDisplay_default,
  BalancesDisplay: () => BalancesDisplay_default,
  BlockchainProvider: () => BlockchainProvider,
  ConfigSelector: () => ConfigSelector_default,
  ConnectButton: () => ConnectButton_default,
  EventDisplay: () => EventDisplay_default,
  IssueTokenForm: () => IssueTokenForm_default,
  MintNFTButton: () => MintNFTButton_default,
  NFTGallery: () => NFTGallery_default,
  NFTMintingForm: () => NFTMintingForm_default,
  NFTTransferForm: () => NFTTransferForm_default,
  TransactionForm: () => TransactionForm_default,
  TransactionStatus: () => TransactionStatus_default,
  TrustLineForm: () => TrustLineForm_default,
  useBlockchain: () => useBlockchain
});
module.exports = __toCommonJS(src_exports);

// src/components/BalanceDisplay.tsx
var import_react2 = __toESM(require("react"));

// src/hooks/BlockchainContext.tsx
var import_react = __toESM(require("react"));

// src/hooks/blockchainService.ts
var issueToken = async (sdk, values, setTransactionStatus) => {
  if (!sdk || !sdk.isActive()) {
    throw new Error("SDK not initialized or not connected");
  }
  try {
    setTransactionStatus("Processing");
    const tokenParams = __spreadProps(__spreadValues({
      currencyCode: values.currencyCode,
      amount: values.amount,
      transferRate: parseFloat(values.transferRate),
      tickSize: parseInt(values.tickSize)
    }, values.domain ? { domain: values.domain } : {}), {
      requireDestTag: values.requireDestTag,
      disallowXRP: values.disallowXRP
    });
    const result = await sdk.issueToken(__spreadProps(__spreadValues({}, tokenParams), {
      domain: tokenParams.domain || ""
      // Ensure domain is always a string
    }));
    setTransactionStatus("Success");
  } catch (error) {
    setTransactionStatus("Error");
    console.error("Token issuance error:", error);
    throw error;
  }
};
var getBalances = async (sdk) => {
  try {
    if (!sdk || !sdk.isActive()) {
      throw new Error("SDK not initialized or not connected");
    }
    const balances = await sdk.getBalances();
    return Array.isArray(balances) ? balances.map((balance) => {
      var _a;
      return {
        currency: balance.currency || "Native",
        value: ((_a = balance.value) == null ? void 0 : _a.toString()) || "0",
        issuer: balance.issuer,
        nonStandard: balance.nonStandard
      };
    }) : [];
  } catch (error) {
    console.error("Error fetching balances:", error);
    throw error;
  }
};
var createTrustLine = async (sdk, values, setTransactionStatus) => {
  if (!sdk) {
    throw new Error("SDK not initialized");
  }
  try {
    setTransactionStatus("Creating trust line...");
    const config = {
      currency: values.currency,
      issuer: values.issuerAddress,
      limit: values.trustLineLimit
    };
    const result = await sdk.createTrustLine(config);
    if (result) {
      setTransactionStatus("Trust line created successfully");
    } else {
      setTransactionStatus("Failed to create trust line");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    setTransactionStatus(`Failed to create trust line: ${errorMessage}`);
    throw error;
  }
};
var checkWalletInstalled = async (sdk) => {
  if (!sdk) {
    return false;
  }
  return sdk.isWalletInstalled();
};
var transferNFT = async (sdk, tokenId, to, setTransactionStatus) => {
  if (!(sdk == null ? void 0 : sdk.isActive())) {
    setTransactionStatus("Please connect to blockchain first");
    return null;
  }
  try {
    setTransactionStatus("Transferring NFT...");
    const result = await sdk.transferNFT(tokenId, to);
    setTransactionStatus("NFT Transfer successful");
    return result;
  } catch (error) {
    setTransactionStatus(`NFT Transfer failed: ${error}`);
    return null;
  }
};
var mintNFT = async (sdk, values, setTransactionStatus) => {
  if (!(sdk == null ? void 0 : sdk.isActive())) {
    setTransactionStatus("Please connect to blockchain first");
    return;
  }
  try {
    setTransactionStatus("Preparing NFT minting...");
    if (!values.nftURI) {
      setTransactionStatus("NFT URI is required");
      return;
    }
    const taxon = parseInt(values.nftTaxon);
    if (isNaN(taxon)) {
      setTransactionStatus("Invalid NFT taxon");
      return;
    }
    const transferFee = parseInt(values.nftTransferFee);
    if (isNaN(transferFee) || transferFee < 0 || transferFee > 5e4) {
      setTransactionStatus("Transfer fee must be between 0 and 50000");
      return;
    }
    const flags = parseInt(values.nftFlags);
    if (isNaN(flags)) {
      setTransactionStatus("Invalid flags value");
      return;
    }
    setTransactionStatus("Minting NFT...");
    const nftConfig = {
      URI: values.nftURI,
      name: values.nftName,
      description: values.nftDescription,
      image: values.nftImage,
      taxon,
      transferFee,
      flags
    };
    const result = await sdk.mintNFT(nftConfig);
    setTransactionStatus(`NFT minted successfully! ${result.nftID}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    setTransactionStatus(`NFT minting failed: ${errorMessage}`);
    console.error("NFT minting error:", error);
  }
};
var sendTransaction = async (sdk, values, setTransactionStatus) => {
  if (!(sdk == null ? void 0 : sdk.isActive())) {
    setTransactionStatus("Please connect to blockchain first");
    return;
  }
  try {
    if (!values.recipientAddress) {
      setTransactionStatus("Recipient address is required");
      return;
    }
    if (!values.transactionAmount || parseFloat(values.transactionAmount) <= 0) {
      setTransactionStatus("Valid amount is required");
      return;
    }
    setTransactionStatus("Preparing transaction...");
    const amountInDrops = parseFloat(values.transactionAmount).toString();
    if (values.selectedCurrency != "") {
      const issuer = await sdk.getAddress();
      console.log("values", values);
      console.log("issuer", issuer);
      const result = await sdk.sendTransaction({
        to: values.recipientAddress,
        amount: values.transactionAmount,
        currency: values.selectedCurrency,
        issuer
      });
      setTransactionStatus(`Transaction sent successfully! Hash: ${result.hash}`);
    } else {
      const result = await sdk.sendTransaction({
        to: values.recipientAddress,
        amount: amountInDrops
      });
      setTransactionStatus(`Transaction sent successfully! Hash: ${result.hash}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    setTransactionStatus(`Transaction failed: ${errorMessage}`);
    console.error("Transaction error:", errorMessage);
  }
};
var getBalance = async (sdk) => {
  console.log("sdk", sdk);
  if (!(sdk == null ? void 0 : sdk.isActive())) {
    return "0.000000";
  }
  try {
    const balance = await sdk.getBalance();
    const balanceInXRP = (balance / 1e6).toFixed(6);
    return balanceInXRP;
  } catch (error) {
    console.error("Error fetching balance:", error);
    return "0.000000";
  }
};
var getCurrencySymbol = async (sdk) => {
  if (!(sdk == null ? void 0 : sdk.isActive())) {
    return "XRP";
  }
  try {
    const currencySymbol = await sdk.getCurrencySymbol();
    return currencySymbol;
  } catch (error) {
    console.error("Error fetching currency symbol:", error);
    return "XRP";
  }
};
var getAddress = async (sdk) => {
  if (!(sdk == null ? void 0 : sdk.isActive())) {
    return "";
  }
  try {
    const address = await sdk.getAddress();
    return address;
  } catch (error) {
    console.error("Error fetching address:", error);
    return "";
  }
};
var getNFTs = async (sdk) => {
  if (!(sdk == null ? void 0 : sdk.isActive())) {
    return [];
  }
  try {
    const nfts = await sdk.getNFTs();
    return nfts;
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return [];
  }
};

// src/hooks/BlockchainContext.tsx
var import_easya_sdk_core = require("easya-sdk-core");
var BlockchainContext = (0, import_react.createContext)(null);
var initialValues = {
  recipientAddress: "",
  transactionAmount: "",
  tokenName: "",
  tokenSymbol: "",
  tokenSupply: "",
  nftName: "",
  nftDescription: "",
  nftImage: "",
  nftURI: null,
  nftTaxon: "0",
  nftTransferFee: "0",
  nftFlags: "0",
  selectedCurrency: "",
  // trust line values
  currency: "",
  issuerAddress: "",
  trustLineLimit: "",
  // token issuance values
  currencyCode: "",
  amount: "",
  transferRate: "0",
  tickSize: "5",
  domain: "",
  requireDestTag: false,
  disallowXRP: false
};
var BlockchainProvider = ({ config, children }) => {
  const [connectionStatus, setConnectionStatus] = (0, import_react.useState)("Not Connected");
  const [sdk, setSdk] = (0, import_react.useState)(() => new import_easya_sdk_core.EasyaSDK(config));
  const [transactionStatus, setTransactionStatus] = (0, import_react.useState)("");
  const [values, setValues] = (0, import_react.useState)(initialValues);
  (0, import_react.useEffect)(() => {
    const cleanup = async () => {
      if (sdk && sdk.isActive() && typeof sdk.disconnect === "function") {
        try {
          await sdk.disconnect();
        } catch (error) {
          console.error("Error disconnecting:", error);
        }
      }
    };
    cleanup();
    setConnectionStatus("Not Connected");
    setTransactionStatus("");
    setValues(initialValues);
    setSdk(new import_easya_sdk_core.EasyaSDK(config));
  }, [config]);
  const updateValue = (key, value) => {
    setValues((prev) => __spreadProps(__spreadValues({}, prev), { [key]: value }));
  };
  const connectToBlockchain = async () => {
    if (!sdk)
      return false;
    setConnectionStatus("Initialized");
    try {
      setConnectionStatus("Connecting...");
      const result = await sdk.connect();
      setConnectionStatus("Connected");
      return true;
    } catch (error) {
      setConnectionStatus(`Connection failed: ${error}`);
      return false;
    }
  };
  const disconnectFromBlockchain = async () => {
    if (!sdk) {
      setConnectionStatus("Not Connected");
      return true;
    }
    try {
      setConnectionStatus("Disconnecting...");
      if (typeof sdk.disconnect === "function") {
        await sdk.disconnect();
      }
      setConnectionStatus("Not Connected");
      setTransactionStatus("");
      setValues(initialValues);
      return true;
    } catch (error) {
      setConnectionStatus(`Disconnect failed: ${error}`);
      return false;
    }
  };
  const contextValue = {
    connectionStatus,
    transactionStatus,
    values,
    updateValue,
    connectToBlockchain,
    disconnectFromBlockchain,
    sendTransaction: () => sendTransaction(sdk, values, setTransactionStatus),
    mintNFT: () => mintNFT(sdk, values, setTransactionStatus),
    getBalance: () => getBalance(sdk),
    getCurrencySymbol: () => getCurrencySymbol(sdk),
    getAddress: () => getAddress(sdk),
    getNFTs: () => getNFTs(sdk),
    transferNFT: (tokenId, to) => transferNFT(sdk, tokenId, to, setTransactionStatus),
    checkWalletInstalled: () => checkWalletInstalled(sdk),
    subscribeToEvents: (eventName, callback) => sdk.subscribeToEvents(eventName, callback),
    unsubscribeFromEvents: (eventName) => sdk.unsubscribeFromEvents(eventName),
    createTrustLine: () => createTrustLine(sdk, values, setTransactionStatus),
    getBalances: () => getBalances(sdk),
    issueToken: () => issueToken(sdk, values, setTransactionStatus),
    sdk
  };
  return /* @__PURE__ */ import_react.default.createElement(BlockchainContext.Provider, { value: contextValue }, children);
};
var useBlockchain = () => {
  const context = (0, import_react.useContext)(BlockchainContext);
  if (!context) {
    throw new Error("useBlockchain must be used within a BlockchainProvider");
  }
  return context;
};

// src/components/BalanceDisplay.tsx
var BalanceDisplay = ({
  className = "",
  refreshInterval = null
  // Default to no refresh
}) => {
  const { connectionStatus, getBalance: getBalance2, getCurrencySymbol: getCurrencySymbol2 } = useBlockchain();
  const [balance, setBalance] = (0, import_react2.useState)("0");
  const [symbol, setSymbol] = (0, import_react2.useState)("");
  const [isLoading, setIsLoading] = (0, import_react2.useState)(false);
  const [error, setError] = (0, import_react2.useState)(null);
  const fetchBalance = async () => {
    if (connectionStatus !== "Connected")
      return;
    try {
      setIsLoading(true);
      setError(null);
      const [newBalance, currencySymbol] = await Promise.all([
        getBalance2(),
        getCurrencySymbol2()
      ]);
      setBalance(newBalance);
      setSymbol(currencySymbol);
    } catch (err) {
      setError("Failed to fetch balance");
      console.error("Error fetching balance:", err);
    } finally {
      setIsLoading(false);
    }
  };
  (0, import_react2.useEffect)(() => {
    fetchBalance();
    if (refreshInterval !== null) {
      const intervalId = setInterval(fetchBalance, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [connectionStatus, refreshInterval]);
  const renderBalance = () => {
    if (!connectionStatus || connectionStatus === "Disconnected") {
      return "Not connected";
    }
    if (connectionStatus === "Connecting...") {
      return "Connecting...";
    }
    if (isLoading) {
      return "Loading...";
    }
    if (error) {
      return error;
    }
    return `${balance} ${symbol}`;
  };
  const getBalanceClassNames = () => {
    const baseClass = "easya-balance-display__value";
    if (!connectionStatus || connectionStatus === "Disconnected") {
      return `${baseClass} easya-balance-display__value--disconnected`;
    }
    if (isLoading) {
      return `${baseClass} easya-balance-display__value--loading`;
    }
    return baseClass;
  };
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: `easya-balance-display ${className}` }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "easya-balance-display__content" }, /* @__PURE__ */ import_react2.default.createElement("h3", { className: "easya-balance-display__title" }, "Current Balance"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "easya-balance-display__info" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: getBalanceClassNames() }, renderBalance()), /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      onClick: fetchBalance,
      disabled: !connectionStatus || connectionStatus !== "Connected" || isLoading,
      className: "easya-balance-display__refresh",
      "aria-label": "Refresh balance"
    },
    "Refresh"
  )), error && /* @__PURE__ */ import_react2.default.createElement("p", { className: "easya-balance-display__error", role: "alert" }, error)));
};
var BalanceDisplay_default = BalanceDisplay;

// src/components/ConnectButton.tsx
var import_react3 = __toESM(require("react"));
var ConnectButton = ({ className = "" }) => {
  const {
    connectionStatus,
    connectToBlockchain,
    disconnectFromBlockchain,
    transactionStatus,
    checkWalletInstalled: checkWalletInstalled2
  } = useBlockchain();
  const [isWalletInstalled, setIsWalletInstalled] = (0, import_react3.useState)(null);
  const [errorMessage, setErrorMessage] = (0, import_react3.useState)("");
  const isConnecting = connectionStatus === "Connecting...";
  const isDisconnecting = connectionStatus === "Disconnecting...";
  const isConnected = connectionStatus === "Connected";
  (0, import_react3.useEffect)(() => {
    const checkWallet = async () => {
      try {
        const hasWallet = await checkWalletInstalled2();
        setIsWalletInstalled(hasWallet);
        if (!hasWallet) {
          setErrorMessage("Please install a wallet to connect to the blockchain");
        }
      } catch (error) {
        setIsWalletInstalled(false);
        setErrorMessage("Error checking wallet status");
      }
    };
    checkWallet();
  }, [checkWalletInstalled2]);
  const getButtonClass = () => {
    if (!isWalletInstalled)
      return "button-error";
    if (isConnected)
      return "button-disconnected";
    if (isConnecting)
      return "button-connecting";
    if (isDisconnecting)
      return "button-disconnecting";
    return "button-connect";
  };
  const getButtonText = () => {
    if (!isWalletInstalled)
      return "Wallet Not Found";
    if (isConnected)
      return "Disconnect";
    if (isConnecting)
      return "Connecting...";
    if (isDisconnecting)
      return "Disconnecting...";
    return "Connect to Blockchain";
  };
  const handleClick = async () => {
    if (!isWalletInstalled) {
      setErrorMessage("Please install a wallet to connect to the blockchain");
      return;
    }
    try {
      if (isConnected) {
        await disconnectFromBlockchain();
      } else {
        await connectToBlockchain();
      }
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to connect to blockchain");
    }
  };
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "connect-button-container" }, /* @__PURE__ */ import_react3.default.createElement(
    "button",
    {
      onClick: handleClick,
      disabled: !isWalletInstalled || isConnecting || isDisconnecting,
      className: `connect-button ${getButtonClass()} ${className}`
    },
    getButtonText()
  ), errorMessage && /* @__PURE__ */ import_react3.default.createElement("div", { className: "text-red-500 text-sm mt-2" }, errorMessage));
};
var ConnectButton_default = ConnectButton;

// src/components/MintNFTButton.tsx
var import_react4 = __toESM(require("react"));
var MintNFTButton = ({ className = "" }) => {
  const {
    connectionStatus,
    transactionStatus,
    values,
    updateValue,
    mintNFT: mintNFT2
  } = useBlockchain();
  const isConnected = connectionStatus === "Connected";
  const isMinting = transactionStatus === "Minting NFT...";
  const getButtonColor = () => {
    if (!isConnected)
      return "button-disconnected";
    if (isMinting)
      return "button-minting";
    return "button-ready";
  };
  const getButtonText = () => {
    if (!isConnected)
      return "Connect to Blockchain First";
    if (isMinting)
      return "Minting...";
    return "Mint NFT";
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    mintNFT2();
  };
  const isFormValid = values.nftName.trim() !== "" && values.nftDescription.trim() !== "" && isConnected;
  return /* @__PURE__ */ import_react4.default.createElement("form", { onSubmit: handleSubmit, className: "nft-form" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "input-container" }, /* @__PURE__ */ import_react4.default.createElement(
    "input",
    {
      type: "text",
      placeholder: "NFT Name",
      value: values.nftName,
      onChange: (e) => updateValue("nftName", e.target.value),
      disabled: !isConnected || isMinting,
      className: "nft-input"
    }
  ), /* @__PURE__ */ import_react4.default.createElement(
    "textarea",
    {
      placeholder: "NFT Description",
      value: values.nftDescription,
      onChange: (e) => updateValue("nftDescription", e.target.value),
      disabled: !isConnected || isMinting,
      className: "nft-textarea"
    }
  )), /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "submit",
      disabled: !isFormValid || isMinting,
      className: `mint-button ${getButtonColor()} ${className}`
    },
    getButtonText()
  ), transactionStatus && /* @__PURE__ */ import_react4.default.createElement("p", { className: "status-text" }, transactionStatus));
};
var MintNFTButton_default = MintNFTButton;

// src/components/NFTMintingForm.tsx
var import_react6 = __toESM(require("react"));

// src/components/TransactionStatus.tsx
var import_react5 = __toESM(require("react"));
var TransactionStatus = ({
  status,
  isLoading = false
}) => {
  var _a, _b;
  const { sdk } = useBlockchain();
  if (!status && !isLoading) {
    return null;
  }
  const chain = ((_a = sdk == null ? void 0 : sdk.getBlockchain()) == null ? void 0 : _a.toLowerCase()) || "xrpl";
  const isTestnet = ((_b = sdk == null ? void 0 : sdk.config) == null ? void 0 : _b.network) === "testnet";
  const xrplHashMatch = status == null ? void 0 : status.match(/Hash: ([a-fA-F0-9]+)/);
  const xrplNftMatch = status == null ? void 0 : status.match(/NFT minted successfully! (.*)/);
  const aptosHashMatch = status == null ? void 0 : status.match(/Version: (\d+)/);
  const aptosNftMatch = status == null ? void 0 : status.match(/Token minted: (0x[a-fA-F0-9]+)/);
  const hash = chain === "xrpl" ? xrplHashMatch ? xrplHashMatch[1] : null : aptosHashMatch ? aptosHashMatch[1] : null;
  const nftId = chain === "xrpl" ? xrplNftMatch ? xrplNftMatch[1] : null : aptosNftMatch ? aptosNftMatch[1] : null;
  const explorerUrls = {
    xrpl: {
      testnet: {
        transaction: "https://test.xrplexplorer.com/explorer/",
        nft: "https://test.xrplexplorer.com/en/nft/"
      },
      mainnet: {
        transaction: "https://xrplexplorer.com/explorer/",
        nft: "https://xrplexplorer.com/en/nft/"
      }
    },
    aptos: {
      testnet: {
        transaction: "https://explorer.aptoslabs.com/txn/",
        nft: "https://explorer.aptoslabs.com/token/"
      },
      mainnet: {
        transaction: "https://explorer.aptoslabs.com/txn/",
        nft: "https://explorer.aptoslabs.com/token/"
      }
    }
  };
  const network = isTestnet ? "testnet" : "mainnet";
  const explorerUrl = hash ? `${explorerUrls[chain][network].transaction}${hash}` : null;
  const nftExplorerUrl = nftId ? `${explorerUrls[chain][network].nft}${nftId}` : null;
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "transaction-status-container" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "content-wrapper" }, isLoading ? /* @__PURE__ */ import_react5.default.createElement("div", { className: "status-message loading" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "loading-spinner" }), /* @__PURE__ */ import_react5.default.createElement("span", null, "Processing ", chain.toUpperCase(), " transaction on ", network, "...")) : /* @__PURE__ */ import_react5.default.createElement("div", { className: "status-links" }, explorerUrl && /* @__PURE__ */ import_react5.default.createElement("div", { className: "explorer-link-container" }, /* @__PURE__ */ import_react5.default.createElement(
    "a",
    {
      href: explorerUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "explorer-link"
    },
    /* @__PURE__ */ import_react5.default.createElement("span", null, "View on ", chain.toUpperCase(), " Explorer (", network, ")"),
    /* @__PURE__ */ import_react5.default.createElement(
      "svg",
      {
        className: "explorer-icon",
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      },
      /* @__PURE__ */ import_react5.default.createElement("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }),
      /* @__PURE__ */ import_react5.default.createElement("polyline", { points: "15 3 21 3 21 9" }),
      /* @__PURE__ */ import_react5.default.createElement("line", { x1: "10", y1: "14", x2: "21", y2: "3" })
    )
  )), nftExplorerUrl && /* @__PURE__ */ import_react5.default.createElement("div", { className: "explorer-link-container" }, /* @__PURE__ */ import_react5.default.createElement(
    "a",
    {
      href: nftExplorerUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "explorer-link"
    },
    /* @__PURE__ */ import_react5.default.createElement("span", null, "View NFT on ", chain.toUpperCase(), " Explorer (", network, ")"),
    /* @__PURE__ */ import_react5.default.createElement(
      "svg",
      {
        className: "explorer-icon",
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      },
      /* @__PURE__ */ import_react5.default.createElement("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }),
      /* @__PURE__ */ import_react5.default.createElement("polyline", { points: "15 3 21 3 21 9" }),
      /* @__PURE__ */ import_react5.default.createElement("line", { x1: "10", y1: "14", x2: "21", y2: "3" })
    )
  )), !explorerUrl && !nftExplorerUrl && (status ? /* @__PURE__ */ import_react5.default.createElement("div", { className: "status-message raw-status" }, /* @__PURE__ */ import_react5.default.createElement("span", null, "Raw Status: ", status)) : /* @__PURE__ */ import_react5.default.createElement("div", { className: "status-message" }, /* @__PURE__ */ import_react5.default.createElement("span", null, "No transaction data available"))))));
};
var TransactionStatus_default = TransactionStatus;

// src/components/NFTMintingForm.tsx
var defaultConfig = {
  showMetadataGenerator: true,
  nftURI: {
    show: false,
    required: true,
    label: "NFT URI:",
    placeholder: "ipfs://... or generate from metadata"
  },
  nftTaxon: {
    show: true,
    required: true,
    label: "Collection:"
  },
  nftTransferFee: {
    show: false,
    required: false,
    label: "Transfer Fee (0-50000):"
  },
  nftFlags: {
    show: false,
    required: false,
    label: "Flags:"
  },
  imageUrl: {
    show: true,
    required: true,
    label: "Image URL:",
    placeholder: "https://..."
  },
  name: {
    show: true,
    required: true,
    label: "NFT Name:",
    placeholder: "My NFT"
  },
  description: {
    show: true,
    required: true,
    label: "Description:",
    placeholder: "Describe your NFT"
  }
};
var FormField = ({ id, type, value, onChange, config, min, max }) => {
  if (!config.show)
    return null;
  return /* @__PURE__ */ import_react6.default.createElement("div", { className: "form-field-container" }, /* @__PURE__ */ import_react6.default.createElement("label", { htmlFor: id, className: "form-field-label" }, config.label, config.required && /* @__PURE__ */ import_react6.default.createElement("span", { className: "form-field-required" }, "*")), /* @__PURE__ */ import_react6.default.createElement(
    "input",
    {
      id,
      type,
      value,
      onChange: (e) => onChange(e.target.value),
      className: "form-field-input",
      placeholder: config.placeholder,
      required: config.required,
      min,
      max
    }
  ));
};
var NFTMintingForm = ({ config = {} }) => {
  const {
    values,
    updateValue,
    mintNFT: mintNFT2,
    connectionStatus,
    transactionStatus,
    sdk
  } = useBlockchain();
  if ((sdk == null ? void 0 : sdk.config.blockchain) !== "xrpl") {
    return /* @__PURE__ */ import_react6.default.createElement("div", { className: "p-4 text-center" }, /* @__PURE__ */ import_react6.default.createElement("h2", { className: "text-xl font-semibold mb-4" }, "NFT Minting"), /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-gray-600" }, "NFT minting is currently only supported on XRPL."));
  }
  const [metadataFields, setMetadataFields] = (0, import_react6.useState)({
    imageUrl: "",
    name: "",
    description: ""
  });
  function createMetaData(imageUrl, name, description) {
    return {
      name,
      description,
      image: imageUrl
    };
  }
  const handleMetadataChange = (field) => (value) => {
    const updatedFields = __spreadProps(__spreadValues({}, metadataFields), { [field]: value });
    setMetadataFields(updatedFields);
    if (updatedFields.imageUrl && updatedFields.name) {
      const metadata = createMetaData(
        updatedFields.imageUrl,
        updatedFields.name,
        updatedFields.description
      );
      updateValue("nftURI", metadata);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    await mintNFT2();
  };
  const isConnected = connectionStatus === "Connected";
  const isMetadataComplete = (0, import_react6.useMemo)(() => {
    return Boolean(
      metadataFields.imageUrl && metadataFields.name && metadataFields.description && values.nftTaxon
    );
  }, [metadataFields, values.nftTaxon]);
  const isMintEnabled = isConnected && isMetadataComplete;
  const finalConfig = __spreadValues(__spreadValues({}, defaultConfig), Object.fromEntries(
    Object.entries(config).map(([key, value]) => [
      key,
      typeof value === "object" ? __spreadValues(__spreadValues({}, defaultConfig[key]), value) : value
    ])
  ));
  return /* @__PURE__ */ import_react6.default.createElement("form", { onSubmit: handleSubmit, className: "nft-minting-form" }, /* @__PURE__ */ import_react6.default.createElement("h2", null, "Mint NFT"), /* @__PURE__ */ import_react6.default.createElement("div", { className: "nft-minting-form-section" }, finalConfig.showMetadataGenerator && /* @__PURE__ */ import_react6.default.createElement("div", { className: "metadata-generator" }, /* @__PURE__ */ import_react6.default.createElement("h3", null, "Metadata Generator"), /* @__PURE__ */ import_react6.default.createElement("div", null, /* @__PURE__ */ import_react6.default.createElement(
    FormField,
    {
      id: "imageUrl",
      type: "text",
      value: metadataFields.imageUrl,
      onChange: handleMetadataChange("imageUrl"),
      config: finalConfig.imageUrl
    }
  ), /* @__PURE__ */ import_react6.default.createElement(
    FormField,
    {
      id: "name",
      type: "text",
      value: metadataFields.name,
      onChange: handleMetadataChange("name"),
      config: finalConfig.name
    }
  ), /* @__PURE__ */ import_react6.default.createElement(
    FormField,
    {
      id: "description",
      type: "text",
      value: metadataFields.description,
      onChange: handleMetadataChange("description"),
      config: finalConfig.description
    }
  ))), /* @__PURE__ */ import_react6.default.createElement(
    FormField,
    {
      id: "nftURI",
      type: "text",
      value: values.nftURI || "",
      onChange: (value) => updateValue("nftURI", value),
      config: finalConfig.nftURI
    }
  ), /* @__PURE__ */ import_react6.default.createElement(
    FormField,
    {
      id: "nftTaxon",
      type: "number",
      value: values.nftTaxon,
      onChange: (value) => updateValue("nftTaxon", value),
      config: finalConfig.nftTaxon,
      min: "0"
    }
  ), /* @__PURE__ */ import_react6.default.createElement(
    FormField,
    {
      id: "nftTransferFee",
      type: "number",
      value: values.nftTransferFee,
      onChange: (value) => updateValue("nftTransferFee", value),
      config: finalConfig.nftTransferFee,
      min: "0",
      max: "50000"
    }
  ), /* @__PURE__ */ import_react6.default.createElement(
    FormField,
    {
      id: "nftFlags",
      type: "number",
      value: values.nftFlags,
      onChange: (value) => updateValue("nftFlags", value),
      config: finalConfig.nftFlags,
      min: "0"
    }
  ), /* @__PURE__ */ import_react6.default.createElement(
    "button",
    {
      type: "submit",
      className: "mint-button",
      disabled: !isMintEnabled || transactionStatus === "Processing"
    },
    !isConnected ? "Connect Wallet to Mint" : !isMetadataComplete ? "Complete Metadata to Mint" : "Mint NFT"
  ), transactionStatus && /* @__PURE__ */ import_react6.default.createElement(TransactionStatus_default, { status: transactionStatus })));
};
var NFTMintingForm_default = NFTMintingForm;

// src/components/TransactionForm.tsx
var import_react7 = __toESM(require("react"));

// src/utils/supported_currencies.ts
var DEFAULT_SUPPORTED_CURRENCIES = [
  {
    name: "US Dollar",
    symbol: "USD"
  },
  {
    name: "Euro",
    symbol: "EUR"
  },
  {
    name: "British Pounds",
    symbol: "GBP"
  }
];

// src/components/TransactionForm.tsx
var TransactionForm = () => {
  const {
    values,
    updateValue,
    sendTransaction: sendTransaction2,
    connectionStatus,
    transactionStatus,
    getBalance: getBalance2,
    getBalances: getBalances2,
    getCurrencySymbol: getCurrencySymbol2,
    sdk
  } = useBlockchain();
  const [selectedAsset, setSelectedAsset] = (0, import_react7.useState)(null);
  const [availableAssets, setAvailableAssets] = (0, import_react7.useState)([]);
  const [error, setError] = (0, import_react7.useState)("");
  const [transactionError, setTransactionError] = (0, import_react7.useState)("");
  const isConnected = connectionStatus == null ? void 0 : connectionStatus.toLowerCase().includes("connected");
  (0, import_react7.useEffect)(() => {
    const fetchAssets = async () => {
      if (!isConnected)
        return;
      try {
        const tokenBalances = await getBalances2();
        const positiveBalances = tokenBalances.filter(
          (balance) => "value" in balance && parseFloat(balance.value) > 0
        );
        const allAssets = [...DEFAULT_SUPPORTED_CURRENCIES, ...positiveBalances];
        setAvailableAssets(allAssets);
      } catch (err) {
        console.error("Error fetching balances:", err);
        setError("Failed to fetch available assets");
      }
    };
    fetchAssets();
  }, [isConnected, getBalances2]);
  const handleAmountChange = (e) => {
    const amount = e.target.value;
    updateValue("transactionAmount", amount);
    setTransactionError("");
    if (selectedAsset) {
      const balance = "value" in selectedAsset ? selectedAsset.value : "0";
      if (parseFloat(amount) > parseFloat(balance)) {
        setError(`Insufficient balance. You have ${balance} available.`);
      } else {
        setError("");
      }
    }
  };
  const handleAssetChange = (e) => {
    const selectedId = e.target.value;
    const asset = availableAssets.find(
      (a) => "symbol" in a ? a.symbol === selectedId : a.currency === selectedId
    );
    if (asset) {
      setSelectedAsset(asset);
      updateValue("selectedCurrency", "symbol" in asset ? asset.name : asset.currency);
      updateValue("transactionAmount", "");
      setError("");
      setTransactionError("");
    }
  };
  const handleSendTransaction = async () => {
    try {
      setTransactionError("");
      await sendTransaction2();
    } catch (error2) {
      const errorMessage = error2 instanceof Error ? error2.message : "Unknown error occurred";
      setTransactionError(errorMessage);
    }
  };
  if (!sdk) {
    return /* @__PURE__ */ import_react7.default.createElement("div", { className: "p-4 text-center" }, /* @__PURE__ */ import_react7.default.createElement("h2", { className: "text-xl font-semibold mb-4" }, "Not Supported"), /* @__PURE__ */ import_react7.default.createElement("p", { className: "text-gray-600" }, "Currently, this feature is not supported."));
  }
  const getAssetDisplay = (asset) => {
    if ("symbol" in asset) {
      return `${asset.name} (${asset.symbol})`;
    }
    return `${asset.nonStandard || asset.currency}${asset.issuer ? ` (${asset.issuer})` : ""}`;
  };
  const getAssetId = (asset) => "symbol" in asset ? asset.symbol : asset.currency;
  const displayStatus = error || transactionError || transactionStatus || "";
  return /* @__PURE__ */ import_react7.default.createElement("div", { className: "transaction-form-container space-y-4" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "balance-display p-2 bg-gray-50 rounded-lg" }, selectedAsset ? `Balance: ${"value" in selectedAsset ? selectedAsset.value : "0"} ${getAssetDisplay(selectedAsset)}` : "Select an asset to view balance"), /* @__PURE__ */ import_react7.default.createElement(
    "input",
    {
      type: "text",
      placeholder: "Recipient Address",
      value: values.recipientAddress,
      onChange: (e) => updateValue("recipientAddress", e.target.value),
      className: "transaction-input w-full p-2 border rounded",
      disabled: !isConnected
    }
  ), /* @__PURE__ */ import_react7.default.createElement("div", { className: "amount-input-container flex space-x-2" }, /* @__PURE__ */ import_react7.default.createElement(
    "select",
    {
      value: selectedAsset ? getAssetId(selectedAsset) : "",
      onChange: handleAssetChange,
      className: "asset-select flex-1 p-2 border rounded",
      disabled: !isConnected
    },
    /* @__PURE__ */ import_react7.default.createElement("option", { value: "" }, "Select Asset"),
    availableAssets.map((asset) => /* @__PURE__ */ import_react7.default.createElement("option", { key: getAssetId(asset), value: getAssetId(asset) }, getAssetDisplay(asset)))
  ), /* @__PURE__ */ import_react7.default.createElement("div", { className: "relative flex-1" }, /* @__PURE__ */ import_react7.default.createElement(
    "input",
    {
      type: "number",
      placeholder: selectedAsset ? `Amount` : "Select asset first",
      value: values.transactionAmount,
      onChange: handleAmountChange,
      className: "transaction-input w-full p-2 border rounded",
      disabled: !isConnected || !selectedAsset,
      min: "0",
      step: "any"
    }
  ))), /* @__PURE__ */ import_react7.default.createElement(
    "button",
    {
      onClick: handleSendTransaction,
      className: "transaction-button w-full p-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed",
      disabled: !isConnected || !!error || !values.recipientAddress || !values.transactionAmount || !selectedAsset
    },
    values.transactionAmount && selectedAsset ? `Send ${values.transactionAmount} ${getAssetId(selectedAsset)}` : "Send Transaction"
  ), displayStatus && /* @__PURE__ */ import_react7.default.createElement("div", { className: `text-center p-2 rounded ${error || transactionError ? "bg-red-100 text-red-700" : "bg-gray-100"}` }, displayStatus));
};
var TransactionForm_default = TransactionForm;

// src/components/AddressDisplay.tsx
var import_react8 = __toESM(require("react"));
var AddressDisplay = ({
  className = "",
  refreshInterval = 1e4
  // Default refresh every 10 seconds
}) => {
  const { connectionStatus, getAddress: getAddress2 } = useBlockchain();
  const [address, setAddress] = (0, import_react8.useState)("");
  const [isLoading, setIsLoading] = (0, import_react8.useState)(false);
  const [error, setError] = (0, import_react8.useState)(null);
  const [copySuccess, setCopySuccess] = (0, import_react8.useState)(false);
  const fetchAddress = async () => {
    if (connectionStatus !== "Connected")
      return;
    try {
      setIsLoading(true);
      setError(null);
      const newAddress = await getAddress2();
      setAddress(newAddress);
    } catch (err) {
      setError("Failed to fetch address");
      console.error("Error fetching address:", err);
    } finally {
      setIsLoading(false);
    }
  };
  (0, import_react8.useEffect)(() => {
    fetchAddress();
    const intervalId = setInterval(fetchAddress, refreshInterval);
    return () => clearInterval(intervalId);
  }, [connectionStatus, refreshInterval]);
  const handleCopyAddress = async () => {
    if (!address)
      return;
    try {
      await navigator.clipboard.writeText(address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2e3);
    } catch (err) {
      console.error("Failed to copy address:", err);
      setError("Failed to copy address to clipboard");
    }
  };
  const renderAddress = () => {
    if (!connectionStatus || connectionStatus === "Disconnected") {
      return "Not connected";
    }
    if (connectionStatus === "Connecting...") {
      return "Connecting...";
    }
    if (isLoading) {
      return "Loading...";
    }
    if (error) {
      return error;
    }
    if (address && address.length > 10) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };
  const getAddressClassNames = () => {
    const baseClass = "easya-address-display__value";
    if (!connectionStatus || connectionStatus === "Disconnected") {
      return `${baseClass} easya-address-display__value--disconnected`;
    }
    if (isLoading) {
      return `${baseClass} easya-address-display__value--loading`;
    }
    return baseClass;
  };
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: `easya-address-display ${className}` }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "easya-address-display__content" }, /* @__PURE__ */ import_react8.default.createElement("h3", { className: "easya-address-display__title" }, "Current Address"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "easya-address-display__info" }, /* @__PURE__ */ import_react8.default.createElement("span", { className: getAddressClassNames() }, renderAddress()), /* @__PURE__ */ import_react8.default.createElement("div", { className: "easya-address-display__actions" }, /* @__PURE__ */ import_react8.default.createElement(
    "button",
    {
      onClick: handleCopyAddress,
      disabled: !address || connectionStatus !== "Connected",
      className: "easya-address-display__copy",
      "aria-label": copySuccess ? "Address copied" : "Copy address",
      title: copySuccess ? "Address copied" : "Copy address"
    },
    copySuccess ? "Copied!" : "Copy"
  ), /* @__PURE__ */ import_react8.default.createElement(
    "button",
    {
      onClick: fetchAddress,
      disabled: !connectionStatus || connectionStatus !== "Connected" || isLoading,
      className: "easya-address-display__refresh",
      "aria-label": "Refresh address"
    },
    "Refresh"
  ))), error && /* @__PURE__ */ import_react8.default.createElement("p", { className: "easya-address-display__error", role: "alert" }, error)));
};
var AddressDisplay_default = AddressDisplay;

// src/components/NFTTransferForm.tsx
var import_react9 = __toESM(require("react"));
var NFTTransferForm = () => {
  const {
    connectionStatus,
    transactionStatus,
    transferNFT: transferNFT2
  } = useBlockchain();
  const [formData, setFormData] = (0, import_react9.useState)({
    tokenId: "",
    recipientAddress: ""
  });
  const [error, setError] = (0, import_react9.useState)("");
  const isConnected = connectionStatus == null ? void 0 : connectionStatus.toLowerCase().includes("connected");
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => __spreadProps(__spreadValues({}, prev), {
      [name]: value
    }));
    setError("");
  };
  const handleTransfer = async () => {
    try {
      if (!formData.tokenId.trim() || !formData.recipientAddress.trim()) {
        setError("Please fill in all fields");
        return;
      }
      await transferNFT2(formData.tokenId, formData.recipientAddress);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to transfer NFT");
    }
  };
  return /* @__PURE__ */ import_react9.default.createElement("div", { className: "nft-transfer-form" }, /* @__PURE__ */ import_react9.default.createElement("h2", { className: "form-title" }, "Transfer NFT"), /* @__PURE__ */ import_react9.default.createElement("div", { className: "form-container" }, /* @__PURE__ */ import_react9.default.createElement("div", { className: "form-field" }, /* @__PURE__ */ import_react9.default.createElement("label", { className: "form-label" }, "Token ID"), /* @__PURE__ */ import_react9.default.createElement(
    "input",
    {
      type: "text",
      name: "tokenId",
      placeholder: "Enter NFT Token ID",
      value: formData.tokenId,
      onChange: handleInputChange,
      className: "form-input",
      disabled: !isConnected
    }
  )), /* @__PURE__ */ import_react9.default.createElement("div", { className: "form-field" }, /* @__PURE__ */ import_react9.default.createElement("label", { className: "form-label" }, "Recipient Address"), /* @__PURE__ */ import_react9.default.createElement(
    "input",
    {
      type: "text",
      name: "recipientAddress",
      placeholder: "Enter recipient's wallet address",
      value: formData.recipientAddress,
      onChange: handleInputChange,
      className: "form-input",
      disabled: !isConnected
    }
  )), error && /* @__PURE__ */ import_react9.default.createElement("div", { className: "error-message" }, error), /* @__PURE__ */ import_react9.default.createElement(
    "button",
    {
      onClick: handleTransfer,
      disabled: !isConnected || !formData.tokenId || !formData.recipientAddress,
      className: "transfer-button"
    },
    "Transfer NFT"
  ), transactionStatus && /* @__PURE__ */ import_react9.default.createElement(TransactionStatus, { status: transactionStatus })));
};
var NFTTransferForm_default = NFTTransferForm;

// src/components/NFTGallery.tsx
var import_react10 = __toESM(require("react"));
var NFTGallery = ({ className = "" }) => {
  const { connectionStatus, sdk, getNFTs: getNFTs2 } = useBlockchain();
  const [searchTerm, setSearchTerm] = (0, import_react10.useState)("");
  const [nfts, setNfts] = (0, import_react10.useState)([]);
  const [loading, setLoading] = (0, import_react10.useState)(false);
  const [error, setError] = (0, import_react10.useState)(null);
  (0, import_react10.useEffect)(() => {
    const fetchNFTs = async () => {
      if (connectionStatus !== "Connected")
        return;
      setLoading(true);
      setError(null);
      try {
        const fetchedNFTs = await getNFTs2();
        setNfts(fetchedNFTs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch NFTs");
        console.error("Error fetching NFTs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNFTs();
  }, [connectionStatus, getNFTs2]);
  const filterNFTs = (nfts2) => {
    return nfts2.filter((nft) => {
      if (searchTerm) {
        return nft.name.toLowerCase().includes(searchTerm.toLowerCase()) || nft.description.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
  };
  const handleBuyNFT = async (nftId) => {
    try {
      console.log(`Initiating purchase for NFT ${nftId}`);
    } catch (error2) {
      console.error("Error buying NFT:", error2);
    }
  };
  const ImagePlaceholder = () => /* @__PURE__ */ import_react10.default.createElement(
    "svg",
    {
      className: "placeholder-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2"
    },
    /* @__PURE__ */ import_react10.default.createElement("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
    /* @__PURE__ */ import_react10.default.createElement("circle", { cx: "8.5", cy: "8.5", r: "1.5" }),
    /* @__PURE__ */ import_react10.default.createElement("path", { d: "M20.4 14.5L16 10 4 20" })
  );
  const NFTCard = ({ nft }) => /* @__PURE__ */ import_react10.default.createElement("div", { className: "nft-card" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "nft-image-container" }, nft.imageUrl ? /* @__PURE__ */ import_react10.default.createElement(
    "img",
    {
      src: nft.imageUrl,
      alt: nft.name,
      className: "nft-image",
      onError: (e) => {
        var _a;
        const target = e.target;
        target.style.display = "none";
        (_a = target.parentElement) == null ? void 0 : _a.classList.add("fallback-active");
      }
    }
  ) : /* @__PURE__ */ import_react10.default.createElement("div", { className: "nft-placeholder" }, /* @__PURE__ */ import_react10.default.createElement(ImagePlaceholder, null))), /* @__PURE__ */ import_react10.default.createElement("div", { className: "nft-info" }, /* @__PURE__ */ import_react10.default.createElement("h3", { className: "nft-name" }, nft.name), /* @__PURE__ */ import_react10.default.createElement("p", { className: "nft-description" }, nft.description), /* @__PURE__ */ import_react10.default.createElement("div", { className: "nft-details" }, /* @__PURE__ */ import_react10.default.createElement("span", { className: "nft-token-id" }, "Token ID: ", nft.id), /* @__PURE__ */ import_react10.default.createElement("span", { className: "nft-owner" }, nft.owner.slice(0, 6), "...", nft.owner.slice(-4)), /* @__PURE__ */ import_react10.default.createElement("span", { className: "nft-price" }, nft.price || "Not for sale")), connectionStatus === "Connected" && nft.price && nft.price !== "Not for sale" && /* @__PURE__ */ import_react10.default.createElement(
    "button",
    {
      onClick: () => handleBuyNFT(nft.id),
      className: "buy-button"
    },
    "Purchase"
  )));
  const EmptyStateIcon = () => /* @__PURE__ */ import_react10.default.createElement(
    "svg",
    {
      className: "empty-state-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5"
    },
    /* @__PURE__ */ import_react10.default.createElement("path", { d: "M4 4v16a2 2 0 002 2h12a2 2 0 002-2V8.342a2 2 0 00-.602-1.43l-4.44-4.342A2 2 0 0013.56 2H6a2 2 0 00-2 2z" }),
    /* @__PURE__ */ import_react10.default.createElement("path", { d: "M14 2v4a2 2 0 002 2h4" }),
    /* @__PURE__ */ import_react10.default.createElement("path", { d: "M10 9v8" }),
    /* @__PURE__ */ import_react10.default.createElement("path", { d: "M14 13H6" })
  );
  if ((sdk == null ? void 0 : sdk.getBlockchain()) !== "xrpl") {
    return /* @__PURE__ */ import_react10.default.createElement("div", { className: "p-4 text-center" }, /* @__PURE__ */ import_react10.default.createElement("h2", { className: "text-xl font-semibold mb-4" }, "NFT Gallery"), /* @__PURE__ */ import_react10.default.createElement("p", { className: "text-gray-600" }, "NFT Gallery is currently only supported on XRPL."));
  }
  return /* @__PURE__ */ import_react10.default.createElement("div", { className: `nft-gallery ${className}` }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "gallery-header" }, /* @__PURE__ */ import_react10.default.createElement("h2", { className: "gallery-title" }, "Gallery"), connectionStatus !== "Connected" && /* @__PURE__ */ import_react10.default.createElement("p", { className: "connection-warning" }, "Connect wallet to view NFTs")), /* @__PURE__ */ import_react10.default.createElement("div", { className: "gallery-controls" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "search-box" }, /* @__PURE__ */ import_react10.default.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search collection",
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value),
      className: "search-input"
    }
  ))), /* @__PURE__ */ import_react10.default.createElement("div", { className: "nft-grid" }, loading ? Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ import_react10.default.createElement("div", { key: index, className: "nft-card loading" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "nft-image-container skeleton" }), /* @__PURE__ */ import_react10.default.createElement("div", { className: "nft-info" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "nft-name skeleton" }), /* @__PURE__ */ import_react10.default.createElement("div", { className: "nft-description skeleton" })))) : error ? /* @__PURE__ */ import_react10.default.createElement("div", { className: "error-message" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "connection-warning" }, error)) : filterNFTs(nfts).length === 0 ? /* @__PURE__ */ import_react10.default.createElement("div", { className: "empty-state" }, /* @__PURE__ */ import_react10.default.createElement(EmptyStateIcon, null), /* @__PURE__ */ import_react10.default.createElement("div", { className: "empty-message" }, searchTerm ? "No items match your search" : "No items available")) : filterNFTs(nfts).map((nft) => /* @__PURE__ */ import_react10.default.createElement(NFTCard, { key: nft.id, nft }))));
};
var NFTGallery_default = NFTGallery;

// src/components/ConfigSelector.tsx
var import_react11 = __toESM(require("react"));
var ConfigSelector = ({ currentConfig, onConfigChange }) => {
  const [config, setConfig] = (0, import_react11.useState)(currentConfig);
  const networks = ["mainnet", "testnet"];
  const blockchains = ["xrpl", "aptos"];
  const wallets = ["crossmark", "gem"];
  const handleChange = (field, value) => {
    const newConfig = __spreadProps(__spreadValues({}, config), {
      [field]: value
    });
    setConfig(newConfig);
  };
  const handleSubmit = () => {
    onConfigChange(config);
  };
  return /* @__PURE__ */ import_react11.default.createElement("div", { className: "config-selector" }, /* @__PURE__ */ import_react11.default.createElement("h2", { className: "config-selector__title" }, "Blockchain Configuration"), /* @__PURE__ */ import_react11.default.createElement("div", { className: "config-selector__form" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "config-selector__field" }, /* @__PURE__ */ import_react11.default.createElement("label", { className: "config-selector__label" }, "Network"), /* @__PURE__ */ import_react11.default.createElement(
    "select",
    {
      value: config.network,
      onChange: (e) => handleChange("network", e.target.value),
      className: "config-selector__select"
    },
    networks.map((network) => /* @__PURE__ */ import_react11.default.createElement("option", { key: network, value: network }, network))
  )), /* @__PURE__ */ import_react11.default.createElement("div", { className: "config-selector__field" }, /* @__PURE__ */ import_react11.default.createElement("label", { className: "config-selector__label" }, "Blockchain"), /* @__PURE__ */ import_react11.default.createElement(
    "select",
    {
      value: config.blockchain,
      onChange: (e) => handleChange("blockchain", e.target.value),
      className: "config-selector__select"
    },
    blockchains.map((blockchain) => /* @__PURE__ */ import_react11.default.createElement("option", { key: blockchain, value: blockchain }, blockchain))
  )), /* @__PURE__ */ import_react11.default.createElement("div", { className: "config-selector__field" }, /* @__PURE__ */ import_react11.default.createElement("label", { className: "config-selector__label" }, "Wallet"), /* @__PURE__ */ import_react11.default.createElement(
    "select",
    {
      value: config.wallet,
      onChange: (e) => handleChange("wallet", e.target.value),
      className: "config-selector__select"
    },
    wallets.map((wallet) => /* @__PURE__ */ import_react11.default.createElement("option", { key: wallet, value: wallet }, wallet))
  )), /* @__PURE__ */ import_react11.default.createElement(
    "button",
    {
      onClick: handleSubmit,
      className: "config-selector__button"
    },
    "Update Configuration"
  )));
};
var ConfigSelector_default = ConfigSelector;

// src/components/EventDisplay.tsx
var import_react12 = __toESM(require("react"));
var EventDisplay = () => {
  const { subscribeToEvents, unsubscribeFromEvents, connectionStatus } = useBlockchain();
  const [events, setEvents] = (0, import_react12.useState)([]);
  const [activeSubscriptions, setActiveSubscriptions] = (0, import_react12.useState)(/* @__PURE__ */ new Set());
  const availableEvents = [
    "connected",
    "disconnected",
    "ledgerClosed",
    "validationReceived",
    "transaction",
    "peerStatusChange",
    "consensusPhase",
    "manifestReceived",
    "path_find",
    "error"
  ];
  (0, import_react12.useEffect)(() => {
    return () => {
      activeSubscriptions.forEach((eventName) => {
        unsubscribeFromEvents(eventName).catch(console.error);
      });
    };
  }, [activeSubscriptions, unsubscribeFromEvents]);
  const handleSubscribe = async (eventName) => {
    if (activeSubscriptions.has(eventName))
      return;
    try {
      await subscribeToEvents(eventName, (data) => {
        setEvents((prev) => [{
          timestamp: Date.now(),
          eventName,
          data
        }, ...prev].slice(0, 50));
      });
      setActiveSubscriptions((prev) => /* @__PURE__ */ new Set([...prev, eventName]));
    } catch (error) {
      console.error(`Failed to subscribe to ${eventName}:`, error);
    }
  };
  const handleUnsubscribe = async (eventName) => {
    try {
      await unsubscribeFromEvents(eventName);
      setActiveSubscriptions((prev) => {
        const next = new Set(prev);
        next.delete(eventName);
        return next;
      });
    } catch (error) {
      console.error(`Failed to unsubscribe from ${eventName}:`, error);
    }
  };
  if (connectionStatus !== "Connected") {
    return /* @__PURE__ */ import_react12.default.createElement("div", { className: "p-4 bg-gray-100 rounded" }, /* @__PURE__ */ import_react12.default.createElement("p", { className: "text-gray-600" }, "Please connect to the blockchain to view events."));
  }
  return /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex flex-wrap gap-2 p-4 bg-gray-100 rounded" }, availableEvents.map((eventName) => /* @__PURE__ */ import_react12.default.createElement(
    "button",
    {
      key: eventName,
      onClick: () => activeSubscriptions.has(eventName) ? handleUnsubscribe(eventName) : handleSubscribe(eventName),
      className: `px-4 py-2 rounded-full text-sm font-medium transition-colors
                            ${activeSubscriptions.has(eventName) ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`
    },
    eventName,
    activeSubscriptions.has(eventName) ? " \u2713" : ""
  ))), /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-2" }, events.map((event, index) => /* @__PURE__ */ import_react12.default.createElement("div", { key: `${event.timestamp}-${index}`, className: "p-4 bg-white rounded shadow" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex justify-between items-start" }, /* @__PURE__ */ import_react12.default.createElement("span", { className: "text-sm font-medium text-green-600" }, event.eventName), /* @__PURE__ */ import_react12.default.createElement("span", { className: "text-xs text-gray-500" }, new Date(event.timestamp).toLocaleTimeString())), /* @__PURE__ */ import_react12.default.createElement("pre", { className: "mt-2 text-sm text-gray-700 overflow-x-auto" }, JSON.stringify(event.data, null, 2))))));
};
var EventDisplay_default = EventDisplay;

// src/components/TrustLineForm.tsx
var import_react13 = __toESM(require("react"));
var TrustLineForm = () => {
  const {
    values,
    updateValue,
    connectionStatus,
    transactionStatus,
    sdk
  } = useBlockchain();
  const [error, setError] = (0, import_react13.useState)("");
  const isConnected = connectionStatus == null ? void 0 : connectionStatus.toLowerCase().includes("connected");
  const handleLimitChange = (e) => {
    const limit = e.target.value;
    updateValue("trustLineLimit", limit);
    if (parseFloat(limit) < 0) {
      setError("Trust line limit cannot be negative");
    } else {
      setError("");
    }
  };
  const createTrustLine2 = async () => {
    if (!sdk)
      return;
    try {
      const config = {
        currency: values.currency,
        issuer: values.issuerAddress,
        limit: values.trustLineLimit
      };
      await sdk.createTrustLine(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create trust line");
    }
  };
  if (!sdk) {
    return /* @__PURE__ */ import_react13.default.createElement("div", { className: "p-4 text-center" }, /* @__PURE__ */ import_react13.default.createElement("h2", { className: "text-xl font-semibold mb-4" }, "Not Supported"), /* @__PURE__ */ import_react13.default.createElement("p", { className: "text-gray-600" }, "Currently, this feature is not supported."));
  }
  return /* @__PURE__ */ import_react13.default.createElement("div", { className: "trustline-container" }, /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react13.default.createElement(
    "input",
    {
      type: "text",
      placeholder: "Currency Code (e.g., USD)",
      value: values.currency,
      onChange: (e) => updateValue("currency", e.target.value.toUpperCase()),
      className: "trustline-input",
      disabled: !isConnected
    }
  ), /* @__PURE__ */ import_react13.default.createElement(
    "input",
    {
      type: "text",
      placeholder: "Issuer Address",
      value: values.issuerAddress,
      onChange: (e) => updateValue("issuerAddress", e.target.value),
      className: "trustline-input",
      disabled: !isConnected
    }
  ), /* @__PURE__ */ import_react13.default.createElement(
    "input",
    {
      type: "number",
      placeholder: "Trust Line Limit",
      value: values.trustLineLimit,
      onChange: handleLimitChange,
      className: "trustline-input",
      disabled: !isConnected,
      min: "0",
      step: "any"
    }
  )), error && /* @__PURE__ */ import_react13.default.createElement("div", { className: "trustline-error" }, error), /* @__PURE__ */ import_react13.default.createElement(
    "button",
    {
      onClick: createTrustLine2,
      className: "trustline-button",
      disabled: !isConnected || !!error || !values.currency || !values.issuerAddress || !values.trustLineLimit
    },
    "Create Trust Line"
  ));
};
var TrustLineForm_default = TrustLineForm;

// src/components/BalancesDisplay.tsx
var import_react14 = __toESM(require("react"));
var BalancesDisplay = ({
  className = "",
  refreshInterval = null
  // Default to no refresh
}) => {
  const { connectionStatus, getBalances: getBalances2 } = useBlockchain();
  const [balances, setBalances] = (0, import_react14.useState)([]);
  const [isLoading, setIsLoading] = (0, import_react14.useState)(false);
  const [error, setError] = (0, import_react14.useState)(null);
  const fetchBalances = async () => {
    if (connectionStatus !== "Connected")
      return;
    try {
      setIsLoading(true);
      setError(null);
      const balancesData = await getBalances2();
      const formattedBalances = Array.isArray(balancesData) ? balancesData : [];
      setBalances(formattedBalances);
    } catch (err) {
      setError("Failed to fetch balances");
      console.error("Error fetching balances:", err);
    } finally {
      setIsLoading(false);
    }
  };
  (0, import_react14.useEffect)(() => {
    fetchBalances();
    if (refreshInterval !== null) {
      const intervalId = setInterval(fetchBalances, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [connectionStatus, refreshInterval]);
  const renderBalances = () => {
    if (!connectionStatus || connectionStatus === "Disconnected") {
      return /* @__PURE__ */ import_react14.default.createElement("div", { className: "easya-balances-display__status" }, "Not connected");
    }
    if (connectionStatus === "Connecting...") {
      return /* @__PURE__ */ import_react14.default.createElement("div", { className: "easya-balances-display__status" }, "Connecting...");
    }
    if (isLoading) {
      return /* @__PURE__ */ import_react14.default.createElement("div", { className: "easya-balances-display__status" }, "Loading...");
    }
    if (error) {
      return /* @__PURE__ */ import_react14.default.createElement("div", { className: "easya-balances-display__error", role: "alert" }, error);
    }
    return /* @__PURE__ */ import_react14.default.createElement("div", { className: "easya-balances-display__list" }, balances.map((balance, index) => /* @__PURE__ */ import_react14.default.createElement(
      "div",
      {
        key: `${balance.currency}-${balance.issuer || index}`,
        className: "easya-balances-display__item"
      },
      /* @__PURE__ */ import_react14.default.createElement("div", { className: "easya-balances-display__currency" }, balance.nonStandard != "" ? balance.nonStandard : balance.currency, balance.issuer && /* @__PURE__ */ import_react14.default.createElement("span", { className: "easya-balances-display__issuer" }, "Issuer: ", balance.issuer), balance.nonStandard != "" && /* @__PURE__ */ import_react14.default.createElement("span", { className: "easya-balances-display__issuer" }, "Hex: ", balance.currency)),
      /* @__PURE__ */ import_react14.default.createElement("div", { className: "easya-balances-display__value" }, balance.value)
    )), balances.length === 0 && /* @__PURE__ */ import_react14.default.createElement("div", { className: "easya-balances-display__empty" }, "No balances available"));
  };
  return /* @__PURE__ */ import_react14.default.createElement("div", { className: `easya-balances-display ${className}` }, /* @__PURE__ */ import_react14.default.createElement("div", { className: "easya-balances-display__content" }, /* @__PURE__ */ import_react14.default.createElement("div", { className: "easya-balances-display__header" }, /* @__PURE__ */ import_react14.default.createElement("h3", { className: "easya-balances-display__title" }, "Available Balances"), /* @__PURE__ */ import_react14.default.createElement(
    "button",
    {
      onClick: fetchBalances,
      disabled: !connectionStatus || connectionStatus !== "Connected" || isLoading,
      className: "easya-balances-display__refresh",
      "aria-label": "Refresh balances"
    },
    "Refresh"
  )), renderBalances()));
};
var BalancesDisplay_default = BalancesDisplay;

// src/components/IssueTokenForm.tsx
var import_react15 = __toESM(require("react"));
var defaultConfig2 = {
  currencyCode: {
    show: true,
    required: true,
    label: "Currency Code:",
    placeholder: "USD, EUR, FOO, etc."
  },
  amount: {
    show: true,
    required: true,
    label: "Amount to Issue:",
    placeholder: "1000000"
  },
  transferRate: {
    show: true,
    required: false,
    label: "Transfer Fee (0-1%):",
    placeholder: "0"
  },
  tickSize: {
    show: true,
    required: false,
    label: "Tick Size (0-15):",
    placeholder: "5"
  },
  domain: {
    show: true,
    required: false,
    label: "Domain:",
    placeholder: "example.com"
  },
  requireDestTag: {
    show: true,
    required: false,
    label: "Require Destination Tags:"
  },
  disallowXRP: {
    show: true,
    required: false,
    label: "Disallow XRP:"
  }
};
var FormField2 = ({ id, type, value, onChange, config, min, max, error }) => {
  if (!config.show)
    return null;
  if (type === "checkbox") {
    return /* @__PURE__ */ import_react15.default.createElement("div", { className: "checkbox-field" }, /* @__PURE__ */ import_react15.default.createElement(
      "input",
      {
        id,
        type: "checkbox",
        checked: value,
        onChange: (e) => onChange(e.target.checked)
      }
    ), /* @__PURE__ */ import_react15.default.createElement("label", { htmlFor: id }, config.label, config.required && /* @__PURE__ */ import_react15.default.createElement("span", { className: "required" }, "*")));
  }
  return /* @__PURE__ */ import_react15.default.createElement("div", { className: `form-field ${error ? "error" : ""}` }, /* @__PURE__ */ import_react15.default.createElement("label", { htmlFor: id }, config.label, config.required && /* @__PURE__ */ import_react15.default.createElement("span", { className: "required" }, "*")), /* @__PURE__ */ import_react15.default.createElement(
    "input",
    {
      id,
      type,
      value: typeof value === "boolean" ? void 0 : String(value),
      onChange: (e) => onChange(e.target.value),
      placeholder: config.placeholder,
      required: config.required,
      min,
      max
    }
  ), error && /* @__PURE__ */ import_react15.default.createElement("div", { className: "error-message" }, error));
};
var IssueTokenForm = () => {
  const {
    connectionStatus,
    transactionStatus,
    values,
    updateValue,
    issueToken: issueToken2
  } = useBlockchain();
  const isConnected = connectionStatus === "Connected";
  const handleChange = (field) => (value) => {
    updateValue(field, value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormValid) {
      await issueToken2();
    }
  };
  const isFormValid = (0, import_react15.useMemo)(() => {
    return Boolean(
      values.currencyCode && values.amount && Number(values.amount) > 0 && Number(values.transferRate) >= 0 && Number(values.transferRate) <= 1 && Number(values.tickSize) >= 0 && Number(values.tickSize) <= 15
    );
  }, [values]);
  return /* @__PURE__ */ import_react15.default.createElement("div", { className: "token-form-container" }, /* @__PURE__ */ import_react15.default.createElement("div", { className: "token-form-inner" }, /* @__PURE__ */ import_react15.default.createElement("h2", { className: "token-form-title" }, "Issue Token"), /* @__PURE__ */ import_react15.default.createElement("div", { className: "token-form-info" }, /* @__PURE__ */ import_react15.default.createElement("p", null, "This form will create tokens from a predefined issuer account, which is different from your current connected wallet.")), /* @__PURE__ */ import_react15.default.createElement("form", { onSubmit: handleSubmit, className: "token-form" }, /* @__PURE__ */ import_react15.default.createElement(
    FormField2,
    {
      id: "currencyCode",
      type: "text",
      value: values.currencyCode,
      onChange: handleChange("currencyCode"),
      config: defaultConfig2.currencyCode
    }
  ), /* @__PURE__ */ import_react15.default.createElement(
    FormField2,
    {
      id: "amount",
      type: "number",
      value: values.amount,
      onChange: handleChange("amount"),
      config: defaultConfig2.amount,
      min: "0"
    }
  ), /* @__PURE__ */ import_react15.default.createElement(
    FormField2,
    {
      id: "transferRate",
      type: "number",
      value: values.transferRate,
      onChange: handleChange("transferRate"),
      config: defaultConfig2.transferRate,
      min: "0",
      max: "1"
    }
  ), /* @__PURE__ */ import_react15.default.createElement(
    FormField2,
    {
      id: "tickSize",
      type: "number",
      value: values.tickSize,
      onChange: handleChange("tickSize"),
      config: defaultConfig2.tickSize,
      min: "0",
      max: "15"
    }
  ), /* @__PURE__ */ import_react15.default.createElement(
    FormField2,
    {
      id: "domain",
      type: "text",
      value: values.domain,
      onChange: handleChange("domain"),
      config: defaultConfig2.domain
    }
  ), /* @__PURE__ */ import_react15.default.createElement(
    FormField2,
    {
      id: "requireDestTag",
      type: "checkbox",
      value: values.requireDestTag,
      onChange: handleChange("requireDestTag"),
      config: defaultConfig2.requireDestTag
    }
  ), /* @__PURE__ */ import_react15.default.createElement(
    FormField2,
    {
      id: "disallowXRP",
      type: "checkbox",
      value: values.disallowXRP,
      onChange: handleChange("disallowXRP"),
      config: defaultConfig2.disallowXRP
    }
  ), /* @__PURE__ */ import_react15.default.createElement(
    "button",
    {
      type: "submit",
      className: `submit-button ${transactionStatus === "Processing" ? "processing" : ""}`,
      disabled: !isConnected || !isFormValid || transactionStatus === "Processing"
    },
    !isConnected ? "Connect Wallet to Issue Token" : !isFormValid ? "Complete Form to Issue Token" : transactionStatus === "Processing" ? "Processing..." : "Issue Token"
  ))));
};
var IssueTokenForm_default = IssueTokenForm;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AddressDisplay,
  BalanceDisplay,
  BalancesDisplay,
  BlockchainProvider,
  ConfigSelector,
  ConnectButton,
  EventDisplay,
  IssueTokenForm,
  MintNFTButton,
  NFTGallery,
  NFTMintingForm,
  NFTTransferForm,
  TransactionForm,
  TransactionStatus,
  TrustLineForm,
  useBlockchain
});
