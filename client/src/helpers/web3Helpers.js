import { providers, Contract, utils, BigNumber, ContractFactory } from "ethers";

let provider = null, signer = null, currentNetwork = null, oldNetwork = null;

if (typeof window.ethereum !== 'undefined') {
    provider = new providers.Web3Provider(window.ethereum, "any");
    
    provider.on("network", (newNetwork, old_Network) => {
        currentNetwork = newNetwork;
        console.log(`new Network: ${JSON.stringify(newNetwork)}`);

        // When a Provider makes its initial connection, it emits a "network"
        // event with a null oldNetwork along with the newNetwork. So, if the
        // oldNetwork exists, it represents a changing network
        if (old_Network) {
            oldNetwork = old_Network;
            console.log(`oldNetwork: ${JSON.stringify(oldNetwork)}`);
            // window.location = '/';
        }
    });

    window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
        //handle user switching accounts here, reload metamask interface or connect to new interface
        console.log(`accounts: ${JSON.stringify(accounts)}`);
    })

    signer = provider.getSigner();
}

const addBinanceNetwork = ()=>{
    window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
        chainId: '0x38',
        chainName: 'Binance Smart Chain',
        nativeCurrency: {
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com']
        }]
    }).catch((error) => {

        console.log(error);

    }) 
}

const walletConnected = async ()=>{
    if(window.ethereum){
        const accounts = await window.ethereum.request({method:'eth_accounts'});
        // let gaslimit = gasNow.add(50000)

        if(accounts.length  > 0){
            return accounts[0];
        }else{
            try {
                const accounts = await window.ethereum.request({method: "eth_requestAccounts"}).finally((rez)=>rez).catch((error)=>error);
                return accounts[0];
            } catch (error) {
                return false;
            }            
        }
    }else{
        return window.location = "https://metamask.app.link/send/pay-https://www.yaadlabs.com?value=1e17";
    }
};

export { walletConnected, signer, currentNetwork, oldNetwork }