import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, {useEffect, useState} from "react";
import myEpicNft from './utils/MyEpicNFT.json';
import { ethers } from 'ethers';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const App = () => {

    const [currentAccount, setCurrentAccount] = useState("");

    const askContractToMintNFT = async () => {
        const CONTRACT_ADDRESS = "0x4F30C35705c5E312576A5c1920C46A00D59A5390";

        try {
            const {ethereum} = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

                console.log("Going to pop wallet now to pay gas...")

                let nftTxn = await connectedContract.makeAnEpicNFT();

                console.log("Mining...please wait.")
                await nftTxn.wait();

                console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}\``);
                connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
                    console.log(from, tokenId.toNumber())
                    alert(`Hey there! We've minted your NFT. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: <https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}>`)
                });
            } else {
                console.log("Ethereum object doesn't exist!");
            }

        } catch (e) {
            console.log(e);
        }
    }


    const checkIfWalletIsConnected = async () => {
        const {ethereum} = window;
        if (!ethereum) {
            console.log("Make sure you have metamask!");
            return;
        } else {
            console.log("We have the ethereum object", ethereum);
        }
        const accounts = await ethereum.request({method: 'eth_accounts'});

        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account:", account);
            setCurrentAccount(account);
        } else {
            console.log("No authorized account found");
        }

        let chainId = await ethereum.request({method: 'eth_chainId'});
        console.log("Connected to chain " + chainId);

        const rinkebyChain = "0x4";
        if (chainId !== rinkebyChain) {
            alert("You are not connected to the Rinkeby Test Network!");
        }
    };

    const connectWallet = async () => {
        try {
            const {ethereum} = window;
            if (!ethereum) {
                alert("Get MetaMask!");
                return;
            }

            const accounts = await ethereum.request({method: "eth_requestAccounts"});

            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (e) {
            console.log(e);
        }
    };


    // Render Methods
    const renderNotConnectedContainer = () => {
        return <button onClick={connectWallet} className="cta-button connect-wallet-button">
            Connect to Wallet
        </button>
    };

    useEffect(() => {
        checkIfWalletIsConnected();
    }, [])

    return (
        <div className="App">
            <div className="container">
                <div className="header-container">
                    <p className="header gradient-text">My NFT Collection</p>
                    <p className="sub-text">
                        Each unique. Each beautiful. Discover your NFT today.
                    </p>
                    {currentAccount === "" ? renderNotConnectedContainer() : (
                        <button onClick={askContractToMintNFT} className="cta-button connect-wallet-button">
                            Mint NFT
                        </button>)}
                </div>
                <div className="footer-container">
                    <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo}/>
                    <a
                        className="footer-text"
                        href={TWITTER_LINK}
                        target="_blank"
                        rel="noreferrer"
                    >{`built on @${TWITTER_HANDLE}`}</a>
                </div>
            </div>
        </div>
    );
};

export default App;
