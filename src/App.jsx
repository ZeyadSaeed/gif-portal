// import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import React, { useRef } from "react";
import { useEffect, useState } from "react";
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Program, AnchorProvider, web3, BN } from "@project-serum/anchor";
import kp from "./keypair.json";
import RenderConnectedContainer from "./components/RenderConnectedContainer";
import RenderNotConnectedContainer from "./components/RenderNotConnectedContainer";

import { Buffer } from "buffer";
window.Buffer = Buffer;

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

// This is the address of your solana program, if you forgot, just run solana address -k target/deploy/myepicproject-keypair.json
const programID = new PublicKey("CXvBGm96k8U6L1phiTW56gdDzkn4cukXUMmXDQUrGLkv");

// Set our network to devnet.
const network = clusterApiUrl("devnet");

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed",
};

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [gifList, setGifList] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const errorMessageRef = useRef();

  useEffect(() => {
    if (message) {
      const leaveAnimation = () => {
        errorMessageRef.current.style.animation =
          "errorFadeOut 0.5s ease-in-out both";
      };
      const clearErrorMessage = () => {
        errorMessageRef.current.style.animation = "";
        setMessage("");
        setIsError(false);
      };
      setTimeout(leaveAnimation, 4000);
      setTimeout(clearErrorMessage, 4600);
      clearTimeout(leaveAnimation);
      clearTimeout(clearErrorMessage);
    }
  }, [message]);

  const checkIfWalletIsConnected = async () => {
    const { solana } = window;

    if (solana && solana.isPhantom) {
      console.log("Phantom Wallet found!");

      const res = await solana.connect({ onlyIfTrusted: true });

      console.log("Connected Successfully: ", res.publicKey.toString());

      setWalletAddress(res.publicKey.toString());
    } else {
      alert("Solana object not found! Get a phantom Wallet");
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log("Connected with Public Key:", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);

    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    );

    return provider;
  };

  const getProgram = async () => {
    // Get metadata about your solana program
    const idl = await Program.fetchIdl(programID, getProvider());
    // Create a program that you can call
    return new Program(idl, programID, getProvider());
  };

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = await getProgram();

      console.log("ping");

      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        "Created a new BaseAccount w/ address:",
        baseAccount.publicKey.toString()
      );
      await getGifList(true);
    } catch (err) {
      console.log("Error creating BaseAccount account:", err);
    }
  };

  const getGifList = async (loading) => {
    if (loading) setIsLoading(true);
    try {
      const program = await getProgram();
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      setGifList(account.gifList);
    } catch (err) {
      setMessage("Something Went Wrong Can't Load The Images");
      setIsError(true);
      console.log("Error in getGifList: ", err);
      setGifList(null);
    }
    if (loading) setIsLoading(false);
  };

  function validURL(str) {
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(str);
  }

  function imageExists(image_url) {
    var http = new XMLHttpRequest();

    http.open("HEAD", image_url, false);
    http.send();

    return http.status != 404;
  }

  const sendGif = async (e, inputValue, setInputValue) => {
    e.preventDefault();
    if (inputValue.length === 0) {
      setMessage("No gif link given!");
      setIsError(true);
      return;
    }

    const isValidUrl = validURL(inputValue);
    if (!isValidUrl) return;

    const isImageWorking = imageExists(inputValue);

    if (!isImageWorking) return;
    setInputValue("");

    try {
      const provider = getProvider();
      const program = await getProgram();

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });

      setMessage("You Successfully Published Your GIF");
      await getGifList(false);
    } catch (error) {
      setMessage("Error sending GIF");
      setIsError(true);
      console.log("Error sending GIF:", error);
    }
  };

  const addUpvote = async (index, setIsUpvoteLoading) => {
    setIsUpvoteLoading(true);
    try {
      const provider = getProvider();
      const program = await getProgram();

      await program.rpc.updateItem(new BN(index), {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });

      let account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      const votedAddresses = account.gifList[index].votedUsers.map(
        (userAddress) => {
          return userAddress.toString();
        }
      );

      if (votedAddresses.includes(walletAddress)) {
        setMessage("Your Upvote Added Successfuly!");
        setIsError(false);
      } else {
        setMessage("Your Upvote Removed Successfuly!");
        setIsError(false);
      }

      await getGifList(false);
    } catch (err) {
      setMessage("Something Went Wrong Please Try Again");
      setIsError(true);
      console.log("Your upvote didn't count: ", err);
    }
    setIsUpvoteLoading(false);
  };

  const sendTip = async (e, userAddress, amount) => {
    e.preventDefault();
    if (amount >= 0.01) {
      try {
        const provider = getProvider();
        const program = await getProgram();
        await program.rpc.sendSol(new BN(parseInt(amount * LAMPORTS_PER_SOL)), {
          accounts: {
            from: provider.wallet.publicKey,
            to: userAddress,
            systemProgram: SystemProgram.programId,
          },
        });
        setMessage(
          `You Sent ${amount} SOL To ${userAddress
            .toString()
            .slice(0, 3)}...${userAddress
            .toString()
            .slice(-4, -1)} Successfully!`
        );
        setIsError(false);
      } catch (err) {
        console.log("Failed to send: ", err);
        setMessage(
          `Failed To Send ${amount} SOL To ${userAddress
            .toString()
            .slice(0, 3)}...${userAddress.toString().slice(-4, -1)}`
        );
        setIsError(true);
      }
    } else {
      setMessage("Minimum Amount To Tip 0.01SOL");
      setIsError(true);
    }
  };

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      // Call Solana program here.
      getGifList(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  return (
    <div className="App">
      <div className={walletAddress ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress ? (
            <RenderNotConnectedContainer connectWallet={connectWallet} />
          ) : (
            <RenderConnectedContainer
              gifList={gifList}
              createGifAccount={createGifAccount}
              sendGif={sendGif}
              addUpvote={addUpvote}
              walletAddress={walletAddress}
              sendTip={sendTip}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
      {message ? (
        <div className="error-message" ref={errorMessageRef}>
          {isError ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="red"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#00df00"
              stroke="white"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {message}
        </div>
      ) : null}
    </div>
  );
};

export default App;
